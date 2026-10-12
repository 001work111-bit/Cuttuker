"use strict";

/* Stage 3: assets gallery, membership folders, tags, drag/drop, template-slot apply gestures. */

function getDragAssetIds(e){
  try{
    var raw=e.dataTransfer.getData("text/x-assets")||e.dataTransfer.getData("text/plain");
    if(!raw)return[];
    if(raw.charAt(0)==="[")return JSON.parse(raw);
    return raw.split(",").filter(Boolean);
  }catch(err){return[]}
}
function currentGalleryFolderId(){return project.activeFolderId==null?null:project.activeFolderId}
function addMembershipToFolder(asset,folderId){
  asset=ensureAssetFolderState(asset);
  if(!asset||!folderId)return asset;
  if(asset.folderIds.indexOf(folderId)<0)asset.folderIds.push(folderId);
  asset.folderId=asset.folderIds[0]||null;
  return asset;
}
function removeMembershipFromFolder(asset,folderId){
  asset=ensureAssetFolderState(asset);
  if(!asset)return asset;
  if(folderId==="root"||folderId==null){
    asset.rootVisible=false;
    return asset;
  }
  asset.folderIds=asset.folderIds.filter(function(id){return id!==folderId});
  asset.folderId=asset.folderIds[0]||null;
  if(!asset.folderIds.length&&!asset.rootVisible)asset.rootVisible=true;
  return asset;
}
function assetShownInFolder(asset,folderId){
  asset=ensureAssetFolderState(asset);
  if(folderId==null||folderId==="")return true;
  if(folderId==="root")return assetVisibleInRoot(asset);
  return assetInFolder(asset,folderId);
}
function assetMoveBetweenFolders(asset,targetFolderId,sourceFolderId,copyMode){
  asset=ensureAssetFolderState(asset);
  if(!asset)return asset;
  var target=targetFolderId==null||targetFolderId==="root"?null:targetFolderId;
  var source=sourceFolderId;
  if(target){
    if(!copyMode&&source===null)asset.rootVisible=false;
    if(!copyMode&&source&&source!==target&&source!=="root")removeMembershipFromFolder(asset,source);
    addMembershipToFolder(asset,target);
  }else{
    asset.rootVisible=true;
    if(!copyMode&&source&&source!=="root")removeMembershipFromFolder(asset,source);
  }
  asset.folderId=asset.folderIds[0]||null;
  return asset;
}
function removeFromFolderOnly(ids,folderId){
  var targetFolderId=arguments.length>1?folderId:currentGalleryFolderId();
  pushHistory();
  ids.forEach(function(id){
    var a=findAsset(id);if(!a)return;
    removeMembershipFromFolder(a,targetFolderId);
  });
  state.selectedAssetIds=(state.selectedAssetIds||[]).filter(function(id){return !!findAsset(id)});
}
function deleteAssets(ids,mode){
  if(mode==="folder-only"){removeFromFolderOnly(ids);return}
  pushHistory();
  var kill={};
  ids.forEach(function(id){
    var a=findAsset(id);if(!a)return;
    if(a.linkGroup)project.assets.forEach(function(x){if(x.linkGroup===a.linkGroup)kill[x.id]=true});
    else kill[id]=true;
  });
  Object.keys(kill).forEach(function(id){
    project.blocks.forEach(function(b){if(b.assetId===id)b.assetId=null});
    project.overlayBlocks.forEach(function(b){if(b.assetId===id)b.assetId=null});
    if(typeof project.flatImages!=="undefined")project.flatImages=(project.flatImages||[]).filter(function(x){return x.sourceAssetId!==id});
  });
  project.assets=project.assets.filter(function(a){return !kill[a.id]});
  state.selectedAssetIds=state.selectedAssetIds.filter(function(id){return !kill[id]});
}
function assetsVisible(){
  var fid=currentGalleryFolderId(),tagIds=state.assetTagFilter||[];
  return project.assets.filter(function(a){
    a=ensureAssetFolderState(a);
    if(!assetShownInFolder(a,fid))return false;
    return assetMatchesTagFilter(a,tagIds);
  });
}
function assetsVisibleIds(){return assetsVisible().map(function(a){return a.id})}
function folderAssetCount(folderId){
  return project.assets.filter(function(a){return assetShownInFolder(a,folderId)}).length;
}
function disbandFolder(folderId){
  pushHistory();
  project.assets.forEach(function(a){removeMembershipFromFolder(a,folderId)});
  project.folders=project.folders.filter(function(f){return f.id!==folderId});
  if(project.activeFolderId===folderId)project.activeFolderId=null;
}
function cloneAssetToFolder(src,folderId){
  addMembershipToFolder(src,folderId);
  return src;
}
function applyFolderDrop(ids,targetFolderId,copyMode,sourceFolderId){
  pushHistory();
  ids.forEach(function(id){
    var a=findAsset(id);if(!a)return;
    assetMoveBetweenFolders(a,targetFolderId,sourceFolderId,copyMode);
  });
}
function insertAssetsAfterContext(ids){
  var eb=editingBlock();
  if(eb&&eb.block){
    var arr=eb.track==="overlay"?project.overlayBlocks:project.blocks;
    var idx=findIndexIn(arr,eb.block.id);
    return insertBlocks(ids,idx+1,eb.track);
  }
  return insertBlocks(ids,project.blocks.length,"main");
}
function sendAssetToSource(assetId,e){
  if(e){e.preventDefault();e.stopPropagation()}
  if(typeof openAssetInFlatMode==="function")openAssetInFlatMode(assetId);
}
function handleAssetGalleryGesture(asset,e){
  var wantsReplace=e.ctrlKey&&!e.shiftKey&&!e.altKey;
  var wantsInsertEnd=e.altKey&&!e.ctrlKey;
  var wantsInsertAfter=e.ctrlKey&&e.shiftKey;
  if(!wantsReplace&&!wantsInsertEnd&&!wantsInsertAfter)return false;
  var eb=editingBlock();
  if(wantsReplace&&!eb)return false;
  e.preventDefault();
  pushHistory();
  if(wantsReplace){
    if(blockIsTemplate(eb.block)&&state.templateEdit.selectedSlot&&applyAssetToSelectedTemplateSlot(asset.id)){
      if(eb.track==="overlay"){state.selectedOverlayIds=[eb.block.id];state.selectedBlockIds=[]}
      else{state.selectedBlockIds=[eb.block.id];state.selectedOverlayIds=[]}
    }else{
      replaceBlockAsset(eb.block.id,asset.id);
      clearTemplateEditState();
      if(eb.track==="overlay"){state.selectedOverlayIds=[eb.block.id];state.selectedBlockIds=[]}
      else{state.selectedBlockIds=[eb.block.id];state.selectedOverlayIds=[]}
    }
  }else if(wantsInsertAfter){
    state.selectedBlockIds=insertAssetsAfterContext([asset.id]);state.selectedOverlayIds=[];
  }else if(wantsInsertEnd){
    state.selectedBlockIds=insertBlocks([asset.id],project.blocks.length,"main");state.selectedOverlayIds=[];
  }
  state.selectedAssetIds=[asset.id];
  renderUI(true);
  return true;
}
function visibleAssetTagIds(){
  var seen={};
  project.assets.forEach(function(a){
    (a.tagIds||[]).forEach(function(id){seen[id]=true});
  });
  return Object.keys(seen).filter(function(id){return !!findTag(id)}).sort(function(a,b){
    var ta=findTag(a),tb=findTag(b),an=(ta&&ta.name||a).toLowerCase(),bn=(tb&&tb.name||b).toLowerCase();
    return an<bn?-1:an>bn?1:0;
  });
}
function renderAssetTagFilter(){
  var host=$("galTagFilter");if(!host)return;
  var ids=visibleAssetTagIds();
  if(typeof renderTemplateDropdown==="function"){
    renderTemplateDropdown("galTagFilter","Тэги",ids.map(function(tagId){var t=findTag(tagId);return{value:tagId,label:t&&t.name||tagId,desc:""}}),ensureStringArray(state.assetTagFilter),function(opt,on){
      var next=(state.assetTagFilter||[]).slice(),i=next.indexOf(opt);
      if(on&&i<0)next.push(opt);
      if(!on&&i>=0)next.splice(i,1);
      state.assetTagFilter=next;
      renderGallery();
    },"Все тэги");
    return;
  }
  host.innerHTML="";
}
function renderGallery(){
  $("galGrid").style.setProperty("--thumb",state.galScale+"px");
  $("galFolders").style.setProperty("--thumb",state.galScale+"px");
  renderAssetTagFilter();
  var fh=$("galFolders");fh.innerHTML="";
  function addFolderCard(id,name,count,active,canDelete){
    var d=document.createElement("div");d.className="folderCard"+(active?" active":"");
    d.innerHTML='<div class="fn"></div><div class="fc"></div>';
    d.querySelector(".fn").textContent=name;
    d.querySelector(".fc").textContent=count+" шт";
    if(canDelete){
      var bd=document.createElement("button");bd.className="fdel";bd.type="button";bd.textContent="×";
      bd.onclick=function(e){e.stopPropagation();if(!confirm("Удалить папку «"+name+"»? Членство файлов будет снято."))return;disbandFolder(id);renderGallery();if(state.inspOpen)renderInspector()};
      d.appendChild(bd);
    }
    d.onclick=function(){project.activeFolderId=id;renderGallery()};
    d.addEventListener("dragover",function(e){e.preventDefault();d.style.borderColor="#4c6ef5"});
    d.addEventListener("dragleave",function(){d.style.borderColor=""});
    d.addEventListener("drop",function(e){
      e.preventDefault();d.style.borderColor="";
      var ids=getDragAssetIds(e);if(!ids.length)return;
      applyFolderDrop(ids,id==="root"?null:id,!!e.altKey,state.assetDragContext!=null?state.assetDragContext:currentGalleryFolderId());
      renderGallery();if(state.inspOpen)renderInspector();
    });
    fh.appendChild(d);
  }
  addFolderCard(null,"Все",project.assets.length,currentGalleryFolderId()==null,false);
  addFolderCard("root","Корень",folderAssetCount("root"),currentGalleryFolderId()==="root",false);
  project.folders.forEach(function(f){addFolderCard(f.id,f.name,folderAssetCount(f.id),currentGalleryFolderId()===f.id,true)});

  var grid=$("galGrid");grid.innerHTML="";
  var list=assetsVisible();
  $("galCount").textContent=list.length+" / "+project.assets.length;
  list.forEach(function(a){
    a=ensureAssetFolderState(a);
    var card=document.createElement("div");
    card.className="assetCard"+(state.selectedAssetIds.indexOf(a.id)>=0?" sel":"")+(a.linkGroup?" linked":"");
    card.draggable=true;card.dataset.id=a.id;
    if(a.img){
      var im=document.createElement("img");im.src=a.url||a.img.src;
      if(a.w&&a.h){var h=state.galScale,w=Math.round(h*(a.w/a.h));im.style.height=h+"px";im.style.width=w+"px";card.style.height=h+"px"}
      card.appendChild(im);
    }
    var nm=document.createElement("div");nm.className="nm";nm.textContent=a.name;card.appendChild(nm);
    if(a.tagIds&&a.tagIds.length){
      var tg=document.createElement("div");tg.className="tags";
      a.tagIds.forEach(function(tid){var t=findTag(tid);if(!t||!t.name)return;var c=document.createElement("span");c.className="tagChip";c.textContent=t.name;c.style.borderColor=t.color||"#fff3";tg.appendChild(c)});
      if(tg.childNodes.length)card.appendChild(tg);
    }
    if(a.img){
      var srcBtn=document.createElement("button");srcBtn.type="button";srcBtn.className="mini srcFromGallery";srcBtn.textContent="Source";
      srcBtn.onclick=function(e){sendAssetToSource(a.id,e)};
      card.appendChild(srcBtn);
    }
    card.addEventListener("click",function(e){
      if(handleAssetGalleryGesture(a,e))return;
      var ids=assetsVisibleIds();
      if(e.shiftKey){
        var anchor=state.galAnchorId||a.id;
        state.selectedAssetIds=rangeSelectIds(ids,anchor,a.id);
      }else if(e.metaKey||e.ctrlKey){
        var i=state.selectedAssetIds.indexOf(a.id);
        if(i>=0)state.selectedAssetIds.splice(i,1);else state.selectedAssetIds.push(a.id);
        state.galAnchorId=a.id;
      }else{state.selectedAssetIds=[a.id];state.galAnchorId=a.id}
      if(state.inspOpen){setInspTab("asset");renderInspector()}
      renderGallery();
    });
    card.addEventListener("dragstart",function(e){
      var ids=state.selectedAssetIds.indexOf(a.id)>=0?state.selectedAssetIds.slice():[a.id];
      state.assetDragContext=currentGalleryFolderId();
      e.dataTransfer.setData("text/x-assets",JSON.stringify(ids));
      e.dataTransfer.setData("text/plain",ids.join(","));
    });
    card.addEventListener("dragend",function(){state.assetDragContext=null});
    grid.appendChild(card);
  });
}

if(window.PMS&&PMS.registerModule)PMS.registerModule("gallery.assets",{
  getDragAssetIds:getDragAssetIds,
  assetsVisible:assetsVisible,
  assetsVisibleIds:assetsVisibleIds,
  disbandFolder:disbandFolder,
  removeFromFolderOnly:removeFromFolderOnly,
  deleteAssets:deleteAssets,
  cloneAssetToFolder:cloneAssetToFolder,
  addMembershipToFolder:addMembershipToFolder,
  removeMembershipFromFolder:removeMembershipFromFolder,
  applyFolderDrop:applyFolderDrop,
  insertAssetsAfterContext:insertAssetsAfterContext,
  handleAssetGalleryGesture:handleAssetGalleryGesture,
  sendAssetToSource:sendAssetToSource,
  renderGallery:renderGallery
});
