<?php
/*
    هنا نتأكد أن السيشن شغالة
    وإذا المستخدم مش مسجل دخول نرجعه للوج إن
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
    نأخذ بيانات المستخدم واللغة الحالية
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

    <title>Tasks | Unmute</title>

    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/tasks.css?v=2">
</head>
<body>

<?php include 'includes/header-user.php'; ?>

<main class="tasks-page">
    <!--
        هذا رأس الصفحة:
        عنوان + وصف + زر إضافة مهمة
    -->
    <section class="tasks-header">
        <div class="tasks-header-text">
            <h1 id="mainTitle"><?php echo __('tasks_title'); ?></h1>
            <p id="subTitle"><?php echo __('tasks_subtitle'); ?></p>
        </div>

        <button class="primary-add-btn" id="btnAdd" type="button" onclick="openTaskModal()">
            <?php echo __('tasks_add_btn'); ?>
        </button>
    </section>

    <!--
        هنا أدوات الصفحة:
        البحث + الفلاتر
    -->
    <section class="tasks-tools">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="taskSearch" placeholder="<?php echo __('tasks_search_ph'); ?>">
        </div>

        <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all" id="filterAll"><?php echo __('tasks_filter_all'); ?></button>
            <button class="filter-btn" data-filter="pending" id="filterPending"><?php echo __('tasks_filter_pending'); ?></button>
            <button class="filter-btn" data-filter="done" id="filterDone"><?php echo __('tasks_filter_done'); ?></button>
        </div>
    </section>

    <!--
        هذا الملخص السريع:
        كل المهام / المنجزة / المتبقية
    -->
    <section class="tasks-summary">
        <div class="summary-pill" id="summaryAll">
            <?php echo __('tasks_sum_all'); ?>:
            <span id="totalTasksCount">0</span>
        </div>

        <div class="summary-pill done-pill" id="summaryDone">
            <?php echo __('tasks_sum_done'); ?>:
            <span id="doneTasksCount">0</span>
        </div>

        <div class="summary-pill pending-pill" id="summaryPending">
            <?php echo __('tasks_sum_pending'); ?>:
            <span id="pendingTasksCount">0</span>
        </div>
    </section>

    <!-- هنا الجافاسكربت سيعرض الكروت -->
    <section id="taskGrid" class="task-grid"></section>

    <!-- هذه الحالة تظهر إذا ما في مهام -->
    <div id="emptyState" class="empty-state" style="display:none;">
        <i class="fas fa-calendar-check"></i>
        <h3 id="emptyTitle"><?php echo __('tasks_empty_title'); ?></h3>
        <p id="emptyDesc"><?php echo __('tasks_empty_desc'); ?></p>
    </div>
</main>

<!--
    هذا مودال الإضافة / التعديل
    نستخدمه للحالتين حسب إذا في editId أو لا
-->
<div id="taskModal" class="modal-overlay">
    <div class="modal-card">
        <button class="close-x" id="closeTaskModal" type="button" onclick="closeTaskModal()">&times;</button>

        <h3 id="mTitle"><?php echo __('tasks_modal_add'); ?></h3>

        <label for="taskName" id="labelTaskName"><?php echo __('tasks_lbl_name'); ?></label>
        <input type="text" id="taskName" placeholder="<?php echo __('tasks_name_ph'); ?>">

        <label for="taskDay" id="labelTaskDay"><?php echo __('tasks_lbl_day'); ?></label>
        <select id="taskDay">
            <option value="الأحد"><?php echo __('tasks_day_sun'); ?></option>
            <option value="الاثنين"><?php echo __('tasks_day_mon'); ?></option>
            <option value="الثلاثاء"><?php echo __('tasks_day_tue'); ?></option>
            <option value="الأربعاء"><?php echo __('tasks_day_wed'); ?></option>
            <option value="الخميس"><?php echo __('tasks_day_thu'); ?></option>
            <option value="الجمعة"><?php echo __('tasks_day_fri'); ?></option>
            <option value="السبت"><?php echo __('tasks_day_sat'); ?></option>
        </select>

        <label for="taskTime" id="labelTaskTime"><?php echo __('tasks_lbl_time'); ?></label>
        <input type="time" id="taskTime">

        <label for="taskIcon" id="labelTaskIcon"><?php echo __('tasks_lbl_type'); ?></label>
        <select id="taskIcon">
            <option value="fa-book"><?php echo __('tasks_type_study'); ?></option>
            <option value="fa-laptop-code"><?php echo __('tasks_type_proj'); ?></option>
            <option value="fa-bell"><?php echo __('tasks_type_remind'); ?></option>
            <option value="fa-heart"><?php echo __('tasks_type_health'); ?></option>
            <option value="fa-house"><?php echo __('tasks_type_home'); ?></option>
            <option value="fa-utensils"><?php echo __('tasks_type_food'); ?></option>
            <option value="fa-dumbbell"><?php echo __('tasks_type_sport'); ?></option>
        </select>

        <div class="modal-actions">
            <button class="save-btn" id="mSave" type="button" onclick="saveTask()"><?php echo __('tasks_btn_save'); ?></button>
            <button class="cancel-btn" id="mCancel" type="button" onclick="closeTaskModal()"><?php echo __('tasks_btn_cancel'); ?></button>
        </div>
    </div>
</div>

<!-- هذا التوست للرسائل السريعة -->
<div id="tasksToast" class="tasks-toast"></div>

<?php include 'includes/footer.php'; ?>

<script>
    /*
        مررنا اسم المستخدم واللغة الحالية للجافاسكربت
        حتى نستفيد منهم لو احتجنا
    */
    window.currentUserName = <?php echo json_encode($userName); ?>;
    window.tasksPageLang   = <?php echo json_encode($lang_code); ?>;
</script>
<script src="js/tasks.js?v=2"></script>
</body>
</html>