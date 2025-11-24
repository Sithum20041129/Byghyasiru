<?php
// public_html/api/admin/universities.php
// FULL: GET, POST, DELETE for universities

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();
$method = $_SERVER['REQUEST_METHOD'];

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_name('quickmeal_session');
    session_start();
}

// Must be admin for POST/DELETE
if (in_array($method, ['POST', 'DELETE'])) {
    if (empty($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        send_json(['ok' => false, 'error' => 'Access denied'], 403);
    }
}

// GET: List all universities
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, name, created_at FROM universities ORDER BY name ASC");
        $universities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        send_json(['ok' => true, 'universities' => $universities]);
    } catch (Exception $e) {
        send_json(['ok' => false, 'error' => $e->getMessage()], 500);
    }
}

// POST: Add new university
if ($method === 'POST') {
    $data = get_json_input();
    $name = trim($data['name'] ?? '');

    if ($name === '') {
        send_json(['ok' => false, 'error' => 'Name is required'], 400);
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO universities (name) VALUES (?)");
        $stmt->execute([$name]);
        $id = (int)$pdo->lastInsertId();

        send_json(['ok' => true, 'id' => $id, 'name' => $name, 'message' => 'University added']);
    } catch (Exception $e) {
        send_json(['ok' => false, 'error' => $e->getMessage()], 500);
    }
}

// DELETE: Remove university
if ($method === 'DELETE') {
    $data = get_json_input();
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        send_json(['ok' => false, 'error' => 'Valid ID required'], 400);
    }

    try {
        // Optional: Prevent deleting if users/merchants use it
        $check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE university_id = ?");
        $check->execute([$id]);
        if ($check->fetchColumn() > 0) {
            send_json(['ok' => false, 'error' => 'Cannot delete: users are assigned'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM universities WHERE id = ?");
        $stmt->execute([$id]);

        send_json(['ok' => true, 'message' => 'University deleted']);
    } catch (Exception $e) {
        send_json(['ok' => false, 'error' => $e->getMessage()], 500);
    }
}

// Invalid method
send_json(['ok' => false, 'error' => 'Method not allowed'], 405);
