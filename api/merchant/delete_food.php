<?php
// public_html/api/merchant/delete_food.php

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
if (!$data || empty($data['id'])) {
    send_json(['ok' => false, 'error' => 'Food ID is required'], 400);
}

$food_id = $data['id'];

try {
    // Verify ownership before deleting
    $checkStmt = $pdo->prepare("SELECT id FROM foods WHERE id = ? AND merchant_id = ?");
    $checkStmt->execute([$food_id, $merchant_id]);
    
    if (!$checkStmt->fetch()) {
        send_json(['ok' => false, 'error' => 'Food item not found or access denied'], 404);
    }

    // Delete food (prices should cascade delete if set up correctly, otherwise we might need to delete them manually)
    // Assuming ON DELETE CASCADE is set up in DB, or we can delete manually just in case
    
    // Delete prices first (manual cascade)
    $deletePrices = $pdo->prepare("DELETE FROM food_prices WHERE food_id = ?");
    $deletePrices->execute([$food_id]);

    // Delete food
    $deleteFood = $pdo->prepare("DELETE FROM foods WHERE id = ?");
    $deleteFood->execute([$food_id]);

    send_json(['ok' => true, 'message' => 'Deleted successfully']);

} catch (Exception $e) {
    error_log("delete_food.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
