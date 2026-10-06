<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once __DIR__ . '/config.php';

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

$currentUserId = (int) ($_SESSION["user_id"] ?? 0);
$currentUserName = $_SESSION["user_name"] ?? "User";
$currentUserRole = $_SESSION["user_role"] ?? "normal";

function json_response(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function get_user_initial(string $name): string
{
    $name = trim($name);

    if ($name === '') {
        return 'U';
    }

    if (function_exists('mb_substr')) {
        return mb_strtoupper(mb_substr($name, 0, 1, 'UTF-8'), 'UTF-8');
    }

    return strtoupper(substr($name, 0, 1));
}

function normalize_friend_pair(int $a, int $b): array
{
    return [min($a, $b), max($a, $b)];
}
?>
