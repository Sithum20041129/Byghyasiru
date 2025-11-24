<?php
// public_html/api/admin/merchants.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
require_admin();

try {
    $stmt = $pdo->prepare("
        SELECT 
            m.id, m.store_name, m.store_address, m.website_charge, m.approved,
            u.username, u.email, u.name AS owner_name,
            univ.name AS university_name
        FROM merchants m
        JOIN users u ON m.user_id = u.id
        LEFT JOIN universities univ ON m.university_id = univ.id
        ORDER BY m.created_at DESC
    ");
    $stmt->execute();
    $merchants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    send_json(['ok' => true, 'merchants' => $merchants]);
} catch (Exception $e) {
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}