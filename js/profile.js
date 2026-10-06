document.addEventListener("DOMContentLoaded", () => {

    /*
        هنا جمعنا كل ترجمة الصفحة في مكان واحد
        حتى يكون التعديل أسهل لاحقًا
    */
    const translations = {
        ar: {
            languageBtnText: "العربية",
            dashboardNav: "الرئيسية",
            contactNav: "اتصل بنا",
            profileMenu: "الملف الشخصي",
            logoutMenu: "تسجيل الخروج",

            heroRoleLabel: window.profileData?.role === "deaf" ? "مستخدم أصم" : "مستخدم عادي",
            joinedText: "انضممت في",
            statPosts: "منشور",
            statDone: "مهمة منجزة",
            statFriends: "صديق",

            tabInfo: "البيانات",
            tabSecurity: "الأمان",
            tabActivity: "الإنجازات",
            tabFriends: "الأصدقاء",
            tabShortcuts: "وصول سريع",

            infoCardTitle: "تعديل البيانات الشخصية",
            infoCardDesc: "يمكنك تغيير اسمك أو بريدك الإلكتروني",
            lblName: "الاسم الكامل",
            lblEmail: "البريد الإلكتروني",
            lblRole: "نوع الحساب",
            roleDisplay: window.profileData?.role === "deaf" ? "مستخدم أصم" : "مستخدم عادي",
            readonlyBadge: "غير قابل للتغيير",
            btnSaveInfo: "حفظ التغييرات",
            namePlaceholder: "اسمك الكامل",
            emailPlaceholder: "بريدك الإلكتروني",

            secCardTitle: "تغيير كلمة المرور",
            secCardDesc: "استخدم كلمة مرور قوية لحماية حسابك",
            lblCurPw: "كلمة المرور الحالية",
            lblNewPw: "كلمة المرور الجديدة",
            lblConfPw: "تأكيد كلمة المرور",
            hint1: "8 أحرف على الأقل",
            hint2: "حرف كبير (A-Z)",
            hint3: "حرف صغير (a-z)",
            hint4: "رقم (0-9)",
            btnSavePw: "تغيير كلمة المرور",
            strengthWeak: "ضعيفة",
            strengthMedium: "متوسطة",
            strengthStrong: "قوية",

            secLearnTitle: "تقدمي في التعلم",
            learnNumbers: "الأرقام",
            learnLetters: "الأحرف",
            learnWords: "الكلمات",
            secTasksTitle: "إنجازات المهام",
            ringDoneLabel: "منجز",
            tstatDone: "مهمة منجزة",
            tstatPending: "مهمة متبقية",
            tstatTotal: "إجمالي المهام",
            tasksLink: "إدارة المهام",
            secSocialTitle: "النشاط الاجتماعي",
            postsDesc: "منشور نشرته في المجتمع",
            postsLink: "عرض المنشورات",

            friendsDesc: "قائمة أصدقائك على منصة Unmute",
            noFriendsText: "لا يوجد أصدقاء بعد",
            goSocialText: "اذهب للمجتمع وأضف أصدقاء",
            friendBadgeText: "صديق",
            friendRoleDeaf: "مستخدم أصم",
            friendRoleNorm: "مستخدم عادي",
            moreText: "وأكثر...",
            viewAllLink: "عرض الكل في المجتمع",

            scSocial: "الموجز الاجتماعي",
            scSocialDesc: "شارك وتفاعل مع مجتمعك",
            scTranslator: "الترجمة الفورية",
            scTranslatorDesc: "ترجمة لغة الإشارة",
            scLearning: "التعلّم",
            scLearningDesc: "دروس لغة الإشارة",
            scMap: "خريطة الأماكن",
            scMapDesc: "أماكن صديقة للصم",
            scTasks: "المهام اليومية",
            scTasksDesc: "نظّم أهدافك",
            scLogout: "تسجيل الخروج",
            scLogoutDesc: "مغادرة الحساب",

            footerPlatformName: "Unmute Platform",
            footerAddress: "العنوان: طولكرم، جامعة خضوري التقنية",
            footerContactText: "اتصل بنا: 0594489871",
            footerEmailBtn: "مراسلة الإدارة",
            copyrightText: "© 2025 Unmute Platform. جميع الحقوق محفوظة.",

            helpMessage: "يمكنك التحكم في حجم الخط وألوان الصفحة من هذه القائمة لتجربة أوضح وأسهل.",

            modalTitle: "تواصل مع إدارة Unmute",
            modalSubtitle: "سيتم إرسال رسالتك إلى: info@unmute.com",
            modalName: "اسمك الكامل",
            modalEmail: "بريدك الإلكتروني",
            modalMsg: "اكتب رسالتك هنا...",
            modalBtn: "إرسال إلى الإدارة"
        },

        en: {
            languageBtnText: "English",
            dashboardNav: "Home",
            contactNav: "Contact Us",
            profileMenu: "My Profile",
            logoutMenu: "Logout",

            heroRoleLabel: window.profileData?.role === "deaf" ? "Deaf User" : "Regular User",
            joinedText: "Joined on",
            statPosts: "Posts",
            statDone: "Completed tasks",
            statFriends: "Friends",

            tabInfo: "Profile",
            tabSecurity: "Security",
            tabActivity: "Achievements",
            tabFriends: "Friends",
            tabShortcuts: "Quick Access",

            infoCardTitle: "Edit Personal Information",
            infoCardDesc: "You can change your name or email address",
            lblName: "Full Name",
            lblEmail: "Email Address",
            lblRole: "Account Type",
            roleDisplay: window.profileData?.role === "deaf" ? "Deaf User" : "Regular User",
            readonlyBadge: "Cannot be changed",
            btnSaveInfo: "Save Changes",
            namePlaceholder: "Your full name",
            emailPlaceholder: "Your email address",

            secCardTitle: "Change Password",
            secCardDesc: "Use a strong password to protect your account",
            lblCurPw: "Current Password",
            lblNewPw: "New Password",
            lblConfPw: "Confirm Password",
            hint1: "At least 8 characters",
            hint2: "Uppercase letter (A-Z)",
            hint3: "Lowercase letter (a-z)",
            hint4: "Number (0-9)",
            btnSavePw: "Change Password",
            strengthWeak: "Weak",
            strengthMedium: "Medium",
            strengthStrong: "Strong",

            secLearnTitle: "My Learning Progress",
            learnNumbers: "Numbers",
            learnLetters: "Letters",
            learnWords: "Words",
            secTasksTitle: "Task Achievements",
            ringDoneLabel: "Done",
            tstatDone: "Completed tasks",
            tstatPending: "Remaining tasks",
            tstatTotal: "Total tasks",
            tasksLink: "Manage Tasks",
            secSocialTitle: "Social Activity",
            postsDesc: "Posts you published in the community",
            postsLink: "View Posts",

            friendsDesc: "Your friends on Unmute platform",
            noFriendsText: "No friends yet",
            goSocialText: "Go to community and add friends",
            friendBadgeText: "Friend",
            friendRoleDeaf: "Deaf User",
            friendRoleNorm: "Regular User",
            moreText: "And more...",
            viewAllLink: "View all in community",

            scSocial: "Social Feed",
            scSocialDesc: "Share and interact with your community",
            scTranslator: "Live Translation",
            scTranslatorDesc: "Sign language translation",
            scLearning: "Learning",
            scLearningDesc: "Sign language lessons",
            scMap: "Places Map",
            scMapDesc: "Deaf-friendly places",
            scTasks: "Daily Tasks",
            scTasksDesc: "Organize your goals",
            scLogout: "Logout",
            scLogoutDesc: "Leave your account",

            footerPlatformName: "Unmute Platform",
            footerAddress: "Address: Tulkarm, Kadoorie Technical University",
            footerContactText: "Contact Us: 0594489871",
            footerEmailBtn: "Contact Administration",
            copyrightText: "© 2025 Unmute Platform. All rights reserved.",

            helpMessage: "You can control the font size and page colors from this menu for a clearer experience.",

            modalTitle: "Contact Unmute Admin",
            modalSubtitle: "Your message will be sent to: info@unmute.com",
            modalName: "Full Name",
            modalEmail: "Email Address",
            modalMsg: "Write your message here...",
            modalBtn: "Send to Admin"
        }
    };

    /*
        هذه الدالة ترجع لغة الصفحة الحالية
        بما أن المشروع كله معتمد على لغة السيرفر
    */
    function getCurrentLang() {
        return document.documentElement.lang === "en" ? "en" : "ar";
    }

    /*
        هذه فقط تنبيه بصري بسيط بدل alert
    */
    function showVisualNotice(message) {
        const toast = document.getElementById("visualToast");
        if (!toast) return;

        toast.textContent = message;
        toast.style.display = "block";

        setTimeout(() => {
            toast.style.display = "none";
        }, 3500);
    }

    /*
        دالة صغيرة حتى نغير النص إذا العنصر موجود
    */
    function setTextIfExists(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /*
        هنا نطبق ترجمة الصفحة الحالية فقط
        ونترك نظام الهيدر العام كما هو
    */
    function setLanguage(lang) {
        const t = translations[lang] || translations.ar;

        document.documentElement.lang = lang;
        document.documentElement.dir  = lang === "ar" ? "rtl" : "ltr";

        const directMap = [
            "heroRoleLabel", "joinedText", "statPosts", "statDone", "statFriends",
            "tabInfo", "tabSecurity", "tabActivity", "tabFriends", "tabShortcuts",
            "infoCardTitle", "infoCardDesc",
            "lblName", "lblEmail", "lblRole", "roleDisplay", "readonlyBadge", "btnSaveInfo",
            "secCardTitle", "secCardDesc", "lblCurPw", "lblNewPw", "lblConfPw", "btnSavePw",
            "secLearnTitle", "learnNumbers", "learnLetters", "learnWords",
            "secTasksTitle", "ringDoneLabel", "tstatDone", "tstatPending", "tstatTotal",
            "secSocialTitle", "postsDesc",
            "friendsDesc", "noFriendsText", "goSocialText", "moreText", "viewAllLink",
            "scSocial", "scSocialDesc", "scTranslator", "scTranslatorDesc",
            "scLearning", "scLearningDesc", "scMap", "scMapDesc",
            "scTasks", "scTasksDesc", "scLogout", "scLogoutDesc",
            "footerPlatformName", "copyrightText"
        ];

        directMap.forEach(id => {
            if (t[id] !== undefined) {
                setTextIfExists(id, t[id]);
            }
        });

        /*
            عنوان الأصدقاء فيه رقم
            لذلك نعيد صياغته بشكل منفصل
        */
        const friendsTitle = document.getElementById("friendsTitle");
        if (friendsTitle) {
            const count = friendsTitle.textContent.match(/\d+/)?.[0] || "0";
            friendsTitle.textContent = lang === "ar"
                ? `أصدقائي (${count})`
                : `My Friends (${count})`;
        }

        /*
            تلميحات كلمة المرور
        */
        [["hint1", t.hint1], ["hint2", t.hint2], ["hint3", t.hint3], ["hint4", t.hint4]].forEach(([id, txt]) => {
            const el = document.getElementById(id);
            if (el) {
                const sp = el.querySelector("span");
                if (sp) sp.textContent = txt;
            }
        });

        /*
            placeholders
        */
        const nameInp  = document.getElementById("nameInput");
        const emailInp = document.getElementById("emailInput");

        if (nameInp) nameInp.placeholder = t.namePlaceholder;
        if (emailInp) emailInp.placeholder = t.emailPlaceholder;

        /*
            أدوار الأصدقاء
        */
        document.querySelectorAll(".friend-role-label").forEach(el => {
            const role = el.dataset.role || "normal";
            el.textContent = role === "deaf" ? t.friendRoleDeaf : t.friendRoleNorm;
        });

        document.querySelectorAll(".friendBadgeText").forEach(el => {
            el.textContent = t.friendBadgeText;
        });

        /*
            روابط بسيطة فيها آيقون
        */
        const tasksLink = document.getElementById("tasksLink");
        if (tasksLink) {
            tasksLink.innerHTML = `${t.tasksLink} <i class="fas fa-arrow-${lang === "ar" ? "left" : "right"}"></i>`;
        }

        const postsLink = document.getElementById("postsLink");
        if (postsLink) {
            postsLink.innerHTML = `${t.postsLink} <i class="fas fa-arrow-${lang === "ar" ? "left" : "right"}"></i>`;
        }
    }

    /*
        هذه تسكر القوائم المفتوحة في الهيدر
    */
    function closeAllMenus() {
        ["userMenu","languageMenu","accessibilityMenu"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove("show");
        });
    }

    /*
        نأخذ العناصر الأساسية من الهيدر
    */
    const languageBtn       = document.getElementById("languageBtn");
    const languageMenu      = document.getElementById("languageMenu");
    const accessibilityBtn  = document.getElementById("accessibilityBtn");
    const accessibilityMenu = document.getElementById("accessibilityMenu");
    const userMenuBtn       = document.getElementById("userMenuBtn");
    const userMenu          = document.getElementById("userMenu");
    const increaseFontBtn   = document.getElementById("increaseFontBtn");
    const decreaseFontBtn   = document.getElementById("decreaseFontBtn");
    const bgColorInput      = document.getElementById("bgColorInput");
    const textColorInput    = document.getElementById("textColorInput");
    const resetBtn          = document.getElementById("resetAccessibilityBtn");
    const helpBtn           = document.getElementById("helpBtn");

    /*
        قائمة المستخدم
    */
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener("click", e => {
            e.stopPropagation();
            const open = userMenu.classList.contains("show");
            closeAllMenus();
            if (!open) userMenu.classList.add("show");
        });
    }

    /*
        قائمة اللغة
        هنا فقط نفتح القائمة
        ولا نكسر منطق المشروع العام
    */
    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", e => {
            e.stopPropagation();
            const open = languageMenu.classList.contains("show");
            closeAllMenus();
            if (!open) languageMenu.classList.add("show");
        });

        languageMenu.addEventListener("click", e => {
            e.stopPropagation();
        });
    }

    /*
        قائمة الوصول
    */
    if (accessibilityBtn && accessibilityMenu) {
        accessibilityBtn.addEventListener("click", e => {
            e.stopPropagation();
            const open = accessibilityMenu.classList.contains("show");
            closeAllMenus();
            if (!open) accessibilityMenu.classList.add("show");
        });

        accessibilityMenu.addEventListener("click", e => e.stopPropagation());
    }

    /*
        تكبير الخط
    */
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", () => {
            const cur = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (cur < 24) {
                document.documentElement.style.fontSize = `${cur + 2}px`;
            }
        });
    }

    /*
        تصغير الخط
    */
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", () => {
            const cur = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (cur > 12) {
                document.documentElement.style.fontSize = `${cur - 2}px`;
            }
        });
    }

    /*
        تغيير لون الخلفية
    */
    if (bgColorInput) {
        bgColorInput.addEventListener("input", e => {
            document.documentElement.style.setProperty("--page-bg", e.target.value);
            document.documentElement.style.setProperty("--section-bg", e.target.value);
            document.documentElement.style.setProperty("--card-bg", "#ffffff");
        });
    }

    /*
        تغيير لون النص
    */
    if (textColorInput) {
        textColorInput.addEventListener("input", e => {
            document.documentElement.style.setProperty("--page-text", e.target.value);
        });
    }

    /*
        إعادة الإعدادات الأساسية
    */
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.documentElement.style.fontSize = "16px";
            document.documentElement.style.setProperty("--page-bg", "#edf4ff");
            document.documentElement.style.setProperty("--section-bg", "#f7faff");
            document.documentElement.style.setProperty("--page-text", "#1f2d3d");
            document.documentElement.style.setProperty("--card-bg", "#ffffff");

            if (bgColorInput) bgColorInput.value = "#edf4ff";
            if (textColorInput) textColorInput.value = "#1f2d3d";
        });
    }

    /*
        زر المساعدة
    */
    if (helpBtn) {
        helpBtn.addEventListener("click", () => {
            showVisualNotice(translations[getCurrentLang()].helpMessage);
        });
    }

    /*
        إغلاق القوائم إذا ضغط المستخدم خارجها
    */
    document.addEventListener("click", e => {
        const inTrigger =
            (languageBtn && languageBtn.contains(e.target)) ||
            (accessibilityBtn && accessibilityBtn.contains(e.target)) ||
            (userMenuBtn && userMenuBtn.contains(e.target));

        const inMenu =
            (languageMenu && languageMenu.contains(e.target)) ||
            (accessibilityMenu && accessibilityMenu.contains(e.target)) ||
            (userMenu && userMenu.contains(e.target));

        if (!inTrigger && !inMenu) {
            closeAllMenus();
        }
    });

    /*
        التبويبات
    */
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

            btn.classList.add("active");

            const panel = document.getElementById("panel-" + btn.dataset.tab);
            if (panel) panel.classList.add("active");
        });
    });

    /*
        فحص قوة كلمة المرور
    */
    window.checkStrength = function(val) {
        const fill  = document.getElementById("strengthFill");
        const label = document.getElementById("strengthLabel");
        const t     = translations[getCurrentLang()];

        const ok8     = val.length >= 8;
        const okUpper = /[A-Z]/.test(val);
        const okLower = /[a-z]/.test(val);
        const okNum   = /[0-9]/.test(val);

        ["hint1","hint2","hint3","hint4"].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.toggle("ok", [ok8, okUpper, okLower, okNum][i]);
            }
        });

        if (!fill || !label) return;

        if (!val) {
            fill.style.width = "0";
            label.textContent = "";
            return;
        }

        const score = [ok8, okUpper, okLower, okNum, val.length >= 12, /[^A-Za-z0-9]/.test(val)].filter(Boolean).length;

        if (score <= 2) {
            fill.style.width = "30%";
            fill.style.background = "#e74c3c";
            label.style.color = "#e74c3c";
            label.textContent = t.strengthWeak;
        } else if (score <= 4) {
            fill.style.width = "60%";
            fill.style.background = "#f39c12";
            label.style.color = "#f39c12";
            label.textContent = t.strengthMedium;
        } else {
            fill.style.width = "100%";
            fill.style.background = "#27ae60";
            label.style.color = "#27ae60";
            label.textContent = t.strengthStrong;
        }
    };

    /*
        إظهار / إخفاء كلمة المرور
    */
    document.querySelectorAll(".eye-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const inp = document.getElementById(btn.dataset.target);
            if (!inp) return;

            inp.type = inp.type === "password" ? "text" : "password";
            btn.querySelector("i").className = inp.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
        });
    });

    /*
        هنا نحسب تقدم التعلم من localStorage
    */
    try {
        const completed = JSON.parse(localStorage.getItem("learning_completed") || "{}");

        function calcPercent(category) {
            const done = Object.keys(completed).filter(k => k.includes(`-${category}-`) && completed[k]).length;
            const total = { numbers: 10, letters: 28, words: 10 }[category] || 1;
            return Math.min(100, Math.round((done / total) * 100));
        }

        [
            ["lpNumbers","lpNumbersPct","numbers"],
            ["lpLetters","lpLettersPct","letters"],
            ["lpWords","lpWordsPct","words"]
        ].forEach(([fillId, pctId, cat]) => {
            const pct  = calcPercent(cat);
            const fill = document.getElementById(fillId);
            const lbl  = document.getElementById(pctId);

            if (fill) {
                setTimeout(() => { fill.style.width = pct + "%"; }, 300);
            }

            if (lbl) {
                lbl.textContent = pct + "%";
            }
        });
    } catch (e) {
        console.error(e);
    }

    /*
        نطبق لغة الصفحة الحالية
    */
    setLanguage(getCurrentLang());

    /*
        نخفي التوست بعد قليل
    */
    const profToast = document.getElementById("profToast");
    if (profToast) {
        setTimeout(() => {
            profToast.style.transition = "opacity 0.5s";
            profToast.style.opacity = "0";
            setTimeout(() => profToast.remove(), 500);
        }, 4000);
    }
});