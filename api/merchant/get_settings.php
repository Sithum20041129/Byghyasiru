<?php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
require_login();

if (get_logged_user_role() !== 'merchant') {
    send_json(['ok' => false, 'error' => 'Access denied'], 403);
}

$merchant_id = get_logged_merchant_id($pdo);
if (!$merchant_id) {
    send_json(['ok' => false, 'error' => 'Not found'], 404);
}


// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

date_default_timezone_set('Asia/Colombo');

try {
    // ✅ ADDED BACK: free_veg_curries_count, veg_curry_price
    try {
        $stmt = $pdo->prepare("
            SELECT is_open, accepting_orders, order_limit, closing_time, 
                   active_meal_time, free_veg_curries_count, veg_curry_price,
                   breakfast_cutoff, lunch_cutoff, dinner_cutoff
            FROM merchants WHERE id = ?
        ");
        $stmt->execute([$merchant_id]);
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Fallback for missing columns
        $stmt = $pdo->prepare("
            SELECT is_open, accepting_orders, order_limit, closing_time, 
                   active_meal_time, free_veg_curries_count, veg_curry_price
            FROM merchants WHERE id = ?
        ");
        $stmt->execute([$merchant_id]);
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($settings) {
            $settings['breakfast_cutoff'] = null;
            $settings['lunch_cutoff'] = null;
            $settings['dinner_cutoff'] = null;
        }
    }

    $portionsStmt = $pdo->prepare("SELECT portion_name FROM merchant_portions WHERE merchant_id = ? ORDER BY portion_name");
    $portionsStmt->execute([$merchant_id]);
    $portions = $portionsStmt->fetchAll(PDO::FETCH_COLUMN);

    // 🔹 Calculate Effective Status (Logic from api/store/get.php)
    $activeMeal = $settings['active_meal_time'] ?? 'Lunch';
    $cutoffColumn = strtolower($activeMeal) . '_cutoff';
    
    $isCutoffPassed = false;
    $autoCutoffTime = null;

    if (isset($settings[$cutoffColumn]) && !empty($settings[$cutoffColumn])) {
        $autoCutoffTime = $settings[$cutoffColumn];
        $currentTime = date('H:i:s');
        if ($currentTime > $autoCutoffTime) {
            $isCutoffPassed = true;
        }
    }

    $manualAcceptingOrders = (bool)$settings['accepting_orders'];
    $effectivelyOpen = $manualAcceptingOrders;
    
    if ($manualAcceptingOrders && $isCutoffPassed) {
        $effectivelyOpen = false;
    }

    send_json([
        'ok' => true,
        'debug' => [
            'merchant_id' => $merchant_id,
            'user_id' => $_SESSION['user_id'] ?? null
        ],
        'is_open' => (int)$settings['is_open'],
        'accepting_orders' => (int)$settings['accepting_orders'], // Manual toggle state
        'effectively_accepting' => $effectivelyOpen, // REAL state
        'auto_disabled' => $isCutoffPassed, // Why it's disabled
        'server_time' => date('H:i:s'), // Debugging
        'active_meal_cutoff' => $autoCutoffTime,
        'order_limit' => $settings['order_limit'] ? (int)$settings['order_limit'] : null,
        'closing_time' => $settings['closing_time'] ?? '22:00',
        'active_meal_time' => $settings['active_meal_time'] ?? 'Lunch',
        // ✅ Sending these to frontend now
        'free_veg_curries_count' => (int)($settings['free_veg_curries_count'] ?? 0),
        'veg_curry_price' => (float)($settings['veg_curry_price'] ?? 0),
        'breakfast_cutoff' => $settings['breakfast_cutoff'] ?? null,
        'lunch_cutoff' => $settings['lunch_cutoff'] ?? null,
        'dinner_cutoff' => $settings['dinner_cutoff'] ?? null,
        'portions' => $portions
    ]);

} catch (Exception $e) {
    error_log("get_settings.php: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}