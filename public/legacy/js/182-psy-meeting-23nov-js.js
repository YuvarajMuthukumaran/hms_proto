/* 23 Nov 2026, meeting with Dr. Anu and Nikita (screen recording 23 Nov, psychiatrist).
   Psychiatrist and floor lead psychiatrist only.
   1. "No consultant review": the alert comes after one week (7 days), not 5; a saved round note counts as a review (block 83 edited).
      Alerts already raised with an old count ("for 6 days") show today's count, and are closed when the patient was reviewed in the last 7 days.
   2. Eye window: a card about the consultant review / follow-up / daily note has one button, "Open rounds" (Rounds shows all of it).
      "Review follow-up" and "Take daily notes" are not offered beside it. Items that need a treatment change (early warning score, absconding,
      vitals, events) keep "Review treatment", which opens the review pop-up with the medicines and the monitoring running now (block 162).
      Take Action: "Review follow-up" is "Open rounds".
   3. Type column on Today: the most critical open task of that patient (any line, not only the three shown), so it changes once that task is done.
   4. Rounds: the "‹ Inpatients" link above the page is gone. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const txt=e=>(e&&e.textContent||'').trim();

  /* ---------- 1. consultant review alerts with an old count ---------- */
  const CR=/^No consultant review for (\d+) days?/;
  function crFix(){
    if(typeof window.__crDays!=='function')return;
    let al=[];try{al=v3().alerts||[];}catch(e){return;}
    al.forEach(a=>{
      if(!a||a.closed||!CR.test(String(a.title||''))||!a.pid)return;
      let d;try{d=window.__crDays(a.pid);}catch(e){return;}
      if(!(d>=0))return;
      if(d<7){a.closed=true;a.closedBy='System: reviewed in the last 7 days';return;}
      const t=String(a.title).replace(CR,'No consultant review for '+d+' days');
      if(t!==a.title)a.title=t;
    });
  }

  /* ---------- 2. eye window buttons ---------- */
  const ROUNDISH=/^(Open rounds|Review follow-up|Take daily notes|Write the note)$/i;
  const ROUNDCARD=/consultant review|follow-up|daily note (due|not written|missing|overdue)|no daily note/i;
  function eyeFix(pid){
    const modal=document.getElementById('modal');if(!modal)return;
    modal.querySelectorAll('.pd-det > .pd-di:not(.done)').forEach(card=>{
      if(pid&&ROUNDCARD.test(card.textContent||'')&&!/unsigned|to sign/i.test(card.textContent||'')){const da=card.querySelector('.pd-da');if(da&&!da.dataset.m23){da.dataset.m23='1';
        /* 24 Nov 2026 (Trello 224): a daily-note card gets "Write daily note" (the daily-note pop-up) first, Open rounds beside it */
        const dn=/daily note (due|not written|missing|overdue)|no daily note/i.test(card.textContent||'')&&typeof window.psyPopNote==='function';
        da.innerHTML=(dn?'<button class="btn sm pri" onclick="closeModal();psyPopNote(\''+pid+'\')">Write daily note</button>':'')+'<button class="btn sm'+(dn?'':' pri')+'" onclick="closeModal();psyEyePop(\''+pid+'\',-1,\'round\')">Open rounds</button>';
        if(dn){da.style.display='flex';da.style.gap='8px';da.querySelectorAll('button').forEach(b=>{b.style.flex='1 1 140px';});}}return;}
      const bs=[...card.querySelectorAll('.pd-da button')];
      const fu=bs.filter(b=>/^Review follow-up$/i.test(txt(b)));
      fu.forEach(b=>{b.textContent='Open rounds';b.setAttribute('onclick',(b.getAttribute('onclick')||'').replace(/'review'\)/,"'round')"));});
      const rb=[...card.querySelectorAll('.pd-da button')].filter(b=>/^Open rounds$/i.test(txt(b)));
      if(!rb.length)return;
      /* one Open rounds per card, no daily-note button beside it */
      rb.slice(1).forEach(b=>b.remove());
      [...card.querySelectorAll('.pd-da button')].forEach(b=>{if(b!==rb[0]&&ROUNDISH.test(txt(b)))b.remove();});
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
        if(el){const seen={};el.querySelectorAll('.pdm-i').forEach(b=>{const bb=b.querySelector('b');if(!bb)return;
          if(/^Review follow-up$/i.test(txt(bb))){bb.textContent='Open rounds';b.setAttribute('onclick',`pdMenuClose();psyEyePop('${pid}',-1,'round')`);}
          const k=txt(bb).toLowerCase();if(/^(open rounds|round note)$/.test(k)){if(seen.r)b.remove();seen.r=1;}});}
      }catch(e){}
      return r;
    };
  }

  /* ---------- 3. Type column: the most critical open task ---------- */
  const CAT=[
    ['Critical','red',/critical|escalat|seizure|self-?harm|abscond|chok|emergency|suicid|physical aggression|assault|delirium|medically unstable|early warning score [5-9]|urgent rmo/i],
    ['Clinical event','amber',/vital|fever|withdrawal|\bfall\b|aggress|behaviour|incident|\bevent\b|early warning/i],
    ['Medication','amber',/countersign|drows|refus|\bSOS\b|\bPRN\b|adverse|medicine|medication|\border\b|\bdose|approve/i],
    ['Investigation','amber',/\blab\b|\becg\b|result|investigation/i],
    ['Overdue review','amber',/consultant review|follow-up|overdue|not assessed|not reviewed/i],
    ['MHCA','amber',/admission capacity|capacity (assessment )?at admission|capacity assessment due|form e|form c|section 8|section 9|mhca|nominated|advance directive|mhrb/i],
    ['Admission','grey',/admission|work-?up|add psychologist/i],
    ['Documentation','grey',/capacity|consent|note|history|plan|summary|re-?assess|draft|document|sign/i],
    ['Family','grey',/family|call|visit|24[ -]?hour/i]];
  const NAME={'Overdue review':'Review due'};
  function typeFix(){
    if(!/^#\/myday/.test(location.hash||''))return;
    const MAP=window.__psyMap||{};
    document.querySelectorAll('#view .pd-t tr[data-dt]').forEach(tr=>{
      const ty=tr.querySelector('.pd-ty');if(!ty||/^Done$/i.test(txt(ty)))return;
      const eye=tr.querySelector('.pd-eye');const pid=((eye&&eye.getAttribute('onclick'))||'').match(/psyEye\('([^']+)'\)/);
      const m=pid&&MAP[pid[1]];if(!m)return;
      let tk={};try{tk=(window.psyPx&&psyPx(pid[1]).taken)||{};}catch(e){}
      const open=m.items.filter(i=>!tk[i.key]&&!(i.id&&S.done&&S.done[i.id]));if(!open.length)return;
      let best=null;
      open.forEach(i=>{const s=String(i.txt||'')+' '+String((i.lab||[])[1]||'');const ix=CAT.findIndex(c=>c[2].test(s));const r=ix<0?CAT.length:ix;if(!best||r<best.r)best={r,c:CAT[ix]};});
      if(!best||!best.c)return;
      const label=NAME[best.c[0]]||best.c[0];
      if(txt(ty)!==label)ty.textContent=label;
      ty.classList.remove('red','amber','blue');if(best.c[1]!=='grey')ty.classList.add(best.c[1]);
      ty.dataset.pg='1';
    });
  }

  /* ---------- 4. Rounds: no "‹ Inpatients" link ---------- */
  const css=document.createElement('style');css.id='m23-psy-css';
  css.textContent='#view .pr-back{display:none!important}';
  document.head.appendChild(css);

  const __r=render;
  render=function(){
    try{crFix();}catch(e){}
    const o=__r.apply(this,arguments);
    try{typeFix();}catch(e){}
    setTimeout(()=>{try{typeFix();}catch(e){}},300);
    return o;
  };
})();
