<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

header("Content-Type: application/json; charset=utf-8");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "config.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized - user_id not found in session"
    ]);
    exit();
}

$userId = (int) $_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);
$action = $data["action"] ?? "";

if ($action === "list") {
    $stmt = $conn->prepare("SELECT task_id, title, task_day, task_time, icon, is_done, sort_order FROM routine_task WHERE user_id = ? ORDER BY sort_order ASC, task_time ASC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    echo json_encode(["success" => true, "tasks" => $tasks]);
    exit();
}

if ($action === "create") {
    $title = trim($data["title"] ?? "");
    $task_day = trim($data["task_day"] ?? "");
    $task_time = trim($data["task_time"] ?? "");
    $icon = trim($data["icon"] ?? "fa-book");

    if ($title === "" || $task_time === "") {
        echo json_encode([
            "success" => false,
            "message" => "Missing title or time"
        ]);
        exit();
    }

    $stmtOrder = $conn->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM routine_task WHERE user_id = ?");
    $stmtOrder->bind_param("i", $userId);
    $stmtOrder->execute();
    $orderResult = $stmtOrder->get_result();

    $nextOrder = 1;
    if ($row = $orderResult->fetch_assoc()) {
        $nextOrder = (int)$row["next_order"];
    }

    $stmt = $conn->prepare("INSERT INTO routine_task (user_id, title, task_day, task_time, icon, is_done, sort_order) VALUES (?, ?, ?, ?, ?, 0, ?)");
    $stmt->bind_param("issssi", $userId, $title, $task_day, $task_time, $icon, $nextOrder);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => $stmt->error
        ]);
    }
    exit();
}

if ($action === "update") {
    $task_id = (int) ($data["task_id"] ?? 0);
    $title = trim($data["title"] ?? "");
    $task_day = trim($data["task_day"] ?? "");
    $task_time = trim($data["task_time"] ?? "");
    $icon = trim($data["icon"] ?? "fa-book");

    $stmt = $conn->prepare("UPDATE routine_task SET title = ?, task_day = ?, task_time = ?, icon = ? WHERE task_id = ? AND user_id = ?");
    $stmt->bind_param("ssssii", $title, $task_day, $task_time, $icon, $task_id, $userId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => $stmt->error
        ]);
    }
    exit();
}

if ($action === "toggle_done") {
    $task_id = (int) ($data["task_id"] ?? 0);

    $stmt = $conn->prepare("UPDATE routine_task SET is_done = 1 - is_done WHERE task_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $task_id, $userId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => $stmt->error
        ]);
    }
    exit();
}

if ($action === "delete") {
    $task_id = (int) ($data["task_id"] ?? 0);

    $stmt = $conn->prepare("DELETE FROM routine_task WHERE task_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $task_id, $userId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => $stmt->error
        ]);
    }
    exit();
}

if ($action === "reorder") {
    $orderedIds = $data["ordered_ids"] ?? [];

    if (!is_array($orderedIds)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid order data"
        ]);
        exit();
    }

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("UPDATE routine_task SET sort_order = ? WHERE task_id = ? AND user_id = ?");
        $order = 1;

        foreach ($orderedIds as $taskId) {
            $taskId = (int)$taskId;
            $stmt->bind_param("iii", $order, $taskId, $userId);
            $stmt->execute();
            $order++;
        }

        $conn->commit();
        echo json_encode(["success" => true]);
    } catch (Throwable $e) {
        $conn->rollback();
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
    exit();
}

echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);
