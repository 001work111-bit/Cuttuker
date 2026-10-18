import type { TemplateItem, VariantMeta } from "./types";
import { variant1 } from "./variant1";
import { variant2 } from "./variant2";
import { variant3 } from "./variant3";
import { variant4 } from "./variant4";
import { variant5 } from "./variant5";

export const allTemplates: TemplateItem[] = [
  ...variant1,
  ...variant2,
  ...variant3,
  ...variant4,
  ...variant5,
];

export const variants: VariantMeta[] = [
  {
    id: "v1",
    num: 1,
    name: "Minimal",
    idea: "Наиболее компактная и радикальная версия.",
    dramaturgy: "идея + образ → вот что из этого получилось",
    pages: 2,
  },
  {
    id: "v2",
    num: 2,
    name: "Standard",
    idea: "Основной, наиболее универсальный способ подачи.",
    dramaturgy: "название → мысль → доказательство",
    pages: 3,
  },
  {
    id: "v3",
    num: 3,
    name: "Graphic",
    idea: "Акцент на моменте смыслового сдвига.",
    dramaturgy: "обложка → сдвиг → итог",
    pages: 3,
  },
  {
    id: "v4",
    num: 4,
    name: "Signature",
    idea: "Медленный, статусный ритм с большим воздухом.",
    dramaturgy: "название → мысль → развитие → галерея",
    pages: 4,
  },
  {
    id: "v5",
    num: 5,
    name: "Compact Editorial",
    idea: "Контраст минимальной обложки и плотной верстки.",
    dramaturgy: "титул → текст+кадры → финальный образ",
    pages: 3,
  },
];

export const variantOf = (code: string): number => parseInt(code.charAt(1), 10);

export const templatesByVariant = (n: number): TemplateItem[] =>
  allTemplates.filter((t) => variantOf(t.code) === n);

export const countMediaSlots = (html: string): number => {
  const m = html.match(/data-sb-media/g);
  return m ? m.length : 0;
};

export const countEditables = (html: string): number => {
  const m = html.match(/data-sb-editable/g);
  return m ? m.length : 0;
};

export const expectedSlots: Record<string, number[]> = {
  "V1-01": [1],
  "V1-02": [4],
  "V2-01": [1],
  "V2-02": [0],
  "V2-03": [4],
  "V3-01": [1],
  "V3-02": [1, 2],
  "V3-03": [4],
  "V4-01": [1],
  "V4-02": [0],
  "V4-03": [2, 3],
  "V4-04": [4],
  "V5-01": [0],
  "V5-02": [4],
  "V5-03": [1],
};

export const validateAll = () => {
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  checks.push({
    name: "Ровно 15 объектов",
    ok: allTemplates.length === 15,
    detail: `${allTemplates.length} / 15`,
  });
  const order = ["V1-01","V1-02","V2-01","V2-02","V2-03","V3-01","V3-02","V3-03","V4-01","V4-02","V4-03","V4-04","V5-01","V5-02","V5-03"];
  const actualOrder = allTemplates.map((t) => t.code);
  checks.push({
    name: "Порядок страниц",
    ok: JSON.stringify(actualOrder) === JSON.stringify(order),
    detail: actualOrder.join(" "),
  });
  const fields = ["tpl","family","group","label","code","icon","kind","single","desc","styleSystem","html"];
  const fieldsOk = allTemplates.every((t) => JSON.stringify(Object.keys(t)) === JSON.stringify(fields));
  checks.push({ name: "11 полей в заданном порядке", ok: fieldsOk, detail: fieldsOk ? "tpl → html" : "нарушен порядок" });
  const tpls = new Set(allTemplates.map((t) => t.tpl));
  const codes = new Set(allTemplates.map((t) => t.code));
  checks.push({ name: "Уникальные tpl и code", ok: tpls.size === 15 && codes.size === 15, detail: `${tpls.size} tpl, ${codes.size} code` });
  const kindsOk = allTemplates.every((t) => t.kind === "static" && t.single === false && t.styleSystem === "default");
  checks.push({ name: "kind/single/styleSystem", ok: kindsOk, detail: 'static · false · default' });
  const fams = ["nav","hero","statement","about","services","process","formats","projectCover","projectContent","gallery","contact","footer"];
  const grps = ["Каркас","Секции","Обложка проекта","Контент проекта","Галерея проекта"];
  checks.push({
    name: "family и group из словаря",
    ok: allTemplates.every((t) => fams.includes(t.family) && grps.includes(t.group)),
    detail: "словарь соблюдён",
  });
  const slotsOk = allTemplates.every((t) => {
    const c = countMediaSlots(t.html);
    return (expectedSlots[t.code] || []).includes(c);
  });
  const totalSlots = allTemplates.reduce((s, t) => s + countMediaSlots(t.html), 0);
  checks.push({ name: "Медиа-слоты по таблице §10", ok: slotsOk, detail: `всего слотов: ${totalSlots}` });
  const structOk = allTemplates.every((t) =>
    t.html.includes('class="sv-section"') &&
    t.html.includes('class="sv-inner"') &&
    t.html.includes("aspect-ratio:16/9") &&
    t.html.includes("overflow:hidden") &&
    !t.html.includes("<style") &&
    !t.html.includes("data-sb-repeat") &&
    !t.html.includes("http")
  );
  checks.push({ name: "Структура HTML и запреты", ok: structOk, detail: "section · inner · inline-only" });
  return checks;
};

export const buildExportJson = (): string => JSON.stringify(allTemplates);

export const buildPrettyJson = (): string => JSON.stringify(allTemplates, null, 2);

export const PREVIEW_IMAGES = [
  "/images/bike-1.jpg",
  "/images/bike-2.jpg",
  "/images/bike-3.jpg",
  "/images/bike-4.jpg",
];
