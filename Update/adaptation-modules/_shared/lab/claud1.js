/* _shared/lab/claud1.js — семейство Claude 1 из лаборатории (index.html, блок «fam_claud1»).
   Текст блока перенесён без изменений; единственное добавление — экспорт в RecomposeLab.claud1. */
(function(){
/*
 * ════════════════════════════════════════════════════════════════════
 *  СЕМЕЙСТВО «CLAUDE 1» — 9 методов (4 baseline + 5 advanced)
 *  Источники (код методов перенесён вербатим, esbuild стёр только
 *  TS-аннотации и import/export; тела функций не редактировались):
 *   add-916-adaptation-methods_Claud1/src/lib/types.ts  (CANVAS_W/H)
 *   add-916-adaptation-methods_Claud1/src/lib/parse.ts
 *   add-916-adaptation-methods_Claud1/src/lib/methods/shared.ts
 *   add-916-adaptation-methods_Claud1/src/lib/methods/baseline.ts
 *   add-916-adaptation-methods_Claud1/src/lib/methods/advanced.ts
 * ════════════════════════════════════════════════════════════════════
 */
const CLAUD1=(()=>{'use strict';

/* ---- types.ts (константы холста) ---- */
const CANVAS_W = 900;
const CANVAS_H = 1600;

/* ---- parse.ts (разбор шаблона в семантические блоки) ---- */
const ROLE_BUCKET = {
  overline: "overline",
  eyebrow: "overline",
  kicker: "overline",
  tagline: "overline",
  title: "title",
  statement: "title",
  headline: "title",
  heading: "title",
  body: "body",
  paragraph: "body",
  quote: "body",
  lead: "body",
  label: "meta",
  smallMeta: "meta",
  value: "meta",
  link: "meta",
  meta: "meta",
  stat: "meta",
  statValue: "meta",
  statLabel: "meta",
  caption: "meta",
  pill: "tag",
  tag: "tag",
  badge: "tag"
};
function extractAspect(style) {
  const m = style.match(/aspect-ratio\s*:\s*([\d.]+)\s*\/\s*([\d.]+)/i);
  if (m) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    if (a > 0 && b > 0) return a / b;
  }
  return void 0;
}
function makeRepeatBlock(el, idx) {
  const items = Array.from(el.children).map((c) => c.outerHTML);
  return {
    key: `repeat-${idx}`,
    role: el.getAttribute("data-sb-repeat") || "repeat",
    bucket: "repeat",
    editable: false,
    isMedia: false,
    tag: el.tagName,
    style: el.getAttribute("style") || "",
    html: el.outerHTML,
    inner: el.innerHTML,
    text: el.textContent || "",
    repeatItems: items
  };
}
function makeLeafBlock(el, idx) {
  const role = el.getAttribute("data-role") || "other";
  const isMedia = el.hasAttribute("data-sb-media");
  const bucket = isMedia ? "media" : ROLE_BUCKET[role] || "other";
  const style = el.getAttribute("style") || "";
  return {
    key: `b-${idx}`,
    role,
    bucket,
    slot: el.getAttribute("data-slot") || void 0,
    editable: el.hasAttribute("data-sb-editable"),
    isMedia,
    mediaKind: el.getAttribute("data-kind") || void 0,
    aspect: extractAspect(style),
    tag: el.tagName,
    style,
    html: el.outerHTML,
    inner: el.innerHTML,
    text: el.textContent || ""
  };
}
function parseTemplate(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const section = doc.body.firstElementChild || doc.body;
  const blocks = [];
  let counter = 0;
  function walk(node) {
    for (const el of Array.from(node.children)) {
      if (el.hasAttribute("data-sb-repeat")) {
        blocks.push(makeRepeatBlock(el, counter++));
        continue;
      }
      if (el.hasAttribute("data-role")) {
        blocks.push(makeLeafBlock(el, counter++));
        continue;
      }
      walk(el);
    }
  }
  walk(section);
  const sectionStyle = section.getAttribute("style") || "";
  const bgMatch = sectionStyle.match(/background\s*:\s*([^;]+)/i);
  return {
    bg: bgMatch ? bgMatch[1].trim() : "#ffffff",
    sectionStyle,
    blocks,
    mediaCount: blocks.filter((b) => b.bucket === "media").length,
    roleCount: blocks.length
  };
}

/* ---- methods/shared.ts (общие хелперы рендера) ---- */
const BASE_DOC_CSS = `
  :root{--pad:80px}
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
  img{max-width:100%;display:block}
  .sv-canvas{position:relative;width:${CANVAS_W}px;min-height:${CANVAS_H}px;overflow:hidden}
`;
function docShell(bodyHtml, bg = "#ffffff") {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_DOC_CSS}</style></head><body style="background:${bg}">${bodyHtml}</body></html>`;
}
function pick(blocks, bucket) {
  return blocks.filter((b) => b.bucket === bucket);
}
function first(blocks, bucket) {
  return blocks.find((b) => b.bucket === bucket);
}
function rest(blocks, exclude) {
  const ex = new Set(exclude.map((b) => b.key));
  return blocks.filter((b) => !ex.has(b.key));
}
function box(html, style = "") {
  return `<div style="${style}">${html}</div>`;
}
function renderMedia(b, styleOverride) {
  const urlMatch = b.style.match(/url\(([^)]+)\)/);
  const bg = urlMatch ? `background:#e7e5e0 url(${urlMatch[1]}) center/cover no-repeat;` : "";
  const dataAttrsRaw = b.html.match(/<[a-zA-Z0-9]+((?:\s+[a-zA-Z0-9-:]+(?:="[^"]*")?)*)/)?.[1] || "";
  const dataAttrs = dataAttrsRaw.replace(/\sstyle="[^"]*"/, "");
  return `<div${dataAttrs} style="${bg}${styleOverride}"></div>`;
}
function renderText(b, styleOverride) {
  const openTagMatch = b.html.match(/^<([a-zA-Z0-9]+)([^>]*)>/);
  const tag = openTagMatch ? openTagMatch[1] : "div";
  const attrsRaw = openTagMatch ? openTagMatch[2] : "";
  const attrs = attrsRaw.replace(/\sstyle="[^"]*"/, "");
  return `<${tag}${attrs} style="${styleOverride}">${b.inner}</${tag}>`;
}
function metaRow(blocks, styleOverride = "") {
  if (!blocks.length) return "";
  const items = [];
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
function tagRow(blocks) {
  if (!blocks.length) return "";
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;">${blocks.map((b) => renderText(b, "font-size:11px;border:1px solid currentColor;padding:4px 10px;border-radius:999px;opacity:.85;")).join("")}</div>`;
}
function repeatList(block, styleOverride, itemStyle) {
  if (!block.repeatItems) return "";
  const items = block.repeatItems.map((html) => `<div style="${itemStyle}">${stripLayout(html)}</div>`).join("");
  return `<div style="${styleOverride}">${items}</div>`;
}
function stripLayout(html) {
  return html.replace(/grid-template-columns:[^;]+;/gi, "grid-template-columns:44px 1fr;").replace(/font-size:\s*clamp\([^)]+\)/gi, "font-size:15px");
}
function approxTextHeight(text, fontSize, width, lineHeight = 1.5) {
  const charsPerLine = Math.max(6, Math.floor(width / (fontSize * 0.56)));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return Math.round(lines * fontSize * lineHeight);
}
function textColorFor(bg) {
  const hex = bg.match(/#([0-9a-f]{3,6})/i)?.[1];
  if (!hex) return "#15181f";
  let r, g, b;
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

/* ---- methods/baseline.ts (4 базовых метода этой программы) ---- */
function methodFit(parsed, rawSectionHtml, naturalWidth) {
  const scale = CANVAS_W / naturalWidth;
  const html = `<div style="width:${CANVAS_W}px;background:${parsed.bg};position:relative;overflow:hidden;">
    <div style="width:${naturalWidth}px;zoom:${scale};">${rawSectionHtml}</div>
  </div>`;
  return {
    html,
    notes: [
      `\u0420\u0430\u0432\u043D\u043E\u043C\u0435\u0440\u043D\u043E\u0435 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430 (\u2248${Math.round(scale * 100)}%) \u0431\u0435\u0437 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F DOM \u0438 \u043F\u043E\u0440\u044F\u0434\u043A\u0430 \u0431\u043B\u043E\u043A\u043E\u0432.`,
      "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430: \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0438\u0441\u0445\u043E\u0434\u043D\u0443\u044E \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0443 \xAB\u043F\u0443\u0441\u0442\u043E \u0441\u043D\u0438\u0437\u0443 / \u043E\u0431\u0440\u0435\u0437\u0430\u043D\u043E\xBB, \u0435\u0441\u043B\u0438 \u043E\u043D\u0430 \u0435\u0441\u0442\u044C."
    ]
  };
}
function methodCompact(rawSectionHtml) {
  let out = rawSectionHtml;
  out = out.replace(/gap:\s*([\d.]+)px/gi, (_m, n) => `gap:${Math.max(8, Math.round(parseFloat(n) * 0.55))}px`);
  out = out.replace(/padding:\s*([\d.]+)px\s+var\(--pad\)/gi, (_m, n) => `padding:${Math.max(24, Math.round(parseFloat(n) * 0.5))}px 24px`);
  out = out.replace(/padding:\s*clamp\([^;]*?\)\s*var\(--pad\)/gi, "padding:28px 24px");
  out = out.replace(/var\(--pad\)/g, "24px");
  out = out.replace(/padding:\s*([\d.]+)px/gi, (_m, n) => `padding:${Math.max(14, Math.round(parseFloat(n) * 0.5))}px`);
  out = out.replace(/grid-template-columns:\s*[^;"']+;/gi, "grid-template-columns:1fr;");
  out = out.replace(/max-width:\s*\d+px/gi, "max-width:100%");
  out = out.replace(/clamp\(([\d.]+)px,([^,]+),([\d.]+)px\)/gi, (_m, min, mid, max) => `clamp(${Math.max(12, Math.round(parseFloat(min) * 0.9))}px,${mid},${Math.round(parseFloat(max) * 0.62)}px)`);
  const html = `<div style="width:${CANVAS_W}px;overflow:visible;">
    <div style="width:${CANVAS_W}px;">${out}</div>
  </div>`;
  return {
    html,
    notes: [
      "\u0418\u0441\u0445\u043E\u0434\u043D\u044B\u0439 DOM \u0438 \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u2014 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B \u043D\u0435 \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u044B.",
      "\u041C\u043D\u043E\u0433\u043E\u043A\u043E\u043B\u043E\u043D\u043E\u0447\u043D\u044B\u0435 grid-\u0431\u043B\u043E\u043A\u0438 \u0441\u0432\u0451\u0440\u043D\u0443\u0442\u044B \u0432 \u043E\u0434\u043D\u0443 \u043A\u043E\u043B\u043E\u043D\u043A\u0443, \u043E\u0442\u0441\u0442\u0443\u043F\u044B \u0438 \u0448\u0440\u0438\u0444\u0442\u044B \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u044B."
    ]
  };
}
function methodSplit(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const media = pick(blocks, "media");
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const repeats = pick(blocks, "repeat");
  const zoneA = [];
  const zoneB = [];
  if (media[0]) {
    zoneA.push(renderMedia(media[0], "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"));
    if (media.length > 1) {
      zoneA.push(
        `<div style="position:absolute;left:0;right:0;bottom:0;display:flex;gap:6px;padding:10px;">${media.slice(1, 4).map((m) => renderMedia(m, "flex:1;height:84px;object-fit:cover;border:2px solid #fff;")).join("")}</div>`
      );
    }
    if (overline) zoneB.push(renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.65;margin-bottom:10px;display:block;"));
    if (title) zoneB.push(renderText(title, "font-size:30px;line-height:1.12;font-weight:700;margin:0 0 14px;display:block;"));
  } else {
    if (overline) zoneA.push(renderText(overline, "font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:16px;display:block;"));
    if (title) zoneA.push(renderText(title, "font-size:38px;line-height:1.08;font-weight:800;margin:0;display:block;"));
  }
  body.forEach((b) => zoneB.push(renderText(b, "font-size:15px;line-height:1.7;margin:0 0 16px;display:block;")));
  if (meta.length) zoneB.push(metaRow(meta, "margin-top:8px;"));
  if (tags.length) zoneB.push(tagRow(tags));
  repeats.forEach(
    (r) => zoneB.push(repeatList(r, "display:flex;flex-direction:column;gap:10px;margin-top:16px;", "border-top:1px solid currentColor;opacity:.9;padding-top:10px;font-size:13px;"))
  );
  const zoneAHeight = media.length ? Math.round(CANVAS_H * 0.56) : Math.round(CANVAS_H * 0.4);
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">
    <div style="position:relative;flex:0 0 ${zoneAHeight}px;background:#111;display:flex;flex-direction:column;justify-content:center;padding:${media.length ? "0" : "40px 32px"};overflow:hidden;">${zoneA.join("")}</div>
    <div style="flex:none;padding:32px;border-top:3px solid currentColor;display:flex;flex-direction:column;">${zoneB.join("")}</div>
  </div>`;
  return {
    html,
    notes: ["\u042F\u0432\u043D\u0430\u044F \u0434\u0432\u0443\u0445\u0437\u043E\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F: \u0432\u0435\u0440\u0445 \u2014 \u0430\u043A\u0446\u0435\u043D\u0442 (\u043C\u0435\u0434\u0438\u0430 \u0438\u043B\u0438 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A), \u043D\u0438\u0437 \u2014 \u0442\u0435\u043A\u0441\u0442/\u043C\u0435\u0442\u0430 \u0441 \u0447\u0451\u0442\u043A\u043E\u0439 \u043B\u0438\u043D\u0438\u0435\u0439 \u0440\u0430\u0437\u0434\u0435\u043B\u0430."]
  };
}
function methodSmart(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const repeats = pick(blocks, "repeat");
  const parts = [];
  parts.push(`<div style="padding:40px 32px 0;">`);
  if (overline) parts.push(renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:14px;display:block;"));
  if (title) parts.push(renderText(title, "font-size:34px;line-height:1.12;font-weight:800;margin:0 0 20px;display:block;"));
  parts.push(`</div>`);
  if (media[0]) {
    const ar = media[0].aspect ? media[0].aspect : 4 / 3;
    parts.push(`<div style="padding:0 24px;margin-bottom:20px;">${renderMedia(media[0], `width:100%;aspect-ratio:${ar}/1;object-fit:cover;border-radius:4px;`)}</div>`);
  }
  parts.push(`<div style="padding:0 32px;display:flex;flex-direction:column;gap:14px;">`);
  body.forEach((b) => parts.push(renderText(b, "font-size:15px;line-height:1.7;margin:0;display:block;")));
  parts.push(`</div>`);
  if (media.length > 1) {
    parts.push(
      `<div style="display:flex;gap:10px;padding:20px 24px 0;">${media.slice(1).map((m) => renderMedia(m, "flex:1;aspect-ratio:1/1;object-fit:cover;border-radius:4px;")).join("")}</div>`
    );
  }
  repeats.forEach(
    (r) => parts.push(`<div style="padding:20px 24px 0;">${repeatList(r, "display:flex;flex-direction:column;gap:10px;", "border-top:1px solid currentColor;opacity:.85;padding-top:10px;font-size:13px;")}</div>`)
  );
  const footer = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  if (footer.length) parts.push(`<div style="padding:24px 32px 32px;display:flex;flex-direction:column;gap:14px;border-top:1px solid currentColor;">${footer.join("")}</div>`);
  else parts.push(`<div style="padding-bottom:32px;"></div>`);
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">${parts.join("")}</div>`;
  return {
    html,
    notes: ["\u041F\u043E\u0440\u044F\u0434\u043E\u043A \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0451\u043D \u043F\u043E \u0440\u043E\u043B\u044F\u043C: overline \u2192 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u2192 \u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u043C\u0435\u0434\u0438\u0430 \u2192 \u0442\u0435\u043A\u0441\u0442 \u2192 \u0434\u043E\u043F. \u043C\u0435\u0434\u0438\u0430/\u043F\u043E\u0432\u0442\u043E\u0440\u044B \u2192 \u043C\u0435\u0442\u0430/\u0442\u0435\u0433\u0438."]
  };
}

/* ---- methods/advanced.ts (5 новых методов этой программы) ---- */
function methodEditorial(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const repeats = pick(blocks, "repeat");
  const head = `<div style="flex:0 0 auto;padding:48px 36px 0;">${overline ? renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin-bottom:16px;display:block;") : ""}${title ? renderText(title, "font-size:38px;line-height:1.08;font-weight:800;margin:0;display:block;") : ""}</div>`;
  const mediaBlock = media[0] ? `<div style="flex:1 1 auto;min-height:0;display:flex;align-items:center;padding:36px;">${renderMedia(
    media[0],
    "width:100%;height:100%;max-height:560px;object-fit:cover;border-radius:6px;"
  )}</div>` : `<div style="flex:1 1 auto;"></div>`;
  const bodyBlock = body.length ? `<div style="flex:0 0 auto;padding:0 36px;display:flex;flex-direction:column;gap:16px;">${body.map((b) => renderText(b, "font-size:17px;line-height:1.75;margin:0;display:block;")).join("")}</div>` : "";
  const repeatBlock = repeats.length ? repeats.map((r) => `<div style="padding:24px 36px 0;">${repeatList(r, "display:flex;flex-direction:column;gap:12px;", "border-top:1px solid currentColor;opacity:.85;padding-top:12px;font-size:14px;")}</div>`).join("") : "";
  const footer = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  const footerBlock = footer.length ? `<div style="flex:0 0 auto;padding:28px 36px 44px;border-top:1px solid currentColor;display:flex;flex-direction:column;gap:14px;">${footer.join("")}</div>` : `<div style="flex:0 0 40px;"></div>`;
  const html = `<div style="width:${CANVAS_W}px;height:${CANVAS_H}px;display:flex;flex-direction:column;background:${bg};color:${color};">${head}${mediaBlock}${bodyBlock}${repeatBlock}${footerBlock}</div>`;
  return {
    html,
    notes: [
      "\u0421\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0440\u0430\u0441\u0442\u044F\u043D\u0443\u0442\u043E \u043D\u0430 \u0432\u0441\u044E \u0432\u044B\u0441\u043E\u0442\u0443 1600px \u0447\u0435\u0440\u0435\u0437 \u0433\u0438\u0431\u043A\u0438\u0435 \u043F\u0440\u043E\u043F\u043E\u0440\u0446\u0438\u0438 (flex-grow), \u0430 \u043D\u0435 \u0441\u043E\u0431\u0440\u0430\u043D\u043E \u0432 \u0432\u0435\u0440\u0445\u043D\u0435\u0439 \u0447\u0430\u0441\u0442\u0438 \u043A\u0430\u0434\u0440\u0430.",
      "\u041F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432 \xAB\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A + \u0442\u0435\u043A\u0441\u0442 (+ 0-1 \u043C\u0435\u0434\u0438\u0430) + \u043C\u0435\u0442\u0430\xBB, \u0433\u0434\u0435 \u0440\u0438\u0441\u043A \u043F\u0443\u0441\u0442\u043E\u0433\u043E \u043D\u0438\u0437\u0430 \u043D\u0430\u0438\u0431\u043E\u043B\u0435\u0435 \u0432\u0435\u043B\u0438\u043A."
    ]
  };
}
function methodHeroMedia(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const heroH = Math.round(CANVAS_H * 0.64);
  const hero = media[0] ? `<div style="position:relative;flex:0 0 ${heroH}px;overflow:hidden;">${renderMedia(media[0], "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")}
        <div style="position:absolute;left:0;right:0;bottom:0;padding:28px 32px 26px;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,0));">
          ${overline ? renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;opacity:.85;margin-bottom:10px;display:block;") : ""}
          ${title ? renderText(title, "font-size:30px;line-height:1.14;font-weight:800;color:#fff;margin:0;display:block;") : ""}
        </div>
      </div>` : `<div style="flex:0 0 ${heroH}px;display:flex;flex-direction:column;justify-content:center;padding:40px 32px;">${overline ? renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:14px;display:block;") : ""}${title ? renderText(title, "font-size:34px;line-height:1.1;font-weight:800;margin:0;display:block;") : ""}</div>`;
  const secondary = media.slice(1, 4);
  const secondaryRow = secondary.length ? `<div style="display:flex;gap:8px;padding:18px 24px 0;">${secondary.map((m) => renderMedia(m, "flex:1;aspect-ratio:1/1;object-fit:cover;border-radius:4px;")).join("")}</div>` : "";
  const footer = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">
    ${hero}
    <div style="flex:none;display:flex;flex-direction:column;gap:16px;padding:24px 32px 32px;">
      ${body.map((b) => renderText(b, "font-size:16px;line-height:1.75;margin:0;display:block;")).join("")}
      ${secondaryRow}
      <div style="display:flex;flex-direction:column;gap:14px;">${footer.join("")}</div>
    </div>
  </div>`;
  return {
    html,
    notes: [
      "\u0413\u043B\u0430\u0432\u043D\u043E\u0435 \u043C\u0435\u0434\u0438\u0430 \u043F\u043E\u0434\u0430\u043D\u043E \u043D\u0430 \u0432\u0441\u044E \u0448\u0438\u0440\u0438\u043D\u0443 \u043A\u0430\u0434\u0440\u0430 (full-bleed) \u0441 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u043E\u043C-\u043F\u043E\u0434\u043F\u0438\u0441\u044C\u044E \u043F\u043E\u0432\u0435\u0440\u0445 \u0437\u0430\u0442\u0435\u043C\u043D\u0435\u043D\u0438\u044F \u2014 \u043F\u043E\u0441\u0442\u0435\u0440\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F.",
      "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432 \u0441 \u043E\u0434\u043D\u0438\u043C \u0434\u043E\u043C\u0438\u043D\u0438\u0440\u0443\u044E\u0449\u0438\u043C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435\u043C/\u0432\u0438\u0434\u0435\u043E \u0438 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u043C \u0442\u0435\u043A\u0441\u0442\u043E\u043C."
    ]
  };
}
function methodMediaGrid(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const title = first(blocks, "title") || first(blocks, "overline");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const headerBlock = title ? `<div style="flex:0 0 auto;padding:36px 28px 18px;">${renderText(title, "font-size:26px;line-height:1.15;font-weight:800;margin:0;display:block;")}</div>` : "";
  const primary = media[0];
  const rest = media.slice(1);
  const primaryBlock = primary ? `<div style="flex:0 0 auto;padding:0 24px 12px;">${renderMedia(primary, "width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:6px;")}</div>` : "";
  let gridBlock = "";
  if (rest.length === 1) {
    gridBlock = `<div style="padding:0 24px 12px;">${renderMedia(rest[0], "width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;")}</div>`;
  } else if (rest.length >= 2) {
    gridBlock = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 24px 12px;">${rest.slice(0, 4).map((m) => renderMedia(m, "width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:6px;")).join("")}</div>`;
  }
  const textBlock = body.length ? `<div style="padding:8px 28px 0;display:flex;flex-direction:column;gap:10px;">${body.map((b) => renderText(b, "font-size:14px;line-height:1.65;margin:0;opacity:.9;display:block;")).join("")}</div>` : "";
  const footer = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  const footerBlock = footer.length ? `<div style="margin-top:auto;padding:20px 28px 32px;display:flex;flex-direction:column;gap:12px;border-top:1px solid currentColor;">${footer.join("")}</div>` : `<div style="padding-bottom:28px;"></div>`;
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">${headerBlock}${primaryBlock}${gridBlock}${textBlock}${footerBlock}</div>`;
  return {
    html,
    notes: [
      `\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E \u043C\u0435\u0434\u0438\u0430-\u0431\u043B\u043E\u043A\u043E\u0432: ${media.length}. \u041F\u0435\u0440\u0432\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u043B\u043E \u043A\u0440\u0443\u043F\u043D\u044B\u043C \u044F\u043A\u043E\u0440\u0435\u043C (4:5), \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043E\u0431\u0440\u0430\u0437\u0443\u044E\u0442 \u0441\u0435\u0442\u043A\u0443 \u0442\u0430\u0439\u043B\u043E\u0432 \u2014 \u0432\u043C\u0435\u0441\u0442\u043E \u0442\u0435\u0441\u043D\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u0430 \u0441\u0432\u0435\u0440\u0445\u0443 \u043A\u0430\u0434\u0440\u0430.`,
      "\u041F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u0433\u0430\u043B\u0435\u0440\u0435\u0439, \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0439 \xAB\u0434\u043E/\u043F\u043E\u0441\u043B\u0435\xBB, \u043A\u0430\u0440\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0435\u0442\u043E\u043A \u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432 \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F\u043C\u0438."
    ]
  };
}
function methodBalanced(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const weight = {
    overline: 0.4,
    title: 2.6,
    media: 4,
    body: 1.8,
    meta: 1,
    tag: 0.4,
    repeat: 3,
    other: 0.5
  };
  const renderables = blocks.filter((b) => b.bucket !== "tag");
  const totalWeight = renderables.reduce((s, b) => s + weight[b.bucket], 0) || 1;
  const PAD = 28;
  const usable = CANVAS_H - PAD * 2;
  const minGap = 14;
  const gapsTotal = minGap * Math.max(0, renderables.length - 1);
  const contentHeight = Math.max(usable - gapsTotal, usable * 0.6);
  const groups = [];
  const tags = pick(blocks, "tag");
  renderables.forEach((b) => {
    const share = weight[b.bucket] / totalWeight;
    const h = Math.max(48, Math.round(contentHeight * share));
    if (b.bucket === "media") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderMedia(b, `width:100%;height:${h}px;object-fit:cover;border-radius:6px;`)}</div>`);
    } else if (b.bucket === "repeat") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;max-height:${h}px;overflow:hidden;">${repeatList(b, "display:flex;flex-direction:column;gap:10px;", "border-top:1px solid currentColor;opacity:.85;padding-top:10px;font-size:13px;")}</div>`);
    } else if (b.bucket === "title") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;display:flex;align-items:center;min-height:${Math.min(h, 160)}px;">${renderText(b, "font-size:30px;line-height:1.12;font-weight:800;margin:0;display:block;")}</div>`);
    } else if (b.bucket === "overline") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderText(b, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.65;display:block;")}</div>`);
    } else if (b.bucket === "body") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderText(b, "font-size:15px;line-height:1.7;margin:0;display:block;")}</div>`);
    } else if (b.bucket === "meta") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderText(b, "font-size:13px;line-height:1.5;margin:0;opacity:.85;display:block;")}</div>`);
    }
  });
  if (tags.length) groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${tagRow(tags)}</div>`);
  const html = `<div style="width:${CANVAS_W}px;min-height:${CANVAS_H}px;display:flex;flex-direction:column;justify-content:center;gap:${minGap}px;padding:${PAD}px 0;background:${bg};color:${color};">${groups.join("")}</div>`;
  return {
    html,
    notes: [
      "\u0412\u044B\u0441\u043E\u0442\u0430 \u0431\u043B\u043E\u043A\u043E\u0432 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u0430 \u043F\u0440\u043E\u043F\u043E\u0440\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E \u0438\u0445 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0432\u0435\u0441\u0443 (\u043C\u0435\u0434\u0438\u0430 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u044B \u2014 \u0442\u044F\u0436\u0435\u043B\u0435\u0435, \u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u0438 \u0442\u0435\u0433\u0438 \u2014 \u043B\u0435\u0433\u0447\u0435).",
      "\u0413\u0440\u0443\u043F\u043F\u044B \u0446\u0435\u043D\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u044B \u043F\u043E \u0432\u044B\u0441\u043E\u0442\u0435 \u043A\u0430\u0434\u0440\u0430 \u0441 \u0440\u0430\u0432\u043D\u044B\u043C\u0438 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u0430\u043C\u0438 \u2014 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 \u0434\u043B\u044F \u0430\u0441\u0438\u043C\u043C\u0435\u0442\u0440\u0438\u0447\u043D\u044B\u0445 \u0441\u0435\u0442\u043E\u043A \u0438 \u0441\u043C\u0435\u0448\u0430\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0430."
    ]
  };
}
function methodTypographic(parsed) {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const body = pick(blocks, "body");
  const media = pick(blocks, "media");
  const meta = pick(blocks, "meta");
  const accent = media[0] ? `<div style="position:absolute;right:28px;bottom:28px;width:120px;">${renderMedia(media[0], "width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:6px;opacity:.9;")}</div>` : "";
  const html = `<div style="position:relative;width:${CANVAS_W}px;height:${CANVAS_H}px;display:flex;flex-direction:column;background:${bg};color:${color};">
    <div style="flex:0 0 auto;padding:48px 36px 0;">${overline ? renderText(overline, "font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.65;display:block;") : ""}</div>
    <div style="flex:1;display:flex;align-items:center;padding:0 36px;">${title ? renderText(title, "font-size:64px;line-height:0.98;font-weight:800;letter-spacing:-2px;margin:0;display:block;") : ""}</div>
    <div style="flex:0 0 auto;padding:0 36px 40px;display:flex;flex-direction:column;gap:18px;">
      ${body.map((b) => renderText(b, "font-size:16px;line-height:1.7;max-width:640px;margin:0;opacity:.85;display:block;")).join("")}
      ${meta.length ? metaRow(meta) : ""}
    </div>
    ${accent}
  </div>`;
  return {
    html,
    notes: [
      "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D \u0438 \u0437\u0430\u043D\u0438\u043C\u0430\u0435\u0442 \u043E\u0441\u043D\u043E\u0432\u043D\u0443\u044E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C \u043A\u0430\u0434\u0440\u0430, \u043C\u0435\u0434\u0438\u0430 (\u0435\u0441\u043B\u0438 \u0435\u0441\u0442\u044C) \u0441\u0432\u0435\u0434\u0435\u043D\u043E \u043A \u043D\u0435\u0431\u043E\u043B\u044C\u0448\u043E\u043C\u0443 \u0430\u043A\u0446\u0435\u043D\u0442\u0443 \u0432 \u0443\u0433\u043B\u0443.",
      "\u041F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u043E\u0431\u043B\u043E\u0436\u0435\u043A-\u0437\u0430\u044F\u0432\u043B\u0435\u043D\u0438\u0439 \u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432, \u0433\u0434\u0435 \u0433\u043B\u0430\u0432\u043D\u0430\u044F \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u2014 \u043A\u0440\u0443\u043F\u043D\u0430\u044F \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430, \u0430 \u043D\u0435 \u0438\u043B\u043B\u044E\u0441\u0442\u0440\u0430\u0446\u0438\u044F."
    ]
  };
}
return {parseTemplate,docShell,methodSmart,methodCompact,methodSplit,methodFit,
 methodEditorial,methodHeroMedia,methodMediaGrid,methodBalanced,methodTypographic,
 CANVAS_W,CANVAS_H,textColorFor,BASE_DOC_CSS};
})();

window.RecomposeLab = window.RecomposeLab || {};
window.RecomposeLab.claud1 = CLAUD1;
})();
