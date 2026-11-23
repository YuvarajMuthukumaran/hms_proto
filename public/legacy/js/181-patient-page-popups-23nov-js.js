/* 23 Nov 2026, re-check of the 21 Nov meeting ("all actions on the patient page open as pop-ups, not redirect").
   Psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist.
   1. Patient header "Round note" (psychiatrist) opened the Rounds page; it now opens the Rounds pop-up (psyEyePop, blocks 152/162).
   2. "Due for this patient" > "Daily note · today" opened the Daily notes page; it now opens the daily-note pop-up (psyPopNote),
      with "Open full record" for the page.
   3. Pop-ups opened on the patient page say "You stay on this page" (not "on the dashboard") and Cancel/Save do not
      re-open the dashboard eye window later.
   4. Psychiatrist daily-note pop-up: the psychologist's "Today from ..." card is removed (meeting: the pop-up showed
      psychologist data); the psychologist's note stays on the Daily notes page.
   5. Take Action captions that still said "Open the nursing chart" / "Opens Rounds on this patient only" now say pop-up. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const DOC=/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE);
  if(!DOC&&!/^(psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^\/?]+)/);return m?decodeURIComponent(m[1]):'';};
  let onPage=false;

  function fixModal(pid){
    const m=document.querySelector('.modal');if(!m)return;
    m.querySelectorAll('p,.small,.ms,div').forEach(e=>{if(e.children.length===0&&/You stay on the dashboard\./.test(e.textContent))e.textContent=e.textContent.replace('You stay on the dashboard.','You stay on this page.');});
    const mf=m.querySelector('.mf');
    if(mf){
      mf.querySelectorAll('button').forEach(b=>{if(/S\.__eyePid/.test(b.getAttribute('onclick')||''))b.setAttribute('onclick','closeModal()');});
      if(!mf.querySelector('.rp-full')&&pid){const b=document.createElement('button');b.type='button';b.className='btn rp-full';b.style.marginRight='auto';b.textContent='Open full record';b.setAttribute('onclick',"closeModal();go('#/patient/"+String(pid).replace(/'/g,'')+"/daily')");mf.insertBefore(b,mf.firstChild);}
    }
  }

  /* 4 + 3: daily-note pop-up */
  if(typeof window.psyPopNote==='function'){
    const __pn=window.psyPopNote;
    window.psyPopNote=function(pid){
      const r=__pn.apply(this,arguments);
      try{
        if(DOC)document.querySelectorAll('.modal #pdnBody .conote').forEach(c=>{const w=c.parentElement;(w&&w.id!=='pdnBody'&&w.children.length===1?w:c).remove();});
        if(pidNow())fixModal(pid);
      }catch(e){}
      return r;
    };
    if(DOC&&typeof window.psyPopNoteDraw==='function'){
      const __dr=window.psyPopNoteDraw;
      window.psyPopNoteDraw=function(){const r=__dr.apply(this,arguments);try{document.querySelectorAll('.modal #pdnBody .conote').forEach(c=>{const w=c.parentElement;(w&&w.id!=='pdnBody'&&w.children.length===1?w:c).remove();});}catch(e){}return r;};
    }
  }

  /* 1 + 3: Rounds pop-up from the patient page (psychiatrist) */
  if(DOC&&typeof window.psyEyePop==='function'){
    window.m23RoundPop=function(pid){onPage=true;window.psyEyePop(pid,-1,'round');try{fixModal('');}catch(e){}};
    if(typeof window.psyEyePopSave==='function'){
      const __sv=window.psyEyePopSave;
      window.psyEyePopSave=function(){const was=onPage;const r=__sv.apply(this,arguments);if(was&&!document.getElementById('epN')){onPage=false;try{delete S.__eyePid;}catch(e){}}return r;};
    }
  }

  function wire(){
    const pid=pidNow();if(!pid)return;
    const v=document.getElementById('view');if(!v)return;
    if(DOC&&window.m23RoundPop){
      const b=[...v.querySelectorAll('.dph button')].find(x=>/^Round note$/i.test((x.textContent||'').trim()));
      if(b&&b.dataset.m23!==pid){b.dataset.m23=pid;b.removeAttribute('onclick');b.onclick=e=>{e.preventDefault();e.stopPropagation();window.m23RoundPop(pid);};}
    }
    if(typeof window.psyPopNote==='function'){
      v.querySelectorAll('.dpbelow button.tog').forEach(b=>{
        if(!/^Daily note\b/i.test((b.textContent||'').trim())||b.dataset.m23===pid)return;
        b.dataset.m23=pid;b.removeAttribute('onclick');b.onclick=e=>{e.preventDefault();window.psyPopNote(pid);};
      });
    }
  }

  /* 5: Take Action captions */
  function captions(){
    const m=document.getElementById('pdMenu');if(!m)return;
    m.querySelectorAll('.pdm-i').forEach(b=>{const s=b.querySelector('span'),oc=b.getAttribute('onclick')||'';if(!s)return;
      if(/psyEyePop|psyPopNote|pgRoundPop/.test(oc)&&/Open the nursing chart|Opens Rounds on this patient only/.test(s.textContent))s.textContent='Pop-up for this patient';});
  }
  ['psyMenu','pgMenu'].forEach(k=>{if(typeof window[k]!=='function')return;const __m=window[k];window[k]=function(){const r=__m.apply(this,arguments);try{captions();}catch(e){}return r;};});

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{wire();}catch(e){}return o;};
  try{wire();}catch(e){}
})();
