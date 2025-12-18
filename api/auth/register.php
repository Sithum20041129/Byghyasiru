<?php
// public_html/api/auth/register.php

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
$data = get_json_input();

$email         = trim($data['email'] ?? '');
$username      = trim($data['username'] ?? '');
// Allow password to be empty if it's a Google registration
$password      = $data['password'] ?? '';
$is_google     = !empty($data['is_google_register']); 
$google_id     = $data['google_id'] ?? null;

$role          = in_array($data['role'] ?? 'customer', ['customer', 'merchant']) ? $data['role'] : 'customer';
$university_id = !empty($data['university_id']) ? (int)$data['university_id'] : null;

// VALIDATION
if (!$email || !$username) {
    send_json(['ok' => false, 'error' => 'Missing: email or username'], 400);
}
// Only validate password if NOT using Google
if (!$is_google) {
    if (!$password || strlen($password) < 6) {
        send_json(['ok' => false, 'error' => 'Password must be at least 6 characters'], 400);
    }
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['ok' => false, 'error' => 'Invalid email'], 400);
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

// Hash password only if provided
$hash = $password ? password_hash($password, PASSWORD_BCRYPT) : null;

try {
    $pdo->beginTransaction();

    // Customers = approved=1, Merchants = 0
    $user_approved = ($role === 'customer') ? 1 : 0;

    // Insert user (Now supports google_id)
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, name, role, university_id, approved, google_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$username, $email, $hash, $username, $role, $university_id, $user_approved, $google_id]);
    $userId = (int)$pdo->lastInsertId();

    if ($role === 'merchant') {
        $stmt = $pdo->prepare("
            INSERT INTO merchants (user_id, store_name, store_address, university_id, website_charge, approved)
            VALUES (?, ?, ?, ?, 10.00, 0)
        ");
        $stmt->execute([$userId, $store_name, $store_address, $university_id]);
    }

    $pdo->commit();

    // AUTO LOGIN (If Customer)
    if ($role === 'customer') {
        start_session_if_needed();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_role'] = $role;
        $_SESSION['user'] = [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'name' => $username,
            'role' => $role,
            'university_id' => $university_id,
            'approved' => 1
        ];
        
        // Clear temp session
        unset($_SESSION['temp_google_user']);

        send_json(['ok' => true]);
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