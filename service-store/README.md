# Skepper Service Store

An e-commerce page that sells Skepper services, with a client portal and a studio board.
Content and structure follow the approved design. The look follows theskepper.com.

React (Vite) in the browser, PHP 8.1+ on the server, MySQL 8 or MariaDB 10.4+ for data.

## See it on this computer

Double-click `start-local.bat`, then open http://127.0.0.1:8099/

It runs its own database in `.local` on port 3399, separate from any other project.

`.local` and `api/config.php` are not in Git. On a fresh copy: run `npm install` and `npm run build`, start any MySQL or
MariaDB server, copy `api/config.sample.php` to `api/config.php` with `env` set to `local` and `demo` to `true`, fill in
the database, run `php scripts/install.php setup`, then `php scripts/install.php staff you@theskepper.com` and
`php scripts/install.php examples`, and start it with `php -S 127.0.0.1:8099 router.php`.

## Preview on Vercel

Vercel cannot run PHP or MySQL. A build there (or `PREVIEW=1 npm run build`) uses `src/preview` instead of the server:
the whole store can be clicked through, but everything stays in the visitor's browser. No order reaches the studio, no
money is taken, no email is sent, and the Studio Board opens without a password because it only shows that browser's data.
Use it to show the design, never to sell. Set the Vercel root directory to `service-store`.
After changing the menu in the database, refresh its copy: `curl http://127.0.0.1:8099/api/catalogue -o src/preview/catalogue.json`

## Put it online

theskepper.com is a Webflow site and Webflow cannot run PHP or MySQL. Host the store on cPanel or any PHP server,
for example as `shop.theskepper.com`, and link to it from the Webflow menu.

1. Create a MySQL database and user in the hosting panel.
2. Run `npm install` and `npm run build`. Upload everything inside `dist` to the web root, including `.htaccess`.
3. On the server, copy `api/config.sample.php` to `api/config.php` and fill in the database, address and email.
   Keep `env` as `production` and `demo` as `false`. Keep `storage` outside the web root.
4. Import `db/schema.sql` and then `db/seed.sql` in phpMyAdmin. If you have a terminal, upload `db` and `scripts` next to
   `api` outside the web root and run `php scripts/install.php`.
5. Create the studio login: `php scripts/install.php staff you@theskepper.com`. It prints the password once.
6. Use HTTPS.

## Razorpay

Add the key, secret and webhook secret in `api/config.php`. In the Razorpay dashboard add the webhook
`https://your-store/api/payments/webhook` for the event `payment.captured`.
Until the keys are in, production refuses paid orders, so nothing is ever marked paid by mistake.

## Where things are

| Change | Where |
| --- | --- |
| Services, prices, options, add-ons | tables `services`, `option_choices`, `service_extras`, `addons` (first load: `db/seed.sql`) |
| Team names on the board | table `team` |
| Pages | `src/components` |
| Look | `src/styles.css` |
| Prices and GST on the server | `api/src/Catalogue.php` |
| Orders and payments | `api/src/Pay.php` |
| Project steps and files | `api/src/Projects.php` |
| Sign-in | `api/src/Auth.php` |

## Still to decide

- GST invoices: orders and payments are stored, but invoice PDFs are not generated yet.
- Monthly plans charge the first month. Automatic renewal needs Razorpay Subscriptions.
