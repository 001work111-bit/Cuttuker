const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const HTML_FILE = "Sandbox_Content.html";

function createWindow() {
  const htmlPath = path.join(__dirname, HTML_FILE);

  if (!fs.existsSync(htmlPath)) {
    const { dialog } = require("electron");
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
      // Безопасные значения по умолчанию. Не включайте nodeIntegration
      // для HTML-шаблонов и сторонних библиотек.
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  win.loadFile(htmlPath);

  // Внешние ссылки открываем в системном браузере, а не внутри приложения.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    const currentFileUrl = `file://${htmlPath.replace(/\\/g, "/")}`;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
