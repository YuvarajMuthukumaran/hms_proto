/* 21 Nov 2026 — Anu: "Order monitoring" button (native from 01-portal-main) and "Scales ordered"
   must only appear in Admission workup, not in Treatment Plan vitals or any other view. */
(function(){
  const inWorkup=()=>{
    try{
      const m=(location.hash||'').match(/^#\/patient\/[^/]+\/([^/?]+)/);
      return!!m&&m[1]==='admission'&&window.S&&S.admSec==='workup';
    }catch(e){return false;}
  };

  function applyGate(){
    const v=document.getElementById('view');if(!v)return;
    const inWk=inWorkup();
    /* Find every "Order monitoring" button that is the native dummy (onclick contains "toast") */
    v.querySelectorAll('button').forEach(b=>{
      if(b.textContent.trim()==='Order monitoring'&&String(b.getAttribute('onclick')||'').includes('toast')){
        b.style.display=inWk?'':'none';
      }
    });
    /* Also hide #scList (scales ordered list injected by 86) outside workup */
    const sc=v.querySelector('#scList');if(sc)sc.style.display=inWk?'':'none';
    /* Hide injected [data-sc] button outside workup (belt-and-suspenders) */
    v.querySelectorAll('[data-sc]').forEach(b=>{b.style.display=inWk?'':'none';});
  }

  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{applyGate();}catch(e){}return r;};
  window.addEventListener('hashchange',function(){try{applyGate();}catch(e){}});
  try{applyGate();}catch(e){}
})();
