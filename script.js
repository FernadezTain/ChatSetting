// Флаг для отслеживания мобильного устройства
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let isLowPerformance = false;

// Проверяем производительность устройства
function checkPerformance() {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
    }
    const duration = performance.now() - start;
    isLowPerformance = duration > 2;
}

document.addEventListener('DOMContentLoaded', function() {
    checkPerformance();
    initializeNavigation();
    initializeToggles();
    initializeSliders();
    initializeFormValidation();

    document.getElementById('applySettings').addEventListener('click', applySettings);

    document.getElementById('modalClose').addEventListener('click', function() {
        document.getElementById('loadingModal').classList.remove('active');
    });

    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
});

// ------------------------- Навигация -------------------------
function initializeNavigation() {
    const mainPage = document.getElementById('mainPage');
    const settingsPage = document.getElementById('settingsPage');
    const configureBtn = document.getElementById('configureChatBtn');
    const backBtn = document.getElementById('backBtn');

    configureBtn.addEventListener('click', () => {
        mainPage.classList.remove('active');
        settingsPage.classList.add('active');
    });

    backBtn.addEventListener('click', () => {
        settingsPage.classList.remove('active');
        mainPage.classList.add('active');
    });
}

// ------------------------- Переключатели -------------------------
function initializeToggles() {
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            handleToggleClick(this, e);
        }, { passive: true });
    });
}

function handleToggleClick(toggle, e) {
    const wasActive = toggle.classList.contains('active');
    if (!wasActive) {
        toggle.classList.add('active');
        if (!isLowPerformance) createParticles(toggle, e);
    } else toggle.classList.remove('active');

    const toggleId = toggle.id.replace('Toggle', 'Content');
    const content = document.getElementById(toggleId);
    if (content) content.classList.toggle('active');

    validateForm();
}

function createParticles(element, event) {
    const particlesContainer = element.querySelector('.toggle-particles');
    const particleCount = isMobile ? 4 : 8;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = isMobile ? 20 : 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = '50%';
        particle.style.top = '50%';

        particlesContainer.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode === particlesContainer)
                particlesContainer.removeChild(particle);
        }, 400);
    }
}

// ------------------------- Ползунки -------------------------
function initializeSliders() {
    document.querySelectorAll('.liquid-slider').forEach(slider => initializeSingleSlider(slider));
}

function initializeSingleSlider(slider) {
    const track = slider.querySelector('.slider-track');
    const fill = slider.querySelector('.slider-fill');
    const thumb = slider.querySelector('.slider-thumb');
    const valueDisplay = slider.querySelector('.slider-value');
    let isDragging = false, currentValue = 4, rafId = null;

    function updateSliderPosition(percent) {
        const boundedPercent = Math.max(0, Math.min(100, percent));
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            fill.style.width = `${boundedPercent}%`;
            thumb.style.left = `${boundedPercent}%`;
            currentValue = Math.round(1 + (boundedPercent / 100) * 6);
            valueDisplay.textContent = currentValue;
            if (!isLowPerformance) createLiquidEffect(track, boundedPercent);
        });
    }

    track.addEventListener('click', e => {
        const rect = track.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        updateSliderPosition(percent);
    }, { passive: true });

    thumb.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', stopDrag);
    thumb.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchend', stopDrag);

    function startDrag(e) {
        isDragging = true;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: true });
        e.preventDefault();
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        if (rafId) cancelAnimationFrame(rafId);
    }

    function onDrag(e) {
        if (!isDragging) return;
        const rect = track.getBoundingClientRect();
        let clientX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
        const percent = ((clientX - rect.left) / rect.width) * 100;
        updateSliderPosition(percent);
    }

    updateSliderPosition(50);
}

// ------------------------- Валидация формы -------------------------
function initializeFormValidation() {
    const chatCodeInput = document.getElementById('chatCode');
    let timeoutId;

    chatCodeInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(validateForm, 100);
    }, { passive: true });

    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', () => setTimeout(validateForm, 50), { passive: true });
    });
}

function validateForm() {
    const chatCodeInput = document.getElementById('chatCode');
    const applyButton = document.getElementById('applySettings');
    const greetingToggle = document.getElementById('greetingToggle');
    const greetingText = document.getElementById('greetingText');
    const farewellToggle = document.getElementById('farewellToggle');
    const farewellText = document.getElementById('farewellText');

    const isCodeValid = chatCodeInput.value.trim().length > 0;
    let isTextValid = true;

    if (greetingToggle.classList.contains('active') && greetingText.value.trim().length === 0) isTextValid = false;
    if (farewellToggle.classList.contains('active') && farewellText.value.trim().length === 0) isTextValid = false;

    applyButton.disabled = !(isCodeValid && isTextValid);
}

// ------------------------- Новый applySettings с Vercel -------------------------
async function applySettings() {
    const modal = document.getElementById('loadingModal');
    modal.classList.add('active');

    // Получаем введённый код настройки
    const CCCtoken = document.getElementById('chatCode').value.trim();
    const hiText = document.getElementById('greetingText').value.trim();
    const goodbyeText = document.getElementById('farewellText').value.trim();

    // Формируем строку аргументов
    let args = `CCCToken: ${CCCtoken}; `;
    if (hiText) args += `HiText: ${hiText}; `;
    if (goodbyeText) args += `GoodByeText: ${goodbyeText};`;

    // Кодируем для URL
    const encodedArgs = encodeURIComponent(args);

    // Формируем ссылку для Telegram
    const url = `https://t.me/FernieUIBot?start=CSet$${encodedArgs}`;

    // Перенаправляем пользователя
    window.location.href = url;

    // Закрываем модальное через 5 секунд (для безопасности)
    setTimeout(() => modal.classList.remove('active'), 5000);
}

// ------------------------- Эффект жидкости -------------------------
function createLiquidEffect(track, percent) {
    const wave = document.createElement('div');
    wave.style.position = 'absolute';
    wave.style.width = isMobile ? '15px' : '20px';
    wave.style.height = isMobile ? '15px' : '20px';
    wave.style.background = 'rgba(255,255,255,0.3)';
    wave.style.borderRadius = '50%';
    wave.style.left = `${percent}%`;
    wave.style.top = '50%';
    wave.style.transform = 'translate(-50%,-50%) scale(0)';
    wave.style.transition = 'transform 0.2s ease-out';

    track.appendChild(wave);
    setTimeout(() => {
        wave.style.transform = 'translate(-50%,-50%) scale(1.5)';
        wave.style.opacity = '0';
    }, 10);
    setTimeout(() => {
        if (wave.parentNode === track) track.removeChild(wave);
    }, 200);
}

// ------------------------- Предотвращение скролла -------------------------
document.addEventListener('touchmove', function(e) {
    if (e.target.classList.contains('slider-thumb') || e.target.classList.contains('toggle-switch')) {
        e.preventDefault();
    }
}, { passive: false });
