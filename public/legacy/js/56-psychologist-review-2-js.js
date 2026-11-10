/* Psychologist only (10 Nov 2026, review with Anu and Chandra Sir, transcript "Psychologist Portal").
   Take the psychiatrist's formatting as the model:
   - left rail: Today, Patients, Rounds, Daily notes, Handover (no row of coloured pills above the pages); "handed over to you" card on Today
   - Daily notes page: no "End of day notes" title and no Dictate, Back to dashboard on the top row, the four steps in two columns,
     WhatsApp updates above "Written earlier today"
   - patient tabs: Stay summary, Past admissions, Admission, Management Plan, Vitals and medicines, Daily notes, Therapy Plans, Patient Experience,
     Discharge summary (Forms to print and Grievances tabs are gone: Print file and Patient Experience replace them)
   - Stay summary: no Add psychologist, no psychiatrist alerts (not reviewed event, Day 3 to 4 call, capacity tasks), no lab results, no Change medicines
   - Admission: the numbered steps; Admission workup (treatment chart, vitals, labs) and Detailed capacity are view only; Detailed history and Form C stay open
   Every change is gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const asDoctor=fn=>function(){const r=S.role;S.role='psychiatrist';try{return fn.apply(this,arguments);}finally{S.role=r;}};
  const svg=p=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const RI=svg('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/>');
  const NI=svg('<path d="M5 4h11l3 3v13H5z"/><path d="M9 11h6M9 15h6"/>');
  const HI=svg('<path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/>');

  const css=document.createElement('style');css.id='psychologist-review-2-css';
  css.textContent=`
  body.psg .pn-start{display:none!important}
  body.psg .eodhd{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
  body.psg .eodhd .eprog{flex:1 1 260px;min-width:200px}
  /* Daily notes: one bordered card, four quadrants with dividers, blue titles, plain answer pills (like the psychiatrist's note) */
  body.psg .pn-main{display:grid;grid-template-columns:minmax(0,1fr);gap:0;align-items:stretch;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
  body.psg .pn-main>.pn-bar{grid-column:1/-1;border-top:1px solid var(--line)}
  body.psg .pn-main>.pn-step{margin:0;border:0!important;border-radius:0!important;box-shadow:none!important;background:none!important;padding:0;border-bottom:1px solid var(--line)!important}
  body.psg .pn-step .pn-h{padding:16px 22px 4px;background:none;border:0}
  body.psg .pn-step .pn-n,body.psg .pn-step .pn-ht>span,body.psg .pn-step .pn-h .chip,body.psg .pn-step .pn-chev{display:none!important}
  body.psg .pn-step .pn-ht b{font-size:16px;font-weight:700;color:#175cd3}
  body.psg .pn-step .pn-body{padding:4px 22px 16px!important}
  body.psg .pn-ql{font-size:15px;font-weight:600;color:var(--ink-2);margin:10px 0 8px}
  body.psg .pn-ql span{font-size:11px;font-weight:500;margin-left:6px}
  body.psg .pn-o{padding:6px 14px!important;font-size:14px!important;min-height:34px!important;border-radius:99px}
  /* one screen, no scrolling: the progress/preview column is gone and the four groups sit side by side */
  body.psg .pn{grid-template-columns:minmax(0,1fr)!important}
  body.psg .pn-side{display:none!important}
  body.psg .pn-main>.pn-bar{position:static!important;box-shadow:none!important;border-radius:0!important;padding:10px 18px}
  @media (min-width:900px){
    body.psg .pn-main{grid-template-columns:repeat(2,minmax(0,1fr))}
    body.psg #pnS-0,body.psg #pnS-2{border-right:1px solid var(--line)!important}
  }
  @media (min-width:1250px){
    body.psg .pn-main{grid-template-columns:repeat(4,minmax(0,1fr))}
    body.psg .pn-main>.pn-step{border-bottom:0!important;border-right:1px solid var(--line)!important}
    body.psg #pnS-3{border-right:0!important}
    body.psg .pn-main>.pn-bar{border-top:1px solid var(--line)}
    body.psg .pn-step .pn-h{padding:12px 16px 2px}
    body.psg .pn-step .pn-body{padding:2px 16px 12px!important}
    body.psg .pn-ql{margin:6px 0 4px;font-size:13.5px}
    body.psg .pn-main>.pn-bar{padding:8px 18px}
    body.psg .eodhd{padding:6px 18px!important}
    body.psg .pn-o{padding:4px 10px!important;font-size:12.5px!important;min-height:28px!important}
    body.psg .pn-os{gap:5px}
    body.psg .pn-pt{margin-bottom:6px}
    body.psg .pn-ph{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}
    body.psg .pn-ph button{padding:3px 9px;font-size:12px;min-height:26px}
    body.psg .pn-q textarea{min-height:56px}
    body.psg .eodhd{padding:10px 18px}
    body.psg .estrip{padding:6px 18px}
    body.psg .pn-wrap{margin:0}
  }
  /* Rounds: Medicines and the therapeutic plan side by side, using the full width */
  body.psg .rbox:has(.rquad){display:grid;grid-template-columns:minmax(260px,1fr) minmax(0,2fr);gap:12px;align-items:start;border:0;background:none;box-shadow:none;padding:0}
  body.psg .rbox>.rquad{display:contents}
  body.psg .rquad>.card{margin:0;height:auto}
  body.psg #advTx{flex:1 1 260px!important}
  body.psg .rquad textarea.input{min-height:0}
  @media (max-width:1000px){body.psg .rbox:has(.rquad){grid-template-columns:1fr}}
  .pg-add{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px 0 12px;border:0;border-radius:99px;background:linear-gradient(180deg,#2f7df0,#1d62d8);color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 1px 2px rgba(16,24,40,.2),0 4px 12px rgba(29,98,216,.28),inset 0 1px 0 rgba(255,255,255,.25);transition:transform .15s ease,box-shadow .15s ease}
  .pg-add:hover{transform:translateY(-1px);box-shadow:0 2px 4px rgba(16,24,40,.2),0 8px 18px rgba(29,98,216,.34),inset 0 1px 0 rgba(255,255,255,.25)}
  .pg-add:active{transform:translateY(0)}
  .pg-add .pg-pl{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.2);display:grid;place-items:center;transition:transform .25s ease}
  .pg-add:hover .pg-pl{transform:rotate(90deg)}
  .pg-ro{display:flex;align-items:center;gap:10px;padding:9px 16px;background:#f2f4f7;border-bottom:1px solid var(--line);font-size:12.5px;color:var(--ink-2)}
  .pg-ro-b{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-radius:99px;padding:2px 9px;background:#fff;border:1px solid var(--line);color:#475467}
  .pg-ps{font-size:13.5px;font-weight:600;color:var(--ink);margin-bottom:6px}
  .pg-risk{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;border-radius:99px;padding:2px 10px}
  .pg-risk i{width:7px;height:7px;border-radius:50%;background:currentColor}
  .pg-risk.lo{background:#ecfdf3;color:#067647}.pg-risk.hi{background:#fef3f2;color:#b42318}
  .pg-iv{margin:0 0 9px}.pg-iv:last-child{margin:0}
  .pg-ivh{display:flex;justify-content:space-between;gap:10px;font-size:13px;font-weight:600;color:var(--ink)}.pg-ivh b{font-size:12px;color:var(--muted);font-weight:700}
  .pg-bar{height:5px;border-radius:99px;background:#eaecf0;margin:4px 0 3px;overflow:hidden}.pg-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#3b82f6,#12b76a);transform-origin:left;animation:pgbar .7s cubic-bezier(.2,.7,.2,1) both}
  .pg-ivs{font-size:11.5px;color:var(--muted);line-height:1.3}
  @keyframes pgbar{from{transform:scaleX(0)}}
  .pd-t tbody tr{animation:pgrow .35s ease both}.pd-t tbody tr:nth-child(2){animation-delay:.05s}.pd-t tbody tr:nth-child(3){animation-delay:.1s}.pd-t tbody tr:nth-child(4){animation-delay:.15s}.pd-t tbody tr:nth-child(5){animation-delay:.2s}
  @keyframes pgrow{from{opacity:0;transform:translateY(6px)}}
  @media (prefers-reduced-motion:reduce){.pd-t tbody tr,.pg-bar i{animation:none}}
  .pg-det{font-size:13px;line-height:1.45;color:var(--ink-2);display:table-cell}
  .pg-det{overflow:hidden}
  .pg-in{border-color:#b2ddff;background:#f5faff;margin-bottom:12px}`;
  document.head.appendChild(css);

  /* ---------- patient tabs ---------- */
  let tabsDone=false;
  const fixTabs=()=>{if(tabsDone)return;tabsDone=true;
    ['forms','griev'].forEach(k=>{const i=STAY.findIndex(x=>x[0]===k);if(i>=0)STAY.splice(i,1);});
    const t=STAY.find(x=>x[0]==='therapy');if(t)t[1]='Therapy Plans';
    const p=STAY.find(x=>x[0]==='prefs');if(p)p[1]='Patient Experience';
  };

  /* ---------- keep the psychiatrist's look; clean the page after each draw ---------- */
  const tidy=()=>{
    const v=$('view');if(!v)return;
    const tab=[...v.querySelectorAll('.subtabs .subtab')].find(b=>/^Discharge(?: summary)?$/.test(b.textContent.trim()));
    if(tab){tab.textContent='Discharge summary';tab.classList.add('psy-discharge-tab');}
    v.querySelectorAll('.lnk,button.tog').forEach(e=>{if(e.textContent.trim()==='Therapy and family')e.textContent='Therapy Plans';});
    /* no psychiatrist alerts and no reports on the psychologist's patient pages (alert logic for each role comes later) */
    v.querySelectorAll('button.tpadd,button.ev-chip').forEach(b=>b.remove());
    v.querySelectorAll('.kv button.tog').forEach(b=>{if(/^(Capacity assessment|Re-assessment|Day 3 to 4 family call)/.test(b.textContent.trim()))b.remove();});
    v.querySelectorAll('.lbl').forEach(l=>{if(/^Due for this patient/.test(l.textContent.trim())){const kv=l.closest('.kv');if(kv)l.textContent='Due for this patient · '+kv.querySelectorAll('button.tog').length;}});
    v.querySelectorAll('.fc9-b').forEach(b=>{if(/^(results|family call due now)/i.test(((b.querySelector('.fc9-k')||{}).textContent||'').trim()))b.remove();});
    v.querySelectorAll('section.fc9').forEach(s=>{if(!s.querySelector('.fc9-b'))s.remove();});
    /* Rounds: the page title already says Rounds, so the "Rounds · Male ward" heading and its line are removed (End rounds stays) */
    v.querySelectorAll('h2').forEach(h=>{if(/^Rounds\s*·/.test(h.textContent.trim())){const w=h.parentElement;h.remove();w.querySelectorAll('.muted').forEach(m=>m.remove());if(!w.children.length)w.remove();}});
    v.querySelectorAll('button[onclick^="psyThAdd"]').forEach(b=>{if(b.dataset.pg)return;b.dataset.pg='1';b.className='pg-add';b.innerHTML='<span class="pg-pl"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span>Add';});
    const tx=v.querySelector('#advTx');
    if(tx){const card=tx.closest('section.card'),nb=card&&[...card.querySelectorAll('button')].find(b=>/confirmRound/.test(b.getAttribute('onclick')||''));
      if(nb){const row=nb.parentElement,box=card.querySelector('div[style*="flex-direction:column"]');if(box&&row!==box){box.appendChild(row);}}
      const ta=card&&card.querySelector('textarea');if(ta)ta.rows=2;}
    v.querySelectorAll('.medbox button.btn').forEach(b=>{if(/^Change medicines/.test(b.textContent.trim()))b.remove();});
  };
  const __r=render;
  render=function(){
    if(me()){
      fixTabs();
      const h=location.hash||'';
      if(/^#\/patient\/[^/]+\/griev$/.test(h)){location.replace(h.replace(/\/griev$/,'/prefs'));return;}
      if(/^#\/patient\/[^/]+\/forms$/.test(h)){location.replace(h.replace(/\/forms$/,'/overview'));return;}
    }
    const out=__r.apply(this,arguments);
    if(me()){document.body.classList.add('psy-views','psg');try{tidy();}catch(e){}}
    else document.body.classList.remove('psg');
    return out;
  };

  /* ---------- left rail: Today, Patients, Rounds, Daily notes, Handover ---------- */
  const __rs=renderSide;
  renderSide=function(){
    const out=__rs.apply(this,arguments);
    if(me()){
      const dd=document.querySelector('#side .sgdd');
      if(dd&&!dd.querySelector('[data-pg56]')){
        dd.querySelectorAll('[data-pgho]').forEach(x=>x.remove());
        const hash=location.hash||'';
        let anchor=[...dd.children].find(x=>/Patients/.test(x.getAttribute('aria-label')||''))||dd.lastElementChild,lit=false;
        [['Rounds',RI,'#/rounds',/^#\/rounds/],['Daily notes',NI,'#/notes',/^#\/notes/],['Handover',HI,'#/handover',/^#\/handover/]].forEach(([l,ic,r,re])=>{
          const b=document.createElement('button');b.dataset.pg56='1';b.title=l;b.setAttribute('aria-label',l);b.setAttribute('onclick',`go('${r}')`);
          if(re.test(hash)){b.className='on';b.setAttribute('aria-current','page');lit=true;}
          b.innerHTML=`<span class="si">${ic}</span><span class="sl">${l}</span>`;
          anchor.after(b);anchor=b;
        });
        if(lit)dd.querySelectorAll('button.on:not([data-pg56])').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-current');});
      }
    }
    return out;
  };

  /* Today table: the psychiatrist-style details on each row (diagnosis, current psychopathology, ongoing interventions; no medicines) */
  /* clinical cells: psychopathology with a risk dot; interventions as rows with session progress bars */
  const psyCell=(p,pid,f)=>{
    let lvl=p.risk?'High':'Low';try{lvl=(psyPx(pid).riskLevel)||lvl;}catch(e){}
    const first=String(f.psychopath||'').split('\n')[0].replace(/\s*Risk of harm:.*$/,'').trim(),hi=/high/i.test(lvl);
    return `<td class="pg-det">${first?'<div class="pg-ps">'+hesc(first)+'</div>':''}<span class="pg-risk ${hi?'hi':'lo'}"><i></i>Risk of harm: ${hesc(lvl)}</span></td>`;
  };
  const ivCell=pid=>{
    let rows=[];try{rows=ptCtxOf(pid).psychRows||[];}catch(e){}
    if(!rows.length)return '<td class="pg-det"><span class="tiny muted">No interventions recorded</span></td>';
    return `<td class="pg-det">${rows.slice(0,3).map(r=>{const d=+r.done||0,q=+r.req||0,pc=q?Math.min(100,Math.round(d/q*100)):0;
      return `<div class="pg-iv"><div class="pg-ivh"><span>${hesc(r.iv||r.area)}</span><b>${d}/${q||'?'}</b></div><div class="pg-bar"><i style="width:${pc}%"></i></div><div class="pg-ivs">${hesc(r.area)}${r.out&&r.out!=='—'?' · '+hesc(r.out):''}</div></div>`;}).join('')}${rows.length>3?`<div class="tiny muted">+${rows.length-3} more</div>`:''}</td>`;
  };
  const richRows=h=>{
    try{
      const T=tpl(h),R=T.content,tb=R.querySelector('#dtBody'),tbl=R.querySelector('table.pd-t');if(!tb||!tbl)return h;
      const cell=t=>`<td class="pg-det">${t?hesc(t):'<span class="tiny muted">Not recorded</span>'}</td>`;
      const cut=t=>String(t||'').replace(/\s+/g,' ').trim();
      tb.querySelectorAll('tr[data-dt]').forEach(tr=>{
        const m=(tr.innerHTML.match(/#\/patient\/([^/']+)\//)||[])[1],p=m&&ptFind(m);if(!p)return;
        let f={};try{f=pgHoNote({},m)||{};}catch(e){}
        const g=k=>cut(Array.isArray(f[k])?f[k].join('; '):f[k]);
        const first=tr.children[0];
        if(p.dx){const nm=first.querySelector('.pd-who');if(nm)nm.insertAdjacentHTML('afterend',`<div class="pd-tags" style="margin:6px 0 0 50px"><span class="pd-tag blue">${hesc(p.dx)}</span></div>`);}
        first.insertAdjacentHTML('afterend',psyCell(p,m,f)+ivCell(m));
        if(tr.children[4])tr.children[4].remove();
        const ac=tr.querySelector('.pd-acts');if(ac)ac.insertAdjacentHTML('beforeend',`<button class="btn sm pd-take" aria-haspopup="menu" onclick="pgMenu(event,'${m}')">Take Action <span aria-hidden="true">▾</span></button>`); /* Daily note column (Take) removed */
      });
      const none=tb.querySelector('#dtNone td');if(none)none.colSpan=5;
      tbl.style.minWidth='1100px';
      const cg=tbl.querySelector('colgroup');if(cg)cg.innerHTML='<col style="width:250px"><col style="width:20%"><col style="width:22%"><col><col style="width:210px">';
      const th=tbl.querySelectorAll('thead th');if(th[0]){th[0].insertAdjacentHTML('afterend','<th>Current psychopathology</th><th>Ongoing interventions</th>');if(th[2])th[2].remove();}
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* Take Action menu: non-medical actions only */
  window.pgMenu=function(ev,pid){
    ev.stopPropagation();
    const old=document.getElementById('pdMenu');if(old){const same=old.dataset.pid===pid;old.remove();if(same)return;}
    const row=(go,t,sub)=>`<button class="pdm-i" onclick="pdMenuClose();${go}"><b>${t}</b><span>${sub}</span></button>`;
    const i=PSY_EOD().findIndex(x=>x.id===pid);
    const el=document.createElement('div');el.id='pdMenu';el.dataset.pid=pid;el.setAttribute('role','menu');
    el.innerHTML=row(`S.eodI=${Math.max(0,i)};go('#/notes')`,'Write daily note','Today\'s note for this patient')
      +row(`go('#/patient/${pid}/therapy')`,'Plan a therapy session','Therapy Plans: individual, group, family')
      +row(`psyOpenRounds('${pid}')`,'Open Rounds','Therapeutic plan and notes')
      +row(`go('#/patient/${pid}/plans')`,'Management plan','Your plan for this stay')
      +row(`pgLogAction('${pid}')`,'Log action taken','Write what was done');
    document.body.appendChild(el);
    const r=ev.currentTarget.getBoundingClientRect();
    el.style.top=Math.min(r.bottom+6,innerHeight-el.offsetHeight-12)+'px';el.style.left=Math.max(12,Math.min(r.right-el.offsetWidth,innerWidth-el.offsetWidth-12))+'px';
  };
  window.pgLogAction=function(pid){
    const p=ptFind(pid);
    V3.modal('Action taken · '+hesc(p?p.name:''),'It is saved in the patient\'s events log with your name and time.',
      `<label class="field"><span class="lbl">What you did (required)</span><textarea class="input" id="pgAt" rows="3" placeholder="e.g. Spoke to the family about the visit plan; individual session moved to 5 pm"></textarea><div id="pgAtE" class="small" style="color:var(--red);display:none">Write what you did</div></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgLogSave('${pid}')">Record action taken</button>`);
  };
  window.pgLogSave=function(pid){
    const n=(($('pgAt')||{}).value||'').trim();if(!n){$('pgAtE').style.display='block';return;}
    const w=whoAt();V3.log(pid,S.role,'note','Action taken: '+n+' · '+w.by);closeModal();render();toast('Action taken recorded by '+w.by);
  };

  /* ---------- Today: the "handed over to you" card ---------- */
  const __md=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    let h=__md.apply(this,arguments);if(!me()||typeof h!=='string')return h;
    h=richRows(h);
    try{pgHoToggle('-');}catch(e){} /* makes sure the handover list exists */
    const L=((S.pgHO||{}).list||[]).filter(x=>x.to===signer()&&!x.acceptedBy);
    if(!L.length)return h;
    const IC='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/></svg>';
    const KEYS=[['Current psychopathology','psychopath'],['Ongoing interventions','interv'],['Future directions','future']];
    return L.map(x=>{const open=x.open!==false,n=x.pids.length;
      return `<section class="hv-rc" aria-label="Handover received"><div class="hv-rc-hd"><span class="hv-rc-ic">${IC}</span><div class="t"><b>${hesc(x.from)} handed over ${n} patient${n>1?'s':''} to you</b><span>${hesc(x.reason)} · sent ${hesc(x.at)} · until you accept, ${hesc(x.from)} still sees them</span></div>
        <button class="btn sm" onclick="pgHoToggle('${x.id}')">${open?'Hide':'Show'}</button><button class="btn sm" onclick="go('#/handover')">Full notes</button><button class="btn sm pri" onclick="pgHoAccept('${x.id}')">Accept handover</button></div>
        ${open?`<div class="hv-rc-wrap"><div class="hv-rc-heads" aria-hidden="true"><span>Patient</span>${KEYS.map(k=>`<span>${k[0]}</span>`).join('')}<span></span></div><div class="hv-rc-list">${x.pids.map(pid=>{const p=ptFind(pid);if(!p)return '';let f={};try{f=pgHoNote(x,pid)||{};}catch(e){}
          const g=k=>String(Array.isArray(f[k])?f[k].join('; '):(f[k]||''));
          return `<div class="hv-rc-p"><div class="hv-rc-who"><div style="min-width:0"><b>${hesc(p.name)}</b><div class="s">${hesc([window.psyPatientLine?psyPatientLine(p):'',p.risk?'High risk':''].filter(Boolean).join(' · '))}</div>${p.dx?`<div class="hv-tags"><span class="hv-tag blue">${hesc(p.dx)}</span></div>`:''}</div></div>
            ${KEYS.map(k=>`<div class="hv-rc-m" data-l="${k[0]}">${hesc(g(k[1]))||'<span class="muted">—</span>'}</div>`).join('')}
            <button class="hv-link" onclick="go('#/patient/${pid}/overview')">Open record</button></div>`;}).join('')}</div></div>`:''}</section>`;}).join('')+h;
  };

  /* ---------- Daily notes page ---------- */
  const __vn=vNotes;
  vNotes=function(){
    const h=__vn.apply(this,arguments);if(!me()||typeof h!=='string')return h;
    const T=tpl(h),R=T.content;
    const eh=R.querySelector('.eodhd');
    if(eh){
      const t=eh.querySelector('h3');if(t&&/End of day notes/.test(t.textContent)){const w=t.closest('div');if(w&&w.parentElement===eh)w.remove();else t.remove();}
      if(!eh.querySelector('[data-back]'))eh.insertAdjacentHTML('beforeend','<button class="btn" data-back="1" onclick="go(\'#/myday\')">Back to dashboard</button>');
    }
    R.querySelectorAll('.pn-start').forEach(s=>s.remove());
    const strip=R.querySelector('#waStrip');
    const wr=[...R.querySelectorAll('section.card')].find(s=>/Written earlier today/.test((s.querySelector('h3')||{}).textContent||''));
    if(strip&&wr){strip.remove();wr.before(strip);}
    return T.innerHTML;
  };

  /* ---------- Admission: the psychiatrist's numbered steps; treatment chart, vitals, labs and capacity are view only ---------- */
  const lock=k=>{const d=Object.getOwnPropertyDescriptor(S,k);Object.defineProperty(S,k,{configurable:true,enumerable:true,get:()=> 'read',set(){}});return()=>{delete S[k];if(d)Object.defineProperty(S,k,d);};};
  const __pa=pAdmission;
  pAdmission=function(){
    if(!me())return __pa.apply(this,arguments);
    const un=[lock('wkView'),lock('capView')];let h;
    try{h=asDoctor(__pa).apply(this,arguments);}finally{un.forEach(f=>f());}
    if(typeof h!=='string')return h;
    if(S.admSec!=='workup'&&S.admSec!=='capadm')return h;
    const T=tpl(h),R=T.content,ol=R.querySelector('.adm-steps');
    R.querySelectorAll('section.card').forEach(c=>{
      if(ol&&c.contains(ol))return;
      c.querySelectorAll('.seg').forEach(s=>s.remove());
      c.querySelectorAll('input,select,textarea').forEach(i=>{i.disabled=true;});
      c.querySelectorAll('button').forEach(b=>{if(/^(Fill form|Draft with|Upload|Save|Review and sign|Collect)/.test(b.textContent.trim()))b.remove();});
      const hd=c.querySelector('.hd');
      if(hd&&!c.querySelector('.ro')&&/Admission workup|Capacity assessment/.test(hd.textContent))hd.insertAdjacentHTML('afterend','<div class="callout grey small ro" style="margin:12px 20px">View only. The psychiatrist fills this in.</div>');
    });
    return T.innerHTML;
  };

  /* ---------- Patient Experience (Preferences for admin and Grievances in one tab, like the psychiatrist) ---------- */
  const __pp=pPrefs;
  pPrefs=function(){return me()?asDoctor(__pp).apply(this,arguments):__pp.apply(this,arguments);};

  /* ---------- hover a nurse's initials (vitals, medicine chart) to see the full name ---------- */
  const NM={SR:['Sister Rekha','Nurse'],PN:['Pooja Nair','Nurse'],AK:['Anita Kumar','Nurse'],MJ:['Mary Joseph','Nurse']};
  const tip=document.createElement('div');tip.id='pg-nm-tip';
  tip.style.cssText='position:fixed;z-index:200;pointer-events:none;display:none;background:#101828;color:#fff;border-radius:10px;padding:7px 11px;font-size:12.5px;line-height:1.35;box-shadow:0 8px 24px rgba(16,24,40,.25);white-space:nowrap';
  document.body.appendChild(tip);
  document.addEventListener('mouseover',e=>{
    if(!me()){tip.style.display='none';return;}
    const el=e.target;if(!el||el.children.length||!el.closest||!el.closest('#view'))return;
    const k=(el.textContent||'').trim(),n=/^[A-Z]{2}$/.test(k)&&NM[k];
    if(!n){tip.style.display='none';return;}
    tip.innerHTML='<b>'+n[0]+'</b><div style="opacity:.75;font-size:11.5px">'+n[1]+' · initials '+k+'</div>';
    const r=el.getBoundingClientRect();tip.style.display='block';
    tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,r.left+r.width/2-tip.offsetWidth/2))+'px';
    tip.style.top=(r.top-tip.offsetHeight-8>8?r.top-tip.offsetHeight-8:r.bottom+8)+'px';
    el.style.cursor='help';
  });
  document.addEventListener('mouseout',e=>{if(e.target&&e.target.closest&&e.target.closest('#view'))tip.style.display='none';});

  /* ---------- Rounds: the psychiatrist's Rounds page; medicines, monitoring and investigations are read only ---------- */
  const __vr=vRounds;
  vRounds=function(){
    if(!me())return __vr.apply(this,arguments);
    let h;try{h=asDoctor(__vr).apply(this,arguments);}catch(e){return __vr.apply(this,arguments);}
    if(typeof h!=='string'||h.indexOf('pr-med')<0)return h;
    const T=tpl(h),R=T.content;
    const ro=(c,msg)=>{
      c.querySelectorAll('button').forEach(b=>{if(!/^(Full chart|View)/.test(b.textContent.trim()))b.remove();});
      c.querySelectorAll('input,select,textarea').forEach(x=>{x.disabled=true;});
      c.insertAdjacentHTML('afterbegin',`<div class="pg-ro"><span class="pg-ro-b">Read only</span><span>${msg}</span></div>`);
    };
    R.querySelectorAll('section.card').forEach(c=>{
      const t=((c.querySelector('h3,h4,.lbl')||{}).textContent||'').trim();
      if(c.classList.contains('pr-med')||/^Medicine/.test(t))ro(c,'Medicines are added, changed and stopped by the psychiatrist.');
      else if(/^(Monitoring|Investigations)/.test(t))ro(c,'Ordered by the psychiatrist.');
    });
    return T.innerHTML;
  };
  /* the note written on this page is the psychologist's round note */
  const __cr=confirmRound;
  confirmRound=function(){
    if(me()){const R=S.rounds;if(R&&!R.tnote&&R.scribeNote)R.tnote=R.scribeNote;}
    return __cr.apply(this,arguments);
  };

  /* the therapy brief moves under Significant events so the four groups are about the same height (fits one screen) */
  const __pi=psyInner;
  psyInner=function(){
    const h=__pi.apply(this,arguments);if(!me()||typeof h!=='string')return h;
    try{const T=tpl(h),R=T.content,q=R.querySelector('#q-brief'),b=R.querySelector('#pnS-3 .pn-body');
      if(q&&b){b.appendChild(q);return T.innerHTML;}}catch(e){}
    return h;
  };
})();
