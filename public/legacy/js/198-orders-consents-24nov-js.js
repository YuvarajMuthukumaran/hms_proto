/* 198 · 24 Nov 2026 (Nikita, "Orders and consents redesign.html"; Anu on WhatsApp: "incorporate the consent forms we have in this
   for each of the modalities"). Owner: copy the content and layout only, not the colours.
   Psychiatrist and floor lead psychiatrist, Treatment Plan > Orders and consents. Replaces the order cards of block 54 (old orders
   in psyx.tmp stay listed under "Earlier orders" and still open in their old window).
   - An order (MECT, Ketamine, DTMS, Clozapine, Long-acting injection, Outing or leave, Restraint) is a list of tasks, each with an owner
     role and its own questions (choice, yes/no, multi, number, text, date, labs, consent form). Tasks marked "waits" open when the
     rest are done. Stop answers put the order on hold. Saved per patient in psyx.ord2 = [{id,tpl,at,by,ans:{task:{field:value}},
     done:{task:{by,at}},stopped}].
   - Consent tasks use the real consent forms where the library has one: MECT (mect-final), Clozapine (clozapine-consent), Outing
     (outing-consent): Collect e-signature, Send on WhatsApp (block 171), Open form, Doctor sign. The task is complete once the form is
     e-signed or a signed copy is uploaded (psyx.consent[fid]). Ketamine, DTMS, long-acting injection and restraint have no form yet:
     the signed paper copy is uploaded instead.
   - Nothing is sent or booked automatically: the prototype's "on save" automations are shown as next steps for the team.
   - One login per role, so the psychiatrist can fill a task owned by the RMO, psychologist or nurse; it is saved "for" that role. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const pidNow=()=>{try{if(S.pid)return S.pid;}catch(e){}return decodeURIComponent((String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1]||'');};
  const atNow=()=>{const d=new Date();return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});};
  const me=()=>{try{return signer();}catch(e){return 'Psychiatrist';}};

  /* ---------- order types (content from Nikita's prototype) ---------- */
  const CONSENT=(what,fid,extra)=>({id:'consent',label:'Consent for '+what,role:'Psychiatrist',fields:[
    {k:'choice',id:'cap',q:'Does the patient have capacity to decide on '+what+'? (Section 4, MHCA 2017)',opts:['Yes, has capacity','No, lacks capacity']},
    {k:'text',id:'acc',q:'Accompanied by (name and relation)',opt:true,ph:'For example the nominated representative'},
    {k:'check',id:'sheet',q:'Information sheet given and explained: how it is given, risks, benefits, other options'},
    ...(extra||[]),
    fid?{k:'form',id:'form',fid,q:'Consent form'}:{k:'paper',id:'paper',q:'Signed consent'}],
    next:['File the capacity assessment in Documentation']});
  const SCALE=()=>({id:'scale',label:'Baseline rating scale',role:'Psychologist',fields:[
    {k:'choice',id:'tool',q:'Scale used',opts:['HAM-D','MADRS','BDI-II','BPRS']},
    {k:'num',id:'score',q:'Score',min:0,max:100},
    {k:'date',id:'on',q:'Date done'}],next:['Repeat the same scale after the last session']});
  const T={
    mect:{name:'MECT',group:'Procedures',desc:'Electroconvulsive therapy with anaesthesia',tasks:[
      CONSENT('MECT','mect-final',[{k:'psy',id:'second',q:'Second psychiatrist to countersign (MECT needs two)'}]),
      {id:'ecg',label:'Physical examination and ECG',role:'RMO',fields:[
        {k:'yn',id:'pe',q:'Physical examination done',want:'Yes'},{k:'text',id:'bp',q:'BP and pulse',ph:'For example 124/80, 78 per minute'},
        {k:'choice',id:'ecg',q:'ECG',opts:['Normal','Abnormal, doctor informed','Not done']},
        {k:'yn',id:'teeth',q:'Loose teeth or dentures found?'}],next:['Note dentures or loose teeth on the session checklist']},
      {id:'blood',label:'Investigation',role:'RMO',fields:[
        {k:'labs',id:'labs',items:['Complete blood count','Kidney function','Electrolytes','Fasting sugar']},
        {k:'yn',id:'spec',q:'Special tests sent, if the anaesthetist advised any'},
        {k:'choice',id:'rev',q:'Results checked by the RMO',opts:['Normal','Abnormal, doctor informed']},
        {k:'text',id:'abn',q:'Abnormal values, if any',opt:true,ph:'For example sugar 112'}],next:['Tell the psychiatrist about any abnormal value']},
      {id:'fund',label:'Fundus examination',role:'RMO',fields:[
        {k:'yn',id:'fun',q:'Fundus examination done',want:'Yes'},
        {k:'choice',id:'res',q:'Finding',opts:['Normal','Papilloedema or other change, doctor informed'],stop:'Papilloedema or other change, doctor informed',stopText:'Fundus change found. MECT is on hold; tell the psychiatrist.'},
        {k:'date',id:'on',q:'Date done'}],next:[]},
      {id:'anaes',label:'Anaesthesia fitness',role:'RMO',waits:['ecg','blood','fund'],fields:[
        {k:'yn',id:'ac',q:'Anaesthesia consent signed by the patient or representative and one family member',want:'Yes'},
        {k:'multi',id:'probs',q:'Medical problems (tick all that apply)',opts:['None','Hypertension','Diabetes','Heart disease','Kidney failure','Hypothyroidism','Bronchial asthma','Jaundice','Thyrotoxicosis','Steroid therapy','Drug allergy','Bleeding disorder','Epilepsy or seizures','Earlier anaesthesia complication','Other']},
        {k:'choice',id:'pac',q:'Pre-anaesthetic check (PAC) fitness',opts:['Fit','Fit with precautions','Not fit'],stop:'Not fit',stopText:'Not fit for anaesthesia. MECT is on hold; tell the psychiatrist.'},
        {k:'yn',id:'contra',q:'Any contraindication: raised pressure in the head, recent heart attack, large aneurysm, brain mass?',stop:'Yes',stopText:'Contraindication found. MECT is on hold; tell the psychiatrist.'},
        {k:'yn',id:'fast',q:'Fasting of 6 to 8 hours before MECT explained',want:'Yes'},
        {k:'text',id:'prec',q:'Precautions to carry to every session',opt:true,ph:'For example BP before each session'}],
        next:['Carry the precautions to every session checklist']},
      {id:'mmse',label:'Mini-Mental State Exam (MMSE)',role:'Psychologist',fields:[{k:'num',id:'score',q:'MMSE score before MECT (out of 30)',min:0,max:30,band:'mmse'},{k:'date',id:'on',q:'Date done'}],next:['Repeat the MMSE after every 3rd session']},
      {id:'sched',label:'Schedule the first session',role:'Psychiatrist',waits:true,fields:[
        {k:'date',id:'day',q:'First session date'},{k:'time',id:'time',q:'Time'},
        {k:'choice',id:'n',q:'Sessions planned',opts:['6','8','10','12']}],
        next:['Tell the ward: nil by mouth for 6 to 8 hours before','Tell the family the date','Book the remaining sessions, 3 a week']}]},
    ket:{name:'Ketamine therapy',group:'Procedures',desc:'Consent, checks and session plan',tasks:[
      CONSENT('ketamine',null),
      {id:'pe',label:'Physical exam and BP',role:'RMO',fields:[
        {k:'text',id:'bp',q:'Baseline BP and pulse',ph:'For example 124/80, 78'},
        {k:'yn',id:'htn',q:'Uncontrolled high BP or heart disease?',stop:'Yes',stopText:'Ketamine is on hold until BP is controlled. Tell the psychiatrist.'},
        {k:'yn',id:'psy',q:'History of psychosis or substance use?',stop:'Yes',stopText:'The psychiatrist decides before the first session.'},
        {k:'yn',id:'preg',q:'Pregnant?',stop:'Yes',stopText:'Ketamine is not given in pregnancy. The order is on hold.'}],next:['BP checks at 0, 40 and 80 minutes in every session']},
      {id:'blood',label:'Blood work',role:'RMO',fields:[{k:'labs',id:'labs',items:['Liver function','Fasting sugar','Urine drug screen']},{k:'choice',id:'rev',q:'Results checked by the RMO',opts:['Normal','Abnormal, doctor informed']}],next:[]},
      SCALE(),
      {id:'sched',label:'Schedule the sessions',role:'Psychiatrist',waits:true,fields:[{k:'date',id:'day',q:'First session date'},{k:'time',id:'time',q:'Time'},{k:'choice',id:'n',q:'Sessions planned',opts:['4','6','8']},{k:'choice',id:'freq',q:'How often',opts:['Twice a week','Once a week']}],
        next:['Book the remaining sessions','Nurse keeps the patient 2 hours after each session','Tell the family: no driving on session days']}]},
    dtms:{name:'DTMS',group:'Procedures',desc:'Deep transcranial magnetic stimulation',tasks:[
      CONSENT('DTMS',null),
      {id:'screen',label:'Screen for contraindications',role:'Psychiatrist',fields:[
        {k:'yn',id:'metal',q:'Metal in the head, pacemaker, cochlear implant or medicine pump?',stop:'Yes',stopText:'DTMS cannot be given. The order is stopped.'},
        {k:'yn',id:'seiz',q:'History of seizures or epilepsy?',stop:'Yes',stopText:'Higher seizure risk. The psychiatrist decides before the first session.'},
        {k:'yn',id:'meds',q:'On medicines that lower the seizure threshold (for example bupropion, high-dose clozapine)?'},
        {k:'yn',id:'preg',q:'Pregnant?'}],next:[]},
      SCALE(),
      {id:'sched',label:'Schedule the sessions',role:'Psychiatrist',waits:true,fields:[{k:'date',id:'day',q:'First session date'},{k:'time',id:'time',q:'Time'},{k:'choice',id:'n',q:'Sessions planned',opts:['20','30','36']},{k:'choice',id:'proto',q:'Protocol',opts:['H1 coil, depression','H7 coil, OCD']}],
        next:['Book daily sessions, Monday to Friday','Repeat the rating scale after session 10 and at the end']}]},
    cloz:{name:'Clozapine consent',group:'Medicines that need consent',desc:'Consent and baseline checks',tasks:[
      CONSENT('clozapine','clozapine-consent',[{k:'check',id:'bloods',q:'Explained that weekly blood tests are needed for 18 weeks, then monthly'}]),
      {id:'cbc',label:'Baseline CBC and neutrophil count',role:'RMO',fields:[{k:'labs',id:'labs',items:['Neutrophil count','Liver function','Lipids','Fasting sugar']},{k:'choice',id:'rev',q:'Safe to start?',opts:['Yes, counts normal','No, counts low'],stop:'No, counts low',stopText:'Clozapine cannot start with low counts. The order is on hold.'}],next:[]},
      {id:'ecg',label:'ECG',role:'RMO',fields:[{k:'choice',id:'ecg',q:'ECG',opts:['Normal','Abnormal, doctor informed']},{k:'text',id:'qtc',q:'QTc (ms)',opt:true}],next:[]},
      {id:'reg',label:'Registry and monitoring plan',role:'Psychiatrist',waits:true,fields:[{k:'yn',id:'reg',q:'Patient registered with the clozapine monitoring service',want:'Yes'},{k:'choice',id:'dose',q:'Starting dose',opts:['12.5 mg at night','25 mg at night']}],
        next:['Add clozapine to the medicine chart in Rounds','Weekly blood count for 18 weeks, then monthly']}]},
    lai:{name:'Long-acting injection consent',group:'Medicines that need consent',desc:'Consent and schedule',tasks:[
      CONSENT('the long-acting injection',null),
      {id:'test',label:'Test dose plan',role:'Psychiatrist',fields:[{k:'choice',id:'drug',q:'Injection',opts:['Paliperidone palmitate','Fluphenazine decanoate','Haloperidol decanoate','Aripiprazole once-monthly']},{k:'yn',id:'oral',q:'Has the patient taken the oral form before without problems?'},{k:'choice',id:'td',q:'Test dose',opts:['Not needed','Given, no reaction','Given, reaction seen'],stop:'Given, reaction seen',stopText:'Reaction to the test dose. The injection is on hold.'}],next:[]},
      {id:'sched',label:'Schedule and injection site',role:'Nurse',waits:true,fields:[{k:'choice',id:'site',q:'Site',opts:['Deltoid (arm)','Gluteal (buttock)']},{k:'choice',id:'every',q:'Every',opts:['2 weeks','4 weeks','3 months']},{k:'date',id:'first',q:'First injection date'}],
        next:['Add the next doses to the nurse chart']}]},
    out:{name:'Outing or leave',group:'Leave',desc:'Request, risk review and approval',tasks:[
      {id:'req',label:'Family request noted',role:'Psychologist',fields:[{k:'text',id:'who',q:'Going with (name and relation)'},{k:'date',id:'day',q:'Date'},{k:'choice',id:'len',q:'How long',opts:['A few hours','Overnight','Weekend']},{k:'text',id:'why',q:'Purpose',opt:true,ph:'For example family function'}],next:[]},
      {id:'risk',label:'Risk review',role:'Psychiatrist',fields:[{k:'choice',id:'risk',q:'Risk on leave',opts:['Low','Medium','High'],stop:'High',stopText:'High risk. Leave should not be approved now.'},{k:'yn',id:'absc',q:'Has the patient absconded or tried to before?'},{k:'text',id:'cond',q:'Conditions',opt:true,ph:'For example no alcohol, back by 6 pm'}],next:[]},
      {id:'appr',label:'Approval',role:'Psychiatrist',fields:[{k:'choice',id:'ok',q:'Decision',opts:['Approved','Not approved']},{k:'form',id:'form',fid:'outing-consent',q:'Family consent and undertaking (outing consent)'}],next:['Tell the family the decision','Nurse packs the medicines for the outing']},
      {id:'esc',label:'Escort and return time',role:'Nurse',waits:true,fields:[{k:'time',id:'out',q:'Time out'},{k:'time',id:'back',q:'Expected back'},{k:'check',id:'ret',q:'Patient back on the ward and checked'}],next:['If not back 30 minutes after the time, tell the ward and the psychiatrist']}]},
    res:{name:'Restraint',group:'Emergency',desc:'Order, consent or emergency note, monitoring',emergency:true,tasks:[
      {id:'ord',label:'Order and reason',role:'Psychiatrist',fields:[
        {k:'info',tone:'bad',b:'Only if',text:'There is an immediate risk of harm and other ways have failed. MHCA Section 97.'},
        {k:'choice',id:'type',q:'Type',opts:['Physical','Chemical','Seclusion']},
        {k:'choice',id:'why',q:'Reason',opts:['Immediate risk of harm to self','Immediate risk of harm to others']},
        {k:'multi',id:'tried',q:'What was tried first',opts:['Talking down','Medication offered','1:1 observation','Quiet room']},
        {k:'choice',id:'rev',q:'Review in',opts:['30 minutes','60 minutes']}],next:['Nurse checks every 15 minutes from now']},
      {id:'em',label:'Consent or emergency note',role:'Psychiatrist',fields:[{k:'choice',id:'basis',q:'Basis',opts:['Emergency, no time for consent','Consent from the nominated representative']},{k:'stamp',id:'sig',q:'Doctor signature'}],next:['Inform the nominated representative within 24 hours','Add the episode to the monthly Mental Health Review Board report']},
      {id:'mon',label:'Monitoring plan',role:'Nurse',fields:[{k:'multi',id:'items',q:'Checked every 15 minutes',opts:['Breathing','Circulation','Hydration','Toilet','Behaviour'],pre:['Breathing','Circulation','Hydration','Toilet','Behaviour'],preNote:'All five are checked by default'},{k:'check',id:'on',q:'Checks running on the nurse chart'}],next:[]},
      {id:'rel',label:'Review and release',role:'Psychiatrist',waits:true,fields:[{k:'choice',id:'out',q:'Decision',opts:['Release now','Re-authorise for 30 more minutes']},{k:'yn',id:'deb',q:'Debrief with the patient planned?',want:'Yes'}],next:['Record the release time','Plan the debrief']}]}
  };
  const OLD={mect:'MECT',ket:'Ketamine therapy',dtms:'DTMS',out:'Outing or leave',rest:'Restraint',cloz:'Clozapine consent',lai:'Long-acting injection consent'};

  /* ---------- state ---------- */
  const UI=window.__o2=window.__o2||{view:'list',oid:'',task:''};
  const orders=pid=>{const x=px(pid);if(!Array.isArray(x.ord2))x.ord2=[];return x.ord2;};
  const find=(pid,oid)=>orders(pid).find(o=>o.id===oid);
  const tplOf=o=>T[o.tpl]||{name:o.tpl,tasks:[]};
  const ansOf=(o,tid)=>(o.ans=o.ans||{})[tid]||(o.ans[tid]={});
  const consentOf=(pid,fid)=>((px(pid).consent||{})[fid])||null;
  const signedForm=(pid,fid)=>{const c=consentOf(pid,fid);return !!(c&&(c.st==='esign'||c.st==='uploaded'));};
  const mmse=v=>{if(v===''||v==null||isNaN(+v)||+v<0||+v>30)return null;v=+v;return v>=24?['Normal','ok']:v>=18?['Mild impairment','warn']:v>=10?['Moderate impairment','bad']:['Severe impairment','bad'];};
  function fieldOk(pid,o,t,f){const v=ansOf(o,t.id)[f.id];
    if(f.k==='info'||f.opt)return true;
    if(f.k==='labs')return f.items.every((_,i)=>String((v||{})[i]||'').trim());
    if(f.k==='multi')return (v||f.pre||[]).length>0;
    if(f.k==='check')return !!v;
    if(f.k==='num')return f.band?!!mmse(v):(v!==''&&v!=null);
    if(f.k==='form')return signedForm(pid,f.fid);
    if(f.k==='paper'||f.k==='stamp')return !!(v&&v.at);
    return v!=null&&String(v).trim()!=='';}
  const others=(o,t)=>tplOf(o).tasks.filter(x=>x.id!==t.id&&(Array.isArray(t.waits)?t.waits.includes(x.id):x.waits!==true));
  const blocked=(o,t)=>t.waits&&others(o,t).some(x=>!(o.done||{})[x.id]);
  const started=(o,t)=>Object.keys((o.ans||{})[t.id]||{}).length>0;
  const st=(o,t)=>(o.done||{})[t.id]?'d':blocked(o,t)?'l':started(o,t)?'w':'';
  const canSave=(pid,o,t)=>!(o.done||{})[t.id]&&!blocked(o,t)&&t.fields.every(f=>fieldOk(pid,o,t,f));
  const stopped=o=>{for(const t of tplOf(o).tasks)for(const f of t.fields)if(f.stop&&((o.ans||{})[t.id]||{})[f.id]===f.stop)return [t,f.stopText];return null;};
  const allDone=o=>tplOf(o).tasks.every(t=>(o.done||{})[t.id]);
  function status(o){const tp=tplOf(o),TT=tp.tasks,d=TT.filter(t=>(o.done||{})[t.id]).length;
    if(o.stopped)return ['Stopped','grey'];if(stopped(o))return ['On hold','red'];
    if(d===TT.length)return [tp.emergency?'Closed':o.tpl==='out'?'Done':'Running','green'];
    if(tp.emergency)return ['Active now','red'];
    const last=TT.find(t=>t.waits===true);if(last&&!blocked(o,last)&&!(o.done||{})[last.id])return ['Ready: '+last.label.toLowerCase(),'blue'];
    return [d+' of '+TT.length+' done','amber'];}
  const isMine=t=>t.role==='Psychiatrist';
  /* 25 Nov (Anu): psychiatrists for the countersign drop-down: the staff list (real mode), else the treating psychiatrists on the wards; the treating one is left out */
  function psyNames(pid){const N=new Set();try{(window.__realStaff||[]).filter(x=>x.role==='psychiatrist').forEach(x=>N.add(x.name));}catch(e){}
    if(!N.size)try{(typeof PTS!=='undefined'?PTS:[]).forEach(p=>{const n=((ptCtxOf(p.id)||{}).team||{}).psy;if(n)N.add(n);});}catch(e){}
    let tr='';try{tr=((ptCtxOf(pid)||{}).team||{}).psy||'';}catch(e){}if(N.size>1)N.delete(tr);return [...N].sort();}

  /* ---------- icons (17 px strokes like the other tabs) ---------- */
  const IC={mect:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',ket:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',dtms:'<circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',cloz:'<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-35 12 12)"/><path d="m9.5 8.5 6 6"/>',lai:'<path d="m18 2 4 4M15 5l4 4M3 21l3-3M6 18l10-10-4-4L2 14l4 4zM9 11l2 2"/>',out:'<path d="M14 3h5v18h-5M10 17l5-5-5-5M15 12H3"/>',res:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M12 8v5M12 16h.01"/>'};
  const ico=(k,sz)=>`<svg width="${sz||20}" height="${sz||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||'<rect x="5" y="4" width="14" height="17" rx="2"/>'}</svg>`;

  /* ---------- list ---------- */
  function card(pid,o){const tp=tplOf(o),TT=tp.tasks,s=status(o),done=o.done||{};
    const open=TT.filter(t=>!done[t.id]&&!blocked(o,t)),mine=open.find(isMine),hold=stopped(o);let act;
    if(o.stopped)act=`<div class="o2-msg"><span>Stopped by ${E(o.stopped.by)}, ${E(o.stopped.at)}</span></div><button class="btn sm" onclick="o2Open('${o.id}')">View</button>`;
    else if(hold)act=`<div class="o2-msg red"><b>On hold:</b> ${E(hold[1])}</div><button class="btn sm" onclick="o2Open('${o.id}','${hold[0].id}')">Review</button>`;
    else if(allDone(o))act=`<div class="o2-msg ok">All ${TT.length} tasks done.</div><button class="btn sm" onclick="o2Open('${o.id}')">View</button>`;
    else if(mine)act=`<div class="o2-msg"><b>Your turn:</b> ${E(mine.label)}${open.length>1?` <span class="muted">· also with ${E([...new Set(open.filter(t=>t!==mine).map(t=>t.role))].join(', '))}</span>`:''}</div><div class="o2-btns"><button class="btn sm" onclick="o2Open('${o.id}')">All tasks</button><button class="btn sm ${tp.emergency?'o2-red':'pri'}" onclick="o2Open('${o.id}','${mine.id}')">${E(mine.label)}</button></div>`;
    else act=`<div class="o2-msg"><b>With others:</b> ${open.map(t=>E(t.label)+' <span class="muted">('+E(t.role)+')</span>').join(', ')}</div><button class="btn sm" onclick="o2Open('${o.id}','${(open[0]||TT[0]).id}')">All tasks</button>`;
    return `<div class="o2-card${tp.emergency?' em':''}"><div class="o2-top"><span class="o2-ic">${ico(o.tpl)}</span><div class="o2-tt"><b>${E(tp.name)}</b><div class="small muted">Ordered by ${E(o.by)} · ${E(o.at)}</div></div><span class="o2-pill ${s[1]}">${E(s[0])}</span></div>
      <div class="o2-steps">${TT.map(t=>{const x=st(o,t);return `<div class="o2-step ${x}"><span class="o2-dot">${x==='d'?'✓':''}</span><span><span class="l">${E(t.label)}</span><span class="r">${x==='d'?'Done':x==='l'?'Waits':E(t.role)}</span></span></div>`;}).join('')}</div>
      <div class="o2-act">${act}</div></div>`;}
  function listHtml(pid){
    const O=orders(pid),live=O.filter(o=>!o.stopped),act=live.filter(o=>!allDone(o)).sort((a,b)=>(tplOf(b).emergency?1:0)-(tplOf(a).emergency?1:0));
    const run=live.filter(o=>allDone(o)&&!tplOf(o).emergency&&o.tpl!=='out'),fin=O.filter(o=>o.stopped||(allDone(o)&&(tplOf(o).emergency||o.tpl==='out')));
    let mineN=0,oth=0,em=0;act.forEach(o=>{const op=tplOf(o).tasks.filter(t=>!(o.done||{})[t.id]&&!blocked(o,t));if(op.some(isMine))mineN++;else if(op.length)oth++;if(tplOf(o).emergency&&op.length)em++;});
    const old=(px(pid).tmp||[]).filter(o=>o&&o.steps);
    return `<div class="o2-head"><div><h3>Orders and consents</h3><div class="small muted">Active orders first. Consent is a task inside each order.</div></div>
      <div class="o2-btns"><button class="btn o2-hb o2-rn" onclick="o2New('res')">${ico('res',16)}<span>Restraint now</span></button><button class="btn pri o2-hb" onclick="o2Pick()">New order</button></div></div>
      <div class="o2-kpis"><div class="o2-kpi"><span class="n amber">${mineN}</span><span><b>Need you</b><span class="small muted">orders waiting on your step</span></span></div>
        <div class="o2-kpi"><span class="n blue">${oth}</span><span><b>With others</b><span class="small muted">RMO, psychologist, nurse</span></span></div>
        <div class="o2-kpi"><span class="n ${em?'red':''}">${em}</span><span><b>Emergency</b><span class="small muted">${em?'restraint running now':'none running'}</span></span></div></div>
      <div class="o2-sec"><h4>In progress</h4><span class="small muted">${act.length}</span></div>
      ${act.length?act.map(o=>card(pid,o)).join(''):'<div class="o2-empty small muted">Nothing in progress. Start one with + New order.</div>'}
      ${run.length?`<div class="o2-sec"><h4>Set up and running</h4><span class="small muted">${run.length} · sessions, doses and checks run on the schedule</span></div>${run.map(o=>card(pid,o)).join('')}`:''}
      <div class="o2-sec"><h4>Done and stopped</h4><span class="small muted">${fin.length+old.length}</span></div>
      <div class="o2-box">${fin.map(o=>`<div class="o2-row"><span><b>${E(tplOf(o).name)}</b> <span class="small muted">· ${o.stopped?'stopped '+E(o.stopped.at):'all '+tplOf(o).tasks.length+' tasks done'} · ordered ${E(o.at)}</span></span><button class="btn sm" onclick="o2Open('${o.id}')">View</button></div>`).join('')}
        ${old.map(o=>{const n=o.steps.filter(s=>s.done).length;return `<div class="o2-row"><span><b>${E(OLD[o.key]||o.key)}</b> <span class="small muted">· earlier order · ${n} of ${o.steps.length} tasks done · ordered ${E(o.at)} by ${E(o.by)}</span></span>${typeof window.psyTmOpen==='function'?`<button class="btn sm" onclick="psyTmOpen('${E(o.id)}',0)">View</button>`:''}</div>`;}).join('')}
        ${fin.length+old.length?'':'<div class="o2-row small muted">None yet.</div>'}</div>`;
  }

  /* ---------- one order ---------- */
  const q=(...a)=>a.map(x=>`'${E(x)}'`).join(',');
  function formField(pid,o,t,f,ro){
    const c=consentOf(pid,f.fid),ok=signedForm(pid,f.fid),a=q(pid,f.fid);
    const who=ok?(c.st==='uploaded'?'Signed copy uploaded':'Signed by '+(c.as==='patient'?'the patient':(c.by||''))+(c.rel&&c.as!=='patient'?' ('+c.rel+')':'')):'';
    const btn=ok?`<button class="btn sm" onclick="acrOpenForm('${E(f.fid)}')">Open form</button>${c.doc?'':`<button class="btn sm pri" onclick="dsOpen(${a})">Doctor sign</button>`}`
      :ro?'':`<button class="btn sm pri" onclick="psyEsignOpen('${E(f.fid)}')">Collect e-signature</button>${typeof window.ocSend==='function'?`<button class="btn sm" onclick="ocSend(${a})">${c&&c.remote?'Send again on WhatsApp':'Send on WhatsApp'}</button>`:''}<label class="btn sm" style="cursor:pointer">Upload signed copy<input type="file" hidden accept=".pdf,image/*" onchange="o2FormUp(${a},this)"></label>`;
    const name=(typeof CD_FORMS!=='undefined'&&(CD_FORMS.find(x=>x.id===f.fid)||{}).title)||f.q;
    return `<div class="o2-q"><span class="o2-ql">${E(f.q)}</span><div class="o2-form"><div><b>${E(name)}</b><div class="small ${ok?'o2-ok':c&&c.remote?'o2-wait':'muted'}">${ok?E(who)+(c.at?' · '+E(c.at):'')+(c.doc?' · doctor signed '+E(c.doc.at):''):c&&c.remote?'Sent on WhatsApp '+E(c.remote.at||'')+' · waiting for the family':'Not signed yet. Filled in from the patient record; you can edit it before signing.'}</div></div><div class="o2-btns">${btn}</div></div></div>`;
  }
  function fieldHtml(pid,o,t,f,fi,ro){
    const v=ansOf(o,t.id)[f.id],dis=ro?' disabled':'',id=`o2_${t.id}_${f.id}`,args=`'${o.id}','${t.id}',${fi}`;
    const L=`<span class="o2-ql">${E(f.q)}${f.opt?' <span class="muted">(optional)</span>':''}</span>`;
    if(f.k==='info')return `<div class="o2-note ${f.tone||''}"><b>${E(f.b)}</b> ${E(f.text)}</div>`;
    if(f.k==='choice'||f.k==='yn'){const opts=f.k==='yn'?['No','Yes']:f.opts;let ex='';
      if(f.id==='cap'&&v){let nr='the nominated representative';try{const p=ptFind(pid)||{};nr=(ptIdentity(p)||{}).nr||(p.rel0||{}).name||nr;}catch(e){}
        ex=`<div class="o2-note">${v.startsWith('Yes')?'So the patient signs the consent.':'So '+E(nr)+' signs, with the patient involved as far as possible.'}${typeof window.acrCapNew==='function'&&!ro?` <button class="o2-lk" onclick="acrCapNew('${E(pid)}')">Record the capacity assessment</button>`:''}</div>`;}
      if(f.stop&&v===f.stop)ex+=`<div class="o2-note bad"><b>Stop.</b> ${E(f.stopText)}</div>`;
      if(f.want&&v&&v!==f.want)ex+=`<div class="o2-note warn"><b>Check.</b> This should be done before the order goes ahead.</div>`;
      return `<div class="o2-q">${L}<div class="o2-seg">${opts.map((x,i)=>`<button type="button" class="${v===x?'on':''}" onclick="o2Set(${args},${i})"${dis}>${E(x)}</button>`).join('')}</div>${ex}</div>`;}
    if(f.k==='multi'){const cur=v||f.pre||[];return `<div class="o2-q">${L}${f.pre&&!v?`<span class="small muted">${E(f.preNote)}</span>`:''}<div class="o2-seg wrap">${f.opts.map((x,i)=>`<button type="button" class="${cur.includes(x)?'on':''}" onclick="o2Multi(${args},${i})"${dis}>${E(x)}</button>`).join('')}</div></div>`;}
    if(f.k==='num'){const b=f.band?mmse(v):null;return `<div class="o2-q"><label class="o2-ql" for="${id}">${E(f.q)}</label><input class="input o2-in sm" type="number" inputmode="numeric" id="${id}" min="${f.min}" max="${f.max}" value="${E(v==null?'':v)}" oninput="o2Txt(${args},this)" onchange="o2Paint()"${dis}>${f.band?(b?`<div class="o2-note ${b[1]}"><b>${b[0]}</b> worked out from the score</div>`:'<span class="small muted">Cognition fills in from the score.</span>'):''}</div>`;}
    if(f.k==='psy'){const L2=psyNames(pid);if(v&&!L2.includes(v))L2.push(v);return `<div class="o2-q"><label class="o2-ql" for="${id}">${E(f.q)}</label><select class="input o2-in" id="${id}" onchange="o2Txt(${args},this);o2Paint()"${dis}><option value="">Select the psychiatrist</option>${L2.map(n=>`<option${n===v?' selected':''}>${E(n)}</option>`).join('')}</select></div>`;}
    if(f.k==='text')return `<div class="o2-q"><label class="o2-ql" for="${id}">${E(f.q)}${f.opt?' <span class="muted">(optional)</span>':''}</label><input class="input o2-in" type="text" id="${id}" value="${E(v==null?'':v)}" placeholder="${E(f.ph||'')}" oninput="o2Txt(${args},this)" onchange="o2Paint()"${dis}></div>`;
    if(f.k==='date'||f.k==='time')return `<div class="o2-q"><label class="o2-ql" for="${id}">${E(f.q)}</label><input class="input o2-in sm" type="${f.k}" id="${id}" value="${E(v==null?'':v)}" onchange="o2Txt(${args},this);o2Paint()"${dis}></div>`;
    if(f.k==='check')return `<label class="o2-check"><input type="checkbox" ${v?'checked':''} onchange="o2Chk(${args},this)"${dis}> <span>${E(f.q)}</span></label>`;
    if(f.k==='labs'){const r=v||{};return `<div class="o2-q"><span class="o2-ql">Results</span><table class="o2-lab"><thead><tr><th>Test</th><th>Result</th></tr></thead><tbody>${f.items.map((it,i)=>`<tr><td>${E(it)}</td><td><input class="input o2-in" value="${E(r[i]||'')}" placeholder="Result when it comes back" oninput="o2Lab(${args},${i},this)" onchange="o2Paint()"${dis}></td></tr>`).join('')}</tbody></table></div>`;}
    if(f.k==='form')return formField(pid,o,t,f,ro);
    if(f.k==='paper')return `<div class="o2-q"><span class="o2-ql">${E(f.q)}</span><div class="o2-form"><div><b>Signed on paper</b><div class="small ${v&&v.at?'o2-ok':'muted'}">${v&&v.at?'Uploaded '+E(v.file||'')+' · '+E(v.by)+' · '+E(v.at):'This consent form has not been received for the forms library yet. Take the consent on paper and upload the signed copy.'}</div></div>${ro?'':`<div class="o2-btns"><label class="btn sm ${v&&v.at?'':'pri'}" style="cursor:pointer">${v&&v.at?'Replace copy':'Upload signed copy'}<input type="file" hidden accept=".pdf,image/*" onchange="o2Paper(${args},this)"></label></div>`}</div></div>`;
    if(f.k==='stamp')return `<div class="o2-q"><span class="o2-ql">${E(f.q)}</span>${v&&v.at?`<div class="o2-note ok"><b>Signed</b> ${E(v.by)} · ${E(v.at)}</div>`:ro?'':`<div><button class="btn sm" onclick="o2Stamp(${args})">Sign as ${E(me())}</button></div>`}</div>`;
    return '';
  }
  function orderHtml(pid,o){
    const tp=tplOf(o),TT=tp.tasks,t=TT.find(x=>x.id===UI.task)||TT.find(x=>!(o.done||{})[x.id]&&!blocked(o,x))||TT[0],s=status(o),x=st(o,t),done=(o.done||{})[t.id];
    const ro=!!done||x==='l'||!!o.stopped,ok=canSave(pid,o,t),left=t.fields.filter(f=>!fieldOk(pid,o,t,f)).length;
    return `<button class="o2-lk" onclick="o2Back()">‹ Back to orders</button>
      <div class="o2-head"><div style="display:flex;gap:12px;align-items:flex-start"><span class="o2-ic big${tp.emergency?' em':''}">${ico(o.tpl,22)}</span><div><h3>${E(tp.name)}</h3><div class="small muted">Ordered by ${E(o.by)} · ${E(o.at)}. Each task shows who owns it. Tasks marked "waits" open when the rest are done.</div></div></div>
        <div class="o2-btns"><span class="o2-pill ${s[1]}">${E(s[0])}</span>${o.stopped||allDone(o)?'':`<button class="btn sm" onclick="o2Stop('${o.id}')">Stop order</button>`}</div></div>
      <div class="o2-wu"><div class="o2-tl">${o.tpl==='mect'?'<div class="o2-wul">Pre-ECT work-up</div>':''}${TT.map(k=>{const y=st(o,k);return `<button type="button" class="o2-task${k.id===t.id?' on':''}${y==='l'?' lock':''}" onclick="o2Task('${k.id}')"><span class="o2-tic ${y}">${y==='d'?'✓':y==='w'?'•':''}</span><span><b>${E(k.label)}</b><small>${E(k.role)}</small><small class="${y==='d'?'o2-ok':y==='w'?'o2-wait':''}">${y==='d'?'Done':y==='l'?(Array.isArray(k.waits)?'Waits for '+k.waits.map(w=>(TT.find(z=>z.id===w)||{}).label||w).join(', '):'Waits for the rest'):y==='w'?'In progress':'Not started'}</small></span></button>`;}).join('')}</div>
      <div class="o2-panel"><div class="o2-ph"><div><h4>${E(t.label)}</h4><div class="small muted">Owner: ${E(t.role)}${!isMine(t)&&!ro?' · you can fill it for them (one login per role)':''}</div></div><span class="o2-pill ${done?'green':x==='l'?'grey':x==='w'?'amber':'grey'}">${done?'Done':x==='l'?'Waits':x==='w'?'In progress':'Not started'}</span></div>
        <div class="o2-pb">${x==='l'?`<div class="o2-note warn"><b>Waits.</b> Opens when ${others(o,t).filter(y=>!(o.done||{})[y.id]).map(y=>E(y.label)).join(', ')} ${others(o,t).filter(y=>!(o.done||{})[y.id]).length>1?'are':'is'} done.</div>`:''}
          ${done?`<div class="o2-note ok"><b>Done</b> ${E(done.by)}${done.for&&done.for!=='Psychiatrist'?' for the '+E(done.for):''} · ${E(done.at)}</div>`:''}
          ${t.fields.map((f,i)=>fieldHtml(pid,o,t,f,i,ro)).join('')}
          ${t.next&&t.next.length?`<div class="o2-note"><b>${done?'Next steps':'After saving'}</b> ${t.next.map(E).join('. ')}.</div>`:''}</div>
        ${ro?'':`<div class="o2-pf"><span class="small muted">${ok?'All answered. Ready to save.':left+' '+(left===1?'question':'questions')+' left'}</span><button class="btn ${tp.emergency?'o2-red':'pri'}" onclick="o2Done('${o.id}','${t.id}')"${ok?'':' disabled'}>${t.waits?E(t.label):'Save'}</button></div>`}</div></div>${o.tpl==='mect'?ectHtml(pid,o):''}`;
  }
  /* 25 Nov (Anu): ECT progress. Once the first session is scheduled, each session day is recorded here in three parts:
     before (MMSE, bowel, bladder, nil by mouth), during (anaesthesia, current dose, seizure duration) and after (MMSE, confusion or
     side effects, hydration, any injection). Saved in the order as o.sess = [{n,date,by,at,pre,dur,post}]. Replaces the Peri-MECT and
     Post-MECT rows of the consent form's checklist (block 196). */
  const ECT=[['pre','Before the session',[['mmse','num','MMSE score',1],['bowel','yn','Bowel cleared'],['bladder','yn','Bladder emptied'],['npo','yn','Nil by mouth for 6 to 8 hours'],['vit','text','BP and pulse',1,'For example 124/80, 78']]],
    ['dur','During the session',[['an','text','Anaesthesia given (drug and dose)',0,'For example propofol 80 mg, succinylcholine 40 mg'],['cur','text','Current dose (stimulus)',0,'For example 50%, 252 mC'],['sz','num','Seizure duration (seconds)'],['ev','text','Events during the session',1,'None']]],
    ['post','After the session',[['mmse','num','MMSE score',1],['conf','multi','Confusion or side effects',0,['None','Confusion','Headache','Nausea or vomiting','Muscle pain','Memory complaints','Other']],['hyd','choice','Hydration',0,['Oral fluids taken','IV fluids given']],['inj','text','Any injection needed',1,'Drug, dose and why'],['note','text','Note',1]]]];
  const jq=v=>JSON.stringify(v).replace(/"/g,'&quot;');
  function ectLeft(F){let n=0;ECT.forEach(([p,,FL])=>FL.forEach(([k,typ,,opt])=>{if(opt)return;const v=(F[p]||{})[k];if(typ==='multi'?!(v||[]).length:v==null||String(v).trim()==='')n++;}));if(!F.date)n++;return n;}
  function ectHtml(pid,o){const sch=(o.done||{}).sched,A=(o.ans||{}).sched||{},L=o.sess||[],plan=+A.n||0,F=UI.ect&&UI.ect.oid===o.id?UI.ect:null;
    if(!sch)return `<div class="o2-ect"><div class="o2-ph"><div><h4>ECT sessions</h4><div class="small muted">Opens once the first session is scheduled.</div></div></div></div>`;
    const show=(r,k)=>{const v=(r||{})[k];return Array.isArray(v)?v.join(', '):v==null||v===''?'-':String(v);};
    const chk=x=>{const miss=['bowel','bladder','npo'].filter(k=>(x.pre||{})[k]!=='Yes');return miss.length?miss.map(k=>({bowel:'Bowel',bladder:'Bladder',npo:'NPO'})[k]).join(', ')+' not done':'All done';};
    const rows=L.map(x=>`<tr><td><b>${x.n}</b></td><td>${E(x.date||'')}</td><td>${E(show(x.pre,'mmse'))}</td><td>${E(chk(x))}</td><td>${E(show(x.dur,'an'))}</td><td>${E(show(x.dur,'cur'))}</td><td>${E(show(x.dur,'sz'))}${(x.dur||{}).sz?' s':''}</td><td>${E(show(x.post,'conf'))}</td><td>${E(show(x.post,'hyd'))}${(x.post||{}).inj?'<br><span class="small">Injection: '+E(x.post.inj)+'</span>':''}</td><td>${E(show(x.post,'mmse'))}</td><td class="small muted">${E(x.by)}<br>${E(x.at)}</td></tr>`).join('');
    const fld=(p,[k,typ,q,opt,x])=>{const id='ect_'+p+'_'+k,v=F?(F[p]||{})[k]:'';const lab=`<span class="o2-ql">${E(q)}${opt?' <span class="muted">(optional)</span>':''}</span>`;
      if(typ==='yn'||typ==='choice'){const O=typ==='yn'?['No','Yes']:x;return `<div class="o2-q">${lab}<div class="o2-seg">${O.map(z=>`<button type="button" class="${v===z?'on':''}" onclick="o2EctSet('${p}','${k}',${jq(z)})">${E(z)}</button>`).join('')}</div></div>`;}
      if(typ==='multi'){const c=v||[];return `<div class="o2-q">${lab}<div class="o2-seg wrap">${x.map(z=>`<button type="button" class="${c.includes(z)?'on':''}" onclick="o2EctMulti('${p}','${k}',${jq(z)})">${E(z)}</button>`).join('')}</div></div>`;}
      return `<div class="o2-q"><label class="o2-ql" for="${id}">${E(q)}${opt?' <span class="muted">(optional)</span>':''}</label><input class="input o2-in${typ==='num'?' sm':''}" type="${typ==='num'?'number':'text'}" id="${id}" value="${E(v==null?'':v)}" placeholder="${E(typeof x==='string'?x:'')}" oninput="o2EctTxt('${p}','${k}',this.value)"></div>`;};
    const n=F?ectLeft(F):0;
    const form=F?`<div class="o2-ectf"><div class="o2-ectd"><h4>Session ${F.n}</h4><input class="input o2-in sm" type="date" value="${E(F.date)}" onchange="o2EctTxt('','date',this.value)" aria-label="Session date"></div>
      <div class="o2-ectg">${ECT.map(([p,t,FL])=>`<div class="o2-ectc"><h5>${E(t)}</h5>${FL.map(z=>fld(p,z)).join('')}</div>`).join('')}</div>
      <div class="o2-pf"><span class="small muted">${n?n+' left':'Ready to save.'}</span><span class="o2-btns"><button class="btn" onclick="o2EctCancel()">Cancel</button><button class="btn pri" onclick="o2EctSave('${o.id}')"${n?' disabled':''}>Save session ${F.n}</button></span></div></div>`:'';
    return `<div class="o2-ect"><div class="o2-ph"><div><h4>ECT sessions</h4><div class="small muted">${L.length} of ${plan||'?'} recorded · first session ${E(A.day||'')} ${E(A.time||'')}</div></div>${F||o.stopped?'':`<button class="btn sm pri" onclick="o2EctNew('${o.id}')">Record session ${L.length+1}</button>`}</div>
      ${form}${L.length?`<div class="o2-ectw"><table class="o2-lab o2-ectt"><thead><tr><th>No.</th><th>Date</th><th>MMSE before</th><th>Bowel, bladder, NPO</th><th>Anaesthesia</th><th>Current dose</th><th>Seizure</th><th>Side effects</th><th>Hydration</th><th>MMSE after</th><th>By</th></tr></thead><tbody>${rows}</tbody></table></div>`:F?'':'<div class="small muted" style="padding:4px 16px 14px">No session recorded yet.</div>'}</div>`;}
  window.o2EctNew=function(oid){const [,o]=cur(oid);if(!o)return;const d=new Date();UI.ect={oid,n:(o.sess||[]).length+1,date:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),pre:{},dur:{},post:{}};o2Paint();};
  window.o2EctCancel=function(){UI.ect=null;o2Paint();};
  window.o2EctSet=function(p,k,v){const F=UI.ect;if(!F)return;F[p][k]=F[p][k]===v?'':v;o2Paint();};
  window.o2EctMulti=function(p,k,v){const F=UI.ect;if(!F)return;let c=[...(F[p][k]||[])];if(v==='None')c=c.includes('None')?[]:['None'];else{c=c.filter(y=>y!=='None');c=c.includes(v)?c.filter(y=>y!==v):[...c,v];}F[p][k]=c;o2Paint();};
  window.o2EctTxt=function(p,k,v){const F=UI.ect;if(!F)return;if(p)F[p][k]=v;else F[k]=v;const pf=document.querySelector('.o2-ectf .o2-pf');if(pf){const n=ectLeft(F);pf.querySelector('.small').textContent=n?n+' left':'Ready to save.';pf.querySelector('.btn.pri').disabled=!!n;}};
  window.o2EctSave=function(oid){const [,o]=cur(oid),F=UI.ect;if(!o||!F||ectLeft(F))return;o.sess=o.sess||[];o.sess.push({n:F.n,date:F.date,by:me(),at:atNow(),pre:F.pre,dur:F.dur,post:F.post});UI.ect=null;save();try{toast('Session '+F.n+' saved');}catch(e){}};

  const html=pid=>{const o=UI.view==='order'&&find(pid,UI.oid);return o?orderHtml(pid,o):listHtml(pid);};

  /* ---------- actions ---------- */
  const cur=(oid)=>{const pid=pidNow();return [pid,find(pid,oid)];};
  const fOf=(o,tid,fi)=>{const t=tplOf(o).tasks.find(x=>x.id===tid);return [t,t&&t.fields[fi]];};
  window.o2Paint=function(){const r=document.getElementById('o2Root');if(r)r.innerHTML=html(pidNow());};
  const save=()=>{try{render();}catch(e){o2Paint();}};
  window.o2Open=function(oid,tid){UI.view='order';UI.oid=oid;UI.task=tid||'';o2Paint();const r=document.getElementById('o2Root');if(r)r.scrollIntoView({block:'start',behavior:'smooth'});};
  window.o2Back=function(){UI.view='list';UI.oid='';UI.task='';o2Paint();};
  window.o2Task=function(tid){UI.task=tid;o2Paint();};
  window.o2Set=function(oid,tid,fi,i){const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(!f)return;const opts=f.k==='yn'?['No','Yes']:f.opts;ansOf(o,tid)[f.id]=opts[i];save();};
  window.o2Multi=function(oid,tid,fi,i){const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(!f)return;const A=ansOf(o,tid),x=f.opts[i];let c=[...(A[f.id]||f.pre||[])];
    if(x==='None')c=['None'];else{c=c.filter(y=>y!=='None');c=c.includes(x)?c.filter(y=>y!==x):[...c,x];}A[f.id]=c;save();};
  window.o2Txt=function(oid,tid,fi,el){const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(f)ansOf(o,tid)[f.id]=el.value;};
  window.o2Chk=function(oid,tid,fi,el){const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(f)ansOf(o,tid)[f.id]=!!el.checked;save();};
  window.o2Lab=function(oid,tid,fi,i,el){const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(!f)return;const A=ansOf(o,tid);A[f.id]=Object.assign({},A[f.id]||{});A[f.id][i]=el.value;};
  window.o2Stamp=function(oid,tid,fi){const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(f)ansOf(o,tid)[f.id]={by:me(),at:atNow()};save();};
  const fileOk=f=>{if(!f)return false;if(f.size>10*1048576){toast(f.name+' is over 10 MB and was not added');return false;}return true;};
  window.o2Paper=function(oid,tid,fi,inp){const fl=inp.files&&inp.files[0];if(!fileOk(fl))return;const [,o]=cur(oid);if(!o)return;const [,f]=fOf(o,tid,fi);if(f)ansOf(o,tid)[f.id]={file:fl.name,by:me(),at:atNow()};inp.value='';save();toast('Signed copy added: '+fl.name);};
  window.o2FormUp=function(pid,fid,inp){const fl=inp.files&&inp.files[0];if(!fileOk(fl))return;const x=px(pid);x.consent=x.consent||{};x.consent[fid]=Object.assign({},x.consent[fid]||{},{st:'uploaded',at:atNow(),file:fl.name,by:me()});inp.value='';save();toast('Signed copy added: '+fl.name);};
  window.o2Done=function(oid,tid){const [pid,o]=cur(oid);if(!o)return;const t=tplOf(o).tasks.find(x=>x.id===tid);if(!t||!canSave(pid,o,t))return;
    o.done=o.done||{};o.done[tid]={by:me(),at:atNow(),for:t.role};
    try{V3.log(pid,S.role,'event',tplOf(o).name+': '+t.label+' saved');}catch(e){}
    const nx=tplOf(o).tasks.find(x=>!o.done[x.id]&&!blocked(o,x));UI.task=nx?nx.id:tid;save();toast(t.label+' saved');};
  window.o2Stop=function(oid){const [,o]=cur(oid);if(!o)return;o.stopped={by:me(),at:atNow()};save();toast(tplOf(o).name+' stopped');};
  window.o2New=function(key){const pid=pidNow(),tp=T[key];if(!pid||!tp)return;
    const ex=orders(pid).find(o=>o.tpl===key&&!o.stopped&&!allDone(o));
    try{closeModal();}catch(e){}
    if(ex){o2Open(ex.id);toast(tp.name+' is already in progress');return;}
    const o={id:'o'+Date.now(),tpl:key,at:atNow(),by:me(),ans:{},done:{}};orders(pid).unshift(o);
    UI.view='order';UI.oid=o.id;UI.task=(tp.tasks.find(isMine)||tp.tasks[0]).id;
    try{V3.log(pid,S.role,'event',tp.name+' ordered');}catch(e){}save();toast(tp.name+' ordered');};
  window.o2Pick=function(){const pid=pidNow(),act=orders(pid).filter(o=>!o.stopped&&!allDone(o)).map(o=>o.tpl),G={};
    Object.entries(T).forEach(([k,t])=>{(G[t.group]=G[t.group]||[]).push([k,t]);});
    V3.modal('New order','Each order brings its own tasks, owners and consent.',
      Object.entries(G).map(([g,l])=>`<div class="o2-pg"><h4 class="${g==='Emergency'?'red':''}">${E(g)}</h4>${l.map(([k,t])=>{const on=act.includes(k);return `<button type="button" class="o2-opt" onclick="o2New('${k}')"><span class="o2-ic${t.emergency?' em':''}">${ico(k)}</span><span style="flex:1"><b>${E(t.name)}</b><small>${E(t.desc)} · ${t.tasks.length} tasks</small></span><span class="o2-pill ${on?'grey':t.emergency?'red':'blue'}">${on?'In progress, open':t.emergency?'Start now':'Order'}</span></button>`;}).join('')}</div>`).join(''),
      '<button class="btn" onclick="closeModal()">Close</button>','min(640px,96vw)');};

  /* ---------- styles: the portal's own look ---------- */
  const css=document.createElement('style');css.id='o2-css';
  css.textContent='#o2Root{display:flex;flex-direction:column;gap:12px}'
    +'.o2-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.o2-head h3{margin:0 0 4px}'
    +'.o2-btns{display:flex;gap:8px;flex-wrap:wrap;align-items:center}'
    +'.o2-red{background:#d92d20!important;border-color:#d92d20!important;color:#fff!important}.o2-hb{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 16px;font-size:14px;font-weight:600;border-radius:10px;box-sizing:border-box}.o2-rn{color:#b42318!important}.o2-rn svg{flex:none}'
    +'.o2-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}@media(max-width:760px){.o2-kpis{grid-template-columns:1fr}}'
    +'.o2-kpi{display:flex;gap:12px;align-items:center;border:1px solid #e4e7ec;border-radius:12px;background:#fff;padding:12px 14px}.o2-kpi .n{font-size:26px;font-weight:700;color:#667085;min-width:26px}.o2-kpi .n.amber{color:#b54708}.o2-kpi .n.blue{color:#1e6cdb}.o2-kpi .n.red{color:#b42318}.o2-kpi b{display:block;font-size:14px}'
    +'.o2-sec{display:flex;align-items:baseline;gap:10px;margin-top:6px}.o2-sec h4{margin:0;font-size:15px}'
    +'.o2-card{border:1px solid #e4e7ec;border-radius:12px;background:#fff;padding:14px 16px;display:flex;flex-direction:column;gap:12px}.o2-card.em{border-color:#fda29b}'
    +'.o2-top{display:flex;gap:12px;align-items:center}.o2-tt{flex:1;min-width:0}.o2-tt b{font-size:15px}'
    +'.o2-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none;background:#eff4ff;color:#1e6cdb}.o2-ic.em{background:#fef3f2;color:#b42318}.o2-ic.big{width:46px;height:46px;border-radius:12px}'
    +'.o2-pill{font-size:12px;font-weight:600;border-radius:99px;padding:3px 10px;white-space:nowrap;background:#f2f4f7;color:#475467}.o2-pill.green{background:#ecfdf3;color:#067647}.o2-pill.amber{background:#fffaeb;color:#b54708}.o2-pill.red{background:#fef3f2;color:#b42318}.o2-pill.blue{background:#eff4ff;color:#1849a9}'
    +'.o2-steps{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}.o2-step{flex:1 0 130px;display:flex;gap:8px;align-items:flex-start;border:1px solid #eaecf0;border-radius:10px;padding:8px 10px;font-size:12.5px}'
    +'.o2-step .l{font-weight:600;color:#101828;display:block}.o2-step .r{color:#667085;font-size:12px}.o2-dot{width:16px;height:16px;border-radius:50%;border:1.5px solid #98a2b3;flex:none;display:grid;place-items:center;font-size:10px;margin-top:1px}'
    +'.o2-step.d .o2-dot{background:#079455;border-color:#079455;color:#fff}.o2-step.w .o2-dot{border-color:#dc6803;background:#fffaeb}.o2-step.l{opacity:.6}'
    +'.o2-act{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #f2f4f7;padding-top:10px}.o2-msg{font-size:13.5px}.o2-msg.red{color:#b42318}.o2-msg.ok{color:#067647}'
    +'.o2-empty,.o2-box{border:1px solid #e4e7ec;border-radius:12px;background:#fff}.o2-empty{padding:14px 16px}.o2-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 16px;border-top:1px solid #f2f4f7}.o2-row:first-child{border-top:0}'
    +'.o2-lk{all:unset;cursor:pointer;color:#1e6cdb;font-weight:600;font-size:13.5px;align-self:flex-start}.o2-lk:hover{text-decoration:underline}.o2-lk:focus-visible{outline:2px solid #1e6cdb;border-radius:4px}'
    +'.o2-wu{display:grid;grid-template-columns:260px minmax(0,1fr);gap:14px;align-items:start}@media(max-width:860px){.o2-wu{grid-template-columns:1fr}}'
    +'.o2-wul{padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#475467;background:#f9fafb;border-bottom:1px solid #e4e7ec}.o2-ect{margin-top:16px;border:1px solid #e4e7ec;border-radius:12px;background:#fff}.o2-ect>.o2-ph{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px}.o2-ectf{border-top:1px solid #e4e7ec;padding:14px 16px}.o2-ectd{display:flex;align-items:center;gap:12px;margin-bottom:10px}.o2-ectd h4{margin:0}.o2-ectg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.o2-ectc{border:1px solid #eaecf0;border-radius:10px;padding:12px}.o2-ectc h5{margin:0 0 8px;font-size:14px}.o2-ectw{overflow-x:auto;padding:0 16px 14px}.o2-ectt{min-width:900px}@media(max-width:1000px){.o2-ectg{grid-template-columns:1fr}}'
    +'.o2-tl{border:1px solid #e4e7ec;border-radius:12px;background:#fff;overflow:hidden}.o2-task{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:10px;align-items:flex-start;width:100%;padding:11px 14px;border-top:1px solid #f2f4f7}.o2-task:first-child{border-top:0}'
    +'.o2-task b{display:block;font-size:13.5px}.o2-task small{display:block;font-size:12px;color:#667085}.o2-task.on{background:#eff4ff;box-shadow:inset 3px 0 0 #1e6cdb}.o2-task.lock{opacity:.65}.o2-task:focus-visible{outline:2px solid #1e6cdb;outline-offset:-2px}'
    +'.o2-tic{width:20px;height:20px;border-radius:50%;border:1.5px solid #98a2b3;flex:none;display:grid;place-items:center;font-size:11px;margin-top:1px}.o2-tic.d{background:#079455;border-color:#079455;color:#fff}.o2-tic.w{border-color:#dc6803;color:#dc6803}'
    +'.o2-ok{color:#067647!important}.o2-wait{color:#b54708!important}'
    +'.o2-panel{border:1px solid #e4e7ec;border-radius:12px;background:#fff}.o2-ph{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:14px 18px;border-bottom:1px solid #f2f4f7}.o2-ph h4{margin:0 0 3px;font-size:16px}'
    +'.o2-pb{padding:16px 18px;display:flex;flex-direction:column;gap:16px}.o2-pf{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 18px;border-top:1px solid #f2f4f7}'
    +'.o2-q{display:flex;flex-direction:column;gap:7px}.o2-ql{font-size:14px;font-weight:600;color:#101828}.o2-in{max-width:520px}.o2-in.sm{max-width:220px}'
    +'.o2-seg{display:flex;gap:6px;flex-wrap:wrap}.o2-seg button{font:inherit;font-size:13.5px;padding:7px 13px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;color:#344054;cursor:pointer}.o2-seg button:hover:not(:disabled){border-color:#84adff}'
    +'.o2-seg button.on{background:#eff4ff;border-color:#1e6cdb;color:#1849a9;font-weight:600}.o2-seg button:disabled{cursor:default;opacity:.75}.o2-seg button:focus-visible{outline:2px solid #1e6cdb;outline-offset:1px}'
    +'.o2-check{display:flex;gap:10px;align-items:flex-start;font-size:14px;cursor:pointer}.o2-check input{width:18px;height:18px;margin-top:1px}'
    +'.o2-note{font-size:13px;line-height:1.45;padding:9px 12px;border-radius:8px;background:#f9fafb;border:1px solid #eaecf0;color:#344054}.o2-note.ok{background:#ecfdf3;border-color:#abefc6;color:#067647}.o2-note.warn{background:#fffaeb;border-color:#fedf89;color:#93370d}.o2-note.bad{background:#fef3f2;border-color:#fecdca;color:#b42318}'
    +'.o2-form{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;border:1px solid #e4e7ec;border-radius:10px;padding:12px 14px;background:#fcfcfd}'
    +'.o2-lab{border-collapse:collapse;width:100%;max-width:620px}.o2-lab th,.o2-lab td{text-align:left;padding:6px 8px;border-bottom:1px solid #f2f4f7;font-size:13.5px}.o2-lab th{font-size:12px;color:#667085;font-weight:600}.o2-lab .o2-in{max-width:none;width:100%}'
    +'.o2-pg{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.o2-pg h4{margin:0;font-size:13px;color:#475467}.o2-pg h4.red{color:#b42318}'
    +'.o2-opt{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:12px;align-items:center;width:100%;padding:10px 12px;border:1px solid #e4e7ec;border-radius:10px;background:#fff}.o2-opt:hover{border-color:#84adff}.o2-opt:focus-visible{outline:2px solid #1e6cdb}.o2-opt small{display:block;font-size:12px;color:#667085}';
  document.head.appendChild(css);

  /* ---------- swap the panel body ---------- */
  const __vp=vPatient;
  vPatient=function(sub){
    let h=__vp.apply(this,arguments);if(typeof h!=='string'||h.indexOf('psy-tx-panel')<0)return h;
    try{const t=document.createElement('template');t.innerHTML=h;let ch=false;const pid=pidNow();
      t.content.querySelectorAll('.psy-tx-panel').forEach(p=>{const hh=p.querySelector('h3');if(!hh||!/^Orders and Consents$/i.test(hh.textContent.trim()))return;
        const head=p.querySelector('.psy-tx-head');if(head)head.style.display='none';
        hh.textContent='Orders and consents';  /* block 70 only adds its old log to "Orders and Consents" */
        const body=p.querySelector('.psy-tx-body');if(!body)return;body.innerHTML='<div id="o2Root">'+html(pid)+'</div>';ch=true;});
      if(ch)h=t.innerHTML;}catch(e){try{console.warn('orders 198',e);}catch(_){}}
    return h;
  };
  /* a new patient opens on the list */
  let lastPid='';const __r=render;render=function(){const p=pidNow();if(p!==lastPid){lastPid=p;UI.view='list';UI.oid='';UI.task='';}return __r.apply(this,arguments);};
})();
