/* 15 Nov 2026: "Add vitals" on a patient's Vitals and medicines tab really saves (it only showed a toast before).
   - The form starts empty (it was pre-filled with 124/80, 86, 98.6 ... so a reading could be saved without measuring).
   - BP, pulse, respiratory rate, temperature and SpO2 are required; weight and sleep are optional.
   - The reading goes into the patient's vitals table (S.vit, synced to the other roles as the "vitals" record) with the time
     and the initials of who took it, and into the ward reading used by NEWS2.
   - Only the nurse and the RMO record vitals (they are the roles that may save the vitals record). */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const NEEL_DEF=[['18 Oct','138/88','104','98.8','97','72.4','3'],['19 Oct','134/86','98','98.6','98','—','4'],['20 Oct','130/84','96','98.4','98','—','3.5'],['21 Oct','128/82','92','98.6','98','—','5'],['22 Oct','126/80','90','98.4','99','71.8','4'],['23 Oct','124/80','88','98.6','98','—','6.5']];
  const roleOk=()=>{const r=(window.__TULASI__||{}).role||S.role;return r==='nurse'||r==='rmo'||S.role==='nurse'||S.role==='rmo';};
  const F=[['vsBp','BP (mmHg)','e.g. 120/80',1],['vsHr','Pulse (per min)','e.g. 80',1],['vsRr','Resp. rate (per min)','e.g. 16',1],['vsT','Temp (°F)','e.g. 98.6',1],['vsO2','SpO2 (%)','e.g. 98',1],['vsWt','Weight (kg)','optional',0],['vsSl','Sleep (h)','optional',0]];
  vitalsModal=function(){
    if(!roleOk()){toast('Vitals are recorded by the nurse or the RMO');return;}
    openModal(`<div class="mh"><h3>Add vitals · ${esc((ptFind(S.pid)||{}).name||'')}</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb"><div class="grid2">${F.map(f=>`<label class="field"><span class="lbl">${f[1]}${f[3]?'':' <span class="tiny muted">(optional)</span>'}</span><input class="input" id="${f[0]}" placeholder="${f[2]}" inputmode="decimal" autocomplete="off"></label>`).join('')}</div>
      <div class="tiny muted" style="margin-top:8px">Saved with your name and the time. The doctor's NEWS2 uses this reading.</div></div>
      <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="vitalsSave()">Save</button></div>`);
  };
  /* sugar readings: one list per patient (it was shared by every patient), synced with the vitals record; the reading starts empty */
  try{if(Array.isArray(PT_KEYS)&&PT_KEYS.indexOf('sugarNew')<0)PT_KEYS.push('sugarNew');}catch(e){}
  const __sg=sugarModal;
  sugarModal=function(){
    if(!roleOk()){toast('Sugar readings are recorded by the nurse or the RMO');return;}
    __sg.apply(this,arguments);
    const i=$('sgV');if(i){i.value='';i.placeholder='e.g. 110';setTimeout(()=>i.focus(),0);}
  };
  window.vitalsSave=function(){
    const g=id=>(($(id)||{}).value||'').trim();
    const bp=g('vsBp'),hr=g('vsHr'),rr=g('vsRr'),t=g('vsT'),o2=g('vsO2'),wt=g('vsWt'),sl=g('vsSl');
    const m=bp.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
    if(!m){toast('Write the BP as two numbers, e.g. 120/80');return;}
    const num=(v,lo,hi,lab)=>{const n=+v;if(!v||!isFinite(n)||n<lo||n>hi){toast('Check the '+lab+' ('+lo+' to '+hi+')');return null;}return n;};
    const nhr=num(hr,20,250,'pulse');if(nhr==null)return;
    const nrr=num(rr,4,60,'respiratory rate');if(nrr==null)return;
    const nt=num(t,90,110,'temperature in °F');if(nt==null)return;
    const no2=num(o2,50,100,'SpO2');if(no2==null)return;
    if(wt&&num(wt,2,300,'weight')==null)return;
    if(sl&&num(sl,0,24,'sleep hours')==null)return;
    const who=signer(),ini=String(who).replace(/^Dr\.\s+/,'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const now=new Date(),day=now.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),tm=now.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
    if(!Array.isArray(S.vit))S.vit=S.pid==='neel'?NEEL_DEF.map(r=>r.slice()):[];
    S.vit=S.vit.concat([[day,bp,String(nhr),String(nt),String(no2),wt||'—',sl||'—',tm,ini,who,String(nrr)]]);
    try{const s=v3();s.vit=s.vit||{};s.vit.last=s.vit.last||{};s.vit.hist=s.vit.hist||{};
      const r={t:V3.now(),sbp:+m[1],dbp:+m[2],hr:nhr,rr:nrr,temp:nt,spo2:no2,by:who};
      s.vit.last[S.pid]=r;(s.vit.hist[S.pid]=s.vit.hist[S.pid]||[]).push(r);}catch(e){}
    closeModal();render();toast('Vitals saved by '+who+' at '+tm);
  };
})();
