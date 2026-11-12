/* 12 Nov 2026, Trello cards 105 (MHCA clock) and 112 (Log event follow-up checklists). Build now, rules to be reviewed by Dr. Anu.
   Every rule value is in window.TULASI_RULES (RULES.mhca, RULES.events) so it is easy to change in one place.
   105: legal status with days left in the patient header, a Legal status (MHCA) card on the psychiatrist's Stay summary (advance directive required,
        capacity reviews every 7 days under Section 89 and every 14 days under Section 90, the day 25 choice that cannot be dismissed, NR notices, MHRB tasks),
        overdue MHCA items on the psychiatrist's Today and the floor lead's dashboard.
   112: logging an event creates its own checklist with owners and due times, adds risk tags, alerts people, and keeps the event open on the patient and the
        floor lead's dashboard until every follow-up is done; overdue follow-ups escalate to the floor lead. Three refusals in 48 hours alert the psychiatrist.
   Prototype: demo data and demo clocks. Nothing here is sent anywhere. */
(function(){
  const R=window.TULASI_RULES=window.TULASI_RULES||{};
  R.mhca={captureDays:{'89':7,'90':14},prompt89Day:25,limit89Day:30};
  /* [task, owner, minutes until due] per event type */
  R.events={
    'Fall':{tags:['Falls risk'],tasks:[['Nurse: vitals and injury check','Nurse',15],['RMO review','RMO',60],['Fall precautions on the nurse board','Nurse',10]]},
    'Self-harm attempt':{alert:['Psychiatrist','Floor lead'],tasks:[['Raise the observation level (suggested: every 15 minutes)','Psychiatrist',30],['Room safety check','Nurse',30],['Open the incident report','Floor lead',240],['Inform the nominated representative','Treating team',1440]]},
    'Aggression or violence':{alert:['Psychiatrist'],tasks:[['Offer the restraint workflow if needed','Psychiatrist',15],['Staff injury check','Floor lead',60],['Open the incident report','Floor lead',240]]},
    'Absconding attempt':{tags:['Absconding risk'],alert:['Floor lead','Security'],tasks:[['Inform the nominated representative','Treating team',60],['If out of the building: police and MHCA intimation','Floor lead',120]]},
    'Seizure':{tasks:[['RMO paged','RMO',5],['Vitals every 15 minutes','Nurse',15],['Transfer-out checklist if needed','RMO',60]]},
    'Medical emergency or transfer out':{tasks:[['RMO paged','RMO',5],['Vitals every 15 minutes','Nurse',15],['Transfer-out checklist if needed','RMO',60]]},
    'Adverse drug reaction':{tasks:[['Medicine flagged on the chart','Nurse',15],['Update the allergy list','Psychiatrist',60],['Psychiatrist reviews the order','Psychiatrist',120]]},
    'Consent or form pending from family':{tasks:[['Take the consent or form from the family','Front desk',1440]]},
    'History or paperwork incomplete':{tasks:[['Finish the history and paperwork','Treating team',1440]]},
    'Admission out of hours, workup pending':{tasks:[['Admission workup','RMO',480],['History and Form E','Treating team',1440]]},
    refusals:{count:3,hours:48}
  };
  const px=pid=>psyPx(pid);
  const pt=pid=>PTS.find(p=>p.id===pid)||{id:pid,name:pid};
  const now=()=>Date.now();
  const mins=ms=>Math.round(ms/60000);
  const dur=ms=>{const m=Math.abs(mins(ms));return m>=1440?Math.floor(m/1440)+' d '+Math.floor(m%1440/60)+' h':m>=60?Math.floor(m/60)+' h '+m%60+' m':m+' m';};
  const doc=()=>S.role==='psychiatrist'&&!/psycholog|patient-experience/.test(String((window.__TULASI__||{}).role||''));
  const floor=()=>S.role==='lead'||(String((window.__TULASI__||{}).role||'')==='floor-lead-psychiatrist');
  const alertTo=(pid,title,detail,src)=>{try{V3.alert({pid,sev:'urgent',title,detail,src:src||'Rules',by:'System'});}catch(e){}};

  /* ============================== 105: MHCA ============================== */
  const mh=pid=>{const x=px(pid);if(!x.mhca){const p=pt(pid),old=(+p.day||0)>0;x.mhca={ad:old?'Absent':'',adBy:old?'At admission':'',adAt:'',capDone:0,decision:'',nr:old?{rights:{by:'At admission',at:''}}:{},mhrb:{}};}return x.mhca;};
  function legal(pid){
    const p=pt(pid),sec=String(p.sec||''),day=+p.day||0,m=mh(pid);
    const limit=R.mhca.limit89Day,left=sec==='89'?Math.max(0,limit-day):null;
    const every=R.mhca.captureDays[sec]||0,expected=every?Math.floor(day/every):0,overdue=Math.max(0,expected-(m.capDone||0));
    return {p,sec,day,left,every,expected,overdue,m,promptDue:sec==='89'&&day>=R.mhca.prompt89Day&&!m.decision};
  }
  window.mhcaLegal=legal;
  const SEC_TXT={'86':'Section 86 · independent admission','89':'Section 89 · supported admission','90':'Section 90 · beyond 30 days'};

  /* tasks on Today (psychiatrist) and the floor lead's list */
  function mhcaTasks(){
    const out=[];
    PTS.forEach(p=>{
      const L=legal(p.id),m=L.m;
      if(L.overdue>0)out.push({id:'mhca_cap_'+p.id,late:true,title:'Capacity review · '+p.name,meta:'Section '+L.sec+', every '+L.every+' days. Treating psychiatrist',due:L.overdue+(L.overdue>1?' reviews':' review')+' due',go:'#/patient/'+p.id+'/overview',lead:true,mhca:true});
      if(L.promptDue)out.push({id:'mhca_d25_'+p.id,late:true,title:'Choose before day 30 · '+p.name,meta:'Section 89, day '+L.day+' of 30: apply for Section 90, switch to independent (Form C) or plan discharge',due:L.left+' days left',go:'#/patient/'+p.id+'/overview',lead:true,mhca:true});
      if(!m.ad&&L.sec)out.push({id:'mhca_ad_'+p.id,late:true,title:'Advance directive not asked · '+p.name,meta:'Required at admission',due:'Required',go:'#/patient/'+p.id+'/overview',lead:true,mhca:true});
      if(L.day<=1&&!m.nr.rights)out.push({id:'mhca_nr_'+p.id,title:'Tell the nominated representative their rights · '+p.name,meta:'At admission',due:'Today',go:'#/patient/'+p.id+'/overview',lead:true,mhca:true});
      (m.tasks||[]).filter(t=>!t.done).forEach(t=>out.push({id:'mhca_t_'+t.id,late:t.due<now(),title:t.text+' · '+p.name,meta:t.meta,due:t.due<now()?'Overdue':'Due '+new Date(t.due).toLocaleDateString('en-GB',{day:'numeric',month:'short'}),go:'#/patient/'+p.id+'/overview',lead:true,mhca:true}));
    });
    return out;
  }
  const __tasks=tasks;
  tasks=function(){
    const r=__tasks.apply(this,arguments);
    if(!Array.isArray(r))return r;
    if(S.role==='psychiatrist'&&doc()||S.role==='lead'){
      const have=new Set(r.map(t=>t.id));
      mhcaTasks().filter(t=>!have.has(t.id)).forEach(t=>r.push(S.role==='lead'?t:Object.assign({},t,{lead:false})));
    }
    return r;
  };

  window.mhcaAd=function(pid,v){mh(pid).ad=v;mh(pid).adBy=signer();mh(pid).adAt=atNow();render();toast('Advance directive recorded: '+v);};
  window.mhcaCap=function(pid){
    const done=()=>{const m=mh(pid);m.capDone=(m.capDone||0)+1;m.capLast={by:signer(),at:atNow()};render();toast('Capacity review recorded by '+signer());};
    if(typeof pinSign==='function')pinSign('Record the capacity review · '+pt(pid).name,[['Section',legal(pid).sec],['Signing as',signer()]],done);else done();
  };
  window.mhcaNr=function(pid,k){mh(pid).nr[k]={by:signer(),at:atNow()};render();toast('NR notice recorded');};
  window.mhcaTaskDone=function(pid,id){const t=(mh(pid).tasks||[]).find(x=>x.id===id);if(t){t.done={by:signer(),at:atNow()};render();}};
  /* the day 25 choice cannot be dismissed */
  window.mhcaChoose=function(pid,k){
    const m=mh(pid),label={s90:'Apply for Section 90',indep:'Switch to independent admission (Form C)',dc:'Plan discharge'}[k];
    m.decision=k;m.decisionBy=signer();m.decisionAt=atNow();m.tasks=m.tasks||[];
    const add=(text,meta,days)=>m.tasks.push({id:k+Date.now()+Math.random().toString(36).slice(2,5),text,meta,due:now()+days*86400000,done:null});
    if(k==='s90'){add('MHRB intimation: Section 90 application','Mental Health Review Board',3);add('NR notice: change of admission type','Within 7 days',7);}
    if(k==='indep'){add('Form C: independent admission','Patient signs on the tablet',2);add('NR notice: change of admission type','Within 7 days',7);}
    if(k==='dc'){add('Discharge plan: set the expected discharge date','Before day 30',2);}
    const o=document.getElementById('mhcaPrompt');if(o)o.remove();render();toast('Recorded: '+label+'. The follow-up tasks are on Today.');
  };
  function dayPrompt(){
    if(!doc()||document.getElementById('mhcaPrompt'))return;
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)/);if(!m)return;
    const L=legal(m[1]);if(!L.promptDue)return;
    const o=document.createElement('div');o.id='mhcaPrompt';o.setAttribute('role','alertdialog');o.setAttribute('aria-modal','true');
    o.innerHTML=`<div class="mhp"><h3>Section 89, day ${L.day} of 30 · ${hesc(L.p.name)}</h3><p>The 30 days end in ${L.left} day${L.left===1?'':'s'}. Choose what happens next. This cannot be closed without a choice.</p>
      <button class="btn pri" onclick="mhcaChoose('${L.p.id}','s90')">Apply for Section 90</button><button class="btn pri" onclick="mhcaChoose('${L.p.id}','indep')">Switch to independent admission (Form C)</button><button class="btn pri" onclick="mhcaChoose('${L.p.id}','dc')">Plan discharge</button></div>`;
    document.body.appendChild(o);
  }
  function legalCard(){
    const v=$('view');if(!v||!doc()||v.querySelector('#mhcaCard'))return;
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)\/overview/);if(!m||!legal(m[1]).sec)return;
    const L=legal(m[1]),M=L.m,id=L.p.id;
    const adTxt=M.ad?`<span class="chip c-green">${hesc(M.ad)}</span> <span class="tiny muted">${hesc(M.adBy||'')}, ${hesc(M.adAt||'')}</span>`:`<span class="chip c-red">Not asked yet · required</span> <button class="btn sm" onclick="mhcaAd('${id}','Absent')">Absent</button> <button class="btn sm" onclick="mhcaAd('${id}','Present')">Present</button>`;
    const cap=L.every?(L.overdue>0?`<span class="chip c-red">${L.overdue} review${L.overdue>1?'s':''} overdue</span> <button class="btn sm pri" onclick="mhcaCap('${id}')">Record the capacity review</button>`:`<span class="chip c-green">Up to date</span> <span class="tiny muted">Next review in ${L.every-(L.day%L.every)} days</span>`):'<span class="muted small">No fixed review under this section</span>';
    const dec=L.sec==='89'?(M.decision?`<span class="chip c-green">${{s90:'Applying for Section 90',indep:'Switching to independent',dc:'Discharge planned'}[M.decision]}</span> <span class="tiny muted">${hesc(M.decisionBy||'')}, ${hesc(M.decisionAt||'')}</span>`:(L.day>=R.mhca.prompt89Day?'<span class="chip c-red">Choice needed now</span>':`<span class="muted small">Asked from day ${R.mhca.prompt89Day}</span>`)):'';
    const nr=[['rights','Rights explained to the nominated representative'],['change','Change of admission type told to the NR']].map(x=>`<div class="row small" style="gap:8px;justify-content:space-between"><span>${x[1]}</span>${M.nr[x[0]]?`<span class="tiny muted">Done ${hesc(M.nr[x[0]].at)}</span>`:`<button class="btn sm" onclick="mhcaNr('${id}','${x[0]}')">Mark done</button>`}</div>`).join('');
    const tk=(M.tasks||[]).map(t=>`<div class="row small" style="gap:8px;justify-content:space-between"><span>${hesc(t.text)} <span class="tiny muted">· ${hesc(t.meta||'')}</span></span>${t.done?`<span class="tiny muted">Done ${hesc(t.done.at)}</span>`:`<button class="btn sm" onclick="mhcaTaskDone('${id}','${t.id}')">Mark done</button>`}</div>`).join('');
    const sec=document.createElement('section');sec.className='card';sec.id='mhcaCard';
    sec.innerHTML=`<div class="hd"><div><h3>Legal status (MHCA)</h3><div class="small muted" style="margin-top:4px">${hesc(SEC_TXT[L.sec]||'Section '+L.sec)} · day ${L.day}${L.left!==null?' of 30 · '+L.left+' days left':''}</div></div></div>
      <div class="pad mh-grid"><div><div class="lbl">Advance directive</div>${adTxt}</div><div><div class="lbl">Capacity review${L.every?' (every '+L.every+' days)':''}</div>${cap}</div>${dec?`<div><div class="lbl">Day ${R.mhca.prompt89Day} choice</div>${dec}</div>`:''}<div><div class="lbl">Notices to the nominated representative</div>${nr}</div>${tk?`<div class="mh-wide"><div class="lbl">MHRB and notice tasks</div>${tk}</div>`:''}</div>`;
    const first=v.querySelector('section.card');first?first.parentNode.insertBefore(sec,first):v.appendChild(sec);
  }
  /* days left in the header chip */
  function headerChip(){
    const v=$('view');if(!v)return;
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)/);if(!m)return;const L=legal(m[1]);if(L.left===null)return;
    v.querySelectorAll('.c,.chip').forEach(c=>{if(c.dataset.mhd)return;if(/^Section 89\s*·\s*day \d+ of 30$/.test(c.textContent.trim())){c.dataset.mhd='1';c.textContent=c.textContent.trim()+' · '+L.left+' days left';if(L.left<=5)c.style.cssText+=';background:#fff3d6;color:#9a5b00;border-color:#f1cf85';if(L.left<=2)c.style.cssText+=';background:#fee4e2;color:#b42318;border-color:#fda29b';}});
  }

  /* ============================== 112: event follow-ups ============================== */
  window.EVFU=window.EVFU||[];
  function startFu(e,pid){
    const rule=R.events[e.type]||null;
    e.fu={at:now(),pid,tasks:[],tags:[]};
    if(!rule)return;
    (rule.tasks||[]).forEach((t,i)=>e.fu.tasks.push({id:'f'+e.id+i,text:t[0],owner:t[1],due:now()+t[2]*60000,done:null,esc:false}));
    (rule.tags||[]).forEach(tag=>{const x=px(pid);x.riskTags=x.riskTags||[];if(!x.riskTags.includes(tag)){x.riskTags.push(tag);e.fu.tags.push(tag);}});
    (rule.alert||[]).forEach(to=>alertTo(pid,e.type+' · '+pt(pid).name,'Logged by '+e.by+'. Alert to: '+to+'. Follow-up checklist started.','Event'));
    EVFU.push({pid,e,type:e.type});
  }
  /* the patient is taken when the window opens: the page can be drawing another patient's data by the time the event is saved */
  let evPid='';
  const __ev79=eventModal;
  eventModal=function(){
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)/);
    evPid=m?decodeURIComponent(m[1]):(S.focusPid||S.pid||'neel');
    return __ev79.apply(this,arguments);
  };
  function scanEvents(){
    if(!Array.isArray(S.events))return;
    S.events.forEach(e=>{if(typeof e.id==='number'&&e.id>1.7e12&&!e.fu)startFu(e,evPid||S.pid||'neel');});
  }
  window.evTaskDone=function(eid,tid){
    for(const ent of EVFU){if(ent.e.id!==eid)continue;const t=ent.e.fu.tasks.find(x=>x.id===tid);if(t){t.done={by:signer(),at:atNow()};render();return;}}
  };
  function evCard(){
    const card=$('evcard');if(!card||card.dataset.fu)return;card.dataset.fu='1';
    const lis=[...card.querySelectorAll(':scope .li')];
    (S.events||[]).forEach((e,i)=>{
      if(!e.fu||!e.fu.tasks.length||!lis[i])return;
      const open=e.fu.tasks.filter(t=>!t.done).length;
      const h=`<div class="evfu"><div class="tiny" style="font-weight:700">Follow-ups · ${e.fu.tasks.length-open} of ${e.fu.tasks.length} done${e.fu.tags.length?' · tag added: '+hesc(e.fu.tags.join(', ')):''}</div>${e.fu.tasks.map(t=>`<div class="row small" style="gap:8px;justify-content:space-between;${t.done?'opacity:.6':''}"><span>${t.done?'✓ ':''}${hesc(t.text)} <span class="tiny muted">· ${hesc(t.owner)} · ${t.done?'done '+hesc(t.done.at):(t.due<now()?'<b style="color:#b42318">overdue '+dur(now()-t.due)+'</b>':'due in '+dur(t.due-now()))}</span></span>${t.done?'':`<button class="btn sm" onclick="evTaskDone(${e.id},'${t.id}')">Done</button>`}</div>`).join('')}</div>`;
      const g=lis[i].querySelector('.grow');if(g)g.insertAdjacentHTML('beforeend',h);
    });
  }
  /* three refusals in 48 hours */
  function refusals(){
    const f=R.events.refusals,seen=refusals.seen=refusals.seen||{};
    PTS.forEach(p=>{
      let n=0;for(const k in MAR_ST){if(MAR_ST[k]==='R'&&k.indexOf(p.id+':')===0&&/-(5|6)-/.test(k))n++;}
      if(n>=f.count&&!seen[p.id]){seen[p.id]=true;alertTo(p.id,'Refused medicines '+n+' times in 48 hours · '+p.name,'Consider a depot injection or a liquid or orodispersible form.','Refusals');}
    });
  }
  /* floor lead: open follow-ups and overdue MHCA items */
  function leadCard(){
    const v=$('view');if(!v||!(floor())||v.querySelector('#leadRules')||!/^#\/myday/.test(location.hash||''))return;
    const open=EVFU.filter(x=>x.e.fu.tasks.some(t=>!t.done));
    const mh2=mhcaTasks().filter(t=>t.late);
    if(!open.length&&!mh2.length)return;
    const sec=document.createElement('section');sec.className='card';sec.id='leadRules';
    sec.innerHTML=`<div class="hd"><div><h3>Open follow-ups and overdue MHCA items</h3><div class="small muted" style="margin-top:4px">From logged events and the MHCA clock. Overdue ones go red.</div></div></div><div class="pad" style="display:flex;flex-direction:column;gap:8px">
      ${open.map(x=>{const t=x.e.fu.tasks.filter(y=>!y.done);const od=t.filter(y=>y.due<now()).length;return `<div class="row small" style="justify-content:space-between;gap:10px"><span><b>${hesc(x.type)}</b> · ${hesc(pt(x.pid).name)} · ${t.length} to do${od?` <b style="color:#b42318">· ${od} overdue</b>`:''}</span><button class="btn sm" onclick="go('#/patient/${x.pid}/overview')">Open</button></div>`;}).join('')}
      ${mh2.map(t=>`<div class="row small" style="justify-content:space-between;gap:10px"><span><b style="color:#b42318">MHCA</b> · ${hesc(t.title)} <span class="tiny muted">· ${hesc(t.due)}</span></span><button class="btn sm" onclick="go('${t.go}')">Open</button></div>`).join('')}</div>`;
    const first=v.querySelector('section.card');first?first.parentNode.insertBefore(sec,first):v.appendChild(sec);
  }
  /* overdue follow-ups escalate to the floor lead (once) */
  setInterval(()=>{try{EVFU.forEach(x=>x.e.fu.tasks.forEach(t=>{if(!t.done&&!t.esc&&t.due<now()){t.esc=true;alertTo(x.pid,'Overdue follow-up · '+pt(x.pid).name,t.text+' (owner: '+t.owner+') is overdue.','Floor lead');}}));}catch(e){}},30000);

  const css=document.createElement('style');css.id='mhca-12nov-css';
  css.textContent=`#mhcaPrompt{position:fixed;inset:0;z-index:2000;background:rgba(16,24,40,.6);display:flex;align-items:center;justify-content:center;padding:20px}
  #mhcaPrompt .mhp{background:#fff;border-radius:18px;padding:24px;max-width:520px;width:100%;display:flex;flex-direction:column;gap:12px;box-shadow:0 30px 80px rgba(0,0,0,.4)}#mhcaPrompt h3{margin:0;font-size:20px}#mhcaPrompt p{margin:0;color:#475467}
  .mh-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 22px}.mh-grid .lbl{margin-bottom:6px}.mh-wide{grid-column:1/-1;display:flex;flex-direction:column;gap:6px}
  .evfu{margin-top:8px;padding:8px 10px;border-left:3px solid #1e6cdb;background:#f5f9ff;border-radius:6px;display:flex;flex-direction:column;gap:5px}
  @media(max-width:700px){.mh-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  const __r79=render;
  render=function(){
    const r=__r79.apply(this,arguments);
    try{scanEvents();evCard();refusals();headerChip();legalCard();leadCard();dayPrompt();}catch(e){}
    return r;
  };
})();
