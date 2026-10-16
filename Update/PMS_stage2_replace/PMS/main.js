'use strict';

const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { fileURLToPath } = require('node:url');

// main.js должен лежать в корне проекта рядом с index.html и package.json.
const PROJECT_ROOT = app.getAppPath();
const INDEX_PATH = path.join(PROJECT_ROOT, 'index.html');
const APP_TITLE = 'Pano Montage Studio';

let mainWindow = null;

// Создаём preload из встроенного шаблона, чтобы для первоначального запуска
// хватило двух файлов: main.js и package.json. Файл хранится в userData,
// а не рядом с исходниками приложения.
const PRELOAD_SOURCE = String.raw`'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('PMS_ELECTRON', Object.freeze({
  writeTextFile: (relativePath, content) =>
    ipcRenderer.invoke('pms:write-text-file', relativePath, content),
  listTemplateSources: () =>
    ipcRenderer.invoke('pms:list-template-sources'),
  addTemplateFiles: () =>
    ipcRenderer.invoke('pms:add-template-files'),
  deleteTemplateSource: (relativePath) =>
    ipcRenderer.invoke('pms:delete-template-source', relativePath),
  saveInspectorLog: (kind, content) =>
    ipcRenderer.invoke('pms:save-inspector-log', kind, content),
  getAppInfo: () =>
    ipcRenderer.invoke('pms:app-info')
}));
`;

function createRuntimePreload() {
  const runtimeDir = path.join(app.getPath('userData'), 'runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const preloadPath = path.join(runtimeDir, 'pms-preload.js');
  fs.writeFileSync(preloadPath, PRELOAD_SOURCE, 'utf8');
  return preloadPath;
}

function isTrustedAppPage(senderUrl) {
  try {
    const parsed = new URL(senderUrl);
    if (parsed.protocol !== 'file:') return false;
    return path.resolve(fileURLToPath(parsed)) === path.resolve(INDEX_PATH);
  } catch {
    return false;
  }
}

// Приложение использует этот мост для сохранения пользовательских шаблонов.
// Разрешаем записывать только templates/user.js, чтобы страница не могла
// использовать IPC для произвольной записи файлов на компьютере.
ipcMain.handle('pms:write-text-file', async (event, relativePath, content) => {
  const senderUrl = event.senderFrame?.url || event.sender.getURL();
  if (!isTrustedAppPage(senderUrl)) {
    throw new Error('Запись разрешена только из главного окна приложения.');
  }

  if (typeof relativePath !== 'string' || typeof content !== 'string') {
    throw new TypeError('Ожидались путь к файлу и текстовое содержимое.');
  }

  const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\.\//, '');
  if (normalizedPath !== 'templates/user.js') {
    throw new Error('Разрешено сохранять только templates/user.js.');
  }

  const targetPath = path.join(PROJECT_ROOT, 'templates', 'user.js');
  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  await fsp.writeFile(targetPath, content, 'utf8');
  return { ok: true };
});

// Чтение библиотек шаблонов: templates/ рекурсивно, только *.js и *.json.
// Renderer получает список файлов с содержимым, но не произвольный доступ к диску.
const TEMPLATE_SOURCE_MAX_BYTES = 20 * 1024 * 1024;
const TEMPLATE_SOURCE_MAX_TOTAL_BYTES = 32 * 1024 * 1024;
const TEMPLATE_SOURCE_MAX_FILES = 500;

async function collectTemplateSourcePaths(dir, rootReal, out) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (out.length >= TEMPLATE_SOURCE_MAX_FILES) break;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      await collectTemplateSourcePaths(full, rootReal, out);
    } else if (entry.isFile() && /\.(js|json)$/i.test(entry.name)) {
      const real = await fsp.realpath(full);
      if (real === rootReal || real.startsWith(rootReal + path.sep)) out.push(full);
    }
  }
  return out;
}

ipcMain.handle('pms:list-template-sources', async (event) => {
  const senderUrl = event.senderFrame?.url || event.sender.getURL();
  if (!isTrustedAppPage(senderUrl)) {
    throw new Error('Чтение библиотек разрешено только из главного окна приложения.');
  }
  const root = path.join(PROJECT_ROOT, 'templates');
  if (!fs.existsSync(root)) return { files: [], warnings: [] };
  // Сам каталог templates/ не может быть символьной ссылкой (граница доверия).
  if ((await fsp.lstat(root)).isSymbolicLink()) {
    throw new Error('templates/ является символьной ссылкой — чтение отключено.');
  }
  const rootReal = await fsp.realpath(root);
  const warnings = [];
  const collected = await collectTemplateSourcePaths(root, rootReal, []);
  if (collected.length >= TEMPLATE_SOURCE_MAX_FILES) {
    warnings.push(`Достигнут лимит ${TEMPLATE_SOURCE_MAX_FILES} файлов; остальные не прочитаны.`);
  }
  const paths = collected.sort();
  const files = [];
  let totalBytes = 0;
  for (const full of paths) {
    const relativePath = path.relative(PROJECT_ROOT, full).split(path.sep).join('/');
    try {
      // Повторная проверка границы непосредственно перед чтением (защита от подмены после обхода).
      const real = await fsp.realpath(full);
      if (!(real.startsWith(rootReal + path.sep))) {
        files.push({ relativePath, error: 'Файл вне templates/ — пропущен.' });
        continue;
      }
      const stat = await fsp.stat(full);
      if (stat.size > TEMPLATE_SOURCE_MAX_BYTES) {
        files.push({ relativePath, error: 'Файл больше 20 МБ, пропущен.' });
        continue;
      }
      if (totalBytes + stat.size > TEMPLATE_SOURCE_MAX_TOTAL_BYTES) {
        files.push({ relativePath, error: 'Превышен суммарный лимит чтения за обновление (32 МБ), файл не прочитан.' });
        continue;
      }
      totalBytes += stat.size;
      files.push({ relativePath, size: stat.size, content: await fsp.readFile(full, 'utf8') });
    } catch (error) {
      files.push({ relativePath, error: String(error && error.message || error) });
    }
  }
  return { files, warnings };
});

// ---- Инспектор библиотек: добавление, удаление источника, сохранение лога ----
// Все операции — только внутри templates/, только *.js/*.json, с проверкой отправителя и символьных ссылок.
const IMPORT_SUBDIR = 'imported';
const ADD_MAX_FILES = 50;
const LOG_MAX_CHARS = 8 * 1024 * 1024;

function assertTrustedSender(event, message) {
  const senderUrl = event.senderFrame?.url || event.sender.getURL();
  if (!isTrustedAppPage(senderUrl)) throw new Error(message);
}

function templatesRootOrThrow() {
  const root = path.join(PROJECT_ROOT, 'templates');
  if (!fs.existsSync(root)) throw new Error('Каталог templates/ не найден.');
  const st = fs.lstatSync(root);
  if (st.isSymbolicLink() || !st.isDirectory()) {
    throw new Error('templates/ — символьная ссылка или не каталог: операция отключена.');
  }
  return { root, rootReal: fs.realpathSync(root) };
}

// Безопасное имя: только базовое имя, без путей и служебных символов; расширение js/json.
function safeTemplateFileName(name) {
  let base = path.basename(String(name || '')).replace(/[^\p{L}\p{N}._ -]+/gu, '_').replace(/^[. ]+/, '');
  if (!/\.(js|json)$/i.test(base) || base.length > 120) return null;
  if (/^user\.js$/i.test(base)) return null; // имя зарезервировано для пользовательского слоя
  return base;
}

function uniqueNameIn(dir, name) {
  const ext = path.extname(name);
  const stem = name.slice(0, name.length - ext.length);
  let n = 2;
  let candidate = `${stem}_${n}${ext}`;
  while (fs.existsSync(path.join(dir, candidate))) candidate = `${stem}_${++n}${ext}`;
  return candidate;
}

ipcMain.handle('pms:app-info', async (event) => {
  assertTrustedSender(event, 'Сведения о приложении доступны только из главного окна.');
  return { version: app.getVersion(), electron: process.versions.electron };
});

ipcMain.handle('pms:add-template-files', async (event) => {
  assertTrustedSender(event, 'Добавление файлов разрешено только из главного окна приложения.');
  const { root, rootReal } = templatesRootOrThrow();
  const picked = await dialog.showOpenDialog(mainWindow, {
    title: 'Добавить файлы библиотек',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Библиотеки шаблонов', extensions: ['js', 'json'] }]
  });
  if (picked.canceled || !picked.filePaths.length) return { canceled: true, added: [], replaced: [], copied: [], skipped: [], errors: [] };
  if (picked.filePaths.length > ADD_MAX_FILES) throw new Error(`За один раз можно добавить не более ${ADD_MAX_FILES} файлов.`);

  const importDir = path.join(root, IMPORT_SUBDIR);
  await fsp.mkdir(importDir, { recursive: true });
  if ((await fsp.lstat(importDir)).isSymbolicLink()) throw new Error('templates/imported — символьная ссылка: операция отключена.');

  const result = { canceled: false, added: [], replaced: [], copied: [], skipped: [], errors: [] };
  for (const src of picked.filePaths) {
    const displayName = path.basename(src);
    try {
      const st = await fsp.lstat(src);
      if (st.isSymbolicLink() || !st.isFile()) {
        result.errors.push({ file: displayName, error: 'Не обычный файл (символьные ссылки не поддерживаются).' });
        continue;
      }
      if (st.size > TEMPLATE_SOURCE_MAX_BYTES) {
        result.errors.push({ file: displayName, error: 'Файл больше 20 МБ, не добавлен.' });
        continue;
      }
      const name = safeTemplateFileName(displayName);
      if (!name) {
        result.errors.push({ file: displayName, error: 'Недопустимое имя или расширение (нужно .js/.json; имя user.js зарезервировано).' });
        continue;
      }
      const relDir = `templates/${IMPORT_SUBDIR}`;
      let finalName = name;
      let mode = 'added';
      const target = path.join(importDir, name);
      if (fs.existsSync(target)) {
        if ((await fsp.lstat(target)).isSymbolicLink()) {
          result.errors.push({ file: displayName, error: 'Цель — символьная ссылка, не перезаписывается.' });
          continue;
        }
        const choice = await dialog.showMessageBox(mainWindow, {
          type: 'question',
          title: 'Файл уже существует',
          message: `${relDir}/${name} уже существует.`,
          detail: 'Заменить файл или сохранить новый файл с безопасным именем?',
          buttons: ['Заменить', 'Сохранить копией', 'Пропустить', 'Отмена'],
          defaultId: 1,
          cancelId: 3
        });
        if (choice.response === 3) { result.canceled = true; break; }
        if (choice.response === 2) { result.skipped.push({ file: displayName, reason: 'пропущен пользователем' }); continue; }
        if (choice.response === 1) { finalName = uniqueNameIn(importDir, name); mode = 'copied'; }
        else mode = 'replaced';
      }
      const dest = path.join(importDir, finalName);
      await fsp.copyFile(src, dest);
      const real = await fsp.realpath(dest);
      if (!real.startsWith(rootReal + path.sep)) {
        await fsp.unlink(dest).catch(() => {});
        throw new Error('Результат вне templates/ — отменено.');
      }
      const rel = `${relDir}/${finalName}`;
      result[mode].push(rel);
      result.added.push(rel);
    } catch (error) {
      result.errors.push({ file: displayName, error: String(error && error.message || error) });
    }
  }
  return result;
});

ipcMain.handle('pms:delete-template-source', async (event, relativePath) => {
  assertTrustedSender(event, 'Удаление разрешено только из главного окна приложения.');
  if (typeof relativePath !== 'string') throw new TypeError('Ожидался относительный путь к файлу.');
  const rel = relativePath.replace(/\\/g, '/');
  const segments = rel.split('/');
  if (segments.some((seg) => seg === '' || seg === '.' || seg === '..')) throw new Error('Недопустимый путь.');
  if (!rel.startsWith('templates/')) throw new Error('Удалять можно только файлы внутри templates/.');
  if (!/\.(js|json)$/i.test(rel)) throw new Error('Удалять можно только .js и .json.');
  if (/(^|\/)user\.js$/i.test(rel)) throw new Error('templates/user.js защищён и не удаляется.');
  const { rootReal } = templatesRootOrThrow();
  const full = path.join(PROJECT_ROOT, ...segments);
  const st = await fsp.lstat(full);
  if (st.isSymbolicLink()) throw new Error('Символьные ссылки не удаляются.');
  if (!st.isFile()) throw new Error('Цель не является файлом.');
  const real = await fsp.realpath(full);
  if (!real.startsWith(rootReal + path.sep)) throw new Error('Файл вне templates/ — отменено.');
  const choice = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'Удалить источник',
    message: `Удалить файл ${rel}?`,
    detail: 'Файл будет удалён с диска. Шаблоны, которые поступают из других источников, останутся.',
    buttons: ['Удалить', 'Отмена'],
    defaultId: 1,
    cancelId: 1
  });
  if (choice.response !== 0) return { ok: false, canceled: true };
  await fsp.unlink(full);
  return { ok: true };
});

ipcMain.handle('pms:save-inspector-log', async (event, kind, content) => {
  assertTrustedSender(event, 'Сохранение лога разрешено только из главного окна приложения.');
  if (kind !== 'short' && kind !== 'full') throw new TypeError('Неизвестный вид лога.');
  if (typeof content !== 'string' || content.length > LOG_MAX_CHARS) throw new Error('Лог пустой или слишком большой.');
  const ext = kind === 'full' ? 'json' : 'txt';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const picked = await dialog.showSaveDialog(mainWindow, {
    title: kind === 'full' ? 'Сохранить полный лог библиотек' : 'Сохранить краткий лог библиотек',
    defaultPath: path.join(app.getPath('downloads'), `pms-libraries-${kind}-${stamp}.${ext}`),
    filters: [{ name: kind === 'full' ? 'JSON' : 'Текст', extensions: [ext] }]
  });
  if (picked.canceled || !picked.filePath) return { saved: false };
  const target = picked.filePath.toLowerCase().endsWith('.' + ext) ? picked.filePath : picked.filePath + '.' + ext;
  await fsp.writeFile(target, content, 'utf8');
  return { saved: true, path: target };
});

async function createWindow() {
  if (!fs.existsSync(INDEX_PATH)) {
    dialog.showErrorBox(
      'Не найден index.html',
      `Не удалось найти файл приложения:\n${INDEX_PATH}\n\nПроверьте, что main.js находится в корне проекта рядом с index.html.`
    );
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    title: APP_TITLE,
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#101318',
    webPreferences: {
      preload: createRuntimePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow && mainWindow.show());

  // Внешние HTTP(S)-ссылки открываем системным браузером, не внутри приложения.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        void shell.openExternal(url);
      }
    } catch {
      // Некорректные адреса игнорируются.
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!isTrustedAppPage(navigationUrl)) {
      event.preventDefault();
      try {
        const parsed = new URL(navigationUrl);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          void shell.openExternal(navigationUrl);
        }
      } catch {
        // Некорректные адреса игнорируются.
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await mainWindow.loadFile(INDEX_PATH);
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('Не удалось запустить Pano Montage Studio:', error);
  dialog.showErrorBox('Ошибка запуска', String(error?.stack || error));
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
