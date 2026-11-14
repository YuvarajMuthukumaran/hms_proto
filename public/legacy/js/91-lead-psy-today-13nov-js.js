/* 13 to 14 Nov 2026, Trello cards 131, 148 to 153: Floor Lead Psychologist Today, built in the portal from the real floor patients (no iframe).
   Six tiles, team strip, Actions (one row per patient, issues as chips, worst patient on top) / Floor caseload / My caseload,
   one nudge per psychologist, review queue with Sign all remaining (each item opened first, one PIN), weekly supervision notes (Team and leave).
   Sign, back, note, cosign, concern, ask and supervision are saved in each patient's psychologist notes (psyx.lp) so the other logins see them.
   Demo values: the group without a facilitator, the leave dates and sessions planned today (there is no groups, leave or calendar data in the records yet).
   Floor lead psychologist only; the clinical psychologist only gets the "From your lead" card on Today. */
(function(){
  const lead=()=>String((window.__TULASI__||{}).role||'')==='floor-lead-psychologist'&&S.role==='psychologist';
  const esc=s=>hesc(String(s==null?'':s));
  const ageSex=p=>{let f=[];try{f=(typeof RMO_FILL!=='undefined'&&RMO_FILL[p.id])||[];}catch(e){}const a=p.age||f[4]||'',x=p.sex||f[3]||'';return a&&x?a+'/'+x:(a||x||'');};
  const L=()=>window.lpState();
  const LPX=pid=>window.lpLPX(pid);
  const T=()=>{const l=L();return l.td||(l.td={tab:'act',flt:'all',who:'',done:{},acted:{},asked:{},reminded:0,cover:'',grp:'',opened:{},ticks:{},qf:''});};
  const floor=()=>{try{return allPts();}catch(e){return PTS;}};
  const doc=p=>{try{const a=v3().alloc.psych[p.id];if(a)return a;}catch(e){}return (typeof PSYCHOF!=='undefined'&&PSYCHOF[p.id])||'';};
  const mineName='Surabhi Sengar',dayMs=864e5;
  const first=n=>String(n||'the psychologist').split(' ')[0];
  const clock=()=>new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
  const TEAMN=['Priya Nair','Kiran Mehra','Surabhi Sengar','Ankit Verma'];
  const PX=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const notesOf=p=>{try{return (PX(p.id).sn||{}).notes||[];}catch(e){return [];}};
  /* days since the last signed session note (individual, group or family); null = none recorded */
  const sessAge=p=>{const ts=notesOf(p).filter(n=>n.status==='signed'&&n.ts).map(n=>n.ts).sort((a,b)=>b-a)[0];return ts?Math.max(0,Math.floor((Date.now()-ts)/dayMs)):null;};
  const planFreq=p=>{const t=String((PX(p.id).mgmtPsych||{}).therapyPlan||'');const m=t.match(/(\d+)\s*(?:sessions?\s*)?(?:a|per|\/)\s*week/i);return +(LPX(p.id).planFreq)||(m?+m[1]:3);};
  const needDays=p=>Math.max(1,Math.ceil(7/planFreq(p)));
  const hasPlan=p=>{const m=PX(p.id).mgmtPsych||{};return !!(m.therapyPlan||m.signed||LPX(p.id).planFreq);};
  /* on home leave or an outing (saved in the patient's psychologist notes, so every login sees it); the no-session rule skips these patients */
  const awayOf=p=>{const a=LPX(p.id).away;return a&&a.until>Date.now()?a:null;};
  const away=p=>!!p.dischargeToday||!!awayOf(p);
  /* the therapy plan sets the frequency (3 a week = flag after 3 days). No plan yet is its own flag from day 7 (the day 7 rule) */
  const noSess=p=>{if(!doc(p)||away(p)||!hasPlan(p))return false;const a=sessAge(p),d=+p.day||0;return a===null?d>=needDays(p):a>=needDays(p);};
  const noPlan=p=>!!doc(p)&&!away(p)&&!hasPlan(p)&&(+p.day||0)>=7;
  const hasScore=p=>{try{const x=PX(p.id);return !!((x.scores&&x.scores.length)||(x.scaleLog&&x.scaleLog.length)||(x.sn&&x.sn.ybocs));}catch(e){return false;}};
  const planWait=p=>{try{const x=PX(p.id);return !!(x.mgmtPsych&&x.mgmtPsych.signed)&&!L().sign[p.id];}catch(e){return false;}};
  const coWait=p=>{try{return notesOf(p).filter(n=>/assistant/i.test(String(n.by||''))&&!L().cosign[p.id+':'+n.id]).map(n=>({n}));}catch(e){return [];}};
  const concOf=p=>{const c=L().conc[p.id];return c&&!c.closed?c:null;};
  const openGr=p=>{try{return (ptCtxOf(p.id).pgriev||[]).filter(g=>g.st==='Open').length+(concOf(p)?1:0);}catch(e){return concOf(p)?1:0;}};
  const famLate=p=>{try{return (+p.day||0)>=3&&(+p.day||0)<8&&!(ptCtxOf(p.id).calls||{}).d34psych;}catch(e){return false;}};
  const dischSoon=p=>{try{const d=new Date(ptCtxOf(p.id).edd||'').getTime();return !!p.dischargeToday||(d&&d-Date.now()<7*dayMs&&d-Date.now()>-dayMs);}catch(e){return !!p.dischargeToday;}};
  const therapyOf=p=>{const d=String(p.dx||'');return /obsess|ocd/i.test(d)?'ERP':/depress/i.test(d)?'CBT, behavioural activation':/psychotic|schizo/i.test(d)?'CBT for psychosis':/alcohol|opioid|substance/i.test(d)?'MI, relapse prevention':/bipolar/i.test(d)?'Supportive, psychoeducation':'Supportive therapy';};
  const topics=p=>{try{const t=(PX(p.id).sn||{}).told||{};return Math.min(8,Object.keys(t).filter(k=>t[k]).length);}catch(e){return 0;}};
  const famOf=p=>{try{const id=ptIdentity(p);let th=PX(p.id).th;if(!th&&window.psyThSeed){try{th=psyThSeed(p.id);}catch(e){}}const c=((th||{}).comm||[])[0];return {name:id.nr,rel:id.rel,last:c?c.date:'no contact logged'};}catch(e){return {name:'',rel:'',last:''};}};
  const restDebrief=()=>{try{return (S.rst.eps||[]).filter(e=>e.end&&!e.debrief&&!T().done['rst'+e.id+e.pid]);}catch(e){return [];}};
  const dLabel=ts=>new Date(ts).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+', '+new Date(ts).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
  const ago=ts=>{const d=Math.floor((Date.now()-ts)/dayMs);return d<=0?'today':d===1?'yesterday':d+' days ago';};
  /* demo calendar: Priya Nair is on leave 14 to 16 Nov 2026 */
  const onLeave=n=>{if(n!=='Priya Nair')return false;const t=Date.now();return t>=new Date(2026,10,14).getTime()&&t<new Date(2026,10,17).getTime();};
  const PLANNED={'Kiran Mehra':4,'Priya Nair':5,'Surabhi Sengar':2,'Ankit Verma':3};

  /* ---------------- demo seeds (once): waiting plans, last session per patient, plan frequency, concern, supervision ---------------- */
  const LAST={neel:3,sameer:1,varun:0,dev:1,kabir:4,arjun:1,tarun:3,sana:1,rahul:0,yash:1,meera:1,kavya:2,ritu:0};
  function seedAll(){
    if(window.__lpSeeded14)return;window.__lpSeeded14=1;
    const SEED={neel:'Supportive and psychoeducation. Goals: sleep 6 h; one group activity a day.',sameer:'ERP for OCD. Goals: checking from 3 h to under 1 h a day.',varun:'MI and relapse prevention. Goals: no drinking on 2 home leaves.'};
    Object.keys(SEED).forEach(id=>{try{const x=PX(id),p=floor().find(q=>q.id===id);x.mgmtPsych=x.mgmtPsych||{};if(!x.mgmtPsych.signed&&!x.mgmtPsych.seedLp){x.mgmtPsych.seedLp=1;x.mgmtPsych.signed={by:(p&&doc(p))||'Priya Nair',at:'10 Nov 2026, 11:00 am'};x.mgmtPsych.goals=x.mgmtPsych.goals||SEED[id];x.mgmtPsych.therapyPlan=x.mgmtPsych.therapyPlan||SEED[id];}}catch(e){}});
    try{window.lpSeedAsst&&['Aman Gill','Kavya Menon'].forEach(n=>window.lpSeedAsst(n));}catch(e){}
    floor().forEach(p=>{try{
      const who=doc(p),x=PX(p.id),lp=LPX(p.id),d=LAST[p.id];
      if(!who)return;
      if(!lp.planFreq&&!(x.mgmtPsych&&(x.mgmtPsych.therapyPlan||x.mgmtPsych.signed))&&(+p.day||0)>=3&&p.id!=='meera')lp.planFreq=3;
      if(d===undefined)return;
      x.sn=x.sn||{ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8,hwLog:{},hwWhy:{},told:{},grp:[]};x.sn.notes=x.sn.notes||[];
      if(x.sn.notes.some(n=>n.status==='signed'&&n.ts))return;
      const ts=Date.now()-d*dayMs-(d===0?30*60000:0),mod=therapyOf(p);
      x.sn.notes.push({id:'lps-'+p.id,ts,status:'signed',at:dLabel(ts),by:who,signedBy:who,signedAt:dLabel(ts+20*60000),mod,mins:'40',risk:{a:'no',b:'no',c:'no'},kind:'ind',addenda:[],summaryLine:mod+' session, 40 min. Risk check: all no.'});
    }catch(e){}});
    /* Yash Arora is on home leave until tomorrow evening (demo) */
    try{const y=LPX('yash');if(y.away===undefined)y.away={kind:'Home leave',until:Date.now()+30*3600000,by:'Dr. Kunal Sethi',at:atNow()};}catch(e){}
    /* Karan Malhotra's mother raised a concern 4 h 20 m ago (the family concern banner reads the same record) */
    try{const k=LPX('kabir');if(!k.conc)k.conc={at:Date.now()-4*3600000-20*60000,txt:'"Nobody has told us anything this week." Mother (Sunita Malhotra).'};}catch(e){}
    /* supervision notes: Priya 6 days ago, Kiran 9 days ago (amber), Ankit 2 days ago */
    const sup=L().sup=L().sup||{};
    const SS=[['Priya Nair',6,['neel','kabir'],'Session notes are clear and signed on the same day.','Close family loops within 24 hours.','Review Neel and Karan plans next week.'],['Kiran Mehra',9,['sameer','tarun'],'Good ERP exposure ladder for Sameer.','Write the risk check in every session note.','Bring Tarun to supervision after the restraint review.'],['Ankit Verma',2,['aman','kavya'],'Takes feedback well.','Ask for the lead co-sign the same day.','Observe a family session on Tuesday.']];
    SS.forEach(s=>{if(sup[s[0]]&&sup[s[0]].length)return;const ts=Date.now()-s[1]*dayMs,e={id:'sps-'+s[0].split(' ')[0].toLowerCase(),to:s[0],by:mineName,at:dLabel(ts),ts,cases:s[2],well:s[3],work:s[4],follow:s[5]};sup[s[0]]=[e];s[2].forEach(id=>{try{const l=LPX(id);l.sup=l.sup||[];if(!l.sup.some(q=>q.id===e.id))l.sup.push({id:e.id,to:e.to,by:e.by,at:e.at,ts:e.ts,work:e.work});}catch(x){}});});
  }

  function model(){
    seedAll();
    const all=floor(),t=T(),w=t.who;
    const inScope=p=>!w||doc(p)===w;
    const risk=all.filter(p=>p.risk&&!t.acted[p.id]);
    const nosess=all.filter(noSess);
    const noplan=all.filter(noPlan);
    const sign=all.filter(p=>planWait(p)||coWait(p).length);
    const noscore=all.filter(p=>(+p.day||0)>=14&&!hasScore(p));
    const fam=all.filter(p=>openGr(p)||famLate(p));
    const nopsy=all.filter(p=>!doc(p));
    const mine=all.filter(p=>doc(p)===mineName);
    const disch=all.filter(dischSoon);
    const rst={};restDebrief().forEach(e=>{rst[e.pid]=e;});
    return {all,risk,nosess,noplan,sign,noscore,fam,nopsy,mine,disch,inScope,rst};
  }
  const tile=(n,l,s,k,warn)=>`<button class="lt-t${warn&&n?' w':''}" onclick="ltFlt('${k}')"><b>${n}</b><span>${l}</span><i>${s}</i></button>`;
  function nameCell(p,noDoc){return `<div><b>${esc(p.name)}</b> <span class="tiny muted" style="white-space:nowrap">${esc(String(p.room||'').replace(/^Room\s*/,'R '))} · day ${+p.day||0}${p.risk?' · <span style="color:#b42318;font-weight:700">high risk</span>':''}</span>${noDoc?'':`<div class="tiny muted">${esc(doc(p)||'No psychologist yet')}</div>`}</div>`;}

  /* ---------------- one row per patient: issues as chips, worst first ---------------- */
  const RANK={risk:1,rst:2,fam:3,famcall:4,nopsy:5,sign:6,cosign:6,nosess:7,noplan:8,noscore:9};
  function concClock(c){const left=Math.max(0,6*3600000-(Date.now()+((S.au||{}).skip||0)*3600000-c.at)),h=Math.floor(left/3600000),m=Math.floor(left%3600000/60000);return h+' h '+m+' m left';}
  function issuesOf(p,M){
    const o=[],c=concOf(p);
    if(M.risk.includes(p))o.push({k:'risk',t:'Risk not acted on',red:1});
    if(M.rst[p.id])o.push({k:'rst',t:'Debrief due (72 h)'});
    if(c)o.push({k:'fam',t:'Family concern · '+concClock(c),red:1});
    else if((openGr(p)))o.push({k:'fam',t:'Family concern open'});
    if(famLate(p)&&!c)o.push({k:'famcall',t:'Family call overdue'});
    if(!doc(p))o.push({k:'nopsy',t:'No psychologist'});
    if(planWait(p))o.push({k:'sign',t:'Plan to sign'});
    if(coWait(p).length)o.push({k:'cosign',t:coWait(p).length+' note to co-sign'});
    if(noSess(p)){const a=sessAge(p);o.push({k:'nosess',t:a===null?'No session yet · day '+(+p.day||0):'No session '+a+' days'});}
    if(noPlan(p))o.push({k:'noplan',t:'No therapy plan yet'});
    if((+p.day||0)>=14&&!hasScore(p))o.push({k:'noscore',t:'No score 14 d'});
    return o.sort((a,b)=>RANK[a.k]-RANK[b.k]);
  }
  function patientRows(M){
    const f=T().flt,rows=[];
    M.all.filter(M.inScope).forEach(p=>{
      let iss=issuesOf(p,M);if(!iss.length)return;
      const keep={risk:['risk'],nosess:['nosess'],sign:['sign','cosign'],noscore:['noscore'],fam:['fam','famcall']}[f];
      if(keep&&!iss.some(i=>keep.includes(i.k)))return;
      rows.push({p,iss});
    });
    return rows.sort((a,b)=>(RANK[a.iss[0].k]-RANK[b.iss[0].k])||(b.iss.length-a.iss.length)||a.p.name.localeCompare(b.p.name));
  }
  const OPEN_LBL={risk:'Open record',rst:'Assign debrief',fam:'Open family',famcall:'Open family',nopsy:'Assign',sign:'Review and sign',cosign:'Review and sign',nosess:'Open sessions',noplan:'Open plan',noscore:'Open scores'};
  function rowBtns(p,iss){
    const top=iss[0].k,dn=doc(p),id=p.id;
    const prim=top==='nopsy'?`<button class="btn sm pri" onclick="lpAssign('${id}')">Assign</button>`:top==='rst'?`<button class="btn sm pri" onclick="ltDebriefFor('${id}')">${OPEN_LBL[top]}</button>`:`<button class="btn sm pri" onclick="ltOpen('${id}','${top}')">${OPEN_LBL[top]}</button>`;
    let more='';
    if(dn&&dn!==mineName&&!onLeave(dn)&&iss.some(i=>i.k!=='nopsy'))more+=`<button class="btn sm" onclick="ltAsk('${id}')">Ask ${esc(first(dn))}</button>`;
    if(iss.some(i=>i.k==='risk'))more+=`<button class="btn sm" onclick="ltCall('${id}')">Call psychiatrist</button>`;
    if(iss.some(i=>i.k==='fam'&&concOf(p)))more+=`<button class="btn sm" onclick="ltWill('${id}')">I will call</button>`;
    return prim+more;
  }
  const FLOORROWS=()=>{const t=T(),r=[];
    if(!t.done.grp)r.push({id:'grp',why:'Mindfulness group, Saturday 4 pm has no facilitator',btn:`<button class="btn sm pri" onclick="ltGrp('me')">I will take it</button><button class="btn sm" onclick="ltGrp('move')">Move time</button>`});
    if(!t.done.leave&&onLeave('Priya Nair'))r.push({id:'leave',why:'Priya Nair on leave 14 to 16 Nov · her patients, groups and family sessions need cover',btn:`<button class="btn sm pri" onclick="ltCover()">Choose cover</button>`});
    return r;};
  const openCount=(P,M)=>({n:P.length,fl:FLOORROWS().length});
  /* items still open for one psychologist's patients */
  const itemsFor=(name,M)=>{const out=[];M.all.filter(p=>doc(p)===name).forEach(p=>{issuesOf(p,M).forEach(i=>{if(i.k==='nopsy')return;out.push({p,i});});});return out;};
  function askBar(M){
    const b=TEAMN.filter(n=>n!==mineName&&!onLeave(n)).map(n=>({n,c:itemsFor(n,M).length})).filter(x=>x.c);
    const late=M.all.filter(p=>famLate(p)&&!concOf(p));
    const rem=late.length?`<button class="btn sm" onclick="ltRemind()">Remind psychologists · ${late.length} family call${late.length===1?'':'s'} overdue</button>${T().reminded?`<span class="tiny muted">reminded ${esc(T().reminded)}</span>`:''}`:'';
    if(!b.length&&!rem)return '';
    return `<div class="lt-ask"><span class="small muted">One message per psychologist:</span>${b.map(x=>`<button class="btn sm" onclick="ltAskPsy('${x.n}')">Ask ${esc(first(x.n))} (${x.c})</button>`).join('')}${rem}</div>`;
  }
  function actionsBody(M){
    const t=T(),P=patientRows(M),F=FLOORROWS();
    t.seen=t.seen||{};P.forEach(r=>{t.seen[r.p.id]=1;});
    const DONE=Object.keys(t.seen).filter(id=>!P.some(r=>r.p.id===id)).map(id=>M.all.find(p=>p.id===id)).filter(p=>p&&M.inScope(p));
    const tr=P.map(r=>{const p=r.p,asked=t.asked[p.id];return `<tr><td style="min-width:190px">${nameCell(p)}</td><td><div class="lt-cs">${r.iss.map(i=>`<span class="lt-c ${i.red?'r':'a'}">${esc(i.t)}</span>`).join('')}</div>${asked?`<div class="tiny muted">asked ${esc(first(doc(p)))} ${esc(asked)}</div>`:''}</td><td style="text-align:right;white-space:nowrap">${rowBtns(p,r.iss)}</td></tr>`;}).join('');
    const fr=F.map(r=>`<tr><td><b class="lt-k grp">Floor</b></td><td class="small">${esc(r.why)}</td><td style="text-align:right;white-space:nowrap">${r.btn}</td></tr>`).join('');
    const dn=DONE.map(p=>`<tr class="lt-done"><td style="min-width:190px">${nameCell(p)}</td><td><span class="lt-c g">Done</span> <span class="small muted">everything for this patient is handled</span></td><td></td></tr>`).join('');
    if(!P.length&&!F.length&&!DONE.length)return '<div class="pad small muted">Nothing needs you right now.</div>';
    return `<table class="lt-tb lt-act"><tbody>${tr}${dn}${F.length?`<tr><td colspan="3" class="lt-sec">Floor</td></tr>${fr}`:''}</tbody></table>`;
  }
  const FILT=[['all','All'],['risk','Risk'],['nosess','No session 3+ days'],['sign','To review'],['noscore','No score 14 d'],['fam','Family waiting'],['disch','Discharge this week']];
  function caseTable(M,list){
    const f=T().flt;
    const keep=p=>f==='all'||(f==='risk'&&p.risk)||(f==='nosess'&&noSess(p))||(f==='sign'&&(planWait(p)||coWait(p).length))||(f==='noscore'&&(+p.day||0)>=14&&!hasScore(p))||(f==='fam'&&(openGr(p)||famLate(p)))||(f==='disch'&&dischSoon(p));
    const rows=list.filter(p=>M.inScope(p)&&keep(p)).map(p=>{
      const ls=sessAge(p),fm=famOf(p),fl=[];if(p.risk)fl.push('High risk');if(planWait(p))fl.push('Plan to sign');if(coWait(p).length)fl.push('Note to co-sign');if(noSess(p))fl.push('No session');if(noPlan(p))fl.push('No therapy plan yet');if((+p.day||0)>=14&&!hasScore(p))fl.push('No score');if(dischSoon(p))fl.push('Discharge this week');
      const dots=Array.from({length:8},(_,i)=>`<i class="lt-d${i<topics(p)?' on':''}"></i>`).join('');
      const aw=awayOf(p),lsTxt=aw?'On '+aw.kind.toLowerCase()+' until '+new Date(aw.until).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):(+p.day||0)<1?'Admitted today':ls===null?'No session yet':ls===0?'Today':ls===1?'Yesterday':ls+' days ago';
      return `<tr><td style="min-width:200px">${nameCell(p,1)}<div class="tiny muted">${ageSex(p)} · ${esc(therapyOf(p))}</div></td><td class="small" data-l="Psychologist">${esc(doc(p)||'—')}</td><td class="small" data-l="Last session" style="${noSess(p)?'color:#b54708;font-weight:700':''}">${lsTxt}</td>
        <td class="small" data-l="Family">${esc(fm.name)} <span class="muted">(${esc(String(fm.rel||'').toLowerCase())})</span><div class="tiny muted">${esc(fm.last)}</div>${openGr(p)?'<span class="lt-c r">Concern open</span>':''}${famLate(p)?'<span class="lt-c a">Call overdue</span>':''}<div class="lt-ds" title="Family topics covered">${dots}</div></td>
        <td class="small" data-l="Needs attention">${fl.map(x=>`<span class="lt-c ${/risk/i.test(x)?'r':'a'}">${esc(x)}</span>`).join('')||'<span class="muted">On track</span>'}</td>
        <td style="text-align:right;white-space:nowrap"><button class="btn sm" onclick="go('#/patient/${p.id}/overview')">Open record</button> <button class="btn sm" onclick="lpAssign('${p.id}')">Change</button> <button class="btn sm" onclick="ltLeave('${p.id}')">${awayOf(p)?'Back from leave':'Leave'}</button></td></tr>`;}).join('');
    return `<table class="lt-tb lt-cl"><thead><tr><th>Patient</th><th>Psychologist</th><th>Last session</th><th>Family</th><th>Needs attention</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="pad small muted">No patients match.</td></tr>'}</tbody></table>`;
  }

  /* ---------------- team strip: who is on, caseload, sessions today, what is late, supervision ---------------- */
  const supOf=n=>{let a=(L().sup||{})[n]||[];try{const m=[];floor().filter(p=>doc(p)===n).forEach(p=>(LPX(p.id).sup||[]).filter(s=>s.to===n).forEach(s=>m.push(s)));a=a.concat(m);}catch(e){}return a;};
  const lastSup=n=>supOf(n).map(s=>s.ts||0).sort((a,b)=>b-a)[0]||0;
  function strip(M){
    return `<div class="lt-strip">${TEAMN.map(n=>{
      const mine=M.all.filter(p=>doc(p)===n),you=n===mineName,leave=onLeave(n);
      const riskN=mine.filter(p=>M.risk.includes(p)).length;
      let late=0;const parts={};mine.forEach(p=>issuesOf(p,M).forEach(i=>{if(i.k==='risk'||i.k==='nopsy')return;late++;const g=i.k==='fam'||i.k==='famcall'?'families':i.k==='sign'||i.k==='cosign'?'to sign':i.k==='nosess'||i.k==='noplan'?'sessions behind':'scores missing';parts[g]=(parts[g]||0)+1;}));
      const t0=new Date().setHours(0,0,0,0),done=M.all.reduce((c,p)=>c+notesOf(p).filter(q=>q.status==='signed'&&q.ts>=t0&&String(q.by||'').indexOf(n)===0).length,0),planned=leave?0:Math.max(done,PLANNED[n]||0);
      const ls=lastSup(n),sup=you?'':(ls?`supervised ${ago(ls)}`:'not supervised yet'),amb=!you&&(!ls||(Date.now()-ls)>7*dayMs);
      const cls=riskN?' r':late?' a':'';
      const askN=itemsFor(n,M).length;
      return `<div class="lt-pc${cls}" role="button" tabindex="0" onclick="ltTeamGo('${n}')"><div class="lt-pn"><b>${esc(you?'You · '+n:n)}</b><span class="lt-st ${leave?'off':'on'}">${leave?'On leave':'On today'}</span></div>
        <div class="small" title="Sessions done are counted from signed notes. Sessions planned are demo numbers until the calendar is linked.">${n==='Ankit Verma'?'Assistant psychologist':mine.length+' patients'} · ${planned?done+' of '+planned+' sessions today':'no sessions today'}</div>
        <div class="small ${late?'lt-lt':'muted'}">${late?late+' late: '+Object.keys(parts).map(k=>parts[k]+' '+(parts[k]===1?({families:'family','sessions behind':'session behind','scores missing':'score missing'}[k]||k):k)).join(', '):'Nothing late'}${riskN?` · <b style="color:#b42318">${riskN} risk not acted on</b>`:''}</div>
        <div class="lt-pf">${you?'<span class="tiny muted">Lead</span>':`<span class="tiny ${amb?'lt-amb':'muted'}">${esc(sup)}</span>`}<span>${!you&&askN&&!leave?`<button class="btn sm" onclick="event.stopPropagation();ltAskPsy('${n}')">Ask ${esc(first(n))} (${askN})</button>`:''}${you?'':`<button class="btn sm" onclick="event.stopPropagation();lpSup('${n}')">Supervision</button>`}</span></div></div>`;}).join('')}</div>`;
  }

  function page(){
    $('title').textContent='Today';
    const M=model(),t=T(),now=new Date(),hr=now.getHours(),gr=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
    const date=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
    const all=patientRows(Object.assign({},M,{inScope:()=>true})),fl=FLOORROWS().length,need=all.length;
    const tiles=tile(M.all.length,'On the floor',M.nopsy.length+' without a psychologist','all')+tile(M.risk.length,'Risk not acted on','needs you now','risk',1)+tile(M.nosess.length,'No session 3+ days','against the plan','nosess',1)+tile(M.sign.length,'To review and sign','plans and notes','sign',1)+tile(M.noscore.length,'No score in 14 days','PHQ-9, GAD-7, Y-BOCS','noscore',1)+tile(M.fam.length,'Families waiting','calls and concerns','fam',1);
    const tabs=[['act','Actions',need],['floor','Floor caseload',M.all.length],['mine','My caseload',M.mine.length]].map(x=>`<button class="lt-tab${t.tab===x[0]?' on':''}" onclick="ltTab('${x[0]}')">${x[1]} <span>${x[2]}</span></button>`).join('');
    const sel=`<select class="input lt-sel" onchange="ltWho(this.value)"><option value="">All psychologists</option>${TEAMN.map(n=>`<option ${t.who===n?'selected':''}>${n}</option>`).join('')}</select>`;
    const chips=`<div class="lt-fl">${FILT.map(f=>`<button class="lt-ch${t.flt===f[0]?' on':''}" onclick="ltSet('${f[0]}')">${f[1]}</button>`).join('')}${sel}</div>`;
    const body=t.tab==='act'?askBar(M)+chips+actionsBody(M):chips+caseTable(M,t.tab==='mine'?M.mine:M.all);
    return `<div class="lt"><div class="lt-h"><h2>${gr}, Surabhi</h2><div class="small muted">${esc(date)} · ${need} patient${need===1?'':'s'} need${need===1?'s':''} you${fl?' · '+fl+' floor item'+(fl===1?'':'s'):''}</div></div><div class="lt-ts">${tiles}</div>${strip(M)}<div class="lt-tabs">${tabs}</div><section class="card lt-body">${body}</section></div>`;
  }
  const keepScroll=()=>{const y=window.scrollY;render();requestAnimationFrame(()=>window.scrollTo(0,y));};
  const mark=(id,txt)=>{T().done[id]=txt+' · '+atNow();keepScroll();};
  window.ltTab=k=>{T().tab=k;keepScroll();};
  window.ltFlt=k=>{const t=T();if(k==='all')t.tab='floor';else if(k==='disch')t.tab='floor';else t.tab='act';t.flt=k;keepScroll();};
  window.ltSet=k=>{T().flt=k;keepScroll();};
  window.ltWho=v=>{T().who=v;keepScroll();};
  window.ltTeamGo=n=>{const t=T();t.tab='floor';t.flt='all';t.who=n;keepScroll();};
  /* open a patient's record on the tab that fits the issue */
  window.ltOpen=function(pid,kind){
    if(kind==='sign'||kind==='cosign'){ltQueue(pid);return;}
    const tab={risk:'overview',fam:'therapy',famcall:'therapy',nosess:'therapy',noplan:'plans',noscore:'vitals',rec:'overview'}[kind]||'overview';
    go('#/patient/'+pid+'/'+tab);
    const after={fam:()=>tpSeg('fam'),famcall:()=>tpSeg('fam'),nosess:()=>tpSub('sessions')}[kind];
    if(after)setTimeout(()=>{try{after();}catch(e){}},500);
  };
  /* ---------------- one message per psychologist, or one item ---------------- */
  function sendAsk(name,items,note,batch){
    const by=signer(),at=atNow(),ts=Date.now(),byP={};
    items.forEach(x=>{(byP[x.p.id]=byP[x.p.id]||[]).push(x.i.t);});
    Object.keys(byP).forEach(pid=>{LPX(pid).ask={id:batch,to:name,by,at,ts,note:note||'',items:byP[pid],done:false};T().asked[pid]=clock();});
  }
  /* the Patients page "Next due" column shows the same issues, in the same words, as Today */
  window.lpIssueTexts=function(pid){try{const p=floor().find(x=>x.id===pid);return p?issuesOf(p,model()).map(i=>i.t):null;}catch(e){return null;}};
  window.ltAsk=function(pid){const M=model(),p=floor().find(x=>x.id===pid);if(!p)return;const iss=issuesOf(p,M).filter(i=>i.k!=='nopsy');if(!iss.length)return;
    sendAsk(doc(p),iss.map(i=>({p,i})),'', 'a'+Date.now());toast('Message sent to '+doc(p)+'. They see it on their Today.');keepScroll();};
  window.ltAskPsy=function(name){const M=model(),it=itemsFor(name,M);if(!it.length){toast('Nothing open for '+name);return;}
    const rows=it.map((x,i)=>`<label class="lt-ai"><input type="checkbox" checked data-i="${i}"><span><b>${esc(x.p.name)}</b> · ${esc(x.i.t)}</span></label>`).join('');
    V3.modal('Ask '+esc(first(name)),'One message to '+esc(name)+' with the items you tick. They see it on their Today, each item opens the patient.',`<div style="max-height:44vh;overflow:auto">${rows}</div><label class="field" style="margin-top:10px"><span class="lbl">One line for ${esc(first(name))} (optional)</span><input class="input" id="ltAskNote" maxlength="160" placeholder="eg. please do these before 2 pm"></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="ltAskSend('${name}')">Send to ${esc(first(name))}</button>`);
    window.__ltAskItems=it;};
  window.ltAskSend=function(name){const it=window.__ltAskItems||[],pick=[...document.querySelectorAll('.lt-ai input:checked')].map(c=>it[+c.dataset.i]).filter(Boolean);
    if(!pick.length){toast('Tick at least one item');return;}
    sendAsk(name,pick,(($('ltAskNote')||{}).value||'').trim(),'a'+Date.now());closeModal();toast('One message sent to '+name+' with '+pick.length+' item'+(pick.length===1?'':'s'));keepScroll();};
  window.ltLeave=function(pid){const p=floor().find(x=>x.id===pid);if(!p)return;const a=awayOf(p);
    if(a){LPX(pid).away=null;toast(p.name+' is back from '+a.kind.toLowerCase()+'. Sessions count again.');keepScroll();return;}
    const d=new Date(Date.now()+864e5).toISOString().slice(0,10);
    V3.modal('Leave or outing · '+esc(p.name),'The no-session flag is skipped while the patient is away. It is saved in the record, so every login sees it.',`<label class="field"><span class="lbl">Kind</span><select class="input" id="lvK"><option>Home leave</option><option>Outing</option><option>Other</option></select></label><label class="field" style="margin-top:8px"><span class="lbl">Back by</span><input class="input" id="lvD" type="date" value="${d}"></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="ltLeaveSave('${pid}')">Save</button>`);};
  window.ltLeaveSave=function(pid){const k=($('lvK')||{}).value||'Home leave',d=($('lvD')||{}).value;const u=new Date(d+'T18:00:00').getTime();if(!d||isNaN(u)||u<=Date.now()){toast('Pick a date after today');return;}LPX(pid).away={kind:k,until:u,by:signer(),at:atNow()};closeModal();keepScroll();toast('Saved. The no-session flag is skipped until '+new Date(u).toLocaleDateString('en-GB',{day:'numeric',month:'short'})+'.');};
  window.ltCall=pid=>{const p=floor().find(x=>x.id===pid);T().acted[pid]=signer()+' · '+atNow();toast('Call to the treating psychiatrist logged for '+(p||{}).name+'.');keepScroll();};
  window.ltWill=pid=>{try{lpCallFam(pid);}catch(e){}};
  window.ltRemind=()=>{const M=model(),late=M.all.filter(p=>famLate(p)&&!concOf(p)),by={};late.forEach(p=>{const d=doc(p);if(d)(by[d]=by[d]||[]).push({p,i:{k:'famcall',t:'Family call overdue'}});});Object.keys(by).forEach(n=>{if(n!==mineName)sendAsk(n,by[n],'Please make the overdue family calls today.','a'+Date.now()+n[0]);});T().reminded=clock();toast('Reminder sent to '+Object.keys(by).filter(n=>n!==mineName).join(', ')+' with their overdue family calls');keepScroll();};
  window.ltDebriefFor=pid=>{const e=restDebrief().find(x=>x.pid===pid);if(e)ltDebrief(e.id,e.pid);};
  window.ltDebrief=(eid,pid)=>{try{const e=S.rst.eps.find(x=>String(x.id)===String(eid)&&x.pid===pid);if(e)e.debrief={by:signer(),at:atNow()};}catch(x){}toast('Debrief and behaviour support plan assigned (due within 72 h)');keepScroll();};
  window.ltGrp=a=>{if(a==='me'){toast('You will run the Mindfulness group on Saturday');mark('grp','You take it');}else{toast('Group moved to Saturday 5 pm. The facilitators are told.');mark('grp','Moved to 5 pm');}};
  window.ltCover=()=>V3.modal('Leave cover · Priya Nair, 14 to 16 Nov','Her patients, groups and family sessions go to the cover with a handover.',`<label class="field"><span class="lbl">Cover</span><select class="input" id="ltCv">${['Kiran Mehra · 7 patients, 2 of 4 sessions today','Surabhi Sengar · 3 patients','Ankit Verma · assistant, no leave'].map(x=>`<option>${x}</option>`).join('')}</select></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="ltCoverSave()">Assign cover</button>`);
  window.ltCoverSave=()=>{const v=String(($('ltCv')||{}).value||'').split(' · ')[0];closeModal();toast(v+' covers Priya Nair. The handover is sent.');mark('leave','Cover: '+v);};

  /* ---------------- review queue: open each item first, then sign the ticked ones with one PIN ---------------- */
  function qItems(pid){
    const rows=[];
    floor().forEach(p=>{if(pid&&p.id!==pid)return;
      if(planWait(p)){const m=PX(p.id).mgmtPsych||{};rows.push({key:'plan:'+p.id,kind:'plan',p,title:p.name+' · therapy plan',by:(m.signed||{}).by||doc(p),det:(m.goals||m.therapyPlan||'Plan text is on the Management Plan tab.')+' Signed by '+((m.signed||{}).by||doc(p))+', '+((m.signed||{}).at||'')});}
      coWait(p).forEach(o=>rows.push({key:'note:'+p.id+':'+o.n.id,kind:'note',p,nid:o.n.id,title:p.name+' · session note',by:o.n.by||'',det:(o.n.summaryLine||o.n.mod||'')+' '+(o.n.at?'Signed '+o.n.at+'.':'')}));});
    return rows;
  }
  function qHtml(rows){
    const t=T();
    return rows.map(r=>{const op=!!t.opened[r.key],on=op&&t.ticks[r.key]!==false;
      return `<div class="plan lt-q" data-k="${esc(r.key)}"><div class="row sp"><label class="lt-qt"><input type="checkbox" ${op?'':'disabled'} ${on?'checked':''} onchange="ltTick('${esc(r.key)}',this.checked)"><b>${esc(r.title)}</b></label><span class="tiny muted">${esc(r.by)}</span></div>
        <div class="small lt-qd" style="display:${op?'block':'none'}">${esc(r.det)}</div>
        <div class="row" style="justify-content:flex-end;gap:6px;margin-top:6px"><span class="tiny muted lt-qh" style="margin-right:auto;display:${op?'none':'inline'}">Open it to include it in Sign all</span><button class="btn sm" onclick="ltOpenItem('${esc(r.key)}')">${op?'Hide':'Open'}</button><button class="btn sm" onclick="closeModal();lpBack('${r.p.id}')">Updates needed</button>${r.kind==='plan'?`<button class="btn sm pri" onclick="closeModal();lpSignPlan('${r.p.id}')">Sign</button>`:`<button class="btn sm pri" onclick="closeModal();lpCosign('${r.p.id}','${r.nid}')">Co-sign</button>`}</div></div>`;}).join('');
  }
  window.ltQueue=function(pid){
    const t=T();t.qf=pid||'';const rows=qItems(t.qf),all=qItems('');
    V3.modal('Review queue · '+rows.length+' waiting','Open each item once, then sign the ones you ticked together with one PIN. "Updates needed" stays per item.',
      `<div style="max-height:52vh;overflow:auto;display:flex;flex-direction:column;gap:8px" id="ltQ">${qHtml(rows)||'<div class="small muted">Nothing waiting.</div>'}</div>${t.qf&&all.length>rows.length?`<div style="margin-top:8px"><button class="lp-lnk" onclick="ltQueue('')">Show all ${all.length} waiting</button></div>`:''}`,
      `<button class="btn" onclick="closeModal()">Close</button>${rows.length?`<span class="tiny muted" id="ltQn" style="margin-left:auto"></span><button class="btn pri" id="ltSignBtn" onclick="ltSignSel()" disabled>Sign all remaining (0)</button>`:''}`);
    ltCount();
  };
  const selKeys=()=>qItems(T().qf).filter(r=>T().opened[r.key]&&T().ticks[r.key]!==false);
  function ltCount(){const rows=qItems(T().qf),op=rows.filter(r=>T().opened[r.key]).length,n=selKeys().length,b=$('ltSignBtn'),h=$('ltQn');if(b){b.disabled=!n;b.textContent='Sign all remaining ('+n+')';}if(h)h.textContent=op+' of '+rows.length+' opened';}
  window.ltOpenItem=function(key){const t=T(),row=document.querySelector('.lt-q[data-k="'+key.replace(/"/g,'\\"')+'"]');t.opened[key]=!t.opened[key];if(t.opened[key]&&t.ticks[key]===undefined)t.ticks[key]=true;
    if(row){const o=!!t.opened[key],cb=row.querySelector('input[type=checkbox]');cb.disabled=!o;cb.checked=o&&t.ticks[key]!==false;row.querySelector('.lt-qd').style.display=o?'block':'none';row.querySelector('.lt-qh').style.display=o?'none':'inline';row.querySelector('button.btn').textContent=o?'Hide':'Open';}
    ltCount();};
  window.ltTick=function(key,v){T().ticks[key]=!!v;ltCount();};
  window.ltSignSel=function(){const sel=selKeys();if(!sel.length)return;
    pinSign('Sign '+sel.length+' item'+(sel.length===1?'':'s')+' in the review queue',[['Signing as',signer()],['Role','Psychologist Lead'],['Items',sel.map(r=>r.title).join('; ')]],()=>{
      sel.forEach(r=>{if(r.kind==='plan'){L().sign[r.p.id]={by:signer(),at:atNow()};L().back[r.p.id]='';}else L().cosign[r.p.id+':'+r.nid]={by:signer(),at:atNow()};T().opened[r.key]=false;});
      closeModal();keepScroll();toast(sel.length+' item'+(sel.length===1?'':'s')+' signed off by '+signer()+', Psychologist Lead. Signed plans count in the quality measure.');});};

  /* ---------------- weekly supervision (Team and leave) ---------------- */
  const WK={'Priya Nair':'DDDDDLL','Kiran Mehra':'DDWDDDD','Ankit Verma':'DDDDDWW','Surabhi Sengar':'DDDDDDW'};
  window.lpTeam=function(){
    const rows=TEAMN.map(n=>{const you=n===mineName,ls=lastSup(n),amb=!you&&(!ls||(Date.now()-ls)>7*dayMs);
      return `<tr><td><b>${esc(you?'You · '+n:n)}</b><div class="tiny muted">${n==='Ankit Verma'?'Assistant psychologist':'Psychologist'}</div></td>${[...WK[n]].map(c=>`<td style="text-align:center">${c}</td>`).join('')}<td class="small ${amb?'lt-amb':''}">${you?'':ls?'Supervised '+ago(ls):'Not supervised yet'}</td><td style="white-space:nowrap">${you?'':`<button class="btn sm pri" onclick="lpSup('${n}')">Supervision</button> <button class="btn sm" onclick="lpSupHist('${n}')">History</button>`}</td></tr>`;}).join('');
    V3.modal('Team and leave','D duty · W week off · L leave. Supervision notes are never shown to patients, families or Patient Experience.',`<div style="overflow:auto"><table class="t"><thead><tr><th></th>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<th>${d}</th>`).join('')}<th>Supervision</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'<button class="btn" onclick="closeModal()">Close</button>');
  };
  window.lpSup=function(name){
    const caseIds=floor().filter(p=>doc(p)===name||notesOf(p).some(n=>String(n.by||'').indexOf(name)===0)).map(p=>p);
    const cases=caseIds.length?caseIds.map(p=>`<label class="lt-ai"><input type="checkbox" value="${p.id}"><span><b>${esc(p.name)}</b> <span class="tiny muted">${esc(String(p.room||''))}</span></span></label>`).join(''):'<div class="small muted">No patients in their caseload.</div>';
    V3.modal('Supervision · '+esc(name),'Weekly note. Only you and '+esc(first(name))+' see it ("What to work on" shows on their Today).',`<div class="lbl">Cases discussed</div><div style="max-height:24vh;overflow:auto;margin-bottom:8px" id="lsCases">${cases}</div>
      <label class="field"><span class="lbl">What went well</span><textarea class="input" id="lsWell" rows="2"></textarea></label>
      <label class="field" style="margin-top:8px"><span class="lbl">What to work on</span><textarea class="input" id="lsWork" rows="2"></textarea></label>
      <label class="field" style="margin-top:8px"><span class="lbl">Follow up next week</span><textarea class="input" id="lsFol" rows="2"></textarea></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="lpSupSave('${name}')">Save supervision note</button>`);
  };
  window.lpSupSave=function(name){
    const g=id=>(($(id)||{}).value||'').trim(),well=g('lsWell'),work=g('lsWork'),fol=g('lsFol'),cases=[...document.querySelectorAll('#lsCases input:checked')].map(c=>c.value);
    if(!well&&!work&&!fol){toast('Write at least one line');return;}
    const ts=Date.now(),e={id:'sp'+ts,to:name,by:signer(),at:atNow(),ts,cases,well,work,follow:fol};
    const sup=L().sup=L().sup||{};(sup[name]=sup[name]||[]).unshift(e);
    if(work)cases.forEach(id=>{const l=LPX(id);l.sup=l.sup||[];l.sup.push({id:e.id,to:name,by:e.by,at:e.at,ts,work});});
    closeModal();keepScroll();toast('Supervision note saved for '+name+'. "What to work on" shows on their Today.');
  };
  window.lpSupHist=function(name){
    const a=(L().sup||{})[name]||[];
    V3.modal('Supervision history · '+esc(name),'Newest first.',`<div style="max-height:56vh;overflow:auto">${a.length?a.map(e=>`<div class="plan" style="margin-bottom:8px"><div class="row sp"><b>${esc(e.at)}</b><span class="tiny muted">by ${esc(e.by)}</span></div><div class="small"><b>Cases:</b> ${e.cases&&e.cases.length?e.cases.map(id=>esc(((floor().find(p=>p.id===id))||{}).name||id)).join(', '):'none picked'}</div>${e.well?`<div class="small"><b>Went well:</b> ${esc(e.well)}</div>`:''}${e.work?`<div class="small"><b>Work on:</b> ${esc(e.work)}</div>`:''}${e.follow?`<div class="small"><b>Follow up:</b> ${esc(e.follow)}</div>`:''}</div>`).join(''):'<div class="small muted">No supervision notes yet.</div>'}</div>`,`<button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="closeModal();lpSup('${name}')">New note</button>`);
  };

  /* ---------------- the clinical psychologist's Today: what the lead sent (read only) ---------------- */
  window.lpAuthor=function(v){
    if(!/^#\/myday/.test(location.hash||'')||v.querySelector('#lpFromLead'))return;
    const me=signer(),mine=floor().filter(p=>doc(p)===me),asks={},back=[],notes=[],work={};
    mine.forEach(p=>{const lp=LPX(p.id);
      if(lp.ask&&!lp.ask.done){const a=asks[lp.ask.id]=asks[lp.ask.id]||{a:lp.ask,items:[]};a.items.push({p,t:lp.ask.items});}
      if(lp.back)back.push({p,t:lp.back});if(lp.note&&lp.note.t)notes.push({p,n:lp.note});
      (lp.sup||[]).filter(s=>s.to===me&&s.work).forEach(s=>{work[s.id]=s;});});
    const blocks=[];
    Object.keys(asks).forEach(id=>{const x=asks[id];blocks.push(`<div class="plan" style="margin-bottom:8px"><div class="row sp"><b>${esc(x.a.by)} asked you to:</b><span class="tiny muted">${esc(x.a.at)}</span></div>${x.a.note?`<div class="small">${esc(x.a.note)}</div>`:''}${x.items.map(i=>`<div class="small"><button class="lp-lnk" onclick="go('#/patient/${i.p.id}/overview')">${esc(i.p.name)}</button> · ${esc(i.t.join(', '))}</div>`).join('')}<div style="text-align:right"><button class="btn sm" onclick="lpAskDone('${id}')">Done</button></div></div>`);});
    back.forEach(b=>blocks.push(`<div class="small"><b>${esc(b.p.name)}</b> · plan: updates needed · ${esc(b.t)}</div>`));
    notes.forEach(n=>blocks.push(`<div class="small"><b>${esc(n.p.name)}</b> · lead note · ${esc(n.n.t)}</div>`));
    const wk=Object.keys(work).map(k=>work[k]).sort((a,b)=>b.ts-a.ts);
    if(wk.length)blocks.push(`<div class="small"><b>What to work on</b> <span class="tiny muted">· supervision ${esc(wk[0].at)}, read only</span><div>${esc(wk[0].work)}</div></div>`);
    if(!blocks.length)return;
    const d=document.createElement('section');d.id='lpFromLead';d.className='card pad';d.innerHTML=`<div class="lbl">From your lead</div>${blocks.join('')}`;v.insertBefore(d,v.firstChild);
  };
  window.lpAskDone=function(id){floor().forEach(p=>{const lp=LPX(p.id);if(lp.ask&&lp.ask.id===id)lp.ask.done=true;});render();};

  const css=document.createElement('style');css.textContent=`.lt-h h2{margin:0 0 2px}.lt-ts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:12px 0}.lt-t{text-align:left;background:#fff;border:1px solid var(--line,#e3eaf2);border-radius:12px;padding:10px 12px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}.lt-t b{font-size:22px}.lt-t span{font-weight:650;font-size:13px}.lt-t i{font-style:normal;font-size:11.5px;color:#667085}.lt-t.w b{color:#b54708}
  .lt-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 12px}.lt-pc{background:#fff;border:1px solid #d6dee8;border-radius:12px;padding:10px 12px;cursor:pointer;display:flex;flex-direction:column;gap:3px;text-align:left}.lt-pc.a{border-color:#f5b94a}.lt-pc.r{border:2px solid #d9453d}.lt-pn{display:flex;justify-content:space-between;align-items:center;gap:6px}.lt-st{font-size:11px;font-weight:700;border-radius:99px;padding:1px 8px}.lt-st.on{background:#ecfdf3;color:#067647}.lt-st.off{background:#fffaeb;color:#b54708}.lt-lt{color:#b54708}.lt-pf{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap}.lt-amb{color:#b54708;font-weight:700}
  .lt-tabs{display:flex;gap:8px;margin:6px 0 10px;min-height:38px;position:sticky;top:60px;z-index:3;background:var(--bg)}.lt-tab{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:6px 14px;font:inherit;font-weight:650;cursor:pointer}.lt-tab.on{background:#1e6cdb;color:#fff;border-color:#1e6cdb}.lt-tab span{opacity:.75;font-weight:500}
  .lt-body{min-height:460px}.lt-tb{width:100%;border-collapse:collapse}.lt-tb th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667085;padding:10px 14px;background:#f8fafc}.lt-tb td{padding:10px 14px;border-top:1px solid #eef2f8;vertical-align:middle}.lt-k{font-size:12.5px}.lt-k.grp{color:#b54708}.lt-sec{background:#f8fafc;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667085;font-weight:700}.lt-cs{display:flex;flex-wrap:wrap;gap:2px}
  .lt-ask{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 14px 0}.lt-ai{display:flex;gap:8px;align-items:center;padding:6px 2px;font-size:13.5px}.lt-qt{display:flex;gap:8px;align-items:center}.lt-q.plan{border:1px solid #e3eaf2;border-radius:10px;padding:10px}
  .lt-fl{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:10px 14px}.lt-ch{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:4px 12px;font:inherit;font-size:12.5px;cursor:pointer}.lt-ch.on{background:#eaf2ff;color:#1e5bb8;border-color:#9ec0f7;font-weight:700}.lt-sel{max-width:190px;min-height:32px;margin-left:auto}
  .lt-c{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 9px;margin:2px 4px 2px 0;background:#fffaeb;color:#b54708}.lt-c.r{background:#fef3f2;color:#b42318}.lt-c.g{background:#ecfdf3;color:#067647}
  .lt-done td{opacity:.6}.lt-ds{display:flex;gap:3px;margin-top:4px}.lt-d{width:8px;height:8px;border-radius:50%;background:#dfe6ef}.lt-d.on{background:#1f9d57}
  #ltSignBtn[disabled]{opacity:.45;cursor:not-allowed}
  @media(max-width:900px){.lt-ts{grid-template-columns:repeat(2,minmax(0,1fr))}.lt-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.lt-tb{display:block;overflow-x:auto}}
  @media(max-width:520px){.lt-strip{grid-template-columns:minmax(0,1fr)}.lt-pf .btn{flex:1 1 auto}}
  /* phones: each Actions row is a card, patient, then the issues, then the buttons (they used to sit off screen to the right) */
  @media(max-width:700px){.lt-cl,.lt-cl tbody,.lt-cl tr,.lt-cl td{display:block;width:100%;box-sizing:border-box}.lt-cl thead{display:none}.lt-cl tr{padding:10px 12px;border-top:1px solid #eef2f8}.lt-cl td{border:0;padding:3px 0;min-width:0!important;text-align:left!important}.lt-cl td[data-l]::before{content:attr(data-l);display:block;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:#667085}.lt-cl td:last-child{display:flex;flex-wrap:wrap;gap:6px;padding-top:8px;white-space:normal!important}.lt-cl td:last-child .btn{flex:1 1 auto;justify-content:center}.lt-act,.lt-act tbody,.lt-act tr,.lt-act td{display:block;width:100%;box-sizing:border-box}.lt-act tr{padding:10px 12px;border-top:1px solid #eef2f8}.lt-act td{border:0;padding:3px 0;min-width:0!important}.lt-act td:last-child{display:flex;flex-wrap:wrap;gap:6px;padding-top:8px}.lt-act td:last-child .btn{flex:1 1 auto;justify-content:center}.lt-act .lt-sec{padding:10px 12px}}`;document.head.appendChild(css);
  const prev=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){return lead()?page():prev.apply(this,arguments);};
})();
