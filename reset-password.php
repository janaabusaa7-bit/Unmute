<?php
/*
    هنا نتأكد أن السيشن شغالة
    لأننا سنستخدمها لو أردنا إظهار رسالة نجاح بعد التحديث
*/
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/*
    ملف الترجمة + الاتصال بقاعدة البيانات
*/
require_once "includes/i18n.php";
require_once "config.php";

/*
    متغيرات أساسية للصفحة
*/
$message = "";/* النص الذي سيظهر للمستخدم */
$message_type = ""; /* نوع الرسالة (نجاح أو خطأ)*/
$token = trim($_GET["token"] ?? ""); /*  التوكن القادم من الرابط*/
$resetEmail = ""; /*الإيميل المرتبط بهذا التوكن */

/*
    إذا لم يوجد توكن في الرابط
    نرجع المستخدم لصفحة نسيت كلمة المرور
*/
if ($token === "") {
    header("Location: forget.php");
    exit();
}

/*
    نبحث عن التوكن في جدول password_resets
    حتى نتأكد أن الرابط صحيح فعلًا
*/
$tokenStmt = $conn->prepare("SELECT email, expires_at FROM password_resets WHERE reset_token = ? LIMIT 1");

if (!$tokenStmt) {
    die("Database error.");
}

$tokenStmt->bind_param("s", $token);
$tokenStmt->execute();
$tokenResult = $tokenStmt->get_result();

/*
    إذا التوكن غير موجود
    نرجع المستخدم لصفحة forget
*/
if ($tokenResult->num_rows !== 1) {
    header("Location: forget.php");
    exit();
}

$tokenData = $tokenResult->fetch_assoc();
$resetEmail = $tokenData["email"];

/*
    هنا نفحص هل صلاحية التوكن انتهت أم لا
*/
if (strtotime($tokenData["expires_at"]) < time()) {
    $message = __('err_token_expired');
    $message_type = "error";
}

/*
    هذا الجزء يشتغل عند إرسال الفورم
    بشرط أن التوكن ما يكون منتهي
*/
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["reset_submit"]) && $message_type !== "error") {

    /*
        نأخذ كلمة المرور الجديدة وتأكيدها
    */
    $newPassword = trim($_POST["new_password"] ?? "");
    $confirmPassword = trim($_POST["confirm_password"] ?? "");

    /*
        فحوصات أساسية على الحقول
    */
    if ($newPassword === "" || $confirmPassword === "") {
        $message = __('err_empty_register');
        $message_type = "error";
    }
    /*
        هنا نفحص قوة كلمة المرور:
        8 أحرف على الأقل + حرف كبير + حرف صغير + رقم
    */
    elseif (
        strlen($newPassword) < 8 ||
        !preg_match('/[A-Z]/', $newPassword) ||
        !preg_match('/[a-z]/', $newPassword) ||
        !preg_match('/[0-9]/', $newPassword)
    ) {
        $message = __('err_weak_password');
        $message_type = "error";
    }
    /*
        نتأكد أن الحقلين متطابقين
    */
    elseif ($newPassword !== $confirmPassword) {
        $message = __('err_password_mismatch');
        $message_type = "error";
    }
    else {
        /*
            نشفر كلمة المرور قبل حفظها
            وهذا أهم شيء من ناحية الأمان
        */
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        /*
            نحدث كلمة المرور في جدول users حسب الإيميل
        */
        $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ? LIMIT 1");

        if ($updateStmt) {
            $updateStmt->bind_param("ss", $hashedPassword, $resetEmail);

            if ($updateStmt->execute()) {

                /*
                    بعد نجاح التحديث نحذف التوكن
                    حتى لا يُستخدم مرة ثانية
                */
                $deleteStmt = $conn->prepare("DELETE FROM password_resets WHERE reset_token = ?");
                if ($deleteStmt) {
                    $deleteStmt->bind_param("s", $token);
                    $deleteStmt->execute();
                    $deleteStmt->close();
                }

                /*
                    نخزن رسالة نجاح ونرجع المستخدم إلى login
                */
                $_SESSION["success"] = __('succ_password_updated');
                header("Location: login.php");
                exit();
            } else {
                $message = __('err_update_password');
                $message_type = "error";
            }

            $updateStmt->close();
        } else {
            $message = __('err_update_password');
            $message_type = "error";
        }
    }
}

$tokenStmt->close();

/*
    نحدد اللغة الحالية واتجاه الصفحة
*/
$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
    <meta charset="UTF-8">

    <!-- هذا السطر مهم جدًا حتى الصفحة تكون مناسبة للموبايل -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Reset Password | Unmute</title>

    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <!-- ملفات التنسيق -->
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/reset-password.css?v=3">
</head>
<body>

    <?php include 'includes/header-guest.php'; ?>

    <main class="reset-main">
        <section class="reset-container">

            <!-- عنوان الصفحة -->
            <h1 id="txtTitle"><?php echo __('reset_title'); ?></h1>

            <!-- وصف بسيط للمستخدم -->
            <p id="txtDesc"><?php echo __('reset_desc'); ?></p>

            <!-- هذا فقط لعرض الإيميل الذي سنعيد تعيين كلمة مروره -->
            <div class="reset-email-box">
                <i class="fas fa-user-circle"></i>
                <span><?php echo htmlspecialchars($resetEmail); ?></span>
            </div>

            <!-- إذا في رسالة خطأ أو نجاح نظهرها هنا -->
            <?php if (!empty($message)): ?>
                <div class="message-box <?php echo htmlspecialchars($message_type); ?>">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <!-- فورم تغيير كلمة المرور -->
            <form method="POST" action="" class="reset-form">
                <div class="input-box">
                    <input
                        type="password"
                        id="newPassword"
                        name="new_password"
                        placeholder="<?php echo __('reset_new_password_placeholder'); ?>"
                        required
                    >
                    <i class="fas fa-lock"></i>

                    <!-- زر العين لإظهار وإخفاء كلمة المرور -->
                    <button type="button" class="toggle-password-btn" data-target="newPassword" aria-label="إظهار أو إخفاء كلمة المرور">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>

                <!-- ملاحظة قوة كلمة المرور -->
                <div
                    class="password-hint"
                    id="passwordHint"
                    data-default-ar="كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم."
                    data-default-en="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
                >
                    <?php echo ($lang_code === 'ar'
                        ? 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم.'
                        : 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.'
                    ); ?>
                </div>

                <div class="input-box">
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirm_password"
                        placeholder="<?php echo __('register_confirm'); ?>"
                        required
                    >
                    <i class="fas fa-shield-alt"></i>

                    <!-- زر العين لتأكيد كلمة المرور -->
                    <button type="button" class="toggle-password-btn" data-target="confirmPassword" aria-label="إظهار أو إخفاء كلمة المرور">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>

                <!-- زر الحفظ -->
                <button class="btn-blue" id="txtBtn" name="reset_submit" type="submit">
                    <?php echo __('reset_btn'); ?>
                </button>
            </form>

            <!-- رابط العودة -->
            <a href="forget.php" class="back-link" id="txtBack">
                <?php echo __('reset_back'); ?>
            </a>

        </section>
    </main>

    <?php include 'includes/footer.php'; ?>

  
    <script src="js/reset-password.js?v=3"></script>
</body>
</html>