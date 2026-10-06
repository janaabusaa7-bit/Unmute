<?php
require_once __DIR__ . '/social_bootstrap.php';

$receiverId = (int) ($_POST["receiver_id"] ?? 0);

if ($receiverId <= 0 || $receiverId === $currentUserId) {
    json_response([
        "success" => false,
        "message" => "Invalid user"
    ], 422);
}

/* هل هم أصدقاء أصلًا؟ */
$checkFriend = $conn->prepare("
    SELECT friend_id
    FROM friend
    WHERE (user_one = ? AND user_two = ?)
       OR (user_one = ? AND user_two = ?)
    LIMIT 1
");

if ($checkFriend) {
    $checkFriend->bind_param("iiii", $currentUserId, $receiverId, $receiverId, $currentUserId);
    $checkFriend->execute();
    $friendResult = $checkFriend->get_result();

    if ($friendResult->num_rows > 0) {
        json_response([
            "success" => true,
            "status" => "already_friends"
        ]);
    }
}

/* هل يوجد طلب pending سابق؟ */
$checkRequest = $conn->prepare("
    SELECT request_id, status
    FROM friend_request
    WHERE sender_id = ? AND receiver_id = ?
    ORDER BY request_id DESC
    LIMIT 1
");

if ($checkRequest) {
    $checkRequest->bind_param("ii", $currentUserId, $receiverId);
    $checkRequest->execute();
    $requestResult = $checkRequest->get_result();

    if ($existing = $requestResult->fetch_assoc()) {
        if ($existing["status"] === "pending") {
            json_response([
                "success" => true,
                "status" => "pending"
            ]);
        }
    }
}

/* إضافة طلب جديد */
$insert = $conn->prepare("
    INSERT INTO friend_request (sender_id, receiver_id, status, created_at)
    VALUES (?, ?, 'pending', NOW())
");

if (!$insert) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$insert->bind_param("ii", $currentUserId, $receiverId);
$insert->execute();

/* إشعار للطرف الآخر */
$type = "friend_request";
$titleAr = "طلب صداقة جديد";
$titleEn = "New friend request";

// الحصول على اسم المرسل
$senderName = "شخص ما";
$uQ = $conn->query("SELECT name FROM users WHERE user_id = $currentUserId");
if ($uQ && $uQ->num_rows > 0) {
    $senderName = $uQ->fetch_assoc()['name'];
}

$bodyAr = "أرسل لك " . $senderName . " طلب صداقة.";
$bodyEn = $senderName . " sent you a friend request.";

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
    "status" => "pending"
]);
