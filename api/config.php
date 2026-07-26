<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$host = 'localhost';
$db   = 'u242271527_tracktution';
$user = 'u242271527_tution';
$pass = 'Tution2026@';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     echo json_encode(["error" => "Database connection failed"]);
     exit;
}

// Simple JWT-like implementation for PHP (Self-contained)
$secretFile = __DIR__ . '/jwt_secret.txt';
if (!file_exists($secretFile)) {
    try {
        $randomSecret = bin2hex(random_bytes(32));
        @file_put_contents($secretFile, $randomSecret);
    } catch (\Exception $e) {
        // Fallback default
    }
}
$jwtSecret = @file_get_contents($secretFile);
if (empty($jwtSecret)) {
    $jwtSecret = 'TrackTutionSuperSecretKey2026'; // fallback default
}
define('SECRET_KEY', trim($jwtSecret));

function generateToken($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(['user_id' => $userId, 'exp' => time() + (3600 * 24 * 7)]); // 7 days
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function getAuthUser() {
    $headers = apache_request_headers();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid token"]);
        exit;
    }
    
    $payload = json_decode(base64_decode($tokenParts[1]), true);
    if (!$payload || $payload['exp'] < time()) {
        http_response_code(401);
        echo json_encode(["error" => "Token expired"]);
        exit;
    }
    
    return $payload['user_id'];
}
?>
