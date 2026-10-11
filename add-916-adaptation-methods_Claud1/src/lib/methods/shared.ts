// Общие вспомогательные функции для ВСЕХ методов (baseline + advanced).
// Сам по себе файл не содержит логики конкретного метода и не меняет
// поведение baseline-методов.
import { CANVAS_H, CANVAS_W, type Block } from "../types";

export const BASE_DOC_CSS = `
  :root{--pad:80px}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
  img{max-width:100%;display:block}
  .sv-canvas{position:relative;width:${CANVAS_W}px;min-height:${CANVAS_H}px;overflow:hidden}
`;

export function docShell(bodyHtml: string, bg = "#ffffff"): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_DOC_CSS}</style></head><body style="background:${bg}">${bodyHtml}</body></html>`;
}

export function pick(blocks: Block[], bucket: Block["bucket"]): Block[] {
  return blocks.filter((b) => b.bucket === bucket);
}

export function first(blocks: Block[], bucket: Block["bucket"]): Block | undefined {
  return blocks.find((b) => b.bucket === bucket);
}

export function rest(blocks: Block[], exclude: Block[]): Block[] {
  const ex = new Set(exclude.map((b) => b.key));
  return blocks.filter((b) => !ex.has(b.key));
}

// Оборачивает html-фрагмент в контейнер с собственными отступами
export function box(html: string, style = ""): string {
  return `<div style="${style}">${html}</div>`;
}

// Рендер медиа-блока с принудительным аспектом/высотой для вертикального кадра.
export function renderMedia(b: Block, styleOverride: string): string {
  // извлекаем url(...) из исходного background, чтобы не терять картинку
  const urlMatch = b.style.match(/url\(([^)]+)\)/);
  const bg = urlMatch ? `background:#e7e5e0 url(${urlMatch[1]}) center/cover no-repeat;` : "";
  const dataAttrsRaw = b.html.match(/<[a-zA-Z0-9]+((?:\s+[a-zA-Z0-9-:]+(?:="[^"]*")?)*)/)?.[1] || "";
  const dataAttrs = dataAttrsRaw.replace(/\sstyle="[^"]*"/, "");
  return `<div${dataAttrs} style="${bg}${styleOverride}"></div>`;
}

// Рендер текстового/мета-блока с сохранением data-атрибутов, но новым layout-стилем
export function renderText(b: Block, styleOverride: string): string {
  const openTagMatch = b.html.match(/^<([a-zA-Z0-9]+)([^>]*)>/);
  const tag = openTagMatch ? openTagMatch[1] : "div";
  const attrsRaw = openTagMatch ? openTagMatch[2] : "";
  // убираем старый style="..." из атрибутов, чтобы заменить своим
  const attrs = attrsRaw.replace(/\sstyle="[^"]*"/, "");
  return `<${tag}${attrs} style="${styleOverride}">${b.inner}</${tag}>`;
}

export function metaRow(blocks: Block[], styleOverride = ""): string {
  if (!blocks.length) return "";
  const items: string[] = [];
  for (let i = 0; i < blocks.length; i += 2) {
    const label = blocks[i];
    const value = blocks[i + 1];
    items.push(
      `<div style="display:flex;flex-direction:column;gap:4px;min-width:120px;">${renderText(
        label,
        "font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:inherit;opacity:.65;"
      )}${value ? renderText(value, "font-size:13px;color:inherit;") : ""}</div>`
    );
  }
  return `<div style="display:flex;flex-wrap:wrap;gap:20px;${styleOverride}">${items.join("")}</div>`;
}

export function tagRow(blocks: Block[]): string {
  if (!blocks.length) return "";
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;">${blocks
    .map((b) => renderText(b, "font-size:11px;border:1px solid currentColor;padding:4px 10px;border-radius:999px;opacity:.85;"))
    .join("")}</div>`;
}

export function repeatList(block: Block, styleOverride: string, itemStyle: string): string {
  if (!block.repeatItems) return "";
  const items = block.repeatItems
    .map((html) => `<div style="${itemStyle}">${stripLayout(html)}</div>`)
    .join("");
  return `<div style="${styleOverride}">${items}</div>`;
}

// Упрощённая зачистка укрупнённых grid-колонок внутри повторяемого ряда,
// чтобы строки из 3 колонок не ломали узкий кадр.
function stripLayout(html: string): string {
  return html.replace(/grid-template-columns:[^;]+;/gi, "grid-template-columns:44px 1fr;").replace(/font-size:\s*clamp\([^)]+\)/gi, "font-size:15px");
}

export function approxTextHeight(text: string, fontSize: number, width: number, lineHeight = 1.5): number {
  const charsPerLine = Math.max(6, Math.floor((width / (fontSize * 0.56))));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return Math.round(lines * fontSize * lineHeight);
}

export function textColorFor(bg: string): string {
  const hex = bg.match(/#([0-9a-f]{3,6})/i)?.[1];
  if (!hex) return "#15181f";
  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 110 ? "#f5f5f5" : "#15181f";
}

export { CANVAS_W, CANVAS_H };
