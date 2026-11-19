/* 19 Nov 2026, meeting with Dr. Anu and Nikita (video recording, 19 Nov).
   Every login:
     1. "Registry" is gone from the left rail (asked before). New admission for real patients still reaches the registry search from its own page.
   Psychologist and floor lead psychologist only (every change is gated on the role):
     2. Inpatients > Today: the Type column and the red / amber row colours are gone (they stay for the psychiatrist); the Due today column is wider than
        Ongoing interventions.
     3. The eye opens a pop-up for that patient (what is due, each with its own action) instead of jumping to the record, like the psychiatrist's eye.
     4. Rounds > Since last round: the "Psychologist" line (it showed the psychologist's own name) shows the psychiatrist's latest round note.
        The psychiatrist's version of the line shows the psychologist's latest note. Both read the other role's saved notes, so they stay current.
     5. Rounds: the line "Assigned to you by the treating psychiatrist." under Received assessments is removed.
     6. Daily notes: every question is numbered and the questions are spaced out and moved a little to the right. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const psg=/^(psychologist|floor-lead-psychologist)$/.test(ROLE), psy=/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE);
  const E=s=>hesc(String(s==null?'':s));

  /* 1. Registry out of the rail, every role */
  if(typeof renderSide==='function'){
    const __rs=renderSide;
    renderSide=function(){const o=__rs.apply(this,arguments);try{document.querySelectorAll('#side [data-reg]').forEach(b=>b.remove());[...document.querySelectorAll('#side button,#side a')].forEach(b=>{if(/^(Patient )?Registry$/i.test((b.textContent||'').trim()))b.remove();});}catch(e){}return o;};
  }
  const css=document.createElement('style');css.id='m19-css';
  css.textContent='#side [data-reg]{display:none!important}'+
    /* 2. psychologist Today table */
    'body.psy-myday #view .pd-t th:nth-child(1),body.psy-myday #view .pd-t td:nth-child(1):not([colspan]),body.psy-myday #view .pd-t col:nth-child(1){display:none}'+
    'body.psy-myday #view .pd-t td:nth-child(2){border-left:1px solid var(--line);border-top-left-radius:16px;border-bottom-left-radius:16px;padding-left:18px;position:relative}'+
    'body.psy-myday #view .pd-t td::before,body.psy-myday #view .pd-t td:first-child::before{background:none!important;box-shadow:none!important}'+
    'body.psy-myday #view .pd-t tr.r-red td,body.psy-myday #view .pd-t tr.r-amber td{background:#fff}'+
    'body.psy-myday #view .pd-t col:nth-child(2){width:25%}body.psy-myday #view .pd-t col:nth-child(3){width:37%}body.psy-myday #view .pd-t col:nth-child(4){width:auto}body.psy-myday #view .pd-t col:nth-child(5){width:200px}'+
    'body.psy-myday #view .pd-t th:nth-child(2){width:22%!important}body.psy-myday #view .pd-t th:nth-child(3){width:27%!important}body.psy-myday #view .pd-t th:nth-child(4){width:auto!important}body.psy-myday #view .pd-t th:nth-child(5){width:190px!important}'+
    'body.psy-myday #view .pd-t td:nth-child(3) .pg-dt b{font-size:15px}'+
    /* 6. daily notes: numbered, spaced */
    'body.pgx #view .pn-main{counter-reset:pnq}body.pgx #view .pn-q{counter-increment:pnq;margin-left:12px;margin-bottom:6px}'+
    'body.pgx #view .pn-ql::before{content:counter(pnq) ". ";font-weight:800;color:#175cd3}body.pgx #view .pn-os{margin-top:8px;gap:8px}'+
    'body.pgx #view .pn-body{display:flex;flex-direction:column;gap:18px}';
  document.head.appendChild(css);

  /* 3. the eye pop-up */
  window.pgEye=function(pid){
    let p={};try{p=ptFind(pid)||{};}catch(e){}
    let items=[];try{items=(typeof window.pgDueItems==='function'?window.pgDueItems(pid):[])||[];}catch(e){}
    const act=t=>/daily note/i.test(t)?['Write daily note',`pgNoteModal('${pid}')`]
      :/24-hour family call/i.test(t)?['Call family',`faCall('${pid}','c24')`]
      :/day 3 to 4 family call/i.test(t)?['Call family',`faCall('${pid}','c34')`]
      :/management plan/i.test(t)?['Management plan',`pgMpModal('${pid}')`]
      :/therapy session/i.test(t)?['Plan a therapy session',`pgTherapyModal('${pid}')`]
      :/detailed history|capacity|admission workup/i.test(t)?['Open the record',`go('#/patient/${pid}/overview')`]
      :['Log action taken',`pgLogAction('${pid}')`];
    const sub=[window.psyPatientLine?psyPatientLine(p):'',p.room?'Room '+p.room:'',p.dx||''].filter(Boolean).join(' · ');
    const body=`<div class="pd-det">${items.length?items.map(i=>{const a=act(String(i.txt||''));return `<div class="pd-di"><div class="pd-dh"><span class="pd-chip ${i.cat==='Critical'?'red':'grey'}">${E(i.cat)}</span></div><div class="pd-dt">${E(i.txt)}${i.due?` <span class="tiny muted">· ${E(i.due)}</span>`:''}</div><div class="row" style="justify-content:flex-end"><button class="btn sm pri" onclick="closeModal();${a[1]}">${a[0]}</button></div></div>`;}).join(''):'<div class="small muted">Nothing is due for this patient.</div>'}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sm" onclick="closeModal();pgNoteModal('${pid}')">Write daily note</button><button class="btn sm" onclick="closeModal();pgTherapyModal('${pid}')">Plan a therapy session</button><button class="btn sm" onclick="closeModal();pgMpModal('${pid}')">Management plan</button><button class="btn sm" onclick="closeModal();psyOpenRounds('${pid}')">Open Rounds</button></div>`;
    V3.modal(E(p.name||'Patient'),E(sub||'What is due for this patient'),body,`<button class="btn" onclick="closeModal()">Close</button><button class="btn" onclick="closeModal();go('#/patient/${pid}/overview')">Open full record</button>`);
  };
  /* Due today comes second, straight after Patient (Type is hidden, so the 4th cell moves before the 3rd) */
  function reorder(){
    const t=document.querySelector('#view table.pd-t');if(!t)return;
    const hr=t.querySelector('thead tr');if(!hr||hr.children.length<5)return;
    if(/^Due today/i.test((hr.children[3].textContent||'').trim())){
      const mv=p=>{if(p&&p.children.length>=5)p.insertBefore(p.children[3],p.children[2]);};
      mv(hr);t.querySelectorAll('tbody tr[data-dt]').forEach(mv);mv(t.querySelector('colgroup'));
    }
    /* widths on the header cells themselves (the table is fixed layout): Patient 24%, Due today 36%, Ongoing interventions the rest, buttons 190px */
    ['','22%','27%','auto','190px'].forEach((w,i)=>{const th=hr.children[i];if(th&&w)th.style.setProperty('width',w,'important');});
    t.querySelectorAll('colgroup col').forEach((c,i)=>{const w=['','22%','27%','auto','190px'][i];if(w)c.style.setProperty('width',w,'important');});
  }
  function eyes(){
    document.querySelectorAll('#view .pd-eye').forEach(b=>{
      const m=(b.getAttribute('onclick')||'').match(/#\/patient\/([^\/']+)\//);if(!m||b.dataset.pe)return;
      b.dataset.pe='1';b.setAttribute('onclick',`pgEye('${m[1]}')`);b.title='View details';b.setAttribute('aria-label','View details');});
  }

  /* 4 + 5. Rounds: the other role's latest note, and the removed sub-line */
  const dnList=pid=>{try{return JSON.parse(ptRun(pid,()=>JSON.stringify((S.dnHist||(typeof DN_HIST!=='undefined'?DN_HIST:[])||[]).map(n=>({type:n.type,by:n.by,role:n.role,sum:n.sum,secs:n.secs,signed:n.signed,d:n.d,my:n.my})))))||[];}catch(e){return [];}};
  const noteText=n=>{const s=(n.secs||[]).map(x=>Array.isArray(x)?x[1]:'').filter(Boolean).join(' · ');return String(s||n.sum||'').trim();};
  const clip=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t;
  function psychiatristNote(pid){
    try{const rl=((window.psyPx?psyPx(pid):{}).roundLog||[])[0];if(rl&&(rl.note||(rl.changes||[]).length))return {by:rl.by,at:rl.at,text:rl.note||(rl.changes||[]).map(c=>c.t+': '+c.d).join('; ')};}catch(e){}
    const n=dnList(pid).find(x=>x.type==='Round note'||/psychiatr/i.test(x.role||''));return n?{by:n.by,at:n.signed||((n.d||'')+' '+(n.my||'')).trim(),text:noteText(n)}:null;
  }
  function psychologistNote(pid){
    const n=dnList(pid).find(x=>/psycholog/i.test((x.role||'')+' '+(x.by||'')));
    if(n)return {by:n.by,at:n.signed||((n.d||'')+' '+(n.my||'')).trim(),text:noteText(n)};
    return null;
  }
  function rounds(){
    if(!/^#\/rounds/.test(location.hash||''))return;
    document.querySelectorAll('#view *').forEach(e=>{if(!e.children.length&&/^Assigned to you by the treating psychiatrist\.?$/.test((e.textContent||'').trim()))e.remove();});
    const lines=[...document.querySelectorAll('#view .pr-lines > div')].find(d=>/^Psychologist/.test((d.textContent||'').trim())||(d.dataset&&d.dataset.m19));
    if(!lines)return;
    let pid='';try{const R=S.rounds;pid=(WARDS[R.ward][R.idx[R.ward]]||{}).id||'';}catch(e){}
    if(!pid)return;
    const team=(()=>{try{return ptCtxOf(pid).team||{};}catch(e){return {};}})();
    if(psg){
      const n=psychiatristNote(pid);
      lines.dataset.m19='1';
      lines.innerHTML='<b>Psychiatrist</b>'+E(team.psy||'')+(n&&n.text?' · "'+E(clip(n.text,260))+'"'+(n.at?' <span class="tiny muted">('+E(n.by||'')+(n.by&&n.at?', ':'')+E(n.at)+')</span>':''):' · <span class="muted">no round note yet</span>');
    }else if(psy){
      const n=psychologistNote(pid);
      lines.dataset.m19='1';
      lines.innerHTML='<b>Psychologist</b>'+E(team.psych||'None assigned')+(n&&n.text?' · "'+E(clip(n.text,260))+'"'+(n.at?' <span class="tiny muted">('+E(n.by||'')+(n.by&&n.at?', ':'')+E(n.at)+')</span>':''):' · <span class="muted">no note yet</span>');
    }
  }

  function paint(){
    if(psg){
      document.body.classList.add('pgx');
      document.body.classList.toggle('psy-myday',/^#\/myday/.test(location.hash||''));
      if(/^#\/myday/.test(location.hash||'')){reorder();eyes();}
    }
    if(psg||psy)rounds();
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){}setTimeout(()=>{try{paint();}catch(e){}},250);return o;};
  try{paint();}catch(e){}
})();
