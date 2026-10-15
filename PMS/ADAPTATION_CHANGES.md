# Журнал изменений: интеграция адаптации Sandbox v8 в PMS

База сравнения: исходный PMS до интеграции v8 (`PMS_before_v8`).

## Добавлено

- `adaptation-modules/` — 19 модулей-папок (`module.json` + `module.js`) из v8: `smart`, `split`, `compact`, `fit`, `claud1-balanced`, `claud1-editorial`, `claud1-typographic`, `gemini-balanced`, `gemini-editorial`, `gemini-hero-media`, `gemini-media-grid`, `gemini-typographic`, `grok-balanced`, `grok-editorial`, `grok-hero`, `iface-smart`, `iface-split`, `v3011-hero`, `v3011-type`.
- `adaptation-modules/_shared/lab/` — 5 файлов; `adaptation-modules/_shared/css-groups.js`.
- `tests/adaptation/check-manifest-vs-sandbox.js`, `ADAPTATION_CHANGES.md`.

## Заменено

- `adaptation-modules/manifest.js` — пересобран `tools/build-adaptation-manifest.js` (6 библиотек, 19 модулей). Вручную не правился.
- `js/adaptation/recompose-core.js` — взят из v8 по согласованному diff; `cmp` с v8 совпадает.
- `tests/adaptation/t1_basic.py`, `tests/adaptation/t6_registry.py` — обновлены под 19 модулей (см. ниже).

## Изменено точечно

- `js/adaptation/pano-adaptation.js` — `formats()` возвращает `w,h`; добавлены `designSize(t)`, `fitRcStage`, `fitRcStages`, `startRcObserver`; предпросмотр масштабирует сцену по ширине рамки, без полей внутри HTML.
- `js/ui/layout.js` — размеры через `PMS_ADAPT.designSize(t)`; `designW` результата = рабочая сцена, `canvas` = контракт.
- `js/templates/template-browser.js` — плитки и stage через `tplDesignSize(t)`.
- `js/templates/template-instance.js` — `templateBlockDesign` для предпросмотра без 1600/900 по умолчанию; дефолты через `PMS_ADAPT.designSize`.
- `js/core/state.js` — импорт метаданных Sandbox: `sandboxRecomposeInfo`, `sandboxRecomposeAdaptation`; в `normalizeTemplateItem` — формат, контракт и рабочая сцена из `recompose`/`recomposeFrame`/`frameContract`, `adaptation.sourceHtml` из `recompose_orig`. Срабатывает только при наличии `recompose_orig`.

## Тесты

- `t1_basic.py`: список модулей читается из папки (не фиксирован); «9:16 — совместимы» = все модули папки; сравнение предпросмотра с прямым расчётом не учитывает атрибуты `style` (браузер пересериализует их после установки масштаба).
- `t6_registry.py`: эталон дескрипторов собирается из папки `adaptation-modules`; исправлена опечатка в генераторе (`m` вместо `d`).
- Ожидание 4 методов заменено на 19 (полный набор).

## Не изменено (намеренно)

- Алгоритмы методов и ядро сверх diff; Sandbox; Electron и способ запуска.
- `js/adaptation/adaptation-loader.js`; галерея и инспекторы (кроме геометрии кадра).
- `state.js:240–241, 281–282, 461–463` (дефолты 1920/1080) — без проверяемого дефекта.
- Сохранённые шаблоны библиотеки (`designW`, `canvas`) — массового переписывания нет.

## Известные расхождения и отложенное

- Sandbox v8: возможная гонка формата в очереди `rcRun` (наблюдение по коду, не воспроизведено).
- Плитка галереи и блок таймлайна: не проверены автоматически.
