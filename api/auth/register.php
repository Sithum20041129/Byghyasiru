<?php
// public_html/api/auth/register.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
$data = get_json_input();

$email         = trim($data['email'] ?? '');
$username      = trim($data['username'] ?? '');
$password      = $data['password'] ?? '';
$role          = in_array($data['role'] ?? 'customer', ['customer', 'merchant']) ? $data['role'] : 'customer';
$university_id = !empty($data['university_id']) ? (int)$data['university_id'] : null;

// VALIDATION
if (!$email || !$username || !$password) {
    send_json(['ok' => false, 'error' => 'Missing: email, username, password'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['ok' => false, 'error' => 'Invalid email'], 400);
}
if (strlen($password) < 6) {
    send_json(['ok' => false, 'error' => 'Password too short'], 400);
}

// MERCHANT FIELDS
$store_name = $store_address = null;
if ($role === 'merchant') {
    $store_name    = trim($data['store_name'] ?? $data['storeName'] ?? '');
    $store_address = trim($data['store_address'] ?? $data['storeAddress'] ?? '');
    if (!$store_name || !$store_address) {
        send_json(['ok' => false, 'error' => 'Store name and address required'], 400);
    }
}

// CHECK DUPLICATE
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
$stmt->execute([$email, $username]);
if ($stmt->fetch()) {
    send_json(['ok' => false, 'error' => 'Email or username taken'], 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo->beginTransaction();

    // FIX: Customers = approved=1, Merchants = 0
    $user_approved = ($role === 'customer') ? 1 : 0;

    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, name, role, university_id, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$username, $email, $hash, $username, $role, $university_id, $user_approved]);
    $userId = (int)$pdo->lastInsertId();

    if ($role === 'merchant') {
        $stmt = $pdo->prepare("
            INSERT INTO merchants (user_id, store_name, store_address, university_id, website_charge, approved)
            VALUES (?, ?, ?, ?, 10.00, 0)
        ");
        $stmt->execute([$userId, $store_name, $store_address, $university_id]);
    }

    $pdo->commit();

    // AUTO LOGIN CUSTOMERS ONLY
    if ($role === 'customer') {
        start_session_if_needed();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_role'] = $role;

        $uniName = null;
        if ($university_id) {
            $u = $pdo->prepare("SELECT name FROM universities WHERE id = ?");
            $u->execute([$university_id]);
            $row = $u->fetch(PDO::FETCH_ASSOC);
            $uniName = $row['name'] ?? null;
        }

        send_json([
            'ok' => true,
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'name' => $username,
                'role' => $role,
                'university_id' => $university_id,
                'university_name' => $uniName,
                'approved' => 1
            ]
        ]);
    }

    send_json([
        'ok' => true,
        'message' => 'Merchant registered. Waiting for admin approval.'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Register error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}
