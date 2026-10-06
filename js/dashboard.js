document.addEventListener("DOMContentLoaded", () => {
    /*
        هنا العناصر الأساسية من الهيدر
        ما عدلنا الهيدر نفسه، فقط نتعامل مع الموجود إذا كان موجود
    */
    const languageBtn = document.getElementById("languageBtn");
    const languageMenu = document.getElementById("languageMenu");

    const accessibilityBtn = document.getElementById("accessibilityBtn");
    const accessibilityMenu = document.getElementById("accessibilityMenu");
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const bgColorInput = document.getElementById("bgColorInput");
    const textColorInput = document.getElementById("textColorInput");
    const helpBtn = document.getElementById("helpBtn");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");

    const userMenuBtn = document.getElementById("userMenuBtn");
    const userMenu = document.getElementById("userMenu");

    const welcomeToast = document.getElementById("welcomeToast");

    /*
        هذه النصوص الخاصة بالداشبورد
        هنا الترجمة صارت للصفحة نفسها فقط
    */
    const translations = {
        ar: {
            languageBtnText: "العربية",
            welcomeText: "مرحبًا بك مجددًا",

            cardSocialTitle: "الموجز الاجتماعي",
            cardSocialDesc: "شارك وتفاعل مع مجتمعك بسهولة.",

            cardTranslateTitle: "الترجمة الفورية",
            cardTranslateDesc: "تواصل مع الجميع في أي وقت.",

            cardSkillsTitle: "تنمية المهارات",
            cardSkillsDesc: "طوّر مهاراتك من خلال الدروس والأنشطة.",

            cardMapTitle: "خريطة الأماكن",
            cardMapDesc: "اكتشف الأماكن الصديقة للصم.",

            cardTasksTitle: "جدول المهام",
            cardTasksDesc: "نظم أهدافك التعليمية اليومية.",

            dashboardNav: "الرئيسية",
            contactNav: "اتصل بنا",
            profileMenu: "الملف الشخصي",
            logoutMenu: "تسجيل الخروج",

            footerPlatformName: "Unmute Platform",
            footerAddress: "العنوان: طولكرم، جامعة خضوري التقنية",
            footerContactText: "اتصل بنا: 0594489871",
            footerEmailBtn: "مراسلة الإدارة",
            copyrightText: "© 2025 Unmute Platform. جميع الحقوق محفوظة.",

            accessibilityTitle: "إعدادات الوصول",
            colorsTitle: "تغيير الألوان",
            increaseFontBtn: "تكبير الخط (+)",
            decreaseFontBtn: "تصغير الخط (-)",
            bgColorLabel: "لون الخلفية",
            textColorLabel: "لون النص",
            resetAccessibilityBtn: "إعادة تعيين",
            helpBtn: "مساعدة",

            helpMessage: "يمكنك التحكم في حجم الخط وألوان الصفحة من هذه القائمة لتجربة أوضح وأسهل.",
            arrow: "←"
        },
        en: {
            languageBtnText: "English",
            welcomeText: "Welcome back",

            cardSocialTitle: "Social Hub",
            cardSocialDesc: "Share and interact with your community easily.",

            cardTranslateTitle: "Live Translation",
            cardTranslateDesc: "Communicate with everyone anytime.",

            cardSkillsTitle: "Skills Building",
            cardSkillsDesc: "Develop your skills through lessons and activities.",

            cardMapTitle: "Places Map",
            cardMapDesc: "Discover deaf-friendly places.",

            cardTasksTitle: "Daily Tasks",
            cardTasksDesc: "Organize your daily learning goals.",

            dashboardNav: "Dashboard",
            contactNav: "Contact Us",
            profileMenu: "Profile",
            logoutMenu: "Logout",

            footerPlatformName: "Unmute Platform",
            footerAddress: "Address: Tulkarm, Kadoorie Technical University",
            footerContactText: "Contact Us: 0594489871",
            footerEmailBtn: "Contact Administration",
            copyrightText: "© 2025 Unmute Platform. All rights reserved.",

            accessibilityTitle: "Accessibility Settings",
            colorsTitle: "Colors",
            increaseFontBtn: "Increase Font (+)",
            decreaseFontBtn: "Decrease Font (-)",
            bgColorLabel: "Background Color",
            textColorLabel: "Text Color",
            resetAccessibilityBtn: "Reset",
            helpBtn: "Help",

            helpMessage: "You can control the font size and page colors from this menu for a clearer and easier experience.",
            arrow: "→"
        }
    };

    /*
        نأخذ اللغة الحالية من localStorage
        وإذا لم نجد لغة محفوظة نستخدم العربي
    */
    function getCurrentLang() {
        return localStorage.getItem("unmute_lang") || "ar";
    }

    /*
        دالة صغيرة لتغيير النص إذا العنصر موجود
    */
    function setTextIfExists(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /*
        هذه ملاحظة بصرية بسيطة بدل alert
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
        هنا نطبق الترجمة على الداشبورد نفسها
        ونغيّر أيضًا العناصر المشتركة الظاهرة في الهيدر لو كانت موجودة
    */
    function setLanguage(lang) {
        const t = translations[lang];
        if (!t) return;

        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

        setTextIfExists("welcomeText", t.welcomeText);

        setTextIfExists("cardSocialTitle", t.cardSocialTitle);
        setTextIfExists("cardSocialDesc", t.cardSocialDesc);

        setTextIfExists("cardTranslateTitle", t.cardTranslateTitle);
        setTextIfExists("cardTranslateDesc", t.cardTranslateDesc);

        setTextIfExists("cardSkillsTitle", t.cardSkillsTitle);
        setTextIfExists("cardSkillsDesc", t.cardSkillsDesc);

        setTextIfExists("cardMapTitle", t.cardMapTitle);
        setTextIfExists("cardMapDesc", t.cardMapDesc);

        setTextIfExists("cardTasksTitle", t.cardTasksTitle);
        setTextIfExists("cardTasksDesc", t.cardTasksDesc);

        setTextIfExists("dashboardNavLink", t.dashboardNav);
        setTextIfExists("contactNavLink", t.contactNav);
        setTextIfExists("profileMenuLink", t.profileMenu);
        setTextIfExists("logoutMenuLink", t.logoutMenu);

        setTextIfExists("currentLanguageText", t.languageBtnText);

        setTextIfExists("footerPlatformName", t.footerPlatformName);
        setTextIfExists("copyrightText", t.copyrightText);

        setTextIfExists("arrowSocial", t.arrow);
        setTextIfExists("arrowTranslate", t.arrow);
        setTextIfExists("arrowSkills", t.arrow);
        setTextIfExists("arrowMap", t.arrow);
        setTextIfExists("arrowTasks", t.arrow);

        const footerAddress = document.getElementById("footerAddress");
        const footerContactText = document.getElementById("footerContactText");
        const footerEmailBtnEl = document.getElementById("footerEmailBtn");

        if (footerAddress) {
            footerAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${t.footerAddress}`;
        }

        if (footerContactText) {
            footerContactText.innerHTML = `<i class="fas fa-phone"></i> ${t.footerContactText}`;
        }

        if (footerEmailBtnEl) {
            footerEmailBtnEl.innerHTML = `<i class="fas fa-envelope"></i> ${t.footerEmailBtn}`;
        }

        const groupTitles = document.querySelectorAll(".group-title");
        if (groupTitles[0]) groupTitles[0].textContent = t.accessibilityTitle;
        if (groupTitles[1]) groupTitles[1].textContent = t.colorsTitle;

        const bgColorLabel = document.querySelector('label[for="bgColorInput"]');
        const textColorLabel = document.querySelector('label[for="textColorInput"]');

        if (increaseFontBtn) increaseFontBtn.textContent = t.increaseFontBtn;
        if (decreaseFontBtn) decreaseFontBtn.textContent = t.decreaseFontBtn;
        if (bgColorLabel) bgColorLabel.textContent = t.bgColorLabel;
        if (textColorLabel) textColorLabel.textContent = t.textColorLabel;
        if (resetAccessibilityBtn) resetAccessibilityBtn.textContent = t.resetAccessibilityBtn;
        if (helpBtn) helpBtn.textContent = t.helpBtn;

        /*
            نحفظ اللغة حتى تظل ثابتة داخل المتصفح
        */
        localStorage.setItem("unmute_lang", lang);
    }

    /*
        نستنتج اللغة من الزر أو الرابط داخل قائمة اللغة
        حتى لو الهيدر موحد وما بدنا نعدله
    */
    function detectLangFromElement(element) {
        if (!element) return null;

        const dataLang = element.getAttribute("data-lang");
        if (dataLang === "ar" || dataLang === "en") {
            return dataLang;
        }

        const text = (element.textContent || "").trim().toLowerCase();
        if (text.includes("العربية") || text === "ar") return "ar";
        if (text.includes("english") || text === "en") return "en";

        const href = (element.getAttribute("href") || "").toLowerCase();
        if (href.includes("lang=ar")) return "ar";
        if (href.includes("lang=en")) return "en";

        const id = (element.id || "").toLowerCase();
        if (id.includes("langar")) return "ar";
        if (id.includes("langen")) return "en";

        return null;
    }

    /*
        هذه تسكر القوائم المفتوحة
    */
    function closeAllMenus() {
        if (languageMenu) languageMenu.classList.remove("show");
        if (accessibilityMenu) accessibilityMenu.classList.remove("show");
        if (userMenu) userMenu.classList.remove("show");
    }

    /*
        قائمة المستخدم
    */
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = userMenu.classList.contains("show");
            closeAllMenus();

            if (!isOpen) {
                userMenu.classList.add("show");
            }
        });
    }

    /*
        قائمة اللغة
        ما عدلنا الهيدر، فقط قرأنا الموجود وتعاملنا معه
    */
    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = languageMenu.classList.contains("show");
            closeAllMenus();

            if (!isOpen) {
                languageMenu.classList.add("show");
            }
        });

        languageMenu.addEventListener("click", (event) => {
            event.stopPropagation();

            const target = event.target.closest("button, a");
            if (!target) return;

            const selectedLang = detectLangFromElement(target);
            if (!selectedLang) return;

            /*
                هنا منعنا الانتقال الطبيعي
                حتى تبقى الترجمة داخل الصفحة نفسها
            */
            event.preventDefault();
            setLanguage(selectedLang);
            languageMenu.classList.remove("show");
        });
    }

    /*
        قائمة الوصول
    */
    if (accessibilityBtn && accessibilityMenu) {
        accessibilityBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = accessibilityMenu.classList.contains("show");
            closeAllMenus();

            if (!isOpen) {
                accessibilityMenu.classList.add("show");
            }
        });

        accessibilityMenu.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    /*
        تكبير الخط
    */
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (currentSize < 24) {
                document.documentElement.style.fontSize = `${currentSize + 2}px`;
            }
        });
    }

    /*
        تصغير الخط
    */
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (currentSize > 12) {
                document.documentElement.style.fontSize = `${currentSize - 2}px`;
            }
        });
    }

    /*
        تغيير لون الخلفية
    */
    if (bgColorInput) {
        bgColorInput.addEventListener("input", (e) => {
            document.documentElement.style.setProperty("--page-bg", e.target.value);
            document.documentElement.style.setProperty("--section-bg", e.target.value);
            document.documentElement.style.setProperty("--card-bg", "#ffffff");
        });
    }

    /*
        تغيير لون النص
    */
    if (textColorInput) {
        textColorInput.addEventListener("input", (e) => {
            document.documentElement.style.setProperty("--page-text", e.target.value);
        });
    }

    /*
        إعادة الإعدادات الأساسية
    */
    if (resetAccessibilityBtn) {
        resetAccessibilityBtn.addEventListener("click", () => {
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
        إذا ضغط المستخدم خارج القوائم نسكرها
    */
    document.addEventListener("click", (event) => {
        const clickedTrigger =
            (languageBtn && languageBtn.contains(event.target)) ||
            (accessibilityBtn && accessibilityBtn.contains(event.target)) ||
            (userMenuBtn && userMenuBtn.contains(event.target));

        const clickedInsideMenu =
            (languageMenu && languageMenu.contains(event.target)) ||
            (accessibilityMenu && accessibilityMenu.contains(event.target)) ||
            (userMenu && userMenu.contains(event.target));

        if (!clickedTrigger && !clickedInsideMenu) {
            closeAllMenus();
        }
    });

    /*
        أول ما الصفحة تفتح نطبق اللغة المحفوظة
    */
    setLanguage(getCurrentLang());

    /*
        تنبيه الترحيب
    */
    if (welcomeToast) {
        welcomeToast.classList.remove("hide");
        setTimeout(() => {
            welcomeToast.classList.add("hide");
        }, 2600);
    }
});