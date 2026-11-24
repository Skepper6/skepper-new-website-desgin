<?php
declare(strict_types=1);

/** From brief to final files. Each step checks that it is allowed from where the project stands. */
final class Projects
{
    private const TYPES = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ai', 'eps', 'psd', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'mp4', 'mov', 'mp3', 'wav', 'ttf', 'otf'];
    private const MAX = 50 * 1024 * 1024;

    public static function log(int $id, string $text): void
    {
        Db::insert('activity', ['project_id' => $id, 'body' => mb_substr($text, 0, 255), 'created_at' => now()]);
    }

    public static function find(string $code, bool $studio): array
    {
        $p = Db::one('SELECT * FROM projects WHERE code = ?', [$code]);
        if ($studio) {
            Auth::needStudio();
        }
        if (!$p || (!$studio && !Auth::owns($p))) {
            throw new Stop('We could not find this project. Sign in with the email you ordered with.', 404);
        }
        return $p;
    }

    /** The projects this visitor may see. */
    public static function mine(): array
    {
        $u = Auth::user();
        $where = ['0'];
        $args = [];
        if ($u && $u['role'] === 'client') {
            $where[] = 'user_id = ?';
            $args[] = $u['id'];
        }
        if ($o = $_SESSION['orders'] ?? []) {
            $where[] = 'order_id IN (' . implode(',', array_map('intval', $o)) . ')';
        }
        $list = Db::all('SELECT * FROM projects WHERE ' . implode(' OR ', $where) . ' ORDER BY id DESC', $args);
        if (Config::get('demo', false)) {
            $list = [...$list, ...Db::all('SELECT * FROM projects WHERE example = 1 ORDER BY id')];
        }
        return array_map(fn ($p) => self::shape($p, false), $list);
    }

    public static function board(): array
    {
        Auth::needStudio();
        return array_map(fn ($p) => self::shape($p, true), Db::all('SELECT * FROM projects ORDER BY example, id DESC'));
    }

    public static function shape(array $p, bool $studio): array
    {
        $id = (int) $p['id'];
        $b = Db::one('SELECT * FROM briefs WHERE project_id = ?', [$id]);
        $files = Db::all('SELECT * FROM files WHERE project_id = ? ORDER BY id', [$id]);
        return [
            'id' => $p['code'], 'orderId' => $p['order_code'], 'sid' => $p['service_id'], 'name' => $p['name'], 'detail' => $p['detail'],
            'client' => $p['client'], 'company' => $p['company'], 'email' => $p['email'], 'created' => iso($p['created_at']), 'due' => iso($p['due_at']),
            'stage' => (int) $p['stage'], 'round' => (int) $p['round'], 'resource' => $p['resource'], 'total' => (float) $p['total'], 'paid' => (float) $p['paid'],
            'monthly' => (bool) $p['monthly'], 'quote' => (bool) $p['quote'], 'example' => (bool) $p['example'],
            'brief' => $b ? [
                'goal' => $b['goal'], 'audience' => $b['audience'], 'content' => $b['content'], 'refs' => $b['refs'], 'assets' => $b['assets'], 'date' => $b['deadline'] ?? '',
                'files' => array_values(array_map(fn ($f) => ['id' => (int) $f['id'], 'name' => $f['name']], array_filter($files, fn ($f) => $f['kind'] === 'brief'))),
            ] : null,
            'files' => array_values(array_map(
                fn ($f) => ['id' => (int) $f['id'], 'name' => $f['name'], 'round' => (int) $f['round'], 'status' => $f['status'], 'final' => $f['kind'] === 'final', 'stored' => (bool) $f['path']],
                array_filter($files, fn ($f) => $f['kind'] !== 'brief'),
            )),
            'messages' => array_map(fn ($m) => ['from' => $m['sender'], 'text' => $m['body'], 't' => iso($m['created_at'])], Db::all('SELECT * FROM messages WHERE project_id = ? ORDER BY id', [$id])),
            'log' => array_map(fn ($l) => [iso($l['created_at']), $l['body']], Db::all('SELECT * FROM activity WHERE project_id = ? ORDER BY id', [$id])),
        ];
    }

    private static function fresh(int $id, bool $studio): array
    {
        return self::shape(Db::one('SELECT * FROM projects WHERE id = ?', [$id]), $studio);
    }

    private static function set(int $id, array $cols): void
    {
        Db::run('UPDATE projects SET ' . implode(', ', array_map(fn ($c) => "$c = ?", array_keys($cols))) . ' WHERE id = ?', [...array_values($cols), $id]);
    }

    private static function pending(int $id): ?array
    {
        return Db::one("SELECT * FROM files WHERE project_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1", [$id]);
    }

    /* ---------- client ---------- */

    public static function brief(array $p): array
    {
        if ((int) $p['stage'] !== 0) {
            throw new Stop('The brief for this project is already in.');
        }
        $goal = Http::text('goal', 4000);
        if ($goal === '') {
            throw new Stop('Tell us what the work should achieve so we can start.');
        }
        $date = Http::text('date', 10);
        $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) && strtotime($date) ? $date : null;
        if ($date && $date < date('Y-m-d')) {
            throw new Stop('The deadline is in the past. Pick a later date.');
        }
        $up = self::uploads('files', 10);
        Db::tx(function () use ($p, $goal, $date, $up) {
            $id = (int) $p['id'];
            $assets = Http::text('assets', 60);
            Db::insert('briefs', [
                'project_id' => $id, 'goal' => $goal, 'audience' => Http::text('audience', 300), 'content' => Http::text('content', 8000), 'refs' => Http::text('refs', 500),
                'assets' => in_array($assets, ['Have logo & guidelines', 'Have logo only', 'Starting fresh'], true) ? $assets : 'Starting fresh', 'deadline' => $date,
            ]);
            foreach ($up as [$name, $path]) {
                Db::insert('files', ['project_id' => $id, 'kind' => 'brief', 'name' => $name, 'path' => $path, 'status' => 'sent', 'created_at' => now()]);
            }
            self::set($id, ['stage' => 1] + ($date ? ['due_at' => "$date 23:59:59"] : []));
            self::log($id, $p['quote'] ? 'Event details shared, discovery call to be scheduled' : 'Brief submitted');
        });
        return self::fresh((int) $p['id'], false);
    }

    public static function approve(array $p): array
    {
        $id = (int) $p['id'];
        Db::tx(function () use ($id) {
            $f = self::pending($id) ?? throw new Stop('There is no draft waiting for your review.');
            Db::run("UPDATE files SET status = 'approved' WHERE id = ?", [$f['id']]);
            self::set($id, ['stage' => 5]);
            self::log($id, 'Draft approved by client');
        });
        return self::fresh($id, false);
    }

    public static function changes(array $p): array
    {
        $id = (int) $p['id'];
        $txt = Http::text('text', 4000);
        if ($txt === '') {
            throw new Stop('Please list the corrections before sending');
        }
        Db::tx(function () use ($id, $p, $txt) {
            $f = self::pending($id) ?? throw new Stop('There is no draft waiting for your review.');
            $round = (int) $p['round'] + 1;
            Db::run("UPDATE files SET status = 'changes' WHERE id = ?", [$f['id']]);
            self::set($id, ['round' => $round, 'stage' => 4]);
            Db::insert('messages', ['project_id' => $id, 'sender' => 'client', 'body' => "Corrections: $txt", 'created_at' => now()]);
            self::log($id, "Corrections requested (round $round of " . Catalogue::ROUNDS . ')' . ($round > Catalogue::ROUNDS ? ', extra round to be costed' : ''));
        });
        return self::fresh($id, false);
    }

    public static function complete(array $p, bool $studio): array
    {
        $id = (int) $p['id'];
        if ((int) $p['stage'] !== 5 || (float) $p['total'] - (float) $p['paid'] > 1) {
            throw new Stop('Final files are released once the work is approved and the balance is paid.');
        }
        $up = $studio ? self::uploads('file', 1) : [];
        Db::tx(function () use ($p, $id, $up) {
            // The final files the studio uploaded, or else the draft that was approved.
            $last = $up ? ['path' => $up[0][1], 'name' => $up[0][0]] : Db::one("SELECT path, name FROM files WHERE project_id = ? AND status = 'approved' ORDER BY id DESC LIMIT 1", [$id]);
            $ext = !empty($last['path']) ? pathinfo($last['path'], PATHINFO_EXTENSION) : 'zip';
            Db::insert('files', ['project_id' => $id, 'kind' => 'final', 'name' => self::fileName($p, 'Final', $ext), 'path' => $last['path'] ?? null, 'round' => $p['round'], 'status' => 'final', 'created_at' => now()]);
            self::set($id, ['stage' => 6]);
            self::log($id, 'Final files delivered, project closed');
        });
        return self::fresh($id, $studio);
    }

    public static function message(array $p, bool $studio): array
    {
        $txt = Http::text('text', 4000);
        if ($txt === '') {
            throw new Stop('Write a message first.');
        }
        Throttle::hit('msg:' . $p['id'] . ':' . session_id(), 60, 10);
        Db::insert('messages', ['project_id' => $p['id'], 'sender' => $studio ? 'studio' : 'client', 'body' => $txt, 'created_at' => now()]);
        return self::fresh((int) $p['id'], $studio);
    }

    /* ---------- studio ---------- */

    public static function assign(array $p): array
    {
        $who = Http::text('resource', 80);
        if (!in_array($who, Catalogue::team(), true)) {
            throw new Stop('That person is not on the team list.');
        }
        self::set((int) $p['id'], ['resource' => $who]);
        self::log((int) $p['id'], "Assigned to $who");
        return self::fresh((int) $p['id'], true);
    }

    public static function advance(array $p): array
    {
        $id = (int) $p['id'];
        $stage = (int) $p['stage'];
        $draft = $stage === 2 || ($stage === 4 && !self::pending($id));
        if (!($stage === 0 && $p['quote']) && $stage !== 1 && !$draft) {
            throw new Stop('This project is waiting for the client.');
        }
        $up = $draft ? self::uploads('file', 1) : [];
        if ($draft && !$up && !Config::get('demo', false)) {
            throw new Stop('Choose the draft file to share.');
        }
        Db::tx(function () use ($p, $id, $stage, $up) {
            if ($stage === 0) {
                self::set($id, ['stage' => 1]);
                self::log($id, 'Discovery call done, proposal sent');
            } elseif ($stage === 1) {
                self::set($id, ['stage' => 2]);
                self::log($id, "Production started ({$p['resource']})");
            } else {
                $n = 1 + (int) Db::one("SELECT COUNT(*) AS n FROM files WHERE project_id = ? AND kind = 'draft'", [$id])['n'];
                $ext = $up ? pathinfo($up[0][1], PATHINFO_EXTENSION) : 'pdf';
                Db::insert('files', ['project_id' => $id, 'kind' => 'draft', 'name' => self::fileName($p, "D$n", $ext), 'path' => $up[0][1] ?? null, 'round' => $p['round'], 'status' => 'pending', 'created_at' => now()]);
                if ($stage === 2) {
                    self::set($id, ['stage' => 3]);
                    self::log($id, 'First cut shared for review');
                } else {
                    self::log($id, "Draft $n shared for review");
                }
            }
        });
        if ($draft && !$p['example']) {
            Mail::send($p['email'], "A draft of {$p['name']} is ready", "Hello {$p['client']},\n\nA draft is ready for your review in My Projects.\n" . rtrim((string) Config::get('url', ''), '/') . "/#portal\n\nSkepper Creative Agency");
        }
        return self::fresh($id, true);
    }

    public static function clearExamples(): void
    {
        Auth::needStudio();
        Db::run('DELETE FROM payments WHERE project_id IN (SELECT id FROM projects WHERE example = 1)');
        Db::run('DELETE FROM projects WHERE example = 1');
    }

    /* ---------- files ---------- */

    /** MMYYYY_Company_Service_SCA_D1.pdf, the studio’s own naming. */
    private static function fileName(array $p, string $what, string $ext): string
    {
        $clean = fn ($s) => preg_replace('/[^A-Za-z0-9]+/', '', $s);
        return date('mY') . '_' . $clean($p['company'] ?: $p['client']) . '_' . $clean($p['name']) . "_SCA_$what.$ext";
    }

    /** Saves uploads under random names in a folder the web server does not serve. */
    private static function uploads(string $field, int $max): array
    {
        $f = $_FILES[$field] ?? null;
        if (!$f) {
            return [];
        }
        $names = (array) $f['name'];
        $out = [];
        foreach ($names as $i => $name) {
            $err = ((array) $f['error'])[$i];
            if ($err === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            $size = ((array) $f['size'])[$i];
            if ($err !== UPLOAD_ERR_OK || $size > self::MAX) {
                throw new Stop("$name could not be uploaded. Keep each file under 50 MB.");
            }
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, self::TYPES, true)) {
                throw new Stop("$name is a type of file we cannot take. Put it in a zip and try again.");
            }
            if (count($out) >= $max) {
                throw new Stop("Attach up to $max files.");
            }
            $dir = Config::get('storage') . '/files';
            if (!is_dir($dir) && !mkdir($dir, 0770, true)) {
                throw new RuntimeException('The storage folder cannot be written to.');
            }
            $path = bin2hex(random_bytes(16)) . ".$ext";
            if (!move_uploaded_file(((array) $f['tmp_name'])[$i], "$dir/$path")) {
                throw new RuntimeException('An upload could not be saved.');
            }
            $out[] = [mb_substr(preg_replace('/[\x00-\x1f"\\\\\/]+/u', '', $name), 0, 200), $path];
        }
        return $out;
    }

    public static function download(int $fileId): never
    {
        $f = Db::one('SELECT f.*, p.user_id, p.order_id, p.example, p.total, p.paid FROM files f JOIN projects p ON p.id = f.project_id WHERE f.id = ?', [$fileId]);
        if (!$f || (!Auth::isStudio() && !Auth::owns($f))) {
            throw new Stop('We could not find this file.', 404);
        }
        $full = Config::get('storage') . '/files/' . basename((string) $f['path']);
        if (!$f['path'] || !is_file($full)) {
            throw new Stop('This file has not been uploaded yet.', 404);
        }
        header('Content-Type: application/octet-stream');
        header('X-Content-Type-Options: nosniff');
        header('Content-Length: ' . filesize($full));
        header("Content-Disposition: attachment; filename*=UTF-8''" . rawurlencode($f['name']));
        header('Cache-Control: private, no-store');
        readfile($full);
        exit;
    }
}
