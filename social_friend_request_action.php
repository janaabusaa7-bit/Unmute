<?php
require_once __DIR__ . '/social_bootstrap.php';

$requestId = (int) ($_POST["request_id"] ?? 0);
$action = trim($_POST["action"] ?? "");

if ($requestId <= 0 || !in_array($action, ["accept", "reject"], true)) {
    json_response([
        "success" => false,
        "message" => "Invalid request"
    ], 422);
}

$getRequest = $conn->prepare("
    SELECT request_id, sender_id, receiver_id, status
    FROM friend_request
    WHERE request_id = ? AND receiver_id = ?
    LIMIT 1
");

if (!$getRequest) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$getRequest->bind_param("ii", $requestId, $currentUserId);
$getRequest->execute();
$result = $getRequest->get_result();
$request = $result->fetch_assoc();

if (!$request) {
    json_response([
        "success" => false,
        "message" => "Request not found"
    ], 404);
}

if ($request["status"] !== "pending") {
    json_response([
        "success" => false,
        "message" => "Request already handled"
    ], 409);
}

if ($action === "reject") {
    $reject = $conn->prepare("
        UPDATE friend_request
        SET status = 'rejected'
        WHERE request_id = ?
    ");
    $reject->bind_param("i", $requestId);
    $reject->execute();

    json_response([
        "success" => true,
        "status" => "rejected"
    ]);
}

/* accept */
$accept = $conn->prepare("
    UPDATE friend_request
    SET status = 'accepted'
    WHERE request_id = ?
");
$accept->bind_param("i", $requestId);
$accept->execute();

$userOne = min((int)$request["sender_id"], (int)$request["receiver_id"]);
$userTwo = max((int)$request["sender_id"], (int)$request["receiver_id"]);

$checkFriend = $conn->prepare("
    SELECT friend_id
    FROM friend
    WHERE user_one = ? AND user_two = ?
    LIMIT 1
");
$checkFriend->bind_param("ii", $userOne, $userTwo);
$checkFriend->execute();
$friendResult = $checkFriend->get_result();

if ($friendResult->num_rows === 0) {
    $insertFriend = $conn->prepare("
        INSERT INTO friend (user_one, user_two, created_at)
        VALUES (?, ?, NOW())
    ");
    $insertFriend->bind_param("ii", $userOne, $userTwo);
    $insertFriend->execute();
}

/* إشعار للمرسل */
$type = "friend_accept";
$titleAr = "تم قبول طلب الصداقة";
$titleEn = "friend request accepted";
$bodyAr = "تم قبول طلب صداقتك";
$bodyEn = "Your friend request has been accepted";

$notif = $conn->prepare("
    INSERT INTO notification (
        user_id, type, title_ar, title_en, body_ar, body_en, related_user_id, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
");

if ($notif) {
    $senderId = (int)$request["sender_id"];
    $notif->bind_param(
        "isssssi",
        $senderId,
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
    "status" => "accepted"
]);
