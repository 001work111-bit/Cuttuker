// ============================================================================
// БАЗОВЫЕ МЕТОДЫ — SMART / COMPACT / SPLIT / FIT
// ----------------------------------------------------------------------------
// ВНИМАНИЕ: это зафиксированные (baseline) алгоритмы лаборатории.
// Их поведение, CSS-правила и порядок вывода НЕ ДОЛЖНЫ меняться в рамках
// добавления новых методов (см. ТЗ п.3). Любые новые идеи реализуются только
// в advanced.ts и регистрируются как отдельные пункты списка методов.
// ============================================================================
import type { MethodResult, ParsedTemplate } from "../types";
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

/** 1. Контрольный safe-fit — диагностический вариант.
 * Минимально меняет структуру: берёт исходную секцию как есть и равномерно
 * масштабирует её к ширине 900px (zoom), чтобы честно показать, что получится
 * при "наивном" уменьшении горизонтального макета без перестройки композиции.
 * Именно этот метод чаще всего проявляет проблему из ТЗ: пустое пространство
 * снизу кадра или обрезанный контент.
 */
export function methodFit(parsed: ParsedTemplate, rawSectionHtml: string, naturalWidth: number): MethodResult {
  const scale = CANVAS_W / naturalWidth;
  // Высота контейнера НЕ зафиксирована искусственно — она должна честно
  // отражать результат равномерного масштабирования, чтобы диагностика
  // (пусто снизу / переполнение) измеряла реальную, а не подогнанную высоту.
  const html = `<div style="width:${CANVAS_W}px;background:${parsed.bg};position:relative;overflow:hidden;">
    <div style="width:${naturalWidth}px;zoom:${scale};">${rawSectionHtml}</div>
  </div>`;
  return {
    html,
    notes: [
      `Равномерное масштабирование оригинала (≈${Math.round(scale * 100)}%) без изменения DOM и порядка блоков.`,
      "Используется как контрольная точка: показывает исходную проблему «пусто снизу / обрезано», если она есть.",
    ],
  };
}

/** 2. Адаптивная сетка — сохраняет исходный DOM и дизайн-систему шаблона,
 * но уплотняет отступы, межблочные интервалы и сворачивает многоколоночные
 * grid-раскладки в одну колонку (как обычная адаптивная вёрстка под узкий
 * экран). Порядок элементов не меняется — в отличие от «Реконструкции по
 * ролям», здесь нет сознательного перераспределения по высоте.
 */
export function methodCompact(rawSectionHtml: string): MethodResult {
  let out = rawSectionHtml;

  // 1) ужимаем межблочные интервалы
  out = out.replace(/gap:\s*([\d.]+)px/gi, (_m, n) => `gap:${Math.max(8, Math.round(parseFloat(n) * 0.55))}px`);
  out = out.replace(/padding:\s*([\d.]+)px\s+var\(--pad\)/gi, (_m, n) => `padding:${Math.max(24, Math.round(parseFloat(n) * 0.5))}px 24px`);
  out = out.replace(/padding:\s*clamp\([^;]*?\)\s*var\(--pad\)/gi, "padding:28px 24px");
  out = out.replace(/var\(--pad\)/g, "24px");
  out = out.replace(/padding:\s*([\d.]+)px/gi, (_m, n) => `padding:${Math.max(14, Math.round(parseFloat(n) * 0.5))}px`);

  // 2) любые многоколоночные grid-раскладки сворачиваются в одну колонку —
  // это и есть "адаптивность": сетка подстраивается под узкий 900px кадр.
  out = out.replace(/grid-template-columns:\s*[^;"']+;/gi, "grid-template-columns:1fr;");

  // 3) отключаем фиксированные max-width — ширина теперь = ширина кадра
  out = out.replace(/max-width:\s*\d+px/gi, "max-width:100%");

  // 4) немного уменьшаем верхнюю границу clamp() шрифтов, т.к. колонка стала у́же
  out = out.replace(/clamp\(([\d.]+)px,([^,]+),([\d.]+)px\)/gi, (_m, min, mid, max) => `clamp(${Math.max(12, Math.round(parseFloat(min) * 0.9))}px,${mid},${Math.round(parseFloat(max) * 0.62)}px)`);

  // Высота не форсируется: именно натуральная высота после уплотнения
  // показывает, насколько метод реально сократил пустое пространство.
  const html = `<div style="width:${CANVAS_W}px;overflow:visible;">
    <div style="width:${CANVAS_W}px;">${out}</div>
  </div>`;
  return {
    html,
    notes: [
      "Исходный DOM и дизайн-система сохранены полностью — элементы не переставлены.",
      "Многоколоночные grid-блоки свёрнуты в одну колонку, отступы и шрифты уплотнены.",
    ],
  };
}

/** 3. Редакционный split — при наличии текста и медиа делает явную
 * двухзонную (в портретной рамке — верх/низ) композицию: медиа-зона и
 * текстовая зона с подчёркнутой линией раздела. Если медиа нет, верхняя зона
 * отдаётся заголовку, а не стопке мелких элементов.
 */
export function methodSplit(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const media = pick(blocks, "media");
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const repeats = pick(blocks, "repeat");

  const zoneA: string[] = [];
  const zoneB: string[] = [];

  if (media[0]) {
    zoneA.push(renderMedia(media[0], "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"));
    if (media.length > 1) {
      zoneA.push(
        `<div style="position:absolute;left:0;right:0;bottom:0;display:flex;gap:6px;padding:10px;">${media
          .slice(1, 4)
          .map((m) => renderMedia(m, "flex:1;height:84px;object-fit:cover;border:2px solid #fff;"))
          .join("")}</div>`
      );
    }
    if (overline) zoneB.push(renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.65;margin-bottom:10px;display:block;"));
    if (title) zoneB.push(renderText(title, "font-size:30px;line-height:1.12;font-weight:700;margin:0 0 14px;display:block;"));
  } else {
    if (overline) zoneA.push(renderText(overline, "font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:16px;display:block;"));
    if (title) zoneA.push(renderText(title, "font-size:38px;line-height:1.08;font-weight:800;margin:0;display:block;"));
  }

  body.forEach((b) => zoneB.push(renderText(b, "font-size:15px;line-height:1.7;margin:0 0 16px;display:block;")));
  if (meta.length) zoneB.push(metaRow(meta, "margin-top:8px;"));
  if (tags.length) zoneB.push(tagRow(tags));
  repeats.forEach((r) =>
    zoneB.push(repeatList(r, "display:flex;flex-direction:column;gap:10px;margin-top:16px;", "border-top:1px solid currentColor;opacity:.9;padding-top:10px;font-size:13px;"))
  );

  const zoneAHeight = media.length ? Math.round(CANVAS_H * 0.56) : Math.round(CANVAS_H * 0.4);
  // Зона A имеет фиксированную высоту (пропорция кадра), зона B — натуральная
  // высота текста; общая высота НЕ форсируется до 1600, чтобы диагностика
  // честно показывала реальный остаток/перебор по высоте.
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">
    <div style="position:relative;flex:0 0 ${zoneAHeight}px;background:#111;display:flex;flex-direction:column;justify-content:center;padding:${media.length ? "0" : "40px 32px"};overflow:hidden;">${zoneA.join("")}</div>
    <div style="flex:none;padding:32px;border-top:3px solid currentColor;display:flex;flex-direction:column;">${zoneB.join("")}</div>
  </div>`;
  return {
    html,
    notes: ["Явная двухзонная композиция: верх — акцент (медиа или заголовок), низ — текст/мета с чёткой линией раздела."],
  };
}

/** 4. Реконструкция по ролям — базовый "умный" метод. Разбирает шаблон на
 * семантические роли (overline/title/media/body/meta/tags/repeat) и
 * перестраивает их для вертикального кадра: заголовок сверху, главное медиа
 * получает собственный блок умеренного размера, второстепенные медиа — в ряд,
 * мета и теги закрепляются внизу кадра через margin-top:auto.
 */
export function methodSmart(parsed: ParsedTemplate): MethodResult {
  const { blocks, bg } = parsed;
  const color = textColorFor(bg);
  const overline = first(blocks, "overline");
  const title = first(blocks, "title");
  const media = pick(blocks, "media");
  const body = pick(blocks, "body");
  const meta = pick(blocks, "meta");
  const tags = pick(blocks, "tag");
  const repeats = pick(blocks, "repeat");

  const parts: string[] = [];
  parts.push(`<div style="padding:40px 32px 0;">`);
  if (overline) parts.push(renderText(overline, "font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;margin-bottom:14px;display:block;"));
  if (title) parts.push(renderText(title, "font-size:34px;line-height:1.12;font-weight:800;margin:0 0 20px;display:block;"));
  parts.push(`</div>`);

  if (media[0]) {
    const ar = media[0].aspect ? media[0].aspect : 4 / 3;
    parts.push(`<div style="padding:0 24px;margin-bottom:20px;">${renderMedia(media[0], `width:100%;aspect-ratio:${ar}/1;object-fit:cover;border-radius:4px;`)}</div>`);
  }

  parts.push(`<div style="padding:0 32px;display:flex;flex-direction:column;gap:14px;">`);
  body.forEach((b) => parts.push(renderText(b, "font-size:15px;line-height:1.7;margin:0;display:block;")));
  parts.push(`</div>`);

  if (media.length > 1) {
    parts.push(
      `<div style="display:flex;gap:10px;padding:20px 24px 0;">${media
        .slice(1)
        .map((m) => renderMedia(m, "flex:1;aspect-ratio:1/1;object-fit:cover;border-radius:4px;"))
        .join("")}</div>`
    );
  }

  repeats.forEach((r) =>
    parts.push(`<div style="padding:20px 24px 0;">${repeatList(r, "display:flex;flex-direction:column;gap:10px;", "border-top:1px solid currentColor;opacity:.85;padding-top:10px;font-size:13px;")}</div>`)
  );

  const footer: string[] = [];
  if (meta.length) footer.push(metaRow(meta));
  if (tags.length) footer.push(tagRow(tags));
  if (footer.length) parts.push(`<div style="padding:24px 32px 32px;display:flex;flex-direction:column;gap:14px;border-top:1px solid currentColor;">${footer.join("")}</div>`);
  else parts.push(`<div style="padding-bottom:32px;"></div>`);

  // Высота НЕ форсируется до 1600 — так диагностика честно показывает,
  // остаётся ли после сборки по ролям пустое место снизу (частая причина,
  // по которой для некоторых шаблонов лучше подходят новые методы).
  const html = `<div style="width:${CANVAS_W}px;display:flex;flex-direction:column;background:${bg};color:${color};">${parts.join("")}</div>`;
  return {
    html,
    notes: ["Порядок закреплён по ролям: overline → заголовок → главное медиа → текст → доп. медиа/повторы → мета/теги."],
  };
}
