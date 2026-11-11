/* Psychologist only (11 Nov 2026, team review with Anu: recording and Granola notes).
   1. Therapy Plans, Start session: Save session opens a second pop-up with the details filled in (date, minutes from the recording time,
      modality, session summary drafted from the start of the transcript, plan for the next session). "Progress note" is now "Session summary".
      The table gets a Session transcript column after Next session plan: a view-only window with Print (no download).
   2. Daily notes: "WhatsApp updates to families" and "Written earlier today" are one table (patient, note written and when, sent to family
      done or not done, WhatsApp buttons). The family message is longer and written for people who are not clinicians.
   3. Admission, Detailed history: every question numbered Q1, Q2 ..., tighter spacing.
   Gated by S.role==='psychologist'. The psychiatrist's screens are not touched. */
(function(){
  const me=()=>S.role==='psychologist';
  const px=()=>psyPx(S.pid);
  const fmtToday=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});

  const css=document.createElement('style');css.id='psychologist-review-11nov-css';
  css.textContent=`
  /* detailed history: numbered questions, tighter */
  body.psg .hwrap .hgrid,body.psg .hwrap .hgrid:has(.hf-sel){counter-reset:hq;gap:18px 32px!important;padding:24px 32px 28px!important}
  body.psg .hwrap .hgrid>.hf{counter-increment:hq;min-width:0}
  body.psg .hwrap .hgrid>.hf>.lbl:first-child{display:flex;align-items:baseline;gap:8px;margin-bottom:6px!important}
  body.psg .hwrap .hgrid>.hf>.lbl:first-child::before{content:"Q" counter(hq);flex:0 0 auto;font-size:11px;font-weight:800;color:#6941c6;background:#f4f0ff;border:1px solid #e0d4fb;border-radius:6px;padding:0 6px;line-height:18px}
  body.psg .hwrap .hgrid select.input,body.psg .hwrap .hgrid input.input{min-height:42px!important}
  body.psg .hwrap .hgrid textarea.input{min-height:84px!important}
  body.psg .hwrap .hbody>.row:first-child{padding:22px 32px 0!important}
  /* daily notes table */
  .dn11{padding:0 16px 16px}
  .dn11 table{width:100%;border-collapse:collapse;font-size:13.5px;min-width:720px}
  .dn11 th{text-align:left;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#667085;padding:8px 12px;border-bottom:1px solid var(--line-2,#eaecf0)}
  .dn11 td{padding:12px;border-bottom:1px solid var(--line-2,#eaecf0);vertical-align:middle}
  .dn11 .nm{font-weight:700}.dn11 .tiny{display:block;margin-top:2px}
  .dn11 .st{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;border:1px solid transparent}
  .dn11 .st.ok{background:#ecfdf3;color:#067647;border-color:#abefc6}.dn11 .st.no{background:#fffaeb;color:#b54708;border-color:#fedf89}
  .dn11 .st.bad{background:#fef3f2;color:#b42318;border-color:#fecdca}
  .dn11 .acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
  /* therapy: transcript column */
  .tx11-pre{white-space:pre-wrap;max-height:55vh;overflow:auto;font-size:14.5px;line-height:1.55}
  `;
  document.head.appendChild(css);

  /* ---------- 1. Start session: record, then a details pop-up ---------- */
  const MOD=['CBT','Supportive therapy','Motivational interviewing','Relaxation training','Psychoeducation','Behavioural activation','Other'];
  let t0=0,secs=0,txt='';
  const __open=window.pgSession;
  window.pgSession=function(){secs=0;t0=0;txt='';return __open.apply(this,arguments);};
  const __tog=window.pgSessionToggle;
  window.pgSessionToggle=function(){
    const b=$('pgRecB');
    if(b){if(/^Stop/.test(b.textContent.trim()))secs+=Math.round((Date.now()-t0)/1000);else t0=Date.now();}
    return __tog.apply(this,arguments);
  };
  window.pgSessionSave=function(){
    const t=((($('pgTx')||{}).value)||'').trim();
    if(!t){toast('The transcript is empty');return;}
    const b=$('pgRecB');if(b&&/^Stop/.test(b.textContent.trim()))secs+=Math.round((Date.now()-t0)/1000);
    txt=t;pgSessionClose();pgSessionDetails();
  };
  const ptOf=id=>{let p=null;try{p=ptFind(id);}catch(e){}if(!p){try{p=allPts().find(x=>x.id===id);}catch(e){}}return p||{name:''};};
  const draftSummary=t=>{const s=String(t).replace(/\s+/g,' ').trim();const parts=s.split(/(?<=[.?!])\s+/).slice(0,3).join(' ');return parts.length>420?parts.slice(0,417)+'...':parts;};
  window.pgSessionDetails=function(){
    const mins=secs>0?Math.max(1,Math.round(secs/60)):'';
    const p=ptOf(S.pid);
    V3.modal('Session details · '+hesc(p.name),'Filled in from the session. Check it, add what is missing, then save.',
      `<div class="grid2"><label class="field"><span class="lbl">Date</span><input class="input" value="${hesc(fmtToday())}" disabled></label>
       <label class="field"><span class="lbl">Duration (minutes)</span><input class="input" type="number" min="1" id="pgSdMin" value="${mins}" placeholder="e.g. 45"></label></div>
       <label class="field"><span class="lbl">Modality</span><select class="input" id="pgSdMod">${MOD.map(m=>`<option ${m==='CBT'?'selected':''}>${m}</option>`).join('')}</select></label>
       <label class="field"><span class="lbl">Session summary</span><textarea class="input" rows="4" id="pgSdSum">${hesc(draftSummary(txt))}</textarea><span class="tiny muted">Started from the beginning of the transcript. Edit it.</span></label>
       <label class="field"><span class="lbl">Plan for the next session</span><textarea class="input" rows="3" id="pgSdPlan" placeholder="What to work on next time"></textarea></label>
       <div class="tiny muted">The transcript is kept with this session and can be viewed and printed from the table. No voice is stored.</div>
       <div id="pgSdE" class="small" style="color:var(--red);display:none">Write the duration and the session summary</div>`,
      `<button class="btn" onclick="pgSessionBack()">Back</button><button class="btn pri" onclick="pgSessionFinish()">Save session</button>`);
  };
  window.pgSessionBack=function(){const keep=txt;pgSession();const ta=$('pgTx');if(ta)ta.value=keep;};
  window.pgSessionFinish=function(){
    const m=+($('pgSdMin')||{}).value,sum=((($('pgSdSum')||{}).value)||'').trim(),plan=((($('pgSdPlan')||{}).value)||'').trim(),mod=($('pgSdMod')||{}).value||'CBT';
    if(!(m>=1)||!sum){const e=$('pgSdE');if(e)e.style.display='block';return;}
    try{psyTherapyPage();}catch(e){}
    const x=px();if(!x.th||!x.th.ind){toast('Could not save here. Open the patient first.');return;}
    x.th.ind.unshift({date:fmtToday(),by:signer(),modality:mod,mins:String(m),note:sum,plan,transcript:txt,txAt:atNow()});
    closeModal();render();toast('Session saved by '+signer());
  };
  const indRows=()=>((px().th||{}).ind)||[];
  window.pgTx11=function(i){
    const r=indRows()[i];if(!r||!r.transcript)return;
    V3.modal('Session transcript · '+hesc(r.date),hesc([r.by,r.modality,r.mins?r.mins+' minutes':''].filter(Boolean).join(' · ')),`<div class="tx11-pre">${hesc(r.transcript)}</div><div class="tiny muted" style="margin-top:10px">View only. You can print it, but it is not saved on your computer.</div>`,`<button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="pgTx11Print(${i})">Print</button>`,'min(760px,100%)');
  };
  window.pgTx11Print=function(i){
    const r=indRows()[i];if(!r)return;const p=ptOf(S.pid);
    psyPdf('Session transcript · '+r.date,`<h2>Session transcript</h2><div>${hesc(r.date)} · ${hesc(r.by||'')} · ${hesc(r.modality||'')}${r.mins?' · '+hesc(r.mins)+' minutes':''}</div><h2>Session summary</h2><div>${hesc(r.note||'')}</div>${r.plan?`<h2>Plan for the next session</h2><div>${hesc(r.plan)}</div>`:''}<h2>Transcript</h2><div style="white-space:pre-wrap">${hesc(r.transcript)}</div>`,p);
  };
  /* the Add form for an individual session also says Session summary */
  const __add=window.psyThAdd;
  if(typeof __add==='function')window.psyThAdd=function(k){
    const r=__add.apply(this,arguments);
    if(me()){try{document.querySelectorAll('#modal .lbl').forEach(l=>{if(/^Progress note$/.test(l.textContent.trim()))l.textContent='Session summary';});}catch(e){}}
    return r;
  };
  function therapyTable(v){
    const card=v.querySelector('.th9-tabs')&&v.querySelector('.th9-tabs').closest('section');if(!card)return;
    const tb=card.querySelector('table');if(!tb||tb.dataset.t11)return;
    const heads=[...tb.querySelectorAll('thead th')];if(!heads.length||!/^Progress note$/.test((heads[4]||{}).textContent||''))return;
    tb.dataset.t11='1';
    heads[4].textContent='Session summary';
    heads[heads.length-1].insertAdjacentHTML('afterend','<th>Session transcript</th>');
    [...tb.querySelectorAll('tbody tr')].forEach((tr,i)=>{
      if(tr.children.length<6){const c=tr.querySelector('td[colspan]');if(c)c.colSpan=7;return;}
      const r=indRows()[i];
      tr.insertAdjacentHTML('beforeend',`<td>${r&&r.transcript?`<button class="btn sm" onclick="pgTx11(${i})">View transcript</button>`:'<span class="muted">—</span>'}</td>`);
    });
    const old=v.querySelector('#pgTxCard');if(old)old.remove();
  }

  /* ---------- 2. Daily notes: one table, and a message the family can follow ---------- */
  const SLEEP={'Over 7 h':'Slept well through the night, more than 7 hours.','6 to 7 h':'Slept well, about 6 to 7 hours.','4 to 6 h':'Slept a little less than usual, about 4 to 6 hours.','Under 4 h':'Had a restless night and slept less than 4 hours.','Disturbed':'Had a restless night with broken sleep.'};
  const MEALS={'All meals':'Ate all the meals today.','Partial':'Ate part of the meals today.','Skipped one or more':'Ate a little less than usual today.','Refused food':'Needed some encouragement with meals today.'};
  const PART={'Active':'Took part actively in the activities.','Attended, quiet':'Joined the activities quietly.','Refused':'Rested today and skipped the activities.'};
  const consOf=pid=>{let c=null;try{c=(S.famCons||{})[pid];}catch(e){}return c;};
  const __wt=waDText;
  waDText=function(kind,id){
    if(!me())return __wt.apply(this,arguments);
    const e=(S.waEdit||{})[kind+':'+id];if(e!=null)return e;
    const p=allPts().find(x=>x.id===id)||{name:'',uhid:'',day:''},first=String(p.name||'').split(' ')[0]||'the patient';
    const g=k=>psyGet(kind,id,k),L=[];
    const s=SLEEP[g('sleep')],m=MEALS[g('meals')],a=PART[g('part')],ss=[].concat(g('sessions')||[]).filter(Boolean),f=[].concat(g('fam')||[]).filter(x=>x&&x!=='None today');
    if(s)L.push('• Sleep: '+s);
    if(m)L.push('• Meals: '+m);
    if(a)L.push('• Activities: '+a);
    if(ss.length)L.push('• Therapy and sessions: Took part in '+ss.join(', ').toLowerCase()+' today.');
    if(f.length)L.push('• Family contact: There was '+f.join(' and ').toLowerCase()+' with the family today.');
    const b=String(g('brief')||'').trim()||(kind==='dn'&&typeof famUpdate==='function'?famUpdate():'');
    const out=['*TULASI HEALTHCARE: DAILY UPDATE FOR THE FAMILY*','',`Dear family of *${first}*,`,'',`This is a short update on how ${first} was today, ${waDate()}.`,`Patient: ${p.name} · UHID ${p.uhid}${p.day!==''?' · Day '+p.day+' of the stay':''}`,''];
    if(L.length){out.push('*How the day went*',...L,'');}
    if(b)out.push('*A note from the care team*',b,'');
    out.push('If you have any question, please speak to the care team when you call or visit. We are glad to explain anything in simple words.','',`With care,`,waWho('Psychologist'),'Tulasi Healthcare','');
    out.push(WA_CONF[0],WA_CONF[1]);
    return out.join('\n');
  };
  const dnTable=v=>{
    const strip=v.querySelector('#waStrip');if(!strip||strip.dataset.dn11)return;
    strip.dataset.dn11='1';
    const written={};
    strip.querySelectorAll('.pg-wsep ~ .li').forEach(li=>{
      const g=li.querySelector('.grow');if(!g||!g.children[0])return;
      const name=g.children[0].textContent.trim(),info=(g.children[1]||{}).textContent||'';
      const parts=info.split(' · ');written[name]={type:parts[0]||'Note',time:parts[1]||'',sum:parts.slice(2).join(' · ')};
    });
    const all=PSY_EOD(),err=S.waErr||{};
    const today=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'});
    let nW=0,nS=0;
    const rows=all.map(p=>{
      const e=(S.eod||{})[p.id]||{},w=written[p.name],sent=waD()['eod:'+p.id],er=err['eod:'+p.id],any=psyHasAny('eod',p.id);
      const isW=!!(e.saved||w);if(isW)nW++;if(sent)nS++;
      const wCell=isW?`<span class="st ok">✓ Written</span><span class="tiny muted">${hesc(today)}${e.saved&&e.savedAt?', '+hesc(e.savedAt):w&&w.time?', '+hesc(w.time):''}${!e.saved&&w?' · '+hesc(w.type):''}</span>`:`<span class="st no">Not written</span><span class="tiny"><button class="btn sm" style="margin-top:6px" onclick="pgNoteModal('${p.id}')">Write note</button></span>`;
      const sCell=sent?`<span class="st ok">Done</span><span class="tiny muted">${hesc(sent.at)} · ${hesc(sent.by)}</span>`:er?`<span class="st bad">Not sent</span><span class="tiny muted">${hesc(er)}</span>`:`<span class="st no">Not done</span>${any?'':'<span class="tiny muted">Nothing filled in yet</span>'}`;
      return `<tr><td><span class="nm">${hesc(p.name)}</span><span class="tiny muted">${hesc(p.room)} · UHID ${hesc(p.uhid)}</span></td><td>${wCell}</td><td>${sCell}</td>
        <td><div class="acts">${any?`<button class="btn sm" onclick="pgWaPreview('eod','${p.id}',false)">See message</button>`:''}<button class="btn sm pri" ${sent?'disabled':''} onclick="psySaveSend('eod','${p.id}',this)">${sent?'✓ Sent':'Send on WhatsApp'}</button></div></td></tr>`;
    }).join('');
    strip.innerHTML=`<div class="hd"><div><h3>Daily notes and family updates</h3><div class="small muted" style="margin-top:4px">${nW} of ${all.length} daily notes written · ${nS} of ${all.length} sent to the family. A note counts if it was written here or in rounds.</div></div></div>
      <div class="dn11" style="overflow-x:auto"><table><thead><tr><th>Patient</th><th>Daily note written</th><th>Sent to family</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  };

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{const v=$('view');if(v){therapyTable(v);dnTable(v);}}catch(e){}}
    return out;
  };
})();
