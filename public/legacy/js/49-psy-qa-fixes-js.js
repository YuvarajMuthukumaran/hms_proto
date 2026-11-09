
/* Psychiatrist only (9 Nov 2026). Fixes from the QA pass on the Trello board (Nikita and the team lead).
   1. Daily notes page (#/notes): same rule as the patient tab. Save and next (and Ctrl + S) wait until every question is answered;
      "Side effects: Yes" and any event other than None need their details written. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const arr=v=>Array.isArray(v)?v:(v?[v]:[]);

  /* ---------- 1. Daily notes page: no empty notes ---------- */
  const REQ=[['overallBeh','Behaviour'],['mood','Mood'],['cons','Consciousness'],['med','Adherence'],['seYN','Side effects'],['inc','Event today']];
  function eodMiss(id){
    const e=(S.eod||{})[id]||{},m=[];
    REQ.forEach(([k,l])=>{if(!arr(e[k]).length)m.push([k,l]);});
    if(e.seYN==='Yes'&&!(e.seText||'').trim())m.push(['seText','Side effects']);
    if(arr(e.inc).some(x=>x!=='None')&&!(e.line||'').trim())m.push(['line','Event details']);
    return m;
  }
  const eodMsg=m=>{
    if(!m.length)return '';
    const q=m.filter(x=>x[0]!=='seText'&&x[0]!=='line').length;
    if(q)return 'Answer the remaining '+q+' question'+(q>1?'s':'')+' to save';
    return m[0][0]==='seText'?'Describe the side effects to save':'Write the event details to save';
  };
  function eodJump(key){
    const box=document.querySelector('.efields');if(!box)return;
    let el=null;
    if(key==='seText')el=[...box.querySelectorAll('textarea')].find(t=>/Describe the side effects/.test(t.placeholder));
    else if(key==='line')el=[...box.querySelectorAll('textarea')].find(t=>/\.line=/.test(t.getAttribute('oninput')||''));
    else{const lab=(REQ.find(r=>r[0]===key)||[])[1];el=[...box.querySelectorAll('.ef')].find(f=>((f.querySelector('.lbl')||{}).textContent||'').trim()===lab);}
    const row=el&&(el.closest('.ef')||el);if(!row)return;
    row.scrollIntoView({behavior:'smooth',block:'center'});
    row.style.transition='box-shadow .2s';row.style.boxShadow='0 0 0 3px var(--amber-line,#f5d9a8)';row.style.borderRadius='8px';
    setTimeout(()=>{row.style.boxShadow='';},1800);
    if(el.tagName==='TEXTAREA')el.focus({preventScroll:true});
  }
  const eodBar=id=>{
    const m=eodMiss(id),n=REQ.length-m.filter(x=>x[0]!=='seText'&&x[0]!=='line').length;
    const why=m.length?`<span class="small muted" style="margin-right:10px">${hesc(eodMsg(m))}</span>`:'';
    const draft=n>0&&n<REQ.length?`<span class="tiny muted" style="margin-right:10px">Draft · ${n} of ${REQ.length} answered</span>`:'';
    return `<span class="tiny muted" style="margin-right:auto"><span class="kbd">Ctrl</span> + <span class="kbd">S</span> to save</span>${draft}${why}<button class="btn sm pri" ${m.length?'aria-disabled="true" style="opacity:.55"':''} onclick="psyEodSave('${id}')">Save and next</button>`;
  };
  window.psyEodSave=function(id){
    const m=eodMiss(id);
    if(m.length){toast(eodMsg(m)+'. Nothing was saved.');eodJump(m[0][0]);return;}
    const p=(typeof ptFind==='function'?ptFind(id):null)||PTS.find(x=>x.id===id)||{name:'this patient'};
    S.eod[id].saved=true;
    try{psyNoteToProfile(id);}catch(e){}
    S.eodI=0;render();toast('Daily note saved for '+p.name);
  };
  /* ---------- 2. "Due for this patient" is built from the open patient's own stay (it showed Neel's list for everyone) ---------- */
  const __di=dueItems;
  dueItems=function(){
    const base=__di.apply(this,arguments);
    if(!psy()||S.pid==='neel')return base;
    const p=ptFind(S.pid);if(!p)return base;
    const id=ptIdentity(p),day=+p.day||0,c=S.calls||{};
    const add=n=>{const d=new Date(id.adm);d.setDate(d.getDate()+n);return ptD(d);};
    const out=[];
    if(S.historyStatus!=='signed'){const late=day-3;out.push(['Detailed history',late>0?late+' day'+(late>1?'s':'')+' late':late===0?'today':'due '+add(3),late>0,'admission']);}
    if(!S.dailySaved)out.push(['Daily note','today',false,'daily']);
    if(c.h24!=='done')out.push(['24-hour family call',day>=1?'today':'by '+add(1),day>=2,'therapy']);
    else if(c.d34psy==='due'&&day>=3)out.push(['Day 3 to 4 family call','today',false,'therapy']);
    if(!S.capacityDone)out.push(['Capacity assessment',add(7),false,'forms']);
    if(!S.reassessDone)out.push(['Re-assessment',add(7),false,'forms']);
    return out;
  };

  const __eod=eodNotes;
  eodNotes=function(){
    const h=__eod.apply(this,arguments);if(!psy())return h;
    return h.replace(/<button class="btn sm pri" onclick="S\.eod\['([^']+)'\][^"]*">Save and next<\/button>/,(all,id)=>{window.__eodCur=id;return eodBar(id);});
  };
  /* the details boxes do not redraw the page, so keep the message and the button in step as the doctor types */
  document.addEventListener('input',e=>{
    if(!psy()||!window.__eodCur||!e.target||!e.target.classList||!e.target.classList.contains('eline'))return;
    const a=document.querySelector('.estage .eact');if(a)a.innerHTML=eodBar(window.__eodCur);
  });
  document.addEventListener('keydown',e=>{
    if(!psy()||!(e.ctrlKey||e.metaKey)||String(e.key).toLowerCase()!=='s'||!/^#\/notes/.test(location.hash||'')||!window.__eodCur)return;
    if(!document.querySelector('.estage .eact'))return;
    e.preventDefault();psyEodSave(window.__eodCur);
  },true);

  /* ---------- 5. Safety header: allergy status and observation level are back (team reversed the 5 Nov "no chips" review) ----------
     Allergies: red for a drug allergy (as before), grey "No known drug allergies" once ticked, amber "Allergies not recorded" until filled
     (tap it to record). Observation level: the level, who set it and when, and when the next review is due (at least once a day). */
  const today=()=>new Date().toDateString();
  const shortAt=s=>String(s||'').replace(/\s20\d\d,/,',');
  const __sf=window.psySafety;
  window.psySafety=function(pid){
    const h=__sf.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    const c=ptCtxOf(pid),x=psyPx(pid),al=x.allergy;let front='';
    if(!(al&&al.list&&al.list.length)){
      front=al&&al.ndka
        ?`<span class="c" title="Recorded by ${hesc(al.by)}, ${hesc(al.at)}">No known drug allergies</span>`
        :`<button type="button" class="c amber" title="Nothing recorded yet. Tap to record the allergies" onclick="psyAllergy('${pid}')">Allergies not recorded</button>`;
    }
    const lvl=c.obs||(EX[pid]||[])[0]||'Routine',by=c.obsBy||{},rv=x.obsRev,done=rv&&rv.date===today();
    const tail=done?'reviewed '+hesc(rv.time)+' by '+hesc(rv.by)+' · next review by tomorrow':'review by today 6:00 pm';
    const cls=!done&&lvl!=='Routine'?'amber':'';
    const obs=`<span class="c ${cls}" title="Observation level is reviewed at least once a day">Observation: ${hesc(lvl)}${by.by?' · set by '+hesc(by.by)+(by.at?', '+hesc(shortAt(by.at)):''):''} · ${tail}</span>`;
    return h.replace('<div class="sf" aria-label="Patient safety">','<div class="sf" aria-label="Patient safety">'+front)
            .replace('<button class="c" style="border:1px dashed',obs+'<button class="c" style="border:1px dashed');
  };

  /* ---------- 6. Scores ("bring back scores, but in the right place") ----------
     Not a block of their own: the early warning score is worked out from the latest vitals and shown as one line in Vitals (Treatment Plan)
     and under "Since last round" in Rounds, with a trend arrow. The suicide / self-harm screen is one button on the same line.
     Still waiting on Anu: which withdrawal scale (CIWA) and which scales the doctor can order, like monitoring. */
  const vitToNews=r=>{const bp=String(r[1]||'').split('/');return psyNewsCalc({rr:16,spo2:+r[4]||98,o2:false,sbp:+bp[0]||120,pulse:+r[2]||80,cons:'Alert',temp:r[3]?Math.round((+r[3]-32)*5/9*10)/10:36.8});};
  const arrow=(a,b)=>a==null||b==null?'':(a>b?' ↑':a<b?' ↓':' →');
  window.psyAutoNews=function(pid){
    /* Neel's own vitals are the table's built-in readings (his record keeps no S.vit), the same ones the Vitals table shows */
    const own=ptCtxOf(pid).vit,DEF=[['21 Oct','128/82','92','98.6','98','—','5'],['22 Oct','126/80','90','98.4','99','71.8','4'],['23 Oct','124/80','88','98.6','98','—','6.5']];
    const L=(own&&own.length?own:(pid==='neel'?DEF:[])).filter(r=>r&&r[1]);if(!L.length)return null;
    const cur=vitToNews(L[L.length-1]),prev=L.length>1?vitToNews(L[L.length-2]):null;
    return {total:cur.total,band:cur.band,prev:prev?prev.total:null,date:L[L.length-1][0]};
  };
  window.psyScoreLine=function(pid){
    const a=psyAutoNews(pid),s=(psyPx(pid).suicide||[])[0],out=[];
    if(a)out.push('NEWS2 '+a.total+arrow(a.total,a.prev)+' ('+a.band.toLowerCase()+')');
    if(s)out.push('Suicide screen: '+s.level.toLowerCase());
    return out.join(' · ');
  };
  window.psyScoreStrip=function(pid){
    const a=psyAutoNews(pid),x=psyPx(pid),s=(x.suicide||[])[0],p=ptFind(pid)||{};
    const lv=x.riskLevel||(p.risk?'High':'Low'),due=(lv==='High'||p.risk)&&!(s&&s.date===today());
    const cls=!a?'':a.band==='Urgent RMO review'?'red':a.band==='Inform RMO'?'amber':'';
    return `<div class="pad row" style="gap:12px 28px;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--line-2)">
      <div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap"><span class="lbl">Early warning score</span>${a?`<b class="sc-big" style="font-size:22px">${a.total}${arrow(a.total,a.prev)}</b><span class="sf"><span class="c ${cls}">${hesc(a.band)}</span></span><span class="tiny muted">from the latest vitals (${hesc(a.date)})</span>`:'<span class="small muted">No vitals yet</span>'}</div>
      <div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap"><span class="lbl">Suicide / self-harm screen</span><b>${s?hesc(s.level):'Not screened'}</b>${s?`<span class="tiny muted">${hesc(s.at)} · ${hesc(s.by)}</span>`:''}${due?'<span class="sf"><span class="c amber">Daily screen due today</span></span>':''}<button class="btn sm" onclick="psySuiOpen('${pid}')">Do screen</button></div></div>`;
  };
  /* ---------- From the 6 Nov team recording (audited 9 Nov) ---------- */
  /* "I don't like the dose to be written differently": name and dose in the same plain text, no pill. */
  const css2=document.createElement('style');css2.id='psy-recording-fixes-css';
  css2.textContent='body.psy-views .mdose{display:inline;background:none;border:0;border-radius:0;padding:0;margin-left:4px;box-shadow:none;font-size:inherit;font-weight:inherit;letter-spacing:0;color:inherit;vertical-align:baseline}';
  document.head.appendChild(css2);
  /* "write it from 18 to ongoing instead of this date": an active medicine has no end date (owner, 5 Nov). Medicine rows and the Treatment Plan list. */
  function toOngoing(){
    document.querySelectorAll('#view .medrow, #view .psy-tx-panel table td').forEach(root=>{
      const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
      while((n=w.nextNode())){
        const t=n.nodeValue;
        if(/^\s*\d{1,2} \w{3} to \d{1,2} \w{3}\s*$/.test(t))n.nodeValue=t.replace(/(\d{1,2} \w{3}) to \d{1,2} \w{3}/,'$1 to ongoing');
      }
    });
  }
  const __r49=render;
  render=function(){const o=__r49.apply(this,arguments);if(psy()){try{toOngoing();}catch(e){}}return o;};

  /* "tests are to be one big dropdown": Order lab tests is one dropdown that fills a list, with an "All routine investigations" choice
     (what the team sends at admission: CBC, LFT, KFT, lipid profile, HbA1c, fasting sugar, TSH, ECG). */
  const LAB_ALL=['CBC','LFT','KFT','TFT','Lipid profile','HbA1c','Fasting glucose','Serum lithium','Valproate level','Serum electrolytes','Urine drug screen','ECG'];
  const LAB_ROUTINE=['CBC','LFT','KFT','Lipid profile','HbA1c','Fasting glucose','TFT','ECG'];
  const __lab=labModal;
  labModal=function(){
    if(!psy())return __lab.apply(this,arguments);
    window.__labSel=[];
    openModal(`<div class="mh"><h3>Order lab tests</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
     <div class="mb"><label class="field"><span class="lbl">Test</span><select class="input" id="labPick" onchange="psyLabPick(this)"><option value="">Choose a test…</option><option value="__routine">All routine investigations (${LAB_ROUTINE.join(', ')})</option>${LAB_ALL.map(t=>`<option>${hesc(t)}</option>`).join('')}</select></label>
     <div class="row" id="labChosen" style="gap:6px;flex-wrap:wrap;margin:2px 0 10px"><span class="small muted">Nothing chosen yet</span></div>
     <label class="field"><span class="lbl">When</span><select class="input" id="labw"><option>Tomorrow, 7:00 (fasting)</option><option>Today</option><option>Weekly, Mondays</option></select></label>
     <div class="callout grey">Results come back through the live lab upload and file into Records automatically.</div></div>
     <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyLabOrder()">Order</button></div>`);
  };
  window.psyLabPick=function(sel){
    const v=sel.value;sel.value='';if(!v)return;
    (v==='__routine'?LAB_ROUTINE:[v]).forEach(t=>{if(!window.__labSel.includes(t))window.__labSel.push(t);});
    psyLabDraw();
  };
  function psyLabDraw(){
    const box=$('labChosen');if(!box)return;
    box.innerHTML=window.__labSel.length?window.__labSel.map((t,i)=>`<span class="chip c-blue" style="gap:6px">${hesc(t)} <button type="button" aria-label="Remove ${hesc(t)}" style="border:0;background:none;cursor:pointer;font:inherit;color:inherit;padding:0" onclick="__labSel.splice(${i},1);psyLabDraw()">×</button></span>`).join(''):'<span class="small muted">Nothing chosen yet</span>';
  }
  window.psyLabDraw=psyLabDraw;
  window.psyLabOrder=function(){
    const t=window.__labSel||[];if(!t.length){toast('Pick at least one test');return;}
    const w=$('labw').value;t.forEach(x=>S.labs.push(Object.assign({t:x,d:w,st:'Ordered'},whoAt())));
    closeModal();render();toast(t.length+' test'+(t.length>1?'s':'')+' ordered by '+signer());
  };

  /* ---------- Rounds "Since last round": count-up of the readings (the entrance itself is CSS, see 25 and 48) ----------
     Runs only on a strip marked .enter, i.e. the first time a patient's strip is shown. It follows the shared start time, so a redraw
     during the animation carries on instead of restarting. */
  window.psyVitCount=function(){
    const V=window.__prVit;if(!V)return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    document.querySelectorAll('.pr-vit.enter b[data-n]').forEach((el,idx)=>{
      const t=el.dataset.n,parts=t.split('/'),nums=parts.map(Number),dec=parts.map(x=>(x.split('.')[1]||'').length),node=el.firstChild;
      if(!node||node.nodeType!==3||nums.some(n=>!isFinite(n)))return;
      const tail=node.nodeValue.slice(t.length),D=700,start=120+idx*70;
      const step=()=>{
        if(!el.isConnected)return;
        const k=Math.min(1,Math.max(0,(Date.now()-V.t0-start)/D)),e=1-Math.pow(1-k,3);
        node.nodeValue=(k>=1?t:parts.map((x,i)=>(nums[i]*e).toFixed(dec[i])).join('/'))+tail;
        if(k<1)setTimeout(step,24);
      };
      step();
      /* whatever happens to the timer (a hidden tab slows it), the real value is always shown at the end */
      setTimeout(()=>{if(el.isConnected)node.nodeValue=t+tail;},start+D+150);
    });
  };

  window.psySuiOpen=function(pid){
    const Q=window.psySuiQ||[];
    V3.modal('Suicide / self-harm screen · '+hesc(V3.pn(pid)),'At admission, daily for high-risk patients, and at each re-assessment. The result sets Risk of harm in the header.',
      Q.map((q,i)=>`<div class="sc-q"><span>${i+1}. ${hesc(q)}</span><select class="input" id="sq${i}" style="width:auto;min-height:30px;padding:3px 8px"><option>No</option><option>Yes</option></select></div>`).join(''),
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psySuiSave('${pid}');closeModal()">Save screen</button>`);
  };
})();
