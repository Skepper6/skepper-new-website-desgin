<?php
declare(strict_types=1);

/** An error that is safe to show to the visitor. */
final class Stop extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 400)
    {
        parent::__construct($message);
    }
}

final class Config
{
    private static array $c = [];

    public static function load(string $file): void
    {
        if (!is_file($file)) {
            throw new RuntimeException('Copy api/config.sample.php to api/config.php and fill it in.');
        }
        self::$c = require $file;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $v = self::$c;
        foreach (explode('.', $key) as $k) {
            if (!is_array($v) || !array_key_exists($k, $v)) {
                return $default;
            }
            $v = $v[$k];
        }
        return $v;
    }

    public static function live(): bool
    {
        return self::get('env') === 'production';
    }
}

final class Db
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (!self::$pdo) {
            $d = Config::get('db');
            self::$pdo = new PDO(
                "mysql:host={$d['host']};port={$d['port']};dbname={$d['name']};charset=utf8mb4",
                $d['user'],
                $d['pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false],
            );
            self::$pdo->exec("SET time_zone = '+05:30'");
        }
        return self::$pdo;
    }

    public static function run(string $sql, array $args = []): PDOStatement
    {
        $s = self::pdo()->prepare($sql);
        $s->execute($args);
        return $s;
    }

    public static function all(string $sql, array $args = []): array
    {
        return self::run($sql, $args)->fetchAll();
    }

    public static function one(string $sql, array $args = []): ?array
    {
        return self::run($sql, $args)->fetch() ?: null;
    }

    public static function insert(string $table, array $row): int
    {
        $cols = array_keys($row);
        self::run(
            "INSERT INTO $table (" . implode(', ', $cols) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')',
            array_values($row),
        );
        return (int) self::pdo()->lastInsertId();
    }

    public static function tx(callable $fn): mixed
    {
        $p = self::pdo();
        $p->beginTransaction();
        try {
            $r = $fn();
            $p->commit();
            return $r;
        } catch (Throwable $e) {
            $p->rollBack();
            throw $e;
        }
    }
}

final class Http
{
    private static ?array $body = null;

    public static function body(): array
    {
        if (self::$body === null) {
            $type = $_SERVER['CONTENT_TYPE'] ?? '';
            if (str_starts_with($type, 'application/json')) {
                $d = json_decode(file_get_contents('php://input') ?: '', true);
                self::$body = is_array($d) ? $d : [];
            } else {
                self::$body = $_POST;
            }
        }
        return self::$body;
    }

    public static function text(string $key, int $max = 255): string
    {
        $v = self::body()[$key] ?? '';
        return is_string($v) ? mb_substr(trim($v), 0, $max) : '';
    }

    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }

    public static function ip(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}

/** Counts attempts so codes, passwords and orders cannot be hammered. */
final class Throttle
{
    public static function hit(string $key, int $max, int $minutes): void
    {
        $key = substr($key, 0, 190);
        Db::run(
            'INSERT INTO throttle (k, hits, reset_at) VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE hits = IF(reset_at < NOW(), 1, hits + 1), reset_at = IF(reset_at < NOW(), VALUES(reset_at), reset_at)',
            [$key, date('Y-m-d H:i:s', time() + $minutes * 60)],
        );
        if ((int) Db::one('SELECT hits FROM throttle WHERE k = ?', [$key])['hits'] > $max) {
            throw new Stop('Too many attempts. Please wait a few minutes and try again.', 429);
        }
    }

    public static function clear(string $key): void
    {
        Db::run('DELETE FROM throttle WHERE k = ?', [substr($key, 0, 190)]);
    }
}

final class Mail
{
    public static function send(string $to, string $subject, string $text): void
    {
        $from = (string) Config::get('mail.from', '');
        if (Config::get('mail.enabled') && $from) {
            $headers = "From: Skepper <$from>\r\nReply-To: $from\r\nContent-Type: text/plain; charset=utf-8\r\nMIME-Version: 1.0";
            if (!mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $text, $headers)) {
                error_log("Mail to a customer could not be sent: $subject");
            }
            return;
        }
        if (!Config::live()) {
            $dir = (string) Config::get('storage');
            @mkdir($dir, 0770, true);
            file_put_contents("$dir/mail.log", date('c') . "\nTo: $to\nSubject: $subject\n\n$text\n----\n", FILE_APPEND | LOCK_EX);
        }
    }
}

function now(): string
{
    return date('Y-m-d H:i:s');
}

function iso(string $sql): string
{
    return date('c', strtotime($sql));
}

function rupees(float $n): string
{
    $n = (string) (int) round($n);
    if (strlen($n) <= 3) {
        return '₹' . $n;
    }
    return '₹' . preg_replace('/\B(?=(\d{2})+$)/', ',', substr($n, 0, -3)) . ',' . substr($n, -3);
}

function code(string $prefix, string $table): string
{
    $abc = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    do {
        $c = $prefix . '-';
        for ($i = 0; $i < 6; $i++) {
            $c .= $abc[random_int(0, strlen($abc) - 1)];
        }
    } while (Db::one("SELECT 1 FROM $table WHERE code = ?", [$c]));
    return $c;
}
