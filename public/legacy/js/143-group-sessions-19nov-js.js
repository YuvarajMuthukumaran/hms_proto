/* 19 Nov 2026, Trello (meeting 19 Nov). Psychologist and floor lead psychologist only.
   "Group sessions" in the left rail (#/groups): pick the session type, date and who led it, then mark attendance for each patient
   from the full inpatient list (Attended, Part of it, Refused, Did not attend) with an optional line each.
   Save writes one line per marked patient into that patient's therapy record (psyx sn.grp), so it shows straight away in
   Therapy Plans > Group (attendance pips and the Attendance log) for the psychologist and, read only, the psychiatrist. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const TYPES=['Anxiety and stress group','Relapse prevention group','Yoga and relaxation','Social skills group','Psychoeducation group','Occupational therapy','Art and music therapy','Family psychoeducation group','Other'];
  const TOOK=[['Attended','Attended'],['Attended in part','Part of it'],['Refused','Refused'],['Did not attend','Did not attend']];
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const G={type:TYPES[0],other:'',date:iso(new Date()),by:'',note:'',q:'',marks:{},lines:{}};
  const ICON='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 15c2.8 0 5 2 5 5"/></svg>';
  const on=()=>/^#\/groups/.test(String(location.hash||''));
  const pts=()=>{let L=[];try{L=allPts();}catch(e){}if(!L||!L.length){try{L=[].concat(...Object.values(WARDS));}catch(e){L=[];}}const seen={};return L.filter(p=>p&&p.id&&!seen[p.id]&&(seen[p.id]=1)).slice(0,90);};
  /* 19 Nov (meeting): attendance by floor, 1st De-addiction, 2nd Male ward, 3rd Female ward; at most 90 patients (only people admitted now) */
  const FLN=[['1st floor','De-addiction ward'],['2nd floor','Male ward'],['3rd floor','Female ward']];
  const floorIdx=w=>/female/i.test(w||'')?2:/de-?addict/i.test(w||'')?0:1;
  const wardOf=pid=>{try{return Object.keys(WARDS).find(k=>WARDS[k].some(p=>p.id===pid))||'';}catch(e){return '';}};
  const sno=pid=>{const x=psyPx(pid);if(!x.sn)x.sn={ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8};x.sn.grp=x.sn.grp||[];return x.sn;};

  function side(){
    const dd=document.querySelector('#side .sgdd');if(!dd||dd.querySelector('[data-gs]'))return;
    const b=document.createElement('button');b.dataset.gs='1';b.title='Group sessions';b.setAttribute('aria-label','Group sessions');b.setAttribute('onclick',"go('#/groups')");
    b.innerHTML=`<span class="si">${ICON}</span><span class="sl">Group sessions</span>`;
    if(on()){dd.querySelectorAll('button.on').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-current');});b.className='on';b.setAttribute('aria-current','page');}
    const after=[...dd.querySelectorAll('button')].find(x=>/Daily notes/.test(x.textContent));(after?after.after(b):dd.appendChild(b));
  }

  function recent(){
    const by={};pts().forEach(p=>{let g=[];try{g=(psyPx(p.id).sn||{}).grp||[];}catch(e){}g.forEach(r=>{if(!r.sid)return;const s=by[r.sid]=by[r.sid]||{date:r.date,group:r.group,by:r.leader||r.by,n:0,att:0,ts:r.ts||0};s.n++;if(/^Attended/.test(r.took||''))s.att++;});});
    return Object.values(by).sort((a,b)=>b.ts-a.ts).slice(0,10);
  }
  function page(){
    if(!G.by)G.by=signer();
    const q=G.q.trim().toLowerCase(),L=pts().filter(p=>!q||(p.name||'').toLowerCase().includes(q)||String(p.room||'').toLowerCase().includes(q));
    const nMark=Object.keys(G.marks).length;
    const rowHtml=p=>{const m=G.marks[p.id]||'';return `<tr><td><b>${E(p.name)}</b><div class="tiny muted">${E(p.room||'')}${wardOf(p.id)?' · '+E(wardOf(p.id)):''}</div></td>
      <td><div class="seg gs-seg" role="group" aria-label="Attendance for ${E(p.name)}">${TOOK.map(t=>`<button type="button" class="${m===t[0]?'on':''}" aria-pressed="${m===t[0]}" onclick="gsMark('${E(p.id)}','${t[0]}')">${t[1]}</button>`).join('')}</div></td>
      <td><input class="input" style="min-height:36px" placeholder="One line (optional)" value="${E(G.lines[p.id]||'')}" oninput="gsLine('${E(p.id)}',this.value)"></td></tr>`;};
    const rows=FLN.map((f,i)=>{const g=L.filter(p=>floorIdx(wardOf(p.id))===i);if(q&&!g.length)return '';const mk=g.filter(p=>G.marks[p.id]).length;
      return `<tr><td colspan="3" style="background:#f8fafc"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><span><b>${f[0]}</b> <span class="small muted">${f[1]} · ${mk} of ${g.length} marked</span></span><button class="btn sm" onclick="gsAll(${i})">Mark all attended</button></div></td></tr>`+(g.map(rowHtml).join('')||'<tr><td colspan="3" class="small muted">Nobody on this floor.</td></tr>');}).join('');
    const rc=recent();
    return `<nav class="crumb"><a href="#/myday">Inpatients</a> / <strong>Group sessions</strong></nav>
      <div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px"><div><h2 style="font-size:26px">Group sessions</h2><div class="muted" style="margin-top:4px">Pick the session, mark who attended. It shows in each patient's Therapy Plans under Group.</div></div></div>
      <section class="card" style="margin-top:14px"><div class="hd"><h3>Session</h3></div><div class="pad grid2">
        <label class="field"><span class="lbl">Session type</span><select class="input" onchange="gsSet('type',this.value)">${TYPES.map(t=>`<option ${G.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
        ${G.type==='Other'?`<label class="field"><span class="lbl">Name of the session</span><input class="input" value="${E(G.other)}" oninput="gsSet('other',this.value,1)"></label>`:''}
        <label class="field"><span class="lbl">Date</span><input class="input" type="date" max="${iso(new Date())}" value="${E(G.date)}" onchange="gsSet('date',this.value)"></label>
        <label class="field"><span class="lbl">Led by</span><input class="input" value="${E(G.by)}" oninput="gsSet('by',this.value,1)"></label>
        <label class="field" style="grid-column:1/-1"><span class="lbl">Topic or note for the room (optional)</span><input class="input" value="${E(G.note)}" oninput="gsSet('note',this.value,1)" placeholder="e.g. Triggers and coping plans"></label></div></section>
      <section class="card" style="margin-top:14px"><div class="hd" style="flex-wrap:wrap;gap:8px"><div><h3>Attendance</h3><div class="small muted" style="margin-top:4px">${nMark} of ${pts().length} patients marked</div></div>
        <div class="row" style="gap:8px;flex-wrap:wrap"><input class="input" style="width:220px;min-height:36px" placeholder="Search name or room" value="${E(G.q)}" oninput="gsSet('q',this.value,0,1)"><button class="btn sm" onclick="gsAll()">Mark all attended</button><button class="btn sm" onclick="gsClear()">Clear</button></div></div>
        <div class="scroll"><table class="t"><thead><tr><th>Patient</th><th>Took part</th><th>Note</th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="small muted">No inpatient matches.</td></tr>'}</tbody></table></div>
        <div class="pad row" style="justify-content:flex-end;gap:8px;border-top:1px solid var(--line-2)"><span class="small muted" id="gsErr" style="color:var(--red);display:none"></span><button class="btn pri" onclick="gsSave()">Save attendance</button></div></section>
      <section class="card" style="margin-top:14px"><div class="hd"><h3>Recent sessions</h3></div><div class="scroll"><table class="t"><thead><tr><th>Date</th><th>Session</th><th>Led by</th><th>Attended</th></tr></thead><tbody>${rc.map(s=>`<tr><td>${E(s.date)}</td><td>${E(s.group)}</td><td>${E(s.by)}</td><td>${s.att} of ${s.n} marked</td></tr>`).join('')||'<tr><td colspan="4" class="small muted">No group session saved yet.</td></tr>'}</tbody></table></div></section>`;
  }
  const paint=()=>{const v=document.getElementById('view');if(v&&on()){v.innerHTML=page();try{document.getElementById('title').textContent='Group sessions';}catch(e){}}};
  window.gsSet=function(k,v,quiet,keepFocus){G[k]=v;if(quiet)return;if(keepFocus){const pos=document.activeElement&&document.activeElement.selectionStart;paint();const i=[...document.querySelectorAll('#view input')].find(x=>/Search name/.test(x.placeholder));if(i){i.focus();try{i.setSelectionRange(pos,pos);}catch(e){}}return;}paint();};
  window.gsMark=function(pid,t){if(G.marks[pid]===t)delete G.marks[pid];else G.marks[pid]=t;paint();};
  window.gsLine=function(pid,v){G.lines[pid]=v;};
  window.gsAll=function(i){pts().forEach(p=>{if((i===undefined||floorIdx(wardOf(p.id))===i)&&!G.marks[p.id])G.marks[p.id]='Attended';});paint();};
  window.gsClear=function(){G.marks={};G.lines={};paint();};
  window.gsSave=function(){
    const err=t=>{const e=document.getElementById('gsErr');if(e){e.textContent=t;e.style.display='inline';}};
    const ids=Object.keys(G.marks);if(!ids.length)return err('Mark at least one patient.');
    const group=G.type==='Other'?(G.other||'').trim():G.type;if(!group)return err('Write the name of the session.');
    if(!G.date)return err('Pick the date.');
    const d=new Date(G.date+'T12:00:00'),date=d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),sid='gs'+Date.now().toString(36),by=signer(),leader=(G.by||by).trim();
    ids.forEach(pid=>{const note=[(G.lines[pid]||'').trim(),G.note.trim()&&('Session: '+G.note.trim())].filter(Boolean).join(' · ');
      sno(pid).grp.unshift({sid,ts:Date.now(),date,group,by,leader,took:G.marks[pid],note,src:'Group session'});
      try{V3.log(pid,S.role,'note','Group session '+group+' on '+date+': '+G.marks[pid]+' (marked by '+by+')');}catch(e){}});
    const n=ids.length,att=ids.filter(p=>/^Attended/.test(G.marks[p])).length;
    G.marks={};G.lines={};G.note='';render();toast('Saved: '+group+', '+att+' of '+n+' attended. It shows in each patient\'s Therapy Plans.');
  };

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{side();if(on())paint();}catch(e){}return o;};
  try{side();}catch(e){}
})();
