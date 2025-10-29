document.addEventListener('DOMContentLoaded', function() {
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
        toggle.addEventListener('click', function(e) {
            const wasActive = this.classList.contains('active');
            
            if (!wasActive) {
                // Активируем переключатель
                this.classList.add('active');
                
                // Создаем частицы
                createParticles(this, e);
            } else {
                // Деактивируем переключатель
                this.classList.remove('active');
            }
            
            // Находим соответствующий контент
            const toggleId = this.id.replace('Toggle', 'Content');
            const content = document.getElementById(toggleId);
            
            if (content) {
                content.classList.toggle('active');
            }
            
            // Проверяем валидность формы
            validateForm();
        });
    });
}

// Создание частиц для анимации переключателя
function createParticles(element, event) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const particlesContainer = element.querySelector('.toggle-particles');
    
    // Создаем 8 частиц
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Вычисляем направление частицы
        const angle = (i / 8) * Math.PI * 2;
        const distance = 30;
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
        }, 600);
    }
}

// Инициализация ползунков
function initializeSliders() {
    const sliders = document.querySelectorAll('.liquid-slider');
    
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const fill = slider.querySelector('.slider-fill');
        const thumb = slider.querySelector('.slider-thumb');
        const valueDisplay = slider.querySelector('.slider-value');
        
        let isDragging = false;
        let currentValue = 4; // Значение по умолчанию
        
        // Функция обновления позиции ползунка
        function updateSliderPosition(percent) {
            const boundedPercent = Math.max(0, Math.min(100, percent));
            fill.style.width = `${boundedPercent}%`;
            thumb.style.left = `${boundedPercent}%`;
            
            // Рассчитываем значение от 1 до 7
            currentValue = Math.round(1 + (boundedPercent / 100) * 6);
            valueDisplay.textContent = currentValue;
            
            // Добавляем эффект жидкости
            createLiquidEffect(track, boundedPercent);
        }
        
        // Обработчик клика по треку
        track.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            updateSliderPosition(percent);
        });
        
        // Обработчики drag для thumb
        thumb.addEventListener('mousedown', function(e) {
            isDragging = true;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });
        
        thumb.addEventListener('touchstart', function(e) {
            isDragging = true;
            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
            e.preventDefault();
        });
        
        function onMouseMove(e) {
            if (!isDragging) return;
            const rect = track.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            updateSliderPosition(percent);
        }
        
        function onTouchMove(e) {
            if (!isDragging) return;
            const rect = track.getBoundingClientRect();
            const touch = e.touches[0];
            const percent = ((touch.clientX - rect.left) / rect.width) * 100;
            updateSliderPosition(percent);
        }
        
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        function onTouchEnd() {
            isDragging = false;
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }
        
        // Инициализация начальной позиции
        updateSliderPosition(50); // 50% = значение 4
    });
}

// Инициализация валидации формы
function initializeFormValidation() {
    const chatCodeInput = document.getElementById('chatCode');
    
    chatCodeInput.addEventListener('input', function() {
        validateForm();
    });
    
    // Также проверяем при изменении переключателей
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            setTimeout(validateForm, 100);
        });
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
function generateBotUrl(settings) {
    let params = [];
    
    // Добавляем токен
    params.push(`CCCToken: ${settings.token}`);
    
    // Добавляем приветствие, если включено
    if (settings.greeting.enabled && settings.greeting.text) {
        const hiText = settings.greeting.text.replace(/\n/g, '\\n');
        params.push(`HiText: ${hiText}`);
    }
    
    // Добавляем прощание, если включено
    if (settings.farewell.enabled && settings.farewell.text) {
        const goodbyeText = settings.farewell.text.replace(/\n/g, '\\n');
        params.push(`GoodByeText: ${goodbyeText}`);
    }
    
    // Добавляем настройки доступов
    params.push(`Mute: ${settings.permissions.mute}`);
    params.push(`unmute: ${settings.permissions.unmute}`);
    params.push(`kick: ${settings.permissions.kick}`);
    params.push(`ban: ${settings.permissions.ban}`);
    params.push(`pin: ${settings.permissions.pin}`);
    params.push(`role: ${settings.permissions.role}`);
    
    // Добавляем рассылку, если включена
    if (settings.other.broadcast) {
        params.push(`broadcast: on`);
    }
    
    // Объединяем параметры
    const paramsString = params.join('; ');
    
    // Формируем URL
    const baseUrl = 'https://t.me/FernieUIBot?start=CSet$';
    return baseUrl + encodeURIComponent(paramsString);
}

// Создание эффекта жидкости для ползунка
function createLiquidEffect(track, percent) {
    // Создаем временный элемент для эффекта волны
    const wave = document.createElement('div');
    wave.style.position = 'absolute';
    wave.style.width = '20px';
    wave.style.height = '20px';
    wave.style.background = 'rgba(255, 255, 255, 0.3)';
    wave.style.borderRadius = '50%';
    wave.style.left = `${percent}%`;
    wave.style.top = '50%';
    wave.style.transform = 'translate(-50%, -50%) scale(0)';
    wave.style.transition = 'transform 0.3s ease-out';
    
    track.appendChild(wave);
    
    // Анимируем волну
    setTimeout(() => {
        wave.style.transform = 'translate(-50%, -50%) scale(2)';
        wave.style.opacity = '0';
    }, 10);
    
    // Удаляем элемент после анимации
    setTimeout(() => {
        if (wave.parentNode === track) {
            track.removeChild(wave);
        }
    }, 300);
}
