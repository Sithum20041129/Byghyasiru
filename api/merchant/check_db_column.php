<?php
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getPDO();
    $stmt = $pdo->query("SHOW COLUMNS FROM foods LIKE 'is_available'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "Column 'is_available' EXISTS.\n";
        print_r($result);
    } else {
        echo "Column 'is_available' DOES NOT EXIST.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
