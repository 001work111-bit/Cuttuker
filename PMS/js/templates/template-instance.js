"use strict";

/* Stage 3: titles runtime + live template-block runtime. */

var templateMonitorCache={main:{id:null,html:null,slot:null,node:null},overlay:{id:null,html:null,slot:null,node:null}};
var LEGACY_TITLES_ENABLED=false;

function disableLegacyTitlesUI(){
  state.titles.on=false;
  if($("btnTitles"))$("btnTitles").style.display="none";
  if($("titlesPopup"))$("titlesPopup").classList.remove("on");
  if($("titlesLayer"))$("titlesLayer").classList.remove("on");
}

function ensurePanoVisible(){
  if($("panoWrap").classList.contains("hide")){
    if(state.mode==="gal-mon-tl"||state.mode==="gal-tl")setMode("gal-pano-tl");
    else if(String(state.mode).indexOf("pano")<0)setMode("pano-mon-tl");
  }
}
function hardenSlideRoot(root,dw,dh){
  if(!root)return;
  root.style.width=dw+"px";root.style.height=dh+"px";
  root.style.minHeight=dh+"px";root.style.maxWidth="none";
  root.style.overflow="hidden";root.style.boxSizing="border-box";
  root.style.position=root.style.position||"relative";
  root.querySelectorAll("[style]").forEach(function(el){
    var st=el.getAttribute("style")||"";
    if(/min-height\s*:\s*[^;]*vh/i.test(st)||/height\s*:\s*[^;]*vh/i.test(st)){
      el.style.minHeight="";
      if(/height\s*:\s*[^;]*vh/i.test(st))el.style.height="100%";
    }
  });
}
function adaptDesignToProject(tpl){
  var pc=projectCanvasSize();
  return{designW:tpl.designW||1123,designH:tpl.designH||794,frameW:pc.w,frameH:pc.h};
}
function layoutTitlesViewport(){
  if(!state.titles.on)return;
  var box=$("panoBox"),vp=$("titlesViewport");
  if(!box||!vp||box.clientWidth<2)return;
  var dw=state.titles.designW||1123,dh=state.titles.designH||794;
  var bw=box.clientWidth,bh=box.clientHeight;
  var s=Math.min(bw/dw,bh/dh);
  state.titles.scale=s;
  vp.style.width=dw+"px";vp.style.height=dh+"px";
  vp.style.transform="scale("+s+")";
  var info=$("titlesCanvasInfo");
  if(info){
    var pc=projectCanvasSize();
    info.textContent=dw+"×"+dh+" → frame "+pc.w+"×"+pc.h+" · scale "+s.toFixed(3)+" · aspect "+project.aspect;
  }
}
function mountTitlesHtml(html){
  var vp=$("titlesViewport");
  vp.innerHTML=html||"";
  var dw=state.titles.designW||1123,dh=state.titles.designH||794;
  var root=vp.querySelector(".sv-section")||vp.firstElementChild;
  hardenSlideRoot(root,dw,dh);
  layoutTitlesViewport();
  wireTitlesEditable();
}
function renderLegacyTitlesLayer(){
  var vp=$("titlesViewport");vp.innerHTML="";
  if(!state.titles.instance||!state.titles.instance.blocks)return;
  var dw=state.titles.designW,dh=state.titles.designH;
  var wrap=document.createElement("div");
  wrap.className="sv-section";
  wrap.style.cssText="width:"+dw+"px;height:"+dh+"px;position:relative;overflow:hidden;background:transparent;";
  state.titles.instance.blocks.forEach(function(tb){
    var el=document.createElement("div");
    el.setAttribute("data-sb-editable","");el.setAttribute("data-slot",tb.id);el.contentEditable="true";
    el.style.cssText="position:absolute;left:"+(tb.x*100)+"%;top:"+(tb.y*100)+"%;width:"+(tb.w*100)+"%;min-height:"+(tb.h*100)+"%;"+
      "font-size:"+tb.fontSize+"px;color:"+tb.color+";font-weight:"+tb.fontWeight+";text-align:"+tb.align+";font-family:"+tb.fontFamily+";opacity:"+(tb.opacity!=null?tb.opacity:1)+";outline:1px dashed transparent;cursor:text;";
    el.textContent=tb.text;
    wrap.appendChild(el);
  });
  vp.appendChild(wrap);
  layoutTitlesViewport();
  wireTitlesEditable();
}
function wireTitlesEditable(){
  var vp=$("titlesViewport");
  vp.querySelectorAll("[data-sb-editable]").forEach(function(el){
    el.contentEditable="true";el.spellcheck=false;
    el.onpointerdown=function(e){e.stopPropagation();state.titles.selectedEl=el;state.titles.selectedSlot=el.getAttribute("data-slot")||"";var ta=$("titlesEditText");if(ta)ta.value=el.innerText||""};
    el.oninput=function(){if(state.titles.mode==="html")state.titles.instanceHtml=vp.innerHTML;if(state.titles.selectedEl===el){var ta=$("titlesEditText");if(ta)ta.value=el.innerText||""}};
    el.onblur=function(){if(state.titles.mode==="html")state.titles.instanceHtml=vp.innerHTML;else syncLegacyFromDom();pushHistory()};
  });
  vp.querySelectorAll("[data-sb-media]").forEach(function(el){
    el.onpointerdown=function(e){
      e.stopPropagation();
      var a=primaryAsset();
      if(!a||!a.url){alert("Выбери картинку в галерее, затем клик по media-слоту");return}
      pushHistory();
      el.style.backgroundImage="url('"+a.url+"')";
      el.style.backgroundSize="cover";
      el.style.backgroundPosition="center";
      el.style.backgroundRepeat="no-repeat";
      var img=el.tagName==="IMG"?el:el.querySelector("img");
      if(img){img.src=a.url;img.style.width="100%";img.style.height="100%";img.style.objectFit="cover"}
      if(state.titles.mode==="html")state.titles.instanceHtml=vp.innerHTML;
    };
  });
}
function syncLegacyFromDom(){
  if(!state.titles.instance||!state.titles.instance.blocks)return;
  var vp=$("titlesViewport");
  state.titles.instance.blocks.forEach(function(tb){
    var el=vp.querySelector('[data-slot="'+tb.id+'"]');
    if(el)tb.text=el.innerText||"";
  });
}
function setTitlesMode(on){
  if(!LEGACY_TITLES_ENABLED){disableLegacyTitlesUI();return false}
  state.titles.on=!!on;
  $("titlesLayer").classList.toggle("on",state.titles.on);
  $("titlesPopup").classList.toggle("on",state.titles.on);
  $("btnTitles").classList.toggle("active",state.titles.on);
  if(state.titles.on){
    ensurePanoVisible();
    if(state.titles.mode==="html"&&state.titles.instanceHtml)mountTitlesHtml(state.titles.instanceHtml);
    else if(state.titles.mode==="legacy"&&state.titles.instance)renderLegacyTitlesLayer();
    else if(project.designTemplates.length)activateDesignTemplate(project.designTemplates[0].id);
    else if(project.titlePresets.length)activateLegacyPreset(project.titlePresets[0].id);
    else{$("titlesViewport").innerHTML="";layoutTitlesViewport()}
    renderTitlesList();
  }
}
function syncTitlesUI(){
  if(!LEGACY_TITLES_ENABLED){disableLegacyTitlesUI();return}
  $("titlesLayer").classList.toggle("on",!!state.titles.on);
  $("titlesPopup").classList.toggle("on",!!state.titles.on);
  $("btnTitles").classList.toggle("active",!!state.titles.on);
  if(state.titles.on){
    if(state.titles.mode==="html"&&state.titles.instanceHtml)mountTitlesHtml(state.titles.instanceHtml);
    else if(state.titles.mode==="legacy"&&state.titles.instance)renderLegacyTitlesLayer();
    renderTitlesList();
  }
}
function activateDesignTemplate(id){
  var t=null;for(var i=0;i<project.designTemplates.length;i++)if(project.designTemplates[i].id===id){t=project.designTemplates[i];break}
  if(!t)return;
  var ad=adaptDesignToProject(t);
  state.titles.mode="html";state.titles.activeId=id;
  state.titles.designW=ad.designW;state.titles.designH=ad.designH;
  state.titles.instanceHtml=t.html;state.titles.instance=null;
  mountTitlesHtml(state.titles.instanceHtml);renderTitlesList();
}
function activateLegacyPreset(id){
  var t=null;for(var i=0;i<project.titlePresets.length;i++)if(project.titlePresets[i].id===id){t=project.titlePresets[i];break}
  if(!t)return;
  var pc=projectCanvasSize();
  state.titles.mode="legacy";state.titles.activeId=id;
  state.titles.designW=t.designW||pc.w;state.titles.designH=t.designH||pc.h;
  state.titles.instance=deepClone(t);state.titles.instanceHtml=null;
  renderLegacyTitlesLayer();renderTitlesList();
}
function renderTitlesList(){
  var box=$("titlesList");if(!box)return;box.innerHTML="";
  var any=false;
  project.designTemplates.forEach(function(p){
    any=true;var d=document.createElement("div");
    d.className="presetItem"+(state.titles.activeId===p.id?" on":"");
    d.innerHTML=esc((p.icon?p.icon+" ":"")+(p.code?p.code+" · ":"")+p.label)+'<div class="pm">'+esc(p.designW+"×"+p.designH+(p.group?" · "+p.group:""))+'</div>';
    d.onclick=function(){pushHistory();activateDesignTemplate(p.id)};box.appendChild(d);
  });
  project.titlePresets.forEach(function(p){
    any=true;var d=document.createElement("div");
    d.className="presetItem"+(state.titles.activeId===p.id?" on":"");
    d.innerHTML=esc(p.label||"Titles")+'<div class="pm">text-blocks · '+(p.blocks?p.blocks.length:0)+'</div>';
    d.onclick=function(){pushHistory();activateLegacyPreset(p.id)};box.appendChild(d);
  });
  if(!any)box.innerHTML='<div class="inspMeta">Import / Paste JSON шаблонов конструктора</div>';
}
function importDesignData(data,fileName){
  var list=normalizeDesignImport(data,fileName||"import");
  if(!list.length){alert("JSON не распознан как design/titles шаблон");return}
  pushHistory();
  list.forEach(function(t){
    if(t.type==="html-slide")project.designTemplates.push(t);
    else project.titlePresets.push(t);
  });
  if(!state.titles.on)setTitlesMode(true);
  var first=list[0];
  if(first.type==="html-slide")activateDesignTemplate(first.id);
  else activateLegacyPreset(first.id);
}
function importTitleFiles(fileList){
  [].slice.call(fileList||[]).forEach(function(file){
    var reader=new FileReader();
    reader.onload=function(){try{importDesignData(JSON.parse(reader.result),file.name.replace(/\.json$/i,""))}catch(e){alert("Ошибка JSON: "+file.name)}};
    reader.readAsText(file);
  });
}
async function pasteDesignJson(){
  var text="";
  try{if(navigator.clipboard&&navigator.clipboard.readText)text=await navigator.clipboard.readText()}catch(e){}
  if(!text)text=prompt("Вставь JSON шаблона (объект или массив):","")||"";
  if(!text)return;
  try{importDesignData(JSON.parse(text),"paste")}catch(e){alert("Невалидный JSON")}
}
function applyTitlesEditText(){
  var ta=$("titlesEditText");if(!ta)return;
  var el=state.titles.selectedEl;
  if(!el){alert("Сначала кликни текстовый слот на слайде");return}
  pushHistory();
  el.innerText=ta.value||"";
  if(state.titles.mode==="html")state.titles.instanceHtml=$("titlesViewport").innerHTML;
  else syncLegacyFromDom();
}
function bakeTitlesToCanvas(tw,th,alphaOnly){
  return new Promise(function(resolve){
    var vp=$("titlesViewport");
    if(!state.titles.on||!vp||!vp.childNodes.length){
      var empty=document.createElement("canvas");empty.width=tw;empty.height=th;resolve(empty);return;
    }
    if(typeof html2canvas!=="function"){
      var c=document.createElement("canvas");c.width=tw;c.height=th;var ctx=c.getContext("2d");
      if(state.titles.mode==="legacy"&&state.titles.instance){
        state.titles.instance.blocks.forEach(function(tb){
          var fs=Math.max(10,tb.fontSize*(tw/(state.titles.designW||960)));
          ctx.save();ctx.globalAlpha=tb.opacity!=null?tb.opacity:1;ctx.fillStyle=tb.color||"#fff";
          ctx.font=(tb.fontWeight||"600")+" "+fs+"px "+(tb.fontFamily||"system-ui,sans-serif");
          ctx.textAlign=tb.align==="center"?"center":tb.align==="right"?"right":"left";ctx.textBaseline="top";
          var x=tb.x*tw,y=tb.y*th,maxW=tb.w*tw;if(ctx.textAlign==="center")x+=maxW/2;if(ctx.textAlign==="right")x+=maxW;
          String(tb.text||"").split("\n").forEach(function(line,li){ctx.fillText(line,x,y+li*(fs*1.25),maxW)});
          ctx.restore();
        });
      }
      resolve(c);return;
    }
    var prev=vp.style.transform;vp.style.transform="none";
    html2canvas(vp,{backgroundColor:alphaOnly?null:"#000000",scale:2,width:state.titles.designW||1123,height:state.titles.designH||794,useCORS:true,logging:false}).then(function(shot){
      vp.style.transform=prev;
      var out=document.createElement("canvas");out.width=tw;out.height=th;
      out.getContext("2d").drawImage(shot,0,0,tw,th);
      resolve(out);
    }).catch(function(){vp.style.transform=prev;var c=document.createElement("canvas");c.width=tw;c.height=th;resolve(c)});
  });
}
function captureTitlesAlphaToGallery(){
  if(!state.titles.on){alert("Включи Titles");return}
  var tw=project.outW|0,th=project.outH|0;if(tw<16)tw=1920;if(th<16)th=Math.round(tw/aspectRatio(project.aspect));
  bakeTitlesToCanvas(tw,th,true).then(function(c){
    c.toBlob(function(blob){
      if(!blob)return;var url=URL.createObjectURL(blob),img=new Image();
      img.onload=function(){
        pushHistory();
        var asset=makeAsset({name:"titles_"+Date.now()+".png",url:url,img:img,w:img.naturalWidth,h:img.naturalHeight,source:"titles",hasAlpha:true});
        project.assets.push(asset);state.selectedAssetIds=[asset.id];
        renderLibraryPane();updateHud();if(state.inspOpen){setInspTab("asset");renderInspector()}
      };img.src=url;
    },"image/png");
  });
}
function titlesToOverlayTrack(){
  if(!state.titles.on){alert("Включи Titles");return}
  var tw=project.outW|0,th=project.outH|0;if(tw<16)tw=1920;if(th<16)th=Math.round(tw/aspectRatio(project.aspect));
  bakeTitlesToCanvas(tw,th,true).then(function(c){
    c.toBlob(function(blob){
      if(!blob)return;var url=URL.createObjectURL(blob),img=new Image();
      img.onload=function(){
        pushHistory();
        var asset=makeAsset({name:"titles_ov_"+Date.now()+".png",url:url,img:img,w:img.naturalWidth,h:img.naturalHeight,source:"titles",hasAlpha:true});
        project.assets.push(asset);
        state.selectedOverlayIds=insertBlocks([asset.id],project.overlayBlocks.length,"overlay");
        state.selectedBlockIds=[];renderLibraryPane();renderUI(true);
      };img.src=url;
    },"image/png");
  });
}

function templateMonitorStage(track){return track==="overlay"?$("monTemplateOverlayStage"):$("monTemplateMainStage")}
function templateMonitorLayer(track){return track==="overlay"?$("monTemplateOverlayLayer"):$("monTemplateMainLayer")}
function clearTemplateMonitorLayer(track){
  var stage=templateMonitorStage(track),layer=templateMonitorLayer(track),cache=templateMonitorCache[track==="overlay"?"overlay":"main"];
  if(stage)stage.innerHTML="";
  if(layer)layer.classList.remove("on");
  cache.id=null;cache.html=null;cache.slot=null;cache.node=null;
}
function templateViewportForBlock(track,blockId){
  var stage=templateMonitorStage(track);if(!stage)return null;
  if(track!=="overlay")return stage.querySelector(".msTplViewport");
  return blockId?stage.querySelector('[data-block-id="'+String(blockId).replace(/"/g,'\\"')+'"] .msTplViewport'):stage.querySelector(".msTplViewport");
}
// Что показывать в мониторе: временный предпросмотр адаптации или сохранённый HTML блока.
// Предпросмотр не пишется в block.templateHtml.
function templateRenderHtml(block){
  var p=block&&window.PMS_ADAPT&&PMS_ADAPT.previewFor(block.id);
  return p?p.html:String(block&&block.templateHtml||"");
}
function templateBlockDesign(block){
  var p=block&&window.PMS_ADAPT&&PMS_ADAPT.previewFor(block.id);
  if(p&&p.frameW>0&&p.frameH>0)return{w:p.frameW,h:p.frameH};
  var meta=block&&block.templateMeta||{},t=block&&findTemplate(block.templateId);
  var src=(meta.designW>0&&meta.designH>0)?{designW:meta.designW,designH:meta.designH,format:meta.format}:Object.assign({},t||{},{format:meta.format||(t&&t.format)});
  var ds=(window.PMS_ADAPT&&PMS_ADAPT.designSize)?PMS_ADAPT.designSize(src):{w:1920,h:1080};
  return{w:ds.w,h:ds.h};
}
function ensureTemplateBlockState(block){
  if(!block||!blockIsTemplate(block))return null;
  var t=findTemplate(block.templateId),changed=false;
  if(!block.templateHtml&&t){block.templateHtml=String(t.html||"");changed=true}
  if(!block.templateMeta&&t){block.templateMeta=deepClone(t);changed=true}
  if(!Array.isArray(block.templateFolderIds)){block.templateFolderIds=ensureStringArray(block.templateFolderId?[block.templateFolderId]:[]);changed=true}
  block.templateView=normalizeTemplateView(block.templateView);
  block.templateViewMode=normalizeTemplateViewMode(block.templateViewMode);
  block.templateZoom=normalizeTemplateZoom(block.templateZoom);
  block.templateTagIds=ensureStringArray(block.templateTagIds).map(function(tag){
    var found=findTag(tag);if(found)return found.id;
    var byName=(project.tags||[]).find(function(x){return x&&x.name===tag});
    return byName?byName.id:tag;
  });
  block.templateSlots=block.templateSlots||{};
  var parsed=parseTemplateMediaSlots(block.templateHtml||"");
  Object.keys(parsed).forEach(function(slot){
    if(!block.templateSlots[slot]){block.templateSlots[slot]=parsed[slot];changed=true}
  });
  return changed;
}
function ensureTemplateDomIdentity(root,block){
  if(!root)return false;
  var changed=false,i=0;
  root.querySelectorAll("*").forEach(function(el){
    if(el.classList&&el.classList.contains("msSlotDice"))return;
    if(!el.getAttribute("data-ms-node-id")){
      el.setAttribute("data-ms-node-id",block.id+"_n"+(++i));
      changed=true;
    }
  });
  return changed;
}
function templateViewportHtml(vp){
  if(!vp)return"";
  var clone=vp.cloneNode(true);
  clone.querySelectorAll(".msSlotDice").forEach(function(el){el.remove()});
  clone.querySelectorAll(".msSlotSel").forEach(function(el){el.classList.remove("msSlotSel")});
  clone.querySelectorAll("[data-ms-selected]").forEach(function(el){el.removeAttribute("data-ms-selected")});
  return clone.innerHTML;
}
function nodeSelectorById(nodeId){return nodeId?'[data-ms-node-id="'+String(nodeId).replace(/"/g,'\\"')+'"]':null}
function slotSelector(slotName){return '[data-sb-media][data-slot="'+String(slotName).replace(/"/g,'\\"')+'"]'}
function setTemplateEditState(block,track,slot,nodeId,opts){
  opts=opts||{};
  if(!block)return;
  block.templateSelectedSlot=slot||null;
  state.templateEdit.blockId=block.id;
  state.templateEdit.track=track||"main";
  state.templateEdit.selectedSlot=slot||null;
  state.templateEdit.selectedNodeSelector=nodeSelectorById(nodeId);
  if(opts.keepSelection)return;
  if(track==="overlay"){state.selectedOverlayIds=[block.id];state.selectedBlockIds=[]}
  else{state.selectedBlockIds=[block.id];state.selectedOverlayIds=[]}
}
function clearTemplateEditState(){
  var b=templateEditedBlock();if(b)b.templateSelectedSlot=null;
  state.templateEdit.blockId=null;state.templateEdit.track="main";state.templateEdit.selectedSlot=null;state.templateEdit.selectedNodeSelector=null;
}
function templateEditedBlock(track){
  track=track||state.templateEdit.track||"main";
  var id=state.templateEdit.blockId;
  if(!id)return null;
  return track==="overlay"?findOverlay(id):findBlock(id);
}
function templateAssetPool(block){
  block=block||templateEditedBlock();
  if(!block)return[];
  var folderIds=templateBlockFolderIds(block),tags=ensureStringArray(block.templateTagIds);
  return project.assets.filter(function(a){
    a=ensureAssetFolderState(a);
    if(!a||!a.img)return false;
    if(folderIds.length){
      var folderOk=false;
      for(var i=0;i<folderIds.length;i++){
        var fid=folderIds[i];
        if(fid==="root"?assetVisibleInRoot(a):assetInFolder(a,fid)){folderOk=true;break}
      }
      if(!folderOk)return false;
    }
    if(tags.length){
      var ok=false,assetTagIds=ensureStringArray(a.tagIds);
      for(var j=0;j<tags.length;j++)if(assetTagIds.indexOf(tags[j])>=0){ok=true;break}
      if(!ok)return false;
    }
    return true;
  });
}
function templateSlotNames(block){
  ensureTemplateBlockState(block);
  return Object.keys(block&&block.templateSlots||{});
}
function templateAssignedAssetIds(block){
  ensureTemplateBlockState(block);
  return templateSlotNames(block).map(function(slot){return block.templateSlots&&block.templateSlots[slot]&&block.templateSlots[slot].assetId||null}).filter(Boolean);
}
function fillMissingTemplateSlotsFromRnd(block){
  var done=false;
  templateSlotNames(block).forEach(function(slot){
    if(block.templateSlots&&block.templateSlots[slot]&&block.templateSlots[slot].assetId)return;
    done=randomizeTemplateSlot(block,slot,{silent:true})||done;
  });
  return done;
}
function replaceTemplateBlockKeepingAssignments(blockId,templateId){
  var block=findBlock(blockId)||findOverlay(blockId);
  if(!block)return null;
  var prevAssigned=blockIsTemplate(block)?templateAssignedAssetIds(block):[];
  var prevFolderId=block.templateFolderId||null;
  var prevFolderIds=templateBlockFolderIds(block);
  var prevTagIds=ensureStringArray(block.templateTagIds);
  var prevView=normalizeTemplateView(block.templateView);
  var prevViewMode=normalizeTemplateViewMode(block.templateViewMode);
  var prevZoom=normalizeTemplateZoom(block.templateZoom);
  var prevSelectedSlot=block.templateSelectedSlot||null;
  convertBlockToTemplate(block,templateId);
  block.templateFolderId=prevFolderId;
  block.templateFolderIds=prevFolderIds;
  block.templateTagIds=prevTagIds;
  block.templateView=prevView;
  block.templateViewMode=prevViewMode;
  block.templateZoom=prevZoom;
  block.templateSelectedSlot=prevSelectedSlot;
  ensureTemplateBlockState(block);
  var newSlots=templateSlotNames(block),usedAny=false;
  if(prevSelectedSlot&&newSlots.indexOf(prevSelectedSlot)<0)block.templateSelectedSlot=newSlots[0]||null;
  newSlots.forEach(function(slotName,index){
    var assetId=prevAssigned[index];
    if(assetId&&findAsset(assetId)&&applyTemplateSlotAsset(block,slotName,assetId))usedAny=true;
  });
  fillMissingTemplateSlotsFromRnd(block);
  return block;
}
function saveTemplateBlockAsNewTemplate(block,opts){
  opts=opts||{};
  if(!block||!blockIsTemplate(block))return null;
  ensureTemplateBlockState(block);
  var source=findTemplate(block.templateId),def=templateDefinitionForEditor(source||block.templateMeta||{}),meta=block.templateMeta||{};
  def.id=suggestUserTemplateId((source&&source.id)||meta.tpl||block.templateId||uid('tpl'));
  def.tpl=def.id;
  def.label=String(opts.label||meta.label||def.label||def.tpl||def.id).trim()||def.id;
  def.code=String(meta.code||def.code||'').trim();
  def.desc=String(meta.desc||def.desc||'').trim();
  def.html=String(block.templateHtml||def.html||'');
  def.format=meta.format||def.format||project.aspect;
  var dsz=(window.PMS_ADAPT&&PMS_ADAPT.designSize)?PMS_ADAPT.designSize({designW:meta.designW||def.designW,designH:meta.designH||def.designH,format:def.format}):{w:1920,h:1080};
  def.designW=dsz.w;
  def.designH=dsz.h;
  def.canvas=deepClone(meta.canvas||def.canvas||{format:def.format,w:def.designW,h:def.designH,resolution:def.designW+'x'+def.designH});
  def.adaptation=normalizeAdaptationMeta(meta.adaptation);   // метод/исходник сохраняются с шаблоном
  def.tags=ensureStringArray((source&&source.tags)||meta.tags||def.tags||[]);
  var visibilityMode=opts.visibilityMode||"current";
  def.defaultTemplateViewMode=normalizeTemplateViewMode(block.templateViewMode);
  def.defaultTemplateZoom=normalizeTemplateZoom(block.templateZoom);
  def.defaultTemplateView=visibilityMode==="all-visible"?defaultTemplateView():normalizeTemplateView(block.templateView);
  var saved=upsertUserTemplateDefinition(def,{groupId:(source&&source.internalGroupId)||meta.internalGroupId||templateInternalGroups()[0].id,styleId:(source&&source.internalStyleId)||meta.internalStyleId||templateInternalStyles()[0].id,originTemplateId:(source&&source.originTemplateId)||block.templateId||def.id,parentTemplateId:(source&&source.id)||block.templateId||null,galleryAfterSourceKey:(source&&source.sourceKey)||null});
  if(saved&&typeof persistUserLibrary==='function')persistUserLibrary('save-template-block-as-user-template');
  return saved;
}
function titleInstanceDefaultSpan(){
  var under=blockAtG(state.G,"main");
  if(under)return{start:under.start,duration:under.duration};
  return{start:Math.max(0,Math.floor(state.G||0)),duration:defaultDur()};
}
function insertTemplateAsTitleInstance(templateId,opts){
  opts=opts||{};
  var span=titleInstanceDefaultSpan(),start=opts.start!=null?Math.max(0,opts.start|0):span.start,duration=opts.duration!=null?Math.max(1,opts.duration|0):span.duration;
  var block=makeTemplateBlock(templateId,{layer:"overlay",titleInstance:true,start:start,duration:duration,posX:opts.posX!=null?opts.posX:0.5,posY:opts.posY!=null?opts.posY:0.5,templateView:normalizeTemplateView(opts.templateView),templateViewMode:normalizeTemplateViewMode(opts.templateViewMode),templateZoom:normalizeTemplateZoom(opts.templateZoom||1)});
  if(!block)return null;
  project.overlayBlocks.push(block);
  state.selectedBlockIds=[];state.selectedOverlayIds=[block.id];state.blockSelectionLocked=false;
  setTemplateEditState(block,"overlay",null,null,{keepSelection:true});
  state.G=start;
  return block;
}
function applyTemplateVisibilityMode(el,visible,mode){
  if(!el)return;
  mode=normalizeTemplateViewMode(mode);
  if(visible){
    el.style.display=el.getAttribute('data-ms-orig-display')||'';
    el.style.visibility='';
    el.style.opacity=el.getAttribute('data-ms-orig-opacity')||'';
  }else if(mode==='hide-only'){
    if(!el.hasAttribute('data-ms-orig-display'))el.setAttribute('data-ms-orig-display',el.style.display||'');
    if(!el.hasAttribute('data-ms-orig-opacity'))el.setAttribute('data-ms-orig-opacity',el.style.opacity||'');
    el.style.display=el.getAttribute('data-ms-orig-display')||'';
    el.style.visibility='hidden';
    el.style.opacity='0';
  }else{
    if(!el.hasAttribute('data-ms-orig-display'))el.setAttribute('data-ms-orig-display',el.style.display||'');
    if(!el.hasAttribute('data-ms-orig-opacity'))el.setAttribute('data-ms-orig-opacity',el.style.opacity||'');
    el.style.visibility='';
    el.style.opacity=el.getAttribute('data-ms-orig-opacity')||'';
    el.style.display='none';
  }
}
function applyTemplateBlockView(vp,block){
  if(!vp||!block)return;
  ensureTemplateBlockState(block);
  var view=normalizeTemplateView(block.templateView),mode=normalizeTemplateViewMode(block.templateViewMode),root=vp.querySelector('.sv-section')||vp.firstElementChild||vp;
  if(root){
    if(!root.hasAttribute('data-ms-orig-bg'))root.setAttribute('data-ms-orig-bg',root.style.background||'');
    root.style.background=view.background?(root.getAttribute('data-ms-orig-bg')||''):'transparent';
    root.style.filter=view.inverted?'invert(1) hue-rotate(180deg)':'none';
  }
  vp.querySelectorAll('[data-sb-media]').forEach(function(el){applyTemplateVisibilityMode(el,!!view.media,mode)});
  vp.querySelectorAll('[data-sb-editable]').forEach(function(el){applyTemplateVisibilityMode(el,!!view.text,mode)});
}
function applyTemplateSlotAsset(block,slotName,assetId){
  if(!block||!blockIsTemplate(block)||!slotName)return false;
  ensureTemplateBlockState(block);
  var asset=findAsset(assetId);if(!asset||!asset.url)return false;
  var wrap=document.createElement("div");wrap.innerHTML=String(block.templateHtml||"");
  var slot=wrap.querySelector(slotSelector(slotName));
  if(!slot)return false;
  slot.setAttribute("data-ms-asset-id",asset.id);
  slot.style.backgroundImage="url('"+asset.url.replace(/'/g,"%27")+"')";
  slot.style.backgroundPosition="center";
  slot.style.backgroundRepeat="no-repeat";
  slot.style.backgroundSize="cover";
  if(slot.tagName==="IMG"){
    slot.src=asset.url;slot.style.objectFit="cover";slot.style.width="100%";slot.style.height="100%";
  }
  slot.querySelectorAll("img").forEach(function(img){img.src=asset.url;img.style.width="100%";img.style.height="100%";img.style.objectFit="cover"});
  block.templateHtml=wrap.innerHTML;
  block.templateSlots[slotName]=block.templateSlots[slotName]||{assetId:null,scale:1,posX:0.5,posY:0.5,hidden:false};
  block.templateSlots[slotName].assetId=asset.id;
  return true;
}
function randomAssetForTemplateBlock(block,used){
  var pool=templateAssetPool(block);
  if(!pool.length)return null;
  var list=pool.filter(function(a){return !used||!used[a.id]});
  if(!list.length)list=pool.slice();
  return list[Math.floor(Math.random()*list.length)]||null;
}
function randomizeTemplateSlot(block,slotName,opts){
  opts=opts||{};
  if(!block||!slotName)return false;
  var asset=randomAssetForTemplateBlock(block,null);
  if(!asset){if(!opts.silent)alert("Нет картинок для randomize по выбранной папке / тегам");return false}
  return applyTemplateSlotAsset(block,slotName,asset.id);
}
function randomizeTemplateBlock(block,opts){
  opts=opts||{};
  if(!block||!blockIsTemplate(block))return false;
  ensureTemplateBlockState(block);
  var used={},done=false;
  templateSlotNames(block).forEach(function(slot){
    var asset=randomAssetForTemplateBlock(block,used);if(!asset)return;
    used[asset.id]=true;done=applyTemplateSlotAsset(block,slot,asset.id)||done;
  });
  if(!done&&!opts.silent)alert("Нет картинок для randomize по выбранной папке / тегам");
  return done;
}
function applyAssetToSelectedTemplateSlot(assetId){
  var eb=editingBlock();
  if(!eb||!blockIsTemplate(eb.block)||!state.templateEdit.selectedSlot)return false;
  return applyTemplateSlotAsset(eb.block,state.templateEdit.selectedSlot,assetId);
}
function randomizeSelectedTemplateSlot(){
  var eb=editingBlock();
  if(!eb||!blockIsTemplate(eb.block)||!state.templateEdit.selectedSlot){alert("Сначала выбери media-slot в monitor");return false}
  return randomizeTemplateSlot(eb.block,state.templateEdit.selectedSlot);
}
function randomizeEditingTemplateBlock(){
  var eb=editingBlock();
  if(!eb||!blockIsTemplate(eb.block)){alert("Выдели template block");return false}
  return randomizeTemplateBlock(eb.block);
}
function templatePreviewActive(block){return !!(block&&window.PMS_ADAPT&&PMS_ADAPT.previewFor(block.id))}
function persistMountedTemplateHtml(block,track){
  if(!block||!blockIsTemplate(block))return false;
  if(templatePreviewActive(block))return false;   // предпросмотр адаптации не сохраняется в блок
  var vp=templateViewportForBlock(track,block.id);
  if(!vp)return false;
  block.templateHtml=templateViewportHtml(vp);
  ensureTemplateBlockState(block);
  templateMonitorCache[track].html=block.templateHtml;
  return true;
}
function highlightTemplateMount(track){
  var block=templateEditedBlock(track),stage=templateMonitorStage(track),vp=block&&templateViewportForBlock(track,block.id);
  if(stage)stage.querySelectorAll("[data-ms-selected]").forEach(function(el){el.removeAttribute("data-ms-selected")});
  if(stage)stage.querySelectorAll(".msSlotSel").forEach(function(el){el.classList.remove("msSlotSel")});
  if(!block||!vp)return;
  if(state.templateEdit.selectedNodeSelector){
    var node=vp.querySelector(state.templateEdit.selectedNodeSelector);
    if(node)node.setAttribute("data-ms-selected","1");
  }
  if(state.templateEdit.selectedSlot){
    vp.querySelectorAll(slotSelector(state.templateEdit.selectedSlot)).forEach(function(el){el.classList.add("msSlotSel")});
  }
}
function deleteSelectedTemplateNode(){
  var eb=editingBlock();
  if(!eb||!blockIsTemplate(eb.block)||!state.templateEdit.selectedNodeSelector)return false;
  var vp=templateViewportForBlock(eb.track,eb.block.id),node=vp&&vp.querySelector(state.templateEdit.selectedNodeSelector);
  if(!vp||!node)return false;
  if(node===vp||node.parentNode===vp&&vp.children.length===1)return false;
  var removedSlot=node.getAttribute&&node.getAttribute("data-slot")||null;
  node.remove();
  persistMountedTemplateHtml(eb.block,eb.track);
  if(removedSlot&&eb.block.templateSlots)delete eb.block.templateSlots[removedSlot];
  state.templateEdit.selectedNodeSelector=null;
  if(state.templateEdit.selectedSlot===removedSlot){state.templateEdit.selectedSlot=null;eb.block.templateSelectedSlot=null}
  return true;
}
function wireMonitorTemplateViewport(vp,block,track){
  if(!vp||templatePreviewActive(block))return;   // в режиме предпросмотра правка DOM выключена
  vp.querySelectorAll("[data-sb-editable]").forEach(function(el){
    el.contentEditable="true";el.spellcheck=false;
    el.addEventListener("pointerdown",function(e){e.stopPropagation();setTemplateEditState(block,track,el.getAttribute("data-slot")||null,el.getAttribute("data-ms-node-id"));highlightTemplateMount(track);if(state.inspOpen){setInspTab("block");renderInspector()}});
    el.addEventListener("input",function(){block.templateHtml=templateViewportHtml(vp);templateMonitorCache[track].html=block.templateHtml;var ta=$("titlesEditText");if(ta&&document.activeElement===el)ta.value=el.innerText||""});
    el.addEventListener("blur",function(){persistMountedTemplateHtml(block,track);commitHistory();if(state.inspOpen&&state.inspTab==="block")renderInspector()});
  });
  vp.querySelectorAll("[data-sb-media][data-slot]").forEach(function(el){
    var slotName=el.getAttribute("data-slot")||"";
    if(!slotName)return;
    if(!el.querySelector(":scope > .msSlotDice")){
      var dice=document.createElement("button");dice.type="button";dice.className="msSlotDice";dice.textContent="🎲";
      dice.title="Randomize slot";
      dice.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();pushHistory();if(randomizeTemplateSlot(block,slotName))renderUI(true)});
      el.appendChild(dice);
    }
    el.addEventListener("pointerdown",function(e){e.stopPropagation();setTemplateEditState(block,track,slotName,el.getAttribute("data-ms-node-id"));highlightTemplateMount(track);if(state.inspOpen){setInspTab("block");renderInspector()}});
  });
  vp.querySelectorAll("[data-ms-node-id]").forEach(function(el){
    if(el.hasAttribute("data-sb-editable")||el.hasAttribute("data-sb-media")||el.classList.contains("msSlotDice"))return;
    el.addEventListener("pointerdown",function(e){e.stopPropagation();setTemplateEditState(block,track,state.templateEdit.selectedSlot,el.getAttribute("data-ms-node-id"));highlightTemplateMount(track);if(state.inspOpen){setInspTab("block");renderInspector()}});
  });
}
function placeTemplateViewport(vp,block,boxW,boxH){
  var design=templateBlockDesign(block),scale=Math.min(boxW/design.w,boxH/design.h)*normalizeTemplateZoom(block.templateZoom);
  vp.style.width=design.w+"px";vp.style.height=design.h+"px";
  vp.style.left=Math.round((block.posX!=null?block.posX:0.5)*boxW)+"px";
  vp.style.top=Math.round((block.posY!=null?block.posY:0.5)*boxH)+"px";
  vp.style.transform="translate(-50%,-50%) scale("+scale+")";
}
function buildMonitorTemplateMount(stage,block,track,box){
  var design=templateBlockDesign(block),mount=document.createElement("div"),vp=document.createElement("div");
  mount.className="msTplMount"+(block.titleInstance?" title":"");
  mount.dataset.blockId=block.id;
  vp.className="msTplViewport";
  vp.style.width=design.w+"px";vp.style.height=design.h+"px";
  vp.innerHTML=templateRenderHtml(block);
  mount.appendChild(vp);stage.appendChild(mount);
  var root=vp.querySelector(".sv-section")||vp.firstElementChild;
  hardenSlideRoot(root,design.w,design.h);
  if(ensureTemplateDomIdentity(vp,block)&&!templatePreviewActive(block))block.templateHtml=templateViewportHtml(vp);
  ensureTemplateBlockState(block);
  applyTemplateBlockView(vp,block);
  placeTemplateViewport(vp,block,box.clientWidth,box.clientHeight);
  wireMonitorTemplateViewport(vp,block,track);
  return vp;
}
function mountTemplateBlockToMonitor(block,track){
  if(!block||!blockIsTemplate(block)){clearTemplateMonitorLayer(track);return false}
  ensureTemplateBlockState(block);
  var stage=templateMonitorStage(track),layer=templateMonitorLayer(track),box=$("monBox");
  if(!stage||!layer||!box||box.clientWidth<2||box.clientHeight<2)return false;
  if(track==="overlay"){
    stage.innerHTML="";
    buildMonitorTemplateMount(stage,block,track,box);
    layer.classList.add("on");
    highlightTemplateMount(track);
    return true;
  }
  var cache=templateMonitorCache[track],design=templateBlockDesign(block),scale=Math.min(box.clientWidth/design.w,box.clientHeight/design.h)*normalizeTemplateZoom(block.templateZoom);
  var needsRemount=cache.id!==block.id||cache.html!==templateRenderHtml(block);
  var vp=stage.querySelector(".msTplViewport");
  if(needsRemount||!vp){
    stage.innerHTML='<div class="msTplMount"><div class="msTplViewport"></div></div>';
    vp=stage.querySelector(".msTplViewport");
    vp.style.width=design.w+"px";vp.style.height=design.h+"px";vp.innerHTML=templateRenderHtml(block);
    var root=vp.querySelector(".sv-section")||vp.firstElementChild;
    hardenSlideRoot(root,design.w,design.h);
    if(ensureTemplateDomIdentity(vp,block)&&!templatePreviewActive(block))block.templateHtml=templateViewportHtml(vp);
    ensureTemplateBlockState(block);
    applyTemplateBlockView(vp,block);
    wireMonitorTemplateViewport(vp,block,track);
    cache.id=block.id;cache.html=templateRenderHtml(block);
  }
  applyTemplateBlockView(vp,block);
  vp.style.width=design.w+"px";vp.style.height=design.h+"px";
  vp.style.left="50%";vp.style.top="50%";
  vp.style.transform="translate(-50%,-50%) scale("+scale+")";
  layer.classList.add("on");
  cache.slot=state.templateEdit.selectedSlot;cache.node=state.templateEdit.selectedNodeSelector;
  highlightTemplateMount(track);
  return true;
}
function renderMonitorTemplateLayers(mainSample,overlaySamples){
  if(mainSample&&blockIsTemplate(mainSample.block))mountTemplateBlockToMonitor(mainSample.block,"main");
  else clearTemplateMonitorLayer("main");
  overlaySamples=(overlaySamples||[]).filter(function(sample){return sample&&blockIsTemplate(sample.block)});
  if(!overlaySamples.length){clearTemplateMonitorLayer("overlay");return}
  var stage=templateMonitorStage("overlay"),layer=templateMonitorLayer("overlay"),box=$("monBox");
  if(!stage||!layer||!box)return;
  stage.innerHTML="";
  overlaySamples.forEach(function(sample){buildMonitorTemplateMount(stage,sample.block,"overlay",box)});
  layer.classList.add("on");
  highlightTemplateMount("overlay");
}

disableLegacyTitlesUI();

if(window.PMS&&PMS.registerModule)PMS.registerModule("templates.instance",{projectCanvasSize:projectCanvasSize,parseDesignSizeFromHtml:parseDesignSizeFromHtml,normalizeOneDesignTpl:normalizeOneDesignTpl,normalizeLegacyTitles:normalizeLegacyTitles,normalizeDesignImport:normalizeDesignImport,ensurePanoVisible:ensurePanoVisible,hardenSlideRoot:hardenSlideRoot,adaptDesignToProject:adaptDesignToProject,layoutTitlesViewport:layoutTitlesViewport,mountTitlesHtml:mountTitlesHtml,renderLegacyTitlesLayer:renderLegacyTitlesLayer,wireTitlesEditable:wireTitlesEditable,syncLegacyFromDom:syncLegacyFromDom,setTitlesMode:setTitlesMode,syncTitlesUI:syncTitlesUI,activateDesignTemplate:activateDesignTemplate,activateLegacyPreset:activateLegacyPreset,renderTitlesList:renderTitlesList,importDesignData:importDesignData,importTitleFiles:importTitleFiles,pasteDesignJson:pasteDesignJson,applyTitlesEditText:applyTitlesEditText,bakeTitlesToCanvas:bakeTitlesToCanvas,captureTitlesAlphaToGallery:captureTitlesAlphaToGallery,titlesToOverlayTrack:titlesToOverlayTrack,templateBlockDesign:templateBlockDesign,ensureTemplateBlockState:ensureTemplateBlockState,templateAssetPool:templateAssetPool,templateSlotNames:templateSlotNames,templateAssignedAssetIds:templateAssignedAssetIds,replaceTemplateBlockKeepingAssignments:replaceTemplateBlockKeepingAssignments,saveTemplateBlockAsNewTemplate:saveTemplateBlockAsNewTemplate,titleInstanceDefaultSpan:titleInstanceDefaultSpan,insertTemplateAsTitleInstance:insertTemplateAsTitleInstance,applyTemplateSlotAsset:applyTemplateSlotAsset,applyAssetToSelectedTemplateSlot:applyAssetToSelectedTemplateSlot,randomizeTemplateSlot:randomizeTemplateSlot,randomizeTemplateBlock:randomizeTemplateBlock,randomizeSelectedTemplateSlot:randomizeSelectedTemplateSlot,randomizeEditingTemplateBlock:randomizeEditingTemplateBlock,setTemplateEditState:setTemplateEditState,clearTemplateEditState:clearTemplateEditState,deleteSelectedTemplateNode:deleteSelectedTemplateNode,persistMountedTemplateHtml:persistMountedTemplateHtml,renderMonitorTemplateLayers:renderMonitorTemplateLayers,clearTemplateMonitorLayer:clearTemplateMonitorLayer,disableLegacyTitlesUI:disableLegacyTitlesUI});
