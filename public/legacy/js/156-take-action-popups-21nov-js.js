/* 21 Nov 2026, owner: everything inside Take Action opens a pop-up like the eye window, no page jump.
   Psychiatrist and floor lead psychiatrist only (the Take Action menu of block 26).
   - Write the note / daily note rows       -> daily-note pop-up (psyPopNote)
   - Round note row                         -> Round note pop-up (psyEyePop, block 152)
   - every other row that used to open a page (Review treatment, Open management plan, Open detailed history,
     Review and sign, Record capacity review ...) -> Review pop-up with a required note, saved as action taken for
     the items of that row. Rows that already are a pop-up (Approve, Call family, Log action taken) stay as they are. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  if(typeof window.psyMenu!=='function'||typeof window.psyEyePop!=='function')return;
  const txt=e=>(e&&e.textContent||'').trim();
  window.__menuPop=[];
  const __pm=window.psyMenu;
  window.psyMenu=function(ev,pid){
    const r=__pm.apply(this,arguments);
    try{
      const el=document.getElementById('pdMenu');if(!el)return r;
      const m=(window.__psyMap||{})[pid];
      const tk=(window.psyPx&&psyPx(pid).taken)||{};
      const open=m?m.items.filter(i=>!tk[i.key]&&!(i.id&&S.done&&S.done[i.id])):[];
      el.querySelectorAll('.pdm-i').forEach(b=>{
        const oc=b.getAttribute('onclick')||'',t=txt(b.querySelector('b'));
        if(/Log action taken/i.test(t))return;
        if(/^(Write daily note|Write the note|Take daily notes|Open the note)$/i.test(t)){b.setAttribute('onclick',`pdMenuClose();psyPopNote('${pid}')`);return;}
        if(/^(Round note|Open rounds)$/i.test(t)){b.setAttribute('onclick',`pdMenuClose();psyEyePop('${pid}',-1,'round')`);return;}
        if(!/go\(|psyToChart|psyOpenRounds/.test(oc))return; /* already a pop-up */
        let items=open.filter(i=>i.btn&&i.btn[0]===t);
        if(!items.length&&/^Review treatment$/i.test(t))items=open.filter(i=>i.k==='alert'||i.k==='order'||/result/i.test(i.lab[1]));
        const n=window.__menuPop.push(items)-1;
        b.setAttribute('onclick',`pdMenuClose();psyEyePop('${pid}',__menuPop[${n}],'review')`);
      });
    }catch(e){}
    return r;
  };
})();
