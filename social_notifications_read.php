<?php
require_once __DIR__ . '/social_bootstrap.php';

$sql = "
    UPDATE notification
    SET is_read = 1
    WHERE user_id = ?
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$stmt->bind_param("i", $currentUserId);
$stmt->execute();

json_response([
    "success" => true
]);
?>
