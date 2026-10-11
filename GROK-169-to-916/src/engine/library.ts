import type { LibraryPack, TemplateMeta } from "./types";

function grab(block: string, key: string): string {
  const re = new RegExp(`${key}\\s*:\\s*["']([^"']*)["']`);
  const m = block.match(re);
  return m ? m[1] : "";
}

export function parseLibrarySource(source: string, filename: string): LibraryPack {
  const templates: TemplateMeta[] = [];
  const re =
    /\{\s*tpl\s*:\s*["']([^"']+)["'][\s\S]*?build\s*:\s*i?\s*=>\s*`([\s\S]*?)`\s*\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const block = match[0];
    const tpl = match[1];
    const html = match[2];
    templates.push({
      tpl,
      family: grab(block, "family") || "misc",
      group: grab(block, "group") || "Секции",
      label: grab(block, "label") || tpl,
      code: grab(block, "code") || tpl.slice(0, 6).toUpperCase(),
      icon: grab(block, "icon") || "▢",
      kind: grab(block, "kind") === "auto" ? "auto" : "static",
      desc: grab(block, "desc") || "",
      styleSystem: grab(block, "styleSystem") || "default",
      html,
    });
  }

  if (templates.length === 0) {
    const alt = /label\s*:\s*["']([^"']+)["'][\s\S]{0,400}<(section|div)[\s\S]*?<\/\2>/gi;
    let m2: RegExpExecArray | null;
    let i = 0;
    while ((m2 = alt.exec(source))) {
      i += 1;
      templates.push({
        tpl: `imported_${i}`,
        family: "imported",
        group: "Импорт",
        label: m2[1],
        code: `IMP-${String(i).padStart(2, "0")}`,
        icon: "▢",
        kind: "static",
        desc: filename,
        styleSystem: "imported",
        html: m2[0].slice(m2[0].indexOf("<")),
      });
    }
  }

  return {
    id: `lib-${filename}-${templates.length}-${Date.now()}`,
    name: `${filename} · ${templates.length}`,
    filename,
    templates,
  };
}

export async function readFilesAsText(files: FileList | File[]): Promise<{ name: string; text: string }[]> {
  const list = Array.from(files).filter((f) => /\.(js|mjs|ts|html)$/i.test(f.name));
  const out: { name: string; text: string }[] = [];
  for (const file of list) {
    out.push({ name: file.name, text: await file.text() });
  }
  return out;
}
