// ===============================
// 1) قاموس الإشارات
// ===============================
const signDict = {
    "ا": "https://i.ibb.co/JF8s8VKw/af94eefb-6c36-43e2-89ec-df6966a90c4f.jpg",
    "ب": "https://i.ibb.co/4gYPMHzK/d2d5c5d9-baa3-4d38-9379-af16d9548aae.jpg",
    "ت": "https://i.ibb.co/prMkBGc8/30857655-20f6-42a7-b2f1-f550f138e89e.jpg",
    "ث": "https://i.ibb.co/5hpmC8cH/77b9c72b-5054-443a-a99f-9c3ea10b3742.jpg",
    "ج": "https://i.ibb.co/zh9YbHdy/72359982-c3ea-4844-827c-714674cc7b9a.jpg",
    "ح": "https://i.ibb.co/Gv9F7nQv/b68cdfae-b00b-4aaa-acd7-61371e4f9e53.jpg",
    "خ": "https://i.ibb.co/FbvTcC42/cb023c41-6481-41b1-a9cc-0e68775381e7.jpg",
    "د": "https://i.ibb.co/YFsQPQJT/443dbaf9-17c7-475e-bf04-f0b5e8b8ead4.jpg",
    "ذ": "https://i.ibb.co/qfnYdBM/06e41fbc-b372-4682-ac90-f8230da67190.jpg",
    "ر": "https://i.ibb.co/4wcknd27/d7431705-afa0-4da2-bd35-8ecc056e042a.jpg",
    "ز": "https://i.ibb.co/4ZgbfwSW/1ed1e0ad-4109-4ca4-aadb-389c2f94ba33.jpg",
    "س": "https://i.ibb.co/4g1ycJXc/Whats-App-Image-2025-07-16-at-1-40-31-AM.jpg",
    "ش": "https://i.ibb.co/m5rq0J2J/4e0d3d83-08ec-4101-9efc-3a8e69afb112.jpg",
    "ص": "https://i.ibb.co/dsLKPGh8/5dce0f95-4866-44d6-91f4-d70dd59ed09c.jpg",
    "ض": "https://i.ibb.co/Qv25nnTk/a6ff29d0-f9f2-4bbb-bcfd-fff9dbe8fc5c.jpg",
    "ط": "https://i.ibb.co/pjqmwQxC/0d0de6bd-4227-43b2-92bd-d2a78496ff9f.jpg",
    "ظ": "https://i.ibb.co/Wpn8jVgD/46592172-c732-4935-b6f2-f4d94aa29208.jpg",
    "ع": "https://i.ibb.co/xxdpPFB/62c6fc46-bc9b-4cc4-b870-b8cc558d0780.jpg",
    "غ": "https://i.ibb.co/fdWMgckW/7d2cdc24-d19e-4e46-b334-e9e3dc5cc14e.jpg",
    "ف": "https://i.ibb.co/5hg6wpcf/10ba485f-00d6-49fa-99b4-d5b4781f42f4.jpg",
    "ق": "https://i.ibb.co/Z1H8Hw8W/e0e22acb-a6e1-4965-8201-9e2c7ab5a1b1.jpg",
    "ك": "https://i.ibb.co/Xx3WVyN7/ac307f68-fb57-4f66-8ad9-ff98545371d4.jpg",
    "ل": "https://i.ibb.co/JF54nKFx/3e9a4060-b176-4936-b8e1-e8a7448c369b.jpg",
    "م": "https://i.ibb.co/wFBnCKds/3e65c4d5-0590-48ab-8025-a147199b49ed.jpg",
    "ن": "https://i.ibb.co/GBN1vBT/ee150b45-35c5-4164-b9c3-6c2fe8d8c85a.jpg",
    "ه": "https://i.ibb.co/YF2npmMZ/4d00b614-57d4-4bf8-9bef-5cb8e509714b.jpg",
    "و": "https://i.ibb.co/gMDt095x/842c5de9-57f7-490c-9e14-2d2ae55ac19b.jpg",
    "ي": "https://i.ibb.co/TMYtRmMh/a0ae4585-b6bd-4f74-9dca-e25445b9b694.jpg",

    "a": "https://i.ibb.co/JF8s8VKw/af94eefb-6c36-43e2-89ec-df6966a90c4f.jpg",
    "b": "https://i.ibb.co/4gYPMHzK/d2d5c5d9-baa3-4d38-9379-af16d9548aae.jpg",
    "c": "https://i.ibb.co/prMkBGc8/30857655-20f6-42a7-b2f1-f550f138e89e.jpg",
    "d": "https://i.ibb.co/5hpmC8cH/77b9c72b-5054-443a-a99f-9c3ea10b3742.jpg",
    "e": "https://i.ibb.co/zh9YbHdy/72359982-c3ea-4844-827c-714674cc7b9a.jpg",
    "f": "https://i.ibb.co/Gv9F7nQv/b68cdfae-b00b-4aaa-acd7-61371e4f9e53.jpg",
    "g": "https://i.ibb.co/FbvTcC42/cb023c41-6481-41b1-a9cc-0e68775381e7.jpg",
    "h": "https://i.ibb.co/YFsQPQJT/443dbaf9-17c7-475e-bf04-f0b5e8b8ead4.jpg",
    "i": "https://i.ibb.co/qfnYdBM/06e41fbc-b372-4682-ac90-f8230da67190.jpg",
    "j": "https://i.ibb.co/4wcknd27/d7431705-afa0-4da2-bd35-8ecc056e042a.jpg",
    "k": "https://i.ibb.co/4ZgbfwSW/1ed1e0ad-4109-4ca4-aadb-389c2f94ba33.jpg",
    "l": "https://i.ibb.co/4g1ycJXc/Whats-App-Image-2025-07-16-at-1-40-31-AM.jpg",
    "m": "https://i.ibb.co/m5rq0J2J/4e0d3d83-08ec-4101-9efc-3a8e69afb112.jpg",
    "n": "https://i.ibb.co/dsLKPGh8/5dce0f95-4866-44d6-91f4-d70dd59ed09c.jpg",
    "o": "https://i.ibb.co/Qv25nnTk/a6ff29d0-f9f2-4bbb-bcfd-fff9dbe8fc5c.jpg",
    "p": "https://i.ibb.co/pjqmwQxC/0d0de6bd-4227-43b2-92bd-d2a78496ff9f.jpg",
    "q": "https://i.ibb.co/Wpn8jVgD/46592172-c732-4935-b6f2-f4d94aa29208.jpg",
    "r": "https://i.ibb.co/xxdpPFB/62c6fc46-bc9b-4cc4-b870-b8cc558d0780.jpg",
    "s": "https://i.ibb.co/fdWMgckW/7d2cdc24-d19e-4e46-b334-e9e3dc5cc14e.jpg",
    "t": "https://i.ibb.co/5hg6wpcf/10ba485f-00d6-49fa-99b4-d5b4781f42f4.jpg",
    "u": "https://i.ibb.co/Z1H8Hw8W/e0e22acb-a6e1-4965-8201-9e2c7ab5a1b1.jpg",
    "v": "https://i.ibb.co/Xx3WVyN7/ac307f68-fb57-4f66-8ad9-ff98545371d4.jpg",
    "w": "https://i.ibb.co/JF54nKFx/3e9a4060-b176-4936-b8e1-e8a7448c369b.jpg",
    "x": "https://i.ibb.co/wFBnCKds/3e65c4d5-0590-48ab-8025-a147199b49ed.jpg",
    "y": "https://i.ibb.co/GBN1vBT/ee150b45-35c5-4164-b9c3-6c2fe8d8c85a.jpg",
    "z": "https://i.ibb.co/YF2npmMZ/4d00b614-57d4-4bf8-9bef-5cb8e509714b.jpg"
};

const translatorText = {
    ar: {
        mainTitle: "مترجم لغة الإشارة",
        mainDesc: "اكتب حرفًا أو أكثر لتظهر الإشارات المقابلة حرفًا بحرف.",
        inputPlaceholder: "اكتب الحروف (عربي أو English)...",
        voice: "صوت",
        camera: "كاميرا",
        clear: "مسح",
        placeholder: "الإشارات ستظهر هنا حرفاً بحرف...",
        cameraError: "الكاميرا مرفوضة أو غير متاحة",
        speechError: "المتصفح لا يدعم التعرف على الصوت",
        helpText: "يمكنك تكبير الخط أو تغيير الألوان لتحسين القراءة.",
        analyzing: "جاري تحليل الصورة...",
        noHand: "لم يتم اكتشاف يد واضحة",
        resultPrefix: "نتيجة الكاميرا: "
    },
    en: {
        mainTitle: "Sign Language Translator",
        mainDesc: "Type one or more letters to display the matching signs letter by letter.",
        inputPlaceholder: "Type letters (Arabic or English)...",
        voice: "Voice",
        camera: "Camera",
        clear: "Clear",
        placeholder: "Signs will appear here letter by letter...",
        cameraError: "Camera access is denied or unavailable",
        speechError: "This browser does not support speech recognition",
        helpText: "You can increase the font size or change colors to improve readability.",
        analyzing: "Analyzing image...",
        noHand: "No clear hand detected",
        resultPrefix: "Camera result: "
    }
};

let stream = null;
let currentFontSize = 16;
let handsTracker = null;
let cameraTracker = null;

// متغيرات لتتبع الحركة وإضافتها لمربع النص
let currentDetectedSign = null;
let signDetectStartTime = 0;
let lastAddedSign = null;
let noSignStartTime = 0;

// دالة لجلب لغة الصفحة الحالية (عربية أو إنجليزية) بناءً على اتجاه الصفحة (RTL أو LTR)
function getCurrentLang() {
    return document.documentElement.dir === "rtl" ? "ar" : "en";
}

// دالة لتطبيق النصوص والترجمات على واجهة المستخدم (تغيير العناوين والأزرار حسب اللغة المحددة)
function applyTranslatorLanguage() {
    const lang = getCurrentLang();
    const t = translatorText[lang];

    const mainTitle = document.getElementById("mainTitle");
    const mainDesc = document.getElementById("mainDesc");
    const textInput = document.getElementById("textInput");
    const vLabel = document.getElementById("vLabel");
    const cLabel = document.getElementById("cLabel");
    const clearLabel = document.getElementById("clearLabel");
    const placeholder = document.getElementById("placeholder");
    const currentLanguageText = document.getElementById("currentLanguageText");

    if (mainTitle) mainTitle.innerText = t.mainTitle;
    if (mainDesc) mainDesc.innerText = t.mainDesc;
    if (textInput) textInput.placeholder = t.inputPlaceholder;
    if (vLabel) vLabel.innerText = t.voice;
    if (cLabel) cLabel.innerText = t.camera;
    if (clearLabel) clearLabel.innerText = t.clear;
    if (placeholder && textInput && !textInput.value.trim()) placeholder.innerText = t.placeholder;
    if (currentLanguageText) currentLanguageText.innerText = lang === "ar" ? "العربية" : "English";
}

// دالة الترجمة الرئيسية النصية: تقوم بقراءة النص المكتوب في حقل الإدخال وتحويله إلى صور إشارات (حرفاً بحرف)
function doTranslate() {
    const inputElement = document.getElementById("textInput");
    const board = document.getElementById("resultBoard");
    const lang = getCurrentLang();
    const t = translatorText[lang];

    const resultSection = document.querySelector(".result-section");

    if (!inputElement || !board) return;

    let input = inputElement.value.toLowerCase();
    board.innerHTML = "";

    if (!input.trim()) {
        if (resultSection) resultSection.style.display = "none"; // إخفاء القسم إذا كان النص فارغاً
        board.innerHTML = `<p id="placeholder">${t.placeholder}</p>`;
        return;
    }

    // إظهار القسم فقط إذا كان هناك نص والكاميرا مطفأة
    if (resultSection && !cameraTracker) {
        resultSection.style.display = "block";
    }

    input = input.replace(/[أإآ]/g, "ا").replace(/ى/g, "ي");

    for (const char of input) {
        if (char === " ") {
            const space = document.createElement("div");
            space.className = "space-card";
            space.style.width = "30px";
            board.appendChild(space);
        } else if (signDict[char]) {
            const card = document.createElement("div");
            card.className = "sign-card";
            card.innerHTML = `<img src="${signDict[char]}" alt="${char}" title="${char}">`;
            board.appendChild(card);
        }
    }

    if (!board.innerHTML.trim()) {
        board.innerHTML = `<p id="placeholder">${t.placeholder}</p>`;
    }
}

// دالة لتنظيف مربع النص ومربع النتائج (مسح الترجمة) للبدء من جديد
function clearTranslation() {
    const input = document.getElementById("textInput");
    const board = document.getElementById("resultBoard");
    const resultSection = document.querySelector(".result-section");
    const lang = getCurrentLang();

    if (input) input.value = "";
    if (board) board.innerHTML = `<p id="placeholder">${translatorText[lang].placeholder}</p>`;
    if (resultSection) resultSection.style.display = "none"; // إخفاء القسم عند المسح
}

// دالة محرك الذكاء الاصطناعي (Heuristic Engine): 
// تأخذ إحداثيات مفاصل اليد (Landmarks) وتحللها لمعرفة الأصابع المفتوحة والمغلقة
// وبناءً عليها تُرجع الحرف المطابق للحركة لترجمة فورية (مثال: قبضة = م، سبابة = ب)
function detectSign(landmarks) {
    const isFingerOpen = (tip, pip) => landmarks[tip].y < landmarks[pip].y;
    const dist = (p1, p2) => Math.hypot(landmarks[p1].x - landmarks[p2].x, landmarks[p1].y - landmarks[p2].y);
    
    const indexOpen = isFingerOpen(8, 6);
    const middleOpen = isFingerOpen(12, 10);
    const ringOpen = isFingerOpen(16, 14);
    const pinkyOpen = isFingerOpen(20, 18);
    const thumbOpen = Math.abs(landmarks[4].x - landmarks[17].x) > Math.abs(landmarks[3].x - landmarks[17].x);
    const thumbUp = landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[5].y;

    const openCount = [indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;
    const lang = getCurrentLang();

    const thumbIndexDist = dist(4, 8);
    const palmSize = dist(0, 9) || 0.1;
    const indexRel = dist(8, 5) / palmSize;
    const middleRel = dist(12, 9) / palmSize;
    const ringRel = dist(16, 13) / palmSize;
    const pinkyRel = dist(20, 17) / palmSize;
    const imSpread = dist(8, 12) / palmSize;

    // === مسافة (Space) ===
    if (thumbOpen && indexOpen && middleOpen && ringOpen && !pinkyOpen) return lang === 'ar' ? 'مسافة' : 'Space';

    // === الكلمات الفريدة (Unique Words) ===
    if (thumbOpen && indexOpen && !middleOpen && !ringOpen && pinkyOpen) return lang === 'ar' ? 'أحبك' : 'Love';
    if (!thumbOpen && indexOpen && !middleOpen && !ringOpen && pinkyOpen) return lang === 'ar' ? 'رائع' : 'Awesome';
    if (thumbOpen && !indexOpen && !middleOpen && !ringOpen && pinkyOpen) return lang === 'ar' ? 'اتصال' : 'Call';
    if (thumbIndexDist < 0.05 && middleOpen && ringOpen && pinkyOpen) return lang === 'ar' ? 'أوكي' : 'OK';
    if (indexOpen && middleOpen && !ringOpen && !pinkyOpen && thumbOpen) return lang === 'ar' ? 'سلام' : 'Peace';
    if (thumbUp && openCount === 0) return lang === 'ar' ? 'ممتاز' : 'Excellent';
    
    if (openCount === 4 && !thumbOpen && landmarks[8].y > landmarks[5].y) return lang === 'ar' ? 'شكرا' : 'Thanks';
    if (openCount === 4 && thumbOpen && landmarks[4].x < landmarks[17].x) return lang === 'ar' ? 'صباح الخير' : 'Good Morning';
    if (openCount === 4 && thumbOpen && dist(4, 8) < 0.1) return lang === 'ar' ? 'لو سمحت' : 'Please';
    if (indexOpen && middleOpen && ringOpen && !pinkyOpen && !thumbOpen) return lang === 'ar' ? 'البيت' : 'Home';
    if (thumbOpen && pinkyOpen && !indexOpen && !middleOpen && !ringOpen) return lang === 'ar' ? 'جامعة' : 'University';
    
    if (thumbOpen && openCount === 0 && landmarks[4].y < landmarks[2].y) return lang === 'ar' ? 'أبي' : 'Father';
    if (thumbOpen && openCount === 0 && landmarks[4].y > landmarks[2].y) return lang === 'ar' ? 'أمي' : 'Mother';
    if (indexOpen && openCount === 1 && thumbOpen && landmarks[8].y < landmarks[6].y) return lang === 'ar' ? 'أخ' : 'Brother';
    if (indexOpen && openCount === 1 && thumbOpen && landmarks[8].y > landmarks[6].y) return lang === 'ar' ? 'أخت' : 'Sister';
    if (openCount === 4 && thumbOpen && dist(4, 20) < 0.1) return lang === 'ar' ? 'قلق' : 'Anxious';

    // === الأرقام 6-9 ===
    const palmDist = dist(5, 17) || 0.1;
    if (dist(4, 20)/palmDist < 0.8 && indexOpen && middleOpen && ringOpen && !pinkyOpen) return "6";
    if (dist(4, 16)/palmDist < 0.8 && indexOpen && middleOpen && pinkyOpen && !ringOpen) return "7";
    if (dist(4, 12)/palmDist < 0.8 && indexOpen && ringOpen && pinkyOpen && !middleOpen) return "8";
    if (dist(4, 8)/palmDist < 0.8 && middleOpen && ringOpen && pinkyOpen && !indexOpen) return "9";

    // === الحروف (Letters) ===
    if (openCount === 4 && thumbOpen) return lang === 'ar' ? 'أ' : 'A';
    if (indexOpen && openCount === 1 && indexRel > 0.75) return lang === 'ar' ? 'ب' : 'B';
    if (indexRel > 0.7 && middleRel > 0.7 && ringRel < 0.5 && imSpread > 0.6) return lang === 'ar' ? 'ط' : 'T-H';

    if (indexOpen && middleOpen && openCount === 2) {
       if (imSpread < 0.5) return lang === 'ar' ? 'ت' : 'T';
       return (indexRel < middleRel * 0.8) ? (lang === 'ar' ? 'ز' : 'Z') : (lang === 'ar' ? 'ت' : 'T');
    }
    if (middleOpen && !indexOpen && openCount === 1) return lang === 'ar' ? 'ز' : 'Z';
    if (indexOpen && middleOpen && ringOpen && openCount === 3) return lang === 'ar' ? 'ث' : 'TH';

    const isCurved = (r) => r > 0.5 && r < 0.9;
    if (isCurved(indexRel) && isCurved(middleRel) && isCurved(ringRel)) return lang === 'ar' ? 'ج' : 'J';
    if (isCurved(indexRel) && middleRel < 0.5 && ringRel < 0.5 && pinkyRel < 0.5) return lang === 'ar' ? 'د' : 'D';

    if (indexRel > 1.0 && openCount <= 1 && !thumbOpen) return lang === 'ar' ? 'ر' : 'R';
    
    if (openCount >= 3 && !thumbOpen && indexRel > 0.9) {
       const spread = (dist(8, 12) + dist(12, 16) + dist(16, 20)) / palmSize;
       return (spread > 1.0) ? (lang === 'ar' ? 'ش' : 'SH') : (lang === 'ar' ? 'س' : 'S');
    }

    if (openCount === 0 && indexRel <= 0.6) return lang === 'ar' ? 'م' : 'M';
    
    if (!indexOpen && !middleOpen && !ringOpen && pinkyOpen && !thumbOpen) return lang === 'ar' ? 'ي' : 'Y';
    if (thumbOpen && indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return lang === 'ar' ? 'ل' : 'L';
    if (openCount >= 3 && dist(4, 13) < 0.15) return lang === 'ar' ? 'ك' : 'K';
    if (thumbIndexDist < 0.08 && openCount === 0) return lang === 'ar' ? 'و' : 'O';
    if (indexOpen && middleOpen && !ringOpen && !pinkyOpen && thumbOpen) return lang === 'ar' ? 'ع' : 'E';

    return lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...';
}

function onResults(results) {
    const canvas = document.getElementById("output_canvas");
    const video = document.getElementById("webCam");
    const liveAnalysis = document.getElementById("liveAnalysis");
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            // رسم معالم اليد
            if (typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
            }
            if (typeof drawLandmarks !== 'undefined') {
                drawLandmarks(ctx, landmarks, {color: '#FF0000', lineWidth: 2});
            }
            
            let sign = detectSign(landmarks);
            const lang = getCurrentLang();
            const analyzingMsg = lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...';
            
            // --- إضافة الحرف/الكلمة المكتشفة لمربع النص وللسجل السفلي ---
            if (sign !== analyzingMsg) { 
                noSignStartTime = 0; 
                if (currentDetectedSign !== sign) {
                    currentDetectedSign = sign;
                    signDetectStartTime = Date.now();
                } else if (Date.now() - signDetectStartTime > 800) { 
                    if (lastAddedSign !== sign) {
                        const input = document.getElementById("textInput");
                        if (input) {
                            if (sign === "Space" || sign === "مسافة") {
                                input.value += " ";
                            } else if (sign.length > 1) {
                                input.value += (input.value ? " " : "") + sign + " ";
                            } else {
                                input.value += sign;
                            }
                            doTranslate(); // تحديث اللوحة المرئية فوراً
                        }
                        
                        const cameraLog = document.getElementById("cameraLog");
                        if (cameraLog) {
                            const charSpan = document.createElement("span");
                            let fSize = sign.length > 1 ? "1.8rem" : "2.5rem";
                            charSpan.style.cssText = `color:#0b3d91; font-weight:bold; font-size:${fSize}; margin:0 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);`;
                            charSpan.innerText = sign;
                            cameraLog.appendChild(charSpan);
                        }
                        lastAddedSign = sign; 
                    }
                }
            } else {
                // حالة "جاري التحليل": لا نصفر الحركة الحالية فوراً للسماح بالتذبذب (Flickering)
                if (noSignStartTime === 0) noSignStartTime = Date.now();
                // إذا استمرت حالة عدم اليقين لأكثر من نصف ثانية، عندها نصفر الحالة
                if (Date.now() - noSignStartTime > 500) {
                    currentDetectedSign = null;
                    lastAddedSign = null;
                }
            }

            // تحديث بطاقة التحليل الفوري
            if (liveAnalysis) {
                let displayFontSize = sign.length > 1 ? "3rem" : "4.5rem";
                liveAnalysis.innerHTML = `
                    <div class="camera-analysis-card" style="width:100%; max-width:540px; background:#fff; border-radius:18px; padding:18px; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0; display:flex; flex-direction:column; align-items:center; margin: 10px auto;">
                        <p style="margin:0 0 5px; color:#475569; text-align: center; font-size: 1rem;">الترجمة الفورية للحركة:</p>
                        <h3 style="margin:0; color:#0b3d91; text-align: center; font-size: ${displayFontSize}; line-height:1;">${sign}</h3>
                        ${sign !== analyzingMsg ? '<p style="margin-top:10px; color:#10b981; font-size:0.9rem; font-weight:bold;">(ابقِ يدك ثابتة للالتقاط)</p>' : ''}
                    </div>
                `;
            }
        }
    } else {
        currentDetectedSign = null;
        if (noSignStartTime === 0) noSignStartTime = Date.now();
        if (Date.now() - noSignStartTime > 800) lastAddedSign = null;

        if (liveAnalysis) {
            liveAnalysis.innerHTML = `
                <div class="camera-analysis-card" style="width:100%; max-width:540px; background:#fff; border-radius:18px; padding:20px; text-align:center; margin: 10px auto; border: 1px solid #e2e8f0;">
                    <h3 style="margin:0; color:#e11d48; text-align: center; font-size: 1.5rem;">يرجى توجيه يدك للكاميرا</h3>
                </div>
            `;
        }
    }
    ctx.restore();
}

// دالة لتشغيل وإيقاف الكاميرا وبدء محرك تتبع حركة اليد من جوجل (MediaPipe Hands)
async function startCam() {
    const box = document.getElementById("videoContainer");
    const video = document.getElementById("webCam");
    const lang = getCurrentLang();

    if (!box || !video) return;

    const board = document.getElementById("resultBoard");
    const resultSection = document.querySelector(".result-section");

    if (cameraTracker) {
        cameraTracker.stop();
        cameraTracker = null;
        if (handsTracker) {
            handsTracker.close();
            handsTracker = null;
        }
        box.style.display = "none";
        
        // عند إغلاق الكاميرا، نظهر الصور فقط إذا كان هناك نص مكتوب
        const input = document.getElementById("textInput");
        if (resultSection && input && input.value.trim()) {
            resultSection.style.display = "block";
        }
        
        clearTranslation();
        return;
    }

    box.style.display = "block";
    if (resultSection) resultSection.style.display = "none"; // إخفاء الصور عند فتح الكاميرا
    
    if (board) board.innerHTML = `<p id="placeholder">جاري تشغيل كاميرا الذكاء الاصطناعي (MediaPipe)...</p>`;

    try {
        handsTracker = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        handsTracker.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        handsTracker.onResults(onResults);

        cameraTracker = new Camera(video, {
            onFrame: async () => {
                const board = document.getElementById("resultBoard");
                if (board && board.innerHTML.includes("جاري تشغيل كاميرا")) {
                    board.innerHTML = `<p id="placeholder" style="color:#0b3d91;">تم تشغيل الكاميرا، جاري تحميل نماذج الذكاء الاصطناعي (قد يستغرق بعض الوقت حسب سرعة الإنترنت)...</p>`;
                }
                try {
                    await handsTracker.send({ image: video });
                } catch (err) {
                    if (board) board.innerHTML = `<p style="color:red; text-align:center;">خطأ أثناء معالجة الصورة: ${err.message}</p>`;
                }
            },
            width: 640,
            height: 480
        });

        await cameraTracker.start();

    } catch (e) {
        console.error(e);
        alert(translatorText[lang].cameraError);
        box.style.display = "none";
    }
}

// دالة لتشغيل الميكروفون وتحويل الصوت إلى نص مكتوب (Speech-to-Text) ثم ترجمته إلى إشارة فوراً
function startMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const lang = getCurrentLang();

    if (!SpeechRecognition) {
        alert(translatorText[lang].speechError);
        return;
    }

    const rec = new SpeechRecognition();
    rec.lang = lang === "ar" ? "ar-SA" : "en-US";

    rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const input = document.getElementById("textInput");
        if (input) {
            input.value = transcript;
            doTranslate();
        }
    };

    rec.start();
}

// دالة مراقب الأحداث (Observer): تراقب أي تغيير في لغة أو اتجاه الصفحة (RTL/LTR) لتحديث نصوص واجهة المترجم تلقائياً
function observeDirectionChanges() {
    const html = document.documentElement;

    const observer = new MutationObserver(() => {
        applyTranslatorLanguage();
        doTranslate();
    });

    observer.observe(html, {
        attributes: true,
        attributeFilter: ["dir", "lang"]
    });
}

// دالة لإعداد وبرمجة القوائم العلوية (القائمة الشخصية، قائمة اللغات، قائمة إمكانية الوصول) لتفتح وتغلق عند النقر
function setupHeaderMenus() {
    const accessibilityBtn = document.getElementById("accessibilityBtn");
    const accessibilityMenu = document.getElementById("accessibilityMenu");
    const languageBtn = document.getElementById("languageBtn");
    const languageMenu = document.getElementById("languageMenu");
    const langAr = document.getElementById("langAr");
    const langEn = document.getElementById("langEn");

    const userChip = document.querySelector(".user-chip");
    const userMenu = document.querySelector(".user-menu");

    if (accessibilityBtn && accessibilityMenu) {
        accessibilityBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            accessibilityMenu.classList.toggle("show");
            if (languageMenu) languageMenu.classList.remove("show");
            if (userMenu) userMenu.classList.remove("show");
        });
    }

    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            languageMenu.classList.toggle("show");
            if (accessibilityMenu) accessibilityMenu.classList.remove("show");
            if (userMenu) userMenu.classList.remove("show");
        });
    }

    if (userChip && userMenu) {
        userChip.addEventListener("click", function (e) {
            e.stopPropagation();
            userMenu.classList.toggle("show");
            if (accessibilityMenu) accessibilityMenu.classList.remove("show");
            if (languageMenu) languageMenu.classList.remove("show");
        });
    }

if (langAr) {
    langAr.addEventListener("click", function () {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
        applyTranslatorLanguage();
        doTranslate();
        if (languageMenu) languageMenu.classList.remove("show");
    });
}

if (langEn) {
    langEn.addEventListener("click", function () {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = "en";
        applyTranslatorLanguage();
        doTranslate();
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

    if (userMenu && !e.target.closest(".user-dropdown")) {
        userMenu.classList.remove("show");
    }
});
}

// دالة لإعداد أدوات إمكانية الوصول (تكبير وتصغير الخط، تغيير لون الخلفية والنص، وإعادة ضبط الألوان الافتراضية)
function setupAccessibility() {
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");
    const bgColorInput = document.getElementById("bgColorInput");
    const textColorInput = document.getElementById("textColorInput");
    const helpBtn = document.getElementById("helpBtn");

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
            document.documentElement.style.setProperty("--page-bg", "#edf4ff");
            document.documentElement.style.setProperty("--page-text", "#1f2d3d");

            if (bgColorInput) bgColorInput.value = "#edf4ff";
            if (textColorInput) textColorInput.value = "#1f2d3d";
        });
    }

    if (bgColorInput) {
        bgColorInput.addEventListener("input", (e) => {
            document.documentElement.style.setProperty("--page-bg", e.target.value);
        });
    }

    if (textColorInput) {
        textColorInput.addEventListener("input", (e) => {
            document.documentElement.style.setProperty("--page-text", e.target.value);
        });
    }

    if (helpBtn) {
        helpBtn.addEventListener("click", () => {
            alert(translatorText[getCurrentLang()].helpText);
        });
    }
}

// تمت إزالة زر "تحليل الإشارة" واستبداله بنظام الترجمة الفورية (Real-Time)

// أمر التشغيل التلقائي: يتم تنفيذ هذا الكود بمجرد تحميل هيكل الصفحة بالكامل (إعداد مبدئي وتجهيز للأدوات)
document.addEventListener("DOMContentLoaded", () => {
    applyTranslatorLanguage();
    doTranslate();
    observeDirectionChanges();
    setupHeaderMenus();
    setupAccessibility();
});