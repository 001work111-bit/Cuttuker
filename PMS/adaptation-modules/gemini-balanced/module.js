/* gemini-balanced.js — gemini.balanced · «Сбалансированная композиция» (Gemini Cool).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_gemini» (GEMINI) · GEMINI.METHOD_MAP["balanced"] → applyNewMethodRules.
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/gemini.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('gemini-balanced', {
    adapt: async function(ctx){
    var r = await window.RecomposeLab.gemini.convertTemplate(ctx.t.html, ctx.t, 'balanced');
    return window.RecomposeLab.emit(ctx, r.outputHtml, r.layout);
    }
  });
})();
