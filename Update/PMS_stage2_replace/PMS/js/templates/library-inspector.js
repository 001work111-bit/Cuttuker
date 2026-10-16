"use strict";

/* Инспектор библиотек шаблонов: кнопка-индикатор, сводка, таблица источников, управление файлами, логи.
   Все числа берутся из последнего фактического сканирования (window.PMS_LAST_INSPECTION) и текущей библиотеки.
   Файловые операции выполняются только в Main Process через ограниченный мост PMS_ELECTRON. */

var pmsInspector = {
  ui: { filterText: "", filterStatus: "all", selected: null },
  notices: [],          // итоги действий (попадают в полный лог)
  history: []           // полная история действий сессии
};

var PMS_INSP_STATUS_LABEL = {
  loaded: "Загружена", error: "Ошибка", skipped: "Пропущена", missing: "Нет на диске", pending: "Не проверена"
};

function pmsInspBridge() { return window.PMS_ELECTRON || null; }
function pmsInspHasFileBridge() {
  var b = pmsInspBridge();
  return !!(b && typeof b.listTemplateSources === "function" && typeof b.addTemplateFiles === "function" &&
    typeof b.deleteTemplateSource === "function" && typeof b.saveInspectorLog === "function");
}
function pmsInspErrMsg(e) { return String(e && e.message || e); }
function pmsInspUniq(arr) {
  var seen = {}, out = [];
  (arr || []).forEach(function (x) { if (x != null && x !== "" && !seen[x]) { seen[x] = 1; out.push(x); } });
  return out;
}

function pmsInspNotice(text, level) {
  var item = { at: new Date().toISOString(), level: level || "info", text: String(text) };
  pmsInspector.notices.unshift(item);
  pmsInspector.notices = pmsInspector.notices.slice(0, 6);
  pmsInspector.history.push(item);
}

// Файлы-источники, из которых состоит системная запись.
function pmsInspFilesOf(rec) {
  var out = Object.keys(rec._styles || {});
  (rec._versions || []).forEach(function (v) { (v.files || []).forEach(function (f) { out.push(f); }); });
  return pmsInspUniq(out);
}

// Членство одного источника снимается из системной библиотеки; записи других источников сохраняются.
// Это единственная точка удаления членства (удаление файла и очистка привязки).
function pmsRemoveSystemSourceMembership(rel) {
  var lib = ensureProjectTemplateLibrary();
  commitHistory();
  var before = JSON.stringify(snapshot());
  var merged = PMS_TemplateLibraryMerge.mergeSource(lib.systemLibrary.templates || [], [], rel);
  lib.systemLibrary.templates = merged.list;
  ensureProjectTemplateLibrary();
  rememberTemplateSelectionAfterLibraryUpdate();
  renderLibraryPane();
  if (JSON.stringify(snapshot()) !== before) commitHistory();
  return merged.report;
}

function pmsInspModel() {
  var run = window.PMS_LAST_INSPECTION || null;
  var lib = ensureProjectTemplateLibrary();
  var sys = (lib.systemLibrary && lib.systemLibrary.templates) || [];
  var diskMap = {};
  if (run && run.listing) run.listing.files.forEach(function (f) { diskMap[f.relativePath] = f; });
  var member = {};
  sys.forEach(function (rec) {
    pmsInspFilesOf(rec).forEach(function (f) { (member[f] = member[f] || []).push(rec); });
  });
  var rels = [], seen = {};
  function add(r) { if (!seen[r]) { seen[r] = 1; rels.push(r); } }
  if (run && run.listing) run.listing.files.forEach(function (f) { add(f.relativePath); });
  Object.keys(member).forEach(add);

  var sources = rels.sort().map(function (rel) {
    var onDisk = !!diskMap[rel];
    var recs = member[rel] || [];
    var pf = run && run.perFile ? run.perFile[rel] : null;
    var rep = run && run.reports ? run.reports[rel] : null;
    var status, messages = pf && pf.messages ? pf.messages.slice() : [];
    if (!onDisk) status = "missing";
    else if (pf) status = pf.status;
    else status = "pending";
    if (status === "missing") messages.push("файла нет на диске; варианты остаются в библиотеке до очистки привязки");
    var styles = [];
    recs.forEach(function (r) { styles = styles.concat((r._styles && r._styles[rel]) || []); });
    // Отчёт слияния перечисляет варианты всех источников; для строки берём только варианты этого файла.
    var keySet = {};
    recs.forEach(function (r) { keySet[(r.tpl || r.id) + "|" + (r.format || r.aspect || "")] = 1; });
    var own = function (arr) { return (arr || []).filter(function (k) { return !!keySet[k]; }); };
    var changeKeys = rep ? {
      added: own(rep.added), changed: own(rep.changed), unchanged: own(rep.unchanged),
      removedFromSource: rep.removedFromSource.slice()
    } : null;
    return {
      relativePath: rel,
      status: status,
      onDisk: onDisk,
      size: onDisk ? diskMap[rel].size : null,
      messages: messages,
      records: rep ? rep.records : null,
      changes: changeKeys ? {
        added: changeKeys.added.length, changed: changeKeys.changed.length,
        unchanged: changeKeys.unchanged.length, removedFromSource: changeKeys.removedFromSource.length
      } : null,
      changeKeys: changeKeys,
      styles: pmsInspUniq(styles),
      formats: pmsInspUniq(recs.map(function (r) { return String(r.format || r.aspect || ""); })),
      variants: recs.map(function (r) { return { id: r.id || r.tpl, tpl: r.tpl, format: r.format || r.aspect || "" }; }),
      conflicts: recs.filter(function (r) { return r._conflict && (r._conflict.files || []).indexOf(rel) >= 0; })
        .map(function (r) { return (r.tpl || r.id) + "|" + (r.format || r.aspect || ""); }),
      isUser: /(^|\/)user\.js$/i.test(rel)
    };
  });

  var loaded = sources.filter(function (s) { return s.status === "loaded"; });
  var styleSet = [];
  sys.forEach(function (r) { styleSet = styleSet.concat(r._styleNames || []); });
  var summary = {
    filesFound: run ? run.listing.files.length : null,
    processed: run ? loaded.length : null,
    sourceRecords: run ? loaded.reduce(function (n, s) { return n + (s.records || 0); }, 0) : null,
    variants: sys.length,
    styles: pmsInspUniq(styleSet).length,
    conflicts: sys.filter(function (r) { return !!r._conflict; }).length,
    errors: run ? (run.errors || []).length : null,
    missing: sources.filter(function (s) { return s.status === "missing"; }).length
  };
  return { run: run, sources: sources, summary: summary };
}

function pmsInspProblemCount(model) {
  var s = model.summary;
  return (s.errors || 0) + s.conflicts + s.missing;
}

function pmsInspUpdateBadge(model) {
  var badge = document.getElementById("btnLibInspectorBadge");
  if (!badge) return;
  var n = pmsInspProblemCount(model);
  badge.textContent = String(n);
  badge.hidden = n === 0;
  badge.title = n ? "Проблем в библиотеках: " + n : "";
}

function pmsInspStatusBadge(status) {
  var color = { loaded: "#3ecf8e", error: "#ff5b6a", skipped: "#8b93a1", missing: "#e0b23a", pending: "#8b93a1" }[status] || "#8b93a1";
  return '<span class="pinsp-badge" style="color:' + color + ';border-color:' + color + '">' + esc(PMS_INSP_STATUS_LABEL[status] || status) + "</span>";
}

function pmsInspDash(v) { return v == null || v === "" ? "—" : esc(String(v)); }

function pmsInspRows(model) {
  var q = pmsInspector.ui.filterText.trim().toLowerCase();
  return model.sources.filter(function (s) {
    if (pmsInspector.ui.filterStatus !== "all" && s.status !== pmsInspector.ui.filterStatus) return false;
    if (q && s.relativePath.toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}

function pmsInspTableHtml(model) {
  var rows = pmsInspRows(model);
  if (!rows.length) return '<div class="pinsp-empty">Нет источников по выбранному фильтру.</div>';
  var html = '<table class="pinsp-table"><thead><tr>' +
    '<th>Статус</th><th>Файл / путь</th><th class="num">Записи</th><th>Стили</th>' +
    '<th class="num">Изменения</th><th class="num">Конфликты</th><th>Сообщение</th></tr></thead><tbody>';
  rows.forEach(function (s) {
    var sel = pmsInspector.ui.selected === s.relativePath ? " sel" : "";
    var ch = s.changes ? "+" + s.changes.added + " / ~" + s.changes.changed + " / =" + s.changes.unchanged + " / −" + s.changes.removedFromSource : "—";
    var msg = s.messages.length ? esc(s.messages.join("; ")) : "";
    html += '<tr class="pinsp-row' + sel + '" data-rel="' + esc(s.relativePath) + '">' +
      "<td>" + pmsInspStatusBadge(s.status) + "</td>" +
      '<td><div class="pinsp-name">' + esc(s.relativePath.split("/").pop()) + "</div><div class=\"pinsp-path\">" + esc(s.relativePath) + "</div></td>" +
      '<td class="num">' + pmsInspDash(s.records) + "</td>" +
      "<td>" + (s.styles.length ? esc(s.styles.length + ": " + s.styles.join(", ")) : "—") + "</td>" +
      '<td class="num">' + ch + "</td>" +
      '<td class="num">' + (s.status === "pending" ? "—" : s.conflicts.length) + "</td>" +
      '<td class="pinsp-msg">' + (msg || "—") + "</td></tr>";
  });
  return html + "</tbody></table>";
}

function pmsInspDetailsHtml(model) {
  var rel = pmsInspector.ui.selected;
  var s = model.sources.filter(function (x) { return x.relativePath === rel; })[0];
  if (!s) return '<div class="pinsp-empty">Выберите строку таблицы, чтобы увидеть подробности.</div>';
  var fmt = {};
  s.variants.forEach(function (v) { fmt[v.format || "—"] = (fmt[v.format || "—"] || 0) + 1; });
  var html = '<div class="pinsp-detail"><div class="pinsp-detail-title">' + esc(s.relativePath) + " " + pmsInspStatusBadge(s.status) + "</div>";
  html += "<div><b>Стили:</b> " + (s.styles.length ? esc(s.styles.join(", ")) : "—") + "</div>";
  html += "<div><b>Варианты по форматам:</b> " + (Object.keys(fmt).length ? esc(Object.keys(fmt).map(function (f) { return f + " — " + fmt[f]; }).join("; ")) : "—") + "</div>";
  html += "<div><b>Идентификаторы шаблонов:</b> " + (s.variants.length ? esc(s.variants.map(function (v) { return v.id; }).join(", ")) : "—") + "</div>";
  html += "<div><b>Конфликтующие варианты:</b> " + (s.conflicts.length ? esc(s.conflicts.join(", ")) : "нет") + "</div>";
  if (s.changeKeys) {
    html += "<div><b>Последнее обновление:</b> добавлено " + s.changeKeys.added.length + ", изменено " + s.changeKeys.changed.length +
      ", без изменений " + s.changeKeys.unchanged.length + ", удалено из источника " + s.changeKeys.removedFromSource.length + "</div>";
  }
  if (s.messages.length) html += '<div class="pinsp-warn"><b>Сообщения:</b> ' + esc(s.messages.join("; ")) + "</div>";
  return html + "</div>";
}

function pmsInspSummaryHtml(model) {
  var s = model.summary;
  function tile(label, value, hint) {
    return '<div class="pinsp-tile"><div class="pinsp-tile-label">' + esc(label) + '</div><div class="pinsp-tile-value">' +
      pmsInspDash(value) + '</div><div class="pinsp-tile-hint">' + esc(hint) + "</div></div>";
  }
  return '<div class="pinsp-tiles">' +
    tile("Файлов обнаружено", s.filesFound, "файлы .js/.json в templates/") +
    tile("Обработано", s.processed, "успешно прочитано и обработано") +
    tile("Записей в источниках", s.sourceRecords, "исходные записи шаблонов") +
    tile("Вариантов после слияния", s.variants, "уникальные tpl + aspect") +
    tile("Стилей / подборок", s.styles, "по данным Sandbox") +
    tile("Конфликтов / ошибок", s.conflicts + " / " + pmsInspDash(s.errors), "конфликты содержимого и ошибки чтения") +
    "</div>";
}

function pmsInspPanelHtml() {
  var model = pmsInspModel();
  var run = model.run;
  var overall = !run ? "Не проверено" : (model.summary.errors || model.summary.missing ? "Есть ошибки" :
    (model.summary.conflicts ? "Есть конфликты" : "Готово"));
  var notices = pmsInspector.notices.map(function (n) {
    var color = n.level === "error" ? "#ff5b6a" : n.level === "ok" ? "#3ecf8e" : "#8b93a1";
    return '<div style="color:' + color + '">' + esc(n.text) + "</div>";
  }).join("");
  var conflictBtn = model.summary.conflicts ? '<button class="btn" data-act="resolve" type="button">Выбрать версии конфликтов</button>' : "";
  var sel = model.sources.filter(function (x) { return x.relativePath === pmsInspector.ui.selected; })[0];
  var delBtn = sel && sel.onDisk && !sel.isUser ? '<button class="btn danger" data-act="delete" type="button">Удалить источник</button>' : "";
  var clearBtn = sel && sel.status === "missing" ? '<button class="btn warn" data-act="clear" type="button">Очистить привязку</button>' : "";
  return '<div class="modalHead row"><strong>Инспектор библиотек</strong>' +
    '<span class="pinsp-badge" style="margin-left:8px">' + esc(overall) + "</span>" +
    '<span class="pinsp-muted" style="margin-left:auto">' + (run ? "Последнее обновление: " + esc(new Date(run.startedAt).toLocaleString()) + " · " + run.durationMs + " мс" : "нет данных сканирования") + "</span>" +
    '<button class="btn" data-act="close" type="button" aria-label="Закрыть">×</button></div>' +
    '<div class="pinsp-muted">Источники шаблонов · состояние загрузки · диагностика</div>' +
    (notices ? '<div class="pinsp-notices">' + notices + "</div>" : "") +
    (run && run.fatal ? '<div class="pinsp-warn">Не удалось прочитать templates/: ' + esc(run.fatal) + "</div>" : "") +
    pmsInspSummaryHtml(model) +
    '<div class="pinsp-toolbar"><input id="pinspSearch" class="btn" type="text" placeholder="Поиск по имени файла" value="' + esc(pmsInspector.ui.filterText) + '" />' +
    '<select id="pinspStatus" class="btn">' +
    ["all", "loaded", "error", "skipped", "missing", "pending"].map(function (v) {
      var label = v === "all" ? "Все статусы" : PMS_INSP_STATUS_LABEL[v];
      return '<option value="' + v + '"' + (pmsInspector.ui.filterStatus === v ? " selected" : "") + ">" + esc(label) + "</option>";
    }).join("") + "</select></div>" +
    '<div id="pinspTable">' + pmsInspTableHtml(model) + "</div>" +
    pmsInspDetailsHtml(model) +
    '<div class="pinsp-actions">' +
    '<button class="btn primary" data-act="add" type="button">Добавить файлы</button>' +
    '<button class="btn" data-act="refresh" type="button">Обновить</button>' +
    '<button class="btn" data-act="quiet" type="button" title="Без окна успешного завершения; ошибки и конфликты видны здесь">Тихое обновление</button>' +
    conflictBtn + delBtn + clearBtn +
    '<span style="flex:1"></span>' +
    '<button class="btn" data-act="log-short" type="button">Скачать краткий лог</button>' +
    '<button class="btn" data-act="log-full" type="button">Скачать полный лог</button>' +
    "</div>" +
    '<div class="pinsp-muted" style="margin-top:8px">Системные файлы читаются из templates/ рекурсивно (*.js, *.json). templates/user.js — пользовательский слой и не удаляется.</div>';
}

function pmsInspRender() {
  var modal = document.getElementById("libInspectorModal");
  if (!modal || modal.style.display !== "flex") return;
  var panel = document.getElementById("libInspectorPanel");
  panel.innerHTML = pmsInspPanelHtml();
  pmsInspUpdateBadge(pmsInspModel());
}

function pmsInspOpen() {
  var modal = document.getElementById("libInspectorModal");
  if (!modal) return;
  modal.style.display = "flex";
  pmsInspRender();
}
function pmsInspClose() {
  var modal = document.getElementById("libInspectorModal");
  if (modal) modal.style.display = "none";
}

// Вызывается из refreshTemplateLibrarySources после каждого сканирования.
window.PMS_inspectorAfterRun = function (run, opts) {
  opts = opts || {};
  if (opts.open) pmsInspOpen();
  else { pmsInspRender(); pmsInspUpdateBadge(pmsInspModel()); }
};

// ---- Действия ----

async function pmsInspAddFiles() {
  if (!pmsInspHasFileBridge()) { pmsInspNotice("Добавление файлов доступно только в приложении PMS (Electron).", "error"); return pmsInspRender(); }
  var r;
  try { r = await pmsInspBridge().addTemplateFiles(); }
  catch (e) { pmsInspNotice("Добавление не выполнено: " + pmsInspErrMsg(e), "error"); return pmsInspRender(); }
  if (!r) return pmsInspRender();
  if (r.canceled && !r.added.length) pmsInspNotice("Добавление файлов отменено.", "info");
  if (r.added.length) pmsInspNotice("Добавлено файлов: " + r.added.length + " (" + r.added.join(", ") + ")", "ok");
  (r.skipped || []).forEach(function (s) { pmsInspNotice("Пропущен " + s.file + ": " + s.reason, "info"); });
  (r.errors || []).forEach(function (e) { pmsInspNotice("Не добавлен " + e.file + ": " + e.error, "error"); });
  if (r.added.length) await refreshTemplateLibrarySources({ quiet: true });
  pmsInspRender();
}

async function pmsInspRefresh(quiet) {
  var run = await refreshTemplateLibrarySources({ quiet: true, openInspector: false });
  if (run) {
    pmsInspNotice((quiet ? "Тихое обновление" : "Обновление") + ": загружено " + run.loaded.length + ", ошибок " + run.errors.length +
      ", конфликтов " + run.conflicts.length + ", проект " + (run.projectSame ? "без изменений" : "ИЗМЕНЕН"), run.errors.length ? "error" : "ok");
  }
  pmsInspRender();
}

async function pmsInspDeleteSource(rel) {
  var r;
  try { r = await pmsInspBridge().deleteTemplateSource(rel); }
  catch (e) { pmsInspNotice("Удаление не выполнено: " + pmsInspErrMsg(e), "error"); return pmsInspRender(); }
  if (!r || !r.ok) { pmsInspNotice("Удаление отменено: " + rel, "info"); return pmsInspRender(); }
  var rep = pmsRemoveSystemSourceMembership(rel);
  pmsInspNotice("Источник удалён: " + rel + ". Вариантов, убранных из этого источника: " + rep.removedFromSource.length +
    ". Варианты из других источников сохранены.", "ok");
  pmsInspector.ui.selected = null;
  await refreshTemplateLibrarySources({ quiet: true });
  pmsInspRender();
}

function pmsInspClearBinding(rel) {
  if (!window.confirm("Очистить привязку «" + rel + "»?\n\nФайла нет на диске. Варианты, которые поступали только из него, будут убраны из галереи. Пользовательские копии и другие источники не затрагиваются.")) return;
  var rep = pmsRemoveSystemSourceMembership(rel);
  pmsInspNotice("Привязка очищена: " + rel + ". Убрано вариантов: " + rep.removedFromSource.length + ".", "ok");
  pmsInspector.ui.selected = null;
  pmsInspRender();
}

function pmsInspShortText(run, model) {
  var s = model.summary, lines = [];
  lines.push("PMS — лог библиотек шаблонов");
  lines.push("Время сканирования: " + (run ? run.startedAt : "нет данных") + (run ? "   Длительность: " + run.durationMs + " мс" : ""));
  lines.push("Файлов обнаружено: " + s.filesFound + ", обработано: " + s.processed + ", ошибок: " + s.errors + ", пропущено: " + run.skipped.length);
  lines.push("Записей в источниках: " + s.sourceRecords + "; вариантов после слияния: " + s.variants + "; стилей: " + s.styles + "; конфликтов: " + s.conflicts);
  lines.push("Проект и таймлайн: " + (run && run.projectSame ? "без изменений" : "ИЗМЕНЕНЫ"));
  lines.push("");
  lines.push("Источники:");
  model.sources.forEach(function (x) {
    var ch = x.changes ? "+" + x.changes.added + " ~" + x.changes.changed + " =" + x.changes.unchanged + " −" + x.changes.removedFromSource : "—";
    lines.push("- [" + PMS_INSP_STATUS_LABEL[x.status] + "] " + x.relativePath + " — записей " + (x.records == null ? "—" : x.records) +
      ", стили: " + (x.styles.join(", ") || "—") + "; изменения " + ch + "; конфликтов " + x.conflicts.length +
      (x.messages.length ? "; " + x.messages.join("; ") : ""));
  });
  if (run && run.conflicts.length) {
    lines.push(""); lines.push("Конфликты:");
    run.conflicts.forEach(function (c) {
      lines.push("- " + c.key + ": " + c.versions.map(function (v) { return "версия " + v.fp.slice(0, 10) + " из " + v.files.join(", "); }).join(" / vs "));
    });
  }
  if (run && run.listing.warnings.length) { lines.push(""); lines.push("Предупреждения: " + run.listing.warnings.join("; ")); }
  return lines.join("\n") + "\n";
}

function pmsInspFullObject(run, model, appInfo) {
  return {
    format: "pms-library-inspector-log-v1",
    generatedAt: new Date().toISOString(),
    app: appInfo ? { version: appInfo.version, electron: appInfo.electron } : null,
    scan: run ? { startedAt: run.startedAt, durationMs: run.durationMs, fatal: run.fatal } : null,
    listing: run ? { files: run.listing.files, warnings: run.listing.warnings } : null,
    summary: model.summary,
    sources: model.sources.map(function (x) {
      return {
        relativePath: x.relativePath, status: x.status, onDisk: x.onDisk, sizeBytes: x.size,
        messages: x.messages, records: x.records, styles: x.styles, formats: x.formats,
        templateIds: x.variants.map(function (v) { return v.id; }), conflictKeys: x.conflicts,
        changes: x.changeKeys,
        exception: run && run.perFile && run.perFile[x.relativePath] && run.perFile[x.relativePath].stack || null
      };
    }),
    errors: run ? run.errors : [],
    conflicts: run ? run.conflicts : [],
    projectSame: run ? run.projectSame : null,
    actions: pmsInspector.history,
    note: "HTML шаблонов в лог не включается."
  };
}

async function pmsInspSaveLog(kind) {
  if (!window.PMS_LAST_INSPECTION) { pmsInspNotice("Сначала выполните сканирование библиотек.", "error"); return pmsInspRender(); }
  if (!pmsInspHasFileBridge()) { pmsInspNotice("Сохранение лога доступно только в приложении PMS (Electron).", "error"); return pmsInspRender(); }
  var model = pmsInspModel(), run = window.PMS_LAST_INSPECTION;
  var content;
  if (kind === "full") {
    var info = null;
    try { info = await pmsInspBridge().getAppInfo(); } catch (e) { info = null; }
    content = JSON.stringify(pmsInspFullObject(run, model, info), null, 2);
  } else content = pmsInspShortText(run, model);
  try {
    var res = await pmsInspBridge().saveInspectorLog(kind, content);
    if (res && res.saved) pmsInspNotice("Лог сохранён: " + res.path, "ok");
    else pmsInspNotice("Сохранение лога отменено.", "info");
  } catch (e) {
    pmsInspNotice("Не удалось сохранить лог: " + pmsInspErrMsg(e), "error");
    alert("Не удалось сохранить лог: " + pmsInspErrMsg(e));
  }
  pmsInspRender();
}

function pmsInspOnClick(e) {
  var row = e.target.closest && e.target.closest("tr[data-rel]");
  if (row) {
    var rel = row.getAttribute("data-rel");
    pmsInspector.ui.selected = pmsInspector.ui.selected === rel ? null : rel;
    return pmsInspRender();
  }
  var btn = e.target.closest && e.target.closest("[data-act]");
  if (!btn) return;
  var act = btn.getAttribute("data-act");
  var model = pmsInspModel();
  var sel = model.sources.filter(function (x) { return x.relativePath === pmsInspector.ui.selected; })[0];
  if (act === "close") return pmsInspClose();
  if (act === "add") return pmsInspAddFiles();
  if (act === "refresh") return pmsInspRefresh(false);
  if (act === "quiet") return refreshTemplateLibrarySources({ quiet: true, openInspector: true }).then(function (run) {
    if (run) pmsInspNotice("Тихое обновление: ошибок " + run.errors.length + ", конфликтов " + run.conflicts.length, run.errors.length ? "error" : "ok");
    pmsInspRender();
  });
  if (act === "resolve") { resolveTemplateLibraryConflicts(); renderLibraryPane(); return pmsInspRender(); }
  if (act === "delete" && sel) return pmsInspDeleteSource(sel.relativePath);
  if (act === "clear" && sel) return pmsInspClearBinding(sel.relativePath);
  if (act === "log-short") return pmsInspSaveLog("short");
  if (act === "log-full") return pmsInspSaveLog("full");
}

// Стили инспектора: только новые классы pinsp-*, существующий дизайн не меняется.
function pmsInspInjectCss() {
  if (document.getElementById("pmsInspectorCss")) return;
  var css = ".pinsp-badge{display:inline-block;font-size:11px;padding:1px 7px;border:1px solid #2c2d38;border-radius:999px}" +
    ".pinsp-muted{color:#8b93a1;font-size:12px}" +
    ".pinsp-notices{margin:8px 0;padding:6px 10px;border:1px solid #2c2d38;border-radius:10px;background:#0b0f17;font-size:12px;display:grid;gap:3px}" +
    ".pinsp-warn{margin:8px 0;padding:6px 10px;border:1px solid #6b4b12;border-radius:10px;background:#1d1608;color:#e0b23a;font-size:12px}" +
    ".pinsp-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}" +
    ".pinsp-tile{border:1px solid #2c2d38;border-radius:10px;padding:8px 10px;background:#0b0f17}" +
    ".pinsp-tile-label{font-size:11px;color:#8b93a1}.pinsp-tile-value{font-size:20px;font-weight:600;margin-top:2px}.pinsp-tile-hint{font-size:10px;color:#6b7280}" +
    ".pinsp-toolbar{display:flex;gap:8px;margin:8px 0}.pinsp-toolbar input{flex:1;min-width:0}" +
    ".pinsp-table{width:100%;border-collapse:collapse;font-size:12px}" +
    ".pinsp-table th{text-align:left;color:#8b93a1;font-weight:500;border-bottom:1px solid #2c2d38;padding:6px}" +
    ".pinsp-table td{border-bottom:1px solid #1d202b;padding:6px;vertical-align:top}" +
    ".pinsp-table .num{text-align:right;white-space:nowrap}" +
    ".pinsp-row{cursor:pointer}.pinsp-row:hover{background:#161a24}.pinsp-row.sel{background:#1b2030}" +
    ".pinsp-name{font-weight:600}.pinsp-path{color:#6b7280;font-size:11px}.pinsp-msg{color:#e0b23a;max-width:260px}" +
    ".pinsp-detail{margin-top:10px;padding:10px;border:1px solid #2c2d38;border-radius:10px;background:#0b0f17;font-size:12px;display:grid;gap:4px}" +
    ".pinsp-detail-title{font-weight:600;margin-bottom:2px}" +
    ".pinsp-empty{padding:12px;color:#8b93a1;font-size:12px}" +
    ".pinsp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center}" +
    ".btn.danger{color:#ff8a94}.btn.warn{color:#e0b23a}" +
    "#btnLibInspectorBadge{margin-left:4px;min-width:16px;text-align:center;border-radius:999px;background:#ff5b6a;color:#fff;font-size:10px;padding:0 5px}";
  var st = document.createElement("style");
  st.id = "pmsInspectorCss";
  st.textContent = css;
  document.head.appendChild(st);
}

function pmsInspSetup() {
  pmsInspInjectCss();
  var openBtn = document.getElementById("btnLibInspector");
  var modal = document.getElementById("libInspectorModal");
  var panel = document.getElementById("libInspectorPanel");
  if (!openBtn || !modal || !panel) return;
  if (!pmsInspHasFileBridge()) { openBtn.style.display = "none"; return; }
  openBtn.addEventListener("click", pmsInspOpen);
  panel.addEventListener("click", pmsInspOnClick);
  panel.addEventListener("input", function (e) {
    if (e.target && e.target.id === "pinspSearch") {
      pmsInspector.ui.filterText = e.target.value;
      var tbl = document.getElementById("pinspTable");
      if (tbl) tbl.innerHTML = pmsInspTableHtml(pmsInspModel());
    }
  });
  panel.addEventListener("change", function (e) {
    if (e.target && e.target.id === "pinspStatus") { pmsInspector.ui.filterStatus = e.target.value; pmsInspRender(); }
  });
  modal.addEventListener("click", function (e) { if (e.target === modal) pmsInspClose(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.style.display === "flex") pmsInspClose(); });
  try { pmsInspUpdateBadge(pmsInspModel()); } catch (e) { /* проект ещё не инициализирован: счётчик обновится после сканирования */ }
}

pmsInspSetup();
