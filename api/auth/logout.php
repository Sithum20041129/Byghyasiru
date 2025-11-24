<?php
// public_html/api/auth/logout.php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';
session_name('quickmeal_session');
session_start();

// Unset session and destroy cookie
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"] ?? '', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', true);
}
session_destroy();

send_json(['ok' => true, 'message' => 'Logged out']);
