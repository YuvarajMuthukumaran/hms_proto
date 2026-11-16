/* 16 Nov 2026: the complete New admission flow (the one from the 14 Nov end-of-day build: Patient, Ward and bed, Admission forms, Confirm) works on real data.
   Step 1 searches the registry (name, UHID or phone) or registers a new patient (a phone that is already registered gives the existing patient, no duplicate).
   Everything is saved to the database: the patient row (status admitted, ward, room, section, admission date, treating team) and the stay in admissions.
   Psychiatrist and RMO logins only; demo mode keeps the original flow in block 85. */
(function(){
  const role=()=>String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|rmo|floor-lead-psychiatrist)$/.test(role()))return;
  const real=()=>!!window.__realMode;
  const E=s=>hesc(String(s==null?'':s));
  const rest=(p,o)=>window.regRest(p,o);
  const today=()=>new Date().toISOString().slice(0,10);
  const R={step:1,q:'',rows:null,busy:false,pick:null,reg:{name:'',age:'',sex:'M',phone:'',addr:'',uhid:''},match:null,ward:'',room:'',date:'',sec:'89',psy:'',psych:'',ad:'',forms:{consent:'',forme:'',risk:''},call:{who:'',at:'',advice:''},staff:null,err:''};
  const reset=()=>{Object.assign(R,{step:1,q:'',rows:null,busy:false,pick:null,reg:{name:'',age:'',sex:'M',phone:'',addr:'',uhid:''},match:null,ward:'',room:'',date:today(),sec:'89',ad:'',forms:{consent:'',forme:'',risk:''},call:{who:'',at:'',advice:''},err:''});};
  reset();
  async function loadStaff(){
    if(R.staff)return;R.staff={psy:[],psych:[]};
    try{const st=await rest('staff?select=name,role&active=is.true&order=name');(st||[]).forEach(s=>{if(s.role==='psychiatrist')R.staff.psy.push(s.name);if(s.role==='psychologist')R.staff.psych.push(s.name);});}catch(e){}
    if(!R.psy)R.psy=role()==='psychiatrist'&&R.staff.psy.indexOf('Anu Yadav')>=0?'Anu Yadav':'';
    try{render();}catch(e){}
  }
  const digits=s=>String(s||'').replace(/\D/g,'').slice(-10);
  const field=(l,id,v,ph)=>`<label class="field"><span class="lbl">${l}</span><input class="input" id="${id}" value="${E(v)}" ${ph?`placeholder="${ph}"`:''}></label>`;
  const STEPS=['Patient','Ward and bed','Admission forms','Confirm'];
  const nm=()=>R.pick?R.pick.name:'';
  const minor=()=>R.pick&&+R.pick.age>0&&+R.pick.age<18;

  window.nadSearch=async function(){
    const e=document.getElementById('nq');R.q=e?e.value.trim():R.q;R.busy=true;R.err='';try{render();}catch(x){}
    try{
      let f='order=last_visit.desc.nullslast';const q=R.q;
      if(q){if(/^\+?\d[\d\s]{5,}$/.test(q))f='mobile=ilike.*'+encodeURIComponent(digits(q))+'*';else if(/\d/.test(q))f='or=(uhid.ilike.*'+encodeURIComponent(q)+'*,uhids.cs.{'+encodeURIComponent(q)+'})';else f='name=ilike.*'+encodeURIComponent(q)+'*';}
      R.rows=await rest('patients?select=id,name,sex,age,uhid,mobile,status,panel,section&status=neq.admitted&'+f+'&limit=20');
    }catch(x){R.err='Could not search ('+x.message+').';R.rows=[];}
    R.busy=false;try{render();}catch(x){}
  };
  window.nadPick=function(i){const r=(R.rows||[])[i];if(!r)return;R.pick=r;R.match=null;R.step=2;R.err='';if(minor())R.sec='87';loadStaff();render();};
  window.nadRegister=async function(){
    const g=k=>((document.getElementById('nr_'+k)||{}).value||'').trim();
    R.reg={name:g('name'),age:g('age'),sex:g('sex')||'M',phone:g('phone'),addr:g('addr'),uhid:g('uhid')};const r=R.reg;
    if(!r.name||!r.age||!r.phone||!r.addr||!r.uhid){R.err='Name, age, phone, address and the UHID are needed.';render();return;}
    if(digits(r.phone).length<10){R.err='Enter a 10 digit phone number.';render();return;}
    try{
      const same=await rest('patients?select=id,name,sex,age,uhid,mobile,status&mobile=ilike.*'+digits(r.phone)+'*&limit=5');
      if(same&&same.length){R.match=same;R.err='';render();return;}
      const u=await rest('patients?select=id&uhid=eq.'+encodeURIComponent(r.uhid)+'&limit=1');
      if(u&&u.length){R.err='That UHID is already registered. Search for the patient instead.';render();return;}
    }catch(x){R.err='Could not check the registry ('+x.message+').';render();return;}
    R.pick={id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:r.name,sex:r.sex==='Other'?null:r.sex,age:+r.age||null,uhid:r.uhid,mobile:'+91'+digits(r.phone),address:r.addr,isNew:true};
    R.match=null;R.step=2;R.err='';if(minor())R.sec='87';loadStaff();render();
  };
  window.nadUseMatch=function(i){const r=(R.match||[])[i];if(!r)return;R.pick=r;R.match=null;R.step=2;R.err='';if(minor())R.sec='87';loadStaff();render();};
  window.nadSet=function(k,v){const p=k.split('.');if(p.length===2)R[p[0]][p[1]]=v;else R[k]=v;};
  window.nadBack=function(){if(R.step>1)R.step--;R.err='';render();};
  window.nadForm=function(k,m){R.forms[k]=m;render();};
  window.nadAd=function(v){R.ad=v;render();};
  window.nadCancel=function(){reset();location.hash='#/myday';};
  window.nadNext=function(){
    R.err='';
    if(R.step===2){
      const g=id=>((document.getElementById(id)||{}).value||'').trim();
      R.ward=g('nd_w')||R.ward;R.room=g('nd_r');R.date=g('nd_d')||R.date;R.sec=g('nd_s')||R.sec;R.psy=g('nd_p');R.psych=g('nd_q');
      if(!R.ward){R.err='Pick a ward.';render();return;}
      if(!R.room){R.err='Add the room.';render();return;}
      if(!R.date||R.date>today()){R.err='Pick the admission date (not in the future).';render();return;}
      if(minor()&&R.sec!=='87'){R.err='The patient is under 18: Section 87 applies.';render();return;}
    }
    if(R.step===3){
      if(!R.ad){R.err='Ask about an advance directive and record the answer (MHCA requires it at admission).';render();return;}
      if(!R.forms.consent||!R.forms.forme||!R.forms.risk){R.err='Say who took each form: front desk, e-sign by you, or an upload of the signed paper.';render();return;}
      if(role()==='rmo'){const g=id=>((document.getElementById(id)||{}).value||'').trim();R.call={who:g('nc_who'),at:g('nc_at'),advice:g('nc_adv')};if(!R.call.who||!R.call.at||!R.call.advice){R.err='Record the call to the on-call psychiatrist: who, what time, and the advice in one line.';render();return;}}
    }
    R.step++;render();
  };
  window.nadSave=async function(){
    if(R.busy)return;R.busy=true;R.err='';render();
    const p=R.pick,id=p.id;
    try{
      if(p.isNew){await rest('patients',{method:'POST',body:{id,name:p.name,sex:p.sex,age:p.age,uhid:p.uhid,mobile:p.mobile,address:p.address,panel:'IPD',status:'registered'},prefer:'return=minimal'});}
      const rec={status:'admitted',floor:R.ward,room:R.room,admitted_at:R.date,section:R.sec,psychiatrist:R.psy||null,psychologist:R.psych||null};
      await rest('patients?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:rec,prefer:'return=minimal'});
      await rest('admissions',{method:'POST',body:{patient_id:id,admitted_at:R.date,section:R.sec,floor:R.ward,room:R.room,psychiatrist:rec.psychiatrist,psychologist:rec.psychologist,updated_role:role()},prefer:'return=minimal'});
    }catch(x){R.busy=false;R.err='Could not admit ('+x.message+'). Nothing was changed on the patient list.';render();return;}
    try{if(window.regLoadAdmitted)await window.regLoadAdmitted();}catch(x){}
    try{const px=psyPx(id);px.admBy={by:signer(),at:atNow(),psy:R.psy,call:role()==='rmo'?R.call:null,forms:Object.assign({},R.forms)};}catch(x){}
    try{mhcaAd(id,R.ad);}catch(x){}
    const name=p.name,ad=R.ad;reset();
    location.hash='#/patient/'+encodeURIComponent(id)+'/admission';
    toast('Admission started for '+name+'. The workup is open. Capacity, history, 24 hour family call and countersign tasks follow the admission date.');
  };

  function page(){
    $('title').textContent='New admission';
    if(!R.staff)loadStaff();
    const bar=`<div class="row" style="gap:6px;margin-bottom:12px;flex-wrap:wrap">${STEPS.map((s,i)=>`<span class="chip ${R.step===i+1?'c-blue':R.step>i+1?'c-green':'c-grey'}">${i+1}. ${s}</span>`).join('')}</div>`;
    let body='';
    if(R.step===1){
      const rows=R.rows;
      body=`<div class="lbl">Find the patient in the registry</div>
        <div class="row" style="gap:8px;margin:6px 0 10px"><input class="input" id="nq" value="${E(R.q)}" placeholder="Name, UHID or phone" onkeydown="if(event.key==='Enter')nadSearch()" style="flex:1"><button class="btn pri" onclick="nadSearch()">Search</button></div>
        ${R.busy?'<div class="small muted">Searching…</div>':rows===null?'<div class="small muted">Search by name, UHID or phone. Patients already admitted are not listed.</div>':!rows.length?'<div class="small muted">No match. Register the patient below.</div>':rows.map((r,i)=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f5;gap:8px"><span><b>${E(r.name)}</b> <span class="tiny muted">${E(r.age||'')}/${E(r.sex||'')} · ${E(r.uhid||'')} · ${E(r.mobile||'no phone')}</span></span><button class="btn sm pri" onclick="nadPick(${i})">Continue</button></div>`).join('')}
        <div class="lbl" style="margin-top:16px">Patient is not there? Register the patient</div><div class="small muted" style="margin-bottom:8px">If the phone number is already registered you get that patient, not a new one. The UHID comes from the front desk.</div>
        <div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${field('Name','nr_name',R.reg.name)}${field('Age','nr_age',R.reg.age)}<label class="field"><span class="lbl">Sex</span><select class="input" id="nr_sex">${['M','F','Other'].map(s=>`<option ${R.reg.sex===s?'selected':''}>${s}</option>`).join('')}</select></label>${field('Phone','nr_phone',R.reg.phone,'98188 00051')}${field('UHID','nr_uhid',R.reg.uhid,'e.g. 2026-27RG1234')}</div>${field('Address','nr_addr',R.reg.addr)}
        ${R.match?`<div class="callout amber" style="margin-top:10px"><b>This phone number is already registered.</b>${R.match.map((m,i)=>`<div class="row" style="justify-content:space-between;margin-top:6px"><span>${E(m.name)} · UHID ${E(m.uhid||'')}${m.status==='admitted'?' · <b>already admitted</b>':''}</span>${m.status==='admitted'?'':`<button class="btn sm pri" onclick="nadUseMatch(${i})">Use this patient</button>`}</div>`).join('')}</div>`:''}
        <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn pri" onclick="nadRegister()">Register and continue</button></div>`;
    }
    if(R.step===2){
      const wards=Object.keys(WARDS),st=R.staff||{psy:[],psych:[]},opt=(arr,cur)=>['<option value="">Not set</option>'].concat(arr.map(n=>`<option ${cur===n?'selected':''}>${E(n)}</option>`)).join('');
      if(!R.ward)R.ward=(R.pick.sex==='F'?wards.find(w=>/female/i.test(w)):wards.find(w=>/^male/i.test(w)))||wards[0]||'';
      body=`<div class="small muted" style="margin-bottom:8px"><b>${E(nm())}</b> · ${E(R.pick.age||'')}/${E(R.pick.sex||'')} · UHID ${E(R.pick.uhid||'')}${minor()?' · <b>under 18</b>: Section 87 applies':''}</div>
        <div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label class="field"><span class="lbl">Ward</span><select class="input" id="nd_w">${wards.map(w=>`<option ${R.ward===w?'selected':''}>${E(w)}</option>`).join('')}</select></label>
        ${field('Room and bed','nd_r',R.room,'e.g. 214 B')}
        <label class="field"><span class="lbl">Admission date</span><input class="input" type="date" id="nd_d" value="${E(R.date)}" max="${today()}"></label>
        <label class="field"><span class="lbl">MHCA section</span><select class="input" id="nd_s">${[['86','86 · independent'],['87','87 · minor'],['89','89 · supported'],['90','90 · beyond 30 days']].map(s=>`<option value="${s[0]}" ${R.sec===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Admitting psychiatrist</span><select class="input" id="nd_p">${opt(st.psy,R.psy)}</select></label>
        <label class="field"><span class="lbl">Psychologist</span><select class="input" id="nd_q">${opt(st.psych,R.psych)}</select></label></div>`;
    }
    if(R.step===3){
      const F=[['consent','Consent and undertaking'],['forme','Form E'],['risk','High risk consent']];
      body=`<div class="small muted" style="margin-bottom:8px">Normally the front desk takes the family signatures. If there is no front desk, you collect them on the tablet (e-sign) or upload the signed paper copy. It is marked "taken by" with your name.</div>
        ${F.map(f=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f5;gap:8px;flex-wrap:wrap"><b>${f[1]}</b><span style="display:flex;gap:6px">${[['front','Taken by front desk'],['esign','E-sign by me'],['upload','Upload signed paper']].map(m=>`<button class="btn sm ${R.forms[f[0]]===m[0]?'pri':''}" onclick="nadForm('${f[0]}','${m[0]}')">${m[1]}</button>`).join('')}</span></div>`).join('')}
        <div class="lbl" style="margin-top:14px">Advance directive (required, MHCA)</div><div class="row" style="gap:6px">${[['Present','Patient has one'],['Absent','Patient has none']].map(m=>`<button class="btn sm ${R.ad===m[0]?'pri':''}" onclick="nadAd('${m[0]}')">${m[1]}</button>`).join('')}</div>
        ${role()==='rmo'?`<div class="lbl" style="margin-top:14px">Called the on-call psychiatrist (required)</div><div class="fgrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${field('Who','nc_who',R.call.who)}${field('What time','nc_at',R.call.at,'e.g. 2:10 am')}</div>${field('Advice in one line','nc_adv',R.call.advice)}`:''}`;
    }
    if(R.step===4){
      body=`<div class="lbl">Check and start</div>${[['Patient',nm()+' · UHID '+(R.pick.uhid||'')],['Ward and room',R.ward+' · '+R.room],['Admission date',R.date],['Psychiatrist',R.psy||'Not set'],['Psychologist',R.psych||'Not set'],['Section',R.sec],['Advance directive',R.ad],['Forms',Object.values(R.forms).every(v=>v==='front')?'Taken by front desk':'Some taken by '+signer()],role()==='rmo'?['On-call psychiatrist',R.call.who+' at '+R.call.at+': '+R.call.advice]:null].filter(Boolean).map(r=>`<div class="row" style="justify-content:space-between;padding:7px 0;border-bottom:1px solid #eef1f5"><span class="muted">${E(r[0])}</span><b>${E(r[1])}</b></div>`).join('')}
        <div class="small muted" style="margin-top:8px">The patient is saved as admitted. Then the admission workup opens.</div>`;
    }
    const foot=`<div class="row" style="justify-content:space-between;margin-top:14px"><span style="display:flex;gap:8px"><button class="btn" ${R.step>1?'':'disabled'} onclick="nadBack()">Back</button><button class="btn" onclick="nadCancel()">Cancel</button></span>${R.step>=2&&R.step<4?`<button class="btn pri" onclick="nadNext()">Next</button>`:R.step===4?`<button class="btn pri" ${R.busy?'disabled':''} onclick="nadSave()">${R.busy?'Saving…':'Start the admission'}</button>`:''}</div>`;
    return `<section class="card"><div class="hd"><div><h3>Start an admission</h3><div class="small muted" style="margin-top:4px">Saved to the patient list for every role.</div></div></div><div class="pad">${bar}${R.err?`<div class="callout amber" style="margin-bottom:10px">${E(R.err)}</div>`:''}${body}${foot}</div></section>`;
  }
  const __na=vNewAdm;
  vNewAdm=function(){return real()?page():__na.apply(this,arguments);};
})();
