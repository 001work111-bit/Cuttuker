# Тесты адаптации шаблонов (браузер, Playwright)

Нужны: `pip install playwright` и `python3 -m playwright install chromium`.
Запуск (URL — путь к index.html через file://):

    python3 tests/adaptation/t1_basic.py    file://$PWD/index.html   # загрузка методов, селекторы, без накопления
    python3 tests/adaptation/t2_flows.py    file://$PWD/index.html   # библиотека, таймлайн, overlay, сохранение, Ctrl+колесо
    python3 tests/adaptation/t3_timeline.py file://$PWD/index.html   # Undo/Redo блока, вставка, сохранение, повторная адаптация
    python3 tests/adaptation/t5_persist.py  file://$PWD/index.html   # экспорт user.js, импорт, метаданные блока
    python3 tests/adaptation/t6_registry.py file://$PWD/index.html   # реестр: 4 метода из файлов, совместимость, css-groups один раз
    python3 tests/adaptation/t4_module.py   <URL копии с тестовым модулем>  # см. ниже
    node tests/adaptation/check-manifest-vs-sandbox.js <путь/к/Sandbox>  # манифест = Sandbox.buildManifest

t4 проверяет подключение нового модуля без правки основного кода. Тестовый модуль
«testcenter» в поставку не входит: создайте копию проекта, добавьте папку
adaptation-modules/testcenter/ (module.json + module.js), выполните
`node tools/build-adaptation-manifest.js` в копии и передайте её index.html в t4.

Каждый скрипт печатает OK/FAIL по проверкам и итог.
