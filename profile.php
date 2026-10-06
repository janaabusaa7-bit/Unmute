<?php
/*
    هنا نتأكد أن الجلسة شغالة
    وإذا المستخدم ليس مسجل دخول نرجعه لصفحة اللوج إن
*/
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once "config.php";
require_once "includes/i18n.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

/*
    هذه دالة خاصة بصفحة البروفايل فقط
    استخدمنا اسم مختلف حتى ما تتعارض مع دالة الهيدر
*/
function getProfileInitial($name) {
    $name = trim((string)$name);

    if ($name === "") {
        return "U";
    }

    if (function_exists("mb_substr")) {
        return mb_strtoupper(mb_substr($name, 0, 1, "UTF-8"), "UTF-8");
    }

    return strtoupper(substr($name, 0, 1));
}

/*
    هنا نحدد:
    - المستخدم الحالي الذي يشاهد الصفحة
    - صاحب البروفايل المطلوب عرضه
*/
$viewerId  = (int) $_SESSION["user_id"];
$profileId = isset($_GET["id"]) ? (int) $_GET["id"] : $viewerId;
$isOwner   = ($viewerId === $profileId);

$lang_code = $_SESSION["lang"] ?? "ar";
$dir       = $lang_code === "en" ? "ltr" : "rtl";

/*
    1) تحديث البيانات الشخصية
*/
if ($isOwner && isset($_POST["update_info"])) {
    $newName  = trim($_POST["name"] ?? "");
    $newEmail = trim($_POST["email"] ?? "");

    if ($newName !== "" && $newEmail !== "") {
        $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE user_id = ?");
        $stmt->bind_param("ssi", $newName, $newEmail, $viewerId);
        $stmt->execute();

        $_SESSION["user_name"]  = $newName;
        $_SESSION["user_email"] = $newEmail;

        $_SESSION["profile_toast"] = [
            "type" => "success",
            "text" => $lang_code === "en" ? "Profile updated successfully" : "تم تحديث البيانات بنجاح"
        ];

        header("Location: profile.php");
        exit();
    } else {
        $_SESSION["profile_toast"] = [
            "type" => "error",
            "text" => $lang_code === "en" ? "Please fill all fields" : "يرجى تعبئة جميع الحقول"
        ];

        header("Location: profile.php");
        exit();
    }
}

/*
    2) تحديث الصورة الشخصية
*/
if ($isOwner && isset($_POST["update_avatar"]) && isset($_FILES["avatar"])) {
    if (!is_dir("uploads")) {
        mkdir("uploads", 0777, true);
    }

    $file = $_FILES["avatar"];

    if ($file["error"] === 0) {
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        $allowed = ["jpg", "jpeg", "png", "webp"];

        if (in_array($ext, $allowed, true)) {
            $newFileName = "uploads/avatar_" . $viewerId . "_" . time() . "." . $ext;

            if (move_uploaded_file($file["tmp_name"], $newFileName)) {
                $stmt = $conn->prepare("UPDATE users SET profile_pic = ? WHERE user_id = ?");
                $stmt->bind_param("si", $newFileName, $viewerId);
                $stmt->execute();

                $_SESSION["user_avatar"] = $newFileName;

                $_SESSION["profile_toast"] = [
                    "type" => "success",
                    "text" => $lang_code === "en" ? "Profile picture updated" : "تم تحديث الصورة الشخصية"
                ];

                header("Location: profile.php");
                exit();
            }
        }
    }

    $_SESSION["profile_toast"] = [
        "type" => "error",
        "text" => $lang_code === "en" ? "Failed to update profile picture" : "فشل تحديث الصورة الشخصية"
    ];

    header("Location: profile.php");
    exit();
}

/*
    3) تغيير كلمة المرور
*/
if ($isOwner && isset($_POST["change_password"])) {
    $currentPassword = $_POST["current_password"] ?? "";
    $newPassword     = $_POST["new_password"] ?? "";
    $confirmPassword = $_POST["confirm_password"] ?? "";

    $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $viewerId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    $storedPassword = $result["password"] ?? "";
    $passwordOk = false;

    /*
        دعمنا حالتين:
        - إذا كلمة المرور محفوظة بـ hash
        - أو إذا كانت قديمة كنص عادي
    */
    if ($storedPassword !== "") {
        if (password_verify($currentPassword, $storedPassword)) {
            $passwordOk = true;
        } elseif ($currentPassword === $storedPassword) {
            $passwordOk = true;
        }
    }

    if (!$passwordOk) {
        $_SESSION["profile_toast"] = [
            "type" => "error",
            "text" => $lang_code === "en" ? "Current password is incorrect" : "كلمة المرور الحالية غير صحيحة"
        ];

        header("Location: profile.php?tab=security");
        exit();
    }

    if ($newPassword !== $confirmPassword) {
        $_SESSION["profile_toast"] = [
            "type" => "error",
            "text" => $lang_code === "en" ? "Passwords do not match" : "كلمتا المرور غير متطابقتين"
        ];

        header("Location: profile.php?tab=security");
        exit();
    }

    if (strlen($newPassword) < 8) {
        $_SESSION["profile_toast"] = [
            "type" => "error",
            "text" => $lang_code === "en" ? "Password must be at least 8 characters" : "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
        ];

        header("Location: profile.php?tab=security");
        exit();
    }

    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
    $stmt->bind_param("si", $newHash, $viewerId);
    $stmt->execute();

    $_SESSION["profile_toast"] = [
        "type" => "success",
        "text" => $lang_code === "en" ? "Password updated successfully" : "تم تحديث كلمة المرور بنجاح"
    ];

    header("Location: profile.php?tab=security");
    exit();
}

/*
    هنا نجيب بيانات المستخدم المطلوب عرض بروفايله
*/
$stmtUser = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
$stmtUser->bind_param("i", $profileId);
$stmtUser->execute();
$user = $stmtUser->get_result()->fetch_assoc();

if (!$user) {
    header("Location: dashboard.php");
    exit();
}

$userInitial = getProfileInitial($user["name"] ?? "User");

/*
    بعض القيم الجاهزة للعرض
*/
$roleIcon = ($user["role"] ?? "") === "deaf" ? "fa-ear-deaf" : "fa-user";
$roleLabel = ($user["role"] ?? "") === "deaf"
    ? ($lang_code === "en" ? "Deaf User" : "مستخدم أصم")
    : ($lang_code === "en" ? "Regular User" : "مستخدم عادي");

$joinDate = !empty($user["created_at"])
    ? date("Y-m-d", strtotime($user["created_at"]))
    : "-";

/*
    عدد المنشورات
*/
$stmtPosts = $conn->prepare("SELECT COUNT(*) AS total_posts FROM post WHERE user_id = ?");
$stmtPosts->bind_param("i", $profileId);
$stmtPosts->execute();
$postsCount = (int)($stmtPosts->get_result()->fetch_assoc()["total_posts"] ?? 0);

/*
    عدد المهام المنجزة وإجمالي المهام
*/
$stmtTasks = $conn->prepare("
    SELECT
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN is_done = 1 THEN 1 ELSE 0 END) AS done_tasks
    FROM routine_task
    WHERE user_id = ?
");
$stmtTasks->bind_param("i", $profileId);
$stmtTasks->execute();
$taskRow = $stmtTasks->get_result()->fetch_assoc();

$totalTasks   = (int)($taskRow["total_tasks"] ?? 0);
$doneCount    = (int)($taskRow["done_tasks"] ?? 0);
$pendingCount = max(0, $totalTasks - $doneCount);

/*
    قائمة الأصدقاء
*/
$stmtFriends = $conn->prepare("
    SELECT 
        u.user_id,
        u.name,
        u.role,
        u.profile_pic
    FROM friend f
    JOIN users u
      ON u.user_id = CASE
            WHEN f.user_one = ? THEN f.user_two
            ELSE f.user_one
         END
    WHERE f.user_one = ? OR f.user_two = ?
    ORDER BY u.name ASC
");
$stmtFriends->bind_param("iii", $profileId, $profileId, $profileId);
$stmtFriends->execute();
$resFriends = $stmtFriends->get_result();

$friendsList = [];
while ($row = $resFriends->fetch_assoc()) {
    $row["initial"] = getProfileInitial($row["name"]);
    $friendsList[] = $row;
}
$friendsCount = count($friendsList);

/*
    التوست المؤقت
*/
$profileToast = $_SESSION["profile_toast"] ?? null;
unset($_SESSION["profile_toast"]);

/*
    التاب المفتوح افتراضيًا
*/
$activeTab = $_GET["tab"] ?? ($isOwner ? "info" : "activity");
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($lang_code); ?>" dir="<?php echo htmlspecialchars($dir); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile | Unmute</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <link rel="stylesheet" href="css/global.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="css/profile.css?v=<?php echo time(); ?>">
</head>
<body>

<?php include "includes/header-user.php"; ?>

<?php if ($profileToast): ?>
<div id="profToast" class="prof-toast prof-toast--<?php echo htmlspecialchars($profileToast["type"]); ?>">
    <i class="fas <?php echo $profileToast["type"] === "success" ? "fa-check-circle" : "fa-circle-exclamation"; ?>"></i>
    <span><?php echo htmlspecialchars($profileToast["text"]); ?></span>
</div>
<?php endif; ?>

<main class="profile-main">

    <!-- القسم العلوي -->
    <section class="profile-hero">
        <div class="hero-bg-wave"></div>

        <div class="hero-body">
            <div class="avatar-ring">
                <div class="avatar-inner" id="mainAvatar">
                    <?php if (!empty($user["profile_pic"])): ?>
                        <img src="<?php echo htmlspecialchars($user["profile_pic"]); ?>" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
                    <?php else: ?>
                        <?php echo htmlspecialchars($userInitial); ?>
                    <?php endif; ?>
                </div>

                <?php if ($isOwner): ?>
                <div class="avatar-badge" onclick="document.getElementById('avatarInput').click()" title="تغيير الصورة" style="cursor:pointer;">
                    <i class="fas fa-camera"></i>
                </div>

                <form id="avatarForm" method="POST" enctype="multipart/form-data" style="display:none;">
                    <input type="hidden" name="update_avatar" value="1">
                    <input type="file" id="avatarInput" name="avatar" accept="image/*" onchange="document.getElementById('avatarForm').submit()">
                </form>
                <?php endif; ?>
            </div>

            <div class="hero-info">
                <h1 class="hero-name"><?php echo htmlspecialchars($user["name"]); ?></h1>
                <p class="hero-email"><i class="fas fa-envelope"></i> <?php echo htmlspecialchars($user["email"]); ?></p>

                <span class="role-badge role-<?php echo htmlspecialchars($user["role"]); ?>">
                    <i class="fas <?php echo htmlspecialchars($roleIcon); ?>"></i>
                    <span id="heroRoleLabel"><?php echo htmlspecialchars($roleLabel); ?></span>
                </span>
            </div>

            <div class="hero-meta">
                <i class="fas fa-calendar-alt"></i>
                <span id="joinedText"><?php echo __('prof_joined'); ?></span> <?php echo htmlspecialchars($joinDate); ?>
            </div>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <i class="fas fa-newspaper"></i>
                <strong><?php echo $postsCount; ?></strong>
                <span id="statPosts"><?php echo __('prof_post'); ?></span>
            </div>

            <div class="stat-card">
                <i class="fas fa-check-circle"></i>
                <strong><?php echo $doneCount; ?></strong>
                <span id="statDone"><?php echo __('prof_task_done'); ?></span>
            </div>

            <div class="stat-card">
                <i class="fas fa-user-friends"></i>
                <strong><?php echo $friendsCount; ?></strong>
                <span id="statFriends"><?php echo __('prof_friend'); ?></span>
            </div>
        </div>
    </section>

    <!-- التبويبات -->
    <div class="tabs-bar">
        <?php if ($isOwner): ?>
        <button class="tab-btn <?php echo $activeTab === 'info' ? 'active' : ''; ?>" data-tab="info">
            <i class="fas fa-id-card"></i>
            <span id="tabInfo"><?php echo __('prof_tab_info'); ?></span>
        </button>

        <button class="tab-btn <?php echo $activeTab === 'security' ? 'active' : ''; ?>" data-tab="security">
            <i class="fas fa-lock"></i>
            <span id="tabSecurity"><?php echo __('prof_tab_security'); ?></span>
        </button>
        <?php endif; ?>

        <button class="tab-btn <?php echo $activeTab === 'activity' ? 'active' : ''; ?>" data-tab="activity">
            <i class="fas fa-chart-line"></i>
            <span id="tabActivity"><?php echo __('prof_tab_activity'); ?></span>
        </button>

        <button class="tab-btn <?php echo $activeTab === 'friends' ? 'active' : ''; ?>" data-tab="friends">
            <i class="fas fa-user-friends"></i>
            <span id="tabFriends"><?php echo __('prof_tab_friends'); ?></span>
        </button>

        <?php if ($isOwner): ?>
        <button class="tab-btn <?php echo $activeTab === 'shortcuts' ? 'active' : ''; ?>" data-tab="shortcuts">
            <i class="fas fa-th-large"></i>
            <span id="tabShortcuts"><?php echo __('prof_tab_shortcuts'); ?></span>
        </button>
        <?php endif; ?>
    </div>

    <?php if ($isOwner): ?>
    <!-- البيانات -->
    <section class="tab-panel <?php echo $activeTab === 'info' ? 'active' : ''; ?>" id="panel-info">
        <div class="form-card">
            <div class="form-card__head">
                <i class="fas fa-user-edit"></i>
                <div>
                    <h2 id="infoCardTitle"><?php echo __('prof_edit_title'); ?></h2>
                    <p id="infoCardDesc"><?php echo __('prof_edit_desc'); ?></p>
                </div>
            </div>

            <form method="POST" class="profile-form">
                <input type="hidden" name="update_info" value="1">

                <div class="field-group">
                    <label id="lblName"><?php echo __('prof_lbl_name'); ?></label>
                    <div class="field-wrap">
                        <i class="fas fa-user"></i>
                        <input type="text" id="nameInput" name="name" value="<?php echo htmlspecialchars($user["name"]); ?>" placeholder="<?php echo __('prof_name_ph'); ?>" required>
                    </div>
                </div>

                <div class="field-group">
                    <label id="lblEmail"><?php echo __('prof_lbl_email'); ?></label>
                    <div class="field-wrap">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="emailInput" name="email" value="<?php echo htmlspecialchars($user["email"]); ?>" placeholder="<?php echo __('prof_email_ph'); ?>" required>
                    </div>
                </div>

                <div class="field-group">
                    <label id="lblRole"><?php echo __('prof_lbl_role'); ?></label>
                    <div class="field-wrap field-wrap--readonly">
                        <i class="fas <?php echo htmlspecialchars($roleIcon); ?>"></i>
                        <span id="roleDisplay"><?php echo htmlspecialchars($roleLabel); ?></span>
                        <span class="readonly-badge" id="readonlyBadge"><?php echo __('prof_readonly'); ?></span>
                    </div>
                </div>

                <button type="submit" class="save-btn">
                    <i class="fas fa-save"></i>
                    <span id="btnSaveInfo"><?php echo __('prof_btn_save'); ?></span>
                </button>
            </form>
        </div>
    </section>

    <!-- الأمان -->
    <section class="tab-panel <?php echo $activeTab === 'security' ? 'active' : ''; ?>" id="panel-security">
        <div class="form-card">
            <div class="form-card__head">
                <i class="fas fa-shield-alt"></i>
                <div>
                    <h2 id="secCardTitle"><?php echo __('prof_pw_title'); ?></h2>
                    <p id="secCardDesc"><?php echo __('prof_pw_desc'); ?></p>
                </div>
            </div>

            <form method="POST" class="profile-form">
                <input type="hidden" name="change_password" value="1">

                <div class="field-group">
                    <label id="lblCurPw"><?php echo __('prof_lbl_cur_pw'); ?></label>
                    <div class="field-wrap">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="currentPassword" name="current_password" required>
                        <button type="button" class="eye-btn" data-target="currentPassword"><i class="fas fa-eye"></i></button>
                    </div>
                </div>

                <div class="field-group">
                    <label id="lblNewPw"><?php echo __('prof_lbl_new_pw'); ?></label>
                    <div class="field-wrap">
                        <i class="fas fa-key"></i>
                        <input type="password" id="newPassword" name="new_password" oninput="checkStrength(this.value)" required>
                        <button type="button" class="eye-btn" data-target="newPassword"><i class="fas fa-eye"></i></button>
                    </div>

                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill"></div>
                    </div>
                    <p class="strength-label" id="strengthLabel"></p>

                    <div class="pw-hints">
                        <p id="hint1"><i class="fas fa-circle"></i> <span><?php echo __('prof_hint_1'); ?></span></p>
                        <p id="hint2"><i class="fas fa-circle"></i> <span><?php echo __('prof_hint_2'); ?></span></p>
                        <p id="hint3"><i class="fas fa-circle"></i> <span><?php echo __('prof_hint_3'); ?></span></p>
                        <p id="hint4"><i class="fas fa-circle"></i> <span><?php echo __('prof_hint_4'); ?></span></p>
                    </div>
                </div>

                <div class="field-group">
                    <label id="lblConfPw"><?php echo __('prof_lbl_conf_pw'); ?></label>
                    <div class="field-wrap">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="confirmPassword" name="confirm_password" required>
                        <button type="button" class="eye-btn" data-target="confirmPassword"><i class="fas fa-eye"></i></button>
                    </div>
                </div>

                <button type="submit" class="save-btn save-btn--danger">
                    <i class="fas fa-shield-alt"></i>
                    <span id="btnSavePw"><?php echo __('prof_btn_pw'); ?></span>
                </button>
            </form>
        </div>
    </section>
    <?php endif; ?>

    <!-- الإنجازات -->
    <section class="tab-panel <?php echo $activeTab === 'activity' ? 'active' : ''; ?>" id="panel-activity">
        <div class="section-title">
            <i class="fas fa-graduation-cap"></i>
            <h3 id="secLearnTitle"><?php echo __('prof_act_learning'); ?></h3>
        </div>

        <div class="learn-progress-grid">
            <div class="learn-card">
                <div class="learn-icon learn-icon--blue"><i class="fas fa-sort-numeric-up"></i></div>
                <div class="learn-info">
                    <span id="learnNumbers"><?php echo __('prof_learn_numbers'); ?></span>
                    <div class="learn-bar"><div class="learn-fill" id="lpNumbers"></div></div>
                    <strong id="lpNumbersPct">0%</strong>
                </div>
            </div>

            <div class="learn-card">
                <div class="learn-icon learn-icon--purple"><i class="fas fa-font"></i></div>
                <div class="learn-info">
                    <span id="learnLetters"><?php echo __('prof_learn_letters'); ?></span>
                    <div class="learn-bar"><div class="learn-fill" id="lpLetters"></div></div>
                    <strong id="lpLettersPct">0%</strong>
                </div>
            </div>

            <div class="learn-card">
                <div class="learn-icon learn-icon--teal"><i class="fas fa-book-open"></i></div>
                <div class="learn-info">
                    <span id="learnWords"><?php echo __('prof_learn_words'); ?></span>
                    <div class="learn-bar"><div class="learn-fill" id="lpWords"></div></div>
                    <strong id="lpWordsPct">0%</strong>
                </div>
            </div>
        </div>

        <div class="section-title" style="margin-top:32px">
            <i class="fas fa-tasks"></i>
            <h3 id="secTasksTitle"><?php echo __('prof_act_tasks'); ?></h3>
        </div>

        <div class="tasks-achievement">
            <div class="tasks-ring-wrap">
                <svg class="tasks-ring" viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#0b3d91"></stop>
                            <stop offset="100%" stop-color="#1f5fc4"></stop>
                        </linearGradient>
                    </defs>
                    <circle class="ring-bg" cx="60" cy="60" r="50"></circle>
                    <?php
                    $ringPercent = $totalTasks > 0 ? round(($doneCount / $totalTasks) * 100) : 0;
                    $circumference = 2 * pi() * 50;
                    $dash = ($ringPercent / 100) * $circumference;
                    ?>
                    <circle class="ring-fill" cx="60" cy="60" r="50"
                        stroke-dasharray="<?php echo $dash . ' ' . $circumference; ?>"></circle>
                </svg>

                <div class="ring-label">
                    <strong><?php echo $ringPercent; ?>%</strong>
                    <span id="ringDoneLabel"><?php echo __('prof_act_done'); ?></span>
                </div>
            </div>

            <div class="tasks-stats">
                <div class="tstat tstat--done">
                    <i class="fas fa-check-circle"></i>
                    <strong><?php echo $doneCount; ?></strong>
                    <span id="tstatDone"><?php echo __('prof_task_done'); ?></span>
                </div>

                <div class="tstat tstat--pending">
                    <i class="fas fa-hourglass-half"></i>
                    <strong><?php echo $pendingCount; ?></strong>
                    <span id="tstatPending"><?php echo __('prof_task_pending'); ?></span>
                </div>

                <div class="tstat tstat--total">
                    <i class="fas fa-layer-group"></i>
                    <strong><?php echo $totalTasks; ?></strong>
                    <span id="tstatTotal"><?php echo __('prof_task_total'); ?></span>
                </div>

                <?php if ($isOwner): ?>
                <a href="tasks.php" class="activity-link" id="tasksLink">
                    <?php echo __('prof_tasks_link'); ?>
                    <i class="fas <?php echo $dir === 'rtl' ? 'fa-arrow-left' : 'fa-arrow-right'; ?>"></i>
                </a>
                <?php endif; ?>
            </div>
        </div>

        <div class="section-title" style="margin-top:32px">
            <i class="fas fa-newspaper"></i>
            <h3 id="secSocialTitle"><?php echo __('prof_act_social'); ?></h3>
        </div>

        <div class="social-stat-card">
            <div class="activity-icon activity-icon--blue"><i class="fas fa-newspaper"></i></div>
            <div class="activity-info">
                <strong><?php echo $postsCount; ?></strong>
                <span id="postsDesc"><?php echo __('prof_soc_desc'); ?></span>
            </div>
            <a href="social.php" class="activity-link" id="postsLink">
                <?php echo __('prof_soc_link'); ?>
                <i class="fas <?php echo $dir === 'rtl' ? 'fa-arrow-left' : 'fa-arrow-right'; ?>"></i>
            </a>
        </div>
    </section>

    <!-- الأصدقاء -->
    <section class="tab-panel <?php echo $activeTab === 'friends' ? 'active' : ''; ?>" id="panel-friends">
        <div class="form-card">
            <div class="form-card__head">
                <i class="fas fa-user-friends"></i>
                <div>
                    <h2 id="friendsTitle"><?php echo __('prof_fr_title'); ?> (<?php echo $friendsCount; ?>)</h2>
                    <p id="friendsDesc"><?php echo __('prof_fr_desc'); ?></p>
                </div>
            </div>

            <?php if (empty($friendsList)): ?>
            <div class="empty-friends">
                <i class="fas fa-user-plus"></i>
                <p id="noFriendsText"><?php echo __('prof_fr_empty'); ?></p>

                <?php if ($isOwner): ?>
                <a href="social.php" class="save-btn" style="text-decoration:none;display:inline-flex;margin-top:14px">
                    <i class="fas fa-users"></i>
                    <span id="goSocialText"><?php echo __('prof_fr_add'); ?></span>
                </a>
                <?php endif; ?>
            </div>
            <?php else: ?>
            <div class="friends-list">
                <?php foreach ($friendsList as $f): ?>
                <div class="friend-item">
                    <div class="friend-avatar">
                        <?php echo htmlspecialchars($f["initial"]); ?>
                    </div>

                    <div class="friend-info">
                        <strong><?php echo htmlspecialchars($f["name"]); ?></strong>
                        <span class="friend-role-label" data-role="<?php echo $f["role"] === 'deaf' ? 'deaf' : 'normal'; ?>">
                            <?php echo $f["role"] === "deaf" ? "deaf" : "normal"; ?>
                        </span>
                    </div>

                    <span class="friend-badge">
                        <i class="fas fa-user-check"></i>
                        <span class="friendBadgeText"><?php echo __('prof_fr_badge'); ?></span>
                    </span>
                </div>
                <?php endforeach; ?>
            </div>

            <?php if ($friendsCount > 20): ?>
            <p class="friends-more">
                <span id="moreText"><?php echo __('prof_fr_more'); ?></span>
                <a href="social.php" id="viewAllLink"><?php echo __('prof_fr_all'); ?></a>
            </p>
            <?php endif; ?>
            <?php endif; ?>
        </div>
    </section>

    <?php if ($isOwner): ?>
    <!-- الوصول السريع -->
    <section class="tab-panel <?php echo $activeTab === 'shortcuts' ? 'active' : ''; ?>" id="panel-shortcuts">
        <div class="shortcuts-grid">
            <a href="social.php" class="shortcut-card shortcut--blue">
                <i class="fas fa-users"></i>
                <strong id="scSocial"><?php echo __('dash_card_social_title'); ?></strong>
                <span id="scSocialDesc"><?php echo __('prof_sc_social_desc'); ?></span>
            </a>

            <a href="translator.php" class="shortcut-card shortcut--teal">
                <i class="fas fa-hands"></i>
                <strong id="scTranslator"><?php echo __('prof_sc_trans'); ?></strong>
                <span id="scTranslatorDesc"><?php echo __('prof_sc_trans_desc'); ?></span>
            </a>

            <a href="Learning.php" class="shortcut-card shortcut--purple">
                <i class="fas fa-graduation-cap"></i>
                <strong id="scLearning"><?php echo __('prof_sc_learn'); ?></strong>
                <span id="scLearningDesc"><?php echo __('prof_sc_learn_desc'); ?></span>
            </a>

            <a href="map.php" class="shortcut-card shortcut--green">
                <i class="fas fa-map-marked-alt"></i>
                <strong id="scMap"><?php echo __('prof_sc_map'); ?></strong>
                <span id="scMapDesc"><?php echo __('prof_sc_map_desc'); ?></span>
            </a>

            <a href="tasks.php" class="shortcut-card shortcut--orange">
                <i class="fas fa-tasks"></i>
                <strong id="scTasks"><?php echo __('prof_sc_tasks'); ?></strong>
                <span id="scTasksDesc"><?php echo __('prof_sc_tasks_desc'); ?></span>
            </a>

            <a href="logout.php" class="shortcut-card shortcut--red">
                <i class="fas fa-sign-out-alt"></i>
                <strong id="scLogout"><?php echo __('prof_sc_out'); ?></strong>
                <span id="scLogoutDesc"><?php echo __('prof_sc_out_desc'); ?></span>
            </a>
        </div>
    </section>
    <?php endif; ?>

</main>

<script>
    /*
        مررنا بعض البيانات للـ JS
        حتى نستخدمها في الترجمة والتفاعل
    */
    window.profileData = {
        role: <?php echo json_encode($user["role"] ?? "normal"); ?>,
        isOwner: <?php echo json_encode($isOwner); ?>,
        activeTab: <?php echo json_encode($activeTab); ?>
    };
</script>

<script src="js/profile.js?v=<?php echo time(); ?>"></script>
</body>
</html>