document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех элементов управления
    initializeToggles();
    initializeSliders();
    initializeCheckboxes();
    initializeFormValidation();
    
    // Обработчик кнопки "Настроить чат"
    document.getElementById('configureChatBtn').addEventListener('click', function() {
        alert('Переход на страницу настройки чата...');
        // Здесь будет переход на другую страницу
    });
    
    // Обработчик кнопки применения настроек
    document.getElementById('applySettings').addEventListener('click', applySettings);
});

// Инициализация переключателей
function initializeToggles() {
    const toggles = document.querySelectorAll('.toggle-btn');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Находим соответствующий контент
            const toggleId = this.id.replace('Toggle', 'Content');
            const content = document.getElementById(toggleId);
            
            if (content) {
                content.classList.toggle('active');
            }
            
            // Добавляем эффект ряби
            createRippleEffect(this);
            
            // Проверяем валидность формы
            validateForm();
        });
    });
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
            createRippleEffect(this);
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

// Инициализация чекбоксов
function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll('.liquid-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            this.classList.toggle('checked');
            createRippleEffect(this);
        });
    });
}

// Инициализация валидации формы
function initializeFormValidation() {
    const chatCodeInput = document.getElementById('chatCode');
    
    chatCodeInput.addEventListener('input', function() {
        validateForm();
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
    // Собираем данные настроек
    const settings = {
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
            mute: getSliderValue('muteSlider'),
            unmute: getSliderValue('unmuteSlider'),
            kick: getSliderValue('kickSlider'),
            ban: getSliderValue('banSlider'),
            pin: getSliderValue('pinSlider'),
            role: getSliderValue('roleSlider')
        },
        
        // Другие настройки
        other: {
            broadcast: document.getElementById('broadcastCheckbox').classList.contains('checked'),
            chatCode: document.getElementById('chatCode').value
        }
    };
    
    // Здесь будет отправка данных на сервер
    console.log('Настройки применены:', settings);
    
    // Показываем уведомление
    showNotification('Настройки успешно применены!');
}

// Получение значения ползунка
function getSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = slider.querySelector('.slider-value');
    return parseInt(valueDisplay.textContent);
}

// Создание эффекта ряби
function createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-effect');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event ? event.clientX - rect.left : rect.width / 2;
    const y = event ? event.clientY - rect.top : rect.height / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
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

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = 'linear-gradient(90deg, #00c6ff, #0072ff)';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '10px';
    notification.style.boxShadow = '0 4px 15px rgba(0, 114, 255, 0.3)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    notification.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
