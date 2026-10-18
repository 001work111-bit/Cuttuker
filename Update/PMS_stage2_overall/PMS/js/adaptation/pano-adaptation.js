"use strict";

/* ============================================================
   pano-adaptation.js — общий слой адаптации шаблонов для Pano Montage Studio.
   ------------------------------------------------------------
   Здесь нет алгоритмов: методы живут в adaptation-modules/ и движке
   (recompose-core.js), общие с Sandbox. Этот файл даёт:
     • пересчёт от исходника (без накопления: вход всегда исходный HTML);
     • кэш результатов на сессию и очередь расчётов;
     • связанные селекторы «Формат» и «Метод» (метод — только совместимый);
     • Ctrl + колесо: ровно один шаг на щелчок (см. makeWheelStepper);
     • метаданные адаптации для шаблона/блока;
     • временный предпросмотр блока (не записывается в сохранённый HTML).
   Публичный API: window.PMS_ADAPT
   ============================================================ */
(function () {
  var APP = "Pano Montage Studio";
  var CACHE_LIMIT = 80;
  var cache = Object.create(null), cacheKeys = [];
  var queue = Promise.resolve();
  var preview = null;            // {blockId, html, frameW, frameH, format, method, methodName}

  function core() { return window.RecomposeCore || null; }
  function adapt() { return core() ? core().adaptation : null; }
  function ready() { return !!(adapt() && window.PMS_ADAPTATION_LOADER && window.PMS_ADAPTATION_LOADER.isReady()); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  // короткий детерминированный хеш строки (для сравнения и ключей кэша)
  function hash(str) {
    var h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
    str = String(str || "");
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
  }

  // технические атрибуты узлов Pano не входят в сравнение
  function stripNodeAttrs(html) {
    return String(html || "").replace(/\sdata-ms-node-id="[^"]*"/g, "").replace(/\sdata-ms-selected(="[^"]*")?/g, "");
  }
  // текстовая подпись: меняется только при правке текста (атрибуты и стили не учитываются)
  function textSignature(html) {
    return String(html || "").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  }
  function textHash(html) { return hash(textSignature(html)); }

  function slotNames(html) {
    var out = [];
    var tags = String(html || "").match(/<[^>]*data-sb-media[^>]*>/g) || [];
    tags.forEach(function (t) {
      var m = t.match(/data-slot="([^"]+)"/);
      if (m && out.indexOf(m[1]) < 0) out.push(m[1]);
    });
    return out;
  }

  // результат годен, если движок не сломался и все слоты медиа исходника сохранились
  function usable(res) {
    if (!res || res.status === "failed" || !res.html) return false;
    var have = res.slotsResult || [];
    return (res.slotsSource || []).every(function (n) { return have.indexOf(n) >= 0; });
  }

  function remember(key, value) {
    if (!(key in cache)) cacheKeys.push(key);
    cache[key] = value;
    while (cacheKeys.length > CACHE_LIMIT) delete cache[cacheKeys.shift()];
  }

  function summarize(r, src, method, format) {
    var frame = (r.frame && r.frame.working) || {};
    var contract = (r.frame && r.frame.contractCanvas) || null;
    return {
      status: r.status,                       // ok | warning | failed
      method: method,
      methodName: r.methodName || method,
      format: format,
      algo: r.algo,
      html: r.status === "failed" ? "" : String(r.html || ""),
      // frameW/H — рабочая система координат HTML результата (1600×900 / 900×1600), та же, что у Sandbox.
      // Контрактный холст (1920×1080 / 1080×1920) — только метаданные: res.contract → canvas шаблона.
      frameW: frame.w || 0, frameH: frame.h || 0,
      workW: frame.w || 0, workH: frame.h || 0,
      contract: contract,
      warnings: r.warnings || [], reasons: r.reasons || [], notes: r.notes || [],
      fitFactor: r.fit ? r.fit.factor : 1,
      minFont: r.minFont,
      structurePreserved: !!(r.structure && r.structure.preserved),
      slotsSource: slotNames(src.html), slotsResult: slotNames(r.html),
      sourceHash: hash(src.html),
      resultTextHash: textHash(r.html),
      error: r.error || ""
    };
  }

  // Пересчёт от исходного HTML. Вход всегда исходный: вторая адаптация не строится на результате первой.
  // isStale() — отмена (выбор изменился, панель закрыта).
  function convert(src, method, format, isStale) {
    var key = hash(src.html) + "|" + method + "|" + format;
    if (cache[key]) return Promise.resolve(cache[key]);
    var job = queue.then(function () {
      if (isStale && isStale()) return null;
      if (cache[key]) return cache[key];
      return core().convert({ tpl: src.tpl, label: src.label, html: src.html }, method, { format: format })
        .then(function (r) { var s = summarize(r, src, method, format); remember(key, s); return s; });
    });
    queue = job.catch(function () { return null; });
    return job.catch(function (e) {
      console.error("Адаптация: " + (e && e.message || e));
      return { status: "failed", method: method, format: format, html: "", reasons: [String(e && e.message || e)], warnings: [], notes: [], error: String(e && e.message || e) };
    });
  }

  // Реестр форматов — единый (formats-registry.js ← Sandbox SB_FORMATS). 4:5 и 5:6 в нём включены, как в Sandbox.
  // validated из listFormats() не используется как доказательство проверки метода.
  function formats() {
    if (!core()) return [];
    return core().listFormats().filter(function (f) { return f.id; })
      .map(function (f) { return { id: f.id, label: f.label || f.id, validated: !!f.validated, w: f.w, h: f.h, adapt: true }; });
  }

  // Размеры дизайна шаблона = система координат его HTML.
  // Приоритет: записанные designW/designH → рабочие размеры формата из реестра → canvas (только пропорция)
  // → aspect (только пропорция). Без данных — явный fallback 16:9, а не неявный дефолт.
  function designSize(t) {
    if (t && +t.designW > 0 && +t.designH > 0) return { w: +t.designW, h: +t.designH, source: "designW" };
    if (t && t.format) {
      var f = formats().filter(function (x) { return x.id === t.format; })[0];
      if (f && f.w > 0 && f.h > 0) return { w: f.w, h: f.h, source: "format" };
    }
    var r = 0, src = "";
    var c = t && t.canvas;
    if (c && (c.w || c.width) > 0 && (c.h || c.height) > 0) { r = (c.w || c.width) / (c.h || c.height); src = "canvas"; }
    if (!r && t && t.aspect) {
      var m = /^\s*(\d+(?:\.\d+)?)\s*[:\/x×]\s*(\d+(?:\.\d+)?)\s*$/.exec(String(t.aspect));
      if (m && +m[1] > 0 && +m[2] > 0) { r = +m[1] / +m[2]; src = "aspect"; }
    }
    if (!r) return { w: 1920, h: 1080, source: "fallback-16:9" };
    return { w: 1920, h: Math.round(1920 / r), source: src };
  }

  // Масштаб сцены результата: ширина рамки / рабочая ширина кадра (900 или 1600).
  // Без calc() в transform: старые Chromium/Electron его не понимают, см. ADAPTATION_FORMAT_LESSONS.md.
  function fitRcStage(frame) {
    var st = frame && frame.querySelector(":scope > .rc-stage");
    if (!st) return;
    var base = parseFloat(st.style.width);
    if (!base || !frame.clientWidth) return;
    st.style.transform = "scale(" + (frame.clientWidth / base) + ")";
  }
  var rcRO = ("ResizeObserver" in window) ? new ResizeObserver(function (en) {
    en.forEach(function (e) { fitRcStage(e.target); });
  }) : null;
  function fitRcStages(root) {
    if (!root || root.nodeType !== 1) return;
    var list = root.matches && root.matches(".rc-frame") ? [root] : [];
    list = list.concat([].slice.call(root.querySelectorAll(".rc-frame")));
    list.forEach(function (f) {
      if (rcRO && !f.__rcObs) { f.__rcObs = true; rcRO.observe(f); }
      fitRcStage(f);
    });
  }
  // Любой новый .rc-frame в документе (предпросмотр, монитор, галерея шаблонов) получает масштаб
  function startRcObserver() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", startRcObserver); return; }
    new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        [].forEach.call(r.addedNodes, function (n) { fitRcStages(n); });
      });
    }).observe(document.body, { childList: true, subtree: true });
    fitRcStages(document.body);
  }
  startRcObserver();

  // Короткие подписи капсул методов — дословно из Sandbox recompose-sandbox.js (RC_SHORT_CODES).
  // Внутренние ID методов не меняются; код — только отображаемая подпись. Полное имя — в подсказке.
  const RC_SHORT_CODES={
    'claud1-balanced':'CL-001','claud1-editorial':'CL-002','claud1-typographic':'CL-003',
    'gemini-balanced':'GM-001','gemini-editorial':'GM-002','gemini-hero-media':'GM-003','gemini-media-grid':'GM-004','gemini-typographic':'GM-005',
    'grok-balanced':'GR-001','grok-editorial':'GR-002','grok-hero':'GR-003',
    'iface-smart':'IF-001','iface-split':'IF-002',
    'v3011-hero':'V3-001','v3011-type':'V3-002',
    'compact':'CP-001','fit':'FT-001','smart':'SM-001','split':'SP-001'
  };
  function shortCode(id) {
    if (RC_SHORT_CODES[id]) return RC_SHORT_CODES[id];
    var pre = String(id || "").replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase();
    return (pre || "XX") + "-?";
  }

  // Кэш статусов капсул — на уровне модуля (общий для инспекторов). Ключ включает шаблон, HTML источника,
  // формат источника, целевой формат, метод, приложение и сценарий: при изменении любого из них статус пересчитывается.
  var statusCache = {};
  function statusKey(src, m, format, scenario, sourceFormat) {
    return [src ? (src.tpl || "") : "", sourceFormat, m, format, APP, scenario, src ? hash(String(src.html || "")) : ""].join("|");
  }
  // Подготовка статусов заранее (при выборе шаблона): методы считаются по очереди и попадают в кэш,
  // поэтому инспектор открывается уже с готовыми цветами. Уже рассчитанные комбинации не пересчитываются.
  var prefetchQueue = Promise.resolve();
  function prefetchStatuses(src, format, scenario, sourceFormat) {
    if (!src || !src.html || !ready()) return;
    methods(format, scenario, sourceFormat).forEach(function (m) {
      var key = statusKey(src, m.id, format, scenario, sourceFormat);
      if (statusCache[key]) return;
      prefetchQueue = prefetchQueue.then(function () {
        if (statusCache[key]) return null;
        return convert(src, m.id, format, function () { return false; }).then(function (res) {
          if (!res || statusCache[key]) return;
          if (res.status === "failed") statusCache[key] = { status: "failed", reason: (res.reasons && res.reasons[0]) || res.error || "" };
          else if (!usable(res)) statusCache[key] = { status: "failed", reason: (res.reasons && res.reasons[0]) || "слоты медиа исходника потеряны" };
          else statusCache[key] = gradeUnknown({ status: res.status === "warning" ? "warning" : "ok", reason: (res.warnings && res.warnings[0]) || "" }, src);
        });
      }).catch(function () {});
    });
  }

  // методы для формата, совместимые с исходным форматом и сценарием
  // Неизвестный источник (sourceFormat пустой): без подстановки 16:9 берём объединение методов,
  // которые движок допускает хотя бы для одного известного формата источника. Совместимость с
  // конкретным источником всё равно подтверждается фактическим расчётом (см. gradeUnknown).
  function methods(format, scenario, sourceFormat) {
    if (!ready()) return [];
    var list;
    if (sourceFormat) {
      list = adapt().list(format, APP, sourceFormat, scenario);
    } else {
      var seen = {};
      list = [];
      formats().forEach(function (f) {
        adapt().list(format, APP, f.id, scenario).forEach(function (m) {
          if (!seen[m.id]) { seen[m.id] = true; list.push(m); }
        });
      });
    }
    return list.map(function (m) {
      return { id: m.id, name: m.name, description: m.description || "", version: m.version };
    });
  }

  function formatLabel(id) {
    var f = formats().filter(function (x) { return x.id === id; })[0];
    return f ? f.label : id;
  }

  // ---- колесо: ровно один шаг на щелчок -------------------------------------------
  // Обычная мышь: один щелчок = deltaY около ±100 (или 3 строки). Тачпад шлёт много мелких событий.
  // Накапливаем deltaY, шаг делается при пересечении порога; после шага — пауза,
  // чтобы инерция тачпада не перескакивала на несколько пунктов.
  var WHEEL_THRESHOLD = 60, WHEEL_LOCK_MS = 160, WHEEL_IDLE_MS = 260;
  function makeWheelStepper(onStep) {
    var acc = 0, lastDir = 0, lockUntil = 0, lastEvent = 0;
    return function (e) {
      if (!e.ctrlKey) return;               // без Ctrl поведение страницы не меняется
      e.preventDefault();                   // запрет масштабирования страницы и прокрутки
      e.stopPropagation();
      var now = Date.now();
      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;      // строки
      else if (e.deltaMode === 2) dy *= 400; // страницы
      if (!dy) return;
      var dir = dy > 0 ? 1 : -1;
      if (now - lastEvent > WHEEL_IDLE_MS || dir !== lastDir) acc = 0;   // новый жест или смена направления
      lastEvent = now; lastDir = dir;
      if (now < lockUntil) return;          // пауза после шага
      acc += dy;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      acc = 0;
      lockUntil = now + WHEEL_LOCK_MS;
      onStep(dir);
    };
  }

  // Выбор соседнего пункта без цикла. Возвращает true, если значение изменилось.
  function stepSelect(sel, dir, skipEmpty) {
    var list = Array.prototype.slice.call(sel.options)
      .filter(function (o) { return !o.disabled && (!skipEmpty || o.value !== ""); })
      .map(function (o) { return o.value; });
    if (!list.length) return false;
    var idx = list.indexOf(sel.value);
    var next = Math.max(0, Math.min(list.length - 1, (idx < 0 ? (dir > 0 ? -1 : 0) : idx) + dir));
    if (list[next] === sel.value) return false;
    sel.value = list[next];
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // stepSelect сам шлёт change, поэтому здесь дополнительных событий нет
  function bindWheel(sel, skipEmpty) {
    if (!sel) return;
    sel.addEventListener("wheel", makeWheelStepper(function (dir) {
      if (!sel.disabled) stepSelect(sel, dir, skipEmpty);
    }), { passive: false });
  }

  // ---- HTML-разметка блока инспектора ---------------------------------------------
  // prefix — уникальный префикс id; для блока предпросмотр в инспекторе не показываем (он в мониторе).
  function controlsHtml(prefix, opts) {
    opts = opts || {};
    var preview = opts.preview ? '<div class="adaptPreview" data-adapt="preview"></div>' : "";
    // Метод выбирается капсулами (data-adapt="capsules"); select оставлен скрытым и остаётся источником значения.
    return '' +
      '<div class="field"><span>Формат</span><div class="adaptCaps" data-adapt="fmtcaps"></div>' +
      '<select id="' + prefix + 'Fmt" data-adapt="format" style="display:none"></select></div>' +
      '<div class="field"><span>Метод</span><div class="adaptCaps" data-adapt="capsules"></div>' +
        '<select id="' + prefix + 'Mth" data-adapt="method" style="display:none"></select></div>' +
      preview +
      '<div class="inspMeta" data-adapt="status"></div>';
  }

  // Подключает селекторы к блоку. cfg:
  //   scenario: "library" | "timeline"
  //   getSource(): {tpl,label,html,format} — исходная версия (не адаптированная)
  //   sourceFormat(): формат исходника
  //   format, method: начальные значения
  //   onResult(res|null, ctl): вызывается после расчёта; res = null — без адаптации
  //   previewTarget: элемент под предпросмотр в инспекторе (опционально)
  function mount(box, cfg) {
    var fmtSel = box.querySelector('[data-adapt="format"]');
    var mthSel = box.querySelector('[data-adapt="method"]');
    var statusEl = box.querySelector('[data-adapt="status"]');
    var prevEl = box.querySelector('[data-adapt="preview"]');
    var capsBox = box.querySelector('[data-adapt="capsules"]');
    var fmtCapsBox = box.querySelector('[data-adapt="fmtcaps"]');
    // кэш статусов рассчитанных комбинаций: ключ = формат × метод × источник × сценарий × хэш исходника
    var ctl = { format: cfg.format || "16:9", method: cfg.method || "", result: null, token: 0, box: box, pending: false, cache: {} };

    function capKey(m) {
      var src = cfg.getSource();
      return [src ? (src.tpl || "") : "", cfg.sourceFormat(), m, ctl.format, APP, cfg.scenario, src ? hash(String(src.html || "")) : ""].join("|");
    }

    // Капсулы: заливка = выбранный метод (синий), точка = статус рассчитанной комбинации;
    // не рассчитано — серая точка; ok — зелёная; warning — янтарная; failed — красная.
    // Статусы капсул (точки): не рассчитано — серая; ok — зелёная; warning — янтарная; failed — красная.
    // Голубая заливка — только выбранный метод, она не заменяет статус. Выбор не меняет библиотеку.
    function methodStatus(id) {
      if (!id) return { status: "ok", reason: "" };
      var st = statusCache[capKey(id)];
      if (st) return st;
      return null;
    }
    function renderCaps() {
      if (fmtCapsBox) {
        fmtCapsBox.innerHTML = formats().map(function (f) {
          var on = ctl.format === f.id;
          return '<button type="button" class="adaptCap' + (on ? " sel" : "") + '" data-fmt="' + esc(f.id) + '"' +
            (f.adapt === false ? " disabled" : "") + ' title="' + esc(f.label + (f.adapt === false ? " — не поддерживается" : "")) + '">' +
            esc(f.label) + "</button>";
        }).join("");
        fmtCapsBox.querySelectorAll(".adaptCap").forEach(function (btn) {
          btn.onclick = function () { if (!btn.disabled && ctl.setFormat) ctl.setFormat(btn.dataset.fmt); };
        });
      }
      if (!capsBox) return;
      var list = methods(ctl.format, cfg.scenario, cfg.sourceFormat());
      var ids = list.map(function (m) { return m.id; });
      var items = [{ id: "", name: "Без адаптации (исходник)", description: "Исходный HTML без пересчёта" }].concat(list);
      // выбранный метод, которого нет для текущего формата, показываем явно как несовместимый
      if (ctl.method && ids.indexOf(ctl.method) < 0) {
        items.push({ id: ctl.method, name: ctl.method, description: "Не совместим с форматом " + formatLabel(ctl.format), incompatible: true });
      }
      // пока не все статусы готовы — показываем «Расчёт статусов…», а не серые точки, которые потом меняются
      var missing = list.filter(function (m) { return !statusCache[capKey(m.id)]; });
      var pending = !!(missing.length && cfg.getSource && cfg.getSource());
      // подписи методов видны сразу; точки статуса появляются все вместе, когда расчёт готов
      capsBox.innerHTML = (pending ? '<span class="inspMeta">Расчёт статусов…</span>' : "") + items.map(function (m) {
        var sel = ctl.method === m.id;
        var st = m.incompatible ? { status: "failed", reason: "не совместим с выбранным форматом" } : methodStatus(m.id);
        var stKey = st ? st.status : "none";
        var stLabel = { ok: "ок", warning: "предупреждение", failed: "не применяется", none: "не рассчитано" }[stKey];
        var label = m.id ? shortCode(m.id) : "Исходник";
        var tip = (m.name || "") + (m.id ? " · ID " + m.id : "") + (m.description ? "\n" + m.description : "") +
          "\n" + stLabel + (st && st.reason ? ": " + st.reason : "");
        return '<button type="button" class="adaptCap' + (sel ? " sel" : "") + '" data-cap="' + esc(m.id) + '" title="' + esc(tip) + '">' +
          (pending ? "" : '<i class="adaptCapDot st-' + stKey + '"></i>') + esc(label) + "</button>";
      }).join("");
      capsBox.querySelectorAll(".adaptCap").forEach(function (btn) {
        btn.onclick = function () { ctl.setMethod(btn.dataset.cap || ""); };
      });
    }
    ctl.renderCaps = renderCaps;

    function fillFormats() {
      var list = formats();
      fmtSel.innerHTML = list.map(function (f) {
        return '<option value="' + esc(f.id) + '"' + (f.adapt === false ? ' disabled' : '') + '>' + esc(f.label) +
          (f.adapt === false ? ' — не поддерживается' : '') + '</option>';
      }).join("");
      var ok = list.filter(function (f) { return f.adapt !== false; });
      if (ok.some(function (f) { return f.id === ctl.format; })) fmtSel.value = ctl.format;
      else if (ok.length) fmtSel.value = ok[0].id;
      ctl.format = fmtSel.value || ctl.format;
    }

    function fillMethods() {
      var list = methods(ctl.format, cfg.scenario, cfg.sourceFormat());
      var ids = list.map(function (m) { return m.id; });
      // выбранный метод не подменяется при смене формата: несовместимость показывается явно (см. update)
      mthSel.innerHTML = '<option value="">Без адаптации</option>' + list.map(function (m) {
        return '<option value="' + esc(m.id) + '" title="' + esc(m.description) + '">' + esc(m.name) + '</option>';
      }).join("");
      mthSel.value = ctl.method;
      mthSel.disabled = !list.length;
      mthSel.title = list.length ? "" : "Для формата нет методов";
      renderCaps();
    }

    function setStatus(text, kind) {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = "inspMeta" + (kind ? " adapt-" + kind : "");
    }

    // предпросмотр: результат адаптации (кадр формата) или исходный шаблон (без адаптации)
    function renderPreview(res, src) {
      if (!prevEl) return;
      prevEl.style.display = "";
      var availW = Math.max(120, prevEl.clientWidth || 240), maxH = 240;
      if (res && res.html && res.frameW > 0 && res.frameH > 0) {
        var rw = res.frameW, rh = res.frameH;
        var w = Math.min(availW, maxH * rw / rh), h = w * rh / rw;
        prevEl.innerHTML = '<div class="adaptPreviewFrame" style="width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px">' + res.html + '</div>';
        fitRcStages(prevEl);
        return;
      }
      if (!src || !src.html) { prevEl.innerHTML = ""; prevEl.style.display = "none"; return; }
      var d = cfg.designSize ? cfg.designSize() : designSize(null);
      var ow = Math.min(availW, maxH * d.w / d.h), oh = ow * d.h / d.w, k = ow / d.w;
      prevEl.innerHTML = '<div class="adaptPreviewFrame" style="width:' + Math.round(ow) + 'px;height:' + Math.round(oh) + 'px">' +
        '<div style="position:absolute;left:0;top:0;width:' + d.w + 'px;height:' + d.h + 'px;transform-origin:0 0;transform:scale(' + k + ')">' + src.html + '</div></div>';
    }

    function statusText(res) {
      if (!ctl.method) return "Исходный вариант";
      var name = res ? res.methodName : (methods(ctl.format, cfg.scenario, cfg.sourceFormat()).filter(function (m) { return m.id === ctl.method; })[0] || {}).name || ctl.method;
      return name + " · " + formatLabel(ctl.format);
    }

    function update() {
      var token = ++ctl.token;
      var src = cfg.getSource();
      renderCaps();
      probeAll();
      if (!src) { setStatus("Нет исходного HTML", "warn"); return; }
      // выбранный метод несовместим с текущим форматом/сценарием: результат не применяется, выбор сохраняется
      if (ctl.method && ready()) {
        var okIds = methods(ctl.format, cfg.scenario, cfg.sourceFormat()).map(function (m) { return m.id; });
        if (okIds.indexOf(ctl.method) < 0) {
          ctl.result = null; ctl.pending = false;
          renderPreview(null, src);
          setStatus("Метод «" + ctl.method + "» не совместим с форматом " + formatLabel(ctl.format) + ". Выберите другой метод или «Без адаптации».", "warn");
          cfg.onResult && cfg.onResult(null, ctl);
          return;
        }
      }
      if (!ctl.method) {
        ctl.result = null; ctl.pending = false;
        renderPreview(null, src);
        setStatus("Исходный вариант", null);
        cfg.onResult && cfg.onResult(null, ctl);
        return;
      }
      if (!ready()) { setStatus("Модули адаптации не загружены", "warn"); cfg.onResult && cfg.onResult(null, ctl); return; }
      ctl.pending = true;
      setStatus("Расчёт…", null);
      cfg.onPending && cfg.onPending(ctl);
      convert(src, ctl.method, ctl.format, function () { return token !== ctl.token || !box.isConnected; }).then(function (res) {
        if (!res || token !== ctl.token) return;   // устаревший результат
        ctl.pending = false;
        ctl.result = res;
        if (res.status === "failed") {
          statusCache[capKey(ctl.method)] = { status: "failed", reason: (res.reasons && res.reasons[0]) || res.error || "" };
          renderCaps();
          renderPreview(null, src);
          setStatus("Не применимо: " + ((res.reasons && res.reasons[0]) || res.error || "ошибка движка"), "warn");
          cfg.onResult && cfg.onResult(null, ctl);
          return;
        }
        if (!usable(res)) {
          statusCache[capKey(ctl.method)] = { status: "failed", reason: (res.reasons && res.reasons[0]) || "слоты медиа исходника потеряны" };
          renderCaps();
          renderPreview(null, src);
          setStatus("Не применимо: " + ((res.reasons && res.reasons[0]) || "слоты медиа исходника потеряны"), "warn");
          cfg.onResult && cfg.onResult(null, ctl);
          return;
        }
        statusCache[capKey(ctl.method)] = gradeUnknown({ status: res.status === "warning" ? "warning" : "ok", reason: (res.warnings && res.warnings[0]) || "" }, src);
        renderCaps();
        renderPreview(res, src);
        var unk = !!(src && src.formatUnknown);
        var note = unk ? "Формат исходника не определён: проверьте результат"
          : res.status === "warning" ? "Проверить: " + (res.warnings[0] || res.reasons[0] || "") : "Готово";
        setStatus(statusText(res) + " — " + note, (unk || res.status === "warning") ? "warn" : "ok");
        cfg.onResult && cfg.onResult(res, ctl);
      });
    }

    // Фоновый расчёт статусов всех доступных методов (как rcProbe в Sandbox): точки видны сразу,
    // без нажатия на капсулу. Выбор метода не меняет библиотеку; результаты — только в кэше инспектора.
    ctl.probing = {};
    ctl.probeQueue = Promise.resolve();
    function probeAll() {
      var src = cfg.getSource();
      if (!src || !ready() || !box.isConnected) return;
      var list = methods(ctl.format, cfg.scenario, cfg.sourceFormat());
      list.forEach(function (m) {
        var key = capKey(m.id);
        if (statusCache[key] || ctl.probing[key]) return;
        ctl.probing[key] = true;
        ctl.probeQueue = ctl.probeQueue.then(function () {
          if (!box.isConnected) { delete ctl.probing[key]; return null; }
          return convert(src, m.id, ctl.format, function () { return !box.isConnected; });
        }).then(function (res) {
          delete ctl.probing[key];
          if (!res || !box.isConnected) return;
          var st;
          if (res.status === "failed") st = { status: "failed", reason: (res.reasons && res.reasons[0]) || res.error || "" };
          else if (!usable(res)) st = { status: "failed", reason: (res.reasons && res.reasons[0]) || "слоты медиа исходника потеряны" };
          else st = { status: res.status === "warning" ? "warning" : "ok", reason: (res.warnings && res.warnings[0]) || "" };
          statusCache[key] = gradeUnknown(st, src);
          renderCaps();
        }).catch(function () { delete ctl.probing[key]; });
      });
    }
    ctl.probeAll = probeAll;

    ctl.setFormat = function (f) { ctl.format = f; fmtSel.value = f; fillMethods(); update(); };
    ctl.setMethod = function (m) { ctl.method = m; mthSel.value = m; update(); };
    ctl.refresh = function () { fillFormats(); fillMethods(); update(); };

    fmtSel.addEventListener("change", function () {
      ctl.format = fmtSel.value;
      fillMethods();
      update();
    });
    mthSel.addEventListener("change", function () {
      ctl.method = mthSel.value;
      update();
    });
    bindWheel(fmtSel, false);
    bindWheel(mthSel, true);

    fillFormats();
    fillMethods();
    update();
    // модули загружаются асинхронно: если инспектор открыт раньше, пересобираем список после готовности
    var loader = window.PMS_ADAPTATION_LOADER;
    if (loader && !loader.isReady()) loader.onReady(function () { if (box.isConnected) ctl.refresh(); });
    return ctl;
  }

  // ---- метаданные адаптации (храним в шаблоне и блоке) ------------------------------
  // sourceHtml — исходник без адаптации; вторая адаптация всегда строится от него
  function metaFor(res, src) {
    return {
      method: res.method, methodName: res.methodName, algo: res.algo,
      format: res.format, sourceFormat: src.format || "",
      sourceTpl: src.tpl || "", sourceLabel: src.label || "",
      sourceHtml: String(src.html || ""), sourceHash: res.sourceHash,
      resultTextHash: res.resultTextHash, status: res.status,
      frame: { w: res.frameW, h: res.frameH },
      adaptedAt: new Date().toISOString()
    };
  }

  // Нормализует HTML для записи в блок: без служебных id узлов (их выдаст Pano заново)
  function cleanHtml(html) { return stripNodeAttrs(html); }

  // Формат исходника. Порядок: явные метаданные → надёжные размеры холста или пропорция корневого HTML
  // → «неизвестен» (format: "", formatUnknown: true). Значение по умолчанию не подставляется.
  function knownFormat(id) {
    return formats().some(function (f) { return f.id === id; }) ? id : "";
  }
  // Формат по пропорции w:h — только если она совпадает с форматом реестра (допуск 2%)
  function formatByRatio(w, h) {
    w = +w; h = +h;
    if (!(w > 0 && h > 0)) return "";
    var best = "", bestD = Infinity;
    formats().forEach(function (f) {
      if (!(f.w > 0 && f.h > 0)) return;
      var r = f.w / f.h, d = Math.abs(w / h - r) / r;
      if (d < bestD) { bestD = d; best = f.id; }
    });
    return bestD <= 0.02 ? best : "";
  }
  function origin(html, meta, fallbackFormat) {
    var a = meta && meta.adaptation;
    var htmlSrc = a && a.sourceHtml ? a.sourceHtml : html;
    var tplInfo = a && a.sourceHtml ? { tpl: a.sourceTpl, label: a.sourceLabel } : {};
    // 1. явные метаданные
    var fmt = a && a.sourceHtml ? knownFormat(a.sourceFormat) : knownFormat(fallbackFormat);
    if (!fmt && meta) fmt = knownFormat(meta.aspect);
    // 2. надёжные размеры холста (явные поля шаблона) или пропорция корневого элемента HTML
    if (!fmt && meta) {
      var c = meta.canvas || {};
      fmt = formatByRatio(meta.designW || c.w || c.width, meta.designH || c.h || c.height);
    }
    if (!fmt) {
      var root = /^\s*<[^>]*\bstyle="[^"]*aspect-ratio:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/i.exec(String(htmlSrc || ""));
      if (root) fmt = formatByRatio(root[1], root[2]);
    }
    // 3. неизвестен — не угадываем
    return { html: htmlSrc, format: fmt, formatUnknown: !fmt, tpl: tplInfo.tpl, label: tplInfo.label };
  }
  // Статус не из реестра: при неизвестном формате исходника зелёный не выставляется
  function gradeUnknown(st, src) {
    if (src && src.formatUnknown && st && st.status === "ok") {
      return { status: "warning", reason: "формат исходника не определён: проверьте результат" };
    }
    return st;
  }

  // ---- предпросмотр блока (только состояние, не сохраняется) ----------------------
  function setPreview(p) { preview = p || null; }
  function clearPreview() { preview = null; }
  // Предпросмотр живёт, пока открыт инспектор блока и это тот же блок (смена выбора или закрытие его сбрасывает)
  function previewFor(blockId) {
    if (!preview || preview.blockId !== blockId) return null;
    if (typeof state === "undefined" || !state.inspOpen || state.inspTab !== "block") return null;
    var eb = typeof editingBlock === "function" ? editingBlock() : null;
    return eb && eb.block && eb.block.id === blockId ? preview : null;
  }
  function previewHtml(blockId) { var p = previewFor(blockId); return p ? p.html : null; }

  window.PMS_ADAPT = {
    prefetch: prefetchStatuses,
    ready: ready,
    formats: formats, formatLabel: formatLabel, methods: methods,
    convert: convert, mount: mount, controlsHtml: controlsHtml,
    usable: usable, metaFor: metaFor, origin: origin, cleanHtml: cleanHtml,
    slotNames: slotNames, textHash: textHash, hash: hash, stripNodeAttrs: stripNodeAttrs,
    stepSelect: stepSelect, makeWheelStepper: makeWheelStepper,
    setPreview: setPreview, clearPreview: clearPreview, previewFor: previewFor, previewHtml: previewHtml,
    designSize: designSize, fitRcStages: fitRcStages,
    errors: function () { return adapt() ? adapt().errors() : []; },
    modules: function () { return adapt() ? adapt().ids() : []; }
  };
})();
