<?php
// api/auth/google_login.php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../../helpers.php'; // For session settings if needed

// ----------------------------------------------------
// ⚙️ CONFIGURATION (Replace with your keys)
// ----------------------------------------------------
$clientID     = 'HELLO KEY I AM FACK';
$clientSecret = 'HELLO KEY I AM FACK';
// Note: This URL must match EXACTLY what you put in Google Console
$redirectUri  = 'HELLO KEY I AM FACK'; 
// If live: 'https://your-site.com/api/auth/google_callback.php';

// ----------------------------------------------------
// 🚀 MAIN LOGIC
// ----------------------------------------------------
$client = new Google\Client();
$client->setClientId($clientID);
$client->setClientSecret($clientSecret);
$client->setRedirectUri($redirectUri);
$client->addScope("email");
$client->addScope("profile");

// Create the Google Login URL
$authUrl = $client->createAuthUrl();

// Redirect the user to Google
header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));
exit;