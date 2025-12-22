<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$pdo = getPDO();

echo "Running migration...<br>";

try {
    $columns = [
        'breakfast_cutoff' => 'TIME DEFAULT NULL',
        'lunch_cutoff' => 'TIME DEFAULT NULL',
        'dinner_cutoff' => 'TIME DEFAULT NULL'
    ];

    foreach ($columns as $col => $def) {
        try {
            // Check if column exists
            $check = $pdo->query("SHOW COLUMNS FROM merchants LIKE '$col'");
            if ($check->rowCount() == 0) {
                // Add column
                $pdo->exec("ALTER TABLE merchants ADD COLUMN $col $def");
                echo "Added column: $col<br>";
            } else {
                echo "Column already exists: $col<br>";
            }
        } catch (Exception $e) {
            echo "Error adding $col: " . $e->getMessage() . "<br>";
        }
    }
    echo "Migration completed.";
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage();
}
