"use strict";

/* Stage 3: app layout, inspector, library pane, high-level UI rendering. */

function syncAspectBoxes(){
  var ar=aspectRatio(project.aspect);
  function fitBox(wrapId,boxId){
    var wrap=$(wrapId),box=$(boxId);
    if(!wrap||!box||wrap.classList.contains("hide"))return;
    var W=wrap.clientWidth,H=wrap.clientHeight;if(W<=1||H<=1)return;
    var w,h;if(W/H>ar){h=H;w=H*ar}else{w=W;h=W/ar}
    box.style.width=Math.floor(w)+"px";box.style.height=Math.floor(h)+"px";
  }
  fitBox("panoWrap","panoBox");fitBox("monWrap","monBox");resizePanoGL();if(typeof resizeFlatImageCanvas==="function")resizeFlatImageCanvas();
}
function applyMode(){
  var m=state.mode;if(MODE_ORDER.indexOf(m)<0)m=state.mode="pano-mon-tl";
  var stage=$("stage"),left=$("leftZone");
  stage.classList.remove("no-left","no-right","only-monitor");left.classList.remove("stack-both");
  $("panoWrap").classList.add("hide");$("panoBar").classList.add("hide");$("imageBar").classList.add("hide");$("galleryWrap").classList.add("hide");if($("templatesWrap"))$("templatesWrap").classList.add("hide");
  var sel=$("modeSelect");if(sel&&sel.value!==m)sel.value=m;
  var showBottom=true,showSource=false,showGal=false,showMon=false,stackBoth=false;
  switch(m){
    case "pano-mon-tl":showSource=true;showMon=true;break;
    case "gal-mon-tl":showGal=true;showMon=true;break;
    case "gal-pano-tl":showSource=true;showGal=true;stackBoth=true;break;
    case "pano-tl":showSource=true;break;
    case "gal-tl":showGal=true;break;
    case "mon-tl":showMon=true;break;
    case "mon-only":showMon=true;showBottom=false;stage.classList.add("only-monitor","no-left");break;
  }
  if(m!=="mon-only"){
    if(!showMon)stage.classList.add("no-right");
    if(!showSource&&!showGal)stage.classList.add("no-left");
  }
  if(showSource){
    $("panoWrap").classList.remove("hide");
    if(currentSourceType()==="image")$("imageBar").classList.remove("hide");
    else $("panoBar").classList.remove("hide");
  }
  if(stackBoth)left.classList.add("stack-both");
  $("bottom").style.display=showBottom?"":"none";
  if(!stage.classList.contains("no-left")&&!stage.classList.contains("no-right")){
    $("leftZone").style.flexBasis=state.splitPct+"%";$("rightZone").style.flexBasis=(100-state.splitPct)+"%";
  }else{$("leftZone").style.flexBasis="";$("rightZone").style.flexBasis=""}
  if(!showSource){if(state.draw.on)setDrawMode(false);if(state.titles.on)setTitlesMode(false)}
  if(typeof syncSourceViewerUI==="function")syncSourceViewerUI();
  if(showGal&&typeof syncLibraryPane==="function")syncLibraryPane();
  requestAnimationFrame(function(){syncAspectBoxes();drawMonitor();if(typeof drawActiveSource==="function")drawActiveSource();else drawPano();drawTimeline();layoutTitlesViewport()});
}
function setMode(m){if(MODE_ORDER.indexOf(m)<0)return;if(state.mode!=="mon-only")state.prevMode=state.mode;state.mode=m;applyMode()}
function setInspOpen(on){
  state.inspOpen=!!on;$("work").classList.toggle("insp-open",state.inspOpen);
  if(state.inspOpen)renderInspector();else $("inspectorBody").innerHTML="";
  requestAnimationFrame(function(){syncAspectBoxes();drawMonitor();resizePanoGL();if(typeof drawActiveSource==="function")drawActiveSource()});
}
function setInspTab(t){
  state.inspTab=t;
  document.querySelectorAll("#inspectorPane .tab").forEach(function(el){el.classList.toggle("active",el.dataset.insp===t)});
  if(state.inspOpen)renderInspector();
}
function syncInspectorTabs(){
  document.querySelectorAll("#inspectorPane .tab").forEach(function(el){el.classList.toggle("active",el.dataset.insp===state.inspTab)});
}

function renderInspector(){
  var box=$("inspectorBody");if(!state.inspOpen){box.innerHTML="";return}
  syncInspectorTabs();
  if(state.inspTab==="project")renderInspProject(box);
  else if(state.inspTab==="asset")renderInspAsset(box);
  else if(state.inspTab==="template")renderInspTemplate(box);
  else renderInspBlock(box);
}
function toggleFilterValue(list,opt,on){var i=list.indexOf(opt);if(on&&i<0)list.push(opt);if(!on&&i>=0)list.splice(i,1)}
function rndAssetFolderOptions(){
  return [{value:"root",label:"Корень",desc:""}].concat((project.folders||[]).map(function(f){return{value:f.id,label:f.name,desc:""}}));
}
function rndAssetTagOptions(){
  return (project.tags||[]).map(function(t){return{value:t.id,label:t.name,desc:""}});
}
function rndTemplateStyleOptions(){return templateInternalStyles().map(function(s){return{value:s.id,label:s.name,desc:""}})}
function rndTemplateGroupOptions(){return templateInternalGroups().map(function(g){return{value:g.id,label:g.name,desc:""}})}
function rndTemplateTagOptions(){return (project.tags||[]).map(function(t){return{value:t.id,label:t.name,desc:""}})}
function rndTemplateAspectOptions(){return templateAspects().map(function(a){return{value:a,label:a,desc:""}})}
function renderSharedRndFilterControls(prefix,opts){
  opts=opts||{};
  if($(prefix+"Folders"))renderTemplateDropdown(prefix+"Folders","Папки",rndAssetFolderOptions(),ensureStringArray(state.rndAssetFolderFilter),function(opt,on){toggleFilterValue(state.rndAssetFolderFilter,opt,on);if(opts.onChange)opts.onChange();},"Все");
  if($(prefix+"Tags"))renderTemplateDropdown(prefix+"Tags","Тэги",rndAssetTagOptions(),ensureStringArray(state.rndAssetTagFilter),function(opt,on){toggleFilterValue(state.rndAssetTagFilter,opt,on);state.tagFilterRnd=ensureStringArray(state.rndAssetTagFilter);if(opts.onChange)opts.onChange();},"Все");
  if($(prefix+"TplStyles"))renderTemplateDropdown(prefix+"TplStyles","Стили",rndTemplateStyleOptions(),ensureStringArray(state.rndTemplateStyleFilter),function(opt,on){toggleFilterValue(state.rndTemplateStyleFilter,opt,on);if(opts.onChange)opts.onChange();},"Все");
  if($(prefix+"TplGroups"))renderTemplateDropdown(prefix+"TplGroups","Категории",rndTemplateGroupOptions(),ensureStringArray(state.rndTemplateGroupFilter),function(opt,on){toggleFilterValue(state.rndTemplateGroupFilter,opt,on);if(opts.onChange)opts.onChange();},"Все");
  if($(prefix+"TplTags"))renderTemplateDropdown(prefix+"TplTags","Тэги",rndTemplateTagOptions(),ensureStringArray(state.rndTemplateTagFilter),function(opt,on){toggleFilterValue(state.rndTemplateTagFilter,opt,on);if(opts.onChange)opts.onChange();},"Все");
  if($(prefix+"TplAspects"))renderTemplateDropdown(prefix+"TplAspects","Формат",rndTemplateAspectOptions(),ensureStringArray(state.rndTemplateAspectFilter),function(opt,on){toggleFilterValue(state.rndTemplateAspectFilter,opt,on);if(opts.onChange)opts.onChange();},"Все");
}
function renderInspProject(box){
  var tlSec=Math.round((timelineFrames()/project.fps)*100)/100;
  var defVal=project.defaultBlockDurUnit==="seconds"?Math.round((+project.defaultBlockDur)*100)/100:(project.defaultBlockDur|0);
  var lib=ensureProjectTemplateLibrary();
  var html='<div class="inspTitle">Проект</div>';
  html+='<div class="field"><span>Название</span><input id="ipName" type="text" value="'+esc(project.name)+'" /></div>';
  html+='<div class="grid2"><div class="field"><span>FPS</span><input id="ipFps" type="number" min="1" max="60" value="'+project.fps+'" /></div>';
  html+='<div class="field"><span>Аспект</span><select id="ipAspect">'+aspectOptions(project.aspect)+'</select></div></div>';
  html+='<div class="grid2"><div class="field"><span>Ширина out</span><input id="ipW" type="number" min="16" value="'+project.outW+'" /></div>';
  html+='<div class="field"><span>Высота out</span><input id="ipH" type="number" min="16" value="'+project.outH+'" /></div></div>';
  html+='<div class="field"><span>Длина таймлайна (сек)</span><input id="ipTlSec" type="number" min="0.1" step="0.1" value="'+tlSec+'" /></div>';
  html+='<div class="inspTitle" style="margin-top:12px">Блок по умолчанию</div>';
  html+='<div class="grid2"><div class="field"><span>Авто-длина</span><input id="ipDefDur" type="number" min="0.1" step="0.1" value="'+defVal+'" /></div>';
  html+='<div class="field"><span>Единицы</span><select id="ipDefUnit"><option value="frames"'+(project.defaultBlockDurUnit==="frames"?" selected":"")+'>кадры</option><option value="seconds"'+(project.defaultBlockDurUnit==="seconds"?" selected":"")+'>секунды</option></select></div></div>';
  html+='<div class="inspMeta">≈ '+defaultDur()+'f · main '+contentLength()+'f · ov '+overlayContentLength()+'f · templates '+lib.templates.length+'</div>';
  html+='<hr style="border:none;border-top:1px solid #222;margin:14px 0" /><div class="inspTitle">Template Library</div>';
  html+='<div class="inspMeta">System: <b>'+((lib.systemLibrary&&lib.systemLibrary.templates||[]).length)+'</b> · User: <b>'+((lib.userLibrary&&lib.userLibrary.templates||[]).length)+'</b><br>Автозагрузка system: <b>templates/librarymotion.js</b> → fallback <b>templates/library.js</b><br>Пользовательская библиотека: <b>'+(esc((lib.userLibrary&&lib.userLibrary.file)||'templates/user.js'))+'</b></div>';
  html+='<div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="btn primary" type="button" id="ipOpenTpl">Открыть галерею шаблонов</button><button class="btn" type="button" id="ipStyleMgr">Менеджер стилей</button><button class="btn" type="button" id="ipExportUserJs">Скачать user.js</button></div>';
  html+='<div class="inspMeta" style="margin-top:8px">Internal groups: '+lib.internalGroups.length+' · internal styles: '+lib.internalStyles.length+(lib.lastUserPersistError?'<br><span style="color:#ff8787">Ошибка записи user.js: '+esc(lib.lastUserPersistError)+'</span>':'')+'</div>';
  html+='<hr style="border:none;border-top:1px solid #222;margin:14px 0" /><div class="inspTitle">RND-сборка</div>';
  html+='<div class="field"><span>Режим</span><select id="ipRndMode"><option value="images"'+(state.rndBuildMode==='images'?' selected':'')+'>картинки</option><option value="templates"'+(state.rndBuildMode==='templates'?' selected':'')+'>шаблоны</option><option value="mixed"'+(state.rndBuildMode==='mixed'?' selected':'')+'>смешанный</option></select></div>';
  html+='<div class="inspTitle" style="margin-top:6px">Картинки</div>';
  html+='<div class="grid2"><div class="mdd" id="ipRndFolders"></div><div class="mdd" id="ipRndTags"></div></div>';
  html+='<div class="inspTitle" style="margin-top:12px">Шаблоны</div>';
  html+='<div class="grid2"><div class="mdd" id="ipRndTplStyles"></div><div class="mdd" id="ipRndTplGroups"></div><div class="mdd" id="ipRndTplTags"></div><div class="mdd" id="ipRndTplAspects"></div></div>';
  html+='<div class="grid2" style="margin-top:12px"><div class="field"><span>Блоков</span><input id="ipRndN" type="number" min="1" value="'+Math.max(1,project.blocks.length||8)+'" /></div>';
  html+='<div class="field"><span>Длина (кадры)</span><input id="ipRndDur" type="number" min="1" value="'+defaultDur()+'" /></div></div>';
  html+='<div class="row"><button class="btn primary" type="button" id="ipRndGo">Пересобрать</button></div>';
  html+='<div class="inspMeta">Пустой выбор в любом фильтре = использовать всё. Image-блоки сбрасывают scale/pos/fit/anim. Template-блоки создаются живыми editable-блоками.</div>';
  html+='<hr style="border:none;border-top:1px solid #222;margin:14px 0" /><div class="inspTitle">Теги</div>';
  html+='<div class="row" style="margin-bottom:8px"><input id="ipNewTag" type="text" placeholder="новый тег" class="btn" style="flex:1" /><button class="btn" type="button" id="ipAddTag">+</button></div>';
  html+='<div class="chipRow" id="ipTags"></div>';
  box.innerHTML=html;
  $("ipName").onchange=function(){project.name=this.value||"Untitled"};
  $("ipFps").onchange=function(){var old=project.fps,sec=timelineFrames()/Math.max(1,old);project.fps=clamp(this.value|0,1,60);$("fps").value=project.fps;project.timelineFrames=Math.max(Math.max(contentLength(),overlayContentLength()),Math.round(sec*project.fps));renderUI(true)};
  $("ipAspect").onchange=function(){project.aspect=this.value;$("aspectSelect").value=this.value;if($("aspectSelectImage"))$("aspectSelectImage").value=this.value;syncOutFromAspect();applyMode();layoutTitlesViewport();renderUI(true)};
  $("ipW").onchange=function(){project.outW=Math.max(16,this.value|0);syncOutFromAspect();layoutTitlesViewport()};
  $("ipH").onchange=function(){project.outH=Math.max(16,this.value|0)};
  $("ipTlSec").onchange=function(){pushHistory();setTimelineSec(this.value);renderUI(true)};
  function applyDefDur(){project.defaultBlockDurUnit=$("ipDefUnit").value;project.defaultBlockDur=+$("ipDefDur").value||(project.defaultBlockDurUnit==="seconds"?0.5:15);renderInspector()}
  $("ipDefDur").onchange=applyDefDur;$("ipDefUnit").onchange=applyDefDur;
  $("ipRndMode").onchange=function(){state.rndBuildMode=this.value||"images"};
  $("ipRndGo").onclick=function(){rndRebuild($("ipRndN").value|0,$("ipRndDur").value|0);renderUI(true)};
  $("ipAddTag").onclick=function(){var n=($("ipNewTag").value||"").trim();if(!n)return;pushHistory();project.tags.push({id:uid("t"),name:n,color:randColor()});$("ipNewTag").value="";renderInspector()};
  $("ipOpenTpl").onclick=function(){setMode("gal-mon-tl");setLibraryMode("templates");setInspOpen(true);setInspTab("template");renderUI(true)};
  $("ipStyleMgr").onclick=function(){if(typeof openTemplateStyleManager==="function")openTemplateStyleManager()};
  $("ipExportUserJs").onclick=function(){if(typeof exportUserLibraryFile==="function")exportUserLibraryFile()};
  var tip=$("ipTags");
  project.tags.forEach(function(t){
    var c=document.createElement("span");c.className="chip";c.textContent=t.name;c.style.borderColor=t.color;
    var x=document.createElement("span");x.className="x";x.textContent="×";
    x.onclick=function(e){e.stopPropagation();pushHistory();project.tags=project.tags.filter(function(x){return x.id!==t.id});project.assets.forEach(function(a){a.tagIds=(a.tagIds||[]).filter(function(id){return id!==t.id})});renderInspector();renderLibraryPane()};
    c.appendChild(x);tip.appendChild(c);
  });
  renderSharedRndFilterControls("ipRnd",{onChange:function(){renderInspProject(box)}});
}
function renderInspAsset(box){
  var a=primaryAsset();
  if(!a){box.innerHTML='<div class="inspEmpty">Выделите картинку. Shift=диапазон. Ctrl+click=replace / slot apply. Alt=в конец TL. Ctrl+Shift=после блока.</div>';return}
  a=ensureAssetFolderState(a);
  var memberships=assetFolderIds(a),currentFolder=project.activeFolderId;
  var html='<div class="inspTitle">Картинка</div>';
  if(a.url)html+='<img class="thumbPrev" src="'+a.url+'" />';
  html+='<div class="field"><span>Имя</span><input id="iaName" type="text" value="'+esc(a.name)+'" /></div>';
  html+='<div class="field"><span>Размещение</span><label class="row"><input id="iaRootVisible" type="checkbox" '+(assetVisibleInRoot(a)?'checked':'')+' /> Показывать в корне</label><select id="iaFolderAdd"><option value="">+ добавить в папку…</option>';
  project.folders.forEach(function(f){html+='<option value="'+f.id+'">'+esc(f.name)+'</option>'});
  html+='</select><div class="chipRow" id="iaFolders"></div></div><div class="field"><span>Теги</span><div class="chipRow" id="iaTags"></div></div>';
  html+='<div class="inspMeta">'+a.source+' · '+a.w+'×'+a.h+(a.hasAlpha?" · alpha":"")+(a.linkGroup?" · linked":"")+'</div>';
  html+='<div class="row" style="margin-top:10px;flex-wrap:wrap">';
  html+='<button class="btn primary" type="button" id="iaToTL">На main TL</button>';
  html+='<button class="btn" type="button" id="iaToOV">На overlay TL</button>';
  html+='<button class="btn" type="button" id="iaToFlat">Открыть в flat</button>';
  if(currentFolder!=null||memberships.length||assetVisibleInRoot(a))html+='<button class="btn" type="button" id="iaUnfolder">Убрать из текущего места</button>';
  html+='<button class="btn danger" type="button" id="iaDel">Удалить из проекта</button></div>';
  box.innerHTML=html;
  $("iaName").onchange=function(){pushHistory();a.name=this.value;renderLibraryPane();drawTimeline()};
  $("iaRootVisible").onchange=function(){pushHistory();a.rootVisible=!!this.checked;if(!a.rootVisible&&!(a.folderIds||[]).length)a.rootVisible=true;renderLibraryPane();renderInspector()};
  $("iaFolderAdd").onchange=function(){if(!this.value)return;pushHistory();addMembershipToFolder(a,this.value);renderLibraryPane();renderInspector()};
  $("iaToTL").onclick=function(){pushHistory();var ids=state.selectedAssetIds.length?state.selectedAssetIds.slice():[a.id];state.selectedBlockIds=insertBlocks(ids,project.blocks.length,"main");state.selectedOverlayIds=[];renderUI(true)};
  $("iaToOV").onclick=function(){pushHistory();var ids=state.selectedAssetIds.length?state.selectedAssetIds.slice():[a.id];state.selectedOverlayIds=insertBlocks(ids,project.overlayBlocks.length,"overlay");state.selectedBlockIds=[];renderUI(true)};
  $("iaToFlat").onclick=function(){if(typeof openAssetInFlatMode==="function")openAssetInFlatMode(a.id)};
  var uf=$("iaUnfolder");
  if(uf)uf.onclick=function(){deleteAssets(state.selectedAssetIds.length?state.selectedAssetIds.slice():[a.id],"folder-only");renderUI(true)};
  $("iaDel").onclick=function(){deleteAssets(state.selectedAssetIds.length?state.selectedAssetIds.slice():[a.id],"full");renderUI(true)};
  var fbox=$("iaFolders");
  if(assetVisibleInRoot(a)){
    var rootChip=document.createElement("span");rootChip.className="chip on";rootChip.textContent="Корень";fbox.appendChild(rootChip);
  }
  memberships.forEach(function(fid){var f=(project.folders||[]).find(function(x){return x.id===fid});if(!f)return;var chip=document.createElement("span");chip.className="chip on";chip.textContent=f.name;var x=document.createElement("span");x.className="x";x.textContent="×";x.onclick=function(e){e.stopPropagation();pushHistory();removeMembershipFromFolder(a,fid);renderLibraryPane();renderInspector()};chip.appendChild(x);fbox.appendChild(chip)});
  if(!fbox.childNodes.length)fbox.innerHTML='<span class="inspMeta">не назначено</span>';
  var tip=$("iaTags");
  project.tags.forEach(function(t){
    var on=(a.tagIds||[]).indexOf(t.id)>=0,c=document.createElement("span");c.className="chip"+(on?" on":"");c.textContent=t.name;
    c.onclick=function(){
      pushHistory();
      state.selectedAssetIds.forEach(function(id){var x=findAsset(id);if(!x)return;x.tagIds=x.tagIds||[];var i=x.tagIds.indexOf(t.id);if(i>=0)x.tagIds.splice(i,1);else x.tagIds.push(t.id)});
      renderInspector();renderLibraryPane();drawTimeline();
    };
    tip.appendChild(c);
  });
}
function templateSelectionList(){
  var list=selectedTemplateRecords();
  if(!list.length&&activeTemplateRecord())list=[activeTemplateRecord()];
  return list;
}
function renderTemplateMetaSelect(selectId,list,selectedId,placeholder){
  var el=$(selectId);if(!el)return;
  el.innerHTML='';
  if(placeholder){var ph=document.createElement('option');ph.value='';ph.textContent=placeholder;el.appendChild(ph)}
  list.forEach(function(item){var opt=document.createElement('option');opt.value=item.id;opt.textContent=item.name;opt.selected=item.id===selectedId;el.appendChild(opt)});
}
function templateSourceSummary(t){return(t.librarySource==="user"?"USER":"SYSTEM")+' · '+(t.sourceFile||'—')}
function renderInspTemplate(box){
  var list=templateSelectionList();
  if(!list.length){box.innerHTML='<div class="inspEmpty">Выбери шаблон в галерее. Инспектор шаблона отделён от инспектора блока таймлайна.</div>';return}
  if(list.length>1){renderTemplateMultiInspector(box,list);return}
  renderTemplateSingleInspector(box,list[0]);
}
function renderTemplateSingleInspector(box,t){
  var styleMeta=templateStyleSystems()[t.styleSystem]||null;
  var html='<div class="inspTitle">Инспектор шаблона</div>';
  html+='<div class="presetItem on" style="cursor:default"><div><b>'+esc(t.label||t.tpl||t.id)+'</b></div><div class="pm">'+esc((t.code?t.code+' · ':'')+(t.group||'—')+' · '+(t.format||'16:9'))+'</div></div>';
  html+='<div class="grid2"><div class="field"><span>Внутренняя группа</span><select id="itplGroup"></select></div><div class="field"><span>Внутренний стиль</span><select id="itplStyle"></select></div></div>';
  html+='<div class="inspTitle" style="margin-top:12px">Адаптация</div><div id="itplAdapt">'+PMS_ADAPT.controlsHtml("itplA")+'</div>';
  html+='<div class="row" style="flex-wrap:wrap"><button class="btn primary" type="button" id="itplAdaptUpdate" disabled>Обновить шаблон</button><button class="btn" type="button" id="itplAdaptCopy" disabled>Создать копию</button></div>';
  if(t.librarySource!=="user")html+='<div class="inspMeta">Системный шаблон: «Обновить» сохраняет результат в user.js, system library не меняется.</div>';
  html+='<div class="field"><span>Источник библиотеки</span><input type="text" value="'+esc(templateSourceSummary(t))+'" disabled /></div>';
  html+='<div class="field"><span>Внешний styleSystem JSON</span><input type="text" value="'+esc(styleMeta?styleMeta.name:(t.styleSystem||'default'))+'" disabled /></div>';
  html+='<div class="field"><span>Описание</span><textarea rows="3" id="itplDesc">'+esc(t.desc||'')+'</textarea></div>';
  html+='<div class="field"><span>Теги шаблона из тегов проекта</span><div class="chipRow" id="itplTags"></div></div>';
  html+='<div class="row" style="flex-wrap:wrap"><button class="btn primary" type="button" id="itplToTitle">На таймлайн как титры</button><button class="btn" type="button" id="itplSaveDesc">Сохранить описание</button><button class="btn" type="button" id="itplDuplicate">Дубликат → user.js</button>'+(t.librarySource==="user"?'<button class="btn danger" type="button" id="itplDeleteUser">Удалить user template</button><button class="btn" type="button" id="itplExportUser">Скачать user.js</button>':'')+'</div>';
  html+='<div class="inspMeta" style="margin-top:8px">Теги шаблонов теперь назначаются теми же project tags, что и картинки. Group/style остаются внутренними. Изменение JSON system-шаблона создаёт/обновляет копию в <b>user.js</b>, не трогая system library.</div>';
  html+='<hr style="border:none;border-top:1px solid #222;margin:14px 0" /><div class="inspTitle">JSON шаблона</div>';
  html+='<div class="row" style="margin-bottom:8px;flex-wrap:wrap"><button class="btn" type="button" id="itplCopyJson">Копировать JSON</button><button class="btn primary" type="button" id="itplApplyJson">Применить JSON</button></div>';
  html+='<div class="field"><span>JSON</span><textarea id="itplJson" rows="18" class="monoArea">'+esc(JSON.stringify(templateDefinitionForEditor(t),null,2))+'</textarea></div>';
  box.innerHTML=html;
  renderTemplateMetaSelect("itplGroup",templateInternalGroups(),t.internalGroupId);
  renderTemplateMetaSelect("itplStyle",templateInternalStyles(),t.internalStyleId);
  mountLibraryAdapt(box,t);
  $("itplGroup").onchange=function(){pushHistory();applyTemplateInternalAssignments([t.id],{groupId:this.value});if(typeof persistUserLibrary==="function")persistUserLibrary("assign-template-group");renderUI(true)};
  $("itplStyle").onchange=function(){pushHistory();applyTemplateInternalAssignments([t.id],{styleId:this.value});if(typeof persistUserLibrary==="function")persistUserLibrary("assign-template-style");renderUI(true)};
  $("itplToTitle").onclick=function(){pushHistory();var block=insertTemplateAsTitleInstance(t.id);if(block){setMode("mon-tl");setInspTab("block");setInspOpen(true);renderUI(true)}};
  $("itplDuplicate").onclick=function(){if(typeof duplicateTemplateSelectionToUser==="function")duplicateTemplateSelectionToUser()};
  var del=$("itplDeleteUser");if(del)del.onclick=function(){if(!confirm("Удалить user template «"+(t.label||t.tpl||t.id)+"»?"))return;pushHistory();deleteUserTemplates([t.id]);if(typeof persistUserLibrary==="function")persistUserLibrary("delete-user-template");renderUI(true)};
  var exp=$("itplExportUser");if(exp)exp.onclick=function(){if(typeof exportUserLibraryFile==="function")exportUserLibraryFile()};
  $("itplSaveDesc").onclick=function(){
    try{
      var def=templateDefinitionForEditor(t);
      def.desc=$("itplDesc").value||"";
      pushHistory();
      var next=applyTemplateDefinitionEdits(t,def);
      if(typeof persistUserLibrary==="function")persistUserLibrary(t.librarySource==="user"?"update-template-desc":"fork-template-desc-to-user");
      if(next){state.activeTemplateId=next.id;state.selectedTemplateIds=[next.id];state.templateAnchorId=next.id;renderUI(true)}
    }catch(e){console.error(e);alert("Не удалось сохранить описание шаблона")}
  };
  var tip=$("itplTags");
  project.tags.forEach(function(tag){
    var on=ensureStringArray(t.tags).indexOf(tag.name)>=0,c=document.createElement("span");
    c.className="chip"+(on?" on":"");c.textContent=tag.name;
    c.onclick=function(){pushHistory();applyTemplateProjectTag(t.id,tag.name,!on);if(typeof persistUserLibrary==="function")persistUserLibrary('assign-template-project-tag');renderUI(true)};
    tip.appendChild(c);
  });
  if(!project.tags.length)tip.innerHTML='<span class="inspMeta">Сначала создай project tags во вкладке «Проект», потом назначай их шаблону так же, как и картинкам.</span>';
  $("itplCopyJson").onclick=function(){var val=$("itplJson").value||"";if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(val).catch(function(){});};
  $("itplApplyJson").onclick=function(){
    try{if(typeof applyTemplateJsonText==="function")applyTemplateJsonText(t,$("itplJson").value||"")}catch(e){console.error(e);alert(e&&e.message||"Не удалось применить JSON")}
  };
}
function renderTemplateMultiInspector(box,list){
  var sys=list.filter(function(t){return t.librarySource!=="user"}).length,user=list.length-sys;
  var html='<div class="inspTitle">Инспектор шаблонов</div>';
  html+='<div class="inspMeta">Выбрано шаблонов: <b>'+list.length+'</b> · system: '+sys+' · user: '+user+'</div>';
  html+='<div class="grid2" style="margin-top:10px"><div class="field"><span>Переназначить группу</span><select id="itplBulkGroup"></select></div><div class="field"><span>Переназначить стиль</span><select id="itplBulkStyle"></select></div></div>';
  html+='<div class="row" style="flex-wrap:wrap"><button class="btn primary" type="button" id="itplBulkApply">Применить к выбранным</button><button class="btn" type="button" id="itplBulkDuplicate">Дубликаты system → user.js</button>'+(user?'<button class="btn danger" type="button" id="itplBulkDeleteUser">Удалить выбранные user templates</button>':'')+'</div>';
  html+='<div class="inspMeta" style="margin-top:8px">Множественное выделение шаблонов работает отдельно от множественного выделения блоков на таймлайне.</div>';
  html+='<div class="field" style="margin-top:12px"><span>JSON выбранных шаблонов</span><textarea id="itplJsonMulti" rows="14" class="monoArea">'+esc(JSON.stringify(list.map(templateDefinitionForEditor),null,2))+'</textarea></div>';
  box.innerHTML=html;
  renderTemplateMetaSelect("itplBulkGroup",templateInternalGroups(),"",'— без изменений —');
  renderTemplateMetaSelect("itplBulkStyle",templateInternalStyles(),"",'— без изменений —');
  $("itplBulkApply").onclick=function(){
    var patch={},gid=$("itplBulkGroup").value||"",sid=$("itplBulkStyle").value||"";
    if(!gid&&!sid)return;
    if(gid)patch.groupId=gid;if(sid)patch.styleId=sid;
    pushHistory();
    applyTemplateInternalAssignments(list.map(function(t){return t.id}),patch);
    if(typeof persistUserLibrary==="function")persistUserLibrary("bulk-assign-template-meta");
    renderUI(true);
  };
  $("itplBulkDuplicate").onclick=function(){if(typeof duplicateTemplateSelectionToUser==="function")duplicateTemplateSelectionToUser()};
  var bulkDel=$("itplBulkDeleteUser");if(bulkDel)bulkDel.onclick=function(){
    var ids=list.filter(function(t){return t.librarySource==="user"}).map(function(t){return t.id});
    if(!ids.length)return;
    if(!confirm("Удалить выбранные user templates?"))return;
    pushHistory();
    deleteUserTemplates(ids);
    if(typeof persistUserLibrary==="function")persistUserLibrary("bulk-delete-user-templates");
    renderUI(true);
  };
}
function renderTemplateBlockInspector(box,b,isOv){
  ensureTemplateBlockState(b);
  var meta=b.templateMeta||{},slots=templateSlotNames(b),selSlot=state.templateEdit.selectedSlot||b.templateSelectedSlot||"",view=normalizeTemplateView(b.templateView),folderIds=templateBlockFolderIds(b),viewMode=normalizeTemplateViewMode(b.templateViewMode),zoom=normalizeTemplateZoom(b.templateZoom),isTitle=!!b.titleInstance;
  var html='<div class="inspTitle">'+(isTitle?"Title Instance":(isOv?"Overlay Template":"Template Block"))+'</div>';
  html+='<div class="presetItem on" style="cursor:default"><div><b>'+esc(meta.label||templateBlockName(b)||b.templateId)+'</b></div><div class="pm">'+esc((meta.code?meta.code+" · ":"")+(meta.group||"—")+" · "+(meta.format||project.aspect))+'</div></div>';
  html+='<div class="inspTitle" style="margin-top:12px">Адаптация</div><div id="ibAdapt">'+PMS_ADAPT.controlsHtml("ibA")+'</div>';
  html+='<div class="row" style="flex-wrap:wrap"><button class="btn primary" type="button" id="ibAdaptApply" disabled>Применить</button><button class="btn" type="button" id="ibAdaptInsert" disabled>Вставить после</button></div>';
  if(isTitle)html+='<div class="field"><span>Старт (кадры)</span><input id="ibStart" type="number" min="0" value="'+Math.max(0,b.start|0)+'" /></div>';
  html+='<div class="field"><span>Длительность (кадры)</span><input id="ibDur" type="number" min="1" value="'+(b.duration|0)+'" /></div>';
  html+='<div class="row"><label class="row"><input id="ibFix" type="checkbox" '+(b.fixed?"checked":"")+' /> Fix</label><label class="row"><input id="itVisible" type="checkbox" '+(!b.hidden?"checked":"")+' /> Видимый</label></div>';
  html+='<div class="field"><span>Zoom template</span><div class="rangeRow"><input id="itZoom" type="range" min="0.25" max="3" step="0.01" value="'+zoom+'" /><b id="itZoomV">'+zoom.toFixed(2)+'</b></div></div>';
  html+='<div class="inspTitle" style="margin-top:12px">RND</div>';
  html+='<div class="row" style="align-items:flex-start;flex-wrap:nowrap"><div class="mdd" id="itRndFolders" style="flex:1"></div><div class="mdd" id="itRndTagsSel" style="flex:1"></div></div>';
  html+='<div class="field"><span>Выбранный slot</span><input id="itSlot" type="text" value="'+esc(selSlot||"—")+'" disabled /></div>';
  html+='<div class="field"><span>Слоты медиа</span><div class="chipRow" id="itSlots"></div></div>';
  html+='<div class="row" style="flex-wrap:wrap"><button class="btn primary" type="button" id="itRndBlock">RND все окна</button><button class="btn" type="button" id="itRndSlot">RND текущее окно</button><button class="btn" type="button" id="itSaveNewTpl">Сохранить шаблон</button></div>';
  html+='<div class="inspTitle" style="margin-top:12px">Элементы</div>';
  html+='<div class="grid2"><label class="row"><input id="itBg" type="checkbox" '+(view.background?"checked":"")+' /> Фон</label><label class="row"><input id="itMedia" type="checkbox" '+(view.media?"checked":"")+' /> Картинки</label><label class="row"><input id="itText" type="checkbox" '+(view.text?"checked":"")+' /> Текст</label><button class="btn" type="button" id="itInvert">Инвертировать</button></div>';
  html+='<div class="field" style="margin-top:10px"><span>Режим скрытия элементов</span><select id="itViewMode"><option value="reflow"'+(viewMode==='reflow'?' selected':'')+'>Скрыть и перестроить вёрстку</option><option value="hide-only"'+(viewMode==='hide-only'?' selected':'')+'>Скрыть без сдвига вёрстки</option></select></div>';
  html+='<div class="inspMeta" style="margin-top:8px">Zoom масштабирует весь template viewport как единый объект. Режим hide-only скрывает элементы без сдвига компоновки. При сохранении как нового шаблона можно выбрать: сохранить текущую видимость или сделать все элементы видимыми по умолчанию.</div>';
  box.innerHTML=html;
  var ibStart=$("ibStart");if(ibStart)ibStart.onchange=function(){pushHistory();b.start=Math.max(0,this.value|0);drawTimeline();applyFrame();updateHud()};
  $("ibDur").onchange=function(){pushHistory();setBlockDuration(b.id,Math.max(1,this.value|0),isOv?"overlay":"main");drawTimeline();applyFrame()};
  $("ibFix").onchange=function(){pushHistory();b.fixed=!!this.checked;drawTimeline()};
  $("itVisible").onchange=function(){pushHistory();b.hidden=!this.checked;renderUI(true)};
  $("itZoom").oninput=function(){var v=normalizeTemplateZoom(this.value);b.templateZoom=v;$("itZoomV").textContent=v.toFixed(2);applyFrame();updateHud()};
  $("itZoom").onchange=function(){pushHistory();b.templateZoom=normalizeTemplateZoom(this.value);renderInspector()};
  $("itRndBlock").onclick=function(){pushHistory();if(randomizeTemplateBlock(b))renderUI(true)};
  $("itRndSlot").onclick=function(){pushHistory();if(randomizeSelectedTemplateSlot())renderUI(true)};
  $("itSaveNewTpl").onclick=function(){
    var raw=prompt("Сохранение нового шаблона:\n1 — сохранить текущую видимость как default\n2 — сохранить со всеми видимыми элементами\n\nВведите 1 или 2","1");
    if(raw==null)return;
    var mode=String(raw).trim()==="2"?"all-visible":"current";
    pushHistory();
    var saved=saveTemplateBlockAsNewTemplate(b,{visibilityMode:mode});
    if(saved){state.activeTemplateId=saved.id;state.selectedTemplateIds=[saved.id];state.templateAnchorId=saved.id;renderUI(true)}
  };
  mountBlockAdapt(box,b,isOv);
  $("itBg").onchange=function(){pushHistory();b.templateView=normalizeTemplateView(Object.assign({},b.templateView,{background:!!this.checked}));renderUI(true)};
  $("itMedia").onchange=function(){pushHistory();b.templateView=normalizeTemplateView(Object.assign({},b.templateView,{media:!!this.checked}));renderUI(true)};
  $("itText").onchange=function(){pushHistory();b.templateView=normalizeTemplateView(Object.assign({},b.templateView,{text:!!this.checked}));renderUI(true)};
  $("itInvert").onclick=function(){pushHistory();b.templateView=normalizeTemplateView(Object.assign({},b.templateView,{inverted:!normalizeTemplateView(b.templateView).inverted}));renderUI(true)};
  $("itViewMode").onchange=function(){pushHistory();b.templateViewMode=normalizeTemplateViewMode(this.value);renderUI(true)};
  renderTemplateDropdown("itRndFolders","Папки",project.folders.map(function(f){return{value:f.id,label:f.name,desc:""}}),folderIds,function(opt,on){pushHistory();var next=templateBlockFolderIds(b),i=next.indexOf(opt);if(on&&i<0)next.push(opt);if(!on&&i>=0)next.splice(i,1);b.templateFolderIds=next;b.templateFolderId=next[0]||null;renderInspector()},"Все папки");
  renderTemplateDropdown("itRndTagsSel","Теги",project.tags.map(function(t){return{value:t.id,label:t.name,desc:""}}),ensureStringArray(b.templateTagIds),function(opt,on){pushHistory();b.templateTagIds=ensureStringArray(b.templateTagIds);var i=b.templateTagIds.indexOf(opt);if(on&&i<0)b.templateTagIds.push(opt);if(!on&&i>=0)b.templateTagIds.splice(i,1);renderInspector()},"Все теги");
  var slotsBox=$("itSlots");
  slots.forEach(function(slot){var chip=document.createElement("span");chip.className="chip"+(selSlot===slot?" on":"");chip.textContent=slot;chip.onclick=function(){setTemplateEditState(b,isOv?"overlay":"main",slot,null);renderUI(true)};slotsBox.appendChild(chip)});
  if(!slots.length)slotsBox.innerHTML='<span class="inspMeta">нет media-slot</span>';
}
function selectedTimelineBlockSet(){
  if(state.selectedBlockIds.length>1)return{track:"main",isOverlay:false,ids:state.selectedBlockIds.slice(),blocks:project.blocks.filter(function(b){return state.selectedBlockIds.indexOf(b.id)>=0})};
  if(state.selectedOverlayIds.length>1)return{track:"overlay",isOverlay:true,ids:state.selectedOverlayIds.slice(),blocks:project.overlayBlocks.filter(function(b){return state.selectedOverlayIds.indexOf(b.id)>=0})};
  return null;
}
function runMultiBlockRnd(info){
  if(!info||!info.blocks||!info.blocks.length)return;
  var imageBlocks=info.blocks.filter(function(b){return !blockIsTemplate(b)}),templateBlocks=info.blocks.filter(function(b){return blockIsTemplate(b)}),done=false;
  pushHistory();
  if(imageBlocks.length)done=randomizeAssetBlocks(imageBlocks,null,false,{folderIds:state.rndAssetFolderFilter,tagIds:state.rndAssetTagFilter,silent:templateBlocks.length>0})||done;
  if(templateBlocks.length)done=randomizeTemplateBlocksWithProjectFilters(templateBlocks,{pushHistory:false,silent:imageBlocks.length>0})||done;
  if(!done)alert("Нет подходящих данных для randomize");
  renderUI(true);
}
function renderMultiBlockInspector(box,info){
  var imageCount=info.blocks.filter(function(b){return !blockIsTemplate(b)}).length,templateCount=info.blocks.length-imageCount;
  var html='<div class="inspTitle">Множественное выделение</div>';
  html+='<div class="inspMeta">Трек: <b>'+(info.isOverlay?'overlay':'main')+'</b> · выбрано блоков: <b>'+info.blocks.length+'</b> · картинки: '+imageCount+' · шаблоны: '+templateCount+'</div>';
  if(imageCount){
    html+='<div class="inspTitle" style="margin-top:12px">Картинки</div>';
    html+='<div class="grid2"><div class="mdd" id="imRndFolders"></div><div class="mdd" id="imRndTags"></div></div>';
  }
  if(templateCount){
    html+='<div class="inspTitle" style="margin-top:12px">Шаблоны</div>';
    html+='<div class="grid2"><div class="mdd" id="imRndTplStyles"></div><div class="mdd" id="imRndTplGroups"></div><div class="mdd" id="imRndTplTags"></div><div class="mdd" id="imRndTplAspects"></div></div>';
  }
  html+='<div class="row" style="margin-top:12px"><button class="btn primary" type="button" id="imRndGo">RND выбранные блоки</button></div>';
  html+='<div class="row" style="margin-top:8px"><button class="btn '+(state.blockSelectionLocked?'active warn':'')+'" type="button" id="imSelLock">'+(state.blockSelectionLocked?'🔒 Выделение зафиксировано':'🔓 Зафиксировать выделение')+'</button></div>';
  box.innerHTML=html;
  renderSharedRndFilterControls("imRnd",{onChange:function(){renderMultiBlockInspector(box,info)}});
  $("imRndGo").onclick=function(){runMultiBlockRnd(info)};
  $("imSelLock").onclick=function(){state.blockSelectionLocked=!state.blockSelectionLocked;renderMultiBlockInspector(box,selectedTimelineBlockSet()||info)};
}
function renderAssetBlockInspector(box,b,isOv){
  var asset=findAsset(b.assetId);
  var html='<div class="inspTitle">'+(isOv?"Overlay":"Блок")+'</div>';
  if(asset&&asset.url)html+='<img class="thumbPrev" src="'+asset.url+'" />';
  html+='<div class="field"><span>Длительность (кадры)</span><input id="ibDur" type="number" min="1" value="'+(b.duration|0)+'" /></div>';
  html+='<div class="field"><span>Fit</span><select id="ibFit"><option value="cover">cover</option><option value="contain">contain</option><option value="stretch">stretch</option></select></div>';
  html+='<div class="field"><span>Scale</span><div class="rangeRow"><input id="ibScale" type="range" min="0.2" max="3" step="0.01" value="'+b.scale+'" /><b id="ibScaleV">'+(+b.scale).toFixed(2)+'</b></div></div>';
  html+='<div class="grid2"><div class="field"><span>posX</span><input id="ibX" type="range" min="0" max="1" step="0.01" value="'+b.posX+'" /></div>';
  html+='<div class="field"><span>posY</span><input id="ibY" type="range" min="0" max="1" step="0.01" value="'+b.posY+'" /></div></div>';
  html+='<div class="field"><span>Анимация</span><select id="ibAnim">';
  [["none","нет"],["zoomIn","zoom in"],["zoomOut","zoom out"],["panLR","pan →"],["panRL","pan ←"],["panTB","pan ↓"],["panBT","pan ↑"]].forEach(function(p){html+='<option value="'+p[0]+'"'+(b.anim===p[0]?" selected":"")+'>'+p[1]+'</option>'});
  html+='</select></div>';
  html+='<div class="field"><span>Скорость анимации</span><div class="rangeRow"><input id="ibAnimSp" type="range" min="0" max="100" step="1" value="'+animSpeedValue(b.animSpeed)+'" /><b id="ibAnimSpV">'+Math.round(animSpeedValue(b.animSpeed))+'</b></div></div>';
  html+='<div class="row"><label class="row"><input id="ibFix" type="checkbox" '+(b.fixed?"checked":"")+' /> Fix</label></div>';
  html+='<div class="row" style="margin-top:8px"><button class="btn primary" type="button" id="ibRnd">RND</button>';
  if(!isOv)html+='<button class="btn" type="button" id="ibSwap">Switch</button>';
  html+='</div>';
  box.innerHTML=html;
  $("ibFit").value=b.fit||"cover";
  $("ibDur").onchange=function(){pushHistory();setBlockDuration(b.id,Math.max(1,this.value|0),isOv?"overlay":"main");drawTimeline();applyFrame()};
  $("ibFit").onchange=function(){pushHistory();b.fit=this.value;applyFrame()};
  $("ibScale").oninput=function(){var v=+this.value;$("ibScaleV").textContent=v.toFixed(2);b.scale=v;applyFrame()};
  $("ibScale").onchange=function(){pushHistory()};
  $("ibX").oninput=function(){b.posX=+this.value;applyFrame()};
  $("ibY").oninput=function(){b.posY=+this.value;applyFrame()};
  $("ibX").onchange=$("ibY").onchange=function(){pushHistory()};
  $("ibAnim").onchange=function(){pushHistory();b.anim=this.value;applyFrame()};
  $("ibAnimSp").oninput=function(){var v=+this.value;$("ibAnimSpV").textContent=Math.round(v);b.animSpeed=v;applyFrame()};
  $("ibFix").onchange=function(){pushHistory();b.fixed=!!this.checked;drawTimeline()};
  $("ibRnd").onclick=function(){randomizeAssetBlocks([b],null,true,{folderIds:state.rndAssetFolderFilter,tagIds:state.rndAssetTagFilter});renderUI(true)};
  var sw=$("ibSwap");if(sw)sw.onclick=swapSelectedBlocks;
}
function renderInspBlock(box){
  var multi=selectedTimelineBlockSet();
  if(multi){renderMultiBlockInspector(box,multi);return}
  var eb=editingBlock();
  var b=eb?eb.block:null;
  var isOv=eb&&eb.track==="overlay";
  if(!b){
    box.innerHTML='<div class="inspEmpty">Нет блока под playhead / selection. Monitor: wheel=scale, Alt-drag=pos. Template: click text/media in monitor.</div>';
    return;
  }
  if(blockIsTemplate(b))renderTemplateBlockInspector(box,b,isOv);
  else renderAssetBlockInspector(box,b,isOv);
}

function updateHud(){
  var tf=timelineFrames(),c=contentLength(),s=sampleFrame(state.G,"main");
  var mode=s&&s.block?("block "+(findBlockIndex(s.block.id)+1)):(state.G>=c?"void":"idle");
  $("stat").textContent="G "+framesToLabel(state.G)+" / "+framesToLabel(tf)+" · "+mode+(state.draw.on?" · DRAW":"")+(state.titles.on?" · TITLES":"")+(libraryMode()==="templates"?" · TPL":"");
  $("tlInfo").textContent="шкала "+framesToLabel(tf)+" · main "+framesToLabel(c)+" · ov "+framesToLabel(overlayContentLength())+" · FPS "+project.fps+(hasIOLoop()?" · LOOP":"");
  var pano=sourcePano(),img=sourceImage();
  $("panoStat").textContent="yaw "+(pano.yaw*RAD).toFixed(1)+" · pitch "+(pano.pitch*RAD).toFixed(1)+" · fov "+(pano.fov*RAD).toFixed(0);
  if($("imageStat"))$("imageStat").textContent="zoom "+(img.scale||1).toFixed(2)+" · x "+(img.posX||0.5).toFixed(2)+" · y "+(img.posY||0.5).toFixed(2);
  var eb=editingBlock();
  var monName="—";
  if(eb&&blockIsTemplate(eb.block))monName="template · "+templateBlockName(eb.block)+(state.templateEdit.selectedSlot?" · slot "+state.templateEdit.selectedSlot:"");
  else if(eb&&findAsset(eb.block.assetId))monName=findAsset(eb.block.assetId).name;
  $("monStat").textContent=framesToLabel(state.G)+" · wheel=scale · Alt-drag=pos · "+monName;
}
function renderUI(full){
  if(full!==false){renderLibraryPane();if(state.inspOpen)renderInspector()}
  drawTimeline();applyFrame();updateHud();syncPanoSelect();if($("aspectSelectImage"))$("aspectSelectImage").value=project.aspect;if(typeof syncFlatImageSelect==="function")syncFlatImageSelect();if(typeof syncSourceViewerUI==="function")syncSourceViewerUI();syncAudioUI();if(typeof drawActiveSource==="function")drawActiveSource();
}

if(window.PMS&&PMS.registerModule)PMS.registerModule("ui.layout",{syncAspectBoxes:syncAspectBoxes,applyMode:applyMode,setMode:setMode,setInspOpen:setInspOpen,setInspTab:setInspTab,renderInspector:renderInspector,renderInspProject:renderInspProject,renderInspAsset:renderInspAsset,renderInspTemplate:renderInspTemplate,renderInspBlock:renderInspBlock,updateHud:updateHud,renderUI:renderUI});

/* ---- Адаптация шаблонов: инспекторы библиотеки и блока (логика в js/adaptation/pano-adaptation.js) ---- */
function adaptResultUsable(res){return PMS_ADAPT.usable(res)}   // слоты исходника не теряются
function adaptCanvasFor(res){
  var c=res.contract||{width:res.frameW,height:res.frameH};
  return{format:res.format,w:c.width,h:c.height,resolution:c.width+"x"+c.height};
}
function libraryAdaptSource(t){
  var o=PMS_ADAPT.origin(t.html||"",t,t.format||"16:9");
  return{tpl:t.tpl||t.id,label:t.label||t.tpl||t.id,html:o.html,format:o.format};
}
function mountLibraryAdapt(box,t){
  var upd=$("itplAdaptUpdate"),cpy=$("itplAdaptCopy"),last=null;
  PMS_ADAPT.mount($("itplAdapt"),{
    scenario:"library",
    format:t.format||"16:9",
    designSize:function(){return PMS_ADAPT.designSize(t)},
    method:t.adaptation?t.adaptation.method:"",
    sourceFormat:function(){return libraryAdaptSource(t).format},
    getSource:function(){return libraryAdaptSource(t)},
    onPending:function(){setCardPreview(t,null,true,false)},
    onResult:function(res,ctl){
      last=adaptResultUsable(res)?res:null;
      upd.disabled=!last;cpy.disabled=!last;
      setCardPreview(t,last,false,!last&&!!(ctl&&ctl.method));   // только отображение в карточке; библиотека меняется лишь по «Обновить»/«Создать копию»
    }
  });
  upd.onclick=function(){if(last)libraryAdaptSave(t,last,"update")};
  cpy.onclick=function(){if(last)libraryAdaptSave(t,last,"copy")};
}
function libraryAdaptSave(t,res,mode){
  var src=libraryAdaptSource(t),def=templateDefinitionForEditor(t);
  def.html=res.html;def.format=res.format;def.designW=res.frameW;def.designH=res.frameH;
  def.canvas=adaptCanvasFor(res);
  def.adaptation=PMS_ADAPT.metaFor(res,src);
  pushHistory();
  var saved=null;
  if(mode==="copy"){
    def.id=suggestUserTemplateId(t.id);def.tpl=def.id;
    def.label=(t.label||t.tpl||t.id)+" · "+res.format+" · "+res.methodName;
    saved=upsertUserTemplateDefinition(def,{groupId:t.internalGroupId,styleId:t.internalStyleId,originTemplateId:t.originTemplateId||t.id,parentTemplateId:t.id,galleryAfterSourceKey:t.sourceKey});
  }else{
    saved=applyTemplateDefinitionEdits(t,def);
  }
  if(!saved){alert("Не удалось сохранить шаблон");return}
  commitHistory();
  persistUserLibrary(mode==="copy"?"adaptation-copy-template":"adaptation-update-template");
  state.activeTemplateId=saved.id;state.selectedTemplateIds=[saved.id];state.templateAnchorId=saved.id;
  renderUI(true);
}

function blockAdaptSource(b){
  var meta=b.templateMeta||{};
  var o=PMS_ADAPT.origin(b.templateHtml||"",meta,meta.format||project.aspect||"16:9");
  return{tpl:meta.tpl||b.templateId||"",label:meta.label||b.templateId||"",html:o.html,format:o.format};
}
function blockStartFrame(b,isOv){
  var it=layoutTrack(isOv?project.overlayBlocks:project.blocks,isOv?"overlay":"main").filter(function(x){return x.block.id===b.id})[0];
  return it?it.start:0;
}
function mountBlockAdapt(box,b,isOv){
  var applyBtn=$("ibAdaptApply"),insBtn=$("ibAdaptInsert"),last=null,meta=b.templateMeta||{};
  PMS_ADAPT.mount($("ibAdapt"),{
    scenario:"timeline",
    format:(meta.adaptation&&meta.adaptation.format)||meta.format||project.aspect||"16:9",
    method:meta.adaptation?meta.adaptation.method:"",
    sourceFormat:function(){return blockAdaptSource(b).format},
    getSource:function(){return blockAdaptSource(b)},
    onResult:function(res){
      last=adaptResultUsable(res)?res:null;
      if(last){
        PMS_ADAPT.setPreview({blockId:b.id,html:last.html,frameW:last.frameW,frameH:last.frameH,method:last.method,format:last.format});
        // предпросмотр виден в мониторе только если playhead внутри блока (как при выборе блока кликом)
        var s0=blockStartFrame(b,isOv);
        if(state.G<s0||state.G>=s0+(b.duration|0))state.G=s0;
      }else PMS_ADAPT.clearPreview();
      applyBtn.disabled=!last;insBtn.disabled=!last;
      applyFrame();
    }
  });
  applyBtn.onclick=function(){if(last)applyBlockAdapt(b,last,isOv)};
  insBtn.onclick=function(){if(last)insertAdaptedBlock(b,last,isOv)};
}
function applyBlockAdapt(b,res,isOv){
  var meta=b.templateMeta||{},src=blockAdaptSource(b);
  if(meta.adaptation&&PMS_ADAPT.textHash(b.templateHtml)!==meta.adaptation.resultTextHash&&!confirm("Текст блока менялся после адаптации. Результат будет построен от исходника, правки текста пропадут. Продолжить?"))return;
  pushHistory();
  b.templateHtml=PMS_ADAPT.cleanHtml(res.html);
  b.templateMeta=Object.assign({},meta,{format:res.format,designW:res.frameW,designH:res.frameH,canvas:adaptCanvasFor(res),adaptation:PMS_ADAPT.metaFor(res,src)});
  PMS_ADAPT.clearPreview();
  ensureTemplateBlockState(b);
  commitHistory();   // результат — отдельный шаг Undo/Redo
  renderUI(true);
}
// «Вставить после»: копия блока с адаптацией; исходный блок не меняется
function insertAdaptedBlock(b,res,isOv){
  var src=blockAdaptSource(b),meta=b.templateMeta||{};
  pushHistory();
  var list=isOv?project.overlayBlocks:project.blocks;
  var copy=deepClone(b);
  copy.id=uid("b");
  copy.templateHtml=PMS_ADAPT.cleanHtml(res.html);
  copy.templateSelectedSlot=null;
  copy.templateMeta=Object.assign({},meta,{format:res.format,designW:res.frameW,designH:res.frameH,canvas:adaptCanvasFor(res),adaptation:PMS_ADAPT.metaFor(res,src)});
  if(isOv&&blockUsesAbsoluteTimeline(b,"overlay")){
    // абсолютные overlay: копия идёт за исходным; более поздние абсолютные блоки сдвигаются на её длину
    var at=(b.start|0)+(b.duration|0);
    copy.start=at;
    list.forEach(function(o){if(o!==b&&blockUsesAbsoluteTimeline(o,"overlay")&&(o.start|0)>=at)o.start=(o.start|0)+copy.duration});
  }
  list.splice(list.indexOf(b)+1,0,copy);
  PMS_ADAPT.clearPreview();
  ensureContentFitsTL();
  commitHistory();
  if(isOv){state.selectedOverlayIds=[copy.id];state.selectedBlockIds=[];state.G=copy.start}
  else{state.selectedBlockIds=[copy.id];state.selectedOverlayIds=[];state.G=blockStartFrame(copy,false)}
  renderUI(true);
}

