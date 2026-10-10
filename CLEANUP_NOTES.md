# Cleanup notes

Минимальный cleanup-pass сделан специально без изменения UX и логики.

## Технические изменения
1. Удалены дубли из `js/core/state.js`:
   - `cutSelectedBlock`
   - `mergeSelectedBlocks`
   - `audioBlockPointer`
   - `onAudioPointerMove`
   - `audioBlockAtG`
   - `selectedAudioBlock`
   - `normalizedAnimSpeed`
   - `animSpeedValue`

2. Эти функции теперь живут в `js/timeline/timeline.js`.

3. Добавлен namespace `window.PMS` с регистрацией модулей.

## Зачем это нужно
- чтобы дальше не править одну функцию в одном файле, а использовать другую одноимённую из другого;
- чтобы следующие этапы менять в предсказуемых точках;
- чтобы снизить риск случайных поломок при добавлении template/runtime логики.
