

let curType = "";
let markers = [];
let curLang = window.mapPageLang || document.documentElement.lang || "ar";
let allPlaces = [];
let userMarker = null;
let userPosition = null;
let map;

const palestineCenter = [31.9522, 35.2332];

/*
  هنا نجهز الخريطة أول مرة فقط
*/
function initMap() {
    if (map) return;

    if (typeof L === 'undefined') {
        console.error("Leaflet is not loaded.");
        return;
    }

    try {
        map = L.map("map", { zoomControl: false }).setView(palestineCenter, 8);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        L.control.zoom({ position: "bottomleft" }).addTo(map);
    } catch (e) {
        console.error("Failed to initialize map:", e);
    }
}

/*
  النصوص الخاصة بالعربي والإنجليزي
*/
const ui = {
    ar: {
        mainTitle: "خريطة الأماكن الداعمة",
        mainDesc: "ابحث عن مراكز وخدمات حقيقية مناسبة للصم والبكم والمستخدمين بشكل عام، وحدد أقرب مكان إليك بسهولة.",
        catAll: "كل الأماكن",
        catTherapy: "مراكز علاج وتأهيل",
        catEntertainment: "مراكز ترفيه واندماج",
        catSupport: "جمعيات ومؤسسات",
        searchPlaceholder: "ابحث عن مدينة ثم اضغط Enter...",
        noResults: "لا توجد نتائج مطابقة.",
        nearestTitle: "أقرب مكان لك",
        viewPlace: "عرض المكان",
        openLocation: "فتح الموقع",
        myLocation: "موقعي الحالي",
        nearestBtn: "أقرب مكان",
        locateBtn: "موقعي الحالي",
        resetBtn: "إعادة الضبط",
        kmAway: "كم",
        notSupported: "المتصفح لا يدعم تحديد الموقع.",
        locationDenied: "تعذر الوصول إلى موقعك الحالي.",
        chooseLocationFirst: "حدد موقعك الحالي أولاً.",
        noCoords: "هذا المكان لا يحتوي على إحداثيات بعد.",
        verified: "موثّق",
        rating: "التقييم",
        address: "العنوان",
        phone: "الهاتف",
        website: "الموقع الإلكتروني"
    },
    en: {
        mainTitle: "Supportive Places Map",
        mainDesc: "Find real supportive places for deaf users and general users, and quickly discover the nearest place to you.",
        catAll: "All Places",
        catTherapy: "Therapy & Rehabilitation",
        catEntertainment: "Entertainment & Inclusion",
        catSupport: "Associations & Support",
        searchPlaceholder: "Search for a city then press Enter...",
        noResults: "No matching results found.",
        nearestTitle: "Nearest place",
        viewPlace: "View place",
        openLocation: "Open location",
        myLocation: "My location",
        nearestBtn: "Nearest place",
        locateBtn: "My location",
        resetBtn: "Reset",
        kmAway: "km",
        notSupported: "Your browser does not support geolocation.",
        locationDenied: "Could not get your current location.",
        chooseLocationFirst: "Please detect your location first.",
        noCoords: "This place does not have coordinates yet.",
        verified: "Verified",
        rating: "Rating",
        address: "Address",
        phone: "Phone",
        website: "Website"
    }
};

/*
  دالة صغيرة لتغيير النص إذا العنصر موجود
*/
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/*
  هذه ترجع اسم الفئة بشكل مناسب للغة الحالية
*/
function getCategoryLabel(category) {
    if (curLang === "ar") {
        if (category === "therapy") return "علاج وتأهيل";
        if (category === "entertainment") return "ترفيه واندماج";
        if (category === "support") return "جمعيات ودعم";
        return category;
    } else {
        if (category === "therapy") return "Therapy";
        if (category === "entertainment") return "Entertainment";
        if (category === "support") return "Support";
        return category;
    }
}

/*
  هنا نطبق اللغة على العناصر الديناميكية داخل الصفحة
*/
function applyLanguage() {
    const t = ui[curLang];

    document.documentElement.lang = curLang;
    document.documentElement.dir = curLang === "ar" ? "rtl" : "ltr";

    setText("mainTitle", t.mainTitle);
    setText("mainDesc", t.mainDesc);
    setText("catAll", t.catAll);
    setText("catTherapy", t.catTherapy);
    setText("catEntertainment", t.catEntertainment);
    setText("catSupport", t.catSupport);
    setText("locateBtnText", t.locateBtn);
    setText("nearestBtnText", t.nearestBtn);
    setText("resetBtnText", t.resetBtn);

    const cityInp = document.getElementById("cityInp");
    if (cityInp) cityInp.placeholder = t.searchPlaceholder;

    renderResults();
}

/*
  هنا نجيب الأماكن من map_api.php
  ويمكننا التصفية حسب الفئة أو المدينة
*/
async function loadPlaces() {
    const list = document.getElementById("resList");
    if (list) list.innerHTML = `<div class="empty-result">...</div>`;
    
    const city = document.getElementById("cityInp")?.value.trim() || "";
    const url = `map_api.php?category=${encodeURIComponent(curType)}&city=${encodeURIComponent(city)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            allPlaces = data.places || [];
        } else {
            allPlaces = [];
            if (data.message === "Unauthorized") {
                window.location.href = "login.php";
            }
        }
    } catch (error) {
        console.error("Load places error:", error);
        allPlaces = [];
    }

    renderResults();
}

/*
  هذا محتوى الـ popup الذي يظهر فوق الماركر
*/
function buildPopup(place) {
    const t = ui[curLang];
    const mapLink = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=17/${place.lat}/${place.lng}`;

    return `
        <div class="map-popup">
            <h3>${place.name}</h3>
            <div class="popup-line"><i class="fas fa-layer-group"></i> ${getCategoryLabel(place.category)}</div>
            <div class="popup-line"><i class="fas fa-star"></i> ${t.rating}: ${place.rating ?? "-"}</div>
            <div class="popup-line"><i class="fas fa-location-dot"></i> ${t.address}: ${place.city} - ${place.address ?? ""}</div>
            ${place.phone ? `<div class="popup-line"><i class="fas fa-phone"></i> ${t.phone}: ${place.phone}</div>` : ""}
            ${place.website ? `<div class="popup-line"><i class="fas fa-globe"></i> ${t.website}: ${place.website}</div>` : ""}
            <a class="popup-link" href="${mapLink}" target="_blank">${t.openLocation}</a>
        </div>
    `;
}

/*
  هذه الدالة تعرض النتائج على الجهة اليسار
  وتعرض أيضًا الماركرز على الخريطة
*/
function renderResults() {
    const list = document.getElementById("resList");
    const t = ui[curLang];
    if (!list) return;

    if (map) {
        markers.forEach(m => map.removeLayer(m));
    }
    markers = [];

    if (!allPlaces.length) {
        list.innerHTML = `<div class="empty-result">${t.noResults}</div>`;
        return;
    }

    const validPlaces = allPlaces.filter(p => p.lat !== null && p.lng !== null);

    validPlaces.forEach(place => {
        if (map) {
            try {
                const marker = L.marker([place.lat, place.lng]).addTo(map);
                marker.bindPopup(buildPopup(place));
                marker.placeId = place.id;
                markers.push(marker);
            } catch (e) {
                console.error(e);
            }
        }
    });

    const isShowingAll = list.dataset.showAll === "true";
    const displayCount = isShowingAll ? allPlaces.length : 3;
    const itemsToShow = allPlaces.slice(0, displayCount);
    const hasMore = allPlaces.length > 3;

    let html = `
        <div class="results-header">
            <h3><i class="fas fa-list-ul"></i> ${curLang === 'ar' ? 'النتائج' : 'Results'} (${allPlaces.length})</h3>
            ${hasMore ? `
            <button class="toggle-results-btn" onclick="toggleResults()">
                ${isShowingAll ? (curLang === 'ar' ? 'إخفاء' : 'Hide') : (curLang === 'ar' ? 'إظهار المزيد' : 'Show More')}
                <i class="fas ${isShowingAll ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
            </button>
            ` : ''}
        </div>
    `;

    html += itemsToShow.map(place => {
        const hasCoords = place.lat !== null && place.lng !== null;

        return `
            <div class="place-item" onclick="${hasCoords ? `flyToPlace(${place.id})` : ''}">
                <strong>${place.name}</strong>
                <span class="stars">★ ${place.rating ?? "-"}</span>
                <p>${place.description ?? ""}</p>
                <small class="place-city">
                    <i class="fas fa-map-marker-alt"></i> ${place.city}
                </small>
                <div class="place-meta">${place.address ?? ""}</div>
                <div class="place-category">${getCategoryLabel(place.category)}</div>
                ${place.phone ? `<div class="place-phone"><i class="fas fa-phone"></i> ${place.phone}</div>` : ""}
                ${!hasCoords ? `<div class="no-coords">${t.noCoords}</div>` : ""}
            </div>
        `;
    }).join("");

    list.innerHTML = html;

    if (map && validPlaces.length > 0) {
        fitMapToMarkers(validPlaces);
    }
}

/*
  زر إظهار المزيد / إخفاء
*/
function toggleResults() {
    const list = document.getElementById("resList");
    const current = list.dataset.showAll === "true";
    list.dataset.showAll = (!current).toString();
    renderResults();
}

/*
  هنا نضبط الخريطة بحيث تظهر كل الماركرز
*/
function fitMapToMarkers(validPlaces) {
    if (!validPlaces.length || !map) return;

    if (validPlaces.length === 1) {
        map.flyTo([validPlaces[0].lat, validPlaces[0].lng], 14);
        return;
    }

    const bounds = L.latLngBounds(validPlaces.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
}

/*
  الذهاب لمكان محدد عند الضغط عليه من القائمة
*/
function flyToPlace(placeId) {
    const place = allPlaces.find(p => p.id === placeId);
    if (!place || place.lat === null || place.lng === null || !map) return;

    map.flyTo([place.lat, place.lng], 15);

    const marker = markers.find(m => m.placeId === placeId);
    if (marker) {
        setTimeout(() => marker.openPopup(), 400);
    }
}

/*
  البحث يعمل عند الضغط على Enter
*/
async function handleSearch(e) {
    if (e.key === "Enter") {
        await loadPlaces();
    }
}

/*
  عند اختيار فئة من اللوحة الجانبية
*/
function setCategory(type, el) {
    curType = type;
    document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    loadPlaces();
}

/*
  تجهيز كروت التصنيفات
*/
function setupCategories() {
    document.querySelectorAll(".cat-card").forEach(card => {
        card.addEventListener("click", () => {
            setCategory(card.dataset.type, card);
        });
    });
}

/*
  تحديد موقع المستخدم الحالي
*/
function locateUser() {
    const t = ui[curLang];

    if (!navigator.geolocation || !map) {
        showToast(t.notSupported);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userPosition = { lat, lng };

            if (userMarker) map.removeLayer(userMarker);

            userMarker = L.marker([lat, lng]).addTo(map).bindPopup(t.myLocation);
            map.flyTo([lat, lng], 14);
            userMarker.openPopup();
        },
        () => {
            showToast(t.locationDenied);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/*
  هذه معادلة لحساب المسافة بين نقطتين
*/
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/*
  هنا نبحث عن أقرب مكان حسب موقع المستخدم
*/
function findNearestPlace() {
    const t = ui[curLang];
    const nearestBox = document.getElementById("nearestInfo");

    if (!userPosition) {
        showToast(t.chooseLocationFirst);
        return;
    }

    const validPlaces = allPlaces.filter(p => p.lat !== null && p.lng !== null);
    if (!validPlaces.length) return;

    let nearest = null;
    let minDistance = Infinity;

    validPlaces.forEach(place => {
        const distance = haversineDistance(userPosition.lat, userPosition.lng, place.lat, place.lng);

        if (distance < minDistance) {
            minDistance = distance;
            nearest = place;
        }
    });

    if (!nearest) return;

    nearestBox.style.display = "block";
    nearestBox.innerHTML = `
        <strong>${t.nearestTitle}</strong>
        <div>${nearest.name}</div>
        <div>${minDistance.toFixed(2)} ${t.kmAway}</div>
        <button onclick="flyToPlace(${nearest.id})">${t.viewPlace}</button>
    `;

    flyToPlace(nearest.id);
}

/*
  إعادة الصفحة والخريطة لحالتها الأساسية
*/
function resetMapView() {
    const cityInput = document.getElementById("cityInp");
    const nearestInfo = document.getElementById("nearestInfo");

    if (cityInput) cityInput.value = "";
    if (nearestInfo) nearestInfo.style.display = "none";

    curType = "";

    document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
    const allCard = document.querySelector('.cat-card[data-type=""]');
    if (allCard) allCard.classList.add("active");

    loadPlaces();

    if (map) {
        map.flyTo(palestineCenter, 8);
    }
}

/*
  تكامل الهيدر فقط من ناحية فتح القوائم
  بدون تغيير منطق اللغة العام للمشروع
*/
function setupHeaderIntegration() {
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
        const open = languageMenu?.classList.contains("show");
        closeMenus();
        if (!open) languageMenu?.classList.add("show");
    });

    accessibilityBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = accessibilityMenu?.classList.contains("show");
        closeMenus();
        if (!open) accessibilityMenu?.classList.add("show");
    });

    userMenuBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = userMenu?.classList.contains("show");
        closeMenus();
        if (!open) userMenu?.classList.add("show");
    });

    document.addEventListener("click", closeMenus);
}

/*
  إعدادات الوصول
*/
function setupAccessibility() {
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const bgColorInput = document.getElementById("bgColorInput");
    const textColorInput = document.getElementById("textColorInput");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");

    increaseFontBtn?.addEventListener("click", () => {
        const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
        if (current < 24) document.documentElement.style.fontSize = `${current + 2}px`;
    });

    decreaseFontBtn?.addEventListener("click", () => {
        const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
        if (current > 12) document.documentElement.style.fontSize = `${current - 2}px`;
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
        document.documentElement.style.setProperty("--page-text", "#1e293b");
    });
}

/*
  توست بسيط للرسائل السريعة
*/
function showToast(message) {
    let toast = document.getElementById("mapToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "mapToast";
        toast.className = "map-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

/*
  أول تحميل للصفحة
*/
document.addEventListener("DOMContentLoaded", async () => {
    initMap();
    setupCategories();
    setupHeaderIntegration();
    setupAccessibility();
    applyLanguage();
    await loadPlaces();
});