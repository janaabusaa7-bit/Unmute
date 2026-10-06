<?php


require_once 'includes/i18n.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/*
    إذا لم يكن المستخدم مسجل دخول
    نرجعه مباشرة على صفحة اللوج إن
*/
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

/*
    هنا نأخذ بيانات المستخدم من السيشن
    حتى نعرضها في الهيدر والسايدبار
*/
$userName = $_SESSION["user_name"] ?? "User";
$userRole = $_SESSION["user_role"] ?? "normal";
$userAvatar = $_SESSION["user_avatar"] ?? null;

/*
    نأخذ أول حرف من الاسم
    حتى نستخدمه بدل الصورة إذا لم توجد صورة شخصية
*/
if (function_exists('mb_substr')) {
    $userInitial = mb_strtoupper(mb_substr(trim($userName), 0, 1, 'UTF-8'), 'UTF-8');
} else {
    $userInitial = strtoupper(substr(trim($userName), 0, 1));
}

/*
    تحديد اللغة واتجاه الصفحة
*/
$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang_code) ?>" dir="<?= htmlspecialchars($dir) ?>">
<head>
    <meta charset="UTF-8" />

    <!-- هذا السطر مهم جدًا حتى الصفحة تكون مناسبة لكل الأجهزة -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title><?= $lang_code === 'ar' ? 'مجتمع Unmute' : 'Unmute Community' ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <link rel="stylesheet" href="css/social.css?v=3" />
</head>
<body>

    <!--
        هذا التوست الصغير لعرض الرسائل السريعة
        مثل: تم النشر / تم الإرسال / تم الحذف
    -->
    <div class="toast" id="toast">
        <i class="fa-solid fa-circle-check"></i>
        <span id="toastText"><?= $lang_code === 'ar' ? 'تمت العملية بنجاح' : 'Done successfully' ?></span>
    </div>

    <!--
        الهيدر هنا مستقل عن الداشبورد
        لكن رتبناه بشكل أبسط وأهدأ
    -->
    <header class="topbar">

        <!-- يمين الهيدر: الشعار -->
        <div class="topbar-right">
            <div class="brand-box">
                <img src="assets/platform.png" alt="Unmute Logo" class="brand-logo" />
                <div class="brand-text">
                    <strong>Unmute</strong>
                    <span id="brandSubtitle">Community Hub</span>
                </div>
            </div>
        </div>

        <!-- وسط الهيدر: البحث -->
        <div class="topbar-center">
            <!--
                هذا بوكس البحث الرئيسي
                عملنا تحته قائمة اقتراحات للأعضاء
                حتى لو المستخدم كتب اسم حد يقدر يروح مباشرة لبروفايله
            -->
            <div class="search-box-wrap">
                <div class="search-box">
                    <input
                        id="searchInput"
                        type="text"
                        placeholder="<?= __('soc_search_ph') ?>"
                        oninput="handleGlobalSearchInput()"
                        onkeydown="handleGlobalSearchKey(event)"
                        autocomplete="off"
                    />
                    <button type="button" class="search-go-btn" onclick="submitGlobalSearch()">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>

                <!--
                    هذه القائمة ستظهر فيها أسماء الأعضاء المقترحين
                    عند الضغط على أي اسم نذهب إلى profile.php
                -->
                <div class="search-suggestions" id="searchSuggestions"></div>
            </div>
        </div>

        <!-- يسار الهيدر: الوصول + اللغة + الإشعارات + المستخدم -->
        <div class="topbar-left">
            <div class="top-action-group">

                <button class="top-icon-btn" onclick="toggleAccessPanel()" title="Accessibility">
                    <i class="fa-solid fa-wheelchair"></i>
                </button>

                <div class="lang-wrap">
                    <button class="top-pill-btn" onclick="toggleLangMenu()">
                        <i class="fa-solid fa-globe"></i>
                        <span id="langLabel"><?= $lang_code === 'ar' ? 'العربية' : 'English' ?></span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>

                    <div class="dropdown-menu small-menu" id="langMenu">
                        <button onclick="setLang('ar')">العربية</button>
                        <button onclick="setLang('en')">English</button>
                    </div>
                </div>

                <div class="notif-wrap">
                    <button class="top-icon-btn notif-btn" onclick="toggleNotifications()">
                        <i class="fa-solid fa-bell"></i>
                        <span class="notif-badge" id="notifBadge">0</span>
                    </button>

                    <div class="dropdown-menu notif-menu" id="notifMenu">
                        <div class="dropdown-head">
                            <strong id="notifTitle"><?= __('soc_notif_title') ?></strong>
                            <button class="mark-read-btn" id="markAllText" onclick="markAllNotificationsRead()">
                                <?= __('soc_notif_read_all') ?>
                            </button>
                        </div>
                        <div id="notifList"></div>
                    </div>
                </div>

                <div class="profile-wrap">
                    <button class="profile-btn" onclick="toggleProfileMenu()">
                        <div class="profile-meta">
                            <span id="headerUserName"><?= htmlspecialchars($userName) ?></span>
                            <small id="headerUserRole">User</small>
                        </div>

                        <div class="user-avatar" id="headerAvatar">
                            <?php if (!empty($userAvatar)): ?>
                                <img src="<?= htmlspecialchars($userAvatar) ?>" alt="Avatar" />
                            <?php else: ?>
                                <?= htmlspecialchars($userInitial) ?>
                            <?php endif; ?>
                        </div>
                    </button>

                    <div class="dropdown-menu profile-menu" id="profileMenu">
                        <button onclick="goToProfilePage()">
                            <i class="fa-solid fa-user"></i>
                            <span id="profileMenuText"><?= __('soc_menu_profile') ?></span>
                        </button>
                        <button onclick="logoutUser()">
                            <i class="fa-solid fa-right-from-bracket"></i>
                            <span id="logoutText"><?= __('soc_menu_logout') ?></span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </header>

    <!--
        هذه لوحة الوصول
        فيها:
        - تكبير الخط
        - تصغير الخط
        - لون الخلفية
        - لون النص
        - إعادة ضبط
    -->
    <div class="access-panel" id="accessPanel">
        <div class="access-title" id="accessTitle"><?= __('soc_acc_title') ?></div>

        <button class="access-option-btn" onclick="changeFontSize(1)">
            <span id="increaseFontText"><?= __('soc_acc_inc_font') ?></span>
            <span>(+)</span>
        </button>

        <button class="access-option-btn" onclick="changeFontSize(-1)">
            <span id="decreaseFontText"><?= __('soc_acc_dec_font') ?></span>
            <span>(-)</span>
        </button>

        <div class="color-group">
            <label id="bgColorText"><?= __('soc_acc_bg_color') ?></label>
            <input type="color" id="bgColorPicker" value="#f4f8ff" onchange="changeBackgroundColor(this.value)" />
        </div>

        <div class="color-group">
            <label id="textColorText"><?= __('soc_acc_text_color') ?></label>
            <input type="color" id="textColorPicker" value="#1f2b3d" onchange="changeTextColor(this.value)" />
        </div>

        <button class="access-option-btn" onclick="resetAccessibility()">
            <span id="resetAccessText"><?= __('soc_acc_reset') ?></span>
        </button>
    </div>

    <!--
        جسم الصفحة الأساسي
        قسمناه إلى:
        - سايدبار يمين
        - المنشورات بالنص
        - سايدبار يسار للأعضاء
    -->
    <main class="page-layout">

        <!-- السايدبار اليمين -->
        <aside class="right-sidebar">
            <div class="card profile-card">
                <button class="profile-link-card" onclick="goToProfilePage()">
                    <div class="user-avatar large-avatar" id="sideAvatar">
                        <?php if (!empty($userAvatar)): ?>
                            <img src="<?= htmlspecialchars($userAvatar) ?>" alt="Avatar" />
                        <?php else: ?>
                            <?= htmlspecialchars($userInitial) ?>
                        <?php endif; ?>
                    </div>

                    <div class="profile-link-info">
                        <h3 id="sideUserName"><?= htmlspecialchars($userName) ?></h3>
                        <p id="sideUserRoleText"><?= __('soc_side_role') ?></p>
                    </div>
                </button>

                <div class="sidebar-menu">
                    <button onclick="goToDashboard()">
                        <i class="fa-solid fa-table-columns"></i>
                        <span id="dashboardMenuText"><?= __('soc_side_dash') ?></span>
                    </button>

                    <button onclick="scrollToTopNow()">
                        <i class="fa-solid fa-house"></i>
                        <span id="feedMenuText"><?= __('soc_side_feed') ?></span>
                    </button>

                    <button onclick="showFriendsOnly()">
                        <i class="fa-solid fa-user-group"></i>
                        <span id="friendsMenuText"><?= __('soc_side_friends') ?></span>
                    </button>

                    <button onclick="openPostModal()">
                        <i class="fa-solid fa-square-plus"></i>
                        <span id="newPostMenuText"><?= __('soc_side_new_post') ?></span>
                    </button>

                    <button onclick="openMessengerPanel()">
                        <i class="fa-solid fa-comments"></i>
                        <span id="messengerMenuText"><?= __('soc_side_msg') ?></span>
                    </button>

                    <button onclick="openPlatformModal()">
                        <i class="fa-solid fa-circle-info"></i>
                        <span id="aboutPlatformMenuText"><?= __('soc_side_about') ?></span>
                    </button>
                </div>
            </div>

            <div class="card purpose-card">
                <div class="purpose-head">
                    <div class="purpose-icon">
                        <i class="fa-solid fa-bullseye"></i>
                    </div>
                    <div>
                        <h3 id="missionTitle"><?= __('soc_goal_title') ?></h3>
                        <p id="missionText"><?= __('soc_goal_text') ?></p>
                    </div>
                </div>

                <div class="mini-tip">
                    <i class="fa-solid fa-lightbulb"></i>
                    <span id="tipText"><?= __('soc_tip_text') ?></span>
                </div>
            </div>
        </aside>

        <!-- منطقة المنشورات -->
        <section class="feed-area">
            <div class="card create-post-card">
                <div class="create-post-top">
                    <div class="user-avatar" id="createPostAvatar">
                        <?php if (!empty($userAvatar)): ?>
                            <img src="<?= htmlspecialchars($userAvatar) ?>" alt="Avatar" />
                        <?php else: ?>
                            <?= htmlspecialchars($userInitial) ?>
                        <?php endif; ?>
                    </div>

                    <button class="create-input-btn" onclick="openPostModal()" id="createPostTrigger">
                        <?= __('soc_post_ph') ?>
                    </button>
                </div>

                <div class="create-post-actions">
                    <button onclick="openPostModal('image')">
                        <i class="fa-regular fa-image"></i>
                        <span id="addImageText"><?= __('soc_add_img') ?></span>
                    </button>

                    <button onclick="openPostModal('video')">
                        <i class="fa-solid fa-video"></i>
                        <span id="addVideoText"><?= __('soc_add_vid') ?></span>
                    </button>

                    <button onclick="openPostModal()">
                        <i class="fa-solid fa-pen"></i>
                        <span id="writePostText"><?= __('soc_write_post') ?></span>
                    </button>
                </div>
            </div>

            <!-- هنا الجافاسكربت سيعرض المنشورات -->
            <div class="feed-list" id="feedList"></div>
        </section>

        <!-- السايدبار اليسار -->
        <aside class="left-sidebar">
            <div class="card members-card">
                <div class="members-head">
                    <h3 id="membersTitle"><?= __('soc_members_title') ?></h3>
                    <span class="soft-badge" id="membersBadgeText"><?= __('soc_members_badge') ?></span>
                </div>

                <!-- هنا الجافاسكربت سيعرض الأعضاء -->
                <div id="contactsList"></div>
            </div>
        </aside>

    </main>

    <!-- مودال إنشاء منشور -->
    <div class="modal-overlay" id="postModalOverlay">
        <div class="modal-box">
            <div class="modal-head">
                <h3 id="postModalTitle"><?= __('soc_modal_post_title') ?></h3>
                <button class="close-btn" onclick="closePostModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="modal-body">
                <div class="field">
                    <textarea id="postTextAr" rows="5" placeholder="<?= __('soc_modal_post_ph') ?>"></textarea>
                    <input type="hidden" id="postTextEn" value="">
                </div>

                <div class="upload-actions">
                    <button class="upload-btn" type="button" onclick="document.getElementById('imageInput').click()">
                        <i class="fa-regular fa-image"></i>
                        <span id="modalImageText"><?= __('soc_modal_img') ?></span>
                    </button>

                    <button class="upload-btn" type="button" onclick="document.getElementById('videoInput').click()">
                        <i class="fa-solid fa-video"></i>
                        <span id="modalVideoText"><?= __('soc_modal_vid') ?></span>
                    </button>
                </div>

                <input type="file" id="imageInput" accept="image/*" hidden onchange="handleImageUpload(event)" />
                <input type="file" id="videoInput" accept="video/*" hidden onchange="handleVideoUpload(event)" />

                <div class="media-preview-wrap">
                    <img id="imagePreview" class="media-preview" style="display:none;" alt="Preview Image" />
                    <video id="videoPreview" class="media-preview" controls style="display:none;"></video>
                </div>

                <p class="input-hint" id="postHint"><?= __('soc_modal_hint') ?></p>

                <button class="primary-btn" onclick="publishPost()">
                    <i class="fa-solid fa-paper-plane"></i>
                    <span id="publishText"><?= __('soc_modal_publish') ?></span>
                </button>
            </div>
        </div>
    </div>

    <!-- مودال عن المنصة -->
    <div class="modal-overlay" id="platformModalOverlay">
        <div class="modal-box small-modal">
            <div class="modal-head">
                <h3 id="platformModalTitle"><?= __('soc_about_title') ?></h3>
                <button class="close-btn" onclick="closePlatformModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="modal-body">
                <p class="input-hint" id="platformModalText"><?= __('soc_about_text') ?></p>

                <div class="platform-meta">
                    <div>
                        <i class="fa-solid fa-building"></i>
                        <span id="platformNameText">Unmute Platform</span>
                    </div>
                    <div>
                        <i class="fa-solid fa-location-dot"></i>
                        <span id="platformAddressText"><?= __('soc_about_address') ?></span>
                    </div>
                </div>

                <button class="primary-btn full-btn" onclick="openAdminContactModal()">
                    <i class="fa-solid fa-envelope"></i>
                    <span id="contactAdminText"><?= __('soc_admin_contact') ?></span>
                </button>
            </div>
        </div>
    </div>

    <!-- مودال مراسلة الإدارة -->
    <div class="modal-overlay" id="adminModalOverlay">
        <div class="modal-box small-modal">
            <div class="modal-head">
                <h3 id="adminModalTitle"><?= __('soc_admin_title') ?></h3>
                <button class="close-btn" onclick="closeAdminModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="modal-body">
                <div class="field">
                    <label id="adminNameLabel"><?= __('soc_admin_name') ?></label>
                    <input type="text" id="adminNameInput" value="<?= htmlspecialchars($userName) ?>" />
                </div>

                <div class="field">
                    <label id="adminEmailLabel"><?= __('soc_admin_email') ?></label>
                    <input type="email" id="adminEmailInput" value="<?= htmlspecialchars($_SESSION['user_email'] ?? '') ?>" />
                </div>

                <div class="field">
                    <label id="adminIssueLabel"><?= __('soc_admin_issue') ?></label>
                    <textarea id="adminIssueInput" rows="5"></textarea>
                </div>

                <button class="primary-btn full-btn" onclick="submitAdminForm()">
                    <i class="fa-solid fa-paper-plane"></i>
                    <span id="sendAdminText"><?= __('soc_admin_send') ?></span>
                </button>
            </div>
        </div>
    </div>

    <!-- المسنجر -->
    <aside class="messenger-panel" id="messengerPanel">
        <div class="messenger-sidebar">
            <div class="messenger-sidebar-head">
                <h3 id="messengerTitle">Messenger</h3>
                <button class="close-btn" onclick="closeMessengerPanel()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="messenger-search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input id="contactSearchInput" type="text" placeholder="<?= __('soc_msg_search') ?>" oninput="filterContacts()" />
            </div>

            <div class="conversation-list" id="conversationList"></div>
        </div>

        <div class="chat-section">
            <div class="chat-head">
                <div class="chat-user-info">
                    <div class="user-avatar" id="chatAvatar">U</div>
                    <div>
                        <b id="chatName"><?= $lang_code === 'ar' ? 'المراسلة' : 'Messenger' ?></b>
                        <small id="chatStatus"><?= $lang_code === 'ar' ? 'اختر صديقاً' : 'Select a friend' ?></small>
                    </div>
                </div>
            </div>

            <div class="chat-body" id="chatBody"></div>

            <div class="chat-input-area">
                <button class="primary-btn square-btn voice-btn" id="voiceBtn" onclick="toggleVoiceRecognition()" title="Voice">
                    <i class="fa-solid fa-microphone"></i>
                </button>

                <input id="chatInput" type="text" maxlength="250" placeholder="<?= __('soc_msg_ph') ?>" onkeydown="handleChatKey(event)" />

                <button class="primary-btn square-btn" onclick="sendMessage()">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </aside>

    <!-- طبقة شفافة لإغلاق اللوحات -->
    <div class="page-overlay" id="pageOverlay" onclick="closeAllPanels()"></div>

    <script>
        /*
            مررنا معلومات المستخدم للـ JS
            حتى نستخدمها بسهولة في الرندر
        */
        window.currentUserName = <?= json_encode($userName) ?>;
        window.currentUserInitial = <?= json_encode($userInitial) ?>;
        window.currentUserRole = <?= json_encode($userRole) ?>;
        window.currentUserAvatar = <?= json_encode($userAvatar) ?>;
    </script>

    <script src="js/social.js?v=3"></script>
</body>
</html>