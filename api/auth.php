<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($action === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Create user (inactive until OTP)
    $stmt = $pdo->prepare("INSERT INTO Users (name, email, password, is_active) VALUES (?, ?, ?, 0)");
    try {
        $stmt->execute([$name, $email, $password]);
        $userId = $pdo->lastInsertId();
        
        // Generate OTP
        $otp = rand(100000, 999999);
        $stmt = $pdo->prepare("INSERT INTO EmailOTPs (user_id, otp, type) VALUES (?, ?, 'verification')");
        $stmt->execute([$userId, $otp]);
        
        // In a real app, send email here. For now, we return it for testing.
        echo json_encode(["message" => "OTP sent to email", "otp_debug" => $otp]);
    } catch (Exception $e) {
        echo json_encode(["error" => "User already exists or error: " . $e->getMessage()]);
    }
}

if ($action === 'verify') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    $otp = $data['otp'];
    
    $stmt = $pdo->prepare("SELECT u.id, o.id as otp_id FROM Users u JOIN EmailOTPs o ON u.id = o.user_id WHERE u.email = ? AND o.otp = ? AND o.type = 'verification'");
    $stmt->execute([$email, $otp]);
    $result = $stmt->fetch();
    
    if ($result) {
        $pdo->prepare("UPDATE Users SET is_active = 1 WHERE id = ?")->execute([$result['id']]);
        $pdo->prepare("DELETE FROM EmailOTPs WHERE id = ?")->execute([$result['otp_id']]);
        echo json_encode(["message" => "Account activated"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid OTP"]);
    }
}

if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    $password = $data['password'];
    
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $token = generateToken($user['id']);
        echo json_encode(["token" => $token, "user" => ["id" => $user['id'], "name" => $user['name'], "email" => $user['email']]]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials or account not active"]);
    }
}
?>
