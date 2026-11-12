/* 13 Nov 2026, Trello 93 "signed notes should get locked, only addendum after that" (medico legal, NABH).
   Block 86 already locks the notes in Earlier notes (daily, round). This block locks the rest:
   - Admission workup (step 2): "Review and sign" signs it; once signed there is no Fill form, only "Add addendum"
   - Detailed capacity (step 3): once signed, read only plus "Add addendum"
   - Detailed history (step 4): once signed, read only plus "Add addendum"
   - Daily note for an older day: the Daily notes page asks which day the note is for; an older day is saved as a LATE ENTRY (shown with when it was written)
   - A second save of today's daily note does not replace the signed one: it becomes an addendum
   Psychiatrist and psychologist only; the addendum shows name, date and time under the note. */
(function(){
  const role=()=>{try{return (window.__TULASI__||{}).role||'';}catch(e){return '';}};
  const kind=()=>{const r=role();if(S.role==='psychologist'||/psycholog/.test(r))return 'psychologist';if(S.role==='psychiatrist'&&!/patient-experience|rmo/.test(r))return 'psychiatrist';return '';};
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);return m?decodeURIComponent(m[1]):'';};
  const esc2=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const css=document.createElement('style');css.id='lock-13nov-css';
  css.textContent=`.lkbox{margin:10px 20px 0;padding:10px 14px;border:1px solid #ABEFC6;background:#ECFDF3;border-radius:12px;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;font-size:13px;color:#067647}.lkbox b{color:#054F31}.lkbox .lk-a{flex-basis:100%;border-left:3px solid #1e6cdb;background:#f5f9ff;padding:6px 10px;border-radius:6px;color:#344054}`;
  document.head.appendChild(css);

  /* Neel's capacity assessment at admission was done and signed on 18 Oct (step 3 says Done), so it starts locked like his workup */
  try{const nx=psyPx('neel');if(nx&&!nx.capacitySigned){nx.capacitySigned={signedBy:'Dr. Aanya Sharma',signedAt:'18 Oct 2026, 1:30 pm',personType:'Nominated representative',person:'Ananya Bose (sister)',signature:'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="44"><text x="6" y="30" font-family="cursive" font-size="24" fill="#1d4ed8">Ananya Bose</text></svg>')};}}catch(e){}
  const signedWk=pid=>{const x=psyPx(pid);return !!(x&&x.wk&&x.wk.signed&&!x.wk.edited);};
  const signedCap=pid=>!!(psyPx(pid)||{}).capacitySigned;
  const histSigned=pid=>{try{if(pid==='neel')return S.historyStatus==='signed';const c=ptCtxOf(pid);return !!c&&c.historyStatus==='signed';}catch(e){return false;}};

  /* ---- guards: a signed form refuses edits even if a button is still on screen ---- */
  const refuse=()=>{toast('Signed and locked. Only an addendum can be added.');};
  ['psyWk','psyWkInv','psyWkRoutine'].forEach(n=>{const o=window[n];if(typeof o!=='function')return;window[n]=function(){const pid=S.pid||pidNow();if(signedWk(pid)){refuse();return;}return o.apply(this,arguments);};});
  ['psyCapSave','psyCapSign'].forEach(n=>{const o=window[n];if(typeof o!=='function')return;window[n]=function(){const pid=S.pid||pidNow();if(signedCap(pid)){refuse();return;}return o.apply(this,arguments);};});

  /* ---- sign the admission workup ---- */
  window.lkSignWk=function(pid){
    const w=psyPx(pid).wk;if(!w||!(w.reason||'').trim()){toast('Fill in the reason for admission first.');return;}
    const go=()=>{w.signed=true;w.edited=false;w.signedBy=signer();w.by=signer();w.at=atNow();render();toast('Admission workup signed by '+signer()+'. It is now locked; only an addendum can be added.');};
    if(typeof pinSign==='function')pinSign('Sign the admission workup',[['Signing as',signer()],['Patient',(typeof pt==='function'?(pt(pid)||{}).name:'')||pid]],go);else go();};

  /* ---- before drawing: a signed form is always shown read only ---- */
  const __r=render;
  render=function(){
    try{const k=kind(),pid=pidNow();if(k&&pid){if(signedWk(pid))S.wkView='read';if(signedCap(pid))S.capView='read';if(histSigned(pid))S.hview='read';}}catch(e){}
    const out=__r.apply(this,arguments);
    try{paintLocks();}catch(e){}
    return out;};

  function banner(pid,key,label,by,at,extra){
    const ad=(psyPx(pid).addenda||{})[key]||[];
    const d=document.createElement('div');d.className='lkbox';d.dataset.lk=key;
    d.innerHTML=`<span><b>Signed and locked</b>${by?' by '+esc2(by):''}${at?', '+esc2(at):''}. ${esc2(label)} cannot be edited or deleted. Only an addendum can be added.</span><button class="btn sm" onclick="lkAdd('${pid}','${key}')">Add addendum</button>${extra||''}${ad.map(a=>`<div class="lk-a"><b>Addendum</b> by ${esc2(a.by)}, ${esc2(a.at)}<div>${esc2(a.t)}</div></div>`).join('')}`;
    return d;}

  function paintLocks(){
    const v=document.getElementById('view'),k=kind(),pid=pidNow();if(!v||!k||!pid)return;
    /* Admission workup */
    const wc=v.querySelector('#workupCard');
    if(wc&&!wc.querySelector('[data-lk]')){
      const w=(psyPx(pid)||{}).wk||{};
      if(signedWk(pid)){
        const sg=wc.querySelector('.seg');if(sg&&sg.parentElement&&sg.parentElement!==wc)sg.parentElement.remove();
        const hd=wc.querySelector('.hd');if(hd)hd.after(banner(pid,'wk','The admission workup',w.signedBy||w.by,w.at));
      }else if((w.reason||'').trim()&&!wc.querySelector('[data-lksign]')){
        const row=wc.querySelector('.hd .row');if(row){const b=document.createElement('button');b.className='btn sm pri';b.dataset.lksign='1';b.textContent='Review and sign';b.onclick=()=>lkSignWk(pid);row.prepend(b);}
      }
    }
    /* Detailed capacity */
    const cc=v.querySelector('#capCard');
    if(cc&&!cc.querySelector('[data-lk]')&&signedCap(pid)){
      const sg=cc.querySelector('.seg');if(sg)sg.remove();
      const s=psyPx(pid).capacitySigned;
      const hd=cc.querySelector('.hd');if(hd)hd.after(banner(pid,'cap','The capacity assessment',s.signedBy,s.signedAt));
    }
    /* Detailed history */
    const hc=[...v.querySelectorAll('section.card')].find(s=>{const h3=s.querySelector('h3');return h3&&/^Detailed history/.test(h3.textContent.trim());});
    if(hc&&!hc.querySelector('[data-lk]')&&histSigned(pid)){
      hc.querySelectorAll('.seg,.hist-seg,#scrH').forEach(x=>x.remove());
      [...hc.querySelectorAll('button')].forEach(b=>{if(/^(Save draft|Review and sign|Draft with AI scribe|Fill form|AI-filled form|AI summary)/i.test(b.textContent.trim()))b.remove();});
      const hd=hc.querySelector('.hd');let by='',at='';try{by=S.historySignedBy||'';at=S.historySignedAt||'';}catch(e){}
      if(hd)hd.after(banner(pid,'hist','The detailed history',by,at));
    }
  }

  /* ---- Daily notes page: which day is the note for? An older day is a late entry ---- */
  const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  window.lkFor=function(v){S.eodFor=v||todayKey();render();};
  const __en=eodNotes;
  eodNotes=function(){
    const h=__en.apply(this,arguments);
    if(kind()!=='psychiatrist')return h;
    const f=S.eodFor||todayKey(),late=f<todayKey();
    return `<section class="card" style="margin-bottom:12px"><div class="pad row" style="gap:12px;align-items:center;flex-wrap:wrap"><label class="small" style="display:flex;gap:8px;align-items:center"><b>This note is for</b><input class="input" type="date" max="${todayKey()}" value="${f}" onchange="lkFor(this.value)" style="width:auto;min-height:36px"></label>${late?'<span class="chip c-amber">Late entry: saved with today\'s date and time, marked as written for an older day</span>':'<span class="small muted">Today. Pick an earlier day to record a late entry.</span>'}</div></section>`+h;};
  const __pn=window.psyNoteToProfile;
  window.psyNoteToProfile=function(id){
    const f=S.eodFor||todayKey(),late=f<todayKey(),d=new Date();
    const today=String(d.getDate()),my=d.toLocaleString('en-GB',{month:'short'})+' '+d.getFullYear();
    let exists=false;
    try{ptRun(id,()=>{exists=(S.dnHist||DN_HIST).some(n=>n.eodNote&&n.d===today&&n.my===my&&!n.late);return '';});}catch(e){}
    if(exists&&!late){
      /* today's signed note is not replaced: what was typed now becomes an addendum under it */
      try{const e=(S.eod||{})[id]||{},txt=[e.sleep&&'Sleep: '+e.sleep,e.meal&&'Appetite: '+e.meal,e.mood&&'Mood: '+e.mood,e.beh&&'Behaviour: '+e.beh,(e.line||'').trim()&&'Event: '+e.line.trim()].filter(Boolean).join('. ')||'Updated daily note';
        let key='';ptRun(id,()=>{const n=(S.dnHist||DN_HIST).find(x=>x.eodNote&&x.d===today&&x.my===my&&!x.late);if(n)key=lkKeyOf(n);return '';});
        const x=psyPx(id);x.addenda=x.addenda||{};(x.addenda[key]=x.addenda[key]||[]).push({t:txt,by:signer(),at:atNow()});
        toast('Today\'s daily note is already signed and locked. What you wrote was added as an addendum.');}catch(err){}
      return;}
    __pn.apply(this,arguments);
    if(late){
      try{const fd=new Date(f+'T12:00:00');
        ptRun(id,()=>{const n=(S.dnHist||DN_HIST)[0];if(n&&n.eodNote){n.d=String(fd.getDate());n.my=fd.toLocaleString('en-GB',{month:'short'})+' '+fd.getFullYear();n.late=true;n.eodNote=false;n.lateFor=f;}return '';});
        toast('Saved as a late entry for '+fd.getDate()+' '+fd.toLocaleString('en-GB',{month:'short'})+'. It shows when it was really written.');}catch(err){}
    }};
})();
