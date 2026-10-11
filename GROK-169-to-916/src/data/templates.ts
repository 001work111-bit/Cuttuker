import type { LibraryPack, TemplateMeta } from "../engine/types";

function t(
  partial: Omit<TemplateMeta, "html"> & { html: string }
): TemplateMeta {
  return partial;
}

const TEMPLATES: TemplateMeta[] = [
  t({
    tpl: "aboutManifestoStacked",
    family: "about",
    group: "Секции",
    label: "О нас — Вертикальный манифест поверх медиа",
    code: "ABT-02",
    icon: "◨",
    kind: "static",
    desc: "Центрированный крупный манифест с оверлайном сверху, снизу — широкое панорамное медиа и трёхколоночная строка мета-параметров.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#F5F5F3; padding: clamp(60px,8vh,120px) var(--pad); border-top: 1px solid #E63B2B;">
  <div class="sv-inner" style="max-width:1200px; margin:0 auto;">
    <div data-sb-editable="" data-slot="tag" data-role="overline" style="color:#E63B2B; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:32px; text-align:center;">[ ABOUT &amp; MANIFESTO ]</div>
    <h2 data-sb-editable="" data-slot="manifesto" data-role="statement" style="color:#E63B2B; font-size:clamp(28px,4vw,64px); line-height:1.05; font-weight:700; letter-spacing:-1.5px; margin:0 auto 48px; max-width:900px; text-align:center;">We build visual languages through modular clarity and precise grid mechanics.</h2>
    <div class="sv-media" data-sb-media="" data-slot="aboutMedia" data-kind="image" style="aspect-ratio: 2.6/1; background:#E63B2B; margin-bottom:32px;"></div>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:24px; border-top:1px solid #E63B2B; padding-top:24px;">
      <div>
        <div data-sb-editable="" data-slot="m1Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">FOUNDED</div>
        <div data-sb-editable="" data-slot="m1Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">2024 / ZÜRICH</div>
      </div>
      <div>
        <div data-sb-editable="" data-slot="m2Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">DISCIPLINE</div>
        <div data-sb-editable="" data-slot="m2Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">BRAND &amp; UI SYSTEM</div>
      </div>
      <div>
        <div data-sb-editable="" data-slot="m3Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">METHOD</div>
        <div data-sb-editable="" data-slot="m3Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">BYBLOCKS® SYSTEM</div>
      </div>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "servicesRepeatRows",
    family: "services",
    group: "Секции",
    label: "Услуги — Строчный список с повторами",
    code: "SRV-02",
    icon: "≡",
    kind: "auto",
    desc: "Динамический список услуг в виде горизонтальных строк: номер, заголовок и описание в одну линию с разделителями.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#F5F5F3; padding: clamp(60px,8vh,120px) var(--pad); border-top: 1px solid #E63B2B;">
  <div class="sv-inner" style="max-width:1400px; margin:0 auto;">
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:48px;">
      <h2 data-sb-editable="" data-slot="srvHeader" data-role="title" style="color:#E63B2B; font-size:clamp(32px,4vw,56px); font-weight:700; line-height:1; letter-spacing:-1px; margin:0;">CAPABILITIES</h2>
      <div data-sb-editable="" data-slot="srvMeta" data-role="smallMeta" style="color:#E63B2B; font-size:11px; font-weight:700;">(SCOPE OF WORK)</div>
    </div>
    <div data-sb-repeat="servicesRows" style="display:flex; flex-direction:column;">
      <div style="display:grid; grid-template-columns: 60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;">
        <span data-sb-editable="" data-slot="rowNum" data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">01</span>
        <h3 data-sb-editable="" data-slot="rowTitle" data-role="title" style="color:#E63B2B; font-size:clamp(20px,2.2vw,32px); font-weight:700; margin:0; letter-spacing:-0.5px;">ART DIRECTION</h3>
        <p data-sb-editable="" data-slot="rowBody" data-role="body" style="color:#E63B2B; font-size:12px; line-height:1.5; margin:0;">Curating modern visual strategies, concepts, and architectural asset libraries with a rigorous editorial approach.</p>
      </div>
      <div style="display:grid; grid-template-columns: 60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;">
        <span data-sb-editable="" data-slot="rowNum" data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">02</span>
        <h3 data-sb-editable="" data-slot="rowTitle" data-role="title" style="color:#E63B2B; font-size:clamp(20px,2.2vw,32px); font-weight:700; margin:0; letter-spacing:-0.5px;">MOTION SYSTEMS</h3>
        <p data-sb-editable="" data-slot="rowBody" data-role="body" style="color:#E63B2B; font-size:12px; line-height:1.5; margin:0;">Kinetic identities, looping sequences and frame-accurate typography for spatial and digital environments.</p>
      </div>
      <div style="display:grid; grid-template-columns: 60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;">
        <span data-sb-editable="" data-slot="rowNum" data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">03</span>
        <h3 data-sb-editable="" data-slot="rowTitle" data-role="title" style="color:#E63B2B; font-size:clamp(20px,2.2vw,32px); font-weight:700; margin:0; letter-spacing:-0.5px;">SPATIAL IDENTITY</h3>
        <p data-sb-editable="" data-slot="rowBody" data-role="body" style="color:#E63B2B; font-size:12px; line-height:1.5; margin:0;">Signage, exhibition graphics and modular wayfinding built on the same typographic grid as the core brand.</p>
      </div>
      <div style="display:grid; grid-template-columns: 60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; border-bottom:1px solid #E63B2B; padding:24px 0;">
        <span data-sb-editable="" data-slot="rowNum" data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">04</span>
        <h3 data-sb-editable="" data-slot="rowTitle" data-role="title" style="color:#E63B2B; font-size:clamp(20px,2.2vw,32px); font-weight:700; margin:0; letter-spacing:-0.5px;">TYPE ENGINEERING</h3>
        <p data-sb-editable="" data-slot="rowBody" data-role="body" style="color:#E63B2B; font-size:12px; line-height:1.5; margin:0;">Custom lettering, variable font specs and production-ready typesetting for campaign and product surfaces.</p>
      </div>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "contactSplitTwoColumn",
    family: "contact",
    group: "Секции",
    label: "Контакт: заголовок слева, реквизиты справа",
    code: "C-11",
    icon: "✉",
    kind: "static",
    desc: "Двухколоночный контакт: overline/title/body слева; справа пары label+value для email, telegram и соцсетей.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#ffffff; padding:clamp(80px,10vh,140px) var(--pad);">
  <div class="sv-inner" style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1.1fr 0.9fr; gap:clamp(48px,6vw,96px); align-items:start;">
    <div style="display:flex; flex-direction:column; gap:clamp(14px,1.8vw,22px);">
      <div data-sb-editable="" data-slot="overline" data-role="overline" style="font-size:clamp(11px,1vw,13px); letter-spacing:0.14em; text-transform:uppercase; color:#8a8f98;">Contact</div>
      <h2 data-sb-editable="" data-slot="title" data-role="title" style="font-size:clamp(36px,4.5vw,56px); font-weight:500; line-height:1.08; margin:0; color:#0a0e18;">Contact</h2>
      <div data-sb-editable="" data-slot="body" data-role="body" style="font-size:clamp(15px,1.3vw,18px); line-height:1.7; color:#3a3f4b; max-width:420px;">Открыт к сотрудничеству с брендами, студиями, агентствами и командами, которым нужен visual direction, concept development или production-ready visual language.</div>
    </div>
    <div style="display:flex; flex-direction:column; gap:clamp(22px,2.5vw,32px); padding-top:clamp(28px,3vw,48px);">
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div data-sb-editable="" data-slot="labelEmail" data-role="label" style="font-size:clamp(11px,1vw,12px); letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Email</div>
        <div data-sb-editable="" data-slot="valueEmail" data-role="link" style="font-size:clamp(15px,1.3vw,18px); color:#0a0e18;">hello@example.com</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div data-sb-editable="" data-slot="labelTelegram" data-role="label" style="font-size:clamp(11px,1vw,12px); letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Telegram</div>
        <div data-sb-editable="" data-slot="valueTelegram" data-role="link" style="font-size:clamp(15px,1.3vw,18px); color:#0a0e18;">@telegram</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div data-sb-editable="" data-slot="labelSocial" data-role="label" style="font-size:clamp(11px,1vw,12px); letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Behance / Website / Instagram</div>
        <div data-sb-editable="" data-slot="valueSocial" data-role="link" style="font-size:clamp(15px,1.3vw,18px); color:#0a0e18; white-space:pre-line;">behance.net/name
instagram.com/name</div>
      </div>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "swissTypographicMatrix_2",
    family: "process",
    group: "Секции",
    label: "Швейцарская модульная матрица концепта",
    code: "SW-02",
    icon: "▦",
    kind: "static",
    desc: "Асимметричная матрица: крупный заголовок, медиа слева и редакционный текст с тегами справа.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#F3F1EC; padding: clamp(48px,6vh,88px) var(--pad);">
  <div class="sv-inner" style="max-width:1280px; margin:0 auto; border:1px solid #111; padding:28px 32px 32px; background:#F7F6F2;">
    <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:10px;">
      <div data-sb-editable="" data-slot="kicker" data-role="overline" style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#111;">027 FLOWS // MODULAR MOTION</div>
      <div data-sb-editable="" data-slot="meta" data-role="smallMeta" style="font-size:11px; letter-spacing:0.08em; color:#111;">РИС. C3 (23) [3–28 АПР 2023]</div>
    </div>
    <div style="border-top:1px solid #111; margin-bottom:22px;"></div>
    <h1 data-sb-editable="" data-slot="title" data-role="title" style="font-size:clamp(42px,5.4vw,78px); line-height:0.92; font-weight:700; letter-spacing:-0.045em; margin:0 0 28px; color:#111;">C→C→C→СВОДЫ // ОПЕН-<br>КОЛЛ</h1>
    <div style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:28px; align-items:stretch;">
      <div class="sv-media" data-sb-media="" data-slot="MOTION_RESULT_PREVIEW.MP4" data-kind="video" style="aspect-ratio: 1.7/1; background:#E4E2DC; min-height:280px; display:flex; align-items:center; justify-content:center; color:#8a867c; font-size:11px; letter-spacing:0.12em;">[ MOTION_RESULT_PREVIEW.MP4 ]</div>
      <div style="display:flex; flex-direction:column; justify-content:flex-end; gap:18px; padding-bottom:4px;">
        <p data-sb-editable="" data-slot="body" data-role="body" style="margin:0; font-size:13px; line-height:1.55; color:#111; max-width:360px;">Строгая типографическая система, совмещающая кинетическую формулу и векторную структуру. Каждая итерация кадра выстроена по законам Баухауса.</p>
        <div style="display:flex; gap:8px; align-items:center;">
          <span data-sb-editable="" data-slot="tag1" data-role="label" style="border:1px solid #111; padding:5px 8px; font-size:10px; letter-spacing:0.12em; text-transform:uppercase;">COLLAB</span>
          <span data-sb-editable="" data-slot="tag2" data-role="label" style="background:#111; color:#fff; padding:5px 8px; font-size:10px; letter-spacing:0.12em; text-transform:uppercase;">SEASON 3</span>
        </div>
      </div>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "swissTypoIndexHero_2",
    family: "hero",
    group: "Библиотека проекта",
    label: "Швейцарский типографический индекс (Авангард)",
    code: "SW-05",
    icon: "▣",
    kind: "static",
    desc: "Крупный типографический индекс с двумя медиаформулами в нижней трети кадра.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#ffffff; padding: 44px 52px 48px; color:#111;">
  <div class="sv-inner" style="max-width:1320px; margin:0 auto;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
      <div>
        <div data-sb-editable="" data-slot="kicker" data-role="overline" style="font-size:11px; letter-spacing:0.08em;">30/6A° KINETIC INDEX</div>
        <div data-sb-editable="" data-slot="sub" data-role="smallMeta" style="font-size:11px; letter-spacing:0.06em;">LDN ↓ (016)○ MOTION SYSTEM</div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:20px;height:20px;border:1px solid #111;border-radius:50%; display:grid; place-items:center; font-size:9px;">+</div>
        <div data-sb-editable="" data-slot="pager" data-role="smallMeta" style="font-size:11px; letter-spacing:0.08em;">[ 01/04 ]</div>
      </div>
    </div>
    <div style="border-top:1px solid #111; margin-bottom:28px;"></div>
    <h1 data-sb-editable="" data-slot="title" data-role="title" style="font-size:clamp(52px,6.4vw,96px); font-weight:700; line-height:0.9; letter-spacing:-0.045em; margin:0 0 28px;">DESIGN INDEX (—)<br>KINETIC ↓ (016)©</h1>
    <p data-sb-editable="" data-slot="body" data-role="body" style="font-size:18px; line-height:1.45; max-width:620px; margin:0 0 36px;">Концептуальная визуализация взаимодействия пространственных форм, типографики и векторного движения.</p>
    <div style="border-top:1px solid #111; margin-bottom:14px;"></div>
    <div style="display:grid; grid-template-columns: 1fr 1.42fr; gap:18px;">
      <div>
        <div style="display:flex; justify-content:space-between; font-size:10px; letter-spacing:0.1em; margin-bottom:8px;">
          <span data-sb-editable="" data-slot="f1k" data-role="label">FORMULA_01</span>
          <span data-sb-editable="" data-slot="f1v" data-role="label">[ VECTOR ]</span>
        </div>
        <div class="sv-media" data-sb-media="" data-slot="MOTION_LOOP_A.MP4" data-kind="video" style="aspect-ratio:1.12/1; background:#E8E6E0; display:flex; align-items:center; justify-content:center; color:#8a867c; font-size:11px; letter-spacing:0.1em;">[ MOTION_LOOP_A.MP4 ]</div>
        <div data-sb-editable="" data-slot="f1c" data-role="smallMeta" style="font-size:11px; margin-top:10px;">Ускорение + Сдвиг осей = Кинетический ритм</div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:10px; letter-spacing:0.1em; margin-bottom:8px;">
          <span data-sb-editable="" data-slot="f2k" data-role="label">FORMULA_02</span>
          <span data-sb-editable="" data-slot="f2v" data-role="label">[ SPACE ]</span>
        </div>
        <div class="sv-media" data-sb-media="" data-slot="MOTION_LOOP_B.MP4" data-kind="video" style="aspect-ratio:1.55/1; background:#E8E6E0; display:flex; align-items:center; justify-content:center; color:#8a867c; font-size:11px; letter-spacing:0.1em;">[ MOTION_LOOP_B.MP4 ]</div>
        <div data-sb-editable="" data-slot="f2c" data-role="smallMeta" style="font-size:11px; margin-top:10px;">Форма + Контекст = Трансформация восприятия</div>
      </div>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "heroCinematicSplit",
    family: "hero",
    group: "Секции",
    label: "Киногерой: титр слева, кадр справа",
    code: "HR-01",
    icon: "▶",
    kind: "static",
    desc: "Горизонтальный split 16:9 с крупным титром, метаданными и одним доминирующим медиа.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#0c0d10; color:#f4f1ea; padding: 0; min-height: 810px;">
  <div class="sv-inner" style="max-width:1440px; margin:0 auto; display:grid; grid-template-columns: 0.92fr 1.08fr; min-height:810px;">
    <div style="padding:64px 56px; display:flex; flex-direction:column; justify-content:space-between;">
      <div data-sb-editable="" data-slot="kicker" data-role="overline" style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#c9b59a;">Reel 04 · Studio Notes</div>
      <div>
        <h1 data-sb-editable="" data-slot="title" data-role="title" style="font-size:clamp(44px,5vw,72px); line-height:0.92; letter-spacing:-0.04em; font-weight:600; margin:0 0 22px;">SILENT<br>GEOMETRY<br>OF LIGHT</h1>
        <p data-sb-editable="" data-slot="body" data-role="body" style="font-size:16px; line-height:1.6; max-width:360px; color:#cfc8ba; margin:0;">Один кадр, собранный как архитектурный объект: свет, ритм и пустота в одной горизонтальной плоскости.</p>
      </div>
      <div style="display:flex; gap:32px;">
        <div>
          <div data-sb-editable="" data-slot="yK" data-role="label" style="font-size:10px; letter-spacing:0.14em; color:#8d8678;">YEAR</div>
          <div data-sb-editable="" data-slot="yV" data-role="smallMeta">2025</div>
        </div>
        <div>
          <div data-sb-editable="" data-slot="fK" data-role="label" style="font-size:10px; letter-spacing:0.14em; color:#8d8678;">FORMAT</div>
          <div data-sb-editable="" data-slot="fV" data-role="smallMeta">35mm / 4K</div>
        </div>
        <div>
          <div data-sb-editable="" data-slot="dK" data-role="label" style="font-size:10px; letter-spacing:0.14em; color:#8d8678;">DURATION</div>
          <div data-sb-editable="" data-slot="dV" data-role="smallMeta">00:18</div>
        </div>
      </div>
    </div>
    <div class="sv-media" data-sb-media="" data-slot="CINEMA_STILL.JPG" data-kind="image" style="background:#c4542a; min-height:810px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.55); letter-spacing:0.14em; font-size:12px;">[ CINEMA_STILL.JPG ]</div>
  </div>
</section>`,
  }),

  t({
    tpl: "workTripleCards",
    family: "work",
    group: "Секции",
    label: "Сетка карточек — три проекта",
    code: "WRK-03",
    icon: "▤",
    kind: "static",
    desc: "Повторяющаяся трёхколоночная сетка карточек с медиа, индексом и кратким описанием.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#f6f4ef; padding: 72px var(--pad); color:#171717;">
  <div class="sv-inner" style="max-width:1280px; margin:0 auto;">
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:36px;">
      <h2 data-sb-editable="" data-slot="title" data-role="title" style="font-size:42px; letter-spacing:-0.04em; margin:0; font-weight:650;">Selected work</h2>
      <div data-sb-editable="" data-slot="meta" data-role="smallMeta" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#6d6a63;">Index / 03</div>
    </div>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:22px;">
      <article>
        <div class="sv-media" data-sb-media="" data-slot="WORK_A.JPG" data-kind="image" style="aspect-ratio:4/5; background:#d9d4c8; display:flex; align-items:center; justify-content:center; color:#8a867c; font-size:11px; letter-spacing:0.1em; margin-bottom:14px;">[ WORK_A.JPG ]</div>
        <div data-sb-editable="" data-slot="aIdx" data-role="label" style="font-size:11px; letter-spacing:0.12em;">01 — ATELIER</div>
        <h3 data-sb-editable="" data-slot="aTitle" data-role="title" style="margin:6px 0 8px; font-size:20px;">Northern Pavilion</h3>
        <p data-sb-editable="" data-slot="aBody" data-role="body" style="margin:0; font-size:13px; line-height:1.5; color:#4a4741;">Identity and spatial graphics for a seasonal exhibition in Helsinki.</p>
      </article>
      <article>
        <div class="sv-media" data-sb-media="" data-slot="WORK_B.JPG" data-kind="image" style="aspect-ratio:4/5; background:#c8cfd9; display:flex; align-items:center; justify-content:center; color:#7b8290; font-size:11px; letter-spacing:0.1em; margin-bottom:14px;">[ WORK_B.JPG ]</div>
        <div data-sb-editable="" data-slot="bIdx" data-role="label" style="font-size:11px; letter-spacing:0.12em;">02 — MOTION</div>
        <h3 data-sb-editable="" data-slot="bTitle" data-role="title" style="margin:6px 0 8px; font-size:20px;">Atlas Loop</h3>
        <p data-sb-editable="" data-slot="bBody" data-role="body" style="margin:0; font-size:13px; line-height:1.5; color:#4a4741;">A 12-second kinetic index built from modular letterforms.</p>
      </article>
      <article>
        <div class="sv-media" data-sb-media="" data-slot="WORK_C.JPG" data-kind="image" style="aspect-ratio:4/5; background:#d9c8c8; display:flex; align-items:center; justify-content:center; color:#8a7c7c; font-size:11px; letter-spacing:0.1em; margin-bottom:14px;">[ WORK_C.JPG ]</div>
        <div data-sb-editable="" data-slot="cIdx" data-role="label" style="font-size:11px; letter-spacing:0.12em;">03 — EDITORIAL</div>
        <h3 data-sb-editable="" data-slot="cTitle" data-role="title" style="margin:6px 0 8px; font-size:20px;">Paper Grammar</h3>
        <p data-sb-editable="" data-slot="cBody" data-role="body" style="margin:0; font-size:13px; line-height:1.5; color:#4a4741;">Print system for a quarterly journal on architecture and type.</p>
      </article>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "processFourSteps",
    family: "process",
    group: "Секции",
    label: "Процесс — четыре горизонтальных шага",
    code: "PRC-03",
    icon: "→",
    kind: "static",
    desc: "Горизонтальная последовательность этапов с номерами и короткими описаниями.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#111318; color:#eeeae2; padding: 80px var(--pad);">
  <div class="sv-inner" style="max-width:1280px; margin:0 auto;">
    <div data-sb-editable="" data-slot="overline" data-role="overline" style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#9aa0aa; margin-bottom:16px;">Method</div>
    <h2 data-sb-editable="" data-slot="title" data-role="title" style="font-size:48px; letter-spacing:-0.04em; margin:0 0 40px; font-weight:600;">How a frame is built</h2>
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0; border-top:1px solid #3a3f49;">
      <div style="padding:28px 22px 8px 0; border-right:1px solid #3a3f49;">
        <div data-sb-editable="" data-slot="n1" data-role="smallMeta" style="font-size:12px; color:#8d93a0; margin-bottom:18px;">01</div>
        <h3 data-sb-editable="" data-slot="t1" data-role="title" style="margin:0 0 12px; font-size:20px;">Audit</h3>
        <p data-sb-editable="" data-slot="b1" data-role="body" style="margin:0; font-size:13px; line-height:1.55; color:#b7bcc6;">Collect existing assets, rhythm and constraints of the original 16:9 composition.</p>
      </div>
      <div style="padding:28px 22px 8px 22px; border-right:1px solid #3a3f49;">
        <div data-sb-editable="" data-slot="n2" data-role="smallMeta" style="font-size:12px; color:#8d93a0; margin-bottom:18px;">02</div>
        <h3 data-sb-editable="" data-slot="t2" data-role="title" style="margin:0 0 12px; font-size:20px;">Roles</h3>
        <p data-sb-editable="" data-slot="b2" data-role="body" style="margin:0; font-size:13px; line-height:1.55; color:#b7bcc6;">Mark title, body, media and meta so hierarchy can survive a format change.</p>
      </div>
      <div style="padding:28px 22px 8px 22px; border-right:1px solid #3a3f49;">
        <div data-sb-editable="" data-slot="n3" data-role="smallMeta" style="font-size:12px; color:#8d93a0; margin-bottom:18px;">03</div>
        <h3 data-sb-editable="" data-slot="t3" data-role="title" style="margin:0 0 12px; font-size:20px;">Recompose</h3>
        <p data-sb-editable="" data-slot="b3" data-role="body" style="margin:0; font-size:13px; line-height:1.55; color:#b7bcc6;">Rebuild the vertical sequence instead of squeezing columns into a stack.</p>
      </div>
      <div style="padding:28px 0 8px 22px;">
        <div data-sb-editable="" data-slot="n4" data-role="smallMeta" style="font-size:12px; color:#8d93a0; margin-bottom:18px;">04</div>
        <h3 data-sb-editable="" data-slot="t4" data-role="title" style="margin:0 0 12px; font-size:20px;">Proof</h3>
        <p data-sb-editable="" data-slot="b4" data-role="body" style="margin:0; font-size:13px; line-height:1.55; color:#b7bcc6;">Check overflow, cropping, type scale and whether empty space is intentional.</p>
      </div>
    </div>
  </div>
</section>`,
  }),

  t({
    tpl: "quotePortraitSplit",
    family: "about",
    group: "Секции",
    label: "Цитата и портрет — редакционный split",
    code: "QTE-02",
    icon: "“",
    kind: "static",
    desc: "Крупное заявление слева и вертикальный портретный кадр справа.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#faf8f4; padding: 64px var(--pad); color:#161616;">
  <div class="sv-inner" style="max-width:1240px; margin:0 auto; display:grid; grid-template-columns: 1.25fr 0.75fr; gap:48px; align-items:center;">
    <div>
      <div data-sb-editable="" data-slot="overline" data-role="overline" style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#8a8478; margin-bottom:22px;">Studio voice</div>
      <h2 data-sb-editable="" data-slot="quote" data-role="statement" style="font-size:clamp(32px,4vw,54px); line-height:1.12; letter-spacing:-0.03em; margin:0 0 28px; font-weight:550;">«Формат не должен сжимать мысль. Если кадр стал вертикальным — композиция обязана думать вертикально.»</h2>
      <p data-sb-editable="" data-slot="body" data-role="body" style="margin:0 0 26px; font-size:16px; line-height:1.6; max-width:520px; color:#3d3a34;">Мы не масштабируем 16:9 как картинку. Мы заново распределяем роли: заголовок, пауза, медиа, мета.</p>
      <div data-sb-editable="" data-slot="author" data-role="smallMeta" style="font-size:12px; letter-spacing:0.08em;">— E. MARKOV, DESIGN DIRECTOR</div>
    </div>
    <div class="sv-media" data-sb-media="" data-slot="PORTRAIT.JPG" data-kind="image" style="aspect-ratio: 3/4; background:#2c2a27; display:flex; align-items:center; justify-content:center; color:#9a9488; letter-spacing:0.12em; font-size:11px;">[ PORTRAIT.JPG ]</div>
  </div>
</section>`,
  }),

  t({
    tpl: "projectGalleryAsym",
    family: "work",
    group: "Секции",
    label: "Асимметричная галерея 2+1",
    code: "GAL-04",
    icon: "▧",
    kind: "static",
    desc: "Крупное медиа слева и два дополнительных кадра справа — типичная горизонтальная асимметрия.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#efece6; padding: 56px var(--pad); color:#111;">
  <div class="sv-inner" style="max-width:1320px; margin:0 auto;">
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:22px;">
      <h2 data-sb-editable="" data-slot="title" data-role="title" style="margin:0; font-size:36px; letter-spacing:-0.035em;">Case · Kinetic Room</h2>
      <div data-sb-editable="" data-slot="meta" data-role="smallMeta" style="font-size:12px; letter-spacing:0.1em;">STILL SET / 016</div>
    </div>
    <div style="display:grid; grid-template-columns: 1.4fr 0.8fr; gap:14px; margin-bottom:18px;">
      <div class="sv-media" data-sb-media="" data-slot="GALLERY_HERO.JPG" data-kind="image" style="aspect-ratio: 16/10; background:#c45a32; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.7); letter-spacing:0.12em; font-size:11px;">[ GALLERY_HERO.JPG ]</div>
      <div style="display:grid; grid-template-rows: 1fr 1fr; gap:14px;">
        <div class="sv-media" data-sb-media="" data-slot="GALLERY_A.JPG" data-kind="image" style="background:#d7d2c7; display:flex; align-items:center; justify-content:center; color:#8a867c; letter-spacing:0.12em; font-size:11px;">[ GALLERY_A.JPG ]</div>
        <div class="sv-media" data-sb-media="" data-slot="GALLERY_B.JPG" data-kind="image" style="background:#1f2328; display:flex; align-items:center; justify-content:center; color:#9aa0aa; letter-spacing:0.12em; font-size:11px;">[ GALLERY_B.JPG ]</div>
      </div>
    </div>
    <p data-sb-editable="" data-slot="body" data-role="body" style="margin:0; max-width:720px; font-size:15px; line-height:1.55;">Три кадра одной сцены: герой, деталь, пауза. В 16:9 они читаются как панорама. В 9:16 их нужно развести по высоте, а не склеить в узкую колонку.</p>
  </div>
</section>`,
  }),

  t({
    tpl: "longformEditorial",
    family: "editorial",
    group: "Секции",
    label: "Длинный текст с выносным медиа",
    code: "ED-01",
    icon: "¶",
    kind: "static",
    desc: "Редакционная колонка с лидом, длинным текстом и врезанным горизонтальным медиа.",
    styleSystem: "converted",
    html: `<section class="sv-section" style="background:#fff; padding: 72px var(--pad); color:#1a1a1a;">
  <div class="sv-inner" style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 0.9fr 1.3fr; gap:56px;">
    <div>
      <div data-sb-editable="" data-slot="overline" data-role="overline" style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#8a8f98; margin-bottom:14px;">Essay · 09:16</div>
      <h1 data-sb-editable="" data-slot="title" data-role="title" style="font-size:40px; line-height:1.08; letter-spacing:-0.035em; margin:0 0 16px;">Why stacking is not a layout</h1>
      <div data-sb-editable="" data-slot="lead" data-role="body" style="font-size:16px; line-height:1.55; color:#3a3f4b;">Вертикальный кадр даёт высоту. Если не использовать её как композиционный ресурс, снизу остаётся случайная пустота.</div>
    </div>
    <div>
      <p data-sb-editable="" data-slot="p1" data-role="body" style="font-size:15px; line-height:1.7; margin:0 0 18px;">Четыре исходных метода решают задачу «поместить DOM в 900×1600». Это необходимо, но недостаточно. Реконструкция по ролям умеет узнавать hero, matrix и about, однако часто оставляет выразительные медиа сжатыми в верхней трети.</p>
      <div class="sv-media" data-sb-media="" data-slot="ESSAY_STILL.JPG" data-kind="image" style="aspect-ratio: 16/7; background:#e6e1d8; margin: 8px 0 18px; display:flex; align-items:center; justify-content:center; color:#8a867c; letter-spacing:0.12em; font-size:11px;">[ ESSAY_STILL.JPG ]</div>
      <p data-sb-editable="" data-slot="p2" data-role="body" style="font-size:15px; line-height:1.7; margin:0 0 18px;">Новые алгоритмы работают от той же разметки, но с другой целью: распределить вес, увеличить медиа, сохранить иерархию и сделать пустое пространство решением, а не остатком.</p>
      <p data-sb-editable="" data-slot="p3" data-role="body" style="font-size:15px; line-height:1.7; margin:0;">Редактируемые слоты, data-role и data-sb-media остаются на месте — результат по-прежнему живой HTML, а не картинка.</p>
    </div>
  </div>
</section>`,
  }),
];

export const BUILTIN_LIBRARY: LibraryPack = {
  id: "to169",
  name: "To_169.js · тестовый набор",
  filename: "To_169.js",
  templates: TEMPLATES,
};
