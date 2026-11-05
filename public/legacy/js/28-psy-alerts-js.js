
/* Psychiatrist only (5 Nov 2026).
   1. Trello "Redesign Escalation chain page": chain in one line, three tiles (Not acknowledged, Escalated past RMO, Median time to
      acknowledge), open alerts most urgent first, each with a tag, who has it and the time left, and four step boxes. Acknowledge
      (filled) then Mark at bedside (outline); once marked at bedside the alert leaves the list and stays in the patient's Events log.
   2. Trello "Sister nurse alert is coming in all tabs": there is no orange strip on any tab (the owner asked for the Stay summary and
      Daily notes callout to be removed too). A small "1 event not reviewed" chip sits in the patient header and opens the Events log
      (amber for minor events, red only for serious ones: seizure, self-harm, absconding). Marking reviewed removes the chip and writes
      "Reviewed by [name], [time]" in the log. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-alerts-css';
  css.textContent=`
  /* width:100% matters: in the page's flex column an auto-margin box would shrink to its content (about 700 px) instead of using the 1180 px the design asks for */
  .es{width:100%;max-width:none;margin:0;display:flex;flex-direction:column;gap:16px}
  .es-chain{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}
  .es-box{border:1px solid var(--line);background:var(--soft);border-radius:8px;padding:5px 10px;font-size:12.5px;font-weight:600;color:var(--ink-2)}
  .es-arrow{color:#98a2b3}
  .es-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .es-tile{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px}
  .es-tile .h{display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px}.es-tile b{display:block;font-size:26px;line-height:1.2;margin:4px 0 2px}.es-tile .d{font-size:12px;color:var(--muted)}
  .es-dot{width:9px;height:9px;border-radius:50%}
  /* each alert is its own card with a gap between cards and a slim pill accent bar with a soft glow (Trello "alert page": patients must be clearly separate) */
  .es-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:4px}.es-head h3{margin:0}
  .es-list{display:flex;flex-direction:column;gap:16px}
  .es-al{position:relative;background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 24px 18px 34px;box-shadow:0 1px 3px rgba(16,24,40,.06)}
  .es-al::before{content:'';position:absolute;left:14px;top:18px;bottom:18px;width:5px;border-radius:99px;background:#d0d5dd}
  .es-al.red{background:#fffbfb;border-color:#fecdca}.es-al.red::before{background:#e5484d;box-shadow:0 0 0 3px rgba(229,72,77,.16)}
  .es-al.amber::before{background:#f5a524;box-shadow:0 0 0 3px rgba(245,165,36,.18)}
  .es-empty{text-align:center;padding:40px 20px}.es-empty .t{font-size:30px;color:var(--green);line-height:1}
  .es-r1{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .es-tag{font-size:11px;font-weight:700;border-radius:99px;padding:2px 9px}.es-tag.red{background:var(--red-bg);color:var(--red)}.es-tag.amber{background:var(--amber-bg);color:var(--amber)}
  .es-name{border:0;background:none;padding:0;font:inherit;font-weight:700;font-size:14.5px;cursor:pointer;color:var(--ink)}.es-name:hover{color:var(--blue)}
  .es-main{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;margin-top:6px}
  .es-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex:0 0 auto}
  .es-pill{font-size:12px;font-weight:700;border-radius:99px;padding:3px 11px;white-space:nowrap}.es-pill.red{background:var(--red-bg);color:var(--red)}.es-pill.amber{background:var(--amber-bg);color:var(--amber)}.es-pill.grey{background:var(--grey-bg);color:var(--grey)}
  .es-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}
  .es-s{border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12px;background:var(--soft);color:var(--ink-2)}
  .es-s b{display:block;font-size:12.5px;margin-bottom:1px}
  .es-s.ack{background:var(--green-bg);border-color:#bfe6cc;color:var(--green)}.es-s.miss{background:var(--amber-bg);border-color:var(--amber-line);color:var(--amber)}
  .es-s.cur{background:var(--blue-tint);border:2px solid var(--blue);padding:7px 9px;color:var(--blue-ink)}.es-s.fut{background:#fff;border:1px dashed #c4ccd8;color:var(--muted)}
  @media (max-width:900px){.es-tiles{grid-template-columns:1fr}.es-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.es-main{flex-direction:column}.es-right{align-items:flex-start}}
  .ev-chip{border:1px solid var(--amber-line);background:var(--amber-bg);color:var(--amber);border-radius:99px;font:inherit;font-size:12px;font-weight:700;padding:2px 10px;cursor:pointer}
  .ev-chip.red{background:var(--red-bg);border-color:#f3c3be;color:var(--red)}`;
  document.head.appendChild(css);

  const RN={rmo:'RMO',psychiatrist:'treating psychiatrist',lead:'floor lead'};
  const tagOf=a=>/vital/i.test(a.src+' '+a.title)?['red',/vital/i.test(a.src)?'Vitals':a.src]:['amber',a.src||'Alert'];
  const mins=n=>Math.max(0,Math.round(n));

  function esc(){
    $('title').textContent='Escalation chain';
    const s=v3(),now=V3.now(),R=s.escRules.urgent;
    const open=s.alerts.filter(a=>!a.closed&&!a.seen);
    const info=a=>{const r=V3.sla(a.sev),h=V3.holder(a);
      const win={rmo:[a.t,r.rmo],psychiatrist:[a.t+r.rmo,r.psy],lead:[a.t+r.rmo+r.psy,r.lead]};
      const due=h in win?win[h][0]+win[h][1]:now;return {r,h,win,left:due-now};};
    const sorted=open.slice().sort((a,b)=>{const x=info(a),y=info(b);
      if(!!a.ack!==!!b.ack)return a.ack?1:-1;
      const rk={rmo:0,psychiatrist:1,lead:2};return (rk[y.h]||0)-(rk[x.h]||0)||x.left-y.left;});
    const notAck=open.filter(a=>!a.ack).length,esc=open.filter(a=>a.esc.length),withLead=open.filter(a=>V3.holder(a)==='lead').length;
    const acked=s.alerts.filter(a=>a.ack),med=acked.length?acked.map(a=>a.ack.t-a.t).sort((x,y)=>x-y)[Math.floor(acked.length/2)]:null;
    const tile=(dot,l,v,d)=>`<div class="es-tile"><div class="h"><i class="es-dot" style="background:${dot}"></i>${l}</div><b>${v}</b><span class="d">${d}</span></div>`;
    const row=a=>{const i=info(a),tg=tagOf(a),p=V3.P(a.pid)||{};
      const left=i.left,over=left<0;
      let pill;
      if(a.ack)pill=['grey','Acknowledged by '+hesc(a.ack.by||RN[a.ack.role]||'')+' · '+V3.hm(a.ack.t)];
      else{const who=i.h==='rmo'?'With RMO':'Escalated · '+RN[i.h];
        const t=over?'overdue by '+mins(-left)+' min':mins(left)+' min left';
        pill=[(i.h!=='rmo'||left<=1)?'red':'amber',who+', '+t];}
      const step=(role,label,start,win)=>{
        const isN=role==='nurse',e=a.esc.find(x=>x.to===role),acked=a.ack&&a.ack.role===role,reached=isN||role==='rmo'||!!e;
        let st,txt;
        if(isN){st='';txt='Raised '+V3.hm(a.t);}
        else if(acked){st='ack';txt='Acknowledged '+V3.hm(a.ack.t);}
        else if(reached&&i.h===role&&!a.ack){st='cur';txt='Due by '+V3.hm(start+win);}
        else if(reached){st='miss';txt='No answer by '+V3.hm(start+win);}
        else{st='fut';txt=a.ack?'Not needed':'From '+V3.hm(start)+' if no answer';}
        const mark=st==='ack'?'✓ ':st==='miss'?'! ':st===''?'✓ ':'';
        return `<div class="es-s ${st}"><b>${mark}${label}</b>${txt}</div>`;};
      const act=V3.canAck(a)?`<button class="btn sm pri" onclick="V3.ackAlert('${a.id}')">Acknowledge</button>`
        :(a.ack&&!a.seen&&['rmo','psychiatrist','lead'].includes(S.role)?`<button class="btn sm" onclick="V3.seenAlert('${a.id}')">Mark at bedside</button>`:'');
      return `<article class="es-al ${pill[0]}"><div class="es-r1"><span class="es-tag ${tg[0]}">${hesc(tg[1])}</span><button class="es-name" onclick="go('#/patient/${a.pid}/overview')">${hesc(V3.pn(a.pid))}</button><span class="small muted">${hesc(p.room||'')} · raised ${V3.hm(a.t)} by ${hesc(a.by||'nurse')}</span></div>
        <div class="es-main"><div class="small" style="max-width:640px">${hesc(a.title)}${a.detail?`<span class="tiny muted" style="display:block;margin-top:2px">${hesc(a.detail)}</span>`:''}</div><div class="es-right"><span class="es-pill ${pill[0]}">${pill[1]}</span>${act}<button class="btn sm" onclick="psyToChart('${a.pid}')">Review treatment</button></div></div>
        <div class="es-steps">${step('nurse','Nurse',a.t,0)}${step('rmo','RMO',i.win.rmo[0],i.win.rmo[1])}${step('psychiatrist','Psychiatrist',i.win.psychiatrist[0],i.win.psychiatrist[1])}${step('lead','Floor lead',i.win.lead[0],i.win.lead[1])}</div></article>`;};
    return `<div class="es"><div><h2>Escalation chain</h2>
        <div class="es-chain"><span class="es-box">Nurse raises</span><span class="es-arrow">›</span><span class="es-box">RMO · ${R.rmo} min</span><span class="es-arrow">›</span><span class="es-box">Treating psychiatrist · ${R.psy} min</span><span class="es-arrow">›</span><span class="es-box">Floor lead · ${R.lead} min</span><span class="tiny muted" style="margin-left:6px">times for urgent alerts</span></div></div>
      <div class="es-tiles">${tile('var(--red)','Not acknowledged',notAck+' of '+open.length,'open alerts')}${tile('var(--amber)','Escalated past RMO',esc.length,withLead?withLead+' now with floor lead':'none with the floor lead')}${tile('#98a2b3','Median time to acknowledge',med==null?'–':med+' min','today')}</div>
      <div class="es-head"><h3>Open alerts</h3><span class="small muted">Most urgent first · now ${V3.hm(now)}</span></div><div class="es-list">${sorted.map(row).join('')||'<div class="es-empty"><div class="t">✓</div><div style="font-weight:700;margin-top:8px">No open alerts</div><div class="small muted">Every alert has been acknowledged and seen at the bedside.</div></div>'}</div></div>`;
  }
  /* marking an alert "at the bedside" takes it off this list and keeps it in the patient's Events log */
  const __sd=V3.seenDo;
  V3.seenDo=function(id){
    const a=v3().alerts.find(x=>x.id===id),was=a&&a.seen,out=__sd.apply(this,arguments);
    if(psy()&&a&&a.seen&&!was){
      const c=ptCtxOf(a.pid);c.events=c.events||[];
      c.events.unshift({id:Date.now(),when:atNow(),type:(a.src||'Nurse')+' alert',sev:'',by:(a.by||'Nurse')+' · nurse',duty:signer()+' · psychiatrist',detail:a.title+'. Seen at the bedside'+(a.seen.note?': '+a.seen.note:'.'),ack:true,ackBy:signer(),ackAt:atNow()});
    }
    return out;
  };
  const __esc=V3.escPage;
  V3.escPage=function(){return psy()?esc():__esc.apply(this,arguments);};

  /* ---- nurse-reported events ---- */
  const SERIOUS=['Seizure','Self-harm attempt','Absconding attempt','Medical emergency or transfer out','Choking'];
  const serious=e=>SERIOUS.includes(e.type)||e.sev==='Major';
  window.psyEvReview=function(id){
    const e=S.events.find(x=>x.id===id);if(!e)return;e.ack=true;e.ackBy=signer();e.ackAt=atNow();render();toast('Marked reviewed by '+signer());
  };
  window.psyEvView=function(pid){
    go('#/patient/'+pid+'/overview');
    setTimeout(()=>{S.evOpen=true;render();setTimeout(()=>{const x=document.getElementById('evcard');x&&x.scrollIntoView({behavior:'smooth'});},60);},80);
  };
  /* no orange strip on any tab (5 Nov 2026, owner): the old strip is switched off for the psychiatrist, and so is the Stay summary / Daily notes callout that replaced it */
  const __eb=eventsBar;
  eventsBar=function(){return psy()?'':__eb.apply(this,arguments);};

  const __ch=compactHeader;
  compactHeader=function(){
    const h=__ch.apply(this,arguments);if(!psy())return h;
    const open=(S.events||[]).filter(e=>!e.ack);if(!open.length)return h;
    const chip=`<button class="ev-chip ${serious(open[0])?'red':''}" title="Open the Events log" onclick="psyEvView('${S.pid}')">${open.length} event${open.length>1?'s':''} not reviewed</button>`;
    return h.replace(/(<h2 style="font-size:26px">[^<]*<\/h2>)/,'$1'+chip);
  };

  const prevVP=ROLE.psychiatrist.vPatient;
  ROLE.psychiatrist.vPatient=function(sub,base){
    let h=prevVP?prevVP(sub,base):base(sub);
    h=h.replace(/S\.events\.find\(x=>x\.id===(\d+)\)\.ack=true;render\(\);toast\('Marked reviewed'\)/g,'psyEvReview($1)');
    /* reviewed events keep who and when in the log */
    (S.events||[]).filter(e=>e.ackBy).forEach(e=>{const t='Reported by '+e.by+' · seen by '+e.duty;h=h.split(t).join(t+' · Reviewed by '+hesc(e.ackBy)+', '+hesc(e.ackAt||''));});
    return h;
  };
})();
