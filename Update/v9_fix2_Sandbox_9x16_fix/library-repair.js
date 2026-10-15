/* ============================================================
   ИСПРАВЛЕНИЕ ШАБЛОНОВ ЧЕРЕЗ НЕЙРОСЕТЬ (встраивается в инспектор «Проверка библиотеки»)
   ------------------------------------------------------------
   1. exportPackage(ids)  — самодостаточный JSON-пакет: полные записи, HTML, диагностика,
                            связи конверсий, стили и прогоны, контракт и техническое задание.
   2. validateReturn(text, expectedIds) — проверка JSON, который вернула нейросеть.
                            Структурные ошибки (не JSON, не массив, не те ID, дубликаты) → ничего не заменяется.
                            Поштучные провалы (потеряны элементы, остались блокирующие проблемы) → шаблон
                            не заменяется, остальные можно применить после подтверждения.
   3. applyReturn(plan)   — замена только прошедших проверку записей; перед заменой — снимок Undo
                            (Ctrl+Z откатывает всё состояние) и скачивание резервной копии исходных записей.
   Ничего не удаляется и не заменяется без явного действия пользователя.
   ============================================================ */
(function(){
  'use strict';

  const REPAIR = { expected:[], pkgAt:null, check:null, reportText:'' };
  window.SB_repairState = REPAIR;

  const TASK = [
    'Задача: исправить указанные шаблоны Sandbox так, чтобы они корректно адаптировались методами',
    'Recompose (smart, compact, split, fit) и экспортировались в PMS через librarymotion.js.',
    'Шаблоны — HTML-фрагменты раздела .sv-section с размерами холста из поля canvas/aspect.',
    '',
    'Требуется:',
    '1. Для каждой проблемы из targets[].problems определить причину по HTML и метаданным.',
    '2. Исправить только необходимые части HTML или метаданных. Не переписывать шаблон целиком,',
    '   если достаточно локального исправления.',
    '3. Сохранить идентификаторы (tpl), название (label), группу (group), стили (styleSystem,',
    '   styleSystems), прогон (batch), ссылки и существующие поля record.',
    '4. Сохранить исходник и метаданные адаптации (recompose, recompose_orig, recompose_prev,',
    '   frameContract, recomposeFrame, sourceTpl), когда это возможно.',
    '5. Сохранить разметку текстовых элементов (data-sb-editable), медиа-слотов (data-sb-media,',
    '   .sv-media, data-slot) и повторов (data-sb-repeat). Количество таких элементов не уменьшать.',
    '6. Не вводить новый контракт метаданных: используйте только атрибуты и поля, уже присутствующие в записях.',
    '7. Не считать исправлением удаление проблемной разметки или превращение композиции в один неразмеченный блок.',
    '',
    'Формат ответа: ТОЛЬКО JSON-массив записей шаблонов (объекты в формате targets[].record, с исправлениями).',
    'Без Markdown, без комментариев вокруг массива, без посторонних объектов. Каждый tpl из expectedTpl — ровно один раз.'
  ].join('\n');

  const CONTRACT = {
    summary: 'Шаблон Sandbox — запись библиотеки (LIB[tpl]). Ключ — tpl (уникальный ID). HTML — раздел .sv-section.',
    markers: {
      'data-sb-editable': 'текстовый управляемый элемент (редактируется в Sandbox и экспортируется в PMS)',
      'data-sb-media':    'медиа-слот (изображение/видео), управляется в Sandbox',
      '.sv-media':        'медиа-контейнер (альтернативная запись медиа-слота)',
      'data-slot':        'имя слота, связывает элемент с блоком на таймлайне PMS и экспортом entities',
      'data-role':        'роль текста: title, statement, subtitle, meta и т. п. (нужна роль-методам smart/split)',
      'data-kind':        'тип блока (static, auto и т. п.)',
      'data-sb-repeat':   'повтор элементов (ряды/сетка)'
    },
    frame: 'aspect — код соотношения (16:9, 9:16, 1:1, 4:3, 4:5, 5:6); canvas — холст {width,height}, согласованный с aspect.',
    adaptation: 'recompose — метаданные последней адаптации; recompose_orig — исходный HTML до адаптации; методы работают с разметкой выше.',
    motion: 'motion.contract = motion-studio-template-v1; motion.entities — слоты для PMS. Не менять без причины.'
  };

  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function parse(html){ return new DOMParser().parseFromString(String(html||''),'text/html'); }

  function download(name, text){
    const blob=new Blob([text],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name;
    document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function batchOf(rec){
    if(!rec || !rec.batch || typeof BATCHES==='undefined' || !BATCHES[rec.batch]) return null;
    const b=BATCHES[rec.batch];
    return { id:rec.batch, label:b.label||'', note:b.note||'', link:b.link||'', color:b.color||'', createdAt:b.createdAt||null, styleSystem:b.styleSystem||null };
  }

  /* ---------- 1. пакет ---------- */
  function exportPackage(ids){
    const A=window.SB_libraryAudit;
    const list=(ids||[]).filter(id=>LIB[id]);
    const styles={}, batches={}, targets=[];
    list.forEach(id=>{
      const t=LIB[id];
      const diag=A ? A.diagnoseRec(t, id) : [];
      const c=(S2_CONV||{})[id]||null;
      const src=c && LIB[c.src] ? LIB[c.src] : null;
      const memb=[t.styleSystem].concat(Array.isArray(t.styleSystems)?t.styleSystems:[]).filter(Boolean);
      memb.forEach(k=>{ if(STYLES[k]) styles[k]=clone(STYLES[k]); });
      const bt=batchOf(t); if(bt) batches[bt.id]=bt;
      let rec=null; try{ rec=window.RecomposeCore && RecomposeCore.recommend ? RecomposeCore.recommend(t) : null; }catch(e){}
      targets.push({
        tpl:id,
        problems: diag.map(x=>({ category:x.category, type:x.type, severity:x.severity, confidence:x.confidence, reason:x.reason, element:x.element||null })),
        diagnostics: {
          editableCount: (parse(t.html).body.querySelectorAll('[data-sb-editable]').length),
          mediaCount: (parse(t.html).body.querySelectorAll('[data-sb-media],.sv-media').length),
          formatKnown: !!(t.aspect && (window.SB_FORMATS||[]).some(f=>f.id===t.aspect)),
          htmlHash: (typeof s2Hash==='function') ? s2Hash(t.html) : null
        },
        adaptation: {
          sourceFormat: t.aspect || null,
          conversion: c ? { sourceTpl:c.src, targetFormat:c.aspect||null, method:c.method||null, sourceHashAtCreate:c.srcHash, outdated: !!(typeof s2Outdated==='function' && s2Outdated(id)) } : null,
          recommendedMethod: rec ? rec.method : null,
          availableMethods: window.RecomposeCore ? window.RecomposeCore.adaptation.list(t.aspect||'16:9', window.RecomposeCore.adaptation.getApp(), t.aspect||undefined).map(m=>m.id) : []
        },
        imgAssign: (IMG_ASSIGN||{})[id]||null,
        record: clone(t),
        source: src ? { tpl:src.tpl, label:src.label||'', html:src.html, note:'текущий исходник конверсии (для восстановления структуры)' } : null,
        batch: bt ? bt.id : null
      });
    });
    const pkg={
      format:'sandbox-repair-package', formatVersion:1, createdAt:new Date().toISOString(),
      app:{ name:'Sandbox', build:'v9' },
      task:TASK,
      contract:CONTRACT,
      returnFormat:{ type:'json-array', description:'массив записей шаблонов в формате targets[].record', rules:[
        'каждый tpl из expectedTpl ровно один раз', 'без лишних tpl', 'поля tpl, label, group, styleSystem, styleSystems, batch сохраняются',
        'html — строка, не пустая', 'количество data-sb-editable и медиа-слотов не уменьшается'] },
      expectedTpl:list,
      targets, styles, batches
    };
    const text=JSON.stringify(pkg,null,2);
    REPAIR.expected=list.slice(); REPAIR.pkgAt=new Date();
    download('sandbox-repair-'+new Date().toISOString().slice(0,10)+'.json', text);
    return { count:list.length, bytes:text.length };
  }

  /* ---------- 2. проверка возврата ---------- */
  const REQUIRED=['label','group','styleSystem','canvas','aspect','frameContract','recompose','recompose_orig','family','kind'];
  function countOf(html){
    const d=parse(html).body;
    return { editable:d.querySelectorAll('[data-sb-editable]').length, media:d.querySelectorAll('[data-sb-media],.sv-media').length };
  }
  /* Слоты (п.2.3): сравниваются ИДЕНТИФИКАТОРЫ data-slot и маркеры сущности на каждом слоте.
     Переименование слота выглядит как пропажа старого и появление нового — оба случая отклоняются. */
  const SLOT_MARKERS=['data-sb-editable','data-sb-media','data-role','data-kind','data-sb-repeat'];
  function slotMap(html){
    const m=new Map();
    parse(html).body.querySelectorAll('[data-slot]').forEach(el=>{
      const s=el.getAttribute('data-slot');
      if(!m.has(s)) m.set(s,new Set());
      SLOT_MARKERS.forEach(a=>{ if(el.hasAttribute(a)) m.get(s).add(a); });
    });
    return m;
  }
  function slotCheck(oldHtml, newHtml){
    const a=slotMap(oldHtml), b=slotMap(newHtml);
    const missing=[...a.keys()].filter(k=>!b.has(k));
    const changed=[...a.keys()].filter(k=>b.has(k) && [...a.get(k)].some(x=>!b.get(k).has(x)));
    const added=[...b.keys()].filter(k=>!a.has(k));
    return { ok: !missing.length && !changed.length, missing, changed, added };
  }
  window.SB_slotCheck=slotCheck;
  // Поля, которые модель не меняет: при замене берутся из исходной записи (принадлежность и адаптация сохраняются)
  const KEEP=['tpl','label','group','styleSystem','styleSystems','batch','favorite','family','kind','canvas','aspect',
              'frameContract','recomposeFrame','recompose','recompose_orig','recompose_prev','motion','entities'];

  function blockersOf(issues){
    return issues.filter(x=> x.category==='structure' || (x.category==='meta' && x.confidence==='high' && x.severity!=='info'))
                 .map(x=>x.reason);
  }
  function validateReturn(text, expectedIds){
    const exp=(expectedIds||[]).slice();
    const out={ structural:[], perTpl:[], accepted:[], rejected:[], parsed:null };
    let data;
    try{ data=JSON.parse(String(text||'')); }
    catch(e){ out.structural.push('JSON не читается: '+(e.message||e)+'. Проверьте, что скопирован только JSON-массив.'); return out; }
    if(!Array.isArray(data)){ out.structural.push('Ожидается JSON-массив записей; получен объект или другой тип.'); return out; }
    const seen=new Map(); const dup=[]; const extra=[];
    data.forEach((r,i)=>{
      if(!r || typeof r!=='object' || typeof r.tpl!=='string'){ out.structural.push(`элемент ${i+1}: нет строкового поля tpl`); return; }
      if(seen.has(r.tpl)) dup.push(r.tpl); else seen.set(r.tpl, r);
      if(exp.indexOf(r.tpl)<0) extra.push(r.tpl);
    });
    const missing=exp.filter(id=>!seen.has(id));
    if(dup.length) out.structural.push('дубликаты tpl: '+[...new Set(dup)].join(', '));
    if(extra.length) out.structural.push('лишние tpl, которых не было в пакете: '+extra.join(', '));
    if(missing.length) out.structural.push('отсутствуют выбранные шаблоны: '+missing.join(', '));
    if(out.structural.length) return out;

    const A=window.SB_libraryAudit;
    exp.forEach(id=>{
      const orig=LIB[id], r=seen.get(id);
      const checks=[]; const add=(name,ok,detail)=>checks.push({name,ok:!!ok,detail:detail||''});
      add('html — непустая строка', typeof r.html==='string' && r.html.trim().length>0, '');
      const missK=REQUIRED.filter(k=>orig[k]!==undefined && r[k]===undefined);
      add('обязательные поля сохранены', !missK.length, missK.length?('нет полей: '+missK.join(', ')):'');
      add('tpl не изменён', r.tpl===id, '');
      const co=countOf(orig.html), cn=countOf(r.html||'');
      add('текстовые элементы (data-sb-editable) не потеряны', cn.editable>=co.editable, `было ${co.editable}, стало ${cn.editable}`);
      add('медиа-слоты не потеряны', cn.media>=co.media, `было ${co.media}, стало ${cn.media}`);
      const sc=slotCheck(orig.html, r.html||'');
      add('слоты data-slot и их разметка сохранены', sc.ok,
          [sc.missing.length?'отсутствуют слоты: '+sc.missing.join(', '):'', sc.changed.length?'потеряна разметка слотов: '+sc.changed.join(', '):''].filter(Boolean).join('; '));
      const issues=A ? A.diagnoseRec(Object.assign({}, orig, r), id) : [];
      const before=A ? new Set(blockersOf(A.diagnoseRec(orig,id))) : new Set();
      const after=blockersOf(issues);
      const resolved=[...before].filter(x=>after.indexOf(x)<0);
      const introduced=after.filter(x=>!before.has(x));
      const remaining=after;
      add('структурные проверки пройдены', after.length===0, after.join('; '));
      add('новых блокирующих проблем не появилось', introduced.length===0, introduced.join('; '));
      add('ранее найденные проблемы устранены', remaining.length===0 || resolved.length>0, `устранено: ${resolved.length}, осталось: ${remaining.length}`);
      const metaChanged=KEEP.filter(k=>k!=='tpl' && r[k]!==undefined && JSON.stringify(r[k])!==JSON.stringify(orig[k]));
      const ok=checks.every(c=>c.ok);
      out.perTpl.push({ tpl:id, label:orig.label||id, ok, checks, resolved, remaining, missingFields:missK,
                        slots:{ added:sc.added, missing:sc.missing, changed:sc.changed }, metaChanged });
      (ok?out.accepted:out.rejected).push(id);
    });
    out.parsed=seen;
    return out;
  }

  /* ---------- 3. применение ---------- */
  function applyReturn(plan){
    if(!plan || !plan.parsed || !plan.accepted.length) return { applied:0 };
    const originals=plan.accepted.map(id=>clone(LIB[id]));
    // резервная копия исходных записей (скачивание) + снимок Undo (Ctrl+Z откатывает всё состояние)
    download('sandbox-repair-backup-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.json', JSON.stringify({format:'sandbox-repair-backup',createdAt:new Date().toISOString(),records:originals},null,2));
    pushUndo();
    plan.accepted.forEach(id=>{
      const o=LIB[id], ret=clone(plan.parsed.get(id));
      // замена существующей записи (ключ — tpl), новая запись не создаётся
      const r=clone(ret);
      r.html=ret.html;
      KEEP.forEach(k=>{
        if(o[k]!==undefined) r[k]=clone(o[k]); else delete r[k];
      });
      r.tpl=id;
      LIB[id]=r;
    });
    store.save(); store.saveBatches();
    if(typeof reconcileBatches==='function') reconcileBatches();
    plan.accepted.forEach(id=>{ if(window.SB_libraryAudit) window.SB_libraryAudit.invalidate(id); });
    if(window.SB_renderInspector) window.SB_renderInspector();
    if(typeof renderLib==='function') renderLib();
    if(window.SB_Gallery && SB_Gallery.mode==='grid') SB_Gallery.rebuild(false);
    return { applied:plan.accepted.length, replaced:plan.accepted.slice() };
  }

  /* ---------- отчёт для нейросети ---------- */
  function reportText(plan){
    const L=[];
    L.push('ОТЧЁТ ПРОВЕРКИ ИСПРАВЛЕНИЙ SANDBOX');
    L.push('Дата: '+new Date().toISOString());
    if(!plan){ return L.join('\n'); }
    if(plan.structural.length){
      L.push('Ответ отклонён целиком (ничего не заменено). Ошибки структуры:');
      plan.structural.forEach(x=>L.push('- '+x));
    }
    plan.perTpl.forEach(p=>{
      L.push('');
      L.push(`${p.ok?'ПРОШЁЛ':'НЕ ПРОШЁЛ'} · ${p.label} (tpl: ${p.tpl})`);
      p.checks.filter(c=>!c.ok).forEach(c=>L.push(`  провалена проверка: ${c.name}${c.detail?' — '+c.detail:''}`));
      if(p.missingFields.length) L.push('  отсутствуют поля: '+p.missingFields.join(', '));
      if(p.slots && p.slots.added.length) L.push('  добавлены слоты (проверить назначения): '+p.slots.added.join(', '));
      if(p.metaChanged && p.metaChanged.length) L.push('  поля восстановлены из исходной записи: '+p.metaChanged.join(', '));
      if(p.remaining.length) L.push('  остались проблемы: '+p.remaining.join('; '));
      if(p.resolved.length) L.push('  устранено: '+p.resolved.join('; '));
    });
    if(plan.perTpl.some(p=>!p.ok)){
      L.push('');
      L.push('Попроси исправить только шаблоны со статусом «НЕ ПРОШЁЛ». Верни ТОЛЬКО JSON-массив записей этих tpl');
      L.push('в том же формате, что и targets[].record: без Markdown и без комментариев.');
    }
    return L.join('\n');
  }

  /* ---------- UI (вставляется в инспектор) ---------- */
  function html(){
    const n=REPAIR.expected.length;
    const plan=REPAIR.check;
    let h=`<details class="li-repair" ${REPAIR.open?'open':''}><summary>Импорт исправленных шаблонов</summary>`;
    h+=`<div class="li-rp-body">`;
    h+=`<div class="li-hint">Вставьте JSON-массив, который вернула нейросеть по пакету. Ничего не заменяется до проверки и подтверждения.</div>`;
    h+=`<textarea data-rp-text rows="5" placeholder="[ { \\"tpl\\": \\"...\\", ... } ]" spellcheck="false">${esc(REPAIR.text||'')}</textarea>`;
    h+=`<div class="li-btns"><button type="button" class="li-btn" data-rp-act="check">Проверить</button>`;
    h+=`<button type="button" class="li-btn primary" data-rp-act="apply" ${plan&&plan.accepted&&plan.accepted.length?'':'disabled'}>Применить исправления</button></div>`;
    if(plan){
      if(plan.structural.length){
        h+=`<div class="li-result bad"><b>Ответ не принят — ничего не заменено:</b><ul>${plan.structural.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
      } else {
        h+=`<div class="li-result">Принято: <b>${plan.accepted.length}</b> · не прошли: <b>${plan.rejected.length}</b></div>`;
        h+=plan.perTpl.map(p=>`<div class="li-rp-item ${p.ok?'ok':'bad'}"><b>${p.ok?'Будет заменён':'Не будет заменён'} · ${esc(p.label)}</b> <span class="li-meta">${esc(p.tpl)}</span>
          <ul>${p.checks.filter(c=>!c.ok).map(c=>`<li>${esc(c.name)}${c.detail?' — '+esc(c.detail):''}</li>`).join('')}${p.slots&&p.slots.added.length?`<li>добавлены слоты (проверьте назначения изображений): ${esc(p.slots.added.join(', '))}</li>`:''}${p.metaChanged&&p.metaChanged.length?`<li>поля восстановлены из исходной записи: ${esc(p.metaChanged.join(', '))}</li>`:''}${p.resolved.length?`<li>устранено: ${esc(p.resolved.join('; '))}</li>`:''}${p.remaining.length?`<li>остались: ${esc(p.remaining.join('; '))}</li>`:''}</ul></div>`).join('');
      }
    }
    if(plan && (plan.structural.length || plan.rejected.length)){
      h+=`<div class="li-btns"><button type="button" class="li-btn" data-rp-act="copy">Скопировать отчёт для нейросети</button></div>`;
    }
    h+=`</div></details>`;
    return h;
  }
  function bind(rail){
    const ta=rail.querySelector('[data-rp-text]');
    const det=rail.querySelector('.li-repair');
    if(det) det.addEventListener('toggle',()=>{ REPAIR.open=det.open; });
    if(ta) ta.oninput=()=>{ REPAIR.text=ta.value; };
    rail.querySelectorAll('[data-rp-act]').forEach(b=>b.onclick=()=>{
      const act=b.getAttribute('data-rp-act');
      if(act==='check'){
        REPAIR.text=ta?ta.value:(REPAIR.text||'');
        REPAIR.check=validateReturn(REPAIR.text, REPAIR.expected);
        REPAIR.reportText=reportText(REPAIR.check);
        if(window.SB_renderInspector) window.SB_renderInspector();
      }
      if(act==='apply'){
        const plan=REPAIR.check; if(!plan||!plan.accepted.length) return;
        const lines=plan.perTpl.filter(p=>p.ok).map(p=>`• ${p.label} (${p.tpl}) — устранено: ${p.resolved.length}, осталось: ${p.remaining.length}`).join('\n');
        const bad=plan.perTpl.filter(p=>!p.ok).map(p=>`• ${p.label} (${p.tpl}) — НЕ будет заменён`).join('\n');
        const msg=`Заменить ${plan.accepted.length} шаблон(ов) исправленными записями?\n\n${lines}${bad?'\n\nНе будут заменены:\n'+bad:''}\n\nПеред заменой скачается резервная копия исходных записей. Откат — Ctrl+Z.`;
        if(!confirm(msg)) return;
        const r=applyReturn(plan);
        REPAIR.result=`Заменено: ${r.applied}. Откат — Ctrl+Z.`;
        REPAIR.check=null; REPAIR.reportText=''; REPAIR.text='';
        if(window.SB_renderInspector) window.SB_renderInspector();
      }
      if(act==='copy'){
        const t=REPAIR.reportText||reportText(REPAIR.check);
        const fb=()=>{ const x=document.createElement('textarea'); x.value=t; document.body.appendChild(x); x.select(); try{ document.execCommand('copy'); }catch(e){} x.remove(); };
        if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(fb); else fb();
        if(typeof toast==='function') toast('Отчёт скопирован');
      }
    });
  }

  window.SB_repair={ exportPackage, validateReturn, applyReturn, reportText, html, bind, state:REPAIR,
    setExpected(ids){ REPAIR.expected=(ids||[]).slice(); REPAIR.check=null; } };
})();
