<?php
$files = glob('c:\xampp\htdocs\unmute\js\*.js');
foreach($files as $file) {
    if (basename($file) === 'home.js') continue; // home.js already cleaned
    $content = file_get_contents($file);
    
    // comment out setLanguage
    $content = preg_replace('/(\b)setLanguage\(/', '$1//setLanguage(', $content);
    
    // comment out addEventListener for languageBtn, accessibilityBtn, userMenuBtn, userBtn
    $content = preg_replace('/(languageBtn\??\.addEventListener\("click")/', '// $1', $content);
    $content = preg_replace('/(accessibilityBtn\??\.addEventListener\("click")/', '// $1', $content);
    $content = preg_replace('/(userMenuBtn\??\.addEventListener\("click")/', '// $1', $content);
    $content = preg_replace('/(userBtn\??\.addEventListener\("click")/', '// $1', $content);
    
    file_put_contents($file, $content);
    echo "Fixed: $file\n";
}
echo "Done";

