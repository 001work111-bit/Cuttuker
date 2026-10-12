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
      // размеры дизайна Pano = эталонный холст (как у системных 16:9 — 1920×1080); кадр движка тех же пропорций
      frameW: contract ? contract.width : (frame.w || 0), frameH: contract ? contract.height : (frame.h || 0),
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

  function formats() {
    if (!core()) return [];
    return core().listFormats().filter(function (f) { return f.id; })
      .map(function (f) { return { id: f.id, label: f.label || f.id, validated: !!f.validated }; });
  }

  // методы для формата, совместимые с исходным форматом и сценарием
  function methods(format, scenario, sourceFormat) {
    if (!ready()) return [];
    return adapt().list(format, APP, sourceFormat || "16:9", scenario).map(function (m) {
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
    return '' +
      '<div class="grid2">' +
        '<div class="field"><span>Формат</span><select id="' + prefix + 'Fmt" data-adapt="format"></select></div>' +
        '<div class="field"><span>Метод</span><select id="' + prefix + 'Mth" data-adapt="method"></select></div>' +
      '</div>' +
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
    var ctl = { format: cfg.format || "16:9", method: cfg.method || "", result: null, token: 0, box: box, pending: false };

    function fillFormats() {
      var list = formats();
      fmtSel.innerHTML = list.map(function (f) {
        return '<option value="' + esc(f.id) + '">' + esc(f.label) + '</option>';
      }).join("");
      if (list.some(function (f) { return f.id === ctl.format; })) fmtSel.value = ctl.format;
      else if (list.length) fmtSel.value = list[0].id;
      ctl.format = fmtSel.value || ctl.format;
    }

    function fillMethods() {
      var list = methods(ctl.format, cfg.scenario, cfg.sourceFormat());
      var ids = list.map(function (m) { return m.id; });
      if (ctl.method && ids.indexOf(ctl.method) < 0) ctl.method = ids[0] || "";  // недоступен — первый совместимый
      mthSel.innerHTML = '<option value="">Без адаптации</option>' + list.map(function (m) {
        return '<option value="' + esc(m.id) + '" title="' + esc(m.description) + '">' + esc(m.name) + '</option>';
      }).join("");
      mthSel.value = ctl.method;
      mthSel.disabled = !list.length;
      mthSel.title = list.length ? "" : "Для формата нет методов";
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
      if (res && res.html) {
        var rw = res.frameW || 1600, rh = res.frameH || 900;
        var w = Math.min(availW, maxH * rw / rh), h = w * rh / rw;
        prevEl.innerHTML = '<div class="adaptPreviewFrame" style="width:' + Math.round(w) + 'px;height:' + Math.round(h) + 'px">' + res.html + '</div>';
        return;
      }
      if (!src || !src.html) { prevEl.innerHTML = ""; prevEl.style.display = "none"; return; }
      var d = cfg.designSize ? cfg.designSize() : { w: 1920, h: 1080 };
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
      if (!src) { setStatus("Нет исходного HTML", "warn"); return; }
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
      convert(src, ctl.method, ctl.format, function () { return token !== ctl.token || !box.isConnected; }).then(function (res) {
        if (!res || token !== ctl.token) return;   // устаревший результат
        ctl.pending = false;
        ctl.result = res;
        if (res.status === "failed") {
          renderPreview(null, src);
          setStatus("Не применимо: " + ((res.reasons && res.reasons[0]) || res.error || "ошибка движка"), "warn");
          cfg.onResult && cfg.onResult(null, ctl);
          return;
        }
        if (!usable(res)) {
          renderPreview(null, src);
          setStatus("Не применимо: " + ((res.reasons && res.reasons[0]) || "слоты медиа исходника потеряны"), "warn");
          cfg.onResult && cfg.onResult(null, ctl);
          return;
        }
        renderPreview(res, src);
        var note = res.status === "warning" ? "Проверить: " + (res.warnings[0] || res.reasons[0] || "") : "Готово";
        setStatus(statusText(res) + " — " + note, res.status === "warning" ? "warn" : "ok");
        cfg.onResult && cfg.onResult(res, ctl);
      });
    }

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
      format: res.format, sourceFormat: src.format || "16:9",
      sourceTpl: src.tpl || "", sourceLabel: src.label || "",
      sourceHtml: String(src.html || ""), sourceHash: res.sourceHash,
      resultTextHash: res.resultTextHash, status: res.status,
      frame: { w: res.frameW, h: res.frameH },
      adaptedAt: new Date().toISOString()
    };
  }

  // Нормализует HTML для записи в блок: без служебных id узлов (их выдаст Pano заново)
  function cleanHtml(html) { return stripNodeAttrs(html); }

  function origin(html, meta, fallbackFormat) {
    if (meta && meta.adaptation && meta.adaptation.sourceHtml) {
      return { html: meta.adaptation.sourceHtml, format: meta.adaptation.sourceFormat || "16:9", tpl: meta.adaptation.sourceTpl, label: meta.adaptation.sourceLabel };
    }
    return { html: html, format: fallbackFormat || "16:9" };
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
    ready: ready,
    formats: formats, formatLabel: formatLabel, methods: methods,
    convert: convert, mount: mount, controlsHtml: controlsHtml,
    usable: usable, metaFor: metaFor, origin: origin, cleanHtml: cleanHtml,
    slotNames: slotNames, textHash: textHash, hash: hash, stripNodeAttrs: stripNodeAttrs,
    stepSelect: stepSelect, makeWheelStepper: makeWheelStepper,
    setPreview: setPreview, clearPreview: clearPreview, previewFor: previewFor, previewHtml: previewHtml,
    errors: function () { return adapt() ? adapt().errors() : []; },
    modules: function () { return adapt() ? adapt().ids() : []; }
  };
})();
