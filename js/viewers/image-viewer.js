"use strict";

/* Stage 2 cleanup-pass: flat-image source mode with normalized source state. */

var imageCanvas=$("imageCanvas");
var imageCtx=imageCanvas.getContext("2d");

function makeFlatImageSource(o){
  o=o||{};
  return{id:o.id||uid("fi"),name:o.name||"flat-image",url:o.url||null,img:o.img||null,w:o.w||0,h:o.h||0,sourceAssetId:o.sourceAssetId||null};
}
function findFlatImage(id){return findIn(project.flatImages||[],id)}
function activeFlatImage(){return findFlatImage(activeFlatImageId())}
function sourceOutputSize(){var tw=project.outW|0,th=project.outH|0;if(tw<16)tw=1920;if(th<16)th=Math.round(tw/aspectRatio(project.aspect));return{w:tw,h:th}}
function currentFlatView(){return sourceImage()}
function flatViewChanged(a,b){return !a||!b||a.activeId!==b.activeId||Math.abs((a.scale||1)-(b.scale||1))>1e-9||Math.abs((a.posX||0.5)-(b.posX||0.5))>1e-9||Math.abs((a.posY||0.5)-(b.posY||0.5))>1e-9}
function syncSourceViewerUI(){
  var isImage=currentSourceType()==="image";
  if($("sourceTypeSelect"))$("sourceTypeSelect").value=isImage?"image":"pano";
  panoCanvas.classList.toggle("hide",isImage);
  imageCanvas.classList.toggle("hide",!isImage);
  $("panoEmpty").classList.toggle("hide",isImage);
  $("imageEmpty").classList.toggle("hide",!isImage);
  if(isImage)$("imageEmpty").textContent=activeFlatImage()?"":"Загрузите плоское изображение";
}
function refreshSourceView(){
  syncSourceViewerUI();
  if(typeof applyMode==="function")applyMode();
  else if(typeof drawActiveSource==="function")drawActiveSource();
  updateHud();
}
function setSourceType(type,opts){
  opts=opts||{};
  var prev=currentSourceType(),next=type==="image"?"image":"pano";
  setCurrentSourceType(next);
  refreshSourceView();
  if(!opts.skipHistory&&prev!==next)commitHistory();
}
function syncFlatImageSelect(){
  var sel=$("imageSelect");if(!sel)return;
  sel.innerHTML="";
  if(!(project.flatImages||[]).length){var o=document.createElement("option");o.textContent="нет flat-источников";sel.appendChild(o);return}
  project.flatImages.forEach(function(x){var o=document.createElement("option");o.value=x.id;o.textContent=x.name;if(x.id===activeFlatImageId())o.selected=true;sel.appendChild(o)});
}
function resetFlatImageView(opts){
  opts=opts||{};
  var before=deepClone(currentFlatView());
  resetFlatImageViewState();
  drawFlatImage();updateHud();
  if(!opts.skipHistory&&flatViewChanged(before,currentFlatView()))commitHistory();
}
function setActiveFlatImage(id,opts){
  opts=opts||{};
  var before={type:currentSourceType(),image:deepClone(currentFlatView())};
  setActiveFlatImageId(id||null);
  if(!opts.keepView)resetFlatImageViewState();
  setCurrentSourceType("image");
  syncFlatImageSelect();
  syncSourceViewerUI();
  if(typeof ensurePanoVisible==="function")ensurePanoVisible();
  if(typeof applyMode==="function")applyMode();
  else drawFlatImage();
  updateHud();
  var after={type:currentSourceType(),image:deepClone(currentFlatView())};
  if(!opts.skipHistory&&(before.type!==after.type||flatViewChanged(before.image,after.image)))commitHistory();
}
function addFlatImageFiles(fileList){
  var files=[].slice.call(fileList||[]).filter(function(f){return /^image\//.test(f.type)});if(!files.length)return;
  var chain=Promise.resolve(),firstId=null;
  files.forEach(function(file){
    chain=chain.then(function(){return loadImageFile(file)}).then(function(o){
      var item=makeFlatImageSource({name:o.name,url:o.url,img:o.img,w:o.w,h:o.h});
      project.flatImages.push(item);
      if(!firstId)firstId=item.id;
    });
  });
  chain.then(function(){
    syncFlatImageSelect();
    setActiveFlatImage(firstId||activeFlatImageId(),{keepView:false,skipHistory:true});
    commitHistory();
    if(state.inspOpen)renderInspector();
    updateHud();
  });
}
function openAssetInFlatMode(assetId,opts){
  opts=opts||{};
  var a=findAsset(assetId);if(!a||!a.url||!a.img){alert("У этой картинки нет данных для flat-view");return}
  var found=(project.flatImages||[]).find(function(x){return x.sourceAssetId===assetId});
  if(!found){found=makeFlatImageSource({name:a.name,url:a.url,img:a.img,w:a.w,h:a.h,sourceAssetId:assetId});project.flatImages.push(found)}
  syncFlatImageSelect();
  setActiveFlatImage(found.id,{keepView:false,skipHistory:true});
  if(!opts.skipHistory)commitHistory();
}
function resizeFlatImageCanvas(){
  var box=$("panoBox");if(!box||box.clientWidth<1)return;
  var dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);
  imageCanvas.width=Math.floor(w*dpr);imageCanvas.height=Math.floor(h*dpr);
  imageCtx.setTransform(dpr,0,0,dpr,0,0);
  if(currentSourceType()==="image")drawFlatImage();
}
function flatDrawMetrics(img,W,H){
  var view=currentFlatView();
  var iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1;
  var base=Math.max(W/iw,H/ih),sc=base*Math.max(0.05,view.scale||1),dw=iw*sc,dh=ih*sc;
  return{iw:iw,ih:ih,base:base,sc:sc,dw:dw,dh:dh};
}
function normalizeFlatImagePosition(img,W,H){
  var view=currentFlatView(),m=flatDrawMetrics(img,W,H);
  if(m.dw<=W+0.5)view.posX=0.5;else view.posX=clamp(view.posX,0,1);
  if(m.dh<=H+0.5)view.posY=0.5;else view.posY=clamp(view.posY,0,1);
  return m;
}
function drawFlatImageTo(ctx,img,W,H){
  var view=currentFlatView(),m=normalizeFlatImagePosition(img,W,H);
  var dx=(W-m.dw)*(view.posX==null?0.5:view.posX),dy=(H-m.dh)*(view.posY==null?0.5:view.posY);
  ctx.save();
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);
  ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  ctx.drawImage(img,dx,dy,m.dw,m.dh);
  ctx.restore();
}
function drawFlatImage(){
  syncSourceViewerUI();
  if(currentSourceType()!=="image"||$("panoWrap").classList.contains("hide"))return;
  var box=$("panoBox"),img=activeFlatImage();
  if(!box||box.clientWidth<1)return;
  var W=Math.max(1,box.clientWidth),H=Math.max(1,box.clientHeight),dpr=Math.min(devicePixelRatio||1,2);
  imageCtx.setTransform(1,0,0,1,0,0);imageCtx.clearRect(0,0,imageCanvas.width||1,imageCanvas.height||1);
  imageCtx.setTransform(dpr,0,0,dpr,0,0);
  if(!img||!img.img){$("imageEmpty").textContent="Загрузите плоское изображение";return}
  $("imageEmpty").textContent="";
  drawFlatImageTo(imageCtx,img.img,W,H);
}
function captureFlatImageFrameSyncBase(){
  var img=activeFlatImage();if(!img||!img.img){alert("Сначала загрузите плоское изображение");return null}
  var outSize=sourceOutputSize(),tmp=document.createElement("canvas");tmp.width=outSize.w;tmp.height=outSize.h;
  drawFlatImageTo(tmp.getContext("2d"),img.img,outSize.w,outSize.h);
  return{canvas:tmp,tw:outSize.w,th:outSize.h};
}
function captureActiveSourceFrameSyncBase(){
  return currentSourceType()==="image"?captureFlatImageFrameSyncBase():capturePanoFrameSyncBase();
}
function drawActiveSource(){
  if(currentSourceType()==="image")drawFlatImage();
  else drawPano();
}
function scheduleFlatHistoryCommit(){
  if(state.flatWheelCommitTimer)clearTimeout(state.flatWheelCommitTimer);
  state.flatWheelCommitTimer=setTimeout(function(){state.flatWheelCommitTimer=null;if(state.flatHistoryDirty){state.flatHistoryDirty=false;commitHistory()}},180);
}
function bindFlatImageViewer(){
  if($("fileFlat"))$("fileFlat").onchange=function(e){if(e.target.files)addFlatImageFiles(e.target.files);e.target.value=""};
  if($("sourceTypeSelect"))$("sourceTypeSelect").onchange=function(){setSourceType(this.value)};
  if($("imageSelect"))$("imageSelect").onchange=function(){setActiveFlatImage(this.value,{keepView:false})};
  if($("btnImageReset"))$("btnImageReset").onclick=function(){resetFlatImageView()};
  imageCanvas.addEventListener("pointerdown",function(e){
    if(currentSourceType()!=="image")return;
    if(e.button!==0)return;
    if(state.draw.on)return;
    if(e.ctrlKey){e.preventDefault();routeCapture("timeline-after");return}
    if(e.altKey){e.preventDefault();routeCapture("replace-selected");return}
    if(!activeFlatImage())return;
    state.draggingFlat=true;state.flatHistoryDirty=false;
    state.flatDragStartX=e.clientX;state.flatDragStartY=e.clientY;
    state.flatDragOrigX=currentFlatView().posX;state.flatDragOrigY=currentFlatView().posY;
    imageCanvas.classList.add("drag");
    try{imageCanvas.setPointerCapture(e.pointerId)}catch(err){}
  });
  imageCanvas.addEventListener("pointermove",function(e){
    if(!state.draggingFlat||currentSourceType()!=="image")return;
    var view=currentFlatView(),box=$("panoBox").getBoundingClientRect();
    var dx=(e.clientX-state.flatDragStartX)/Math.max(1,box.width),dy=(e.clientY-state.flatDragStartY)/Math.max(1,box.height);
    var nextX=clamp(state.flatDragOrigX-dx,0,1),nextY=clamp(state.flatDragOrigY-dy,0,1);
    if(Math.abs(nextX-view.posX)>1e-9||Math.abs(nextY-view.posY)>1e-9){view.posX=nextX;view.posY=nextY;state.flatHistoryDirty=true}
    drawFlatImage();updateHud();
  });
  function endFlatDrag(){
    state.draggingFlat=false;imageCanvas.classList.remove("drag");
    if(state.flatHistoryDirty){state.flatHistoryDirty=false;commitHistory()}
  }
  window.endFlatImageDrag=endFlatDrag;
  imageCanvas.addEventListener("pointerup",endFlatDrag);
  imageCanvas.addEventListener("pointercancel",endFlatDrag);
  imageCanvas.addEventListener("lostpointercapture",endFlatDrag);
  imageCanvas.addEventListener("wheel",function(e){
    if(currentSourceType()!=="image")return;
    if(!activeFlatImage())return;
    e.preventDefault();
    var view=currentFlatView();
    var factor=e.deltaY>0?0.94:1.06;
    var next=clamp((view.scale||1)*factor,0.25,12);
    if(Math.abs(next-(view.scale||1))<1e-9)return;
    view.scale=next;state.flatHistoryDirty=true;
    drawFlatImage();updateHud();scheduleFlatHistoryCommit();
  },{passive:false});
}

var PMS_ImageViewer={
  enabled:true,
  mount:function(){syncSourceViewerUI();syncFlatImageSelect();resizeFlatImageCanvas();},
  unmount:function(){},
  setSourceType:setSourceType,
  syncSourceViewerUI:syncSourceViewerUI,
  syncFlatImageSelect:syncFlatImageSelect,
  setActiveFlatImage:setActiveFlatImage,
  addFlatImageFiles:addFlatImageFiles,
  openAssetInFlatMode:openAssetInFlatMode,
  resetFlatImageView:resetFlatImageView,
  resizeFlatImageCanvas:resizeFlatImageCanvas,
  drawFlatImage:drawFlatImage,
  drawActiveSource:drawActiveSource,
  captureFlatImageFrameSyncBase:captureFlatImageFrameSyncBase,
  captureActiveSourceFrameSyncBase:captureActiveSourceFrameSyncBase,
  capture:function(){return captureFlatImageFrameSyncBase();}
};

bindFlatImageViewer();
syncSourceViewerUI();
if(window.PMS&&PMS.registerModule)PMS.registerModule("viewers.image",PMS_ImageViewer);
