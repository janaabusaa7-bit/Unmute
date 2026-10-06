document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const body = document.body;

    /* عناصر اللغة */
    const languageBtn = document.getElementById("languageBtn");
    const languageMenu = document.getElementById("languageMenu");
    const currentLanguageText = document.getElementById("currentLanguageText");
    const langAr = document.getElementById("langAr");
    const langEn = document.getElementById("langEn");

    /* عناصر الوصول */
    const accessibilityBtn = document.getElementById("accessibilityBtn");
    const accessibilityMenu = document.getElementById("accessibilityMenu");
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const bgColorInput = document.getElementById("bgColorInput");
    const textColorInput = document.getElementById("textColorInput");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");
    const helpBtn = document.getElementById("helpBtn");

    /* عناصر الصفحة */
    const txtTitle = document.getElementById("txtTitle");
    const txtDesc = document.getElementById("txtDesc");
    const txtNoteSpan = document.getElementById("txtNoteSpan");
    const emailInput = document.getElementById("emailInput");
    const forgetBtn = document.getElementById("forgetBtn");
    const txtBack = document.getElementById("txtBack");

    /* عناصر الهيدر */
    const homeLink = document.getElementById("homeLink");
    const aboutLink = document.getElementById("aboutLink");
    const contactLink = document.getElementById("contactLink");
    const loginHeaderBtn = document.getElementById("loginHeaderBtn");

    /* عناصر الفوتر */
    const footerPlatformName = document.getElementById("footerPlatformName");
    const footerAddress = document.getElementById("footerAddress");
    const footerContactText = document.getElementById("footerContactText");
    const footerEmailBtn = document.getElementById("footerEmailBtn");
    const copyrightText = document.getElementById("copyrightText");

    /*
        النصوص الخاصة بكل لغة
        حتى نبدل الصفحة كلها بسهولة
    */
    const translations = {
        ar: {
            dir: "rtl",
            title: "نسيت كلمة المرور | Unmute",
            currentLang: "العربية",
            pageTitleText: "نسيت كلمة المرور",
            pageDesc: "أدخل بريدك الإلكتروني المرتبط بحسابك وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور.",
            pageNote: "رابط إعادة التعيين صالح لمدة ساعة واحدة فقط.",
            emailPlaceholder: "أدخل البريد الإلكتروني",
            sendBtn: "إرسال رابط إعادة التعيين",
            backText: "العودة إلى تسجيل الدخول",
            homeLink: "الرئيسية",
            aboutLink: "حول المنصة",
            contactLink: "اتصل بنا",
            loginHeaderBtn: "إنشاء حساب",
            accessibilityTitle: "إعدادات الوصول",
            colorsTitle: "تغيير الألوان",
            increaseFontBtn: "تكبير الخط (+)",
            decreaseFontBtn: "تصغير الخط (-)",
            bgColorLabel: "لون الخلفية",
            textColorLabel: "لون النص",
            resetAccessibilityBtn: "إعادة تعيين",
            helpBtn: "مساعدة",
            helpMessage: "يمكنك تكبير أو تصغير الخط وتغيير ألوان الصفحة لتناسب احتياجك.",
            footerPlatformName: "منصة Unmute",
            footerAddress: "العنوان: جامعة فلسطين التقنية خضوري - طولكرم",
            footerContactText: "اتصل بنا: 0594489871",
            footerEmailBtn: "مراسلة الإدارة",
            copyrightText: "© 2025 Unmute Platform. جميع الحقوق محفوظة."
        },
        en: {
            dir: "ltr",
            title: "Forgot Password | Unmute",
            currentLang: "English",
            pageTitleText: "Forgot Password",
            pageDesc: "Enter the email address linked to your account and we will send you a secure reset link.",
            pageNote: "The reset link is valid for one hour only.",
            emailPlaceholder: "Enter your email address",
            sendBtn: "Send Reset Link",
            backText: "Back to Login",
            homeLink: "Home",
            aboutLink: "About",
            contactLink: "Contact",
            loginHeaderBtn: "Create Account",
            accessibilityTitle: "Accessibility Settings",
            colorsTitle: "Colors",
            increaseFontBtn: "Increase Font (+)",
            decreaseFontBtn: "Decrease Font (-)",
            bgColorLabel: "Background Color",
            textColorLabel: "Text Color",
            resetAccessibilityBtn: "Reset",
            helpBtn: "Help",
            helpMessage: "You can change font size and page colors for better readability.",
            footerPlatformName: "Unmute Platform",
            footerAddress: "Address: Palestine Technical University - Kadoorie, Tulkarm",
            footerContactText: "Contact us: 0594489871",
            footerEmailBtn: "Contact Admin",
            copyrightText: "© 2025 Unmute Platform. All rights reserved."
        }
    };

    function getCurrentLang() {
        return localStorage.getItem("unmute_lang") || "ar";
    }

    /*
        هذه الدالة تطبق اللغة المختارة
        على الهيدر والفورم والفوتر
    */
    function applyLanguage(lang) {
        const t = translations[lang];
        localStorage.setItem("unmute_lang", lang);

        html.lang = lang;
        html.dir = t.dir;
        document.title = t.title;

        if (currentLanguageText) currentLanguageText.textContent = t.currentLang;

        if (txtTitle) txtTitle.textContent = t.pageTitleText;
        if (txtDesc) txtDesc.textContent = t.pageDesc;
        if (txtNoteSpan) txtNoteSpan.textContent = t.pageNote;
        if (emailInput) emailInput.placeholder = t.emailPlaceholder;
        if (forgetBtn) forgetBtn.textContent = t.sendBtn;
        if (txtBack) txtBack.textContent = t.backText;

        if (homeLink) homeLink.textContent = t.homeLink;
        if (aboutLink) aboutLink.textContent = t.aboutLink;
        if (contactLink) contactLink.textContent = t.contactLink;
        if (loginHeaderBtn) loginHeaderBtn.textContent = t.loginHeaderBtn;

        if (footerPlatformName) footerPlatformName.textContent = t.footerPlatformName;
        if (footerAddress) footerAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${t.footerAddress}`;
        if (footerContactText) footerContactText.innerHTML = `<i class="fas fa-phone"></i> ${t.footerContactText}`;
        if (footerEmailBtn) footerEmailBtn.innerHTML = `<i class="fas fa-envelope"></i> ${t.footerEmailBtn}`;
        if (copyrightText) copyrightText.textContent = t.copyrightText;

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
    }

    /*
        هنا نقرأ الإعدادات المحفوظة سابقًا
        مثل حجم الخط ولون الخلفية والنص
    */
    function applyAccessibilitySettings() {
        const savedFontSize = localStorage.getItem("unmute_font_size");
        const savedBgColor = localStorage.getItem("unmute_bg_color");
        const savedTextColor = localStorage.getItem("unmute_text_color");

        if (savedFontSize) {
            html.style.fontSize = `${savedFontSize}px`;
        }

        if (savedBgColor) {
            document.documentElement.style.setProperty("--page-bg", savedBgColor);
            if (bgColorInput) bgColorInput.value = savedBgColor;
        }

        if (savedTextColor) {
            document.documentElement.style.setProperty("--page-text", savedTextColor);
            if (textColorInput) textColorInput.value = savedTextColor;
        }
    }

    /*
        زر قائمة اللغة
    */
    if (languageBtn) {
        languageBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (languageMenu) languageMenu.classList.toggle("show");
            if (accessibilityMenu) accessibilityMenu.classList.remove("show");
        });
    }

    if (langAr) {
        langAr.addEventListener("click", () => {
            applyLanguage("ar");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    if (langEn) {
        langEn.addEventListener("click", () => {
            applyLanguage("en");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    /*
        زر قائمة الوصول
    */
    if (accessibilityBtn) {
        accessibilityBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (accessibilityMenu) accessibilityMenu.classList.toggle("show");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    /*
        تكبير الخط
    */
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(html).fontSize);
            const newSize = Math.min(currentSize + 1, 22);
            html.style.fontSize = `${newSize}px`;
            localStorage.setItem("unmute_font_size", newSize);
        });
    }

    /*
        تصغير الخط
    */
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(html).fontSize);
            const newSize = Math.max(currentSize - 1, 14);
            html.style.fontSize = `${newSize}px`;
            localStorage.setItem("unmute_font_size", newSize);
        });
    }

    /*
        تغيير لون الخلفية
    */
    if (bgColorInput) {
        bgColorInput.addEventListener("input", () => {
            document.documentElement.style.setProperty("--page-bg", bgColorInput.value);
            localStorage.setItem("unmute_bg_color", bgColorInput.value);
        });
    }

    /*
        تغيير لون النص
    */
    if (textColorInput) {
        textColorInput.addEventListener("input", () => {
            document.documentElement.style.setProperty("--page-text", textColorInput.value);
            localStorage.setItem("unmute_text_color", textColorInput.value);
        });
    }

    /*
        إعادة الإعدادات الافتراضية
    */
    if (resetAccessibilityBtn) {
        resetAccessibilityBtn.addEventListener("click", () => {
            html.style.fontSize = "16px";
            document.documentElement.style.setProperty("--page-bg", "#edf4ff");
            document.documentElement.style.setProperty("--page-text", "#1f2d3d");

            localStorage.setItem("unmute_font_size", "16");
            localStorage.setItem("unmute_bg_color", "#edf4ff");
            localStorage.setItem("unmute_text_color", "#1f2d3d");

            if (bgColorInput) bgColorInput.value = "#edf4ff";
            if (textColorInput) textColorInput.value = "#1f2d3d";
        });
    }

    /*
        زر المساعدة
    */
    if (helpBtn) {
        helpBtn.addEventListener("click", () => {
            alert(translations[getCurrentLang()].helpMessage);
        });
    }

    /*
        إذا المستخدم ضغط خارج القوائم، نسكرها
    */
    document.addEventListener("click", (event) => {
        if (languageMenu && !languageMenu.contains(event.target) && languageBtn && !languageBtn.contains(event.target)) {
            languageMenu.classList.remove("show");
        }

        if (accessibilityMenu && !accessibilityMenu.contains(event.target) && accessibilityBtn && !accessibilityBtn.contains(event.target)) {
            accessibilityMenu.classList.remove("show");
        }
    });

    /*
        أول ما الصفحة تفتح:
        - نرجع إعدادات الوصول
        - ونطبق اللغة المخزنة
    */
    applyAccessibilitySettings();
    applyLanguage(getCurrentLang());
});