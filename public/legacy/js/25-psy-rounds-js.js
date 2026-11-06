
/* Psychiatrist only (5 Nov 2026): Rounds redesign (Trello "Resdesign rounds like this imo" and "In rounds, basic info is needed").
   Top bar with progress, ward order on the left, one patient header with the basic info strip (team, staff on duty, significant alerts,
   family / NR), "Since last round" next to ONE round note box (AI scribe is a small button, it fills the same box), medicine card with
   status pills, the monitoring / risk / referral cards as before, and a sticky bar that says what this round changes.
   Red is only for open alerts; amber for overdue, out of range and 1:1. The signed round note goes into Earlier notes (locked). */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-rounds-css';
  css.textContent=`
  .pr-top{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .pr-top .grow{min-width:220px}
  .pr-back{border:0;background:none;color:var(--blue);font:inherit;font-weight:600;cursor:pointer;padding:0}
  .pr-grid{display:grid;grid-template-columns:260px minmax(0,1fr);gap:16px;align-items:start}
  /* the ward order follows you down the page (it sits just under the sticky page header) */
  .pr-queue{position:sticky;top:88px;align-self:start;max-height:calc(100vh - 104px);overflow-y:auto}
  .pr-q{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px solid transparent;background:none;border-radius:10px;padding:8px 10px;cursor:pointer;font:inherit;color:var(--ink)}
  .pr-q:hover{background:var(--soft)}.pr-q.on{background:var(--blue-tint);border-color:#bcd4fa}
  .pr-dot{width:16px;height:16px;border-radius:50%;border:2px solid #b8c4d3;flex:0 0 16px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff}
  .pr-q.on .pr-dot{background:var(--blue);border-color:var(--blue)}.pr-q.seen .pr-dot{background:#11703a;border-color:#11703a}
  .pr-tag{margin-left:auto;font-size:10.5px;font-weight:700;border-radius:99px;padding:1px 8px;white-space:nowrap}
  .pr-tag.red{background:var(--red-bg);color:var(--red)}.pr-tag.amber{background:var(--amber-bg);color:var(--amber)}.pr-tag.blue{background:var(--blue-tint);color:var(--blue-ink)}
  .pr-head{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .pr-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .pr-ch{font-size:12px;border-radius:99px;padding:2px 10px;background:var(--grey-bg);color:var(--grey)}
  .pr-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid var(--line-2);margin:14px -20px -4px;padding:0 20px}
  .pr-info>div{padding:10px 12px 8px 0;font-size:12.5px;line-height:1.45;min-width:0}
  .pr-info .l{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
  .pr-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .pr-nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
  .pr-num{border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:var(--soft)}
  .pr-num b{display:block;font-size:17px}.pr-num span{font-size:11px;color:var(--muted)}.pr-num.amber{background:var(--amber-bg);border-color:var(--amber-line)}.pr-num.amber b{color:var(--amber)}
  .pr-lines{display:flex;flex-direction:column;gap:6px;margin-top:12px;font-size:13px}.pr-lines b{display:inline-block;width:92px;color:var(--muted);font-weight:600}
  .pr-note{width:100%;min-height:170px;resize:vertical}
  .pr-st{font-size:11px;font-weight:700;border-radius:99px;padding:2px 9px;white-space:nowrap}
  .pr-st.cont{background:var(--grey-bg);color:var(--grey)}.pr-st.chg{background:var(--amber-bg);color:var(--amber)}.pr-st.stop{background:var(--grey-bg);color:var(--grey);text-decoration:none}.pr-st.new{background:var(--blue-tint);color:var(--blue-ink)}
  .pr-bar{position:sticky;bottom:0;z-index:20;display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:space-between;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 16px;box-shadow:0 -6px 18px rgba(15,23,42,.06)}
  /* vitals as plain text, not boxes (Nikita and Anu, 5 Nov): normal values are quiet, the ones to look at are coloured and bold */
  .pr-vit{display:flex;flex-wrap:wrap;gap:6px 24px;font-size:14px}
  .pr-vi .l{color:var(--muted);font-size:12.5px}.pr-vi b{font-weight:500;color:var(--ink-2)}.pr-vi .u{color:var(--muted);font-size:12px}
  .pr-vi.warn b{color:#b54708;font-weight:700}.pr-vi.bad b{color:#d92d20;font-weight:700}
  /* medicine card: tighter, up to ten medicines fit */
  .pr-med .t td{padding-top:7px;padding-bottom:7px}
  .pr-lab{display:flex;flex-direction:column;gap:8px}
  .pr-lo{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 0;border-top:1px solid var(--line-2)}
  .pr-lo input{flex:1 1 220px;min-width:180px;min-height:32px;padding:3px 10px;font-size:13px}
  .pr-mod{display:flex;flex-direction:column;gap:8px}
  .pr-mod button{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;border:1px solid var(--line);background:#fff;border-radius:12px;padding:12px 14px;font:inherit;font-weight:600;cursor:pointer;color:var(--ink)}
  .pr-mod button:hover{border-color:var(--blue);background:var(--blue-tint)}
  @media (max-width:1100px){.pr-info{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media (max-width:980px){.pr-grid{grid-template-columns:1fr}.pr-two{grid-template-columns:1fr}.pr-nums{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
  document.head.appendChild(css);

  const curPid=i=>{const R=S.rounds,WP=WARDS[R.ward],p=WP[Math.min(i,WP.length-1)];return p&&p.id;};
  const R0=()=>S.rounds, curP=()=>{const R=S.rounds,WP=WARDS[R.ward];return WP[Math.min(R.idx[R.ward],WP.length-1)];};
  const last=a=>Array.isArray(a)&&a.length?a[a.length-1]:null;
  const exOf=p=>(EX[p.id]||[]);
  const alertsOf=p=>V3.openAlerts(a=>a.pid===p.id&&!a.ack&&!a.closed);
  const evOf=p=>((ptCtxOf(p.id).events)||[]).filter(e=>!e.ack);
  function tagOf(p){
    if(alertsOf(p).length)return ['red','Alert'];
    if(/late/.test(exOf(p)[1]||''))return ['amber','Overdue'];
    if(p.day<=1)return ['blue','New'];
    if(String(exOf(p)[0]||'').startsWith('1:1'))return ['amber','1:1'];
    return null;
  }
  function keepNote(){const R=S.rounds,p=curP();R.noteBy=R.noteBy||{};if(p)R.noteBy[p.id]=R.scribeNote||'';}
  window.prSwitch=function(j){
    const R=S.rounds,WP=WARDS[R.ward];keepNote();
    R.idx[R.ward]=Math.max(0,Math.min(WP.length,j));R.drafted=false;R.mc=[];R.adv=[];R.mon=[];R.inv=[];R.ref=[];R.noteFromScribe=false;
    const np=WP[Math.min(R.idx[R.ward],WP.length-1)];R.scribeNote=((R.noteBy||{})[np&&np.id])||'';render();window.scrollTo(0,0);
  };
  window.prSave=function(stay){
    const R=S.rounds,w=R.ward,before=R.idx[w];confirmRound();
    if(stay&&R.seen&&R.seen[curPid(before)]){R.idx[w]=before;R.scribeNote='';render();} /* Save keeps you on this patient, now marked seen */
  };
  window.prStopUndo=function(name){const R=S.rounds;R.mc=R.mc.filter(c=>!(c.act==='Stop'&&c.text===name));render();};
  /* a dose is never changed from Rounds (owner, 5 Nov): the doctor stops a medicine and adds a new one */
  window.prCall=name=>toast('Prototype: calling '+name);

  /* a psychiatrist is shown as "Dr. Name", a psychologist by name only; no role words (team review, 5 Nov) */
  const dr=n=>{n=String(n||'');return /^Dr\.?\s/.test(n)?n:(n?'Dr. '+n:'');};
  window.prKeep=keepNote;
  function infoStrip(p){
    const c=ptCtxOf(p.id),tm=c.team||{},ex=exOf(p),ev=evOf(p),al=alertsOf(p);
    const stand=(S.stand||[]).filter(x=>x.pid===p.id&&x.risk);
    const nr=(c.contacts||[])[0]||[],nrName=nr[0]||'',rel=String(nr[1]||'').split(' · ')[0];
    const call=c.calls&&c.calls.h24==='done'?'24 h call done':'24 h call due';
    const bits=[];
    al.forEach(a=>bits.push(`<span style="color:var(--red);font-weight:600">Vitals alert: ${hesc(a.title)}</span>`));
    ev.forEach(e=>bits.push(`<span style="color:var(--amber);font-weight:600">${hesc(e.type)} not reviewed · ${hesc(e.when)}</span>`));
    if(String(ex[0]||'').startsWith('1:1')||/15/.test(ex[0]||''))bits.push(`<span style="color:var(--amber);font-weight:600">${hesc(ex[0])}</span>`);
    stand.forEach(x=>bits.push(hesc(x.text)));
    return `<div class="pr-info">
      <div><div class="l">Treating team</div>${hesc(dr(tm.psy))}<br>${tm.psych?hesc(tm.psych):`<a href="#/patient/${p.id}/overview" class="small">Add psychologist</a>`}</div>
      <div><div class="l">Significant alerts</div>${bits.length?bits.join('<br>'):'<span class="muted">No open alerts</span>'}</div>
      <div><div class="l">Family / NR</div>${nrName?hesc(nrName)+' <span class="muted">('+hesc(rel.toLowerCase())+'), NR</span><br><span class="muted">+91 98•••• 4210 · Hindi · '+call+'</span>':'<span class="muted">No nominated representative recorded</span>'}</div>
    </div>`;
  }

  function sinceCard(p){
    const c=ptCtxOf(p.id),vc=c.vc||{},sys=last(vc.sys),dia=last(vc.dia),pul=last(vc.pulse),sug=last(vc.sugar),slp=last(vc.sleep);
    /* lvl: '' normal, 'warn' raised, 'bad' out of range; an arrow shows which way, so colour is not the only signal */
    const vi=(l,v,lvl,dir,u)=>`<span class="pr-vi ${lvl||''}"><span class="l">${l}</span><b>${v==null?'—':v}${u?` <span class="u">${u}</span>`:''}</b>${lvl&&dir?`<span class="pr-trend" aria-label="${lvl==='bad'?'Outside expected range':'Needs attention'}">${dir}</span>`:''}</span>`;
    const bp=sys!=null?sys+'/'+dia:null;
    const eod=(S.eod||{})[p.id],pr=(c.psychRows||[]).reduce((a,r)=>[a[0]+(+r.done||0),a[1]+(+r.req||0)],[0,0]);
    const ev=evOf(p),pend=[];
    const labs=(typeof v3==='function'?v3().labs:[]).filter(l=>l.pid===p.id&&!l.rev).length;if(labs)pend.push(labs+' lab result'+(labs>1?'s':'')+' to review');
    if(/late/.test(exOf(p)[1]||''))pend.push(String(exOf(p)[1]).replace(/^History/,'Detailed history'));
    const refs=(S.referrals||[]).filter(r=>r.pid===p.id&&!S.done[r.id]).length;if(refs)pend.push(refs+' referral'+(refs>1?'s':'')+' with the RMO');
    const oor=(sys!=null&&(sys>=140||sys<90))||(pul!=null&&(pul>100||pul<55));
    return `<section class="card pad"><h3 style="margin-bottom:10px">Since last round</h3>
      <div class="pr-vit" role="group" aria-label="Latest vital readings">${vi('BP',bp,sys==null?'':(sys>=140||dia>=90||sys<90)?'bad':sys>=130?'warn':'',sys<90?'↓':'↑','mmHg')}${vi('Pulse',pul,pul==null?'':(pul>100||pul<55)?'bad':'',pul<55?'↓':'↑','bpm')}${vi('Sugar',sug,sug==null?'':(sug>180||sug<70)?'bad':sug>140?'warn':'',sug<70?'↓':'↑','mg/dL')}${vi('Sleep',slp,slp==null?'':slp<5?'warn':'','↓','h')}</div>
      <div class="pr-lines">
        <div><b>Nursing</b>${oor?'Vitals out of range at the last check':'Vitals in range, doses given as charted'}</div>
        <div><b>Psychologist</b>${hesc(((c.team||{}).psych)||'None assigned')}${pr[1]?' · '+pr[0]+' of '+pr[1]+' sessions done':''}${eod&&eod.saved?' · note written today':''}</div>
        ${window.psyScoreLine&&psyScoreLine(p.id)?`<div><b>Scores</b>${hesc(psyScoreLine(p.id))}</div>`:''}
        <div><b>Events</b>${ev.length?ev.map(e=>hesc(e.type)+' · '+hesc(e.when)+' (not reviewed)').join('; '):'None to review'}</div>
        <div><b>Pending</b>${pend.length?pend.map(hesc).join(' · '):'Nothing pending'}</div>
      </div></section>`;
  }

  function noteCard(p){
    const R=S.rounds,sc=R.scribe&&R.scribe.pid===p.id?R.scribe:null;
    if(!R.drafted)R.noteFromScribe=false;
    if(R.drafted&&sc&&!R.noteFromScribe){R.scribeNote=sc.note;R.noteFromScribe=true;}
    const btn=R.scribing?`<button class="btn sm" disabled><span class="rec"><i></i>Writing the note…</span></button>`
      :R.listening?`<button class="btn sm" onclick="listenRound()"><span class="rec"><i></i>Stop listening</span></button>`
      :`<button class="btn sm" onclick="listenRound()">${icon.mic} ${sc?'Record again':'Start AI scribe'}</button>`;
    const aiLine=R.drafted&&sc?`<div class="tiny" style="color:var(--blue-ink);margin-top:6px">Draft from AI scribe, ${hesc(sc.at)}. Read and edit before saving.</div>`:'';
    const extra=R.drafted&&sc?`${sc.risk?`<div class="small" style="margin-top:8px"><b>Risk</b> · ${hesc(sc.risk)}</div>`:''}
      ${sc.unclear&&sc.unclear.length?`<div class="wa-warn" style="margin-top:8px"><b>Check these, the scribe was not sure:</b> ${sc.unclear.map(hesc).join(' · ')}</div>`:''}
      ${sc.medChanges&&sc.medChanges.length?`<div class="small muted" style="margin-top:8px">${sc.medChanges.length} medicine change${sc.medChanges.length>1?'s':''} added to Medicine below as "From scribe". Remove any that are wrong.</div>`:''}
      ${sc.todos&&sc.todos.length?`<div class="small" style="margin-top:8px"><b>To-dos</b> · ${sc.todos.map(t=>hesc(t.text)+' ('+hesc(t.owner)+')').join('; ')}</div>`:''}`:'';
    return `<section class="card pad"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3>Round note</h3>${btn}</div>
      <textarea class="input pr-note" id="prNote" placeholder="Type the round note here, or use the AI scribe" oninput="S.rounds.scribeNote=this.value;prKeep()">${hesc(R.scribeNote||'')}</textarea>${aiLine}${extra}</section>`;
  }

  function medCard(p){
    const R=S.rounds,mc=R.mc||[],cur=rmCur();
    const rows=cur.map((m,i)=>{
      const stop=mc.some(c=>c.act==='Stop'&&c.text===m.name),chg=mc.find(c=>c.act==='Change'&&c.text.startsWith(m.name+':'));
      const st=stop?['stop','Stopping today']:chg?['chg','Dose changed']:['cont','Continue'];
      const start=String(m.range||'').split(' to ')[0];
      return `<tr><td><div style="font-weight:700;${stop?'text-decoration:line-through;color:var(--muted)':''}">${hesc(m.name)}</div><div class="tiny muted">${hesc(m.time||'')}${start?' · from '+hesc(start):''}${m.reason?' · '+hesc(m.reason)+', most '+m.max+' in 24 h':''}</div></td>
        <td>${hesc(m.freq)}</td><td><span class="pr-st ${st[0]}">${st[1]}</span>${chg?`<div class="tiny muted" style="margin-top:2px">${hesc(chg.text.split(': ').slice(1).join(': '))}</div>`:''}</td>
        <td style="text-align:right"><div class="row" style="justify-content:flex-end;gap:6px;flex-wrap:wrap">${stop?`<button class="btn sm" onclick="prStopUndo('${hesc(m.name)}')">Undo</button>`
          :`<button class="btn sm" onclick="rmAdd('Stop','${hesc(m.name)}')">Stop</button>`}
          </div></td></tr>`;
    }).join('');
    const news=mc.filter(c=>c.act==='Start').map((c,i)=>`<tr><td><div style="font-weight:700">${hesc(c.text.split(',')[0])}</div><div class="tiny muted">${hesc(c.text.split(',').slice(1).join(',').trim())}</div></td><td></td><td><span class="pr-st new">New</span>${c.src==='From scribe'?' <span class="tiny muted">from scribe</span>':''}</td><td style="text-align:right"><button class="btn sm" onclick="S.rounds.mc.splice(S.rounds.mc.indexOf(S.rounds.mc.filter(x=>x.act==='Start')[${i}]),1);render()">Remove</button></td></tr>`).join('');
    return `<section class="card pr-med"><div class="hd"><h3>Medicine</h3><div class="row" style="gap:8px">${mc.length?chip(mc.length+' pending','c-blue'):''}<button class="btn sm" onclick="medChartModal()">Full chart</button></div></div>
      <div class="scroll"><table class="t"><tbody>${rows}${news}</tbody></table></div>
      <div style="padding:12px 20px;border-top:1px solid var(--line-2);display:flex;gap:12px;flex-wrap:wrap;align-items:center"><button class="btn pri" onclick="psyRxOpen({ctx:'rounds'})">Add medicine</button>
        <button class="btn" onclick="prModalityOpen()">Add treatment modality</button>
        ${window.psyPx?(psyPx(p.id).plans||[]).slice(0,3).map(x=>`<span class="pr-ch">Plan: ${hesc(x.kind)} · ${hesc(String(x.at).split(',')[0])}</span>`).join(''):''}</div></section>`;
  }

  /* Add Treatment Modality (was "Plan for…"): a window with the options; picking one opens its linked tasks (consent, blood tests) */
  const MODS=[['Clozapine','Consent, CBC and monitoring'],['Ketamine','Consent and monitoring'],['ECT','Consent, fitness and monitoring'],['Long acting injection','Consent and schedule']];
  window.prModalityOpen=function(){
    openModal('<div class="mh"><h3>Add treatment modality</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb"><div class="small muted" style="margin-bottom:10px">Pick one. You then choose which linked tasks to create.</div><div class="pr-mod">'+MODS.map(m=>'<button onclick="closeModal();psyPlanOpen(\''+m[0]+'\')"><span>'+m[0]+'</span><span class="tiny muted" style="font-weight:400">'+m[1]+'</span></button>').join('')+'</div></div>');
  };
  function bar(){
    const R=S.rounds,parts=[];
    if(R.mc.length)parts.push(R.mc.length+' medicine change'+(R.mc.length>1?'s':''));
    if(R.mon.length)parts.push(R.mon.length+' monitoring');
    if(R.inv.length)parts.push(R.inv.length+' lab order'+(R.inv.length>1?'s':''));
    if(R.adv.length)parts.push(R.adv.length+' instruction'+(R.adv.length>1?'s':''));
    if(R.ref.length)parts.push(R.ref.length+' referral'+(R.ref.length>1?'s':''));
    const n=roundCount();
    return `<div class="pr-bar"><span class="small">${n?`<b>${n} change${n>1?'s':''} this round:</b> ${parts.join(', ')}`:'<span class="muted">No changes this round yet</span>'}</span>
      <span class="row" style="gap:12px"><span class="tiny muted">Your entries are kept as you go</span><button class="btn pri" onclick="prSave(false)">Save and next patient</button></span></div>`;
  }

  /* ---- Lab Orders (was Investigations): the test from a drop-down, one line of advice that fills itself where the test needs it.
     The advice lines are starter defaults for the team to confirm. ---- */
  const LAB_ADV={'Serum lithium':'Sample 12 hours after the last dose, before the next dose','Valproate level':'Trough sample, before the morning dose','Fasting sugar':'After 8 hours of fasting','Lipid profile':'After 10 to 12 hours of fasting','Prolactin':'Morning sample, at least 2 hours after waking','HbA1c':'No fasting needed','Urine drug screen':'Fresh urine sample'};
  const labAdv=n=>LAB_ADV[n]||'';
  window.prLabPick=function(v){
    const R=S.rounds;R.inv=R.inv||[];
    if(v==='__other'){R.labOther=true;render();setTimeout(()=>{const i=document.getElementById('loOther');if(i)i.focus();},0);return;}
    if(v&&!R.inv.some(y=>y[0]===v)){R.inv.push([v,R.invW||'Tomorrow morning',labAdv(v)]);}
    render();
  };
  window.prLabOther=function(v){
    v=String(v||'').trim();const R=S.rounds;if(!R.labOther)return;R.labOther=false;
    if(v&&!R.inv.some(y=>y[0]===v)){R.inv=R.inv||[];R.inv.push([v,R.invW||'Tomorrow morning','']);}
    render();
  };
  window.prLabAdv=function(i,v){const R=S.rounds;if(R.inv&&R.inv[i])R.inv[i][2]=v;};
  const __rm=roundMon;
  roundMon=function(){
    if(!psy())return __rm.apply(this,arguments);
    const R=S.rounds;R.mon=R.mon||[];R.inv=R.inv||[];
    R.inv.forEach(c=>{if(c[2]===undefined)c[2]=labAdv(c[0]);}); /* tests added by a treatment plan get the same advice */
    const tot=R.inv.length+R.mon.length,taken=new Set(R.inv.map(c=>c[0]));
    return `<section class="card"><div class="hd"><h3>Monitoring</h3>${tot?chip(tot+' pending','c-blue'):''}</div>
    <div class="mon-add-top"><div class="lbl" style="margin-bottom:6px">Add monitoring</div><div class="mon-cascade"><button type="button" id="monCascadeToggle" class="input mon-cascade-toggle" aria-haspopup="true" aria-expanded="false" onclick="monToggleMenu()">Choose parameter and frequency <span>▾</span></button><div id="monCascadeMenu" class="mon-cascade-menu" hidden><div class="mon-param-list">${MON_PARAMS.map((m,i)=>`<button type="button" class="mon-param-option ${i===0?'on':''}" onmouseenter="monShowFreq(${i})" onclick="monShowFreq(${i})">${m[0]} <span>›</span></button>`).join('')}</div><div id="monFreqList" class="mon-freq-list"></div></div></div></div>
    <div class="pr-lab" style="padding:12px 20px;border-top:1px solid var(--line-2)">
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap"><div class="lbl">Lab orders</div>
        <span class="row" style="gap:6px"><span class="tiny muted">Collect</span><select class="input" style="width:auto;min-height:30px;padding:3px 8px" aria-label="Collect" onchange="S.rounds.invW=this.value">${INV_WHEN.map(w=>`<option ${(R.invW||'Tomorrow morning')===w?'selected':''}>${w}</option>`).join('')}</select></span></div>
      <select class="input" aria-label="Add a lab order" onchange="prLabPick(this.value)"><option value="">Choose a test…</option>${INV_LIST.filter(x=>!taken.has(x)).map(x=>`<option>${x}</option>`).join('')}<option value="__other">Other test…</option></select>
      ${R.labOther?`<input class="input" id="loOther" placeholder="Type the test, then press Enter" onkeydown="if(event.key==='Enter')prLabOther(this.value)" onblur="prLabOther(this.value)">`:''}
      ${R.inv.map((c,i)=>`<div class="pr-lo"><span style="font-weight:600">${hesc(c[0])}</span><span class="tiny muted">${hesc(c[1])}</span><input class="input" aria-label="Advice for ${hesc(c[0])}" placeholder="Advice (optional)" value="${hesc(c[2]||'')}" oninput="prLabAdv(${i},this.value)"><button class="x" aria-label="Remove" onclick="S.rounds.inv.splice(${i},1);render()">×</button></div>`).join('')}
    </div>
    ${R.mon.length?`<div style="padding:4px 20px 16px;display:flex;flex-direction:column;gap:8px"><div class="lbl">Pending</div>${R.mon.map((c,i)=>`<div class="box row">${chip('Monitor','c-green')}<span class="grow small">${c.act==='Stop'?'Stop monitoring '+c.p:c.p+': '+monLabel(c.f)}</span><button class="x" aria-label="Remove" onclick="S.rounds.mon.splice(${i},1);render()">×</button></div>`).join('')}</div>`:''}
  </section>`;
  };
  /* the advice travels with the lab order into the nursing instruction */
  const __cr0=confirmRound;
  confirmRound=function(){
    if(psy()){const R=S.rounds;R.inv=(R.inv||[]).map(c=>[c[0],c[1]+(c[2]?' · '+c[2]:'')]);}
    return __cr0.apply(this,arguments);
  };

  /* ---- Referral saves by itself: pick where, write the reason, it is added (no Add referral button) ---- */
  window.prRefAuto=function(){const d=document.getElementById('refChoice'),r=document.getElementById('refFreeReason');if(d&&r&&d.value&&r.value.trim())refAddChoice();};
  const __rr=roundRef;
  roundRef=function(){
    const h=__rr.apply(this,arguments);if(!psy())return h;
    return h.replace('<select class="input" id="refChoice">','<select class="input" id="refChoice" onchange="prRefAuto()">')
      .replace('<textarea class="input" id="refFreeReason" rows="2" placeholder="Write the reason for this referral">','<textarea class="input" id="refFreeReason" rows="2" placeholder="Write the reason for this referral" onchange="prRefAuto()">')
      .replace(/<div class="row" style="justify-content:flex-end"><button class="btn sm pri" onclick="refAddChoice\(\)">Add referral<\/button><\/div>/,'');
  };

  function page(p){
    const R=S.rounds,WP=WARDS[R.ward],RI=R.idx[R.ward];
    if(R.seen&&WP.every(x=>R.seen[x.id]))R.seen={}; /* "Restart this ward" starts the ticks again */
    const sn=R.seen||{},seenN=WP.filter(x=>sn[x.id]).length;
    const tot=Object.values(WARDS).reduce((a,w)=>a+w.length,0),seen=Object.values(WARDS).reduce((a,w)=>a+w.filter(x=>sn[x.id]).length,0);
    const c=ptCtxOf(p.id),sx=p.sex||'',ag=p.age||'';
    const q=WP.map((x,j)=>{const tg=tagOf(x),done=!!sn[x.id],cls=(done?'seen ':'')+(j===RI?'on':'');
      return `<button class="pr-q ${cls}" onclick="prSwitch(${j})"><span class="pr-dot">${done?'✓':''}</span><span style="min-width:0"><span style="display:block;font-weight:600;font-size:13px">@@Q${j}@@</span><span class="tiny muted">${hesc(x.room)}</span></span>${tg?`<span class="pr-tag ${tg[0]}">${tg[1]}</span>`:''}</button>`;}).join('');
    return `<div class="pr-top"><button class="pr-back" onclick="go('#/myday')">‹ Inpatients</button><div class="grow"><h2>Rounds · ${hesc(R.ward)}</h2><div class="muted small" style="margin-top:2px">${seenN} of ${WP.length} seen · ${seen} of ${tot} across your wards</div></div><button class="btn" onclick="go('#/myday')">End rounds</button></div>
    <div class="pr-grid" style="margin-top:14px">
      <aside class="card pr-queue" aria-label="Ward order" style="padding:10px"><div style="padding:4px 8px 8px"><div class="lbl">Ward order</div><div class="ebar" style="margin-top:6px"><i style="width:${Math.round(seenN/WP.length*100)}%"></i></div></div>${q}</aside>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <section class="card pad"><div class="pr-head">${av(p.ini,52,p.risk?'c-amber':'c-blue')}<div class="grow" style="min-width:240px"><div class="row" style="gap:10px;align-items:baseline"><h2>${hesc(p.name)}</h2><span class="muted">${(window.psyAgeSex&&psyAgeSex(p))?psyAgeSex(p)+' · ':''}${(()=>{try{const u=p.uhid||ptIdentity(p).uhid;return u?'UHID '+hesc(u)+' · ':''}catch(e){return ''}})()}${hesc(p.room)} · Day ${p.day}</span></div>
          <div class="pr-chips"><span class="pr-ch">${hesc(p.dx||c.dx||'')}</span></div>${window.psySafety?`<div style="margin-top:8px">${psySafety(p.id)}</div>`:''}</div>
          <div class="row" style="gap:8px"><a href="#/patient/${p.id}/overview" class="small" style="font-weight:600" onclick="S.backToRounds=true">Open full record</a><button class="btn sm" ${RI===0?'disabled':''} aria-label="Previous patient" onclick="prSwitch(${RI-1})">‹</button><button class="btn sm" ${RI>=WP.length-1?'disabled':''} aria-label="Next patient" onclick="prSwitch(${RI+1})">›</button></div></div>
          ${infoStrip(p)}</section>
        <div class="pr-two">${sinceCard(p)}${noteCard(p)}</div>
        ${medCard(p)}
        <div class="pr-two"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">${roundMon()}</div><div style="display:flex;flex-direction:column;gap:16px;min-width:0">${roundAdvice()}${roundRef()}</div></div>
        ${bar()}
      </div></div>`;
  }

  /* "Open full record" from Rounds: the patient page shows a Back to Rounds button (the ward order and your note are kept) */
  const prevVP=ROLE.psychiatrist.vPatient;
  ROLE.psychiatrist.vPatient=function(sub,base){
    const h=prevVP?prevVP(sub,base):base(sub);
    if(!S.backToRounds)return h;
    return `<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px"><button class="btn" onclick="S.backToRounds=false;go('#/rounds')">‹ Back to Rounds</button><span class="small muted">You opened this from Rounds. Your place in the ward order is saved.</span></div>`+h;
  };
  const __rBack=render;
  render=function(){const r=(location.hash||'').slice(2).split('/')[0];if(r!=='patient'&&r!=='rounds')S.backToRounds=false;return __rBack.apply(this,arguments);};

  const __prev=vRounds;
  vRounds=function(){
    if(!psy())return __prev.apply(this,arguments);
    const R=S.rounds,WP=WARDS[R.ward];if(R.idx[R.ward]>=WP.length)return __prev.apply(this,arguments); /* "ward complete" screen stays */
    const p=curP();if(!p)return __prev.apply(this,arguments);
    S.focusPid=p.id;$('title').textContent='Rounds';
    let h=ptRun(p.id,()=>page(p));WP.forEach((x,j)=>{h=h.split('@@Q'+j+'@@').join(hesc(x.name));}); /* ward-order names are put back after the per-patient text swap, which would turn Neel Bose into the open patient */
    return h;
  };

  /* the signed round note goes into Earlier notes (locked, with author and time) and the box is cleared for the next patient */
  const __cr=confirmRound;
  confirmRound=function(){
    if(!psy())return __cr.apply(this,arguments);
    const R=S.rounds,w=R.ward,before=R.idx[w],p=curP(),note=(R.scribeNote||'').trim(),d=new Date();
    const out=__cr.apply(this,arguments);
    if(R.idx[w]>before&&p){
      if(note){ptRun(p.id,()=>{S.dnHist=(S.dnHist||DN_HIST).slice();S.dnHist.unshift({d:String(d.getDate()),my:d.toLocaleString('en-GB',{month:'short'})+' '+d.getFullYear(),type:'Round note',tc:'c-violet',by:signer(),role:'Psychiatrist',sum:note.slice(0,110),signed:atNow(),secs:[['Round note',note]]});return '';});}
      /* only a saved round counts as seen; the next patient is the next one NOT yet seen (the list can be opened in any order) */
      R.seen=R.seen||{};R.seen[p.id]=true;
      const WP=WARDS[w];let next=-1;
      for(let k=1;k<=WP.length;k++){const j=(before+k)%WP.length;if(!R.seen[WP[j].id]){next=j;break;}}
      R.idx[w]=next<0?WP.length:next;
      R.noteBy=R.noteBy||{};delete R.noteBy[p.id];
      R.scribeNote=next<0?'':(R.noteBy[WP[next].id]||'');R.noteFromScribe=false;R.scribe=null;
      if(next<0)S.done.daily=true;
      render();
    }
    return out;
  };
})();
