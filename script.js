// Флаг для отслеживания мобильного устройства
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let isLowPerformance = false;

// Проверяем производительность устройства
function checkPerformance() {
    const start = performance.now();
    // Простой тест производительности
    for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
    }
    const duration = performance.now() - start;
    isLowPerformance = duration > 2; // Если операция занимает больше 2мс, считаем устройство слабым
}

document.addEventListener('DOMContentLoaded', function() {
    checkPerformance();
    
    // Инициализация всех элементов управления
    initializeNavigation();
    initializeToggles();
    initializeSliders();
    initializeFormValidation();
    
    // Обработчик кнопки применения настроек
    document.getElementById('applySettings').addEventListener('click', applySettings);
    
    // Обработчик закрытия модального окна
    document.getElementById('modalClose').addEventListener('click', function() {
        document.getElementById('loadingModal').classList.remove('active');
    });
    
    // Оптимизация для мобильных: предотвращаем двойной тап для зума
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Навигация между страницами
function initializeNavigation() {
    const mainPage = document.getElementById('mainPage');
    const settingsPage = document.getElementById('settingsPage');
    const configureBtn = document.getElementById('configureChatBtn');
    const backBtn = document.getElementById('backBtn');
    
    configureBtn.addEventListener('click', function() {
        mainPage.classList.remove('active');
        settingsPage.classList.add('active');
    });
    
    backBtn.addEventListener('click', function() {
        settingsPage.classList.remove('active');
        mainPage.classList.add('active');
    });
}

// Инициализация переключателей с анимацией частиц
function initializeToggles() {
    const toggles = document.querySelectorAll('.toggle-switch');
    
    toggles.forEach(toggle => {
        // Используем passive listeners для лучшей производительности
        toggle.addEventListener('click', function(e) {
            handleToggleClick(this, e);
        }, { passive: true });
    });
}

function handleToggleClick(toggle, e) {
    const wasActive = toggle.classList.contains('active');
    
    if (!wasActive) {
        // Активируем переключатель
        toggle.classList.add('active');
        
        // Создаем частицы только если устройство не слабое
        if (!isLowPerformance) {
            createParticles(toggle, e);
        }
    } else {
        // Деактивируем переключатель
        toggle.classList.remove('active');
    }
    
    // Находим соответствующий контент
    const toggleId = toggle.id.replace('Toggle', 'Content');
    const content = document.getElementById(toggleId);
    
    if (content) {
        content.classList.toggle('active');
    }
    
    // Проверяем валидность формы
    validateForm();
}

// Создание частиц для анимации переключателя
function createParticles(element, event) {
    const rect = element.getBoundingClientRect();
    const particlesContainer = element.querySelector('.toggle-particles');
    
    // Уменьшаем количество частиц на мобильных
    const particleCount = isMobile ? 4 : 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Вычисляем направление частицы
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = isMobile ? 20 : 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = '50%';
        particle.style.top = '50%';
        
        particlesContainer.appendChild(particle);
        
        // Удаляем частицу после анимации
        setTimeout(() => {
            if (particle.parentNode === particlesContainer) {
                particlesContainer.removeChild(particle);
            }
        }, 400);
    }
}

// Инициализация ползунков
function initializeSliders() {
    const sliders = document.querySelectorAll('.liquid-slider');
    
    sliders.forEach(slider => {
        initializeSingleSlider(slider);
    });
}

function initializeSingleSlider(slider) {
    const track = slider.querySelector('.slider-track');
    const fill = slider.querySelector('.slider-fill');
    const thumb = slider.querySelector('.slider-thumb');
    const valueDisplay = slider.querySelector('.slider-value');
    
    let isDragging = false;
    let currentValue = 4;
    let rafId = null;
    
    // Функция обновления позиции ползунка
    function updateSliderPosition(percent) {
        const boundedPercent = Math.max(0, Math.min(100, percent));
        
        // Используем requestAnimationFrame для плавности
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
            fill.style.width = `${boundedPercent}%`;
            thumb.style.left = `${boundedPercent}%`;
            
            // Рассчитываем значение от 1 до 7
            currentValue = Math.round(1 + (boundedPercent / 100) * 6);
            valueDisplay.textContent = currentValue;
            
            // Добавляем эффект жидкости только если устройство не слабое
            if (!isLowPerformance) {
                createLiquidEffect(track, boundedPercent);
            }
        });
    }
    
    // Обработчик клика по треку
    track.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        updateSliderPosition(percent);
    }, { passive: true });
    
    // Обработчики для мыши
    thumb.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', stopDrag);
    
    // Обработчики для тач-устройств
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
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        
        const rect = track.getBoundingClientRect();
        let clientX;
        
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        
        const percent = ((clientX - rect.left) / rect.width) * 100;
        updateSliderPosition(percent);
    }
    
    // Инициализация начальной позиции
    updateSliderPosition(50);
}

// Инициализация валидации формы
function initializeFormValidation() {
    const chatCodeInput = document.getElementById('chatCode');
    
    // Используем debounce для оптимизации
    let timeoutId;
    chatCodeInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(validateForm, 100);
    }, { passive: true });
    
    // Также проверяем при изменении переключателей
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            setTimeout(validateForm, 50);
        }, { passive: true });
    });
}

// Валидация формы
function validateForm() {
    const chatCodeInput = document.getElementById('chatCode');
    const applyButton = document.getElementById('applySettings');
    
    // Проверяем, заполнено ли поле с кодом
    const isCodeValid = chatCodeInput.value.trim().length > 0;
    
    // Проверяем, включены ли обязательные настройки с текстом
    const greetingToggle = document.getElementById('greetingToggle');
    const greetingText = document.getElementById('greetingText');
    const farewellToggle = document.getElementById('farewellToggle');
    const farewellText = document.getElementById('farewellText');
    
    let isTextValid = true;
    
    // Если включено приветствие, проверяем текст
    if (greetingToggle.classList.contains('active') && greetingText.value.trim().length === 0) {
        isTextValid = false;
    }
    
    // Если включено прощание, проверяем текст
    if (farewellToggle.classList.contains('active') && farewellText.value.trim().length === 0) {
        isTextValid = false;
    }
    
    // Активируем/деактивируем кнопку
    applyButton.disabled = !(isCodeValid && isTextValid);
}

// Применение настроек
function applySettings() {
    // Показываем модальное окно
    const modal = document.getElementById('loadingModal');
    modal.classList.add('active');
    
    // Собираем данные настроек
    const settings = collectSettings();
    
    // Через 3 секунды перенаправляем на бота
    setTimeout(() => {
        const url = generateBotUrl(settings);
        window.location.href = url;
    }, 3000);
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        modal.classList.remove('active');
    }, 5000);
}

// Сбор всех настроек
function collectSettings() {
    const settings = {
        // Токен
        token: document.getElementById('chatCode').value.trim(),
        
        // Приветствие
        greeting: {
            enabled: document.getElementById('greetingToggle').classList.contains('active'),
            text: document.getElementById('greetingText').value
        },
        
        // Прощание
        farewell: {
            enabled: document.getElementById('farewellToggle').classList.contains('active'),
            text: document.getElementById('farewellText').value
        },
        
        // Настройки доступов
        permissions: {
            mute: getToggleValue('muteToggle', 'muteSlider'),
            unmute: getToggleValue('unmuteToggle', 'unmuteSlider'),
            kick: getToggleValue('kickToggle', 'kickSlider'),
            ban: getToggleValue('banToggle', 'banSlider'),
            pin: getToggleValue('pinToggle', 'pinSlider'),
            role: getToggleValue('roleToggle', 'roleSlider')
        },
        
        // Другие настройки
        other: {
            broadcast: document.getElementById('broadcastToggle').classList.contains('active')
        }
    };
    
    return settings;
}

// Получение значения переключателя с ползунком
function getToggleValue(toggleId, sliderId) {
    const toggle = document.getElementById(toggleId);
    if (!toggle.classList.contains('active')) {
        return '-';
    }
    return getSliderValue(sliderId);
}

// Получение значения ползунка
function getSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = slider.querySelector('.slider-value');
    return parseInt(valueDisplay.textContent);
}

// Генерация URL для бота
function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function generateBotUrl(settings) {
    let params = [];

    params.push(`CCCToken:${settings.token}`);

    if (settings.greeting.enabled && settings.greeting.text) {
        params.push(`HiText:${settings.greeting.text}`);
    }
    if (settings.farewell.enabled && settings.farewell.text) {
        params.push(`GoodByeText:${settings.farewell.text}`);
    }

    // Остальные параметры
    params.push(`Mute:${settings.permissions.mute}`);
    params.push(`Unmute:${settings.permissions.unmute}`);
    params.push(`Kick:${settings.permissions.kick}`);
    params.push(`Ban:${settings.permissions.ban}`);
    params.push(`Pin:${settings.permissions.pin}`);
    params.push(`Role:${settings.permissions.role}`);
    if (settings.other.broadcast) params.push(`Broadcast:on`);

    const paramsString = params.join(';');

    const encoded = utf8_to_b64(paramsString);

    return `https://t.me/FernieUIBot?start=CSet$${encoded}`;
}


// Создание эффекта жидкости для ползунка
function createLiquidEffect(track, percent) {
    // Создаем временный элемент для эффекта волны
    const wave = document.createElement('div');
    wave.style.position = 'absolute';
    wave.style.width = isMobile ? '15px' : '20px';
    wave.style.height = isMobile ? '15px' : '20px';
    wave.style.background = 'rgba(255, 255, 255, 0.3)';
    wave.style.borderRadius = '50%';
    wave.style.left = `${percent}%`;
    wave.style.top = '50%';
    wave.style.transform = 'translate(-50%, -50%) scale(0)';
    wave.style.transition = 'transform 0.2s ease-out';
    
    track.appendChild(wave);
    
    // Анимируем волну
    setTimeout(() => {
        wave.style.transform = 'translate(-50%, -50%) scale(1.5)';
        wave.style.opacity = '0';
    }, 10);
    
    // Удаляем элемент после анимации
    setTimeout(() => {
        if (wave.parentNode === track) {
            track.removeChild(wave);
        }
    }, 200);
}

// Предотвращаем скролл страницы при взаимодействии с элементами
document.addEventListener('touchmove', function(e) {
    if (e.target.classList.contains('slider-thumb') || 
        e.target.classList.contains('toggle-switch')) {
        e.preventDefault();
    }
}, { passive: false });
