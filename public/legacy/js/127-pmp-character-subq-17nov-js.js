/* 17 Nov 2026, Trello: Premorbid personality questions 4 to 8 (the five "Character: ..." lines) are really
   one question with five parts -- renumber them 4A, 4B, 4C, 4D, 4E under question 4, instead of five separate
   top-level questions (which also meant everything after them, Fantasy life onward, was numbered too high).
   Psychiatrist and psychologist screens only; same CSS counter the Q1, Q2 ... badges already use (70/71). */
(function(){
  const isPsy=()=>/^(psychiatrist|psychologist)$/.test(String((window.__TULASI__||{}).role||''));
  if(!isPsy())return;
  const css=document.createElement('style');css.id='pmp-subq-css';
  css.textContent=`
  .hf.pmp-sub{counter-increment:hq 0 hsub 1!important}
  .hf.pmp-sub-first{counter-reset:hsub 1}
  .hf.pmp-sub>.lbl:first-child::before{content:counter(hq) counter(hsub,upper-alpha)!important}
  `;
  document.head.appendChild(css);
  function tag(){
    if(String(S.hsec||'')!=='pmp')return;
    let seen=false;
    document.querySelectorAll('#view .hwrap .hgrid>.hf').forEach(el=>{
      const lbl=((el.querySelector(':scope>.lbl')||{}).textContent||'').trim();
      if(!/^Character:/.test(lbl))return;
      el.classList.add('pmp-sub');
      if(!seen){el.classList.add('pmp-sub-first');seen=true;}
    });
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{tag();}catch(e){}return r;};
})();
