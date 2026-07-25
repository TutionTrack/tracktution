<?php
require_once 'config.php';
$userId = getAuthUser();

// Verify user is admin
$stmt = $pdo->prepare("SELECT is_admin FROM Users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || !$user['is_admin']) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden: Admin access required"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch system-wide stats
    $totalTeachers = $pdo->query("SELECT COUNT(*) FROM Users")->fetchColumn();
    $totalActiveTeachers = $pdo->query("SELECT COUNT(*) FROM Users WHERE is_active = 1")->fetchColumn();
    $totalStudents = $pdo->query("SELECT COUNT(*) FROM Students")->fetchColumn();
    $totalSessions = $pdo->query("SELECT COUNT(*) FROM Sessions")->fetchColumn();
    $totalLogs = $pdo->query("SELECT COUNT(*) FROM SessionLogs")->fetchColumn();
    
    // Fetch teachers list
    $stmt = $pdo->query("SELECT id, name, email, is_active, is_admin, created_at FROM Users ORDER BY created_at DESC");
    $teachers = $stmt->fetchAll();
    
    echo json_encode([
        "stats" => [
            "totalTeachers" => $totalTeachers,
            "totalActiveTeachers" => $totalActiveTeachers,
            "totalStudents" => $totalStudents,
            "totalSessions" => $totalSessions,
            "totalLogs" => $totalLogs
        ],
        "teachers" => $teachers
    ]);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    if ($action === 'toggle_active') {
        $targetUserId = $data['user_id'];
        $stmt = $pdo->prepare("UPDATE Users SET is_active = 1 - is_active WHERE id = ? AND id != ?");
        $stmt->execute([$targetUserId, $userId]);
        echo json_encode(["message" => "User status updated"]);
    }
    
    if ($action === 'delete_user') {
        $targetUserId = $data['user_id'];
        if ($targetUserId == $userId) {
            http_response_code(400);
            echo json_encode(["error" => "Cannot delete yourself"]);
            exit;
        }
        
        // Delete cascading child records to keep DB clean
        $pdo->prepare("DELETE FROM EmailOTPs WHERE user_id = ?")->execute([$targetUserId]);
        $pdo->prepare("DELETE s FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE st.teacher_id = ?")->execute([$targetUserId]);
        $pdo->prepare("DELETE l FROM SessionLogs l JOIN Students st ON l.student_id = st.id WHERE st.teacher_id = ?")->execute([$targetUserId]);
        $pdo->prepare("DELETE FROM Students WHERE teacher_id = ?")->execute([$targetUserId]);
        $pdo->prepare("DELETE FROM Users WHERE id = ?")->execute([$targetUserId]);
        
        echo json_encode(["message" => "User deleted"]);
    }
}
?>
