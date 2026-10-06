<?php
require_once "config.php";
$res = $conn->query("SELECT user_id, name, profile_pic FROM users");
while($row = $res->fetch_assoc()) {
    echo "ID: " . $row['user_id'] . " | Name: " . $row['name'] . " | Pic: " . $row['profile_pic'] . "\n";
}
?>

