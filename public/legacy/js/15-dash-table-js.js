
/* Inpatient dashboard as one simple table (4 Nov 2026, Nikita: "I had streamlined it to be a simple table view").
   One row per patient: room, diagnosis, observation, everything due today for that patient, and one action.
   Rows that need someone now (alert, overdue, countersign) come first. Work not tied to one patient sits in one line above.
   Shared builder only: each role block (ROLE.<role>.myday) picks its patients, its items and its header buttons. */
const dtStrip=(t,p)=>String(t||'').replace(/<[^>]+>/g,'').split(' · '+p.name).join('').split(p.name+' · ').join('').trim();
const dtTitle=t=>String(t.title||'').replace(/<[^>]+>/g,'');
/* item sources, each returns [{txt, due, tone:'alert'|'late'|'', btn:[label,onclick]|null}] */
const DT={
  tasks:(p,T)=>T.filter(t=>dtTitle(t).includes(p.name)).map(t=>({txt:dtStrip(t.title,p),due:t.due||'',tone:t.late?'late':'',overdue:!!t.late,btn:null,go:t.go})),
  alerts:p=>V3.openAlerts(a=>a.pid===p.id&&!a.ack).map(a=>({txt:'Alert: '+a.title,due:a.src||'Now',tone:'alert',btn:V3.canAck(a)?['Acknowledge',`V3.ackAlert('${a.id}')`]:null})),
  alertsRaised:p=>V3.openAlerts(a=>a.pid===p.id).map(a=>({txt:'Alert raised: '+a.title,due:a.ack?'Acknowledged by '+(a.ack.by||'RMO'):'Waiting for the RMO',tone:a.ack?'':'alert',btn:null})),
  orders:p=>v3().orders.filter(o=>o.pid===p.id&&!o.cs).map(o=>({txt:'Countersign: '+o.text,due:'By '+o.by,tone:'late',btn:['Countersign',`V3.countersign('${o.id}')`]})),
  checks:p=>v3().grid.filter(g=>g.pid===p.id&&g.st!=='done').slice(0,1).map(g=>({txt:g.label+' · next '+g.slot,due:v3().grid.filter(x=>x.pid===p.id&&x.st!=='done').length+' today',tone:'',btn:null})),
  labs:p=>v3().labs.filter(l=>l.pid===p.id&&!l.rev).map(l=>({txt:'Review lab: '+l.test,due:'New result',tone:'',btn:null})),
  approvals:p=>v3().apps.filter(a=>a.pid===p.id&&a.st==='open').map(a=>({txt:'Approve: '+a.kind,due:'From '+a.by,tone:'',btn:['Review',`go('#/floor/approvals')`]})),
  dailyNote:p=>((S.eod||{})[p.id]||{}).saved?[]:[{txt:'Daily note',due:'Today',tone:'',btn:['Write',`openNotesFor('${p.id}')`]}],
  meds:p=>{const c=typeof ptCtxOf==='function'?ptCtxOf(p.id):S,m=(c.meds||[]).filter(x=>/^\d-1-\d/.test(x.freq));return m.length?[{txt:'2 pm medicines: '+m.map(x=>x.name).join(', '),due:'2 pm',tone:'',btn:null}]:[]}
};
const dtObs=p=>((typeof EX!=='undefined'&&EX[p.id])||[])[0]||'Routine';
function dtRow(p,items,cfg,old){
  const mine=(old&&old.byPid[p.id])||[],oldTxt=mine.map(o=>o.txt).join(' ');
  /* the role's own task rows (full detail and every button) come first; add only what they do not already show */
  if(old)items=items.filter(i=>!i.go&&!oldTxt.includes(String(i.txt).replace(/^[^:]+:\s*/,'').slice(0,24)));
  const rank=mine.some(o=>o.alert)||items.some(i=>i.tone==='alert')?0:mine.some(o=>o.late||o.sign)||items.some(i=>i.tone==='late')?1:mine.length||items.length?2:3;
  const act=mine.length?null:items.find(i=>i.btn),tab=cfg.tab||'overview',overdue=mine.some(o=>o.late)||items.some(i=>i.overdue);
  const line=i=>{const m=String(i.txt).match(/^([^:]{2,22}):\s*(.*)$/),c=i.tone==='alert'?'color:var(--red)':i.tone==='late'?'color:var(--amber)':'';
    return `<div class="small" style="margin:3px 0;line-height:1.4;${c}">${m?`<b>${hesc(m[1])}:</b> ${hesc(m[2])}`:hesc(i.txt)}${i.due?` <span class="tiny muted">· ${hesc(i.due)}</span>`:''}</div>`;};
  const sx=p.sex||(PT_FILL[p.id]||[])[0]||'',ag=p.age||(PT_FILL[p.id]||[])[1]||'';
  return {rank,html:`<tr data-dt="${hesc((p.name+' '+p.room).toLowerCase())}" data-need="${rank<2?1:0}" data-new="${p.day<=1?1:0}" data-late="${overdue?1:0}" ${rank===0?'style="background:#fff7f6"':''}>
    <td><button class="lnk" style="font-weight:700;font-size:14px;text-align:left;white-space:nowrap" onclick="go('#/patient/${p.id}/${tab}')">${hesc(p.name)}</button><div class="tiny muted">${sx?sx+'/'+ag+' · ':''}Day ${p.day}${p.risk?' · <b style="color:var(--red)">High risk</b>':''}</div></td>
    <td class="small" style="overflow-wrap:anywhere">${hesc(p.room)}</td>
    <td class="small">${hesc(p.dx)}</td>
    ${cfg.team?`<td class="small">${hesc((V3.eff&&V3.eff('psy',p.id))||(PSYOF||{})[p.id]||'Unassigned')}</td>`:''}
    <td class="small" style="overflow-wrap:anywhere">${hesc(dtObs(p))}</td>
    <td>${mine.length||items.length?`<div class="dt-tasks">${mine.map(o=>o.html).join('')}</div>`+items.map(line).join(''):'<span class="small muted">Nothing due</span>'}</td>
    <td><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${act?`<button class="btn sm pri" style="white-space:nowrap" onclick="${act.btn[1]}">${act.btn[0]}</button>`:''}<button class="btn sm" onclick="go('#/patient/${p.id}/${tab}')">Open</button></div></td></tr>`};
}
/* one filter for the Tasks buttons and the table: all, new (admitted today or yesterday), late (overdue tasks), need (needs you now) */
function dtFilter(){const q=(($('dtQ')||{}).value||'').toLowerCase(),f=S.dtF||'all',key={new:'new',late:'late',need:'need'}[f];let n=0;
  document.querySelectorAll('#dtBody tr[data-dt]').forEach(r=>{const show=r.dataset.dt.includes(q)&&(!key||r.dataset[key]==='1');r.style.display=show?'':'none';if(show)n++;});
  const e=$('dtNone');if(e)e.style.display=n?'none':'';}
const DT_IC={people:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-1.6-4.8-4-5.6"></path></svg>',
  warn:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l9 16H3z"></path><path d="M12 10v4.5M12 17.2v.1"></path></svg>'};
const dtPill=(cls,ic,label,n,f)=>`<button class="task-summary-pill ${cls}" onclick="dtSet('${f}')" aria-pressed="${(S.dtF||'all')===f}" style="${(S.dtF||'all')===f?'box-shadow:0 0 0 2px currentColor':''}"><span class="task-pill-icon">${ic}</span><span>${label}</span><b>${n}</b></button>`;
function dtSet(f){S.dtF=(S.dtF||'all')===f?'all':f;render();}
/* the role's earlier dashboard, drawn once per render: source of its summary cards and its full task rows */
function dtBaseHtml(cfg){if(cfg._h===undefined){try{cfg._h=cfg.base?cfg.base():'';}catch(e){cfg._h='';}}return cfg._h;}
/* every task row of the earlier Tasks card, as it was (detail lines, assignee, status chip, all buttons), grouped by patient */
function dtOldRows(cfg,T){
  const h=dtBaseHtml(cfg);if(!h)return null;
  const d=document.createElement('div');d.innerHTML=h;const card=d.querySelector('#dashTasks');if(!card)return null;
  const out={byPid:{},other:[]};
  card.querySelectorAll('.li, .v3task-row').forEach(r=>{
    const txt=(r.textContent||'').replace(/\s+/g,' ').trim(),p=cfg.pts.find(x=>txt.includes(x.name));
    const title=((r.querySelector('.grow > div')||r.querySelector('b,strong')||{}).textContent||'').trim(),t=T.find(x=>dtTitle(x)===title);
    const btns=[...r.querySelectorAll('button')].map(b=>b.textContent.trim());
    if(p){const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))n.nodeValue=n.nodeValue.split(' · '+p.name).join('').split(p.name+' · ').join('');}
    const o={txt,html:r.outerHTML,alert:btns.includes('Acknowledge'),sign:btns.includes('Countersign'),late:!!(t&&t.late)};
    if(p)(out.byPid[p.id]=out.byPid[p.id]||[]).push(o);else out.other.push(o);
  });
  return out;
}
/* the role's own summary cards from its earlier dashboard (counts and boards that are not about one patient), kept as they were */
function dtKeep(cfg){
  if(!cfg.base||!cfg.keep)return '';
  const h=dtBaseHtml(cfg);if(!h)return '';
  const d=document.createElement('div');d.innerHTML=h;const out=[];
  [...d.querySelectorAll('section.card, .card')].filter(c=>!c.parentElement.closest('.card')).forEach(c=>{
    const t=(c.querySelector('h3')?.textContent||c.textContent).trim();
    if(cfg.keep.some(k=>t.startsWith(k))){const grid=cfg.grid&&cfg.grid.some(k=>t.startsWith(k))?c.parentElement:c;if(!out.includes(grid))out.push(grid);}
  });
  return out.map(e=>e.outerHTML).join('');
}
function dashTable(cfg){
  $('title').textContent='Inpatients';
  const T=tasks().filter(t=>!S.done[t.id]&&t.taskType!=='alert'&&t.taskType!=='countersign');
  const old=cfg.simple?null:dtOldRows(cfg,T);
  const rows=cfg.pts.map(p=>dtRow(p,cfg.items(p,T),cfg,old)).sort((a,b)=>a.rank-b.rank);
  const need=rows.filter(r=>r.rank<2).length;
  const other=T.filter(t=>!cfg.pts.some(p=>dtTitle(t).includes(p.name)));
  const day=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const tog=(on,l,f)=>`<button class="tog ${on?'on':''}" onclick="${f}">${l}</button>`;
  setTimeout(dtFilter,0);
  const lateN=rows.filter(r=>/data-late="1"/.test(r.html)).length; /* patients with an overdue task */
  const newN=cfg.pts.filter(p=>p.day<=1).length;
  const otherTasks=cfg.simple?'':(old&&old.other.length?`<div style="padding:10px 20px;border-bottom:1px solid var(--line-2,#eef1f5)"><div class="small muted" style="margin-bottom:4px">Also today</div><div class="dt-tasks">${old.other.map(o=>o.html).join('')}</div></div>`:other.length?`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center;padding:10px 20px;border-bottom:1px solid var(--line-2,#eef1f5)"><span class="small muted">Also today</span>${other.map(t=>`<button class="tog" onclick="${t.go?`go('${t.go}')`:`go('${cfg.otherGo||'#/myday'}')`}">${hesc(dtTitle(t))}${t.due?' · '+hesc(t.due):''}</button>`).join('')}</div>`:'');
  const taskSummary=cfg.simple?'':`<section class="card" id="dashTasks"><div class="hd"><div class="row" style="gap:10px;flex-wrap:wrap"><h3>Tasks</h3>${dtPill('patients',DT_IC.people,'My inpatients',cfg.pts.length,'all')}${dtPill('admit',DT_IC.people,'New admission',newN,'new')}${dtPill('overdue',DT_IC.warn,'Overdue tasks',lateN,'late')}</div></div></section>`;
  return `<div class="row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h2>Inpatient dashboard</h2><div class="muted" style="margin-top:4px">${day} · ${cfg.pts.length} patient${cfg.pts.length===1?'':'s'} · ${need} need${need===1?'s':''} you now</div></div><div class="row" style="gap:8px;flex-wrap:wrap">${cfg.btns||''}</div></div>
  ${taskSummary}
  ${cfg.simple?'':dtKeep(cfg)}
  <section class="card ptable">
    <div class="hd" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div class="row" style="gap:12px;flex-wrap:wrap;align-items:center"><div><h3>Patients</h3>${cfg.simple?`<div class="tiny muted">${cfg.pts.length} assigned</div>`:''}</div>${cfg.simple?`<div class="row" style="gap:8px;flex-wrap:wrap">${dtPill('admit',DT_IC.people,'New admission',newN,'new')}${dtPill('overdue',DT_IC.warn,'Overdue',lateN,'late')}</div>`:''}</div>
      <input class="input" id="dtQ" style="width:240px;min-height:38px;margin:0" placeholder="Search name or room" oninput="dtFilter()" aria-label="Search patients"></div>
    ${otherTasks}
    <div class="scroll"><table class="t pt" style="table-layout:fixed;width:100%;min-width:760px"><colgroup><col style="width:13%"><col style="width:8%"><col style="width:12%">${cfg.team?'<col style="width:12%">':''}<col style="width:9%"><col><col style="width:110px"></colgroup><thead><tr><th>Patient</th><th>Room</th><th>Diagnosis</th>${cfg.team?'<th>Psychiatrist</th>':''}<th>Observation</th><th>Due today</th><th></th></tr></thead>
    <tbody id="dtBody">${rows.map(r=>r.html).join('')}<tr id="dtNone" style="display:none"><td colspan="${cfg.team?7:6}" class="pad small muted">No patient matches</td></tr></tbody></table></div></section>`;
}
/* Dashboard and Inpatient dashboard are one page in this portal: the sidebar's Dashboard opens it */
const __dt_render=render;render=function(){if((location.hash||'').startsWith('#/existing/Dashboard')){location.replace('#/myday');return;}return __dt_render.apply(this,arguments);};
