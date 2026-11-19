// Викторина: для термина нужно выбрать верное определение

(function () {
    const content = document.getElementById('quizContent');
    if (!content) return;

    // Вопросы: t - термин, a - верный ответ, wrong - неверные варианты
    const quizDatabase = [
        { t: "Процессор (CPU)", a: "Главный 'мозг' компьютера, выполняющий все вычисления.", wrong: ["Устройство для хранения файлов", "Программа для просмотра сайтов", "Беспроводной протокол связи"] },
        { t: "HTML", a: "Язык разметки, который используется для создания структуры веб-страниц.", wrong: ["Набор команд для управления роботом", "Протокол для защиты данных", "Программа для удаления вирусов"] },
        { t: "Операционная система", a: "Главная программа, управляющая всем оборудованием и запуском других программ.", wrong: ["Место для хранения фотографий в облаке", "Устройство для подключения принтера", "Правило написания чистого кода"] },
        { t: "Переменная", a: "Именованное место в коде, используемое для временного хранения значений.", wrong: ["Графический элемент на экране", "Часть жесткого диска", "Условие, которое никогда не выполняется"] },
        { t: "Браузер", a: "Программа для запроса, обработки и отображения веб-страниц.", wrong: ["Устройство для записи звука", "Сетевой кабель", "База данных для хранения паролей"] },
        { t: "Оперативная память (RAM)", a: "Очень быстрая, но временная память для запущенных программ.", wrong: ["Долговременное хранилище файлов", "Программа для печати документов", "Часть материнской платы"] },
        { t: "Пароль", a: "Секретный набор символов, используемый для подтверждения личности пользователя.", wrong: ["Уникальный адрес сайта", "Тип компьютерного вируса", "Правило организации папок"] },
        { t: "URL", a: "Уникальный адрес, используемый для идентификации ресурса в интернете (сайта, файла).", wrong: ["Тип шрифта", "Процесс сохранения файла", "Программа для создания таблиц"] },
        { t: "Цикл (Loop)", a: "Конструкция программирования, которая позволяет повторять один и тот же набор действий несколько раз.", wrong: ["Ошибка в коде", "Устройство вывода информации", "Процесс подключения к сети"] },
        { t: "Резервная копия (Backup)", a: "Копия данных, которая хранится отдельно и может быть использована для восстановления информации при сбое.", wrong: ["Процесс удаления старых файлов", "Быстрый доступ к диску", "Набор правил для веб-сервера"] },
        { t: "CSS", a: "Язык стилей, используемый для описания внешнего вида и оформления веб-страницы.", wrong: ["Язык программирования логики", "База данных для хранения стилей", "Протокол шифрования"] },
        { t: "Антивирус", a: "Программа, предназначенная для обнаружения, предотвращения и удаления вредоносного ПО.", wrong: ["Программа для создания презентаций", "Устройство для подключения к роутеру", "Тип сетевого протокола"] }
    ];

    const TOTAL = 10;

    const quizView = document.getElementById('quizView');
    const resultView = document.getElementById('resultView');
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const qNum = document.getElementById('qNum');
    const qTotal = document.getElementById('qTotal');
    const scoreEl = document.getElementById('score');

    const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const ICON_BAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

    let questions = [];
    let index = 0;
    let score = 0;
    let mistakes = [];
    let answered = false;

    function setProgress(done) {
        progressBar.style.width = (done / TOTAL * 100) + '%';
        progress.setAttribute('aria-valuenow', String(done));
    }

    function startQuiz() {
        questions = shuffle(quizDatabase).slice(0, TOTAL).map(q => ({
            ...q,
            options: shuffle([q.a, ...q.wrong])
        }));
        index = 0;
        score = 0;
        mistakes = [];
        scoreEl.textContent = '0';
        qTotal.textContent = TOTAL;
        resultView.hidden = true;
        quizView.hidden = false;
        showQuestion();
    }

    function showQuestion() {
        const q = questions[index];
        answered = false;
        qNum.textContent = index + 1;
        setProgress(index);

        const isLast = index === TOTAL - 1;

        content.innerHTML = `
            <p class="prompt">Выберите определение для термина</p>
            <h2 class="question">${escapeHtml(q.t)}</h2>
            <ul class="options">
                ${q.options.map((option, i) => `
                    <li>
                        <button type="button" class="option" data-i="${i}">
                            <span class="option__key" aria-hidden="true">${i + 1}</span>
                            <span class="option__text">${escapeHtml(option)}</span>
                            <span class="option__mark" aria-hidden="true"></span>
                        </button>
                    </li>`).join('')}
            </ul>
            <div class="quiz-foot">
                <p class="feedback" id="feedback" role="status"></p>
                <button type="button" class="btn btn--primary" id="nextBtn" hidden>
                    ${isLast ? 'Показать результат' : 'Следующий вопрос'}
                </button>
            </div>`;
    }

    function answer(i) {
        if (answered) return;
        answered = true;

        const q = questions[index];
        const buttons = [...content.querySelectorAll('.option')];
        const correctIndex = q.options.indexOf(q.a);
        const feedback = document.getElementById('feedback');
        const nextBtn = document.getElementById('nextBtn');

        buttons.forEach((b, n) => {
            b.disabled = true;
            if (n !== i && n !== correctIndex) b.classList.add('is-dim');
        });

        buttons[correctIndex].classList.add('is-correct');
        buttons[correctIndex].querySelector('.option__mark').innerHTML = ICON_OK;

        if (i === correctIndex) {
            score++;
            scoreEl.textContent = score;
            feedback.textContent = 'Верно.';
        } else {
            mistakes.push(q);
            buttons[i].classList.add('is-wrong');
            buttons[i].querySelector('.option__mark').innerHTML = ICON_BAD;
            feedback.textContent = 'Неверно. Правильный ответ отмечен галочкой.';
        }

        nextBtn.hidden = false;
        nextBtn.focus();
    }

    function resultMessage() {
        if (score >= 9) return 'Отличный результат. Основы вы знаете уверенно.';
        if (score >= 7) return 'Хороший результат. Несколько терминов стоит повторить.';
        if (score >= 5) return 'Базовые понятия усвоены не полностью. Повторите термины ниже.';
        return 'Загляните в справочник и попробуйте ещё раз.';
    }

    function showResult() {
        setProgress(TOTAL);
        quizView.hidden = true;

        const review = mistakes.length ? `
            <h3>Стоит повторить</h3>
            <ul class="review">
                ${mistakes.map(q => `
                    <li><a href="index.html?q=${encodeURIComponent(q.t)}">${escapeHtml(q.t)}</a></li>`).join('')}
            </ul>` : '';

        resultView.innerHTML = `
            <h2 class="result__score">${score} из ${TOTAL}</h2>
            <p class="result__text">${resultMessage()}</p>
            ${review}
            <div class="result__actions">
                <button type="button" class="btn btn--primary" id="againBtn">Пройти ещё раз</button>
                <a class="btn" href="index.html">Открыть справочник</a>
            </div>`;
        resultView.hidden = false;
        document.getElementById('againBtn').addEventListener('click', startQuiz);
    }

    content.addEventListener('click', e => {
        const option = e.target.closest('.option');
        if (option) {
            answer(Number(option.dataset.i));
            return;
        }
        if (e.target.closest('#nextBtn')) {
            if (index === TOTAL - 1) {
                showResult();
            } else {
                index++;
                showQuestion();
            }
        }
    });

    // Клавиши 1-4 выбирают вариант ответа
    document.addEventListener('keydown', e => {
        if (answered || quizView.hidden) return;
        const n = Number(e.key);
        if (n >= 1 && n <= 4) answer(n - 1);
    });

    startQuiz();
})();
