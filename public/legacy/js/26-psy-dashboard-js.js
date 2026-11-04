
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
  .pd-t td:first-child{border-left:4px solid var(--line);border-top-left-radius:14px;border-bottom-left-radius:14px}
  .pd-t td:last-child{border-right:1px solid var(--line);border-top-right-radius:14px;border-bottom-right-radius:14px;text-align:right}
  .pd-t tr.r-red td:first-child{border-left-color:var(--red)}.pd-t tr.r-red td{background:#fffafa}
  .pd-t tr.r-amber td:first-child{border-left-color:#f0a43a}
  .pd-t tr.r-blue td:first-child{border-left-color:var(--blue)}
  .pd-t tbody tr:hover td{background:#f8fbff}.pd-t tr.r-red:hover td{background:#fff5f4}
  .pd-who{display:flex;align-items:center;gap:12px;border:0;background:none;padding:0;font:inherit;text-align:left;cursor:pointer;color:var(--ink)}
  .pd-who b{font-size:15px;font-weight:700}.pd-who:hover b{color:var(--blue)}
  .pd-chips{display:flex;gap:6px;flex-wrap:wrap}
  .pd-chip{font-size:12px;font-weight:700;border-radius:99px;padding:3px 11px;background:var(--grey-bg);color:var(--grey);white-space:nowrap}
  .pd-chip.red{background:#fdecea;color:var(--red)}.pd-chip.amber{background:var(--amber-bg);color:var(--amber)}.pd-chip.blue{background:var(--blue-tint);color:var(--blue-ink)}
  .pd-eye{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink-2);cursor:pointer}
  .pd-eye:hover{border-color:var(--blue);color:var(--blue)}
  .pd-det{display:flex;flex-direction:column}
  .pd-di{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-top:1px solid var(--line-2)}.pd-di:first-child{border-top:0}
  .pd-dt{flex:1;min-width:0;font-size:14px;line-height:1.4}.pd-dt .tiny{display:block}
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
    const body=`<div class="pd-det">${m.items.map(i=>`<div class="pd-di"><span class="pd-chip ${i.lab[0]}">${hesc(i.lab[1])}</span><div class="pd-dt">${hesc(i.txt)}${i.due?`<span class="tiny muted">${hesc(i.due)}</span>`:''}</div>${i.btn?`<button class="btn sm ${i.btn[2]?'pri':''}" style="white-space:nowrap" onclick="closeModal();${i.btn[1]}">${i.btn[0]}</button>`:''}</div>`).join('')}</div>`;
    const foot=`<div class="mf"><button class="btn" onclick="closeModal();go('#/patient/${pid}/overview')">Open full record</button><button class="btn pri" onclick="psyOpenRounds('${pid}')">Open Rounds</button></div>`;
    openModal(`<div class="mh"><div><h3>${hesc(m.p.name)}</h3><div class="tiny muted" style="margin-top:2px">${hesc(m.p.dx||'')}${m.p.dx?' · ':''}Day ${m.p.day}</div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb">${body}</div>${foot}`);
  };

  function build(p,T){
    const items=[];
    DT.alerts(p).forEach(i=>items.push({k:'alert',lab:['red','Alert'],txt:i.txt.replace(/^Alert:\s*/,''),due:i.due,btn:i.btn&&["I've seen this",i.btn[1],true]}));
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
    MAP[p.id]={p,items:act};
    const html=act.length?`<tr class="${edge?'r-'+edge:''}" data-dt="${hesc((p.name+' '+p.room).toLowerCase())}" data-need="${has('alert')||has('order')?1:0}" data-new="${isNew?1:0}" data-late="${has('late')?1:0}">
      <td><div class="pd-chips">${types.map(t=>`<span class="pd-chip ${t[0]}">${hesc(t[1])}</span>`).join('')}</div></td>
      <td><button class="pd-who" onclick="go('#/patient/${p.id}/overview')">${av(p.ini,34,has('alert')?'c-red':'c-blue')}<b>${hesc(p.name)}</b></button></td>
      <td><button class="pd-eye" aria-label="View details for ${hesc(p.name)}" title="View details" onclick="psyEye('${p.id}')">${EYE}</button></td></tr>`:'';
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
      ${rows.length?`<table class="pd-t"><colgroup><col style="width:34%"><col><col style="width:72px"></colgroup>
        <thead><tr><th>Alert</th><th>Patient</th><th></th></tr></thead>
        <tbody id="dtBody">${rows.map(r=>r.html).join('')}<tr id="dtNone" style="display:none"><td colspan="3" class="pd-empty">No patient matches</td></tr></tbody></table>`
      :`<section class="card"><div class="pd-empty">Nothing needs you right now. You can start your rounds when you are ready.</div></section>`}
    </div>`;
  }
  Object.assign(ROLE.psychiatrist,{myday:()=>dash()});
})();
