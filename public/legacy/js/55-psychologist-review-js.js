/* Psychologist only (9 Nov 2026, evening review, Granola notes "Psychologist Portal").
   Dashboard starts from the patient names; no Capacity assessment or Reassessment tasks; Past admissions in the psychiatrist's format;
   Vitals and medicines read only in the psychiatrist's format; Orders and consents read only and only when the doctor ordered something;
   Therapy and family has the four editable sub-tabs; a Management Plan tab of the psychologist's own; Daily notes: all four questions on
   one page, "Biological Function and Routine", WhatsApp updates below the note, no "Usual day / Same as yesterday". */
(function(){
  const me=()=>S.role==='psychologist';
  const px=()=>psyPx(S.pid);
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const asDoctor=fn=>function(){const r=S.role;S.role='psychiatrist';try{return fn.apply(this,arguments);}finally{S.role=r;}};
  const css=document.createElement('style');css.id='psychologist-review-css';
  css.textContent=`
  /* daily note: the four questions on one page, small answer buttons */
  .pn-step .pn-body{display:block!important}.pn-step .pn-chev{display:none!important}.pn-step .pn-h{cursor:default;pointer-events:none}
  .pn-o{padding:4px 11px!important;font-size:12.5px!important;min-height:30px!important}
  .pn-q{margin-bottom:10px}.pn-nx{display:none!important}
  .ro9 .btn:not(.keep),.ro9 .psy-tx-actions{display:none!important}
  .ro9 .callout.ro{margin-bottom:12px}
  `;
  document.head.appendChild(css);

  let stayDone=false;
  const fixStay=()=>{if(stayDone)return;stayDone=true;
    if(!STAY.some(x=>x[0]==='plans')){const i=STAY.findIndex(x=>x[0]==='admission');STAY.splice(i+1,0,['plans','Management Plan']);}
  };

  /* ---------- no Capacity assessment / Reassessment tasks for the psychologist ---------- */
  const noCap=x=>!/capacity|re-?assess/i.test(Array.isArray(x)?String(x[0]):String(x&&(x.txt||x.title||x.name||'')));
  const __dtt=DT.tasks;
  DT.tasks=function(){const r=__dtt.apply(this,arguments);return me()&&Array.isArray(r)?r.filter(noCap):r;};
  const __di=dueItems;
  dueItems=function(){const r=__di.apply(this,arguments);return me()&&Array.isArray(r)?r.filter(noCap):r;};

  /* ---------- dashboard: the psychiatrist's design with only what the psychologist needs ---------- */
  const EYE='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  ROLE.psychologist.myday=function(){
    if(!me())return '';
    $('title').textContent='Inpatients';
    const L=PSY_EOD(),T=tasks().filter(t=>!S.done[t.id]&&t.taskType!=='alert'&&t.taskType!=='countersign');
    const rows=L.map(p=>{
      const items=(DT.tasks(p,T)||[]).filter(noCap),late=items.some(i=>i.overdue),e=((S.eod||{})[p.id]||{}),saved=!!e.saved;
      const rank=late?0:(p.risk?1:items.length?2:3);
      const sub=[(window.psyAgeSex?psyAgeSex(p):(p.age||'')+'/'+(p.sex||'')),'Day '+(p.day||0)].filter(Boolean).join(' · ');
      const edge=late?'r-amber':p.risk?'r-red':'';
      const ev=items.length?items.slice(0,3).map(i=>`<div class="pd-d"><i class="pd-dot ${i.overdue?'amber':'grey'}"></i><span>${hesc(i.txt)}${i.due?`<span class="tiny muted"> · ${hesc(i.due)}</span>`:''}</span></div>`).join('')+(items.length>3?`<div class="tiny muted" style="margin-top:4px">+${items.length-3} more</div>`:''):'<span class="tiny muted">Nothing due</span>';
      const note=saved?`<span class="chip c-green">Written${e.savedAt?' · '+hesc(e.savedAt):''}</span>`:'<span class="chip c-amber">Not written yet</span>';
      return {rank,html:`<tr class="${edge}" data-dt="${hesc((p.name+' '+(p.room||'')).toLowerCase())}">
        <td><button class="pd-who" onclick="go('#/patient/${p.id}/overview')">${av(p.ini,38,p.risk?'c-red':'c-blue')}<span><span class="pd-nm"><b>${hesc(p.name)}</b>${p.risk?'<span class="pd-tag amber">High risk</span>':''}</span><span class="pd-sub">${hesc(sub)}</span></span></button></td>
        <td>${ev}</td><td>${note}</td>
        <td><div class="pd-acts"><button class="pd-eye" aria-label="Open ${hesc(p.name)}" title="Open the record" onclick="go('#/patient/${p.id}/overview')">${EYE}</button>${saved?'':`<button class="btn sm pri" onclick="go('#/notes')">Write note</button>`}</div></td></tr>`};
    }).sort((a,b)=>a.rank-b.rank);
    const done=L.filter(p=>((S.eod||{})[p.id]||{}).saved).length;
    setTimeout(()=>{try{dtFilter();}catch(e){}},0);
    return `<div class="pd"><div class="pd-bar"><input class="input" id="dtQ" style="width:280px;min-height:40px;margin:0" placeholder="Type a name" oninput="dtFilter()" aria-label="Search patients"><div class="row" style="gap:8px"><button class="btn pri" onclick="go('#/notes')">✎ Daily notes <span class="fcount">${done}/${L.length}</span></button></div></div>
      <div style="overflow-x:auto"><table class="pd-t" style="min-width:760px"><colgroup><col style="width:260px"><col><col style="width:170px"><col style="width:200px"></colgroup>
        <thead><tr><th>Patient</th><th>Due today</th><th>Daily note</th><th></th></tr></thead>
        <tbody id="dtBody">${rows.map(r=>r.html).join('')}<tr id="dtNone" style="display:none"><td colspan="4" class="pd-empty">No patient matches</td></tr></tbody></table></div></div>`;
  };

  /* ---------- Past admissions in the psychiatrist's format ---------- */
  const __pp=pPast;
  pPast=function(){return me()?asDoctor(__pp).apply(this,arguments):__pp.apply(this,arguments);};

  /* ---------- Vitals and medicines: read only, same format as the psychiatrist ---------- */
  const __pv=pVitals;
  pVitals=function(){
    if(!me())return __pv.apply(this,arguments);
    let h;try{h=asDoctor(pOrders).apply(this,arguments);}catch(e){return __pv.apply(this,arguments);}
    if(typeof h!=='string')return __pv.apply(this,arguments);
    const t=tpl(h),R=t.content,panels=[...R.querySelectorAll('.psy-tx-panel')],tabs=[...R.querySelectorAll('.psy-tx-tab')];
    panels.forEach((p,i)=>{const tt=((p.querySelector('h3')||{}).textContent||'').trim();
      if(/^Vitals and monitoring/.test(tt)){window.psyVmRebuild&&psyVmRebuild(p);}
      else if(!/^Medicines/.test(tt)){p.remove();if(tabs[i])tabs[i].remove();}});
    const root=R.querySelector('.psy-tx-plan');if(root)root.classList.add('ro9');
    return `<div class="callout grey small ro" style="margin-bottom:12px">Read only. The doctor changes medicines and monitoring.</div>`+t.innerHTML;
  };

  /* ---------- Orders and consents: read only, only what the doctor ordered ---------- */
  const __po=pOrders;
  pOrders=function(){
    if(!me())return __po.apply(this,arguments);
    const T=window.psyTmpOrders?psyTmpOrders():{list:[],defs:{},done:()=>0},L=T.list;
    return `<section class="card"><div class="hd"><div><h3>Orders and consents</h3><div class="small muted" style="margin-top:4px">Read only. Shown when the doctor orders a treatment or asks for a consent.</div></div></div>
      ${L.length?`<div class="scroll"><table class="t"><thead><tr><th>Order</th><th>Ordered by</th><th>Date</th><th>Tasks done</th><th>Tasks</th></tr></thead><tbody>${L.map(o=>`<tr><td><b>${hesc(T.defs[o.key].t)}</b></td><td>${hesc(o.by)}</td><td>${hesc(o.at)}</td><td>${T.done(o)} of ${o.steps.length}</td><td>${o.steps.map(s=>`<div class="small">${s.done?'✓':'•'} ${hesc(s.n)} <span class="muted">· ${hesc(s.role)}</span></div>`).join('')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="pad small muted">Nothing has been ordered by the doctor.</div>'}</section>`;
  };

  /* ---------- Therapy and family: four editable sub-tabs ---------- */
  const __pt=pTherapy;
  pTherapy=function(){return me()&&window.psyTherapyPage?psyTherapyPage():__pt.apply(this,arguments);};

  /* ---------- Management Plan (the psychologist's own form) ---------- */
  const MP=[['formulation','Psychological formulation'],['goals','Goals of therapy'],['therapies','Therapies planned and how often'],['family','Family involvement'],['risk','Risks to watch for'],['review','Review date']];
  window.psychMpSet=function(k,v){const m=px().mgmtPsych=px().mgmtPsych||{};m[k]=v;};
  window.psychMpSign=function(){const m=px().mgmtPsych=px().mgmtPsych||{};if(!m.formulation||!m.goals){toast('Fill in the formulation and goals first');return;}m.signed={by:signer(),at:atNow()};render();toast('Management plan signed by '+signer());};
  const __pl=pPlans;
  pPlans=function(){
    if(!me())return __pl.apply(this,arguments);
    const m=px().mgmtPsych||{},ro=!!m.signed;
    return `<section class="card"><div class="hd"><div><h3>Management Plan · Psychologist</h3><div class="small muted" style="margin-top:4px">Your plan for therapy during this stay. The psychiatrist has a separate plan.</div></div></div>
      <div style="padding:0 20px 20px;display:flex;flex-direction:column;gap:14px">${MP.map(([k,l])=>`<label class="field"><span class="lbl" style="font-weight:700">${l}</span>${k==='review'?`<input class="input" type="date" ${ro?'disabled':''} value="${hesc(m[k]||'')}" onchange="psychMpSet('${k}',this.value)">`:`<textarea class="input" rows="2" ${ro?'readonly':''} oninput="psychMpSet('${k}',this.value)">${hesc(m[k]||'')}</textarea>`}</label>`).join('')}
      ${ro?`<div class="callout grey small">Signed by ${hesc(m.signed.by)}, ${hesc(m.signed.at)}. Locked.</div>`:`<div class="row" style="justify-content:flex-end"><button class="btn pri" onclick="psychMpSign()">Sign the plan</button></div>`}</div></section>`;
  };

  /* ---------- Daily notes: wording, no "Usual day", one page ---------- */
  const tidy=h=>{
    if(typeof h!=='string')return h;
    h=h.split('Body and routine').join('Biological Function and Routine').split('BODY AND ROUTINE').join('BIOLOGICAL FUNCTION AND ROUTINE');
    const t=tpl(h),R=t.content;let ch=true;
    R.querySelectorAll('.pn-start').forEach(s=>{
      [...s.querySelectorAll('button')].forEach(b=>{if(/Usual day|Same as yesterday/.test(b.textContent))b.remove();});
      const y=s.querySelector('.y');if(y)y.remove();const l=s.querySelector('.t');if(l)l.remove();
    });
    return t.innerHTML;
  };
  const __pd=pDaily;
  /* the patient's Daily notes tab is the psychiatrist's design (link to the all-patients page, then Earlier notes with filters, search, print) */
  pDaily=function(){return me()?tidy(asDoctor(__pd).apply(this,arguments)):__pd.apply(this,arguments);};
  /* a saved note that ticks Group therapy shows up in Therapy and family > Group Therapy by itself */
  const __sv=psySave;
  psySave=function(kind,id){
    const before=!!((S.eod||{})[id]||{}).saved,r=__sv.apply(this,arguments);
    try{if(me()&&kind!=='dn'&&!before&&((S.eod||{})[id]||{}).saved&&/Group therapy/.test(String(psyGet(kind,id,'sessions'))))psyThAuto(id);}catch(e){}
    return r;
  };
  const __vn=vNotes;
  vNotes=function(){
    const h=__vn.apply(this,arguments);if(!me()||typeof h!=='string')return h;
    const t=tidy(h),T=tpl(t),R=T.content;
    const crumb=R.querySelector('nav.crumb');if(crumb)crumb.remove();
    /* the page heading block (title, "0 of 5 written", Back to dashboard) is folded into the End of day notes row */
    const head=[...R.children].find(e=>/^Daily notes/.test((e.querySelector('h2')||{}).textContent||''));
    const back=head&&[...head.querySelectorAll('button')].find(b=>/Back to dashboard/.test(b.textContent));
    if(head)head.remove();
    const strip=R.querySelector('#waStrip');
    const eod=[...R.querySelectorAll('section.card')].find(s=>/End of day notes/.test((s.querySelector('h3')||{}).textContent||s.innerText.slice(0,30)));
    if(back&&eod){const hd=eod.querySelector('.hd');if(hd)hd.appendChild(back);}
    /* WhatsApp updates below the note, not on top */
    if(strip){strip.remove();R.appendChild(strip);}
    return T.innerHTML;
  };

  /* all four questions open at once (the step renderer only prints the open step's questions) */
  const __ps=psyStep;
  psyStep=function(kind,id,i){
    if(!me())return __ps.apply(this,arguments);
    const orig=psyOpenIdx;psyOpenIdx=()=>i;
    try{return __ps.apply(this,arguments);}finally{psyOpenIdx=orig;}
  };
  /* ---------- patient page: the new tab ---------- */
  const __vp=vPatient;
  /* Orders and consents only shows when the doctor has ordered something */
  const cutOrders=h=>{const k=h.indexOf("/orders')");if(k<0)return h;const a=h.lastIndexOf('<button',k),b=h.indexOf('</button>',k);return a<0||b<0?h:h.slice(0,a)+h.slice(b+9);};
  vPatient=function(){
    if(me())fixStay();
    let h=__vp.apply(this,arguments);
    /* Stay summary: the psychiatrist's format, with the psychologist's own tab bar */
    const hp=String(location.hash||'').split('/');
    if(me()&&typeof h==='string'&&hp[1]==='patient'&&(!hp[3]||hp[3]==='overview')){
      try{const d=asDoctor(__vp).apply(this,arguments),D=tpl(d),N=tpl(h),dn=D.content.querySelector('.subtabs'),nn=N.content.querySelector('.subtabs');if(dn&&nn){dn.replaceWith(nn.cloneNode(true));h=D.innerHTML;}}catch(e){}
    }
    if(me()&&typeof h==='string'&&!(window.psyTmpOrders&&psyTmpOrders().list.length))h=cutOrders(h);
    return h;
  };
})();
