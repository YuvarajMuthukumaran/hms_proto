/* 20 Nov 2026, owner: every action in the eye window opens a pop-up (no page jump) and is saved.
   Psychiatrist and floor lead psychiatrist only (the eye window of block 26).
   - Take daily notes / Write the note / Open the note  -> the daily-note pop-up (psyPopNote, block 65)
   - Open rounds / footer Open Rounds                   -> Round note pop-up, saved to psyx.roundLog (shown in the Rounds tab)
   - Review treatment / result / restraint / follow-up / management plan -> Review pop-up with a required note;
     saved as "Action taken" on those items (psyx.taken, with name and time), alerts are acknowledged, the events log gets a line
   - Open full record stays as it is (a whole record cannot be a pop-up). */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  if(typeof window.psyEye!=='function')return;
  const E=s=>hesc(String(s==null?'':s));
  const txt=e=>(e&&e.textContent||'').trim();
  const ST={pid:'',cards:[]};

  /* which MAP items a card stands for (a merged card lists several lines) */
  function itemsOf(pid,card){
    const m=(window.__psyMap||{})[pid];if(!m)return [];
    const lines=[...card.querySelectorAll('.pd-dt > div')].map(txt);
    const whole=txt(card.querySelector('.pd-dt'));
    const chip=txt(card.querySelector('.pd-chip'));
    return m.items.filter(i=>i.lab&&i.lab[1]===chip&&(lines.length?lines.includes(i.txt):whole.indexOf(i.txt)===0));
  }
  function decorate(){
    const modal=document.getElementById('modal');if(!modal)return;
    const foot=modal.querySelector('.mf');if(!foot)return;
    const fm=(foot.innerHTML.match(/patient\/([^/'"]+)\/overview/)||[])[1];if(!fm)return;
    const pid=fm;ST.pid=pid;ST.cards=[];
    modal.querySelectorAll('.pd-det > .pd-di:not(.done)').forEach(card=>{
      const idx=ST.cards.push(itemsOf(pid,card))-1;
      card.querySelectorAll('.pd-da button').forEach(b=>{
        const t=txt(b);
        if(/^(Take daily notes|Write the note|Open the note)$/i.test(t))b.setAttribute('onclick',`closeModal();psyPopNote('${pid}')`);
        else if(/^Open rounds$/i.test(t))b.setAttribute('onclick',`closeModal();psyEyePop('${pid}',${idx},'round')`);
        else if(/^(Review treatment|Review the result|Review restraint record|Review follow-up|Open management plan)$/i.test(t))b.setAttribute('onclick',`closeModal();psyEyePop('${pid}',${idx},'review')`);
      });
    });
    [...foot.querySelectorAll('button')].forEach(b=>{if(/^Open Rounds$/i.test(txt(b)))b.setAttribute('onclick',`closeModal();psyEyePop('${pid}',-1,'round')`);});
  }
  const __eye=window.psyEye;
  window.psyEye=function(){const r=__eye.apply(this,arguments);try{decorate();}catch(e){}return r;};

  window.psyEyePop=function(pid,idx,mode){
    let p={};try{p=ptFind(pid)||{};}catch(e){}
    const items=idx>=0?(ST.pid===pid?ST.cards[idx]||[]:[]):[];
    ST.cur={pid,items,mode};
    const list=items.length?`<div class="pd-det" style="margin-bottom:10px">${items.map(i=>`<div class="pd-di"><div class="pd-dh"><span class="pd-chip ${i.lab[0]}">${E(i.lab[1])}</span></div><div class="pd-dt">${E(i.txt)}</div></div>`).join('')}</div>`:'';
    const isR=mode==='round';
    const lbl=isR?'Round note (required)':'What you reviewed and decided (required)';
    const ph=isR?'e.g. Seen on rounds, settled, continue the current plan, review again tomorrow':'e.g. Reviewed the chart, vitals repeated, plan unchanged';
    V3.modal((isR?'Round note · ':'Review · ')+E(p.name||'Patient'),isR?'Saved in this patient’s Rounds history. You stay on the dashboard.':'Saved as action taken with your name and time. You stay on the dashboard.',
      `${list}<label class="field"><span class="lbl">${lbl}</span><textarea class="input" id="epN" rows="4" placeholder="${ph}"></textarea><div id="epE" class="small" style="color:var(--red);display:none">Please write the note first</div></label>`,
      `<button class="btn" onclick="closeModal();S.__eyePid='${pid}';render()">Cancel</button><button class="btn pri" onclick="psyEyePopSave()">${isR?'Save round note':'Save review'}</button>`);
  };
  window.psyEyePopSave=function(){
    const c=ST.cur;if(!c)return;
    const n=(((document.getElementById('epN')||{}).value)||'').trim();
    if(!n){const e=document.getElementById('epE');if(e)e.style.display='block';return;}
    const pid=c.pid,w=whoAt(),x=psyPx(pid);x.taken=x.taken||{};
    if(c.mode==='round'){
      x.roundLog=x.roundLog||[];
      x.roundLog.unshift({at:w.at,ts:Date.now(),by:w.by,note:n,why:'',changes:[]});
    }
    c.items.forEach(i=>{
      x.taken[i.key]={by:w.by,at:w.at,note:n};
      if(i.id&&(i.k==='task'||i.k==='late')){S.done=S.done||{};S.done[i.id]=true;}
      if(i.k==='alert'&&i.aid){try{const a=v3().alerts.find(y=>y.id===i.aid);if(a&&!a.ack)a.ack={by:V3.byMe(),role:S.role,t:V3.now()};}catch(e){}}
    });
    try{V3.log(pid,S.role,'note',(c.mode==='round'?'Round note: ':'Reviewed: ')+n+' · '+w.by);}catch(e){}
    const m=(window.__psyMap||{})[pid];
    if(m&&m.items.some(i=>!(x.taken[i.key]||(i.id&&S.done&&S.done[i.id]))))S.__eyePid=pid;
    closeModal();render();toast((c.mode==='round'?'Round note saved by ':'Review saved by ')+w.by);
  };
})();
