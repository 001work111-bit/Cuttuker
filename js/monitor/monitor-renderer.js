"use strict";

/* Stage 3: monitor renderer + live template DOM layers + audio sync. */

function sampleFrame(G,track){
  var Litem=blockAtG(G,track);if(!Litem)return null;
  var b=Litem.block,local=clamp(G-Litem.start,0,Math.max(0,Litem.duration-1e-9));
  var uu=Litem.duration<=1?0:local/(Litem.duration-1);
  return{block:b,asset:findAsset(b.assetId),u:uu,layout:Litem,track:track||"main"};
}
function sampleFramesAt(G,track){
  return activeItemsAtG(G,track).map(function(Litem){
    var b=Litem.block,local=clamp(G-Litem.start,0,Math.max(0,Litem.duration-1e-9));
    var uu=Litem.duration<=1?0:local/(Litem.duration-1);
    return{block:b,asset:findAsset(b.assetId),u:uu,layout:Litem,track:track||"main"};
  });
}
function applyFrame(){ensureG();drawMonitor();drawPlayhead()}
function setPlaying(on){
  state.playing=!!on;state.lastTs=0;
  var b=$("btnPlay");b.textContent=state.playing?"Pause":"Play";b.classList.toggle("active",state.playing);
  if(state.playing)playAudio();else pauseAudio();
}
function hasIOLoop(){return project.inPoint!=null&&project.outPoint!=null&&project.outPoint>project.inPoint}
function togglePlay(){
  if(state.playing){setPlaying(false);return}
  var tf=timelineFrames();if(tf<=0)return;
  if(hasIOLoop()){if(state.G<project.inPoint||state.G>=project.outPoint)state.G=project.inPoint}
  else if(state.G>=tf-1e-9)state.G=0;
  setPlaying(true);seekAudio();
}
function stepG(dir){setPlaying(false);state.G=clamp(state.G+dir,0,Math.max(0,timelineFrames()-1e-9));applyFrame();updateHud();drawPlayhead();seekAudio()}

function fitDraw(ctx,img,W,H,fit,scale,posX,posY,anim,animSpeed,uLocal,durationFrames,fps){
  if(!img)return;fit=fit||"cover";scale=scale!=null?scale:1;posX=posX!=null?posX:0.5;posY=posY!=null?posY:0.5;anim=anim||"none";var iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;if(!iw||!ih)return;var s0=fit==="stretch"?1:fit==="contain"?Math.min(W/iw,H/ih):Math.max(W/iw,H/ih),sc=s0*scale,ax=posX,ay=posY,asc=sc,speed=normalizedAnimSpeed(animSpeed),sec=(clamp(uLocal||0,0,1)*Math.max(1,durationFrames||1))/Math.max(1,fps||30),rate=speed/100,move=Math.min(1,rate*sec*0.75),zoom=Math.min(0.15,rate*sec*0.15);if(anim==="zoomIn")asc=sc*(1+zoom);else if(anim==="zoomOut")asc=sc*(1.15-zoom);else if(anim==="panLR")ax=0.2+move;else if(anim==="panRL")ax=0.8-move;else if(anim==="panTB")ay=0.2+move;else if(anim==="panBT")ay=0.8-move;var dw=iw*asc,dh=ih*asc,dx=(W-dw)*ax,dy=(H-dh)*ay;ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();if(fit==="stretch"&&anim==="none"&&scale===1)ctx.drawImage(img,0,0,W,H);else ctx.drawImage(img,dx,dy,dw,dh);ctx.restore();
}
function drawMonitor(){
  syncAspectBoxes();
  var box=$("monBox");if(!box||box.clientWidth<1)return;
  var dpr=Math.min(devicePixelRatio||1,2);
  var cssW=Math.max(1,box.clientWidth),cssH=Math.max(1,box.clientHeight);
  monCanvas.width=Math.floor(cssW*dpr);monCanvas.height=Math.floor(cssH*dpr);
  monCtx.setTransform(dpr,0,0,dpr,0,0);monCtx.fillStyle="#0a0a0e";monCtx.fillRect(0,0,cssW,cssH);
  var main=sampleFrame(state.G,"main");
  var overlaySamples=sampleFramesAt(state.G,"overlay");
  if(!project.blocks.length&&!project.overlayBlocks.length){
    clearTemplateMonitorLayer("main");clearTemplateMonitorLayer("overlay");
    $("monEmpty").style.display="";$("monEmpty").textContent="Таймлайн пуст";return;
  }
  $("monEmpty").style.display="none";
  if(main&&blockIsAsset(main.block)&&main.asset&&main.asset.img)fitDraw(monCtx,main.asset.img,cssW,cssH,main.block.fit,main.block.scale,main.block.posX,main.block.posY,main.block.anim,main.block.animSpeed,main.u,main.layout.duration,project.fps);
  else if(!main||state.G>=contentLength()||blockIsTemplate(main&&main.block)){monCtx.fillStyle="#111";monCtx.fillRect(0,0,cssW,cssH)}
  overlaySamples.forEach(function(ov){if(ov&&blockIsAsset(ov.block)&&ov.asset&&ov.asset.img)fitDraw(monCtx,ov.asset.img,cssW,cssH,ov.block.fit||"contain",ov.block.scale,ov.block.posX,ov.block.posY,ov.block.anim,ov.block.animSpeed,ov.u,ov.layout.duration,project.fps)});
  renderMonitorTemplateLayers(main,overlaySamples);
  var eb=editingBlock();
  monCanvas.classList.toggle("edit",!!(eb&&blockIsAsset(eb.block)));
}

var monCanvas=$("monCanvas"),monCtx=monCanvas.getContext("2d");
var audioEl=$("audioEl");
function syncAudioUI(){
  $("audioName").textContent=project.audio.name||"нет";
  $("btnAudioMute").classList.toggle("active",!!project.audio.muted);
  $("btnAudioMute").textContent=project.audio.muted?"Unmute":"Mute";
  audioEl.muted=!!project.audio.muted;
}
function loadAudioFile(file){
  if(project.audio.url)try{URL.revokeObjectURL(project.audio.url)}catch(e){}
  project.audio.url=URL.createObjectURL(file);project.audio.name=file.name;project.audioBlocks=[{id:uid("au"),name:file.name,start:0,duration:Math.max(1,timelineFrames()),sourceStart:0}];audioEl.src=project.audio.url;audioEl.onloadedmetadata=function(){var ab=selectedAudioBlock();if(ab){ab.duration=Math.max(1,Math.round(audioEl.duration*project.fps));ensureContentFitsTL();drawTimeline()}};syncAudioUI();seekAudio();
}
function clearAudio(){
  setPlaying(false);audioEl.pause();
  if(project.audio.url)try{URL.revokeObjectURL(project.audio.url)}catch(e){}
  project.audio={name:null,url:null,muted:false};project.audioBlocks=[];audioEl.removeAttribute("src");audioEl.load();syncAudioUI();
}
function seekAudio(){if(!project.audio.url)return;try{var ab=audioBlockAtG(state.G);if(!ab){audioEl.pause();return}var t=ab.sourceStart+(state.G-ab.start)/Math.max(1,project.fps);if(Math.abs((audioEl.currentTime||0)-t)>0.05)audioEl.currentTime=Math.max(0,t)}catch(e){}}
function playAudio(){if(!project.audio.url||project.audio.muted)return;seekAudio();if(!audioBlockAtG(state.G))return;var p=audioEl.play();if(p&&p.catch)p.catch(function(){})}
function pauseAudio(){try{audioEl.pause()}catch(e){}}

if(window.PMS&&PMS.registerModule)PMS.registerModule("monitor",{sampleFrame:sampleFrame,sampleFramesAt:sampleFramesAt,applyFrame:applyFrame,setPlaying:setPlaying,hasIOLoop:hasIOLoop,togglePlay:togglePlay,stepG:stepG,fitDraw:fitDraw,drawMonitor:drawMonitor,syncAudioUI:syncAudioUI,loadAudioFile:loadAudioFile,clearAudio:clearAudio,seekAudio:seekAudio,playAudio:playAudio,pauseAudio:pauseAudio});
