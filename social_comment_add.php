<?php
require_once __DIR__ . '/social_bootstrap.php';

$postId = (int) ($_POST["post_id"] ?? 0);
$content = trim($_POST["content"] ?? "");

if ($postId <= 0 || $content === "") {
    json_response([
        "success" => false,
        "message" => "Invalid comment data"
    ], 422);
}

$sql = "
    INSERT INTO comment (
        content,
        created_at,
        post_id,
        user_id
    ) VALUES (?, NOW(), ?, ?)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$stmt->bind_param("sii", $content, $postId, $currentUserId);
$stmt->execute();

/* إشعار لصاحب المنشور */
$ownerSql = "SELECT user_id FROM post WHERE post_id = ?";
$ownerStmt = $conn->prepare($ownerSql);
if ($ownerStmt) {
    $ownerStmt->bind_param("i", $postId);
    $ownerStmt->execute();
    $ownerResult = $ownerStmt->get_result();
    if ($postData = $ownerResult->fetch_assoc()) {
        $postOwnerId = (int)$postData['user_id'];
        
        if ($postOwnerId !== $currentUserId) {
            $type = "comment";
            $titleAr = "تعليق جديد";
            $titleEn = "New comment";
            $bodyAr = "علّق " . $currentUserName . " على منشورك.";
            $bodyEn = $currentUserName . " commented on your post.";

            $notif = $conn->prepare("
                INSERT INTO notification (
                    user_id, type, title_ar, title_en, body_ar, body_en, related_user_id, is_read, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
            ");
            if ($notif) {
                $notif->bind_param(
                    "isssssi",
                    $postOwnerId,
                    $type,
                    $titleAr,
                    $titleEn,
                    $bodyAr,
                    $bodyEn,
                    $currentUserId
                );
                $notif->execute();
            }
        }
    }
}

json_response([
    "success" => true,
    "comment_id" => $conn->insert_id
]);
?>
