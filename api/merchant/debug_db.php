<?php
// public_html/api/merchant/debug_db.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

echo "<h2>Database Diagnostic (No Login Required)</h2>";

try {
    $pdo = getPDO();
    echo "✅ Database connection successful.<br>";

    // 1. Check Columns (Run this regardless of login)
    echo "<h3>Checking Columns</h3>";
    $columns = ['free_veg_curries_count', 'veg_curry_price'];
    foreach ($columns as $col) {
        $stmt = $pdo->query("SHOW COLUMNS FROM merchants LIKE '$col'");
        if ($stmt->fetch()) {
            echo "✅ Column <code>$col</code> exists.<br>";
        } else {
            echo "❌ Column <code>$col</code> MISSING! Attempting to add...<br>";
            try {
                if ($col === 'free_veg_curries_count') {
                    $pdo->exec("ALTER TABLE merchants ADD COLUMN free_veg_curries_count INT DEFAULT 0");
                } else {
                    $pdo->exec("ALTER TABLE merchants ADD COLUMN veg_curry_price DECIMAL(10,2) DEFAULT 0.00");
                }
                echo "✅ Added <code>$col</code>.<br>";
            } catch (Exception $ex) {
                echo "❌ Failed to add <code>$col</code>: " . $ex->getMessage() . "<br>";
            }
        }
    }

    echo "<h3>Schema Check Complete</h3>";
    echo "If you saw 'Added' messages above, the issue should be fixed.<br>";
    echo "Please go back to the app and try saving settings again.";

} catch (Exception $e) {
    echo "<h1>❌ FATAL ERROR</h1>";
    echo "Error: " . $e->getMessage() . "<br>";
}
