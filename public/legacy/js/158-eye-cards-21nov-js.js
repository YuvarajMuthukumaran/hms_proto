/* 21 Nov 2026, owner: the cards in the eye window (Floor lead, Vitals, Event ...) left the right half empty.
   Now each card is two columns: the tag and the sentence on the left, the action buttons stacked on the right, and a
   coloured edge by severity. Style only; the markup and the buttons are unchanged (block 26). */
(function(){
  const st=document.createElement('style');st.id='eye-cards-css';
  st.textContent=[
  '#modal .pd-det{gap:12px}',
  '#modal .pd-det>.pd-di:not(.done){display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"head act" "text act";column-gap:24px;row-gap:8px;align-items:center;padding:16px 18px 16px 20px;position:relative;overflow:hidden;border-radius:14px;background:#fff;border:1px solid #e3eaf2}',
  '#modal .pd-det>.pd-di:not(.done)::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#98a2b3}',
  '#modal .pd-det>.pd-di:has(.pd-chip.red)::before{background:#e5484d}#modal .pd-det>.pd-di:has(.pd-chip.amber)::before{background:#f5a524}#modal .pd-det>.pd-di:has(.pd-chip.blue)::before{background:#3b82f6}',
  '#modal .pd-det>.pd-di.al{background:#fff8f7;border-color:#fcd5d1}',
  '#modal .pd-det>.pd-di:not(.done) .pd-dh{grid-area:head;justify-content:flex-start}',
  '#modal .pd-det>.pd-di:not(.done) .pd-dt{grid-area:text;font-size:15.5px;font-weight:600;line-height:1.4}',
  '#modal .pd-det>.pd-di:not(.done) .pd-dt>div+div{font-weight:500;color:#475467;margin-top:3px}',
  '#modal .pd-det>.pd-di:not(.done) .pd-da{grid-area:act;display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:170px}',
  '#modal .pd-det>.pd-di:not(.done) .pd-da .btn{width:100%;justify-content:center;white-space:nowrap}',
  '@media(max-width:560px){#modal .pd-det>.pd-di:not(.done){grid-template-columns:1fr;grid-template-areas:"head" "text" "act"}#modal .pd-det>.pd-di:not(.done) .pd-da{flex-direction:row;flex-wrap:wrap;min-width:0}#modal .pd-det>.pd-di:not(.done) .pd-da .btn{width:auto}}'
  ].join('');
  document.head.appendChild(st);
})();
