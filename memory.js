// Игра «Мемори»: найти пары «термин и его определение».
// Каждый запуск берёт случайные 6 терминов.

(function () {
    const board = document.getElementById('memoryBoard');
    if (!board) return;

    const PAIRS = 6;
    const movesEl = document.getElementById('movesVal');
    const foundEl = document.getElementById('foundVal');
    const timeEl = document.getElementById('timeVal');
    const notice = document.getElementById('notice');
    const restartBtn = document.getElementById('restartBtn');

    let first = null;
    let second = null;
    let lock = false;
    let moves = 0;
    let found = 0;
    let seconds = 0;
    let timer = null;

    function formatTime(s) {
        return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    function updateStats() {
        movesEl.textContent = moves;
        foundEl.textContent = found + ' из ' + PAIRS;
        timeEl.textContent = formatTime(seconds);
    }

    function start() {
        clearInterval(timer);
        timer = null;
        first = second = null;
        lock = false;
        moves = found = seconds = 0;
        notice.hidden = true;
        updateStats();

        const picked = shuffle(getTerms()).slice(0, PAIRS);
        const cards = shuffle(picked.flatMap(t => [
            { id: t.t, text: t.t, kind: 'term' },
            { id: t.t, text: t.d, kind: 'desc' }
        ]));

        board.innerHTML = cards.map((c, i) => `
            <button type="button" class="mcard" data-id="${escapeHtml(c.id)}"
                    data-kind="${c.kind}" data-text="${escapeHtml(c.text)}"
                    aria-label="Карточка ${i + 1}, закрыта">
                <span class="mcard__inner">
                    <span class="mcard__face mcard__front" aria-hidden="true">IT</span>
                    <span class="mcard__face mcard__back mcard__back--${c.kind}">${escapeHtml(c.text)}</span>
                </span>
            </button>`).join('');
    }

    function describe(card) {
        const prefix = card.dataset.kind === 'term' ? 'Термин: ' : 'Определение: ';
        return prefix + card.dataset.text;
    }

    function openCard(card) {
        card.classList.add('is-open');
        card.setAttribute('aria-label', describe(card));
    }

    function closeCard(card) {
        card.classList.remove('is-open');
        const index = Array.prototype.indexOf.call(board.children, card) + 1;
        card.setAttribute('aria-label', 'Карточка ' + index + ', закрыта');
    }

    function finish() {
        clearInterval(timer);
        timer = null;
        notice.innerHTML =
            '<p><strong>Все пары найдены.</strong> Ходов: ' + moves +
            ', время: ' + formatTime(seconds) + '.</p>';
        notice.hidden = false;
    }

    board.addEventListener('click', e => {
        const card = e.target.closest('.mcard');
        if (!card || lock || card === first || card.classList.contains('is-matched')) return;

        if (!timer) {
            timer = setInterval(() => { seconds++; updateStats(); }, 1000);
        }

        openCard(card);

        if (!first) {
            first = card;
            return;
        }

        second = card;
        lock = true;
        moves++;

        if (first.dataset.id === second.dataset.id) {
            [first, second].forEach(c => {
                c.classList.remove('is-open');
                c.classList.add('is-matched');
                c.setAttribute('aria-label', describe(c) + '. Пара найдена');
            });
            found++;
            first = second = null;
            lock = false;
            updateStats();
            if (found === PAIRS) finish();
        } else {
            updateStats();
            setTimeout(() => {
                closeCard(first);
                closeCard(second);
                first = second = null;
                lock = false;
            }, 900);
        }
    });

    restartBtn.addEventListener('click', start);

    start();
})();
