
/* Psychiatrist only (5 Nov 2026). UPDATED: the handover page now follows Anu's format (one page per patient); see the comment above FIELDS. The older SBAR text below is kept for history.
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
    if(!S.psyHO)S.psyHO={list:[{id:'ho0',from:'Dr. Rohan Mehta',to:'Dr. Aanya Sharma',reason:'On leave',at:'3 Nov 2026, 6:10 pm',pids:['sameer','dev'],rec:{sameer:'Rituals reduced on fluoxetine. Watch sleep tonight; call the RMO if he refuses food.',dev:'Day 15, opioid dependence, discharge planned. Check cravings at night; naltrexone due after dinner.'},status:'sent'}],ui:{to:'',reason:'Night duty',sel:{},rec:{}}};
    return S.psyHO;
  }
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
    return `<section class="card hn-page"><div class="hn-head"><div><h3>${hesc(p.name)}</h3><div class="small muted">${hesc([(window.psyAgeSex?psyAgeSex(p):''),p.room,p.uhid?'UHID '+p.uhid:''].filter(Boolean).join(' · '))} · Handover notes for Psychiatrist</div></div>${o.pdf||''}</div>
      <div class="hn-groups">${content}</div>${sig}</section>`;
  }
  window.psyHnSet=function(pid,k,v){uiN()[pid]=uiN()[pid]||{};uiN()[pid][k]=v;};
  window.psyHnCur=function(pid){store().ui.cur=pid;render();};
  window.psyHnHCur=function(id,pid){const h=store().list.find(x=>x.id===id);if(h){h.cur=pid;render();}};
  window.psyHnPdf=function(id,pid){
    const h=id?store().list.find(x=>x.id===id):null,vals=h?noteFor(h,pid):snap(pid),p=ptFind(pid);
    const rows=FIELDS.map(([k,l])=>`<div class="n"><div class="m"><b>${hesc(l)}</b></div>${nl2br(vals[k])||'—'}</div>`).join('');
    psyPdf('Handover notes for Psychiatrist',`<h2>Handover notes for Psychiatrist</h2>${rows}<table style="margin-top:10px"><tr><th>Handover given by</th><th>Handed over to</th></tr><tr><td>${hesc(h?h.from:signer())}${h?'<br>'+hesc(h.at):''}</td><td>${hesc(h?h.to:store().ui.to||'')}${h&&h.acceptedBy?'<br>'+hesc(h.acceptedBy+' · '+h.acceptedAt):''}</td></tr></table>`,p);
  };

  window.psyHoAccept=function(id){
    const h=store().list.find(x=>x.id===id);if(!h||h.acceptedBy)return;
    h.acceptedBy=signer();h.acceptedAt=atNow();h.status='accepted';
    h.pids.forEach(pid=>{try{PSYOF[pid]=h.to;ptCtxOf(pid).team.psy=h.to;}catch(e){}});
    render();toast('Handover accepted by '+signer()+'. The patients are now yours.');
  };
  window.psyHoSel=function(pid,on){store().ui.sel[pid]=!!on;render();};
  window.psyHoSend=function(){
    const st=store(),u=st.ui;u.to=($('hoTo')||{}).value||u.to;u.reason=($('hoWhy')||{}).value||u.reason;
    const pids=PTS.filter(p=>u.sel[p.id]!==false).map(p=>p.id);
    if(!u.to){toast('Choose the doctor who takes over');return;}
    if(!pids.length){toast('Pick at least one patient');return;}
    /* what the next doctor needs most is the plan: it must not be left empty */
    const missing=pids.filter(id=>!valOf(id,'future').trim());
    if(missing.length){u.cur=missing[0];render();toast('Write the future directions for '+missing.map(id=>ptFind(id).name).join(', ')+' first');return;}
    const notes={};pids.forEach(id=>{notes[id]=snap(id);});
    st.list.unshift({id:'ho'+Date.now(),from:signer(),to:u.to,reason:u.reason,at:atNow(),pids,notes,status:'sent'});
    u.notes={};render();toast('Handover sent to '+u.to+'. You still see these patients until '+u.to+' accepts.');
  };
  window.psyHoToggle=function(id){const h=store().list.find(x=>x.id===id);if(h){h.open=!h.open;render();}};

  function page(){
    const st=store(),u=st.ui,me=signer();
    const incoming=st.list.filter(h=>h.to===me),sent=st.list.filter(h=>h.from===me);
    const card=(h,mine)=>{
      const open=h.open!==false,cur=h.pids.includes(h.cur)?h.cur:h.pids[0];
      return `<section class="card"><div class="hd"><div><h3>${mine?'To '+hesc(h.to):'From '+hesc(h.from)} · ${hesc(h.reason)}</h3><div class="small muted" style="margin-top:4px">${hesc(h.at)} · ${h.pids.length} patient${h.pids.length>1?'s':''}${h.acceptedBy?' · <b style="color:var(--green)">Accepted by '+hesc(h.acceptedBy)+', '+hesc(h.acceptedAt)+'</b>':mine?' · <b style="color:var(--amber)">Waiting for '+hesc(h.to)+' to accept. You still see these patients.</b>':''}</div></div>
        <div class="row" style="gap:8px"><button class="btn sm" onclick="psyHoToggle('${h.id}')">${open?'Hide':'Show'} notes</button>${!mine&&!h.acceptedBy?`<button class="btn sm pri" onclick="psyHoAccept('${h.id}')">Accept handover</button>`:''}</div></div>
        ${open?`<div style="padding:0 16px 16px"><div class="hn-tabs">${h.pids.map(pid=>`<button class="${pid===cur?'on':''}" onclick="psyHnHCur('${h.id}','${pid}')">${hesc((ptFind(pid)||{}).name||pid)}</button>`).join('')}</div>
          ${notePage(cur,noteFor(h,cur),true,{from:h.from,to:h.to,at:h.at,accepted:h.acceptedBy?h.acceptedBy+', '+h.acceptedAt:'',pdf:`<button class="btn sm" onclick="psyHnPdf('${h.id}','${cur}')">PDF</button>`})}</div>`:''}</section>`;};
    const doctors=(typeof TR_TO!=='undefined'?TR_TO.psy:[]).filter(n=>n!==me);
    const cur=PTS.some(p=>p.id===u.cur)?u.cur:PTS[0].id;
    const list=PTS.map(p=>{const inc=u.sel[p.id]!==false,miss=inc&&!valOf(p.id,'future').trim();
      return `<div class="hn-pt ${p.id===cur?'on':''}" role="button" tabindex="0" onclick="psyHnCur('${p.id}')" onkeydown="if(event.key==='Enter')psyHnCur('${p.id}')"><input type="checkbox" ${inc?'checked':''} aria-label="Hand over ${hesc(p.name)}" onclick="event.stopPropagation()" onchange="psyHoSel('${p.id}',this.checked)"><span style="min-width:0"><b>${hesc(p.name)}</b><span class="tiny muted" style="display:block">${hesc(p.room)}</span></span><span class="hn-st ${!inc?'off':miss?'add':'ok'}">${!inc?'Stays with you':miss?'To add':'Ready'}</span></div>`;}).join('');
    return `<div class="ho"><div><h2>Handover</h2><div class="muted" style="margin-top:4px">One page per patient. What the system already knows is filled in; you add what is missing. Your entries are kept as you type.</div></div>
      ${incoming.length?`<div class="lbl">To you</div>${incoming.map(h=>card(h,false)).join('')}`:''}
      <section class="card"><div class="hd"><div><h3>Hand over my patients</h3><div class="small muted" style="margin-top:4px">Untick patients who stay with you. Until the other doctor accepts, you still see them.</div></div>
        <div class="row" style="gap:8px"><select class="input" id="hoTo" style="min-height:34px;width:auto" onchange="store_to(this.value)" aria-label="Doctor who takes over"><option value="">Hand over to…</option>${doctors.map(n=>`<option ${u.to===n?'selected':''}>${hesc(n)}</option>`).join('')}</select>
        <select class="input" id="hoWhy" style="min-height:34px;width:auto" aria-label="Reason">${['Night duty','Going on leave','Transfer'].map(r=>`<option ${u.reason===r?'selected':''}>${r}</option>`).join('')}</select>
        <button class="btn pri" onclick="psyHoSend()">Send handover</button></div></div>
        <div class="hn-wrap"><div class="hn-list">${list}</div><div style="min-width:0">${notePage(cur,snap(cur),false,{})}</div></div></section>
      ${sent.length?`<div class="lbl">Sent by you</div>${sent.map(h=>card(h,true)).join('')}`:''}</div>`;
  }
  window.psyHandoverPage=page;
  window.store_to=v=>{store().ui.to=v;};

  const prevR=ROLE.psychiatrist.render;
  ROLE.psychiatrist.render=function(base){
    const r=(location.hash||'').slice(2).split('/');
    if(r[0]==='handover'){renderSide(r);$('app').classList.remove('compact');$('title').textContent='Handover';$('view').innerHTML=page();window.scrollTo(0,0);return;}
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
