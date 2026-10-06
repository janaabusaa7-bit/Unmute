<?php
/*
    هنا نتأكد أن السيشن شغالة
    وإذا المستخدم مش عامل تسجيل دخول نرجعه للوج إن
*/
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once "includes/i18n.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

/*
    بيانات أساسية نحتاجها في الصفحة
*/
$userName  = $_SESSION["user_name"] ?? "User";
$lang_code = $_SESSION['lang'] ?? 'ar';
$dir       = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
    <meta charset="UTF-8">

    <!-- هذا مهم جدًا حتى الصفحة تكون مناسبة لكل الأجهزة -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Map | Unmute</title>

    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/map.css?v=2">
</head>
<body>

<?php include 'includes/header-user.php'; ?>

<main class="map-page">
    <!--
        رأس الصفحة:
        عنوان + وصف بسيط يشرح الهدف من الصفحة
    -->
    <section class="map-top">
        <div class="map-title-wrap">
            <h1 id="mainTitle"><?php echo __('map_title'); ?></h1>
            <p id="mainDesc"><?php echo __('map_desc'); ?></p>
        </div>
    </section>

    <!--
        جسم الصفحة مقسوم لجزئين:
        1) لوحة جانبية للفلاتر والنتائج
        2) الخريطة نفسها
    -->
    <section class="map-layout">

        <!-- اللوحة الجانبية -->
        <aside class="side-panel">
            <!-- تصنيفات الأماكن -->
            <div class="cat-card active" data-type="">
                <i class="fas fa-layer-group"></i>
                <span id="catAll"><?php echo __('map_cat_all'); ?></span>
            </div>

            <div class="cat-card" data-type="therapy">
                <i class="fas fa-hand-holding-medical"></i>
                <span id="catTherapy"><?php echo __('map_cat_therapy'); ?></span>
            </div>

            <div class="cat-card" data-type="entertainment">
                <i class="fas fa-smile-beam"></i>
                <span id="catEntertainment"><?php echo __('map_cat_entertainment'); ?></span>
            </div>

            <div class="cat-card" data-type="support">
                <i class="fas fa-users-cog"></i>
                <span id="catSupport"><?php echo __('map_cat_support'); ?></span>
            </div>

            <!-- أزرار الأدوات -->
            <div class="panel-tools">
                <button class="tool-btn" type="button" onclick="locateUser()">
                    <i class="fas fa-location-crosshairs"></i>
                    <span id="locateBtnText"><?php echo __('map_btn_locate'); ?></span>
                </button>

                <button class="tool-btn" type="button" onclick="findNearestPlace()">
                    <i class="fas fa-route"></i>
                    <span id="nearestBtnText"><?php echo __('map_btn_nearest'); ?></span>
                </button>

                <button class="tool-btn secondary" type="button" onclick="resetMapView()">
                    <i class="fas fa-rotate-left"></i>
                    <span id="resetBtnText"><?php echo __('map_btn_reset'); ?></span>
                </button>
            </div>

            <!-- هنا يظهر أقرب مكان -->
            <div id="nearestInfo" class="nearest-box" style="display:none;"></div>

            <!-- هنا ستظهر النتائج -->
            <div id="resList" class="results-list"></div>
        </aside>

        <!-- الخريطة -->
        <div class="map-wrapper">
            <!--
                هذا البحث أعلى الخريطة
                المستخدم يكتب اسم المدينة ويضغط Enter
            -->
            <div class="search-container">
                <div class="search-box">
                    <input
                        type="text"
                        id="cityInp"
                        placeholder="<?php echo __('map_search_ph'); ?>"
                        onkeypress="handleSearch(event)"
                    >
                    <i class="fas fa-search"></i>
                </div>
            </div>

            <div id="map"></div>
        </div>
    </section>
</main>

<?php include 'includes/footer.php'; ?>

<script>
    /*
        مررنا اسم المستخدم واللغة الحالية للـ JS
        حتى نستفيد منهم داخل الصفحة
    */
    window.currentUserName = <?php echo json_encode($userName); ?>;
    window.mapPageLang     = <?php echo json_encode($lang_code); ?>;
</script>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="js/map.js?v=2"></script>
</body>
</html>