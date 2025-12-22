<?php
require_once __DIR__ . '/../db.php';
$pdo = getPDO();
try {
    $stmt = $pdo->query("DESCRIBE merchants");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
