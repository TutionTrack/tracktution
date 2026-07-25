<?php
require_once 'config.php';

// Fetch all sessions scheduled for today
$stmt = $pdo->prepare("
    SELECT s.*, st.name as student_name, st.email as student_email, u.email as teacher_email, u.name as teacher_name 
    FROM Sessions s 
    JOIN Students st ON s.student_id = st.id 
    JOIN Users u ON st.teacher_id = u.id 
    WHERE s.date = CURDATE()
    ORDER BY s.start_time
");
$stmt->execute();
$sessions = $stmt->fetchAll();

if (empty($sessions)) {
    echo "No sessions scheduled for today.";
    exit;
}

// Group sessions by teacher
$teacherSessions = [];
foreach ($sessions as $session) {
    $teacherSessions[$session['teacher_email']][] = $session;
}

foreach ($teacherSessions as $teacherEmail => $list) {
    $teacherName = $list[0]['teacher_name'];
    $subject = "Today's Tuition Schedule - TrackTution";
    
    $message = "Hello $teacherName,\n\nHere is your tuition schedule for today (" . date('d M Y') . "):\n\n";
    
    foreach ($list as $session) {
        $startTime = date('h:i A', strtotime($session['start_time']));
        $endTime = date('h:i A', strtotime($session['end_time']));
        $message .= "- Student: " . $session['student_name'] . "\n";
        $message .= "  Subject: " . $session['subject'] . "\n";
        $message .= "  Time: $startTime to $endTime\n\n";
    }
    
    $message .= "Good luck with your sessions today!\n\nBest regards,\nTrackTution Support";
    
    $headers = "From: support@tracktution.sujaykrishna.in\r\n";
    $headers .= "Reply-To: support@tracktution.sujaykrishna.in\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    mail($teacherEmail, $subject, $message, $headers);
    
    // Send a friendly reminder to the student as well if they have an email address listed
    foreach ($list as $session) {
        if (!empty($session['student_email'])) {
            $studentSubject = "Reminder: Tuition Session Today";
            $studentMessage = "Hello " . $session['student_name'] . ",\n\nThis is a quick reminder that you have a tuition session scheduled for today:\n\n";
            $studentMessage .= "Subject: " . $session['subject'] . "\n";
            $studentMessage .= "Time: " . date('h:i A', strtotime($session['start_time'])) . " to " . date('h:i A', strtotime($session['end_time'])) . "\n\n";
            $studentMessage .= "See you there!\n\nBest regards,\n" . $teacherName;
            
            mail($session['student_email'], $studentSubject, $studentMessage, $headers);
        }
    }
}

echo "Reminder emails sent successfully.";
?>
