/* 21 Nov 2026, owner: the cards in the eye window (Floor lead, Vitals, Event ...) left the right half empty.
   Now each card is two columns: the tag and the sentence on the left, the action buttons stacked on the right, and a
   coloured edge by severity. Style only; the markup and the buttons are unchanged (block 26). */
(function(){
  const st=document.createElement('style');st.id='eye-cards-css';
  st.textContent=[
  '#modal .pd-det{gap:12px}',
  '#modal .pd-det>.pd-di:not(.done){display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"head act" "text act";column-gap:24px;row-gap:8px;align-items:center;padding:16px 18px;position:relative;overflow:hidden;border-radius:14px;background:#fff;border:1px solid #e3eaf2}',
  '@keyframes pdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes pdDot{0%,100%{box-shadow:0 0 0 0 rgba(229,72,77,.45)}60%{box-shadow:0 0 0 6px rgba(229,72,77,0)}}',
  '#modal .pd-det>.pd-di:not(.done){animation:pdIn .35s ease both;transition:transform .18s ease,box-shadow .18s ease}',
  '#modal .pd-det>.pd-di:not(.done):nth-child(2){animation-delay:.07s}#modal .pd-det>.pd-di:not(.done):nth-child(3){animation-delay:.14s}#modal .pd-det>.pd-di:not(.done):nth-child(n+4){animation-delay:.2s}',
  '#modal .pd-det>.pd-di:not(.done):hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(16,24,40,.08)}',
  '#modal .pd-det>.pd-di .pd-chip.red::before{animation:pdDot 2s ease-out infinite}',
  '@media(prefers-reduced-motion:reduce){#modal .pd-det>.pd-di,#modal .pd-det>.pd-di .pd-chip::before{animation:none!important;transition:none!important}}',
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
