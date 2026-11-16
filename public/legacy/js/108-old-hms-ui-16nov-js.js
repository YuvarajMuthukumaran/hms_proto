/* 16 Nov 2026: Visual redesign of "Records from the old HMS" section.
   Replaces the raw <details>/<summary> + plain list with a clean card-based layout
   matching the portal's design system: section headers with counts, icon badges,
   medicine chips, and an "Open PDF" eye-button consistent with the rest of the UI. */
(function(){
  const esc=s=>hesc(String(s==null?'':s));
  const ROLES=['psychiatrist','psychologist','rmo','floor-lead-psychiatrist','floor-lead-psychologist'];
  const roleNow=()=>{try{return(window.__TULASI__||{}).role||S.role;}catch(e){return S.role;}};
  const CACHE={};
  const PEND={};
  const fmt=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'No date';

  /* signed PDF opener – same logic as before */
  let CFG2;
  async function cfg2(){if(CFG2!==undefined)return CFG2;try{const r=await fetch('/api/config',{cache:'no-store'});const j=r.ok?await r.json():null;CFG2=j&&j.supabase?j.supabase:null;}catch(e){CFG2=null;}return CFG2;}
  window.ohmsPdf2=async function(path){
    const tab=window.open('','_blank');
    try{
      const c=await cfg2();if(!c)throw new Error('offline');
      const r=await fetch(c.url+'/storage/v1/object/sign/old-hms-pdfs/'+path,{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify({expiresIn:300})});
      const j=r.ok?await r.json():null;if(!j||!j.signedURL)throw new Error('HTTP '+r.status);
      const u=c.url+'/storage/v1'+j.signedURL;
      if(tab)tab.location.href=u;else window.open(u,'_blank');
    }catch(e){if(tab)tab.close();try{toast('Could not open the PDF. Sign in again and retry.');}catch(x){}}
  };

  const EYE='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const FILE='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const RX='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>';

  const pdfBtn=r=>{const f=(r.data||{}).file;return f&&/^[a-z]{1,3}\/[0-9]+\.pdf$/.test(f)?`<button class="btn sm" style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap" onclick="ohmsPdf2('${esc(f)}')">${EYE} Open PDF</button>`:''};

  const medsOf=r=>((r.data||{}).meds||[]).map(m=>`<span style="display:inline-flex;align-items:center;gap:4px;background:var(--soft,#f4f4f8);border-radius:6px;padding:2px 8px;font-size:12px;line-height:1.6;color:var(--ink)">${esc(m.name?(m.name+(m.strength?' '+m.strength:'')):m.line)}${m.schedule?`<span style="color:var(--muted,#888)">· ${esc(m.schedule)}</span>`:''}${m.duration?`<span style="color:var(--muted,#888)">· ${esc(m.duration)}</span>`:''}</span>`).join('');

  function secCard(icon, title, count, rows, defaultOpen){
    if(!count)return '';
    const id='ohms-sec-'+Math.random().toString(36).slice(2);
    return `
    <div class="ohms-sec" style="margin-top:12px;border:1px solid var(--line-2,#e8e8ef);border-radius:10px;overflow:hidden">
      <button class="ohms-tog" data-target="${id}" onclick="ohmsToggle('${id}',this)"
        style="width:100%;display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--soft,#f9f9fb);border:none;cursor:pointer;text-align:left">
        <span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:var(--blue-soft,#e8f0fe);color:var(--blue,#2563eb);flex-shrink:0">${icon}</span>
        <span style="flex:1;font-weight:600;font-size:14px;color:var(--ink)">${title}</span>
        <span style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--line-2,#e8e8ef);color:var(--muted,#666)">${count}</span>
        <span class="ohms-arr" style="font-size:11px;color:var(--muted,#888);transition:transform .2s;transform:rotate(${defaultOpen?'0':'180'}deg)">▲</span>
      </button>
      <div id="${id}" style="display:${defaultOpen?'block':'none'}">${rows}</div>
    </div>`;
  }

  function dischargeRow(r){
    const doctor=(r.data||{}).doctor||'';
    const reason=(r.data||{}).reason||r.detail||'';
    return `<div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid var(--line-2,#e8e8ef)">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px">${esc(fmt(r.event_date))}</div>
        ${reason?`<div style="font-size:12px;color:var(--muted,#777);margin-top:1px">${esc(reason)}</div>`:''}
        ${doctor?`<div style="font-size:12px;color:var(--muted,#777)">${esc(doctor)}</div>`:''}
      </div>
      <div>${pdfBtn(r)}</div>
    </div>`;
  }

  function rxRow(r){
    const doctor=(r.data||{}).doctor||'';
    const detail=r.detail||'';
    const meds=(r.data||{}).meds||[];
    return `<div style="padding:11px 16px;border-top:1px solid var(--line-2,#e8e8ef)">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px">${esc(fmt(r.event_date))}</div>
          ${detail?`<div style="font-size:12px;color:var(--muted,#777);margin-top:1px">${esc(detail)}</div>`:''}
          ${doctor?`<div style="font-size:12px;color:var(--muted,#777)">${esc(doctor)}</div>`:''}
        </div>
        <div>${pdfBtn(r)}</div>
      </div>
      ${meds.length?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">${medsOf(r)}</div>`:''}
    </div>`;
  }

  function visitRow(r){
    return `<div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid var(--line-2,#e8e8ef)">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px">${esc(fmt(r.event_date))}${r.title?' · '+esc(r.title):''}</div>
        ${r.detail?`<div style="font-size:12px;color:var(--muted,#777);margin-top:1px">${esc(r.detail)}</div>`:''}
      </div>
    </div>`;
  }

  window.ohmsToggle=function(id,btn){
    const el=document.getElementById(id);if(!el)return;
    const open=el.style.display==='none';
    el.style.display=open?'block':'none';
    const arr=btn&&btn.querySelector('.ohms-arr');
    if(arr)arr.style.transform=open?'rotate(0deg)':'rotate(180deg)';
  };

  function body(rows){
    const by=k=>rows.filter(r=>r.kind===k);
    const dx=by('diagnosis')[0],docs=by('discharge_doc'),vis=by('visit'),rx=by('prescription');
    return (dx?`<div style="padding:12px 16px 0;border-bottom:1px solid var(--line-2,#e8e8ef);margin-bottom:4px"><div style="font-size:12px;color:var(--muted,#777)">Diagnosis from the old HMS</div><div style="font-size:13px;font-weight:600;margin-top:2px;white-space:pre-wrap">${esc(dx.detail)}</div></div>`:'')
      + secCard(FILE,'Discharge summaries',docs.length,docs.map(dischargeRow).join(''),true)
      + secCard('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>','Visits',vis.length,vis.map(visitRow).join(''),false)
      + secCard(RX,'Old prescriptions',rx.length,rx.map(rxRow).join(''),rx.some(r=>((r.data||{}).meds||[]).length));
  }

  function inner(pid){
    const c=CACHE[pid];
    if(c===undefined)return '<div style="padding:12px 16px;font-size:13px;color:var(--muted,#888)">Loading…</div>';
    if(c==='error')return '<div style="padding:12px 16px;font-size:13px;color:var(--muted,#888)">Could not load records. Reload to try again.</div>';
    if(c==='none'||!c.length)return '<div style="padding:12px 16px;font-size:13px;color:var(--muted,#888)">No records for this patient in the old HMS data.</div>';
    return body(c);
  }

  function brief(pid){
    const c=CACHE[pid];
    if(c===undefined)return '<div class="tiny muted">Loading…</div>';
    if(c==='error')return '<div class="tiny muted">Could not load. Reload to try again.</div>';
    const rx=(c==='none'?[]:c).filter(r=>r.kind==='prescription'&&((r.data||{}).meds||[]).length);
    if(!rx.length)return '<div class="tiny muted">No medicines found in the old HMS prescriptions for this patient.</div>';
    const r=rx[0],m=(r.data||{}).meds;
    return `<div style="font-weight:600;font-size:13px">${esc(fmt(r.event_date))}${r.detail?' · '+esc(r.detail):''}</div>`
      +`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">`
      +m.slice(0,14).map(x=>`<span style="display:inline-flex;align-items:center;gap:4px;background:var(--soft,#f4f4f8);border-radius:6px;padding:2px 8px;font-size:12px;color:var(--ink)">${esc(x.name?(x.name+(x.strength?' '+x.strength:'')):x.line)}${x.schedule?`<span style="color:var(--muted,#888)">· ${esc(x.schedule)}</span>`:''}${x.duration?`<span style="color:var(--muted,#888)">· ${esc(x.duration)}</span>`:''}</span>`).join('')
      +`</div>`
      +(rx.length>1?`<div style="font-size:12px;color:var(--muted,#888);margin-top:6px">${rx.length-1} older prescription${rx.length>2?'s':''} with medicines — see Records from the old HMS on the Stay summary.</div>`:'')
      +`<div style="margin-top:10px">${pdfBtn(r)}</div>`;
  }

  /* Remove old cards injected by 100-old-hms-history-15nov-js.js from the DOM */
  function killOld(){
    // old overview card: contains #ohms-box but not #ohms-box2
    const ob=document.getElementById('ohms-box');
    if(ob){const c=ob.closest('.card');if(c&&!c.querySelector('#ohms-box2'))c.remove();}
    // old orders card: contains #ohms-rx but not #ohms-rx2
    const or=document.getElementById('ohms-rx');
    if(or){const c=or.closest('.card');if(c&&!c.querySelector('#ohms-rx2'))c.remove();}
  }

  function place(){
    killOld();
    const e2=document.getElementById('ohms-rx2'),m=document.querySelector('.medbox');
    if(!e2||!m)return;
    const card=e2.closest('.card');
    if(card&&m.nextElementSibling!==card&&m.parentElement)m.parentElement.insertBefore(card,m.nextSibling);
  }

  function fill(pid){
    place();
    killOld();
    const el=document.getElementById('ohms-box2');
    if(el&&el.getAttribute('data-pid')===pid)el.innerHTML=inner(pid);
    const e2=document.getElementById('ohms-rx2');
    if(e2&&e2.getAttribute('data-pid')===pid)e2.innerHTML=brief(pid);
  }

  function fetchFor(pid){
    if(PEND[pid]||CACHE[pid]!==undefined||typeof window.regRest!=='function')return;
    PEND[pid]=1;
    window.regRest('hms_history?patient_id=eq.'+encodeURIComponent(pid)+'&select=kind,ref,event_date,title,detail,url,data&order=event_date.desc.nullslast&limit=300')
      .then(r=>{CACHE[pid]=(r&&r.length)?r:'none';})
      .catch(()=>{CACHE[pid]='error';})
      .then(()=>{delete PEND[pid];fill(pid);});
  }

  /* Override pOverview to inject the redesigned card */
  const __ov2=pOverview;
  pOverview=function(){
    let h=__ov2.apply(this,arguments);
    try{
      if(!ROLES.includes(roleNow()))return h;
      const p=ptFind(S.pid);
      if(!p||!p.real)return h;
      fetchFor(p.id);
      /* Remove the old plain card if it was injected by 100-old-hms-history */
      h=h.replace(/<div class="card" style="margin-top:12px"><div class="lbl" style="font-weight:700">Records from the old HMS<\/div><div id="ohms-box"[^>]+>[\s\S]*?<\/div><\/div>/,'');
      return h+`<div class="card" style="margin-top:12px;padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line-2,#e8e8ef);background:var(--bg,#fff)">
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">Records from the old HMS</div>
            <div style="font-size:12px;color:var(--muted,#888);margin-top:1px">Read-only · discharge summaries, visits and prescriptions imported from the previous system</div>
          </div>
        </div>
        <div id="ohms-box2" data-pid="${esc(p.id)}" style="padding:4px 0 8px">${inner(p.id)}</div>
      </div>`;
    }catch(e){return h;}
  };

  /* Override pOrders to inject redesigned brief */
  const __or2=pOrders;
  pOrders=function(){
    let h=__or2.apply(this,arguments);
    try{
      if(!ROLES.includes(roleNow()))return h;
      const p=ptFind(S.pid);
      if(!p||!p.real)return h;
      fetchFor(p.id);
      h=h.replace(/<div class="card" style="margin-top:12px"><div class="lbl" style="font-weight:700">From the old HMS: latest prescription[^<]*<\/div><div id="ohms-rx"[^>]+>[\s\S]*?<\/div><\/div>/,'');
      return h+`<div class="card" style="margin-top:12px;padding:14px 16px">
        <div style="font-weight:700;font-size:13px;margin-bottom:10px">From the old HMS · latest prescription <span style="font-weight:400;color:var(--muted,#888);font-size:12px">(reference only, not on the chart)</span></div>
        <div id="ohms-rx2" data-pid="${esc(p.id)}">${brief(p.id)}</div>
      </div>`;
    }catch(e){return h;}
  };

  const __rd2=render;
  render=function(){const x=__rd2.apply(this,arguments);try{place();killOld();setTimeout(killOld,80);}catch(e){}return x;};
})();

