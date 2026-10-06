<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

$lang = $_GET['lang'] ?? 'ar';
if (in_array($lang, ['ar', 'en'])) {
    $_SESSION['lang'] = $lang;
}

$return_url = $_GET['return'] ?? 'index.php';
// Validate return_url to prevent open redirect
if (!preg_match('/^[a-zA-Z0-9_\-\.\/?&=]+$/', $return_url)) {
    $return_url = 'index.php';
}

header("Location: $return_url");
exit;

