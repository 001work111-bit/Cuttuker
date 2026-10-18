"use strict";

/* Stage 3 refinement: Sandbox-like template gallery, direct old librarymotion.js support, autoload hooks. */

var PMS_TEMPLATE_AUTOLOAD_SOURCES=["templates/librarymotion.js","templates/library.js"];
var PMS_USER_TEMPLATE_SOURCE="templates/user.js";
var pmsTemplateAutoloadState={started:false,loaded:null,errors:[],userLoaded:false,userErrors:[]};
var pmsTemplateRegistrationContext={sourceKind:"system",sourceFile:"templates/librarymotion.js"};

function libraryMode(){return state.libraryMode==="templates"?"templates":"assets"}
function libraryPaneVisible(){return state.mode==="gal-mon-tl"||state.mode==="gal-pano-tl"||state.mode==="gal-tl"}
function syncLibraryPane(){
  var show=libraryPaneVisible(),tpl=libraryMode()==="templates";
  if($("libraryModeSelect"))$("libraryModeSelect").value=tpl?"templates":"assets";
  if($("galleryWrap"))$("galleryWrap").classList.toggle("hide",!show||tpl);
  if($("templatesWrap"))$("templatesWrap").classList.toggle("hide",!show||!tpl);
}
function setLibraryMode(mode,opts){
  opts=opts||{};
  state.libraryMode=mode==="templates"?"templates":"assets";
  syncLibraryPane();
  if(!opts.skipRender)renderLibraryPane();
}
function rememberTemplateSelectionAfterLibraryUpdate(){
  var all=ensureProjectTemplateLibrary().templates||[];
  state.selectedTemplateIds=(state.selectedTemplateIds||[]).filter(function(id){return !!findTemplate(id)});
  if(state.activeTemplateId&&!findTemplate(state.activeTemplateId))state.activeTemplateId=null;
  if(!state.activeTemplateId&&all.length)state.activeTemplateId=all[0].id;
  if(!state.selectedTemplateIds.length&&state.activeTemplateId)state.selectedTemplateIds=[state.activeTemplateId];
}
var pmsLibraryRefreshing=false;
function importTemplateLibraryData(data,fileName,opts){
  opts=opts||{};
  var normalized=normalizeSandboxLibraryManifest(data||{});
  if(!normalized.templates.length){if(!opts.silent)alert("Template Library не содержит шаблонов html-slide");return null}
  replaceTemplateLibrarySectionData(normalized,{sourceKind:opts.sourceKind||"system",sourceFile:fileName||opts.sourceFile||"templates/librarymotion.js"});
  rememberTemplateSelectionAfterLibraryUpdate();
  if(!opts.keepFilters){state.templateStyleFilter=[];state.templateGroupFilter=[];state.templateTagFilter=[];state.templateAspectFilter=[];state.templateSearch="";if($("tplSearch"))$("tplSearch").value=""}
  if(fileName&&!project.name&&!pmsLibraryRefreshing)project.name=fileName.replace(/\.(json|js)$/i,"");
  if(opts.autoMode!==false)setLibraryMode("templates",{skipRender:true});
  renderLibraryPane();
  return ensureProjectTemplateLibrary();
}
function userLibraryPayloadLooksValid(payload){
  return !!(payload&&typeof payload==="object"&&(payload.format==="pms-user-library-v1"||payload.libraryType==="pms-user-library-v1"||payload.internalGroups||payload.internalStyles||payload.internalAssignments));
}
function setTemplateRegistrationContext(sourceKind,sourceFile){
  pmsTemplateRegistrationContext={sourceKind:sourceKind||"system",sourceFile:sourceFile||"templates/librarymotion.js"};
}
function evalTemplateLibraryScript(sourceText,fileName,opts){
  opts=opts||{};
  setTemplateRegistrationContext(opts.sourceKind||"system",opts.sourceFile||fileName||"template-library.js");
  var fn=new Function("window","document",sourceText+"\n//# sourceURL="+(fileName||"template-library.js"));
  fn(window,document);
  flushPendingTemplateLibrary();
}
// Выбор стиля для JSON-импорта. window.prompt в Electron не поддерживается, поэтому — встроенное окно.
// Возвращает Promise: {styleId} | {create:name} | null (отмена).
function chooseJsonLibraryStyle(){
  return new Promise(function(resolve){
    var styles=templateInternalStyles();
    var done=false;
    function finish(result){
      if(done)return;done=true;
      document.removeEventListener("keydown",onKey,true);
      if(wrap.parentNode)wrap.parentNode.removeChild(wrap);
      resolve(result);
    }
    function onKey(e){if(e.key==="Escape"){e.stopPropagation();finish(null)}}
    var wrap=document.createElement("div");
    wrap.setAttribute("data-pms-json-style","1");
    wrap.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif;";
    var box=document.createElement("div");
    box.style.cssText="background:#1b1f27;color:#e6e9ef;border:1px solid #3a4150;border-radius:8px;padding:16px;min-width:340px;display:flex;flex-direction:column;gap:10px;";
    var title=document.createElement("div");
    title.textContent="Назначить набор стилю";
    title.style.cssText="font-weight:600;";
    var select=document.createElement("select");
    select.setAttribute("data-role","style-select");
    styles.forEach(function(st){var o=document.createElement("option");o.value=st.id;o.textContent=st.name;select.appendChild(o)});
    var newOpt=document.createElement("option");newOpt.value="__new__";newOpt.textContent="Создать новый стиль";select.appendChild(newOpt);
    var input=document.createElement("input");
    input.type="text";input.placeholder="Название нового стиля";input.value="Импорт JSON";input.style.display="none";
    input.setAttribute("data-role","style-name");
    select.addEventListener("change",function(){input.style.display=select.value==="__new__"?"":"none"});
    var row=document.createElement("div");row.style.cssText="display:flex;gap:8px;justify-content:flex-end;";
    var cancel=document.createElement("button");cancel.type="button";cancel.textContent="Отмена";
    cancel.addEventListener("click",function(){finish(null)});
    var ok=document.createElement("button");ok.type="button";ok.textContent="Импортировать";ok.setAttribute("data-role","style-ok");
    ok.addEventListener("click",function(){
      if(select.value==="__new__"){
        var name=String(input.value||"").trim();
        if(!name){input.focus();return}
        finish({create:name});
      }else finish({styleId:select.value});
    });
    row.appendChild(cancel);row.appendChild(ok);
    box.appendChild(title);box.appendChild(select);box.appendChild(input);box.appendChild(row);
    wrap.appendChild(box);
    wrap.addEventListener("mousedown",function(e){if(e.target===wrap)finish(null)});
    document.addEventListener("keydown",onKey,true);
    document.body.appendChild(wrap);
    select.focus();
  });
}
function applyJsonLibraryStyle(fileName,target){
  var lib=ensureProjectTemplateLibrary();
  var styleId=target.styleId;
  if(target.create)styleId=ensureTemplateRegistryEntry(lib.internalStyles,target.create,lib.internalStyles[0].id,"tsty");
  // Варианты, которые пришли из этого файла, в том числе слитые с уже существующей карточкой.
  var ids=ensureProjectTemplateLibrary().templates.filter(function(t){
    if(t.librarySource==="user")return false;
    if(t.sourceFile===fileName)return true;
    return (t.libraryVersions||[]).some(function(v){return (v.files||[]).indexOf(fileName)>=0});
  }).map(function(t){return t.id});
  addTemplatesToStyle(ids,styleId);
}
function importTemplateLibraryFile(file){
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var text=String(reader.result||"");
      var isJs=/\.js$/i.test(file&&file.name||"");
      var json=isJs?null:JSON.parse(text);
      var isUserPayload=!isJs&&userLibraryPayloadLooksValid(json);
      if(!isJs&&!isUserPayload){
        // Сначала выбор стиля (встроенное окно), затем импорт; отмена — без изменений.
        chooseJsonLibraryStyle().then(function(target){
          if(!target)return;
          pushHistory();
          var jsonName=file&&file.name||"library.json";
          importTemplateLibraryData(json,jsonName,{sourceKind:"system",sourceFile:jsonName});
          applyJsonLibraryStyle(jsonName,target);
          if(state.inspOpen&&state.inspTab!=="block")renderInspector();
        }).catch(function(e){console.error(e);alert("Ошибка импорта Template Library")});
        return;
      }
      pushHistory();
      if(isJs)evalTemplateLibraryScript(text,file.name||"template-library.js",{sourceKind:/user\.js$/i.test(file&&file.name||"")?"user":"system",sourceFile:file&&file.name||"template-library.js"});
      else if(isUserPayload)window.PMS_registerUserLibrary(json);
      else{/* JSON-библиотека обработана выше */}
      if(state.inspOpen&&state.inspTab!=="block")renderInspector();
    }catch(e){console.error(e);alert("Ошибка импорта Template Library")}
  };
  reader.readAsText(file);
}
function normalizeRegisteredTemplatesPayload(payload){
  var meta=window.SB_MOTION_LIBRARY_META||{};
  if(Array.isArray(payload))return{format:meta.libraryType||meta.format||"motion-studio-library-v1",libraryType:meta.libraryType||"motion-studio-library-v1",target:meta.target||"motion-studio",contractVersion:meta.contractVersion||meta.contract||"motion-studio-template-v1",styleSystems:{},batches:deepClone(window.SB_PENDING_BATCHES||{}),templates:payload};
  return payload||{templates:[]};
}
function registerStyleSystems(styleSystems,opts){
  opts=opts||{};
  var kind=opts.sourceKind||pmsTemplateRegistrationContext.sourceKind||"system";
  var section=templateLibrarySection(kind);
  section.file=opts.sourceFile||pmsTemplateRegistrationContext.sourceFile||section.file;
  // Название ключа фиксируется при первом появлении (без приоритета по файлу).
  section.styleSystems=Object.assign({},styleSystems||{},section.styleSystems||{});
  ensureProjectTemplateLibrary();
  if(state.libraryMode==="templates")renderTemplateBrowser();
}
function registerTemplates(payload,opts){
  opts=opts||{};
  var kind=opts.sourceKind||pmsTemplateRegistrationContext.sourceKind||"system";
  var fileName=opts.sourceFile||pmsTemplateRegistrationContext.sourceFile||"librarymotion.js";
  var normalized=normalizeRegisteredTemplatesPayload(payload),section=templateLibrarySection(kind);
  normalized.styleSystems=Object.assign({},normalized.styleSystems||{},section.styleSystems||{});
  importTemplateLibraryData(normalized,fileName,{silent:!!opts.silent,keepFilters:true,autoMode:opts.autoMode!==false,sourceKind:kind,sourceFile:fileName});
}
window.SB_registerStyleSystems=function(styleSystems){registerStyleSystems(styleSystems,{sourceKind:pmsTemplateRegistrationContext.sourceKind,sourceFile:pmsTemplateRegistrationContext.sourceFile})};
window.SB_registerTemplates=function(payload){registerTemplates(payload,{silent:true,autoMode:true,sourceKind:pmsTemplateRegistrationContext.sourceKind,sourceFile:pmsTemplateRegistrationContext.sourceFile})};
window.PMS_registerUserLibrary=function(payload){
  applyUserLibraryPayload(payload||defaultUserLibraryPayload());
  rememberTemplateSelectionAfterLibraryUpdate();
  if(state.libraryMode==="templates")renderTemplateBrowser();
  if(state.inspOpen&&state.inspTab!=="block")renderInspector();
};
function flushPendingTemplateLibrary(){
  if(window.PMS_PENDING_USER_LIBRARY){
    var pending=window.PMS_PENDING_USER_LIBRARY;
    window.PMS_PENDING_USER_LIBRARY=null;
    window.PMS_registerUserLibrary(pending);
  }
}
function autoloadTemplateSourceList(list,index){
  if(index>=list.length){flushPendingTemplateLibrary();autoloadUserTemplateSource(PMS_USER_TEMPLATE_SOURCE);return}
  var src=list[index];
  if(document.querySelector('script[data-template-autoload="'+src+'"]'))return;
  var s=document.createElement("script");
  s.src=src;s.async=true;s.dataset.templateAutoload=src;
  s.onload=function(){pmsTemplateAutoloadState.loaded=src;setTemplateRegistrationContext("system",src);flushPendingTemplateLibrary();if(state.libraryMode==="templates")renderTemplateBrowser();autoloadUserTemplateSource(PMS_USER_TEMPLATE_SOURCE)};
  s.onerror=function(){pmsTemplateAutoloadState.errors.push(src);autoloadTemplateSourceList(list,index+1)};
  setTemplateRegistrationContext("system",src);
  document.head.appendChild(s);
}
function autoloadUserTemplateSource(src){
  if(pmsTemplateAutoloadState.userLoaded||document.querySelector('script[data-template-autoload="'+src+'"]'))return;
  var s=document.createElement("script");
  s.src=src;s.async=true;s.dataset.templateAutoload=src;
  s.onload=function(){pmsTemplateAutoloadState.userLoaded=true;setTemplateRegistrationContext("user",src);flushPendingTemplateLibrary();if(state.libraryMode==="templates")renderTemplateBrowser()};
  s.onerror=function(){pmsTemplateAutoloadState.userErrors.push(src)};
  setTemplateRegistrationContext("user",src);
  document.head.appendChild(s);
}
function ensureTemplateAutoload(){
  if(pmsTemplateAutoloadState.started)return;
  pmsTemplateAutoloadState.started=true;
  // В Electron — один механизм: рекурсивный скан templates/ через Main Process (без старых <script>).
  // user.js загружается отдельно как пользовательский слой.
  if(pmsHasElectronLibraryBridge()){
    setTimeout(function(){
      Promise.resolve(refreshTemplateLibrarySources({quiet:true,startup:true}))
        .then(function(){autoloadUserTemplateSource(PMS_USER_TEMPLATE_SOURCE)})
        .catch(function(e){pmsTemplateAutoloadState.errors.push(String(e&&e.message||e))});
    },0);
    return;
  }
  autoloadTemplateSourceList(PMS_TEMPLATE_AUTOLOAD_SOURCES,0);
}
function templateFilterMatch(t){
  var q=(state.templateSearch||"").trim().toLowerCase();
  if(state.templateStyleFilter.length&&!state.templateStyleFilter.some(function(sid){return templateHasStyle(t,sid)}))return false;
  if(state.templateGroupFilter.length&&state.templateGroupFilter.indexOf(String(t.internalGroupId||""))<0)return false;
  if(state.templateTagFilter.length){
    var tags=ensureStringArray(t.tags),ok=false;
    for(var i=0;i<state.templateTagFilter.length;i++)if(tags.indexOf(state.templateTagFilter[i])>=0){ok=true;break}
    if(!ok)return false;
  }
  if(state.templateAspectFilter.length&&state.templateAspectFilter.indexOf(String(t.format||t.aspect||""))<0)return false;
  if(q){
    var hay=[t.label,t.code,t.group,t.desc,(t.tags||[]).join(" "),t.styleSystem,t.tpl,templateInternalGroupName(t.internalGroupId),templateInternalStyleName(t.internalStyleId),t.librarySource].join(" ").toLowerCase();
    if(hay.indexOf(q)<0)return false;
  }
  return true;
}
function visibleTemplates(){return ensureProjectTemplateLibrary().templates.filter(templateFilterMatch)}
function templateSelectionLabel(list,emptyLabel,labelMap){
  if(!list.length)return emptyLabel;
  if(list.length===1)return labelMap&&labelMap[list[0]]?labelMap[list[0]]:list[0];
  return list.length+" выбр.";
}
function toggleMultiFilter(list,opt,on){var i=list.indexOf(opt);if(on&&i<0)list.push(opt);if(!on&&i>=0)list.splice(i,1)}
function normalizeDropdownOption(opt){
  if(opt&&typeof opt==="object")return{value:String(opt.value!=null?opt.value:opt.id!=null?opt.id:opt.name),label:String(opt.label!=null?opt.label:opt.name!=null?opt.name:opt.value!=null?opt.value:opt.id),desc:String(opt.desc!=null?opt.desc:opt.meta!=null?opt.meta:"")};
  return{value:String(opt),label:String(opt),desc:""};
}
function setMultiFilterValues(arr,values){arr.length=0;values.forEach(function(v){arr.push(v)})}
// Открытое мультименю переживает перерисовку галереи: выбор пункта не закрывает меню.
var mddOpenId=null;
function renderTemplateDropdown(hostId,label,allOptions,selected,onToggle,emptyLabel,onBulk){
  var host=$(hostId);if(!host)return;
  var options=allOptions.map(normalizeDropdownOption),labelMap={};
  options.forEach(function(opt){labelMap[opt.value]=opt.label});
  var wrap=document.createElement("div");wrap.className="mdd";wrap.id=hostId;
  if(mddOpenId===hostId)wrap.classList.add("open");
  // закрыть, когда указатель покинул и кнопку, и меню (не отдельный пункт)
  wrap.addEventListener("mouseleave",function(){wrap.classList.remove("open");if(mddOpenId===hostId)mddOpenId=null});
  var btn=document.createElement("button");btn.type="button";btn.className="btn mddBtn";
  btn.innerHTML='<span class="mddBtnText"><span class="mddBtnLabel">'+esc(label)+'</span><span class="mddBtnValue">'+esc(templateSelectionLabel(selected,emptyLabel||"Все",labelMap))+'</span></span><span class="mddBtnCaret">▾</span>';
  var menu=document.createElement("div");menu.className="mddMenu";
  // «Все» = пустой выбор (фильтр не активен); «Выбрать все» при полном выборе превращается в «Снять все» = возврат в «Все».
  var allValues=options.map(function(o){return o.value});
  var allOn=allValues.length>0&&allValues.every(function(v){return selected.indexOf(v)>=0});
  var head=document.createElement("div");head.className="mddHead";
  head.innerHTML='<button type="button" class="btn mddAct" data-act="toggle"'+(allValues.length?'':' disabled')+'>'+(allOn?'Снять все':'Выбрать все')+'</button>'+
    '<span class="mddCount">'+selected.filter(function(v){return allValues.indexOf(v)>=0}).length+' / '+allValues.length+'</span>';
  head.querySelector('[data-act="toggle"]').onclick=function(e){e.stopPropagation();if(onBulk)onBulk(allOn?[]:allValues)};
  menu.appendChild(head);
  if(options.length===0){var empty=document.createElement("div");empty.className="inspMeta";empty.textContent="нет данных";menu.appendChild(empty)}
  options.forEach(function(opt){
    var row=document.createElement("label");row.className="mddItem";
    var input=document.createElement("input");input.type="checkbox";input.checked=selected.indexOf(opt.value)>=0;
    input.onchange=function(e){e.stopPropagation();onToggle(opt.value,input.checked)};
    var text=document.createElement("span");text.className="mddItemText";text.innerHTML='<span>'+esc(opt.label)+'</span>'+(opt.desc?'<small>'+esc(opt.desc)+'</small>':'');
    row.appendChild(input);row.appendChild(text);menu.appendChild(row);
  });
  btn.onclick=function(e){e.stopPropagation();document.querySelectorAll(".mdd.open").forEach(function(x){if(x!==wrap)x.classList.remove("open")});wrap.classList.toggle("open");mddOpenId=wrap.classList.contains("open")?hostId:null};
  wrap.appendChild(btn);wrap.appendChild(menu);
  host.replaceWith(wrap);
}
function cleanTemplateGalleryDom(root){
  if(!root)return;
  root.querySelectorAll("[contenteditable]").forEach(function(x){x.removeAttribute("contenteditable")});
  root.querySelectorAll("[data-sb-media]").forEach(function(node){
    node.style.pointerEvents="none";
    if(node.querySelector(".msSlotDice"))node.querySelectorAll(".msSlotDice").forEach(function(el){el.remove()});
  });
}
function getDragTemplateIds(e){
  try{var raw=e.dataTransfer.getData("text/x-templates")||"";if(!raw)return[];if(raw.charAt(0)==='[')return JSON.parse(raw);return raw.split(',').filter(Boolean)}catch(err){return[]}
}
// Размеры дизайна плитки: designW/H → формат/пропорция (PMS_ADAPT.designSize). Без адаптера — явный 16:9.
function tplDesignSize(t){
  return (window.PMS_ADAPT&&PMS_ADAPT.designSize)?PMS_ADAPT.designSize(t):{w:1920,h:1080,source:"fallback-16:9"};
}
function fitTemplateTile(tile){
  if(!tile)return;
  var frame=tile.querySelector('.tplFrame'),stage=tile.querySelector('.tplScaleStage');
  if(!frame||!stage)return;
  var dw=+tile.dataset.designW||1920,dh=+tile.dataset.designH||1080,w=Math.max(120,frame.clientWidth||1),sc=w/dw;
  stage.style.transform='scale('+sc+')';
  frame.style.height=Math.max(60,Math.round(dh*sc))+'px';
}
function fitAllTemplateTiles(){document.querySelectorAll('#tplGrid .tplTile').forEach(fitTemplateTile)}
// Ширина карточки задаётся слайдером (state.templateCardWidth); число колонок — auto-fill; высота — по ratio дизайна (fitTemplateTile).
function templateCardWidth(){return clamp((state.templateCardWidth|0)||220,140,420)}
function applyTemplateCardWidth(){
  var grid=$("tplGrid");if(!grid)return;
  var w=templateCardWidth();
  grid.style.gridTemplateColumns="repeat(auto-fill, "+w+"px)";
  grid.style.justifyContent="start";
  var sl=$("tplSizeSlider");if(sl&&sl.value!==String(w))sl.value=w;
  var lb=$("tplSizeVal");if(lb)lb.textContent=w+" px";
  fitAllTemplateTiles();
}
// Предпросмотр метода адаптации в рамке карточки галереи. Только отображение: библиотека, user.js и исходник не меняются.
// Показывается только пока открыт инспектор этого шаблона; до расчёта и при ошибке — исходный HTML (старый результат не выдаётся за текущий).
var pmsCardPreview=null; // {id,t,res,pending}
function cardPreviewActive(id){return !!(state.inspOpen&&state.inspTab==="template"&&state.activeTemplateId===id)}
function findTileById(id){var all=document.querySelectorAll('#tplGrid .tplTile');for(var i=0;i<all.length;i++)if(all[i].dataset.id===id)return all[i];return null}
function paintCardStage(tile,t,res){
  var stage=tile.querySelector('.tplScaleStage');if(!stage)return;
  var d=(res&&res.frameW>0&&res.frameH>0)?{w:res.frameW,h:res.frameH}:tplDesignSize(t);
  tile.dataset.designW=d.w;tile.dataset.designH=d.h;
  stage.style.width=d.w+"px";stage.style.height=d.h+"px";
  stage.innerHTML=String((res&&res.html)||t.html||"");
  cleanTemplateGalleryDom(stage);
  tile.classList.toggle("adapted",!!res);
  fitTemplateTile(tile);
}
// invalid: выбран метод, но применимого результата нет (ошибка/слоты потеряны) — такой выбор не вставляется как исходник
function setCardPreview(t,res,pending,invalid){
  var prev=pmsCardPreview;
  if(prev&&prev.id!==t.id){var old=findTileById(prev.id);if(old){old.classList.remove("adapting");paintCardStage(old,prev.t,null)}}
  pmsCardPreview=(res||pending||invalid)?{id:t.id,t:t,res:res||null,pending:!!pending,invalid:!!invalid}:null;
  var tile=findTileById(t.id);if(!tile)return;
  tile.classList.toggle("adapting",!!pending);
  paintCardStage(tile,t,pending?null:(res||null));
}
// Вставка на таймлайн: адаптированный результат выбранного метода — только если он готов (ok/warning).
// Возвращает false, если перетаскиваемый шаблон выбран с методом, но результат ещё считается или не применим.
function cardDropGate(templateIds){
  var cp=pmsCardPreview;
  if(!cp||templateIds.indexOf(cp.id)<0||!cardPreviewActive(cp.id))return true;
  if(cp.pending||cp.invalid){
    var hint=$("tplHint");if(hint)hint.textContent="Адаптация не готова или не применима: выберите другой метод или «Без адаптации»";
    return false;
  }
  return true;
}
// После вставки: блоки с шаблоном, для которого выбран готовый результат, получают адаптированный HTML и метаданные.
// Исходник берётся из PMS_ADAPT.origin (не из уже адаптированного HTML). Другие блоки не меняются.
function applyCardAdaptToBlocks(blockIds){
  var cp=pmsCardPreview;
  if(!cp||!cp.res||!cardPreviewActive(cp.id))return;
  (blockIds||[]).forEach(function(id){
    var b=findBlock(id)||findOverlay(id);
    if(!b||b.templateId!==cp.id)return;
    var src=libraryAdaptSource(cp.t);
    b.templateHtml=PMS_ADAPT.cleanHtml(cp.res.html);
    b.templateMeta=Object.assign({},b.templateMeta||{},{format:cp.res.format,designW:cp.res.frameW,designH:cp.res.frameH,canvas:adaptCanvasFor(cp.res),adaptation:PMS_ADAPT.metaFor(cp.res,src)});
    ensureTemplateBlockState(b);
  });
}
function visibleTemplateIds(){return visibleTemplates().map(function(t){return t.id})}
function openTemplateInspectorForSelection(){if(state.inspOpen){setInspTab("template");renderInspector()}}
function selectTemplateCard(id,opts){
  opts=opts||{};
  var ids=visibleTemplateIds();
  if(opts.shiftKey&&state.templateAnchorId&&ids.length){
    state.selectedTemplateIds=rangeSelectIds(ids,state.templateAnchorId,id);
  }else if(opts.metaKey||opts.ctrlKey){
    var ix=state.selectedTemplateIds.indexOf(id);
    if(ix>=0)state.selectedTemplateIds.splice(ix,1);else state.selectedTemplateIds.push(id);
    state.templateAnchorId=id;
  }else{
    state.selectedTemplateIds=[id];
    state.templateAnchorId=id;
  }
  state.activeTemplateId=id;
  state.inspTab="template";
  // статусы адаптации готовятся сразу при выборе (кэш модуля), инспектор открывается уже с расчётом
  var pt=findTemplate(id);
  if(pt&&window.PMS_ADAPT&&window.PMS_ADAPT.prefetch&&typeof libraryAdaptSource==="function"){var ps=libraryAdaptSource(pt);PMS_ADAPT.prefetch(ps,pt.format||"16:9","library",ps.format)}
  openTemplateInspectorForSelection();
}
function renderTemplateGrid(){
  var grid=$("tplGrid"),list=visibleTemplates();if(!grid)return;
  grid.innerHTML="";
  $("tplCount").textContent=list.length+" / "+ensureProjectTemplateLibrary().templates.length;
  list.forEach(function(t){
    var tile=document.createElement("article");tile.className="tplTile"+(state.selectedTemplateIds.indexOf(t.id)>=0?" sel":"")+(state.activeTemplateId===t.id?" active":"");tile.dataset.id=t.id;var ds=tplDesignSize(t);tile.dataset.designW=ds.w;tile.dataset.designH=ds.h;tile.draggable=true;
    var frame=document.createElement("div");frame.className="tplFrame";
    var stage=document.createElement("div");stage.className="tplScaleStage";
    stage.style.width=ds.w+"px";stage.style.height=ds.h+"px";
    stage.innerHTML=String(t.html||"");
    cleanTemplateGalleryDom(stage);
    frame.appendChild(stage);tile.appendChild(frame);
    var footer=document.createElement("div");footer.className="tplFooter";
    footer.innerHTML='<div class="tplFooterMain"><span class="tplLibBadge '+(t.librarySource==="user"?"user":"system")+'">'+(t.librarySource==="user"?"USER":"SYS")+'</span><div class="tplLabel">'+esc(t.label||t.tpl||t.id)+'</div></div><button type="button" class="btn tplMiniBtn" data-tplinfo="1">i</button>';
    tile.appendChild(footer);
    var tagbox=document.createElement("div");tagbox.className="tplTagOverlay"+(state.templateShowTags?" on":"");
    ensureStringArray(t.tags).forEach(function(tag){var el=document.createElement("span");el.className="tplTag";el.textContent=tag;tagbox.appendChild(el)});
    if(!ensureStringArray(t.tags).length)tagbox.innerHTML='<span class="tplTag">без тегов</span>';
    tile.appendChild(tagbox);
    tile.addEventListener("click",function(e){
      if(e.target.closest("[data-tplinfo]")){e.stopPropagation();selectTemplateCard(t.id,{});if(!state.inspOpen)setInspOpen(true);setInspTab("template");renderInspector();return}
      if(templateCardGesture(t,e))return;
      selectTemplateCard(t.id,{shiftKey:e.shiftKey,metaKey:e.metaKey,ctrlKey:e.ctrlKey});
      renderTemplateGrid();
    });
    tile.addEventListener('dragstart',function(e){
      var ids=state.selectedTemplateIds.indexOf(t.id)>=0?state.selectedTemplateIds.slice():[t.id];
      e.dataTransfer.setData('text/x-templates',JSON.stringify(ids));
      e.dataTransfer.setData('text/plain',ids.join(','));
      // компактная миниатюра: рамка, подпись и число при групповом перетаскивании
      var gh=document.createElement('div');
      gh.style.cssText='position:fixed;left:-1000px;top:-1000px;width:132px;padding:6px;box-sizing:border-box;border:1px solid #fff;border-radius:6px;background:#15151c;color:#fff;font:600 11px/1.3 sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.4);pointer-events:none';
      var fr=document.createElement('div');
      fr.style.cssText='width:100%;height:56px;border:1px solid rgba(255,255,255,.5);border-radius:3px;background:#2a2a36;margin-bottom:4px';
      var lb=document.createElement('div');
      lb.style.cssText='white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      lb.textContent=(t.label||t.name||t.tpl||t.id)+(ids.length>1?' +'+(ids.length-1):'');
      gh.appendChild(fr);gh.appendChild(lb);document.body.appendChild(gh);
      try{e.dataTransfer.setDragImage(gh,66,30)}catch(err){}
      setTimeout(function(){gh.remove()},0);
    });
    var cp=pmsCardPreview&&pmsCardPreview.id===t.id?pmsCardPreview:null;
    if(cp&&cardPreviewActive(t.id)){if(cp.pending)tile.classList.add("adapting");else if(cp.res){paintCardStage(tile,t,cp.res)}}
    grid.appendChild(tile);
  });
  if(!list.length)grid.innerHTML='<div class="inspMeta">Шаблоны не найдены. Проверь фильтры или librarymotion.js/user.js.</div>';
  applyTemplateCardWidth();
  syncTemplateTagsToggle();
  requestAnimationFrame(fitAllTemplateTiles);
}
function insertTemplateAfterContext(templateId){
  var eb=editingBlock();
  if(eb&&eb.block){
    var arr=eb.track==="overlay"?project.overlayBlocks:project.blocks;
    var idx=findIndexIn(arr,eb.block.id);
    return insertTemplateBlocks([templateId],idx+1,eb.track);
  }
  return insertTemplateBlocks([templateId],project.blocks.length,"main");
}
function insertTemplateEnd(templateId){return insertTemplateBlocks([templateId],project.blocks.length,"main")}
function explicitBlockContext(){
  var b=primaryBlock();if(b)return{block:b,track:"main"};
  b=primaryOverlay();if(b)return{block:b,track:"overlay"};
  return null;
}
var tplHintTimer=null;
function showTplHint(text){
  var el=document.getElementById("tplHint");if(!el)return;
  if(!el.dataset.def)el.dataset.def=el.textContent;
  el.textContent=text;clearTimeout(tplHintTimer);
  tplHintTimer=setTimeout(function(){el.textContent=el.dataset.def},2500);
}
function templateCardGesture(t,e){
  // Alt — в конец; Shift — после выбранного блока; Ctrl — заменить выбранный блок. Без модификатора — выделение.
  var wantsReplace=e.ctrlKey&&!e.shiftKey&&!e.altKey;
  var wantsInsertEnd=e.altKey&&!e.ctrlKey&&!e.shiftKey;
  var wantsInsertAfter=e.shiftKey&&!e.ctrlKey&&!e.altKey;
  if(!wantsReplace&&!wantsInsertEnd&&!wantsInsertAfter)return false;
  // только явно выбранный блок: блок под playhead здесь не подменяет выбор (без скрытых операций)
  var eb=explicitBlockContext();
  if(wantsReplace&&!eb){showTplHint("Выберите блок на таймлайне, чтобы заменить его");return false}
  // Shift без выбранного блока не вставляет в случайное место: подсказка, выделение остаётся обычным
  if(wantsInsertAfter&&!eb){showTplHint("Выберите блок на таймлайне, чтобы вставить после него");return false}
  e.preventDefault();
  // та же проверка готовности адаптации, что и при drag-and-drop
  if(!cardDropGate([t.id]))return true;
  pushHistory();
  state.activeTemplateId=t.id;state.selectedTemplateIds=[t.id];
  var ids=[];
  if(wantsReplace){
    replaceBlockTemplate(eb.block.id,t.id);
    if(eb.track==="overlay"){state.selectedOverlayIds=[eb.block.id];state.selectedBlockIds=[]}
    else{state.selectedBlockIds=[eb.block.id];state.selectedOverlayIds=[]}
    clearTemplateEditState();
  }else if(wantsInsertAfter) ids=insertTemplateAfterContext(t.id);
  else if(wantsInsertEnd) ids=insertTemplateEnd(t.id);
  if(ids.length){state.selectedBlockIds=[];state.selectedOverlayIds=[];if(findBlock(ids[0]))state.selectedBlockIds=ids.slice();else state.selectedOverlayIds=ids.slice()}
  // адаптация применяется к вставленным/заменённым блокам тем же путём, что и при drop
  applyCardAdaptToBlocks(wantsReplace?[eb.block.id]:ids);
  commitHistory();
  renderUI(true);
  return true;
}
function syncTemplateTagsToggle(){
  var btn=$("tplTagsToggle");if(btn){btn.classList.toggle("active",!!state.templateShowTags);btn.textContent=state.templateShowTags?"Теги: on":"Теги"}
}
function templateGroupOptions(){return templateInternalGroups().map(function(g){return{value:g.id,label:g.name,desc:""}})}
function templateStyleOptions(){return templateInternalStyles().map(function(s){return{value:s.id,label:s.name,desc:""}})}
function renderTemplateBrowser(){
  syncLibraryPane();
  ensureTemplateAutoload();
  renderTemplateDropdown("tplStyleFilter","Стили",templateStyleOptions(),state.templateStyleFilter,function(opt,on){toggleMultiFilter(state.templateStyleFilter,opt,on);renderTemplateBrowser()},"Все стили",function(vals){setMultiFilterValues(state.templateStyleFilter,vals);renderTemplateBrowser()});
  renderTemplateDropdown("tplGroupFilter","Группы",templateGroupOptions(),state.templateGroupFilter,function(opt,on){toggleMultiFilter(state.templateGroupFilter,opt,on);renderTemplateBrowser()},"Все группы",function(vals){setMultiFilterValues(state.templateGroupFilter,vals);renderTemplateBrowser()});
  renderTemplateDropdown("tplTagFilter","Теги",templateTags(),state.templateTagFilter,function(opt,on){toggleMultiFilter(state.templateTagFilter,opt,on);renderTemplateBrowser()},"Все теги",function(vals){setMultiFilterValues(state.templateTagFilter,vals);renderTemplateBrowser()});
  renderTemplateDropdown("tplAspectFilter","Формат",templateAspects(),state.templateAspectFilter,function(opt,on){toggleMultiFilter(state.templateAspectFilter,opt,on);renderTemplateBrowser()},"Все форматы",function(vals){setMultiFilterValues(state.templateAspectFilter,vals);renderTemplateBrowser()});
  if($("tplSearch")&&$("tplSearch").value!==state.templateSearch)$("tplSearch").value=state.templateSearch||"";
  renderTemplateGrid();
}
function renderLibraryPane(){
  syncLibraryPane();
  if(libraryMode()==="templates")renderTemplateBrowser();
  else renderGallery();
}
function userLibraryScript(){
  return "(function(){\n  var payload = "+JSON.stringify(serializeUserLibraryData(),null,2)+";\n  if(window.PMS_registerUserLibrary) window.PMS_registerUserLibrary(payload);\n  else window.PMS_PENDING_USER_LIBRARY = payload;\n})();\n";
}
function currentUserLibraryWriter(){
  if(window.PMS_UserLibraryHost&&typeof window.PMS_UserLibraryHost.writeTextFile==="function")return window.PMS_UserLibraryHost.writeTextFile.bind(window.PMS_UserLibraryHost);
  if(window.PMS_ELECTRON&&typeof window.PMS_ELECTRON.writeTextFile==="function")return window.PMS_ELECTRON.writeTextFile.bind(window.PMS_ELECTRON);
  return null;
}
function persistUserLibrary(reason){
  var lib=ensureProjectTemplateLibrary(),code=userLibraryScript(),writer=currentUserLibraryWriter();
  lib.userSourceCode=code;
  lib.lastUserPersistError=null;
  if(!writer){lib.lastUserPersistAt=Date.now();return code}
  try{
    Promise.resolve(writer(lib.userLibrary.file||PMS_USER_TEMPLATE_SOURCE,code,{reason:reason||"update-template-user-library"})).then(function(){
      lib.lastUserPersistAt=Date.now();lib.lastUserPersistError=null;
      if(state.inspOpen&&(state.inspTab==="project"||state.inspTab==="template"))renderInspector();
    }).catch(function(err){console.error(err);lib.lastUserPersistError=String(err&&err.message||err||"write failed");if(state.inspOpen&&(state.inspTab==="project"||state.inspTab==="template"))renderInspector()});
  }catch(err){console.error(err);lib.lastUserPersistError=String(err&&err.message||err||"write failed")}
  return code;
}
function exportUserLibraryFile(){downloadText("user.js",persistUserLibrary("export-user-library"),"text/javascript")}
function openModal(id){var el=$(id);if(el)el.classList.add("on")}
function closeModal(id){var el=$(id);if(el)el.classList.remove("on")}
function closeTemplateModals(){document.querySelectorAll(".modal.on").forEach(function(el){el.classList.remove("on")})}
function fillTemplateInternalSelect(selectId,list,selectedId){
  var el=$(selectId);if(!el)return;
  el.innerHTML="";
  list.forEach(function(item){var opt=document.createElement("option");opt.value=item.id;opt.textContent=item.name;opt.selected=item.id===selectedId;el.appendChild(opt)});
}
function templateJsonListFromInput(raw){
  if(Array.isArray(raw))return raw;
  if(raw&&Array.isArray(raw.templates))return raw.templates;
  if(raw&&(raw.html||raw.build||raw.id||raw.tpl||raw.motionStudio||raw.motion))return[raw];
  return[];
}
function parseTemplateJsonInput(text){
  var payload=JSON.parse(text),list=templateJsonListFromInput(payload),normalized=list.map(normalizeTemplateItem).filter(function(t){return t&&t.html});
  if(!normalized.length)throw new Error("Template JSON не содержит валидного html-slide шаблона");
  return{payload:payload,list:list,normalized:normalized};
}
function refreshTemplateAddPopup(){
  fillTemplateInternalSelect("tplAddGroup",templateInternalGroups(),templateInternalGroups()[0]&&templateInternalGroups()[0].id);
  fillTemplateInternalSelect("tplAddStyle",templateInternalStyles(),templateInternalStyles()[0]&&templateInternalStyles()[0].id);
  if($("tplAddPreview"))$("tplAddPreview").textContent="Вставь JSON шаблона или массив шаблонов, затем нажми «Проверить JSON».";
}
function openTemplateAddPopup(){refreshTemplateAddPopup();if($("tplAddJson"))$("tplAddJson").value="";openModal("tplAddModal")}
function validateTemplateAddPopup(){
  try{
    var parsed=parseTemplateJsonInput($("tplAddJson").value||"");
    $("tplAddPreview").textContent=parsed.normalized.map(function(t){return(t.label||t.tpl||t.id)+" · "+(t.format||"16:9")+" · slots "+Object.keys(parseTemplateMediaSlots(t.html||"")).length}).join("\n");
    return parsed;
  }catch(e){$("tplAddPreview").textContent="Ошибка: "+(e&&e.message||e);throw e}
}
function addTemplatesFromPopup(){
  var parsed=validateTemplateAddPopup(),groupId=$("tplAddGroup").value||templateInternalGroups()[0].id,styleId=$("tplAddStyle").value||templateInternalStyles()[0].id,added=[];
  pushHistory();
  parsed.normalized.forEach(function(def){added.push(upsertUserTemplateDefinition(def,{groupId:groupId,styleId:styleId}))});
  persistUserLibrary("manual-add-template-json");
  state.activeTemplateId=added[0]&&added[0].id||state.activeTemplateId;
  state.selectedTemplateIds=added.map(function(t){return t.id});
  if(state.selectedTemplateIds.length)state.templateAnchorId=state.selectedTemplateIds[0];
  closeModal("tplAddModal");
  setLibraryMode("templates",{skipRender:true});
  if(!state.inspOpen)setInspOpen(true);
  setInspTab("template");
  renderUI(true);
}
function renderTemplateStyleManager(){
  var groupsBox=$("tplStyleMgrGroups"),stylesBox=$("tplStyleMgrStyles");
  if(!groupsBox||!stylesBox)return;
  groupsBox.innerHTML="";stylesBox.innerHTML="";
  templateInternalGroups().forEach(function(g,index){
    var row=document.createElement("div");row.className="mgrRow";
    row.innerHTML='<input type="text" value="'+esc(g.name)+'" data-group-name="'+esc(g.id)+'" /><button class="btn danger" type="button" '+(index===0?'disabled':'')+' data-group-del="'+esc(g.id)+'">×</button>';
    groupsBox.appendChild(row);
  });
  templateInternalStyles().forEach(function(s,index){
    var row=document.createElement("div");row.className="mgrRow";
    row.innerHTML='<input type="text" value="'+esc(s.name)+'" data-style-name="'+esc(s.id)+'" /><button class="btn danger" type="button" '+(index===0?'disabled':'')+' data-style-del="'+esc(s.id)+'">×</button>';
    stylesBox.appendChild(row);
  });
  groupsBox.querySelectorAll("[data-group-name]").forEach(function(input){input.onchange=function(){pushHistory();renameTemplateGroup(input.dataset.groupName,input.value||"Группа");persistUserLibrary("rename-template-group");renderTemplateStyleManager();renderTemplateBrowser();if(state.inspOpen)renderInspector()}});
  groupsBox.querySelectorAll("[data-group-del]").forEach(function(btn){btn.onclick=function(){if(btn.disabled)return;if(!confirm("Удалить группу? Шаблоны будут переназначены в группу по умолчанию."))return;pushHistory();deleteTemplateGroup(btn.dataset.groupDel);persistUserLibrary("delete-template-group");renderTemplateStyleManager();renderTemplateBrowser();if(state.inspOpen)renderInspector()}});
  stylesBox.querySelectorAll("[data-style-name]").forEach(function(input){input.onchange=function(){pushHistory();renameTemplateStyle(input.dataset.styleName,input.value||"Стиль");persistUserLibrary("rename-template-style");renderTemplateStyleManager();renderTemplateBrowser();if(state.inspOpen)renderInspector()}});
  stylesBox.querySelectorAll("[data-style-del]").forEach(function(btn){btn.onclick=function(){if(btn.disabled)return;if(!confirm("Удалить стиль? Шаблоны будут переназначены в стиль по умолчанию."))return;pushHistory();deleteTemplateStyle(btn.dataset.styleDel);persistUserLibrary("delete-template-style");renderTemplateStyleManager();renderTemplateBrowser();if(state.inspOpen)renderInspector()}});
}
function openTemplateStyleManager(){renderTemplateStyleManager();openModal("tplStyleMgrModal")}
function addGroupFromManager(){var input=$("tplStyleMgrNewGroup"),name=(input&&input.value||"").trim();if(!name)return;pushHistory();addTemplateGroup(name);persistUserLibrary("add-template-group");input.value="";renderTemplateStyleManager();renderTemplateBrowser();if(state.inspOpen)renderInspector()}
function addStyleFromManager(){var input=$("tplStyleMgrNewStyle"),name=(input&&input.value||"").trim();if(!name)return;pushHistory();addTemplateStyle(name);persistUserLibrary("add-template-style");input.value="";renderTemplateStyleManager();renderTemplateBrowser();if(state.inspOpen)renderInspector()}
function duplicateTemplateSelectionToUser(){
  var list=selectedTemplateRecords();
  if(!list.length&&activeTemplateRecord())list=[activeTemplateRecord()];
  if(!list.length)return [];
  pushHistory();
  var added=list.map(function(t){return t.librarySource==="user"?t:duplicateTemplateToUser(t)}).filter(Boolean);
  persistUserLibrary("duplicate-template-selection");
  if(added.length){state.selectedTemplateIds=added.map(function(t){return t.id});state.activeTemplateId=added[0].id;state.templateAnchorId=added[0].id;renderUI(true)}
  return added;
}
function templateJsonForSelection(){
  var list=selectedTemplateRecords();
  if(list.length===1)return JSON.stringify(templateDefinitionForEditor(list[0]),null,2);
  return JSON.stringify(list.map(templateDefinitionForEditor),null,2);
}
function applyTemplateJsonText(templateOrId,text){
  var parsed=JSON.parse(text),target=typeof templateOrId==="string"?findTemplate(templateOrId):templateOrId;
  if(!target)throw new Error("template not found");
  if(Array.isArray(parsed))throw new Error("Для изменения выбранного шаблона нужен один JSON-объект, не массив.");
  pushHistory();
  var result=applyTemplateDefinitionEdits(target,parsed);
  persistUserLibrary(target.librarySource==="user"?"update-user-template-json":"fork-system-template-json-to-user");
  if(result){state.activeTemplateId=result.id;state.selectedTemplateIds=[result.id];state.templateAnchorId=result.id;renderUI(true)}
  return result;
}
function bindTemplateBrowser(){
  if($("fileTemplateLib"))$("fileTemplateLib").onchange=function(e){var f=e.target.files&&e.target.files[0];if(f)importTemplateLibraryFile(f);e.target.value=""};
  if($("libraryModeSelect"))$("libraryModeSelect").onchange=function(){setLibraryMode(this.value)};
  if($("tplSearch"))$("tplSearch").oninput=function(){state.templateSearch=this.value||"";renderTemplateBrowser()};
  if($("tplTagsToggle"))$("tplTagsToggle").onclick=function(){state.templateShowTags=!state.templateShowTags;renderTemplateBrowser()};
  if($("tplAddBtn"))$("tplAddBtn").onclick=openTemplateAddPopup;
  if($("tplAddClose"))$("tplAddClose").onclick=function(){closeModal("tplAddModal")};
  if($("tplAddValidate"))$("tplAddValidate").onclick=function(){try{validateTemplateAddPopup()}catch(e){console.error(e)}};
  if($("tplAddConfirm"))$("tplAddConfirm").onclick=function(){try{addTemplatesFromPopup()}catch(e){console.error(e);alert(e&&e.message||"Ошибка добавления шаблона")}};
  if($("tplStyleMgrClose"))$("tplStyleMgrClose").onclick=function(){closeModal("tplStyleMgrModal")};
  if($("tplStyleMgrAddGroup"))$("tplStyleMgrAddGroup").onclick=addGroupFromManager;
  if($("tplStyleMgrAddStyle"))$("tplStyleMgrAddStyle").onclick=addStyleFromManager;
  var sl=$("tplSizeSlider");if(sl){sl.value=templateCardWidth();sl.oninput=function(){state.templateCardWidth=+sl.value;applyTemplateCardWidth()}}
  document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest(".mdd")){mddOpenId=null;document.querySelectorAll(".mdd.open").forEach(function(x){x.classList.remove("open")})}if(e.target.classList&&e.target.classList.contains("modal"))e.target.classList.remove("on")});
}

flushPendingTemplateLibrary();
ensureTemplateAutoload();
bindTemplateBrowser();

var PMS_TemplateBrowser={
  enabled:true,
  open:function(){setLibraryMode("templates")},
  close:function(){setLibraryMode("assets")},
  importLibrary:function(manifest,opts){return mergeTemplateLibraryIntoProject(manifest,opts)},
  importTemplateLibraryData:importTemplateLibraryData,
  importTemplateLibraryFile:importTemplateLibraryFile,
  evalTemplateLibraryScript:evalTemplateLibraryScript,
  setLibraryMode:setLibraryMode,
  syncLibraryPane:syncLibraryPane,
  renderTemplateBrowser:renderTemplateBrowser,
  renderLibraryPane:renderLibraryPane,
  visibleTemplates:visibleTemplates,
  getDragTemplateIds:getDragTemplateIds,
  fitAllTemplateTiles:fitAllTemplateTiles,
  templateCardGesture:templateCardGesture,
  registerStyleSystems:registerStyleSystems,
  registerTemplates:registerTemplates,
  flushPendingTemplateLibrary:flushPendingTemplateLibrary,
  ensureTemplateAutoload:ensureTemplateAutoload,
  persistUserLibrary:persistUserLibrary,
  exportUserLibraryFile:exportUserLibraryFile,
  openTemplateAddPopup:openTemplateAddPopup,
  openTemplateStyleManager:openTemplateStyleManager,
  duplicateTemplateSelectionToUser:duplicateTemplateSelectionToUser,
  templateJsonForSelection:templateJsonForSelection,
  applyTemplateJsonText:applyTemplateJsonText,
  userLibraryScript:userLibraryScript,
  bind:bindTemplateBrowser
};

if(window.PMS&&PMS.registerModule)PMS.registerModule("templates.browser",PMS_TemplateBrowser);

// ---- Обновление библиотек без перезапуска (Electron) ----
// Main Process читает templates/ рекурсивно (*.js, *.json). Renderer получает только содержимое
// этих файлов. Ошибка одного файла не очищает уже загруженную библиотеку, user.js не
// переобучается при обновлении, проект и таймлайн не изменяются.
function pmsProjectSnapshotWithoutLibrary(){
  var copy=Object.assign({},project);
  delete copy.templateLibrary;
  return JSON.stringify(copy);
}
function pmsLibraryConflictVersions(rec){
  return Array.isArray(rec.libraryVersions)?rec.libraryVersions:[];
}
function resolveTemplateLibraryConflicts(){
  var lib=ensureProjectTemplateLibrary();
  // Выбор версии — пользовательское действие: фиксируется в истории отдельной записью.
  commitHistory();
  var conflicts=lib.templates.filter(function(t){return t.libraryConflict&&t.librarySource!=="user"});
  if(!conflicts.length)return 0;
  var resolved=0;
  conflicts.forEach(function(t){
    var versions=pmsLibraryConflictVersions(t);
    var current=versions.filter(function(v){return v.fp===t.libraryPrimaryFp})[0]||versions[0];
    var alt=versions.filter(function(v){return v!==current})[0];
    if(!alt)return;
    var ok=window.confirm("Конфликт варианта «"+(t.tpl||t.id)+"|"+(t.format||"")+"».\n"+
      "Текущая версия: "+(current.files||[]).join(", ")+"\n"+
      "Другая версия: "+(alt.files||[]).join(", ")+"\n\n"+
      "OK — применить другую версию.\nОтмена — оставить текущую. Спорная версия до выбора не применяется.");
    if(!ok)return;
    lib.systemLibrary.templates=PMS_TemplateLibraryMerge.choosePrimary(lib.systemLibrary.templates,PMS_TemplateLibraryMerge.variantKey(t),alt.fp);
    ensureProjectTemplateLibrary();
    resolved++;
  });
  if(resolved)commitHistory();
  return resolved;
}
// Единый механизм обновления: Main Process читает templates/ рекурсивно (*.js, *.json).
// opts: quiet — без окон успеха и без вопроса о конфликтах; openInspector — открыть инспектор при проблемах;
// startup — стартовая загрузка (без открытия окна). Результаты сохраняются в window.PMS_LAST_INSPECTION.
function pmsHasElectronLibraryBridge(){var b=window.PMS_ELECTRON;return !!(b&&typeof b.listTemplateSources==="function")}
function pmsConflictDetails(lib){
  return ((lib.systemLibrary&&lib.systemLibrary.templates)||[]).filter(function(t){return t._conflict}).map(function(t){
    return {key:(t.tpl||t.id)+"|"+(t.format||t.aspect||""),tpl:t.tpl||t.id,format:t.format||t.aspect||"",primaryFp:t._primaryFp||null,
      versions:(t._versions||[]).map(function(v){return {fp:v.fp,files:(v.files||[]).slice(),styles:v.styles||{}}})};
  });
}
async function refreshTemplateLibrarySources(opts){
  opts=opts||{};
  var quiet=!!opts.quiet;
  var bridge=window.PMS_ELECTRON;
  if(!pmsHasElectronLibraryBridge()){if(!quiet)alert("Обновление библиотек доступно только в приложении PMS (Electron).");return null}
  var startedAt=Date.now();
  var listing;
  try{listing=await bridge.listTemplateSources()}catch(e){
    var fatal=String(e&&e.message||e);
    window.PMS_LAST_INSPECTION={startedAt:new Date(startedAt).toISOString(),durationMs:Date.now()-startedAt,fatal:fatal,listing:{files:[],warnings:[]},perFile:{},reports:{},conflicts:[],totals:{},projectSame:true};
    if(!quiet)alert("Не удалось прочитать templates/: "+fatal);
    if(window.PMS_inspectorAfterRun)window.PMS_inspectorAfterRun(window.PMS_LAST_INSPECTION,{open:!!opts.openInspector&&!opts.startup});
    return window.PMS_LAST_INSPECTION;
  }
  var listWarnings=(listing&&listing.warnings)||[];
  var files=((listing&&listing.files)||[]).slice().sort(function(a,b){return String(a.relativePath).localeCompare(String(b.relativePath))});
  var projectBefore=pmsProjectSnapshotWithoutLibrary();
  // Точка истории фиксируется до изменений и удаляется, если обновление ничего не изменило.
  var hist=state.history,histStack=hist.stack.slice(),histIndex=hist.index;
  commitHistory();
  var stateBefore=JSON.stringify(snapshot());
  var perFile={},reports={};
  window.PMS_LAST_LIBRARY_MERGE={};
  pmsLibraryRefreshing=true;
  try{
    files.forEach(function(f){
      var rel=String(f.relativePath||"");
      if(f.error){perFile[rel]={status:"error",messages:[f.error]};return}
      if(/(^|\/)user\.js$/i.test(rel)){perFile[rel]={status:"skipped",messages:["пользовательский слой защищён"]};return}
      try{
        if(/\.json$/i.test(rel)){
          var json=JSON.parse(f.content);
          if(userLibraryPayloadLooksValid(json)){perFile[rel]={status:"skipped",messages:["пользовательский JSON не применяется при обновлении"]};return}
          if(!importTemplateLibraryData(json,rel,{sourceKind:"system",sourceFile:rel,silent:true,keepFilters:true,autoMode:false})){
            perFile[rel]={status:"error",messages:["нет шаблонов html-slide (библиотека сохранена)"]};return;
          }
        }else evalTemplateLibraryScript(f.content,rel,{sourceKind:"system",sourceFile:rel});
        var rep=(window.PMS_LAST_LIBRARY_MERGE||{})[rel];
        if(!rep||rep.file!==rel||!rep.records){perFile[rel]={status:"error",messages:["нет допустимых записей шаблонов (библиотека сохранена)"]};return}
        perFile[rel]={status:"loaded",messages:[]};
        reports[rel]=rep;
      }catch(e){perFile[rel]={status:"error",messages:[String(e&&e.message||e)],stack:String(e&&e.stack||"")}}
    });
  }finally{pmsLibraryRefreshing=false}
  var projectSame=pmsProjectSnapshotWithoutLibrary()===projectBefore;
  if(JSON.stringify(snapshot())!==stateBefore)commitHistory();
  else if(hist.stack.length!==histStack.length){hist.stack=histStack;hist.index=histIndex;}
  renderLibraryPane();
  var lib=ensureProjectTemplateLibrary();
  var conflicts=pmsConflictDetails(lib);
  var totals={added:[],changed:[],unchanged:[],removed:[]};
  Object.keys(reports).forEach(function(rel){var r=reports[rel];
    totals.added=totals.added.concat(r.added);totals.changed=totals.changed.concat(r.changed);
    totals.unchanged=totals.unchanged.concat(r.unchanged);totals.removed=totals.removed.concat(r.removed);});
  var loaded=Object.keys(perFile).filter(function(r){return perFile[r].status==="loaded"});
  var skipped=Object.keys(perFile).filter(function(r){return perFile[r].status==="skipped"});
  var errors=[];
  Object.keys(perFile).forEach(function(r){if(perFile[r].status==="error")errors.push({file:r,error:perFile[r].messages.join("; "),stack:perFile[r].stack||""})});
  var run={startedAt:new Date(startedAt).toISOString(),durationMs:Date.now()-startedAt,fatal:null,
    listing:{files:files.map(function(f){return {relativePath:String(f.relativePath||""),size:f.size==null?null:f.size,error:f.error||null}}),warnings:listWarnings.slice()},
    perFile:perFile,reports:reports,totals:totals,conflicts:conflicts,projectSame:projectSame,
    loaded:loaded,skipped:skipped,errors:errors};
  window.PMS_LAST_INSPECTION=run;
  var problems=errors.length+listWarnings.length+conflicts.length;
  if(!quiet){
    var lines=[
      "Загружено файлов: "+loaded.length+(loaded.length?" ("+loaded.join(", ")+")":""),
      "Добавлено вариантов: "+totals.added.length+", изменено: "+totals.changed.length+", без изменений: "+totals.unchanged.length,
      "Удалено из источника: "+totals.removed.length,
      "Конфликтов содержимого: "+conflicts.length+(conflicts.length?" — спорные версии не применены автоматически":""),
      "Проект и таймлайн: "+(projectSame?"без изменений":"ИЗМЕНЕНЫ — проверьте")
    ];
    if(skipped.length)lines.push("Пропущено: "+skipped.map(function(r){return r+" ("+perFile[r].messages.join("; ")+")"}).join("; "));
    if(listWarnings.length)lines.push("Предупреждения: "+listWarnings.join("; "));
    if(errors.length)lines.push("Ошибки (библиотека сохранена):\n"+errors.map(function(e){return "— "+e.file+": "+e.error}).join("\n"));
    alert("Обновление библиотек\n\n"+lines.join("\n"));
  }
  if(window.PMS_inspectorAfterRun)window.PMS_inspectorAfterRun(run,{open:!!opts.openInspector&&!opts.startup&&(!quiet||problems>0)});
  if(!quiet&&conflicts.length&&window.confirm("Разрешить конфликты сейчас? Для каждого конфликта можно выбрать версию.")){
    resolveTemplateLibraryConflicts();
    renderLibraryPane();
  }
  return run;
}
(function bindTemplateLibraryRefresh(){
  var b=document.getElementById("btnRefreshTemplateLibs");
  if(!b)return;
  if(!window.PMS_ELECTRON||typeof window.PMS_ELECTRON.listTemplateSources!=="function"){b.style.display="none";return}
  b.addEventListener("click",function(){refreshTemplateLibrarySources()});
})();
