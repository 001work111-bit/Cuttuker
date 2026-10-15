/* _shared/lab/iface-v3011.js — методы «Реконструкция по ролям», «Редакционный split» (базовая лаборатория)
   и «Главное медиа», «Типографический постер» (Single-file v3-011) из лаборатории index.html.
   Тела функций перенесены дословно (блоки 0, 4 и конвейер v3-011 из блока 6). Перенесено только замыкание
   зависимостей двух методов; верхнеуровневый код UI лаборатории (загрузка библиотек, обработчики, интерфейс) не входит.
   Экспорт: RecomposeLab.ifaceV3011 = { buildConverted, buildConverted3011 }. */
(function(){
'use strict';
const W=900,H=1600,SOURCE_W=1440,SOURCE_VH=900;

function stripRemoteFontImports(html){return String(html||'').replace(/@import\s+url\(\s*['\"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;\s*/gi,'')}

function vhToPx(html){return String(html||'').replace(/(-?\d*\.?\d+)\s*(dvh|svh|lvh|vh)\b/gi,(m,n)=>`${Number(n)*SOURCE_VH/100}px`)}

function targetDoc(html){html=vhToPx(stripRemoteFontImports(html));return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${W}, initial-scale=1"></head><body>${html}</body></html>`}

function directChildren(el){return [...(el?.children||[])].filter(n=>!['STYLE','SCRIPT','LINK'].includes(n.tagName))}

function pickRoot(doc){let section=doc.querySelector('.sv-section');if(!section){const f=doc.querySelector('[data-sb-format-frame]');section=f?.querySelector('.sv-section')||doc.body.querySelector('section,main,article,div');}return section}

function unwrapFormatFrame(doc){const f=doc.querySelector('[data-sb-format-frame]');if(!f)return;const s=f.querySelector('.sv-section');if(s){f.replaceWith(s)}else{const inn=f.querySelector('[data-sb-format-inner]');if(inn){inn.style.cssText='position:static!important;left:auto!important;top:auto!important;width:100%!important;height:100%!important;transform:none!important;overflow:visible!important';f.replaceWith(...inn.childNodes)}}}

function createStyle(doc,css){let style=doc.getElementById('recompose-overrides');if(!style){style=doc.createElement('style');style.id='recompose-overrides';doc.body.appendChild(style)}style.textContent=css}

function setInline(el,props){for(const [k,v] of Object.entries(props))el.style.setProperty(k,v,'important')}

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

function targetCss(layout,method){let css=`
html,body{margin:0!important;padding:0!important;width:${W}px!important;min-width:${W}px!important;height:${H}px!important;min-height:${H}px!important;max-height:${H}px!important;overflow:hidden!important;box-sizing:border-box!important;background:#fff!important}
body{position:relative!important;--pad:4vw!important;overflow:hidden!important;font-family:Arial,sans-serif}
*,*:before,*:after{box-sizing:border-box}
.sv-section{position:absolute!important;left:0!important;top:0!important;width:${W}px!important;height:${H}px!important;min-height:0!important;max-height:${H}px!important;margin:0!important;padding:54px 68px!important;overflow:hidden!important;box-sizing:border-box!important}
.sv-section>.sv-inner{width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-height:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
.sv-inner>*{min-width:0!important;max-width:100%!important}
[data-sb-editable], [data-sb-media],.sv-media{box-sizing:border-box!important;min-width:0!important}
.sv-media,[data-sb-media]{max-width:100%!important}
img,video,svg{max-width:100%;}
[data-role="overline"],[data-role="label"],[data-role="smallMeta"]{overflow-wrap:anywhere}
`;
 if(method==='compact'||method==='fit')css+=`
.sv-section{padding:42px 52px!important}
.sv-section>.sv-inner{gap:clamp(12px,1.6vw,24px)!important}
.sv-inner [data-role="title"],.sv-inner [data-role="statement"]{font-size:clamp(27px,4.4vw,70px)!important;line-height:1.02!important;letter-spacing:-.035em!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,1.8vw,26px)!important;line-height:1.2!important}
.sv-inner [data-role="body"]{font-size:clamp(13px,1vw,17px)!important;line-height:1.42!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:clamp(10px,.8vw,13px)!important;line-height:1.35!important}
.sv-inner h1,.sv-inner h2,.sv-inner h3,.sv-inner h4{max-width:100%!important;overflow-wrap:anywhere!important}
.sv-inner p{max-width:100%!important}
.sv-section [style*="padding"]{padding-top:clamp(8px,1.4vw,22px)!important;padding-bottom:clamp(8px,1.4vw,22px)!important}
.sv-section [style*="margin-bottom"]{margin-bottom:clamp(8px,1.4vw,22px)!important}
`;
 if(method==='smart'||method==='split')css+=`
.sv-section{padding:54px 72px!important}
.sv-inner [data-role="title"]{font-size:clamp(30px,4.7vw,76px)!important;line-height:1.01!important;letter-spacing:-.04em!important}
.sv-inner [data-role="statement"]{font-size:clamp(31px,4.7vw,76px)!important;line-height:1.08!important;letter-spacing:-.035em!important}
.sv-inner [data-role="subtitle"]{font-size:clamp(17px,1.8vw,27px)!important;line-height:1.3!important}
.sv-inner [data-role="body"]{font-size:clamp(13px,1vw,17px)!important;line-height:1.45!important}
.sv-inner [data-role="overline"],.sv-inner [data-role="label"],.sv-inner [data-role="smallMeta"]{font-size:clamp(10px,.8vw,13px)!important;line-height:1.35!important}
.sv-inner [style*="margin-bottom"]{margin-bottom:clamp(8px,1.5vw,24px)!important}
`;
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
 if(method==='split'&&layout!=='about'&&layout!=='asym'&&layout!=='micro'&&layout!=='matrix'&&layout!=='indexhero'&&layout!=='directions'&&layout!=='genericSplit')css+=`
.sv-inner{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:22px 38px!important;align-items:center!important}.sv-inner> :first-child{grid-column:1/-1!important}.sv-inner [data-sb-media],.sv-inner .sv-media{max-width:100%!important;max-height:100%!important;aspect-ratio:16/9!important}
`;
 if(method==='fit')css+=`
.sv-section>.sv-inner{transform-origin:top left!important}
`;
 return css;}

function waitFrame(frame){return new Promise((resolve,reject)=>{frame.onload=()=>{try{requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(frame.contentDocument)))}catch(e){reject(e)}};frame.onerror=()=>reject(new Error('Не удалось показать HTML'))})}

function fitDown(doc,limit=8){const section=pickRoot(doc);if(!section)return {factor:1,overflow:[]};let factor=1;let report=checkOverflow(doc);for(let i=0;i<limit&&report.length;i++){factor*=.94;const all=doc.querySelectorAll('.sv-section [data-sb-editable],.sv-section h1,.sv-section h2,.sv-section h3,.sv-section h4,.sv-section p,.sv-section span,.sv-section .sv-media,.sv-section [data-sb-media],.sv-section [style*="gap"],.sv-section [style*="padding"],.sv-section [style*="margin"]');all.forEach(el=>{const cs=doc.defaultView.getComputedStyle(el);if(el.matches('[data-sb-editable],h1,h2,h3,h4,p,span')){const fs=parseFloat(cs.fontSize);if(fs>8)el.style.setProperty('font-size',Math.max(9,fs*.94)+'px','important');const lh=parseFloat(cs.lineHeight);if(Number.isFinite(lh)&&lh>10)el.style.setProperty('line-height',Math.max(1,lh*.94)+'px','important')}if(/gap/i.test(el.getAttribute('style')||'')){['gap','row-gap','column-gap'].forEach(k=>{const v=parseFloat(cs.getPropertyValue(k));if(Number.isFinite(v)&&v>5)el.style.setProperty(k,Math.max(4,v*.94)+'px','important')})}if(/padding/i.test(el.getAttribute('style')||'')){['padding-top','padding-bottom','padding-left','padding-right'].forEach(k=>{const v=parseFloat(cs.getPropertyValue(k));if(Number.isFinite(v)&&v>4)el.style.setProperty(k,Math.max(3,v*.94)+'px','important')})}if(el.matches('.sv-media,[data-sb-media]')){el.style.setProperty('max-height','330px','important');el.style.setProperty('max-width','100%','important')}});report=checkOverflow(doc)}return {factor,overflow:report}}

function checkOverflow(doc){const section=pickRoot(doc);if(!section)return [{name:'Основной контейнер',reason:'не найден .sv-section'}];const base=section.getBoundingClientRect();const list=[];const items=[...section.querySelectorAll('[data-sb-editable],[data-sb-media],.sv-media,img,video,h1,h2,h3,h4,p')];for(const el of items){const r=el.getBoundingClientRect();const name=(el.getAttribute('data-slot')||el.getAttribute('data-role')||el.tagName.toLowerCase()).slice(0,45);let why='';if(r.left<base.left-1||r.right>base.right+1)why='за левой/правой границей';if(r.top<base.top-1||r.bottom>base.bottom+1)why+=(why?' и ':'')+'за верхней/нижней границей';const cs=doc.defaultView.getComputedStyle(el);if(!why&&(cs.overflowY==='hidden'||cs.overflowY==='clip')&&el.scrollHeight>el.clientHeight+3)why='внутренний контент обрезается';if(!why&&(cs.overflowX==='hidden'||cs.overflowX==='clip')&&el.scrollWidth>el.clientWidth+3)why='горизонтальный контент обрезается';if(why)list.push({name,reason:why,top:Math.round(r.top-base.top),bottom:Math.round(r.bottom-base.top)})}return list.slice(0,16)}

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

function smartCssFixes(doc,layout,method,t){const sec=pickRoot(doc);if(sec){setInline(sec,{position:'absolute',left:'0',top:'0',width:W+'px',height:H+'px','min-height':'0','max-height':H+'px',overflow:'hidden','box-sizing':'border-box'});const inner=sec.querySelector('.sv-inner');if(inner){setInline(inner,{width:'100%',height:'100%','max-width':'none','min-height':'0','max-height':'100%',margin:'0','box-sizing':'border-box'});}}
 const css=targetCss(layout,method)+'\n'+portraitCss(layout,method,t);createStyle(doc,css);}

async function buildConverted(html,t,method){const frame=document.createElement('iframe');frame.title='Converted 9:16 template';frame.setAttribute('sandbox','allow-same-origin');frame.style.cssText=`position:fixed;left:-10px;top:-10px;width:${W}px;height:${H}px;opacity:0;pointer-events:none;border:0`;document.body.appendChild(frame);frame.srcdoc=targetDoc(html);await waitFrame(frame);const doc=frame.contentDocument;try{await Promise.race([Promise.resolve(doc.fonts.ready).catch(()=>{}),new Promise(r=>setTimeout(r,1200))])}catch(e){};const semantic=method==='smart'||method==='split'?smartStructure(doc,t):(unwrapFormatFrame(doc),{section:pickRoot(doc),inner:pickRoot(doc)?.querySelector('.sv-inner'),layout:/showreelasymmetricgrid/i.test(t.tpl||'')?'asym':'generic'});smartCssFixes(doc,semantic.layout,method,t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));let fit={factor:1,overflow:checkOverflow(doc)};if(method==='fit'||fit.overflow.length){fit=fitDown(doc,method==='fit'?12:7)}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));fit.overflow=checkOverflow(doc);const output='<!doctype html>\n'+doc.documentElement.outerHTML;frame.remove();return {output,layout:semantic.layout,fit,overflow:fit.overflow};}

const EXPERIMENTAL_METHODS=new Set(['editorial','hero','mediaGrid','type']);

const isExperimentalMethod=method=>EXPERIMENTAL_METHODS.has(method);

function directAncestor(inner,node){let current=node;while(current&&current.parentElement!==inner)current=current.parentElement;return current||node}

function hasRole(node,roles){return !!node?.matches?.(roles)||!!node?.querySelector?.(roles)}

function mediaBlocks(inner){const blocks=[];inner.querySelectorAll('.sv-media,[data-sb-media]').forEach((media,index)=>{media.classList.add('rc-portrait-media');media.dataset.rcMediaIndex=String(index);const block=directAncestor(inner,media);if(block&&block!==inner&&!blocks.includes(block))blocks.push(block)});return blocks}

function makeComposeNode(doc,name){const node=doc.createElement('div');node.className=name;return node}

function buildTieredComposition(doc,inner,mode){
 const kids=directChildren(inner);if(!kids.length)return;
 const media=mediaBlocks(inner);const mediaSet=new Set(media);
 const firstMediaIndex=kids.findIndex(k=>mediaSet.has(k));
 const copy=[];const visuals=[];const footer=[];
 kids.forEach((kid,index)=>{
  if(mediaSet.has(kid)){visuals.push(kid);return}
  const semanticText=hasRole(kid,'[data-role="title"],[data-role="statement"],[data-role="subtitle"],[data-role="body"]');
  if(firstMediaIndex>=0&&index<firstMediaIndex)copy.push(kid);
  else if(firstMediaIndex>=0&&semanticText&&mode==='editorial')copy.push(kid);
  else footer.push(kid);
 });
 // With no media (contacts, lists), retain the first semantic group as entry and
 // use the remaining group as a low anchor instead of forcing a fictitious visual.
 if(!visuals.length&&kids.length>1){
  const lead=kids.find(k=>hasRole(k,'[data-role="title"],[data-role="statement"]'))||kids[0];
  copy.splice(0,copy.length,lead);footer.splice(0,footer.length,...kids.filter(k=>k!==lead));
 }
 const compose=makeComposeNode(doc,'rc-'+mode+'-compose');
 const head=makeComposeNode(doc,'rc-'+mode+'-head');
 const focus=makeComposeNode(doc,'rc-'+mode+'-focus');
 const tail=makeComposeNode(doc,'rc-'+mode+'-tail');
 copy.forEach(n=>head.append(n));visuals.forEach(n=>focus.append(n));footer.forEach(n=>tail.append(n));
 inner.replaceChildren(compose);compose.append(head,focus,tail);
 if(!focus.children.length)focus.classList.add('rc-empty-focus');
 if(!tail.children.length)tail.classList.add('rc-empty-tail');
}

function buildMediaGridComposition(doc,inner){
 const kids=directChildren(inner);if(!kids.length)return;
 const blocks=mediaBlocks(inner);
 if(blocks.length<2){buildTieredComposition(doc,inner,'hero');return 'mediaGrid-fallback'}
 const mediaSet=new Set(blocks);const before=[];const after=[];let passed=false;
 kids.forEach(k=>{if(mediaSet.has(k)){passed=true;return}(passed?after:before).push(k)});
 const compose=makeComposeNode(doc,'rc-mediaGrid-compose');
 const head=makeComposeNode(doc,'rc-mediaGrid-head');
 const grid=makeComposeNode(doc,'rc-mediaGrid-focus');
 const tail=makeComposeNode(doc,'rc-mediaGrid-tail');
 before.forEach(n=>head.append(n));blocks.forEach(n=>grid.append(n));after.forEach(n=>tail.append(n));
 grid.classList.add(blocks.length===2?'rc-grid-two':blocks.length===3?'rc-grid-three':'rc-grid-many');
 inner.replaceChildren(compose);compose.append(head,grid,tail);
 return blocks.length===2?'mediaGrid-two':'mediaGrid-many';
}

function buildTypeComposition(doc,inner){
 const kids=directChildren(inner);if(!kids.length)return;
 const hasTitle=k=>hasRole(k,'[data-role="statement"],[data-role="title"]');
 const titleKids=kids.filter(hasTitle);
 // Preserve nested text systems intact. A single nested block is centred as a unit.
 if(!titleKids.length){inner.classList.add('rc-type-compose');return}
 const compose=makeComposeNode(doc,'rc-type-compose');
 const head=makeComposeNode(doc,'rc-type-head');
 const center=makeComposeNode(doc,'rc-type-center');
 const tail=makeComposeNode(doc,'rc-type-tail');
 let pastTitle=false;
 kids.forEach(k=>{if(hasTitle(k)){center.append(k);pastTitle=true}else if(!pastTitle)head.append(k);else tail.append(k)});
 inner.replaceChildren(compose);compose.append(head,center,tail);
}

function experimentalStructure(doc,t,method){
 unwrapFormatFrame(doc);const section=pickRoot(doc);if(!section)return {section:null,inner:null,layout:'experimental'};
 const inner=section.querySelector('.sv-inner')||section;const id=String(t?.tpl||'').toLowerCase();let layout=method;
 if(method==='editorial')buildTieredComposition(doc,inner,'editorial');
 else if(method==='hero')buildTieredComposition(doc,inner,'hero');
 else if(method==='mediaGrid')layout=buildMediaGridComposition(doc,inner);
 else if(method==='type')buildTypeComposition(doc,inner);
 section.dataset.recomposeExperimental=method;section.dataset.recomposeTemplate=id;
 return {section,inner,layout};
}

function experimentalCss(method,layout){return `
html,body{margin:0!important;padding:0!important;width:${W}px!important;min-width:${W}px!important;height:${H}px!important;min-height:${H}px!important;max-height:${H}px!important;overflow:hidden!important;box-sizing:border-box!important;background:#fff!important}
body{position:relative!important;overflow:hidden!important;--pad:58px!important;font-family:Arial,sans-serif}*,*:before,*:after{box-sizing:border-box}
.sv-section{position:absolute!important;inset:0!important;width:${W}px!important;height:${H}px!important;min-height:0!important;max-height:${H}px!important;margin:0!important;padding:60px 58px!important;overflow:hidden!important;box-sizing:border-box!important}
.sv-section>.sv-inner{width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:100%!important;margin:0!important;box-sizing:border-box!important}
.sv-inner *,[data-sb-editable],[data-sb-media],.sv-media{min-width:0!important;box-sizing:border-box!important}.sv-inner img,.sv-inner video{display:block;max-width:100%!important}.sv-inner h1,.sv-inner h2,.sv-inner h3,.sv-inner h4,.sv-inner p{max-width:100%!important;overflow-wrap:anywhere!important}
[data-role="overline"],[data-role="label"],[data-role="smallMeta"]{font-size:11px!important;line-height:1.35!important;overflow-wrap:anywhere!important}[data-role="body"]{font-size:16px!important;line-height:1.45!important}[data-role="subtitle"]{font-size:19px!important;line-height:1.28!important}
.rc-portrait-media{overflow:hidden!important;background-position:center!important;background-size:cover!important}.rc-portrait-media img,.rc-portrait-media video{width:100%!important;height:100%!important;object-fit:cover!important}
.rc-editorial-compose,.rc-hero-compose,.rc-media-compose,.rc-mediaGrid-compose,.rc-type-compose{height:100%!important;min-height:0!important;width:100%!important;grid-column:1/-1!important}
/* A — editorial: text enters at the top, media owns the middle, metadata seals the lower edge. */
.rc-editorial-compose{display:grid!important;grid-template-rows:auto minmax(300px,1fr) auto!important;gap:30px!important}.rc-editorial-head{display:flex!important;flex-direction:column!important;gap:16px!important;align-self:start!important}.rc-editorial-head [data-role="title"],.rc-editorial-head [data-role="statement"]{font-size:clamp(47px,7vw,74px)!important;line-height:1.01!important;letter-spacing:-.045em!important;margin:0!important}.rc-editorial-focus{display:flex!important;align-items:center!important;justify-content:center!important;min-height:0!important}.rc-editorial-focus>*{width:100%!important;min-height:0!important}.rc-editorial-focus .rc-portrait-media{width:100%!important;height:100%!important;min-height:360px!important;aspect-ratio:auto!important}.rc-editorial-tail{align-self:end!important}.rc-editorial-tail>div{max-width:100%!important}.rc-editorial-tail [style*="grid-template"]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important}
/* B — hero: give a single visual a large portrait stage, with auxiliary information kept as a caption band. */
.rc-hero-compose{display:grid!important;grid-template-rows:auto minmax(470px,1fr) auto!important;gap:28px!important}.rc-hero-head{display:flex!important;flex-direction:column!important;gap:15px!important}.rc-hero-head [data-role="title"],.rc-hero-head [data-role="statement"]{font-size:clamp(43px,6.7vw,70px)!important;line-height:1.02!important;letter-spacing:-.045em!important;margin:0!important}.rc-hero-focus{display:flex!important;align-items:stretch!important;min-height:0!important}.rc-hero-focus>*{min-height:0!important;width:100%!important}.rc-hero-focus .rc-portrait-media{width:100%!important;height:100%!important;min-height:470px!important;aspect-ratio:auto!important}.rc-hero-tail{align-self:end!important}.rc-hero-tail [style*="grid-template"]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important}.rc-hero-focus.rc-empty-focus{min-height:0!important;display:none!important}.rc-hero-compose:has(.rc-empty-focus){grid-template-rows:auto 1fr auto!important}
/* C — multi-media story: two media become a vertical sequence; three or more receive a lead panel plus two supporting frames. */
.rc-mediaGrid-compose{display:grid!important;grid-template-rows:auto minmax(340px,1fr) auto!important;gap:24px!important}.rc-mediaGrid-head{display:flex!important;flex-direction:column!important;gap:14px!important}.rc-mediaGrid-head [data-role="title"],.rc-mediaGrid-head [data-role="statement"]{font-size:clamp(42px,6.4vw,67px)!important;line-height:1.02!important;letter-spacing:-.042em!important;margin:0!important}.rc-mediaGrid-focus{display:grid!important;min-height:0!important;gap:16px!important}.rc-mediaGrid-focus>*{min-width:0!important;min-height:0!important;display:flex!important;flex-direction:column!important;grid-column:auto!important;grid-row:auto!important;margin:0!important}.rc-mediaGrid-focus .rc-portrait-media{width:100%!important;min-height:0!important;height:100%!important;flex:1!important;aspect-ratio:auto!important}.rc-grid-two{grid-template-columns:1fr!important;grid-template-rows:1.14fr .86fr!important}.rc-grid-three,.rc-grid-many{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:minmax(0,1.35fr) minmax(0,.85fr)!important}.rc-grid-three>*:first-child,.rc-grid-many>*:first-child{grid-column:1/-1!important}.rc-grid-many{grid-auto-rows:minmax(96px,1fr)!important}.rc-mediaGrid-tail{align-self:end!important}.rc-mediaGrid-tail [style*="grid-template"]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:15px!important}
/* D — poster typography: a text block is an optical object, rather than a stack at y=0. */
.rc-type-compose{display:grid!important;grid-template-rows:auto minmax(0,1fr) auto!important;gap:28px!important}.rc-type-head{min-height:0!important}.rc-type-center{display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:0!important;gap:18px!important}.rc-type-center [data-role="title"],.rc-type-center [data-role="statement"]{font-size:clamp(51px,8.1vw,82px)!important;line-height:.98!important;letter-spacing:-.055em!important;margin:0!important}.rc-type-center [data-role="body"]{max-width:660px!important;font-size:17px!important}.rc-type-tail{align-self:end!important;min-width:0!important}.rc-type-tail [style*="justify-content"]{display:flex!important;justify-content:space-between!important;gap:16px!important}.rc-type-head:empty,.rc-type-tail:empty{display:none!important}.rc-type-compose:has(.rc-type-head:empty):has(.rc-type-tail:empty){grid-template-rows:1fr!important}.rc-type-compose:has(.rc-type-head:empty):has(.rc-type-tail:empty) .rc-type-center{justify-content:center!important}
/* Structure-specific safety for nested Swiss systems and repeating cards. */
[data-recompose-experimental] [data-sb-repeat]{min-height:0!important}[data-recompose-experimental] [data-sb-repeat]>div{min-width:0!important}[data-recompose-experimental] .rc-empty-tail{display:none!important}
`}

function experimentalCssFixes(doc,layout,method){const sec=pickRoot(doc);if(sec){setInline(sec,{position:'absolute',left:'0',top:'0',width:W+'px',height:H+'px','min-height':'0','max-height':H+'px',overflow:'hidden','box-sizing':'border-box'});const inner=sec.querySelector('.sv-inner')||sec;setInline(inner,{width:'100%',height:'100%','max-width':'none','min-height':'0','max-height':'100%',margin:'0','box-sizing':'border-box'});}createStyle(doc,experimentalCss(method,layout));}

function smartCssFixes3011(doc,layout,method,t){if(isExperimentalMethod(method)){experimentalCssFixes(doc,layout,method);return}
const css=targetCss(layout,method)+'\n'+portraitCss(layout,method,t);createStyle(doc,css);}

async function buildConverted3011(html,t,method){const frame=document.createElement('iframe');frame.title='Converted 9:16 template';frame.setAttribute('sandbox','allow-same-origin');frame.style.cssText=`position:fixed;left:-10px;top:-10px;width:${W}px;height:${H}px;opacity:0;pointer-events:none;border:0`;document.body.appendChild(frame);frame.srcdoc=targetDoc(html);await waitFrame(frame);const doc=frame.contentDocument;try{await Promise.race([Promise.resolve(doc.fonts.ready).catch(()=>{}),new Promise(r=>setTimeout(r,1200))])}catch(e){};const semantic=isExperimentalMethod(method)?experimentalStructure(doc,t,method):(method==='smart'||method==='split'?smartStructure(doc,t):(unwrapFormatFrame(doc),{section:pickRoot(doc),inner:pickRoot(doc)?.querySelector('.sv-inner'),layout:/showreelasymmetricgrid/i.test(t.tpl||'')?'asym':'generic'}));smartCssFixes3011(doc,semantic.layout,method,t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));let fit={factor:1,overflow:checkOverflow(doc)};if(method==='fit'||fit.overflow.length){fit=fitDown(doc,method==='fit'?12:7)}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));fit.overflow=checkOverflow(doc);const output='<!doctype html>\n'+doc.documentElement.outerHTML;frame.remove();return {output,layout:semantic.layout,fit,overflow:fit.overflow};}
window.RecomposeLab = window.RecomposeLab || {};
window.RecomposeLab.ifaceV3011 = { buildConverted: buildConverted, buildConverted3011: buildConverted3011 };
})();
