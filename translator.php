<?php
// بدء جلسة المستخدم (Session) للحفاظ على تسجيل الدخول
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once "includes/i18n.php";

// التحقق مما إذا كان المستخدم مسجلاً للدخول، وإذا لم يكن كذلك يتم توجيهه لصفحة تسجيل الدخول
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

// تخزين اسم المستخدم في متغير لاستخدامه لاحقاً، أو إعطاء قيمة افتراضية "User"
$userName = $_SESSION["user_name"] ?? "User";

$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<!-- تحديد لغة الصفحة كعربية واتجاه النص من اليمين لليسار -->
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
    <!-- تحديد ترميز الحروف ليدعم اللغة العربية -->
    <meta charset="UTF-8">
    <!-- جعل الصفحة متجاوبة مع شاشات الهواتف المحمولة -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- عنوان الصفحة الذي يظهر في علامة تبويب المتصفح -->
    <title>Translator | Unmute</title>

    <!-- روابط خارجية لتحميل خطوط Google (Cairo) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    
    <!-- رابط لتحميل مكتبة الأيقونات (FontAwesome) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <!-- ربط ملف التنسيق الأساسي للموقع (CSS) -->
    <link rel="stylesheet" href="css/global.css">
    <!-- ربط ملف التنسيق الخاص بصفحة المترجم (CSS) -->
    <link rel="stylesheet" href="css/translator.css">

    <!-- تحميل مكتبات MediaPipe الخاصة بجوجل لتشغيل الذكاء الاصطناعي وتتبع حركة اليد -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
</head>
<body>

<!-- استدعاء ملف رأس الصفحة (Header) الذي يحتوي على القوائم العلوية -->
<?php include 'includes/header-user.php'; ?>

<!-- الحاوية الرئيسية لصفحة المترجم -->
<main class="translator-page">
    <!-- القسم الخاص بخلفية وتصميم واجهة المترجم -->
    <section class="translator-shell">
        <!-- البطاقة البيضاء التي تحتوي على أدوات المترجم -->
        <div class="translator-card">
            
            <!-- عنوان ووصف المترجم -->
            <div class="translator-head">
                <!-- العنوان الرئيسي للصفحة -->
                <h1 id="mainTitle"><?php echo __('trans_title'); ?></h1>
                <!-- نص فرعي يشرح طريقة عمل المترجم -->
                <p id="mainDesc"><?php echo __('trans_desc'); ?></p>
            </div>

            <!-- حاوية حقل إدخال النص -->
            <div class="input-container">
                <!-- مربع النص الذي يكتب فيه المستخدم ليتم ترجمته -->
                <input
                    type="text"
                    id="textInput"
                    placeholder="<?php echo __('trans_input_ph'); ?>"
                    oninput="doTranslate()"
                    autocomplete="off"
                >
            </div>

            <!-- حاوية أزرار التحكم (الصوت، الكاميرا، المسح) -->
            <div class="control-btns">
                <!-- زر تشغيل الميكروفون للترجمة الصوتية -->
                <button class="btn btn-mic" type="button" onclick="startMic()">
                    <i class="fas fa-microphone"></i>
                    <span id="vLabel"><?php echo __('trans_btn_mic'); ?></span>
                </button>

                <!-- زر تشغيل الكاميرا لتتبع حركة اليد -->
                <button class="btn btn-cam" type="button" onclick="startCam()">
                    <i class="fas fa-video"></i>
                    <span id="cLabel"><?php echo __('trans_btn_cam'); ?></span>
                </button>

                <!-- زر مسح النص والنتيجة لإعادة البدء -->
                <button class="btn btn-clear" type="button" onclick="clearTranslation()">
                    <i class="fas fa-eraser"></i>
                    <span id="clearLabel"><?php echo __('trans_btn_clear'); ?></span>
                </button>
            </div>

            <!-- حاوية عرض الكاميرا والرسم المباشر (تظهر عند تشغيل الكاميرا) -->
            <div id="videoContainer" class="video-container" style="position: relative;">
                <!-- عنصر الفيديو المخفي الذي يعرض الكاميرا -->
                <video id="webCam" autoplay playsinline style="display: block; width: 100%; height: auto; transform: scaleX(-1);"></video>
                <!-- مساحة الرسم (Canvas) التي تُرسم عليها خطوط معالم اليد من الذكاء الاصطناعي -->
                <canvas id="output_canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: scaleX(-1); pointer-events: none;"></canvas>
            </div>

            <!-- اللوحة التي تظهر فيها النتيجة (صور لغة الإشارة) -->
            <div class="result-board" id="resultBoard">
                <!-- نص افتراضي يظهر قبل البدء بالترجمة -->
                <p id="placeholder"><?php echo __('trans_placeholder'); ?></p>
            </div>
        </div>
    </section>
</main>

<!-- استدعاء ملف تذييل الصفحة (Footer) -->
<?php include 'includes/footer.php'; ?>

<!-- تمرير بيانات المستخدم من الـ PHP إلى الـ JavaScript -->
<script>
    window.currentUserName = <?php echo json_encode($userName); ?>;
    window.currentUserInitial = <?php echo json_encode($userName[0] ?? 'U'); ?>;
</script>

<!-- استدعاء ملف الجافاسكريبت الخاص بمنطق المترجم (مع كاسر الكاش لتجنب التخزين المؤقت) -->
<script src="js/translator.js?v=<?= time() ?>"></script>
</body>
</html>
