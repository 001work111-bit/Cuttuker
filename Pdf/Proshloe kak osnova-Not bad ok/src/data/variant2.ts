import type { TemplateItem } from "./types";

export const variant2: TemplateItem[] = [
  {
    tpl: "variant2Cover",
    family: "projectCover",
    group: "Обложка проекта",
    label: "Вариант 2 — Вопрос и заголовок",
    code: "V2-01",
    icon: "◈",
    kind: "static",
    single: false,
    desc: "Вариант 2, страница 1: чистая обложка — доминирующий кадр, заголовок первым, вопрос вторым.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#F5F5F2;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:column;box-sizing:border-box;"><div style="height:60%;width:100%;display:flex;box-sizing:border-box;"><div class="sv-media" data-sb-media data-slot="v201Hero" data-kind="image" style="flex:1;width:100%;height:100%;background-color:#D8D3C8;aspect-ratio:16/7;box-sizing:border-box;"></div></div><div style="height:40%;padding:24px 48px 26px 48px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div data-sb-editable data-slot="v201Title" data-role="title" style="font-size:60px;line-height:1;letter-spacing:-0.02em;font-weight:700;color:#111111;margin:0 0 10px 0;">ПРОШЛОЕ КАК ОСНОВА</div><div data-sb-editable data-slot="v201Question" data-role="subtitle" style="font-size:20px;line-height:1.4;color:#666666;margin:0;">А может ли авторитет прошлого работать на современность?</div></div></div></section>`
  },
  {
    tpl: "variant2Principle",
    family: "statement",
    group: "Секции",
    label: "Вариант 2 — Принцип",
    code: "V2-02",
    icon: "≡",
    kind: "static",
    single: false,
    desc: "Вариант 2, страница 2: редакционный манифест принципа — крупный тезис и поясняющий блок без изображений.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#F5F5F5;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;padding:48px 64px;"><div data-sb-editable data-slot="v202Thesis" data-role="statement" style="font-size:48px;line-height:1.08;letter-spacing:-0.015em;font-weight:700;color:#111111;margin:0;max-width:980px;">Мы помещаем современный объект перед визуальным наследием прошлого.</div><div style="height:1px;background-color:#D9D9D9;margin:28px 0;"></div><div style="display:flex;flex-direction:row;gap:48px;"><div style="flex:1;display:flex;flex-direction:column;gap:14px;"><div data-sb-editable data-slot="v202P2" data-role="body" style="font-size:20px;line-height:1.4;color:#333333;margin:0;">То, что обладает культурным авторитетом, становится фоном.</div><div data-sb-editable data-slot="v202P3" data-role="body" style="font-size:20px;line-height:1.4;color:#333333;margin:0;">А современный объект — продолжением этой линии.</div></div><div style="flex:1;display:flex;flex-direction:column;gap:14px;"><div data-sb-editable data-slot="v202P4" data-role="body" style="font-size:20px;line-height:1.4;color:#333333;margin:0;">Прошлое передаёт ему свой авторитет.</div><div data-sb-editable data-slot="v202P5" data-role="statement" style="font-size:24px;line-height:1.3;font-weight:700;color:#111111;margin:0;">Современность получает акцент.</div></div></div><div data-sb-editable data-slot="v202Meta" data-role="smallMeta" style="font-size:11px;letter-spacing:0.12em;color:#999999;margin:30px 0 0 0;">Creative Direction / Art Direction / Motion Collage</div></div></section>`
  },
  {
    tpl: "variant2VisualProof",
    family: "gallery",
    group: "Галерея проекта",
    label: "Вариант 2 — Визуальное доказательство",
    code: "V2-03",
    icon: "▦",
    kind: "static",
    single: false,
    desc: "Вариант 2, страница 3: спокойная симметричная сетка 2 × 2 — самостоятельное визуальное доказательство идеи.",
    styleSystem: "default",
    html: `<section class="sv-section" style="aspect-ratio:16/9;width:100%;overflow:hidden;display:flex;background-color:#F2F0EB;box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"><div class="sv-inner" style="width:100%;height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding:30px 36px 22px 36px;"><div style="flex:1;display:flex;flex-direction:column;gap:16px;min-height:0;margin:0 0 14px 0;"><div style="flex:1;display:flex;flex-direction:row;gap:16px;min-height:0;"><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v203Img1" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D8D3C8;aspect-ratio:16/9;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v203Img2" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#CFC9BD;aspect-ratio:16/9;box-sizing:border-box;"></div></div></div><div style="flex:1;display:flex;flex-direction:row;gap:16px;min-height:0;"><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v203Img3" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D2CCC0;aspect-ratio:16/9;box-sizing:border-box;"></div></div><div style="flex:1;display:flex;min-width:0;min-height:0;"><div class="sv-media" data-sb-media data-slot="v203Img4" data-kind="image" style="flex:1;width:100%;min-height:0;background-color:#D9D4C7;aspect-ratio:16/9;box-sizing:border-box;"></div></div></div></div><div style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;"><div data-sb-editable data-slot="v203CapPast" data-role="label" style="font-size:11px;letter-spacing:0.14em;color:#666666;margin:0;">PAST → AUTHORITY</div><div data-sb-editable data-slot="v203CapMain" data-role="label" style="font-size:11px;letter-spacing:0.18em;color:#111111;margin:0;">VISUAL SYNTHESIS</div><div data-sb-editable data-slot="v203CapPresent" data-role="label" style="font-size:11px;letter-spacing:0.14em;color:#666666;margin:0;">PRESENT → FOREGROUND</div></div></div></section>`
  }
];
