/* 13 Nov 2026, Trello card 131 "Floor Lead Psychologist: Today". Built in the portal from the real floor patients (no iframe).
   Six tiles, Actions / Floor caseload / My caseload, review queue with Sign all remaining, filters and a psychologist dropdown.
   Greeting and date follow the clock; every count is counted from the records. Floor lead psychologist only.
   Demo values: the group without a facilitator and the leave dates (there is no groups or leave data in the records yet). */
(function(){
  const lead=()=>String((window.__TULASI__||{}).role||'')==='floor-lead-psychologist'&&S.role==='psychologist';
  const esc=s=>hesc(String(s==null?'':s));
  const L=()=>S.lp||(S.lp={assign:{},pF:'all',pD:'',scope:'floor',sign:{},back:{},note:{},conc:{},cosign:{},hoFrom:'',calD:''});
  const T=()=>{const l=L();return l.td||(l.td={tab:'act',flt:'all',who:'',done:{},acted:{},asked:{},reminded:0,cover:'',grp:''});};
  const floor=()=>{try{return allPts();}catch(e){return PTS;}};
  const doc=p=>{try{const a=v3().alloc.psych[p.id];if(a)return a;}catch(e){}return (typeof PSYCHOF!=='undefined'&&PSYCHOF[p.id])||'';};
  const mineName='Surabhi Sengar',dayMs=864e5;
  const first=n=>String(n||'the psychologist').split(' ')[0];
  const lastSess=p=>{try{const sn=(psyPx(p.id).sn||{}).notes||[];const ts=sn.filter(n=>n.status==='signed').map(n=>n.ts||0).sort((a,b)=>b-a)[0];if(ts)return Math.floor((Date.now()-ts)/dayMs);}catch(e){}return +p.day||0;};
  /* the therapy plan sets 3 sessions a week; flag once that is overdue. No signed note yet = flag from day 7. Discharge today and patients out of the ward are skipped. */
  const hasNote=p=>{try{return ((psyPx(p.id).sn||{}).notes||[]).some(n=>n.status==='signed');}catch(e){return false;}};
  const noSess=p=>{if(!doc(p)||p.dischargeToday)return false;const d=+p.day||0;return hasNote(p)?lastSess(p)>=3:d>=7;};
  const hasScore=p=>{try{const x=psyPx(p.id);return !!((x.scores&&x.scores.length)||(x.scaleLog&&x.scaleLog.length)||(x.sn&&x.sn.ybocs));}catch(e){return false;}};
  const planWait=p=>{try{const x=psyPx(p.id);return !!(x.mgmtPsych&&x.mgmtPsych.signed)&&!L().sign[p.id];}catch(e){return false;}};
  const coWait=p=>{try{const sn=(psyPx(p.id).sn||{}).notes||[];return sn.map((n,i)=>({n,i})).filter(o=>/assistant/i.test(String(o.n.by||''))&&!L().cosign[p.id+':'+o.i]);}catch(e){return [];}};
  const openGr=p=>{try{return (ptCtxOf(p.id).pgriev||[]).filter(g=>g.st==='Open').length+(L().conc[p.id]&&!L().conc[p.id].closed?1:0);}catch(e){return 0;}};
  const famLate=p=>{try{return (+p.day||0)>=3&&(+p.day||0)<8&&!(ptCtxOf(p.id).calls||{}).d34psych;}catch(e){return false;}};
  const dischSoon=p=>{try{const d=new Date(ptCtxOf(p.id).edd||'').getTime();return !!p.dischargeToday||(d&&d-Date.now()<7*dayMs&&d-Date.now()>-dayMs);}catch(e){return !!p.dischargeToday;}};
  const therapyOf=p=>{const d=String(p.dx||'');return /obsess|ocd/i.test(d)?'ERP':/depress/i.test(d)?'CBT, behavioural activation':/psychotic|schizo/i.test(d)?'CBT for psychosis':/alcohol|opioid|substance/i.test(d)?'MI, relapse prevention':/bipolar/i.test(d)?'Supportive, psychoeducation':'Supportive therapy';};
  const topics=p=>{try{const t=(psyPx(p.id).sn||{}).told||{};return Math.min(8,Object.keys(t).filter(k=>t[k]).length);}catch(e){return 0;}};
  const famOf=p=>{try{const id=ptIdentity(p);const c=((psyPx(p.id).th||{}).comm||[])[0];return {name:id.nr,rel:id.rel,last:c?c.date:'no contact logged'};}catch(e){return {name:'',rel:'',last:''};}};
  const restDebrief=()=>{try{return (S.rst.eps||[]).filter(e=>e.end&&!e.debrief&&!T().done['rst'+e.id+e.pid]);}catch(e){return [];}};
  const doneRow=k=>!!T().done[k];

  function seedWaiting(){
    const SEED={neel:'Supportive and psychoeducation. Goals: sleep 6 h; one group activity a day.',sameer:'ERP for OCD. Goals: checking from 3 h to under 1 h a day.',varun:'MI and relapse prevention. Goals: no drinking on 2 home leaves.'};
    Object.keys(SEED).forEach(id=>{try{const x=psyPx(id),p=floor().find(q=>q.id===id);x.mgmtPsych=x.mgmtPsych||{};if(!x.mgmtPsych.signed&&!x.mgmtPsych.seedLp){x.mgmtPsych.seedLp=1;x.mgmtPsych.signed={by:(p&&doc(p))||'Priya Nair',at:'10 Nov 2026, 11:00 am'};x.mgmtPsych.goals=x.mgmtPsych.goals||SEED[id];x.mgmtPsych.therapyPlan=x.mgmtPsych.therapyPlan||SEED[id];}}catch(e){}});
    try{window.lpSeedAsst&&['Aman Gill','Kavya Menon'].forEach(n=>window.lpSeedAsst(n));}catch(e){}
  }
  function model(){
    seedWaiting();
    const all=floor(),t=T(),w=t.who;
    const inScope=p=>!w||doc(p)===w;
    const risk=all.filter(p=>p.risk&&!t.acted[p.id]);
    const nosess=all.filter(noSess);
    const sign=all.filter(p=>planWait(p)||coWait(p).length);
    const noscore=all.filter(p=>(+p.day||0)>=14&&!hasScore(p));
    const fam=all.filter(p=>openGr(p)||famLate(p));
    const nopsy=all.filter(p=>!doc(p));
    const mine=all.filter(p=>doc(p)===mineName);
    const disch=all.filter(dischSoon);
    return {all,risk,nosess,sign,noscore,fam,nopsy,mine,disch,inScope};
  }
  const go2=h=>`go('${h}')`;
  const tile=(n,l,s,k,warn)=>`<button class="lt-t${warn&&n?' w':''}" onclick="ltFlt('${k}')"><b>${n}</b><span>${l}</span><i>${s}</i></button>`;
  function nameCell(p){return `<div><b>${esc(p.name)}</b> <span class="tiny muted">${esc(String(p.room||'').replace(/^Room\s*/,'R '))} · day ${+p.day||0}${p.risk?' · <span style="color:#b42318;font-weight:700">high risk</span>':''}</span><div class="tiny muted">${esc(doc(p)||'No psychologist yet')}</div></div>`;}
  const LBL={risk:'Risk not acted on',fam:'Family',famcalls:'Family calls overdue',sign:'To review and sign',nosess:'No session',nopsy:'No psychologist',noscore:'No score',rst:'After restraint',grp:'Group',leave:'Leave cover'};
  function actions(M){
    const t=T(),rows=[];
    M.risk.forEach(p=>rows.push({k:'risk',id:'risk'+p.id,p,why:'Risk check yes and no action recorded after 1 h',btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Ask ${esc(first(doc(p)))}</button><button class="btn sm pri" onclick="ltCall('${p.id}')">Call psychiatrist</button>`}));
    M.all.filter(openGr).forEach(p=>rows.push({k:'fam',id:'gr'+p.id,p,why:openGr(p)+' family concern open (6 h clock)',btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Ask ${esc(first(doc(p)))}</button><button class="btn sm pri" onclick="ltWill('${p.id}')">I will call</button>`}));
    const late=M.all.filter(p=>famLate(p)&&!openGr(p));
    if(late.length)rows.push({k:'famcalls',id:'famcalls',p:null,why:late.length+' required family calls overdue: '+late.map(p=>p.name.split(' ')[0]+' ('+first(doc(p)||'no one')+')').join(', '),btn:`<button class="btn sm" onclick="ltFlt('fam')">See them</button><button class="btn sm pri" onclick="ltRemind()">Remind psychologists</button>`});
    M.sign.forEach(p=>rows.push({k:'sign',id:'sg'+p.id,p,why:(planWait(p)?'Therapy plan to sign off':'')+(planWait(p)&&coWait(p).length?' · ':'')+(coWait(p).length?coWait(p).length+' assistant note to co-sign':''),btn:`<button class="btn sm pri" onclick="ltQueue()">Open review queue</button>`}));
    restDebrief().forEach(e=>{const p=M.all.find(x=>x.id===e.pid);if(p)rows.push({k:'rst',id:'rst'+e.id+e.pid,p,why:'Assign a debrief and a behaviour support plan within 72 h',btn:`<button class="btn sm pri" onclick="ltDebrief('${e.id}','${e.pid}')">Assign</button>`});});
    M.nosess.forEach(p=>rows.push({k:'nosess',id:'ns'+p.id,p,why:hasNote(p)?'No session for '+lastSess(p)+' days (plan: 3 a week)':'No therapy session recorded yet, day '+(+p.day||0),btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Ask ${esc(first(doc(p)))}</button>`}));
    M.nopsy.forEach(p=>rows.push({k:'nopsy',id:'np'+p.id,p,why:'New admission, no psychologist assigned',btn:`<button class="btn sm pri" onclick="lpAssign('${p.id}')">Assign</button>`}));
    M.noscore.forEach(p=>rows.push({k:'noscore',id:'sc'+p.id,p,why:'No PHQ-9, GAD-7 or Y-BOCS in 14 days',btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Send to ${esc(first(doc(p)))}'s Today</button>`}));
    rows.push({k:'grp',id:'grp',p:null,why:'Mindfulness group, Saturday 4 pm has no facilitator',btn:`<button class="btn sm pri" onclick="ltGrp('me')">I will take it</button><button class="btn sm" onclick="ltGrp('move')">Move time</button>`});
    rows.push({k:'leave',id:'leave',p:null,why:'Priya Nair on leave 14 to 16 Nov · her patients, groups and family sessions need cover',btn:`<button class="btn sm pri" onclick="ltCover()">Choose cover</button>`});
    const f=t.flt;let out=rows.filter(r=>M.inScope(r.p||{})||!r.p);
    if(f&&f!=='all'&&f!=='risk'&&f!=='nosess'&&f!=='sign'&&f!=='noscore'&&f!=='fam')return out;
    if(f==='risk')out=out.filter(r=>r.k==='risk');else if(f==='nosess')out=out.filter(r=>r.k==='nosess');else if(f==='sign')out=out.filter(r=>r.k==='sign');else if(f==='noscore')out=out.filter(r=>r.k==='noscore');else if(f==='fam')out=out.filter(r=>r.k==='fam'||r.k==='famcalls');
    return out;
  }
  const FILT=[['all','All'],['risk','Risk'],['nosess','No session 3+ days'],['sign','To review'],['noscore','No score 14 d'],['fam','Family waiting'],['disch','Discharge this week']];
  function caseTable(M,list){
    const f=T().flt;
    const keep=p=>f==='all'||(f==='risk'&&p.risk)||(f==='nosess'&&noSess(p))||(f==='sign'&&(planWait(p)||coWait(p).length))||(f==='noscore'&&(+p.day||0)>=14&&!hasScore(p))||(f==='fam'&&(openGr(p)||famLate(p)))||(f==='disch'&&dischSoon(p));
    const rows=list.filter(p=>M.inScope(p)&&keep(p)).map(p=>{
      const ls=lastSess(p),fm=famOf(p),fl=[];if(p.risk)fl.push('High risk');if(planWait(p))fl.push('Plan to sign');if(coWait(p).length)fl.push('Note to co-sign');if((+p.day||0)>=14&&!hasScore(p))fl.push('No score');if(dischSoon(p))fl.push('Discharge this week');
      const dots=Array.from({length:8},(_,i)=>`<i class="lt-d${i<topics(p)?' on':''}"></i>`).join('');
      return `<tr><td>${nameCell(p)}<div class="tiny muted">${p.age||''}/${p.sex||''} · ${esc(therapyOf(p))}</div></td><td class="small">${esc(doc(p)||'—')}</td><td class="small" style="${ls>=3&&(+p.day||0)>=3?'color:#b54708;font-weight:700':''}">${(+p.day||0)>=1?(ls===0?'Today':ls===1?'Yesterday':ls+' days ago'):'Admitted today'}</td>
        <td class="small">${esc(fm.name)} <span class="muted">(${esc(String(fm.rel||'').toLowerCase())})</span><div class="tiny muted">${esc(fm.last)}</div>${openGr(p)?'<span class="lt-c r">Concern open</span>':''}${famLate(p)?'<span class="lt-c a">Call overdue</span>':''}<div class="lt-ds" title="Family topics covered">${dots}</div></td>
        <td class="small">${fl.map(x=>`<span class="lt-c ${/risk/i.test(x)?'r':'a'}">${esc(x)}</span>`).join('')||'<span class="muted">On track</span>'}</td>
        <td style="text-align:right;white-space:nowrap"><button class="btn sm" onclick="${go2('#/patient/'+p.id+'/overview')}">Open record</button> <button class="btn sm" onclick="lpAssign('${p.id}')">Change</button></td></tr>`;}).join('');
    return `<table class="lt-tb"><thead><tr><th>Patient</th><th>Psychologist</th><th>Last session</th><th>Family</th><th>Needs attention</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="pad small muted">No patients match.</td></tr>'}</tbody></table>`;
  }
  function page(){
    $('title').textContent='Today';
    const M=model(),t=T(),now=new Date(),hr=now.getHours(),gr=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
    const date=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
    const A=actions(M),open=A.filter(r=>!doneRow(r.id)),need=open.length;
    const tiles=tile(M.all.length,'On the floor',M.nopsy.length+' without a psychologist','all')+tile(M.risk.length,'Risk not acted on','needs you now','risk',1)+tile(M.nosess.length,'No session 3+ days','against the plan','nosess',1)+tile(M.sign.length,'To review and sign','plans and notes','sign',1)+tile(M.noscore.length,'No score in 14 days','PHQ-9, GAD-7, Y-BOCS','noscore',1)+tile(M.fam.length,'Families waiting','calls and concerns','fam',1);
    const tabs=[['act','Actions',need],['floor','Floor caseload',M.all.length],['mine','My caseload',M.mine.length]].map(x=>`<button class="lt-tab${t.tab===x[0]?' on':''}" onclick="ltTab('${x[0]}')">${x[1]} <span>${x[2]}</span></button>`).join('');
    const sel=`<select class="input lt-sel" onchange="ltWho(this.value)"><option value="">All psychologists</option>${['Priya Nair','Kiran Mehra','Surabhi Sengar','Ankit Verma'].map(n=>`<option ${t.who===n?'selected':''}>${n}</option>`).join('')}</select>`;
    const chips=`<div class="lt-fl">${FILT.map(f=>`<button class="lt-ch${t.flt===f[0]?' on':''}" onclick="ltSet('${f[0]}')">${f[1]}</button>`).join('')}${sel}</div>`;
    let body;
    if(t.tab==='act')body=chips+(A.length?`<table class="lt-tb"><tbody>${A.map(r=>{const d=doneRow(r.id);return `<tr class="${d?'lt-done':''}"><td style="width:160px"><b class="lt-k ${r.k}">${LBL[r.k]}</b></td><td>${r.p?nameCell(r.p):'<b>Floor</b>'}</td><td class="small">${esc(r.why)}${d?` <b style="color:#067647">· ${esc(t.done[r.id])}</b>`:''}</td><td style="text-align:right;white-space:nowrap">${d?'<span class="lt-c g">Done</span>':r.btn}</td></tr>`;}).join('')}</tbody></table>`:'<div class="pad small muted">Nothing needs you right now.</div>');
    else body=chips+caseTable(M,t.tab==='mine'?M.mine:M.all);
    return `<div class="lt"><div class="lt-h"><h2>${gr}, Surabhi</h2><div class="small muted">${esc(date)} · ${need} thing${need===1?'':'s'} need${need===1?'s':''} you</div></div><div class="lt-ts">${tiles}</div><div class="lt-tabs">${tabs}</div><section class="card lt-body">${body}</section></div>`;
  }
  const keepScroll=()=>{const y=window.scrollY;render();requestAnimationFrame(()=>window.scrollTo(0,y));};
  const mark=(id,txt)=>{T().done[id]=txt+' · '+atNow();keepScroll();};
  window.ltTab=k=>{T().tab=k;keepScroll();};
  window.ltFlt=k=>{const t=T();if(k==='all')t.tab='floor';else if(k==='disch')t.tab='floor';else t.tab='act';t.flt=k;keepScroll();};
  window.ltSet=k=>{T().flt=k;keepScroll();};
  window.ltWho=v=>{T().who=v;keepScroll();};
  window.ltAsk=pid=>{const p=floor().find(x=>x.id===pid);T().asked[pid]=atNow();const id=(T().tab==='act'?['ns','sc','gr','risk']:[]).map(k=>k+pid).find(k=>!T().done[k]);toast('Message sent to '+(doc(p||{})||'the psychologist')+'. They see it on their Today.');if(id)mark(id,'Asked '+first(doc(p||{})));};
  window.ltCall=pid=>{const p=floor().find(x=>x.id===pid);T().acted[pid]=signer()+' · '+atNow();toast('Call to the treating psychiatrist logged for '+(p||{}).name+'.');keepScroll();};
  window.ltWill=pid=>{try{lpCallFam(pid);}catch(e){}mark('gr'+pid,'You will call');};
  window.ltRemind=()=>{toast('Reminder sent to the psychologists with overdue family calls');mark('famcalls','Reminded');};
  window.ltDebrief=(eid,pid)=>{try{const e=S.rst.eps.find(x=>String(x.id)===String(eid)&&x.pid===pid);if(e)e.debrief={by:signer(),at:atNow()};}catch(x){}toast('Debrief and behaviour support plan assigned (due within 72 h)');mark('rst'+eid+pid,'Assigned');};
  window.ltGrp=a=>{if(a==='me'){toast('You will run the Mindfulness group on Saturday');mark('grp','You take it');}else{toast('Group moved to Saturday 5 pm. The facilitators are told.');mark('grp','Moved to 5 pm');}};
  window.ltCover=()=>V3.modal('Leave cover · Priya Nair, 14 to 16 Nov','Her patients, groups and family sessions go to the cover with a handover.',`<label class="field"><span class="lbl">Cover</span><select class="input" id="ltCv">${['Kiran Mehra · 7 patients, 2 of 4 sessions today','Surabhi Sengar · 5 patients','Ankit Verma · assistant, no leave']. map(x=>`<option>${x}</option>`).join('')}</select></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="ltCoverSave()">Assign cover</button>`);
  window.ltCoverSave=()=>{const v=String(($('ltCv')||{}).value||'').split(' · ')[0];closeModal();toast(v+' covers Priya Nair. The handover is sent.');mark('leave','Cover: '+v);};
  const signAll=()=>{let n=0;floor().forEach(p=>{if(planWait(p)){L().sign[p.id]={by:signer(),at:atNow()};L().back[p.id]='';n++;}coWait(p).forEach(o=>{L().cosign[p.id+':'+o.i]={by:signer(),at:atNow()};n++;});});return n;};
  window.ltSignAll=()=>pinSign('Sign everything in the review queue',[['Signing as',signer()],['Role','Psychologist Lead']],()=>{const n=signAll();closeModal();keepScroll();toast(n+' items signed. Signed plans count in the quality measure.');});
  window.ltQueue=function(){
    const M=model(),rows=[];
    M.all.forEach(p=>{if(planWait(p))rows.push(`<div class="plan"><div class="row sp"><b>${esc(p.name)} · therapy plan</b><span class="tiny muted">${esc(doc(p))}</span></div><div class="row" style="justify-content:flex-end;gap:6px;margin-top:6px"><button class="btn sm" onclick="closeModal();lpBack('${p.id}')">Updates needed</button><button class="btn sm pri" onclick="closeModal();lpSignPlan('${p.id}')">Sign</button></div></div>`);
      coWait(p).forEach(o=>rows.push(`<div class="plan"><div class="row sp"><b>${esc(p.name)} · session note</b><span class="tiny muted">${esc(o.n.by||'')}</span></div><div class="small">${esc(o.n.summaryLine||o.n.mod||'')}</div><div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn sm pri" onclick="closeModal();lpCosign('${p.id}',${o.i})">Co-sign</button></div></div>`));});
    V3.modal('Review queue · '+rows.length+' waiting','Sign it, or send it back with what to fix. The author sees "Updates needed" on their Today.',`<div style="max-height:52vh;overflow:auto;display:flex;flex-direction:column;gap:8px">${rows.join('')||'<div class="small muted">Nothing waiting.</div>'}</div>`,`<button class="btn" onclick="closeModal()">Close</button>${rows.length?'<button class="btn pri" onclick="closeModal();ltSignAll()">Sign all remaining</button>':''}`);
  };
  const css=document.createElement('style');css.textContent=`.lt-h h2{margin:0 0 2px}.lt-ts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:12px 0}.lt-t{text-align:left;background:#fff;border:1px solid var(--line,#e3eaf2);border-radius:12px;padding:10px 12px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}.lt-t b{font-size:22px}.lt-t span{font-weight:650;font-size:13px}.lt-t i{font-style:normal;font-size:11.5px;color:#667085}.lt-t.w b{color:#b54708}
  .lt-tabs{display:flex;gap:8px;margin:6px 0 10px;min-height:38px;position:sticky;top:60px;z-index:3;background:var(--bg)}.lt-tab{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:6px 14px;font:inherit;font-weight:650;cursor:pointer}.lt-tab.on{background:#1e6cdb;color:#fff;border-color:#1e6cdb}.lt-tab span{opacity:.75;font-weight:500}
  .lt-body{min-height:460px}.lt-tb{width:100%;border-collapse:collapse}.lt-tb th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667085;padding:10px 14px;background:#f8fafc}.lt-tb td{padding:10px 14px;border-top:1px solid #eef2f8;vertical-align:middle}.lt-k{font-size:12.5px}.lt-k.risk{color:#b42318}.lt-k.sign,.lt-k.fam,.lt-k.famcalls,.lt-k.nosess,.lt-k.noscore,.lt-k.nopsy,.lt-k.rst,.lt-k.grp,.lt-k.leave{color:#b54708}
  .lt-fl{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:10px 14px}.lt-ch{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:4px 12px;font:inherit;font-size:12.5px;cursor:pointer}.lt-ch.on{background:#eaf2ff;color:#1e5bb8;border-color:#9ec0f7;font-weight:700}.lt-sel{max-width:190px;min-height:32px;margin-left:auto}
  .lt-c{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 9px;margin:2px 4px 2px 0;background:#fffaeb;color:#b54708}.lt-c.r{background:#fef3f2;color:#b42318}.lt-c.g{background:#ecfdf3;color:#067647}
  .lt-ds{display:flex;gap:3px;margin-top:4px}.lt-d{width:8px;height:8px;border-radius:50%;background:#dfe6ef}.lt-d.on{background:#1f9d57}.lt-done td{opacity:.65}
  @media(max-width:900px){.lt-ts{grid-template-columns:repeat(2,minmax(0,1fr))}.lt-tb{display:block;overflow-x:auto}}`;document.head.appendChild(css);
  const prev=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){return lead()?page():prev.apply(this,arguments);};
})();
