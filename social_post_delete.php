<?php
require_once __DIR__ . '/social_bootstrap.php';

$postId = (int) ($_POST["post_id"] ?? 0);

if ($postId <= 0) {
    json_response([
        "success" => false,
        "message" => "Invalid post id"
    ], 422);
}

/* نحذف أولًا ما يتعلق بالمنشور */
$deleteComments = $conn->prepare("DELETE FROM comment WHERE post_id = ?");
if ($deleteComments) {
    $deleteComments->bind_param("i", $postId);
    $deleteComments->execute();
}

$deleteReactions = $conn->prepare("DELETE FROM reaction WHERE post_id = ?");
if ($deleteReactions) {
    $deleteReactions->bind_param("i", $postId);
    $deleteReactions->execute();
}

/* ثم نحذف المنشور نفسه إذا كان يخص المستخدم الحالي */
$deletePost = $conn->prepare("DELETE FROM post WHERE post_id = ? AND user_id = ?");

if (!$deletePost) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$deletePost->bind_param("ii", $postId, $currentUserId);
$deletePost->execute();

json_response([
    "success" => true
]);
?>
