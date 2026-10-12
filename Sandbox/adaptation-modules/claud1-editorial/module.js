/* claud1-editorial.js — claud1.editorial · «Вертикальная редакционная композиция» (Claude 1).
   Перенос из лаборатории index.html; исходный locator: index.html · script-блок «fam_claud1» (CLAUD1) · CLAUD1.methodEditorial().
   Алгоритм не переписан: вызывается оригинальная функция из _shared/lab/claud1.js; здесь только адаптер к движку. */
(function(){
  window.RecomposeCore.adaptation.implement('claud1-editorial', {
    adapt: async function(ctx){
    var c = window.RecomposeLab.claud1;
    var parsed = c.parseTemplate(ctx.t.html);          // как в buildUnified: ctx={parsed, rawHtml, naturalWidth}
    var res = c.methodEditorial(parsed);
    return window.RecomposeLab.emit(ctx, c.docShell(res.html, parsed.bg), 'холст 900×1600');
    }
  });
})();
