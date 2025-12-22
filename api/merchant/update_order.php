<?php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();

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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$order_id = $input['order_id'] ?? null;
$status = $input['status'] ?? null;

if (!$order_id || !$status) {
    send_json(['ok' => false, 'error' => 'Missing required fields'], 400);
}

$allowed_statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
if (!in_array($status, $allowed_statuses)) {
    send_json(['ok' => false, 'error' => 'Invalid status'], 400);
}

try {
    // Verify order belongs to merchant
    $stmt = $pdo->prepare("SELECT id FROM orders WHERE id = ? AND merchant_id = ?");
    $stmt->execute([$order_id, $merchant_id]);
    if (!$stmt->fetch()) {
        send_json(['ok' => false, 'error' => 'Order not found or access denied'], 404);
    }

    // Update status
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $order_id]);

    send_json(['ok' => true, 'message' => 'Order status updated']);

} catch (Exception $e) {
    error_log("update_order.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}
