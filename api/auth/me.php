<?php
// public_html/api/auth/me.php
// FINAL BULLETPROOF VERSION - WORKS ON HOSTINGER

// 1. Load files
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

// 2. Get DB
$pdo = getPDO();

// 3. Start session
// 3. Start session
start_session_if_needed();

// 4. No user? Return null
if (empty($_SESSION['user_id'])) {
    send_json(['ok' => false, 'user' => null]);
}

// 5. Get user
try {
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.username,
            u.email,
            u.name,
            u.role,
            COALESCE(u.approved, 1) AS approved,
            u.university_id,
            un.name AS university_name
        FROM users u
        LEFT JOIN universities un ON u.university_id = un.id
        WHERE u.id = ?
        LIMIT 1
    ");
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        send_json(['ok' => false, 'user' => null]);
    }

    $user['id'] = (int)$user['id'];
    $user['approved'] = (int)$user['approved'];
    $user['university_id'] = $user['university_id'] ? (int)$user['university_id'] : null;

    send_json(['ok' => true, 'user' => $user]);

} catch (Throwable $e) {
    // Log error
    error_log('me.php ERROR: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    
    // Return clean JSON
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Server error']);
    exit;
}