
/* Psychiatrist only (5 Nov 2026, Trello "can save notes without even writing anything").
   A daily note cannot be saved empty: Save note (and Ctrl + S) wait until all 10 questions are answered, and the event details
   are written when an event is picked. Disabled Save says what is left; clicking it jumps to the first unanswered question.
   A half-finished note stays as a draft and shows in Earlier notes ("Draft · 6 of 10 answered"). */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const left=()=>{const dn=S.dn||{};return dnKeys(dnSpec()).filter(k=>!(dn[k]||[]).length);};
  const evtOpen=()=>{const dn=S.dn||{},e=dn.evt||[];return e.length>0&&!(e.length===1&&e[0]==='None')&&!(dn.evl||'').trim();};
  function dnBlock(){
    const l=left();
    if(l.length)return {msg:'Answer the remaining '+l.length+' question'+(l.length>1?'s':'')+' to save',key:l[0]};
    if(evtOpen())return {msg:'Write the event details to save',key:'evl'};
    return null;
  }
  function dnJump(key){
    const el=document.querySelector(`[data-k="${key}"]`)||[...document.querySelectorAll('.dnr .input')].find(i=>/evl/.test(i.getAttribute('oninput')||''));
    const row=el&&(el.closest('.dnr')||el);if(!row)return;
    row.scrollIntoView({behavior:'smooth',block:'center'});
    row.style.transition='box-shadow .2s';row.style.boxShadow='0 0 0 3px var(--amber-line,#f5d9a8)';row.style.borderRadius='8px';
    setTimeout(()=>{row.style.boxShadow='';},1800);
    if(el.tagName==='INPUT')el.focus({preventScroll:true});
  }
  const saveBar=()=>{const b=dnBlock();
    return `<span class="tiny muted"><span class="kbd">Ctrl</span> + <span class="kbd">S</span> to save</span>${b?`<span class="small muted" id="dnWhy" style="margin-left:auto;margin-right:10px">${b.msg}</span>`:''}<button class="btn pri" ${b?'aria-disabled="true" style="opacity:.55"':''} onclick="saveDaily()">Save note</button>`;};

  const __save=saveDaily;
  saveDaily=function(){
    if(psy()){const b=dnBlock();if(b){toast(b.msg+'. Nothing was saved.');dnJump(b.key);return;}}
    return __save.apply(this,arguments);
  };

  const __pd=pDaily;
  pDaily=function(){
    const h=__pd.apply(this,arguments);if(!psy())return h;
    const keys=dnKeys(dnSpec()),n=keys.length-left().length;
    let out=h.replace(/<div class="dsave">[\s\S]*?<\/button><\/div>/,`<div class="dsave">${saveBar()}</div>`);
    if(!S.dailySaved&&n>0)out=out.replace('<div style="padding:6px 16px 16px">',`<div style="padding:6px 16px 16px"><div class="li" style="align-items:center"><div class="grow"><div style="font-weight:600">Draft · ${n} of ${keys.length} answered</div><div class="tiny muted">${hesc(signer())} · not saved yet. It stays here until you finish it.</div></div><span class="chip c-amber">Draft</span></div>`);
    return out;
  };

  const __prog=dnProg;
  dnProg=function(){__prog.apply(this,arguments);if(!psy())return;const d=document.querySelector('.dsave');if(d)d.innerHTML=saveBar();};
  /* typing the event details also unlocks Save */
  document.addEventListener('input',e=>{if(psy()&&e.target&&/evl/.test(e.target.getAttribute&&e.target.getAttribute('oninput')||'')){const d=document.querySelector('.dsave');if(d)d.innerHTML=saveBar();}});

  /* Rounds: a round cannot be saved with an empty note and no changes */
  const __cr=confirmRound;
  confirmRound=function(){
    if(psy()){const R=S.rounds||{};const note=(R.scribeNote||'').trim();
      if(!R.drafted&&!note&&!(typeof roundCount==='function'&&roundCount())){toast('Write the round note or make a change before saving. Nothing was saved.');const t=document.querySelector('textarea[oninput*="scribeNote"]');if(t)t.focus();return;}}
    return __cr.apply(this,arguments);
  };
})();
