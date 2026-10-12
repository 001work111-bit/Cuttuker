"use strict";

/* Stage 3: timeline rendering, selection, resize, cut/merge, playhead, template-block labels. */

function endAllTlPointers(){state.scrubTl=false;state.resize=null;state.dragBlock=null;state.audioDrag=null;state.audioResize=null}
function refreshTlGeometry(){
  var tf=timelineFrames(),ppf=pxPerFrame();
  var tl=$("tl");if(tl)tl.style.width=tlWidthPx()+"px";
  var voidEl=$("tlVoid"),c=contentLength();
  if(voidEl){
    if(c<tf){voidEl.style.display="";voidEl.style.left=frameToX(c)+"px";voidEl.style.width=Math.max(0,(tf-c)*ppf)+"px"}
    else voidEl.style.display="none";
  }
  var Lmain=layout(),Lov=layoutOverlay();
  var nodes=$("tlTrack")?$("tlTrack").children:[];
  for(var i=0;i<nodes.length;i++){
    var el=nodes[i];if(!el.classList||(!el.classList.contains("tlBlock")&&!el.classList.contains("tlAudioBlock")))continue;
    if(el.classList.contains("tlAudioBlock"))continue;
    var id=el.dataset.id,track=el.dataset.track||"main";
    var L=track==="overlay"?Lov:Lmain;
    var it=null;for(var j=0;j<L.length;j++)if(L[j].block.id===id){it=L[j];break}
    if(!it){el.style.display="none";continue}
    el.style.display="";el.style.left=frameToX(it.start)+"px";el.style.width=Math.max(4,frameToX(it.duration))+"px";
  }
  drawPlayhead();
}
function onResizeMove(clientX){
  var rs=state.resize;if(!rs)return;
  var block=rs.track==="overlay"?findOverlay(rs.id):findBlock(rs.id);if(!block)return;
  if(isTitleTimelineBlock(block,rs.track)){
    var delta=Math.round((clientX-rs.startX)/pxPerFrame());
    if(rs.side==="left"){
      var nextStart=snapFrameToMainBoundaries(rs.origStart+delta),right=rs.origStart+rs.origDur;
      nextStart=Math.max(0,Math.min(nextStart,right-1));
      block.start=nextStart;
      block.duration=Math.max(1,right-nextStart);
    }else{
      var nextRight=snapFrameToMainBoundaries(rs.origStart+rs.origDur+delta);
      block.duration=Math.max(1,nextRight-rs.origStart);
    }
  }else{
    var nl=Math.max(1,rs.orig+Math.round((clientX-rs.startX)/pxPerFrame()));
    if(Math.abs(nl-Math.round(nl/5)*5)<=1)nl=Math.max(1,Math.round(nl/5)*5);
    setBlockDuration(rs.id,nl,rs.track);
  }
  refreshTlGeometry();applyFrame();updateHud();
}
function reorderBlocks(fromIds,toIndex,track){
  var arr=track==="overlay"?project.overlayBlocks:project.blocks;
  var moving=[],rest=[],i,b,movingSet={};
  fromIds.forEach(function(id){movingSet[id]=true});
  for(i=0;i<arr.length;i++){b=arr[i];if(movingSet[b.id])moving.push(b);else rest.push(b)}
  if(!moving.length)return;
  toIndex=clamp(toIndex|0,0,rest.length);
  var out=rest.slice(0,toIndex).concat(moving,rest.slice(toIndex));
  if(track==="overlay")project.overlayBlocks=out;else project.blocks=out;
}
function timelineSelectionIds(track){return track==="overlay"?state.selectedOverlayIds:state.selectedBlockIds}
function clearOtherTrackSelection(track){if(track==="overlay")state.selectedBlockIds=[];else state.selectedOverlayIds=[]}
function setTrackSelection(track,ids){if(track==="overlay")state.selectedOverlayIds=ids.slice();else state.selectedBlockIds=ids.slice();clearOtherTrackSelection(track)}
function setTrackAnchor(track,id){if(track==="overlay")state.overlayAnchorId=id||null;else state.blockAnchorId=id||null}
function getTrackAnchor(track){return track==="overlay"?state.overlayAnchorId:state.blockAnchorId}
function updateTimelineBlockSelection(track,id,orderedIds,e){
  if(state.blockSelectionLocked&&((track==="overlay"&&state.selectedBlockIds.length)||(track!=="overlay"&&state.selectedOverlayIds.length)))return;
  var current=timelineSelectionIds(track).slice();
  clearOtherTrackSelection(track);
  if(e.shiftKey){
    var anchor=getTrackAnchor(track)||current[0]||id;
    setTrackSelection(track,rangeSelectIds(orderedIds,anchor,id));
    if(!getTrackAnchor(track))setTrackAnchor(track,anchor);
  }else if(e.metaKey||e.ctrlKey||state.blockSelectionLocked){
    var ix=current.indexOf(id);
    if(ix<0)current.push(id);
    setTrackSelection(track,current);
    setTrackAnchor(track,id);
  }else{
    setTrackSelection(track,[id]);
    setTrackAnchor(track,id);
  }
}
function mainTrackBoundaries(){
  var out=[],L=layout();
  L.forEach(function(it){out.push(it.start);out.push(it.end)});
  out.sort(function(a,b){return a-b});
  return out.filter(function(v,i){return i===0||v!==out[i-1]});
}
function snapFrameToMainBoundaries(frame){
  frame=Math.max(0,Math.round(frame||0));
  var bounds=mainTrackBoundaries(),th=Math.max(2,Math.round(10/Math.max(2,pxPerFrame()))),best=frame,bestD=1e9;
  bounds.forEach(function(x){var d=Math.abs(x-frame);if(d<bestD){bestD=d;best=x}});
  return bestD<=th?best:frame;
}
function isTitleTimelineBlock(block,track){return track==="overlay"&&!!(block&&block.titleInstance)}
function tlHoverNode(){
  var el=$("tlHoverPreview");
  if(el)return el;
  el=document.createElement("div");el.id="tlHoverPreview";el.className="tlHoverPreview";document.body.appendChild(el);
  return el;
}
function hideTimelineHover(){
  if(state.tlHoverTimer){clearTimeout(state.tlHoverTimer);state.tlHoverTimer=null}
  state.tlHover=null;
  var el=$("tlHoverPreview");if(el){el.classList.remove("on");el.innerHTML=""}
}
function fillTimelineHover(el,block,track){
  if(!el||!block)return;
  var head=document.createElement("div");head.className="tlHoverHead";
  head.textContent=(track==="overlay"?"Overlay":"Main")+" · "+(blockIsTemplate(block)?templateBlockName(block):(findAsset(block.assetId)?findAsset(block.assetId).name:"(empty)"));
  el.appendChild(head);
  var body=document.createElement("div");body.className="tlHoverBody";
  if(blockIsTemplate(block)){
    var design=templateBlockDesign(block),frame=document.createElement("div"),stage=document.createElement("div");
    frame.className="tlHoverTplFrame";stage.className="tlHoverTplStage";
    stage.style.width=design.w+"px";stage.style.height=design.h+"px";
    stage.innerHTML=String(block.templateHtml||"");
    if(typeof cleanTemplateGalleryDom==="function")cleanTemplateGalleryDom(stage);
    if(typeof hardenSlideRoot==="function")hardenSlideRoot(stage.querySelector('.sv-section')||stage.firstElementChild,design.w,design.h);
    if(typeof applyTemplateBlockView==="function")applyTemplateBlockView(stage,block);
    var scale=Math.min(210/design.w,120/design.h);
    frame.style.height=Math.max(60,Math.round(design.h*scale))+"px";
    stage.style.transform='scale('+scale+')';
    frame.appendChild(stage);body.appendChild(frame);
  }else{
    var asset=findAsset(block.assetId),img=document.createElement("img");
    img.className="tlHoverImg";
    if(asset&&asset.url)img.src=asset.url;
    body.appendChild(img);
  }
  el.appendChild(body);
}
function showTimelineHover(block,track,anchorEl){
  if(!block||!anchorEl||!anchorEl.isConnected)return;
  var el=tlHoverNode();if(!el)return;
  el.innerHTML="";
  fillTimelineHover(el,block,track);
  el.classList.add("on");
  var rect=anchorEl.getBoundingClientRect();
  var left=Math.round(rect.left+rect.width/2);
  var top=Math.round(rect.top-10);
  el.style.left=left+"px";
  el.style.top=top+"px";
  var pad=10,b=el.getBoundingClientRect();
  if(b.left<pad)el.style.left=Math.round(left+(pad-b.left))+"px";
  else if(b.right>window.innerWidth-pad)el.style.left=Math.round(left-(b.right-(window.innerWidth-pad)))+"px";
  if(b.top<pad)el.style.top=Math.round(top+(pad-b.top)) + "px";
  state.tlHover={id:block.id,track:track};
}
function scheduleTimelineHover(block,track,anchorEl){
  hideTimelineHover();
  state.tlHoverTimer=setTimeout(function(){state.tlHoverTimer=null;showTimelineHover(block,track,anchorEl)},450);
}

function ensureG(){state.G=clamp(state.G,0,Math.max(0,timelineFrames()-1e-9))}
function pxPerFrame(){return Math.max(2,+state.tlZoom||8)}
function tlWidthPx(){return Math.max(200,timelineFrames()*pxPerFrame())}
function frameToX(f){return f*pxPerFrame()}
function xToFrame(x){var sc=$("tlScroll"),rect=sc.getBoundingClientRect();return clamp((x-rect.left+sc.scrollLeft)/pxPerFrame(),0,timelineFrames()-1e-9)}
function setTlZoom(next,anchorClientX){
  next=clamp(next|0,2,40);if(next===state.tlZoom)return;
  var sc=$("tlScroll");
  if(anchorClientX!=null){
    var keepFrame=xToFrame(anchorClientX);state.tlZoom=next;
    var rect=sc.getBoundingClientRect();
    sc.scrollLeft=Math.max(0,frameToX(keepFrame)-(anchorClientX-rect.left));
  }else{
    var phScreen=frameToX(state.G)-sc.scrollLeft;state.tlZoom=next;
    sc.scrollLeft=Math.max(0,frameToX(state.G)-phScreen);
  }
  $("tlZoom").value=String(state.tlZoom);drawTimeline();
}
function drawPlayhead(){var el=$("tlPlayhead");if(el)el.style.left=frameToX(state.G)+"px"}
function seekFromClientX(clientX){state.G=xToFrame(clientX);applyFrame();updateHud();drawPlayhead();seekAudio()}

function audioBlockAtG(G){var a=project.audioBlocks||[];for(var i=0;i<a.length;i++)if(G>=a[i].start&&G<a[i].start+a[i].duration)return a[i];return null}
function selectedAudioBlock(){var a=project.audioBlocks||[];return a.length?a[0]:null}
function normalizedAnimSpeed(v){v=+v||0;if(v<=3)return v<=0.2?0:Math.min(100,((v-0.2)/0.8)*80);return clamp(v,0,100)}
function animSpeedValue(v){return normalizedAnimSpeed(v)}

function drawTimeline(){
  var tl=$("tl"),track=$("tlTrack"),ruler=$("tlRuler");if(!tl||!track)return;
  hideTimelineHover();
  tl.style.width=tlWidthPx()+"px";track.innerHTML="";ruler.innerHTML="";
  tl.querySelectorAll(".tlIn,.tlOut").forEach(function(n){n.remove()});
  var tf=timelineFrames(),c=contentLength(),ppf=pxPerFrame(),voidEl=$("tlVoid");
  if(c<tf){voidEl.style.display="";voidEl.style.left=frameToX(c)+"px";voidEl.style.width=Math.max(0,(tf-c)*ppf)+"px";voidEl.style.top="28px";voidEl.style.height="40px"}
  else voidEl.style.display="none";
  var fps=Math.max(1,project.fps|0),totalSec=tf/fps,stepSec=1;
  if(ppf<4)stepSec=5;if(ppf<2.5||totalSec>90)stepSec=10;if(totalSec>300)stepSec=30;
  if(ppf>=12){
    for(var fr=0;fr<=tf;fr+=Math.max(1,Math.round(fps/2))){
      var tick=document.createElement("div");tick.className="tlTick";tick.style.left=frameToX(fr)+"px";
      tick.textContent=fr%fps===0?framesToLabel(fr):String(fr%fps)+"f";tick.style.color=fr%fps===0?"#aaa":"#555";ruler.appendChild(tick);
    }
  }else{
    for(var s=0;s<=totalSec+0.001;s+=stepSec){
      var f=Math.round(s*fps),t2=document.createElement("div");t2.className="tlTick";t2.style.left=frameToX(f)+"px";t2.textContent=framesToLabel(f);ruler.appendChild(t2);
    }
  }
  function paintTrack(L,isOv){
    L.forEach(function(it){
      var b=it.block,d=document.createElement("div");
      var sel=isOv?(state.selectedOverlayIds.indexOf(b.id)>=0):(state.selectedBlockIds.indexOf(b.id)>=0);
      d.className="tlBlock"+(isOv?" overlay":"")+(sel?" sel":"")+(b.fixed?" fixed":"")+(b.hidden?" off":"")+(blockIsTemplate(b)?" template":"")+(b.titleInstance?" title":"");
      d.style.left=frameToX(it.start)+"px";d.style.width=Math.max(4,frameToX(it.duration))+"px";
      if(!b.fixed&&!isOv&&!blockIsTemplate(b))d.style.background=BLOCK_COLORS(it.index);
      d.dataset.id=b.id;d.dataset.track=isOv?"overlay":"main";
      var asset=findAsset(b.assetId);
      var lab=document.createElement("div");lab.className="lab";
      var nm=blockIsTemplate(b)?templateBlockName(b):(asset?asset.name:"(empty)");
      if(nm.length>22)nm=nm.slice(0,20)+"…";
      var prefix=b.titleInstance?"TT ":(isOv?"OV ":"");
      lab.textContent=prefix+"#"+(it.index+1)+" "+nm+(blockIsTemplate(b)?" ▧":"")+(b.fixed?" 🔒":"")+(b.hidden?" ⛔":"");d.appendChild(lab);
      if(b.titleInstance){var rzL=document.createElement("div");rzL.className="rzL";d.appendChild(rzL)}
      var rzR=document.createElement("div");rzR.className="rzR";d.appendChild(rzR);
      d.addEventListener("pointerenter",function(){scheduleTimelineHover(b,isOv?"overlay":"main",d)});
      d.addEventListener("pointerleave",hideTimelineHover);
      d.addEventListener("pointerdown",function(e){
        if(e.target.classList.contains("rzR"))return;
        hideTimelineHover();
        e.stopPropagation();setPlaying(false);endAllTlPointers();
        var trackName=isOv?"overlay":"main";
        var idList=(isOv?project.overlayBlocks:project.blocks).map(function(x){return x.id});
        updateTimelineBlockSelection(trackName,b.id,idList,e);
        var activeIds=timelineSelectionIds(trackName);
        if(activeIds.indexOf(b.id)>=0&&blockIsTemplate(b))setTemplateEditState(b,trackName,state.templateEdit.blockId===b.id?state.templateEdit.selectedSlot:null,null,{keepSelection:true});
        else if(activeIds.indexOf(b.id)<0||!blockIsTemplate(b))clearTemplateEditState();
        state.G=it.start;
        if(!e.shiftKey&&!e.metaKey&&!e.ctrlKey){
          var dragInfo={ids:activeIds.slice(),startX:e.clientX,moved:false,track:trackName};
          if(isTitleTimelineBlock(b,trackName)){
            dragInfo.absolute=true;
            dragInfo.origStarts={};
            activeIds.forEach(function(id){var x=findOverlay(id);if(x&&x.titleInstance)dragInfo.origStarts[id]=Math.max(0,x.start|0)});
          }
          state.dragBlock=dragInfo;
          try{$("tlScroll").setPointerCapture(e.pointerId)}catch(err){}
        }else state.dragBlock=null;
        drawTimeline();applyFrame();updateHud();seekAudio();
        if(state.inspOpen){setInspTab("block");renderInspector()}
      });
      var rzL=d.querySelector('.rzL');
      if(rzL)rzL.addEventListener("pointerdown",function(e){
        e.preventDefault();e.stopPropagation();hideTimelineHover();setPlaying(false);endAllTlPointers();
        var trackName=isOv?"overlay":"main";
        setTrackSelection(trackName,[b.id]);setTrackAnchor(trackName,b.id);
        if(blockIsTemplate(b))setTemplateEditState(b,trackName,state.templateEdit.blockId===b.id?state.templateEdit.selectedSlot:null,null,{keepSelection:true});
        else clearTemplateEditState();
        state.resize={id:b.id,startX:e.clientX,orig:b.duration|0,origStart:it.start|0,origDur:it.duration|0,side:"left",track:trackName};
        try{rzL.setPointerCapture(e.pointerId)}catch(err){}
        if(state.inspOpen)renderInspector();
      });
      rzR.addEventListener("pointerdown",function(e){
        e.preventDefault();e.stopPropagation();hideTimelineHover();setPlaying(false);endAllTlPointers();
        var trackName=isOv?"overlay":"main";
        setTrackSelection(trackName,[b.id]);setTrackAnchor(trackName,b.id);
        if(blockIsTemplate(b))setTemplateEditState(b,trackName,state.templateEdit.blockId===b.id?state.templateEdit.selectedSlot:null,null,{keepSelection:true});
        else clearTemplateEditState();
        state.resize={id:b.id,startX:e.clientX,orig:b.duration|0,origStart:it.start|0,origDur:it.duration|0,side:"right",track:trackName};
        try{rzR.setPointerCapture(e.pointerId)}catch(err){}
        if(state.inspOpen)renderInspector();
      });
      d.addEventListener("dragover",function(e){hideTimelineHover();e.preventDefault();e.stopPropagation();d.style.outline="1px solid #fff"});
      d.addEventListener("dragleave",function(){d.style.outline=""});
      d.addEventListener("drop",function(e){
        e.preventDefault();e.stopPropagation();d.style.outline="";
        var tplIds=typeof getDragTemplateIds==='function'?getDragTemplateIds(e):[];
        var ids=getDragAssetIds(e);
        if(!tplIds.length&&!ids.length)return;
        pushHistory();
        if(tplIds.length){
          replaceBlockTemplate(b.id,tplIds[0]);
        }else if(blockIsTemplate(b)){
          ensureTemplateBlockState(b);
          var slot=(state.templateEdit.blockId===b.id&&state.templateEdit.selectedSlot)||templateSlotNames(b)[0]||null;
          if(slot)applyTemplateSlotAsset(b,slot,ids[0]);
        }else replaceBlockAsset(b.id,ids[0]);
        endAllTlPointers();renderUI(true);
      });
      track.appendChild(d);
    });
  }
  paintTrack(layout(),false);
  paintTrack(layoutOverlay(),true);
  (project.audioBlocks||[]).forEach(function(ab){var d=document.createElement("div"),sel=selectedAudioBlock()&&selectedAudioBlock().id===ab.id;d.className="tlAudioBlock"+(sel?" sel":"");d.dataset.id=ab.id;d.style.left=frameToX(ab.start)+"px";d.style.width=Math.max(4,frameToX(ab.duration))+"px";var lab=document.createElement("div");lab.className="lab";lab.textContent="♪ "+(project.audio.name||"Audio");d.appendChild(lab);var rz=document.createElement("div");rz.className="rzR";d.appendChild(rz);audioBlockPointer(d,ab,false);audioBlockPointer(rz,ab,true);track.appendChild(d)});
  if(project.inPoint!=null){var inn=document.createElement("div");inn.className="tlIn";inn.style.left=frameToX(project.inPoint)+"px";inn.innerHTML="<b>IN</b>";tl.appendChild(inn)}
  if(project.outPoint!=null){var out=document.createElement("div");out.className="tlOut";out.style.left=frameToX(project.outPoint)+"px";out.innerHTML="<b>OUT</b>";tl.appendChild(out)}
  drawPlayhead();
}

function cutSelectedBlock(){
  var eb=editingBlock();
  if(eb){
    var L=eb.track==="overlay"?layoutOverlay():layout(),it=null;
    for(var i=0;i<L.length;i++)if(L[i].block.id===eb.block.id){it=L[i];break}
    if(!it||state.G<=it.start+0.5||state.G>=it.end-0.5){alert("Поставь playhead внутри блока");return}
    pushHistory();
    var left=it.block,right=deepClone(it.block);
    left.duration=Math.max(1,Math.floor(state.G-it.start));right.id=uid("b");right.duration=Math.max(1,it.end-state.G);
    var arr=eb.track==="overlay"?project.overlayBlocks:project.blocks,ix=it.index;
    arr.splice(ix+1,0,right);
    state.selectedBlockIds=eb.track==="overlay"?[]:[left.id];state.selectedOverlayIds=eb.track==="overlay"?[left.id]:[];
    renderUI(true);return;
  }
  var ab=audioBlockAtG(state.G);
  if(ab&&state.G>ab.start+0.5&&state.G<ab.start+ab.duration-0.5){pushHistory();var cut=Math.floor(state.G),right=deepClone(ab);right.id=uid("au");right.sourceStart+=(cut-ab.start);right.duration-=cut-ab.start;ab.duration=cut-ab.start;(project.audioBlocks).splice(project.audioBlocks.indexOf(ab)+1,0,right);drawTimeline();return}
  alert("Поставь playhead внутри блока");
}
function mergeSelectedBlocks(){
  if(state.selectedBlockIds.length===2){var a=project.blocks.filter(function(b){return state.selectedBlockIds.indexOf(b.id)>=0}),L=layout(),x=null,y=null;for(var i=0;i<L.length;i++){if(L[i].block.id===a[0].id)x=L[i];if(L[i].block.id===a[1].id)y=L[i]}if(x&&y&&Math.abs(x.index-y.index)===1){pushHistory();var first=x.index<y.index?x.block:y.block,second=x.index<y.index?y.block:x.block;first.duration+=(second.duration|0);project.blocks=project.blocks.filter(function(b){return b.id!==second.id});state.selectedBlockIds=[first.id];renderUI(true);return}}
  if(state.selectedOverlayIds.length===2){var a=project.overlayBlocks.filter(function(b){return state.selectedOverlayIds.indexOf(b.id)>=0}),L=layoutOverlay(),x=null,y=null;for(var i=0;i<L.length;i++){if(L[i].block.id===a[0].id)x=L[i];if(L[i].block.id===a[1].id)y=L[i]}if(x&&y&&Math.abs(x.index-y.index)===1){pushHistory();var first=x.index<y.index?x.block:y.block,second=x.index<y.index?y.block:x.block;first.duration+=(second.duration|0);project.overlayBlocks=project.overlayBlocks.filter(function(b){return b.id!==second.id});state.selectedOverlayIds=[first.id];renderUI(true);return}}
  var aud=project.audioBlocks||[];if(aud.length===2&&aud.every(function(x){return x.start+x.duration===aud[0].start+aud[0].duration||x.start===aud[0].start})){pushHistory();aud.sort(function(a,b){return a.start-b.start});if(aud[0].start+aud[0].duration===aud[1].start){aud[0].duration+=aud[1].duration;aud.splice(1,1);drawTimeline();return}}
  alert("Выдели два соседних блока");
}
function audioBlockPointer(d,b,resize){
  d.addEventListener("pointerdown",function(e){e.preventDefault();e.stopPropagation();setPlaying(false);endAllTlPointers();
    if(resize){state.audioResize={id:b.id,startX:e.clientX,orig:b.duration|0};}
    else{state.audioDrag={id:b.id,startX:e.clientX,orig:b.start|0};}
    try{$("tlScroll").setPointerCapture(e.pointerId)}catch(err){}
  });
}
function onAudioPointerMove(clientX){
  if(state.audioResize){var b=(project.audioBlocks||[]).find(function(x){return x.id===state.audioResize.id});if(b){b.duration=Math.max(1,state.audioResize.orig+Math.round((clientX-state.audioResize.startX)/pxPerFrame()));drawTimeline()};return}
  if(state.audioDrag){var b=(project.audioBlocks||[]).find(function(x){return x.id===state.audioDrag.id});if(b){b.start=Math.max(0,state.audioDrag.orig+Math.round((clientX-state.audioDrag.startX)/pxPerFrame()));ensureContentFitsTL();drawTimeline()};return}
}
if($("tlScroll")&&!$("tlScroll").dataset.hoverBound){$("tlScroll").dataset.hoverBound="1";$("tlScroll").addEventListener("scroll",hideTimelineHover);$("tlScroll").addEventListener("pointerleave",hideTimelineHover)}

if(window.PMS&&PMS.registerModule)PMS.registerModule("timeline",{ensureG:ensureG,pxPerFrame:pxPerFrame,tlWidthPx:tlWidthPx,frameToX:frameToX,xToFrame:xToFrame,setTlZoom:setTlZoom,drawPlayhead:drawPlayhead,seekFromClientX:seekFromClientX,drawTimeline:drawTimeline,endAllTlPointers:endAllTlPointers,refreshTlGeometry:refreshTlGeometry,onResizeMove:onResizeMove,reorderBlocks:reorderBlocks,updateTimelineBlockSelection:updateTimelineBlockSelection,mainTrackBoundaries:mainTrackBoundaries,snapFrameToMainBoundaries:snapFrameToMainBoundaries,isTitleTimelineBlock:isTitleTimelineBlock,hideTimelineHover:hideTimelineHover,scheduleTimelineHover:scheduleTimelineHover,audioBlockAtG:audioBlockAtG,selectedAudioBlock:selectedAudioBlock,cutSelectedBlock:cutSelectedBlock,mergeSelectedBlocks:mergeSelectedBlocks,normalizedAnimSpeed:normalizedAnimSpeed,animSpeedValue:animSpeedValue});
