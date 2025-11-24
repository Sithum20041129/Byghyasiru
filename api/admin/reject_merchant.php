<?php
// public_html/api/admin/reject_merchant.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
require_admin();

$data = get_json_input();
$merchantId = (int)($data['merchant_id'] ?? 0);

if ($merchantId <= 0) {
    send_json(['ok' => false, 'error' => 'Invalid merchant_id'], 400);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT user_id FROM merchants WHERE id = ?");
    $stmt->execute([$merchantId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) throw new Exception('Merchant not found');
    $userId = (int)$row['user_id'];

    $pdo->prepare("DELETE FROM merchants WHERE id = ?")->execute([$merchantId]);
    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

    $pdo->commit();
    send_json(['ok' => true, 'message' => 'Merchant rejected and deleted']);

} catch (Exception $e) {
    $pdo->rollBack();
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}
