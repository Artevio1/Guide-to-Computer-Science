// Справочник терминов: поиск, фильтр по разделам, окно с подробностями

(function () {
    const list = document.getElementById('termList');
    if (!list) return;

    const input = document.getElementById('termSearch');
    const meta = document.getElementById('resultMeta');
    const catList = document.getElementById('catList');
    const empty = document.getElementById('empty');
    const resetBtn = document.getElementById('resetBtn');
    const dialog = document.getElementById('termDialog');

    const terms = getTerms().sort(compare);
    const state = { category: 'all', query: '' };

    // Сначала кириллица по алфавиту, затем латиница
    function compare(a, b) {
        const aLatin = /^[A-Za-z]/.test(a.t);
        const bLatin = /^[A-Za-z]/.test(b.t);
        if (aLatin !== bLatin) return aLatin ? 1 : -1;
        return a.t.localeCompare(b.t, 'ru', { sensitivity: 'base' });
    }

    function matches(term) {
        if (state.category !== 'all' && term.c !== state.category) return false;
        if (!state.query) return true;
        return term.t.toLowerCase().includes(state.query) ||
               term.d.toLowerCase().includes(state.query);
    }

    // Подсветка найденного фрагмента (безопасно для HTML)
    function highlight(text) {
        const q = state.query;
        if (!q) return escapeHtml(text);
        const lower = text.toLowerCase();
        let out = '';
        let i = 0;
        while (true) {
            const j = lower.indexOf(q, i);
            if (j < 0) {
                out += escapeHtml(text.slice(i));
                break;
            }
            out += escapeHtml(text.slice(i, j)) +
                   '<mark>' + escapeHtml(text.slice(j, j + q.length)) + '</mark>';
            i = j + q.length;
        }
        return out;
    }

    function renderCategories() {
        const keys = ['all', ...Object.keys(CATEGORIES)];
        catList.innerHTML = keys.map(key => {
            const count = key === 'all' ? terms.length : terms.filter(t => t.c === key).length;
            if (!count) return '';
            const name = key === 'all' ? 'Все термины' : CATEGORIES[key].name;
            const color = key === 'all' ? '' : ` style="--cat:${CATEGORIES[key].color}"`;
            return `
                <li>
                    <button type="button" class="cat" data-cat="${key}" aria-pressed="${state.category === key}"${color}>
                        <span class="cat__dot" aria-hidden="true"></span>
                        <span>${name}</span>
                        <span class="cat__count">${count}</span>
                    </button>
                </li>`;
        }).join('');
    }

    function render() {
        const items = terms.filter(matches);
        const filtered = state.category !== 'all';

        list.dataset.filtered = filtered ? 'true' : 'false';
        empty.hidden = items.length > 0;

        meta.textContent = (state.query || filtered)
            ? `Найдено: ${items.length} из ${terms.length}`
            : `${items.length} ${plural(items.length, ['термин', 'термина', 'терминов'])}`;

        list.innerHTML = items.map(term => {
            const cat = CATEGORIES[term.c] || { name: '', color: '#888' };
            return `
                <li>
                    <button type="button" class="term" data-i="${terms.indexOf(term)}" style="--cat:${cat.color}">
                        <span class="term__thumb" data-letter="${escapeHtml(term.t.charAt(0).toUpperCase())}" aria-hidden="true">${term.img ? `<img src="${escapeHtml(term.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}</span>
                        <span class="term__name">${highlight(term.t)}</span>
                        <span class="term__desc">${highlight(term.d)}</span>
                        <span class="term__cat"><span class="cat__dot" aria-hidden="true"></span>${cat.name}</span>
                    </button>
                </li>`;
        }).join('');
    }

    function openTerm(term) {
        const cat = CATEGORIES[term.c] || { name: '', color: '#888' };

        document.getElementById('dCat').style.setProperty('--cat', cat.color);
        document.getElementById('dCatName').textContent = cat.name;
        document.getElementById('dTitle').textContent = term.t;
        document.getElementById('dDesc').textContent = term.d;
        document.getElementById('dWiki').href =
            'https://ru.wikipedia.org/wiki/' + encodeURI(term.link);

        // Картинка показывается, только если она загрузилась
        const media = document.getElementById('dMedia');
        const img = document.getElementById('dImg');
        media.hidden = true;
        img.removeAttribute('src');
        img.onload = () => { media.hidden = false; };
        img.onerror = () => { media.hidden = true; };
        img.alt = term.t;
        if (term.img) img.src = term.img;

        dialog.showModal();
    }

    // Если картинка не загрузилась, остаётся плашка с первой буквой термина
    // (событие error не всплывает, поэтому слушаем на стадии перехвата)
    list.addEventListener('error', e => {
        if (e.target.tagName === 'IMG') e.target.parentElement.classList.add('is-broken');
    }, true);

    // Выбор раздела
    catList.addEventListener('click', e => {
        const btn = e.target.closest('.cat');
        if (!btn) return;
        state.category = btn.dataset.cat;
        catList.querySelectorAll('.cat').forEach(b =>
            b.setAttribute('aria-pressed', String(b === btn)));
        render();
    });

    // Поиск
    input.addEventListener('input', () => {
        state.query = input.value.trim().toLowerCase();
        render();
    });

    // Открытие термина
    list.addEventListener('click', e => {
        const btn = e.target.closest('.term');
        if (btn) openTerm(terms[Number(btn.dataset.i)]);
    });

    // Закрытие окна по клику на фон
    dialog.addEventListener('click', e => {
        if (e.target === dialog) dialog.close();
    });

    // Сброс поиска и фильтра
    resetBtn.addEventListener('click', () => {
        input.value = '';
        state.query = '';
        state.category = 'all';
        renderCategories();
        render();
        input.focus();
    });

    // Клавиша "/" переходит к поиску
    document.addEventListener('keydown', e => {
        if (e.key !== '/' || dialog.open) return;
        if (/^(input|textarea|select)$/i.test(document.activeElement.tagName)) return;
        e.preventDefault();
        input.focus();
    });

    // Запрос из адреса: index.html?q=HTML (используется в итогах викторины)
    const initial = new URLSearchParams(location.search).get('q');
    if (initial) {
        input.value = initial;
        state.query = initial.trim().toLowerCase();
    }

    renderCategories();
    render();
})();
