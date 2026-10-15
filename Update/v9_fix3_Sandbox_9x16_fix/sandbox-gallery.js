/* ============================================================
   sandbox-gallery.js — режим «карта» для Template Factory.

   Подключается ПОСЛЕ основного скрипта Sandbox_Content.html.
   Источник шаблонов = LIB. Превью = t.html как есть (без randomize,
   без плашек стиля/ID). Сетка: 1280 → scale (DESKTOP_WIDTH сохранён).

   Этап 11 (доработка «Карты»):
   • выделение карточек живёт на том же едином наборе `checked`, что и
     список слева; click / Ctrl(Cmd)+click / Shift+click, общий anchorId,
     синхронизация в обе стороны через paintSelection()/paintCards();
   • карточки без скруглений; фон рамки = фон карточки (никаких белых
     полос при lazy-render); высота — точная (без ceil-зазоров), пересчёт
     по ResizeObserver (шрифты/lazy/zoom/resize);
   • ползунок масштаба закреплён внизу «Карты» (число колонок считается
     CSS auto-fill, масштаб не ограничен 1.0 — белая полоса справа ушла);
   • фильтры (стили/группы/прогоны) — мультивыбор хоста, галерея просто
     использует общий предикат tplPassesFilters().

   Не пишет в localStorage сам — все мутации идут через хост
   (bulkAssignStyle / bulkMoveGroup / bulkDelete / selectTpl).
   ============================================================ */
(function(){
  'use strict';

  const DESKTOP_WIDTH = 1280;
  const GAP = 16;
  // Масштаб «Карты»: целевая высота строки H, px (Justified Gallery). Ширина каждой миниатюры = H × (fw/fh) её формата.
  const GAL_W = { min:180, max:900, def:500, step:20 };
  const ROW_TOL = 0.2;                // допустимая высота растянутой строки: ±20% от H
  const ROW_LO = 1-ROW_TOL, ROW_HI = 1+ROW_TOL;
  const FALLBACK_RATIO = 16/9;        // если формат не найден ни в одном источнике (явный fallback, см. formatCensus)

  const gstate = {
    mode: 'single', // 'single' | 'grid'
    query: '',
    rendered: new Set(),
    observer: null,
    fitRO: null,
    fitRaf: 0,
    railCollapsed: false,
    cardW: GAL_W.def,   // целевая высота строки H
    savedScroll: 0,     // Этап 2: позиция прокрутки «Карты» при уходе в одиночный просмотр
    cache: new Map(),   // Этап 1: id -> {html, stage} готовый превью-узел
    sig: null,          // Этап 1: сигнатура набора карточек
    htmlOf: new Map(),  // Этап 1: id -> html, на котором построена карточка
    unmount: null       // Этап 1: наблюдатель выгрузки дальних карточек
  };

  function host(){
    return {
      LIB: typeof LIB!=='undefined' ? LIB : {},
      STYLES: typeof STYLES!=='undefined' ? STYLES : {},
      BATCHES: typeof BATCHES!=='undefined' ? BATCHES : {},
      GROUP_ORDER: typeof GROUP_ORDER!=='undefined' ? GROUP_ORDER : [],
      // Этап 11: общий предикат верхних мультивыбор-фильтров живёт в хосте
      passes: (typeof tplPassesFilters==='function') ? tplPassesFilters : null
    };
  }

  function escG(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function batchLabel(t){
    const {BATCHES}=host();
    const b=t && t.batch && BATCHES[t.batch] ? BATCHES[t.batch] : null;
    if(!b) return '';
    return b.label || '';
  }

  function filteredIds(){
    const {LIB, passes}=host();
    const q=gstate.query.trim().toLowerCase();
    const ids=Object.keys(LIB);
    const out=ids.filter(id=>{
      const t=LIB[id]; if(!t) return false;
      if(passes && !passes(t)) return false;
      if(!q) return true;
      const hay=[id,t.tpl,t.label,t.family,t.group,t.code,batchLabel(t)].join(' ').toLowerCase();
      return hay.includes(q);
    });
    out.sort((a,b)=>{
      const da=LIB[a]||{}, db=LIB[b]||{};
      const {GROUP_ORDER}=host();
      const rank=new Map((GROUP_ORDER||[]).map((g,i)=>[String(g),i]));
      const ga=rank.has(String(da.group||''))?rank.get(String(da.group||'')):999;
      const gb=rank.has(String(db.group||''))?rank.get(String(db.group||'')):999;
      if(ga!==gb) return ga-gb;
      return String(da.label||a).localeCompare(String(db.label||b),'ru',{numeric:true,sensitivity:'base'});
    });
    return out;
  }

  function ensureUi(){
    let style=document.getElementById('sbGalUiStyles');
    if(!style){
      style=document.createElement('style');
      style.id='sbGalUiStyles';
      style.textContent=`
        body.gal-grid .stage-head{display:none!important}
        body.gal-grid #stageWrap{display:none!important}
        body.gal-grid #galRoot{display:flex}
        #galRoot{display:none;flex-direction:column;flex:1;min-height:0;margin:-26px;height:calc(100% + 52px);}
        #galRoot .gal-tools{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--ui-line);background:var(--ui-panel);flex:0 0 auto;flex-wrap:wrap}
        #galRoot .gal-count{font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ui-muted);margin-right:auto}
        #galRoot .gal-tools input{font:inherit;font-size:11px;padding:7px 9px;border-radius:7px;border:1px solid var(--ui-line);background:var(--ui-panel-2);color:var(--ui-text)}
        #galRoot .gal-scroll{flex:1;min-height:0;overflow:auto;padding:16px}
        #galRoot .gal-grid{position:relative;max-width:1900px;margin:0 auto}
        #galRoot .gal-card{background:#151a21;border:1px solid #2d3440;border-radius:0;overflow:hidden;box-sizing:border-box;cursor:pointer;position:absolute;user-select:none;-webkit-user-select:none}
        #galRoot .gal-card.sel{border-color:var(--ui-accent);box-shadow:0 0 0 1px var(--ui-accent)}
        #galRoot .gal-card.active{box-shadow:0 0 0 1px var(--ui-accent), inset 3px 0 0 var(--ui-accent-2)}
        #galRoot .gal-frame{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;background:#151a21}
        #galRoot .gal-scale{width:${DESKTOP_WIDTH}px;transform-origin:top left}
        #galRoot .gal-loading{height:160px;display:flex;align-items:center;justify-content:center;color:#717b8c;font:11px Arial,Helvetica,sans-serif}
        #galRoot .gal-error{padding:18px;background:#2b171b;color:#ff9ca5;font:11px/1.45 ui-monospace,Menlo,monospace;white-space:pre-wrap;min-height:120px}
        #galRoot .gal-empty{padding:60px 20px;text-align:center;color:#8f99aa;font:12px Arial,Helvetica,sans-serif}
        #galRoot .gal-colbar{flex:0 0 auto;display:flex;justify-content:center;align-items:center;padding:8px 16px;border-top:1px solid var(--ui-line);background:var(--ui-panel)}
        #galRoot .gal-size{display:flex;align-items:center;gap:10px;color:var(--ui-muted);font:700 11px/1 ui-monospace,Menlo,monospace}
        #galRoot .gal-size input{width:240px;accent-color:var(--ui-accent-2)}
        #galRoot .gal-cols{display:flex;align-items:center;gap:2px;background:var(--ui-panel-2);border:1px solid var(--ui-line);border-radius:8px;padding:3px}
        #galRoot .gal-cols button{min-width:34px;height:28px;padding:0 9px;border-radius:6px;color:var(--ui-muted);font-size:11px;font-weight:700;cursor:pointer}
        #galRoot .gal-cols button:hover{color:var(--ui-text);background:#232935}
        #galRoot .gal-cols button.on{background:var(--ui-accent-2);color:#fff}
        body.gal-rail-off{--rail:0px}
        body.gal-rail-off .rail{width:0;padding:0;overflow:hidden;border:0}
        .rail-toggle{width:28px;height:28px;border-radius:7px;border:1px solid var(--ui-line);background:var(--ui-panel-2);color:var(--ui-muted);font-size:12px;display:grid;place-items:center;flex-shrink:0}
        .rail-toggle:hover{border-color:var(--ui-accent);color:var(--ui-text)}
        .view-switch{display:flex;gap:2px;background:var(--ui-panel-2);border:1px solid var(--ui-line);border-radius:8px;padding:3px}
        .view-switch button{font-size:11px;font-weight:600;padding:5px 10px;border-radius:6px;color:var(--ui-muted)}
        .view-switch button.on{background:var(--ui-accent-2);color:#fff}
        .top-filter{min-width:160px;background:var(--ui-panel-2);border:1px solid var(--ui-line);border-radius:8px;color:var(--ui-text);font-size:12px;font-weight:600;padding:7px 10px}
      `;
      document.head.appendChild(style);
    }

    let root=document.getElementById('galRoot');
    if(!root){
      const stage=document.getElementById('stage');
      root=document.createElement('div');
      root.id='galRoot';
      root.innerHTML=`
        <div class="gal-tools">
          <div class="gal-count" data-gal-count></div>
          <input data-gal-search type="search" placeholder="Поиск ID / название" style="min-width:180px">
        </div>
        <div class="gal-scroll" data-gal-scroll>
          <div class="gal-grid" data-gal-grid></div>
        </div>
        <div class="gal-colbar" title="Масштаб миниатюр в «Карте»">
          <label class="gal-size">Масштаб <input type="range" data-gal-size min="${GAL_W.min}" max="${GAL_W.max}" step="${GAL_W.step}" value="${GAL_W.def}"> <span data-gal-size-val>${GAL_W.def}px</span></label>
        </div>`;
      stage.appendChild(root);
      root.querySelector('[data-gal-search]').oninput=e=>{
        gstate.query=e.target.value||'';
        rebuild(true);
      };
      root.querySelector('[data-gal-size]').oninput=e=>setCardWidth(+e.target.value);
      root.querySelectorAll('[data-gal-cols]').forEach(btn=>{
        btn.onclick=()=>setCardWidth(+btn.getAttribute('data-gal-cols'));
      });
      // Двойной клик по карточке → одиночный просмотр этого шаблона (Этап 2)
      root.querySelector('[data-gal-scroll]').addEventListener('dblclick',e=>{
        const card=e.target.closest('.gal-card');
        if(!card || e.target.closest('a,button,input,select,textarea')) return;
        e.preventDefault();
        openSingle(card.dataset.id);
      });
      // Выделение карточек + снятие выделения кликом по пустому месту
      root.querySelector('[data-gal-scroll]').addEventListener('click',e=>{
        const card=e.target.closest('.gal-card');
        if(card){ onCardClick(e,card); return; }
        if(e.target.closest('a,button,input,select,textarea')) return;
        if(typeof clearSelectionEmpty==='function') clearSelectionEmpty(); // внутри есть paintSelection → paintCards
        else { if(typeof checked!=='undefined'&&checked.size){checked.clear(); paintCards();} }
      });
    }
    return root;
  }

  /* ---------- Выделение: единый набор `checked` с левым списком ---------- */

  function onCardClick(e,card){
    if(e.target.closest('a')) e.preventDefault(); // ссылки внутри превью не должны уводить со страницы
    const id=card.dataset.id;
    if(typeof LIB==='undefined' || !LIB[id]) return;

    const ids=filteredIds();
    const anchor=(typeof anchorId!=='undefined')?anchorId:null;

    if(e.shiftKey && anchor && ids.length){
      // Shift — диапазон по порядку «Карты», якорь общий со списком слева
      const a=ids.indexOf(anchor), b=ids.indexOf(id);
      if(a!==-1 && b!==-1){
        const [lo,hi]=a<b?[a,b]:[b,a];
        if(!(e.ctrlKey||e.metaKey) && !(typeof onlySelFilter!=='undefined' && onlySelFilter)) checked.clear();
        for(let i=lo;i<=hi;i++) checked.add(ids[i]);
      }else{
        checked.clear(); checked.add(id); anchorId=id;
      }
      selectedId=id;
    }else if(e.ctrlKey||e.metaKey){
      if(checked.has(id)) checked.delete(id); else checked.add(id);
      anchorId=id;
      if(checked.has(id)) selectedId=id;
      else if(checked.size) selectedId=[...checked][checked.size-1];
    }else if(typeof onlySelFilter!=='undefined' && onlySelFilter && checked.has(id)){
      // фильтр «только выделенные»: клик не сужает выделение
      anchorId=id; selectedId=id;
    }else{
      checked.clear(); checked.add(id);
      anchorId=id;
      selectedId=id;
    }

    if(typeof paintSelection==='function') paintSelection(); // хост перекрашивает rail/галки/статы/bulkBar; обёртка — карточки
    else paintCards();
    const t=(typeof LIB!=='undefined')?(LIB[selectedId]||LIB[id]):null;
    if(t && typeof renderInspector==='function') renderInspector(t);
  }

  function paintCards(){
    document.querySelectorAll('#galRoot .gal-card').forEach(card=>{
      const id=card.dataset.id;
      card.classList.toggle('sel', checked.has(id));
      card.classList.toggle('active', id===selectedId);
    });
  }

  function makeCard(id){
    const card=document.createElement('article');
    card.className='gal-card';
    card.dataset.id=id;
    if(typeof checked!=='undefined' && checked.has(id)) card.classList.add('sel');
    if(typeof selectedId!=='undefined' && id===selectedId) card.classList.add('active');
    card.innerHTML=`<div class="gal-frame"><div class="gal-scale"></div></div>`;
    return card;
  }

  /* ---------- Рендер превью (t.html как есть) ---------- */

  function cleanLikeHost(root){
    if(typeof cleanPreview==='function'){
      try{ cleanPreview(root); return; }catch(e){}
    }
    root.querySelectorAll('[data-sb-media]').forEach(m=>{
      const kind=m.getAttribute('data-kind'), src=m.getAttribute('data-src')||'';
      m.innerHTML='';
      if(kind==='video' && src){
        const v=document.createElement('video');
        v.src=src; v.muted=true; v.loop=true; v.autoplay=true; v.playsInline=true;
        m.appendChild(v);
      }else if(src){
        m.style.backgroundImage=`url('${src.replace(/'/g,"%27")}')`;
      }
    });
    root.querySelectorAll('[contenteditable]').forEach(x=>x.removeAttribute('contenteditable'));
  }

  /* Масштаб сцены: ширина рамки / 1280 (белой полосы справа нет).
     Размер рамки задаёт раскладка строк (layoutGrid), а не высота HTML шаблона. */
  function fitCard(card){
    const frame=card.querySelector('.gal-frame');
    const scaleHost=card.querySelector('.gal-scale');
    if(!frame||!scaleHost) return;
    const avail=Math.max(1,frame.clientWidth||1);
    scaleHost.style.transform=`scale(${avail/DESKTOP_WIDTH})`;
  }

  /* ---------- Формат карточки (Justified Gallery) ----------
     Приоритет: 1) recomposeFrame результата адаптации (формат кодирован в ключе кэша RC
     и в RecomposeCore.FORMATS); 2) canvas шаблона (эталон формата); 3) aspect шаблона;
     4) явный fallback 16:9 — с пометкой в formatCensus(). */
  function parseAspect(s){
    const m=/^\s*(\d+(?:\.\d+)?)\s*[:\/x×]\s*(\d+(?:\.\d+)?)\s*$/.exec(String(s==null?'':s));
    if(!m) return null;
    const a=+m[1], b=+m[2];
    return (a>0 && b>0) ? {r:a/b, fmt:a+':'+b} : null;
  }
  function cardFormat(id){
    const {LIB}=host();
    const t=LIB[id];
    if(!t) return {r:FALLBACK_RATIO, src:'fallback', fmt:null};
    const v=viewOf(id,t);
    if(v && typeof v.key==='string' && v.key.indexOf('rc|')===0){
      const fmt=v.key.split('|').pop();
      const F=(window.RecomposeCore && window.RecomposeCore.FORMATS)||{};
      const f=F[fmt];
      if(f && f.w>0 && f.h>0) return {r:f.w/f.h, src:'recomposeFrame', fmt};
    }
    if(t.canvas && t.canvas.width>0 && t.canvas.height>0)
      return {r:t.canvas.width/t.canvas.height, src:'canvas', fmt:null};
    const a=parseAspect(t.aspect);
    if(a) return {r:a.r, src:'aspect', fmt:a.fmt};
    return {r:FALLBACK_RATIO, src:'fallback', fmt:null};
  }

  /* Состав строк: ряд набирается из подряд идущих карточек. Для k карточек высота растянутой строки
     h_k = (W − G·(k−1)) / Σr. Берём k с h_k в [ROW_LO·H, ROW_HI·H] и h_k ближе к H.
     Последний ряд (всё оставшееся помещается при натуральной H) — H, выравнивание влево, без растяжения.
     Если допустимого k нет — ряд в натуральной высоте H, сколько помещается; одиночная карточка шире W ужимается до W. */
  function justifyRows(rs, W, H, G){
    const rows=[];
    let i=0;
    const n=rs.length;
    while(i<n){
      const rem=rs.slice(i);
      const natSum=rem.reduce((s,r)=>s+H*r,0)+G*(rem.length-1);
      if(natSum<=W){
        rows.push({from:i, to:n, h:H, ws:rem.map(r=>H*r), stretched:false});
        break;
      }
      let best=null, sumR=0;
      // одиночная карточка не растягивается: k≥2; шире контейнера — ужимается до W ниже
      for(let k=1;k<=rem.length;k++){
        if(k===1){ sumR+=rem[0]; continue; }
        sumR+=rem[k-1];
        const h=(W-G*(k-1))/sumR;
        if(h>=ROW_LO*H && h<=ROW_HI*H && (!best || Math.abs(h-H)<Math.abs(best.h-H))) best={k, h};
      }
      if(best){
        rows.push({from:i, to:i+best.k, h:best.h, ws:rem.slice(0,best.k).map(r=>best.h*r), stretched:true});
        i+=best.k;
        continue;
      }
      let k=0, acc=0;
      while(k<rem.length){
        const add=H*rem[k]+(k?G:0);
        if(k>0 && acc+add>W) break;
        acc+=add; k++;
      }
      let h=H;
      const ws=rem.slice(0,k).map(r=>H*r);
      if(k===1 && ws[0]>W){ h=W/rem[0]; ws[0]=W; }
      rows.push({from:i, to:i+k, h, ws, stretched:false});
      i+=k;
    }
    return rows;
  }

  // Раскладка: абсолютное позиционирование карточек по строкам (DOM-структура карточек не меняется)
  function layoutGrid(){
    const grid=document.querySelector('#galRoot [data-gal-grid]');
    if(!grid) return;
    const cards=[...grid.querySelectorAll(':scope > .gal-card')];
    const W=grid.clientWidth;
    if(!cards.length || !W) { grid.style.height='0px'; return; }
    const sc=document.querySelector('#galRoot [data-gal-scroll]');
    // Высота ряда не выше доступной области просмотра (значение ползунка при этом не меняется)
    const avail=sc ? sc.clientHeight-2*16 : Infinity;
    const H=Math.max(GAL_W.min, Math.min(gstate.cardW, avail));
    const fmts=cards.map(c=>cardFormat(c.dataset.id||''));
    const rows=justifyRows(fmts.map(f=>f.r), W, H, GAP);
    let y=0;
    rows.forEach(row=>{
      let x=0;
      for(let k=0;k<row.to-row.from;k++){
        const card=cards[row.from+k];
        const w=row.ws[k];
        card.style.left=x.toFixed(2)+'px';
        card.style.top=y.toFixed(2)+'px';
        card.style.width=w.toFixed(2)+'px';
        card.style.height=row.h.toFixed(2)+'px';
        x+=w+GAP;
      }
      y+=row.h+GAP;
    });
    grid.style.height=Math.max(0,y-GAP).toFixed(2)+'px';
    gstate.fallbackIds=cards.filter((c,i)=>fmts[i].src==='fallback').map(c=>c.dataset.id);
    cards.forEach(c=>{ if(c.querySelector('.sb-gal-stage')) fitCard(c); });
  }

  /* Перепись форматов по всей библиотеке: какой источник используется и где формат не найден. */
  function formatCensus(){
    const L=host().LIB;
    const out={total:0, bySource:{}, fallback:[]};
    Object.keys(L).forEach(id=>{
      const f=cardFormat(id);
      out.total++;
      out.bySource[f.src]=(out.bySource[f.src]||0)+1;
      if(f.src==='fallback') out.fallback.push(id);
    });
    return out;
  }

  function fitAll(){
    if(gstate.mode!=='grid') return;
    document.querySelectorAll('#galRoot .gal-card').forEach(card=>{
      if(card.querySelector('.sb-gal-stage')) fitCard(card);
    });
  }

  /* Пересчёт вбитых размеров при любых изменениях: шрифты подгрузились,
     lazy-рендер, смена масштаба, ресайз окна — без белых полос и скачков. */
  function ensureFitRO(){
    if(!('ResizeObserver' in window)) return null;
    if(!gstate.fitRO){
      gstate.fitRO=new ResizeObserver(entries=>{
        const cards=new Set();
        entries.forEach(en=>{ const c=en.target.closest ? en.target.closest('.gal-card') : null; if(c) cards.add(c); });
        if(!cards.size || gstate.fitRaf) return;
        gstate.fitRaf=requestAnimationFrame(()=>{
          gstate.fitRaf=0;
          cards.forEach(c=>{ if(c.isConnected) fitCard(c); });
        });
      });
    }
    return gstate.fitRO;
  }

  function observeFit(card){
    const ro=ensureFitRO();
    if(!ro) return;
    const frame=card.querySelector('.gal-frame');
    const stageEl=card.querySelector('.sb-gal-stage');
    if(frame && !frame.__galObs){ frame.__galObs=true; ro.observe(frame); }
    if(stageEl && !stageEl.__galObs){ stageEl.__galObs=true; ro.observe(stageEl); }
  }

  // HTML карточки: результат Recompose (если метод включён и результат готов), иначе исходник
  function viewOf(id,t){ const v=window.RC_viewMarkup&&window.RC_viewMarkup(id); return v?v:{key:t.html,markup:t.html}; }
  function renderCard(card,id){
    const {LIB}=host();
    const t=LIB[id];
    const hostEl=card.querySelector('.gal-scale');
    if(!hostEl) return;
    if(!t){
      hostEl.innerHTML=`<div class="gal-error">Нет шаблона ${escG(id)}</div>`;
      gstate.rendered.add(id);
      return;
    }
    const vw=viewOf(id,t);
    const cached=gstate.cache.get(id);
    if(cached && cached.html===vw.key){
      hostEl.innerHTML='';
      hostEl.appendChild(cached.stage);
      if(window.SB_applyPoolImages) window.SB_applyPoolImages(cached.stage.querySelector('.sb-scope'),id);
      observeFit(card);
      fitCard(card); gstate.rendered.add(id);
      return;
    }
    try{
      hostEl.innerHTML='';
      const stageEl=document.createElement('div');
      stageEl.className='stage-wrap desktop sb-gal-stage';
      stageEl.style.cssText=`width:${DESKTOP_WIDTH}px;max-width:none;margin:0;border-radius:0;box-shadow:none;background:#fff;color:#111315`;
      const inst=document.createElement('div');
      inst.className='sb-scope';            // SITE_CSS scoped под .sb-scope (без повторяющегося id)
      inst.style.minHeight='0';        // гасит глобальное #preview{min-height:60px} — источник белых полос под короткими шаблонами
      inst.innerHTML=vw.markup||'';
      stageEl.appendChild(inst);
      hostEl.appendChild(stageEl);
      cleanLikeHost(inst);
      if(window.SB_applyPoolImages) window.SB_applyPoolImages(inst,id);
      gstate.cache.set(id,{html:vw.key,stage:stageEl});
      observeFit(card);
      fitCard(card);
      gstate.rendered.add(id);
      // веб-шрифты приезжают позже и меняют метрику — re-fit, чтобы не появилось зазора/полосы
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(()=>{ if(card.isConnected && stageEl.isConnected) fitCard(card); });
      }
    }catch(err){
      hostEl.innerHTML=`<div class="gal-error">Не удалось построить ${escG(id)}\n${escG(err&&err.message||err)}</div>`;
      gstate.rendered.add(id);
      console.error('Gallery render failed',id,err);
    }
  }

  function setupObserver(){
    if(gstate.observer) gstate.observer.disconnect();
    if(gstate.unmount) gstate.unmount.disconnect();
    const rootEl=document.querySelector('#galRoot [data-gal-scroll]');
    if(!rootEl) return;
    gstate.observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const id=entry.target.dataset.id;
        if(!id || entry.target.querySelector('.sb-gal-stage')) return;
        renderCard(entry.target,id);
      });
    },{root:rootEl,rootMargin:'900px 0px'});
    gstate.unmount=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting || gstate.mode!=='grid') return;
        const card=entry.target;
        const stage=card.querySelector('.sb-gal-stage');
        const hostEl=card.querySelector('.gal-scale');
        if(!stage || !hostEl) return;
        // узел уходит в кэш, DOM освобождается; высота рамки сохраняется
        stage.remove();
        hostEl.innerHTML='';
      });
    },{root:rootEl,rootMargin:'2400px 0px'});
    document.querySelectorAll('#galRoot .gal-card').forEach(c=>{ gstate.observer.observe(c); gstate.unmount.observe(c); });
  }

  /* ---------- Масштаб «Карты» (целевая высота строки) ---------- */

  function setCardWidth(px){
    gstate.cardW=Math.max(GAL_W.min,Math.min(GAL_W.max,Math.round(Number(px)||GAL_W.def)));
    applyColumns();
  }

  function applyColumns(){
    const grid=document.querySelector('#galRoot [data-gal-grid]');
    if(!grid) return;
    const r=document.querySelector('#galRoot [data-gal-size]');
    if(r && +r.value!==gstate.cardW) r.value=String(gstate.cardW);
    const v=document.querySelector('#galRoot [data-gal-size-val]');
    if(v) v.textContent=gstate.cardW+'px';
    layoutGrid();
  }

  function stepCardWidth(dir){
    setCardWidth(gstate.cardW+dir*GAL_W.step);
  }

  /* ---------- Построение/переключение ---------- */

  function rebuild(resetScroll){
    if(gstate.mode!=='grid') return;
    const root=ensureUi();
    const ids=filteredIds();
    const grid=root.querySelector('[data-gal-grid]');
    const L=host().LIB;
    const sig=ids.join('\u0001');
    const same = sig===gstate.sig && grid.children.length===ids.length && ids.every(id=>gstate.htmlOf.get(id)===viewOf(id,L[id]).key);
    if(same){
      const c0=root.querySelector('[data-gal-count]');
      if(c0) c0.textContent=`${ids.length} / ${Object.keys(L).length}`;
      applyColumns();
      if(resetScroll) root.querySelector('[data-gal-scroll]').scrollTop=0;
      paintCards();
      return;
    }
    gstate.sig=sig;
    gstate.htmlOf=new Map(ids.map(id=>[id,viewOf(id,L[id]).key]));
    gstate.rendered.clear();
    const frag=document.createDocumentFragment();
    if(!ids.length){
      const empty=document.createElement('div');
      empty.className='gal-empty';
      empty.textContent='Шаблоны не найдены.';
      frag.appendChild(empty);
    }else{
      const oldCards=new Map([...grid.querySelectorAll('.gal-card')].map(c=>[c.dataset.id,c]));
      ids.forEach(id=>{ const c=oldCards.get(id)||makeCard(id); frag.appendChild(c); });
    }
    grid.replaceChildren(frag);
    const count=root.querySelector('[data-gal-count]');
    const total=Object.keys(host().LIB).length;
    if(count) count.textContent=`${ids.length} / ${total}`;
    applyColumns();
    if(resetScroll) root.querySelector('[data-gal-scroll]').scrollTop=0;
    setupObserver();
    const cards=[...grid.querySelectorAll('.gal-card')];
    cards.forEach(c=>observeFit(c));
    if(gstate.fallbackIds && gstate.fallbackIds.length) console.warn('Карта: формат не найден, принят fallback 16:9:', gstate.fallbackIds);
    // карточки с устаревшим HTML (включили/выключили метод) — пересобрать
    cards.forEach(c=>{ const id=c.dataset.id, st=c.querySelector('.sb-gal-stage');
      if(st && id && L[id] && (!gstate.cache.get(id) || gstate.cache.get(id).html!==viewOf(id,L[id]).key)){
        st.remove(); const hs=c.querySelector('.gal-scale'); if(hs) hs.innerHTML=''; } });
    cards.slice(0,8).forEach(c=>{
      const id=c.dataset.id;
      if(id && !c.querySelector('.sb-gal-stage') && !gstate.rendered.has(id)) renderCard(c,id);
      if(id && c.querySelector('.sb-gal-stage')) gstate.rendered.add(id);
    });
    paintCards(); // выделяем то, что уже отмечено в общем наборе
  }

  /* Этап 2: переход из карточки в одиночный просмотр; выделение и фильтры уже в общем состоянии */
  function openSingle(id){
    if(typeof LIB==='undefined' || !LIB[id]) return;
    if(!(typeof checked!=='undefined' && checked.has(id))){
      checked.clear(); checked.add(id); anchorId=id;
    }
    selectedId=id;
    setMode('single');
  }

  /* Этап 2: восстановление прокрутки «Карты» (после перестроения и пересчёта размеров карточек) */
  function restoreScroll(){
    const el=document.querySelector('#galRoot [data-gal-scroll]');
    if(!el) return;
    const y=gstate.savedScroll||0;
    el.scrollTop=y;
    requestAnimationFrame(()=>{
      el.scrollTop=y;
      requestAnimationFrame(()=>{ el.scrollTop=y; });
    });
  }

  function renderVisibleNow(){
    const sc=document.querySelector('#galRoot [data-gal-scroll]');
    if(!sc) return;
    const box=sc.getBoundingClientRect();
    document.querySelectorAll('#galRoot .gal-card').forEach(c=>{
      if(c.querySelector('.sb-gal-stage')) return;
      const b=c.getBoundingClientRect();
      if(b.bottom>box.top-300 && b.top<box.bottom+300 && c.dataset.id) renderCard(c,c.dataset.id);
    });
  }

  function setMode(mode){
    const nextMode=mode==='grid'?'grid':'single';
    const scrollEl=document.querySelector('#galRoot [data-gal-scroll]');
    if(gstate.mode==='grid' && nextMode!=='grid' && scrollEl) gstate.savedScroll=scrollEl.scrollTop;
    gstate.mode=nextMode;
    document.body.classList.toggle('gal-grid', gstate.mode==='grid');
    document.querySelectorAll('.view-switch button').forEach(b=>{
      b.classList.toggle('on', b.getAttribute('data-view')===gstate.mode);
    });
    if(gstate.mode==='grid'){
      ensureUi();
      rebuild(false);            // Этап 2: не сбрасываем прокрутку (раньше scrollTop → 0, R15)
      restoreScroll();
      applyColumns();
      renderVisibleNow();
    }else if(typeof selectedId!=='undefined' && selectedId && typeof selectTpl==='function'){
      selectTpl(selectedId,true);
    }
  }

  function setRailCollapsed(on){
    gstate.railCollapsed=!!on;
    document.body.classList.toggle('gal-rail-off', gstate.railCollapsed);
    if(gstate.mode==='grid') requestAnimationFrame(()=>applyColumns());
    const btn=document.getElementById('btnRailToggle');
    if(btn) btn.textContent=gstate.railCollapsed?'›':'‹';
  }

  /* ---------- Хуки к хосту ---------- */

  function hookHost(){
    if(window.__sbGalHooked) return;
    window.__sbGalHooked=true;
    const origRenderLib=window.renderLib;
    if(typeof origRenderLib==='function'){
      window.renderLib=function(){
        const r=origRenderLib.apply(this,arguments);
        if(gstate.mode==='grid') rebuild(false); // список/фильтры/мутации — карта обновляется следом, скролл сохраняем
        return r;
      };
    }
    const origPaint=window.paintSelection;
    if(typeof origPaint==='function'){
      window.paintSelection=function(){
        const r=origPaint.apply(this,arguments);
        paintCards();
        return r;
      };
    }
  }

  function init(){
    hookHost();
    ensureUi();

    document.querySelectorAll('.view-switch button').forEach(btn=>{
      btn.onclick=()=>setMode(btn.getAttribute('data-view'));
    });
    const railBtn=document.getElementById('btnRailToggle');
    if(railBtn) railBtn.onclick=()=>setRailCollapsed(!gstate.railCollapsed);

    document.addEventListener('keydown',e=>{
      if(gstate.mode!=='grid' || !e.ctrlKey || e.altKey || e.metaKey) return;
      const k=e.key;
      if(k==='+' || k==='=' || k==='-'){
        e.preventDefault();
        stepCardWidth(k==='+' || k==='=' ? 1 : -1);
      }
    });

    window.addEventListener('resize',()=>{
      if(gstate.mode!=='grid') return;
      applyColumns();
    });
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(()=>fitAll());
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();

  window.SB_Gallery={
    setMode, rebuild, setRailCollapsed, fitAll, setCardWidth, stepCardWidth, formatCensus, layoutGrid,
    get mode(){ return gstate.mode; },
    get state(){ return gstate; }
  };
})();
