import type { StructureProfile, TemplateMeta, RoleCounts } from "./types";
import { parseFragment } from "./html";

export function analyzeHtml(html: string, tpl?: TemplateMeta): StructureProfile {
  const doc = parseFragment(html);
  const q = (sel: string) => doc.querySelectorAll(sel).length;

  const roles: RoleCounts = {
    overline: q('[data-role="overline"]'),
    title: q('[data-role="title"]'),
    statement: q('[data-role="statement"]'),
    body: q('[data-role="body"]'),
    label: q('[data-role="label"]'),
    smallMeta: q('[data-role="smallMeta"]'),
    link: q('[data-role="link"]'),
    media: q("[data-sb-media], .sv-media, img, video"),
    totalRoles: 0,
  };
  roles.totalRoles =
    roles.overline +
    roles.title +
    roles.statement +
    roles.body +
    roles.label +
    roles.smallMeta +
    roles.link;

  const mediaCount = roles.media;
  const textCount = roles.title + roles.statement + roles.body + roles.overline;

  let columnHint = 1;
  doc.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    const s = el.getAttribute("style") || "";
    const m = s.match(/grid-template-columns\s*:\s*([^;]+)/);
    if (m) {
      const cols = m[1].split(" ").filter((x) => x.trim());
      columnHint = Math.max(columnHint, cols.length);
      if (/repeat\(\s*(\d+)/.test(m[1])) {
        columnHint = Math.max(columnHint, Number(RegExp.$1));
      }
    }
  });

  const hasHorizontalGrid = columnHint >= 2;
  const hasRepeat = !!doc.querySelector("[data-sb-repeat]");
  const titleEl = doc.querySelector('[data-role="title"], [data-role="statement"], h1, h2') as HTMLElement | null;
  const titleLen = (titleEl?.textContent || "").trim().length;
  const isTypographic = titleLen > 28 && mediaCount <= 2;
  const htmlLen = html.length;
  const isShort = htmlLen < 2800 && mediaCount <= 1;

  const key = `${tpl?.tpl || ""} ${tpl?.family || ""} ${tpl?.code || ""}`.toLowerCase();
  let handler: StructureProfile["handler"] = "generic";

  if (/indexhero|typoindex|sw-05/.test(key) || (mediaCount >= 2 && /hero/.test(key) && isTypographic)) {
    handler = "indexhero";
  } else if (/matrix|sw-02/.test(key)) {
    handler = "matrix";
  } else if (/manifesto|abt-02|family about/.test(key) && mediaCount === 1 && roles.statement) {
    handler = "about";
  } else if (/contact|c-11/.test(key) || (mediaCount === 0 && roles.link >= 2)) {
    handler = "contact";
  } else if (/services|srv-02/.test(key) || hasRepeat) {
    handler = "services";
  } else if (/cards|wrk-03|worktriple/.test(key) || (mediaCount >= 3 && columnHint >= 3)) {
    handler = "cards";
  } else if (/quote|qte/.test(key) || roles.statement > 0) {
    handler = "quote";
  } else if (tpl?.family === "about" && mediaCount <= 1) {
    handler = "about";
  } else if (tpl?.family === "contact") {
    handler = "contact";
  } else if (tpl?.family === "services") {
    handler = "services";
  } else if (mediaCount >= 2 && isTypographic) {
    handler = "indexhero";
  } else if (mediaCount === 1 && hasHorizontalGrid) {
    handler = "matrix";
  }

  return {
    handler,
    mediaCount,
    textCount,
    columnHint,
    hasHorizontalGrid,
    hasRepeat,
    isTypographic,
    isShort,
    roles,
  };
}

export function recommendLegacy(profile: StructureProfile): {
  method: "smart" | "compact" | "split" | "fit";
  title: string;
  text: string;
} {
  const { roles, mediaCount, hasHorizontalGrid, handler } = profile;
  if (handler === "indexhero" || handler === "matrix" || handler === "about" || (mediaCount >= 1 && roles.totalRoles >= 4)) {
    return {
      method: "smart",
      title: "Рекомендация: реконструкция по ролям",
      text: `Шаблон содержит выраженные роли и медиа/текстовые группы: они могут быть распределены заново, а не просто уменьшены. Роли: ${roles.totalRoles}, медиа: ${mediaCount}.`,
    };
  }
  if (hasHorizontalGrid && mediaCount === 0) {
    return {
      method: "compact",
      title: "Рекомендация: адаптивная сетка",
      text: `У шаблона уже есть достаточно горизонтальная структура; безопаснее сначала уплотнить исходную сетку и типографику. Роли: ${roles.totalRoles}, медиа: ${mediaCount}.`,
    };
  }
  if (mediaCount >= 1 && profile.textCount >= 1 && (handler === "quote" || handler === "generic")) {
    return {
      method: "split",
      title: "Рекомендация: редакционный split",
      text: `Есть явная пара текст + медиа. Split фиксирует две зоны и не пытается сохранить исходную сетку. Роли: ${roles.totalRoles}, медиа: ${mediaCount}.`,
    };
  }
  return {
    method: "fit",
    title: "Рекомендация: контрольный safe-fit",
    text: `Структура короткая или неоднозначная. Safe-fit минимально вмешивается и показывает, что происходит при простом сжатии. Роли: ${roles.totalRoles}, медиа: ${mediaCount}.`,
  };
}

export function recommendNew(profile: StructureProfile): {
  method: "editorial" | "hero" | "mediastack" | "balanced" | "type";
  title: string;
  text: string;
} {
  if (profile.mediaCount >= 2) {
    return {
      method: "mediastack",
      title: "Новый метод: медиа по высоте",
      text: `Несколько медиа выгоднее развести крупными кадрами по вертикали, а не держать в одной горизонтальной ленте. Медиа: ${profile.mediaCount}.`,
    };
  }
  if (profile.mediaCount === 1 && (profile.handler === "matrix" || profile.handler === "about" || profile.handler === "quote")) {
    return {
      method: "hero",
      title: "Новый метод: главное медиа",
      text: "Одно медиа может занять содержательную высоту кадра, а текст стать обвязкой, а не наоборот.",
    };
  }
  if (profile.isTypographic && profile.mediaCount <= 1) {
    return {
      method: "type",
      title: "Новый метод: типографический столбец",
      text: "Крупный заголовок — главный объект. В узком кадре его лучше не ужимать, а выстроить как вертикальную форму.",
    };
  }
  if (profile.isShort || profile.handler === "contact") {
    return {
      method: "balanced",
      title: "Новый метод: сбалансированная композиция",
      text: "Контента мало относительно 1600px. Имеет смысл распределить вес по высоте, чтобы низ кадра не оставался случайным.",
    };
  }
  return {
    method: "editorial",
    title: "Новый метод: вертикальная редакционная композиция",
    text: "Роли выстраиваются сверху вниз с постоянным ритмом: заголовок, текст, медиа, мета — без скученности вверху.",
  };
}
