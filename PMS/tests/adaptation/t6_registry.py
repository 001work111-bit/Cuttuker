"""Реестр библиотеки в браузере: регистрация 4 методов из файлов, совпадение с module.json,
совместимость формат↔метод, вызов каждого метода через общий движок, одна загрузка _shared.
Использование: python3 tests/adaptation/t6_registry.py file://$PWD/index.html"""
import sys, json, os
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
ok = []
def check(n, c, i=""):
    ok.append(bool(c)); print(("OK   " if c else "FAIL ") + n + ((" — " + str(i)[:300]) if i != "" else ""), flush=True)

# эталонные дескрипторы — прямо из файлов библиотеки
disk = {}
for m in ["smart", "compact", "split", "fit"]:
    disk[m] = json.load(open(os.path.join(ROOT, "adaptation-modules", m, "module.json"), encoding="utf-8"))

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={"width": 1600, "height": 950}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.goto(URL)
    pg.wait_for_function("window.PMS_ADAPTATION_LOADER && PMS_ADAPTATION_LOADER.isReady()", timeout=20000)

    reg = pg.evaluate("""(()=>{const A=RecomposeCore.adaptation;return A.ids().map(id=>{const d=A.get(id);return {id,name:d.name,version:d.version,targetFormats:d.targetFormats,sourceFormats:d.sourceFormats,apps:d.apps,scenarios:d.scenarios,order:d.order,engineApi:d.engineApi,hasAdapt:typeof d.adapt==='function',frozen:Object.isFrozen(d)}})})()""")
    ids = [r["id"] for r in reg]
    check("зарегистрированы ровно четыре метода", sorted(ids) == ["compact", "fit", "smart", "split"], ids)
    for r in reg:
        d = disk[r["id"]]
        check(f"{r['id']}: дескриптор совпадает с module.json на диске",
              all(r.get(k) == d.get(k) for k in ["name", "version", "targetFormats", "sourceFormats", "apps", "order", "engineApi"]) and r["hasAdapt"] and r["frozen"],
              {k: (r.get(k), d.get(k)) for k in ["version", "targetFormats", "apps"] if r.get(k) != d.get(k)})
    fmts = pg.evaluate("PMS_ADAPT.formats().map(f=>f.id)")
    check("форматы читаются из движка (16:9, 9:16, 1:1, 4:3)", set(["16:9","9:16","1:1","4:3"]) <= set(fmts), fmts)
    for f in ["16:9", "9:16", "1:1", "4:3"]:
        exp = sorted(m for m in disk if f in disk[m]["targetFormats"])
        got = sorted(pg.evaluate("(f)=>PMS_ADAPT.methods(f,'library','16:9').map(m=>m.id)", f))
        check(f"совместимость {f}: методы = targetFormats из module.json", got == exp, (got, exp))
    # вызов каждого метода через общий движок (не через интерфейс)
    for m in ["smart", "compact", "split", "fit"]:
        r = pg.evaluate("""async(m)=>{const t=ensureProjectTemplateLibrary().templates[0];const x=await RecomposeCore.convert({tpl:t.tpl,label:t.label,html:t.html},m,{format:'16:9'});return {status:x.status,method:x.method,hasHtml:!!x.html,rc:x.html.indexOf('rc-frame')>=0,err:x.error}}""", m)
        check(f"{m}: вызов через RecomposeCore.convert", r["method"] == m and r["hasHtml"] and r["rc"] and r["status"] in ("ok", "warning") and not r["err"], r)
    # один механизм: в index.html нет прямого <script> на css-groups, загрузчик грузит его ровно один раз
    static_tags = pg.evaluate("[...document.querySelectorAll('script[src*=\"css-groups\"]')].filter(s=>!s.dataset.adaptation).length")
    loader_libs = pg.evaluate("PMS_ADAPTATION_LOADER.libraries().filter(x=>/css-groups/.test(x)).length")
    check("css-groups: тег без метки загрузчика в HTML отсутствует", static_tags == 0, static_tags)
    check("css-groups: загрузчик подключил библиотеку ровно один раз", loader_libs == 1, loader_libs)
    libs = pg.evaluate("PMS_ADAPTATION_LOADER.errors()")
    check("ошибок загрузки библиотеки нет", not libs, libs)
    check("без ошибок страницы", not errs, errs)
    b.close()
print("ИТОГО:", sum(ok), "/", len(ok))
