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
  /* transfer notes (S.trLog) belong to the patient and are saved with the psychology record, which both the psychiatrist and the psychologist may write */
  try{if(Array.isArray(PT_KEYS)&&PT_KEYS.indexOf('trLog')<0)PT_KEYS.push('trLog');}catch(e){}
  const __sg=sugarModal;
  sugarModal=function(){
    if(!roleOk()){toast('Sugar readings are recorded by the nurse or the RMO');return;}
    __sg.apply(this,arguments);
    const i=$('sgV');if(i){i.value='';i.placeholder='e.g. 110';setTimeout(()=>i.focus(),0);}
  };

  /* The doctor's "Vitals and monitoring" table is redrawn from the real readings only. The older chain (blocks 54, 70, 86)
     filled the 1 pm and 9 pm slots with made-up values near the 9 am one and gave each cell a random nurse's initials.
     Now: one row per reading, its own time and who took it, the respiratory rate and the NEWS2 worked out from that reading. */
  const outR={bp:v=>{const m=String(v).match(/^(\d+)\/(\d+)/);return m&&(+m[1]>=140||+m[1]<90||+m[2]>=90);},hr:v=>+v>100||+v<50,t:v=>+v>=100.4||+v<96,o2:v=>+v<95,rr:v=>+v>20||+v<12};
  const cellV=(v,bad,ini,who)=>!v||v==='—'?'<span class="none">—</span>':`<span class="v${bad?' out':''}">${esc(v)}</span>${ini?`<span class="ini" title="${esc(who||ini)}">${esc(ini)}</span>`:''}`;
  function honest(){
    const card=document.querySelector('#view .vm10');if(!card)return;
    const tb=card.querySelector('table');if(!tb)return;
    const rows=(Array.isArray(S.vit)?S.vit:(S.pid==='neel'?NEEL_DEF:[])).slice().reverse();
    const sug=(S.sugarNew||[]);
    const head='<tr><th>Date</th><th>Time</th><th>Blood pressure<small>mmHg</small></th><th>Pulse<small>bpm</small></th><th>Resp. rate<small>per min</small></th><th>Temperature<small>°F</small></th><th>SpO2<small>%</small></th><th>NEWS2</th><th>Weight<small>kg</small></th><th>Sleep<small>hours</small></th><th>Blood sugar<small>mg/dL</small></th></tr>';
    const body=rows.map(v=>{
      const ini=v[8]||'',who=v[9]||'',rr=v[10]||'';
      let news='—';
      if(rr&&typeof psyNewsCalc==='function'){try{const m=String(v[1]).match(/^(\d+)/);const c=psyNewsCalc({rr:+rr,spo2:+v[4],o2:false,sbp:m?+m[1]:0,pulse:+v[2],cons:'Alert',temp:Math.round((+v[3]-32)*5/9*10)/10});news=c.total+(c.band?' · '+c.band:'');}catch(e){}}
      const sg=sug.filter(x=>String(x.at||'').indexOf(v[0])===0).map(x=>esc(x.when)+' '+esc(x.v)).join('<br>');
      return `<tr class="first"><td class="d">${esc(v[0])}</td><td class="t">${esc(v[7]||'—')}</td><td${outR.bp(v[1])?' class="outc"':''}>${cellV(v[1],outR.bp(v[1]),ini,who)}</td><td>${cellV(v[2],outR.hr(v[2]),ini,who)}</td><td>${cellV(rr,rr&&outR.rr(rr),ini,who)}</td><td>${cellV(v[3],outR.t(v[3]),ini,who)}</td><td>${cellV(v[4],outR.o2(v[4]),ini,who)}</td><td><b>${esc(news)}</b></td><td>${cellV(v[5],0,'','')}</td><td>${cellV(v[6],0,'','')}</td><td class="small">${sg||'<span class="none">—</span>'}</td></tr>`;
    }).join('');
    tb.innerHTML='<thead>'+head+'</thead><tbody>'+(body||'<tr><td colspan="11" class="muted small">No readings yet. The nurse or RMO adds them with Add vitals.</td></tr>')+'</tbody>';
    const note=card.querySelector('.hd .tiny');if(note)note.textContent='One row per reading, with the time and who took it. Out of range in red. NEWS2 is worked out from the reading.';
  }
  const __rh=render;
  render=function(){const out=__rh.apply(this,arguments);try{honest();}catch(e){}return out;};
  window.__vmHonest=honest;
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
