"use strict";

/* Stage 3: project JSON export/import + legacy AE ZIP export. */

function serializeProjectBlock(b,layer){
  if(blockIsTemplate(b))return{id:b.id,kind:"template",templateId:b.templateId,templateHtml:b.templateHtml,templateMeta:deepClone(b.templateMeta||null),templateSlots:deepClone(b.templateSlots||{}),templateFolderId:b.templateFolderId||null,templateFolderIds:ensureStringArray(b.templateFolderIds||(b.templateFolderId?[b.templateFolderId]:[])),templateTagIds:ensureStringArray(b.templateTagIds),templateSelectedSlot:b.templateSelectedSlot||null,templateView:deepClone(b.templateView||defaultTemplateView()),templateViewMode:normalizeTemplateViewMode(b.templateViewMode),templateZoom:normalizeTemplateZoom(b.templateZoom),duration:b.duration|0,start:b.start!=null?(b.start|0):null,titleInstance:!!b.titleInstance,fixed:!!b.fixed,hidden:!!b.hidden,layer:layer||b.layer||"main"};
  return{id:b.id,kind:"asset",assetId:b.assetId,duration:b.duration|0,start:b.start!=null?(b.start|0):null,titleInstance:!!b.titleInstance,fit:b.fit,scale:b.scale,posX:b.posX,posY:b.posY,fixed:!!b.fixed,anim:b.anim,animSpeed:b.animSpeed,hidden:!!b.hidden,layer:layer||b.layer||"main"};
}
function inflateProjectBlock(data,layer){
  data=data||{};
  if(data.kind==="template"||data.templateId){
    return makeBlock(null,{id:data.id,duration:data.duration,start:data.start,titleInstance:data.titleInstance,layer:layer||data.layer||"main",kind:"template",templateId:data.templateId,templateHtml:data.templateHtml,templateMeta:deepClone(data.templateMeta||null),templateSlots:deepClone(data.templateSlots||{}),templateFolderId:data.templateFolderId||null,templateFolderIds:ensureStringArray(data.templateFolderIds||(data.templateFolderId?[data.templateFolderId]:[])),templateTagIds:ensureStringArray(data.templateTagIds),templateSelectedSlot:data.templateSelectedSlot||null,templateView:normalizeTemplateView(data.templateView),templateViewMode:normalizeTemplateViewMode(data.templateViewMode),templateZoom:normalizeTemplateZoom(data.templateZoom),fixed:data.fixed,hidden:data.hidden});
  }
  return makeBlock(data.assetId,{id:data.id,duration:data.duration,start:data.start,titleInstance:data.titleInstance,fit:data.fit,scale:data.scale,posX:data.posX,posY:data.posY,fixed:data.fixed,anim:data.anim,animSpeed:data.animSpeed,hidden:data.hidden,layer:layer||data.layer||"main"});
}

async function exportJSON(){
  try{
    var assets=await Promise.all(project.assets.map(async function(a){a=ensureAssetFolderState(a);var x={id:a.id,name:a.name,folderId:a.folderId,folderIds:(a.folderIds||[]).slice(),rootVisible:!!a.rootVisible,tagIds:a.tagIds,source:a.source,w:a.w,h:a.h,linkGroup:a.linkGroup,captureMeta:a.captureMeta,hasAlpha:!!a.hasAlpha,file:a.name};if(a.url)x.data=await fileToDataURL(a.url);return x;}));
    var panos=await Promise.all((project.panoramas||[]).map(async function(p){return{id:p.id,name:p.name,data:p.url?await fileToDataURL(p.url):null}}));
    var flats=await Promise.all((project.flatImages||[]).map(async function(p){return{id:p.id,name:p.name,w:p.w,h:p.h,sourceAssetId:p.sourceAssetId||null,data:p.url?await fileToDataURL(p.url):null}}));
    var audioData=project.audio.url?await fileToDataURL(project.audio.url):null;
    var data={version:12,name:project.name,fps:project.fps,aspect:project.aspect,outW:project.outW,outH:project.outH,timelineFrames:timelineFrames(),defaultBlockDur:project.defaultBlockDur,defaultBlockDurUnit:project.defaultBlockDurUnit,tags:project.tags,folders:project.folders,inPoint:project.inPoint,outPoint:project.outPoint,designTemplates:project.designTemplates,titlePresets:project.titlePresets,templateLibrary:deepClone(project.templateLibrary||defaultTemplateLibrary()),source:exportSourceState(),sourceType:currentSourceType(),panoView:{yaw:sourcePano().yaw,pitch:sourcePano().pitch,fov:sourcePano().fov},flatView:{scale:sourceImage().scale,posX:sourceImage().posX,posY:sourceImage().posY},activePanoId:activePanoId(),activeFlatImageId:activeFlatImageId(),audio:project.audio.name?{name:project.audio.name,muted:!!project.audio.muted,data:audioData}:null,audioBlocks:deepClone(project.audioBlocks||[]),panoramas:panos,flatImages:flats,assets:assets,blocks:project.blocks.map(function(b){return serializeProjectBlock(b,"main")}),overlayBlocks:project.overlayBlocks.map(function(b){return serializeProjectBlock(b,"overlay")})};
    downloadText((project.name||"project")+".json",JSON.stringify(data,null,2),"application/json");
  }catch(e){console.error(e);alert("Не удалось экспортировать JSON")}
}

async function exportAE(){
  try{
    var rangeIn=project.inPoint!=null?project.inPoint:0,rangeOut=project.outPoint!=null?project.outPoint:timelineFrames(),used={};
    function collect(arr){var L=layoutTrack(arr);L.forEach(function(it){if(it.end<=rangeIn||it.start>=rangeOut)return;var a=findAsset(it.block.assetId);if(a)used[a.name]=a})}
    collect(project.blocks.filter(function(b){return blockIsAsset(b)}));collect(project.overlayBlocks.filter(function(b){return blockIsAsset(b)}));
    var files={};
    for(var n in used){var ua=used[n];if(ua.url){var ud=await fileToDataURL(ua.url);files["media/"+ua.name]=dataURLBytes(ud)}}
    if(project.audio.url){var ad=await fileToDataURL(project.audio.url);files["media/"+project.audio.name]=dataURLBytes(ad)}
    var fps=project.fps,w=project.outW,h=project.outH,lines=[];
    lines.push("(function(){app.beginUndoGroup('PMS');var folder=Folder.selectDialog('Выберите папку media');if(!folder)return;var fps="+fps+",comp=app.project.items.addComp('"+escAE(project.name||"PMS")+"',"+w+","+h+",1,"+Math.max(timelineFrames()/fps,1/fps)+",fps);function ff(n){var f=new File(folder.fsName+'/'+n);return f.exists?f:null;}function add(n,st,en,sc,px,py,anim){var f=ff(n);if(!f)return;var item=app.project.importFile(new ImportOptions(f)),l=comp.layers.add(item);l.startTime=st;l.inPoint=st;l.outPoint=en;var base=Math.max("+w+"/item.width,"+h+"/item.height)*100,s=base*sc;l.property('Scale').setValue([s,s]);l.property('Position').setValue(["+w+"/2,"+h+"/2]);if(anim==='panLR'||anim==='panRL'||anim==='panTB'||anim==='panBT'){var p0=anim==='panLR'?0.2:anim==='panRL'?0.8:0.5,p1=anim==='panLR'?0.8:anim==='panRL'?0.2:0.5,q0=anim==='panTB'?0.2:anim==='panBT'?0.8:0.5,q1=anim==='panTB'?0.8:anim==='panBT'?0.2:0.5;l.property('Position').setValueAtTime(st,["+w+"/2+(p0-0.5)*"+w+","+h+"/2+(q0-0.5)*"+h+"]);l.property('Position').setValueAtTime(en,["+w+"/2+(p1-0.5)*"+w+","+h+"/2+(q1-0.5)*"+h+"]);}if(anim==='zoomIn'||anim==='zoomOut'){var z0=anim==='zoomIn'?1:1.15,z1=anim==='zoomIn'?1.15:1;l.property('Scale').setValueAtTime(st,[s*z0,s*z0]);l.property('Scale').setValueAtTime(en,[s*z1,s*z1]);}}");
    function emit(arr){var L=layoutTrack(arr);L.forEach(function(it){var b=it.block,a=findAsset(b.assetId);if(!a||it.end<=rangeIn||it.start>=rangeOut)return;var st=it.start/fps,en=it.end/fps;lines.push("add('"+escAE(a.name)+"',"+st+","+en+","+(b.scale||1)+","+(b.posX||.5)+","+(b.posY||.5)+",'"+escAE(b.anim||"none")+"');");});}
    emit(project.blocks.filter(function(b){return blockIsAsset(b)}));emit(project.overlayBlocks.filter(function(b){return blockIsAsset(b)}));
    if(project.audio&&project.audio.name){var ab=project.audioBlocks&&project.audioBlocks[0];if(ab)lines.push("{var af=ff('"+escAE(project.audio.name)+"');if(af){var ai=app.project.importFile(new ImportOptions(af)),al=comp.layers.add(ai);al.startTime="+(ab.start/project.fps)+";al.inPoint="+(ab.start/project.fps)+";al.outPoint="+((ab.start+ab.duration)/project.fps)+";}}");}
    if(project.blocks.some(blockIsTemplate)||project.overlayBlocks.some(blockIsTemplate))lines.push("alert('Template blocks exported as live Motion Studio data only. AE ZIP currently includes image blocks only.');");
    lines.push("app.endUndoGroup();alert('AE composition created');})();");
    files[(project.name||"project")+"_ae.jsx"]=new TextEncoder().encode(lines.join("\n"));
    var blob=new Blob([zipStore(files)],{type:"application/zip"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.name||"project")+"_AE.zip";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
  }catch(e){console.error(e);alert("Не удалось экспортировать AE ZIP")}
}

function importJSON(file){
  var reader=new FileReader();reader.onload=function(){(async function(){
    try{
      var data=JSON.parse(reader.result);
      if(!data||data.version<4){alert("Нужен JSON v4+");return}
      pushHistory();
      project.name=data.name||"Untitled";
      project.fps=clamp(data.fps|0||30,1,60);
      project.aspect=data.aspect||"16:9";
      project.outW=data.outW|0||1920;
      project.outH=data.outH|0||1080;
      project.timelineFrames=data.timelineFrames|0||Math.round(DEFAULT_TL_SEC*project.fps);
      if(data.defaultBlockDur!=null)project.defaultBlockDur=data.defaultBlockDur;
      if(data.defaultBlockDurUnit)project.defaultBlockDurUnit=data.defaultBlockDurUnit;
      project.tags=data.tags||[];
      project.folders=data.folders||[];
      project.inPoint=data.inPoint!=null?data.inPoint:null;
      project.outPoint=data.outPoint!=null?data.outPoint:null;
      project.designTemplates=data.designTemplates||[];
      project.titlePresets=data.titlePresets||[];
      project.templateLibrary=deepClone(data.templateLibrary||project.templateLibrary||defaultTemplateLibrary());
      ensureProjectTemplateLibrary();
      importSourceState(legacySourceStateFromData(data));
      project.audioBlocks=deepClone(data.audioBlocks||[]);
      var old=project.assets.slice();project.assets=[];
      for(var i=0;i<(data.assets||[]).length;i++){
        var a=data.assets[i],found=null;
        for(var j=0;j<old.length;j++)if(old[j].name===a.name||old[j].name===a.file){found=old[j];break}
        var media=a.data?await dataURLToImage(a.data,a.name||a.file):null;
        project.assets.push(makeAsset({id:a.id,name:a.name||a.file,folderId:a.folderId||null,folderIds:Array.isArray(a.folderIds)?a.folderIds:(a.folderId?[a.folderId]:[]),rootVisible:a.rootVisible!=null?!!a.rootVisible:!(a.folderId),tagIds:a.tagIds||[],source:a.source||"import",url:media?media.url:(found?found.url:null),img:media?media.img:(found?found.img:null),w:a.w||(media?media.w:0),h:a.h||(media?media.h:0),linkGroup:a.linkGroup||null,captureMeta:a.captureMeta||null,hasAlpha:!!a.hasAlpha}));
      }
      project.panoramas=[];
      for(var k=0;k<(data.panoramas||[]).length;k++){
        var pp=data.panoramas[k],pm=pp.data?await dataURLToImage(pp.data,pp.name):null;
        project.panoramas.push({id:pp.id,name:pp.name,url:pm?pm.url:null,img:pm?pm.img:null});
      }
      project.flatImages=[];
      for(var q=0;q<(data.flatImages||[]).length;q++){
        var fp=data.flatImages[q],fm=fp.data?await dataURLToImage(fp.data,fp.name):null;
        project.flatImages.push(makeFlatImageSource({id:fp.id,name:fp.name,url:fm?fm.url:null,img:fm?fm.img:null,w:fp.w||(fm?fm.w:0),h:fp.h||(fm?fm.h:0),sourceAssetId:fp.sourceAssetId||null}));
      }
      if(data.audio&&data.audio.data){
        if(project.audio.url)try{URL.revokeObjectURL(project.audio.url)}catch(e){}
        project.audio.url=await dataURLToURL(data.audio.data);
        project.audio.name=data.audio.name||null;
        project.audio.muted=!!data.audio.muted;
      }else project.audio={name:data.audio&&data.audio.name||null,url:null,muted:!!(data.audio&&data.audio.muted)};
      project.blocks=(data.blocks||[]).map(function(b){return inflateProjectBlock(b,"main")});
      project.overlayBlocks=(data.overlayBlocks||[]).map(function(b){return inflateProjectBlock(b,"overlay")});
      ensureContentFitsTL();
      $("fps").value=project.fps;
      $("aspectSelect").value=project.aspect;
      if($("aspectSelectImage"))$("aspectSelectImage").value=project.aspect;
      state.G=0;state.selectedBlockIds=[];state.selectedOverlayIds=[];state.selectedAssetIds=[];state.selectedTemplateIds=[];
      var mergedLib=ensureProjectTemplateLibrary();
      if(mergedLib&&mergedLib.templates&&mergedLib.templates.length){state.activeTemplateId=mergedLib.templates[0].id||mergedLib.templates[0].tpl||null;state.selectedTemplateIds=[state.activeTemplateId]}
      endAllTlPointers();
      if(typeof syncLibraryPane==="function")syncLibraryPane();
      renderUI(true);applyMode();syncAudioUI();
      if(activePanoId()&&currentSourceType()!=="image")setActivePano(activePanoId(),{skipHistory:true});else syncPanoSelect();
      if(typeof syncFlatImageSelect==="function")syncFlatImageSelect();
      if(currentSourceType()==="image"&&activeFlatImageId()&&typeof setActiveFlatImage==="function")setActiveFlatImage(activeFlatImageId(),{keepView:true,skipHistory:true});
      else if(typeof syncSourceViewerUI==="function")syncSourceViewerUI();
    }catch(e){console.error(e);alert("Не удалось прочитать JSON")}
  })()};reader.readAsText(file);
}

if(window.PMS&&PMS.registerModule)PMS.registerModule("export.ae",{serializeProjectBlock:serializeProjectBlock,inflateProjectBlock:inflateProjectBlock,exportJSON:exportJSON,exportAE:exportAE,importJSON:importJSON});
