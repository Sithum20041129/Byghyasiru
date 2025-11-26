<?php
// public_html/api/merchant/update_food_availability.php
ini_set('display_errors', 0);
error_reporting(E_ALL);

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
    session_start();
}

// === CHECK LOGIN & ROLE ===
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
    send_json(['ok' => false, 'error' => 'Unauthorized'], 401);
}

if ($_SESSION['user_role'] !== 'merchant') {
    send_json(['ok' => false, 'error' => 'Merchant access only'], 403);
}

if (empty($_SESSION['merchant_id'])) {
    send_json(['ok' => false, 'error' => 'Merchant profile not found'], 404);
}

$merchant_id = $_SESSION['merchant_id'];
$data = get_json_input();

// === VALIDATE INPUT ===
if (!$data || empty($data['id']) || !isset($data['is_available'])) {
    send_json(['ok' => false, 'error' => 'Food ID and availability status are required'], 400);
}

$food_id = $data['id'];
$is_available = $data['is_available'] ? 1 : 0;

try {
    // Verify ownership
    $checkStmt = $pdo->prepare("SELECT id FROM foods WHERE id = ? AND merchant_id = ?");
    $checkStmt->execute([$food_id, $merchant_id]);
    
    if (!$checkStmt->fetch()) {
        send_json(['ok' => false, 'error' => 'Food item not found or access denied'], 404);
    }

    // Update availability
    $stmt = $pdo->prepare("UPDATE foods SET is_available = ? WHERE id = ?");
    $stmt->execute([$is_available, $food_id]);

    send_json(['ok' => true, 'message' => 'Availability updated successfully']);

} catch (Exception $e) {
    error_log("update_food_availability.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}
