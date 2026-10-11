import { cloneEl, uniqueNodes } from "./html";

export interface Pieces {
  background: string;
  color: string;
  overlines: HTMLElement[];
  titles: HTMLElement[];
  statements: HTMLElement[];
  bodies: HTMLElement[];
  media: HTMLElement[];
  labels: HTMLElement[];
  metas: HTMLElement[];
  links: HTMLElement[];
  tags: HTMLElement[];
}

function all(doc: Document, sel: string): HTMLElement[] {
  return Array.from(doc.querySelectorAll<HTMLElement>(sel));
}

export function extractPieces(doc: Document): Pieces {
  const section = doc.querySelector("section, .sv-section") as HTMLElement | null;
  const background =
    section?.style.background || section?.style.backgroundColor || "#ffffff";
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
  const tags = labels.filter((l) =>
    /tag|collab|season/i.test(
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
    tags: tags.map(cloneEl),
  };
}

export function headingNodes(p: Pieces): HTMLElement[] {
  const seen = new Set<string>();
  const out: HTMLElement[] = [];
  for (const n of [...p.statements, ...p.titles]) {
    const key = (n.textContent || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

export function bodyNodes(p: Pieces): HTMLElement[] {
  const headingText = new Set(headingNodes(p).map((n) => (n.textContent || "").trim()));
  return p.bodies.filter((n) => {
    const t = (n.textContent || "").trim();
    return t && !headingText.has(t);
  });
}

export function restyleVoice(el: HTMLElement, extra: Record<string, string>) {
  Object.assign(el.style, extra);
  el.style.maxWidth = extra.maxWidth || "100%";
}

export function fillMedia(el: HTMLElement, opts: { minHeight?: number; aspect?: string; flex?: string }) {
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
    const n = m as HTMLElement;
    n.style.width = "100%";
    n.style.height = "100%";
    n.style.objectFit = "cover";
  });
}

export function pairLabels(p: Pieces): { label: HTMLElement; value: HTMLElement }[] {
  const pairs: { label: HTMLElement; value: HTMLElement }[] = [];
  const n = Math.min(p.labels.length, Math.max(p.metas.length, p.links.length));
  for (let i = 0; i < n; i++) {
    const value = p.links[i] || p.metas[i];
    if (p.labels[i] && value) pairs.push({ label: p.labels[i], value });
  }
  if (pairs.length === 0) return [];
  return pairs;
}
