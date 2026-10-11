import type { ConvertResult, StructureProfile } from "./types";
import { parseFragment, innerBody, buildDocument } from "./html";
import {
  extractPieces,
  headingNodes,
  bodyNodes,
  restyleVoice,
  fillMedia,
  pairLabels,
  type Pieces,
} from "./extract";

function shell(doc: Document, className: string, bg: string, color: string) {
  const sec = doc.createElement("section");
  sec.className = `sv-section rc-new ${className}`;
  sec.setAttribute(
    "style",
    `background:${bg}; color:${color || "inherit"}; width:900px; min-height:1600px; display:flex; flex-direction:column;`
  );
  return sec;
}

function finish(
  doc: Document,
  css: string,
  method: ConvertResult["method"],
  profile: StructureProfile,
  notes: string[]
): ConvertResult {
  const html = innerBody(doc);
  const bg =
    (doc.querySelector("section") as HTMLElement | null)?.style.background || "#fff";
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

function bring(doc: Document, el: HTMLElement): HTMLElement {
  return doc.importNode(el, true) as HTMLElement;
}

function place(
  parent: HTMLElement,
  el: HTMLElement,
  extra?: Record<string, string>
): HTMLElement {
  const node = bring(parent.ownerDocument, el);
  if (extra) restyleVoice(node, extra);
  parent.appendChild(node);
  return node;
}

function placeMedia(
  parent: HTMLElement,
  el: HTMLElement,
  opts: { minHeight?: number; aspect?: string; flex?: string }
): HTMLElement {
  const node = bring(parent.ownerDocument, el);
  fillMedia(node, opts);
  parent.appendChild(node);
  return node;
}

function metaStrip(doc: Document, p: Pieces): HTMLElement | null {
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

export function convertEditorial(sourceHtml: string, profile: StructureProfile): ConvertResult {
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
      margin: "0",
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
    p.media.forEach((m) =>
      placeMedia(stack, m, { flex: "1 1 0", minHeight: p.media.length === 1 ? 520 : 280 })
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
    "new/editorial: роли распределены по высоте 1600px через space-between",
    "медиа растягивается в средней зоне, мета закреплена внизу",
  ]);
}

export function convertHero(sourceHtml: string, profile: StructureProfile): ConvertResult {
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

  headingNodes(p).slice(0, 2).forEach((t) =>
    place(sec, t, {
      fontSize: "40px",
      lineHeight: "1.05",
      letterSpacing: "-0.03em",
      margin: "0",
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
      "new/hero: первое медиа занимает основную высоту кадра",
      "текст служит обвязкой сверху и снизу, а не конкурирует размером",
    ]
  );
}

export function convertMediaStack(sourceHtml: string, profile: StructureProfile): ConvertResult {
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

  headingNodes(p)
    .slice(0, 1)
    .forEach((t) =>
      place(sec, t, {
        fontSize: "36px",
        lineHeight: "1.05",
        letterSpacing: "-0.03em",
        margin: "0 0 4px",
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
    "new/mediastack: каждое медиа — отдельный крупный кадр по высоте",
    "горизонтальные пары 16:9 намеренно разобраны",
  ]);
}

export function convertBalanced(sourceHtml: string, profile: StructureProfile): ConvertResult {
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
  headingNodes(p)
    .slice(0, 3)
    .forEach((t) =>
      place(top, t, {
        fontSize: profile.isTypographic ? "48px" : "40px",
        lineHeight: "1.06",
        letterSpacing: "-0.03em",
        margin: "0",
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
    SHARED +
      `.rc-balanced { align-content: stretch; }
       .rc-balanced .sv-media, .rc-balanced [data-sb-media] { height: 100%; }`,
    "balanced",
    profile,
    [
      "new/balanced: CSS grid с 1fr-рядом под медиа, низ кадра занят метой",
      "пустое пространство входит в ритм, а не остаётся снизу как обрез",
    ]
  );
}

export function convertType(sourceHtml: string, profile: StructureProfile): ConvertResult {
  const src = parseFragment(sourceHtml);
  const p = extractPieces(src);
  const doc = parseFragment("");
  const sec = shell(doc, "rc-type", p.background, p.color);
  sec.style.padding = "88px 40px 48px";

  p.overlines.forEach((o) =>
    place(sec, o, { marginBottom: "28px", letterSpacing: "0.16em", fontSize: "11px" })
  );

  headingNodes(p)
    .slice(0, 2)
    .forEach((t, i) =>
      place(sec, t, {
        fontSize: i === 0 ? "64px" : "28px",
        lineHeight: "0.98",
        letterSpacing: "-0.045em",
        margin: "0 0 28px",
        fontWeight: "700",
      })
    );

  bodyNodes(p)
    .slice(0, 2)
    .forEach((b) =>
      place(sec, b, { fontSize: "17px", lineHeight: "1.6", margin: "0 0 28px", maxWidth: "92%" })
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
    "new/type: масштаб заголовка сохранён, медиа сведено к горизонтальной планке",
    "нижняя мета и верхние поля создают редакционную паузу",
  ]);
}
