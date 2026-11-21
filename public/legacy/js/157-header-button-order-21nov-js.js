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
  try{reorder();noIcon();}catch(e){}
})();
