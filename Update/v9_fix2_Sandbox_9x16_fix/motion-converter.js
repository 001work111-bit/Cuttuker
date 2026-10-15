/* ============================================================
   Motion Studio Exporter v1
   ------------------------------------------------------------
   ВАЖНО:
   - не изменяет исходную композицию;
   - не пересчитывает layout и не делает новый frame;
   - берёт ТОЛЬКО выделенные шаблоны из Sandbox;
   - добавляет технический Motion Studio / AE contract;
   - единый экспорт монтажной библиотеки: один librarymotion.js для PMS
     (buildUnifiedLibraryJs): Recompose-метаданные + контракт Motion/AE,
     без отдельного экспорта Motion Studio и без блока формата (aspect — автоматически).
   ============================================================ */
(function(){
  'use strict';

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
    // DOMParser переносит ведущие <style>/<link> в <head>: берём их и все корневые узлы body (не только первый)
    const headNodes = [...doc.head.childNodes].filter(n => n.nodeType === 1 && /^(style|link)$/i.test(n.tagName));
    const bodyNodes = [...doc.body.childNodes].filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
    if(!headNodes.length && !bodyNodes.length) return String(html || '');

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

    return [...headNodes, ...bodyNodes].map(n => n.nodeType === 1 ? n.outerHTML : n.textContent).join('');
  }

  /* ---- Соотношение сторон: реестр SB_FORMATS (расширяемый), без «горизонталь/вертикаль» ---- */
  const ASPECT_TOL = 0.01; // допуск сравнения пропорции (1%)

  function formatList(){
    return (window.SB_FORMATS || []).filter(f => f && f.id && f.ratio && f.ratio.w > 0 && f.ratio.h > 0);
  }
  function formatById(id){
    if(!id) return null;
    return formatList().find(f => f.id === String(id)) || null;
  }
  // Формат, пропорция которого совпадает с w:h в пределах допуска. Ближайший формат не подставляется.
  function formatForSize(w, h){
    w = Number(w); h = Number(h);
    if(!(w > 0 && h > 0)) return null;
    const r = w / h;
    let best = null, bestErr = Infinity;
    formatList().forEach(f => {
      const fr = f.ratio.w / f.ratio.h;
      const err = Math.abs(fr - r) / fr;
      if(err < bestErr){ bestErr = err; best = f; }
    });
    return (best && bestErr <= ASPECT_TOL) ? best : null;
  }
  function validCanvas(c){
    return !!(c && Number(c.width) > 0 && Number(c.height) > 0);
  }

  // Определение формата: явный aspect → canvas → aspect-ratio корня. Иначе null (не угадываем).
  function resolveAspect(source, html){
    const warnings = [];
    const explicit = formatById(String(source.aspect || '').trim());
    const byCanvas = validCanvas(source.canvas) ? formatForSize(source.canvas.width, source.canvas.height) : null;
    if(explicit){
      if(validCanvas(source.canvas) && !byCanvas)
        warnings.push(`aspect ${explicit.id}, но canvas ${source.canvas.width}×${source.canvas.height} не соответствует формату — canvas сохранён без изменений`);
      else if(byCanvas && byCanvas.id !== explicit.id)
        warnings.push(`aspect ${explicit.id} не совпадает с canvas (${byCanvas.id}) — приоритет у явного aspect`);
      return { format: explicit, warnings };
    }
    if(byCanvas) return { format: byCanvas, warnings };
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const root = doc.body.firstElementChild;
    const style = root ? (root.getAttribute('style') || '') : '';
    const m = style.match(/(?:^|;)\s*aspect-ratio\s*:\s*([0-9.]+)\s*\/\s*([0-9.]+)\s*;?/i);
    if(m){
      const byRoot = formatForSize(Number(m[1]), Number(m[2]));
      if(byRoot) return { format: byRoot, warnings };
    }
    const hint = source.aspect ? `aspect «${source.aspect}» не входит в реестр форматов` : 'aspect и canvas не заданы';
    warnings.push(`формат не определён (${hint}); соотношение сторон не подставлено`);
    return { format: null, warnings };
  }

  // Совместимые поля исходного motion: всё, кроме полей, которые пересчитывает конвертер.
  const MOTION_RECALC = ['contract','aspect','canvas','entities','animation'];
  function compatMotion(m, warnings){
    const out = {};
    if(!m || typeof m !== 'object' || Array.isArray(m)) return out;
    Object.keys(m).forEach(k=>{
      if(MOTION_RECALC.indexOf(k) >= 0) return;
      out[k] = JSON.parse(JSON.stringify(m[k]));
    });
    if(m.contract && m.contract !== 'motion-studio-template-v1' && warnings)
      warnings.push(`motion.contract «${m.contract}» заменён на motion-studio-template-v1`);
    return out;
  }

  function convertTemplate(source, forcedAspect){
    if(!source || typeof source !== 'object') return null;

    const originalHtml = String(source.html || '');
    if(!originalHtml.trim()) return null;

    const entities = collectEntities(source, originalHtml);
    const html = normalizeMotionHtml(originalHtml, entities);

    // forcedAspect сохранён для совместимости вызовов; единый экспорт вызывает без него
    const resolved = forcedAspect && formatById(forcedAspect)
      ? { format: formatById(forcedAspect), warnings: [] }
      : resolveAspect(source, originalHtml);
    const fmt = resolved.format;
    const aspect = fmt ? fmt.id : null;
    // canvas: исходный (если корректный) сохраняется; иначе — эталон формата; без формата — null
    const canvas = validCanvas(source.canvas)
      ? { width:Number(source.canvas.width), height:Number(source.canvas.height) }
      : (fmt && fmt.contractCanvas ? { width:fmt.contractCanvas.width, height:fmt.contractCanvas.height } : null);

    const kind = (
      String(source.kind || '').toLowerCase() === 'auto' ||
      /data-sb-repeat\s*=/.test(html)
    ) ? 'auto' : 'static';

    const conv = {
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
      canvas,
      entities,

      // motion: совместимые существующие поля source.motion сохраняются; пересчитываются только
      // contract/aspect/canvas/entities (их значения определяет конвертер)
      motion: Object.assign(compatMotion(source.motion, resolved.warnings), {
        contract: 'motion-studio-template-v1',
        aspect,
        canvas,
        entities: entities.map(e=>({
          type:e.type,
          slot:e.slot,
          role:e.role
        })),
        animation: (source.motion && source.motion.animation && typeof source.motion.animation==='object')
          ? JSON.parse(JSON.stringify(source.motion.animation)) : { type:'none' }
      }),

      // Исходный HTML после чисто технической маркировки. Геометрия не переписывается.
      html
    };
    // служебное поле (не попадает в файл): предупреждения определения формата
    Object.defineProperty(conv, '_warnings', { value: resolved.warnings, enumerable: false });
    return conv;
  }

  function tplHash(t){
    const norm = String(t.html || '').replace(/\s+/g,' ').trim();
    return String(t.tpl || '') + '::' + norm;
  }

  const PLACEHOLDER = { icon:'▧', kind:'static' };
  // group не входит: категории дубликатов объединяются в groups (см. mergeRecord)
  const SCALAR_KEYS = ['family','label','code','icon','desc','kind'];

  function isEmpty(v){ return v === undefined || v === null || v === ''; }

  // Принадлежность шаблона к стилям: styleSystem (совместимость) + styleSystems (список).
  // Первый элемент — основной стиль (он же пишется в styleSystem).
  function membershipOf(src){
    const out = [];
    const add = k => {
      const v = (typeof STYLES !== 'undefined' && STYLES[k]) ? k : 'default';
      if(out.indexOf(v) < 0) out.push(v);
    };
    if(src.styleSystem) add(String(src.styleSystem).trim());
    if(Array.isArray(src.styleSystems)) src.styleSystems.forEach(k=>{ if(k) add(String(k).trim()); });
    if(!out.length) out.push('default');
    return out;
  }

  function buildRecord(src){
    const conv = convertTemplate(src, null);
    if(!conv) return null;
    return {
      conv,
      rc: (window.RC_pickMeta && window.RC_pickMeta(src)) || {},
      styles: membershipOf(src),
      groups: src.group ? [String(src.group)] : [],
      favorite: !!src.favorite,
      warnings: conv._warnings.map(w => `${conv.tpl || src.label || '?'}: ${w}`),
      key: tplHash(src) + '::' + conv.aspect
    };
  }

  // Слияние точного дубликата в уже принятую запись. Непустые поля первого не затираются:
  // при расхождении остаётся значение первого, расхождение попадает в предупреждения.
  function mergeRecord(p, d, warnings){
    const name = p.conv.tpl || p.conv.label || '?';
    const pc = p.conv, dc = d.conv;
    SCALAR_KEYS.forEach(k=>{
      const a = pc[k], b = dc[k];
      const aEmpty = isEmpty(a) || a === PLACEHOLDER[k];
      const bEmpty = isEmpty(b) || b === PLACEHOLDER[k];
      if(aEmpty){ if(!bEmpty) pc[k] = b; return; }
      if(!bEmpty && a !== b) warnings.push(`${name}: поле «${k}» отличается у дубликата — сохранено значение первого (${JSON.stringify(a)}).`);
    });
    Object.keys(d.rc).forEach(k=>{
      if(p.rc[k] === undefined) p.rc[k] = d.rc[k];
      else if(JSON.stringify(p.rc[k]) !== JSON.stringify(d.rc[k]))
        warnings.push(`${name}: метаданные Recompose «${k}» отличаются у дубликата — сохранено значение первого.`);
    });
    const byslot = new Map(pc.entities.map(e=>[e.slot, e]));
    dc.entities.forEach(e=>{
      const have = byslot.get(e.slot);
      if(!have){ pc.entities.push(e); byslot.set(e.slot, e); }
      else if(have.type !== e.type) warnings.push(`${name}: слот «${e.slot}» имеет разный тип у дубликата — сохранён первый.`);
    });
    pc.motion.entities = pc.entities.map(e=>({ type:e.type, slot:e.slot, role:e.role }));
    d.styles.forEach(k=>{ if(p.styles.indexOf(k) < 0) p.styles.push(k); });
    d.groups.forEach(g=>{ if(p.groups.indexOf(g) < 0) p.groups.push(g); });
    p.favorite = p.favorite || d.favorite;
    if(d.conv.single) pc.single = true;
  }

  function emitEntry(r){
    const c = r.conv;
    const J = v => JSON.stringify(v);
    const rcLines = Object.keys(r.rc).map(k=>`    ${k}:${J(r.rc[k])},\n`).join('');
    return `  {
    tpl:${J(c.tpl)},
    family:${J(c.family)},
    group:${J(c.group)},
    groups:${J(r.groups)},
    label:${J(c.label)},
    code:${J(c.code)},
    icon:${J(c.icon || '▧')},
    kind:${J(c.kind || 'static')},
    ${c.single ? 'single:true,' : ''}
    desc:${J(c.desc || '')},
    styleSystem:${J(r.styles[0])},
    styleSystems:${J(r.styles)},
    favorite:${r.favorite},
    aspect:${J(c.aspect)},
    canvas:${J(c.canvas)},
    entities:${J(c.entities)},
    motion:${J(c.motion)},
${rcLines}    build:i=>${J(c.html || '')}
  }`;
  }

  /* Единый экспорт librarymotion.js.
     Вход: массив шаблонов Sandbox (LIB). Выход: { text, count, input, merged, warnings }.
     Точные дубликаты (tpl + нормализованный HTML + aspect) дают один физический шаблон;
     их стили и группы объединяются. Исходные данные Sandbox не меняются. */
  function buildUnifiedLibraryJs(sources){
    const warnings = [];
    const map = new Map();          // ключ — tpl (уникальный ID шаблона)
    const order = [];
    let input = 0, merged = 0;

    (sources || []).forEach(src=>{
      const rec = buildRecord(src);
      if(!rec){
        warnings.push(`${(src && (src.tpl || src.label)) || '?'}: пустой HTML — пропущен.`);
        return;
      }
      input++;
      const name = rec.conv.tpl || rec.conv.label || '?';
      const prev = map.get(rec.conv.tpl);
      if(prev){
        // точный дубликат (тот же HTML и aspect): объединяем, но только при совпадении холста
        if(prev.key === rec.key){
          const pc = JSON.stringify(prev.conv.canvas), rc = JSON.stringify(rec.conv.canvas);
          if(pc !== rc){
            warnings.push(`${name}: дубликат с другим canvas (${pc} и ${rc}) НЕ объединён — второй экземпляр пропущен.`);
            return;
          }
          mergeRecord(prev, rec, warnings); merged++; return;
        }
        warnings.push(`${name}: несколько разных версий одного tpl (HTML или aspect различаются) — сохранена первая, остальные пропущены.`);
        return;
      }
      rec.warnings.forEach(w=>warnings.push(w));
      map.set(rec.conv.tpl, rec);
      order.push(rec);
    });

    const styleReg = {};
    if(typeof STYLES !== 'undefined'){
      Object.keys(STYLES).forEach(k=>{
        styleReg[k] = { name:STYLES[k].name || k, color:STYLES[k].color || '' };
      });
    }

    const body = order.map(emitEntry).join(',\n\n');

    const text = `/* ============================================================
   librarymotion.js — единый экспорт монтажной библиотеки (PMS).
   Сгенерировано Sandbox. Шаблонов: ${order.length}
   Несёт: структуру и HTML, Recompose-метаданные, motion/AE-контракт
   (motion-studio-template-v1), entities по слотам, принадлежность к стилям
   (styleSystem + styleSystems) и группам (group + groups).
   ============================================================ */
(function(){
  const STYLE_SYSTEMS=${JSON.stringify(styleReg, null, 2)};
  const LIBRARY=[

${body}

  ];

  if(window.SB_registerStyleSystems){
    window.SB_registerStyleSystems(STYLE_SYSTEMS);
  }else{
    window.SB_PENDING_STYLE_SYSTEMS=Object.assign(window.SB_PENDING_STYLE_SYSTEMS||{}, STYLE_SYSTEMS);
  }

  if(window.SB_registerTemplates){
    window.SB_registerTemplates(LIBRARY);
  }else{
    window.SB_PENDING_TEMPLATES=(window.SB_PENDING_TEMPLATES||[]).concat(LIBRARY);
  }
})();
`;
    return { text, count:order.length, input, merged, warnings };
  }

  window.SB_motionExporter = {
    getSelectedTemplates,
    collectEntities,
    normalizeMotionHtml,
    convertTemplate,
    membershipOf,
    buildUnifiedLibraryJs
  };
})();
