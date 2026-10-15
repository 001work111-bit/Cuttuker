/* _shared/lab/adapter.js — общий адаптер вывода для модулей из лаборатории (не алгоритм).
   Записывает HTML, который вернула оригинальная функция метода, в кадр движка (ctx.doc) и отдаёт движку
   управление дальше: rcFragment, проверка структуры и переполнения выполняются движком как обычно.
   RecomposeLab.raw[id] — сырой результат метода (для сравнения с лабораторией). */
(function(){
  window.RecomposeLab = window.RecomposeLab || {};
  window.RecomposeLab.raw = window.RecomposeLab.raw || {};
  window.RecomposeLab.emit = function(ctx, html, layout){
    var out = String(html || '');
    window.RecomposeLab.raw[ctx.method] = out;
    var doc = ctx.doc;
    doc.open(); doc.write(out); doc.close();
    return { layout: layout || 'generic', fit: { factor: 1, overflow: [] } };
  };
})();
