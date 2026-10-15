const { app, BrowserWindow, shell, nativeImage, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const http = require("node:http");

const HTML_FILE = "Sandbox_Content.html";
const POOL_DIR = "ImagePool";       // основной пул по умолчанию
const TEMPLATES_DIR = "Templates";  // библиотеки шаблонов *.js
const SOURCES_FILE = "pool-sources.json"; // список основного и дополнительных источников
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const LIBRARY_EXT = new Set([".js"]);
const ADAPT_DIR = "adaptation-modules"; // модули адаптации: adaptation-modules/<id>/module.js
const MAX_DEPTH = 8;
const MAX_FILES = 20000;

/* ---------- Обход папки (симлинки и повторы учитываются по realpath) ---------- */
function scanFolder(root, extSet) {
  const result = { files: [], unsupported: [], errors: [] };
  const seenDirs = new Set();
  const seenFiles = new Set();

  function walk(dir, depth) {
    if (depth > MAX_DEPTH || result.files.length >= MAX_FILES) return;
    let realDir;
    try {
      realDir = fs.realpathSync(dir);
    } catch (e) {
      result.errors.push(`${path.relative(root, dir) || "."}: ${e.code || e.message}`);
      return;
    }
    if (seenDirs.has(realDir)) return;
    seenDirs.add(realDir);

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      result.errors.push(`${path.relative(root, dir) || "."}: ${e.code || e.message}`);
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch (e) {
        result.errors.push(`${path.relative(root, full)}: недоступен (${e.code || e.message})`);
        continue;
      }
      if (stat.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!stat.isFile()) continue;

      let realFile;
      try {
        realFile = fs.realpathSync(full);
      } catch (e) {
        continue;
      }
      if (seenFiles.has(realFile)) continue;
      seenFiles.add(realFile);

      const rel = path.relative(root, full).split(path.sep).join("/");
      const ext = path.extname(entry.name).toLowerCase();
      if (extSet.has(ext)) {
        result.files.push({ abs: full, rel, ext, size: stat.size });
      } else {
        result.unsupported.push(rel);
      }
    }
  }

  walk(root, 0);
  return result;
}

function imageSize(abs) {
  try {
    const img = nativeImage.createFromPath(abs);
    if (img.isEmpty()) return { width: null, height: null };
    const s = img.getSize();
    return { width: s.width || null, height: s.height || null };
  } catch (e) {
    return { width: null, height: null };
  }
}

/* ---------- Источники пула: основной и дополнительные ---------- */
function readSources(appDir) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(appDir, SOURCES_FILE), "utf8"));
    return {
      main: d.main && d.main.path ? { path: String(d.main.path) } : null,
      extra: Array.isArray(d.extra) ? d.extra.filter((e) => e && e.path) : []
    };
  } catch (e) {
    return { main: null, extra: [] };
  }
}

function writeSources(appDir, data) {
  const file = path.join(appDir, SOURCES_FILE);
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file); // атомарная замена, чтобы не испортить файл при сбое
}

function realOrNull(p) {
  try { return fs.realpathSync(p); } catch (e) { return null; }
}

/* Сканирует все включённые источники. Одинаковые файлы (по realpath) учитываются один раз. */
function buildImagePool(appDir) {
  const cfg = readSources(appDir);
  const list = [
    { id: "main", kind: "main", path: cfg.main ? cfg.main.path : path.join(appDir, POOL_DIR), enabled: true },
    ...cfg.extra.map((e, i) => ({ id: e.id || `x${i}`, kind: "extra", path: e.path, enabled: e.enabled !== false }))
  ];
  const sources = [];
  const files = [];
  const unsupported = [];
  const errors = [];
  const seenReal = new Set();

  list.forEach((src) => {
    const rec = { id: src.id, kind: src.kind, path: src.path, enabled: src.enabled, status: "", count: 0 };
    sources.push(rec);
    if (!src.enabled) { rec.status = "off"; return; }
    if (!fs.existsSync(src.path) || !fs.statSync(src.path).isDirectory()) {
      rec.status = "missing";
      errors.push(`${src.path}: папка не найдена`);
      return;
    }
    rec.status = "ok";
    const scan = scanFolder(src.path, IMAGE_EXT);
    scan.errors.forEach((e) => errors.push(`${path.basename(src.path)}: ${e}`));
    scan.unsupported.forEach((x) => unsupported.push(`${path.basename(src.path)}/${x}`));
    scan.files.forEach((f) => {
      const real = realOrNull(f.abs);
      if (!real || seenReal.has(real)) return; // дубликат или ссылка на уже учтённый файл
      seenReal.add(real);
      rec.count++;
      files.push({
        fileUrl: pathToFileURL(f.abs).href,
        rel: f.rel,
        ext: f.ext,
        size: f.size,
        source: src.id,
        sourceKind: src.kind,
        sourceName: path.basename(src.path),
        ...imageSize(f.abs)
      });
    });
  });

  let state = "ready";
  if (sources.some((s) => s.status === "missing") || errors.length) state = "error";
  if (!files.length && state !== "error") state = "empty";

  return {
    path: sources[0].path,
    exists: sources[0].status !== "missing",
    files,
    unsupported,
    errors,
    sources,
    state,
    mainCount: files.filter((f) => f.sourceKind === "main").length,
    extraCount: files.filter((f) => f.sourceKind === "extra").length
  };
}

/* ---------- Действия из страницы: sbaction://<имя>?id=... ---------- */
function copyFolderNoOverwrite(src, dest) {
  let copied = 0;
  fs.mkdirSync(dest, { recursive: true });
  const walk = (from, to) => {
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const a = path.join(from, entry.name);
      const b = path.join(to, entry.name);
      if (entry.isSymbolicLink()) continue; // ссылки не копируем
      if (entry.isDirectory()) {
        fs.mkdirSync(b, { recursive: true });
        walk(a, b);
      } else if (entry.isFile() && !fs.existsSync(b)) {
        fs.copyFileSync(a, b);
        copied++;
      }
    }
  };
  walk(src, dest);
  return copied;
}

async function runAction(url, deps) {
  const u = new URL(url);
  const name = u.hostname || u.pathname.replace(/^\//, "");
  const id = u.searchParams.get("id");
  const appDir = deps.appDir;
  const cfg = readSources(appDir);
  let message = "";

  if (name === "pick-main") {
    const p = await deps.pickFolder("Выберите основную папку с изображениями");
    if (!p) return { message: "", imagePool: buildImagePool(appDir) };
    cfg.main = { path: p };
    writeSources(appDir, cfg);
    message = `Основной пул: ${p}`;
  } else if (name === "add-extra") {
    const p = await deps.pickFolder("Выберите папку, которую добавить к пулу");
    if (!p) return { message: "", imagePool: buildImagePool(appDir) };
    const real = realOrNull(p);
    const mainPath = cfg.main ? cfg.main.path : path.join(appDir, POOL_DIR);
    const taken = [mainPath, ...cfg.extra.map((e) => e.path)].some((x) => realOrNull(x) === real);
    if (taken) {
      message = "Эта папка уже подключена";
    } else {
      cfg.extra.push({ id: "x" + Date.now().toString(36), path: p, enabled: true });
      writeSources(appDir, cfg);
      message = `Добавлено: ${p}`;
    }
  } else if (name === "toggle-extra") {
    const e = cfg.extra.find((x) => x.id === id);
    if (e) {
      e.enabled = !e.enabled;
      writeSources(appDir, cfg);
      message = e.enabled ? "Источник включён" : "Источник отключён (файлы на диске не тронуты)";
    }
  } else if (name === "import") {
    const p = await deps.pickFolder("Выберите папку, которую скопировать в проект");
    if (!p) return { message: "", imagePool: buildImagePool(appDir) };
    const dest = path.join(appDir, POOL_DIR, path.basename(p));
    const n = copyFolderNoOverwrite(p, dest);
    message = `Скопировано в проект: ${n} файлов (существующие не перезаписаны)`;
  } else if (name === "rescan") {
    message = "Пул обновлён";
  } else {
    message = `Неизвестное действие: ${name}`;
  }
  return { message, imagePool: buildImagePool(appDir) };
}


/* ---------- Хранение состояния: файл sandbox-state.json рядом с программой ---------- */
const STATE_FILE = "sandbox-state.json";
const STATE_PORT = 47613;

function readState(appDir) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(appDir, STATE_FILE), "utf8"));
    return d && typeof d === "object" ? d : {};
  } catch (e) {
    return {};
  }
}

function writeStateFile(appDir, obj) {
  const file = path.join(appDir, STATE_FILE);
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj), "utf8");
  fs.renameSync(tmp, file);
}

/* Локальный сервер: страница читает состояние при открытии (GET /state) и пишет изменения (POST /state).
   Слушает только 127.0.0.1. Если порт занят, второй экземпляр программы не запускается. */
function startStateServer(appDir, port = STATE_PORT) {
  let cache = readState(appDir);
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    if (req.url === "/state" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(cache));
    }
    if (req.url === "/state" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => { body += c; if (body.length > 100e6) req.destroy(); });
      req.on("end", () => {
        try {
          const d = JSON.parse(body);
          Object.keys(d.set || {}).forEach((k) => { cache[k] = String(d.set[k]); });
          (d.remove || []).forEach((k) => { delete cache[k]; });
          writeStateFile(appDir, cache);
          res.writeHead(200);
          res.end("ok");
        } catch (e) {
          res.writeHead(500);
          res.end(String(e.message || e));
        }
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

/* ---------- Манифест и передача на страницу ---------- */
/* Модули адаптации: adaptation-modules/<папка>/module.json (описание, читается как JSON)
   и module.js (код, подключается в окне). Папки с «_» — общие библиотеки без регистрации.
   Код модуля в главном процессе НЕ выполняется. Ошибки папки не останавливают остальные. */
function scanAdaptation(rootDir) {
  const out = { path: ADAPT_DIR, exists: false, libraries: [], modules: [], errors: [], unsupported: [] };
  const base = path.join(rootDir, ADAPT_DIR);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return out;
  out.exists = true;
  const entries = fs.readdirSync(base, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .sort((x, y) => x.name.localeCompare(y.name));
  for (const e of entries) {
    const full = path.join(base, e.name);
    if (!e.isDirectory()) { out.unsupported.push(e.name); continue; }
    if (e.name.startsWith("_")) {
      const scan = scanFolder(full, LIBRARY_EXT);
      scan.files.sort((x, y) => x.rel.localeCompare(y.rel)).forEach((f) =>
        out.libraries.push({ rel: e.name + "/" + f.rel, fileUrl: pathToFileURL(f.abs).href }));
      continue;
    }
    const jsonPath = path.join(full, "module.json");
    const codePath = path.join(full, "module.js");
    if (!fs.existsSync(jsonPath)) { out.errors.push({ folder: e.name, errors: ["нет module.json (описание модуля)"] }); continue; }
    let descriptor;
    try {
      descriptor = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    } catch (err) {
      out.errors.push({ folder: e.name, errors: ["module.json: ошибка разбора JSON — " + (err.message || err)] });
      continue;
    }
    if (!descriptor || typeof descriptor !== "object" || Array.isArray(descriptor)) {
      out.errors.push({ folder: e.name, errors: ["module.json: должен быть объект"] });
      continue;
    }
    if (!fs.existsSync(codePath)) {
      out.errors.push({ folder: e.name, id: descriptor.id, errors: ["нет module.js (код модуля)"] });
      continue;
    }
    out.modules.push({ folder: e.name, rel: e.name + "/module.js", descriptor, codeUrl: pathToFileURL(codePath).href });
  }
  return out;
}

function buildManifest(rootDir) {
  const manifest = {
    version: 2,
    mode: "electron",
    imagePool: buildImagePool(rootDir),
    templates: { path: TEMPLATES_DIR, exists: false, files: [], unsupported: [], errors: [] }
  };

  const templatesDir = path.join(rootDir, TEMPLATES_DIR);
  if (fs.existsSync(templatesDir) && fs.statSync(templatesDir).isDirectory()) {
    manifest.templates.exists = true;
    const scan = scanFolder(templatesDir, LIBRARY_EXT);
    manifest.templates.files = scan.files
      .sort((a, b) => a.rel.localeCompare(b.rel))
      .map((f) => ({ fileUrl: pathToFileURL(f.abs).href, rel: f.rel, size: f.size }));
    manifest.templates.unsupported = scan.unsupported;
    manifest.templates.errors = scan.errors;
  }
  manifest.adaptation = scanAdaptation(rootDir);
  return manifest;
}

/* Передача манифеста на страницу без preload и IPC: код выполняется в окне после загрузки. */
function sendManifest(win) {
  try {
    const manifest = buildManifest(__dirname);
    const code = `window.SB_POOL_MANIFEST=${JSON.stringify(manifest)};` +
      `window.dispatchEvent(new Event("sb-manifest"));`;
    win.webContents.executeJavaScript(code).catch((err) => {
      console.error("Sandbox: не удалось передать манифест пула", err);
    });
  } catch (err) {
    console.error("Sandbox: ошибка сканирования папок пула", err);
  }
}

/* Обновление только пула (без повторной загрузки библиотек). */
function pushPoolUpdate(win, res) {
  const payload = JSON.stringify({ imagePool: res.imagePool, message: res.message || "" });
  win.webContents.executeJavaScript(
    `window.SB_POOL_UPDATE=${payload};window.dispatchEvent(new Event("sb-pool-update"));`
  ).catch((err) => console.error("Sandbox: не удалось обновить пул", err));
}

async function handleAction(win, url) {
  const deps = {
    appDir: __dirname,
    pickFolder: (title) =>
      dialog.showOpenDialog(win, { title, properties: ["openDirectory"] })
        .then((r) => (r.canceled ? null : r.filePaths[0]))
  };
  let res;
  try {
    res = await runAction(url, deps);
  } catch (err) {
    res = { message: `Ошибка: ${err.message || err}`, imagePool: buildImagePool(__dirname) };
  }
  pushPoolUpdate(win, res);
}

function createWindow() {
  const htmlPath = path.join(__dirname, HTML_FILE);

  if (!fs.existsSync(htmlPath)) {
    dialog.showErrorBox(
      "Sandbox: файл не найден",
      `Не найден ${HTML_FILE}.\n\nПоложите main.js рядом с ${HTML_FILE} и запустите приложение снова.`
    );
    app.quit();
    return;
  }

  const win = new BrowserWindow({
    width: 1440,
    height: 950,
    minWidth: 900,
    minHeight: 650,
    title: "Sandbox — Template Studio",
    backgroundColor: "#171717",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  win.webContents.on("did-finish-load", () => sendManifest(win));
  win.loadFile(htmlPath);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("sbaction:")) {
      event.preventDefault();
      handleAction(win, url);
      return;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(async () => {
  try {
    await startStateServer(__dirname);
  } catch (err) {
    dialog.showErrorBox(
      "Sandbox уже запущен",
      "Вторая копия программы не запускается, чтобы не портить сохранённые данные.\n\nЗакройте открытую программу и запустите снова."
    );
    app.quit();
    return;
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

module.exports = { buildManifest, scanFolder, buildImagePool, runAction, readSources, writeSources, copyFolderNoOverwrite, startStateServer, readState, STATE_PORT };
