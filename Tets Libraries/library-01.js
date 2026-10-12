/* ============================================================
   library.js — единый самозагружающийся файл шаблонов.
   Сгенерировано Sandbox. Шаблонов: 1
   Заменяет пак-файлы (pack.*.js). Кладётся в templates/.
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
    tpl:"styleguideCustomerPortraits", family:"about", group:"Секции",
    label:"Гайдстайл с текстом и сеткой 4x4", code:"A-01", icon:"☷",
    kind:"static",
    desc:"Секция стайл-гайда с подробным текстовым описанием слева и плотной фото-сеткой 4x4 справа.",
    styleSystem:"style-1785151699871",
    favorite:false,
    aspect:"16:9",
    canvas:{"width":1920,"height":1080},
    build:i=>`<section class='sv-section' style='background: #ffffff; color: #111111; padding: 40px var(--pad, 40px); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'> <div class='sv-inner' style='max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 380px 1fr; gap: 48px;'> <div style='display: flex; flex-direction: column; justify-content: space-between;'> <div> <h2 data-sb-editable data-slot='title' data-role='title' style='font-size: 20px; font-weight: 600; margin: 0 0 20px;'>Customer Portraits</h2> <p data-sb-editable data-slot='intro' data-role='body' style='font-size: 11px; line-height: 1.5; color: #333; margin-bottom: 20px;'>Our customer portraits evoke a sense of everyday wellbeing and highlight the authentic human element of our brand. Our diverse customer archetypes, wardrobe styling, and variety of home environments convey a wide range of customers and their unique personal styles.</p> <div style='font-size: 11px; line-height: 1.5; color: #333;'> <p style='margin: 0 0 6px; font-weight: 500;'>Characteristics:</p> <ul style='padding-left: 14px; margin: 0 0 20px;'> <li>Portraits should always feel warm and inviting</li> <li>Scenes have general optimism, conveying positive energy</li> <li>The model and scene should never feel somber</li> <li>Mix of candid and lightly posed</li> <li>Lamp can be used literally or abstractly as a light source</li> <li>Variety of depth, angle, position, and movement</li> </ul> <p style='margin: 0 0 6px; font-weight: 500;'>Usage:</p> <ul style='padding-left: 14px; margin: 0;'> <li>Homepage</li> <li>Social Media</li> <li>Gifts Page</li> <li>Paired with a Creative Product Image</li> </ul> </div> </div> <div style='font-size: 11px; font-weight: 600; margin-top: 40px;'>GANTRI <span style='font-weight: 400; color: #777;'>Content Style Guide</span></div> </div> <div style='display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;'> <div class='sv-media' data-sb-media data-slot='p1' data-kind='image' style='aspect-ratio: 1; background: #e3c498;'></div> <div class='sv-media' data-sb-media data-slot='p2' data-kind='image' style='aspect-ratio: 1; background: #d3a478;'></div> <div class='sv-media' data-sb-media data-slot='p3' data-kind='image' style='aspect-ratio: 1; background: #331d10;'></div> <div class='sv-media' data-sb-media data-slot='p4' data-kind='image' style='aspect-ratio: 1; background: #3b5998;'></div> <div class='sv-media' data-sb-media data-slot='p5' data-kind='image' style='aspect-ratio: 1; background: #f2cbab;'></div> <div class='sv-media' data-sb-media data-slot='p6' data-kind='image' style='aspect-ratio: 1; background: #c2aa91;'></div> <div class='sv-media' data-sb-media data-slot='p7' data-kind='image' style='aspect-ratio: 1; background: #926d52;'></div> <div class='sv-media' data-sb-media data-slot='p8' data-kind='image' style='aspect-ratio: 1; background: #d09d73;'></div> <div class='sv-media' data-sb-media data-slot='p9' data-kind='image' style='aspect-ratio: 1; background: #5a3c28;'></div> <div class='sv-media' data-sb-media data-slot='p10' data-kind='image' style='aspect-ratio: 1; background: #8c7362;'></div> <div class='sv-media' data-sb-media data-slot='p11' data-kind='image' style='aspect-ratio: 1; background: #68503f;'></div> <div class='sv-media' data-sb-media data-slot='p12' data-kind='image' style='aspect-ratio: 1; background: #bca085;'></div> <div class='sv-media' data-sb-media data-slot='p13' data-kind='image' style='aspect-ratio: 1; background: #402b21;'></div> <div class='sv-media' data-sb-media data-slot='p14' data-kind='image' style='aspect-ratio: 1; background: #88654a;'></div> <div class='sv-media' data-sb-media data-slot='p15' data-kind='image' style='aspect-ratio: 1; background: #2a1f18;'></div> <div class='sv-media' data-sb-media data-slot='p16' data-kind='image' style='aspect-ratio: 1; background: #c58d63;'></div> <div class='sv-media' data-sb-media data-slot='p17' data-kind='image' style='aspect-ratio: 1; background: #8b6851;'></div> <div class='sv-media' data-sb-media data-slot='p18' data-kind='image' style='aspect-ratio: 1; background: #69574d;'></div> <div class='sv-media' data-sb-media data-slot='p19' data-kind='image' style='aspect-ratio: 1; background: #4a3a30;'></div> <div class='sv-media' data-sb-media data-slot='p20' data-kind='image' style='aspect-ratio: 1; background: #261912;'></div> </div> </div> </section>`
  }

  ];
  if(window.SB_registerStyleSystems){ window.SB_registerStyleSystems(STYLE_SYSTEMS); }
  else{ window.SB_PENDING_STYLE_SYSTEMS=Object.assign(window.SB_PENDING_STYLE_SYSTEMS||{}, STYLE_SYSTEMS); }
  if(window.SB_registerTemplates){ window.SB_registerTemplates(LIBRARY); }
  else{ window.SB_PENDING_TEMPLATES=(window.SB_PENDING_TEMPLATES||[]).concat(LIBRARY); }
})();
