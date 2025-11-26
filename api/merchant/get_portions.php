<?php
// public_html/api/merchant/get_portions.php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';
$pdo = getPDO();

require_login();
if (get_logged_user_role() !== 'merchant') send_json(['ok' => false, 'error' => 'Access denied'], 403);

$merchant_id = get_logged_merchant_id($pdo);

try {
    $stmt = $pdo->prepare("SELECT id, portion_name as name FROM merchant_portions WHERE merchant_id = ? ORDER BY id ASC");
    $stmt->execute([$merchant_id]);
    $portions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    send_json(['ok' => true, 'portions' => $portions]);
} catch (Exception $e) {
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}

