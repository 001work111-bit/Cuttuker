// ============================================================================
// НОВЫЕ МЕТОДЫ (advanced) — добавлены отдельно от baseline.ts и не влияют
// на поведение 4 исходных методов. Каждый метод решает свою композиционную
// задачу и рассчитывается заново от исходного HTML шаблона (parseTemplate).
// ============================================================================
import type { Block, MethodResult, ParsedTemplate } from "../types";
import {
  CANVAS_H,
  CANVAS_W,
  first,
  metaRow,
  pick,
  renderMedia,
  renderText,
  repeatList,
  tagRow,
  textColorFor,
} from "./shared";

/** А. Вертикальная редакционная композиция.
 * Задача: для текстовых/слабомедийных шаблонов (title+body+meta, 0-1 медиа)
 * не допустить скопления всего содержимого вверху кадра. Контент явно
 * распределяется по всей высоте 1600px через гибкие пропорции (flex-grow) и
 * увеличенные интервалы, а не просто идёт друг за другом.
 * Отличие от "Реконструкции по ролям": там медиа/блоки идут плотно сверху;
 * здесь высота кадра используется целиком, в том числе за счёт управляемых
 * отступов между смысловыми группами.
 */
export function methodEditorial(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const repeats = pick(blocks, "repeat");

  const head = `<div style="flex:0 0 auto;padding:48px 36px 0;">${
    overline ? renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.65;margin-bottom:16px;display:block;") : ""
  }${title ? renderText(title, "font-size:38px;line-height:1.08;font-weight:800;margin:0;display:block;") : ""}</div>`;

  const mediaBlock = media[0]
    ? `<div style="flex:1 1 auto;min-height:0;display:flex;align-items:center;padding:36px;">${renderMedia(
        media[0],
        "width:100%;height:100%;max-height:560px;object-fit:cover;border-radius:6px;"
      )}</div>`
    : `<div style="flex:1 1 auto;"></div>`;

  const bodyBlock = body.length
    ? `<div style="flex:0 0 auto;padding:0 36px;display:flex;flex-direction:column;gap:16px;">${body
        .map((b) => renderText(b, "font-size:17px;line-height:1.75;margin:0;display:block;"))
        .join("")}</div>`
    : "";

  const repeatBlock = repeats.length
    ? repeats
        .map((r) => `<div style="padding:24px 36px 0;">${repeatList(r, "display:flex;flex-direction:column;gap:12px;", "border-top:1px solid currentColor;opacity:.85;padding-top:12px;font-size:14px;")}</div>`)
        .join("")
    : "";

  const footer: string[] = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  const footerBlock = footer.length
    ? `<div style="flex:0 0 auto;padding:28px 36px 44px;border-top:1px solid currentColor;display:flex;flex-direction:column;gap:14px;">${footer.join("")}</div>`
    : `<div style="flex:0 0 40px;"></div>`;

  const html = `<div style="width:${CANVAS_W}px;height:${CANVAS_H}px;display:flex;flex-direction:column;background:${bg};color:${color};">${head}${mediaBlock}${bodyBlock}${repeatBlock}${footerBlock}</div>`;
  return {
    html,
    notes: [
      "Содержимое растянуто на всю высоту 1600px через гибкие пропорции (flex-grow), а не собрано в верхней части кадра.",
      "Подходит для шаблонов «заголовок + текст (+ 0-1 медиа) + мета», где риск пустого низа наиболее велик.",
    ],
  };
}

/** Б. Главное медиа — полноэкранное (full-bleed) изображение/видео как
 * доминанта кадра, текст подан как подпись/оверлей поверх медиа или прямо
 * под ним. Задача: для шаблонов с одним главным медиа и вспомогательным
 * текстом получить выразительную постерную композицию, а не "картинка в
 * рамке посередине", как в smart.
 */
export function methodHeroMedia(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");

  const heroH = Math.round(CANVAS_H * 0.64);
  const hero = media[0]
    ? `<div style="position:relative;flex:0 0 ${heroH}px;overflow:hidden;">${renderMedia(media[0], "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")}
        <div style="position:absolute;left:0;right:0;bottom:0;padding:28px 32px 26px;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,0));">
          ${overline ? renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;opacity:.85;margin-bottom:10px;display:block;") : ""}
          ${title ? renderText(title, "font-size:30px;line-height:1.14;font-weight:800;color:#fff;margin:0;display:block;") : ""}
        </div>
      </div>`
    : `<div style="flex:0 0 ${heroH}px;display:flex;flex-direction:column;justify-content:center;padding:40px 32px;">${
        overline ? renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:14px;display:block;") : ""
      }${title ? renderText(title, "font-size:34px;line-height:1.1;font-weight:800;margin:0;display:block;") : ""}</div>`;

  const secondary = media.slice(1, 4);
  const secondaryRow = secondary.length
    ? `<div style="display:flex;gap:8px;padding:18px 24px 0;">${secondary
        .map((m) => renderMedia(m, "flex:1;aspect-ratio:1/1;object-fit:cover;border-radius:4px;"))
        .join("")}</div>`
    : "";

  const footer: string[] = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));

  // Высота не форсируется: герой — фиксированный процент кадра, остальное —
  // натуральная высота текста/footer, чтобы диагностика была честной.
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">
    ${hero}
    <div style="flex:none;display:flex;flex-direction:column;gap:16px;padding:24px 32px 32px;">
      ${body.map((b) => renderText(b, "font-size:16px;line-height:1.75;margin:0;display:block;")).join("")}
      ${secondaryRow}
      <div style="display:flex;flex-direction:column;gap:14px;">${footer.join("")}</div>
    </div>
  </div>`;
  return {
    html,
    notes: [
      "Главное медиа подано на всю ширину кадра (full-bleed) с заголовком-подписью поверх затемнения — постерная композиция.",
      "Рекомендуется для шаблонов с одним доминирующим изображением/видео и коротким текстом.",
    ],
  };
}

/** В. Вертикальная медиасетка — для шаблонов с 2+ изображениями, которые в
 * оригинале стоят рядом по горизонтали. Решает ключевую проблему из ТЗ:
 * вместо того чтобы сложить оба изображения друг на друга вверху кадра,
 * первое медиа становится крупным "якорем", а остальные — тайлами, которые
 * используют освободившуюся высоту портретного кадра.
 */
export function methodMediaGrid(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const title = first(blocks, "title") || first(blocks, "overline");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");

  const headerBlock = title
    ? `<div style="flex:0 0 auto;padding:36px 28px 18px;">${renderText(title, "font-size:26px;line-height:1.15;font-weight:800;margin:0;display:block;")}</div>`
    : "";

  const primary = media[0];
  const rest = media.slice(1);

  const primaryBlock = primary
    ? `<div style="flex:0 0 auto;padding:0 24px 12px;">${renderMedia(primary, "width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:6px;")}</div>`
    : "";

  let gridBlock = "";
  if (rest.length === 1) {
    gridBlock = `<div style="padding:0 24px 12px;">${renderMedia(rest[0], "width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;")}</div>`;
  } else if (rest.length >= 2) {
    gridBlock = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 24px 12px;">${rest
      .slice(0, 4)
      .map((m) => renderMedia(m, "width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:6px;"))
      .join("")}</div>`;
  }

  const textBlock = body.length
    ? `<div style="padding:8px 28px 0;display:flex;flex-direction:column;gap:10px;">${body
        .map((b) => renderText(b, "font-size:14px;line-height:1.65;margin:0;opacity:.9;display:block;"))
        .join("")}</div>`
    : "";

  const footer: string[] = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  const footerBlock = footer.length
    ? `<div style="margin-top:auto;padding:20px 28px 32px;display:flex;flex-direction:column;gap:12px;border-top:1px solid currentColor;">${footer.join("")}</div>`
    : `<div style="padding-bottom:28px;"></div>`;

  // Высота определяется естественно суммой аспектов медиа и текста —
  // так честно видно, насколько метод компактнее/полнее исходного стека.
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">${headerBlock}${primaryBlock}${gridBlock}${textBlock}${footerBlock}</div>`;
  return {
    html,
    notes: [
      `Обнаружено медиа-блоков: ${media.length}. Первое изображение стало крупным якорем (4:5), остальные образуют сетку тайлов — вместо тесного стека сверху кадра.`,
      "Подходит для галерей, сравнений «до/после», карточных сеток и шаблонов с несколькими изображениями.",
    ],
  };
}

/** Г. Сбалансированная композиция — универсальный метод для смешанных и
 * асимметричных структур. Каждому блоку присваивается "вес" (media > title >
 * repeat > body > meta > tag), высота кадра распределяется пропорционально
 * весам, а оставшееся пространство превращается в рассчитанные равные отступы
 * между группами — так низ кадра не остаётся случайно пустым, но и контент не
 * растягивается искусственно, как в "Редакционной композиции".
 */
export function methodBalanced(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const weight: Record<Block["bucket"], number> = {
    overline: 0.4,
    title: 2.6,
    media: 4,
    body: 1.8,
    meta: 1,
    tag: 0.4,
    repeat: 3,
    other: 0.5,
  };

  const renderables = blocks.filter((b) => b.bucket !== "tag");
  const totalWeight = renderables.reduce((s, b) => s + weight[b.bucket], 0) || 1;
  const PAD = 28;
  const usable = CANVAS_H - PAD * 2;
  const minGap = 14;
  const gapsTotal = minGap * Math.max(0, renderables.length - 1);
  const contentHeight = Math.max(usable - gapsTotal, usable * 0.6);

  const groups: string[] = [];
  const tags = pick(blocks, "tag");

  renderables.forEach((b) => {
    const share = weight[b.bucket] / totalWeight;
    const h = Math.max(48, Math.round(contentHeight * share));
    if (b.bucket === "media") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderMedia(b, `width:100%;height:${h}px;object-fit:cover;border-radius:6px;`)}</div>`);
    } else if (b.bucket === "repeat") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;max-height:${h}px;overflow:hidden;">${repeatList(b, "display:flex;flex-direction:column;gap:10px;", "border-top:1px solid currentColor;opacity:.85;padding-top:10px;font-size:13px;")}</div>`);
    } else if (b.bucket === "title") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;display:flex;align-items:center;min-height:${Math.min(h, 160)}px;">${renderText(b, "font-size:30px;line-height:1.12;font-weight:800;margin:0;display:block;")}</div>`);
    } else if (b.bucket === "overline") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderText(b, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.65;display:block;")}</div>`);
    } else if (b.bucket === "body") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderText(b, "font-size:15px;line-height:1.7;margin:0;display:block;")}</div>`);
    } else if (b.bucket === "meta") {
      groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${renderText(b, "font-size:13px;line-height:1.5;margin:0;opacity:.85;display:block;")}</div>`);
    }
  });

  if (tags.length) groups.push(`<div style="flex:0 0 auto;padding:0 ${PAD}px;">${tagRow(tags)}</div>`);

  const html = `<div style="width:${CANVAS_W}px;min-height:${CANVAS_H}px;display:flex;flex-direction:column;justify-content:center;gap:${minGap}px;padding:${PAD}px 0;background:${bg};color:${color};">${groups.join("")}</div>`;
  return {
    html,
    notes: [
      "Высота блоков рассчитана пропорционально их визуальному весу (медиа и повторы — тяжелее, подписи и теги — легче).",
      "Группы центрированы по высоте кадра с равными интервалами — универсальный вариант для асимметричных сеток и смешанного контента.",
    ],
  };
}

/** Д. Типографическая вертикальная композиция — для обложек/заявлений с
 * крупным заголовком и малым количеством медиа. Вместо попытки найти место
 * для медиа метод делает ставку на масштаб текста: заголовок увеличивается и
 * занимает основную часть кадра, медиа (если есть) становится маленьким
 * акцентом, а не главным элементом.
 */
export function methodTypographic(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const body = pick(blocks, "body");
  const media = pick(blocks, "media");
  const meta = pick(blocks, "meta");

  const accent = media[0]
    ? `<div style="position:absolute;right:28px;bottom:28px;width:120px;">${renderMedia(media[0], "width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:6px;opacity:.9;")}</div>`
    : "";

  const html = `<div style="position:relative;width:${CANVAS_W}px;height:${CANVAS_H}px;display:flex;flex-direction:column;background:${bg};color:${color};">
    <div style="flex:0 0 auto;padding:48px 36px 0;">${overline ? renderText(overline, "font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.65;display:block;") : ""}</div>
    <div style="flex:1;display:flex;align-items:center;padding:0 36px;">${
      title ? renderText(title, "font-size:64px;line-height:0.98;font-weight:800;letter-spacing:-2px;margin:0;display:block;") : ""
    }</div>
    <div style="flex:0 0 auto;padding:0 36px 40px;display:flex;flex-direction:column;gap:18px;">
      ${body.map((b) => renderText(b, "font-size:16px;line-height:1.7;max-width:640px;margin:0;opacity:.85;display:block;")).join("")}
      ${meta.length ? metaRow(meta) : ""}
    </div>
    ${accent}
  </div>`;
  return {
    html,
    notes: [
      "Заголовок увеличен и занимает основную вертикаль кадра, медиа (если есть) сведено к небольшому акценту в углу.",
      "Подходит для обложек-заявлений и шаблонов, где главная ценность — крупная типографика, а не иллюстрация.",
    ],
  };
}
