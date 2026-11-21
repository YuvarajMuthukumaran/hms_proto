/* 21 Nov 2026, owner: patient header button column order for the psychiatrist and floor lead psychiatrist:
   Round note, Message caregiver, OPD record, Log event, Print file. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const ORDER=[/^Round note$/i,/Message caregiver/i,/OPD record/i,/Log event/i,/Print file/i];
  function reorder(){
    const col=document.querySelector('#view .dph .dpact');if(!col)return;
    const btns=[...col.querySelectorAll(':scope > button')];
    const rank=b=>{const t=(b.textContent||'').trim();const i=ORDER.findIndex(re=>re.test(t));return i<0?99:i;};
    const sorted=btns.slice().sort((a,b)=>rank(a)-rank(b));
    if(sorted.every((b,i)=>b===btns[i]))return;
    const first=btns[0];
    sorted.forEach(b=>col.insertBefore(b,null)); /* move to the end in order; non-button children (e.g. the discharge line) are re-appended after */
    [...col.children].filter(c=>c.tagName!=='BUTTON').forEach(c=>col.appendChild(c));
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{reorder();}catch(e){}return o;};
  try{reorder();}catch(e){}
})();
