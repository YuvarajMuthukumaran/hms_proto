/* Psychologist only (10 Nov 2026, team meeting audio, Rounds page). The four psychiatrist boxes (Monitoring, Investigations, Risks and instructions,
   Referral) are gone from the psychologist's Rounds (block 57); in their place, as the team asked:
   1. Therapy plan: one free-text box (therapies, assessment plans and anything new that came up in this round)
   2. Planned assessments: a drop-down (the assessments the psychiatrist allocates in the doctor portal); each pick is listed below
   3. Planned behavioural activations: a drop-down (take a walk, plan an outing, ...); each pick is listed below
   4. Management plan: read only, the psychologist's plan for the stay, with a button to open it
   Also: Dictate (voice to text, words only, no recording) next to the Therapy brief in the daily note.
   Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const L=()=>window.pgMpLists||{MODS:[],ACTS:[]};
  const rp=pid=>{const x=psyPx(pid);return x.roundPlan=x.roundPlan||{therapyPlan:'',assess:[],acts:[]};};
  const curPid=()=>{try{const R=S.rounds,W=WARDS[R.ward],p=W[Math.min(R.idx[R.ward],W.length-1)];return p&&p.id;}catch(e){return null;}};

  const css=document.createElement('style');css.id='psychologist-rounds-css';
  css.textContent=`
  .pg-rp{display:flex;flex-direction:column;gap:0}
  .pg-rp .pg-rp-b{padding:16px 20px;border-top:1px solid var(--line)}
  .pg-rp .pg-rp-b:first-of-type{border-top:0}
  .pg-rp h4{margin:0 0 8px;font-size:15px;font-weight:700}
  .pg-rp .pg-rp-sub{font-size:12.5px;color:var(--muted,#667085);margin:-4px 0 8px}
  .pg-rp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .pg-rp-chip{display:inline-flex;align-items:center;gap:6px;background:#eff8ff;border:1px solid #84caff;color:#175cd3;border-radius:99px;padding:4px 6px 4px 12px;font-size:13.5px;font-weight:600}
  .pg-rp-chip button{border:0;background:#d1e0ff;color:#175cd3;width:20px;height:20px;border-radius:50%;line-height:1;cursor:pointer;font-weight:700}
  .pg-rp-ro{background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:14px;white-space:pre-wrap}
  /* Today > Due today: one line per item, the dot carries the colour of its type */
  .pg-dl{display:flex;flex-direction:column;gap:12px;padding:2px 0}
  .pg-di{display:flex;align-items:flex-start;gap:12px}
  .pg-dd{flex:none;width:9px;height:9px;border-radius:50%;margin-top:6px;background:#98a2b3;box-shadow:0 0 0 3px #f2f4f7}
  .pg-dd.red{background:#e5484d;box-shadow:0 0 0 3px #fee4e2}
  .pg-dd.amber{background:#f5a524;box-shadow:0 0 0 3px #fef0c7}
  .pg-dt{display:flex;flex-direction:column;gap:2px;min-width:0}
  .pg-dt b{font-size:14.5px;font-weight:600;color:#101828;line-height:1.35}
  .pg-dt span{font-size:12.5px;color:#667085}
  .pg-dm{font-size:12.5px;font-weight:600;color:#175cd3;padding-left:21px}
  .pg-dict{display:inline-flex;align-items:center;gap:6px;margin-top:6px;border:1px solid #84caff;background:#eff8ff;color:#175cd3;border-radius:99px;padding:5px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
  .pg-dict.live{background:#175cd3;color:#fff;border-color:#175cd3}
  `;
  document.head.appendChild(css);

  window.pgRpTxt=function(pid,v){rp(pid).therapyPlan=v;};
  window.pgRpAdd=function(pid,k,sel){const v=sel.value;if(!v)return;const a=rp(pid)[k];if(!a.includes(v))a.push(v);render();};
  window.pgRpDel=function(pid,k,i){rp(pid)[k].splice(i,1);render();};

  const chips=(pid,k)=>{const a=rp(pid)[k];return a.length?`<div class="pg-rp-chips">${a.map((x,i)=>`<span class="pg-rp-chip">${hesc(x)}<button type="button" aria-label="Remove ${hesc(x)}" onclick="pgRpDel('${pid}','${k}',${i})">×</button></span>`).join('')}</div>`:'';};
  const pick=(pid,k,list,ph)=>`<select class="input" aria-label="${hesc(ph)}" onchange="pgRpAdd('${pid}','${k}',this)"><option value="">${hesc(ph)}</option>${list.filter(x=>!rp(pid)[k].includes(x)).map(x=>`<option>${hesc(x)}</option>`).join('')}</select>`;
  const card=pid=>{
    const m=(psyPx(pid).mgmtPsych)||{},plan=[m.therapyPlan||m.therapies,m.goals&&('Goals: '+m.goals)].filter(Boolean).join('\n');
    return `<section class="card pg-rp" id="pgRp"><div class="pg-rp-b"><h4>Therapy plan</h4><div class="pg-rp-sub">Free text: therapies, assessment plans and anything new that came up in this round.</div>
      <textarea class="input" rows="4" placeholder="Write the therapy plan" oninput="pgRpTxt('${pid}',this.value)">${hesc(rp(pid).therapyPlan)}</textarea></div>
      <div class="pg-rp-b"><h4>Planned assessments</h4><div class="pg-rp-sub">From the assessments the psychiatrist allocates in the doctor portal.</div>${pick(pid,'assess',L().MODS,'Choose an assessment…')}${chips(pid,'assess')}</div>
      <div class="pg-rp-b"><h4>Planned behavioural activations</h4><div class="pg-rp-sub">Activities planned with the patient.</div>${pick(pid,'acts',L().ACTS,'Choose an activity…')}${chips(pid,'acts')}</div>
      <div class="pg-rp-b"><h4>Management plan</h4><div class="pg-rp-sub">Read only. Your plan for this stay.</div><div class="pg-rp-ro">${plan?hesc(plan):'Not written yet.'}</div>
        <div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" onclick="pgMpModal('${pid}')">${m.signed?'View management plan':'Open management plan'}</button></div></div></section>`;
  };
  /* Rounds: Monitoring, Investigations, Risks and instructions and Referral are not shown to the psychologist (team, 10 Nov).
     Nothing is added in their place. */
  const __vr=vRounds;
  vRounds=function(){
    const h=__vr.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content;
      R.querySelectorAll('section.card').forEach(c=>{
        const t=((c.querySelector('h3,h4,.lbl')||{}).textContent||'').trim();
        if(/^(Monitoring|Investigations|Risks and instructions|Referral)/.test(t))c.remove();
      });
      R.querySelectorAll('.pg-ro').forEach(x=>x.remove()); /* no "Read only" banner */
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* Today table, like the psychiatrist's dashboard: the first column is the Type (one plain word, the most urgent type of what is due),
     the Current psychopathology column is gone; Patient (with the High risk tag) and Ongoing interventions stay. */
  /* The Type is one of the nine alert types the TL gave: Critical, Clinical event, Medication, Investigation, MHCA, Overdue review,
     Admission, Documentation, Family. Each patient's items are worked out from the real record (alerts, events, calls, capacity,
     admission day, notes and plans) and the most urgent type is shown. */
  const RANK=['Critical','Clinical event','Medication','Investigation','MHCA','Overdue review','Admission','Documentation','Family'];
  const COLOR={'Critical':'red','Clinical event':'amber','Medication':'amber','Investigation':'amber','MHCA':'amber','Overdue review':'amber','Admission':'grey','Documentation':'grey','Family':'grey'};
  const dueItems=pid=>{
    const p=ptFind(pid)||{},c=(window.ptCtxOf?ptCtxOf(pid):{})||{},L=[],add=(cat,txt,due)=>L.push({cat,txt,due:due||''});
    try{v3().alerts.filter(a=>a.pid===pid&&!a.closed).forEach(a=>{
      const t=String(a.src||'')+' '+String(a.title||'');
      const cat=a.sev==='critical'?'Critical':/refus|adverse|\bprn\b|\bsos\b|medic/i.test(t)?'Medication':/\blab\b|\becg\b|result/i.test(t)?'Investigation':'Clinical event';
      add(cat,a.title,a.ack?'seen by '+a.ack.by:'new');});}catch(e){}
    (c.events||[]).filter(e=>!e.ack).forEach(e=>{
      const serious=/seizure|self-harm|abscond|chok|emergency/i.test(e.type||'')||/major|serious/i.test(e.sev||'');
      add(serious?'Critical':/adverse drug/i.test(e.type||'')?'Medication':'Clinical event',(e.type||'Event'),e.when||'');});
    if(!c.capacityDone)add('MHCA','Capacity assessment',(c.section==='90'?'fortnightly':'weekly')+' (Section '+(c.section||'89')+')');
    if(p.day<=1)add('Admission','Admission workup and add psychologist','first 24 hours');
    if(c.calls&&c.calls.h24!=='done')add('Admission','24-hour family call','');
    if(c.calls&&c.calls.d34psych==='due')add('Family','Day 3 to 4 family call','');
    try{if(!((S.eod||{})[pid]||{}).saved)add('Documentation','Daily note','today');}catch(e){}
    try{if(c.historyStatus&&c.historyStatus!=='signed')add('Documentation','Detailed history',c.historyStatus==='overdue'?'overdue':'within 72 h');}catch(e){}
    try{if(!((psyPx(pid).mgmtPsych)||{}).signed)add('Documentation','Management plan',p.day>7?'overdue':'this week');}catch(e){}
    return L.sort((a,b)=>RANK.indexOf(a.cat)-RANK.indexOf(b.cat));
  };
  window.pgDueItems=dueItems;
  const dueCell=L=>{
    if(!L.length)return '<span class="tiny muted">Nothing due</span>';
    const shown=L.slice(0,3);
    return `<div class="pg-dl">${shown.map(i=>`<div class="pg-di"><i class="pg-dd ${COLOR[i.cat]}" aria-hidden="true"></i><div class="pg-dt"><b>${hesc(i.txt)}</b>${i.due?`<span>${hesc(i.due)}</span>`:''}</div></div>`).join('')}${L.length>3?`<div class="pg-dm">+${L.length-3} more</div>`:''}</div>`;
  };
  const __md=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    const h=__md.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content,tbl=R.querySelector('table.pd-t');if(!tbl||tbl.dataset.pgType)return h;
      tbl.dataset.pgType='1';
      const ths=[...tbl.querySelectorAll('thead th')],pi=ths.findIndex(t=>/Current psychopathology/i.test(t.textContent));
      if(pi<0)return h;
      ths[pi].remove();ths[0].insertAdjacentHTML('beforebegin','<th>Type</th>');
      tbl.querySelectorAll('tbody tr[data-dt]').forEach(tr=>{
        const tds=[...tr.children];
        if(tds[pi])tds[pi].remove();
        const pid=(tr.innerHTML.match(/#\/patient\/([^/']+)\//)||[])[1],p=pid&&ptFind(pid),L=pid?dueItems(pid):[];
        const top=L[0];
        tr.insertAdjacentHTML('afterbegin',top?`<td><span class="pd-ty ${COLOR[top.cat]==='grey'?'':COLOR[top.cat]}">${hesc(top.cat)}</span></td>`:'<td><span class="pd-ty" style="font-weight:500;color:#98a2b3">Up to date</span></td>');
        /* Due today lists every item with its type */
        const cells=[...tr.children];if(cells[3])cells[3].innerHTML=dueCell(L);
        tr.classList.remove('r-red','r-amber','r-blue');
        if(top&&COLOR[top.cat]!=='grey')tr.classList.add(COLOR[top.cat]==='red'?'r-red':'r-amber');
        const nm=tr.querySelector('.pd-nm');
        if(p&&p.risk&&nm&&!nm.querySelector('.pd-tag'))nm.insertAdjacentHTML('beforeend','<span class="pd-tag amber">High risk</span>');
      });
      const none=tbl.querySelector('#dtNone td');if(none)none.colSpan=5;
      const cg=tbl.querySelector('colgroup');if(cg)cg.innerHTML='<col style="width:150px"><col style="width:270px"><col><col style="width:28%"><col style="width:210px">';
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* Dictate next to the Therapy brief (words only; nothing is recorded or stored) */
  let rec=null;
  const stop=()=>{try{if(rec){rec.onend=null;rec.stop();}}catch(e){}rec=null;document.querySelectorAll('.pg-dict.live').forEach(b=>{b.classList.remove('live');b.textContent='Dictate';});};
  window.pgDictate=function(id,btn){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition,ta=$(id);
    if(!SR||!ta){toast('This browser cannot listen. Type the brief instead.');return;}
    if(rec){stop();return;}
    rec=new SR();rec.continuous=true;rec.interimResults=false;rec.lang='en-IN';
    rec.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal){ta.value+=(ta.value&&!/\s$/.test(ta.value)?' ':'')+e.results[i][0].transcript.trim();ta.dispatchEvent(new Event('input',{bubbles:true}));}}};
    rec.onerror=()=>{toast('Could not listen. Check the microphone permission.');stop();};
    rec.onend=()=>{if(rec&&document.body.contains(ta)){try{rec.start();}catch(e){}}else stop();};
    try{rec.start();btn.classList.add('live');btn.textContent='Stop dictating';}catch(e){rec=null;}
  };
  const bits=v=>{
    v.querySelectorAll('textarea[id^="pnT-brief"]').forEach(ta=>{
      if(ta.dataset.pgD)return;ta.dataset.pgD='1';
      ta.insertAdjacentHTML('afterend',`<button type="button" class="pg-dict" onclick="pgDictate('${ta.id}',this)" aria-label="Dictate the therapy brief">Dictate</button>`);
    });
  };
  window.pgDictBits=bits;
  const __rp=psyRepaint;
  psyRepaint=function(){const r=__rp.apply(this,arguments);if(me()){try{bits(document);}catch(e){}}return r;};
  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{const v=$('view');if(v){bits(v);
      /* Admission > step 1 (Admission forms): no Form C row for the psychologist; Form C has its own step 5 */
      v.querySelectorAll('tr[data-formc]').forEach(r=>r.remove());
      /* Review Form C opens the form in the patient (same as the other forms), not the removed documents page */
      v.querySelectorAll('button[onclick^="cdSelect("]').forEach(b=>{const m=(b.getAttribute('onclick')||'').match(/cdSelect\('([^']+)'\)/);if(m)b.setAttribute('onclick',"psyDocOpen('"+m[1]+"')");});}}catch(e){}}
    return out;
  };
})();
