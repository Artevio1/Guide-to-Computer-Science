// Игра «Двоичный код»: набрать заданное число, включая разряды

(function () {
    const bitsEl = document.getElementById('bits');
    if (!bitsEl) return;

    const ROUNDS = 10;
    const $ = id => document.getElementById(id);

    let n = 8;
    let bits = [];
    let target = 0;
    let value = 0;
    let round = 0;
    let seconds = 0;
    let timer = null;
    let lock = false;

    function fmt(s) {
        return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    function getBest() {
        try { return Number(localStorage.getItem('bin-best-' + n)) || 0; } catch (e) { return 0; }
    }

    function setBest(t) {
        try { localStorage.setItem('bin-best-' + n, String(t)); } catch (e) { /* хранилище недоступно */ }
    }

    function build() {
        bits = Array(n).fill(0);
        bitsEl.style.setProperty('--n', n);
        bitsEl.innerHTML = bits.map((_, i) => {
            const w = Math.pow(2, n - 1 - i);
            return `<button type="button" class="bit" data-i="${i}" aria-pressed="false" aria-label="Разряд со значением ${w}">
                        <span class="bit__w">${w}</span><span class="bit__d">0</span>
                    </button>`;
        }).join('');
    }

    function update() {
        const parts = [];
        value = 0;
        bits.forEach((b, i) => {
            const w = Math.pow(2, n - 1 - i);
            if (b) { value += w; parts.push(w); }
            const el = bitsEl.children[i];
            el.setAttribute('aria-pressed', b ? 'true' : 'false');
            el.querySelector('.bit__d').textContent = b;
        });
        $('sum').textContent = (parts.length ? parts.join(' + ') : '0') + ' = ' + value;
    }

    function nextRound() {
        const max = Math.pow(2, n) - 1;
        let t;
        do { t = 1 + Math.floor(Math.random() * max); } while (t === target);
        target = t;
        bits.fill(0);
        bitsEl.classList.remove('is-solved');
        $('target').textContent = target;
        update();
        lock = false;
    }

    function finish() {
        clearInterval(timer);
        timer = null;
        const best = getBest();
        const isRecord = !best || seconds < best;
        if (isRecord) setBest(seconds);
        $('bestVal').textContent = fmt(isRecord ? seconds : best);
        $('notice').innerHTML = '<p><strong>Готово.</strong> Время: ' + fmt(seconds) +
            (isRecord ? '. Это новый рекорд для этого уровня.' : '.') + '</p>';
        $('notice').hidden = false;
        lock = true;
    }

    function start() {
        clearInterval(timer);
        timer = null;
        round = 0;
        seconds = 0;
        target = 0;
        $('notice').hidden = true;
        $('timeVal').textContent = '0:00';
        $('roundVal').textContent = '0 из ' + ROUNDS;
        $('bestVal').textContent = getBest() ? fmt(getBest()) : '—';
        build();
        nextRound();
    }

    bitsEl.addEventListener('click', e => {
        const btn = e.target.closest('.bit');
        if (!btn || lock) return;

        if (!timer) timer = setInterval(() => { seconds++; $('timeVal').textContent = fmt(seconds); }, 1000);

        const i = Number(btn.dataset.i);
        bits[i] = bits[i] ? 0 : 1;
        update();

        if (value === target) {
            lock = true;
            round++;
            $('roundVal').textContent = round + ' из ' + ROUNDS;
            bitsEl.classList.add('is-solved');
            if (round >= ROUNDS) finish();
            else setTimeout(nextRound, 450);
        }
    });

    $('levels').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        n = Number(btn.dataset.n);
        $('levels').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        start();
    });

    $('restartBtn').addEventListener('click', start);

    start();
})();
