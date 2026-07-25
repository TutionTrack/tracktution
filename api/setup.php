<?php
require_once 'config.php';

// SQL to create tables if they don't exist
$sql = "
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active TINYINT(1) DEFAULT 0,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    board VARCHAR(100),
    grade VARCHAR(50),
    teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject VARCHAR(255),
    date DATE,
    start_time TIME,
    end_time TIME,
    recurring_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id)
);

CREATE TABLE IF NOT EXISTS SessionLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    date DATE,
    start_time TIME,
    end_time TIME,
    duration VARCHAR(20),
    status VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id)
);

CREATE TABLE IF NOT EXISTS EmailOTPs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    otp VARCHAR(10),
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
";

try {
    $pdo->exec($sql);
    
    // Add is_admin column to existing databases if it is missing
    try {
        $pdo->exec("ALTER TABLE Users ADD COLUMN is_admin TINYINT(1) DEFAULT 0");
    } catch (PDOException $e) {
        // Column already exists
    }
    
    // Automatically make the first user account (id=1) an admin
    $pdo->exec("UPDATE Users SET is_admin = 1 WHERE id = 1");
    
    echo json_encode(["message" => "Database setup and upgraded successfully"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Setup failed: " . $e->getMessage()]);
}
?>
