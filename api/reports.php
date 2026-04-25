<?php
require_once 'config.php';
$userId = getAuthUser();

$stmt = $pdo->prepare("SELECT l.*, s.name as student_name FROM SessionLogs l JOIN Students s ON l.student_id = s.id WHERE s.teacher_id = ?");
$stmt->execute([$userId]);
$logs = $stmt->fetchAll();

$report = "TUITION SESSION REPORT\n";
$report .= "Generated on: " . date('Y-m-d H:i:s') . "\n";
$report .= str_repeat("-", 40) . "\n\n";

$totalMinutes = 0;

foreach ($logs as $log) {
    $report .= "Student: " . $log['student_name'] . "\n";
    $report .= "Date: " . $log['date'] . "\n";
    $report .= "Duration: " . $log['duration'] . "\n";
    $report .= "Status: " . ucfirst($log['status']) . "\n";
    $report .= "Comments: " . $log['comments'] . "\n";
    $report .= str_repeat("-", 20) . "\n";
    
    $parts = explode(':', $log['duration']);
    if (count($parts) === 2) {
        $totalMinutes += ($parts[0] * 60) + $parts[1];
    }
}

$hours = floor($totalMinutes / 60);
$mins = $totalMinutes % 60;
$report .= "\nTOTAL TEACHING HOURS: " . $hours . "h " . $mins . "m\n";

echo json_encode(["text" => $report]);
?>
