function toggleContent(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function applySettings() {
    const code = document.getElementById('chatCode').value.trim();
    if (!code) {
        alert('Введите код настройки чата!');
        return;
    }

    // Можно здесь добавить проверку каждого блока, если он был открыт или нет
    alert('Настройки применены!');
}
