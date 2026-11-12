
/* Psychologist only (5 Nov 2026): Handover, in Anu's format (page 2 of "patient care 1 jan edited": Handover notes for Psychologist).
   ONE PAGE PER PATIENT. What the record already knows is filled in (diagnosis, current psychopathology, ongoing interventions with outcome,
   family interventions, legal / nominated representative); the psychologist adds only what is missing (differential diagnosis, expectation
   from treatment, future directions, what was said to the family). Entries are kept as you type. The sender's name is the signature of
   "Handover given by"; the receiving psychologist signs by pressing Accept. Same look and flow as the psychiatrist's handover (block 30,
   whose .ho / .hn- styles are reused here). Nothing here runs for any other role. */
(function(){
  const psg=()=>S.role==='psychologist';
  const ICON='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/></svg>';

  /* handovers are about the psychologist, not one patient, so they live at the top of the state */
  function store(){
    if(!S.pgHO)S.pgHO={list:[{id:'pg0',from:'Kiran Mehra',to:'Priya Nair',reason:'Going on leave',at:'3 Nov 2026, 5:40 pm',pids:['arjun','sameer'],rec:{arjun:'Continue sleep hygiene sessions twice a week; review insight work after the family session on Wednesday.',sameer:'Rituals reduced on fluoxetine; continue exposure and response prevention, one session a week.'},status:'sent'}],ui:{to:'',reason:'Going on leave',sel:{},notes:{},cur:''}};
    return S.pgHO;
  }
  const FIELDS=[
    ['dx','Provisional diagnosis','line'],
    ['ddx','Differential diagnosis','line'],
    ['cc','Chief complaints (chronological, with duration)','area'],
    ['reason','Reason for admission','area'],
    ['expect','Expectation from treatment','area'],
    ['psychopath','Current psychopathology (you fill this: symptoms and mental state)','area'],
    ['interv','Ongoing psychological interventions with the patient, with outcome','area'],
    ['family','Ongoing family interventions','area'],
    ['consider','Any specific consideration related to calls, meetings, legal aspects, insurance or privileges','area'],
    ['future','Future directions of the treatment plan','area'],
    ['comm','Communication to family and patient (combined session of both psychologists)','area']
  ];
  const j=v=>Array.isArray(v)?v.join('; '):String(v==null?'':v);
  const fmtRow=r=>r.area+': '+r.iv+' · '+(r.done||0)+' of '+(r.req||'?')+' sessions'+(r.when?' ('+r.when+')':'')+(r.out&&r.out!=='—'?'. Outcome: '+r.out:'.');

  /* what the record already says, per field */
  function auto(pid){
    const p=ptFind(pid);if(!p)return null;
    const c=ptCtxOf(pid),x=(window.psyPx?psyPx(pid):{}),L=a=>a.filter(Boolean).join('\n'),HR=typeof HREAD!=='undefined'?HREAD:[];
    let id={};try{id=ptIdentity(p)||{};}catch(e){}
    const rows=c.psychRows||[];
    const hr=re=>{const r=pid==='neel'?HR.find(a=>re.test(a[0])):null;return r?j(r[1]):'';};
    const notes=c.dnHist||[],mine=notes.find(h=>/psycholog/i.test(h.role||''))||notes[0];
    const lvl=x.riskLevel||(p.risk?'High':'Low'),tags=(x.riskTags||[]).join(', ');
    const fam=rows.filter(r=>/family/i.test(r.area+' '+r.iv)).map(fmtRow);
    const call=c.calls&&c.calls.h24==='done'?'24-hour family call done.':'';
    const left=rows.filter(r=>(+r.done||0)<(+r.req||0)).map(r=>r.area+': '+((+r.req)-(+r.done))+' more session'+(((+r.req)-(+r.done))===1?'':'s'));
    return {p,f:{
      dx:p.dx||c.dx||'',ddx:hr(/^Differential/i)||(window.psyRecordDdx?(psyRecordDdx(pid).text||''):''),
      cc:hr(/^Chief complaints/i),
      reason:pid==='neel'?'Manic symptoms, overspending, irritability for 3 weeks':((p.dx||c.dx)?'Admitted with '+String(p.dx||c.dx).toLowerCase()+' (Section '+(c.section||p.sec)+')':''),
      expect:'',
      psychopath:'', /* 12 Nov QA: the doctor writes this, it is not pre-filled */
      interv:rows.map(fmtRow).join('\n'),
      family:L([fam.join('\n'),call]),
      consider:L(['Section '+(c.section||p.sec)+'.',id.nr?'Nominated representative: '+id.nr+(id.rel?' ('+String(id.rel).toLowerCase()+')':'')+'.':'',(typeof VIP!=='undefined'&&VIP[pid])?VIP[pid]+'.':'']),
      future:left.length?'Sessions still to do: '+left.join('; '):'',
      comm:''}};
  }
  const uiN=()=>{const u=store().ui;u.notes=u.notes||{};return u.notes;};
  const valOf=(pid,k)=>{const e=uiN()[pid];return e&&e[k]!==undefined?e[k]:((auto(pid)||{f:{}}).f[k]||'');};
  const snap=pid=>{const o={};FIELDS.forEach(([k])=>{o[k]=valOf(pid,k);});return o;};
  const noteFor=(h,pid)=>{if(h.notes&&h.notes[pid])return h.notes[pid];const a=auto(pid),f=Object.assign({},a?a.f:{});if(h.rec&&h.rec[pid])f.future=h.rec[pid];return f;};
  window.pgHoNote=noteFor;
  const nl2br=t=>hesc(t||'').replace(/\n/g,'<br>');
  const mypts=()=>{try{return PSY_EOD();}catch(e){return PTS;}};

  function notePage(pid,vals,ro,o){
    o=o||{};const p=ptFind(pid),a=auto(pid)||{f:{}};
    const tag=(k,v)=>{if(ro)return '';if(!String(v||'').trim())return '<span class="hn-tag add">To add</span>';return v===(a.f[k]||'')?'<span class="hn-tag rec">From the record</span>':'';};
    const fld=([k,label,ty])=>{
      const v=vals[k]||'';
      const body=ro?`<div class="hn-ro">${v.trim()?nl2br(v):'<span class="muted">Nothing written</span>'}</div>`
        :(ty==='line'?`<input class="input" value="${hesc(v)}" oninput="pgHnSet('${pid}','${k}',this.value)">`
        :`<textarea class="input" rows="${Math.max(2,Math.min(7,String(v).split('\n').length+1))}" ${k==='future'||k==='comm'||k==='expect'?'placeholder="Write here"':''} oninput="pgHnSet('${pid}','${k}',this.value)">${hesc(v)}</textarea>`);
      return `<div class="hn-f ${ty==='line'?'half':''}"><div class="lbl">${hesc(label)} ${tag(k,v)}</div>${body}</div>`;
    };
    const sig=`<div class="hn-sign"><div><div class="lbl">Handover given by</div><div style="font-weight:600">${hesc(o.from||signer())}</div><div class="tiny muted">${hesc(o.at?'Signed '+o.at:'Signed when you send it')}</div></div>
      <div><div class="lbl">Handed over to</div><div style="font-weight:600">${hesc(o.to||store().ui.to||'Choose the psychologist above')}</div><div class="tiny muted">${hesc(o.accepted?'Signed '+o.accepted:'Signs by accepting it')}</div></div></div>`;
    return `<section class="card hn-page"><div class="hn-head"><div><h3>${hesc(p.name)}</h3><div class="small muted">${hesc([window.psyPatientLine?psyPatientLine(p):'',p.uhid?'UHID '+p.uhid:''].filter(Boolean).join(' · '))} · Handover notes for Psychologist</div></div>${o.pdf||''}</div>
      <div class="hn-grid">${FIELDS.map(fld).join('')}</div>${sig}</section>`;
  }
  window.pgHnSet=function(pid,k,v){uiN()[pid]=uiN()[pid]||{};uiN()[pid][k]=v;};
  window.pgHnCur=function(pid){store().ui.cur=pid;render();};
  window.pgHnHCur=function(id,pid){const h=store().list.find(x=>x.id===id);if(h){h.cur=pid;render();}};
  window.pgHnPdf=function(id,pid){
    const h=id?store().list.find(x=>x.id===id):null,vals=h?noteFor(h,pid):snap(pid),p=ptFind(pid);
    const rows=FIELDS.map(([k,l])=>`<div class="n"><div class="m"><b>${hesc(l)}</b></div>${nl2br(vals[k])||'—'}</div>`).join('');
    if(window.psyPdf)psyPdf('Handover notes for Psychologist',`<h2>Handover notes for Psychologist</h2>${rows}<table style="margin-top:10px"><tr><th>Handover given by</th><th>Handed over to</th></tr><tr><td>${hesc(h?h.from:signer())}${h?'<br>'+hesc(h.at):''}</td><td>${hesc(h?h.to:store().ui.to||'')}${h&&h.acceptedBy?'<br>'+hesc(h.acceptedBy+' · '+h.acceptedAt):''}</td></tr></table>`,p);
  };
  window.pgHoAccept=function(id){
    const h=store().list.find(x=>x.id===id);if(!h||h.acceptedBy)return;
    h.acceptedBy=signer();h.acceptedAt=atNow();h.status='accepted';
    h.pids.forEach(pid=>{try{ptCtxOf(pid).team.psych=h.to;}catch(e){}});
    render();toast('Handover accepted by '+signer()+'. The patients are now yours.');
  };
  window.pgHoSel=function(pid,on){store().ui.sel[pid]=!!on;render();};
  window.pgHoTo=v=>{store().ui.to=v;};
  /* Send handover (same flow as the psychiatrist): a pop-up asks for each ticked patient's missing details one by one,
     then a review pop-up lists the recipient, reason and patients; Finalize sends it. */
  const chosenIds=()=>{const u=store().ui;return mypts().filter(p=>u.sel[p.id]===true).map(p=>p.id);};
  const needsDetails=id=>!valOf(id,'future').trim()||!valOf(id,'expect').trim();
  function nextQueued(){
    const u=store().ui;
    if(u.queue&&u.queue.length)detailModal(u.queue[0],true);
    else reviewModal();
  }
  function detailModal(pid,queued){
    const p=ptFind(pid);if(!p)return;const u=store().ui;
    const lead=queued?`<div class="callout blue" style="margin-bottom:12px">Please add the handover details for ${hesc(p.name)}. Patient ${(u.queueDone||0)+1} of ${u.queueTotal||1}. Save to continue to the next patient.</div>`:'';
    V3.modal('Handover details · '+hesc(p.name),'For '+hesc(u.to||'the covering psychologist')+'. What the record knows is filled in: check it and add what is missing. Expectation from treatment and future directions are needed.',
      lead+`<div class="hn-modal">${notePage(pid,snap(pid),false,{})}</div>`,
      `<button class="btn" onclick="pgHoDetCancel('${pid}')">Cancel</button><button class="btn pri" onclick="pgHoDetSave('${pid}')">${queued?'Save and continue':'Save'}</button>`);
  }
  window.pgHoEdit=function(pid){if(!pid){closeModal();return;}const u=store().ui;u.queue=null;detailModal(pid,false);};
  window.pgHoDetSave=function(pid){
    if(needsDetails(pid)){toast('Fill in the expectation from treatment and the future directions first');return;}
    const u=store().ui,queued=Array.isArray(u.queue)&&u.queue[0]===pid;
    closeModal();
    if(queued){u.queue.shift();u.queueDone=(u.queueDone||0)+1;setTimeout(nextQueued,0);}
    else render();
  };
  window.pgHoDetCancel=function(pid){const u=store().ui;u.queue=null;u.queueTotal=0;u.queueDone=0;closeModal();render();};
  function reviewModal(){
    const u=store().ui,ids=chosenIds();
    if(!u.to||!ids.length){return;}
    u.queue=null;u.queueTotal=0;u.queueDone=0;
    const rows=ids.map(id=>`<li style="padding:4px 0">${hesc((ptFind(id)||{}).name||id)}</li>`).join('');
    V3.modal('Review handover',ids.length+' patient'+(ids.length===1?'':'s')+' ready to send',
      `<div class="callout blue">Review the recipient and patient list before the handover is sent.</div><div class="small" style="margin:12px 0"><b>To:</b> ${hesc(u.to)}<br><b>Reason:</b> ${hesc(u.reason||'')}<br><b>Patients:</b> ${ids.length}</div><ul style="margin:0;padding-left:22px">${rows}</ul>`,
      `<button class="btn" onclick="closeModal()">Back to handover</button><button class="btn pri" onclick="pgHoFinalize()">Finalize and send to ${hesc(u.to)}</button>`);
  }
  window.pgHoSend=function(){
    const st=store(),u=st.ui;u.to=($('pgTo')||{}).value||u.to;u.reason=($('pgWhy')||{}).value||u.reason;
    const ids=chosenIds();
    if(!u.to){toast('Choose the psychologist who takes over');const el=$('pgTo');if(el)el.focus();return;}
    if(!u.reason){toast('Choose the reason for the handover');return;}
    if(!ids.length){toast('Tick the patients you are handing over');return;}
    const miss=ids.filter(needsDetails);
    if(miss.length){u.queue=miss.slice();u.queueTotal=miss.length;u.queueDone=0;nextQueued();return;}
    reviewModal();
  };
  window.pgHoFinalize=function(){
    const st=store(),u=st.ui,pids=chosenIds();
    if(!u.to||!pids.length){closeModal();return;}
    if(pids.some(needsDetails)){closeModal();pgHoSend();return;}
    const notes={};pids.forEach(id=>{notes[id]=snap(id);});
    st.list.unshift({id:'pg'+Date.now(),from:signer(),to:u.to,reason:u.reason,at:atNow(),pids,notes,status:'sent'});
    u.notes={};u.sel={};u.queue=null;closeModal();render();toast('Handover sent to '+u.to+'. You still see these patients until '+u.to+' accepts.');
  };
  window.pgHoToggle=function(id){const h=store().list.find(x=>x.id===id);if(h){h.open=!h.open;render();}};

  const rc=h=>{
    const IC='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/></svg>';
    const KEYS=[['Current psychopathology','psychopath'],['Ongoing interventions','interv'],['Future directions','future']],open=h.open!==false,n=h.pids.length;
    return `<section class="hv-rc"><div class="hv-rc-hd"><span class="hv-rc-ic">${IC}</span><div class="t"><b>${hesc(h.from)} handed over ${n} patient${n>1?'s':''} to you</b><span>${hesc(h.reason)} · sent ${hesc(h.at)} · ${h.acceptedBy?'accepted by '+hesc(h.acceptedBy)+', '+hesc(h.acceptedAt):'until you accept, '+hesc(h.from)+' still sees them'}</span></div>
      <button class="btn sm" onclick="pgHoToggle('${h.id}')">${open?'Hide':'Show'}</button><button class="btn sm" onclick="pgHoFull('${h.id}')">${h.full?'Hide full notes':'Full notes'}</button>${h.acceptedBy?'':`<button class="btn sm pri" onclick="pgHoAccept('${h.id}')">Accept handover</button>`}</div>
      ${open?`<div class="hv-rc-wrap"><div class="hv-rc-heads" aria-hidden="true"><span>Patient</span>${KEYS.map(k=>`<span>${k[0]}</span>`).join('')}<span></span></div><div class="hv-rc-list">${h.pids.map(pid=>{const p=ptFind(pid);if(!p)return '';const f=noteFor(h,pid)||{},g=k=>String(f[k]||'');
        return `<div class="hv-rc-p"><div class="hv-rc-who"><div style="min-width:0"><b>${hesc(p.name)}</b><div class="s">${hesc([window.psyPatientLine?psyPatientLine(p):'',p.risk?'High risk':''].filter(Boolean).join(' · '))}</div>${p.dx?`<div class="hv-tags"><span class="hv-tag blue">${hesc(p.dx)}</span></div>`:''}</div></div>${KEYS.map(k=>`<div class="hv-rc-m" data-l="${k[0]}">${hesc(g(k[1]))||'<span class="muted">—</span>'}</div>`).join('')}<button class="hv-link" onclick="go('#/patient/${pid}/overview')">Open record</button></div>`;}).join('')}</div></div>`:''}</section>`;
  };
  window.pgHoFull=function(id){const h=store().list.find(x=>x.id===id);if(h){h.full=!h.full;render();}};

  function page(){
    const st=store(),u=st.ui,me=signer(),pts=mypts();
    const incoming=st.list.filter(h=>h.to===me),sent=st.list.filter(h=>h.from===me);
    const card=(h,mine)=>{
      const open=h.open!==false,cur=h.pids.includes(h.cur)?h.cur:h.pids[0];
      return `<section class="card"><div class="hd"><div><h3>${mine?'To '+hesc(h.to):'From '+hesc(h.from)} · ${hesc(h.reason)}</h3><div class="small muted" style="margin-top:4px">${hesc(h.at)} · ${h.pids.length} patient${h.pids.length>1?'s':''}${h.acceptedBy?' · <b style="color:var(--green)">Accepted by '+hesc(h.acceptedBy)+', '+hesc(h.acceptedAt)+'</b>':mine?' · <b style="color:var(--amber)">Waiting for '+hesc(h.to)+' to accept. You still see these patients.</b>':''}</div></div>
        <div class="row" style="gap:8px"><button class="btn sm" onclick="pgHoToggle('${h.id}')">${open?'Hide':'Show'} notes</button>${!mine&&!h.acceptedBy?`<button class="btn sm pri" onclick="pgHoAccept('${h.id}')">Accept handover</button>`:''}</div></div>
        ${open?`<div style="padding:0 16px 16px"><div class="hn-tabs">${h.pids.map(pid=>`<button class="${pid===cur?'on':''}" onclick="pgHnHCur('${h.id}','${pid}')">${hesc((ptFind(pid)||{}).name||pid)}</button>`).join('')}</div>
          ${notePage(cur,noteFor(h,cur),true,{from:h.from,to:h.to,at:h.at,accepted:h.acceptedBy?h.acceptedBy+', '+h.acceptedAt:'',pdf:`<button class="btn sm" onclick="pgHnPdf('${h.id}','${cur}')">PDF</button>`})}</div>`:''}</section>`;};
    const others=(typeof TR_TO!=='undefined'?TR_TO.psych:[]).filter(n=>n!==me);
    const REASONS=['Going on leave','Night duty','Transfer'];
    const sel=pts.filter(p=>u.sel[p.id]===true),miss=sel.filter(p=>!valOf(p.id,'future').trim()||!valOf(p.id,'expect').trim()),ready=sel.filter(p=>!miss.includes(p));
    const ok=!!u.to&&sel.length&&!miss.length;
    const foot=!u.to?'Choose the psychologist who takes over.':!sel.length?'Tick the patients you are handing over.':miss.length?'Add the handover details for '+miss.map(x=>x.name).join(', ')+' first.':sel.length+' patient'+(sel.length>1?'s':'')+' ready to hand over to '+u.to+'.';
    const pend=p=>{try{return (DT.tasks(p,tasks().filter(t=>!S.done[t.id]))||[]).slice(0,2).map(i=>i.txt).join('; ');}catch(e){return '';}};
    const row=p=>{
      const on=u.sel[p.id]===true,det=!!valOf(p.id,'future').trim()&&!!valOf(p.id,'expect').trim(),a=auto(p.id)||{f:{}},pt=pend(p);
      const iv=String(a.f.interv||'').split('\n').filter(Boolean).map(x=>x.split(' · ')[0]);
      const sub=[window.psyPatientLine?psyPatientLine(p):'','Day '+(p.day||0)].filter(Boolean).join(' · ');
      const tags=[p.risk?'<span class="hv-tag red">High risk</span>':''].join('');
      const st=!on?'<span class="tiny muted">Not handing over</span>':det?`<span class="hv-chip ok">Details added</span> <button class="hv-link" onclick="pgHoEdit('${p.id}')">Edit</button>`:`<span class="hv-chip need">Details needed</span> <button class="hv-link" onclick="pgHoEdit('${p.id}')">Add details</button>`;
      return `<tr class="${on?'on':''}"><td><input type="checkbox" ${on?'checked':''} onchange="pgHoSel('${p.id}',this.checked)" aria-label="Hand over ${hesc(p.name)}"></td>
        <td><div class="hv-who">${av(p.ini,34,p.risk?'c-amber':'c-blue')}<div style="min-width:0"><b>${hesc(p.name)}</b><div class="s">${hesc(sub)}</div>${tags?`<div class="hv-tags">${tags}</div>`:''}</div></div></td>
        <td><div>${hesc(p.dx||'')}</div>${pt?`<div class="tiny muted" style="margin-top:3px">Pending: ${hesc(pt)}</div>`:''}</td>
        <td>${iv.length?`<ul class="hv-line">${iv.map(x=>`<li>${hesc(x)}</li>`).join('')}</ul>`:'<span class="muted small">No interventions recorded</span>'}</td>
        <td>${st}</td></tr>`;
    };
    const ed='';
    return `<div class="hv"><div class="tiny muted">Inpatients / Handover</div>
      ${incoming.map(h=>rc(h)+(h.full?card(h,false):'')).join('')}
      <div class="hv-bar"><label class="f">Handover to <select class="input" id="pgTo" style="min-height:36px;width:auto" onchange="pgHoTo(this.value)" aria-label="Psychologist who takes over"><option value="">Choose psychologist…</option>${others.map(n=>`<option ${u.to===n?'selected':''}>${hesc(n)}</option>`).join('')}</select></label>
        <label class="f">Reason <select class="input" id="pgWhy" style="min-height:36px;width:auto" onchange="pgHoWhy(this.value)" aria-label="Reason">${REASONS.map(r=>`<option ${u.reason===r?'selected':''}>${r}</option>`).join('')}</select></label>
        <span class="grow"></span><label class="f"><input type="checkbox" ${pts.length&&sel.length===pts.length?'checked':''} onchange="pgHoAll(this.checked)"> Select all</label><span class="hv-count ${ok?'ok':''}">${sel.length} of ${pts.length} selected</span></div>
      <section class="card hv-tbl"><div class="scroll"><table class="t"><thead><tr><th style="width:36px"></th><th>Patient</th><th>Diagnosis and pending</th><th>Ongoing interventions</th><th>Handover details</th></tr></thead><tbody>${pts.map(row).join('')}</tbody></table></div></section>
      ${ed?`<section class="card"><div class="hd"><div><h3>Handover details · ${hesc(ptFind(ed).name)}</h3><div class="small muted" style="margin-top:4px">What the system knows is filled in; add what is missing. Kept as you type.</div></div><button class="btn sm" onclick="pgHoEdit('')">Close</button></div><div style="padding:0 16px 16px">${notePage(ed,snap(ed),false,{})}</div></section>`:''}
      <div class="hv-foot"><span class="small">${hesc(foot)}</span><span class="row" style="gap:8px"><button class="btn pri ${ok?'':'off'}" aria-disabled="${ok?'false':'true'}" onclick="pgHoSend()">${u.to?'Send to '+hesc(u.to):'Send handover'}</button></span></div>
      ${sent.length?`<div class="lbl">Sent by you</div>${sent.map(h=>card(h,true)).join('')}`:''}</div>`;
  }
  window.pgHoWhy=v=>{store().ui.reason=v;};
  window.pgHoAll=function(on){const u=store().ui;mypts().forEach(p=>{u.sel[p.id]=!!on;});render();};

  /* routing: only the psychologist's #/handover is handled here */
  const prevR=ROLE.psychologist.render;
  ROLE.psychologist.render=function(base){
    const r=(location.hash||'').slice(2).split('/');
    if(r[0]==='handover'){renderSide(r);$('app').classList.remove('compact');$('title').textContent='Handover';$('view').innerHTML=page();window.scrollTo(0,0);return;}
    return prevR?prevR(base):base();
  };

  /* left rail: Handover after the other items */
  const __rs=renderSide;
  renderSide=function(){
    const out=__rs.apply(this,arguments);
    if(psg()){
      const dd=document.querySelector('#side .sgdd');
      if(dd&&!dd.querySelector('[data-pgho]')){
        const on=/^#\/handover/.test(location.hash||'');
        const b=document.createElement('button');b.dataset.pgho='1';b.title='Handover';b.setAttribute('aria-label','Handover');b.setAttribute('onclick',"go('#/handover')");
        if(on){b.className='on';b.setAttribute('aria-current','page');dd.querySelectorAll('button.on:not([data-pgho])').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-current');});}
        b.innerHTML=`<span class="si">${ICON}</span><span class="sl">Handover</span>`;
        dd.appendChild(b);
      }
    }
    return out;
  };
})();
