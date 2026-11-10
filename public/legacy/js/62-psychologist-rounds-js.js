/* Psychologist only (10 Nov 2026, team meeting audio, Rounds page). The four psychiatrist boxes (Monitoring, Investigations, Risks and instructions,
   Referral) are gone from the psychologist's Rounds (block 57); in their place, as the team asked:
   1. Therapy plan: one free-text box (therapies, assessment plans and anything new that came up in this round)
   2. Planned assessments: a drop-down (the assessments the psychiatrist allocates in the doctor portal); each pick is listed below
   3. Planned behavioural activations: a drop-down (take a walk, plan an outing, ...); each pick is listed below
   4. Management plan: read only, the psychologist's plan for the stay, with a button to open it
   Also: Dictate (voice to text, words only, no recording) next to the Therapy brief in the daily note.
   Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const L=()=>window.pgMpLists||{MODS:[],ACTS:[]};
  const rp=pid=>{const x=psyPx(pid);return x.roundPlan=x.roundPlan||{therapyPlan:'',assess:[],acts:[]};};
  const curPid=()=>{try{const R=S.rounds,W=WARDS[R.ward],p=W[Math.min(R.idx[R.ward],W.length-1)];return p&&p.id;}catch(e){return null;}};

  const css=document.createElement('style');css.id='psychologist-rounds-css';
  css.textContent=`
  .pg-rp{display:flex;flex-direction:column;gap:0}
  .pg-rp .pg-rp-b{padding:16px 20px;border-top:1px solid var(--line)}
  .pg-rp .pg-rp-b:first-of-type{border-top:0}
  .pg-rp h4{margin:0 0 8px;font-size:15px;font-weight:700}
  .pg-rp .pg-rp-sub{font-size:12.5px;color:var(--muted,#667085);margin:-4px 0 8px}
  .pg-rp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .pg-rp-chip{display:inline-flex;align-items:center;gap:6px;background:#eff8ff;border:1px solid #84caff;color:#175cd3;border-radius:99px;padding:4px 6px 4px 12px;font-size:13.5px;font-weight:600}
  .pg-rp-chip button{border:0;background:#d1e0ff;color:#175cd3;width:20px;height:20px;border-radius:50%;line-height:1;cursor:pointer;font-weight:700}
  .pg-rp-ro{background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:14px;white-space:pre-wrap}
  .pg-dict{display:inline-flex;align-items:center;gap:6px;margin-top:6px;border:1px solid #84caff;background:#eff8ff;color:#175cd3;border-radius:99px;padding:5px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
  .pg-dict.live{background:#175cd3;color:#fff;border-color:#175cd3}
  `;
  document.head.appendChild(css);

  window.pgRpTxt=function(pid,v){rp(pid).therapyPlan=v;};
  window.pgRpAdd=function(pid,k,sel){const v=sel.value;if(!v)return;const a=rp(pid)[k];if(!a.includes(v))a.push(v);render();};
  window.pgRpDel=function(pid,k,i){rp(pid)[k].splice(i,1);render();};

  const chips=(pid,k)=>{const a=rp(pid)[k];return a.length?`<div class="pg-rp-chips">${a.map((x,i)=>`<span class="pg-rp-chip">${hesc(x)}<button type="button" aria-label="Remove ${hesc(x)}" onclick="pgRpDel('${pid}','${k}',${i})">×</button></span>`).join('')}</div>`:'';};
  const pick=(pid,k,list,ph)=>`<select class="input" aria-label="${hesc(ph)}" onchange="pgRpAdd('${pid}','${k}',this)"><option value="">${hesc(ph)}</option>${list.filter(x=>!rp(pid)[k].includes(x)).map(x=>`<option>${hesc(x)}</option>`).join('')}</select>`;
  const card=pid=>{
    const m=(psyPx(pid).mgmtPsych)||{},plan=[m.therapyPlan||m.therapies,m.goals&&('Goals: '+m.goals)].filter(Boolean).join('\n');
    return `<section class="card pg-rp" id="pgRp"><div class="pg-rp-b"><h4>Therapy plan</h4><div class="pg-rp-sub">Free text: therapies, assessment plans and anything new that came up in this round.</div>
      <textarea class="input" rows="4" placeholder="Write the therapy plan" oninput="pgRpTxt('${pid}',this.value)">${hesc(rp(pid).therapyPlan)}</textarea></div>
      <div class="pg-rp-b"><h4>Planned assessments</h4><div class="pg-rp-sub">From the assessments the psychiatrist allocates in the doctor portal.</div>${pick(pid,'assess',L().MODS,'Choose an assessment…')}${chips(pid,'assess')}</div>
      <div class="pg-rp-b"><h4>Planned behavioural activations</h4><div class="pg-rp-sub">Activities planned with the patient.</div>${pick(pid,'acts',L().ACTS,'Choose an activity…')}${chips(pid,'acts')}</div>
      <div class="pg-rp-b"><h4>Management plan</h4><div class="pg-rp-sub">Read only. Your plan for this stay.</div><div class="pg-rp-ro">${plan?hesc(plan):'Not written yet.'}</div>
        <div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" onclick="pgMpModal('${pid}')">${m.signed?'View management plan':'Open management plan'}</button></div></div></section>`;
  };
  /* Dictate next to the Therapy brief (words only; nothing is recorded or stored) */
  let rec=null;
  const stop=()=>{try{if(rec){rec.onend=null;rec.stop();}}catch(e){}rec=null;document.querySelectorAll('.pg-dict.live').forEach(b=>{b.classList.remove('live');b.textContent='Dictate';});};
  window.pgDictate=function(id,btn){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition,ta=$(id);
    if(!SR||!ta){toast('This browser cannot listen. Type the brief instead.');return;}
    if(rec){stop();return;}
    rec=new SR();rec.continuous=true;rec.interimResults=false;rec.lang='en-IN';
    rec.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal){ta.value+=(ta.value&&!/\s$/.test(ta.value)?' ':'')+e.results[i][0].transcript.trim();ta.dispatchEvent(new Event('input',{bubbles:true}));}}};
    rec.onerror=()=>{toast('Could not listen. Check the microphone permission.');stop();};
    rec.onend=()=>{if(rec&&document.body.contains(ta)){try{rec.start();}catch(e){}}else stop();};
    try{rec.start();btn.classList.add('live');btn.textContent='Stop dictating';}catch(e){rec=null;}
  };
  const bits=v=>{
    v.querySelectorAll('textarea[id^="pnT-brief"]').forEach(ta=>{
      if(ta.dataset.pgD)return;ta.dataset.pgD='1';
      ta.insertAdjacentHTML('afterend',`<button type="button" class="pg-dict" onclick="pgDictate('${ta.id}',this)" aria-label="Dictate the therapy brief">Dictate</button>`);
    });
  };
  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{const v=$('view');if(v)bits(v);}catch(e){}}
    return out;
  };
})();
