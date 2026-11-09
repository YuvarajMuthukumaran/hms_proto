
/* Psychiatrist only (5 Nov 2026). UPDATED 9 Nov: the handover page follows the team's redesign (one line per patient, flagged patients first, received card on Today); see "Handover v2" below. The 10-field record view (FIELDS, notePage) is kept for From the record and Transfer patient. The older SBAR text below is kept for history.
   Trello "Handover between doctors and shifts": a Handover view under Inpatients (sidebar rail). Each patient has an SBAR summary built
   from the record: Situation (diagnosis, day, Section, observation, risk), Background (history in two lines, medicines), Assessment
   (last round note, open alerts, unreviewed events, results to review), Recommendation (pending tasks plus 1 to 2 lines from the doctor
   on what to watch tonight). Used for night duty, leave and Transfer patient (the transfer window opens the summary). The receiving
   doctor presses "Accept handover"; it is logged with name and time, and until then the sending doctor still sees the patients.
   The psychologist handover is not built here (psychiatrist only).
   Trello "Please add a card to upload documents in Patient > history > admission": an Admission documents card on the Admission tab:
   pick the document type, upload one or more files; name, type, size, who and when are saved with the record. The files themselves stay
   in this browser until document storage is connected. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-handover-css';
  css.textContent=`
  .ho{max-width:none;margin:0;display:flex;flex-direction:column;gap:16px}
  .ho-p{border-top:1px solid var(--line-2);padding:14px 20px}.ho-p:first-child{border-top:0}
  .hn-wrap{display:grid;grid-template-columns:230px minmax(0,1fr);gap:16px;padding:0 16px 16px;align-items:start}
  .hn-list{display:flex;flex-direction:column;gap:6px;position:sticky;top:88px}
  .hn-pt{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:#fff;cursor:pointer;font-size:13px}
  .hn-pt.on{background:var(--blue-tint);border-color:#bcd4fa}.hn-pt b{display:block}.hn-pt input{flex:0 0 auto}
  .hn-st{margin-left:auto;font-size:11px;font-weight:700;white-space:nowrap;color:#067647}.hn-st.add{color:#b54708}.hn-st.off{color:var(--muted);font-weight:500}
  .hn-page{margin:0}.hn-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:14px 20px 4px}
  .hn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px;padding:8px 20px 4px}
  .hn-f{min-width:0;grid-column:1/-1}.hn-f.half{grid-column:auto}
  .hn-f .lbl{display:flex;align-items:center;gap:8px;margin-bottom:4px;font-weight:700;color:var(--ink,#172033)}.hn-f textarea{width:100%;resize:vertical}
  .hn-tag{font-size:10.5px;font-weight:700;text-transform:none;letter-spacing:0}.hn-tag.add{color:#b54708}.hn-tag.rec{color:var(--blue-ink)}
  .hn-ro{font-size:13.5px;line-height:1.5;background:var(--soft);border-radius:10px;padding:8px 12px;min-height:34px}
  .hn-groups{display:flex;flex-direction:column;gap:9px;padding:8px 20px 4px}
  .hn-group{border:1px solid var(--line-2);border-radius:12px;background:#fff;overflow:hidden}
  .hn-group>summary{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;list-style:none;font-weight:700;color:var(--ink,#172033)}
  .hn-group>summary::-webkit-details-marker{display:none}.hn-group>summary:before{content:'›';font-size:20px;line-height:14px;color:var(--muted);transform:rotate(0);transition:transform .15s}
  .hn-group[open]>summary:before{transform:rotate(90deg)}
  .hn-group-count{margin-left:auto;font-size:11px;font-weight:600;color:var(--muted)}
  .hn-group-content{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px;padding:2px 14px 14px;border-top:1px solid var(--line-2)}
  .hn-sign{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px;margin:14px 20px 16px;padding-top:12px;border-top:1px solid var(--line-2)}
  .hn-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.hn-tabs button{border:1px solid var(--line);background:#fff;border-radius:99px;padding:4px 12px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}.hn-tabs button.on{background:var(--blue-tint);border-color:var(--blue);color:var(--blue-ink)}
  @media (max-width:900px){.hn-wrap{grid-template-columns:1fr}.hn-list{position:static}.hn-grid,.hn-group-content,.hn-sign{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  const today=()=>new Date().toDateString();
  const px=pid=>(window.psyPx?psyPx(pid):(ptCtxOf(pid).psyx=ptCtxOf(pid).psyx||{}));
  /* handovers live at the top level of the state (they are about the doctor, not one patient) */
  function store(){
    if(!S.psyHO)S.psyHO={list:[{id:'ho0',from:'Dr. Rohan Mehta',to:'Dr. Aanya Sharma',reason:'On leave 10 to 12 Nov',at:'3 Nov 2026, 6:10 pm',pids:['sameer','dev','kabir','arjun','rohit','varun'],rec:{sameer:'Watch sleep tonight. Call the RMO if he refuses food.',dev:'Cravings at night. Clonidine SOS if restless.'},lines:{sameer:{watch:'Watch sleep tonight. Call the RMO if he refuses food.',psychopath:'Watch sleep tonight. Call the RMO if he refuses food.',trials:'Sertraline stopped for nausea; fluoxetine is helping.',plan:'Capacity assessment week 2 due. Continue fluoxetine 40 mg.',future:'Capacity assessment week 2 due. Continue fluoxetine 40 mg.',rec:'Obsessive-compulsive disorder · Fluoxetine 40 mg · Clonazepam 0.5 mg · Last round 22 Oct',tags:[['Routine','amber']]},dev:{watch:'Cravings at night. Clonidine SOS if restless.',psychopath:'Cravings at night. Clonidine SOS if restless.',trials:'Methadone earlier, relapsed; buprenorphine is stable.',plan:'Sign the discharge summary. Family pickup Thursday 11 am.',future:'Sign the discharge summary. Family pickup Thursday 11 am.',rec:'Opioid dependence · Buprenorphine 2 mg, Clonidine 0.1 mg · Last round 22 Oct',tags:[['Discharge planned','blue']]},kabir:{psychopath:'Hearing voices less often; still suspicious at night.',trials:'Risperidone, partial response; clozapine started 3 weeks ago.',future:'WBC and neutrophil count due. Continue clozapine titration.',rec:'Schizophrenia · Clozapine · Last round 22 Oct',tags:[['Result to review','amber']]},arjun:{psychopath:'Low mood improving, sleeping 6 hours, no self-harm thoughts.',trials:'Sertraline stopped for nausea; escitalopram started.',future:'Review the dose in 1 week. Start therapy sessions.',rec:'Severe depressive episode · Escitalopram 10 mg · Last round 22 Oct',tags:[['NSAIDs allergy','red']]},rohit:{psychopath:'Admitted today, anxious, poor sleep.',trials:'Short lorazepam courses earlier, little benefit.',future:'Complete the admission workup. Capacity assessment on day 3.',rec:'Admitted today · Lorazepam 1 mg SOS',tags:[['New admission','blue']]},varun:{psychopath:'Tremor easing, cravings at night.',trials:'Naltrexone was not tolerated earlier.',future:'Chlordiazepoxide taper, thiamine. Family session on Friday.',rec:'Alcohol dependence, withdrawal · Last round 22 Oct',tags:[['Withdrawal','amber']]}},status:'sent'}],ui:{to:'',reason:'Going on leave / Transfer',watch:{}}};
    return S.psyHO;
  }
  /* Ten existing demo inpatients for the handover layout review; other role lists stay as they are. */
  const handoverPatients=()=>allPts().slice(0,10);
  /* ---- Anu's handover format (draft "patient care 1 jan edited", psychiatrist page): ONE PAGE PER PATIENT.
     Whatever the system already knows is filled in; the doctor adds only what is missing (differential diagnosis, comorbidity, the reason for each
     medicine, future directions, what was said to the family). Entries are kept as you type (no Save button). The sending doctor's name is the
     signature of "Handover given by"; the receiving doctor signs by pressing Accept. ---- */
  const FIELDS=[
    ['dx','Provisional diagnosis','line'],
    ['ddx','Differential diagnosis','line'],
    ['comorb','Medical / surgical comorbidity','area'],
    ['psychopath','Current psychopathology','area'],
    ['monitor','Ongoing regular monitoring, medical or surgical intervention planned','area'],
    ['past','Past treatment (trials and response)','area'],
    ['allergy','Any drug allergy or side effects in the past','area'],
    ['treatment','Current treatment with rationale','area'],
    ['future','Future directions of the treatment plan','area'],
    ['comm','Communication to family and patient (combined session of both psychiatrists)','area']
  ];
  const pendingTasks=(p,T)=>T.filter(t=>String(t.title||'').replace(/<[^>]+>/g,'').includes(p.name)).map(t=>String(t.title).replace(/<[^>]+>/g,'').replace(p.name,'').replace(/^[\s·]+|[\s·]+$/g,''));
  /* what the record already says, per field */
  function auto(pid){
    const p=ptFind(pid);if(!p)return null;
    const c=ptCtxOf(pid),x=px(pid),T=tasks(),L=a=>a.filter(Boolean).join('\n'),HR=typeof HREAD!=='undefined'?HREAD:[];
    const meds=(c.meds||[]).filter(m=>!String(m.name).includes('waiting')).map(m=>m.name+' · '+m.freq);
    const notes=c.dnHist||[],round=notes.find(h=>h.type==='Round note')||notes[0];
    const lvl=x.riskLevel||(p.risk?'High':'Low'),tags=(x.riskTags||[]).join(', ');
    const hr=re=>{const r=pid==='neel'?HR.find(a=>re.test(a[0])):null;return r?String(r[1]):'';};
    const pa=c.pastAdm||[],rc=x.recon||{};
    const past=L([hr(/^Treatment history/i)||pa.map(a=>'Admission '+a.n+' ('+a.dates+'): medicines at discharge '+(a.meds||[]).join(', ')+'. '+(a.cond||'')).join('\n'),
      (rc.adm||[]).length?'Before this admission: '+rc.adm.map(m=>m.name+(m.dec?' ('+m.dec+')':'')).join(', '):'']);
    const al=x.allergy;
    let mon=[];try{mon=monList(pid).map(m=>m[0]+': '+monLabel(m[1]));}catch(e){}
    const refs=(S.referrals||[]).filter(r=>r.pid===pid&&!S.done[r.id]).map(r=>'Referral: '+r.why+(refOut(r)?' ('+r.to+')':' (RMO)'));
    const labs=v3().labs.filter(l=>l.pid===pid&&!l.rev).length,tk=pendingTasks(p,T);
    return {p,f:{
      dx:p.dx||c.dx||'',ddx:'',
      comorb:hr(/^Past history/i),
      psychopath:L([round?round.sum:'','Risk of harm: '+lvl+(tags?' ('+tags+')':'')+'.']),
      monitor:L(mon.concat(refs,labs?[labs+' lab result'+(labs>1?'s':'')+' to review']:[])),
      past,
      allergy:al?((al.list&&al.list.length)?al.list.map(i=>i.drug+(i.rx?' ('+i.rx+')':'')).join(', '):'No known drug allergies'):'Not recorded yet',
      treatment:meds.join('\n'),
      future:tk.length?'Pending: '+tk.slice(0,4).join('; '):'',
      comm:''}};
  }
  const uiN=()=>{const u=store().ui;u.notes=u.notes||{};return u.notes;};
  const valOf=(pid,k)=>{const e=uiN()[pid];return e&&e[k]!==undefined?e[k]:((auto(pid)||{f:{}}).f[k]||'');};
  const snap=pid=>{const o={};FIELDS.forEach(([k])=>{o[k]=valOf(pid,k);});return o;};
  /* the note a sent handover carries: the snapshot taken when it was sent (the sample handover builds one from the record) */
  const noteFor=(h,pid)=>{if(h.notes&&h.notes[pid])return h.notes[pid];const a=auto(pid),f=Object.assign({},a?a.f:{});if(h.rec&&h.rec[pid])f.future=h.rec[pid];return f;};
  const nl2br=t=>hesc(t||'').replace(/\n/g,'<br>');

  /* one patient's page, editable (ro false) or read only */
  function notePage(pid,vals,ro,o){
    o=o||{};const p=ptFind(pid),a=auto(pid)||{f:{}};
    const tag=(k,v)=>{if(ro)return '';if(!String(v||'').trim())return '<span class="hn-tag add">To add</span>';return v===(a.f[k]||'')?'<span class="hn-tag rec">From the record</span>':'';};
    const fld=([k,label,ty])=>{
      const v=vals[k]||'';
      const body=ro?`<div class="hn-ro">${v.trim()?nl2br(v):'<span class="muted">Nothing written</span>'}</div>`
        :(ty==='line'?`<input class="input" value="${hesc(v)}" oninput="psyHnSet('${pid}','${k}',this.value)">`
        :`<textarea class="input" rows="${Math.max(2,Math.min(7,String(v).split('\n').length+1))}" ${k==='treatment'?'placeholder="Add the reason for each medicine"':k==='future'||k==='comm'?'placeholder="Write here"':''} oninput="psyHnSet('${pid}','${k}',this.value)">${hesc(v)}</textarea>`);
      return `<div class="hn-f ${ty==='line'?'half':''}"><div class="lbl">${hesc(label)} ${tag(k,v)}</div>${body}</div>`;
    };
    const sig=`<div class="hn-sign"><div><div class="lbl">Handover given by</div><div style="font-weight:600">${hesc(o.from||signer())}</div><div class="tiny muted">${hesc(o.at?'Signed '+o.at:'Signed when you send it')}</div></div>
      <div><div class="lbl">Handed over to</div><div style="font-weight:600">${hesc(o.to||store().ui.to||'Choose the doctor above')}</div><div class="tiny muted">${hesc(o.accepted?'Signed '+o.accepted:'Signs by accepting it')}</div></div></div>`;
    const groups=[
      ['Diagnosis and history',['dx','ddx','comorb','past']],
      ['Current clinical picture',['psychopath','monitor','allergy']],
      ['Treatment and next steps',['treatment','future','comm']]
    ];
    const content=groups.map(([title,keys],i)=>`<details class="hn-group" ${ro||i===0?'open':''}><summary>${title}<span class="hn-group-count">${keys.length} fields</span></summary><div class="hn-group-content">${keys.map(k=>fld(FIELDS.find(f=>f[0]===k))).join('')}</div></details>`).join('');
    return `<section class="card hn-page"><div class="hn-head"><div><h3>${hesc(p.name)}</h3><div class="small muted">${hesc([window.psyPatientLine?psyPatientLine(p):'',p.uhid?'UHID '+p.uhid:''].filter(Boolean).join(' · '))} · Handover notes for Psychiatrist</div></div>${o.pdf||''}</div>
      <div class="hn-groups">${content}</div>${sig}</section>`;
  }
  /* ======================= Handover v2 (9 Nov 2026, from the team's design "Handover redesign · Psychiatrist HMS") =======================
     Giving doctor: "Hand over my patients". One line per patient. Diagnosis, medicines and open items come from the record (grey line);
     the doctor writes only what to watch. Patients that need attention come first and must have a line before Send works; routine patients
     go as they are. Receiving doctor: a "handed over to you" card at the top of the Today page (and on this page) with Accept handover. */
  const shortAt=s=>String(s||'').replace(/\s20\d\d,/,',');
  const medName=m=>String(m.name||'').replace(/\s*\(.*$/,'');
  const liveMeds=c=>(c.meds||[]).filter(m=>!String(m.name).includes('waiting'));
  const lastRound=c=>{const r=(c.dnHist||[]).find(h=>h.type==='Round note');return r?'Last round '+r.d+' '+String(r.my||'').split(' ')[0]:'';};

  /* tags under the name; "flag" means the patient needs a line before the handover can be sent */
  function tagsOf(pid){
    const p=ptFind(pid),c=ptCtxOf(pid),x=px(pid),t=[];let flag=false;
    const add=(txt,cls,f)=>{t.push([txt,cls]);if(f)flag=true;};
    const obs=c.obs||(EX[pid]||[])[0]||'Routine';
    if(/^1:1/.test(obs))add('1:1 observation','red',true);else if(/15/.test(obs))add('Every 15 min','amber',true);
    if((x.riskLevel||(p.risk?'High':'Low'))==='High')add('High risk','amber',true);
    let cs=false;try{cs=tasks().some(k=>k.taskType==='countersign'&&String(k.title||'').replace(/<[^>]+>/g,'').includes(p.name));}catch(e){}
    if(cs)add('To countersign','blue',true);
    const al=v3().alerts.filter(a=>a.pid===pid&&!a.closed);
    if(al.length)add(al[0].src==='Vitals'?'Vitals alert':'Open alert','red',true);
    if(/withdrawal/i.test(p.dx||''))add('Withdrawal','amber',false);
    if(v3().labs.some(l=>l.pid===pid&&!l.rev))add('Result to review','amber',true);
    if((p.day||0)<=1)add('New admission','blue',true);
    if(/late/.test((EX[pid]||[])[1]||''))add('History late','amber',true);
    if(x.allergy&&x.allergy.list&&x.allergy.list.length)add(x.allergy.list[0].drug+' allergy','red',false);
    try{if(c.edd){const d=Math.round((new Date(c.edd+'T00:00:00')-new Date(2026,9,24))/864e5);if(d>=0&&d<=1)add(d===0?'Discharge today':'Discharge tomorrow','blue',false);}}catch(e){}
    return {tags:t,flag};
  }
  /* the grey line: diagnosis, medicines, then the open items */
  function lineItems(pid){
    const p=ptFind(pid),c=ptCtxOf(pid),a=[];
    a.push(p.dx||c.dx||'');
    const m=liveMeds(c);if(m.length)a.push(m.slice(0,3).map(x=>medName(x)+(x.freq?' '+x.freq:'')).join(' · ')+(m.length>3?' · +'+(m.length-3)+' more':''));
    v3().alerts.filter(x=>x.pid===pid&&!x.closed).slice(0,1).forEach(x=>a.push(x.title));
    v3().labs.filter(l=>l.pid===pid&&!l.rev).slice(0,1).forEach(l=>a.push(l.test+' '+l.val+' '+l.unit+', not yet reviewed'));
    (S.referrals||[]).filter(r=>r.pid===pid&&!S.done[r.id]).slice(0,1).forEach(r=>a.push('Referral: '+r.why));
    if(/late/.test((EX[pid]||[])[1]||''))a.push('Detailed history late');
    const lr=lastRound(c);if(lr)a.push(lr);
    return a.filter(Boolean);
  }
  function planOf(pid){
    const p=ptFind(pid),c=ptCtxOf(pid),a=pendingTasks(p,tasks()).slice(0,3);
    const m=liveMeds(c)[0];if(m)a.push('Continue '+medName(m).replace(/^./,ch=>ch.toLowerCase()));
    return a.length?a.join('. ')+'.':'No open items.';
  }
  function recOf(pid){
    const p=ptFind(pid),c=ptCtxOf(pid),m=liveMeds(c).map(medName).join(', ');
    return [p.dx||c.dx||'',m,lastRound(c)].filter(Boolean).join(' · ');
  }
  const subOf=p=>[window.psyAgeSex?psyAgeSex(p):'',window.psyRoomLabel?psyRoomLabel(p):p.room,'Day '+(p.day||0)].filter(Boolean).join(' · ');
  /* 9 Nov (team review): "Handover to" and "Reason" are two drop-downs. Each patient has a tick box; ticking opens a window with the
     three headings (current psychopathology, past treatment trials, future treatment plan). Only ticked patients are sent. */
  const REASONS=['Going on leave','Transfer of patient','Shift or duty change','Other'];
  const rsnName=()=>{const r=store().ui.reason;return REASONS.includes(r)?r:'';};
  const selOf=()=>{const u=store().ui;u.sel=u.sel||{};return u.sel;};
  const detOf=pid=>{const u=store().ui;u.det=u.det||{};return u.det[pid]||null;};
  const detOk=d=>!!(d&&String(d.psychopath||'').trim()&&String(d.trials||'').trim()&&String(d.future||'').trim());
  function hvState(){
    const items=handoverPatients().map(p=>({p,t:tagsOf(p.id),d:detOf(p.id),on:!!selOf()[p.id]}));
    const sev=i=>i.t.tags.filter(t=>t[1]==='red').length*10+i.t.tags.length;
    items.sort((a,b)=>sev(b)-sev(a));
    const chosen=items.filter(i=>i.on),missing=chosen.filter(i=>!detOk(i.d));
    return {items,chosen,missing,ok:!!store().ui.to&&!!rsnName()&&chosen.length>0&&!missing.length};
  }
  const hvFootMsg=s=>{
    const u=store().ui;
    if(!u.to)return 'Choose the doctor who takes over.';
    if(!rsnName())return 'Choose the reason for the handover.';
    if(!s.chosen.length)return 'Tick the patients you are handing over.';
    if(s.missing.length)return s.missing.length+' ticked patient'+(s.missing.length>1?'s':'')+' still need'+(s.missing.length>1?'':'s')+' details.';
    return 'Ready to send '+s.chosen.length+' patient'+(s.chosen.length>1?'s':'')+'.';
  };
  const stHtml=i=>!i.on?'<span class="tiny muted">Not handing over</span>':detOk(i.d)?`<span class="hv-chip ok">Details added</span> <button class="hv-link" onclick="psyHvDetail('${i.p.id}')">Edit</button>`:`<button class="btn sm pri" onclick="psyHvDetail('${i.p.id}')">Add details</button>`;

  const hvCss=document.createElement('style');hvCss.id='psy-handover-v2-css';
  hvCss.textContent=`
  .hv{display:flex;flex-direction:column;gap:14px}
  .hv-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
  .hv-top h2{margin:0 0 4px}.hv-seg{display:inline-flex;gap:3px;padding:4px;border:1px solid #e0e8f2;border-radius:12px;background:#f0f4f9}
  .hv-seg button{border:1px solid transparent;background:transparent;border-radius:9px;padding:8px 14px;font:inherit;font-size:13px;font-weight:600;color:#344054;cursor:pointer;white-space:nowrap}
  .hv-seg button.on{background:#fff;color:#111827;border-color:#e7edf5;box-shadow:0 1px 3px rgba(15,23,42,.1);font-weight:700}
  .hv-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.hv-bar .grow{flex:1}
  .hv-count{font-size:12.5px;font-weight:700;border-radius:99px;padding:5px 12px;background:var(--amber-bg,#fffaeb);color:var(--amber,#b54708);border:1px solid var(--amber-line,#fedf89)}
  .hv-count.ok{background:#ecfdf3;color:#067647;border-color:#abefc6}
  .hv-lab{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted,#667085)}
  .hv-lab span:last-child{font-weight:500;letter-spacing:0;text-transform:none;font-size:12px}
  .hv-card{display:grid;grid-template-columns:minmax(190px,22%) minmax(0,1fr);gap:6px 18px;align-items:start;background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:14px;padding:14px 16px;box-shadow:0 1px 2px rgba(16,24,40,.04)}
  .hv-card.flag{border-left:4px solid #f5a524}.hv-card.flag.ok{border-left-color:#12b76a}
  .hv-who{display:flex;gap:10px;min-width:0}.hv-who b{display:block;font-size:14.5px}.hv-who .s{font-size:12px;color:var(--muted,#667085);margin-top:1px}
  .hv-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
  .hv-tag{font-size:11px;font-weight:600;border-radius:99px;padding:2px 9px;border:1px solid transparent;background:#f2f4f7;color:#475467}
  .hv-tag.red{background:#fef3f2;color:#b42318;border-color:#fecdca}.hv-tag.amber{background:#fffaeb;color:#b54708;border-color:#fedf89}.hv-tag.blue{background:#eff8ff;color:#175cd3;border-color:#b2ddff}
  .hv-line{font-size:12.5px;line-height:1.5;color:var(--muted,#667085);margin:0 0 8px;padding-left:18px;list-style:disc}.hv-line li{margin:2px 0;color:#475467}.hv-line li::marker{color:#175cd3}
  @keyframes hv-in{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
  @keyframes hv-glow{0%{background:#dbeafe}100%{background:transparent}}
  .hv.enter .hv-line li{border-radius:6px;animation:hv-in .5s cubic-bezier(.2,.7,.2,1) both,hv-glow 1.1s ease-out both;animation-delay:calc(var(--d,0s) + var(--i,0)*.08s - var(--el,0s))}
  @media(prefers-reduced-motion:reduce){.hv.enter .hv-line li{animation:none}}
  .hv-card .l{display:block;font-size:12px;font-weight:700;color:var(--ink,#101828);margin-bottom:3px}
  .hv-card input.input{width:100%;min-height:38px}
  .hv-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
  .hv-chip{font-size:11.5px;font-weight:700;border-radius:99px;padding:3px 11px;white-space:nowrap;background:#f2f4f7;color:#475467}
  .hv-chip.need{background:#fffaeb;color:#b54708}.hv-chip.ok{background:#ecfdf3;color:#067647}.hv-chip.add{background:#eff8ff;color:#175cd3}
  .hv-link{border:0;background:none;font:inherit;font-size:12.5px;font-weight:600;color:var(--blue-ink,#175cd3);cursor:pointer;padding:0}
  .hv-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:14px;padding:12px 16px;position:sticky;bottom:8px}
  .hv-foot .btn.off{opacity:.55}
  .hv-rc{background:#f3f7ff;border:1px solid #c9dcfb;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:10px}
  .hv-rc-hd{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.hv-rc-hd .t{flex:1;min-width:220px}.hv-rc-hd .t b{display:block;font-size:14px}.hv-rc-hd .t span{font-size:12px;color:var(--muted,#667085)}
  .hv-rc-ic{width:30px;height:30px;border-radius:99px;background:#fff;border:1px solid #c9dcfb;color:#175cd3;display:grid;place-items:center;flex:0 0 30px}
  .hv-rc-row{display:grid;grid-template-columns:minmax(150px,19%) minmax(0,1fr) auto;gap:14px;align-items:start;background:#fff;border:1px solid var(--line-2,#e4e7ec);border-radius:12px;padding:11px 14px}
  .hv-rc-row b.n{font-size:13.5px}.hv-rc-row .s{font-size:11.5px;color:var(--muted,#667085)}
  .hv-rc-row .m{font-size:12.5px;line-height:1.5}.hv-rc-row .m b{font-weight:700}.hv-rc-row .m .r{color:var(--muted,#667085);font-size:11.5px;margin-top:2px}
  .hv-box{background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:12px;padding:10px 14px;font-size:12.5px}.hv-box b{display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:2px}
  @media (max-width:860px){.hv-card,.hv-rc-row{grid-template-columns:1fr}.hv-side{align-items:flex-start;flex-direction:row;align-items:center}}`;
  document.head.appendChild(hvCss);

  window.psyHvReason=function(v){store().ui.reason=v;psyHvRefresh();};
  window.psyHvTo=function(v){store().ui.to=v;psyHvRefresh();};
  window.psyHvRefresh=function(){
    const s=hvState(),u=store().ui;
    const c=$('hvCount');if(c){c.textContent=s.chosen.length+' of '+handoverPatients().length+' selected';c.classList.toggle('ok',!!s.chosen.length&&!s.missing.length);}
    const f=$('hvFoot');if(f)f.textContent=hvFootMsg(s);
    const b=$('hvSend');if(b){b.textContent=u.to?'Send to '+u.to:'Send handover';b.classList.toggle('off',!s.ok);b.setAttribute('aria-disabled',s.ok?'false':'true');}
    const all=$('hvAll');if(all){all.checked=s.chosen.length===handoverPatients().length;all.indeterminate=s.chosen.length>0&&s.chosen.length<handoverPatients().length;}
    s.items.forEach(i=>{const cb=$('hvCk-'+i.p.id),st=$('hvSt-'+i.p.id),row=$('hvCard-'+i.p.id);if(cb)cb.checked=i.on;if(st)st.innerHTML=stHtml(i);if(row)row.classList.toggle('on',i.on);});
  };
  window.psyHvTick=function(pid,on){selOf()[pid]=!!on;psyHvRefresh();}; /* 9 Nov (review 2): ticking never opens a pop-up; Send handover walks through the missing details one by one */
  window.psyHvAll=function(on){const s=selOf();handoverPatients().forEach(p=>{s[p.id]=!!on;});psyHvRefresh();};
  window.psyHvDet=function(pid,k,v){const u=store().ui;u.det=u.det||{};(u.det[pid]=u.det[pid]||{})[k]=v;};
  window.psyHvDetail=function(pid){
    const p=ptFind(pid);if(!p)return;const u=store().ui;u.det=u.det||{};
    const a=auto(pid),f=a?a.f:{};
    const d=u.det[pid]=u.det[pid]||{ddx:'',comorb:f.comorb||'',psychopath:f.psychopath||'',trials:f.past||'',future:''};
    const ta=(k,lab,ph)=>`<div class="hn-f"><div class="lbl">${lab}</div><textarea class="input" rows="3" id="hvD-${k}" placeholder="${ph}" oninput="psyHvDet('${pid}','${k}',this.value)">${hesc(d[k]||'')}</textarea></div>`;
    V3.modal('Handover details · '+hesc(p.name),'For '+hesc(u.to||'the covering doctor')+'. Filled from the record where possible: check it and add to it. All three are needed.',
      `<div style="display:flex;flex-direction:column;gap:12px">${ta('ddx','Differential diagnosis (if any)','Leave empty if none')}${ta('comorb','Medical or surgical comorbidity (if any)','Leave empty if none')}${ta('psychopath','Current psychopathology','Symptoms that are still present now')}${ta('trials','Past treatment trials','Medicines already tried and how the patient responded')}${ta('future','Future treatment plan','What you plan next and what the covering doctor should do')}</div>`,
      `<button class="btn" onclick="psyHvDetCancel('${pid}')">Cancel</button><button class="btn pri" onclick="psyHvDetSave('${pid}')">Save</button>`);
  };
  window.psyHvDetSave=function(pid){
    const d=detOf(pid)||{};
    const miss=['psychopath','trials','future'].find(k=>!String(d[k]||'').trim());
    if(miss){toast('Fill in all three headings first');const el=$('hvD-'+miss);if(el)el.focus();return;}
    closeModal();selOf()[pid]=true;psyHvRefresh();
  };
  window.psyHvDetCancel=function(pid){closeModal();if(!detOk(detOf(pid)))selOf()[pid]=false;psyHvRefresh();};
  window.psyHvRecord=function(pid){
    const p=ptFind(pid);if(!p)return;
    V3.modal('From the record · '+hesc(p.name),'What the system already knows. This is what the next doctor can open.',notePage(pid,snap(pid),true,{}),`<button class="btn pri" onclick="closeModal()">Close</button>`);
  };
  window.psyHvSend=function(){
    const s=hvState(),u=store().ui;
    if(!u.to){toast('Choose the doctor who takes over');const sel=$('hoTo');if(sel)sel.focus();return;}
    if(!rsnName()){toast('Choose the reason for the handover');const sel=$('hoWhy');if(sel)sel.focus();return;}
    if(!s.chosen.length){toast('Tick the patients you are handing over');return;}
    if(s.missing.length){toast('Add the details for '+s.missing[0].p.name+' first');psyHvDetail(s.missing[0].p.id);return;}
    const lines={};s.chosen.forEach(i=>{const d=i.d;lines[i.p.id]={ddx:(d.ddx||'').trim(),comorb:(d.comorb||'').trim(),psychopath:d.psychopath.trim(),trials:d.trials.trim(),future:d.future.trim(),watch:d.psychopath.trim(),plan:d.future.trim(),rec:recOf(i.p.id),tags:i.t.tags.slice(0,3),flag:i.t.flag};});
    store().list.unshift({id:'ho'+Date.now(),from:signer(),to:u.to,reason:rsnName(),at:atNow(),pids:s.chosen.map(i=>i.p.id),lines,status:'sent'});
    const n=s.chosen.length;u.sel={};u.det={};render();toast('Handover of '+n+' patient'+(n>1?'s':'')+' sent to '+u.to+'. You still see them until '+u.to+' accepts.');
  };
  /* what a sent handover says for one patient (the sample handover and older ones may carry only part of it) */
  const lineFor=(h,pid)=>{const l=(h.lines||{})[pid];if(l)return l;const n=h.notes&&h.notes[pid];return {psychopath:(h.rec&&h.rec[pid])||(n&&n.future)||'',trials:'',future:'',watch:(h.rec&&h.rec[pid])||(n&&n.future)||'',plan:planOf(pid),rec:recOf(pid),tags:[['Routine','amber']],flag:false};};
  const lineRows=l=>[['Differential diagnosis',l.ddx],['Comorbidity',l.comorb],['Current symptoms',l.psychopath||l.watch],['Past treatment trials',l.trials],['Future treatment plan',l.future||l.plan]].filter(x=>x[1]);
  window.psyHvPdf=function(id){
    const h=id?store().list.find(x=>x.id===id):null,u=store().ui;
    const pids=h?h.pids:hvState().chosen.map(i=>i.p.id);
    if(!pids.length){toast('Tick the patients you want in the PDF first');return;}
    const rows=pids.map(pid=>{const p=ptFind(pid),l=h?lineFor(h,pid):Object.assign({},detOf(pid)||{});
      return `<tr><td><b>${hesc(p.name)}</b><br>${hesc(subOf(p))}</td><td>${hesc(l.psychopath||l.watch||'')}</td><td>${hesc(l.trials||'')}</td><td>${hesc(l.future||l.plan||'')}</td><td>${hesc(recOf(pid))}</td></tr>`;}).join('');
    psyPdf('Handover',`<h2>Handover · ${hesc(h?h.reason:rsnName()||'—')}</h2><div style="margin-bottom:8px">From ${hesc(h?h.from:signer())} to ${hesc((h?h.to:u.to)||'—')} · ${hesc(h?h.at:atNow())}</div><table><thead><tr><th>Patient</th><th>Current psychopathology</th><th>Past treatment trials</th><th>Future treatment plan</th><th>Diagnosis and medicines</th></tr></thead><tbody>${rows}</tbody></table>`,null);
  };

  window.psyHoAccept=function(id){
    const h=store().list.find(x=>x.id===id);if(!h||h.acceptedBy)return;
    h.acceptedBy=signer();h.acceptedAt=atNow();h.status='accepted';
    h.pids.forEach(pid=>{try{PSYOF[pid]=h.to;ptCtxOf(pid).team.psy=h.to;}catch(e){}});
    render();toast('Handover accepted by '+signer()+'. The patients are now yours, marked Covering on Today.');
  };
  window.psyHoToggle=function(id){const h=store().list.find(x=>x.id===id);if(h){h.hide=!h.hide;render();}};

  /* the "handed over to you" card: Today page and Handover page. Gone from Today once accepted (the patients then show as Covering). */
  const IC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h12l-3-3M17 17H5l3 3"/></svg>';
  const rcCss=document.createElement('style');rcCss.id='psy-handover-rc-css';
  rcCss.textContent=`.hv-rc{background:linear-gradient(180deg,#f3f7ff,#f8faff);border:1px solid #c9dcfb;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 3px rgba(23,92,211,.06)}
  .hv-rc-cnt{font-size:11.5px;font-weight:700;color:#175cd3;background:#fff;border:1px solid #c9dcfb;border-radius:99px;padding:2px 10px;margin-left:8px;white-space:nowrap}
  .hv-rc-list{display:flex;flex-direction:column;gap:10px;max-height:560px;overflow:auto;padding:2px}
  .hv-rc-p{display:grid;grid-template-columns:minmax(210px,24%) minmax(0,1fr) auto;gap:16px;align-items:start;background:#fff;border:1px solid #e3eaf6;border-radius:14px;padding:14px 16px;transition:box-shadow .18s,border-color .18s}
  .hv-rc-p:hover{border-color:#a9c6f5;box-shadow:0 4px 12px rgba(23,92,211,.1)}
  .hv-rc-who{display:flex;gap:10px;min-width:0}.hv-rc-who b{display:block;font-size:14.5px}.hv-rc-who .s{font-size:12px;color:var(--muted,#667085);margin-top:1px}
  .hv-rc-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px 18px}
  .hv-rc-col{border-left:3px solid #d6e4fb;padding-left:10px;min-width:0}.hv-rc-col.a{border-left-color:#f5a524}.hv-rc-col.b{border-left-color:#7a9ff0}.hv-rc-col.c{border-left-color:#12b76a}
  .hv-rc-col .l{display:block;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#667085);margin-bottom:2px}
  .hv-rc-col .t{font-size:13px;line-height:1.45;color:var(--ink,#101828)}
  @media (max-width:900px){.hv-rc-p{grid-template-columns:1fr}}`;
  document.head.appendChild(rcCss);
  function receivedCard(h){
    const n=h.pids.length,open=!h.hide,CLS={'Current symptoms':'a','Past treatment trials':'b','Future treatment plan':'c'};
    return `<section class="hv-rc" aria-label="Handover received">
      <div class="hv-rc-hd"><span class="hv-rc-ic">${IC}</span><div class="t"><b>${hesc(h.from)} handed over ${n} patient${n>1?'s':''} to you<span class="hv-rc-cnt">${n} patient${n>1?'s':''}</span></b><span>${hesc(h.reason)} · sent ${hesc(shortAt(h.at))} · ${h.acceptedBy?'accepted by '+hesc(h.acceptedBy)+', '+hesc(shortAt(h.acceptedAt)):'until you accept, '+hesc(h.from)+' still sees them'}</span></div>
        <button class="btn sm" onclick="psyHoToggle('${h.id}')">${open?'Hide':'Show'}</button>${h.acceptedBy?'':`<button class="btn sm pri" onclick="psyHoAccept('${h.id}')">Accept handover</button>`}</div>
      ${open?`<div class="hv-rc-list">${h.pids.map(pid=>{const p=ptFind(pid);if(!p)return '';const l=lineFor(h,pid),rows=lineRows(l).filter(x=>CLS[x[0]]);
        return `<div class="hv-rc-p"><div class="hv-rc-who">${av(p.ini,36,'c-blue')}<div style="min-width:0"><b>${hesc(p.name)}</b><div class="s">${hesc(subOf(p))}</div>${(l.tags||[]).length?`<div class="hv-tags">${l.tags.map(t=>`<span class="hv-tag ${t[1]}">${hesc(t[0])}</span>`).join('')}</div>`:''}</div></div>
          <div class="hv-rc-cols">${rows.length?rows.map(x=>`<div class="hv-rc-col ${CLS[x[0]]}"><span class="l">${x[0]}</span><div class="t">${hesc(x[1])}</div></div>`).join(''):'<div class="muted small">No notes added</div>'}</div>
          <button class="hv-link" onclick="go('#/patient/${pid}/overview')">Open record</button></div>`;}).join('')}</div>`:''}</section>`;
  }
  window.psyHandoverCard=function(){
    const me=signer(),L=store().list.filter(h=>h.to===me&&!h.acceptedBy);
    if(!L.length)return '';
    return L.map(receivedCard).join('');
  };

  const hvTblCss=document.createElement('style');hvTblCss.id='psy-handover-tbl-css';
  hvTblCss.textContent=`.hv-tbl td,.hv-tbl th{vertical-align:top}.hv-tbl tbody tr.on{background:#f3f8ff}.hv-tbl .hv-line{margin:0}.hv-tbl .hv-who b{font-size:14px}.hv-tbl input[type=checkbox]{width:17px;height:17px;accent-color:var(--blue,#1d6fe0);cursor:pointer}.hv-bar label.f{display:flex;align-items:center;gap:8px;font-size:13px}`;
  document.head.appendChild(hvTblCss);
  function page(){
    const st=store(),u=st.ui,me=signer(),s=hvState();
    const sent=st.list.filter(h=>h.from===me);
    const doctors=(typeof TR_TO!=='undefined'?TR_TO.psy:[]).filter(n=>n!==me);
    const HN=Date.now(),HV=window.__hvAnim;let hel=-1;
    if(!HV){window.__hvAnim={t0:HN};hel=0;}else if(HN-HV.t0<1400)hel=(HN-HV.t0)/1000;
    const sentCard=h=>`<section class="card"><div class="hd"><div><h3>To ${hesc(h.to)} · ${hesc(h.reason)}</h3><div class="small muted" style="margin-top:4px">${hesc(h.at)} · ${h.pids.length} patient${h.pids.length>1?'s':''}${h.acceptedBy?' · <b style="color:var(--green)">Accepted by '+hesc(h.acceptedBy)+', '+hesc(h.acceptedAt)+'</b>':' · <b style="color:var(--amber)">Waiting for '+hesc(h.to)+' to accept. You still see these patients.</b>'}</div></div>
      <div class="row" style="gap:8px"><button class="btn sm" onclick="psyHoToggle('${h.id}')">${h.hide?'Show':'Hide'} lines</button><button class="btn sm" onclick="psyHvPdf('${h.id}')">PDF</button></div></div>
      ${h.hide?'':`<div class="pad" style="padding-top:0">${h.pids.map(pid=>{const p=ptFind(pid),l=lineFor(h,pid),rows=lineRows(l);return `<div class="li"><div class="grow"><div style="font-weight:600">${hesc(p?p.name:pid)}</div>${rows.length?rows.map(x=>`<div class="small"><b>${x[0]}:</b> ${hesc(x[1])}</div>`).join(''):'<div class="small muted">No notes added</div>'}</div></div>`;}).join('')}</div>`}</section>`;
    const row=i=>{
      const p=i.p,c=ptCtxOf(p.id),meds=liveMeds(c);
      return `<tr id="hvCard-${p.id}" class="${i.on?'on':''}"><td><input type="checkbox" id="hvCk-${p.id}" ${i.on?'checked':''} onchange="psyHvTick('${p.id}',this.checked)" aria-label="Hand over ${hesc(p.name)}"></td>
        <td><div class="hv-who">${av(p.ini,34,i.t.flag?'c-amber':'c-blue')}<div style="min-width:0"><b>${hesc(p.name)}</b><div class="s">${hesc(subOf(p))}</div></div></div></td>
        <td><div>${hesc(p.dx||c.dx||'')}</div>${(()=>{const a=(auto(p.id)||{f:{}}).f,pt=pendingTasks(p,tasks()).slice(0,2).join('; ');return `<div class="tiny muted" style="margin-top:3px">Allergy: ${hesc(String(a.allergy||'Not recorded yet').split('\n')[0])}${pt?' · Pending: '+hesc(pt):''}</div>`;})()}${i.t.tags.length?`<div class="hv-tags">${i.t.tags.map(t=>`<span class="hv-tag ${t[1]}">${hesc(t[0])}</span>`).join('')}</div>`:''}</td>
        <td>${meds.length?`<ul class="hv-line">${meds.map(m=>`<li>${hesc(medName(m)+(m.freq?' '+m.freq:''))}</li>`).join('')}</ul>`:'<span class="muted small">No medicines</span>'}</td>
        <td id="hvSt-${p.id}">${stHtml(i)}</td></tr>`;
    };
    return `<div class="hv ${hel>=0?'enter':''}" ${hel>=0?`style="--el:${hel.toFixed(2)}s"`:''}>
      <div class="tiny muted">Inpatients / Handover</div>
      <div class="hv-bar"><label class="f">Handover to <select class="input" id="hoTo" style="min-height:36px;width:auto" onchange="psyHvTo(this.value)" aria-label="Doctor who takes over"><option value="">Choose doctor…</option>${doctors.map(d=>`<option ${u.to===d?'selected':''}>${hesc(d)}</option>`).join('')}</select></label>
        <label class="f">Reason <select class="input" id="hoWhy" style="min-height:36px;width:auto" onchange="psyHvReason(this.value)" aria-label="Reason for the handover"><option value="">Choose reason…</option>${REASONS.map(r=>`<option ${rsnName()===r?'selected':''}>${hesc(r)}</option>`).join('')}</select></label>
        <span class="grow"></span><label class="f"><input type="checkbox" id="hvAll" ${s.chosen.length===handoverPatients().length?'checked':''} onchange="psyHvAll(this.checked)"> Select all</label><span class="hv-count ${s.chosen.length&&!s.missing.length?'ok':''}" id="hvCount">${s.chosen.length} of ${handoverPatients().length} selected</span></div>
      <section class="card hv-tbl"><div class="scroll"><table class="t"><thead><tr><th style="width:36px"></th><th>Patient</th><th>Diagnosis and alerts</th><th>Ongoing medicines</th><th>Handover details</th></tr></thead><tbody>${s.items.map(row).join('')}</tbody></table></div></section>
      <div class="hv-foot"><span class="small" id="hvFoot">${hesc(hvFootMsg(s))}</span>
        <span class="row" style="gap:8px"><button class="btn" onclick="psyHvPdf()">Download PDF</button><button class="btn pri ${s.ok?'':'off'}" id="hvSend" aria-disabled="${s.ok?'false':'true'}" onclick="psyHvSend()">${u.to?'Send to '+hesc(u.to):'Send handover'}</button></span></div>
      ${sent.length?`<div class="lbl">Sent by you</div>${sent.map(sentCard).join('')}`:''}</div>`;
  }
  window.psyHandoverPage=page;

  /* Today page: the received handover sits under the two buttons, and accepted patients carry a Covering tag */
  const __md=ROLE.psychiatrist.myday;
  ROLE.psychiatrist.myday=function(){
    let h=__md.apply(this,arguments);if(S.role!=='psychiatrist'||typeof h!=='string')return h;
    const card=window.psyHandoverCard();
    if(card)h=h.replace('Start rounds</button></div></div>',m=>m+card);
    const me=signer();
    store().list.filter(x=>x.to===me&&x.acceptedBy).forEach(x=>x.pids.forEach(pid=>{
      const key='onclick="go(\'#/patient/'+pid+'/overview\')"';
      const i=h.indexOf(key);if(i<0)return;
      const j=h.indexOf('</b>',i);if(j<0||h.slice(i,j).indexOf('pd-nm')<0)return;
      h=h.slice(0,j+4)+'<span class="pd-tag blue">Covering</span>'+h.slice(j+4);
    }));
    return h;
  };


  const prevR=ROLE.psychiatrist.render;
  ROLE.psychiatrist.render=function(base){
    const r=(location.hash||'').slice(2).split('/');
    if(r[0]==='handover'){renderSide(r);$('app').classList.remove('compact');$('title').textContent='Handover';$('view').innerHTML=page();window.scrollTo(0,0);return;}
    window.__hvAnim=null;
    return prevR?prevR(base):base();
  };

  /* Transfer patient opens this summary */
  window.psyHoPeek=function(){
    const p=ptFind(S.pid);if(!p)return;
    V3.modal('Handover note · '+hesc(p.name),'What the new doctor will read. Check it before you transfer.',notePage(S.pid,snap(S.pid),true,{}),`<button class="btn pri" onclick="closeModal();transferModal()">Back to transfer</button>`);
  };
  const __tm=transferModal;
  transferModal=function(){
    __tm.apply(this,arguments);
    if(!psy())return;
    const f=document.querySelector('#modal .mf');if(f)f.insertAdjacentHTML('afterbegin','<button class="btn" onclick="psyHoPeek()">Open handover summary</button>');
  };

  /* ---------- admission documents ---------- */
  const FILES={};
  const kb=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
  const TYPES=['Referral letter','ID proof','Previous discharge summary','Previous prescriptions','Outside lab or imaging report','Insurance papers','Other'];
  window.psyAdmUpload=function(inp){
    const x=px(S.pid);x.admDocs=x.admDocs||[];const ty=($('admTy')||{}).value||'Other';let n=0;
    [...inp.files].forEach(f=>{
      if(f.size>10*1048576){toast(f.name+' is over 10 MB and was not added');return;}
      FILES[S.pid+'|'+f.name+'|'+f.size]=URL.createObjectURL(f);
      x.admDocs.unshift({name:f.name,size:f.size,type:ty,by:signer(),at:atNow()});n++;
    });
    inp.value='';if(n){render();toast(n+' document'+(n>1?'s':'')+' added to the admission record');}
  };
  window.psyAdmRemove=function(i){const x=px(S.pid);const d=(x.admDocs||[])[i];if(!d)return;x.admDocs.splice(i,1);render();toast('Removed '+d.name);};
  function docsCard(){
    const x=px(S.pid),L=x.admDocs||[];
    return `<section class="card" id="admdocs"><div class="hd"><div><h3>Admission documents</h3><div class="small muted" style="margin-top:4px">Referral letter, ID proof, previous records and outside reports for this admission.</div></div>
      <div class="row" style="gap:8px"><select class="input" id="admTy" style="min-height:34px;width:auto" aria-label="Document type">${TYPES.map(t=>`<option>${t}</option>`).join('')}</select><label class="btn sm pri" style="cursor:pointer">Upload<input type="file" multiple hidden onchange="psyAdmUpload(this)"></label></div></div>
      ${L.length?L.map((d,i)=>{const u=FILES[S.pid+'|'+d.name+'|'+d.size];return `<div class="li"><div class="grow"><div style="font-weight:600">${hesc(d.name)}</div><div class="tiny muted">${hesc(d.type)} · ${kb(d.size)} · added by ${hesc(d.by)}, ${hesc(d.at)}</div></div>${u?`<a class="btn sm" href="${u}" target="_blank" rel="noopener">Open</a>`:'<span class="tiny muted">File is on the device that uploaded it</span>'}<button class="btn sm" onclick="psyAdmRemove(${i})">Remove</button></div>`;}).join(''):'<div class="pad small muted">No documents uploaded for this admission yet.</div>'}
      <div class="pad tiny muted" style="padding-top:0">Prototype: names and details are saved with the record; the files stay in this browser until document storage is connected.</div></section>`;
  }
  const __pa=pAdmission;
  pAdmission=function(){const h=__pa.apply(this,arguments);return psy()?h+docsCard():h;};
})();
