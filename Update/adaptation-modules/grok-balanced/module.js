/* grok-balanced.js — grok.balanced · «Сбалансированная» (Grok (React)).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_grok» (GROK React) · GROK.convertFromOriginal(html,"balanced",t) → METHODS.
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/grok.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('grok-balanced', {
    adapt: async function(ctx){
    var r = window.RecomposeLab.grok.convertFromOriginal(ctx.t.html, 'balanced', ctx.t);
    return window.RecomposeLab.emit(ctx, r.document, r.handler);
    }
  });
})();
