<?php
require_once __DIR__ . '/social_bootstrap.php';

$friendUserId = (int) ($_POST["friend_user_id"] ?? 0);

if ($friendUserId <= 0 || $friendUserId === $currentUserId) {
    json_response([
        "success" => false,
        "message" => "Invalid user"
    ], 422);
}

/* حذف الصداقة */
$deleteFriend = $conn->prepare("
    DELETE FROM friend 
    WHERE (user_one = ? AND user_two = ?) 
       OR (user_one = ? AND user_two = ?)
");

if (!$deleteFriend) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$deleteFriend->bind_param("iiii", $currentUserId, $friendUserId, $friendUserId, $currentUserId);
$deleteFriend->execute();

if ($deleteFriend->affected_rows > 0) {
    /* اختيارياً: يمكن حذف طلبات الصداقة المرتبطة أيضاً أو تغيير حالتها */
    $deleteRequest = $conn->prepare("
        DELETE FROM friend_request 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
    ");
    if ($deleteRequest) {
        $deleteRequest->bind_param("iiii", $currentUserId, $friendUserId, $friendUserId, $currentUserId);
        $deleteRequest->execute();
        $deleteRequest->close();
    }

    json_response([
        "success" => true,
        "message" => "Friend removed"
    ]);
} else {
    json_response([
        "success" => false,
        "message" => "Friendship not found"
    ], 404);
}

$deleteFriend->close();
?>
