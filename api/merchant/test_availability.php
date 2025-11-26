<?php
// test_availability.php
require_once __DIR__ . '/../../db.php';

// Mock session
session_name('quickmeal_session');
session_start();

// You might need to adjust these values based on your actual DB data
// I'll try to fetch a valid merchant and food item first
$pdo = getPDO();
$stmt = $pdo->query("SELECT id FROM merchants LIMIT 1");
$merchant = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$merchant) {
    die("No merchants found");
}

$_SESSION['user_id'] = 999; // Mock user ID
$_SESSION['user_role'] = 'merchant';
$_SESSION['merchant_id'] = $merchant['id'];

// Get a food item for this merchant
$stmt = $pdo->prepare("SELECT id FROM foods WHERE merchant_id = ? LIMIT 1");
$stmt->execute([$merchant['id']]);
$food = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$food) {
    die("No food items found for merchant " . $merchant['id']);
}

$url = 'http://localhost/api/merchant/update_food_availability.php'; // Adjust if needed, but we are running CLI mostly or via browser tool if possible. 
// Actually, I can't easily run curl against localhost if I don't know the port or if it's running.
// Instead, I will include the file and mock the input.

echo "Testing with Merchant ID: " . $_SESSION['merchant_id'] . " and Food ID: " . $food['id'] . "\n";

// Mock Input
$_SERVER['REQUEST_METHOD'] = 'POST';
$inputData = json_encode(['id' => $food['id'], 'is_available' => false]);

// We can't easily mock php://input for file_get_contents in the same script without external libraries or wrappers.
// So I will modify update_food_availability.php temporarily to accept a global variable if set, or just use a different approach.

// Better approach: Use the existing test_helpers.php idea but specific to this.
// I'll just write a script that sets up the environment and requires the file, 
// BUT I need to override get_json_input.

// Let's just try to run a curl command if I can find the server URL. 
// The user has "webprojects\Byghyasiru". 
// I'll assume standard PHP setup.

// Alternative: I will modify update_food_availability.php to log to a file, then ask user to try again.
// This is safer.

$logFile = __DIR__ . '/debug_log.txt';
file_put_contents($logFile, "Test Log Entry\n", FILE_APPEND);
echo "Log file created at $logFile\n";
