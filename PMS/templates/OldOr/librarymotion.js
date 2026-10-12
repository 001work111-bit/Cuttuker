/* ============================================================
   library.js — Motion Studio library
   Сгенерировано Sandbox.
   Шаблонов: 44
   ============================================================ */
(function(){
  const STYLE_SYSTEMS={
  "2": {
    "name": "ШОурил_2",
    "color": "#3a6bff"
  },
  "default": {
    "name": "Базовый",
    "color": "#8b93a1"
  },
  "style-1785151687752": {
    "name": "Красный",
    "color": "#ff5b6a"
  },
  "style-1785151699871": {
    "name": "Синий",
    "color": "#5b8cff"
  },
  "style-1785151711431": {
    "name": "Карточки",
    "color": "#808080"
  },
  "cinema": {
    "name": "Cinema",
    "color": "#3ecf8e"
  },
  "grok": {
    "name": "Прогон Grok-Карточки",
    "color": "#3ac6e0"
  },
  "style-1785678612540": {
    "name": "Стало и Было",
    "color": "#e03a9a"
  },
  "style-1788865914117": {
    "name": "Шоурил",
    "color": "#8ee03a"
  },
  "converted": {
    "name": "Converted",
    "color": "#e0b23a"
  }
};
  const LIBRARY=[

  {
    tpl:"statementManifest",
    family:"statement",
    group:"Секции",
    label:"Крупный statement-манифест",
    code:"ST-01",
    icon:"≡",
    kind:"static",
    
    desc:"Один крупный абзац с левой выключкой — перечисление направлений через запятую как манифест. Типографика на грани кропа, swiss editorial.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"statementOverline","role":"overline"},{"type":"text","slot":"statementBody","role":"statement"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"statementOverline","role":"overline"},{"type":"text","slot":"statementBody","role":"statement"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9; width:100%; overflow:hidden; display:flex; background:#0e0e0e;\"><div class=\"sv-inner\" style=\"flex:1; display:flex; flex-direction:column; justify-content:center; padding:clamp(2rem,6vw,5rem); height:100%; box-sizing:border-box;\"><span data-sb-editable=\"\" data-slot=\"statementOverline\" data-role=\"overline\" style=\"font-size:clamp(0.6rem,1vw,0.8rem); letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:clamp(1rem,2.5vw,2rem);\">Practice</span><p data-sb-editable=\"\" data-slot=\"statementBody\" data-role=\"statement\" style=\"font-size:clamp(1.4rem,3.6vw,3.4rem); font-weight:500; letter-spacing:-0.035em; line-height:1.15; color:#f2f2f2; margin:0; max-width:92%;\">Fashion, editorial, lookbook, campaign, key visual, personal, for studios, e-commerce, still life, motion, backstage, casting, set design, beauty, portrait, object, archive, research, type, atmosphere</p></div></section>"
  },

  {
    tpl:"showreelDirectionsList_2",
    family:"statement",
    group:"Секции",
    label:"Крупный перечень направлений через запятую",
    code:"ST-01",
    icon:"▤",
    kind:"static",
    
    desc:"Кадр 16:9 с крупным абзацем по центру, левая выключка. Перечисление ~20 направлений через запятую. Воздух, швейцарская типографика.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"directionsList","role":"statement"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"directionsList","role":"statement"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#e8e8e4; padding:0; aspect-ratio:16/9; overflow:hidden;\"><div class=\"sv-inner\" style=\"display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; width:100%; padding:clamp(40px,6vw,96px); box-sizing:border-box;\"><span data-sb-editable=\"\" data-slot=\"overline\" data-role=\"overline\" style=\"font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,13px); letter-spacing:0.26em; text-transform:uppercase; color:rgba(0,0,0,0.3); margin-bottom:clamp(20px,3vw,40px); font-weight:600;\">All directions</span><p data-sb-editable=\"\" data-slot=\"directionsList\" data-role=\"statement\" style=\"font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(18px,2.4vw,36px); line-height:1.28; font-weight:600; letter-spacing:-0.025em; color:#0a0a0a; margin:0; max-width:22em; text-align:left; align-self:center;\">Fashion, Editorial, Key Visual, For Studios, Personal, Beauty, Lookbook, Campaign, Still Life, Portrait, Motion, Backstage, Runway, Product, Lifestyle, Casting, Moodboard, Art Direction, Set Design, Print</p></div></section>"
  },

  {
    tpl:"microFramesGrid",
    family:"gallery",
    group:"Секции",
    label:"Сетка микро-кадров с текстом",
    code:"G-01",
    icon:"☷",
    kind:"auto",
    
    desc:"Сетка 16:9 из шести микро-кадров: компактные изображения и короткие абзацы для быстрого считывания",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"title","role":"title"},{"type":"text","slot":"meta","role":"smallMeta"},{"type":"text","slot":"caption1","role":"body"},{"type":"text","slot":"caption2","role":"body"},{"type":"text","slot":"caption3","role":"body"},{"type":"text","slot":"caption4","role":"body"},{"type":"text","slot":"caption5","role":"body"},{"type":"text","slot":"caption6","role":"body"},{"type":"image","slot":"shot1","role":"image"},{"type":"image","slot":"shot2","role":"image"},{"type":"image","slot":"shot3","role":"image"},{"type":"image","slot":"shot4","role":"image"},{"type":"image","slot":"shot5","role":"image"},{"type":"image","slot":"shot6","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"title","role":"title"},{"type":"text","slot":"meta","role":"smallMeta"},{"type":"text","slot":"caption1","role":"body"},{"type":"text","slot":"caption2","role":"body"},{"type":"text","slot":"caption3","role":"body"},{"type":"text","slot":"caption4","role":"body"},{"type":"text","slot":"caption5","role":"body"},{"type":"text","slot":"caption6","role":"body"},{"type":"image","slot":"shot1","role":"image"},{"type":"image","slot":"shot2","role":"image"},{"type":"image","slot":"shot3","role":"image"},{"type":"image","slot":"shot4","role":"image"},{"type":"image","slot":"shot5","role":"image"},{"type":"image","slot":"shot6","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9;width:100%;height:auto;box-sizing:border-box;overflow:hidden;background:#f3f1ee;color:#111;font-family:Inter,Helvetica,Arial,sans-serif;\"><div class=\"sv-inner\" style=\"display:grid;grid-template-rows:auto 1fr;width:100%;height:100%;padding:clamp(20px,3vw,48px);gap:clamp(12px,1.8vw,28px);box-sizing:border-box;\"><div style=\"display:flex;justify-content:space-between;align-items:baseline;\"><h2 data-sb-editable=\"\" data-slot=\"title\" data-role=\"title\" style=\"margin:0;font-size:clamp(18px,2vw,32px);font-weight:500;letter-spacing:-0.02em;\">Micro Frames</h2><span data-sb-editable=\"\" data-slot=\"meta\" data-role=\"smallMeta\" style=\"font-size:clamp(10px,0.85vw,13px);letter-spacing:0.12em;text-transform:uppercase;opacity:0.45;\">06 Shots</span></div><div style=\"display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:clamp(10px,1.4vw,22px);min-height:0;\" data-sb-repeat=\"microItems\"><div style=\"display:grid;grid-template-rows:1fr auto;gap:clamp(6px,0.8vw,12px);min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"shot1\" data-kind=\"image\" style=\"aspect-ratio:16/10;width:100%;height:100%;background:#c8c4be;background-size:cover;background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"caption1\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1vw,15px);line-height:1.35;opacity:0.7;\">Lookbook sequence — soft light, quiet gesture.</p></div><div style=\"display:grid;grid-template-rows:1fr auto;gap:clamp(6px,0.8vw,12px);min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"shot2\" data-kind=\"image\" style=\"aspect-ratio:16/10;width:100%;height:100%;background:#b4b0aa;background-size:cover;background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"caption2\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1vw,15px);line-height:1.35;opacity:0.7;\">Studio still — product as object, no noise.</p></div><div style=\"display:grid;grid-template-rows:1fr auto;gap:clamp(6px,0.8vw,12px);min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"shot3\" data-kind=\"image\" style=\"aspect-ratio:16/10;width:100%;height:100%;background:#9e9a94;background-size:cover;background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"caption3\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1vw,15px);line-height:1.35;opacity:0.7;\">Editorial crop — face, fabric, edge.</p></div><div style=\"display:grid;grid-template-rows:1fr auto;gap:clamp(6px,0.8vw,12px);min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"shot4\" data-kind=\"image\" style=\"aspect-ratio:16/10;width:100%;height:100%;background:#d2cec8;background-size:cover;background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"caption4\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1vw,15px);line-height:1.35;opacity:0.7;\">Key visual draft — color block and silhouette.</p></div><div style=\"display:grid;grid-template-rows:1fr auto;gap:clamp(6px,0.8vw,12px);min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"shot5\" data-kind=\"image\" style=\"aspect-ratio:16/10;width:100%;height:100%;background:#8a8680;background-size:cover;background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"caption5\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1vw,15px);line-height:1.35;opacity:0.7;\">Casting polaroid — honest, immediate.</p></div><div style=\"display:grid;grid-template-rows:1fr auto;gap:clamp(6px,0.8vw,12px);min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"shot6\" data-kind=\"image\" style=\"aspect-ratio:16/10;width:100%;height:100%;background:#aeaaa4;background-size:cover;background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"caption6\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1vw,15px);line-height:1.35;opacity:0.7;\">Backstage frame — movement before the cut.</p></div></div></div></section>"
  },

  {
    tpl:"showreelGridQuickRead",
    family:"about",
    group:"Секции",
    label:"Шоурил: Сетка кадров и быстрых абзацев",
    code:"SR-02",
    icon:"☷",
    kind:"static",
    
    desc:"Сетка из трех кадров с описаниями под быструю считываемость.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"sr2_hdr","role":"overline"},{"type":"text","slot":"sr2_code","role":"smallMeta"},{"type":"text","slot":"sr2_txt1","role":"body"},{"type":"text","slot":"sr2_txt2","role":"body"},{"type":"text","slot":"sr2_txt3","role":"body"},{"type":"text","slot":"sr2_ftr","role":"smallMeta"},{"type":"image","slot":"sr2_img1","role":"image"},{"type":"image","slot":"sr2_img2","role":"image"},{"type":"image","slot":"sr2_img3","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"sr2_hdr","role":"overline"},{"type":"text","slot":"sr2_code","role":"smallMeta"},{"type":"text","slot":"sr2_txt1","role":"body"},{"type":"text","slot":"sr2_txt2","role":"body"},{"type":"text","slot":"sr2_txt3","role":"body"},{"type":"text","slot":"sr2_ftr","role":"smallMeta"},{"type":"image","slot":"sr2_img1","role":"image"},{"type":"image","slot":"sr2_img2","role":"image"},{"type":"image","slot":"sr2_img3","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9; width:100%; background:#0a0a0a; color:#ffffff; padding:clamp(24px, 4vw, 48px); display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;\"><div style=\"display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; padding-bottom:12px;\"><span style=\"font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#777;\" data-sb-editable=\"\" data-slot=\"sr2_hdr\" data-role=\"overline\">(SHOWREEL BREAKDOWN)</span><span style=\"font-size:11px; font-family:monospace; color:#555;\" data-sb-editable=\"\" data-slot=\"sr2_code\" data-role=\"smallMeta\">FRAMES 01-03</span></div><div style=\"display:grid; grid-template-columns:repeat(3, 1fr); gap:24px; align-items:start;\"><div style=\"display:flex; flex-direction:column; gap:16px;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"sr2_img1\" data-kind=\"image\" style=\"aspect-ratio:16/10; width:100%; background:#1a1a1a; border-radius:6px;\"></div><p style=\"font-size:13px; line-height:1.45; color:#ccc; margin:0;\" data-sb-editable=\"\" data-slot=\"sr2_txt1\" data-role=\"body\">Лаконичная швейцарская сетка и жесткая иерархия шрифтовых пар.</p></div><div style=\"display:flex; flex-direction:column; gap:16px;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"sr2_img2\" data-kind=\"image\" style=\"aspect-ratio:16/10; width:100%; background:#1a1a1a; border-radius:6px;\"></div><p style=\"font-size:13px; line-height:1.45; color:#ccc; margin:0;\" data-sb-editable=\"\" data-slot=\"sr2_txt2\" data-role=\"body\">Высококонтрастные визуальные акценты для мгновенного считывания сути.</p></div><div style=\"display:flex; flex-direction:column; gap:16px;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"sr2_img3\" data-kind=\"image\" style=\"aspect-ratio:16/10; width:100%; background:#1a1a1a; border-radius:6px;\"></div><p style=\"font-size:13px; line-height:1.45; color:#ccc; margin:0;\" data-sb-editable=\"\" data-slot=\"sr2_txt3\" data-role=\"body\">Интерактивная адаптация под моушн-кадры и форматы современных брендов.</p></div></div><div style=\"font-size:11px; color:#444; font-family:monospace; text-transform:uppercase;\" data-sb-editable=\"\" data-slot=\"sr2_ftr\" data-role=\"smallMeta\">INDEX / GRID SYSTEM V1</div></section>"
  },

  {
    tpl:"showreelQuoteFrame",
    family:"statement",
    group:"Секции",
    label:"Шоурил 16:9 — цитата / манифест по центру",
    code:"SH-20",
    icon:"≡",
    kind:"static",
    
    desc:"Кадр-пауза: короткая цитата или манифест. Разделяет блоки направлений в шоуриле.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"quoteOver","role":"overline"},{"type":"text","slot":"quoteBody","role":"statement"},{"type":"text","slot":"quoteMeta","role":"smallMeta"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"quoteOver","role":"overline"},{"type":"text","slot":"quoteBody","role":"statement"},{"type":"text","slot":"quoteMeta","role":"smallMeta"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:flex-start; padding:clamp(40px,7vw,120px); box-sizing:border-box; gap:clamp(24px,3vw,40px);\"><div data-sb-editable=\"\" data-slot=\"quoteOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.3em; text-transform:uppercase; color:#555;\">Note</div><p data-sb-editable=\"\" data-slot=\"quoteBody\" data-role=\"statement\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(26px,3.8vw,56px); line-height:1.18; letter-spacing:-0.035em; color:#f2f2f2; margin:0; font-weight:600; max-width:16em;\">Light first. Then form. Then the story that holds them together.</p><div data-sb-editable=\"\" data-slot=\"quoteMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.2em; text-transform:uppercase; color:#666;\">— Atelier notes</div></div></section>"
  },

  {
    tpl:"fashionStatementDirections",
    family:"statement",
    group:"Секции",
    label:"Large statement + направления",
    code:"ST-01",
    icon:"≡",
    kind:"static",
    
    desc:"Кадр 16:9. Крупный statement по центру/низу и строка направлений через запятую. Максимум воздуха, modern editorial type, fast read.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"text","slot":"statement","role":"statement"},{"type":"text","slot":"directions","role":"body"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"text","slot":"statement","role":"statement"},{"type":"text","slot":"directions","role":"body"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9;width:100%;height:auto;box-sizing:border-box;overflow:hidden;background:#eae8e3;color:#111;\"><div class=\"sv-inner\" style=\"display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:clamp(20px,3.5vw,56px) clamp(22px,4vw,64px);box-sizing:border-box;\"><div style=\"display:flex;justify-content:space-between;align-items:flex-start;\"><p data-sb-editable=\"\" data-slot=\"overline\" data-role=\"overline\" style=\"margin:0;font-size:clamp(9px,0.7vw,12px);letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;\">Fashion / Editorial</p><p data-sb-editable=\"\" data-slot=\"smallMeta\" data-role=\"smallMeta\" style=\"margin:0;font-size:clamp(9px,0.7vw,12px);letter-spacing:0.12em;opacity:0.35;\">SS — Reel</p></div><div style=\"flex:1;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;max-width:92%;\"><h2 data-sb-editable=\"\" data-slot=\"statement\" data-role=\"statement\" style=\"margin:0;font-size:clamp(28px,5.2vw,88px);font-weight:500;letter-spacing:-0.045em;line-height:1.02;\">Silence is the new loud.</h2></div><p data-sb-editable=\"\" data-slot=\"directions\" data-role=\"body\" style=\"margin:0;font-size:clamp(11px,1.05vw,17px);letter-spacing:0.01em;line-height:1.4;opacity:0.5;max-width:90%;\">Editorial, Runway, Campaign, Lookbook, Backstage, Beauty, Still life, Motion</p></div></section>"
  },

  {
    tpl:"fashionSplitDirections",
    family:"services",
    group:"Секции",
    label:"Split: направления + media",
    code:"S-01",
    icon:"◧",
    kind:"auto",
    
    desc:"Фиксированный кадр 16:9. Слева вертикальный список fashion-направлений с overline и мета-индексом, справа полноростовое media. Швейцарская сетка 50/50, много воздуха.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"dirItem","role":"label"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"image","slot":"mainImage","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"dirItem","role":"label"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"image","slot":"mainImage","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9;width:100%;height:auto;box-sizing:border-box;overflow:hidden;background:#f2f1ee;color:#111;\"><div class=\"sv-inner\" style=\"display:grid;grid-template-columns:1fr 1fr;width:100%;height:100%;\"><div style=\"display:flex;flex-direction:column;justify-content:space-between;padding:clamp(20px,3.6vw,56px) clamp(18px,3vw,48px);min-height:0;\"><p data-sb-editable=\"\" data-slot=\"overline\" data-role=\"overline\" style=\"margin:0;font-size:clamp(9px,0.75vw,12px);letter-spacing:0.18em;text-transform:uppercase;opacity:0.45;font-weight:500;\">Directions</p><div data-sb-repeat=\"directions\" style=\"display:flex;flex-direction:column;gap:clamp(6px,0.9vw,14px);\"><p data-sb-editable=\"\" data-slot=\"dirItem\" data-role=\"label\" style=\"margin:0;font-size:clamp(16px,2vw,34px);font-weight:500;letter-spacing:-0.03em;line-height:1.15;\">Editorial</p></div><p data-sb-editable=\"\" data-slot=\"smallMeta\" data-role=\"smallMeta\" style=\"margin:0;font-size:clamp(9px,0.7vw,12px);letter-spacing:0.12em;opacity:0.4;\">01 — 06</p></div><div style=\"position:relative;height:100%;overflow:hidden;min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"mainImage\" data-kind=\"image\" style=\"aspect-ratio:8/9;background:#c4bfb6;width:100%;height:100%;object-fit:cover;\"></div></div></div></section>"
  },

  {
    tpl:"fashionTwoWordHero",
    family:"hero",
    group:"Секции",
    label:"Two-word hero + image",
    code:"H-01",
    icon:"◧",
    kind:"static",
    
    desc:"Кадр 16:9. Два крупных слова поверх full-bleed media. Минимальный chrome: overline сверху, meta снизу. Swiss editorial hero для showreel.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"wordOne","role":"title"},{"type":"text","slot":"wordTwo","role":"title"},{"type":"text","slot":"subtitle","role":"subtitle"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"image","slot":"bgImage","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"wordOne","role":"title"},{"type":"text","slot":"wordTwo","role":"title"},{"type":"text","slot":"subtitle","role":"subtitle"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"image","slot":"bgImage","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9;width:100%;height:auto;box-sizing:border-box;overflow:hidden;background:#1a1917;color:#f5f4f0;position:relative;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"bgImage\" data-kind=\"image\" style=\"aspect-ratio:16/9;background:#2c2a27;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.55;\"></div><div class=\"sv-inner\" style=\"position:relative;z-index:1;display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:clamp(18px,3vw,48px) clamp(20px,3.5vw,56px);box-sizing:border-box;\"><p data-sb-editable=\"\" data-slot=\"overline\" data-role=\"overline\" style=\"margin:0;font-size:clamp(9px,0.7vw,12px);letter-spacing:0.22em;text-transform:uppercase;opacity:0.55;\">Showreel 2025</p><div style=\"display:flex;flex-direction:column;align-items:flex-start;gap:0;\"><h1 data-sb-editable=\"\" data-slot=\"wordOne\" data-role=\"title\" style=\"margin:0;font-size:clamp(40px,8.5vw,140px);font-weight:500;letter-spacing:-0.05em;line-height:0.92;\">RAW</h1><h1 data-sb-editable=\"\" data-slot=\"wordTwo\" data-role=\"title\" style=\"margin:0;font-size:clamp(40px,8.5vw,140px);font-weight:500;letter-spacing:-0.05em;line-height:0.92;\">FORM</h1></div><div style=\"display:flex;justify-content:space-between;align-items:flex-end;gap:16px;\"><p data-sb-editable=\"\" data-slot=\"subtitle\" data-role=\"subtitle\" style=\"margin:0;font-size:clamp(11px,0.95vw,15px);opacity:0.5;letter-spacing:0.04em;max-width:36ch;\">Fashion / Editorial motion</p><p data-sb-editable=\"\" data-slot=\"smallMeta\" data-role=\"smallMeta\" style=\"margin:0;font-size:clamp(9px,0.7vw,12px);letter-spacing:0.14em;opacity:0.4;\">02:40</p></div></div></section>"
  },

  {
    tpl:"showreelAirTypographyHero_2",
    family:"hero",
    group:"Обложка проекта",
    label:"Центральный типографический кадр с воздухом",
    code:"SR-06",
    icon:"☰",
    kind:"static",
    
    desc:"Монументальный заголовок из двух слов по центру, кадр 16:9 по середине и много свободного пространства",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"sr6_word1","role":"title"},{"type":"text","slot":"sr6_word2","role":"title"},{"type":"image","slot":"sr6_media","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"sr6_word1","role":"title"},{"type":"text","slot":"sr6_word2","role":"title"},{"type":"image","slot":"sr6_media","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#f4f4f0; color:#000000; padding: clamp(40px, 6.5vh, 72px) var(--pad, 4vw); aspect-ratio: 16 / 9; width: 100%; height: auto; box-sizing: border-box; overflow: hidden; display:flex; align-items:center; justify-content:center;\"><div class=\"sv-inner\" style=\"max-width:1400px; width:100%; margin:0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap: clamp(20px, 3.5vh, 40px); height:100%; box-sizing:border-box;\"><h1 data-sb-editable=\"\" data-slot=\"sr6_word1\" data-role=\"title\" style=\"font-size: clamp(40px, 8.5vw, 120px); font-weight:900; text-transform:uppercase; letter-spacing:-0.04em; margin:0; line-height:0.9;\">PURE REEL</h1><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"sr6_media\" data-kind=\"image\" style=\"aspect-ratio: 16/9; width: min(100%, 640px); background: #000000; flex-shrink:0;\"></div><h1 data-sb-editable=\"\" data-slot=\"sr6_word2\" data-role=\"title\" style=\"font-size: clamp(40px, 8.5vw, 120px); font-weight:900; text-transform:uppercase; letter-spacing:-0.04em; margin:0; line-height:0.9;\">VISION '25</h1></div></section>"
  },

  {
    tpl:"projectCoverSplit",
    family:"projectCover",
    group:"Обложка проекта",
    label:"Обложка проекта: номер и кадр",
    code:"PCV-01",
    icon:"▤",
    kind:"static",
    
    desc:"Обложка 16:9 — крупный индекс проекта, название и meta слева, вертикальное медиа справа. Чистая иерархия showreel-обложки.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"coverIndex","role":"overline"},{"type":"text","slot":"coverTitle","role":"title"},{"type":"text","slot":"coverClient","role":"smallMeta"},{"type":"text","slot":"coverYear","role":"smallMeta"},{"type":"image","slot":"coverVisual","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"coverIndex","role":"overline"},{"type":"text","slot":"coverTitle","role":"title"},{"type":"text","slot":"coverClient","role":"smallMeta"},{"type":"text","slot":"coverYear","role":"smallMeta"},{"type":"image","slot":"coverVisual","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9; width:100%; overflow:hidden; display:flex; background:#141414;\"><div class=\"sv-inner\" style=\"flex:1; display:grid; grid-template-columns:1fr 1.1fr; height:100%;\"><div style=\"display:flex; flex-direction:column; justify-content:space-between; padding:clamp(1.5rem,4vw,3.5rem);\"><div><span data-sb-editable=\"\" data-slot=\"coverIndex\" data-role=\"overline\" style=\"font-size:clamp(0.65rem,1.1vw,0.9rem); letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.4); display:block; margin-bottom:clamp(0.8rem,2vw,1.5rem);\">Project 03</span><h2 data-sb-editable=\"\" data-slot=\"coverTitle\" data-role=\"title\" style=\"font-size:clamp(2.2rem,5.5vw,5rem); font-weight:600; letter-spacing:-0.04em; line-height:1.02; color:#f5f5f5; margin:0;\">Silent Fabric</h2></div><div style=\"display:flex; flex-direction:column; gap:0.35rem;\"><span data-sb-editable=\"\" data-slot=\"coverClient\" data-role=\"smallMeta\" style=\"font-size:clamp(0.6rem,1vw,0.8rem); letter-spacing:0.08em; color:rgba(255,255,255,0.5);\">Client — Atelier Nord</span><span data-sb-editable=\"\" data-slot=\"coverYear\" data-role=\"smallMeta\" style=\"font-size:clamp(0.6rem,1vw,0.8rem); letter-spacing:0.08em; color:rgba(255,255,255,0.5);\">Year — 2024</span></div></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"coverVisual\" data-kind=\"image\" style=\"aspect-ratio:auto; background:#2c2c2c; width:100%; height:100%; background-size:cover; background-position:center;\"></div></div></section>"
  },

  {
    tpl:"asymmetricGalleryB",
    family:"projectContent",
    group:"Контент проекта",
    label:"Асимметричная сетка B",
    code:"PC-02",
    icon:"◨",
    kind:"static",
    
    desc:"Второй вариант асимметрии: узкая вертикальная полоса + широкий блок + нижняя лента. Намеренный кроп краёв, showreel-динамика.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"asymB1","role":"image"},{"type":"image","slot":"asymB2","role":"image"},{"type":"image","slot":"asymB3","role":"image"},{"type":"image","slot":"asymB4","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"asymB1","role":"image"},{"type":"image","slot":"asymB2","role":"image"},{"type":"image","slot":"asymB3","role":"image"},{"type":"image","slot":"asymB4","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9; width:100%; overflow:hidden; display:flex; background:#0c0c0c;\"><div class=\"sv-inner\" style=\"flex:1; display:grid; grid-template-columns:0.7fr 1.3fr 1fr; grid-template-rows:1.2fr 0.8fr; gap:clamp(0.45rem,1.1vw,1rem); padding:clamp(1rem,2.8vw,2.2rem); height:100%; box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"asymB1\" data-kind=\"image\" style=\"aspect-ratio:auto; background:#2e2e2e; grid-row:1/3; width:100%; height:100%; background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"asymB2\" data-kind=\"image\" style=\"aspect-ratio:auto; background:#3d3d3d; width:100%; height:100%; background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"asymB3\" data-kind=\"image\" style=\"aspect-ratio:auto; background:#4c4c4c; width:100%; height:100%; background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"asymB4\" data-kind=\"image\" style=\"aspect-ratio:auto; background:#383838; grid-column:2/4; width:100%; height:100%; background-size:cover; background-position:center;\"></div></div></section>"
  },

  {
    tpl:"showreelThumbTextRow",
    family:"projectContent",
    group:"Контент проекта",
    label:"Ряд кадров + абзац слева",
    code:"PC-02",
    icon:"≡",
    kind:"auto",
    
    desc:"Горизонтальный ряд мелких кадров и компактный текст. Кадр шоурила 16:9 для быстрых врезок.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"blurb","role":"body"},{"type":"text","slot":"index","role":"smallMeta"},{"type":"image","slot":"stripImg","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"blurb","role":"body"},{"type":"text","slot":"index","role":"smallMeta"},{"type":"image","slot":"stripImg","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0c0c0c; padding:0; aspect-ratio:16/9; overflow:hidden;\"><div class=\"sv-inner\" style=\"display:flex; flex-direction:column; justify-content:center; height:100%; width:100%; padding:clamp(28px,4vw,56px); gap:clamp(20px,3vw,40px); box-sizing:border-box;\"><div style=\"display:grid; grid-template-columns:minmax(0,0.9fr) minmax(0,1.4fr); gap:clamp(20px,3vw,48px); align-items:end;\"><p data-sb-editable=\"\" data-slot=\"blurb\" data-role=\"body\" style=\"font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(14px,1.5vw,20px); line-height:1.4; font-weight:500; color:rgba(255,255,255,0.85); margin:0; letter-spacing:-0.01em;\">Still frames in sequence. Read fast, cut faster.</p><span data-sb-editable=\"\" data-slot=\"index\" data-role=\"smallMeta\" style=\"font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,12px); letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.3); text-align:right;\">Sequence</span></div><div data-sb-repeat=\"strip\" style=\"display:grid; grid-template-columns:repeat(5,1fr); gap:clamp(6px,0.9vw,14px);\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"stripImg\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#2a2a2a; background-size:cover; background-position:center; width:100%;\"></div></div></div></section>"
  },

  {
    tpl:"showreelSideCaptionTall",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — высокий кадр слева, текст справа",
    code:"SH-21",
    icon:"☰",
    kind:"static",
    
    desc:"Портретный media-блок в левой трети и набор типографики справа. Для Personal / Beauty.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"tallOver","role":"overline"},{"type":"text","slot":"tallTitle","role":"title"},{"type":"text","slot":"tallBody","role":"body"},{"type":"text","slot":"tallMeta","role":"smallMeta"},{"type":"image","slot":"tallImg","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"tallOver","role":"overline"},{"type":"text","slot":"tallTitle","role":"title"},{"type":"text","slot":"tallBody","role":"body"},{"type":"text","slot":"tallMeta","role":"smallMeta"},{"type":"image","slot":"tallImg","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#f2f0eb; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(12,1fr); gap:clamp(16px,2vw,32px); padding:clamp(32px,5vw,72px); box-sizing:border-box; align-items:center;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"tallImg\" data-kind=\"image\" style=\"grid-column:2 / 6; aspect-ratio:3/4; background:#c8c4bc; width:100%;\"></div><div style=\"grid-column:7 / 12; display:flex; flex-direction:column; gap:clamp(14px,2vw,28px);\"><div data-sb-editable=\"\" data-slot=\"tallOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.26em; text-transform:uppercase; color:#888;\">Personal</div><h2 data-sb-editable=\"\" data-slot=\"tallTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(32px,4.5vw,64px); line-height:0.95; letter-spacing:-0.035em; color:#111; font-weight:700; margin:0; text-transform:uppercase;\">Silent<br>Hour</h2><p data-sb-editable=\"\" data-slot=\"tallBody\" data-role=\"body\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(13px,1.2vw,18px); line-height:1.45; color:#444; margin:0; max-width:28ch;\">A short series on fabric, dust and late window light.</p><div data-sb-editable=\"\" data-slot=\"tallMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.16em; text-transform:uppercase; color:#999;\">Film · 2025</div></div></div></section>"
  },

  {
    tpl:"showreelCaptionFrame",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — кадр с миниатюрой и абзацем",
    code:"SH-03",
    icon:"☰",
    kind:"static",
    
    desc:"Быстрочитаемый кадр 16:9: мелкая картинка в сетке и короткий абзац. Швейцарская сетка, воздух, лаконичная типографика для шоурила.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"captionLabel","role":"label"},{"type":"text","slot":"captionBody","role":"body"},{"type":"image","slot":"captionImg","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"captionLabel","role":"label"},{"type":"text","slot":"captionBody","role":"body"},{"type":"image","slot":"captionImg","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0c0c0c; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(12,1fr); grid-template-rows:repeat(6,1fr); gap:clamp(12px,1.5vw,24px); padding:clamp(28px,4vw,56px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"captionImg\" data-kind=\"image\" style=\"grid-column:2 / 5; grid-row:2 / 5; aspect-ratio:4/5; background:#2a2a2a; width:100%; height:100%;\"></div><div style=\"grid-column:6 / 12; grid-row:3 / 5; display:flex; flex-direction:column; justify-content:center; gap:clamp(10px,1.5vw,20px);\"><div data-sb-editable=\"\" data-slot=\"captionLabel\" data-role=\"label\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.24em; text-transform:uppercase; color:#666;\">Personal</div><p data-sb-editable=\"\" data-slot=\"captionBody\" data-role=\"body\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(16px,1.8vw,28px); line-height:1.35; letter-spacing:-0.02em; color:#efefef; margin:0; font-weight:500; max-width:32ch;\">A quiet study of light, fabric and motion — shot in one afternoon.</p></div></div></section>"
  },

  {
    tpl:"showreelCornerMeta",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — медиа и мета по углам",
    code:"SH-27",
    icon:"◧",
    kind:"static",
    
    desc:"Медиа почти full-bleed, четыре мета-лейбла по углам как в Swiss editorial. Сухой портфолио-кадр.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"cTL","role":"label"},{"type":"text","slot":"cTR","role":"smallMeta"},{"type":"text","slot":"cBL","role":"label"},{"type":"text","slot":"cBR","role":"smallMeta"},{"type":"image","slot":"cornerMedia","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"cTL","role":"label"},{"type":"text","slot":"cTR","role":"smallMeta"},{"type":"text","slot":"cBL","role":"label"},{"type":"text","slot":"cBR","role":"smallMeta"},{"type":"image","slot":"cornerMedia","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; overflow:hidden; position:relative;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; position:relative; box-sizing:border-box; padding:clamp(16px,2.5vw,32px);\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cornerMedia\" data-kind=\"image\" style=\"position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:72%; height:78%; background:#1a1a1a;\"></div><div data-sb-editable=\"\" data-slot=\"cTL\" data-role=\"label\" style=\"position:absolute; top:clamp(18px,2.5vw,36px); left:clamp(18px,2.5vw,36px); font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; text-transform:uppercase; color:#888;\">Project</div><div data-sb-editable=\"\" data-slot=\"cTR\" data-role=\"smallMeta\" style=\"position:absolute; top:clamp(18px,2.5vw,36px); right:clamp(18px,2.5vw,36px); font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; text-transform:uppercase; color:#888;\">2025</div><div data-sb-editable=\"\" data-slot=\"cBL\" data-role=\"label\" style=\"position:absolute; bottom:clamp(18px,2.5vw,36px); left:clamp(18px,2.5vw,36px); font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; text-transform:uppercase; color:#888;\">Fashion</div><div data-sb-editable=\"\" data-slot=\"cBR\" data-role=\"smallMeta\" style=\"position:absolute; bottom:clamp(18px,2.5vw,36px); right:clamp(18px,2.5vw,36px); font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; text-transform:uppercase; color:#888;\">09 / 12</div></div></section>"
  },

  {
    tpl:"showreelSplitLeftMedia",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — сплит: видео слева, текст справа",
    code:"SH-17",
    icon:"◧",
    kind:"static",
    
    desc:"Зеркало SH-01: медиа слева, текстовый стек справа. Для смены направления внутри шоурила.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"splitLOver","role":"overline"},{"type":"text","slot":"splitLTitle","role":"title"},{"type":"text","slot":"splitLBody","role":"body"},{"type":"text","slot":"splitLMeta","role":"smallMeta"},{"type":"image","slot":"splitLMedia","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"splitLOver","role":"overline"},{"type":"text","slot":"splitLTitle","role":"title"},{"type":"text","slot":"splitLBody","role":"body"},{"type":"text","slot":"splitLMeta","role":"smallMeta"},{"type":"image","slot":"splitLMedia","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:stretch; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:1fr 1fr; gap:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"splitLMedia\" data-kind=\"image\" style=\"width:100%; height:100%; background:#1a1a1a; min-height:100%;\"></div><div style=\"display:flex; flex-direction:column; justify-content:center; padding:clamp(32px,5vw,72px); gap:clamp(16px,2.5vw,36px);\"><div data-sb-editable=\"\" data-slot=\"splitLOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,1vw,13px); letter-spacing:0.22em; text-transform:uppercase; color:#8a8a8a; font-weight:500;\">Chapter 02</div><h2 data-sb-editable=\"\" data-slot=\"splitLTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(40px,6.5vw,96px); line-height:0.92; letter-spacing:-0.03em; color:#f5f5f5; font-weight:700; margin:0; text-transform:uppercase;\">Studios</h2><p data-sb-editable=\"\" data-slot=\"splitLBody\" data-role=\"body\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(13px,1.15vw,17px); line-height:1.45; color:#b0b0b0; max-width:28ch; margin:0; font-weight:400;\">Campaign systems and production stills for creative teams.</p><div data-sb-editable=\"\" data-slot=\"splitLMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.18em; text-transform:uppercase; color:#666; margin-top:auto;\">02 / 04</div></div></div></section>"
  },

  {
    tpl:"showreelSplitThinRail",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — узкая текстовая рейка + медиа",
    code:"SH-29",
    icon:"◧",
    kind:"static",
    
    desc:"Узкая левая колонка ~28% с вертикальным стеком меток и wide-медиа справа. Для финальных project slides.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"railOver","role":"overline"},{"type":"text","slot":"railTitle","role":"title"},{"type":"text","slot":"railM1","role":"smallMeta"},{"type":"text","slot":"railM2","role":"smallMeta"},{"type":"text","slot":"railM3","role":"smallMeta"},{"type":"image","slot":"railMedia","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"railOver","role":"overline"},{"type":"text","slot":"railTitle","role":"title"},{"type":"text","slot":"railM1","role":"smallMeta"},{"type":"text","slot":"railM2","role":"smallMeta"},{"type":"text","slot":"railM3","role":"smallMeta"},{"type":"image","slot":"railMedia","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:28% 1fr;\"><div style=\"display:flex; flex-direction:column; justify-content:space-between; padding:clamp(24px,3.5vw,48px); border-right:1px solid #1e1e1e; box-sizing:border-box;\"><div style=\"display:flex; flex-direction:column; gap:clamp(10px,1.5vw,18px);\"><div data-sb-editable=\"\" data-slot=\"railOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.26em; text-transform:uppercase; color:#555;\">Case</div><h2 data-sb-editable=\"\" data-slot=\"railTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(22px,3vw,42px); line-height:1; letter-spacing:-0.03em; color:#f2f2f2; font-weight:700; margin:0; text-transform:uppercase;\">North<br>Studio</h2></div><div style=\"display:flex; flex-direction:column; gap:8px;\"><div data-sb-editable=\"\" data-slot=\"railM1\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.14em; text-transform:uppercase; color:#666;\">Art direction</div><div data-sb-editable=\"\" data-slot=\"railM2\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.14em; text-transform:uppercase; color:#666;\">Motion</div><div data-sb-editable=\"\" data-slot=\"railM3\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.14em; text-transform:uppercase; color:#666;\">Still</div></div></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"railMedia\" data-kind=\"image\" style=\"width:100%; height:100%; background:#1a1a1a;\"></div></div></section>"
  },

  {
    tpl:"showreelSplitDirection",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — сплит: текст слева, видео справа",
    code:"SH-01",
    icon:"◧",
    kind:"static",
    
    desc:"Кадр шоурила 16:9. Слева стек текстовых блоков (overline + крупное направление + мета), справа видео/медиа на всю высоту. Для смены лейблов Fashion, For studios, Personal, Key Visual.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"directionTitle","role":"title"},{"type":"text","slot":"directionBody","role":"body"},{"type":"text","slot":"directionMeta","role":"smallMeta"},{"type":"image","slot":"directionMedia","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"overline","role":"overline"},{"type":"text","slot":"directionTitle","role":"title"},{"type":"text","slot":"directionBody","role":"body"},{"type":"text","slot":"directionMeta","role":"smallMeta"},{"type":"image","slot":"directionMedia","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:stretch; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:1fr 1fr; gap:0;\"><div style=\"display:flex; flex-direction:column; justify-content:center; padding:clamp(32px,5vw,72px); gap:clamp(16px,2.5vw,36px);\"><div data-sb-editable=\"\" data-slot=\"overline\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,1vw,13px); letter-spacing:0.22em; text-transform:uppercase; color:#8a8a8a; font-weight:500;\">Showreel — 2025</div><h2 data-sb-editable=\"\" data-slot=\"directionTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(40px,6.5vw,96px); line-height:0.92; letter-spacing:-0.03em; color:#f5f5f5; font-weight:700; margin:0; text-transform:uppercase;\">Fashion</h2><p data-sb-editable=\"\" data-slot=\"directionBody\" data-role=\"body\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(13px,1.15vw,17px); line-height:1.45; color:#b0b0b0; max-width:28ch; margin:0; font-weight:400;\">Editorial campaigns, lookbooks and runway films for fashion houses.</p><div data-sb-editable=\"\" data-slot=\"directionMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.18em; text-transform:uppercase; color:#666; margin-top:auto;\">01 / 04</div></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"directionMedia\" data-kind=\"image\" style=\"aspect-ratio:auto; width:100%; height:100%; background:#1a1a1a; min-height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelFullBleedTopBar",
    family:"projectContent",
    group:"Контент проекта",
    label:"Шоурил 16:9 — full-bleed с верхней меткой",
    code:"SH-16",
    icon:"◧",
    kind:"static",
    
    desc:"Парный к SH-15: медиа на весь кадр, метка и клиент сверху. Ритм чередования подписей вверх/вниз.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"fbtLabel","role":"label"},{"type":"text","slot":"fbtClient","role":"smallMeta"},{"type":"image","slot":"fbtMedia","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"fbtLabel","role":"label"},{"type":"text","slot":"fbtClient","role":"smallMeta"},{"type":"image","slot":"fbtMedia","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#111; padding:0; aspect-ratio:16/9; display:flex; overflow:hidden; position:relative;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; position:relative;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"fbtMedia\" data-kind=\"image\" style=\"position:absolute; inset:0; width:100%; height:100%; background:#1c1c1c;\"></div><div style=\"position:absolute; left:0; right:0; top:0; display:flex; justify-content:space-between; align-items:flex-start; padding:clamp(20px,3vw,40px); gap:24px; background:linear-gradient(0deg,transparent 0%,rgba(0,0,0,0.5) 100%); box-sizing:border-box;\"><div data-sb-editable=\"\" data-slot=\"fbtLabel\" data-role=\"label\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.24em; text-transform:uppercase; color:#eee;\">For Studios</div><div data-sb-editable=\"\" data-slot=\"fbtClient\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.18em; text-transform:uppercase; color:#bbb;\">Client — Atlas</div></div></div></section>"
  },

  {
    tpl:"galleryConveyor_2",
    family:"gallery",
    group:"Галерея проекта",
    label:"Галерея-конвейер: три ленты",
    code:"G-02",
    icon:"☰",
    kind:"auto",
    
    desc:"Три горизонтальных ряда изображений со сдвигом; ленты намеренно уходят под обрез кадра — ощущение бесконечного потока showreel.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"c1","role":"image"},{"type":"image","slot":"c2","role":"image"},{"type":"image","slot":"c3","role":"image"},{"type":"image","slot":"c4","role":"image"},{"type":"image","slot":"c5","role":"image"},{"type":"image","slot":"c6","role":"image"},{"type":"image","slot":"c7","role":"image"},{"type":"image","slot":"c8","role":"image"},{"type":"image","slot":"c9","role":"image"},{"type":"image","slot":"c10","role":"image"},{"type":"image","slot":"c11","role":"image"},{"type":"image","slot":"c12","role":"image"},{"type":"image","slot":"c13","role":"image"},{"type":"image","slot":"c14","role":"image"},{"type":"image","slot":"c15","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"c1","role":"image"},{"type":"image","slot":"c2","role":"image"},{"type":"image","slot":"c3","role":"image"},{"type":"image","slot":"c4","role":"image"},{"type":"image","slot":"c5","role":"image"},{"type":"image","slot":"c6","role":"image"},{"type":"image","slot":"c7","role":"image"},{"type":"image","slot":"c8","role":"image"},{"type":"image","slot":"c9","role":"image"},{"type":"image","slot":"c10","role":"image"},{"type":"image","slot":"c11","role":"image"},{"type":"image","slot":"c12","role":"image"},{"type":"image","slot":"c13","role":"image"},{"type":"image","slot":"c14","role":"image"},{"type":"image","slot":"c15","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9; width:100%; overflow:hidden; display:flex; background:#111111;\"><div class=\"sv-inner\" style=\"flex:1; display:flex; flex-direction:column; justify-content:center; gap:clamp(0.5rem,1.2vw,1rem); padding:clamp(1rem,2.5vw,2rem) 0; height:100%; box-sizing:border-box;\" data-sb-repeat=\"conveyorRows\"><div style=\"display:flex; gap:clamp(0.5rem,1.2vw,1rem); transform:translateX(-8%); width:120%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c1\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#3a3a3a; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c2\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#4a4a4a; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c3\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#5a5a5a; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c4\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#6a6a6a; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c5\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#505050; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div></div><div style=\"display:flex; gap:clamp(0.5rem,1.2vw,1rem); transform:translateX(-18%); width:120%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c6\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#454545; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c7\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#555555; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c8\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#656565; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c9\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#3f3f3f; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c10\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#585858; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div></div><div style=\"display:flex; gap:clamp(0.5rem,1.2vw,1rem); transform:translateX(-4%); width:120%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c11\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#484848; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c12\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#5c5c5c; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c13\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#6c6c6c; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c14\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#404040; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c15\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#525252; flex:0 0 clamp(18%,22vw,28%); background-size:cover; background-position:center;\"></div></div></div></section>"
  },

  {
    tpl:"showreelRandomGridA_2",
    family:"gallery",
    group:"Галерея проекта",
    label:"Рандом-сетка A — асимметрия 16:9",
    code:"G-03",
    icon:"▦",
    kind:"auto",
    
    desc:"Асимметричная сетка изображений в кадре 16:9. Случайный ритм крупных и мелких плашек, швейцарский минимализм.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"cell1","role":"image"},{"type":"image","slot":"cell2","role":"image"},{"type":"image","slot":"cell3","role":"image"},{"type":"image","slot":"cell4","role":"image"},{"type":"image","slot":"cell5","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"cell1","role":"image"},{"type":"image","slot":"cell2","role":"image"},{"type":"image","slot":"cell3","role":"image"},{"type":"image","slot":"cell4","role":"image"},{"type":"image","slot":"cell5","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0d0d0d; padding:0; aspect-ratio:16/9; overflow:hidden;\"><div class=\"sv-inner\" style=\"display:grid; grid-template-columns:1.4fr 0.8fr 1fr 0.9fr; grid-template-rows:1.1fr 0.9fr; height:100%; width:100%; gap:clamp(6px,0.9vw,12px); padding:clamp(16px,2.2vw,32px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cell1\" data-kind=\"image\" style=\"grid-column:1/2; grid-row:1/3; background:#2a2a2a; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cell2\" data-kind=\"image\" style=\"grid-column:2/3; grid-row:1/2; background:#333; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cell3\" data-kind=\"image\" style=\"grid-column:3/5; grid-row:1/2; background:#222; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cell4\" data-kind=\"image\" style=\"grid-column:2/4; grid-row:2/3; background:#2f2f2f; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cell5\" data-kind=\"image\" style=\"grid-column:4/5; grid-row:2/3; background:#1a1a1a; background-size:cover; background-position:center; width:100%; height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelRandomGridB_2",
    family:"gallery",
    group:"Галерея проекта",
    label:"Рандом-сетка B — центр и края",
    code:"G-04",
    icon:"▥",
    kind:"auto",
    
    desc:"Второй вариант рандом-сетки 16:9: крупный центр, мелкие кадры по краям. Для коллажного ритма шоурила.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"tl","role":"image"},{"type":"image","slot":"tc","role":"image"},{"type":"image","slot":"tr","role":"image"},{"type":"image","slot":"ml","role":"image"},{"type":"image","slot":"mc","role":"image"},{"type":"image","slot":"br","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"tl","role":"image"},{"type":"image","slot":"tc","role":"image"},{"type":"image","slot":"tr","role":"image"},{"type":"image","slot":"ml","role":"image"},{"type":"image","slot":"mc","role":"image"},{"type":"image","slot":"br","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#e6e6e2; padding:0; aspect-ratio:16/9; overflow:hidden;\"><div class=\"sv-inner\" style=\"display:grid; grid-template-columns:0.7fr 1.3fr 0.7fr; grid-template-rows:0.75fr 1.25fr 0.75fr; height:100%; width:100%; gap:clamp(6px,0.9vw,12px); padding:clamp(16px,2.2vw,32px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"tl\" data-kind=\"image\" style=\"grid-column:1/2; grid-row:1/2; background:#c8c8c4; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"tc\" data-kind=\"image\" style=\"grid-column:2/3; grid-row:1/2; background:#d2d2ce; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"tr\" data-kind=\"image\" style=\"grid-column:3/4; grid-row:1/3; background:#bcbcb8; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"ml\" data-kind=\"image\" style=\"grid-column:1/2; grid-row:2/4; background:#b0b0ac; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"mc\" data-kind=\"image\" style=\"grid-column:2/3; grid-row:2/3; background:#dadad6; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"br\" data-kind=\"image\" style=\"grid-column:2/4; grid-row:3/4; background:#c4c4c0; background-size:cover; background-position:center; width:100%; height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelRandomGridC_2",
    family:"gallery",
    group:"Галерея проекта",
    label:"Рандом-сетка C — модули 4×3",
    code:"G-05",
    icon:"⬡",
    kind:"auto",
    
    desc:"Третья рандом-композиция: нерегулярные модули в кадре 16:9, часть ячеек объединена. Модная лаконичность.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"m1","role":"image"},{"type":"image","slot":"m2","role":"image"},{"type":"image","slot":"m3","role":"image"},{"type":"image","slot":"m4","role":"image"},{"type":"image","slot":"m5","role":"image"},{"type":"image","slot":"m6","role":"image"},{"type":"image","slot":"m7","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"m1","role":"image"},{"type":"image","slot":"m2","role":"image"},{"type":"image","slot":"m3","role":"image"},{"type":"image","slot":"m4","role":"image"},{"type":"image","slot":"m5","role":"image"},{"type":"image","slot":"m6","role":"image"},{"type":"image","slot":"m7","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#121212; padding:0; aspect-ratio:16/9; overflow:hidden;\"><div class=\"sv-inner\" style=\"display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(3,1fr); height:100%; width:100%; gap:clamp(5px,0.7vw,10px); padding:clamp(14px,2vw,28px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m1\" data-kind=\"image\" style=\"grid-column:1/3; grid-row:1/3; background:#2a2a2a; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m2\" data-kind=\"image\" style=\"grid-column:3/4; grid-row:1/2; background:#333; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m3\" data-kind=\"image\" style=\"grid-column:4/5; grid-row:1/2; background:#1f1f1f; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m4\" data-kind=\"image\" style=\"grid-column:3/5; grid-row:2/3; background:#282828; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m5\" data-kind=\"image\" style=\"grid-column:1/2; grid-row:3/4; background:#333; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m6\" data-kind=\"image\" style=\"grid-column:2/3; grid-row:3/4; background:#222; background-size:cover; background-position:center; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"m7\" data-kind=\"image\" style=\"grid-column:3/5; grid-row:3/4; background:#2c2c2c; background-size:cover; background-position:center; width:100%; height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelFilmstrip",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — горизонтальная плёнка из пяти",
    code:"SH-26",
    icon:"☷",
    kind:"auto",
    
    desc:"Один ряд из пяти кадров-кадриков как filmstrip. Повторяемые media-слоты для монтажной ленты.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"stripOver","role":"overline"},{"type":"text","slot":"stripMeta","role":"smallMeta"},{"type":"image","slot":"fs1","role":"image"},{"type":"image","slot":"fs2","role":"image"},{"type":"image","slot":"fs3","role":"image"},{"type":"image","slot":"fs4","role":"image"},{"type":"image","slot":"fs5","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"stripOver","role":"overline"},{"type":"text","slot":"stripMeta","role":"smallMeta"},{"type":"image","slot":"fs1","role":"image"},{"type":"image","slot":"fs2","role":"image"},{"type":"image","slot":"fs3","role":"image"},{"type":"image","slot":"fs4","role":"image"},{"type":"image","slot":"fs5","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; gap:clamp(16px,2vw,28px); padding:clamp(28px,4vw,56px); box-sizing:border-box;\"><div style=\"display:flex; justify-content:space-between; align-items:baseline;\"><div data-sb-editable=\"\" data-slot=\"stripOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.28em; text-transform:uppercase; color:#666;\">Sequence</div><div data-sb-editable=\"\" data-slot=\"stripMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.18em; text-transform:uppercase; color:#555;\">Frames 12–16</div></div><div data-sb-repeat=\"filmstripRow\" style=\"display:grid; grid-template-columns:repeat(5,1fr); gap:clamp(8px,1.1vw,14px);\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"fs1\" data-kind=\"image\" style=\"width:100%; aspect-ratio:3/4; background:#2a2a2a;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"fs2\" data-kind=\"image\" style=\"width:100%; aspect-ratio:3/4; background:#333;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"fs3\" data-kind=\"image\" style=\"width:100%; aspect-ratio:3/4; background:#252525;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"fs4\" data-kind=\"image\" style=\"width:100%; aspect-ratio:3/4; background:#2f2f2f;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"fs5\" data-kind=\"image\" style=\"width:100%; aspect-ratio:3/4; background:#222;\"></div></div></div></section>"
  },

  {
    tpl:"showreelDuoHorizontal",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — два равных кадра",
    code:"SH-23",
    icon:"☷",
    kind:"static",
    
    desc:"Два равных 16:10-кадра бок о бок с мета-строкой. Чистый монтажный бит для before/after или pair story.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"duoLabel","role":"label"},{"type":"text","slot":"duoMeta","role":"smallMeta"},{"type":"image","slot":"duoA","role":"image"},{"type":"image","slot":"duoB","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"duoLabel","role":"label"},{"type":"text","slot":"duoMeta","role":"smallMeta"},{"type":"image","slot":"duoA","role":"image"},{"type":"image","slot":"duoB","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#111; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; gap:clamp(12px,1.5vw,20px); padding:clamp(28px,4vw,56px); box-sizing:border-box;\"><div style=\"display:grid; grid-template-columns:1fr 1fr; gap:clamp(10px,1.4vw,18px); flex:1; min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"duoA\" data-kind=\"image\" style=\"width:100%; height:100%; background:#2a2a2a; min-height:0;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"duoB\" data-kind=\"image\" style=\"width:100%; height:100%; background:#333; min-height:0;\"></div></div><div style=\"display:flex; justify-content:space-between; align-items:center;\"><div data-sb-editable=\"\" data-slot=\"duoLabel\" data-role=\"label\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.22em; text-transform:uppercase; color:#777;\">Editorial pair</div><div data-sb-editable=\"\" data-slot=\"duoMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.18em; text-transform:uppercase; color:#555;\">08 / 12</div></div></div></section>"
  },

  {
    tpl:"showreelConveyorRows",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — конвейер из трёх рядов со сдвигом",
    code:"SH-06",
    icon:"☷",
    kind:"auto",
    
    desc:"Галерея-конвейер 16:9: три горизонтальных ряда кадров со смещением, словно бегущая лента. Повторяемые медиа-элементы.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"c1a","role":"image"},{"type":"image","slot":"c1b","role":"image"},{"type":"image","slot":"c1c","role":"image"},{"type":"image","slot":"c1d","role":"image"},{"type":"image","slot":"c1e","role":"image"},{"type":"image","slot":"c2a","role":"image"},{"type":"image","slot":"c2b","role":"image"},{"type":"image","slot":"c2c","role":"image"},{"type":"image","slot":"c2d","role":"image"},{"type":"image","slot":"c2e","role":"image"},{"type":"image","slot":"c3a","role":"image"},{"type":"image","slot":"c3b","role":"image"},{"type":"image","slot":"c3c","role":"image"},{"type":"image","slot":"c3d","role":"image"},{"type":"image","slot":"c3e","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"c1a","role":"image"},{"type":"image","slot":"c1b","role":"image"},{"type":"image","slot":"c1c","role":"image"},{"type":"image","slot":"c1d","role":"image"},{"type":"image","slot":"c1e","role":"image"},{"type":"image","slot":"c2a","role":"image"},{"type":"image","slot":"c2b","role":"image"},{"type":"image","slot":"c2c","role":"image"},{"type":"image","slot":"c2d","role":"image"},{"type":"image","slot":"c2e","role":"image"},{"type":"image","slot":"c3a","role":"image"},{"type":"image","slot":"c3b","role":"image"},{"type":"image","slot":"c3c","role":"image"},{"type":"image","slot":"c3d","role":"image"},{"type":"image","slot":"c3e","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#111; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; gap:clamp(8px,1.2vw,16px); padding:clamp(20px,3vw,40px) 0; box-sizing:border-box; overflow:hidden;\"><div data-sb-repeat=\"conveyorRow1\" style=\"display:flex; flex-direction:row; gap:clamp(8px,1.2vw,16px); transform:translateX(-4%); width:120%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c1a\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#2a2a2a;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c1b\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#333;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c1c\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#252525;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c1d\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#2f2f2f;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c1e\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#222;\"></div></div><div data-sb-repeat=\"conveyorRow2\" style=\"display:flex; flex-direction:row; gap:clamp(8px,1.2vw,16px); transform:translateX(-12%); width:120%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c2a\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#2c2c2c;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c2b\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#383838;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c2c\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#1e1e1e;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c2d\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#303030;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c2e\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#282828;\"></div></div><div data-sb-repeat=\"conveyorRow3\" style=\"display:flex; flex-direction:row; gap:clamp(8px,1.2vw,16px); transform:translateX(-7%); width:120%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c3a\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#262626;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c3b\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#343434;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c3c\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#2a2a2a;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c3d\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#1c1c1c;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"c3e\" data-kind=\"image\" style=\"flex:0 0 auto; width:clamp(140px,18vw,280px); aspect-ratio:16/10; background:#2e2e2e;\"></div></div></div></section>"
  },

  {
    tpl:"showreelOnePlusTwo",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — один крупный + два стэком",
    code:"SH-19",
    icon:"☷",
    kind:"static",
    
    desc:"Классика портфолио: крупный кадр слева, два горизонтальных справа. Держит ритм после тройного ряда.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"optMain","role":"image"},{"type":"image","slot":"optTop","role":"image"},{"type":"image","slot":"optBot","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"optMain","role":"image"},{"type":"image","slot":"optTop","role":"image"},{"type":"image","slot":"optBot","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#eae8e3; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:1.15fr 1fr; gap:clamp(10px,1.4vw,18px); padding:clamp(24px,3.5vw,48px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"optMain\" data-kind=\"image\" style=\"width:100%; height:100%; background:#c4c0b8;\"></div><div style=\"display:grid; grid-template-rows:1fr 1fr; gap:clamp(10px,1.4vw,18px); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"optTop\" data-kind=\"image\" style=\"width:100%; height:100%; background:#b0aca4; min-height:0;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"optBot\" data-kind=\"image\" style=\"width:100%; height:100%; background:#d0ccc4; min-height:0;\"></div></div></div></section>"
  },

  {
    tpl:"showreelRandomGridA",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — рандом-сетка A (ассиметрия)",
    code:"SH-07",
    icon:"☷",
    kind:"static",
    
    desc:"Асимметричная раскладка кадров на сетке 16:9: крупный блок + два средних + мелкий. Много воздуха, showreel-эстетика.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"rgA1","role":"image"},{"type":"image","slot":"rgA2","role":"image"},{"type":"image","slot":"rgA3","role":"image"},{"type":"image","slot":"rgA4","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"rgA1","role":"image"},{"type":"image","slot":"rgA2","role":"image"},{"type":"image","slot":"rgA3","role":"image"},{"type":"image","slot":"rgA4","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0d0d0d; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(24,1fr); grid-template-rows:repeat(12,1fr); gap:clamp(8px,1vw,14px); padding:clamp(24px,3.5vw,48px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgA1\" data-kind=\"image\" style=\"grid-column:2 / 11; grid-row:2 / 9; background:#2a2a2a; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgA2\" data-kind=\"image\" style=\"grid-column:12 / 18; grid-row:3 / 8; background:#333; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgA3\" data-kind=\"image\" style=\"grid-column:19 / 24; grid-row:2 / 6; background:#222; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgA4\" data-kind=\"image\" style=\"grid-column:14 / 23; grid-row:9 / 12; background:#2c2c2c; width:100%; height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelRandomGridB",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — рандом-сетка B (диагональ)",
    code:"SH-08",
    icon:"☷",
    kind:"static",
    
    desc:"Диагональная россыпь изображений на 16:9: пять кадров разного масштаба, ощущение случайной но сбалансированной композиции.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"rgB1","role":"image"},{"type":"image","slot":"rgB2","role":"image"},{"type":"image","slot":"rgB3","role":"image"},{"type":"image","slot":"rgB4","role":"image"},{"type":"image","slot":"rgB5","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"rgB1","role":"image"},{"type":"image","slot":"rgB2","role":"image"},{"type":"image","slot":"rgB3","role":"image"},{"type":"image","slot":"rgB4","role":"image"},{"type":"image","slot":"rgB5","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#eae8e3; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(24,1fr); grid-template-rows:repeat(12,1fr); gap:clamp(8px,1vw,14px); padding:clamp(20px,3vw,40px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgB1\" data-kind=\"image\" style=\"grid-column:2 / 8; grid-row:2 / 7; background:#c4c0b8; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgB2\" data-kind=\"image\" style=\"grid-column:9 / 15; grid-row:4 / 10; background:#b0aca4; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgB3\" data-kind=\"image\" style=\"grid-column:16 / 20; grid-row:2 / 6; background:#d0ccc4; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgB4\" data-kind=\"image\" style=\"grid-column:18 / 24; grid-row:7 / 12; background:#a8a49c; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgB5\" data-kind=\"image\" style=\"grid-column:3 / 9; grid-row:8 / 12; background:#bcb8b0; width:100%; height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelRandomGridC",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — рандом-сетка C (центр + орбита)",
    code:"SH-09",
    icon:"☷",
    kind:"static",
    
    desc:"Крупный центральный кадр и четыре сателлита по углам сетки 16:9. Для акцента на key visual внутри шоурила.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"image","slot":"rgC1","role":"image"},{"type":"image","slot":"rgC2","role":"image"},{"type":"image","slot":"rgC3","role":"image"},{"type":"image","slot":"rgC4","role":"image"},{"type":"image","slot":"rgC5","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"image","slot":"rgC1","role":"image"},{"type":"image","slot":"rgC2","role":"image"},{"type":"image","slot":"rgC3","role":"image"},{"type":"image","slot":"rgC4","role":"image"},{"type":"image","slot":"rgC5","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(24,1fr); grid-template-rows:repeat(12,1fr); gap:clamp(8px,1vw,14px); padding:clamp(24px,3.5vw,48px); box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgC1\" data-kind=\"image\" style=\"grid-column:2 / 6; grid-row:2 / 5; background:#252525; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgC2\" data-kind=\"image\" style=\"grid-column:20 / 24; grid-row:2 / 5; background:#2e2e2e; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgC3\" data-kind=\"image\" style=\"grid-column:7 / 19; grid-row:3 / 11; background:#1a1a1a; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgC4\" data-kind=\"image\" style=\"grid-column:2 / 6; grid-row:9 / 12; background:#2a2a2a; width:100%; height:100%;\"></div><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"rgC5\" data-kind=\"image\" style=\"grid-column:20 / 24; grid-row:9 / 12; background:#222; width:100%; height:100%;\"></div></div></section>"
  },

  {
    tpl:"showreelTripleStack",
    family:"gallery",
    group:"Галерея проекта",
    label:"Шоурил 16:9 — три вертикальных кадра в ряд",
    code:"SH-18",
    icon:"☷",
    kind:"static",
    
    desc:"Три портретных кадра равной ширины на 16:9. Для lookbook / casting / beauty-последовательностей.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"triAMeta","role":"smallMeta"},{"type":"text","slot":"triBMeta","role":"smallMeta"},{"type":"text","slot":"triCMeta","role":"smallMeta"},{"type":"image","slot":"triA","role":"image"},{"type":"image","slot":"triB","role":"image"},{"type":"image","slot":"triC","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"triAMeta","role":"smallMeta"},{"type":"text","slot":"triBMeta","role":"smallMeta"},{"type":"text","slot":"triCMeta","role":"smallMeta"},{"type":"image","slot":"triA","role":"image"},{"type":"image","slot":"triB","role":"image"},{"type":"image","slot":"triC","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0d0d0d; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(8px,1.2vw,16px); padding:clamp(24px,3.5vw,48px); box-sizing:border-box;\"><div style=\"display:flex; flex-direction:column; gap:10px; min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"triA\" data-kind=\"image\" style=\"width:100%; flex:1; background:#2a2a2a; min-height:0;\"></div><div data-sb-editable=\"\" data-slot=\"triAMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(9px,0.8vw,11px); letter-spacing:0.18em; text-transform:uppercase; color:#555;\">Look 01</div></div><div style=\"display:flex; flex-direction:column; gap:10px; min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"triB\" data-kind=\"image\" style=\"width:100%; flex:1; background:#333; min-height:0;\"></div><div data-sb-editable=\"\" data-slot=\"triBMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(9px,0.8vw,11px); letter-spacing:0.18em; text-transform:uppercase; color:#555;\">Look 02</div></div><div style=\"display:flex; flex-direction:column; gap:10px; min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"triC\" data-kind=\"image\" style=\"width:100%; flex:1; background:#252525; min-height:0;\"></div><div data-sb-editable=\"\" data-slot=\"triCMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(9px,0.8vw,11px); letter-spacing:0.18em; text-transform:uppercase; color:#555;\">Look 03</div></div></div></section>"
  },

  {
    tpl:"fashionAsymmetricField",
    family:"gallery",
    group:"Галерея проекта",
    label:"Asymmetric image field",
    code:"G-02",
    icon:"◨",
    kind:"static",
    
    desc:"Кадр 16:9. Асимметричное поле из 5 media-блоков разного масштаба: крупный якорь, вертикаль, две горизонтали и квадрат. Editorial composition, не лендинг.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"labelA","role":"label"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"image","slot":"imgLarge","role":"image"},{"type":"image","slot":"imgTopMid","role":"image"},{"type":"image","slot":"imgTopRight","role":"image"},{"type":"image","slot":"imgBotMid","role":"image"},{"type":"image","slot":"imgBotRight","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"labelA","role":"label"},{"type":"text","slot":"smallMeta","role":"smallMeta"},{"type":"image","slot":"imgLarge","role":"image"},{"type":"image","slot":"imgTopMid","role":"image"},{"type":"image","slot":"imgTopRight","role":"image"},{"type":"image","slot":"imgBotMid","role":"image"},{"type":"image","slot":"imgBotRight","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9;width:100%;height:auto;box-sizing:border-box;overflow:hidden;background:#f5f4f1;color:#111;\"><div class=\"sv-inner\" style=\"display:grid;grid-template-columns:1.35fr 0.75fr 0.9fr;grid-template-rows:1.1fr 0.9fr;gap:clamp(8px,1.1vw,16px);width:100%;height:100%;padding:clamp(14px,2.2vw,32px);box-sizing:border-box;\"><div style=\"grid-row:1/3;grid-column:1;overflow:hidden;min-height:0;position:relative;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"imgLarge\" data-kind=\"image\" style=\"aspect-ratio:3/4;background:#b8b3aa;width:100%;height:100%;object-fit:cover;\"></div><p data-sb-editable=\"\" data-slot=\"labelA\" data-role=\"label\" style=\"position:absolute;left:clamp(8px,1vw,14px);bottom:clamp(8px,1vw,14px);margin:0;font-size:clamp(9px,0.7vw,11px);letter-spacing:0.14em;text-transform:uppercase;color:#fff;opacity:0.85;\">01</p></div><div style=\"grid-row:1;grid-column:2;overflow:hidden;min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"imgTopMid\" data-kind=\"image\" style=\"aspect-ratio:1/1;background:#9a958c;width:100%;height:100%;object-fit:cover;\"></div></div><div style=\"grid-row:1;grid-column:3;overflow:hidden;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:clamp(8px,1vw,14px);\"><div style=\"flex:1;overflow:hidden;min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"imgTopRight\" data-kind=\"image\" style=\"aspect-ratio:16/9;background:#cfcabf;width:100%;height:100%;object-fit:cover;\"></div></div><p data-sb-editable=\"\" data-slot=\"smallMeta\" data-role=\"smallMeta\" style=\"margin:0;font-size:clamp(9px,0.7vw,12px);letter-spacing:0.16em;text-transform:uppercase;opacity:0.4;\">Field / 05</p></div><div style=\"grid-row:2;grid-column:2;overflow:hidden;min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"imgBotMid\" data-kind=\"image\" style=\"aspect-ratio:4/5;background:#8a857c;width:100%;height:100%;object-fit:cover;\"></div></div><div style=\"grid-row:2;grid-column:3;overflow:hidden;min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"imgBotRight\" data-kind=\"image\" style=\"aspect-ratio:16/10;background:#d4cfc6;width:100%;height:100%;object-fit:cover;\"></div></div></div></section>"
  },

  {
    tpl:"showreelClosingCard",
    family:"hero",
    group:"Секции",
    label:"Шоурил 16:9 — финальный кадр: имя и контакт",
    code:"SH-30",
    icon:"◧",
    kind:"static",
    
    desc:"Закрывающий кадр последовательности: имя / студия, короткий tagline и контакт. Ставится в конец шоурила.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"endOver","role":"overline"},{"type":"text","slot":"endTitle","role":"title"},{"type":"text","slot":"endBody","role":"body"},{"type":"text","slot":"endMeta","role":"smallMeta"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"endOver","role":"overline"},{"type":"text","slot":"endTitle","role":"title"},{"type":"text","slot":"endBody","role":"body"},{"type":"text","slot":"endMeta","role":"smallMeta"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:clamp(18px,2.5vw,32px); padding:clamp(32px,5vw,72px); box-sizing:border-box;\"><div data-sb-editable=\"\" data-slot=\"endOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.36em; text-transform:uppercase; color:#555;\">End of sequence</div><h2 data-sb-editable=\"\" data-slot=\"endTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(40px,7vw,104px); line-height:0.9; letter-spacing:-0.04em; color:#f5f5f5; font-weight:700; margin:0; text-transform:uppercase; text-align:center;\">Your Name</h2><p data-sb-editable=\"\" data-slot=\"endBody\" data-role=\"body\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(13px,1.15vw,17px); line-height:1.45; color:#888; margin:0; text-align:center; max-width:36ch;\">Photography · Direction · Motion</p><div data-sb-editable=\"\" data-slot=\"endMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.22em; text-transform:uppercase; color:#666; margin-top:clamp(8px,1.5vw,16px);\">hello@studio.com</div></div></section>"
  },

  {
    tpl:"showreelColdOpen",
    family:"hero",
    group:"Секции",
    label:"Шоурил 16:9 — холодный старт: номер и год",
    code:"SH-13",
    icon:"◧",
    kind:"static",
    
    desc:"Первый кадр последовательности: крупный номер главы и год, минимум текста. Пауза перед блоком работ.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"coldOver","role":"overline"},{"type":"text","slot":"coldTitle","role":"title"},{"type":"text","slot":"coldMeta","role":"smallMeta"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"coldOver","role":"overline"},{"type":"text","slot":"coldTitle","role":"title"},{"type":"text","slot":"coldMeta","role":"smallMeta"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:clamp(16px,2.5vw,32px); box-sizing:border-box; padding:clamp(32px,5vw,72px);\"><div data-sb-editable=\"\" data-slot=\"coldOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.36em; text-transform:uppercase; color:#555;\">Showreel</div><h2 data-sb-editable=\"\" data-slot=\"coldTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(72px,14vw,200px); line-height:0.85; letter-spacing:-0.05em; color:#f5f5f5; font-weight:700; margin:0; text-transform:uppercase;\">05</h2><div data-sb-editable=\"\" data-slot=\"coldMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.28em; text-transform:uppercase; color:#666;\">2025</div></div></section>"
  },

  {
    tpl:"showreelNumbersRow",
    family:"statement",
    group:"Секции",
    label:"Шоурил 16:9 — три метрики / факта",
    code:"SH-24",
    icon:"≡",
    kind:"static",
    
    desc:"Крупные цифры и подписи: годы, проекты, города. Кадр-доказательство перед финалом.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"num1","role":"title"},{"type":"text","slot":"num1Label","role":"label"},{"type":"text","slot":"num2","role":"title"},{"type":"text","slot":"num2Label","role":"label"},{"type":"text","slot":"num3","role":"title"},{"type":"text","slot":"num3Label","role":"label"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"num1","role":"title"},{"type":"text","slot":"num1Label","role":"label"},{"type":"text","slot":"num2","role":"title"},{"type":"text","slot":"num2Label","role":"label"},{"type":"text","slot":"num3","role":"title"},{"type":"text","slot":"num3Label","role":"label"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0c0c0c; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(20px,3vw,48px); padding:clamp(40px,6vw,96px); box-sizing:border-box; align-items:center;\"><div style=\"display:flex; flex-direction:column; gap:clamp(12px,1.5vw,20px); border-top:1px solid #2a2a2a; padding-top:clamp(16px,2vw,28px);\"><div data-sb-editable=\"\" data-slot=\"num1\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(48px,7vw,104px); line-height:0.9; letter-spacing:-0.045em; color:#f5f5f5; font-weight:700;\">48</div><div data-sb-editable=\"\" data-slot=\"num1Label\" data-role=\"label\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(11px,1vw,14px); letter-spacing:0.18em; text-transform:uppercase; color:#777;\">Projects</div></div><div style=\"display:flex; flex-direction:column; gap:clamp(12px,1.5vw,20px); border-top:1px solid #2a2a2a; padding-top:clamp(16px,2vw,28px);\"><div data-sb-editable=\"\" data-slot=\"num2\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(48px,7vw,104px); line-height:0.9; letter-spacing:-0.045em; color:#f5f5f5; font-weight:700;\">12</div><div data-sb-editable=\"\" data-slot=\"num2Label\" data-role=\"label\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(11px,1vw,14px); letter-spacing:0.18em; text-transform:uppercase; color:#777;\">Cities</div></div><div style=\"display:flex; flex-direction:column; gap:clamp(12px,1.5vw,20px); border-top:1px solid #2a2a2a; padding-top:clamp(16px,2vw,28px);\"><div data-sb-editable=\"\" data-slot=\"num3\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(48px,7vw,104px); line-height:0.9; letter-spacing:-0.045em; color:#f5f5f5; font-weight:700;\">09</div><div data-sb-editable=\"\" data-slot=\"num3Label\" data-role=\"label\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(11px,1vw,14px); letter-spacing:0.18em; text-transform:uppercase; color:#777;\">Years</div></div></div></section>"
  },

  {
    tpl:"showreelTypeOnlyLight",
    family:"statement",
    group:"Секции",
    label:"Шоурил 16:9 — только типографика, светлый",
    code:"SH-28",
    icon:"≡",
    kind:"static",
    
    desc:"Светлый кадр-перебивка: overline + крупный заголовок + короткая строка. Без медиа, только ритм.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"tolOver","role":"overline"},{"type":"text","slot":"tolTitle","role":"title"},{"type":"text","slot":"tolBody","role":"body"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"tolOver","role":"overline"},{"type":"text","slot":"tolTitle","role":"title"},{"type":"text","slot":"tolBody","role":"body"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#f3f1ec; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; padding:clamp(32px,5vw,72px); box-sizing:border-box;\"><div data-sb-editable=\"\" data-slot=\"tolOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.3em; text-transform:uppercase; color:#999;\">Next</div><h2 data-sb-editable=\"\" data-slot=\"tolTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(40px,7vw,104px); line-height:0.92; letter-spacing:-0.04em; color:#111; font-weight:700; margin:0; text-transform:uppercase; max-width:10em;\">Key<br>Visual</h2><p data-sb-editable=\"\" data-slot=\"tolBody\" data-role=\"body\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(13px,1.15vw,17px); line-height:1.45; color:#666; margin:0; max-width:32ch;\">Single frames built to carry a whole campaign.</p></div></section>"
  },

  {
    tpl:"showreelOverlayTitle",
    family:"hero",
    group:"Секции",
    label:"Шоурил 16:9 — медиа-фон + огромный титул",
    code:"SH-25",
    icon:"◧",
    kind:"static",
    
    desc:"Full-bleed медиа и крупное слово поверх с mix-blend. Титульный кадр направления или проекта.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"ovOver","role":"overline"},{"type":"text","slot":"ovTitle","role":"title"},{"type":"image","slot":"ovMedia","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"ovOver","role":"overline"},{"type":"text","slot":"ovTitle","role":"title"},{"type":"image","slot":"ovMedia","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; overflow:hidden; position:relative;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; position:relative; display:flex; align-items:center; justify-content:center;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"ovMedia\" data-kind=\"image\" style=\"position:absolute; inset:0; width:100%; height:100%; background:#1a1a1a;\"></div><div style=\"position:absolute; inset:0; background:rgba(0,0,0,0.25); z-index:1;\"></div><div style=\"position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:clamp(12px,2vw,24px); padding:clamp(24px,4vw,48px); box-sizing:border-box;\"><div data-sb-editable=\"\" data-slot=\"ovOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.95vw,12px); letter-spacing:0.32em; text-transform:uppercase; color:#ddd;\">Direction</div><h2 data-sb-editable=\"\" data-slot=\"ovTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(56px,11vw,160px); line-height:0.88; letter-spacing:-0.045em; color:#fff; font-weight:700; margin:0; text-transform:uppercase; text-align:center; mix-blend-mode:difference;\">Beauty</h2></div></div></section>"
  },

  {
    tpl:"showreelIndexStrip",
    family:"statement",
    group:"Секции",
    label:"Шоурил 16:9 — оглавление полосой",
    code:"SH-14",
    icon:"≡",
    kind:"static",
    
    desc:"Кадр-оглавление: четыре направления в горизонтальной полосе. Логичный второй кадр после холодного старта.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"indexOver","role":"overline"},{"type":"text","slot":"indexN1","role":"smallMeta"},{"type":"text","slot":"indexT1","role":"title"},{"type":"text","slot":"indexN2","role":"smallMeta"},{"type":"text","slot":"indexT2","role":"title"},{"type":"text","slot":"indexN3","role":"smallMeta"},{"type":"text","slot":"indexT3","role":"title"},{"type":"text","slot":"indexN4","role":"smallMeta"},{"type":"text","slot":"indexT4","role":"title"},{"type":"text","slot":"indexFoot","role":"smallMeta"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"indexOver","role":"overline"},{"type":"text","slot":"indexN1","role":"smallMeta"},{"type":"text","slot":"indexT1","role":"title"},{"type":"text","slot":"indexN2","role":"smallMeta"},{"type":"text","slot":"indexT2","role":"title"},{"type":"text","slot":"indexN3","role":"smallMeta"},{"type":"text","slot":"indexT3","role":"title"},{"type":"text","slot":"indexN4","role":"smallMeta"},{"type":"text","slot":"indexT4","role":"title"},{"type":"text","slot":"indexFoot","role":"smallMeta"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0c0c0c; padding:0; aspect-ratio:16/9; display:flex; align-items:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:grid; grid-template-rows:auto 1fr auto; padding:clamp(28px,4vw,56px); box-sizing:border-box; gap:clamp(20px,3vw,40px);\"><div data-sb-editable=\"\" data-slot=\"indexOver\" data-role=\"overline\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.9vw,12px); letter-spacing:0.3em; text-transform:uppercase; color:#555;\">Index</div><div style=\"display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(12px,2vw,28px); align-items:end; border-top:1px solid #222; padding-top:clamp(20px,3vw,40px);\"><div style=\"display:flex; flex-direction:column; gap:12px;\"><div data-sb-editable=\"\" data-slot=\"indexN1\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; color:#444;\">01</div><div data-sb-editable=\"\" data-slot=\"indexT1\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(18px,2.2vw,32px); line-height:1; letter-spacing:-0.03em; color:#f0f0f0; font-weight:700; text-transform:uppercase;\">Fashion</div></div><div style=\"display:flex; flex-direction:column; gap:12px;\"><div data-sb-editable=\"\" data-slot=\"indexN2\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; color:#444;\">02</div><div data-sb-editable=\"\" data-slot=\"indexT2\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(18px,2.2vw,32px); line-height:1; letter-spacing:-0.03em; color:#f0f0f0; font-weight:700; text-transform:uppercase;\">Studios</div></div><div style=\"display:flex; flex-direction:column; gap:12px;\"><div data-sb-editable=\"\" data-slot=\"indexN3\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; color:#444;\">03</div><div data-sb-editable=\"\" data-slot=\"indexT3\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(18px,2.2vw,32px); line-height:1; letter-spacing:-0.03em; color:#f0f0f0; font-weight:700; text-transform:uppercase;\">Personal</div></div><div style=\"display:flex; flex-direction:column; gap:12px;\"><div data-sb-editable=\"\" data-slot=\"indexN4\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.2em; color:#444;\">04</div><div data-sb-editable=\"\" data-slot=\"indexT4\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(18px,2.2vw,32px); line-height:1; letter-spacing:-0.03em; color:#f0f0f0; font-weight:700; text-transform:uppercase;\">Key Visual</div></div></div><div data-sb-editable=\"\" data-slot=\"indexFoot\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.22em; text-transform:uppercase; color:#444; margin-top:auto;\">Selected — 2025</div></div></section>"
  },

  {
    tpl:"showreelCenterCard_2",
    family:"hero",
    group:"Секции",
    label:"Шоурил 16:9 — карточка по центру в поле",
    code:"SH-22",
    icon:"◧",
    kind:"static",
    
    desc:"Один кадр-карточка по центру огромного поля. Титул проекта или key visual-пауза.",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"cardTitle","role":"title"},{"type":"text","slot":"cardMeta","role":"smallMeta"},{"type":"image","slot":"cardImg","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"cardTitle","role":"title"},{"type":"text","slot":"cardMeta","role":"smallMeta"},{"type":"image","slot":"cardImg","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio: 16 / 9; width: 100%; height: auto; box-sizing: border-box; display:flex; align-items:center; justify-content:center; overflow:hidden;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:clamp(16px,2.2vw,28px); box-sizing:border-box; padding:clamp(24px,4vw,48px);\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"cardImg\" data-kind=\"image\" style=\"width:clamp(180px,28vw,420px); aspect-ratio:4/5; background:#2a2a2a;\"></div><div data-sb-editable=\"\" data-slot=\"cardTitle\" data-role=\"title\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(14px,1.4vw,20px); letter-spacing:0.08em; text-transform:uppercase; color:#f0f0f0; font-weight:600; text-align:center;\">Key Visual</div><div data-sb-editable=\"\" data-slot=\"cardMeta\" data-role=\"smallMeta\" style=\"font-family:Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,11px); letter-spacing:0.22em; text-transform:uppercase; color:#666; text-align:center;\">Campaign still</div></div></section>"
  },

  {
    tpl:"showreelTwoWordsAir",
    family:"hero",
    group:"Секции",
    label:"Шоурил 16:9 — два слова по центру, кадр за ними",
    code:"SH-10",
    icon:"◧",
    kind:"static",
    
    desc:"Максимум воздуха: два крупных слова по центру поверх компактного изображения. Кадр-титул шоурила в швейцарской модельной типографике.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"twoWordsTitle","role":"title"},{"type":"image","slot":"twoWordsImg","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"twoWordsTitle","role":"title"},{"type":"image","slot":"twoWordsImg","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#0a0a0a; padding:0; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;\"><div class=\"sv-inner\" style=\"width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative; box-sizing:border-box;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"twoWordsImg\" data-kind=\"image\" style=\"position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:clamp(160px,22vw,340px); aspect-ratio:3/4; background:#2a2a2a; z-index:1;\"></div><h2 data-sb-editable=\"\" data-slot=\"twoWordsTitle\" data-role=\"title\" style=\"position:relative; z-index:2; font-family:Helvetica,Arial,sans-serif; font-size:clamp(48px,10vw,140px); line-height:0.88; letter-spacing:-0.045em; color:#f5f5f5; font-weight:700; margin:0; text-align:center; text-transform:uppercase; mix-blend-mode:difference;\">Soft<br>Focus</h2></div></section>"
  },

  {
    tpl:"microFramesGrid_2",
    family:"gallery",
    group:"Секции",
    label:"Сетка микро-кадров с подписями",
    code:"G-01",
    icon:"☷",
    kind:"auto",
    
    desc:"Сетка из шести микро-кадров 16:9 внутри панорамы: изображение + короткий абзац. Считывается за секунду, fashion-лаконичность.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"microText","role":"body"},{"type":"text","slot":"microText2","role":"body"},{"type":"text","slot":"microText3","role":"body"},{"type":"text","slot":"microText4","role":"body"},{"type":"text","slot":"microText5","role":"body"},{"type":"text","slot":"microText6","role":"body"},{"type":"image","slot":"microImg","role":"image"},{"type":"image","slot":"microImg2","role":"image"},{"type":"image","slot":"microImg3","role":"image"},{"type":"image","slot":"microImg4","role":"image"},{"type":"image","slot":"microImg5","role":"image"},{"type":"image","slot":"microImg6","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"microText","role":"body"},{"type":"text","slot":"microText2","role":"body"},{"type":"text","slot":"microText3","role":"body"},{"type":"text","slot":"microText4","role":"body"},{"type":"text","slot":"microText5","role":"body"},{"type":"text","slot":"microText6","role":"body"},{"type":"image","slot":"microImg","role":"image"},{"type":"image","slot":"microImg2","role":"image"},{"type":"image","slot":"microImg3","role":"image"},{"type":"image","slot":"microImg4","role":"image"},{"type":"image","slot":"microImg5","role":"image"},{"type":"image","slot":"microImg6","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9; width:100%; overflow:hidden; display:flex; background:#f3f1ec;\"><div class=\"sv-inner\" style=\"flex:1; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(2,1fr); gap:clamp(0.6rem,1.5vw,1.4rem); padding:clamp(1.2rem,3vw,2.8rem); height:100%; box-sizing:border-box;\" data-sb-repeat=\"microItems\"><div style=\"display:flex; flex-direction:column; gap:clamp(0.35rem,0.8vw,0.6rem); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"microImg\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#d8d4cc; width:100%; flex:1; background-size:cover; background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"microText\" data-role=\"body\" style=\"font-size:clamp(0.55rem,1.05vw,0.9rem); line-height:1.35; color:#1a1a1a; margin:0; letter-spacing:-0.01em;\">Lookbook sequence — soft light, quiet gesture</p></div><div style=\"display:flex; flex-direction:column; gap:clamp(0.35rem,0.8vw,0.6rem); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"microImg2\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#c8c4bc; width:100%; flex:1; background-size:cover; background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"microText2\" data-role=\"body\" style=\"font-size:clamp(0.55rem,1.05vw,0.9rem); line-height:1.35; color:#1a1a1a; margin:0; letter-spacing:-0.01em;\">Studio still — fabric study in motion</p></div><div style=\"display:flex; flex-direction:column; gap:clamp(0.35rem,0.8vw,0.6rem); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"microImg3\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#b8b4ac; width:100%; flex:1; background-size:cover; background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"microText3\" data-role=\"body\" style=\"font-size:clamp(0.55rem,1.05vw,0.9rem); line-height:1.35; color:#1a1a1a; margin:0; letter-spacing:-0.01em;\">Campaign crop — silhouette against void</p></div><div style=\"display:flex; flex-direction:column; gap:clamp(0.35rem,0.8vw,0.6rem); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"microImg4\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#a8a49c; width:100%; flex:1; background-size:cover; background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"microText4\" data-role=\"body\" style=\"font-size:clamp(0.55rem,1.05vw,0.9rem); line-height:1.35; color:#1a1a1a; margin:0; letter-spacing:-0.01em;\">Editorial page — type meets texture</p></div><div style=\"display:flex; flex-direction:column; gap:clamp(0.35rem,0.8vw,0.6rem); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"microImg5\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#98948c; width:100%; flex:1; background-size:cover; background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"microText5\" data-role=\"body\" style=\"font-size:clamp(0.55rem,1.05vw,0.9rem); line-height:1.35; color:#1a1a1a; margin:0; letter-spacing:-0.01em;\">Backstage frame — raw, unstyled second</p></div><div style=\"display:flex; flex-direction:column; gap:clamp(0.35rem,0.8vw,0.6rem); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"microImg6\" data-kind=\"image\" style=\"aspect-ratio:16/10; background:#88847c; width:100%; flex:1; background-size:cover; background-position:center;\"></div><p data-sb-editable=\"\" data-slot=\"microText6\" data-role=\"body\" style=\"font-size:clamp(0.55rem,1.05vw,0.9rem); line-height:1.35; color:#1a1a1a; margin:0; letter-spacing:-0.01em;\">Key visual — brand mark in space</p></div></div></section>"
  },

  {
    tpl:"showreelMicroGrid_10",
    family:"services",
    group:"Секции",
    label:"Сетка микро-кадров с быстрыми анонсами",
    code:"SR-02",
    icon:"☷",
    kind:"auto",
    
    desc:"Лаконичная сетка микро-кадров 16:9 с емкими абзацами текста для быстрого считывания концепций",
    styleSystem:"style-1788865914117",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"sr2_title","role":"title"},{"type":"text","slot":"sr2_count","role":"smallMeta"},{"type":"text","slot":"sr2_num1","role":"smallMeta"},{"type":"text","slot":"sr2_text1","role":"body"},{"type":"image","slot":"sr2_img1","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"sr2_title","role":"title"},{"type":"text","slot":"sr2_count","role":"smallMeta"},{"type":"text","slot":"sr2_num1","role":"smallMeta"},{"type":"text","slot":"sr2_text1","role":"body"},{"type":"image","slot":"sr2_img1","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#ffffff; color:#000000; aspect-ratio:16/9; width:100%; height:auto; box-sizing:border-box; overflow:hidden; padding: clamp(28px, 3.6vh, 48px) var(--pad, 4vw);\"><div class=\"sv-inner\" style=\"max-width:1600px; margin:0 auto; height:100%; display:flex; flex-direction:column; min-height:0;\"><div style=\"display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:clamp(12px, 1.6vh, 20px); border-bottom:1px solid #e5e5e5; padding-bottom:clamp(10px, 1.2vh, 16px); flex-shrink:0;\"><h3 data-sb-editable=\"\" data-slot=\"sr2_title\" data-role=\"title\" style=\"font-size: clamp(20px, 2.5vw, 36px); font-weight:700; text-transform:uppercase; margin:0; letter-spacing:-0.01em;\">FAST INDEX</h3><span data-sb-editable=\"\" data-slot=\"sr2_count\" data-role=\"smallMeta\" style=\"font-family:monospace; font-size:14px; color:#666666;\">[ 01 — 03 ]</span></div><div style=\"display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(12px, 1.8vh, 24px) clamp(16px, 2vw, 32px); flex:1; min-height:0; align-content:stretch;\"><div data-sb-repeat=\"microCards\" style=\"display:flex; flex-direction:column; gap:clamp(8px, 1.2vh, 14px); min-height:0;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"sr2_img1\" data-kind=\"image\" style=\"aspect-ratio: 16/9; background: #f0f0f0; width: 100%; flex:1; min-height:0;\"></div><div style=\"display:flex; flex-direction:column; gap:6px; flex-shrink:0;\"><span data-sb-editable=\"\" data-slot=\"sr2_num1\" data-role=\"smallMeta\" style=\"font-family:monospace; font-size:11px; text-transform:uppercase; color:#888;\">01. CINEMATIC FRAME</span><p data-sb-editable=\"\" data-slot=\"sr2_text1\" data-role=\"body\" style=\"font-size:14px; line-height:1.4; color:#222222; margin:0; font-weight:400;\">Быстрая читаемость, точная модульная сетка и максимальный фокус на композиции каждого кадра.</p></div></div></div></div></section>"
  },

  {
    tpl:"showreelMicroGrid_2",
    family:"services",
    group:"Секции",
    label:"Сетка микро-кадров с быстрыми анонсами",
    code:"SR-02",
    icon:"☷",
    kind:"auto",
    
    desc:"Лаконичная сетка микро-кадров 16:9 с емкими абзацами текста для быстрого считывания концепций",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"sr2_title","role":"title"},{"type":"text","slot":"sr2_count","role":"smallMeta"},{"type":"text","slot":"sr2_num1","role":"smallMeta"},{"type":"text","slot":"sr2_text1","role":"body"},{"type":"image","slot":"sr2_img1","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"sr2_title","role":"title"},{"type":"text","slot":"sr2_count","role":"smallMeta"},{"type":"text","slot":"sr2_num1","role":"smallMeta"},{"type":"text","slot":"sr2_text1","role":"body"},{"type":"image","slot":"sr2_img1","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"aspect-ratio:16/9;width:100%;height:auto;box-sizing:border-box;overflow:hidden;background:#ffffff;color:#000000;padding:clamp(36px,5vh,72px) var(--pad,4vw);display:flex;flex-direction:column;\"><div class=\"sv-inner\" style=\"flex:1;min-height:0;width:100%;max-width:1600px;margin:0 auto;display:flex;flex-direction:column;\"><div style=\"flex-shrink:0;display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:clamp(16px,2.2vh,32px);border-bottom:1px solid #e5e5e5;padding-bottom:clamp(12px,1.6vh,20px);\"><h3 data-sb-editable=\"\" data-slot=\"sr2_title\" data-role=\"title\" style=\"font-size:clamp(20px,2.2vw,36px);font-weight:700;text-transform:uppercase;margin:0;letter-spacing:-0.01em;line-height:1.1;\">FAST INDEX</h3><span data-sb-editable=\"\" data-slot=\"sr2_count\" data-role=\"smallMeta\" style=\"font-family:monospace;font-size:clamp(12px,0.9vw,14px);color:#666666;white-space:nowrap;\">[ 01 — 03 ]</span></div><div style=\"flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(20px,2.5vw,40px);align-content:start;\"><div data-sb-repeat=\"microCards\" style=\"min-width:0;display:flex;flex-direction:column;gap:clamp(12px,1.5vh,16px);\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"sr2_img1\" data-kind=\"image\" style=\"aspect-ratio:16/9;background:#f0f0f0;width:100%;flex-shrink:0;\"></div><div style=\"display:flex;flex-direction:column;gap:6px;\"><span data-sb-editable=\"\" data-slot=\"sr2_num1\" data-role=\"smallMeta\" style=\"font-family:monospace;font-size:clamp(10px,0.7vw,11px);text-transform:uppercase;color:#888;\">01. CINEMATIC FRAME</span><p data-sb-editable=\"\" data-slot=\"sr2_text1\" data-role=\"body\" style=\"font-size:clamp(12px,0.9vw,14px);line-height:1.4;color:#222222;margin:0;font-weight:400;\">Быстрая читаемость, точная модульная сетка и максимальный фокус на композиции каждого кадра.</p></div></div></div></div></section>"
  },

  {
    tpl:"showreelTwoWordsSoft",
    family:"statement",
    group:"Секции",
    label:"Два слова — светлый воздух 16:9",
    code:"ST-03",
    icon:"○",
    kind:"static",
    
    desc:"Светлая версия: два слова по центру, компактное медиа за ними, максимум воздуха. Для тихих врезок шоурила.",
    styleSystem:"2",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    entities:[{"type":"text","slot":"w1","role":"title"},{"type":"text","slot":"w2","role":"title"},{"type":"text","slot":"softMeta","role":"smallMeta"},{"type":"image","slot":"softImage","role":"image"}],
    motion:{"contract":"motion-studio-template-v1","aspect":"16:9","canvas":{"width":1920,"height":1080},"entities":[{"type":"text","slot":"w1","role":"title"},{"type":"text","slot":"w2","role":"title"},{"type":"text","slot":"softMeta","role":"smallMeta"},{"type":"image","slot":"softImage","role":"image"}],"animation":{"type":"none"}},
    build:i=>"<section class=\"sv-section\" style=\"background:#efefe9; padding:0; aspect-ratio:16/9; overflow:hidden;\"><div class=\"sv-inner\" style=\"position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; width:100%;\"><div class=\"sv-media\" data-sb-media=\"\" data-slot=\"softImage\" data-kind=\"image\" style=\"position:absolute; top:50%; left:50%; transform:translate(-50%,-48%); width:clamp(160px,24vw,360px); aspect-ratio:1/1; background:#d8d8d2; background-size:cover; background-position:center; z-index:0;\"></div><div style=\"position:relative; z-index:1; display:flex; flex-direction:row; align-items:baseline; gap:clamp(12px,2vw,28px);\"><h1 data-sb-editable=\"\" data-slot=\"w1\" data-role=\"title\" style=\"font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(36px,6.5vw,96px); line-height:0.92; font-weight:700; letter-spacing:-0.04em; color:#0a0a0a; margin:0;\">Personal</h1><h1 data-sb-editable=\"\" data-slot=\"w2\" data-role=\"title\" style=\"font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(36px,6.5vw,96px); line-height:0.92; font-weight:300; letter-spacing:-0.04em; color:#0a0a0a; margin:0;\">Work</h1></div><span data-sb-editable=\"\" data-slot=\"softMeta\" data-role=\"smallMeta\" style=\"position:relative; z-index:1; margin-top:clamp(20px,3vw,40px); font-family:system-ui,Helvetica,Arial,sans-serif; font-size:clamp(10px,0.85vw,12px); letter-spacing:0.22em; text-transform:uppercase; color:rgba(0,0,0,0.3);\">Frame</span></div></section>"
  }

  ];

  if(window.SB_registerStyleSystems){
    window.SB_registerStyleSystems(STYLE_SYSTEMS);
  }else{
    window.SB_PENDING_STYLE_SYSTEMS=Object.assign(
      window.SB_PENDING_STYLE_SYSTEMS||{},
      STYLE_SYSTEMS
    );
  }

  if(window.SB_registerTemplates){
    window.SB_registerTemplates(LIBRARY);
  }else{
    window.SB_PENDING_TEMPLATES=(window.SB_PENDING_TEMPLATES||[]).concat(LIBRARY);
  }
})();
