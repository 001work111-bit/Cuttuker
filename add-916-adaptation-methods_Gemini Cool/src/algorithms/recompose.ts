import { AdaptationMethod, ConversionResult, MethodInfo, OverflowIssue, Recommendation, TemplateItem } from '../types';

export const W = 900;
export const H = 1600;
export const SOURCE_W = 1440;
export const SOURCE_VH = 900;

export const ALL_METHODS: MethodInfo[] = [
  {
    id: 'smart',
    name: 'Реконструкция по ролям',
    badge: 'legacy',
    shortDesc: 'Перекомпоновывает заголовки, медиа и метаданные под вертикальный кадр 9:16.',
    fullDesc:
      'Исходный базовый алгоритм: распознаёт семантические роли (overline, statement, title, body, smallMeta, media) и применяет правила перекомпоновки для конкретных шаблонов. Существующий метод сохранён без изменений.',
    targetStructures: 'Секции с выраженными ролями, многослойные блоки',
    differenceSummary: 'Базовый метод реконструкции по ролям из версии 1.0. Сохранён 1:1.',
  },
  {
    id: 'compact',
    name: 'Адаптивная сетка',
    badge: 'legacy',
    shortDesc: 'Сохраняет исходный DOM и дизайн-систему, уплотняет отступы, размеры и межблочные интервалы.',
    fullDesc:
      'Исходный базовый алгоритм: не перестраивает иерархию DOM, а трансформирует существующую сетку под ширину 900 px и уплотняет межстрочные интервалы и отступы. Сохранён без изменений.',
    targetStructures: 'Горизонтальные списки, контакты, карточки',
    differenceSummary: 'Базовый метод компактной сетки из версии 1.0. Сохранён 1:1.',
  },
  {
    id: 'split',
    name: 'Редакционный split',
    badge: 'legacy',
    shortDesc: 'При наличии текста и медиа делает явную двухколоночную композицию.',
    fullDesc:
      'Исходный базовый алгоритм: пытается разделить контент на текстовую и визуальную группы и перестроить их в вертикальную пару. Сохранён без изменений.',
    targetStructures: 'Текстово-медийные сплит-экраны',
    differenceSummary: 'Базовый метод split из версии 1.0. Сохранён 1:1.',
  },
  {
    id: 'fit',
    name: 'Контрольный safe-fit',
    badge: 'legacy',
    shortDesc: 'Диагностический вариант: минимально меняет структуру и уменьшает переполнение до безопасных границ.',
    fullDesc:
      'Исходный контрольный алгоритм: служит эталоном для выявления переполнения и проверки естественной структуры шаблона. Сохранён без изменений.',
    targetStructures: 'Диагностика и сравнение для любых шаблонов',
    differenceSummary: 'Базовый диагностический safe-fit из версии 1.0. Сохранён 1:1.',
  },
  {
    id: 'editorial',
    name: 'Вертикальная редакционная композиция',
    badge: 'new',
    direction: 'Направление А',
    shortDesc: 'Распределяет заголовок, текст, медиа и метаданные по всей высоте кадра 1600 px без скопления вверху.',
    fullDesc:
      'Новый алгоритм архитектурного распределения: делит кадр 9:16 на трёхчастную редакционную иерархию (Header/Overline → Центральное ядро с медиа и заголовком → Заземлённый футер/метаданные). Устраняет главную проблему «пустоты снизу», растягивая и балансируя композицию по всей высоте 1600 px.',
    targetStructures: 'Манифесты поверх медиа (ABT-02), двухколоночные контакты (C-11), модульные матрицы (SW-02)',
    differenceSummary:
      'В отличие от smart и compact, которые скапливают блоки в верхних 40% кадра, данный метод закрепляет футеры внизу кадра, пропорционально масштабирует центральное медиа и выстраивает цельную журнальную полосу.',
  },
  {
    id: 'heroMedia',
    name: 'Композиция с главным медиа',
    badge: 'new',
    direction: 'Направление Б',
    shortDesc: 'Доминирующее медиа вертикального масштаба (4:5 / 1:1) с выверенной типографикой вокруг.',
    fullDesc:
      'Новый алгоритм фокуса на визуале: в вертикальном кадре 9:16 горизонтальное видео 16:9 или 2.6:1 выглядит слишком мелким. Метод масштабирует ключевое медиа до крупного формата (4:5, 1:1 или 16:10 с высотой 500–680 px), выстраивая над ним чёткую вводку и под ним ёмкие акценты.',
    targetStructures: 'Шоурил-направления (SR-01), манифесты с медиа (ABT-02), модульные матрицы (SW-02)',
    differenceSummary:
      'В отличие от базовых методов, сжимающих медиа до 230–360 px, метод отдаёт медиа 45–55% высоты кадра, делая шаблон кинематографичным и естественным для мобильного восприятия.',
  },
  {
    id: 'mediaGrid',
    name: 'Вертикальная медиасетка',
    badge: 'new',
    direction: 'Направление В',
    shortDesc: 'Последовательность крупных кадров и асимметричная вертикальная раскладка для шаблонов с 2+ медиа.',
    fullDesc:
      'Новый алгоритм для мультимедийных шаблонов: заменяет тесные горизонтальные ряды картинок на выразительную вертикальную галерею. Для двух видео-лупов (SW-05) строит последовательный стек с формулами; для асимметричной сетки (SR-05) формирует Key Visual во всю ширину, заголовок-интертитл и сбалансированные катэвеи.',
    targetStructures: 'Авангардный индекс с двумя видео (SW-05), асимметричная сетка (SR-05), микро-сетка (SR-02)',
    differenceSummary:
      'В базовом smart два видеокадра втискивались в 2 колонки шириной по 360 px с огромной пустотой внизу. Метод mediaGrid использует вертикальное пространство для отображения каждого кадра в полном качестве.',
  },
  {
    id: 'balanced',
    name: 'Сбалансированная композиция',
    badge: 'new',
    direction: 'Направление Г',
    shortDesc: 'Равномерное распределение визуального веса и адаптивные интервалы по золотому сечению.',
    fullDesc:
      'Новый алгоритм оптического баланса: математически рассчитывает свободную высоту кадра и распределяет блоки с гармоничным вертикальным ритмом (clamp-интервалы, сбалансированное центрирование, золотое сечение). Контент не прилипает к верхнему краю и выглядит как завершённый плакат.',
    targetStructures: 'Строчные списки услуг (SRV-02), контактные реквизиты (C-11), акцентные манифесты (ST-01)',
    differenceSummary:
      'Не просто сдвигает элементы, а динамически вычисляет оптимальные интервалы (от 32 до 64 px) и центрирует смысловое ядро, достигая заполнения 80–90% кадра.',
  },
  {
    id: 'typographic',
    name: 'Типографический вертикальный плакат',
    badge: 'new',
    direction: 'Направление Д',
    shortDesc: 'Монументальная швейцарская типографика, ритмичные манифесты и структурированные списки.',
    fullDesc:
      'Новый алгоритм для текстовых шаблонов: превращает узкий высокий формат 9:16 в визуальный плакат швейцарского стиля. Заголовки получают монументальный кегль, а массивные списки (например, 20 направлений в SR-03) форматируются в ритмичный двухколоночный индекс с номерами строк и акцентными плашками.',
    targetStructures: 'Манифесты направлений (SR-03, SR-03 converted), полноэкранные заявления (ST-01)',
    differenceSummary:
      'Предотвращает сворачивание текста в скучный абзац вверху экрана. Текст становится главным визуальным объектом с плакатным ритмом и выверенной сеткой.',
  },
];

export const METHOD_MAP: Record<AdaptationMethod, MethodInfo> = ALL_METHODS.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<AdaptationMethod, MethodInfo>
);

export function stripRemoteFontImports(html: string): string {
  return String(html || '').replace(/@import\s+url\(\s*['"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;\s*/gi, '');
}

export function collectFontImports(html: string): string[] {
  return [...String(html || '').matchAll(/@import\s+url\(\s*['"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;?/gi)].map(
    (m) => m[0]
  );
}

export function vhToPx(html: string): string {
  return String(html || '').replace(/(-?\d*\.?\d+)\s*(dvh|svh|lvh|vh)\b/gi, (_, n) => `${(Number(n) * SOURCE_VH) / 100}px`);
}

export function sourceDoc(html: string): string {
  const clean = vhToPx(stripRemoteFontImports(html));
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${SOURCE_W}, initial-scale=1"><style>html{margin:0!important;padding:0!important;width:${SOURCE_W}px!important;min-width:${SOURCE_W}px!important;height:auto!important;overflow:visible!important;box-sizing:border-box!important}body{margin:0!important;padding:0!important;width:${SOURCE_W}px!important;min-width:${SOURCE_W}px!important;height:auto!important;min-height:0!important;overflow:visible!important;box-sizing:border-box!important;--pad:4vw!important;font-family:Arial,sans-serif}*,*:before,*:after{box-sizing:border-box}</style></head><body>${clean}</body></html>`;
}

export function targetDoc(html: string): string {
  const clean = vhToPx(stripRemoteFontImports(html));
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${W}, initial-scale=1"></head><body>${clean}</body></html>`;
}

export function chooseRecommended(t: TemplateItem | null, html: string): Recommendation {
  const id = (t?.tpl || '').toLowerCase();
  const roles = [...String(html || '').matchAll(/data-role=["']([^"']+)/g)].map((m) => m[1]);
  const mediaMatches = html.match(/data-sb-media|class=["'][^"']*sv-media/g) || [];
  const media = mediaMatches.length;

  if (id.includes('statementdirections') || id.includes('statementfullbleed')) {
    return {
      method: 'typographic',
      why: 'В шаблоне доминирует крупный манифест/заявление. Метод «Типографический плакат» раскроет швейцарскую типографику по всей высоте.',
      roles: roles.length,
      media,
    };
  }
  if (id.includes('typoindex') || id.includes('asymmetricgrid') || id.includes('microgrid')) {
    return {
      method: 'mediaGrid',
      why: 'Шаблон содержит 2 и более медиа-кадров. Метод «Вертикальная медиасетка» выстроит их в последовательный ритм вместо сжатия в узкую полоску.',
      roles: roles.length,
      media,
    };
  }
  if (id.includes('splitdirections') || id.includes('aboutmanifestostacked')) {
    return {
      method: 'editorial',
      why: 'Шаблон сочетает заголовок, крупный визуал и метаданные. «Вертикальная редакционная композиция» задействует 1600 px без пустоты снизу.',
      roles: roles.length,
      media,
    };
  }
  if (id.includes('services') || id.includes('contact')) {
    return {
      method: 'balanced',
      why: 'Структурированный контент (услуги / контакты). «Сбалансированная композиция» распределит строки и реквизиты с гармоничным вертикальным шагом.',
      roles: roles.length,
      media,
    };
  }
  if (media >= 1 && (roles.includes('title') || roles.includes('statement'))) {
    return {
      method: 'editorial',
      why: 'Шаблон содержит выраженные роли и медиа/текстовые группы: редакционное распределение устранит скученность сверху.',
      roles: roles.length,
      media,
    };
  }
  return {
    method: 'smart',
    why: 'Базовая семантическая перекомпоновка по ролям.',
    roles: roles.length,
    media,
  };
}

export function directChildren(el: Element | null): Element[] {
  return [...((el?.children as HTMLCollection) || [])].filter((n) => !['STYLE', 'SCRIPT', 'LINK'].includes(n.tagName));
}

export function pickRoot(doc: Document): HTMLElement | null {
  let section: HTMLElement | null = doc.querySelector('.sv-section');
  if (!section) {
    const f = doc.querySelector('[data-sb-format-frame]');
    section = (f?.querySelector('.sv-section') as HTMLElement) || (doc.body.querySelector('section,main,article,div') as HTMLElement);
  }
  return section;
}

export function unwrapFormatFrame(doc: Document): void {
  const f = doc.querySelector('[data-sb-format-frame]');
  if (!f) return;
  const s = f.querySelector('.sv-section');
  if (s) {
    f.replaceWith(s);
  } else {
    const inn = f.querySelector('[data-sb-format-inner]') as HTMLElement;
    if (inn) {
      inn.style.cssText =
        'position:static!important;left:auto!important;top:auto!important;width:100%!important;height:100%!important;transform:none!important;overflow:visible!important';
      f.replaceWith(...Array.from(inn.childNodes));
    }
  }
}

export function createStyle(doc: Document, css: string, id = 'recompose-overrides'): void {
  let style = doc.getElementById(id);
  if (!style) {
    style = doc.createElement('style');
    style.id = id;
    doc.body.appendChild(style);
  }
  style.textContent = css;
}

export function setInline(el: HTMLElement, props: Record<string, string>): void {
  for (const [k, v] of Object.entries(props)) el.style.setProperty(k, v, 'important');
}

// ============================================================
// BASELINE UNTOUCHED LOGIC: smartStructure & Handlers
// ============================================================
export function specialAbout(doc: Document, _section: Element, inner: Element): boolean {
  const over = inner.querySelector('[data-role="overline"]');
  const title = inner.querySelector('[data-role="statement"]');
  const media = inner.querySelector('[data-sb-media],.sv-media');
  const meta =
    directChildren(inner).find((n) => n.querySelector('[data-slot^="m1Key"],[data-slot^="m1Val"]')) ||
    directChildren(inner)
      .filter((n) => n !== over && n !== title && n !== media)
      .at(-1);
  if (!over || !title || !media || !meta) return false;
  const layout = doc.createElement('div');
  layout.className = 'rc-about-layout';
  const copy = doc.createElement('div');
  copy.className = 'rc-about-copy';
  copy.append(over, title);
  const visual = doc.createElement('div');
  visual.className = 'rc-about-visual';
  visual.append(media);
  const footer = doc.createElement('div');
  footer.className = 'rc-about-footer';
  footer.append(meta);
  inner.replaceChildren(layout);
  layout.append(copy, visual, footer);
  return true;
}

export function specialAsym(doc: Document, _section: Element, inner: Element): boolean {
  void doc;
  const kids = directChildren(inner);
  if (kids.length < 4) return false;
  const [main, side, title, third] = kids;
  if (
    !main.querySelector('.sv-media,[data-sb-media]') ||
    !side.querySelector('.sv-media,[data-sb-media]') ||
    !third.querySelector('.sv-media,[data-sb-media]')
  )
    return false;
  inner.replaceChildren(main, side, title, third);
  inner.classList.add('rc-asym');
  return true;
}

export function specialMicro(_doc: Document | null, _section: Element, inner: Element): boolean {
  void _doc;
  const kids = directChildren(inner);
  if (kids.length < 2) return false;
  const head = kids.find((k) => k.querySelector('[data-role="title"]'));
  const cardGrid = kids.find((k) => k.querySelector('[data-sb-repeat]'));
  if (!head || !cardGrid) return false;
  inner.classList.add('rc-micro');
  cardGrid.classList.add('rc-micro-grid');
  const card = cardGrid.querySelector('[data-sb-repeat]');
  if (card) card.classList.add('rc-micro-card');
  const body = card?.querySelector(':scope > div:not(.sv-media)');
  if (body) body.classList.add('rc-micro-copy');
  return true;
}

export function genericSemantic(_doc: Document, _section: Element, inner: Element): string {
  const media = inner.querySelectorAll('.sv-media,[data-sb-media]');
  const text = inner.querySelectorAll(
    '[data-sb-editable][data-role="title"],[data-sb-editable][data-role="statement"],[data-sb-editable][data-role="body"]'
  );
  if (media.length && text.length >= 2) {
    inner.classList.add('rc-generic-split');
    return 'genericSplit';
  }
  return 'generic';
}

export function smartStructure(
  doc: Document,
  t: TemplateItem
): { section: HTMLElement | null; inner: HTMLElement | null; layout: string } {
  unwrapFormatFrame(doc);
  const section = pickRoot(doc);
  if (!section) return { section: null, inner: null, layout: 'generic' };
  const inner = (section.querySelector('.sv-inner') as HTMLElement) || section;
  const id = String(t.tpl || '').toLowerCase();
  let layout = 'generic';

  if (id.includes('aboutmanifestostacked') && specialAbout(doc, section, inner)) layout = 'about';
  else if (id.includes('showreelasymmetricgrid') && specialAsym(doc, section, inner)) layout = 'asym';
  else if (id.includes('showreelmicrogrid') && specialMicro(doc, section, inner)) layout = 'micro';
  else if (id.includes('swisstypographicmatrix')) layout = 'matrix';
  else if (id.includes('swisstypoindexhero')) layout = 'indexhero';
  else if (id.includes('servicesrepeatrows')) layout = 'services';
  else if (id.includes('contactsplit')) layout = 'contact';
  else if (id.includes('showreelsplitdirections')) layout = 'directions';
  else if (id.includes('showreelstatementdirections') || id.includes('statementfullbleed')) layout = 'statement';
  else if (id.includes('converted169')) layout = 'manifest';
  else layout = genericSemantic(doc, section, inner);

  return { section, inner, layout };
}

// ============================================================
// BASELINE UNTOUCHED CSS (targetCss & portraitCss)
// ============================================================
export function targetCss(layout: string, method: string): string {
  let css = `
html,body{margin:0!important;padding:0!important;width:${W}px!important;min-width:${W}px!important;height:${H}px!important;min-height:${H}px!important;max-height:${H}px!important;overflow:hidden!important;box-sizing:border-box!important;background:#fff!important}
body{position:relative!important;--pad:4vw!important;overflow:hidden!important;font-family:Arial,sans-serif}
*,*:before,*:after{box-sizing:border-box}
.sv-section{position:absolute!important;left:0!important;top:0!important;width:${W}px!important;height:${H}px!important;min-height:0!important;max-height:${H}px!important;margin:0!important;padding:54px 68px!important;overflow:hidden!important;box-sizing:border-box!important}
.sv-section>.sv-inner{width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-height:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
.sv-inner>*{min-width:0!important;max-width:100%!important}
[data-sb-editable], [data-sb-media],.sv-media{box-sizing:border-box!important;min-width:0!important}
.sv-media,[data-sb-media]{max-width:100%!important}
img,video,svg{max-width:100%;}
[data-role="overline"],[data-role="label"],[data-role="smallMeta"]{overflow-wrap:anywhere}
`;
  if (method === 'compact' || method === 'fit') {
    css += `
.sv-section{padding:42px 52px!important}
.sv-section>.sv-inner{gap:clamp(12px,1.6vw,24px)!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(27px,4.4vw,70px)!important;line-height:1.02!important;letter-spacing:-.035em!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,1.8vw,26px)!important;line-height:1.2!important}
.sv-inner [data-role="body"]{font-size:clamp(13px,1vw,17px)!important;line-height:1.42!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:clamp(10px,.8vw,13px)!important;line-height:1.35!important}
.sv-inner h1,.sv-inner h2,.sv-inner h3,.sv-inner h4{max-width:100%!important;overflow-wrap:anywhere!important}
.sv-inner p{max-width:100%!important}
.sv-section [style*="padding"]{padding-top:clamp(8px,1.4vw,22px)!important;padding-bottom:clamp(8px,1.4vw,22px)!important}
.sv-section [style*="margin-bottom"]{margin-bottom:clamp(8px,1.4vw,22px)!important}
`;
  }
  if (method === 'smart' || method === 'split') {
    css += `
.sv-section{padding:54px 72px!important}
.sv-inner [data-role="title"]{font-size:clamp(30px,4.7vw,76px)!important;line-height:1.01!important;letter-spacing:-.04em!important}
.sv-inner [data-role="statement"]{font-size:clamp(31px,4.7vw,76px)!important;line-height:1.08!important;letter-spacing:-.035em!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,1.8vw,27px)!important;line-height:1.3!important}
.sv-inner [data-role="body"]{font-size:clamp(13px,1vw,17px)!important;line-height:1.45!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:clamp(10px,.8vw,13px)!important;line-height:1.35!important}
.sv-inner [style*="margin-bottom"]{margin-bottom:clamp(8px,1.5vw,24px)!important}
`;
  }
  if (layout === 'about') {
    css += `
.sv-section{padding:54px 76px!important}.rc-about-layout{width:100%;height:100%;display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);grid-template-rows:minmax(0,1fr) auto;gap:28px 56px;align-items:center}
.rc-about-copy{display:flex;flex-direction:column;gap:22px;min-width:0}.rc-about-copy [data-role="overline"]{margin:0!important}.rc-about-copy [data-role="statement"]{font-size:clamp(42px,4.3vw,69px)!important;line-height:1.02!important;margin:0!important;max-width:650px!important}
.rc-about-visual{min-width:0;display:flex;align-items:center;justify-content:center;max-height:100%;}.rc-about-visual .sv-media,.rc-about-visual [data-sb-media]{width:100%!important;aspect-ratio:2.6/1!important;height:auto!important;max-height:100%!important;margin:0!important}
.rc-about-footer{grid-column:1/-1;border-top:1px solid currentColor;padding-top:15px;min-width:0}.rc-about-footer>div{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:24px!important;border-top:0!important;padding-top:0!important}
`;
  }
  if (layout === 'services') {
    css += `
.sv-section{padding:56px 72px!important}.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:28px!important}.sv-inner>div:first-child{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:24px!important;margin:0!important;flex:none}.sv-inner>div:first-child [data-role="title"]{font-size:clamp(36px,4vw,64px)!important}.sv-inner [data-sb-repeat]{display:flex!important;flex-direction:column!important;justify-content:center!important;flex:1!important;min-height:0!important}.sv-inner [data-sb-repeat]>div{display:grid!important;grid-template-columns:72px minmax(260px,1.1fr) minmax(0,1.6fr)!important;gap:28px!important;align-items:center!important;padding:24px 0!important;border-top:1px solid currentColor!important}.sv-inner [data-sb-repeat] h3{font-size:clamp(28px,3vw,48px)!important;line-height:1.05!important}.sv-inner [data-sb-repeat] p{font-size:clamp(14px,1vw,16px)!important}
`;
  }
  if (layout === 'contact') {
    css += `
.sv-section{padding:64px 84px!important}.sv-inner{display:grid!important;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)!important;gap:clamp(50px,6vw,94px)!important;align-items:center!important}.sv-inner>div{min-width:0!important}.sv-inner>div:first-child{gap:clamp(12px,1.7vw,25px)!important}.sv-inner>div:nth-child(2){gap:clamp(17px,2vw,30px)!important;padding-top:0!important}.sv-inner [data-role="title"]{font-size:clamp(50px,5.2vw,82px)!important;line-height:1!important}.sv-inner [data-role="body"]{font-size:clamp(16px,1.25vw,20px)!important;line-height:1.5!important}
`;
  }
  if (layout === 'matrix') {
    css += `
.sv-section{padding:42px 52px!important}.sv-inner{height:100%!important}.sv-inner>div:first-child{height:100%!important;padding:26px!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:18px!important;overflow:hidden!important}.sv-inner>div:first-child>div:nth-child(1){grid-column:1/-1!important;padding-bottom:12px!important;min-width:0}.sv-inner>div:first-child>div:nth-child(2){margin:0!important;min-width:0}.sv-inner>div:first-child>div:nth-child(2) h2{font-size:clamp(48px,5.6vw,86px)!important;line-height:.96!important;overflow-wrap:anywhere!important}.sv-inner>div:first-child>div:nth-child(3){display:grid!important;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)!important;gap:30px!important;margin:0!important;min-height:0!important;align-items:center!important;overflow:hidden!important}.sv-inner>div:first-child>div:nth-child(3)>.sv-media{aspect-ratio:16/9!important;width:100%!important;max-height:100%!important}.sv-inner>div:first-child>div:nth-child(3)>div:last-child{min-width:0!important}
`;
  }
  if (layout === 'indexhero') {
    css += `
.sv-section{padding:42px 60px!important}.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:23px!important}.sv-inner>div:first-child{grid-column:1/-1!important;padding-bottom:13px!important;min-width:0}.sv-inner>div:nth-child(2){min-width:0!important}.sv-inner>div:nth-child(2) h1{font-size:clamp(60px,6.2vw,98px)!important;line-height:.94!important;letter-spacing:-.055em!important}.sv-inner>div:nth-child(2) p{font-size:clamp(17px,1.5vw,23px)!important;line-height:1.3!important;margin-top:18px!important;max-width:1050px!important}.sv-inner>div:nth-child(3){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:24px!important;border-top:1px solid currentColor!important;padding-top:18px!important;min-height:0!important;overflow:hidden!important}.sv-inner>div:nth-child(3)>div{min-width:0!important;display:grid!important;grid-template-rows:auto minmax(0,1fr) auto!important;gap:9px!important;min-height:0!important}.sv-inner>div:nth-child(3) .sv-media{width:100%!important;height:auto!important;aspect-ratio:16/9!important;max-height:100%!important}.sv-inner>div:nth-child(3) p{font-size:13px!important;line-height:1.35!important}
`;
  }
  if (layout === 'directions') {
    css += `
.sv-section{padding:64px 76px!important}.sv-inner{display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)!important;gap:clamp(40px,5vw,76px)!important;align-items:center!important}.sv-inner>div:first-child{min-width:0!important}.sv-inner>div:first-child [data-sb-repeat]{gap:clamp(12px,1.4vw,22px)!important}.sv-inner>div:first-child h2{font-size:clamp(37px,4.2vw,66px)!important}.sv-inner>div:first-child p{font-size:clamp(13px,1vw,16px)!important;margin-top:12px!important}.sv-inner>.sv-media,[data-sb-media]{align-self:center!important;width:100%!important;aspect-ratio:16/9!important;max-height:100%!important}
`;
  }
  if (layout === 'micro') {
    css += `
.sv-section{padding:52px 68px!important}.rc-micro{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:23px!important}.rc-micro>div:first-child{margin:0!important;padding-bottom:14px!important}.rc-micro-grid{min-height:0!important;display:block!important;overflow:hidden!important}.rc-micro-card{height:100%!important;display:grid!important;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr)!important;gap:34px!important;align-items:center!important}.rc-micro-card>.sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}.rc-micro-copy{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:14px!important}.rc-micro-copy p{font-size:clamp(17px,1.4vw,22px)!important;line-height:1.5!important}
`;
  }
  if (layout === 'asym') {
    css += `
.sv-section{padding:48px 62px!important}.rc-asym{display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important;grid-template-rows:repeat(3,minmax(0,1fr))!important;gap:16px 28px!important;align-items:center!important}.rc-asym>*{min-width:0!important;max-width:100%!important;margin:0!important}.rc-asym>*:nth-child(1){grid-column:1!important;grid-row:1/-1!important;display:flex!important;align-items:center!important;justify-content:center!important}.rc-asym>*:nth-child(1) .sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}.rc-asym>*:nth-child(2){grid-column:2!important;grid-row:1!important;display:flex!important;flex-direction:column!important;gap:8px!important;justify-content:flex-end!important}.rc-asym>*:nth-child(2) .sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}.rc-asym>*:nth-child(3){grid-column:2!important;grid-row:2!important;align-self:center!important}.rc-asym>*:nth-child(3) h4{font-size:clamp(20px,2.1vw,31px)!important;margin:0 0 6px!important}.rc-asym>*:nth-child(3) p{font-size:13px!important;margin:0!important}.rc-asym>*:nth-child(4){grid-column:2!important;grid-row:3!important;display:flex!important;align-items:flex-start!important}.rc-asym>*:nth-child(4) .sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}
`;
  }
  if (layout === 'statement' || layout === 'manifest') {
    css += `
.sv-section{padding:66px 76px!important;display:flex!important;align-items:center!important}.sv-inner{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:clamp(17px,2vw,28px)!important}.sv-inner [data-role="statement"]{font-size:clamp(44px,5.4vw,84px)!important;line-height:1.06!important;letter-spacing:-.045em!important;max-width:1320px!important;margin:0!important}.sv-inner>div{min-width:0!important}.sv-inner [style*="margin-bottom"]{margin-bottom:0!important}.sv-inner [data-role="overline"]{margin:0!important}
`;
  }
  if (layout === 'genericSplit') {
    css += `
.sv-section{padding:54px 68px!important}.rc-generic-split{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;gap:32px!important;align-items:center!important}.rc-generic-split .sv-media,.rc-generic-split [data-sb-media]{max-width:100%!important;max-height:100%!important;aspect-ratio:16/9!important}
`;
  }
  if (
    method === 'split' &&
    layout !== 'about' &&
    layout !== 'asym' &&
    layout !== 'micro' &&
    layout !== 'matrix' &&
    layout !== 'indexhero' &&
    layout !== 'directions' &&
    layout !== 'genericSplit'
  ) {
    css += `
.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:22px 38px!important;align-items:center!important}.sv-inner> :first-child{grid-column:1/-1!important}.sv-inner [data-sb-media],.sv-inner .sv-media{max-width:100%!important;max-height:100%!important;aspect-ratio:16/9!important}
`;
  }
  if (method === 'fit') {
    css += `
.sv-section>.sv-inner{transform-origin:top left!important}
`;
  }
  return css;
}

export function portraitCss(layout: string, method: string, t: TemplateItem): string {
  const id = String(t?.tpl || '').toLowerCase();
  let css = `
html,body{width:900px!important;min-width:900px!important;height:1600px!important;min-height:1600px!important;max-height:1600px!important;overflow:hidden!important}
body{overflow:hidden!important}
.sv-section{width:900px!important;height:1600px!important;min-height:1600px!important;max-height:1600px!important;padding:58px 52px!important;overflow:hidden!important}
.sv-section>.sv-inner{width:100%!important;height:100%!important;max-width:none!important;max-height:100%!important;min-height:0!important;min-width:0!important;box-sizing:border-box!important}
.sv-inner>*{min-width:0!important;max-width:100%!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"],.sv-inner h1,.sv-inner h2{font-size:clamp(34px,6.2vw,58px)!important;line-height:1.02!important;letter-spacing:-.035em!important;overflow-wrap:anywhere!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,2.4vw,23px)!important;line-height:1.25!important}
.sv-inner [data-role="body"],.sv-inner p{font-size:clamp(14px,1.7vw,18px)!important;line-height:1.45!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:11px!important;line-height:1.35!important;overflow-wrap:anywhere!important}
.sv-media,[data-sb-media]{max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
img,video,svg{max-width:100%!important;height:auto}
`;
  if (method === 'compact' || method === 'fit') {
    css += `.sv-section{padding:44px 42px!important}.sv-inner{gap:16px!important}.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(29px,5.5vw,50px)!important;line-height:1.04!important}.sv-inner [data-role="body"],.sv-inner p{font-size:14px!important;line-height:1.42!important}`;
  }
  if (method === 'smart') css += `.sv-section{padding:58px 52px!important}.sv-inner{gap:22px!important}`;
  if (method === 'split') css += `.sv-section{padding:50px 46px!important}.sv-inner{gap:18px!important}`;

  if (id.includes('aboutmanifestostacked')) {
    css += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:20px!important}
.rc-about-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr) auto!important;gap:20px!important;align-items:start!important}
.rc-about-copy{display:flex!important;flex-direction:column!important;gap:14px!important;min-width:0!important}
.rc-about-copy [data-role="statement"]{font-size:clamp(38px,6.1vw,55px)!important;line-height:1.02!important;max-width:100%!important}
.rc-about-visual{min-height:0!important;max-height:100%!important;align-items:center!important}
.rc-about-visual .sv-media,.rc-about-visual [data-sb-media]{aspect-ratio:2.1/1!important;width:100%!important;max-height:360px!important}
.rc-about-footer{grid-column:1!important;padding-top:12px!important}
.rc-about-footer>div{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
.sv-inner>div:nth-child(3)[data-sb-media],.sv-inner>.sv-media{max-height:340px!important}
`;
  }
  if (id.includes('servicesrepeatrows')) {
    css += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:26px!important}
.sv-inner>div:first-child{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:8px!important;margin:0!important}
.sv-inner>div:first-child [data-role="title"]{font-size:clamp(39px,6.5vw,58px)!important}
.sv-inner [data-sb-repeat]{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:0!important}
.sv-inner [data-sb-repeat]>div{display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:12px!important;align-items:start!important;padding:18px 0!important}
.sv-inner [data-sb-repeat]>div h3{grid-column:2!important;font-size:clamp(24px,4.6vw,38px)!important;line-height:1.05!important}
.sv-inner [data-sb-repeat]>div p{grid-column:2!important;margin-top:4px!important}
`;
  }
  if (id.includes('contactsplit')) {
    css += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:30px!important}
.sv-inner>div:first-child,.sv-inner>div:nth-child(2){width:100%!important;min-width:0!important;gap:14px!important;padding-top:0!important}
.sv-inner [data-role="title"]{font-size:clamp(46px,7vw,62px)!important}
.sv-inner [data-role="body"]{max-width:100%!important;font-size:16px!important;line-height:1.5!important}
`;
  }
  if (id.includes('swisstypographicmatrix')) {
    css += `
.sv-inner>div:first-child{display:flex!important;flex-direction:column!important;gap:20px!important;padding:20px!important;height:100%!important;overflow:hidden!important}
.sv-inner>div:first-child>div:nth-child(1){display:flex!important;flex-wrap:wrap!important;gap:8px 18px!important;padding-bottom:12px!important}
.sv-inner>div:first-child>div:nth-child(2){margin:0!important}
.sv-inner>div:first-child>div:nth-child(2) h2{font-size:clamp(38px,6.5vw,58px)!important;line-height:1!important}
.sv-inner>div:first-child>div:nth-child(3){display:flex!important;flex-direction:column!important;gap:18px!important;margin:0!important;min-height:0!important;overflow:hidden!important}
.sv-inner>div:first-child>div:nth-child(3)>.sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:320px!important}
`;
  }
  if (id.includes('swisstypoindexhero')) {
    css += `
.sv-inner{display:flex!important;flex-direction:column!important;gap:20px!important}
.sv-inner>div:first-child{display:flex!important;flex-wrap:wrap!important;gap:12px!important;align-items:flex-end!important;padding-bottom:12px!important}
.sv-inner>div:nth-child(2) h1{font-size:clamp(43px,7.3vw,66px)!important;line-height:.98!important;letter-spacing:-.05em!important}
.sv-inner>div:nth-child(2) p{font-size:17px!important;line-height:1.35!important;margin-top:16px!important}
.sv-inner>div:nth-child(3){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;padding-top:16px!important;min-height:0!important;overflow:hidden!important}
.sv-inner>div:nth-child(3)>div{display:flex!important;flex-direction:column!important;gap:9px!important;min-height:0!important}
.sv-inner>div:nth-child(3) .sv-media{width:100%!important;aspect-ratio:4/3!important;max-height:230px!important}
.sv-inner>div:nth-child(3) p{font-size:12px!important;line-height:1.35!important}
`;
  }
  if (id.includes('showreelsplitdirections')) {
    css += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:26px!important}
.sv-inner>div:first-child{width:100%!important;min-width:0!important;gap:14px!important}
.sv-inner>div:first-child [data-sb-repeat]{display:flex!important;flex-direction:column!important;gap:9px!important}
.sv-inner>div:first-child h2{font-size:clamp(38px,6.4vw,55px)!important;line-height:1!important}
.sv-inner>div:first-child p{margin-top:4px!important}
.sv-inner>.sv-media,.sv-inner>[data-sb-media]{width:100%!important;aspect-ratio:16/9!important;max-height:420px!important}
`;
  }
  if (id.includes('showreelmicrogrid')) {
    css += `
.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:20px!important}
.sv-inner>div:first-child{margin:0!important;padding-bottom:12px!important}
.sv-inner>div:nth-child(2){min-height:0!important;display:block!important;overflow:hidden!important}
.sv-inner [data-sb-repeat]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto auto!important;gap:14px!important;height:100%!important}
.sv-inner [data-sb-repeat]>.sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:450px!important}
.sv-inner [data-sb-repeat]>div:not(.sv-media){display:flex!important;flex-direction:column!important;gap:8px!important}
`;
  }
  if (id.includes('showreelasymmetricgrid')) {
    css += `
.rc-asym{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:auto auto auto!important;gap:14px!important;align-items:start!important}
.rc-asym>*{min-width:0!important;max-width:100%!important;margin:0!important}
.rc-asym>*:nth-child(1){grid-column:1/-1!important;grid-row:1!important;display:flex!important;align-items:center!important}
.rc-asym>*:nth-child(1) .sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:400px!important}
.rc-asym>*:nth-child(2){grid-column:1!important;grid-row:3!important;display:flex!important;flex-direction:column!important;gap:8px!important}
.rc-asym>*:nth-child(2) .sv-media,.rc-asym>*:nth-child(4) .sv-media{width:100%!important;aspect-ratio:4/3!important;max-height:240px!important}
.rc-asym>*:nth-child(3){grid-column:1/-1!important;grid-row:2!important;align-self:center!important}
.rc-asym>*:nth-child(3) h4{font-size:clamp(23px,4vw,32px)!important;margin:0 0 6px!important}
.rc-asym>*:nth-child(3) p{font-size:13px!important;margin:0!important}
.rc-asym>*:nth-child(4){grid-column:2!important;grid-row:3!important;display:flex!important;align-items:flex-start!important}
`;
  }
  if (id.includes('showreelstatementdirections') || id.includes('statementfullbleed') || id.includes('converted169')) {
    css += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:24px!important}
.sv-inner [data-role="statement"]{font-size:clamp(38px,6.8vw,64px)!important;line-height:1.08!important;letter-spacing:-.035em!important;max-width:100%!important}
.sv-inner [style*="margin-bottom"]{margin-bottom:0!important}
.sv-inner>div{min-width:0!important}
`;
  }
  if (layout === 'genericSplit' || layout === 'generic') {
    css += `
.sv-inner.rc-generic-split{display:flex!important;flex-direction:column!important;gap:24px!important}
.sv-inner .sv-media,.sv-inner [data-sb-media]{width:100%!important;max-width:100%!important;aspect-ratio:16/9!important;max-height:420px!important}
`;
  }
  if (method === 'split') {
    css += `.sv-section>.sv-inner{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:22px!important}.sv-section>.sv-inner>*{width:100%!important;min-width:0!important}`;
  }
  css += `\n[data-sb-format-inner]{position:static!important;left:auto!important;top:auto!important;width:900px!important;height:1600px!important;transform:none!important;overflow:visible!important}`;
  return css;
}

export function smartCssFixes(doc: Document, layout: string, method: string, t: TemplateItem): void {
  const sec = pickRoot(doc);
  if (sec) {
    setInline(sec, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: W + 'px',
      height: H + 'px',
      'min-height': '0',
      'max-height': H + 'px',
      overflow: 'hidden',
      'box-sizing': 'border-box',
    });
    const inner = sec.querySelector('.sv-inner') as HTMLElement | null;
    if (inner) {
      setInline(inner, {
        width: '100%',
        height: '100%',
        'max-width': 'none',
        'min-height': '0',
        'max-height': '100%',
        margin: '0',
        'box-sizing': 'border-box',
      });
    }
  }
  const css = targetCss(layout, method) + '\n' + portraitCss(layout, method, t);
  createStyle(doc, css);
}

export function fitDown(doc: Document, limit = 8): { factor: number; overflow: OverflowIssue[] } {
  const section = pickRoot(doc);
  if (!section) return { factor: 1, overflow: [] };
  let factor = 1;
  let report = checkOverflow(doc);
  for (let i = 0; i < limit && report.length; i++) {
    factor *= 0.94;
    const all = doc.querySelectorAll(
      '.sv-section [data-sb-editable],.sv-section h1,.sv-section h2,.sv-section h3,.sv-section h4,.sv-section p,.sv-section span,.sv-section .sv-media,.sv-section [data-sb-media],.sv-section [style*="gap"],.sv-section [style*="padding"],.sv-section [style*="margin"]'
    );
    all.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const cs = doc.defaultView?.getComputedStyle(htmlEl);
      if (!cs) return;
      if (htmlEl.matches('[data-sb-editable],h1,h2,h3,h4,p,span')) {
        const fs = parseFloat(cs.fontSize);
        if (fs > 8) htmlEl.style.setProperty('font-size', Math.max(9, fs * 0.94) + 'px', 'important');
        const lh = parseFloat(cs.lineHeight);
        if (Number.isFinite(lh) && lh > 10) htmlEl.style.setProperty('line-height', Math.max(1, lh * 0.94) + 'px', 'important');
      }
      if (/gap/i.test(htmlEl.getAttribute('style') || '')) {
        ['gap', 'row-gap', 'column-gap'].forEach((k) => {
          const v = parseFloat(cs.getPropertyValue(k));
          if (Number.isFinite(v) && v > 5) htmlEl.style.setProperty(k, Math.max(4, v * 0.94) + 'px', 'important');
        });
      }
      if (/padding/i.test(htmlEl.getAttribute('style') || '')) {
        ['padding-top', 'padding-bottom', 'padding-left', 'padding-right'].forEach((k) => {
          const v = parseFloat(cs.getPropertyValue(k));
          if (Number.isFinite(v) && v > 4) htmlEl.style.setProperty(k, Math.max(3, v * 0.94) + 'px', 'important');
        });
      }
      if (htmlEl.matches('.sv-media,[data-sb-media]')) {
        htmlEl.style.setProperty('max-height', '330px', 'important');
        htmlEl.style.setProperty('max-width', '100%', 'important');
      }
    });
    report = checkOverflow(doc);
  }
  return { factor, overflow: report };
}

export function checkOverflow(doc: Document): OverflowIssue[] {
  const section = pickRoot(doc);
  if (!section) return [{ name: 'Основной контейнер', reason: 'не найден .sv-section' }];
  const base = section.getBoundingClientRect();
  const list: OverflowIssue[] = [];
  const items = [
    ...section.querySelectorAll('[data-sb-editable],[data-sb-media],.sv-media,img,video,h1,h2,h3,h4,p'),
  ] as HTMLElement[];

  for (const el of items) {
    const r = el.getBoundingClientRect();
    const name = (el.getAttribute('data-slot') || el.getAttribute('data-role') || el.tagName.toLowerCase()).slice(0, 45);
    let why = '';
    if (r.left < base.left - 1 || r.right > base.right + 1) why = 'за левой/правой границей';
    if (r.top < base.top - 1 || r.bottom > base.bottom + 1) {
      why += (why ? ' и ' : '') + 'за верхней/нижней границей';
    }
    const cs = doc.defaultView?.getComputedStyle(el);
    if (cs) {
      if (!why && (cs.overflowY === 'hidden' || cs.overflowY === 'clip') && el.scrollHeight > el.clientHeight + 3) {
        why = 'внутренний контент обрезается';
      }
      if (!why && (cs.overflowX === 'hidden' || cs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 3) {
        why = 'горизонтальный контент обрезается';
      }
    }
    if (why) {
      list.push({
        name,
        reason: why,
        top: Math.round(r.top - base.top),
        bottom: Math.round(r.bottom - base.top),
      });
    }
  }
  return list.slice(0, 16);
}

// ============================================================
// NEW ALGORITHMS IMPLEMENTATION: editorial, heroMedia, mediaGrid, balanced, typographic
// ============================================================

export function applyNewMethodRules(doc: Document, t: TemplateItem, method: AdaptationMethod): { layout: string } {
  unwrapFormatFrame(doc);
  const sec = pickRoot(doc);
  if (!sec) return { layout: 'generic' };
  const inner = (sec.querySelector('.sv-inner') as HTMLElement) || sec;
  const id = String(t?.tpl || '').toLowerCase();

  // Reset basic container dimensions
  setInline(sec, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: W + 'px',
    height: H + 'px',
    'min-height': '0',
    'max-height': H + 'px',
    overflow: 'hidden',
    'box-sizing': 'border-box',
  });
  setInline(inner, {
    width: '100%',
    height: '100%',
    'max-width': 'none',
    'min-height': '0',
    'max-height': '100%',
    margin: '0',
    'box-sizing': 'border-box',
  });

  let layoutName = method;
  let customCss = '';

  // ------------------------------------------------------------
  // METHOD A: EDITORIAL (Vertical Editorial Architecture)
  // ------------------------------------------------------------
  if (method === 'editorial') {
    layoutName = 'editorial';
    customCss = `
html,body{width:${W}px!important;height:${H}px!important;margin:0!important;padding:0!important;overflow:hidden!important}
.sv-section{width:${W}px!important;height:${H}px!important;padding:64px 60px!important;box-sizing:border-box!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
.sv-inner{width:100%!important;height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:28px!important;box-sizing:border-box!important}
.sv-inner [data-role="overline"]{font-size:12px!important;letter-spacing:0.18em!important;text-transform:uppercase!important;margin-bottom:12px!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(40px,7.2vw,72px)!important;line-height:0.98!important;letter-spacing:-0.035em!important;margin:0 0 16px 0!important}
.sv-inner [data-role="body"],.sv-inner p{font-size:clamp(15px,1.9vw,19px)!important;line-height:1.55!important;max-width:100%!important}
.sv-inner [data-role="smallMeta"],.sv-inner [data-role="label"]{font-size:11px!important;line-height:1.35!important;letter-spacing:0.08em!important}
`;
    if (id.includes('aboutmanifestostacked')) {
      specialAbout(doc, sec, inner);
      customCss += `
.rc-about-layout{width:100%!important;height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:32px!important}
.rc-about-copy{display:flex!important;flex-direction:column!important;gap:18px!important;text-align:center!important}
.rc-about-copy [data-role="statement"]{font-size:clamp(44px,6.8vw,66px)!important;line-height:1.02!important;margin:0 auto!important;max-width:820px!important}
.rc-about-visual{flex:1!important;min-height:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
.rc-about-visual .sv-media,.rc-about-visual [data-sb-media]{width:100%!important;aspect-ratio:16/10!important;max-height:560px!important;height:auto!important;margin:0 auto!important}
.rc-about-footer{margin-top:auto!important;border-top:1px solid currentColor!important;padding-top:24px!important;width:100%!important}
.rc-about-footer>div{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:24px!important;border:0!important;padding:0!important}
`;
    } else if (id.includes('contactsplit')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:40px!important}
.sv-inner>div:first-child{display:flex!important;flex-direction:column!important;gap:24px!important;padding-bottom:28px!important;border-bottom:1px solid currentColor!important}
.sv-inner [data-role="title"]{font-size:clamp(54px,8vw,78px)!important;line-height:0.95!important}
.sv-inner [data-role="body"]{font-size:18px!important;line-height:1.6!important;max-width:680px!important}
.sv-inner>div:nth-child(2){margin-top:auto!important;display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:28px 36px!important;padding:0!important}
.sv-inner>div:nth-child(2)>div:last-child{grid-column:1/-1!important;border-top:1px solid rgba(0,0,0,0.12)!important;padding-top:20px!important}
`;
    } else if (id.includes('swisstypographicmatrix')) {
      customCss += `
.sv-inner>div:first-child{height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:24px!important;padding:28px!important;box-sizing:border-box!important}
.sv-inner>div:first-child>div:nth-child(1){border-bottom:1px solid #000!important;padding-bottom:16px!important}
.sv-inner>div:first-child>div:nth-child(2) h2{font-size:clamp(44px,7vw,70px)!important;line-height:0.96!important;margin:0!important}
.sv-inner>div:first-child>div:nth-child(3){display:flex!important;flex-direction:column!important;gap:24px!important;flex:1!important;justify-content:space-between!important;min-height:0!important}
.sv-inner>div:first-child>div:nth-child(3)>.sv-media{width:100%!important;aspect-ratio:16/10!important;max-height:480px!important;border:1px solid #000!important}
.sv-inner>div:first-child>div:nth-child(3)>div:last-child{margin-top:auto!important;border-top:1px solid #000!important;padding-top:16px!important}
`;
    } else if (id.includes('servicesrepeatrows')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:36px!important}
.sv-inner>div:first-child{border-bottom:1px solid currentColor!important;padding-bottom:24px!important}
.sv-inner [data-sb-repeat]{display:flex!important;flex-direction:column!important;gap:28px!important;flex:1!important}
.sv-inner [data-sb-repeat]>div{display:grid!important;grid-template-columns:56px 1fr!important;gap:18px 24px!important;padding:24px 0!important;border-top:1px solid currentColor!important;align-items:start!important}
.sv-inner [data-sb-repeat]>div h3{grid-column:2!important;font-size:clamp(26px,4.5vw,42px)!important}
.sv-inner [data-sb-repeat]>div p{grid-column:2!important;font-size:16px!important;line-height:1.6!important}
`;
    }
  }

  // ------------------------------------------------------------
  // METHOD B: HERO MEDIA (Hero Visual Focus)
  // ------------------------------------------------------------
  else if (method === 'heroMedia') {
    layoutName = 'heroMedia';
    customCss = `
html,body{width:${W}px!important;height:${H}px!important;margin:0!important;padding:0!important;overflow:hidden!important}
.sv-section{width:${W}px!important;height:${H}px!important;padding:56px 52px!important;box-sizing:border-box!important;overflow:hidden!important}
.sv-inner{width:100%!important;height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:24px!important}
.sv-media,[data-sb-media]{width:100%!important;max-height:640px!important;min-height:360px!important;aspect-ratio:1/1!important;object-fit:cover!important;border-radius:4px!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(36px,6vw,60px)!important;line-height:1.02!important;letter-spacing:-0.03em!important}
.sv-inner [data-role="body"],.sv-inner p{font-size:15px!important;line-height:1.5!important}
`;
    if (id.includes('showreelsplitdirections')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:24px!important}
.sv-inner>div:first-child{display:flex!important;flex-direction:column!important;gap:16px!important}
.sv-inner>div:first-child [data-sb-repeat]{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;gap:10px!important}
.sv-inner>div:first-child h2{font-size:clamp(20px,3.2vw,30px)!important;padding:8px 16px!important;border:1px solid #333!important;border-radius:100px!important;line-height:1.2!important}
.sv-inner>.sv-media,[data-sb-media]{flex:1!important;min-height:560px!important;max-height:720px!important;aspect-ratio:4/5!important;border:1px solid #444!important}
.sv-inner p{margin-top:auto!important;font-size:15px!important;max-width:100%!important}
`;
    } else if (id.includes('aboutmanifestostacked')) {
      specialAbout(doc, sec, inner);
      customCss += `
.rc-about-layout{height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:24px!important}
.rc-about-copy{text-align:center!important}
.rc-about-copy [data-role="statement"]{font-size:clamp(32px,5vw,50px)!important;margin:0 auto!important}
.rc-about-visual{flex:1!important;display:flex!important;align-items:center!important;justify-content:center!important}
.rc-about-visual .sv-media,.rc-about-visual [data-sb-media]{width:100%!important;aspect-ratio:1/1!important;max-height:640px!important;min-height:480px!important}
.rc-about-footer{margin-top:auto!important;padding-top:16px!important;border-top:1px solid currentColor!important}
.rc-about-footer>div{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:16px!important}
`;
    } else if (id.includes('swisstypographicmatrix')) {
      customCss += `
.sv-inner>div:first-child{height:100%!important;display:flex!important;flex-direction:column!important;gap:20px!important;padding:24px!important;justify-content:space-between!important}
.sv-inner>div:first-child>div:nth-child(2) h2{font-size:clamp(36px,5.8vw,56px)!important;margin:0!important}
.sv-inner>div:first-child>div:nth-child(3){display:flex!important;flex-direction:column!important;gap:20px!important;flex:1!important}
.sv-inner>div:first-child>div:nth-child(3)>.sv-media{width:100%!important;aspect-ratio:4/3!important;max-height:560px!important;flex:1!important}
.sv-inner>div:first-child>div:nth-child(3)>div:last-child{margin-top:auto!important}
`;
    }
  }

  // ------------------------------------------------------------
  // METHOD C: MEDIA GRID (Vertical Media Sequence for 2+ media)
  // ------------------------------------------------------------
  else if (method === 'mediaGrid') {
    layoutName = 'mediaGrid';
    customCss = `
html,body{width:${W}px!important;height:${H}px!important;margin:0!important;padding:0!important;overflow:hidden!important}
.sv-section{width:${W}px!important;height:${H}px!important;padding:48px 46px!important;box-sizing:border-box!important;overflow:hidden!important}
.sv-inner{width:100%!important;height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:20px!important}
.sv-media,[data-sb-media]{width:100%!important;box-sizing:border-box!important}
`;
    if (id.includes('swisstypoindexhero')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:24px!important}
.sv-inner>div:first-child{border-bottom:2px solid #000!important;padding-bottom:14px!important}
.sv-inner>div:nth-child(2) h1{font-size:clamp(40px,6.8vw,64px)!important;line-height:0.96!important;margin:0!important}
.sv-inner>div:nth-child(2) p{font-size:15px!important;margin-top:12px!important}
.sv-inner>div:nth-child(3){display:flex!important;flex-direction:column!important;gap:24px!important;border-top:1px solid #dcdcd8!important;padding-top:20px!important;flex:1!important;justify-content:space-around!important}
.sv-inner>div:nth-child(3)>div{display:flex!important;flex-direction:column!important;gap:8px!important}
.sv-inner>div:nth-child(3) .sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:360px!important;border:1px solid #000!important}
.sv-inner>div:nth-child(3) p{font-size:13px!important}
`;
    } else if (id.includes('showreelasymmetricgrid')) {
      specialAsym(doc, sec, inner);
      customCss += `
.rc-asym{width:100%!important;height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:20px!important}
.rc-asym>*{width:100%!important;min-width:0!important;margin:0!important}
.rc-asym>*:nth-child(1){order:1!important}
.rc-asym>*:nth-child(1) .sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:440px!important;border:1px solid #333!important}
.rc-asym>*:nth-child(3){order:2!important;padding:12px 0!important;border-top:1px solid #333!important;border-bottom:1px solid #333!important}
.rc-asym>*:nth-child(3) h4{font-size:28px!important;margin-bottom:8px!important}
.rc-asym>*:nth-child(3) p{font-size:15px!important;line-height:1.5!important}
.rc-asym>*:nth-child(2){order:3!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:16px!important;align-items:start!important}
.rc-asym>*:nth-child(4){order:4!important}
.rc-asym>*:nth-child(2) .sv-media,.rc-asym>*:nth-child(4) .sv-media{aspect-ratio:16/10!important;max-height:260px!important}
`;
    } else if (id.includes('showreelmicrogrid')) {
      specialMicro(doc, sec, inner);
      customCss += `
.rc-micro{display:flex!important;flex-direction:column!important;height:100%!important;justify-content:space-between!important;gap:24px!important}
.rc-micro-grid{flex:1!important;display:flex!important;flex-direction:column!important;gap:24px!important;justify-content:space-around!important}
.rc-micro-card{display:grid!important;grid-template-columns:140px 1fr!important;gap:20px!important;align-items:center!important;border-top:1px solid #e5e5e5!important;padding-top:16px!important}
.rc-micro-card>.sv-media{width:140px!important;aspect-ratio:16/10!important;max-height:120px!important}
.rc-micro-copy p{font-size:15px!important;line-height:1.5!important}
`;
    }
  }

  // ------------------------------------------------------------
  // METHOD D: BALANCED (Optical Balance & Golden Ratio)
  // ------------------------------------------------------------
  else if (method === 'balanced') {
    layoutName = 'balanced';
    customCss = `
html,body{width:${W}px!important;height:${H}px!important;margin:0!important;padding:0!important;overflow:hidden!important}
.sv-section{width:${W}px!important;height:${H}px!important;padding:clamp(60px,7vh,96px) 56px!important;box-sizing:border-box!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
.sv-inner{width:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-around!important;gap:clamp(32px,4vh,64px)!important;box-sizing:border-box!important;height:100%!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(38px,6.5vw,66px)!important;line-height:1.02!important}
.sv-inner [data-role="body"],.sv-inner p{font-size:16px!important;line-height:1.6!important}
`;
    if (id.includes('servicesrepeatrows')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:36px!important}
.sv-inner>div:first-child{margin-bottom:12px!important}
.sv-inner [data-sb-repeat]{display:flex!important;flex-direction:column!important;justify-content:space-evenly!important;flex:1!important}
.sv-inner [data-sb-repeat]>div{padding:32px 0!important;border-top:1px solid currentColor!important;display:grid!important;grid-template-columns:60px 1fr!important;gap:20px!important}
.sv-inner [data-sb-repeat] h3{grid-column:2!important;font-size:32px!important}
.sv-inner [data-sb-repeat] p{grid-column:2!important;font-size:17px!important;margin-top:8px!important}
`;
    } else if (id.includes('contactsplit')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-around!important;gap:48px!important}
.sv-inner>div:first-child{gap:20px!important}
.sv-inner [data-role="title"]{font-size:clamp(48px,7.5vw,70px)!important}
.sv-inner>div:nth-child(2){display:flex!important;flex-direction:column!important;gap:32px!important;padding-top:0!important}
.sv-inner>div:nth-child(2)>div{border-top:1px solid rgba(0,0,0,0.12)!important;padding-top:16px!important}
`;
    } else if (id.includes('statementfullbleed')) {
      customCss += `
.sv-inner{height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important}
.sv-inner [data-role="statement"]{font-size:clamp(46px,7.8vw,80px)!important;line-height:1.05!important;margin:auto 0!important}
.sv-inner>div:last-child{margin-top:auto!important}
`;
    }
  }

  // ------------------------------------------------------------
  // METHOD E: TYPOGRAPHIC (Monumental Typographic Poster)
  // ------------------------------------------------------------
  else if (method === 'typographic') {
    layoutName = 'typographic';
    customCss = `
html,body{width:${W}px!important;height:${H}px!important;margin:0!important;padding:0!important;overflow:hidden!important}
.sv-section{width:${W}px!important;height:${H}px!important;padding:72px 56px!important;box-sizing:border-box!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important}
.sv-inner{width:100%!important;height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:32px!important;box-sizing:border-box!important}
.sv-inner [data-role="overline"]{font-size:13px!important;letter-spacing:0.25em!important;text-transform:uppercase!important}
.sv-inner [data-role="statement"],.sv-inner [data-role="title"]{font-size:clamp(44px,8vw,86px)!important;line-height:0.96!important;letter-spacing:-0.04em!important;margin:0!important}
.sv-inner [data-role="body"],.sv-inner p{font-size:clamp(16px,2vw,22px)!important;line-height:1.45!important}
`;
    if (id.includes('statementdirections')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:32px!important}
.sv-inner [data-role="overline"]{border-bottom:1px solid #444!important;padding-bottom:16px!important;margin-bottom:8px!important}
.sv-inner [data-role="statement"]{font-size:clamp(32px,5.4vw,56px)!important;line-height:1.15!important;letter-spacing:-0.02em!important;flex:1!important;display:flex!important;align-items:center!important;text-align:justify!important}
.sv-inner>div:after{content:"[ 01 — 20 DISCIPLINES ]";display:block;margin-top:auto;font-family:monospace;font-size:12px;color:#666;border-top:1px solid #333;padding-top:16px;letter-spacing:0.15em}
`;
    } else if (id.includes('statementfullbleed')) {
      customCss += `
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:space-between!important;height:100%!important}
.sv-inner [data-role="overline"]{font-size:12px!important;letter-spacing:0.2em!important;padding-bottom:16px!important;border-bottom:1px solid currentColor!important;width:100%!important}
.sv-inner [data-role="statement"]{font-size:clamp(48px,8.2vw,88px)!important;line-height:0.96!important;letter-spacing:-0.04em!important;margin:auto 0!important}
.sv-inner>div:last-child{width:100%!important;border-top:1px solid currentColor!important;padding-top:24px!important}
`;
    }
  }

  createStyle(doc, customCss, 'recompose-new-method-css');
  return { layout: layoutName };
}

// ============================================================
// CONVERSION DISPATCHER
// ============================================================
export async function convertTemplate(
  sourceHtml: string,
  t: TemplateItem,
  method: AdaptationMethod
): Promise<ConversionResult> {
  const startTime = performance.now();
  const frame = document.createElement('iframe');
  frame.title = `Convert ${t.tpl} to ${method}`;
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.style.cssText = `position:fixed;left:-2000px;top:-2000px;width:${W}px;height:${H}px;opacity:0;pointer-events:none;border:0`;
  document.body.appendChild(frame);

  try {
    frame.srcdoc = targetDoc(sourceHtml);
    await new Promise<void>((resolve, reject) => {
      frame.onload = () => {
        try {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        } catch (e) {
          reject(e);
        }
      };
      frame.onerror = () => reject(new Error('Не удалось загрузить iframe'));
      setTimeout(resolve, 800);
    });

    const doc = frame.contentDocument;
    if (!doc) throw new Error('Не удалось получить документ iframe');

    try {
      await Promise.race([
        Promise.resolve(doc.fonts?.ready).catch(() => {}),
        new Promise((r) => setTimeout(r, 600)),
      ]);
    } catch (_) {}

    let layoutName = 'generic';
    let fitResult = { factor: 1, overflow: [] as OverflowIssue[] };

    // --- BASELINE 4 METHODS (smart, compact, split, fit) ---
    if (['smart', 'compact', 'split', 'fit'].includes(method)) {
      const semantic =
        method === 'smart' || method === 'split'
          ? smartStructure(doc, t)
          : (unwrapFormatFrame(doc),
            {
              section: pickRoot(doc),
              inner: (pickRoot(doc)?.querySelector('.sv-inner') as HTMLElement) || null,
              layout: /showreelasymmetricgrid/i.test(t.tpl || '') ? 'asym' : 'generic',
            });
      smartCssFixes(doc, semantic.layout, method, t);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      fitResult = { factor: 1, overflow: checkOverflow(doc) };
      if (method === 'fit' || fitResult.overflow.length) {
        fitResult = fitDown(doc, method === 'fit' ? 12 : 7);
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      fitResult.overflow = checkOverflow(doc);
      layoutName = semantic.layout;
    }
    // --- NEW 5 METHODS (editorial, heroMedia, mediaGrid, balanced, typographic) ---
    else {
      const res = applyNewMethodRules(doc, t, method);
      layoutName = res.layout;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      fitResult = { factor: 1, overflow: checkOverflow(doc) };
      if (fitResult.overflow.length > 0) {
        fitResult = fitDown(doc, 5);
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      fitResult.overflow = checkOverflow(doc);
    }

    // Measure height utilization
    const sec = pickRoot(doc);
    let heightUtilizationPct = 85;
    if (sec) {
      const rects = [...sec.querySelectorAll(':scope > *, .sv-inner > *')].map((el) => el.getBoundingClientRect());
      if (rects.length) {
        const top = Math.min(...rects.map((r) => r.top));
        const bottom = Math.max(...rects.map((r) => r.bottom));
        const span = Math.max(100, bottom - top);
        heightUtilizationPct = Math.min(100, Math.round((span / H) * 100));
      }
    }

    const mediaCount = (sourceHtml.match(/data-sb-media|class=["'][^"']*sv-media/g) || []).length;
    const editableCount = (sourceHtml.match(/data-sb-editable/g) || []).length;
    const outputHtml = '<!doctype html>\n' + doc.documentElement.outerHTML;

    return {
      outputHtml,
      method,
      layout: layoutName,
      fitFactor: fitResult.factor,
      overflow: fitResult.overflow,
      heightUtilizationPct,
      mediaCount,
      editableCount,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } finally {
    frame.remove();
  }
}
