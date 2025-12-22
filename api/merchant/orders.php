<?php
// public_html/api/merchant/orders.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();

// Safe session start
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

/**
 * Helper to fetch and attach items to a list of orders
 */
function attachItemsToOrders($pdo, $orders) {
    if (empty($orders)) return [];

    // Get all order IDs
    $orderIds = array_column($orders, 'id');
    
    // Check if 'portion' column exists to avoid errors if DB isn't updated yet
    $hasPortion = false;
    try {
        $check = $pdo->query("SHOW COLUMNS FROM order_items LIKE 'portion'");
        $hasPortion = $check->fetch() !== false;
    } catch (Exception $e) {}

    $portionCol = $hasPortion ? ", oi.portion" : "";

    // Prepare placeholders
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));

    // Fetch all items for these orders
    $sql = "
        SELECT oi.order_id, oi.quantity, oi.price, oi.food_id $portionCol,
               f.name AS food_name, f.food_type, f.is_veg
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id IN ($placeholders)
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($orderIds);
    $all_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group items by order_id
    $items_by_order = [];
    foreach ($all_items as $item) {
        $items_by_order[$item['order_id']][] = $item;
    }

    // Attach to original orders
    foreach ($orders as &$order) {
        $order['items'] = $items_by_order[$order['id']] ?? [];
    }

    return $orders;
}

try {
    // 1. Fetch Pending Orders
    $stmt = $pdo->prepare("
        SELECT o.*, u.name AS customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.merchant_id = ? AND o.status = 'pending'
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$merchant_id]);
    $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $pending = attachItemsToOrders($pdo, $pending);

    // 2. Fetch Active Orders (Preparing/Ready)
    $stmt = $pdo->prepare("
        SELECT o.*, u.name AS customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.merchant_id = ? AND o.status IN ('preparing', 'ready')
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$merchant_id]);
    $active = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $active = attachItemsToOrders($pdo, $active);

    // 3. Stats (Today)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE merchant_id = ? AND status = 'completed' 
        AND DATE(created_at) = CURDATE()
    ");
    $stmt->execute([$merchant_id]);
    $today = $stmt->fetchColumn();

    // 4. Stats (Month)
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