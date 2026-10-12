/* ============================================================
   adaptation-modules/_shared/css-groups.js — общие CSS-блоки групп методов.
   Текст verbatim из прежнего targetCss (recompose-core.js):
     cssCompactFit — блок для compact и fit;  cssSmartSplit — блок для smart и split.
   Модули обращаются к этим строкам при вызове, поэтому порядок загрузки не важен.
   Файлы с префиксом «_» не являются методами (их не регистрируют).
   ============================================================ */
(function(){
  window.RecomposeAdaptationShared = window.RecomposeAdaptationShared || {};
  window.RecomposeAdaptationShared.cssCompactFit = `
.sv-section{padding:42px 52px!important}
.sv-section>.sv-inner{gap:clamp(12px,1.6vw,24px)!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(27px,4.4vw,70px)!important;line-height:1.02!important;letter-spacing:-.035em!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,1.8vw,26px)!important;line-height:1.2!important}
.sv-inner [data-role="body"]{font-size:clamp(13px,1vw,17px)!important;line-height:1.42!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:clamp(10px,.8vw,13px)!important;line-height:1.35!important}
.sv-inner h1,.sv-inner h2,.sv-inner h3,.sv-inner h4{max-width:100%!important;overflow-wrap:anywhere!important}
.sv-inner p{max-width:100%!important}
.sv-section [style*="padding"]{padding-top:clamp(8px,1.4vw,22px)!important;padding-bottom:clamp(8px,1.4vw,22px)!important}
.sv-section [style*="margin-bottom"]{margin-bottom:clamp(8px,1.4vw,22px)!important}
`;
  window.RecomposeAdaptationShared.cssSmartSplit = `
.sv-section{padding:54px 72px!important}
.sv-inner [data-role="title"]{font-size:clamp(30px,4.7vw,76px)!important;line-height:1.01!important;letter-spacing:-.04em!important}
.sv-inner [data-role="statement"]{font-size:clamp(31px,4.7vw,76px)!important;line-height:1.08!important;letter-spacing:-.035em!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,1.8vw,27px)!important;line-height:1.3!important}
.sv-inner [data-role="body"]{font-size:clamp(13px,1vw,17px)!important;line-height:1.45!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:clamp(10px,.8vw,13px)!important;line-height:1.35!important}
.sv-inner [style*="margin-bottom"]{margin-bottom:clamp(8px,1.5vw,24px)!important}
`;
})();
