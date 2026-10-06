<?php
require_once __DIR__ . '/../config.php';

// Admins
$res = $conn->query("SELECT user_id FROM users WHERE role = 'admin'");
$admin_ids = [];
while ($row = $res->fetch_assoc()) {
    $admin_ids[] = $row['user_id'];
}

// Adham 4 fives
$res = $conn->query("SELECT user_id FROM users WHERE name LIKE '%adham5555%' OR email LIKE '%adham5555%'");
$adham_ids = [];
while ($row = $res->fetch_assoc()) {
    $adham_ids[] = $row['user_id'];
}

$keep_ids = array_unique(array_merge($admin_ids, $adham_ids));
if (empty($keep_ids)) {
    die("Error: No accounts to keep found! Safety abort.\n");
}
$id_list = implode(',', $keep_ids);

$res = $conn->query("SELECT COUNT(*) AS c FROM users WHERE user_id NOT IN ($id_list)");
$count = $res->fetch_assoc()['c'];

if ($count > 0) {
    echo "Deleting $count users and their associated data...\n";

    // Disable foreign key checks to make deletion easier
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");

    // Delete dependent data
    // 1. chat_message
    $conn->query("DELETE FROM chat_message WHERE sender_id NOT IN ($id_list) OR receiver_id NOT IN ($id_list)");
    echo "Deleted chat messages. Rows affected: " . $conn->affected_rows . "\n";

    // 2. comment
    $conn->query("DELETE FROM comment WHERE user_id NOT IN ($id_list)");
    echo "Deleted comments. Rows affected: " . $conn->affected_rows . "\n";

    // 3. reaction
    $conn->query("DELETE FROM reaction WHERE user_id NOT IN ($id_list)");
    echo "Deleted reactions. Rows affected: " . $conn->affected_rows . "\n";

    // 4. post
    $conn->query("DELETE FROM post WHERE user_id NOT IN ($id_list)");
    echo "Deleted posts. Rows affected: " . $conn->affected_rows . "\n";

    // 5. friend
    $conn->query("DELETE FROM friend WHERE user_id1 NOT IN ($id_list) OR user_id2 NOT IN ($id_list)");
    echo "Deleted friends. Rows affected: " . $conn->affected_rows . "\n";

    // 6. routine_task
    if ($conn->query("SHOW TABLES LIKE 'routine_task'")->num_rows > 0) {
        $conn->query("DELETE FROM routine_task WHERE user_id NOT IN ($id_list)");
        echo "Deleted routine tasks. Rows affected: " . $conn->affected_rows . "\n";
    }

    // 7. social_links
    if ($conn->query("SHOW TABLES LIKE 'social_links'")->num_rows > 0) {
        $conn->query("DELETE FROM social_links WHERE user_id NOT IN ($id_list)");
        echo "Deleted social links. Rows affected: " . $conn->affected_rows . "\n";
    }
    
    // 8. admin_message
    if ($conn->query("SHOW TABLES LIKE 'admin_message'")->num_rows > 0) {
        $conn->query("DELETE FROM admin_message WHERE user_id NOT IN ($id_list) AND user_id IS NOT NULL");
        echo "Deleted admin messages. Rows affected: " . $conn->affected_rows . "\n";
    }

    // Now delete the users
    if ($conn->query("DELETE FROM users WHERE user_id NOT IN ($id_list)")) {
        echo "Successfully deleted $count accounts.\n";
    } else {
        echo "Error deleting accounts: " . $conn->error . "\n";
    }

    // Re-enable foreign key checks
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");

} else {
    echo "No accounts to delete.\n";
}
