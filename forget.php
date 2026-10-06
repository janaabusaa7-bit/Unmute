<?php

session_start();

require_once "config.php";

/*
    هذا ملف إرسال الإيميل
    وهو الذي يرسل رابط إعادة التعيين للمستخدم
*/
require_once "mail_helper.php";

/*
    متغيرات الرسائل حتى نظهر للمستخدم
    هل العملية نجحت أو صار خطأ
*/
$message = "";
$message_type = "";
$email_value = "";

/*
    هذا الجزء يشتغل فقط لما المستخدم يضغط زر الإرسال
*/
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["forget_submit"])) {

    /*
        نأخذ الإيميل من الفورم
        ونحذف الفراغات من البداية والنهاية
    */
    $email = trim($_POST["email"] ?? "");
    $email_value = $email;

    /*
        أول شيء: نتأكد أن الحقل ليس فارغًا
    */
    if ($email === "") {
        $message = "يرجى إدخال البريد الإلكتروني.";
        $message_type = "error";
    }

    /*
        ثاني شيء: نتأكد أن الإيميل بصيغة صحيحة
    */
    elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "يرجى إدخال بريد إلكتروني صحيح.";
        $message_type = "error";
    }

    else {
        /*
            هنا نبحث عن المستخدم في جدول users حسب الإيميل
        */
        $stmt = $conn->prepare("SELECT user_id, name, email, is_active FROM users WHERE email = ? LIMIT 1");

        if ($stmt) {
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            /*
                إذا وجدنا المستخدم
            */
            if ($result && $result->num_rows === 1) {
                $user = $result->fetch_assoc();

                /*
                    نتأكد أن الحساب نشط
                    إذا الحساب غير نشط لا نرسل رابط إعادة التعيين
                */
                if ((int)$user["is_active"] !== 1) {
                    $message = "هذا الحساب غير نشط حاليًا. يرجى التواصل مع الإدارة.";
                    $message_type = "error";
                } else {

                    /*
                        ننشئ توكن عشوائي وآمن
                        هذا التوكن سيوضع في رابط إعادة التعيين
                    */
                    $token = bin2hex(random_bytes(32));

                    /*
                        صلاحية الرابط ساعة واحدة فقط
                    */
                    $expires_at = date("Y-m-d H:i:s", strtotime("+1 hour"));

                    /*
                        نحذف أي طلبات قديمة لنفس الإيميل
                        حتى لا تتراكم التوكنات القديمة
                    */
                    $deleteOld = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
                    if ($deleteOld) {
                        $deleteOld->bind_param("s", $email);
                        $deleteOld->execute();
                        $deleteOld->close();
                    }

                    /*
                        نحفظ طلب إعادة التعيين الجديد في الجدول
                    */
                    $insert = $conn->prepare("INSERT INTO password_resets (email, reset_token, expires_at) VALUES (?, ?, ?)");

                    if ($insert) {
                        $insert->bind_param("sss", $email, $token, $expires_at);

                        if ($insert->execute()) {

                            /*
                                هنا نجهز رابط reset-password.php
                                ونرسل معه التوكن
                            */
                            $baseUrl = rtrim(APP_BASE_URL, '/');
                            $resetLink = $baseUrl . "/reset-password.php?token=" . urlencode($token);

                            /*
                                عنوان الرسالة
                            */
                            $subject = "إعادة تعيين كلمة المرور | Unmute";

                            /*
                                محتوى الرسالة  
                            */
                            $body = '
                            <div style="font-family:Cairo,Arial,sans-serif; direction:rtl; text-align:right; color:#1f2937; line-height:1.9; max-width:650px; margin:auto;">
                                <h2 style="color:#0b3d91; margin-bottom:10px;">إعادة تعيين كلمة المرور</h2>
                                <p>مرحبًا ' . htmlspecialchars($user["name"]) . '،</p>
                                <p>تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة <strong>Unmute</strong>.</p>
                                <p>اضغط على الزر التالي لإعادة تعيين كلمة المرور:</p>

                                <p style="margin:25px 0;">
                                    <a href="' . htmlspecialchars($resetLink) . '" 
                                       style="background:#0b3d91;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;display:inline-block;font-weight:bold;">
                                       إعادة تعيين كلمة المرور
                                    </a>
                                </p>

                                <p>أو انسخ الرابط التالي وافتحه في المتصفح:</p>
                                <p style="direction:ltr; text-align:left; background:#f3f6fb; padding:10px; border-radius:8px; word-break:break-all;">
                                    ' . htmlspecialchars($resetLink) . '
                                </p>

                                <p>صلاحية هذا الرابط: <strong>ساعة واحدة فقط</strong>.</p>
                                <p>إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.</p>

                                <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;">
                                <p style="color:#6b7280; font-size:14px;">Unmute Platform</p>
                            </div>';

                            /*
                                 ننادي دالة الإرسال
                            */
                            $sendResult = sendPlatformEmail($email, $user["name"], $subject, $body);

                            /*
                                إذا الإرسال نجح
                            */
                            if (!empty($sendResult["success"])) {
                                $message = "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.";
                                $message_type = "success";
                                $email_value = "";
                            } else {
                                $message = "تعذر إرسال الرسالة حاليًا: " . ($sendResult["message"] ?? "خطأ غير معروف");
                                $message_type = "error";
                            }
                        } else {
                            $message = "حدث خطأ أثناء حفظ طلب إعادة التعيين.";
                            $message_type = "error";
                        }

                        $insert->close();
                    } else {
                        $message = "حدث خطأ في تجهيز طلب إعادة التعيين.";
                        $message_type = "error";
                    }
                }
            } else {
                $message = "هذا البريد غير مسجل في المنصة.";
                $message_type = "error";
            }

            $stmt->close();
        } else {
            $message = "حدث خطأ في الاتصال بقاعدة البيانات.";
            $message_type = "error";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">

    <!-- عشان الصفحة تستجيب لكل الأجهزة -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>نسيت كلمة المرور | Unmute</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

   
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/forget.css?v=20">
</head>
<body>

<?php include 'includes/header-guest.php'; ?>

<main class="forget-main">
    <section class="forget-card">
        <div class="forget-top-icon">
            <i class="fas fa-lock"></i>
        </div>

        <h1 id="txtTitle">نسيت كلمة المرور</h1>

        <p class="forget-subtitle" id="txtDesc">
            أدخل بريدك الإلكتروني المرتبط بحسابك وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور.
        </p>

        <p class="forget-note" id="txtNote">
            <i class="fas fa-circle-info"></i>
            <span id="txtNoteSpan">رابط إعادة التعيين صالح لمدة ساعة واحدة فقط.</span>
        </p>

        <!-- إذا في رسالة من السيرفر نظهرها هنا -->
        <?php if (!empty($message)): ?>
            <div class="message-box <?php echo htmlspecialchars($message_type); ?>" id="serverMessage">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="" class="forget-form" id="forgetForm" novalidate>
            <div class="input-box">
                <input
                    type="email"
                    name="email"
                    id="emailInput"
                    placeholder="أدخل البريد الإلكتروني"
                    value="<?php echo htmlspecialchars($email_value); ?>"
                    data-placeholder="emailPlaceholder"
                    required
                >
                <i class="fas fa-envelope input-icon"></i>
            </div>

            <button type="submit" name="forget_submit" class="forget-btn" id="forgetBtn">
                إرسال رابط إعادة التعيين
            </button>
        </form>

        <a href="login.php" class="back-link" id="txtBack">
            العودة إلى تسجيل الدخول
        </a>
    </section>
</main>

<?php include 'includes/footer.php'; ?>


<script src="js/forget.js?v=20"></script>
</body>
</html>