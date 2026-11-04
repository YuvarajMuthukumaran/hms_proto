
/* Psychiatrist only (5 Nov 2026): Inpatient dashboard, simplified after the team review (two transcripts, owner's notes).
   - no page header, no "8 patients, 3 need you" line, no Start here card; Start rounds and New admission stay as two buttons
   - one row per patient, three things only: 1) type of alert  2) patient name  3) an eye button that opens that patient's details
   - only patients with something to act on are listed (alert, approval, late item, result to check, summary to sign);
     the routine "Today" items, the Room column and the Checked column are gone
   - every row is its own card with a gap between rows and a coloured left edge (red alert, amber late or result, blue approval),
     so one patient never runs into the next
   - the eye opens a window with that patient's items, each with its action button (I've seen this, Check and approve, Do it now),
     and buttons to open the patient's Rounds page or full record
   Design follows the doctor portal (rounded cards, soft borders, small pills). */
(function(){
  const css=document.createElement('style');css.id='psy-dash-css';
  css.textContent=`
  .pd{display:flex;flex-direction:column;gap:14px}
  .pd-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .pd-t{table-layout:fixed;width:100%;border-collapse:separate;border-spacing:0 10px;margin-top:-6px}
  .pd-t th{color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-align:left;padding:0 16px 2px}
  .pd-t td{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 16px;vertical-align:middle}
  /* status accent: a slim pill bar floating inside the card with a soft glow (no thick curved border) */
  .pd-t td:first-child{position:relative;padding-left:34px;border-left:1px solid var(--line);border-top-left-radius:16px;border-bottom-left-radius:16px}
  .pd-t td:last-child{border-right:1px solid var(--line);border-top-right-radius:16px;border-bottom-right-radius:16px;text-align:right}
  .pd-t td:first-child::before{content:'';position:absolute;left:13px;top:16px;bottom:16px;width:5px;border-radius:99px;background:var(--pc,#d0d5dd);box-shadow:0 0 0 3px var(--pg,transparent)}
  .pd-t tr{box-shadow:0 1px 2px rgba(16,24,40,.04)}
  .pd-t tr.r-red{--pc:#e5484d;--pg:rgba(229,72,77,.16)}.pd-t tr.r-red td{background:#fffbfb}
  .pd-t tr.r-amber{--pc:#f5a524;--pg:rgba(245,165,36,.18)}
  .pd-t tr.r-blue{--pc:#3b82f6;--pg:rgba(59,130,246,.16)}
  .pd-t tbody tr:hover td{background:#f8fbff}.pd-t tr.r-red:hover td{background:#fff6f6}
  .pd-t tr.r-done{--pc:#12b76a;--pg:rgba(18,183,106,.16)}
  .pd-who{display:flex;align-items:center;gap:12px;border:0;background:none;padding:0;font:inherit;text-align:left;cursor:pointer;color:var(--ink)}
  .pd-who b{font-size:15px;font-weight:700}.pd-who:hover b{color:var(--blue)}
  .pd-chips{display:flex;gap:6px;flex-wrap:wrap}
  .pd-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;border-radius:99px;padding:4px 11px 4px 9px;background:#f2f4f7;color:#475467;white-space:nowrap;border:1px solid rgba(16,24,40,.06)}
  .pd-chip::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}
  .pd-chip.red{background:#fef3f2;color:#b42318;border-color:#fecdca}.pd-chip.amber{background:#fffaeb;color:#b54708;border-color:#fedf89}.pd-chip.blue{background:#eff8ff;color:#175cd3;border-color:#b2ddff}
  .pd-eye{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink-2);cursor:pointer}
  .pd-eye:hover{border-color:var(--blue);color:var(--blue)}
  .pd-acts{display:inline-flex;align-items:center;gap:8px;justify-content:flex-end}
  .pd-take{min-height:40px;padding:0 14px;font-weight:600;white-space:nowrap}
  .pd-done{display:inline-flex;align-items:center;min-height:40px;padding:0 12px;border-radius:10px;background:var(--green-bg);color:var(--green);font-size:13px;font-weight:600;white-space:nowrap}
  /* the eye window: each open item is its own soft card, actions underneath */
  .pd-det{display:flex;flex-direction:column;gap:10px}
  .pd-di{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:#fcfcfd}
  .pd-di.al{background:#fffbfb;border-color:#fecdca}
  .pd-dh{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .pd-dh .tiny{color:var(--muted)}
  .pd-dt{font-size:15px;line-height:1.45;font-weight:500;color:var(--ink)}.pd-dt .tiny{display:block;font-weight:400;margin-top:2px}
  .pd-da{display:flex;gap:8px;flex-wrap:wrap}
  .pd-who2{display:flex;align-items:center;gap:12px}.pd-who2 h3{font-size:19px;margin:0}.pd-who2 .tiny{margin-top:2px}
  .pd-empty{padding:28px;text-align:center;color:var(--muted)}`;
  document.head.appendChild(css);

  const EYE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const MAP={};

  window.psyReview=function(id){
    const o=v3().orders.find(x=>x.id===id);if(!o)return;
    V3.modal('Approve this order? · '+hesc(V3.pn(o.pid)),'Written by '+hesc(o.by)+(o.via?' after speaking to '+hesc(o.via):''),
      `<div class="note small">${hesc(o.text)}</div><div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn" onclick="closeModal()">Not now</button><button class="btn pri big" onclick="closeModal();V3.countersign('${o.id}')">Yes, approve</button></div>`);
  };
  window.psyDtSet=function(f){S.dtF=f;render();};

  /* open that patient's Rounds page */
  window.psyOpenRounds=function(pid){
    closeModal();
    const R=S.rounds;
    for(const w of Object.keys(WARDS)){const j=WARDS[w].findIndex(x=>x.id===pid);if(j>=0){R.ward=w;R.idx[w]=j;R.drafted=false;R.mc=[];R.adv=[];R.mon=[];R.inv=[];R.ref=[];R.noteFromScribe=false;R.scribeNote=((R.noteBy||{})[pid])||'';break;}}
    go('#/rounds');
  };

  /* the eye: that patient's items, each with its action */
  window.psyEye=function(pid){
    const m=MAP[pid];if(!m)return;
    const body=`<div class="pd-det">${m.items.map(i=>{
      const acts=(i.k==='alert'?`<button class="btn sm pri" onclick="psyOpenRounds('${pid}')">Review treatment</button>`:'')+(i.btn?`<button class="btn sm ${i.btn[2]?'pri':''}" onclick="closeModal();${i.btn[1]}">${i.btn[0]}</button>`:'');
      return `<div class="pd-di ${i.k==='alert'?'al':''}"><div class="pd-dh"><span class="pd-chip ${i.lab[0]}">${hesc(i.lab[1])}</span>${i.due?`<span class="tiny">${hesc(i.due)}</span>`:''}</div><div class="pd-dt">${hesc(i.txt)}</div>${acts?`<div class="pd-da">${acts}</div>`:''}</div>`;}).join('')}</div>`;
    const foot=`<div class="mf"><button class="btn" onclick="closeModal();go('#/patient/${pid}/overview')">Open full record</button><button class="btn" onclick="psyOpenRounds('${pid}')">Open Rounds</button></div>`;
    openModal(`<div class="mh"><div class="pd-who2">${av(m.p.ini,44,m.items.some(i=>i.k==='alert')?'c-red':'c-blue')}<div><h3>${hesc(m.p.name)}</h3><div class="tiny muted">${hesc(m.p.dx||'')}${m.p.dx?' · ':''}Day ${m.p.day}</div></div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb">${body}</div>${foot}`);
    $('modal').style.width='min(620px,100%)';
  };

  /* Action Taken: the doctor says what was done for this patient's open items. It is logged in the patient's Events log with name and time,
     open alerts are marked acknowledged, and the row shows "Action taken" until something new comes up. */
  window.psyActionTaken=function(pid){
    const m=MAP[pid];if(!m)return;
    V3.modal('Action taken · '+hesc(m.p.name),'What was done for these items',
      `<div class="pd-det">${m.items.map(i=>`<div class="pd-di"><div class="pd-dh"><span class="pd-chip ${i.lab[0]}">${hesc(i.lab[1])}</span></div><div class="pd-dt">${hesc(i.txt)}</div></div>`).join('')}</div>
       <label class="field" style="margin-top:8px"><span class="lbl">What you did (required)</span><textarea class="input" id="atN" rows="3" placeholder="e.g. Reviewed in the ward, repeat vitals in 30 minutes, lorazepam given as ordered"></textarea><div id="atE" class="small" style="color:var(--red);display:none">Write what you did first</div></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyActionSave('${pid}')">Record action taken</button>`);
  };
  window.psyActionSave=function(pid){
    const m=MAP[pid],n=(($('atN')||{}).value||'').trim();if(!m)return;if(!n){$('atE').style.display='block';return;}
    const w=whoAt(),x=psyPx(pid);x.taken=x.taken||{};
    m.items.forEach(i=>{
      x.taken[i.key]={by:w.by,at:w.at,note:n};
      if(i.k==='alert'&&i.aid){const a=v3().alerts.find(y=>y.id===i.aid);if(a&&!a.ack)a.ack={by:V3.byMe(),role:S.role,t:V3.now()};}
    });
    V3.log(pid,S.role,'note','Action taken: '+n+' · '+w.by);
    closeModal();render();toast('Action taken recorded for '+m.p.name+' by '+w.by);
  };

  function build(p,T){
    const items=[];
    DT.alerts(p).forEach(i=>items.push({k:'alert',aid:((i.btn&&i.btn[1]||'').match(/'([^']+)'/)||[])[1],lab:['red','Alert'],txt:i.txt.replace(/^Alert:\s*/,''),due:i.due,btn:i.btn&&['Mark seen',i.btn[1],false]}));
    DT.orders(p).forEach(i=>{const id=(i.btn[1].match(/'([^']+)'/)||[])[1];items.push({k:'order',lab:['blue','Approve'],txt:i.txt.replace(/^Countersign:\s*/,''),due:(window.psyOrderLeft&&psyOrderLeft(id))||i.due,btn:['Check and approve',`psyReview('${id}')`,false]});});
    DT.tasks(p,T).forEach(i=>{
      const sign=/discharge summary/i.test(i.txt),late=!!i.overdue;
      items.push({k:late?'late':'task',lab:late?['amber','Late']:sign?['grey','To sign']:['grey','Today'],txt:i.txt,due:i.due,
        btn:[sign?'Review and sign':late?'Do it now':'Open',`go('${i.go||'#/patient/'+p.id+'/overview'}')`,false]});
    });
    if(window.psyExtraItems)window.psyExtraItems(p).forEach(i=>items.push(i)); /* results to review, daily observation review */
    const act=items.filter(i=>i.lab[1]!=='Today'); /* routine "Today" items are not shown on the dashboard any more */
    const has=k=>act.some(i=>i.k===k),isNew=p.day<=1;
    const rank=has('alert')?0:(has('order')||has('late'))?1:2;
    const edge=has('alert')?'red':(act.some(i=>i.lab[0]==='amber'))?'amber':has('order')?'blue':'';
    const types=[];act.forEach(i=>{if(!types.some(t=>t[1]===i.lab[1]))types.push(i.lab);});
    act.forEach(i=>{i.key=i.k+':'+i.txt;});
    MAP[p.id]={p,items:act};
    const tk=(window.psyPx&&psyPx(p.id).taken)||{},allTaken=act.length>0&&act.every(i=>tk[i.key]),last=allTaken?tk[act[act.length-1].key]:null;
    const html=act.length?`<tr class="${allTaken?'r-done':(edge?'r-'+edge:'')}" data-dt="${hesc((p.name+' '+p.room).toLowerCase())}" data-need="${has('alert')||has('order')?1:0}" data-new="${isNew?1:0}" data-late="${has('late')?1:0}">
      <td><div class="pd-chips">${types.map(t=>`<span class="pd-chip ${t[0]}">${hesc(t[1])}</span>`).join('')}</div></td>
      <td><button class="pd-who" onclick="go('#/patient/${p.id}/overview')">${av(p.ini,34,has('alert')?'c-red':'c-blue')}<b>${hesc(p.name)}</b></button></td>
      <td><div class="pd-acts"><button class="pd-eye" aria-label="View details for ${hesc(p.name)}" title="View details" onclick="psyEye('${p.id}')">${EYE}</button>${allTaken?`<span class="pd-done" title="${hesc((last.by||'')+' · '+(last.at||'')+(last.note?' · '+last.note:''))}">Action taken ✓</span>`:`<button class="btn sm pd-take" onclick="psyActionTaken('${p.id}')">Action Taken</button>`}</div></td></tr>`:'';
    return {rank,html,act};
  }

  function dash(){
    $('title').textContent='Inpatients';
    const T=tasks().filter(t=>!S.done[t.id]&&t.taskType!=='alert'&&t.taskType!=='countersign');
    const rows=PTS.map(p=>build(p,T)).filter(r=>r.act.length).sort((a,b)=>a.rank-b.rank);
    S.dtF='all';
    setTimeout(dtFilter,0);
    return `<div class="pd">
      <div class="pd-bar"><input class="input" id="dtQ" style="width:280px;min-height:40px;margin:0" placeholder="Type a name" oninput="dtFilter()" aria-label="Search patients">
        <div class="row" style="gap:8px"><button class="btn" onclick="go('#/admissions')">New admission</button><button class="btn pri" onclick="go('#/rounds')">Start rounds</button></div></div>
      ${rows.length?`<table class="pd-t"><colgroup><col style="width:34%"><col><col style="width:230px"></colgroup>
        <thead><tr><th>Alert</th><th>Patient</th><th></th></tr></thead>
        <tbody id="dtBody">${rows.map(r=>r.html).join('')}<tr id="dtNone" style="display:none"><td colspan="3" class="pd-empty">No patient matches</td></tr></tbody></table>`
      :`<section class="card"><div class="pd-empty">Nothing needs you right now. You can start your rounds when you are ready.</div></section>`}
    </div>`;
  }
  Object.assign(ROLE.psychiatrist,{myday:()=>dash()});
})();
