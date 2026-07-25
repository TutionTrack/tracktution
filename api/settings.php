<?php
require_once 'config.php';
$userId = getAuthUser(); // Must be logged in

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM SystemSettings");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['key_name']] = $row['val'];
    }
    echo json_encode($settings);
}

if ($method === 'POST') {
    // Verify admin
    $stmt = $pdo->prepare("SELECT is_admin FROM Users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user || !$user['is_admin']) {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden: Admin access required"]);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    foreach ($data as $key => $val) {
        $stmt = $pdo->prepare("INSERT INTO SystemSettings (key_name, val) VALUES (?, ?) ON DUPLICATE KEY UPDATE val = ?");
        $stmt->execute([$key, $val, $val]);
    }
    
    echo json_encode(["message" => "Settings updated successfully"]);
}
?>
