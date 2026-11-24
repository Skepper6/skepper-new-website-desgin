<?php
declare(strict_types=1);

/** Orders and money. Razorpay when its keys are set; a simulated payment only outside production. */
final class Pay
{
    public static function mode(): string
    {
        if (Config::get('razorpay.key') && Config::get('razorpay.secret')) {
            return 'razorpay';
        }
        return Config::live() ? 'off' : 'simulated';
    }

    public static function placeOrder(): array
    {
        $b = Http::body();
        $items = $b['items'] ?? null;
        if (!is_array($items) || !$items || count($items) > 40) {
            throw new Stop('Your cart is empty.');
        }
        $name = Http::text('name', 120);
        $email = mb_strtolower(Http::text('email', 190));
        $phone = Http::text('phone', 30);
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen(preg_replace('/\D/', '', $phone)) < 10) {
            throw new Stop('Add your name, a valid email and a 10-digit phone number to continue.');
        }
        if (($b['terms'] ?? false) !== true) {
            throw new Stop('Please accept the terms to place the order.');
        }
        $gstin = mb_strtoupper(Http::text('gstin', 20));
        if ($gstin !== '' && !preg_match('/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/', $gstin)) {
            throw new Stop('That GSTIN does not look right. Check it, or leave it empty.');
        }
        $method = in_array($b['method'] ?? '', ['UPI', 'Card', 'Net banking'], true) ? $b['method'] : 'UPI';
        $full = ($b['plan'] ?? '') === 'full';
        Throttle::hit('order:' . Http::ip(), Config::live() ? 15 : 500, 60);

        $lines = array_map(Catalogue::line(...), array_values($items));
        $sub = $total = $due = 0.0;
        foreach ($lines as $l) {
            [$g, $n] = Catalogue::split($l, $full);
            $sub += $l['amount'];
            $total += $g;
            $due += $n;
        }
        $due = round($due, 2);
        if ($due > 0 && self::mode() === 'off') {
            throw new Stop('Online payment is not connected yet. Please write to binu@theskepper.com to place this order.', 503);
        }

        $key = bin2hex(random_bytes(24));
        $order = Db::tx(function () use ($lines, $name, $email, $phone, $gstin, $method, $full, $sub, $total, $due, $key) {
            $u = Auth::user();
            if ($u && $u['role'] === 'client') {
                $uid = (int) $u['id'];
            } else {
                // The order is filed under this email, but the visitor is not signed in to that account.
                Db::run("INSERT INTO users (role, email, name, created_at) VALUES ('client', ?, ?, ?) ON DUPLICATE KEY UPDATE id = id", [$email, $name, now()]);
                $uid = (int) Db::one('SELECT id FROM users WHERE email = ?', [$email])['id'];
            }
            $code = code('ORD', 'orders');
            $id = Db::insert('orders', [
                'code' => $code, 'user_id' => $uid, 'name' => $name, 'company' => Http::text('company', 120), 'email' => $email, 'phone' => $phone,
                'gstin' => $gstin, 'city' => Http::text('city', 80), 'plan' => $full ? 'full' : 'half', 'method' => $method,
                'subtotal' => round($sub, 2), 'gst' => round($total - $sub, 2), 'total' => round($total, 2), 'due_now' => $due,
                'link_hash' => hash('sha256', $key), 'created_at' => now(),
            ]);
            foreach ($lines as $l) {
                Db::insert('order_items', [
                    'order_id' => $id, 'service_id' => $l['service']['id'], 'name' => $l['service']['name'], 'detail' => mb_substr($l['detail'], 0, 500),
                    'unit' => $l['service']['unit'], 'qty' => $l['qty'], 'config' => json_encode($l['config']), 'amount' => $l['amount'],
                    'express' => $l['express'] ? 1 : 0, 'days' => $l['service']['days'],
                ]);
            }
            return ['id' => $id, 'code' => $code];
        });
        Auth::remember($order['id']);
        $_SESSION['links'][$order['id']] = $key;

        if ($due <= 0) {
            return ['status' => 'placed'] + self::finish($order['id'], null);
        }
        return self::charge('order', $order['id'], null, $due, $method, $order['code'], ['name' => $name, 'email' => $email, 'contact' => $phone]);
    }

    public static function payBalance(array $p): array
    {
        $bal = round((float) $p['total'] - (float) $p['paid'], 2);
        if ((int) $p['stage'] !== 5 || $bal <= 1) {
            throw new Stop('There is no balance to pay on this project.');
        }
        if (self::mode() === 'off') {
            throw new Stop('Online payment is not connected yet. Please write to binu@theskepper.com.', 503);
        }
        return self::charge('balance', $p['order_id'] ? (int) $p['order_id'] : null, (int) $p['id'], $bal, '', $p['code'], ['name' => $p['client'], 'email' => $p['email'], 'contact' => $p['phone']]);
    }

    private static function charge(string $kind, ?int $orderId, ?int $projectId, float $amount, string $method, string $receipt, array $who): array
    {
        $row = ['order_id' => $orderId, 'project_id' => $projectId, 'kind' => $kind, 'amount' => $amount, 'method' => $method, 'created_at' => now()];
        if (self::mode() === 'simulated') {
            $id = Db::insert('payments', $row + ['provider' => 'simulated']);
            return ['status' => 'placed'] + self::settle($id, 'simulated');
        }
        $rz = self::razorpay('orders', ['amount' => (int) round($amount * 100), 'currency' => 'INR', 'receipt' => $receipt]);
        Db::insert('payments', $row + ['provider' => 'razorpay', 'provider_order' => $rz['id']]);
        return ['status' => 'pay', 'razorpay' => ['key' => Config::get('razorpay.key'), 'order_id' => $rz['id'], 'amount' => $rz['amount'], 'currency' => 'INR', 'description' => $receipt, 'prefill' => $who]];
    }

    /** The browser reports back after Razorpay. The signature, not the browser, is what we trust. */
    public static function verify(): array
    {
        $o = Http::text('razorpay_order_id', 60);
        $p = Http::text('razorpay_payment_id', 60);
        $sig = Http::text('razorpay_signature', 128);
        $secret = (string) Config::get('razorpay.secret', '');
        if (!$secret || !hash_equals(hash_hmac('sha256', "$o|$p", $secret), $sig)) {
            throw new Stop('The payment could not be confirmed. If money left your account, write to binu@theskepper.com and we will match it.', 400);
        }
        $row = Db::one('SELECT id FROM payments WHERE provider_order = ?', [$o]) ?? throw new Stop('We could not find this payment.', 404);
        return ['status' => 'placed'] + self::settle((int) $row['id'], $p);
    }

    /** Razorpay calls this too, so a closed browser never loses a paid order. */
    public static function webhook(): void
    {
        $raw = file_get_contents('php://input') ?: '';
        $secret = (string) Config::get('razorpay.webhook_secret', '');
        if (!$secret || !hash_equals(hash_hmac('sha256', $raw, $secret), $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '')) {
            throw new Stop('Bad signature.', 400);
        }
        $e = json_decode($raw, true);
        $pay = $e['payload']['payment']['entity'] ?? null;
        if (($e['event'] ?? '') === 'payment.captured' && $pay) {
            $row = Db::one('SELECT id FROM payments WHERE provider_order = ?', [$pay['order_id'] ?? '']);
            if ($row) {
                self::settle((int) $row['id'], (string) $pay['id']);
            }
        }
    }

    /** Marks a payment as received, once. */
    private static function settle(int $paymentId, string $ref): array
    {
        $pay = Db::tx(function () use ($paymentId, $ref) {
            $pay = Db::one('SELECT * FROM payments WHERE id = ? FOR UPDATE', [$paymentId]);
            if ($pay['status'] !== 'paid') {
                Db::run("UPDATE payments SET status = 'paid', provider_ref = ?, paid_at = ? WHERE id = ?", [$ref, now(), $paymentId]);
                if ($pay['kind'] === 'balance') {
                    Db::run('UPDATE projects SET paid = LEAST(total, paid + ?) WHERE id = ?', [$pay['amount'], $pay['project_id']]);
                    Projects::log((int) $pay['project_id'], 'Balance paid');
                }
            }
            return $pay;
        });
        if ($pay['kind'] === 'order') {
            return self::finish((int) $pay['order_id'], $pay);
        }
        $p = Db::one('SELECT * FROM projects WHERE id = ?', [$pay['project_id']]);
        return ['project' => Projects::shape($p, false)];
    }

    /** Opens one project for each thing ordered. Safe to call twice. */
    private static function finish(int $orderId, ?array $payment): array
    {
        [$o, $fresh] = Db::tx(function () use ($orderId) {
            $o = Db::one('SELECT * FROM orders WHERE id = ? FOR UPDATE', [$orderId]);
            if ($o['status'] === 'placed') {
                return [$o, false];
            }
            foreach (Db::all('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [$orderId]) as $it) {
                $line = ['amount' => (float) $it['amount'], 'service' => ['unit' => $it['unit']]];
                [$g, $paid] = Catalogue::split($line, $o['plan'] === 'full');
                $days = $it['express'] ? 3 : ((int) $it['days'] ?: 7);
                $pid = Db::insert('projects', [
                    'code' => code('PRJ', 'projects'), 'order_id' => $orderId, 'order_code' => $o['code'], 'user_id' => $o['user_id'], 'service_id' => $it['service_id'],
                    'name' => $it['name'], 'detail' => $it['detail'], 'client' => $o['name'], 'company' => $o['company'], 'email' => $o['email'], 'phone' => $o['phone'],
                    'total' => $g, 'paid' => $paid, 'monthly' => $it['unit'] === 'month' ? 1 : 0, 'quote' => $it['unit'] === 'quote' ? 1 : 0,
                    'due_at' => date('Y-m-d H:i:s', time() + $days * 86400), 'created_at' => now(),
                ]);
                Projects::log($pid, match ($it['unit']) {
                    'quote' => 'Quote request received',
                    'free' => 'Free assessment booked',
                    default => ($paid >= $g ? 'Paid in full' : '50% advance paid') . ' via ' . $o['method'],
                });
            }
            Db::run("UPDATE orders SET status = 'placed' WHERE id = ?", [$orderId]);
            return [$o, true];
        });
        if ($fresh) {
            $key = $_SESSION['links'][$orderId] ?? null;
            unset($_SESSION['links'][$orderId]);
            $link = rtrim((string) Config::get('url', ''), '/') . '/' . ($key ? "?order={$o['code']}&key=$key" : '') . '#portal';
            $paid = (float) $o['due_now'];
            Mail::send($o['email'], "Your Skepper order {$o['code']}", "Hello {$o['name']},\n\nYour order is brewing. " . ($paid ? rupees($paid) . ' received.' : 'No payment needed.') . "\n\nNext step: share your brief so the studio can start.\n$link\n\nSkepper Creative Agency\nbinu@theskepper.com, +91 8150 00 22 00");
            if ($to = Config::get('mail.studio')) {
                Mail::send($to, "New order {$o['code']}", "{$o['name']}, {$o['company']}\n{$o['email']}, {$o['phone']}\n" . implode("\n", array_column(Db::all('SELECT name FROM order_items WHERE order_id = ?', [$orderId]), 'name')) . "\nReceived now: " . rupees($paid));
            }
        }
        return ['order' => [
            'orderId' => $o['code'], 'paid' => (float) $o['due_now'], 'email' => $o['email'],
            'ids' => array_column(Db::all('SELECT code FROM projects WHERE order_id = ? ORDER BY id', [$orderId]), 'code'),
        ]];
    }

    private static function razorpay(string $path, array $data): array
    {
        $c = curl_init("https://api.razorpay.com/v1/$path");
        curl_setopt_array($c, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 20,
            CURLOPT_USERPWD => Config::get('razorpay.key') . ':' . Config::get('razorpay.secret'),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($data),
        ]);
        $res = curl_exec($c);
        $ok = $res !== false && curl_getinfo($c, CURLINFO_HTTP_CODE) === 200;
        curl_close($c);
        $d = $ok ? json_decode($res, true) : null;
        if (!isset($d['id'])) {
            error_log('Razorpay did not accept the order.');
            throw new Stop('The payment service did not answer. Nothing was charged. Please try again.', 502);
        }
        return $d;
    }
}
