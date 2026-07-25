<?php
require_once 'config.php';
$userId = getAuthUser();

$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;
$studentId = $_GET['student_id'] ?? null;

$sql = "SELECT l.*, s.name as student_name FROM SessionLogs l JOIN Students s ON l.student_id = s.id WHERE s.teacher_id = ?";
$params = [$userId];

if ($startDate && $endDate) {
    $sql .= " AND l.date >= ? AND l.date <= ?";
    $params[] = $startDate;
    $params[] = $endDate;
}

if ($studentId && $studentId !== 'all' && $studentId !== '') {
    $sql .= " AND l.student_id = ?";
    $params[] = $studentId;
}

$sql .= " ORDER BY l.date ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$logs = $stmt->fetchAll();

$report = "TUITION SESSION REPORT\n";
if ($studentId && $studentId !== 'all' && $studentId !== '' && !empty($logs)) {
    $report .= "Student: " . $logs[0]['student_name'] . "\n";
}
if ($startDate && $endDate) {
    $report .= "Period: $startDate to $endDate\n";
}
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
