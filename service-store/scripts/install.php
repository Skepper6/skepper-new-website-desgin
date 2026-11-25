<?php
/**
 * Sets up the database. Run once:   php scripts/install.php
 * Studio login:                     php scripts/install.php staff you@theskepper.com
 * Load the example projects:        php scripts/install.php examples
 */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    exit(1);
}
date_default_timezone_set('Asia/Kolkata');
require __DIR__ . '/../api/src/Core.php';
Config::load(__DIR__ . '/../api/config.php');

function runFile(string $file): void
{
    $sql = preg_replace('/^\s*--.*$/m', '', file_get_contents($file));
    foreach (preg_split('/;\s*\n/', $sql) as $s) {
        if (trim($s) !== '') {
            Db::pdo()->exec($s);
        }
    }
}

$what = $argv[1] ?? 'setup';
if ($what === 'setup') {
    $d = Config::get('db');
    $root = new PDO("mysql:host={$d['host']};port={$d['port']}", $d['user'], $d['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    try {
        $root->exec("CREATE DATABASE IF NOT EXISTS `{$d['name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    } catch (PDOException) {
        echo "Using the existing database {$d['name']}.\n"; // shared hosting creates it in the panel
    }
    runFile(__DIR__ . '/../db/schema.sql');
    if (Db::one('SELECT 1 FROM services LIMIT 1')) {
        echo "The menu is already loaded.\n";
    } else {
        runFile(__DIR__ . '/../db/seed.sql');
    }
    runFile(__DIR__ . '/../db/add-webapps.sql');
    echo 'Ready. Services: ' . Db::one('SELECT COUNT(*) n FROM services')['n'] . "\n";
} elseif ($what === 'staff') {
    $email = strtolower($argv[2] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        exit("Give an email: php scripts/install.php staff you@theskepper.com\n");
    }
    $pass = getenv('STAFF_PASSWORD') ?: rtrim(strtr(base64_encode(random_bytes(12)), '+/', 'xy'), '=');
    Db::run(
        "INSERT INTO users (role, email, name, password_hash, created_at) VALUES ('studio', ?, 'Studio', ?, ?) ON DUPLICATE KEY UPDATE role = 'studio', password_hash = VALUES(password_hash)",
        [$email, password_hash($pass, PASSWORD_DEFAULT), now()],
    );
    echo "Studio login: $email\nPassword:     $pass\n";
} elseif ($what === 'examples') {
    runFile(__DIR__ . '/../db/examples.sql');
    echo "Example projects loaded.\n";
}
