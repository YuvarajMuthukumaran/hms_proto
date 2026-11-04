
/* Psychiatrist only (5 Nov 2026): icons vs buttons, and the top search.
   Trello "Please revise icons as some are action buttons and some are icons - super confusing":
   - the row of coloured pills above the patient lists is gone (views live in the left sidebar: Today, Patients, Rounds, Alerts,
     Clinical documentation; Nursing chart opens from inside a patient; Daily notes live in the patient record and in Rounds;
     History is inside the patient record)
   - actions are real buttons top right next to the title: Start rounds (filled), New admission (outline)
   - one icon style: outline, same colour as the text, no coloured tiles behind icons (page titles and the sidebar rail)
   Trello "Add search button in the top like doctor portal": the search icon opens a patient search (name, UHID, room, diagnosis)
   with the list filters (All inpatients, New in 24 h, High risk, Discharge planned, VVIP); Enter or a click opens the patient. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-nav-css';
  css.textContent=`
  body.psy-views .sgtabs{display:none!important}
  body.psy-views .hico{display:none!important}
  body.psy-views .sgdd .si{background:transparent!important;color:var(--ink-2)!important}
  body.psy-views .sgdd button.on{background:var(--blue-tint)!important;border-color:var(--blue)!important}
  body.psy-views .sgdd button.on .si{color:var(--blue-ink)!important}
  #hsqPanel{position:fixed;z-index:80;width:460px;max-width:calc(100vw - 24px);max-height:70vh;overflow:auto;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 40px rgba(15,23,42,.16);padding:10px}
  #hsqPanel[hidden]{display:none}
  #hsqPanel .fc{display:flex;gap:6px;flex-wrap:wrap;padding:2px 2px 10px}
  #hsqPanel .fc button{border:1px solid var(--line);background:#fff;border-radius:99px;padding:3px 10px;font:inherit;font-size:12px;font-weight:600;color:var(--ink-2);cursor:pointer}
  #hsqPanel .fc button.on{background:var(--blue-tint);border-color:var(--blue);color:var(--blue-ink)}
  #hsqPanel .r{display:block;width:100%;text-align:left;border:0;background:none;font:inherit;padding:8px 10px;border-radius:9px;cursor:pointer}
  #hsqPanel .r:hover,#hsqPanel .r.on{background:var(--soft)}`;
  document.head.appendChild(css);

  /* class on body so the styles above only apply to the psychiatrist */
  const __render=render;
  render=function(){document.body.classList.toggle('psy-views',psy());return __render.apply(this,arguments);};

  /* Rounds joins the sidebar rail; Patients is not lit while Rounds is open */
  const RICON='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/></svg>';
  const __rs=renderSide;
  renderSide=function(){
    const out=__rs.apply(this,arguments);
    if(psy()){
      const dd=document.querySelector('#side .sgdd');
      /* Clinical documentation is not a place of its own: each patient's documents are in the patient's Forms to print tab */
      if(dd)dd.querySelectorAll('button[aria-label^="Clinical documentation"]').forEach(b=>b.remove());
      if(dd&&!dd.querySelector('[data-rounds]')){
        const onR=/^#\/rounds/.test(location.hash||'');
        const b=document.createElement('button');b.dataset.rounds='1';b.title='Rounds';b.setAttribute('aria-label','Rounds');b.setAttribute('onclick',"go('#/rounds')");
        if(onR){b.className='on';b.setAttribute('aria-current','page');}
        b.innerHTML=`<span class="si">${RICON}</span><span class="sl">Rounds</span>`;
        const kids=[...dd.children],pat=kids.find(x=>/Patients/.test(x.getAttribute('aria-label')||''));
        (pat?pat.after(b):dd.appendChild(b));
        if(onR&&pat){pat.classList.remove('on');pat.removeAttribute('aria-current');}
        const onH=/^#\/handover/.test(location.hash||''),hb=document.createElement('button');hb.dataset.handover='1';hb.title='Handover';hb.setAttribute('aria-label','Handover');hb.setAttribute('onclick',"go('#/handover')");
        if(onH){hb.className='on';hb.setAttribute('aria-current','page');dd.querySelectorAll('button.on:not([data-handover])').forEach(x=>{x.classList.remove('on');x.removeAttribute('aria-current');});}
        hb.innerHTML=`<span class="si"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/></svg></span><span class="sl">Handover</span>`;
        b.after(hb);
      }
    }
    return out;
  };

  /* page buttons next to the title on the patient lists */
  const bar=`<div class="row" style="gap:8px"><button class="btn" onclick="go('#/admissions')">New admission</button><button class="btn pri" onclick="go('#/rounds')">Start rounds</button></div>`;
  const prevIpd=ROLE.psychiatrist.ipdPage;
  ROLE.psychiatrist.ipdPage=function(o,base){
    /* Trello "If i open new admission i dont have a way to open full list": the filter cards (All inpatients, New in 24 h, High risk,
       Discharge planned) are on the New admission page too. New in 24 h stays here; the others open the patient list with that filter. */
    if(o&&o.scr==='ipdNew'){
      const dis=p=>(EX[p.id]||[])[2]!=='Not set';
      o=Object.assign({},o,{keys:['all','h24','risk','dis'],count:k=>PTS.filter(p=>ipdIn(k,p,dis)).length,set:k=>k==='h24'?'':`filt='${k}';go('#/inpatients')`});
    }
    const h=prevIpd?prevIpd(o,base):base(o);
    return h.replace(/<div class="ipd">\s*<div>(<h2[\s\S]*?<\/div>)<\/div>/,(m,t)=>`<div class="ipd"><div class="row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div>${t}</div>${bar}</div>`);
  };

  /* top search */
  const FIL=[['all','All inpatients'],['h24','New in 24 h'],['risk','High risk'],['dis','Discharge planned'],['vip','VVIP']];
  let fil='all',sel=0,hits=[];
  const inp=()=>document.getElementById('hsq');
  function panel(){let el=document.getElementById('hsqPanel');if(!el){el=document.createElement('div');el.id='hsqPanel';el.hidden=true;document.body.appendChild(el);}return el;}
  function place(){const i=inp(),el=panel();if(!i)return;const r=i.getBoundingClientRect();el.style.top=(r.bottom+8)+'px';el.style.left=Math.max(12,Math.min(r.right-460,innerWidth-472))+'px';}
  function find(){
    const q=(inp().value||'').trim().toLowerCase(),dis=p=>(EX[p.id]||[])[2]!=='Not set';
    hits=allPts().filter(p=>ipdIn(fil,p,dis)&&(!q||[p.name,p.uhid,p.room,p.dx,p.id].some(x=>String(x||'').toLowerCase().includes(q))));
    sel=Math.min(sel,Math.max(0,hits.length-1));
  }
  function draw(){
    const el=panel();find();place();
    el.innerHTML=`<div class="fc">${FIL.map(([k,l])=>`<button class="${fil===k?'on':''}" onclick="psySearchFil('${k}')">${l}</button>`).join('')}</div>
      ${hits.length?hits.slice(0,12).map((p,i)=>`<button class="r ${i===sel?'on':''}" onclick="psySearchGo('${p.id}')"><b>${hesc(p.name)}</b> <span class="tiny muted">${hesc(p.sex||'')}${p.age?'/'+p.age:''} · UHID ${hesc(p.uhid||'')}</span><div class="tiny muted">${hesc(p.room)} · Day ${p.day} · ${hesc(p.dx||'')}${p.risk?' · <b style="color:var(--amber)">High risk</b>':''}</div></button>`).join(''):'<div class="small muted" style="padding:8px 10px">No patient matches</div>'}`;
    el.hidden=false;
  }
  window.psySearchFil=k=>{fil=k;sel=0;draw();const i=inp();if(i)i.focus();};
  window.psySearchGo=id=>{panel().hidden=true;const i=inp();if(i){i.value='';i.style.display='none';}go('#/patient/'+id+'/overview');};
  function wire(){
    const i=inp();if(!i||i.dataset.psy)return;i.dataset.psy='1';
    i.setAttribute('placeholder','Search patient by name, UHID, room or diagnosis');i.style.width='320px';
    const old=i.onkeydown;
    i.onkeydown=e=>{
      if(!psy())return old&&old.call(i,e);
      if(e.key==='Escape'){panel().hidden=true;i.style.display='none';return;}
      if(e.key==='ArrowDown'){sel=Math.min(hits.length-1,sel+1);draw();e.preventDefault();}
      else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault();}
      else if(e.key==='Enter'&&hits[sel]){psySearchGo(hits[sel].id);}
    };
    i.addEventListener('input',()=>{if(psy()){sel=0;draw();}});
    i.addEventListener('focus',()=>{if(psy())draw();});
    document.addEventListener('mousedown',e=>{const el=panel();if(el.hidden)return;if(!el.contains(e.target)&&e.target!==i&&!(e.target.closest&&e.target.closest('[aria-label="Search"]')))el.hidden=true;});
    window.addEventListener('resize',()=>{if(!panel().hidden)place();});
    /* the search icon opens the box; the old handler only toggled it */
    const btn=document.querySelector('button[aria-label="Search"]');
    if(btn)btn.addEventListener('click',()=>{setTimeout(()=>{if(psy()&&i.style.display==='block'){i.focus();draw();}else panel().hidden=true;},0);});
  }
  wire();
})();
