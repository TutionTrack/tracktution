<?php
require_once 'config.php';
$userId = getAuthUser();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT s.*, st.name as student_name FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE st.teacher_id = ?");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO Sessions (student_id, subject, date, start_time, end_time, recurring_type) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data['student_id'], $data['subject'], $data['date'], $data['start_time'], $data['end_time'], $data['recurring_type'] ?? 'none']);
    echo json_encode(["message" => "Session scheduled"]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'];
    // Verify ownership via student join
    $stmt = $pdo->prepare("DELETE s FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE s.id = ? AND st.teacher_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(["message" => "Session cancelled"]);
}
?>
