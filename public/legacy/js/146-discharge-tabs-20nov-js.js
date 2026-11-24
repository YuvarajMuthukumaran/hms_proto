/* 20 Nov 2026, meeting with Dr. Anu and Nikita (recording 20 Nov). Discharge.
   Psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist (Discharge tab), nurse (Vitals and medicines tab, own item only).
   1. The Discharge tab has two tabs:
      - Discharge summary: discharge type, then three columns side by side (summary with admitting and discharge diagnosis,
        therapy plan after discharge, medications at discharge), the discharge plan from the management plan, a grievance count,
        and Download PDF. The PDF stacks the three parts and fills role, treating team and dates by itself (not shown on screen).
      - Discharge checklist: one checklist split by role. Each role ticks only its own items; everyone sees all of them, with who and when.
          Psychiatrist: capacity assessment, medication review, discharge diagnosis finalised
          Nurse: medicines explained to the family
          Psychologist: family counselled, early warning signs discussed, family briefed
          Patient Experience Lead: feedback collected from the patient and family, importance of follow-up explained
        Then discharge readiness, the remaining sign-off items and Review, confirm and sign (unchanged rules for signing).
   2. Discharge type is a drop-down: Discharge on medical grounds, Discharge on request, Discharge against medical advice (DAMA),
      Left against medical advice (LAMA). Only the psychiatrist changes it.
   3. The expected discharge date is shown once (patient header), not again on this tab.
   4. Grievances: only a count here; logging stays in Patient Experience.
   5. Psychologist: Medications at discharge shows the medicine names only (families ask; a screenshot can be sent as it is).
   6. Readiness: the follow-up call dates ("booked on sign") are not listed; the OPD and call centre book them.
   7. Psychologist, Patient Experience > Grievances: a summary (counts) and one Log grievance button instead of the source tiles and lists.
   Saved: role ticks in the patient record (events, key dcRole: every clinical login and the nurse may write it). The psychiatrist's
   capacity tick is the same as the old "Capacity status recorded"; the psychologist's "Family briefed" also ticks the old "Family briefed"
   (written when a psychiatrist next opens the tab). The Patient Experience Lead's two items are read from the Patient Experience portal
   (px_state key px_dc_<patient id>) when the shared store is on. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const DOC=/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE),PSG=/^(psychologist|floor-lead-psychologist)$/.test(ROLE),NUR=ROLE==='nurse';
  if(!DOC&&!PSG&&!NUR)return;
  try{if(Array.isArray(PT_KEYS)&&PT_KEYS.indexOf('dcRole')<0)PT_KEYS.push('dcRole');}catch(e){}
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const ctx=pid=>{try{return ptCtxOf(pid)||{};}catch(e){return {};}};
  const pt=pid=>{try{return ptFind(pid)||{};}catch(e){return {};}};
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||''}:{pid:'',sub:''};};
  const DAY=864e5,iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
  /* 23 Nov second meeting: the summary headings as written in the agreed format. Display only: the text is still saved under
     the old label (psyx.dcs[old label]), so saved summaries keep loading. Psychiatrist and floor lead psychiatrist. */
  const DCH={'Admitting diagnosis (provisional)':'Admitting Diagnosis (Provisional)','Discharge diagnosis':'Discharge Diagnosis','History and complaints':'History and Complaints','Examination, physical and MSE':'Examination Physical and MSE','Intervention during stay (medical and psychological)':'Intervention During Stay (Medical and Psychological)','Condition at the time of discharge':'Condition at the Time of Discharge','Treatment advice on discharge':'Treatment Advice On Discharge'};
  const DCO=['Admitting diagnosis (provisional)','Discharge diagnosis','History and complaints','Allergy','Examination, physical and MSE','Intervention during stay (medical and psychological)','Condition at the time of discharge'];
  /* 24 Nov 2026 (Anu, meeting): "Treatment advice on discharge" and "Suggestions" are gone from the summary and its PDF */
  window.__dcDropped=/^(Treatment advice on discharge|Suggestions)$/i;
  const dcHead=k=>DCH[String(k||'').trim()]||String(k||'').trim();
  const dcRelabel=()=>{if(!DOC)return;document.querySelectorAll('#view label.field .lbl').forEach(l=>{const t=l.textContent.trim();if(DCH[t]&&l.closest('label.field').querySelector('textarea[data-dcs]'))l.textContent=DCH[t];});};
  const fmtD=s=>{if(!s)return '';const d=new Date(String(s).length<=10?s+'T00:00:00':s);return isNaN(d)?String(s):d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};

  const GROUPS=[
    {k:'psy',who:'Psychiatrist',items:[['capacity','Capacity assessment'],['medrev','Medication review'],['finaldx','Discharge diagnosis finalised']]},
    {k:'nurse',who:'Nurse',items:[['medfam','Medicines explained to the family']]},
    {k:'psg',who:'Psychologist',items:[['famc','Family counselled'],['ews','Early warning signs discussed'],['brief','Family briefed']]},
    {k:'px',who:'Patient Experience Lead',items:[['fb','Feedback collected from the patient and family'],['fu','Importance of follow-up explained'],['fub','Follow-ups booked']]}
  ];
  const MINE=DOC?'psy':PSG?'psg':NUR?'nurse':'';
  const TYPES=['Discharge on medical grounds','Discharge on request','Discharge against medical advice (DAMA)','Left against medical advice (LAMA)'];
  const LEGACY={'Planned':'Discharge on medical grounds','Against medical advice (LAMA)':'Left against medical advice (LAMA)'};
  const typeOf=pid=>{const t=String(ctx(pid).dtype||'');return LEGACY[t]||t;};

  /* ---------- Patient Experience Lead items (read from the PX shared store) ---------- */
  let PXC=null;const PXD={};
  fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{if(j&&j.supabase&&j.pxStore)PXC=j.supabase;}).catch(()=>{});
  function pxLoad(pid){
    if(!PXC||!pid)return;const o=PXD[pid];if(o&&Date.now()-o.t<30000)return;
    PXD[pid]={t:Date.now(),v:(o||{}).v||{}};
    fetch(PXC.url+'/rest/v1/px_state?select=data&key=eq.'+encodeURIComponent('px_dc_'+pid),{headers:{apikey:PXC.key,Authorization:'Bearer '+PXC.key,'x-tulasi-role':ROLE}})
      .then(r=>r.ok?r.json():[]).then(rows=>{let d=(rows&&rows[0]||{}).data;if(typeof d==='string'){try{d=JSON.parse(d);}catch(e){d={};}}
        const s=JSON.stringify(d||{});if(s!==JSON.stringify(PXD[pid].v)){PXD[pid].v=d||{};if(route().pid===pid)render();}}).catch(()=>{});
  }

  /* ---------- role ticks ---------- */
  const store=pid=>{const c=ctx(pid);if(!c.dcRole||typeof c.dcRole!=='object')c.dcRole={};return c.dcRole;};
  function tickOf(pid,g,k){
    if(g==='px'){const v=(PXD[pid]||{}).v||{};const t=v[k];return t&&(t.on||t===true)?{on:true,by:t.by||'Patient Experience Lead',at:t.at||''}:null;}
    const s=store(pid),t=(s[g]||{})[k];
    if(t&&t.on)return t;
    const D=ctx(pid).discharge||{},by=(ctx(pid).dcBy||S.dcBy||{});
    if(g==='psy'&&k==='capacity'&&D.capacity)return {on:true,by:(by.capacity||{}).by||'From the record',at:(by.capacity||{}).at||''};
    return null;
  }
  window.m20Tick=function(pid,g,k,on){
    if(g!==MINE){toast('Only the '+((GROUPS.find(x=>x.k===g)||{}).who||'other role')+' ticks this');render();return;}
    const s=store(pid);s[g]=Object.assign({},s[g]||{});
    s[g][k]={on:!!on,by:signer(),at:atNow()};
    store(pid)[g]=s[g];
    if(DOC&&g==='psy'&&k==='capacity'){const D=ctx(pid).discharge;if(D){D.capacity=!!on;S.dcBy=S.dcBy||{};if(on)S.dcBy.capacity={by:signer(),at:atNow()};else delete S.dcBy.capacity;}}
    try{V3.log(pid,S.role,'note','Discharge checklist: '+(((GROUPS.find(x=>x.k===g)||{}).items||[]).find(i=>i[0]===k)||['',k])[1]+(on?' ticked':' unticked')+' by '+signer());}catch(e){}
    render();
  };
  /* the psychologist's "Family briefed" also completes the old sign-off item; the doctor login writes it */
  function mirror(pid){
    if(!DOC)return;
    const D=ctx(pid).discharge;if(!D)return;
    const t=(store(pid).psg||{}).brief;
    if(t&&t.on&&!D.family){D.family=true;S.dcBy=S.dcBy||{};S.dcBy.family={by:t.by,at:t.at};}
  }
  const counts=pid=>{let n=0,m=0;GROUPS.forEach(g=>g.items.forEach(it=>{m++;if(tickOf(pid,g.k,it[0]))n++;}));return [n,m];};
  function checklistCard(pid,only){
    const [n,m]=counts(pid);
    const gs=only?GROUPS.filter(g=>g.k===only):GROUPS;
    const grp=g=>{const mine=g.k===MINE;const dn=g.items.filter(it=>tickOf(pid,g.k,it[0])).length;return `<div class="m20-cg${mine?' mine':''}" data-r="${g.k}" style="--p:${Math.round(dn/g.items.length*100)}%"><div class="m20-cgh"><b>${E(g.who)}</b><span class="m20-cnt">${dn} of ${g.items.length}</span>${mine?'<span class="m20-you">You</span>':'<span class="tiny muted">View only</span>'}</div><div class="m20-seg">${g.items.map(it=>`<i${tickOf(pid,g.k,it[0])?' class="on"':''}></i>`).join('')}</div>
      ${g.items.map(it=>{const t=tickOf(pid,g.k,it[0]);return `<label class="m20-ci${mine?'':' ro'}"><input type="checkbox" ${t?'checked':''} ${mine?`onchange="m20Tick('${Q(pid)}','${g.k}','${it[0]}',this.checked)"`:'disabled'}><span><span class="m20-cit">${E(it[1])}</span><span class="tiny muted">${t?'Done · '+E(t.by)+(t.at?', '+E(t.at):''):(g.k==='px'?'Ticked by the Patient Experience Lead in their portal':'Not done yet')}</span></span></label>`;}).join('')}</div>`;};
    return `<section class="card" id="m20Role"><div class="hd"><div><h3>Discharge checklist</h3><div class="small muted" style="margin-top:4px">${only?'Your item for this discharge. The other roles tick theirs on their own screens.':'Each role ticks only its own items. Everyone sees all of them, with who and when.'}</div></div><span class="chip ${n===m?'c-green':'c-grey'}">${n} of ${m} done</span></div>
      <div class="pad m20-cgrid">${gs.map(grp).join('')}</div></section>`;
  }

  /* ---------- discharge type ---------- */
  window.m20Type=function(pid,v){if(!DOC)return;const c=ctx(pid);c.dtype=v;if(pid===S.pid)S.dtype=v;render();};
  window.m20Lama=function(pid,k,v){if(!DOC)return;const x=px(pid);x.lama=x.lama||{};x.lama[k]=v;};
  function typeCard(pid){
    const cur=typeOf(pid),opts=TYPES.slice();if(cur&&opts.indexOf(cur)<0)opts.push(cur);
    const ama=/against medical advice/i.test(cur),l=px(pid).lama||{};
    return `<section class="card" id="m20Type"><div class="pad m20-type"><label class="field" style="margin:0;max-width:440px;flex:1 1 320px"><span class="lbl">Discharge type</span>
      <select class="input" ${DOC?`onchange="m20Type('${Q(pid)}',this.value)"`:'disabled'}><option value="" ${cur?'':'selected'}>Choose…</option>${opts.map(o=>`<option ${o===cur?'selected':''}>${E(o)}</option>`).join('')}</select></label>
      ${DOC?'':'<span class="tiny muted">Set by the psychiatrist</span>'}</div>
      ${ama?`<div class="pad" style="padding-top:0"><div class="callout amber" style="display:flex;flex-direction:column;gap:8px"><strong>Discharge against medical advice</strong><span class="tiny">The doctor confirms the patient declines the proposed treatment and has been told the risks and alternatives clearly. The LAMA consent is signed at the front desk.</span>
        <div class="m20-3"><label class="field"><span class="lbl">State of mental health</span><textarea class="input" style="min-height:52px" ${DOC?`oninput="m20Lama('${Q(pid)}','state',this.value)"`:'disabled'}>${E(l.state||'')}</textarea></label>
        <label class="field"><span class="lbl">Treatment proposed by the doctor</span><textarea class="input" style="min-height:52px" ${DOC?`oninput="m20Lama('${Q(pid)}','prop',this.value)"`:'disabled'}>${E(l.prop||'')}</textarea></label>
        <label class="field"><span class="lbl">Risks of leaving early, explained</span><textarea class="input" style="min-height:52px" ${DOC?`oninput="m20Lama('${Q(pid)}','risk',this.value)"`:'disabled'}>${E(l.risk||'')}</textarea></label></div></div></div>`:''}</section>`;
  }

  /* ---------- medications at discharge ---------- */
  const FREQ=['Once a day (morning)','Once a day (night)','Twice a day','Three times a day','At bedtime','Only when needed (SOS)','Once a week','Every 2 weeks','Monthly (injection)'];
  const FOOD=['Before food','After food','With food','Empty stomach','Any time'];
  const dcrx=pid=>{const x=px(pid);return x.dcrx=x.dcrx||{rows:{},extra:[],fu:'',fuOver:false,th:{mod:'',freq:'',fu:'',fuOver:false}};};
  const daysTxt=(a,b)=>{if(!a||!b)return '';const n=Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/DAY);return n>=0?n+(n===1?' day':' days'):'check dates';};
  function medRows(pid){
    const c=ctx(pid),r=px(pid).recon||{dis:{}},D=dcrx(pid),out=[];
    (c.meds||[]).forEach(m=>{if(((r.dis||{})[m.name]||{}).d==='Stop')return;out.push({key:m.name,name:m.name,s:D.rows[m.name]||{},extra:false});});
    (D.extra||[]).forEach((m,i)=>out.push({key:'x'+i,name:m.name,s:m,extra:true,i}));
    return out;
  }
  window.m20MedAdd=function(pid){
    const g=id=>{const e=document.getElementById(id);return e?e.value:'';};
    const name=g('m20N'),start=g('m20S')||iso(new Date()),end=g('m20E');
    if(!name){toast('Pick the medicine first');return;}
    if(end&&end<start){toast('End date is before the start date');return;}
    dcrx(pid).extra.push({name,freq:g('m20F'),food:g('m20Fo'),start,end,note:g('m20No')});
    if(typeof dc2Set==='function'){const D=dcrx(pid);dc2Set(pid,'x'+(D.extra.length-1),'start',start);}else render();
    toast(name+' added to the discharge prescription');
  };
  window.m20Dur=function(pid,key,v){const n=parseInt(v,10);if(!(n>=1))return;const row=(medRows(pid).find(r=>r.key===key)||{}).s||{};const st=row.start||iso(new Date());const end=iso(new Date(new Date(st+'T00:00:00').getTime()+n*DAY));if(typeof dc2Set==='function'){if(!row.start)dc2Set(pid,key,'start',st);dc2Set(pid,key,'end',end);}else render();};
  function medsCard(pid){
    const R=medRows(pid),D=dcrx(pid);
    if(!DOC||typeof dc2Set!=='function'){
      /* psychologist: the names only, so it can be read out or sent to the family as it is (meeting, 20 Nov) */
      const list=R.map((r,i)=>`<li>${E(r.name)}</li>`).join('');
      return `<section class="card m20-col" id="m20Meds"><div class="hd"><div><h3>Medications at discharge</h3><div class="small muted" style="margin-top:4px">Written by the psychiatrist.</div></div></div><div class="pad">${list?`<ol class="m20-ol">${list}</ol>`:'<div class="small muted">No discharge medicines written yet.</div>'}</div></section>`;
    }
    const sel=(k,f,opts,val,ph)=>`<select class="input" onchange="dc2Set('${Q(pid)}','${Q(k)}','${f}',this.value)"><option value="">${ph}</option>${opts.map(o=>`<option ${val===o?'selected':''}>${E(o)}</option>`).join('')}</select>`;
    const date=(k,f,val)=>`<input class="input" type="date" value="${E(val||'')}" onchange="dc2Set('${Q(pid)}','${Q(k)}','${f}',this.value)">`;
    /* 21 Nov 2026 (meeting): medicines at discharge as a table: name, frequency, with or after food, start date, duration, advice */
    const dur=(k,st,en)=>{const n=(st&&en)?Math.round((new Date(en+'T00:00:00')-new Date(st+'T00:00:00'))/DAY):'';return `<input class="input" type="number" min="1" style="width:78px" value="${n>=0?n:''}" placeholder="days" onchange="m20Dur('${Q(pid)}','${Q(k)}',this.value)">`;};
    const list=R.length?`<div class="scroll"><table class="t m20-mt"><thead><tr><th>Medicine</th><th>Frequency</th><th>With food</th><th>Start date</th><th>Duration</th><th>Advice</th><th></th></tr></thead><tbody>${R.map(r=>`<tr><td><b>${E(r.name)}</b>${r.extra?'<div class="tiny muted">New at discharge</div>':''}</td><td>${sel(r.key,'freq',FREQ,r.s.freq,'Frequency')}</td><td>${sel(r.key,'food',FOOD,r.s.food,'With food?')}</td><td>${date(r.key,'start',r.s.start)}</td><td>${dur(r.key,r.s.start,r.s.end)}<div class="tiny muted">${E(daysTxt(r.s.start,r.s.end))}</div></td><td><input class="input" placeholder="Advice" value="${E(r.s.note||'')}" oninput="dc2Note(this,'${Q(pid)}','${Q(r.key)}')"></td><td><button class="btn sm" onclick="dc2Stop('${Q(pid)}','${Q(r.key)}')">${r.extra?'Remove':'Stop'}</button></td></tr>`).join('')}</tbody></table></div>`:'';
    const drugs=(typeof DRUGS!=='undefined'?DRUGS:[]);
    return `<section class="card m20-col" id="m20Meds"><div class="hd"><div><h3>Medications at discharge</h3><div class="small muted" style="margin-top:4px">Filled from the stay. Stop a medicine that does not continue.</div></div></div>
      <div class="pad m20-stack">${list||'<div class="small muted">No medicine continues after discharge. Add one below.</div>'}
      <details class="m20-add" data-noai="1"><summary>Add medicine</summary><div class="m20-stack" style="margin-top:8px">
        <select class="input" id="m20N"><option value="">Medicine and dose…</option>${drugs.map(d=>`<option>${E(d)}</option>`).join('')}</select>
        <div class="m20-g2"><select class="input" id="m20F"><option value="">Frequency</option>${FREQ.map(f=>`<option>${f}</option>`).join('')}</select><select class="input" id="m20Fo"><option value="">With food?</option>${FOOD.map(f=>`<option>${f}</option>`).join('')}</select></div>
        <div class="m20-g2"><label class="field"><span class="tiny muted">Start</span><input class="input" type="date" id="m20S" value="${E(iso(new Date(String(ctx(pid).edd||'')&&!isNaN(new Date(ctx(pid).edd))?new Date(ctx(pid).edd+'T00:00:00'):new Date())))}"></label><label class="field"><span class="tiny muted">End</span><input class="input" type="date" id="m20E"></label></div>
        <input class="input" id="m20No" placeholder="Note or advice"><button class="btn sm pri" onclick="m20MedAdd('${Q(pid)}')">Add medicine</button></div></details>
      <div class="m20-fu"><b>Follow-up with the psychiatrist</b><label class="m20-fud"><span>Follow up with</span><input class="input" value="${E(D.fuDoc!=null?D.fuDoc:fuDocDefault(pid))}" placeholder="Dr name" onchange="dc2FuDoc('${Q(pid)}',this.value)" aria-label="Follow up with doctor"></label><input class="input" type="date" value="${E(D.fu||'')}" onchange="dc2Fu('${Q(pid)}',this.value)" aria-label="Follow-up date"><span class="tiny muted">${D.fuOver?'Set by you':'Suggested: end date of the last medicine'}</span>${D.fuOver?`<button class="btn sm" onclick="dc2FuReset('${Q(pid)}')">Use the suggestion</button>`:''}</div></div></section>`;
  }

  /* 24 Nov 2026 (Anu, meeting): follow-up names the doctor ("Follow up with Dr X"), the treating psychiatrist by default */
  const fuDocDefault=pid=>{const t=(ctx(pid).team||{}).psy||'';return t?(/^dr\.?\s/i.test(t)?t:'Dr. '+t):'';};
  const fuDocOf=pid=>{const D=dcrx(pid);return String(D.fuDoc!=null?D.fuDoc:fuDocDefault(pid)).trim();};
  window.dc2FuDoc=function(pid,v){dcrx(pid).fuDoc=String(v||'').trim();};
  /* 24 Nov 2026 (Anu, meeting): the psychiatrist fills the therapy plan like the OPD format: therapy type, how often, how long */
  const TMODS=['Individual therapy','Group therapy','Family therapy','Cognitive behavioural therapy','Supportive therapy','Psychoeducation','Relapse prevention','Motivational interviewing','Behavioural activation','Exposure and response prevention','Relaxation training'];
  const TFR=['Weekly','Every 2 weeks','Monthly','As needed'],TDUR=['1 month','3 months','6 months','Until next review'];
  window.dc2ThSet=function(pid,f,v){const D=dcrx(pid);D.th=D.th||{};if(typeof window.dcThSet==='function'&&f!=='dur')return dcThSet(pid,f,v);D.th[f]=v;render();};
  window.dc2ThFu=function(pid,v){const D=dcrx(pid);D.th=D.th||{};D.th.fu=v;D.th.fuOver=true;};
  function therapyEditCard(pid){
    const D=dcrx(pid);D.th=D.th||{};const t=D.th,rel=((px(pid).sn||{}).relapse)||null;
    const sel=(f,list,ph)=>`<select class="input" onchange="dc2ThSet('${Q(pid)}','${f}',this.value)"><option value="">${ph}</option>${list.concat(t[f]&&!list.includes(t[f])?[t[f]]:[]).map(o=>`<option ${o===t[f]?'selected':''}>${E(o)}</option>`).join('')}</select>`;
    return `<section class="card m20-col" id="m20Th"><div class="hd"><div><h3>Therapy plan after discharge</h3><div class="small muted" style="margin-top:4px">As on the OPD prescription: therapy, how often, how long.</div></div></div>
      <div class="pad m20-stack"><label class="field"><span class="lbl">Therapy type</span>${sel('mod',TMODS,'Pick a therapy')}</label>
      <div class="m20-g2"><label class="field"><span class="lbl">How often</span>${sel('freq',TFR,'Frequency')}</label><label class="field"><span class="lbl">Duration</span>${sel('dur',TDUR,'Duration')}</label></div>
      <label class="field"><span class="lbl">Follow-up with the psychologist</span><input class="input" type="date" value="${E(t.fu||'')}" onchange="dc2ThFu('${Q(pid)}',this.value)"></label>
      ${rel?`<div class="box small"><div class="lbl">Relapse prevention plan</div>${[['Triggers',rel.trig],['Early warning signs',rel.ews],['Coping plan',rel.cope],['Support contacts',rel.sup]].filter(x=>x[1]).map(x=>`<div style="margin-top:4px"><b>${x[0]}:</b> ${E(x[1])}</div>`).join('')}</div>`:''}</div></section>`;
  }
  /* ---------- therapy plan (psychiatrist sees the psychologist's plan, read only) ---------- */
  function therapyReadCard(pid){
    if(DOC)return therapyEditCard(pid);
    const t=dcrx(pid).th||{},rel=((px(pid).sn||{}).relapse)||null;
    const row=(l,v)=>`<div class="box small"><div class="lbl">${l}</div><div style="margin-top:4px">${v?E(v):'<span class="muted">Not set yet</span>'}</div></div>`;
    return `<section class="card m20-col" id="m20Th"><div class="hd"><div><h3>Therapy plan after discharge</h3><div class="small muted" style="margin-top:4px">Set by the psychologist.</div></div></div>
      <div class="pad m20-stack">${row('Therapy plan',t.mod)}${row('How often',t.freq)}${t.dur?row('Duration',t.dur):''}${row('Follow-up with the psychologist',fmtD(t.fu))}
      ${rel?`<div class="box small"><div class="lbl">Relapse prevention plan</div>${[['Triggers',rel.trig],['Early warning signs',rel.ews],['Coping plan',rel.cope],['Support contacts',rel.sup]].filter(x=>x[1]).map(x=>`<div style="margin-top:4px"><b>${x[0]}:</b> ${E(x[1])}</div>`).join('')}</div>`:''}</div></section>`;
  }

  /* ---------- grievance count ---------- */
  function grievBox(pid){
    const L=ctx(pid).pgriev||[],open=L.filter(g=>g&&g.st==='Open').length;
    return `<div class="box small m20-griev"><div><div class="lbl">Grievances this stay</div><div style="margin-top:4px"><b>${L.length}</b> logged${L.length?` · <b>${open}</b> open`:''}</div></div><button class="btn sm" onclick="go('#/patient/${Q(pid)}/prefs')">Open Patient Experience</button></div>`;
  }

  /* ---------- PDF: the three parts stacked, with role, treating team and dates ---------- */
  window.m20Pdf=function(pid){
    const p=pt(pid),c=ctx(pid),D=dcrx(pid),t=D.th||{},team=c.team||{};
    let id={};try{id=ptIdentity(p)||{};}catch(e){}
    const v=document.getElementById('view'),fields=[];
    v&&v.querySelectorAll('#m20SumCol label.field').forEach(l=>{const lb=l.querySelector('.lbl'),ta=l.querySelector('textarea');if(lb&&ta)fields.push([lb.textContent.trim(),ta.value]);});
    if(!fields.length){const s=px(pid).dcs||{};Object.keys(s).forEach(k=>fields.push([k,s[k]]));}
    const adm=p.admitted||p.admittedAt||(id.adm?iso(id.adm):'');const dd=String(c.edd||'')||iso(new Date());
    const H=s=>E(s).replace(/\n/g,'<br>');
    const meds=medRows(pid).map((r,i)=>`<tr><td>${i+1}</td><td>${E(r.name)}</td><td>${E(r.s.freq||'')}</td><td>${E(r.s.food||'')}</td><td>${E(fmtD(r.s.start))}</td><td>${E(fmtD(r.s.end))}</td><td>${E(daysTxt(r.s.start,r.s.end))}</td><td>${E(r.s.note||'')}</td></tr>`).join('');
    const ama=/against medical advice/i.test(typeOf(pid)),l=px(pid).lama||{};
    /* 23 Nov second meeting (psychiatrist, floor lead psychiatrist): the PDF follows the agreed discharge summary format
       (public/forms/discharge-summary): the format's headings, Rx (No., Drug/Medicine Name, Dose, Duration) right after
       Condition at the Time of Discharge, "Follow-up advised after N days", treating team as Role, Treating Team, Date, Day. */
    const docPart=()=>{
      /* every heading of the format, in its order: the text on screen if the summary is open, else the saved text */
      const onScr={};document.querySelectorAll('#view label.field').forEach(l=>{const lb=l.querySelector('.lbl'),ta=l.querySelector('textarea');if(lb&&ta)onScr[dcHead(lb.textContent)]=ta.value;});
      const sv=px(pid).dcs||{};
      const fF=DCO.map(k=>[dcHead(k),onScr[dcHead(k)]!==undefined?onScr[dcHead(k)]:(sv[k]||'')]),ci=fF.findIndex(f=>/^Condition at the Time of Discharge/i.test(f[0]));
      const fx=f=>`<div class="f"><b>${E(f[0])}:</b>${H(f[1]||'-')}</div>`;
      const rows=medRows(pid).map((r,i)=>`<tr><td>${i+1}</td><td>${E(r.name)}</td><td>${E([r.s.freq,r.s.food].filter(Boolean).join(', ')||'-')}</td><td>${E(daysTxt(r.s.start,r.s.end)||'Till review')}</td></tr>`).join('');
      const rx=`<div class="f"><b>Rx:</b></div>`+(rows?`<table><tr><th style="width:44px">No.</th><th>Drug/Medicine Name</th><th>Dose</th><th>Duration</th></tr>${rows}</table>`:'<div>No medicines at discharge.</div>');
      const d0=s=>s?new Date(String(s).slice(0,10)+'T00:00:00'):null,A=d0(adm),Dd=d0(dd),F=d0(D.fu);
      const fuN=F&&Dd?Math.round((F-Dd)/DAY):null,dayN=A&&Dd?Math.max(1,Math.round((Dd-A)/DAY)+1):null;
      const sum=fF.slice(0,ci+1).map(fx).join('')+rx+fF.slice(ci+1).map(fx).join('');
      return `<h2>Discharge summary</h2>${sum}
        <div class="f"><b>${fuN!=null&&fuN>=0?'Follow-up advised after '+fuN+(fuN===1?' day':' days')+' ('+E(fmtD(D.fu))+')'+(fuDocOf(pid)?' with '+E(fuDocOf(pid)):'')+'.':'Follow-up: date not set yet.'}</b></div>
        <h2>Therapy plan after discharge</h2><table><tr><th>Therapy plan</th><td>${E(t.mod||'-')}</td><th>How often</th><td>${E(t.freq||'-')}</td></tr><tr><th>Duration</th><td>${E(t.dur||'-')}</td><th>Follow-up with the psychologist</th><td>${E(fmtD(t.fu)||'-')}</td></tr></table>
        <h2>Treating team</h2><table><tr><th>Role</th><th>Treating Team</th><th>Date</th><th>Day</th></tr>
        <tr><td>Psychiatrist</td><td>${E(team.psy||'-')}</td><td>${E(fmtD(dd))}</td><td>${dayN?'Day '+dayN:'-'}</td></tr>
        <tr><td>Psychologist</td><td>${E(team.psych||'-')}</td><td>${E(fmtD(dd))}</td><td>${dayN?'Day '+dayN:'-'}</td></tr></table>`;
    };
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Discharge summary · ${E(p.name||'')}</title><style>
      body{font:13px/1.45 Arial,Helvetica,sans-serif;color:#111;margin:28px}h1{font-size:19px;margin:0}h2{font-size:14px;margin:18px 0 6px;border-bottom:1px solid #999;padding-bottom:3px}
      table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:5px 7px;text-align:left;vertical-align:top}th{background:#f2f2f2}
      .hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px}.f{margin:6px 0}.f b{display:block}
      .sig{display:flex;justify-content:space-between;margin-top:40px}.sig div{width:45%;border-top:1px solid #111;padding-top:4px}@media print{body{margin:12mm}}</style></head><body>
      <div class="hdr"><div><h1>Tulasi Healthcare</h1><div>Discharge summary</div></div><div style="text-align:right">${E(fmtD(new Date().toISOString().slice(0,10)))}</div></div>
      <table><tr><th>Patient</th><td>${E(p.name||'')}${id.age?' · '+E(id.age)+'/'+E(id.sex||''):''}</td><th>UHID</th><td>${E(p.uhid||id.uhid||'')}</td></tr>
      <tr><th>Admission date</th><td>${E(fmtD(adm))}</td><th>Discharge date</th><td>${E(fmtD(dd))}</td></tr>
      <tr><th>Discharge type</th><td>${E(typeOf(pid)||'Not set')}</td><th>Room</th><td>${E(String(p.room||'').replace(/^Room\s*/i,''))}</td></tr></table>
      ${ama?`<h2>Discharge against medical advice</h2>${[['State of mental health',l.state],['Treatment proposed',l.prop],['Risks explained',l.risk]].map(x=>`<div class="f"><b>${x[0]}</b>${H(x[1]||'-')}</div>`).join('')}`:''}
      ${DOC?docPart():`<h2>Summary</h2>${fields.length?fields.map(f=>`<div class="f"><b>${E(f[0])}</b>${H(f[1]||'-')}</div>`).join(''):'<div>Summary not drafted yet.</div>'}
      <h2>Therapy plan after discharge</h2><table><tr><th>Therapy plan</th><td>${E(t.mod||'-')}</td><th>How often</th><td>${E(t.freq||'-')}</td></tr><tr><th>Duration</th><td>${E(t.dur||'-')}</td><th>Follow-up with the psychologist</th><td>${E(fmtD(t.fu)||'-')}</td></tr></table>
      <h2>Medications at discharge</h2>${meds?`<table><tr><th>No.</th><th>Medicine and dose</th><th>Frequency</th><th>Food</th><th>Start</th><th>End</th><th>Duration</th><th>Note</th></tr>${meds}</table>`:'<div>No medicines at discharge.</div>'}
      <div class="f"><b>Follow-up with the psychiatrist</b>${E(fmtD(D.fu)||'-')}</div>
      <h2>Treating team</h2><table><tr><th>Role</th><th>Treating team</th><th>From</th><th>To</th></tr>
      <tr><td>Psychiatrist</td><td>${E(team.psy||'')}</td><td>${E(fmtD(adm))}</td><td>${E(fmtD(dd))}</td></tr>
      <tr><td>Psychologist</td><td>${E(team.psych||'')}</td><td>${E(fmtD(adm))}</td><td>${E(fmtD(dd))}</td></tr></table>`}
      <div class="sig"><div>Signature of the psychiatrist<br>${E(team.psy||'')}</div><div>Signature of the patient or relative<br>Name and relation</div></div>
      <script>window.onload=function(){setTimeout(function(){window.print();},200);};<\/script></body></html>`;
    const w=window.open('','_blank');
    if(!w){toast('Allow pop-ups for this site to download the PDF');return;}
    w.document.open();w.document.write(html);w.document.close();
  };

  /* ---------- styles ---------- */
  const css=document.createElement('style');css.id='m20-dc-css';
  css.textContent=
    '.m20-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 14px}'+
    '.m20-tab{border:1px solid #d0d5dd;background:#fff;border-radius:99px;padding:8px 16px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;min-height:38px}'+
    '.m20-tab.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}.m20-tab .m20-n{font-weight:600;opacity:.8;margin-left:6px;font-size:12.5px}'+
    '.m20-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.1fr);gap:14px;align-items:start;margin-bottom:14px}'+
    '.m20-grid>#m20Meds{grid-column:2;grid-row:1}.m20-grid>#m20SumCol{grid-column:1;grid-row:1}.m20-grid>.m20-col:not(#m20Meds){grid-column:1/-1;grid-row:2}.m20-mt td,.m20-mt th{vertical-align:top;padding:6px 8px}.m20-mt{min-width:820px}.m20-mt .input{min-height:34px;font-size:13px}.m20-mt select.input{min-width:118px}.m20-mt input[type=date]{min-width:128px}@media(max-width:900px){.m20-grid{grid-template-columns:1fr}.m20-grid>*{grid-column:1!important;grid-row:auto!important}}'+
    '.m20-grid>section.card{margin:0!important;min-width:0}'+
    '.m20-grid section.card.wide{grid-column:auto!important;width:auto!important}'+
    '.m20-stack{display:flex;flex-direction:column;gap:10px}'+
    '.m20-med{border:1px solid #e1e9f4;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:6px}'+
    '.m20-g2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px}.m20-g2 .field{margin:0}'+
    '.m20-med .input,.m20-add .input{min-height:34px}'+
    '.m20-add summary{cursor:pointer;font-weight:700;color:#175cd3}'+
    '.m20-fu{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line-2);padding-top:10px}'+
    '.m20-fud{display:flex;align-items:center;gap:8px}.m20-fud span{font-size:13px;color:#344054;white-space:nowrap}'+
    '.m20-type{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap}'+
    '.m20-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}'+
    '.m20-griev{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}'+
    '.m20-cgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}'+
    '.m20-cg{border:1px solid #e1e9f4;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;background:#fff}'+
    '.m20-cg.mine{border-color:#9ec0f7;background:#f5f9ff}'+
    '.m20-cgh{display:flex;justify-content:space-between;align-items:center;gap:8px}'+
    '.m20-you{font-size:11.5px;font-weight:700;color:#175cd3;background:#e7f0ff;border-radius:99px;padding:2px 8px}'+
    '.m20-ci{display:flex;gap:9px;align-items:flex-start;cursor:pointer}.m20-ci.ro{cursor:default}'+
    '.m20-ci input{width:17px;height:17px;margin-top:2px;accent-color:#1e6cdb;flex:0 0 auto}'+
    '.m20-ci>span{display:flex;flex-direction:column}.m20-cit{font-weight:600;font-size:13.5px}'+
    '.m20-hide{display:none!important}'+
    '.m20-ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:14px}'+
    '.m20-gs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.m20-gs .box b{font-size:20px;display:block;margin-top:2px}'+
    '@media(max-width:900px){.m20-gs{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
    '@media(max-width:1100px){.m20-cgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
    '@media(max-width:700px){.m20-cgrid,.m20-3{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  let TAB='sum';
  window.m20DcTab=function(t){TAB=t;render();};
  /* 21 Nov: the checklist count for the "Discharge checklist" patient tab (block 168) */
  window.m20DcCount=function(pid){try{mirror(pid);pxLoad(pid);return counts(pid);}catch(e){return null;}};

  /* ---------- the Discharge tab ---------- */
  function paintDischarge(pid){
    const v=document.getElementById('view');if(!v||v.querySelector('#m20Dc'))return;
    const plan=v.querySelector('#dcPlan');if(!plan)return;
    mirror(pid);pxLoad(pid);
    const cards=[...v.querySelectorAll('section.card')];
    const h3=s=>((s.querySelector('.hd h3')||{}).textContent||'').trim();
    const sum=cards.find(s=>/Discharge summary$/.test(h3(s))&&s.classList.contains('wide'));
    const chk=cards.find(s=>/Discharge checklist$/.test(h3(s)));
    const rev=cards.find(s=>/Review, confirm and sign$/.test(h3(s)));
    const rdy=v.querySelector('#dcAuto'),th=v.querySelector('#dcTh'),rx=v.querySelector('#dcRx');
    const edd=cards.find(s=>s.classList.contains('pad')&&/^Expected discharge/.test((s.textContent||'').trim()));
    const split=(sum&&sum.parentElement&&sum.parentElement.classList.contains('split'))?sum.parentElement:null;

    /* 3. the expected date only once (header) */
    if(edd)edd.remove();
    [...plan.querySelectorAll('.box')].forEach(b=>{const l=b.querySelector('.lbl');if(l&&/^Expected discharge$/.test(l.textContent.trim()))b.remove();});
    const pg=plan.querySelector('.grid2');if(pg&&!pg.children.length)pg.innerHTML='<div class="box small"><div class="muted">No discharge plan written in the management plan yet.</div></div>';
    /* old checklist: discharge type moves to the summary tab; capacity is the psychiatrist's role item */
    if(chk){
      chk.querySelectorAll('label.field').forEach(f=>{if(/Discharge type/.test(f.textContent))f.remove();});
      chk.querySelectorAll('.callout.amber').forEach(c=>{if(/Self discharge/.test(c.textContent))c.remove();});
      chk.querySelectorAll('label.check').forEach(l=>{if(/Capacity status recorded/.test(l.textContent))l.classList.add('m20-hide');});
      const t=chk.querySelector('.hd h3');if(t&&!t.dataset.m20){t.dataset.m20='1';const n=t.querySelector('.pg-stepn');t.innerHTML='';if(n){n.textContent='1';t.appendChild(n);}t.appendChild(document.createTextNode('Other items before signing'));}
    }
    /* readiness: the follow-up call dates are booked by the OPD and the call centre, so the list of dates is not shown here
       ("Follow-ups booked" stays as an item) */
    if(rdy)rdy.querySelectorAll('.dcr-box').forEach(b=>{const h=b.querySelector('.dcr-bh');if(h&&/^Follow-ups/i.test(h.textContent.trim()))b.classList.add('m20-hide');});
    if(rev){rev.querySelectorAll('label.check').forEach(l=>{if(/^\s*Family briefed/.test(l.textContent))l.classList.add('m20-hide');});const n=rev.querySelector('.pg-stepn');if(n)n.textContent='2';}
    /* summary card: the treating team table and the Rx pointer are for the PDF only */
    if(sum){
      const n=sum.querySelector('.pg-stepn');if(n)n.remove();
      sum.querySelectorAll('.lbl').forEach(l=>{const t=l.textContent.trim();
        if(t==='Treating team'){l.classList.add('m20-hide');const nx=l.nextElementSibling;if(nx&&nx.tagName==='TABLE')nx.classList.add('m20-hide');}
        if(/^Rx[:(]/.test(t)){l.classList.add('m20-hide');const nx=l.nextElementSibling;if(nx&&(nx.classList.contains('scroll')||nx.tagName==='TABLE'))nx.classList.add('m20-hide');}});
    }

    const mk=h=>{const t=document.createElement('div');t.innerHTML=h;return t.firstElementChild;};
    const wrap=document.createElement('div');wrap.id='m20Dc';
    const [n,m]=counts(pid);
    wrap.innerHTML=`<div class="m20-tabs" role="tablist"><button class="m20-tab ${TAB==='sum'?'on':''}" role="tab" aria-selected="${TAB==='sum'}" onclick="m20DcTab('sum')">Discharge summary</button><button class="m20-tab ${TAB==='chk'?'on':''}" role="tab" aria-selected="${TAB==='chk'}" onclick="m20DcTab('chk')">Discharge checklist<span class="m20-n">${n}/${m}</span></button></div><div id="m20SumT"></div><div id="m20ChkT"></div>`;
    plan.before(wrap);
    const S1=wrap.querySelector('#m20SumT'),S2=wrap.querySelector('#m20ChkT');
    /* Discharge summary tab */
    S1.appendChild(mk(typeCard(pid)));
    const grid=document.createElement('div');grid.className='m20-grid';
    const col1=document.createElement('div');col1.id='m20SumCol';col1.className='m20-stack';
    if(sum)col1.appendChild(sum);
    col1.insertAdjacentHTML('beforeend',grievBox(pid));
    grid.appendChild(col1);
    if(th){th.classList.add('m20-col');grid.appendChild(th);}else grid.appendChild(mk(therapyReadCard(pid)));
    grid.appendChild(mk(medsCard(pid)));
    if(rx)rx.remove();
    S1.appendChild(grid);
    S1.appendChild(plan);
    S1.insertAdjacentHTML('beforeend',`<div class="row" style="justify-content:flex-end;margin:4px 0 14px"><button class="btn pri" onclick="m20Pdf('${Q(pid)}')">Download PDF</button></div>`);
    /* Discharge checklist tab */
    S2.appendChild(mk(checklistCard(pid)));
    [rdy,chk,rev].forEach(e=>{if(e)S2.appendChild(e);});
    if(split&&!split.children.length)split.remove();
    S1.style.display=TAB==='sum'?'':'none';S2.style.display=TAB==='chk'?'':'none';
  }

  /* ---------- nurse: own item on Vitals and medicines ---------- */
  function paintNurse(pid,sub){
    if(!NUR||sub!=='vitals')return;
    const v=document.getElementById('view');if(!v||v.querySelector('#m20Role'))return;
    const c=ctx(pid);if(c.discharged)return;
    const host=[...v.querySelectorAll('section.card')].pop();if(!host)return;
    const t=document.createElement('div');t.innerHTML=checklistCard(pid,'nurse');host.after(t.firstElementChild);
  }

  /* ---------- psychologist: Patient Experience > Grievances is a summary and one Log grievance button ---------- */
  window.m20LogGriev=function(){
    if(typeof window.pgModal2!=='function'){if(typeof window.pgModal==='function')pgModal();return;}
    V3.modal('Log grievance','How did it come in?',`<div class="m20-stack">
      <button class="btn" style="justify-content:flex-start" onclick="closeModal();pgModal2('family')">Family call · the family told you on a call</button>
      <button class="btn" style="justify-content:flex-start" onclick="closeModal();pgModal2('voice')">Quick voice note · speak it and it is typed</button>
      <button class="btn" style="justify-content:flex-start" onclick="closeModal();pgModal2('patient')">From the patient · in their own words</button></div>`,`<button class="btn" onclick="closeModal()">Cancel</button>`);
  };
  function paintGriev(pid){
    if(!PSG)return;
    const v=document.getElementById('view');if(!v)return;
    const card=[...v.querySelectorAll('section.card')].find(s=>/^Grievances ·/.test(((s.querySelector('.hd h3')||{}).textContent||'').trim()));
    if(!card)return;
    const L=ctx(pid).pgriev||[],open=L.filter(g=>g&&g.st==='Open').length;
    /* the two lists from the Patient Experience portal are added by other blocks, sometimes a moment later: hide them every time, keep their counts */
    const num=re=>{const s=[...v.querySelectorAll('section.card')].find(x=>re.test(((x.querySelector('.hd h3')||{}).textContent||'').trim()));if(!s)return null;const m=((s.querySelector('.hd h3')||{}).textContent||'').match(/·\s*(\d+)/);s.classList.add('m20-hide');return m?+m[1]:0;};
    const fromPx=num(/^From the Patient Experience portal/),calls=num(/^Calls logged by Patient Experience/);
    if(card.dataset.m20){const a=card.querySelector('[data-m20n="px"]'),b=card.querySelector('[data-m20n="calls"]');if(a&&fromPx!=null)a.textContent=fromPx;if(b&&calls!=null)b.textContent=calls;return;}
    card.dataset.m20='1';
    const hd=card.querySelector('.hd');
    [...card.children].forEach(c=>{if(c!==hd)c.remove();});
    const sub=hd.querySelector('.small');if(sub)sub.textContent='Logged grievances go to the Patient Experience team with a 6-hour clock; the treating psychiatrist and psychologist get an alert.';
    if(!hd.querySelector('[data-m20g]'))hd.insertAdjacentHTML('beforeend','<button class="btn sm pri" data-m20g="1" onclick="m20LogGriev()">Log grievance</button>');
    const box=(l,n,k)=>`<div class="box small"><div class="lbl">${l}</div><b${k?` data-m20n="${k}"`:''}>${n==null?0:n}</b></div>`;
    card.insertAdjacentHTML('beforeend',`<div class="pad m20-gs">${box('Logged this stay',L.length)}${box('Open',open)}${box('From the Patient Experience portal',fromPx,'px')}${box('Calls by Patient Experience',calls,'calls')}</div>`);
  }

  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{const {pid,sub}=route();if(pid){if(sub==='discharge'&&(DOC||PSG)){paintDischarge(pid);dcRelabel();setTimeout(()=>{try{dcRelabel();}catch(e){}},360);}if(sub==='prefs'){paintGriev(pid);setTimeout(()=>{try{if(route().sub==='prefs')paintGriev(route().pid);}catch(e){}},400);}paintNurse(pid,sub);}}catch(e){try{console.warn('m20 discharge',e);}catch(_){}}
    return o;
  };
})();
