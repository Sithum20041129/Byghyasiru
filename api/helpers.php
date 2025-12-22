<?php
date_default_timezone_set('Asia/Colombo');
// public_html/helpers.php
// FULLY WORKING — with admin check

/**
 * Send JSON response and exit
 */
function send_json($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Get JSON input from POST/PUT requests
 */
function get_json_input() {
    $input = file_get_contents('php://input');
    if (empty($input)) return [];
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

/**
 * Start session only if needed
 */
function start_session_if_needed() {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('quickmeal_session');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
    }
}

/**
 * Require admin role — for admin endpoints
 */
function require_admin() {
    start_session_if_needed();
    if (empty($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        send_json(['ok' => false, 'error' => 'Access denied. Admin only.'], 403);
    }
}

/**
 * Require login (any role)
 */
function require_login() {
    start_session_if_needed();
    if (!isset($_SESSION['user_id'])) {
        send_json(['ok' => false, 'error' => 'Unauthorized'], 401);
    }
}

/**
 * Get logged user ID
 */
function get_logged_user_id() {
    start_session_if_needed();
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get logged user role
 */
function get_logged_user_role() {
    start_session_if_needed();
    return $_SESSION['user_role'] ?? null;
}

/**
 * Get logged merchant ID
 */
function get_logged_merchant_id($pdo) {
    start_session_if_needed();
    if (isset($_SESSION['merchant_id'])) {
        return $_SESSION['merchant_id'];
    }
    // Fallback: try to find merchant_id from user_id if not in session
    if (isset($_SESSION['user_id']) && $_SESSION['user_role'] === 'merchant') {
        $stmt = $pdo->prepare("SELECT id FROM merchants WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $merchant = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($merchant) {
            $_SESSION['merchant_id'] = $merchant['id'];
            return $merchant['id'];
        }
    }
    return null;
}
