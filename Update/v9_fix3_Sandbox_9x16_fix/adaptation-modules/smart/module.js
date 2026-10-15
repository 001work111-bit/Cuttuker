/* ============================================================
   adaptation-modules/smart/module.js — код метода «Реконструкция по ролям» (smart)
   ------------------------------------------------------------
   Дескриптор (id, название, форматы, приложения) — в module.json.
   Здесь: собственная логика adapt(ctx) и CSS-блоки метода.
   Общие функции движка (HTML, измерение, переполнение, подгонка) — через ctx.
   ============================================================ */
(function(){
  window.RecomposeCore.adaptation.implement('smart', {
    css: {
      head: function(){ return window.RecomposeAdaptationShared.cssSmartSplit; }
    },
    adapt: async function(ctx){
      // структура по ролям, затем CSS группы smart/split; подгонка только при переполнении (7 шагов)
      const semantic = ctx.smartStructure();
      ctx.applyCss(semantic.layout);
      await ctx.raf2();
      let fit = { factor: 1, overflow: ctx.checkOverflow() };
      if(fit.overflow.length) fit = ctx.fitDown(7);
      return { layout: semantic.layout, fit: fit };
    }
  });
})();
