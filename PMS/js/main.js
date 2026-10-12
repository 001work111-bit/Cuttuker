"use strict";

/* Stage 3: event wiring, delete semantics for template instances, app bootstrap. */

function bind(){
  $("modeSelect").onchange=function(){setMode(this.value)};
  $("btnInspToggle").onclick=function(){setInspOpen(!state.inspOpen)};
  document.querySelectorAll("#inspectorPane .tab").forEach(function(t){t.onclick=function(){setInspTab(t.dataset.insp)}});
  $("filePano").onchange=function(e){if(e.target.files)addPanoFiles(e.target.files);e.target.value=""};
  $("fileImg").onchange=function(e){if(e.target.files)addImageFiles(e.target.files);e.target.value=""};
  $("fileJson").onchange=function(e){var f=e.target.files&&e.target.files[0];if(f)importJSON(f);e.target.value=""};
  $("fileAudio").onchange=function(e){var f=e.target.files&&e.target.files[0];if(f)loadAudioFile(f);e.target.value=""};
  $("fileTitles").onchange=function(e){if(e.target.files)importTitleFiles(e.target.files);e.target.value=""};
  $("btnAudioMute").onclick=function(){project.audio.muted=!project.audio.muted;syncAudioUI();if(state.playing&&!project.audio.muted)playAudio();if(project.audio.muted)pauseAudio()};
  $("btnAudioDel").onclick=clearAudio;
  $("btnCapture").onclick=function(){doCapture()};
  $("btnDraw").onclick=function(){setDrawMode(!state.draw.on)};
  $("btnTitles").onclick=function(){setTitlesMode(!state.titles.on)};
  $("btnSwap").onclick=swapSelectedBlocks;$("btnCut").onclick=cutSelectedBlock;$("btnMerge").onclick=mergeSelectedBlocks;
  $("btnUndo").onclick=undo;$("btnRedo").onclick=redo;
  $("btnPlay").onclick=togglePlay;
  $("btnToStart").onclick=function(){state.G=hasIOLoop()?project.inPoint:0;setPlaying(false);applyFrame();updateHud();drawPlayhead();seekAudio()};
  $("btnPrev").onclick=function(){stepG(-1)};$("btnNext").onclick=function(){stepG(1)};
  $("btnMarkIn").onclick=function(){pushHistory();project.inPoint=Math.floor(state.G);drawTimeline();updateHud()};
  $("btnMarkOut").onclick=function(){pushHistory();project.outPoint=Math.ceil(state.G);if(project.outPoint<=(project.inPoint||0))project.outPoint=(project.inPoint||0)+1;drawTimeline();updateHud()};
  $("btnClearIO").onclick=function(){pushHistory();project.inPoint=project.outPoint=null;drawTimeline();updateHud()};
  $("btnFolder").onclick=function(){var name=prompt("Имя папки","Папка "+(project.folders.length+1));if(!name)return;pushHistory();project.folders.push({id:uid("f"),name:name});renderLibraryPane();if(state.inspOpen)renderInspector()};
  $("btnTagLib").onclick=function(){setInspTab("project");setInspOpen(true)};
  $("btnRndSel").onclick=function(){
    var selectedMain=state.selectedBlockIds.length,selectedOv=state.selectedOverlayIds.length,selectedTotal=selectedMain+selectedOv;
    var eb=editingBlock();
    if(selectedTotal<=1&&eb&&blockIsTemplate(eb.block)){pushHistory();if(randomizeEditingTemplateBlock())renderUI(true);return}
    var bl=selectedBlocks();
    if(!bl.length&&state.selectedOverlayIds.length)bl=project.overlayBlocks.filter(function(b){return state.selectedOverlayIds.indexOf(b.id)>=0});
    if(!bl.length){alert("Выдели блоки");return}
    var imageBlocks=bl.filter(function(b){return !blockIsTemplate(b)}),templateBlocks=bl.filter(function(b){return blockIsTemplate(b)}),done=false;
    pushHistory();
    if(imageBlocks.length)done=randomizeAssetBlocks(imageBlocks,null,false,{folderIds:state.rndAssetFolderFilter,tagIds:state.rndAssetTagFilter,silent:templateBlocks.length>0})||done;
    if(templateBlocks.length)done=randomizeTemplateBlocksWithProjectFilters(templateBlocks,{pushHistory:false,silent:imageBlocks.length>0})||done;
    if(!done)alert("Нет подходящих данных для randomize");
    renderUI(true);
  };
  $("btnDel").onclick=function(){
    if(state.templateEdit.selectedNodeSelector&&editingBlock()&&blockIsTemplate(editingBlock().block)){
      pushHistory();
      if(deleteSelectedTemplateNode()){renderUI(true);return}
    }
    if(state.selectedBlockIds.length||state.selectedOverlayIds.length){
      pushHistory();
      if(state.selectedBlockIds.length)project.blocks=project.blocks.filter(function(b){return state.selectedBlockIds.indexOf(b.id)<0});
      if(state.selectedOverlayIds.length)project.overlayBlocks=project.overlayBlocks.filter(function(b){return state.selectedOverlayIds.indexOf(b.id)<0});
      state.selectedBlockIds=[];state.selectedOverlayIds=[];state.blockSelectionLocked=false;clearTemplateEditState();ensureG();renderUI(true);return;
    }
    if(libraryMode&&libraryMode()==="templates"&&state.selectedTemplateIds&&state.selectedTemplateIds.length){
      var userIds=state.selectedTemplateIds.filter(function(id){var t=findTemplate(id);return t&&t.librarySource==="user"});
      if(userIds.length){
        if(!confirm("Удалить выбранные user templates из библиотеки?"))return;
        pushHistory();
        deleteUserTemplates(userIds);
        if(typeof persistUserLibrary==="function")persistUserLibrary("delete-user-template-hotkey");
        renderUI(true);
        return;
      }
    }
    if(state.selectedAssetIds.length){
      var ids=state.selectedAssetIds.slice();
      var folderContext=project.activeFolderId;
      var canFolderOnly=folderContext!=null;
      if(canFolderOnly){
        var choice=confirm("OK = удалить полностью из проекта\nОтмена = удалить только членство в текущей папке/контексте");
        if(choice)deleteAssets(ids,"full");else deleteAssets(ids,"folder-only");
      }else deleteAssets(ids,"full");
      renderUI(true);
    }
  };
  $("btnExportJson").onclick=exportJSON;
  $("btnExportAE").onclick=exportAE;
  $("btnExportPremiere").onclick=exportPremiereXMLBundle;
  $("fps").onchange=function(){
    var old=project.fps,sec=timelineFrames()/Math.max(1,old);
    project.fps=clamp(this.value|0,1,60);
    project.timelineFrames=Math.max(Math.max(contentLength(),overlayContentLength()),Math.round(sec*project.fps));
    renderUI(true);
  };
  $("galScale").oninput=function(){state.galScale=this.value|0;renderLibraryPane()};
  $("tlZoom").oninput=function(){setTlZoom(this.value|0,null)};
  $("panoSelect").onchange=function(){setActivePano(this.value)};
  $("aspectSelect").onchange=function(){project.aspect=this.value;if($("aspectSelectImage"))$("aspectSelectImage").value=this.value;syncOutFromAspect();applyMode();layoutTitlesViewport();if(state.inspOpen)renderInspector()};
  if($("aspectSelectImage"))$("aspectSelectImage").onchange=function(){project.aspect=this.value;$("aspectSelect").value=this.value;syncOutFromAspect();applyMode();layoutTitlesViewport();if(state.inspOpen)renderInspector()};

  $("drawBgAlpha").oninput=function(){state.draw.bgAlpha=(this.value|0)/100;$("drawBgAlphaV").textContent=this.value+"%";syncDrawBg()};
  $("drawTool").onchange=function(){state.draw.tool=this.value};
  $("drawSize").oninput=function(){state.draw.size=this.value|0;$("drawSizeV").textContent=this.value};
  $("drawColor").oninput=function(){state.draw.color=this.value};
  $("drawClear").onclick=clearDraw;
  $("drawClose").onclick=function(){setDrawMode(false)};
  $("titlesPaste").onclick=function(){pasteDesignJson()};
  $("titlesApplyText").onclick=applyTitlesEditText;
  $("titlesCapAlpha").onclick=captureTitlesAlphaToGallery;
  $("titlesToOverlay").onclick=titlesToOverlayTrack;
  $("titlesClose").onclick=function(){setTitlesMode(false)};

  var lastDraw=null,drawStrokeActive=false;
  drawCanvas.addEventListener("pointerdown",function(e){
    if(!state.draw.on)return;
    if(e.ctrlKey){e.preventDefault();e.stopPropagation();routeCapture("timeline-after");return}
    if(e.altKey){e.preventDefault();e.stopPropagation();routeCapture("replace-selected");return}
    e.preventDefault();e.stopPropagation();
    pushDrawUndo();
    state.draw.painting=true;drawStrokeActive=true;lastDraw=drawPointerPos(e);
    strokeDraw(lastDraw,{x:lastDraw.x+0.01,y:lastDraw.y+0.01});
    try{drawCanvas.setPointerCapture(e.pointerId)}catch(err){}
  });
  drawCanvas.addEventListener("pointermove",function(e){if(!state.draw.painting)return;var p=drawPointerPos(e);strokeDraw(lastDraw,p);lastDraw=p});
  function endDrawPaint(){if(drawStrokeActive){drawStrokeActive=false;pushHistory()}state.draw.painting=false;lastDraw=null}
  drawCanvas.addEventListener("pointerup",endDrawPaint);
  drawCanvas.addEventListener("pointercancel",endDrawPaint);
  drawCanvas.addEventListener("lostpointercapture",endDrawPaint);

  var splitDragging=false;
  $("splitter").addEventListener("pointerdown",function(e){splitDragging=true;$("splitter").classList.add("drag");try{$("splitter").setPointerCapture(e.pointerId)}catch(err){}});
  window.addEventListener("pointermove",function(e){
    if(!splitDragging)return;
    var st=$("stage").getBoundingClientRect();
    state.splitPct=clamp((e.clientX-st.left)/Math.max(1,st.width)*100,18,82);
    $("leftZone").style.flexBasis=state.splitPct+"%";$("rightZone").style.flexBasis=(100-state.splitPct)+"%";
    syncAspectBoxes();drawMonitor();if(typeof drawActiveSource==="function")drawActiveSource();else drawPano();if(libraryMode()==="templates")renderTemplateBrowser();
  });
  window.addEventListener("pointerup",function(){splitDragging=false;$("splitter").classList.remove("drag")});

  var sc=$("tlScroll");
  sc.addEventListener("pointerdown",function(e){
    if(e.target.closest(".tlBlock")||e.target.closest(".tlAudioBlock"))return;
    if(!state.blockSelectionLocked&&!e.shiftKey&&!e.metaKey&&!e.ctrlKey){
      state.selectedBlockIds=[];state.selectedOverlayIds=[];clearTemplateEditState();
      if(state.inspOpen)renderInspector();
    }
    endAllTlPointers();
    state.scrubTl=true;setPlaying(false);seekFromClientX(e.clientX);
    try{sc.setPointerCapture(e.pointerId)}catch(err){}
    drawTimeline();
  });
  sc.addEventListener("pointermove",function(e){
    if(state.audioResize||state.audioDrag){onAudioPointerMove(e.clientX);return}
    if(state.resize){onResizeMove(e.clientX);return}
    if(state.dragBlock){
      var dx=e.clientX-state.dragBlock.startX;
      if(Math.abs(dx)>6)state.dragBlock.moved=true;
      if(state.dragBlock.moved){
        if(state.dragBlock.absolute){
          var delta=Math.round(dx/pxPerFrame());
          Object.keys(state.dragBlock.origStarts||{}).forEach(function(id){
            var b=findOverlay(id);if(!b||!b.titleInstance)return;
            b.start=snapFrameToMainBoundaries(Math.max(0,(state.dragBlock.origStarts[id]|0)+delta));
          });
          drawTimeline();applyFrame();updateHud();
        }else{
          var g=xToFrame(e.clientX);
          var it=blockAtG(g,state.dragBlock.track);
          var len=state.dragBlock.track==="overlay"?project.overlayBlocks.length:project.blocks.length;
          state.dragBlock.targetIndex=it?it.index:len;
        }
      }
      return;
    }
    if(state.scrubTl)seekFromClientX(e.clientX);
  });
  function endTl(e){
    if(state.audioResize){pushHistory();state.audioResize=null;drawTimeline()}
    if(state.audioDrag){pushHistory();state.audioDrag=null;drawTimeline()}
    if(state.resize){pushHistory();state.resize=null;drawTimeline();applyFrame();updateHud();if(state.inspOpen)renderInspector()}
    if(state.dragBlock){if(state.dragBlock.moved){if(state.dragBlock.absolute)pushHistory();else if(state.dragBlock.targetIndex!=null){pushHistory();reorderBlocks(state.dragBlock.ids,state.dragBlock.targetIndex,state.dragBlock.track)}}state.dragBlock=null;drawTimeline();applyFrame();if(state.inspOpen)renderInspector()}
    state.scrubTl=false;try{if(e&&e.pointerId!=null)sc.releasePointerCapture(e.pointerId)}catch(err){}
  }
  sc.addEventListener("pointerup",endTl);
  sc.addEventListener("pointercancel",endTl);
  sc.addEventListener("lostpointercapture",function(){endAllTlPointers()});
  sc.addEventListener("wheel",function(e){if(e.ctrlKey||e.altKey||e.metaKey){e.preventDefault();var next=clamp(state.tlZoom+(e.deltaY>0?-1:1),2,40);setTlZoom(next,e.clientX)}},{passive:false});
  sc.addEventListener("dragover",function(e){e.preventDefault();e.dataTransfer.dropEffect="copy"});
  sc.addEventListener("drop",function(e){
    if(e.target.closest(".tlBlock"))return;
    e.preventDefault();e.stopPropagation();
    var tplIds=typeof getDragTemplateIds==='function'?getDragTemplateIds(e):[];
    var ids=getDragAssetIds(e);
    if(!tplIds.length&&!ids.length)return;
    pushHistory();
    if(tplIds.length){
      var eb=editingBlock();
      if(eb&&eb.block){
        var arr=eb.track==="overlay"?project.overlayBlocks:project.blocks;
        var idxSel=findIndexIn(arr,eb.block.id);
        if(eb.track==="overlay"){state.selectedOverlayIds=insertTemplateBlocks(tplIds,idxSel+1,"overlay");state.selectedBlockIds=[]}
        else{state.selectedBlockIds=insertTemplateBlocks(tplIds,idxSel+1,"main");state.selectedOverlayIds=[]}
      }else{state.selectedBlockIds=insertTemplateBlocks(tplIds,project.blocks.length,"main");state.selectedOverlayIds=[]}
    }else{
      var g=xToFrame(e.clientX),it=blockAtG(g,"main"),idx;
      if(it)idx=it.index+1;
      else if(g>=contentLength())idx=project.blocks.length;
      else{var L=layout();idx=L.length;for(var i=0;i<L.length;i++)if(g<L[i].start){idx=i;break}}
      state.selectedBlockIds=insertBlocks(ids,idx,"main");state.selectedOverlayIds=[];
    }
    endAllTlPointers();renderUI(true);
  });

  panoCanvas.addEventListener("pointerdown",function(e){
    if(e.button!==0)return;
    if(state.draw.on)return;
    if(e.target.closest&&e.target.closest("#titlesViewport [data-sb-editable], #titlesViewport [data-sb-media]"))return;
    if(e.ctrlKey){e.preventDefault();routeCapture("timeline-after");return}
    if(e.altKey){e.preventDefault();routeCapture("replace-selected");return}
    state.draggingPano=true;state.prevX=e.clientX;state.prevY=e.clientY;panoCanvas.classList.add("drag");
    try{panoCanvas.setPointerCapture(e.pointerId)}catch(err){}
  });
  panoCanvas.addEventListener("pointermove",function(e){
    if(!state.draggingPano)return;
    var dx=e.clientX-state.prevX,dy=e.clientY-state.prevY;state.prevX=e.clientX;state.prevY=e.clientY;
    var pano=sourcePano();
    var sens=0.005*(pano.fov/(75*DEG));
    pano.yaw-=dx*sens;pano.pitch=clamp(pano.pitch+dy*sens,-1.55,1.55);updateHud();
  });
  function endPano(){state.draggingPano=false;panoCanvas.classList.remove("drag")}
  panoCanvas.addEventListener("pointerup",endPano);
  panoCanvas.addEventListener("pointercancel",endPano);
  panoCanvas.addEventListener("lostpointercapture",endPano);
  panoCanvas.addEventListener("wheel",function(e){e.preventDefault();var pano=sourcePano();pano.fov=clamp(pano.fov+e.deltaY*0.0012,0.45,1.9);updateHud()},{passive:false});

  var monCommitTimer=null;
  function monCommit(){if(monCommitTimer)clearTimeout(monCommitTimer);monCommitTimer=setTimeout(function(){pushHistory();monCommitTimer=null;if(state.inspOpen&&state.inspTab==="block")renderInspector()},200)}
  monCanvas.addEventListener("wheel",function(e){
    var eb=editingBlock();if(!eb||!blockIsAsset(eb.block))return;
    e.preventDefault();
    var b=eb.block;
    var next=clamp((+b.scale||1)+(e.deltaY>0?-0.06:0.06),0.2,3);
    b.scale=Math.round(next*100)/100;
    applyFrame();updateHud();monCommit();
  },{passive:false});
  monCanvas.addEventListener("pointerdown",function(e){
    if(!e.altKey)return;
    var eb=editingBlock();if(!eb||!blockIsAsset(eb.block))return;
    e.preventDefault();
    var b=eb.block;
    state.monEdit.dragging=true;
    state.monEdit.startX=e.clientX;state.monEdit.startY=e.clientY;
    state.monEdit.origX=+b.posX||0.5;state.monEdit.origY=+b.posY||0.5;
    state.monEdit.blockId=b.id;state.monEdit.track=eb.track;
    try{monCanvas.setPointerCapture(e.pointerId)}catch(err){}
  });
  monCanvas.addEventListener("pointermove",function(e){
    if(!state.monEdit.dragging)return;
    var b=state.monEdit.track==="overlay"?findOverlay(state.monEdit.blockId):findBlock(state.monEdit.blockId);
    if(!b)return;
    var box=$("monBox").getBoundingClientRect();
    var dx=(e.clientX-state.monEdit.startX)/Math.max(1,box.width);
    var dy=(e.clientY-state.monEdit.startY)/Math.max(1,box.height);
    b.posX=clamp(state.monEdit.origX-dx,0,1);
    b.posY=clamp(state.monEdit.origY-dy,0,1);
    applyFrame();
  });
  function endMonEdit(){if(state.monEdit.dragging){state.monEdit.dragging=false;pushHistory();if(state.inspOpen&&state.inspTab==="block")renderInspector()}}
  monCanvas.addEventListener("pointerup",endMonEdit);
  monCanvas.addEventListener("pointercancel",endMonEdit);
  monCanvas.addEventListener("lostpointercapture",endMonEdit);

  window.addEventListener("keydown",function(e){
    var inField=e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT"||e.target.isContentEditable);
    if((e.ctrlKey||e.metaKey)&&e.code==="KeyZ"){e.preventDefault();if(e.shiftKey)redo();else undo();return}
    if((e.ctrlKey||e.metaKey)&&e.code==="KeyY"){e.preventDefault();redo();return}
    if(!inField&&(e.code==="Delete"||e.code==="Backspace")&&state.templateEdit.selectedNodeSelector&&editingBlock()&&blockIsTemplate(editingBlock().block)){e.preventDefault();$("btnDel").click();return}
    if(inField)return;
    if(e.altKey&&e.code>="Digit1"&&e.code<="Digit7"){e.preventDefault();var n=parseInt(e.code.replace("Digit",""),10)-1;if(MODE_ORDER[n])setMode(MODE_ORDER[n]);return}
    if(e.code==="Space"){e.preventDefault();togglePlay()}
    else if(e.code==="Escape"){
      if(state.templateEdit.selectedNodeSelector||state.templateEdit.selectedSlot){state.templateEdit.selectedNodeSelector=null;state.templateEdit.selectedSlot=null;renderUI(true)}
      else if(state.draw.on)setDrawMode(false);
      else if(state.titles.on)setTitlesMode(false);
      else if(state.mode==="mon-only")setMode(state.prevMode||"pano-mon-tl");
      else if(state.inspOpen)setInspOpen(false);
      else{state.selectedBlockIds=[];state.selectedOverlayIds=[];clearTemplateEditState();drawTimeline();if(state.inspOpen)renderInspector()}
    }
    else if(e.code==="ArrowRight")stepG(e.shiftKey?5:1);
    else if(e.code==="ArrowLeft")stepG(e.shiftKey?-5:-1);
    else if(e.code==="Delete"||e.code==="Backspace")$("btnDel").click();
    else if(e.code==="KeyC"&&!e.metaKey&&!e.ctrlKey&&!e.altKey)doCapture();
    else if(e.code==="KeyD"&&!e.metaKey&&!e.ctrlKey&&!e.altKey)setDrawMode(!state.draw.on);
    else if(e.code==="KeyT"&&!e.metaKey&&!e.ctrlKey&&!e.altKey)setTitlesMode(!state.titles.on);
    else if(e.code==="KeyX"&&!e.metaKey&&!e.ctrlKey&&!e.altKey)swapSelectedBlocks();
    else if(e.code==="KeyI"&&!e.metaKey&&!e.ctrlKey)$("btnMarkIn").click();
    else if(e.code==="KeyO"&&!e.metaKey&&!e.ctrlKey)$("btnMarkOut").click();
  });

  window.addEventListener("dragover",function(e){e.preventDefault()});
  window.addEventListener("drop",function(e){
    e.preventDefault();
    if(e.target.closest("#tlScroll")||e.target.closest(".tlBlock")||e.target.closest("#galFolders")||e.target.closest("#galGrid")||e.target.closest("#titlesPopup")||e.target.closest("#templatesWrap"))return;
    var files=e.dataTransfer&&e.dataTransfer.files;if(!files||!files.length)return;
    var imgs=[],auds=[],jsons=[];
    for(var i=0;i<files.length;i++){
      if(/^image\//.test(files[i].type))imgs.push(files[i]);
      else if(/^audio\//.test(files[i].type))auds.push(files[i]);
      else if(/json$/i.test(files[i].name)||files[i].type==="application/json")jsons.push(files[i]);
    }
    if(imgs.length)addImageFiles(imgs);
    if(auds[0])loadAudioFile(auds[0]);
    if(jsons.length)importTitleFiles(jsons);
  });
  window.addEventListener("resize",function(){syncAspectBoxes();drawMonitor();if(typeof drawActiveSource==="function")drawActiveSource();else drawPano();drawTimeline();layoutTitlesViewport();if(libraryMode()==="templates")renderTemplateBrowser()});
  window.addEventListener("blur",function(){endAllTlPointers();endMonEdit();endPano();if(typeof endFlatImageDrag==="function")endFlatImageDrag();state.draw.painting=false});
}

function loop(ts){
  if(state.playing){
    var tf=timelineFrames();
    if(tf<=0)setPlaying(false);
    else{
      if(!state.lastTs)state.lastTs=ts;
      var dt=(ts-state.lastTs)/1000;state.lastTs=ts;state.G+=dt*project.fps;
      if(hasIOLoop()){
        if(state.G<project.inPoint)state.G=project.inPoint;
        if(state.G>=project.outPoint-1e-9){state.G=project.inPoint;seekAudio()}
      }else if(state.G>=tf-1e-9){state.G=Math.max(0,tf-1e-9);setPlaying(false)}
      applyFrame();updateHud();
    }
  }else state.lastTs=0;
  if(!$("panoWrap").classList.contains("hide")){if(typeof drawActiveSource==="function")drawActiveSource();else drawPano()}
  requestAnimationFrame(loop);
}

initPanoGL();
bind();
pushHistory();
setInspOpen(false);
setMode("pano-mon-tl");
$("tlZoom").value=String(state.tlZoom);
syncAudioUI();
if($("aspectSelectImage"))$("aspectSelectImage").value=project.aspect;
if(project.templateLibrary&&project.templateLibrary.templates&&project.templateLibrary.templates.length)setLibraryMode("templates",{skipRender:true});
renderUI(true);
requestAnimationFrame(loop);

if(window.PMS&&PMS.registerModule)PMS.registerModule("main",{bind:bind,loop:loop});
