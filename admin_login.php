<?php
/**
 * admin_login.php
 * صفحة تسجيل الدخول الخاصة بالأدمن
 * مستقلة تماماً عن صفحة تسجيل الدخول العادية
 */
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once "includes/i18n.php";

/* إذا الأدمن مسجّل بالفعل → اذهب للوحة مباشرةً */
if (isset($_SESSION['user_id']) && $_SESSION['user_role'] === 'admin') {
    header('Location: admin.php');
    exit();
}

include 'config.php';

$error = '';

/* ── معالجة نموذج الدخول ── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $identifier = trim($_POST['identifier'] ?? '');
    $password   = trim($_POST['password']   ?? '');

    if (empty($identifier) || empty($password)) {
        $error = __('err_fill_all');

    } else {
        /* نجلب المستخدم الذي له role = admin فقط */
        $stmt = $conn->prepare(
            "SELECT user_id, name, email, password, role, is_super_admin
             FROM   users
             WHERE  (email = ? OR name = ?)
             AND    role = 'admin'
             LIMIT  1"
        );
        $stmt->bind_param('ss', $identifier, $identifier);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$user) {
            /* البريد غير موجود أو ليس أدمن */
            $error = __('err_not_admin');

        } elseif (!password_verify($password, $user['password'])) {
            /* كلمة المرور خاطئة */
            $error = __('err_wrong_password');

        } else {
            /* ✅ نجح الدخول — أنشئ الجلسة */
            session_regenerate_id(true);
            $_SESSION['user_id']    = $user['user_id'];
            $_SESSION['user_name']  = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role']  = $user['role'];
            $_SESSION['is_super']   = (bool)(int)$user['is_super_admin'];

            header('Location: admin.php');
            exit();
        }
    }
}

$conn->close();

$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Unmute — Admin Login</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link rel="stylesheet" href="css/admin_login.css"/>
</head>
<body>

  <div class="login-page">

    <!-- خلفية زخرفية -->
    <div class="bg-shapes">
      <span class="shape shape-1"></span>
      <span class="shape shape-2"></span>
      <span class="shape shape-3"></span>
    </div>

    <!-- بطاقة الدخول -->
    <div class="login-card">

      <!-- الشعار -->
      <div class="brand">
        <img src="assets/platform.png" alt="Unmute Logo"/>
        <span>Unmute</span>
      </div>

      <div class="shield-badge">
        <i class="fa-solid fa-shield-halved"></i>
        <?php echo __('admin_panel'); ?>
      </div>

      <h1><?php echo __('admin_login_title'); ?></h1>
      <p class="subtitle">
        <?php echo __('admin_login_subtitle'); ?>
      </p>

      <!-- رسالة الخطأ -->
      <?php if ($error): ?>
      <div class="error-box">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span><?php echo htmlspecialchars($error); ?></span>
      </div>
      <?php endif; ?>

      <!-- نموذج الدخول -->
      <form method="POST" class="login-form" autocomplete="off">

        <div class="field">
          <label for="identifier"><?php echo __('admin_identifier'); ?></label>
          <div class="input-group">
            <i class="fa-solid fa-at"></i>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value="<?php echo htmlspecialchars($_POST['identifier'] ?? ''); ?>"
              placeholder="admin@unmute.com"
              required
              autocomplete="off"
            />
          </div>
        </div>

        <div class="field">
          <label for="password"><?php echo __('admin_password'); ?></label>
          <div class="input-group">
            <i class="fa-solid fa-lock"></i>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
            />
            <!-- زر إظهار/إخفاء كلمة المرور -->
            <button type="button" class="eye-btn" id="eyeBtn" title="إظهار/إخفاء">
              <i class="fa-solid fa-eye" id="eyeIcon"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn">
          <i class="fa-solid fa-right-to-bracket"></i>
          <?php echo __('admin_btn_login'); ?>
        </button>

      </form>

      <a href="login.php" class="back-link">
        <i class="fa-solid fa-arrow-right"></i>
        <?php echo __('admin_back_user'); ?>
      </a>

      <!-- قائمة حسابات الأدمن كتلميح -->
      <div class="accounts-hint">
        <div class="accounts-title">
          <i class="fa-solid fa-users-gear"></i>
          <?php echo __('admin_accounts_hint'); ?>
        </div>
        <div class="account-row">
          <div>
            <strong>جنى أبو صاع</strong>
            <span>jana@unmute.com</span>
          </div>
          <span class="super-tag">⭐ <?php echo __('super_admin', 'Super Admin'); ?></span>
        </div>
        <div class="account-row">
          <div><strong>أدهم هباش</strong><span>adham@unmute.com</span></div>
        </div>
        <div class="account-row">
          <div><strong>ماسة برهم</strong><span>masa@unmute.com</span></div>
        </div>
        <div class="account-row">
          <div><strong>دعاء شحرور</strong><span>doaa@unmute.com</span></div>
        </div>
      </div>

    </div><!-- /login-card -->
  </div><!-- /login-page -->

  <script>
    /* إظهار وإخفاء كلمة المرور */
    document.getElementById('eyeBtn').addEventListener('click', function () {
      const inp  = document.getElementById('password');
      const icon = document.getElementById('eyeIcon');
      if (inp.type === 'password') {
        inp.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        inp.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    });
  </script>

</body>
</html>
