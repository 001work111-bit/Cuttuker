import { FRAME } from "./types";

export const BASE_CSS = `
:root { --pad: 48px; --frame-w: ${FRAME.w}px; --frame-h: ${FRAME.h}px; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Inter, "Helvetica Neue", Arial, sans-serif; }
img, video { max-width: 100%; height: auto; display: block; object-fit: cover; }
.sv-section { width: 100%; }
.sv-inner { width: 100%; }
.sv-media { position: relative; overflow: hidden; }
.sv-media img, .sv-media video { width: 100%; height: 100%; object-fit: cover; }
`;

export function parseFragment(html: string): Document {
  return new DOMParser().parseFromString(
    `<!doctype html><html><head></head><body>${html}</body></html>`,
    "text/html"
  );
}

export function innerBody(doc: Document): string {
  return doc.body.innerHTML;
}

export function pickBg(doc: Document): string {
  const section = doc.querySelector("section, .sv-section, body") as HTMLElement | null;
  const bg = section?.style?.background || section?.style?.backgroundColor;
  return bg || "#ffffff";
}

export function pickColor(el: HTMLElement | null): string {
  return el?.style?.color || "";
}

export function buildDocument(bodyHtml: string, extraCss: string, width: number, bg = "#ffffff"): string {
  const pad = width >= 1200 ? 48 : 36;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${width}" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
<style>
${BASE_CSS}
:root { --pad: ${pad}px; }
html, body { width: ${width}px; background: ${bg}; }
${extraCss}
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export function cloneEl(el: Element): HTMLElement {
  return el.cloneNode(true) as HTMLElement;
}

export function applyMediaFill(el: HTMLElement, minHeight: number, aspect?: string) {
  el.style.width = "100%";
  el.style.minHeight = `${minHeight}px`;
  el.style.display = el.style.display || "flex";
  el.style.alignItems = el.style.alignItems || "center";
  el.style.justifyContent = el.style.justifyContent || "center";
  if (aspect) el.style.aspectRatio = aspect;
  else el.style.aspectRatio = "auto";
  el.style.flex = "1 1 auto";
  const media = el.querySelectorAll("img, video");
  media.forEach((m) => {
    const n = m as HTMLElement;
    n.style.width = "100%";
    n.style.height = "100%";
    n.style.objectFit = "cover";
  });
}

export function walk(el: Element, fn: (node: HTMLElement) => void) {
  if (el instanceof HTMLElement) fn(el);
  Array.from(el.children).forEach((c) => walk(c, fn));
}

export function flattenColumns(root: HTMLElement, keepIf?: (el: HTMLElement) => boolean) {
  walk(root, (el) => {
    if (keepIf?.(el)) return;
    const style = el.getAttribute("style") || "";
    if (/grid-template-columns\s*:/.test(style)) {
      el.style.gridTemplateColumns = "1fr";
      if (!/gap\s*:/.test(style)) el.style.gap = "16px";
    }
    if (/display\s*:\s*flex/.test(style) && /space-between|flex-end/.test(style) && !/flex-direction\s*:\s*column/.test(style)) {
      const children = el.children.length;
      if (children >= 2) {
        el.style.flexWrap = "wrap";
        el.style.gap = el.style.gap || "10px";
      }
    }
  });
}

export function tighten(root: HTMLElement, pad = "28px 24px") {
  const section = root.querySelector(".sv-section, section") as HTMLElement | null;
  if (section) {
    section.style.padding = pad;
  }
  walk(root, (el) => {
    const fs = el.style.fontSize;
    if (fs && /clamp\(/.test(fs)) {
      /* keep clamp — it already adapts */
    }
  });
}

export function uniqueNodes(nodes: HTMLElement[]): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const out: HTMLElement[] = [];
  for (const n of nodes) {
    if (seen.has(n)) continue;
    if ([...seen].some((s) => s.contains(n) && s !== n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function downloadText(filename: string, content: string, mime = "text/html") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
