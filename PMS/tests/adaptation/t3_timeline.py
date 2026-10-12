import sys, json
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
results = []
def check(name, cond, info=""):
    results.append((name, bool(cond), info))
    print(("OK   " if cond else "FAIL ") + name + ((" — " + str(info)) if info else ""), flush=True)
def wait_block(pg, timeout=90000):
    pg.wait_for_function("(()=>{const e=document.querySelector('#ibAdapt [data-adapt=status]');return e && !/Расчёт/.test(e.textContent)})()", timeout=timeout)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={"width": 1600, "height": 950}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:300]))
    pg.goto(URL)
    pg.wait_for_function("window.PMS_ADAPTATION_LOADER && PMS_ADAPTATION_LOADER.isReady()", timeout=20000)
    tid = pg.evaluate("ensureProjectTemplateLibrary().templates[0].id")
    # добавление блока по обычному пути приложения: снимок до изменения, затем коммит
    bid = pg.evaluate("""(tid)=>{pushHistory();const bl=makeTemplateBlock(tid,{});project.blocks.push(bl);ensureContentFitsTL();commitHistory();state.selectedBlockIds=[bl.id];state.selectedOverlayIds=[];setInspOpen(true);setInspTab('block');renderInspector();return bl.id}""", tid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    orig = pg.evaluate("(id)=>({h:PMS_ADAPT.hash(project.blocks.find(b=>b.id===id).templateHtml),fmt:project.blocks.find(b=>b.id===id).templateMeta.format})", bid)
    pg.select_option("#ibAFmt", "9:16"); wait_block(pg)
    pg.select_option("#ibAMth", "smart"); wait_block(pg)
    pg.click("#ibAdaptApply"); pg.wait_for_timeout(300)
    applied = pg.evaluate("(id)=>{const b=project.blocks.find(b=>b.id===id);return {h:PMS_ADAPT.hash(b.templateHtml),fmt:b.templateMeta.format,m:b.templateMeta.adaptation&&b.templateMeta.adaptation.method}}", bid)
    check("применено: 9:16, smart", applied["fmt"] == "9:16" and applied["m"] == "smart" and applied["h"] != orig["h"], applied)
    cnt = pg.evaluate("project.blocks.length")
    pg.evaluate("undo()"); pg.wait_for_timeout(300)
    u = pg.evaluate("(id)=>{const b=project.blocks.find(b=>b.id===id);return b?{h:PMS_ADAPT.hash(b.templateHtml),fmt:b.templateMeta.format,ad:!!b.templateMeta.adaptation}:'missing'}", bid)
    check("Undo возвращает исходный блок (блок на месте)", u != "missing" and u["h"] == orig["h"] and u["fmt"] == "16:9" and not u["ad"], u)
    pg.evaluate("redo()"); pg.wait_for_timeout(300)
    r = pg.evaluate("(id)=>{const b=project.blocks.find(b=>b.id===id);return b?{h:PMS_ADAPT.hash(b.templateHtml),fmt:b.templateMeta.format}:'missing'}", bid)
    check("Redo возвращает адаптацию", r != "missing" and r["fmt"] == "9:16" and r["h"] == applied["h"], r)

    # «Вставить после» + Undo: копия исчезает целиком
    pg.evaluate("(id)=>{state.selectedBlockIds=[id];state.selectedOverlayIds=[];setInspTab('block');renderUI(true)}", bid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    pg.select_option("#ibAFmt", "1:1"); wait_block(pg)
    pg.select_option("#ibAMth", "compact"); wait_block(pg)
    pg.click("#ibAdaptInsert"); pg.wait_for_timeout(300)
    n = pg.evaluate("project.blocks.length")
    check("вставка: блоков +1", n == cnt + 1, (cnt, n))
    pg.evaluate("undo()"); pg.wait_for_timeout(300)
    check("Undo после вставки: копия удалена", pg.evaluate("project.blocks.length") == cnt, pg.evaluate("project.blocks.length"))

    # «Сохранить шаблон» с метаданными адаптации
    pg.evaluate("(id)=>{state.selectedBlockIds=[id];state.selectedOverlayIds=[];setInspTab('block');renderUI(true)}", bid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    pg.select_option("#ibAFmt", "9:16"); wait_block(pg)
    pg.select_option("#ibAMth", "smart"); wait_block(pg)
    pg.click("#ibAdaptApply"); pg.wait_for_timeout(300)
    pg.once("dialog", lambda d: d.accept("1"))
    ntpl = pg.evaluate("ensureProjectTemplateLibrary().templates.length")
    pg.click("#itSaveNewTpl"); pg.wait_for_timeout(500)
    sv = pg.evaluate("(()=>{const t=state.activeTemplateId&&findTemplate(state.activeTemplateId);return t?{id:t.id,fmt:t.format,dw:t.designW,dh:t.designH,m:t.adaptation&&t.adaptation.method,src:!!(t.adaptation&&t.adaptation.sourceHtml),srcFmt:t.adaptation&&t.adaptation.sourceFormat,cnv:t.canvas&&t.canvas.resolution}:null})()")
    check("«Сохранить шаблон»: формат, размеры, метод, исходник", sv and sv["fmt"] == "9:16" and sv["dw"] == 1080 and sv["dh"] == 1920 and sv["m"] == "smart" and sv["src"] and sv["srcFmt"] == "16:9", sv)
    check("«Сохранить шаблон»: добавлен один шаблон", pg.evaluate("ensureProjectTemplateLibrary().templates.length") == ntpl + 1)
    blk_src_placeholder = pg.evaluate("(id)=>project.blocks.find(b=>b.id===id).templateMeta.adaptation.sourceHtml", bid)
    # повторная адаптация уже адаптированного блока — от исходника, без накопления
    pg.select_option("#ibAMth", "compact"); wait_block(pg)
    pg.select_option("#ibAFmt", "1:1"); wait_block(pg)
    pg.click("#ibAdaptApply"); pg.wait_for_timeout(300)
    rb = pg.evaluate("""(async(id)=>{const b=project.blocks.find(b=>b.id===id);const src=b.templateMeta.adaptation.sourceHtml;
        const r=await RecomposeCore.convert({tpl:'x',label:'',html:src},'compact',{format:'1:1'});
        const dom=(h)=>{const w=document.createElement('div');w.innerHTML=h;return w.querySelectorAll('.rc-stage *').length};return {same:PMS_ADAPT.textHash(r.html)===PMS_ADAPT.textHash(b.templateHtml),textEq:PMS_ADAPT.textHash(r.html)===b.templateMeta.adaptation.resultTextHash,bytes:PMS_ADAPT.hash(r.html)===PMS_ADAPT.hash(b.templateHtml),elems:[dom(r.html),dom(b.templateHtml)],src:PMS_ADAPT.hash(src)===PMS_ADAPT.hash(%s),fmt:b.templateMeta.format,m:b.templateMeta.adaptation.method,rc:document.createElement('i').childElementCount}})""" % json.dumps(blk_src_placeholder) + "(" + json.dumps(bid) + ")")
    check("повторная адаптация: текст и структура = прямой расчёт от исходника (1:1, compact)", rb["same"] and rb["textEq"] and rb["elems"][0] == rb["elems"][1] and rb["elems"][0] > 0 and rb["fmt"] == "1:1" and rb["m"] == "compact", rb)
    print("     побайтно совпадает (Pano дописывает служебные атрибуты при монтаже):", rb["bytes"])
    check("повторная адаптация: исходник в метаданных не заменён результатом", rb["src"], rb)
    # текст блока, изменённый после адаптации, — подтверждение при повторном «Применить»
    print("ERRORS:", [e for e in errs if "GL Driver" not in e and "ERR_FILE_NOT_FOUND" not in e][:6])
    b.close()
print("ИТОГО: %d/%d" % (sum(1 for r in results if r[1]), len(results)))
