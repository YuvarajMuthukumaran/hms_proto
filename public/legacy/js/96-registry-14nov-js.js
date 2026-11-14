/* 14 Nov 2026: the patient registry (the old HMS export, loaded by tools/import_registry.py) inside the portal.
   1. "Registry" in the left rail (#/registry) for every clinical role: search by name, UHID or mobile, open a patient's
      details (demographics, relatives, visits, doctors seen). Admit is for the roles that may admit
      (psychiatrist, floor lead psychiatrist, rmo, floor coordinator): it sets the patient to admitted and adds an admissions row.
   2. Admitted patients from the database join the ward lists (by floor, or by sex when no floor is set) with their own,
      empty clinical record: no demo medicines, notes or vitals are copied onto a real or synthetic patient.
   Works only when Supabase is configured; without it the portal stays on the demo data. Nothing here logs patient details. */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const T=()=>window.__TULASI__||{};
  const TEAM=['lead','psychiatrist','psychologist','nurse','rmo','floor-lead-psychiatrist','floor-lead-psychologist'];
  const roleKey=()=>{const t=T();return TEAM.includes(t.role)?t.role:(TEAM.includes(t.viewRole)?t.viewRole:S.role);};
  const canAdmit=()=>['lead','psychiatrist','rmo','floor-lead-psychiatrist','floor-coordinator'].includes(T().role||S.role);
  let CFG;
  async function cfg(){
    if(CFG!==undefined)return CFG;
    try{const r=await fetch('/api/config',{cache:'no-store'});const j=r.ok?await r.json():null;CFG=j&&j.supabase?j.supabase:null;}catch(e){CFG=null;}
    return CFG;
  }
  async function rest(path,opt){
    const c=await cfg();if(!c)throw new Error('offline');
    opt=opt||{};
    const r=await fetch(c.url+'/rest/v1/'+path,{method:opt.method||'GET',headers:Object.assign({apikey:c.key,Authorization:'Bearer '+c.key,'x-tulasi-role':roleKey(),'Content-Type':'application/json'},opt.prefer?{Prefer:opt.prefer}:{}),body:opt.body?JSON.stringify(opt.body):undefined});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return r.status===204?null:r.json();
  }
  window.regRest=rest;

  /* 2. admitted patients into the wards */
  const dayOf=d=>{if(!d)return 0;const a=new Date(d+'T00:00:00'),t=new Date();t.setHours(0,0,0,0);return Math.max(0,Math.round((t-a)/864e5));};
  const ini=n=>String(n||'').split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  function toLegacy(p){
    return {id:p.id,age:p.age,sex:p.sex||'',uhid:p.uhid,name:p.name,ini:ini(p.name),room:p.room?('Room '+String(p.room).replace(/^Room\s*/i,'')):(p.bed||'Room ?'),
      day:dayOf(p.admitted_at),sec:p.section||'89',risk:false,dx:p.dx||'Under assessment',real:true,src:p.source,mobile:p.mobile||'',rel0:(p.relatives||[])[0]||null,referral:p.referral||''};
  }
  function wardFor(p){
    const keys=Object.keys(WARDS);
    if(p.floor&&WARDS[p.floor])return p.floor;
    return p.sex==='F'?(keys.find(k=>/female/i.test(k))||keys[0]):(keys.find(k=>/^male/i.test(k))||keys[0]);
  }
  async function loadAdmitted(){
    try{
      const rows=await rest('patients?status=eq.admitted&select=id,name,sex,age,uhid,room,bed,floor,section,dx,admitted_at,source,psychiatrist,psychologist,mobile,relatives,referral&order=admitted_at.desc&limit=500');
      let added=0;
      (rows||[]).forEach(p=>{
        if(Object.values(WARDS).some(a=>a.some(x=>x.id===p.id)))return;
        const lp=toLegacy(p);WARDS[wardFor(p)].push(lp);added++;
        try{if(p.psychiatrist&&typeof PSYOF==='object')PSYOF[p.id]=p.psychiatrist;if(p.psychologist&&typeof PSYCHOF==='object')PSYCHOF[p.id]=p.psychologist;}catch(e){}
      });
      if(added)render();
    }catch(e){/* no database: demo data only */}
  }

  /* an empty clinical record for a database patient (the demo builds one from Neel's) */
  if(typeof ptMakeCtx==='function'){
    const __mk=ptMakeCtx;
    const KEEP=new Set(['section','dx','team','obs','edd','eddShared','admNo','admD','dtype']);
    const blank=v=>Array.isArray(v)?[]:typeof v==='boolean'?false:typeof v==='string'?'':typeof v==='number'?0:(v&&typeof v==='object')?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,Array.isArray(x)?[]:(x&&typeof x==='object')?{}:typeof x==='boolean'?false:typeof x==='number'?0:''])):v;
    ptMakeCtx=function(p){
      const c=__mk.apply(this,arguments);
      if(!p||!p.real)return c;
      try{PT_KEYS.forEach(k=>{if(!KEEP.has(k)&&k in c)c[k]=blank(c[k]);});c.dx=p.dx||'Under assessment';c.section=String(p.sec||'89');c.obs='Routine';}catch(e){}
      return c;
    };
  }

  /* identity and record text from the database, not the demo's made-up family, phone and referral */
  const maskPh=m=>m?String(m).replace(/^\+91(\d{5})(\d{5})$/,'+91 $1 $2'):'No number on file';
  if(typeof ptIdentity==='function'){
    const __id=ptIdentity;
    ptIdentity=function(p){
      const id=__id.apply(this,arguments);
      if(p&&p.real){const r=p.rel0;id.nr=r&&r.name?r.name:'Not recorded';id.nrFirst=id.nr.split(' ')[0];id.rel=r&&r.rel?r.rel:'Relative';id.phone=maskPh(p.mobile);}
      return id;
    };
  }
  if(typeof ptSwaps==='function'){
    const __sw2=ptSwaps;
    ptSwaps=function(){
      const out=__sw2.apply(this,arguments);
      try{const p=ptFind(S.pid);if(p&&p.real){out.unshift(['Referred by Dr. Aanya Sharma, OPD',p.referral?'Referred by '+p.referral:'Referral not recorded'],['Second episode. Stopped lithium 4 months ago. Symptoms rose after a work deadline; family noticed spending and anger at home.','Not recorded yet.']);}}catch(e){}
      return out;
    };
  }

  /* 1. registry page */
  const R={q:'',rows:null,err:'',busy:false};
  async function search(){
    const q=R.q.trim();R.busy=true;R.err='';paint();
    try{
      let f;
      if(!q)f='order=last_visit.desc.nullslast';
      else if(/^\+?\d[\d\s]{5,}$/.test(q))f='mobile=ilike.*'+encodeURIComponent(q.replace(/\D/g,'').slice(-10))+'*';
      else if(/\d/.test(q))f='or=(uhid.ilike.*'+encodeURIComponent(q)+'*,uhids.cs.{'+encodeURIComponent(q)+'})';
      else f='name=ilike.*'+encodeURIComponent(q)+'*';
      R.rows=await rest('patients?select=id,name,sex,age,uhid,mobile,last_visit,visit_count,panel,status,doctors_seen&'+f+'&limit=50');
    }catch(e){R.err=e.message==='offline'?'The database is not connected here, so the registry is empty. On the live site it reads the imported patients.':'Could not search ('+e.message+').';R.rows=[];}
    R.busy=false;paint();
  }
  const fmtD=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'-';
  const mask=m=>m?String(m).replace(/^(\+91)?(\d{2})\d{5}(\d{3})$/,'$2XXXXX$3'):'-';
  function page(){
    const rows=R.rows||[];
    return `<div class="card" style="padding:16px"><div class="row" style="justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap">
      <div><h2 style="margin:0">Patient registry</h2><div class="small muted" style="margin-top:4px">Every patient from the old HMS. Search by name, UHID or mobile.</div></div>
      <form onsubmit="event.preventDefault();regSearch(this.q.value)" class="row" style="gap:8px"><input class="input" name="q" value="${esc(R.q)}" placeholder="Name, UHID or mobile" style="min-width:240px" aria-label="Search the registry"><button class="btn pri">Search</button></form></div>
      ${R.err?`<div class="small" style="margin-top:12px;color:#b54708">${esc(R.err)}</div>`:''}
      ${R.busy?'<div class="small muted" style="margin-top:12px">Searching...</div>':''}
      <div class="scroll" style="margin-top:12px"><table class="t"><thead><tr><th>Patient</th><th>UHID</th><th>Mobile</th><th>Last visit</th><th>Visits</th><th>Seen by</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map(p=>`<tr><td><b>${esc(p.name)}</b><div class="tiny muted">${esc(p.age==null?'':p.age)}${p.sex?'/'+esc(p.sex):''}</div></td><td>${esc(p.uhid)}</td><td>${esc(mask(p.mobile))}</td><td>${esc(fmtD(p.last_visit))}</td><td>${esc(p.visit_count)}</td><td class="small">${esc((p.doctors_seen||[]).join(', '))}</td><td>${p.status==='admitted'?'<b>Admitted</b>':esc(p.panel||'OPD')}</td><td><button class="btn sm" onclick="regOpen('${esc(p.id)}')">Open</button></td></tr>`).join('')||(R.rows&&!R.busy&&!R.err?'<tr><td colspan="8" class="muted">No patient matches.</td></tr>':'')}
      </tbody></table></div></div>`;
  }
  function paint(){const v=$('view');if(v&&/^#\/registry/.test(location.hash))v.innerHTML=page();}
  window.regSearch=q=>{R.q=q||'';search();};
  window.regOpen=async function(id){
    let p;try{p=(await rest('patients?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];}catch(e){toast('Could not open the patient');return;}
    if(!p)return;
    const rel=(p.relatives||[]).map(r=>r.name+(r.rel?' ('+r.rel+')':'')).join(', ')||'None recorded';
    const ad=p.status==='admitted';
    V3.modal(esc(p.name),'UHID '+esc((p.uhids||[p.uhid]).join(', ')),`<dl class="kv">
      <dt>Age / sex</dt><dd>${esc(p.age==null?'-':p.age)} / ${esc(p.sex||'-')}${p.dob_est?' · born about '+esc(fmtD(p.dob_est)):''}</dd>
      <dt>Mobile</dt><dd>${esc(p.mobile||'No valid number')}</dd><dt>Address</dt><dd>${esc(p.address||'-')}</dd>
      <dt>Relatives</dt><dd>${esc(rel)}</dd><dt>Referral</dt><dd>${esc(p.referral||'-')}</dd>
      <dt>Visits</dt><dd>${esc(p.visit_count)} · first ${esc(fmtD(p.first_visit))} · last ${esc(fmtD(p.last_visit))}</dd>
      <dt>Seen by</dt><dd>${esc((p.doctors_seen||[]).join(', ')||'-')}</dd><dt>Status</dt><dd>${ad?'Admitted '+esc(fmtD(p.admitted_at))+(p.room?' · Room '+esc(p.room):''):esc(p.panel||'OPD')}</dd>
      ${(p.flags||[]).length?`<dt>Data notes</dt><dd>${esc(p.flags.join(', '))}</dd>`:''}</dl>`,
      `<button class="btn" onclick="closeModal()">Close</button>${ad?`<button class="btn pri" onclick="closeModal();go('#/patient/${esc(p.id)}/overview')">Open record</button>`:(canAdmit()?`<button class="btn pri" onclick="regAdmit('${esc(p.id)}')">Admit</button>`:'')}`);
  };
  window.regAdmit=async function(id){
    let staff=[];try{staff=await rest('staff?select=name,role&active=is.true&order=name');}catch(e){}
    const opt=r=>['<option value="">Not set</option>'].concat(staff.filter(s=>s.role===r).map(s=>`<option>${esc(s.name)}</option>`)).join('');
    const floors=Object.keys(WARDS).map(k=>`<option>${esc(k)}</option>`).join('');
    const today=new Date().toISOString().slice(0,10);
    V3.modal('Admit patient','Sets the patient to admitted and opens a new stay.',`<div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <label class="small">Ward<select class="input" id="raW">${floors}</select></label><label class="small">Room<input class="input" id="raR" placeholder="e.g. 214 B"></label>
      <label class="small">Admission date<input class="input" type="date" id="raD" value="${today}" max="${today}"></label>
      <label class="small">MHCA section<select class="input" id="raS"><option value="86">86 · independent</option><option value="87">87 · minor</option><option value="89" selected>89 · supported</option><option value="90">90 · beyond 30 days</option></select></label>
      <label class="small">Psychiatrist<select class="input" id="raP">${opt('psychiatrist')}</select></label><label class="small">Psychologist<select class="input" id="raQ">${opt('psychologist')}</select></label></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="regAdmitSave('${esc(id)}')">Admit</button>`);
  };
  window.regAdmitSave=async function(id){
    const v=k=>(($(k)||{}).value||'').trim();
    const room=v('raR');if(!room){toast('Add the room');return;}
    const rec={status:'admitted',floor:v('raW'),room,admitted_at:v('raD'),section:v('raS'),psychiatrist:v('raP')||null,psychologist:v('raQ')||null};
    try{
      await rest('patients?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:rec,prefer:'return=minimal'});
      await rest('admissions',{method:'POST',body:{patient_id:id,admitted_at:rec.admitted_at,section:rec.section,floor:rec.floor,room,psychiatrist:rec.psychiatrist,psychologist:rec.psychologist,updated_role:roleKey()},prefer:'return=minimal'});
    }catch(e){toast('Could not admit ('+e.message+'). Only the psychiatrist, RMO or floor coordinator can admit.');return;}
    closeModal();toast('Admitted by '+signer());await loadAdmitted();go('#/patient/'+id+'/overview');
  };

  /* left rail entry and route */
  const RICON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  const __rs=renderSide;
  renderSide=function(){
    const out=__rs.apply(this,arguments);
    try{
      const dd=document.querySelector('#side .sgdd');
      if(dd&&!dd.querySelector('[data-reg]')){
        const on=/^#\/registry/.test(location.hash||'');
        const b=document.createElement('button');b.dataset.reg='1';b.title='Patient registry';b.setAttribute('aria-label','Patient registry');b.setAttribute('onclick',"go('#/registry')");
        if(on){b.className='on';b.setAttribute('aria-current','page');dd.querySelectorAll('button.on:not([data-reg])').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-current');});}
        b.innerHTML=`<span class="si">${RICON}</span><span class="sl">Registry</span>`;
        dd.appendChild(b);
      }
    }catch(e){}
    return out;
  };
  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(/^#\/registry/.test(location.hash||'')){paint();if(R.rows===null&&!R.busy)search();}
    return out;
  };
  loadAdmitted();
})();
