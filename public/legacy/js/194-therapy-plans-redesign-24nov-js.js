/* 24 Nov 2026, "Therapy Plans redesign.html" (owner): one layout for Individual, Group and Family: month calendar on the left
   with small marks per day, a rail on the right (plan / groups / required contact, then the day you tapped). Each item has an
   icon for its kind (session, goal, group, call, WhatsApp, family session). Psychiatrist and floor lead psychiatrist only;
   Individual and Group are read only for them, Family keeps Log a contact and Call family. Reads what is already saved:
   signed session notes and goal logs (psyx.sn), group attendance (sn.grp, th.grp), family calls/WhatsApp/sessions. */
(function(){
  /* 24 Nov, "Therapy Plans redesign ps.html": psychologist and floor lead psychologist get the same layout; they edit
     (tap a session to open the note, tap a goal to edit or log it, Add to groups / Log attendance). */
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const PSY=/psychologist/.test(ROLE);
  const E=s=>hesc(String(s==null?'':s)),Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const GC=['#2563eb','#0d9488','#7c3aed','#d97706','#c11574','#4e5ba6','#3b7c0f','#b42318'];
  const FK={call:'#2563eb',wa:'#16a34a',ses:'#7c3aed',miss:'#94a3b8'};
  const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const ST=window.__tp194=window.__tp194||{};
  const P='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  const IC={
    ses:P+'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    goal:P+'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    grp:P+'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    call:P+'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    wa:P+'<path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    fses:P+'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    due:P+'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    lock:P+'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'};
  const kOf=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
  function dayOf(r){
    if(r&&r.ts)return new Date(r.ts);
    const m=String((r&&(r.at||r.date||r.when))||'').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s*(\d{4})?/);
    if(m&&MON[m[2].toLowerCase()]!==undefined)return new Date(m[3]?+m[3]:new Date().getFullYear(),MON[m[2].toLowerCase()],+m[1]);
    const i=String((r&&(r.date||r.when))||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return i?new Date(+i[1],+i[2]-1,+i[3]):null;
  }
  const isNum=v=>v!==''&&v!=null&&!isNaN(+v);
  function met(g,v){
    if(g.type==='yn')return v==='yes'?1:0;
    let ok=false;
    if((g.type||'scale')==='scale'){const a=+(g.aim==null?8:g.aim),s=+(g.start==null?2:g.start);if(!isNum(v))return 0;ok=a>=s?+v>=a:+v<=a;if(!ok&&Math.abs(+v-a)<=Math.abs(a-s)/2)return .5;}
    else if(g.type==='choice'){const o=g.opts||[],i=o.indexOf(v),ai=o.indexOf(g.aimOpt);ok=i>=0&&i>=(ai<0?o.length-1:ai);if(!ok&&i>0)return .5;}
    else if(g.type==='num')ok=isNum(v)&&(g.dir==='atmost'?+v<=+g.aim:+v>=+g.aim);
    return ok?1:0;
  }
  const kindOf=n=>n.kind||(/family/i.test(n.mod||'')?'fam':/group/i.test(n.mod||'')?'grp':'ind');
  const day=()=>{const d=V3&&V3.now?new Date():new Date();d.setHours(0,0,0,0);return d;};

  /* ---------- data, per day key ---------- */
  function ind(pid){
    const sn=(psyPx(pid)||{}).sn||{},goals=sn.goals||[],by={},notes=(sn.notes||[]).filter(n=>n&&kindOf(n)==='ind');
    const add=(d,o)=>{if(!d)return;const k=kOf(d);(by[k]=by[k]||{ses:[],g:{}});o.ses?by[k].ses.push(o.ses):(by[k].g[o.i]=o.v);};
    notes.forEach(n=>{const d=dayOf(n);add(d,{ses:n});if(n.status==='signed')goals.forEach((g,i)=>{const v=(n.goalR||{})[i];if(v!==undefined&&v!==''&&v!==null)add(d,{i,v:{r:met(g,v),raw:v,by:n.by}});});});
    goals.forEach((g,i)=>((sn.goalLog||{})[i]||[]).forEach(r=>add(dayOf(r),{i,v:{r:met(g,r.v),raw:r.v,by:r.by,at:r.at}})));
    return {goals,notes,by};
  }
  function grp(pid){
    const x=psyPx(pid)||{},rows=((x.sn||{}).grp||[]).concat(((x.th||{}).grp)||[]),names=[],by={},tot={};
    rows.forEach(r=>{const nm=r.group||'Group';if(names.indexOf(nm)<0)names.push(nm);const d=dayOf(r);if(!d)return;
      const t=String(r.took||''),v=/refus|not attend/i.test(t)?0:/part|left/i.test(t)?.5:1;const k=kOf(d);(by[k]=by[k]||[]).push({i:names.indexOf(nm),v,r});
      tot[nm]=tot[nm]||[0,0];tot[nm][1]++;if(v)tot[nm][0]++;});
    return {names,by,tot};
  }
  function fam(pid){
    const x=psyPx(pid)||{},by={},all=[];
    const add=(d,o)=>{if(!d)return;o.d=d;(by[kOf(d)]=by[kOf(d)]||[]).push(o);all.push(o);};
    let log=[];try{log=((window.__faApi&&__faApi.famState(pid))||x.fam||{}).log||[];}catch(e){log=(x.fam||{}).log||[];}
    log.forEach(l=>{const ok=!/attempt|no answer|not reach/i.test((l.what||'')+' '+(l.note||''));add(dayOf(l),{t:ok?'call':'miss',h:l.what||'Family call',s:[l.by,l.note].filter(Boolean).join(' · ')+(ok?'':' · not reached'),c24:/24/.test(l.what||'')});});
    (((x.th||{}).comm)||[]).forEach(c=>{const wa=/whatsapp/i.test(c.type||'');add(dayOf({date:c.date}),{t:wa?'wa':'call',h:wa?'WhatsApp':(c.type||'Call'),s:[c.by,c.who,c.what||c.note||c.summary].filter(Boolean).join(' · ')});});
    ((x.sn||{}).notes||[]).filter(n=>n&&n.status==='signed'&&kindOf(n)==='fam').forEach(n=>add(dayOf(n),{t:'ses',h:'Family session',s:[n.by,(n.blk||{}).who,n.mins?n.mins+' min':''].filter(Boolean).join(' · ')}));
    (((x.th||{}).fam)||[]).forEach(r=>add(dayOf(r),{t:'ses',h:'Family session',s:[r.who,(r.tlist||[]).join(', ')].filter(Boolean).join(' · ')}));
    return {by,all};
  }

  /* ---------- pieces ---------- */
  const mk=(c,v,ic)=>`<i class="tp4-mk ${v===.5?'half':v===0?'no':''}" style="--k:${c}" title="${v===1?'Met':v===.5?'Part way':'Not met'}"></i>`;
  const tag=(c,ic,t,plan)=>`<span class="tp4-tag${plan?' plan':''}" style="--k:${c}">${IC[ic]||''}<span>${E(t)}</span></span>`;
  const fmtD=d=>d.getDate()+' '+MN[d.getMonth()].slice(0,3);
  function calendar(pid,seg,cell){
    const cm=ST['m'+pid]||(ST['m'+pid]=(()=>{const t=day();return {y:t.getFullYear(),m:t.getMonth()};})());
    const t=day(),first=new Date(cm.y,cm.m,1),n=new Date(cm.y,cm.m+1,0).getDate(),lead=(first.getDay()+6)%7,sel=ST['s'+pid];
    let h=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="tp4-dow">${d}</div>`).join('')+'<div class="tp4-blank"></div>'.repeat(lead);
    for(let i=1;i<=n;i++){const d=new Date(cm.y,cm.m,i),k=kOf(d);
      const c=cell(d,k);h+=`<button type="button" style="--i:${i}" class="tp4-day${c?' has':''}${d.getDay()%6===0?' we':''}${d>t?' fut':''}${+d===+t?' today':''}${sel===k?' sel':''}" onclick="tp4Day('${Q(pid)}','${k}')" aria-label="${fmtD(d)}"><span class="n">${i}${+d===+t?'<em>Today</em>':''}</span>${c}</button>`;}
    return `<div class="tp4-nav"><button type="button" class="btn sm" onclick="tp4Mon('${Q(pid)}',-1)" aria-label="Previous month">‹</button><b>${MN[cm.m]} ${cm.y}</b><button type="button" class="btn sm" onclick="tp4Mon('${Q(pid)}',1)" aria-label="Next month">›</button></div><div class="tp4-cal">${h}</div>`;
  }
  const card=(title,right,body)=>`<div class="tp4-card"><div class="tp4-ch"><h3>${title}</h3>${right||''}</div><div class="tp4-cb">${body}</div></div>`;
  const selDay=pid=>{const k=ST['s'+pid]||kOf(day()),p=k.split('-');return {k,d:new Date(+p[0],+p[1],+p[2])};};
  const dayHead=(d)=>`${fmtD(d)}${+d===+day()?' <span class="tp4-sub">· Today</span>':''}`;
  const li=(a,b)=>`<div class="tp4-li"><span class="tp4-l">${a}</span><b>${b}</b></div>`;

  const gClick=(pid,i)=>PSY&&typeof window.tpGoal==='function'?` tp4-click" role="button" tabindex="0" title="Edit or log this goal" onclick="tpGoal('${Q(pid)}',${+i})"`:` tp4-click" role="button" tabindex="0" title="See this goal's history" onclick="tp4Goal('${Q(pid)}',${+i})"`;
  function vInd(pid){
    const D=ind(pid),x=psyPx(pid)||{},th=x.th||{},S0=selDay(pid);
    if(!D.goals.length&&!D.notes.length)return due(pid)+`<div class="tp4-card tp4-empty">${IC.ses}<h4>No therapy plan yet</h4><p>${PSY?'Write the first session note to start the plan and goals.':"The psychologist's plan, goals and session notes show here once they start."}</p>${PSY&&typeof window.snOpen==='function'?`<button class="btn sm pri" style="margin-top:10px" onclick="snOpen('${Q(pid)}','ind')">New session note</button>`:''}</div>`;
    /* a goal not met on 3 or more of the last 5 days it was logged */
    const warn=D.goals.map((g,i)=>{const L=Object.keys(D.by).map(k=>({k,v:D.by[k].g[i]})).filter(o=>o.v).sort((a,b)=>{const p=s=>s.split('-').map(Number);const A=p(a.k),B=p(b.k);return new Date(B[0],B[1],B[2])-new Date(A[0],A[1],A[2]);}).slice(0,5);const no=L.filter(o=>o.v.r===0).length;return no>=3?`"${E(g.t)}" not met ${no} of the last ${L.length} days`:'';}).filter(Boolean);
    const cell=(d,k)=>{const o=D.by[k];if(!o)return '';
      return o.ses.map(n=>tag(n.status==='signed'?'#334155':'#b45309','ses',n.mod||'Session')).join('')+(Object.keys(o.g).length?`<span class="tp4-ms">${Object.keys(o.g).map(i=>mk(GC[i%GC.length],o.g[i].r)).join('')}</span>`:'');};
    const legend=D.goals.map((g,i)=>`<span>${mk(GC[i%GC.length],1)}${E(g.t)}</span>`).join('')+`<span>${mk('#64748b',.5)}part</span><span>${mk('#64748b',0)}not met</span>`;
    const signed=D.notes.filter(n=>n.status==='signed'),last=D.notes[0]||{};
    const o=D.by[S0.k]||{ses:[],g:{}};
    const body=(o.ses.length?o.ses.map(n=>{const risk=Object.values(n.risk||{}).some(v=>v==='yes');return `<div class="tp4-li${n.id&&typeof window.snView==='function'?` tp4-click" role="button" tabindex="0" title="Open the full note" onclick="snView('${Q(n.id)}')"`:'"'}><span class="tp4-ic">${IC.ses}</span><span style="flex:1"><b>${E(n.mod||'Session')}</b><div class="tp4-sub">${E([n.by,n.mins?n.mins+' min':''].filter(Boolean).join(' · '))}</div></span><span class="tp4-chip ${risk?'amb':'grn'}">${risk?'Risk raised':'No risk'}</span></div><div class="tp4-txt">${E(n.summaryLine||n.summary||'')}</div>${n.status==='signed'?`<div class="tp4-lock">${IC.lock} Signed and locked. Read only.${n.id?` <button type="button" class="tp4-lk" onclick="tp4PrintNote('${Q(n.id)}')">Print note</button>`:''}</div>`:'<div class="tp4-lock">Draft, not signed yet.</div>'}`;}).join(''):'<div class="tp4-sub">No session this day.</div>')
      +(Object.keys(o.g).length?`<div class="tp4-l" style="margin:12px 0 4px">Goals</div>`+Object.keys(o.g).map(i=>{const v=o.g[i];return `<div class="tp4-li${gClick(pid,i)}><span style="display:flex;gap:7px;align-items:center">${mk(GC[i%GC.length],v.r)}${E((D.goals[i]||{}).t)}</span><span class="tp4-sub">${v.r===1?'Met':v.r===.5?'Part way':'Not met'} · ${E(v.raw)}</span></div>`;}).join(''):'');
    return (warn.length?`<div class="tp4-alert">${IC.goal}<span>${warn.join('<br>')}</span></div>`:'')+`<div class="tp4-grid">${card(IC.ses+' Sessions and goals',`<div class="tp4-legend">${legend}</div>`,calendar(pid,'ind',cell))}
      <div class="tp4-col">${card('Plan',`<span class="tp4-sub">${E(last.by||'')}</span>`,li('Therapy',E(th.mod||last.mod||'Not set'))+li('Frequency',E(th.freq||'Not set'))+li('Sessions',signed.length+' signed'+(D.notes.length>signed.length?' · '+(D.notes.length-signed.length)+' draft':''))+(D.goals.map((g,i)=>`<div class="tp4-li${gClick(pid,i)}><span style="display:flex;gap:7px;align-items:center">${mk(GC[i%GC.length],1)}${E(g.t)}</span><span class="tp4-sub">${PSY?'Edit':'History'}</span></div>`).join('')))}
      ${card(dayHead(S0.d),'',body)}</div></div>`;
  }
  function vGrp(pid){
    const D=grp(pid),S0=selDay(pid);
    if(!D.names.length)return `<div class="tp4-card tp4-empty">${IC.grp}<h4>Not in any group yet</h4><p>${PSY?'Log attendance to add the patient to a group.':'The psychologist adds the patient to groups once the plan is set.'}</p>${PSY&&typeof window.tpAttend==='function'?`<button class="btn sm pri" style="margin-top:10px" onclick="tpAttend('${Q(pid)}')">Log attendance</button>`:''}</div>`;
    const cell=(d,k)=>{const L=D.by[k];return L?`<span class="tp4-ms">${L.map(o=>mk(GC[o.i%GC.length],o.v)).join('')}</span>`:'';};
    const legend=D.names.map((n,i)=>`<span>${mk(GC[i%GC.length],1)}${E(n)}</span>`).join('')+`<span>${mk('#64748b',.5)}left early</span><span>${mk('#64748b',0)}did not attend</span>`;
    const L=D.by[S0.k]||[];
    const body=L.length?L.map(o=>`<div class="tp4-li"><span style="display:flex;gap:7px;align-items:center">${mk(GC[o.i%GC.length],o.v)}${E(D.names[o.i])}</span><span class="tp4-sub">${o.v===1?'Attended':o.v===.5?'Left early':'Did not attend'}${o.r.leader||o.r.by?' · '+E(o.r.leader||o.r.by):''}</span></div>${o.r.note?`<div class="tp4-txt">${E(o.r.note)}</div>`:''}`).join(''):'<div class="tp4-sub">No groups logged.</div>';
    return `<div class="tp4-grid">${card(IC.grp+' Group attendance',`<div class="tp4-legend">${legend}</div>`,calendar(pid,'grp',cell))}
      <div class="tp4-col">${card('Groups','',D.names.map((n,i)=>`<div class="tp4-li tp4-click" role="button" tabindex="0" title="See attendance for this group" onclick="tp4Grp('${E(Q(pid))}','${E(Q(n))}')"><span style="display:flex;gap:7px;align-items:center">${mk(GC[i%GC.length],1)}<b>${E(n)}</b></span><b>${(D.tot[n]||[0,0])[0]}/${(D.tot[n]||[0,0])[1]}</b></div>`).join(''))}
      ${card(dayHead(S0.d),'',body)}</div></div>`;
  }
  function vFam(pid){
    const D=fam(pid),S0=selDay(pid),t=day();
    const IK={call:'call',miss:'call',wa:'wa',ses:'fses'},LB={call:'Call',miss:'Not reached',wa:'WhatsApp',ses:'Session'};
    const reached=D.all.filter(o=>o.t!=='miss'),wk=reached.filter(o=>t-o.d<=7*864e5);
    const c24=reached.find(o=>o.c24)||reached.slice().sort((a,b)=>a.d-b.d)[0],fs=reached.find(o=>o.t==='ses');
    const pxn=D.all.filter(o=>/\bPX\b|experience/i.test(o.s||'')).length;
    const req=[[c24?'done':'due','24-hour family call',c24?'Done '+fmtD(c24.d):'Not logged yet',c24?kOf(c24.d):''],[wk.length?'done':'due','Weekly update',wk.length?'Last '+fmtD(wk.sort((a,b)=>b.d-a.d)[0].d):'Due this week',wk.length?kOf(wk[0].d):''],[fs?'done':'later','Family session',fs?'Done '+fmtD(fs.d):'Not held yet',fs?kOf(fs.d):''],['later','PX calls',pxn+' logged this stay','']];
    const cell=(d,k)=>{const L=D.by[k]||[];let h=L.map(o=>tag(FK[o.t],IK[o.t],LB[o.t])).join('');if(+d===+t&&!wk.length)h+=tag('#b45309','due','Update due',1);return h;};
    const legend=[['call','Call'],['wa','WhatsApp'],['ses','Session'],['miss','Not reached']].map(x=>`<span><span class="tp4-li-ic" style="color:${FK[x[0]]}">${IC[IK[x[0]]]}</span>${x[1]}</span>`).join('');
    const L=D.by[S0.k]||[];
    const body=L.length?L.map(o=>`<div class="tp4-ev"><span class="tp4-ic" style="color:${FK[o.t]}">${IC[IK[o.t]]}</span><span><b>${E(o.h)}</b><span class="tp4-sub">${E(o.s)}</span></span></div>`).join(''):'<div class="tp4-sub">No family contact this day.</div>';
    return `<div class="tp4-grid">${card(IC.call+' Family contact',`<div class="tp4-legend">${legend}</div>`,calendar(pid,'fam',cell))}
      <div class="tp4-col">${card('Required contact','',req.map(r=>`<div class="tp4-req ${r[0]}${r[3]?' tp4-click':''}"${r[3]?` role="button" tabindex="0" onclick="tp4Pick('${E(Q(pid))}','${r[3]}')"`:''}><span class="tp4-tick ${r[0]}">${r[0]==='done'?'✓':''}</span><span><b>${r[1]}</b><span class="tp4-sub">${E(r[2])}</span></span></div>`).join(''))}
      ${card(dayHead(S0.d),'',body)}</div></div>`;
  }

  /* 24 Nov, "Therapy Plans redesignn.html": what the combined prototype adds: print buttons, goal and group history pop-ups,
     family required-contact rows open their day, PX calls row, Start family session, a "Due" card before the plan exists */
  const ptP=pid=>(typeof ptFind==='function'&&ptFind(pid))||null;
  const rt=v=>v===1?'Met':v===.5?'Part way':'Not met';
  const pdf=(t,h,pid)=>{if(typeof psyPdf==='function')psyPdf(t,h,ptP(pid));else window.print();};
  const tbl=(h,r)=>'<table style="width:100%"><tr>'+h.map(c=>'<th>'+E(c)+'</th>').join('')+'</tr>'+r.map(a=>'<tr>'+a.map(c=>'<td>'+E(c)+'</td>').join('')+'</tr>').join('')+'</table>';
  const noteHtml=n=>'<div class="n"><div class="h"><span>'+E(n.mod||'Session')+'</span><span>'+E(n.at||'')+'</span></div><div class="m">'+E([n.by,n.mins?n.mins+' min':'',n.status==='signed'?'Signed '+(n.signedAt||''):'Draft'].filter(Boolean).join(' · '))+'</div><div class="s">'+E(n.summaryLine||n.summary||n.outcome||'')+'</div>'+((n.addenda||[]).map(a=>'<div class="s"><b>Addendum, '+E(a.by)+', '+E(a.at)+'</b>'+E(a.text)+'</div>').join(''))+'</div>';
  const famRows=pid=>fam(pid).all.slice().sort((a,b)=>a.d-b.d).map(o=>[fmtD(o.d),{call:'Call',miss:'Not reached',wa:'WhatsApp',ses:'Family session'}[o.t],o.h,o.s]);
  const lastOf=(D,i)=>Object.keys(D.by).filter(k=>D.by[k].g[i]).map(k=>{const p=k.split('-').map(Number);return {d:new Date(p[0],p[1],p[2]),v:D.by[k].g[i]};}).sort((a,b)=>b.d-a.d);
  function due(pid){
    return `<div class="tp4-card tp4-due"><div class="tp4-ch"><h3>${IC.due} Due</h3></div><div class="tp4-cb"><div class="tp4-req due"><span class="tp4-tick due"></span><span><b>Detailed history</b><span class="tp4-sub">Within 72 hours of admission</span></span></div><div class="tp4-req"><span class="tp4-tick later"></span><span><b>Therapy plan and goals</b><span class="tp4-sub">Within 1 week of admission</span></span></div></div></div>`;
  }
  function tp4Bar(pid,seg){
    const b=(a,t)=>'<button type="button" class="btn sm" onclick="'+a+'">'+t+'</button>';
    let h='';
    if(seg==='fam'){h+=b("tp4Print('"+Q(pid)+"','fam')",'Print contact log');if(PSY&&typeof window.snOpen==='function')h+=b("snOpen('"+Q(pid)+"','fam')",'Start family session');}
    return h+b("tp4Print('"+Q(pid)+"','stay')",'Print stay record');
  }
  window.tp4Pick=function(pid,k){ST['s'+pid]=k;render();};
  window.tp4PrintNote=function(id){
    const x=((((psyPx(S.pid)||{}).sn||{}).notes)||[]).find(q=>q.id===id);
    if(!x||x.status!=='signed'){toast('Sign the note first. Drafts cannot be printed.');return;}
    pdf('Session note',noteHtml(x),S.pid);
  };
  window.tp4Print=function(pid,kind){
    if(kind==='fam'){const r=famRows(pid);pdf('Family contact log','<h2>Family contact</h2>'+(r.length?tbl(['Date','Type','What','Who / notes'],r):'<p>No family contact logged yet.</p>'),pid);return;}
    const I=ind(pid),G=grp(pid),x=psyPx(pid)||{},th=x.th||{},signed=I.notes.filter(n=>n.status==='signed').slice().reverse();
    const gr=I.goals.map((g,i)=>{const L=lastOf(I,i);return [g.t,L.length+' logged',L[0]?rt(L[0].v.r)+' ('+fmtD(L[0].d)+')':'Not logged yet'];});
    const att=G.names.map(n=>[n,(G.tot[n]||[0,0])[0]+' of '+(G.tot[n]||[0,0])[1]]);
    const fr=famRows(pid);
    pdf('Therapy record for the stay',
      '<h2>Therapy plan</h2>'+tbl(['Therapy','How often','Sessions'],[[th.mod||(I.notes[0]||{}).mod||'Not set',th.freq||'Not set',signed.length+' signed'+(I.notes.length>signed.length?', '+(I.notes.length-signed.length)+' draft':'')]])
      +'<h2>Goals</h2>'+(gr.length?tbl(['Goal','Logged','Latest'],gr):'<p>No goals set yet.</p>')
      +'<h2>Group attendance</h2>'+(att.length?tbl(['Group','Attended'],att):'<p>No group attendance logged yet.</p>')
      +'<h2>Family contact</h2>'+(fr.length?tbl(['Date','Type','What','Who / notes'],fr):'<p>No family contact logged yet.</p>')
      +'<h2>Session notes</h2>'+(signed.length?signed.map(noteHtml).join(''):'<p>No signed session notes yet.</p>'),pid);
  };
  window.tp4Goal=function(pid,i){
    const D=ind(pid),g=D.goals[i];if(!g)return;const L=lastOf(D,i);
    V3.modal(E(g.t),'Goal history · read only',
      '<div class="pin-sum"><div class="pin-r"><span>Logged</span><b>'+L.length+' times</b></div><div class="pin-r"><span>Met</span><b>'+L.filter(o=>o.v.r===1).length+'</b></div><div class="pin-r"><span>Latest</span><b>'+(L[0]?rt(L[0].v.r):'Not logged yet')+'</b></div></div>'
      +(L.length?'<div class="scroll" style="margin-top:10px">'+tbl(['Date','Rating','Value','By'],L.map(o=>[fmtD(o.d),rt(o.v.r),o.v.raw,o.v.by||'']))+'</div>':'<div class="tp4-sub" style="margin-top:10px">Not logged yet.</div>'),
      '<button class="btn" onclick="closeModal()">Close</button>');
  };
  window.tp4Grp=function(pid,name){
    const x=psyPx(pid)||{},R=(((x.sn||{}).grp)||[]).concat(((x.th||{}).grp)||[]).filter(r=>(r.group||'Group')===name);
    V3.modal(E(name),'Attendance and notes',R.length?'<div class="scroll">'+tbl(['Date','Took part','Marked by','Note'],R.map(r=>[r.date||'',r.took||'',r.leader||r.by||'',r.note||'']))+'</div>':'<div class="tp4-sub">Nothing logged yet.</div>','<button class="btn" onclick="closeModal()">Close</button>');
  };
  window.tp4Day=function(pid,k){ST['s'+pid]=k;render();};
  window.tp4Mon=function(pid,dir){const c=ST['m'+pid];if(!c)return;let m=c.m+dir,y=c.y;if(m<0){m=11;y--;}if(m>11){m=0;y++;}ST['m'+pid]={y,m};render();};

  function place(){
    if(!/^#\/patient\/[^/]+\/therapy/.test(location.hash||''))return;
    const body=document.querySelector('#view .tp-body'),pid=S.pid;if(!body||!pid||body.dataset.tp4)return;
    body.dataset.tp4='1';
    const seg=(S.tp&&S.tp.seg)||'ind',segs=body.querySelector('.tp-segs');
    const act=seg==='fam'?`<span style="display:flex;gap:8px">${typeof window.tpCommAdd==='function'?`<button class="btn sm" onclick="tpCommAdd('${Q(pid)}')">Log a contact</button>`:''}${typeof window.faCall==='function'?`<button class="btn sm pri" onclick="faCall('${Q(pid)}','wk')">${IC.call} Call family</button>`:''}</span>`:PSY?(seg==='grp'&&typeof window.tpAttend==='function'?`<button class="btn sm" onclick="tpAttend('${Q(pid)}')">${IC.grp} Log attendance</button>`:''):`<span class="tp4-sub tp4-ro">${IC.lock} Read only for the psychiatrist</span>`;
    let html='';try{html=seg==='grp'?vGrp(pid):seg==='fam'?vFam(pid):vInd(pid);}catch(e){return;}
    const an=ST.last!==pid+seg;ST.last=pid+seg;body.classList.toggle('tp4-anim',an);body.innerHTML=`<div class="tp4-bar">${segs?segs.outerHTML:''}<span style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${act}${tp4Bar(pid,seg)}</span></div>${html}`;
  }
  const __r=render;render=function(){const r=__r.apply(this,arguments);try{place();}catch(e){}return r;};

  const css=document.createElement('style');css.id='tp4-css';
  css.textContent=[
    '.tp4-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:4px 0 12px}',
    '.tp4-ro{display:inline-flex;align-items:center;gap:6px}',
    '.tp4-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:14px;align-items:start}.tp4-col{display:grid;gap:14px}',
    '.tp4-card{background:#fff;border:1px solid #e5e9f0;border-radius:12px}',
    '.tp4-ch{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid #e5e9f0;flex-wrap:wrap}',
    '.tp4-ch h3{font-size:14px;margin:0;display:flex;align-items:center;gap:7px;color:#0f172a}.tp4-ch h3 svg{width:15px;height:15px;color:#2563eb}',
    '.tp4-cb{padding:12px 16px}',
    '.tp4-legend{display:flex;gap:6px 12px;flex-wrap:wrap;color:#64748b;font-size:12px;align-items:center}.tp4-legend>span{display:inline-flex;align-items:center;gap:5px}',
    '.tp4-mk{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--k);flex:none}',
    '.tp4-mk.half{background:linear-gradient(90deg,var(--k) 50%,#fff 50%);box-shadow:inset 0 0 0 1.5px var(--k)}.tp4-mk.no{background:#fff;box-shadow:inset 0 0 0 1.5px var(--k)}',
    '.tp4-nav{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-bottom:8px}.tp4-nav b{min-width:130px;text-align:center;font-size:13.5px}',
    '.tp4-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}',
    '.tp4-dow{font-size:11.5px;color:#64748b;text-align:center;padding-bottom:2px;font-weight:600}',
    '.tp4-day{all:unset;box-sizing:border-box;cursor:pointer;min-height:68px;border:1px solid #e5e9f0;border-radius:8px;padding:5px 6px;background:#fff;display:flex;flex-direction:column;gap:3px;overflow:hidden}',
    '.tp4-day:hover{border-color:#93b4f5}.tp4-day:focus-visible{outline:2px solid #2563eb;outline-offset:1px}',
    '.tp4-day .n{font-size:12px;font-weight:600;color:#334155}.tp4-day.fut{background:#fafbfd}.tp4-day.fut .n{color:#94a3b8}',
    '.tp4-day.today{box-shadow:0 0 0 2px #0f172a}.tp4-day.sel{border-color:#2563eb;background:#eef3ff}',
    '.tp4-ms{display:flex;gap:3px;flex-wrap:wrap}',
    '.tp4-tag{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:600;color:var(--k);background:color-mix(in srgb,var(--k) 12%,#fff);border-radius:4px;padding:1px 5px;max-width:100%;white-space:nowrap;overflow:hidden}',
    '.tp4-tag span{overflow:hidden;text-overflow:ellipsis}.tp4-tag svg{width:10px;height:10px;flex:none}.tp4-tag.plan{background:#fff;box-shadow:inset 0 0 0 1px var(--k)}',
    '.tp4-li{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #e5e9f0}.tp4-li:first-child{border-top:0;padding-top:0}',
    '.tp4-l{color:#64748b;font-size:12px}.tp4-sub{color:#64748b;font-size:12px;font-weight:400}.tp4-txt{padding:4px 0 8px;font-size:13px}',
    '.tp4-ic{width:26px;height:26px;border-radius:8px;background:#eef3ff;color:#2563eb;display:grid;place-items:center;flex:none}.tp4-ic svg{width:14px;height:14px}',
    '.tp4-li-ic{display:inline-flex}.tp4-li-ic svg{width:12px;height:12px}',
    '.tp4-chip{font-size:11.5px;border-radius:99px;padding:2px 9px;border:1px solid}.tp4-chip.grn{background:#ecfdf3;color:#15803d;border-color:#bbe5c8}.tp4-chip.amb{background:#fff6e6;color:#b45309;border-color:#f5c26b}',
    '.tp4-lock{display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b;background:#eef1f5;border-radius:6px;padding:6px 8px;margin-bottom:6px}',
    '.tp4-req{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid #e5e9f0}.tp4-req:first-child{border-top:0;padding-top:0}.tp4-req b{display:block}.tp4-req.due b{color:#b45309}',
    '.tp4-tick{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:700;flex:none}.tp4-tick.done{background:#15803d;color:#fff}.tp4-tick.due{box-shadow:inset 0 0 0 2px #f59e0b}.tp4-tick.later{box-shadow:inset 0 0 0 2px #cbd5e1}',
    '.tp4-ev{display:flex;gap:9px;padding:9px 0;border-top:1px solid #e5e9f0}.tp4-ev:first-child{border-top:0;padding-top:0}.tp4-ev b{display:block}',
    '.tp4-alert{display:flex;gap:8px;align-items:center;background:#fff6e6;border:1px solid #f5c26b;color:#b45309;border-radius:9px;padding:8px 12px;margin-bottom:12px;font-weight:500}',
    '.tp4-lk{margin-left:auto;border:0;background:none;color:#2563eb;font-weight:600;cursor:pointer;font-size:12px}','.tp4-due{margin-bottom:12px}',
    '.tp4-empty{text-align:center;padding:30px 20px;color:#64748b}.tp4-empty>svg{width:26px;height:26px;color:#2563eb}.tp4-empty h4{margin:6px 0 4px;font-size:14px;color:#0f172a}.tp4-empty p{margin:0 auto;max-width:360px}',
    /* calm motion: hover lift, tinted days with entries, one staggered fade-in when the patient or segment changes */
    '.tp4-day{transition:border-color .18s,box-shadow .18s,transform .18s,background .18s}.tp4-day:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(15,23,42,.07)}',
    '.tp4-click{cursor:pointer;border-radius:8px;margin:0 -8px;padding-left:8px;padding-right:8px;transition:background .15s}.tp4-click:hover{background:#f5f8ff}.tp4-click:focus-visible{outline:2px solid #2563eb}',
    '.tp4-day.has{background:#f8fbff}.tp4-day.has.sel,.tp4-day.sel{background:#eef3ff}',
    '.tp4-card{transition:box-shadow .2s}.tp4-card:hover{box-shadow:0 6px 18px rgba(15,23,42,.06)}',
    '.tp-segs button{transition:background .18s,color .18s}',
    '@keyframes tp4In{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes tp4Pop{from{transform:scale(0)}to{transform:scale(1)}}',
    '.tp4-anim .tp4-day{animation:tp4In .4s ease both;animation-delay:calc(var(--i)*12ms)}.tp4-anim .tp4-col>.tp4-card{animation:tp4In .45s ease both}.tp4-anim .tp4-col>.tp4-card+.tp4-card{animation-delay:.08s}',
    '.tp4-anim .tp4-cal .tp4-mk,.tp4-anim .tp4-cal .tp4-tag{animation:tp4Pop .3s cubic-bezier(.3,1.4,.6,1) both;animation-delay:calc(var(--i)*12ms + .2s)}',
    '.tp4-day.sel .tp4-mk{animation:tp4Pop .25s cubic-bezier(.3,1.4,.6,1)}',
    '@media(prefers-reduced-motion:reduce){.tp4-day,.tp4-card,.tp4-mk,.tp4-tag{animation:none!important;transition:none!important}.tp4-day:hover{transform:none}}',
    /* owner 24 Nov: calendar slightly bigger and easier to read */
    '.tp4-cal{gap:6px}.tp4-dow{font-size:12.5px;color:#334155;text-transform:uppercase;letter-spacing:.04em;padding:4px 0 6px}',
    '.tp4-day{min-height:96px;padding:7px 8px;gap:5px;border-radius:10px}.tp4-day .n{font-size:14px;display:flex;justify-content:space-between;align-items:center}',
    '.tp4-day .n em{font-style:normal;font-size:10.5px;font-weight:700;color:#fff;background:#0f172a;border-radius:99px;padding:1px 7px}',
    '.tp4-day.we:not(.has):not(.sel){background:#fafbfc}',
    '.tp4-cal .tp4-mk{width:13px;height:13px}.tp4-ms{gap:5px}.tp4-tag{font-size:11.5px;padding:2px 6px}.tp4-tag svg{width:11px;height:11px}',
    '.tp4-legend{font-size:12.5px}.tp4-legend .tp4-mk{width:11px;height:11px}.tp4-nav b{font-size:15px}.tp4-ch h3{font-size:15px}',
    '@media(max-width:960px){.tp4-grid{grid-template-columns:minmax(0,1fr)}}',
    '@media(max-width:600px){.tp4-day{min-height:50px}.tp4-tag{display:none}}'
  ].join('');
  document.head.appendChild(css);
})();
