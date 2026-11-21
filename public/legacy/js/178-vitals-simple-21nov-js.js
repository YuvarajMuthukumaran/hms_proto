/* 21 Nov 2026, Anu's team lead: "very complicated". Vitals and monitoring made simple, on every login that shows it (psychiatrist, floor lead, RMO, nurse...):
   - one title, one short line (the card used to repeat the title and a long legend)
   - date filter: All dates, Today, Last 7 days. From, To and Oldest first are behind "More filters" (open by themselves when one is in use)
   - "Add reading" is called "Add blood sugar" (that is what it records); "Add vitals" is the main button
   - the "Scheduled: BP, Pulse..." chips in the column heads are hidden (grey cells already say nothing is due)
   - "Other monitoring" is hidden when there is nothing in it
   Only the look changes: the same tables, buttons and saving. */
(function(){
  if(!document.getElementById('vs2-css')){const c=document.createElement('style');c.id='vs2-css';
    c.textContent='.vm10 .hd>h3,.vm10 .hd>.tiny.muted{display:none!important}'
      +'.vm10 .hd{justify-content:space-between;gap:10px;flex-wrap:wrap}'
      +'.vm10 .vs2-note{font-size:13px;color:#667085;flex:1;min-width:200px}'
      +'.vm10 table.vs th .vs-s{display:none!important}'
      +'.vm9-bar .vm9-hint{display:none}'
      +'.vm9-bar:not(.vs2-more) .vm9-group:nth-of-type(n+2){display:none}'
      +'.vm9-bar .vs2-tg{margin-left:auto;border:0;background:none;color:#1e6cdb;font-weight:600;font-size:13px;cursor:pointer;padding:6px 8px}';
    document.head.appendChild(c);}
  function tidy(){
    const v=document.getElementById('view');if(!v)return;
    /* one short line in the card header, in place of the title and the long legend */
    v.querySelectorAll('.vm10 .hd').forEach(h=>{
      if(!h.querySelector('.vs2-note')){const n=document.createElement('span');n.className='vs2-note';n.textContent='Grey: nothing due. Dash: not recorded yet. Red: out of range.';h.insertBefore(n,h.firstChild);}
    });
    v.querySelectorAll('.vm10 .hd button').forEach(b=>{
      const t=b.textContent.trim();
      if(/^(\+\s*)?Add reading$/.test(t)){b.innerHTML=b.innerHTML.replace('Add reading','Add blood sugar');}
      if(/^(\+\s*)?Add vitals$/.test(t))b.classList.add('pri');
    });
    /* the sub line under the page title */
    v.querySelectorAll('.psy-tx-head .small.muted').forEach(d=>{if(/What the doctor ordered/.test(d.textContent))d.textContent='Vitals and blood sugar, as recorded by the nurses.';});
    /* filters */
    v.querySelectorAll('.vm9-bar').forEach(bar=>{
      if(!bar.querySelector('.vs2-tg')){
        const b=document.createElement('button');b.type='button';b.className='vs2-tg';b.textContent='More filters';
        b.onclick=()=>{bar.classList.toggle('vs2-more');b.textContent=bar.classList.contains('vs2-more')?'Fewer filters':'More filters';};
        bar.insertBefore(b,bar.firstChild.nextSibling?bar.firstChild.nextSibling:null);bar.appendChild(b);
        const used=[...bar.querySelectorAll('input[type=date]')].some(i=>i.value)||[...bar.querySelectorAll('.vm9-seg button')].some((x,i)=>i===1&&x.classList.contains('on'));
        if(used){bar.classList.add('vs2-more');b.textContent='Fewer filters';}
      }
    });
    /* Other monitoring: nothing in it, nothing shown */
    v.querySelectorAll('.psy-tx-body > div').forEach(d=>{
      const h=d.querySelector(':scope > .hd h3');
      if(h&&/Other monitoring/.test(h.textContent)&&/No additional ongoing checks/.test(d.textContent))d.style.display='none';
    });
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{tidy();}catch(e){}return o;};
})();
