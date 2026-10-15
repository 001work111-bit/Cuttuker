/* iface-split.js — iface.split · «Редакционный split» (Базовая лаборатория).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок 0 «эталонная лаборатория» · buildConverted(html,t,"split") + smartStructure/targetCss.
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/iface-v3011.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('iface-split', {
    adapt: async function(ctx){
    var b = await window.RecomposeLab.ifaceV3011.buildConverted(ctx.t.html, ctx.t, 'split');
    return window.RecomposeLab.emit(ctx, b.output, b.layout);
    }
  });
})();
