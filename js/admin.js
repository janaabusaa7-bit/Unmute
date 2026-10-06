/**
 * admin.js
 * JavaScript الكامل للوحة إدارة Unmute
 *
 * الهيكل:
 *  1) متغيرات عامة
 *  2) نظام الترجمة (i18n)
 *  3) التنقل بين الأقسام
 *  4) دوال مساعدة
 *  5) API — التواصل مع الخادم
 *  6) Toast — رسائل الإشعار
 *  7) Modal — النوافذ المنبثقة
 *  8) Confirm — نافذة التأكيد
 *  9) HOME — الإحصائيات
 * 10) USERS — المستخدمون
 * 11) ADMINS — الأدمن
 * 12) POSTS — المنشورات
 * 13) COMMENTS — التعليقات
 * 14) MESSAGES — رسائل الإدارة
 * 15) PLACES — الأماكن الداعمة
 * 16) SIGNS — الإشارات (Super Admin)
 * 17) VIDEOS — الفيديوهات (Super Admin)
 * 18) MAP — خريطة الأماكن
 * 19) SIDEBAR — الشريط الجانبي
 * 20) INIT — التهيئة عند التحميل
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1) متغيرات عامة
   ══════════════════════════════════════════════════════════ */

/** بيانات قادمة من PHP (admin.php) */
const IS_SUPER = PHP_DATA.isSuper;  // هل هذا Super Admin؟
const MY_ID    = PHP_DATA.myId;     // ID الأدمن الحالي

/** اللغة الحالية (ar أو en) */
let lang = localStorage.getItem('unmute_admin_lang') || 'ar';

/** بيانات محلية (تُحمَّل من API مرة واحدة) */
let DATA = {
  users    : [],
  admins   : [],
  posts    : [],
  comments : [],
  messages : [],
  tasks    : [],
  places   : [],
  signs    : [
    {id:1, title:'حرف أ', category:'letter', media:'https://i.ibb.co/JF8s8VKw/af94eefb.jpg'},
    {id:2, title:'مرحبا', category:'word',   media:'https://i.ibb.co/m5rq0J2J/3e65c4d5.jpg'}
  ],
  videos   : [
    {id:1, title:'تعلم أساسيات الإشارة', url:'https://www.youtube.com/', description:'فيديو تمهيدي'}
  ]
};

/** الأقسام المحمّلة مسبقاً — لتجنب إعادة التحميل */
const loadedSections = new Set();

/** القسم الحالي المفتوح */
let currentSection = 'home';

/** نموذج الخريطة */
let adminMap   = null;
let mapMarkers = null;

/* ══════════════════════════════════════════════════════════
   2) نظام الترجمة (i18n)
   ══════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  ar: {
    /* الصفحة الرئيسية */
    'home'        : 'نظرة عامة',
    'users'       : 'المستخدمون',
    'admins'      : 'الأدمن',
    'posts'       : 'المنشورات',
    'comments'    : 'التعليقات',
    'messages'    : 'رسائل الإدارة',
    'tasks'       : 'المهام',
    'places'      : 'الأماكن الداعمة',
    'signs'       : 'إشارات لغة الإشارة',
    'videos'      : 'فيديوهات التعلم',

    /* الإحصائيات */
    'stat.users_total'   : 'مستخدم',
    'stat.users_active'  : 'نشط',
    'stat.users_inactive': 'موقوف',
    'stat.deaf'          : 'مستخدم أصم',
    'stat.admins'        : 'أدمن',
    'stat.posts'         : 'منشور',
    'stat.comments'      : 'تعليق',
    'stat.tasks'         : 'مهمة منجزة',
    'stat.friends'       : 'صداقة',
    'stat.places'        : 'مكان داعم',
    'stat.messages'      : 'رسالة',

    /* الأعمدة */
    'col.name'    : 'الاسم',
    'col.email'   : 'البريد',
    'col.role'    : 'النوع',
    'col.status'  : 'الحالة',
    'col.joined'  : 'الانضمام',
    'col.actions' : 'إجراءات',
    'col.author'  : 'الكاتب',
    'col.content' : 'المحتوى',
    'col.date'    : 'التاريخ',
    'col.likes'   : 'إعجاب',
    'col.comments': 'تعليق',
    'col.city'    : 'المدينة',
    'col.category': 'التصنيف',
    'col.phone'   : 'الهاتف',
    'col.verified': 'موثوق',
    'col.sender'  : 'المرسل',
    'col.message' : 'الرسالة',
    'col.task'    : 'المهمة',
    'col.day'     : 'اليوم',
    'col.media'   : 'رابط الوسائط',

    /* الأدوار */
    'role.normal' : 'عادي',
    'role.deaf'   : 'أصم',
    'role.admin'  : 'أدمن',

    /* تصنيفات الأماكن */
    'cat.therapy'       : 'علاج وتأهيل',
    'cat.entertainment' : 'ترفيه واندماج',
    'cat.support'       : 'مؤسسة داعمة',

    /* تصنيفات الإشارات */
    'sign.letter'   : 'حرف',
    'sign.word'     : 'كلمة',
    'sign.sentence' : 'جملة',

    /* الحالات */
    'status.active'   : 'نشط',
    'status.inactive' : 'موقوف',

    /* الأزرار */
    'btn.add'    : 'إضافة',
    'btn.save'   : 'حفظ',
    'btn.cancel' : 'إلغاء',
    'btn.edit'   : 'تعديل',
    'btn.delete' : 'حذف',
    'btn.activate'   : 'تفعيل',
    'btn.deactivate' : 'إيقاف',
    'btn.resetpw': 'إعادة كلمة المرور',
    'btn.showmap': 'الخريطة',

    /* العناوين */
    'modal.addUser'   : 'إضافة مستخدم جديد',
    'modal.editUser'  : 'تعديل بيانات المستخدم',
    'modal.addAdmin'  : 'إضافة أدمن جديد',
    'modal.editAdmin' : 'تعديل بيانات الأدمن',
    'modal.addPlace'  : 'إضافة مكان جديد',
    'modal.editPlace' : 'تعديل بيانات المكان',
    'modal.addSign'   : 'إضافة إشارة جديدة',
    'modal.editSign'  : 'تعديل الإشارة',
    'modal.addVideo'  : 'إضافة فيديو جديد',
    'modal.editVideo' : 'تعديل الفيديو',
    'modal.resetpw'   : 'إعادة تعيين كلمة المرور',

    /* حقول النماذج */
    'lbl.name'    : 'الاسم الكامل',
    'lbl.email'   : 'البريد الإلكتروني',
    'lbl.password': 'كلمة المرور',
    'lbl.role'    : 'نوع الحساب',
    'lbl.city'    : 'المدينة',
    'lbl.pcat'    : 'تصنيف المكان',
    'lbl.phone'   : 'رقم الهاتف',
    'lbl.lat'     : 'خط العرض (Latitude)',
    'lbl.lng'     : 'خط الطول (Longitude)',
    'lbl.desc'    : 'الوصف',
    'lbl.notes'   : 'ملاحظات الوصول',
    'lbl.verified': 'مكان موثوق؟',
    'lbl.sname'   : 'اسم الإشارة',
    'lbl.scat'    : 'تصنيف الإشارة',
    'lbl.smedia'  : 'رابط صورة/GIF',
    'lbl.vtitle'  : 'عنوان الفيديو',
    'lbl.vurl'    : 'رابط الفيديو',
    'lbl.vdesc'   : 'وصف الفيديو',

    /* رسائل Toast */
    'toast.saved'   : '✓ تم الحفظ بنجاح',
    'toast.deleted' : '✓ تم الحذف بنجاح',
    'toast.toggled' : '✓ تم تغيير الحالة',
    'toast.error'   : '✗ حدث خطأ',
    'toast.noperm'  : '⚠ ليس لديك صلاحية',

    /* تأكيد الحذف */
    'confirm.title' : 'تأكيد الإجراء',
    'confirm.delete': 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.',
    'confirm.deactivate': 'هل تريد إيقاف هذا الحساب؟ لن يتمكن من تسجيل الدخول.',
    'confirm.activate'  : 'هل تريد تفعيل هذا الحساب؟',

    /* متفرقات */
    'empty'       : 'لا توجد بيانات.',
    'loading'     : 'جاري التحميل...',
    'yes'         : 'نعم',
    'no'          : 'لا',
    'recent.posts': 'آخر المنشورات',
    'view.all'    : 'عرض الكل',
    'topbar.sub'  : 'لوحة إدارة Unmute',
    'ph.name'     : 'أدخل الاسم',
    'ph.email'    : 'example@mail.com',
    'ph.pass'     : '6 أحرف على الأقل',
    'ph.lat'      : '32.3104',
    'ph.lng'      : '35.0288',
  },

  en: {
    'home'        : 'Overview',
    'users'       : 'Users',
    'admins'      : 'Admins',
    'posts'       : 'Posts',
    'comments'    : 'Comments',
    'messages'    : 'Admin Messages',
    'tasks'       : 'Tasks',
    'places'      : 'Supported Places',
    'signs'       : 'Sign Language',
    'videos'      : 'Learning Videos',

    'stat.users_total'   : 'Users',
    'stat.users_active'  : 'Active',
    'stat.users_inactive': 'Suspended',
    'stat.deaf'          : 'Deaf users',
    'stat.admins'        : 'Admins',
    'stat.posts'         : 'Posts',
    'stat.comments'      : 'Comments',
    'stat.tasks'         : 'Completed tasks',
    'stat.friends'       : 'Friendships',
    'stat.places'        : 'Places',
    'stat.messages'      : 'Messages',

    'col.name'    : 'Name',
    'col.email'   : 'Email',
    'col.role'    : 'Role',
    'col.status'  : 'Status',
    'col.joined'  : 'Joined',
    'col.actions' : 'Actions',
    'col.author'  : 'Author',
    'col.content' : 'Content',
    'col.date'    : 'Date',
    'col.likes'   : 'Likes',
    'col.comments': 'Comments',
    'col.city'    : 'City',
    'col.category': 'Category',
    'col.phone'   : 'Phone',
    'col.verified': 'Verified',
    'col.sender'  : 'Sender',
    'col.message' : 'Message',
    'col.task'    : 'Task',
    'col.day'     : 'Day',
    'col.media'   : 'Media URL',

    'role.normal' : 'Regular',
    'role.deaf'   : 'Deaf',
    'role.admin'  : 'Admin',

    'cat.therapy'       : 'Therapy',
    'cat.entertainment' : 'Entertainment',
    'cat.support'       : 'Support Org.',

    'sign.letter'   : 'Letter',
    'sign.word'     : 'Word',
    'sign.sentence' : 'Sentence',

    'status.active'  : 'Active',
    'status.inactive': 'Suspended',

    'btn.add'        : 'Add',
    'btn.save'       : 'Save',
    'btn.cancel'     : 'Cancel',
    'btn.edit'       : 'Edit',
    'btn.delete'     : 'Delete',
    'btn.activate'   : 'Activate',
    'btn.deactivate' : 'Suspend',
    'btn.resetpw'    : 'Reset Password',
    'btn.showmap'    : 'Map',

    'modal.addUser'   : 'Add New User',
    'modal.editUser'  : 'Edit User',
    'modal.addAdmin'  : 'Add New Admin',
    'modal.editAdmin' : 'Edit Admin',
    'modal.addPlace'  : 'Add New Place',
    'modal.editPlace' : 'Edit Place',
    'modal.addSign'   : 'Add Sign',
    'modal.editSign'  : 'Edit Sign',
    'modal.addVideo'  : 'Add Video',
    'modal.editVideo' : 'Edit Video',
    'modal.resetpw'   : 'Reset Password',

    'lbl.name'    : 'Full Name',
    'lbl.email'   : 'Email Address',
    'lbl.password': 'Password',
    'lbl.role'    : 'Account Type',
    'lbl.city'    : 'City',
    'lbl.pcat'    : 'Place Category',
    'lbl.phone'   : 'Phone Number',
    'lbl.lat'     : 'Latitude',
    'lbl.lng'     : 'Longitude',
    'lbl.desc'    : 'Description',
    'lbl.notes'   : 'Accessibility Notes',
    'lbl.verified': 'Verified Place?',
    'lbl.sname'   : 'Sign Name',
    'lbl.scat'    : 'Sign Category',
    'lbl.smedia'  : 'Image/GIF URL',
    'lbl.vtitle'  : 'Video Title',
    'lbl.vurl'    : 'Video URL',
    'lbl.vdesc'   : 'Video Description',

    'toast.saved'   : '✓ Saved successfully',
    'toast.deleted' : '✓ Deleted successfully',
    'toast.toggled' : '✓ Status updated',
    'toast.error'   : '✗ An error occurred',
    'toast.noperm'  : '⚠ No permission',

    'confirm.title'     : 'Confirm Action',
    'confirm.delete'    : 'Are you sure? This cannot be undone.',
    'confirm.deactivate': 'Suspend this account? They won\'t be able to login.',
    'confirm.activate'  : 'Activate this account?',

    'empty'       : 'No data available.',
    'loading'     : 'Loading...',
    'yes'         : 'Yes',
    'no'          : 'No',
    'recent.posts': 'Recent Posts',
    'view.all'    : 'View All',
    'topbar.sub'  : 'Unmute Admin Panel',
    'ph.name'     : 'Enter name',
    'ph.email'    : 'example@mail.com',
    'ph.pass'     : 'Min 6 characters',
    'ph.lat'      : '32.3104',
    'ph.lng'      : '35.0288',
  }
};

/** دالة الترجمة المختصرة */
const t = (key) => TRANSLATIONS[lang][key] ?? key;

/** تطبيق اللغة على الصفحة */
function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';

  /* تحديث نص الزر */
  document.getElementById('langBtnText').textContent = lang === 'ar' ? 'English' : 'العربية';

  /* تحديث عنوان الـ topbar */
  const topSub = document.getElementById('topbarSub');
  if (topSub) topSub.textContent = t('topbar.sub');

  /* إعادة رسم القسم الحالي */
  rerenderCurrent();

  /* حفظ اللغة */
  localStorage.setItem('unmute_admin_lang', lang);
}

/* ══════════════════════════════════════════════════════════
   3) التنقل بين الأقسام
   ══════════════════════════════════════════════════════════ */

/**
 * الانتقال لقسم معين
 * @param {string} key - مفتاح القسم (home, users, admins, ...)
 */
function gotoSection(key) {
  /* إخفاء القسم القديم وتفعيل الجديد */
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const section = document.getElementById(`section-${key}`);
  const btn     = document.querySelector(`.nav-btn[data-section="${key}"]`);

  if (section) section.classList.add('active');
  if (btn)     btn.classList.add('active');

  /* تحديث عنوان الصفحة */
  const title = document.getElementById('pageTitle');
  if (title) title.textContent = t(key);

  currentSection = key;

  /* إغلاق الـ Sidebar في الشاشات الصغيرة */
  closeSidebar();

  /* تحميل البيانات إذا لم تُحمَّل بعد */
  if (!loadedSections.has(key)) {
    loadedSections.add(key);
    loadSectionData(key);
  }

  /* إعادة ضبط الخريطة إذا فُتح قسم الأماكن */
  if (key === 'places' && adminMap) {
    setTimeout(() => adminMap.invalidateSize(), 200);
  }
}

/** تحديد الدالة المناسبة لتحميل بيانات كل قسم */
function loadSectionData(key) {
  const loaders = {
    home     : loadHome,
    users    : loadUsers,
    admins   : loadAdmins,
    posts    : loadPosts,
    comments : loadComments,
    messages : loadMessages,
    tasks    : loadTasks,
    places   : loadPlaces,
    signs    : IS_SUPER ? loadSigns  : null,
    videos   : IS_SUPER ? loadVideos : null
  };
  if (loaders[key]) loaders[key]();
}

/** إعادة رسم القسم الحالي (للترجمة) */
function rerenderCurrent() {
  const renderers = {
    home     : renderHome,
    users    : renderUsers,
    admins   : renderAdmins,
    posts    : renderPosts,
    comments : renderComments,
    messages : renderMessages,
    tasks    : renderTasks,
    places   : renderPlaces,
    signs    : renderSigns,
    videos   : renderVideos
  };
  if (renderers[currentSection]) renderers[currentSection]();
}

/* ══════════════════════════════════════════════════════════
   4) دوال مساعدة
   ══════════════════════════════════════════════════════════ */

/** تنظيف HTML لمنع XSS */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** توليد ID جديد للمصفوفات المحلية */
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

/** إنشاء Pill (بادج) ملون */
function pill(cls, text) {
  return `<span class="pill pill-${cls}">${esc(text)}</span>`;
}

/** Pill خاص بدور المستخدم */
function rolePill(role) {
  const map = { normal: 'normal', deaf: 'deaf', admin: 'admin' };
  return pill(map[role] || 'normal', t(`role.${role}`) || role);
}

/** Pill خاص بحالة الحساب */
function statusPill(isActive) {
  return isActive
    ? pill('active', t('status.active'))
    : pill('inactive', t('status.inactive'));
}

/** Pill خاص بتصنيف المكان */
function catPill(cat) {
  const map = { therapy: 'therapy', entertainment: 'entertainment', support: 'support' };
  return pill(map[cat] || 'support', t(`cat.${cat}`) || cat);
}

/** تجميع أزرار الإجراءات في خلية */
function actions(...btns) {
  return `<div class="td-actions">${btns.filter(Boolean).join('')}</div>`;
}

/** عرض حالة فارغة في الجدول */
function emptyTable(msg) {
  return `<div class="table-empty">
    <i class="fa-solid fa-inbox"></i>
    <p>${msg || t('empty')}</p>
  </div>`;
}

/** تقصير النص */
function truncate(str, len = 120) {
  const s = str ?? '';
  return s.length > len ? s.slice(0, len) + '…' : s;
}

/* ══════════════════════════════════════════════════════════
   5) API — التواصل مع الخادم
   ══════════════════════════════════════════════════════════ */

/**
 * إرسال طلب AJAX إلى admin_action.php
 * @param {Object} payload - بيانات الطلب
 * @returns {Promise<Object>} - الرد من الخادم
 */
async function api(payload) {
  try {
    const response = await fetch('admin_action.php', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    return { ok: false, msg: 'خطأ في الاتصال بالخادم' };
  }
}

/* ══════════════════════════════════════════════════════════
   6) Toast — رسائل الإشعار
   ══════════════════════════════════════════════════════════ */

let toastTimer = null;

/**
 * عرض رسالة إشعار
 * @param {string} msg  - نص الرسالة
 * @param {string} type - نوع: success | error | info | warning
 */
function showToast(msg, type = 'info') {
  const el = document.getElementById('toastNotification');
  if (!el) return;

  /* إزالة الأنواع القديمة */
  el.className = `toast-notification toast-${type} visible`;
  el.textContent = msg;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('visible');
  }, 3200);
}

/* ══════════════════════════════════════════════════════════
   7) Modal — النوافذ المنبثقة
   ══════════════════════════════════════════════════════════ */

/**
 * فتح Modal
 * @param {Object} opts - { icon, title, body, foot }
 */
function openModal({ icon = 'fa-pen', title = '', body = '', foot = '' }) {
  document.getElementById('modalIcon').className   = `fa-solid ${icon}`;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML    = body;
  document.getElementById('modalFooter').innerHTML  = foot;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

/** Footer افتراضي للـ Modal */
function defaultFoot(saveId) {
  return `
    <button class="btn btn-ghost btn-sm" onclick="closeModal()">${t('btn.cancel')}</button>
    <button class="btn btn-primary btn-sm" id="${saveId}">
      <i class="fa-solid fa-check"></i> ${t('btn.save')}
    </button>
  `;
}

/* ══════════════════════════════════════════════════════════
   8) Confirm — نافذة تأكيد
   ══════════════════════════════════════════════════════════ */

let confirmCallback = null;

/**
 * عرض نافذة تأكيد
 * @param {string}   msgKey - مفتاح الرسالة من TRANSLATIONS
 * @param {Function} cb     - دالة تُنفَّذ عند التأكيد
 */
function confirmAction(msgKey, cb) {
  document.getElementById('confirmTitle').textContent   = t('confirm.title');
  document.getElementById('confirmMessage').textContent = t(msgKey);
  document.getElementById('confirmOverlay').classList.add('open');
  confirmCallback = cb;
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
  confirmCallback = null;
}

/* ══════════════════════════════════════════════════════════
   9) HOME — الإحصائيات والصفحة الرئيسية
   ══════════════════════════════════════════════════════════ */

async function loadHome() {
  const res = await api({ action: 'get_stats' });
  if (!res.ok) return;

  const s = res.data;

  /* تحديث بادجات الـ Sidebar */
  document.getElementById('bdg-users').textContent    = s.users_total ?? '—';
  document.getElementById('bdg-posts').textContent    = s.posts       ?? '—';
  document.getElementById('bdg-msgs').textContent     = s.messages    ?? '—';
  document.getElementById('bdg-tasks').textContent    = s.tasks_total ?? '—';
  document.getElementById('bdg-places').textContent   = s.places      ?? '—';

  renderHome(s);
  /* تم إزالة تحميل جدول المنشورات هنا بناءً على طلب المستخدم */
}

function renderHome(s = {}) {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  /* بطاقات الإحصائيات */
  grid.innerHTML = `
    <!-- المستخدمون -->
    <div class="stat-card stat-c1" onclick="gotoSection('users')" title="اضغط لعرض المستخدمين">
      <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
      <div class="stat-body">
        <strong>${s.users_total ?? '—'}</strong>
        <span>${t('stat.users_total')}</span>
      </div>
    </div>

    <!-- المستخدمون النشطون -->
    <div class="stat-card stat-c5" onclick="gotoSection('users')" title="نشط">
      <div class="stat-icon"><i class="fa-solid fa-user-check"></i></div>
      <div class="stat-body">
        <strong>${s.users_active ?? '—'}</strong>
        <span>${t('stat.users_active')}</span>
      </div>
    </div>

    <!-- الأدمن -->
    <div class="stat-card stat-c2" onclick="gotoSection('admins')">
      <div class="stat-icon"><i class="fa-solid fa-user-shield"></i></div>
      <div class="stat-body">
        <strong>${s.admins ?? '—'}</strong>
        <span>${t('stat.admins')}</span>
      </div>
    </div>

    <!-- المنشورات -->
    <div class="stat-card stat-c3" onclick="gotoSection('posts')">
      <div class="stat-icon"><i class="fa-solid fa-newspaper"></i></div>
      <div class="stat-body">
        <strong>${s.posts ?? '—'}</strong>
        <span>${t('stat.posts')}</span>
      </div>
    </div>

    <!-- التعليقات -->
    <div class="stat-card stat-c4" onclick="gotoSection('comments')">
      <div class="stat-icon"><i class="fa-solid fa-comments"></i></div>
      <div class="stat-body">
        <strong>${s.comments ?? '—'}</strong>
        <span>${t('stat.comments')}</span>
      </div>
    </div>

    <!-- المهام المنجزة -->
    <div class="stat-card stat-c6" onclick="gotoSection('tasks')">
      <div class="stat-icon"><i class="fa-solid fa-check-circle"></i></div>
      <div class="stat-body">
        <strong>${s.tasks_done ?? '—'}</strong>
        <span>${t('stat.tasks')}</span>
      </div>
    </div>

    <!-- الأماكن الداعمة -->
    <div class="stat-card stat-c7" onclick="gotoSection('places')">
      <div class="stat-icon"><i class="fa-solid fa-location-dot"></i></div>
      <div class="stat-body">
        <strong>${s.places ?? '—'}</strong>
        <span>${t('stat.places')}</span>
      </div>
    </div>

    <!-- رسائل الإدارة -->
    <div class="stat-card stat-c8" onclick="gotoSection('messages')">
      <div class="stat-icon"><i class="fa-solid fa-envelope"></i></div>
      <div class="stat-body">
        <strong>${s.messages ?? '—'}</strong>
        <span>${t('stat.messages')}</span>
      </div>
    </div>
  `;
}



/* ══════════════════════════════════════════════════════════
   10) USERS — المستخدمون
   ══════════════════════════════════════════════════════════ */

async function loadUsers() {
  const res = await api({ action: 'list_users' });
  if (!res.ok) return;
  DATA.users = res.data;
  renderUsers();
  document.getElementById('bdg-users').textContent = DATA.users.length;
}

function renderUsers() {
  const q      = (document.getElementById('q-users')?.value || '').toLowerCase().trim();
  const filter = document.getElementById('filter-users')?.value || 'all';
  const wrap   = document.getElementById('table-users');
  if (!wrap) return;

  /* تصفية حسب البحث والفلتر */
  const filtered = DATA.users.filter(u => {
    const matchQ = `${u.name} ${u.email}`.toLowerCase().includes(q);
    const matchF =
      filter === 'all'       ? true :
      filter === 'active'    ? u.active  === 1 :
      filter === 'inactive'  ? u.active  === 0 :
      filter === 'deaf'      ? u.role    === 'deaf' :
      filter === 'normal'    ? u.role    === 'normal' : true;
    return matchQ && matchF;
  });

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.name')}</th>
          <th>${t('col.email')}</th>
          <th>${t('col.role')}</th>
          <th>${t('col.status')}</th>
          <th>${t('col.joined')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(u => `
          <tr>
            <td><div class="td-name"><strong>${esc(u.name)}</strong></div></td>
            <td class="td-truncate">${esc(u.email)}</td>
            <td>${rolePill(u.role)}</td>
            <td>${statusPill(u.active)}</td>
            <td class="td-truncate">${esc(u.joined)}</td>
            <td>${actions(
              /* زر تعديل */
              `<button class="btn btn-ghost btn-sm" onclick="openUserModal(${u.id})" title="${t('btn.edit')}">
                <i class="fa-solid fa-pen"></i>
              </button>`,

              /* زر إعادة كلمة المرور — Super Admin فقط */
              IS_SUPER ? `<button class="btn btn-warning btn-sm" onclick="openResetPwModal(${u.id},'${esc(u.name)}')" title="${t('btn.resetpw')}">
                <i class="fa-solid fa-key"></i>
              </button>` : '',

              /* زر تفعيل/إيقاف */
              `<button class="btn ${u.active ? 'btn-danger' : 'btn-success'} btn-sm"
                       onclick="doToggleUser(${u.id}, ${u.active})"
                       title="${u.active ? t('btn.deactivate') : t('btn.activate')}">
                <i class="fa-solid ${u.active ? 'fa-ban' : 'fa-check'}"></i>
              </button>`,
              `<button class="btn btn-danger btn-sm" onclick="doDeleteUser(${u.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/** فتح Modal إضافة/تعديل مستخدم */
function openUserModal(id = null) {
  const u     = id ? DATA.users.find(x => x.id === id) : null;
  const title = u ? t('modal.editUser') : t('modal.addUser');

  openModal({
    icon  : 'fa-user',
    title,
    body  : `
      <div class="form-grid">
        <div class="form-field">
          <label>${t('lbl.name')}</label>
          <input id="u_name" type="text" value="${esc(u?.name || '')}" placeholder="${t('ph.name')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.email')}</label>
          <input id="u_email" type="email" value="${esc(u?.email || '')}" placeholder="${t('ph.email')}"/>
        </div>
        ${!u ? `
        <div class="form-field form-field-full">
          <label>${t('lbl.password')}</label>
          <input id="u_pass" type="password" placeholder="${t('ph.pass')}"/>
          <span class="form-hint">${lang==='ar'?'6 أحرف على الأقل':'Min 6 characters'}</span>
        </div>` : ''}
        <div class="form-field form-field-full">
          <label>${t('lbl.role')}</label>
          <select id="u_role">
            <option value="normal" ${u?.role==='normal'?'selected':''}>${t('role.normal')}</option>
            <option value="deaf"   ${u?.role==='deaf'  ?'selected':''}>${t('role.deaf')}</option>
          </select>
        </div>
      </div>
    `,
    foot : defaultFoot('u_save_btn')
  });

  /* ربط زر الحفظ */
  setTimeout(() => {
    document.getElementById('u_save_btn').onclick = async () => {
      const name  = document.getElementById('u_name').value.trim();
      const email = document.getElementById('u_email').value.trim();
      const pass  = document.getElementById('u_pass')?.value.trim() || '';
      const role  = document.getElementById('u_role').value;

      /* تحقق من الحقول */
      if (!name || !email || (!u && !pass)) {
        showToast(lang==='ar'?'يرجى تعبئة الحقول المطلوبة':'Please fill required fields', 'error');
        return;
      }

      const payload = u
        ? { action: 'update_user', id: u.id, name, email, role }
        : { action: 'add_user', name, email, pass, role };

      const res = await api(payload);

      if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

      if (u) {
        /* تحديث البيانات محلياً */
        Object.assign(u, { name, email, role });
      } else {
        /* إضافة المستخدم الجديد للمصفوفة */
        DATA.users.unshift({
          id    : res.id,
          name, email, role,
          active: 1,
          joined: new Date().toISOString().slice(0, 10)
        });
        document.getElementById('bdg-users').textContent = DATA.users.length;
      }

      closeModal();
      renderUsers();
      showToast(t('toast.saved'), 'success');
    };
  }, 0);
}

/** تفعيل/إيقاف مستخدم */
function doToggleUser(id, currentActive) {
  const msgKey = currentActive ? 'confirm.deactivate' : 'confirm.activate';

  confirmAction(msgKey, async () => {
    const res = await api({ action: 'toggle_user_status', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    /* تحديث الحالة محلياً */
    const user = DATA.users.find(u => u.id === id);
    if (user) user.active = res.active;

    renderUsers();
    showToast(t('toast.toggled'), 'success');
  });
}

/** حذف مستخدم نهائياً */
function doDeleteUser(id) {
  confirmAction('confirm.delete', async () => {
    const res = await api({ action: 'delete_user', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    /* إزالة من المصفوفة المحلية */
    DATA.users = DATA.users.filter(u => u.id !== id);
    renderUsers();
    
    /* تحديث العدادات */
    const bdg = document.getElementById('bdg-users');
    if (bdg) bdg.textContent = DATA.users.length;
    
    showToast(t('toast.deleted'), 'success');
  });
}

/** إعادة تعيين كلمة المرور (Super Admin) */
function openResetPwModal(id, name) {
  if (!IS_SUPER) { showToast(t('toast.noperm'), 'warning'); return; }

  openModal({
    icon  : 'fa-key',
    title : t('modal.resetpw'),
    body  : `
      <div class="form-grid">
        <div class="form-field form-field-full field-readonly">
          <label>${t('lbl.name')}</label>
          <input type="text" value="${esc(name)}" readonly/>
        </div>
        <div class="form-field form-field-full">
          <label>${t('lbl.password')}</label>
          <input id="rp_pass" type="password" placeholder="${t('ph.pass')}"/>
        </div>
      </div>
    `,
    foot : defaultFoot('rp_save_btn')
  });

  setTimeout(() => {
    document.getElementById('rp_save_btn').onclick = async () => {
      const pass = document.getElementById('rp_pass').value.trim();
      if (!pass || pass.length < 6) {
        showToast(lang==='ar'?'كلمة المرور قصيرة':'Password too short', 'error');
        return;
      }
      const res = await api({ action: 'reset_user_password', id, pass });
      if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }
      closeModal();
      showToast(t('toast.saved'), 'success');
    };
  }, 0);
}

/* ══════════════════════════════════════════════════════════
   11) ADMINS — الأدمن
   ══════════════════════════════════════════════════════════ */

async function loadAdmins() {
  const res = await api({ action: 'list_admins' });
  if (!res.ok) return;
  DATA.admins = res.data;
  renderAdmins();
  document.getElementById('bdg-admins').textContent = DATA.admins.length;
}

function renderAdmins() {
  const q    = (document.getElementById('q-admins')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-admins');
  if (!wrap) return;

  const filtered = DATA.admins.filter(a =>
    `${a.name} ${a.email}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.name')}</th>
          <th>${t('col.email')}</th>
          <th>الصلاحية</th>
          <th>${t('col.status')}</th>
          <th>${t('col.joined')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(a => `
          <tr>
            <td>
              <div class="td-name">
                <strong>${esc(a.name)}</strong>
                ${a.isSelf ? `<span class="pill pill-self" style="margin-right:6px">${lang==='ar'?'أنت':'You'}</span>` : ''}
              </div>
            </td>
            <td class="td-truncate">${esc(a.email)}</td>
            <td>${a.isSuper ? pill('super', '⭐ Super Admin') : pill('admin', t('role.admin'))}</td>
            <td>${statusPill(a.active)}</td>
            <td class="td-truncate">${esc(a.joined)}</td>
            <td>${IS_SUPER ? actions(
              /* تعديل — Super Admin فقط */
              `<button class="btn btn-ghost btn-sm" onclick="openAdminModal(${a.id})" title="${t('btn.edit')}">
                <i class="fa-solid fa-pen"></i>
              </button>`,

              /* إيقاف — لا يُطبَّق على نفسه أو Super Admin */
              (!a.isSelf && !a.isSuper) ? `
              <button class="btn ${a.active ? 'btn-danger' : 'btn-success'} btn-sm"
                      onclick="doToggleAdmin(${a.id}, ${a.active})"
                      title="${a.active ? t('btn.deactivate') : t('btn.activate')}">
                <i class="fa-solid ${a.active ? 'fa-ban' : 'fa-check'}"></i>
              </button>` : ''
            ) : '<span class="pill pill-normal" style="font-size:.7rem">عرض فقط</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openAdminModal(id = null) {
  if (!IS_SUPER) { showToast(t('toast.noperm'), 'warning'); return; }

  const a     = id ? DATA.admins.find(x => x.id === id) : null;
  const title = a ? t('modal.editAdmin') : t('modal.addAdmin');

  openModal({
    icon  : 'fa-user-shield',
    title,
    body  : `
      <div class="form-grid">
        <div class="form-field">
          <label>${t('lbl.name')}</label>
          <input id="a_name" type="text" value="${esc(a?.name || '')}" placeholder="${t('ph.name')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.email')}</label>
          <input id="a_email" type="email" value="${esc(a?.email || '')}" placeholder="${t('ph.email')}"/>
        </div>
        ${!a ? `
        <div class="form-field form-field-full">
          <label>${t('lbl.password')}</label>
          <input id="a_pass" type="password" placeholder="${t('ph.pass')}"/>
        </div>` : ''}
      </div>
    `,
    foot : defaultFoot('a_save_btn')
  });

  setTimeout(() => {
    document.getElementById('a_save_btn').onclick = async () => {
      const name  = document.getElementById('a_name').value.trim();
      const email = document.getElementById('a_email').value.trim();
      const pass  = document.getElementById('a_pass')?.value.trim() || '';

      if (!name || !email || (!a && !pass)) {
        showToast(lang==='ar'?'يرجى تعبئة الحقول':'Fill required fields', 'error');
        return;
      }

      const payload = a
        ? { action: 'update_admin', id: a.id, name, email }
        : { action: 'add_admin', name, email, pass };

      const res = await api(payload);
      if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

      if (a) {
        a.name  = name;
        a.email = email;
      } else {
        DATA.admins.push({
          id     : res.id,
          name, email,
          isSuper: false,
          isSelf : false,
          active : 1,
          joined : new Date().toISOString().slice(0, 10)
        });
        document.getElementById('bdg-admins').textContent = DATA.admins.length;
      }

      closeModal();
      renderAdmins();
      showToast(t('toast.saved'), 'success');
    };
  }, 0);
}

function doToggleAdmin(id, currentActive) {
  if (!IS_SUPER) { showToast(t('toast.noperm'), 'warning'); return; }

  const msgKey = currentActive ? 'confirm.deactivate' : 'confirm.activate';

  confirmAction(msgKey, async () => {
    const res = await api({ action: 'toggle_admin_status', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    const admin = DATA.admins.find(a => a.id === id);
    if (admin) admin.active = res.active;

    renderAdmins();
    showToast(t('toast.toggled'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   12) POSTS — المنشورات
   ══════════════════════════════════════════════════════════ */

async function loadPosts() {
  const res = await api({ action: 'list_posts' });
  if (!res.ok) return;
  DATA.posts = res.data;
  renderPosts();
  document.getElementById('bdg-posts').textContent = DATA.posts.length;
}

function renderPosts() {
  const q    = (document.getElementById('q-posts')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-posts');
  if (!wrap) return;

  const filtered = DATA.posts.filter(p =>
    `${p.author} ${p.content} ${p.date}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.author')}</th>
          <th>${t('col.content')}</th>
          <th>${t('col.likes')}</th>
          <th>${t('col.comments')}</th>
          <th>${t('col.date')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(p => `
          <tr>
            <td><div class="td-name"><strong>${esc(p.author)}</strong></div></td>
            <td><div class="td-truncate">${esc(truncate(p.content, 130))}</div></td>
            <td class="td-truncate">
              <i class="fa-solid fa-heart" style="color:#e91e63;font-size:.74rem"></i> ${p.likes}
            </td>
            <td class="td-truncate">
              <i class="fa-solid fa-comment" style="color:#1976d2;font-size:.74rem"></i> ${p.comments}
            </td>
            <td class="td-truncate">${esc(p.date)}</td>
            <td>${actions(
              `<button class="btn btn-danger btn-sm" onclick="doDeletePost(${p.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function doDeletePost(id) {
  confirmAction('confirm.delete', async () => {
    const res = await api({ action: 'delete_post', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    DATA.posts = DATA.posts.filter(p => p.id !== id);
    renderPosts();
    renderRecentPosts();
    document.getElementById('bdg-posts').textContent = DATA.posts.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   13) COMMENTS — التعليقات
   ══════════════════════════════════════════════════════════ */

async function loadComments() {
  const res = await api({ action: 'list_comments' });
  if (!res.ok) return;
  DATA.comments = res.data;
  renderComments();
  document.getElementById('bdg-comments').textContent = DATA.comments.length;
}

function renderComments() {
  const q    = (document.getElementById('q-comments')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-comments');
  if (!wrap) return;

  const filtered = DATA.comments.filter(c =>
    `${c.author} ${c.content}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.author')}</th>
          <th>${t('col.content')}</th>
          <th>رقم المنشور</th>
          <th>${t('col.date')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(c => `
          <tr>
            <td><div class="td-name"><strong>${esc(c.author)}</strong></div></td>
            <td><div class="td-truncate">${esc(truncate(c.content))}</div></td>
            <td class="td-truncate">#${c.postId}</td>
            <td class="td-truncate">${esc(c.date)}</td>
            <td>${actions(
              `<button class="btn btn-danger btn-sm" onclick="doDeleteComment(${c.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function doDeleteComment(id) {
  confirmAction('confirm.delete', async () => {
    const res = await api({ action: 'delete_comment', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    DATA.comments = DATA.comments.filter(c => c.id !== id);
    renderComments();
    document.getElementById('bdg-comments').textContent = DATA.comments.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   14) MESSAGES — رسائل الإدارة
   ══════════════════════════════════════════════════════════ */

async function loadMessages() {
  const res = await api({ action: 'list_messages' });
  if (!res.ok) return;
  DATA.messages = res.data;
  renderMessages();
  document.getElementById('bdg-msgs').textContent = DATA.messages.length;
}

function renderMessages() {
  const q    = (document.getElementById('q-msgs')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-msgs');
  if (!wrap) return;

  const filtered = DATA.messages.filter(m =>
    `${m.name} ${m.email} ${m.text}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.sender')}</th>
          <th>${t('col.email')}</th>
          <th>${t('col.message')}</th>
          <th>${t('col.date')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(m => `
          <tr>
            <td><div class="td-name"><strong>${esc(m.name)}</strong></div></td>
            <td class="td-truncate">${esc(m.email)}</td>
            <td>
              <div class="td-truncate" style="max-width:320px">${esc(truncate(m.text, 100))}</div>
            </td>
            <td class="td-truncate">${esc(m.date)}</td>
            <td>${actions(
              `<button class="btn btn-danger btn-sm" onclick="doDeleteMessage(${m.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function doDeleteMessage(id) {
  confirmAction('confirm.delete', async () => {
    const res = await api({ action: 'delete_message', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    DATA.messages = DATA.messages.filter(m => m.id !== id);
    renderMessages();
    document.getElementById('bdg-msgs').textContent = DATA.messages.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   14.5) TASKS — المهام
   ══════════════════════════════════════════════════════════ */

async function loadTasks() {
  const res = await api({ action: 'list_tasks' });
  if (!res.ok) return;
  DATA.tasks = res.data;
  renderTasks();
  document.getElementById('bdg-tasks').textContent = DATA.tasks.length;
}

function renderTasks() {
  const q    = (document.getElementById('q-tasks')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-tasks');
  if (!wrap) return;

  const filtered = DATA.tasks.filter(t =>
    `${t.title} ${t.user_name} ${t.day}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.task')}</th>
          <th>${t('col.name')}</th>
          <th>${t('col.day')}</th>
          <th>${t('col.status')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(tsk => `
          <tr>
            <td><div class="td-name"><strong>${esc(tsk.title)}</strong></div></td>
            <td class="td-truncate">${esc(tsk.user_name)}</td>
            <td class="td-truncate">${esc(tsk.day)}</td>
            <td>${tsk.is_done ? pill('success', 'منجزة') : pill('normal', 'قيد الانتظار')}</td>
            <td>${actions(
              `<button class="btn btn-danger btn-sm" onclick="doDeleteTask(${tsk.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function doDeleteTask(id) {
  confirmAction('confirm.delete', async () => {
    const res = await api({ action: 'delete_task', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    DATA.tasks = DATA.tasks.filter(t => t.id !== id);
    renderTasks();
    document.getElementById('bdg-tasks').textContent = DATA.tasks.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   15) PLACES — الأماكن الداعمة
   ══════════════════════════════════════════════════════════ */

async function loadPlaces() {
  const res = await api({ action: 'list_places' });
  if (!res.ok) return;
  DATA.places = res.data;
  renderPlaces();
  initMap();
  document.getElementById('bdg-places').textContent = DATA.places.length;
}

function renderPlaces() {
  const q    = (document.getElementById('q-places')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-places');
  if (!wrap) return;

  const filtered = DATA.places.filter(p =>
    `${p.name} ${p.city} ${p.category}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.name')}</th>
          <th>${t('col.city')}</th>
          <th>${t('col.category')}</th>
          <th>${t('col.phone')}</th>
          <th>${t('col.verified')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(p => `
          <tr>
            <td><div class="td-name"><strong>${esc(p.name)}</strong></div></td>
            <td class="td-truncate">${esc(p.city)}</td>
            <td>${catPill(p.category)}</td>
            <td class="td-truncate">${esc(p.phone || '—')}</td>
            <td>${p.verified ? pill('verified', '✓ موثوق') : ''}</td>
            <td>${actions(
              /* تعديل */
              `<button class="btn btn-ghost btn-sm" onclick="openPlaceModal(${p.id})" title="${t('btn.edit')}">
                <i class="fa-solid fa-pen"></i>
              </button>`,
              /* عرض على الخريطة */
              (p.lat && p.lng) ? `<button class="btn btn-success btn-sm" onclick="flyToPlace(${p.id})" title="${t('btn.showmap')}">
                <i class="fa-solid fa-map"></i>
              </button>` : '',
              /* حذف */
              `<button class="btn btn-danger btn-sm" onclick="doDeletePlace(${p.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  refreshMapMarkers();
}

function openPlaceModal(id = null) {
  const p     = id ? DATA.places.find(x => x.id === id) : null;
  const title = p ? t('modal.editPlace') : t('modal.addPlace');

  openModal({
    icon  : 'fa-location-dot',
    title,
    body  : `
      <div class="form-grid">
        <div class="form-field">
          <label>${t('lbl.name')}</label>
          <input id="p_name" value="${esc(p?.name || '')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.city')}</label>
          <input id="p_city" value="${esc(p?.city || '')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.pcat')}</label>
          <select id="p_cat">
            <option value="therapy"       ${p?.category==='therapy'      ?'selected':''}>${t('cat.therapy')}</option>
            <option value="entertainment" ${p?.category==='entertainment'?'selected':''}>${t('cat.entertainment')}</option>
            <option value="support"       ${p?.category==='support'      ?'selected':''}>${t('cat.support')}</option>
          </select>
        </div>
        <div class="form-field">
          <label>${t('lbl.phone')}</label>
          <input id="p_phone" value="${esc(p?.phone || '')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.lat')}</label>
          <input id="p_lat" type="number" step=".000001" value="${p?.lat ?? ''}" placeholder="${t('ph.lat')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.lng')}</label>
          <input id="p_lng" type="number" step=".000001" value="${p?.lng ?? ''}" placeholder="${t('ph.lng')}"/>
        </div>
        <div class="form-field form-field-full">
          <label>${t('lbl.desc')}</label>
          <textarea id="p_desc">${esc(p?.desc || '')}</textarea>
        </div>
        <div class="form-field">
          <label>${t('lbl.verified')}</label>
          <select id="p_verified">
            <option value="0" ${!p?.verified?'selected':''}>${t('no')}</option>
            <option value="1" ${p?.verified ?'selected':''}>${t('yes')}</option>
          </select>
        </div>
      </div>
    `,
    foot : defaultFoot('p_save_btn')
  });

  setTimeout(() => {
    document.getElementById('p_save_btn').onclick = async () => {
      const name        = document.getElementById('p_name').value.trim();
      const city        = document.getElementById('p_city').value.trim();
      const category    = document.getElementById('p_cat').value;
      const phone       = document.getElementById('p_phone').value.trim();
      const lat         = parseFloat(document.getElementById('p_lat').value) || null;
      const lng         = parseFloat(document.getElementById('p_lng').value) || null;
      const description = document.getElementById('p_desc').value.trim();
      const verified    = parseInt(document.getElementById('p_verified').value);

      if (!name || !city) {
        showToast(lang==='ar'?'الاسم والمدينة مطلوبان':'Name and city required', 'error');
        return;
      }

      const payload = p
        ? { action: 'update_place', id: p.id, name, city, category, phone, lat, lng, description, verified }
        : { action: 'add_place',              name, city, category, phone, lat, lng, description, verified };

      const res = await api(payload);
      if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

      if (p) {
        Object.assign(p, { name, city, category, phone, lat, lng, verified });
      } else {
        DATA.places.unshift({ id: res.id, name, city, category, phone, lat, lng, verified, desc: description });
        document.getElementById('bdg-places').textContent = DATA.places.length;
      }

      closeModal();
      renderPlaces();
      showToast(t('toast.saved'), 'success');
    };
  }, 0);
}

function doDeletePlace(id) {
  confirmAction('confirm.delete', async () => {
    const res = await api({ action: 'delete_place', id });
    if (!res.ok) { showToast(res.msg || t('toast.error'), 'error'); return; }

    DATA.places = DATA.places.filter(p => p.id !== id);
    renderPlaces();
    document.getElementById('bdg-places').textContent = DATA.places.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   16) SIGNS — الإشارات (Super Admin فقط)
   ══════════════════════════════════════════════════════════ */

function loadSigns() { renderSigns(); document.getElementById('bdg-signs').textContent = DATA.signs.length; }

function renderSigns() {
  const q    = (document.getElementById('q-signs')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-signs');
  if (!wrap) return;

  const filtered = DATA.signs.filter(s =>
    `${s.title} ${s.category}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  const catLabels = { letter: t('sign.letter'), word: t('sign.word'), sentence: t('sign.sentence') };

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.name')}</th>
          <th>${t('col.category')}</th>
          <th>${t('col.media')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(s => `
          <tr>
            <td><div class="td-name"><strong>${esc(s.title)}</strong></div></td>
            <td>${pill(`sign-${s.category}`, catLabels[s.category] || s.category)}</td>
            <td>
              <div class="td-truncate">
                <a href="${esc(s.media)}" target="_blank" style="color:var(--navy2);font-weight:700">
                  ${esc(truncate(s.media, 60))}
                </a>
              </div>
            </td>
            <td>${actions(
              `<button class="btn btn-ghost btn-sm" onclick="openSignModal(${s.id})" title="${t('btn.edit')}">
                <i class="fa-solid fa-pen"></i>
              </button>`,
              `<button class="btn btn-danger btn-sm" onclick="doDeleteSign(${s.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openSignModal(id = null) {
  const s     = id ? DATA.signs.find(x => x.id === id) : null;
  const title = s ? t('modal.editSign') : t('modal.addSign');

  openModal({
    icon  : 'fa-hands',
    title,
    body  : `
      <div class="form-grid">
        <div class="form-field">
          <label>${t('lbl.sname')}</label>
          <input id="s_title" value="${esc(s?.title || '')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.scat')}</label>
          <select id="s_cat">
            <option value="letter"   ${s?.category==='letter'  ?'selected':''}>${t('sign.letter')}</option>
            <option value="word"     ${s?.category==='word'    ?'selected':''}>${t('sign.word')}</option>
            <option value="sentence" ${s?.category==='sentence'?'selected':''}>${t('sign.sentence')}</option>
          </select>
        </div>
        <div class="form-field form-field-full">
          <label>${t('lbl.smedia')}</label>
          <input id="s_media" type="url" value="${esc(s?.media || '')}" placeholder="https://..."/>
        </div>
      </div>
    `,
    foot : defaultFoot('s_save_btn')
  });

  setTimeout(() => {
    document.getElementById('s_save_btn').onclick = () => {
      const title    = document.getElementById('s_title').value.trim();
      const category = document.getElementById('s_cat').value;
      const media    = document.getElementById('s_media').value.trim();

      if (!title || !media) {
        showToast(lang==='ar'?'يرجى تعبئة الحقول':'Fill required fields', 'error');
        return;
      }

      if (s) {
        Object.assign(s, { title, category, media });
      } else {
        DATA.signs.push({ id: nextId(DATA.signs), title, category, media });
        document.getElementById('bdg-signs').textContent = DATA.signs.length;
      }

      closeModal();
      renderSigns();
      showToast(t('toast.saved'), 'success');
    };
  }, 0);
}

function doDeleteSign(id) {
  confirmAction('confirm.delete', () => {
    DATA.signs = DATA.signs.filter(s => s.id !== id);
    renderSigns();
    document.getElementById('bdg-signs').textContent = DATA.signs.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   17) VIDEOS — الفيديوهات (Super Admin فقط)
   ══════════════════════════════════════════════════════════ */

function loadVideos() { renderVideos(); document.getElementById('bdg-videos').textContent = DATA.videos.length; }

function renderVideos() {
  const q    = (document.getElementById('q-videos')?.value || '').toLowerCase().trim();
  const wrap = document.getElementById('table-videos');
  if (!wrap) return;

  const filtered = DATA.videos.filter(v =>
    `${v.title} ${v.url} ${v.description}`.toLowerCase().includes(q)
  );

  if (!filtered.length) { wrap.innerHTML = emptyTable(); return; }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col.name')}</th>
          <th>الرابط</th>
          <th>${t('lbl.vdesc')}</th>
          <th>${t('col.actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(v => `
          <tr>
            <td><div class="td-name"><strong>${esc(v.title)}</strong></div></td>
            <td>
              <div class="td-truncate">
                <a href="${esc(v.url)}" target="_blank" style="color:var(--navy2);font-weight:700">
                  ${esc(truncate(v.url, 50))}
                </a>
              </div>
            </td>
            <td><div class="td-truncate">${esc(truncate(v.description, 80))}</div></td>
            <td>${actions(
              `<button class="btn btn-ghost btn-sm" onclick="openVideoModal(${v.id})" title="${t('btn.edit')}">
                <i class="fa-solid fa-pen"></i>
              </button>`,
              `<button class="btn btn-danger btn-sm" onclick="doDeleteVideo(${v.id})" title="${t('btn.delete')}">
                <i class="fa-solid fa-trash"></i>
              </button>`
            )}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openVideoModal(id = null) {
  const v     = id ? DATA.videos.find(x => x.id === id) : null;
  const title = v ? t('modal.editVideo') : t('modal.addVideo');

  openModal({
    icon  : 'fa-video',
    title,
    body  : `
      <div class="form-grid">
        <div class="form-field">
          <label>${t('lbl.vtitle')}</label>
          <input id="v_title" value="${esc(v?.title || '')}"/>
        </div>
        <div class="form-field">
          <label>${t('lbl.vurl')}</label>
          <input id="v_url" type="url" value="${esc(v?.url || '')}" placeholder="https://..."/>
        </div>
        <div class="form-field form-field-full">
          <label>${t('lbl.vdesc')}</label>
          <textarea id="v_desc">${esc(v?.description || '')}</textarea>
        </div>
      </div>
    `,
    foot : defaultFoot('v_save_btn')
  });

  setTimeout(() => {
    document.getElementById('v_save_btn').onclick = () => {
      const title       = document.getElementById('v_title').value.trim();
      const url         = document.getElementById('v_url').value.trim();
      const description = document.getElementById('v_desc').value.trim();

      if (!title || !url) {
        showToast(lang==='ar'?'يرجى تعبئة الحقول':'Fill required fields', 'error');
        return;
      }

      if (v) {
        Object.assign(v, { title, url, description });
      } else {
        DATA.videos.push({ id: nextId(DATA.videos), title, url, description });
        document.getElementById('bdg-videos').textContent = DATA.videos.length;
      }

      closeModal();
      renderVideos();
      showToast(t('toast.saved'), 'success');
    };
  }, 0);
}

function doDeleteVideo(id) {
  confirmAction('confirm.delete', () => {
    DATA.videos = DATA.videos.filter(v => v.id !== id);
    renderVideos();
    document.getElementById('bdg-videos').textContent = DATA.videos.length;
    showToast(t('toast.deleted'), 'success');
  });
}

/* ══════════════════════════════════════════════════════════
   18) MAP — خريطة الأماكن
   ══════════════════════════════════════════════════════════ */

function initMap() {
  if (adminMap) return; /* لا نُعيد الإنشاء إذا كانت الخريطة موجودة */

  const mapEl = document.getElementById('adminMap');
  if (!mapEl) return;

  /* إنشاء الخريطة مع التمركز على طولكرم */
  adminMap   = L.map('adminMap').setView([32.3104, 35.0288], 11);
  mapMarkers = L.layerGroup().addTo(adminMap);

  /* طبقة OpenStreetMap */
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom    : 19,
    attribution: '© OpenStreetMap'
  }).addTo(adminMap);

  refreshMapMarkers();
}

/** تحديث العلامات على الخريطة */
function refreshMapMarkers() {
  if (!mapMarkers) return;
  mapMarkers.clearLayers();

  DATA.places.forEach(p => {
    if (!p.lat || !p.lng) return;

    const marker = L.marker([p.lat, p.lng]);
    marker.bindPopup(`
      <div style="font-family:Cairo;font-weight:800;color:#0b3d91">${esc(p.name)}</div>
      <div style="font-family:Cairo;color:#6b7a99;margin-top:4px">${esc(p.city)}</div>
    `);
    mapMarkers.addLayer(marker);
  });
}

/** التحليق إلى مكان معين على الخريطة */
function flyToPlace(id) {
  const p = DATA.places.find(x => x.id === id);
  if (!p || !p.lat || !adminMap) return;

  gotoSection('places'); /* الانتقال لقسم الأماكن أولاً */

  setTimeout(() => {
    adminMap.invalidateSize();
    adminMap.flyTo([p.lat, p.lng], 15, { duration: 1.2 });
  }, 300);
}

/* ══════════════════════════════════════════════════════════
   19) SIDEBAR — الشريط الجانبي للموبايل
   ══════════════════════════════════════════════════════════ */

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('visible');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

/* ══════════════════════════════════════════════════════════
   20) INIT — التهيئة عند تحميل الصفحة
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── أزرار التنقل في الـ Sidebar ── */
  document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) gotoSection(btn.dataset.section);
    });
  });

  /* ── زر اللغة ── */
  document.getElementById('langBtn').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    applyLanguage();
  });

  /* ── زر قائمة الموبايل ── */
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', openSidebar);
  }

  /* ── إغلاق Modal عند النقر خارجه ── */
  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  /* ── زر تأكيد الحذف ── */
  document.getElementById('confirmOkBtn').addEventListener('click', () => {
    const cb = confirmCallback;
    closeConfirm();
    if (cb) cb();
  });

  /* ── إغلاق Confirm عند النقر خارجه ── */
  document.getElementById('confirmOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeConfirm();
  });

  /* ── تطبيق اللغة المحفوظة ── */
  applyLanguage();

  /* ── تحميل بيانات الصفحة الرئيسية ── */
  loadedSections.add('home');
  loadHome();

  /* ── تحميل الأدمن في الخلفية ── */
  loadedSections.add('admins');
  loadAdmins();
});