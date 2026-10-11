import { TemplateItem, TemplateLibrary } from '../types';

export function findClosing(src: string, start: number, openChar: string, closeChar: string): number {
  let depth = 0;
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (lineComment) {
      if (c === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (c === '*' && n === '/') {
        blockComment = false;
        i++;
      }
      continue;
    }
    if (quote) {
      if (c === '\\') {
        i++;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/') {
      lineComment = true;
      i++;
      continue;
    }
    if (c === '/' && n === '*') {
      blockComment = true;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c;
      continue;
    }
    if (c === openChar) depth++;
    else if (c === closeChar && --depth === 0) return i;
  }
  return -1;
}

export function readJsQuoted(raw: string): string {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

export function safeName(s: string): string {
  return (
    String(s || 'template')
      .normalize('NFKD')
      .replace(/[^\w-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 70) || 'template'
  );
}

export function extractStaticLibrary(text: string, libName: string): TemplateLibrary {
  const marker = text.search(/\b(?:const|let|var)\s+LIBRARY\s*=\s*\[/);
  if (marker < 0) throw new Error('Не найдена запись LIBRARY = [ ... ]');
  const arrStart = text.indexOf('[', marker);
  const arrEnd = findClosing(text, arrStart, '[', ']');
  if (arrEnd < 0) throw new Error('Не удалось определить границы массива LIBRARY');

  const templates: TemplateItem[] = [];
  let i = arrStart + 1;
  while (i < arrEnd) {
    while (i < arrEnd && (text[i] === ',' || /\s/.test(text[i]))) i++;
    if (i >= arrEnd) break;
    if (text[i] !== '{') throw new Error('Ожидался объект шаблона в позиции ' + i);
    const objEnd = findClosing(text, i, '{', '}');
    if (objEnd < 0 || objEnd > arrEnd) throw new Error('Не удалось разобрать объект шаблона');
    const obj = text.slice(i, objEnd + 1);
    i = objEnd + 1;
    const bm = /\bbuild\s*:\s*i\s*=>\s*`/.exec(obj);
    if (!bm) continue;
    const tick = obj.indexOf('`', bm.index + bm[0].length - 1);
    let close = tick + 1;
    for (; close < obj.length; close++) {
      if (obj[close] === '\\') {
        close++;
        continue;
      }
      if (obj[close] === '`') break;
    }
    if (close >= obj.length) throw new Error('Не закрыта HTML-строка build у шаблона ' + (templates.length + 1));
    const html = obj.slice(tick + 1, close);
    const head = obj.slice(0, bm.index);
    const meta: Record<string, any> = {};
    const stringRe = /\b([A-Za-z_$][\w$]*)\s*:\s*("(?:\\.|[^"\\])*")/g;
    let m;
    while ((m = stringRe.exec(head))) meta[m[1]] = readJsQuoted(m[2]);
    const boolFav = /\bfavorite\s*:\s*(true|false)\b/.exec(head);
    meta.favorite = boolFav ? boolFav[1] === 'true' : false;
    const index = templates.length;
    templates.push({
      index,
      tpl: meta.tpl || meta.id || 'template-' + index,
      family: meta.family || '',
      group: meta.group || '',
      label: meta.label || meta.tpl || 'Шаблон ' + (index + 1),
      code: meta.code || '',
      icon: meta.icon || '',
      kind: meta.kind || '',
      desc: meta.desc || '',
      styleSystem: meta.styleSystem || '',
      favorite: !!meta.favorite,
      html,
    });
  }

  if (!templates.length) throw new Error('В массиве LIBRARY не найдено шаблонов со статическим build: i => `HTML...`');
  return {
    id: 'lib-' + safeName(libName) + '-' + Date.now(),
    name: libName,
    fileName: libName,
    type: 'site',
    templates,
    count: templates.length,
    staticExtract: true,
  };
}

export const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    index: 0,
    tpl: 'aboutManifestoStacked',
    family: 'about',
    group: 'Секции',
    label: 'О нас — Вертикальный манифест поверх медиа',
    code: 'ABT-02',
    icon: '◨',
    kind: 'static',
    desc: 'Центрированный крупный манифест с оверлайном сверху, снизу — широкое панорамное медиа и трёхколоночная строка мета-параметров.',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#F5F5F3; padding: clamp(60px,8vh,120px) var(--pad); border-top: 1px solid #E63B2B;"><div class="sv-inner" style="max-width:1200px; margin:0 auto;"><div data-sb-editable="" data-slot="tag" data-role="overline" style="color:#E63B2B; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:32px; text-align:center;">[ ABOUT &amp; MANIFESTO ]</div><h2 data-sb-editable="" data-slot="manifesto" data-role="statement" style="color:#E63B2B; font-size:clamp(28px,4vw,64px); line-height:1.05; font-weight:700; letter-spacing:-1.5px; margin:0 auto 48px; max-width:900px; text-align:center;">We build visual languages through modular clarity and precise grid mechanics.</h2><div class="sv-media" data-sb-media="" data-slot="aboutMedia" data-kind="image" style="aspect-ratio: 2.6/1; background:#E63B2B; margin-bottom:32px;"></div><div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:24px; border-top:1px solid #E63B2B; padding-top:24px;"><div><div data-sb-editable="" data-slot="m1Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">FOUNDED</div><div data-sb-editable="" data-slot="m1Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">2024 / ZÜRICH</div></div><div><div data-sb-editable="" data-slot="m2Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">DISCIPLINE</div><div data-sb-editable="" data-slot="m2Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">BRAND &amp; UI SYSTEM</div></div><div><div data-sb-editable="" data-slot="m3Key" data-role="label" style="color:#E63B2B; font-size:11px; font-weight:700; margin-bottom:8px;">METHOD</div><div data-sb-editable="" data-slot="m3Val" data-role="smallMeta" style="color:#E63B2B; font-size:12px;">BYBLOCKS® SYSTEM</div></div></div></div></section>`,
  },
  {
    index: 1,
    tpl: 'servicesRepeatRows',
    family: 'services',
    group: 'Секции',
    label: 'Услуги — Строчный список с повторами',
    code: 'SRV-02',
    icon: '≡',
    kind: 'auto',
    desc: 'Динамический список услуг в виде горизонтальных строк: номер, заголовок и описание в одну линию с разделителями.',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#F5F5F3; padding: clamp(60px,8vh,120px) var(--pad); border-top: 1px solid #E63B2B;"><div class="sv-inner" style="max-width:1400px; margin:0 auto;"><div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:48px;"><h2 data-sb-editable="" data-slot="srvHeader" data-role="title" style="color:#E63B2B; font-size:clamp(32px,4vw,56px); font-weight:700; line-height:1; letter-spacing:-1px; margin:0;">CAPABILITIES</h2><div data-sb-editable="" data-slot="srvMeta" data-role="smallMeta" style="color:#E63B2B; font-size:11px; font-weight:700;">(SCOPE OF WORK)</div></div><div data-sb-repeat="servicesRows" style="display:flex; flex-direction:column;"><div style="display:grid; grid-template-columns: 60px 1.2fr 2fr; gap:24px; align-items:center; border-top:1px solid #E63B2B; padding:24px 0;"><span data-sb-editable="" data-slot="rowNum" data-role="smallMeta" style="color:#E63B2B; font-size:14px; font-weight:700;">01</span><h3 data-sb-editable="" data-slot="rowTitle" data-role="title" style="color:#E63B2B; font-size:clamp(20px,2.2vw,32px); font-weight:700; margin:0; letter-spacing:-0.5px;">ART DIRECTION</h3><p data-sb-editable="" data-slot="rowBody" data-role="body" style="color:#E63B2B; font-size:12px; line-height:1.5; margin:0;">Curating modern visual strategies, concepts, and architectural asset libraries with a rigorous editorial approach.</p></div></div></div></section>`,
  },
  {
    index: 2,
    tpl: 'contactSplitTwoColumn',
    family: 'contact',
    group: 'Секции',
    label: 'Контакт: заголовок слева, реквизиты справа',
    code: 'C-11',
    icon: '✉',
    kind: 'static',
    desc: 'Двухколоночный контакт: overline/title/body слева; справа пары label+value для email, telegram и соцсетей',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#ffffff; padding:clamp(80px,10vh,140px) var(--pad);"><div class="sv-inner" style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1.1fr 0.9fr; gap:clamp(48px,6vw,96px); align-items:start;"><div style="display:flex; flex-direction:column; gap:clamp(14px,1.8vw,22px);"><div data-sb-editable="" data-slot="overline" data-role="overline" style="font-size:clamp(11px,1vw,13px); letter-spacing:0.14em; text-transform:uppercase; color:#8a8f98;">Contact</div><h2 data-sb-editable="" data-slot="title" data-role="title" style="font-size:clamp(36px,4.5vw,56px); font-weight:500; line-height:1.08; margin:0; color:#0a0e18;">Contact</h2><div data-sb-editable="" data-slot="body" data-role="body" style="font-size:clamp(15px,1.3vw,18px); line-height:1.7; color:#3a3f4b; max-width:420px;">Открыт к сотрудничеству с брендами, студиями, агентствами и командами, которым нужен visual direction, concept development или production-ready visual language.</div></div><div style="display:flex; flex-direction:column; gap:clamp(22px,2.5vw,32px); padding-top:clamp(28px,3vw,48px);"><div style="display:flex; flex-direction:column; gap:6px;"><div data-sb-editable="" data-slot="labelEmail" data-role="label" style="font-size:clamp(11px,1vw,12px); letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Email</div><div data-sb-editable="" data-slot="valueEmail" data-role="link" style="font-size:clamp(15px,1.3vw,18px); color:#0a0e18;">hello@example.com</div></div><div style="display:flex; flex-direction:column; gap:6px;"><div data-sb-editable="" data-slot="labelTelegram" data-role="label" style="font-size:clamp(11px,1vw,12px); letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Telegram</div><div data-sb-editable="" data-slot="valueTelegram" data-role="link" style="font-size:clamp(15px,1.3vw,18px); color:#0a0e18;">@telegram</div></div><div style="display:flex; flex-direction:column; gap:6px;"><div data-sb-editable="" data-slot="labelSocial" data-role="label" style="font-size:clamp(11px,1vw,12px); letter-spacing:0.12em; text-transform:uppercase; color:#8a8f98;">Behance / Website / Instagram</div><div data-sb-editable="" data-slot="valueSocial" data-role="link" style="font-size:clamp(15px,1.3vw,18px); color:#0a0e18; white-space:pre-line;">behance.net/name\ninstagram.com/name</div></div></div></div></section>`,
  },
  {
    index: 3,
    tpl: 'swissTypographicMatrix_2',
    family: 'process',
    group: 'Секции',
    label: 'Швейцарская модульная матрица концепта',
    code: 'SW-02',
    icon: '◧',
    kind: 'static',
    desc: 'Интерполяционная формула моушн-концепта с медиа-превью, технической типографикой и строго регламентированными плашками.',
    styleSystem: 'converted',
    favorite: false,
    html: `<style>@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');</style><section class="sv-section" style="background:#f4f4f0; color:#000000; padding: clamp(60px, 8vh, 120px) 48px; font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;"><div class="sv-inner" style="max-width:1280px; margin:0 auto;"><div style="border:1px solid #000000; padding:clamp(24px, 4vw, 48px); display:grid; grid-template-columns: repeat(12, 1fr); gap:24px; align-items:start;"><div style="grid-column: span 12; display:flex; justify-content:space-between; border-bottom:1px solid #000000; padding-bottom:16px;"><div data-sb-editable="" data-slot="sw02_code" data-role="smallMeta" style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; font-weight:500;">©27 FLOWS // MODULAR MOTION</div><div data-sb-editable="" data-slot="sw02_season" data-role="smallMeta" style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; font-weight:500;">рис. С3(23) [3—28 АПР 2023]</div></div><div style="grid-column: span 12; margin-top:12px;"><h2 data-sb-editable="" data-slot="sw02_title" data-role="title" style="font-family: 'Space Grotesk', Helvetica, Arial, sans-serif; font-size:clamp(40px, 7vw, 92px); font-weight:500; line-height:0.95; letter-spacing:-0.03em; text-transform:uppercase; margin:0;">C→C→C→Своды // Опен-колл</h2></div><div style="grid-column: span 12; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:30px; margin-top:20px; align-items:end;"><div class="sv-media" data-sb-media="" data-slot="sw02_media" data-kind="image" style="aspect-ratio: 16/9; background: #e2e2dd; border:1px solid #000000; display:flex; align-items:center; justify-content:center; position:relative;"><span style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:11px; color:#777777; letter-spacing:0.08em;">[ MOTION_RESULT_PREVIEW.MP4 ]</span></div><div style="display:flex; flex-direction:column; gap:20px;"><p data-sb-editable="" data-slot="sw02_desc" data-role="body" style="font-size:14px; line-height:1.45; color:#222222; margin:0;">Строгая типографическая система, совмещающая кинетическую формулу и векторную структуру. Каждая итерация кадра выстроена по законам Баухауса.</p><div style="display:flex; gap:8px;"><span data-sb-editable="" data-slot="sw02_tag1" data-role="smallMeta" style="border:1px solid #000000; padding:4px 8px; font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:10px; text-transform:uppercase; font-weight:600;">COLLAB</span><span data-sb-editable="" data-slot="sw02_tag2" data-role="smallMeta" style="background:#000000; color:#ffffff; padding:4px 8px; font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:10px; text-transform:uppercase; font-weight:600;">SEASON 3</span></div></div></div></div></div></section>`,
  },
  {
    index: 4,
    tpl: 'swissTypoIndexHero_2',
    family: 'hero',
    group: 'Обложка проекта',
    label: 'Швейцарский типографический индекс (Авангард)',
    code: 'SW-05',
    icon: '◨',
    kind: 'static',
    desc: 'Монументальный типографический заголовок в стиле швейцарского плаката с диакритическими символами, регистровыми знаками и кинетической формулой.',
    styleSystem: 'converted',
    favorite: false,
    html: `<style>@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');</style><section class="sv-section" style="background:#ffffff; color:#000000; padding: clamp(60px, 8vh, 120px) 48px; font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;"><div class="sv-inner" style="max-width:1280px; margin:0 auto; display:grid; grid-template-columns:1fr; gap:60px;"><div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #000000; padding-bottom:20px;"><div><div data-sb-editable="" data-slot="sw05_meta_brand" data-role="overline" style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.08em;">JO/GA® KINETIC INDEX</div><div data-sb-editable="" data-slot="sw05_meta_sub" data-role="smallMeta" style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#8a8a84; margin-top:4px;">LDN ↳ (016)© MOTION SYSTEM</div></div><div style="display:flex; align-items:center; gap:20px;"><svg width="32" height="32" viewBox="0 0 32 32" style="display:block;"><circle cx="16" cy="16" r="14" fill="none" stroke="#000000" stroke-width="1"></circle><circle cx="16" cy="16" r="2" fill="#000000"></circle></svg><span data-sb-editable="" data-slot="sw05_meta_num" data-role="smallMeta" style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size:14px; font-weight:500; letter-spacing:0.06em;">[ 01/04 ]</span></div></div><div style="position:relative;"><h1 data-sb-editable="" data-slot="sw05_title" data-role="title" style="font-family: 'Space Grotesk', Helvetica, Arial, sans-serif; font-size:clamp(48px, 9vw, 110px); font-weight:500; line-height:0.92; letter-spacing:-0.03em; text-transform:uppercase; margin:0;">DESIGN INDEX (—)<br>KINETIC ↳ (016)©</h1><p data-sb-editable="" data-slot="sw05_subtitle" data-role="body" style="font-size:clamp(16px, 1.8vw, 24px); line-height:1.35; color:#333333; margin:24px 0 0 0; max-width:680px;">Концептуальная визуализация взаимодействия пространственных форм, типографики и векторного движения.</p></div><div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:20px; border-top:1px solid #e0e0dc; padding-top:20px;"><div style="display:flex; flex-direction:column; gap:8px;"><div style="display:flex; justify-content:space-between; font-family:'IBM Plex Mono', monospace; font-size:10px; color:#888;"><span data-sb-editable="" data-slot="sw05_col1_title" data-role="smallMeta">FORMULA_01</span><span data-sb-editable="" data-slot="sw05_col1_tag" data-role="smallMeta">[ VECTOR ]</span></div><div class="sv-media" data-sb-media="" data-slot="sw05_media_a" data-kind="image" style="aspect-ratio: 16/9; background:#ecece8; border:1px solid #dcdcd8; display:flex; align-items:center; justify-content:center;"><span style="font-family:monospace; font-size:10px; color:#888;">[ MOTION_LOOP_A.MP4 ]</span></div><div style="font-family:'IBM Plex Mono', monospace; font-size:10px; color:#666;" data-sb-editable="" data-slot="sw05_col1_note" data-role="smallMeta">Ускорение + Сдвиг осей = Кинетический ритм</div></div><div style="display:flex; flex-direction:column; gap:8px;"><div style="display:flex; justify-content:space-between; font-family:'IBM Plex Mono', monospace; font-size:10px; color:#888;"><span data-sb-editable="" data-slot="sw05_col2_title" data-role="smallMeta">FORMULA_02</span><span data-sb-editable="" data-slot="sw05_col2_tag" data-role="smallMeta">[ SPACE ]</span></div><div class="sv-media" data-sb-media="" data-slot="sw05_media_b" data-kind="image" style="aspect-ratio: 16/9; background:#ecece8; border:1px solid #dcdcd8; display:flex; align-items:center; justify-content:center;"><span style="font-family:monospace; font-size:10px; color:#888;">[ MOTION_LOOP_B.MP4 ]</span></div><div style="font-family:'IBM Plex Mono', monospace; font-size:10px; color:#666;" data-sb-editable="" data-slot="sw05_col2_note" data-role="smallMeta">Форма + Контекст = Трансформация восприятия</div></div></div></div></section>`,
  },
  {
    index: 5,
    tpl: 'showreelSplitDirections',
    family: 'hero',
    group: 'Секции',
    label: 'Сплит-экран: Направления и медиа 16:9',
    code: 'SR-01',
    icon: '◨',
    kind: 'auto',
    desc: 'Швейцарский сплит-экран: слева меню переключаемых направлений (Fashion, For Studios, Personal, Key Visual), справа медиакадр 16:9',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#0a0a0a; color:#f4f4f0; padding: clamp(60px,8vh,120px) var(--pad, 4vw);"><div class="sv-inner" style="max-width:1600px; margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: clamp(30px, 5vw, 80px); align-items: center;"><div style="display:flex; flex-direction:column; gap:clamp(16px, 2vw, 32px);"><span data-sb-editable="" data-slot="sr1_meta" data-role="overline" style="text-transform:uppercase; font-size:12px; letter-spacing:0.2em; color:#888888; font-family:monospace;">DIR // 01-04</span><div data-sb-repeat="directionsList" style="display:flex; flex-direction:column; gap:12px;"><h2 data-sb-editable="" data-slot="sr1_item1" data-role="title" style="font-size:clamp(28px, 4vw, 56px); font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; margin:0; line-height:1; color:#ffffff;">FASHION</h2><h2 data-sb-editable="" data-slot="sr1_item2" data-role="title" style="font-size:clamp(28px, 4vw, 56px); font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; margin:0; line-height:1; color:#333333;">FOR STUDIOS</h2><h2 data-sb-editable="" data-slot="sr1_item3" data-role="title" style="font-size:clamp(28px, 4vw, 56px); font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; margin:0; line-height:1; color:#333333;">PERSONAL</h2><h2 data-sb-editable="" data-slot="sr1_item4" data-role="title" style="font-size:clamp(28px, 4vw, 56px); font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; margin:0; line-height:1; color:#333333;">KEY VISUAL</h2></div><p data-sb-editable="" data-slot="sr1_desc" data-role="body" style="font-size:14px; line-height:1.5; color:#a0a0a0; max-width:400px; margin-top:20px;">Швейцарская подача ключевых визуальных векторов проекта. Динамическое переключение кадров в режиме шоурила.</p></div><div class="sv-media" data-sb-media="" data-slot="sr1_video" data-kind="image" style="aspect-ratio: 16/9; background: #1a1a1a; width:100%; border:1px solid #333333;"></div></div></section>`,
  },
  {
    index: 6,
    tpl: 'showreelMicroGrid',
    family: 'services',
    group: 'Секции',
    label: 'Сетка микро-кадров с быстрыми анонсами',
    code: 'SR-02',
    icon: '☷',
    kind: 'auto',
    desc: 'Лаконичная сетка микро-кадров 16:9 с емкими абзацами текста для быстрого считывания концепций',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#ffffff; color:#000000; padding: clamp(60px,8vh,120px) var(--pad, 4vw);"><div class="sv-inner" style="max-width:1600px; margin:0 auto;"><div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px; border-bottom:1px solid #e5e5e5; padding-bottom:20px;"><h3 data-sb-editable="" data-slot="sr2_title" data-role="title" style="font-size: clamp(20px, 2.5vw, 36px); font-weight:700; text-transform:uppercase; margin:0; letter-spacing:-0.01em;">FAST INDEX</h3><span data-sb-editable="" data-slot="sr2_count" data-role="smallMeta" style="font-family:monospace; font-size:14px; color:#666666;">[ 01 — 03 ]</span></div><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(20px, 3vw, 40px);"><div data-sb-repeat="microCards" style="display:flex; flex-direction:column; gap:16px;"><div class="sv-media" data-sb-media="" data-slot="sr2_img1" data-kind="image" style="aspect-ratio: 16/9; background: #f0f0f0; width: 100%;"></div><div style="display:flex; flex-direction:column; gap:6px;"><span data-sb-editable="" data-slot="sr2_num1" data-role="smallMeta" style="font-family:monospace; font-size:11px; text-transform:uppercase; color:#888;">01. CINEMATIC FRAME</span><p data-sb-editable="" data-slot="sr2_text1" data-role="body" style="font-size:14px; line-height:1.4; color:#222222; margin:0; font-weight:400;">Быстрая читаемость, точная модульная сетка и максимальный фокус на композиции каждого кадра.</p></div></div></div></div></section>`,
  },
  {
    index: 7,
    tpl: 'showreelStatementDirections_001',
    family: 'statement',
    group: 'Секции',
    label: 'Типографический манифест (20 направлений)',
    code: 'SR-03',
    icon: '≡',
    kind: 'static',
    desc: 'Швейцарский манифест с крупным перечислением 20 ключевых направлений через запятую с левосторонней выключкой',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#000000; color:#ffffff; padding: clamp(80px,10vh,140px) var(--pad, 4vw);"><div class="sv-inner" style="max-width:1400px; margin:0 auto;"><div style="display:flex; flex-direction:column; gap:24px;"><span data-sb-editable="" data-slot="sr3_overline" data-role="overline" style="text-transform:uppercase; font-size:12px; letter-spacing:0.25em; color:#666666; font-family:monospace;">// SPECTRUM OF EXPERTISE</span><p data-sb-editable="" data-slot="sr3_statement" data-role="statement" style="font-size: clamp(24px, 3.8vw, 54px); font-weight:500; line-height:1.2; letter-spacing:-0.02em; color:#f0f0f0; margin:0; text-align:left;">Fashion, For Studios, Personal Branding, Key Visuals, Art Direction, Motion Systems, CGI Production, Sound Design, Editorial, Type Design, Set Design, Brand Strategy, Spatial Design, Film Craft, AI Generation, UI/UX Systems, Digital Installations, Runway Covers, Commercials, Dynamic Identity.</p></div></div></section>`,
  },
  {
    index: 8,
    tpl: 'showreelAsymmetricGrid',
    family: 'gallery',
    group: 'Галерея проекта',
    label: 'Асимметричная швейцарская сетка кадров 16:9',
    code: 'SR-05',
    icon: '☷',
    kind: 'auto',
    desc: 'Разноразмерная композиция кадров строгого формата 16:9 по 12-колоночной сетке с титрами',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#050505; color:#ffffff; padding: clamp(60px,8vh,120px) var(--pad, 4vw);"><div class="sv-inner" style="max-width:1600px; margin:0 auto; display:grid; grid-template-columns: repeat(12, 1fr); gap:20px;"><div data-sb-repeat="asymCards" style="grid-column: span 8; display:flex; flex-direction:column; gap:12px;"><div class="sv-media" data-sb-media="" data-slot="sr5_img1" data-kind="image" style="aspect-ratio: 16/9; background: #181818; width:100%;"></div><span data-sb-editable="" data-slot="sr5_tag1" data-role="smallMeta" style="font-size:12px; color:#888; text-transform:uppercase; font-family:monospace;">[01] MAIN FRAME — KEY VISUAL</span></div><div style="grid-column: span 4; display:flex; flex-direction:column; justify-content:flex-end; gap:12px;"><div class="sv-media" data-sb-media="" data-slot="sr5_img2" data-kind="image" style="aspect-ratio: 16/9; background: #222; width:100%;"></div><span data-sb-editable="" data-slot="sr5_tag2" data-role="smallMeta" style="font-size:12px; color:#888; text-transform:uppercase; font-family:monospace;">[02] CUTAWAY</span></div><div style="grid-column: span 4; margin-top:40px;"><h4 data-sb-editable="" data-slot="sr5_title" data-role="title" style="font-size:24px; font-weight:700; text-transform:uppercase; margin:0 0 10px 0;">SWISS LAYOUT</h4><p data-sb-editable="" data-slot="sr5_body" data-role="body" style="font-size:13px; color:#999; line-height:1.5;">Асимметричное распределение визуального веса с жесткой модульной сеткой 16:9.</p></div><div style="grid-column: span 8; margin-top:40px;"><div class="sv-media" data-sb-media="" data-slot="sr5_img3" data-kind="image" style="aspect-ratio: 16/9; background: #1f1f1f; width:100%;"></div></div></div></section>`,
  },
  {
    index: 9,
    tpl: 'showreelStatementDirections_converted169',
    family: 'statement',
    group: 'Секции',
    label: 'Типографический манифест (20 направлений) · Converted 16:9',
    code: 'SR-03',
    icon: '≡',
    kind: 'static',
    desc: 'Швейцарский манифест с крупным перечислением 20 ключевых направлений через запятую с левосторонней выключкой',
    styleSystem: 'converted',
    favorite: false,
    html: `<div data-sb-format-frame="1" style="width:100%;aspect-ratio:16/9;position:relative;overflow:hidden;box-sizing:border-box;background:#000000;"><div data-sb-format-inner="1" style="position:absolute;left:50%;top:50%;width:1280px;height:818.75px;transform:translate(-50%,-50%) scale(1);transform-origin:center center;overflow:visible;"><section class="sv-section" style="background:#000000; color:#ffffff; padding: clamp(80px,10vh,140px) var(--pad, 4vw);"><div class="sv-inner" style="max-width:1400px; margin:0 auto;"><div style="display:flex; flex-direction:column; gap:24px;"><span data-sb-editable="" data-slot="sr3_overline" data-role="overline" style="text-transform:uppercase; font-size:12px; letter-spacing:0.25em; color:#666666; font-family:monospace;">// SPECTRUM OF EXPERTISE</span><p data-sb-editable="" data-slot="sr3_statement" data-role="statement" style="font-size: clamp(24px, 3.8vw, 54px); font-weight:500; line-height:1.2; letter-spacing:-0.02em; color:#f0f0f0; margin:0; text-align:left;">Fashion, For Studios, Personal Branding, Key Visuals, Art Direction, Motion Systems, CGI Production, Sound Design, Editorial, Type Design, Set Design, Brand Strategy, Spatial Design, Film Craft, AI Generation, UI/UX Systems, Digital Installations, Runway Covers, Commercials, Dynamic Identity.</p></div></div></section></div></div>`,
  },
  {
    index: 10,
    tpl: 'statementFullBleed_001',
    family: 'statement',
    group: 'Секции',
    label: 'Заявление — Полноэкранный акцентный манифест',
    code: 'ST-01',
    icon: '◧',
    kind: 'static',
    desc: 'Инверсная секция на красном фоне с гигантским заявлением по центру и подписью снизу.',
    styleSystem: 'converted',
    favorite: false,
    html: `<section class="sv-section" style="background:#E63B2B; padding: clamp(80px,12vh,160px) var(--pad);"><div class="sv-inner" style="display:flex; flex-direction:column; align-items:flex-start;"><div data-sb-editable="" data-slot="stTag" data-role="overline" style="color:#F5F5F3; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:40px;">[ OUR PHILOSOPHY ]</div><h2 data-sb-editable="" data-slot="stStatement" data-role="statement" style="color:#F5F5F3; font-size:clamp(36px, 6vw, 88px); line-height:1.0; font-weight:700; letter-spacing:-2px; margin:0 0 48px 0; max-width:1100px;">Good design is invisible. Great systems are inevitable.</h2><div style="display:flex; justify-content:space-between; width:100%; border-top:1px solid #F5F5F3; padding-top:20px;"><span data-sb-editable="" data-slot="stMetaL" data-role="smallMeta" style="color:#F5F5F3; font-size:11px; font-weight:700;">BYBLOCKS® MANIFESTO</span><span data-sb-editable="" data-slot="stMetaR" data-role="smallMeta" style="color:#F5F5F3; font-size:11px; font-weight:700;">(001)</span></div></div></section>`,
  },
];

export const DEFAULT_LIBRARY: TemplateLibrary = {
  id: 'lib-To_169_js',
  name: 'To_169.js · тестовый набор',
  fileName: 'To_169.js',
  type: 'site',
  templates: INITIAL_TEMPLATES,
  count: INITIAL_TEMPLATES.length,
  staticExtract: true,
};
