/* Motion Studio template library placeholder.
   Replace this file with Sandbox-generated library.js.
   Current sample uses the validated motion_library_sample.json templates. */
(function(){
  var STYLE_SYSTEMS={
    "default":{name:"Базовый",color:"#8b93a1"}
  };
  var LIB_META={
    libraryType:"motion-studio-library-v1",
    target:"motion-studio",
    contractVersion:"motion-studio-template-v1",
    supportedFormats:["16:9","9:16"],
    canvasContracts:{
      "16:9":{format:"16:9",w:1920,h:1080,safeArea:{x:96,y:54,w:1728,h:972},label:"Landscape"},
      "9:16":{format:"9:16",w:1080,h:1920,safeArea:{x:54,y:96,w:972,h:1728},label:"Portrait"}
    }
  };
  var LIBRARY=[
    {
      tpl:"msHeroSplit169",
      family:"motion-studio-demo",
      group:"Секции",
      label:"Motion Hero Split 16:9",
      code:"MS-169-01",
      icon:"▧",
      desc:"Тестовый шаблон 16:9 для Motion Studio",
      kind:"static",
      single:false,
      html:"<section class=\"sv-section\" style=\"width: 1920px; height: 1080px; position: relative; overflow: hidden; background: linear-gradient(135deg,#0f172a,#1d4ed8); color: rgb(255, 255, 255); font-family: Inter, system-ui, sans-serif; box-sizing: border-box;\" data-ms-root=\"1\"><div style=\"position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(255,255,255,.22),transparent 26%)\"></div><div data-sb-media=\"\" data-kind=\"image\" data-slot=\"heroImage\" style=\"position:absolute;right:110px;top:120px;width:720px;height:840px;border-radius:40px;background:rgba(255,255,255,.15) center/cover no-repeat;box-shadow:0 30px 80px rgba(0,0,0,.28)\"></div><div style=\"position:absolute;left:110px;top:110px;max-width:760px\"><div data-sb-editable=\"\" data-slot=\"eyebrow\" data-role=\"overline\" style=\"font-size:34px;letter-spacing:10px;text-transform:uppercase;opacity:.78\">Motion Studio</div><div data-sb-editable=\"\" data-slot=\"title\" data-role=\"title\" style=\"margin-top:26px;font-size:124px;line-height:.92;font-weight:800\">Template 16:9</div><div data-sb-editable=\"\" data-slot=\"subtitle\" data-role=\"subtitle\" style=\"margin-top:26px;font-size:42px;line-height:1.35;max-width:700px;opacity:.92\">Self-contained sandbox template with exact 1920×1080 canvas and Motion Studio metadata.</div><div data-sb-editable=\"\" data-slot=\"meta\" data-role=\"smallMeta\" style=\"margin-top:34px;font-size:28px;letter-spacing:2px;opacity:.78\">Preview · Library · Motion import</div></div></section>",
      styleSystem:"default",
      format:"16:9",
      designW:1920,
      designH:1080,
      tags:["hero","split","text","image"],
      motionStudio:{
        target:"motion-studio",
        contractVersion:"motion-studio-template-v1",
        format:"16:9",
        canvas:{format:"16:9",w:1920,h:1080,resolution:"1920x1080",safeArea:{x:96,y:54,w:1728,h:972}},
        roles:{textSlots:["eyebrow","title","subtitle","meta"],textRoles:["overline","title","subtitle","smallMeta"],mediaSlots:["heroImage"]},
        timeline:{minFrames:45,recommendedFrames:90,maxFrames:180,flexibleDuration:true,loopSafe:false,allowHold:true},
        ae:{exportReady:true,compWidth:1920,compHeight:1080,layerStrategy:"html-slide",editableSlots:["eyebrow","title","subtitle","meta"],mediaSlots:["heroImage"],notes:"Demo mapping for future AE export"}
      }
    },
    {
      tpl:"msStoryPortrait916",
      family:"motion-studio-demo",
      group:"Обложка проекта",
      label:"Motion Story Portrait 9:16",
      code:"MS-916-01",
      icon:"▥",
      desc:"Тестовый шаблон 9:16 для Motion Studio",
      kind:"static",
      single:false,
      html:"<section class=\"sv-section\" style=\"width: 1080px; height: 1920px; position: relative; overflow: hidden; background: linear-gradient(180deg,#111827,#020617); color: rgb(255, 255, 255); font-family: Inter, system-ui, sans-serif; box-sizing: border-box;\" data-ms-root=\"1\"><div data-sb-media=\"\" data-kind=\"image\" data-slot=\"coverImage\" style=\"position:absolute;left:70px;right:70px;top:110px;height:980px;border-radius:42px;background:rgba(255,255,255,.14) center/cover no-repeat;box-shadow:0 32px 96px rgba(0,0,0,.33)\"></div><div style=\"position:absolute;left:78px;right:78px;bottom:120px\"><div data-sb-editable=\"\" data-slot=\"category\" data-role=\"overline\" style=\"font-size:30px;letter-spacing:8px;text-transform:uppercase;opacity:.74\">Vertical Format</div><div data-sb-editable=\"\" data-slot=\"title\" data-role=\"title\" style=\"margin-top:22px;font-size:118px;line-height:.92;font-weight:800\">Template 9:16</div><div data-sb-editable=\"\" data-slot=\"subtitle\" data-role=\"subtitle\" style=\"margin-top:26px;font-size:40px;line-height:1.36;opacity:.92\">Portrait canvas 1080×1920 prepared for Sandbox → Library → Motion Studio flow.</div><div data-sb-editable=\"\" data-slot=\"footer\" data-role=\"smallMeta\" style=\"margin-top:28px;font-size:28px;opacity:.76\">Exact format · Future AE-ready metadata</div></div></section>",
      styleSystem:"default",
      format:"9:16",
      designW:1080,
      designH:1920,
      tags:["portrait","story","cover","image"],
      motionStudio:{
        target:"motion-studio",
        contractVersion:"motion-studio-template-v1",
        format:"9:16",
        canvas:{format:"9:16",w:1080,h:1920,resolution:"1080x1920",safeArea:{x:54,y:96,w:972,h:1728}},
        roles:{textSlots:["category","title","subtitle","footer"],textRoles:["overline","title","subtitle","smallMeta"],mediaSlots:["coverImage"]},
        timeline:{minFrames:60,recommendedFrames:120,maxFrames:210,flexibleDuration:true,loopSafe:false,allowHold:true},
        ae:{exportReady:true,compWidth:1080,compHeight:1920,layerStrategy:"html-slide",editableSlots:["category","title","subtitle","footer"],mediaSlots:["coverImage"],notes:"Portrait demo mapping for future AE export"}
      }
    }
  ];
  window.SB_MOTION_LIBRARY_META=LIB_META;
  if(window.SB_registerStyleSystems)window.SB_registerStyleSystems(STYLE_SYSTEMS);
  else window.SB_PENDING_STYLE_SYSTEMS=Object.assign(window.SB_PENDING_STYLE_SYSTEMS||{},STYLE_SYSTEMS);
  if(window.SB_registerTemplates)window.SB_registerTemplates(LIBRARY);
  else window.SB_PENDING_TEMPLATES=(window.SB_PENDING_TEMPLATES||[]).concat(LIBRARY);
})();
