/* Проход 1: объединение системных библиотек шаблонов.
 * Чистый модуль без DOM и без состояния проекта.
 *
 * Идентичность варианта: tpl + aspect (формат). Разные аспекты одного шаблона —
 * разные варианты. Название, family и HTML на идентичность не влияют.
 * styleSystem — принадлежность к подборкам (стилям), а не основание для карточки.
 *
 * Конфликт содержимого (разные HTML или значимые метаданные при одинаковом
 * tpl|aspect): обе версии сохраняются с источниками, предупреждение выставляется,
 * спорная версия автоматически не применяется. Приоритет по имени файла или
 * времени изменения не вводится: основная версия — та, что уже применена
 * (_primaryFp), либо первая установленная, если применённой больше нет.
 */
var PMS_TemplateLibraryMerge = (function () {
  function stable(v) {
    if (v === null || typeof v !== "object") return JSON.stringify(v === undefined ? null : v);
    if (Array.isArray(v)) return "[" + v.map(function (x) { return stable(x === undefined ? null : x); }).join(",") + "]";
    return "{" + Object.keys(v).sort().filter(function (k) {
      return v[k] !== undefined && typeof v[k] !== "function";
    }).map(function (k) { return JSON.stringify(k) + ":" + stable(v[k]); }).join(",") + "}";
  }
  function fnv(s, seed) {
    var h = seed >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ("00000000" + h.toString(16)).slice(-8);
  }
  function hash(s) { return fnv(s, 0x811c9dc5) + fnv(s, 0x9e3779b9) + s.length.toString(36); }
  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
  function stripMeta(rec) {
    var out = {};
    Object.keys(rec || {}).forEach(function (k) { if (k.charAt(0) !== "_") out[k] = rec[k]; });
    return out;
  }
  function variantKey(rec) {
    return String((rec && (rec.tpl || rec.id)) || "") + "|" + String((rec && (rec.format || rec.aspect)) || "");
  }
  // Копия, созданная Sandbox (s2NewStyleFromSelection): полный клон записи с tpl = <база>_NNN
  // и своим styleSystem. Поля происхождения в экспорте нет, поэтому копия распознаётся только если:
  // суффикс _NNN, та же база с тем же форматом в пуле и полностью совпадают все остальные данные.
  // Совпадение только по family/HTML не используется.
  var SANDBOX_COPY_RE = /^(.+)_(\d{3})$/;
  // sourceFile — служебная метка источника, добавляемая слиянием (не данные экспорта).
  var IDENTITY_SKIP = { tpl: 1, id: 1, styleSystem: 1, favorite: 1, sourceFile: 1 };
  function identityData(rec) {
    var o = stripMeta(rec);
    Object.keys(o).forEach(function (k) { if (IDENTITY_SKIP[k]) delete o[k]; });
    return stable(o);
  }
  function formatOf(rec) { return String((rec && (rec.format || rec.aspect)) || ""); }
  function copyBaseOf(rec, pool) {
    var m = SANDBOX_COPY_RE.exec(String((rec && rec.tpl) || ""));
    if (!m) return null;
    var fmt = formatOf(rec), data = identityData(rec);
    var base = (pool || []).filter(function (b) {
      return b && b.tpl === m[1] && formatOf(b) === fmt && !SANDBOX_COPY_RE.test(String(b.tpl)) && identityData(b) === data;
    })[0];
    return base ? { tpl: base.tpl, id: base.id } : null;
  }
  // Ключ варианта: для копии — ключ её базы, иначе tpl|aspect.
  function keyOf(rec, pool) {
    var b = copyBaseOf(rec, pool);
    return b ? variantKey({ tpl: b.tpl, format: formatOf(rec) }) : variantKey(rec);
  }
  // Значимое содержимое для сравнения версий (без styleSystem и служебных полей).
  function contentFingerprint(rec) {
    var c = {
      html: rec.html || "", format: rec.format || "",
      w: rec.canvas && rec.canvas.w, h: rec.canvas && rec.canvas.h,
      label: rec.label || "", group: rec.group || "", code: rec.code || "", desc: rec.desc || "",
      icon: rec.icon || "", tags: Array.isArray(rec.tags) ? rec.tags.slice().sort() : [],
      target: rec.target || "", contractVersion: rec.contractVersion || "",
      kind: rec.kind || "", single: !!rec.single, adaptation: rec.adaptation || null,
      motionStudio: rec.motionStudio || null,
      sandboxMeta: rec.sandboxMeta || null
    };
    return hash(stable(c));
  }
  function styleNamesOf(rec) {
    var s = String((rec && rec.styleSystem) || "default").trim() || "default";
    return [s];
  }
  function uniq(arr) {
    var seen = {}, out = [];
    (arr || []).forEach(function (x) { if (x != null && !seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  // Ключи объекта в порядке сортировки: порядок загрузки источников не влияет на сохранённые данные.
  function sortedObject(o) {
    var out = {};
    Object.keys(o || {}).sort().forEach(function (k) { out[k] = o[k]; });
    return out;
  }
  function slug(fmt) { return String(fmt || "").replace(/[^0-9a-zA-Z]+/g, "x").replace(/^x+|x+$/g, "") || "v"; }

  // Превращает сохранённую запись в список версий: [{fp, files:[], content, styles:{file:[names]}}]
  function versionsOf(rec, legacyFile) {
    if (Array.isArray(rec._versions) && rec._versions.length) {
      return rec._versions.map(function (v) {
        return { fp: v.fp, files: (v.files || []).slice(), content: v.content, styles: clone(v.styles || {}) };
      });
    }
    var file = rec.sourceFile || legacyFile || "templates/librarymotion.js";
    var styles = {}; styles[file] = styleNamesOf(rec);
    return [{ fp: contentFingerprint(rec), files: [file], content: stripMeta(rec), styles: styles }];
  }

  /*
   * current  — текущий массив системных записей секции (сохранённые записи)
   * incoming — нормализованные записи источника (после normalizeSandboxLibraryManifest)
   * file     — путь источника, например "templates/Test/library.js"
   * legacyFile — файл, которым помечены записи старого формата без _versions
   * Возвращает { list, report }. Входные массивы не мутируются.
   */
  function mergeSource(current, incoming, file, legacyFile) {
    var order = [], groups = {};
    var pool = (current || []).concat(incoming || []);
    function group(key) {
      if (!groups[key]) { groups[key] = { key: key, versions: [], primaryFp: null, prev: null }; order.push(key); }
      return groups[key];
    }
    var report = { file: file, added: [], changed: [], unchanged: [], removed: [], conflicts: [] };
    var prevSig = {};
    // Сигнатура членства: фингерпринты версий, файлы и стили. Не зависит от производных полей записи.
    function sigOf(vs, primaryFp) {
      var sorted = vs.slice().sort(function (a, b) { return a.fp < b.fp ? -1 : a.fp > b.fp ? 1 : 0; });
      return stable({ primary: primaryFp || null, versions: sorted.map(function (v) {
        return { fp: v.fp, files: v.files.slice().sort(), styles: v.styles };
      }) });
    }

    // 1. Снимаем членство этого источника со всех существующих записей.
    (current || []).forEach(function (rec) {
      var key = keyOf(rec, pool), g = group(key);
      if (!g.prev) g.prev = rec;
      (prevSig[key] = prevSig[key] || []).push({ rec: rec, vs: versionsOf(rec, legacyFile) });
      if (rec._primaryFp && !g.primaryFp) g.primaryFp = rec._primaryFp;
      versionsOf(rec, legacyFile).forEach(function (v) {
        var files = v.files.filter(function (f) { return f !== file; });
        var styles = clone(v.styles); delete styles[file];
        if (!files.length) return;
        var found = g.versions.filter(function (x) { return x.fp === v.fp; })[0];
        if (found) {
          found.files = uniq(found.files.concat(files));
          Object.assign(found.styles, styles);
        } else g.versions.push({ fp: v.fp, files: files, content: v.content, styles: styles });
      });
    });

    // 2. Добавляем записи источника.
    (incoming || []).forEach(function (it) {
      var key = keyOf(it, pool), g = group(key), fp = contentFingerprint(it);
      var v = g.versions.filter(function (x) { return x.fp === fp; })[0];
      if (!v) {
        var content = stripMeta(it);
        var base = copyBaseOf(it, pool);
        if (base) {
          // Карточка варианта берёт tpl/id базы; копия не создаёт своего tpl в библиотеке.
          if (content.id === content.tpl) content.id = base.tpl;
          content.tpl = base.tpl;
        }
        v = { fp: fp, files: [], content: content, styles: {} };
        g.versions.push(v);
      }
      if (v.files.indexOf(file) < 0) v.files.push(file);
      // Стили накапливаются: одна версия может быть в нескольких подборках/записях одного файла.
      v.styles[file] = uniq((v.styles[file] || []).concat(styleNamesOf(it)));
    });

    // 3. Собираем записи. Версии без источников отбрасываются.
    var list = [], usedIds = {};
    order.forEach(function (key) {
      var g = groups[key];
      var vs = g.versions.filter(function (v) { return v.files.length; });
      var prevRec = g.prev;
      if (!vs.length) { report.removed.push(key); return; }
      var primary = vs.filter(function (v) { return v.fp === g.primaryFp; })[0] || vs[0];
      var rec = clone(primary.content);
      // id: при коллизии tpl (разные аспекты) — суффикс по формату
      var baseId = String(rec.id || rec.tpl || "tpl");
      var id = baseId;
      if (usedIds[id]) {
        id = baseId + "_" + slug(rec.format);
        var n = 2, cand = id;
        while (usedIds[cand]) cand = id + "_" + n++;
        id = cand;
      }
      usedIds[id] = 1;
      rec.id = id;
      rec.sourceFile = primary.files[0];
      var allStyles = {};
      vs.forEach(function (v) { Object.keys(v.styles).forEach(function (f) { if (v.files.indexOf(f) >= 0) allStyles[f] = v.styles[f]; }); });
      rec.styleSystem = (primary.styles[primary.files[0]] || styleNamesOf(rec))[0] || rec.styleSystem || "default";
      rec._styleNames = uniq([].concat.apply([], Object.keys(allStyles).map(function (f) { return allStyles[f]; })));
      rec._styles = sortedObject(allStyles);
      rec._primaryFp = primary.fp;
      // Порядок версий детерминированный (по отпечатку). Основная версия фиксируется в _primaryFp.
      var vsSorted = vs.slice().sort(function (a, b) { return a.fp < b.fp ? -1 : a.fp > b.fp ? 1 : 0; });
      rec._versions = vsSorted.map(function (v) {
        var c = clone(v.content); c.id = id;
        return { fp: v.fp, files: v.files.slice().sort(), styles: sortedObject(v.styles), content: c };
      });
      rec._conflict = vs.length > 1 ? { variants: vs.length, files: uniq([].concat.apply([], vs.map(function (v) { return v.files; }))).sort() } : null;
      list.push(rec);
      if (!prevRec) report.added.push(key);
      else {
        var prevParts = prevSig[key] || [];
        var prevVs = [].concat.apply([], prevParts.map(function (x) { return x.vs || []; }));
        var prevPrimary = (prevParts[0] && prevParts[0].rec && prevParts[0].rec._primaryFp) || null;
        var same = prevParts.length === 1 && sigOf(prevVs, prevPrimary) === sigOf(vs, primary.fp);
        (same ? report.unchanged : report.changed).push(key);
      }
      if (rec._conflict) report.conflicts.push(key);
    });
    return { list: list, report: report };
  }

  // Явный выбор версии при конфликте. Не меняет другие записи.
  function choosePrimary(list, key, fp) {
    return (list || []).map(function (rec) {
      if (variantKey(rec) !== key || !rec._versions) return rec;
      var v = rec._versions.filter(function (x) { return x.fp === fp; })[0];
      if (!v) return rec;
      var out = clone(rec);
      var content = clone(v.content);
      content.id = rec.id;
      var keepStyles = out._styles;
      Object.keys(content).forEach(function (k) { out[k] = content[k]; });
      out.sourceFile = v.files[0];
      out.styleSystem = out.styleSystem || "default";
      out._primaryFp = fp;
      out._conflict = out._versions.length > 1 ? out._conflict : null;
      out._styles = keepStyles;
      return out;
    });
  }

  return {
    mergeSource: mergeSource,
    variantKey: variantKey,
    contentFingerprint: contentFingerprint,
    choosePrimary: choosePrimary,
    stable: stable
  };
})();
if (typeof module !== "undefined" && module.exports) module.exports = PMS_TemplateLibraryMerge;
