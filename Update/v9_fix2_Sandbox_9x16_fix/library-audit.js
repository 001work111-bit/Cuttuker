/* ============================================================
   ПРОВЕРКА БИБЛИОТЕКИ — инспектор проблемных шаблонов (левая панель)
   ------------------------------------------------------------
   Состояния (три независимых, не смешиваются):
     1. базовая выборка — обычные фильтры Sandbox (tplPassesBase): стиль, группа, прогон, формат…
     2. дополнительная выборка — тип проблемы инспектора (window.SB_inspFilterIds). Действует
        только пока инспектор открыт; накладывается поверх базовой и влияет на галерею «Карта».
     3. рабочее выделение — checked (то же, что в Sandbox). Действия инспектора работают с ним.
   Категории:
     A — устаревшая конверсия (предлагается пересоздание по сохранённым формату и методу);
     B — структурная неполнота / метаданные / прочие подтверждённые нарушения;
     C — неоднозначно: только ручная проверка, без разрушающих действий.
   Ничего не меняется и не удаляется автоматически.
   ============================================================ */
(function(){
  'use strict';

  const CATS = [
    ['outdated',  'A · Устаревшая конверсия'],
    ['structure', 'B · Структурная неполнота'],
    ['meta',      'B · Метаданные'],
    ['other',     'B · Прочие нарушения'],
    ['ambiguous', 'C · Неоднозначно']
  ];
  const CAT_TITLE = Object.fromEntries(CATS);
  const CAT_SHORT = { outdated:'A · конверсия', structure:'B · структура', meta:'B · метаданные', other:'B · прочее', ambiguous:'C · проверить' };
  const CAT_COLOR = { outdated:'#e0b23a', structure:'#ff5b6a', meta:'#c9a14a', other:'#ff8a6a', ambiguous:'#8b93a1' };
  const CAT_RANK = { outdated:0, structure:1, meta:2, other:3, ambiguous:4 };
  const CONF_TEXT = { high:'высокая', medium:'средняя', low:'низкая' };
  const TOL = 0.01;

  const INSP = {
    on:false, type:'all', q:'',
    open:new Set(),          // раскрытые записи (по умолчанию все свёрнуты)
    cache:new Map(),
    rows:[], ranAt:null, result:''
  };
  window.SB_inspFilterIds = null;

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function parse(html){ return new DOMParser().parseFromString(String(html||''),'text/html'); }
  function registryHas(id){ return !!id && (window.SB_FORMATS||[]).some(f=>f.id===id); }
  function formatForSize(w, h){
    w=Number(w); h=Number(h);
    if(!(w>0&&h>0)) return null;
    const r=w/h; let best=null, bestErr=Infinity;
    (window.SB_FORMATS||[]).forEach(f=>{
      if(!f||!f.ratio) return;
      const fr=f.ratio.w/f.ratio.h, err=Math.abs(fr-r)/fr;
      if(err<bestErr){ bestErr=err; best=f; }
    });
    return (best && bestErr<=TOL) ? best : null;
  }
  function managedCount(doc){ return doc.body.querySelectorAll('[data-sb-editable],[data-sb-media],.sv-media').length; }
  function editableCount(doc){ return doc.body.querySelectorAll('[data-sb-editable]').length; }

  /* Можно ли пересоздать конверсию штатным механизмом (сохранённые формат и метод должны быть валидны) */
  function recreateInfo(id){
    const c=(S2_CONV||{})[id];
    if(!c) return { ok:false, why:'нет сохранённой связи конверсии' };
    if(!LIB[c.src]) return { ok:false, why:'исходник «'+c.src+'» не найден' };
    if(!c.aspect || !registryHas(c.aspect)) return { ok:false, why:'формат сохранённой конверсии не определён' };
    if(!c.method) return { ok:false, why:'метод сохранённой конверсии не записан' };
    const RC=window.RecomposeCore, mod=RC && RC.adaptation && RC.adaptation.get(c.method);
    if(!mod) return { ok:false, why:'метод «'+c.method+'» не загружен' };
    if(!(mod.targetFormats||[]).includes(c.aspect)) return { ok:false, why:'метод «'+c.method+'» не поддерживает формат '+c.aspect };
    return { ok:true, why:'', format:c.aspect, method:c.method };
  }

  /* ---------- диагностика записи (по доказуемым признакам) ---------- */
  function diagnoseRec(t, id){
    const out=[];
    const add=(type, severity, confidence, reason, extra)=>out.push(Object.assign({type, category:type, severity, confidence, reason}, extra||{}));
    const RC=window.RecomposeCore, A=RC && RC.adaptation;
    if(!t) return out;
    if(!t.html || !String(t.html).trim()){
      add('other','error','high','пустой HTML: адаптация и экспорт невозможны');
      return out;
    }
    const doc=parse(t.html);
    const managed=managedCount(doc);

    if(managed===0){
      if(doc.body.querySelector('h1,h2,h3,h4,p,span,li'))
        add('ambiguous','warning','low','нет data-sb-editable/data-sb-media: тексты будут найдены по тегам, результат не гарантирован');
      else
        add('structure','error','high','нет управляемых элементов (data-sb-editable / data-sb-media): блок нельзя адаптировать и редактировать по частям');
    }
    const miss=(RC && RC._internal && RC._internal.rcMissing) ? RC._internal.rcMissing(doc, null) : [];
    miss.forEach(m=>{
      if(/^нет data-sb-editable/.test(m)) return;
      if(/^data-role не задан/.test(m)) add('meta','warning','high', m+': роль-методы (smart, split) не различают текст', {element:'data-role'});
      else if(/^нет медиа-слота/.test(m)) add('meta','info','low', m+' — необязательно: шаблону могут не нужны изображения', {element:'media', optional:true});
      else if(/^data-slot не задан/.test(m)) add('meta','warning','high', m+': слот не связывается с блоком в PMS и экспорте', {element:'data-slot'});
      else add('meta','warning','medium', m);
    });
    if(managed>0 && editableCount(doc)===0 && doc.body.querySelector('h1,h2,h3,h4,p,span,li'))
      add('ambiguous','warning','low','тексты без data-sb-editable: адаптер найдёт их по тегам h1–h4/p/span/li');

    // Формат: без подстановки. Неизвестный aspect — неоднозначность, совместимость не проверяется.
    const fmtKnown = registryHas(t.aspect);
    if(!fmtKnown){
      add('ambiguous','info','low', t.aspect ? `Формат не определён (aspect «${t.aspect}» не входит в реестр): совместимость методов не проверена` : 'Формат не определён (aspect не задан): совместимость методов не проверена, метод не подставлен');
    } else if(A){
      const byMissing=new Map();
      A.ids().forEach(mid=>{
        const d=A.get(mid); if(!d || !(d.sourceFormats||[]).includes(t.aspect)) return;
        (d.markup||[]).forEach(sel=>{
          let ok=true; try{ ok=!!doc.body.querySelector(sel); }catch(e){ ok=true; }
          if(!ok){ if(!byMissing.has(sel)) byMissing.set(sel,new Set()); byMissing.get(sel).add(d.name||mid); }
        });
        if(d.titleRole && !doc.body.querySelector('[data-role="title"],[data-role="statement"]')){
          const k='[data-role="title"] или [data-role="statement"]';
          if(!byMissing.has(k)) byMissing.set(k,new Set()); byMissing.get(k).add(d.name||mid);
        }
      });
      byMissing.forEach((mods,sel)=>{
        add('other','warning','medium', `нет ${sel}, который объявляют модули: ${[...mods].join(', ')}`, {element:sel});
      });
    }

    if(t.aspect && t.canvas){
      const f=formatForSize(t.canvas.width,t.canvas.height);
      if(!f || f.id!==t.aspect)
        add('meta','warning','high', `aspect ${t.aspect} не совпадает с canvas ${t.canvas.width}×${t.canvas.height}`, {element:'aspect'});
    }
    if(!t.label) add('meta','info','high','нет названия (label)', {element:'label'});

    // Связь конверсии
    const c=(S2_CONV||{})[id];
    if(c){
      const src=LIB[c.src];
      if(!src) add('structure','warning','high', `исходник «${c.src}» не найден: связь конверсии разорвана`, {src:c.src});
      else {
        if(s2Outdated(id)){
          const ri=recreateInfo(id);
          add('outdated','warning','high', `исходник «${c.src}» изменился после конвертации`, {src:c.src, canRecreate:ri.ok, recreateNote:ri.ok?'':ri.why});
        }
        const srcManaged=editableCount(parse(src.html));
        const mine=editableCount(doc);
        if(mine<srcManaged){
          const ri=recreateInfo(id);
          add('outdated','warning','high', `конверсия потеряла текстовые элементы: в исходнике ${srcManaged}, в конверсии ${mine}`, {src:c.src, canRecreate:ri.ok, recreateNote:ri.ok?'':ri.why});
        }
      }
    } else if(s2Outdated(id)){
      add('outdated','warning','high','исходник изменился после конвертации', {canRecreate:false, recreateNote:'связь конверсии не сохранена'});
    }
    return out;
  }
  function diagnose(id){ return diagnoseRec(LIB[id], id); }

  function catsOf(issues){ return [...new Set(issues.map(x=>x.category))]; }
  function deletable(item){
    // удаляем только подтверждённо непригодное: структура с высокой/средней уверенностью, ошибки «другое».
    // Устаревшую конверсию и метаданные удалять не предлагаем — они исправляются.
    return item.issues.some(x=> x.confidence!=='low' && x.severity==='error' && (x.category==='structure' || x.category==='other'));
  }
  function recreatable(item){ return item.issues.some(x=>x.canRecreate); }   // обновление конверсии на месте

  function itemFor(id){
    const t=LIB[id]; const c=(S2_CONV||{})[id];
    const src=c && LIB[c.src];
    const k=tplHash(t)+'|'+(c?JSON.stringify(c):'')+'|'+(src?tplHash(src):'');
    let e=INSP.cache.get(id);
    if(!e || e.k!==k){ e={k, issues:diagnose(id)}; INSP.cache.set(id,e); }
    return { id, tpl:t.tpl||id, label:t.label||t.tpl||id, code:t.code||'', issues:e.issues, cats:catsOf(e.issues) };
  }
  function invalidate(id){ INSP.cache.delete(id); }

  function baseIds(){ return Object.keys(LIB).filter(id=>LIB[id] && tplPassesBase(LIB[id])); }
  function viewItems(){
    const q=(INSP.q||'').trim().toLowerCase();
    const all=baseIds().map(itemFor);
    const withIssues=all.filter(it=>it.issues.length);
    const inType=withIssues.filter(it=> INSP.type==='all' || it.cats.includes(INSP.type));
    const rows=inType.filter(it=> !q || it.label.toLowerCase().includes(q) || it.tpl.toLowerCase().includes(q) || it.id.toLowerCase().includes(q));
    rows.sort((a,b)=>minRank(a)-minRank(b));
    const summary={
      scope:all.length, total:Object.keys(LIB).length,
      ok:all.filter(it=>!it.issues.length).length,
      byCat:Object.fromEntries(CATS.map(([k])=>[k, withIssues.filter(it=>it.cats.includes(k)).length]))
    };
    return { all, rows, withIssues, summary };
  }
  function minRank(it){ return Math.min.apply(null, it.cats.map(c=>CAT_RANK[c]).concat([9])); }

  // Дополнительная выборка (второе состояние): проблемы выбранного типа в базовой выборке
  function updateTypeFilter(v){
    if(!INSP.on){ window.SB_inspFilterIds=null; return; }
    const ids=v.withIssues.filter(it=> INSP.type==='all' || it.cats.includes(INSP.type)).map(it=>it.id);
    window.SB_inspFilterIds=new Set(ids);
  }

  // Рабочее выделение = checked. Цели действий: выбранные (checked) в базовой выборке.
  // Действия инспектора работают только с выбранными записями, видимыми в его текущем списке
  // (базовые фильтры, тип проблемы, поиск). Скрытые фильтрами выбранные записи в действия не попадают.
  function targets(){
    const vis = (INSP.on && INSP.rows) ? new Set(INSP.rows.map(r=>r.id)) : null;
    return [...checked].filter(id=>LIB[id] && tplPassesFilters(LIB[id]) && (!vis || vis.has(id)));
  }
  function hiddenSelected(){ const t=new Set(targets()); return [...checked].filter(id=>!t.has(id)).length; }

  function badge(text,color){ return `<span class="li-badge" style="--c:${color}">${esc(text)}</span>`; }

  /* ---------- пояснения по категориям: причина, влияние, рекомендация, действия ---------- */
  function guide(x){
    if(x.category==='outdated'){
      return { explain: x.src ? 'Исходник «'+x.src+'» изменился после создания конверсии или конверсия неполна.' : (x.reason||'Конверсия устарела.'),
               impact:'Конверсия содержит прежнюю версию данных; адаптация и экспорт используют устаревший результат.',
               recommend: x.canRecreate
                 ? 'Обновить конверсию на месте: та же запись, тот же формат и метод из сохранённой связи. Исходник не меняется; откат — Ctrl+Z.'
                 : 'Автоматическое обновление невозможно: '+(x.recreateNote||'нет данных')+'. Проверьте конверсию вручную или создайте её заново.' };
    }
    if(x.category==='structure') return { explain:x.reason,
               impact:'Адаптация или экспорт не получат нужный элемент или связь.',
               recommend:'Если исходник на месте — пересоздайте конверсию. Если структуру нельзя восстановить средствами Sandbox — подготовьте пакет для нейросети.' };
    if(x.optional) return { explain:x.reason, impact:'Ничего не блокирует: блок без изображения допустим.', recommend:'Ничего делать не нужно. Добавьте медиа-слот только если блоку нужно изображение.' };
    if(x.category==='meta') return { explain:x.reason,
               impact:'Метаданные нужны для адаптации и экспорта в PMS; без них результат может быть неверным.',
               recommend:'Добавьте недостающий атрибут или поле в HTML (вручную или через нейросеть). Автоматической подстановки нет.' };
    if(x.category==='other') return { explain:x.reason,
               impact:'Шаблон может не адаптироваться выбранными методами.',
               recommend:'Проверьте шаблон в превью. Если он не нужен — удалите вручную; если нужен — исправьте через нейросеть.' };
    return { explain:x.reason, impact:'Признак не подтверждён: шаблон может быть корректным.',
             recommend:'Проверьте шаблон вручную в превью. Автоматических действий по этому признаку не предлагается.' };
  }

  /* ---------- рендер ---------- */
  function render(){
    const rail=document.getElementById('libTree');
    const stats=document.getElementById('libStats');
    if(!rail) return;
    const v=viewItems();
    INSP.rows=v.rows;
    updateTypeFilter(v);
    if(stats) stats.innerHTML=`Проверка: <b>${v.summary.scope}</b> из ${v.summary.total} · без проблем: <b>${v.summary.ok}</b>`;
    const s=v.summary.byCat;
    const tg=targets().map(id=>v.all.find(x=>x.id===id)).filter(Boolean);
    const tgRecreate=tg.filter(recreatable), tgDelete=tg.filter(deletable);
    const tgIds=targets();

    const chips=[['all','Все проблемы', v.summary.scope-v.summary.ok]].concat(CATS.map(([k])=>[k,CAT_TITLE[k],s[k]]))
      .map(([k,l,n])=>`<button type="button" class="li-chip${INSP.type===k?' on':''}" data-li-type="${k}" style="--c:${k==='all'?'#8fb3ff':CAT_COLOR[k]}" title="${esc(l)}">${esc(k==='all'?'Все':CAT_SHORT[k])} <b>${n}</b></button>`).join('');
    const typeOpts=[['all','Все проблемы', v.summary.scope-v.summary.ok]].concat(CATS.map(([k])=>[k,CAT_TITLE[k],s[k]]))
      .map(([k,l,n])=>`<option value="${k}"${INSP.type===k?' selected':''}>${esc(l)} (${n})</option>`).join('');

    let h=`<div class="li-root">
      <div class="li-head">
        <div style="flex:1;min-width:0"><div class="li-title">Проверка библиотеки</div>
        <div class="li-sub">${v.summary.scope===v.summary.total?'Вся библиотека':'Выборка по фильтрам: '+v.summary.scope+' из '+v.summary.total}${INSP.ranAt?' · проверено '+INSP.ranAt.toLocaleTimeString():''}</div></div>
        <button type="button" class="li-btn" data-li-act="rerun" title="Пересчитать диагностику">Проверить снова</button>
        <button type="button" class="li-btn" data-li-act="close" title="Вернуть обычный список">Закрыть</button>
      </div>
      <div class="li-sum">Без проблем: <b>${v.summary.ok}</b> · с проблемами: <b>${v.summary.scope-v.summary.ok}</b> · в галерее показаны: <b>${window.SB_inspFilterIds?window.SB_inspFilterIds.size:0}</b></div>
      <div class="li-chips" role="group" aria-label="Тип проблемы">${chips}</div>
      <div class="li-ctl">
        <input type="search" data-li-q placeholder="Поиск по названию или ID" value="${esc(INSP.q)}">
        <select data-li-type-sel aria-label="Тип проблемы">${typeOpts}</select>
      </div>
      <div class="li-list" data-li-list>`;
    if(!v.summary.scope){
      h+=`<div class="li-empty">В текущей выборке нет шаблонов. Сбросьте обычные фильтры в верхней панели.</div>`;
    } else if(!v.rows.length){
      h+=`<div class="li-empty">${v.summary.scope-v.summary.ok===0?'Проблем не найдено. Выборка без нарушений.':'По выбранному типу и поиску ничего нет.'}</div>`;
    } else {
      h+=v.rows.map(it=>{
        const open=INSP.open.has(it.id);
        const top=it.issues.slice().sort((a,b)=>CAT_RANK[a.category]-CAT_RANK[b.category])[0];
        const cat=top.category;
        const dlgId='li-d-'+String(it.id).replace(/[^a-z0-9_-]/gi,'_');
        const g=guide(top);
        const detail=`<div class="li-detail" id="${dlgId}" ${open?'':'hidden'}>
            ${it.issues.map(x=>{ const gx=guide(x); return `<div class="li-issue">
              <div class="li-issue-cat">${badge(CAT_SHORT[x.category], CAT_COLOR[x.category])}<span class="li-conf">уверенность: ${CONF_TEXT[x.confidence]}</span></div>
              <div><b>Причина:</b> ${esc(gx.explain)}</div>
              <div><b>Влияние:</b> ${esc(gx.impact)}</div>
              <div><b>Рекомендация:</b> ${esc(gx.recommend)}</div>
              ${x.src?`<div class="li-meta">источник: ${esc(x.src)}</div>`:''}
            </div>`; }).join('')}
            <div class="li-one">
              ${it.issues.some(x=>x.canRecreate)?`<button type="button" class="li-btn" data-li-one="recreate" data-li-id="${esc(it.id)}">Обновить конверсию на месте…</button>`:''}
              ${it.issues.some(x=>x.confidence!=='low' && x.category!=='ambiguous')?`<button type="button" class="li-btn" data-li-one="neural" data-li-id="${esc(it.id)}">В нейросеть…</button>`:''}
              ${deletable(it)?`<button type="button" class="li-btn danger" data-li-one="delete" data-li-id="${esc(it.id)}">Удалить…</button>`:''}
              ${cat==='ambiguous'?'<span class="li-meta">Автоматических действий нет: проверьте в превью.</span>':''}
            </div>
          </div>`;
        return `<div class="li-row${it.id===selectedId?' active':''}" data-li-row="${esc(it.id)}">
          <div class="li-row-top">
            <button type="button" class="li-tog" aria-expanded="${open?'true':'false'}" aria-controls="${dlgId}" data-li-toggle="${esc(it.id)}" title="${open?'Свернуть':'Раскрыть'}"><svg class="li-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="#7d8594" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="li-sr">${open?'Свернуть':'Раскрыть'} запись</span></button>
            <input type="checkbox" data-li-id="${esc(it.id)}"${checked.has(it.id)?' checked':''} aria-label="Выбрать ${esc(it.label)}">
            <div class="li-main"><div class="li-name" title="${esc(it.label)}">${esc(it.label)}</div>
              <div class="li-short">${badge(CAT_SHORT[cat], CAT_COLOR[cat])} <span>${esc(top.reason)}</span></div></div>
          </div>
          ${detail}
        </div>`;
      }).join('');
    }
    h+=`</div>`;
    h+=`<div class="li-nav">
        <button type="button" class="li-btn" data-li-nav="-1" ${INSP.rows.length?'':'disabled'}>← Пред.</button>
        <span>${INSP.rows.length?(INSP.rows.findIndex(it=>it.id===selectedId)>=0?(INSP.rows.findIndex(it=>it.id===selectedId)+1)+' из '+INSP.rows.length:'записей: '+INSP.rows.length):'—'}</span>
        <button type="button" class="li-btn" data-li-nav="1" ${INSP.rows.length?'':'disabled'}>След. →</button>
      </div>`;
    h+=`<div class="li-acts">
      <div class="li-btns"><button type="button" class="li-btn" data-li-act="selall" ${INSP.rows.length?'':'disabled'} title="Выделить все записи текущего списка инспектора">Выделить все (${INSP.rows.length})</button><button type="button" class="li-btn" data-li-act="unselall" ${INSP.rows.length?'':'disabled'} title="Снять выделение с записей текущего списка">Снять выделение</button></div>
      <div class="li-selcount">Выбрано: <b>${checked.size}</b> · в списке инспектора: <b>${tgIds.length}</b>${hiddenSelected()?` · скрыто фильтрами: <b>${hiddenSelected()}</b>`:''}${tgIds.length?` · с проблемами: <b>${tg.filter(x=>x.issues.length).length}</b>`:' · выберите записи флажками — действия работают только с ними.'}</div>`;
    h+=`<div class="li-btns">
        <button type="button" class="li-btn" data-li-act="recreate" ${tgRecreate.length?'':'disabled'} title="Обновляет устаревшие конверсии на месте: та же запись, формат и метод из сохранённой связи; исходники не меняются">Обновить конверсии на месте (${tgRecreate.length})…</button>
        <button type="button" class="li-btn" data-li-act="neural" ${tgIds.length?'':'disabled'} title="Скачивает JSON-пакет с полным описанием задачи для нейросети">Подготовить для исправления в нейросети…</button>
        <button type="button" class="li-btn danger" data-li-act="delete" ${tgDelete.length?'':'disabled'} title="Только подтверждённо непригодные структурные записи">Удалить выбранные (${tgDelete.length})…</button>
      </div>`;
    if(INSP.result) h+=`<div class="li-result">${esc(INSP.result)}</div>`;
    h+=`</div>`;
    if(window.SB_repair) h+=window.SB_repair.html();
    h+=`</div>`;
    rail.innerHTML=h;
    bind(rail);
  }

  function bind(rail){
    rail.querySelectorAll('[data-li-type]').forEach(b=>b.onclick=()=>{ INSP.type=b.getAttribute('data-li-type'); renderLib(); });
    const q=rail.querySelector('[data-li-q]');
    if(q){ q.oninput=e=>{ INSP.q=e.target.value; render(); const again=rail.querySelector('[data-li-q]'); if(again){ again.focus(); again.setSelectionRange(again.value.length, again.value.length); } }; }
    const ts=rail.querySelector('[data-li-type-sel]');
    if(ts) ts.onchange=e=>{ INSP.type=e.target.value; renderLib(); };
    rail.querySelectorAll('[data-li-act]').forEach(b=>b.onclick=()=>act(b.getAttribute('data-li-act')));
    rail.querySelectorAll('[data-li-nav]').forEach(b=>b.onclick=()=>nav(+b.getAttribute('data-li-nav')));
    rail.querySelectorAll('[data-li-toggle]').forEach(b=>b.onclick=e=>{
      e.stopPropagation();
      const id=b.getAttribute('data-li-toggle');
      if(INSP.open.has(id)) INSP.open.clear(); else { INSP.open.clear(); INSP.open.add(id); }
      render();
    });
    rail.querySelectorAll('[data-li-one]').forEach(b=>b.onclick=e=>{
      e.stopPropagation();
      const id=b.getAttribute('data-li-id'), what=b.getAttribute('data-li-one');
      if(what==='recreate') recreateIds([id]);
      if(what==='neural') neuralIds([id]);
      if(what==='delete') deleteIds([id]);
    });
    rail.querySelectorAll('[data-li-id]').forEach(c=>{
      c.onclick=e=>e.stopPropagation();
      c.onchange=()=>{ const id=c.getAttribute('data-li-id'); if(c.checked) checked.add(id); else checked.delete(id); if(c.checked) selectedId=id; renderLib(); };
    });
    rail.querySelectorAll('[data-li-row]').forEach(r=>r.onclick=e=>{
      if(e.target.closest('[data-li-id],[data-li-toggle],[data-li-one]')) return;
      open(r.getAttribute('data-li-row'));
    });
    if(window.SB_repair) window.SB_repair.bind(rail);
  }

  function open(id){ if(LIB[id] && typeof selectTpl==='function') selectTpl(id,true); }
  function nav(step){
    const rows=INSP.rows; if(!rows.length) return;
    const idx=rows.findIndex(it=>it.id===selectedId);
    const next = idx<0 ? (step>0?0:rows.length-1) : (idx+step+rows.length)%rows.length;
    open(rows[next].id);
  }

  function act(name){
    if(name==='close'){ setOn(false); return; }
    if(name==='rerun'){ INSP.cache.clear(); runAll(); INSP.result='Диагностика пересчитана.'; renderLib(); return; }
    if(name==='selall'){ INSP.rows.forEach(it=>checked.add(it.id)); INSP.result=`Выделено записей текущего списка: ${INSP.rows.length}.`; renderLib(); return; }
    if(name==='unselall'){ INSP.rows.forEach(it=>checked.delete(it.id)); INSP.result='Выделение текущего списка снято.'; renderLib(); return; }
    if(name==='recreate') return recreateIds(targets());
    if(name==='neural') return neuralIds(targets());
    if(name==='delete') return deleteIds(targets());
  }

  async function recreateIds(ids){
    const items=ids.map(id=>itemFor(id)).filter(recreatable);
    if(!items.length){ INSP.result='Нет выбранных записей с доступным обновлением конверсии.'; renderLib(); return; }
    const lines=items.map(it=>{ const c=S2_CONV[it.id]; return `• ${it.label}: формат ${c.aspect}, метод ${c.method}`; }).join('\n');
    if(!confirm(`Обновить конверсии на месте: ${items.length}?\n\n${lines}\n\nЗаписи сохраняют tpl, название, стили и связи. Новые шаблоны не создаются, исходники не меняются. Откат — Ctrl+Z.`)) return;
    const results=[];
    for(const it of items){
      const r=await window.RC_recreateOutdated(it.id);
      results.push(r && r.ok ? `✓ ${it.label}: конверсия обновлена на месте (${r.format}, ${r.method})` : `✗ ${it.label}: ${(r&&r.reason)||'не обновлено'}`);
    }
    INSP.result=results.join(' · ');
    runAll(); renderLib();
  }

  function neuralIds(ids){
    const list=(ids||[]).filter(id=>LIB[id]);
    if(!list.length){ INSP.result='Ничего не выбрано. Отметьте шаблоны флажками — выгрузка всей библиотеки не выполняется.'; renderLib(); return; }
    const r=window.SB_repair.exportPackage(list);
    window.SB_repair.setExpected(list);
    INSP.result=`Пакет подготовлен: шаблонов ${r.count}. Вставьте ответ нейросети в блок «Импорт исправленных шаблонов».`;
    renderLib();
  }

  function deleteIds(ids){
    const items=ids.map(id=>itemFor(id)).filter(deletable);
    if(!items.length){ INSP.result='Нечего удалять: по выбранным записям нет подтверждённых структурных признаков.'; renderLib(); return; }
    const idSet=new Set(items.map(x=>x.id));
    const convLinks=Object.keys(S2_CONV||{}).filter(c=>idSet.has(S2_CONV[c].src) && !idSet.has(c)).length;
    const ownConv=[...idSet].filter(id=>(S2_CONV||{})[id]).length;
    const imgs=[...idSet].filter(id=>(IMG_ASSIGN||{})[id]).length;
    const batches=new Set([...idSet].map(id=>LIB[id].batch).filter(Boolean));
    const text=`Удалить шаблоны: ${items.length}?\n`
      +`• связи конверсий с удаляемыми исходниками будут сняты: ${convLinks} (сами конверсии останутся обычными шаблонами);\n`
      +`• связи удаляемых конверсий будут удалены: ${ownConv};\n`
      +`• назначения изображений для удаляемых шаблонов будут удалены: ${imgs};\n`
      +`• прогонов, затронутых удалением: ${batches.size} (пустые прогоны будут убраны).\n\n`
      +`Отмена — Ctrl+Z (библиотека, стили, прогоны, связи).`;
    if(!confirm(text)) return;
    pushUndo();
    items.forEach(it=>{
      const id=it.id;
      delete LIB[id]; checked.delete(id); INSP.open.delete(id); INSP.cache.delete(id);
      if(filterSet) filterSet.delete(id);
      if(selectedId===id) selectedId=null;
      if(IMG_ASSIGN[id]) delete IMG_ASSIGN[id];
      if(S2_CONV[id]) delete S2_CONV[id];
    });
    Object.keys(S2_CONV).forEach(c=>{ if(S2_CONV[c] && !LIB[S2_CONV[c].src]) delete S2_CONV[c]; });
    if(typeof reconcileBatches==='function') reconcileBatches();
    store.save(); store.saveBatches(); s2SaveConv(); saveImgAssign();
    runAll();
    INSP.result=`Удалено: ${items.length}.`;
    if(!selectedId){
      const st=document.getElementById('stageHead'); if(st) st.style.display='none';
      const pv=document.getElementById('preview'); if(pv) pv.innerHTML='<div class="stage-empty"><b>Шаблоны удалены</b>Выбери другой слева.</div>';
      if(typeof renderInspectorEmpty==='function') renderInspectorEmpty();
    }
    renderLib();
    if(window.SB_Gallery && SB_Gallery.mode==='grid') SB_Gallery.rebuild(false);
  }

  function runAll(){
    INSP.cache.forEach((v,k)=>{ if(!LIB[k]) INSP.cache.delete(k); });
    INSP.ranAt=new Date();
  }

  /* ---------- включение и кнопка ---------- */
  function setOn(on){
    INSP.on=!!on;
    if(INSP.on){ runAll(); INSP.result=''; }
    else { window.SB_inspFilterIds=null; INSP.result=''; }   // выход: дополнительная выборка снимается, обычные фильтры и выделение не трогаются
    const b=document.getElementById('btnLibAudit');
    if(b){ b.classList.toggle('on',INSP.on); b.setAttribute('aria-pressed', INSP.on?'true':'false'); }
    renderLib();
  }
  function mountButton(){
    const stats=document.getElementById('libStats');
    if(!stats || document.getElementById('btnLibAudit')) return;
    const row=document.createElement('div');
    row.className='lib-stats-row';
    row.style.cssText='display:flex;align-items:flex-start;gap:6px;min-width:0;margin-top:-2px';
    stats.parentNode.insertBefore(row, stats);
    stats.style.flex='1'; stats.style.minWidth='0';
    row.appendChild(stats);
    const b=document.createElement('button');
    b.type='button'; b.id='btnLibAudit';
    b.title='Проверка библиотеки';
    b.setAttribute('aria-label','Проверка библиотеки');
    b.setAttribute('aria-pressed','false');
    b.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
    b.onclick=()=>setOn(!INSP.on);
    row.appendChild(b);
    const st=document.createElement('style');
    st.textContent=`
      #btnLibAudit{flex:none;align-self:flex-start;width:26px;height:26px;margin:0 0 0 auto;padding:0;display:inline-flex;align-items:center;justify-content:center;border:1px solid #2f5fe8;border-radius:7px;background:#2f5fe8;color:#fff;cursor:pointer;box-shadow:none}
      #btnLibAudit:hover{background:#3a6bff;border-color:#3a6bff}
      #btnLibAudit:focus-visible{outline:2px solid #8fb3ff;outline-offset:2px}
      #btnLibAudit.on{background:#1d3fa6;border-color:#8fb3ff;box-shadow:0 0 0 2px rgba(143,179,255,.35)}
      .li-root{display:flex;flex-direction:column;gap:6px;height:100%;min-height:0;font-size:12px;overflow-y:auto}
      .li-head{display:flex;align-items:flex-start;gap:6px}
      .li-title{font-weight:700;font-size:12.5px}
      .li-sub{font-size:10.5px;color:#7d8594;margin-top:1px}
      .li-sum{font-size:11px;color:#b8c0cc}
      .li-btn{font:inherit;font-size:11px;padding:3px 8px;border:1px solid #2a2f3a;border-radius:6px;background:transparent;color:#c9ced8;cursor:pointer;white-space:nowrap}
      .li-btn:hover:not(:disabled){border-color:#4a5263;color:#fff}
      .li-btn:disabled{opacity:.4;cursor:default}
      .li-btn.primary{background:#2f5fe8;border-color:#2f5fe8;color:#fff;font-weight:700}
      .li-btn.danger:hover:not(:disabled){border-color:#7a2a33;color:#ff9ca5}
      .li-chips{display:flex;flex-wrap:wrap;gap:4px}
      .li-chip{font:inherit;font-size:10.5px;padding:2px 8px;border-radius:999px;border:1px solid #2a2f3a;background:transparent;color:var(--c,#8b93a1);cursor:pointer}
      .li-chip b{color:#c9ced8;font-weight:600;margin-left:2px}
      .li-chip.on{background:color-mix(in srgb,var(--c) 22%,transparent);border-color:var(--c)}
      .li-ctl{display:flex;gap:6px}
      .li-ctl input,.li-ctl select{font:inherit;font-size:11.5px;padding:4px 6px;border-radius:6px;background:#15181f;color:#e6e9ef;border:1px solid #2a2f3a;min-width:0}
      .li-ctl input{flex:1}
      .li-ctl select{max-width:52%}
      .li-list{overflow:auto;border:1px solid #2a2f3a;border-radius:8px;padding:4px;min-height:120px;max-height:46vh}
      .li-row{border:1px solid transparent;border-radius:7px;padding:4px 6px;margin-bottom:4px}
      .li-row:hover{background:#171b23}
      .li-row.active{border-color:#3a6bff;background:rgba(58,107,255,.10)}
      .li-row-top{display:flex;align-items:center;gap:6px;min-width:0}
      .li-tog{flex:none;width:18px;height:18px;padding:0;border:1px solid #2a2f3a;border-radius:4px;background:transparent;color:#8b93a1;cursor:pointer;font-size:10px;line-height:1;display:inline-flex;align-items:center;justify-content:center}
      .li-tog:hover{border-color:#4a5263;color:#c9ced8}
      .li-chev{flex:none;transition:transform .15s}
      .li-tog[aria-expanded="true"] .li-chev{transform:rotate(180deg)}
      .li-tog:focus-visible{outline:2px solid #8fb3ff}
      .li-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
      .li-main{flex:1;min-width:0}
      .li-name{font-weight:600;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .li-short{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#b8c0cc;overflow:hidden;white-space:nowrap}
      .li-short span:last-child{overflow:hidden;text-overflow:ellipsis}
      .li-badge{display:inline-block;padding:0 6px;border-radius:999px;font-size:9.5px;line-height:1.6;background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c);border:1px solid color-mix(in srgb,var(--c) 40%,transparent);white-space:nowrap;flex:none}
      .li-detail{margin:6px 0 2px 24px;display:flex;flex-direction:column;gap:6px;font-size:11px;color:#c9ced8;line-height:1.45}
      .li-detail[hidden]{display:none}
      .li-issue{border-left:2px solid #2a2f3a;padding-left:7px;display:flex;flex-direction:column;gap:2px}
      .li-issue-cat{display:flex;align-items:center;gap:6px}
      .li-conf,.li-meta{font-size:10px;color:#7d8594}
      .li-one{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
      .li-empty{padding:12px 8px;color:#7d8594;font-size:11.5px}
      .li-nav{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:11px;color:#8b93a1}
      .li-acts{border-top:1px solid #2a2f3a;padding-top:6px;display:flex;flex-direction:column;gap:5px}
      .li-selcount{font-size:11px;color:#b8c0cc}
      .li-hint{font-size:10.5px;color:#8b93a1;line-height:1.4}
      .li-btns{display:flex;flex-wrap:wrap;gap:5px}
      .li-result{font-size:11px;color:#c9ced8;background:#15181f;border:1px solid #2a2f3a;border-radius:6px;padding:5px 7px}
      .li-result.bad{border-color:#7a2a33}
      .li-repair{border-top:1px solid #2a2f3a;padding-top:6px}
      .li-repair>summary{cursor:pointer;font-weight:700;font-size:11.5px;color:#c9ced8;list-style:none}
      .li-repair>summary::-webkit-details-marker{display:none}
      .li-rp-body{display:flex;flex-direction:column;gap:6px;margin-top:6px}
      .li-repair textarea{font:11px ui-monospace,Menlo,Consolas,monospace;background:#15181f;color:#e6e9ef;border:1px solid #2a2f3a;border-radius:6px;padding:6px;resize:vertical;min-height:90px}
      .li-rp-item{border:1px solid #2a2f3a;border-radius:6px;padding:5px 7px;font-size:11px}
      .li-rp-item.ok{border-color:#2f6e52}
      .li-rp-item.bad{border-color:#7a2a33}
      .li-rp-item ul{margin:3px 0 0;padding-left:16px}
    `;
    document.head.appendChild(st);
  }

  // Хуки для renderLib (Sandbox_Content.html)
  window.SB_inspectorActive=()=>INSP.on;
  window.SB_renderInspector=render;
  window.SB_libraryAudit={ diagnose, diagnoseRec, catsOf, deletable, recreatable, setOn, invalidate, _state:INSP };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mountButton); else mountButton();
})();
