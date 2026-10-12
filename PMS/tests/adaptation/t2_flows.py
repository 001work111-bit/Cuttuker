import sys, json
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
results = []
def check(name, cond, info=""):
    results.append((name, bool(cond), info))
    print(("OK   " if cond else "FAIL ") + name + ((" — " + str(info)) if info else ""), flush=True)
def wait_status(pg, sel="#itplAdapt", timeout=90000):
    pg.wait_for_function("(()=>{const e=document.querySelector('%s [data-adapt=status]');return e && !/Расчёт/.test(e.textContent)})()" % sel, timeout=timeout)
def wait_status_block(pg, timeout=90000):
    pg.wait_for_function("(()=>{const e=document.querySelector('#ibAdapt [data-adapt=status]');return e && !/Расчёт/.test(e.textContent)})()", timeout=timeout)
def H(pg, s): return pg.evaluate("h=>PMS_ADAPT.hash(h)", s)
def open_lib(pg, tid):
    pg.evaluate("""(id)=>{state.selectedTemplateIds=[id];state.activeTemplateId=id;state.templateAnchorId=id;setInspOpen(true);setInspTab('template');}""", tid)
    pg.wait_for_selector("#itplAFmt", timeout=5000)
def tpl_count(pg): return pg.evaluate("ensureProjectTemplateLibrary().templates.length")

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={"width": 1600, "height": 950}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:300]))
    pg.goto(URL)
    pg.wait_for_function("window.PMS_ADAPTATION_LOADER && PMS_ADAPTATION_LOADER.isReady()", timeout=20000)

    # ---------- A. библиотека: обновить / копия / отмена ----------
    sys_id = pg.evaluate("ensureProjectTemplateLibrary().templates[0].id")
    sys_html = pg.evaluate("findTemplate(%r).html" % sys_id); sys_h = H(pg, sys_html)
    n0 = tpl_count(pg)
    open_lib(pg, sys_id)
    pg.select_option("#itplAFmt", "9:16"); wait_status(pg)
    pg.select_option("#itplAMth", "split"); wait_status(pg)
    pg.click("#itplAdaptUpdate")
    pg.wait_for_timeout(400)
    upd = pg.evaluate("(()=>{const t=state.activeTemplateId&&findTemplate(state.activeTemplateId);return t?{id:t.id,lib:t.librarySource,fmt:t.format,ad:!!t.adaptation,m:t.adaptation&&t.adaptation.method,src:t.adaptation&&t.adaptation.sourceHtml===%s}:null})()" % json.dumps(sys_html))
    print("     после «Обновить» (системный):", upd)
    check("системный шаблон: «Обновить» не меняет system, создаёт user-версию", pg.evaluate("H(findTemplate(%r).html)" % sys_id) == sys_h if False else pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % sys_id) == sys_h and upd and upd["lib"] == "user" and upd["fmt"] == "9:16" and upd["ad"] and upd["src"], upd)
    check("исходный system-шаблон не изменён", pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % sys_id) == sys_h)
    user_id = upd["id"]; n1 = tpl_count(pg)
    check("число шаблонов +1 (fork в user)", n1 == n0 + 1, (n0, n1))

    # повторная адаптация пользовательской версии: перезапись на месте, без роста библиотеки
    open_lib(pg, user_id)
    pg.select_option("#itplAMth", "compact"); wait_status(pg)
    pg.select_option("#itplAFmt", "1:1"); wait_status(pg)
    pg.click("#itplAdaptUpdate"); pg.wait_for_timeout(400)
    t_after = pg.evaluate("(()=>{const t=findTemplate(%r);return {id:t.id,fmt:t.format,dw:t.designW,dh:t.designH,m:t.adaptation.method,src:t.adaptation.sourceHtml===findTemplate(%r).adaptation.sourceHtml,h:PMS_ADAPT.hash(t.html)}})()" % (user_id, user_id))
    check("перезапись: тот же ID, формат 1:1, метод compact", t_after["id"] == user_id and t_after["fmt"] == "1:1" and t_after["m"] == "compact", t_after)
    check("перезапись: число шаблонов не растёт", tpl_count(pg) == n1, tpl_count(pg))
    check("перезапись: исходник сохранён (не адаптированный)", pg.evaluate("findTemplate(%r).adaptation.sourceFormat" % user_id) == "16:9" and pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).adaptation.sourceHtml)" % user_id) == sys_h)
    # результат = прямой расчёт от исходника (нет накопления)
    direct_h = pg.evaluate("""(async()=>{const t=findTemplate(%r);const r=await RecomposeCore.convert({tpl:t.adaptation.sourceTpl,label:'',html:t.adaptation.sourceHtml},'compact',{format:'1:1'});return PMS_ADAPT.hash(r.html)})()""" % user_id)
    check("результат перезаписи = прямой расчёт от исходника", direct_h == t_after["h"], (direct_h, t_after["h"]))

    # «Создать копию»
    open_lib(pg, user_id)
    pg.select_option("#itplAMth", "fit"); wait_status(pg)
    before_h = pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % user_id)
    pg.click("#itplAdaptCopy"); pg.wait_for_timeout(400)
    cp = pg.evaluate("(()=>{const t=state.activeTemplateId&&findTemplate(state.activeTemplateId);return t?{id:t.id,label:t.label,fmt:t.format,m:t.adaptation&&t.adaptation.method,parent:t.parentTemplateId}:null})()")
    check("копия: новый ID, исходный шаблон не изменён", cp and cp["id"] != user_id and pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % user_id) == before_h, cp)
    check("копия: метка содержит формат и название метода", cp and " · 1:1 · " in cp["label"] and "Контрольный safe-fit" in cp["label"], cp and cp["label"])
    check("копия: метод fit, parentTemplateId", cp and cp["m"] == "fit" and cp["parent"] == user_id, cp)
    n2 = tpl_count(pg); check("копия: число шаблонов +1", n2 == n1 + 1, (n1, n2))

    # отмена: выбрали метод, но не сохранили, переключились на другой шаблон
    open_lib(pg, user_id)
    pg.select_option("#itplAMth", "smart"); wait_status(pg)
    pg.evaluate("""(id)=>{state.selectedTemplateIds=[id];state.activeTemplateId=id;state.templateAnchorId=id;renderUI(true)}""", sys_id)
    pg.wait_for_timeout(300)
    check("без сохранения: исходный шаблон не перезаписан", pg.evaluate("PMS_ADAPT.hash(findTemplate(%r).html)" % user_id) == before_h and tpl_count(pg) == n2)

    # Undo/Redo для копии
    pg.evaluate("undo()"); pg.wait_for_timeout(200)
    check("Undo: копия удалена из библиотеки", tpl_count(pg) == n1, (n1, tpl_count(pg)))
    pg.evaluate("redo()"); pg.wait_for_timeout(200)
    check("Redo: копия возвращена", tpl_count(pg) == n2, (n2, tpl_count(pg)))

    # ---------- B. таймлайн: применить / вставить / Undo ----------
    def add_main_block(tid):
        return pg.evaluate("""(tid)=>{const bl=makeTemplateBlock(tid,{});project.blocks.push(bl);ensureContentFitsTL();return bl.id}""", tid)
    t_orig = sys_id
    bid = add_main_block(t_orig)
    nb_before = pg.evaluate("project.blocks.length")   # после добавления; «Применить» не должен добавлять блоки
    bstart = pg.evaluate("(id)=>{state.selectedBlockIds=[id];state.selectedOverlayIds=[];const it=layout().filter(x=>x.block.id===id)[0];state.G=it.start;setInspOpen(true);setInspTab('block');renderInspector();return it.start}", bid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    blk_orig = pg.evaluate("(id)=>PMS_ADAPT.hash(project.blocks.find(b=>b.id===id).templateHtml)", bid)
    pg.select_option("#ibAFmt", "9:16"); wait_status_block(pg)
    pg.select_option("#ibAMth", "smart"); wait_status_block(pg)
    pg.wait_for_timeout(300)
    mon = pg.evaluate("(()=>{const r=document.querySelector('#monTemplateMainStage .msTplViewport .rc-frame');return r?r.getAttribute('data-rc-format'):null})()")
    check("монитор показывает предпросмотр 9:16", mon == "9:16", mon)
    check("предпросмотр не записан в блок", pg.evaluate("(id)=>PMS_ADAPT.hash(project.blocks.find(b=>b.id===id).templateHtml)", bid) == blk_orig)
    check("кнопки применить/вставить включены", pg.is_enabled("#ibAdaptApply") and pg.is_enabled("#ibAdaptInsert"))
    pg.click("#ibAdaptApply"); pg.wait_for_timeout(400)
    blk = pg.evaluate("(id)=>{const b=project.blocks.find(b=>b.id===id);return {h:PMS_ADAPT.hash(b.templateHtml),fmt:b.templateMeta.format,m:b.templateMeta.adaptation&&b.templateMeta.adaptation.method,dw:b.templateMeta.designW,dh:b.templateMeta.designH,src:PMS_ADAPT.hash(b.templateMeta.adaptation.sourceHtml)}}", bid)
    check("«Применить»: блок получил результат, формат 9:16, метод smart", blk["fmt"] == "9:16" and blk["m"] == "smart" and blk["h"] != blk_orig, blk)
    check("«Применить»: исходник в метаданных сохранён", blk["src"] == blk_orig)
    check("«Применить»: блоки не дублируются", pg.evaluate("project.blocks.length") == nb_before, (nb_before, pg.evaluate("project.blocks.length")))
    pg.evaluate("undo()"); pg.wait_for_timeout(300)
    und = pg.evaluate("(id)=>{const b=project.blocks.find(b=>b.id===id);return b?{h:PMS_ADAPT.hash(b.templateHtml),fmt:b.templateMeta.format}:null}", bid)
    check("Undo после «Применить» возвращает исходный блок", und and und["h"] == blk_orig and und["fmt"] == "16:9", und)
    pg.evaluate("redo()"); pg.wait_for_timeout(300)
    red = pg.evaluate("(id)=>{const b=project.blocks.find(b=>b.id===id);return b?{h:PMS_ADAPT.hash(b.templateHtml),fmt:b.templateMeta.format}:null}", bid)
    check("Redo возвращает адаптацию", red and red["fmt"] == "9:16" and red["h"] != blk_orig, red)

    # «Вставить после»: нужен блок, за которым есть другой блок
    bid2 = add_main_block(t_orig)
    pg.evaluate("(id)=>{state.selectedBlockIds=[id];state.selectedOverlayIds=[];setInspTab('block');renderUI(true)}", bid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    pg.select_option("#ibAFmt", "1:1"); wait_status_block(pg)
    pg.select_option("#ibAMth", "compact"); wait_status_block(pg)
    n_blocks = pg.evaluate("project.blocks.length")
    pre_h = pg.evaluate("(id)=>PMS_ADAPT.hash(project.blocks.find(b=>b.id===id).templateHtml)", bid)
    order_before = pg.evaluate("project.blocks.map(b=>b.id)")
    layout_before = pg.evaluate("layout().map(x=>[x.block.id,x.start])")
    pg.click("#ibAdaptInsert"); pg.wait_for_timeout(400)
    st = pg.evaluate("""(()=>{const ids=project.blocks.map(b=>b.id);const i=ids.indexOf(%s);return {n:project.blocks.length,i:i,copyId:ids[i+1],orig:ids[i],origH:PMS_ADAPT.hash(project.blocks[i].templateHtml),copyFmt:project.blocks[i+1].templateMeta.format,copyH:PMS_ADAPT.hash(project.blocks[i+1].templateHtml),layout:layout().map(x=>[x.block.id,x.start])}})()""" % json.dumps(bid))
    check("«Вставить после»: блок вставлен сразу за исходным", st["n"] == n_blocks + 1 and st["i"] >= 0, st["n"])
    check("«Вставить после»: исходный блок не изменён", st["origH"] == pre_h and st["copyFmt"] == "1:1" and st["origH"] != st["copyH"], (st["origH"], pre_h, st["copyH"]))
    lay_after = dict((x[0], x[1]) for x in st["layout"])
    lay_before = dict((x[0], x[1]) for x in layout_before)
    check("«Вставить после»: последующие блоки сдвинуты, данные не потеряны", lay_after[bid2] > lay_before[bid2] and pg.evaluate("project.blocks.find(b=>b.id===%s).templateHtml.length" % json.dumps(bid2)) > 0, (lay_before[bid2], lay_after[bid2]))
    check("«Вставить после»: копия — свежий id и адаптация", st["copyId"] != bid and st["copyId"] != None)

    # ---------- B2. overlay: вставка после абсолютного титра ----------
    ovid = pg.evaluate("""(tid)=>{const bl=makeTemplateBlock(tid,{});bl.titleInstance=true;bl.start=10;bl.duration=40;project.overlayBlocks.push(bl);
        const later=makeTemplateBlock(tid,{});later.titleInstance=true;later.start=60;later.duration=20;project.overlayBlocks.push(later);
        ensureContentFitsTL();return bl.id}""", t_orig)
    pg.evaluate("(id)=>{state.selectedOverlayIds=[id];state.selectedBlockIds=[];state.G=15;setInspOpen(true);setInspTab('block');renderInspector()}", ovid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    pg.select_option("#ibAFmt", "9:16"); wait_status_block(pg)
    pg.select_option("#ibAMth", "fit"); wait_status_block(pg)
    pg.click("#ibAdaptInsert"); pg.wait_for_timeout(400)
    ov = pg.evaluate("project.overlayBlocks.map(b=>({id:b.id,s:b.start,d:b.duration,ti:!!b.titleInstance}))")
    print("     overlay:", ov)
    ids = [o["id"] for o in ov]
    copy = [o for o in ov if o["id"] not in (ovid, ids[-1]) and o["s"] == 50]
    check("overlay: копия идёт за исходным (старт = конец исходного)", len(ov) == 3 and copy, ov)
    later_s = [o["s"] for o in ov if o["id"] == ids[-1]]
    check("overlay: более поздний титр сдвинут на длину копии", later_s and later_s[0] == 60 + 40, later_s)
    check("overlay: исходный титр не сдвинут", [o["s"] for o in ov if o["id"] == ovid] == [10])

    # ---------- C. Сохранить шаблон с метаданными ----------
    pg.once("dialog", lambda d: d.accept("1"))
    ntpl = tpl_count(pg)
    pg.evaluate("(id)=>{state.selectedBlockIds=[id];state.selectedOverlayIds=[];setInspTab('block');renderInspector()}", bid)
    pg.wait_for_selector("#itSaveNewTpl", timeout=5000)
    pg.click("#itSaveNewTpl"); pg.wait_for_timeout(500)
    saved = pg.evaluate("(()=>{const t=state.activeTemplateId&&findTemplate(state.activeTemplateId);return t?{id:t.id,fmt:t.format,dw:t.designW,dh:t.designH,m:t.adaptation&&t.adaptation.method,src:!!(t.adaptation&&t.adaptation.sourceHtml)}:null})()")
    check("«Сохранить шаблон»: новый шаблон с форматом, размерами и методом", saved and saved["fmt"] == "9:16" and saved["m"] == "smart" and saved["src"] and tpl_count(pg) == ntpl + 1, saved)
    check("«Сохранить шаблон»: название кнопки", pg.inner_text("#itSaveNewTpl") == "Сохранить шаблон")

    # ---------- D. Ctrl+колесо в обоих инспекторах ----------
    wheel = """(args)=>{const el=document.querySelector(args.sel);if(!el)return 'nosel';const idx0=el.selectedIndex;
        const ev=new WheelEvent('wheel',{deltaY:args.dy,deltaMode:args.mode||0,ctrlKey:!!args.ctrl,bubbles:true,cancelable:true});
        el.dispatchEvent(ev);return {prevented:ev.defaultPrevented,before:idx0}}"""
    def sel_state(sel): return pg.evaluate("(s)=>{const e=document.querySelector(s);return {i:e.selectedIndex,v:e.value,n:e.options.length}}", sel)
    pg.evaluate("(id)=>{state.selectedBlockIds=[id];state.selectedOverlayIds=[];setInspTab('block');renderInspector()}", bid)
    pg.wait_for_selector("#ibAFmt", timeout=5000)
    scroll0 = pg.evaluate("[window.scrollX,window.scrollY,document.body.scrollTop,document.documentElement.scrollTop]")
    for scope, sel in [("блок", "#ibAFmt"), ("шаблон", None)]:
        if sel is None:
            pg.evaluate("(id)=>{state.selectedTemplateIds=[id];state.activeTemplateId=id;setInspOpen(true);setInspTab('template');renderInspector()}", sys_id)
            pg.wait_for_selector("#itplAFmt", timeout=5000); sel = "#itplAFmt"
        pg.select_option(sel, "16:9"); pg.wait_for_timeout(200)
        s0 = sel_state(sel)
        r = pg.evaluate(wheel, {"sel": sel, "dy": 100, "ctrl": True}); pg.wait_for_timeout(250)
        s1 = sel_state(sel)
        check(f"{scope}: Ctrl+колесо вниз — ровно один шаг, страница не прокручена", r != "nosel" and s1["i"] == s0["i"] + 1 and r["prevented"], (s0["i"], s1["i"], r))
        # быстрая серия событий одного щелчка (большой deltaY) — один шаг
        pg.evaluate("""(a)=>{for(let k=0;k<6;k++){const e=new WheelEvent('wheel',{deltaY:300,ctrlKey:true,bubbles:true,cancelable:true});document.querySelector(a).dispatchEvent(e)}}""", sel)
        pg.wait_for_timeout(250)
        s2 = sel_state(sel)
        check(f"{scope}: большой deltaY серией — один шаг", s2["i"] == s1["i"] + 1, (s1["i"], s2["i"]))
        # без Ctrl — поведение не меняется
        r2 = pg.evaluate(wheel, {"sel": sel, "dy": 100, "ctrl": False}); pg.wait_for_timeout(250)
        s3 = sel_state(sel)
        check(f"{scope}: без Ctrl выбор не меняется, событие не отменено", s3["i"] == s2["i"] and not r2["prevented"], (s2["i"], s3["i"], r2))
        # тачпад: много мелких событий одного жеста -> один шаг
        pg.evaluate("""(a)=>{for(let k=0;k<12;k++){const e=new WheelEvent('wheel',{deltaY:-8,ctrlKey:true,bubbles:true,cancelable:true});document.querySelector(a).dispatchEvent(e)}}""", sel)
        pg.wait_for_timeout(300)
        s4 = sel_state(sel)
        check(f"{scope}: тачпад (мелкие deltaY) — один шаг вверх", s4["i"] == s3["i"] - 1, (s3["i"], s4["i"]))
        # границы: вверх у первого элемента, вниз у последнего — без сброса
        pg.select_option(sel, pg.eval_on_selector(sel, "e=>e.options[0].value"))
        pg.wait_for_timeout(250)
        r3 = pg.evaluate(wheel, {"sel": sel, "dy": -100, "ctrl": True}); pg.wait_for_timeout(250)
        s5 = sel_state(sel)
        check(f"{scope}: граница первого пункта — без сброса и зацикливания", s5["i"] == 0, s5)
        pg.select_option(sel, pg.eval_on_selector(sel, "e=>e.options[e.options.length-1].value"))
        pg.wait_for_timeout(250)
        last_i = sel_state(sel)["i"]
        pg.evaluate(wheel, {"sel": sel, "dy": 100, "ctrl": True}); pg.wait_for_timeout(250)
        s6 = sel_state(sel)
        check(f"{scope}: граница последнего пункта — выбор сохранён", s6["i"] == last_i and s6["v"] == pg.eval_on_selector(sel, "e=>e.options[e.options.length-1].value"), s6)
    scroll1 = pg.evaluate("[window.scrollX,window.scrollY,document.body.scrollTop,document.documentElement.scrollTop]")
    check("страница не прокручена колесом", scroll0 == scroll1, (scroll0, scroll1))

    print("ERRORS:", [e for e in errs if "GL Driver" not in e and "ERR_FILE_NOT_FOUND" not in e][:6])
    b.close()
print("ИТОГО: %d/%d" % (sum(1 for r in results if r[1]), len(results)))
