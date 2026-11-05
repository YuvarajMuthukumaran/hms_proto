
/* Floor lead only (5 Nov 2026): Alert audit log. Decided on the team call when the Escalation chain page was removed for the psychiatrist:
   "an audit log for each alert, for the admin and the floor lead, not at the doctor's level; it can feed into performance appraisals".
   The portal has no admin role yet, so for now only the floor lead sees it (Escalation chain > Audit log, and a sidebar entry under Alerts).
   One row per nurse alert: when it was raised and by whom, who answered it and after how many minutes (and whether that was inside the time
   allowed for that step), who it was escalated to, who saw the patient at the bedside, and where it stands now. Below the table, a summary per
   person, and a CSV download for appraisals. It only reads what the alert engine already records (v3().alerts); it changes nothing. */
(function(){
  const lead=()=>S.role==='lead';
  const RN={rmo:'RMO',psychiatrist:'Psychiatrist',lead:'Floor lead',nurse:'Nurse'};
  const css=document.createElement('style');css.id='lead-audit-css';
  css.textContent=`
  .au{display:flex;flex-direction:column;gap:14px}
  .au-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  .au-tile{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px}.au-tile b{display:block;font-size:24px;line-height:1.2;margin:4px 0 2px}.au-tile .d{font-size:12px;color:var(--muted)}
  .au-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .au-bar button.f{border:1px solid var(--line);background:#fff;border-radius:99px;padding:4px 12px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;color:var(--ink-2)}
  .au-bar button.f.on{background:var(--blue-tint);border-color:var(--blue);color:var(--blue-ink)}
  .au-t{width:100%;border-collapse:collapse;font-size:13px}.au-t th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);padding:8px 12px;white-space:nowrap}
  .au-t td{padding:9px 12px;border-top:1px solid var(--line-2);vertical-align:top}
  .au-ok{color:#067647;font-weight:600}.au-late{color:#b54708;font-weight:600}.au-bad{color:#d92d20;font-weight:600}
  @media (max-width:900px){.au-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
  document.head.appendChild(css);

  const med=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2);};
  const mins=n=>Math.round(n);
  const limitFor=(a,role)=>{const r=V3.sla(a.sev);return {rmo:r.rmo,psychiatrist:r.rmo+r.psy,lead:r.rmo+r.psy+r.lead}[role];};
  const st=()=>{S.alLog=S.alLog||{f:'all',who:''};return S.alLog;};

  function info(a){
    const ack=a.ack,took=ack?ack.t-a.t:null,lim=ack?limitFor(a,ack.role):null;
    const late=ack&&lim!=null&&took>lim?took-lim:0;
    const seenIn=a.seen?a.seen.t-a.t:null;
    let status,cls='';
    if(a.closed){status='Closed';}
    else if(!ack){const h=V3.holder(a);status='Not answered · with '+(RN[h]||h)+(a.overdue?' · overdue':'');cls='au-bad';}
    else if(!a.seen){status='Answered, not yet seen at the bedside';cls='au-late';}
    else{status='Seen at the bedside';cls='au-ok';}
    return {took,lim,late,seenIn,status,cls,esc:(a.esc||[]).map(e=>RN[e.to]||e.to)};
  }
  function rows(){
    const s=st(),all=v3().alerts.slice().sort((a,b)=>b.t-a.t);
    return all.filter(a=>{
      const i=info(a);
      if(s.who&&!(a.ack&&a.ack.by===s.who))return false;
      if(s.f==='open')return !a.closed&&!a.ack;
      if(s.f==='esc')return (a.esc||[]).length>0;
      if(s.f==='late')return i.late>0||(!a.ack&&a.overdue);
      if(s.f==='unseen')return !a.closed&&a.ack&&!a.seen;
      return true;
    });
  }
  window.auSet=function(k,v){st()[k]=v;render();};

  window.auCsv=function(){
    const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
    const head=['Raised at','Patient','Alert','Severity','Raised by','Answered by','Answered by (role)','Minutes to answer','Minutes late','Escalated to','Seen at bedside by','Minutes to reach the bedside','Status'];
    const lines=[head.map(q).join(',')];
    rows().forEach(a=>{const i=info(a);lines.push([V3.hm(a.t),V3.pn(a.pid),a.title,a.sev,a.by,a.ack?a.ack.by:'',a.ack?(RN[a.ack.role]||a.ack.role):'',i.took==null?'':mins(i.took),i.late?mins(i.late):0,i.esc.join('; '),a.seen?a.seen.by:'',i.seenIn==null?'':mins(i.seenIn),i.status].map(q).join(','));});
    const url=URL.createObjectURL(new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const l=document.createElement('a');l.href=url;l.download='alert-audit-log.csv';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast('Audit log downloaded');
  };

  const tabs=on=>`<div class="hn-tabs" style="margin:0 0 12px"><button class="${on==='live'?'on':''}" onclick="go('#/escalation')">Live chain</button><button class="${on==='log'?'on':''}" onclick="go('#/escalation/log')">Audit log</button></div>`;

  function page(){
    const s=st(),all=v3().alerts,R=rows();
    const acked=all.filter(a=>a.ack),times=acked.map(a=>a.ack.t-a.t);
    const escN=all.filter(a=>(a.esc||[]).length).length,lateN=all.filter(a=>{const i=info(a);return i.late>0||(!a.ack&&a.overdue);}).length;
    const tile=(l,v,d)=>`<div class="au-tile"><div class="small" style="font-weight:600">${l}</div><b>${v}</b><span class="d">${d}</span></div>`;
    const people=[...new Set(acked.map(a=>a.ack.by))].sort();
    const FL=[['all','All'],['open','Not answered'],['esc','Escalated past the RMO'],['late','Answered late'],['unseen','Not seen at the bedside']];
    const body=R.length?R.map(a=>{const i=info(a);
      return `<tr><td style="white-space:nowrap">${V3.hm(a.t)}</td><td><b>${hesc(V3.pn(a.pid))}</b></td><td>${hesc(a.title)}${a.detail?`<div class="tiny muted">${hesc(a.detail)}</div>`:''}<div class="tiny muted">${hesc(a.sev)}</div></td><td>${hesc(a.by||'')}</td>
        <td>${a.ack?`${hesc(a.ack.by)}<div class="tiny muted">${hesc(RN[a.ack.role]||a.ack.role)} · ${V3.hm(a.ack.t)}</div>`:'<span class="muted">Nobody yet</span>'}</td>
        <td>${i.took==null?'<span class="muted">–</span>':`<span class="${i.late?'au-late':'au-ok'}">${mins(i.took)} min</span>${i.late?`<div class="tiny au-late">${mins(i.late)} min after the allowed time</div>`:`<div class="tiny muted">inside ${i.lim} min</div>`}`}</td>
        <td>${i.esc.length?hesc(i.esc.join(' → ')):'<span class="muted">–</span>'}</td>
        <td>${a.seen?`${hesc(a.seen.by)}<div class="tiny muted">${V3.hm(a.seen.t)} · ${mins(i.seenIn)} min after it was raised</div>${a.seen.note?`<div class="tiny">${hesc(a.seen.note)}</div>`:''}`:'<span class="muted">–</span>'}</td>
        <td><span class="${i.cls}">${hesc(i.status)}</span></td></tr>`;}).join('')
      :`<tr><td colspan="9" class="small muted" style="padding:18px">No alerts match this filter.</td></tr>`;
    /* per person */
    const by={};acked.forEach(a=>{const k=a.ack.by,o=by[k]=by[k]||{role:a.ack.role,n:0,t:[],late:0,seen:0};o.n++;o.t.push(a.ack.t-a.t);if(info(a).late>0)o.late++;if(a.seen&&a.seen.by===k)o.seen++;});
    const ppl=Object.keys(by).sort().map(k=>{const o=by[k];return `<tr><td><b>${hesc(k)}</b></td><td>${hesc(RN[o.role]||o.role)}</td><td>${o.n}</td><td>${mins(med(o.t))} min</td><td class="${o.late?'au-late':''}">${o.late}</td><td>${o.seen}</td></tr>`;}).join('');
    return `<div class="au"><div><h2>Alert audit log</h2><div class="muted" style="margin-top:4px">Every nurse alert: who raised it, who answered it and how fast, who it was escalated to, and who saw the patient. For the floor lead only. Read it with the context of the shift; it is not a verdict on its own.</div></div>
      ${tabs('log')}
      <div class="au-tiles">${tile('Alerts raised',all.length,'in this log')}${tile('Median time to answer',med(times)==null?'–':mins(med(times))+' min','from raised to acknowledged')}${tile('Escalated past the RMO',escN,'went up the chain')}${tile('Answered late or not answered',lateN,'outside the time allowed')}</div>
      <section class="card"><div class="hd"><div class="au-bar">${FL.map(([k,l])=>`<button class="f ${s.f===k?'on':''}" onclick="auSet('f','${k}')">${l}</button>`).join('')}
          <select class="input" style="width:auto;min-height:32px;padding:2px 8px" aria-label="Answered by" onchange="auSet('who',this.value)"><option value="">Answered by anyone</option>${people.map(p=>`<option ${s.who===p?'selected':''}>${hesc(p)}</option>`).join('')}</select></div>
        <button class="btn sm" onclick="auCsv()">Download CSV</button></div>
        <div class="scroll"><table class="au-t"><thead><tr><th>Raised</th><th>Patient</th><th>Alert</th><th>Raised by</th><th>Answered by</th><th>Time to answer</th><th>Escalated to</th><th>Seen at bedside</th><th>Status</th></tr></thead><tbody>${body}</tbody></table></div></section>
      <section class="card"><div class="hd"><div><h3>By person</h3><div class="small muted" style="margin-top:4px">From the alerts above that were answered. For appraisals.</div></div></div>
        <div class="scroll"><table class="au-t"><thead><tr><th>Name</th><th>Role</th><th>Alerts answered</th><th>Median time to answer</th><th>Answered late</th><th>Seen at bedside</th></tr></thead><tbody>${ppl||'<tr><td colspan="6" class="small muted" style="padding:18px">Nothing answered yet.</td></tr>'}</tbody></table></div></section></div>`;
  }

  /* route: Escalation chain > Audit log (floor lead only) */
  const prevR=ROLE.lead.render;
  ROLE.lead.render=function(base){
    const r=(location.hash||'').slice(2).split('/');
    if(r[0]==='escalation'&&r[1]==='log'){renderSide(r);$('app').classList.remove('compact');$('title').textContent='Alert audit log';$('view').innerHTML=page();window.scrollTo(0,0);return;}
    return prevR?prevR(base):base();
  };
  /* tabs on the live chain page, and a sidebar entry under Alerts */
  const __e=V3.escPage;
  V3.escPage=function(){const h=__e.apply(this,arguments);return lead()?tabs('live')+h:h;};
  const prevSubs=ROLE.lead.subs;
  ROLE.lead.subs=function(sec,base){
    let b=prevSubs?prevSubs(sec,base):base(sec);
    const onLog=/^#\/escalation\/log/.test(location.hash||'');
    if(onLog)b=b.replace(/class="sub on" onclick="go\('#\/escalation'\)"/,'class="sub " onclick="go(\'#/escalation\')"');
    return b+`<button class="sub ${onLog?'on':''}" onclick="go('#/escalation/log')">Alert audit log</button>`;
  };
})();
