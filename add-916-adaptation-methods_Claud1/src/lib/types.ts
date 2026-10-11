// Общие типы лаборатории Recompose Studio (9:16).
// Используются и старыми (baseline), и новыми (advanced) методами.

export type Bucket =
  | "overline"
  | "title"
  | "body"
  | "media"
  | "meta"
  | "tag"
  | "repeat"
  | "other";

export interface Block {
  key: string;
  role: string;
  bucket: Bucket;
  slot?: string;
  editable: boolean;
  isMedia: boolean;
  mediaKind?: string;
  aspect?: number; // width / height
  tag: string;
  style: string;
  html: string; // outerHTML оригинального узла (сохраняет data-* маркеры)
  inner: string; // innerHTML
  text: string;
  repeatItems?: string[]; // outerHTML каждого повторяющегося элемента
}

export interface ParsedTemplate {
  bg: string;
  sectionStyle: string;
  blocks: Block[];
  mediaCount: number;
  roleCount: number;
}

export type TemplateKind =
  | "typographic" // крупный заголовок/заявление, медиа почти нет
  | "hero-media" // одно главное медиа + текст
  | "multi-media" // 2+ медиа-блока
  | "text-split" // текстовая двухколоночная композиция без медиа
  | "longform" // длинный текстовый блок
  | "cards"; // сетка карточек / повторяющиеся строки

export interface TemplateDef {
  id: string;
  code: string;
  label: string;
  family: string;
  group: string;
  kind: TemplateKind;
  desc: string;
  width: number; // авторская ширина в px (16:9-подобный исходник)
  build: () => string; // возвращает исходный HTML <section>...</section>
}

export interface MethodMeta {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  group: "baseline" | "advanced";
}

export interface MethodResult {
  html: string; // innerHTML холста 900×1600 (без обёртки документа)
  approxHeight?: number; // расчётная высота контента, px (опционально)
  notes?: string[];
}

export const CANVAS_W = 900;
export const CANVAS_H = 1600;
