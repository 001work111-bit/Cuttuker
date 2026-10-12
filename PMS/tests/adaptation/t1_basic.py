import sys, json
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
results = []
def PMS_HASH(pg, s):
    return pg.evaluate("h=>PMS_ADAPT.hash(h)", s)
def wait_done(pg, timeout=90000):
    pg.wait_for_function("(()=>{const e=document.querySelector('#itplAdapt [data-adapt=status]');return e && !/Расчёт/.test(e.textContent)})()", timeout=timeout)
def check(name, cond, info=""):
    results.append((name, bool(cond), info))
    print(("OK   " if cond else "FAIL ") + name + ((" — " + str(info)) if info else ""), flush=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1600, "height": 950})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:300]))
    pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" else None)
    pg.goto(URL)
    pg.wait_for_function("window.PMS_ADAPTATION_LOADER && PMS_ADAPTATION_LOADER.isReady()", timeout=20000)

    # 1. загрузка модулей
    mods = pg.evaluate("PMS_ADAPT.modules()")
    check("четыре метода загружены", sorted(mods) == ["compact", "fit", "smart", "split"], mods)
    errsA = pg.evaluate("PMS_ADAPTATION_LOADER.errors()")
    check("без ошибок загрузки модулей", len(errsA) == 0, errsA)
    fm = pg.evaluate("PMS_ADAPT.formats().map(f=>f.id)")
    check("форматы: 16:9, 9:16, 1:1, 4:3", set(["16:9","9:16","1:1","4:3"]).issubset(set(fm)), fm)
    m169 = pg.evaluate("PMS_ADAPT.methods('16:9','library','16:9').map(m=>m.id)")
    m916 = pg.evaluate("PMS_ADAPT.methods('9:16','library','16:9').map(m=>m.id)")
    check("16:9 — 4 метода", len(m169) == 4, m169)
    check("9:16 — методы совместимы", len(m916) == 4, m916)

    # 2. инспектор шаблона библиотеки
    pg.evaluate("""(()=>{const lib=ensureProjectTemplateLibrary();state.selectedTemplateIds=[lib.templates[0].id];state.activeTemplateId=lib.templates[0].id;state.templateAnchorId=lib.templates[0].id;setInspOpen(true);setInspTab('template');})()""")
    pg.wait_for_selector("#itplAFmt", timeout=5000)
    tid = pg.evaluate("ensureProjectTemplateLibrary().templates[0].id")
    orig_hash = pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % tid)
    check("инспектор шаблона: селекторы формат/метод", pg.locator("#itplAFmt").count() == 1 and pg.locator("#itplAMth").count() == 1)
    check("кнопки в начальном состоянии отключены", pg.locator("#itplAdaptUpdate").is_disabled() and pg.locator("#itplAdaptCopy").is_disabled())

    # выбрать метод smart -> предпросмотр
    pg.select_option("#itplAMth", "smart")
    wait_done(pg)
    h1 = pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % tid)
    check("предпросмотр не меняет исходный шаблон", h1 == orig_hash)
    check("кнопки обновления включились", pg.locator("#itplAdaptUpdate").is_enabled() and pg.locator("#itplAdaptCopy").is_enabled())
    st1 = pg.inner_text("#itplAdapt [data-adapt=status]")
    print("     статус:", st1)

    # 3. переключение без накопления: smart -> split -> smart даёт тот же результат
    pg.select_option("#itplAMth", "split")
    wait_done(pg)
    pg.select_option("#itplAMth", "smart")
    wait_done(pg)
    html_a = pg.evaluate("document.querySelector('#itplAdapt .adaptPreviewFrame').innerHTML")
    pg.select_option("#itplAMth", "fit")
    wait_done(pg)
    pg.select_option("#itplAMth", "smart")
    wait_done(pg)
    html_b = pg.evaluate("document.querySelector('#itplAdapt .adaptPreviewFrame').innerHTML")
    check("переключение методов без накопления (повтор smart совпадает)", html_a == html_b, (len(html_a), len(html_b)))
    # прямой расчёт от исходника должен совпасть с предпросмотром
    direct = pg.evaluate("""(async()=>{const t=findTemplate(%r);const r=await RecomposeCore.convert({tpl:t.tpl,label:t.label,html:t.html},'smart',{format:'16:9'});return r.html})()""" % tid)
    check("предпросмотр = прямой расчёт от исходника", PMS_HASH(pg, html_b) == PMS_HASH(pg, direct), len(direct))

    # 4. формат 9:16 — методы обновляются, метод сохраняется если совместим
    pg.select_option("#itplAFmt", "9:16")
    wait_done(pg)
    mopts = pg.eval_on_selector_all("#itplAMth option", "els=>els.map(e=>e.value)")
    check("смена формата обновляет список методов", len(mopts) >= 2, mopts)
    fr = pg.evaluate("document.querySelector('#itplAdapt .rc-frame').getAttribute('data-rc-format')")
    check("предпросмотр в формате 9:16", fr == "9:16", fr)
    # 5. 4:3 — выбор первого совместимого при недоступности
    pg.select_option("#itplAFmt", "4:3")
    wait_done(pg)
    st = pg.input_value("#itplAMth")
    check("метод выбран из списка 4:3", st in ["smart","split","compact","fit"], st)

    print("ERRORS:", [e for e in errs if "GL Driver" not in e and "ERR_FILE_NOT_FOUND" not in e][:6])
    b.close()
fails = [r for r in results if not r[1]]
print("ИТОГО: %d/%d" % (len(results)-len(fails), len(results)))
