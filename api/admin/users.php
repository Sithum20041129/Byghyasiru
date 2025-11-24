<?php
// public_html/api/admin/users.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
require_admin();

try {
    $stmt = $pdo->prepare("
        SELECT id, username, email, name, role, approved, university_id, created_at
        FROM users 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    send_json(['ok' => true, 'users' => $users]);
} catch (Exception $e) {
    send_json(['ok' => false, 'error' => $e->getMessage()], 500);
}