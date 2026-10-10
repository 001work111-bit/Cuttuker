# Flat image cleanup pass

## Смысл pass
Это не новая пользовательская фича, а техническая стабилизация Stage 2.

## Что теперь лучше
- source model хранится единообразно в `project.source`:
  - `type`
  - `pano.activeId / yaw / pitch / fov`
  - `image.activeId / scale / posX / posY`
- flat-image undo/redo стало предсказуемее за счёт `commitHistory()` после завершённых действий;
- JSON export/import теперь имеет отдельный `source` block и при этом всё ещё читает legacy поля Stage 2:
  - `sourceType`
  - `activePanoId`
  - `activeFlatImageId`
  - `flatView`
  - `panoView`

## Практический эффект
Эта база лучше подготовлена для следующих этапов:
- keyframes для flat image
- zoom/pan presets
- source animation
- более глубокие source transitions / export improvements
