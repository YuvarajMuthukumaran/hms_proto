/* 15 Nov 2026: "Records from the old HMS" on a database patient's overview (psychiatrist, psychologist, their floor leads and RMO).
   Read-only: diagnosis text, discharge-summary links, visits and prescription records pulled from the old HMS APIs
   (loaded by tools/import_api_history.py into public.hms_history). Nurse, floor coordinator and Patient Experience do not see it.
   The old-HMS PDF links open only for someone signed in to the old HMS. Nothing here logs patient details. */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const ROLES=['psychiatrist','psychologist','rmo','floor-lead-psychiatrist','floor-lead-psychologist'];
  const roleNow=()=>{try{return(window.__TULASI__||{}).role||S.role;}catch(e){return S.role;}};
  const CACHE={};   // patient id -> rows | 'none' | 'error'
  const PEND={};
  const fmt=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'No date';
  const okUrl=u=>/^https:\/\/[a-z0-9.-]*tirupatihms\.in\//i.test(u||'');
  const link=u=>okUrl(u)?` <a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Open PDF</a>`:'';

  function body(rows){
    const by=k=>rows.filter(r=>r.kind===k);
    const dx=by('diagnosis')[0],docs=by('discharge_doc'),vis=by('visit'),rx=by('prescription');
    const line=(a,b,c)=>`<div class="li"><div class="grow"><div style="font-weight:600">${a}</div>${b?`<div class="tiny muted">${b}</div>`:''}</div>${c||''}</div>`;
    const sec=(t,n,html,open)=>n?`<details ${open?'open':''} style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">${t} (${n})</summary>${html}</details>`:'';
    return (dx?`<div style="margin-top:6px"><div class="tiny muted">Diagnosis written in the old HMS</div><div style="white-space:pre-wrap">${esc(dx.detail)}</div></div>`:'')
      +sec('Discharge summaries',docs.length,docs.map(r=>line(esc(fmt(r.event_date)),esc([(r.data||{}).reason,(r.data||{}).doctor].filter(Boolean).join(' · ')),link(r.url))).join(''),true)
      +sec('Visits',vis.length,vis.map(r=>line(esc(fmt(r.event_date))+' · '+esc(r.title||'Visit'),esc(r.detail||''))).join(''))
      +sec('Prescription records',rx.length,rx.map(r=>line(esc(fmt(r.event_date)),esc([r.detail,(r.data||{}).doctor].filter(Boolean).join(' · ')),link(r.url))).join(''));
  }
  function inner(pid){
    const c=CACHE[pid];
    if(c===undefined)return '<div class="tiny muted">Loading…</div>';
    if(c==='error')return '<div class="tiny muted">Could not load the old HMS records. Reload to try again.</div>';
    if(c==='none'||!c.length)return '<div class="tiny muted">No records for this patient in the old HMS data.</div>';
    return body(c);
  }
  function fill(pid){
    const el=document.getElementById('ohms-box');
    if(el&&el.getAttribute('data-pid')===pid)el.innerHTML=inner(pid);
  }
  function fetchFor(pid){
    if(PEND[pid]||CACHE[pid]!==undefined||typeof window.regRest!=='function')return;
    PEND[pid]=1;
    window.regRest('hms_history?patient_id=eq.'+encodeURIComponent(pid)+'&select=kind,ref,event_date,title,detail,url,data&order=event_date.desc.nullslast&limit=300')
      .then(r=>{CACHE[pid]=(r&&r.length)?r:'none';})
      .catch(()=>{CACHE[pid]='error';})
      .then(()=>{delete PEND[pid];fill(pid);});
  }

  const __ov=pOverview;
  pOverview=function(){
    const h=__ov.apply(this,arguments);
    try{
      if(!ROLES.includes(roleNow()))return h;
      const p=ptFind(S.pid);
      if(!p||!p.real)return h;
      fetchFor(p.id);
      return h+`<div class="card" style="margin-top:12px"><div class="lbl" style="font-weight:700">Records from the old HMS</div><div id="ohms-box" data-pid="${esc(p.id)}">${inner(p.id)}</div></div>`;
    }catch(e){return h;}
  };
})();
