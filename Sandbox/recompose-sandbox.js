/* ============================================================
   recompose-sandbox.js — интеграция Recompose в Original Sandbox (UI)
   ------------------------------------------------------------
   Алгоритмов здесь нет: всё вычисляет recompose-core.js (window.RecomposeCore).
   Блок «Recompose / Конвертация 16:9» — в инспекторе под «Real Size / Real Ratio»
   (контейнер #rcBox, вставляется renderInspector). Вкладки нет.

   • один шаблон: рекомендация с причиной, 4 метода, результат, диагностика
     шаблона и результата, действия;
   • несколько шаблонов: метод применяется к каждому отдельно, сводка
     (обработано / ок / предупреждения / ошибки) и статус по каждому;
   • «Создать дубликат(ы)» — действие по умолчанию; исходники не меняются;
   • «Применить к исходным» — только после подтверждения, откатывается Ctrl+Z.
   Методы — переключатели: первый клик включает метод и показывает результат
   в рабочей области (и на карте); повторный клик выключает превью и возвращает
   исходный вид. Результат всегда считается из исходного шаблона (кэш по хэшу
   исходника). Превью не меняет сохраняемые исходники.
   ============================================================ */
(function(){
'use strict';
if(window.RC_mount) return;

function rcFmt(){ return RC.format||'16:9'; }
const METHOD_LABEL = { smart:'Реконструкция по ролям', compact:'Адаптивная сетка',
                       split:'Редакционный split', fit:'Контрольный safe-fit' };
const RC = { method:null, format:'16:9', ids:[], lastIds:'', key:'', el:null, open:true,
             gen:0, queue:Promise.resolve(), cache:new Map(), pending:new Set(), report:null,
             shown:'', last:new Map() };

const rcEsc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Границы: выход за кадр и внутренняя обрезка показываются раздельно. Обрезка не считается успехом.
function rcBoundsText(r){
  const b=(r&&r.bounds)||{}, ov=b.overflowCount||0, cl=b.clippedCount||0;
  const cover=(r&&r.cover)||[], unv=(r&&r.unverifiable)||[];
  const parts=[];
  if(ov>0) parts.push(`✕ выход за кадр: ${ov}`);
  if(cl>0) parts.push(`⚠ внутренняя обрезка: ${cl} (overflow hidden/clip)`);
  if(!parts.length) parts.push(b.inside ? '✓ выход за кадр: 0 · внутренняя обрезка: 0' : '— не проверено (см. ошибку)');
  if(cover.length) parts.push(`cover (намеренно): ${cover.length}`);
  if(unv.length) parts.push(`не проверено: ${[...new Set(unv)].join(', ')}`);
  return parts.join(' · ');
}
// Превью канонического результата: изолированный документ 1600×900 в iframe (без CSS хоста, без скриптов).
function rcHash(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(16).padStart(8,'0'); }
const RC_ROLE_GROUPS = { title:['title','statement','heading','h1'], body:['body','text','description'],
                         subtitle:['subtitle','overline','kicker','tag'], meta:['meta','smallMeta','label','link'] };

/* ---------- стиль (один раз) ---------- */
function rcInstallStyle(){
  if(document.getElementById('rcStyle')) return;
  const s=document.createElement('style'); s.id='rcStyle';
  s.textContent=`
.rc-box{margin:10px 0;border:1px solid #2a2f3a;border-radius:8px;background:rgba(255,255,255,.02);font-size:12px}
.rc-box>summary{cursor:pointer;padding:9px 10px;font-weight:700;letter-spacing:.2px;list-style:none;display:flex;align-items:center;gap:8px}
.rc-box>summary::-webkit-details-marker{display:none}
.rc-box>summary:before{content:'▸';color:#8b93a1;transition:transform .15s}
.rc-box[open]>summary:before{transform:rotate(90deg)}
.rc-badge{font-size:10px;font-weight:600;color:#8b93a1;border:1px solid #2a2f3a;border-radius:10px;padding:1px 7px}
.rc-body{padding:0 10px 10px;display:flex;flex-direction:column;gap:9px}
.rc-rec{color:#c9ced8;line-height:1.45}
.rc-why{color:#8b93a1;font-size:11px;margin-top:3px}
.rc-methods{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.rc-m{border:1px solid #2a2f3a;background:transparent;color:#c9ced8;border-radius:6px;padding:6px 6px;font-size:11px;cursor:pointer;text-align:left}
.rc-m b{display:block;font-size:11px}
.rc-m.on{border-color:#3a6bff;background:rgba(58,107,255,.18);color:#fff}
.rc-sel-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:6px;margin-bottom:6px}
.rc-lbl{display:flex;flex-direction:column;gap:3px;font-size:11px;color:#8b93a1;min-width:0}
.rc-sel{width:100%;min-width:0;box-sizing:border-box;background:#15181f;color:#e6e9ef;border:1px solid #2a2f3a;border-radius:6px;padding:5px 6px;font-size:12px;text-overflow:ellipsis}
.rc-sel:disabled{opacity:.5}
.rc-mhelp{color:#8b93a1;font-size:11px;line-height:1.4}
.rc-prev{width:100%;border:1px solid #2a2f3a;border-radius:6px;background:#0c0e12;overflow:hidden}
.rc-empty{padding:18px 10px;color:#8b93a1;text-align:center;border:1px dashed #2a2f3a;border-radius:6px;font-size:11px}
.rc-status{font-weight:700;font-size:12px}
.rc-status.ok{color:#3ecf8e}.rc-status.warning{color:#e0b23a}.rc-status.failed{color:#ff5b6a}.rc-status.pending{color:#8b93a1}
.rc-table{width:100%;border-collapse:collapse;font-size:11px}
.rc-table td,.rc-table th{border-bottom:1px solid #2a2f3a;padding:4px 4px;text-align:left;vertical-align:top}
.rc-table th{color:#8b93a1;font-weight:600}
.rc-sec{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#8b93a1;margin-top:2px}
.rc-list{margin:0;padding-left:16px;color:#c9ced8;font-size:11px;line-height:1.45}
.rc-list.warn{color:#e0b23a}.rc-list.bad{color:#ff8a94}
.rc-kv{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:11px;color:#c9ced8}
.rc-kv span:nth-child(odd){color:#8b93a1}
.rc-acts{display:flex;flex-wrap:wrap;gap:6px}
.rc-btn{border:1px solid #2a2f3a;background:#1b2029;color:#e6e9ef;border-radius:6px;padding:7px 9px;font-size:12px;cursor:pointer}
.rc-btn:disabled{opacity:.45;cursor:default}
.rc-btn.primary{background:#2f5fe8;border-color:#2f5fe8;color:#fff;font-weight:700}
.rc-btn.dup{border-color:#3ecf8e;color:#8ff0c3}
.rc-btn.warn{border-color:#e0b23a;color:#f3d48b}
.rc-btn.small{padding:4px 8px;font-size:11px}
#rcConfirm{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999}
#rcConfirm .rc-dlg{background:#15181f;border:1px solid #2a2f3a;border-radius:10px;padding:18px;max-width:440px;color:#e6e9ef;font-size:13px;line-height:1.5}
#rcConfirm .rc-dlg h3{margin:0 0 8px;font-size:15px}
#rcConfirm .rc-dlg p{margin:0 0 14px;color:#c9ced8}
#rcConfirm .rc-acts{justify-content:flex-end}`;
  document.head.appendChild(s);
}

/* ---------- выбор и кэш ---------- */
function rcSelIds(){
  const ids=[...checked].filter(id=>LIB[id]);
  if(ids.length>1) return ids;
  return (selectedId && LIB[selectedId]) ? [selectedId] : [];
}
// Оригинал шаблона: для дубликатов и применённых к исходному — сохранённый до первого применения HTML.
// Так каждый метод считается от оригинала, а не от уже сконвертированного результата.
function rcOriginHtml(id){
  const t=LIB[id]; if(!t) return '';
  return String(t.recompose_orig!=null ? t.recompose_orig : (t.html||''));
}
function rcSrcHash(id){ return rcHash(rcOriginHtml(id)); }
function rcKey(id,m){ return id+'|'+m+'|'+rcSrcHash(id)+'|'+rcFmt(); }
// Подпись методов для интерфейса: название из модуля (если модуль не загружен — из прежней таблицы)
function rcLabel(m){ const d=window.RecomposeCore.adaptation.get(m); return d?d.name:(METHOD_LABEL[m]||m||''); }
function rcReliable(id){
  const h=String((LIB[id]&&LIB[id].html)||'');
  return /sv-section/.test(h) && /data-sb-editable/.test(h);
}
// Очередь: конвертации идут по одной, ошибка одного шаблона не останавливает очередь
function rcRun(id,m){
  const key=rcKey(id,m);
  if(RC.cache.has(key)) return Promise.resolve(RC.cache.get(key));
  const snap={tpl:id, label:(LIB[id]||{}).label, html:rcOriginHtml(id)};
  const job=RC.queue.then(()=>window.RecomposeCore.convert(snap,m,{format:rcFmt()}));
  RC.queue=job.catch(()=>{});
  return job.then(r=>{ RC.cache.set(key,r); return r; }).catch(e=>{
    const r={status:'failed', ok:false, error:String(e&&e.message||e), reasons:['ошибка: '+(e&&e.message||e)], warnings:[], notes:[], overflow:[], diagnostics:{}, structure:{preserved:false,diffs:[]}, bounds:{inside:false,overflowCount:0}, fit:{factor:1,steps:0}, html:''};
    RC.cache.set(key,r); return r;
  });
}

// failed: метод не применим к шаблону — результат не применяется и не выбирается
function rcIsFailed(id,m){ const r=RC.cache.get(rcKey(id,m)); return !!(r && r.status==='failed'); }
// фоновая проверка методов формата для одного шаблона (кэш); результат не выводится, пока метод не выбран
function rcProbe(id, list){
  list.forEach(d=>{
    const key=rcKey(id,d.id);
    if(RC.cache.has(key) || RC.pending.has(key)) return;
    RC.pending.add(key);
    rcRun(id,d.id).then(()=>{ RC.pending.delete(key); rcRefresh(); });
  });
}

/* ---------- статическая диагностика (до конвертации, без layout) ---------- */
function rcStatic(id){
  const d=new DOMParser().parseFromString('<body>'+String((LIB[id]||{}).html||'')+'</body>','text/html');
  const b=d.body; const c=s=>b.querySelectorAll(s).length;
  const roles={title:0,body:0,subtitle:0,meta:0,other:[]};
  b.querySelectorAll('[data-role]').forEach(e=>{ const r=e.getAttribute('data-role');
    const g=Object.keys(RC_ROLE_GROUPS).find(k=>RC_ROLE_GROUPS[k].includes(r)); if(g) roles[g]++; else roles.other.push(r); });
  roles.other=[...new Set(roles.other)];
  const media=[...b.querySelectorAll('[data-sb-media],.sv-media')];
  const missing=[];
  const eds=[...b.querySelectorAll('[data-sb-editable]')];
  if(!eds.length) missing.push('нет data-sb-editable: тексты ищутся по тегам');
  const noRole=eds.filter(e=>!e.hasAttribute('data-role')).length; if(noRole) missing.push(`data-role не задан у ${noRole} текстов`);
  if(!media.length) missing.push('нет медиа-слота');
  const noSlot=media.filter(e=>!e.hasAttribute('data-slot')).length; if(noSlot) missing.push(`data-slot не задан у ${noSlot} медиа`);
  return {
    root: c('.sv-section')>0,
    roles, media:{count:media.length, slots:media.map(e=>e.getAttribute('data-slot')||'(без slot)')},
    markers:{'data-sb-editable':c('[data-sb-editable]'),'data-sb-media':c('[data-sb-media]'),'data-slot':c('[data-slot]'),
             'data-role':c('[data-role]'),'data-kind':c('[data-kind]'),'data-sb-repeat':c('[data-sb-repeat]')},
    missing
  };
}

/* ---------- рендер блока ---------- */
function rcRoleText(r){
  const parts=[`title ${r.title}`,`body ${r.body}`,`subtitle ${r.subtitle}`,`meta ${r.meta}`];
  if(r.other&&r.other.length) parts.push('прочие: '+r.other.join(', '));
  return parts.join(' · ');
}
function rcStatusText(r){
  if(!r) return null;
  if(r.status==='ok') return {cls:'ok', text:'✓ ok — проверки пройдены'};
  if(r.status==='warning') return {cls:'warning', text:'⚠ результат с предупреждениями'};
  if(r.status==='failed') return {cls:'failed', text:'✕ failed — результат не применяется'};
  return {cls:'failed', text:'✕ результат не создан'};
}
function rcDiagRows(id,r){
  const s=rcStatic(id); const d=(r&&r.diagnostics)||{};
  const rows=[];
  rows.push(['Измерение', r ? (d.stable?`✓ стабильно (${d.measure&&d.measure.h1}px)`:'⚠ нестабильно: высота менялась между замерами') : 'появится после конвертации']);
  rows.push(['Корень', r ? (d.rootFound?`✓ ${rcEsc(d.rootTag)}${d.rootClass?'.'+rcEsc(String(d.rootClass).split(' ')[0]):''}`:'✕ .sv-section не найден (общий контейнер)') : (s.root?'✓ .sv-section найден':'✕ .sv-section не найден')]);
  rows.push(['Роли', rcRoleText(r && d.roles ? d.roles : s.roles)]);
  const media=r&&d.media?d.media:s.media;
  rows.push(['Медиа-слоты', `${media.count}${media.slots.length?' — '+rcEsc(media.slots.join(', ')):''}`]);
  const mk=(r&&d.markers)||s.markers;
  rows.push(['Маркеры', Object.entries(mk).map(([k,v])=>`${k} ${v}`).join(' · ')]);
  const h=r?(d.handler||'generic'):null;
  rows.push(['Спец. обработчик', r ? (h==='generic'?'не совпал — семантический fallback (generic)':'совпал: '+rcEsc(h)) : 'определяется при конвертации']);
  const miss=(r&&d.missing)||s.missing;
  rows.push(['Не хватает', miss.length?miss.map(rcEsc).join('; '):'—']);
  rows.push(['Переполнение исходника', r ? String((d.sourceOverflow||[]).length) : '—']);
  return rows;
}
function rcResultRows(r){
  const rows=[];
  rows.push(['Метод', `${rcEsc(r.methodName||'')} (${rcEsc(r.method)})`]);
  rows.push(['Обработчик', r.handler==='generic'?'generic (fallback)':rcEsc(r.handler)]);
  rows.push(['Сжатие текста', r.fit.factor<1?`${Math.round(r.fit.factor*100)}% (шагов ${r.fit.steps})`:'не требуется']);
  rows.push(['Границы 1600×900', rcBoundsText(r)]);
  rows.push(['Структура и текст', r.structure.preserved?'✓ сохранены':'✕ изменены: '+r.structure.diffs.map(d=>d.key).join(', ')]);
  rows.push(['Мин. кегль', r.minFont!=null?r.minFont+' px':'—']);
  rows.push(['Время', (r.ms||0)+' мс']);
  return rows;
}
function rcList(items,cls){ return items&&items.length?`<ul class="rc-list ${cls||''}">${items.map(x=>`<li>${rcEsc(x)}</li>`).join('')}</ul>`:'<div style="color:#8b93a1;font-size:11px">—</div>'; }
function rcKv(rows){ return `<div class="rc-kv">${rows.map(([k,v])=>`<span>${rcEsc(k)}</span><span>${v}</span>`).join('')}</div>`; }

// Ctrl+колесо по селектору: один шаг на щелчок, без пропусков; отключённые пункты пропускаются (как в Pano).
const RC_WHEEL={ threshold:60, lockMs:160, idleMs:260 };
function rcBindWheel(sel){
  let acc=0, lastDir=0, lockUntil=0, lastEvent=0;
  sel.addEventListener('wheel', e=>{
    if(!e.ctrlKey) return;               // без Ctrl поведение страницы не меняется
    e.preventDefault(); e.stopPropagation();
    if(sel.disabled) return;
    const now=Date.now();
    let dy=e.deltaY;
    if(e.deltaMode===1) dy*=16; else if(e.deltaMode===2) dy*=400;
    if(!dy) return;
    const dir=dy>0?1:-1;
    if(now-lastEvent>RC_WHEEL.idleMs || dir!==lastDir) acc=0;   // новый жест или смена направления
    lastEvent=now; lastDir=dir;
    if(now<lockUntil) return;            // пауза после шага
    acc+=dy;
    if(Math.abs(acc)<RC_WHEEL.threshold) return;
    acc=0; lockUntil=now+RC_WHEEL.lockMs;
    const list=[...sel.options].filter(o=>!o.disabled).map(o=>o.value);
    if(!list.length) return;
    const idx=list.indexOf(sel.value);
    const next=Math.max(0,Math.min(list.length-1,(idx<0?(dir>0?-1:0):idx)+dir));
    if(list[next]===sel.value) return;
    sel.value=list[next];
    sel.dispatchEvent(new Event('change',{bubbles:true}));  // вызывает onchange: rcSetFormat / rcSetMethod
  }, {passive:false});
}
function rcRender(){
  const box=RC.el;
  if(!box || !box.isConnected) return;
  const ids=RC.ids, m=RC.method, multi=ids.length>1;
  if(!ids.length){ box.innerHTML=''; return; }
  const rec=window.RecomposeCore.recommend(LIB[ids[0]]);
  const results=ids.map(id=>({id, r:RC.cache.get(rcKey(id,m))||null, pend:RC.pending.has(rcKey(id,m))}));
  const first=results[0];
  let h=`<details class="rc-box" ${RC.open?'open':''}><summary>Recompose / Конвертация ${rcFmt()}<span style="flex:1"></span><span class="rc-badge">${multi?ids.length+' шабл.':'1 шабл.'}</span></summary><div class="rc-body">`;
  // рекомендация
  if(!multi){
    h+=`<div class="rc-rec">Рекомендация: <b>${rcEsc(rcLabel(rec.method))}</b> <span style="color:#8b93a1">(${rec.method})</span><div class="rc-why">${rcEsc(rec.why)}</div></div>`;
  } else {
    const cnt={}; ids.forEach(id=>{const x=window.RecomposeCore.recommend(LIB[id]).method; cnt[x]=(cnt[x]||0)+1;});
    h+=`<div class="rc-rec">Рекомендации по выбранным: ${Object.entries(cnt).map(([k,v])=>`${k} ×${v}`).join(', ')}<div class="rc-why">Метод применяется к каждому шаблону отдельно. Выбранный ниже метод — общий для пакета.</div></div>`;
  }
  // формат и метод: два связанных списка; методы — только доступные для формата и приложения
  const A=window.RecomposeCore.adaptation, app=A.getApp();
  const avail=A.list(rcFmt(), app);
  if(!multi) rcProbe(first.id, avail);      // статусы методов для шаблона: failed видно до выбора
  const cur=m?A.get(m):null;
  h+=`<div class="rc-sel-row"><label class="rc-lbl">Формат<select class="rc-sel" data-rc-format>${window.RecomposeCore.listFormats().map(f=>`<option value="${rcEsc(f.id)}"${f.id===rcFmt()?' selected':''}>${rcEsc(f.label)} · ${f.w}×${f.h}${f.validated?'':' · не проверен'}</option>`).join('')}</select></label>`;
  h+=`<label class="rc-lbl">Метод адаптации<select class="rc-sel" data-rc-method${avail.length?'':' disabled'}><option value="">— выключено —</option>${avail.map(d=>{const bad=!multi&&rcIsFailed(first.id,d.id); return `<option value="${rcEsc(d.id)}"${d.id===m?' selected':''}${bad?' disabled':''}>${rcEsc(d.name)}${bad?' · failed (не применимо)':''}</option>`;}).join('')}</select></label></div>`;
  if(!avail.length) h+=`<div class="rc-mhelp">Для формата ${rcEsc(rcFmt())} в приложении «${rcEsc(app)}» методов нет.</div>`;
  h+=`<div class="rc-mhelp">${cur?rcEsc(cur.description):'Метод не выбран: выбор метода включит превью в рабочей области, «— выключено —» вернёт исходный вид.'}</div>`;
  // результат
  if(!multi){
    const r=first.r;
    if(r && r.html){
      const st=rcStatusText(r);
      h+=`<div class="rc-status ${st.cls}">${st.text}</div>`;
    } else {
      h+=`<div class="rc-empty">${first.pend?'Конвертирую…':(m?'Результат ещё не создан.':'Превью выключено. Выберите метод — результат появится в рабочей области.')}</div>`;
      h+=`<div class="rc-status ${first.pend?'pending':''}">${first.pend?'…':''}</div>`;
    }
  } else {
    const done=results.filter(x=>x.r);
    const ok=done.filter(x=>x.r.status==='ok').length, wr=done.filter(x=>x.r.status==='warning').length, fl=done.filter(x=>x.r.status==='failed').length;
    h+=`<div class="rc-sec">Сводка пакета</div>`;
    h+=`<div class="rc-kv"><span>Обработано</span><span>${done.length} из ${ids.length}</span><span>Ок</span><span>${ok}</span><span>Предупреждения</span><span>${wr}</span><span>Ошибки</span><span>${fl}</span></div>`;
    h+=`<table class="rc-table"><tr><th>Шаблон</th><th>Статус</th><th>Причина / предупреждение</th></tr>`;
    results.forEach(x=>{
      const st=x.r?rcStatusText(x.r):{cls:'pending',text:x.pend?'…':'не запущено'};
      const why=x.r?((x.r.reasons&&x.r.reasons[0])||(x.r.warnings&&x.r.warnings[0])||(x.r.error||'—')):'—';
      h+=`<tr><td>${rcEsc((LIB[x.id]||{}).label||x.id)}</td><td class="rc-status ${st.cls}" style="font-size:11px">${rcEsc(st.text)}</td><td>${rcEsc(why)}</td></tr>`;
    });
    h+=`</table>`;
  }
  // диагностика шаблона и результата (один шаблон — подробно; пакет — по выбранному шаблону)
  const dId=first.id;
  h+=`<div class="rc-sec">Диагностика шаблона${multi?' (первый в пакете)':''}</div>${rcKv(rcDiagRows(dId, first.r))}`;
  if(first.r){
    h+=`<div class="rc-sec">Результат</div>${rcKv(rcResultRows(first.r))}`;
    h+=`<div class="rc-sec">Выход за кадр</div>${first.r.overflow&&first.r.overflow.length?rcList(first.r.overflow.map(o=>`${o.name}: ${o.reason}`),'bad'):'<div style="color:#3ecf8e;font-size:11px">Выхода за кадр нет</div>'}<div class="rc-sec">Внутренняя обрезка</div>${first.r.clipped&&first.r.clipped.length?rcList(first.r.clipped.map(o=>`${o.name}: ${o.reason}`),'warn'):'<div style="color:#8b93a1;font-size:11px">Обрезки нет</div>'}`;
    h+=`<div class="rc-sec">Предупреждения</div>${rcList(first.r.warnings,'warn')}`;
    h+=`<div class="rc-sec">Причины и замечания</div>${rcList([...(first.r.reasons||[]),...(first.r.notes||[])])}`;
  }
  // действия
  const anyOk=results.some(x=>x.r && x.r.html && x.r.status!=='failed');
  h+=`<div class="rc-sec">Действия</div><div class="rc-acts">`;
  h+=`<button class="rc-btn primary" data-rc-act="run" ${(RC.pending.size||!RC.method)?'disabled':''}>${multi?'Конвертировать все':(first.r?'Пересчитать':'Конвертировать')}</button>`;
  h+=`<button class="rc-btn dup" data-rc-act="dup" ${anyOk?'':'disabled'} title="Создаёт новые шаблоны; исходники не меняются">Создать дубликат${multi?'ы':''}</button>`;
  h+=`<button class="rc-btn warn" data-rc-act="apply" ${anyOk?'':'disabled'} title="Заменяет HTML исходных шаблонов; откат — Ctrl+Z">Применить к исходным…</button>`;
  h+=`</div>`;
  h+=`</div></details>`;
  box.innerHTML=h;
  // события
  const det=box.querySelector('details');
  det.addEventListener('toggle',()=>{ RC.open=det.open; });
  const fsel=box.querySelector('[data-rc-format]'); if(fsel) fsel.onchange=()=>rcSetFormat(fsel.value);
  const msel=box.querySelector('[data-rc-method]'); if(msel) msel.onchange=()=>rcSetMethod(msel.value||null);
  if(fsel) rcBindWheel(fsel); if(msel) rcBindWheel(msel);   // Ctrl+колесо: пошаговый выбор (как в Pano)
  box.querySelectorAll('[data-rc-act]').forEach(b=>b.onclick=()=>rcAction(b.getAttribute('data-rc-act')));
}

/* ---------- действия ---------- */
async function rcAutoRun(ids,m){
  const gen=++RC.gen;
  ids.forEach(id=>{ if(window.SB_fillSlots) window.SB_fillSlots(id); });
  for(const id of ids){
    if(gen!==RC.gen) return;               // запущен новый прогон: он доделает оставшиеся
    const key=rcKey(id,m);
    if(RC.cache.has(key) || RC.pending.has(key)) continue;
    RC.pending.add(key); rcRefresh();
    await rcRun(id,m);
    RC.pending.delete(key);
    rcRefresh();                           // результат сразу виден в рабочей области и на карте
  }
}
// Выбор метода в списке: пустое значение выключает превью (исходный вид); недоступный для формата метод игнорируется.
function rcSetMethod(m){
  const A=window.RecomposeCore.adaptation;
  const sel=rcSelIds()[0];
  if(m && sel && rcIsFailed(sel,m)) return;   // failed в выборе не участвует
  if(m && !A.list(rcFmt(),A.getApp()).some(d=>d.id===m)) return;
  if(!m || RC.method===m){
    RC.method=null; RC.gen++;
    rcRestoreStage();
    rcRefresh();
    return;
  }
  RC.method=m;
  rcRefresh();
  rcAutoRun(rcSelIds(),m);
}
// Смена формата: результаты считаются отдельно для каждого формата; если метод недоступен — превью выключается.
function rcSetFormat(f){
  const A=window.RecomposeCore.adaptation;
  if(f===rcFmt() || !window.RecomposeCore.listFormats().some(x=>x.id===f)) return;
  RC.format=f;
  if(RC.method && !A.list(f,A.getApp()).some(d=>d.id===RC.method)){
    RC.method=null; RC.gen++;
    rcRestoreStage();
    rcRefresh();
    return;
  }
  rcRefresh();
  if(RC.method) rcAutoRun(rcSelIds(),RC.method);
}
async function rcRunAll(ids,m){
  for(const id of ids){
    const key=rcKey(id,m);
    if(RC.pending.has(key)) continue;
    RC.pending.add(key); rcRefresh();
    await rcRun(id,m);
    RC.pending.delete(key); rcRefresh();
  }
}
function rcRefresh(){ rcRender(); rcPaintStage(); rcGalleryRefresh(); }
function rcBadge(text){
  const b=document.getElementById('rcStageBadge');
  if(!b) return;
  b.textContent=text||''; b.style.display=text?'':'none';
}
// Рабочая область: результат — обычный HTML шаблона (тот же путь, что у дубликата):
// чёткий текст, медиа через cleanPreview/applyPoolImages. Пока новый результат не готов,
// на экране остаётся предыдущий результат того же шаблона — оригинал не мелькает.
function rcPaintStage(){
  if(!RC.method || !selectedId || !LIB[selectedId]) return;
  const preview=document.getElementById('preview');
  if(!preview) return;
  const id=selectedId, key=rcKey(id,RC.method), r=RC.cache.get(key);
  const mname=rcLabel(RC.method);
  if(r && r.html && r.status!=='failed'){
    if(RC.shown!=='ok|'+key){
      RC.shown='ok|'+key;
      preview.innerHTML=r.html;
      cleanPreview(preview);
      applyPoolImages(preview,id);
      RC.last.set(id,{key:'rc|'+key, html:r.html});
    }
    rcBadge(`Recompose · ${mname} · ${rcStatusText(r).text}`);
    return;
  }
  if(r){                                   // результат есть, но не создан
    RC.shown='';
    const why=r.error||(r.reasons||[])[0]||'результат не создан';
    preview.innerHTML=`<div class="stage-empty"><b>Результат не создан</b>${rcEsc(why)}</div>`;
    rcBadge(`Recompose · ${mname} · ✕ не создан`);
    return;
  }
  // результата ещё нет: предыдущий результат того же шаблона остаётся на экране
  if(RC.shown.startsWith('ok|'+id+'|')){     // на экране уже результат этого шаблона (другим методом)
    rcBadge(`Recompose · ${mname} · …`);
    return;
  }
  RC.shown='';
  preview.innerHTML=`<div class="stage-empty"><b>Конвертирую…</b>${rcEsc(mname)}</div>`;
  rcBadge(`Recompose · ${mname} · …`);
}
function rcRestoreStage(){
  rcBadge(''); RC.shown=''; RC.last.clear();
  if(selectedId && LIB[selectedId]) selectTpl(selectedId,true);
}
function rcGalleryRefresh(){
  const g=window.SB_Gallery;
  if(g && g.mode==='grid' && g.rebuild) g.rebuild(false);
}
// Хук selectTpl: при включённом методе показываем результат вместо исходника
window.RC_onStage=function(id){
  if(!RC.method || id!==selectedId) return;
  RC.shown='';
  rcPaintStage();
  const ids=rcSelIds();
  rcAutoRun(ids.length?ids:[id], RC.method);
};
// Хук карты: HTML для карточки (результат или исходник)
window.RC_viewMarkup=function(id){
  if(!RC.method) return null;
  // результат показываем только у выделенных: остальные шаблоны всегда в исходном виде
  if(!(checked.has(id) || id===selectedId)){ RC.last.delete(id); return null; }
  const r=RC.cache.get(rcKey(id,RC.method));
  if(r && r.html) return { key:'rc|'+rcKey(id,RC.method), markup:r.html };
  if(RC.last.has(id)){ const L=RC.last.get(id); return { key:L.key, markup:L.html }; }
  return null;
};

// Поля кадра. canvas — эталонный холст Frame Contract (1920×1080), как требует контракт и импорт.
// frameContract — та же строка, что пишет импорт (tpl2.frameContract = normalizedFrame.contract).
// recomposeFrame — рабочий кадр движка 1600×900; новое поле, существующие не меняются.
function rcFrameFields(){
  const info = window.SB_FRAME_CONTRACT && SB_FRAME_CONTRACT.info ? SB_FRAME_CONTRACT.info(rcFmt()) : null;
  const c = (info && info.canvas) || {width:1920,height:1080};
  return { aspect:rcFmt(), canvas:{width:c.width,height:c.height}, frameContract:'sandbox-frame-v1',
           recomposeFrame:{ w:1600, h:900, algo:window.RecomposeCore.ALGO } };
}
function rcMeta(srcId, srcHash, r, m){
  const d=r.diagnostics||{};
  // Происхождение (аддитивно): родитель, исходная база, вход шага и хеш результата.
  // Существующие поля sourceTpl/sourceHash/method/format не меняют смысл.
  const prev=(LIB[srcId]&&LIB[srcId].recompose)||null;
  const baseTpl=(prev&&typeof prev.baseTpl==='string'&&prev.baseTpl)||srcId;
  return { sourceTpl:srcId, sourceHash:srcHash, method:m, format:rcFmt(), algo:window.RecomposeCore.ALGO,
           status:r.status, createdAt:new Date().toISOString(), fit:r.fit, handler:r.handler,
           structurePreserved:!!(r.structure&&r.structure.preserved), overflowCount:(r.overflow||[]).length,
           stable:!!d.stable, warnings:r.warnings||[], reasons:r.reasons||[],
           parentTpl:srcId, baseTpl:baseTpl, inputTpl:baseTpl, inputKind:'origin',
           resultHash:rcHash(String(r.html||'')) };
}
/* ---- Метаданные Recompose: явный белый список полей (никакого blind copy) ---- */
function rcSanitizeRecompose(x){
  const str=v=>typeof v==='string'?v:undefined;
  const num=v=>(typeof v==='number'&&isFinite(v))?v:undefined;
  const bool=v=>typeof v==='boolean'?v:undefined;
  const strs=v=>Array.isArray(v)?v.filter(q=>typeof q==='string').slice(0,200):undefined;
  const o={};
  const set=(k,v)=>{ if(v!==undefined) o[k]=v; };
  set('sourceTpl',str(x.sourceTpl)); set('sourceHash',str(x.sourceHash));
  set('method', (typeof x.method==='string' && /^[a-z][a-z0-9-]{1,39}$/.test(x.method))?x.method:undefined);
  set('format',str(x.format)); set('algo',str(x.algo)); set('status',str(x.status)); set('createdAt',str(x.createdAt));
  if(x.fit && typeof x.fit==='object') o.fit={ factor:num(x.fit.factor), steps:num(x.fit.steps) };
  set('handler',str(x.handler)); set('structurePreserved',bool(x.structurePreserved));
  set('overflowCount',num(x.overflowCount)); set('stable',bool(x.stable));
  set('warnings',strs(x.warnings)); set('reasons',strs(x.reasons));
  set('appliedToOriginal',bool(x.appliedToOriginal));
  set('parentTpl',str(x.parentTpl)); set('baseTpl',str(x.baseTpl)); set('inputTpl',str(x.inputTpl));
  set('inputKind',['origin','result'].includes(x.inputKind)?x.inputKind:undefined);
  set('resultHash',str(x.resultHash));
  return o;
}
/* Возвращает объект с полями Recompose для шаблона или null (обычный шаблон — без изменений). */
window.RC_pickMeta=function(raw){
  if(!raw || typeof raw!=='object') return null;
  const num=v=>(typeof v==='number'&&isFinite(v))?v:undefined;
  const hasRc=!!(raw.recompose && typeof raw.recompose==='object');
  const orig=(typeof raw.recompose_orig==='string' && raw.recompose_orig.length)?raw.recompose_orig:undefined;
  if(!hasRc && orig===undefined) return null;
  const out={};
  if(orig!==undefined) out.recompose_orig=orig;
  if(hasRc) out.recompose=rcSanitizeRecompose(raw.recompose);
  if(raw.recompose_prev && typeof raw.recompose_prev==='object'){
    const p=raw.recompose_prev;
    out.recompose_prev={
      canvas:(p.canvas&&typeof p.canvas==='object')?{ width:num(+p.canvas.width), height:num(+p.canvas.height) }:null,
      aspect:typeof p.aspect==='string'?p.aspect:null,
      frameContract:typeof p.frameContract==='string'?p.frameContract:null };
  }
  if(typeof raw.frameContract==='string') out.frameContract=raw.frameContract;
  if(raw.recomposeFrame && typeof raw.recomposeFrame==='object')
    out.recomposeFrame={ w:num(+raw.recomposeFrame.w), h:num(+raw.recomposeFrame.h), algo:String(raw.recomposeFrame.algo||'') };
  return out;
};
/* Ссылки на другие шаблоны внутри метаданных Recompose. */
window.RC_refsOf=function(t){
  const r=t&&t.recompose; if(!r) return [];
  return ['sourceTpl','parentTpl','baseTpl','inputTpl'].map(k=>r[k]).filter(v=>typeof v==='string' && v);
};
/* Переводит ссылки на новые ID после импорта с переименованием (_001 и т.п.). */
window.RC_remapTplRefs=function(t,map){
  const r=t&&t.recompose; if(!r) return;
  ['sourceTpl','parentTpl','baseTpl','inputTpl'].forEach(k=>{
    if(typeof r[k]==='string' && Object.prototype.hasOwnProperty.call(map,r[k])) r[k]=map[r[k]];
  });
};
// Создание дубликатов или применение к исходным. Ошибка одного шаблона не останавливает пакет.
async function rcCreate(ids,m,mode){
  const report={mode, processed:0, ok:0, warnings:0, failed:0, items:[]};
  const results=[];
  for(const id of ids){ results.push([id, await rcRun(id,m)]); }
  pushUndo();
  const created=[], changed=[];
  for(const [id,r] of results){
    report.processed++;
    const label=(LIB[id]||{}).label||id;
    if(!r || r.status==='failed' || !r.html){
      report.failed++;
      report.items.push({id, label, status:'failed', reason:(r&&(r.error||(r.reasons||[])[0]))||'нет результата'});
      continue;
    }
    if(r.status==='ok') report.ok++; else report.warnings++;
    report.items.push({id, label, status:r.status, reason:(r.warnings||[])[0]||(r.reasons||[])[0]||'—'});
    try{
      const src=LIB[id];
      const srcHash=rcSrcHash(id);
      if(mode==='dup'){
        const uid=makeUniqueTpl(`${id}_r169_${m}`);
        const clone=JSON.parse(JSON.stringify(src));
        clone.tpl=uid;
        clone.label=`${src.label||id} · Converted 16:9 · ${m}`;
        clone.html=r.html;
        clone.recompose_orig=rcOriginHtml(id);
        if(window.SB_copyImgAssign) window.SB_copyImgAssign(id,uid);
        Object.assign(clone, rcFrameFields());
        clone.batch=src.batch||null;
        // Поля, относящиеся к исходной раскладке, в копии не переносятся (как в предыдущей версии конвертера)
        if(Object.prototype.hasOwnProperty.call(clone,'motion')) delete clone.motion;
        if(Object.prototype.hasOwnProperty.call(clone,'entities') && !Array.isArray(src.entities)) delete clone.entities;
        clone.recompose=rcMeta(id,srcHash,r,m);
        LIB[uid]=clone;
        if(window.SB_recordConversion) window.SB_recordConversion(uid, src, rcFmt(), {method:m});
        created.push(uid); checked.add(uid);
      } else {
        // предыдущие значения сохраняем в метаданных; откат — Ctrl+Z (снимок LIB)
        src.recompose_prev = {canvas: src.canvas===undefined?null:src.canvas, aspect: src.aspect===undefined?null:src.aspect,
                              frameContract: src.frameContract===undefined?null:src.frameContract};
        src.recompose_orig=rcOriginHtml(id);
        src.html=r.html;
        Object.assign(src, rcFrameFields());
        src.recompose=rcMeta(id,srcHash,r,m);
        src.recompose.appliedToOriginal=true;
        changed.push(id);
      }
    } catch(e){
      report.failed++; report.items[report.items.length-1].status='failed';
      report.items[report.items.length-1].reason='ошибка записи: '+(e&&e.message||e);
    }
  }
  reconcileBatches(); store.save(); store.saveBatches();
  RC.report=report;
  RC.key='';
  renderLib();
  if(mode==='apply'){ RC.method=null; RC.gen++; }
  if(mode==='apply' && selectedId && LIB[selectedId]) selectTpl(selectedId,true);
  rcRender();
  toast(`${mode==='dup'?'Дубликаты':'Применено'}: обработано ${report.processed}, ок ${report.ok}, предупреждения ${report.warnings}, ошибки ${report.failed}`);
  return report;
}
function rcConfirm(text){
  return new Promise(res=>{
    const ov=document.createElement('div'); ov.id='rcConfirm';
    ov.innerHTML=`<div class="rc-dlg"><h3>Применить к исходным?</h3><p>${rcEsc(text)}</p><p style="color:#8b93a1">Исходный HTML будет заменён. Откат — Ctrl+Z.</p><div class="rc-acts"><button class="rc-btn" data-c="0">Отмена</button><button class="rc-btn warn" data-c="1">Применить</button></div></div>`;
    ov.addEventListener('mousedown',e=>{ if(e.target===ov){ ov.remove(); res(false); } });
    ov.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ ov.remove(); res(b.dataset.c==='1'); });
    document.body.appendChild(ov);
  });
}
async function rcAction(act){
  const ids=RC.ids, m=RC.method;
  if(!ids.length || !m) return;
  if(act==='run'){ ids.forEach(id=>RC.cache.delete(rcKey(id,m))); await rcRunAll(ids,m); return; }
  if(act==='dup'){ await rcCreate(ids,m,'dup'); return; }
  if(act==='apply'){
    const ok=await rcConfirm(`Шаблонов: ${ids.length}. Метод: ${rcLabel(m)} (${m}). Будут применены только результаты без ошибок.`);
    if(!ok) return;
    await rcCreate(ids,m,'apply');
  }
}

/* ---------- монтирование ---------- */
// Вызывается из renderInspector (после #rcBox) и при изменении выделения
function RC_mount(){
  const box=document.getElementById('rcBox');
  if(!box) return;
  rcInstallStyle();
  const ids=rcSelIds();
  const sig=ids.join(',');
  if(sig!==RC.lastIds){ RC.lastIds=sig; RC.ids=ids; RC.report=null; }
  if(box===RC.el && RC.key===sig+'|'+(RC.method||'')+'|'+RC.format) return;
  RC.el=box; RC.key=sig+'|'+(RC.method||'')+'|'+RC.format; RC.ids=ids;
  rcRender();
  if(RC.method){ rcGalleryRefresh(); rcAutoRun(ids,RC.method); }
}
window.RC_mount=RC_mount;
// Перерисовка блока при изменении выделения (без пересоздания инспектора)
const _rbb=window.renderBulkBar;
if(typeof _rbb==='function'){
  window.renderBulkBar=function(){ const r=_rbb.apply(this,arguments); try{ RC_mount(); }catch(e){ console.warn('Recompose:',e); } return r; };
}
// Пересоздание версий, устаревших по данным этапа 2 (вместо старого конвертера)
window.RC_recreateOutdated=async function(id){
  const c=(window.S2_CONV||{})[id];
  if(!c || !LIB[c.src]){ toast('Нет данных о конвертации'); return; }
  const m=c.method||'smart';
  await rcCreate([c.src], m, 'dup');
};
/* ---------- внешние модули адаптации (манифест Electron: папка adaptation-modules) ----------
   Порядок: общие библиотеки («_»), затем код каждого модуля и регистрация по его module.json.
   Ошибка одного модуля не останавливает остальные; причины — в RecomposeCore.adaptation.errors(). */
const RC_ADAPT_LOAD={ loaded:false, loading:false, current:null, errors:[] };
window.RC_ADAPT_LOAD=RC_ADAPT_LOAD; // диагностика: состояние загрузки модулей (для тестов и консоли)
window.addEventListener('error',e=>{
  if(RC_ADAPT_LOAD.loading) RC_ADAPT_LOAD.errors.push({file:RC_ADAPT_LOAD.current, errors:[String(e.message||'ошибка скрипта')]});
});
function rcLoadScript(url, rel){
  return new Promise(resolve=>{
    const sc=document.createElement('script');
    sc.src=url;
    sc.onload=()=>{ sc.remove(); resolve(true); };
    sc.onerror=()=>{ RC_ADAPT_LOAD.errors.push({file:rel, errors:['файл не загрузился']}); sc.remove(); resolve(false); };
    document.head.appendChild(sc);
  });
}
async function rcLoadAdaptation(a){
  const A=window.RecomposeCore.adaptation;
  RC_ADAPT_LOAD.loading=true;
  for(const f of (a.libraries||[])){ RC_ADAPT_LOAD.current=f.rel; await rcLoadScript(f.fileUrl, f.rel); }
  for(const m of (a.modules||[])){
    RC_ADAPT_LOAD.current=m.rel;
    if(await rcLoadScript(m.codeUrl, m.rel)) A.register(m.descriptor);   // ошибки регистрации — в A.errors()
  }
  (a.errors||[]).forEach(x=>RC_ADAPT_LOAD.errors.push({file:x.folder, errors:x.errors}));
  RC_ADAPT_LOAD.loading=false; RC_ADAPT_LOAD.current=null;
}
function rcOnManifest(){
  const a=(window.SB_POOL_MANIFEST||{}).adaptation;
  if(!a || RC_ADAPT_LOAD.loaded) return;
  RC_ADAPT_LOAD.loaded=true;
  rcLoadAdaptation(a).then(()=>{
    const bad=window.RecomposeCore.adaptation.errors().concat(RC_ADAPT_LOAD.errors);
    if(bad.length){ console.warn('Модули адаптации: проблемы', bad); if(window.toast) toast(`Модули адаптации: проблем ${bad.length} (см. консоль)`); }
    rcRefresh();
  });
}
window.addEventListener('sb-manifest', rcOnManifest);
rcOnManifest();
window.RC_state=RC;
})();
