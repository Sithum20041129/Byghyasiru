<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (
    !$data ||
    !isset($data['order_id']) ||
    !isset($data['status'])
) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$orderId = intval($data['order_id']);
$newStatus = strtolower(trim($data['status']));

// Allowed statuses
$allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
if (!in_array($newStatus, $allowedStatuses)) {
    echo json_encode(["success" => false, "message" => "Invalid status"]);
    exit;
}

try {
    // Update status
    $stmt = $pdo->prepare("
        UPDATE orders
        SET status = ?
        WHERE id = ?
    ");
    $stmt->execute([$newStatus, $orderId]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Order not found or status unchanged"]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Order status updated successfully",
        "order_id" => $orderId,
        "status" => $newStatus
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Update failed: " . $e->getMessage()
    ]);
}