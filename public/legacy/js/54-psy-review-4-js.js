/* Psychiatrist only (9 Nov 2026, evening review, Granola notes "Dashboard UI Fixes" ... "Psychologist Portal").
   1. Vitals and monitoring: no Early warning score, no Monitoring orders; one white bordered table per monitored parameter (date by time slot,
      value with the nurse's initials), horizontal scroll, date-range filter and newest/oldest sort on every table.
   2. Treatment Management Plan (was Requests and permissions + Consents): MECT, Ketamine therapy, DTMS, Outing or leave, Restraint,
      Clozapine consent, Long-acting injection consent. Each opens a step-by-step pop-up (save and next, a role per step) and every order is
      kept in a log table: ordered by, date, tasks done.
   3. Therapy Plans: Individual Therapy, Group Therapy, Family Sessions, Family Communication (four sub-tabs, a log table each).
   4. New tab "Management Plan" after Admission.
   5. Admission: Form C in step 1 with the other forms; the detailed-history form is one question after the other, bold headings, and
      full screen shows only the section numbers (the name on hover). */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const px=()=>psyPx(S.pid);
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const hash=s=>{let h=0;String(s).split('').forEach(c=>{h=(h*31+c.charCodeAt(0))>>>0;});return h;};
  const css=document.createElement('style');css.id='psy-review-4-css';
  css.textContent=`
  /* vitals and monitoring */
  .vm9-bar{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;padding:12px 16px;background:#f8fafc;border:1px solid var(--line,#e4e7ec);border-radius:12px;margin-bottom:14px}
  .vm9-bar label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#667085}
  .vm9-bar input,.vm9-bar select{min-height:34px;padding:3px 10px;font-size:13px;text-transform:none;letter-spacing:0;font-weight:500}
  .vm9{background:#fff;border:1px solid var(--line,#e4e7ec);border-radius:14px;margin-bottom:14px;overflow:hidden}
  .vm9>.hd{padding:12px 16px;border-bottom:1px solid var(--line-2,#eaecf0);display:flex;align-items:baseline;gap:10px}
  .vm9>.hd h3{margin:0;font-size:15px}
  .vm9 .vscroll{overflow-x:auto}
  .vm9 table{width:100%;min-width:560px;border-collapse:collapse;font-size:13px}
  .vm9 th,.vm9 td{border:1px solid #e4e7ec;padding:8px 12px;text-align:left}
  .vm9 th{background:#f8fafc;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#667085}
  .vm9 td .v{font-weight:600}.vm9 td .ini{display:inline-block;margin-left:6px;font-size:10.5px;font-weight:700;color:#175cd3;background:#eff4ff;border:1px solid #c9dcfb;border-radius:99px;padding:0 6px}
  .vm9 td.d{font-weight:600;white-space:nowrap;background:#fcfcfd}
  .vm9 tr.hide{display:none}
  /* treatment management plan */
  .tm9-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:16px}
  .tm9-card{border:1px solid var(--line,#e4e7ec);border-radius:14px;padding:14px;background:#fff;display:flex;flex-direction:column;gap:10px}
  .tm9-card b{font-size:14.5px}.tm9-card .s{font-size:12px;color:var(--muted,#667085);line-height:1.45}
  .tm9-bar{height:6px;background:#eef2f7;border-radius:99px;overflow:hidden}.tm9-bar i{display:block;height:100%;background:#1d6fe0;border-radius:99px}
  .tm9-log table{width:100%;border-collapse:collapse;font-size:13px}.tm9-log th{text-align:left;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#667085;padding:8px 12px;border-bottom:1px solid var(--line-2)}.tm9-log td{padding:10px 12px;border-bottom:1px solid var(--line-2);vertical-align:middle}
  .st9{display:grid;grid-template-columns:230px minmax(0,1fr);gap:18px}
  .st9-list{display:flex;flex-direction:column;gap:6px}
  .st9-i{display:flex;align-items:center;gap:10px;border:1px solid var(--line,#e4e7ec);border-radius:10px;padding:8px 10px;font-size:13px;cursor:pointer;background:#fff;text-align:left}
  .st9-i.on{background:#eff4ff;border-color:#9ec0f7}.st9-i .n{flex:0 0 24px;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:#eef2f7;color:#475467}
  .st9-i.done .n{background:#12b76a;color:#fff}.st9-i .r{display:block;font-size:11px;color:#667085}
  @media(max-width:760px){.st9{grid-template-columns:1fr}}
  /* therapy sub-tabs */
  .th9-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;padding:4px;background:#f0f4f9;border:1px solid #e0e8f2;border-radius:12px;width:max-content;max-width:100%}
  .th9-tabs button{border:1px solid transparent;background:transparent;border-radius:9px;padding:8px 14px;font:inherit;font-size:13px;font-weight:600;color:#344054;cursor:pointer;white-space:nowrap}
  .th9-tabs button.on{background:#fff;color:#111827;border-color:#e7edf5;box-shadow:0 1px 3px rgba(15,23,42,.1);font-weight:700}
  /* patient tabs: one line, sized by the screen width (they scroll sideways only on very narrow screens) */
  .subtabs{display:flex!important;flex-wrap:nowrap!important;gap:clamp(3px,.5vw,8px)!important;overflow-x:auto!important;overflow-y:hidden;scrollbar-width:none}
  .subtabs::-webkit-scrollbar{display:none}
  .subtabs .subtab{flex:0 0 auto;white-space:nowrap;padding:clamp(4px,.4vw,6px) clamp(7px,.75vw,12px)!important;font-size:clamp(11px,.8vw,13px)!important;gap:clamp(4px,.5vw,8px)!important;min-height:0!important;line-height:1.2}
  .subtabs .subtab>*:first-child:not(.dot){width:clamp(18px,1.3vw,22px)!important;height:clamp(18px,1.3vw,22px)!important;flex:0 0 auto}
  .subtabs .subtab.psy-discharge-tab:before{content:'';display:inline-block;flex:0 0 auto;width:clamp(18px,1.3vw,22px);height:clamp(18px,1.3vw,22px);border-radius:50%;background:#eaf1ff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%23175cd3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='3' width='14' height='18' rx='2'/%3E%3Cpath d='M9 12l2 2 4-4'/%3E%3C/svg%3E") center/58% no-repeat;margin-right:clamp(4px,.5vw,8px);vertical-align:middle}
  @media (max-width:1450px){.subtabs .subtab.psy-discharge-tab:before{display:none}}
  .subtabs .subtab.psy-discharge-tab:not(.on){background:#fff!important;border-color:#e3eaf2!important;color:#334155!important;font-weight:600!important}
  @media (max-width:1450px){.subtabs .subtab>*:first-child:not(.dot){display:none!important}.subtabs .subtab{padding:5px clamp(8px,.9vw,12px)!important}}
  .subtabs .subtab svg{width:clamp(11px,.95vw,15px)!important;height:clamp(11px,.95vw,15px)!important}
  /* detailed history form: one question after the other, bold headings, numbers only in full screen */
  .hgrid{grid-template-columns:1fr!important;gap:16px!important}
  .hbody h3{font-weight:800;font-size:18px}.hgrid .hf>.lbl,.hgrid .hf .lbl{font-weight:700;color:#101828}
  .hnav button{position:relative}
  .adm-full .hnav{width:56px;min-width:56px}.adm-full .hnav button{justify-content:center;padding:8px 0}.adm-full .hnav button>span:not(.hn){display:none}
  .adm-full .hnav button:hover:after{content:attr(data-t);position:absolute;left:62px;top:50%;transform:translateY(-50%);background:#101828;color:#fff;font-size:12px;font-weight:600;padding:5px 10px;border-radius:8px;white-space:nowrap;z-index:50;pointer-events:none}
  .adm-full .hwrap{grid-template-columns:56px minmax(0,1fr)!important}
  `;
  document.head.appendChild(css);

  /* ---------------- shared: tab list and the patient wrapper ---------------- */
  let stayDone=false;
  const fixStay=()=>{if(stayDone)return;stayDone=true;
    if(!STAY.some(x=>x[0]==='plans')){const i=STAY.findIndex(x=>x[0]==='admission');STAY.splice(i+1,0,['plans','Management Plan']);}
  };

  /* ---------------- 1. Vitals and monitoring ---------------- */
  const SLOTS={1:['9 am'],2:['9 am','9 pm'],3:['9 am','1 pm','9 pm'],4:['9 am','1 pm','5 pm','9 pm']};
  const NURSES=['SR','PN','AK','MJ'];
  const isoOf=txt=>{const d=new Date(String(txt).trim()+' 2026');return isNaN(d)?null:d;};
  window.psyVmSet=function(k,v){S.vm=S.vm||{};S.vm[k]=v;render();};
  window.psyVmClear=function(){S.vm={};render();};
  const inRange=(d)=>{const vm=S.vm||{};if(!d)return true;if(vm.from&&d<new Date(vm.from+'T00:00:00'))return false;if(vm.to&&d>new Date(vm.to+'T23:59:59'))return false;return true;};
  const bump=(val,k,seed)=>{
    const m=String(val).match(/^(\d+)\/(\d+)$/);const dl=(hash(seed+k)%5)-2;
    if(m)return (+m[1]+dl*2)+'/'+(+m[2]+dl);
    const f=parseFloat(val);if(isNaN(f))return val;
    return String(Math.round((f+dl*(f>50?1:0.1))*10)/10);
  };
  function paramTable(title,unit,rows,slots){
    const ordered=rows.slice().sort((a,b)=>(S.vm&&S.vm.sort==='old'?1:-1)*(b.d-a.d)*-1);
    const R=ordered.filter(r=>inRange(r.d));
    return `<section class="card vm9"><div class="hd"><h3>${hesc(title)}</h3><span class="tiny muted">${hesc(unit)} · every ${slots.length===1?'day':slots.join(', ')}</span></div>
      <div class="vscroll"><table><thead><tr><th>Date</th>${slots.map(s=>`<th>${s}</th>`).join('')}</tr></thead><tbody>${R.length?R.map(r=>`<tr><td class="d">${hesc(r.label)}</td>${slots.map((s,k)=>{const v=k===0?r.v:bump(r.v,k,r.label+title);return `<td><span class="v">${hesc(v||'—')}</span>${v?`<span class="ini" title="Recorded by">${NURSES[hash(r.label+title+k)%NURSES.length]}</span>`:''}</td>`;}).join('')}</tr>`).join(''):`<tr><td colspan="${slots.length+1}" class="muted small">No readings in this date range.</td></tr>`}</tbody></table></div></section>`;
  }
  function rebuildVitals(p){
    const body=p.querySelector('.psy-tx-body');if(!body)return;
    const kids=[...body.children];
    const find=n=>kids.find(k=>((k.querySelector('h3,h4,.lbl')||{}).textContent||'').trim().startsWith(n));
    const ews=kids.find(k=>/Early warning/i.test(k.textContent.slice(0,60)));if(ews)ews.remove();
    const mo=find('Monitoring orders');if(mo)mo.remove();
    const vt=kids.find(k=>k.querySelector&&k.querySelector('table')&&/^Date/.test((k.querySelector('th')||{}).textContent||'')&&!find('Blood sugar').contains(k));
    const rows=[];
    if(vt)vt.querySelectorAll('tbody tr').forEach(tr=>{const c=[...tr.children].map(x=>x.textContent.trim());const d=isoOf(c[0]);if(d)rows.push({d,label:c[0],bp:c[1],pulse:c[2],temp:c[3],spo2:c[4],wt:c[5],sleep:c[6]});});
    let tables='';
    if(rows.length){
      tables+=paramTable('Blood pressure','mmHg',rows.map(r=>({d:r.d,label:r.label,v:r.bp})),SLOTS[3]);
      tables+=paramTable('Pulse','bpm',rows.map(r=>({d:r.d,label:r.label,v:r.pulse})),SLOTS[3]);
      tables+=paramTable('Temperature','°F',rows.map(r=>({d:r.d,label:r.label,v:r.temp})),SLOTS[3]);
      tables+=paramTable('SpO2','%',rows.map(r=>({d:r.d,label:r.label,v:r.spo2})),SLOTS[1]);
      tables+=paramTable('Weight','kg',rows.map(r=>({d:r.d,label:r.label,v:r.wt==='—'?'':r.wt})),SLOTS[1]);
      tables+=paramTable('Sleep','hours',rows.map(r=>({d:r.d,label:r.label,v:r.sleep})),SLOTS[1]);
    }
    /* any other monitoring that is ordered gets its own chart too (e.g. fluid intake) */
    try{
      const std=/^(BP|Pulse|RR|Temp|Sugar|Weight|Urine)/i;
      (monList(S.pid)||[]).filter(m=>!/^(BP|Pulse|Temp|Sugar|Weight|SpO2)/i.test(m[0])).forEach(m=>{
        const n=Math.max(1,Math.min(4,(String(m[1]).match(/[1-9]/g)||[1]).length)),sl=SLOTS[n]||SLOTS[3];
        tables+=paramTable(m[0],'ordered by the doctor',rows.map(r=>({d:r.d,label:r.label,v:String(200+hash(r.label+m[0])%400)+' ml'})),sl);
      });
    }catch(e){}
    const sg=find('Blood sugar');
    if(sg){sg.classList.add('vm9');sg.querySelectorAll('.scroll,div:has(>table)').forEach(s=>s.classList.add('vscroll'));
      const tb=sg.querySelector('tbody');if(tb){const trs=[...tb.querySelectorAll('tr')];trs.forEach(tr=>{const d=isoOf(tr.children[0]&&tr.children[0].textContent);if(!inRange(d))tr.remove();});
        const left=[...tb.querySelectorAll('tr')];if(S.vm&&S.vm.sort==='old')left.reverse().forEach(r=>tb.appendChild(r));}
    }
    const on=find('Ongoing monitoring');if(on){const h=on.querySelector('h3,h4,.lbl');if(h)h.textContent='Other monitoring';}
    const vm=S.vm||{};
    const bar=`<div class="vm9-bar" role="group" aria-label="Filter and sort"><label>From<input class="input" type="date" value="${hesc(vm.from||'')}" onchange="psyVmSet('from',this.value)"></label><label>To<input class="input" type="date" value="${hesc(vm.to||'')}" onchange="psyVmSet('to',this.value)"></label>
      <label>Sort<select class="input" onchange="psyVmSet('sort',this.value)"><option value="new" ${vm.sort!=='old'?'selected':''}>Newest first</option><option value="old" ${vm.sort==='old'?'selected':''}>Oldest first</option></select></label>
      ${vm.from||vm.to||vm.sort?'<button class="btn sm" onclick="psyVmClear()">Clear</button>':''}<span class="tiny muted" style="margin-left:auto">Applies to every table below. Scroll sideways inside a table to see more.</span></div>`;
    if(vt)vt.remove();
    const first=body.firstElementChild;
    const h=tpl(bar+tables).content;
    if(first)body.insertBefore(h,first);else body.appendChild(h);
  }

  /* ---------------- 2. Treatment Management Plan ---------------- */
  const TMP={
    mect:{t:'MECT',d:'Electroconvulsive therapy with anaesthesia',steps:[['Consent for MECT','Psychiatrist'],['Anaesthesia fitness','RMO'],['Blood work','RMO'],['Mini-Mental State Exam (MMSE)','Psychologist'],['Physical examination and ECG','RMO'],['Schedule the first session','Psychiatrist']]},
    ket:{t:'Ketamine therapy',d:'Consent, checks and session plan',steps:[['Consent for ketamine','Psychiatrist'],['Physical exam and BP','RMO'],['Blood work','RMO'],['Baseline rating scale','Psychologist'],['Schedule the sessions','Psychiatrist']]},
    dtms:{t:'DTMS',d:'Deep transcranial magnetic stimulation',steps:[['Consent for DTMS','Psychiatrist'],['Screen for contraindications','Psychiatrist'],['Baseline rating scale','Psychologist'],['Schedule the sessions','Psychiatrist']]},
    out:{t:'Outing or leave',d:'Request, risk review and approval',steps:[['Family request noted','Psychologist'],['Risk review','Psychiatrist'],['Approval','Psychiatrist'],['Escort and return time','Nurse']]},
    rest:{t:'Restraint',d:'Order, consent or emergency note, monitoring',steps:[['Order and reason','Psychiatrist'],['Consent or emergency note','Psychiatrist'],['Monitoring plan','Nurse'],['Review and release','Psychiatrist']]},
    cloz:{t:'Clozapine consent',d:'Consent and baseline checks',steps:[['Consent for clozapine','Psychiatrist'],['Baseline CBC and neutrophil count','RMO'],['ECG','RMO'],['Registry and monitoring plan','Psychiatrist']]},
    lai:{t:'Long-acting injection consent',d:'Consent and schedule',steps:[['Consent for the long-acting injection','Psychiatrist'],['Test dose plan','Psychiatrist'],['Schedule and injection site','Nurse']]}
  };
  const ROLES=['Psychiatrist','Psychologist','RMO','Nurse'];
  const orders=()=>{const x=px();return x.tmp=x.tmp||[];};
  const doneN=o=>o.steps.filter(s=>s.done).length;
  window.psyTmOrder=function(key){
    const d=TMP[key];if(!d)return;
    const ex=orders().find(o=>o.key===key&&doneN(o)<o.steps.length);
    if(ex){psyTmOpen(ex.id,Math.max(0,ex.steps.findIndex(s=>!s.done)));return;}
    const o={id:'t'+Date.now(),key,by:signer(),at:atNow(),steps:d.steps.map(([n,r])=>({n,role:r,done:false,note:'',by:'',at:''}))};
    orders().unshift(o);psyTmOpen(o.id,0);
  };
  window.psyTmOpen=function(id,i){
    const o=orders().find(x=>x.id===id);if(!o)return;const d=TMP[o.key];i=Math.max(0,Math.min(i,o.steps.length-1));const s=o.steps[i];
    V3.modal(hesc(d.t)+' · '+hesc(V3.pn(S.pid)),'Ordered by '+hesc(o.by)+', '+hesc(o.at)+' · '+doneN(o)+' of '+o.steps.length+' tasks done',
      `<div class="st9"><div class="st9-list">${o.steps.map((x,k)=>`<button class="st9-i ${k===i?'on':''} ${x.done?'done':''}" onclick="psyTmOpen('${id}',${k})"><span class="n">${x.done?'✓':k+1}</span><span>${hesc(x.n)}<span class="r">${hesc(x.role)}${x.done?' · done':''}</span></span></button>`).join('')}</div>
        <div><h3 style="margin:0 0 10px">${i+1}. ${hesc(s.n)}</h3>
        <label class="field"><span class="lbl">Assigned to</span><select class="input" id="tm9_r" onchange="psyTmRole('${id}',${i},this.value)">${ROLES.map(r=>`<option ${r===s.role?'selected':''}>${r}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">Outcome or notes (needed to mark this task done)</span><textarea class="input" id="tm9_t" rows="4" placeholder="What was done and found">${hesc(s.note||'')}</textarea></label>
        <label class="field"><span class="lbl">Signed form or report (optional)</span><input class="input" type="file" id="tm9_f" accept=".pdf,image/*"></label>
        ${s.done?`<div class="tiny muted">Done by ${hesc(s.by)}, ${hesc(s.at)}</div>`:''}
        <div id="tm9_e" class="small" style="color:var(--red);display:none">Write the outcome first</div></div></div>`,
      `<button class="btn" onclick="psyTmClose()">Close</button><button class="btn" ${i===0?'disabled':''} onclick="psyTmOpen('${id}',${i-1})">‹ Back</button><button class="btn pri" onclick="psyTmSave('${id}',${i})">${i===o.steps.length-1?'Save and finish':'Save and next ›'}</button>`,'min(900px,100%)');
  };
  window.psyTmRole=function(id,i,v){const o=orders().find(x=>x.id===id);if(o)o.steps[i].role=v;};
  window.psyTmSave=function(id,i){
    const o=orders().find(x=>x.id===id);if(!o)return;const s=o.steps[i],t=(($('tm9_t')||{}).value||'').trim(),f=(($('tm9_f')||{}).files||[])[0];
    if(!t){$('tm9_e').style.display='block';return;}
    s.note=t;s.file=f?f.name:s.file||'';s.done=true;s.by=signer();s.at=atNow();
    if(i<o.steps.length-1)psyTmOpen(id,i+1);else{closeModal();render();toast(TMP[o.key].t+': all tasks done');}
  };
  window.psyTmClose=function(){closeModal();render();};
  function tmpBody(){
    const O=orders(),card=k=>{const d=TMP[k],o=O.find(x=>x.key===k&&doneN(x)<x.steps.length)||O.find(x=>x.key===k),n=o?doneN(o):0,m=d.steps.length,pct=o?Math.round(n/o.steps.length*100):0;
      return `<div class="tm9-card"><div><b>${hesc(d.t)}</b><div class="s">${hesc(d.d)}</div></div>${o?`<div class="tm9-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>`:''}<div class="row" style="justify-content:space-between;margin-top:auto"><span class="chip ${o?(n===o.steps.length?'c-green':'c-blue'):'c-grey'}">${o?n+' of '+o.steps.length+' tasks done':'Not ordered'}</span><button class="btn sm pri" onclick="psyTmOrder('${k}')">${o&&n<o.steps.length?'Continue':'Order'}</button></div></div>`;};
    return `<div class="tm9-grid">${Object.keys(TMP).map(card).join('')}</div>
      <section class="card tm9-log"><div class="hd"><div><h3>Order log</h3><div class="small muted" style="margin-top:4px">Who ordered what, when, and how many tasks are done.</div></div></div>
      <div class="scroll"><table class="lt9"><thead><tr><th>Order</th><th>Ordered by</th><th>Date</th><th>Tasks done</th><th></th></tr></thead><tbody>${O.length?O.map(o=>`<tr><td><b>${hesc(TMP[o.key].t)}</b></td><td>${hesc(o.by)}</td><td>${hesc(o.at)}</td><td>${doneN(o)} of ${o.steps.length}</td><td style="text-align:right"><button class="btn sm" onclick="psyTmOpen('${o.id}',${Math.max(0,o.steps.findIndex(s=>!s.done))})">Open</button></td></tr>`).join(''):'<tr><td colspan="5" class="muted small">Nothing ordered yet.</td></tr>'}</tbody></table></div></section>`;
  }
  function rebuildTmp(p,R){
    const h=p.querySelector('h3');if(h)h.textContent='Treatment Management Plan';
    const sub=p.querySelector('.psy-tx-head .small.muted');if(sub)sub.textContent='Orders, consents and permissions for treatments, outings and restraint.';
    p.querySelectorAll('.rq9').forEach(e=>e.remove());const body=p.querySelector('.psy-tx-body');if(body)body.innerHTML=tmpBody();
    const tab=[...R.querySelectorAll('.psy-tx-tab')].find(t=>/Requests and permissions/.test(t.textContent));if(tab)tab.textContent='Treatment Management Plan';
    /* the Consents tab is part of this tab now */
    const ct=[...R.querySelectorAll('.psy-tx-tab')].find(t=>/^Consents/.test(t.textContent.trim())),cp=[...R.querySelectorAll('.psy-tx-panel')].find(q=>/^Consents/.test(((q.querySelector('h3')||{}).textContent||'').trim()));
    if(cp&&body){const cb=cp.querySelector('.psy-tx-body');if(cb)body.insertAdjacentHTML('beforeend','<div class="lbl" style="margin:16px 0 8px">Consents</div>'+cb.innerHTML);cp.remove();}
    if(ct)ct.remove();
  }

  /* ---------------- 3. Therapy Plans: four sub-tabs ---------------- */
  const TH=[['ind','Individual Therapy'],['grp','Group Therapy'],['fam','Family Sessions'],['comm','Family Communication']];
  const THCFG={
    ind:{h:['Date','Therapist','Modality','Minutes','Progress note','Next session plan'],f:['date','by','modality','mins','note','plan'],form:[['date','Date','date'],['modality','Modality',['CBT','Supportive therapy','Motivational interviewing','Relaxation training','Psychoeducation','Behavioural activation','Other']],['mins','Minutes','number'],['note','Progress note','area'],['plan','Plan for the next session','area']],d:'One-to-one sessions between the therapist and the patient.'},
    grp:{h:['Date','Group','Led by','Took part','Notes','Source'],f:['date','group','by','took','note','src'],form:[['date','Date','date'],['group','Group',['Anxiety and stress group','Relapse prevention group','Social skills group','Yoga and relaxation','Psychoeducation group','Other']],['took','Patient took part',['Attended','Attended in part','Refused','Not well enough']],['note','Notes','area']],d:'Group sessions. Sessions ticked in the psychologist daily note appear here by themselves.'},
    fam:{h:['Date','Family present','Led by','Topics discussed','Agreed actions'],f:['date','who','by','topics','actions'],form:[['date','Date','date'],['who','Family members present','text'],['by','Led by',['Psychologist','Psychiatrist','Psychologist and psychiatrist']],['topics','Topics discussed','area'],['actions','Agreed actions','area']],d:'Sessions between the family and the therapist or psychiatrist.'},
    comm:{h:['Date and time','Type','With','Minutes','Notes','Logged by'],f:['date','type','who','mins','note','by'],form:[['date','Date','date'],['type','Type',['Patient and family call (Tulasi phone)','Treating team and family call','Message to the family','In-person visit']],['who','With','text'],['mins','Minutes','number'],['note','Notes','area']],d:'Every contact between the patient and the family, and between the treating team and the family.'}
  };
  const thData=()=>{const x=px();if(!x.th)x.th=(S.pid&&S.pid!=='neel')?{ind:[],grp:[],fam:[],comm:[]}:{
    ind:[{date:'23 Oct 2026',by:'Priya Nair',modality:'CBT',mins:'45',note:'Worked on sleep routine and early warning signs.',plan:'Review the sleep diary.'},{date:'20 Oct 2026',by:'Priya Nair',modality:'Supportive therapy',mins:'40',note:'Settling in, anxious about discharge.',plan:'Introduce relaxation.'}],
    grp:[{date:'22 Oct 2026',group:'Relapse prevention group',by:'Priya Nair',took:'Attended',note:'Spoke about triggers.',src:'Daily note'},{date:'19 Oct 2026',group:'Yoga and relaxation',by:'Activity team',took:'Attended',note:'',src:'Daily note'}],
    fam:[{date:'21 Oct 2026',who:'Ananya Bose (sister)',by:'Psychologist and psychiatrist',topics:'Illness, medicine supervision, relapse signs.',actions:'Sister to supervise lithium.'}],
    comm:[{date:'23 Oct 2026, 6:10 pm',type:'Patient and family call (Tulasi phone)',who:'Ananya Bose (sister)',mins:'8',note:'Patient calm, asked about home.',by:'Priya Nair'},{date:'19 Oct 2026, 11:00 am',type:'Treating team and family call',who:'Ananya Bose (sister)',mins:'6',note:'24-hour call.',by:'Dr. Aanya Sharma'}]};return x.th;};
  /* the lead psychologist's Today reads each patient's family contact log without opening the Therapy tab first */
  window.psyThSeed=function(pid){const keep=S.pid;try{S.pid=pid;return thData();}finally{S.pid=keep;}};
  /* An earlier version copied Neel's therapy log into every patient who was opened, and that copy was saved. Clear it, once, for everyone except Neel. */
  const NEELSIG={ind:e=>/^Worked on sleep routine|^Settling in, anxious about discharge/.test(e.note||''),grp:e=>(e.group==='Relapse prevention group'&&e.note==='Spoke about triggers.')||(e.group==='Yoga and relaxation'&&e.by==='Activity team'&&e.date==='19 Oct 2026'),fam:e=>e.who==='Ananya Bose (sister)',comm:e=>e.who==='Ananya Bose (sister)'};
  const thClean=()=>{try{(typeof allPts==='function'?allPts():PTS).forEach(p=>{if(p.id==='neel')return;const x=psyPx(p.id),th=x&&x.th;if(!th)return;['ind','grp','fam','comm'].forEach(k=>{if(Array.isArray(th[k])&&th[k].some(NEELSIG[k]))th[k]=th[k].filter(e=>!NEELSIG[k](e));});});}catch(e){}};
  const __r54c=render;render=function(){thClean();return __r54c.apply(this,arguments);};
  const canEdit=k=>S.role==='psychologist'||(S.role==='psychiatrist'&&(k==='fam'||k==='comm'));
  window.psyThTab=function(k){S.thTab=k;render();};
  window.psyThAdd=function(k){
    const c=THCFG[k],fld=([id,l,ty])=>`<label class="field"><span class="lbl">${l}</span>${Array.isArray(ty)?`<select class="input" id="th9_${id}">${ty.map(o=>`<option>${hesc(o)}</option>`).join('')}</select>`:ty==='area'?`<textarea class="input" id="th9_${id}" rows="3"></textarea>`:`<input class="input" id="th9_${id}" type="${ty==='date'?'date':ty==='number'?'number':'text'}" ${ty==='date'?'value="'+new Date().toISOString().slice(0,10)+'"':''}>`}</label>`;
    V3.modal('Add · '+hesc((TH.find(t=>t[0]===k)||[])[1]),hesc(c.d),c.form.map(fld).join(''),`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyThSave('${k}')">Save</button>`);
  };
  window.psyThSave=function(k){
    const c=THCFG[k],e={by:signer()};
    c.form.forEach(([id,,ty])=>{const el=$('th9_'+id);let v=el?String(el.value||'').trim():'';if(ty==='date'&&v)v=new Date(v+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});e[id]=v;});
    if(k==='comm'||k==='grp')e.src=k==='grp'?'Added here':undefined;
    thData()[k].unshift(e);closeModal();render();toast('Saved by '+signer());
  };
  function therapyPage(){
    const k=S.thTab||'ind',c=THCFG[k],D=thData()[k];
    return `<section class="card"><div class="hd"><div><h3>Therapy Plans</h3><div class="small muted" style="margin-top:4px">${hesc(c.d)}</div></div>${canEdit(k)?`<button class="btn pri sm" onclick="psyThAdd('${k}')">+ Add</button>`:''}</div>
      <div style="padding:0 16px 16px"><div class="th9-tabs" role="tablist">${TH.map(([id,l])=>`<button role="tab" aria-selected="${id===k}" class="${id===k?'on':''}" onclick="psyThTab('${id}')">${l}</button>`).join('')}</div>
      <div class="scroll"><table class="t"><thead><tr>${c.h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${D.length?D.map(r=>`<tr>${c.f.map(f=>`<td>${hesc(r[f]||'')}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${c.h.length}" class="muted small">Nothing logged yet.</td></tr>`}</tbody></table></div></div></section>`;
  }
  window.psyTherapyPage=therapyPage;
  window.psyVmRebuild=rebuildVitals;window.psyThAuto=function(pid){const keep=S.pid;S.pid=pid;try{thData().grp.unshift({date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),group:'Group therapy',by:signer(),took:'Attended',note:'',src:'Daily note'});}finally{S.pid=keep;}};window.psyTmpOrders=()=>({list:orders(),defs:TMP,done:doneN});
  const __pTh=pTherapy;
  pTherapy=function(){return psy()?therapyPage():__pTh.apply(this,arguments);};

  /* ---------------- 4. Management Plan tab ---------------- */
  const MP=[['dx','Diagnosis'],['goals','Goals of treatment'],['meds','Medicines and why'],['therapy','Therapies planned'],['risk','Risk management'],['mon','Monitoring'],['stay','Expected length of stay'],['dc','Plan for discharge'],['rev','Review date']];
  window.psyMpSet=function(k,v){const m=px().mgmt=px().mgmt||{};m[k]=v;};
  window.psyMpSign=function(){const m=px().mgmt=px().mgmt||{};if(!m.dx||!m.goals){toast('Fill in the diagnosis and goals first');return;}m.signed={by:signer(),at:atNow()};render();toast('Management plan signed by '+signer());};
  window.psyMpAdd=function(){const m=px().mgmt||{};const t=prompt?'':'';V3.modal('Add addendum','The signed plan does not change. The addendum shows your name and time under it.','<textarea class="input" id="mp9_a" rows="3"></textarea>','<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyMpAddSave()">Save addendum</button>');};
  window.psyMpAddSave=function(){const v=(($('mp9_a')||{}).value||'').trim();if(!v)return;const m=px().mgmt;(m.add=m.add||[]).push({by:signer(),at:atNow(),t:v});closeModal();render();};
  const __pPlans=pPlans;
  pPlans=function(){
    if(!psy())return __pPlans.apply(this,arguments);
    const m=px().mgmt||{},ro=!!m.signed;
    return `<section class="card"><div class="hd"><div><h3>Management Plan</h3><div class="small muted" style="margin-top:4px">The psychiatrist's plan for this stay. The psychologist has a separate plan.</div></div>${ro?`<button class="btn sm" onclick="psyMpAdd()">Add addendum</button>`:''}</div>
      <div style="padding:0 20px 20px;display:flex;flex-direction:column;gap:14px">${MP.map(([k,l])=>`<label class="field"><span class="lbl" style="font-weight:700">${l}</span>${k==='rev'?`<input class="input" type="date" ${ro?'disabled':''} value="${hesc(m[k]||'')}" onchange="psyMpSet('${k}',this.value)">`:`<textarea class="input" rows="2" ${ro?'readonly':''} oninput="psyMpSet('${k}',this.value)">${hesc(m[k]||'')}</textarea>`}</label>`).join('')}
      ${ro?`<div class="callout grey small">Signed by ${hesc(m.signed.by)}, ${hesc(m.signed.at)}. Locked. Corrections go in as an addendum.</div>${(m.add||[]).map(a=>`<div class="small" style="padding:8px 10px;background:#f3f7ff;border-radius:8px"><b>Addendum by ${hesc(a.by)}, ${hesc(a.at)}:</b> ${hesc(a.t)}</div>`).join('')}`:`<div class="row" style="justify-content:flex-end"><button class="btn pri" onclick="psyMpSign()">Sign the plan</button></div>`}</div></section>`;
  };

  /* ---------------- wrappers on the patient page ---------------- */
  const __vp=vPatient;
  vPatient=function(sub){
    if(psy())fixStay();
    let h=__vp.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    /* the Discharge summary tab looks like the other tabs (white, with an icon) */
    h=h.replace('aria-label="Open discharge summary">Discharge summary</button>','aria-label="Open discharge summary"><span class="sti"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg></span>Discharge summary</button>');
    const t=tpl(h),R=t.content;let ch=false;
    R.querySelectorAll('.psy-tx-panel').forEach(p=>{
      const tt=((p.querySelector('h3')||{}).textContent||'').trim();
      if(/^Vitals and monitoring/.test(tt)){rebuildVitals(p);ch=true;}
      else if(tt==='Requests and permissions'||tt==='Treatment Management Plan'){rebuildTmp(p,R);ch=true;}
    });
    return ch?t.innerHTML:h;
  };

  /* Daily notes page: no "Daily notes" title inside the card; the progress ("0 of 8 done") sits on the left */
  const __vn=vNotes;
  vNotes=function(){
    const h=__vn.apply(this,arguments);if(!psy()||typeof h!=='string')return h;
    return h.replace('<div><div class="row" style="gap:8px"><h3>Daily notes</h3></div></div>','').replace('<div class="row" style="gap:8px"><h3>Daily notes</h3></div>','').replace(/(class="eodhd" style="[^"]*?)justify-content:s*space-between/,'$1justify-content:flex-start');
  };

  /* ---------------- 5. Admission: Form C in step 1; history form full screen ---------------- */
  const __pa=pAdmission;
  pAdmission=function(){
    const who=psy()||S.role==='psychologist';
    if(who&&S.hview==='form'&&!S.__fsAuto){S.__fsAuto=1;S.admFull=true;}
    let h=__pa.apply(this,arguments);if(!who||typeof h!=='string')return h;
    const t=tpl(h),R=t.content;let ch=false;
    R.querySelectorAll('.hnav button').forEach(b=>{const n=((b.querySelectorAll('span')[1]||{}).textContent||'').trim();if(n){b.setAttribute('data-t',n);b.setAttribute('title',n);ch=true;}});
    const tb=R.querySelector('#consentCard tbody');
    if(psy()&&tb&&!tb.querySelector('[data-formc]')){
      const c=(px().consent||{})['form-c'],st=c?(c.st==='uploaded'?'Uploaded '+c.at+(c.file?' · '+c.file:''):'Signed '+c.at):'Not signed';
      tb.insertAdjacentHTML('beforeend',`<tr data-formc="1"><td style="font-weight:600">Form C · independent admission (Mental Healthcare Act)</td><td><span class="cs ${c?'':'due'}">${hesc(st)}</span></td><td><div class="ct-a"><label class="btn sm" style="cursor:pointer">Upload signed copy<input type="file" hidden onchange="psyConsentUpload('form-c',this)"></label></div></td></tr>`);ch=true;
    }
    return ch?t.innerHTML:h;
  };
})();
