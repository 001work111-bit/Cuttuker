#!/usr/bin/env node
/* Сверка манифеста Pano с Sandbox.buildManifest (тот же код, что вызывает Electron).
   Использование: node tests/adaptation/check-manifest-vs-sandbox.js <путь/к/Sandbox>
   Sandbox не изменяется: main.js загружается в дочернем процессе с заглушкой модуля electron. */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");

const PANO = path.resolve(__dirname, "..", "..");
const SANDBOX = path.resolve(process.argv[2] || "");

function norm(a) {
  return {
    libraries: a.libraries.map((l) => l.rel),
    modules: a.modules.map((m) => ({ folder: m.folder, rel: m.rel, descriptor: m.descriptor })),
    errors: a.errors,
    unsupported: a.unsupported
  };
}

if (process.env.SB_CHILD === "1") {
  const sb = require(path.join(SANDBOX, "main.js"));
  const adaptation = sb.buildManifest(SANDBOX).adaptation;
  process.stdout.write(JSON.stringify(norm(adaptation)));
  process.exit(0);
}

const stub = fs.mkdtempSync(path.join(os.tmpdir(), "electron-stub-"));
fs.mkdirSync(path.join(stub, "node_modules", "electron"), { recursive: true });
fs.writeFileSync(path.join(stub, "node_modules", "electron", "index.js"),
  "module.exports={app:{whenReady:()=>new Promise(()=>{}),on(){},quit(){}},BrowserWindow:{getAllWindows:()=>[]},shell:{},nativeImage:{},dialog:{}};");
const child = spawnSync(process.execPath, [__filename, SANDBOX], {
  env: Object.assign({}, process.env, { SB_CHILD: "1", NODE_PATH: path.join(stub, "node_modules") }),
  encoding: "utf8", maxBuffer: 64 * 1024 * 1024
});
if (child.status !== 0) { console.error("Sandbox buildManifest: ошибка\n" + child.stderr); process.exit(1); }
const sbNorm = JSON.parse(child.stdout);
const { buildAdaptation } = require(path.join(PANO, "tools", "build-adaptation-manifest.js"));
const panoNorm = norm(buildAdaptation(PANO));

// манифест Pano должен записываться тем же JSON, что и проверяемый объект
const manText = fs.readFileSync(path.join(PANO, "adaptation-modules", "manifest.js"), "utf8");
const body = JSON.parse(manText.slice(manText.indexOf("{"), manText.lastIndexOf("}") + 1));
const fileNorm = norm(body);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let bad = 0;
[["библиотеки (rel)", "libraries"], ["модули (folder, rel, descriptor)", "modules"], ["ошибки", "errors"], ["unsupported", "unsupported"]].forEach(([label, key]) => {
  const ok = same(sbNorm[key], panoNorm[key]) && same(panoNorm[key], fileNorm[key]);
  console.log((ok ? "совпадает  " : "РАСХОЖДЕНИЕ ") + label + (ok ? "" : "\n  sandbox: " + JSON.stringify(sbNorm[key]) + "\n  pano:    " + JSON.stringify(panoNorm[key])));
  if (!ok) bad++;
});
console.log(bad ? "Манифест НЕ совпадает с Sandbox: " + bad : "Манифест Pano совпадает с Sandbox.buildManifest (модулей: " + sbNorm.modules.length + ", библиотек: " + sbNorm.libraries.length + ")");
process.exitCode = bad ? 1 : 0;
