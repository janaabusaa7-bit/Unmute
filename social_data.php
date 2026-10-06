<?php
require_once __DIR__ . '/social_bootstrap.php';

function table_usable(mysqli $conn, string $tableName): bool
{
    try {
        $safeName = preg_replace('/[^a-zA-Z0-9_]/', '', $tableName);
        $sql = "SELECT 1 FROM `$safeName` LIMIT 1";
        $result = $conn->query($sql);
        if ($result === false) {
            return false;
        }
        if ($result instanceof mysqli_result) {
            $result->free();
        }
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function column_exists(mysqli $conn, string $tableName, string $columnName): bool
{
    try {
        $safeTable = preg_replace('/[^a-zA-Z0-9_]/', '', $tableName);
        $safeColumn = preg_replace('/[^a-zA-Z0-9_]/', '', $columnName);
        $result = $conn->query("SHOW COLUMNS FROM `$safeTable` LIKE '$safeColumn'");
        return $result && $result->num_rows > 0;
    } catch (Throwable $e) {
        return false;
    }
}

$friendRequestUsable = table_usable($conn, 'friend_request');
$friendUsable = table_usable($conn, 'friend');

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/
$currentUserSql = "SELECT user_id, name, email, role, profile_pic FROM users WHERE user_id = ?";
$stmt = $conn->prepare($currentUserSql);

if (!$stmt) {
    json_response(["success" => false, "message" => "Prepare failed: current user"], 500);
}

$stmt->bind_param("i", $currentUserId);
$stmt->execute();
$currentUserResult = $stmt->get_result();
$currentUser = $currentUserResult->fetch_assoc();

if (!$currentUser) {
    json_response(["success" => false, "message" => "User not found"], 404);
}

/*
|--------------------------------------------------------------------------
| Members / Contacts
|--------------------------------------------------------------------------
*/
$members = [];

if ($friendUsable && $friendRequestUsable) {
    $membersSql = "
        SELECT 
            u.user_id,
            u.name,
            u.role,
            u.profile_pic,
            EXISTS (
                SELECT 1
                FROM friend f
                WHERE (f.user_one = ? AND f.user_two = u.user_id)
                   OR (f.user_two = ? AND f.user_one = u.user_id)
            ) AS is_friend,
            (
                SELECT fr.status
                FROM friend_request fr
                WHERE fr.sender_id = ? AND fr.receiver_id = u.user_id
                ORDER BY fr.request_id DESC
                LIMIT 1
            ) AS outgoing_request_status
        FROM users u
        WHERE u.user_id != ?
        ORDER BY u.name ASC
    ";

    $stmt = $conn->prepare($membersSql);

    if ($stmt) {
        $stmt->bind_param("iiii", $currentUserId, $currentUserId, $currentUserId, $currentUserId);
        $stmt->execute();
        $membersResult = $stmt->get_result();

        while ($row = $membersResult->fetch_assoc()) {
            $members[] = [
                "id" => (int) $row["user_id"],
                "name" => $row["name"],
                "role" => $row["role"],
                "initial" => get_user_initial($row["name"]),
                "profile_pic" => $row["profile_pic"],
                "is_friend" => ((int) $row["is_friend"] === 1),
                "outgoing_request_status" => $row["outgoing_request_status"] ?? null
            ];
        }
    }
} elseif ($friendUsable) {
    $membersSql = "
        SELECT 
            u.user_id,
            u.name,
            u.role,
            EXISTS (
                SELECT 1
                FROM friend f
                WHERE (f.user_one = ? AND f.user_two = u.user_id)
                   OR (f.user_two = ? AND f.user_one = u.user_id)
            ) AS is_friend
        FROM users u
        WHERE u.user_id != ?
        ORDER BY u.name ASC
    ";

    $stmt = $conn->prepare($membersSql);

    if ($stmt) {
        $stmt->bind_param("iii", $currentUserId, $currentUserId, $currentUserId);
        $stmt->execute();
        $membersResult = $stmt->get_result();

        while ($row = $membersResult->fetch_assoc()) {
            $members[] = [
                "id" => (int) $row["user_id"],
                "name" => $row["name"],
                "role" => $row["role"],
                "initial" => get_user_initial($row["name"]),
                "is_friend" => ((int) $row["is_friend"] === 1),
                "outgoing_request_status" => null
            ];
        }
    }
} else {
    $membersSql = "
        SELECT 
            u.user_id,
            u.name,
            u.role,
            u.profile_pic
        FROM users u
        WHERE u.user_id != ?
        ORDER BY u.name ASC
    ";

    $stmt = $conn->prepare($membersSql);

    if ($stmt) {
        $stmt->bind_param("i", $currentUserId);
        $stmt->execute();
        $membersResult = $stmt->get_result();

        while ($row = $membersResult->fetch_assoc()) {
            $members[] = [
                "id" => (int) $row["user_id"],
                "name" => $row["name"],
                "role" => $row["role"],
                "initial" => get_user_initial($row["name"]),
                "profile_pic" => $row["profile_pic"],
                "is_friend" => false,
                "outgoing_request_status" => null
            ];
        }
    }
}

/*
|--------------------------------------------------------------------------
| friend Requests Received
|--------------------------------------------------------------------------
*/
$friendRequests = [];

if ($friendRequestUsable) {
    try {
        $friendReqSql = "
            SELECT 
                fr.request_id,
                fr.sender_id,
                fr.status,
                fr.created_at,
                u.name
            FROM friend_request fr
            JOIN users u ON u.user_id = fr.sender_id
            WHERE fr.receiver_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        ";

        $stmt = $conn->prepare($friendReqSql);

        if ($stmt) {
            $stmt->bind_param("i", $currentUserId);
            $stmt->execute();
            $reqResult = $stmt->get_result();

            while ($req = $reqResult->fetch_assoc()) {
                $friendRequests[] = [
                    "request_id" => (int) $req["request_id"],
                    "sender_id" => (int) $req["sender_id"],
                    "name" => $req["name"],
                    "initial" => get_user_initial($req["name"]),
                    "status" => $req["status"],
                    "created_at" => $req["created_at"]
                ];
            }
        }
    } catch (Throwable $e) {
        $friendRequests = [];
    }
}

/*
|--------------------------------------------------------------------------
| Posts + Comments
|--------------------------------------------------------------------------
*/
$posts = [];

$hasArEn = column_exists($conn, 'post', 'content_ar');
$arEnCols = $hasArEn ? "p.content_ar, p.content_en," : "p.content_text AS content_ar, p.content_text AS content_en,";

$postsSql = "
    SELECT 
        p.post_id,
        p.content_text,
        $arEnCols
        p.media_url,
        p.media_type,
        p.created_at,
        p.user_id,
        u.name,
        u.profile_pic,
        (
            SELECT COUNT(*)
            FROM reaction r
            WHERE r.post_id = p.post_id
        ) AS likes_count,
        EXISTS (
            SELECT 1
            FROM reaction r2
            WHERE r2.post_id = p.post_id AND r2.user_id = ?
        ) AS liked_by_me
    FROM post p
    JOIN users u ON u.user_id = p.user_id
    ORDER BY p.created_at DESC
";

$stmt = $conn->prepare($postsSql);

if (!$stmt) {
    json_response(["success" => false, "message" => "Prepare failed: posts"], 500);
}

$stmt->bind_param("i", $currentUserId);
$stmt->execute();
$postsResult = $stmt->get_result();

while ($post = $postsResult->fetch_assoc()) {
    $comments = [];

    $commentsSql = "
        SELECT 
            c.comment_id,
            c.content,
            c.created_at,
            c.user_id,
            u.name,
            u.profile_pic
        FROM comment c
        JOIN users u ON u.user_id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ";

    $commentStmt = $conn->prepare($commentsSql);

    if ($commentStmt) {
        $postId = (int) $post["post_id"];
        $commentStmt->bind_param("i", $postId);
        $commentStmt->execute();
        $commentsResult = $commentStmt->get_result();

        while ($comment = $commentsResult->fetch_assoc()) {
            $comments[] = [
                "id" => (int) $comment["comment_id"],
                "user_id" => (int) $comment["user_id"],
                "name" => $comment["name"],
                "initial" => get_user_initial($comment["name"]),
                "profile_pic" => $comment["profile_pic"],
                "content" => $comment["content"],
                "created_at" => $comment["created_at"]
            ];
        }
    }

    $posts[] = [
        "id" => (int) $post["post_id"],
        "user_id" => (int) $post["user_id"],
        "name" => $post["name"],
        "initial" => get_user_initial($post["name"]),
        "profile_pic" => $post["profile_pic"],
        "is_mine" => ((int) $post["user_id"] === $currentUserId),
        "content" => $post["content_text"],
        "content_ar" => $post["content_ar"],
        "content_en" => $post["content_en"],
        "media_url" => $post["media_url"],
        "media_type" => $post["media_type"],
        "created_at" => $post["created_at"],
        "likes" => (int) $post["likes_count"],
        "liked_by_me" => ((int) $post["liked_by_me"] === 1),
        "comments" => $comments
    ];
}

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/
$notifications = [];

$notificationSql = "
    SELECT 
        notification_id,
        type,
        title_ar,
        title_en,
        body_ar,
        body_en,
        related_user_id,
        related_post_id,
        is_read,
        created_at
    FROM notification
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
";

$stmt = $conn->prepare($notificationSql);

if ($stmt) {
    $stmt->bind_param("i", $currentUserId);
    $stmt->execute();
    $notificationResult = $stmt->get_result();

    while ($notif = $notificationResult->fetch_assoc()) {
        $notifications[] = [
            "id" => (int) $notif["notification_id"],
            "type" => $notif["type"],
            "title_ar" => $notif["title_ar"],
            "title_en" => $notif["title_en"],
            "body_ar" => $notif["body_ar"],
            "body_en" => $notif["body_en"],
            "related_user_id" => $notif["related_user_id"] ? (int) $notif["related_user_id"] : null,
            "related_post_id" => $notif["related_post_id"] ? (int) $notif["related_post_id"] : null,
            "is_read" => ((int) $notif["is_read"] === 1),
            "created_at" => $notif["created_at"]
        ];
    }
}

/*
|--------------------------------------------------------------------------
| Conversations List
|--------------------------------------------------------------------------
*/
$conversations = [];

if ($friendUsable) {
    $conversationsSql = "
        SELECT 
            u.user_id AS other_user_id,
            u.name,
            u.profile_pic
        FROM users u
        JOIN friend f ON (f.user_one = ? AND f.user_two = u.user_id)
                      OR (f.user_two = ? AND f.user_one = u.user_id)
        ORDER BY u.name ASC
    ";

    $stmt = $conn->prepare($conversationsSql);

    if ($stmt) {
        $stmt->bind_param("ii", $currentUserId, $currentUserId);
        $stmt->execute();
        $convResult = $stmt->get_result();

        while ($conv = $convResult->fetch_assoc()) {
            $conversations[] = [
                "id" => (string) $conv["other_user_id"],
                "name" => $conv["name"],
                "initial" => get_user_initial($conv["name"]),
                "profile_pic" => $conv["profile_pic"],
                "is_bot" => false,
                "status_ar" => "عضو في المنصة",
                "status_en" => "Platform Member"
            ];
        }
    }
}

json_response([
    "success" => true,
    "current_user" => [
        "id" => (int) $currentUser["user_id"],
        "name" => $currentUser["name"],
        "email" => $currentUser["email"],
        "role" => $currentUser["role"],
        "profile_pic" => $currentUser["profile_pic"],
        "initial" => get_user_initial($currentUser["name"])
    ],
    "members" => $members,
    "friend_requests" => $friendRequests,
    "posts" => $posts,
    "notifications" => $notifications,
    "conversations" => $conversations
]);
?>
