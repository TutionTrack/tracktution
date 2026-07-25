<?php
require_once 'config.php';
$userId = getAuthUser();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT s.*, st.name as student_name FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE st.teacher_id = ? ORDER BY s.date, s.start_time");
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

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if this slot overlaps with an existing session for the teacher (excluding itself)
    $stmt = $pdo->prepare("
        SELECT s.*, st.name as student_name 
        FROM Sessions s 
        JOIN Students st ON s.student_id = st.id 
        WHERE st.teacher_id = ? 
          AND s.date = ? 
          AND s.start_time < ? 
          AND s.end_time > ? 
          AND s.id != ?
    ");
    $stmt->execute([$userId, $data['date'], $data['end_time'], $data['start_time'], $data['id']]);
    $overlap = $stmt->fetch();
    
    if ($overlap) {
        http_response_code(400);
        echo json_encode(["error" => "Overlap conflict! Another session ('" . $overlap['subject'] . "') overlaps from " . substr($overlap['start_time'], 0, 5) . " to " . substr($overlap['end_time'], 0, 5) . "."]);
        exit;
    }
    
    // Fetch old details before updating (for old vs new time comparison in email)
    $stmt = $pdo->prepare("
        SELECT s.*, st.name as student_name, st.email as student_email, u.name as teacher_name, u.email as teacher_email 
        FROM Sessions s 
        JOIN Students st ON s.student_id = st.id 
        JOIN Users u ON st.teacher_id = u.id 
        WHERE s.id = ? AND st.teacher_id = ?
    ");
    $stmt->execute([$data['id'], $userId]);
    $oldSession = $stmt->fetch();
    
    if (!$oldSession) {
        http_response_code(404);
        echo json_encode(["error" => "Session not found"]);
        exit;
    }
    
    // Update the database record
    $stmt = $pdo->prepare("UPDATE Sessions SET date = ?, start_time = ?, end_time = ?, recurring_type = ? WHERE id = ?");
    $stmt->execute([$data['date'], $data['start_time'], $data['end_time'], $data['recurring_type'] ?? $oldSession['recurring_type'], $data['id']]);
    
    // Send reschedule email alert
    $sendEmail = $data['send_email'] ?? false;
    
    if ($sendEmail) {
        $teacherEmail = $oldSession['teacher_email'];
        $teacherName = $oldSession['teacher_name'];
        $studentName = $oldSession['student_name'];
        $studentEmail = $oldSession['student_email'] ?? '';
        
        $subject = "🔄 Session Rescheduled: " . $oldSession['subject'] . " with " . $studentName;
        
        $oldDateFormatted = date('d M Y', strtotime($oldSession['date']));
        $oldStartFormatted = date('h:i A', strtotime($oldSession['start_time']));
        $oldEndFormatted = date('h:i A', strtotime($oldSession['end_time']));
        
        $newDateFormatted = date('d M Y', strtotime($data['date']));
        $newStartFormatted = date('h:i A', strtotime($data['start_time']));
        $newEndFormatted = date('h:i A', strtotime($data['end_time']));
        
        $message = "The following tuition session has been RESCHEDULED.\n\n";
        $message .= "========================================\n";
        $message .= "🔄 RESCHEDULED SESSION DETAILS\n";
        $message .= "========================================\n";
        $message .= "Subject:      " . $oldSession['subject'] . "\n";
        $message .= "Teacher:      " . $teacherName . "\n";
        $message .= "Student:      " . $studentName . "\n\n";
        $message .= "🔴 ORIGINAL SCHEDULE:\n";
        $message .= "Date:         " . $oldDateFormatted . "\n";
        $message .= "Time:         " . $oldStartFormatted . " - " . $oldEndFormatted . "\n\n";
        $message .= "🟢 NEW SCHEDULE:\n";
        $message .= "Date:         " . $newDateFormatted . "\n";
        $message .= "Time:         " . $newStartFormatted . " - " . $newEndFormatted . "\n";
        $message .= "========================================\n\n";
        $message .= "Please check your updated tuition dashboard calendar.\n\nBest regards,\nTrackTution Support";
        
        $headers = "From: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "Reply-To: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($teacherEmail, $subject, $message, $headers);
        
        if (!empty($studentEmail)) {
            $studentSubject = "🔄 Session Rescheduled: " . $oldSession['subject'] . " with " . $teacherName;
            mail($studentEmail, $studentSubject, $message, $headers);
        }
    }
    
    echo json_encode(["message" => "Session rescheduled"]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'];
    
    // Fetch details before deleting to send notification
    $stmt = $pdo->prepare("
        SELECT s.*, st.name as student_name, st.email as student_email, u.name as teacher_name, u.email as teacher_email 
        FROM Sessions s 
        JOIN Students st ON s.student_id = st.id 
        JOIN Users u ON st.teacher_id = u.id 
        WHERE s.id = ? AND st.teacher_id = ?
    ");
    $stmt->execute([$id, $userId]);
    $session = $stmt->fetch();
    
    if ($session) {
        $teacherEmail = $session['teacher_email'];
        $teacherName = $session['teacher_name'];
        $studentName = $session['student_name'];
        $studentEmail = $session['student_email'] ?? '';
        
        $subject = "❌ Session Cancelled: " . $session['subject'] . " with " . $studentName;
        $startTimeFormatted = date('h:i A', strtotime($session['start_time']));
        $endTimeFormatted = date('h:i A', strtotime($session['end_time']));
        $dateFormatted = date('d M Y', strtotime($session['date']));
        
        $message = "The following tuition session has been CANCELLED.\n\n";
        $message .= "========================================\n";
        $message .= "❌ CANCELLED SESSION DETAILS\n";
        $message .= "========================================\n";
        $message .= "Subject:      " . $session['subject'] . "\n";
        $message .= "Original Date: " . $dateFormatted . "\n";
        $message .= "Original Time: " . $startTimeFormatted . " - " . $endTimeFormatted . "\n";
        $message .= "Teacher:      " . $teacherName . "\n";
        $message .= "Student:      " . $studentName . "\n";
        $message .= "========================================\n\n";
        $message .= "This slot is now available on your schedule.\n\nBest regards,\nTrackTution Support";
        
        $headers = "From: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "Reply-To: support@tracktution.sujaykrishna.in\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($teacherEmail, $subject, $message, $headers);
        
        if (!empty($studentEmail)) {
            $studentSubject = "❌ Session Cancelled: " . $session['subject'] . " with " . $teacherName;
            mail($studentEmail, $studentSubject, $message, $headers);
        }
    }
    
    // Verify ownership via student join and delete
    $stmt = $pdo->prepare("DELETE s FROM Sessions s JOIN Students st ON s.student_id = st.id WHERE s.id = ? AND st.teacher_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(["message" => "Session cancelled"]);
}
?>
