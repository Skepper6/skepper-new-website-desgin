<?php
declare(strict_types=1);

/**
 * Three ways in.
 *  - A visitor who has just ordered can open that order in the same browser, nothing else.
 *  - A client signs in with a code sent to their email and sees every order placed with it.
 *  - The studio signs in with a password.
 */
final class Auth
{
    public static function start(): void
    {
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
        session_name('skstore');
        session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 14, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax', 'secure' => $https]);
        ini_set('session.gc_maxlifetime', (string) (60 * 60 * 24 * 14));
        ini_set('session.use_strict_mode', '1');
        session_start();
    }

    public static function user(): ?array
    {
        $id = $_SESSION['uid'] ?? null;
        return $id ? Db::one('SELECT id, role, email, name FROM users WHERE id = ?', [$id]) : null;
    }

    public static function describe(): array
    {
        $u = self::user();
        return ['user' => $u ? ['role' => $u['role'], 'email' => $u['email'], 'name' => $u['name']] : null, 'orders' => count($_SESSION['orders'] ?? [])];
    }

    public static function isStudio(): bool
    {
        return (self::user()['role'] ?? '') === 'studio';
    }

    public static function needStudio(): void
    {
        if (!self::isStudio()) {
            throw new Stop('Please sign in to the Studio Board.', 401);
        }
    }

    public static function remember(int $orderId): void
    {
        $_SESSION['orders'] = array_values(array_unique([...($_SESSION['orders'] ?? []), $orderId]));
    }

    public static function owns(array $project): bool
    {
        $u = self::user();
        return ($u && $u['role'] === 'client' && (int) $project['user_id'] === (int) $u['id'])
            || ($project['order_id'] && in_array((int) $project['order_id'], $_SESSION['orders'] ?? [], true))
            || ($project['example'] && Config::get('demo', false));
    }

    private static function enter(int $uid): void
    {
        session_regenerate_id(true);
        $_SESSION['uid'] = $uid;
    }

    public static function sendCode(string $email): array
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Stop('Enter a valid email address.');
        }
        Throttle::hit('code:' . Http::ip(), 20, 15);
        Throttle::hit("code:$email", 5, 15);
        $out = ['sent' => true];
        $u = Db::one("SELECT id FROM users WHERE email = ? AND role = 'client'", [$email]);
        // The answer is the same whether or not we know the address.
        if ($u) {
            $code = (string) random_int(100000, 999999);
            Db::run(
                'REPLACE INTO login_codes (user_id, code_hash, expires_at, attempts) VALUES (?, ?, ?, 0)',
                [$u['id'], password_hash($code, PASSWORD_DEFAULT), date('Y-m-d H:i:s', time() + 900)],
            );
            Mail::send($email, "Your Skepper code is $code", "Use $code to open My Projects. It works for 15 minutes.\n\nIf you did not ask for this, you can ignore this email.\n\nSkepper Creative Agency");
            if (Config::get('env') === 'local') {
                $out['devCode'] = $code;
            }
        }
        return $out;
    }

    public static function checkCode(string $email, string $code): void
    {
        Throttle::hit('verify:' . Http::ip(), 30, 15);
        $wrong = new Stop('That code is not right, or it has expired. Ask for a new one.', 401);
        $r = Db::one("SELECT c.*, u.id AS uid FROM login_codes c JOIN users u ON u.id = c.user_id WHERE u.email = ? AND u.role = 'client'", [$email]);
        if (!$r || strtotime($r['expires_at']) < time() || $r['attempts'] >= 5) {
            throw $wrong;
        }
        Db::run('UPDATE login_codes SET attempts = attempts + 1 WHERE user_id = ?', [$r['uid']]);
        if (!password_verify($code, $r['code_hash'])) {
            throw $wrong;
        }
        Db::run('DELETE FROM login_codes WHERE user_id = ?', [$r['uid']]);
        self::enter((int) $r['uid']);
    }

    public static function staff(string $email, string $password): void
    {
        $k = 'staff:' . Http::ip();
        Throttle::hit($k, 10, 15);
        Throttle::hit("staff:$email", 10, 15);
        $u = Db::one("SELECT id, password_hash FROM users WHERE email = ? AND role = 'studio'", [$email]);
        // Always run a check, so a wrong email takes as long as a wrong password.
        $ok = password_verify($password, $u['password_hash'] ?? '$2y$10$JB7wf5lMwO4ndHR31OcnNujVbufwCWbGC2MR0WBbCZy2MYWVCnV.W');
        if (!$u || !$ok) {
            throw new Stop('The email or password is not right.', 401);
        }
        Throttle::clear($k);
        Throttle::clear("staff:$email");
        self::enter((int) $u['id']);
    }

    /** The link in the order email opens that one order. */
    public static function link(string $order, string $key): void
    {
        Throttle::hit('link:' . Http::ip(), 30, 15);
        $o = Db::one("SELECT id, link_hash FROM orders WHERE code = ? AND status = 'placed'", [$order]);
        if (!$o || !$o['link_hash'] || !hash_equals($o['link_hash'], hash('sha256', $key))) {
            throw new Stop('This link is not valid. Sign in with your email instead.', 401);
        }
        self::remember((int) $o['id']);
    }

    public static function leave(): void
    {
        $_SESSION = [];
        session_regenerate_id(true);
    }
}
