#!/usr/bin/env node
/* ============================================================
   tools/build-adaptation-manifest.js
   ------------------------------------------------------------
   Пишет adaptation-modules/manifest.js — список библиотеки для Pano (browser, file://).

   Правила обхода — точный порт Sandbox (main.js: scanFolder и блок adaptation в buildManifest):
     • папки с «_» (например _shared) — общие библиотеки: рекурсивно, только *.js, без регистрации;
     • остальные папки верхнего уровня — модули: нужны module.json (объект JSON) и module.js;
     • имена с «.» пропускаются, файлы верхнего уровня игнорируются;
     • порядок — localeCompare, как в Sandbox; глубина до 8, лимит 20000 файлов.
   Формат записи совпадает с Sandbox: libraries[{rel}], modules[{folder, rel, descriptor}], errors, unsupported.
   Код модулей здесь не читается и не выполняется.

   Использование:
     node tools/build-adaptation-manifest.js
         — пересобрать adaptation-modules/manifest.js
     node tools/build-adaptation-manifest.js --verify <путь/к/Sandbox>
         — проверить побайтно: recompose-core.js и все файлы adaptation-modules (кроме manifest.js)
           совпадают с Sandbox; выход 1 при расхождении.
   Сверка манифеста с самим Sandbox.buildManifest: tests/adaptation/check-manifest-vs-sandbox.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ADAPT_DIR = "adaptation-modules";
const MODULES = path.join(ROOT, ADAPT_DIR);
const ENGINE = path.join(ROOT, "js", "adaptation", "recompose-core.js");
const LIBRARY_EXT = new Set([".js"]);
const MAX_DEPTH = 8;
const MAX_FILES = 20000;

// точный порт scanFolder из Sandbox/main.js
function scanFolder(root, extSet) {
  const result = { files: [], unsupported: [], errors: [] };
  const seenDirs = new Set(), seenFiles = new Set();
  function walk(dir, depth) {
    if (depth > MAX_DEPTH || result.files.length >= MAX_FILES) return;
    let realDir;
    try { realDir = fs.realpathSync(dir); }
    catch (e) { result.errors.push(`${path.relative(root, dir) || "."}: ${e.code || e.message}`); return; }
    if (seenDirs.has(realDir)) return;
    seenDirs.add(realDir);
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch (e) { result.errors.push(`${path.relative(root, dir) || "."}: ${e.code || e.message}`); return; }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      let stat;
      try { stat = fs.statSync(full); }
      catch (e) { result.errors.push(`${path.relative(root, full)}: недоступен (${e.code || e.message})`); continue; }
      if (stat.isDirectory()) { walk(full, depth + 1); continue; }
      if (!stat.isFile()) continue;
      let realFile;
      try { realFile = fs.realpathSync(full); } catch (e) { continue; }
      if (seenFiles.has(realFile)) continue;
      seenFiles.add(realFile);
      const rel = path.relative(root, full).split(path.sep).join("/");
      const ext = path.extname(entry.name).toLowerCase();
      if (extSet.has(ext)) result.files.push({ abs: full, rel, ext, size: stat.size });
      else result.unsupported.push(rel);
    }
  }
  walk(root, 0);
  return result;
}

// точный порт блока adaptation из buildManifest (Sandbox/main.js)
function buildAdaptation(rootDir) {
  const out = { path: ADAPT_DIR, exists: false, libraries: [], modules: [], errors: [], unsupported: [] };
  const base = path.join(rootDir, ADAPT_DIR);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return out;
  out.exists = true;
  const entries = fs.readdirSync(base, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .sort((x, y) => x.name.localeCompare(y.name));
  for (const e of entries) {
    const full = path.join(base, e.name);
    if (!e.isDirectory()) {
      // manifest.js — выходной файл этого инструмента (в Sandbox его нет), в список не попадает
      if (e.name !== "manifest.js") out.unsupported.push(e.name);
      continue;
    }
    if (e.name.startsWith("_")) {
      const scan = scanFolder(full, LIBRARY_EXT);
      scan.files.sort((x, y) => x.rel.localeCompare(y.rel))
        .forEach((f) => out.libraries.push({ rel: e.name + "/" + path.relative(full, f.abs).split(path.sep).join("/") }));
      continue;
    }
    const jsonPath = path.join(full, "module.json");
    const codePath = path.join(full, "module.js");
    if (!fs.existsSync(jsonPath)) { out.errors.push({ folder: e.name, errors: ["нет module.json (описание модуля)"] }); continue; }
    let descriptor;
    try { descriptor = JSON.parse(fs.readFileSync(jsonPath, "utf8")); }
    catch (err) { out.errors.push({ folder: e.name, errors: ["module.json: ошибка разбора JSON — " + (err.message || err)] }); continue; }
    if (!descriptor || typeof descriptor !== "object" || Array.isArray(descriptor)) {
      out.errors.push({ folder: e.name, errors: ["module.json: должен быть объект"] }); continue;
    }
    if (!fs.existsSync(codePath)) {
      out.errors.push({ folder: e.name, id: descriptor.id, errors: ["нет module.js (код модуля)"] }); continue;
    }
    out.modules.push({ folder: e.name, rel: e.name + "/module.js", descriptor });
  }
  return out;
}

function build() {
  const adaptation = buildAdaptation(ROOT);
  const body = "/* Сгенерировано tools/build-adaptation-manifest.js — не редактировать вручную. */\n" +
    "window.PMS_ADAPTATION_MANIFEST = " + JSON.stringify(adaptation, null, 2) + ";\n";
  fs.writeFileSync(path.join(MODULES, "manifest.js"), body, "utf8");
  console.log("manifest.js: библиотек " + adaptation.libraries.length + ", модулей " + adaptation.modules.length +
    " (" + adaptation.modules.map((m) => m.descriptor.id || m.folder).join(", ") + ")");
  adaptation.errors.forEach((e) => console.warn("  ВНИМАНИЕ " + e.folder + ": " + e.errors.join("; ")));
  return 0;
}

// побайтная проверка: файлы библиотеки и движок совпадают с Sandbox
function listLibraryFiles(dir) {
  const out = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    if (e.name.startsWith(".")) return;
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name !== "manifest.js") out.push(path.relative(dir, f).split(path.sep).join("/"));
  });
  walk(dir);
  return out.sort();
}
function verify(sandboxDir) {
  const sbLib = path.join(sandboxDir, ADAPT_DIR);
  const pairs = [[ENGINE, path.join(sandboxDir, "recompose-core.js"), "js/adaptation/recompose-core.js"]];
  const files = listLibraryFiles(MODULES);
  files.forEach((rel) => pairs.push([path.join(MODULES, rel), path.join(sbLib, rel), ADAPT_DIR + "/" + rel]));
  const sbFiles = listLibraryFiles(sbLib);
  let bad = 0;
  for (const [mine, theirs, label] of pairs) {
    if (!fs.existsSync(theirs)) { console.log("НЕТ В SANDBOX  " + label); bad++; continue; }
    const same = fs.readFileSync(mine).equals(fs.readFileSync(theirs));
    console.log((same ? "совпадает      " : "РАСХОЖДЕНИЕ    ") + label);
    if (!same) bad++;
  }
  sbFiles.filter((rel) => !files.includes(rel)).forEach((rel) => { console.log("ТОЛЬКО В SANDBOX " + ADAPT_DIR + "/" + rel); bad++; });
  console.log(bad ? "Синхронизация НЕ пройдена: " + bad : "Синхронизация с Sandbox пройдена (" + pairs.length + " файлов)");
  return bad ? 1 : 0;
}

if (require.main === module) {
  const vi = process.argv.indexOf("--verify");
  process.exitCode = vi >= 0 ? verify(path.resolve(process.argv[vi + 1] || "")) : build();
}
module.exports = { scanFolder, buildAdaptation };
