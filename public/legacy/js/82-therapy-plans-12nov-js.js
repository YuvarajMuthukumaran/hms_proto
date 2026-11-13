/* 12 Nov 2026, Trello card 104: Therapy Plans redesign (Individual, Group, Family). Built from the card text; the prototype link could not be opened, so the look follows the portal.
   Psychologist: the Therapy Plans card keeps its title and the Start session / Record with AI scribe buttons. Inside, one switch Individual / Group / Family.
   - Individual: Progress (suggested next steps, goals with start / now / aim and the history on tap, the exposure ladder), Sessions (table with a risk check column, Open shows the locked note),
     Homework (week grid logged by the nurses, what got in the way, worksheets in English or Hindi).
   - Group: one table (group, when, lead, attendance strip, latest line, next session) and Log attendance.
   - Family: eight sensitisation topics (ticked when a signed family session covers them), required contact with due flags, the call log, who may be told what, a concern with Raise a grievance.
   - Automatic from a signed session note (77): goal ratings, ladder step, new homework on the nurses' list from tomorrow, the Rounds line, family topics.
   Nurses see Homework tonight on their board and tap Done / Partly / Refused. The psychiatrist's Rounds shows a short therapy card. Demo data only. */
(function(){
  const pgy=()=>S.role==='psychologist';
  const doc=()=>S.role==='psychiatrist'&&!/psycholog|patient-experience/.test(String((window.__TULASI__||{}).role||''));
  const nurse=()=>S.role==='nurse';
  const esc=s=>hesc(String(s==null?'':s));
  const px=pid=>psyPx(pid||S.pid);
  const SNO=pid=>{const x=px(pid);if(!x.sn)x.sn={ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8};const s=x.sn;s.hwLog=s.hwLog||{};s.hwWhy=s.hwWhy||{};s.told=s.told||{};s.grp=s.grp||[];return s;};
  const pat=pid=>PTS.find(p=>p.id===pid)||{id:pid,name:pid};
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const D1=86400000;
  const TOPICS=['What the illness is','How reassurance feeds it','Responding at home','Medicines','Relapse signs','Stigma','Caregiver self-care','Discharge plan'];
  const GROUPS=[['Anxiety and stress group','Tuesday 11:30','Kiran Mehra'],['Relapse prevention group','Thursday 11:30','Kiran Mehra'],['Yoga and relaxation','Friday 3:00 pm','Rahul Verma']];
  const st=()=>{S.tp=S.tp||{seg:'ind',sub:'progress'};return S.tp;};

  const defGoals=pid=>{const s=SNO(pid);if(!s.goals)s.goals=[{t:'Sleep at least 6 hours a night'},{t:'Take part in one group activity a day'},{t:'Talk about worries with the therapist'}];s.goals.forEach(g=>{if(g.start===undefined)g.start=2;if(g.aim===undefined)g.aim=8;});return s.goals;};
  const signed=pid=>(SNO(pid).notes||[]).filter(n=>n.status==='signed').slice().reverse(); /* oldest first */
  const ratings=(pid,i)=>signed(pid).map(n=>({at:n.at,v:(n.goalR||{})[i]})).filter(r=>r.v!==undefined&&r.v!==''&&r.v!==null);
  const nowOf=(pid,i)=>{const r=ratings(pid,i);return r.length?+r[r.length-1].v:defGoals(pid)[i].start;};

  function suggestions(pid){
    const out=[],g=defGoals(pid),s=SNO(pid),sg=signed(pid),p=pat(pid);
    g.forEach((x,i)=>{const r=ratings(pid,i).slice(-3);if(r.length===3&&r.every(y=>+y.v===+r[0].v))out.push('The goal "'+x.t+'" has stayed at '+r[0].v+' for 3 sessions. Try a different approach.');});
    const last=sg[sg.length-1];
    if(last&&(last.hwRev==='Partly done'||last.hwRev==='Not done'))out.push('The last homework was '+last.hwRev.toLowerCase()+'. Make the next one smaller and agree a time with the nurse.');
    const erp=s.ladder.length||(last&&last.mod==='ERP for OCD');
    if(erp){const d=s.ybocs?Math.round((Date.now()-new Date(s.ybocs).getTime())/D1):null;if(d===null||d>=14)out.push('Y-BOCS is due'+(d===null?'':' (last one '+d+' days ago)')+'.');}
    else if(/depress/i.test(p.dx||''))out.push('PHQ-9 is due this fortnight.');
    else if(/anxi/i.test(p.dx||''))out.push('GAD-7 is due this fortnight.');
    return out.slice(0,3);
  }
  function rung(pid){
    const lad=SNO(pid).ladder.slice().sort((a,b)=>a.suds-b.suds),sg=signed(pid);
    const mastered=id=>{const n=sg.filter(x=>x.mod==='ERP for OCD'&&x.blk&&x.blk.item===id).pop();return !!(n&&+n.blk.end<=0.5*(+n.blk.peak||0)&&n.blk.rp==='Yes');};
    return lad.map(l=>({l,m:mastered(l.id)})).map((x,i,a)=>Object.assign(x,{next:!x.m&&a.slice(0,i).every(y=>y.m)}));
  }
  /* homework items made by signed notes (on the nurses' list from the day after) */
  function homework(pid){return signed(pid).filter(n=>n.hwNew).map(n=>({id:n.id,text:n.hwNew,at:n.at,from:n.ts||0,time:'7 pm',log:SNO(pid).hwLog[n.id]=SNO(pid).hwLog[n.id]||{}}));}
  const days7=()=>Array.from({length:7},(_,i)=>{const d=new Date(Date.now()-(6-i)*D1);return {iso:iso(d),lab:d.toLocaleDateString('en-GB',{weekday:'short'}),today:i===6};});

  /* ---------------- bodies ---------------- */
  function progress(pid){
    const g=defGoals(pid),sug=suggestions(pid),rg=rung(pid);
    return `<div class="tp-sec"><div class="tp-h">Suggested next steps</div>${sug.length?sug.map(x=>`<div class="tp-sug">${esc(x)}</div>`).join(''):'<div class="small muted">Nothing to change. Goals and homework are on track.</div>'}</div>
      <div class="tp-sec"><div class="tp-h">Goals, in the patient's words <small>start, now, aim. Tap one for its history.</small></div>${g.map((x,i)=>{const n=nowOf(pid,i),pct=Math.max(0,Math.min(100,Math.round((n-x.start)/Math.max(1,x.aim-x.start)*100)));return `<button class="tp-goal" onclick="tpGoal('${pid}',${i})"><span class="tp-gt">${esc(x.t)}</span><span class="tp-bar"><i style="width:${pct}%"></i></span><span class="tp-gn">${x.start} → <b>${n}</b> → ${x.aim}</span></button>`;}).join('')}</div>
      ${rg.length?`<div class="tp-sec"><div class="tp-h">Exposure ladder <small>carried forward every session</small></div>${rg.map(r=>`<div class="tp-rung ${r.m?'done':r.next?'next':''}"><span>${esc(r.l.text)}</span><b>${r.l.suds} / 100</b><em>${r.m?'Done':r.next?'Next step':''}</em></div>`).join('')}</div>`:''}`;
  }
  window.tpGoal=function(pid,i){
    const g=defGoals(pid)[i],r=ratings(pid,i);
    V3.modal(esc(g.t),'Start '+g.start+', aim '+g.aim,r.length?`<div class="pin-sum">${r.map(x=>`<div class="pin-r"><span>${esc(x.at)}</span><b>${x.v} / 10</b></div>`).join('')}</div>`:'<div class="small muted">No rating yet. It is rated in each signed session note.</div>',`<button class="btn pri" onclick="closeModal()">Close</button>`);
  };
  function sessions(pid){
    const notes=SNO(pid).notes||[],legacy=((px(pid).th||{}).ind||[]).filter(r=>!r.struct);
    const rows=notes.map(n=>{const yes=Object.values(n.risk||{}).some(v=>v==='yes');return `<tr><td>${esc((n.at||'').split(',')[0])}</td><td>${esc(n.by)}</td><td>${esc(n.mod)}</td><td>${esc(n.mins||'')}</td><td>${yes?'<span class="chip c-red">Raised</span>':'<span class="chip c-green">None</span>'}</td><td>${n.status==='signed'?'<span class="chip c-green">Signed</span>':'<span class="chip c-amber">Draft</span>'}</td><td><button class="btn sm" onclick="snView('${n.id}')">Open</button></td></tr>`;}).concat(legacy.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.by)}</td><td>${esc(r.modality)}</td><td>${esc(r.mins)}</td><td class="muted">Before the new note</td><td></td><td></td></tr>`)).join('');
    return `<div class="scroll"><table><thead><tr><th>Date</th><th>Therapist</th><th>Therapy</th><th>Min</th><th>Risk check</th><th></th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="muted">No session yet.</td></tr>'}</tbody></table></div><div class="tiny muted" style="margin-top:8px">Open shows the locked signed note. Only an addendum can be added.</div>`;
  }
  function hwGrid(pid){
    const items=homework(pid),dys=days7();
    if(!items.length)return '<div class="small muted">No homework yet. The new homework you set in a signed session note appears here and on the nurses\' list from the next day.</div>';
    const sym=v=>v==='done'?'✓':v==='partly'?'½':v==='refused'?'✕':'';
    return `<div class="scroll"><table class="tp-hw"><thead><tr><th>Homework</th>${dys.map(d=>`<th class="${d.today?'today':''}">${d.lab}</th>`).join('')}</tr></thead><tbody>${items.map(h=>`<tr><td><b>${esc(h.text)}</b><div class="tiny muted">Set ${esc(h.at.split(',')[0])} · nurse prompt ${h.time}</div></td>${dys.map(d=>{const v=h.log[d.iso];return `<td class="${d.today?'today':''} ${v||''}">${d.today&&!v?'•':sym(v)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>
      ${items.map(h=>`<label class="field" style="margin-top:10px"><span class="lbl">What got in the way: ${esc(h.text)}</span><input class="input" value="${esc(SNO(pid).hwWhy[h.id]||'')}" oninput="tpWhy('${pid}','${h.id}',this.value)" placeholder="e.g. the ward was noisy in the evening"></label>`).join('')}
      <div class="row" style="gap:8px;margin-top:12px"><span class="small muted">Worksheets for the ward (no phones):</span><button class="btn sm" onclick="toast('Worksheet opened in English')">English</button><button class="btn sm" onclick="toast('Worksheet opened in Hindi')">Hindi</button></div>`;
  }
  window.tpWhy=(pid,id,v)=>{SNO(pid).hwWhy[id]=v;};
  window.tpHw=function(pid,id,v){const h=SNO(pid).hwLog;h[id]=h[id]||{};h[id][iso(new Date())]=v;render();toast('Homework logged by '+signer()+': '+v);};

  function group(pid){
    const th=(px(pid).th||{}).grp||[],mine=SNO(pid).grp;
    const hash=[...pid].reduce((a,c)=>a+c.charCodeAt(0),0);
    const strip=name=>{const L=mine.concat(th).filter(r=>(r.group||'')===name).slice(0,5).map(r=>/Refus/.test(r.took||'')?'x':/part/i.test(r.took||'')?'p':'a');while(L.length<5){const k=(hash+L.length+name.length)%5;L.push(k===0?'p':k===1?'x':'a');}return L;};
    const line=name=>{const r=mine.concat(th).find(x=>(x.group||'')===name&&(x.note||x.pp));return r?(r.note||r.pp):'Joined in quietly.';};
    return `<div class="scroll"><table><thead><tr><th>Group</th><th>When</th><th>Lead</th><th>Last 5</th><th>Latest line about the patient</th></tr></thead><tbody>${GROUPS.map(g=>`<tr><td><b>${g[0]}</b></td><td>${g[1]}</td><td>${g[2]}</td><td><span class="tp-dots">${strip(g[0]).map(c=>`<i class="${c}" title="${{a:'Attended',p:'Part',x:'Refused'}[c]}"></i>`).join('')}</span></td><td class="small">${esc(line(g[0]))}</td></tr>`).join('')}</tbody></table></div><div class="tiny muted" style="margin-top:8px">Groups are run from the group roster: one note for the room, one line for each patient.</div>`;
  }
  window.tpAttend=function(pid){
    V3.modal('Log attendance · '+esc(pat(pid).name),'One line for this patient.',`<div class="grid2"><label class="field"><span class="lbl">Group</span><select class="input" id="taG">${GROUPS.map(g=>`<option>${g[0]}</option>`).join('')}</select></label><label class="field"><span class="lbl">How he took part</span><select class="input" id="taT"><option>Attended</option><option>Attended in part</option><option>Refused</option></select></label></div><label class="field"><span class="lbl">One line</span><input class="input" id="taN" placeholder="e.g. spoke once, stayed to the end"></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="tpAttendSave('${pid}')">Save</button>`);
  };
  window.tpAttendSave=function(pid){
    const r={date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),group:$('taG').value,by:signer(),took:$('taT').value,note:($('taN').value||'').trim(),src:'Attendance'};
    SNO(pid).grp.unshift(r);closeModal();render();toast('Attendance logged for '+r.group);
  };

  function family(pid){
    const fam=signed(pid).filter(n=>n.mod==='Family therapy'),done={};
    fam.forEach(n=>{(n.blk&&n.blk.topics||[]).forEach(t=>{done[t]={at:(n.at||'').split(',')[0],who:n.blk.who||'',und:n.blk.und||''};});});
    const calls=(()=>{try{return JSON.parse(ptRun(pid,()=>JSON.stringify(S.calls||{})));}catch(e){return {};}})();
    const p=pat(pid),day=+p.day||0,wk=fam[fam.length-1]&&(Date.now()-(fam[fam.length-1].ts||0)<7*D1);
    const flag=(ok,due)=>ok?'<span class="chip c-green">Done</span>':due?'<span class="chip c-red">Due now</span>':'<span class="chip c-grey">Not yet due</span>';
    const req=[['24-hour call',calls.h24==='done',day>=1],['Day 3 to 4 call',calls.d34psych==='done',day>=3],['Weekly update',!!wk||!!(fam.length&&fam[fam.length-1]),day>=7],['Pre-discharge session',false,false]];
    const contacts=(()=>{try{return JSON.parse(ptRun(pid,()=>JSON.stringify(S.contacts||[])));}catch(e){return [];}})();
    const comm=((px(pid).th||{}).comm||[]).slice(0,4);
    const told=SNO(pid).told;
    return `<div class="tp-fam"><div><div class="tp-h">Sensitisation topics <small>ticked when a signed family session covers them</small></div>${TOPICS.map(t=>`<div class="tp-top ${done[t]?'on':''}"><span class="tp-tick">${done[t]?'✓':''}</span><span>${t}</span><em>${done[t]?esc(done[t].at)+(done[t].who?' · '+esc(done[t].who):'')+(done[t].und?' · '+esc(done[t].und.toLowerCase()):''):'Not covered yet'}</em></div>`).join('')}</div>
      <div><div class="tp-h">Required contact</div>${req.map(r=>`<div class="row small" style="justify-content:space-between;padding:6px 0;border-top:1px solid #eef2f8">${r[0]}${flag(r[1],r[2])}</div>`).join('')}
        <div class="tp-h" style="margin-top:14px">Call and WhatsApp log <small>through the Tulasi number</small></div>${comm.length?comm.map(c=>`<div class="small" style="padding:4px 0">${esc(c.date)} · ${esc(c.type)} · ${esc(c.who)}</div>`).join(''):'<div class="small muted">No contact logged yet.</div>'}
        <div class="tp-h" style="margin-top:14px">Family members and what each may be told</div>${contacts.map(c=>`<div class="row small" style="justify-content:space-between;gap:8px;padding:4px 0"><span>${esc(c[0])} <span class="muted">· ${esc(String(c[1]).split(' · ')[0])}</span></span><select class="input" style="max-width:200px;min-height:34px" onchange="tpTold('${pid}','${esc(c[0]).replace(/'/g,'')}',this.value)">${['Everything','Clinical updates only','Billing only','Nothing'].map(o=>`<option ${(told[c[0]]||(/Not for now/.test(c[2]||'')?'Nothing':'Everything'))===o?'selected':''}>${o}</option>`).join('')}</select></div>`).join('')||'<div class="small muted">No family contacts yet.</div>'}
        <div class="tp-h" style="margin-top:14px">Family concern</div><textarea class="input" id="tpConc" rows="2" placeholder="What the family said"></textarea><button class="btn sm" style="margin-top:6px" onclick="tpGriev('${pid}')">Raise a grievance</button></div></div>`;
  }
  window.tpTold=(pid,name,v)=>{SNO(pid).told[name]=v;toast('Saved: '+name+' may be told: '+v.toLowerCase());};
  window.tpGriev=function(pid){const t=(($('tpConc')||{}).value||'').trim();if(!t){toast('Write the concern first');return;}S.pgriev=S.pgriev||[];S.pgriev.unshift({from:'Family',t:t.slice(0,90),via:'Family session',own:'Patient experience team',st:'Open',sla:'6 h left',src:'family',cat:'Psychologist',...whoAt()});render();toast('Grievance raised for the patient experience team');};

  /* ---------------- the card ---------------- */
  window.tpSeg=v=>{st().seg=v;render();};
  window.tpSub=v=>{st().sub=v;render();};
  function build(){
    const v=$('view');if(!v||!(pgy()||doc())||!/^#\/patient\/[^/]+\/therapy/.test(location.hash||''))return;
    const card=[...v.querySelectorAll('section.card')].find(c=>/^Therapy Plans/.test(((c.querySelector('h3')||{}).textContent||'').trim()));
    if(!card||card.dataset.tp)return;card.dataset.tp='1';
    const pid=S.pid,s=st();
    const body=card.children[1];if(!body)return;
    const seg=['ind','grp','fam'].map(k=>`<button class="tp-s ${s.seg===k?'on':''}" onclick="tpSeg('${k}')">${{ind:'Individual',grp:'Group',fam:'Family'}[k]}</button>`).join('');
    let inner='';
    if(s.seg==='ind'){
      const sub=['progress','sessions','homework'].map(k=>`<button class="tp-t ${s.sub===k?'on':''}" onclick="tpSub('${k}')">${{progress:'Progress',sessions:'Sessions',homework:'Homework'}[k]}</button>`).join('');
      inner=`<div class="tp-tabs">${sub}</div>${s.sub==='progress'?progress(pid):s.sub==='sessions'?sessions(pid):hwGrid(pid)}`;
    }else inner=s.seg==='grp'?group(pid):family(pid);
    const nb=document.createElement('div');nb.className='tp-body';nb.innerHTML=`<div class="tp-segs">${seg}</div>${inner}`;
    body.replaceWith(nb);
    /* the main button changes with the type */
    const add=[...card.querySelectorAll('.hd button')].find(b=>/^Add$/.test(b.textContent.trim()||'')||/psyThAdd/.test(b.getAttribute('onclick')||''));
    if(add){const L={ind:['New session note',"snOpen(S.pid,'ind')"],grp:['Log attendance',"tpAttend(S.pid)"],fam:['Start family session',"snOpen(S.pid,'fam')"]}[s.seg];add.textContent=L[0];add.setAttribute('onclick',L[1]);}
    const sl=v.querySelector('#snList');if(sl)sl.remove();
    /* one main button per tab; the psychiatrist reads Individual and Group, and has full access to Family */
    const hd=card.querySelector('.hd');
    if(hd){[...hd.querySelectorAll('button')].forEach(b=>{if(b!==add)b.remove();});
      if(doc()&&s.seg!=='fam'&&add)add.remove();
      const sub={ind:'One-to-one sessions between the therapist and the patient',grp:'Group sessions: who came, and the latest line from each',fam:'Family sessions, topics covered, required contact and calls'}[s.seg];
      const sm=hd.querySelector('.small,.muted');if(sm)sm.textContent=sub+(doc()&&s.seg!=='fam'?' · read only for the psychiatrist':'');}
    /* plan sign-off by the Psychologist Lead (quality indicator): "Signed off by ... on ..." or "Awaiting sign-off", nudge after 48 hours */
    const x=px(pid),sg=x.tpSign,lead=/floor-lead-psychologist/.test(String((window.__TULASI__||{}).role||''));
    if(!x.tpPlanAt)x.tpPlanAt=Date.now()-3*86400000*(pid==='neel'?0:1);
    const hrsWait=Math.floor((Date.now()+((S.au||{}).skip||0)*3600000-x.tpPlanAt)/3600000);
    const so=document.createElement('div');so.className='tp-so '+(sg?'ok':'wait');
    so.innerHTML=sg?`<span>Signed off by <b>${esc(sg.by)}</b>, Psychologist Lead, on ${esc(sg.at)}</span>`:`<span><b>Awaiting sign-off</b> by the Psychologist Lead${hrsWait>=48?' · waiting '+hrsWait+' hours, the lead has been nudged':''}</span>${lead?`<button class="btn sm" onclick="lpBack('${pid}')">Updates needed</button><button class="btn sm pri" onclick="tpSignOff('${pid}')">Sign off the plan</button>`:''}`;
    nb.insertBefore(so,nb.firstChild);
    if(!sg&&hrsWait>=48){x.tpNudged=x.tpNudged||0;if(!x.tpNudged){x.tpNudged=1;try{V3.alert({pid,sev:'amber',title:'Therapy plan awaiting sign-off for '+hrsWait+' hours · '+pat(pid).name,detail:'Psychologist Lead to sign off.',src:'Quality',by:'System'});}catch(e){}}}
  }
  window.tpSignOff=function(pid){
    pinSign('Sign off the therapy plan · '+pat(pid).name,[['Signing as',signer()],['Role','Psychologist Lead']],()=>{px(pid).tpSign={by:signer(),at:atNow()};render();toast('Plan signed off. It counts in the quality indicator.');});};
  /* goals change materially: the plan goes back to Awaiting sign-off */
  window.tpPlanChanged=function(pid){const x=px(pid);if(x.tpSign){x.tpSign=null;x.tpPlanAt=Date.now();x.tpNudged=0;}};

  /* ---------------- nurse: homework tonight ---------------- */
  function nurseBoard(){
    const v=$('view');if(!v||!nurse()||v.querySelector('#hwTonight')||!/^#\/myday/.test(location.hash||''))return;
    const rows=[];
    /* new homework goes on the nurses' list from the next day */
    PTS.forEach(p=>{homework(p.id).filter(h=>!h.from||iso(new Date(h.from))<iso(new Date())).forEach(h=>{const t=h.log[iso(new Date())];rows.push({p,h,t});});});
    if(!rows.length)return;
    const sec=document.createElement('section');sec.className='card';sec.id='hwTonight';
    sec.innerHTML=`<div class="hd"><div><h3>Homework tonight</h3><div class="small muted" style="margin-top:4px">Set by the psychologist. Prompt at the time shown, then tap what happened.</div></div></div><div class="pad" style="display:flex;flex-direction:column;gap:8px">${rows.map(r=>`<div class="row small" style="justify-content:space-between;gap:10px;flex-wrap:wrap"><span><b>${esc(r.p.name)}</b> · ${esc(r.h.text)} <span class="tiny muted">· prompt ${r.h.time}</span></span><span class="row" style="gap:6px">${['done','partly','refused'].map(x=>`<button class="btn sm ${r.t===x?'pri':''}" onclick="tpHw('${r.p.id}','${r.h.id}','${x}')">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}<label class="btn sm" style="cursor:pointer">Photo of sheet<input type="file" accept="image/*" hidden onchange="toast('Photo of the paper sheet added for '+${JSON.stringify(esc(r.p.name))})"></label></span></div>`).join('')}</div>`;
    const first=v.querySelector('section.card');first?first.parentNode.insertBefore(sec,first):v.appendChild(sec);
  }

  /* ---------------- psychiatrist Rounds: therapy card ---------------- */
  function roundsCard(){
    if(!doc()||!/^#\/rounds/.test(location.hash||''))return;
    const grid=document.querySelector('#view .pr-grid');if(!grid||grid.querySelector('.pr-tp')||!S.focusPid)return;
    const pid=S.focusPid,sg=signed(pid),last=sg[sg.length-1],g=defGoals(pid),hwl=homework(pid);
    const risk=last&&Object.values(last.risk||{}).some(v=>v==='yes');
    const hwDone=hwl.filter(h=>h.log[iso(new Date())]).length;
    const fam=sg.filter(n=>n.mod==='Family therapy').length;
    const d=document.createElement('div');d.className='pr-tp';
    d.innerHTML=`<b>Therapy</b> · ${last?'last session '+esc((last.at||'').split(',')[0])+', '+esc(last.mod):'no signed session yet'}${risk?' · <span style="color:#b42318;font-weight:700">risk raised</span>':''}
      <div class="tp-mini">${g.map((x,i)=>`<span>${esc(x.t.split(' ').slice(0,3).join(' '))}<i style="width:${Math.max(0,Math.min(100,Math.round((nowOf(pid,i)-x.start)/Math.max(1,x.aim-x.start)*100)))}%"></i></span>`).join('')}</div>
      <div class="tiny muted">Homework tonight: ${hwl.length?hwDone+' of '+hwl.length+' logged':'none set'} · Family sessions: ${fam} signed</div>`;
    const host=grid.querySelector('.pr-sn');(host&&host.parentNode||grid.lastElementChild).appendChild(d);
  }

  const css=document.createElement('style');css.id='tp-12nov-css';
  css.textContent=`.tp-body{padding:14px 20px 18px;display:flex;flex-direction:column;gap:14px}
  .tp-segs,.tp-tabs{display:inline-flex;gap:3px;padding:4px;border:1px solid #d5e1ef;border-radius:12px;background:#f1f5fa;align-self:flex-start}
  .tp-body table:not(.tp-hw){width:100%;border-collapse:collapse}.tp-body table:not(.tp-hw) th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667085;font-weight:700;padding:9px 14px;background:#f8fafc;border-bottom:1px solid #e3eaf2;white-space:nowrap}.tp-body table:not(.tp-hw) td{padding:11px 14px;border-bottom:1px solid #eef2f8;vertical-align:middle;text-align:left;font-size:13.5px}.tp-body table:not(.tp-hw) tr:last-child td{border-bottom:0}.tp-body table:not(.tp-hw) td:nth-child(2),.tp-body table:not(.tp-hw) td:nth-child(3){white-space:nowrap}.tp-body .scroll{border:1px solid #e3eaf2;border-radius:12px;overflow:auto}.tp-dots{display:inline-flex;gap:5px;align-items:center}.tp-dots i{width:11px;height:11px}
  .tp-tabs{border:0;background:transparent;padding:0;border-bottom:1px solid #e3eaf2;border-radius:0;gap:20px;align-self:stretch;display:flex}
  .tp-tabs .tp-t{border-radius:0;padding:8px 2px;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;min-height:0;background:transparent!important;color:#667085;box-shadow:none}.tp-tabs .tp-t.on{color:#1e6cdb;border-bottom-color:#1e6cdb}
  #auScribeBtn{margin:0 0 8px auto!important;display:flex!important;width:auto!important;align-self:flex-end;font-size:13px;min-height:34px;padding:6px 12px}
  .tp-s,.tp-t{border:1px solid transparent;border-radius:9px;background:transparent;padding:8px 16px;font:inherit;font-size:13.5px;font-weight:650;color:#344054;cursor:pointer;min-height:38px;transition:background .15s,color .15s}
  .tp-s:hover,.tp-t:hover{background:#e3edfb;color:#1e5bb8}.tp-s.on,.tp-t.on{background:#1e6cdb;color:#fff;box-shadow:0 2px 5px rgba(30,108,219,.28)}
  .tp-t{padding:6px 12px;min-height:32px;font-size:13px}
  .tp-sec{display:flex;flex-direction:column;gap:8px}.tp-h{font-weight:800;font-size:14.5px}.tp-h small{font-weight:500;color:#667085;font-size:12px;margin-left:6px}
  .tp-sug{border-left:3px solid #d48806;background:#fffaf0;padding:8px 12px;border-radius:6px;font-size:13.5px}
  .tp-goal{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:12px;align-items:center;text-align:left;font:inherit;padding:10px 12px;border:1px solid #e1e9f4;border-radius:12px;background:#fff;cursor:pointer;transition:border-color .15s,transform .15s}.tp-goal:hover{border-color:#9ec0f7;transform:translateY(-1px)}
  .tp-bar{height:8px;border-radius:99px;background:#e8eef7;overflow:hidden}.tp-bar i{display:block;height:100%;background:#1e6cdb;border-radius:99px}.tp-gn{font-size:12.5px;color:#475467;white-space:nowrap}
  .tp-rung{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:8px 12px;border:1px solid #e1e9f4;border-radius:10px;font-size:13.5px}.tp-rung em{font-style:normal;font-size:12px;font-weight:700;color:#175cd3;min-width:70px;text-align:right}.tp-rung.done{background:#f4fcf7;border-color:#bfe7d0}.tp-rung.next{border-color:#1e6cdb;background:#eef4ff}
  .tp-hw th,.tp-hw td{text-align:center}.tp-hw th:first-child,.tp-hw td:first-child{text-align:left}.tp-hw td.done{color:#067647;font-weight:800}.tp-hw td.partly{color:#b54708;font-weight:800}.tp-hw td.refused{color:#b42318;font-weight:800}.tp-hw .today{background:#f5f9ff}
  .tp-dots{display:inline-flex;gap:5px}.tp-dots i{width:14px;height:14px;border-radius:50%;display:inline-block}.tp-dots i.a{background:#1f9d57}.tp-dots i.p{background:#d48806}.tp-dots i.x{background:#d9453d}
  .tp-top>span:nth-child(2){min-width:0}.tp-top em{white-space:normal;text-align:right;max-width:150px;line-height:1.3}.tp-fam>div{min-width:0}.tp-fam{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}@media(max-width:900px){.tp-fam{grid-template-columns:1fr}}
  .tp-top{display:grid;grid-template-columns:24px 1fr auto;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #eef2f8;font-size:13.5px}.tp-top em{font-style:normal;font-size:12px;color:#667085}.tp-top.on em{color:#067647}
  .tp-tick{width:22px;height:22px;border-radius:50%;border:1.5px solid #cfd8e4;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}.tp-top.on .tp-tick{background:#1f9d57;border-color:#1f9d57}
  .tp-so{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border-radius:10px;font-size:13.5px}.tp-so.ok{background:#ecfdf3;color:#067647}.tp-so.wait{background:#fffaeb;color:#b54708;border:1px solid #fedf89}
  .pr-tp{margin-top:8px;padding:10px 12px;border:1px solid #e1e9f4;border-radius:12px;background:#fafcff;font-size:13px}.tp-mini{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0}.tp-mini span{display:flex;flex-direction:column;gap:3px;font-size:11.5px;color:#475467;min-width:110px}.tp-mini i{display:block;height:5px;border-radius:99px;background:#1e6cdb}`;
  document.head.appendChild(css);

  const __r82=render;
  render=function(){const r=__r82.apply(this,arguments);try{build();nurseBoard();roundsCard();}catch(e){}return r;};
})();
