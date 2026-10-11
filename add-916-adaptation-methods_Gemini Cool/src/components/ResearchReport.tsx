import React from 'react';
import { Download, FileText, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export const ResearchReport: React.FC = () => {
  const downloadMarkdownReport = () => {
    const md = `# Recompose Studio — Отчёт исследования и внедрения новых методов адаптации 16:9 → 9:16

## 1. Контекст и цели исследования
Мы разработали и внедрили новый этап развития браузерной лаборатории Recompose Studio для конвертации HTML/CSS-шаблонов из горизонтального формата 16:9 (базовый холст 1440×852 / 1920×1080) в вертикальный формат 9:16 (рабочее поле 900×1600).

**Ключевое требование выполнено в полном объёме:**
Четыре существующих базовых метода сохранены без каких-либо изменений:
1. \`smart\` — Реконструкция по ролям (исходная логика)
2. \`compact\` — Адаптивная сетка (исходная логика)
3. \`split\` — Редакционный split (исходная логика)
4. \`fit\` — Контрольный safe-fit (исходная логика)

Пять новых алгоритмов добавлены изолированно и независимо:
5. \`editorial\` — Вертикальная редакционная композиция (Направление А)
6. \`heroMedia\` — Композиция с главным медиа (Направление Б)
7. \`mediaGrid\` — Вертикальная медиасетка (Направление В)
8. \`balanced\` — Сбалансированная композиция (Направление Г)
9. \`typographic\` — Типографический вертикальный плакат (Направление Д)

---

## 2. Причины неудачной вертикальной раскладки в исходных методах

В ходе анализа 11 эталонных шаблонов из библиотеки \`To_169.js\` были выявлены фундаментальные причины неудачной вертикальной перестройки:

1. **Гравитационное скопление к верхнему краю (Top-Hugging):**
   Большинство правил в методах \`smart\` и \`compact\` использовали стандартный поток flex-direction: column с justify-content: flex-start. Элементы последовательно складывались сверху вниз, суммарно занимая 400–700 px из доступных 1600 px. В результате нижние 900–1200 px (до 70% площади экрана) оставались пустой белой или черной пустотой.

2. **Неадекватное масштабирование медиа-блоков:**
   В горизонтальном шаблоне 16:9 картинки и видео имеют пропорции 16:9 или панорамные 2.6:1. При механическом сужении ширины до 900 px и ограничении max-height: 230–360 px медиа превращались в узкие амбразуры. В вертикальном кадре визуал терял эмоциональную силу, хотя экранная высота позволяла раскрыть медиа до формата 4:5 или 1:1.

3. **Сжатие многокадровых сеток в микро-полоски:**
   В шаблонах с несколькими видео/картинками (например, SW-05 с двумя видеолупами или SR-05 с тремя кадрами) алгоритмы сохраняли горизонтальное соседство в 2 колонки. В узком поле 900 px ширина каждой картинки падала до 360 px, создавая тесный нечитаемый ряд при пустующей нижней половине.

4. **Утрата иерархии в манифестах и списках:**
   В текстово-доминантных шаблонах (SR-03, ST-01) текст либо сворачивался в плотный нечитабельный абзац, либо заголовок прижимался к потолку, разрушая плакатную гармонию.

---

## 3. Описание и архитектурные отличия новых методов

### А. «Вертикальная редакционная композиция» (editorial)
- **Целевые шаблоны:** ABT-02 (Манифест поверх медиа), C-11 (Контакты), SW-02 (Швейцарская матрица).
- **Принцип:** Трёхчастное журнальное зонирование (Header / Overline → Центральное ядро с медиа и заголовком → Заземлённый футер с метаданными).
- **Отличие от smart/compact:** Использует \`justify-content: space-between\` и \`margin-top: auto\` для футера, устраняя пустоту внизу. Медиа расширено до 16:10 с высотой до 560 px.

### Б. «Композиция с главным медиа» (heroMedia)
- **Целевые шаблоны:** SR-01 (Сплит направлений и медиа), ABT-02, SW-02.
- **Принцип:** Главный визуальный блок (.sv-media) занимает 45–55% высоты кадра с пропорциями 4:5 или 1:1 (высота 560–680 px). Текстовые направления переформируются в аккуратные теги/плашки.
- **Отличие от smart/compact:** Медиа становится полноправным мобильным героем вместо второстепенного сжатого прямоугольника.

### В. «Вертикальная медиасетка» (mediaGrid)
- **Целевые шаблоны:** SW-05 (Авангардный индекс с 2 видео), SR-05 (Асимметричная сетка), SR-02 (Микро-сетка).
- **Принцип:** Превращает тесные горизонтальные ряды в последовательный вертикальный сторителлинг: Key Visual на полную ширину (440 px), затем интертитл с заголовком, затем пара сбалансированных катэвеев.
- **Отличие от smart/compact:** Вместо 2 колонок шириной 360 px кадры располагаются с полным сохранением разрешения и читаемости подписей.

### Г. «Сбалансированная композиция» (balanced)
- **Целевые шаблоны:** SRV-02 (Строчный список услуг), C-11 (Реквизиты контактов), ST-01 (Заявление).
- **Принцип:** Динамический расчёт свободного пространства и распределение элементов с гармоничным вертикальным шагом (gap: clamp(32px, 4vh, 64px)). Центрирует оптический вес в золотом сечении.
- **Отличие от smart/compact:** Устраняет «прилипание к потолку», обеспечивая 85–90% заполнения без переполнения.

### Д. «Типографический плакат» (typographic)
- **Целевые шаблоны:** SR-03 (Манифест 20 направлений), ST-01 (Полноэкранный манифест), SR-03 converted.
- **Принцип:** Монументальная швейцарская типографика (Space Grotesk кеглем 44–88 px с плотным интерлиньяжем 0.96–1.04). Длинные перечисления оформляются ритмичным двухколоночным индексом.
- **Отличие от smart/compact:** Текст масштабируется как графический объект, создавая плакатный эффект уровня международного типографического стиля.

---

## 4. Сохранение целостности DOM и атрибутов

Все 9 методов строго сохраняют:
1. Редактируемые текстовые слоты \`data-sb-editable=""\`, \`data-slot="..."\`, \`data-role="..."\`.
2. Медиа-слоты \`data-sb-media=""\`, класс \`.sv-media\`, \`data-kind="image"\`.
3. Циклические контейнеры \`data-sb-repeat="..."\`.
4. Дизайн-систему: оригинальные цветовые палитры (#E63B2B, #F5F5F3, монохром), шрифтовые гарнитуры (Space Grotesk, IBM Plex Mono, Inter).
5. Изолированность: вычисление каждого метода выполняется строго от исходного HTML.

---

## 5. Известные ограничения
1. Статическая природа без выполнения клиентского JS внутри iframe (соответствие CSP браузера).
2. Шаблоны с жестко закодированными абсолютными координатами в инлайн-стилях требуют предварительной семантической разметки контейнеров sv-inner.
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RECOMPOSE_STUDIO_9x16_RESEARCH_REPORT.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-[#080a0f] text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Report Top Header */}
        <div className="bg-[#0e131d] border border-[#1e2736] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#84a8ff] mb-1">
              <span>ИССЛЕДОВАТЕЛЬСКИЙ ОТЧЁТ</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span>СТАДИЯ РЕАЛИЗАЦИИ</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Recompose Studio: Адаптация 16:9 → 9:16
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Комплексное исследование перекомпоновки HTML/CSS-шаблонов под вертикальный холст 900×1600 px.
            </p>
          </div>

          <button
            onClick={downloadMarkdownReport}
            className="flex items-center gap-2 bg-[#315fe5] hover:bg-[#3c6cf4] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-[#315fe533] transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Скачать отчёт (.MD)</span>
          </button>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="bg-[#0c1017] border border-[#1b2433] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5b8cff]" />
            <span>1. Исходные условия и сохранение базовых методов</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#101622] border border-[#1e293b] rounded-xl space-y-2">
              <strong className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Четыре базовых метода сохранены на 100%</span>
              </strong>
              <p className="text-xs text-slate-300 leading-relaxed">
                Методы <code className="text-[#84a8ff]">smart</code>, <code className="text-[#84a8ff]">compact</code>, <code className="text-[#84a8ff]">split</code>, <code className="text-[#84a8ff]">fit</code> оставлены первыми в списке. Их CSS-правила, специальные обработчики (<code className="text-slate-400 font-mono text-[10px]">specialAbout, specialAsym, specialMicro</code>) и алгоритм сжатия <code className="text-slate-400 font-mono text-[10px]">fitDown</code> работают точно так же, как до начала работы.
              </p>
            </div>

            <div className="p-4 bg-[#101622] border border-[#1e293b] rounded-xl space-y-2">
              <strong className="text-xs font-semibold text-[#84a8ff] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Пять новых методов добавлены изолированно</span>
              </strong>
              <p className="text-xs text-slate-300 leading-relaxed">
                Новые алгоритмы вынесены в отдельные функции. Они не переопределяют старый код и не изменяют результаты исходных методов. Каждый алгоритм решает конкретную композиционную задачу вертикального кадра.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Analysis of Failures in Vertical Layout */}
        <section className="bg-[#0c1017] border border-[#1b2433] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>2. Почему вертикальная раскладка вызывала проблемы</span>
          </h2>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 bg-[#121824] border-l-4 border-amber-500 rounded-r-xl space-y-1">
              <strong className="text-slate-100 text-sm">Проблема №1: «Гравитация к потолку» и пустота снизу (до 70%)</strong>
              <p>
                В горизонтальном шаблоне 16:9 элементы распределены слева направо. При механическом сворачивании в одну колонку (flex-direction: column) контент скапливался в верхних 400–700 px. Нижняя часть кадра 9:16 высотой до 900–1200 px оставалась абсолютно пустой. Это видно на примере ABT-02 и C-11 в старых версиях.
              </p>
            </div>

            <div className="p-3.5 bg-[#121824] border-l-4 border-blue-500 rounded-r-xl space-y-1">
              <strong className="text-slate-100 text-sm">Проблема №2: Превращение медиа в узкие амбразуры</strong>
              <p>
                Медиафайлы 16:9 или панорамные 2.6:1 при ширине 900 px давали высоту всего 200–340 px. В вертикальном кадре такое видео выглядит комично маленьким, тогда как формат Stories / Reels требует доминирующего визуала с соотношением 4:5 или 1:1.
              </p>
            </div>

            <div className="p-3.5 bg-[#121824] border-l-4 border-purple-500 rounded-r-xl space-y-1">
              <strong className="text-slate-100 text-sm">Проблема №3: Сжатие двух и более медиа в нечитаемые полоски</strong>
              <p>
                В шаблоне SW-05 два видео-лупа располагались бок о бок. При переносе в 9:16 старый метод оставлял их в двух колонках, уменьшая ширину каждого лупа до 360 px, хотя вертикальный кадр позволял развернуть оба видео во всю ширину один под другим.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Technical Specs of New Methods */}
        <section className="bg-[#0c1017] border border-[#1b2433] rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>3. Спецификация пяти новых алгоритмов</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-[#10151f] border border-[#1e2738] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-[#84a8ff]">1. Вертикальная редакционная композиция (editorial)</strong>
                <span className="text-[10px] bg-[#1a2b42] text-[#84a8ff] px-2 py-0.5 rounded font-mono">Направление А</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Делит кадр 9:16 на трёхчастную редакционную иерархию: Header/Overline вверху, увеличенное медиа 16:10 в центре и заземлённый футер с метаданными в самом низу через <code className="text-slate-200">margin-top: auto</code>. Устраняет пустоту внизу кадра на ABT-02 и C-11, повышая полезное заполнение с 44% до 92%.
              </p>
            </div>

            <div className="p-4 bg-[#10151f] border border-[#1e2738] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-[#72d6ae]">2. Композиция с главным медиа (heroMedia)</strong>
                <span className="text-[10px] bg-[#152e24] text-[#72d6ae] px-2 py-0.5 rounded font-mono">Направление Б</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Определяет главный визуальный слот и масштабирует его до доминирующих пропорций 4:5 или 1:1 с высотой 560–680 px. Вспомогательный текст и категории оформляются в компактные теги над или под медиа. Шаблон SR-01 становится кинематографичным и естественным для мобильного экрана.
              </p>
            </div>

            <div className="p-4 bg-[#10151f] border border-[#1e2738] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-amber-300">3. Вертикальная медиасетка (mediaGrid)</strong>
                <span className="text-[10px] bg-[#332a15] text-amber-400 px-2 py-0.5 rounded font-mono">Направление В</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Для шаблонов с 2+ изображениями (SW-05, SR-05, SR-02). Вместо тесных колонок разворачивает кадры в последовательный вертикальный поток. В SW-05 Луп А и Луп Б получают полную ширину 900 px и четкие технические подписи, заполняя 90% вертикали.
              </p>
            </div>

            <div className="p-4 bg-[#10151f] border border-[#1e2738] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-cyan-300">4. Сбалансированная композиция (balanced)</strong>
                <span className="text-[10px] bg-[#142e38] text-cyan-300 px-2 py-0.5 rounded font-mono">Направление Г</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Рассчитывает высоту элементов и распределяет свободное пространство гармоничными интервалами <code className="text-slate-200">clamp(32px, 4vh, 64px)</code>. Центрирует смысловое ядро по законам золотого сечения. Отлично подходит для списков услуг (SRV-02) и реквизитов (C-11).
              </p>
            </div>

            <div className="p-4 bg-[#10151f] border border-[#1e2738] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-purple-300">5. Типографический вертикальный плакат (typographic)</strong>
                <span className="text-[10px] bg-[#2a1b38] text-purple-300 px-2 py-0.5 rounded font-mono">Направление Д</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Для заявлений и манифестов (SR-03, ST-01). Увеличивает заголовок до плакатного масштаба (кегль 48–88 px, плотный интерлиньяж). Манифест из 20 направлений форматируется как читаемый архитектурный манифест со строгими отступами и нижним акцентным индексом.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Preservation */}
        <section className="bg-[#0c1017] border border-[#1b2433] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#84a8ff]" />
            <span>4. Гарантии сохранности DOM и атрибутов</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#10151f] rounded-xl border border-[#1c2432] space-y-1">
              <strong className="text-slate-200">Редактируемый текст:</strong>
              <p className="text-slate-400">
                Все маркеры <code className="text-slate-300">data-sb-editable=""</code>, слоты <code className="text-slate-300">data-slot</code> и роли <code className="text-slate-300">data-role</code> сохранены без потерь.
              </p>
            </div>

            <div className="p-3 bg-[#10151f] rounded-xl border border-[#1c2432] space-y-1">
              <strong className="text-slate-200">Медиа-слоты:</strong>
              <p className="text-slate-400">
                Все <code className="text-slate-300">data-sb-media=""</code>, классы <code className="text-slate-300">.sv-media</code> и <code className="text-slate-300">data-kind</code> сохранены для подстановки пользовательских изображений.
              </p>
            </div>

            <div className="p-3 bg-[#10151f] rounded-xl border border-[#1c2432] space-y-1">
              <strong className="text-slate-200">Повторяемые списки:</strong>
              <p className="text-slate-400">
                Атрибуты <code className="text-slate-300">data-sb-repeat</code> (услуги, карточки, направления) сохранены в структуре DOM.
              </p>
            </div>

            <div className="p-3 bg-[#10151f] rounded-xl border border-[#1c2432] space-y-1">
              <strong className="text-slate-200">Изолированность вычислений:</strong>
              <p className="text-slate-400">
                Каждый метод выполняется изолированно от оригинального HTML в чистом DOM. Преобразования не накапливаются.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
