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
  const COLUMN_MIN = 1, COLUMN_MAX = 3, COLUMN_DEF = 2;

  const gstate = {
    mode: 'single', // 'single' | 'grid'
    query: '',
    rendered: new Set(),
    observer: null,
    fitRO: null,
    fitRaf: 0,
    railCollapsed: false,
    columns: COLUMN_DEF
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
        #galRoot .gal-grid{display:grid;grid-template-columns:repeat(var(--gal-cols,${COLUMN_DEF}),minmax(0,1fr));gap:${GAP}px;max-width:1900px;margin:0 auto;align-items:start}
        #galRoot .gal-card{background:#151a21;border:1px solid #2d3440;border-radius:0;overflow:hidden;min-width:0;align-self:start;cursor:pointer;position:relative;user-select:none;-webkit-user-select:none}
        #galRoot .gal-card.sel{border-color:var(--ui-accent);box-shadow:0 0 0 1px var(--ui-accent)}
        #galRoot .gal-card.active{box-shadow:0 0 0 1px var(--ui-accent), inset 3px 0 0 var(--ui-accent-2)}
        #galRoot .gal-frame{width:100%;overflow:hidden;background:#151a21;position:relative}
        #galRoot .gal-scale{width:${DESKTOP_WIDTH}px;transform-origin:top left}
        #galRoot .gal-loading{height:160px;display:flex;align-items:center;justify-content:center;color:#717b8c;font:11px Arial,Helvetica,sans-serif}
        #galRoot .gal-error{padding:18px;background:#2b171b;color:#ff9ca5;font:11px/1.45 ui-monospace,Menlo,monospace;white-space:pre-wrap;min-height:120px}
        #galRoot .gal-empty{padding:60px 20px;text-align:center;color:#8f99aa;font:12px Arial,Helvetica,sans-serif;grid-column:1/-1}
        #galRoot .gal-colbar{flex:0 0 auto;display:flex;justify-content:center;align-items:center;padding:8px 16px;border-top:1px solid var(--ui-line);background:var(--ui-panel)}
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
        <div class="gal-colbar" title="Количество колонок в «Карте»">
          <div class="gal-cols" role="group" aria-label="Количество колонок">
            <button type="button" data-gal-cols="3" aria-label="Три колонки">3</button>
            <button type="button" data-gal-cols="2" aria-label="Две колонки">2</button>
            <button type="button" data-gal-cols="1" aria-label="Одна колонка">1</button>
          </div>
        </div>`;
      stage.appendChild(root);
      root.querySelector('[data-gal-search]').oninput=e=>{
        gstate.query=e.target.value||'';
        rebuild(true);
      };
      root.querySelectorAll('[data-gal-cols]').forEach(btn=>{
        btn.onclick=()=>setColumns(+btn.getAttribute('data-gal-cols'));
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
        if(!(e.ctrlKey||e.metaKey)) checked.clear();
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
    card.innerHTML=`<div class="gal-frame"><div class="gal-scale"><div class="gal-loading">Создание preview…</div></div></div>`;
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

  /* Точная посадка: width=clientWidth рамки, масштаб = avail/1280 (без cap 1.0 —
     при приближении карточка заполняет ширину, справа не остаётся белой полосы),
     высота — фактическая высота отмасштабированного контента, без округлений
     (ceil давал белый зазор снизу у тёмных шаблонов). */
  function fitCard(card){
    const frame=card.querySelector('.gal-frame');
    const scaleHost=card.querySelector('.gal-scale');
    const stageEl=card.querySelector('.sb-gal-stage');
    if(!frame||!scaleHost||!stageEl) return;
    const avail=Math.max(1,frame.clientWidth||1);
    const scale=avail/DESKTOP_WIDTH;
    scaleHost.style.transform=`scale(${scale})`;
    const h=stageEl.getBoundingClientRect().height; // уже с учётом transform
    const hh=(h>2?h:160)+'px';
    if(frame.style.height!==hh) frame.style.height=hh;
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
    try{
      hostEl.innerHTML='';
      const stageEl=document.createElement('div');
      stageEl.className='stage-wrap desktop sb-gal-stage';
      stageEl.style.cssText=`width:${DESKTOP_WIDTH}px;max-width:none;margin:0;border-radius:0;box-shadow:none;background:#fff;color:#111315`;
      const inst=document.createElement('div');
      inst.id='preview';               // scoped SITE_CSS привязан к #preview
      inst.style.minHeight='0';        // гасит глобальное #preview{min-height:60px} — источник белых полос под короткими шаблонами
      inst.innerHTML=t.html||'';
      stageEl.appendChild(inst);
      hostEl.appendChild(stageEl);
      cleanLikeHost(inst);
      observeFit(card);
      requestAnimationFrame(()=>{
        fitCard(card);
        gstate.rendered.add(id);
      });
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
    const rootEl=document.querySelector('#galRoot [data-gal-scroll]');
    if(!rootEl) return;
    gstate.observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const id=entry.target.dataset.id;
        if(!id || gstate.rendered.has(id)) return;
        renderCard(entry.target,id);
      });
    },{root:rootEl,rootMargin:'900px 0px'});
    document.querySelectorAll('#galRoot .gal-card').forEach(c=>gstate.observer.observe(c));
  }

  /* ---------- Колонки «Карты»: только 3 / 2 / 1 ---------- */

  function setColumns(cols){
    gstate.columns=Math.max(COLUMN_MIN,Math.min(COLUMN_MAX,Number(cols)||COLUMN_DEF));
    applyColumns();
  }

  function applyColumns(){
    const grid=document.querySelector('#galRoot [data-gal-grid]');
    if(!grid) return;
    grid.style.setProperty('--gal-cols',String(gstate.columns));
    document.querySelectorAll('#galRoot [data-gal-cols]').forEach(btn=>{
      btn.classList.toggle('on',+btn.getAttribute('data-gal-cols')===gstate.columns);
    });
    fitAll();
  }

  function cycleColumns(delta){
    const next=Math.max(COLUMN_MIN,Math.min(COLUMN_MAX,gstate.columns+delta));
    if(next!==gstate.columns) setColumns(next);
  }

  /* ---------- Построение/переключение ---------- */

  function rebuild(resetScroll){
    if(gstate.mode!=='grid') return;
    const root=ensureUi();
    const ids=filteredIds();
    const grid=root.querySelector('[data-gal-grid]');
    gstate.rendered.clear();
    const frag=document.createDocumentFragment();
    if(!ids.length){
      const empty=document.createElement('div');
      empty.className='gal-empty';
      empty.textContent='Шаблоны не найдены.';
      frag.appendChild(empty);
    }else{
      ids.forEach(id=>frag.appendChild(makeCard(id)));
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
    cards.slice(0,8).forEach(c=>{
      const id=c.dataset.id;
      if(id && !gstate.rendered.has(id)) renderCard(c,id);
    });
    paintCards(); // выделяем то, что уже отмечено в общем наборе
  }

  function setMode(mode){
    gstate.mode=mode==='grid'?'grid':'single';
    document.body.classList.toggle('gal-grid', gstate.mode==='grid');
    document.querySelectorAll('.view-switch button').forEach(b=>{
      b.classList.toggle('on', b.getAttribute('data-view')===gstate.mode);
    });
    if(gstate.mode==='grid'){
      ensureUi();
      rebuild(true);
      requestAnimationFrame(applyColumns);
    }else if(typeof selectedId!=='undefined' && selectedId && typeof selectTpl==='function'){
      selectTpl(selectedId,true);
    }
  }

  function setRailCollapsed(on){
    gstate.railCollapsed=!!on;
    document.body.classList.toggle('gal-rail-off', gstate.railCollapsed);
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
        cycleColumns(k==='+' || k==='=' ? -1 : 1);
      }
    });

    window.addEventListener('resize',()=>{
      if(gstate.mode!=='grid') return;
      fitAll();
    });
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(()=>fitAll());
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();

  window.SB_Gallery={
    setMode, rebuild, setRailCollapsed, fitAll, setColumns, cycleColumns,
    get mode(){ return gstate.mode; },
    get state(){ return gstate; }
  };
})();
