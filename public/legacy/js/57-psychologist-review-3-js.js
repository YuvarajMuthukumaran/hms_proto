/* Psychologist only (10 Nov 2026, team meeting with Anu: first batch).
   1. Today: three tabs, My patients, Ward patients, All patients (the same table, more rows).
   2. Take Action opens pop-ups for that one patient (daily note, therapy session, management plan, action taken) instead of going to another page.
   3. Management Plan: therapy plan free text, planned assessments and planned behavioural activations; a read view once it is signed.
   4. Rounds: the Medicines, Monitoring and Investigations boxes are not shown to the psychologist (the therapy plan sits in the Rounds page).
   Every change is gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const px=()=>psyPx(S.pid);

  /* ---------- 1. My patients / Ward patients / All patients ---------- */
  const SCOPES=[['my','My patients',[0]],['ward','Ward patients',[0,5]],['all','All patients',[0,5,10,11]]];
  window.pgScope=function(s){S.pgScope=s;render();};
  const rowsFor=(fn,rot,args,self)=>{
    const orig=PTS.slice();
    try{
      if(rot)PTS.push(...PTS.splice(0,rot));
      return fn.apply(self,args);
    }finally{PTS.splice(0,PTS.length,...orig);}
  };
  const __md=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    const h=__md.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    const sc=SCOPES.find(x=>x[0]===S.pgScope)||SCOPES[0];
    let out=h;
    if(sc[2].length>1){
      try{
        const T=tpl(h),tb=T.content.querySelector('#dtBody');
        if(tb){
          const seen=new Set([...tb.querySelectorAll('tr[data-dt]')].map(r=>r.dataset.dt));
          const none=tb.querySelector('#dtNone');
          sc[2].slice(1).forEach(rot=>{
            const x=rowsFor(__md,rot,arguments,this);
            const X=tpl(typeof x==='string'?x:'').content;
            X.querySelectorAll('#dtBody tr[data-dt]').forEach(r=>{
              if(seen.has(r.dataset.dt))return;seen.add(r.dataset.dt);
              tb.insertBefore(document.importNode(r,true),none);
            });
          });
          out=T.innerHTML;
        }
      }catch(e){out=h;}
    }
    const tabs=`<div class="pg-scope" role="tablist" aria-label="Which patients">${SCOPES.map(x=>`<button role="tab" aria-selected="${x[0]===sc[0]}" class="${x[0]===sc[0]?'on':''}" onclick="pgScope('${x[0]}')">${x[1]}</button>`).join('')}</div>`;
    const i=out.indexOf('<div class="pd">');
    return i<0?tabs+out:out.slice(0,i)+tabs+out.slice(i);
  };
  const css=document.createElement('style');css.id='psychologist-review-3-css';
  css.textContent=`
  .pg-scope{display:inline-flex;gap:4px;padding:4px;margin:0 0 12px;background:#f2f4f7;border-radius:12px}
  .pg-scope button{border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:#475467;padding:7px 16px;border-radius:9px;cursor:pointer}
  .pg-scope button.on{background:#fff;color:#175cd3;box-shadow:0 1px 2px rgba(16,24,40,.12)}
  .pg-mp-chips{display:flex;flex-wrap:wrap;gap:8px}
  .pg-mp-chips label{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:99px;padding:5px 12px;font-size:13.5px;cursor:pointer;background:#fff}
  .pg-mp-chips label:has(input:checked){background:#eff8ff;border-color:#84caff;color:#175cd3;font-weight:600}
  .pg-mp-chips input{accent-color:#175cd3}
  .pg-mp-read dt{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#667085;margin-top:14px}
  .pg-mp-read dd{margin:4px 0 0;font-size:15px;white-space:pre-wrap}
  `;
  document.head.appendChild(css);

  /* ---------- 2. Take Action: pop-ups for that patient ---------- */
  const nm=pid=>{const p=ptFind(pid);return p?p.name:'';};
  window.pgNoteModal=function(pid){
    V3.modal('Daily note · '+hesc(nm(pid)),'Written for this patient only. It is saved in the events log with your name and time.',
      `<label class="field"><span class="lbl">Today's note</span><textarea class="input" id="pgDn" rows="5" placeholder="Mood and behaviour, sleep and routine, therapy done today, anything the team should know"></textarea><div id="pgDnE" class="small" style="color:var(--red);display:none">Write the note first</div></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgNoteSave('${pid}')">Save note</button>`);
  };
  window.pgNoteSave=function(pid){
    const n=(($('pgDn')||{}).value||'').trim();if(!n){$('pgDnE').style.display='block';return;}
    const w=whoAt();V3.log(pid,S.role,'note','Daily note: '+n+' · '+w.by);closeModal();render();toast('Daily note saved by '+w.by);
  };
  window.pgTherapyModal=function(pid){S.pid=pid;psyThAdd('ind');};

  /* the Management Plan form is shared by the page and the pop-up */
  const MODS=['PHQ-9 (depression)','GAD-7 (anxiety)','BDI-II','BAI','Y-BOCS (OCD)','HAM-D','HAM-A','PANSS','MoCA','MMSE','Rosenberg self-esteem','WHO-5 well-being'];
  const ACTS=['Take a walk','Join group yoga','Music or art','Gardening','Plan an outing','Keep a daily activity diary','Fixed sleep routine','Call a family member'];
  window.pgMpLists={MODS,ACTS};
  const FIELDS=[['therapyPlan','Therapy plan','area','Therapies planned, how many sessions and how often, and anything new that came up'],['formulation','Psychological formulation','area'],['goals','Goals of therapy','area'],['family','Family involvement','area'],['risk','Risks to watch for','area'],['assess','Planned assessments','pick',MODS],['acts','Planned behavioural activations','pick',ACTS],['review','Review date','date']];
  window.psychMpTog=function(k,v,on){const m=px().mgmtPsych=px().mgmtPsych||{};const a=m[k]=m[k]||[];const i=a.indexOf(v);if(on&&i<0)a.push(v);if(!on&&i>=0)a.splice(i,1);};
  window.psychMpSign=function(){
    const m=px().mgmtPsych=px().mgmtPsych||{};
    if(!m.goals||!(m.therapyPlan||m.therapies)){toast('Fill in the therapy plan and goals first');return false;}
    m.signed={by:signer(),at:atNow()};render();toast('Management plan signed by '+signer());return true;
  };
  const mpForm=m=>`<div class="row" style="justify-content:flex-end"><button class="btn sm" onclick="pgMpAi()">Draft with AI (speak, then review)</button></div>`+FIELDS.map(([k,l,ty,opt])=>{
    if(ty==='pick'){const a=m[k]||[];return `<div class="field"><span class="lbl" style="font-weight:700">${l}</span><div class="pg-mp-chips">${opt.map(o=>`<label><input type="checkbox" ${a.includes(o)?'checked':''} onchange="psychMpTog('${k}',this.dataset.v,this.checked)" data-v="${hesc(o)}">${hesc(o)}</label>`).join('')}</div></div>`;}
    return `<label class="field"><span class="lbl" style="font-weight:700">${l}</span>${ty==='date'?`<input class="input" type="date" value="${hesc(m[k]||'')}" onchange="psychMpSet('${k}',this.value)">`:`<textarea class="input" rows="${k==='therapyPlan'?4:2}" placeholder="${hesc(opt||'')}" oninput="psychMpSet('${k}',this.value)">${hesc(m[k]||'')}</textarea>`}</label>`;
  }).join('');
  const mpRead=m=>`<dl class="pg-mp-read" style="margin:0">${FIELDS.map(([k,l,ty])=>{
    let v=m[k];if(Array.isArray(v))v=v.join(', ');
    if(!v&&k==='therapyPlan')v=[m.therapies].filter(Boolean).join('');
    return `<dt>${l}</dt><dd>${v?hesc(v):'<span class="muted">Not recorded</span>'}</dd>`;}).join('')}</dl>
    <div class="callout grey small" style="margin-top:16px">Signed by ${hesc(m.signed.by)}, ${hesc(m.signed.at)}. The plan is done once for the whole admission.</div>`;
  window.pgMpAi=function(){
    if(typeof scribeForm!=='function'){toast('The AI scribe is not available');return;}
    const pid=S.pid;
    scribeForm({title:'Management plan · '+nm(pid),form:'Psychologist management plan',context:nm(pid)+', inpatient at a psychiatric hospital',
      fields:[{key:'therapyPlan',label:'Therapy plan: therapies planned, number of sessions and how often',type:'text'},{key:'formulation',label:'Psychological formulation',type:'text'},{key:'goals',label:'Goals of therapy',type:'text'},{key:'family',label:'Family involvement',type:'text'},{key:'risk',label:'Risks to watch for',type:'text'},{key:'assess',label:'Planned assessments',type:'many',options:MODS},{key:'acts',label:'Planned behavioural activations',type:'many',options:ACTS}],
      apply:v=>{const m=px().mgmtPsych=px().mgmtPsych||{};Object.keys(v).forEach(k=>{const x=v[k];if(Array.isArray(x)?x.length:String(x||'').trim())m[k]=x;});if(S.pgMpModal)pgMpModal(pid);else render();},
      cancel:()=>{if(S.pgMpModal)pgMpModal(pid);}});
  };
  window.pgMpModal=function(pid){
    S.pid=pid;S.pgMpModal=true;const m=px().mgmtPsych||{};
    if(m.signed){V3.modal('Management plan · '+hesc(nm(pid)),'Read view',mpRead(m),`<button class="btn" onclick="closeModal()">Close</button>`);return;}
    V3.modal('Management plan · '+hesc(nm(pid)),'Done once when the patient is admitted. Save as a draft or sign it.',
      `<div style="display:flex;flex-direction:column;gap:14px;max-height:60vh;overflow:auto;padding-right:6px">${mpForm(m)}</div>`,
      `<button class="btn" onclick="closeModal()">Save draft and close</button><button class="btn pri" onclick="if(psychMpSign())closeModal()">Sign the plan</button>`);
  };
  window.pgMenu=function(ev,pid){
    ev.stopPropagation();
    const old=document.getElementById('pdMenu');if(old){const same=old.dataset.pid===pid;old.remove();if(same)return;}
    const row=(go,t,sub)=>`<button class="pdm-i" onclick="pdMenuClose();${go}"><b>${t}</b><span>${sub}</span></button>`;
    const el=document.createElement('div');el.id='pdMenu';el.dataset.pid=pid;el.setAttribute('role','menu');
    el.innerHTML=row(`pgNoteModal('${pid}')`,'Write daily note','Pop-up for this patient')
      +row(`pgTherapyModal('${pid}')`,'Plan a therapy session','Pop-up: modality, minutes, plan')
      +row(`pgMpModal('${pid}')`,'Management plan','Pop-up: view or fill in')
      +row(`psyOpenRounds('${pid}')`,'Open Rounds','Therapeutic plan and notes')
      +row(`pgLogAction('${pid}')`,'Log action taken','Write what was done');
    document.body.appendChild(el);
    const r=ev.currentTarget.getBoundingClientRect();
    el.style.top=Math.min(r.bottom+6,innerHeight-el.offsetHeight-12)+'px';el.style.left=Math.max(12,Math.min(r.right-el.offsetWidth,innerWidth-el.offsetWidth-12))+'px';
  };

  /* ---------- 3. Management Plan tab: form, then a read view once signed ---------- */
  const __pl=pPlans;
  pPlans=function(){
    if(!me())return __pl.apply(this,arguments);
    S.pgMpModal=false;const m=px().mgmtPsych||{};
    if(m.signed)return `<section class="card"><div class="hd"><div><h3>Management Plan · Psychologist</h3><div class="small muted" style="margin-top:4px">Read view. Your plan for therapy during this stay.</div></div></div><div style="padding:0 20px 20px">${mpRead(m)}</div></section>`;
    return `<section class="card"><div class="hd"><div><h3>Management Plan · Psychologist</h3><div class="small muted" style="margin-top:4px">Done once when the patient is admitted. After you sign it, this page shows the plan as a read view.</div></div></div>
      <div style="padding:0 20px 20px;display:flex;flex-direction:column;gap:14px">${mpForm(m)}<div class="row" style="justify-content:flex-end"><button class="btn pri" onclick="psychMpSign()">Sign the plan</button></div></div></section>`;
  };

  /* ---------- 4. Rounds: no Medicines, Monitoring or Investigations boxes for the psychologist ---------- */
  const __vr=vRounds;
  vRounds=function(){
    const h=__vr.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content;
      R.querySelectorAll('section.card').forEach(c=>{
        const t=((c.querySelector('h3,h4,.lbl')||{}).textContent||'').trim();
        if(c.classList.contains('pr-med')||/^(Medicine|Monitoring|Investigations|Referral|Risks and instructions)/.test(t))c.remove();
      });
      return T.innerHTML;
    }catch(e){return h;}
  };
})();
