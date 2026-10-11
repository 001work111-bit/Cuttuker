/**
 * FROZEN legacy methods for 16:9 → 9:16.
 * smart / compact / split / fit must not be rewritten to "fix" composition.
 * New algorithms live in methodsNew.ts and are selected separately.
 */
import type { ConvertResult, StructureProfile, TemplateMeta } from "./types";
import {
  parseFragment,
  innerBody,
  pickBg,
  flattenColumns,
  tighten,
  buildDocument,
} from "./html";

function finish(
  doc: Document,
  css: string,
  method: ConvertResult["method"],
  profile: StructureProfile,
  notes: string[]
): ConvertResult {
  const html = innerBody(doc);
  const bg = pickBg(doc);
  return {
    html,
    css,
    document: buildDocument(html, css, 900, bg),
    method,
    handler: profile.handler,
    analysis: profile,
    notes,
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

function isMediaPair(el: HTMLElement): boolean {
  const kids = Array.from(el.children) as HTMLElement[];
  if (kids.length < 2) return false;
  const mediaKids = kids.filter(
    (k) =>
      k.matches("[data-sb-media], .sv-media") ||
      k.querySelector("[data-sb-media], .sv-media")
  );
  return mediaKids.length >= 2 && mediaKids.length === kids.length;
}

function isMetaRow(el: HTMLElement): boolean {
  const s = el.getAttribute("style") || "";
  if (!/grid-template-columns/.test(s)) return false;
  const hasMedia = !!el.querySelector("[data-sb-media], .sv-media, img, video");
  const hasMeta = !!el.querySelector('[data-role="label"], [data-role="smallMeta"]');
  return !hasMedia && hasMeta;
}

export function convertSmart(
  sourceHtml: string,
  profile: StructureProfile,
  _tpl?: TemplateMeta
): ConvertResult {
  const doc = parseFragment(sourceHtml);
  const root = doc.body;
  const notes = [
    "legacy/smart: ролевая реконструкция без заполнения высоты кадра",
    `handler=${profile.handler}`,
  ];

  if (profile.handler === "indexhero") {
    /* Keep two media in a row — this is the historical behaviour. */
    flattenColumns(root, (el) => isMediaPair(el) || isMetaRow(el));
    tighten(root, "28px 28px 32px");
    return finish(doc, SMART_INDEXHERO, "smart", profile, notes);
  }

  if (profile.handler === "matrix") {
    flattenColumns(root, (el) => isMetaRow(el));
    const media = root.querySelector(".sv-media, [data-sb-media]") as HTMLElement | null;
    if (media) {
      media.style.width = "100%";
      media.style.aspectRatio = "16/9";
    }
    tighten(root, "28px 24px");
    return finish(doc, SMART_MATRIX, "smart", profile, notes);
  }

  if (profile.handler === "about") {
    flattenColumns(root, (el) => isMetaRow(el));
    const media = root.querySelector(".sv-media, [data-sb-media]") as HTMLElement | null;
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

export function convertCompact(
  sourceHtml: string,
  profile: StructureProfile
): ConvertResult {
  const doc = parseFragment(sourceHtml);
  flattenColumns(doc.body);
  tighten(doc.body, "28px 24px");
  return finish(doc, COMPACT_CSS, "compact", profile, [
    "legacy/compact: исходный DOM сохранён, сетка уплотнена",
  ]);
}

export function convertSplit(
  sourceHtml: string,
  profile: StructureProfile
): ConvertResult {
  const doc = parseFragment(sourceHtml);
  const media = Array.from(
    doc.querySelectorAll<HTMLElement>("[data-sb-media], .sv-media, img, video")
  );
  if (media.length === 0) {
    flattenColumns(doc.body);
    tighten(doc.body, "36px 32px");
    return finish(doc, SPLIT_CSS + COMPACT_CSS, "split", profile, [
      "legacy/split: медиа нет — fallback к уплотнению",
    ]);
  }

  const bg = pickBg(doc);
  const section = doc.querySelector("section, .sv-section") as HTMLElement | null;
  const color = section?.style.color || "#111";

  const textClone = section ? (section.cloneNode(true) as HTMLElement) : doc.body;
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
    "legacy/split: текст и медиа разведены в две зоны",
  ]);
}

export function convertFit(
  sourceHtml: string,
  profile: StructureProfile
): ConvertResult {
  const doc = parseFragment(sourceHtml);
  tighten(doc.body, "24px 20px");
  return finish(doc, FIT_CSS, "fit", profile, [
    "legacy/fit: минимальное вмешательство, контроль переполнения",
  ]);
}
