<?php
// public_html/api/merchant/settings.php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';
$pdo = getPDO();

require_login();
if (get_logged_user_role() !== 'merchant') send_json(['ok' => false, 'error' => 'Access denied'], 403);

$merchant_id = get_logged_merchant_id($pdo);
if (!$merchant_id) send_json(['ok' => false, 'error' => 'Merchant profile not found'], 404);

$data = get_json_input();

$fields = [];
$params = [];

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
if (array_key_exists('free_veg_curries_count', $data)) {
    $fields[] = "free_veg_curries_count = ?";
    $params[] = intval($data['free_veg_curries_count']);
}
if (array_key_exists('veg_curry_price', $data)) {
    $fields[] = "veg_curry_price = ?";
    $params[] = floatval($data['veg_curry_price']);
}

if (count($fields) === 0 && empty($data['portions'])) {
    send_json(['ok' => false, 'error' => 'No fields provided'], 400);
}

try {
    $pdo->beginTransaction();

    if (count($fields) > 0) {
        $sql = "UPDATE merchants SET " . implode(", ", $fields) . " WHERE id = ?";
        $params[] = $merchant_id;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    // Handle portions
    if (isset($data['portions']) && is_array($data['portions'])) {
        $pdo->prepare("DELETE FROM merchant_portions WHERE merchant_id = ?")->execute([$merchant_id]);
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
    // For debugging: return the error in JSON
    send_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
