<?php
require_once __DIR__ . '/../db.php';
$pdo = getPDO();

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS food_prices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            food_id INT NOT NULL,
            portion_name VARCHAR(50) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
        )
    ");
    echo "Table 'food_prices' created successfully (or already existed).";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
