
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
  .pd-t td:first-child{position:relative;padding-left:18px;border-left:1px solid var(--line);border-top-left-radius:16px;border-bottom-left-radius:16px}
  .pd-t td:last-child{padding-left:8px;padding-right:14px;border-right:1px solid var(--line);border-top-right-radius:16px;border-bottom-right-radius:16px;text-align:right}
  .pd-ty{font-size:14px;font-weight:700;color:#475467}.pd-ty.red{color:#b42318}.pd-ty.blue{color:#175cd3}.pd-ty.amber{color:#b54708}
  .pd-t tr{box-shadow:0 1px 2px rgba(16,24,40,.04)}
  .pd-t tr.r-red{--pc:#e5484d;--pg:rgba(229,72,77,.16)}.pd-t tr.r-red td{background:#fffbfb}
  .pd-t tr.r-amber{--pc:#f5a524;--pg:rgba(245,165,36,.18)}
  .pd-t tr.r-blue{--pc:#3b82f6;--pg:rgba(59,130,246,.16)}
  .pd-t tbody tr:hover td{background:#f8fbff}.pd-t tr.r-red:hover td{background:#fff6f6}
  .pd-t tr.r-done{--pc:#12b76a;--pg:rgba(18,183,106,.16)}
  .pd-who{display:flex;align-items:center;gap:12px;border:0;background:none;padding:0;font:inherit;text-align:left;cursor:pointer;color:var(--ink)}
  .pd-who b{font-size:15px;font-weight:700}.pd-nm{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;white-space:nowrap}.pd-who:hover b{color:var(--blue)}
  .pd-sub{display:block;font-size:12.5px;color:var(--muted);margin-top:1px}
  .pd-dx{font-size:13px;color:var(--ink-2);margin:8px 0 0 50px;line-height:1.35}
  .pd-tags{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 0 50px}
  .pd-tag{font-size:10px;line-height:1.15;font-weight:700;border-radius:99px;padding:1px 6px}.pd-tag.amber{font-size:9.5px;line-height:1.1;padding:0 5px;border:1px solid #f79009;background:#fff4d6;color:#93370d}.pd-tag.blue{background:#eff8ff;color:#175cd3}
  .pd-d{display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:1.4;padding:2px 0}
  .pd-d+.pd-d{margin-top:4px}
  .pd-dot{flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:#98a2b3;margin-top:6px}.pd-dot.red{background:#e5484d}.pd-dot.amber{background:#f5a524}.pd-dot.blue{background:#3b82f6}.pd-dot.ok{background:#12b76a}.pd-d.done{color:#667085}.pd-d.done .tiny{color:#067647}
  .pd-di.done{background:#f6fef9;border-color:#abefc6}
  .pd-chips{display:flex;gap:6px;flex-wrap:wrap}
  .pd-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;border-radius:99px;padding:4px 11px 4px 9px;background:#f2f4f7;color:#475467;white-space:nowrap;border:1px solid rgba(16,24,40,.06)}
  .pd-chip::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}
  .pd-chip.red{background:#fef3f2;color:#b42318;border-color:#fecdca}.pd-chip.amber{background:#fffaeb;color:#b54708;border-color:#fedf89}.pd-chip.blue{background:#eff8ff;color:#175cd3;border-color:#b2ddff}
  .pd-eye{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink-2);cursor:pointer}
  .pd-eye:hover{border-color:var(--blue);color:var(--blue)}
  .pd-acts{display:inline-flex;align-items:center;gap:8px;justify-content:flex-end;white-space:nowrap}
  .pd-take{min-height:36px;padding:0 12px;font-size:13px;font-weight:600;white-space:nowrap}
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
  .pd-empty{padding:28px;text-align:center;color:var(--muted)}
  /* narrow windows: drop the Actions taken column so the buttons stay in view (it is still in the eye window) */
  @media (max-width:1180px){.pd-t col:nth-child(4){display:none}.pd-t th:nth-child(4),.pd-t td:nth-child(4){display:none}.pd-t{min-width:720px!important}}
  #pdMenu{position:fixed;z-index:120;width:300px;max-width:calc(100vw - 24px);background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 40px rgba(15,23,42,.18);padding:6px}
  #pdMenu .pdm-i{display:block;width:100%;text-align:left;border:0;background:none;font:inherit;padding:9px 12px;border-radius:9px;cursor:pointer;color:var(--ink)}
  #pdMenu .pdm-i:hover{background:var(--soft)}#pdMenu .pdm-i b{display:block;font-size:14px;font-weight:600}
  #pdMenu .pdm-i span{display:block;font-size:12px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;
  document.head.appendChild(css);

  const EYE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const MAP={};

  window.psyReview=function(id){
    const o=v3().orders.find(x=>x.id===id);if(!o)return;
    V3.modal('Approve this order? · '+hesc(V3.pn(o.pid)),'Written by '+hesc(o.by)+(o.via?' after speaking to '+hesc(o.via):''),
      `<div class="note small">${hesc(o.text)}</div><div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn" onclick="closeModal()">Not now</button><button class="btn pri big" onclick="closeModal();V3.countersign('${o.id}')">Yes, approve</button></div>`);
  };
  /* 5 Nov team review (Nikita and Anu): approving is one click, no "Approve this order?" window on top of the window.
     psyReview above stays for the floor lead, whose Check and approve button still asks first. */
  window.psyApprove=function(id){V3.countersign(id);};
  /* the name used in the button: the alert's source (Vitals) or the medicine (Ondansetron) */
  const itemName=i=>{
    if(i.k==='order'){const m=String(i.txt).match(/^([A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*)*?)(?=\s+\d)/);return m?m[1]:String(i.txt).split(/\s+/)[0];}
    const l=(i.lab&&i.lab[1])||'';return (l&&l!=='Urgent')?l:'Alert';
  };
  /* one tap: "Vitals done" marks that alert as dealt with (and acknowledges it); "Ondansetron done" approves that order. Both are written to Actions taken with name and time. */
  window.psyItemDone=function(pid,ix){
    const m=MAP[pid],i=m&&m.items[ix];if(!i)return;
    const x=psyPx(pid);x.taken=x.taken||{};if(x.taken[i.key])return;
    if(i.k==='order'&&!i.oid){toast('Could not find that order');return;}
    const w=whoAt(),name=itemName(i);
    x.taken[i.key]={by:w.by,at:w.at,note:name+' done'+(i.k==='order'?' (approved)':'')};
    if(i.k==='alert'&&i.aid){const a=v3().alerts.find(y=>y.id===i.aid);if(a&&!a.ack)a.ack={by:V3.byMe(),role:S.role,t:V3.now(),note:name+' done'};}
    V3.log(pid,S.role,'note',name+' done'+(i.k==='order'?' (approved)':'')+' · '+w.by);
    if(i.k==='order'){V3.countersign(i.oid);return;}
    render();toast(name+' done, recorded by '+w.by);
  };
  window.psyDtSet=function(f){S.dtF=f;render();};
  /* patient line under the name: age and sex, then room. No diagnosis, no UHID, no day count, no dates (Nikita and Anu, 5 Nov) */
  const sub=p=>window.psyPatientLine?psyPatientLine(p):[(window.psyAgeSex?psyAgeSex(p):''),window.psyRoomLabel?psyRoomLabel(p):p.room].filter(Boolean).join(' ');

  /* Take Action: a drop-down under the button listing what can be done for this patient. It is a floating panel (the table scrolls
     sideways, so a menu inside it would be cut off). */
  window.pdMenuClose=function(){const o=document.getElementById('pdMenu');if(o)o.remove();};
  window.psyMenu=function(ev,pid){
    ev.stopPropagation();
    const old=document.getElementById('pdMenu');if(old){const same=old.dataset.pid===pid;old.remove();if(same)return;}
    const m=MAP[pid];if(!m)return;
    const tk=(window.psyPx&&psyPx(pid).taken)||{},open=m.items.filter(i=>!tk[i.key]);
    const medical=open.some(i=>i.k==='alert'||i.k==='order'||/result/i.test(i.lab[1]));
    const row=(go,t,s)=>`<button class="pdm-i" onclick="pdMenuClose();${go}"><b>${t}</b>${s?`<span>${hesc(s)}</span>`:''}</button>`;
    const el=document.createElement('div');el.id='pdMenu';el.dataset.pid=pid;el.setAttribute('role','menu');
    el.innerHTML=open.filter(i=>i.btn).map(i=>row(i.btn[1],hesc(i.btn[0]),i.txt)).join('')
      +(medical?row(`psyToChart('${pid}')`,'Review treatment','Open the nursing chart'):'')
      +row(`psyActionTaken('${pid}')`,'Log action taken','Write what was done');
    document.body.appendChild(el);
    const r=ev.currentTarget.getBoundingClientRect();
    el.style.top=Math.min(r.bottom+6,innerHeight-el.offsetHeight-12)+'px';el.style.left=Math.max(12,Math.min(r.right-el.offsetWidth,innerWidth-el.offsetWidth-12))+'px';
  };
  document.addEventListener('mousedown',e=>{const o=document.getElementById('pdMenu');if(o&&!o.contains(e.target)&&!(e.target.closest&&e.target.closest('.pd-take')))o.remove();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')pdMenuClose();});
  window.addEventListener('scroll',()=>pdMenuClose(),true);

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
    const tk=(window.psyPx&&psyPx(pid).taken)||{};
    const body=`<div class="pd-det">${m.items.map((i,ix)=>{
      if(tk[i.key]){const t=tk[i.key];return `<div class="pd-di done"><div class="pd-dh"><span class="pd-chip ${i.lab[0]}">${hesc(i.lab[1])}</span><span class="tiny" style="color:#067647;font-weight:600">Action taken ✓</span></div><div class="pd-dt">${hesc(i.txt)}</div><div class="tiny muted">${hesc(t.by||'')} · ${hesc(t.at||'')}${t.note?' · '+hesc(t.note):''}</div></div>`;}
      /* after any action on one item the window opens again with the rest (Trello "alert page": marking one task must still show the second) */
      const back=`S.__eyePid='${pid}';closeModal();`;
      /* Review treatment (opens the nursing chart) sits on every medical item: alerts, approvals and results to check. */
      const rt=`<button class="btn sm ${i.k==='alert'?'pri':''}" onclick="closeModal();psyToChart('${pid}')">Review treatment</button>`,act=i.btn?`<button class="btn sm ${i.k==='order'?'pri':''}" onclick="${back}${i.btn[1]}">${i.btn[0]}</button>`:'';
      const medical=i.k==='alert'||i.k==='order'||/result/i.test(i.lab[1]);
      const taken=`<button class="btn sm" onclick="closeModal();psyActionTaken('${pid}',${ix})">Log action</button>`;
      const acts=(i.k==='alert'?rt+act:(medical?act+rt:act))+taken;
      return `<div class="pd-di ${i.k==='alert'?'al':''}"><div class="pd-dh"><span class="pd-chip ${i.lab[0]}">${hesc(i.lab[1])}</span>${i.due?`<span class="tiny">${hesc(i.due)}</span>`:''}</div><div class="pd-dt">${hesc(i.txt)}</div><div class="pd-da">${acts}</div></div>`;}).join('')}</div>`;
    const foot=`<div class="mf"><button class="btn" onclick="closeModal();go('#/patient/${pid}/overview')">Open full record</button><button class="btn" onclick="psyOpenRounds('${pid}')">Open Rounds</button></div>`;
    openModal(`<div class="mh"><div class="pd-who2">${av(m.p.ini,44,m.items.some(i=>i.k==='alert')?'c-red':'c-blue')}<div><h3>${hesc(m.p.name)}</h3><div class="tiny muted">${hesc(sub(m.p))}</div></div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb">${body}</div>${foot}`);
    $('modal').style.width='min(620px,100%)';
  };

  /* Action Taken: tick what you did (one item or several), say what you did. It is logged in the patient events log with name and time, open alerts are
     marked acknowledged, and the ticked items show "Action taken". The other items stay on the dashboard. */
  window.psyActionTaken=function(pid,only){
    const m=MAP[pid];if(!m)return;
    const tk=(window.psyPx&&psyPx(pid).taken)||{},open=m.items.map((i,ix)=>({i,ix})).filter(o=>!tk[o.i.key]);
    if(!open.length){toast('Everything is already marked');return;}
    const pre=only!=null?only:open[0].ix;
    V3.modal('Action taken · '+hesc(m.p.name),'Tick what you did. The other items stay on the dashboard.',
      `<div class="pd-det">${open.map(o=>`<label class="pd-di" style="flex-direction:row;align-items:flex-start;gap:12px;cursor:pointer"><input type="checkbox" class="atc" data-i="${o.ix}" ${o.ix===pre?'checked':''} style="margin-top:4px"><div style="flex:1"><div class="pd-dh"><span class="pd-chip ${o.i.lab[0]}">${hesc(o.i.lab[1])}</span></div><div class="pd-dt">${hesc(o.i.txt)}</div></div></label>`).join('')}</div>
       <label class="field" style="margin-top:8px"><span class="lbl">What you did (required)</span><textarea class="input" id="atN" rows="3" placeholder="e.g. Reviewed in the ward, repeat vitals in 30 minutes, lorazepam given as ordered"></textarea><div id="atE" class="small" style="color:var(--red);display:none">Tick at least one item and write what you did</div></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyActionSave('${pid}')">Record action taken</button>`);
  };
  window.psyActionSave=function(pid){
    const m=MAP[pid],n=(($('atN')||{}).value||'').trim(),ticked=[...document.querySelectorAll('#modal .atc:checked')].map(c=>m&&m.items[+c.dataset.i]).filter(Boolean);
    if(!m)return;if(!n||!ticked.length){$('atE').style.display='block';return;}
    const w=whoAt(),x=psyPx(pid);x.taken=x.taken||{};
    ticked.forEach(i=>{
      x.taken[i.key]={by:w.by,at:w.at,note:n};
      if(i.k==='alert'&&i.aid){const a=v3().alerts.find(y=>y.id===i.aid);if(a&&!a.ack)a.ack={by:V3.byMe(),role:S.role,t:V3.now()};}
    });
    V3.log(pid,S.role,'note','Action taken: '+n+' · '+w.by);
    if(m.items.some(i=>!x.taken[i.key]))S.__eyePid=pid; /* the rest of this patient items stay in view */
    closeModal();render();toast('Action taken recorded for '+m.p.name+' by '+w.by);
  };
  /* reopen the patient window after an action, so the second task is still there */
  const __rdash=render;
  render=function(){
    const out=__rdash.apply(this,arguments);
    const pid=S.__eyePid;
    if(pid){S.__eyePid=null;setTimeout(()=>{const m=MAP[pid],tk=(window.psyPx&&psyPx(pid).taken)||{};if(m&&m.items.some(i=>!tk[i.key])&&!document.getElementById('scrim').classList.contains('show'))psyEye(pid);},80);}
    return out;
  };

  function build(p,T){
    const items=[];
    /* the word "Alert" is not repeated on every row (Nikita, 5 Nov): the type is where the alert came from, e.g. Vitals */
    DT.alerts(p).forEach(i=>items.push({k:'alert',aid:((i.btn&&i.btn[1]||'').match(/'([^']+)'/)||[])[1],lab:['red',(i.due&&i.due!=='Now')?i.due:'Urgent'],txt:i.txt.replace(/^Alert:\s*/,''),due:'',btn:i.btn&&['Mark seen',i.btn[1],false]}));
    DT.orders(p).forEach(i=>{const id=(i.btn[1].match(/'([^']+)'/)||[])[1];items.push({k:'order',oid:id,lab:['blue','Approve'],txt:i.txt.replace(/^Countersign:\s*/,''),due:(window.psyOrderLeft&&psyOrderLeft(id))||i.due,btn:['Approve',`psyApprove('${id}')`,false]});});
    DT.tasks(p,T).forEach(i=>{
      const sign=/discharge summary/i.test(i.txt),late=!!i.overdue;
      items.push({k:late?'late':'task',lab:late?['amber','Late']:sign?['grey','To sign']:['grey','Today'],txt:i.txt,due:i.due,
        btn:[sign?'Review and sign':late?'Do it now':'Open',`go('${i.go||'#/patient/'+p.id+'/overview'}')`,false]});
    });
    if(window.psyExtraItems)window.psyExtraItems(p).forEach(i=>items.push(i)); /* results to review, daily observation review */
    const act=items.filter(i=>i.lab[1]!=='Today'); /* routine "Today" items are not shown on the dashboard any more */
    act.forEach((i,ix)=>{i.key=i.k+':'+i.txt;
      /* Take Action lists "Vitals done" / "Ondansetron done" (no Mark seen); other items keep their own button (Open, Do it now, Review and sign) */
      if(i.k==='alert')i.btn=['I have seen',"psyItemDone('"+p.id+"',"+ix+")",false];
    });
    const tk=(window.psyPx&&psyPx(p.id).taken)||{},rem=act.filter(i=>!tk[i.key]),doneL=act.filter(i=>tk[i.key]);
    const allTaken=act.length>0&&!rem.length,view=rem.length?rem:act; /* chips, colour and order follow what is still open */
    const has=k=>view.some(i=>i.k===k),isNew=p.day<=1;
    const rank=allTaken?3:has('alert')?0:(has('order')||has('late'))?1:2;
    const edge=has('alert')?'red':(view.some(i=>i.lab[0]==='amber'))?'amber':has('order')?'blue':'';
    const types=[];view.forEach(i=>{if(!types.some(t=>t[1]===i.lab[1]))types.push(i.lab);});
    /* the Type column is one plain word: the most urgent type for this patient (alert, then approval, then late, then the rest) */
    const tr=l=>({red:0,blue:1,amber:2}[l[0]]===undefined?3:{red:0,blue:1,amber:2}[l[0]]);
    const top=types.slice().sort((a,b)=>tr(a)-tr(b))[0]||['grey',''];
    MAP[p.id]={p,items:act};
    const last=allTaken?tk[act[act.length-1].key]:null;
    const lines=rem.concat(doneL),shown=lines.slice(0,3);
    /* Event = what happened; Actions taken = what was done about it, by anyone (nurse, RMO, psychiatrist) */
    const detail=i=>tk[i.key]?`<div class="pd-d done"><i class="pd-dot ok"></i><span>${hesc(i.txt)}</span></div>`:`<div class="pd-d"><i class="pd-dot ${i.lab[0]}"></i><span>${hesc(i.txt)}${i.due?`<span class="tiny muted"> · ${hesc(i.due)}</span>`:''}</span></div>`;
    const did=[];
    act.forEach(i=>{const t=tk[i.key];if(t)did.push(`<div class="pd-d done"><i class="pd-dot ok"></i><span>${hesc(t.note||'Action taken')}<span class="tiny"> · ${hesc(t.by||'')} · ${hesc(t.at||'')}</span></span></div>`);});
    v3().alerts.filter(a=>a.pid===p.id&&a.ack&&!a.closed&&!a.seen).forEach(a=>did.push(`<div class="pd-d done"><i class="pd-dot ok"></i><span>${hesc(a.ack.note||'Acknowledged')}<span class="tiny"> · ${hesc(a.ack.by||'')}${a.ack.role&&V3.roleName&&V3.roleName[a.ack.role]?' ('+hesc(V3.roleName[a.ack.role])+')':''} · ${hesc(V3.hm(a.ack.t))}</span></span></div>`));
    const html=act.length&&!allTaken?`<tr class="${edge?'r-'+edge:''}" data-dt="${hesc((p.name+' '+p.room).toLowerCase())}" data-need="${has('alert')||has('order')?1:0}" data-new="${isNew?1:0}" data-late="${has('late')?1:0}">
      <td><span class="pd-ty ${top[0]}">${hesc(top[1])}</span></td>
      <td><button class="pd-who" onclick="go('#/patient/${p.id}/overview')">${av(p.ini,38,has('alert')?'c-red':'c-blue')}<span><span class="pd-nm"><b>${hesc(p.name)}</b>${p.risk?'<span class="pd-tag amber">High risk</span>':''}</span><span class="pd-sub">${hesc(sub(p))}</span></span></button>${isNew?`<div class="pd-tags" style="margin-left:50px"><span class="pd-tag blue">New admission</span></div>`:''}</td>
      <td>${shown.map(detail).join('')}${lines.length>3?`<div class="tiny muted" style="margin-top:4px">+${lines.length-3} more, press the eye</div>`:''}</td>
      <td>${did.length?did.join(''):'<span class="tiny muted">Nothing yet</span>'}${doneL.length&&rem.length?`<div class="tiny" style="margin-top:4px;color:#067647;font-weight:600">${doneL.length} of ${act.length} done</div>`:''}</td>
      <td><div class="pd-acts"><button class="pd-eye" aria-label="View details for ${hesc(p.name)}" title="View details" onclick="psyEye('${p.id}')">${EYE}</button><button class="btn sm pd-take" aria-haspopup="menu" onclick="psyMenu(event,'${p.id}')">Take Action <span aria-hidden="true">▾</span></button></div></td></tr>`:'';
    const doneHtml=allTaken?`<div class="li"><div class="grow"><div style="font-weight:600">${hesc(p.name)} <span class="pd-done">Done today ✓</span></div><div class="tiny muted">${hesc(act.length+' item'+(act.length===1?'':'s')+' completed · '+(last&&last.by||'' )+' · '+(last&&last.at||''))}</div></div><button class="btn sm" onclick="psyEye('${p.id}')">View record</button></div>`:'';
    return {rank,html,doneHtml,act,allTaken};
  }

  function dash(){
    $('title').textContent='Inpatients';
    const T=tasks().filter(t=>!S.done[t.id]&&t.taskType!=='alert'&&t.taskType!=='countersign');
    const rows=PTS.map(p=>build(p,T)).filter(r=>r.act.length).sort((a,b)=>a.rank-b.rank),openRows=rows.filter(r=>!r.allTaken),doneRows=rows.filter(r=>r.allTaken);
    S.dtF='all';
    setTimeout(dtFilter,0);
    return `<div class="pd">
      <div class="pd-bar"><input class="input" id="dtQ" style="width:280px;min-height:40px;margin:0" placeholder="Type a name" oninput="dtFilter()" aria-label="Search patients">
        <div class="row" style="gap:8px"><button class="btn" onclick="go('#/admissions')">New admission</button><button class="btn pri" onclick="go('#/rounds')">Start rounds</button></div></div>
      ${openRows.length?`<div style="overflow-x:auto"><table class="pd-t" style="min-width:900px"><colgroup><col style="width:122px"><col style="width:190px"><col><col style="width:21%"><col style="width:216px"></colgroup>
        <thead><tr><th>Type</th><th>Patient</th><th>Event</th><th>Action taken by others</th><th></th></tr></thead>
        <tbody id="dtBody">${openRows.map(r=>r.html).join('')}<tr id="dtNone" style="display:none"><td colspan="5" class="pd-empty">No patient matches</td></tr></tbody></table></div>`
      :`<section class="card"><div class="pd-empty">Nothing needs you right now. You can start your rounds when you are ready.</div></section>`}
      ${doneRows.length?`<section class="card"><div class="hd"><div><h3>Done today</h3><div class="small muted" style="margin-top:4px">Completed actions are kept here for reference.</div></div></div>${doneRows.map(r=>r.doneHtml).join('')}</section>`:''}
    </div>`;
  }
  Object.assign(ROLE.psychiatrist,{myday:()=>dash()});
})();
