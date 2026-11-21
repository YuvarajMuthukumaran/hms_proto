/* 21 Nov 2026, owner: patient header button column order for the psychiatrist and floor lead psychiatrist:
   Round note (psychologist: Session note), Message caregiver, OPD record, Log event, Print file. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const ORDER=[/^(Round note|Session note)$/i,/Message caregiver/i,/OPD record/i,/Log event/i,/Print file/i];
  function reorder(){
    const col=document.querySelector('#view .dph .dpact');if(!col)return;
    const btns=[...col.querySelectorAll(':scope > button')];
    const rank=b=>{const t=(b.textContent||'').trim();const i=ORDER.findIndex(re=>re.test(t));return i<0?99:i;};
    const sorted=btns.slice().sort((a,b)=>rank(a)-rank(b));
    if(sorted.every((b,i)=>b===btns[i]))return;
    sorted.forEach(b=>col.insertBefore(b,null)); /* move to the end in order; non-button children (e.g. the discharge line) are re-appended after */
    [...col.children].filter(c=>c.tagName!=='BUTTON').forEach(c=>col.appendChild(c));
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{reorder();}catch(e){}return o;};
  /* the Discharge summary tab has no icon (owner, 21 Nov) */
  function noIcon(){document.querySelectorAll('#view .subtabs button .sti').forEach(i=>{const b=i.closest('button');if(b&&/^Discharge summary$/i.test((b.textContent||'').trim()))i.remove();});}
  const __r2=render;
  render=function(){const o=__r2.apply(this,arguments);try{noIcon();}catch(e){}return o;};
  /* the icon is a ::before on .psy-discharge-tab (block 54); hide it */
  try{const st=document.createElement('style');st.textContent='body #view .subtabs .subtab.psy-discharge-tab::before,body #view .subtabs .subtab.psy-discharge-tab::after{display:none!important;content:none!important;background:none!important}';document.head.appendChild(st);}catch(e){}
  /* 21 Nov 2026 (owner): the Discharge readiness card (percent, readiness list, discharge medicines bar, Fill summary button) is removed from the Discharge checklist. The sign-and-discharge lock still works. */
  try{const st2=document.createElement('style');st2.textContent='#dcAuto{display:none!important}';document.head.appendChild(st2);}catch(e){}
/* Discharge checklist role cards (21 Nov): coloured top edge per role, progress bar, round ticks */
  try{const st3=document.createElement('style');st3.textContent=[
  '#m20Role .m20-cg{--c:#2563eb;--t:#eff6ff;position:relative;overflow:hidden;border:1px solid #e3eaf2;border-radius:14px;background:#fff;padding:16px 16px 14px;box-shadow:0 1px 2px rgba(16,24,40,.04)}',
  '#m20Role .m20-cg[data-r=nurse]{--c:#0e7c7b;--t:#ecfdf9}#m20Role .m20-cg[data-r=psg]{--c:#7c3aed;--t:#f5f0ff}#m20Role .m20-cg[data-r=px]{--c:#c2410c;--t:#fff4ec}',
  '#m20Role .m20-cg::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--c) var(--p),#e6ebf1 var(--p))}',
  '#m20Role .m20-cg.mine{background:var(--t);border-color:var(--c)}',
  '#m20Role .m20-cgh{display:flex;align-items:center;gap:8px;margin-bottom:10px}#m20Role .m20-cgh b{color:var(--c);font-size:14.5px;margin-right:auto}',
  '#m20Role .m20-cnt{font-size:12px;font-weight:700;color:var(--c);background:var(--t);border-radius:99px;padding:2px 9px}#m20Role .m20-cg.mine .m20-cnt{background:#fff}',
  '#m20Role .m20-ci{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid rgba(100,116,139,.15)}#m20Role .m20-ci:first-of-type{border-top:0}',
  '#m20Role .m20-ci input{appearance:none;-webkit-appearance:none;flex:none;width:20px;height:20px;margin-top:1px;border-radius:50%;border:2px solid #b8c4d2;background:#fff;display:grid;place-content:center}',
  '#m20Role .m20-ci input::after{content:"";width:10px;height:6px;border:solid #fff;border-width:0 0 2.5px 2.5px;transform:rotate(-45deg) translate(1px,-1px) scale(0);transition:transform .15s}',
  '#m20Role .m20-ci input:checked{background:var(--c);border-color:var(--c)}#m20Role .m20-ci input:checked::after{transform:rotate(-45deg) translate(1px,-1px) scale(1)}',
  '#m20Role .m20-ci input:focus-visible{outline:2px solid var(--c);outline-offset:2px}',
  '#m20Role .m20-cit{display:block;font-weight:600;font-size:13.5px}#m20Role .m20-ci .tiny{display:block;margin-top:2px}',
  '@media(prefers-reduced-motion:reduce){#m20Role .m20-ci input::after{transition:none}}'].join('');document.head.appendChild(st3);}catch(e){}
  try{reorder();noIcon();}catch(e){}
})();
