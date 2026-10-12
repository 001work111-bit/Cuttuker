/* v3011-type.js — v3011.type · «Типографический постер» (Single-file v3-011).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_v3011» (Single-file v3-011) · EXPERIMENTAL_METHODS → experimentalStructure/experimentalCss (id="type").
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/iface-v3011.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('v3011-type', {
    adapt: async function(ctx){
    var b = await window.RecomposeLab.ifaceV3011.buildConverted3011(ctx.t.html, ctx.t, 'type');
    return window.RecomposeLab.emit(ctx, b.output, b.layout);
    }
  });
})();
