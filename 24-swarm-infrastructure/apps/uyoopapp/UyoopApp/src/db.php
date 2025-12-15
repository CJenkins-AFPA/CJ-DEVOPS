<?php
// Minimal PDO MySQL connection helper

declare(strict_types=1);

function db_connect(): PDO {
    $dbHost = getenv('DB_HOST') ?: 'db.local';
    $dbName = getenv('DB_NAME') ?: 'uyoopapp_db';
    $dbUser = getenv('DB_USER') ?: 'uyoop_user';
    $dbPass = getenv('DB_PASSWORD') ?: 'ChangeMeUyoop';

    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";

    return new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
