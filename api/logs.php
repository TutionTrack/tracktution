<?php
require_once 'config.php';
$userId = getAuthUser();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT l.*, s.name as student_name FROM SessionLogs l JOIN Students s ON l.student_id = s.id WHERE s.teacher_id = ?");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO SessionLogs (student_id, date, start_time, end_time, duration, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data['student_id'], $data['date'], $data['start_time'], $data['end_time'], $data['duration'], $data['status'], $data['comments']]);
    echo json_encode(["message" => "Session logged"]);
}
?>
