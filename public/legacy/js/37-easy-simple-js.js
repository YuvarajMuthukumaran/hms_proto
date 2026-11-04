
/* Simple dashboard for the nurse and the RMO (5 Nov 2026, owner: "RMO and Nurse looks so complicated").
   One page, four parts, nothing else on show:
     1. Start here        the one thing to do first, with its button
     2. What to do next   the rest of the to-do list, one row each, one button each (first 5, the rest behind "Show more")
     3. My patients       plain cards: name, room, one line of what is going on; tap a card to open the patient
     4. More tools        CLOSED by default: the old boards (Ward care, Your duty work) are still here, one tap away
   The to-do list is built from the same data as before (alerts, results, tasks, the doctor's instructions); no task was removed.
   Used by 35-nurse-easy and 36-rmo-easy. The psychiatrist, psychologist and floor lead do not use it. */
(function(){
  const css=document.createElement('style');css.id='easy-simple-css';
  css.textContent=`
  .ez{display:flex;flex-direction:column;gap:18px}
  .ez h3.ez-h{font-size:16px;margin:0}
  .ez-card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .ez-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;flex-wrap:wrap}
  .ez-row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-top:1px solid var(--line-2)}
  .ez-lab{flex:0 0 74px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-radius:99px;padding:3px 0;text-align:center}
  .ez-lab.red{background:var(--red-bg);color:var(--red)}.ez-lab.amber{background:var(--amber-bg);color:var(--amber)}.ez-lab.blue{background:var(--blue-tint);color:var(--blue-ink)}.ez-lab.grey{background:var(--grey-bg);color:var(--grey)}
  .ez-txt{flex:1;min-width:0;font-size:14.5px;line-height:1.4}
  .ez-acts{display:flex;align-items:center;gap:10px;flex:0 0 auto}
  .ez-link{border:0;background:none;color:var(--muted);font:inherit;font-size:13px;cursor:pointer;text-decoration:underline;padding:0}
  .ez-det>summary{cursor:pointer;list-style:none;padding:14px 20px;font-weight:600;font-size:14px;border-top:1px solid var(--line-2);color:var(--blue-ink)}
  .ez-det>summary::-webkit-details-marker{display:none}
  .ez-det>summary:before{content:'›';display:inline-block;margin-right:8px;transition:transform .15s}
  .ez-det[open]>summary:before{transform:rotate(90deg)}
  .ez-pts{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;padding:0 20px 20px}
  .ez-pt{position:relative;text-align:left;font:inherit;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px 14px 18px;cursor:pointer;display:flex;flex-direction:column;gap:3px;min-height:92px}
  .ez-pt:hover{border-color:#9dbdf0;background:#f8fbff}
  .ez-pt:before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:4px;border-radius:0 4px 4px 0;background:#cfd6e0}
  .ez-pt.red:before{background:var(--red)}.ez-pt.amber:before{background:#e5a13a}.ez-pt.ok:before{background:#2e9e5b}
  .ez-pt b{font-size:15px}.ez-pt .r{font-size:12.5px;color:var(--muted)}
  .ez-pt .s{font-size:13px;line-height:1.35;margin-top:4px}.ez-pt .s.red{color:var(--red)}.ez-pt .s.amber{color:var(--amber)}.ez-pt .s.ok{color:var(--green)}
  .ez-pt .t{position:absolute;right:12px;top:12px;font-size:10.5px;font-weight:700;border-radius:99px;padding:1px 8px}
  .ez-pt .t.amber{background:var(--amber-bg);color:var(--amber)}.ez-pt .t.blue{background:var(--blue-tint);color:var(--blue-ink)}
  .ez-search{width:260px;min-height:38px;margin:0}
  .ez-more-body{padding:4px 20px 20px;display:flex;flex-direction:column;gap:16px}
  /* no extra tab row on this page (Today | Care, Today | Handover): the boards are under More tools and boards */
  body.easy-simple .sgtabs{display:none!important}
  .ez-pt{min-height:78px}
  @media (max-width:700px){.ez-row{flex-wrap:wrap}.ez-lab{flex-basis:auto;padding:3px 10px}.ez-acts{width:100%}}`;
  document.head.appendChild(css);
  const __render=render;
  render=function(){document.body.classList.toggle('easy-simple',S.role==='nurse'||S.role==='rmo');return __render.apply(this,arguments);};

  window.ezFind=function(q){q=String(q||'').toLowerCase();
    document.querySelectorAll('.ez-pt').forEach(c=>{c.style.display=(c.dataset.n||'').includes(q)?'':'none';});
    document.querySelectorAll('details.ez-rest').forEach(d=>{d.open=q!==''||!!S.ezAllPts;});}; /* a search also looks inside "Show all patients" */
  window.ezMore=function(on){S.ezMore=on;render();};

  /* the doctor's instructions are written into the old page; read them from there so nothing is lost */
  function instructionsOf(baseHtml){
    const d=document.createElement('div');d.innerHTML=baseHtml;const out=[];
    d.querySelectorAll('.card.wide .li').forEach(li=>{
      const seen=[...li.querySelectorAll('button')].find(b=>/Mark seen/.test(b.textContent));
      if(!seen)return;
      const who=(li.querySelector('.grow > div')||{}).textContent||'',txt=(li.querySelector('.small')||{}).textContent||'';
      out.push({who:easyPlain(who),txt:easyPlain(txt),why:'New instruction from the doctor',btn:['Mark seen',seen.getAttribute('onclick')]});
    });
    return out;
  }

  /* o: {base, boards:{keep:[...],grid:[...]}, pts, tab, hint, btns, items(T,instr), line(p,T)->items[], clear, taskDone:bool} */
  window.easySimple=function(o){
    $('title').textContent='Inpatients';
    const T=tasks().filter(t=>!S.done[t.id]&&t.taskType!=='alert'&&t.taskType!=='countersign');
    const cfg={base:o.base,keep:o.boards.keep,grid:o.boards.grid,pts:o.pts};
    const baseHtml=dtBaseHtml(cfg);
    const items=o.items(T,instructionsOf(baseHtml));
    const day=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
    const urgent=items.filter(i=>i.tone==='red'||i.tone==='amber').length;

    const row=(i,first)=>{
      const lab=i.lab||['grey','To do'];
      return `<div class="ez-row"><span class="ez-lab ${lab[0]}">${hesc(lab[1])}</span><div class="ez-txt">${i.who?'<b>'+hesc(i.who)+'</b> · ':''}${hesc(i.txt)}</div><div class="ez-acts">${i.done?`<button class="ez-link" onclick="${i.done}">Done</button>`:''}<button class="btn ${first?'pri':''}" style="white-space:nowrap" onclick="${i.btn[1]}">${hesc(i.btn[0])}</button></div></div>`;};
    /* only the next 3 jobs; the rest is one tap away */
    const rest=items.slice(1),shown=rest.slice(0,3),hidden=rest.slice(3);
    const next=rest.length?`<section class="ez-card"><div class="ez-hd"><h3 class="ez-h">Then</h3></div>${shown.map(i=>row(i,false)).join('')}${hidden.length?`<details class="ez-det"><summary>See ${hidden.length} more</summary>${hidden.map(i=>row(i,false)).join('')}</details>`:''}</section>`:'';

    /* patients: the ones with something to do come first, so a long ward is still short to scan */
    const rank={red:0,amber:1,'':2,ok:3};
    const cards=o.pts.map(p=>{
      const L=o.line(p,T),f=L[0],tone=f?(f.tone==='alert'||f.tone==='red'?'red':f.tone==='late'||f.tone==='amber'?'amber':''):'ok';
      const txt=f?easyPlain(String(f.txt).split(':')[0])+(f.due&&!/^Open$/.test(f.due)?' · '+easyPlain(f.due):'')+(L.length>1?` · +${L.length-1} more`:''):'Nothing to do';
      return {r:rank[tone||''],html:`<button class="ez-pt ${tone||''}" data-n="${hesc((p.name+' '+p.room).toLowerCase())}" onclick="go('#/patient/${p.id}/${o.tab}')">${p.day<=1?'<span class="t blue">New</span>':p.risk?'<span class="t amber">High risk</span>':''}<b>${hesc(p.name)}</b><span class="r">${hesc(p.room)}</span><span class="s ${tone||'ok'}">${hesc(txt)}</span></button>`};
    }).sort((a,b)=>a.r-b.r);
    const LIM=6,many=cards.length>8,vis=many?cards.slice(0,LIM):cards,more_=many?cards.slice(LIM):[];
    const patients=`<section class="ez-card"><div class="ez-hd"><h3 class="ez-h">My patients</h3>${many?`<input class="input ez-search" placeholder="Find a patient" aria-label="Find a patient" oninput="ezFind(this.value)">`:''}</div><div class="ez-pts">${vis.map(c=>c.html).join('')}</div>${more_.length?`<details class="ez-det ez-rest" ${S.ezAllPts?'open':''} ontoggle="S.ezAllPts=this.open"><summary>Show all ${cards.length} patients</summary><div class="ez-pts" style="padding-top:12px">${more_.map(c=>c.html).join('')}</div></details>`:''}</section>`;

    const boards=dtKeep(cfg);
    const more=boards?`<details class="ez-card ez-det" ${S.ezMore?'open':''} ontoggle="S.ezMore=this.open"><summary style="border-top:0">More tools and boards</summary><div class="ez-more-body">${boards}</div></details>`:'';

    /* a friendly title instead of "Inpatient dashboard": who it is for, and one sentence on how the day looks */
    const h=new Date().getHours(),greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening',me_=(V3.who&&V3.who[S.role])||'';
    const sub=items.length?`${day} · ${items.length} thing${items.length===1?'':'s'} to do`:`${day} · You're all caught up`;
    return `<div class="ez"><div class="row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h2>${greet}${me_?', '+hesc(me_):''}</h2><div class="muted" style="margin-top:4px">${sub}</div></div><div class="row" style="gap:8px;flex-wrap:wrap">${o.btns||''}</div></div>
      ${easyStartCard(items,o.clear)}${next}${patients}${more}</div>`;
  };
})();
