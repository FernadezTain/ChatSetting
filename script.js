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
    initializeFormValidation();

    document.getElementById('applySettings').addEventListener('click', applySettings);
    document.getElementById('modalClose').addEventListener('click', () => {
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
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            handleToggleClick(this, e);
        }, { passive: true });
    });
}

function handleToggleClick(toggle, e) {
    const wasActive = toggle.classList.contains('active');
    toggle.classList.toggle('active');
    const toggleId = toggle.id.replace('Toggle', 'Content');
    const content = document.getElementById(toggleId);
    if (content) content.classList.toggle('active');
    validateForm();
}

// ------------------------- Валидация формы -------------------------
function initializeFormValidation() {
    const chatCodeInput = document.getElementById('chatCode');
    chatCodeInput.addEventListener('input', () => setTimeout(validateForm, 100));
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', () => setTimeout(validateForm, 50));
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

    if (greetingToggle.classList.contains('active') && greetingText.value.trim() === "") isTextValid = false;
    if (farewellToggle.classList.contains('active') && farewellText.value.trim() === "") isTextValid = false;

    applyButton.disabled = !(isCodeValid && isTextValid);
}

// ------------------------- Генерация команды -------------------------
function applySettings() {
    const modal = document.getElementById('loadingModal');
    modal.classList.add('active');

    setTimeout(() => {
        const token = document.getElementById('chatCode').value.trim();
        const hiToggle = document.getElementById('greetingToggle').classList.contains('active');
        const hiText = document.getElementById('greetingText').value.trim();
        const byeToggle = document.getElementById('farewellToggle').classList.contains('active');
        const byeText = document.getElementById('farewellText').value.trim();
        const broadcastToggle = document.getElementById('broadcastToggle').classList.contains('active');

        const command = `/change;token:${token}` +
            ` ;hitext:{${hiToggle && hiText ? hiText : "-"}}` +
            ` ;goodbyetext:{${byeToggle && byeText ? byeText : "-"}}` +
            ` ;mailing:{${broadcastToggle ? "yes" : "no"}}`;

        modal.classList.remove('active');
        showCommandModal(command);
    }, 1000);
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
