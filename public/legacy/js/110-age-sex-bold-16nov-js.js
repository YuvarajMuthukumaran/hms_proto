/* 16 Nov 2026, Trello 157 (psychiatrist): age and sex in the patient header bold and darker so they are easy to see. Psychiatrist only. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  if(document.getElementById('as-bold-css'))return;
  const c=document.createElement('style');c.id='as-bold-css';
  c.textContent='.dpmain h2 + span.muted{color:var(--ink,#101828)!important;font-weight:800!important;font-size:15px!important}';
  document.head.appendChild(c);
})();
