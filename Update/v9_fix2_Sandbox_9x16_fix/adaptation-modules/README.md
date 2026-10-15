# Модули адаптации

Каждый метод адаптации — отдельная папка `adaptation-modules/<id>/`:

- `module.json` — **описание** (ID, название, версия, описание, исходные и целевые форматы, приложения,
  порядок, совместимость с движком). Главный процесс читает его как обычный JSON; код не выполняется.
- `module.js` — **код**: собственная логика `adapt(ctx)` и CSS-блоки, регистрируется через
  `RecomposeCore.adaptation.implement(id, {css, adapt})`.
- `README.md` — необязательное краткое описание для людей.

Папки, начинающиеся с `_` (сейчас `_shared/`), — общие библиотеки: их `.js` подключаются до модулей
и методами не являются.

## Состав (поставка)
| id | Название | Формат | Приложения | Логика |
|---|---|---|---|---|
| `smart` | Реконструкция по ролям | 16:9 → 16:9 | Sandbox | `ctx.smartStructure()`, CSS smart/split, подгонка при переполнении (7) |
| `compact` | Адаптивная сетка | 16:9 → 16:9 | Sandbox | `ctx.unwrap()`, CSS compact/fit, подгонка при переполнении (7) |
| `split` | Редакционный split | 16:9 → 16:9 | Sandbox | `ctx.smartStructure()`, CSS smart/split + split, подгонка при переполнении (7) |
| `fit` | Контрольный safe-fit | 16:9 → 16:9 | Sandbox | `ctx.unwrap()`, CSS compact/fit + fit, подгонка всегда (12) |

## module.json (стандарт)
```json
{
  "id": "my-method",
  "name": "Название метода",
  "version": "1.0.0",
  "description": "Что делает метод",
  "sourceFormats": ["16:9"],
  "targetFormats": ["16:9", "9:16"],
  "apps": ["Sandbox"],
  "scenarios": ["library", "timeline"],
  "order": 10,
  "engineApi": 1,
  "titleRole": false,
  "markup": ["[data-sb-editable]"]
}
```
- `id` — строчные латинские буквы, цифры, дефис; 2–40 символов; уникален.
- `version` — `x.y.z`. Повтор того же `id` с той же версией пропускается; с другой версией — ошибка.
- `sourceFormats` — форматы исходника (`16:9`); `targetFormats` — массив форматов результата (`16:9`, `9:16`, `1:1`, `4:3` и др.). Метод показывается только для совпавшего формата.
- `scenarios` — где метод доступен: `library` (инспектор шаблона до добавления на таймлайн), `timeline` (инспектор блока). Необязательно; по умолчанию оба.
- `apps` — `"Sandbox"` и/или `"Pano Montage Studio"`.
- `engineApi` — **обязательно `1`**: версия API движка, для которой написан модуль. Другое значение — модуль отклоняется.
- `markup` — маркеры разметки, на которые опирается модуль (для документации и диагностики).
- `titleRole` — необязательно; `true`, если диагностика должна проверять роль title.

## module.js (контракт)
```js
(function(){
  window.RecomposeCore.adaptation.implement('my-method', {
    css: {
      head: function(layout){ return ''; },   // необязательно: CSS до блоков раскладок
      tail: function(layout){ return ''; }    // необязательно: CSS после блоков раскладок
    },
    adapt: async function(ctx){
      // собственная логика метода на DOM ctx.doc
      const sec = ctx.pickRoot();
      await ctx.raf2();
      return { layout: 'generic', fit: { factor: 1, overflow: ctx.checkOverflow() } };
    }
  });
})();
```
`ctx` (предоставляет движок; сам алгоритм движка не копируется в модуль):
- `doc`, `t` (шаблон), `fmt` (формат), `method` (id), `shared` (общие CSS из `_shared`);
- `pickRoot()` — корневая секция; `unwrap()` — распаковка формата; `smartStructure()` — распознавание ролей;
- `checkOverflow()` — список переполнений; `fitDown(limit)` — контрольное уменьшение;
- `applyCss(layout)` — применить CSS метода; `raf2()` — ожидание кадров.

`adapt` возвращает `{layout, fit}`. После него движок делает финальный кадр и проверку переполнения.
Модуль не должен использовать `eval`, `new Function` и интерфейс Sandbox.

## Добавить новый метод (без правки основного кода)
1. Создать папку `adaptation-modules/<id>/` с `module.json` и `module.js`.
2. Для Sandbox в Electron-сборке папка сканируется главным процессом при старте.
   В браузерной версии (`file://`) список модулей берётся из манифеста: см. раздел «Браузерная версия» ниже.
3. Выбрать формат: метод появится в списке «Метод адаптации», если совпали `targetFormats`, `apps` и `scenarios`.

Ошибочная папка не останавливает остальные: причина попадает в `RecomposeCore.adaptation.errors()`,
в манифест (`adaptation.errors`) и в консоль. Ошибки: битый JSON, нет `module.js`, `engineApi` не `1`,
неверные поля, ошибка при загрузке кода, отсутствие `implement`, конфликт `id`.

## Ограничения
- Автоматическое обнаружение работает в Electron: `main.js` перечисляет папку и передаёт список файлов в окно.
- В обычном браузере (`file://`) папку перечислить нельзя: видны только методы, подключённые вручную
  или через манифест. Это не путь поставки.
- Подпапки внутри модуля не сканируются: код только `module.js` в корне папки модуля.

## Pano Montage Studio (контракт; сама Pano не изменена)
Порядок: `recompose-core.js` → `_shared/css-groups.js` → модули. Приложение задаёт себя:
`RecomposeCore.adaptation.setApp('Pano Montage Studio')` и берёт методы через
`RecomposeCore.adaptation.list(format, app)`. Совместимость Pano не проверена; модули объявлены только для Sandbox.

## Браузерная версия Pano (`file://`)
Браузер не умеет перечислять папки, поэтому список модулей пишется файлом `adaptation-modules/manifest.js`
скриптом `tools/build-adaptation-manifest.js` (запуск: `node tools/build-adaptation-manifest.js`).
Приложение подключает модули обычным `<script src>`, без `fetch`, `eval` и `new Function`.

Что это значит на практике:
- новый модуль попадает в Pano после **пересборки манифеста** (одна команда), без правки HTML и кода приложения;
- сама папка, появившаяся без пересборки, браузером не обнаруживается — её не будет в списке;
- ошибки разбора `module.json`, отсутствие `module.js`, неверный `engineApi` попадают в `PMS_ADAPTATION_LOADER.errors()`.

Проверка совпадения с Sandbox: `node tools/build-adaptation-manifest.js --verify <путь/к/Sandbox>`.

