<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';
$pdo = getPDO();

// ✅ Get storeId
$storeId = null;
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $storeId = (int) $_GET['id'];
} else {
    $uriParts = explode("/", trim($_SERVER['REQUEST_URI'], "/"));
    $lastPart = end($uriParts);
    if (is_numeric($lastPart)) {
        $storeId = (int) $lastPart;
    }
}

if (!$storeId) {
    send_json(["success" => false, "message" => "Missing or invalid store id"], 400);
    exit;
}

try {
    // 🔹 Store info
    $stmt = $pdo->prepare("
        SELECT m.id, m.store_name, m.store_address, m.website_charge,
               m.is_open, m.accepting_orders, m.order_limit, m.closing_time,
               m.university_id, un.name AS university_name,
               u.username AS owner_username, u.name AS owner_name, u.email AS owner_email
        FROM merchants m
        JOIN users u ON m.user_id = u.id
        LEFT JOIN universities un ON m.university_id = un.id
        WHERE m.id = ? AND m.approved = 1
        LIMIT 1
    ");
    $stmt->execute([$storeId]);
    $store = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$store) {
        send_json(["success" => false, "message" => "Store not found"], 404);
        exit;
    }

    // 🔹 Foods for this store
    $foodsStmt = $pdo->prepare("
        SELECT f.id, f.name, f.description, f.price, f.available, f.category, f.meal_time
        FROM foods f
        WHERE f.merchant_id = ? AND f.available = 1
        ORDER BY f.category, f.name ASC
    ");
    $foodsStmt->execute([$storeId]);
    $foods = $foodsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 Store settings
    $settings = [
        "isOpen" => (bool)$store['is_open'],
        "acceptingOrders" => (bool)$store['accepting_orders'],
        "orderLimit" => (int)$store['order_limit'],
        "closingTime" => $store['closing_time']
    ];

    // 🔹 Final response
    send_json([
        "success" => true,
        "store" => [
            "id" => $store['id'],
            "storeName" => $store['store_name'],
            "storeAddress" => $store['store_address'],
            "universityId" => $store['university_id'],
            "universityName" => $store['university_name'],
            "ownerName" => $store['owner_name'],
            "ownerEmail" => $store['owner_email']
        ],
        "foods" => $foods,
        "settings" => $settings
    ]);

} catch (Exception $e) {
    send_json(["success" => false, "message" => $e->getMessage()], 500);
}