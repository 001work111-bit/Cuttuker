// Builds src/data/templates.json + public/past-as-foundation.json and validates the JSON contract.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { TEMPLATES } from './templates.source.mjs';

const FIELD_ORDER = ['tpl','family','group','label','code','icon','kind','single','desc','styleSystem','html'];
const FAMILIES = ['nav','hero','statement','about','services','process','formats','projectCover','projectContent','gallery','contact','footer'];
const GROUPS = ['Каркас','Секции','Обложка проекта','Контент проекта','Галерея проекта'];
const ROLES = ['title','subtitle','body','smallMeta','overline','link','statement','label'];
const MEDIA_COUNT = {
  variant1CoverIdea: 1, variant1Visuals: 4,
  variant2Cover: 1, variant2Principle: 0, variant2VisualProof: 4,
  variant3Cover: 1, variant3Shift: 2, variant3Result: 4,
  variant4Title: 1, variant4Thought: 0, variant4Development: 3, variant4FullGallery: 4,
  variant5TitleOnly: 0, variant5TextFourImages: 4, variant5FinalImage: 1,
};

const errors = [];
const warn = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };

check(TEMPLATES.length === 15, `expected 15 templates, got ${TEMPLATES.length}`);

const tpls = new Set(), codes = new Set();
TEMPLATES.forEach((t, i) => {
  const keys = Object.keys(t);
  check(keys.length === 11, `${t.tpl}: expected 11 fields, got ${keys.length}`);
  check(JSON.stringify(keys) === JSON.stringify(FIELD_ORDER), `${t.tpl}: field order is ${keys.join(',')}`);
  check(!tpls.has(t.tpl), `duplicate tpl ${t.tpl}`); tpls.add(t.tpl);
  check(!codes.has(t.code), `duplicate code ${t.code}`); codes.add(t.code);
  check(FAMILIES.includes(t.family), `${t.tpl}: bad family ${t.family}`);
  check(GROUPS.includes(t.group), `${t.tpl}: bad group ${t.group}`);
  check(t.kind === 'static', `${t.tpl}: kind must be static`);
  check(t.single === false, `${t.tpl}: single must be false`);
  check(t.styleSystem === 'default', `${t.tpl}: styleSystem must be "default"`);
  check(typeof t.icon === 'string' && t.icon.length <= 2 && t.icon.length >= 1, `${t.tpl}: icon must be 1-2 chars`);
  check(/^[A-Za-z][A-Za-z0-9]*$/.test(t.tpl), `${t.tpl}: tpl must be camelCase latin`);
  check(/^[A-Z]\d-\d{2}$/.test(t.code), `${t.tpl}: bad code ${t.code}`);
  check(!/\n|\r|\t/.test(t.html), `${t.tpl}: html must be single-line`);
  check(!t.html.includes('\\'), `${t.tpl}: html contains a backslash`);

  // forbidden content
  [/\<style/i, /\<script/i, /data-sb-repeat/i, /https?:\/\//i, /base64/i, /\<svg/i, /box-shadow/i, /text-shadow/i, /url\(/i, /\@import/i, /font-family:[^;]*(Roboto|Inter|Georgia|Times)/i]
    .forEach((re) => check(!re.test(t.html), `${t.tpl}: forbidden pattern ${re}`));

  // root section
  const sections = t.html.match(/<section class="sv-section"/g) || [];
  check(sections.length === 1, `${t.tpl}: expected exactly 1 section.sv-section, got ${sections.length}`);
  check(t.html.startsWith('<section class="sv-section" style="'), `${t.tpl}: must start with section.sv-section`);
  check(t.html.endsWith('</section>'), `${t.tpl}: must end with </section>`);
  const rootStyle = (t.html.match(/<section class="sv-section" style="([^"]*)"/) || [])[1] || '';
  ['aspect-ratio:16/9','width:100%','overflow:hidden','display:flex','background-color:','box-sizing:border-box']
    .forEach((p) => check(rootStyle.includes(p), `${t.tpl}: root missing ${p}`));
  const inners = t.html.match(/<div class="sv-inner"/g) || [];
  check(inners.length === 1, `${t.tpl}: expected exactly 1 div.sv-inner, got ${inners.length}`);
  check(/<div class="sv-inner" style="[^"]*flex:1 1 auto/.test(t.html), `${t.tpl}: sv-inner must be a flex child`);

  // media slots
  const mediaRe = /<div class="sv-media" data-sb-media data-slot="([^"]+)" data-kind="image" style="([^"]*)"><\/div>/g;
  const media = [...t.html.matchAll(mediaRe)];
  check(media.length === MEDIA_COUNT[t.tpl], `${t.tpl}: media slots ${media.length}, expected ${MEDIA_COUNT[t.tpl]}`);
  media.forEach((m) => {
    check(m[2].includes('background-color:'), `${t.tpl}/${m[1]}: missing background-color`);
    check(/aspect-ratio:[0-9]+\/[0-9]+/.test(m[2]), `${t.tpl}/${m[1]}: missing aspect-ratio`);
    check(/width:100%/.test(m[2]), `${t.tpl}/${m[1]}: missing width`);
  });
  const allSlots = [...t.html.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]);
  check(new Set(allSlots).size === allSlots.length, `${t.tpl}: duplicate data-slot`);

  // editable texts
  const editRe = /<([a-z0-9]+) data-sb-editable data-slot="([^"]+)" data-role="([a-zA-Z]+)"[^>]*>([\s\S]*?)<\/\1>/g;
  const edits = [...t.html.matchAll(editRe)];
  edits.forEach((e) => check(ROLES.includes(e[3]), `${t.tpl}: bad data-role ${e[3]}`));
  check(edits.length >= 1, `${t.tpl}: no editable text`);

  // every non-empty text node must be editable
  const stripped = t.html.replace(editRe, '').replace(/<[^>]+>/g, ' ');
  const stray = stripped.replace(/&nbsp;/g, ' ').split(/\s+/).filter((w) => /[A-Za-zА-Яа-я]{3,}/.test(w) && !/^(class|style|data|flex|font|color|background|width|height|aspect|ratio|display|align|justify|padding|margin|letter|line|text|transform|box|sizing|border|min|max|gap|overflow|position|top|left|right|bottom|opacity)$/i.test(w));
  check(stray.length === 0, `${t.tpl}: non-editable text found: ${stray.slice(0, 5).join(' | ')}`);
});

// JSON round-trip
const json = JSON.stringify(TEMPLATES, null, 2);
const parsed = JSON.parse(json);
check(parsed.length === 15, 'round-trip length mismatch');
check(JSON.stringify(parsed) === JSON.stringify(TEMPLATES), 'round-trip mismatch');

const summary = TEMPLATES.map((t) => {
  const media = (t.html.match(/data-sb-media/g) || []).length;
  const edits = (t.html.match(/data-sb-editable/g) || []).length;
  return `${t.code} ${t.tpl.padEnd(24)} media:${media} text:${edits} bytes:${t.html.length}`;
}).join('\n');

mkdirSync('src/data', { recursive: true });
mkdirSync('public', { recursive: true });
writeFileSync('src/data/templates.json', json + '\n');
writeFileSync('public/past-as-foundation.json', JSON.stringify(TEMPLATES) + '\n');

console.log(summary);
console.log('\nwarnings:', warn.length, '| errors:', errors.length);
if (errors.length) { console.log(errors.map((e) => ' ✗ ' + e).join('\n')); process.exit(1); }
console.log('OK → src/data/templates.json, public/past-as-foundation.json');
