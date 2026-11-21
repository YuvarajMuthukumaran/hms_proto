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
/* Discharge checklist role cards (21 Nov, v2): segmented progress per role, fixed round ticks, tight rows */
  try{const st3=document.createElement('style');st3.textContent=[
  '#m20Role .m20-cg{--c:#2563eb;--t:#eef4ff;border:1px solid #e3eaf2;border-radius:12px;background:#fff;padding:14px 16px 8px;box-shadow:none}',
  '#m20Role .m20-cg[data-r=nurse]{--c:#0e7c7b;--t:#e8f7f5}#m20Role .m20-cg[data-r=psg]{--c:#6d4bd8;--t:#f1edfd}#m20Role .m20-cg[data-r=px]{--c:#b45309;--t:#fdf1e3}',
  '#m20Role .m20-cg::before{display:none}',
  '#m20Role .m20-cg.mine{background:var(--t);border-color:var(--c)}',
  '#m20Role .m20-cgh{display:flex;align-items:center;gap:8px;margin:0 0 8px}',
  '#m20Role .m20-cgh b{margin-right:auto;font-size:15px;font-weight:700;color:#101828}',
  '#m20Role .m20-cnt{font-size:12.5px;font-weight:600;color:var(--c);background:none;padding:0}',
  '#m20Role .m20-cgh .tiny,#m20Role .m20-you{font-size:11.5px;font-weight:600;color:#667085;background:none;padding:0}#m20Role .m20-you{color:var(--c)}',
  '#m20Role .m20-seg{display:flex;gap:4px;margin:0 0 6px}#m20Role .m20-seg i{flex:1;height:5px;border-radius:3px;background:#dfe5ec}#m20Role .m20-seg i.on{background:var(--c)}',
  '#m20Role .m20-ci{display:grid;grid-template-columns:22px 1fr;gap:12px;align-items:start;padding:10px 0;border:0;border-top:1px solid rgba(100,116,139,.16);margin:0}#m20Role .m20-ci:first-of-type{border-top:0}',
  '#m20Role .m20-ci input{appearance:none;-webkit-appearance:none;box-sizing:border-box;width:22px;height:22px;min-width:22px;max-width:22px;margin:0;padding:0;border-radius:50%;border:2px solid #b3bfcd;background:#fff;position:relative;cursor:pointer}',
  '#m20Role .m20-ci input:disabled{cursor:default;background:#f5f7fa;border-style:dashed}',
  '#m20Role .m20-ci input::after{content:"";position:absolute;left:6px;top:4px;width:6px;height:9px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg) scale(0);transition:transform .15s}',
  '#m20Role .m20-ci input:checked{background:var(--c);border:2px solid var(--c);border-style:solid}#m20Role .m20-ci input:checked::after{transform:rotate(45deg) scale(1)}',
  '#m20Role .m20-ci input:focus-visible{outline:2px solid var(--c);outline-offset:2px}',
  '#m20Role .m20-cit{display:block;font-weight:600;font-size:13.5px;line-height:1.3;color:#101828}#m20Role .m20-ci .tiny{display:block;margin-top:3px;font-size:12px;line-height:1.3;color:#667085}',
  '@media(prefers-reduced-motion:reduce){#m20Role .m20-ci input::after{transition:none}}'].join('');document.head.appendChild(st3);}catch(e){}
  try{reorder();noIcon();}catch(e){}
})();
