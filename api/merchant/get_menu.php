<?php
// public_html/api/merchant/get_menu.php

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

try {
    $stmt = $pdo->prepare("
        SELECT * FROM foods 
        WHERE merchant_id = ? 
        ORDER BY meal_time ASC, food_type ASC, id DESC
    ");
    $stmt->execute([$merchant_id]);
    $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($foods as &$food) {
        $priceStmt = $pdo->prepare("SELECT portion_name, price FROM food_prices WHERE food_id = ?");
        $priceStmt->execute([$food['id']]);
        $portionPrices = $priceStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $food['prices'] = [];
        foreach ($portionPrices as $pp) {
            $food['prices'][$pp['portion_name']] = $pp['price'];
        }
        $food['portion_prices'] = $portionPrices;
    }

    send_json(['ok' => true, 'foods' => $foods]);

} catch (Exception $e) {
    error_log("get_menu.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}
