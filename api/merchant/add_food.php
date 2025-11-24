<?php
// public_html/api/merchant/add_food.php
// FIXED: No require_merchant() → 500 error

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
if (!$data || empty($data['meal_time']) || empty($data['food_type']) || empty($data['name'])) {
    send_json(['ok' => false, 'error' => 'Meal time, category, and name are required'], 400);
}

$meal_time = trim($data['meal_time']);
$food_type = trim($data['food_type']);
$name = trim($data['name']);
$description = trim($data['description'] ?? '');
$is_veg = !empty($data['is_veg']) ? 1 : 0;
$is_divisible = !empty($data['is_divisible']) ? 1 : 0;
$extra_piece_price = isset($data['extra_piece_price']) && $data['extra_piece_price'] !== '' ? floatval($data['extra_piece_price']) : null;

$available = 1;
$created_at = date('Y-m-d H:i:s');

try {
    $stmt = $pdo->prepare("
        INSERT INTO foods
        (merchant_id, meal_time, food_type, name, description, is_veg, is_divisible, extra_piece_price, available, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $merchant_id, $meal_time, $food_type, $name, $description,
        $is_veg, $is_divisible, $extra_piece_price, $available, $created_at
    ]);

    $food_id = $pdo->lastInsertId();

    // === SAVE PORTION PRICES ===
    if (!empty($data['prices']) && is_array($data['prices'])) {
        $priceStmt = $pdo->prepare("
            INSERT INTO food_prices (food_id, portion_name, price, created_at)
            VALUES (?, ?, ?, ?)
        ");
        foreach ($data['prices'] as $portion => $price) {
            if ($price === '' || !is_numeric($price)) continue;
            $priceStmt->execute([$food_id, $portion, floatval($price), $created_at]);
        }
    }

    // === RETURN NEW FOOD ===
    $select = $pdo->prepare("SELECT * FROM foods WHERE id = ?");
    $select->execute([$food_id]);
    $newFood = $select->fetch(PDO::FETCH_ASSOC);

    send_json(['ok' => true, 'food' => $newFood]);

} catch (Exception $e) {
    error_log("add_food.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}