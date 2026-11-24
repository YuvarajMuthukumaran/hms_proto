/* 24 Nov 2026 (owner): every signature pad sits in the middle of its window, with its "Signature" label centred above it.
   All roles. Drawing maps the pointer from the pad's own on-screen box, so moving it does not change signing. */
(function(){
  const P='canvas.ct-pad,canvas.tn-sig,#capSigCanvas,#acrCapC,#acrCapNC,#esC';
  const css=document.createElement('style');css.id='sig-center-css';
  css.textContent=P.split(',').map(s=>s+'{margin-left:auto!important;margin-right:auto!important;display:block!important}').join('')
    +P.split(',').map(s=>'.lbl:has(+ '+s+')').join(',')+'{text-align:center!important}'
    +'.m20-sig{align-self:center!important;margin-left:auto!important;margin-right:auto!important;width:100%}.m20-sig>.lbl{text-align:center!important}'
    /* owner, same day: the Application form for admission pop-up (block 190) much bigger */
    +'body #modal.apf-m{width:min(1320px,96vw)!important;max-width:96vw!important}body #modal.apf-m .mb{height:min(900px,78vh)!important}';
  /* owner, same day: vitals Trend rows (186) lose the "Latest <date, time> by <name>" line. Psychiatrist roles (186's own gate) */
  if(/^(psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||'')))css.textContent+='.vx-mon .vx-at{display:none!important}';
  document.head.appendChild(css);
})();
