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
function importTemplateLibraryData(data,fileName,opts){
  opts=opts||{};
  var normalized=normalizeSandboxLibraryManifest(data||{});
  if(!normalized.templates.length){if(!opts.silent)alert("Template Library не содержит шаблонов html-slide");return null}
  replaceTemplateLibrarySectionData(normalized,{sourceKind:opts.sourceKind||"system",sourceFile:fileName||opts.sourceFile||"templates/librarymotion.js"});
  rememberTemplateSelectionAfterLibraryUpdate();
  if(!opts.keepFilters){state.templateStyleFilter=[];state.templateGroupFilter=[];state.templateTagFilter=[];state.templateAspectFilter=[];state.templateSearch="";if($("tplSearch"))$("tplSearch").value=""}
  if(fileName&&!project.name)project.name=fileName.replace(/\.(json|js)$/i,"");
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
function importTemplateLibraryFile(file){
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var text=String(reader.result||"");
      pushHistory();
      if(/\.js$/i.test(file&&file.name||""))evalTemplateLibraryScript(text,file.name||"template-library.js",{sourceKind:/user\.js$/i.test(file&&file.name||"")?"user":"system",sourceFile:file&&file.name||"template-library.js"});
      else{
        var json=JSON.parse(text);
        if(userLibraryPayloadLooksValid(json))window.PMS_registerUserLibrary(json);
        else importTemplateLibraryData(json,file&&file.name||"library.json",{sourceKind:"system"});
      }
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
  section.styleSystems=Object.assign({},section.styleSystems||{},styleSystems||{});
  ensureProjectTemplateLibrary();
  if(state.libraryMode==="templates")renderTemplateBrowser();
}
function registerTemplates(payload,opts){
  opts=opts||{};
  var kind=opts.sourceKind||pmsTemplateRegistrationContext.sourceKind||"system";
  var fileName=opts.sourceFile||pmsTemplateRegistrationContext.sourceFile||"librarymotion.js";
  var normalized=normalizeRegisteredTemplatesPayload(payload),section=templateLibrarySection(kind);
  normalized.styleSystems=Object.assign({},section.styleSystems||{},normalized.styleSystems||{});
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
  autoloadTemplateSourceList(PMS_TEMPLATE_AUTOLOAD_SOURCES,0);
}
function templateFilterMatch(t){
  var q=(state.templateSearch||"").trim().toLowerCase();
  if(state.templateStyleFilter.length&&state.templateStyleFilter.indexOf(String(t.internalStyleId||""))<0)return false;
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
function renderTemplateDropdown(hostId,label,allOptions,selected,onToggle,emptyLabel){
  var host=$(hostId);if(!host)return;
  var options=allOptions.map(normalizeDropdownOption),labelMap={};
  options.forEach(function(opt){labelMap[opt.value]=opt.label});
  var wrap=document.createElement("div");wrap.className="mdd";wrap.id=hostId;
  var btn=document.createElement("button");btn.type="button";btn.className="btn mddBtn";
  btn.innerHTML='<span class="mddBtnText"><span class="mddBtnLabel">'+esc(label)+'</span><span class="mddBtnValue">'+esc(templateSelectionLabel(selected,emptyLabel||"Все",labelMap))+'</span></span><span class="mddBtnCaret">▾</span>';
  var menu=document.createElement("div");menu.className="mddMenu";
  if(options.length===0)menu.innerHTML='<div class="inspMeta">нет данных</div>';
  options.forEach(function(opt){
    var row=document.createElement("label");row.className="mddItem";
    var input=document.createElement("input");input.type="checkbox";input.checked=selected.indexOf(opt.value)>=0;
    input.onchange=function(e){e.stopPropagation();onToggle(opt.value,input.checked)};
    var text=document.createElement("span");text.className="mddItemText";text.innerHTML='<span>'+esc(opt.label)+'</span>'+(opt.desc?'<small>'+esc(opt.desc)+'</small>':'');
    row.appendChild(input);row.appendChild(text);menu.appendChild(row);
  });
  btn.onclick=function(e){e.stopPropagation();document.querySelectorAll(".mdd.open").forEach(function(x){if(x!==wrap)x.classList.remove("open")});wrap.classList.toggle("open")};
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
  openTemplateInspectorForSelection();
}
function renderTemplateGrid(){
  var grid=$("tplGrid"),list=visibleTemplates();if(!grid)return;
  var cols=clamp(state.templateColumns|0,1,3);grid.style.gridTemplateColumns="repeat("+cols+", minmax(0, 1fr))";
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
    });
    grid.appendChild(tile);
  });
  if(!list.length)grid.innerHTML='<div class="inspMeta">Шаблоны не найдены. Проверь фильтры или librarymotion.js/user.js.</div>';
  document.querySelectorAll(".tplColBtn").forEach(function(btn){btn.classList.toggle("active",(btn.dataset.cols|0)===cols)});
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
function templateCardGesture(t,e){
  var wantsReplace=e.ctrlKey&&!e.shiftKey&&!e.altKey;
  var wantsInsertEnd=e.altKey&&!e.ctrlKey;
  var wantsInsertAfter=e.ctrlKey&&e.shiftKey;
  if(!wantsReplace&&!wantsInsertEnd&&!wantsInsertAfter)return false;
  var eb=editingBlock();
  if(wantsReplace&&!eb)return false;
  e.preventDefault();
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
  renderTemplateDropdown("tplStyleFilter","Стили",templateStyleOptions(),state.templateStyleFilter,function(opt,on){toggleMultiFilter(state.templateStyleFilter,opt,on);renderTemplateBrowser()},"Все стили");
  renderTemplateDropdown("tplGroupFilter","Группы",templateGroupOptions(),state.templateGroupFilter,function(opt,on){toggleMultiFilter(state.templateGroupFilter,opt,on);renderTemplateBrowser()},"Все группы");
  renderTemplateDropdown("tplTagFilter","Теги",templateTags(),state.templateTagFilter,function(opt,on){toggleMultiFilter(state.templateTagFilter,opt,on);renderTemplateBrowser()},"Все теги");
  renderTemplateDropdown("tplAspectFilter","Формат",templateAspects(),state.templateAspectFilter,function(opt,on){toggleMultiFilter(state.templateAspectFilter,opt,on);renderTemplateBrowser()},"Все форматы");
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
  document.querySelectorAll(".tplColBtn").forEach(function(btn){btn.onclick=function(){state.templateColumns=clamp(btn.dataset.cols|0,1,3);renderTemplateGrid()}});
  document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest(".mdd"))document.querySelectorAll(".mdd.open").forEach(function(x){x.classList.remove("open")});if(e.target.classList&&e.target.classList.contains("modal"))e.target.classList.remove("on")});
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
