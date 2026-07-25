<?php
require_once 'config.php';
$userId = getAuthUser();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT s.*, st.name as student_name FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE st.teacher_id = ?");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if this slot overlaps with an existing session for the teacher
    $stmt = $pdo->prepare("
        SELECT s.*, st.name as student_name 
        FROM Sessions s 
        JOIN Students st ON s.student_id = st.id 
        WHERE st.teacher_id = ? 
          AND s.date = ? 
          AND s.start_time < ? 
          AND s.end_time > ?
    ");
    $stmt->execute([$userId, $data['date'], $data['end_time'], $data['start_time']]);
    $overlap = $stmt->fetch();
    
    if ($overlap) {
        http_response_code(400);
        echo json_encode(["error" => "Time slot conflict! You already have a session ('" . $overlap['subject'] . "') scheduled with " . $overlap['student_name'] . " from " . substr($overlap['start_time'], 0, 5) . " to " . substr($overlap['end_time'], 0, 5) . "."]);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO Sessions (student_id, subject, date, start_time, end_time, recurring_type) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data['student_id'], $data['subject'], $data['date'], $data['start_time'], $data['end_time'], $data['recurring_type'] ?? 'none']);
    
    // Fetch details for calendar invite email
    $stmt = $pdo->prepare("SELECT name, email FROM Users WHERE id = ?");
    $stmt->execute([$userId]);
    $teacher = $stmt->fetch();
    
    $stmt = $pdo->prepare("SELECT name, email FROM Students WHERE id = ?");
    $stmt->execute([$data['student_id']]);
    $student = $stmt->fetch();
    
    $sendEmail = $data['send_email'] ?? false;
    
    if ($sendEmail && $teacher && $student) {
        $teacherEmail = $teacher['email'];
        $teacherName = $teacher['name'];
        $studentName = $student['name'];
        $studentEmail = $student['email'] ?? '';
        
        $subject = "📅 Session Confirmed: " . $data['subject'] . " with " . $studentName;
        $startTimeFormatted = date('h:i A', strtotime($data['start_time']));
        $endTimeFormatted = date('h:i A', strtotime($data['end_time']));
        $dateFormatted = date('d M Y', strtotime($data['date']));
        
        $message = "Your tuition session has been successfully booked.\n\n";
        $message .= "========================================\n";
        $message .= "🗓️ SESSION DETAILS\n";
        $message .= "========================================\n";
        $message .= "Subject:      " . $data['subject'] . "\n";
        $message .= "Date:         " . $dateFormatted . "\n";
        $message .= "Time:         " . $startTimeFormatted . " - " . $endTimeFormatted . "\n";
        $message .= "Teacher:      " . $teacherName . "\n";
        $message .= "Student:      " . $studentName . "\n";
        $message .= "Recurring:    " . ucfirst($data['recurring_type'] ?? 'none') . "\n";
        $message .= "========================================\n\n";
        $message .= "This event has been added to your tuition tracker dashboard.\n\nBest regards,\nTrackTution Support";
        
        $headers = "From: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "Reply-To: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($teacherEmail, $subject, $message, $headers);
        
        if (!empty($studentEmail)) {
            $studentSubject = "📅 Scheduled Session: " . $data['subject'] . " with " . $teacherName;
            mail($studentEmail, $studentSubject, $message, $headers);
        }
    }
    
    echo json_encode(["message" => "Session scheduled"]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'];
    // Verify ownership via student join
    $stmt = $pdo->prepare("DELETE s FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE s.id = ? AND st.teacher_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(["message" => "Session cancelled"]);
}
?>
