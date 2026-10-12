/* gemini-typographic.js — gemini.typographic · «Типографический вертикальный плакат» (Gemini Cool).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_gemini» (GEMINI) · GEMINI.METHOD_MAP["typographic"] → applyNewMethodRules.
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/gemini.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('gemini-typographic', {
    adapt: async function(ctx){
    var r = await window.RecomposeLab.gemini.convertTemplate(ctx.t.html, ctx.t, 'typographic');
    return window.RecomposeLab.emit(ctx, r.outputHtml, r.layout);
    }
  });
})();
