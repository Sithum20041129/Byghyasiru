<?php
// public_html/api/merchant/add_portion.php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';
$pdo = getPDO();

require_login();
if (get_logged_user_role() !== 'merchant') send_json(['ok' => false, 'error' => 'Access denied'], 403);

$merchant_id = get_logged_merchant_id($pdo);
$data = get_json_input();
$name = trim($data['name'] ?? '');

if ($name === '') send_json(['ok' => false, 'error' => 'Portion name required'], 400);

try {
    $stmt = $pdo->prepare("INSERT INTO portion_categories (merchant_id, name) VALUES (?, ?)");
    $stmt->execute([$merchant_id, $name]);
    send_json(['ok' => true, 'message' => 'Portion category added']);
} catch (Exception $e) {
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}
