<?php
// api/auth/google_callback.php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

// ----------------------------------------------------
// ⚙️ CONFIGURATION
// ----------------------------------------------------
$clientID     = 'HELLO KEY I AM FACK';
$clientSecret = 'HELLO KEY I AM FACK';
$redirectUri  = 'HELLO KEY I AM FACK';

// ----------------------------------------------------
// 🚀 MAIN LOGIC
// ----------------------------------------------------
start_session_if_needed(); // Use your helper to start the session correctly
$pdo = getPDO();

$client = new Google\Client();
$client->setClientId($clientID);
$client->setClientSecret($clientSecret);
$client->setRedirectUri($redirectUri);

if (!isset($_GET['code'])) {
    die("Error: Google did not return a code.");
}

// 1. Exchange the code for a Token
$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
if (isset($token['error'])) {
    die("Error fetching token: " . $token['error']);
}
$client->setAccessToken($token['access_token']);

// 2. Get User Profile Info from Google
$google_oauth = new Google\Service\Oauth2($client);
$google_account_info = $google_oauth->userinfo->get();

$google_id = $google_account_info->id;
$email     = $google_account_info->email;
$name      = $google_account_info->name;

try {
    // 3. Check if user exists in DB
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // --- CASE A: EXISTING USER ---
        
        // Update their Google ID if it's missing
        if (empty($user['google_id'])) {
            $update = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
            $update->execute([$google_id, $user['id']]);
        }

        // Check Logic: Is Merchant Approved?
        if ($user['role'] === 'merchant' && (int)$user['approved'] === 0) {
            header("Location: https://aqua-horse-753666.hostingersite.com/login?error=pending_approval");
            exit;
        }

        // Log them in!
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'university_id' => $user['university_id']
        ];

        // Redirect to Dashboard
        if ($user['role'] === 'admin') {
            header("Location: https://aqua-horse-753666.hostingersite.com/admin/dashboard");
        } elseif ($user['role'] === 'merchant') {
            header("Location: https://aqua-horse-753666.hostingersite.com/merchant/dashboard");
        } else {
            header("Location: https://aqua-horse-753666.hostingersite.com/customer/dashboard");
        }
        exit;

    } else {
        // --- CASE B: NEW USER (Registration) ---
        
        // We cannot save them yet! We need their University & Role.
        // Store Google Info in Session temporarily
        $_SESSION['temp_google_user'] = [
            'google_id' => $google_id,
            'email' => $email,
            'name' => $name
        ];

        // Redirect to your "Complete Profile" React page
        header("Location: https://aqua-horse-753666.hostingersite.com/complete-profile");
        exit;
    }

} catch (Exception $e) {
    die("Database Error: " . $e->getMessage());
}