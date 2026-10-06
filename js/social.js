/*
  هذا الملف مسؤول عن كل التفاعل في صفحة المجتمع:
    ستغيير اللغة
   تحميل البيانات من السيرفر
   عرض المنشورات
   التعليقات واللايكات
   الأصدقاء
  الإشعارات
  المسنجر
   البحث عن الأشخاص والمنشورات 
  يعني اي شي في حركة هون 
*/

let lang = localStorage.getItem("unmute_lang") || "ar";
let currentFontScale = parseFloat(localStorage.getItem("unmute_font_scale") || "1");
let currentBgColor = localStorage.getItem("unmute_bg_color") || "#f4f8ff";
let currentTextColor = localStorage.getItem("unmute_text_color") || "#1f2b3d";

let currentChatId = null;
let toastTimer = null;
let notificationPoll = null;

let t = {};
let currentUser = null;
let posts = [];
let contacts = [];
let notifications = [];
let conversations = [];
let chatStore = {};
let friendRequests = [];

let currentImageData = "";
let currentVideoData = "";
let showAllMembers = false;
let showOnlyFriends = false;
let currentSearchMatches = [];

let speechRecognition = null;
let isRecordingVoice = false;

/*
  هذه النصوص الخاصة بكل لغة
*/
const T = {
  ar: {
    htmlLang: "ar",
    dir: "rtl",
    brandSubtitle: "Community Hub",
    langLabel: "العربية",
    userRole: "User",
    sideRoleText: "عضو في مجتمع Unmute",
    profileMenu: "الملف الشخصي",
    logout: "تسجيل الخروج",
    accessTitle: "إعدادات الوصول",
    increaseFont: "تكبير الخط",
    decreaseFont: "تصغير الخط",
    bgColorText: "لون الخلفية",
    textColorText: "لون النص",
    resetAccess: "إعادة الضبط",
    searchPH: "ابحث عن منشور أو شخص...",
    dashboardMenuText: "الصفحة الرئيسية",
    feedMenu: "الموجز",
    newPostMenu: "منشور جديد",
    friendsMenu: "الأصدقاء",
    messengerMenu: "المسنجر",
    aboutPlatformMenu: "عن المنصة",
    missionTitle: "هدف الصفحة",
    missionText: "هذه الصفحة هي نقطة انطلاق المجتمع داخل منصة Unmute، لتبادل الخبرات والأسئلة والمساندة بين المستخدمين بطريقة مريحة وواضحة.",
    tipText: "استخدم كلمات واضحة وجمل قصيرة حتى يكون التفاعل أسهل لجميع المستخدمين.",
    membersTitle: "أعضاء المنصة",
    membersBadgeText: "تواصل ومتابعة",
    createPostTrigger: "بماذا تفكر اليوم؟",
    addImage: "صورة",
    addVideo: "فيديو",
    writePost: "منشور",
    postModalTitle: "إنشاء منشور جديد",
    postPHAr: "بماذا تفكر...",
    postPHEn: "Write a new post in English...",
    modalImage: "إضافة صورة",
    modalVideo: "إضافة فيديو",
    postHint: "يمكنك إضافة صورة أو فيديو واحد فقط، وسيظهر كاملًا بدون قص.",
    publish: "نشر",
    platformModalTitle: "عن المنصة",
    platformModalText: "هذه الصفحة جزء من منصة Unmute، وهدفها أن تكون بداية المجتمع التفاعلي داخل المنصة، بحيث تجمع بين النشر، التواصل، المساندة، والتفاعل بين جميع المستخدمين بطريقة مريحة وآمنة.",
    platformName: "Unmute Platform",
    platformAddress: "طولكرم - جامعة خضوري التقنية",
    contactAdmin: "تواصل مع الإدارة",
    adminModalTitle: "تواصل مع الإدارة",
    adminNameLabel: "الاسم",
    adminEmailLabel: "البريد الإلكتروني",
    adminIssueLabel: "المشكلة / الرسالة",
    sendAdmin: "إرسال",
    messengerTitle: "Messenger",
    contactSearchPH: "ابحث عن عضو...",
    chatPH: "اكتب رسالتك...",
    notifTitle: "الإشعارات",
    markAllText: "قراءة الكل",
    like: "إعجاب",
    unlike: "إلغاء الإعجاب",
    comment: "تعليق",
    writeComment: "اكتب تعليقاً...",
    send: "إرسال",
    deletePost: "حذف",
    addFriend: "إضافة صديق",
    removeFriend: "إزالة الصديق",
    message: "مراسلة",
    friendAdded: "تمت الإضافة",
    pendingFriend: "طلب معلق",
    friendRequestsTitle: "طلبات الصداقة",
    accept: "قبول",
    reject: "رفض",
    noPosts: "لا توجد منشورات حالياً",
    noNotifications: "لا توجد إشعارات",
    toastPublished: "تم نشر المنشور بنجاح",
    toastEmptyPost: "لا يمكن نشر منشور فارغ",
    toastMediaConflict: "يرجى اختيار صورة أو فيديو واحد فقط",
    toastEmptyComment: "لا يمكن إضافة تعليق فارغ",
    toastEmptyMessage: "لا يمكن إرسال رسالة فارغة",
    toastDeleted: "تم حذف المنشور",
    toastLogout: "تم تسجيل الخروج",
    toastAdminSent: "تم إرسال رسالتك بنجاح",
    toastAdminMissing: "يرجى تعبئة جميع الحقول",
    toastFriendAdded: "تم إرسال طلب الصداقة",
    toastAlreadyFriends: "أنتم أصدقاء بالفعل",
    toastFriendAccepted: "تم قبول الطلب",
    toastFriendRejected: "تم رفض الطلب",
    toastNewMessage: "لديك رسالة جديدة",
    welcome: "أهلاً بك في Unmute Community Hub",
    memberStatus: "عضو في المنصة",
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    friendsTitle: "قائمة الأصدقاء",
    removeFriendConfirm: "هل أنت متأكد من إزالة هذا الصديق؟",
    friendRemoved: "تمت إزالة الصديق",
    removeFailed: "فشل الحذف"
  },
  en: {
    htmlLang: "en",
    dir: "ltr",
    brandSubtitle: "Community Hub",
    langLabel: "English",
    userRole: "User",
    sideRoleText: "Member in Unmute Community",
    profileMenu: "Profile",
    logout: "Logout",
    accessTitle: "Accessibility",
    increaseFont: "Increase font",
    decreaseFont: "Decrease font",
    bgColorText: "Background color",
    textColorText: "Text color",
    resetAccess: "Reset settings",
    searchPH: "Search for a post or person...",
    dashboardMenuText: "Home Page",
    feedMenu: "Feed",
    newPostMenu: "New Post",
    friendsMenu: "Friends",
    messengerMenu: "Messenger",
    aboutPlatformMenu: "About Platform",
    missionTitle: "Page Purpose",
    missionText: "This page is the starting point of the community inside Unmute, for sharing experiences, questions, and support in a comfortable and clear way.",
    tipText: "Use clear words and short sentences so interaction stays easier for all users.",
    membersTitle: "Platform Members",
    membersBadgeText: "Connect & Follow",
    createPostTrigger: "What is on your mind today?",
    addImage: "Image",
    addVideo: "Video",
    writePost: "Post",
    postModalTitle: "Create New Post",
    postPHAr: "What is on your mind...",
    postPHEn: "Write a new post in English...",
    modalImage: "Add Image",
    modalVideo: "Add Video",
    postHint: "You can add one image or one video only, and it will appear fully without cropping.",
    publish: "Publish",
    platformModalTitle: "About Platform",
    platformModalText: "This page is part of Unmute, and its purpose is to be the starting point of the interactive community inside the platform, combining posting, communication, support, and engagement in a comfortable and safe way.",
    platformName: "Unmute Platform",
    platformAddress: "Tulkarm - Palestine Technical University Kadoorie",
    contactAdmin: "Contact Admin",
    adminModalTitle: "Contact Admin",
    adminNameLabel: "Name",
    adminEmailLabel: "Email",
    adminIssueLabel: "Problem / Message",
    sendAdmin: "Send",
    messengerTitle: "Messenger",
    contactSearchPH: "Search for a member...",
    chatPH: "Write your message...",
    notifTitle: "Notifications",
    markAllText: "Mark all read",
    like: "Like",
    unlike: "Unlike",
    comment: "Comment",
    writeComment: "Write a comment...",
    send: "Send",
    deletePost: "Delete",
    addFriend: "Add Friend",
    removeFriend: "Remove Friend",
    message: "Message",
    friendAdded: "Added",
    pendingFriend: "Pending",
    friendRequestsTitle: "Friend Requests",
    accept: "Accept",
    reject: "Reject",
    noPosts: "No posts yet",
    noNotifications: "No notifications",
    toastPublished: "Post published successfully",
    toastEmptyPost: "Cannot publish empty post",
    toastMediaConflict: "Please pick one image or one video only",
    toastEmptyComment: "Comment cannot be empty",
    toastEmptyMessage: "Message cannot be empty",
    toastDeleted: "Post deleted",
    toastLogout: "Logged out successfully",
    toastAdminSent: "Admin message sent",
    toastAdminMissing: "Please fill all fields",
    toastFriendAdded: "Friend request sent",
    toastAlreadyFriends: "You are already friends",
    toastFriendAccepted: "Request accepted",
    toastFriendRejected: "Request rejected",
    toastNewMessage: "You received a new message",
    welcome: "Welcome to Unmute Community Hub",
    memberStatus: "Platform Member",
    showMore: "Show more",
    showLess: "Show less",
    friendsTitle: "Friends List",
    removeFriendConfirm: "Are you sure you want to remove this friend?",
    friendRemoved: "Friend removed",
    removeFailed: "Failed to remove"
  }
};

/*
  هذه الدالة فقط للهروب من أي رموز خاصة
  حتى لا ينكسر الـ HTML
*/
function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/*
  نستخدمها عندما نريد تغيير نص عنصر بسرعة
*/
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/*
  هذا التوست لعرض رسالة قصيرة أعلى الصفحة
*/
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.style.display = "flex";

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

/* تنقلات بسيطة */
function goToProfilePage() {
  window.location.href = "profile.php";
}

function goToDashboard() {
  window.location.href = "dashboard.php";
}

function logoutUser() {
  showToast(t.toastLogout);
  setTimeout(() => {
    window.location.href = "logout.php";
  }, 600);
}

/* فتح وإغلاق القوائم الصغيرة */
function toggleLangMenu() {
  const menu = document.getElementById("langMenu");
  if (!menu) return;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  if (!menu) return;
  const isOpen = menu.style.display === "block";
  closeMenus();
  if (!isOpen) menu.style.display = "block";
}

function toggleAccessPanel() {
  const panel = document.getElementById("accessPanel");
  if (!panel) return;
  const isOpen = panel.style.display === "block";
  closeMenus();
  if (!isOpen) panel.style.display = "block";
}

function toggleNotifications() {
  const menu = document.getElementById("notifMenu");
  if (!menu) return;

  const isOpen = menu.style.display === "block";
  closeMenus();

  if (!isOpen) {
    renderNotifications();
    menu.style.display = "block";

    if (notifications.some(n => !n.is_read)) {
      markAllNotificationsRead();
    }
  }
}

function closeMenus() {
  ["langMenu", "profileMenu", "accessPanel", "notifMenu"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

/* إعدادات الوصول */
function changeFontSize(direction) {
  currentFontScale = Math.max(0.85, Math.min(1.35, currentFontScale + direction * 0.05));
  document.documentElement.style.setProperty("--font-scale", currentFontScale);
  localStorage.setItem("unmute_font_scale", currentFontScale);
}

function changeBackgroundColor(color) {
  currentBgColor = color;
  document.body.style.background = color;
  localStorage.setItem("unmute_bg_color", color);
}

function changeTextColor(color) {
  currentTextColor = color;
  document.body.style.color = color;
  localStorage.setItem("unmute_text_color", color);
}

function resetAccessibility() {
  currentFontScale = 1;
  currentBgColor = "#f4f8ff";
  currentTextColor = "#1f2b3d";

  document.documentElement.style.setProperty("--font-scale", 1);
  document.body.style.background = "";
  document.body.style.color = "";

  const bgPicker = document.getElementById("bgColorPicker");
  const textPicker = document.getElementById("textColorPicker");

  if (bgPicker) bgPicker.value = "#f4f8ff";
  if (textPicker) textPicker.value = "#1f2b3d";

  localStorage.setItem("unmute_font_scale", "1");
  localStorage.setItem("unmute_bg_color", "#f4f8ff");
  localStorage.setItem("unmute_text_color", "#1f2b3d");
}

function applySavedAccessibility() {
  document.documentElement.style.setProperty("--font-scale", currentFontScale);
  if (currentBgColor !== "#f4f8ff") document.body.style.background = currentBgColor;
  if (currentTextColor !== "#1f2b3d") document.body.style.color = currentTextColor;
}

/*
  هذه ترجع النص حسب اللغة الحالية
*/
function translateValue(ar, en, fallback = "") {
  return lang === "ar" ? (ar || en || fallback) : (en || ar || fallback);
}

/*
  تنسيق التاريخ بشكل أوضح
*/
function formatDateValue(raw) {
  if (!raw) return "";
  try {
    const d = new Date(String(raw).replace(" ", "T"));
    return d.toLocaleString(lang === "ar" ? "ar" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return raw;
  }
}

/*
  نجلب كل بيانات الصفحة من السيرفر مرة واحدة:
  المستخدم + الأعضاء + الطلبات + المنشورات + الإشعارات + المحادثات
*/
async function loadSocialData(showMsgToast = false) {
  const res = await fetch("social_data.php");
  const data = await res.json();
  if (!data.success) return;

  const oldUnread = notifications.filter(n => !n.is_read && n.type === "message").length;

  currentUser = data.current_user;
  posts = data.posts || [];
  contacts = data.members || [];
  notifications = data.notifications || [];
  conversations = data.conversations || [];
  friendRequests = data.friend_requests || [];

  const newUnread = notifications.filter(n => !n.is_read && n.type === "message").length;
  if (showMsgToast && newUnread > oldUnread) {
    showToast(t.toastNewMessage);
  }

  setText("headerUserName", currentUser.name);
  setText("sideUserName", currentUser.name);

  const headerAvatar = document.getElementById("headerAvatar");
  const sideAvatar = document.getElementById("sideAvatar");
  const createPostAvatar = document.getElementById("createPostAvatar");

  if (headerAvatar) headerAvatar.innerHTML = getAvatarHtml(currentUser.initial, currentUser.profile_pic);
  if (sideAvatar) sideAvatar.innerHTML = getAvatarHtml(currentUser.initial, currentUser.profile_pic);
  if (createPostAvatar) createPostAvatar.innerHTML = getAvatarHtml(currentUser.initial, currentUser.profile_pic);
}

/*
  إذا المستخدم عنده صورة نعرضها
  وإذا لا نعرض أول حرف
*/
function getAvatarHtml(initial, profilePic) {
  if (profilePic) {
    return `<img src="${escapeHTML(profilePic)}" alt="Avatar" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='${escapeHTML(initial || "U")}';" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit;" />`;
  }
  return escapeHTML(initial || "U");
}

/*
  تطبيق اللغة على كامل الصفحة
*/
function applyLang() {
  document.documentElement.lang = t.htmlLang;
  document.documentElement.dir = t.dir;
  document.body.dir = t.dir;

  setText("brandSubtitle", t.brandSubtitle);
  setText("langLabel", t.langLabel);
  setText("headerUserRole", t.userRole);
  setText("sideUserRoleText", t.sideRoleText);
  setText("profileMenuText", t.profileMenu);
  setText("logoutText", t.logout);
  setText("accessTitle", t.accessTitle);
  setText("increaseFontText", t.increaseFont);
  setText("decreaseFontText", t.decreaseFont);
  setText("bgColorText", t.bgColorText);
  setText("textColorText", t.textColorText);
  setText("resetAccessText", t.resetAccess);
  setText("dashboardMenuText", t.dashboardMenuText);
  setText("feedMenuText", t.feedMenu);
  setText("newPostMenuText", t.newPostMenu);
  setText("friendsMenuText", t.friendsMenu);
  setText("messengerMenuText", t.messengerMenu);
  setText("aboutPlatformMenuText", t.aboutPlatformMenu);
  setText("missionTitle", t.missionTitle);
  setText("missionText", t.missionText);
  setText("tipText", t.tipText);
  setText("membersTitle", t.membersTitle);
  setText("membersBadgeText", t.membersBadgeText);
  setText("createPostTrigger", t.createPostTrigger);
  setText("addImageText", t.addImage);
  setText("addVideoText", t.addVideo);
  setText("writePostText", t.writePost);
  setText("postModalTitle", t.postModalTitle);
  setText("modalImageText", t.modalImage);
  setText("modalVideoText", t.modalVideo);
  setText("postHint", t.postHint);
  setText("publishText", t.publish);
  setText("platformModalTitle", t.platformModalTitle);
  setText("platformModalText", t.platformModalText);
  setText("platformNameText", t.platformName);
  setText("platformAddressText", t.platformAddress);
  setText("contactAdminText", t.contactAdmin);
  setText("adminModalTitle", t.adminModalTitle);
  setText("adminNameLabel", t.adminNameLabel);
  setText("adminEmailLabel", t.adminEmailLabel);
  setText("adminIssueLabel", t.adminIssueLabel);
  setText("sendAdminText", t.sendAdmin);
  setText("messengerTitle", t.messengerTitle);
  setText("notifTitle", t.notifTitle);
  setText("markAllText", t.markAllText);

  const searchInput = document.getElementById("searchInput");
  const contactSearchInput = document.getElementById("contactSearchInput");
  const chatInput = document.getElementById("chatInput");
  const postTextAr = document.getElementById("postTextAr");
  const postTextEn = document.getElementById("postTextEn");

  if (searchInput) searchInput.placeholder = t.searchPH;
  if (contactSearchInput) contactSearchInput.placeholder = t.contactSearchPH;
  if (chatInput) chatInput.placeholder = t.chatPH;
  if (postTextAr) postTextAr.placeholder = T.ar.postPHAr;
  if (postTextEn) postTextEn.placeholder = T.en.postPHEn;
}

/*
  تغيير اللغة
*/
function setLang(newLang) {
  lang = newLang;
  localStorage.setItem("unmute_lang", lang);
  t = T[lang];
  closeMenus();
  applyLang();
  renderAll();
}

/*
  البحث العام:
  - يفلتر المنشورات
  - ويعرض اقتراحات الأعضاء
*/
function handleGlobalSearchInput() {
  filterFeed();
  renderSearchSuggestions();
}

function handleGlobalSearchKey(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  submitGlobalSearch();
}

function submitGlobalSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const query = input.value.trim().toLowerCase();
  if (!query) {
    hideSearchSuggestions();
    return;
  }

  /*
    نبحث أولًا عن تطابق تام مع اسم عضو
  */
  const exactMatch = contacts.find(contact =>
    String(contact.name || "").trim().toLowerCase() === query
  );

  if (exactMatch) {
    window.location.href = `profile.php?id=${exactMatch.id}`;
    return;
  }

  /*
    إذا لا يوجد تطابق تام لكن يوجد اقتراحات
    نأخذ أول اقتراح
  */
  if (currentSearchMatches.length > 0) {
    window.location.href = `profile.php?id=${currentSearchMatches[0].id}`;
    return;
  }

  hideSearchSuggestions();
}

function renderSearchSuggestions() {
  const input = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("searchSuggestions");

  if (!input || !suggestionsBox) return;

  const query = input.value.trim().toLowerCase();

  if (!query) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
    currentSearchMatches = [];
    return;
  }

  /*
    هنا نفلتر الأعضاء حسب الاسم
  */
  currentSearchMatches = contacts.filter(contact =>
    String(contact.name || "").toLowerCase().includes(query)
  ).slice(0, 6);

  if (!currentSearchMatches.length) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";
    return;
  }

  suggestionsBox.innerHTML = currentSearchMatches.map(contact => `
    <div class="search-suggestion-item" onclick="goToSearchProfile(${contact.id})">
      <div class="user-avatar">
        ${getAvatarHtml(contact.initial, contact.profile_pic)}
      </div>
      <div class="search-suggestion-meta">
        <strong>${escapeHTML(contact.name)}</strong>
        <small>${contact.is_friend ? t.friendAdded : t.memberStatus}</small>
      </div>
    </div>
  `).join("");

  suggestionsBox.style.display = "block";
}

function goToSearchProfile(userId) {
  window.location.href = `profile.php?id=${userId}`;
}

function hideSearchSuggestions() {
  const suggestionsBox = document.getElementById("searchSuggestions");
  if (!suggestionsBox) return;

  suggestionsBox.innerHTML = "";
  suggestionsBox.style.display = "none";
}

/*
  نجمع إعادة الرندر في دالة واحدة
*/
function renderAll() {
  renderNotifications();
  renderFeed();
  renderContacts();
  renderConversationList();
  renderChatMessages();
}

/*
  عرض الإشعارات
*/
function renderNotifications() {
  const notifList = document.getElementById("notifList");
  const notifBadge = document.getElementById("notifBadge");
  if (!notifList || !notifBadge) return;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  notifBadge.textContent = unreadCount;
  notifBadge.style.display = unreadCount > 0 ? "grid" : "none";

  if (!notifications.length) {
    notifList.innerHTML = `<div class="notif-item"><div class="notif-text"><strong>${t.noNotifications}</strong></div></div>`;
    return;
  }

  notifList.innerHTML = notifications.map(n => `
    <div class="notif-item clickable-notif" onclick="handleNotificationClick(${n.id})">
      <span class="notif-dot ${n.is_read ? "read" : ""}"></span>
      <div class="notif-text">
        <strong>${escapeHTML(translateValue(n.title_ar, n.title_en, ""))}</strong>
        <small>${escapeHTML(translateValue(n.body_ar, n.body_en, ""))}</small>
      </div>
    </div>
  `).join("");
}

function handleNotificationClick(id) {
  const notif = notifications.find(n => n.id === id);
  if (!notif) return;

  closeMenus();

  if (notif.type === "message" || notif.type === "friend_accept") {
    if (notif.related_user_id) {
      openChatWith(notif.related_user_id);
    } else {
      openMessengerPanel();
    }
  } else if (notif.type === "friend_request") {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      const reqBox = document.getElementById("friendRequestsBox");
      if (reqBox) reqBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }
}

async function markAllNotificationsRead() {
  const res = await fetch("social_notifications_read.php", { method: "POST" });
  const data = await res.json();

  if (data.success) {
    notifications = notifications.map(n => ({ ...n, is_read: true }));
    renderNotifications();
  }
}

function getPostContent(post) {
  return translateValue(post.content_ar, post.content_en, post.content || "");
}

/*
  عرض المنشورات
*/
function renderFeed() {
  const feedList = document.getElementById("feedList");
  const searchInput = document.getElementById("searchInput");
  if (!feedList) return;

  const query = (searchInput?.value || "").trim().toLowerCase();
  let data = [...posts];

  if (query) {
    data = data.filter(post => {
      const name = (post.name || "").toLowerCase();
      const content = getPostContent(post).toLowerCase();
      return name.includes(query) || content.includes(query);
    });
  }

  if (!data.length) {
    feedList.innerHTML = `<div class="card post-card"><p>${t.noPosts}</p></div>`;
    return;
  }

  feedList.innerHTML = data.map(post => {
    const content = getPostContent(post);

    const media = post.media_url
      ? (post.media_type === "video"
        ? `<video class="post-media" controls src="${post.media_url}"></video>`
        : `<img class="post-media" src="${post.media_url}" alt="Post media" />`)
      : "";

    return `
      <div class="card post-card">
        <div class="post-head">
          <div class="post-user" onclick="window.location.href='profile.php?id=${post.user_id}'" style="cursor:pointer;">
            <div class="user-avatar">${getAvatarHtml(post.initial, post.profile_pic)}</div>
            <div class="post-user-meta">
              <b>${escapeHTML(post.name)}</b>
              <small>${escapeHTML(formatDateValue(post.created_at))}</small>
            </div>
          </div>

          <div class="post-tools">
            ${post.is_mine ? `<button onclick="deletePost(${post.id})">${t.deletePost}</button>` : ""}
          </div>
        </div>

        <div class="post-body">
          <p>${escapeHTML(content)}</p>
          ${media}
        </div>

        <div class="post-actions">
          <button onclick="toggleLike(${post.id})">
            <i class="fa-solid fa-thumbs-up"></i>
            <span>${post.liked_by_me ? t.unlike : t.like} (${post.likes})</span>
          </button>

          <button onclick="toggleComments(${post.id})">
            <i class="fa-regular fa-comment"></i>
            <span>${t.comment} (${post.comments.length})</span>
          </button>
        </div>

        <div class="comments-area" id="comments_${post.id}">
          <div class="comment-box">
            <input type="text" id="commentInput_${post.id}" placeholder="${t.writeComment}" />
            <button class="primary-btn" onclick="addComment(${post.id})">${t.send}</button>
          </div>

          <div class="comments-list">
            ${post.comments.map(comment => `
              <div class="comment-item">
                <div class="comment-avatar" onclick="window.location.href='profile.php?id=${comment.user_id}'" style="cursor:pointer;">
                  ${getAvatarHtml(comment.initial, comment.profile_pic)}
                </div>
                <div class="comment-content-wrap">
                  <b onclick="window.location.href='profile.php?id=${comment.user_id}'" style="cursor:pointer;">${escapeHTML(comment.name)}</b>
                  <div>${escapeHTML(comment.content)}</div>
                  <small>${escapeHTML(formatDateValue(comment.created_at))}</small>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function toggleComments(postId) {
  const box = document.getElementById(`comments_${postId}`);
  if (box) box.classList.toggle("open");
}

/*
  عرض الأعضاء + الطلبات + زر عرض المزيد
*/
function renderContacts() {
  const contactsList = document.getElementById("contactsList");
  const contactSearchInput = document.getElementById("contactSearchInput");
  if (!contactsList) return;

  const q = (contactSearchInput?.value || "").trim().toLowerCase();
  let data = [...contacts];

  if (showOnlyFriends) {
    data = data.filter(c => c.is_friend);
  }

  if (q) {
    data = data.filter(c => (c.name || "").toLowerCase().includes(q));
  }

  const requestsHtml = friendRequests.length ? `
    <div class="requests-box" id="friendRequestsBox">
      <h4>${t.friendRequestsTitle}</h4>
      ${friendRequests.map(req => `
        <div class="request-item">
          <div class="contact-top" onclick="window.location.href='profile.php?id=${req.sender_id}'" style="cursor:pointer;">
            <div class="user-avatar">${getAvatarHtml(req.initial, req.profile_pic)}</div>
            <div class="contact-meta">
              <b>${escapeHTML(req.name)}</b>
              <small>${escapeHTML(formatDateValue(req.created_at))}</small>
            </div>
          </div>
          <div class="contact-actions">
            <button class="contact-action-btn" onclick="handleFriendRequest(${req.request_id}, 'accept')">
              <i class="fa-solid fa-check"></i><span>${t.accept}</span>
            </button>
            <button class="contact-action-btn" onclick="handleFriendRequest(${req.request_id}, 'reject')">
              <i class="fa-solid fa-xmark"></i><span>${t.reject}</span>
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  ` : "";

  const visibleData = showAllMembers ? data : data.slice(0, 3);

  const membersHtml = visibleData.length > 0 ? visibleData.map(contact => {
    let friendAction = "";
    let messageAction = "";

    if (contact.is_friend) {
      friendAction = `
        <button class="contact-action-btn remove-btn" onclick="removeFriend(${contact.id})">
          <i class="fa-solid fa-user-minus"></i><span>${t.removeFriend}</span>
        </button>
      `;

      messageAction = `
        <button class="contact-action-btn" onclick="openChatWith('${contact.id}')">
          <i class="fa-solid fa-message"></i><span>${t.message}</span>
        </button>
      `;
    } else if (contact.outgoing_request_status === "pending") {
      friendAction = `
        <button class="contact-action-btn" disabled>
          <i class="fa-regular fa-clock"></i><span>${t.pendingFriend}</span>
        </button>
      `;
    } else {
      friendAction = `
        <button class="contact-action-btn" onclick="addFriend(${contact.id})">
          <i class="fa-solid fa-user-plus"></i><span>${t.addFriend}</span>
        </button>
      `;
    }

    return `
      <div class="contact-item">
        <div class="contact-top" onclick="window.location.href='profile.php?id=${contact.id}'" style="cursor:pointer;">
          <div class="user-avatar">${getAvatarHtml(contact.initial, contact.profile_pic)}</div>
          <div class="contact-meta">
            <b>${escapeHTML(contact.name)}</b>
            <small>${contact.is_friend ? t.friendAdded : t.sideRoleText}</small>
          </div>
        </div>

        <div class="contact-actions">
          ${friendAction}
          ${messageAction}
        </div>
      </div>
    `;
  }).join("") : `<div style="padding:20px; text-align:center; color:var(--text-soft); font-size:0.9rem;">${showOnlyFriends ? (lang === "ar" ? "لا يوجد أصدقاء حالياً" : "No friends found") : (lang === "ar" ? "لا يوجد أعضاء" : "No members found")}</div>`;

  let moreButtonHtml = "";
  if (data.length > 3 && !q && !showOnlyFriends) {
    moreButtonHtml = `
      <button class="primary-btn full-btn" style="margin-top:10px;" onclick="toggleShowAllMembers()">
        ${showAllMembers ? t.showLess : t.showMore}
      </button>
    `;
  }

  contactsList.innerHTML = requestsHtml + membersHtml + moreButtonHtml;
}

function toggleShowAllMembers() {
  showAllMembers = !showAllMembers;
  renderContacts();
}

function showFriendsOnly() {
  showOnlyFriends = !showOnlyFriends;
  if (showOnlyFriends) showAllMembers = true;

  const membersTitle = document.getElementById("membersTitle");
  if (membersTitle) {
    membersTitle.textContent = showOnlyFriends ? t.friendsTitle : t.membersTitle;
  }

  renderContacts();
}

/*
  قائمة المحادثات
*/
function renderConversationList() {
  const convList = document.getElementById("conversationList");
  const contactSearchInput = document.getElementById("contactSearchInput");
  if (!convList) return;

  const q = (contactSearchInput?.value || "").trim().toLowerCase();
  let data = [...conversations];

  if (q) {
    data = data.filter(c => (c.name || "").toLowerCase().includes(q));
  }

  if (!data.length && q) {
    const matchingContacts = contacts.filter(c => (c.name || "").toLowerCase().includes(q));
    if (matchingContacts.length > 0) {
      convList.innerHTML = matchingContacts.map(contact => `
        <div class="conv-item ${String(contact.id) === String(currentChatId) ? "active" : ""}" onclick="openChatWith('${contact.id}')">
          <div class="conv-left">
            <div class="user-avatar">${getAvatarHtml(contact.initial, contact.profile_pic)}</div>
            <div class="conv-meta">
              <b>${escapeHTML(contact.name)}</b>
              <small>${t.memberStatus}</small>
            </div>
          </div>
        </div>
      `).join("");
      return;
    }
  }

  convList.innerHTML = data.map(contact => `
    <div class="conv-item ${String(contact.id) === String(currentChatId) ? "active" : ""}" onclick="openChatWith('${contact.id}')">
      <div class="conv-left">
        <div class="user-avatar">${getAvatarHtml(contact.initial, contact.profile_pic)}</div>
        <div class="conv-meta">
          <b>${escapeHTML(contact.name)}</b>
          <small>${t.memberStatus}</small>
        </div>
      </div>
    </div>
  `).join("");
}

function getCurrentConversation() {
  const conv = conversations.find(c => String(c.id) === String(currentChatId));
  if (conv) return conv;

  const member = contacts.find(m => String(m.id) === String(currentChatId));
  if (member) {
    return {
      id: String(member.id),
      name: member.name,
      initial: member.initial,
      profile_pic: member.profile_pic,
      is_bot: false,
      status_ar: "عضو في المنصة",
      status_en: "Platform Member"
    };
  }

  return null;
}

function openMessengerPanel() {
  const messengerPanel = document.getElementById("messengerPanel");
  const pageOverlay = document.getElementById("pageOverlay");

  if (messengerPanel) messengerPanel.classList.add("open");
  if (pageOverlay) pageOverlay.style.display = "block";

  renderConversationList();
  renderChatMessages();
}

function closeMessengerPanel() {
  const messengerPanel = document.getElementById("messengerPanel");
  const pageOverlay = document.getElementById("pageOverlay");

  if (messengerPanel) messengerPanel.classList.remove("open");
  if (pageOverlay) pageOverlay.style.display = "none";
}

async function openChatWith(contactId) {
  currentChatId = String(contactId);
  openMessengerPanel();

  const contact = getCurrentConversation();
  const chatAvatar = document.getElementById("chatAvatar");
  const chatName = document.getElementById("chatName");
  const chatStatus = document.getElementById("chatStatus");

  if (chatAvatar) chatAvatar.innerHTML = getAvatarHtml(contact.initial, contact.profile_pic);
  if (chatName) chatName.textContent = contact.name || "Unmute";
  if (chatStatus) chatStatus.textContent = t.memberStatus;

  await loadConversationMessages(currentChatId);
  renderConversationList();
  renderChatMessages();
}

async function loadConversationMessages(contactId) {
  const res = await fetch(`social_messages_get.php?contact_id=${encodeURIComponent(contactId)}`);
  const data = await res.json();
  if (data.success) chatStore[contactId] = data.messages || [];
}

function renderChatMessages() {
  const body = document.getElementById("chatBody");
  if (!body) return;

  const currentContact = getCurrentConversation();
  if (!currentContact) {
    body.innerHTML = `<div style="padding:20px; text-align:center; color:#666;">${lang === "ar" ? "اختر صديقاً لبدء المحادثة" : "Select a friend to start chatting"}</div>`;
    return;
  }

  const messages = chatStore[currentChatId] || [];

  body.innerHTML = `
    ${messages.map(msg => `
      <div class="msg ${msg.by === "me" ? "me" : "other"}">
        <div>${escapeHTML(msg.text)}</div>
        <small>${escapeHTML(formatDateValue(msg.created_at))}</small>
      </div>
    `).join("")}
  `;

  body.scrollTop = body.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();

  if (!text) {
    showToast(t.toastEmptyMessage);
    return;
  }

  input.value = "";

  if (!chatStore[currentChatId]) chatStore[currentChatId] = [];
  chatStore[currentChatId].push({
    by: "me",
    text,
    created_at: new Date().toISOString()
  });

  renderChatMessages();

  const fd = new FormData();
  fd.append("contact_id", currentChatId);
  fd.append("text", text);

  try {
    const res = await fetch("social_message_send.php", {
      method: "POST",
      body: fd
    });

    await res.json();
    await loadConversationMessages(currentChatId);
    await loadSocialData();
    renderConversationList();
    renderNotifications();
  } catch (err) {
    console.error("Chat Error:", err);
  }

  renderChatMessages();
}

function handleChatKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

/*
  التعرف على الصوت للمسنجر
*/
function initVoiceRecognition() {
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;

    speechRecognition.onstart = function() {
      isRecordingVoice = true;
      const btn = document.getElementById("voiceBtn");
      if (btn) btn.classList.add("recording");
    };

    speechRecognition.onresult = function(event) {
      const text = event.results[0][0].transcript;
      const input = document.getElementById("chatInput");
      if (input) {
        input.value = (input.value + " " + text).trim();
      }
    };

    speechRecognition.onerror = function() {
      stopVoiceRecognition();
    };

    speechRecognition.onend = function() {
      stopVoiceRecognition();
    };
  }
}

function toggleVoiceRecognition() {
  if (!speechRecognition) initVoiceRecognition();

  if (!speechRecognition) {
    showToast(lang === "ar" ? "متصفحك لا يدعم التعرف على الصوت" : "Your browser does not support speech recognition");
    return;
  }

  if (isRecordingVoice) {
    speechRecognition.stop();
  } else {
    speechRecognition.lang = lang === "ar" ? "ar-SA" : "en-US";
    try {
      speechRecognition.start();
    } catch (e) {
      stopVoiceRecognition();
    }
  }
}

function stopVoiceRecognition() {
  isRecordingVoice = false;
  const btn = document.getElementById("voiceBtn");
  if (btn) btn.classList.remove("recording");
}

/*
  إنشاء منشور جديد
*/
async function publishPost() {
  const postTextAr = document.getElementById("postTextAr");
  const postTextEn = document.getElementById("postTextEn");

  const textAr = postTextAr ? postTextAr.value.trim() : "";
  const textEn = postTextEn ? postTextEn.value.trim() : "";

  if (!textAr && !textEn && !currentImageData && !currentVideoData) {
    showToast(t.toastEmptyPost);
    return;
  }

  if (currentImageData && currentVideoData) {
    showToast(t.toastMediaConflict);
    return;
  }

  const fd = new FormData();
  fd.append("content", textAr || textEn);
  fd.append("content_ar", textAr);
  fd.append("content_en", textEn);
  fd.append("media_url", currentImageData || currentVideoData);
  fd.append("media_type", currentImageData ? "image" : currentVideoData ? "video" : "");

  const res = await fetch("social_post_create.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    closePostModal();
    await loadSocialData();
    renderFeed();
    showToast(t.toastPublished);
  } else {
    showToast(data.message || t.toastEmptyPost);
  }
}

async function deletePost(postId) {
  const fd = new FormData();
  fd.append("post_id", postId);

  const res = await fetch("social_post_delete.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    await loadSocialData();
    renderFeed();
    showToast(t.toastDeleted);
  }
}

async function addComment(postId) {
  const input = document.getElementById(`commentInput_${postId}`);
  if (!input) return;

  const text = input.value.trim();

  if (!text) {
    showToast(t.toastEmptyComment);
    return;
  }

  const fd = new FormData();
  fd.append("post_id", postId);
  fd.append("content", text);

  const res = await fetch("social_comment_add.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    await loadSocialData();
    renderFeed();
    const box = document.getElementById(`comments_${postId}`);
    if (box) box.classList.add("open");
  }
}

async function toggleLike(postId) {
  const fd = new FormData();
  fd.append("post_id", postId);

  await fetch("social_reaction_toggle.php", {
    method: "POST",
    body: fd
  });

  await loadSocialData();
  renderFeed();
}

/*
  الأصدقاء
*/
async function addFriend(userId) {
  const fd = new FormData();
  fd.append("receiver_id", userId);

  const res = await fetch("social_friend_add.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    await loadSocialData();
    renderContacts();
    renderConversationList();

    if (data.status === "pending") {
      showToast(t.toastFriendAdded);
    } else if (data.status === "already_friends") {
      showToast(t.toastAlreadyFriends);
    } else {
      showToast(t.toastFriendAdded);
    }
  } else {
    showToast(data.message || t.toastFriendRejected);
  }
}

async function removeFriend(userId) {
  if (!confirm(t.removeFriendConfirm)) return;

  const fd = new FormData();
  fd.append("friend_user_id", userId);

  const res = await fetch("social_friend_remove.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    await loadSocialData();
    renderContacts();
    renderConversationList();
    showToast(t.friendRemoved);
  } else {
    showToast(data.message || t.removeFailed);
  }
}

async function handleFriendRequest(requestId, action) {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("action", action);

  const res = await fetch("social_friend_request_action.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    await loadSocialData();
    renderContacts();
    renderConversationList();
    renderNotifications();

    if (action === "accept") showToast(t.toastFriendAccepted);
    else showToast(t.toastFriendRejected);
  } else {
    showToast(data.message || t.toastFriendRejected);
  }
}

/*
  فلترة المنشورات
*/
function filterFeed() {
  renderFeed();
}

/*
  فلترة الأعضاء والمحادثات
*/
function filterContacts() {
  renderContacts();
  renderConversationList();
}

/*
  المودالات
*/
function openPostModal(type = "") {
  const modal = document.getElementById("postModalOverlay");
  if (modal) modal.style.display = "flex";

  if (type === "image") {
    const imageInput = document.getElementById("imageInput");
    if (imageInput) imageInput.click();
  }

  if (type === "video") {
    const videoInput = document.getElementById("videoInput");
    if (videoInput) videoInput.click();
  }
}

function closePostModal() {
  const modal = document.getElementById("postModalOverlay");
  const postTextAr = document.getElementById("postTextAr");
  const postTextEn = document.getElementById("postTextEn");
  const imagePreview = document.getElementById("imagePreview");
  const videoPreview = document.getElementById("videoPreview");

  if (modal) modal.style.display = "none";
  if (postTextAr) postTextAr.value = "";
  if (postTextEn) postTextEn.value = "";

  currentImageData = "";
  currentVideoData = "";

  if (imagePreview) {
    imagePreview.src = "";
    imagePreview.style.display = "none";
  }

  if (videoPreview) {
    videoPreview.src = "";
    videoPreview.style.display = "none";
  }
}

function openPlatformModal() {
  const modal = document.getElementById("platformModalOverlay");
  if (modal) modal.style.display = "flex";
}

function closePlatformModal() {
  const modal = document.getElementById("platformModalOverlay");
  if (modal) modal.style.display = "none";
}

function openAdminContactModal() {
  const adminModal = document.getElementById("adminModalOverlay");
  const platformModal = document.getElementById("platformModalOverlay");

  if (adminModal) {
    adminModal.style.display = "flex";
    if (platformModal) platformModal.style.display = "none";
  }
}

function closeAdminModal() {
  const modal = document.getElementById("adminModalOverlay");
  if (modal) modal.style.display = "none";
}

/*
  هذه الدالة ترسل رسالة الإدارة
  وربطناها مع social_admin_message.php
*/
async function submitAdminForm() {
  const nameInput = document.getElementById("adminNameInput");
  const emailInput = document.getElementById("adminEmailInput");
  const issueInput = document.getElementById("adminIssueInput");

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const message = issueInput ? issueInput.value.trim() : "";

  if (!name || !email || !message) {
    showToast(t.toastAdminMissing);
    return;
  }

  const fd = new FormData();
  fd.append("name", name);
  fd.append("email", email);
  fd.append("message", message);

  const res = await fetch("social_admin_message.php", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.success) {
    closeAdminModal();
    if (issueInput) issueInput.value = "";
    showToast(t.toastAdminSent);
  } else {
    showToast(data.message || t.toastAdminMissing);
  }
}

function closeAllPanels() {
  closeMessengerPanel();
  closeMenus();
  closePostModal();
  closePlatformModal();
  closeAdminModal();
}

function scrollToTopNow() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/*
  رفع صورة أو فيديو داخل البوست
*/
function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentVideoData = "";

  const videoPreview = document.getElementById("videoPreview");
  const imagePreview = document.getElementById("imagePreview");

  if (videoPreview) {
    videoPreview.style.display = "none";
    videoPreview.src = "";
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    currentImageData = e.target.result;
    if (imagePreview) {
      imagePreview.src = currentImageData;
      imagePreview.style.display = "block";
    }
  };
  reader.readAsDataURL(file);
}

function handleVideoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentImageData = "";

  const videoPreview = document.getElementById("videoPreview");
  const imagePreview = document.getElementById("imagePreview");

  if (imagePreview) {
    imagePreview.style.display = "none";
    imagePreview.src = "";
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    currentVideoData = e.target.result;
    if (videoPreview) {
      videoPreview.src = currentVideoData;
      videoPreview.style.display = "block";
    }
  };
  reader.readAsDataURL(file);
}

/*
  إذا ضغط المستخدم خارج القوائم أو خارج البحث
  نسكرهم
*/
document.addEventListener("click", function(e) {
  const insideMenu =
    e.target.closest(".lang-wrap") ||
    e.target.closest(".profile-wrap") ||
    e.target.closest(".notif-wrap") ||
    e.target.closest(".access-panel") ||
    e.target.closest('button[onclick="toggleAccessPanel()"]');

  const insideSearch =
    e.target.closest(".search-box-wrap");

  if (!insideMenu) closeMenus();
  if (!insideSearch) hideSearchSuggestions();
});

/*
  أول تحميل للصفحة
*/
window.addEventListener("load", async () => {
  t = T[lang];
  applyLang();
  applySavedAccessibility();

  await loadSocialData();
  renderAll();

  showToast(t.welcome);

  if (notificationPoll) clearInterval(notificationPoll);

  /*
    كل 10 ثواني نحدث الإشعارات والمحادثات
  */
  notificationPoll = setInterval(async () => {
    await loadSocialData(true);
    renderNotifications();
    renderConversationList();
  }, 10000);
});