let parsedCompleted = {};
try {
  parsedCompleted = JSON.parse(localStorage.getItem("learning_completed") || "{}");
} catch (e) {}

const state = {
  lang: document.documentElement.lang || (localStorage.getItem("learning_lang") === "en" ? "en" : "ar"),
  category: "numbers",
  lessonIndex: 0,
  completed: parsedCompleted,
  challenge: {
    running: false,
    timer: null,
    seconds: 45,
    questions: [],
    current: 0,
    score: 0
  },
  showAllLessons: false,
  training: {
    running: false,
    signs: [],
    currentIndex: 0,
    currentSign: null,
    detectedSign: null,
    matchStartTime: 0,
    isTransitioning: false,
    history: [] // تخزين آخر الإطارات للكشف عن الحركة
  }
};

/*
|--------------------------------------------------------------------------
| النصوص حسب اللغة
|--------------------------------------------------------------------------
*/
const ui = {
  ar: {
    navHome: "الرئيسية",
    navContact: "اتصل بنا",
    profileMenuLink: "الملف الشخصي",
    logoutMenuLink: "تسجيل الخروج",
    currentLanguageText: "العربية",

    heroTitle: "تعلّم لغة الإشارة بخطوات واضحة",
    heroDesc: "ابدأ بالأرقام، ثم الأحرف، ثم الكلمات الأساسية، واختبر نفسك في كل مرحلة.",

    statLessons: "إجمالي الدروس",
    statCompleted: "الدروس المنجزة",
    statProgress: "التقدم",

    libraryTitle: "مكتبة التعلم",
    libraryDesc: "اختر القسم ثم اختر الدرس",
    searchPlaceholder: "ابحث عن درس...",
    catNumbers: "أرقام",
    catLetters: "أحرف",
    catWords: "كلمات",

    progressHead: "تقدمي",
    progressNumbersLabel: "الأرقام",
    progressLettersLabel: "الأحرف",
    progressWordsLabel: "الكلمات",

    markDoneBtn: "تم الإنجاز",
    nextLessonBtn: "التالي",

    tabChallenge: "تحدي",
    tabAchievements: "إنجازي",

    challengeTitle: "تحدي القسم",
    challengeHint: "شاهد فيديو الإشارة ثم اختر المعنى الصحيح",
    challengeTimerLabel: "الوقت",
    challengeScoreLabel: "النتيجة",
    startChallengeBtn: "ابدأ التحدي",

    achievementTitle: "إنجازي",
    achievementHint: "الدروس التي أنجزتها وما تبقى لك",
    achievementDoneLabel: "المنجز",
    achievementRemainingLabel: "المتبقي",
    achievementStageLabel: "المرحلة",

    footerPlatformName: "Unmute Platform",
    footerDesc: "منصة ذكية داعمة للتواصل، التعلّم، والخدمات المساعدة ضمن تجربة واضحة ومريحة وسهلة الاستخدام.",
    footerAddress: "العنوان: طولكرم، جامعة خضوري التقنية",
    footerContactText: "اتصل بنا: 0594489871",
    footerEmailBtn: "مراسلة الإدارة",
    copyrightText: "© 2026 Unmute Platform. جميع الحقوق محفوظة.",

    modalTitle: "تواصل مع إدارة Unmute",
    modalSubtitle: "سيتم إرسال رسالتك إلى: info@unmute.com",
    senderNamePlaceholder: "اسمك الكامل",
    senderEmailPlaceholder: "بريدك الإلكتروني",
    senderMsgPlaceholder: "اكتب رسالتك هنا...",
    modalSubmitBtn: "إرسال إلى الإدارة",

    videoSpeedDownBtn: "إبطاء",
    videoSpeedNormalBtn: "عادي",
    videoSpeedUpBtn: "تسريع",

    helpMessage: "يمكنك تغيير حجم الخط وألوان الصفحة لتجربة أوضح وأسهل.",
    sentMessage: "تم إرسال رسالتك بنجاح!",
    challengeCorrect: "إجابة صحيحة ✅",
    challengeWrong: "إجابة خاطئة ❌",
    challengeDone: "انتهى التحدي!",
    challengeTimeUp: "انتهى الوقت!",
    doneLabel: "منجز",
    remainingLabel: "متبقي",
    lrn_tab_train: "تدريب",
    lrn_train_title: "تدريب الذكاء الاصطناعي",
    lrn_train_hint: "قم بأداء الإشارة المطلوبة أمام الكاميرا للتحقق من دقتك.",
    lrn_train_start: "ابدأ التدريب الذكي",
    lrn_train_stop: "إيقاف الكاميرا",
    lrn_train_correct: "أحسنت! إجابة صحيحة ✅",
    lrn_analyzing: "جاري التحليل...",
    lrn_no_hand: "يرجى توجيه يدك للكاميرا",
    range_1: "أ - ر (1-10)",
    range_2: "ز - ف (11-20)",
    range_3: "ق - ي (21-28)"
  },
  en: {
    navHome: "Home",
    navContact: "Contact Us",
    profileMenuLink: "Profile",
    logoutMenuLink: "Logout",
    currentLanguageText: "English",

    heroTitle: "Learn Sign Language Step by Step",
    heroDesc: "Start with numbers, then letters, then basic words, and test yourself in every stage.",

    statLessons: "Total Lessons",
    statCompleted: "Completed",
    statProgress: "Progress",

    libraryTitle: "Learning Library",
    libraryDesc: "Choose a section, then choose a lesson",
    searchPlaceholder: "Search lesson...",
    catNumbers: "Numbers",
    catLetters: "Letters",
    catWords: "Words",

    progressHead: "My Progress",
    progressNumbersLabel: "Numbers",
    progressLettersLabel: "Letters",
    progressWordsLabel: "Words",

    markDoneBtn: "Mark Done",
    nextLessonBtn: "Next",

    tabChallenge: "Challenge",
    tabAchievements: "My Progress",

    challengeTitle: "Section Challenge",
    challengeHint: "Watch the sign video, then choose the correct meaning",
    challengeTimerLabel: "Time",
    challengeScoreLabel: "Score",
    startChallengeBtn: "Start Challenge",

    achievementTitle: "My Progress",
    achievementHint: "What you finished and what remains",
    achievementDoneLabel: "Done",
    achievementRemainingLabel: "Remaining",
    achievementStageLabel: "Stage",

    footerPlatformName: "Unmute Platform",
    footerDesc: "A smart platform supporting communication, learning, and helpful services through a clear and comfortable experience.",
    footerAddress: "Address: Tulkarm, Kadoorie Technical University",
    footerContactText: "Contact Us: 0594489871",
    footerEmailBtn: "Contact Administration",
    copyrightText: "© 2026 Unmute Platform. All rights reserved.",

    modalTitle: "Contact Unmute Admin",
    modalSubtitle: "Your message will be sent to: info@unmute.com",
    senderNamePlaceholder: "Full Name",
    senderEmailPlaceholder: "Email Address",
    senderMsgPlaceholder: "Write your message here...",
    modalSubmitBtn: "Send to Admin",

    videoSpeedDownBtn: "Slower",
    videoSpeedNormalBtn: "Normal",
    videoSpeedUpBtn: "Faster",

    helpMessage: "You can change font size and page colors for a clearer experience.",
    sentMessage: "Your message was sent successfully!",
    challengeCorrect: "Correct answer ✅",
    challengeWrong: "Wrong answer ❌",
    challengeDone: "Challenge finished!",
    challengeTimeUp: "Time is up!",
    doneLabel: "Done",
    remainingLabel: "Remaining",
    lrn_tab_train: "AI Training",
    lrn_train_title: "AI Sign Training",
    lrn_train_hint: "Perform the required sign in front of the camera to verify your accuracy.",
    lrn_train_start: "Start AI Training",
    lrn_train_stop: "Stop Camera",
    lrn_train_correct: "Well done! Correct sign ✅",
    lrn_analyzing: "Analyzing...",
    lrn_no_hand: "Please show your hand",
    range_1: "A - J (1-10)",
    range_2: "K - T (11-20)",
    range_3: "U - Z (21-26)"
  }
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHTML(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

function setPlaceholder(id, value) {
  const el = document.getElementById(id);
  if (el) el.placeholder = value;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/*
|--------------------------------------------------------------------------
| قراءة جميع الدروس من HTML
|--------------------------------------------------------------------------
| لا يوجد محتوى الدروس داخل JavaScript
| الجافاسكريبت فقط يقرأ عناصر HTML المخفية
|--------------------------------------------------------------------------
*/
function getAllLessons() {
  return Array.from(document.querySelectorAll(".lesson-data-item")).map((el, index) => ({
    id: `${el.dataset.lang}-${el.dataset.category}-${index}-${el.dataset.title}`,
    lang: el.dataset.lang,
    category: el.dataset.category,
    title: el.dataset.title,
    subtitle: el.dataset.subtitle,
    video: el.dataset.video,
    answer: el.dataset.answer,
    options: (el.dataset.options || "").split("|")
  }));
}

function getChallengeItems() {
  return Array.from(document.querySelectorAll(".challenge-data-item")).map((el, index) => ({
    id: `chal-${el.dataset.lang}-${el.dataset.category}-${index}`,
    lang: el.dataset.lang,
    category: el.dataset.category,
    title: el.dataset.title,
    video: el.dataset.video,
    answer: el.dataset.answer,
    options: (el.dataset.options || "").split("|")
  }));
}

function currentLanguageLessons() {
  return getAllLessons().filter(item => item.lang === state.lang);
}

function currentCategoryLessons() {
  return currentLanguageLessons().filter(item => item.category === state.category);
}

function currentLesson() {
  return currentCategoryLessons()[state.lessonIndex] || currentCategoryLessons()[0];
}

function saveCompleted() {
  localStorage.setItem("learning_completed", JSON.stringify(state.completed));
}

function isDone(id) {
  return !!state.completed[id];
}

function markDone() {
  const lesson = currentLesson();
  if (!lesson) return;
  state.completed[lesson.id] = true;
  saveCompleted();
  renderAll();
}

function countAll() {
  return currentLanguageLessons().length;
}

function countDone() {
  return currentLanguageLessons().filter(item => isDone(item.id)).length;
}

function progress(category) {
  const lessons = currentLanguageLessons().filter(item => item.category === category);
  const done = lessons.filter(item => isDone(item.id)).length;
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  return { done, total: lessons.length, percent };
}

function currentStage() {
  const numbers = progress("numbers").percent;
  const letters = progress("letters").percent;
  const words = progress("words").percent;

  if (words >= 60) return 3;
  if (letters >= 60) return 2;
  return 1;
}

/*
|--------------------------------------------------------------------------
| تطبيق النصوص حسب اللغة
|--------------------------------------------------------------------------
*/
function applyLanguage() {
  const t = ui[state.lang];

  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  localStorage.setItem("learning_lang", state.lang);

  setText("userDisplayName", window.currentUserName || "User");
  setText("navHome", t.navHome);
  setText("navContact", t.navContact);
  setText("profileMenuLink", t.profileMenuLink);
  setText("logoutMenuLink", t.logoutMenuLink);
  setText("currentLanguageText", t.currentLanguageText);

  setText("heroTitle", t.heroTitle);
  setText("heroDesc", t.heroDesc);

  setText("statLessons", t.statLessons);
  setText("statCompleted", t.statCompleted);
  setText("statProgress", t.statProgress);

  setText("libraryTitle", t.libraryTitle);
  setText("libraryDesc", t.libraryDesc);
  setPlaceholder("lessonSearch", t.searchPlaceholder);
  setText("catNumbers", t.catNumbers);
  setText("catLetters", t.catLetters);
  setText("catWords", t.catWords);

  setText("progressHead", t.progressHead);
  setText("progressNumbersLabel", t.progressNumbersLabel);
  setText("progressLettersLabel", t.progressLettersLabel);
  setText("lrn_prog_wor", t.lrn_prog_wor);

  setText("markDoneBtn", t.markDoneBtn);
  setText("nextLessonBtn", t.nextLessonBtn);

  setText("tabChallenge", t.tabChallenge);
  setText("tabAchievements", t.tabAchievements);

  setText("textTriggerTraining", t.lrn_tab_train);
  setText("textTriggerChallenge", t.tabChallenge);
  setText("textTriggerAchievements", t.tabAchievements);

  setText("challengeTitle", t.challengeTitle);
  setText("challengeHint", t.challengeHint);
  setText("challengeTimerLabel", t.challengeTimerLabel);
  setText("challengeScoreLabel", t.challengeScoreLabel);
  setText("startChallengeBtn", t.startChallengeBtn);

  setText("achievementTitle", t.achievementTitle);
  setText("achievementHint", t.achievementHint);
  setText("achievementDoneLabel", t.achievementDoneLabel);
  setText("achievementRemainingLabel", t.achievementRemainingLabel);
  setText("achievementStageLabel", t.achievementStageLabel);

  setText("videoSpeedDownBtn", t.videoSpeedDownBtn);
  setText("videoSpeedNormalBtn", t.videoSpeedNormalBtn);
  setText("videoSpeedUpBtn", t.videoSpeedUpBtn);
  setText("challengeSpeedDownBtn", t.videoSpeedDownBtn);
  setText("challengeSpeedNormalBtn", t.videoSpeedNormalBtn);
  setText("challengeSpeedUpBtn", t.videoSpeedUpBtn);

  setText("footerPlatformName", t.footerPlatformName);
  setText("footerDesc", t.footerDesc);
  setHTML("footerAddress", `<i class="fas fa-map-marker-alt"></i> ${t.footerAddress}`);
  setHTML("footerContactText", `<i class="fas fa-phone"></i> ${t.footerContactText}`);
  setHTML("footerEmailBtn", `<i class="fas fa-envelope"></i> ${t.footerEmailBtn}`);
  setText("copyrightText", t.copyrightText);

  setText("modalTitle", t.modalTitle);
  setText("modalSubtitle", t.modalSubtitle);
  setPlaceholder("senderName", t.senderNamePlaceholder);
  setPlaceholder("senderEmail", t.senderEmailPlaceholder);
  setPlaceholder("senderMsg", t.senderMsgPlaceholder);
  setText("modalSubmitBtn", t.modalSubmitBtn);

  setText("tabTraining", t.lrn_tab_train);
  setText("trainingTitle", t.lrn_train_title);
  setText("trainingHint", t.lrn_train_hint);
  setText("startTrainingBtn", t.lrn_train_start);

  // تحديث نصوص أزرار نطاقات الأحرف
  const rangeBtns = document.querySelectorAll(".range-btn");
  if (rangeBtns.length >= 3) {
    rangeBtns[0].textContent = t.range_1;
    rangeBtns[1].textContent = t.range_2;
    rangeBtns[2].textContent = t.range_3;
  }
}

function renderLessonList() {
  const list = document.getElementById("lessonList");
  const searchValue = document.getElementById("lessonSearch").value.trim().toLowerCase();

  list.innerHTML = "";

  const allCategoryLessons = currentCategoryLessons();
  let filtered = allCategoryLessons;
  if (searchValue) {
    filtered = filtered.filter(lesson => lesson.title.toLowerCase().includes(searchValue));
  }

  const total = filtered.length;
  if (!state.showAllLessons && !searchValue) {
    filtered = filtered.slice(0, 5);
  }

  filtered.forEach((lesson) => {
    const index = allCategoryLessons.indexOf(lesson);
    const item = document.createElement("div");
    item.className = `lesson-item ${index === state.lessonIndex ? "active" : ""}`;
    item.innerHTML = `
      <div class="lesson-info">
        <h5>${lesson.title}</h5>
        <p>${lesson.subtitle}</p>
      </div>
      <div class="lesson-status ${isDone(lesson.id) ? "done" : ""}">
        ${isDone(lesson.id) ? "✓" : index + 1}
      </div>
    `;

    item.addEventListener("click", () => {
      state.lessonIndex = index;
      renderAll();
    });

    list.appendChild(item);
  });

  if (total > 5 && !searchValue) {
    const btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.style.width = "100%";
    btn.style.marginTop = "10px";
    btn.textContent = state.showAllLessons 
      ? (state.lang === "ar" ? "إظهار أقل" : "Show Less") 
      : (state.lang === "ar" ? "إظهار المزيد" : "Show More");
    
    btn.addEventListener("click", () => {
      state.showAllLessons = !state.showAllLessons;
      renderLessonList();
    });
    list.appendChild(btn);
  }
}

function renderCurrentLesson() {
  try {
    const lesson = currentLesson();
    if (!lesson) return;

    const labels = {
      ar: { numbers: "الأرقام", letters: "الأحرف", words: "الكلمات" },
      en: { numbers: "Numbers", letters: "Letters", words: "Words" }
    };

    setText("currentCategoryLabel", labels[state.lang][state.category]);
    setText("lessonTitle", lesson.title);
    setText("lessonSubtitle", lesson.subtitle);

    const video = document.getElementById("lessonVideo");
    if (video) {
      video.src = encodeURI(lesson.video || "");
      video.load();
      video.playbackRate = 1;
    }
  } catch (e) {
    console.error("Error in renderCurrentLesson:", e);
  }
}


/*
|--------------------------------------------------------------------------
| التحدي الحقيقي
|--------------------------------------------------------------------------
| - يختار 5 دروس عشوائية من نفس القسم الحالي
| - لكل سؤال:
|   1) يشغّل فيديو الإشارة
|   2) يطلب اختيار المعنى الصحيح
|--------------------------------------------------------------------------
*/
function buildChallengeQuestions() {
  const allChal = getChallengeItems().filter(item => item.lang === state.lang && item.category === state.category);
  
  // If no specific challenge items found, fallback to lessons (prevent crash)
  const pool = allChal.length > 0 ? allChal : currentCategoryLessons();
  
  return shuffle(pool).slice(0, 5).map(item => ({
    video: item.video,
    answer: item.answer,
    options: shuffle(item.options)
  }));
}

function renderChallengeQuestion() {
  const t = ui[state.lang];
  const challengeVideo = document.getElementById("challengeVideo");
  const questionBox = document.getElementById("challengeQuestion");
  const optionsBox = document.getElementById("challengeOptions");
  const scoreBox = document.getElementById("challengeScore");

  if (!state.challenge.running || state.challenge.current >= state.challenge.questions.length) {
    renderChallengeResults();
    return;
  }
}

function renderChallengeResults() {
  const t = ui[state.lang];
  const optionsBox = document.getElementById("challengeOptions");
  const questionBox = document.getElementById("challengeQuestion");
  const videoWrap = document.querySelector(".challenge-video-wrap");
  const score = state.challenge.score;
  const total = state.challenge.questions.length;
  const timeTaken = 45 - state.challenge.seconds;
  
  clearInterval(state.challenge.timer);
  state.challenge.running = false;

  // إخفاء الفيديو وأزرار السرعة
  if (videoWrap) videoWrap.style.display = "none";
  
  const isSuccess = score >= 3;
  const themeClass = isSuccess ? "chal-success" : "chal-failure";
  const icon = isSuccess ? "🎉" : "💪";
  const msg = isSuccess 
    ? (state.lang === 'ar' ? "أحسنت! لقد اجتزت التحدي بنجاح" : "Excellent! You passed the challenge")
    : (state.lang === 'ar' ? "حاول مرة أخرى، يمكنك فعلها!" : "Try again, you can do it!");

  optionsBox.innerHTML = `
    <div class="challenge-results-card ${themeClass}">
      <div class="result-icon">${icon}</div>
      <h3 class="result-msg">${msg}</h3>
      <div class="result-stats">
        <div class="stat-item">
          <span>${t.lrn_chal_score}</span>
          <strong>${score} / ${total}</strong>
        </div>
        <div class="stat-item">
          <span>${state.lang === 'ar' ? "الوقت المستغرق" : "Time Taken"}</span>
          <strong>${timeTaken} ${state.lang === 'ar' ? "ثانية" : "sec"}</strong>
        </div>
      </div>
      <button class="primary-btn" onclick="startChallenge()">${t.lrn_btn_start_chal}</button>
    </div>
  `;
  questionBox.textContent = t.challengeDone;
}

function renderChallengeQuestion() {
  const t = ui[state.lang];
  const challengeVideo = document.getElementById("challengeVideo");
  const questionBox = document.getElementById("challengeQuestion");
  const optionsBox = document.getElementById("challengeOptions");
  const scoreBox = document.getElementById("challengeScore");

  if (!state.challenge.running || state.challenge.current >= state.challenge.questions.length) {
    renderChallengeResults();
    return;
  }

  const current = state.challenge.questions[state.challenge.current];
  console.log("Loading challenge video:", current.video);

  const source = document.getElementById("challengeVideoSource");
  if (source) source.src = current.video;
  challengeVideo.src = current.video;
  
  challengeVideo.load();
  challengeVideo.playbackRate = 1;
  challengeVideo.play().catch(e => console.warn("Auto-play blocked:", e));

  questionBox.textContent = state.lang === "ar"
    ? "شاهد الفيديو ثم اختر المعنى الصحيح للإشارة"
    : "Watch the video, then choose the correct meaning of the sign";

  scoreBox.textContent = `${state.challenge.score} / ${state.challenge.questions.length}`;
  optionsBox.innerHTML = "";

  current.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.type = "button";
    btn.textContent = option;

    btn.addEventListener("click", () => {
      if (option === current.answer) {
        state.challenge.score++;
      }
      state.challenge.current++;
      renderChallengeQuestion();
    });

    optionsBox.appendChild(btn);
  });
}

window.startChallenge = startChallenge;
function startChallenge() {
  const t = ui[state.lang];
  clearInterval(state.challenge.timer);

  state.challenge.running = true;
  state.challenge.seconds = 45;
  state.challenge.questions = buildChallengeQuestions();
  state.challenge.current = 0;
  state.challenge.score = 0;
  
  // إظهار الفيديو مجدداً عند بدء التحدي
  const videoWrap = document.querySelector(".challenge-video-wrap");
  if (videoWrap) videoWrap.style.display = "block";

  document.getElementById("challengeTimer").textContent = state.challenge.seconds;
  renderChallengeQuestion();

  state.challenge.timer = setInterval(() => {
    state.challenge.seconds--;
    document.getElementById("challengeTimer").textContent = state.challenge.seconds;

    if (state.challenge.seconds <= 0) {
      clearInterval(state.challenge.timer);
      state.challenge.running = false;
      document.getElementById("challengeQuestion").textContent = t.challengeTimeUp;
      document.getElementById("challengeOptions").innerHTML = "";
    }
  }, 1000);
}

function updateBar(fillId, textId, percent) {
  const fill = document.getElementById(fillId);
  if (fill) fill.style.width = `${percent}%`;
  setText(textId, `${percent}%`);
}

function renderProgress() {
  const numbers = progress("numbers");
  const letters = progress("letters");
  const words = progress("words");

  updateBar("numbersProgressFill", "numbersProgressText", numbers.percent);
  updateBar("lettersProgressFill", "lettersProgressText", letters.percent);
  updateBar("wordsProgressFill", "wordsProgressText", words.percent);

  const total = countAll();
  const done = countDone();
  const overall = total ? Math.round((done / total) * 100) : 0;

  setText("totalLessonsCount", total);
  setText("completedLessonsCount", done);
  setText("overallProgressText", `${overall}%`);

  setText("achievementDoneCount", done);
  setText("achievementRemainingCount", total - done);
  setText("achievementCurrentStage", currentStage());
}

function renderAchievements() {
  const t = ui[state.lang];
  const box = document.getElementById("achievementList");
  box.innerHTML = "";

  currentCategoryLessons().forEach(lesson => {
    const item = document.createElement("div");
    item.className = `achievement-item ${isDone(lesson.id) ? "done" : ""}`;
    item.innerHTML = `
      <span>${lesson.title}</span>
      <small>${isDone(lesson.id) ? t.doneLabel : t.remainingLabel}</small>
    `;
    box.appendChild(item);
  });
}

function activateCategoryButtons() {
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === state.category);
  });
}

function renderAll() {
  try { renderLessonList(); } catch(e) { console.error(e); }
  try { renderCurrentLesson(); } catch(e) { console.error(e); }
  try { renderProgress(); } catch(e) { console.error(e); }
  try { renderAchievements(); } catch(e) { console.error(e); }
  try { activateCategoryButtons(); } catch(e) { console.error(e); }

  // تحديث رؤية محدد نطاق الأحرف عند الرندر العام
  const rangeSelector = document.getElementById("letterRangeSelector");
  if (rangeSelector) {
    rangeSelector.style.display = (state.category === 'letters') ? "flex" : "none";
  }
}

/*
|--------------------------------------------------------------------------
| التبويبات
|--------------------------------------------------------------------------
*/
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activatePanel(btn.dataset.panel);
    });
  });
}

function activatePanel(panelId) {
  document.querySelectorAll(".tab-btn").forEach(item => {
    item.classList.toggle("active", item.dataset.panel === panelId);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === panelId);
  });
}

window.togglePracticeArea = function(panelId) {
  const videoWrapper = document.getElementById("lessonVideoWrapper");
  const practiceWrapper = document.getElementById("practiceAreaWrapper");
  
  if (videoWrapper && practiceWrapper) {
    // Pause main video but don't hide it
    const mainVideo = document.getElementById("lessonVideo");
    if (mainVideo) mainVideo.pause();

    // Show practice area as a modal
    practiceWrapper.style.display = "flex";
    
    // Wait slightly to allow display:flex to apply before adding class for animation
    setTimeout(() => {
        practiceWrapper.classList.add("show-modal");
    }, 10);

    activatePanel(panelId);
  }
};

window.closePracticeArea = function() {
  const practiceWrapper = document.getElementById("practiceAreaWrapper");
  
  if (practiceWrapper) {
    // Hide practice area modal via animation class
    practiceWrapper.classList.remove("show-modal");
    
    // Wait for transition to finish before hiding it from flow
    setTimeout(() => {
        practiceWrapper.style.display = "none";
    }, 400); // 400ms matches the CSS transition time
    
    // Stop training if running
    if (state.training && state.training.running) {
      if (typeof stopTrainingCam === "function") {
         stopTrainingCam();
      }
    }
  }
};

/*
|--------------------------------------------------------------------------
| قوائم الهيدر
|--------------------------------------------------------------------------
*/
function setupHeaderMenus() {
  const languageBtn = document.getElementById("languageBtn");
  const languageMenu = document.getElementById("languageMenu");
  const accessibilityBtn = document.getElementById("accessibilityBtn");
  const accessibilityMenu = document.getElementById("accessibilityMenu");
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenu = document.getElementById("userMenu");

  function closeMenus() {
    languageMenu?.classList.remove("show");
    accessibilityMenu?.classList.remove("show");
    userMenu?.classList.remove("show");
  }

  languageBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = languageMenu.classList.contains("show");
    closeMenus();
    if (!open) languageMenu.classList.add("show");
  });

  accessibilityBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = accessibilityMenu.classList.contains("show");
    closeMenus();
    if (!open) accessibilityMenu.classList.add("show");
  });

  userMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = userMenu.classList.contains("show");
    closeMenus();
    if (!open) userMenu.classList.add("show");
  });

  languageMenu?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.tagName === "BUTTON") {
      state.lang = e.target.dataset.lang;
      state.lessonIndex = 0;
      applyLanguage();
      renderAll();
      languageMenu.classList.remove("show");
    }
  });

  accessibilityMenu?.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", (e) => {
    const clickedTrigger =
      languageBtn?.contains(e.target) ||
      accessibilityBtn?.contains(e.target) ||
      userMenuBtn?.contains(e.target);

    const clickedInside =
      languageMenu?.contains(e.target) ||
      accessibilityMenu?.contains(e.target) ||
      userMenu?.contains(e.target);

    if (!clickedTrigger && !clickedInside) {
      closeMenus();
    }
  });
}

/*
|--------------------------------------------------------------------------
| الوصول
|--------------------------------------------------------------------------
*/
function setupAccessibility() {
  const increaseFontBtn = document.getElementById("increaseFontBtn");
  const decreaseFontBtn = document.getElementById("decreaseFontBtn");
  const bgColorInput = document.getElementById("bgColorInput");
  const textColorInput = document.getElementById("textColorInput");
  const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");
  const helpBtn = document.getElementById("helpBtn");

  increaseFontBtn?.addEventListener("click", () => {
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (current < 24) {
      document.documentElement.style.fontSize = `${current + 2}px`;
    }
  });

  decreaseFontBtn?.addEventListener("click", () => {
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (current > 12) {
      document.documentElement.style.fontSize = `${current - 2}px`;
    }
  });

  bgColorInput?.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--page-bg", e.target.value);
  });

  textColorInput?.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--page-text", e.target.value);
  });

  resetAccessibilityBtn?.addEventListener("click", () => {
    document.documentElement.style.fontSize = "16px";
    document.documentElement.style.setProperty("--page-bg", "#edf4ff");
    document.documentElement.style.setProperty("--page-text", "#1f2d3d");
    if (bgColorInput) bgColorInput.value = "#edf4ff";
    if (textColorInput) textColorInput.value = "#1f2d3d";
  });

  helpBtn?.addEventListener("click", () => {
    showToast(ui[state.lang].helpMessage);
  });
}

/*
|--------------------------------------------------------------------------
| تدريب الذكاء الاصطناعي (AI Training)
|--------------------------------------------------------------------------
*/

function detectSignAI(landmarks, history = []) {
  if (!landmarks) return null;

  // دالة مساعدة لحساب الحركة (Motion Detection)
  const getMotion = () => {
    if (history.length < 5) return { x: 0, y: 0 };
    // استخدام الفرق التراكمي بدلاً من البداية والنهاية لتقليل الحساسية المفاجئة
    let tx = 0, ty = 0;
    for (let i = 1; i < history.length; i++) {
        tx += Math.abs(history[i][0].x - history[i-1][0].x);
        ty += Math.abs(history[i][0].y - history[i-1][0].y);
    }
    return { x: tx, y: ty };
  };

  const motion = getMotion();
  const isMoving = motion.x > 0.2 || motion.y > 0.2;
  const isWaving = motion.x > 0.3;
  const isLifting = motion.y > 0.3;
  const isFingerOpen = (tip, pip) => landmarks[tip].y < landmarks[pip].y;
  const indexOpen = isFingerOpen(8, 6);
  const middleOpen = isFingerOpen(12, 10);
  const ringOpen = isFingerOpen(16, 14);
  const pinkyOpen = isFingerOpen(20, 18);
  const thumbOpen = Math.abs(landmarks[4].x - landmarks[17].x) > Math.abs(landmarks[3].x - landmarks[17].x);
  const thumbUp = landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[5].y;

  const openCount = [indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;
  
  const dist = (p1, p2) => Math.sqrt(Math.pow(landmarks[p1].x - landmarks[p2].x, 2) + Math.pow(landmarks[p1].y - landmarks[p2].y, 2));
  const thumbIndexDist = dist(4, 8);

  const cat = state.category;

  // 1) إيماءات مركبة (Words Category)
  if (cat === "words") {
    // A) الحركات الأصلية (الموجودة مسبقاً)
    if (thumbOpen && indexOpen && !middleOpen && !ringOpen && pinkyOpen) return "أحبك";
    if (!thumbOpen && indexOpen && !middleOpen && !ringOpen && pinkyOpen) return "رائع";
    if (thumbOpen && !indexOpen && !middleOpen && !ringOpen && pinkyOpen) return "اتصال";
    if (thumbIndexDist < 0.05 && middleOpen && ringOpen && pinkyOpen) return "أوكي";
    if (indexOpen && middleOpen && !ringOpen && !pinkyOpen && thumbOpen) return "سلام";
    
    // إضافات للحركة (Dynamic Moves)
    if (openCount === 4) {
        if (isWaving) return "السلام عليكم";
        if (isLifting) return "صباح الخير";
        if (isMoving && !thumbOpen) return "شكرا";
    }
    
    if (thumbUp && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return "ممتاز";

    // B) الحركات الـ 15 الجديدة (أو تدعيم الموجود)
    // 1. السلام عليكم / Hello (تم نقلها للحركة)
    
    // 2. شكرا / Thanks (تم نقلها للحركة)
    
    // 3. صباح الخير / Good morning / مساء الخير / Good evening (كف مفتوح مع اتجاه الإبهام)
    if (openCount === 4 && thumbOpen && landmarks[4].x < landmarks[17].x) return "صباح الخير";
    if (openCount === 4 && thumbOpen && landmarks[4].x > landmarks[17].x) return "مساء الخير";
    
    // 4. كيف حالك / How are you (إصبعين مفتوحين بشكل حرف V مع إبهام مغلق)
    if (indexOpen && middleOpen && !ringOpen && !pinkyOpen && !thumbOpen) return "كيف حالك";
    
    // 5. لو سمحت / Please / Please (إبهام ملامس للسبابة - شكل قلب صغير)
    if (openCount === 4 && thumbOpen && dist(4, 8) < 0.1) return "لو سمحت";
    
    // 6. آسف / Sorry (قبضة مغلقة تماماً)
    if (openCount === 0 && !thumbOpen) return "آسف";
    
    // 7. البيت / Home / مدرسة / School / جامعة / University
    // البيت: شكل سقف (3 أصابع)
    if (indexOpen && middleOpen && ringOpen && !pinkyOpen && !thumbOpen) return "البيت";
    // مدرسة: إصبع واحد مرفوع (سبابة)
    if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen && !thumbOpen) return "مدرسة";
    // جامعة: إبهام وخنصر (مثل J)
    if (thumbOpen && pinkyOpen && !indexOpen && !middleOpen && !ringOpen) return "جامعة";
    
    // 8. أفراد العائلة (أمي، أبي، أخ، أخت) - تعتمد على موقع الإبهام/السبابة
    // أبي: إبهام للأعلى
    if (thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen && landmarks[4].y < landmarks[2].y) return "أبي";
    // أمي: إبهام للأسفل أو ملامس للذقن (افتراضياً)
    if (thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen && landmarks[4].y > landmarks[2].y) return "أمي";
    // أخ: سبابة للأعلى مع إبهام
    if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen && thumbOpen && landmarks[8].y < landmarks[6].y) return "أخ";
    // أخت: سبابة للأسفل
    if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen && thumbOpen && landmarks[8].y > landmarks[6].y) return "أخت";
    
    // 9. قلق / Anxious (أصابع متقاربة جداً)
    if (openCount === 4 && thumbOpen && dist(4, 20) < 0.1) return "قلقق";
  }

  // 2) أرقام (Numbers Category)
  if (cat === "numbers") {
    if (thumbIndexDist < 0.05 && !middleOpen && !ringOpen && !pinkyOpen) return "0";
    if (indexOpen && openCount === 1 && !thumbOpen) return "1";
    if (indexOpen && middleOpen && openCount === 2 && !thumbOpen) return "2";
    const palmSize = dist(5, 17) || 0.1;
    
    // 6-9: الإبهام يلمس أحد الأصابع
    if (dist(4, 20)/palmSize < 0.8 && indexOpen && middleOpen && ringOpen) return "6";
    if (dist(4, 16)/palmSize < 0.8 && indexOpen && middleOpen && pinkyOpen) return "7";
    if (dist(4, 12)/palmSize < 0.8 && indexOpen && ringOpen && pinkyOpen) return "8";
    if (dist(4, 8)/palmSize < 0.8 && middleOpen && ringOpen && pinkyOpen) return "9";

    // 0-5: العد العادي
    if (thumbIndexDist < 0.05 && !middleOpen && !ringOpen && !pinkyOpen) return "0";
    if (indexOpen && openCount === 1 && !thumbOpen) return "1";
    if (indexOpen && middleOpen && openCount === 2 && !thumbOpen) return "2";
    if (thumbOpen && indexOpen && middleOpen && !ringOpen && !pinkyOpen) return "3";
    if (openCount === 4 && !thumbOpen) return "4";
    if (openCount === 4 && thumbOpen) return "5";
    
    if (thumbUp && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return "10";
  }

  // 3) حروف (Letters Category)
  if (cat === "letters") {
    const palmSize = dist(0, 9) || 0.1; // استخدام طول الكف بدلاً من عرضه لضمان الاستقرار عند دوران اليد
    const isFist = openCount === 0;
    const indexRel = dist(8, 5) / palmSize;
    const middleRel = dist(12, 9) / palmSize;
    const ringRel = dist(16, 13) / palmSize;
    const pinkyRel = dist(20, 17) / palmSize;
    
    // ن (Noon) - سبابة وإبهام مفتوحان (كما في الصورة)
    if (indexRel > 0.75 && thumbOpen && middleRel < 0.4 && ringRel < 0.4) return "ن";

    // أ (Thumbs Up أو كف مفتوح)
    if (thumbUp && openCount === 0) return "أ";
    if (openCount === 4 && thumbOpen) return "أ";

    // ب، ت، ث
    const imSpread = dist(8, 12) / palmSize; // الانفراج بين السبابة والوسطى

    if (indexOpen && openCount === 1 && indexRel > 0.75 && !thumbOpen) {
        if (dist(4, 12) / palmSize < 0.4) return "ف";
        return "ب";
    }
    
    // ط، ظ (شكل مقص مائل - كما في الصورة المرسلة)
    if (indexRel > 0.7 && middleRel > 0.7 && ringRel < 0.5 && imSpread > 0.6) return "ط";

    if (indexOpen && middleOpen && openCount === 2 && !thumbOpen) {
       if (imSpread < 0.5) return "ت";
       // إذا كانت السبابة نازلة قليلاً عن الوسطى فهي ز، وإلا فهي ت
       return (indexRel < middleRel * 0.8) ? "ز" : "ت";
    }
    if (middleOpen && !indexOpen && openCount === 1) return "ز";
    if (indexOpen && middleOpen && ringOpen && openCount === 3) return "ث";

    // ج، ح، خ (شكل مخلب - الصورة الأولى)
    const isCurved = (r) => r > 0.5 && r < 0.9;
    if (isCurved(indexRel) && isCurved(middleRel) && isCurved(ringRel) && isCurved(pinkyRel)) return "هـ";
    if (isCurved(indexRel) && isCurved(middleRel) && isCurved(ringRel) && !thumbOpen) return "ج";
    
    // د، ذ (شكل نصف دائرة - الصورة الثانية)
    if (isCurved(indexRel) && middleRel < 0.5 && ringRel < 0.5 && pinkyRel < 0.5 && !thumbOpen) return "د";

    // ر، ز (Ra/Zay) - السبابة ممدودة بشكل مستقيم
    if (indexRel > 1.0 && openCount <= 1 && !thumbOpen) return "ر";
    
    // س، ش (Seen/Sheen)
    if (openCount >= 3 && !thumbOpen && indexRel > 0.9) {
       const spread = (dist(8, 12) + dist(12, 16) + dist(16, 20)) / palmSize;
       return (spread > 1.0) ? "ش" : "س";
    }

    // م
    // م (Meem) - حسب طلب المستخدم: إغلاق اليد ورفع الخنصر
    if (pinkyOpen && !indexOpen && !middleOpen && !ringOpen) return "م";
    
    // ي، ل، ك، و، ع
    if (!indexOpen && !middleOpen && !ringOpen && pinkyOpen && !thumbOpen) return "ي";
    if (indexRel > 0.8 && thumbOpen && middleRel < 0.5 && ringRel < 0.5 && pinkyRel < 0.5) return "ل";
    if (openCount >= 3 && dist(4, 13) < 0.15) return "ك";
    
    // ق (Qaf) - سبابة ووسطى مع الإبهام (منقول للأعلى لضمان الأولوية)
    if (dist(4, 8) / palmSize < 0.3 && dist(4, 12) / palmSize < 0.3 && ringRel < 0.5 && pinkyRel < 0.5) return "ق";

    // و (Waw)
    if (thumbIndexDist < 0.08 && middleRel < 0.4 && ringRel < 0.4 && pinkyRel < 0.4) return "و";
    if (indexRel > 0.7 && middleRel > 0.7 && ringRel < 0.5 && pinkyRel < 0.5) {
        return (thumbOpen || thumbUp || landmarks[4].y < landmarks[3].y) ? "غ" : "ع";
    }

  }

  return null;
}

function onTrainingResults(results) {
  const canvas = document.getElementById("trainingCanvas");
  const video = document.getElementById("trainingWebCam");
  const feedback = document.getElementById("trainingFeedback");
  const liveRes = document.getElementById("trainingLiveResult");
  const t = ui[state.lang];

  if (!canvas || !video) return;

  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let detected = null;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    
    // تحديث سجل الحركة
    state.training.history.push(landmarks);
    if (state.training.history.length > 10) state.training.history.shift();

    if (typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
      drawLandmarks(ctx, landmarks, {color: '#FF0000', lineWidth: 1});
    }

    detected = detectSignAI(landmarks, state.training.history);

    const target = state.training.currentSign;
    const cleanTarget = target ? target.answer.replace("الحرف ", "").replace("الرقم ", "").replace("كلمة ", "") : "";

    // منطق المطابقة مع دعم الأسماء المترادفة (Aliases) واللغتين
    const isMatch = target && detected && (
                    (detected === cleanTarget || detected === target.answer) ||
                    // التراجم (Arabic to English)
                    (detected === "السلام عليكم" && (cleanTarget === "Hello" || cleanTarget === "سلام" || cleanTarget === "شكرا")) ||
                    (detected === "شكرا" && (cleanTarget === "Thanks" || cleanTarget === "السلام عليكم")) ||
                    (detected === "صباح الخير" && cleanTarget === "goodmorning") ||
                    (detected === "مساء الخير" && cleanTarget === "goodevening") ||
                    (detected === "كيف حالك" && cleanTarget === "How are you") ||
                    (detected === "آسف" && cleanTarget === "Sorry") ||
                    (detected === "لو سمحت" && (cleanTarget === "Please" || cleanTarget === "Goodbye")) ||
                    (detected === "البيت" && cleanTarget === "Home") ||
                    (detected === "مدرسة" && cleanTarget === "School") ||
                    (detected === "جامعة" && cleanTarget === "University") ||
                    (detected === "أمي" && cleanTarget === "Mother") ||
                    (detected === "أبي" && cleanTarget === "Father") ||
                    (detected === "أخ" && cleanTarget === "Brother") ||
                    (detected === "أخت" && cleanTarget === "Sister") ||
                    (detected === "قلقق" && cleanTarget === "Anxious") ||
                    // الحروف والأرقام
                    (detected === "ممتاز" && cleanTarget === "أ") ||
                    (detected === "أ" && cleanTarget === "ممتاز") ||
                    (detected === "1" && cleanTarget === "ب") ||
                    (detected === "ب" && cleanTarget === "1") ||
                    (detected === "2" && cleanTarget === "ت") ||
                    (detected === "ت" && cleanTarget === "2") ||
                    (detected === "3" && cleanTarget === "ث") ||
                    (detected === "ث" && cleanTarget === "3") ||
                    (detected === "5" && cleanTarget === "أ") ||
                    (detected === "ج" && (cleanTarget === "ح" || cleanTarget === "خ")) ||
                    (detected === "ح" && (cleanTarget === "ج" || cleanTarget === "خ")) ||
                    (detected === "د" && cleanTarget === "ذ") ||
                    (detected === "ر" && cleanTarget === "ز") ||
                    (detected === "س" && (cleanTarget === "ص" || cleanTarget === "ض")) ||
                    (detected === "ط" && cleanTarget === "ظ") ||
                    (detected === "ظ" && cleanTarget === "ط") ||
                    (detected === "ت" && cleanTarget === "ع") ||
                    (detected === "ع" && cleanTarget === "ت") ||
                    (detected === "غ" && cleanTarget === "ع") ||
                    (detected === "ع" && cleanTarget === "غ") ||
                    (detected === "ب" && cleanTarget === "ف") ||
                    (detected === "ف" && cleanTarget === "ب") ||
                    (detected === "ك" && cleanTarget === "ق") ||
                    (detected === "ق" && cleanTarget === "ك") ||
                    (detected === "و" && cleanTarget === "ق") ||
                    (detected === "ق" && cleanTarget === "و") ||
                    (detected === "ي" && cleanTarget === "م") ||
                    (detected === "م" && cleanTarget === "ي") ||
                    (detected === "ل" && cleanTarget === "ن") ||
                    (detected === "ن" && cleanTarget === "ل") ||
                    (detected === "ج" && cleanTarget === "هـ") ||
                    (detected === "هـ" && cleanTarget === "ج") ||
                    (detected === "ه" && cleanTarget === "هـ") ||
                    (detected === "هـ" && cleanTarget === "ه")
    );

    // إذا كانت هناك مطابقة، نظهر اسم الهدف كنوع من التأكيد للمستخدم
    if (isMatch) detected = cleanTarget;
    
    state.training.detectedSign = detected;
    liveRes.textContent = detected || t.lrn_analyzing;

    if (isMatch && !state.training.isTransitioning) {
        if (state.training.matchStartTime === 0) {
           state.training.matchStartTime = Date.now();
        } else if (Date.now() - state.training.matchStartTime > 1200) {
           state.training.isTransitioning = true;
           feedback.textContent = t.lrn_train_correct;
           feedback.classList.add("success");
           state.training.matchStartTime = 0;
           
           setTimeout(() => {
             feedback.classList.remove("success");
             feedback.textContent = "";
             state.training.isTransitioning = false;
             advanceTraining();
           }, 2000);
        }
    } else if (!state.training.isTransitioning) {
        state.training.matchStartTime = 0;
        feedback.textContent = "";
    }
  } else {
    // تصفير التاريخ عند اختفاء اليد لضمان عدم حدوث قفزات مفاجئة في الكشف
    state.training.history = [];
    liveRes.textContent = t.lrn_no_hand;
    state.training.matchStartTime = 0;
  }
  ctx.restore();
}

async function startTrainingCam() {
  const video = document.getElementById("trainingWebCam");
  const btn = document.getElementById("startTrainingBtn");
  const t = ui[state.lang];

  if (state.training.running) {
    stopTrainingCam();
    return;
  }

  try {
    btn.textContent = t.lrn_train_stop;
    btn.classList.add("danger-btn");
    state.training.running = true;

    if (typeof Hands !== 'undefined') {
        state.training.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        state.training.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        state.training.hands.onResults(onTrainingResults);

        state.training.camera = new Camera(video, {
            onFrame: async () => {
                if (state.training.running) {
                    await state.training.hands.send({ image: video });
                }
            },
            width: 640,
            height: 480
        });

        await state.training.camera.start();
        loadFirstTrainingSign();
    }

  } catch (e) {
    console.error(e);
    alert("Camera error!");
    stopTrainingCam();
  }
}

function stopTrainingCam() {
  const btn = document.getElementById("startTrainingBtn");
  const t = ui[state.lang];

  state.training.running = false;
  if (state.training.camera) state.training.camera.stop();
  if (state.training.hands) state.training.hands.close();
  
  state.training.camera = null;
  state.training.hands = null;

  btn.textContent = t.lrn_train_start;
  btn.classList.remove("danger-btn");
  document.getElementById("trainingLiveResult").textContent = "---";
}

function loadFirstTrainingSign() {
  state.training.signs = currentCategoryLessons();
  renderTrainingSign(0);
}

function renderTrainingSign(index) {
  const sign = state.training.signs[index];
  if (!sign) {
    alert(state.lang === 'ar' ? "أحسنت! أكملت جميع تدريبات هذا القسم." : "Well done! You finished all training for this section.");
    stopTrainingCam();
    return;
  }

  state.training.currentSign = sign;
  setText("targetSignName", sign.title);

  const img = document.getElementById("targetSignImg");
  const vid = document.getElementById("targetSignVid");

  if (sign.video) {
    vid.src = sign.video;
    vid.style.display = "block";
    img.style.display = "none";
    vid.load();
    vid.play().catch(() => {});
  } else {
    // محاولة إظهار صورة من قاموس الإشارات إذا لم يتوفر فيديو
    const char = sign.answer;
    if (typeof signDict !== 'undefined' && signDict[char]) {
      img.src = signDict[char];
      img.style.display = "block";
      vid.style.display = "none";
    } else {
      img.style.display = "none";
      vid.style.display = "none";
    }
  }
}

function advanceTraining() {
  const currentIndex = state.training.signs.indexOf(state.training.currentSign);
  renderTrainingSign(currentIndex + 1);
}

  // setupFooterModal handled globally in footer.php

/*
|--------------------------------------------------------------------------
| أدوات التحكم بسرعة الفيديو
|--------------------------------------------------------------------------
| هذه الدالة تستخدم للفيديو الرئيسي وفيديو التحدي
|--------------------------------------------------------------------------
*/
function attachVideoSpeedControls(videoId, downBtnId, normalBtnId, upBtnId) {
  const video = document.getElementById(videoId);
  const downBtn = document.getElementById(downBtnId);
  const normalBtn = document.getElementById(normalBtnId);
  const upBtn = document.getElementById(upBtnId);

  downBtn?.addEventListener("click", () => {
    if (video) video.playbackRate = 0.75;
  });

  normalBtn?.addEventListener("click", () => {
    if (video) video.playbackRate = 1;
  });

  upBtn?.addEventListener("click", () => {
    if (video) video.playbackRate = 1.25;
  });
}

function showToast(message) {
  const toast = document.getElementById("visualToast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function setupActions() {
  document.getElementById("markDoneBtn")?.addEventListener("click", markDone);

  document.getElementById("nextLessonBtn")?.addEventListener("click", () => {
    const lessons = currentCategoryLessons();
    if (state.lessonIndex < lessons.length - 1) {
      state.lessonIndex++;
      renderAll();
    }
  });

  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      state.lessonIndex = 0;
      renderAll();
      if (state.training.running) loadFirstTrainingSign();

      // إخفاء أو إظهار أزرار النطاقات بناءً على القسم المختار
      const rangeSelector = document.getElementById("letterRangeSelector");
      if (rangeSelector) {
        rangeSelector.style.display = (state.category === 'letters') ? "flex" : "none";
      }
    });
  });

  // مستمعات أحداث أزرار نطاقات الأحرف
  document.querySelectorAll(".range-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const startIndex = parseInt(btn.dataset.start);
      
      // تمييز الزر النشط
      document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // إذا كان التدريب يعمل، ننتقل فوراً للحرف
      if (state.training.running) {
        renderTrainingSign(startIndex);
      } else {
        // إذا لم يكن يعمل، نبدأه ثم ننتقل للحرف
        startTrainingCam().then(() => {
          setTimeout(() => renderTrainingSign(startIndex), 500);
        });
      }
    });
  });

  document.getElementById("lessonSearch")?.addEventListener("input", renderLessonList);
  document.getElementById("startChallengeBtn")?.addEventListener("click", startChallenge);
  document.getElementById("startTrainingBtn")?.addEventListener("click", startTrainingCam);
}

document.addEventListener("DOMContentLoaded", () => {
  applyLanguage();
  setupHeaderMenus();
  setupAccessibility();
  // setupFooterModal();
  setupTabs();
  setupActions();

  /* ربط أزرار سرعة الفيديو الرئيسي */
  attachVideoSpeedControls("lessonVideo", "videoSpeedDownBtn", "videoSpeedNormalBtn", "videoSpeedUpBtn");

  /* ربط أزرار سرعة فيديو التحدي */
  attachVideoSpeedControls("challengeVideo", "challengeSpeedDownBtn", "challengeSpeedNormalBtn", "challengeSpeedUpBtn");

  renderAll();
});