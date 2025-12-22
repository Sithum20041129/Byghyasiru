<?php
date_default_timezone_set('Asia/Colombo');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../../helpers.php';

// Fix CORS if needed
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$pdo = getPDO();
require_login();

if (get_logged_user_role() !== 'merchant') {
    send_json(['ok' => false, 'error' => 'Access denied'], 403);
}

$merchant_id = get_logged_merchant_id($pdo);
if (!$merchant_id) {
    send_json(['ok' => false, 'error' => 'Merchant profile not found'], 404);
}

$data = get_json_input();

$fields = [];
$params = [];

// --- BUILD UPDATE QUERY ---

if (array_key_exists('is_open', $data)) {
    $fields[] = "is_open = ?";
    $params[] = $data['is_open'] ? 1 : 0;
}
if (array_key_exists('accepting_orders', $data)) {
    $fields[] = "accepting_orders = ?";
    $params[] = $data['accepting_orders'] ? 1 : 0;
}
if (array_key_exists('order_limit', $data)) {
    $fields[] = "order_limit = ?";
    $params[] = $data['order_limit'] !== null ? intval($data['order_limit']) : null;
}
if (array_key_exists('closing_time', $data)) {
    $fields[] = "closing_time = ?";
    $params[] = $data['closing_time'];
}
if (array_key_exists('active_meal_time', $data)) {
    $fields[] = "active_meal_time = ?";
    $params[] = $data['active_meal_time'];
}
// ✅ ADDED BACK: Logic to save these fields
if (array_key_exists('free_veg_curries_count', $data)) {
    $fields[] = "free_veg_curries_count = ?";
    $params[] = intval($data['free_veg_curries_count']);
}
if (array_key_exists('veg_curry_price', $data)) {
    $fields[] = "veg_curry_price = ?";
    $params[] = floatval($data['veg_curry_price']);
}

// ✅ Cut-off times
if (array_key_exists('breakfast_cutoff', $data)) {
    $fields[] = "breakfast_cutoff = ?";
    // Convert empty string to NULL
    $params[] = !empty($data['breakfast_cutoff']) ? $data['breakfast_cutoff'] : null;
}
if (array_key_exists('lunch_cutoff', $data)) {
    $fields[] = "lunch_cutoff = ?";
    $params[] = !empty($data['lunch_cutoff']) ? $data['lunch_cutoff'] : null;
}
if (array_key_exists('dinner_cutoff', $data)) {
    $fields[] = "dinner_cutoff = ?";
    $params[] = !empty($data['dinner_cutoff']) ? $data['dinner_cutoff'] : null;
}

// Check if we have anything to do
if (count($fields) === 0 && empty($data['portions'])) {
    send_json(['ok' => false, 'error' => 'No fields provided'], 400);
}

try {
    $pdo->beginTransaction();

    // 1. Update Merchant Table
    if (count($fields) > 0) {
        $sql = "UPDATE merchants SET " . implode(", ", $fields) . " WHERE id = ?";
        $params[] = $merchant_id;
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $e) {
            // Fallback: Retry without the new columns if they don't exist
            error_log("Settings update failed (likely missing columns), retrying with safe fields. Error: " . $e->getMessage());
            
            // Rebuild fields and params with ONLY safe fields
            $safe_fields = [];
            $safe_params = [];
            
            // Safe fields list
            $safe_keys = ['is_open', 'accepting_orders', 'order_limit', 'closing_time', 'active_meal_time', 'free_veg_curries_count', 'veg_curry_price'];
            
            foreach ($safe_keys as $key) {
                if (array_key_exists($key, $data)) {
                    $safe_fields[] = "$key = ?";
                    $val = $data[$key];
                    // transform specific types as done above
                    if ($key === 'is_open' || $key === 'accepting_orders') $val = $val ? 1 : 0;
                    elseif ($key === 'order_limit') $val = $val !== null ? intval($val) : null;
                    elseif ($key === 'free_veg_curries_count') $val = intval($val);
                    elseif ($key === 'veg_curry_price') $val = floatval($val);
                    
                    $safe_params[] = $val;
                }
            }
            
            if (count($safe_fields) > 0) {
                $fallback_sql = "UPDATE merchants SET " . implode(", ", $safe_fields) . " WHERE id = ?";
                $safe_params[] = $merchant_id;
                $stmt = $pdo->prepare($fallback_sql);
                $stmt->execute($safe_params);
            }
        }
    }

    // 2. Update Portions (if sent)
    if (isset($data['portions']) && is_array($data['portions'])) {
        // Remove old portions
        $pdo->prepare("DELETE FROM merchant_portions WHERE merchant_id = ?")->execute([$merchant_id]);
        
        // Add new portions
        $insert = $pdo->prepare("INSERT INTO merchant_portions (merchant_id, portion_name) VALUES (?, ?)");
        foreach (array_unique(array_map('trim', $data['portions'])) as $p) {
            if ($p) $insert->execute([$merchant_id, $p]);
        }
    }

    $pdo->commit();
    send_json(['ok' => true, 'message' => 'Settings updated']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("settings.php error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}