"use strict";

/* Stage 3: history / undo-redo with source + template-library checkpoints. */

function snapshot(){
  return{
    blocks:deepClone(project.blocks),overlayBlocks:deepClone(project.overlayBlocks),audioBlocks:deepClone(project.audioBlocks||[]),
    assetsMeta:project.assets.map(function(a){a=ensureAssetFolderState(a);return{id:a.id,name:a.name,folderId:a.folderId,folderIds:(a.folderIds||[]).slice(),rootVisible:!!a.rootVisible,tagIds:(a.tagIds||[]).slice(),linkGroup:a.linkGroup}}),
    folders:deepClone(project.folders),tags:deepClone(project.tags),
    inPoint:project.inPoint,outPoint:project.outPoint,timelineFrames:project.timelineFrames,
    defaultBlockDur:project.defaultBlockDur,defaultBlockDurUnit:project.defaultBlockDurUnit,
    selectedAssetIds:state.selectedAssetIds.slice(),selectedBlockIds:state.selectedBlockIds.slice(),selectedOverlayIds:state.selectedOverlayIds.slice(),
    selectedTemplateIds:(state.selectedTemplateIds||[]).slice(),activeTemplateId:state.activeTemplateId||null,
    libraryMode:state.libraryMode||"assets",templateColumns:state.templateColumns|0||2,templateSearch:state.templateSearch||"",templateStyleFilter:(state.templateStyleFilter||[]).slice(),templateGroupFilter:(state.templateGroupFilter||[]).slice(),templateTagFilter:(state.templateTagFilter||[]).slice(),templateAspectFilter:(state.templateAspectFilter||[]).slice(),templateShowTags:!!state.templateShowTags,assetTagFilter:(state.assetTagFilter||[]).slice(),rndBuildMode:state.rndBuildMode||"images",rndBuildSource:state.rndBuildSource||"all",rndAssetFolderFilter:(state.rndAssetFolderFilter||[]).slice(),rndAssetTagFilter:(state.rndAssetTagFilter||[]).slice(),rndTemplateStyleFilter:(state.rndTemplateStyleFilter||[]).slice(),rndTemplateGroupFilter:(state.rndTemplateGroupFilter||[]).slice(),rndTemplateTagFilter:(state.rndTemplateTagFilter||[]).slice(),rndTemplateAspectFilter:(state.rndTemplateAspectFilter||[]).slice(),blockSelectionLocked:!!state.blockSelectionLocked,
    designTemplates:deepClone(project.designTemplates),titlePresets:deepClone(project.titlePresets),templateLibrary:deepClone(project.templateLibrary||defaultTemplateLibrary()),
    source:exportSourceState(),
    flatImagesMeta:(project.flatImages||[]).map(function(x){return{id:x.id,name:x.name,w:x.w,h:x.h,sourceAssetId:x.sourceAssetId||null}}),
    templateEdit:deepClone({blockId:state.templateEdit.blockId,track:state.templateEdit.track,selectedSlot:state.templateEdit.selectedSlot,selectedNodeSelector:state.templateEdit.selectedNodeSelector}),
    titles:deepClone({on:state.titles.on,mode:state.titles.mode,activeId:state.titles.activeId,instanceHtml:state.titles.instanceHtml,instance:state.titles.instance,designW:state.titles.designW,designH:state.titles.designH}),
    drawDataURL:(function(){try{if(drawCanvas&&drawCanvas.width>1)return drawCanvas.toDataURL("image/png")}catch(e){}return null})()
  };
}
function sameSnapshot(a,b){
  try{return JSON.stringify(a)===JSON.stringify(b)}catch(e){return false}
}
function applySnapshot(s){
  if(!s)return;state.history.lock=true;
  project.blocks=deepClone(s.blocks);project.overlayBlocks=deepClone(s.overlayBlocks||[]);project.audioBlocks=deepClone(s.audioBlocks||[]);
  project.folders=deepClone(s.folders||[]);project.tags=deepClone(s.tags||[]);
  project.inPoint=s.inPoint;project.outPoint=s.outPoint;project.timelineFrames=s.timelineFrames;
  project.defaultBlockDur=s.defaultBlockDur;project.defaultBlockDurUnit=s.defaultBlockDurUnit;
  project.designTemplates=deepClone(s.designTemplates||[]);project.titlePresets=deepClone(s.titlePresets||[]);
  project.templateLibrary=deepClone(s.templateLibrary||defaultTemplateLibrary());
  ensureProjectTemplateLibrary();
  if(s.source)importSourceState(s.source);
  var flatMeta={};(s.flatImagesMeta||[]).forEach(function(m){flatMeta[m.id]=m});
  (project.flatImages||[]).forEach(function(x){var m=flatMeta[x.id];if(!m)return;x.name=m.name;x.w=m.w||x.w;x.h=m.h||x.h;x.sourceAssetId=m.sourceAssetId||null});
  var map={};(s.assetsMeta||[]).forEach(function(m){map[m.id]=m});
  project.assets.forEach(function(a){var m=map[a.id];if(!m)return;a.name=m.name;setAssetFolderState(a,m.folderIds!=null?m.folderIds:(m.folderId?[m.folderId]:[]),m.rootVisible!=null?m.rootVisible:!(m.folderId));a.tagIds=(m.tagIds||[]).slice();a.linkGroup=m.linkGroup});
  state.selectedAssetIds=(s.selectedAssetIds||[]).slice();state.selectedBlockIds=(s.selectedBlockIds||[]).slice();state.selectedOverlayIds=(s.selectedOverlayIds||[]).slice();
  state.selectedTemplateIds=(s.selectedTemplateIds||[]).slice();state.activeTemplateId=s.activeTemplateId||null;
  state.libraryMode=s.libraryMode||"assets";state.templateColumns=s.templateColumns|0||2;state.templateSearch=s.templateSearch||"";
  state.templateStyleFilter=(s.templateStyleFilter||[]).slice();state.templateGroupFilter=(s.templateGroupFilter||[]).slice();state.templateTagFilter=(s.templateTagFilter||[]).slice();state.templateAspectFilter=(s.templateAspectFilter||[]).slice();state.templateShowTags=!!s.templateShowTags;state.assetTagFilter=(s.assetTagFilter||[]).slice();state.rndBuildMode=s.rndBuildMode||"images";state.rndBuildSource=s.rndBuildSource||"all";state.rndAssetFolderFilter=(s.rndAssetFolderFilter||[]).slice();state.rndAssetTagFilter=(s.rndAssetTagFilter||[]).slice();state.rndTemplateStyleFilter=(s.rndTemplateStyleFilter||[]).slice();state.rndTemplateGroupFilter=(s.rndTemplateGroupFilter||[]).slice();state.rndTemplateTagFilter=(s.rndTemplateTagFilter||[]).slice();state.rndTemplateAspectFilter=(s.rndTemplateAspectFilter||[]).slice();state.blockSelectionLocked=!!s.blockSelectionLocked;
  state.templateEdit.blockId=s.templateEdit&&s.templateEdit.blockId||null;
  state.templateEdit.track=s.templateEdit&&s.templateEdit.track||"main";
  state.templateEdit.selectedSlot=s.templateEdit&&s.templateEdit.selectedSlot||null;
  state.templateEdit.selectedNodeSelector=s.templateEdit&&s.templateEdit.selectedNodeSelector||null;
  if(s.titles){
    state.titles.on=!!s.titles.on;state.titles.mode=s.titles.mode;state.titles.activeId=s.titles.activeId;
    state.titles.instanceHtml=s.titles.instanceHtml;state.titles.instance=s.titles.instance?deepClone(s.titles.instance):null;
    state.titles.designW=s.titles.designW||1123;state.titles.designH=s.titles.designH||794;
  }
  if(s.drawDataURL){var im=new Image();im.onload=function(){resizeDrawCanvas();drawCtx.setTransform(1,0,0,1,0,0);drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);drawCtx.drawImage(im,0,0,drawCanvas.width,drawCanvas.height);var dpr=Math.min(devicePixelRatio||1,2);drawCtx.setTransform(dpr,0,0,dpr,0,0)};im.src=s.drawDataURL}
  state.history.lock=false;endAllTlPointers();syncTitlesUI();if(typeof syncLibraryPane==="function")syncLibraryPane();renderUI(true);
}
function pushHistory(){
  if(state.history.lock)return false;
  var h=state.history;
  if(h.index<h.stack.length-1)h.stack=h.stack.slice(0,h.index+1);
  h.stack.push(snapshot());
  if(h.stack.length>h.max)h.stack.shift();
  h.index=h.stack.length-1;
  return true;
}
function commitHistory(){
  if(state.history.lock)return false;
  var h=state.history,s=snapshot();
  if(h.index<h.stack.length-1)h.stack=h.stack.slice(0,h.index+1);
  if(h.stack.length&&sameSnapshot(h.stack[h.stack.length-1],s)){h.index=h.stack.length-1;return false}
  h.stack.push(s);
  if(h.stack.length>h.max)h.stack.shift();
  h.index=h.stack.length-1;
  return true;
}
function undo(){if(state.draw.on&&state.draw.undoStack.length){var prev=state.draw.undoStack.pop();var im=new Image();im.onload=function(){drawCtx.setTransform(1,0,0,1,0,0);drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);drawCtx.drawImage(im,0,0);var dpr=Math.min(devicePixelRatio||1,2);drawCtx.setTransform(dpr,0,0,dpr,0,0)};im.src=prev;return}var h=state.history;if(h.index<=0)return;h.index--;applySnapshot(h.stack[h.index])}
function redo(){var h=state.history;if(h.index>=h.stack.length-1)return;h.index++;applySnapshot(h.stack[h.index])}
function pushDrawUndo(){try{if(drawCanvas&&drawCanvas.width>1){state.draw.undoStack.push(drawCanvas.toDataURL("image/png"));if(state.draw.undoStack.length>30)state.draw.undoStack.shift()}}catch(e){}}

if(window.PMS&&PMS.registerModule)PMS.registerModule("core.history",{snapshot:snapshot,sameSnapshot:sameSnapshot,applySnapshot:applySnapshot,pushHistory:pushHistory,commitHistory:commitHistory,undo:undo,redo:redo,pushDrawUndo:pushDrawUndo});
