<?php
/**
 * admin.php
 * الصفحة الرئيسية للوحة الإدارة
 * تحتوي على HTML فقط — التصميم في admin.css والمنطق في admin.js
 */
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once "includes/i18n.php";

/* ── حماية: اذهب لصفحة دخول الأدمن إذا لم تكن مسجلاً ── */
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header('Location: admin_login.php');
    exit();
}

/* ── تحميل is_super من DB إذا ما كانت بالجلسة ── */
if (!isset($_SESSION['is_super'])) {
    include 'config.php';
    $stmt = $conn->prepare("SELECT is_super_admin FROM users WHERE user_id = ?");
    $userId = (int)$_SESSION['user_id'];
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $_SESSION['is_super'] = (bool)(int)($row['is_super_admin'] ?? 0);
    $conn->close();
}

/* ── بيانات الجلسة ── */
$myId      = (int)$_SESSION['user_id'];
$myName    = $_SESSION['user_name']  ?? 'Admin';
$myEmail   = $_SESSION['user_email'] ?? '';
$isSuper   = (bool)$_SESSION['is_super'];

/* الحرف الأول للـ Avatar */
$n      = trim($myName);
$initial = $n === '' ? 'A' : (function_exists('mb_substr')
    ? mb_strtoupper(mb_substr($n, 0, 1, 'UTF-8'), 'UTF-8')
    : strtoupper(substr($n, 0, 1)));

$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Unmute — Admin Panel</title>

  <!-- خط Cairo من Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

  <!-- Font Awesome للأيقونات -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>

  <!-- Leaflet للخريطة -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

  <!-- ملف التصميم الخاص بالأدمن -->
  <link rel="stylesheet" href="css/admin.css"/>
</head>
<body>

<!-- ══════════════════════════════════════════════════
     SIDEBAR — الشريط الجانبي
     ══════════════════════════════════════════════════ -->
<aside class="sidebar" id="sidebar">

  <!-- الشعار / الرجوع للموقع -->
  <a href="dashboard.php" class="sidebar-brand">
    <span>Unmute</span>
  </a>

  <!-- معلومات الأدمن الحالي -->
  <div class="admin-profile">
    <div class="admin-avatar"><?php echo htmlspecialchars($initial); ?></div>
    <div class="admin-info">
      <strong><?php echo htmlspecialchars($myName); ?></strong>
      <span><?php echo htmlspecialchars($myEmail); ?></span>
      <?php if ($isSuper): ?>
        <em class="super-tag">⭐ Super Admin</em>
      <?php else: ?>
        <em class="admin-tag">Admin</em>
      <?php endif; ?>
    </div>
  </div>

  <!-- التنقل -->
  <nav class="sidebar-nav">

    <div class="nav-group-label"><?php echo __('admin_grp_dash'); ?></div>
    <button class="nav-btn active" data-section="home">
      <i class="fa-solid fa-chart-pie"></i>
      <span><?php echo __('admin_overview'); ?></span>
    </button>

    <div class="nav-group-label"><?php echo __('admin_grp_users'); ?></div>
    <button class="nav-btn" data-section="users">
      <i class="fa-solid fa-users"></i>
      <span><?php echo __('admin_users'); ?></span>
      <span class="nav-badge" id="bdg-users">—</span>
    </button>
    <button class="nav-btn" data-section="admins">
      <i class="fa-solid fa-user-shield"></i>
      <span><?php echo __('admin_admins'); ?></span>
      <span class="nav-badge" id="bdg-admins">—</span>
    </button>

    <div class="nav-group-label"><?php echo __('admin_grp_content'); ?></div>
    <button class="nav-btn" data-section="posts">
      <i class="fa-solid fa-newspaper"></i>
      <span><?php echo __('admin_posts'); ?></span>
      <span class="nav-badge" id="bdg-posts">—</span>
    </button>
    <button class="nav-btn" data-section="comments">
      <i class="fa-solid fa-comments"></i>
      <span><?php echo __('admin_comments'); ?></span>
      <span class="nav-badge" id="bdg-comments">—</span>
    </button>
    <button class="nav-btn" data-section="messages">
      <i class="fa-solid fa-envelope"></i>
      <span><?php echo __('admin_msgs'); ?></span>
      <span class="nav-badge" id="bdg-msgs">—</span>
    </button>
    <button class="nav-btn" data-section="tasks">
      <i class="fa-solid fa-check-circle"></i>
      <span><?php echo __('admin_tasks'); ?></span>
      <span class="nav-badge" id="bdg-tasks">—</span>
    </button>

    <div class="nav-group-label"><?php echo __('admin_grp_places'); ?></div>
    <button class="nav-btn" data-section="places">
      <i class="fa-solid fa-location-dot"></i>
      <span><?php echo __('admin_places'); ?></span>
      <span class="nav-badge" id="bdg-places">—</span>
    </button>

    <!-- هذه الأقسام للـ Super Admin فقط -->
    <button class="nav-btn <?php echo !$isSuper ? 'nav-locked' : ''; ?>"
            data-section="signs"
            <?php echo !$isSuper ? 'disabled title="' . __('admin_super_only') . '"' : ''; ?>>
      <i class="fa-solid fa-hands"></i>
      <span><?php echo __('admin_signs'); ?></span>
      <span class="nav-badge" id="bdg-signs">—</span>
    </button>
    <button class="nav-btn <?php echo !$isSuper ? 'nav-locked' : ''; ?>"
            data-section="videos"
            <?php echo !$isSuper ? 'disabled title="' . __('admin_super_only') . '"' : ''; ?>>
      <i class="fa-solid fa-video"></i>
      <span><?php echo __('admin_videos'); ?></span>
      <span class="nav-badge" id="bdg-videos">—</span>
    </button>

  </nav><!-- /sidebar-nav -->

  <!-- أزرار الأسفل -->
  <div class="sidebar-footer">
    <button class="footer-btn lang-btn" id="langBtn">
      <i class="fa-solid fa-globe"></i>
      <span id="langBtnText">English</span>
    </button>
    <a href="logout.php" class="footer-btn logout-btn">
      <i class="fa-solid fa-right-from-bracket"></i>
      <span><?php echo __('admin_logout'); ?></span>
    </a>
  </div>

</aside><!-- /sidebar -->

<!-- ══════════════════════════════════════════════════
     MAIN — المنطقة الرئيسية
     ══════════════════════════════════════════════════ -->
<div class="main-area">

  <!-- شريط العنوان العلوي -->
  <header class="topbar">
    <div class="topbar-left">
      <!-- زر فتح/إغلاق الـ Sidebar في الشاشات الصغيرة -->
      <button class="topbar-menu-btn" id="menuToggle">
        <i class="fa-solid fa-bars"></i>
      </button>
      <h1 class="page-title" id="pageTitle"><?php echo __('admin_overview'); ?></h1>
    </div>
    <div class="topbar-right">
      <span class="topbar-sub" id="topbarSub"><?php echo __('admin_panel_title'); ?></span>
      <?php if ($isSuper): ?>
        <span class="topbar-badge badge-super"><?php echo __('admin_super_badge'); ?></span>
      <?php else: ?>
        <span class="topbar-badge badge-admin"><?php echo __('admin_admin_badge'); ?></span>
      <?php endif; ?>
    </div>
  </header>

  <!-- منطقة المحتوى -->
  <div class="content-area">

    <!-- ══ SECTION: نظرة عامة ══ -->
    <section class="page-section active" id="section-home">

      <!-- بطاقات الإحصائيات -->
      <div class="stats-grid" id="statsGrid">
        <!-- تُملأ بـ JavaScript من بيانات API -->
        <div class="stats-loading"><div class="spinner"></div> <?php echo __('admin_loading'); ?></div>
      </div>


    </section>

    <!-- ══ SECTION: المستخدمون ══ -->
    <section class="page-section" id="section-users">

      <!-- رأس القسم -->
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-users"></i></div>
          <h2 class="section-title" data-i18n="users.title"><?php echo __('admin_users_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-users" placeholder="<?php echo __('admin_search_users'); ?>" oninput="renderUsers()"/>
          </div>
          <select id="filter-users" onchange="renderUsers()" class="filter-select">
            <option value="all"><?php echo __('admin_filter_all'); ?></option>
            <option value="active"><?php echo __('admin_filter_active'); ?></option>
            <option value="inactive"><?php echo __('admin_filter_inactive'); ?></option>
            <option value="deaf"><?php echo __('admin_filter_deaf'); ?></option>
            <option value="normal"><?php echo __('admin_filter_normal'); ?></option>
          </select>
          <button class="btn btn-primary" onclick="openUserModal()">
            <i class="fa-solid fa-plus"></i> <?php echo __('admin_btn_add_user'); ?>
          </button>
        </div>
      </div>

      <div class="table-container" id="table-users">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

    </section>

    <!-- ══ SECTION: الأدمن ══ -->
    <section class="page-section" id="section-admins">

      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-user-shield"></i></div>
          <h2 class="section-title"><?php echo __('admin_admins_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-admins" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderAdmins()"/>
          </div>
          <?php if ($isSuper): ?>
          <button class="btn btn-primary" onclick="openAdminModal()">
            <i class="fa-solid fa-plus"></i> <?php echo __('admin_btn_add_admin'); ?>
          </button>
          <?php else: ?>
          <span class="locked-notice"><i class="fa-solid fa-lock"></i> <?php echo __('admin_super_only'); ?></span>
          <?php endif; ?>
        </div>
      </div>

      <?php if (!$isSuper): ?>
      <div class="permission-notice">
        <i class="fa-solid fa-info-circle"></i>
        <?php echo __('admin_perm_notice_admin'); ?>
      </div>
      <?php endif; ?>

      <div class="table-container" id="table-admins">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

    </section>

    <!-- ══ SECTION: المنشورات ══ -->
    <section class="page-section" id="section-posts">

      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-newspaper"></i></div>
          <h2 class="section-title"><?php echo __('admin_posts_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-posts" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderPosts()"/>
          </div>
        </div>
      </div>

      <div class="table-container" id="table-posts">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

    </section>

    <!-- ══ SECTION: التعليقات ══ -->
    <section class="page-section" id="section-comments">

      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-comments"></i></div>
          <h2 class="section-title"><?php echo __('admin_comments_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-comments" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderComments()"/>
          </div>
        </div>
      </div>

      <div class="table-container" id="table-comments">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

    </section>

    <!-- ══ SECTION: رسائل الإدارة ══ -->
    <section class="page-section" id="section-messages">

      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-envelope"></i></div>
          <h2 class="section-title"><?php echo __('admin_msgs_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-msgs" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderMessages()"/>
          </div>
        </div>
      </div>

      <div class="table-container" id="table-msgs">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

    </section>

    <!-- ══ SECTION: المهام ══ -->
    <section class="page-section" id="section-tasks">

      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-check-circle"></i></div>
          <h2 class="section-title"><?php echo __('admin_tasks_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-tasks" placeholder="<?php echo __('admin_search_tasks'); ?>" oninput="renderTasks()"/>
          </div>
        </div>
      </div>

      <div class="table-container" id="table-tasks">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

    </section>

    <!-- ══ SECTION: الأماكن ══ -->
    <section class="page-section" id="section-places">

      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-location-dot"></i></div>
          <h2 class="section-title"><?php echo __('admin_places_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-places" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderPlaces()"/>
          </div>
          <button class="btn btn-primary" onclick="openPlaceModal()">
            <i class="fa-solid fa-plus"></i> <?php echo __('admin_btn_add_place'); ?>
          </button>
        </div>
      </div>

      <div class="table-container" id="table-places">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>

      <!-- خريطة الأماكن -->
      <div class="map-container">
        <div id="adminMap"></div>
      </div>

    </section>

    <!-- ══ SECTION: الإشارات (Super Admin) ══ -->
    <section class="page-section" id="section-signs">
      <?php if (!$isSuper): ?>
      <div class="permission-notice">
        <i class="fa-solid fa-lock"></i> <?php echo __('admin_perm_notice_super'); ?>
      </div>
      <?php else: ?>
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-hands"></i></div>
          <h2 class="section-title"><?php echo __('admin_signs_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-signs" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderSigns()"/>
          </div>
          <button class="btn btn-primary" onclick="openSignModal()">
            <i class="fa-solid fa-plus"></i> <?php echo __('admin_btn_add_sign'); ?>
          </button>
        </div>
      </div>
      <div class="table-container" id="table-signs">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>
      <?php endif; ?>
    </section>

    <!-- ══ SECTION: الفيديوهات (Super Admin) ══ -->
    <section class="page-section" id="section-videos">
      <?php if (!$isSuper): ?>
      <div class="permission-notice">
        <i class="fa-solid fa-lock"></i> <?php echo __('admin_perm_notice_super'); ?>
      </div>
      <?php else: ?>
      <div class="section-header">
        <div class="section-header-left">
          <div class="section-icon"><i class="fa-solid fa-video"></i></div>
          <h2 class="section-title"><?php echo __('admin_videos_title'); ?></h2>
        </div>
        <div class="section-header-right">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="q-videos" placeholder="<?php echo __('admin_search_general'); ?>" oninput="renderVideos()"/>
          </div>
          <button class="btn btn-primary" onclick="openVideoModal()">
            <i class="fa-solid fa-plus"></i> <?php echo __('admin_btn_add_video'); ?>
          </button>
        </div>
      </div>
      <div class="table-container" id="table-videos">
        <div class="table-loading"><div class="spinner"></div></div>
      </div>
      <?php endif; ?>
    </section>

  </div><!-- /content-area -->
</div><!-- /main-area -->

<!-- ══════════════════════════════════════════════════
     MODAL — النافذة المنبثقة للنماذج
     ══════════════════════════════════════════════════ -->
<div class="modal-overlay" id="modalOverlay">
  <div class="modal-box" id="modalBox">

    <!-- رأس الـ Modal -->
    <div class="modal-header">
      <h3 class="modal-title">
        <i class="fa-solid fa-pen" id="modalIcon"></i>
        <span id="modalTitle"><?php echo __('admin_modal_title'); ?></span>
      </h3>
      <button class="modal-close" onclick="closeModal()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- جسم الـ Modal -->
    <div class="modal-body" id="modalBody">
      <!-- يُملأ ديناميكياً بـ JavaScript -->
    </div>

    <!-- تذييل الـ Modal -->
    <div class="modal-footer" id="modalFooter">
      <!-- يُملأ ديناميكياً بـ JavaScript -->
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════════════
     CONFIRM DIALOG — نافذة تأكيد الحذف
     ══════════════════════════════════════════════════ -->
<div class="modal-overlay" id="confirmOverlay">
  <div class="confirm-box">
    <div class="confirm-icon">
      <i class="fa-solid fa-triangle-exclamation"></i>
    </div>
    <h3 id="confirmTitle"><?php echo __('admin_confirm_del'); ?></h3>
    <p id="confirmMessage"><?php echo __('admin_confirm_msg'); ?></p>
    <div class="confirm-buttons">
      <button class="btn btn-ghost btn-sm" onclick="closeConfirm()"><?php echo __('admin_btn_cancel'); ?></button>
      <button class="btn btn-danger btn-sm" id="confirmOkBtn">
        <i class="fa-solid fa-trash"></i> <?php echo __('admin_btn_confirm'); ?>
      </button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════
     TOAST — رسائل الإشعار
     ══════════════════════════════════════════════════ -->
<div class="toast-notification" id="toastNotification"></div>

<!-- ══════════════════════════════════════════════════
     SIDEBAR OVERLAY — للشاشات الصغيرة
     ══════════════════════════════════════════════════ -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<!-- ══ بيانات PHP → JavaScript ══ -->
<script>
  /* هذه المتغيرات تُرسل من PHP إلى JS */
  const PHP_DATA = {
    isSuper : <?php echo $isSuper ? 'true' : 'false'; ?>,  // هل هذا Super Admin؟
    myId    : <?php echo $myId; ?>,                          // ID الأدمن الحالي
    myName  : <?php echo json_encode($myName, JSON_UNESCAPED_UNICODE); ?>
  };
</script>

<!-- Leaflet JS للخريطة -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- ملف JavaScript الخاص بالأدمن -->
<script src="js/admin.js?v=<?php echo time(); ?>"></script>


</body>
</html>
