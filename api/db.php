<?php
// public_html/db.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'u743404292_Mydatabase6');
define('DB_USER', 'u743404292_meal_user6');
define('DB_PASS', 'GhysS1129#ty');

function getPDO() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('DB Error: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
            exit;
        }
    }
    return $pdo;
}