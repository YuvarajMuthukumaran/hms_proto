/* Psychologist only (10 Nov 2026): animated segmented controls (design from the AnimatedWebs generated "patient tabs", refined for a clinical screen).
   - Today: My / Ward / All patients. Patients: Mine / Whole ward.
   - Patient > Daily notes: the filter row becomes three small segmented controls (type of note, who wrote it, period) plus the search box.
   One soft grey track, one white pill that glides to the chosen option with a springy ease, a small count badge where the label carries a number,
   arrow keys, a visible focus ring, no motion for reduced-motion. The page is redrawn on every click, so the pill remembers where it was and slides from there.
   The psychiatrist's own filter row is untouched. Gated by S.role==='psychologist'. */
(function(){
  const me=()=>S.role==='psychologist';
  const css=document.createElement('style');css.id='psychologist-segmented-css';
  css.textContent=`
  .pg-seg{position:relative;display:inline-flex;gap:0;padding:4px;background:#e8f0fe;border:1px solid #cfdffb;border-radius:99px;box-shadow:inset 0 1px 2px rgba(23,92,211,.08);max-width:100%}
  .pg-seg .pg-ind{position:absolute;top:4px;bottom:4px;left:0;width:0;background:linear-gradient(180deg,#2f7df0,#175cd3);border-radius:99px;box-shadow:0 1px 2px rgba(16,24,40,.2),0 4px 10px rgba(23,92,211,.3),inset 0 1px 0 rgba(255,255,255,.28);transition:left .45s cubic-bezier(.34,1.45,.64,1),width .45s cubic-bezier(.34,1.45,.64,1),opacity .2s ease;z-index:1;pointer-events:none}
  .pg-seg.pg-none .pg-ind{opacity:0}
  .pg-seg.pg-noanim .pg-ind{transition:none}
  .pg-seg button{position:relative;z-index:2;display:inline-flex;align-items:center;gap:8px;border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:#175cd3;padding:8px 18px;border-radius:99px;cursor:pointer;white-space:nowrap;box-shadow:none!important;min-height:0;height:auto}
  .pg-seg button.on{background:linear-gradient(180deg,#2f7df0,#175cd3)!important;color:#fff;box-shadow:0 1px 3px rgba(23,92,211,.35)}
  .pg-seg .pg-ind{display:none!important}
  .pg-seg button:hover:not(.on){color:#0b3f9a}
  .pg-seg button:focus-visible{outline:2px solid #175cd3;outline-offset:2px}
  .pg-seg .pg-n{font-size:11.5px;font-weight:700;line-height:1;min-width:20px;text-align:center;padding:3px 7px;border-radius:99px;background:#d1e0ff;color:#175cd3}
  .pg-seg button.on .pg-n{background:rgba(255,255,255,.24);color:#fff}
  /* My / Ward / All patients and Mine / Whole ward: small, as wide as its words, on the left */
  .pg-scope.pg-seg,.pg-mine.pg-seg{display:flex;width:fit-content;max-width:100%;margin:0 0 10px 0;padding:3px;background:#dbe7fd;border:1px solid #9fbdf5;box-shadow:0 1px 4px rgba(23,92,211,.12),inset 0 1px 2px rgba(23,92,211,.08)}
  .pg-scope.pg-seg .pg-ind,.pg-mine.pg-seg .pg-ind{top:3px;bottom:3px}
  .pg-scope.pg-seg button,.pg-mine.pg-seg button{font-size:13px;font-weight:700;padding:5px 12px;gap:6px;color:#0f4bb5;flex:none}
  .pg-scope.pg-seg button.on,.pg-mine.pg-seg button.on{color:#fff}
  .pg-scope.pg-seg .pg-n,.pg-mine.pg-seg .pg-n{font-size:10.5px;min-width:16px;padding:2px 6px;background:#b9d0fa;color:#0f4bb5}
  .pg-scope.pg-seg button.on .pg-n,.pg-mine.pg-seg button.on .pg-n{background:rgba(255,255,255,.28);color:#fff}
  .pg-scope.pg-seg button,.pg-mine.pg-seg button{padding:5px 14px 5px 14px}.pg-scope.pg-seg .pg-n,.pg-mine.pg-seg .pg-n{margin-right:2px}
  .pg-add.pg-start:hover .pg-pl{transform:none}
  /* Daily notes filters */
  .pg-frow{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:2px 0 4px}
  .pg-frow .pg-seg{background:#edf3fe;border:1px solid #cfdffb;box-shadow:none}
  .pg-frow .pg-seg button{font-size:13px;padding:5px 13px;gap:6px}
  .pg-frow .pg-seg .pg-n{font-size:10.5px;min-width:16px;padding:2px 6px}
  .pg-frow .pg-seg{padding:3px}
  .pg-frow .pg-seg .pg-ind{top:3px;bottom:3px}
  .pg-frow #dnQ,.pg-frow .dn-search{margin-left:auto}
  @media (max-width:480px){.pg-seg button{padding:7px 12px;font-size:13px}.pg-scope .pg-n,.pg-mine .pg-n{display:none}}
  @media (prefers-reduced-motion:reduce){.pg-seg .pg-ind,.pg-seg button,.pg-seg .pg-n{transition:none}}
  `;
  document.head.appendChild(css);

  const prev={};
  const countFor=label=>{
    try{
      const my=PSY_EOD().length,all=PTS.length;
      if(/^(My patients|Mine)$/i.test(label))return my;
      if(/^(Ward patients|Whole ward|All patients)$/i.test(label))return all;
    }catch(e){}
    return null;
  };
  /* turns a container that holds buttons (one of them has class "on") into a segmented control */
  const seg=(el,key,counts)=>{
    el.classList.add('pg-seg');el.dataset.pgSeg='1';
    const ind=document.createElement('span');ind.className='pg-ind';ind.setAttribute('aria-hidden','true');el.prepend(ind);
    const btns=[...el.querySelectorAll(':scope>button')];
    btns.forEach(b=>{
      b.setAttribute('role','tab');b.tabIndex=b.classList.contains('on')?0:-1;b.setAttribute('aria-selected',b.classList.contains('on')?'true':'false');
      let n=null;
      if(counts==='label'){const t=b.textContent.trim(),m=t.match(/^(.*?)\s*·\s*(\d+)$/);if(m){b.textContent=m[1];n=m[2];}}
      else if(counts==='patients')n=countFor(b.textContent.trim());
      if(n!=null)b.insertAdjacentHTML('beforeend',`<span class="pg-n">${n}</span>`);
    });
    const place=animate=>{
      const on=el.querySelector(':scope>button.on'),from=prev[key];
      el.classList.toggle('pg-none',!on);
      if(!on){prev[key]=null;return;}
      const to={l:on.offsetLeft,w:on.offsetWidth};
      el.classList.add('pg-noanim');
      if(animate&&from){ind.style.left=from.l+'px';ind.style.width=from.w+'px';}
      else{ind.style.left=to.l+'px';ind.style.width=to.w+'px';}
      void ind.offsetWidth;el.classList.remove('pg-noanim');
      ind.style.left=to.l+'px';ind.style.width=to.w+'px';
      prev[key]=to;
    };
    place(true);
    window.addEventListener('resize',()=>{if(document.body.contains(el))place(false);},{once:true});
    el.addEventListener('keydown',e=>{
      if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
      const i=Math.max(0,btns.findIndex(b=>b.classList.contains('on'))),j=(i+(e.key==='ArrowRight'?1:btns.length-1))%btns.length;
      e.preventDefault();window.__pgSegFocus=key;btns[j].click();
    });
    if(window.__pgSegFocus===key){window.__pgSegFocus=null;const on=el.querySelector(':scope>button.on');if(on)on.focus();}
  };
  const upgradeTabs=el=>{
    if(el.dataset.pgSeg)return;
    seg(el,el.classList.contains('pg-scope')?'scope':'mine','patients');
  };
  /* Daily notes: split the chip row at its separators into groups, one segmented control each */
  const upgradeFilters=row=>{
    if(row.dataset.pgFrow)return;row.dataset.pgFrow='1';
    row.classList.add('pg-frow');
    /* keep the order of the row: type of note, who wrote it, period, search */
    const kids=[...row.children],groups=[[]];
    kids.forEach(k=>{
      if(k.classList&&k.classList.contains('dn9-sep')){groups.push([]);k.remove();}
      else groups[groups.length-1].push(k);
    });
    const keys=['ftype','fwho','fwhen'];let gi=0;
    groups.filter(g=>g.length).forEach(g=>{
      const btns=g.filter(k=>k.matches&&k.matches('button'));
      const chips=g.find(k=>k.classList&&k.classList.contains('mini-chips'));
      if(chips){seg(chips,keys[gi++]||'f0','label');chips.setAttribute('role','tablist');return;}
      if(!btns.length)return;
      const wrap=document.createElement('div');wrap.setAttribute('role','tablist');
      row.insertBefore(wrap,btns[0]);btns.forEach(b=>wrap.appendChild(b));
      seg(wrap,keys[gi++]||'f1',null);
    });
  };
  window.pgUpgradeFilters=upgradeFilters; /* the psychiatrist's Daily notes filters use the same segmented controls (called from the psychiatrist block) */
  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    if(me()){try{
      document.querySelectorAll('#view .pg-scope,#view .pg-mine').forEach(upgradeTabs);
      document.querySelectorAll('#view .psy-dn-filter-row').forEach(upgradeFilters);
    }catch(e){}}
    return out;
  };
})();
