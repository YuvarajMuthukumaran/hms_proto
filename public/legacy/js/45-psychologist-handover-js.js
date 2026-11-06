
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
    ['psychopath','Current psychopathology','area'],
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
      dx:p.dx||c.dx||'',ddx:'',
      cc:hr(/^Chief complaints/i),
      reason:pid==='neel'?'Manic symptoms, overspending, irritability for 3 weeks':'',
      expect:'',
      psychopath:L([mine?mine.sum:'','Risk of harm: '+lvl+(tags?' ('+tags+')':'')+'.']),
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
  window.pgHoSend=function(){
    const st=store(),u=st.ui;u.to=($('pgTo')||{}).value||u.to;u.reason=($('pgWhy')||{}).value||u.reason;
    const pids=mypts().filter(p=>u.sel[p.id]!==false).map(p=>p.id);
    if(!u.to){toast('Choose the psychologist who takes over');return;}
    if(!pids.length){toast('Pick at least one patient');return;}
    /* what the next psychologist needs most is the plan: it must not be left empty */
    const missing=pids.filter(id=>!valOf(id,'future').trim());
    if(missing.length){u.cur=missing[0];render();toast('Write the future directions for '+missing.map(id=>ptFind(id).name).join(', ')+' first');return;}
    const notes={};pids.forEach(id=>{notes[id]=snap(id);});
    st.list.unshift({id:'pg'+Date.now(),from:signer(),to:u.to,reason:u.reason,at:atNow(),pids,notes,status:'sent'});
    u.notes={};render();toast('Handover sent to '+u.to+'. You still see these patients until '+u.to+' accepts.');
  };
  window.pgHoToggle=function(id){const h=store().list.find(x=>x.id===id);if(h){h.open=!h.open;render();}};

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
    const cur=pts.some(p=>p.id===u.cur)?u.cur:(pts[0]||{}).id;
    const list=pts.map(p=>{const inc=u.sel[p.id]!==false,miss=inc&&!valOf(p.id,'future').trim();
      return `<div class="hn-pt ${p.id===cur?'on':''}" role="button" tabindex="0" onclick="pgHnCur('${p.id}')" onkeydown="if(event.key==='Enter')pgHnCur('${p.id}')"><input type="checkbox" ${inc?'checked':''} aria-label="Hand over ${hesc(p.name)}" onclick="event.stopPropagation()" onchange="pgHoSel('${p.id}',this.checked)"><span style="min-width:0"><b>${hesc(p.name)}</b><span class="tiny muted" style="display:block">${hesc(window.psyPatientLine?psyPatientLine(p):p.room)}</span></span><span class="hn-st ${!inc?'off':miss?'add':'ok'}">${!inc?'Stays with you':miss?'To add':'Ready'}</span></div>`;}).join('');
    return `<div class="ho"><div><h2>Handover</h2><div class="muted" style="margin-top:4px">One page per patient. What the system already knows is filled in; you add what is missing. Your entries are kept as you type.</div></div>
      ${incoming.length?`<div class="lbl">To you</div>${incoming.map(h=>card(h,false)).join('')}`:''}
      <section class="card"><div class="hd"><div><h3>Hand over my patients</h3><div class="small muted" style="margin-top:4px">Untick patients who stay with you. Until the other psychologist accepts, you still see them.</div></div>
        <div class="row" style="gap:8px"><select class="input" id="pgTo" style="min-height:34px;width:auto" onchange="pgHoTo(this.value)" aria-label="Psychologist who takes over"><option value="">Hand over to…</option>${others.map(n=>`<option ${u.to===n?'selected':''}>${hesc(n)}</option>`).join('')}</select>
        <select class="input" id="pgWhy" style="min-height:34px;width:auto" aria-label="Reason">${['Going on leave','Night duty','Transfer'].map(r=>`<option ${u.reason===r?'selected':''}>${r}</option>`).join('')}</select>
        <button class="btn pri" onclick="pgHoSend()">Send handover</button></div></div>
        ${cur?`<div class="hn-wrap"><div class="hn-list">${list}</div><div style="min-width:0">${notePage(cur,snap(cur),false,{})}</div></div>`:'<div class="pad small muted">No patients to hand over.</div>'}</section>
      ${sent.length?`<div class="lbl">Sent by you</div>${sent.map(h=>card(h,true)).join('')}`:''}</div>`;
  }

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
