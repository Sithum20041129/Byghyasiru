<?php
// public_html/api/merchant/list.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../helpers.php';

$pdo = getPDO();

$university_id = isset($_GET['university_id']) && $_GET['university_id'] !== '' 
    ? intval($_GET['university_id']) 
    : null;

try {
    // ✅ ADDED BACK: m.active_meal_time
    $sql = "
      SELECT m.id, m.user_id, m.store_name, m.store_address, m.website_charge,
             m.is_open, m.accepting_orders, m.order_limit, m.closing_time, 
             m.active_meal_time, 
             m.university_id,
             u.username AS owner_username, u.name AS owner_name, u.email AS owner_email,
             un.name AS university_name
      FROM merchants m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN universities un ON m.university_id = un.id
      WHERE m.approved = 1 AND u.approved = 1
    ";

    $params = [];
    if ($university_id) {
        $sql .= " AND m.university_id = ?";
        $params[] = $university_id;
    }

    $sql .= " ORDER BY m.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    send_json(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    send_json(['success' => false, 'message' => $e->getMessage()], 500);
}