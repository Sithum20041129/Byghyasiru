<?php
// public_html/api/admin/approve_merchant.php

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

    $stmt = $pdo->prepare("UPDATE merchants SET approved = 1 WHERE id = ?");
    $stmt->execute([$merchantId]);
    if ($stmt->rowCount() === 0) throw new Exception('Merchant not found');

    $stmt2 = $pdo->prepare("
        UPDATE users SET approved = 1 
        WHERE id = (SELECT user_id FROM merchants WHERE id = ?)
    ");
    $stmt2->execute([$merchantId]);

    $pdo->commit();
    send_json(['ok' => true, 'message' => 'Merchant approved']);

} catch (Exception $e) {
    $pdo->rollBack();
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}
