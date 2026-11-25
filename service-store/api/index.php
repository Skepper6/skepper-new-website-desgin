<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Kolkata');
ini_set('display_errors', '0');
foreach (['Core', 'Catalogue', 'Auth', 'Pay', 'Projects'] as $f) {
    require __DIR__ . "/src/$f.php";
}

try {
    Config::load(__DIR__ . '/config.php');
    $method = $_SERVER['REQUEST_METHOD'];
    $path = preg_replace('#^.*?/api#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    $path = '/' . trim($path, '/');

    // The store page sits on theskepper.com (Webflow) while this server has its own address.
    // Only the sites listed in config 'origins' may call it with the visitor's cookie.
    $from = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($from !== '' && in_array($from, (array) Config::get('origins', []), true)) {
        header("Access-Control-Allow-Origin: $from");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-Store');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Vary: Origin');
    }
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    // Razorpay’s own call carries its own signature and no cookie.
    if ($method === 'POST' && $path === '/payments/webhook') {
        Pay::webhook();
        Http::json(['ok' => true]);
    }
    // A header that another site cannot send without our permission.
    if ($method !== 'GET' && ($_SERVER['HTTP_X_STORE'] ?? '') !== '1') {
        throw new Stop('This request did not come from the store.', 403);
    }
    Auth::start();

    $routes = [
        ['GET', '/catalogue', fn () => Catalogue::page()],
        ['GET', '/session', fn () => Auth::describe()],
        ['POST', '/auth/code', fn () => Auth::sendCode(mb_strtolower(Http::text('email', 190)))],
        ['POST', '/auth/verify', function () {
            Auth::checkCode(mb_strtolower(Http::text('email', 190)), Http::text('code', 10));
            return Auth::describe();
        }],
        ['POST', '/auth/staff', function () {
            Auth::staff(mb_strtolower(Http::text('email', 190)), (string) (Http::body()['password'] ?? ''));
            return Auth::describe();
        }],
        ['POST', '/auth/link', function () {
            Auth::link(Http::text('order', 20), Http::text('key', 64));
            return Auth::describe();
        }],
        ['POST', '/auth/leave', function () {
            Auth::leave();
            return Auth::describe();
        }],
        ['POST', '/orders', fn () => Pay::placeOrder()],
        ['POST', '/payments/verify', fn () => Pay::verify()],
        ['GET', '/projects', fn () => Projects::mine()],
        ['POST', '/projects/(PRJ-\w+)/brief', fn ($c) => Projects::brief(Projects::find($c, false))],
        ['POST', '/projects/(PRJ-\w+)/approve', fn ($c) => Projects::approve(Projects::find($c, false))],
        ['POST', '/projects/(PRJ-\w+)/changes', fn ($c) => Projects::changes(Projects::find($c, false))],
        ['POST', '/projects/(PRJ-\w+)/balance', fn ($c) => Pay::payBalance(Projects::find($c, false))],
        ['POST', '/projects/(PRJ-\w+)/complete', fn ($c) => Projects::complete(Projects::find($c, false), false)],
        ['POST', '/projects/(PRJ-\w+)/messages', fn ($c) => Projects::message(Projects::find($c, false), false)],
        ['GET', '/studio/projects', fn () => Projects::board()],
        ['POST', '/studio/projects/(PRJ-\w+)/advance', fn ($c) => Projects::advance(Projects::find($c, true))],
        ['POST', '/studio/projects/(PRJ-\w+)/assign', fn ($c) => Projects::assign(Projects::find($c, true))],
        ['POST', '/studio/projects/(PRJ-\w+)/complete', fn ($c) => Projects::complete(Projects::find($c, true), true)],
        ['POST', '/studio/projects/(PRJ-\w+)/messages', fn ($c) => Projects::message(Projects::find($c, true), true)],
        ['POST', '/studio/examples/clear', function () {
            Projects::clearExamples();
            return Projects::board();
        }],
        ['GET', '/files/(\d+)', fn ($id) => Projects::download((int) $id)],
    ];
    foreach ($routes as [$m, $re, $fn]) {
        if ($m === $method && preg_match("#^$re$#", $path, $hit)) {
            Http::json($fn(...array_slice($hit, 1)));
        }
    }
    throw new Stop('Not found.', 404);
} catch (Stop $e) {
    Http::json(['error' => $e->getMessage()], $e->status);
} catch (Throwable $e) {
    error_log($e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
    Http::json(['error' => 'Something went wrong on our side. Please try again in a minute.'], 500);
}
