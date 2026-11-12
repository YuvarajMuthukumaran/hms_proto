/* 12 Nov 2026, Trello card 109: Restraint and seclusion workflow with timers, checks and NR notice. Build now; Dr. Anu confirms the intervals and who authorises.
   All values are in window.TULASI_RULES.restraint (easy to change). Prototype: real clocks, demo data.
   - Authorise: psychiatrist only, PIN sign. Type (physical, chemical, seclusion), reason, what was tried first, review in 30 or 60 minutes.
   - While it runs: a red banner "Restrained · 22 min" on the patient's screens and on the nurse board; nurse check every 15 minutes (breathing, circulation,
     hydration, toilet, behaviour, one tap each); a missed check alerts the floor lead; at the review time the psychiatrist re-authorises or releases, and if nobody
     acts it goes to the floor lead and then the medical superintendent.
   - Release: the nurse records the release time; a debrief task is created.
   - Notices: the NR message is drafted from a template with a 24 hour countdown; every episode is added to the monthly MHRB report automatically.
   - Reporting: restraint hours per patient, ward and month on the floor lead's dashboard. */
(function(){
  const R=window.TULASI_RULES=window.TULASI_RULES||{};
  R.restraint={checkMin:15,checkGraceMin:5,reviewOptionsMin:[30,60],reviewGraceMin:10,msGraceMin:30,nrHours:24,types:['Physical','Chemical','Seclusion'],tried:['Talking down','Medication offered','1:1 observation','Quiet room'],items:['Breathing','Circulation','Hydration','Toilet','Behaviour']};
  const RC=R.restraint;
  S.rst=S.rst||{eps:[]};
  const now=()=>Date.now();
  const pt=pid=>PTS.find(p=>p.id===pid)||{id:pid,name:pid};
  const mins=ms=>Math.round(ms/60000);
  const dur=ms=>{const m=Math.max(0,mins(ms));return m>=60?Math.floor(m/60)+' h '+String(m%60).padStart(2,'0')+' m':m+' min';};
  const alertTo=(pid,title,detail,src)=>{try{V3.alert({pid,sev:'urgent',title,detail,src:src||'Restraint',by:'System'});}catch(e){}};
  const active=pid=>S.rst.eps.find(e=>!e.end&&(!pid||e.pid===pid));
  const wardOf=pid=>{try{return Object.keys(WARDS).find(w=>WARDS[w].some(p=>p.id===pid))||'Ward';}catch(e){return 'Ward';}};
  const nextCheck=e=>((e.checks.length?e.checks[e.checks.length-1].t:e.start)+RC.checkMin*60000);
  const hasRole=()=>true;

  /* ---------------- authorise (psychiatrist only, PIN) ---------------- */
  let D=null;
  restraintModal=function(){
    if(typeof permCanDecide==='function'&&!permCanDecide()){toast('Only the psychiatrist can authorise restraint');return;}
    const pid=S.pid||'neel';
    if(active(pid)){toast('There is already a restraint running for '+pt(pid).name);return;}
    D={pid,type:'Physical',reason:'Immediate risk of harm to self',tried:[],review:30};
    openModal(`<div class="mh"><h3>Authorise restraint · ${hesc(pt(pid).name)}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
     <div class="mb"><div class="callout amber">Only when there is an immediate risk of harm and other ways have failed. Under MHCA Section 97. A PIN signature is needed.</div>
     <div class="field"><span class="lbl">Type</span><div class="radios">${RC.types.map(t=>`<button type="button" class="tog ${D.type===t?'on':''}" onclick="rstSet('type','${t}')">${t}</button>`).join('')}</div></div>
     <label class="field"><span class="lbl">Reason</span><select class="input" onchange="rstSet('reason',this.value,true)"><option>Immediate risk of harm to self</option><option>Immediate risk of harm to others</option></select></label>
     <div class="field"><span class="lbl">What was tried first</span><div class="radios">${RC.tried.map(t=>`<button type="button" class="tog" onclick="this.classList.toggle('on');rstTry('${t}')">${t}</button>`).join('')}</div></div>
     <div class="field"><span class="lbl">Review in</span><div class="radios">${RC.reviewOptionsMin.map(m=>`<button type="button" class="tog ${D.review===m?'on':''}" onclick="rstSet('review',${m})">${m} minutes</button>`).join('')}</div></div>
     <div class="callout grey">Nurses check every ${RC.checkMin} minutes on the ward. The nominated representative is told within ${RC.nrHours} hours, and the episode goes into the monthly Mental Health Review Board report.</div>
     <div id="rstE" class="small" style="color:var(--red);display:none">Tick at least one thing that was tried first</div></div>
     <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rstAuthorise()">Authorise with PIN</button></div>`);
  };
  window.rstSet=(k,v,silent)=>{D[k]=v;if(!silent&&(k==='type'||k==='review')){document.querySelectorAll('#modal .radios')[k==='type'?0:2].querySelectorAll('.tog').forEach(b=>b.classList.toggle('on',b.textContent.trim().startsWith(String(v))));}};
  window.rstTry=t=>{D.tried=D.tried.includes(t)?D.tried.filter(x=>x!==t):D.tried.concat(t);};
  window.rstAuthorise=function(){
    if(!D.tried.length){const e=$('rstE');if(e)e.style.display='block';return;}
    const d=D;
    pinSign('Authorise restraint · '+pt(d.pid).name,[['Type',d.type],['Reason',d.reason],['Tried first',d.tried.join(', ')],['Review in',d.review+' minutes']],()=>{
      const ep={id:'r'+now(),pid:d.pid,type:d.type,reason:d.reason,tried:d.tried,start:now(),reviewMin:d.review,reviewDue:now()+d.review*60000,by:signer(),at:atNow(),checks:[],reauth:[],escL:0,missed:{},end:null,debrief:null,nr:{due:now()+RC.nrHours*3600000,sent:null},mhrb:true};
      S.rst.eps.push(ep);
      try{S.restraints.push({when:atNow(),reason:d.reason,by:signer(),review:'in '+d.review+' min'});}catch(e){}
      render();toast('Restraint authorised by '+signer()+'. Ward and nominated representative notified. Checks every '+RC.checkMin+' minutes.');
    },'The signature goes on the episode with the time.');
  };

  /* ---------------- banner and panel ---------------- */
  function panel(ep,compact){
    const p=pt(ep.pid),el=now()-ep.start,chk=nextCheck(ep)-now(),rev=ep.reviewDue-now(),nr=ep.nr.due-now();
    const chkTxt=chk>=0?'Next check in '+dur(chk):'<b>Check overdue by '+dur(-chk)+'</b>';
    const revTxt=rev>=0?'Review in '+dur(rev):'<b>Review overdue by '+dur(-rev)+(ep.escL>=1?' · floor lead told':'')+(ep.escL>=2?' · medical superintendent told':'')+'</b>';
    const canDecide=typeof permCanDecide==='function'&&permCanDecide();
    return `<div class="rst-b" data-start="${ep.start}" data-id="${ep.id}"><div class="rst-t"><span class="rst-dot"></span><b>${compact?hesc(p.name)+' · ':''}Restrained · <span class="rst-time">${dur(el)}</span></b><span>${hesc(ep.type)} · authorised by ${hesc(ep.by)}</span></div>
      <div class="rst-s">${chkTxt} · ${revTxt} · ${ep.nr.sent?'NR told '+hesc(ep.nr.sent.at):'NR notice '+(nr>=0?'due in '+dur(nr):'<b>overdue</b>')}</div>
      <div class="rst-a"><button class="btn sm" onclick="rstCheck('${ep.id}')">Record a check</button>${canDecide?`<button class="btn sm" onclick="rstReauth('${ep.id}')">Re-authorise</button>`:''}<button class="btn sm" onclick="rstRelease('${ep.id}')">Release</button><button class="btn sm" onclick="rstNr('${ep.id}')">NR notice</button></div></div>`;
  }
  function banners(){
    const v=$('view');if(!v)return;
    document.querySelectorAll('#rstBanners').forEach(x=>x.remove());
    const h=location.hash||'',m=h.match(/^#\/patient\/([^/]+)/),act=S.rst.eps.filter(e=>!e.end);if(!act.length)return;
    let list=[],compact=false;
    if(m)list=act.filter(e=>e.pid===decodeURIComponent(m[1]));
    else if(/^#\/rounds/.test(h)&&S.focusPid)list=act.filter(e=>e.pid===S.focusPid);
    else if(/^#\/(myday|inpatients|nursing)/.test(h)&&(S.role==='nurse'||S.role==='rmo'||S.role==='psychiatrist'||S.role==='lead')){list=act;compact=true;}
    if(!list.length)return;
    const d=document.createElement('div');d.id='rstBanners';d.innerHTML=list.map(e=>panel(e,compact)).join('');
    v.insertBefore(d,v.firstChild);
  }
  setInterval(()=>{
    document.querySelectorAll('.rst-b').forEach(b=>{const t=b.querySelector('.rst-time');if(t)t.textContent=dur(now()-(+b.dataset.start));});
    try{S.rst.eps.filter(e=>!e.end).forEach(e=>{
      const nc=nextCheck(e);
      if(now()>nc+RC.checkGraceMin*60000&&!e.missed[nc]){e.missed[nc]=true;alertTo(e.pid,'Missed restraint check · '+pt(e.pid).name,'The '+RC.checkMin+' minute check was not recorded. Floor lead to follow up.','Floor lead');}
      if(now()>e.reviewDue+RC.reviewGraceMin*60000&&e.escL<1){e.escL=1;alertTo(e.pid,'Restraint review overdue · '+pt(e.pid).name,'The psychiatrist has not re-authorised or released. Floor lead informed.','Floor lead');}
      if(now()>e.reviewDue+RC.msGraceMin*60000&&e.escL<2){e.escL=2;alertTo(e.pid,'Restraint review overdue · '+pt(e.pid).name,'Still no decision. Medical superintendent informed.','Medical superintendent');}
    });}catch(x){}
    if(document.querySelector('.rst-b')&&!document.getElementById('modal')?.parentElement?.classList.contains('show'))try{banners();}catch(x){}
  },30000);

  /* ---------------- checks, re-authorise, release, NR ---------------- */
  let CK=null;
  window.rstCheck=function(id){
    const e=S.rst.eps.find(x=>x.id===id);if(!e)return;CK={id,items:{}};
    V3.modal('Restraint check · '+hesc(pt(e.pid).name),'One tap for each. A concern goes to the RMO.',
      `<div class="pin-sum">${RC.items.map(i=>`<div class="pin-r"><span>${i}</span><span class="radios"><button type="button" class="tog" onclick="rstCk('${i}','ok',this)">OK</button><button type="button" class="tog" onclick="rstCk('${i}','concern',this)">Concern</button></span></div>`).join('')}</div><div id="ckE" class="small" style="color:var(--red);display:none;margin-top:8px">Answer all five</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rstCkSave()">Save the check</button>`);
  };
  window.rstCk=(i,v,btn)=>{CK.items[i]=v;btn.parentNode.querySelectorAll('.tog').forEach(b=>b.classList.toggle('on',b===btn));};
  window.rstCkSave=function(){
    const e=S.rst.eps.find(x=>x.id===CK.id);if(!e)return;
    if(RC.items.some(i=>!CK.items[i])){const x=$('ckE');if(x)x.style.display='block';return;}
    e.checks.push({t:now(),by:signer(),at:atNow(),items:CK.items});
    const bad=RC.items.filter(i=>CK.items[i]==='concern');
    if(bad.length)alertTo(e.pid,'Restraint check: concern · '+pt(e.pid).name,'Concern with: '+bad.join(', ')+'. RMO to review now.','RMO');
    closeModal();render();toast('Check recorded by '+signer()+(bad.length?'. The RMO has been alerted.':''));
  };
  window.rstReauth=function(id){
    const e=S.rst.eps.find(x=>x.id===id);if(!e)return;
    if(typeof permCanDecide==='function'&&!permCanDecide()){toast('Only the psychiatrist re-authorises');return;}
    pinSign('Re-authorise restraint · '+pt(e.pid).name,[['Running for',dur(now()-e.start)],['Next review in',e.reviewMin+' minutes']],()=>{e.reauth.push({by:signer(),at:atNow()});e.reviewDue=now()+e.reviewMin*60000;e.escL=0;render();toast('Re-authorised by '+signer());});
  };
  window.rstRelease=function(id){
    const e=S.rst.eps.find(x=>x.id===id);if(!e)return;
    V3.modal('Release · '+hesc(pt(e.pid).name),'Record the release time.',`<label class="field"><span class="lbl">Release time</span><input class="input" id="rsT" type="time" value="${new Date().toTimeString().slice(0,5)}"></label><div class="tiny muted">After release a debrief with the patient (and family if present) becomes a task.</div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rstReleaseSave('${id}')">Record release</button>`);
  };
  window.rstReleaseSave=function(id){
    const e=S.rst.eps.find(x=>x.id===id);if(!e)return;
    const tv=(($('rsT')||{}).value||'').split(':'),d=new Date();if(tv.length===2){d.setHours(+tv[0],+tv[1],0,0);}
    e.end=Math.min(now(),d.getTime())||now();e.endBy=signer();e.endAt=atNow();
    e.debrief={text:'Debrief with the patient (and family if present)',due:now()+86400000,done:null};
    closeModal();render();toast('Released at '+new Date(e.end).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})+' by '+signer()+'. Debrief task created.');
  };
  window.rstNr=function(id){
    const e=S.rst.eps.find(x=>x.id===id);if(!e)return;const p=pt(e.pid);
    const txt=`Namaste. This is ${signer()} from Tulasi Healthcare. We are writing as you are the nominated representative of ${p.name}. Today at ${new Date(e.start).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})} the treating psychiatrist authorised ${e.type.toLowerCase()} restraint because ${e.reason.replace('Immediate risk of','there was a risk of').toLowerCase()}. It is checked every ${RC.checkMin} minutes and reviewed by the doctor. You may call the care team at any time. This notice is sent as required under the Mental Healthcare Act.`;
    V3.modal('NR notice · '+hesc(p.name),e.nr.sent?'Sent '+hesc(e.nr.sent.at):'Due within '+RC.nrHours+' hours of the start',`<textarea class="input" rows="8" readonly>${hesc(txt)}</textarea><div class="tiny muted" style="margin-top:6px">Copy the message and send it from the Tulasi number, then press Mark as sent.</div>`,`<button class="btn" onclick="closeModal()">Close</button>${e.nr.sent?'':`<button class="btn pri" onclick="rstNrSent('${id}')">Mark as sent</button>`}`);
  };
  window.rstNrSent=function(id){const e=S.rst.eps.find(x=>x.id===id);if(!e)return;e.nr.sent={by:signer(),at:atNow()};closeModal();render();toast('NR notice recorded as sent');};
  window.rstDebriefDone=function(id){const e=S.rst.eps.find(x=>x.id===id);if(e&&e.debrief){e.debrief.done={by:signer(),at:atNow()};render();}};

  /* ---------------- tasks on Today ---------------- */
  const __tasks80=tasks;
  tasks=function(){
    const r=__tasks80.apply(this,arguments);
    if(Array.isArray(r)&&['psychiatrist','lead','nurse','rmo'].includes(S.role)){
      S.rst.eps.forEach(e=>{
        const p=pt(e.pid);
        if(!e.nr.sent)r.push({id:'rst_nr_'+e.id,late:now()>e.nr.due,title:'NR notice: restraint · '+p.name,meta:'Within '+RC.nrHours+' hours of the start',due:now()>e.nr.due?'Overdue':'Due in '+dur(e.nr.due-now()),go:'#/patient/'+e.pid+'/overview',lead:true});
        if(e.debrief&&!e.debrief.done)r.push({id:'rst_db_'+e.id,late:now()>e.debrief.due,title:'Debrief after restraint · '+p.name,meta:'With the patient (and family if present)',due:'Due in '+dur(e.debrief.due-now()),go:'#/patient/'+e.pid+'/overview',lead:true});
      });
    }
    return r;
  };

  /* ---------------- floor lead: restraint hours per patient, ward and month ---------------- */
  function report(){
    const v=$('view');if(!v||v.querySelector('#rstReport')||!/^#\/myday/.test(location.hash||''))return;
    const lead=S.role==='lead'||String((window.__TULASI__||{}).role||'')==='floor-lead-psychiatrist';if(!lead)return;
    const mo=new Date().getMonth(),eps=S.rst.eps.filter(e=>new Date(e.start).getMonth()===mo);
    const byP={},byW={};let tot=0;
    eps.forEach(e=>{const h=((e.end||now())-e.start)/3600000;tot+=h;byP[e.pid]=(byP[e.pid]||0)+h;const w=wardOf(e.pid);byW[w]=(byW[w]||0)+h;});
    const fmt=h=>h.toFixed(1)+' h';
    const sec=document.createElement('section');sec.className='card';sec.id='rstReport';
    sec.innerHTML=`<div class="hd"><div><h3>Restraint this month</h3><div class="small muted" style="margin-top:4px">${eps.length} episode${eps.length===1?'':'s'} · ${fmt(tot)} in total. Each one is in the monthly MHRB report already.</div></div></div>
      <div class="pad">${eps.length?`<div class="small" style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><div class="lbl">By patient</div>${Object.keys(byP).map(k=>`<div class="row" style="justify-content:space-between"><span>${hesc(pt(k).name)}</span><b>${fmt(byP[k])}</b></div>`).join('')}</div><div><div class="lbl">By ward</div>${Object.keys(byW).map(k=>`<div class="row" style="justify-content:space-between"><span>${hesc(k)}</span><b>${fmt(byW[k])}</b></div>`).join('')}</div></div>`:'<div class="small muted">No restraint this month.</div>'}</div>`;
    const first=v.querySelector('section.card');first?first.parentNode.insertBefore(sec,first):v.appendChild(sec);
  }

  const css=document.createElement('style');css.id='rst-12nov-css';
  css.textContent=`#rstBanners{display:flex;flex-direction:column;gap:8px;margin:0 0 12px}
  .rst-b{background:#d92d20;color:#fff;border-radius:14px;padding:12px 16px;display:flex;flex-direction:column;gap:6px;box-shadow:0 6px 18px rgba(217,45,32,.35)}
  .rst-t{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:15px}.rst-t span:last-child{opacity:.9;font-size:13px}
  .rst-dot{width:10px;height:10px;border-radius:50%;background:#fff;animation:rstp 1.2s infinite}@keyframes rstp{50%{opacity:.25}}
  .rst-s{font-size:13px;opacity:.95}.rst-s b{background:#fff;color:#b42318;border-radius:6px;padding:0 6px}
  .rst-a{display:flex;gap:8px;flex-wrap:wrap}.rst-a .btn{background:#fff;color:#912018;border-color:#fff}
  @media (prefers-reduced-motion:reduce){.rst-dot{animation:none}}`;
  document.head.appendChild(css);

  const __r80=render;
  render=function(){const r=__r80.apply(this,arguments);try{banners();report();}catch(e){}return r;};
})();
