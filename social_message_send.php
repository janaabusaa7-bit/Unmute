<?php
require_once __DIR__ . '/social_bootstrap.php';

$contactId = $_POST["contact_id"] ?? "";
$text = trim($_POST["text"] ?? "");

if ($text === "") {
    json_response([
        "success" => false,
        "message" => "Empty message"
    ], 422);
}

/*
|--------------------------------------------------------------------------
| Real User Message
|--------------------------------------------------------------------------
*/
$receiverId = (int) $contactId;

if ($receiverId <= 0 || $receiverId === $currentUserId) {
    json_response([
        "success" => false,
        "message" => "Invalid receiver"
    ], 422);
}

/* اسمح فقط بين الأصدقاء */
$userOne = min($currentUserId, $receiverId);
$userTwo = max($currentUserId, $receiverId);

$checkFriend = $conn->prepare("
    SELECT friend_id
    FROM friend
    WHERE user_one = ? AND user_two = ?
    LIMIT 1
");

if (!$checkFriend) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$checkFriend->bind_param("ii", $userOne, $userTwo);
$checkFriend->execute();
$friendResult = $checkFriend->get_result();

if ($friendResult->num_rows === 0) {
    json_response([
        "success" => false,
        "message" => "You can only message friends"
    ], 403);
}

$messageType = "text";

$sql = "
    INSERT INTO chat_message (
        sender_id,
        receiver_id,
        message_type,
        content,
        created_at,
        is_read
    ) VALUES (?, ?, ?, ?, NOW(), 0)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$stmt->bind_param("iiss", $currentUserId, $receiverId, $messageType, $text);
$stmt->execute();

/* إشعار رسالة */
$type = "message";
$titleAr = "رسالة جديدة";
$titleEn = "New message";

$shortText = mb_strlen($text, "UTF-8") > 60 ? mb_substr($text, 0, 60, "UTF-8") . "..." : $text;
$bodyAr = "الرسالة: " . $shortText;
$bodyEn = "Message: " . $shortText;

$notif = $conn->prepare("
    INSERT INTO notification (
        user_id, type, title_ar, title_en, body_ar, body_en, related_user_id, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
");

if ($notif) {
    $notif->bind_param(
        "isssssi",
        $receiverId,
        $type,
        $titleAr,
        $titleEn,
        $bodyAr,
        $bodyEn,
        $currentUserId
    );
    $notif->execute();
}

json_response([
    "success" => true,
    "message" => "Message sent"
]);
