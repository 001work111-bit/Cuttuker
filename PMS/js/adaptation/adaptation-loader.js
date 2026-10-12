"use strict";

/* ============================================================
   adaptation-loader.js — подключение модулей адаптации в Pano Montage Studio.
   ------------------------------------------------------------
   • Работает при запуске index.html через file:// (только <script src>, без fetch и без eval).
   • Формат манифеста — как у Sandbox (window.SB_POOL_MANIFEST.adaptation):
     libraries[{rel}], modules[{folder, rel, descriptor}], errors[{folder, errors}].
   • Список берётся из adaptation-modules/manifest.js (его пишет tools/build-adaptation-manifest.js).
     Модуль без записи в манифесте не подключается.
   • Порядок, как в Sandbox: сначала библиотеки (_shared), затем модули; регистрация — A.register(descriptor).
   • Общие библиотеки подключаются только отсюда. Отдельных <script> для них в index.html нет.
   • Ошибка одного модуля не останавливает остальные: причина — в PMS_ADAPTATION.errors().
   ============================================================ */
(function () {
  var APP = "Pano Montage Studio";
  var BASE = "adaptation-modules/";
  var status = { ready: false, modules: [], libraries: [], errors: [], current: null };
  var listeners = [];
  var readyResolve;
  var readyPromise = new Promise(function (resolve) { readyResolve = resolve; });

  // ошибки, возникшие во время выполнения кода модуля (throw на верхнем уровне)
  window.addEventListener("error", function (e) {
    if (status.ready || !status.current) return;
    status.errors.push({ file: status.current, errors: [String(e.message || "ошибка скрипта")] });
  });

  function loadScript(rel) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = BASE + rel;
      s.async = false;
      s.dataset.adaptation = rel;
      status.current = rel;
      s.onload = function () { resolve(true); };
      s.onerror = function () {
        status.errors.push({ file: rel, errors: ["файл не загрузился"] });
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }

  function finish() {
    status.current = null;
    status.ready = true;
    readyResolve(api);
    listeners.splice(0).forEach(function (fn) { try { fn(api); } catch (e) { console.error(e); } });
    if (status.errors.length) console.warn("Модули адаптации: проблемы", status.errors);
  }

  function start() {
    var A = window.RecomposeCore && window.RecomposeCore.adaptation;
    var man = window.PMS_ADAPTATION_MANIFEST;
    if (!A) { status.errors.push({ file: "recompose-core.js", errors: ["движок адаптации не загружен"] }); return finish(); }
    A.setApp(APP);
    if (!man) {
      status.errors.push({ file: "adaptation-modules/manifest.js", errors: ["манифест не найден: запустите node tools/build-adaptation-manifest.js"] });
      return finish();
    }
    (man.errors || []).forEach(function (x) { status.errors.push({ file: x.folder, errors: x.errors }); });
    // дубликаты библиотек не загружаем повторно (защита от двойного подключения)
    var seen = Object.create(null);
    var chain = Promise.resolve();
    (man.libraries || []).forEach(function (l) {
      if (seen[l.rel]) return; seen[l.rel] = true;
      chain = chain.then(function () { return loadScript(l.rel).then(function (ok) { if (ok) status.libraries.push(l.rel); }); });
    });
    (man.modules || []).forEach(function (m) {
      chain = chain.then(function () {
        return loadScript(m.rel).then(function (ok) {
          if (!ok) return;
          var r = A.register(m.descriptor);      // валидация дескриптора и кода (engineApi, форматы, implement)
          if (r.ok) status.modules.push(m.descriptor.id);
        });
      });
    });
    chain.then(finish);
  }

  var api = {
    ready: readyPromise,
    onReady: function (fn) { if (status.ready) fn(api); else listeners.push(fn); },
    isReady: function () { return status.ready; },
    modules: function () { return status.modules.slice(); },
    libraries: function () { return status.libraries.slice(); },
    errors: function () {
      var A = window.RecomposeCore && window.RecomposeCore.adaptation;
      return status.errors.concat(A ? A.errors() : []);
    }
  };
  window.PMS_ADAPTATION_LOADER = api;

  // все скрипты поставщиков (engine, manifest) уже подключены до этого файла
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
