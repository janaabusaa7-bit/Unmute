document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    const toggleAuthBtn = document.getElementById("toggleBtn");
    const sideTitle = document.getElementById("overlayTitle");
    const sideText = document.getElementById("overlayText");

    const regPassInput = document.getElementById("regPass");
    const passwordHint = document.getElementById("passwordStrength");

    /*
        هنا النصوص حسب اللغة
        حتى لما المستخدم يبدل عربي / إنجليزي
        تتغير العناوين تلقائي
    */
    const translations = {
        en: {
            dir: "ltr",
            loginTitle: "Login",
            registerTitle: "Create Account",
            loginUserPlaceholder: "Username / Email",
            passwordPlaceholder: "Password",
            confirmPasswordPlaceholder: "Confirm Password",
            forgot: "Forgot Password?",
            loginBtn: "Login",
            registerBtn: "Register",
            hello: "Hello, Welcome!",
            noAccount: "Don't have an account? Join us now.",
            welcome: "Welcome Back!",
            haveAccount: "Already have an account? Log in here.",
            registerEmailPlaceholder: "Email",
            roleNormal: "Normal User",
            roleDeaf: "Deaf / Mute"
        },
        ar: {
            dir: "rtl",
            loginTitle: "تسجيل الدخول",
            registerTitle: "إنشاء حساب",
            loginUserPlaceholder: "اسم المستخدم / البريد",
            passwordPlaceholder: "كلمة المرور",
            confirmPasswordPlaceholder: "تأكيد كلمة المرور",
            forgot: "نسيت كلمة المرور؟",
            loginBtn: "دخول",
            registerBtn: "تسجيل",
            hello: "أهلاً بك!",
            noAccount: "ليس لديك حساب؟ انضم إلينا الآن.",
            welcome: "مرحباً بعودتك!",
            haveAccount: "لديك حساب بالفعل؟ سجل دخولك.",
            registerEmailPlaceholder: "البريد الإلكتروني",
            roleNormal: "مستخدم عادي",
            roleDeaf: "صم وبكم"
        }
    };

    let isRegisterView = container ? container.classList.contains("active") : false;

    function getCurrentLang() {
        return document.documentElement.lang === "en" ? "en" : "ar";
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
        هذا الفحص بسيط لقوة كلمة المرور
        حتى نعطي المستخدم ملاحظة مباشرة وهو يكتب
    */
    function checkPasswordStrength(password) {
        if (!passwordHint) return false;

        const lang = getCurrentLang();
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!password) {
            resetPasswordHint(lang);
            return false;
        }

        if (isLongEnough && hasUpper && hasLower && hasNumber) {
            passwordHint.textContent = lang === "ar" ? "كلمة المرور قوية." : "Password is strong.";
            passwordHint.className = "password-hint strong";
            return true;
        }

        if (password.length >= 6 && (hasUpper || hasLower || hasNumber)) {
            passwordHint.textContent = lang === "ar"
                ? "كلمة المرور متوسطة، والأفضل تضيفي حرف كبير وصغير ورقم."
                : "Password is medium. Add uppercase, lowercase, and a number.";
            passwordHint.className = "password-hint medium";
            return false;
        }

        passwordHint.textContent = lang === "ar"
            ? "كلمة المرور ضعيفة. استخدمي 8 أحرف على الأقل مع حرف كبير وصغير ورقم."
            : "Password is weak. Use at least 8 characters with uppercase, lowercase, and a number.";
        passwordHint.className = "password-hint weak";
        return false;
    }

    /*
        هذه الدالة تغير النص الموجود في البوكس الأزرق
        حسب هل المستخدم في التسجيل أو في تسجيل الدخول
    */
    function updatePanelText() {
        const lang = getCurrentLang();
        const t = translations[lang];

        if (!sideTitle || !sideText || !toggleAuthBtn) return;

        if (isRegisterView) {
            sideTitle.textContent = t.welcome;
            sideText.textContent = t.haveAccount;
            toggleAuthBtn.textContent = t.loginBtn;
        } else {
            sideTitle.textContent = t.hello;
            sideText.textContent = t.noAccount;
            toggleAuthBtn.textContent = t.registerTitle;
        }
    }

    function applyTranslations(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = t.dir;

        const loginTitle = document.getElementById("loginTitle");
        const registerTitle = document.getElementById("registerTitle");
        const forgotLink = document.getElementById("forgotLink");
        const loginBtn = document.getElementById("loginBtn");
        const registerBtn = document.getElementById("registerSubmitBtn");
        const roleNormalText = document.getElementById("roleNormalText");
        const roleDeafText = document.getElementById("roleDeafText");

        if (loginTitle) loginTitle.textContent = t.loginTitle;
        if (registerTitle) registerTitle.textContent = t.registerTitle;
        if (forgotLink) forgotLink.textContent = t.forgot;
        if (loginBtn) loginBtn.textContent = t.loginBtn;
        if (registerBtn) registerBtn.textContent = t.registerBtn;
        if (roleNormalText) roleNormalText.textContent = t.roleNormal;
        if (roleDeafText) roleDeafText.textContent = t.roleDeaf;

        document.querySelectorAll("[data-placeholder]").forEach((input) => {
            const key = input.getAttribute("data-placeholder");
            if (t[key]) {
                input.placeholder = t[key];
            }
        });

        resetPasswordHint(lang);
        updatePanelText();
    }

    function toggleView() {
        isRegisterView = !isRegisterView;
        if (container) {
            container.classList.toggle("active", isRegisterView);
        }
        updatePanelText();
    }

    if (toggleAuthBtn) {
        toggleAuthBtn.addEventListener("click", toggleView);
    }

    /*
        هنا لما يكبس المستخدم على بطاقة النوع
        نحددها ونشيل التحديد عن الثانية
    */
    document.querySelectorAll(".role-card").forEach((card) => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".role-card").forEach((item) => item.classList.remove("selected"));
            card.classList.add("selected");

            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    if (regPassInput) {
        regPassInput.addEventListener("input", () => {
            checkPasswordStrength(regPassInput.value);
        });
    }

    /*
        هذا زر العين
        يبدل نوع الحقل بين password و text
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
        هذا الجزء خاص بقائمة اللغة وإمكانية الوصول
    */
    const accessibilityBtn = document.getElementById("accessibilityBtn");
    const accessibilityMenu = document.getElementById("accessibilityMenu");
    const languageBtn = document.getElementById("languageBtn");
    const languageMenu = document.getElementById("languageMenu");
    const langAr = document.getElementById("langAr");
    const langEn = document.getElementById("langEn");

    if (accessibilityBtn && accessibilityMenu) {
        accessibilityBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            accessibilityMenu.classList.toggle("show");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            languageMenu.classList.toggle("show");
            if (accessibilityMenu) accessibilityMenu.classList.remove("show");
        });
    }

    if (langAr) {
        langAr.addEventListener("click", function () {
            applyTranslations("ar");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    if (langEn) {
        langEn.addEventListener("click", function () {
            applyTranslations("en");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

    document.addEventListener("click", function (e) {
        if (accessibilityMenu && !e.target.closest(".accessibility-dropdown")) {
            accessibilityMenu.classList.remove("show");
        }
        if (languageMenu && !e.target.closest(".language-dropdown")) {
            languageMenu.classList.remove("show");
        }
    });

    /*
        أدوات الوصول:
        تكبير الخط وتصغيره وتغيير الألوان
    */
    let currentFontSize = 16;
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");
    const bgColorInput = document.getElementById("bgColorInput");
    const textColorInput = document.getElementById("textColorInput");

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", () => {
            currentFontSize += 1;
            if (currentFontSize > 22) currentFontSize = 22;
            document.documentElement.style.fontSize = currentFontSize + "px";
        });
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", () => {
            currentFontSize -= 1;
            if (currentFontSize < 13) currentFontSize = 13;
            document.documentElement.style.fontSize = currentFontSize + "px";
        });
    }

    if (resetAccessibilityBtn) {
        resetAccessibilityBtn.addEventListener("click", () => {
            currentFontSize = 16;
            document.documentElement.style.fontSize = "16px";
            document.body.style.background = "";
            document.body.style.color = "";

            if (bgColorInput) bgColorInput.value = "#edf4ff";
            if (textColorInput) textColorInput.value = "#1f2d3d";
        });
    }

    if (bgColorInput) {
        bgColorInput.addEventListener("input", (e) => {
            document.body.style.background = e.target.value;
        });
    }

    if (textColorInput) {
        textColorInput.addEventListener("input", (e) => {
            document.body.style.color = e.target.value;
        });
    }

    /*
        أول تحميل للصفحة
        نطبق اللغة الحالية ونثبت شكل الفورم
    */
    const currentLang = document.documentElement.lang === "en" ? "en" : "ar";
    applyTranslations(currentLang);

    if (container) {
        container.classList.toggle("active", isRegisterView);
    }
});