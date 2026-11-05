
/* Psychiatrist only (5 Nov 2026).
   1. (REMOVED 5 Nov, team review: the Escalation chain page is gone for the psychiatrist; see the redirect below.) Trello "Redesign Escalation chain page": chain in one line, three tiles (Not acknowledged, Escalated past RMO, Median time to
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
  .ev-chip{border:1px solid var(--amber-line);background:var(--amber-bg);color:var(--amber);border-radius:99px;font:inherit;font-size:12px;font-weight:700;padding:2px 10px;cursor:pointer}
  .ev-chip.red{background:var(--red-bg);border-color:#f3c3be;color:var(--red)}`;
  document.head.appendChild(css);

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
  V3.escPage=function(){if(psy()){setTimeout(()=>go('#/myday'),0);return '';}return __esc.apply(this,arguments);};

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
