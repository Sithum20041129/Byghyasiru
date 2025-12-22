<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
require_login(); // ✅ ensures session exists and user is logged in

// --- SELF-HEALING SCHEMA ---
// Ensure 'meal_time' column exists in 'orders' table
try {
    $pdo->query("SELECT meal_time FROM orders LIMIT 1");
} catch (Exception $e) {
    // Column likely missing, add it
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN meal_time VARCHAR(20) DEFAULT NULL AFTER status");
    } catch (Exception $ex) {
        // Ignore if it fails (maybe permission issue or race condition), logic below handles nulls if needed
    }
}
// ---------------------------

$userId = get_logged_user_id();
$userRole = get_logged_user_role();

// ✅ Only customers can place orders
if ($userRole !== 'customer') {
    send_json(["success" => false, "message" => "Unauthorized - only customers can place orders"], 403);
    exit;
}

// ✅ Read request body first to get merchant_id
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['merchant_id'])) {
    send_json(["success" => false, "message" => "Invalid input: merchant_id missing"], 400);
    exit;
}

// ✅ Check Store Availability (Enforce Cut-Off & Daily/Meal Limit)
$merchantId = (int)$data['merchant_id'];
$storeStmt = $pdo->prepare("
    SELECT accepting_orders, active_meal_time, order_limit,
           breakfast_cutoff, lunch_cutoff, dinner_cutoff 
    FROM merchants WHERE id = ?
");
$storeStmt->execute([$merchantId]);
$store = $storeStmt->fetch(PDO::FETCH_ASSOC);

if (!$store) {
    send_json(["success" => false, "message" => "Store not found"], 404);
    exit;
}

// 1. Check Manual Toggle first
if (!$store['accepting_orders']) {
    send_json(["success" => false, "message" => "Store is currently not accepting orders"], 400);
    exit;
}

// 2. Check Automatic Cut-Off
$activeMeal = $store['active_meal_time'] ?: 'Lunch'; // Default to Lunch if empty
$cutoffColumn = strtolower($activeMeal) . '_cutoff'; // e.g. 'lunch_cutoff'

if (isset($store[$cutoffColumn]) && !empty($store[$cutoffColumn])) {
    $cutoffTime = $store[$cutoffColumn];
    $currentTime = date('H:i:s');
    
    if ($currentTime > $cutoffTime) {
        send_json([
            "success" => false, 
            "message" => "Pre-orders for " . $activeMeal . " have closed (Cut-off: " . $cutoffTime . ")"
        ], 400);
        exit;
    }
}

// 3. ✅ Check 'Max Pre-Orders Per Meal' (Reset per meal time)
$limit = (int)$store['order_limit'];

if ($limit > 0) {
    // Count orders for CURRENT merchant + CURRENT date + CURRENT meal time
    // We ignore cancelled orders
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) FROM orders 
        WHERE merchant_id = ? 
        AND DATE(created_at) = CURDATE() 
        AND meal_time = ? 
        AND status != 'cancelled'
    ");
    $countStmt->execute([$merchantId, $activeMeal]);
    $currentOrderCount = $countStmt->fetchColumn();

    if ($currentOrderCount >= $limit) {
        send_json([
            "success" => false,
            "message" => "Pre-orders for " . $activeMeal . " are now full (Limit: " . $limit . ")"
        ], 400);
        exit;
    }
}

// ✅ Validation passed, proceed with logic...
if (
    !$data ||
    !isset($data['merchant_id']) ||
    !isset($data['items']) ||
    !is_array($data['items']) ||
    count($data['items']) === 0
) {
    send_json(["success" => false, "message" => "Invalid input"], 400);
    exit;
}

try {
    $pdo->beginTransaction();

    // Calculate totals
    $mealCount = 0;
    $mealTotal = 0.0;

    foreach ($data['items'] as $item) {
        if (!isset($item['food_id'], $item['quantity'], $item['price'])) {
            throw new Exception("Invalid item data");
        }
        $mealCount += $item['quantity'];
        $mealTotal += $item['quantity'] * $item['price'];
    }

    // Website charge (example: 5% commission, adjust as needed)
    $websiteCharge = round($mealTotal * 0.05, 2);
    $total = $mealTotal + $websiteCharge;

    // Insert into orders (Now including meal_time)
    $stmt = $pdo->prepare("
        INSERT INTO orders (customer_id, merchant_id, meal_count, meal_total, website_charge, total, status, meal_time, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $userId, // ✅ from session
        $data['merchant_id'],
        $mealCount,
        $mealTotal,
        $websiteCharge,
        $total,
        'pending',
        $activeMeal // ✅ Save the meal time of this order
    ]);

    $orderId = $pdo->lastInsertId();

    // Insert items
    $itemStmt = $pdo->prepare("
        INSERT INTO order_items (order_id, food_id, quantity, price)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($data['items'] as $item) {
        $itemStmt->execute([
            $orderId,
            $item['food_id'],
            $item['quantity'],
            $item['price']
        ]);
    }

    $pdo->commit();

    send_json([
        "success" => true,
        "order_id" => $orderId,
        "meal_count" => $mealCount,
        "meal_total" => $mealTotal,
        "website_charge" => $websiteCharge,
        "total" => $total,
        "status" => "pending"
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    send_json([
        "success" => false,
        "message" => "Order creation failed: " . $e->getMessage()
    ], 500);
}
