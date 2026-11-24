-- Skepper Service Store. MySQL 8 or MariaDB 10.4+.
SET NAMES utf8mb4;

-- ---------- what we sell ----------
CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL,
  blurb       VARCHAR(255) NOT NULL,
  sort        SMALLINT     NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id          VARCHAR(30) PRIMARY KEY,
  category_id VARCHAR(20)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit        ENUM('free','project','from','unit','month','quote') NOT NULL,
  days        SMALLINT     NOT NULL DEFAULT 0,
  description VARCHAR(400) NOT NULL,
  tag         VARCHAR(30)  NULL,
  qty_label   VARCHAR(30)  NULL,
  qty_min     SMALLINT     NULL,
  sort        SMALLINT     NOT NULL DEFAULT 0,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  KEY (category_id, sort),
  CONSTRAINT fk_service_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_includes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id VARCHAR(30)  NOT NULL,
  label      VARCHAR(160) NOT NULL,
  sort       SMALLINT     NOT NULL DEFAULT 0,
  KEY (service_id, sort),
  CONSTRAINT fk_inc_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS option_groups (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id VARCHAR(30) NOT NULL,
  label      VARCHAR(80) NOT NULL,
  sort       SMALLINT    NOT NULL DEFAULT 0,
  KEY (service_id, sort),
  CONSTRAINT fk_group_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS option_choices (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id INT UNSIGNED NOT NULL,
  label    VARCHAR(120) NOT NULL,
  price    DECIMAL(12,2) NOT NULL DEFAULT 0,
  sort     SMALLINT NOT NULL DEFAULT 0,
  KEY (group_id, sort),
  CONSTRAINT fk_choice_group FOREIGN KEY (group_id) REFERENCES option_groups (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_extras (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id VARCHAR(30)  NOT NULL,
  label      VARCHAR(120) NOT NULL,
  price      DECIMAL(12,2) NOT NULL,
  sort       SMALLINT NOT NULL DEFAULT 0,
  KEY (service_id, sort),
  CONSTRAINT fk_extra_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS addons (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL,
  description VARCHAR(160) NOT NULL,
  pct         DECIMAL(5,4)  NULL,
  min_price   DECIMAL(12,2) NULL,
  flat        DECIMAL(12,2) NULL,
  sort        SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team (
  id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(80) NOT NULL UNIQUE,
  sort   SMALLINT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- people ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role          ENUM('client','studio') NOT NULL DEFAULT 'client',
  email         VARCHAR(190) NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NULL,
  created_at    DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_codes (
  user_id    INT UNSIGNED PRIMARY KEY,
  code_hash  VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts   TINYINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_code_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS throttle (
  k        VARCHAR(190) PRIMARY KEY,
  hits     INT NOT NULL,
  reset_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- orders and money ----------
CREATE TABLE IF NOT EXISTS orders (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(20) NOT NULL UNIQUE,
  user_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  company    VARCHAR(120) NOT NULL DEFAULT '',
  email      VARCHAR(190) NOT NULL,
  phone      VARCHAR(30)  NOT NULL,
  gstin      VARCHAR(20)  NOT NULL DEFAULT '',
  city       VARCHAR(80)  NOT NULL DEFAULT '',
  plan       ENUM('half','full') NOT NULL,
  method     VARCHAR(20)  NOT NULL,
  subtotal   DECIMAL(12,2) NOT NULL,
  gst        DECIMAL(12,2) NOT NULL,
  total      DECIMAL(12,2) NOT NULL,
  due_now    DECIMAL(12,2) NOT NULL,
  status     ENUM('pending','placed') NOT NULL DEFAULT 'pending',
  link_hash  CHAR(64) NULL,
  created_at DATETIME NOT NULL,
  KEY (user_id),
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id   INT UNSIGNED NOT NULL,
  service_id VARCHAR(30)  NOT NULL,
  name       VARCHAR(120) NOT NULL,
  detail     VARCHAR(500) NOT NULL DEFAULT '',
  unit       VARCHAR(10)  NOT NULL,
  qty        SMALLINT     NOT NULL DEFAULT 1,
  config     TEXT NOT NULL,
  amount     DECIMAL(12,2) NOT NULL,
  express    TINYINT(1) NOT NULL DEFAULT 0,
  days       SMALLINT NOT NULL DEFAULT 0,
  KEY (order_id),
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- projects ----------
CREATE TABLE IF NOT EXISTS projects (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(20) NOT NULL UNIQUE,
  order_id   INT UNSIGNED NULL,
  order_code VARCHAR(20) NOT NULL,
  user_id    INT UNSIGNED NULL,
  service_id VARCHAR(30)  NOT NULL,
  name       VARCHAR(120) NOT NULL,
  detail     VARCHAR(500) NOT NULL DEFAULT '',
  client     VARCHAR(120) NOT NULL,
  company    VARCHAR(120) NOT NULL DEFAULT '',
  email      VARCHAR(190) NOT NULL,
  phone      VARCHAR(30)  NOT NULL DEFAULT '',
  stage      TINYINT NOT NULL DEFAULT 0,
  round      TINYINT NOT NULL DEFAULT 0,
  resource   VARCHAR(80) NOT NULL DEFAULT 'Unassigned',
  total      DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid       DECIMAL(12,2) NOT NULL DEFAULT 0,
  monthly    TINYINT(1) NOT NULL DEFAULT 0,
  quote      TINYINT(1) NOT NULL DEFAULT 0,
  example    TINYINT(1) NOT NULL DEFAULT 0,
  due_at     DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  KEY (order_id), KEY (user_id), KEY (stage),
  CONSTRAINT fk_project_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id       INT UNSIGNED NULL,
  project_id     INT UNSIGNED NULL,
  kind           ENUM('order','balance') NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  method         VARCHAR(20) NOT NULL DEFAULT '',
  provider       ENUM('simulated','razorpay') NOT NULL,
  provider_order VARCHAR(60) NULL UNIQUE,
  provider_ref   VARCHAR(60) NULL,
  status         ENUM('created','paid') NOT NULL DEFAULT 'created',
  created_at     DATETIME NOT NULL,
  paid_at        DATETIME NULL,
  KEY (order_id), KEY (project_id),
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_pay_project FOREIGN KEY (project_id) REFERENCES projects (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS briefs (
  project_id INT UNSIGNED PRIMARY KEY,
  goal       TEXT NOT NULL,
  audience   VARCHAR(300) NOT NULL DEFAULT '',
  content    TEXT NOT NULL,
  refs       VARCHAR(500) NOT NULL DEFAULT '',
  assets     VARCHAR(60)  NOT NULL DEFAULT '',
  deadline   DATE NULL,
  CONSTRAINT fk_brief_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS files (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  kind       ENUM('brief','draft','final') NOT NULL,
  name       VARCHAR(200) NOT NULL,
  path       VARCHAR(200) NULL,
  round      TINYINT NOT NULL DEFAULT 0,
  status     ENUM('sent','pending','changes','approved','final') NOT NULL,
  created_at DATETIME NOT NULL,
  KEY (project_id),
  CONSTRAINT fk_file_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  sender     ENUM('client','studio') NOT NULL,
  body       TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  KEY (project_id),
  CONSTRAINT fk_msg_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  body       VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  KEY (project_id),
  CONSTRAINT fk_act_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
