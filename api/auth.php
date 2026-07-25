<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($action === 'register') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'];
        $email = $data['email'];
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM Users WHERE email = ?");
        $stmt->execute([$email]);
        $existingUser = $stmt->fetch();
        
        if ($existingUser) {
            $userId = $existingUser['id'];
            $pdo->prepare("UPDATE Users SET name = ?, password = ? WHERE id = ?")->execute([$name, $password, $userId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO Users (name, email, password, is_active) VALUES (?, ?, ?, 0)");
            $stmt->execute([$name, $email, $password]);
            $userId = $pdo->lastInsertId();
        }
        
        // Generate OTP
        $otp = (string)rand(100000, 999999);
        $pdo->prepare("DELETE FROM EmailOTPs WHERE user_id = ?")->execute([$userId]);
        $stmt = $pdo->prepare("INSERT INTO EmailOTPs (user_id, otp, type) VALUES (?, ?, 'verification')");
        $stmt->execute([$userId, $otp]);
            
        // Send OTP via Email
        $subject = "Your TrackTution Verification Code";
        $message = "Hello $name,\n\nYour verification code is: $otp\n\nPlease enter this code to activate your account.";
        $headers = "From: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "Reply-To: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($email, $subject, $message, $headers);
        
        echo json_encode(["message" => "OTP sent to your email."]);
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
        echo json_encode([
            "token" => $token, 
            "user" => [
                "id" => $user['id'], 
                "name" => $user['name'], 
                "email" => $user['email'],
                "is_admin" => (int)$user['is_admin']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials or account not active"]);
    }
}

if ($action === 'forgot-password') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    
    $stmt = $pdo->prepare("SELECT id, name FROM Users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        $userId = $user['id'];
        $name = $user['name'];
        $otp = (string)rand(100000, 999999);
        
        $pdo->prepare("DELETE FROM EmailOTPs WHERE user_id = ? AND type = 'reset'")->execute([$userId]);
        $stmt = $pdo->prepare("INSERT INTO EmailOTPs (user_id, otp, type) VALUES (?, ?, 'reset')");
        $stmt->execute([$userId, $otp]);
        
        // Send reset OTP email
        $subject = "Your TrackTution Password Reset Code";
        $message = "Hello $name,\n\nWe received a request to reset your password. Your reset code is: $otp\n\nPlease enter this code to choose a new password. If you did not make this request, you can safely ignore this email.";
        $headers = "From: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "Reply-To: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($email, $subject, $message, $headers);
        echo json_encode(["message" => "Reset code sent to your email."]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Email address not found or account is not active."]);
    }
}

if ($action === 'reset-password') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    $otp = $data['otp'];
    $newPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT u.id, o.id as otp_id FROM Users u JOIN EmailOTPs o ON u.id = o.user_id WHERE u.email = ? AND o.otp = ? AND o.type = 'reset'");
    $stmt->execute([$email, $otp]);
    $result = $stmt->fetch();
    
    if ($result) {
        $pdo->prepare("UPDATE Users SET password = ? WHERE id = ?")->execute([$newPassword, $result['id']]);
        $pdo->prepare("DELETE FROM EmailOTPs WHERE id = ?")->execute([$result['otp_id']]);
        echo json_encode(["message" => "Password updated successfully."]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid reset code."]);
    }
}
?>
