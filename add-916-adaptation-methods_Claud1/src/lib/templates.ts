// Тестовая библиотека шаблонов (аналог To_169.js) — 11 шаблонов 16:9,
// охватывающих все категории из ТЗ: типографическая обложка, одно крупное
// изображение, 2+ изображения, асимметричная сетка, текстово-медийный split,
// длинный текст, сетка карточек.
import { IMG, mediaTag } from "./assets";
import type { TemplateDef } from "./types";

const PAD = "80px";

export const TEMPLATES: TemplateDef[] = [
  // 1 — чистая типографическая обложка, медиа нет
  {
    id: "statementCoverTypo",
    code: "TYP-01",
    label: "Обложка — крупное высказывание без медиа",
    family: "cover",
    group: "Обложки",
    kind: "typographic",
    desc: "Единственный крупный типографический блок с двумя мета-строками. Медиа отсутствует.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#0d0d10; padding:${PAD} var(--pad); min-height:560px; display:flex; flex-direction:column; justify-content:center;">
      <div class="sv-inner" style="max-width:1200px; margin:0 auto; width:100%;">
        <div data-sb-editable data-slot="overline" data-role="overline" style="color:#8a8f98; font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:24px;">[ MANIFESTO / 01 ]</div>
        <h1 data-sb-editable data-slot="title" data-role="statement" style="color:#fff; font-size:clamp(40px,6vw,96px); line-height:0.98; font-weight:800; letter-spacing:-2px; margin:0 0 28px;">Design is not decoration. It is the architecture of attention.</h1>
        <div data-sb-editable data-slot="body" data-role="body" style="color:#b7bdc8; font-size:18px; line-height:1.6; max-width:640px;">Исследовательская студия визуального языка: системы, типографика и движение.</div>
      </div>
    </section>`,
  },

  // 2 — манифест с крупным медиа и 3-мя мета-колонками (hero-media)
  {
    id: "aboutManifestoStacked",
    code: "ABT-02",
    label: "О нас — манифест поверх медиа",
    family: "about",
    group: "Секции",
    kind: "hero-media",
    desc: "Центрированный манифест, под ним широкое панорамное медиа и три мета-колонки.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#F5F5F3; padding:${PAD} var(--pad); border-top:1px solid #E63B2B;">
      <div class="sv-inner" style="max-width:1200px; margin:0 auto;">
        <div data-sb-editable data-slot="tag" data-role="overline" style="color:#E63B2B; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:32px; text-align:center;">[ ABOUT &amp; MANIFESTO ]</div>
        <h2 data-sb-editable data-slot="manifesto" data-role="statement" style="color:#E63B2B; font-size:clamp(28px,4vw,64px); line-height:1.05; font-weight:700; letter-spacing:-1.5px; margin:0 auto 48px; max-width:900px; text-align:center;">We build visual languages through modular clarity and precise grid mechanics.</h2>
        ${mediaTag({ src: IMG.architecture1, alt: "hero", aspect: "2.6/1", dataAttrs: 'data-sb-editable data-slot="aboutMedia" data-sb-media', extraStyle: "margin-bottom:32px;" })}
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:24px; border-top:1px solid #E63B2B; padding-top:24px;">
          <div><div data-sb-editable data-slot="m1Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">FOUNDED</div><div data-sb-editable data-slot="m1Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">2024 / ZÜRICH</div></div>
          <div><div data-sb-editable data-slot="m2Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">DISCIPLINE</div><div data-sb-editable data-slot="m2Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">BRAND &amp; UI SYSTEM</div></div>
          <div><div data-sb-editable data-slot="m3Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">METHOD</div><div data-sb-editable data-slot="m3Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">BYBLOCKS® SYSTEM</div></div>
        </div>
      </div>
    </section>`,
  },

  // 3 — асимметричный split: крупное изображение + текст (одно главное медиа)
  {
    id: "heroSplitAsymmetric",
    code: "HRO-03",
    label: "Герой — асимметричный сплит текст/медиа",
    family: "hero",
    group: "Секции",
    kind: "hero-media",
    desc: "60/40: крупное изображение слева, заголовок и подпись справа.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#101014; padding:0;">
      <div class="sv-inner" style="display:grid; grid-template-columns:1.4fr 1fr; min-height:620px;">
        ${mediaTag({ src: IMG.portrait2, alt: "hero portrait", aspect: "4/3", dataAttrs: 'data-sb-editable data-slot="heroMedia" data-sb-media', extraStyle: "height:100%;" })}
        <div style="display:flex; flex-direction:column; justify-content:center; padding:56px;">
          <div data-sb-editable data-slot="overline" data-role="overline" style="color:#ff5b6a; font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:18px;">COLLECTION 04</div>
          <h2 data-sb-editable data-slot="title" data-role="title" style="color:#fff; font-size:clamp(28px,3.4vw,48px); line-height:1.08; font-weight:700; margin:0 0 20px;">Silhouettes built from light and shadow.</h2>
          <div data-sb-editable data-slot="body" data-role="body" style="color:#b3b8c2; font-size:15px; line-height:1.7;">Съёмка студийного света как самостоятельного материала формы.</div>
        </div>
      </div>
    </section>`,
  },

  // 4 — проблемный кейс: два изображения рядом в середине + подпись
  {
    id: "twoImageFeature",
    code: "IMG-04",
    label: "Две картинки рядом + подпись",
    family: "feature",
    group: "Секции",
    kind: "multi-media",
    desc: "Классический проблемный случай: два изображения side-by-side в центре горизонтальной композиции.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#fff; padding:${PAD} var(--pad);">
      <div class="sv-inner" style="max-width:1300px; margin:0 auto;">
        <h2 data-sb-editable data-slot="title" data-role="title" style="font-size:clamp(26px,3vw,42px); font-weight:700; margin:0 0 32px; color:#111;">Before &amp; after the system</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:28px;">
          ${mediaTag({ src: IMG.city1, alt: "before", aspect: "4/3", dataAttrs: 'data-sb-editable data-slot="imgA" data-sb-media' })}
          ${mediaTag({ src: IMG.city2, alt: "after", aspect: "4/3", dataAttrs: 'data-sb-editable data-slot="imgB" data-sb-media' })}
        </div>
        <div data-sb-editable data-slot="caption" data-role="body" style="margin-top:20px; color:#555; font-size:14px; line-height:1.6; max-width:640px;">Слева — хаотичный уличный свет, справа — тот же кадр после калибровки палитры.</div>
      </div>
    </section>`,
  },

  // 5 — чисто текстовая двухколоночная композиция (контакт)
  {
    id: "contactSplitTwoColumn",
    code: "C-11",
    label: "Контакт: заголовок слева, реквизиты справа",
    family: "contact",
    group: "Секции",
    kind: "text-split",
    desc: "Двухколоночный контакт: overline/title/body слева; справа пары label+value.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#ffffff; padding:${PAD} var(--pad);">
      <div class="sv-inner" style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1.1fr 0.9fr; gap:80px; align-items:start;">
        <div style="display:flex; flex-direction:column; gap:18px;">
          <div data-sb-editable data-slot="overline" data-role="overline" style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#8a8f98;">Contact</div>
          <h2 data-sb-editable data-slot="title" data-role="title" style="font-size:clamp(36px,4.5vw,56px); font-weight:500; line-height:1.08; margin:0; color:#0a0e18;">Contact</h2>
          <div data-sb-editable data-slot="body" data-role="body" style="font-size:16px; line-height:1.7; color:#3a3f4b; max-width:420px;">Открыт к сотрудничеству с брендами, студиями, агентствами и командами, которым нужен visual direction.</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:26px; padding-top:36px;">
          <div style="display:flex; flex-direction:column; gap:6px;"><div data-sb-editable data-slot="labelEmail" data-role="label" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Email</div><div data-sb-editable data-slot="valueEmail" data-role="link" style="font-size:16px; color:#0a0e18;">hello@example.com</div></div>
          <div style="display:flex; flex-direction:column; gap:6px;"><div data-sb-editable data-slot="labelTelegram" data-role="label" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Telegram</div><div data-sb-editable data-slot="valueTelegram" data-role="link" style="font-size:16px; color:#0a0e18;">@telegram</div></div>
          <div style="display:flex; flex-direction:column; gap:6px;"><div data-sb-editable data-slot="labelSocial" data-role="label" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Behance / Instagram</div><div data-sb-editable data-slot="valueSocial" data-role="link" style="font-size:16px; color:#0a0e18; white-space:pre-line;">behance.net/name
instagram.com/name</div></div>
        </div>
      </div>
    </section>`,
  },

  // 6 — услуги: повторяющиеся строки
  {
    id: "servicesRepeatRows",
    code: "SRV-02",
    label: "Услуги — строчный список с повторами",
    family: "services",
    group: "Секции",
    kind: "cards",
    desc: "Динамический список услуг в виде горизонтальных строк.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#F5F5F3; padding:${PAD} var(--pad); border-top:1px solid #E63B2B;">
      <div class="sv-inner" style="max-width:1400px; margin:0 auto;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:48px;">
          <h2 data-sb-editable data-slot="srvHeader" data-role="title" style="color:#E63B2B; font-size:clamp(32px,4vw,56px); font-weight:700; line-height:1; letter-spacing:-1px; margin:0;">CAPABILITIES</h2>
          <div data-sb-editable data-slot="srvMeta" data-role="smallMeta" style="color:#E63B2B; font-size:11px; font-weight:700;">(SCOPE OF WORK)</div>
        </div>
        <div data-sb-repeat="servicesRows" style="display:flex; flex-direction:column;">
          <div style="display:grid; grid-template-columns:60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;"><span data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">01</span><h3 data-role="title" style="color:#E63B2B; font-size:22px; font-weight:700; margin:0;">ART DIRECTION</h3><p data-role="body" style="color:#E63B2B; font-size:13px; line-height:1.5; margin:0;">Визуальные стратегии и архитектурные библиотеки активов.</p></div>
          <div style="display:grid; grid-template-columns:60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;"><span data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">02</span><h3 data-role="title" style="color:#E63B2B; font-size:22px; font-weight:700; margin:0;">MOTION SYSTEMS</h3><p data-role="body" style="color:#E63B2B; font-size:13px; line-height:1.5; margin:0;">Кинетическая типографика и модульные переходы.</p></div>
          <div style="display:grid; grid-template-columns:60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;"><span data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">03</span><h3 data-role="title" style="color:#E63B2B; font-size:22px; font-weight:700; margin:0;">BRAND SYSTEMS</h3><p data-role="body" style="color:#E63B2B; font-size:13px; line-height:1.5; margin:0;">Полные гайдлайны и библиотеки компонентов.</p></div>
        </div>
      </div>
    </section>`,
  },

  // 7 — швейцарская модульная матрица (заголовок + медиа + текст + теги)
  {
    id: "swissTypographicMatrix",
    code: "SW-02",
    label: "Швейцарская модульная матрица концепта",
    family: "process",
    group: "Секции",
    kind: "hero-media",
    desc: "Строгая типографика, одно медиа и короткое описание с тегами.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#F7F6F2; padding:56px var(--pad);">
      <div class="sv-inner" style="max-width:1050px; margin:0 auto; border:1px solid #111; padding:28px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:28px;">
          <div data-sb-editable data-slot="code" data-role="overline" style="font-size:11px; font-weight:700;">©27 FLOWS // MODULAR MOTION</div>
          <div data-sb-editable data-slot="ref" data-role="smallMeta" style="font-size:11px;">РИС. C3(23) [3–28 АПР 2023]</div>
        </div>
        <h2 data-sb-editable data-slot="title" data-role="title" style="font-size:clamp(30px,4vw,54px); font-weight:800; line-height:1.05; margin:0 0 24px;">С→С→С→СВОДЫ // ОПЕН-КОЛЛ</h2>
        ${mediaTag({ src: IMG.architecture3, alt: "matrix", aspect: "16/10", dataAttrs: 'data-sb-editable data-slot="matrixMedia" data-sb-media', extraStyle: "margin-bottom:16px;" })}
        <div data-sb-editable data-slot="desc" data-role="body" style="font-size:13px; line-height:1.5; max-width:520px; margin-bottom:16px;">Строгая типографическая система, совмещающая кинетическую формулу и векторную структуру.</div>
        <div style="display:flex; gap:8px;"><span data-role="pill" style="border:1px solid #111; padding:4px 10px; font-size:11px;">COLLAB</span><span data-role="pill" style="background:#111; color:#fff; padding:4px 10px; font-size:11px;">SEASON 3</span></div>
      </div>
    </section>`,
  },

  // 8 — индекс с двумя медиа-формулами side-by-side (multi-media)
  {
    id: "swissTypoIndexHero",
    code: "SW-05",
    label: "Швейцарский типографический индекс (Авангард)",
    family: "hero",
    group: "Обложка проекта",
    kind: "multi-media",
    desc: "Крупный заголовок, описание и два равных медиа-блока рядом.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#fff; padding:${PAD} var(--pad);">
      <div class="sv-inner" style="max-width:1200px; margin:0 auto;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #111; padding-bottom:12px; margin-bottom:28px;">
          <div><div data-sb-editable data-slot="brand" data-role="overline" style="font-size:12px; font-weight:700;">JO/GA* KINETIC INDEX</div><div data-sb-editable data-slot="sub" data-role="smallMeta" style="font-size:11px; color:#666;">LDN ч (016)© MOTION SYSTEM</div></div>
          <div data-sb-editable data-slot="page" data-role="smallMeta" style="font-size:12px;">[ 01/04 ]</div>
        </div>
        <h1 data-sb-editable data-slot="title" data-role="headline" style="font-size:clamp(34px,4.6vw,64px); font-weight:800; line-height:1.02; letter-spacing:-1px; margin:0 0 20px;">DESIGN INDEX (—) KINETIC Ⅰ. (016)©</h1>
        <div data-sb-editable data-slot="desc" data-role="body" style="font-size:14px; line-height:1.5; max-width:520px; margin-bottom:28px; color:#333;">Концептуальная визуализация взаимодействия пространственных форм, типографики и векторного движения.</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; border-top:1px solid #111; padding-top:24px;">
          <div>${mediaTag({ src: IMG.product1, alt: "formula 1", aspect: "1/1", dataAttrs: 'data-sb-editable data-slot="f1Media" data-sb-media' })}<div data-sb-editable data-slot="f1Cap" data-role="caption" style="font-size:11px; margin-top:8px; color:#444;">Ускорение + Сдвиг осей = Кинетический ритм</div></div>
          <div>${mediaTag({ src: IMG.product2, alt: "formula 2", aspect: "1/1", dataAttrs: 'data-sb-editable data-slot="f2Media" data-sb-media' })}<div data-sb-editable data-slot="f2Cap" data-role="caption" style="font-size:11px; margin-top:8px; color:#444;">Форма + Контекст = Трансформация восприятия</div></div>
        </div>
      </div>
    </section>`,
  },

  // 9 — сетка карточек портфолио (cards / повторы)
  {
    id: "portfolioCardGrid",
    code: "PRT-06",
    label: "Портфолио — сетка из шести карточек",
    family: "portfolio",
    group: "Секции",
    kind: "cards",
    desc: "Регулярная сетка карточек: изображение + подпись, повторяющийся элемент.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#101014; padding:${PAD} var(--pad);">
      <div class="sv-inner" style="max-width:1300px; margin:0 auto;">
        <h2 data-sb-editable data-slot="title" data-role="title" style="color:#fff; font-size:clamp(26px,3vw,42px); font-weight:700; margin:0 0 32px;">Selected works</h2>
        <div data-sb-repeat="cards" style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px;">
          <div>${mediaTag({ src: IMG.city3, alt: "case 1", aspect: "4/5", dataAttrs: 'data-sb-media data-slot="c1"' })}<div data-role="rowTitle" style="color:#fff; font-size:13px; margin-top:10px;">Nocturne Series</div></div>
          <div>${mediaTag({ src: IMG.architecture2, alt: "case 2", aspect: "4/5", dataAttrs: 'data-sb-media data-slot="c2"' })}<div data-role="rowTitle" style="color:#fff; font-size:13px; margin-top:10px;">Concrete Index</div></div>
          <div>${mediaTag({ src: IMG.portrait3, alt: "case 3", aspect: "4/5", dataAttrs: 'data-sb-media data-slot="c3"' })}<div data-role="rowTitle" style="color:#fff; font-size:13px; margin-top:10px;">Studio Light</div></div>
          <div>${mediaTag({ src: IMG.product3, alt: "case 4", aspect: "4/5", dataAttrs: 'data-sb-media data-slot="c4"' })}<div data-role="rowTitle" style="color:#fff; font-size:13px; margin-top:10px;">Object Index</div></div>
          <div>${mediaTag({ src: IMG.architecture1, alt: "case 5", aspect: "4/5", dataAttrs: 'data-sb-media data-slot="c5"' })}<div data-role="rowTitle" style="color:#fff; font-size:13px; margin-top:10px;">Façade Grid</div></div>
          <div>${mediaTag({ src: IMG.city1, alt: "case 6", aspect: "4/5", dataAttrs: 'data-sb-media data-slot="c6"' })}<div data-role="rowTitle" style="color:#fff; font-size:13px; margin-top:10px;">Afterglow</div></div>
        </div>
      </div>
    </section>`,
  },

  // 10 — длинный текстовый блок (longform)
  {
    id: "longformEditorial",
    code: "LNG-07",
    label: "Редакционная колонка — длинный текст",
    family: "editorial",
    group: "Секции",
    kind: "longform",
    desc: "Длинная текстовая колонка с цитатой и одним сопровождающим изображением.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#FBFAF7; padding:${PAD} var(--pad);">
      <div class="sv-inner" style="max-width:820px; margin:0 auto;">
        <div data-sb-editable data-slot="overline" data-role="overline" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98; margin-bottom:16px;">Field notes</div>
        <h2 data-sb-editable data-slot="title" data-role="title" style="font-size:clamp(28px,3.2vw,44px); font-weight:700; margin:0 0 24px; color:#15181f;">On the discipline of restraint in visual systems</h2>
        <div data-sb-editable data-slot="body" data-role="body" style="font-size:16px; line-height:1.8; color:#30343c; margin-bottom:24px;">Хорошая система не кричит — она выстраивает порядок считывания. Чем меньше случайных решений принимает дизайнер в моменте, тем устойчивее выглядит продукт в разных контекстах и носителях. Мы изучаем сетки, модули и шаг ритма как язык, а не как украшение.</div>
        <blockquote data-sb-editable data-slot="quote" data-role="quote" style="font-size:20px; line-height:1.5; font-style:italic; color:#15181f; border-left:3px solid #15181f; padding-left:20px; margin:0 0 24px;">«Ограничение — это не отсутствие свободы, а источник узнаваемости».</blockquote>
        ${mediaTag({ src: IMG.architecture2, alt: "editorial", aspect: "16/9", dataAttrs: 'data-sb-editable data-slot="inlineMedia" data-sb-media', extraStyle: "margin-bottom:24px;" })}
        <div data-sb-editable data-slot="body2" data-role="body" style="font-size:16px; line-height:1.8; color:#30343c;">Поэтому каждый новый формат — это не копирование старого макета, а новый вопрос: что здесь действительно главное.</div>
      </div>
    </section>`,
  },

  // 11 — асимметричная сетка (крупное изображение + текст + мелкое доп. медиа)
  {
    id: "asymmetricGridFeature",
    code: "ASY-08",
    label: "Асимметричная сетка — медиа + текст + акцент",
    family: "feature",
    group: "Секции",
    kind: "multi-media",
    desc: "Асимметрия: большое изображение, блок текста и маленькое дополнительное фото-акцент.",
    width: 1440,
    build: () => `<section class="sv-section" style="background:#ffffff; padding:${PAD} var(--pad);">
      <div class="sv-inner" style="max-width:1300px; margin:0 auto; display:grid; grid-template-columns:1.3fr 0.9fr; gap:32px;">
        ${mediaTag({ src: IMG.portrait1, alt: "primary", aspect: "3/4", dataAttrs: 'data-sb-editable data-slot="primaryMedia" data-sb-media' })}
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div data-sb-editable data-slot="overline" data-role="overline" style="font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#888;">STUDY 02</div>
          <h2 data-sb-editable data-slot="title" data-role="title" style="font-size:clamp(24px,2.8vw,38px); font-weight:700; line-height:1.1; margin:0; color:#111;">Weight, texture and the geometry of stillness.</h2>
          <div data-sb-editable data-slot="body" data-role="body" style="font-size:14px; line-height:1.7; color:#444;">Небольшая серия о материальности света на портретной съёмке.</div>
          ${mediaTag({ src: IMG.city2, alt: "accent", aspect: "4/3", dataAttrs: 'data-sb-editable data-slot="accentMedia" data-sb-media', extraStyle: "margin-top:auto;" })}
        </div>
      </div>
    </section>`,
  },
];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
