
/* Psychiatrist only (5 Nov 2026).
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
  .ho-sbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px;margin-top:8px}
  .ho-sbar>div{font-size:13px;line-height:1.45;min-width:0}.ho-sbar b.k{display:inline-block;min-width:18px;height:18px;border-radius:5px;background:var(--blue-tint);color:var(--blue-ink);text-align:center;font-size:11px;line-height:18px;margin-right:6px}
  .ho-sbar .l{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
  @media (max-width:900px){.ho-sbar{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  const today=()=>new Date().toDateString();
  const px=pid=>(window.psyPx?psyPx(pid):(ptCtxOf(pid).psyx=ptCtxOf(pid).psyx||{}));
  /* handovers live at the top level of the state (they are about the doctor, not one patient) */
  function store(){
    if(!S.psyHO)S.psyHO={list:[{id:'ho0',from:'Dr. Rohan Mehta',to:'Dr. Aanya Sharma',reason:'On leave',at:'3 Nov 2026, 6:10 pm',pids:['sameer','dev'],rec:{sameer:'Rituals reduced on fluoxetine. Watch sleep tonight; call the RMO if he refuses food.',dev:'Day 15, opioid dependence, discharge planned. Check cravings at night; naltrexone due after dinner.'},status:'sent'}],ui:{to:'',reason:'Night duty',sel:{},rec:{}}};
    return S.psyHO;
  }
  function sbar(pid){
    const p=ptFind(pid);if(!p)return null;const c=ptCtxOf(pid),x=px(pid),ex=EX[pid]||[],T=tasks();
    const meds=(c.meds||[]).filter(m=>!String(m.name).includes('waiting')).map(m=>m.name+' '+m.freq);
    const round=(c.dnHist||[]).find(h=>h.type==='Round note'),al=V3.openAlerts(a=>a.pid===pid&&!a.ack),ev=(c.events||[]).filter(e=>!e.ack);
    const labs=v3().labs.filter(l=>l.pid===pid&&!l.rev).length,tk=T.filter(t=>String(t.title||'').replace(/<[^>]+>/g,'').includes(p.name)).map(t=>String(t.title).replace(/<[^>]+>/g,'').replace(p.name,'').replace(/^[\s·]+|[\s·]+$/g,''));
    const lvl=x.riskLevel||(p.risk?'High':'Low'),adm=(c.pastAdm||[]).length;
    return {p,
      S:`${p.dx||c.dx} · day ${p.day} · Section ${c.section||p.sec} · observation ${ex[0]||'routine'} · risk of harm ${lvl.toLowerCase()}`,
      B:`${adm?'Past admissions: '+adm+'. ':'First admission. '}${(c.team||{}).psych?'Psychologist '+c.team.psych+'.':'No psychologist yet.'} Medicines: ${meds.length?meds.join('; '):'none listed'}.`,
      A:[round?`Last round (${round.d} ${round.my}): ${round.sum}`:'No round note yet',al.length?al.length+' open alert'+(al.length>1?'s':'')+': '+al.map(a=>a.title).join('; '):'No open alerts',ev.length?ev.length+' event'+(ev.length>1?'s':'')+' not reviewed':'No unreviewed events',labs?labs+' result'+(labs>1?'s':'')+' to review':'No results waiting'].join(' · '),
      R:tk.length?tk.slice(0,4).join('; '):'No pending tasks'};
  }
  const sbarHtml=(s,rec)=>`<div class="ho-sbar"><div><div class="l"><b class="k">S</b>Situation</div>${hesc(s.S)}</div><div><div class="l"><b class="k">B</b>Background</div>${hesc(s.B)}</div><div><div class="l"><b class="k">A</b>Assessment</div>${hesc(s.A)}</div><div><div class="l"><b class="k">R</b>Recommendation</div>${hesc(s.R)}${rec?`<div style="margin-top:4px"><b>Watch tonight:</b> ${hesc(rec)}</div>`:''}</div></div>`;

  window.psyHoAccept=function(id){
    const h=store().list.find(x=>x.id===id);if(!h||h.acceptedBy)return;
    h.acceptedBy=signer();h.acceptedAt=atNow();h.status='accepted';
    h.pids.forEach(pid=>{try{PSYOF[pid]=h.to;ptCtxOf(pid).team.psy=h.to;}catch(e){}});
    render();toast('Handover accepted by '+signer()+'. The patients are now yours.');
  };
  window.psyHoSel=function(pid,on){const u=store().ui;u.sel[pid]=!!on;};
  window.psyHoRec=function(pid,v){store().ui.rec[pid]=v;};
  window.psyHoSend=function(){
    const st=store(),u=st.ui;u.to=($('hoTo')||{}).value||u.to;u.reason=($('hoWhy')||{}).value||u.reason;
    const pids=PTS.filter(p=>u.sel[p.id]!==false).map(p=>p.id);
    if(!u.to){toast('Choose the doctor who takes over');return;}
    if(!pids.length){toast('Pick at least one patient');return;}
    st.list.unshift({id:'ho'+Date.now(),from:signer(),to:u.to,reason:u.reason,at:atNow(),pids,rec:Object.assign({},u.rec),status:'sent'});
    u.rec={};render();toast('Handover sent to '+u.to+'. You still see these patients until '+u.to+' accepts.');
  };
  window.psyHoToggle=function(id){const h=store().list.find(x=>x.id===id);if(h){h.open=!h.open;render();}};

  function page(){
    const st=store(),u=st.ui,me=signer();
    const incoming=st.list.filter(h=>h.to===me),sent=st.list.filter(h=>h.from===me);
    const card=(h,mine)=>{const open=h.open!==false;
      return `<section class="card"><div class="hd"><div><h3>${mine?'To '+hesc(h.to):'From '+hesc(h.from)} · ${hesc(h.reason)}</h3><div class="small muted" style="margin-top:4px">${hesc(h.at)} · ${h.pids.length} patient${h.pids.length>1?'s':''}${h.acceptedBy?' · <b style="color:var(--green)">Accepted by '+hesc(h.acceptedBy)+', '+hesc(h.acceptedAt)+'</b>':mine?' · <b style="color:var(--amber)">Waiting for '+hesc(h.to)+' to accept. You still see these patients.</b>':''}</div></div>
        <div class="row" style="gap:8px"><button class="btn sm" onclick="psyHoToggle('${h.id}')">${open?'Hide':'Show'} summary</button>${!mine&&!h.acceptedBy?`<button class="btn sm pri" onclick="psyHoAccept('${h.id}')">Accept handover</button>`:''}</div></div>
        ${open?h.pids.map(pid=>{const s=sbar(pid);return s?`<div class="ho-p"><div class="row" style="gap:8px"><button class="es-name" style="border:0;background:none;font:inherit;font-weight:700;cursor:pointer" onclick="go('#/patient/${pid}/overview')">${hesc(s.p.name)}</button><span class="small muted">${hesc(s.p.room)}</span></div>${sbarHtml(s,(h.rec||{})[pid])}</div>`:'';}).join(''):''}</section>`;};
    const doctors=(typeof TR_TO!=='undefined'?TR_TO.psy:[]).filter(n=>n!==me);
    const mk=p=>{const s=sbar(p.id);return `<div class="ho-p"><label class="row" style="gap:8px"><input type="checkbox" ${u.sel[p.id]===false?'':'checked'} onchange="psyHoSel('${p.id}',this.checked)"><b>${hesc(p.name)}</b><span class="small muted">${hesc(p.room)}</span></label>${sbarHtml(s,'')}
      <label class="field" style="margin-top:8px"><span class="tiny muted">What to watch tonight (1 to 2 lines)</span><textarea class="input" rows="2" oninput="psyHoRec('${p.id}',this.value)">${hesc(u.rec[p.id]||'')}</textarea></label></div>`;};
    return `<div class="ho"><div><h2>Handover</h2><div class="muted" style="margin-top:4px">For night duty, leave and transfers. The summary is built from the record; the receiving doctor accepts it and the acceptance is logged.</div></div>
      ${incoming.length?`<div class="lbl">To you</div>${incoming.map(h=>card(h,false)).join('')}`:''}
      <section class="card"><div class="hd"><div><h3>Hand over my patients</h3><div class="small muted" style="margin-top:4px">Untick patients who stay with you. Until the other doctor accepts, you still see them.</div></div>
        <div class="row" style="gap:8px"><select class="input" id="hoTo" style="min-height:34px;width:auto" onchange="store_to(this.value)" aria-label="Doctor who takes over"><option value="">Hand over to…</option>${doctors.map(n=>`<option ${u.to===n?'selected':''}>${hesc(n)}</option>`).join('')}</select>
        <select class="input" id="hoWhy" style="min-height:34px;width:auto" aria-label="Reason">${['Night duty','Going on leave','Transfer'].map(r=>`<option ${u.reason===r?'selected':''}>${r}</option>`).join('')}</select>
        <button class="btn pri" onclick="psyHoSend()">Send handover</button></div></div>${PTS.map(mk).join('')}</section>
      ${sent.length?`<div class="lbl">Sent by you</div>${sent.map(h=>card(h,true)).join('')}`:''}</div>`;
  }
  window.store_to=v=>{store().ui.to=v;};

  const prevR=ROLE.psychiatrist.render;
  ROLE.psychiatrist.render=function(base){
    const r=(location.hash||'').slice(2).split('/');
    if(r[0]==='handover'){renderSide(r);$('app').classList.remove('compact');$('title').textContent='Handover';$('view').innerHTML=page();window.scrollTo(0,0);return;}
    return prevR?prevR(base):base();
  };

  /* Transfer patient opens this summary */
  window.psyHoPeek=function(){
    const s=sbar(S.pid);if(!s)return;
    V3.modal('Handover summary · '+hesc(s.p.name),'What the new doctor will read. Check it before you transfer.',sbarHtml(s,''),`<button class="btn pri" onclick="closeModal();transferModal()">Back to transfer</button>`);
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
