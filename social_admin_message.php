<?php
require_once __DIR__ . '/social_bootstrap.php';

$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$message = trim($_POST["message"] ?? "");

if ($name === "" || $email === "" || $message === "") {
    json_response([
        "success" => false,
        "message" => "Missing fields"
    ], 422);
}

$sql = "
    INSERT INTO admin_message (
        user_id,
        sender_name,
        sender_email,
        message_text,
        created_at
    ) VALUES (?, ?, ?, ?, NOW())
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$stmt->bind_param("isss", $currentUserId, $name, $email, $message);
$stmt->execute();

json_response([
    "success" => true
]);
?>
