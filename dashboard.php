<?php
/*
    هنا فقط نتأكد أن السيشن شغالة
    وإذا المستخدم مش عامل تسجيل دخول نرجعه للوج إن
*/
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

/*
    اسم المستخدم نستخدمه في رسالة الترحيب
*/
$userName = $_SESSION["user_name"] ?? "User";
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8" />

    <!-- مهم جدًا حتى الصفحة تكون مناسبة لكل الأجهزة -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Dashboard | Unmute</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <link rel="stylesheet" href="css/global.css" />
    <link rel="stylesheet" href="css/dashboard.css?v=4" />
</head>
<body>

    <?php include 'includes/header-user.php'; ?>

    <!--
        هذا التنبيه الصغير يظهر أول ما الصفحة تفتح
    -->
    <div class="welcome-toast" id="welcomeToast">
        <span class="toast-emoji">👋</span>
        <span id="welcomeText">مرحبًا بك مجددًا</span>
        <strong id="welcomeUserName"><?php echo htmlspecialchars($userName); ?></strong>
    </div>

    <main class="dashboard-main">
        <section class="cards-grid">

            <!--
                كل كارد له id خاص في العنوان والوصف
                حتى نقدر نغير النص بسهولة بالجافاسكربت
            -->
            <article class="dash-card card-social" onclick="location.href='social.php'">
                <div class="card-icon"><i class="fas fa-users"></i></div>
                <h3 id="cardSocialTitle">الموجز الاجتماعي</h3>
                <p id="cardSocialDesc">شارك وتفاعل مع مجتمعك بسهولة.</p>
                <span class="card-arrow" id="arrowSocial">←</span>
            </article>

            <article class="dash-card card-translate" onclick="location.href='translator.php'">
                <div class="card-icon"><i class="fas fa-comments"></i></div>
                <h3 id="cardTranslateTitle">الترجمة الفورية</h3>
                <p id="cardTranslateDesc">تواصل مع الجميع في أي وقت.</p>
                <span class="card-arrow" id="arrowTranslate">←</span>
            </article>

            <article class="dash-card card-skills" onclick="location.href='Learning.php'">
                <div class="card-icon"><i class="fas fa-graduation-cap"></i></div>
                <h3 id="cardSkillsTitle">تنمية المهارات</h3>
                <p id="cardSkillsDesc">طوّر مهاراتك من خلال الدروس والأنشطة.</p>
                <span class="card-arrow" id="arrowSkills">←</span>
            </article>

            <article class="dash-card card-map" onclick="location.href='map.php'">
                <div class="card-icon"><i class="fas fa-map-marked-alt"></i></div>
                <h3 id="cardMapTitle">خريطة الأماكن</h3>
                <p id="cardMapDesc">اكتشف الأماكن الصديقة للصم.</p>
                <span class="card-arrow" id="arrowMap">←</span>
            </article>

            <article class="dash-card card-tasks" onclick="location.href='tasks.php'">
                <div class="card-icon"><i class="fas fa-calendar-check"></i></div>
                <h3 id="cardTasksTitle">جدول المهام</h3>
                <p id="cardTasksDesc">نظم أهدافك التعليمية اليومية.</p>
                <span class="card-arrow" id="arrowTasks">←</span>
            </article>

        </section>
    </main>

    <?php include 'includes/footer.php'; ?>

    <script>
        /*
            مررنا اسم المستخدم للـ JS حتى نستخدمه في الترحيب
        */
        window.dashboardUserName = <?php echo json_encode($userName); ?>;
    </script>

    <script src="js/dashboard.js?v=4"></script>
</body>
</html>