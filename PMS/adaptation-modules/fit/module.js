/* ============================================================
   adaptation-modules/fit/module.js — код метода «Контрольный safe-fit» (fit)
   ------------------------------------------------------------
   Дескриптор (id, название, форматы, приложения) — в module.json.
   Здесь: собственная логика adapt(ctx) и CSS-блоки метода.
   Общие функции движка (HTML, измерение, переполнение, подгонка) — через ctx.
   ============================================================ */
(function(){
  window.RecomposeCore.adaptation.implement('fit', {
    css: {
      head: function(){ return window.RecomposeAdaptationShared.cssCompactFit; },
      tail: function(){ return `
.sv-section>.sv-inner{transform-origin:top left!important}
`; }
    },
    adapt: async function(ctx){
      // распаковка DOM, CSS compact/fit + блок fit; подгонка всегда (до 12 шагов)
      ctx.unwrap();
      const layout = /showreelasymmetricgrid/i.test(ctx.t.tpl||'') ? 'asym' : 'generic';
      ctx.applyCss(layout);
      await ctx.raf2();
      let fit = { factor: 1, overflow: ctx.checkOverflow() };
      fit = ctx.fitDown(12);
      return { layout: layout, fit: fit };
    }
  });
})();
