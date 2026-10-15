# gemini-media-grid

- Метод лаборатории: `gemini.mediaGrid` — «Вертикальная медиасетка»
- Семейство: Gemini Cool
- Исходник в репозитории: add-916-adaptation-methods_Gemini Cool/src/algorithms/recompose.ts
- Исходный locator в index.html: index.html · script-блок «fam_gemini» (GEMINI) · GEMINI.METHOD_MAP["mediaGrid"] → applyNewMethodRules
- Вход: исходный шаблон 16:9 (`ctx.t.html`). Выход: 9:16 (кадр 900×1600).
- Зависимости: `_shared/lab/gemini.js` (дословные тела функций лаборатории).
- Отличие от лаборатории: результат метода идентичен `GEMINI.convertTemplate` (побайтно, 9 шаблонов). Опция интерфейса «Типографика источника» (`restoreSourceTypography`, по умолчанию включена в интерфейсе) в модуль **не входит** — см. REPORT.md, раздел «Ограничения».
