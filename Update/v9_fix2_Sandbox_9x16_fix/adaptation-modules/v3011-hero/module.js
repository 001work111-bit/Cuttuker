/* v3011-hero.js — v3011.hero · «Главное медиа» (Single-file v3-011).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_v3011» (Single-file v3-011) · EXPERIMENTAL_METHODS → experimentalStructure/experimentalCss (id="hero").
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/iface-v3011.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('v3011-hero', {
    adapt: async function(ctx){
    var b = await window.RecomposeLab.ifaceV3011.buildConverted3011(ctx.t.html, ctx.t, 'hero');
    return window.RecomposeLab.emit(ctx, b.output, b.layout);
    }
  });
})();
