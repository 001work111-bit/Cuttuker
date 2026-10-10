"use strict";

/* Stage 3: core state, normalized source state, template-library helpers. */

var PI=Math.PI,DEG=PI/180,RAD=180/PI;
var PMS=window.PMS=window.PMS||{modules:{}};
PMS.version=PMS.version||"stage3-template-library";
PMS.registerModule=PMS.registerModule||function(name,api){
  this.modules=this.modules||{};
  this.modules[name]=api||{};
  return this.modules[name];
};
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}
function uid(p){return (p||"id")+Math.random().toString(36).slice(2,9)}
function $(id){return document.getElementById(id)}
function aspectRatio(s){var p=(s||"16:9").split(":");return(+p[0]||16)/(+p[1]||9)}
function downloadText(n,t,m){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:m||"text/plain"}));a.download=n;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},2e3)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})}
function escAE(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
function randColor(){return"hsl("+Math.floor(Math.random()*360)+" 70% 55%)"}
function BLOCK_COLORS(i){var h=[210,280,160,20,340,50,190,120];return"hsla("+h[i%h.length]+",65%,48%,0.72)"}
function deepClone(o){return JSON.parse(JSON.stringify(o))}

function defaultSourceState(){
  return{
    type:"pano",
    pano:{activeId:null,yaw:0,pitch:0,fov:75*DEG},
    image:{activeId:null,scale:1,posX:0.5,posY:0.5}
  };
}
function normalizeSourceState(src){
  var base=defaultSourceState(),out=deepClone(base),p,i;
  src=src||{};
  out.type=src.type==="image"?"image":"pano";
  p=src.pano||{};i=src.image||{};
  out.pano.activeId=p.activeId||null;
  out.pano.yaw=isFinite(+p.yaw)?+p.yaw:base.pano.yaw;
  out.pano.pitch=isFinite(+p.pitch)?clamp(+p.pitch,-1.55,1.55):base.pano.pitch;
  out.pano.fov=clamp(isFinite(+p.fov)?+p.fov:base.pano.fov,0.45,1.9);
  out.image.activeId=i.activeId||null;
  out.image.scale=clamp(isFinite(+i.scale)&&+i.scale>0?+i.scale:base.image.scale,0.25,12);
  out.image.posX=clamp(isFinite(+i.posX)?+i.posX:base.image.posX,0,1);
  out.image.posY=clamp(isFinite(+i.posY)?+i.posY:base.image.posY,0,1);
  return out;
}

var TEMPLATE_DEFAULT_GROUP_ID="tgrp_default";
var TEMPLATE_DEFAULT_STYLE_ID="tsty_default";
function defaultTemplateLibrarySection(kind,file,editable){
  return{kind:kind||"system",file:file||"",editable:!!editable,format:"motion-studio-library-v1",libraryType:"motion-studio-library-v1",target:"motion-studio",contractVersion:"motion-studio-template-v1",styleSystems:{},batches:{},templates:[]};
}
function defaultTemplateLibrary(){
  return{
    format:"motion-studio-library-v2",
    libraryType:"motion-studio-library-v2",
    target:"motion-studio",
    contractVersion:"motion-studio-template-v1",
    styleSystems:{},batches:{},templates:[],
    systemLibrary:defaultTemplateLibrarySection("system","templates/librarymotion.js",false),
    userLibrary:defaultTemplateLibrarySection("user","templates/user.js",true),
    internalGroups:[{id:TEMPLATE_DEFAULT_GROUP_ID,name:"Общее"}],
    internalStyles:[{id:TEMPLATE_DEFAULT_STYLE_ID,name:"Базовый"}],
    internalAssignments:{},
    userSourceCode:"",
    lastUserPersistAt:null,
    lastUserPersistError:null
  };
}
function defaultUserLibraryPayload(){
  return{format:"pms-user-library-v1",target:"motion-studio",internalGroups:[{id:TEMPLATE_DEFAULT_GROUP_ID,name:"Общее"}],internalStyles:[{id:TEMPLATE_DEFAULT_STYLE_ID,name:"Базовый"}],internalAssignments:{},templates:[]};
}
function ensureStringArray(arr){
  if(!Array.isArray(arr))return[];
  return arr.map(function(x){return String(x==null?"":x).trim()}).filter(Boolean);
}
function sanitizeTemplateId(v){
  v=String(v==null?"":v).trim();
  v=v.replace(/\s+/g,"_").replace(/[^a-zA-Z0-9_\-]+/g,"").replace(/^_+|_+$/g,"");
  return v||uid("tpl");
}
function normalizeTemplateRegistry(list,defaultId,defaultName,prefix){
  var out=[],seen={};
  (Array.isArray(list)?list:[]).forEach(function(item){
    if(!item)return;
    var id=String(item.id||"").trim()||uid(prefix||"id");
    var name=String(item.name||"").trim()||id;
    if(seen[id])return;
    seen[id]=1;out.push({id:id,name:name});
  });
  if(!out.length)out.push({id:defaultId,name:defaultName});
  return out;
}
function normalizeTemplateLibrarySection(section,kind,file,editable){
  section=section&&typeof section==="object"?section:{};
  return{
    kind:kind,
    file:section.file||file,
    editable:!!editable,
    format:section.format||"motion-studio-library-v1",
    libraryType:section.libraryType||section.format||"motion-studio-library-v1",
    target:section.target||"motion-studio",
    contractVersion:section.contractVersion||"motion-studio-template-v1",
    styleSystems:section.styleSystems&&typeof section.styleSystems==="object"?section.styleSystems:{},
    batches:section.batches&&typeof section.batches==="object"?section.batches:{},
    templates:Array.isArray(section.templates)?section.templates:[]
  };
}
function templateSourceKeyFromParts(sourceKind,sourceFile,templateId){
  return String(sourceKind||"system")+"::"+String(sourceFile||"")+"::"+String(templateId||"");
}
function findTemplateRegistryByName(list,name){
  name=String(name||"").trim().toLowerCase();
  if(!name)return null;
  for(var i=0;i<list.length;i++)if(String(list[i].name||"").trim().toLowerCase()===name)return list[i];
  return null;
}
function ensureTemplateRegistryEntry(list,name,defaultId,prefix){
  name=String(name||"").trim();
  if(!list.length)list.push({id:defaultId,name:defaultId===TEMPLATE_DEFAULT_GROUP_ID?"Общее":"Базовый"});
  if(!name)return list[0].id;
  var byName=findTemplateRegistryByName(list,name);
  if(byName)return byName.id;
  var item={id:uid(prefix),name:name};
  list.push(item);
  return item.id;
}
function resolveTemplateInternalGroupId(raw,lib,assignment){
  raw=raw||{};assignment=assignment||{};
  if(assignment.internalGroupId&&findIn(lib.internalGroups,assignment.internalGroupId))return assignment.internalGroupId;
  if(raw.appGroupId&&findIn(lib.internalGroups,raw.appGroupId))return raw.appGroupId;
  if(raw.internalGroupId&&findIn(lib.internalGroups,raw.internalGroupId))return raw.internalGroupId;
  return ensureTemplateRegistryEntry(lib.internalGroups,raw.appGroupName||raw.internalGroupName||raw.appGroup||raw.group,lib.internalGroups[0].id||TEMPLATE_DEFAULT_GROUP_ID,"tgrp");
}
function resolveTemplateInternalStyleId(raw,lib,assignment){
  raw=raw||{};assignment=assignment||{};
  if(assignment.internalStyleId&&findIn(lib.internalStyles,assignment.internalStyleId))return assignment.internalStyleId;
  if(raw.appStyleId&&findIn(lib.internalStyles,raw.appStyleId))return raw.appStyleId;
  if(raw.internalStyleId&&findIn(lib.internalStyles,raw.internalStyleId))return raw.internalStyleId;
  return ensureTemplateRegistryEntry(lib.internalStyles,raw.appStyleName||raw.internalStyleName||raw.appStyle||raw.style||raw.styleSystem,lib.internalStyles[0].id||TEMPLATE_DEFAULT_STYLE_ID,"tsty");
}
function collectTemplateTagsFrom(raw){
  var out=[],seen={};
  function add(v){v=String(v==null?"":v).trim();if(!v||seen[v])return;seen[v]=1;out.push(v)}
  ensureStringArray(raw&&raw.tags).forEach(add);
  ensureStringArray(raw&&raw.tagIds).forEach(add);
  ensureStringArray(raw&&raw.templateTags).forEach(add);
  ensureStringArray(raw&&raw.motionStudio&&raw.motionStudio.tags).forEach(add);
  ensureStringArray(raw&&raw.meta&&raw.meta.tags).forEach(add);
  return out;
}
function buildTemplateHtmlSource(raw){
  raw=raw||{};
  if(raw.html)return String(raw.html);
  if(typeof raw.build==="function"){
    try{return String(raw.build(raw.sampleData||raw.defaultData||{}));}catch(e){try{return String(raw.build(0));}catch(err){console.warn("Template build failed",raw&&raw.tpl||raw&&raw.id,err);}}
  }
  if(typeof raw.build==="string")return String(raw.build);
  return "";
}
function normalizeLegacyMotionEntities(raw){
  var src=(raw&&raw.motionStudio&&raw.motionStudio.entities)||(raw&&raw.motion&&raw.motion.entities)||raw&&raw.entities||[];
  var out={text:[],media:[],repeat:[]};
  if(src&&typeof src==="object"&&!Array.isArray(src)&&src.text)return deepClone(src);
  (Array.isArray(src)?src:[]).forEach(function(ent){
    if(!ent)return;
    var kind=String(ent.kind||ent.type||"").toLowerCase();
    if(kind==="text")out.text.push({kind:"text",slot:ent.slot||"",role:ent.role||"text",editable:ent.editable!==false});
    else if(kind==="image"||kind==="media"||kind==="video")out.media.push({kind:"media",slot:ent.slot||"",mediaKind:kind==="image"?"image":kind,editable:ent.editable!==false});
    else out.repeat.push(deepClone(ent));
  });
  return out;
}
function parseTemplateMediaSlots(html){
  var out={},wrap=document.createElement("div");
  wrap.innerHTML=String(html||"");
  wrap.querySelectorAll("[data-sb-media][data-slot]").forEach(function(el){
    var slot=(el.getAttribute("data-slot")||"").trim();
    if(!slot||out[slot])return;
    out[slot]={assetId:null,scale:1,posX:0.5,posY:0.5,hidden:false};
  });
  return out;
}
function defaultTemplateView(){
  return{background:true,text:true,media:true,inverted:false};
}
function normalizeTemplateView(view){
  var base=defaultTemplateView();view=view||{};
  return{background:view.background!==false,text:view.text!==false,media:view.media!==false,inverted:!!view.inverted};
}
function defaultTemplateViewMode(){return"reflow"}
function normalizeTemplateViewMode(mode){return mode==="hide-only"?"hide-only":"reflow"}
function normalizeTemplateZoom(v){
  v=+v;
  return clamp(isFinite(v)&&v>0?v:1,0.25,3);
}
function projectTagNames(){return (project.tags||[]).map(function(t){return t&&t.name?String(t.name).trim():""}).filter(Boolean)}
function resolveTemplateProjectTags(raw,assignment){
  raw=raw||{};assignment=assignment||{};
  var out=[],seen={},projectNames=projectTagNames();
  function add(v){
    v=String(v==null?"":v).trim();
    if(!v)return;
    var tag=findTag(v);
    if(tag)v=tag.name;
    if(projectNames.length&&projectNames.indexOf(v)<0)return;
    if(seen[v])return;
    seen[v]=1;out.push(v);
  }
  if(Array.isArray(assignment.templateTags)&&assignment.templateTags.length){assignment.templateTags.forEach(add);return out}
  ensureStringArray(raw.tagIds).forEach(add);
  ensureStringArray(raw.tags).forEach(add);
  ensureStringArray(raw.templateTags).forEach(add);
  ensureStringArray(raw.motionStudio&&raw.motionStudio.tags).forEach(add);
  ensureStringArray(raw.meta&&raw.meta.tags).forEach(add);
  return out;
}
function templateBlockFolderIds(block){
  if(!block)return[];
  if(Array.isArray(block.templateFolderIds))return block.templateFolderIds.slice().filter(Boolean);
  return block.templateFolderId?[block.templateFolderId]:[];
}
function msGuessFormat(w,h){
  w=+w||0;h=+h||0;
  if(!w||!h)return null;
  var r=w/h;
  if(Math.abs(r-(16/9))<0.02)return"16:9";
  if(Math.abs(r-(9/16))<0.02)return"9:16";
  if(Math.abs(r-1)<0.02)return"1:1";
  return null;
}
function normalizeTemplateItem(raw){
  raw=raw||{};
  var canvas=raw.canvas||{};
  var cw=canvas.w||canvas.width||raw.width||raw.designW||(raw.motion&&raw.motion.canvas&&raw.motion.canvas.width)||(raw.motionStudio&&raw.motionStudio.canvas&&raw.motionStudio.canvas.w)||0;
  var ch=canvas.h||canvas.height||raw.height||raw.designH||(raw.motion&&raw.motion.canvas&&raw.motion.canvas.height)||(raw.motionStudio&&raw.motionStudio.canvas&&raw.motionStudio.canvas.h)||0;
  var fmt=raw.format||raw.aspect||(raw.canvas&&raw.canvas.format)||(raw.motionStudio&&raw.motionStudio.format)||(raw.motion&&raw.motion.aspect)||msGuessFormat(cw,ch)||"16:9";
  var w=Math.max(16,(+cw)|0||(fmt==="9:16"?1080:1920));
  var h=Math.max(16,(+ch)|0||(fmt==="9:16"?1920:1080));
  var html=buildTemplateHtmlSource(raw);
  var motion=deepClone(raw.motionStudio||{});
  if(!Object.keys(motion).length&&raw.motion)motion=deepClone(raw.motion);
  motion.target=motion.target||raw.target||"motion-studio";
  motion.contractVersion=motion.contractVersion||motion.contract||raw.contractVersion||"motion-studio-template-v1";
  motion.format=motion.format||motion.aspect||fmt;
  motion.canvas=motion.canvas||{};
  motion.canvas.format=motion.canvas.format||fmt;
  motion.canvas.w=motion.canvas.w||motion.canvas.width||w;
  motion.canvas.h=motion.canvas.h||motion.canvas.height||h;
  motion.canvas.resolution=motion.canvas.resolution||motion.canvas.w+"x"+motion.canvas.h;
  motion.entities=normalizeLegacyMotionEntities(raw);
  motion.roles=motion.roles||{textSlots:motion.entities.text.map(function(x){return x.slot}).filter(Boolean),textRoles:motion.entities.text.map(function(x){return x.role}).filter(Boolean),mediaSlots:motion.entities.media.map(function(x){return x.slot}).filter(Boolean)};
  motion.timeline=motion.timeline||{minFrames:45,recommendedFrames:90,maxFrames:180,flexibleDuration:true,loopSafe:false,allowHold:true};
  motion.ae=motion.ae||{exportReady:true,compWidth:w,compHeight:h,layerStrategy:"html-slide",editableSlots:motion.roles.textSlots||[],mediaSlots:motion.roles.mediaSlots||[],notes:"Prepared for future AE export mapping."};
  var tplId=sanitizeTemplateId(raw.id||raw.tpl||uid("tpl"));
  var tags=collectTemplateTagsFrom(raw);
  return{
    id:tplId,
    tpl:String(raw.tpl||tplId||"").trim()||tplId,
    family:String(raw.family||tplId||"").trim()||tplId,
    group:String(raw.group||"Шаблоны").trim()||"Шаблоны",
    label:String(raw.label||tplId||"Шаблон").trim()||tplId,
    code:String(raw.code||"").trim(),
    icon:String(raw.icon||"▧").trim().slice(0,2)||"▧",
    desc:String(raw.desc||"").trim(),
    kind:raw.kind||"static",
    single:!!raw.single,
    html:html,
    styleSystem:String(raw.styleSystem||"default").trim()||"default",
    batch:raw.batch||null,
    target:raw.target||"motion-studio",
    contractVersion:raw.contractVersion||"motion-studio-template-v1",
    format:fmt,
    canvas:{format:fmt,w:w,h:h,resolution:w+"x"+h,safeArea:canvas.safeArea?deepClone(canvas.safeArea):null},
    designW:w,
    designH:h,
    tags:tags,
    favorite:!!raw.favorite,
    motionStudio:motion
  };
}
function mergeTemplateGallery(systemList,userList){
  var out=systemList.slice();
  userList.forEach(function(t){
    if(t.galleryAfterSourceKey){
      var insertAt=-1;
      for(var i=0;i<out.length;i++){
        if(out[i].sourceKey===t.galleryAfterSourceKey||out[i].galleryAfterSourceKey===t.galleryAfterSourceKey)insertAt=i;
      }
      if(insertAt>=0)out.splice(insertAt+1,0,t);
      else out.push(t);
    }else out.push(t);
  });
  return out;
}
function makeTemplateRecord(raw,opts){
  opts=opts||{};
  var lib=opts.lib||project.templateLibrary||defaultTemplateLibrary();
  var base=normalizeTemplateItem(raw);
  var sourceKind=opts.sourceKind||raw.librarySource||"system";
  var sourceFile=opts.sourceFile||raw.sourceFile||(sourceKind==="user"?(lib.userLibrary&&lib.userLibrary.file)||"templates/user.js":(lib.systemLibrary&&lib.systemLibrary.file)||"templates/librarymotion.js");
  var sourceKey=templateSourceKeyFromParts(sourceKind,sourceFile,base.id);
  var assignment=(lib.internalAssignments&&lib.internalAssignments[sourceKey])||null;
  base.originTemplateId=String(raw.originTemplateId||raw.originalTemplateId||base.id).trim()||base.id;
  base.parentTemplateId=raw.parentTemplateId||null;
  base.galleryAfterSourceKey=raw.galleryAfterSourceKey||null;
  base.librarySource=sourceKind;
  base.sourceFile=sourceFile;
  base.libraryEditable=sourceKind==="user";
  base.sourceKey=sourceKey;
  base.internalGroupId=resolveTemplateInternalGroupId(raw,lib,assignment);
  base.internalStyleId=resolveTemplateInternalStyleId(raw,lib,assignment);
  base.tags=resolveTemplateProjectTags(raw,assignment);
  if(sourceKind==="system"&&!assignment)lib.internalAssignments[sourceKey]={internalGroupId:base.internalGroupId,internalStyleId:base.internalStyleId,templateTags:base.tags.slice()};
  base.defaultTemplateView=normalizeTemplateView(raw.defaultTemplateView||raw.templateView||defaultTemplateView());
  base.defaultTemplateViewMode=normalizeTemplateViewMode(raw.defaultTemplateViewMode||raw.templateViewMode||defaultTemplateViewMode());
  base.defaultTemplateZoom=normalizeTemplateZoom(raw.defaultTemplateZoom||raw.templateZoom||1);
  base.sourceOrder=raw.sourceOrder!=null?+raw.sourceOrder:(opts.index|0)||0;
  base.userTemplate=sourceKind==="user";
  return base;
}
function templateIdSet(list){var set={};(list||[]).forEach(function(t){set[t.id]=1});return set}
function uniqueTemplateId(base,excludeId){
  base=sanitizeTemplateId(base||uid("tpl"));
  var used=templateIdSet(ensureProjectTemplateLibrary().templates.filter(function(t){return t.id!==excludeId}));
  if(!used[base])return base;
  var n=2,candidate=base;
  while(used[candidate])candidate=base+"_"+n++;
  return candidate;
}
function suggestUserTemplateId(baseId){
  baseId=sanitizeTemplateId(baseId||uid("tpl"));
  if(!/_user$|_copy$/i.test(baseId))baseId=baseId+"_user";
  return uniqueTemplateId(baseId,null);
}
function ensureProjectTemplateLibrary(){
  var lib=project.templateLibrary;
  if(!lib||typeof lib!=="object")project.templateLibrary=lib=defaultTemplateLibrary();
  if(!lib.systemLibrary&&!lib.userLibrary&&(Array.isArray(lib.templates)||lib.styleSystems||lib.batches)){
    lib.systemLibrary=defaultTemplateLibrarySection("system","templates/librarymotion.js",false);
    lib.systemLibrary.format=lib.format||lib.systemLibrary.format;
    lib.systemLibrary.libraryType=lib.libraryType||lib.systemLibrary.libraryType;
    lib.systemLibrary.target=lib.target||lib.systemLibrary.target;
    lib.systemLibrary.contractVersion=lib.contractVersion||lib.systemLibrary.contractVersion;
    lib.systemLibrary.styleSystems=deepClone(lib.styleSystems||{});
    lib.systemLibrary.batches=deepClone(lib.batches||{});
    lib.systemLibrary.templates=deepClone(lib.templates||[]);
  }
  lib.systemLibrary=normalizeTemplateLibrarySection(lib.systemLibrary,"system","templates/librarymotion.js",false);
  lib.userLibrary=normalizeTemplateLibrarySection(lib.userLibrary,"user","templates/user.js",true);
  lib.internalGroups=normalizeTemplateRegistry(lib.internalGroups,TEMPLATE_DEFAULT_GROUP_ID,"Общее","tgrp");
  lib.internalStyles=normalizeTemplateRegistry(lib.internalStyles,TEMPLATE_DEFAULT_STYLE_ID,"Базовый","tsty");
  lib.internalAssignments=lib.internalAssignments&&typeof lib.internalAssignments==="object"?lib.internalAssignments:{};
  lib.userSourceCode=String(lib.userSourceCode||"");
  lib.lastUserPersistAt=lib.lastUserPersistAt||null;
  lib.lastUserPersistError=lib.lastUserPersistError||null;
  lib.styleSystems=Object.assign({},lib.systemLibrary.styleSystems||{},lib.userLibrary.styleSystems||{});
  lib.batches=Object.assign({},lib.systemLibrary.batches||{},lib.userLibrary.batches||{});
  var systemList=(lib.systemLibrary.templates||[]).map(function(raw,index){return makeTemplateRecord(raw,{lib:lib,sourceKind:"system",sourceFile:lib.systemLibrary.file,index:index})});
  var userList=(lib.userLibrary.templates||[]).map(function(raw,index){return makeTemplateRecord(raw,{lib:lib,sourceKind:"user",sourceFile:lib.userLibrary.file,index:index})});
  var used={};
  function uniqueInUsed(base){
    base=sanitizeTemplateId(base||uid("tpl"));
    if(!used[base])return base;
    var n=2,candidate=base;
    while(used[candidate])candidate=base+"_"+n++;
    return candidate;
  }
  systemList.forEach(function(t){used[t.id]=1});
  userList.forEach(function(t){
    var old=t.id;
    if(!old||used[old]){
      var baseId=sanitizeTemplateId(old||t.tpl||"tpl");
      if(!/_user$|_copy$/i.test(baseId))baseId=baseId+"_user";
      t.id=uniqueInUsed(baseId);
      if(!t.tpl||t.tpl===old)t.tpl=t.id;
      t.sourceKey=templateSourceKeyFromParts("user",t.sourceFile,t.id);
      if(!t.originTemplateId||t.originTemplateId===old)t.originTemplateId=t.id;
    }
    used[t.id]=1;
  });
  lib.systemLibrary.templates=systemList;
  lib.userLibrary.templates=userList;
  lib.templates=mergeTemplateGallery(systemList,userList);
  return lib;
}
function templateInternalGroups(){return ensureProjectTemplateLibrary().internalGroups||[]}
function templateInternalStyles(){return ensureProjectTemplateLibrary().internalStyles||[]}
function templateInternalGroupName(id){var g=findIn(templateInternalGroups(),id);return g?g.name:"—"}
function templateInternalStyleName(id){var s=findIn(templateInternalStyles(),id);return s?s.name:"—"}
function templateStyleSystems(){return ensureProjectTemplateLibrary().styleSystems||{}}
function templateBatches(){return ensureProjectTemplateLibrary().batches||{}}
function templateTags(){
  return projectTagNames();
}
function templateAspects(){
  var seen={},out=[];
  ensureProjectTemplateLibrary().templates.forEach(function(t){var a=String(t.format||t.aspect||"").trim();if(!a||seen[a])return;seen[a]=1;out.push(a)});
  return out;
}
function visibleTemplateFilter(){
  return{styles:state.templateStyleFilter.slice(),groups:state.templateGroupFilter.slice(),tags:state.templateTagFilter.slice(),aspects:state.templateAspectFilter.slice(),search:state.templateSearch||""};
}
function templateLibrarySection(kind){var lib=ensureProjectTemplateLibrary();return kind==="user"?lib.userLibrary:lib.systemLibrary}
function replaceTemplateLibrarySectionData(manifest,opts){
  opts=opts||{};
  var lib=ensureProjectTemplateLibrary(),kind=opts.sourceKind==="user"?"user":"system",section=templateLibrarySection(kind),src=manifest||{};
  section.file=opts.sourceFile||section.file;
  section.format=src.format||src.libraryType||section.format;
  section.libraryType=src.libraryType||src.format||section.libraryType;
  section.target=src.target||section.target;
  section.contractVersion=src.contractVersion||section.contractVersion;
  section.styleSystems=deepClone(src.styleSystems||{});
  section.batches=deepClone(src.batches||{});
  section.templates=Array.isArray(src.templates)?deepClone(src.templates):[];
  ensureProjectTemplateLibrary();
  return lib;
}
function applyUserLibraryPayload(payload){
  payload=payload||{};
  var lib=ensureProjectTemplateLibrary();
  if(Array.isArray(payload.internalGroups)&&payload.internalGroups.length)lib.internalGroups=normalizeTemplateRegistry(payload.internalGroups,TEMPLATE_DEFAULT_GROUP_ID,"Общее","tgrp");
  if(Array.isArray(payload.internalStyles)&&payload.internalStyles.length)lib.internalStyles=normalizeTemplateRegistry(payload.internalStyles,TEMPLATE_DEFAULT_STYLE_ID,"Базовый","tsty");
  lib.internalAssignments=payload.internalAssignments&&typeof payload.internalAssignments==="object"?deepClone(payload.internalAssignments):{};
  lib.userLibrary.file=payload.file||lib.userLibrary.file||"templates/user.js";
  lib.userLibrary.format=payload.format||lib.userLibrary.format;
  lib.userLibrary.libraryType=payload.libraryType||payload.format||lib.userLibrary.libraryType;
  lib.userLibrary.target=payload.target||lib.userLibrary.target;
  lib.userLibrary.contractVersion=payload.contractVersion||lib.userLibrary.contractVersion;
  lib.userLibrary.styleSystems=deepClone(payload.styleSystems||{});
  lib.userLibrary.batches=deepClone(payload.batches||{});
  lib.userLibrary.templates=Array.isArray(payload.templates)?deepClone(payload.templates):[];
  ensureProjectTemplateLibrary();
  return lib;
}
function templateDefinitionForEditor(template){
  if(!template)return null;
  return{
    id:template.id,
    tpl:template.tpl||template.id,
    family:template.family||template.id,
    group:template.group||"",
    label:template.label||template.tpl||template.id,
    code:template.code||"",
    icon:template.icon||"▧",
    desc:template.desc||"",
    kind:template.kind||"static",
    single:!!template.single,
    html:String(template.html||""),
    styleSystem:String(template.styleSystem||"default"),
    batch:template.batch||null,
    target:template.target||"motion-studio",
    contractVersion:template.contractVersion||"motion-studio-template-v1",
    format:template.format||project.aspect,
    canvas:deepClone(template.canvas||{format:template.format||project.aspect,w:template.designW||1920,h:template.designH||1080,resolution:(template.designW||1920)+"x"+(template.designH||1080)}),
    designW:+template.designW||1920,
    designH:+template.designH||1080,
    tags:ensureStringArray(template.tags),
    favorite:!!template.favorite,
    defaultTemplateView:normalizeTemplateView(template.defaultTemplateView||template.templateView||defaultTemplateView()),
    defaultTemplateViewMode:normalizeTemplateViewMode(template.defaultTemplateViewMode||template.templateViewMode||defaultTemplateViewMode()),
    defaultTemplateZoom:normalizeTemplateZoom(template.defaultTemplateZoom||template.templateZoom||1),
    motionStudio:deepClone(template.motionStudio||{})
  };
}
function templateDefinitionForStorage(template){
  var data=templateDefinitionForEditor(template);
  data.appGroupId=template.internalGroupId||templateInternalGroups()[0].id;
  data.appStyleId=template.internalStyleId||templateInternalStyles()[0].id;
  data.originTemplateId=template.originTemplateId||template.id;
  data.parentTemplateId=template.parentTemplateId||null;
  data.galleryAfterSourceKey=template.galleryAfterSourceKey||null;
  return data;
}
function selectedTemplateRecords(){return ensureProjectTemplateLibrary().templates.filter(function(t){return state.selectedTemplateIds.indexOf(t.id)>=0})}
function findTemplate(id){
  var list=ensureProjectTemplateLibrary().templates||[];
  for(var i=0;i<list.length;i++)if(list[i].id===id||list[i].tpl===id)return list[i];
  return null;
}
function findTemplateBySourceKey(sourceKey){
  var list=ensureProjectTemplateLibrary().templates||[];
  for(var i=0;i<list.length;i++)if(list[i].sourceKey===sourceKey)return list[i];
  return null;
}
function upsertUserTemplateDefinition(definition,opts){
  opts=opts||{};
  var lib=ensureProjectTemplateLibrary(),targetId=opts.targetId||null;
  var normalized=normalizeTemplateItem(definition||{});
  var finalId=uniqueTemplateId(targetId||normalized.id||(definition&&definition.id)||suggestUserTemplateId(normalized.tpl||normalized.id),targetId);
  lib=ensureProjectTemplateLibrary();
  var list=lib.userLibrary.templates;
  if(targetId&&targetId===finalId)finalId=targetId;
  normalized.id=finalId;
  if(!normalized.tpl||normalized.tpl===targetId||normalized.tpl===(definition&&definition.id))normalized.tpl=finalId;
  normalized.originTemplateId=opts.originTemplateId||definition.originTemplateId||finalId;
  normalized.parentTemplateId=opts.parentTemplateId||definition.parentTemplateId||null;
  normalized.galleryAfterSourceKey=opts.galleryAfterSourceKey||definition.galleryAfterSourceKey||null;
  normalized.appGroupId=opts.groupId||definition.appGroupId||definition.internalGroupId||templateInternalGroups()[0].id;
  normalized.appStyleId=opts.styleId||definition.appStyleId||definition.internalStyleId||templateInternalStyles()[0].id;
  var record=templateDefinitionForStorage(makeTemplateRecord(normalized,{lib:lib,sourceKind:"user",sourceFile:lib.userLibrary.file||"templates/user.js"}));
  var ix=-1;
  for(var i=0;i<list.length;i++)if(list[i].id===targetId||list[i].id===record.id){ix=i;break}
  if(ix>=0)list[ix]=record;else list.push(record);
  ensureProjectTemplateLibrary();
  return findTemplate(record.id);
}
function duplicateTemplateToUser(templateOrId,opts){
  opts=opts||{};
  var source=typeof templateOrId==="string"?findTemplate(templateOrId):templateOrId;
  if(!source)return null;
  var copy=templateDefinitionForEditor(source);
  copy.id=suggestUserTemplateId(copy.id||copy.tpl||source.id);
  copy.tpl=copy.id;
  return upsertUserTemplateDefinition(copy,{groupId:opts.groupId||source.internalGroupId,styleId:opts.styleId||source.internalStyleId,originTemplateId:opts.originTemplateId||source.originTemplateId||source.id,parentTemplateId:opts.parentTemplateId||source.id,galleryAfterSourceKey:opts.galleryAfterSourceKey||source.sourceKey});
}
function applyTemplateDefinitionEdits(templateOrId,definition){
  var source=typeof templateOrId==="string"?findTemplate(templateOrId):templateOrId;
  if(!source)return null;
  if(source.librarySource==="user")return upsertUserTemplateDefinition(definition,{targetId:source.id,groupId:source.internalGroupId,styleId:source.internalStyleId,originTemplateId:source.originTemplateId||source.id,parentTemplateId:source.parentTemplateId||null,galleryAfterSourceKey:source.galleryAfterSourceKey||null});
  return upsertUserTemplateDefinition(definition,{groupId:source.internalGroupId,styleId:source.internalStyleId,originTemplateId:source.originTemplateId||source.id,parentTemplateId:source.id,galleryAfterSourceKey:source.sourceKey});
}
function applyTemplateInternalAssignments(templateIds,patch){
  patch=patch||{};
  var lib=ensureProjectTemplateLibrary(),ids=(templateIds||[]).slice();
  ids.forEach(function(id){
    var t=findTemplate(id);if(!t)return;
    if(t.librarySource==="user"){
      for(var i=0;i<lib.userLibrary.templates.length;i++)if(lib.userLibrary.templates[i].id===t.id){
        if(patch.groupId&&findIn(lib.internalGroups,patch.groupId))lib.userLibrary.templates[i].appGroupId=patch.groupId;
        if(patch.styleId&&findIn(lib.internalStyles,patch.styleId))lib.userLibrary.templates[i].appStyleId=patch.styleId;
        if(patch.tags)lib.userLibrary.templates[i].tags=ensureStringArray(patch.tags);
        break;
      }
    }else{
      lib.internalAssignments[t.sourceKey]=lib.internalAssignments[t.sourceKey]||{};
      if(patch.groupId&&findIn(lib.internalGroups,patch.groupId))lib.internalAssignments[t.sourceKey].internalGroupId=patch.groupId;
      if(patch.styleId&&findIn(lib.internalStyles,patch.styleId))lib.internalAssignments[t.sourceKey].internalStyleId=patch.styleId;
      if(patch.tags)lib.internalAssignments[t.sourceKey].templateTags=ensureStringArray(patch.tags);
    }
  });
  ensureProjectTemplateLibrary();
  return selectedTemplateRecords();
}
function applyTemplateProjectTag(templateId,tagName,on){
  var t=findTemplate(templateId);if(!t)return null;
  var next=ensureStringArray(t.tags),i=next.indexOf(tagName);
  if(on&&i<0)next.push(tagName);
  if(!on&&i>=0)next.splice(i,1);
  return applyTemplateInternalAssignments([templateId],{tags:next});
}
function deleteUserTemplates(templateIds){
  var lib=ensureProjectTemplateLibrary(),ids=(templateIds||[]).slice(),removed=[];
  lib.userLibrary.templates=lib.userLibrary.templates.filter(function(t){
    var drop=ids.indexOf(t.id)>=0;
    if(drop)removed.push(t.id);
    return !drop;
  });
  if(state.activeTemplateId&&removed.indexOf(state.activeTemplateId)>=0)state.activeTemplateId=null;
  state.selectedTemplateIds=(state.selectedTemplateIds||[]).filter(function(id){return removed.indexOf(id)<0});
  ensureProjectTemplateLibrary();
  if(!state.activeTemplateId&&ensureProjectTemplateLibrary().templates.length)state.activeTemplateId=ensureProjectTemplateLibrary().templates[0].id;
  if(!state.selectedTemplateIds.length&&state.activeTemplateId)state.selectedTemplateIds=[state.activeTemplateId];
  return removed;
}
function addTemplateGroup(name){
  var lib=ensureProjectTemplateLibrary(),id=ensureTemplateRegistryEntry(lib.internalGroups,name,lib.internalGroups[0].id||TEMPLATE_DEFAULT_GROUP_ID,"tgrp");
  ensureProjectTemplateLibrary();
  return findIn(lib.internalGroups,id);
}
function addTemplateStyle(name){
  var lib=ensureProjectTemplateLibrary(),id=ensureTemplateRegistryEntry(lib.internalStyles,name,lib.internalStyles[0].id||TEMPLATE_DEFAULT_STYLE_ID,"tsty");
  ensureProjectTemplateLibrary();
  return findIn(lib.internalStyles,id);
}
function renameTemplateGroup(id,name){var g=findIn(templateInternalGroups(),id);if(g&&String(name||"").trim())g.name=String(name).trim();ensureProjectTemplateLibrary();return g}
function renameTemplateStyle(id,name){var s=findIn(templateInternalStyles(),id);if(s&&String(name||"").trim())s.name=String(name).trim();ensureProjectTemplateLibrary();return s}
function deleteTemplateGroup(id){
  var lib=ensureProjectTemplateLibrary();
  if(id===templateInternalGroups()[0].id)return false;
  lib.internalGroups=lib.internalGroups.filter(function(x){return x.id!==id});
  applyTemplateInternalAssignments(ensureProjectTemplateLibrary().templates.filter(function(t){return t.internalGroupId===id}).map(function(t){return t.id}),{groupId:templateInternalGroups()[0].id});
  Object.keys(lib.internalAssignments).forEach(function(k){if(lib.internalAssignments[k]&&lib.internalAssignments[k].internalGroupId===id)lib.internalAssignments[k].internalGroupId=templateInternalGroups()[0].id});
  ensureProjectTemplateLibrary();
  return true;
}
function deleteTemplateStyle(id){
  var lib=ensureProjectTemplateLibrary();
  if(id===templateInternalStyles()[0].id)return false;
  lib.internalStyles=lib.internalStyles.filter(function(x){return x.id!==id});
  applyTemplateInternalAssignments(ensureProjectTemplateLibrary().templates.filter(function(t){return t.internalStyleId===id}).map(function(t){return t.id}),{styleId:templateInternalStyles()[0].id});
  Object.keys(lib.internalAssignments).forEach(function(k){if(lib.internalAssignments[k]&&lib.internalAssignments[k].internalStyleId===id)lib.internalAssignments[k].internalStyleId=templateInternalStyles()[0].id});
  ensureProjectTemplateLibrary();
  return true;
}
function serializeUserLibraryData(){
  var lib=ensureProjectTemplateLibrary();
  return{format:"pms-user-library-v1",libraryType:"pms-user-library-v1",target:"motion-studio",contractVersion:"motion-studio-template-v1",file:lib.userLibrary.file||"templates/user.js",internalGroups:deepClone(lib.internalGroups||[]),internalStyles:deepClone(lib.internalStyles||[]),internalAssignments:deepClone(lib.internalAssignments||{}),styleSystems:deepClone(lib.userLibrary.styleSystems||{}),batches:deepClone(lib.userLibrary.batches||{}),templates:(lib.userLibrary.templates||[]).map(templateDefinitionForStorage)};
}

var MODE_ORDER=["pano-mon-tl","gal-mon-tl","gal-pano-tl","pano-tl","gal-tl","mon-tl","mon-only"];
var DEFAULT_TL_SEC=30;
var project={
  version:10,fps:30,aspect:"16:9",outW:1920,outH:1080,name:"Untitled",
  timelineFrames:DEFAULT_TL_SEC*30,defaultBlockDur:15,defaultBlockDurUnit:"frames",
  tags:[],folders:[],panoramas:[],flatImages:[],assets:[],blocks:[],overlayBlocks:[],
  designTemplates:[],titlePresets:[],source:defaultSourceState(),templateLibrary:defaultTemplateLibrary(),
  activeFolderId:null,inPoint:null,outPoint:null,
  audio:{name:null,url:null,muted:false},audioBlocks:[]
};
var state={
  G:0,playing:false,mode:"pano-mon-tl",prevMode:"pano-mon-tl",inspOpen:false,inspTab:"project",
  selectedAssetIds:[],selectedBlockIds:[],selectedOverlayIds:[],
  galAnchorId:null,blockAnchorId:null,overlayAnchorId:null,
  galScale:110,splitPct:60,tlZoom:8,
  draggingPano:false,scrubTl:false,resize:null,dragBlock:null,lastTs:0,
  tagFilterRnd:[],assetTagFilter:[],rndBuildMode:"images",rndBuildSource:"all",rndAssetFolderFilter:[],rndAssetTagFilter:[],rndTemplateStyleFilter:[],rndTemplateGroupFilter:[],rndTemplateTagFilter:[],rndTemplateAspectFilter:[],blockSelectionLocked:false,tlHover:null,tlHoverTimer:null,prevX:0,prevY:0,
  draggingFlat:false,flatDragStartX:0,flatDragStartY:0,flatDragOrigX:0.5,flatDragOrigY:0.5,flatHistoryDirty:false,flatWheelCommitTimer:null,
  libraryMode:"assets",templateColumns:2,templateSearch:"",templateStyleFilter:[],templateGroupFilter:[],templateTagFilter:[],templateAspectFilter:[],templateShowTags:false,selectedTemplateIds:[],templateAnchorId:null,activeTemplateId:null,
  templateEdit:{blockId:null,track:"main",selectedSlot:null,selectedNodeSelector:null,dragging:false},
  draw:{on:false,tool:"pencil",size:6,color:"#111111",bgAlpha:0.85,painting:false,undoStack:[]},
  titles:{on:false,mode:null,activeId:null,instanceHtml:null,instance:null,selectedSlot:null,selectedEl:null,designW:1123,designH:794,scale:1},
  monEdit:{dragging:false,startX:0,startY:0,origX:0.5,origY:0.5,blockId:null,track:"main"},
  history:{stack:[],index:-1,max:40,lock:false},capturing:false,audioDrag:null,audioResize:null
};

/* Normalized source helpers */
function ensureProjectSource(){project.source=normalizeSourceState(project.source);return project.source}
function currentSourceType(){return ensureProjectSource().type}
function setCurrentSourceType(type){ensureProjectSource().type=type==="image"?"image":"pano";return ensureProjectSource().type}
function sourcePano(){return ensureProjectSource().pano}
function sourceImage(){return ensureProjectSource().image}
function activePanoId(){return sourcePano().activeId||null}
function activeFlatImageId(){return sourceImage().activeId||null}
function setActivePanoId(id){sourcePano().activeId=id||null;return sourcePano().activeId}
function setActiveFlatImageId(id){sourceImage().activeId=id||null;return sourceImage().activeId}
function setPanoViewState(o){var p=sourcePano();o=o||{};if(o.yaw!=null&&isFinite(+o.yaw))p.yaw=+o.yaw;if(o.pitch!=null&&isFinite(+o.pitch))p.pitch=clamp(+o.pitch,-1.55,1.55);if(o.fov!=null&&isFinite(+o.fov))p.fov=clamp(+o.fov,0.45,1.9);return p}
function setFlatImageViewState(o){var img=sourceImage();o=o||{};if(o.scale!=null&&isFinite(+o.scale)&&+o.scale>0)img.scale=clamp(+o.scale,0.25,12);if(o.posX!=null&&isFinite(+o.posX))img.posX=clamp(+o.posX,0,1);if(o.posY!=null&&isFinite(+o.posY))img.posY=clamp(+o.posY,0,1);return img}
function resetFlatImageViewState(){return setFlatImageViewState({scale:1,posX:0.5,posY:0.5})}
function exportSourceState(){return deepClone(ensureProjectSource())}
function importSourceState(src){project.source=normalizeSourceState(src);return project.source}
function legacySourceStateFromData(data){
  data=data||{};
  if(data.source)return normalizeSourceState(data.source);
  return normalizeSourceState({type:data.sourceType||"pano",pano:{activeId:data.activePanoId||null,yaw:data.panoView&&data.panoView.yaw,pitch:data.panoView&&data.panoView.pitch,fov:data.panoView&&data.panoView.fov},image:{activeId:data.activeFlatImageId||null,scale:data.flatView&&data.flatView.scale,posX:data.flatView&&data.flatView.posX,posY:data.flatView&&data.flatView.posY}});
}
function captureMetaForCurrentSource(){
  var src=ensureProjectSource();
  if(src.type==="image")return{sourceType:"image",flatImageId:src.image.activeId,scale:+src.image.scale.toFixed(4),posX:+src.image.posX.toFixed(4),posY:+src.image.posY.toFixed(4),aspect:project.aspect,outW:project.outW,outH:project.outH,draw:!!state.draw.on,titles:!!state.titles.on};
  return{sourceType:"pano",panoId:src.pano.activeId,yaw:+(src.pano.yaw*RAD).toFixed(4),pitch:+(src.pano.pitch*RAD).toFixed(4),fov:+(src.pano.fov*RAD).toFixed(4),aspect:project.aspect,outW:project.outW,outH:project.outH,draw:!!state.draw.on,titles:!!state.titles.on};
}

/* Core data/model helpers */
function defaultDur(){if(project.defaultBlockDurUnit==="seconds")return Math.max(1,Math.round((+project.defaultBlockDur||0.5)*project.fps));return Math.max(1,project.defaultBlockDur|0||Math.round(project.fps*0.5))}
function timelineFrames(){return Math.max(1,project.timelineFrames|0)}
function contentLength(){var t=0,i;for(i=0;i<project.blocks.length;i++)t+=Math.max(1,project.blocks[i].duration|0);return t}
function blockUsesAbsoluteTimeline(block,track){return track==="overlay"&&!!(block&&(block.titleInstance||block.start!=null))}
function overlayContentLength(){var L=layoutOverlay(),t=0;for(var i=0;i<L.length;i++)t=Math.max(t,L[i].end);return t}
function layoutTrack(arr,track){
  var out=[],s=0,i,b,d,start;
  for(i=0;i<arr.length;i++){
    b=arr[i];d=Math.max(1,b.duration|0);
    if(blockUsesAbsoluteTimeline(b,track)){start=Math.max(0,b.start|0);out.push({block:b,index:i,start:start,end:start+d,duration:d,absolute:true});}
    else{out.push({block:b,index:i,start:s,end:s+d,duration:d,absolute:false});s+=d;}
  }
  return out;
}
function layout(){return layoutTrack(project.blocks,"main")}
function layoutOverlay(){return layoutTrack(project.overlayBlocks,"overlay")}
function activeItemsAtG(G,track){var L=track==="overlay"?layoutOverlay():layout(),out=[];if(G<0)G=0;for(var i=0;i<L.length;i++)if(!L[i].block.hidden&&G>=L[i].start&&G<L[i].end)out.push(L[i]);return out}
function blockAtG(G,track){var L=activeItemsAtG(G,track);if(!L.length)return null;return track==="overlay"?L[L.length-1]:L[0]}
function findIn(arr,id){for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];return null}
function findIndexIn(arr,id){for(var i=0;i<arr.length;i++)if(arr[i].id===id)return i;return -1}
function findBlock(id){return findIn(project.blocks,id)}
function findBlockIndex(id){return findIndexIn(project.blocks,id)}
function findOverlay(id){return findIn(project.overlayBlocks,id)}
function findAsset(id){return findIn(project.assets,id)}
function findPano(id){return findIn(project.panoramas,id)}
function findTag(id){return findIn(project.tags,id)}
function selectedBlocks(){return project.blocks.filter(function(b){return state.selectedBlockIds.indexOf(b.id)>=0})}
function primaryBlock(){return state.selectedBlockIds.length?findBlock(state.selectedBlockIds[state.selectedBlockIds.length-1]):null}
function primaryOverlay(){return state.selectedOverlayIds.length?findOverlay(state.selectedOverlayIds[state.selectedOverlayIds.length-1]):null}
function primaryAsset(){return state.selectedAssetIds.length?findAsset(state.selectedAssetIds[state.selectedAssetIds.length-1]):null}
function activeTemplateRecord(){return state.activeTemplateId?findTemplate(state.activeTemplateId):null}
function editingBlock(){var b=primaryBlock();if(b)return{block:b,track:"main"};b=primaryOverlay();if(b)return{block:b,track:"overlay"};var m=blockAtG(state.G,"main");if(m)return{block:m.block,track:"main"};var o=blockAtG(state.G,"overlay");if(o)return{block:o.block,track:"overlay"};return null}
function rangeSelectIds(list,a,t){var ai=list.indexOf(a),ti=list.indexOf(t);if(ti<0)return[t];if(ai<0)return[t];return list.slice(Math.min(ai,ti),Math.max(ai,ti)+1)}
function ensureAssetFolderState(a){
  if(!a)return a;
  if(!Array.isArray(a.folderIds))a.folderIds=a.folderId?[a.folderId]:[];
  a.folderIds=ensureStringArray(a.folderIds);
  a.folderId=a.folderIds[0]||null;
  if(a.rootVisible==null)a.rootVisible=!a.folderIds.length;
  a.rootVisible=!!a.rootVisible;
  return a;
}
function assetFolderIds(a){return ensureAssetFolderState(a)&&a.folderIds?a.folderIds.slice():[]}
function assetVisibleInRoot(a){a=ensureAssetFolderState(a);return !!(a&&a.rootVisible)}
function assetInFolder(a,folderId){a=ensureAssetFolderState(a);return !!(a&&folderId&&a.folderIds.indexOf(folderId)>=0)}
function assetMatchesTagFilter(a,tagIds){a=ensureAssetFolderState(a);tagIds=tagIds||[];if(!tagIds.length)return true;for(var i=0;i<tagIds.length;i++)if((a.tagIds||[]).indexOf(tagIds[i])>=0)return true;return false}
function setAssetFolderState(a,folderIds,rootVisible){
  if(!a)return a;
  a.folderIds=ensureStringArray(folderIds);
  a.folderId=a.folderIds[0]||null;
  a.rootVisible=!!rootVisible;
  return a;
}
function makeAsset(o){o=o||{};return ensureAssetFolderState({id:o.id||uid("a"),name:o.name||"image",folderId:o.folderId||null,folderIds:Array.isArray(o.folderIds)?o.folderIds.slice():(o.folderId?[o.folderId]:[]),rootVisible:o.rootVisible!=null?!!o.rootVisible:(o.folderId?false:true),tagIds:(o.tagIds||[]).slice(),source:o.source||"import",url:o.url||null,img:o.img||null,w:o.w||0,h:o.h||0,linkGroup:o.linkGroup||null,captureMeta:o.captureMeta||null,hasAlpha:!!o.hasAlpha})}
function framesToLabel(f){f=Math.max(0,Math.floor(f));var fps=Math.max(1,project.fps|0),sec=Math.floor(f/fps),fr=f%fps,m=Math.floor(sec/60),s=sec%60;if(m>0)return m+":"+String(s).padStart(2,"0")+":"+String(fr).padStart(2,"0");return s+"s "+fr+"f"}
function setTimelineSec(sec){sec=Math.max(0.1,+sec||DEFAULT_TL_SEC);project.timelineFrames=Math.max(1,Math.round(sec*project.fps));var c=Math.max(contentLength(),overlayContentLength());(project.audioBlocks||[]).forEach(function(a){c=Math.max(c,(a.start|0)+(a.duration|0))});if(project.timelineFrames<c)project.timelineFrames=c;ensureG()}
function ensureContentFitsTL(){var c=Math.max(contentLength(),overlayContentLength());(project.audioBlocks||[]).forEach(function(a){c=Math.max(c,(a.start|0)+(a.duration|0))});if(c>timelineFrames())project.timelineFrames=c}
function setBlockDuration(id,frames,track){var b=track==="overlay"?findOverlay(id):findBlock(id);if(!b)return;b.duration=Math.max(1,frames|0);ensureContentFitsTL();ensureG()}
function blockIsTemplate(b){return !!(b&&b.kind==="template"&&b.templateId)}
function blockIsAsset(b){return !blockIsTemplate(b)}
function templateBlockName(b){
  if(!blockIsTemplate(b))return"";
  var meta=b.templateMeta||{},t=findTemplate(b.templateId);
  return meta.label||meta.code||meta.tpl||(t&&(t.label||t.code||t.tpl))||"template";
}
function makeBlock(assetId,extra){
  extra=extra||{};
  var kind=extra.kind||"asset";
  return{id:extra.id||uid("b"),kind:kind,assetId:kind==="asset"?assetId:null,templateId:kind==="template"?(extra.templateId||null):null,templateHtml:kind==="template"?String(extra.templateHtml||""):null,templateMeta:kind==="template"?deepClone(extra.templateMeta||{}):null,templateSlots:kind==="template"?deepClone(extra.templateSlots||{}):{},templateFolderId:kind==="template"?(extra.templateFolderId||null):null,templateFolderIds:kind==="template"?ensureStringArray(extra.templateFolderIds||(extra.templateFolderId?[extra.templateFolderId]:[])):[],templateTagIds:kind==="template"?ensureStringArray(extra.templateTagIds):[],templateSelectedSlot:kind==="template"?(extra.templateSelectedSlot||null):null,templateView:kind==="template"?normalizeTemplateView(extra.templateView):defaultTemplateView(),templateViewMode:kind==="template"?normalizeTemplateViewMode(extra.templateViewMode):defaultTemplateViewMode(),templateZoom:kind==="template"?normalizeTemplateZoom(extra.templateZoom):1,duration:extra.duration!=null?Math.max(1,extra.duration|0):defaultDur(),start:extra.start!=null?Math.max(0,extra.start|0):null,titleInstance:!!extra.titleInstance,fit:extra.fit||"cover",scale:extra.scale!=null?+extra.scale:1,posX:extra.posX!=null?+extra.posX:0.5,posY:extra.posY!=null?+extra.posY:0.5,fixed:!!extra.fixed,anim:extra.anim||"none",animSpeed:extra.animSpeed!=null?+extra.animSpeed:1,hidden:!!extra.hidden,layer:extra.layer||"main"};
}
function makeTemplateBlock(templateId,extra){
  extra=extra||{};
  var t=findTemplate(templateId);if(!t)return null;
  return makeBlock(null,{id:extra.id,duration:extra.duration,start:extra.start,titleInstance:!!extra.titleInstance,fit:"contain",scale:1,posX:extra.posX!=null?extra.posX:0.5,posY:extra.posY!=null?extra.posY:0.5,fixed:!!extra.fixed,anim:"none",animSpeed:1,hidden:!!extra.hidden,layer:extra.layer||"main",kind:"template",templateId:t.id,templateHtml:String(extra.templateHtml||t.html||""),templateMeta:deepClone(extra.templateMeta||{tpl:t.tpl,label:t.label,code:t.code,group:t.group,styleSystem:t.styleSystem,tags:ensureStringArray(t.tags),format:t.format,designW:t.designW,designH:t.designH,motionStudio:deepClone(t.motionStudio||{}),librarySource:t.librarySource,sourceFile:t.sourceFile,internalGroupId:t.internalGroupId,internalStyleId:t.internalStyleId}),templateSlots:deepClone(extra.templateSlots||parseTemplateMediaSlots(extra.templateHtml||t.html||"")),templateFolderId:extra.templateFolderId||null,templateFolderIds:ensureStringArray(extra.templateFolderIds||(extra.templateFolderId?[extra.templateFolderId]:[])),templateTagIds:ensureStringArray(extra.templateTagIds),templateSelectedSlot:extra.templateSelectedSlot||null,templateView:normalizeTemplateView(extra.templateView||t.defaultTemplateView),templateViewMode:normalizeTemplateViewMode(extra.templateViewMode||t.defaultTemplateViewMode),templateZoom:normalizeTemplateZoom(extra.templateZoom||t.defaultTemplateZoom||1)});
}
function convertBlockToAsset(block,assetId){
  if(!block)return block;
  block.kind="asset";block.assetId=assetId||null;block.templateId=null;block.templateHtml=null;block.templateMeta=null;block.templateSlots={};block.templateFolderId=null;block.templateFolderIds=[];block.templateTagIds=[];block.templateSelectedSlot=null;block.templateView=defaultTemplateView();block.templateViewMode=defaultTemplateViewMode();block.templateZoom=1;
  return block;
}
function convertBlockToTemplate(block,templateId){
  if(!block)return null;
  var created=makeTemplateBlock(templateId,{id:block.id,duration:block.duration,start:block.start,titleInstance:block.titleInstance,posX:block.posX,posY:block.posY,layer:block.layer,fixed:block.fixed,hidden:block.hidden,templateViewMode:block.templateViewMode,templateZoom:block.templateZoom});
  if(!created)return null;
  block.kind=created.kind;block.assetId=null;block.templateId=created.templateId;block.templateHtml=created.templateHtml;block.templateMeta=created.templateMeta;block.templateSlots=created.templateSlots;block.templateFolderId=created.templateFolderId;block.templateFolderIds=created.templateFolderIds;block.templateTagIds=created.templateTagIds;block.templateSelectedSlot=created.templateSelectedSlot;block.templateView=created.templateView;block.templateViewMode=created.templateViewMode;block.templateZoom=created.templateZoom;block.fit=created.fit;block.scale=created.scale;block.posX=created.posX;block.posY=created.posY;block.anim=created.anim;block.animSpeed=created.animSpeed;
  return block;
}
function insertBlocks(assetIds,atIndex,track){var arr=track==="overlay"?project.overlayBlocks:project.blocks;atIndex=clamp(atIndex|0,0,arr.length);var newIds=[];assetIds.forEach(function(aid,i){var bl=makeBlock(aid,{layer:track==="overlay"?"overlay":"main"});arr.splice(atIndex+i,0,bl);newIds.push(bl.id)});ensureContentFitsTL();return newIds}
function insertTemplateBlocks(templateIds,atIndex,track){var arr=track==="overlay"?project.overlayBlocks:project.blocks;atIndex=clamp(atIndex|0,0,arr.length);var newIds=[];templateIds.forEach(function(tid,i){var bl=makeTemplateBlock(tid,{layer:track==="overlay"?"overlay":"main"});if(!bl)return;arr.splice(atIndex+i,0,bl);newIds.push(bl.id)});ensureContentFitsTL();return newIds}
function replaceBlockAsset(blockId,assetId){var b=findBlock(blockId)||findOverlay(blockId);if(b)convertBlockToAsset(b,assetId)}
function replaceBlockTemplate(blockId,templateId){
  if(typeof replaceTemplateBlockKeepingAssignments==="function")return replaceTemplateBlockKeepingAssignments(blockId,templateId);
  var b=findBlock(blockId)||findOverlay(blockId);if(!b)return null;return convertBlockToTemplate(b,templateId)
}
function insertAfterSelectedOrEnd(assetIds){var pb=primaryBlock();return insertBlocks(assetIds,pb?findBlockIndex(pb.id)+1:project.blocks.length,"main")}
function insertTemplateAfterSelectedOrEnd(templateIds){var pb=primaryBlock();return insertTemplateBlocks(templateIds,pb?findBlockIndex(pb.id)+1:project.blocks.length,"main")}
function swapSelectedBlocks(){if(state.selectedBlockIds.length!==2){alert("Выдели 2 блока");return}pushHistory();var i=findBlockIndex(state.selectedBlockIds[0]),j=findBlockIndex(state.selectedBlockIds[1]);if(i<0||j<0)return;var t=project.blocks[i];project.blocks[i]=project.blocks[j];project.blocks[j]=t;renderUI(true)}
function currentRndAssetTagIds(){return ensureStringArray((state.rndAssetTagFilter&&state.rndAssetTagFilter.length)?state.rndAssetTagFilter:state.tagFilterRnd)}
function currentRndAssetFolderIds(){return ensureStringArray(state.rndAssetFolderFilter)}
function currentRndTemplateTagNames(){
  return ensureStringArray(state.rndTemplateTagFilter).map(function(tag){var found=findTag(tag);return found?found.name:tag}).filter(Boolean);
}
function assetMatchesFolderFilter(a,folderIds){
  a=ensureAssetFolderState(a);folderIds=ensureStringArray(folderIds);
  if(!folderIds.length)return true;
  for(var i=0;i<folderIds.length;i++){
    var fid=folderIds[i];
    if(fid==="root"?assetVisibleInRoot(a):assetInFolder(a,fid))return true;
  }
  return false;
}
function assetMatchesRndFilters(a,folderIds,tagIds){
  return !!(a&&a.img&&assetMatchesFolderFilter(a,folderIds)&&assetMatchesTagFilter(a,tagIds));
}
function poolByTags(tagIds){tagIds=tagIds||[];return project.assets.filter(function(a){return !!(a&&a.img&&assetMatchesTagFilter(a,tagIds))})}
function poolAssetsByFilters(folderIds,tagIds){
  folderIds=ensureStringArray(folderIds);tagIds=ensureStringArray(tagIds);
  return project.assets.filter(function(a){return assetMatchesRndFilters(a,folderIds,tagIds)});
}
function templateMatchesRndFilters(t,filters){
  filters=filters||{};
  if((filters.styles||[]).length&&filters.styles.indexOf(String(t.internalStyleId||""))<0)return false;
  if((filters.groups||[]).length&&filters.groups.indexOf(String(t.internalGroupId||""))<0)return false;
  if((filters.tags||[]).length){
    var tags=ensureStringArray(t.tags),ok=false;
    for(var i=0;i<filters.tags.length;i++)if(tags.indexOf(filters.tags[i])>=0){ok=true;break}
    if(!ok)return false;
  }
  if((filters.aspects||[]).length&&filters.aspects.indexOf(String(t.format||t.aspect||""))<0)return false;
  return true;
}
function currentRndTemplateFilters(){
  return{styles:ensureStringArray(state.rndTemplateStyleFilter),groups:ensureStringArray(state.rndTemplateGroupFilter),tags:currentRndTemplateTagNames(),aspects:ensureStringArray(state.rndTemplateAspectFilter)};
}
function assetPoolForScope(scope,opts){
  scope=scope||state.rndBuildSource||"all";opts=opts||{};
  var folderIds=opts.folderIds!=null?ensureStringArray(opts.folderIds):currentRndAssetFolderIds();
  var tagIds=opts.tagIds!=null?ensureStringArray(opts.tagIds):currentRndAssetTagIds();
  if(scope==="selected")return project.assets.filter(function(a){return state.selectedAssetIds.indexOf(a.id)>=0&&assetMatchesRndFilters(a,folderIds,tagIds)});
  if(scope==="filtered")return (typeof assetsVisible==="function"?assetsVisible():project.assets).filter(function(a){return assetMatchesRndFilters(a,folderIds,tagIds)});
  return poolAssetsByFilters(folderIds,tagIds);
}
function templatePoolForScope(scope,opts){
  scope=scope||state.rndBuildSource||"all";opts=opts||{};
  var filters=opts.filters||currentRndTemplateFilters();
  if(scope==="selected")return selectedTemplateRecords().filter(function(t){return templateMatchesRndFilters(t,filters)});
  if(scope==="filtered"&&typeof visibleTemplates==="function")return visibleTemplates().filter(function(t){return templateMatchesRndFilters(t,filters)});
  return ensureProjectTemplateLibrary().templates.filter(function(t){return templateMatchesRndFilters(t,filters)});
}
function pickRandomFromPool(pool,used){
  pool=(pool||[]).filter(Boolean);if(!pool.length)return null;
  var choices=pool.filter(function(x){return !used||!used[x.id]});
  if(!choices.length)choices=pool.slice();
  var pick=choices[Math.floor(Math.random()*choices.length)]||null;
  if(pick&&used)used[pick.id]=true;
  return pick;
}
function randomizeAssetBlocks(blocks,tagIds,push,opts){
  opts=opts||{};
  blocks=(blocks||[]).filter(function(b){return b&&!b.fixed&&!blockIsTemplate(b)});
  var folderIds=opts.folderIds!=null?ensureStringArray(opts.folderIds):currentRndAssetFolderIds();
  var effectiveTagIds=tagIds!=null?ensureStringArray(tagIds):(opts.tagIds!=null?ensureStringArray(opts.tagIds):currentRndAssetTagIds());
  var pool=assetPoolForScope(opts.scope||state.rndBuildSource,{folderIds:folderIds,tagIds:effectiveTagIds});
  if(!pool.length){if(!opts.silent)alert("Пул картинок пуст");return false}
  if(push!==false)pushHistory();
  var used={},done=false;
  blocks.forEach(function(b){var pick=pickRandomFromPool(pool,used);if(!pick)return;convertBlockToAsset(b,pick.id);b.scale=1;b.posX=0.5;b.posY=0.5;b.fit="cover";b.anim="none";b.animSpeed=1;done=true});
  return done;
}
function randomizeTemplateBlocksWithProjectFilters(blocks,opts){
  opts=opts||{};
  blocks=(blocks||[]).filter(function(b){return b&&!b.fixed&&blockIsTemplate(b)});
  var pool=templatePoolForScope(opts.scope||state.rndBuildSource,{filters:opts.filters||currentRndTemplateFilters()});
  if(!pool.length){if(!opts.silent)alert("Пул шаблонов пуст");return false}
  if(opts.pushHistory!==false)pushHistory();
  var used={},done=false;
  blocks.forEach(function(block){
    var tpl=pickRandomFromPool(pool,used);if(!tpl)return;
    replaceBlockTemplate(block.id,tpl.id);
    if(typeof randomizeTemplateBlock==='function')randomizeTemplateBlock(block,{silent:true});
    done=true;
  });
  return done;
}
function rndBlocks(blocks,tagIds){return randomizeAssetBlocks(blocks,tagIds,true)}
function rebuildProjectRnd(n,dur,mode,scope){
  n=Math.max(1,n|0);dur=Math.max(1,dur|0);mode=mode||state.rndBuildMode||"images";scope=scope||state.rndBuildSource||"all";
  var assetPool=assetPoolForScope(scope),templatePool=templatePoolForScope(scope),fixed=project.blocks.filter(function(b){return b.fixed}),usedAssets={},usedTemplates={};
  if(mode!=="templates"&&!assetPool.length){alert("Пул картинок пуст");return false}
  if(mode!=="images"&&!templatePool.length){alert("Пул шаблонов пуст");return false}
  pushHistory();
  project.blocks=[];
  for(var i=0;i<n;i++){
    var fixedSrc=fixed[i],block;
    if(fixedSrc){block=deepClone(fixedSrc);block.id=uid('b');block.duration=dur;project.blocks.push(block);continue}
    var choiceMode=mode;
    if(mode==="mixed")choiceMode=(assetPool.length&&templatePool.length)?(Math.random()<0.5?"images":"templates"):(assetPool.length?"images":"templates");
    if(choiceMode==="templates"){
      var tpl=pickRandomFromPool(templatePool,usedTemplates);if(!tpl)continue;
      block=makeTemplateBlock(tpl.id,{duration:dur});
      if(block&&typeof randomizeTemplateBlock==='function')randomizeTemplateBlock(block,{silent:true});
    }else{
      var asset=pickRandomFromPool(assetPool,usedAssets);if(!asset)continue;
      block=makeBlock(asset.id,{duration:dur});
      block.scale=1;block.posX=0.5;block.posY=0.5;block.fit="cover";block.anim="none";block.animSpeed=1;
    }
    if(block)project.blocks.push(block);
  }
  ensureContentFitsTL();state.selectedBlockIds=[];state.selectedOverlayIds=[];state.G=0;
  return true;
}
function rndRebuild(n,dur){return rebuildProjectRnd(n,dur,state.rndBuildMode||"images",state.rndBuildSource||"all")}

/* Shared file/data helpers */
function fileToDataURL(url){if(!url)return Promise.resolve(null);return fetch(url).then(function(r){return r.blob()}).then(function(blob){return new Promise(function(resolve,reject){var fr=new FileReader();fr.onload=function(){resolve(fr.result)};fr.onerror=reject;fr.readAsDataURL(blob)})})}
function dataURLToImage(data,name){return new Promise(function(resolve,reject){if(!data){resolve(null);return}var parts=data.split(','),mime=((parts[0].match(/data:([^;]+)/)||[])[1])||"image/png";var raw=atob(parts[1]||""),u8=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);var url=URL.createObjectURL(new Blob([u8],{type:mime})),img=new Image();img.onload=function(){resolve({url:url,img:img,w:img.naturalWidth,h:img.naturalHeight,name:name||"image"})};img.onerror=function(){URL.revokeObjectURL(url);reject(new Error("image"))};img.src=url;})}
function dataURLToURL(data){if(!data)return Promise.resolve(null);var parts=data.split(','),mime=((parts[0].match(/data:([^;]+)/)||[])[1])||"application/octet-stream";var raw=atob(parts[1]||""),u8=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);return Promise.resolve(URL.createObjectURL(new Blob([u8],{type:mime})))}

ensureProjectTemplateLibrary();

PMS.registerModule("core.state",{
  project:project,
  state:state,
  utils:{clamp:clamp,lerp:lerp,uid:uid,byId:$,aspectRatio:aspectRatio,downloadText:downloadText,esc:esc,escAE:escAE,randColor:randColor,deepClone:deepClone},
  source:{defaultSourceState:defaultSourceState,normalizeSourceState:normalizeSourceState,ensureProjectSource:ensureProjectSource,currentSourceType:currentSourceType,setCurrentSourceType:setCurrentSourceType,sourcePano:sourcePano,sourceImage:sourceImage,activePanoId:activePanoId,activeFlatImageId:activeFlatImageId,setActivePanoId:setActivePanoId,setActiveFlatImageId:setActiveFlatImageId,setPanoViewState:setPanoViewState,setFlatImageViewState:setFlatImageViewState,resetFlatImageViewState:resetFlatImageViewState,exportSourceState:exportSourceState,importSourceState:importSourceState,legacySourceStateFromData:legacySourceStateFromData,captureMetaForCurrentSource:captureMetaForCurrentSource},
  templates:{defaultTemplateLibrarySection:defaultTemplateLibrarySection,defaultTemplateLibrary:defaultTemplateLibrary,defaultUserLibraryPayload:defaultUserLibraryPayload,ensureProjectTemplateLibrary:ensureProjectTemplateLibrary,normalizeTemplateItem:normalizeTemplateItem,collectTemplateTagsFrom:collectTemplateTagsFrom,buildTemplateHtmlSource:buildTemplateHtmlSource,normalizeLegacyMotionEntities:normalizeLegacyMotionEntities,parseTemplateMediaSlots:parseTemplateMediaSlots,defaultTemplateView:defaultTemplateView,normalizeTemplateView:normalizeTemplateView,defaultTemplateViewMode:defaultTemplateViewMode,normalizeTemplateViewMode:normalizeTemplateViewMode,normalizeTemplateZoom:normalizeTemplateZoom,projectTagNames:projectTagNames,resolveTemplateProjectTags:resolveTemplateProjectTags,templateBlockFolderIds:templateBlockFolderIds,templateSourceKeyFromParts:templateSourceKeyFromParts,templateStyleSystems:templateStyleSystems,templateInternalGroups:templateInternalGroups,templateInternalStyles:templateInternalStyles,templateInternalGroupName:templateInternalGroupName,templateInternalStyleName:templateInternalStyleName,templateTags:templateTags,templateAspects:templateAspects,visibleTemplateFilter:visibleTemplateFilter,replaceTemplateLibrarySectionData:replaceTemplateLibrarySectionData,applyUserLibraryPayload:applyUserLibraryPayload,serializeUserLibraryData:serializeUserLibraryData,templateDefinitionForEditor:templateDefinitionForEditor,templateDefinitionForStorage:templateDefinitionForStorage,selectedTemplateRecords:selectedTemplateRecords,findTemplate:findTemplate,findTemplateBySourceKey:findTemplateBySourceKey,blockIsTemplate:blockIsTemplate,blockIsAsset:blockIsAsset,templateBlockName:templateBlockName,makeTemplateBlock:makeTemplateBlock,convertBlockToAsset:convertBlockToAsset,convertBlockToTemplate:convertBlockToTemplate,insertTemplateBlocks:insertTemplateBlocks,replaceBlockTemplate:replaceBlockTemplate,insertTemplateAfterSelectedOrEnd:insertTemplateAfterSelectedOrEnd,activeTemplateRecord:activeTemplateRecord,uniqueTemplateId:uniqueTemplateId,suggestUserTemplateId:suggestUserTemplateId,duplicateTemplateToUser:duplicateTemplateToUser,applyTemplateDefinitionEdits:applyTemplateDefinitionEdits,applyTemplateInternalAssignments:applyTemplateInternalAssignments,applyTemplateProjectTag:applyTemplateProjectTag,deleteUserTemplates:deleteUserTemplates,addTemplateGroup:addTemplateGroup,addTemplateStyle:addTemplateStyle,renameTemplateGroup:renameTemplateGroup,renameTemplateStyle:renameTemplateStyle,deleteTemplateGroup:deleteTemplateGroup,deleteTemplateStyle:deleteTemplateStyle,upsertUserTemplateDefinition:upsertUserTemplateDefinition},
  model:{defaultDur:defaultDur,timelineFrames:timelineFrames,contentLength:contentLength,overlayContentLength:overlayContentLength,blockUsesAbsoluteTimeline:blockUsesAbsoluteTimeline,layoutTrack:layoutTrack,layout:layout,layoutOverlay:layoutOverlay,activeItemsAtG:activeItemsAtG,blockAtG:blockAtG,findBlock:findBlock,findOverlay:findOverlay,findAsset:findAsset,findPano:findPano,findTag:findTag,selectedBlocks:selectedBlocks,primaryBlock:primaryBlock,primaryOverlay:primaryOverlay,primaryAsset:primaryAsset,editingBlock:editingBlock,rangeSelectIds:rangeSelectIds,makeAsset:makeAsset,ensureAssetFolderState:ensureAssetFolderState,assetFolderIds:assetFolderIds,assetVisibleInRoot:assetVisibleInRoot,assetInFolder:assetInFolder,assetMatchesTagFilter:assetMatchesTagFilter,setAssetFolderState:setAssetFolderState,makeBlock:makeBlock,framesToLabel:framesToLabel,setTimelineSec:setTimelineSec,ensureContentFitsTL:ensureContentFitsTL,setBlockDuration:setBlockDuration,insertBlocks:insertBlocks,replaceBlockAsset:replaceBlockAsset,insertAfterSelectedOrEnd:insertAfterSelectedOrEnd,swapSelectedBlocks:swapSelectedBlocks,currentRndAssetTagIds:currentRndAssetTagIds,currentRndAssetFolderIds:currentRndAssetFolderIds,currentRndTemplateTagNames:currentRndTemplateTagNames,currentRndTemplateFilters:currentRndTemplateFilters,assetMatchesFolderFilter:assetMatchesFolderFilter,assetMatchesRndFilters:assetMatchesRndFilters,poolByTags:poolByTags,poolAssetsByFilters:poolAssetsByFilters,templateMatchesRndFilters:templateMatchesRndFilters,assetPoolForScope:assetPoolForScope,templatePoolForScope:templatePoolForScope,pickRandomFromPool:pickRandomFromPool,randomizeAssetBlocks:randomizeAssetBlocks,randomizeTemplateBlocksWithProjectFilters:randomizeTemplateBlocksWithProjectFilters,rndBlocks:rndBlocks,rebuildProjectRnd:rebuildProjectRnd,rndRebuild:rndRebuild},
  io:{fileToDataURL:fileToDataURL,dataURLToImage:dataURLToImage,dataURLToURL:dataURLToURL}
});
