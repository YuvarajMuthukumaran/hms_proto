/* 16 Nov 2026, Dr. Anu's video note: "the task bar keeps static and looks very weird". The pinned patient strip sat on top of the patient header and its cards.
   Now it stays out of the way while the patient header is on screen and slides in only once the header has scrolled away. Psychiatrist screens only. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const css=document.createElement('style');css.id='sb-autohide-css';
  css.textContent='#safeBar{transition:opacity .18s ease,max-height .18s ease}#safeBar.sb-collapsed{max-height:0!important;min-height:0!important;padding-top:0!important;padding-bottom:0!important;margin:0!important;border-width:0!important;opacity:0;overflow:hidden;box-shadow:none!important;pointer-events:none}';
  document.head.appendChild(css);
  function update(){
    const bar=document.getElementById('safeBar');if(!bar)return;
    const hd=document.querySelector('#view .dph, #view .dpmain');
    if(!hd){bar.classList.remove('sb-collapsed');return;}
    const top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shTop'))||0;
    const r=(hd.closest('.dph')||hd).getBoundingClientRect();
    bar.classList.toggle('sb-collapsed',r.bottom>top+8);
  }
  window.addEventListener('scroll',update,true);window.addEventListener('resize',update);
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{update();}catch(e){}return r;};
})();
