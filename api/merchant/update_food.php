<?php
// public_html/api/merchant/update_food.php

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
if (!$data || empty($data['id']) || empty($data['name'])) {
    send_json(['ok' => false, 'error' => 'Food ID and name are required'], 400);
}

$food_id = $data['id'];
$name = trim($data['name']);
$description = trim($data['description'] ?? '');
$is_veg = isset($data['is_veg']) ? ($data['is_veg'] ? 1 : 0) : 0;
$is_divisible = isset($data['is_divisible']) ? ($data['is_divisible'] ? 1 : 0) : 0;
$extra_piece_price = isset($data['extra_piece_price']) && $data['extra_piece_price'] !== '' ? floatval($data['extra_piece_price']) : null;

try {
    // Verify ownership
    $checkStmt = $pdo->prepare("SELECT id FROM foods WHERE id = ? AND merchant_id = ?");
    $checkStmt->execute([$food_id, $merchant_id]);
    
    if (!$checkStmt->fetch()) {
        send_json(['ok' => false, 'error' => 'Food item not found or access denied'], 404);
    }

    $pdo->beginTransaction();

    // Update food details
    $stmt = $pdo->prepare("
        UPDATE foods 
        SET name = ?, description = ?, is_veg = ?, is_divisible = ?, extra_piece_price = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $description, $is_veg, $is_divisible, $extra_piece_price, $food_id]);

    // Update prices (Delete old, Insert new)
    $pdo->prepare("DELETE FROM food_prices WHERE food_id = ?")->execute([$food_id]);

    if (!empty($data['prices']) && is_array($data['prices'])) {
        $priceStmt = $pdo->prepare("
            INSERT INTO food_prices (food_id, portion_name, price, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        foreach ($data['prices'] as $portion => $price) {
            if ($price === '' || !is_numeric($price)) continue;
            $priceStmt->execute([$food_id, $portion, floatval($price)]);
        }
    }

    $pdo->commit();
    send_json(['ok' => true, 'message' => 'Updated successfully']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("update_food.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
