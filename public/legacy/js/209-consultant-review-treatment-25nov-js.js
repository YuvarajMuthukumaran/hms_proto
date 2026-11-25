/* 25 Nov 2026 (owner): "every consultant review must open Review treatment". Psychiatrist and floor lead psychiatrist.
   Eye window cards and Take Action rows about a consultant review ("No consultant review for N days", "Consultant review")
   open the Review treatment pop-up (block 162: medicine chart, monitoring, note) instead of Rounds. Saving that review also
   counts as the consultant review: a Rounds entry is added (psyx.roundLog, why "Review treatment"), so the review clock
   (blocks 83/182, __crDays) restarts and the alert closes. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  if(typeof window.psyEyePop!=='function')return;
  const CR=/consultant review/i,DN=/daily note/i;
  const txt=e=>(e&&e.textContent||'').trim();
  window.__crPop=window.__crPop||[];
  function crItems(pid){
    const m=(window.__psyMap||{})[pid];if(!m)return [];
    const tk=(window.psyPx&&psyPx(pid).taken)||{};
    return m.items.filter(i=>CR.test(i.txt||'')&&!tk[i.key]&&!(i.id&&S.done&&S.done[i.id]));
  }
  const call=pid=>{const n=window.__crPop.push(crItems(pid))-1;return `psyEyePop('${String(pid).replace(/'/g,'')}',__crPop[${n}],'review')`;};
  function eyeFix(pid){
    const modal=document.getElementById('modal');if(!modal||!pid)return;
    modal.querySelectorAll('.pd-det > .pd-di:not(.done)').forEach(card=>{
      const t=card.textContent||'';if(!CR.test(t)||DN.test(t))return;
      const da=card.querySelector('.pd-da');if(!da||da.dataset.cr)return;da.dataset.cr='1';
      da.innerHTML='<button class="btn sm pri" onclick="closeModal();'+call(pid)+'">Review treatment</button>';
    });
  }
  if(typeof window.psyEye==='function'){
    const __e=window.psyEye;
    window.psyEye=function(pid){const r=__e.apply(this,arguments);try{eyeFix(pid);}catch(e){}return r;};
  }
  if(typeof window.psyMenu==='function'){
    const __m=window.psyMenu;
    window.psyMenu=function(ev,pid){
      const r=__m.apply(this,arguments);
      try{const el=document.getElementById('pdMenu');
        if(el&&crItems(pid).length){
          let rt=[...el.querySelectorAll('.pdm-i')].find(b=>/^Review treatment$/i.test(txt(b.querySelector('b'))));
          if(!rt){const ro=[...el.querySelectorAll('.pdm-i')].find(b=>/^(Open rounds|Round note)$/i.test(txt(b.querySelector('b'))));
            if(ro){rt=ro.cloneNode(true);ro.parentNode.insertBefore(rt,ro);const b=rt.querySelector('b');if(b)b.textContent='Review treatment';
              const s=rt.querySelector('span,small,.tiny');if(s&&s!==b)s.textContent='Consultant review: medicines, monitoring and your note';}}
          if(rt)rt.setAttribute('onclick','pdMenuClose();'+call(pid));
        }
      }catch(e){}
      return r;
    };
  }
  /* the review is the consultant review: add it to Rounds so the clock restarts */
  let cur=null;
  const __pop=window.psyEyePop;
  window.psyEyePop=function(pid,idx,mode){
    const items=Array.isArray(idx)?idx:[];
    cur={pid,cr:mode==='review'&&items.some(i=>CR.test(i.txt||''))};
    return __pop.apply(this,arguments);
  };
  const __save=window.psyEyePopSave;
  window.psyEyePopSave=function(){
    const c=cur,n=(((document.getElementById('epN')||{}).value)||'').trim();
    const r=__save.apply(this,arguments);
    try{if(c&&c.cr&&n){
      const x=psyPx(c.pid);x.roundLog=x.roundLog||[];
      x.roundLog.unshift({at:atNow(),ts:Date.now(),by:signer(),note:n,why:'Review treatment',changes:[]});
      cur=null;render();}}catch(e){}
    return r;
  };
})();
