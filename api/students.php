<?php
require_once 'config.php';
$userId = getAuthUser();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM Students WHERE teacher_id = ?");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO Students (name, email, phone, board, grade, teacher_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data['name'], $data['email'] ?? '', $data['phone'] ?? '', $data['board'] ?? '', $data['grade'] ?? '', $userId]);
    echo json_encode(["message" => "Student added"]);
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE Students SET name = ?, email = ?, phone = ?, board = ?, grade = ? WHERE id = ? AND teacher_id = ?");
    $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['board'], $data['grade'], $data['id'], $userId]);
    echo json_encode(["message" => "Student updated"]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM Students WHERE id = ? AND teacher_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(["message" => "Student deleted"]);
}
?>
