/* ============================================================
   Motion Studio Exporter v1
   ------------------------------------------------------------
   ВАЖНО:
   - не изменяет исходную композицию;
   - не пересчитывает layout и не делает новый frame;
   - берёт ТОЛЬКО выделенные шаблоны из Sandbox;
   - добавляет технический Motion Studio / AE contract;
   - сохраняет результат как один самозагружающийся library.js.
   ============================================================ */
(function(){
  'use strict';

  const TARGETS = {
    '16:9': { width:1920, height:1080 },
    '9:16': { width:1080, height:1920 }
  };

  function getSelectedTemplates(){
    // Важно: LIB и checked объявлены в основном Sandbox как top-level let.
    // Они доступны этому classic-script, но не являются window.LIB/window.checked.
    if(typeof LIB === 'undefined' || typeof checked === 'undefined') return [];
    if(!checked || !checked.size) return [];
    return [...checked].map(id=>LIB[id]).filter(Boolean);
  }

  function escapeCssAttr(value){
    if(window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/(["\\])/g,'\\$1');
  }

  function collectEntities(source, html){
    const out = [];
    const seen = new Set();

    function add(type, slot, role){
      const s = String(slot || '').trim();
      if(!s || seen.has(s)) return;
      out.push({
        type,
        slot:s,
        role:String(role || (type === 'image' ? 'image' : 'body'))
      });
      seen.add(s);
    }

    // Сохраняем уже известную семантику шаблона, если она есть.
    if(Array.isArray(source.entities)){
      source.entities.forEach(e=>{
        if(!e || !e.type || !e.slot) return;
        add(
          e.type === 'image' ? 'image' : 'text',
          e.slot,
          e.role || (e.type === 'image' ? 'image' : 'body')
        );
      });
    }

    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');

    doc.querySelectorAll('[data-sb-editable][data-slot]').forEach(el=>{
      add(
        'text',
        el.getAttribute('data-slot'),
        el.getAttribute('data-role') || 'body'
      );
    });

    doc.querySelectorAll('[data-sb-media][data-slot]').forEach(el=>{
      add('image', el.getAttribute('data-slot'), 'image');
    });

    return out;
  }

  function normalizeMotionHtml(html, entities){
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const root = doc.body.firstElementChild;
    if(!root) return String(html || '');

    entities.forEach(e=>{
      const selector = e.type === 'image'
        ? `[data-sb-media][data-slot="${escapeCssAttr(e.slot)}"]`
        : `[data-sb-editable][data-slot="${escapeCssAttr(e.slot)}"]`;

      doc.querySelectorAll(selector).forEach(el=>{
        if(e.type === 'image'){
          el.classList.add('sv-media');
          el.setAttribute('data-sb-media','');
          el.setAttribute('data-slot',e.slot);
          el.setAttribute('data-kind','image');
        }else{
          el.setAttribute('data-sb-editable','');
          el.setAttribute('data-slot',e.slot);
          el.setAttribute('data-role',e.role || 'body');
        }
      });
    });

    return root.outerHTML;
  }

  function detectAspect(source, html, forcedAspect){
    if(forcedAspect === '16:9' || forcedAspect === '9:16') return forcedAspect;

    const a = String(source.aspect || '').trim();
    if(a === '16:9' || a === '9:16') return a;

    const c = source.canvas;
    if(c && Number(c.width) > 0 && Number(c.height) > 0){
      return Number(c.height) > Number(c.width) ? '9:16' : '16:9';
    }

    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const root = doc.body.firstElementChild;
    const style = root ? (root.getAttribute('style') || '') : '';
    const m = style.match(/(?:^|;)\s*aspect-ratio\s*:\s*([0-9.]+)\s*\/\s*([0-9.]+)\s*;?/i);
    if(m){
      const w = Number(m[1]), h = Number(m[2]);
      if(w > 0 && h > 0) return h > w ? '9:16' : '16:9';
    }

    return '16:9';
  }

  function convertTemplate(source, forcedAspect){
    if(!source || typeof source !== 'object') return null;

    const originalHtml = String(source.html || '');
    if(!originalHtml.trim()) return null;

    const entities = collectEntities(source, originalHtml);
    const html = normalizeMotionHtml(originalHtml, entities);

    const aspect = detectAspect(source, originalHtml, forcedAspect);
    const target = TARGETS[aspect];

    const kind = (
      String(source.kind || '').toLowerCase() === 'auto' ||
      /data-sb-repeat\s*=/.test(html)
    ) ? 'auto' : 'static';

    return {
      tpl: String(source.tpl || ''),
      family: String(source.family || source.tpl || ''),
      group: String(source.group || ''),
      label: String(source.label || source.tpl || ''),
      code: String(source.code || ''),
      icon: String(source.icon || '▧'),
      kind,
      single: source.single === true,
      desc: String(source.desc || ''),
      styleSystem: (
        source.styleSystem &&
        typeof STYLES !== 'undefined' &&
        STYLES[source.styleSystem]
      ) ? source.styleSystem : 'default',

      aspect,
      canvas: { width:target.width, height:target.height },
      entities,

      motion: {
        contract: 'motion-studio-template-v1',
        aspect,
        canvas: { width:target.width, height:target.height },
        entities: entities.map(e=>({
          type:e.type,
          slot:e.slot,
          role:e.role
        })),
        animation: { type:'none' }
      },

      // Исходный HTML после чисто технической маркировки.
      // Геометрия/композиция здесь не переписывается.
      html
    };
  }

  function tplHash(t){
    const norm = String(t.html || '').replace(/\s+/g,' ').trim();
    return String(t.tpl || '') + '::' + norm;
  }

  function buildMotionLibraryJs(templates){
    const seen = new Set();
    const uniq = [];

    templates.forEach(t=>{
      const h = tplHash(t);
      if(seen.has(h)) return;
      seen.add(h);
      uniq.push(t);
    });

    const styleReg = {};
    if(typeof STYLES !== 'undefined'){
      Object.keys(STYLES).forEach(k=>{
        styleReg[k] = {
          name:STYLES[k].name || k,
          color:STYLES[k].color || ''
        };
      });
    }

    const body = uniq.map(t=>{
      // JSON.stringify для HTML безопаснее template literal:
      // кавычки, backticks и ${} внутри HTML не требуют ручного экранирования.
      const htmlLiteral = JSON.stringify(t.html || '');
      const fav = !!t.favorite;

      return `  {
    tpl:${JSON.stringify(t.tpl)},
    family:${JSON.stringify(t.family)},
    group:${JSON.stringify(t.group)},
    label:${JSON.stringify(t.label)},
    code:${JSON.stringify(t.code)},
    icon:${JSON.stringify(t.icon || '▧')},
    kind:${JSON.stringify(t.kind || 'static')},
    ${t.single ? 'single:true,' : ''}
    desc:${JSON.stringify(t.desc || '')},
    styleSystem:${JSON.stringify(t.styleSystem || 'default')},
    favorite:${fav},
    aspect:${JSON.stringify(t.aspect)},
    canvas:${JSON.stringify(t.canvas)},
    entities:${JSON.stringify(t.entities)},
    motion:${JSON.stringify(t.motion)},
    build:i=>${htmlLiteral}
  }`;
    }).join(',\n\n');

    return `/* ============================================================
   library.js — Motion Studio library
   Сгенерировано Sandbox.
   Шаблонов: ${uniq.length}
   ============================================================ */
(function(){
  const STYLE_SYSTEMS=${JSON.stringify(styleReg,null,2)};
  const LIBRARY=[

${body}

  ];

  if(window.SB_registerStyleSystems){
    window.SB_registerStyleSystems(STYLE_SYSTEMS);
  }else{
    window.SB_PENDING_STYLE_SYSTEMS=Object.assign(
      window.SB_PENDING_STYLE_SYSTEMS||{},
      STYLE_SYSTEMS
    );
  }

  if(window.SB_registerTemplates){
    window.SB_registerTemplates(LIBRARY);
  }else{
    window.SB_PENDING_TEMPLATES=(window.SB_PENDING_TEMPLATES||[]).concat(LIBRARY);
  }
})();
`;
  }

  function downloadJs(filename, text){
    const blob = new Blob([text], {type:'text/javascript;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 0);
  }

  function openDialog(){
    const selected = getSelectedTemplates();

    if(!selected.length){
      if(typeof toast === 'function') toast('Сначала выдели шаблоны для Motion Studio');
      return;
    }

    const old = document.getElementById('motionConvModal');
    if(old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'motionConvModal';
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.68);' +
      'display:flex;align-items:center;justify-content:center;padding:24px;';

    wrap.innerHTML = `
      <div style="width:min(560px,100%);background:#171a20;color:#f4f6f8;border:1px solid #2c323c;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.45);overflow:hidden;font-family:inherit">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #2b3038;font-weight:700">
          <span>Motion Studio — экспорт</span>
          <button id="motionConvClose" style="border:0;background:#242933;color:#fff;border-radius:8px;padding:7px 10px;cursor:pointer">×</button>
        </div>
        <div style="padding:20px">
          <div style="font-size:13px;color:#9da5b1;margin-bottom:12px">
            Выделено шаблонов:
            <b style="color:#fff">${selected.length}</b>
          </div>

          <div style="font-size:13px;color:#9da5b1;margin-bottom:7px">
            Aspect для Motion metadata
          </div>

          <select id="motionConvAspect"
            style="width:100%;background:#101319;color:#fff;border:1px solid #343b46;border-radius:8px;padding:11px 12px;font:inherit">
            <option value="auto">Как у шаблона / определить автоматически</option>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
          </select>

          <div style="font-size:12px;color:#7f8793;line-height:1.5;margin-top:12px">
            На этом этапе меняется только экспортный контракт.
            Исходный HTML и геометрия шаблона не пересчитываются и не перерисовываются.
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px">
            <button id="motionConvCancel" class="tb-btn">Отмена</button>
            <button id="motionConvRun" class="tb-btn accent">⬇ Экспорт library.js</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(wrap);

    const close = ()=>wrap.remove();
    wrap.querySelector('#motionConvClose').onclick = close;
    wrap.querySelector('#motionConvCancel').onclick = close;
    wrap.addEventListener('click', e=>{
      if(e.target === wrap) close();
    });

    wrap.querySelector('#motionConvRun').onclick = ()=>{
      const choice = wrap.querySelector('#motionConvAspect').value;
      const forcedAspect = choice === 'auto' ? null : choice;

      // Берём выбор заново в момент экспорта — на случай, если пользователь
      // изменил выделение до нажатия кнопки.
      const source = getSelectedTemplates();
      if(!source.length){
        if(typeof toast === 'function') toast('Нет выделенных шаблонов');
        close();
        return;
      }

      const converted = source
        .map(t=>convertTemplate(t, forcedAspect))
        .filter(Boolean);

      if(!converted.length){
        if(typeof toast === 'function') toast('Нет шаблонов для экспорта');
        close();
        return;
      }

      downloadJs('library.js', buildMotionLibraryJs(converted));

      if(typeof toast === 'function'){
        toast('Motion Studio library.js: '+converted.length+' шаблон(ов)');
      }
      close();
    };
  }

  function init(){
    const btn = document.getElementById('btnExportMotion');
    if(!btn) return;
    btn.onclick = openDialog;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }

  window.SB_motionExporter = {
    getSelectedTemplates,
    collectEntities,
    normalizeMotionHtml,
    convertTemplate,
    buildMotionLibraryJs,
    openDialog
  };
})();
