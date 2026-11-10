/* Psychologist only (10 Nov 2026 meeting audio, Rounds page). Block 62 removed the four psychiatrist boxes from the
   psychologist's Rounds but never put anything in their place, and the medicine chart was left on the page. Both of
   those were asked for in the meeting:
   1. "We have put it in that therapy plan ... this can be like a therapy plan free text box, then management plan, then
      you can give two drop boxes, one planned assessments ... and one planned behavioural activations" [9:51-10:57] —
      the card 62 wrote is now actually on the page, for the patient being seen.
   2. "We don't need to show this current medicine chart, we can remove it ... they can see that in vitals and
      medicines" [16:15-16:47] — the Medicine card is gone from the psychologist's Rounds only.
   The pieces this uses (pgRpTxt, pgRpAdd, pgRpDel, the .pg-rp styles) come from block 62, and pgMpLists and pgMpModal
   from block 57. Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  /* the patient being seen in this round */
  const roundPid=()=>{
    try{const R=S.rounds,w=(WARDS||{})[R.ward]||[];const p=w[R.idx[R.ward]];return p?p.id:null;}catch(e){return null;}
  };
  const lists=()=>(window.pgMpLists||{MODS:[],ACTS:[]});
  const plan=pid=>{const x=psyPx(pid);return x.roundPlan=x.roundPlan||{therapyPlan:'',assess:[],acts:[]};};

  const chips=(pid,k)=>{
    const a=plan(pid)[k]||[];
    return a.length?`<div class="pg-rp-chips">${a.map((x,i)=>`<span class="pg-rp-chip">${hesc(x)}<button type="button" aria-label="Remove ${hesc(x)}" onclick="pgRpDel('${pid}','${k}',${i})">×</button></span>`).join('')}</div>`:'';
  };
  const pick=(pid,k,list,ph)=>`<select class="input" aria-label="${hesc(ph)}" onchange="pgRpAdd('${pid}','${k}',this)"><option value="">${hesc(ph)}</option>${list.filter(x=>!(plan(pid)[k]||[]).includes(x)).map(x=>`<option>${hesc(x)}</option>`).join('')}</select>`;

  const card=pid=>{
    const m=(psyPx(pid).mgmtPsych)||{};
    const mp=[m.therapyPlan||m.therapies,m.goals&&('Goals: '+m.goals)].filter(Boolean).join('\n');
    const L=lists();
    return `<section class="card pg-rp" id="pgRp">
      <div class="pg-rp-b"><h4>Therapy plan</h4><div class="pg-rp-sub">Free text: therapies, assessment plans and anything new that came up in this round.</div>
        <textarea class="input" rows="4" placeholder="Write the therapy plan" oninput="pgRpTxt('${pid}',this.value)">${hesc(plan(pid).therapyPlan||'')}</textarea></div>
      <div class="pg-rp-b"><h4>Planned assessments</h4><div class="pg-rp-sub">From the assessments the psychiatrist allocates in the doctor portal.</div>${pick(pid,'assess',L.MODS,'Choose an assessment…')}${chips(pid,'assess')}</div>
      <div class="pg-rp-b"><h4>Planned behavioural activations</h4><div class="pg-rp-sub">Activities planned with the patient.</div>${pick(pid,'acts',L.ACTS,'Choose an activity…')}${chips(pid,'acts')}</div>
      <div class="pg-rp-b"><h4>Management plan</h4><div class="pg-rp-sub">Read only. Your plan for this stay.</div><div class="pg-rp-ro">${mp?hesc(mp):'Not written yet.'}</div>
        <div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" onclick="pgMpModal('${pid}')">${m.signed?'View management plan':'Open management plan'}</button></div></div></section>`;
  };

  const __vr=vRounds;
  vRounds=function(){
    const h=__vr.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content;
      /* the medicine chart belongs in Vitals and medicines, not here */
      R.querySelectorAll('section.card.pr-med').forEach(c=>c.remove());
      const pid=roundPid();
      if(pid&&!R.getElementById('pgRp')){
        const two=R.querySelector('.pr-two'),host=two?two.parentNode:null;
        const frag=tpl(card(pid)).content.firstElementChild;
        if(two&&host)host.insertBefore(frag,two.nextSibling);
        else{const last=[...R.querySelectorAll('section.card')].pop();if(last&&last.parentNode)last.parentNode.insertBefore(frag,last.nextSibling);}
      }
      return T.innerHTML;
    }catch(e){return h;}
  };
})();
