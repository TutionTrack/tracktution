<?php
require_once 'config.php';
$userId = getAuthUser();

// Total Students
$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM Students WHERE teacher_id = ?");
$stmt->execute([$userId]);
$totalStudents = $stmt->fetch()['total'];

// Total Sessions (Logged)
$stmt = $pdo->prepare("SELECT COUNT(*) as total, SUM(TIME_TO_SEC(duration))/3600 as total_hours FROM SessionLogs l JOIN Students s ON l.student_id = s.id WHERE s.teacher_id = ?");
$stmt->execute([$userId]);
$logStats = $stmt->fetch();
$totalSessions = $logStats['total'] ?? 0;
$totalHours = round($logStats['total_hours'] ?? 0, 1);

// Upcoming Sessions (This Week - next 7 days)
$stmt = $pdo->prepare("SELECT s.*, st.name as student_name FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE st.teacher_id = ? AND s.date >= CURDATE() AND s.date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) ORDER BY s.date, s.start_time");
$stmt->execute([$userId]);
$upcoming = $stmt->fetchAll();

// Recent Activity (Logs)
$stmt = $pdo->prepare("SELECT l.*, s.name as student_name FROM SessionLogs l JOIN Students s ON l.student_id = s.id WHERE s.teacher_id = ? ORDER BY l.created_at DESC LIMIT 5");
$stmt->execute([$userId]);
$recent = $stmt->fetchAll();

// All Students List
$stmt = $pdo->prepare("SELECT * FROM Students WHERE teacher_id = ? ORDER BY name ASC");
$stmt->execute([$userId]);
$studentsList = $stmt->fetchAll();

echo json_encode([
    "stats" => [
        "totalStudents" => $totalStudents,
        "totalSessions" => $totalSessions,
        "totalHours" => $totalHours,
        "earnings" => $totalHours * 50 // Example: $50 per hour
    ],
    "upcoming" => $upcoming,
    "recent" => $recent,
    "students" => $studentsList
]);
?>
