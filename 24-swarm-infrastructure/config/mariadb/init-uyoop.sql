-- Script d'init table uyoopApp (migration SQLite → MariaDB)
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
