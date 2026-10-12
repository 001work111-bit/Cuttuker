"use strict";

/* Stage 3: design import + Motion Studio template-library normalization. */

function projectCanvasSize(){
  var w=Math.max(16,project.outW|0||1920),h=Math.max(16,project.outH|0||1080),ar=aspectRatio(project.aspect);
  h=Math.max(16,Math.round(w/ar));
  return{w:w,h:h,ar:ar};
}
function parseDesignSizeFromHtml(html){
  var m=String(html||"").match(/width\s*:\s*(\d+)px[\s\S]*?height\s*:\s*(\d+)px/i)||String(html||"").match(/height\s*:\s*(\d+)px[\s\S]*?width\s*:\s*(\d+)px/i);
  if(m){
    var a=+m[1],b=+m[2];
    if(/width\s*:\s*\d+px[\s\S]*?height/i.test(html))return{w:a,h:b};
    return{w:b,h:a};
  }
  return null;
}
function normalizeOneDesignTpl(item,fallbackName){
  if(!item)return null;
  if(item.html){
    var parsed=parseDesignSizeFromHtml(item.html)||{w:item.designW||item.width||1123,h:item.designH||item.height||794};
    return{id:uid("dt"),source:"design-constructor",type:"html-slide",tpl:item.tpl||uid("tpl"),family:item.family||"",group:item.group||"Шаблоны",label:item.label||item.tpl||fallbackName||"Шаблон",code:item.code||"",icon:item.icon||"⧉",kind:item.kind||"static",desc:item.desc||"",designW:+parsed.w||1123,designH:+parsed.h||794,html:String(item.html)};
  }
  return null;
}
function normalizeLegacyTitles(raw,name){
  var blocks=[],src=raw;
  if(Array.isArray(raw))src={blocks:raw};
  if(raw&&raw.blocks)src=raw;
  if(raw&&raw.elements)src={blocks:raw.elements};
  var list=(src&&src.blocks)||[];
  if(!Array.isArray(list))list=[];
  list.forEach(function(el,i){
    var text=el.text!=null?String(el.text):(el.content!=null?String(el.content):"Text "+(i+1));
    var x=el.x!=null?+el.x:0.1,y=el.y!=null?+el.y:0.1;if(x>1)x/=100;if(y>1)y/=100;
    var w=el.w!=null?+el.w:0.8,h=el.h!=null?+el.h:0.12;if(w>1)w/=100;if(h>1)h/=100;
    blocks.push({id:el.id||uid("tb"),text:text,x:clamp(x,0,1),y:clamp(y,0,1),w:clamp(w,.05,1),h:clamp(h,.02,1),fontSize:el.fontSize!=null?+el.fontSize:28,color:el.color||"#fff",fontWeight:el.fontWeight||"600",align:el.align||"left",fontFamily:el.fontFamily||"system-ui,sans-serif",opacity:el.opacity!=null?+el.opacity:1});
  });
  if(!blocks.length)blocks.push({id:uid("tb"),text:name||"Title",x:.1,y:.4,w:.8,h:.15,fontSize:36,color:"#fff",fontWeight:"700",align:"center",fontFamily:"system-ui,sans-serif",opacity:1});
  var pc=projectCanvasSize();
  return{id:uid("tp"),source:"legacy-titles",type:"text-blocks",label:name||"Titles",designW:pc.w,designH:pc.h,blocks:blocks};
}
function normalizeDesignImport(raw,fileName){
  var out=[];
  if(Array.isArray(raw)){
    raw.forEach(function(item,i){
      var d=normalizeOneDesignTpl(item,(fileName||"tpl")+"_"+i);
      if(d)out.push(d);
      else if(item&&(item.blocks||item.elements||item.text))out.push(normalizeLegacyTitles(item,(fileName||"titles")+"_"+i));
    });
    if(!out.length&&raw.length&&raw[0]&&(raw[0].text!=null||raw[0].x!=null))out.push(normalizeLegacyTitles(raw,fileName));
    return out;
  }
  if(raw&&raw.html){var d=normalizeOneDesignTpl(raw,fileName);if(d)out.push(d);return out}
  if(raw&&(raw.blocks||raw.elements||raw.layers)){out.push(normalizeLegacyTitles(raw,fileName));return out}
  return out;
}
function normalizeSandboxLibraryManifest(manifest){
  var src=manifest||{},templates=[];
  if(Array.isArray(src))templates=src;
  else if(Array.isArray(src.templates))templates=src.templates;
  ensureProjectTemplateLibrary();
  return{
    format:src.format||src.libraryType||"motion-studio-library-v1",
    libraryType:src.libraryType||src.format||"motion-studio-library-v1",
    target:src.target||"motion-studio",
    contractVersion:src.contractVersion||"motion-studio-template-v1",
    styleSystems:deepClone(src.styleSystems||{}),
    batches:deepClone(src.batches||{}),
    templates:templates.map(function(item){return normalizeTemplateItem(item)}).filter(function(t){return t&&t.html;})
  };
}
function mergeTemplateLibraryIntoProject(manifest,opts){
  var lib=normalizeSandboxLibraryManifest(manifest);
  replaceTemplateLibrarySectionData(lib,opts||{sourceKind:"system"});
  return ensureProjectTemplateLibrary();
}
function convertMotionTemplateToDesignTemplate(template){
  template=normalizeTemplateItem(template);
  return{id:uid("dt"),source:"motion-studio-template-library",type:"html-slide",tpl:template.tpl||template.id,family:template.family||"",group:template.group||"Шаблоны",label:template.label||template.tpl||template.id,code:template.code||"",icon:template.icon||"▧",kind:template.kind||"static",desc:template.desc||"",designW:+template.designW||1920,designH:+template.designH||1080,html:String(template.html||"")};
}
function templatePreviewScale(designW,designH,boxW,boxH){
  designW=Math.max(1,+designW||1920);designH=Math.max(1,+designH||1080);boxW=Math.max(1,+boxW||320);boxH=Math.max(1,+boxH||180);
  return Math.min(boxW/designW,boxH/designH);
}

var PMS_TemplateLibraryAdapter={
  normalizeDesignImport:normalizeDesignImport,
  normalizeSandboxLibraryManifest:normalizeSandboxLibraryManifest,
  mergeTemplateLibraryIntoProject:mergeTemplateLibraryIntoProject,
  convertMotionTemplateToDesignTemplate:convertMotionTemplateToDesignTemplate,
  templatePreviewScale:templatePreviewScale
};

if(window.PMS&&PMS.registerModule)PMS.registerModule("templates.adapter",PMS_TemplateLibraryAdapter);
