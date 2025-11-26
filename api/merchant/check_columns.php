<?php
require_once __DIR__ . '/../../db.php';
$pdo = getPDO();

try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables in database:\n";
    print_r($tables);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
