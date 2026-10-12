import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
ok = []
def check(n, c, i=""):
    ok.append(c); print(("OK   " if c else "FAIL ") + n + ((" — " + str(i)) if i != "" else ""), flush=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={"width":1600,"height":950}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.goto(URL)
    pg.wait_for_function("window.PMS_ADAPTATION_LOADER && PMS_ADAPTATION_LOADER.isReady()", timeout=20000)
    mods = pg.evaluate("PMS_ADAPT.modules()")
    check("новый модуль зарегистрирован без правки основного кода", "testcenter" in mods, mods)
    check("манифест не содержит ошибок", pg.evaluate("PMS_ADAPTATION_LOADER.errors().length") == 0, pg.evaluate("PMS_ADAPTATION_LOADER.errors()"))
    m = pg.evaluate("PMS_ADAPT.methods('1:1','library','16:9').map(x=>x.id)")
    check("для 1:1 появился в списке методов", "testcenter" in m, m)
    m2 = pg.evaluate("PMS_ADAPT.methods('4:3','library','16:9').map(x=>x.id)")
    check("для 4:3 не появился (не объявлен)", "testcenter" not in m2, m2)
    tid = pg.evaluate("ensureProjectTemplateLibrary().templates[0].id")
    pg.evaluate("(id)=>{state.selectedTemplateIds=[id];state.activeTemplateId=id;state.templateAnchorId=id;setInspOpen(true);setInspTab('template');renderInspector()}", tid)
    pg.wait_for_selector("#itplAMth")
    pg.select_option("#itplAFmt", "1:1")
    opts = pg.eval_on_selector_all("#itplAMth option", "els=>els.map(e=>e.value)")
    check("в селекторе инспектора есть testcenter", "testcenter" in opts, opts)
    pg.select_option("#itplAMth", "testcenter")
    pg.wait_for_function("(()=>{const e=document.querySelector('#itplAdapt [data-adapt=status]');return e && !/Расчёт/.test(e.textContent)})()", timeout=90000)
    st = pg.inner_text("#itplAdapt [data-adapt=status]")
    check("тестовый метод считается и показывает предпросмотр", pg.locator("#itplAdapt .adaptPreviewFrame").count() == 1 and "Тестовый" in st, st)
    check("без ошибок страницы", not errs, errs)
    b.close()
print("ИТОГО:", sum(ok), "/", len(ok))
