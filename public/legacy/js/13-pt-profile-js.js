
/* Patient profile helpers (3 Nov), used by role blocks only (see roles-js). Neel keeps the full demo records; other patients get a
   profile built from their own details, and tabs without demo records say so instead of showing Neel's data. */
const ptFind=id=>allPts().find(p=>p.id===id);
/* lists: View opens the clicked patient, not Neel */
function ptIpdPerPatient(o,base){
  if(o&&o.go){const g=o.go;o=Object.assign({},o,{go:p=>String(g(p)).split('#/patient/neel/').join('#/patient/'+p.id+'/')});}
  return base(o);
}
function ptProfileGen(p,sub){
  $('title').textContent='Patients';
  const tabs=STAY.filter(t=>S.role!=='nurse'||['overview','admission','vitals','update','orders'].includes(t[0]));
  if(!tabs.some(t=>t[0]===sub)) sub=S.role==='nurse'?'vitals':'overview';
  const fl=RMO_FILL[p.id]||[],sx=p.sex||fl[3]||'',ag=p.age||fl[4]||'',ex=rmoEx(p);
  const psy=psyOfP(p),psych=rmoPsych(p);
  const box=(l,v,s)=>`<div class="sbox"><div class="lbl">${l}</div><div class="sval">${v}</div>${s?`<div class="tiny muted">${s}</div>`:''}</div>`;
  const ini=n=>n.replace('Dr. ','').split(' ').map(x=>x[0]).join('').slice(0,2);
  const tm=(n,r,c)=>`<span class="tpill"><span class="avatar ${c}" style="width:26px;height:26px;font-size:10px">${ini(n)}</span><span><b>${n.replace('Dr. ','')}</b><span class="tiny muted" style="display:block">${r}</span></span></span>`;
  const body=sub==='overview'
    ?`<section class="card pad"><h3 style="margin-bottom:14px">Stay summary</h3>
        <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
          ${box('Primary diagnosis',p.dx)}${box('Day of stay','Day '+p.day,p.day===0?'Admitted today':p.day===1?'Admitted yesterday':'')}
          ${box('Room',p.room)}${box('Admission','Section '+p.sec)}
          ${box('Observation',ex[0]||'Routine')}${box('Next task',ex[1]||'None due')}
          ${box('Expected discharge',ex[2]||'Not set','Can change')}${box('Risk',p.risk?'High risk':'No high-risk flag')}
        </div></section>`
    :`<section class="card pad"><div class="small muted">No ${(tabs.find(t=>t[0]===sub)||[])[1].toLowerCase()} records have been entered for ${p.name} in this demo yet. Neel Bose has the full set of demo records.</div></section>`;
  return `<div><section class="ws-mid">
    <nav class="crumb"><a href="#/myday">Inpatients</a> / <a href="#/inpatients">${isLead()?'Floor inpatients':'My inpatients'}</a> / <strong>${p.name}</strong></nav>
    <section class="card dph">
      <div class="dpav"><div class="avbig">${p.ini}</div><span class="chip c-green" style="font-size:11px">${p.day===0?'Admitted today':'Day '+p.day+' of stay'}</span></div>
      <div class="dpmain">
        <div class="row" style="gap:10px;align-items:baseline"><h2 style="font-size:26px">${p.name}</h2><span class="muted" style="font-weight:600">${sx?sx+'/'+ag:''}</span><span class="tiny muted">${p.uhid?'UHID '+p.uhid:''}</span></div>
        <div class="small" style="color:var(--ink-2)">${p.risk?'<b style="color:var(--red)">High risk</b> · ':''}Section ${p.sec} · ${p.room}${VIP[p.id]?' · '+VIP[p.id]:''}</div>
        <div class="row dpteam"><span class="lbl">Treating team</span>${tm(psy,'Psychiatrist','c-blue')}${psych?tm(psych,'Psychologist','c-violet'):'<span class="small muted">No psychologist yet</span>'}</div>
      </div>
      <div class="dpact"><button class="btn soft" onclick="schedMsg('the caregiver')">${icon.msg} Message caregiver</button></div>
    </section>
    <div class="subtabs" role="tablist">${tabs.map(([k,l])=>`<button class="subtab ${sub===k?'on':''}" role="tab" aria-selected="${sub===k}" onclick="go('#/patient/${p.id}/${k}')">${l}</button>`).join('')}</div>
    ${body}
  </section></div>`;
}
function ptVPatient(sub,base){
  const id=(location.hash||'').slice(2).split('/')[1],p=id&&id!=='neel'&&ptFind(id);
  return p?ptProfileGen(p,sub):base(sub);
}
/* History menu: opens the profile of the patient last opened or seen in Rounds */
/* History with no patient opened yet: choose a patient, then land on their detailed history view */
function ptPickHist(){
  $('title').textContent='History';
  const pool=(S.role==='lead')?allPts():(S.role==='rmo'?scopePts():PTS);
  const row=p=>`<button class="card" style="display:flex;gap:12px;align-items:center;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;cursor:pointer" onclick="ptJumpHist=true;window.__histNav=true;go('#/patient/${p.id}/overview')">
    <span class="avatar pav">${p.ini}</span>
    <span style="flex:1;min-width:0"><b>${p.name}</b>${p.risk?' <span class="small" style="color:var(--red);font-weight:600">· High risk</span>':''}<span class="tiny muted" style="display:block">${p.room} · Day ${p.day} · ${p.dx}</span></span>
    <span class="small muted">Open history ›</span></button>`;
  return `<section class="ws-mid"><section class="card pad"><h3>Whose history?</h3><div class="small muted" style="margin:4px 0 14px">Choose a patient to open their detailed history: stay summary, stay timeline and every record from this stay.</div>${pool.map(row).join('')}</section></section>`;
}
let ptJumpHist=false;
function ptHistRender(base){
  const r=(location.hash||'').slice(2).split('/');
  if(r[0]==='patient'&&!r[1]){
    if(S.focusPid&&ptFind(S.focusPid)){ptJumpHist=true;window.__histNav=true;location.replace('#/patient/'+S.focusPid+'/overview');return;}
    window.__histNav=true;renderSide(r);$('app').classList.remove('compact');$('view').innerHTML=ptPickHist();window.scrollTo(0,0);return;
  }
  const out=base();
  /* land on the stay tabs and Stay timeline (the detailed history view), not the top of the profile */
  if(ptJumpHist&&r[0]==='patient'){ptJumpHist=false;const land=()=>{const el=document.querySelector('#view nav.tabs')||document.querySelector('#view .subtabs');if(el)window.scrollTo({top:el.getBoundingClientRect().top+scrollY-90,behavior:'instant'});};setTimeout(land,60);setTimeout(land,260);}
  return out;
}
