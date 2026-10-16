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
    ipcRenderer.invoke('pms:list-template-sources')
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
      files.push({ relativePath, content: await fsp.readFile(full, 'utf8') });
    } catch (error) {
      files.push({ relativePath, error: String(error && error.message || error) });
    }
  }
  return { files, warnings };
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
