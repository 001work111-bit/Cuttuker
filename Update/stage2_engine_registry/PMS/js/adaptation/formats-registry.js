/* Реестр форматов Pano Montage Studio — копия единого реестра Sandbox (Sandbox_Content.html + recompose-sandbox.js).
   Не вводить второй реестр: при изменении формата обновлять Sandbox и переносить блок повторно. */
window.SB_FORMATS = [
  { id:'16:9', label:'16:9', ratio:{w:16,h:9}, contractCanvas:{width:1920,height:1080}, className:'sb-frame-16x9',
    work:{w:1600,h:900}, validated:true, safe:0.04, export:true },
  { id:'9:16', label:'9:16', ratio:{w:9,h:16}, contractCanvas:{width:1080,height:1920}, className:'sb-frame-9x16',
    work:{w:900,h:1600}, safe:0.04, export:true },
  { id:'4:5', label:'4:5', ratio:{w:4,h:5}, contractCanvas:{width:1080,height:1350}, className:'sb-frame-4x5',
    work:{w:1280,h:1600}, safe:0.04, export:true },
  { id:'5:6', label:'5:6', ratio:{w:5,h:6}, contractCanvas:{width:1000,height:1200}, className:'sb-frame-5x6',
    work:{w:1333,h:1600}, safe:0.04, export:true },
  { id:'1:1', label:'1:1', ratio:{w:1,h:1}, contractCanvas:{width:1080,height:1080}, className:'sb-frame-1x1',
    work:{w:1200,h:1200}, safe:0.04, export:true },
  { id:'4:3', label:'4:3', ratio:{w:4,h:3}, contractCanvas:{width:1440,height:1080}, className:'sb-frame-4x3',
    work:{w:1200,h:900}, safe:0.04, export:true }
];
/* ЕДИНЫЙ РЕЕСТР ФОРМАТОВ. Здесь задаются id, ratio, contractCanvas, work (рабочий кадр алгоритма),
   validated и UI-параметры. RecomposeCore.FORMATS заполняется из этого списка через SB_syncFormats() — второго реестра нет.
   Расширение: новый формат = новая запись выше (или window.SB_FORMATS.push + SB_syncFormats()).
   Модуль адаптации получает формат, только если его module.json указывает targetFormats с этим id. */

/* Поиск записи по id. Возвращает null, если формата нет. */
window.SB_FORMAT = function(id){
  return (window.SB_FORMATS || []).find(function(f){ return f.id === id; }) || null;
};


/* Единый реестр форматов: источник правды — window.SB_FORMATS (Sandbox_Content.html).
   Записи, которых ещё нет в RecomposeCore.FORMATS, регистрируются через registerFormat.
   Существующие записи (16:9, 9:16, 1:1, 4:3 с рабочими размерами) НЕ перезаписываются:
   геометрия ранее сохранённых шаблонов не меняется. Рабочий кадр нового формата — 1600 по большей стороне. */
window.SB_syncFormats=function(){
  // Единый реестр: SB_FORMATS -> RecomposeCore.FORMATS (кэш рабочих кадров). Записи обновляются, второго источника нет.
  const RC=window.RecomposeCore;
  if(!RC || !RC.registerFormat) return [];
  const done=[];
  (window.SB_FORMATS||[]).forEach(function(f){
    if(!f || !f.id || !f.ratio || !(f.ratio.w>0) || !(f.ratio.h>0)) return;
    // рабочий кадр: явный work из реестра; если не задан — по соотношению (длинная сторона 1600)
    let wk=f.work;
    if(!wk || !(wk.w>0) || !(wk.h>0)){
      const r=f.ratio, big=1600;
      wk={ w: r.w>=r.h ? big : Math.round(big*r.w/r.h), h: r.w>=r.h ? Math.round(big*r.h/r.w) : big };
    }
    RC.registerFormat({ id:f.id, label:f.label||f.id, w:wk.w, h:wk.h,
      previewW:Math.round(wk.w*0.8), previewH:Math.round(wk.h*0.8),
      contractCanvas:f.contractCanvas||null, validated:!!f.validated });
    done.push(f.id);
  });
  return done;
};
window.SB_syncFormats();
