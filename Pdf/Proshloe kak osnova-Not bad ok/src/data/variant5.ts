import type { TemplateItem } from "./types";

export const variant5: TemplateItem[] = [
  {
    tpl: "variant5TitleOnly",
    family: "projectCover",
    group: "Обложка проекта",
    label: "Вариант 5 — Типографическая обложка",
    code: "V5-01",
    icon: "Т",
    kind: "static",
    single: false,
    desc: "Вариант 5, страница 1: минимальная обложка без медиа — только масштаб, интервалы и свободное пространство.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#0A0A0A;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;padding:54px 60px 50px 60px;"><div data-sb-editable data-slot="v501Title" data-role="title" style="font-size:100px;line-height:0.92;letter-spacing:-0.03em;font-weight:700;color:#F5F5F2;margin:0;">ПРОШЛОЕ<br>КАК ОСНОВА</div><div data-sb-editable data-slot="v501Question" data-role="subtitle" style="font-size:22px;line-height:1.45;color:#BDBDBD;margin:0;max-width:640px;">А может ли авторитет прошлого работать на современность?</div></div></section>`
  },
  {
    tpl: "variant5TextImages",
    family: "projectContent",
    group: "Контент проекта",
    label: "Вариант 5 — Текст и четыре кадра",
    code: "V5-02",
    icon: "◪",
    kind: "static",
    single: false,
    desc: "Вариант 5, страница 2: единая editorial-композиция — весь пятифразный блок и четыре крупных кадра.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#F5F4F0;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:row;box-sizing:border-box;"><div style="width:36%;padding:30px 26px 28px 36px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;border-right:1px solid #E3DED4;"><div style="display:flex;flex-direction:column;gap:10px;"><div data-sb-editable data-slot="v502P1" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">Мы помещаем современный объект перед визуальным наследием прошлого.</div><div data-sb-editable data-slot="v502P2" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">То, что обладает культурным авторитетом, становится фоном.</div><div data-sb-editable data-slot="v502P3" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">А современный объект — продолжением этой линии.</div><div data-sb-editable data-slot="v502P4" data-role="body" style="font-size:16px;line-height:1.35;color:#111111;margin:0;">Прошлое передаёт ему свой авторитет.</div><div data-sb-editable data-slot="v502P5" data-role="statement" style="font-size:20px;line-height:1.3;font-weight:700;color:#111111;margin:4px 0 0 0;padding-top:12px;border-top:1px solid #D8D3C8;">Современность получает акцент.</div></div></div><div style="width:64%;padding:28px 32px 28px 28px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;"><div style="flex:1;display:flex;flex-direction:row;gap:12px;min-height:0;"><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v502Img1" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D8D3C8;aspect-ratio:4/3.4;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v502Img2" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#CFC9BD;aspect-ratio:4/3.4;box-sizing:border-box;"></div></div></div><div style="flex:1;display:flex;flex-direction:row;gap:12px;min-height:0;"><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v502Img3" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D2CCC0;aspect-ratio:4/3.4;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v502Img4" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D9D4C7;aspect-ratio:4/3.4;box-sizing:border-box;"></div></div></div></div></div></section>`
  },
  {
    tpl: "variant5FinalImage",
    family: "gallery",
    group: "Галерея проекта",
    label: "Вариант 5 — Финальный кадр",
    code: "V5-03",
    icon: "◉",
    kind: "static",
    single: false,
    desc: "Вариант 5, страница 3: один доминирующий почти полноэкранный кадр — финальный образ всей концепции.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#0A0A0A;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:column;box-sizing:border-box;"><div style="flex:1;display:flex;padding:16px 16px 0px 16px;box-sizing:border-box;min-height:0;"><div class="sv-media" data-sb-media data-slot="v503Final" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#1E1E1E;aspect-ratio:16/9;box-sizing:border-box;"></div></div><div style="height:44px;display:flex;align-items:center;padding:0 22px;box-sizing:border-box;"><div data-sb-editable data-slot="v503Caption" data-role="label" style="font-size:11px;letter-spacing:0.18em;color:#BDBDBD;margin:0;">VISUAL SYNTHESIS</div></div></div></section>`
  }
];
