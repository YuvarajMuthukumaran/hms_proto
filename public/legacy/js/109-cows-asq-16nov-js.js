/* 16 Nov 2026, Trello "bring back scores": Dr. Anu confirmed the scales.
   - ASQ (Ask Suicide-Screening Questions) for every patient; if any of the first 4 answers is yes, the C-SSRS screen follows.
   - COWS for opioid withdrawal (11 items, standard scoring; bands 5-12 mild, 13-24 moderate, 25-36 moderately severe, 37+ severe).
   - NEWS2 is not a routine scale for psychiatric inpatients (Dr. Anu): it stays available but is not pushed.
   Scores only; the HMS adds them up. Same storage as CIWA-Ar (patient psyx). */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const pt=id=>({name:(()=>{try{return V3.pn(id);}catch(e){return '';}})()});
  const COWS=[
    ['Resting pulse rate (beats a minute)',[[0,'80 or below'],[1,'81 to 100'],[2,'101 to 120'],[4,'Above 120']]],
    ['Sweating (not from room heat or exercise)',[[0,'No chills or flushing'],[1,'Chills or flushed face'],[2,'Flushed, moist face'],[3,'Beads of sweat on brow or face'],[4,'Sweat streaming']]],
    ['Restlessness',[[0,'Sits still'],[1,'Says it is hard to sit still'],[3,'Frequently shifting'],[5,'Cannot sit still']]],
    ['Pupil size',[[0,'Pinned or normal for the light'],[1,'Possibly larger than normal'],[2,'Moderately dilated'],[5,'So dilated only the rim of the iris shows']]],
    ['Bone or joint aches',[[0,'Not present'],[1,'Mild diffuse discomfort'],[2,'Severe diffuse aching'],[4,'Rubbing joints, cannot sit still because of pain']]],
    ['Runny nose or tearing',[[0,'Not present'],[1,'Stuffy nose or moist eyes'],[2,'Nose running or tearing'],[4,'Constantly wiping nose or eyes']]],
    ['Stomach upset',[[0,'None'],[1,'Stomach cramps'],[2,'Nausea or loose stool'],[3,'Vomiting or diarrhoea'],[5,'Several episodes']]],
    ['Tremor of the outstretched hands',[[0,'None'],[1,'Felt but not seen'],[2,'Slight tremor seen'],[4,'Gross tremor or muscle twitching']]],
    ['Yawning',[[0,'None'],[1,'Once or twice'],[2,'Three or more times'],[4,'Several times a minute']]],
    ['Anxiety or irritability',[[0,'None'],[1,'Says irritability is increasing'],[2,'Obviously irritable'],[4,'So irritable that taking part is difficult']]],
    ['Gooseflesh',[[0,'Smooth skin'],[3,'Felt, hairs standing up on arms'],[5,'Prominent']]]
  ];
  const band=t=>t>=37?'Severe':t>=25?'Moderately severe':t>=13?'Moderate':t>=5?'Mild':'None or minimal';
  const ac=b=>b==='Severe'||b==='Moderately severe'?'Urgent RMO review':b==='Moderate'?'Inform the RMO':'Routine';
  window.psyCowsOpen=function(pid){
    const p=pt(pid),rows=COWS.map((it,i)=>`<label class="field" style="margin-bottom:8px"><span class="lbl">${i+1}. ${esc(it[0])}</span><select class="input" id="co${i}" onchange="psyCowsSum()">${it[1].map(o=>`<option value="${o[0]}">${o[0]} · ${esc(o[1])}</option>`).join('')}</select></label>`).join('');
    V3.modal('COWS · '+esc(p.name||''),'Opioid withdrawal. Pick what you see now. The HMS adds it up.',
      `<div style="max-height:52vh;overflow:auto;padding-right:4px">${rows}</div><div class="row" style="justify-content:space-between;margin-top:10px;gap:10px;flex-wrap:wrap"><div><span class="sc-big" id="coTot">0</span> <span class="sf"><span class="c" id="coBand">None or minimal</span></span></div><div class="tiny muted">5 to 12 mild · 13 to 24 moderate (inform the RMO) · 25 or more urgent RMO review.</div></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyCowsSave('${pid}')">Save score</button>`);
  };
  window.psyCowsSum=function(){let t=0;COWS.forEach((_,i)=>{t+=+($('co'+i)||{}).value||0;});const b=band(t),e=$('coTot'),c=$('coBand');if(e)e.textContent=t;if(c)c.textContent=b;return t;};
  window.psyCowsSave=function(pid){
    const items=COWS.map((_,i)=>+($('co'+i)||{}).value||0),total=items.reduce((a,b)=>a+b,0),b=band(total),a=ac(b),x=px(pid);
    x.cows=x.cows||[];x.cows.unshift({at:atNow(),by:signer(),items,total,band:b});
    if(a==='Urgent RMO review'){try{v3().alerts.unshift({id:'n'+(++v3().tlN),pid,sev:'urgent',title:'Opioid withdrawal score (COWS) '+total+': urgent RMO review',detail:'COWS '+total+' of 48 ('+b.toLowerCase()+').',src:'Vitals',by:signer(),t:V3.now(),ack:null,seen:null,closed:null,esc:[]});}catch(e){}}
    closeModal();render();toast('COWS '+total+' · '+b+(a==='Routine'?'':'. '+a+'.'));
  };
  const ASQ=['In the past few weeks, have you wished you were dead?','In the past few weeks, have you felt that you or your family would be better off if you were dead?','In the past week, have you been having thoughts about killing yourself?','Have you ever tried to kill yourself?'];
  window.psyAsqOpen=function(pid){
    const p=pt(pid),yn=(k)=>`<div class="radios" id="aq${k}"><button class="tog" onclick="psyAsqPick(${k},1)">Yes</button><button class="tog" onclick="psyAsqPick(${k},0)">No</button></div>`;
    V3.modal('ASQ suicide screen · '+esc(p.name||''),'Ask every patient at admission. Any yes in 1 to 4 means a positive screen, then the C-SSRS.',
      ASQ.map((q,i)=>`<div class="field"><span class="lbl">${i+1}. ${esc(q)}</span>${yn(i)}</div>`).join('')+
      `<div class="field" id="aq4w" style="display:none"><span class="lbl">5. Are you having thoughts of killing yourself right now?</span>${yn(4)}</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyAsqSave('${pid}')">Save screen</button>`);
    window.__asq=[null,null,null,null,null];
  };
  window.psyAsqPick=function(k,v){window.__asq[k]=v;const g=$('aq'+k);if(g)[...g.children].forEach((b,i)=>b.classList.toggle('on',(i===0&&v===1)||(i===1&&v===0)));
    const pos=window.__asq.slice(0,4).some(a=>a===1),w=$('aq4w');if(w)w.style.display=pos?'':'none';};
  window.psyAsqSave=function(pid){
    const a=window.__asq||[];if(a.slice(0,4).some(v=>v===null)){toast('Answer questions 1 to 4');return;}
    const pos=a.slice(0,4).some(v=>v===1);if(pos&&a[4]===null){toast('Answer question 5');return;}
    const res=!pos?'Negative':a[4]===1?'Positive, acute: immediate safety check':'Positive, not acute';
    const x=px(pid);x.asq=x.asq||[];x.asq.unshift({at:atNow(),by:signer(),a:a.slice(),result:res});
    closeModal();render();
    if(pos){toast('ASQ '+res.toLowerCase()+'. Do the C-SSRS screen next.');setTimeout(()=>{if(typeof psySuiOpen==='function')psySuiOpen(pid);},500);}
    else toast('ASQ negative. Recorded.');
  };
  /* make the existing scale ordering and the nurse's board use the new forms */
  const __open=window.scBoardOpen;
  window.scBoardOpen=function(pid,scale){
    if(scale==='COWS')return psyCowsOpen(pid);
    if(scale==='ASQ screen')return psyAsqOpen(pid);
    return typeof __open==='function'?__open.apply(this,arguments):undefined;
  };
})();
