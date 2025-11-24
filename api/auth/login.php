<?php
// public_html/api/auth/login.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

// CORS for React (same domain or localhost)
header("Access-Control-Allow-Origin: https://mintcream-grouse-539607.hostingersite.com");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getPDO();

// Parse JSON or fallback to POST
$data = get_json_input();
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

$identifier = trim($data['emailOrUsername'] ?? '');
$password   = $data['password'] ?? '';
$remember   = !empty($data['rememberMe']);

if (!$identifier || !$password) {
    send_json(['ok' => false, 'error' => 'Missing email/username or password'], 400);
}

try {
    // Secure lookup
    $stmt = $pdo->prepare("
        SELECT id, username, email, password, name, role, approved, university_id
        FROM users
        WHERE email = ? OR username = ?
        LIMIT 1
    ");
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        send_json(['ok' => false, 'error' => 'Invalid credentials'], 401);
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        send_json(['ok' => false, 'error' => 'Invalid credentials'], 401);
    }

    // BLOCK UNAPPROVED USERS
    if ((int)$user['approved'] !== 1) {
        $role = $user['role'];
        $msg = $role === 'merchant' 
            ? 'Your merchant account is pending admin approval.' 
            : 'Your account is not approved yet.';
        send_json(['ok' => false, 'error' => $msg], 403);
    }

    // Session setup
    $lifetime = $remember ? (30 * 24 * 60 * 60) : 0; // 30 days if remember
    session_name('quickmeal_session');
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ]);
    session_start();

    // University name
    $uniName = null;
    if (!empty($user['university_id'])) {
        $u = $pdo->prepare("SELECT name FROM universities WHERE id = ?");
        $u->execute([$user['university_id']]);
        $row = $u->fetch(PDO::FETCH_ASSOC);
        $uniName = $row['name'] ?? null;
    }

    // Base user session
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'approved' => 1,
        'university_id' => $user['university_id'] ? (int)$user['university_id'] : null,
        'university_name' => $uniName
    ];

    // MERCHANT: Add merchant_id + ensure correct university
    if ($user['role'] === 'merchant') {
        $stmt2 = $pdo->prepare("SELECT id, university_id FROM merchants WHERE user_id = ? AND approved = 1 LIMIT 1");
        $stmt2->execute([$_SESSION['user_id']]);
        $merchant = $stmt2->fetch(PDO::FETCH_ASSOC);

        if ($merchant) {
            $_SESSION['merchant_id'] = (int)$merchant['id'];
            $merchant_uni_id = (int)$merchant['university_id'];

            // Override university if merchant has different one
            if ($merchant_uni_id !== $_SESSION['user']['university_id']) {
                $u2 = $pdo->prepare("SELECT name FROM universities WHERE id = ?");
                $u2->execute([$merchant_uni_id]);
                $row2 = $u2->fetch(PDO::FETCH_ASSOC);
                $_SESSION['user']['university_id'] = $merchant_uni_id;
                $_SESSION['user']['university_name'] = $row2['name'] ?? null;
            }
        }
    }

    send_json([
        'ok' => true,
        'user' => $_SESSION['user'],
        'merchant_id' => $_SESSION['merchant_id'] ?? null
    ]);

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    send_json(['ok' => false, 'error' => 'Server error'], 500);
}
