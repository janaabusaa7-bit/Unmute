<?php
// تفعيل إظهار الأخطاء للمساعدة في حال وجود مشكلة
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = "sql110.infinityfree.com";
$username = "if0_41804907";
$password = "Adhamhabbash4"; // كلمة مرور حسابك
$database = "if0_41804907_unmute";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// Gemini API Key
define("GEMINI_API_KEY", "AIzaSyBpFyLAP3yb1Aojn7ogtbrRvU1q8iHI3as");
?>
