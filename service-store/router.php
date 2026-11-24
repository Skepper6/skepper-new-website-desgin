<?php
// Local preview only: php -S localhost:8099 router.php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/api/index.php';
    return true;
}
$file = realpath(__DIR__ . '/dist' . ($path === '/' ? '/index.html' : $path));
$root = realpath(__DIR__ . '/dist');
if (!$file || !$root || !str_starts_with($file, $root) || !is_file($file)) {
    http_response_code(404);
    echo 'Not found. Run npm run build first.';
    return true;
}
$types = ['html' => 'text/html; charset=utf-8', 'js' => 'text/javascript', 'css' => 'text/css', 'svg' => 'image/svg+xml', 'png' => 'image/png', 'woff2' => 'font/woff2', 'webp' => 'image/webp'];
header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
readfile($file);
