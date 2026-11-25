-- Web Applications category and the extra website platforms. Safe to run more than once. Prices are Skepper's starting prices: edit them here or in the tables.
UPDATE categories SET sort = sort + 1 WHERE id IN ('digital','pharma','pods','event') AND sort <= 8 AND NOT EXISTS (SELECT 1 FROM (SELECT id FROM categories WHERE id = 'webapp') x);
INSERT IGNORE INTO categories (id, name, blurb, sort) VALUES
('webapp','Web Applications','Portals, dashboards, booking systems, CRMs and software built around your business, in Laravel, PHP, React or Angular.',5);
UPDATE categories SET name = 'Web Applications', blurb = 'Portals, dashboards, booking systems, CRMs and software built around your business, in Laravel, PHP, React or Angular.' WHERE id = 'webapp';
DELETE FROM services WHERE id IN ('laravel','php','react','angular');
INSERT INTO services (id, category_id, name, price, unit, days, description, tag, qty_label, qty_min, sort) VALUES
('webapp','webapp','Custom Web Application',300000,'from',60,'A web application designed and built around how your business works, from prototype to launch.','Popular',NULL,NULL,59),
('portal','webapp','Client Portal / Dashboard',150000,'from',35,'Secure sign-in, role-based screens, files, reports and live status for your clients or team.',NULL,NULL,NULL,60),
('booking','webapp','Booking & Appointment System',125000,'from',30,'Online booking with calendar, reminders, payments and an admin view.',NULL,NULL,NULL,61),
('crm','webapp','CRM / Lead Management Tool',200000,'from',45,'Capture leads, assign them, track follow-ups and see the pipeline in one place.',NULL,NULL,NULL,62),
('adminpanel','webapp','Admin Panel & Internal Tools',150000,'from',30,'Replace spreadsheets with a fast admin panel for orders, stock, staff or content.',NULL,NULL,NULL,63),
('saas','webapp','SaaS Product (MVP)',500000,'from',90,'Your product idea as a working, billable first version, with sign-up, plans and an admin back office.','Best value',NULL,NULL,64),
('apiint','webapp','API & Third-Party Integration',40000,'project',10,'Connect your site or app to payments, WhatsApp, CRM, ERP, maps or any other service.',NULL,NULL,NULL,65),
('mobileapp','webapp','Mobile App (Android & iOS)',400000,'from',75,'One app for Android and iOS, designed, built and published to both stores.',NULL,NULL,NULL,66),
('appcare','webapp','Web App Maintenance & Support',15000,'month',30,'Bug fixes, security patches, backups, monitoring and small changes every month.',NULL,NULL,NULL,67)
ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), unit = VALUES(unit), days = VALUES(days), description = VALUES(description), tag = VALUES(tag), sort = VALUES(sort);
DELETE FROM service_includes WHERE service_id IN ('webapp','portal','booking','crm','adminpanel','saas','apiint','mobileapp','appcare','laravel','php','react','angular');
INSERT INTO service_includes (service_id, label, sort) VALUES
('webapp','Discovery call and scope document',0),
('webapp','UI design and clickable prototype',1),
('webapp','Build, testing and deployment',2),
('webapp','Handover and training',3),
('portal','Secure sign-in and user roles',0),
('portal','Dashboard, files and reports',1),
('portal','Email notifications',2),
('portal','Deployment and handover',3),
('booking','Calendar and slot management',0),
('booking','Online payment and reminders',1),
('booking','Admin view for your team',2),
('booking','Deployment and handover',3),
('crm','Lead capture forms and import',0),
('crm','Pipeline, follow-ups and reminders',1),
('crm','Reports and exports',2),
('crm','Deployment and handover',3),
('adminpanel','Dashboards and data tables',0),
('adminpanel','Roles and permissions',1),
('adminpanel','Import and export',2),
('adminpanel','Deployment and handover',3),
('saas','Sign-up, plans and billing',0),
('saas','Core product features',1),
('saas','Admin back office',2),
('saas','Launch support',3),
('apiint','Integration plan and keys setup',0),
('apiint','Build and error handling',1),
('apiint','Testing in a safe environment',2),
('apiint','Documentation',3),
('mobileapp','UI design for both platforms',0),
('mobileapp','Build for Android and iOS',1),
('mobileapp','Store listing and publishing',2),
('mobileapp','Handover',3),
('appcare','Security and framework updates',0),
('appcare','Daily backups and monitoring',1),
('appcare','Up to 8 hours of changes',2),
('appcare','Priority support',3);
-- Technology choice. Laravel and PHP are the base; React and Angular cost more.
INSERT IGNORE INTO option_groups (id, service_id, label, sort) VALUES
(90,'webapp','Technology',0),(91,'portal','Technology',0),(92,'crm','Technology',0),(93,'adminpanel','Technology',0),(94,'saas','Technology',0),(95,'booking','Technology',0),
(96,'ecom','Platform',0);
DELETE FROM option_choices WHERE group_id BETWEEN 90 AND 95 AND label IN ('React front-end with API', 'Angular front-end with API');
INSERT INTO option_choices (group_id, label, price, sort)
SELECT g.id, v.label, v.price, v.sort FROM (SELECT 90 id UNION ALL SELECT 91 UNION ALL SELECT 92 UNION ALL SELECT 93 UNION ALL SELECT 94 UNION ALL SELECT 95) g
JOIN (
  SELECT 'Laravel (PHP framework)' AS label, 0 AS price, 0 AS sort UNION ALL
  SELECT 'PHP and MySQL', 0, 1 UNION ALL
  SELECT 'React with PHP and MySQL', 25000, 2 UNION ALL
  SELECT 'React with Node.js and SQL', 30000, 3 UNION ALL
  SELECT 'React with Node.js and MongoDB', 30000, 4 UNION ALL
  SELECT 'Angular with PHP and MySQL', 35000, 5 UNION ALL
  SELECT 'Angular with Node.js and SQL', 40000, 6 UNION ALL
  SELECT 'Angular with Node.js and MongoDB', 40000, 7
) v
WHERE NOT EXISTS (SELECT 1 FROM option_choices c WHERE c.group_id = g.id AND c.label = v.label);
INSERT INTO option_choices (group_id, label, price, sort)
SELECT 96, v.label, v.price, v.sort FROM (
  SELECT 'WooCommerce (WordPress)' AS label, 0 AS price, 0 AS sort UNION ALL
  SELECT 'Shopify', 25000, 1 UNION ALL
  SELECT 'Webflow Ecommerce', 25000, 2 UNION ALL
  SELECT 'Custom Laravel store', 60000, 3 UNION ALL
  SELECT 'Custom React store with API', 75000, 4
) v
WHERE NOT EXISTS (SELECT 1 FROM option_choices c WHERE c.group_id = 96 AND c.label = v.label);
UPDATE option_choices SET sort = CASE label WHEN 'Angular with PHP and MySQL' THEN 5 WHEN 'Angular with Node.js and SQL' THEN 6 WHEN 'Angular with Node.js and MongoDB' THEN 7 WHEN 'React with Node.js and MongoDB' THEN 4 ELSE sort END WHERE group_id BETWEEN 90 AND 95;
-- Platform choices for the Business Website, at the same extra cost as "Custom coded".
INSERT INTO option_choices (group_id, label, price, sort)
SELECT 7, v.label, 30000, v.sort FROM (
  SELECT 'Laravel (PHP framework)' AS label, 3 AS sort UNION ALL
  SELECT 'PHP and MySQL', 4 UNION ALL
  SELECT 'React', 5 UNION ALL
  SELECT 'Angular', 6
) v WHERE NOT EXISTS (SELECT 1 FROM option_choices c WHERE c.group_id = 7 AND c.label = v.label);
