/* 16 Nov 2026, Dr. Anu's meeting, Trello "tasks in dashboard and action buttons not matching" (psychiatrist Today only):
   - The eye window and the Take Action menu show one entry for items that share a label (e.g. Documentation: Weight overdue + Sugar overdue), not one each.
   - "Log action" is removed for the family call only (the call has its own outcome pop-up); every other item keeps it. */
(function(){
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const txt=e=>(e&&e.textContent||'').trim();

  function mergeEye(){
    const det=document.querySelector('#modal .pd-det');if(!det||det.dataset.pm)return;det.dataset.pm='1';
    const cards=[...det.querySelectorAll(':scope > .pd-di')].filter(c=>!c.classList.contains('done'));
    const groups=new Map();
    cards.forEach(c=>{const k=txt(c.querySelector('.pd-chip'));if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);});
    groups.forEach(list=>{
      if(list.length<2)return;
      const first=list[0],dt=first.querySelector('.pd-dt'),da=first.querySelector('.pd-da');
      const lines=list.map(c=>txt(c.querySelector('.pd-dt')));
      dt.innerHTML=lines.map(l=>`<div>${hesc(l)}</div>`).join('');
      const seen=new Set([...da.querySelectorAll('button')].map(txt));
      list.slice(1).forEach(c=>{
        c.querySelectorAll('.pd-da button').forEach(b=>{const t=txt(b);if(t==='Log action'||seen.has(t))return;seen.add(t);da.insertBefore(b,[...da.querySelectorAll('button')].find(x=>txt(x)==='Log action')||null);});
        c.remove();
      });
      const lg=[...da.querySelectorAll('button')].find(b=>txt(b)==='Log action');
      const pid=(det.closest('#modal')||document).querySelector('[onclick*="go(\'#/patient/"]');
      if(lg){const m=(pid&&pid.getAttribute('onclick')||'').match(/patient\/([^/']+)/);if(m)lg.setAttribute('onclick',"closeModal();psyActionTaken('"+m[1]+"')");}
    });
    det.querySelectorAll(':scope > .pd-di').forEach(c=>{
      const bs=[...c.querySelectorAll('.pd-da button')];
      if(bs.some(b=>txt(b)==='Call family'))bs.forEach(b=>{if(txt(b)==='Log action')b.remove();});
    });
  }
  const __eye=window.psyEye;
  if(typeof __eye==='function')window.psyEye=function(){const r=__eye.apply(this,arguments);try{mergeEye();}catch(e){}return r;};

  function mergeMenu(){
    const m=document.getElementById('pdMenu');if(!m||m.dataset.pm)return;m.dataset.pm='1';
    const rows=[...m.querySelectorAll('.pdm-i')];
    const by=new Map();
    rows.forEach(r=>{const t=txt(r.querySelector('b'));if(t==='Log action taken')return;if(!by.has(t))by.set(t,[]);by.get(t).push(r);});
    by.forEach(list=>{
      if(list.length<2)return;
      const subs=list.map(r=>txt(r.querySelector('span'))).filter(Boolean);
      const sp=list[0].querySelector('span');if(sp){sp.textContent=subs.join(' · ');sp.style.whiteSpace='normal';}
      list.slice(1).forEach(r=>r.remove());
    });
    const left=[...m.querySelectorAll('.pdm-i')].filter(r=>!/^(Log action taken|Write daily note|Round note|Review treatment)$/.test(txt(r.querySelector('b'))));
    if(left.length&&left.every(r=>txt(r.querySelector('b'))==='Call family')){const lg=[...m.querySelectorAll('.pdm-i')].find(r=>txt(r.querySelector('b'))==='Log action taken');if(lg)lg.remove();}
  }
  const __menu=window.psyMenu;
  if(typeof __menu==='function')window.psyMenu=function(){const r=__menu.apply(this,arguments);try{mergeMenu();}catch(e){}return r;};
})();
