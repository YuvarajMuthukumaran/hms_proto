/* 13 Nov 2026, Trello card "Floor Lead Psychologist: Today": the Today page is built in the portal from the real floor patients
   (no iframe). Greeting and date follow the clock; every count is counted from the records; every button opens the patient, a pop-up or an action.
   Floor lead psychologist only. */
(function(){
  const lead=()=>String((window.__TULASI__||{}).role||'')==='floor-lead-psychologist'&&S.role==='psychologist';
  const esc=s=>hesc(String(s==null?'':s));
  const L=()=>S.lp||(S.lp={assign:{},pF:'all',pD:'',scope:'floor',sign:{},back:{},note:{},conc:{},cosign:{},hoFrom:'',calD:''});
  const T=()=>{const l=L();return l.td||(l.td={tab:'act',flt:'',acted:{},asked:{},called:{}});};
  const floor=()=>{try{return allPts();}catch(e){return PTS;}};
  const doc=p=>{try{const a=v3().alloc.psych[p.id];if(a)return a;}catch(e){}return (typeof PSYCHOF!=='undefined'&&PSYCHOF[p.id])||'';};
  const mineName='Surabhi Sengar';
  const dayMs=864e5;
  /* last signed therapy session in days (from the session notes in the record); none = days since admission */
  const lastSess=p=>{try{const sn=(psyPx(p.id).sn||{}).notes||[];const ts=sn.filter(n=>n.status==='signed').map(n=>n.ts||0).sort((a,b)=>b-a)[0];if(ts)return Math.floor((Date.now()-ts)/dayMs);}catch(e){}return +p.day||0;};
  const hasScore=p=>{try{const x=psyPx(p.id);return !!((x.scores&&x.scores.length)||(x.scaleLog&&x.scaleLog.length)||(x.sn&&x.sn.ybocs));}catch(e){return false;}};
  const planWait=p=>{try{const x=psyPx(p.id);return !!(x.mgmtPsych&&x.mgmtPsych.signed)&&!L().sign[p.id];}catch(e){return false;}};
  const coWait=p=>{try{const sn=(psyPx(p.id).sn||{}).notes||[];return sn.map((n,i)=>({n,i})).filter(o=>/assistant/i.test(String(o.n.by||''))&&!L().cosign[p.id+':'+o.i]);}catch(e){return [];}};
  const openGr=p=>{try{return (ptCtxOf(p.id).pgriev||[]).filter(g=>g.st==='Open').length+(L().conc[p.id]&&!L().conc[p.id].closed?1:0);}catch(e){return 0;}};
  const famLate=p=>{try{return (+p.day||0)>=3&&!(ptCtxOf(p.id).calls||{}).d34psych&&(+p.day||0)<8;}catch(e){return false;}};
  /* the demo plans and assistant notes that wait for the lead (same as on the record) */
  function seedWaiting(){
    const SEED={neel:'Supportive and psychoeducation. Goals: sleep 6 h; one group activity a day.',sameer:'ERP for OCD. Goals: checking from 3 h to under 1 h a day.',varun:'MI and relapse prevention. Goals: no drinking on 2 home leaves.'};
    Object.keys(SEED).forEach(id=>{try{const x=psyPx(id);x.mgmtPsych=x.mgmtPsych||{};if(!x.mgmtPsych.signed&&!x.mgmtPsych.seedLp){x.mgmtPsych.seedLp=1;x.mgmtPsych.signed={by:(floor().find(p=>p.id===id)&&doc(floor().find(p=>p.id===id)))||'Priya Nair',at:'10 Nov 2026, 11:00 am'};x.mgmtPsych.goals=x.mgmtPsych.goals||SEED[id];x.mgmtPsych.therapyPlan=x.mgmtPsych.therapyPlan||SEED[id];}}catch(e){}});
    try{window.lpSeedAsst&&['Aman Gill','Kavya Menon'].forEach(n=>window.lpSeedAsst(n));}catch(e){}
  }
  function model(){
    seedWaiting();
    const all=floor(),t=T();
    const risk=all.filter(p=>p.risk&&!t.acted[p.id]);
    const nosess=all.filter(p=>(+p.day||0)>=5&&!!doc(p)&&lastSess(p)>=3);
    const sign=all.filter(p=>planWait(p)||coWait(p).length);
    const noscore=all.filter(p=>(+p.day||0)>=14&&!hasScore(p));
    const fam=all.filter(p=>openGr(p)||famLate(p));
    const nopsy=all.filter(p=>!doc(p));
    const mine=all.filter(p=>doc(p)===mineName);
    return {all,risk,nosess,sign,noscore,fam,nopsy,mine};
  }
  const go2=h=>`go('${h}')`;
  const tile=(n,l,s,k,warn)=>`<button class="lt-t${warn&&n?' w':''}" onclick="ltFlt('${k}')"><b>${n}</b><span>${l}</span><i>${s}</i></button>`;
  function nameCell(p){return `<div><b>${esc(p.name)}</b> <span class="tiny muted">${esc(String(p.room||'').replace(/^Room\s*/,'R '))} · day ${+p.day||0}${p.risk?' · <span style="color:#b42318;font-weight:700">high risk</span>':''}</span><div class="tiny muted">${esc(doc(p)||'No psychologist yet')}</div></div>`;}
  function actions(M){
    const t=T(),rows=[];
    M.risk.forEach(p=>rows.push({k:'risk',p,why:'Risk of harm is high and no action is recorded',btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Ask ${esc((doc(p)||'the psychologist').split(' ')[0])}</button><button class="btn sm pri" onclick="ltCall('${p.id}')">Call psychiatrist</button>`}));
    M.fam.forEach(p=>{const c=openGr(p);rows.push({k:'fam',p,why:c?c+' family concern open (6 h clock)':'Day 3 to 4 family call is due',btn:`<button class="btn sm" onclick="lpCallFam('${p.id}')">I will call</button><button class="btn sm" onclick="${go2('#/patient/'+p.id+'/prefs')}">Open</button>`});});
    M.sign.forEach(p=>rows.push({k:'sign',p,why:(planWait(p)?'Therapy plan to sign off':'')+(planWait(p)&&coWait(p).length?' · ':'')+(coWait(p).length?coWait(p).length+' assistant note to co-sign':''),btn:`<button class="btn sm pri" onclick="ltQueue()">Open review queue</button>`}));
    M.nosess.forEach(p=>rows.push({k:'nosess',p,why:'No session for '+lastSess(p)+' days',btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Ask ${esc((doc(p)||'the psychologist').split(' ')[0])}</button>`}));
    M.nopsy.forEach(p=>rows.push({k:'nopsy',p,why:'No psychologist assigned',btn:`<button class="btn sm pri" onclick="lpAssign('${p.id}')">Assign</button>`}));
    M.noscore.forEach(p=>rows.push({k:'noscore',p,why:'No PHQ-9, GAD-7 or Y-BOCS score in 14 days',btn:`<button class="btn sm" onclick="ltAsk('${p.id}')">Ask ${esc((doc(p)||'the psychologist').split(' ')[0])}</button>`}));
    const f=t.flt;return f&&f!=='all'?rows.filter(r=>r.k===f):rows;
  }
  function caseRows(list){
    return list.map(p=>{const fl=[];if(p.risk)fl.push('High risk');if(planWait(p))fl.push('Plan to sign');if(coWait(p).length)fl.push('Note to co-sign');if(openGr(p))fl.push('Family concern');if(lastSess(p)>=3&&(+p.day||0)>=3)fl.push('No session '+lastSess(p)+' d');
      return `<tr><td>${nameCell(p)}</td><td class="small">${fl.map(esc).join(' · ')||'<span class="muted">On track</span>'}</td><td style="text-align:right"><button class="btn sm" onclick="${go2('#/patient/'+p.id+'/overview')}">Open record</button> <button class="btn sm" onclick="lpAssign('${p.id}')">Change</button></td></tr>`;}).join('');
  }
  const LBL={risk:'Risk not acted on',fam:'Family',sign:'To review and sign',nosess:'No session',nopsy:'No psychologist',noscore:'No score'};
  function page(){
    $('title').textContent='Today';
    const M=model(),t=T(),now=new Date(),hr=now.getHours(),gr=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
    const date=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
    const A=actions(M),need=M.risk.length+M.fam.length+M.sign.length+M.nosess.length+M.nopsy.length+M.noscore.length;
    const tiles=tile(M.all.length,'On the floor',M.nopsy.length+' without a psychologist','all')+tile(M.risk.length,'Risk not acted on','needs you now','risk',1)+tile(M.nosess.length,'No session 3+ days','against the plan','nosess',1)+tile(M.sign.length,'To review and sign','plans and notes','sign',1)+tile(M.noscore.length,'No score in 14 days','PHQ-9, GAD-7, Y-BOCS','noscore',1)+tile(M.fam.length,'Families waiting','calls and concerns','fam',1);
    const tabs=[['act','Actions',need],['floor','Floor caseload',M.all.length],['mine','My caseload',M.mine.length]].map(x=>`<button class="lt-tab${t.tab===x[0]?' on':''}" onclick="ltTab('${x[0]}')">${x[1]} <span>${x[2]}</span></button>`).join('');
    let body;
    if(t.tab==='act')body=A.length?`<table class="lt-tb"><tbody>${A.map(r=>`<tr><td style="width:150px"><b class="lt-k ${r.k}">${LBL[r.k]}</b></td><td>${nameCell(r.p)}</td><td class="small">${esc(r.why)}</td><td style="text-align:right;white-space:nowrap">${r.btn}</td></tr>`).join('')}</tbody></table>`:'<div class="pad small muted">Nothing needs you right now.</div>';
    else body=`<table class="lt-tb"><tbody>${caseRows(t.tab==='mine'?M.mine:M.all)||'<tr><td class="pad small muted">No patients.</td></tr>'}</tbody></table>`;
    return `<div class="lt"><div class="lt-h"><h2>${gr}, Surabhi</h2><div class="small muted">${esc(date)} · ${need} thing${need===1?'':'s'} need${need===1?'s':''} you</div></div><div class="lt-ts">${tiles}</div><div class="lt-tabs">${tabs}</div><section class="card lt-body">${body}</section></div>`;
  }
  window.ltTab=k=>{T().tab=k;render();};
  window.ltFlt=k=>{const t=T();if(k==='all'){t.tab='floor';t.flt='';}else{t.tab='act';t.flt=t.flt===k?'':k;}render();};
  window.ltAsk=pid=>{const p=floor().find(x=>x.id===pid);T().asked[pid]=atNow();toast('Message sent to '+(doc(p||{})||'the psychologist')+'. They see it on their Today.');};
  window.ltCall=pid=>{const p=floor().find(x=>x.id===pid),t=T();t.acted[pid]=signer()+' · '+atNow();render();toast('Call to the treating psychiatrist logged for '+(p||{}).name+'.');};
  window.ltQueue=function(){
    const M=model(),rows=[];
    M.all.forEach(p=>{if(planWait(p))rows.push(`<div class="plan"><div class="row sp"><b>${esc(p.name)} · therapy plan</b><span class="tiny muted">${esc(doc(p))}</span></div><div class="row" style="justify-content:flex-end;gap:6px;margin-top:6px"><button class="btn sm" onclick="closeModal();lpBack('${p.id}')">Updates needed</button><button class="btn sm pri" onclick="closeModal();lpSignPlan('${p.id}')">Sign</button></div></div>`);
      coWait(p).forEach(o=>rows.push(`<div class="plan"><div class="row sp"><b>${esc(p.name)} · session note</b><span class="tiny muted">${esc(o.n.by||'')}</span></div><div class="small">${esc(o.n.summaryLine||o.n.mod||'')}</div><div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn sm pri" onclick="closeModal();lpCosign('${p.id}',${o.i})">Co-sign</button></div></div>`));});
    V3.modal('Review queue · '+rows.length+' waiting','Sign it, or send it back with what to fix. The author sees "Updates needed" on their Today.',`<div style="max-height:52vh;overflow:auto;display:flex;flex-direction:column;gap:8px">${rows.join('')||'<div class="small muted">Nothing waiting.</div>'}</div>`,`<button class="btn" onclick="closeModal()">Close</button>`);
  };
  const css=document.createElement('style');css.textContent=`.lt-h h2{margin:0 0 2px}.lt-ts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:12px 0}.lt-t{text-align:left;background:#fff;border:1px solid var(--line,#e3eaf2);border-radius:12px;padding:10px 12px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}.lt-t b{font-size:22px}.lt-t span{font-weight:650;font-size:13px}.lt-t i{font-style:normal;font-size:11.5px;color:#667085}.lt-t.w b{color:#b54708}
  .lt-tabs{display:flex;gap:8px;margin:6px 0 10px;min-height:38px}.lt-tab{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:6px 14px;font:inherit;font-weight:650;cursor:pointer}.lt-tab.on{background:#1e6cdb;color:#fff;border-color:#1e6cdb}.lt-tab span{opacity:.75;font-weight:500}
  .lt-body{min-height:340px}.lt-tb{width:100%;border-collapse:collapse}.lt-tb td{padding:10px 14px;border-top:1px solid #eef2f8;vertical-align:middle}.lt-k{font-size:12.5px}.lt-k.risk{color:#b42318}.lt-k.sign,.lt-k.fam,.lt-k.nosess,.lt-k.noscore,.lt-k.nopsy{color:#b54708}
  @media(max-width:900px){.lt-ts{grid-template-columns:repeat(2,minmax(0,1fr))}}`;document.head.appendChild(css);
  const prev=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){return lead()?page():prev.apply(this,arguments);};
})();
