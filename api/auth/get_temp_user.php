<?php
// api/auth/get_temp_user.php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../../helpers.php';

start_session_if_needed();

// Check if we have temporary Google data
if (isset($_SESSION['temp_google_user'])) {
    send_json([
        'ok' => true,
        'user' => $_SESSION['temp_google_user']
    ]);
} else {
    // If no session data, user shouldn't be here
    send_json(['ok' => false, 'error' => 'No temporary session found'], 401);
}