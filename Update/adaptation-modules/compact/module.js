/* ============================================================
   adaptation-modules/compact/module.js — код метода «Адаптивная сетка» (compact)
   ------------------------------------------------------------
   Дескриптор (id, название, форматы, приложения) — в module.json.
   Здесь: собственная логика adapt(ctx) и CSS-блоки метода.
   Общие функции движка (HTML, измерение, переполнение, подгонка) — через ctx.
   ============================================================ */
(function(){
  window.RecomposeCore.adaptation.implement('compact', {
    css: {
      head: function(){ return window.RecomposeAdaptationShared.cssCompactFit; }
    },
    adapt: async function(ctx){
      // распаковка DOM (без семантики), CSS compact/fit; подгонка только при переполнении (7 шагов)
      ctx.unwrap();
      const layout = /showreelasymmetricgrid/i.test(ctx.t.tpl||'') ? 'asym' : 'generic';
      ctx.applyCss(layout);
      await ctx.raf2();
      let fit = { factor: 1, overflow: ctx.checkOverflow() };
      if(fit.overflow.length) fit = ctx.fitDown(7);
      return { layout: layout, fit: fit };
    }
  });
})();
