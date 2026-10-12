/* _shared/lab/grok.js — семейство Grok React из лаборатории (index.html, блок «fam_grok»).
   Текст блока перенесён без изменений; единственное добавление — экспорт в RecomposeLab.grok. */
(function(){
/*
 * ════════════════════════════════════════════════════════════════════
 *  СЕМЕЙСТВО «GROK — React-приложение» — 9 методов
 *  (4 legacy: smart/compact/split/fit + 5 new: editorial/hero/mediastack/
 *  balanced/type). Код вербатим из:
 *   GROK-169-to-916/src/engine/types.ts | html.ts | extract.ts |
 *   analyze.ts | methodsLegacy.ts | methodsNew.ts | convert.ts
 *  esbuild стёр только TS-аннотации и import/export; тела функций не
 *  редактировались. modulesLegacy/modulesNew обёрнуты во вложенные IIFE,
 *  потому что оба файла объявляют свою локальную функцию finish().
 * ════════════════════════════════════════════════════════════════════
 */
const GROK=(()=>{'use strict';

/* ---- types.ts (FRAME + каталог METHODS этой программы) ---- */
const FRAME = { w: 900, h: 1600, sourceW: 1440 };
const METHODS = [
  {
    id: "smart",
    kind: "legacy",
    title: "\u0420\u0435\u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043F\u043E \u0440\u043E\u043B\u044F\u043C",
    subtitle: "\u041F\u0435\u0440\u0435\u043A\u043E\u043C\u043F\u043E\u043D\u043E\u0432\u044B\u0432\u0430\u0435\u0442 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0438, \u043C\u0435\u0434\u0438\u0430 \u0438 \u043C\u0435\u0442\u0430\u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u0434 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u0434\u0440 9:16.",
    intent: "\u0420\u043E\u043B\u0435\u0432\u0430\u044F \u043F\u0435\u0440\u0435\u0441\u0431\u043E\u0440\u043A\u0430 \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0433\u043E DOM \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A\u0430\u043C\u0438.",
    bestFor: "\u0428\u0430\u0431\u043B\u043E\u043D\u044B \u0441 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u044B\u043C\u0438 data-role \u0438 \u0441\u043C\u0435\u0448\u0430\u043D\u043D\u043E\u0439 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u043E\u0439."
  },
  {
    id: "compact",
    kind: "legacy",
    title: "\u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0430\u044F \u0441\u0435\u0442\u043A\u0430",
    subtitle: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0439 DOM \u0438 \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0438\u0441\u0442\u0435\u043C\u0443, \u0443\u043F\u043B\u043E\u0442\u043D\u044F\u0435\u0442 \u043E\u0442\u0441\u0442\u0443\u043F\u044B, \u0440\u0430\u0437\u043C\u0435\u0440\u044B \u0438 \u043C\u0435\u0436\u0431\u043B\u043E\u0447\u043D\u044B\u0435 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u044B.",
    intent: "CSS-\u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u0431\u0435\u0437 \u0441\u043C\u044B\u0441\u043B\u043E\u0432\u043E\u0439 \u043F\u0435\u0440\u0435\u0441\u0442\u0440\u043E\u0439\u043A\u0438.",
    bestFor: "\u0413\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0435\u0442\u043A\u0438 \u0431\u0435\u0437 \u0441\u0438\u043B\u044C\u043D\u043E\u0439 \u043C\u0435\u0434\u0438\u0430-\u0438\u0435\u0440\u0430\u0440\u0445\u0438\u0438."
  },
  {
    id: "split",
    kind: "legacy",
    title: "\u0420\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u044B\u0439 split",
    subtitle: "\u041F\u0440\u0438 \u043D\u0430\u043B\u0438\u0447\u0438\u0438 \u0442\u0435\u043A\u0441\u0442\u0430 \u0438 \u043C\u0435\u0434\u0438\u0430 \u0434\u0435\u043B\u0430\u0435\u0442 \u044F\u0432\u043D\u0443\u044E \u0434\u0432\u0443\u0445\u043A\u043E\u043B\u043E\u043D\u043E\u0447\u043D\u0443\u044E \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044E.",
    intent: "\u0416\u0451\u0441\u0442\u043A\u043E \u0440\u0430\u0437\u0434\u0435\u043B\u044F\u0435\u0442 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0443\u044E \u0438 \u043C\u0435\u0434\u0438\u0439\u043D\u0443\u044E \u0437\u043E\u043D\u044B.",
    bestFor: "Split-\u0448\u0430\u0431\u043B\u043E\u043D\u044B \u0442\u0435\u043A\u0441\u0442 + \u043E\u0434\u043D\u043E \u043C\u0435\u0434\u0438\u0430."
  },
  {
    id: "fit",
    kind: "legacy",
    title: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0439 safe-fit",
    subtitle: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u043C\u0435\u043D\u044F\u0435\u0442 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u0438 \u0443\u043C\u0435\u043D\u044C\u0448\u0430\u0435\u0442 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0434\u043E \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0445 \u0433\u0440\u0430\u043D\u0438\u0446.",
    intent: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0439 \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0432\u043C\u0435\u0448\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u0430.",
    bestFor: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0438 \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F."
  },
  {
    id: "editorial",
    kind: "new",
    title: "\u0412\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F",
    subtitle: "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A, \u0442\u0435\u043A\u0441\u0442, \u043C\u0435\u0434\u0438\u0430 \u0438 \u043C\u0435\u0442\u0443 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435 \u043A\u0430\u0434\u0440\u0430, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F \u0438\u0435\u0440\u0430\u0440\u0445\u0438\u044E.",
    intent: "\u041D\u0435 \u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0442\u044C \u0432\u0441\u0451 \u0432\u0432\u0435\u0440\u0445 \u2014 \u0432\u044B\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 editorial flow.",
    bestFor: "\u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043E\u0431\u043B\u043E\u0436\u043A\u0438, about, contact, \u0441\u0442\u0430\u0442\u044C\u0438."
  },
  {
    id: "hero",
    kind: "new",
    title: "\u0413\u043B\u0430\u0432\u043D\u043E\u0435 \u043C\u0435\u0434\u0438\u0430",
    subtitle: "\u0414\u0435\u043B\u0430\u0435\u0442 \u043E\u0434\u043D\u043E \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u0432\u0438\u0434\u0435\u043E\u0431\u043B\u043E\u043A \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u043C \u0446\u0435\u043D\u0442\u0440\u043E\u043C \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0430\u0434\u0440\u0430.",
    intent: "\u041A\u0440\u0443\u043F\u043D\u043E\u0435 \u043C\u0435\u0434\u0438\u0430 + \u0441\u043B\u0443\u0436\u0435\u0431\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442, \u0430 \u043D\u0435 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0432 \u0441\u0442\u043E\u043F\u043A\u0435.",
    bestFor: "\u041E\u0434\u043D\u043E \u0434\u043E\u043C\u0438\u043D\u0438\u0440\u0443\u044E\u0449\u0435\u0435 \u043C\u0435\u0434\u0438\u0430 \u0438 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442."
  },
  {
    id: "mediastack",
    kind: "new",
    title: "\u041C\u0435\u0434\u0438\u0430 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435",
    subtitle: "\u0421\u0442\u0430\u0432\u0438\u0442 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0435\u0434\u0438\u0430 \u043A\u0440\u0443\u043F\u043D\u044B\u043C\u0438 \u043A\u0430\u0434\u0440\u0430\u043C\u0438 \u0434\u0440\u0443\u0433 \u043D\u0430\u0434 \u0434\u0440\u0443\u0433\u043E\u043C \u0432\u043C\u0435\u0441\u0442\u043E \u0441\u0436\u0430\u0442\u043E\u0439 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043B\u0435\u043D\u0442\u044B.",
    intent: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0432\u044B\u0441\u043E\u0442\u0443 9:16 \u043A\u0430\u043A \u0441\u0435\u0440\u0438\u044E \u0432\u044B\u0440\u0430\u0437\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043A\u0430\u0434\u0440\u043E\u0432.",
    bestFor: "\u0414\u0432\u0430 \u0438 \u0431\u043E\u043B\u0435\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F, \u0430\u0441\u0438\u043C\u043C\u0435\u0442\u0440\u0438\u0447\u043D\u044B\u0435 \u0441\u0435\u0442\u043A\u0438, \u0433\u0430\u043B\u0435\u0440\u0435\u0438."
  },
  {
    id: "balanced",
    kind: "new",
    title: "\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F",
    subtitle: "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442 \u0432\u044B\u0441\u043E\u0442\u0443 1600px, \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0432\u0435\u0441 \u0438 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u044B, \u0447\u0442\u043E\u0431\u044B \u043F\u0443\u0441\u0442\u043E\u0442\u0430 \u0431\u044B\u043B\u0430 \u0447\u0430\u0441\u0442\u044C\u044E \u043C\u0430\u043A\u0435\u0442\u0430.",
    intent: "\u0420\u0430\u0432\u043D\u043E\u0432\u0435\u0441\u0438\u0435 \u0432\u0435\u0440\u0445\u0430 \u0438 \u043D\u0438\u0437\u0430 \u043A\u0430\u0434\u0440\u0430, \u0430 \u043D\u0435 \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0439 \u0437\u0430\u0437\u043E\u0440 \u0441\u043D\u0438\u0437\u0443.",
    bestFor: "\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u0438 \u0441\u0440\u0435\u0434\u043D\u0438\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0438\u043D\u0430\u0447\u0435 \u043E\u0441\u0435\u0434\u0430\u044E\u0442 \u0432\u0432\u0435\u0440\u0445."
  },
  {
    id: "type",
    kind: "new",
    title: "\u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0442\u043E\u043B\u0431\u0435\u0446",
    subtitle: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u043C\u0430\u0441\u0448\u0442\u0430\u0431 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430 \u0432 \u0443\u0437\u043A\u043E\u043C \u043A\u0430\u0434\u0440\u0435 \u0438 \u0441\u0442\u0440\u043E\u0438\u0442 \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044E \u0432\u043E\u043A\u0440\u0443\u0433 \u0442\u0435\u043A\u0441\u0442\u0430.",
    intent: "\u0422\u0438\u043F \u043A\u0430\u043A \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442, \u043C\u0435\u0434\u0438\u0430 \u043A\u0430\u043A \u0430\u043A\u0446\u0435\u043D\u0442, \u043D\u0435 \u043D\u0430\u043E\u0431\u043E\u0440\u043E\u0442.",
    bestFor: "\u041C\u0430\u043D\u0438\u0444\u0435\u0441\u0442\u044B, \u043A\u0440\u0443\u043F\u043D\u044B\u0435 \u0437\u0430\u044F\u0432\u043B\u0435\u043D\u0438\u044F, \u043E\u0431\u043B\u043E\u0436\u043A\u0438 \u0441 \u043C\u0430\u043B\u044B\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u043C \u043C\u0435\u0434\u0438\u0430."
  }
];

/* ---- html.ts (DOM-хелперы) ---- */
const BASE_CSS = `
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
function parseFragment(html) {
  return new DOMParser().parseFromString(
    `<!doctype html><html><head></head><body>${html}</body></html>`,
    "text/html"
  );
}
function innerBody(doc) {
  return doc.body.innerHTML;
}
function pickBg(doc) {
  const section = doc.querySelector("section, .sv-section, body");
  const bg = section?.style?.background || section?.style?.backgroundColor;
  return bg || "#ffffff";
}
function pickColor(el) {
  return el?.style?.color || "";
}
function buildDocument(bodyHtml, extraCss, width, bg = "#ffffff") {
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
function cloneEl(el) {
  return el.cloneNode(true);
}
function applyMediaFill(el, minHeight, aspect) {
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
    const n = m;
    n.style.width = "100%";
    n.style.height = "100%";
    n.style.objectFit = "cover";
  });
}
function walk(el, fn) {
  if (el instanceof HTMLElement) fn(el);
  Array.from(el.children).forEach((c) => walk(c, fn));
}
function flattenColumns(root, keepIf) {
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
function tighten(root, pad = "28px 24px") {
  const section = root.querySelector(".sv-section, section");
  if (section) {
    section.style.padding = pad;
  }
  walk(root, (el) => {
    const fs = el.style.fontSize;
    if (fs && /clamp\(/.test(fs)) {
    }
  });
}
function uniqueNodes(nodes) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const n of nodes) {
    if (seen.has(n)) continue;
    if ([...seen].some((s) => s.contains(n) && s !== n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}
function downloadText(filename, content, mime = "text/html") {
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

/* ---- extract.ts (извлечение семантических кусков) ---- */
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

function all(doc, sel) {
  return Array.from(doc.querySelectorAll(sel));
}
__name(all, "all");
function extractPieces(doc) {
  const section = doc.querySelector("section, .sv-section");
  const background = section?.style.background || section?.style.backgroundColor || "#ffffff";
  const color = section?.style.color || "";
  const media = uniqueNodes(
    all(doc, "[data-sb-media], .sv-media").concat(
      all(doc, "img, video").filter(
        (n) => !n.closest("[data-sb-media], .sv-media")
      )
    )
  );
  const titles = uniqueNodes(
    all(doc, '[data-role="title"], h1, h2, h3').filter(
      (n) => n.getAttribute("data-role") !== "label"
    )
  );
  const statements = uniqueNodes(all(doc, '[data-role="statement"]'));
  const bodies = uniqueNodes(all(doc, '[data-role="body"], p'));
  const overlines = uniqueNodes(all(doc, '[data-role="overline"]'));
  const labels = uniqueNodes(all(doc, '[data-role="label"]'));
  const metas = uniqueNodes(all(doc, '[data-role="smallMeta"]'));
  const links = uniqueNodes(all(doc, '[data-role="link"]'));
  const tags = labels.filter(
    (l) => /tag|collab|season/i.test(
      (l.getAttribute("data-slot") || "") + (l.textContent || "")
    )
  );
  return {
    background,
    color,
    overlines: overlines.map(cloneEl),
    titles: titles.map(cloneEl),
    statements: statements.map(cloneEl),
    bodies: bodies.map(cloneEl),
    media: media.map(cloneEl),
    labels: labels.map(cloneEl),
    metas: metas.map(cloneEl),
    links: links.map(cloneEl),
    tags: tags.map(cloneEl)
  };
}
__name(extractPieces, "extractPieces");
function headingNodes(p) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const n of [...p.statements, ...p.titles]) {
    const key = (n.textContent || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}
__name(headingNodes, "headingNodes");
function bodyNodes(p) {
  const headingText = new Set(headingNodes(p).map((n) => (n.textContent || "").trim()));
  return p.bodies.filter((n) => {
    const t = (n.textContent || "").trim();
    return t && !headingText.has(t);
  });
}
__name(bodyNodes, "bodyNodes");
function restyleVoice(el, extra) {
  Object.assign(el.style, extra);
  el.style.maxWidth = extra.maxWidth || "100%";
}
__name(restyleVoice, "restyleVoice");
function fillMedia(el, opts) {
  el.style.width = "100%";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.margin = "0";
  if (opts.minHeight) el.style.minHeight = `${opts.minHeight}px`;
  if (opts.aspect) el.style.aspectRatio = opts.aspect;
  else el.style.removeProperty("aspect-ratio");
  if (opts.flex) el.style.flex = opts.flex;
  el.querySelectorAll("img, video").forEach((m) => {
    const n = m;
    n.style.width = "100%";
    n.style.height = "100%";
    n.style.objectFit = "cover";
  });
}
__name(fillMedia, "fillMedia");
function pairLabels(p) {
  const pairs = [];
  const n = Math.min(p.labels.length, Math.max(p.metas.length, p.links.length));
  for (let i = 0; i < n; i++) {
    const value = p.links[i] || p.metas[i];
    if (p.labels[i] && value) pairs.push({ label: p.labels[i], value });
  }
  if (pairs.length === 0) return [];
  return pairs;
}
__name(pairLabels, "pairLabels");

/* ---- analyze.ts ( StructureProfile + рекомендации ) ---- */
function analyzeHtml(html, tpl) {
  const doc = parseFragment(html);
  const q = (sel) => doc.querySelectorAll(sel).length;
  const roles = {
    overline: q('[data-role="overline"]'),
    title: q('[data-role="title"]'),
    statement: q('[data-role="statement"]'),
    body: q('[data-role="body"]'),
    label: q('[data-role="label"]'),
    smallMeta: q('[data-role="smallMeta"]'),
    link: q('[data-role="link"]'),
    media: q("[data-sb-media], .sv-media, img, video"),
    totalRoles: 0
  };
  roles.totalRoles = roles.overline + roles.title + roles.statement + roles.body + roles.label + roles.smallMeta + roles.link;
  const mediaCount = roles.media;
  const textCount = roles.title + roles.statement + roles.body + roles.overline;
  let columnHint = 1;
  doc.querySelectorAll("[style]").forEach((el) => {
    const s = el.getAttribute("style") || "";
    const m = s.match(/grid-template-columns\s*:\s*([^;]+)/);
    if (m) {
      const cols = m[1].split(" ").filter((x) => x.trim());
      columnHint = Math.max(columnHint, cols.length);
      if (/repeat\(\s*(\d+)/.test(m[1])) {
        columnHint = Math.max(columnHint, Number(RegExp.$1));
      }
    }
  });
  const hasHorizontalGrid = columnHint >= 2;
  const hasRepeat = !!doc.querySelector("[data-sb-repeat]");
  const titleEl = doc.querySelector('[data-role="title"], [data-role="statement"], h1, h2');
  const titleLen = (titleEl?.textContent || "").trim().length;
  const isTypographic = titleLen > 28 && mediaCount <= 2;
  const htmlLen = html.length;
  const isShort = htmlLen < 2800 && mediaCount <= 1;
  const key = `${tpl?.tpl || ""} ${tpl?.family || ""} ${tpl?.code || ""}`.toLowerCase();
  let handler = "generic";
  if (/indexhero|typoindex|sw-05/.test(key) || mediaCount >= 2 && /hero/.test(key) && isTypographic) {
    handler = "indexhero";
  } else if (/matrix|sw-02/.test(key)) {
    handler = "matrix";
  } else if (/manifesto|abt-02|family about/.test(key) && mediaCount === 1 && roles.statement) {
    handler = "about";
  } else if (/contact|c-11/.test(key) || mediaCount === 0 && roles.link >= 2) {
    handler = "contact";
  } else if (/services|srv-02/.test(key) || hasRepeat) {
    handler = "services";
  } else if (/cards|wrk-03|worktriple/.test(key) || mediaCount >= 3 && columnHint >= 3) {
    handler = "cards";
  } else if (/quote|qte/.test(key) || roles.statement > 0) {
    handler = "quote";
  } else if (tpl?.family === "about" && mediaCount <= 1) {
    handler = "about";
  } else if (tpl?.family === "contact") {
    handler = "contact";
  } else if (tpl?.family === "services") {
    handler = "services";
  } else if (mediaCount >= 2 && isTypographic) {
    handler = "indexhero";
  } else if (mediaCount === 1 && hasHorizontalGrid) {
    handler = "matrix";
  }
  return {
    handler,
    mediaCount,
    textCount,
    columnHint,
    hasHorizontalGrid,
    hasRepeat,
    isTypographic,
    isShort,
    roles
  };
}
function recommendLegacy(profile) {
  const { roles, mediaCount, hasHorizontalGrid, handler } = profile;
  if (handler === "indexhero" || handler === "matrix" || handler === "about" || mediaCount >= 1 && roles.totalRoles >= 4) {
    return {
      method: "smart",
      title: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F: \u0440\u0435\u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043F\u043E \u0440\u043E\u043B\u044F\u043C",
      text: `\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u044B\u0435 \u0440\u043E\u043B\u0438 \u0438 \u043C\u0435\u0434\u0438\u0430/\u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435 \u0433\u0440\u0443\u043F\u043F\u044B: \u043E\u043D\u0438 \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u044B \u0437\u0430\u043D\u043E\u0432\u043E, \u0430 \u043D\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u0443\u043C\u0435\u043D\u044C\u0448\u0435\u043D\u044B. \u0420\u043E\u043B\u0438: ${roles.totalRoles}, \u043C\u0435\u0434\u0438\u0430: ${mediaCount}.`
    };
  }
  if (hasHorizontalGrid && mediaCount === 0) {
    return {
      method: "compact",
      title: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F: \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0430\u044F \u0441\u0435\u0442\u043A\u0430",
      text: `\u0423 \u0448\u0430\u0431\u043B\u043E\u043D\u0430 \u0443\u0436\u0435 \u0435\u0441\u0442\u044C \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430; \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u0435\u0435 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0443\u043F\u043B\u043E\u0442\u043D\u0438\u0442\u044C \u0438\u0441\u0445\u043E\u0434\u043D\u0443\u044E \u0441\u0435\u0442\u043A\u0443 \u0438 \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0443. \u0420\u043E\u043B\u0438: ${roles.totalRoles}, \u043C\u0435\u0434\u0438\u0430: ${mediaCount}.`
    };
  }
  if (mediaCount >= 1 && profile.textCount >= 1 && (handler === "quote" || handler === "generic")) {
    return {
      method: "split",
      title: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F: \u0440\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u044B\u0439 split",
      text: `\u0415\u0441\u0442\u044C \u044F\u0432\u043D\u0430\u044F \u043F\u0430\u0440\u0430 \u0442\u0435\u043A\u0441\u0442 + \u043C\u0435\u0434\u0438\u0430. Split \u0444\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u0442 \u0434\u0432\u0435 \u0437\u043E\u043D\u044B \u0438 \u043D\u0435 \u043F\u044B\u0442\u0430\u0435\u0442\u0441\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0441\u0445\u043E\u0434\u043D\u0443\u044E \u0441\u0435\u0442\u043A\u0443. \u0420\u043E\u043B\u0438: ${roles.totalRoles}, \u043C\u0435\u0434\u0438\u0430: ${mediaCount}.`
    };
  }
  return {
    method: "fit",
    title: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F: \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0439 safe-fit",
    text: `\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0438\u043B\u0438 \u043D\u0435\u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u0430\u044F. Safe-fit \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0432\u043C\u0435\u0448\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0438 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u043F\u0440\u0438 \u043F\u0440\u043E\u0441\u0442\u043E\u043C \u0441\u0436\u0430\u0442\u0438\u0438. \u0420\u043E\u043B\u0438: ${roles.totalRoles}, \u043C\u0435\u0434\u0438\u0430: ${mediaCount}.`
  };
}
function recommendNew(profile) {
  if (profile.mediaCount >= 2) {
    return {
      method: "mediastack",
      title: "\u041D\u043E\u0432\u044B\u0439 \u043C\u0435\u0442\u043E\u0434: \u043C\u0435\u0434\u0438\u0430 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435",
      text: `\u041D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0435\u0434\u0438\u0430 \u0432\u044B\u0433\u043E\u0434\u043D\u0435\u0435 \u0440\u0430\u0437\u0432\u0435\u0441\u0442\u0438 \u043A\u0440\u0443\u043F\u043D\u044B\u043C\u0438 \u043A\u0430\u0434\u0440\u0430\u043C\u0438 \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0438, \u0430 \u043D\u0435 \u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0432 \u043E\u0434\u043D\u043E\u0439 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043B\u0435\u043D\u0442\u0435. \u041C\u0435\u0434\u0438\u0430: ${profile.mediaCount}.`
    };
  }
  if (profile.mediaCount === 1 && (profile.handler === "matrix" || profile.handler === "about" || profile.handler === "quote")) {
    return {
      method: "hero",
      title: "\u041D\u043E\u0432\u044B\u0439 \u043C\u0435\u0442\u043E\u0434: \u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u043C\u0435\u0434\u0438\u0430",
      text: "\u041E\u0434\u043D\u043E \u043C\u0435\u0434\u0438\u0430 \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u0432\u044B\u0441\u043E\u0442\u0443 \u043A\u0430\u0434\u0440\u0430, \u0430 \u0442\u0435\u043A\u0441\u0442 \u0441\u0442\u0430\u0442\u044C \u043E\u0431\u0432\u044F\u0437\u043A\u043E\u0439, \u0430 \u043D\u0435 \u043D\u0430\u043E\u0431\u043E\u0440\u043E\u0442."
    };
  }
  if (profile.isTypographic && profile.mediaCount <= 1) {
    return {
      method: "type",
      title: "\u041D\u043E\u0432\u044B\u0439 \u043C\u0435\u0442\u043E\u0434: \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0442\u043E\u043B\u0431\u0435\u0446",
      text: "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u2014 \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442. \u0412 \u0443\u0437\u043A\u043E\u043C \u043A\u0430\u0434\u0440\u0435 \u0435\u0433\u043E \u043B\u0443\u0447\u0448\u0435 \u043D\u0435 \u0443\u0436\u0438\u043C\u0430\u0442\u044C, \u0430 \u0432\u044B\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043A\u0430\u043A \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0444\u043E\u0440\u043C\u0443."
    };
  }
  if (profile.isShort || profile.handler === "contact") {
    return {
      method: "balanced",
      title: "\u041D\u043E\u0432\u044B\u0439 \u043C\u0435\u0442\u043E\u0434: \u0441\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F",
      text: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442\u0430 \u043C\u0430\u043B\u043E \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E 1600px. \u0418\u043C\u0435\u0435\u0442 \u0441\u043C\u044B\u0441\u043B \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0432\u0435\u0441 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043D\u0438\u0437 \u043A\u0430\u0434\u0440\u0430 \u043D\u0435 \u043E\u0441\u0442\u0430\u0432\u0430\u043B\u0441\u044F \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u043C."
    };
  }
  return {
    method: "editorial",
    title: "\u041D\u043E\u0432\u044B\u0439 \u043C\u0435\u0442\u043E\u0434: \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F",
    text: "\u0420\u043E\u043B\u0438 \u0432\u044B\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0441\u0432\u0435\u0440\u0445\u0443 \u0432\u043D\u0438\u0437 \u0441 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u043C \u0440\u0438\u0442\u043C\u043E\u043C: \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A, \u0442\u0435\u043A\u0441\u0442, \u043C\u0435\u0434\u0438\u0430, \u043C\u0435\u0442\u0430 \u2014 \u0431\u0435\u0437 \u0441\u043A\u0443\u0447\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0432\u0432\u0435\u0440\u0445\u0443."
  };
}

/* ---- methodsLegacy.ts (4 зафиксированных legacy-метода) ---- */
const LEGACY=(()=>{
function finish(doc, css, method, profile, notes) {
  const html = innerBody(doc);
  const bg = pickBg(doc);
  return {
    html,
    css,
    document: buildDocument(html, css, 900, bg),
    method,
    handler: profile.handler,
    analysis: profile,
    notes
  };
}
const SMART_GENERIC = `
body { width: 900px; }
.sv-section { padding: 32px 28px !important; }
.sv-inner { max-width: none !important; margin: 0 !important; }
h1, h2, [data-role="title"], [data-role="statement"] { font-size: 42px !important; line-height: 1.05 !important; }
[data-role="body"] { font-size: 15px !important; }
.sv-media { max-width: 100%; }
`;
const SMART_INDEXHERO = `
body { width: 900px; }
.sv-section { padding: 28px 28px 32px !important; }
.sv-inner { max-width: none !important; }
h1, [data-role="title"] { font-size: 54px !important; line-height: 0.92 !important; letter-spacing: -0.04em !important; }
[data-role="body"] { font-size: 15px !important; max-width: 100% !important; }
`;
const SMART_MATRIX = `
body { width: 900px; }
.sv-section { padding: 28px 24px !important; }
.sv-inner { max-width: none !important; }
h1, [data-role="title"] { font-size: 44px !important; line-height: 0.95 !important; }
.sv-media { aspect-ratio: 16/9 !important; min-height: 0 !important; }
`;
const SMART_ABOUT = `
body { width: 900px; }
.sv-section { padding: 40px 32px !important; }
.sv-inner { max-width: none !important; }
[data-role="statement"] { font-size: 36px !important; margin-bottom: 28px !important; }
.sv-media { aspect-ratio: 16/9 !important; }
`;
const SMART_CONTACT = `
body { width: 900px; }
.sv-section { padding: 48px 36px !important; }
.sv-inner { max-width: none !important; display: flex !important; flex-direction: column !important; gap: 28px !important; }
h2, [data-role="title"] { font-size: 48px !important; }
`;
const COMPACT_CSS = `
body { width: 900px; }
.sv-section { padding: 28px 24px !important; }
.sv-inner { max-width: none !important; margin: 0 !important; }
h1 { font-size: 36px !important; }
h2 { font-size: 32px !important; }
h3 { font-size: 22px !important; }
[data-role="title"], [data-role="statement"] { font-size: 32px !important; line-height: 1.1 !important; }
[data-role="body"] { font-size: 14px !important; max-width: none !important; }
.sv-media { max-width: 100%; }
`;
const SPLIT_CSS = `
body { width: 900px; }
.rc-split { display: flex; flex-direction: column; width: 900px; min-height: 0; }
.rc-split-text { padding: 36px 32px 24px; }
.rc-split-media { padding: 0 32px 32px; }
.rc-split-media .sv-media { width: 100%; aspect-ratio: 16/10; }
.rc-split-rule { height: 1px; background: currentColor; opacity: .25; margin: 0 32px 20px; }
`;
const FIT_CSS = `
body { width: 900px; }
.sv-section { padding: 24px 20px !important; }
.sv-inner { max-width: none !important; }
* { max-width: 100%; }
h1, h2, [data-role="title"], [data-role="statement"] { font-size: 28px !important; line-height: 1.1 !important; }
[data-role="body"] { font-size: 13px !important; }
.sv-media { max-height: 360px; }
`;
function isMediaPair(el) {
  const kids = Array.from(el.children);
  if (kids.length < 2) return false;
  const mediaKids = kids.filter(
    (k) => k.matches("[data-sb-media], .sv-media") || k.querySelector("[data-sb-media], .sv-media")
  );
  return mediaKids.length >= 2 && mediaKids.length === kids.length;
}
function isMetaRow(el) {
  const s = el.getAttribute("style") || "";
  if (!/grid-template-columns/.test(s)) return false;
  const hasMedia = !!el.querySelector("[data-sb-media], .sv-media, img, video");
  const hasMeta = !!el.querySelector('[data-role="label"], [data-role="smallMeta"]');
  return !hasMedia && hasMeta;
}
function convertSmart(sourceHtml, profile, _tpl) {
  const doc = parseFragment(sourceHtml);
  const root = doc.body;
  const notes = [
    "legacy/smart: \u0440\u043E\u043B\u0435\u0432\u0430\u044F \u0440\u0435\u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u0431\u0435\u0437 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u0432\u044B\u0441\u043E\u0442\u044B \u043A\u0430\u0434\u0440\u0430",
    `handler=${profile.handler}`
  ];
  if (profile.handler === "indexhero") {
    flattenColumns(root, (el) => isMediaPair(el) || isMetaRow(el));
    tighten(root, "28px 28px 32px");
    return finish(doc, SMART_INDEXHERO, "smart", profile, notes);
  }
  if (profile.handler === "matrix") {
    flattenColumns(root, (el) => isMetaRow(el));
    const media = root.querySelector(".sv-media, [data-sb-media]");
    if (media) {
      media.style.width = "100%";
      media.style.aspectRatio = "16/9";
    }
    tighten(root, "28px 24px");
    return finish(doc, SMART_MATRIX, "smart", profile, notes);
  }
  if (profile.handler === "about") {
    flattenColumns(root, (el) => isMetaRow(el));
    const media = root.querySelector(".sv-media, [data-sb-media]");
    if (media) media.style.aspectRatio = "16/9";
    return finish(doc, SMART_ABOUT, "smart", profile, notes);
  }
  if (profile.handler === "contact" || profile.handler === "services") {
    flattenColumns(root);
    return finish(doc, SMART_CONTACT, "smart", profile, notes);
  }
  flattenColumns(root, (el) => isMetaRow(el));
  tighten(root, "32px 28px");
  return finish(doc, SMART_GENERIC, "smart", profile, notes);
}
function convertCompact(sourceHtml, profile) {
  const doc = parseFragment(sourceHtml);
  flattenColumns(doc.body);
  tighten(doc.body, "28px 24px");
  return finish(doc, COMPACT_CSS, "compact", profile, [
    "legacy/compact: \u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0439 DOM \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D, \u0441\u0435\u0442\u043A\u0430 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0430"
  ]);
}
function convertSplit(sourceHtml, profile) {
  const doc = parseFragment(sourceHtml);
  const media = Array.from(
    doc.querySelectorAll("[data-sb-media], .sv-media, img, video")
  );
  if (media.length === 0) {
    flattenColumns(doc.body);
    tighten(doc.body, "36px 32px");
    return finish(doc, SPLIT_CSS + COMPACT_CSS, "split", profile, [
      "legacy/split: \u043C\u0435\u0434\u0438\u0430 \u043D\u0435\u0442 \u2014 fallback \u043A \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u044E"
    ]);
  }
  const bg = pickBg(doc);
  const section = doc.querySelector("section, .sv-section");
  const color = section?.style.color || "#111";
  const textClone = section ? section.cloneNode(true) : doc.body;
  textClone.querySelectorAll("[data-sb-media], .sv-media, img, video").forEach((n) => {
    const parent = n.parentElement;
    n.remove();
    if (parent && parent.children.length === 0) parent.remove();
  });
  const wrap = doc.createElement("section");
  wrap.className = "rc-split sv-section";
  wrap.setAttribute("style", `background:${bg}; color:${color};`);
  const textZone = doc.createElement("div");
  textZone.className = "rc-split-text";
  textZone.innerHTML = textClone.innerHTML;
  const rule = doc.createElement("div");
  rule.className = "rc-split-rule";
  const mediaZone = doc.createElement("div");
  mediaZone.className = "rc-split-media";
  media.forEach((m) => mediaZone.appendChild(m.cloneNode(true)));
  wrap.append(textZone, rule, mediaZone);
  doc.body.innerHTML = "";
  doc.body.appendChild(wrap);
  return finish(doc, SPLIT_CSS, "split", profile, [
    "legacy/split: \u0442\u0435\u043A\u0441\u0442 \u0438 \u043C\u0435\u0434\u0438\u0430 \u0440\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u044B \u0432 \u0434\u0432\u0435 \u0437\u043E\u043D\u044B"
  ]);
}
function convertFit(sourceHtml, profile) {
  const doc = parseFragment(sourceHtml);
  tighten(doc.body, "24px 20px");
  return finish(doc, FIT_CSS, "fit", profile, [
    "legacy/fit: \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u043C\u0435\u0448\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E, \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F"
  ]);
}
return {convertSmart,convertCompact,convertSplit,convertFit};
})();

/* ---- methodsNew.ts (5 новых методов) ---- */
const NEW=(()=>{
function shell(doc, className, bg, color) {
  const sec = doc.createElement("section");
  sec.className = `sv-section rc-new ${className}`;
  sec.setAttribute(
    "style",
    `background:${bg}; color:${color || "inherit"}; width:900px; min-height:1600px; display:flex; flex-direction:column;`
  );
  return sec;
}
function finish(doc, css, method, profile, notes) {
  const html = innerBody(doc);
  const bg = doc.querySelector("section")?.style.background || "#fff";
  return {
    html,
    css,
    document: buildDocument(html, css, 900, bg),
    method,
    handler: profile.handler,
    analysis: profile,
    notes
  };
}
function bring(doc, el) {
  return doc.importNode(el, true);
}
function place(parent, el, extra) {
  const node = bring(parent.ownerDocument, el);
  if (extra) restyleVoice(node, extra);
  parent.appendChild(node);
  return node;
}
function placeMedia(parent, el, opts) {
  const node = bring(parent.ownerDocument, el);
  fillMedia(node, opts);
  parent.appendChild(node);
  return node;
}
function metaStrip(doc, p) {
  const pairs = pairLabels(p);
  const used = new Set(pairs.flatMap((x) => [x.label, x.value]));
  const leftovers = [...p.metas, ...p.links].filter((m) => !used.has(m));
  if (pairs.length === 0 && leftovers.length === 0) return null;
  const bar = doc.createElement("div");
  bar.className = "rc-meta";
  if (pairs.length) {
    pairs.forEach(({ label, value }) => {
      const cell = doc.createElement("div");
      cell.className = "rc-meta-cell";
      place(cell, label, { marginBottom: "6px", fontSize: "11px" });
      place(cell, value, { margin: "0", fontSize: "13px" });
      bar.appendChild(cell);
    });
  } else {
    leftovers.forEach((m) => place(bar, m, { fontSize: "12px" }));
  }
  return bar;
}
const SHARED = `
body { width: 900px; }
.rc-new { box-sizing: border-box; }
.rc-kicker { display:flex; justify-content:space-between; gap:16px; align-items:flex-end; }
.rc-meta { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:18px 24px; border-top:1px solid currentColor; padding-top:18px; }
.rc-meta-cell { min-width: 0; }
.rc-new h1, .rc-new h2, .rc-new h3 { max-width: 100%; }
.rc-new [data-role="title"], .rc-new [data-role="statement"] { word-break: break-word; }
`;
function convertEditorial(sourceHtml, profile) {
  const src = parseFragment(sourceHtml);
  const p = extractPieces(src);
  const doc = parseFragment("");
  const sec = shell(doc, "rc-editorial", p.background, p.color);
  sec.style.padding = "64px 40px 48px";
  sec.style.justifyContent = "space-between";
  sec.style.gap = "28px";
  const head = doc.createElement("header");
  head.className = "rc-kicker";
  p.overlines.forEach((o) => place(head, o));
  if (p.metas[0]) place(head, p.metas[0], { fontSize: "11px" });
  sec.appendChild(head);
  headingNodes(p).forEach((t, i) => {
    place(sec, t, {
      fontSize: i === 0 ? "52px" : "26px",
      lineHeight: "1.04",
      letterSpacing: "-0.035em",
      margin: "0"
    });
  });
  const bodies = bodyNodes(p);
  if (bodies.length) {
    const col = doc.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.gap = "14px";
    bodies.forEach((b) => place(col, b, { fontSize: "16px", lineHeight: "1.6", margin: "0", maxWidth: "100%" }));
    sec.appendChild(col);
  }
  if (p.media.length) {
    const stack = doc.createElement("div");
    stack.style.flex = "1";
    stack.style.display = "flex";
    stack.style.flexDirection = "column";
    stack.style.gap = "14px";
    stack.style.justifyContent = "center";
    p.media.forEach(
      (m) => placeMedia(stack, m, { flex: "1 1 0", minHeight: p.media.length === 1 ? 520 : 280 })
    );
    sec.appendChild(stack);
  } else {
    const spacer = doc.createElement("div");
    spacer.style.flex = "1";
    sec.appendChild(spacer);
  }
  const meta = metaStrip(doc, p);
  if (meta) sec.appendChild(meta);
  doc.body.appendChild(sec);
  return finish(doc, SHARED, "editorial", profile, [
    "new/editorial: \u0440\u043E\u043B\u0438 \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u044B \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435 1600px \u0447\u0435\u0440\u0435\u0437 space-between",
    "\u043C\u0435\u0434\u0438\u0430 \u0440\u0430\u0441\u0442\u044F\u0433\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u0439 \u0437\u043E\u043D\u0435, \u043C\u0435\u0442\u0430 \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u0430 \u0432\u043D\u0438\u0437\u0443"
  ]);
}
function convertHero(sourceHtml, profile) {
  const src = parseFragment(sourceHtml);
  const p = extractPieces(src);
  const doc = parseFragment("");
  const sec = shell(doc, "rc-hero", p.background, p.color);
  sec.style.padding = "36px 32px 32px";
  sec.style.gap = "20px";
  const head = doc.createElement("header");
  head.className = "rc-kicker";
  p.overlines.slice(0, 1).forEach((o) => place(head, o));
  p.metas.slice(0, 1).forEach((m) => place(head, m, { fontSize: "11px" }));
  sec.appendChild(head);
  headingNodes(p).slice(0, 2).forEach(
    (t) => place(sec, t, {
      fontSize: "40px",
      lineHeight: "1.05",
      letterSpacing: "-0.03em",
      margin: "0"
    })
  );
  if (p.media[0]) {
    const main = placeMedia(sec, p.media[0], { flex: "1 1 auto", minHeight: 680 });
    main.style.flex = "1 1 auto";
  } else {
    const ph = doc.createElement("div");
    ph.style.flex = "1";
    sec.appendChild(ph);
  }
  const bodies = bodyNodes(p);
  if (bodies[0]) place(sec, bodies[0], { fontSize: "15px", lineHeight: "1.55", margin: "0" });
  if (p.media.length > 1) {
    const row = doc.createElement("div");
    row.style.display = "grid";
    row.style.gridTemplateColumns = p.media.length === 2 ? "1fr" : "1fr 1fr";
    row.style.gap = "10px";
    p.media.slice(1).forEach((m) => placeMedia(row, m, { minHeight: 160, aspect: "16/7" }));
    sec.appendChild(row);
  }
  const meta = metaStrip(doc, p);
  if (meta) sec.appendChild(meta);
  doc.body.appendChild(sec);
  return finish(
    doc,
    SHARED + `.rc-hero .sv-media, .rc-hero [data-sb-media] { width:100%; }`,
    "hero",
    profile,
    [
      "new/hero: \u043F\u0435\u0440\u0432\u043E\u0435 \u043C\u0435\u0434\u0438\u0430 \u0437\u0430\u043D\u0438\u043C\u0430\u0435\u0442 \u043E\u0441\u043D\u043E\u0432\u043D\u0443\u044E \u0432\u044B\u0441\u043E\u0442\u0443 \u043A\u0430\u0434\u0440\u0430",
      "\u0442\u0435\u043A\u0441\u0442 \u0441\u043B\u0443\u0436\u0438\u0442 \u043E\u0431\u0432\u044F\u0437\u043A\u043E\u0439 \u0441\u0432\u0435\u0440\u0445\u0443 \u0438 \u0441\u043D\u0438\u0437\u0443, \u0430 \u043D\u0435 \u043A\u043E\u043D\u043A\u0443\u0440\u0438\u0440\u0443\u0435\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u043C"
    ]
  );
}
function convertMediaStack(sourceHtml, profile) {
  const src = parseFragment(sourceHtml);
  const p = extractPieces(src);
  const doc = parseFragment("");
  const sec = shell(doc, "rc-mediastack", p.background, p.color);
  sec.style.padding = "40px 32px 36px";
  sec.style.gap = "18px";
  const head = doc.createElement("header");
  head.className = "rc-kicker";
  p.overlines.forEach((o) => place(head, o));
  sec.appendChild(head);
  headingNodes(p).slice(0, 1).forEach(
    (t) => place(sec, t, {
      fontSize: "36px",
      lineHeight: "1.05",
      letterSpacing: "-0.03em",
      margin: "0 0 4px"
    })
  );
  const bodies = bodyNodes(p);
  const captions = [...p.labels, ...p.metas];
  if (!p.media.length) {
    bodies.forEach((b) => place(sec, b));
  } else {
    p.media.forEach((m, i) => {
      const block = doc.createElement("figure");
      block.style.margin = "0";
      block.style.flex = i === 0 ? "1.15 1 auto" : "1 1 auto";
      block.style.display = "flex";
      block.style.flexDirection = "column";
      block.style.gap = "8px";
      if (captions[i]) place(block, captions[i], { fontSize: "11px", letterSpacing: "0.08em", margin: "0" });
      const base = p.media.length >= 3 ? 300 : p.media.length === 2 ? 400 : 560;
      placeMedia(block, m, { minHeight: i === 0 ? base + 80 : base, flex: "1 1 auto" });
      sec.appendChild(block);
      if (i === 0 && bodies[0]) {
        place(sec, bodies[0], { fontSize: "15px", lineHeight: "1.5", margin: "4px 0 8px" });
      }
    });
    bodies.slice(1).forEach((b) => place(sec, b, { fontSize: "15px", lineHeight: "1.5", margin: "0" }));
  }
  const meta = metaStrip(doc, p);
  if (meta) sec.appendChild(meta);
  doc.body.appendChild(sec);
  return finish(doc, SHARED + `.rc-mediastack figure { min-height: 0; }`, "mediastack", profile, [
    "new/mediastack: \u043A\u0430\u0436\u0434\u043E\u0435 \u043C\u0435\u0434\u0438\u0430 \u2014 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0440\u0443\u043F\u043D\u044B\u0439 \u043A\u0430\u0434\u0440 \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435",
    "\u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u044B 16:9 \u043D\u0430\u043C\u0435\u0440\u0435\u043D\u043D\u043E \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u043D\u044B"
  ]);
}
function convertBalanced(sourceHtml, profile) {
  const src = parseFragment(sourceHtml);
  const p = extractPieces(src);
  const doc = parseFragment("");
  const sec = shell(doc, "rc-balanced", p.background, p.color);
  sec.style.padding = "72px 40px 56px";
  sec.style.display = "grid";
  sec.style.gridTemplateRows = p.media.length ? "auto auto 1fr auto" : "auto 1fr auto auto";
  sec.style.gap = "32px";
  const top = doc.createElement("div");
  top.style.display = "flex";
  top.style.flexDirection = "column";
  top.style.gap = "18px";
  p.overlines.forEach((o) => place(top, o));
  headingNodes(p).slice(0, 3).forEach(
    (t) => place(top, t, {
      fontSize: profile.isTypographic ? "48px" : "40px",
      lineHeight: "1.06",
      letterSpacing: "-0.03em",
      margin: "0"
    })
  );
  sec.appendChild(top);
  const mid = doc.createElement("div");
  mid.style.display = "flex";
  mid.style.flexDirection = "column";
  mid.style.gap = "16px";
  bodyNodes(p).forEach((b) => place(mid, b, { fontSize: "16px", lineHeight: "1.65", margin: "0" }));
  sec.appendChild(mid);
  const mediaBox = doc.createElement("div");
  mediaBox.style.display = "grid";
  mediaBox.style.gap = "12px";
  mediaBox.style.minHeight = p.media.length ? "0" : "80px";
  if (p.media.length === 2) mediaBox.style.gridTemplateRows = "1.15fr 0.85fr";
  else if (p.media.length >= 3) mediaBox.style.gridTemplateRows = "1.2fr 0.8fr 0.8fr";
  else mediaBox.style.gridTemplateRows = "1fr";
  p.media.forEach((m) => {
    const node = placeMedia(mediaBox, m, { flex: "1", minHeight: 220 });
    node.style.height = "100%";
  });
  sec.appendChild(mediaBox);
  sec.appendChild(metaStrip(doc, p) || doc.createElement("div"));
  doc.body.appendChild(sec);
  return finish(
    doc,
    SHARED + `.rc-balanced { align-content: stretch; }
       .rc-balanced .sv-media, .rc-balanced [data-sb-media] { height: 100%; }`,
    "balanced",
    profile,
    [
      "new/balanced: CSS grid \u0441 1fr-\u0440\u044F\u0434\u043E\u043C \u043F\u043E\u0434 \u043C\u0435\u0434\u0438\u0430, \u043D\u0438\u0437 \u043A\u0430\u0434\u0440\u0430 \u0437\u0430\u043D\u044F\u0442 \u043C\u0435\u0442\u043E\u0439",
      "\u043F\u0443\u0441\u0442\u043E\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0440\u0438\u0442\u043C, \u0430 \u043D\u0435 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0441\u043D\u0438\u0437\u0443 \u043A\u0430\u043A \u043E\u0431\u0440\u0435\u0437"
    ]
  );
}
function convertType(sourceHtml, profile) {
  const src = parseFragment(sourceHtml);
  const p = extractPieces(src);
  const doc = parseFragment("");
  const sec = shell(doc, "rc-type", p.background, p.color);
  sec.style.padding = "88px 40px 48px";
  p.overlines.forEach(
    (o) => place(sec, o, { marginBottom: "28px", letterSpacing: "0.16em", fontSize: "11px" })
  );
  headingNodes(p).slice(0, 2).forEach(
    (t, i) => place(sec, t, {
      fontSize: i === 0 ? "64px" : "28px",
      lineHeight: "0.98",
      letterSpacing: "-0.045em",
      margin: "0 0 28px",
      fontWeight: "700"
    })
  );
  bodyNodes(p).slice(0, 2).forEach(
    (b) => place(sec, b, { fontSize: "17px", lineHeight: "1.6", margin: "0 0 28px", maxWidth: "92%" })
  );
  if (p.media[0]) {
    const band = doc.createElement("div");
    band.style.margin = "12px 0 0";
    placeMedia(band, p.media[0], { aspect: "2.3 / 1", minHeight: 220 });
    sec.appendChild(band);
  }
  const spacer = doc.createElement("div");
  spacer.style.flex = "1";
  spacer.style.minHeight = "80px";
  sec.appendChild(spacer);
  const meta = metaStrip(doc, p);
  if (meta) {
    meta.style.marginTop = "auto";
    sec.appendChild(meta);
  }
  doc.body.appendChild(sec);
  return finish(doc, SHARED, "type", profile, [
    "new/type: \u043C\u0430\u0441\u0448\u0442\u0430\u0431 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D, \u043C\u0435\u0434\u0438\u0430 \u0441\u0432\u0435\u0434\u0435\u043D\u043E \u043A \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043B\u0430\u043D\u043A\u0435",
    "\u043D\u0438\u0436\u043D\u044F\u044F \u043C\u0435\u0442\u0430 \u0438 \u0432\u0435\u0440\u0445\u043D\u0438\u0435 \u043F\u043E\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u044E\u0442 \u0440\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u0443\u044E \u043F\u0430\u0443\u0437\u0443"
  ]);
}
return {convertEditorial,convertHero,convertMediaStack,convertBalanced,convertType};
})();
const {convertSmart,convertCompact,convertSplit,convertFit}=LEGACY;
const {convertEditorial,convertHero,convertMediaStack,convertBalanced,convertType}=NEW;

/* ---- convert.ts (их dispatch convertFromOriginal/sourceDocument) ---- */
function convertFromOriginal(sourceHtml, method, tpl) {
  const profile = analyzeHtml(sourceHtml, tpl);
  try {
    switch (method) {
      case "smart":
        return convertSmart(sourceHtml, profile, tpl);
      case "compact":
        return convertCompact(sourceHtml, profile);
      case "split":
        return convertSplit(sourceHtml, profile);
      case "fit":
        return convertFit(sourceHtml, profile);
      case "editorial":
        return convertEditorial(sourceHtml, profile);
      case "hero":
        return convertHero(sourceHtml, profile);
      case "mediastack":
        return convertMediaStack(sourceHtml, profile);
      case "balanced":
        return convertBalanced(sourceHtml, profile);
      case "type":
        return convertType(sourceHtml, profile);
      default:
        return convertFit(sourceHtml, profile);
    }
  } catch (err) {
    const doc = parseFragment(sourceHtml);
    const html = innerBody(doc);
    const bg = pickBg(doc);
    return {
      html,
      css: "",
      document: buildDocument(html, "", 900, bg),
      method,
      handler: profile.handler,
      analysis: profile,
      notes: [`\u041E\u0448\u0438\u0431\u043A\u0430 \u043D\u043E\u0432\u043E\u0433\u043E/\u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u0435\u0442\u043E\u0434\u0430, \u043F\u043E\u043A\u0430\u0437\u0430\u043D \u0438\u0441\u0445\u043E\u0434\u043D\u0438\u043A: ${err.message}`]
    };
  }
}
function sourceDocument(html) {
  const doc = parseFragment(html);
  return buildDocument(innerBody(doc), "", 1440, pickBg(doc));
}
return {analyzeHtml,recommendLegacy,recommendNew,convertFromOriginal,sourceDocument,METHODS,FRAME};
})();

window.RecomposeLab = window.RecomposeLab || {};
window.RecomposeLab.grok = GROK;
})();
