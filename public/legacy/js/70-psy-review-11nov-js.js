/* 11 Nov 2026, team review with Anu (recording and Granola notes). Psychiatrist screens (the psychologist's read-only copies that are drawn
   through the psychiatrist's code pick the same changes up on their own):
   1. Dashboard: a colour key for the dots; the Completed table shows the real alert type, never "Done".
   2. "Change medicines" (overview) and "Add medicine" (Treatment Plan) open the Add medicine window in place; they no longer go to another page.
   3. Past admission file: a view-only window with Print. No download button (people must not keep copies on their own computers).
   Every change is gated by S.role, so no other role's screen is touched. */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const psyOrPg=()=>S.role==='psychiatrist'||S.role==='psychologist';

  const css=document.createElement('style');css.id='psy-review-11nov-css';
  css.textContent=`
  .pdk{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin:0 0 12px;padding:9px 14px;background:#f8fafc;border:1px solid var(--line,#e4e7ec);border-radius:12px;font-size:12.5px;color:#344054}
  .pdk b{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#667085;margin-right:2px}
  .pdk span{display:inline-flex;align-items:center;gap:7px}
  .pdk i{display:inline-block;width:9px;height:9px;border-radius:50%;flex:0 0 9px}
  .pdk i.red{background:#e5484d}.pdk i.blue{background:#3b82f6}.pdk i.amber{background:#f5a524}.pdk i.ok{background:#12b76a}
  .pdk em{font-style:normal;color:#667085}
  /* Admission step 4 (detailed history): two columns, tighter gaps, every question numbered Q1, Q2 ... (psychiatrist only) */
  body.psy-views:not(.psg) .hwrap .hgrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px 28px!important;counter-reset:hq}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf{counter-increment:hq;min-width:0}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf:has(textarea),body.psy-views:not(.psg) .hwrap .hgrid>.hf:has(.mini-chips),body.psy-views:not(.psg) .hwrap .hgrid>.hf:not(.hf-sel):has(input.input),body.psy-views:not(.psg) .hwrap .hgrid>.hf.wide{grid-column:1/-1}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf>.lbl:first-child{display:flex;align-items:baseline;gap:8px;margin:0 0 4px}
  body.psy-views:not(.psg) .hwrap .hgrid>.hf>.lbl:first-child::before{content:"Q" counter(hq);flex:0 0 auto;font-size:11px;font-weight:800;color:#175cd3;background:#eef4ff;border:1px solid #cfe0fb;border-radius:6px;padding:0 6px;line-height:18px}
  body.psy-views:not(.psg) .hwrap .hgrid select.input,body.psy-views:not(.psg) .hwrap .hgrid input.input{width:100%;min-height:38px}
  body.psy-views:not(.psg) .hwrap .hgrid textarea.input{min-height:72px}
  body.psy-views:not(.psg) .hwrap .hbody{gap:14px!important}
  @media(max-width:900px){body.psy-views:not(.psg) .hwrap .hgrid{grid-template-columns:1fr!important}}
  /* Admission step 5 (Form C) looks like step 1 */
  .fcT .ct-a{display:flex;gap:8px;flex-wrap:wrap}
  /* Vitals and monitoring: one table */
  .vm10{background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:14px;margin-bottom:14px;overflow:hidden}
  .vm10>.hd{padding:12px 16px;border-bottom:1px solid var(--line-2,#eaecf0);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .vm10>.hd h3{margin:0;font-size:15px}.vm10>.hd .tiny{flex:1}
  .vm10 .vscroll{overflow-x:auto}
  .vm10 table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}
  .vm10 th,.vm10 td{border:1px solid #e4e7ec;padding:7px 10px;text-align:left;vertical-align:middle}
  .vm10 th{background:#f8fafc;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667085;white-space:nowrap;position:sticky;top:0}
  .vm10 th small{display:block;text-transform:none;letter-spacing:0;font-weight:500;color:#98a2b3;font-size:10.5px}
  .vm10 td.d{font-weight:700;white-space:nowrap;background:#fcfcfd}
  .vm10 td.t{color:#667085;white-space:nowrap;font-size:12px}
  .vm10 tr.first td{border-top:2px solid #cfd8e3}
  .vm10 td .v{font-weight:600}.vm10 td .v.out{color:#b42318}.vm10 td.outc{background:#fef3f2}
  .vm10 td .ini{display:inline-block;margin-left:6px;font-size:10.5px;font-weight:700;color:#175cd3;background:#eff4ff;border:1px solid #c9dcfb;border-radius:99px;padding:0 6px}
  .vm10 .ml{display:flex;justify-content:space-between;gap:10px;font-size:12px}.vm10 .ml span{color:#667085}
  .vm10 .none{color:#98a2b3}
  /* Treatment Management Plan: order log, done and not done */
  .tl10{border:1px solid var(--line,#e4e7ec);border-radius:12px;padding:12px 14px;margin-top:10px;background:#fff}
  .tl10.done{border-color:#abefc6;background:#f6fef9}.tl10.none{background:#fcfcfd}
  .tl10-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.tl10-h b{font-size:14.5px}
  .tl10-r{display:flex;align-items:center;gap:8px}
  .tl10-chip{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;border:1px solid transparent;white-space:nowrap}
  .tl10-chip.done{background:#ecfdf3;color:#067647;border-color:#abefc6}.tl10-chip.prog{background:#eff4ff;color:#175cd3;border-color:#c9dcfb}.tl10-chip.none{background:#f2f4f7;color:#475467;border-color:#e4e7ec}
  .tl10-sum{display:flex;gap:6px;flex-wrap:wrap}
  .tl10-bar{height:6px;background:#eef2f7;border-radius:99px;overflow:hidden;margin:10px 0 8px}.tl10-bar i{display:block;height:100%;background:#12b76a;border-radius:99px}
  .tl10-s{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:4px 18px}
  .tl10-s li{display:flex;align-items:baseline;gap:8px;font-size:13px;padding:3px 0}
  .tl10-s .b{flex:0 0 18px;font-weight:800}.tl10-s li.y .b{color:#067647}.tl10-s li.n .b{color:#98a2b3}
  .tl10-s .t{font-weight:600}.tl10-s li.n .t{color:#475467;font-weight:500}.tl10-s .who{margin-left:auto;font-size:11.5px;color:#667085;text-align:right}
  /* Therapy Plans: Record and Add sit together */
  .th10-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .th10-rec{display:inline-flex;align-items:center;gap:6px}
  /* Patient Experience: icons */
  .pxs-hd{display:flex;align-items:center;gap:10px}.pxs-hd h4{margin:0;flex:1}
  .px10-ic{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;flex:0 0 34px}
  .pxs-row dt{display:flex;align-items:center;gap:10px}
  .px10-ri{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#f2f4f7;color:#475467;flex:0 0 26px}.px10-ri svg{width:15px;height:15px}
  `;
  document.head.appendChild(css);

  /* ---------- 1. colour key and the type of a completed row ---------- */
  const KEY=`<div class="pdk" role="note" aria-label="What the coloured dots mean"><b>Key</b>
    <span><i class="red"></i>Alert <em>· needs you now</em></span>
    <span><i class="blue"></i>Medicine order <em>· to approve (countersign)</em></span>
    <span><i class="amber"></i>Due or late <em>· overdue notes, reviews, results to check</em></span>
    <span><i class="ok"></i>Action taken</span></div>`;
  function dashFix(v){
    const pd=v.querySelector('.pd');
    if(pd&&!pd.querySelector('.pdk')){
      const bar=pd.querySelector('.pd-bar');
      if(bar)bar.insertAdjacentHTML('afterend',KEY);
    }
    /* Completed actions: show the alert type the row had, not the word Done */
    v.querySelectorAll('.pd-completed .pd-t tbody tr').forEach(tr=>{
      const ty=tr.querySelector('.pd-ty');if(!ty||!/^Done$/i.test(ty.textContent.trim()))return;
      const texts=[...tr.querySelectorAll('td:nth-child(3) .pd-d span')].map(s=>s.textContent).join(' ');
      const hit=(window.pgCatOf&&pgCatOf(texts))||['Documentation','grey'];
      ty.textContent=hit[0];ty.classList.remove('red','amber','blue');if(hit[1]!=='grey')ty.classList.add(hit[1]);
    });
  }

  /* ---------- 2. Add medicine is a window, everywhere ---------- */
  function medButtons(v){
    v.querySelectorAll('button[onclick*="psyToChart("]').forEach(b=>{
      if(/^\s*(Change medicines|Add medicine)\s*$/.test(b.textContent.replace(/\s+/g,' '))||/Change medicines|Add medicine/.test(b.textContent)){
        b.setAttribute('onclick',"psyRxOpen({ctx:'orders'})");
      }
    });
  }

  /* ---------- 4. Admission step 5: Form C in the same table as step 1 ---------- */
  function formCTable(v){
    const card=[...v.querySelectorAll('section.card')].find(c=>{const h=c.querySelector('h3');return h&&/^Form C · Independent admission/.test(h.textContent.trim());});
    if(!card||card.querySelector('.ct-t'))return;
    const c=(psyPx(S.pid).consent||{})['form-c'];
    const st=c?(c.st==='esign'?'E-signed '+(c.at||'')+(c.by?' · '+c.by:''):c.st==='uploaded'?'Uploaded '+(c.at||'')+(c.file?' · '+c.file:''):'Signed '+(c.at||'')):'Not signed';
    let key='';try{CD_DATA=cdLoad();const it=cdItems(S.pid).find(i=>i.form&&i.form.id==='form-c');key=it?it.entryKey:'';}catch(e){}
    const view=key?`<button class="btn sm" onclick="psyDocPreview('${hesc(key)}')">View form</button>`:'';
    card.className='card';card.removeAttribute('style');card.id='formcCard';
    card.innerHTML=`<div class="hd"><h3>Form C · Independent admission</h3><span class="chip c-grey">Taken by front desk</span></div>
      <div class="scroll fcT"><table class="ct-t"><thead><tr><th>Form</th><th>Status</th><th></th></tr></thead><tbody><tr><td style="font-weight:600">Form C · independent admission (Mental Healthcare Act)<div class="tiny muted" style="font-weight:400;margin-top:2px">Optional at admission, based on the psychiatrist or psychologist's clinical judgement. Required again before discharge.</div></td><td><span class="cs ${c?'':'due'}">${hesc(st)}</span></td>
        <td><div class="ct-a">${view}<label class="btn sm" style="cursor:pointer">Upload signed copy<input type="file" hidden onchange="psyConsentUpload('form-c',this)"></label><button class="btn sm pri" onclick="pgFormCEsign()">Collect e-signature</button></div></td></tr></tbody></table></div>
      <div class="pad small muted">E-signature is a trial: the legal team is still checking that it is valid.</div>`;
  }

  /* ---------- 5. Vitals and monitoring: one table ---------- */
  const SLOT_SET=['9 am','1 pm','5 pm','9 pm'];
  const num=s=>{const m=String(s).match(/-?\d+(\.\d+)?/);return m?parseFloat(m[0]):NaN;};
  function outOfRange(title,v){
    const s=String(v||'');if(!s||s==='—')return false;
    if(/^Blood pressure/i.test(title)){const m=s.match(/(\d+)\/(\d+)/);return !!m&&(+m[1]>=140||+m[2]>=90||+m[1]<90);}
    const n=num(s);if(isNaN(n))return false;
    if(/^Pulse/i.test(title))return n>100||n<60;
    if(/^Temp/i.test(title))return n>=99.5;
    if(/^SpO2/i.test(title))return n<94;
    if(/sugar/i.test(title))return n<80||n>180;
    return false;
  }
  function readSection(sec){
    const t=sec.querySelector('table');if(!t)return null;
    const title=((sec.querySelector('.hd h3,h3')||{}).textContent||'').trim().replace(/\s*monitoring$/i,'');
    const unit=(((sec.querySelector('.hd .tiny')||{}).textContent)||'').split(' · ')[0].trim();
    let heads=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim()).slice(1);
    const byIx=heads.findIndex(h=>/^Entered by$/i.test(h));
    if(byIx>=0)heads=heads.filter((h,i)=>i!==byIx);
    const rows=[...t.querySelectorAll('tbody tr')].filter(tr=>tr.children.length>1).map(tr=>{
      const c=[...tr.children];
      let cells=c.slice(1).map(td=>{const v=td.querySelector('.v');return {v:(v?v.textContent:td.textContent).trim(),i:((td.querySelector('.ini')||{}).textContent||'').trim()};});
      if(byIx>=0)cells=cells.filter((x,i)=>i!==byIx);
      return {d:c[0].textContent.trim(),cells};
    });
    const kind=heads.length&&heads.every(h=>SLOT_SET.includes(h))?(heads.length===1?'daily':'slot'):'meal';
    return {title,unit,heads,rows,kind};
  }
  function oneTable(body){
    if(!body||body.querySelector('.vm10'))return;
    const secs=[...body.querySelectorAll('.vm9')].filter(s=>s.querySelector('table'));
    if(!secs.length)return;
    const P=secs.map(readSection).filter(Boolean);
    const slotP=P.filter(p=>p.kind==='slot'),dailyP=P.filter(p=>p.kind==='daily'),mealP=P.filter(p=>p.kind==='meal');
    let dates=[];P.forEach(p=>p.rows.forEach(r=>{if(!dates.includes(r.d))dates.push(r.d);}));
    const slots=SLOT_SET.filter(s=>slotP.some(p=>p.heads.includes(s)));
    if(!slots.length)slots.push('9 am');
    const cell=(p,d,slot)=>{const r=p.rows.find(x=>x.d===d);if(!r)return null;const ix=p.heads.indexOf(slot);return ix>=0?r.cells[ix]:null;};
    const val=(p,x)=>{if(!x||!x.v||x.v==='—')return '<span class="none">—</span>';const o=outOfRange(p.title,x.v);return `<span class="v${o?' out':''}">${hesc(x.v)}</span>${x.i?`<span class="ini" title="Recorded by">${hesc(x.i)}</span>`:''}`;};
    const th=p=>`<th>${hesc(p.title)}${p.unit?`<small>${hesc(p.unit)}</small>`:''}</th>`;
    const head=`<tr><th>Date</th><th>Time</th>${slotP.map(th).join('')}${dailyP.map(th).join('')}${mealP.map(th).join('')}</tr>`;
    const bodyRows=dates.map(d=>slots.map((s,si)=>{
      let tr=`<tr class="${si===0?'first':''}">`;
      if(si===0)tr+=`<td class="d" rowspan="${slots.length}">${hesc(d)}</td>`;
      tr+=`<td class="t">${hesc(s)}</td>`;
      slotP.forEach(p=>{const x=cell(p,d,s);const o=x&&outOfRange(p.title,x.v);tr+=`<td${o?' class="outc"':''}>${val(p,x)}</td>`;});
      if(si===0){
        dailyP.forEach(p=>{const x=cell(p,d,'9 am');const o=x&&outOfRange(p.title,x.v);tr+=`<td rowspan="${slots.length}"${o?' class="outc"':''}>${val(p,x)}</td>`;});
        mealP.forEach(p=>{const r=p.rows.find(x=>x.d===d);tr+=`<td rowspan="${slots.length}">${r?p.heads.map((h,i)=>{const x=r.cells[i]||{v:''};const o=outOfRange(p.title,x.v);return `<div class="ml"><span>${hesc(h)}</span><b class="v${o?' out':''}">${hesc(x.v||'—')}</b></div>`;}).join(''):'<span class="none">—</span>'}</td>`;});
      }
      return tr+'</tr>';
    }).join('')).join('');
    const addBtn=(secs.map(s=>[...s.querySelectorAll('button')].find(b=>/^Add reading$/i.test(b.textContent.trim()))).find(Boolean)||{}).outerHTML||'';
    const sugarNote=mealP.length?'Blood sugar target 80 to 180 mg/dL. ':'';
    const card=document.createElement('section');card.className='vm10';
    card.innerHTML=`<div class="hd"><h3>Vitals and monitoring</h3><span class="tiny muted">${sugarNote}Out of range in red. The letters are the nurse who recorded it.</span>${addBtn?addBtn.replace('class="btn sm"','class="btn sm"'):''}</div>
      <div class="vscroll"><table><thead>${head}</thead><tbody>${bodyRows||`<tr><td colspan="${2+P.length}" class="muted small">No readings in this date range.</td></tr>`}</tbody></table></div>`;
    secs[0].parentNode.insertBefore(card,secs[0]);
    secs.forEach(s=>s.remove());
  }
  const __vmr=window.psyVmRebuild;
  window.psyVmRebuild=function(p){
    const r=__vmr?__vmr.apply(this,arguments):undefined;
    try{oneTable(p&&p.querySelector&&p.querySelector('.psy-tx-body'));}catch(e){}
    return r;
  };
  const __vp70=vPatient;
  vPatient=function(sub){
    const h=__vp70.apply(this,arguments);
    if(!psy()||typeof h!=='string'||h.indexOf('vm9')<0)return h;
    try{
      const t=document.createElement('template');t.innerHTML=h;
      t.content.querySelectorAll('.psy-tx-panel').forEach(p=>{if(/^Vitals and monitoring/.test(((p.querySelector('h3')||{}).textContent||'').trim()))oneTable(p.querySelector('.psy-tx-body'));});
      return t.innerHTML;
    }catch(e){return h;}
  };

  /* ---------- 6. Management Plan: filled once at admission, so it opens read only ---------- */
  const MP=[['dx','Diagnosis'],['goals','Goals of treatment'],['meds','Medicines and why'],['therapy','Therapies planned'],['risk','Risk management'],['mon','Monitoring'],['stay','Expected length of stay'],['dc','Plan for discharge'],['rev','Review date']];
  window.psyMpView=function(v){S.mpView=v;render();};
  const __pl=pPlans;
  pPlans=function(){
    if(!psy())return __pl.apply(this,arguments);
    const m=psyPx(S.pid).mgmt||{},filled=!!(m.dx||m.goals||m.meds);
    const mode=S.mpView||(filled?'read':'form');
    const seg=`<div class="seg" style="align-self:flex-start;min-width:240px;margin-bottom:12px"><button class="${mode==='read'?'on':''}" onclick="psyMpView('read')">Read only</button><button class="${mode==='form'?'on':''}" onclick="psyMpView('form')">Fill form</button></div>`;
    if(mode==='form')return seg+__pl.apply(this,arguments);
    const rv=(l,t)=>`<div class="box small"><div class="lbl">${l}</div><div style="margin-top:4px;white-space:pre-wrap">${t?hesc(t):'<span class="muted">Not filled in</span>'}</div></div>`;
    const st=m.signed?`<span class="small" style="color:#067647;font-weight:600">Signed ${hesc(m.signed.at)} · ${hesc(m.signed.by)}</span>`:`<span class="small muted">${filled?'Not signed yet':'Not filled in yet'}</span>`;
    return seg+`<section class="card"><div class="hd"><div><h3>Management Plan</h3><div style="margin-top:4px">${st}</div></div>${m.signed?`<button class="btn sm" onclick="psyMpAdd()">Add addendum</button>`:''}</div>
      <div class="pad grid2">${MP.map(([k,l])=>rv(l,m[k])).join('')}</div>
      ${(m.add||[]).map(a=>`<div class="small" style="margin:0 20px 12px;padding:8px 10px;background:#f3f7ff;border-radius:8px"><b>Addendum by ${hesc(a.by)}, ${hesc(a.at)}:</b> ${hesc(a.t)}</div>`).join('')}
      <div class="pad small muted">Filled once when the patient is admitted. Switch to Fill form to change it.</div></section>`;
  };

  /* ---------- 7. Treatment Management Plan: no consents list (they are in Admission forms), and a log that shows done and not done ---------- */
  function tmpLog(p){
    const body=p.querySelector('.psy-tx-body');if(!body)return;
    const old=body.querySelector('.tm9-log');if(!old||old.dataset.l10)return;
    /* everything after the order log (the Consents label and table) goes */
    let n=old.nextElementSibling;while(n){const m=n.nextElementSibling;n.remove();n=m;}
    let D;try{D=window.psyTmpOrders();}catch(e){return;}
    const O=D.list||[];
    const st=o=>{const d=D.done(o),t=o.steps.length;return d===t?['done','Done']:d?['prog','In progress']:['none','Not started'];};
    const tot={done:0,prog:0,none:0};O.forEach(o=>tot[st(o)[0]]++);
    const row=o=>{
      const [c,l]=st(o),d=D.done(o),t=o.steps.length,def=D.defs[o.key]||{t:o.key};
      const next=o.steps.findIndex(s=>!s.done);
      return `<div class="tl10 ${c}"><div class="tl10-h"><div><b>${hesc(def.t)}</b><div class="tiny muted">Ordered by ${hesc(o.by)} · ${hesc(o.at)}</div></div>
        <div class="tl10-r"><span class="tl10-chip ${c}">${l} · ${d} of ${t}</span><button class="btn sm" onclick="psyTmOpen('${o.id}',${Math.max(0,next)})">${c==='done'?'View':'Open'}</button></div></div>
        <div class="tl10-bar" aria-hidden="true"><i style="width:${Math.round(d/t*100)}%"></i></div>
        <ul class="tl10-s">${o.steps.map(s=>`<li class="${s.done?'y':'n'}"><span class="b">${s.done?'✓':'○'}</span><span class="t">${hesc(s.n)}</span><span class="who">${hesc(s.role)}${s.done?' · done '+hesc(s.by||'')+(s.at?', '+hesc(s.at):''):' · not done'}</span></li>`).join('')}</ul></div>`;
    };
    const sec=document.createElement('section');sec.className='card tm9-log';sec.dataset.l10='1';
    sec.innerHTML=`<div class="hd"><div><h3>Order log</h3><div class="small muted" style="margin-top:4px">What was ordered, and which tasks are done and which are not yet.</div></div>${O.length?`<div class="tl10-sum"><span class="tl10-chip done">${tot.done} done</span><span class="tl10-chip prog">${tot.prog} in progress</span><span class="tl10-chip none">${tot.none} not started</span></div>`:''}</div>
      <div style="padding:4px 16px 16px">${O.length?O.map(row).join(''):'<div class="muted small" style="padding:8px 4px">Nothing ordered yet.</div>'}</div>`;
    old.replaceWith(sec);
  }

  /* ---------- 8. Rounds: assign assessments to the psychologist ---------- */
  const MODS=(window.pgMpLists&&pgMpLists.MODS)||['PHQ-9 (depression)','GAD-7 (anxiety)','BDI-II','BAI','Y-BOCS (OCD)','HAM-D','HAM-A','PANSS','MoCA','MMSE','Rosenberg self-esteem','WHO-5 well-being'];
  const asgPid=()=>{try{return scribePt().id;}catch(e){return S.pid;}};
  window.psyAsgAdd=function(v){
    if(!v)return;const pid=asgPid(),x=psyPx(pid);x.assignedAssess=x.assignedAssess||[];
    if(x.assignedAssess.some(a=>a.name===v))return;
    x.assignedAssess.unshift({name:v,by:signer(),at:atNow(),status:'Assigned'});
    /* the psychologist sees it under Planned assessments in the psychologist's management plan */
    const m=x.mgmtPsych=x.mgmtPsych||{};m.assess=m.assess||[];if(!m.assess.includes(v))m.assess.push(v);
    render();toast(v.replace(/ \(.*\)/,'')+' assigned to the psychologist');
  };
  window.psyAsgDel=function(i){const x=psyPx(asgPid());(x.assignedAssess||[]).splice(i,1);render();};
  const assessCard=()=>{
    const pid=asgPid(),L=(psyPx(pid).assignedAssess||[]);
    return `<section class="card" id="asgCard"><div class="hd"><h3>Assessments</h3>${L.length?chip(L.length+' assigned','c-blue'):''}</div>
      <div style="padding:12px 20px 16px;border-top:1px solid var(--line-2)"><div class="lbl" style="margin-bottom:6px">Assign an assessment to the psychologist</div>
        <select class="input" aria-label="Assign an assessment" onchange="psyAsgAdd(this.value)"><option value="">Choose an assessment…</option>${MODS.filter(m=>!L.some(a=>a.name===m)).map(m=>`<option>${hesc(m)}</option>`).join('')}</select>
        ${L.map((a,i)=>`<div class="pr-lo9" style="margin-top:10px"><div class="pr-lo9-h"><span><b>${hesc(a.name)}</b><span class="tiny muted" style="display:block">Assigned by ${hesc(a.by)} · ${hesc(a.at)} · for the psychologist</span></span><button class="x" aria-label="Remove ${hesc(a.name)}" onclick="psyAsgDel(${i})">×</button></div></div>`).join('')}
      </div></section>`;
  };
  const __rm70=roundMon;
  roundMon=function(){
    const h=__rm70.apply(this,arguments);
    if(!psy()||typeof h!=='string')return h;
    try{return h+assessCard();}catch(e){return h;}
  };

  /* ---------- 9. Therapy Plans: one plus sign on Add, and an AI scribe Record button beside it ---------- */
  const MIC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  window.psyThRecord=function(k){
    if(typeof psyThAdd!=='function'||typeof scribeForm!=='function')return;
    psyThAdd(k);
    const m=$('modal'),title=((m.querySelector('h3')||{}).textContent||'Therapy plans').replace(/^Add\s*·\s*/,'');
    const fields=[...m.querySelectorAll('[id^="th9_"]')].filter(e=>e.id!=='th9_date').map(e=>({key:e.id.replace('th9_',''),label:((e.closest('label')||document).querySelector('.lbl')||{}).textContent||e.id,type:e.tagName==='SELECT'?'one':'text',options:e.tagName==='SELECT'?[...e.options].map(o=>o.text):undefined}));
    const pt=(window.ptFind&&ptFind(S.pid))||{name:''};
    closeModal();
    scribeForm({title:title+' · '+pt.name,form:'Therapy plan entry: '+title,context:pt.name+', '+title,fields,
      apply:v=>{psyThAdd(k);Object.keys(v).forEach(id=>{const el=$('th9_'+id);if(el)el.value=Array.isArray(v[id])?v[id].join(', '):v[id];});},cancel:()=>{}});
  };
  function therapyBtns(v){
    v.querySelectorAll('button[onclick^="psyThAdd("]').forEach(b=>{
      const t=b.textContent.replace(/\s+/g,' ').trim();
      if(b.querySelector('svg')&&/^\+\s*/.test(t)){const tn=[...b.childNodes].reverse().find(n=>n.nodeType===3&&/\S/.test(n.nodeValue));if(tn)tn.nodeValue=' '+tn.nodeValue.replace(/^\s*\+\s*/,'');}
      const m=(b.getAttribute('onclick')||'').match(/psyThAdd\('(\w+)'\)/);
      if(m&&!b.parentElement.querySelector('.th10-rec')){
        const w=document.createElement('div');w.className='th10-act';b.parentNode.insertBefore(w,b);
        w.insertAdjacentHTML('beforeend',`<button type="button" class="btn sm th10-rec" onclick="psyThRecord('${m[1]}')" aria-label="Record with the AI scribe">${MIC} Record with AI scribe</button>`);
        w.appendChild(b);
      }
    });
  }

  /* ---------- 10. Patient Experience: icons ---------- */
  const IC=p=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const PX_ICONS={
    diet:IC('<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 1-3 3.5-3 6s1 3 3 3v9"/>'),
    calls:IC('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    visitors:IC('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.4 3.5 5"/>'),
    room:IC('<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>'),
    act:IC('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
    comm:IC('<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.3A8 8 0 1 1 21 12z"/>'),
    other:IC('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    grv:IC('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>')
  };
  const rowIcon=l=>{
    l=l.toLowerCase();
    if(/diet type/.test(l))return IC('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.6 5-6.5"/>');
    if(/allerg|avoid/.test(l))return IC('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>');
    if(/like|dislike|fasting/.test(l))return IC('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>');
    if(/phone|call/.test(l))return PX_ICONS.calls;
    if(/visit/.test(l))return PX_ICONS.visitors;
    if(/room$|^room/.test(l)&&!/mate/.test(l))return PX_ICONS.room;
    if(/roommate/.test(l))return PX_ICONS.visitors;
    if(/belong/.test(l))return IC('<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
    if(/gym|walk/.test(l))return IC('<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>');
    if(/activit/.test(l))return PX_ICONS.act;
    if(/outing/.test(l))return IC('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>');
    if(/language/.test(l))return IC('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>');
    if(/clinical updates/.test(l))return IC('<path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>');
    if(/billing|payment/.test(l))return IC('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>');
    if(/not share|do not/.test(l))return IC('<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>');
    if(/relig|cultur/.test(l))return IC('<path d="M12 3l1.9 5.6L19.5 10l-4.6 3.4 1.8 5.6L12 15.8 7.3 19l1.8-5.6L4.5 10l5.6-1.4z"/>');
    if(/routine/.test(l))return IC('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
    return IC('<circle cx="12" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>');
  };
  const secIcon=t=>{t=t.toLowerCase();return /diet/.test(t)?['#fef6e7','#b54708',PX_ICONS.diet]:/calls/.test(t)?['#eef4ff','#175cd3',PX_ICONS.calls]:/visitor/.test(t)?['#f4f0ff','#6941c6',PX_ICONS.visitors]:/room/.test(t)?['#ecfdf3','#067647',PX_ICONS.room]:/activit/.test(t)?['#fff1f3','#c01048',PX_ICONS.act]:/communication/.test(t)?['#e8f7fb','#0e7090',PX_ICONS.comm]:/other/.test(t)?['#f2f4f7','#475467',PX_ICONS.other]:['#fef3f2','#b42318',PX_ICONS.grv];};
  function pxIcons(v){
    v.querySelectorAll('.pxs-card').forEach(c=>{
      if(c.dataset.ic)return;c.dataset.ic='1';
      const h=c.querySelector('.pxs-hd h4');
      if(h){const [bg,fg,svg]=secIcon(h.textContent);h.insertAdjacentHTML('beforebegin',`<span class="px10-ic" style="background:${bg};color:${fg}">${svg}</span>`);}
      c.querySelectorAll('.pxs-row dt').forEach(dt=>{dt.insertAdjacentHTML('afterbegin',`<span class="px10-ri">${rowIcon(dt.textContent)}</span>`);});
    });
  }

  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    try{
      if(psy()){
        const v=$('view');
        if(v){
          dashFix(v);medButtons(v);if(S.admSec==='formc')formCTable(v);
          therapyBtns(v);pxIcons(v);
          v.querySelectorAll('.psy-tx-panel').forEach(p=>{if(/^Treatment Management Plan/.test(((p.querySelector('h3')||{}).textContent||'').trim()))tmpLog(p);});
        }
      }
    }catch(e){}
    return out;
  };

  /* ---------- 3. file viewer: view and print only ---------- */
  const __ps=pastSummary,__pf=pastFile;
  function patchModal(i){
    const m=$('modal');if(!m)return;
    m.querySelectorAll('button').forEach(b=>{
      const t=b.textContent.trim();
      if(/^Download/i.test(t)){
        b.textContent='Print';b.setAttribute('onclick','psyPastPdf('+i+')');
      }
    });
    const c=m.querySelector('.callout');
    if(c&&!/View only/.test(c.textContent))c.insertAdjacentHTML('afterend','<div class="tiny muted" style="margin-top:8px">View only. You can print this file, but it is not saved on your computer.</div>');
  }
  pastSummary=function(i){
    const r=__ps.apply(this,arguments);
    if(psyOrPg())patchModal(i||0);
    return r;
  };
  pastFile=function(i){
    const r=__pf.apply(this,arguments);
    if(psyOrPg())patchModal(i||0);
    return r;
  };
})();
