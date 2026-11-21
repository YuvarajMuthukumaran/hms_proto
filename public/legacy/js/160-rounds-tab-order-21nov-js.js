/* 21 Nov 2026, owner: in the patient tabs the Rounds tab comes right after Daily notes (psychiatrist, psychologist and both floor leads).
   The tab is injected by block 153 after the others, so it is moved here after every render. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  function fix(){
    document.querySelectorAll('#view .subtabs').forEach(bar=>{
      const btns=[...bar.querySelectorAll(':scope > button')];
      const rounds=btns.find(b=>b.dataset.acr==='rounds'||/^\s*Rounds\s*$/.test(b.textContent||''));
      const daily=btns.find(b=>/^\s*Daily notes/.test(b.textContent||''));
      if(rounds&&daily&&daily.nextElementSibling!==rounds)daily.after(rounds);
    });
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{fix();}catch(e){}return o;};
  /* tabs injected a moment after render by blocks 141 and 153 */
  new MutationObserver(()=>{try{fix();}catch(e){}}).observe(document.body,{childList:true,subtree:true});
})();
