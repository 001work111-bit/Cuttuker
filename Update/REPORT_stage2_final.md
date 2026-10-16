# PMS — завершение этапа 2 интеграции Sandbox

Эталон: GitHub `001work111-bit/Cuttuker/Sandbox` (клонирован, Sandbox не изменялся).
Пакет: `PMS_stage2_final.zip` (12 файлов, пути `PMS/...`). Тест: `stage2_adapt_inspector_test.py`.

## 1. Что изменено

| Файл | Изменение |
|---|---|
| `js/adaptation/recompose-core.js` | Побайтно из `Sandbox/recompose-core.js` (эталон). |
| `js/adaptation/formats-registry.js` | Новый. Блок `SB_FORMATS`, `SB_FORMAT`, `SB_syncFormats` — дословно из Sandbox. Единый реестр, второго нет. |
| `index.html` | Подключён `formats-registry.js` сразу после `recompose-core.js`. |
| `js/adaptation/pano-adaptation.js` | Капсулы форматов (6 шт.); капсулы методов с кодами `RC_SHORT_CODES` (дословно из Sandbox, 19 записей); полное имя, ID и описание в подсказке; точки статуса считаются сразу (`probeAll`); ключ статуса = шаблон + формат источника + метод + целевой формат + приложение + сценарий + хэш; авто-подмена метода при смене формата удалена; несовместимый метод показывается явно и не применяется. |
| `js/adaptation/pano-adaptation.js` (formats) | Жёсткий список «не поддерживается» для 4:5/5:6 удалён: форматы берутся из реестра. |
| `adaptation-modules/{compact,fit,smart,split}/module.json` | Побайтно из Sandbox (добавлены 4:5, 5:6). |
| `adaptation-modules/manifest.js` | Пересобран `tools/build-adaptation-manifest.js`. |
| `js/templates/library-inspector.js`, `js/templates/template-library-merge.js` | Были подключены в `index.html`, но не входили в прошлые архивы. Теперь включены. |
| `js/templates/template-browser.js` | Из фильтра формата убрана кнопка «Все»; возврат к «Все» через «Снять все». |

Модули (19 папок), общие библиотеки (6) и `module.js` не менялись.
Не переносились: `motion-converter.js`, `frame-contract.js`, `library-audit.js`, `library-repair.js`.

## 2. Команды и результаты

- `node --check` для всех изменённых JS — OK.
- Проверка `script src` в `index.html` — отсутствующих файлов нет.
- `node tools/build-adaptation-manifest.js --verify /home/user/work/Cuttuker_pms_main/Sandbox`
  — ожидаемо расходится (рабочая копия Sandbox устарела; сверка делалась до этого шага).
- `node tools/build-adaptation-manifest.js --verify /tmp/gh_cut/Sandbox` — 65 файлов совпадают.
- `python3 stage2_adapt_inspector_test.py` (Playwright, Chromium 156, HTTP-сервер PMS) — **27/27 PASS**:
  - 19 модулей загружено; шесть форматов, у всех `adapt=true`;
  - методов на формат: 16:9 — 4, 9:16 — 19, 4:5 — 4, 5:6 — 4, 1:1 — 4, 4:3 — 4 (совпадает с эталоном);
  - капсулы форматов — 6 штук; подписи методов — `SM-001`, `CP-001`, `FT-001`, `SP-001`, «Исходник»;
  - точки статуса рассчитаны без нажатия на капсулу (все `st-ok`);
  - смена 16:9→9:16 не меняет выбранный метод (`smart` сохранён);
  - несовместимый `iface-smart` для 16:9: явное сообщение, результат не применяется, выбор сохранён;
  - адаптация: compact→9:16 (900×1600), compact→1:1 (1200×1200), compact→4:5 (1280×1600), compact→5:6 (1333×1600), smart→9:16 (900×1600), все со статусом ok;
  - исходный HTML шаблона не изменён; pageerror = 0.

Electron в песочнице не запускался (нет Electron и Xvfb). Тест выполнен в Chromium, а не в Electron.

## 3. Не проверено

- Electron-запуск и визуальное сравнение с Sandbox по скриншотам.
- Вставка результата в таймлайн («Применить» / «Вставить после») — не тестировалась в этом прогоне.
- Сохранение и повторное открытие проекта с адаптированным блоком — не тестировалось.
- Ручная проверка вида капсул и подсказок в инспекторе блока и шаблона.
- Повторный прогон старых тестов библиотеки (`browser_test.py`) после правок — не выполнялся.
- Перенос `motion-converter.js` / `frame-contract.js`: по ТЗ не переносились без конкретного разрыва контракта; разрыв не выявлен тестами.
- Пересборка `Sandbox`-сверки относительно GitHub выполнена, но сама рабочая копия Sandbox в workspace устарела и не использовалась как эталон.
