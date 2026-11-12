/* 12 Nov 2026, Trello cards 131, 132, 133: Floor Lead Psychologist (/floor-lead-psychologist). Only this role changes; the clinical psychologist login stays as it was,
   except the Round note label bug (card 133, item 8), which is fixed for both.
   131 Today = the team's prototype (public/lead/psy-today.html, shown inside the portal): six tiles, Actions / Floor caseload / My caseload, review queue, assign a psychologist ...
   132 Inpatients: Patients (whole floor by default, filter chips, psychologist dropdown, Change / Assign, psychology items in Next due), Rounds (Mine only toggle, psychologist
       name, no "Demo assignment"), Daily notes (floor counter), Handover (for a team member, caseload and leave), Calendar (whole team, filter, red flags), Team and leave in the menu.
   133 Patient record: Floor inpatients breadcrumb, Change psychologist, open family concern banner with the 6 h clock, Management plan lead sign-off, Lead note, Co-sign.
   Prototype: demo data and demo clock. Nothing is sent. Not built: dragging patients on the caseload board. */
(function(){
  const role=()=>String((window.__TULASI__||{}).role||'');
  const lead=()=>role()==='floor-lead-psychologist'&&S.role==='psychologist';
  const esc=s=>hesc(String(s==null?'':s));
  const L=()=>S.lp||(S.lp={assign:{},pF:'all',pD:'',scope:'floor',sign:{},back:{},note:{},conc:{},cosign:{},hoFrom:'',calD:''});
  /* the team: caseload and leave shown in every pick list */
  const TEAM=[{k:'Kiran',n:'Kiran Mehra',load:7,today:'2 of 4 sessions done today',leave:''},{k:'Priya',n:'Priya Nair',load:6,today:'3 of 5 sessions done today',leave:'on leave 14 to 16 Nov'},{k:'Surabhi',n:'Surabhi Sengar',load:3,today:'1 of 2 sessions done today',leave:'',you:true},{k:'Ankit',n:'Ankit Verma',load:0,today:'assistant psychologist',leave:''}];
  const FULL={Kiran:'Kiran Mehra',Priya:'Priya Nair',Surabhi:'Surabhi Sengar',Ankit:'Ankit Verma'};
  /* floor patients from the prototype: psychologist, therapy, last session, family, flags */
  const P=[['Ritu Malhotra','Kiran','CBT','Today','Husband · yesterday','',['Risk check yes today'],['risk']],['Neel Bose','Priya','Supportive, psychoeducation','3 days ago','Sister · 6 days','Weekly update overdue',['Plan to sign off','Note 26 h unsigned','No session 3 days'],['fam','rom','signoff','notes','nosess','risk']],
    ['Sameer Das','Kiran','ERP for OCD','Yesterday','Mother · 5 days','Day 3 to 4 call overdue',['Plan to sign off (3 d)','Note 30 h unsigned'],['fam','rom','signoff','notes']],['Varun Rao','Priya','MI, relapse prevention','Today','Wife · today','',['Plan to sign off'],['signoff']],
    ['Dev Kumar','Priya','Relapse prevention','Yesterday','Brother · 2 days','',['Discharge 15 Nov','Relapse plan not reviewed'],['dc']],['Rohit Kapoor','','Not started','None','Wife · 24 h call due','',['No psychologist'],['new']],
    ['Karan Malhotra','Kiran','CBT for psychosis','4 days ago','Mother · concern open','Concern 1 h 40 m left',['No session 4 days','No PHQ-9 in 14 d'],['fam','rom','nosess']],['Arjun Mehta','Priya','CBT, behavioural activation','Yesterday','Wife · 3 days','',[],['rom']],
    ['Tarun Roy','Kiran','Supportive','3 days ago','Father · 4 days','Day 3 to 4 call overdue',['Restrained today: debrief due','No session 3 days'],['fam','nosess']],['Sana Qureshi','Priya','Supportive','Yesterday','Mother · yesterday','',['Transfer requested'],[]],
    ['Rahul Sethi','Kiran','MI, relapse prevention','Today','Father · today','',['Ready for discharge today'],['dc']],['Yash Arora','Kiran','MI','Yesterday','Mother · 2 days','',['Discharge 16 Nov'],['dc']],
    ['Meera Iyer','Surabhi','CBT','Yesterday','Father · yesterday','',[],[]],['Kavya Menon','Surabhi','CBT-E','2 days ago','Husband · 3 days','',[],[]],['Aman Gill','Surabhi','MI','Yesterday','Son · yesterday','',[],[]],
    ['Nikhil Jain','Kiran','Not started (medically unwell)','None','Wife · today','',['Delirium risk: hold sessions'],['new']],['Pooja Bhatt','Priya','Intake booked','None','Sister · admission day','',[],['new']]]
    .map(r=>({n:r[0],doc:r[1],th:r[2],last:r[3],fm:r[4],fam:r[5],fl:r[6],f:r[7]}));
  const byName=n=>P.find(x=>x.n===n);
  const pts=()=>{try{return allPts();}catch(e){return PTS;}};
  const idOf=n=>{const p=pts().find(x=>x.name===n);return p?p.id:null;};
  const ptOf=id=>pts().find(x=>x.id===id)||PTS.find(x=>x.id===id);
  const protoOf=id=>{const p=ptOf(id);return p?byName(p.name):null;};
  const docKey=id=>{const a=L().assign[id];if(a!==undefined)return a;const x=protoOf(id);return x?x.doc:'';};
  const docName=id=>FULL[docKey(id)]||'';
  const loadOf=k=>pts().filter(p=>docKey(p.id)===k).length||TEAM.find(t=>t.k===k).load;
  const mineIds=()=>pts().filter(p=>docKey(p.id)==='Surabhi').map(p=>p.id);

  /* Daily notes default to the lead's own patients only (the notes page asks PSY_EOD) */
  window.__lpOwn=function(){return lead()?pts().filter(p=>docKey(p.id)==='Surabhi'):null;};
  /* the embedded Today page talks to the portal through this door (same origin) */
  window.LPBridge={get S(){return S;},go:h=>go(h),allPts:()=>pts()};
  /* ---------------- Assign / Change psychologist (same pop-up everywhere) ---------------- */
  window.lpAssign=function(pid){const p=ptOf(pid);if(!p)return;const cur=docKey(pid);
    V3.modal((cur?'Change psychologist · ':'Assign a psychologist · ')+esc(p.name),'Caseload, sessions today and upcoming leave are shown. The new psychologist gets the plan, notes and family contacts; the old one gets a handover note.',
      `<div id="lpOpts">${TEAM.filter(t=>t.k!=='Ankit').map(t=>`<label class="lp-opt"><input type="radio" name="lpD" value="${t.k}" ${cur===t.k?'checked':''}><span><b>${esc(t.you?'You':t.n)}</b><small>${loadOf(t.k)} patients · ${esc(t.today)}${t.leave?' · '+esc(t.leave):''}</small></span>${t.leave?'<span class="lp-ch amb">Leave soon</span>':t.you?'<span class="lp-ch grn">Lightest load</span>':''}</label>`).join('')}</div>
       <div class="small muted" style="margin-top:8px">The intake call (within 24 h) and the first session go on their Today.</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="lpAssignSave('${pid}')">${cur?'Change':'Assign'}</button>`);};
  window.lpAssignSave=function(pid){const r=document.querySelector('input[name=lpD]:checked');if(!r){toast('Pick a psychologist');return;}
    const old=docKey(pid);L().assign[pid]=r.value;closeModal();render();
    toast(ptOf(pid).name+' now with '+FULL[r.value]+(old&&old!==r.value?'. '+FULL[old]+' gets a handover note.':'. Intake call added to their Today.'));};

  /* ---------------- 132: Patients ---------------- */
  const flagsOf=id=>{const x=protoOf(id);return x?x.fl:[];};
  const famWait=id=>{const x=protoOf(id);return !!(x&&x.fam);};
  const prevIpd=ROLE.psychologist.ipdPage;
  ROLE.psychologist.ipdPage=function(o,base){
    if(!lead()||!o||o.scr!=='ipd')return prevIpd?prevIpd.apply(this,arguments):base(o);
    const l=L(),sc=l.scope==='mine'?'mine':'floor',all=pts();
    let list=sc==='mine'?all.filter(p=>docKey(p.id)==='Surabhi'):all;
    const chipN=k=>list.filter(p=>k==='all'||(k==='none'?!docKey(p.id):famWait(p.id))).length;
    if(l.pF==='none')list=list.filter(p=>!docKey(p.id));if(l.pF==='fam')list=list.filter(p=>famWait(p.id));if(l.pD)list=list.filter(p=>docKey(p.id)===l.pD);
    const sw=`<div class="pg-mine" role="tablist" aria-label="Which patients"><button role="tab" class="${sc==='floor'?'on':''}" onclick="lpSet('scope','floor')">Whole floor <span class="pg-n">${all.length}</span></button><button role="tab" class="${sc==='mine'?'on':''}" onclick="lpSet('scope','mine')">Mine <span class="pg-n">${mineIds().length}</span></button></div>`;
    const chips=`<div class="lp-fr"><button class="lp-fc ${l.pF==='all'?'on':''}" onclick="lpSet('pF','all')">All</button><button class="lp-fc ${l.pF==='none'?'on':''}" onclick="lpSet('pF','none')">No psychologist ${chipN('none')}</button><button class="lp-fc ${l.pF==='fam'?'on':''}" onclick="lpSet('pF','fam')">Family waiting ${chipN('fam')}</button>
      <select class="lp-sel" onchange="lpSet('pD',this.value)" aria-label="Psychologist"><option value="">All psychologists</option>${TEAM.filter(t=>t.k!=='Ankit').map(t=>`<option value="${t.k}" ${l.pD===t.k?'selected':''}>${esc(t.you?'You':t.n)}</option>`).join('')}</select></div>`;
    const dis=p=>{const d=(typeof rmoEx==='function'?rmoEx(p):EX[p.id]||[])[2];return !!d&&d!=='Not set';};
    const o2=Object.assign({},o,{list,total:list.length,mh:'Next due',title:'Floor inpatients',where:'Gurgaon · '+(sc==='mine'?'my patients':'all wards'),filters:sw+chips+(typeof floorTabs==='function'?'':''),
      doc:p=>psyOfP(p),psy:p=>docName(p.id),dc:p=>(typeof rmoEx==='function'?rmoEx(p):EX[p.id]||[])[2],go:p=>`#/patient/${p.id}/overview`,count:k=>all.filter(p=>ipdIn(k,p,dis)).length,
      id:p=>{const sx=p.sex||(typeof RMO_FILL!=='undefined'&&(RMO_FILL[p.id]||[])[3])||'',ag=p.age||(typeof RMO_FILL!=='undefined'&&(RMO_FILL[p.id]||[])[4])||'';return `${sx?ag+'/'+sx+' ':''}${String(p.room||'').replace(/^Room\s*/i,'R ')}`;},
      c6:p=>{const x=protoOf(p.id),f=x?x.fl.filter(t=>!(docKey(p.id)&&/^No psychologist$/.test(t))):[];if(x&&docKey(p.id)&&!x.doc&&!f.length)f.push('Intake call due 24 h');if(x&&x.fam)f.push(x.fam);const pl=L().sign[p.id]?[]:[];return f.length?`<div class="pg-due">${f.map(i=>`<div>${esc(i)}</div>`).join('')}</div>`:'<span class="tiny muted">Nothing due</span>';}});
    return base(o2);
  };
  window.lpSet=function(k,v){L()[k]=v;render();};

  /* ---------------- paint (DOM changes that need the finished page) ---------------- */
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/?([^/?]*)/);return m?{pid:decodeURIComponent(m[1]),tab:m[2]}:null;};
  function careTeamLinks(v){
    v.querySelectorAll('tbody tr').forEach(tr=>{if(tr.dataset.lpc)return;const b=tr.querySelector('[onclick*="#/patient/"]');const m=b&&(b.getAttribute('onclick')||'').match(/#\/patient\/([^/']+)/);if(!m)return;
      const cell=[...tr.children].find(td=>/rl s/.test(td.innerHTML)||/Not assigned/.test(td.textContent));if(!cell)return;tr.dataset.lpc='1';
      const has=!!docKey(m[1]);cell.insertAdjacentHTML('beforeend',`<div><button class="lp-lnk" onclick="event.stopPropagation();lpAssign('${m[1]}')">${has?'Change':'Assign'}</button></div>`);
      if(!has)cell.insertAdjacentHTML('afterbegin','<div class="ctr"><span class="rl s">P</span>No psychologist</div>');});
  }
  function recordHeader(v){
    const r=route();if(!r)return;const p=ptOf(r.pid);if(!p)return;
    /* breadcrumb */
    v.querySelectorAll('.crumb a').forEach(a=>{if(/^My inpatients$/.test(a.textContent.trim()))a.textContent='Floor inpatients';});
    /* Treating team: Change link */
    const tt=[...v.querySelectorAll('.dph *')].find(e=>/^Treating team/.test(e.textContent.trim())&&e.children.length<4);
    if(tt&&!v.querySelector('#lpChg')){const row=tt.parentElement;const b=document.createElement('button');b.id='lpChg';b.className='lp-lnk';b.textContent=docKey(r.pid)?'Change psychologist':'Assign psychologist';b.onclick=()=>lpAssign(r.pid);row.appendChild(b);}
    /* open family concern banner */
    const c=L().conc[r.pid]||(r.pid==='kabir'?{at:Date.now()-4*3600000-20*60000,txt:'"Nobody has told us anything this week." Mother (Sunita Malhotra).'}:null);
    if(c&&!c.closed&&!v.querySelector('#lpConc')){const left=Math.max(0,6*3600000-(Date.now()+((S.au||{}).skip||0)*3600000-c.at)),h=Math.floor(left/3600000),m=Math.floor(left%3600000/60000);
      const b=document.createElement('section');b.id='lpConc';b.className='fc9';b.style.cssText='margin:0 0 10px';b.innerHTML=`<div class="fc9-t"><span class="fc9-k">OPEN FAMILY CONCERN</span><b>${h} h ${m} m left on the 6 h clock</b><div class="small muted">${esc(c.txt)}</div></div><div class="row" style="gap:8px"><button class="btn pri" onclick="lpCallFam('${r.pid}')">Call family</button></div>`;
      const tabs=v.querySelector('.subtabs');tabs?tabs.parentNode.insertBefore(b,tabs):v.insertBefore(b,v.firstChild);}
  }
  window.lpCallFam=function(pid){const c=L().conc[pid]=L().conc[pid]||{at:Date.now()-4*3600000,txt:''};c.closed=signer()+' · '+atNow();render();toast('Call logged on the family tab. The concern is with you, closed on the clock.');};
  /* Management plan: lead sign-off */
  function planSignoff(v,r){
    if(r.tab!=='plans')return;
    /* demo: the three plans in the prototype's review queue are already signed by their treating psychologist */
    const SEED={neel:['Priya Nair','10 Nov 2026, 11:00 am','Supportive and psychoeducation. Goals: sleep 6 h; one group activity a day; talk about worries.'],sameer:['Kiran Mehra','9 Nov 2026, 4:30 pm','ERP for OCD. Goals: checking from 3 h to under 1 h a day; back to college classes.'],varun:['Priya Nair','11 Nov 2026, 9:15 am','MI and relapse prevention. Goals: no drinking on 2 home leaves; 3 triggers with a plan each.']};
    const x0=psyPx(r.pid);x0.mgmtPsych=x0.mgmtPsych||{};if(SEED[r.pid]&&!x0.mgmtPsych.signed&&!x0.mgmtPsych.seedLp){x0.mgmtPsych.seedLp=1;x0.mgmtPsych.signed={by:SEED[r.pid][0],at:SEED[r.pid][1]};x0.mgmtPsych.goals=x0.mgmtPsych.goals||SEED[r.pid][2];x0.mgmtPsych.therapyPlan=x0.mgmtPsych.therapyPlan||SEED[r.pid][2];}
    const mp=x0.mgmtPsych||{};const tabsEl=v.querySelector('.subtabs');if(!tabsEl||v.querySelector('#lpSign'))return;
    const lsg=L().sign[r.pid],back=L().back[r.pid];
    const box=document.createElement('div');box.id='lpSign';box.className='lp-so '+(lsg?'ok':mp.signed?'wait':'');
    box.innerHTML=lsg?`<span>Signed off by <b>${esc(lsg.by)}</b>, Psychologist Lead, on ${esc(lsg.at)}</span>`:mp.signed?`<span><b>Awaiting lead sign-off</b> · signed by ${esc(mp.signed.by)}${back?' · <span style="color:#b54708">Updates needed: '+esc(back)+'</span>':''}</span><span><button class="btn sm" onclick="lpBack('${r.pid}')">Updates needed</button> <button class="btn sm pri" onclick="lpSignPlan('${r.pid}')">Sign as Psychologist Lead</button></span>`:'<span class="muted">The treating psychologist has not signed this plan yet.</span>';
    tabsEl.parentNode.insertBefore(box,tabsEl.nextSibling);
  }
  window.lpSignPlan=function(pid){pinSign('Sign the plan as Psychologist Lead · '+(ptOf(pid)||{}).name,[['Signing as',signer()],['Role','Psychologist Lead']],()=>{L().sign[pid]={by:signer(),at:atNow()};L().back[pid]='';render();toast('Plan signed off. It counts in the quality measure.');});};
  window.lpBack=function(pid){V3.modal('Updates needed','What should the treating psychologist fix? They see it on their Today.',`<textarea class="input" id="lpBk" rows="3"></textarea>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="lpBackSave('${pid}')">Send back</button>`);};
  window.lpBackSave=function(pid){const t=(($('lpBk')||{}).value||'').trim();if(!t){toast('Say what to fix');return;}L().back[pid]=t;closeModal();render();toast('Sent back to the treating psychologist');};
  /* Lead note, Co-sign */
  window.lpNote=function(pid){const cur=L().note[pid];V3.modal('Lead note · '+esc((ptOf(pid)||{}).name),'Guidance for the treating psychologist. It shows on their Today and on the record.',`<textarea class="input" id="lpLn" rows="4">${esc(cur?cur.t:'')}</textarea>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="lpNoteSave('${pid}')">Save</button>`);};
  window.lpNoteSave=function(pid){const t=(($('lpLn')||{}).value||'').trim();if(!t){toast('Write the note first');return;}L().note[pid]={t,by:signer(),at:atNow()};closeModal();render();toast('Lead note saved');};
  window.lpCosign=function(pid,i){pinSign('Co-sign the session note',[['Signing as',signer()]],()=>{L().cosign[pid+':'+i]={by:signer(),at:atNow()};render();toast('Co-signed');});};
  /* demo: a session note written by the assistant psychologist, waiting for the lead's co-sign (Aman Gill, from the prototype's review queue) */
  function seedAssistant(){
    const id=idOf('Aman Gill');if(!id)return;const x=psyPx(id);if(x.__asst)return;x.__asst=1;
    x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};x.sn.notes=x.sn.notes||[];
    x.sn.notes.push({id:'nasst1',ts:Date.now()-3*3600000,status:'signed',at:'12 Nov 2026, 10:05 am',by:'Ankit Verma (assistant psychologist)',signedBy:'Ankit Verma (assistant psychologist)',signedAt:'12 Nov 2026, 10:50 am',mod:'Motivational interviewing',mins:'40',risk:{a:'no',b:'no',c:'no'},kind:'ind',addenda:[],summaryLine:'MI session 40 min. Risk check: all no. Ambivalence about stopping; decisional balance done.'});
  }
  function therapyBits(v,r){
    if(r.tab!=='therapy')return;
    if(!(psyPx(r.pid).__asst)&&r.pid===idOf('Aman Gill')){seedAssistant();render();return;}
    const hd=[...v.querySelectorAll('section.card .hd')].find(h=>/^Therapy Plans/.test((h.querySelector('h3')||{}).textContent||''));
    if(hd&&!hd.querySelector('#lpLnBtn')){const b=document.createElement('button');b.id='lpLnBtn';b.className='btn sm';b.textContent='Lead note';b.onclick=()=>lpNote(r.pid);hd.appendChild(b);}
    const n=L().note[r.pid];if(n&&!v.querySelector('#lpLnShow')){const d=document.createElement('div');d.id='lpLnShow';d.className='lp-so';d.innerHTML=`<span><b>Lead note</b> · ${esc(n.t)} <span class="tiny muted">· ${esc(n.by)}, ${esc(n.at)}</span></span>`;const card=hd&&hd.closest('section.card');card?card.parentNode.insertBefore(d,card):v.insertBefore(d,v.firstChild);}
    /* sessions written by an assistant psychologist: Co-sign */
    v.querySelectorAll('.tp-body table tbody tr').forEach((tr,i)=>{if(tr.dataset.lpcs)return;if(!/assistant/i.test(tr.textContent))return;tr.dataset.lpcs='1';const cs=L().cosign[r.pid+':'+i];const last=tr.lastElementChild;if(last)last.insertAdjacentHTML('beforeend',cs?`<span class="lp-ch grn">Co-signed by ${esc(cs.by)}</span>`:`<button class="btn sm pri" onclick="lpCosign('${r.pid}',${i})">Co-sign</button>`);});
  }
  /* Rounds: the ward order covers the whole floor (all wards in one list), with the psychologist's name under each patient and a Mine only toggle */
  const WARD_ORDER=()=>Object.keys(WARDS).flatMap(w=>WARDS[w].map((p,j)=>({w,j,p})));
  window.lpRoundGo=function(pid){try{psyOpenRounds(pid);}catch(e){go('#/rounds');}};
  function roundsBits(v){
    v.querySelectorAll('.pg-asg-demo').forEach(e=>e.remove());
    const q=v.querySelector('aside.pr-queue');if(!q||q.dataset.lpf==='1'&&q.dataset.lpm===String(!!L().rmine))return;
    /* tags (Alert, Overdue, New) of the patients in the current ward, kept as they are */
    const tag={};q.querySelectorAll('button.pr-q').forEach(b=>{const n=(b.querySelector('span span')||{}).textContent;const t=b.querySelector('.pr-tag');if(n&&t)tag[n.trim()]=t.outerHTML;});
    const R=S.rounds,curP=(WARDS[R.ward]||[])[Math.min(R.idx[R.ward]||0,(WARDS[R.ward]||[]).length-1)];
    const rows=WARD_ORDER().filter(x=>!L().rmine||docKey(x.p.id)==='Surabhi');
    q.querySelectorAll('button.pr-q,.lp-wh').forEach(b=>b.remove());
    let last='';const frag=document.createDocumentFragment();
    rows.forEach(x=>{
      if(x.w!==last){last=x.w;const h=document.createElement('div');h.className='lp-wh tiny muted';h.style.cssText='padding:8px 10px 2px;font-weight:700;letter-spacing:.04em;text-transform:uppercase';h.textContent=x.w;frag.appendChild(h);}
      const b=document.createElement('button');b.className='pr-q'+(curP&&curP.id===x.p.id?' on':'');b.setAttribute('onclick',"lpRoundGo('"+x.p.id+"')");
      const d=docName(x.p.id);
      b.innerHTML='<span class="pr-dot"></span><span style="min-width:0"><span style="display:block;font-weight:600;font-size:13px">'+esc(x.p.name)+'</span><span class="tiny muted">'+esc(x.p.room||'')+'</span><span class="tiny" style="display:block;color:#1e5bb8">'+(d?esc(d):'No psychologist')+'</span></span>'+(tag[x.p.name]||'');
      frag.appendChild(b);});
    q.appendChild(frag);q.dataset.lpf='1';q.dataset.lpm=String(!!L().rmine);
    if(!v.querySelector('#lpMine')){const t=document.createElement('label');t.id='lpMine';t.className='lp-tg';t.innerHTML=`<input type="checkbox" ${L().rmine?'checked':''} onchange="lpSet('rmine',this.checked)"> Mine only`;const first=q.querySelector('.lbl');first&&first.parentElement.insertAdjacentElement('afterend',t);}
    else{const c=v.querySelector('#lpMine input');if(c)c.checked=!!L().rmine;}
  }
  /* Daily notes: floor counter */
  function notesBits(v){
    if(v.querySelector('#lpFn'))return;const done=11,tot=pts().length;
    const hdr=v.querySelector('.hdr,.top,section.card');const d=document.createElement('button');d.id='lpFn';d.className='lp-fn';d.innerHTML=`Floor notes today: <b>${done} of ${tot}</b> written`;
    d.onclick=()=>{const miss=pts().slice(done).map(p=>`<div class="row small" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid #eef1f5"><span><b>${esc(p.name)}</b> <span class="tiny muted">· ${esc(docName(p.id)||'No psychologist')}</span></span></div>`).join('');V3.modal('Floor notes not written yet',(tot-done)+' patients.',miss,'<button class="btn" onclick="closeModal()">Close</button>');};
    v.insertBefore(d,v.firstChild.id==='safeBar'?v.firstChild.nextSibling:v.firstChild);
  }
  /* Handover: caseload and leave in the list, and hand over for a team member */
  function handoverBits(v){
    const sel=[...v.querySelectorAll('select')].find(s=>[...s.options].some(o=>/Kiran Mehra/.test(o.text)));
    if(sel&&!sel.dataset.lp){sel.dataset.lp='1';[...sel.options].forEach(o=>{const t=TEAM.find(x=>o.text.indexOf(x.n)===0||(x.you&&/Surabhi/.test(o.text)));if(t&&!/patients/.test(o.text))o.text=o.text.replace(/\s*$/,'')+' · '+loadOf(t.k)+' patients'+(t.leave?' · '+t.leave:'');});}
    if(!v.querySelector('#lpHoFor')){const b=document.createElement('div');b.id='lpHoFor';b.className='lp-so';b.innerHTML=`<span><b>Hand over for a team member</b> · when someone is on sick leave or cannot be reached</span><select class="lp-sel" onchange="lpHoFor(this.value)"><option value="">Choose the psychologist</option>${TEAM.filter(t=>t.k!=='Surabhi'&&t.k!=='Ankit').map(t=>`<option value="${t.k}" ${L().hoFrom===t.k?'selected':''}>${esc(t.n)} · ${loadOf(t.k)} patients</option>`).join('')}</select>`;v.insertBefore(b,v.firstChild.id==='safeBar'?v.firstChild.nextSibling:v.firstChild);}
  }
  window.lpHoFor=function(k){L().hoFrom=k;if(k)toast('Handing over '+FULL[k]+"'s "+loadOf(k)+' patients. Pick who covers.');render();};
  /* Calendar and caseload: whole team by default, a filter per psychologist, red flags, and a caseload board with one column per psychologist (drag to rebalance) */
  const evPatient=b=>{const n=((b.querySelector('b')||{}).textContent||'').replace(/^Family\s*·\s*/,'').trim();return pts().find(p=>p.name===n)||null;};
  window.lpMovePt=function(pid,k){const p=ptOf(pid);if(!p)return;const old=docKey(pid);if(old===k)return;L().assign[pid]=k;render();
    toast(p.name+' moved to '+(k?FULL[k]:'unassigned')+'. The plan, notes and family contacts go with them'+(old?'; '+FULL[old]+' gets a handover note.':'.'));};
  window.lpDrag=function(ev,pid){try{ev.dataTransfer.setData('text/plain',pid);ev.dataTransfer.effectAllowed='move';}catch(e){}ev.target.classList.add('lp-drag');};
  window.lpDrop=function(ev,k){ev.preventDefault();const pid=ev.dataTransfer.getData('text/plain');document.querySelectorAll('.lp-colh').forEach(c=>c.classList.remove('lp-colh'));if(pid)lpMovePt(pid,k);};
  function boardHtml(){
    const cols=TEAM.map(t=>({k:t.k,n:t.n+(t.you?' (you)':''),t})).concat([{k:'',n:'Unassigned',t:null}]);
    return `<div class="pgc-board lp-board">${cols.map(c=>{const list=pts().filter(p=>(docKey(p.id)||'')===c.k);
      return `<section class="pgc-col lp-col" ondragover="event.preventDefault();this.classList.add('lp-colh')" ondragleave="this.classList.remove('lp-colh')" ondrop="lpDrop(event,'${c.k}')"><div class="pgc-ch"><b>${esc(c.n)}</b><span>${list.length}</span></div><div class="pgc-cs">${c.t?esc(c.t.today)+(c.t.leave?' · '+esc(c.t.leave):''):'Needs a psychologist'}</div>
        ${list.map(p=>{const x=protoOf(p.id);return `<div class="pgc-cd lp-card" draggable="true" ondragstart="lpDrag(event,'${p.id}')" ondragend="this.classList.remove('lp-drag')"><div class="pgc-cdh"><button class="pgc-nm" onclick="go('#/patient/${p.id}/therapy')">${esc(p.name)}</button><span class="pgc-rm">${esc(p.room||'')}</span></div><div class="pgc-md">${esc(x?x.th:'')}</div><div class="pgc-ln"><span>Last session: ${esc(x?x.last:'')}</span></div>
          <div class="pgc-ac"><select class="input pgc-mv" aria-label="Move ${esc(p.name)}" onchange="lpMovePt('${p.id}',this.value)"><option value="" ${!docKey(p.id)?'selected':''}>Unassigned</option>${TEAM.map(t=>`<option value="${t.k}" ${docKey(p.id)===t.k?'selected':''}>${esc(t.n)}</option>`).join('')}</select></div></div>`;}).join('')||'<div class="small muted" style="padding:10px">Drop a patient here</div>'}</section>`;}).join('')}</div>`;
  }
  function calendarBits(v){
    const h=[...v.querySelectorAll('h2,h3')].find(x=>/Calendar and caseload/i.test(x.textContent));if(!h)return;
    if(!v.querySelector('#lpCalBar')){
      const b=document.createElement('div');b.id='lpCalBar';b.className='lp-so';b.innerHTML=`<span><b>Whole team</b> · filter by psychologist</span><select class="lp-sel" onchange="lpSet('calD',this.value)"><option value="">Whole team</option>${TEAM.filter(t=>t.k!=='Ankit').map(t=>`<option value="${t.k}" ${L().calD===t.k?'selected':''}>${esc(t.you?'You':t.n)}</option>`).join('')}</select><span class="lp-ch red">Relapse prevention group: no facilitator</span><span class="lp-ch red">Priya Nair on leave 14 to 16 Nov: sessions booked</span>`;
      (h.closest('.pgc-top')||h.parentElement).insertAdjacentElement('afterbegin',b);}
    const tab=(S.pgc||{}).tab;
    if(tab==='board'){const old=v.querySelector('.pgc-board:not(.lp-board)');if(old){const t=document.createElement('div');t.innerHTML=boardHtml();old.replaceWith(t.firstElementChild);}return;}
    /* session calendar: filter per psychologist, red flags */
    const cells=[...v.querySelectorAll('.pgc-grid .pgc-c')],wk=(S.pgc||{}).wk||0;
    cells.forEach((cell,ci)=>{const dayIdx=ci%7,absDay=wk*7+dayIdx; /* 0 = Monday of this week; Sat 14 Nov = 5, Sun 15 = 6, Mon 16 = 7 */
      cell.querySelectorAll('button.pgc-e').forEach(b=>{const p=evPatient(b),d=p?docKey(p.id):'';const isGroup=/Group/.test(b.getAttribute('title')||'');
        b.style.display=(L().calD&&p&&d!==L().calD)||(L().calD&&!p&&!isGroup&&L().calD!=='Surabhi')?'none':'';
        const onLeave=d==='Priya'&&absDay>=5&&absDay<=7,noFac=/Relapse prevention group/.test(b.textContent);
        b.classList.toggle('lp-red',onLeave||noFac);
        if((onLeave||noFac)&&!b.dataset.lpr){b.dataset.lpr='1';b.title=(b.title||'')+(noFac?' · no facilitator':' · Priya Nair on leave');}});});
  }
  /* Team and leave in the left menu */
  window.lpTeam=function(){const WK=[['Priya Nair','DDDDDLL'],['Kiran Mehra','DDWDDDD'],['Ankit Verma','DDDDDWW'],['Ishita Kapoor','OODSOWW'],['You','DDDDDDW']];
    V3.modal('Team and leave','D duty · W week off · L leave · S sick · O off. This is a placeholder for the separate Team and leave screen (next card).',`<table class="t"><thead><tr><th></th>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<th>${d}</th>`).join('')}</tr></thead><tbody>${WK.map(r=>`<tr><td><b>${esc(r[0])}</b></td>${[...r[1]].map(c=>`<td style="text-align:center">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`,'<button class="btn" onclick="closeModal()">Close</button>');};
  function menuBits(){
    const sub=[...document.querySelectorAll('#app .side button')].find(b=>/^Handover$/.test(b.textContent.trim()));
    if(sub&&!document.querySelector('#lpTeamBtn')){const t=sub.cloneNode(true);t.id='lpTeamBtn';t.textContent='Team and leave';t.removeAttribute('onclick');t.onclick=()=>lpTeam();sub.insertAdjacentElement('afterend',t);}
  }

  /* ---------------- 131: Today = the team's prototype ---------------- */
  const prevMy=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    if(!lead())return prevMy.apply(this,arguments);
    $('title').textContent='Today';
    const z=parseFloat(getComputedStyle(document.body).zoom)||1,h=Math.max(640,Math.round(innerHeight/z-100));
    return `<iframe id="lpToday" class="lp-emb" title="Today" src="lead/psy-today.html?embed=1" style="height:${h}px"></iframe>`;
  };
  /* the author sees Updates needed and the Lead note on their Today (clinical psychologist) */
  function authorBits(v){
    if(!/^#\/myday/.test(location.hash||'')||v.querySelector('#lpFromLead'))return;
    const items=[];Object.keys(L().back).forEach(id=>{if(L().back[id])items.push(`<div class="small"><b>${esc((ptOf(id)||{}).name)}</b> · plan: updates needed · ${esc(L().back[id])}</div>`);});
    Object.keys(L().note).forEach(id=>{const n=L().note[id];items.push(`<div class="small"><b>${esc((ptOf(id)||{}).name)}</b> · lead note · ${esc(n.t)}</div>`);});
    if(!items.length)return;const d=document.createElement('section');d.id='lpFromLead';d.className='card pad';d.innerHTML=`<div class="lbl">From your lead</div>${items.join('')}`;v.insertBefore(d,v.firstChild);
  }

  const css=document.createElement('style');css.id='lp-12nov-css';
  css.textContent=`.lp-emb{display:block;width:100%;border:0;background:transparent}
  .lp-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #d6dee8;border-radius:12px;margin:0 0 8px;cursor:pointer}.lp-opt:has(input:checked){border-color:#1e6cdb;background:#f1f7ff}.lp-opt small{display:block;color:#667085;font-weight:400}.lp-opt span:nth-of-type(1){flex:1}
  .lp-ch{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;background:#eef2f7;color:#475467}.lp-ch.amb{background:#fffaeb;color:#b54708}.lp-ch.grn{background:#ecfdf3;color:#067647}.lp-ch.red{background:#fef3f2;color:#b42318}
  .lp-lnk{border:0;background:none;color:#1e5bb8;font:inherit;font-size:12.5px;font-weight:650;padding:2px 0;cursor:pointer}
  .lp-fr{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px}.lp-fc{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:6px 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}.lp-fc.on{background:#e8f1fe;border-color:#1e6cdb;color:#1e5bb8}
  .lp-sel{height:34px;border:1px solid #d6dee8;border-radius:10px;padding:0 10px;font:inherit;font-size:13px;background:#fff}
  .lp-so{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:9px 14px;border-radius:12px;margin:0 0 10px;font-size:13.5px;background:#f5f9ff;border:1px solid #d5e4fb}.lp-so.ok{background:#ecfdf3;border-color:#abefc6;color:#067647}.lp-so.wait{background:#fffaeb;border-color:#fedf89;color:#8a5a00}
  .lp-tg{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;margin:4px 0}.lp-fn{display:inline-block;border:1px solid #d5e4fb;background:#f5f9ff;border-radius:99px;padding:6px 14px;font:inherit;font-size:13px;margin:0 0 10px;cursor:pointer}`;
  css.textContent+=`.lp-red{outline:2px solid #d9453d;background:#fef3f2!important;color:#912018!important}.lp-card{cursor:grab}.lp-card.lp-drag{opacity:.45}.lp-col.lp-colh{outline:2px dashed #1e6cdb;background:#f1f7ff}.lp-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;align-items:start}
  .pr-queue .lp-wh{margin-top:4px}`;
  document.head.appendChild(css);

  const __r=render;
  render=function(){
    const r=__r.apply(this,arguments);
    try{
      const v=$('view');if(!v)return r;const rt=route(),hash=location.hash||'';
      if(S.role==='psychologist'&&!lead())authorBits(v);
      if(!lead())return r;
      careTeamLinks(v);
      if(rt){recordHeader(v);planSignoff(v,rt);therapyBits(v,rt);}
      if(/^#\/rounds/.test(hash))roundsBits(v);
      if(/^#\/notes/.test(hash))notesBits(v);
      if(/^#\/handover/.test(hash))handoverBits(v);
      if(/^#\/(calendar|cal)/.test(hash)||/Calendar and caseload/i.test(($('title')||{}).textContent||''))calendarBits(v);
      menuBits();
    }catch(e){}
    return r;
  };
})();
