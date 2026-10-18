import type { TemplateItem } from "./types";

export const variant1: TemplateItem[] = [
  {
    tpl: "variant1CoverIdea",
    family: "projectCover",
    group: "Обложка проекта",
    label: "Вариант 1 — Обложка и идея",
    code: "V1-01",
    icon: "◧",
    kind: "static",
    single: false,
    desc: "Вариант 1, страница 1: обложка-манифест — заголовок, один крупный кадр и весь пятифразный блок.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#F5F4F0;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:row;box-sizing:border-box;"><div style="width:59%;padding:40px 0px 40px 40px;box-sizing:border-box;display:flex;flex-direction:column;"><div class="sv-media" data-sb-media data-slot="v101Hero" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D8D3C8;aspect-ratio:16/11;box-sizing:border-box;"></div></div><div style="width:41%;padding:30px 40px 28px 36px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;border-left:1px solid #E3DED4;"><div data-sb-editable data-slot="v101Title" data-role="title" style="font-size:46px;line-height:0.95;letter-spacing:-0.02em;font-weight:700;color:#111111;margin:0 0 10px 0;">ПРОШЛОЕ<br>КАК ОСНОВА</div><div data-sb-editable data-slot="v101Question" data-role="subtitle" style="font-size:15px;line-height:1.4;color:#666666;margin:0 0 14px 0;">А может ли авторитет прошлого работать на современность?</div><div style="height:1px;background-color:#D8D3C8;margin:0 0 14px 0;"></div><div style="display:flex;flex-direction:column;gap:8px;"><div data-sb-editable data-slot="v101P1" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">Мы помещаем современный объект перед визуальным наследием прошлого.</div><div data-sb-editable data-slot="v101P2" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">То, что обладает культурным авторитетом, становится фоном.</div><div data-sb-editable data-slot="v101P3" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">А современный объект — продолжением этой линии.</div><div data-sb-editable data-slot="v101P4" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">Прошлое передаёт ему свой авторитет.</div><div data-sb-editable data-slot="v101P5" data-role="statement" style="font-size:19px;line-height:1.3;font-weight:700;color:#111111;margin:6px 0 0 0;padding-top:12px;border-top:1px solid #D8D3C8;">Современность получает акцент.</div></div></div></div></section>`
  },
  {
    tpl: "variant1Visuals",
    family: "gallery",
    group: "Галерея проекта",
    label: "Вариант 1 — Визуальный синтез",
    code: "V1-02",
    icon: "▦",
    kind: "static",
    single: false,
    desc: "Вариант 1, страница 2: чистая галерея-доказательство из четырёх крупных кадров, визуальный итог идеи.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#0A0A0A;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding:26px 32px 28px 32px;"><div style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;margin:0 0 14px 0;"><div data-sb-editable data-slot="v102CapMain" data-role="label" style="font-size:12px;letter-spacing:0.18em;color:#BDBDBD;margin:0;">VISUAL SYNTHESIS</div><div style="display:flex;flex-direction:row;gap:24px;"><div data-sb-editable data-slot="v102CapPast" data-role="label" style="font-size:11px;letter-spacing:0.14em;color:#8A8A8A;margin:0;">PAST → AUTHORITY</div><div data-sb-editable data-slot="v102CapPresent" data-role="label" style="font-size:11px;letter-spacing:0.14em;color:#8A8A8A;margin:0;">PRESENT → FOREGROUND</div></div></div><div style="flex:1;display:flex;flex-direction:row;gap:12px;min-height:0;"><div style="flex:1.35;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v102ImgTall" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#232323;aspect-ratio:4/4.4;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0;"><div style="flex:1.15;display:flex;min-height:0;min-width:0;"><div class="sv-media" data-sb-media data-slot="v102ImgTop" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#262626;aspect-ratio:16/8.5;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;flex-direction:row;gap:12px;min-height:0;"><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v102ImgBl" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#202020;aspect-ratio:1/1;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v102ImgBr" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#242424;aspect-ratio:1/1;box-sizing:border-box;"></div></div></div></div></div></div></section>`
  }
];
