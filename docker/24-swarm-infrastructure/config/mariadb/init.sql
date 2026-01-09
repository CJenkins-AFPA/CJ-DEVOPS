CREATE DATABASE IF NOT EXISTS afpabike_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS uyoopapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'afpabike_user'@'%' IDENTIFIED BY 'ChangeMeAfpabike';
CREATE USER IF NOT EXISTS 'uyoop_user'@'%' IDENTIFIED BY 'ChangeMeUyoop';

GRANT ALL PRIVILEGES ON afpabike_db.* TO 'afpabike_user'@'%';
GRANT ALL PRIVILEGES ON uyoopapp_db.* TO 'uyoop_user'@'%';
FLUSH PRIVILEGES;

-- Init table uyoopApp
USE uyoopapp_db;

CREATE TABLE IF NOT EXISTS specs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    org_name VARCHAR(255),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    project_type VARCHAR(100),
    budget DECIMAL(10,2),
    timeline VARCHAR(255),
    goals TEXT,
    payload JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
