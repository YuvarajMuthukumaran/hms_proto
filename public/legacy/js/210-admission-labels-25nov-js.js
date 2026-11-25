/* 25 Nov 2026 (owner): Admission page, cards "Allergies" and "Treatment chart": the inner labels "Drug allergies" and
   "Treatment chart" repeat the card title, so they are hidden (kept in the page, blocks 72/201 find the boxes by them).
   Psychiatrist and floor lead psychiatrist. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const st=document.createElement('style');st.textContent='.wk-gb .lbl.m210-h{display:none!important}';document.head.appendChild(st);
  function paint(){document.querySelectorAll('.wk-gb .box .lbl:not(.m210-h)').forEach(l=>{if(/^(Drug allergies|Treatment chart)$/.test((l.textContent||'').trim()))l.classList.add('m210-h');});}
  let q=0;new MutationObserver(()=>{clearTimeout(q);q=setTimeout(()=>{try{paint();}catch(e){}},40);}).observe(document.documentElement,{childList:true,subtree:true});
})();
