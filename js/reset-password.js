document.addEventListener("DOMContentLoaded", () => {
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
    const helpBtn = document.getElementById("helpBtn");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");

    /* عناصر الصفحة */
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordHint = document.getElementById("passwordHint");

    const txtTitle = document.getElementById("txtTitle");
    const txtDesc = document.getElementById("txtDesc");
    const txtBtn = document.getElementById("txtBtn");
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
        هنا النصوص لكل لغة
        حتى نستخدمها بسهولة داخل الصفحة
    */
    const translations = {
        ar: {
            languageBtnText: "العربية",
            home: "الرئيسية",
            about: "حول المنصة",
            contact: "اتصل بنا",
            loginHeader: "تسجيل الدخول",
            txtTitle: "إعادة تعيين كلمة المرور",
            txtDesc: "أنشئ كلمة مرور جديدة لحسابك.",
            newPassword: "كلمة المرور الجديدة",
            confirmPassword: "تأكيد كلمة المرور",
            txtBtn: "تحديث كلمة المرور",
            txtBack: "العودة إلى نسيت كلمة المرور",
            footerPlatformName: "Unmute Platform",
            footerAddress: "العنوان: طولكرم، جامعة خضوري التقنية",
            footerContactText: "اتصل بنا: 0594489871",
            footerEmailBtn: "مراسلة الإدارة",
            copyrightText: "© 2025 Unmute Platform. جميع الحقوق محفوظة.",
            helpMessage: "يمكنك التحكم في حجم الخط وألوان الصفحة من هذه القائمة لتجربة أوضح وأسهل.",
            accessibilityTitle: "إعدادات الوصول",
            colorsTitle: "تغيير الألوان",
            increaseFontBtn: "تكبير الخط (+)",
            decreaseFontBtn: "تصغير الخط (-)",
            bgColorLabel: "لون الخلفية",
            textColorLabel: "لون النص",
            resetAccessibilityBtn: "إعادة تعيين",
            helpBtn: "مساعدة",
            hintDefault: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم.",
            hintWeak: "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل مع حرف كبير وصغير ورقم.",
            hintMedium: "كلمة المرور متوسطة، والأفضل إضافة حرف كبير وصغير وجعلها أطول.",
            hintStrong: "كلمة المرور قوية."
        },
        en: {
            languageBtnText: "English",
            home: "Home",
            about: "About",
            contact: "Contact",
            loginHeader: "Login",
            txtTitle: "Reset Password",
            txtDesc: "Create a new password for your account.",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            txtBtn: "Update Password",
            txtBack: "Back to Forgot Password",
            footerPlatformName: "Unmute Platform",
            footerAddress: "Address: Tulkarm, Kadoorie Technical University",
            footerContactText: "Contact Us: 0594489871",
            footerEmailBtn: "Contact Administration",
            copyrightText: "© 2025 Unmute Platform. All rights reserved.",
            helpMessage: "You can control the font size and page colors from this menu for a clearer and easier experience.",
            accessibilityTitle: "Accessibility Settings",
            colorsTitle: "Colors",
            increaseFontBtn: "Increase Font (+)",
            decreaseFontBtn: "Decrease Font (-)",
            bgColorLabel: "Background Color",
            textColorLabel: "Text Color",
            resetAccessibilityBtn: "Reset",
            helpBtn: "Help",
            hintDefault: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.",
            hintWeak: "Password is weak. Use at least 8 characters with uppercase, lowercase, and a number.",
            hintMedium: "Password is medium. Add uppercase, lowercase, and make it longer.",
            hintStrong: "Password is strong."
        }
    };

    function getCurrentLang() {
        return localStorage.getItem("unmute_lang") || "ar";
    }

    function getDefaultPasswordHint(lang) {
        if (!passwordHint) return "";
        return lang === "en" ? passwordHint.dataset.defaultEn : passwordHint.dataset.defaultAr;
    }

    function resetPasswordHint(lang) {
        if (!passwordHint) return;
        passwordHint.textContent = getDefaultPasswordHint(lang);
        passwordHint.className = "password-hint";
    }

    /*
        هذا الفحص فقط لإعطاء المستخدم إحساس بقوة كلمة المرور
    */
    function checkPasswordStrength(password) {
        if (!passwordHint) return;

        const lang = getCurrentLang();
        const t = translations[lang];

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!password) {
            resetPasswordHint(lang);
            return;
        }

        if (isLongEnough && hasUpper && hasLower && hasNumber) {
            passwordHint.textContent = t.hintStrong;
            passwordHint.className = "password-hint strong";
            return;
        }

        if (password.length >= 6 && (hasUpper || hasLower) && hasNumber) {
            passwordHint.textContent = t.hintMedium;
            passwordHint.className = "password-hint medium";
            return;
        }

        passwordHint.textContent = t.hintWeak;
        passwordHint.className = "password-hint weak";
    }

    /*
        هذه الدالة تطبق اللغة على الصفحة كاملة
    */
    function setLanguage(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        localStorage.setItem("unmute_lang", lang);

        if (currentLanguageText) currentLanguageText.textContent = t.languageBtnText;

        if (homeLink) homeLink.textContent = t.home;
        if (aboutLink) aboutLink.textContent = t.about;
        if (contactLink) contactLink.textContent = t.contact;
        if (loginHeaderBtn) loginHeaderBtn.textContent = t.loginHeader;

        if (txtTitle) txtTitle.textContent = t.txtTitle;
        if (txtDesc) txtDesc.textContent = t.txtDesc;
        if (newPasswordInput) newPasswordInput.placeholder = t.newPassword;
        if (confirmPasswordInput) confirmPasswordInput.placeholder = t.confirmPassword;
        if (txtBtn) txtBtn.textContent = t.txtBtn;
        if (txtBack) txtBack.textContent = t.txtBack;

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

        if (newPasswordInput && newPasswordInput.value.trim()) {
            checkPasswordStrength(newPasswordInput.value.trim());
        } else {
            resetPasswordHint(lang);
        }
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", () => {
            checkPasswordStrength(newPasswordInput.value.trim());
        });
    }

    /*
        فتح وإغلاق قائمة اللغة
    */
    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            languageMenu.classList.toggle("show");
            if (accessibilityMenu) accessibilityMenu.classList.remove("show");
        });

        languageMenu.addEventListener("click", (event) => {
            if (event.target.tagName === "BUTTON") {
                const selectedLang = event.target.dataset.lang;
                setLanguage(selectedLang);
                languageMenu.classList.remove("show");
            }
        });
    }

    /*
        فتح وإغلاق قائمة الوصول
    */
    if (accessibilityBtn && accessibilityMenu) {
        accessibilityBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            accessibilityMenu.classList.toggle("show");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    /*
        تكبير الخط
    */
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const newSize = Math.min(currentSize + 2, 24);
            document.documentElement.style.fontSize = `${newSize}px`;
        });
    }

    /*
        تصغير الخط
    */
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const newSize = Math.max(currentSize - 2, 12);
            document.documentElement.style.fontSize = `${newSize}px`;
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
            const currentLang = getCurrentLang();
            alert(translations[currentLang].helpMessage);
        });
    }

    /*
        إغلاق القوائم عند الضغط خارجها
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
        أزرار العين لإظهار أو إخفاء كلمة المرور
    */
    const togglePasswordButtons = document.querySelectorAll(".toggle-password-btn");
    togglePasswordButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                button.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = "password";
                button.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    /*
        أول تحميل للصفحة
    */
    setLanguage(getCurrentLang());
});