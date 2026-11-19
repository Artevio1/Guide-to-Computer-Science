// Общие данные и функции для всех страниц.
// Подключается после data.js.

// Названия разделов и цвет маркера. Ключи совпадают с полем "c" в data.js
const CATEGORIES = {
    hard:     { name: 'Оборудование',            color: '#D9822B' },
    soft:     { name: 'Программы',               color: '#2F8F6B' },
    code:     { name: 'Основы кода',             color: '#7B5CD6' },
    net:      { name: 'Интернет и сети',         color: '#0E8F9B' },
    data:     { name: 'Хранение данных',         color: '#B5558A' },
    security: { name: 'Безопасность',            color: '#C8473F' }
};

// Список терминов без повторов (при дубле остаётся первая запись)
function getTerms() {
    const seen = new Set();
    return itTerms.filter(item => {
        if (seen.has(item.t)) return false;
        seen.add(item.t);
        return true;
    });
}

// Склонение: plural(5, ['термин', 'термина', 'терминов'])
function plural(n, forms) {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
    return forms[2];
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Переключатель темы (сама тема выставляется до отрисовки в <head>)
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) { /* хранилище недоступно */ }
    });
});
