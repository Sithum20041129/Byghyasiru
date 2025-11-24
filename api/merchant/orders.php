<?php
// public_html/api/merchant/orders.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();

// Safe session
if (session_status() === PHP_SESSION_NONE) {
    session_name('quickmeal_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ]);
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'merchant') {
    send_json(['ok' => false, 'error' => 'Unauthorized'], 401);
}

$merchant_id = $_SESSION['merchant_id'] ?? null;
if (!$merchant_id) {
    send_json(['ok' => false, 'error' => 'Merchant not found'], 404);
}

try {
    // Pending
    $stmt = $pdo->prepare("
        SELECT o.*, u.name AS customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.merchant_id = ? AND o.status = 'pending'
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$merchant_id]);
    $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Active
    $stmt = $pdo->prepare("
        SELECT o.*, u.name AS customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.merchant_id = ? AND o.status IN ('preparing', 'ready')
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$merchant_id]);
    $active = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Today
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE merchant_id = ? AND status = 'completed' 
        AND DATE(created_at) = CURDATE()
    ");
    $stmt->execute([$merchant_id]);
    $today = $stmt->fetchColumn();

    // This month
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE merchant_id = ? AND status = 'completed' 
        AND YEAR(created_at) = YEAR(CURDATE()) 
        AND MONTH(created_at) = MONTH(CURDATE())
    ");
    $stmt->execute([$merchant_id]);
    $month = $stmt->fetchColumn();

    send_json([
        'ok' => true,
        'pending' => $pending,
        'active' => $active,
        'completedToday' => (int)$today,
        'completedThisMonth' => (int)$month
    ]);

} catch (Exception $e) {
    error_log("orders.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}