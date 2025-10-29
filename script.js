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

// ------------------------- ИСПРАВЛЕННЫЙ applySettings -------------------------
async function applySettings() {
    const modal = document.getElementById('loadingModal');
    modal.classList.add('active');

    try {
        // Собираем все настройки
        const settings = collectAllSettings();
        
        // Формируем строку параметров
        const paramsString = formatSettingsToParams(settings);
        
        // Кодируем для URL
        const encodedParams = encodeURIComponent(paramsString);
        
        // Формируем правильную ссылку для Telegram
        const telegramUrl = `https://t.me/FernieUIBot?start=${encodedParams}`;
        
        console.log('Generated URL:', telegramUrl);
        
        // Ждем 3 секунды чтобы пользователь увидел анимацию загрузки
        setTimeout(() => {
            // Открываем ссылку в новом окне/вкладке
            window.open(telegramUrl, '_blank');
            
            // Закрываем модальное окно
            modal.classList.remove('active');
            
            // Показываем уведомление
            showNotification('Настройки отправлены в бота! Откройте Telegram для завершения.');
            
        }, 3000);

    } catch (error) {
        console.error('Error applying settings:', error);
        modal.classList.remove('active');
        showNotification('Ошибка при отправке настроек. Попробуйте еще раз.', 'error');
    }
}

// ------------------------- Сбор всех настроек -------------------------
function collectAllSettings() {
    const settings = {
        // Основные настройки
        token: document.getElementById('chatCode').value.trim(),
        
        // Приветствие
        greeting: {
            enabled: document.getElementById('greetingToggle').classList.contains('active'),
            text: document.getElementById('greetingText').value.trim()
        },
        
        // Прощание
        farewell: {
            enabled: document.getElementById('farewellToggle').classList.contains('active'),
            text: document.getElementById('farewellText').value.trim()
        },
        
        // Рассылка
        broadcast: document.getElementById('broadcastToggle').classList.contains('active')
    };
    
    return settings;
}

// ------------------------- Форматирование настроек в строку параметров -------------------------
function formatSettingsToParams(settings) {
    let params = [];
    
    // Обязательный параметр - токен
    params.push(`CCCToken:${settings.token}`);
    
    // Приветствие (если включено и есть текст)
    if (settings.greeting.enabled && settings.greeting.text) {
        // Заменяем переносы строк на \n
        const hiText = settings.greeting.text.replace(/\n/g, '\\n');
        params.push(`HiText:${hiText}`);
    }
    
    // Прощание (если включено и есть текст)
    if (settings.farewell.enabled && settings.farewell.text) {
        // Заменяем переносы строк на \n
        const goodbyeText = settings.farewell.text.replace(/\n/g, '\\n');
        params.push(`GoodByeText:${goodbyeText}`);
    }
    
    // Рассылка
    if (settings.broadcast) {
        params.push(`Broadcast:on`);
    }
    
    // Объединяем все параметры через точку с запятой
    return params.join(';');
}

// ------------------------- Вспомогательные функции -------------------------
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1001;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// ------------------------- Предотвращение скролла -------------------------
document.addEventListener('touchmove', function(e) {
    if (e.target.classList.contains('toggle-switch')) {
        e.preventDefault();
    }
}, { passive: false });
