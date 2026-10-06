<?php
require_once __DIR__ . '/social_bootstrap.php';

$contactId = $_GET["contact_id"] ?? "";

/*
|--------------------------------------------------------------------------
| Normal User Chat
|--------------------------------------------------------------------------
*/
$otherUserId = (int) $contactId;

if ($otherUserId <= 0) {
    json_response(["success" => false, "message" => "Invalid contact"], 422);
}

$sql = "
    SELECT 
        sender_id,
        receiver_id,
        content,
        created_at
    FROM chat_message
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    json_response(["success" => false, "message" => "Prepare failed"], 500);
}

$stmt->bind_param("iiii", $currentUserId, $otherUserId, $otherUserId, $currentUserId);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];

while ($row = $result->fetch_assoc()) {
    $messages[] = [
        "by" => ((int) $row["sender_id"] === $currentUserId) ? "me" : "other",
        "text" => $row["content"],
        "created_at" => $row["created_at"]
    ];
}

/* نعتبر الرسائل القادمة لي كمقروءة */
$updateSql = "
    UPDATE chat_message
    SET is_read = 1
    WHERE sender_id = ? AND receiver_id = ?
";
$updateStmt = $conn->prepare($updateSql);

if ($updateStmt) {
    $updateStmt->bind_param("ii", $otherUserId, $currentUserId);
    $updateStmt->execute();
}

json_response([
    "success" => true,
    "messages" => $messages
]);
?>
