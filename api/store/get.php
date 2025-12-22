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
    // Attempt 1: Fetch ALL columns (including new Veg Pricing & Meal Time)
    try {
        $stmt = $pdo->prepare("
            SELECT m.id, m.store_name, m.store_address, m.website_charge,
                   m.is_open, m.accepting_orders, m.order_limit, m.closing_time,
                   m.free_veg_curries_count, m.veg_curry_price, m.active_meal_time,
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
    } catch (PDOException $e) {
        // Attempt 2: Fallback (If Veg Pricing cols missing, STILL try to get active_meal_time)
        // This fixes the 'Always Lunch' bug
        try {
            $stmt = $pdo->prepare("
                SELECT m.id, m.store_name, m.store_address, m.website_charge,
                       m.is_open, m.accepting_orders, m.order_limit, m.closing_time,
                       m.active_meal_time, -- ✅ fetching this is crucial
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
            
            if ($store) {
                $store['free_veg_curries_count'] = 0;
                $store['veg_curry_price'] = 0;
            }
        } catch (PDOException $e2) {
            // Attempt 3: Absolute Fallback (Only if even active_meal_time is missing)
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
            
            if ($store) {
                $store['free_veg_curries_count'] = 0;
                $store['veg_curry_price'] = 0;
                $store['active_meal_time'] = 'Lunch'; // Only defaults to Lunch in worst case
            }
        }
    }

    if (!$store) {
        send_json(["success" => false, "message" => "Store not found"], 404);
        exit;
    }

    // 🔹 Foods for this store
    try {
        $foodsStmt = $pdo->prepare("
            SELECT f.id, f.name, f.description, f.price, f.available, f.category, f.meal_time, f.food_type, f.is_veg, f.is_divisible, f.extra_piece_price
            FROM foods f
            WHERE f.merchant_id = ? AND f.available = 1
            ORDER BY f.food_type DESC, f.name ASC
        ");
        $foodsStmt->execute([$storeId]);
        $foods = $foodsStmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Fallback: exclude is_divisible
        $foodsStmt = $pdo->prepare("
            SELECT f.id, f.name, f.description, f.price, f.available, f.category, f.meal_time, f.food_type, f.is_veg
            FROM foods f
            WHERE f.merchant_id = ? AND f.available = 1
            ORDER BY f.food_type DESC, f.name ASC
        ");
        $foodsStmt->execute([$storeId]);
        $foods = $foodsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($foods as &$f) {
            $f['is_divisible'] = 0;
        }
    }

    // 🔹 Fetch portion prices
    foreach ($foods as &$food) {
        try {
            $priceStmt = $pdo->prepare("SELECT portion_name, price FROM food_prices WHERE food_id = ?");
            $priceStmt->execute([$food['id']]);
            $portionPrices = $priceStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $food['prices'] = [];
            foreach ($portionPrices as $pp) {
                $food['prices'][$pp['portion_name']] = $pp['price'];
            }
            $food['portion_prices'] = $portionPrices;
        } catch (Exception $ex) {
            $food['portion_prices'] = [];
        }
    }

    // 🔹 Automatic Cut-Off Logic
    // Logic: If Manual Toggle is ON, check Schedule. If Schedule passed, turn OFF.
    // If Manual Toggle is OFF, stay OFF.
    $activeMeal = $store['active_meal_time']; // e.g., 'Lunch'
    $cutoffColumn = strtolower($activeMeal) . '_cutoff'; // e.g., 'lunch_cutoff'
    
    // Check if we have a cutoff time for this meal
    $isCutoffPassed = false;
    if (isset($store[$cutoffColumn]) && !empty($store[$cutoffColumn])) {
        $cutoffTime = $store[$cutoffColumn]; // "14:00:00"
        $currentTime = date('H:i:s');
        if ($currentTime > $cutoffTime) {
            $isCutoffPassed = true;
        }
    }

    $finalAcceptingOrders = (bool)$store['accepting_orders'];
    if ($finalAcceptingOrders && $isCutoffPassed) {
        // If manually ON but time passed -> OFF
        $finalAcceptingOrders = false;
    }

    // 🔹 Store settings
    $settings = [
        "isOpen" => (bool)$store['is_open'],
        "acceptingOrders" => $finalAcceptingOrders, // ✅ Enforced
        "manualAcceptingOrders" => (bool)$store['accepting_orders'], // Original state if needed
        "orderLimit" => (int)$store['order_limit'],
        "closingTime" => $store['closing_time'],
        "freeVegCurries" => (int)($store['free_veg_curries_count'] ?? 0),
        "vegCurryPrice" => (float)($store['veg_curry_price'] ?? 0),
        "activeMealTime" => $store['active_meal_time'] ?? 'Lunch',
        "activeCutoff" => isset($store[$cutoffColumn]) ? $store[$cutoffColumn] : null
    ];

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