<?php
// public_html/api/orders/list.php
// Fixed: 500 error from require_login() + session issues

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();

// === SAFE SESSION START ===
if (session_status() === PHP_SESSION_NONE) {
    session_name('quickmeal_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ]);
    if (!session_start()) {
        send_json(['ok' => false, 'error' => 'Failed to start session'], 500);
    }
}

// === CHECK LOGIN ===
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
    send_json(['ok' => false, 'error' => 'Unauthorized'], 401);
}

$userId = $_SESSION['user_id'];
$userRole = $_SESSION['user_role'];

// Block unapproved merchants
if ($userRole === 'merchant' && empty($_SESSION['merchant_id'])) {
    send_json(['ok' => false, 'error' => 'Merchant not approved'], 403);
}

try {
    $sql = "";
    $params = [];

    if ($userRole === 'admin') {
        $sql = "
            SELECT 
                o.id, o.customer_id, o.merchant_id, o.status, o.total, o.created_at,
                u.username AS customer_name, u.email AS customer_email,
                m.store_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            JOIN merchants m ON o.merchant_id = m.id
            ORDER BY o.created_at DESC
        ";

    } elseif ($userRole === 'merchant') {
        $merchantId = $_SESSION['merchant_id'];
        $sql = "
            SELECT 
                o.id, o.customer_id, o.merchant_id, o.status, o.total, o.created_at,
                u.username AS customer_name, u.email AS customer_email
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.merchant_id = ?
            ORDER BY o.created_at DESC
        ";
        $params = [$merchantId];

    } elseif ($userRole === 'customer') {
        $sql = "
            SELECT 
                o.id, o.customer_id, o.merchant_id, o.status, o.total, o.created_at,
                m.store_name
            FROM orders o
            JOIN merchants m ON o.merchant_id = m.id
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
        ";
        $params = [$userId];

    } else {
        send_json(['ok' => false, 'error' => 'Invalid role'], 403);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format
    foreach ($orders as &$order) {
        $order['created_at'] = date('Y-m-d H:i', strtotime($order['created_at']));
        $order['total'] = number_format((float)$order['total'], 2);
    }

    send_json(['ok' => true, 'orders' => $orders]);

} catch (Exception $e) {
    error_log("Orders API error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}