<?php
require_once "includes/i18n.php";

/*
    هذا الجزء فقط للتأكد أن السيشن شغالة
    حتى نخزن بيانات المستخدم بعد تسجيل الدخول
*/
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once "config.php";

/*
    متغيرات الرسائل
    كل وحدة منها لها وظيفة: 
*/
$login_error = "";   /*خطأ تسجيل الدخول */ 
$register_error = "";  /*خطأ التسجيل*/ 
$register_success = $_SESSION["success"] ?? ""; /*نجاح التسجيل*/ 
unset($_SESSION["success"]);

/*
    هذا المتغير يحدد أي فورم يفتح أول شيء
    افتراضيًا صفحة اللوج إن
*/
$active_view = "login";

/*
    لو دخل المستخدم برابط فيه mode=signup
    نفتح له فورم إنشاء الحساب مباشرة
*/
if (isset($_GET["mode"]) && $_GET["mode"] === "signup") {
    $active_view = "register";
}

/*
    قيم مبدئية حتى لو صار خطأ في الفورم
    ترجع الحقول معبأة بدل ما تنمسح
*/
$login_identifier_value = $_COOKIE['remember_user'] ?? "";
$login_password_value   = $_COOKIE['remember_pass'] ?? "";

$register_first_name_value = "";
$register_last_name_value  = "";
$register_email_value      = "";
$register_role_value       = "normal";

/*
    دالة بسيطة نفحص فيها هل الإيميل موجود مسبقًا
    حتى نمنع تكراره وقت التسجيل
*/
function emailExists(mysqli $conn, string $email): bool {
    $checkStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $exists = $checkResult->num_rows > 0;
    $checkStmt->close();
    return $exists;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    /*  جزء: تسجيل الدخول */
    if (isset($_POST["login_submit"])) {
        $active_view = "login";

        $loginIdentifier = trim($_POST["login_identifier"] ?? "");
        $loginPassword   = trim($_POST["login_password"] ?? "");

        $login_identifier_value = $loginIdentifier;

        if ($loginIdentifier !== "" && $loginPassword !== "") {

            /*
                هنا نبحث بالإيميل أو اسم المستخدم
                لأنه الصفحة تقبل الاثنين
            */
            $stmt = $conn->prepare("
                SELECT user_id, name, email, password, role, profile_pic
                FROM users
                WHERE email = ? OR name = ?
            ");
            $stmt->bind_param("ss", $loginIdentifier, $loginIdentifier);
            $stmt->execute();
            $result = $stmt->get_result();

            $matched_user = null;

            /*
                نمر على النتائج ونقارن كلمة المرور المشفرة
                باستخدام password_verify
            */
            if ($result->num_rows > 0) {
                while ($user = $result->fetch_assoc()) {
                    if (password_verify($loginPassword, $user["password"])) {
                        $matched_user = $user;
                        break;
                    }
                }
            }

            if ($matched_user) {

                /*
                    إذا اختار "تذكرني"
                    نخزن الاسم/الإيميل والباسورد في كوكيز
                    هذا فقط لتسهيل التجربة الحالية
                */
                if (isset($_POST['remember_me'])) {
                    setcookie('remember_user', $loginIdentifier, time() + (86400 * 30), "/");
                    setcookie('remember_pass', $loginPassword, time() + (86400 * 30), "/");
                } else {
                    setcookie('remember_user', '', time() - 3600, "/");
                    setcookie('remember_pass', '', time() - 3600, "/");
                }

                /*
                    نجدد رقم الجلسة لزيادة الأمان
                */
                session_regenerate_id(true);

                /*
                    نخزن بيانات المستخدم داخل السيشن
                    حتى نستخدمها في باقي الصفحات
                */
                $_SESSION["user_id"]     = $matched_user["user_id"];
                $_SESSION["user_name"]   = $matched_user["name"];
                $_SESSION["user_email"]  = $matched_user["email"];
                $_SESSION["user_role"]   = $matched_user["role"];
                $_SESSION["user_avatar"] = $matched_user["profile_pic"] ?? "";

                /*
                    إذا المستخدم أدمن نرسله لصفحة الأدمن
                    غير ذلك نرسله للداشبورد
                */
                if ($matched_user["role"] === "admin") {
                    header("Location: admin.php");
                } else {
                    header("Location: dashboard.php");
                }
                exit();
            } else {
                $login_error = __('err_invalid_login');
            }

            $stmt->close();
        } else {
            $login_error = __('err_empty_login');
        }
    }

    /* 
        جزء: إنشاء حساب
      */
    if (isset($_POST["register_submit"])) {
        $active_view = "register";

        /*
            هنا أخذنا الاسم الأول واسم العائلة منفصلين
            ثم جمعناهم في متغير واحد اسمه $name
            لأن قاعدة البيانات عندنا غالبًا فيها عمود name واحد فقط
        */
        $firstName = trim($_POST["register_first_name"] ?? "");
        $lastName  = trim($_POST["register_last_name"] ?? "");
        $name      = trim($firstName . " " . $lastName);

        $email           = trim($_POST["register_email"] ?? "");
        $password        = trim($_POST["register_password"] ?? "");
        $confirmPassword = trim($_POST["confirm_password"] ?? "");
        $role            = trim($_POST["user_role"] ?? "");

        /*
            نخزن القيم حتى لو صار خطأ ترجع تظهر للمستخدم
        */
        $register_first_name_value = $firstName;
        $register_last_name_value  = $lastName;
        $register_email_value      = $email;
        $register_role_value       = $role;

        /*
            نحن نسمح فقط بهذين النوعين
        */
        $allowed_roles = ["normal", "deaf"];

        /*
            هذا الجزء للتحقق من المدخلات قبل الحفظ
        */
        if ($firstName === "" || $lastName === "" || $email === "" || $password === "" || $confirmPassword === "" || $role === "") {
            $register_error = __('err_empty_register');
        } elseif (!in_array($role, $allowed_roles, true)) {
            $register_error = __('err_invalid_role');
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $register_error = __('err_invalid_email');
        } elseif (
            strlen($password) < 8 ||
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password)
        ) {
            $register_error = __('err_weak_password');
        } elseif ($password !== $confirmPassword) {
            $register_error = __('err_password_mismatch');
        } elseif (emailExists($conn, $email)) {
            /*
                هنا أهم جزء لمنع تكرار الإيميل
            */
            $register_error = __('err_email_used');
        } else {
            /*
                نشفر كلمة المرور قبل الحفظ
                وهذا أهم من تخزينها كنص عادي
            */
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            /*
                بما أننا حاليًا لا نستخدم verify-email.php
                سننشئ الحساب مباشرة كمفعّل
            */
            $insertStmt = $conn->prepare("
                INSERT INTO users (name, email, password, role, is_verified, is_active)
                VALUES (?, ?, ?, ?, 1, 1)
            ");
            $insertStmt->bind_param("ssss", $name, $email, $hashedPassword, $role);

            if ($insertStmt->execute()) {
                $register_success = __('succ_account_created');
                $active_view = "login";

                /*
                    بعد نجاح التسجيل نفرغ القيم
                */
                $register_first_name_value = "";
                $register_last_name_value  = "";
                $register_email_value      = "";
                $register_role_value       = "normal";
            } else {
                $register_error = __('err_create_failed');
            }

            $insertStmt->close();
        }
    }
}

$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Unmute | <?php echo __('login_title'); ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <link rel="stylesheet" href="css/global.css" />
    <link rel="stylesheet" href="css/login.css?v=3" />
</head>
<body>

<?php include 'includes/header-guest.php'; ?>

<main class="main-wrapper">
    <div class="container <?php echo ($active_view === 'register' ? 'active' : ''); ?>" id="container">

        <!--
            هذا الجزء الأزرق الجانبي
            فقط لعرض رسالة ترحيب وزر تبديل بين الدخول والتسجيل
        -->
        <div class="overlay-side">
            <div class="overlay-panel">
                <h1 id="overlayTitle">
                    <?php echo ($active_view === 'register' ? __('register_welcome') : __('login_welcome')); ?>
                </h1>
                <p id="overlayText">
                    <?php echo ($active_view === 'register' ? __('register_back_login') : __('login_no_account')); ?>
                </p>
                <button class="ghost-btn" id="toggleBtn" type="button">
                    <?php echo ($active_view === 'register' ? __('login_btn_ghost') : __('register_title')); ?>
                </button>
            </div>
        </div>

        <!-- 
             فورم تسجيل الدخول
              -->
        <div class="form-side login-side">
            <form action="login.php" method="POST">
                <h2 id="loginTitle"><?php echo __('login_title'); ?></h2>

                <?php if ($login_error): ?>
                    <div class="message error-message"><?php echo $login_error; ?></div>
                <?php endif; ?>

                <?php if ($register_success): ?>
                    <div class="message success-message"><?php echo $register_success; ?></div>
                <?php endif; ?>

                <div class="input-group">
                    <input
                        type="text"
                        name="login_identifier"
                        id="loginIdentifier"
                        value="<?php echo htmlspecialchars($login_identifier_value); ?>"
                        placeholder="<?php echo __('login_identifier'); ?>"
                        data-placeholder="loginUserPlaceholder"
                        autocomplete="off"
                    />
                    <i class="fas fa-user"></i>
                </div>

                <div class="input-group">
                    <input
                        type="password"
                        name="login_password"
                        id="loginPass"
                        value="<?php echo htmlspecialchars($login_password_value); ?>"
                        placeholder="<?php echo __('login_password'); ?>"
                        data-placeholder="passwordPlaceholder"
                        autocomplete="new-password"
                    />
                    <i class="fas fa-lock"></i>

                    <!--
                        هذا زر العين فقط لإظهار أو إخفاء كلمة المرور
                    -->
                    <button type="button" class="toggle-password-btn" data-target="loginPass" aria-label="إظهار أو إخفاء كلمة المرور">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>

                <div class="login-extras">
                    <label class="remember-me">
                        <input type="checkbox" name="remember_me" <?php echo isset($_COOKIE['remember_user']) ? 'checked' : ''; ?>>
                        <span><?php echo __('remember_me'); ?></span>
                    </label>

                    <a href="forget.php" class="forgot-link" id="forgotLink"><?php echo __('login_forgot'); ?></a>
                </div>

                <button type="submit" name="login_submit" class="submit-btn" id="loginBtn">
                    <?php echo __('login_submit'); ?>
                </button>

                <!--
                    هذا يظهر فقط بالموبايل
                    لأنه بالتصميم الصغير نخفي الجزء الأزرق الجانبي
                -->
                <div class="mobile-toggle-hint">
                    <span><?php echo __('login_no_account'); ?></span>
                    <a href="javascript:void(0)" onclick="document.getElementById('toggleBtn').click()">
                        <?php echo __('register_title'); ?>
                    </a>
                </div>
            </form>
        </div>

        <!--
             فورم إنشاء الحساب
             -->
        <div class="form-side register-side">
            <form action="login.php" method="POST" id="registerForm">
                <h2 id="registerTitle"><?php echo __('register_title'); ?></h2>

                <?php if ($register_error): ?>
                    <div class="message error-message"><?php echo $register_error; ?></div>
                <?php endif; ?>

                <!--
                    قسمنا الاسم إلى خانتين:
                    الأولى للاسم الأول
                    الثانية لاسم العائلة
                -->
                <div class="name-row">
                    <div class="input-group">
                        <input
                            type="text"
                            name="register_first_name"
                            value="<?php echo htmlspecialchars($register_first_name_value); ?>"
                            placeholder="<?php echo ($lang_code === 'ar' ? 'الاسم الأول' : 'First Name'); ?>"
                            autocomplete="off"
                        />
                        <i class="fas fa-user"></i>
                    </div>

                    <div class="input-group">
                        <input
                            type="text"
                            name="register_last_name"
                            value="<?php echo htmlspecialchars($register_last_name_value); ?>"
                            placeholder="<?php echo ($lang_code === 'ar' ? 'اسم العائلة' : 'Last Name'); ?>"
                            autocomplete="off"
                        />
                        <i class="fas fa-user"></i>
                    </div>
                </div>

                <div class="input-group">
                    <input
                        type="email"
                        name="register_email"
                        value="<?php echo htmlspecialchars($register_email_value); ?>"
                        placeholder="<?php echo __('register_email'); ?>"
                        data-placeholder="registerEmailPlaceholder"
                        autocomplete="off"
                    />
                    <i class="fas fa-envelope"></i>
                </div>

                <div class="input-group">
                    <input
                        type="password"
                        name="register_password"
                        id="regPass"
                        placeholder="<?php echo __('register_password'); ?>"
                        data-placeholder="passwordPlaceholder"
                    />
                    <i class="fas fa-lock"></i>
                    <button type="button" class="toggle-password-btn" data-target="regPass" aria-label="إظهار أو إخفاء كلمة المرور">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>

                <!--
                    هذا السطر فقط يعطي المستخدم فكرة عن قوة كلمة المرور
                -->
                <div
                    id="passwordStrength"
                    class="password-hint"
                    data-default-ar="استخدمي 8 أحرف على الأقل مع حرف كبير وصغير ورقم."
                    data-default-en="Use at least 8 characters with uppercase, lowercase, and a number."
                >
                    استخدمي 8 أحرف على الأقل مع حرف كبير وصغير ورقم.
                </div>

                <div class="input-group">
                    <input
                        type="password"
                        name="confirm_password"
                        id="confirmPass"
                        placeholder="<?php echo __('register_confirm'); ?>"
                        data-placeholder="confirmPasswordPlaceholder"
                    />
                    <i class="fas fa-shield-alt"></i>
                    <button type="button" class="toggle-password-btn" data-target="confirmPass" aria-label="إظهار أو إخفاء كلمة المرور">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>

                <!--
                    هنا بطاقات نوع المستخدم
                    صغّرناها وخففنا الكلام داخلها
                -->
                <div class="role-container compact-role-container">
                    <label class="role-card compact-role <?php echo ($register_role_value === 'normal' ? 'selected' : ''); ?>">
                        <input type="radio" name="user_role" value="normal" <?php echo ($register_role_value === 'normal' ? 'checked' : ''); ?>>
                        <span class="role-icon-circle"><i class="fas fa-user"></i></span>
                        <span id="roleNormalText" class="role-main-text"><?php echo ($lang_code === 'ar' ? 'مستخدم عادي' : 'Normal User'); ?></span>
                    </label>

                    <label class="role-card compact-role <?php echo ($register_role_value === 'deaf' ? 'selected' : ''); ?>">
                        <input type="radio" name="user_role" value="deaf" <?php echo ($register_role_value === 'deaf' ? 'checked' : ''); ?>>
                        <span class="role-icon-circle"><i class="fas fa-ear-deaf"></i></span>
                        <span id="roleDeafText" class="role-main-text"><?php echo ($lang_code === 'ar' ? 'صم وبكم' : 'Deaf / Mute'); ?></span>
                    </label>
                </div>

                <button type="submit" name="register_submit" class="submit-btn" id="registerSubmitBtn">
                    <?php echo __('register_submit'); ?>
                </button>

                <div class="mobile-toggle-hint">
                    <span><?php echo __('register_back_login'); ?></span>
                    <a href="javascript:void(0)" onclick="document.getElementById('toggleBtn').click()">
                        <?php echo __('login_btn_ghost'); ?>
                    </a>
                </div>
            </form>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>

<script src="js/login.js?v=3"></script>
</body>
</html>س