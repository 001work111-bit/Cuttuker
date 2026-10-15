/* gemini-editorial.js — gemini.editorial · «Вертикальная редакционная композиция» (Gemini Cool).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_gemini» (GEMINI) · GEMINI.METHOD_MAP["editorial"] → applyNewMethodRules.
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/gemini.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('gemini-editorial', {
    adapt: async function(ctx){
    var r = await window.RecomposeLab.gemini.convertTemplate(ctx.t.html, ctx.t, 'editorial');
    return window.RecomposeLab.emit(ctx, r.outputHtml, r.layout);
    }
  });
})();
