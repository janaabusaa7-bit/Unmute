// Home page animations and interactions

function revealOnScroll() {
    const elements = document.querySelectorAll(".reveal");

    elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if (elementTop < screenHeight - 90) {
            element.classList.add("active");
        }
    });
}

function initHeroCanvas() {
    const canvas = document.getElementById("heroCanvas");
    const hero = document.querySelector(".home-hero-section");

    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");

    let width;
    let height;
    let points = [];

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = hero.offsetHeight;
    }

    function createPoints() {
        points = [];

        const count = Math.min(75, Math.floor(width / 22));

        for (let i = 0; i < count; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.75
                    ? "rgba(255, 193, 7, 0.55)"
                    : "rgba(47, 128, 237, 0.45)"
            });
        }
    }

    function drawPoints() {
        ctx.clearRect(0, 0, width, height);

        points.forEach((point) => {
            point.x += point.vx;
            point.y += point.vy;

            if (point.x < 0 || point.x > width) {
                point.vx *= -1;
            }

            if (point.y < 0 || point.y > height) {
                point.vy *= -1;
            }

            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
            ctx.fillStyle = point.color;
            ctx.fill();
        });

        connectPoints();
        requestAnimationFrame(drawPoints);
    }

    function connectPoints() {
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[j].x, points[j].y);
                    ctx.strokeStyle = `rgba(47, 128, 237, ${0.18 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    resizeCanvas();
    createPoints();
    window._heroPoints = points;
    drawPoints();

    window.addEventListener("resize", () => {
        resizeCanvas();
        createPoints();
        window._heroPoints = points;
    });
}

function initHeroImageMove() {
    const heroVisual = document.querySelector(".hero-visual-box");
    const heroImage = document.querySelector(".hero-image-card");

    if (!heroVisual || !heroImage) return;

    heroVisual.addEventListener("mousemove", (event) => {
        const rect = heroVisual.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = ((y / rect.height) - 0.5) * -8;

        heroImage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroVisual.addEventListener("mouseleave", () => {
        heroImage.style.transform = "";
    });
}

function initHeaderMenus() {
    const languageBtn = document.getElementById("languageBtn");
    const languageMenu = document.getElementById("languageMenu");

    const accessibilityBtn = document.getElementById("accessibilityBtn");
    const accessibilityMenu = document.getElementById("accessibilityMenu");

    if (languageBtn && languageMenu) {
        languageBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            languageMenu.classList.toggle("show");

            if (accessibilityMenu) {
                accessibilityMenu.classList.remove("show");
            }
        });
    }

    if (accessibilityBtn && accessibilityMenu) {
        accessibilityBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            accessibilityMenu.classList.toggle("show");

            if (languageMenu) {
                languageMenu.classList.remove("show");
            }
        });
    }

    window.addEventListener("click", (event) => {
        if (
            languageMenu &&
            languageBtn &&
            !languageMenu.contains(event.target) &&
            !languageBtn.contains(event.target)
        ) {
            languageMenu.classList.remove("show");
        }

        if (
            accessibilityMenu &&
            accessibilityBtn &&
            !accessibilityMenu.contains(event.target) &&
            !accessibilityBtn.contains(event.target)
        ) {
            accessibilityMenu.classList.remove("show");
        }
    });
}

function initAccessibilitySettings() {
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    const bgColorInput = document.getElementById("bgColorInput");
    const textColorInput = document.getElementById("textColorInput");
    const resetAccessibilityBtn = document.getElementById("resetAccessibilityBtn");

    const savedFont = localStorage.getItem("unmuteFontSize");
    const savedBg = localStorage.getItem("unmuteBgColor");
    const savedText = localStorage.getItem("unmuteTextColor");

    if (savedFont) {
        document.documentElement.style.fontSize = savedFont;
    }

    if (savedBg) {
        document.body.style.backgroundColor = savedBg;
    }

    if (savedText) {
        document.body.style.color = savedText;
    }

    if (bgColorInput && savedBg) {
        bgColorInput.value = savedBg;
    }

    if (textColorInput && savedText) {
        textColorInput.value = savedText;
    }

    function saveSettings() {
        localStorage.setItem(
            "unmuteFontSize",
            getComputedStyle(document.documentElement).fontSize
        );

        if (bgColorInput) {
            localStorage.setItem("unmuteBgColor", bgColorInput.value);
        }

        if (textColorInput) {
            localStorage.setItem("unmuteTextColor", textColorInput.value);
        }
    }

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

            if (currentSize < 24) {
                document.documentElement.style.fontSize = `${currentSize + 2}px`;
                saveSettings();
            }
        });
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener("click", () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

            if (currentSize > 12) {
                document.documentElement.style.fontSize = `${currentSize - 2}px`;
                saveSettings();
            }
        });
    }

    if (bgColorInput) {
        bgColorInput.addEventListener("input", () => {
            document.body.style.backgroundColor = bgColorInput.value;
            saveSettings();
        });
    }

    if (textColorInput) {
        textColorInput.addEventListener("input", () => {
            document.body.style.color = textColorInput.value;
            saveSettings();
        });
    }

    if (resetAccessibilityBtn) {
        resetAccessibilityBtn.addEventListener("click", () => {
            document.documentElement.style.fontSize = "16px";
            document.body.style.backgroundColor = "#f6f9ff";
            document.body.style.color = "#1f2d3d";

            if (bgColorInput) {
                bgColorInput.value = "#f6f9ff";
            }

            if (textColorInput) {
                textColorInput.value = "#1f2d3d";
            }

            localStorage.setItem("unmuteFontSize", "16px");
            localStorage.setItem("unmuteBgColor", "#f6f9ff");
            localStorage.setItem("unmuteTextColor", "#1f2d3d");
        });
    }
}

function initFooterModal() {
    const emailModal = document.getElementById("emailModal");
    const footerEmailBtn = document.getElementById("footerEmailBtn");
    const closeModalBtn = document.querySelector(".close-modal");

    if (footerEmailBtn && emailModal) {
        footerEmailBtn.addEventListener("click", () => {
            emailModal.style.display = "flex";
        });
    }

    if (closeModalBtn && emailModal) {
        closeModalBtn.addEventListener("click", () => {
            emailModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === emailModal) {
            emailModal.style.display = "none";
        }
    });
}

function initMouseParticles() {
    const canvas = document.getElementById("heroCanvas");

    if (!canvas) return;

    const hero = canvas.closest(".home-hero-section");

    if (!hero) return;

    hero.addEventListener("mousemove", (event) => {
        const rect = hero.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (window._heroPoints) {
            window._heroPoints.forEach((point) => {
                const dx = point.x - mouseX;
                const dy = point.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100 && distance > 0) {
                    const force = (100 - distance) / 100;

                    point.vx += (dx / distance) * force * 0.8;
                    point.vy += (dy / distance) * force * 0.8;

                    const maxSpeed = 2.5;
                    const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);

                    if (speed > maxSpeed) {
                        point.vx = (point.vx / speed) * maxSpeed;
                        point.vy = (point.vy / speed) * maxSpeed;
                    }
                }
            });
        }
    });
}

function initButtonRipple() {
    document.querySelectorAll(".main-btn, .ghost-btn").forEach((button) => {
        button.style.position = "relative";
        button.style.overflow = "hidden";

        button.addEventListener("click", (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const ripple = document.createElement("span");
            const size = Math.max(rect.width, rect.height) * 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x - size / 2}px;
                top: ${y - size / 2}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.35);
                transform: scale(0);
                animation: rippleAnim 0.65s ease-out forwards;
                pointer-events: none;
            `;

            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 660);
        });
    });

    if (!document.getElementById("rippleStyle")) {
        const style = document.createElement("style");
        style.id = "rippleStyle";
        style.textContent = `
            @keyframes rippleAnim {
                to {
                    transform: scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    revealOnScroll();
    initHeroCanvas();
    initHeroImageMove();
    initHeaderMenus();
    initAccessibilitySettings();
    initFooterModal();
    initMouseParticles();
    initButtonRipple();

    window.addEventListener("scroll", revealOnScroll);
});