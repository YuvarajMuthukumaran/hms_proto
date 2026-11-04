
/* Psychiatrist only (5 Nov 2026): Inpatient dashboard redesign (Trello "Inpatient dashboard (Today): layout, filters, actions and table").
   - four count tiles that are the filters: Needs you now, Overdue, New admissions, All my inpatients (selected tile has a blue border)
   - one table, content about 1180 px wide and centred: Patient | Room | Observation | Due today | arrow (diagnosis moved under the name)
   - no Open button: the name and the arrow open the patient; each action sits on the item it belongs to
     (Acknowledge is the only filled button; Review, Start, Review and sign are outline)
   - status label per item: Vitals alert (red), Overdue (amber), Countersign (blue), Due today / To sign (grey)
   - sorted Needs you now, Overdue, New admissions, Due today, Nothing due; red only for a real alert
   Open question on the card (does opening a patient acknowledge an alert?) is answered "no": the alert is acknowledged only with the button. */
(function(){
  const css=document.createElement('style');css.id='psy-dash-css';
  css.textContent=`
  .pd{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
  .pd-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  .pd-tile{text-align:left;font:inherit;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer}
  .pd-tile:hover{border-color:#9dbdf0}.pd-tile.on{border:2px solid var(--blue);padding:11px 13px}
  .pd-tile .h{display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px}
  .pd-dot{width:9px;height:9px;border-radius:50%;flex:0 0 9px}
  .pd-tile b{display:block;font-size:26px;line-height:1.2;margin:4px 0 2px}
  .pd-tile span.d{font-size:12px;color:var(--muted)}
  .pd-t{table-layout:fixed;width:100%;min-width:820px;border-collapse:collapse}
  .pd-t th{background:var(--soft);color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-align:left;padding:10px 14px;border-bottom:1px solid var(--line)}
  .pd-t td{padding:14px;border-bottom:1px solid var(--line-2);vertical-align:top}
  .pd-t tr.alert td{background:#fffafa}
  .pd-name{border:0;background:none;padding:0;font:inherit;font-weight:700;font-size:14px;color:var(--ink);text-align:left;cursor:pointer}
  .pd-name:hover{color:var(--blue)}
  .pd-sub{font-size:12px;color:var(--muted);margin-top:2px}.pd-dx{font-size:12.5px;color:var(--ink-2);margin-top:2px}
  .pd-tags{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
  .pd-tag{font-size:11px;font-weight:700;border-radius:99px;padding:1px 8px}
  .pd-tag.amber{background:var(--amber-bg);color:var(--amber)}.pd-tag.blue{background:var(--blue-tint);color:var(--blue-ink)}
  .pd-pill{display:inline-block;font-size:12px;border-radius:99px;padding:2px 10px;background:var(--grey-bg);color:var(--grey)}.pd-pill.amber{background:var(--amber-bg);color:var(--amber);font-weight:600}
  .pd-item{display:flex;align-items:flex-start;gap:10px;padding:3px 0}
  .pd-item+.pd-item{border-top:1px dashed var(--line-2);margin-top:4px;padding-top:7px}
  .pd-lab{flex:0 0 96px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding-top:2px}
  .pd-lab.red{color:var(--red)}.pd-lab.amber{color:var(--amber)}.pd-lab.blue{color:var(--blue-ink)}.pd-lab.grey{color:var(--muted)}
  .pd-txt{flex:1;min-width:0;font-size:13px;line-height:1.4}.pd-txt .tiny{display:block}
  .pd-go{border:0;background:none;font-size:20px;color:#8a94a6;cursor:pointer;padding:0 6px}.pd-go:hover{color:var(--blue)}
  /* easier to use (5 Nov 2026): a "Start here" card, plain words, bigger text and buttons */
  .pd-start{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:var(--blue-tint);border:1px solid #bcd4fa;border-radius:14px;padding:16px 20px}
  .pd-start.red{background:#fff5f4;border-color:#f3c3be}
  .pd-start.ok{background:var(--green-bg);border-color:#bfe6cc}
  .pd-sh{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--blue-ink)}.pd-start.red .pd-sh{color:var(--red)}.pd-start.ok .pd-sh{color:var(--green)}
  .pd-start .pd-st{font-size:17px;line-height:1.35;margin:3px 0}
  .btn.big{min-height:46px;padding:0 24px;font-size:15px;font-weight:600}
  .pd-t .btn.sm{min-height:36px;padding:0 14px;font-size:13.5px}
  .pd-t tbody tr:hover td{background:#f8fbff}.pd-t tr.alert:hover td{background:#fff5f4}
  .pd-hint{font-size:13px;color:var(--muted);margin-top:2px}
  @media (max-width:900px){.pd-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
  document.head.appendChild(css);

  window.psyReview=function(id){
    const o=v3().orders.find(x=>x.id===id);if(!o)return;
    V3.modal('Approve this order? · '+hesc(V3.pn(o.pid)),'Written by '+hesc(o.by)+(o.via?' after speaking to '+hesc(o.via):''),
      `<div class="note small">${hesc(o.text)}</div><div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn" onclick="closeModal()">Not now</button><button class="btn pri big" onclick="closeModal();V3.countersign('${o.id}')">Yes, approve</button></div>`);
  };
  window.psyDtSet=function(f){S.dtF=f;render();};

  function build(p,T){
    const sx=p.sex||(PT_FILL[p.id]||[])[0]||'',ag=p.age||(PT_FILL[p.id]||[])[1]||'';
    const items=[];
    DT.alerts(p).forEach(i=>items.push({k:'alert',lab:['red','Alert'],txt:i.txt.replace(/^Alert:\s*/,''),due:i.due,btn:i.btn&&["I've seen this",i.btn[1],true]}));
    DT.orders(p).forEach(i=>{const id=(i.btn[1].match(/'([^']+)'/)||[])[1];items.push({k:'order',lab:['blue','Approve'],txt:i.txt.replace(/^Countersign:\s*/,''),due:(window.psyOrderLeft&&psyOrderLeft(id))||i.due,btn:['Check and approve',`psyReview('${id}')`,false]});});
    DT.tasks(p,T).forEach(i=>{
      const sign=/discharge summary/i.test(i.txt),late=!!i.overdue;
      items.push({k:late?'late':'task',lab:late?['amber','Late']:sign?['grey','To sign']:['grey','Today'],txt:i.txt,due:i.due,
        btn:[sign?'Review and sign':late?'Do it now':'Open',`go('${i.go||'#/patient/'+p.id+'/overview'}')`,false]});
    });
    if(window.psyExtraItems)window.psyExtraItems(p).forEach(i=>items.push(i)); /* results to review, daily observation review */
    const need=items.some(i=>i.k==='alert'||i.k==='order'),late=items.some(i=>i.k==='late'),isNew=p.day<=1;
    const rank=need?0:late?1:isNew?2:items.length?3:4;
    const obs=dtObs(p),obsAmber=String(obs).startsWith('1:1');
    const itemHtml=items.length?items.map(i=>`<div class="pd-item"><span class="pd-lab ${i.lab[0]}">${i.lab[1]}</span><div class="pd-txt">${hesc(i.txt)}${i.due?`<span class="tiny muted">${hesc(i.due)}</span>`:''}</div>${i.btn?`<button class="btn sm ${i.btn[2]?'pri':''}" style="white-space:nowrap" onclick="${i.btn[1]}">${i.btn[0]}</button>`:''}</div>`).join(''):'<span class="small" style="color:var(--green);font-weight:600">All done for today</span>';
    const html=`<tr class="${items.some(i=>i.k==='alert')?'alert':''}" data-dt="${hesc((p.name+' '+p.room).toLowerCase())}" data-need="${need?1:0}" data-new="${isNew?1:0}" data-late="${late?1:0}">
      <td><button class="pd-name" onclick="go('#/patient/${p.id}/overview')">${hesc(p.name)}</button><div class="pd-sub">${sx?sx+'/'+ag+' · ':''}Day ${p.day}</div><div class="pd-dx">${hesc(p.dx||'')}</div>
        ${p.risk||isNew?`<div class="pd-tags">${p.risk?'<span class="pd-tag amber">High risk</span>':''}${isNew?'<span class="pd-tag blue">New patient</span>':''}</div>`:''}</td>
      <td class="small" style="overflow-wrap:anywhere">${hesc(p.room)}</td>
      <td><span class="pd-pill ${obsAmber?'amber':''}">${hesc(obs)}</span></td>
      <td>${itemHtml}</td>
      <td style="text-align:right"><button class="pd-go" aria-label="Open ${hesc(p.name)}" onclick="go('#/patient/${p.id}/overview')">›</button></td></tr>`;
    return {rank,need,late,isNew,html,p,items};
  }

  /* "Start here": the one thing to do first, with its button. Nothing else on the page moves. */
  function startHere(rows){
    const urgent=[];rows.forEach(r=>r.items.forEach(i=>{if(i.k==='alert'||i.k==='order'||i.k==='late')urgent.push({p:r.p,i});}));
    if(!urgent.length)return `<section class="pd-start ok"><div><div class="pd-sh">All clear</div><div class="pd-st">Nothing needs you right now.</div><div class="tiny muted">You can start your rounds when you are ready.</div></div><button class="btn pri big" onclick="go('#/rounds')">Start rounds</button></section>`;
    const f=urgent[0],more=urgent.length-1,go=f.i.btn?f.i.btn:['Open patient',`go('#/patient/${f.p.id}/overview')`,true];
    const why={alert:'An alert is waiting for you',order:'An order is waiting for your approval',late:'This is late'}[f.i.k];
    return `<section class="pd-start ${f.i.k==='alert'?'red':''}"><div><div class="pd-sh">Start here · ${why}</div><div class="pd-st"><b>${hesc(f.p.name)}</b> · ${hesc(f.i.txt)}</div><div class="tiny muted">${more?more+' more thing'+(more>1?'s':'')+' waiting after this one.':'This is the only thing waiting.'}</div></div><button class="btn pri big" onclick="${go[1]}">${go[0]}</button></section>`;
  }

  function dash(){
    $('title').textContent='Inpatients';
    const T=tasks().filter(t=>!S.done[t.id]&&t.taskType!=='alert'&&t.taskType!=='countersign');
    const rows=PTS.map(p=>build(p,T)).sort((a,b)=>a.rank-b.rank);
    const n={need:rows.filter(r=>r.need).length,late:rows.filter(r=>r.late).length,isNew:rows.filter(r=>r.isNew).length,all:rows.length};
    S.dtF='all'; /* the four filter tiles were removed (owner, 5 Nov): nothing is filtered any more except by the search box */
    const day=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
    setTimeout(dtFilter,0);
    return `<div class="pd">
      <div class="row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h2>Inpatient dashboard</h2><div class="muted" style="margin-top:4px">${day} · ${rows.length} patients · ${n.need} need${n.need===1?'s':''} you now</div><div class="pd-hint">Tap a patient's name to open their file.</div></div>
        <div class="row" style="gap:8px"><button class="btn" onclick="go('#/admissions')">New admission</button><button class="btn pri" onclick="go('#/rounds')">Start rounds</button></div></div>
      ${startHere(rows)}
      <section class="card ptable">
        <div class="hd" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><h3>Patients</h3>
          <input class="input" id="dtQ" style="width:260px;min-height:38px;margin:0" placeholder="Type a name or room" oninput="dtFilter()" aria-label="Search patients"></div>
        <div class="scroll"><table class="pd-t"><colgroup><col style="width:230px"><col style="width:110px"><col style="width:130px"><col><col style="width:44px"></colgroup>
          <thead><tr><th>Patient</th><th>Room</th><th>Checked</th><th>What to do today</th><th></th></tr></thead>
          <tbody id="dtBody">${rows.map(r=>r.html).join('')}<tr id="dtNone" style="display:none"><td colspan="5" class="pad small muted">No patient matches</td></tr></tbody></table></div></section></div>`;
  }
  Object.assign(ROLE.psychiatrist,{myday:()=>dash()});
})();
