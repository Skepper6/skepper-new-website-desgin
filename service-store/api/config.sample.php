<?php
// Copy to config.php and fill in. config.php is never committed.
return [
    // local: sign-in codes are shown on screen. production: simulated payments are switched off.
    'env' => 'production',
    // true shows the example projects and lets drafts be shared without a file. Keep false on the live site.
    'demo' => false,
    // Address of the store, used in emails.
    'url' => 'https://shop.theskepper.com',
    'db' => ['host' => 'localhost', 'port' => 3306, 'name' => 'skepper_store', 'user' => '', 'pass' => ''],
    // Uploaded files. Keep this folder outside public_html.
    'storage' => dirname(__DIR__, 2) . '/skepper-storage',
    'razorpay' => ['key' => '', 'secret' => '', 'webhook_secret' => ''],
    'mail' => ['enabled' => true, 'from' => 'binu@theskepper.com', 'studio' => 'binu@theskepper.com'],
];
