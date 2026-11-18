/* 18 Nov 2026, Trello (Nikita's QA of 17 Nov): "real data mode still shows demo data and wrong alerts", "safety header: section 89 day count",
   "demo data contradicts itself" (Form C for Section 89), "today: row types / demo alert rows", "Log action" menu entry, demo staff lists.
   Real-data mode only, except the stay clock helper and the Form C / Log action tidy-ups, which are the same in every login that has those screens.
   1. window.__stayClock(p): the day count used by clocks (24 hour call, history 72 h, review days, capacity reviews). A patient who was already in the ward
      when the portal started (15 Nov) is counted from 15 Nov, and has no 24 hour or day 3 to 4 call to make. The Section 89 header still shows the real day.
   2. Psychiatrist and floor lead psychiatrist: tasks, alerts and Today rows cover EVERY ward (they only read the Male ward before, so women and
      de-addiction patients never got a row).
   3. Stay summary of a real patient: the timeline and the nursing / last round / MHCA boxes show only what is recorded (they were filled with
      made-up times, nurse names and future dates).
   4. Demo staff (Dr. Rohan Mehta, Priya Nair ...) are taken out of every drop-down; the real staff from the database are put in.
   5. Form C / independent admission is hidden for Section 89 (Form E is the form for a supported admission).
   6. "Log action taken" is gone from the Take Action menu of the psychiatrist and the psychologists (every task has its own action button). */
(function(){
  const DAY=864e5,GOLIVE=Date.parse('2026-11-15T00:00:00');
  const T=()=>window.__TULASI__||{};
  const role=()=>String(T().role||'');
  /* ---------- 1. stay clock ---------- */
  window.__stayClock=function(p){
    const day=+(p&&p.day)||0;
    if(!p||!p.real)return {day,clock:day,legacy:false,start:null};
    const sinceLive=Math.max(0,Math.floor((Date.now()-GOLIVE)/DAY));
    const legacy=!!p.admEst||day>sinceLive+1;
    const clock=legacy?Math.min(day,sinceLive):day;
    return {day,clock,legacy,start:new Date(Date.now()-clock*DAY)};
  };

  /* ---------- 5. Form C is not offered for Section 89 (every login that shows the Admission steps) ---------- */
  function hideFormC(){
    const v=document.getElementById('view');if(!v)return;
    const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);if(!m)return;
    let p=null;try{p=ptFind(decodeURIComponent(m[1]));}catch(e){}
    if(!p||String(p.sec)!=='89')return;
    v.querySelectorAll('li.adm-step').forEach(li=>{const t=li.querySelector('.adm-t');if(t&&/^Form C/i.test(t.textContent.trim()))li.style.display='none';});
    v.querySelectorAll('.sbox.pick').forEach(b=>{const l=b.querySelector('.lbl');if(l&&/^Form C/i.test(l.textContent.trim()))b.style.display='none';});
    ['formcCard'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});
    v.querySelectorAll('tr[data-formc]').forEach(r=>r.style.display='none');
    v.querySelectorAll('tbody tr').forEach(r=>{const f=r.querySelector('td');if(f&&/^Form C\b/i.test(f.textContent.trim()))r.style.display='none';});
    if(S.admSec==='formc'){S.admSec='hist';}
  }
  const __rF=render;
  render=function(){const out=__rF.apply(this,arguments);try{hideFormC();}catch(e){}return out;};

  /* ---------- 6. no "Log action taken" entry in the Take Action menus (psychiatrist, psychologists) ---------- */
  const dropLog=()=>{const m=document.getElementById('pdMenu');if(!m)return;const rows=[...m.querySelectorAll('.pdm-i')];const lg=rows.find(r=>/^Log action taken$/.test((r.querySelector('b')||{}).textContent||''));if(lg&&rows.length>1)lg.remove();};
  ['psyMenu','pgMenu'].forEach(n=>{const f=window[n];if(typeof f==='function')window[n]=function(){const r=f.apply(this,arguments);try{dropLog();}catch(e){}return r;};});

  if(!window.__realMode)return;

  /* ---------- 2. psychiatrist and floor lead psychiatrist: every ward ---------- */
  if(role()==='psychiatrist'||role()==='floor-lead-psychiatrist'){
    let depth=0;
    const withAll=fn=>{
      if(depth>0)return fn();
      const keep=PTS.slice();depth++;
      try{const all=Object.values(WARDS).flat();window.__allNow=all;PTS.splice(0,PTS.length,...all);return fn();}
      finally{depth--;window.__allNow=null;PTS.splice(0,PTS.length,...keep);}
    };
    const __rr=render;
    render=function(){const a=arguments,t=this;return withAll(()=>__rr.apply(t,a));};
    const __tk=tasks;
    tasks=function(){const a=arguments,t=this;return withAll(()=>__tk.apply(t,a));};
    const __ra=window.rmoAllPts;
    window.rmoAllPts=function(){const all=window.__allNow||Object.values(WARDS).flat();return all.length?all:(typeof __ra==='function'?__ra.apply(this,arguments):PTS);};
  }

  /* ---------- 3. Stay summary of a real patient: only what is recorded ---------- */
  if(typeof pOverview==='function'){
    const __po=pOverview;
    pOverview=function(){
      const h=__po.apply(this,arguments);
      let p=null;try{p=ptFind(S.pid);}catch(e){}
      if(typeof h!=='string'||!p||!p.real||S.pid==='neel')return h;
      try{return realStay(h,p);}catch(e){return h;}
    };
  }
  function realStay(h,p){
    const t=document.createElement('template');t.innerHTML=h;
    const tlEl=t.content.querySelector('.timeline');if(!tlEl)return h;
    const id=ptIdentity(p),sc=__stayClock(p),c=S.calls||{},hist=S.historyStatus==='signed';
    const psy=(S.team&&S.team.psy)||'the psychiatrist',psych=(S.team&&S.team.psych)||'';
    const D=n=>ptD(new Date((sc.start||id.adm).getTime()+n*DAY));
    const item=(when,cls,title,meta)=>`<div class="tl"><div class="when">${hesc(when)}</div><div class="rail"><div class="pip ${cls}"></div><div class="bar"></div></div><div class="what"><div style="font-weight:600">${hesc(title)}</div><div class="small muted">${hesc(meta)}</div></div></div>`;
    const tl=[];
    tl.push(item(ptD(id.adm),'done','Admitted, Section '+S.section,p.admEst?'Admission date taken from the old HMS record (estimated)':'Admitted under '+psy));
    if(!sc.legacy)tl.push(item(D(1),c.h24==='done'?'done':(sc.clock>=2?'late':''),'24-hour family call',c.h24==='done'?'Done and logged':'Due within 24 hours of admission'));
    tl.push(item(hist?'Done':D(3),hist?'done':(sc.clock>3?'late':''),'Detailed history',hist?'Signed':('Assigned to '+(psych||psy)+' · due '+D(3)+(sc.clock>3?' · overdue':''))));
    const planDone=!!(S.plansSigned&&S.plansSigned.psy);
    tl.push(item(planDone?'Done':D(7),planDone?'done':(sc.clock>7?'late':''),'Diagnosis and management plans',planDone?'Signed':('Due '+D(7))));
    const edd=(typeof EX!=='undefined'&&EX[p.id]&&EX[p.id][2])||'Not set';
    tl.push(item('Planned','','Discharge',edd==='Not set'?'Expected discharge date not set':'Expected '+edd));
    tlEl.innerHTML=tl.join('');
    /* boxes that carried made-up text */
    const px=(typeof psyPx==='function')?psyPx(p.id):{};
    t.content.querySelectorAll('.sbox').forEach(b=>{
      const l=b.querySelector('.lbl');if(!l)return;const n=l.textContent.trim();
      const val=b.querySelector('.sval'),subs=[...b.querySelectorAll('.tiny.muted')];
      if(n==='Nursing · last shift'){
        let last=null;try{const v=(S.vit||[]);last=v&&v.length?v[v.length-1]:null;}catch(e){}
        if(val)val.textContent=last?'Vitals recorded':'No nursing entries yet';
        if(subs[0])subs[0].textContent=last?(last.when||last.t||'Latest reading is in Vitals and monitoring'):'Nothing recorded by the nurses yet';
      }
      if(n==='Last round'){
        const dn=(S.dnHist||[])[0];
        if(val)val.textContent=dn?((dn.d||'')+' '+(dn.my||'')).trim():'No round recorded yet';
        if(subs[0])subs[0].textContent=dn?'Latest daily note':'Nothing recorded yet';
      }
      if(n==='Mental Healthcare Act'){
        if(val&&String(p.sec)==='89')val.textContent='Section 89 · day '+sc.day+(sc.day<=30?' of 30':' · '+(sc.day-30)+' days past 30');
        const rt=(px.mhca&&px.mhca.nr&&px.mhca.nr.rights)||null;
        if(subs[0])subs[0].textContent='Nominated representative: '+id.nr+(rt&&rt.by&&rt.by!=='At admission'?' · rights explained by '+rt.by+(rt.at?', '+rt.at:''):' · rights not recorded yet');
      }
      if(n==='Family'){
        if(sc.legacy&&val&&/24-hour call/.test(val.textContent))val.textContent='No required call open';
        else if(c.h24!=='done'&&val&&/24-hour call/.test(val.textContent)){/* new admission: keep "24-hour call due" */}
        if(subs[0])subs[0].textContent=id.nr+(id.rel&&id.rel!=='Not recorded'?', '+id.rel.toLowerCase():'');
      }
    });
    return t.innerHTML;
  }

  /* the standing monitoring list every patient starts with (BP, pulse, temperature ...) is not attributed to a demo doctor */
  if(typeof monList==='function'){const __ml=monList;monList=function(pid){const L=__ml.apply(this,arguments);try{L.forEach(x=>{if(x&&x[2]&&x[2].by==='Dr. Aanya Sharma')x[2]={by:'Standing ward order',at:''};});}catch(e){}return L;};}

  /* the psychologists' "Due for this patient": the history is counted from the stay clock, not always "Overdue" (the psychiatrist's list is handled in 49) */
  if(typeof dueItems==='function'&&/psycholog/.test(role())){
    const __d=dueItems;
    dueItems=function(){
      const r=__d.apply(this,arguments);
      try{const p=ptFind(S.pid);if(!p||!p.real||!Array.isArray(r))return r;const sc=__stayClock(p),late=sc.clock-3;
        return r.map(x=>x[0]==='Detailed history'?[x[0],late>0?late+' day'+(late>1?'s':'')+' late':late===0?'today':'due '+ptD(new Date(sc.start.getTime()+3*DAY)),late>0,x[3]]:x);
      }catch(e){return r;}
    };
  }

  /* Admission steps of a real patient: the chips say what is really recorded (they used to say "Signed 18 Oct" for every patient) */
  if(typeof pAdmission==='function'){
    const __pa=pAdmission;
    pAdmission=function(){
      const h=__pa.apply(this,arguments);
      let p=null;try{p=ptFind(S.pid);}catch(e){}
      if(typeof h!=='string'||!p||!p.real)return h;
      try{
        const t=document.createElement('template');t.innerHTML=h;
        const lis=[...t.content.querySelectorAll('li.adm-step')];if(!lis.length)return h;
        const x=psyPx(p.id),c=ptCtxOf(p.id)||{},sc=__stayClock(p),wk=x.wk||{};
        const cons=Object.values(x.consent||{}).filter(v=>v&&v.st).length;
        const set=(li,txt,cls)=>{const s=li.querySelector('.adm-s');if(s)s.textContent=txt;li.classList.remove('done','warn');if(cls)li.classList.add(cls);const n=li.querySelector('.adm-n');const idx=lis.indexOf(li);if(n)n.textContent=cls==='done'?'✓':String(idx+1);};
        lis.forEach(li=>{
          const ti=(li.querySelector('.adm-t')||{}).textContent||'';
          if(/^Admission forms/.test(ti))cons?set(li,'Signed','done'):set(li,'Not recorded','');
          else if(/^Admission workup/.test(ti))wk.signed?set(li,'Signed','done'):(wk.edited?set(li,'In progress','warn'):set(li,'Not done',''));
          else if(/^Detailed capacity/.test(ti))c.capacityDone?set(li,'Done','done'):set(li,'Not done','');
          else if(/^Detailed history/.test(ti)){c.historyStatus==='signed'?set(li,'Signed','done'):set(li,sc.clock>3?'Overdue':'Due '+ptD(new Date(sc.start.getTime()+3*DAY)),'warn');}
        });
        lis.forEach((li,i)=>{li.classList.toggle('prevdone',i>0&&lis[i-1].classList.contains('done'));});
        return t.innerHTML;
      }catch(e){return h;}
    };
  }

  /* ---------- 4. real staff in every drop-down ---------- */
  window.__realStaff=window.__realStaff||[];
  (async()=>{try{if(typeof window.regRest==='function'){const st=await window.regRest('staff?select=name,role&active=is.true&order=name');if(Array.isArray(st)){window.__realStaff=st;scrubStaff();}}}catch(e){}})();
  const DEMO_STAFF=/\b(Dr\.?\s*(Aanya Sharma|Rohan Mehta|Kunal Sethi|Nandini Rao|Webber|Sameer Khan)|Priya Nair|Kiran Mehra|Surabhi Sengar|Ankit Verma|Sister Rekha|Meena Arora)\b/;
  const DEMO_PSY=/\bDr\.?\s*(Aanya Sharma|Rohan Mehta|Kunal Sethi|Nandini Rao|Webber|Sameer Khan)\b/;
  function scrubStaff(root){
    const scope=root||document;
    scope.querySelectorAll('select').forEach(sel=>{
      const opts=[...sel.options];if(!opts.some(o=>DEMO_STAFF.test(o.textContent)))return;
      let wantDoc=false;opts.forEach(o=>{if(DEMO_STAFF.test(o.textContent)){if(DEMO_PSY.test(o.textContent))wantDoc=true;o.remove();}});
      const have=new Set([...sel.options].map(o=>o.textContent.trim()));
      (window.__realStaff||[]).filter(s=>s.role===(wantDoc?'psychiatrist':'psychologist')).forEach(s=>{if(!have.has(s.name)){const o=document.createElement('option');o.value=s.name;o.textContent=s.name;sel.appendChild(o);}});
      if(!sel.options.length){const o=document.createElement('option');o.value='';o.textContent='No staff listed yet';sel.appendChild(o);}
      if(sel.selectedIndex<0)sel.selectedIndex=0;
    });
  }
  let pend=0;
  const mo=new MutationObserver(()=>{if(pend)return;pend=requestAnimationFrame(()=>{pend=0;try{scrubStaff();}catch(e){}});});
  const start=()=>mo.observe(document.body,{childList:true,subtree:true});
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  /* the Transfer / Add psychologist lists: the demo names are not offered */
  try{if(typeof TR_TO==='object'&&TR_TO){Object.keys(TR_TO).forEach(k=>{TR_TO[k]=TR_TO[k].filter(n=>!DEMO_STAFF.test(n));});}}catch(e){}
})();
