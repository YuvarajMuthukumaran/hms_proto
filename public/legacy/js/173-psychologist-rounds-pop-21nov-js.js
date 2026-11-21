/* 21 Nov 2026, owner: Rounds pop-up for the psychologist (matches psychiatrist block 162 + 156 + 170).
   Psychologist and floor lead psychologist only.
   1. Rounds pop-up: Open Rounds in the eye window (pgEye), Take Action (pgMenu), and Rounds tab opens
      a pop-up instead of jumping to a page.
      - Required round note, saved to psyx.roundLogPsy (block 153).
      - Decision lines: Advice to nurses, Therapy change, Referral (medicine changes do not apply).
      - Sends advice lines to nurses instruction list (S.nInstr).
   2. Take Action pop-ups: Open Rounds in pgMenu opens the Rounds pop-up.
   3. Back to the eye window (block 170 equivalent for psychologist):
      Cancelling, closing or saving any pop-up opened from pgEye (daily note, rounds, therapy, management plan,
      action taken, event, family call) returns to the eye window of that patient. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychologist|floor-lead-psychologist)$/.test(ROLE))return;

  const E=s=>hesc(String(s==null?'':s));
  const TYPES=[
    ['Advice','Advice to the nurses','c-amber','e.g. Keep the patient in the common area, monitor interactions'],
    ['Therapy','Therapy change','c-blue','e.g. Individual CBT twice weekly; focus on distress tolerance'],
    ['Referral','Referral','c-grey','e.g. Physician review for sleep complaints']
  ];
  const tyOf=t=>TYPES.find(x=>x[0]===t)||TYPES[0];

  const RP={pid:'',list:[],ty:'Advice'};

  const css=document.createElement('style');css.id='pg-rounds-popup-css';
  css.textContent=`
    #rpBoxPsy{border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;margin:2px 0 12px;background:#fbfcfe}
    #rpBoxPsy .rp-add{display:grid;grid-template-columns:170px minmax(0,1fr) auto;gap:8px;align-items:center}
    #rpBoxPsy .rp-l{display:flex;flex-direction:column;gap:6px;margin-top:10px}
    #rpBoxPsy .rp-i{display:flex;align-items:center;gap:8px;font-size:13.5px;padding:7px 10px;border:1px solid #e3eaf2;border-radius:10px;background:#fff}
    #rpBoxPsy .rp-i b{margin-right:auto;font-weight:600}
    #rpBoxPsy .rp-x{border:0;background:none;color:#667085;font-size:18px;cursor:pointer;line-height:1}
    @media(max-width:620px){#rpBoxPsy .rp-add{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);

  function paintList(){
    const el=document.getElementById('rpListPsy');if(!el)return;
    el.innerHTML=RP.list.map((r,i)=>`<div class="rp-i"><span class="chip ${tyOf(r.ty)[2]}">${E(tyOf(r.ty)[1])}</span><b>${E(r.text)}</b><button type="button" class="rp-x" aria-label="Remove" onclick="rpDelPsy(${i})">✕</button></div>`).join('');
  }
  window.rpTypePsy=function(v){
    RP.ty=v;const t=document.getElementById('rpTextPsy');if(t)t.placeholder=tyOf(v)[3];
  };
  window.rpAddPsy=function(){
    const t=document.getElementById('rpTextPsy');const v=((t||{}).value||'').trim();
    if(!v){if(t)t.focus();return;}
    RP.list.push({ty:RP.ty,text:v});
    t.value='';paintList();t.focus();
  };
  window.rpDelPsy=function(i){
    RP.list.splice(i,1);paintList();
  };

  /* Rounds Pop-up for Psychologist */
  window.pgRoundPop=function(pid){
    RP.pid=pid;RP.list=[];RP.ty='Advice';
    let p={};try{p=ptFind(pid)||{};}catch(e){}
    const pn=p.name||'Patient';
    const sub=[p.room?'Room '+p.room:'',p.dx||'','Recorded by '+signer()+', '+atNow()].filter(Boolean).join(' · ');

    const body=`<div id="rpBoxPsy">
      <div class="lbl" style="margin-bottom:8px"><b>What was decided on the round</b> <span class="tiny muted">(advice, therapy, referral)</span></div>
      <div class="rp-add">
        <select class="input" id="rpTypePsy" onchange="rpTypePsy(this.value)">${TYPES.map(t=>`<option value="${t[0]}">${E(t[1])}</option>`).join('')}</select>
        <input class="input" id="rpTextPsy" placeholder="${E(TYPES[0][3])}" onkeydown="if(event.key==='Enter'){event.preventDefault();rpAddPsy()}">
        <button type="button" class="btn" onclick="rpAddPsy()">Add</button>
      </div>
      <div class="rp-l" id="rpListPsy"></div>
    </div>
    <label class="field" style="margin-top:10px">
      <span class="lbl"><b>Round note</b> <span style="color:#d92d20">*</span> <span class="tiny muted">(required)</span></span>
      <textarea class="input" id="pgRnNote" rows="4" placeholder="Summary of patient status, engagement, progress and plan for this round"></textarea>
    </label>`;

    const foot=`<button type="button" class="btn" style="margin-right:auto" onclick="closeModal();go('#/patient/${String(pid).replace(/'/g,'')}/overview')">Open full record</button>
      <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn pri" onclick="pgRoundPopSave('${String(pid).replace(/'/g,'')}')">Save round note</button>`;

    V3.modal('Rounds · '+E(pn),E(sub),body,foot);
    const m=document.querySelector('.modal');if(m)m.style.width='min(720px,100%)';
    setTimeout(()=>{const ta=document.getElementById('pgRnNote');if(ta)ta.focus();},60);
  };

  window.pgRoundPopSave=function(pid){
    const ta=document.getElementById('pgRnNote');
    const note=((ta||{}).value||'').trim();
    if(!note){
      if(ta){ta.style.borderColor='#d92d20';ta.focus();}
      if(typeof toast==='function')toast('Please enter the round note before saving');
      return;
    }
    const pending=(((document.getElementById('rpTextPsy')||{}).value)||'').trim();
    if(pending)RP.list.push({ty:RP.ty,text:pending});

    const x=typeof psyPx==='function'?psyPx(pid):{};
    x.roundLogPsy=x.roundLogPsy||[];
    const changes=RP.list.map(c=>({t:tyOf(c.ty)[1],d:c.text}));
    x.roundLogPsy.unshift({
      at:atNow(),
      ts:Date.now(),
      by:signer(),
      note:note,
      why:'',
      changes:changes
    });

    let p={};try{p=ptFind(pid)||{};}catch(e){}
    const pn=p.name||'Patient',by=signer()+' · round just now';
    S.nInstr=S.nInstr||[];
    RP.list.forEach(c=>{
      S.nN=(S.nN||0)+1;
      const t=tyOf(c.ty);
      S.nInstr.unshift([pn,by,c.text,t[0]==='Referral'?'Referral':t[0],t[2],'','n'+S.nN]);
    });

    try{
      const tk=(psyPx(pid).taken)||{};
      tk['rounds']=true;
    }catch(e){}

    if(typeof toast==='function')toast('Round note saved for '+pn);
    closeModal();
    if(typeof render==='function')render();
  };

  /* Intercept psyOpenRounds for psychologist to open pop-up */
  const __por=window.psyOpenRounds;
  window.psyOpenRounds=function(pid){
    if(ROLE.indexOf('psychologist')!==-1&&pid){
      window.pgRoundPop(pid);
      return;
    }
    if(typeof __por==='function')return __por.apply(this,arguments);
  };

  /* Take Action menu (pgMenu): Open Rounds opens pgRoundPop */
  if(typeof window.pgMenu==='function'){
    const __pm=window.pgMenu;
    window.pgMenu=function(ev,pid){
      const r=__pm.apply(this,arguments);
      try{
        const el=document.getElementById('pdMenu');
        if(el){
          el.querySelectorAll('.pdm-i').forEach(b=>{
            const t=((b.querySelector('b')||{}).textContent||'').trim();
            if(/^(Open rounds|Rounds|Round note)$/i.test(t)){
              b.setAttribute('onclick',`pdMenuClose();pgRoundPop('${pid}')`);
            }
          });
        }
      }catch(e){}
      return r;
    };
  }

  /* Eye window (pgEye): Open Rounds opens pgRoundPop */
  if(typeof window.pgEye==='function'){
    const __pe=window.pgEye;
    window.pgEye=function(pid){
      const r=__pe.apply(this,arguments);
      try{
        const m=document.querySelector('.modal');
        if(m){
          m.querySelectorAll('button').forEach(b=>{
            if(/Open Rounds/i.test(b.textContent||'')&&/psyOpenRounds/i.test(b.getAttribute('onclick')||'')){
              b.setAttribute('onclick',`closeModal();pgRoundPop('${pid}')`);
            }
          });
        }
      }catch(e){}
      return r;
    };
  }

  /* Return to Eye Window (block 170 behavior for psychologist) */
  let eyePid=null,shown=false,back=null,lastEye=null;
  const isModalOpen=()=>{const s=document.getElementById('scrim');return !!(s&&s.classList.contains('show'));};

  function wrapPsychEye(){
    const e=window.pgEye;
    if(typeof e==='function'&&!e.__backEye){
      window.pgEye=function(pid){
        const r=e.apply(this,arguments);
        eyePid=pid;shown=isModalOpen();back=null;
        return r;
      };
      Object.keys(e).forEach(k=>{if(k.indexOf('__')===0)window.pgEye[k]=e[k];});
      window.pgEye.__backEye=1;
    }

    ['pgNoteModal','pgTherapyModal','pgMpModal','pgLogAction','pgEventModal','faCall','pgRoundPop'].forEach(n=>{
      const f=window[n];
      if(typeof f!=='function'||f.__backEye)return;
      window[n]=function(){
        const from=(shown&&isModalOpen())||(lastEye&&Date.now()-lastEye.t<400)?eyePid:null;
        lastEye=null;
        const r=f.apply(this,arguments);
        if(from){back=from;shown=false;}
        return r;
      };
      Object.keys(f).forEach(k=>{if(k.indexOf('__')===0)window[n][k]=f[k];});
      window[n].__backEye=1;
    });
  }

  const __close=closeModal;
  closeModal=function(){
    const r=__close.apply(this,arguments);
    if(back){
      const pid=back,h=location.hash;
      back=null;
      setTimeout(()=>{
        if(location.hash!==h||isModalOpen())return;
        try{window.pgEye(pid);}catch(e){}
      },120);
    }else{
      if(shown)lastEye={t:Date.now()};
      shown=false;
    }
    return r;
  };

  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{wrapPsychEye();}catch(e){}
    return o;
  };
  wrapPsychEye();
})();
