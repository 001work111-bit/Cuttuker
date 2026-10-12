# Pano Montage Studio — Stage 2 Flat Image Cleanup

Это cleanup-pass поверх рабочего Stage 2 flat-image mode.

## Что изменено
- source-state нормализован в единый объект `project.source`;
- pano и flat image больше не держатся разрозненно по `project` и `state`;
- history snapshots теперь сохраняют нормализованный source-state;
- добавлен `commitHistory()` для точечных post-action checkpoint'ов flat-image режима;
- flat-image actions теперь аккуратнее коммитят undo/redo:
  - переключение source type
  - выбор flat-image source
  - reset view
  - drag pan
  - wheel zoom
  - открытие gallery asset в flat-view
  - добавление новых flat-image файлов
- JSON export/import получил стабильный блок `source` с backward-compatible чтением старого формата.

## Что сохранено
- весь рабочий Stage 2 UX сохранён;
- pano workflow сохранён;
- capture / monitor / timeline / titles / draw не удалялись;
- старые JSON поля всё ещё читаются при импорте.

## Новые ключевые внутренние точки
- `js/core/state.js` — normalized source model и helper API;
- `js/core/history.js` — source-aware snapshots и `commitHistory()`;
- `js/viewers/image-viewer.js` — flat-image logic переведена на normalized source state;
- `js/viewers/pano-viewer.js` — capture metadata и pano state теперь используют source helpers;
- `js/export/export-ae.js` — JSON version 11 + `source` block + legacy fallback import.
