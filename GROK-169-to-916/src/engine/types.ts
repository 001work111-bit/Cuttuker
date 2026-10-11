export type MethodId =
  | "smart"
  | "compact"
  | "split"
  | "fit"
  | "editorial"
  | "hero"
  | "mediastack"
  | "balanced"
  | "type";

export type MethodKind = "legacy" | "new";

export interface MethodDef {
  id: MethodId;
  kind: MethodKind;
  title: string;
  subtitle: string;
  intent: string;
  bestFor: string;
}

export interface TemplateMeta {
  tpl: string;
  family: string;
  group: string;
  label: string;
  code: string;
  icon: string;
  kind: "static" | "auto";
  desc: string;
  styleSystem: string;
  html: string;
}

export interface LibraryPack {
  id: string;
  name: string;
  filename: string;
  templates: TemplateMeta[];
}

export interface RoleCounts {
  overline: number;
  title: number;
  statement: number;
  body: number;
  label: number;
  smallMeta: number;
  link: number;
  media: number;
  totalRoles: number;
}

export interface StructureProfile {
  handler:
    | "indexhero"
    | "matrix"
    | "about"
    | "contact"
    | "services"
    | "cards"
    | "quote"
    | "generic";
  mediaCount: number;
  textCount: number;
  columnHint: number;
  hasHorizontalGrid: boolean;
  hasRepeat: boolean;
  isTypographic: boolean;
  isShort: boolean;
  roles: RoleCounts;
}

export interface ConvertResult {
  html: string;
  css: string;
  document: string;
  method: MethodId;
  handler: string;
  analysis: StructureProfile;
  notes: string[];
}

export const FRAME = { w: 900, h: 1600, sourceW: 1440 };

export const METHODS: MethodDef[] = [
  {
    id: "smart",
    kind: "legacy",
    title: "Реконструкция по ролям",
    subtitle: "Перекомпоновывает заголовки, медиа и метаданные под вертикальный кадр 9:16.",
    intent: "Ролевая пересборка исходного DOM специальными обработчиками.",
    bestFor: "Шаблоны с выраженными data-role и смешанной структурой.",
  },
  {
    id: "compact",
    kind: "legacy",
    title: "Адаптивная сетка",
    subtitle: "Сохраняет исходный DOM и дизайн-систему, уплотняет отступы, размеры и межблочные интервалы.",
    intent: "CSS-уплотнение без смысловой перестройки.",
    bestFor: "Горизонтальные сетки без сильной медиа-иерархии.",
  },
  {
    id: "split",
    kind: "legacy",
    title: "Редакционный split",
    subtitle: "При наличии текста и медиа делает явную двухколоночную композицию.",
    intent: "Жёстко разделяет текстовую и медийную зоны.",
    bestFor: "Split-шаблоны текст + одно медиа.",
  },
  {
    id: "fit",
    kind: "legacy",
    title: "Контрольный safe-fit",
    subtitle: "Диагностический вариант: минимально меняет структуру и уменьшает переполнение до безопасных границ.",
    intent: "Контрольный минимум вмешательства.",
    bestFor: "Сравнение и диагностика переполнения.",
  },
  {
    id: "editorial",
    kind: "new",
    title: "Вертикальная редакционная композиция",
    subtitle: "Распределяет заголовок, текст, медиа и мету по высоте кадра, сохраняя иерархию.",
    intent: "Не складывать всё вверх — выстроить вертикальный editorial flow.",
    bestFor: "Типографические обложки, about, contact, статьи.",
  },
  {
    id: "hero",
    kind: "new",
    title: "Главное медиа",
    subtitle: "Делает одно изображение или видеоблок визуальным центром вертикального кадра.",
    intent: "Крупное медиа + служебный текст, а не одинаковые блоки в стопке.",
    bestFor: "Одно доминирующее медиа и короткий текст.",
  },
  {
    id: "mediastack",
    kind: "new",
    title: "Медиа по высоте",
    subtitle: "Ставит несколько медиа крупными кадрами друг над другом вместо сжатой горизонтальной ленты.",
    intent: "Использовать высоту 9:16 как серию выразительных кадров.",
    bestFor: "Два и более изображения, асимметричные сетки, галереи.",
  },
  {
    id: "balanced",
    kind: "new",
    title: "Сбалансированная композиция",
    subtitle: "Учитывает высоту 1600px, визуальный вес и интервалы, чтобы пустота была частью макета.",
    intent: "Равновесие верха и низа кадра, а не случайный зазор снизу.",
    bestFor: "Короткие и средние шаблоны, которые иначе оседают вверх.",
  },
  {
    id: "type",
    kind: "new",
    title: "Типографический столбец",
    subtitle: "Сохраняет масштаб заголовка в узком кадре и строит композицию вокруг текста.",
    intent: "Тип как главный объект, медиа как акцент, не наоборот.",
    bestFor: "Манифесты, крупные заявления, обложки с малым количеством медиа.",
  },
];
