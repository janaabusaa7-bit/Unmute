<?php
$dir = new RecursiveDirectoryIterator('c:\xampp\htdocs\unmute');
$ite = new RecursiveIteratorIterator($dir);
$files = new RegexIterator($ite, '/^.+\.php$/i', RecursiveRegexIterator::GET_MATCH);

foreach($files as $file) {
    $path = $file[0];
    if (strpos($path, 'i18n.php') !== false || strpos($path, 'header-user.php') !== false) continue;

    $content = file_get_contents($path);
    // Replace standalone session_start();
    $new_content = preg_replace('/^\s*session_start\(\);\s*$/m', 'if (session_status() === PHP_SESSION_NONE) { session_start(); }' . "\n", $content);

    if ($content !== $new_content) {
        file_put_contents($path, $new_content);
        echo 'Fixed: ' . $path . "\n";
    }
}
echo 'Done';

