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

  /* 18 Nov 2026: a real patient starts with no goals (the three demo goals and their ratings made a plan look started) */
  const defGoals=pid=>{const s=SNO(pid);if(!s.goals)s.goals=window.__realMode?[]:[{t:'Sleep at least 6 hours a night'},{t:'Take part in one group activity a day'},{t:'Talk about worries with the therapist'}];s.goals.forEach(g=>{if(g.start===undefined)g.start=2;if(g.aim===undefined)g.aim=8;});return s.goals;};
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
  /* 21 Nov 2026: goal as a 0 to 10 scale: filled path from the start to now, aim flag, start and now labelled */
  function goalChart(pid,i,x,n){
    const P=v=>Math.max(0,Math.min(10,+v))*10,up=n>=x.start,col=up?'#0e7c7b':'#b45309';
    const lo=Math.min(P(x.start),P(n)),w=Math.abs(P(n)-P(x.start));
    const lab=(v,t,top,c)=>'<span style="position:absolute;left:'+P(v)+'%;'+(top?'bottom:100%;margin-bottom:6px;':'top:100%;margin-top:6px;')+'transform:translateX(-50%);font-size:11px;font-weight:600;line-height:1;color:'+c+';white-space:nowrap">'+t+'</span>';
    let ticks='';for(let k=0;k<=10;k++)ticks+='<i style="position:absolute;left:'+k*10+'%;top:50%;width:1px;height:'+(k%5?'6px':'10px')+';margin-top:'+(k%5?'-3px':'-5px')+';background:#c5d3cf"></i>';
    return '<span aria-hidden="true" style="display:block;position:relative;height:10px;margin:22px 12px 24px;border-radius:99px;background:#e6eeeb">'+ticks
      +'<i style="position:absolute;left:'+lo+'%;width:'+w+'%;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,'+(up?'#7fc8c4':col)+','+col+')"></i>'
      +'<i style="position:absolute;left:'+P(x.aim)+'%;top:-8px;bottom:-8px;width:0;border-left:2px dashed #15803d"></i>'
      +'<i style="position:absolute;left:'+P(x.start)+'%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;border:2px solid #64748b;box-sizing:border-box"></i>'
      +'<i style="position:absolute;left:'+P(n)+'%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:'+col+';border:3px solid #fff;box-shadow:0 1px 5px rgba(14,124,123,.45);box-sizing:border-box"></i>'
      +lab(n,'Now '+n,true,col)+lab(x.start,'Start '+x.start,false,'#64748b')+lab(x.aim,'Aim '+x.aim,true,'#15803d')+'</span>';
  }
  function progress(pid){
    const g=defGoals(pid),sug=suggestions(pid),rg=rung(pid);
    return `<div class="tp-sec"><div class="tp-h">Suggested next steps</div>${sug.length?sug.map(x=>`<div class="tp-sug">${esc(x)}</div>`).join(''):'<div class="tp-ok"><span>✓</span>On track. No change needed to goals or homework.</div>'}</div>
      <div class="tp-sec"><div class="tp-h">Goals, in the patient's words <small>start, now, aim. Tap one for its history.</small></div>${g.map((x,i)=>{const n=nowOf(pid,i),lo=Math.min(x.start,n,x.aim),hi=Math.max(x.start,n,x.aim),pos=v=>Math.round((v-lo)/Math.max(1,hi-lo)*100),sp=pos(x.start),np=pos(n),d=n-x.start,say=d===0?'Not moved from '+x.start+' yet':(d>0?'Up ':'Down ')+Math.abs(d)+' from the start of '+x.start;return `<button class="tp-goal" style="grid-template-columns:minmax(140px,1fr) minmax(200px,1.5fr) 56px;gap:24px" onclick="tpGoal('${pid}',${i})"><span class="tp-gt"><b>${esc(x.t)}</b><em>${say}, aim ${x.aim}</em></span>${goalChart(pid,i,x,n)}</span><span class="tp-gn"><b>${n}</b><small>of ${x.aim}</small></span></button>`;}).join('')}</div>
      ${rg.length?`<div class="tp-sec"><div class="tp-h">Exposure ladder <small>carried forward every session</small></div>${rg.map(r=>`<div class="tp-rung ${r.m?'done':r.next?'next':''}"><span>${esc(r.l.text)}</span><b>${r.l.suds} / 100</b><em>${r.m?'Done':r.next?'Next step':''}</em></div>`).join('')}</div>`:''}`;
  }
  window.tpGoal=function(pid,i){
    const g=defGoals(pid)[i],r=ratings(pid,i);
    V3.modal(esc(g.t),'Start '+g.start+', aim '+g.aim,r.length?`<div class="pin-sum">${r.map(x=>`<div class="pin-r"><span>${esc(x.at)}</span><b>${x.v} / 10</b></div>`).join('')}</div>`:'<div class="small muted">No rating yet. It is rated in each signed session note.</div>',`<button class="btn pri" onclick="closeModal()">Close</button>`);
  };
  /* 21 Nov 2026 (owner): each kind of session has its own list: Individual, Group and Family notes no longer mix */
  const kindOf=n=>n.kind||(n.mod==='Family therapy'?'fam':'ind');
  function sessions(pid,kind){
    kind=kind||'ind';
    const notes=(SNO(pid).notes||[]).filter(n=>kindOf(n)===kind),legacy=kind==='ind'?((px(pid).th||{}).ind||[]).filter(r=>!r.struct):[];
    const rows=notes.map(n=>{const yes=Object.values(n.risk||{}).some(v=>v==='yes');return `<tr><td>${esc((n.at||'').split(',')[0])}</td><td>${esc(n.by)}</td><td>${esc(kind==='fam'?((n.blk||{}).who||n.mod):n.mod)}</td><td>${esc(n.mins||'')}</td><td>${yes?'<span class="chip c-red">Raised</span>':'<span class="chip c-green">None</span>'}</td><td>${n.status==='signed'?'<span class="chip c-green">Signed</span>':'<span class="chip c-amber">Draft</span>'}</td><td><button class="btn sm" onclick="snView('${n.id}')">Open</button></td></tr>`;}).concat(legacy.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.by)}</td><td>${esc(r.modality)}</td><td>${esc(r.mins)}</td><td class="muted">Before the new note</td><td></td><td></td></tr>`)).join('');
    const third=kind==='fam'?'Visitor':kind==='grp'?'Group':'Therapy';
    return `<div class="scroll"><table><thead><tr><th>Date</th><th>Therapist</th><th>${third}</th><th>Min</th><th>Risk check</th><th></th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="muted">No '+(kind==='fam'?'family':kind==='grp'?'group':'individual')+' session yet.</td></tr>'}</tbody></table></div><div class="tiny muted" style="margin-top:8px">Open shows the locked signed note. Only an addendum can be added.</div>`;
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

  /* 21 Nov 2026: group card as a small chart: five sessions oldest to newest with dates, attendance rate, last and next session */
  /* 21 Nov 2026: who attended and who did not, per session, read from every patient's group record (written by the Group sessions page) */
  const dKey=d=>String(d||'').split(' ').slice(0,2).join(' ');
  const tookC=t=>/Refus|not attend/i.test(t||'')?'x':/part/i.test(t||'')?'p':'a';
  function roster(group,dk){
    const out={a:[],p:[],x:[]};let L=[];try{L=allPts()||[];}catch(e){}
    L.forEach(p=>{try{const g=(SNO(p.id).grp||[]).find(r=>r.group===group&&dKey(r.date)===dk);if(g)out[tookC(g.took)].push({n:p.name,l:g.note||'',t:g.took});}catch(e){}});
    return out;
  }
  window.tpGrpSession=function(pid,group,dk,c){
    const ro=roster(group,dk),tot=ro.a.length+ro.p.length+ro.x.length;
    const sec=(t,col,arr,empty)=>'<div style="margin-top:12px"><div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px"><i style="width:10px;height:10px;border-radius:3px;background:'+col+'"></i>'+t+' <span style="color:#667085;font-weight:600">'+arr.length+'</span></div>'+(arr.length?arr.map(r=>'<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0 6px 18px;border-top:1px solid #eef2f6;font-size:13px"><span><b style="font-weight:600">'+esc(r.n)+'</b>'+(r.t&&!/^Attended$/.test(r.t)?' <small style="color:#667085">'+esc(r.t)+'</small>':'')+'</span><span style="color:#667085;text-align:right">'+esc(r.l)+'</span></div>').join(''):'<div style="padding:4px 0 0 18px;font-size:12.5px;color:#98a2b3">'+empty+'</div>')+'</div>';
    const me=pat(pid).name,lbl={a:'Attended',p:'Attended in part',x:'Refused or did not attend'}[c];
    const body=tot?sec('Attended','#16a34a',ro.a,'Nobody marked as attended.')+sec('Part of it','#f59e0b',ro.p,'Nobody.')+sec('Refused or did not attend','#dc2626',ro.x,'Nobody.')
      :'<div style="font-size:13.5px"><b>'+esc(me)+'</b>: '+lbl+'</div><div class="small muted" style="margin-top:8px">The full list of who came appears here once this session is marked on the Group sessions page.</div>';
    V3.modal(esc(group),esc(dk)+(tot?' · '+ro.a.length+' of '+tot+' attended':''),body,'<button class="btn pri" onclick="closeModal()">Close</button>');
  };
  const WD={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
  function groupCard(x,L,lab,line,pid){
    const name=x.g[0],recs=L.filter(r=>(r.group||'')===name).slice(0,5),wd=WD[String(x.g[1]).split(' ')[0].toLowerCase()];
    const fm=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}),fl=d=>d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
    const t=new Date();t.setHours(0,0,0,0);let last=new Date(t);while(wd!==undefined&&last.getDay()!==wd)last=new Date(last.getTime()-D1);
    const dateOf=k=>{const r=recs[k];if(r&&r.date)return String(r.date).replace(/ d{4}$/,'');return fm(new Date(last.getTime()-k*7*D1));};
    const next=new Date(last.getTime()+7*D1);
    const n=x.st.filter(c=>c==='a').length,pct=Math.round(n/x.st.length*100),col={a:'#16a34a',p:'#f59e0b',x:'#dc2626'},ht={a:'100%',p:'55%',x:'18%'};
    const cols=x.st.map((c,k)=>({c,k})).reverse().map(({c,k},i)=>{const dk=dateOf(k),ro=roster(name,dk),tot=ro.a.length+ro.p.length+ro.x.length;return '<button type="button" data-pid="'+esc(pid)+'" data-g="'+esc(name)+'" data-d="'+esc(dk)+'" data-c="'+c+'" onclick="tpGrpSession(this.dataset.pid,this.dataset.g,this.dataset.d,this.dataset.c)" title="'+dk+': '+lab[c]+'. Tap to see who attended" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;border:0;background:none;padding:4px 0 2px;border-radius:8px;cursor:pointer;font:inherit"><span style="height:64px;width:100%;display:flex;align-items:flex-end"><i style="display:block;width:100%;height:'+ht[c]+';border-radius:7px 7px 0 0;background:'+col[c]+';opacity:'+(k===0?1:.85)+';transform-origin:bottom;animation:tgbar .6s ease both;animation-delay:'+(i*70)+'ms"></i></span><span style="font-size:11px;color:#475467;font-weight:'+(k===0?700:500)+'">'+dk+'</span><span style="font-size:10.5px;color:'+col[c]+';font-weight:600">'+({a:'Came',p:'Part',x:'Refused'})[c]+'</span>'+(tot?'<span style="font-size:10.5px;color:#667085">'+ro.a.length+' of '+tot+' came</span>':'')+'</button>';}).join('');
    return '<article class="tg-c"><div class="tg-h"><div><b>'+name+'</b><span>Led by '+x.g[2]+'</span></div><span class="tg-when">'+x.g[1]+'</span></div>'
      +'<div style="display:flex;align-items:baseline;gap:10px;margin:10px 0 4px"><span style="font-size:28px;font-weight:800;line-height:1">'+n+'<small style="font-size:14px;font-weight:600;color:#667085"> of '+x.st.length+'</small></span><span class="chip '+(pct>=70?'c-green':pct>=40?'c-amber':'c-red')+'">'+pct+'% attended</span></div>'
      +'<div role="img" aria-label="Last '+x.st.length+' sessions, oldest to newest: '+x.st.slice().reverse().map(c=>lab[c]).join(', ')+'" style="display:flex;gap:8px;border-bottom:1px solid #cbd5e1;padding-bottom:6px">'+cols+'</div>'
      +'<style>@keyframes tgbar{from{transform:scaleY(0)}to{transform:scaleY(1)}}@media(prefers-reduced-motion:reduce){.tg-c i{animation:none!important}}</style>'
      +'<div style="display:flex;justify-content:space-between;gap:10px;margin-top:10px;font-size:12px;color:#475467"><span>Last session <b style="color:#101828">'+fl(last)+'</b></span><span>Next <b style="color:#101828">'+fl(next)+'</b></span></div>'
      +'<blockquote class="tg-q">'+esc(line(name))+'</blockquote></article>';
  }
  function group(pid){
    const th=(px(pid).th||{}).grp||[],mine=SNO(pid).grp;
    const hash=[...pid].reduce((a,c)=>a+c.charCodeAt(0),0);
    const strip=name=>{const L=mine.concat(th).filter(r=>(r.group||'')===name).slice(0,5).map(r=>/Refus|not attend/i.test(r.took||'')?'x':/part/i.test(r.took||'')?'p':'a');while(L.length<5){const k=(hash+L.length+name.length)%5;L.push(k===0?'p':k===1?'x':'a');}return L;};
    const line=name=>{const r=mine.concat(th).find(x=>(x.group||'')===name&&(x.note||x.pp));return r?(r.note||r.pp):'Joined in quietly.';};
    const all=GROUPS.map(g=>({g,st:strip(g[0])})),att=all.reduce((n,x)=>n+x.st.filter(c=>c==='a').length,0),tot=all.length*5;
    const lab={a:'Attended',p:'Part of it',x:'Refused'};
    return `<div class="tg-top"><div class="tg-sum"><b>${att} of ${tot}</b> recent sessions attended across ${all.length} groups</div><div class="tg-key"><span><i class="a"></i>Attended</span><span><i class="p"></i>Part of it</span><span><i class="x"></i>Refused</span></div></div>
      <div class="tg-grid">${all.map(x=>groupCard(x,mine.concat(th),lab,line,pid)).join('')}</div>
      ${(()=>{/* 19 Nov 2026: every attendance marked on the Group sessions page (or logged here), newest first */
        const L=mine.concat(th);if(!L.length)return '<div class="small muted" style="margin-top:12px">No group attendance marked yet. The psychologist marks it on the Group sessions page.</div>';
        return `<div class="tp-h" style="margin-top:14px">Attendance log</div><div class="scroll"><table><thead><tr><th>Date</th><th>Group</th><th>Took part</th><th>Marked by</th><th>Note</th></tr></thead><tbody>${L.map(r=>`<tr><td>${esc(r.date||'')}</td><td>${esc(r.group||'')}</td><td>${esc(r.took||'')}</td><td>${esc(r.by||'')}</td><td>${esc(r.note||'')}</td></tr>`).join('')}</tbody></table></div>`;})()}
      ${(SNO(pid).notes||[]).some(n=>kindOf(n)==='grp')?'<div class="tp-sec" style="margin-top:14px"><div class="tp-h">Group session notes</div>'+sessions(pid,'grp')+'</div>':''}<div class="tiny muted" style="margin-top:10px">Groups are run from the Group sessions page: pick the session, mark who attended, and it shows here.</div>`;
  }
  window.tpAttend=function(pid){
    V3.modal('Log attendance · '+esc(pat(pid).name),'One line for this patient.',`<div class="grid2"><label class="field"><span class="lbl">Group</span><select class="input" id="taG">${GROUPS.map(g=>`<option>${g[0]}</option>`).join('')}</select></label><label class="field"><span class="lbl">How he took part</span><select class="input" id="taT"><option>Attended</option><option>Attended in part</option><option>Refused</option></select></label></div><label class="field"><span class="lbl">One line</span><input class="input" id="taN" placeholder="e.g. spoke once, stayed to the end"></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="tpAttendSave('${pid}')">Save</button>`);
  };
  window.tpAttendSave=function(pid){
    const r={date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),group:$('taG').value,by:signer(),took:$('taT').value,note:($('taN').value||'').trim(),src:'Attendance'};
    SNO(pid).grp.unshift(r);closeModal();render();toast('Attendance logged for '+r.group);
  };

  /* 21 Nov 2026 (owner): every required contact has a View button and the card has View all: what was saved in the Call family pop-up
     (famState log: what, who, when, how it went, how long, what was said, topics covered) */
  const CALLK={c24:['24-hour call',/24 hour/i],c34:['Day 3 to 4 call',/day 3 to 4/i],wk:['Weekly update',/week/i],pre:['Pre-discharge session',/discharge/i],all:['All family calls',/./]};
  window.tpCalls=function(pid,key){
    const K=CALLK[key]||CALLK.all;let log=[];
    try{log=((window.__faApi&&__faApi.famState(pid))||{}).log||[];}catch(e){}
    const rows=log.filter(l=>key==='all'||K[1].test(l.what||''));
    const card=l=>{const parts=String(l.note||'').split(' · '),spoke=!/attempt/i.test(l.what||''),out=parts[0]||'',dur=/min/i.test(parts[1]||'')?parts[1]:'',said=parts.slice(dur?2:1).join(' · ');
      const dot=spoke?'#16a34a':'#98a2b3';
      return '<div style="display:grid;grid-template-columns:14px minmax(0,1fr);gap:12px;padding:12px 0;border-top:1px solid #eef2f6"><i style="width:10px;height:10px;border-radius:50%;background:'+dot+';margin-top:6px"></i><div>'
        +'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px"><b>'+esc(l.what||'Family contact')+'</b>'+(out?'<span class="chip '+(spoke?'c-green':'c-grey')+'">'+esc(out)+'</span>':'')+(dur?'<span class="chip c-grey">'+esc(dur)+'</span>':'')+'</div>'
        +'<div class="tiny muted" style="margin-top:2px">'+esc(l.by||'')+' · '+esc(l.at||'')+'</div>'
        +(said?'<div style="margin-top:6px;font-size:13.5px">'+esc(said)+'</div>':'')
        +((l.topics||[]).length?'<div class="mini-chips" style="margin-top:8px">'+l.topics.map(t=>'<span class="chip c-blue">'+esc(t)+'</span>').join('')+'</div>':'')
        +'</div></div>';};
    const body=rows.length?'<div style="max-height:60vh;overflow:auto">'+rows.map(card).join('')+'</div>':'<div class="small muted" style="padding:6px 0">Nothing logged yet. Use Call family on the dashboard or the patient page; it is saved here.</div>';
    V3.modal(esc(K[0])+' · '+esc(pat(pid).name),rows.length+' logged. Saved from the Call family pop-up.',body,'<button class="btn pri" onclick="closeModal()">Close</button>');
  };
  function family(pid){
    const fam=signed(pid).filter(n=>n.mod==='Family therapy'),done={};
    fam.forEach(n=>{(n.blk&&n.blk.topics||[]).forEach(t=>{done[t]={at:(n.at||'').split(',')[0],who:n.blk.who||'',und:n.blk.und||''};});});
    /* 19 Nov 2026: topics ticked in a family session logged in the Family sessions table count too (structured, not read from free text) */
    (((px(pid).th||{}).fam)||[]).forEach(r=>{(r.tlist||[]).forEach(t=>{if(!done[t])done[t]={at:r.date||'',who:r.who||'',und:''};});});
    const calls=(()=>{try{return JSON.parse(ptRun(pid,()=>JSON.stringify(S.calls||{})));}catch(e){return {};}})();
    const p=pat(pid),day=+p.day||0,wk=fam[fam.length-1]&&(Date.now()-(fam[fam.length-1].ts||0)<7*D1);
    const flag=(ok,due)=>ok?'<span class="chip c-green">Done</span>':due?'<span class="chip c-red">Due now</span>':'<span class="chip c-grey">Not yet due</span>';
    /* 19 Nov 2026: a call logged from Call family (dashboard or patient page, either clinician) ticks the required call here too */
    const fs=(()=>{try{return window.__faApi?(__faApi.famState(pid)||{}):{};}catch(e){return {};}})();
    const req=[['24-hour call',calls.h24==='done'||!!fs.c24,day>=1],['Day 3 to 4 call',calls.d34psych==='done'||calls.d34psy==='done'||!!fs.c34,day>=3],['Weekly update',!!wk||!!(fam.length&&fam[fam.length-1]),day>=7],['Pre-discharge session',false,false]];
    const contacts=(()=>{try{return JSON.parse(ptRun(pid,()=>JSON.stringify(S.contacts||[])));}catch(e){return [];}})();
    if(!contacts.length){try{const id=ptIdentity(p);if(id&&id.nr)contacts.push([id.nr,(id.rel||'Family')+' · nominated representative']);}catch(e){}}
    const comm=((px(pid).th||{}).comm||[]).slice(0,4);
    const told=SNO(pid).told;
    const nDone=TOPICS.filter(t=>done[t]).length;
    const st=r=>r[1]?'<span class="tf-st ok">Done</span>':r[2]?'<span class="tf-st due">Due now</span>':'<span class="tf-st">Not due yet</span>';
    /* 19 Nov 2026 (owner): the Sensitisation topics card is gone from here; topics are ticked in the Call family pop-up (block 140) */
    return `<div class="tf">
      <section class="tf-c"><div class="tf-h"><div><b>Required contact</b><span>Set at admission, ticks itself when logged</span></div><button class="btn sm" data-p="${esc(pid)}" data-k="all" onclick="tpCalls(this.dataset.p,this.dataset.k)">View all</button></div>${req.map((r,ri)=>'<div class="tf-r"><span>'+r[0]+'</span><span style="display:flex;align-items:center;gap:12px">'+st(r)+'<button class="btn sm" data-p="'+esc(pid)+'" data-k="'+['c24','c34','wk','pre'][ri]+'" onclick="tpCalls(this.dataset.p,this.dataset.k)">View</button></span></div>').join('')}</section>
      <section class="tf-c"><div class="tf-h"><div><b>Calls and WhatsApp</b><span>Through the Tulasi number</span></div></div>${comm.length?comm.map(c=>'<div class="tf-r"><span>'+esc(c.type)+' · '+esc(c.who)+'</span><span class="tf-d">'+esc(c.date)+'</span></div>').join(''):'<div class="tf-e">No contact logged yet.</div>'}</section>
</div><div class="tp-sec" style="margin-top:14px"><div class="tp-h">Family sessions</div>${sessions(pid,'fam')}</div>`;
  }
  window.tpTold=(pid,name,v)=>{SNO(pid).told[name]=v;toast('Saved: '+name+' may be told: '+v.toLowerCase());};
  /* 21 Nov 2026 (owner): the family concern box is a pop-up opened from the header button */
  window.tpGrievOpen=function(pid){V3.modal('Raise a grievance','Goes to the Patient Experience team.','<label class="field"><span class="lbl">What the family said</span><textarea class="input" id="tpConc" rows="4" placeholder="What the family said"></textarea></label>','<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="tpGriev(\''+pid+'\')">Raise a grievance</button>');};
  window.tpGriev=function(pid){const t=(($('tpConc')||{}).value||'').trim();if(!t){toast('Write the concern first');return;}S.pgriev=S.pgriev||[];S.pgriev.unshift({from:'Family',t:t.slice(0,90),via:'Family session',own:'Patient experience team',st:'Open',sla:'6 h left',src:'family',cat:'Psychologist',...whoAt()});closeModal();render();toast('Grievance raised for the patient experience team');};

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
      const sub=['progress','sessions'].map(k=>`<button class="tp-t ${s.sub===k?'on':''}" onclick="tpSub('${k}')">${{progress:'Progress',sessions:'Sessions',homework:'Homework'}[k]}</button>`).join('');
      /* 21 Nov 2026 (owner): no Progress/Sessions tabs and no add button on Individual; the sessions table sits below the progress content */
      inner=`${progress(pid)}<div class="tp-sec"><div class="tp-h">Individual sessions</div>${sessions(pid,'ind')}</div>`;
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
      if(s.seg==='fam'&&add&&!hd.querySelector('.tp-griev')){const gb=document.createElement('button');gb.className='btn tp-griev';gb.textContent='Raise a grievance';gb.setAttribute('onclick',"tpGrievOpen(S.pid)");add.parentNode.insertBefore(gb,add);}
      if((doc()&&s.seg!=='fam'||s.seg==='ind')&&add)add.remove();
      const sub={ind:'One-to-one sessions between the therapist and the patient',grp:'Group sessions: who came, and the latest line from each',fam:'Family sessions, topics covered, required contact and calls'}[s.seg];
      const sm=hd.querySelector('.small,.muted');if(sm)sm.textContent=sub+(doc()&&s.seg!=='fam'?' · read only for the psychiatrist':'');}
    /* plan sign-off by the Psychologist Lead (quality indicator): "Signed off by ... on ..." or "Awaiting sign-off", nudge after 48 hours */
    const x=px(pid),sg=x.tpSign,lead=/floor-lead-psychologist/.test(String((window.__TULASI__||{}).role||''));
    /* 18 Nov 2026: "Awaiting sign-off" only starts when the treating psychologist signs the management plan, and counts from that moment */
    const mpS=(x.mgmtPsych||{}).signed;
    if(window.__realMode){if(!sg&&!mpS)return;if(!x.tpPlanAt)x.tpPlanAt=(mpS&&mpS.ms)||Date.now();}
    else if(!x.tpPlanAt)x.tpPlanAt=Date.now()-3*86400000*(pid==='neel'?0:1);
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
  .tp-goal{grid-template-columns:minmax(0,1.5fr) minmax(160px,1fr) 64px;gap:22px;padding:14px 18px;border-radius:14px}
  .tp-gt{display:flex;flex-direction:column;gap:3px}.tp-gt b{font-size:14.5px;font-weight:650;color:#101828}.tp-gt em{font-style:normal;font-size:12.5px;color:#667085}
  .tp-rl{position:relative;height:18px;display:block}.tp-rl::before{content:'';position:absolute;left:0;right:0;top:7px;height:4px;border-radius:99px;background:#e3eaf3}
  .tp-rf{position:absolute;top:7px;height:4px;background:#1e6cdb;border-radius:99px}.tp-rs,.tp-ra,.tp-rn{position:absolute;top:50%;border-radius:50%;transform:translate(-50%,-50%)}
  .tp-rs{width:9px;height:9px;background:#fff;border:2px solid #9bb2d3}.tp-ra{width:12px;height:12px;background:#fff;border:2px solid #1f9d57}.tp-rn{width:16px;height:16px;background:#1e6cdb;border:3px solid #fff;box-shadow:0 0 0 1.5px #1e6cdb,0 2px 6px rgba(30,108,219,.35)}
  .tp-gn{display:flex;flex-direction:column;align-items:flex-end;line-height:1}.tp-gn b{font-size:22px;font-weight:700;color:#101828}.tp-gn small{font-size:11.5px;color:#667085;margin-top:3px}
  .tp-ok{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:#f1faf5;border:1px solid #cdebd9;color:#067647;font-size:13.5px;font-weight:600}.tp-ok span{display:inline-flex;width:20px;height:20px;border-radius:50%;background:#1f9d57;color:#fff;align-items:center;justify-content:center;font-size:12px}
  @media(max-width:700px){.tp-goal{grid-template-columns:1fr auto;gap:10px 14px}.tp-rl{grid-column:1/-1;order:3}}
  .tp-bar{height:8px;border-radius:99px;background:#e8eef7;overflow:hidden}.tp-bar i{display:block;height:100%;background:#1e6cdb;border-radius:99px}.tp-gn{font-size:12.5px;color:#475467;white-space:nowrap}
  .tp-rung{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:8px 12px;border:1px solid #e1e9f4;border-radius:10px;font-size:13.5px}.tp-rung em{font-style:normal;font-size:12px;font-weight:700;color:#175cd3;min-width:70px;text-align:right}.tp-rung.done{background:#f4fcf7;border-color:#bfe7d0}.tp-rung.next{border-color:#1e6cdb;background:#eef4ff}
  .tp-hw th,.tp-hw td{text-align:center}.tp-hw th:first-child,.tp-hw td:first-child{text-align:left}.tp-hw td.done{color:#067647;font-weight:800}.tp-hw td.partly{color:#b54708;font-weight:800}.tp-hw td.refused{color:#b42318;font-weight:800}.tp-hw .today{background:#f5f9ff}
  .tg-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:4px 0 12px}.tg-sum{font-size:13.5px;color:#475467}.tg-sum b{color:#101828;font-size:15px}
  .tg-key{display:flex;gap:14px;font-size:12px;color:#667085}.tg-key span{display:inline-flex;align-items:center;gap:6px}.tg-key i,.tg-pips i{display:inline-block;width:12px;height:12px;border-radius:4px}.tg-key i.a,.tg-pips i.a{background:#1f9d57}.tg-key i.p,.tg-pips i.p{background:#f5a524}.tg-key i.x,.tg-pips i.x{background:#e5484d}
  .tg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px}.tg-c{border:1px solid #e3eaf2;border-radius:14px;padding:14px 16px;background:#fff;display:flex;flex-direction:column;gap:12px}
  .tg-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.tg-h b{display:block;font-size:15px;font-weight:650;color:#101828;line-height:1.3}.tg-h span{font-size:12.5px;color:#667085}.tg-when{white-space:nowrap;font-weight:650;color:#1e5bb8!important;background:#eef4ff;border-radius:8px;padding:3px 9px;font-size:12px!important}
  .tg-att{display:flex;align-items:center;justify-content:space-between;gap:10px}.tg-pips{display:flex;gap:5px}.tg-pips i{width:22px;height:22px;border-radius:6px}.tg-n{font-size:12.5px;color:#667085}.tg-n b{font-size:16px;color:#101828}
  .tg-q{margin:0;padding:2px 0 2px 12px;border-left:3px solid #d5e1ef;font-size:13.5px;color:#344054;line-height:1.45}
  .tf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tf-wide{grid-column:1/-1}.tf-c{border:1px solid #e3eaf2;border-radius:14px;background:#fff;overflow:hidden}
  .tf-h{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #eef2f8}.tf-h b{display:block;font-size:14.5px;font-weight:650;color:#101828}.tf-h span{font-size:12.5px;color:#667085}.tf-n{white-space:nowrap}.tf-n b{display:inline!important;font-size:16px!important}
  .tf-bar{height:5px;background:#eaf0f7}.tf-bar i{display:block;height:100%;background:#1f9d57}.tf-topics{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0 18px;padding:6px 16px 10px}
  .tf-t{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#475467}.tf-t.on{color:#101828}.tf-t small{display:block;font-size:11.5px;color:#067647}
  .tf-ck{flex:none;width:20px;height:20px;border-radius:50%;border:1.5px solid #cfd8e4;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff}.tf-t.on .tf-ck{background:#1f9d57;border-color:#1f9d57}
  .tf-r{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 16px;border-top:1px solid #f1f5f9;font-size:13.5px;min-height:44px}.tf-r:first-of-type{border-top:0}.tf-r small{color:#667085;font-weight:500}.tf-d{font-size:12.5px;color:#667085;white-space:nowrap}
  .tf-st{font-size:12px;font-weight:700;color:#667085}.tf-st.ok{color:#067647}.tf-st.due{color:#b54708}.tf-e{padding:14px 16px;font-size:13px;color:#667085}
  @media(max-width:900px){.tf{grid-template-columns:1fr}}
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
