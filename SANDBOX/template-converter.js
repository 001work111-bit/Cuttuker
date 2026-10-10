/* ============================================================
   Template Format Converter v1
   ------------------------------------------------------------
   Purpose:
   - inspect REAL rendered geometry of existing Sandbox templates;
   - create a new Converted version in a dedicated batch;
   - keep the original template untouched;
   - do NOT add Motion Studio / AE metadata;
   - normalize only the visual frame by scaling the already rendered
     legacy composition into a strict target frame.
   ============================================================
*/
(function(){
  'use strict';

  const TARGETS={
    '16:9':{width:1280,height:720},
    '9:16':{width:720,height:1280}
  };

  function selectedTemplates(){
    if(typeof checked==='undefined'||typeof LIB==='undefined') return [];
    if(!checked || !checked.size) return [];
    return [...checked].map(id=>LIB[id]).filter(Boolean);
  }

  function escapeAttr(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
  function aspectRatio(w,h){ return h? w/h : 0; }

  function renderOffscreen(html){
    return new Promise(resolve=>{
      const host=document.createElement('div');
      host.style.cssText='position:fixed;left:-100000px;top:0;width:1280px;min-height:1px;visibility:hidden;pointer-events:none;overflow:visible;z-index:-1;';
      host.innerHTML=String(html||'');
      document.body.appendChild(host);
      requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(host)));
    });
  }

  function measureTemplate(t){
    return renderOffscreen(t.html).then(async host=>{
      const els=[...host.children].filter(x=>x.nodeType===1);
      const el=els.length===1?els[0]:host;
      try{
        if(document.fonts && document.fonts.ready){
          try{ await document.fonts.ready; }catch(e){}
        }
        const r=el.getBoundingClientRect();
        const width=Math.max(0,r.width);
        const height=Math.max(0,r.height);
        const ratio=aspectRatio(width,height);
        const cs=getComputedStyle(el);
        const overflowW=Math.max(0,el.scrollWidth-el.clientWidth);
        const overflowH=Math.max(0,el.scrollHeight-el.clientHeight);
        return {
          width,
          height,
          ratio,
          cssAspect:String(cs.aspectRatio||'auto'),
          hasStrictRoot:!!(cs.aspectRatio && cs.aspectRatio!=='auto'),
          overflowW,
          overflowH,
          referenceWidth:1280
        };
      }finally{
        host.remove();
      }
    });
  }

  function escJs(s){
    return String(s||'').replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
  }

  function buildConvertedHtml(html, measured, targetAspect){
    const target=TARGETS[targetAspect]||TARGETS['16:9'];
    const sw=measured.width||1280;
    const sh=measured.height||720;
    if(!sw||!sh) return String(html||'');

    // COVER: no white bars. Preserve proportions; crop only where needed.
    const scale=Math.max(target.width/sw,target.height/sh);
    const scaledW=sw*scale;
    const scaledH=sh*scale;
    const cropX=Math.max(0,(scaledW-target.width)/2);
    const cropY=Math.max(0,(scaledH-target.height)/2);

    // The inner layer is rendered at the actual legacy reference width.
    // We do not touch the inner legacy markup or its old data-sb attributes.
    const frameBg=(function(){
      const m=String(html||'').match(/background\s*:\s*([^;]+);?/i);
      return m?m[1].trim():'#000';
    })();

    const inner=`<div data-sb-format-inner="1" style="position:absolute;left:50%;top:50%;width:${sw}px;height:${sh}px;transform:translate(-50%,-50%) scale(${scale});transform-origin:center center;overflow:visible;">${html}</div>`;
    return `<div data-sb-format-frame="1" style="width:100%;aspect-ratio:${targetAspect==='9:16'?'9/16':'16/9'};position:relative;overflow:hidden;box-sizing:border-box;background:${escapeAttr(frameBg)};">${inner}</div>`;
  }

  async function convertOne(t,targetAspect){
    const m=await measureTemplate(t);
    const html=buildConvertedHtml(t.html,m,targetAspect);
    const target=TARGETS[targetAspect];
    return {
      source:t,
      measured:m,
      target,
      targetAspect,
      html,
      scale:Math.max(target.width/(m.width||target.width),target.height/(m.height||target.height)),
      cropX:Math.max(0,((m.width||target.width)*Math.max(target.width/(m.width||target.width),target.height/(m.height||target.height))-target.width)/2),
      cropY:Math.max(0,((m.height||target.height)*Math.max(target.width/(m.width||target.width),target.height/(m.height||target.height))-target.height)/2)
    };
  }

  function showPreviewInfo(rows,targetAspect){
    const box=document.getElementById('formatConvPreviewInfo');
    if(!box) return;
    const target=TARGETS[targetAspect]||TARGETS['16:9'];
    box.style.display='block';
    box.innerHTML=`<div class="real-size-head"><span class="rs-title">Selected templates — real geometry</span><span style="flex:1"></span><span style="font-size:10px;color:var(--ui-muted)">Target ${targetAspect}</span></div>`+
      rows.map(r=>`<div style="padding:7px 0;border-top:1px solid var(--ui-line);font-size:11px">
        <div style="font-weight:700;margin-bottom:4px">${esc(r.source.label||r.source.tpl)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;color:var(--ui-muted)">
          <span>${Math.round(r.measured.width)}×${Math.round(r.measured.height)}</span>
          <span>ratio ${r.measured.ratio.toFixed(4)}</span>
          <span>scale ${r.scale.toFixed(3)}</span>
        </div>
        <div style="margin-top:4px;color:var(--ui-muted)">crop: ${Math.round(r.cropX)}×${Math.round(r.cropY)} px per side</div>
      </div>`).join('');
  }

  async function openDialog(){
    const chosen=selectedTemplates();
    if(!chosen.length){ if(typeof toast==='function') toast('Сначала выдели шаблоны'); return; }

    const wrap=document.getElementById('formatConvModal');
    if(!wrap) return;
    wrap.classList.add('on');
    const aspectSel=document.getElementById('formatConvAspect');
    const info=document.getElementById('formatConvPreviewInfo');
    if(info){ info.style.display='none'; info.innerHTML=''; }

    const runBtn=document.getElementById('formatConvRun');
    runBtn.disabled=true;
    runBtn.textContent='Измеряю…';
    let rows=[];
    try{
      const aspect=aspectSel.value;
      rows=await Promise.all(chosen.map(t=>convertOne(t,aspect)));
      showPreviewInfo(rows,aspect);
      runBtn.disabled=false;
      runBtn.textContent='↻ Конвертировать';
    }catch(e){
      runBtn.disabled=false;
      runBtn.textContent='↻ Конвертировать';
      if(typeof toast==='function') toast('Ошибка измерения шаблонов');
      console.error(e);
      return;
    }

    const close=()=>wrap.classList.remove('on');
    document.getElementById('formatConvClose').onclick=close;
    document.getElementById('formatConvCancel').onclick=close;
    wrap.onclick=e=>{ if(e.target===wrap) close(); };

    // Re-measure if target format changed.
    aspectSel.onchange=async()=>{
      runBtn.disabled=true; runBtn.textContent='Измеряю…';
      const aspect=aspectSel.value;
      try{
        rows=await Promise.all(chosen.map(t=>convertOne(t,aspect)));
        showPreviewInfo(rows,aspect);
      }finally{
        runBtn.disabled=false; runBtn.textContent='↻ Конвертировать';
      }
    };

    runBtn.onclick=async()=>{
      const aspect=aspectSel.value;
      const current=await Promise.all(chosen.map(t=>convertOne(t,aspect)));
      if(!current.length){ close(); return; }

      if(typeof pushUndo==='function') pushUndo();
      const batchId=newBatchId();
      const label='Converted '+aspect;
      const batch={
        id:batchId,
        label,
        note:'Новые версии шаблонов, стандартизированные по реальному rendered ratio.',
        link:'',
        color:nextBatchColor(),
        createdAt:Date.now(),
        count:0
      };

      let added=0;
      let firstId=null;
      current.forEach((r,idx)=>{
        const src=r.source;
        const uid=makeUniqueTpl(src.tpl+'_'+(aspect==='16:9'?'converted169':'converted916'));
        const clone={...src};
        clone.tpl=uid;
        clone.label=(src.label||src.tpl)+' · Converted '+aspect;
        clone.batch=batchId;
        // IMPORTANT: no Motion Studio/AE metadata added here.
        // Keep old template attributes and legacy data model untouched.
        clone.html=r.html;
        clone.aspect=aspect;
        clone.canvas={width:r.target.width,height:r.target.height};
        // Do not attach motion/entities/conversion metadata.
        if(Object.prototype.hasOwnProperty.call(clone,'motion')) delete clone.motion;
        if(Object.prototype.hasOwnProperty.call(clone,'entities') && !Array.isArray(src.entities)) delete clone.entities;
        LIB[uid]=clone;
        batch.count++;
        added++;
        if(!firstId) firstId=uid;
      });
      BATCHES[batchId]=batch;
      store.save(); store.saveBatches();
      checked.clear();
      if(firstId) checked.add(firstId);
      renderLib();
      if(firstId) selectTpl(firstId,true);
      close();
      if(typeof toast==='function') toast(`Converted ${aspect}: создано ${added} шаблон(ов) в прогоне «${label}»`);
    };
  }

  function init(){
    const btn=document.getElementById('btnConvertFormat');
    if(btn) btn.onclick=openDialog;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();

  window.SB_formatConverter={
    measureTemplate,
    buildConvertedHtml,
    convertOne,
    openDialog,
    TARGETS
  };
})();
