/* ============================================================
   adaptation-modules/split/module.js — код метода «Редакционный split» (split)
   ------------------------------------------------------------
   Дескриптор (id, название, форматы, приложения) — в module.json.
   Здесь: собственная логика adapt(ctx) и CSS-блоки метода.
   Общие функции движка (HTML, измерение, переполнение, подгонка) — через ctx.
   ============================================================ */
(function(){
  window.RecomposeCore.adaptation.implement('split', {
    css: {
      head: function(){ return window.RecomposeAdaptationShared.cssSmartSplit; },
      tail: function(layout){ var css=''; if(layout!=='about'&&layout!=='asym'&&layout!=='micro'&&layout!=='matrix'&&layout!=='indexhero'&&layout!=='directions'&&layout!=='genericSplit')css+=`
.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:22px 38px!important;align-items:center!important}.sv-inner> :first-child{grid-column:1/-1!important}.sv-inner [data-sb-media],.sv-inner .sv-media{max-width:100%!important;max-height:100%!important;aspect-ratio:16/9!important}
`; return css; }
    },
    adapt: async function(ctx){
      // структура по ролям, CSS группы smart/split + блок split; подгонка только при переполнении (7 шагов)
      const semantic = ctx.smartStructure();
      ctx.applyCss(semantic.layout);
      await ctx.raf2();
      let fit = { factor: 1, overflow: ctx.checkOverflow() };
      if(fit.overflow.length) fit = ctx.fitDown(7);
      return { layout: semantic.layout, fit: fit };
    }
  });
})();
