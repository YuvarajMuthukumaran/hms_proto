/* Psychologist only (10 Nov 2026, team meeting audio): the last three things from the recording.
   1. "What is this system data? This is not even relevant, it's coming everywhere" — nothing is labelled System on the
      psychologist's screens any more. An entry the ward recorded by itself shows where it came from (front desk, shift grid,
      escalation chain), and System is gone from the timeline's "By" list.
   2. Ward and all patients: "we can just put log event. If something happens, they can log an event" — Take Action has
      Log an event for any patient on the floor, not only the psychologist's own.
   3. "Transfer patient again will open that handover" — after a transfer the patient's handover note opens, so the notes
      go with the patient.
   Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const nm=pid=>{const p=ptFind(pid);return p?p.name:'';};

  /* ---------- 1. no "System" label ---------- */
  if(V3 && typeof V3.rd==='function'){
    const __rd=V3.rd;
    V3.rd=function(role){
      const out=__rd.apply(this,arguments);
      if(!me()||role!=='system')return out;
      return String(out).replace('title="System"','title="Recorded automatically"').replace(/>S</,'>·<');
    };
  }
  if(V3 && typeof V3.tlPage==='function'){
    const __tl=V3.tlPage;
    V3.tlPage=function(){
      const h=__tl.apply(this,arguments);
      if(!me()||typeof h!=='string')return h;
      try{
        const T=tpl(h),R=T.content;
        R.querySelectorAll('option').forEach(o=>{if(o.value==='system'||o.textContent.trim()==='System')o.remove();});
        if(S.v3&&S.v3.ui&&S.v3.ui.tlR==='system')S.v3.ui.tlR='all';
        /* a row that the ward recorded by itself says where it came from, not "System" */
        R.querySelectorAll('span.tiny.muted').forEach(s=>{
          const t=s.textContent;
          if(/^System · /.test(t))s.textContent=t.replace(/^System · /,'');
          else if(t.trim()==='System')s.textContent='Recorded by the ward system';
        });
        return T.innerHTML;
      }catch(e){return h;}
    };
  }
  /* the round brief lines carry the source instead of the word System */
  if(V3 && typeof V3.rpTimeline==='function'){
    const __rp=V3.rpTimeline;
    V3.rpTimeline=function(){
      const h=__rp.apply(this,arguments);
      if(!me()||typeof h!=='string')return h;
      return h.split('>System · ').join('>').split('title="System"').join('title="Recorded automatically"');
    };
  }

  /* ---------- 2. Log an event, for any patient on the floor ---------- */
  const EVT=['Clinical event','Behaviour or safety','Family or visitor','Therapy session missed','Patient request','Ward or facility','Other'];
  window.pgEventModal=function(pid){
    V3.modal('Log an event · '+hesc(nm(pid)),'For any patient on the floor, including a colleague’s. The treating team is told.',
      `<label class="field"><span class="lbl">What kind of event</span><select class="input" id="pgEvT">${EVT.map(o=>`<option>${o}</option>`).join('')}</select></label>
       <label class="field" style="margin-top:10px"><span class="lbl">What happened (required)</span><textarea class="input" id="pgEvD" rows="4" placeholder="e.g. Refused the morning group; agitated after a family call. Nurse informed."></textarea><div id="pgEvE" class="small" style="color:var(--red);display:none">Write what happened</div></label>
       <div class="callout grey small" style="margin-top:10px">It is kept under your name and time. Medicines and treatment are not changed here — the treating psychiatrist or the RMO does that.</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgEventSave('${pid}')">Log the event</button>`);
  };
  window.pgEventSave=function(pid){
    const d=(($('pgEvD')||{}).value||'').trim(),t=(($('pgEvT')||{}).value||EVT[0]);
    if(!d){const e=$('pgEvE');if(e)e.style.display='block';return;}
    const w=typeof whoAt==='function'?whoAt():{by:signer(),at:atNow()};
    S.events=S.events||[];
    S.events.unshift({id:Date.now(),when:'Today, now',type:t,sev:'',by:w.by,duty:'Psychologist',detail:nm(pid)+' · '+d,ack:false});
    try{V3.log(pid,'psychologist','note',t+': '+d+' · '+w.by);}catch(e){}
    closeModal();render();
    toast('Event logged for '+nm(pid)+'. The treating team can see it.');
  };
  if(typeof window.pgMenu==='function'){
    const __gm=window.pgMenu;
    window.pgMenu=function(ev,pid){
      const r=__gm.apply(this,arguments);
      const el=document.getElementById('pdMenu');
      if(el&&me()&&!el.querySelector('[data-pgev]')){
        el.insertAdjacentHTML('beforeend',`<button class="pdm-i" data-pgev="1" onclick="pdMenuClose();pgEventModal('${pid}')"><b>Log an event</b><span>Anything that happened on the floor</span></button>`);
        try{
          const b=ev.currentTarget.getBoundingClientRect();
          {const z=parseFloat(getComputedStyle(document.body).zoom)||1;el.style.top=(Math.min(b.bottom+6,innerHeight-el.offsetHeight*z-12)/z)+'px';}
        }catch(e){}
      }
      return r;
    };
  }

  /* ---------- 3. a transfer opens the handover note ---------- */
  if(typeof window.doTransfer==='function'){
    const __dt=window.doTransfer;
    window.doTransfer=function(){
      const before=(S.trLog||[]).length;
      const r=__dt.apply(this,arguments);
      if(!me())return r;
      if((S.trLog||[]).length>before&&typeof window.pgHoEdit==='function'){
        const pid=S.pid;
        setTimeout(()=>{try{pgHoEdit(pid);toast('Write the handover for '+nm(pid)+' so the notes go with the patient');}catch(e){}},260);
      }
      return r;
    };
  }
})();
