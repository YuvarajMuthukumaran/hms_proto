/* 12 Nov 2026, Trello card 107: Results safety rules (clozapine, lithium, ECG, metabolic, critical values). Build now; Dr. Anu confirms the thresholds and schedules.
   Every threshold and interval is in window.TULASI_RULES.results (one place). Prototype: demo data, real clocks.
   - Starting clozapine or lithium (or any antipsychotic) creates the test schedule by itself: it shows on the psychiatrist's Treatment Plan and its overdue tests on Today.
   - Enter a result there: the rules colour it and act. Low ANC or WBC on clozapine: red band, "hold clozapine" suggestion, the psychiatrist is alerted, and clozapine doses are
     blocked on the nursing chart until the psychiatrist records a decision (PIN). A missed blood test blocks the next supply the same way.
   - High lithium level or toxicity signs (tremor, vomiting, confusion): the RMO and psychiatrist are alerted. QTc over 450 ms on an antipsychotic warns the psychiatrist.
   - ECG is suggested when adding a high-risk medicine or IM haloperidol. Any critical value goes to the RMO at once and must be acknowledged in time or it goes to the floor lead. */
(function(){
  const R=window.TULASI_RULES=window.TULASI_RULES||{};
  R.results={
    clozapine:{ancRed:1.5,ancAmber:2.0,wbcRed:3.5,weeklyForWeeks:18,laterEveryDays:28,weeklyEveryDays:7},
    lithium:{levelHigh:1.2,firstLevelDays:6,levelEveryDays:90,kidneyThyroidEveryDays:180,toxicity:['Tremor','Vomiting','Confusion']},
    ecg:{qtcWarn:450,suggestBefore:['clozapine','haloperidol','chlorpromazine','quetiapine','amisulpride']},
    metabolic:{atDays:[0,42,90],tests:['Weight','Sugar','Lipids']},
    critical:{'Potassium':{lo:3.0,hi:6.0,unit:'mmol/L'},'Sodium':{lo:125,hi:155,unit:'mmol/L'},'Glucose':{lo:3.0,hi:25,unit:'mmol/L'},'Haemoglobin':{lo:7,hi:null,unit:'g/dL'},'Platelets':{lo:50,hi:null,unit:'x10^9/L'}},
    ackMinutes:30
  };
  const RR=R.results,DAY=86400000;
  const px=pid=>psyPx(pid);
  const rs=pid=>{
    const x=px(pid);
    if(!x.rs){
      x.rs={results:[],hold:null,acks:[]};
      /* medicines already running when the rules start: their starting tests are taken as done at the start date, so only what is really due shows */
      const mk=(test,ts)=>x.rs.results.push({test,value:null,ts,at:'Before the rules started',by:'Admission',band:'green',msg:'Recorded earlier',seeded:true});
      meds(pid).forEach(m=>{
        const b=lc(m.name),old=m.start<now()-7*DAY;if(!old)return;
        if(b.startsWith('lithium')){mk('Lithium level',m.start+6*DAY);mk('Kidney tests (RFT)',m.start);mk('Thyroid (TSH)',m.start);}
        if(isAP(b)){['Weight','Sugar','Lipids'].forEach(t=>mk(t,m.start));}
        if(b.startsWith('clozapine'))mk('ANC',now()-3*DAY);
      });
    }
    return x.rs;
  };
  const pt=pid=>PTS.find(p=>p.id===pid)||{id:pid,name:pid};
  const now=()=>Date.now();
  const doc=()=>S.role==='psychiatrist'&&!/psycholog|patient-experience/.test(String((window.__TULASI__||{}).role||''));
  const lc=s=>String(s||'').toLowerCase();
  const fmtD=ts=>new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  const alertTo=(pid,title,detail,src,sev)=>{try{V3.alert({pid,sev:sev||'urgent',title,detail,src:src||'Results',by:'System'});return v3().alerts[0];}catch(e){return null;}};

  /* ---- start date of a medicine ---- */
  const startOf=m=>{
    if(m.startISO)return new Date(m.startISO+'T09:00:00').getTime();
    const g=String(m.range||'').match(/^(\d{1,2})\s+([A-Za-z]{3})/);
    if(g){const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(g[2]);if(mo>=0)return new Date(2026,mo,+g[1],9).getTime();}
    return now()-7*DAY;
  };
  const medsOf=pid=>{try{return ptRun(pid,()=>JSON.stringify((S.meds||[]).filter(m=>!/waiting|stopped/i.test(m.name)).map(m=>({name:m.name,start:startOf(m),route:m.route||''}))));}catch(e){return '[]';}};
  const meds=pid=>{let a=[];try{a=JSON.parse(medsOf(pid));}catch(e){}return a;};
  const isAP=n=>['quetiapine','olanzapine','risperidone','aripiprazole','clozapine','haloperidol','chlorpromazine','amisulpride','paliperidone','lurasidone'].some(x=>lc(n).startsWith(x));
  const last=(pid,test)=>rs(pid).results.filter(r=>r.test===test).sort((a,b)=>b.ts-a.ts)[0];

  /* ---- the automatic schedule ---- */
  function schedule(pid){
    const out=[],M=meds(pid);
    const add=(test,why,due,done)=>out.push({test,why,due,done:!!done,state:done?'done':due<now()?'overdue':due<now()+2*DAY?'soon':'later'});
    M.forEach(m=>{
      const b=lc(m.name);
      if(b.startsWith('clozapine')){
        const c=RR.clozapine,r=last(pid,'ANC'),weeks=Math.floor((now()-m.start)/(7*DAY));
        const every=weeks<c.weeklyForWeeks?c.weeklyEveryDays:c.laterEveryDays;
        const base=r?r.ts:m.start;add('Blood count (WBC, ANC)','Clozapine, every '+every+' days',base+every*DAY,false);
      }
      if(b.startsWith('lithium')){
        const l=RR.lithium,r=last(pid,'Lithium level');
        add('Serum lithium level',r?'Lithium, every '+l.levelEveryDays+' days':'Lithium, '+l.firstLevelDays+' days after the start',r?r.ts+l.levelEveryDays*DAY:m.start+l.firstLevelDays*DAY,false);
        ['Kidney tests (RFT)','Thyroid (TSH)'].forEach(t=>{const rr=last(pid,t);add(t,'Lithium, every '+l.kidneyThyroidEveryDays+' days',rr?rr.ts+l.kidneyThyroidEveryDays*DAY:m.start,false);});
      }
      if(isAP(b)){
        RR.metabolic.tests.forEach(t=>{const rr=rs(pid).results.filter(x=>x.test===t);let shown=false;RR.metabolic.atDays.forEach((d,i)=>{const due=m.start+d*DAY;const done=rr.some(x=>x.ts>=due-3*DAY&&x.ts<=due+10*DAY)||rr.length>i;if(!done&&!shown){shown=true;add(t,['At the start','At 6 weeks','At 3 months'][i]+' · '+m.name.replace(/\s+\d.*$/,''),due,false);}});});
      }
    });
    /* only the next open item per test and reason */
    const seen={};return out.filter(x=>{const k=x.test+'|'+x.why;if(seen[k]&&!x.done)return false;seen[k]=1;return !x.done;}).sort((a,b)=>a.due-b.due);
  }
  window.rsSchedule=schedule;

  /* ---- evaluate a result ---- */
  function band(test,v){
    if(test==='ANC'){const c=RR.clozapine;return v<c.ancRed?['red','Below '+c.ancRed+': hold clozapine and call the psychiatrist']:v<c.ancAmber?['amber','Between '+c.ancRed+' and '+c.ancAmber+': repeat soon']:['green','In range'];}
    if(test==='WBC'){return v<RR.clozapine.wbcRed?['red','Below '+RR.clozapine.wbcRed+': hold clozapine and call the psychiatrist']:['green','In range'];}
    if(test==='Lithium level'){return v>RR.lithium.levelHigh?['red','Above '+RR.lithium.levelHigh+' mmol/L: possible toxicity']:v<0.4?['amber','Low']:['green','In range'];}
    if(test==='QTc'){return v>RR.ecg.qtcWarn?['red','Over '+RR.ecg.qtcWarn+' ms']:['green','In range'];}
    const c=RR.critical[test];if(c){if(v<c.lo)return ['red','Critical low (below '+c.lo+' '+c.unit+')'];if(c.hi!==null&&v>c.hi)return ['red','Critical high (above '+c.hi+' '+c.unit+')'];return ['green','In range'];}
    return ['green','Recorded'];
  }
  window.rsBand=band;
  window.rsRecord=function(pid,test,value,signs){
    const v=parseFloat(value);if(!isFinite(v))return null;
    const [col,msg]=band(test,v),R0=rs(pid),p=pt(pid);
    const r={test,value:v,ts:now(),at:atNow(),by:signer(),band:col,msg,signs:signs||[]};
    R0.results.push(r);
    const onClz=meds(pid).some(m=>lc(m.name).startsWith('clozapine')),onAP=meds(pid).some(m=>isAP(m.name));
    if((test==='ANC'||test==='WBC')&&col==='red'&&onClz){R0.hold={reason:test+' '+v,at:atNow(),ts:now(),decision:''};alertTo(pid,'Low '+test+' on clozapine · '+p.name,test+' '+v+'. Suggest holding clozapine. Evening dose is blocked until you decide.','Results');}
    if(test==='Lithium level'&&col==='red'){alertTo(pid,'High lithium level · '+p.name,'Level '+v+' mmol/L. RMO and psychiatrist to review.','RMO');}
    if(signs&&signs.length){alertTo(pid,'Possible lithium toxicity · '+p.name,'Signs: '+signs.join(', ')+'. RMO and psychiatrist to review now.','RMO');}
    if(test==='QTc'&&col==='red'&&onAP)alertTo(pid,'QTc '+v+' ms on an antipsychotic · '+p.name,'Over '+RR.ecg.qtcWarn+' ms. Psychiatrist to review the medicines.','Psychiatrist');
    if(RR.critical[test]&&col==='red'){
      const a=alertTo(pid,'Critical '+test+' '+v+' · '+p.name,msg+'. Sent to the RMO now. Acknowledge within '+RR.ackMinutes+' minutes.','RMO','critical');
      if(a)R0.acks.push({id:a.id,pid,due:now()+RR.ackMinutes*60000,esc:false,title:test+' '+v});
    }
    return r;
  };
  setInterval(()=>{try{PTS.forEach(p=>rs(p.id).acks.forEach(k=>{if(k.esc||k.due>now())return;const a=v3().alerts.find(x=>x.id===k.id);if(a&&!a.ack&&!a.closed){k.esc=true;alertTo(k.pid,'Not acknowledged: '+k.title+' · '+pt(k.pid).name,'The critical value was not acknowledged in '+RR.ackMinutes+' minutes. Floor lead informed.','Floor lead');}}));}catch(e){}},30000);

  /* ---- hold decision and blocked doses ---- */
  window.rsDecide=function(pid){
    V3.modal('Clozapine decision · '+hesc(pt(pid).name),hesc(rs(pid).hold.reason)+'. Choose before the next dose.',
      `<div class="radios">${['Hold clozapine','Continue, repeat the count in 48 hours','Stop clozapine'].map(t=>`<button type="button" class="tog" onclick="this.parentNode.querySelectorAll('.tog').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${t}</button>`).join('')}</div><div id="rdE" class="small" style="color:var(--red);display:none;margin-top:8px">Choose one</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rsDecideSave('${pid}')">Record with PIN</button>`);
  };
  window.rsDecideSave=function(pid){
    const on=document.querySelector('#modal .radios .tog.on');if(!on){$('rdE').style.display='block';return;}
    const d=on.textContent.trim();
    pinSign('Clozapine decision · '+pt(pid).name,[['Decision',d],['Because',rs(pid).hold.reason]],()=>{const h=rs(pid).hold;h.decision=d;h.by=signer();h.decidedAt=atNow();render();toast('Recorded: '+d+'. Doses are open again.');});
  };
  const clozBlock=pid=>{
    const R0=rs(pid);
    if(R0.hold&&!R0.hold.decision)return 'Blocked: low '+R0.hold.reason+'. The psychiatrist must record a decision first.';
    const s=schedule(pid).find(x=>x.test.indexOf('Blood count')===0&&x.state==='overdue');
    if(s)return 'Blocked: the blood count is overdue (due '+fmtD(s.due)+'). Do the test before the next supply.';
    return '';
  };
  const __mt=marTap;
  marTap=function(mi,k){
    try{
      const pid=S.pid||'neel',act=(S.meds||[]).filter(m=>!String(m.name).includes('waiting')),m=act[mi];
      if(m&&lc(m.name).startsWith('clozapine')){const b=clozBlock(pid);if(b){toast(b);return;}}
    }catch(e){}
    return __mt.apply(this,arguments);
  };

  /* ---- ECG suggestion in Add medicine ---- */
  if(typeof window.psyRxCheck==='function'){
    const __rc=window.psyRxCheck;
    window.psyRxCheck=function(){
      const r=__rc.apply(this,arguments);
      try{
        const name=lc(($('rxM')||{}).value),route=($('rxR')||{}).value||'',box=$('rxSafe');
        if(box&&name&&!box.querySelector('.rx-ecg')){
          const hi=RR.ecg.suggestBefore.some(x=>name.startsWith(x)),im=name.startsWith('haloperidol')&&/IM/.test(route);
          if(hi||im)box.insertAdjacentHTML('beforeend','<div class="rx-w2 rx-ecg"><div>ECG suggested before '+(im?'IM haloperidol':'this medicine')+': check the QTc (warn above '+RR.ecg.qtcWarn+' ms).</div></div>');
        }
      }catch(e){}
      return r;
    };
  }

  /* ---- panel on Treatment Plan ---- */
  window.rsEnter=function(pid){
    const tests=['ANC','WBC','Lithium level','QTc','Weight','Sugar','Lipids'].concat(Object.keys(RR.critical));
    V3.modal('Enter a result · '+hesc(pt(pid).name),'The rules check it as soon as you save.',
      `<div class="grid2"><label class="field"><span class="lbl">Test</span><select class="input" id="rsT" onchange="document.getElementById('rsSigns').style.display=this.value==='Lithium level'?'':'none'">${tests.map(t=>`<option>${t}</option>`).join('')}</select></label>
       <label class="field"><span class="lbl">Value</span><input class="input" id="rsV" type="number" step="any" placeholder="e.g. 1.4"></label></div>
       <div id="rsSigns" style="display:none"><span class="lbl">Signs seen (nurse)</span><div class="radios">${RR.lithium.toxicity.map(t=>`<button type="button" class="tog" onclick="this.classList.toggle('on')">${t}</button>`).join('')}</div></div>
       <div id="rsE" class="small" style="color:var(--red);display:none;margin-top:6px">Enter the value</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="rsSave('${pid}')">Save the result</button>`);
  };
  window.rsSave=function(pid){
    const t=$('rsT').value,v=$('rsV').value;if(!String(v).trim()){$('rsE').style.display='block';return;}
    const signs=[...document.querySelectorAll('#rsSigns .tog.on')].map(b=>b.textContent.trim());
    const r=rsRecord(pid,t,v,t==='Lithium level'?signs:[]);closeModal();render();toast(t+' '+v+': '+(r?r.msg:'recorded'));
  };
  function panel(){
    const v=$('view');if(!v||!doc()||v.querySelector('#rsPanel'))return;
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)\/orders/);if(!m)return;
    const pid=decodeURIComponent(m[1]),sch=schedule(pid),R0=rs(pid);
    const res=R0.results.filter(r=>!r.seeded).sort((a,b)=>b.ts-a.ts).slice(0,6);
    const col={red:'#fee4e2;color:#b42318',amber:'#fff3d6;color:#9a5b00',green:'#ecfdf3;color:#067647'};
    const sec=document.createElement('section');sec.className='card';sec.id='rsPanel';
    sec.innerHTML=`<div class="hd"><div><h3>Safety tests (automatic)</h3><div class="small muted" style="margin-top:4px">Made by themselves from the medicines this patient is on. Nobody has to order them.</div></div><button class="btn sm" onclick="rsEnter('${pid}')">Enter a result</button></div>
      <div class="pad" style="display:flex;flex-direction:column;gap:10px">
      ${R0.hold&&!R0.hold.decision?`<div class="rx-block"><b>Clozapine is on hold: ${hesc(R0.hold.reason)}</b>Doses are blocked on the nursing chart until you decide. <button class="btn sm pri" onclick="rsDecide('${pid}')">Record the decision</button></div>`:''}
      ${sch.length?sch.map(s=>`<div class="row small" style="justify-content:space-between;gap:10px"><span><b>${hesc(s.test)}</b> <span class="tiny muted">· ${hesc(s.why)}</span></span><span class="chip ${s.state==='overdue'?'c-red':s.state==='soon'?'c-amber':'c-grey'}">${s.state==='overdue'?'Overdue since '+fmtD(s.due):'Due '+fmtD(s.due)}</span></div>`).join(''):'<div class="small muted">No safety tests are needed for the current medicines.</div>'}
      ${res.length?`<div class="lbl">Latest results</div>${res.map(r=>`<div class="row small" style="justify-content:space-between;gap:10px"><span>${hesc(r.test)} <b>${r.value}</b> <span class="tiny muted">· ${hesc(r.at)} · ${hesc(r.by)}</span></span><span style="border-radius:99px;padding:2px 10px;font-weight:700;background:${col[r.band]}">${hesc(r.msg)}</span></div>`).join('')}`:''}
      <details><summary class="small muted" style="cursor:pointer">Thresholds in use (one settings table, easy to change)</summary><div class="tiny muted" style="margin-top:6px;line-height:1.6">Clozapine: ANC under ${RR.clozapine.ancRed} red, under ${RR.clozapine.ancAmber} amber; WBC under ${RR.clozapine.wbcRed}; counts every ${RR.clozapine.weeklyEveryDays} days for ${RR.clozapine.weeklyForWeeks} weeks, then every ${RR.clozapine.laterEveryDays} days. Lithium: level above ${RR.lithium.levelHigh}; first level ${RR.lithium.firstLevelDays} days after the start, then every ${RR.lithium.levelEveryDays} days. QTc above ${RR.ecg.qtcWarn} ms. Metabolic checks at day ${RR.metabolic.atDays.join(', ')}. Critical values acknowledged within ${RR.ackMinutes} minutes.</div></details></div>`;
    const first=v.querySelector('section.card');first?first.parentNode.insertBefore(sec,first):v.appendChild(sec);
  }

  /* ---- overdue tests on Today ---- */
  const __tasks81=tasks;
  tasks=function(){
    const r=__tasks81.apply(this,arguments);
    if(Array.isArray(r)&&(doc()||S.role==='lead')){
      PTS.forEach(p=>{
        schedule(p.id).filter(s=>s.state==='overdue').slice(0,2).forEach(s=>r.push({id:'rs_'+p.id+'_'+s.test,late:true,title:s.test+' overdue · '+p.name,meta:s.why,due:'Since '+fmtD(s.due),go:'#/patient/'+p.id+'/orders',lead:true}));
        const h=rs(p.id).hold;if(h&&!h.decision)r.push({id:'rs_hold_'+p.id,late:true,title:'Decide about clozapine · '+p.name,meta:h.reason,due:'Now',go:'#/patient/'+p.id+'/orders',lead:true});
      });
    }
    return r;
  };

  const __r81=render;
  render=function(){const r=__r81.apply(this,arguments);try{panel();}catch(e){}return r;};
})();
