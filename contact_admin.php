<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once "includes/i18n.php";
require_once "mail_helper.php";

// هذا الملف يستقبل رسائل الزوار ويحفظها في قاعدة البيانات ويرسل إشعاراً للأدمن.
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$name = trim($_POST['sender_name'] ?? $_POST['name'] ?? '');
$email = trim($_POST['sender_email'] ?? $_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email']);
    exit;
}

try {
    require_once 'config.php';

    if (!isset($conn) || !($conn instanceof mysqli)) {
        throw new Exception('Database connection not found in config.php');
    }

    // ننشئ الجدول تلقائياً إذا لم يكن موجوداً (بتنسيق لوحة الإدارة).
    $createTableSql = "CREATE TABLE IF NOT EXISTS admin_message (
        admin_message_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        sender_name VARCHAR(150) NOT NULL,
        sender_email VARCHAR(190) NOT NULL,
        message_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if (!$conn->query($createTableSql)) {
        throw new Exception('Failed to create table: ' . $conn->error);
    }

    $userId = $_SESSION['user_id'] ?? null;

    $stmt = $conn->prepare("INSERT INTO admin_message (user_id, sender_name, sender_email, message_text) VALUES (?, ?, ?, ?)");

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param('isss', $userId, $name, $email, $message);

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $messageId = $stmt->insert_id;
    $stmt->close();

    // إرسال بريد إلكتروني للأدمن
    $subject = "رسالة جديدة من: $name (Unmute Contact Form)";
    $body = "
        <div dir='rtl' style='font-family: Arial, sans-serif;'>
            <h2>وصلتك رسالة جديدة من زائر للموقع</h2>
            <p><strong>الاسم:</strong> $name</p>
            <p><strong>البريد الإلكتروني:</strong> $email</p>
            <p><strong>الرسالة:</strong></p>
            <div style='background: #f4f4f4; padding: 15px; border-radius: 5px;'>
                " . nl2br(htmlspecialchars($message)) . "
            </div>
            <hr>
            <p style='color: #666;'>هذه الرسالة مرسلة تلقائياً من منصة Unmute.</p>
        </div>
    ";

    $mailResult = sendPlatformEmail(MAIL_FROM_EMAIL, 'Admin', $subject, $body);

    echo json_encode([
        'success' => true,
        'message' => __('contact_success', 'Message saved successfully') . " (ID: $messageId)",
        'message_id' => $messageId,
        'mail_sent' => $mailResult['success']
    ], JSON_UNESCAPED_UNICODE);

    $conn->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => __('contact_error', 'An error occurred while sending. Please try again.')
    ], JSON_UNESCAPED_UNICODE);
}

