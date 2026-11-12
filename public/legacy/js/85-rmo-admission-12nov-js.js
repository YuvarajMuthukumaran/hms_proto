/* 12 Nov 2026, Trello cards 125 to 129 (RMO) and the shared New admission flow (127).
   125 Shift handover is automatic at duty end for every RMO (and a shared rule the nurse side can plug into): built 30 minutes before duty end from open items,
       the outgoing person reviews, adds a line and signs, the incoming RMO accepts from a banner on Today.
   126 The RMO sees all inpatients on all floors (floor filter, default All floors), "All inpatients".
   127 New admission starts a real admission: registered by front desk or register here (same phone = same UHID), ward and bed, psychiatrist, section,
       admission forms (taken by), RMO must record the call to the on-call psychiatrist, then straight into the workup.
   128 The RMO cannot approve orders: they are read only "waiting for psychiatrist countersign".
   129 The RMO Today shows only RMO alerts (critical, clinical event, medication issue, investigation watch, admission workup, shift handover, orders watch).
   Prototype: demo clock and data, nothing is sent. */
(function(){
  const role=()=>String((window.__TULASI__||{}).role||'');
  const isRmo=()=>role()==='rmo';
  const doc=()=>S.role==='psychiatrist'&&/^(psychiatrist|floor-lead-psychiatrist|rmo)$/.test(role());
  const A=()=>S.sh||(S.sh={clock:null,signed:null,accepted:false,note:'',adm:null});

  /* ---------------- 126: all inpatients for the RMO ---------------- */
  window.rmoAllPts=()=>isRmo()?allPts():PTS;
  const __vInp=vInpatients;
  vInpatients=function(){
    if(!(isRmo()&&S.role==='psychiatrist'))return __vInp.apply(this,arguments);
    rmoInit();S.rmoFloor=S.rmoFloor||'All floors';
    return String(vRmoWards()).split('Ward inpatients').join('All inpatients');
  };

  /* ---------------- 128 / 129: what the RMO sees on Today ---------------- */
  const __tasks=tasks;
  tasks=function(){
    const r=__tasks.apply(this,arguments);
    if(!(isRmo()&&S.role==='psychiatrist')||!Array.isArray(r))return r;
    /* psychiatrist work is not an RMO job: capacity, history, discharge summary, advance directive, grievance, MHCA, notes, family calls */
    return r.filter(t=>!/capacity|history|discharge summary|advance directive|grievance|mhca|family call|daily note|management plan|legal|section|nominated/i.test(String(t.title||'')+' '+String(t.meta||'')));
  };
  const __extra=window.psyExtraItems;
  window.psyExtraItems=function(p){
    const base=__extra?__extra.apply(this,arguments):[];
    if(!(isRmo()&&S.role==='psychiatrist'))return base;
    /* keep results (RMO only watches) and drop observation review, which is psychiatrist work */
    const out=base.filter(i=>/result|lab|investigation/i.test(String(i.lab&&i.lab[1])+' '+String(i.txt)));
    out.forEach(i=>{if(/result|lab/i.test(String(i.lab&&i.lab[1])+i.txt))i.lab=['amber','Investigation'];i.btn=i.btn;});
    if((+p.day||0)<=1){out.push({k:'admit',lab:['grey','Admission workup'],txt:'New admission this shift · workup and admission note to sign',due:'',btn:['Open workup',"go('#/patient/"+p.id+"/admission')",false]});}
    return out;
  };
  /* orders the RMO wrote: read only for the RMO */
  const __appr=window.psyApprove;
  window.psyApprove=function(id){if(isRmo()){toast('Only the treating psychiatrist can approve. If they are off, the on-call psychiatrist or the floor lead.');return;}return __appr.apply(this,arguments);};
  const __cs=V3.countersign;
  V3.countersign=function(id){if(isRmo()){toast('The RMO cannot approve orders. Waiting for the psychiatrist.');return;}return __cs.apply(this,arguments);};
  function rmoClean(){
    if(!(isRmo()&&S.role==='psychiatrist'))return;
    const v=document.getElementById('view');
    if(v)v.querySelectorAll('.pd-d span').forEach(s=>{if(/Countersign within/i.test(s.textContent)&&!s.dataset.ro){s.dataset.ro='1';const m=s.textContent.match(/(\d+)\s*h left/);s.textContent=s.textContent.replace(/·?\s*Countersign within 24 h\s*·?\s*(\d+ h left)?/i,'').trim()+' · waiting for psychiatrist countersign'+(m?' · '+m[1]+' h left':'');}});
    document.querySelectorAll('#pdMenu .pdm-i').forEach(b=>{if(/^\s*Approve/.test(b.textContent))b.remove();});
    document.querySelectorAll('.pd-det .pd-di').forEach(d=>{[...d.querySelectorAll('button')].forEach(b=>{if(/^Approve$/.test(b.textContent.trim()))b.remove();});
      const chip=d.querySelector('.pd-chip');if(chip&&/^Approve$/.test(chip.textContent.trim()))chip.textContent='Waiting for psychiatrist';});
    v&&v.querySelectorAll('.pd-ty').forEach(t=>{if(/^Approve$/i.test(t.textContent.trim()))t.textContent='Watch';});
  }
  new MutationObserver(()=>{try{rmoClean();}catch(e){}}).observe(document.body,{childList:true,subtree:true});

  /* ---------------- 125: shift handover, automatic ---------------- */
  const SHIFT={day:{name:'Day',end:20},night:{name:'Night',end:8}};
  const clockMs=()=>Date.now()+((S.au||{}).skip||0)*3600000;
  const shiftNow=()=>{const h=new Date(clockMs()).getHours();return h>=8&&h<20?SHIFT.day:SHIFT.night;};
  const endMs=()=>{const d=new Date(clockMs()),e=shiftNow().end;const t=new Date(d);t.setMinutes(0,0,0);t.setHours(e);if(t<=d)t.setDate(t.getDate()+1);return t.getTime();};
  const minsLeft=()=>Math.round((endMs()-clockMs())/60000);
  const dueNow=()=>minsLeft()<=30;
  function buildHandover(){
    const p=pid=>(PTS.concat(typeof PTS_F!=='undefined'?PTS_F:[],typeof PTS_D!=='undefined'?PTS_D:[]).find(x=>x.id===pid)||{name:pid});
    const al=(v3().alerts||[]).filter(a=>!a.closed).sort((a,b)=>(a.sev==='urgent'?0:1)-(b.sev==='urgent'?0:1));
    const od=(v3().orders||[]).filter(o=>!o.cs);
    const adm=PTS.filter(x=>(+x.day||0)<=1);
    const sos=[['Varun Rao','Lorazepam 1 mg SOS given at 1:20 am, effective'],['Tarun Roy','Haloperidol 5 mg IM given at 11:05 pm after aggression']];
    const res=(v3().labs||[]).filter(l=>!l.rev);
    const out=[['Open alerts (red first)',al.map(a=>({t:a.title+' · '+p(a.pid).name,red:a.sev==='urgent'}))],['Orders waiting for psychiatrist countersign',od.map(o=>({t:o.text+' · '+p(o.pid).name+' · '+(window.psyOrderLeft?psyOrderLeft(o.id):'')}))],
      ['Admissions this shift',adm.map(x=>({t:x.name+' · '+x.room+' · '+(x.day===0?'today':'yesterday')}))],['SOS doses given',sos.map(s=>({t:s[0]+': '+s[1]}))],['Results back',res.map(l=>({t:l.test+' · '+p(l.pid).name}))],['Patients out of ward',[{t:'Dev Kumar · accompanied walk in the garden until 5 pm'}]]];
    return out;
  }
  function sections(){return buildHandover().map(s=>`<div style="margin-bottom:12px"><div class="lbl">${hesc(s[0])} <span class="tiny muted">· ${s[1].length}</span></div>${s[1].length?s[1].map(i=>`<div class="small" style="padding:4px 0;${i.red?'color:#b42318;font-weight:600':''}">${hesc(i.t)}</div>`).join(''):'<div class="small muted">None</div>'}</div>`).join('');}
  window.shiftChip=function(h){const a=A();a.clock=h;render();};
  window.shiftSign=function(){const a=A();a.note=(($('shNote')||{}).value||a.note||'').trim();
    pinSign('Sign the '+shiftNow().name.toLowerCase()+' shift handover',[['Signing as',signer()],['Alerts passed on',String(buildHandover()[0][1].length)]],()=>{a.signed={by:signer(),at:atNow(),shift:shiftNow().name};a.accepted=false;render();toast('Handover signed. The incoming RMO sees it on Today.');});};
  window.shiftAccept=function(){const a=A();a.accepted=true;render();toast('Handover accepted. Open alerts are now yours.');};
  function shiftPage(){
    $('title').textContent='Shift handover';const a=A(),mn=minsLeft();
    return `<section class="card"><div class="hd"><div><h3>Shift handover · ${shiftNow().name} shift</h3><div class="small muted" style="margin-top:4px">Built automatically 30 minutes before duty end from open items. Open alerts belong to the role on duty, so they move to the incoming RMO on their own. You only review, add a line and sign.</div></div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="tiny muted">Demo time</span>${[[null,'Now'],[19.5,'30 min before end']].map(x=>`<button class="btn sm ${((a.clock===x[0])?'pri':'')}" onclick="shiftChip(${x[0]})">${x[1]}</button>`).join('')}</div></div>
      <div class="pad">${(dueNow()||a.clock!=null)?`<div class="callout blue" style="margin-bottom:12px">Duty ends ${mn>0?'in '+mn+' minutes':'now'}. This handover was built for you.</div>${sections()}
        <label class="field"><span class="lbl">Add a line if needed</span><textarea class="input" id="shNote" rows="2" placeholder="For the incoming RMO">${hesc(a.note||'')}</textarea></label>
        <div class="row" style="justify-content:flex-end;gap:8px;margin-top:10px">${a.signed?`<span class="chip c-green">Signed by ${hesc(a.signed.by)}, ${hesc(a.signed.at)}</span>`:`<button class="btn pri" onclick="shiftSign()">Review and sign</button>`}</div>`
        :`<div class="small muted">Duty ends in ${Math.floor(mn/60)} h ${mn%60} m. The handover is built 30 minutes before. Nothing to pick: no doctor, no patients, no reason.</div><div style="margin-top:12px"><div class="lbl">What it will contain (so far)</div>${sections()}</div>`}</div></section>`;
  }
  const __hoPage=window.psyHandoverPage;
  window.psyHandoverPage=function(){return (isRmo()&&S.role==='psychiatrist')?shiftPage():(__hoPage?__hoPage.apply(this,arguments):'');};
  /* incoming banner on Today (same look as the psychiatrist's "handed over to you" banner) */
  function shiftBanner(){
    if(!(isRmo()&&S.role==='psychiatrist')||!/^#\/myday/.test(location.hash||''))return;
    const v=document.getElementById('view'),a=A();if(!v||v.querySelector('#shBanner'))return;
    /* the psychiatrist's leave handover banner is not for shift roles */
    const old=v.querySelector('.hv-rc');if(old)old.remove();
    if(a.clock==null&&!a.signed)return;
    const el=document.createElement('section');el.id='shBanner';el.className='card';el.style.cssText='margin-bottom:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-left:4px solid #1e6cdb';
    el.innerHTML=a.signed?`<div><b>${hesc(a.signed.shift)} shift handover</b> · signed by ${hesc(a.signed.by)} · ${buildHandover()[0][1].length} open alerts, ${buildHandover()[1][1].length} orders waiting</div><div style="display:flex;gap:8px"><button class="btn" onclick="go('#/handover')">View</button>${a.accepted?'<span class="chip c-green">Accepted</span>':'<button class="btn pri" onclick="shiftAccept()">Accept</button>'}</div>`
      :`<div><b>Shift handover is ready to sign</b> · duty ends soon</div><button class="btn pri" onclick="go('#/handover')">Review and sign</button>`;
    v.insertBefore(el,v.firstChild);}
  /* the treating psychiatrist sees what happened to their patients on the shift */
  const __t2=tasks;
  tasks=function(){const r=__t2.apply(this,arguments);if(!Array.isArray(r)||isRmo()||S.role!=='psychiatrist'||!A().signed)return r;
    if(!r.some(t=>t.id==='sh_ps'))r.push({id:'sh_ps',late:false,title:'RMO shift handover · Varun Rao, Tarun Roy',meta:'On your patients this shift: a nausea order and an IM sedation, both waiting for your countersign',due:'Today',go:'#/myday',lead:false});return r;};

  /* ---------------- 127: New admission, one flow ---------------- */
  const WAIT=[{id:'w1',name:'Anil Chopra',age:44,sex:'M',phone:'98100 11122',by:'Meena Arora, front desk'},{id:'w2',name:'Pooja Nair',age:29,sex:'F',phone:'99100 55511',by:'Meena Arora, front desk'}];
  const KNOWN=[{phone:'98188 00051',name:'Shalini Mehta',uhid:'2026-27RG6812'},{phone:'98110 00024',name:'Anjali Bose',uhid:'2026-27RG6988'}];
  const BEDS={'Male ward':['Room 218','Room 219','Room 220'],'Female ward':['Room 314','Room 315'],'De-addiction ward':['Room 118','Room 119']};
  const adm=()=>{const s=A();if(!s.adm)s.adm={step:1,pick:null,reg:{name:'',age:'',sex:'M',addr:'',phone:''},ward:'Male ward',bed:'',psy:'Dr. Aanya Sharma',sec:'89',forms:{consent:'',forme:'',risk:''},ad:'',call:{who:'',at:'',advice:''},err:''};return s.adm;};
  const STEPS=['Patient','Ward and bed','Admission forms','Confirm'];
  window.admBack=function(){const a=adm();if(a.step>1)a.step--;a.err='';render();};
  window.admSet=function(k,v){const a=adm();const p=k.split('.');if(p.length===2)a[p[0]][p[1]]=v;else a[k]=v;};
  window.admPick=function(id){const a=adm();a.pick=id;a.step=2;a.err='';render();};
  window.admRegister=function(){const a=adm(),r=a.reg;['name','age','phone'].forEach(k=>{const e=$('ar_'+k);if(e)r[k]=e.value.trim();});['addr'].forEach(k=>{const e=$('ar_'+k);if(e)r[k]=e.value.trim();});const sx=$('ar_sex');if(sx)r.sex=sx.value;
    if(!r.name||!r.age||!r.phone||!r.addr){a.err='Name, age or date of birth, address and phone are needed for a UHID.';render();return;}
    const k=KNOWN.find(x=>x.phone.replace(/\D/g,'')===r.phone.replace(/\D/g,''));
    if(k){a.match=k;a.err='';render();return;}
    a.pick='new';a.step=2;a.err='';render();};
  window.admUseExisting=function(){const a=adm();a.pick='old';a.step=2;render();};
  window.admForm=function(k,mode){adm().forms[k]=mode;render();};
  window.admNext=function(){const a=adm();a.err='';
    if(a.step===2){const e=$('ad_bed');a.bed=e?e.value:a.bed;if(!a.bed){a.err='Pick a bed.';render();return;}}
    if(a.step===3){if(!a.ad){a.err='Ask about an advance directive and record the answer (MHCA requires it at admission).';render();return;}
      if(!a.forms.consent||!a.forms.forme||!a.forms.risk){a.err='Say who took each form: front desk, e-sign by you, or an upload of the signed paper.';render();return;}
      if(isRmo()){const w=$('ac_who'),t=$('ac_at'),d=$('ac_adv');a.call={who:w?w.value.trim():a.call.who,at:t?t.value.trim():a.call.at,advice:d?d.value.trim():a.call.advice};if(!a.call.who||!a.call.at||!a.call.advice){a.err='Record the call to the on-call psychiatrist: who, what time, and the advice in one line.';render();return;}}}
    a.step++;render();};
  window.admSave=function(){const a=adm();
    const who=signer(),nm=a.pick==='new'?a.reg.name:a.pick==='old'?a.match.name:(WAIT.find(x=>x.id===a.pick)||{}).name,id='adm'+Date.now().toString(36).slice(-4),ini=String(nm).split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const w=WAIT.find(x=>x.id===a.pick)||{},age=+(a.pick==='new'?a.reg.age:w.age)||35,sex=a.pick==='new'?a.reg.sex:(w.sex||'M');
    const uhid=a.pick==='old'?a.match.uhid:'2026-27RG'+(7100+Math.floor(Math.random()*800));
    const p={id,name:nm,ini,room:a.bed,day:0,sec:a.sec,risk:false,dx:'Admitted today',age,sex,uhid};
    const fl=a.ward;PTS.push(p);try{(WARDS[fl]||WARDS['Male ward']).push(p);}catch(e){}
    EX[id]=['Routine','Workup · today','Not set'];PSYOF[id]=a.psy;PSYCHOF[id]='';
    const doctorTook=Object.values(a.forms).some(v=>v!=='front');
    S.admVerify=S.admVerify||[];if(doctorTook||a.pick==='new')S.admVerify.push({id,name:nm,by:who});
    const x=psyPx(id);x.admBy={by:who,at:atNow(),psy:a.psy,call:isRmo()?a.call:null,forms:Object.assign({},a.forms)};
    try{mhcaAd(id,a.ad);}catch(e){}
    S.sh.adm=null;go('#/patient/'+id+'/admission');toast('Admission started for '+nm+'. The workup is open. Capacity, history (72 h), 24 h family call and countersign tasks are created.');};
  const field=(l,id,v,ph,type)=>`<label class="field"><span class="lbl">${l}</span><input class="input" id="${id}" value="${hesc(v||'')}" ${ph?`placeholder="${ph}"`:''} ${type?`type="${type}"`:''}></label>`;
  function admPage(){
    $('title').textContent='New admission';const a=adm();
    const stepBar=`<div class="row" style="gap:6px;margin-bottom:12px;flex-wrap:wrap">${STEPS.map((s,i)=>`<span class="chip ${a.step===i+1?'c-blue':a.step>i+1?'c-green':'c-grey'}">${i+1}. ${s}</span>`).join('')}</div>`;
    let body='';
    if(a.step===1){
      body=`<div class="lbl">Registered by the front desk, waiting for workup</div>${WAIT.map(w=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f5"><span><b>${hesc(w.name)}</b> <span class="tiny muted">${w.age}/${w.sex} · ${hesc(w.phone)} · registered by ${hesc(w.by)}</span></span><button class="btn sm pri" onclick="admPick('${w.id}')">Continue</button></div>`).join('')}
        <div class="lbl" style="margin-top:16px">Patient is not there? Register the patient</div><div class="small muted" style="margin-bottom:8px">What the HMS needs for a UHID. If the phone number matches an existing patient, you get their UHID, not a new one.</div>
        <div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${field('Name','ar_name',a.reg.name)}${field('Age or date of birth','ar_age',a.reg.age)}<label class="field"><span class="lbl">Sex</span><select class="input" id="ar_sex">${['M','F','Other'].map(s=>`<option ${a.reg.sex===s?'selected':''}>${s}</option>`).join('')}</select></label>${field('Phone','ar_phone',a.reg.phone,'98188 00051')}</div>${field('Address','ar_addr',a.reg.addr)}
        ${a.match?`<div class="callout amber" style="margin-top:10px"><b>This phone number is already registered.</b> ${hesc(a.match.name)} · UHID ${hesc(a.match.uhid)}. No new UHID is made.<div style="margin-top:8px"><button class="btn pri sm" onclick="admUseExisting()">Use this UHID</button></div></div>`:''}
        <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn pri" onclick="admRegister()">Register and continue</button></div>`;}
    if(a.step===2){
      body=`<div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span class="lbl">Ward</span><select class="input" onchange="admSet('ward',this.value);render()">${Object.keys(BEDS).map(w=>`<option ${a.ward===w?'selected':''}>${w}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Bed</span><select class="input" id="ad_bed"><option value="">Pick a bed</option>${BEDS[a.ward].map(b=>`<option ${a.bed===b?'selected':''}>${b}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Admitting psychiatrist <span class="tiny muted">(default: treating or on-call)</span></span><select class="input" onchange="admSet('psy',this.value)">${['Dr. Aanya Sharma','Dr. Rohan Mehta','Dr. Kunal Sethi'].map(d=>`<option ${a.psy===d?'selected':''}>${d}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Section</span><select class="input" onchange="admSet('sec',this.value)">${['89','90'].map(s=>`<option ${a.sec===s?'selected':''} value="${s}">Section ${s}</option>`).join('')}</select></label></div>`;}
    if(a.step===3){
      const F=[['consent','Consent and undertaking'],['forme','Form E'],['risk','High risk consent']];
      body=`<div class="small muted" style="margin-bottom:8px">Normally the front desk takes the family signatures. If there is no front desk, you collect them on the tablet (e-sign) or upload the signed paper copy. It is marked "taken by" with your name.</div>
        ${F.map(f=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f5;gap:8px;flex-wrap:wrap"><b>${f[1]}</b><span style="display:flex;gap:6px">${[['front','Taken by front desk'],['esign','E-sign by me'],['upload','Upload signed paper']].map(m=>`<button class="btn sm ${a.forms[f[0]]===m[0]?'pri':''}" onclick="admForm('${f[0]}','${m[0]}')">${m[1]}</button>`).join('')}</span>${a.forms[f[0]]&&a.forms[f[0]]!=='front'?`<span class="tiny muted" style="flex-basis:100%">Taken by ${hesc(signer())}</span>`:''}</div>`).join('')}
        <div class="lbl" style="margin-top:14px">Advance directive (required, MHCA)</div><div class="row" style="gap:6px">${[['Present','Patient has one'],['Absent','Patient has none']].map(m=>`<button class="btn sm ${a.ad===m[0]?'pri':''}" onclick="admSet('ad','${m[0]}');render()">${m[1]}</button>`).join('')}</div>
        ${isRmo()?`<div class="lbl" style="margin-top:14px">Called the on-call psychiatrist (required)</div><div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${field('Who','ac_who',a.call.who)}${field('What time','ac_at',a.call.at,'e.g. 2:10 am')}</div>${field('Advice in one line','ac_adv',a.call.advice)}`:''}`;}
    if(a.step===4){
      const nm=a.pick==='new'?a.reg.name:a.pick==='old'?a.match.name:(WAIT.find(x=>x.id===a.pick)||{}).name;
      body=`<div class="lbl">Check and start</div>${[['Patient',nm],['Ward and bed',a.ward+' · '+a.bed],['Psychiatrist',a.psy],['Section',a.sec],['Advance directive',a.ad],['Forms',Object.values(a.forms).every(v=>v==='front')?'Taken by front desk':'Some taken by '+signer()],isRmo()?['On-call psychiatrist',a.call.who+' at '+a.call.at+': '+a.call.advice]:null].filter(Boolean).map(r=>`<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid #eef1f5"><span class="muted">${r[0]}</span><b>${hesc(r[1])}</b></div>`).join('')}
        <div class="small muted" style="margin-top:8px">Then the admission workup opens. The tasks (capacity, detailed history in 72 h, 24 h family call, countersign) are created. If you registered or took forms instead of the front desk, the floor coordinator gets an item next morning to verify the paperwork.</div>`;}
    const foot=`<div class="row" style="justify-content:space-between;margin-top:14px"><button class="btn" ${a.step>1?'':'disabled'} onclick="admBack()">Back</button>${a.step>=2&&a.step<4?`<button class="btn pri" onclick="admNext()">Next</button>`:a.step===4?`<button class="btn pri" onclick="admSave()">Start the admission</button>`:''}</div>`;
    return `<section class="card"><div class="hd"><div><h3>Start an admission</h3><div class="small muted" style="margin-top:4px">Same flow for the psychiatrist and the RMO.</div></div></div><div class="pad">${stepBar}${a.err?`<div class="callout amber" style="margin-bottom:10px">${hesc(a.err)}</div>`:''}${body}${foot}</div></section>`;}
  const __na=vNewAdm;
  vNewAdm=function(){return doc()?admPage():__na.apply(this,arguments);};
  /* floor coordinator: verify paperwork next morning */
  const __t3=tasks;
  tasks=function(){const r=__t3.apply(this,arguments);if(!Array.isArray(r)||S.role!=='lead')return r;(S.admVerify||[]).forEach(v=>{if(!r.some(t=>t.id==='av_'+v.id))r.push({id:'av_'+v.id,late:false,title:'Verify admission paperwork · '+v.name,meta:'Taken by '+v.by+' (no front desk). Grey item for next morning',due:'Tomorrow morning',go:'#/patient/'+v.id+'/admission'});});return r;};

  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{shiftBanner();rmoClean();}catch(e){}return r;};
})();
