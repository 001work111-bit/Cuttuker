/* ============================================================
   recompose-core.js — движок Recompose / Конвертация 16:9 (без UI)
   ------------------------------------------------------------
   Алгоритмы портированы из recompose-studio-169.html (прототип) без
   переписывания: pickRoot, unwrapFormatFrame, specialAbout/Asym/Micro,
   smartStructure, genericSemantic, targetCss(layout,method), checkOverflow,
   fitDown, smartCssFixes, chooseRecommended. Блоки помечены «verbatim».
   Изменено только:
     • размер кадра передаётся параметром fmt (вместо глобальных 1600×900);
     • vw в шаблоне переводится в px по ширине кадра (в iframe 1 vw = 16 px);
     • добавлен слой вывода: диагностика, проверка структуры, фрагмент
       с изолированным CSS для Sandbox (см. rcFragment).

   Четыре метода вынесены в adaptation-modules/ (см. README там); здесь остаётся среда исполнения.
   Прежний состав (для справки):
     smart    — реконструкция по ролям (smartStructure + targetCss)
     compact  — адаптивная сетка (исходный DOM, unwrap + targetCss)
     split    — редакционный split (smartStructure + split-ветки targetCss)
     fit      — контрольный safe-fit (исходный DOM + плавное уменьшение)

   API: window.RecomposeCore
     .METHODS, .FORMATS, .ALGO, .recommend(t, html)
     .convert(t, method, {format, id}) -> Promise<result>
   Исходный шаблон не изменяется: работа идёт в скрытом iframe на копии HTML.
   ============================================================ */
(function(){
'use strict';

const ALGO = 'recompose-core/1.0';
const SOURCE_VH = 900;
const SOURCE_W = 1440;
// Реестр модулей адаптации. Дескриптор (module.json) + код (module.js → implement).
// Движок не знает алгоритмов: модуль получает ctx (см. rcAdaptCtx) и возвращает {layout, fit}.
const ENGINE_API = 1;
const ADAPT = new Map();        // зарегистрированные модули (дескриптор + код)
const ADAPT_IMPL = new Map();   // код, переданный через implement() до регистрации
const ADAPT_ERRORS = [];
const ADAPT_APPS = ['Sandbox','Pano Montage Studio'];
const ADAPT_SOURCE_DEFAULT = '16:9';
const ADAPT_SCENARIOS = ['library','timeline'];   // library: инспектор шаблона; timeline: инспектор блока
let ADAPT_APP = 'Sandbox';
const ADAPT_ID_RE = /^[a-z][a-z0-9-]{1,39}$/;
const ADAPT_VER_RE = /^\d+\.\d+\.\d+$/;
function adaptGet(id){ return ADAPT.get(id) || null; }
function adaptSorted(){ return [...ADAPT.values()].sort((a, b) => (a.order ?? 1000) - (b.order ?? 1000)); }
function adaptCodeErrors(impl){
  const e = [];
  if(!impl || typeof impl !== 'object') return ['код: нужен объект {adapt, css?}'];
  if(typeof impl.adapt !== 'function') e.push('adapt: нужна функция adapt(ctx)');
  if(impl.css !== undefined && (typeof impl.css !== 'object' || ['head','tail'].some(k => impl.css[k] !== undefined && typeof impl.css[k] !== 'function')))
    e.push('css: {head?(layout), tail?(layout)} — функции или отсутствуют');
  return e;
}
function adaptValidate(d){
  const e = [];
  if(!d || typeof d !== 'object' || Array.isArray(d)) return ['дескриптор должен быть объектом (module.json)'];
  if(typeof d.id !== 'string' || !ADAPT_ID_RE.test(d.id)) e.push('id: строчная латиница, цифры и дефис, 2–40 символов');
  if(typeof d.name !== 'string' || !d.name) e.push('name: нужно название');
  if(typeof d.description !== 'string') e.push('description: нужно описание');
  if(typeof d.version !== 'string' || !ADAPT_VER_RE.test(d.version)) e.push('version: формат x.y.z');
  if(!Array.isArray(d.sourceFormats) || !d.sourceFormats.length || d.sourceFormats.some(x => typeof x !== 'string')) e.push('sourceFormats: массив идентификаторов форматов');
  if(!Array.isArray(d.targetFormats) || !d.targetFormats.length || d.targetFormats.some(x => typeof x !== 'string')) e.push('targetFormats: массив идентификаторов форматов, например ["16:9","1:1"]');
  if(!Array.isArray(d.apps) || !d.apps.length || d.apps.some(a => !ADAPT_APPS.includes(a))) e.push('apps: только «Sandbox» и/или «Pano Montage Studio»');
  if(d.order !== undefined && typeof d.order !== 'number') e.push('order: число (необязательно)');
  if(d.engineApi !== ENGINE_API) e.push(`engineApi: модуль рассчитан на API ${d.engineApi}, движок — ${ENGINE_API}`);
  if(!Array.isArray(d.markup) || d.markup.some(x => typeof x !== 'string')) e.push('markup: список требуемых маркеров разметки (строки)');
  if(d.titleRole !== undefined && typeof d.titleRole !== 'boolean') e.push('titleRole: boolean (необязательно)');
  if(d.scenarios !== undefined && (!Array.isArray(d.scenarios) || !d.scenarios.length || d.scenarios.some(x => !ADAPT_SCENARIOS.includes(x)))) e.push('scenarios: подмножество ["library","timeline"] (необязательно, по умолчанию оба)');
  return e;
}
function adaptImplement(id, impl){
  const e = (typeof id !== 'string' || !ADAPT_ID_RE.test(id)) ? ['implement: некорректный id'] : adaptCodeErrors(impl);
  if(e.length){ ADAPT_ERRORS.push({ id, errors: e }); return { ok:false, errors:e }; }
  ADAPT_IMPL.set(id, impl);
  return { ok:true };
}
function adaptRegister(d, impl){
  if(impl) adaptImplement(d && d.id, impl);
  const errors = adaptValidate(d);
  if(errors.length){ ADAPT_ERRORS.push({ id: d && d.id, errors }); return { ok:false, errors }; }
  const code = ADAPT_IMPL.get(d.id);
  if(!code){
    const e = ['нет кода: module.js не загружен или не вызвал implement()'];
    ADAPT_ERRORS.push({ id: d.id, errors: e }); return { ok:false, errors:e };
  }
  const prev = ADAPT.get(d.id);
  if(prev){
    if(prev.version === d.version) return { ok:true, duplicate:true };
    const e = ['id уже занят модулем версии ' + prev.version];
    ADAPT_ERRORS.push({ id: d.id, errors: e }); return { ok:false, errors: e };
  }
  const frozen = Object.freeze(Object.assign({}, d, { adapt: code.adapt, css: Object.freeze(Object.assign({}, code.css || {})) }));
  ADAPT.set(d.id, frozen);
  return { ok:true };
}
function adaptList(targetFormat, app, sourceFormat, scenario){
  const src = sourceFormat || ADAPT_SOURCE_DEFAULT;
  return adaptSorted().filter(m => m.targetFormats.includes(targetFormat)
    && m.sourceFormats.includes(src)
    && m.apps.includes(app || ADAPT_APP)
    && (!scenario || (m.scenarios || ADAPT_SCENARIOS).includes(scenario)));
}
const ADAPT_API = {
  engineApi: ENGINE_API,
  register: adaptRegister,
  implement: adaptImplement,
  get: adaptGet,
  list: adaptList,
  scenarios: () => ADAPT_SCENARIOS.slice(),
  ids: () => adaptSorted().map(m => m.id),
  apps: () => ADAPT_APPS.slice(),
  getApp: () => ADAPT_APP,
  setApp(name){ if(!ADAPT_APPS.includes(name)) throw new Error('Неизвестное приложение: ' + name); ADAPT_APP = name; },
  errors: () => ADAPT_ERRORS.slice()
};

// Реестр форматов — ЕДИНЫЙ ИСТОЧНИК: window.SB_FORMATS (Sandbox_Content.html). Здесь только кэш рабочих кадров,
// который заполняет SB_syncFormats() (recompose-sandbox.js). Новых записей в этой таблице не вводить.
const FORMATS = {};
const W = 1600, H = 900;   // рабочий кадр 16:9 алгоритма (= SB_FORMATS '16:9'.work)
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = () => null; // UI-функции прототипа в движке не используются

function getFormat(id){
  const f = FORMATS[id||'16:9'];
  if(!f) throw new Error('Неизвестный формат: '+id);
  return f;
}
// vw → px по ширине кадра (в iframe 1 vw = frameW/100 px)
function vwToPx(html, frameW){
  return String(html||'').replace(/(-?\d*\.?\d+)\s*vw\b/gi,(m,n)=>`${Number(n)*frameW/100}px`);
}

/* ---- verbatim: вспомогательные функции прототипа ---- */
function stripRemoteFontImports(html){return String(html||'').replace(/@import\s+url\(\s*['\"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;\s*/gi,'')}
function collectFontImports(html){return [...String(html||'').matchAll(/@import\s+url\(\s*['\"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;?/gi)].map(m=>m[0])}
function vhToPx(html){return String(html||'').replace(/(-?\d*\.?\d+)\s*(dvh|svh|lvh|vh)\b/gi,(m,n)=>`${Number(n)*SOURCE_VH/100}px`)}
/* ---- verbatim: рекомендация и описания методов ---- */
function chooseRecommended(t,html){const id=(t?.tpl||'').toLowerCase();const roles=[...String(html||'').matchAll(/data-role=["']([^"']+)/g)].map(m=>m[1]);const media=(html.match(/data-sb-media|class=["'][^"']*sv-media/g)||[]).length;let method='smart',why='Есть семантические роли и контейнеры, поэтому сначала стоит испытать перекомпоновку по смыслу.';if(/services|contact|showreelsplit|statementfullbleed/.test(id)){method='compact';why='У шаблона уже есть достаточно горизонтальная структура; безопаснее сначала уплотнить исходную сетку и типографику.'}else if(/asymmetric|typomatrix|typoindex|aboutmanifesto|microgrid/.test(id)){method='smart';why='Шаблон содержит выраженные роли и медиа/текстовые группы: они могут быть распределены заново, а не просто уменьшены.'}else if(media===0&&roles.some(r=>r==='statement'||r==='title')){method='compact';why='В шаблоне доминирует типографика. Сохранение исходной структуры с адаптивным размером текста должно быть первым экспериментом.'}return {method,why,roles:roles.length,media}}
const methodNames={smart:'Реконструкция по ролям',compact:'Адаптивная сетка',split:'Редакционный split',fit:'Контрольный safe-fit'};
const methodHelp={smart:'Меняет групповую раскладку, распознаёт роли title/body/media/meta. Предпочтительный метод для длинных секций.',compact:'Сохраняет исходный порядок DOM и основные CSS grid/flex, уплотняя размеры для кадра 16:9.',split:'Попытка собрать текстовую и медиа-части в редакционный split, когда у шаблона обе группы выражены.',fit:'Контрольный вариант для сравнения: исходная структура сохраняется максимально, переполнение уменьшается с помощью плавного уменьшения размеров.'};
/* ---- verbatim: специальные обработчики, smartStructure, genericSemantic ---- */
function directChildren(el){return [...(el?.children||[])].filter(n=>!['STYLE','SCRIPT','LINK'].includes(n.tagName))}
function pickRoot(doc){let section=doc.querySelector('.sv-section');if(!section){const f=doc.querySelector('[data-sb-format-frame]');section=f?.querySelector('.sv-section')||doc.body.querySelector('section,main,article,div');}return section}
function unwrapFormatFrame(doc){const f=doc.querySelector('[data-sb-format-frame]');if(!f)return;const s=f.querySelector('.sv-section');if(s){f.replaceWith(s)}else{const inn=f.querySelector('[data-sb-format-inner]');if(inn){inn.style.cssText='position:static!important;left:auto!important;top:auto!important;width:100%!important;height:100%!important;transform:none!important;overflow:visible!important';f.replaceWith(...inn.childNodes)}}}
function createStyle(doc,css){let style=doc.getElementById('recompose-overrides');if(!style){style=doc.createElement('style');style.id='recompose-overrides';doc.body.appendChild(style)}style.textContent=css}
function setInline(el,props){for(const [k,v] of Object.entries(props))el.style.setProperty(k,v,'important')}
function makeLayoutClass(inner,cls){inner.classList.add(cls)}
function specialAbout(doc,section,inner){const over=inner.querySelector('[data-role="overline"]'),title=inner.querySelector('[data-role="statement"]'),media=inner.querySelector('[data-sb-media],.sv-media');const meta=directChildren(inner).find(n=>n.querySelector('[data-slot^="m1Key"],[data-slot^="m1Val"]'))||directChildren(inner).filter(n=>n!==over&&n!==title&&n!==media).at(-1);if(!over||!title||!media||!meta)return false;const layout=doc.createElement('div');layout.className='rc-about-layout';const copy=doc.createElement('div');copy.className='rc-about-copy';copy.append(over,title);const visual=doc.createElement('div');visual.className='rc-about-visual';visual.append(media);const footer=doc.createElement('div');footer.className='rc-about-footer';footer.append(meta);inner.replaceChildren(layout);layout.append(copy,visual,footer);return true}
function specialAsym(doc,section,inner){const kids=directChildren(inner);if(kids.length<4)return false;const [main,side,title,third]=kids;if(!main.querySelector('.sv-media,[data-sb-media]')||!side.querySelector('.sv-media,[data-sb-media]')||!third.querySelector('.sv-media,[data-sb-media]'))return false;inner.replaceChildren(main,side,title,third);inner.classList.add('rc-asym');return true}
function specialMicro(doc,section,inner){const kids=directChildren(inner);if(kids.length<2)return false;const head=kids.find(k=>k.querySelector('[data-role="title"]'));const cardGrid=kids.find(k=>k.querySelector('[data-sb-repeat]'));if(!head||!cardGrid)return false;inner.classList.add('rc-micro');cardGrid.classList.add('rc-micro-grid');const card=cardGrid.querySelector('[data-sb-repeat]');if(card)card.classList.add('rc-micro-card');const body=card?.querySelector(':scope > div:not(.sv-media)');if(body)body.classList.add('rc-micro-copy');return true}
function smartStructure(doc,t){unwrapFormatFrame(doc);const section=pickRoot(doc);if(!section)return {section:null,layout:'generic'};const inner=section.querySelector('.sv-inner')||section;const id=String(t.tpl||'').toLowerCase();let layout='generic';
 if(id.includes('aboutmanifestostacked')&&specialAbout(doc,section,inner))layout='about';
 else if(id.includes('showreelasymmetricgrid')&&specialAsym(doc,section,inner))layout='asym';
 else if(id.includes('showreelmicrogrid')&&specialMicro(doc,section,inner))layout='micro';
 else if(id.includes('swisstypographicmatrix'))layout='matrix';
 else if(id.includes('swisstypoindexhero'))layout='indexhero';
 else if(id.includes('servicesrepeatrows'))layout='services';
 else if(id.includes('contactsplit'))layout='contact';
 else if(id.includes('showreelsplitdirections'))layout='directions';
 else if(id.includes('showreelstatementdirections')||id.includes('statementfullbleed'))layout='statement';
 else if(id.includes('converted169'))layout='manifest';
 else layout=genericSemantic(doc,section,inner);
 return {section,inner,layout};}
function genericSemantic(doc,section,inner){const media=inner.querySelectorAll('.sv-media,[data-sb-media]');const text=inner.querySelectorAll('[data-sb-editable][data-role="title"],[data-sb-editable][data-role="statement"],[data-sb-editable][data-role="body"]');if(media.length&&text.length>=2){inner.classList.add('rc-generic-split');return 'genericSplit'}return 'generic'}
/* ---- verbatim: targetCss(layout, method) ---- */
function targetCss(layout,mod,fmt){const FW=(fmt&&fmt.w)||1600,FH=(fmt&&fmt.h)||900;let css=`
html,body{margin:0!important;padding:0!important;width:${FW}px!important;min-width:${FW}px!important;height:${FH}px!important;min-height:${FH}px!important;max-height:${FH}px!important;overflow:hidden!important;box-sizing:border-box!important;background:#fff!important}
body{position:relative!important;--pad:4vw!important;overflow:hidden!important;font-family:Arial,sans-serif}
*,*:before,*:after{box-sizing:border-box}
.sv-section{position:absolute!important;left:0!important;top:0!important;width:${FW}px!important;height:${FH}px!important;min-height:0!important;max-height:${FH}px!important;margin:0!important;padding:54px 68px!important;overflow:hidden!important;box-sizing:border-box!important}
.sv-section>.sv-inner{width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-height:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
.sv-inner>*{min-width:0!important;max-width:100%!important}
[data-sb-editable], [data-sb-media],.sv-media{box-sizing:border-box!important;min-width:0!important}
.sv-media,[data-sb-media]{max-width:100%!important}
img,video,svg{max-width:100%;}
[data-role="overline"],[data-role="label"],[data-role="smallMeta"]{overflow-wrap:anywhere}
`;
 if(mod&&mod.css&&typeof mod.css.head==='function') css+=mod.css.head(layout);
 if(layout==='about')css+=`
.sv-section{padding:54px 76px!important}.rc-about-layout{width:100%;height:100%;display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);grid-template-rows:minmax(0,1fr) auto;gap:28px 56px;align-items:center}
.rc-about-copy{display:flex;flex-direction:column;gap:22px;min-width:0}.rc-about-copy [data-role="overline"]{margin:0!important}.rc-about-copy [data-role="statement"]{font-size:clamp(42px,4.3vw,69px)!important;line-height:1.02!important;margin:0!important;max-width:650px!important}
.rc-about-visual{min-width:0;display:flex;align-items:center;justify-content:center;max-height:100%;}.rc-about-visual .sv-media,.rc-about-visual [data-sb-media]{width:100%!important;aspect-ratio:2.6/1!important;height:auto!important;max-height:100%!important;margin:0!important}
.rc-about-footer{grid-column:1/-1;border-top:1px solid currentColor;padding-top:15px;min-width:0}.rc-about-footer>div{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:24px!important;border-top:0!important;padding-top:0!important}
`;
 if(layout==='services')css+=`
.sv-section{padding:56px 72px!important}.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:28px!important}.sv-inner>div:first-child{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:24px!important;margin:0!important;flex:none}.sv-inner>div:first-child [data-role="title"]{font-size:clamp(36px,4vw,64px)!important}.sv-inner [data-sb-repeat]{display:flex!important;flex-direction:column!important;justify-content:center!important;flex:1!important;min-height:0!important}.sv-inner [data-sb-repeat]>div{display:grid!important;grid-template-columns:72px minmax(260px,1.1fr) minmax(0,1.6fr)!important;gap:28px!important;align-items:center!important;padding:24px 0!important;border-top:1px solid currentColor!important}.sv-inner [data-sb-repeat] h3{font-size:clamp(28px,3vw,48px)!important;line-height:1.05!important}.sv-inner [data-sb-repeat] p{font-size:clamp(14px,1vw,16px)!important}
`;
 if(layout==='contact')css+=`
.sv-section{padding:64px 84px!important}.sv-inner{display:grid!important;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)!important;gap:clamp(50px,6vw,94px)!important;align-items:center!important}.sv-inner>div{min-width:0!important}.sv-inner>div:first-child{gap:clamp(12px,1.7vw,25px)!important}.sv-inner>div:nth-child(2){gap:clamp(17px,2vw,30px)!important;padding-top:0!important}.sv-inner [data-role="title"]{font-size:clamp(50px,5.2vw,82px)!important;line-height:1!important}.sv-inner [data-role="body"]{font-size:clamp(16px,1.25vw,20px)!important;line-height:1.5!important}
`;
 if(layout==='matrix')css+=`
.sv-section{padding:42px 52px!important}.sv-inner{height:100%!important}.sv-inner>div:first-child{height:100%!important;padding:26px!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:18px!important;overflow:hidden!important}.sv-inner>div:first-child>div:nth-child(1){grid-column:1/-1!important;padding-bottom:12px!important;min-width:0}.sv-inner>div:first-child>div:nth-child(2){margin:0!important;min-width:0}.sv-inner>div:first-child>div:nth-child(2) h2{font-size:clamp(48px,5.6vw,86px)!important;line-height:.96!important;overflow-wrap:anywhere!important}.sv-inner>div:first-child>div:nth-child(3){display:grid!important;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)!important;gap:30px!important;margin:0!important;min-height:0!important;align-items:center!important;overflow:hidden!important}.sv-inner>div:first-child>div:nth-child(3)>.sv-media{aspect-ratio:16/9!important;width:100%!important;max-height:100%!important}.sv-inner>div:first-child>div:nth-child(3)>div:last-child{min-width:0!important}
`;
 if(layout==='indexhero')css+=`
.sv-section{padding:42px 60px!important}.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto auto minmax(0,1fr)!important;gap:23px!important}.sv-inner>div:first-child{grid-column:1/-1!important;padding-bottom:13px!important;min-width:0}.sv-inner>div:nth-child(2){min-width:0!important}.sv-inner>div:nth-child(2) h1{font-size:clamp(60px,6.2vw,98px)!important;line-height:.94!important;letter-spacing:-.055em!important}.sv-inner>div:nth-child(2) p{font-size:clamp(17px,1.5vw,23px)!important;line-height:1.3!important;margin-top:18px!important;max-width:1050px!important}.sv-inner>div:nth-child(3){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:24px!important;border-top:1px solid currentColor!important;padding-top:18px!important;min-height:0!important;overflow:hidden!important}.sv-inner>div:nth-child(3)>div{min-width:0!important;display:grid!important;grid-template-rows:auto minmax(0,1fr) auto!important;gap:9px!important;min-height:0!important}.sv-inner>div:nth-child(3) .sv-media{width:100%!important;height:auto!important;aspect-ratio:16/9!important;max-height:100%!important}.sv-inner>div:nth-child(3) p{font-size:13px!important;line-height:1.35!important}
`;
 if(layout==='directions')css+=`
.sv-section{padding:64px 76px!important}.sv-inner{display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)!important;gap:clamp(40px,5vw,76px)!important;align-items:center!important}.sv-inner>div:first-child{min-width:0!important}.sv-inner>div:first-child [data-sb-repeat]{gap:clamp(12px,1.4vw,22px)!important}.sv-inner>div:first-child h2{font-size:clamp(37px,4.2vw,66px)!important}.sv-inner>div:first-child p{font-size:clamp(13px,1vw,16px)!important;margin-top:12px!important}.sv-inner>.sv-media,[data-sb-media]{align-self:center!important;width:100%!important;aspect-ratio:16/9!important;max-height:100%!important}
`;
 if(layout==='micro')css+=`
.sv-section{padding:52px 68px!important}.rc-micro{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:23px!important}.rc-micro>div:first-child{margin:0!important;padding-bottom:14px!important}.rc-micro-grid{min-height:0!important;display:block!important;overflow:hidden!important}.rc-micro-card{height:100%!important;display:grid!important;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr)!important;gap:34px!important;align-items:center!important}.rc-micro-card>.sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}.rc-micro-copy{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:14px!important}.rc-micro-copy p{font-size:clamp(17px,1.4vw,22px)!important;line-height:1.5!important}
`;
 if(layout==='asym')css+=`
.sv-section{padding:48px 62px!important}.rc-asym{display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)!important;grid-template-rows:repeat(3,minmax(0,1fr))!important;gap:16px 28px!important;align-items:center!important}.rc-asym>*{min-width:0!important;max-width:100%!important;margin:0!important}.rc-asym>*:nth-child(1){grid-column:1!important;grid-row:1/-1!important;display:flex!important;align-items:center!important;justify-content:center!important}.rc-asym>*:nth-child(1) .sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}.rc-asym>*:nth-child(2){grid-column:2!important;grid-row:1!important;display:flex!important;flex-direction:column!important;gap:8px!important;justify-content:flex-end!important}.rc-asym>*:nth-child(2) .sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}.rc-asym>*:nth-child(3){grid-column:2!important;grid-row:2!important;align-self:center!important}.rc-asym>*:nth-child(3) h4{font-size:clamp(20px,2.1vw,31px)!important;margin:0 0 6px!important}.rc-asym>*:nth-child(3) p{font-size:13px!important;margin:0!important}.rc-asym>*:nth-child(4){grid-column:2!important;grid-row:3!important;display:flex!important;align-items:flex-start!important}.rc-asym>*:nth-child(4) .sv-media{width:100%!important;aspect-ratio:16/9!important;height:auto!important;max-height:100%!important}
`;
 if(layout==='statement'||layout==='manifest')css+=`
.sv-section{padding:66px 76px!important;display:flex!important;align-items:center!important}.sv-inner{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:clamp(17px,2vw,28px)!important}.sv-inner [data-role="statement"]{font-size:clamp(44px,5.4vw,84px)!important;line-height:1.06!important;letter-spacing:-.045em!important;max-width:1320px!important;margin:0!important}.sv-inner>div{min-width:0!important}.sv-inner [style*="margin-bottom"]{margin-bottom:0!important}.sv-inner [data-role="overline"]{margin:0!important}
`;
 if(layout==='genericSplit')css+=`
.sv-section{padding:54px 68px!important}.rc-generic-split{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;gap:32px!important;align-items:center!important}.rc-generic-split .sv-media,.rc-generic-split [data-sb-media]{max-width:100%!important;max-height:100%!important;aspect-ratio:16/9!important}
`;
 if(mod&&mod.css&&typeof mod.css.tail==='function') css+=mod.css.tail(layout);
 return css;}
/* ---- verbatim: измерение и проверка переполнения ---- */
function measuredContentHeight(doc){let max=0,min=0;const nodes=doc.body.querySelectorAll(':scope > *');nodes.forEach(el=>{if(['STYLE','SCRIPT','LINK'].includes(el.tagName))return;const r=el.getBoundingClientRect();if(Number.isFinite(r.bottom)){max=Math.max(max,r.bottom);min=Math.min(min,r.top)}});for(const el of doc.querySelectorAll('body > *')){if(['STYLE','SCRIPT','LINK'].includes(el.tagName))continue;const r=el.getBoundingClientRect();max=Math.max(max,r.bottom)}return Math.max(240,Math.ceil(max-min));}
function waitFrame(frame){return new Promise((resolve,reject)=>{frame.onload=()=>{try{requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(frame.contentDocument)))}catch(e){reject(e)}};frame.onerror=()=>reject(new Error('Не удалось показать HTML'))})}
function findTextElements(doc){return [...doc.querySelectorAll('[data-sb-editable],h1,h2,h3,h4,p,span,li')].filter(el=>el.children.length===0||el.matches('[data-sb-editable]'))}
function fitDown(doc,limit=8){const section=pickRoot(doc);if(!section)return {factor:1,overflow:[]};let factor=1;let report=checkOverflow(doc);for(let i=0;i<limit&&report.length;i++){factor*=.94;const all=doc.querySelectorAll('.sv-section [data-sb-editable],.sv-section h1,.sv-section h2,.sv-section h3,.sv-section h4,.sv-section p,.sv-section span,.sv-section .sv-media,.sv-section [data-sb-media],.sv-section [style*="gap"],.sv-section [style*="padding"],.sv-section [style*="margin"]');all.forEach(el=>{const cs=doc.defaultView.getComputedStyle(el);if(el.matches('[data-sb-editable],h1,h2,h3,h4,p,span')){const fs=parseFloat(cs.fontSize);if(fs>8)el.style.setProperty('font-size',Math.max(9,fs*.94)+'px','important');const lh=parseFloat(cs.lineHeight);if(Number.isFinite(lh)&&lh>10)el.style.setProperty('line-height',Math.max(1,lh*.94)+'px','important')}if(/gap/i.test(el.getAttribute('style')||'')){['gap','row-gap','column-gap'].forEach(k=>{const v=parseFloat(cs.getPropertyValue(k));if(Number.isFinite(v)&&v>5)el.style.setProperty(k,Math.max(4,v*.94)+'px','important')})}if(/padding/i.test(el.getAttribute('style')||'')){['padding-top','padding-bottom','padding-left','padding-right'].forEach(k=>{const v=parseFloat(cs.getPropertyValue(k));if(Number.isFinite(v)&&v>4)el.style.setProperty(k,Math.max(3,v*.94)+'px','important')})}if(el.matches('.sv-media,[data-sb-media]')){el.style.setProperty('max-height','330px','important');el.style.setProperty('max-width','100%','important')}});report=checkOverflow(doc)}return {factor,overflow:report}}
function checkOverflow(doc){const section=pickRoot(doc);if(!section)return [{name:'Основной контейнер',reason:'не найден .sv-section'}];const base=section.getBoundingClientRect();const list=[];const items=[...section.querySelectorAll('[data-sb-editable],[data-sb-media],.sv-media,img,video,h1,h2,h3,h4,p')];for(const el of items){const r=el.getBoundingClientRect();const name=(el.getAttribute('data-slot')||el.getAttribute('data-role')||el.tagName.toLowerCase()).slice(0,45);let why='';if(r.left<base.left-1||r.right>base.right+1)why='за левой/правой границей';if(r.top<base.top-1||r.bottom>base.bottom+1)why+=(why?' и ':'')+'за верхней/нижней границей';const cs=doc.defaultView.getComputedStyle(el);if(!why&&(cs.overflowY==='hidden'||cs.overflowY==='clip')&&el.scrollHeight>el.clientHeight+3)why='внутренний контент обрезается';if(!why&&(cs.overflowX==='hidden'||cs.overflowX==='clip')&&el.scrollWidth>el.clientWidth+3)why='горизонтальный контент обрезается';if(why)list.push({name,reason:why,top:Math.round(r.top-base.top),bottom:Math.round(r.bottom-base.top)})}return list.slice(0,16)}
/* ---- параметризовано по кадру fmt: targetDoc, smartCssFixes ---- */
function targetDoc(html,fmt){html=vwToPx(vhToPx(stripRemoteFontImports(html)),fmt.w);return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${fmt.w}, initial-scale=1"></head><body style="--pad:4vw">${html}</body></html>`}
function smartCssFixes(doc,layout,mod,fmt,t){const sec=pickRoot(doc);if(sec){setInline(sec,{position:'absolute',left:'0',top:'0',width:fmt.w+'px',height:fmt.h+'px','min-height':'0','max-height':fmt.h+'px',overflow:'hidden','box-sizing':'border-box'});const inner=sec.querySelector('.sv-inner');if(inner){setInline(inner,{width:'100%',height:'100%','max-width':'none','min-height':'0','max-height':'100%',margin:'0','box-sizing':'border-box'});}}
 let css=targetCss(layout,mod,fmt);if(fmt&&fmt.h>fmt.w)css+='\n'+portraitCss(layout,mod.id,t);createStyle(doc,css);}

function portraitCss(layout,method,t){
 const id=String(t?.tpl||'').toLowerCase();
 let css=`
html,body{width:900px!important;min-width:900px!important;height:1600px!important;min-height:1600px!important;max-height:1600px!important;overflow:hidden!important}
body{overflow:hidden!important}
.sv-section{width:900px!important;height:1600px!important;min-height:1600px!important;max-height:1600px!important;padding:58px 52px!important;overflow:hidden!important}
.sv-section>.sv-inner{width:100%!important;height:100%!important;max-width:none!important;max-height:100%!important;min-height:0!important;min-width:0!important;box-sizing:border-box!important}
.sv-inner>*{min-width:0!important;max-width:100%!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"],.sv-inner h1,.sv-inner h2{font-size:clamp(34px,6.2vw,58px)!important;line-height:1.02!important;letter-spacing:-.035em!important;overflow-wrap:anywhere!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,2.4vw,23px)!important;line-height:1.25!important}
.sv-inner [data-role="body"],.sv-inner p{font-size:clamp(14px,1.7vw,18px)!important;line-height:1.45!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:11px!important;line-height:1.35!important;overflow-wrap:anywhere!important}
.sv-media,[data-sb-media]{max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
img,video,svg{max-width:100%!important;height:auto}
`;
 // Method baseline: portrait compositions should stack, not retain desktop columns.
 if(method==='compact'||method==='fit') css+=`.sv-section{padding:44px 42px!important}.sv-inner{gap:16px!important}.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(29px,5.5vw,50px)!important;line-height:1.04!important}.sv-inner [data-role="body"],.sv-inner p{font-size:14px!important;line-height:1.42!important}`;
 if(method==='smart') css+=`.sv-section{padding:58px 52px!important}.sv-inner{gap:22px!important}`;
 if(method==='split') css+=`.sv-section{padding:50px 46px!important}.sv-inner{gap:18px!important}`;
 if(id.includes('aboutmanifestostacked')) css+=`
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:20px!important}
.rc-about-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr) auto!important;gap:20px!important;align-items:start!important}
.rc-about-copy{display:flex!important;flex-direction:column!important;gap:14px!important;min-width:0!important}
.rc-about-copy [data-role="statement"]{font-size:clamp(38px,6.1vw,55px)!important;line-height:1.02!important;max-width:100%!important}
.rc-about-visual{min-height:0!important;max-height:100%!important;align-items:center!important}
.rc-about-visual .sv-media,.rc-about-visual [data-sb-media]{aspect-ratio:2.1/1!important;width:100%!important;max-height:360px!important}
.rc-about-footer{grid-column:1!important;padding-top:12px!important}
.rc-about-footer>div{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
.sv-inner>div:nth-child(3)[data-sb-media],.sv-inner>.sv-media{max-height:340px!important}
`;
 if(id.includes('servicesrepeatrows')) css+=`
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:26px!important}
.sv-inner>div:first-child{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:8px!important;margin:0!important}
.sv-inner>div:first-child [data-role="title"]{font-size:clamp(39px,6.5vw,58px)!important}
.sv-inner [data-sb-repeat]{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:0!important}
.sv-inner [data-sb-repeat]>div{display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:12px!important;align-items:start!important;padding:18px 0!important}
.sv-inner [data-sb-repeat]>div h3{grid-column:2!important;font-size:clamp(24px,4.6vw,38px)!important;line-height:1.05!important}
.sv-inner [data-sb-repeat]>div p{grid-column:2!important;margin-top:4px!important}
`;
 if(id.includes('contactsplit')) css+=`
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:30px!important}
.sv-inner>div:first-child,.sv-inner>div:nth-child(2){width:100%!important;min-width:0!important;gap:14px!important;padding-top:0!important}
.sv-inner [data-role="title"]{font-size:clamp(46px,7vw,62px)!important}
.sv-inner [data-role="body"]{max-width:100%!important;font-size:16px!important;line-height:1.5!important}
`;
 if(id.includes('swisstypographicmatrix')) css+=`
.sv-inner>div:first-child{display:flex!important;flex-direction:column!important;gap:20px!important;padding:20px!important;height:100%!important;overflow:hidden!important}
.sv-inner>div:first-child>div:nth-child(1){display:flex!important;flex-wrap:wrap!important;gap:8px 18px!important;padding-bottom:12px!important}
.sv-inner>div:first-child>div:nth-child(2){margin:0!important}
.sv-inner>div:first-child>div:nth-child(2) h2{font-size:clamp(38px,6.5vw,58px)!important;line-height:1!important}
.sv-inner>div:first-child>div:nth-child(3){display:flex!important;flex-direction:column!important;gap:18px!important;margin:0!important;min-height:0!important;overflow:hidden!important}
.sv-inner>div:first-child>div:nth-child(3)>.sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:320px!important}
`;
 if(id.includes('swisstypoindexhero')) css+=`
.sv-inner{display:flex!important;flex-direction:column!important;gap:20px!important}
.sv-inner>div:first-child{display:flex!important;flex-wrap:wrap!important;gap:12px!important;align-items:flex-end!important;padding-bottom:12px!important}
.sv-inner>div:nth-child(2) h1{font-size:clamp(43px,7.3vw,66px)!important;line-height:.98!important;letter-spacing:-.05em!important}
.sv-inner>div:nth-child(2) p{font-size:17px!important;line-height:1.35!important;margin-top:16px!important}
.sv-inner>div:nth-child(3){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;padding-top:16px!important;min-height:0!important;overflow:hidden!important}
.sv-inner>div:nth-child(3)>div{display:flex!important;flex-direction:column!important;gap:9px!important;min-height:0!important}
.sv-inner>div:nth-child(3) .sv-media{width:100%!important;aspect-ratio:4/3!important;max-height:230px!important}
.sv-inner>div:nth-child(3) p{font-size:12px!important;line-height:1.35!important}
`;
 if(id.includes('showreelsplitdirections')) css+=`
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:26px!important}
.sv-inner>div:first-child{width:100%!important;min-width:0!important;gap:14px!important}
.sv-inner>div:first-child [data-sb-repeat]{display:flex!important;flex-direction:column!important;gap:9px!important}
.sv-inner>div:first-child h2{font-size:clamp(38px,6.4vw,55px)!important;line-height:1!important}
.sv-inner>div:first-child p{margin-top:4px!important}
.sv-inner>.sv-media,.sv-inner>[data-sb-media]{width:100%!important;aspect-ratio:16/9!important;max-height:420px!important}
`;
 if(id.includes('showreelmicrogrid')) css+=`
.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:20px!important}
.sv-inner>div:first-child{margin:0!important;padding-bottom:12px!important}
.sv-inner>div:nth-child(2){min-height:0!important;display:block!important;overflow:hidden!important}
.sv-inner [data-sb-repeat]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto auto!important;gap:14px!important;height:100%!important}
.sv-inner [data-sb-repeat]>.sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:450px!important}
.sv-inner [data-sb-repeat]>div:not(.sv-media){display:flex!important;flex-direction:column!important;gap:8px!important}
`;
 if(id.includes('showreelasymmetricgrid')) css+=`
.rc-asym{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:auto auto auto!important;gap:14px!important;align-items:start!important}
.rc-asym>*{min-width:0!important;max-width:100%!important;margin:0!important}
.rc-asym>*:nth-child(1){grid-column:1/-1!important;grid-row:1!important;display:flex!important;align-items:center!important}
.rc-asym>*:nth-child(1) .sv-media{width:100%!important;aspect-ratio:16/9!important;max-height:400px!important}
.rc-asym>*:nth-child(2){grid-column:1!important;grid-row:3!important;display:flex!important;flex-direction:column!important;gap:8px!important}
.rc-asym>*:nth-child(2) .sv-media,.rc-asym>*:nth-child(4) .sv-media{width:100%!important;aspect-ratio:4/3!important;max-height:240px!important}
.rc-asym>*:nth-child(3){grid-column:1/-1!important;grid-row:2!important;align-self:center!important}
.rc-asym>*:nth-child(3) h4{font-size:clamp(23px,4vw,32px)!important;margin:0 0 6px!important}
.rc-asym>*:nth-child(3) p{font-size:13px!important;margin:0!important}
.rc-asym>*:nth-child(4){grid-column:2!important;grid-row:3!important;display:flex!important;align-items:flex-start!important}
`;
 if(id.includes('showreelstatementdirections')||id.includes('statementfullbleed')||id.includes('converted169')) css+=`
.sv-inner{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:24px!important}
.sv-inner [data-role="statement"]{font-size:clamp(38px,6.8vw,64px)!important;line-height:1.08!important;letter-spacing:-.035em!important;max-width:100%!important}
.sv-inner [style*="margin-bottom"]{margin-bottom:0!important}
.sv-inner>div{min-width:0!important}
`;
 if(layout==='genericSplit'||layout==='generic') css+=`
.sv-inner.rc-generic-split{display:flex!important;flex-direction:column!important;gap:24px!important}
.sv-inner .sv-media,.sv-inner [data-sb-media]{width:100%!important;max-width:100%!important;aspect-ratio:16/9!important;max-height:420px!important}
`;
 // Vertical split always stacks semantic pieces; don't force columns in the portrait frame.
 if(method==='split') css+=`.sv-section>.sv-inner{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:22px!important}.sv-section>.sv-inner>*{width:100%!important;min-width:0!important}`;
 css+=`\n[data-sb-format-inner]{position:static!important;left:auto!important;top:auto!important;width:900px!important;height:1600px!important;transform:none!important;overflow:visible!important}`;
 return css;
}


/* ---- слой вывода (новый код; алгоритмов не меняет) ---- */
const ROLE_GROUPS = {
  title:    ['title','statement','heading','h1'],
  body:     ['body','text','description'],
  subtitle: ['subtitle','overline','kicker','tag'],
  meta:     ['meta','smallMeta','label','link']
};
const MARKER_ATTRS = ['data-sb-editable','data-sb-media','data-slot','data-role','data-kind','data-sb-repeat'];

function rcHash(s){
  let h = 5381;
  for(let i=0;i<s.length;i++) h = ((h*33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8,'0');
}
function rcId(html, method, fmtId){ return 'rc-' + rcHash(html+'|'+method+'|'+fmtId+'|'+ALGO); }
const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

function rcFrame(fmt){
  const f = document.createElement('iframe');
  f.title = 'Recompose engine';
  f.setAttribute('sandbox','allow-same-origin');
  f.style.cssText = `position:fixed;left:-10px;top:-10px;width:${fmt.w}px;height:${fmt.h}px;opacity:0;pointer-events:none;border:0`;
  document.body.appendChild(f);
  return f;
}
async function rcFonts(doc){
  try{ await Promise.race([Promise.resolve(doc.fonts.ready).catch(()=>{}), new Promise(r=>setTimeout(r,1200))]) }catch(e){}
}

// Роли, медиа и маркеры — состояние до изменений
function rcRoles(doc){
  const out = {title:0, body:0, subtitle:0, meta:0, other:[]};
  doc.body.querySelectorAll('[data-role]').forEach(e=>{
    const r = e.getAttribute('data-role');
    const g = Object.keys(ROLE_GROUPS).find(k=>ROLE_GROUPS[k].includes(r));
    if(g) out[g]++; else out.other.push(r);
  });
  out.other = [...new Set(out.other)];
  return out;
}
function rcMarkers(doc){
  const o = {};
  MARKER_ATTRS.forEach(a => o[a] = doc.body.querySelectorAll('['+a+']').length);
  return o;
}
function rcMissing(doc, mod){
  const miss = [];
  const eds = [...doc.body.querySelectorAll('[data-sb-editable]')];
  if(!eds.length) miss.push('нет data-sb-editable: тексты ищутся по тегам h1–h4/p/span/li');
  const noRole = eds.filter(e=>!e.hasAttribute('data-role')).length;
  if(noRole) miss.push(`data-role не задан у ${noRole} текстовых элементов`);
  const media = [...doc.body.querySelectorAll('[data-sb-media],.sv-media')];
  if(!media.length) miss.push('нет медиа-слота (data-sb-media / .sv-media)');
  const noSlot = media.filter(e=>!e.hasAttribute('data-slot')).length;
  if(noSlot) miss.push(`data-slot не задан у ${noSlot} медиа-слотов`);
  if((mod&&mod.titleRole) && !doc.body.querySelector('[data-role="title"],[data-role="statement"]'))
    miss.push('нет роли title/statement: реконструкция по ролям переходит в generic');
  return miss;
}
// Снимок структуры: тексты, медиа, слоты, роли, виды, repeat-зоны
function rcSnapshot(doc){
  const b = doc.body;
  const txt = el => (el.textContent||'').replace(/\s+/g,' ').trim();
  const attrs = (sel,a) => [...b.querySelectorAll(sel)].map(e=>e.getAttribute(a)||'').sort();
  return {
    editable: [...b.querySelectorAll('[data-sb-editable]')].map(txt).sort(),
    media: b.querySelectorAll('[data-sb-media],.sv-media').length,
    slots: attrs('[data-slot]','data-slot'),
    roles: attrs('[data-role]','data-role'),
    kinds: attrs('[data-kind]','data-kind'),
    repeats: attrs('[data-sb-repeat]','data-sb-repeat')
  };
}
// Минимальный кегль текстовых элементов (px); null если текста нет
function rcMinFont(doc){
  let min = Infinity;
  doc.body.querySelectorAll('[data-sb-editable],h1,h2,h3,h4,p,span,li').forEach(el=>{
    if(!(el.textContent||'').trim()) return;
    if(el.children.length && !el.matches('[data-sb-editable]')) return;
    const fs = parseFloat(doc.defaultView.getComputedStyle(el).fontSize);
    if(Number.isFinite(fs)) min = Math.min(min, fs);
  });
  return Number.isFinite(min) ? min : null;
}
function rcDiff(a,b){
  const d = [];
  for(const k of Object.keys(a)){
    const x = JSON.stringify(a[k]), y = JSON.stringify(b[k]);
    if(x!==y) d.push({key:k, before: Array.isArray(a[k])?a[k].length:a[k], after: Array.isArray(b[k])?b[k].length:b[k]});
  }
  return d;
}

/* ---- изоляция CSS: правила шаблона получают префикс, не затрагивая Sandbox ---- */
function scopeCss(css, scope, rootScope){
  const s = String(css||'').replace(/\/\*[\s\S]*?\*\//g,'');
  return scopeBlock(s, scope, rootScope);
}
function scopeBlock(s, scope, rootScope){
  let out = '', i = 0;
  while(i < s.length){
    if(/\s/.test(s[i])){ i++; continue; }
    let j = i, depth = 0;
    while(j < s.length && !(depth===0 && (s[j]==='{' || s[j]===';'))){
      if(s[j]==='(') depth++; else if(s[j]===')') depth--; j++;
    }
    if(j >= s.length) break;
    const prelude = s.slice(i,j).trim();
    if(s[j] === ';'){ out += prelude + ';'; i = j+1; continue; }
    let k = j+1, d = 1;
    while(k < s.length && d > 0){ if(s[k]==='{') d++; else if(s[k]==='}') d--; k++; }
    const inner = s.slice(j+1, k-1);
    if(prelude.startsWith('@')){
      if(/^@(media|supports|container|layer|document)/i.test(prelude)) out += `${prelude}{${scopeBlock(inner,scope,rootScope)}}`;
      else out += `${prelude}{${inner}}`; // @font-face, @keyframes — без изменений
    } else {
      out += `${scopeSelectors(prelude,scope,rootScope)}{${inner}}`;
    }
    i = k;
  }
  return out;
}
function scopeSelectors(sel, scope, rootScope){
  const parts = []; let depth = 0, cur = '';
  for(const ch of sel){
    if(ch==='('||ch==='[') depth++; else if(ch===')'||ch===']') depth--;
    if(ch===',' && depth===0){ parts.push(cur); cur=''; } else cur += ch;
  }
  parts.push(cur);
  return parts.map(p=>{
    p = p.trim(); if(!p) return '';
    if(/^(html|body|:root)(?![\w-])/i.test(p)) return rootScope + p.replace(/^(html|body|:root)/i,'');
    return scope + ' ' + p;
  }).filter(Boolean).join(', ');
}

// Канонический результат: самостоятельный HTML. Корень — 16:9 (aspect-ratio, width:100%),
// внутри — рабочий кадр fmt.w×fmt.h в своих координатах. Масштаб задаётся шириной корня:
// scale(calc(100cqw / 1600px)); fallback scale(previewW/w) для движков без cqw в calc.
// Предпросмотр Sandbox — это тот же HTML, без собственной оболочки с размерами.
function rcFragment(doc, id, fmt){
  const scope = `[data-rc-id="${id}"]`, rootScope = `${scope} .rc-stage`;
  const k = fmt.previewW / fmt.w;
  const css = [...doc.querySelectorAll('style')].map(s=>s.textContent||'').join('\n');
  const b = doc.body.cloneNode(true);
  b.querySelectorAll('style,script,link').forEach(n=>n.remove());
  const bodyStyle = vwToPx(doc.body.getAttribute('style')||'', fmt.w).replace(/"/g,"'");
  return `<div class="rc-frame" data-rc-id="${id}" data-rc-format="${fmt.id}" style="position:relative;width:100%;aspect-ratio:${fmt.w}/${fmt.h};overflow:hidden;box-sizing:border-box;container-type:inline-size">`
    + `<style>${scopeCss(vwToPx(css,fmt.w), scope, rootScope)}</style>`
    + `<div class="rc-stage" style="position:absolute;left:0;top:0;width:${fmt.w}px;height:${fmt.h}px;transform-origin:0 0;${bodyStyle}">${b.innerHTML}</div>`
    + `</div>`;
}

// Аудит границ по всем отрисованным элементам секции (не только по маркерам).
// Классы: overflow (вышло за кадр), clipped (обрезано внутренним контейнером с overflow hidden/clip),
// cover (намеренная обрезка object-fit/background-size: cover, не дефект), unverifiable (не проверяется).
const AUDIT_SKIP = new Set(['STYLE','SCRIPT','LINK','META','TITLE','TEMPLATE','NOSCRIPT','DEFS','CLIPPATH','MASK','PATTERN','SYMBOL']);
function rcAudit(doc, section){
  const out = { overflow:[], clipped:[], cover:[], unverifiable:[], checked:0 };
  if(!section) return out;
  const win = doc.defaultView, base = section.getBoundingClientRect();
  const nm = el => (el.getAttribute('data-slot')||el.getAttribute('data-role')||el.tagName.toLowerCase()).slice(0,45);
  const box = r => ({top:Math.round(r.top-base.top), bottom:Math.round(r.bottom-base.top), left:Math.round(r.left-base.left), right:Math.round(r.right-base.left)});
  const UNV = new Set(['IFRAME','VIDEO','CANVAS','OBJECT','EMBED','PICTURE']);
  for(const el of section.querySelectorAll('*')){
    const tag = el.tagName.toUpperCase();
    if(AUDIT_SKIP.has(tag) || el.closest('defs,clipPath,mask,pattern,symbol')) continue;
    if(UNV.has(tag)) out.unverifiable.push(tag.toLowerCase());
    const cs = win.getComputedStyle(el);
    if(cs.display==='none' || cs.visibility==='hidden') continue;
    const r = el.getBoundingClientRect();
    if(r.width<=0 && r.height<=0) continue;
    out.checked++;
    // ближайший внутренний обрезающий контейнер (сама секция — граница кадра, а не контейнер)
    let clipper = null;
    for(let p=el.parentElement; p && p!==section; p=p.parentElement){
      const pc = win.getComputedStyle(p);
      if(/hidden|clip/.test(pc.overflowX+' '+pc.overflowY)){ clipper = p; break; }
    }
    const outOf = (rr, rc) => r.left<rc.left-1 || r.right>rc.right+1 || r.top<rc.top-1 || r.bottom>rc.bottom+1;
    if(clipper && outOf(r, clipper.getBoundingClientRect())){
      out.clipped.push({name:nm(el), reason:`обрезано контейнером ${nm(clipper)} (overflow hidden)`, ...box(r)});
    } else if(outOf(r, base)){
      out.overflow.push({name:nm(el), reason:'выходит за границы кадра', ...box(r)});
    }
    if(/hidden|clip/.test(cs.overflowX+' '+cs.overflowY) && (el.scrollHeight>el.clientHeight+3 || el.scrollWidth>el.clientWidth+3)){
      out.clipped.push({name:nm(el), reason:'внутреннее содержимое обрезано (overflow hidden)', ...box(r)});
    }
    if((tag==='IMG'||el.matches('[data-sb-media],.sv-media')) && (cs.objectFit==='cover' || cs.backgroundSize==='cover')){
      out.cover.push(nm(el));
    }
  }
  out.unverifiable = [...new Set(out.unverifiable)];
  out.cover = [...new Set(out.cover)];
  return out;
}

function recommend(t, html){
  const r = chooseRecommended(t, html || String((t&&t.html)||''));
  return { method: r.method, methodName: methodNames[r.method], why: r.why, roles: r.roles, media: r.media };
}

// Контекст вызова модуля: общие функции движка (HTML, измерение, проверка переполнения, подгонка).
// Алгоритм метода живёт в модуле; здесь только доступ к общим функциям.
function rcAdaptCtx(doc, t, fmt, mod){
  return {
    doc, t, fmt, method: mod.id,
    pickRoot: () => pickRoot(doc),
    unwrap: () => unwrapFormatFrame(doc),
    smartStructure: () => smartStructure(doc, t),
    checkOverflow: () => checkOverflow(doc),
    fitDown: (limit) => fitDown(doc, limit),
    applyCss: (layout) => smartCssFixes(doc, layout, mod, fmt, t),
    raf2,
    shared: window.RecomposeAdaptationShared || {}
  };
}

/* ---- основной конвейер ---- */
async function rcConvert(t, method, opts){
  opts = opts || {};
  const mod = adaptGet(method);
  if(!mod) throw new Error('Неизвестный метод: '+method);
  if(typeof mod.adapt !== 'function') throw new Error('Модуль без кода: '+method);
  const fmt = getFormat(opts.format);
  const html = String((t && t.html) || '');
  const started = performance.now();
  const diag = { measure:{h1:0,h2:0}, stable:false, rootFound:false, rootTag:'', rootClass:'',
                 roles:null, markers:null, media:{count:0,slots:[]}, handler:'generic', missing:[], sourceOverflow:[] };
  const res = { ok:false, status:'failed', method, methodName: mod.name, format: fmt.id, algo: ALGO,
                layout:'generic', handler:'generic', fit:{factor:1,steps:0}, overflow:[], minFont:null,
                warnings:[], reasons:[], notes:[], clipped:[], cover:[], unverifiable:[], audited:0,
                frame:{working:{w:fmt.w,h:fmt.h}, aspect:fmt.id, contractCanvas:fmt.contractCanvas||null},
                bounds:{w:fmt.w,h:fmt.h,inside:false,overflowCount:0,clippedCount:0},
                structure:{preserved:false, diffs:[]}, diagnostics: diag, html:'', id:'', error:'' };
  const frame = rcFrame(fmt);
  try{
    frame.srcdoc = targetDoc(html, fmt);
    await waitFrame(frame);
    const doc = frame.contentDocument;
    await rcFonts(doc);

    // 1. стабильность замера: две высоты подряд
    const h1 = measuredContentHeight(doc); await raf2(); const h2 = measuredContentHeight(doc);
    diag.measure = {h1, h2}; diag.stable = h1 === h2;

    // 2. диагностика до изменений
    const root = pickRoot(doc);
    diag.rootFound = !!root;
    if(root){ diag.rootTag = root.tagName.toLowerCase(); diag.rootClass = String(root.className||''); }
    diag.roles = rcRoles(doc);
    diag.markers = rcMarkers(doc);
    const media = [...doc.body.querySelectorAll('[data-sb-media],.sv-media')];
    diag.media = { count: media.length, slots: media.map(e=>e.getAttribute('data-slot')||'(без slot)') };
    diag.missing = rcMissing(doc, mod);
    diag.sourceOverflow = checkOverflow(doc);
    const before = rcSnapshot(doc);
    const minFontBefore = rcMinFont(doc);

    // 3–4. собственная логика метода — в модуле (adaptation-modules/<id>/module.js):
    //      структура, CSS, подгонка. Возвращает {layout, fit}.
    const done = await mod.adapt(rcAdaptCtx(doc, t, fmt, mod));
    const semantic = { layout: done.layout };
    diag.handler = semantic.layout;
    let fit = done.fit;
    await raf2();
    fit.overflow = checkOverflow(doc);
    // аудит всех отрисованных элементов: объединяем с checkOverflow (без дублей)
    const audit = rcAudit(doc, pickRoot(doc));
    const seen = new Set(fit.overflow.map(o=>o.name+'|'+o.reason));
    audit.overflow.forEach(o=>{ if(!seen.has(o.name+'|'+o.reason)){ seen.add(o.name+'|'+o.reason); fit.overflow.push(o); } });

    // 5. проверка структуры и читаемости
    const after = rcSnapshot(doc);
    const diffs = rcDiff(before, after);
    const minFont = rcMinFont(doc);

    const steps = fit.factor < 1 ? Math.round(Math.log(fit.factor)/Math.log(0.94)) : 0;
    res.layout = semantic.layout; res.handler = semantic.layout;
    res.fit = { factor: Math.round(fit.factor*1000)/1000, steps };
    res.overflow = fit.overflow;
    res.minFont = minFont !== null ? Math.round(minFont*10)/10 : null;
    res.minFontSource = minFontBefore !== null ? Math.round(minFontBefore*10)/10 : null;
    res.bounds = { w: fmt.w, h: fmt.h, inside: fit.overflow.length===0 && audit.clipped.length===0, overflowCount: fit.overflow.length, clippedCount: audit.clipped.length };
    res.clipped = audit.clipped.slice(0,30); res.cover = audit.cover; res.unverifiable = audit.unverifiable; res.audited = audit.checked;
    res.structure = { preserved: diffs.length===0, diffs };
    res.id = opts.id || rcId(html, method, fmt.id);
    res.html = rcFragment(doc, res.id, fmt);

    // 6. сообщения
    if(!diag.rootFound) res.reasons.push('корень .sv-section не найден: использован общий контейнер');
    if(!diag.stable) res.warnings.push('замер нестабилен: высота изменилась между двумя замерами');
    if(fit.factor < 1) res.warnings.push(`текст уменьшен до ${Math.round(fit.factor*100)}% для помещения в кадр`);
    // предупреждение только если движок опустил кегль ниже 12 px; исходные мелкие подписи — заметка
    if(res.minFont !== null && res.minFont < 12){
      if(res.minFontSource === null || res.minFont < res.minFontSource - 0.05) res.warnings.push(`минимальный кегль ${res.minFont} px (ниже 12 px) после уменьшения`);
      else res.notes.push(`в исходнике есть мелкий кегль ${res.minFont} px — не изменён движком`);
    }
    fit.overflow.forEach(o => res.reasons.push(`переполнение: ${o.name} — ${o.reason}`));
    audit.clipped.slice(0,10).forEach(o => res.reasons.push(`скрыто обрезание: ${o.name} — ${o.reason}`));
    if(audit.cover.length) res.notes.push(`намеренная обрезка cover (не дефект): ${audit.cover.join(', ')}`);
    if(audit.unverifiable.length) res.notes.push(`не проверяется надёжно: ${audit.unverifiable.join(', ')} (содержимое встроенных объектов)`);
    res.notes.push('ограничение аудита: псевдоэлементы, фоновые изображения и перенос текста внутри контейнера без overflow не проверяются');
    if(diffs.length) res.warnings.push('структура или текст изменились: ' + diffs.map(d=>d.key).join(', '));
    if(semantic.layout==='generic') res.notes.push('специальный обработчик не применён: работает семантический fallback (generic)');
    diag.missing.forEach(m => res.notes.push('нет маркера: ' + m));
    res.status = diffs.length ? 'failed' : (fit.overflow.length || audit.clipped.length || fit.factor < 1 || res.warnings.length) ? 'warning' : 'ok';
    res.ok = res.status !== 'failed';
  } catch(e){
    res.error = String((e && e.message) || e);
    res.status = 'failed';
    res.reasons.push('ошибка движка: ' + res.error);
  } finally {
    frame.remove();
  }
  res.ms = Math.round(performance.now() - started);
  return res;
}

// Самодостаточный документ 1600×900 (целевые координаты) для изолированного показа/измерения.
// Фрагмент rcConvert().html не меняется; стили хоста (глобальный сброс margin и т.п.) сюда не попадают.
function rcToDocument(html, fmt){
  const f = FORMATS[fmt||'16:9']||FORMATS['16:9'];
  const w = f.w, h = f.h;
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width='+w+'">'
    + '<style>html,body{margin:0;padding:0;width:'+w+'px;height:'+h+'px;overflow:hidden;background:#fff}</style></head><body>'
    + String(html||'') + '</body></html>';
}
window.RecomposeCore = {
  ALGO, FORMATS, methodNames, methodHelp,
  get METHODS(){ return adaptSorted().map(m => m.id); },
  adaptation: ADAPT_API,
  recommend,
  convert: rcConvert,
  toDocument: rcToDocument,
  registerFormat(f){
    if(!f || !f.id || !(f.w>0) || !(f.h>0)) throw new Error('Формат: нужны id, w, h');
    FORMATS[f.id] = Object.assign({validated:false, previewW:Math.round(f.w*0.8), previewH:Math.round(f.h*0.8)}, f);
    return FORMATS[f.id];
  },
  // формат «не проверен», пока для него нет ни одного модуля адаптации; с появлением модуля метка снимается
  listFormats(){ return Object.values(FORMATS).map(f=>Object.assign({}, f, {validated: !!f.validated || adaptSorted().some(m=>m.targetFormats.includes(f.id))})); },
  _internal: { rcSnapshot, rcDiff, scopeCss, rcFragment, rcMissing, rcRoles, rcMarkers, rcMinFont, rcAudit }
};
})();

