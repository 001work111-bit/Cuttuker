// Единый реестр методов адаптации. Новые методы подключаются здесь отдельными
// пунктами — существующие четыре (baseline) всегда идут первыми и не меняются.
import type { MethodMeta, MethodResult, ParsedTemplate } from "../types";
import { methodCompact, methodFit, methodSmart, methodSplit } from "./baseline";
import { methodBalanced, methodEditorial, methodHeroMedia, methodMediaGrid, methodTypographic } from "./advanced";

export interface MethodCtx {
  parsed: ParsedTemplate;
  rawHtml: string;
  naturalWidth: number;
}

export interface MethodEntry extends MethodMeta {
  run: (ctx: MethodCtx) => MethodResult;
}

export const METHODS: MethodEntry[] = [
  // ---- 4 существующих метода (не менять) ----
  {
    id: "smart",
    title: "Реконструкция по ролям",
    shortDesc: "Перекомпоновывает заголовки, медиа и метаданные под вертикальный кадр 9:16.",
    longDesc:
      "Базовый метод. Разбирает шаблон на роли (overline/title/media/body/meta/tags) и собирает их заново: заголовок сверху, главное медиа — отдельным блоком, мета и теги закреплены внизу.",
    group: "baseline",
    run: (ctx) => methodSmart(ctx.parsed),
  },
  {
    id: "compact",
    title: "Адаптивная сетка",
    shortDesc: "Сохраняет исходный DOM и дизайн-систему, уплотняет отступы, размеры и межблочные интервалы.",
    longDesc:
      "Базовый метод. Не переставляет элементы: сворачивает многоколоночные grid-раскладки в одну колонку и уплотняет отступы/шрифты, как обычная отзывчивая вёрстка.",
    group: "baseline",
    run: (ctx) => methodCompact(ctx.rawHtml),
  },
  {
    id: "split",
    title: "Редакционный split",
    shortDesc: "При наличии текста и медиа делает явную двухколоночную композицию.",
    longDesc:
      "Базовый метод. Делит кадр на две чёткие зоны — медиа (или заголовок) сверху, текст/мета снизу — с акцентной линией раздела.",
    group: "baseline",
    run: (ctx) => methodSplit(ctx.parsed),
  },
  {
    id: "fit",
    title: "Контрольный safe-fit",
    shortDesc: "Диагностический вариант: минимально меняет структуру и уменьшает переполнение до безопасных границ.",
    longDesc:
      "Базовый метод. Равномерно масштабирует исходную секцию целиком, без перестройки композиции — используется как контрольная точка для сравнения.",
    group: "baseline",
    run: (ctx) => methodFit(ctx.parsed, ctx.rawHtml, ctx.naturalWidth),
  },

  // ---- Новые методы (добавлены отдельно, baseline не изменяют) ----
  {
    id: "editorial",
    title: "Вертикальная редакционная композиция",
    shortDesc: "Распределяет заголовок, текст, медиа и мета по всей высоте кадра, не допуская скопления сверху.",
    longDesc:
      "Новый метод. Для шаблонов «заголовок + текст (+0-1 медиа) + мета» использует flex-grow и увеличенные интервалы, чтобы контент занимал весь кадр 1600px, а не только верхнюю часть.",
    group: "advanced",
    run: (ctx) => methodEditorial(ctx.parsed),
  },
  {
    id: "heroMedia",
    title: "Главное медиа",
    shortDesc: "Полноэкранное медиа как доминанта кадра, текст — подписью поверх или под ним.",
    longDesc:
      "Новый метод. Для шаблонов с одним главным изображением/видео делает full-bleed героя (≈64% высоты) с затемнением и заголовком-подписью — выразительная постерная композиция.",
    group: "advanced",
    run: (ctx) => methodHeroMedia(ctx.parsed),
  },
  {
    id: "mediaGrid",
    title: "Вертикальная медиасетка",
    shortDesc: "Для 2+ изображений: одно крупное + остальные тайлами, вместо тесного стека сверху.",
    longDesc:
      "Новый метод. Решает основную проблему ТЗ: изображения, стоявшие в оригинале рядом по горизонтали, перераспределяются по вертикали — крупный якорь плюс сетка тайлов.",
    group: "advanced",
    run: (ctx) => methodMediaGrid(ctx.parsed),
  },
  {
    id: "balanced",
    title: "Сбалансированная композиция",
    shortDesc: "Высота блоков считается по их визуальному весу, интервалы — равномерно, контент центрируется.",
    longDesc:
      "Новый метод. Универсальный расчёт: каждому блоку присваивается вес (медиа/повторы тяжелее, подписи легче), высота кадра делится пропорционально, остаток — в равные отступы.",
    group: "advanced",
    run: (ctx) => methodBalanced(ctx.parsed),
  },
  {
    id: "typographic",
    title: "Типографическая вертикальная композиция",
    shortDesc: "Крупный заголовок занимает основную вертикаль кадра, медиа — маленький акцент.",
    longDesc:
      "Новый метод. Для обложек-заявлений с минимумом медиа: типографика увеличивается и держит композицию, а не подстраивается под место, оставшееся от изображения.",
    group: "advanced",
    run: (ctx) => methodTypographic(ctx.parsed),
  },
];

export function getMethod(id: string): MethodEntry | undefined {
  return METHODS.find((m) => m.id === id);
}
