import sys, json
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
ok = []
def check(n, c, i=""):
    ok.append(c); print(("OK   " if c else "FAIL ") + n + ((" — " + str(i)[:200]) if i != "" else ""), flush=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={"width":1600,"height":950}).new_page()
    pg.goto(URL); pg.wait_for_function("window.PMS_ADAPTATION_LOADER && PMS_ADAPTATION_LOADER.isReady()", timeout=20000)
    tid = pg.evaluate("ensureProjectTemplateLibrary().templates[0].id")
    # копия с адаптацией, затем экспорт пользовательской библиотеки
    newid = pg.evaluate("""(async(id)=>{state.selectedTemplateIds=[id];state.activeTemplateId=id;state.templateAnchorId=id;setInspOpen(true);setInspTab('template');renderInspector();
        const sel=document.querySelector('#itplAFmt');sel.value='1:1';sel.dispatchEvent(new Event('change'));
        await new Promise(r=>setTimeout(r,50));const m=document.querySelector('#itplAMth');m.value='compact';m.dispatchEvent(new Event('change'));
        for(let i=0;i<400;i++){const e=document.querySelector('#itplAdapt [data-adapt=status]');if(e&&!/Расчёт/.test(e.textContent)&&!document.querySelector('#itplAdaptCopy').disabled)break;await new Promise(r=>setTimeout(r,100))}
        document.querySelector('#itplAdaptCopy').click();return state.activeTemplateId})""" + "(" + json.dumps(tid) + ")")
    pg.wait_for_timeout(300)
    user_js = pg.evaluate("serializeUserLibraryData()")
    rec = [t for t in user_js.get("templates", []) if t.get("id") == newid]
    check("экспорт user: шаблон с метаданными адаптации", rec and rec[0].get("adaptation") and rec[0]["adaptation"].get("method") == "compact" and rec[0]["adaptation"].get("sourceHtml"), (rec and list(rec[0].get("adaptation", {}).keys())))
    check("экспорт user: формат и размеры", rec and rec[0].get("format") == "1:1", rec and (rec[0].get("format"), rec[0].get("designW"), rec[0].get("designH")))
    # импорт: нормализация сохраняет adaptation
    norm = pg.evaluate("(t)=>normalizeTemplateItem(t).adaptation", rec[0])
    check("импорт (normalizeTemplateItem) сохраняет adaptation", norm and norm.get("method") == "compact", norm and list(norm.keys()))
    # проект: сохранение и восстановление блока с адаптацией
    pg.evaluate("""(id)=>{pushHistory();const bl=makeTemplateBlock(id,{});project.blocks.push(bl);ensureContentFitsTL();commitHistory();}""", newid)
    proj = pg.evaluate("JSON.parse(JSON.stringify(project.blocks.map(b=>({tpl:b.templateId,meta:b.templateMeta&&b.templateMeta.adaptation?{m:b.templateMeta.adaptation.method,src:!!b.templateMeta.adaptation.sourceHtml}:null}))))")
    check("блок из адаптированного шаблона несёт метаданные", proj and proj[-1]["meta"] and proj[-1]["meta"]["m"] == "compact", proj[-1:] )
    # перезагрузка страницы: библиотека пользователя восстанавливается только через user.js (браузер без записи файла)
    b.close()
print("ИТОГО:", sum(1 for x in ok if x), "/", len(ok))
