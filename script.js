// ------------------------- Флаги устройства -------------------------
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let isLowPerformance = false;

// Проверяем производительность
function checkPerformance() {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) Math.sqrt(i);
    const duration = performance.now() - start;
    isLowPerformance = duration > 2;
}

// ------------------------- DOMContentLoaded -------------------------
document.addEventListener('DOMContentLoaded', function() {
    checkPerformance();
    initializeNavigation();
    initializeToggles();
    initializeResets();
    initializeFormValidation();

    document.getElementById('applySettings').addEventListener('click', applySettings);
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('loadingModal').classList.remove('active');
    });
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
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Проверяем, заблокирован ли переключатель
            if (toggle.classList.contains('disabled')) return;

            const wasActive = toggle.classList.contains('active');
            toggle.classList.toggle('active');

            const toggleId = toggle.id.replace('Toggle', 'Content');
            const content = document.getElementById(toggleId);
            if (content) content.classList.toggle('active');

            validateForm();
        });
    });
}

// ------------------------- Кнопки сброса -------------------------
function initializeResets() {
    const greetingText = document.getElementById('greetingText');
    const farewellText = document.getElementById('farewellText');
    const greetingToggle = document.getElementById('greetingToggle');
    const farewellToggle = document.getElementById('farewellToggle');

    // Создаем кнопки сброса
    const greetingReset = document.createElement('button');
    greetingReset.textContent = "Сбросить";
    greetingReset.className = 'reset-btn';
    greetingToggle.parentElement.appendChild(greetingReset);

    const farewellReset = document.createElement('button');
    farewellReset.textContent = "Сбросить";
    farewellReset.className = 'reset-btn';
    farewellToggle.parentElement.appendChild(farewellReset);

    // Обработчик
    greetingReset.addEventListener('click', () => toggleReset(greetingText, greetingToggle, greetingReset));
    farewellReset.addEventListener('click', () => toggleReset(farewellText, farewellToggle, farewellReset));
}

function toggleReset(textarea, toggleSwitch, button) {
    const isActive = button.classList.contains('active');

    if (isActive) {
        // Отключаем сброс
        button.classList.remove('active');
        textarea.disabled = false;
        toggleSwitch.classList.remove('disabled');
    } else {
        // Включаем сброс
        button.classList.add('active');
        textarea.disabled = true;
        textarea.value = "";
        // Выключаем переключатель и скрываем поле
        toggleSwitch.classList.remove('active');
        const toggleId = toggleSwitch.id.replace('Toggle', 'Content');
        const content = document.getElementById(toggleId);
        if (content) content.classList.remove('active');
        toggleSwitch.classList.add('disabled');
    }

    validateForm();
}

// ------------------------- Валидация формы -------------------------
function initializeFormValidation() {
    const chatCodeInput = document.getElementById('chatCode');
    chatCodeInput.addEventListener('input', () => setTimeout(validateForm, 100));
}

function validateForm() {
    const chatCodeInput = document.getElementById('chatCode');
    const applyButton = document.getElementById('applySettings');
    const greetingToggle = document.getElementById('greetingToggle');
    const greetingText = document.getElementById('greetingText');
    const farewellToggle = document.getElementById('farewellToggle');
    const farewellText = document.getElementById('farewellText');

    const greetingResetBtn = document.querySelector('#greetingToggle + .reset-btn');
    const farewellResetBtn = document.querySelector('#farewellToggle + .reset-btn');

    const isCodeValid = chatCodeInput.value.trim().length > 0;
    let isTextValid = true;

    if (greetingToggle.classList.contains('active') && !greetingResetBtn.classList.contains('active') && greetingText.value.trim() === "") isTextValid = false;
    if (farewellToggle.classList.contains('active') && !farewellResetBtn.classList.contains('active') && farewellText.value.trim() === "") isTextValid = false;

    applyButton.disabled = !(isCodeValid && isTextValid);
}

// ------------------------- Генерация команды -------------------------
function applySettings() {
    const modal = document.getElementById('loadingModal');
    modal.classList.add('active');

    setTimeout(() => {
        const token = document.getElementById('chatCode').value.trim();
        const broadcastToggle = document.getElementById('broadcastToggle').classList.contains('active');

        const greetingResetBtn = document.querySelector('#greetingToggle + .reset-btn');
        const farewellResetBtn = document.querySelector('#farewellToggle + .reset-btn');

        const hiText = greetingResetBtn.classList.contains('active') ? "DelateParameter" : document.getElementById('greetingText').value.trim() || "-";
        const byeText = farewellResetBtn.classList.contains('active') ? "DelateParameter" : document.getElementById('farewellText').value.trim() || "-";

        const command = `/change;token:${token}` +
            ` ;hitext:${hiText}` +
            ` ;goodbyetext:${byeText}` +
            ` ;mailing:${broadcastToggle ? "yes" : "no"}`;

        modal.classList.remove('active');
        showCommandModal(command);
    }, 500);
}

// ------------------------- Модальное окно с командой -------------------------
function showCommandModal(command) {
    const modalHtml = document.createElement('div');
    modalHtml.innerHTML = `
        <div class="modal active" style="display:flex;">
            <div class="modal-content glass-effect" style="max-width:500px;">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                <div class="modal-body">
                    <h3 style="margin-bottom: 15px; color: #00c6ff;">Команда настройки готова!</h3>
                    <p>Инструкция по установке:</p>
                    <ol style="text-align:left; margin-bottom:15px;">
                        <li>Скопируйте команду</li>
                        <li>Перейдите в бота <strong>@FernieUIBot</strong></li>
                        <li>Вставьте команду в личку бота</li>
                    </ol>
                    <textarea readonly style="width:100%; font-family:monospace; padding:10px; border-radius:10px; margin-bottom:10px;">${command}</textarea>
                    <button onclick="copyToClipboard('${command}')" style="padding:10px 20px; border:none; border-radius:20px; background:linear-gradient(90deg,#00c6ff,#0072ff); color:white; cursor:pointer;">📋 Скопировать команду</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalHtml);
}

// ------------------------- Копирование в буфер обмена -------------------------
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Команда скопирована!', 'success');
    }).catch(() => showNotification('Ошибка копирования', 'error'));
}

// ------------------------- Уведомления -------------------------
function showNotification(message, type='success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position:fixed;
        top:20px;
        right:20px;
        background:${type==='error'?'#ef4444':'#10b981'};
        color:white;
        padding:15px 25px;
        border-radius:10px;
        box-shadow:0 4px 15px rgba(0,0,0,0.3);
        z-index:1001;
        opacity:0;
        transform:translateX(100px);
        transition:all 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(()=>{notification.style.opacity='1'; notification.style.transform='translateX(0)';},10);
    setTimeout(()=>{
        notification.style.opacity='0'; notification.style.transform='translateX(100px)';
        setTimeout(()=>notification.remove(),300);
    },5000);
}
