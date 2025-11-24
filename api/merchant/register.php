<?php
// api/auth/register.php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
$data = get_json_input();

// Collect input
$username      = trim($data['username'] ?? '');
$email         = trim($data['email'] ?? '');
$password      = $data['password'] ?? '';
$name          = trim($data['name'] ?? '');
$role          = in_array($data['role'] ?? 'customer', ['customer','merchant','admin']) ? $data['role'] : 'customer';
$university_id = isset($data['university_id']) && $data['university_id'] !== '' ? intval($data['university_id']) : null;

// Merchant extra fields
$storeName     = $data['storeName'] ?? $data['store_name'] ?? null;
$storeAddress  = $data['storeAddress'] ?? $data['store_address'] ?? null;

if (!$email || !$password || !$username) {
    send_json(['ok' => false, 'error' => 'Missing required fields'], 400);
}

try {
    // check duplicate email or username
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email OR username = :username LIMIT 1");
    $stmt->execute(['email' => $email, 'username' => $username]);
    if ($stmt->fetch()) {
        send_json(['ok' => false, 'error' => 'Email or username already taken'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // insert into users
    $insert = $pdo->prepare("INSERT INTO users (username, email, password, name, role, university_id) 
                             VALUES (:username, :email, :password, :name, :role, :university_id)");
    $insert->execute([
        'username'      => $username,
        'email'         => $email,
        'password'      => $hash,
        'name'          => $name,
        'role'          => $role,
        'university_id' => $university_id
    ]);

    $userId = (int)$pdo->lastInsertId();

    // If merchant → create merchants row (pending approval)
    if ($role === 'merchant') {
        $stmt2 = $pdo->prepare("INSERT INTO merchants (user_id, store_name, store_address, university_id, website_charge, approved)
                                VALUES (?, ?, ?, ?, ?, ?)");
        $stmt2->execute([
            $userId,
            $storeName,
            $storeAddress,
            $university_id,
            10.00, // default website charge
            0      // not approved yet
        ]);

        send_json([
            'ok'      => true,
            'message' => 'Merchant registered successfully. Waiting for admin approval.'
        ]);
    }

    // If customer → auto-login
    if ($role === 'customer') {
        session_name('quickmeal_session');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();

        // get university name
        $uniName = null;
        if ($university_id) {
            $u = $pdo->prepare("SELECT name FROM universities WHERE id = ? LIMIT 1");
            $u->execute([$university_id]);
            $unRow = $u->fetch(PDO::FETCH_ASSOC);
            $uniName = $unRow['name'] ?? null;
        }

        $_SESSION['user'] = [
            'id'              => $userId,
            'username'        => $username,
            'email'           => $email,
            'name'            => $name,
            'role'            => $role,
            'university_id'   => $university_id,
            'university_name' => $uniName
        ];
        $_SESSION['user_id']   = $userId;
        $_SESSION['user_role'] = $role;

        send_json(['ok' => true, 'user' => $_SESSION['user']]);
    }

    // Admin or fallback
    send_json([
        'ok'      => true,
        'message' => 'Registered successfully.'
    ]);

} catch (Exception $e) {
    send_json(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
