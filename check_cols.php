<?php
require_once 'config.php';
$res = $conn->query("SELECT * FROM places LIMIT 1");
$row = $res->fetch_assoc();
if ($row) {
    echo "Columns: " . implode(", ", array_keys($row)) . "\n";
} else {
    echo "Table is empty!\n";
}
?>

