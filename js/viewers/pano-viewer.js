"use strict";

/* Stage 2 cleanup-pass: pano viewer, draw layer, capture source, imports. */

/* WEBGL */
var panoCanvas=$("panoCanvas");
var gl=panoCanvas.getContext("webgl",{alpha:false,antialias:true,preserveDrawingBuffer:true})||panoCanvas.getContext("experimental-webgl",{alpha:false,antialias:true,preserveDrawingBuffer:true});
var panoReady=false,panoTex=null,u={};
function initPanoGL(){
  if(!gl){$("panoEmpty").textContent="WebGL не поддерживается";return}
  function compile(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
  var vs=compile(gl.VERTEX_SHADER,"attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}");
  var fs=compile(gl.FRAGMENT_SHADER,"precision mediump float;uniform vec2 uRes;uniform float uYaw,uPitch,uFov,uHas;uniform sampler2D uTex;const float PI=3.14159265;mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}void main(){if(uHas<.5){gl_FragColor=vec4(.05,.05,.07,1.);return;}vec2 uv=(gl_FragCoord.xy/uRes)*2.-1.;uv.x*=uRes.x/uRes.y;float f=1./tan(uFov*.5);vec3 rd=normalize(vec3(uv.x,uv.y,-f));rd=rotY(uYaw)*rotX(uPitch)*rd;float lon=atan(rd.z,rd.x);float lat=asin(clamp(rd.y,-1.,1.));gl_FragColor=texture2D(uTex,vec2(lon/(2.*PI)+.5,lat/PI+.5));}");
  var prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  var aLoc=gl.getAttribLocation(prog,"a");gl.enableVertexAttribArray(aLoc);gl.vertexAttribPointer(aLoc,2,gl.FLOAT,false,0,0);
  u.res=gl.getUniformLocation(prog,"uRes");u.yaw=gl.getUniformLocation(prog,"uYaw");u.pitch=gl.getUniformLocation(prog,"uPitch");u.fov=gl.getUniformLocation(prog,"uFov");u.has=gl.getUniformLocation(prog,"uHas");u.tex=gl.getUniformLocation(prog,"uTex");
  panoTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,panoTex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([12,12,16,255]));
  gl.uniform1i(u.tex,0);gl.uniform1f(u.has,0);panoReady=true;
}
function setPanoImage(img){if(!panoReady||!img)return;gl.bindTexture(gl.TEXTURE_2D,panoTex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.uniform1f(u.has,1);setCurrentSourceType("pano");$("panoEmpty").style.display="none";if(typeof syncSourceViewerUI==="function")syncSourceViewerUI()}
function clearPanoImage(){if(!panoReady)return;gl.uniform1f(u.has,0);$("panoEmpty").style.display=""}
function resizePanoGL(){if(!panoReady)return;var box=$("panoBox");if(!box||box.clientWidth<1)return;var dpr=Math.min(devicePixelRatio||1,2);var w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);panoCanvas.width=Math.floor(w*dpr);panoCanvas.height=Math.floor(h*dpr);gl.viewport(0,0,panoCanvas.width,panoCanvas.height);gl.uniform2f(u.res,panoCanvas.width,panoCanvas.height);resizeDrawCanvas();if(typeof resizeFlatImageCanvas==="function")resizeFlatImageCanvas();layoutTitlesViewport()}
function drawPano(){if(currentSourceType()==="image")return;if(!panoReady||$("panoWrap").classList.contains("hide"))return;var pano=sourcePano();gl.uniform1f(u.yaw,pano.yaw);gl.uniform1f(u.pitch,pano.pitch);gl.uniform1f(u.fov,pano.fov);gl.drawArrays(gl.TRIANGLES,0,6)}

/* DRAW */
var drawCanvas=$("drawCanvas"),drawCtx=drawCanvas.getContext("2d");
function resizeDrawCanvas(){var box=$("panoBox");if(!box)return;var dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight),prev=null;if(drawCanvas.width>1){prev=document.createElement("canvas");prev.width=drawCanvas.width;prev.height=drawCanvas.height;prev.getContext("2d").drawImage(drawCanvas,0,0)}drawCanvas.width=Math.floor(w*dpr);drawCanvas.height=Math.floor(h*dpr);drawCtx.setTransform(dpr,0,0,dpr,0,0);if(prev)drawCtx.drawImage(prev,0,0,w,h);syncDrawBg()}
function syncDrawBg(){var bg=$("drawBg");bg.style.opacity=String(state.draw.bgAlpha);bg.style.display=state.draw.on?"block":"none"}
function setDrawMode(on){state.draw.on=!!on;$("drawLayer").classList.toggle("on",state.draw.on);$("drawPopup").classList.toggle("on",state.draw.on);$("btnDraw").classList.toggle("active",state.draw.on);if(state.draw.on){ensurePanoVisible();resizeDrawCanvas();$("drawBgAlpha").value=String(Math.round(state.draw.bgAlpha*100));$("drawBgAlphaV").textContent=Math.round(state.draw.bgAlpha*100)+"%";$("drawTool").value=state.draw.tool;$("drawSize").value=String(state.draw.size);$("drawSizeV").textContent=String(state.draw.size);$("drawColor").value=state.draw.color}syncDrawBg()}
function clearDraw(){pushDrawUndo();pushHistory();drawCtx.save();drawCtx.setTransform(1,0,0,1,0,0);drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);drawCtx.restore();resizeDrawCanvas()}
function drawPointerPos(e){var r=drawCanvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function strokeDraw(from,to){drawCtx.lineCap="round";drawCtx.lineJoin="round";drawCtx.lineWidth=state.draw.size;if(state.draw.tool==="eraser"){drawCtx.globalCompositeOperation="destination-out";drawCtx.strokeStyle="#000"}else{drawCtx.globalCompositeOperation="source-over";drawCtx.strokeStyle=state.draw.color}drawCtx.beginPath();drawCtx.moveTo(from.x,from.y);drawCtx.lineTo(to.x,to.y);drawCtx.stroke();drawCtx.globalCompositeOperation="source-over"}
function hasDrawInk(){if(!drawCanvas.width)return false;try{var d=drawCtx.getImageData(0,0,Math.min(drawCanvas.width,32),Math.min(drawCanvas.height,32)).data;for(var i=3;i<d.length;i+=4)if(d[i]>0)return true}catch(e){}return false}

function loadImageFile(file){
  return new Promise(function(res,rej){
    var url=URL.createObjectURL(file),img=new Image();
    img.onload=function(){res({url:url,img:img,w:img.naturalWidth,h:img.naturalHeight,name:file.name})};
    img.onerror=function(){URL.revokeObjectURL(url);rej()};img.src=url;
  });
}
function addPanoFiles(fileList){
  var files=[].slice.call(fileList||[]).filter(function(f){return /^image\//.test(f.type)});if(!files.length)return;
  var chain=Promise.resolve();
  files.forEach(function(file){
    chain=chain.then(function(){return loadImageFile(file)}).then(function(o){
      var p={id:uid("p"),name:o.name,url:o.url,img:o.img};project.panoramas.push(p);setActivePanoId(p.id);setPanoImage(o.img);
    });
  });
  chain.then(function(){syncPanoSelect();setCurrentSourceType("pano");if(typeof syncSourceViewerUI==="function")syncSourceViewerUI();ensurePanoVisible();if(state.inspOpen)renderInspector();applyMode()});
}
function addImageFiles(fileList){
  var files=[].slice.call(fileList||[]).filter(function(f){return /^image\//.test(f.type)});if(!files.length)return;
  pushHistory();
  var chain=Promise.resolve();
  files.forEach(function(file){
    chain=chain.then(function(){return loadImageFile(file)}).then(function(o){
      var activeFolder=project.activeFolderId;
      project.assets.push(makeAsset({name:o.name,url:o.url,img:o.img,w:o.w,h:o.h,source:"import",
        folderId:activeFolder&&activeFolder!=="root"?activeFolder:null,
        folderIds:activeFolder&&activeFolder!=="root"?[activeFolder]:[],
        rootVisible:activeFolder==null||activeFolder==="root"}));
    });
  });
  chain.then(function(){renderGallery();if(state.inspOpen)renderInspector();updateHud()});
}
function syncPanoSelect(){
  var sel=$("panoSelect");sel.innerHTML="";
  if(!project.panoramas.length){var o=document.createElement("option");o.textContent="нет панорам";sel.appendChild(o);return}
  project.panoramas.forEach(function(p){var o=document.createElement("option");o.value=p.id;o.textContent=p.name;if(p.id===activePanoId())o.selected=true;sel.appendChild(o)});
}
function setActivePano(id,opts){opts=opts||{};setActivePanoId(id);setCurrentSourceType("pano");var p=findPano(id);if(p&&p.img)setPanoImage(p.img);else clearPanoImage();syncPanoSelect();if(typeof syncSourceViewerUI==="function")syncSourceViewerUI();updateHud();if(!opts.skipHistory)commitHistory()}
function syncOutFromAspect(){project.outH=Math.max(16,Math.round(project.outW/aspectRatio(project.aspect)))}
function aspectOptions(cur){return ["16:9","1:1","9:16","4:5","5:4","4:3","21:9"].map(function(a){return '<option value="'+a+'"'+(a===cur?" selected":"")+'>'+a+'</option>'}).join("")}

function capturePanoFrameSyncBase(){
  var panoId=activePanoId();
  if(!panoReady||!panoId){alert("Сначала загрузите панораму");return null}
  var pano=findPano(panoId);if(!pano||!pano.img)return null;
  var tw=project.outW|0,th=project.outH|0;if(tw<16)tw=1920;if(th<16)th=Math.round(tw/aspectRatio(project.aspect));
  var tmp=document.createElement("canvas");tmp.width=tw;tmp.height=th;
  var tgl=tmp.getContext("webgl",{preserveDrawingBuffer:true,alpha:false})||tmp.getContext("experimental-webgl",{preserveDrawingBuffer:true,alpha:false});
  if(!tgl){var c2=document.createElement("canvas");c2.width=tw;c2.height=th;c2.getContext("2d").drawImage(panoCanvas,0,0,tw,th);return{canvas:c2,tw:tw,th:th}}
  function comp(type,src){var s=tgl.createShader(type);tgl.shaderSource(s,src);tgl.compileShader(s);return s}
  var vs=comp(tgl.VERTEX_SHADER,"attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}");
  var fs=comp(tgl.FRAGMENT_SHADER,"precision mediump float;uniform vec2 uRes;uniform float uYaw,uPitch,uFov;uniform sampler2D uTex;const float PI=3.14159265;mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}void main(){vec2 uv=(gl_FragCoord.xy/uRes)*2.-1.;uv.x*=uRes.x/uRes.y;float f=1./tan(uFov*.5);vec3 rd=normalize(vec3(uv.x,uv.y,-f));rd=rotY(uYaw)*rotX(uPitch)*rd;float lon=atan(rd.z,rd.x);float lat=asin(clamp(rd.y,-1.,1.));gl_FragColor=texture2D(uTex,vec2(lon/(2.*PI)+.5,lat/PI+.5));}");
  var prog=tgl.createProgram();tgl.attachShader(prog,vs);tgl.attachShader(prog,fs);tgl.linkProgram(prog);tgl.useProgram(prog);
  var buf=tgl.createBuffer();tgl.bindBuffer(tgl.ARRAY_BUFFER,buf);tgl.bufferData(tgl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),tgl.STATIC_DRAW);
  var al=tgl.getAttribLocation(prog,"a");tgl.enableVertexAttribArray(al);tgl.vertexAttribPointer(al,2,tgl.FLOAT,false,0,0);
  var tex=tgl.createTexture();tgl.bindTexture(tgl.TEXTURE_2D,tex);
  tgl.texParameteri(tgl.TEXTURE_2D,tgl.TEXTURE_WRAP_S,tgl.CLAMP_TO_EDGE);tgl.texParameteri(tgl.TEXTURE_2D,tgl.TEXTURE_WRAP_T,tgl.CLAMP_TO_EDGE);
  tgl.texParameteri(tgl.TEXTURE_2D,tgl.TEXTURE_MIN_FILTER,tgl.LINEAR);tgl.texParameteri(tgl.TEXTURE_2D,tgl.TEXTURE_MAG_FILTER,tgl.LINEAR);
  tgl.pixelStorei(tgl.UNPACK_FLIP_Y_WEBGL,1);tgl.texImage2D(tgl.TEXTURE_2D,0,tgl.RGBA,tgl.RGBA,tgl.UNSIGNED_BYTE,pano.img);
  tgl.viewport(0,0,tw,th);
  tgl.uniform2f(tgl.getUniformLocation(prog,"uRes"),tw,th);
  var panoState=sourcePano();
  tgl.uniform1f(tgl.getUniformLocation(prog,"uYaw"),panoState.yaw);
  tgl.uniform1f(tgl.getUniformLocation(prog,"uPitch"),panoState.pitch);
  tgl.uniform1f(tgl.getUniformLocation(prog,"uFov"),panoState.fov);
  tgl.uniform1i(tgl.getUniformLocation(prog,"uTex"),0);
  tgl.drawArrays(tgl.TRIANGLES,0,6);
  return{canvas:tmp,tw:tw,th:th};
}
function captureToAsset(cb){
  if(state.capturing)return;
  state.capturing=true;
  var base=typeof captureActiveSourceFrameSyncBase==="function"?captureActiveSourceFrameSyncBase():capturePanoFrameSyncBase();
  if(!base){state.capturing=false;if(cb)cb(null);return}
  var tw=base.tw,th=base.th,out=document.createElement("canvas");out.width=tw;out.height=th;
  var ctx=out.getContext("2d");ctx.drawImage(base.canvas,0,0,tw,th);
  function finish(){
    if(state.draw.on||hasDrawInk()){
      ctx.save();ctx.globalAlpha=state.draw.bgAlpha;ctx.fillStyle="#fff";ctx.fillRect(0,0,tw,th);ctx.globalAlpha=1;
      if(drawCanvas.width)ctx.drawImage(drawCanvas,0,0,tw,th);ctx.restore();
    }
    out.toBlob(function(blob){
      state.capturing=false;
      if(!blob){if(cb)cb(null);return}
      var url=URL.createObjectURL(blob),img=new Image();
      img.onload=function(){
        var name="cap_"+new Date().toISOString().replace(/[:.]/g,"-")+".png";
        var meta=captureMetaForCurrentSource();
        var asset=makeAsset({name:name,url:url,img:img,w:img.naturalWidth,h:img.naturalHeight,source:"capture",captureMeta:meta});
        if(cb)cb(asset);
      };
      img.onerror=function(){state.capturing=false;if(cb)cb(null)};
      img.src=url;
    },"image/png");
  }
  if(state.titles.on){
    bakeTitlesToCanvas(tw,th,false).then(function(tc){ctx.drawImage(tc,0,0,tw,th);finish()}).catch(finish);
  }else finish();
}
function routeCapture(mode){
  captureToAsset(function(asset){
    if(!asset)return;
    pushHistory();
    project.assets.push(asset);
    state.selectedAssetIds=[asset.id];
    if(mode==="timeline-after"){
      var ids=insertAfterSelectedOrEnd([asset.id]);
      state.selectedBlockIds=ids;state.selectedOverlayIds=[];
    }else if(mode==="replace-selected"){
      var eb=editingBlock();
      if(eb&&eb.block){
        replaceBlockAsset(eb.block.id,asset.id);
        if(eb.track==="overlay"){state.selectedOverlayIds=[eb.block.id];state.selectedBlockIds=[]}
        else{state.selectedBlockIds=[eb.block.id];state.selectedOverlayIds=[]}
      }
    }
    renderGallery();drawTimeline();applyFrame();updateHud();
    if(state.inspOpen)renderInspector();
  });
}
function doCapture(){routeCapture("gallery")}

if(window.PMS&&PMS.registerModule)PMS.registerModule("viewers.pano",{initPanoGL:initPanoGL,setPanoImage:setPanoImage,clearPanoImage:clearPanoImage,resizePanoGL:resizePanoGL,drawPano:drawPano,resizeDrawCanvas:resizeDrawCanvas,syncDrawBg:syncDrawBg,setDrawMode:setDrawMode,clearDraw:clearDraw,drawPointerPos:drawPointerPos,strokeDraw:strokeDraw,hasDrawInk:hasDrawInk,loadImageFile:loadImageFile,addPanoFiles:addPanoFiles,addImageFiles:addImageFiles,syncPanoSelect:syncPanoSelect,setActivePano:setActivePano,syncOutFromAspect:syncOutFromAspect,aspectOptions:aspectOptions,capturePanoFrameSyncBase:capturePanoFrameSyncBase,captureToAsset:captureToAsset,routeCapture:routeCapture,doCapture:doCapture});
