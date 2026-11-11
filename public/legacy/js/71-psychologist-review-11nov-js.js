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
  /* detailed history: the section numbers sit in a strip at the top right, on the row of the Draft / Fill form toolbar; the form takes the full width.
     (the repeated class names raise the specificity above the psychologist's earlier slim-rail rules) */
  body.psg .hrow11{display:flex;align-items:center;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;width:100%}
  body.psg .hrow11 .hist-seg{align-self:center!important;flex:0 1 auto}
  body.psg .hwrap.hwrap.hwrap{grid-template-columns:minmax(0,1fr)!important;column-gap:0!important}
  body.psg .hrow11.hrow11 .hnav{position:relative;top:auto;display:flex!important;flex-direction:row!important;align-items:center;gap:4px;width:auto!important;min-width:0!important;max-width:100%;padding:5px 8px!important;background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:99px;overflow:visible!important;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-left:auto;transition:none}
  body.psg .hrow11.hrow11 .hnav button{width:auto!important;display:inline-flex!important;align-items:center;justify-content:center!important;gap:5px;padding:4px 7px!important;border-radius:99px;position:relative;white-space:nowrap}
  body.psg .hrow11.hrow11 .hnav button>span:not(.hn){display:none!important}
  body.psg .hrow11.hrow11 .hnav button:hover:after,body.psg .hrow11.hrow11 .hnav button:focus-visible:after{content:attr(data-t)!important;display:block!important;position:absolute;left:auto;right:0;top:calc(100% + 10px);transform:none;background:#101828;color:#fff;font-size:12.5px;font-weight:600;padding:6px 11px;border-radius:9px;white-space:nowrap;z-index:60;pointer-events:none;box-shadow:0 8px 20px rgba(16,24,40,.22)}
  /* Rounds: the planning card (assessments, activations, management plan). Same content, calmer layout: two columns, a small icon on each heading,
     violet chips like the rest of the psychologist's Rounds, and the vitals strip wraps instead of overlapping on narrower screens */
  body.pgr .pg-rp{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0}
  body.pgr .pg-rp .pg-rp-b{padding:20px 24px!important;border-top:1px solid var(--line)}
  body.pgr .pg-rp .pg-rp-b:nth-of-type(1){border-right:1px solid var(--line)}
  body.pgr .pg-rp .pg-rp-b:nth-of-type(3){grid-column:1/-1}
  body.pgr .pg-rp h4{display:flex;align-items:center;gap:10px;margin:0 0 4px;font-size:15px;font-weight:700}
  body.pgr .pg-rp h4::before{content:none!important}body.pgr .pg-rp .pg-rp-sub{display:none}
  body.pgr .pg-rp .pg-rp-b:nth-of-type(1) h4::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236941c6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='6' y='4' width='12' height='17' rx='2'/%3E%3Cpath d='M9 4V3h6v1M9 13l2 2 4-4'/%3E%3C/svg%3E")}
  body.pgr .pg-rp .pg-rp-b:nth-of-type(2) h4::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236941c6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-4l-3 9L9 3l-3 9H2'/%3E%3C/svg%3E")}
  body.pgr .pg-rp .pg-rp-b:nth-of-type(3) h4::before{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236941c6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'/%3E%3Cpath d='M14 3v5h5M9 13h6M9 17h4'/%3E%3C/svg%3E")}
  body.pgr .pg-rp .pg-rp-sub{margin:0 0 14px 40px;font-size:12.5px}
  body.pgr .pg-rp select.input{min-height:44px;border-radius:12px;background-color:#fff}
  body.pgr .pg-rp select.input:focus{outline:none;border-color:#7f56d9;box-shadow:0 0 0 4px rgba(127,86,217,.14)}
  body.pgr .pg-rp-chip{background:#f4f0ff;border-color:#d9ccfa;color:#5925dc}
  body.pgr .pg-rp-chip button{background:#e9defc;color:#5925dc}
  body.pgr .pg-rp-chip button:hover{background:#d9ccfa}
  body.pgr .pg-rp-ro{background:#fbfaff;border:1px solid #e4dcf8;border-left:3px solid #7f56d9;border-radius:12px;padding:14px 16px;line-height:1.55}
  body.pgr .pg-asg{margin-top:14px;padding-top:12px;border-top:1px dashed #e4dcf8}
  body.pgr .pg-asg-h{font-size:12px;font-weight:700;color:#6941c6;margin-bottom:6px}
  body.pgr .pg-asg-r{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0}
  body.pgr .pg-asg-r b{display:block;font-size:13.5px}
  body.pgr .pr-vit{flex-wrap:wrap}
  body.pgr .pr-vit .pr-vi{flex:1 1 96px;min-width:96px}
  @media (max-width:900px){body.pgr .pg-rp{grid-template-columns:1fr}body.pgr .pg-rp .pg-rp-b:nth-of-type(1){border-right:0}}
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
  /* inpatients: title on the left, Mine / Whole ward on the right */
  .ipd-h11{display:flex!important;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap}
  .ipd-h11 .pg-mine.pg-seg{margin:0!important;flex:none}
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

  /* ---------- 4. Assessments the doctor assigned in Rounds show on Today, with a Mark done button ---------- */
  const mineAsg=pid=>{let L=[];try{L=(psyPx(pid).assignedAssess||[]);}catch(e){}const me1=signer();return L.map((a,i)=>({a,i})).filter(o=>o.a.status!=='Done'&&(!o.a.to||o.a.to===me1));};
  window.pgAsgDone=function(pid,i){
    const a=((psyPx(pid).assignedAssess)||[])[i];if(!a)return;
    a.status='Done';a.doneBy=signer();a.doneAt=atNow();render();toast(a.name.replace(/ \(.*\)/,'')+' marked done by '+signer());
  };
  const asgToday=v=>{
    v.querySelectorAll('tr[data-dt]').forEach(tr=>{
      if(tr.dataset.asg)return;tr.dataset.asg='1';
      const pid=(tr.innerHTML.match(/#\/patient\/([^/']+)\//)||[])[1];if(!pid)return;
      const L=mineAsg(pid);if(!L.length)return;
      const cell=[...tr.children].find(td=>td.querySelector('.pg-dl')||/Nothing due/.test(td.textContent));
      const items=L.map(o=>`<div class="pg-di"><i class="pg-dd blue" style="background:#3b82f6" aria-hidden="true"></i><div class="pg-dt"><b>Assessment: ${hesc(o.a.name)}</b><span>assigned by ${hesc(o.a.by)}, ${hesc(o.a.at)}</span><button class="btn sm" style="margin-top:6px" onclick="pgAsgDone('${pid}',${o.i})">Mark done</button></div></div>`).join('');
      if(cell){let dl=cell.querySelector('.pg-dl');if(!dl){cell.innerHTML='<div class="pg-dl"></div>';dl=cell.querySelector('.pg-dl');}dl.insertAdjacentHTML('afterbegin',items);}
      const ty=tr.querySelector('.pd-ty');if(ty&&/^(Up to date|Nothing due)$/i.test(ty.textContent.trim())){ty.textContent='Assessment';ty.classList.remove('red','amber');ty.classList.add('blue');ty.removeAttribute('style');}
    });
  };

  /* the colour key on Today, same look as the psychiatrist's (the styles are in the psychiatrist block); the second dot is the psychologist's own */
  const KEY=`<div class="pdk" role="note" aria-label="What the coloured dots mean"><b>Key</b>
    <span><i class="red"></i>Alert <em>· needs you now</em></span>
    <span><i class="blue"></i>Assigned by the doctor <em>· assessments to do</em></span>
    <span><i class="amber"></i>Due or late <em>· overdue notes, reviews, results to check</em></span>
    <span><i class="ok"></i>Action taken</span></div>`;
  const tidy=v=>{
    v.querySelectorAll("#pgRp .pg-rp-b").forEach(x=>{const h4=x.querySelector("h4");if(h4&&/^Management plan/.test(h4.textContent.trim()))x.remove();});
    v.querySelectorAll("h3,h4,.lbl,b,span").forEach(e=>{if(e.children.length===0&&e.textContent.trim()==="Round note")e.textContent="Therapy note";});
    v.querySelectorAll(".subtab").forEach(t=>{const tn=[...t.childNodes].reverse().find(n=>n.nodeType===3&&/Vitals and medicines/.test(n.nodeValue));if(tn)tn.nodeValue=tn.nodeValue.replace("Vitals and medicines","Treatment Plan");});
  };
  const colourKey=v=>{
    const pd=v.querySelector('.pd');if(!pd||pd.querySelector('.pdk'))return;
    const bar=pd.querySelector('.pd-bar');pd.insertAdjacentHTML('beforeend',KEY);
  };

  /* ---------- 5. Nikita, 11 Nov: the patient tabs belong on the inpatient page, not on Today ---------- */
  /* Today shows the psychologist's own patients; the My / Ward / All tab is gone from it */
  const __md71=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    if(!me())return __md71.apply(this,arguments);
    S.pgScope='my';
    const h=__md71.apply(this,arguments);
    return typeof h==='string'?h.replace(/<div class="pg-scope"[\s\S]*?<\/div>/,''):h;
  };
  /* Inpatients: the Mine / Whole ward tab moves up to the right of the page title */
  const ipdTabs=v=>{
    const ipd=v.querySelector('.ipd'),tabs=ipd&&ipd.querySelector('.pg-mine'),head=ipd&&ipd.firstElementChild;
    if(!tabs||!head||head.classList.contains('ipd-h11')||head.contains(tabs))return;
    head.classList.add('ipd-h11');head.appendChild(tabs);
  };

  /* Therapy Plans: Start session gets the same recording-button design as the psychiatrist's "Record with AI scribe" (mic, becomes a waveform on hover; styles are in the psychiatrist block) */
  const MIC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const startBtn=v=>{
    v.querySelectorAll('button.pg-start').forEach(b=>{
      if(b.querySelector('.rc-ic'))return;
      b.className='btn sm th10-rec pg-start';b.removeAttribute('style');b.style.marginRight='10px';
      b.innerHTML=`<span class="rc-ic" aria-hidden="true">${MIC}<span class="rc-bars"><i></i><i></i><i></i><i></i></span></span><span>Start session</span>`;
      b.setAttribute('aria-label','Start session and record with the AI scribe');
    });
    /* Start session sits right next to Add (the header spread them apart) */
    v.querySelectorAll('button.pg-start').forEach(b=>{
      const w=v.querySelector('.th10-act');b.style.marginRight='0';
      if(w&&!w.contains(b))w.insertBefore(b,w.firstChild);
    });
  };

  /* Rounds: Start AI scribe gets the recording-button design; assessments the psychiatrist assigned are listed under Planned assessments */
  const scribeBtn=v=>{
    v.querySelectorAll('button[onclick="listenRound()"]').forEach(b=>{
      if(b.querySelector('.rc-ic')||!/^\s*Start AI scribe\s*$/.test(b.textContent))return;
      b.classList.remove('pri');b.classList.add('th10-rec');
      b.innerHTML=`<span class="rc-ic" aria-hidden="true">${MIC}<span class="rc-bars"><i></i><i></i><i></i><i></i></span></span><span>Start AI scribe</span>`;
    });
  };
  const asgRounds=v=>{
    const box=v.querySelector('#pgRp .pg-rp-b');if(!box||box.querySelector('.pg-asg'))return;
    let pid=null;try{const R=S.rounds,w=(WARDS||{})[R.ward]||[];const p=w[R.idx[R.ward]];pid=p&&p.id;}catch(e){}
    if(!pid)return;
    const L=mineAsg(pid);if(!L.length)return;
    box.insertAdjacentHTML('beforeend',`<div class="pg-asg"><div class="pg-asg-h">Assigned by the psychiatrist</div>${L.map(o=>`<div class="pg-asg-r"><span><b>${hesc(o.a.name)}</b><span class="tiny muted">${hesc(o.a.by)}, ${hesc(o.a.at)}</span></span><button type="button" class="btn sm" onclick="pgAsgDone('${pid}',${o.i})">Mark done</button></div>`).join('')}</div>`);
  };

  /* detailed history: put the section numbers in the toolbar row */
  const histNav=v=>{
    const seg=v.querySelector('.hist-seg'),nav=v.querySelector('.hwrap .hnav');
    if(!seg||!nav||seg.parentElement.classList.contains('hrow11'))return;
    const row=document.createElement('div');row.className='hrow11';
    seg.parentNode.insertBefore(row,seg);row.appendChild(seg);row.appendChild(nav);
  };

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{const v=$('view');if(v){tidy(v);colourKey(v);histNav(v);startBtn(v);scribeBtn(v);asgRounds(v);ipdTabs(v);asgToday(v);therapyTable(v);dnTable(v);if(S.admSec==='formc'&&window.psyFormCTable)psyFormCTable(v);}}catch(e){}}
    return out;
  };
})();
