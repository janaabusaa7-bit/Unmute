<?php
require_once __DIR__ . '/social_bootstrap.php';

$postId = (int) ($_POST["post_id"] ?? 0);

if ($postId <= 0) {
    json_response([
        "success" => false,
        "message" => "Invalid post id"
    ], 422);
}

$checkSql = "
    SELECT reaction_id
    FROM reaction
    WHERE post_id = ? AND user_id = ?
";

$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {
    json_response([
        "success" => false,
        "message" => "Prepare failed"
    ], 500);
}

$checkStmt->bind_param("ii", $postId, $currentUserId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($existing = $checkResult->fetch_assoc()) {
    $reactionId = (int) $existing["reaction_id"];

    $deleteSql = "DELETE FROM reaction WHERE reaction_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);

    if (!$deleteStmt) {
        json_response([
            "success" => false,
            "message" => "Delete prepare failed"
        ], 500);
    }

    $deleteStmt->bind_param("i", $reactionId);
    $deleteStmt->execute();

    json_response([
        "success" => true,
        "liked" => false
    ]);
} else {
    $type = "like";

    $insertSql = "
        INSERT INTO reaction (type, post_id, user_id)
        VALUES (?, ?, ?)
    ";

    $insertStmt = $conn->prepare($insertSql);

    if (!$insertStmt) {
        json_response([
            "success" => false,
            "message" => "Insert prepare failed"
        ], 500);
    }

    $insertStmt->bind_param("sii", $type, $postId, $currentUserId);
    $insertStmt->execute();

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
                $typeNotif = "like";
                $titleAr = "إعجاب جديد";
                $titleEn = "New like";
                $bodyAr = "أعجب " . $currentUserName . " بمنشورك.";
                $bodyEn = $currentUserName . " liked your post.";

                $notif = $conn->prepare("
                    INSERT INTO notification (
                        user_id, type, title_ar, title_en, body_ar, body_en, related_user_id, is_read, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())
                ");
                if ($notif) {
                    $notif->bind_param(
                        "isssssi",
                        $postOwnerId,
                        $typeNotif,
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
        "liked" => true
    ]);
}
?>
