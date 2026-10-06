<?php
require_once "config.php";
$res = $conn->query("SELECT post_id, user_id, content_text, media_url, media_type FROM post ORDER BY created_at DESC LIMIT 5");
while($row = $res->fetch_assoc()) {
    echo "ID: " . $row['post_id'] . " | User: " . $row['user_id'] . " | Content: " . $row['content_text'] . " | URL: " . $row['media_url'] . " | Type: " . $row['media_type'] . "\n";
}
?>

