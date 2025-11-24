<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../db.php';
session_start();

// ✅ Use `order_id` since that's what frontend sends
if (!isset($_GET['order_id'])) {
    echo json_encode(["success" => false, "message" => "Missing order id"]);
    exit;
}

$orderId = intval($_GET['order_id']);

try {
    // ✅ Get DB connection
    $pdo = getPDO();

    // Fetch order details (removed order_number since it doesn’t exist)
    $stmt = $pdo->prepare("
        SELECT o.id, o.total AS total_price, 
               o.created_at, o.status,
               m.store_name, m.store_address,
               u.name AS customer_name, u.email AS customer_email
        FROM orders o
        JOIN merchants m ON o.merchant_id = m.id
        JOIN users u ON o.customer_id = u.id
        WHERE o.id = ?
    ");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        echo json_encode(["success" => false, "message" => "Order not found"]);
        exit;
    }

    // Fetch order items
    $itemStmt = $pdo->prepare("
        SELECT oi.food_id, f.name AS food_name, 
               oi.quantity, oi.price
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id = ?
    ");
    $itemStmt->execute([$orderId]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    // Attach items
    $order['items'] = $items;

    echo json_encode(["success" => true, "order" => $order]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}

