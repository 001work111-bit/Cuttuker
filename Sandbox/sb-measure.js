/* ============================================================
   sb-measure.js — измерение реального кадра (Real Size / Real Ratio)
   ------------------------------------------------------------
   Выделено из template-adapt.js (этап 4) при удалении старого конвертера.
   Логика измерения не изменена: контролируемый offscreen-рендер в
   reference viewport 1280 px, два замера с проверкой стабильности.
   Добавлено: реальная проверка границ корня (overflow) и внутренней обрезки
   (clipped: контейнер с overflow hidden/clip). Если проверка не выполнена —
   возвращается checked:false и null, а не 0.
   Экспорт: window.SB_measure = { measure, measureTemplate }.
   Старый конвертер (template-converter.js, template-adapt.js: adapt/evaluate)
   удалён; создание версий 16:9 выполняет recompose-core.js.
   ============================================================ */
(function(){
  'use strict';
  const MEASURE_W = 1280;
  const MEASURE = { vw: 1280, vh: 720, tol: 0.005, fontWaitMs: 3000, retries: 3, timeoutMs: 15000 };
  const RULES = {
    minTextScale: 0.6,    // текст уменьшен не больше чем в 1/0.6
    maxTextScale: 1.4,    // текст увеличен не больше чем в 1.4
    minTextPx: 12,        // минимальный кегль в пикселях целевого кадра
    maxMediaCrop: 0.25,   // доля фото, которую допустимо обрезать
    bleedRatio: 0.95,     // элемент, покрывающий ≥95% корня, считается фоном на весь кадр
    minFill: 0.5          // режим вписывания: композиция занимает ≥50% безопасной зоны
  };

  /* ---------- утилиты ---------- */
  function escAttr(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function r3(n){ return Math.round(n * 1000) / 1000; }
  function r6(n){ return Math.round(n * 1e6) / 1e6; }
  function hash(s){
    let h = 5381;
    for(let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, '0');
  }
  function cssCopy(){
    return [...document.querySelectorAll('style, link[rel="stylesheet"]')].map(n => n.outerHTML).join('\n');
  }

  /* ---------- 1. измерение ---------- */
  function measureOnce(html){
    return new Promise((resolve, reject) => {
      const W = MEASURE.vw, H = MEASURE.vh;
      const f = document.createElement('iframe');
      f.setAttribute('sandbox', 'allow-same-origin');   // без скриптов: как innerHTML в превью
      f.setAttribute('aria-hidden', 'true');
      f.style.cssText = `position:fixed;left:-30000px;top:0;width:${W}px;height:${H}px;border:0;visibility:hidden;pointer-events:none;`;
      const doc = '<!doctype html><html><head><meta charset="utf-8">'
        + `<base href="${escAttr(document.baseURI)}">` + cssCopy()
        + `<style>html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;}</style>`
        + `</head><body><div id="preview" class="sb-scope">${html}</div></body></html>`;
      let done = false;
      const finish = fn => { if(done) return; done = true; try{ f.remove(); }catch(e){} fn(); };
      const guard = setTimeout(() => finish(() => reject(new Error('measure timeout'))), MEASURE.timeoutMs);
      f.onload = async () => {
        try{
          const d = f.contentDocument, w = f.contentWindow;
          if(d.fonts && d.fonts.ready){
            await Promise.race([d.fonts.ready, new Promise(r => setTimeout(r, MEASURE.fontWaitMs))]);
          }
          const imgs = [...d.images];
          await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
          await new Promise(r => w.requestAnimationFrame(() => w.requestAnimationFrame(r)));
          const host = d.getElementById('preview');
          const kids = [...host.children];
          const root = kids.length === 1 ? kids[0] : host;
          const R = root.getBoundingClientRect();
          const items = [...root.querySelectorAll('[data-sb-editable],[data-sb-media]')].map(el => {
            const r = el.getBoundingClientRect();
            const isText = el.hasAttribute('data-sb-editable');
            return {
              k: isText ? 'text' : 'media',
              slot: el.getAttribute('data-slot') || '',
              role: el.getAttribute('data-role') || '',
              x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height,
              fs: isText ? (parseFloat(w.getComputedStyle(el).fontSize) || 0) : 0,
              hidden: r.width === 0 || r.height === 0
            };
          });
          // Границы: выход за корень (frame = root) и внутренняя обрезка (ближайший контейнер overflow hidden/clip)
          const TOL = 0.5, CLIP = /hidden|clip/, UNV = new Set(['IFRAME','VIDEO','CANVAS','OBJECT','EMBED','PICTURE']);
          const ov = { w: 0, h: 0, count: 0 }, cl = { w: 0, h: 0, count: 0 }, unv = [];
          let inspected = 0;
          for(const el of root.querySelectorAll('*')){
            if(el.closest('defs,clipPath,mask,pattern,symbol')) continue;
            const cs = w.getComputedStyle(el);
            if(cs.display === 'none' || cs.visibility === 'hidden') continue;
            const r = el.getBoundingClientRect();
            if(r.width <= 0 && r.height <= 0) continue;
            inspected++;
            const tag = el.tagName.toUpperCase();
            if(UNV.has(tag)) unv.push(tag.toLowerCase());
            const ex = Math.max(R.left - r.left, r.right - R.right, 0);
            const ey = Math.max(R.top - r.top, r.bottom - R.bottom, 0);
            if(ex > TOL || ey > TOL){ ov.count++; ov.w = Math.max(ov.w, ex); ov.h = Math.max(ov.h, ey); }
            let p = el.parentElement, clipper = null;
            while(p && p !== root && p !== host){
              const pc = w.getComputedStyle(p);
              if(CLIP.test(pc.overflowX + ' ' + pc.overflowY)){ clipper = p; break; }
              p = p.parentElement;
            }
            if(clipper){
              const C = clipper.getBoundingClientRect();
              const cx = Math.max(C.left - r.left, r.right - C.right, 0);
              const cy = Math.max(C.top - r.top, r.bottom - C.bottom, 0);
              if(cx > TOL || cy > TOL){ cl.count++; cl.w = Math.max(cl.w, cx); cl.h = Math.max(cl.h, cy); }
            }
          }
          const fontsOk = !d.fonts || d.fonts.status === 'loaded';
          const result = {
            w: R.width, h: R.height,
            aspectCss: w.getComputedStyle(root).aspectRatio,
            items,
            repeats: root.querySelectorAll('[data-sb-repeat]').length,
            fontsOk,
            checked: true, frame: 'root', inspected,
            overflowW: r3(ov.w), overflowH: r3(ov.h), overflowCount: ov.count,
            clippedW: r3(cl.w), clippedH: r3(cl.h), clippedCount: cl.count,
            unverifiable: [...new Set(unv)],
            imgTotal: imgs.length,
            imgBroken: imgs.filter(i => i.complete && i.naturalWidth === 0).length
          };
          clearTimeout(guard);
          finish(() => resolve(result));
        }catch(e){ clearTimeout(guard); finish(() => reject(e)); }
      };
      f.srcdoc = doc;
      document.body.appendChild(f);
    });
  }

  // Расхождение двух замеров в долях стороны корня (0 = полное совпадение)
  function drift(a, b){
    if(a.items.length !== b.items.length) return Infinity;
    const s = Math.max(a.w, a.h, 1);
    let d = Math.max(Math.abs(a.w - b.w), Math.abs(a.h - b.h)) / s;
    for(let i = 0; i < a.items.length; i++){
      const p = a.items[i], q = b.items[i];
      d = Math.max(d, Math.abs(p.x - q.x) / s, Math.abs(p.y - q.y) / s,
                      Math.abs(p.w - q.w) / s, Math.abs(p.h - q.h) / s);
    }
    return d;
  }

  // Два замера подряд; при расхождении повтор (шрифты/изображения ещё грузились)
  async function measure(html){
    let last = null, dr = Infinity;
    for(let attempt = 1; attempt <= MEASURE.retries; attempt++){
      const a = await measureOnce(html);
      const b = await measureOnce(html);
      dr = drift(a, b);
      last = b;
      if(dr <= MEASURE.tol){
        return Object.assign({}, b, { stable: true, drift: dr, attempts: attempt, htmlHash: hash(html) });
      }
    }
    return Object.assign({}, last, { stable: false, drift: dr, attempts: MEASURE.retries, htmlHash: hash(html) });
  }

  async function measureTemplate(t){
    const m = await measure(String((t && t.html) || ''));
    return {
      width: m.w, height: m.h, ratio: m.h ? m.w / m.h : 0,
      cssAspect: String(m.aspectCss || 'auto'),
      hasStrictRoot: !!(m.aspectCss && m.aspectCss !== 'auto'),
      // проверка границ: при checked:false значения null (не «0 = всё в порядке»)
      overflowChecked: m.checked === true,
      overflowW: m.checked ? m.overflowW : null, overflowH: m.checked ? m.overflowH : null,
      overflowCount: m.checked ? m.overflowCount : null,
      clippedCount: m.checked ? m.clippedCount : null,
      clippedW: m.checked ? m.clippedW : null, clippedH: m.checked ? m.clippedH : null,
      unverifiable: m.checked ? m.unverifiable : null,
      inspectedElements: m.checked ? m.inspected : null,
      overflowFrame: m.checked ? m.frame : null,
      referenceWidth: MEASURE_W,
      stable: m.stable, drift: m.drift
    };
  }

  window.SB_measure = { measure, measureTemplate, MEASURE };
})();
