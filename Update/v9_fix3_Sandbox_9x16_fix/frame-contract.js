/* ============================================================
   Universal Frame Contract v1
   ------------------------------------------------------------
   One format mechanism for 16:9, 9:16 and future ratios.
   It does NOT alter existing templates unless the user explicitly
   selects a target format in the JSON import dialog.
   ============================================================
*/
(function(){
  'use strict';

  // Форматы берутся из единого реестра (format-registry.js). Значения эталонов не менялись.
  const FORMATS={};
  (window.SB_FORMATS||[]).forEach(function(f){
    if(f.contractCanvas) FORMATS[f.id]={w:f.ratio.w,h:f.ratio.h,canvas:f.contractCanvas,label:f.label,className:f.className};
  });

  function info(aspect){ return FORMATS[aspect]||FORMATS['16:9']; }

  function promptContract(aspect){
    const f=info(aspect);
    return [
      'FRAME CONTRACT — DO NOT TREAT FORMAT AS METADATA ONLY',
      `TARGET ASPECT: ${f.label}`,
      `REFERENCE CANVAS: ${f.canvas.width} × ${f.canvas.height}`,
      `ROOT FRAME MUST PHYSICALLY USE aspect-ratio: ${f.w} / ${f.h}; width:100%; height:auto; box-sizing:border-box; overflow:hidden.`,
      'The Sandbox controls the outer frame. Design only the internal layout inside this fixed frame.',
      'Do not make root height content-driven. Do not replace the root aspect-ratio with min-height, fixed height, or arbitrary padding.',
      'Keep the design scalable; the reference canvas is a coordinate system, not a final delivery resolution.',
      'Return the same JSON structure and preserve the visual concept.'
    ].join('\n');
  }

  function ensureStyles(){
    if(document.getElementById('sb-frame-contract-css')) return;
    const st=document.createElement('style');
    st.id='sb-frame-contract-css';
    st.textContent=`
      .sb-frame-contract{width:100%;box-sizing:border-box;position:relative;overflow:hidden;}
      ${(window.SB_FORMATS||[]).filter(f=>f&&f.className&&f.ratio).map(f=>`.${f.className}{aspect-ratio:${f.ratio.w}/${f.ratio.h};}`).join('\n      ')}
      .sb-frame-contract > .sb-frame-content{width:100%;height:100%;min-width:0;min-height:0;box-sizing:border-box;overflow:hidden;position:relative;}
    `;
    document.head.appendChild(st);
  }

  function replaceStyleAspect(html,aspect){
    const f=info(aspect);
    const s=String(html||'');
    const m=s.match(/^(\s*<([a-zA-Z][\w:-]*)([^>]*)>)/);
    if(!m) return s;
    let tag=m[1], attrs=m[3]||'';
    const styleM=attrs.match(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/i);
    if(styleM){
      let style=styleM[2];
      style=style.replace(/(^|;)\s*aspect-ratio\s*:[^;]+;?/ig,'$1');
      style=style.replace(/(^|;)\s*height\s*:[^;]+;?/ig,'$1');
      style=style.replace(/(^|;)\s*min-height\s*:[^;]+;?/ig,'$1');
      style += ` aspect-ratio:${f.w}/${f.h}; width:100%; box-sizing:border-box; overflow:hidden;`;
      tag=tag.replace(styleM[0], ` style="${style.trim()}"`);
    }else{
      tag=tag.replace(/>$/,' style="aspect-ratio:'+f.w+'/'+f.h+';width:100%;box-sizing:border-box;overflow:hidden;">');
    }
    return tag+s.slice(m[1].length);
  }

  function applyContractToHtml(html,aspect){
    ensureStyles();
    const f=info(aspect);
    const raw=String(html||'');
    // Always create a dedicated outer frame. Existing inner markup remains intact.
    // This guarantees the physical root frame ratio without injecting Motion/AE metadata.
    const inner=replaceStyleAspect(raw,aspect);
    const wrapped=`<div class="sb-frame-contract ${f.className}" data-sb-frame-contract="${aspect}" style="width:100%;aspect-ratio:${f.w}/${f.h};position:relative;overflow:hidden;box-sizing:border-box;"><div class="sb-frame-content" style="width:100%;height:100%;box-sizing:border-box;overflow:hidden;position:relative;">${inner}</div></div>`;
    return {html:wrapped,frame:{contract:'sandbox-frame-v1',aspect,canvas:f.canvas}};
  }

  function inspectorHTML(t){
    const fc=t.frameContract||null;
    const declared=t.aspect||'—';
    const name=fc&&fc.contract?'ENFORCED':'Metadata only';
    const cv=(fc&&fc.canvas)||t.canvas||null;   // эталон: frameContract-объект либо canvas шаблона (строковый frameContract не меняется)
    return `<div class="real-size-card">\n      <div class="real-size-head"><span class="rs-title">Frame Contract</span></div>\n      <div class="real-size-grid">\n        <div class="k">Declared aspect</div><div class="v">${escapeHtml(String(declared))}</div>\n        <div class="k">Frame state</div><div class="v">${name}</div>\n        <div class="k">Reference canvas</div><div class="v">${cv?`${cv.width}×${cv.height}`:'—'}</div>\n      </div>\n      <div class="rs-note">Старые шаблоны без Frame Contract не меняются. Contract создаётся только по явному выбору формата при импорте/генерации.</div>\n    </div>`;
  }

  function escapeHtml(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.SB_FRAME_CONTRACT={FORMATS,info,promptContract,applyContractToHtml,inspectorHTML};
})();
