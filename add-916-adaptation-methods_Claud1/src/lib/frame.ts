import { docShell } from "./methods/shared";

export function downloadText(filename: string, content: string, mime = "text/html;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildExportDoc(title: string, bodyHtml: string, bg: string): string {
  return docShell(
    `<div style="min-height:100vh;display:flex;align-items:flex-start;justify-content:center;background:#e9e9ec;padding:32px;"><div style="box-shadow:0 20px 60px rgba(0,0,0,.25);">${bodyHtml}</div></div>`,
    bg
  ).replace("<head>", `<head><title>${title}</title>`);
}
