// Разбор исходного HTML-шаблона в список семантических блоков.
// Всегда читает заново ОРИГИНАЛЬНЫЙ HTML шаблона — результаты методов
// никогда не накапливаются и не берутся из уже сконвертированной разметки.

import type { Block, Bucket, ParsedTemplate } from "./types";

const ROLE_BUCKET: Record<string, Bucket> = {
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
  badge: "tag",
};

function extractAspect(style: string): number | undefined {
  const m = style.match(/aspect-ratio\s*:\s*([\d.]+)\s*\/\s*([\d.]+)/i);
  if (m) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    if (a > 0 && b > 0) return a / b;
  }
  return undefined;
}

function makeRepeatBlock(el: Element, idx: number): Block {
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
    repeatItems: items,
  };
}

function makeLeafBlock(el: Element, idx: number): Block {
  const role = el.getAttribute("data-role") || "other";
  const isMedia = el.hasAttribute("data-sb-media");
  const bucket: Bucket = isMedia ? "media" : ROLE_BUCKET[role] || "other";
  const style = el.getAttribute("style") || "";
  return {
    key: `b-${idx}`,
    role,
    bucket,
    slot: el.getAttribute("data-slot") || undefined,
    editable: el.hasAttribute("data-sb-editable"),
    isMedia,
    mediaKind: el.getAttribute("data-kind") || undefined,
    aspect: extractAspect(style),
    tag: el.tagName,
    style,
    html: el.outerHTML,
    inner: el.innerHTML,
    text: el.textContent || "",
  };
}

export function parseTemplate(html: string): ParsedTemplate {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const section = (doc.body.firstElementChild as HTMLElement) || doc.body;
  const blocks: Block[] = [];
  let counter = 0;

  function walk(node: Element) {
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
    roleCount: blocks.length,
  };
}
