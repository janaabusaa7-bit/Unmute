<?php
session_start();
require_once "config.php";

echo "<h3>فحص حالة الصورة الشخصية</h3>";

if (!isset($_SESSION['user_id'])) {
    echo "المستخدم غير مسجل دخول.";
    exit();
}

$uid = $_SESSION['user_id'];
echo "رقم المستخدم: " . $uid . "<br>";
echo "اسم المستخدم في الجلسة: " . ($_SESSION['user_name'] ?? 'غير موجود') . "<br>";
echo "مسار الصورة في الجلسة: " . ($_SESSION['user_avatar'] ?? 'فارغ') . "<br>";

$stmt = $conn->prepare("SELECT profile_pic, name FROM users WHERE user_id = ?");
$stmt->bind_param("i", $uid);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();

echo "مسار الصورة في قاعدة البيانات: " . ($res['profile_pic'] ?? 'فارغ') . "<br>";
echo "الاسم في قاعدة البيانات: " . ($res['name'] ?? 'غير موجود') . "<br>";

if (!empty($res['profile_pic'])) {
    if (file_exists($res['profile_pic'])) {
        echo "<b style='color:green'>الملف موجود فعلياً في السيرفر.</b><br>";
        echo "عرض الصورة للتجربة: <br><img src='".$res['profile_pic']."' style='width:100px; height:100px; border:2px solid red;'>";
    } else {
        echo "<b style='color:red'>الملف غير موجود في المسار المحدد على السيرفر!</b><br>";
        echo "المسار الذي تم البحث عنه: " . realpath($res['profile_pic']);
    }
} else {
    echo "لا يوجد مسار صورة مخزن للمستخدم.";
}
?>

