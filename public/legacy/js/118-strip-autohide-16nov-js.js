/* 16 Nov 2026, Dr. Anu's video note and Yuvaraj's reply: the patient strip does not need to follow the page. It now sits at the top of the patient screen
   and scrolls away with the page (no pinning, no overlap with the header cards). Psychiatrist screens only. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const css=document.createElement('style');css.id='sb-static-css';
  css.textContent='#safeBar{position:static!important;top:auto!important;box-shadow:none!important;margin:0 0 12px!important}';
  document.head.appendChild(css);
})();
