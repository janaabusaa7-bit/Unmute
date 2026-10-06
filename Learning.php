<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once "includes/i18n.php";

$userName = $_SESSION['user_name'] ?? 'User';

$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unmute | Learning</title>

 
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

 
  <link rel="stylesheet" href="css/global.css">
  <link rel="stylesheet" href="css/Learning.css?v=<?php echo time(); ?>">

  <!-- MediaPipe -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
</head>
<body>

<?php include 'includes/header-user.php'; ?>


<section class="learning-hero">
  <div class="hero-content">
    <h1 id="heroTitle"><?php echo __('lrn_hero_title'); ?></h1>
    <p id="heroDesc"><?php echo __('lrn_hero_desc'); ?></p>
  </div>

  <div class="hero-progress">
    <div class="progress-box">
      <strong id="totalLessonsCount">0</strong>
      <span id="statLessons"><?php echo __('lrn_stat_total'); ?></span>
    </div>
    <div class="progress-box">
      <strong id="completedLessonsCount">0</strong>
      <span id="statCompleted"><?php echo __('lrn_stat_completed'); ?></span>
    </div>
    <div class="progress-box">
      <strong id="overallProgressText">0%</strong>
      <span id="statProgress"><?php echo __('lrn_stat_progress'); ?></span>
    </div>
  </div>
</section>

<main class="learning-layout">

  <!-- الشريط الجانبي -->
  <aside class="sidebar-card">
    <div class="sidebar-head">
      <h3 id="libraryTitle"><?php echo __('lrn_lib_title'); ?></h3>
      <p id="libraryDesc"><?php echo __('lrn_lib_desc'); ?></p>
    </div>

    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" id="lessonSearch" placeholder="<?php echo __('lrn_search_ph'); ?>">
    </div>

    <div class="category-switch">
      <button class="cat-btn active" data-category="numbers" id="catNumbers"><?php echo __('lrn_cat_num'); ?></button>
      <button class="cat-btn" data-category="letters" id="catLetters"><?php echo __('lrn_cat_let'); ?></button>
      <button class="cat-btn" data-category="words" id="catWords"><?php echo __('lrn_cat_wor'); ?></button>
    </div>

    <div class="lesson-list" id="lessonList"></div>

    <div class="mini-progress">
      <h4 id="progressHead"><?php echo __('lrn_prog_title'); ?></h4>

      <div class="progress-item">
        <div class="progress-top">
          <span id="progressNumbersLabel"><?php echo __('lrn_prog_num'); ?></span>
          <strong id="numbersProgressText">0%</strong>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="numbersProgressFill"></div></div>
      </div>

      <div class="progress-item">
        <div class="progress-top">
          <span id="progressLettersLabel"><?php echo __('lrn_prog_let'); ?></span>
          <strong id="lettersProgressText">0%</strong>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="lettersProgressFill"></div></div>
      </div>

      <div class="progress-item">
        <div class="progress-top">
          <span id="progressWordsLabel"><?php echo __('lrn_prog_wor'); ?></span>
          <strong id="wordsProgressText">0%</strong>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="wordsProgressFill"></div></div>
      </div>
    </div>
  </aside>

  <!-- القسم الرئيسي -->
  <section class="content-area">

    <!-- كرت الدرس -->
    <div class="lesson-card">
      <div class="lesson-head">
        <div>
          <span class="lesson-tag" id="currentCategoryLabel"><?php echo __('lrn_prog_num'); ?></span>
          <h2 id="lessonTitle"><?php echo __('lrn_lesson_title_def'); ?></h2>
          <p id="lessonSubtitle"><?php echo __('lrn_lesson_sub_def'); ?></p>
        </div>

        <div class="lesson-actions">
          <button class="primary-btn done-btn" id="markDoneBtn"><?php echo __('lrn_btn_done'); ?></button>
          <button class="primary-btn" id="nextLessonBtn"><?php echo __('lrn_btn_next'); ?></button>
          
          <button class="practice-trigger-btn" id="btnTriggerTraining" onclick="togglePracticeArea('trainingPanel')">
            <i class="fas fa-robot"></i> <span id="textTriggerTraining"><?php echo __('lrn_tab_train'); ?></span>
          </button>
          <button class="practice-trigger-btn" id="btnTriggerChallenge" onclick="togglePracticeArea('challengePanel')">
            <i class="fas fa-bolt"></i> <span id="textTriggerChallenge"><?php echo __('lrn_tab_chal'); ?></span>
          </button>
          <button class="practice-trigger-btn" id="btnTriggerAchievements" onclick="togglePracticeArea('achievementPanel')">
            <i class="fas fa-medal"></i> <span id="textTriggerAchievements"><?php echo __('lrn_tab_achv'); ?></span>
          </button>
        </div>
      </div>

      <!-- محتوى الدرس التفاعلي (فيديو أو تمارين) -->
      <div class="lesson-interaction-container">
        
        <!-- منطقة الفيديو الرئيسية -->
        <div id="lessonVideoWrapper" class="video-wrapper">
          <video id="lessonVideo" controls preload="metadata">
            <source id="lessonVideoSource" src="" type="video/mp4">
            <?php echo __('lrn_vid_err'); ?>
          </video>

          <div class="video-tools">
            <button type="button" class="tool-btn" id="videoSpeedDownBtn"><?php echo __('lrn_vid_slow'); ?></button>
            <button type="button" class="tool-btn" id="videoSpeedNormalBtn"><?php echo __('lrn_vid_norm'); ?></button>
            <button type="button" class="tool-btn" id="videoSpeedUpBtn"><?php echo __('lrn_vid_fast'); ?></button>
          </div>
        </div>

        <!-- منطقة التمارين (تظهر عند النقر على الأزرار العلوية) -->
        <div id="practiceAreaWrapper" class="practice-area-wrapper" style="display:none;">
          <button class="close-practice-btn" onclick="closePracticeArea()"><i class="fas fa-times"></i></button>
          
          <div class="practice-card-inline">
            <!-- تدريب الذكاء الاصطناعي -->
            <div class="tab-panel" id="trainingPanel">
              <div class="panel-head">
                <h3 id="trainingTitle"><?php echo __('lrn_train_title'); ?></h3>
                <p id="trainingHint"><?php echo __('lrn_train_hint'); ?></p>
              </div>

              <!-- اختيار نطاق الأحرف (يظهر فقط عند اختيار فئة الأحرف) -->
              <div id="letterRangeSelector" class="letter-range-selector" style="display:none;">
                <button class="range-btn" data-start="0">أ - ر (1-10)</button>
                <button class="range-btn" data-start="10">ز - ف (11-20)</button>
                <button class="range-btn" data-start="20">ق - ي (21-28)</button>
              </div>

              <div class="training-container">
                <div class="target-sign-box">
                  <div id="targetSignMedia">
                    <img id="targetSignImg" src="" alt="Sign" style="display:none;">
                    <video id="targetSignVid" src="" loop muted style="display:none;"></video>
                  </div>
                  <h4 id="targetSignName">---</h4>
                </div>

                <div class="training-cam-box">
                  <div id="trainingCamWrapper" class="cam-wrap">
                     <video id="trainingWebCam" autoplay playsinline style="display: block; width: 100%; height: auto; transform: scaleX(-1);"></video>
                     <canvas id="trainingCanvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: scaleX(-1); pointer-events: none;"></canvas>
                     <div id="trainingFeedback" class="feedback-overlay"></div>
                  </div>
                  
                  <div class="training-controls">
                     <button class="primary-btn" id="startTrainingBtn"><?php echo __('lrn_train_start'); ?></button>
                     <div id="trainingLiveResult" class="live-result-badge">---</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- التحدي -->
            <div class="tab-panel" id="challengePanel">
              <div class="panel-head">
                <h3 id="challengeTitle"><?php echo __('lrn_chal_title'); ?></h3>
                <p id="challengeHint"><?php echo __('lrn_chal_hint'); ?></p>
              </div>

              <div class="challenge-top">
                <div class="challenge-meta">
                  <span id="challengeTimerLabel"><?php echo __('lrn_chal_time'); ?></span>
                  <strong id="challengeTimer">45</strong>
                </div>
                <div class="challenge-meta">
                  <span id="challengeScoreLabel"><?php echo __('lrn_chal_score'); ?></span>
                  <strong id="challengeScore">0 / 0</strong>
                </div>
              </div>

              <div class="challenge-video-wrap">
                <video id="challengeVideo" controls preload="metadata">
                  <source id="challengeVideoSource" src="" type="video/mp4">
                  <?php echo __('lrn_vid_err'); ?>
                </video>

                <div class="video-tools small-tools">
                  <button type="button" class="tool-btn" id="challengeSpeedDownBtn"><?php echo __('lrn_vid_slow'); ?></button>
                  <button type="button" class="tool-btn" id="challengeSpeedNormalBtn"><?php echo __('lrn_vid_norm'); ?></button>
                  <button type="button" class="tool-btn" id="challengeSpeedUpBtn"><?php echo __('lrn_vid_fast'); ?></button>
                </div>
              </div>

              <div class="challenge-question" id="challengeQuestion"></div>
              <div class="quiz-grid" id="challengeOptions"></div>
              <button class="primary-btn danger-btn" id="startChallengeBtn"><?php echo __('lrn_btn_start_chal'); ?></button>
            </div>

            <!-- الإنجاز -->
            <div class="tab-panel" id="achievementPanel">
              <div class="panel-head">
                <h3 id="achievementTitle"><?php echo __('lrn_achv_title'); ?></h3>
                <p id="achievementHint"><?php echo __('lrn_achv_hint'); ?></p>
              </div>

              <div class="achievement-grid">
                <div class="achievement-box">
                  <span id="achievementDoneLabel"><?php echo __('lrn_achv_done'); ?></span>
                  <strong id="achievementDoneCount">0</strong>
                </div>
                <div class="achievement-box">
                  <span id="achievementRemainingLabel"><?php echo __('lrn_achv_rem'); ?></span>
                  <strong id="achievementRemainingCount">0</strong>
                </div>
                <div class="achievement-box">
                  <span id="achievementStageLabel"><?php echo __('lrn_achv_stage'); ?></span>
                  <strong id="achievementCurrentStage">1</strong>
                </div>
              </div>

              <div class="achievement-list" id="achievementList"></div>
            </div>
          </div>
        </div>
      </div>
  </section>
</main>

<!--
============================================================================
بيانات الدروس
----------------------------------------------------------------------------
كل سطر lesson-data-item = درس واحد

شرح الخصائص:
data-lang      = ar أو en
data-category  = numbers أو letters أو words
data-title     = اسم الدرس
data-subtitle  = وصف قصير
data-video     = مكان الفيديو داخل المشروع
data-answer    = الجواب الصحيح
data-options   = الخيارات وبينها |
----------------------------------------------------------------------------
وين تحطي الفيديوهات؟
- videos/ar/numbers/
- videos/ar/letters/
- videos/ar/words/
- videos/en/numbers/
- videos/en/letters/
- videos/en/words/
============================================================================
-->
<section id="lessonData" class="lesson-data-hidden">

  <!-- ==================== NUMBERS AR ==================== -->
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 0" data-subtitle="تعلّم إشارة الرقم 0" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.19.37 PM.mp4" data-answer="0" data-options="0|1|2|3"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 1" data-subtitle="تعلّم إشارة الرقم 1" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.07.12 PM.mp4" data-answer="1" data-options="1|2|3|4"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 2" data-subtitle="تعلّم إشارة الرقم 2" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.08.23 PM.mp4" data-answer="2" data-options="2|3|4|5"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 3" data-subtitle="تعلّم إشارة الرقم 3" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.09.28 PM.mp4" data-answer="3" data-options="3|4|5|6"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 4" data-subtitle="تعلّم إشارة الرقم 4" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.12.55 PM.mp4" data-answer="4" data-options="4|5|6|7"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 5" data-subtitle="تعلّم إشارة الرقم 5" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.13.33 PM.mp4" data-answer="5" data-options="5|6|7|8"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 6" data-subtitle="تعلّم إشارة الرقم 6" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.14.15 PM.mp4" data-answer="6" data-options="6|7|8|9"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 7" data-subtitle="تعلّم إشارة الرقم 7" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.14.35 PM.mp4" data-answer="7" data-options="7|8|9|10"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 8" data-subtitle="تعلّم إشارة الرقم 8" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.15.23 PM.mp4" data-answer="8" data-options="8|9|10|0"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 9" data-subtitle="تعلّم إشارة الرقم 9" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.15.54 PM.mp4" data-answer="9" data-options="9|10|0|1"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="numbers" data-title="الرقم 10" data-subtitle="تعلّم إشارة الرقم 10" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.19.42 PM.mp4" data-answer="10" data-options="10|0|1|2"></div>

  <!-- ==================== NUMBERS EN ==================== -->
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 0" data-subtitle="Learn the sign of number 0" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.19.37 PM.mp4" data-answer="0" data-options="0|1|2|3"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 1" data-subtitle="Learn the sign of number 1" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.07.12 PM.mp4" data-answer="1" data-options="1|2|3|4"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 2" data-subtitle="Learn the sign of number 2" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.08.23 PM.mp4" data-answer="2" data-options="2|3|4|5"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 3" data-subtitle="Learn the sign of number 3" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.09.28 PM.mp4" data-answer="3" data-options="3|4|5|6"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 4" data-subtitle="Learn the sign of number 4" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.12.55 PM.mp4" data-answer="4" data-options="4|5|6|7"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 5" data-subtitle="Learn the sign of number 5" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.13.33 PM.mp4" data-answer="5" data-options="5|6|7|8"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 6" data-subtitle="Learn the sign of number 6" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.14.15 PM.mp4" data-answer="6" data-options="6|7|8|9"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 7" data-subtitle="Learn the sign of number 7" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.14.35 PM.mp4" data-answer="7" data-options="7|8|9|10"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 8" data-subtitle="Learn the sign of number 8" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.15.23 PM.mp4" data-answer="8" data-options="8|9|10|0"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 9" data-subtitle="Learn the sign of number 9" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.15.54 PM.mp4" data-answer="9" data-options="9|10|0|1"></div>
  <div class="lesson-data-item" data-lang="en" data-category="numbers" data-title="Number 10" data-subtitle="Learn the sign of number 10" data-video="videos/num/WhatsApp Video 2026-03-30 at 5.19.42 PM.mp4" data-answer="10" data-options="10|0|1|2"></div>

  <!-- ==================== AR LETTERS ==================== -->
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف أ" data-subtitle="تعلّم إشارة الحرف أ" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.17.19 PM.mp4" data-answer="أ" data-options="أ|ب|ت|ث"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ب" data-subtitle="تعلّم إشارة الحرف ب" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.21.19 PM.mp4" data-answer="ب" data-options="ب|ت|ث|ج"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ت" data-subtitle="تعلّم إشارة الحرف ت" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.22.28 PM.mp4" data-answer="ت" data-options="ت|ث|ج|ح"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ث" data-subtitle="تعلّم إشارة الحرف ث" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.23.13 PM.mp4" data-answer="ث" data-options="ث|ج|ح|خ"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ج" data-subtitle="تعلّم إشارة الحرف ج" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.23.48 PM.mp4" data-answer="ج" data-options="ج|ح|خ|د"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ح" data-subtitle="تعلّم إشارة الحرف ح" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.24.25 PM.mp4" data-answer="ح" data-options="ح|خ|د|ذ"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف خ" data-subtitle="تعلّم إشارة الحرف خ" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.26.44 PM.mp4" data-answer="خ" data-options="خ|د|ذ|ر"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف د" data-subtitle="تعلّم إشارة الحرف د" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.28.07 PM.mp4" data-answer="د" data-options="د|ذ|ر|ز"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ذ" data-subtitle="تعلّم إشارة الحرف ذ" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.29.54 PM.mp4" data-answer="ذ" data-options="ذ|ر|ز|س"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ر" data-subtitle="تعلّم إشارة الحرف ر" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.30.59 PM.mp4" data-answer="ر" data-options="ر|ز|س|ش"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ز" data-subtitle="تعلّم إشارة الحرف ز" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.30.59 PM.mp4" data-answer="ز" data-options="ز|س|ش|ص"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف س" data-subtitle="تعلّم إشارة الحرف س" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.35.11 PM.mp4" data-answer="س" data-options="س|ش|ص|ض"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ش" data-subtitle="تعلّم إشارة الحرف ش" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.35.49 PM.mp4" data-answer="ش" data-options="ش|ص|ض|ط"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ص" data-subtitle="تعلّم إشارة الحرف ص" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.36.36 PM.mp4" data-answer="ص" data-options="ص|ض|ط|ظ"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ض" data-subtitle="تعلّم إشارة الحرف ض" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.36.52 PM.mp4" data-answer="ض" data-options="ض|ط|ظ|ع"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ط" data-subtitle="تعلّم إشارة الحرف ط" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.37.23 PM.mp4" data-answer="ط" data-options="ط|ظ|ع|غ"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ظ" data-subtitle="تعلّم إشارة الحرف ظ" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.38.03 PM (1).mp4" data-answer="ظ" data-options="ظ|ع|غ|ف"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ع" data-subtitle="تعلّم إشارة الحرف ع" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.39.16 PM.mp4" data-answer="ع" data-options="ع|غ|ف|ق"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف غ" data-subtitle="تعلّم إشارة الحرف غ" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.39.43 PM.mp4" data-answer="غ" data-options="غ|ف|ق|ك"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ف" data-subtitle="تعلّم إشارة الحرف ف" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.40.33 PM.mp4" data-answer="ف" data-options="ف|ق|ك|ل"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ق" data-subtitle="تعلّم إشارة الحرف ق" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.41.24 PM.mp4" data-answer="ق" data-options="ق|ك|ل|م"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ك" data-subtitle="تعلّم إشارة الحرف ك" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.41.46 PM.mp4" data-answer="ك" data-options="ك|ل|م|ن"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ل" data-subtitle="تعلّم إشارة الحرف ل" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.42.20 PM.mp4" data-answer="ل" data-options="ل|م|ن|ه"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف م" data-subtitle="تعلّم إشارة الحرف م" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.42.47 PM.mp4" data-answer="م" data-options="م|ن|ه|و"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ن" data-subtitle="تعلّم إشارة الحرف ن" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.43.14 PM.mp4" data-answer="ن" data-options="ن|ه|و|ي"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ه" data-subtitle="تعلّم إشارة الحرف ه" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.43.27 PM.mp4" data-answer="ه" data-options="ه|و|ي|أ"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف و" data-subtitle="تعلّم إشارة الحرف و" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.43.46 PM.mp4" data-answer="و" data-options="و|ي|أ|ب"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="letters" data-title="الحرف ي" data-subtitle="تعلّم إشارة الحرف ي" data-video="videos/le/WhatsApp Video 2026-03-30 at 5.44.20 PM.mp4" data-answer="ي" data-options="ي|أ|ب|ت"></div>

  <!-- ==================== EN LETTERS ==================== -->
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter A" data-subtitle="Learn the sign of letter A" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.45.34 PM.mp4" data-answer="A" data-options="A|B|C|D"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter A" data-subtitle="Learn the sign of letter A" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.45.34 PM.mp4" data-answer="A" data-options="A|B|C|D"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter B" data-subtitle="Learn the sign of letter B" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.46.01 PM.mp4" data-answer="B" data-options="B|C|D|E"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter C" data-subtitle="Learn the sign of letter C" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.47.46 PM.mp4" data-answer="C" data-options="C|D|E|F"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter D" data-subtitle="Learn the sign of letter D" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.49.58 PM.mp4" data-answer="D" data-options="D|E|F|G"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter E" data-subtitle="Learn the sign of letter E" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.07.46 PM.mp4" data-answer="E" data-options="E|F|G|H"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter F" data-subtitle="Learn the sign of letter F" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.53.24 PM.mp4" data-answer="F" data-options="F|G|H|I"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter G" data-subtitle="Learn the sign of letter G" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.54.27 PM.mp4" data-answer="G" data-options="G|H|I|J"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter H" data-subtitle="Learn the sign of letter H" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.55.08 PM.mp4" data-answer="H" data-options="H|I|J|K"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter I" data-subtitle="Learn the sign of letter I" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.55.35 PM.mp4" data-answer="I" data-options="I|J|K|L"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter J" data-subtitle="Learn the sign of letter J" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.56.26 PM.mp4" data-answer="J" data-options="J|K|L|M"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter K" data-subtitle="Learn the sign of letter K" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.56.52 PM.mp4" data-answer="K" data-options="K|L|M|N"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter L" data-subtitle="Learn the sign of letter L" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.57.22 PM.mp4" data-answer="L" data-options="L|M|N|O"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter M" data-subtitle="Learn the sign of letter M" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.58.02 PM (1).mp4" data-answer="M" data-options="M|N|O|P"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter N" data-subtitle="Learn the sign of letter N" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.58.34 PM.mp4" data-answer="N" data-options="N|O|P|Q"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter O" data-subtitle="Learn the sign of letter O" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.59.04 PM.mp4" data-answer="O" data-options="O|P|Q|R"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter P" data-subtitle="Learn the sign of letter P" data-video="videos/leen/WhatsApp Video 2026-03-30 at 5.59.45 PM.mp4" data-answer="P" data-options="P|Q|R|S"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter Q" data-subtitle="Learn the sign of letter Q" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.01.15 PM.mp4" data-answer="Q" data-options="Q|R|S|T"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter R" data-subtitle="Learn the sign of letter R" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.01.52 PM.mp4" data-answer="R" data-options="R|S|T|U"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter S" data-subtitle="Learn the sign of letter S" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.02.10 PM.mp4" data-answer="S" data-options="S|T|U|V"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter T" data-subtitle="Learn the sign of letter T" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.02.58 PM.mp4" data-answer="T" data-options="T|U|V|W"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter U" data-subtitle="Learn the sign of letter U" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.03.14 PM.mp4" data-answer="U" data-options="U|V|W|X"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter V" data-subtitle="Learn the sign of letter V" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.03.47 PM.mp4" data-answer="V" data-options="V|W|X|Y"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter W" data-subtitle="Learn the sign of letter W" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.04.12 PM.mp4" data-answer="W" data-options="W|X|Y|Z"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter X" data-subtitle="Learn the sign of letter X" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.04.38 PM.mp4" data-answer="X" data-options="X|Y|Z|A"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter Y" data-subtitle="Learn the sign of letter Y" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.04.54 PM.mp4" data-answer="Y" data-options="Y|Z|A|B"></div>
  <div class="lesson-data-item" data-lang="en" data-category="letters" data-title="Letter Z" data-subtitle="Learn the sign of letter Z" data-video="videos/leen/WhatsApp Video 2026-03-30 at 6.05.15 PM.mp4" data-answer="Z" data-options="Z|A|B|C"></div>

  <!-- ==================== WORDS AR (25) ==================== -->
   
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="السلام عليكم" data-subtitle="تعلّم إشارة كلمة السلام عليكم" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.20.18 PM.mp4" data-answer="السلام عليكم" data-options="السلام عليكم|شكرا|نعم|لا"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="شكرا" data-subtitle="تعلّم إشارة كلمة شكرا" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.10.12 PM.mp4" data-answer="شكرا" data-options="شكرا|مرحبا|نعم|لا"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="صباح الخير" data-subtitle="تعلّم إشارة كلمة صباح الخير" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.24.29 PM.mp4" data-answer="صباح الخير" data-options="صباح الخير|لا|شكرا|مرحبا"></div>
  <div  class="lesson-data-item" data-lang="ar" data-category="words" data-title="مساء الخير" data-subtitle="تعلّم إشارة كلمة مساء الخير" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.27.04 PM.mp4" data-answer="مساء الخير" data-options="مساء الخير|صباح الخير|شكرا|مرحبا"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="كيف حالك" data-subtitle="تعلّم إشارة كيف حالك" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.12.18 PM.mp4" data-answer="كيف حالك" data-options="كيف حالك|مع السلامة|من فضلك|آسف"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="لو سمحت" data-subtitle="تعلّم إشارة لو سمحت" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.28.43 PM (1).mp4" data-answer="لو سمحت" data-options="لو سمحت|شكرا|آسف|أحبك"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="آسف" data-subtitle="تعلّم إشارة آسف" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.29.18 PM.mp4" data-answer="آسف" data-options="آسف|شكرا|نعم|لا"></div>
 <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="قلقق" data-subtitle="تعلّم إشارة قلقق" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.36.51 PM.mp4" data-answer="قلقق" data-options="قلقق|أمي|أبي|أخت"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="البيت" data-subtitle="تعلّم إشارة البيت" data-video="videos/la/WhatsApp Video 2026-03-30 at 9.14.07 PM.mp4" data-answer="البيت" data-options="البيت|العمل|مدرسة|جامعة"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="مدرسة" data-subtitle="تعلّم إشارة مدرسة" data-video="videos/la/WhatsApp Video 2026-03-30 at 6.17.12 PM.mp4" data-answer="مدرسة" data-options="مدرسة|جامعة|مستشفى|البيت"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="جامعة" data-subtitle="تعلّم إشارة جامعة" data-video="videos/la/WhatsApp Video 2026-03-30 at 6.16.13 PM.mp4" data-answer="جامعة" data-options="جامعة|مدرسة|مستشفى|صديق"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="أمي" data-subtitle="تعلّم إشارة أمي" data-video="videos/la/WhatsApp Video 2026-03-27 at 5.38.39 PM.mp4" data-answer="أمي" data-options="أمي|أبي|أخ|أخت"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="أبي" data-subtitle="تعلّم إشارة أبي" data-video="videos/la/WhatsApp Video 2026-03-27 at 5.38.38 PM (1).mp4" data-answer="أبي" data-options="أبي|أمي|أخ|أخت"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="أخت" data-subtitle="تعلّم إشارة أخت" data-video="videos/la/WhatsApp Video 2026-03-27 at 5.38.39 PM (3).mp4" data-answer="أخت" data-options="أخت|أخ|أمي|أبي"></div>
  <div class="lesson-data-item" data-lang="ar" data-category="words" data-title="أخ" data-subtitle="تعلّم إشارة أخ" data-video="videos/la/WhatsApp Video 2026-03-30 at 6.12.19 PM.mp4" data-answer="أخ" data-options="أخ|أخت|أبي|أمي"></div>
 
  <!-- ==================== WORDS EN (25) ==================== -->
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Hello" data-subtitle="Learn the sign of Hello" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.06.14 PM.mp4" data-answer="Hello" data-options="Hello|Thanks|goodmorning|goodevening"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Thanks" data-subtitle="Learn the sign of Thanks" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.07.11 PM.mp4" data-answer="Thanks" data-options="Thanks|Hello|goodmorning|goodevening"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="goodmorning" data-subtitle="Learn the sign of goodmorning" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.19.12 PM.mp4" data-answer="goodmorning" data-options="goodmorning|goodevening|Hello|Thanks"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="goodevening" data-subtitle="Learn the sign of goodevening" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.19.30 PM.mp4" data-answer="goodevening" data-options="goodevening|goodmorning|Hello|Thanks"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="How are you" data-subtitle="Learn the sign of How are you" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.23.03 PM.mp4" data-answer="How are you" data-options="How are you|Goodbye|Please|Sorry"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Goodbye" data-subtitle="Learn the sign of Goodbye" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.23.55 PM.mp4" data-answer="Goodbye" data-options="Goodbye|Hello|Thanks|Today"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Please" data-subtitle="Learn the sign of Please" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.25.04 PM.mp4" data-answer="Please" data-options="Please|Thanks|Sorry|I love you"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Sorry" data-subtitle="Learn the sign of Sorry" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.26.00 PM.mp4" data-answer="Sorry" data-options="Sorry|Thanks|Yes|No"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Home" data-subtitle="Learn the sign of Home" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.27.29 PM.mp4" data-answer="Home" data-options="Home|Work|School|University"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="School" data-subtitle="Learn the sign of School" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.17.10 PM.mp4" data-answer="School" data-options="School|University|Hospital|Home"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="University" data-subtitle="Learn the sign of University" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.16.13 PM.mp4" data-answer="University" data-options="University|School|Hospital|friend"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Mother" data-subtitle="Learn the sign of Mother" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.09.22 PM.mp4" data-answer="Mother" data-options="Mother|Father|Brother|Sister"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Father" data-subtitle="Learn the sign of Father" data-video="videos/laaaa/videos/laaaa/WhatsApp Video 2026-03-30 at 10.08.49 PM.mp4" data-answer="Father" data-options="Father|Mother|Brother|Sister"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Sister" data-subtitle="Learn the sign of Sister" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.08.34 PM.mp4" data-answer="Sister" data-options="Sister|Brother|Mother|Father"></div>
  <div class="lesson-data-item" data-lang="en" data-category="words" data-title="Brother" data-subtitle="Learn the sign of Brother" data-video="videos/laaaa/WhatsApp Video 2026-03-30 at 10.08.11 PM.mp4" data-answer="Brother" data-options="Brother|Sister|Father|Mother"></div>

  <!-- ==================== CHALLENGE DATA (AR) ==================== -->
  <div class="challenge-data-item" data-lang="ar" data-category="letters" data-title="تحدي الحروف 1" data-video="videos/challenge/ar/letters/1.mp4" data-answer="أ" data-options="أ|ب|ت|ث"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="letters" data-title="تحدي الحروف 2" data-video="videos/challenge/ar/letters/2.mp4" data-answer="ب" data-options="ب|ت|ث|ج"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="letters" data-title="تحدي الحروف 3" data-video="videos/challenge/ar/letters/3.mp4" data-answer="ت" data-options="ت|ث|ج|ح"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="letters" data-title="تحدي الحروف 4" data-video="videos/challenge/ar/letters/4.mp4" data-answer="ث" data-options="ث|ج|ح|خ"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="letters" data-title="تحدي الحروف 5" data-video="videos/challenge/ar/letters/5.mp4" data-answer="ج" data-options="ج|ح|خ|د"></div>

  <div class="challenge-data-item" data-lang="ar" data-category="numbers" data-title="تحدي الأرقام 1" data-video="videos/challenge/ar/numbers/1.mp4" data-answer="0" data-options="0|1|2|3"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="numbers" data-title="تحدي الأرقام 2" data-video="videos/challenge/ar/numbers/2.mp4" data-answer="1" data-options="1|2|3|4"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="numbers" data-title="تحدي الأرقام 3" data-video="videos/challenge/ar/numbers/3.mp4" data-answer="2" data-options="2|3|4|5"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="numbers" data-title="تحدي الأرقام 4" data-video="videos/challenge/ar/numbers/4.mp4" data-answer="3" data-options="3|4|5|6"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="numbers" data-title="تحدي الأرقام 5" data-video="videos/challenge/ar/numbers/5.mp4" data-answer="4" data-options="4|5|6|7"></div>

  <div class="challenge-data-item" data-lang="ar" data-category="words" data-title="تحدي الكلمات 1" data-video="videos/challenge/ar/words/1.mp4" data-answer="مرحبا" data-options="مرحبا|شكرا|نعم|لا"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="words" data-title="تحدي الكلمات 2" data-video="videos/challenge/ar/words/2.mp4" data-answer="شكرا" data-options="شكرا|مرحبا|نعم|لا"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="words" data-title="تحدي الكلمات 3" data-video="videos/challenge/ar/words/3.mp4" data-answer="نعم" data-options="نعم|لا|شكرا|مرحبا"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="words" data-title="تحدي الكلمات 4" data-video="videos/challenge/ar/words/4.mp4" data-answer="لا" data-options="لا|نعم|شكرا|مرحبا"></div>
  <div class="challenge-data-item" data-lang="ar" data-category="words" data-title="تحدي الكلمات 5" data-video="videos/challenge/ar/words/5.mp4" data-answer="أنا" data-options="أنا|أنت|هو|هي"></div>

  <!-- ==================== CHALLENGE DATA (EN) ==================== -->
  <div class="challenge-data-item" data-lang="en" data-category="letters" data-title="Letters Challenge 1" data-video="videos/challenge/en/letters/1.mp4" data-answer="A" data-options="A|B|C|D"></div>
  <div class="challenge-data-item" data-lang="en" data-category="letters" data-title="Letters Challenge 2" data-video="videos/challenge/en/letters/2.mp4" data-answer="B" data-options="B|C|D|E"></div>
  <div class="challenge-data-item" data-lang="en" data-category="letters" data-title="Letters Challenge 3" data-video="videos/challenge/en/letters/3.mp4" data-answer="C" data-options="C|D|E|F"></div>
  <!-- <div class="challenge-data-item" data-lang="en" data-category="letters" data-title="Letters Challenge 4" data-video="videos/challenge/en/letters/4.mp4" data-answer="D" data-options="D|E|F|G"></div> -->
  <!-- <div class="challenge-data-item" data-lang="en" data-category="letters" data-title="Letters Challenge 5" data-video="videos/challenge/en/letters/5.mp4" data-answer="E" data-options="E|F|G|H"></div> -->

</section>

<?php include 'includes/footer.php'; ?>

<script>
  window.currentUserName = <?php echo json_encode($userName); ?>;
</script>
<script src="js/Learning.js?v=<?php echo time(); ?>"></script>
</body>
</html>
