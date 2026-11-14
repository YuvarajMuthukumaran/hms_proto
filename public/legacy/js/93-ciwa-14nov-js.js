/* 14 Nov 2026, Trello card "Rating scales and early warning" (the last open item): CIWA-Ar, the alcohol withdrawal scale.
   Shown on the line of scores in Treatment Plan (Vitals) and under "Since last round" in Rounds, for patients in alcohol withdrawal or when the doctor has ordered CIWA-Ar.
   The nurse or doctor ticks the ten items; the HMS adds them up (0 to 67) and shows the number and the band, no free text.
   Bands follow the NEWS2 bands so one chain handles both: under 8 routine, 8 to 15 inform the RMO, 16 or more urgent RMO review (raised into the escalation chain).
   The cut-offs are the usual CIWA-Ar ones; Dr. Anu confirms them (marked in the window). Items are stored in psyx.ciwa. */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const ITEMS=[
    ['Nausea and vomiting',7,{0:'none',1:'mild nausea, no vomiting',4:'intermittent nausea with dry heaves',7:'constant nausea, frequent dry heaves and vomiting'}],
    ['Tremor',7,{0:'no tremor',1:'not visible, can be felt fingertip to fingertip',4:'moderate, with arms extended',7:'severe, even with arms not extended'}],
    ['Paroxysmal sweats',7,{0:'no sweat visible',1:'barely perceptible, palms moist',4:'beads of sweat obvious on forehead',7:'drenching sweats'}],
    ['Anxiety',7,{0:'no anxiety, at ease',1:'mildly anxious',4:'moderately anxious, or guarded',7:'equivalent to acute panic states'}],
    ['Agitation',7,{0:'normal activity',1:'somewhat more than normal',4:'moderately fidgety and restless',7:'paces back and forth, or constantly thrashes about'}],
    ['Tactile disturbances',7,{0:'none',1:'very mild itching, pins and needles, burning or numbness',4:'moderately severe hallucinations',7:'continuous hallucinations'}],
    ['Auditory disturbances',7,{0:'not present',1:'very mild harshness or ability to frighten',4:'moderately severe hallucinations',7:'continuous hallucinations'}],
    ['Visual disturbances',7,{0:'not present',1:'very mild sensitivity',4:'moderately severe hallucinations',7:'continuous hallucinations'}],
    ['Headache, fullness in head',7,{0:'not present',1:'very mild',4:'moderately severe',7:'extremely severe'}],
    ['Orientation and clouding of sensorium',4,{0:'oriented, can do serial additions',1:'cannot do serial additions, or unsure of the date',2:'disoriented for date by no more than 2 days',3:'disoriented for date by more than 2 days',4:'disoriented for place and/or person'}]
  ];
  const band=t=>t>=16?'Urgent RMO review':t>=8?'Inform RMO':'Routine';
  const cls=b=>b==='Urgent RMO review'?'red':b==='Inform RMO'?'amber':'';
  const arrow=(a,b)=>a==null||b==null?'':(a>b?' ↑':a<b?' ↓':' →');
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const pt=pid=>{try{return ptFind(pid)||PTS.find(p=>p.id===pid)||{};}catch(e){return {};}};
  /* alcohol withdrawal patients, or the doctor ordered it */
  const applies=pid=>{const x=px(pid),p=pt(pid);return /alcohol/i.test(String(p.dx||''))&&/withdraw/i.test(String(p.dx||''))||(x.scaleOrders||[]).some(o=>o.scale==='CIWA-Ar');};
  window.psyCiwaApplies=applies;

  window.psyCiwaOpen=function(pid){
    const p=pt(pid),rows=ITEMS.map((it,i)=>{
      const opts=[];for(let n=0;n<=it[1];n++)opts.push(`<option value="${n}">${n}${it[2][n]?' · '+esc(it[2][n]):''}</option>`);
      return `<label class="field" style="margin-bottom:8px"><span class="lbl">${i+1}. ${esc(it[0])} <span class="tiny muted">0 to ${it[1]}</span></span><select class="input" id="cw${i}" onchange="psyCiwaSum()">${opts.join('')}</select></label>`;}).join('');
    V3.modal('CIWA-Ar · '+esc(p.name||''),'Alcohol withdrawal. Tick what you see now. The HMS adds it up.',
      `<div style="max-height:52vh;overflow:auto;padding-right:4px">${rows}</div><div class="row" style="justify-content:space-between;margin-top:10px;gap:10px;flex-wrap:wrap"><div><span class="sc-big" id="cwTot">0</span> <span class="sf"><span class="c" id="cwBand">Routine</span></span></div><div class="tiny muted">Under 8 routine · 8 to 15 inform the RMO · 16 or more urgent RMO review. Cut-offs: Dr. Anu to confirm.</div></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyCiwaSave('${pid}')">Save score</button>`);
  };
  window.psyCiwaSum=function(){let t=0;ITEMS.forEach((_,i)=>{t+=+($('cw'+i)||{}).value||0;});const b=band(t),e=$('cwTot'),c=$('cwBand');if(e)e.textContent=t;if(c){c.textContent=b;c.className='c '+cls(b);}return t;};
  window.psyCiwaSave=function(pid){
    const items=ITEMS.map((_,i)=>+($('cw'+i)||{}).value||0),total=items.reduce((a,b)=>a+b,0),b=band(total),x=px(pid);
    x.ciwa=x.ciwa||[];x.ciwa.unshift({at:atNow(),by:signer(),items,total,band:b});
    if(b==='Urgent RMO review'){try{v3().alerts.unshift({id:'n'+(++v3().tlN),pid,sev:'urgent',title:'Alcohol withdrawal score (CIWA-Ar) '+total+': urgent RMO review',detail:'CIWA-Ar '+total+' of 67. Tremor '+items[1]+', sweats '+items[2]+', agitation '+items[4]+', orientation '+items[9]+'.',src:'Vitals',by:signer(),t:V3.now(),ack:null,seen:null,closed:null,esc:[]});}catch(e){}}
    closeModal();render();toast('CIWA-Ar '+total+' · '+b+(b==='Urgent RMO review'?'. Raised to the escalation chain.':''));
  };

  /* the line of scores in Rounds */
  const __line=window.psyScoreLine;
  window.psyScoreLine=function(pid){
    const base=typeof __line==='function'?__line.apply(this,arguments):'',c=(px(pid).ciwa||[])[0];
    if(!c)return base;
    const t='CIWA-Ar '+c.total+arrow(c.total,(px(pid).ciwa[1]||{}).total)+' ('+c.band.toLowerCase()+')';
    return base?base+' · '+t:t;
  };
  /* the strip of scores in Treatment Plan */
  const __strip=window.psyScoreStrip;
  window.psyScoreStrip=function(pid){
    const h=typeof __strip==='function'?__strip.apply(this,arguments):'';
    if(!applies(pid))return h;
    const L=px(pid).ciwa||[],c=L[0];
    const part=`<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap"><span class="lbl">Alcohol withdrawal (CIWA-Ar)</span>${c?`<b class="sc-big" style="font-size:22px">${c.total}${arrow(c.total,(L[1]||{}).total)}</b><span class="sf"><span class="c ${cls(c.band)}">${esc(c.band)}</span></span><span class="tiny muted">${esc(c.at)} · ${esc(c.by)}</span>`:'<span class="small muted">No score yet</span>'}<button class="btn sm" onclick="psyCiwaOpen('${pid}')">Record CIWA-Ar</button></div>`;
    const i=h.lastIndexOf('</div>');
    return i<0?h+part:h.slice(0,i)+part+h.slice(i);
  };
  /* the Scores card in Treatment Plan: a third part for alcohol withdrawal */
  const __card=window.psyScoresCard;
  window.psyScoresCard=function(pid){
    const h=typeof __card==='function'?__card.apply(this,arguments):'';
    if(!applies(pid))return h;
    const L=px(pid).ciwa||[],c=L[0];
    const part=`<div class="pad" style="border-top:1px solid var(--line-2,#eef1f5)"><div class="lbl">Alcohol withdrawal (CIWA-Ar)</div><div class="row" style="gap:10px;align-items:baseline;margin:6px 0 4px;flex-wrap:wrap">${c?`<span class="sc-big">${c.total}${arrow(c.total,(L[1]||{}).total)}</span><span class="sf"><span class="c ${cls(c.band)}">${esc(c.band)}</span></span><span class="small muted">${esc(c.at)} · ${esc(c.by)}</span>`:'<span class="small muted">No score yet</span>'}<button class="btn sm pri" onclick="psyCiwaOpen('${pid}')">Record CIWA-Ar</button></div><div class="tiny muted">Ten items, 0 to 67. Under 8 routine, 8 to 15 inform the RMO, 16 or more urgent RMO review. ${L.length>1?'Earlier: '+L.slice(1,5).map(e=>e.total+' ('+esc(String(e.at).split(',')[0])+')').join(' · '):''}</div></div>`;
    const i=h.lastIndexOf('</section>');
    return i<0?h+part:h.slice(0,i)+part+h.slice(i);
  };
})();
