<?php
require_once __DIR__ . '/../../db.php';
$pdo = getPDO();

try {
    $stmt = $pdo->query("DESCRIBE merchants");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Columns in merchants table:\n";
    print_r($columns);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
