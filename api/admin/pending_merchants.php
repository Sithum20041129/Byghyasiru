<?php
// public_html/api/admin/pending_merchants.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
require_admin();

// DEBUG: Log everything
error_log("=== pending_merchants.php called ===");

try {
    $stmt = $pdo->prepare("
        SELECT 
            m.id AS merchant_id,
            m.user_id,
            m.store_name,
            m.store_address,
            m.website_charge,
            m.created_at,
            u.username,
            u.email,
            u.name AS owner_name,
            univ.name AS university_name,
            m.approved AS merchant_approved,
            u.approved AS user_approved
        FROM merchants m
        JOIN users u ON m.user_id = u.id
        LEFT JOIN universities univ ON m.university_id = univ.id
        WHERE m.approved = 0
        ORDER BY m.created_at DESC
    ");
    $stmt->execute();
    $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log("Found " . count($pending) . " pending merchants");

    send_json([
        'ok' => true,
        'pending_merchants' => $pending,
        'debug' => 'Data loaded at ' . date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    error_log("ERROR: " . $e->getMessage());
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}
