/* 18 Nov 2026, Trello (Anu, 17 Nov): Discharge summary tab.
   - "Should pick up details, currently showing where the data would come from": the Draft summary boxes are filled from the stay's own records
     (diagnosis, history, allergy, examination and MSE, medicines and sessions, condition, advice, follow-up). What you type in a box is kept.
   - "this should be a drop down with medicines, frequency, note / advice, duration (end date)": a Discharge prescription card: every medicine that continues, with
     frequency, note, duration and an end date, and a medicine drop-down to add one. The follow-up date is suggested from the earliest end date and can be changed.
   - Psychologist: a Therapy plan after discharge card (the same treatment modalities as the OPD), which suggests the follow-up date; it can be changed.
   - "discharge plan ... not reflecting": a Discharge plan card shows what was saved in the management plan (plan for discharge, expected stay) and the expected date.
   Psychiatrist, floor lead psychiatrist and psychologist screens only. Everything is saved in the patient's working notes (psyx) so every login sees it. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  const doc=/^(psychiatrist|floor-lead-psychiatrist)$/.test(role),psyl=/^(psychologist|floor-lead-psychologist)$/.test(role);
  if(!doc&&!psyl)return;
  const esc=s=>hesc(String(s==null?'':s));
  const px=pid=>{try{return psyPx(pid);}catch(e){return {};}};
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/discharge/);return m?decodeURIComponent(m[1]):'';};
  const DAY=864e5,iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
  const FREQ=['Once a day (morning)','Once a day (night)','Twice a day','Three times a day','At bedtime','Only when needed (SOS)','Once a week','Every 2 weeks','Monthly (injection)'];
  const DUR=[['7 days',7],['14 days',14],['30 days',30],['60 days',60],['90 days',90],['6 months',182]];
  const MODS=['Individual therapy','Group therapy','Family therapy','Cognitive behavioural therapy','Supportive therapy','Psychoeducation','Relapse prevention','Motivational interviewing','Behavioural activation','Exposure and response prevention','Relaxation training'];
  const TFREQ=[['Weekly',7],['Every 2 weeks',14],['Monthly',30],['As needed',30]];
  const dcrx=pid=>{const x=px(pid);return x.dcrx=x.dcrx||{rows:{},extra:[],fu:'',fuOver:false,th:{mod:'',freq:'',fu:'',fuOver:false}};};
  const ctx=pid=>{try{return ptCtxOf(pid)||{};}catch(e){return {};}};
  /* reference day for durations: the expected discharge date, or today */
  const refDate=pid=>{const e=String(ctx(pid).edd||'');const d=e&&!isNaN(new Date(e))?new Date(e+'T00:00:00'):new Date();d.setHours(0,0,0,0);return d;};
  const endOf=(pid,days)=>iso(new Date(refDate(pid).getTime()+days*DAY));

  /* ---------- what continues: every stay medicine not marked Stop, plus the extras added here ---------- */
  function rxRows(pid){
    const c=ctx(pid),r=px(pid).recon||{dis:{}},out=[];
    (c.meds||[]).forEach(m=>{const d=((r.dis||{})[m.name]||{}).d;if(d==='Stop')return;out.push({key:m.name,name:m.name,sub:m.freq?(m.freq+(m.time?' · '+m.time:'')):'',extra:false});});
    dcrx(pid).extra.forEach((m,i)=>out.push({key:'x'+i,name:m.name,sub:'New at discharge',extra:true,i}));
    return out;
  }
  const rowState=(pid,k)=>{const D=dcrx(pid);if(k[0]==='x'&&/^x\d+$/.test(k))return D.extra[+k.slice(1)]||{};return D.rows[k]=D.rows[k]||{};};
  function suggestedFu(pid){
    const ends=rxRows(pid).map(r=>{const s=rowState(pid,r.key);return s.end||'';}).filter(Boolean).sort();
    return ends[0]||'';
  }
  window.dcRxSet=function(pid,k,f,v){
    const s=rowState(pid,k);s[f]=v;
    if(f==='dur'){const d=DUR.find(x=>x[0]===v);s.end=d?endOf(pid,d[1]):'';}
    const D=dcrx(pid);if(!D.fuOver)D.fu=suggestedFu(pid);
    render();
  };
  window.dcRxAdd=function(pid){
    const sel=document.getElementById('dcAddMed'),n=sel?sel.value:'';if(!n){toast('Pick the medicine first');return;}
    const D=dcrx(pid);D.extra.push({name:n,freq:'',note:'',dur:'',end:''});render();toast(n+' added to the discharge prescription');
  };
  window.dcRxDel=function(pid,i){const D=dcrx(pid);D.extra.splice(i,1);if(!D.fuOver)D.fu=suggestedFu(pid);render();};
  window.dcFuSet=function(pid,v){const D=dcrx(pid);D.fu=v;D.fuOver=true;};
  window.dcFuReset=function(pid){const D=dcrx(pid);D.fuOver=false;D.fu=suggestedFu(pid);render();};
  window.dcThSet=function(pid,f,v){
    const t=dcrx(pid).th;t[f]=v;
    if((f==='freq'||f==='mod')&&!t.fuOver){const fr=TFREQ.find(x=>x[0]===t.freq);t.fu=fr?iso(new Date(refDate(pid).getTime()+fr[1]*DAY)):'';}
    render();
  };
  window.dcThFu=function(pid,v){const t=dcrx(pid).th;t.fu=v;t.fuOver=true;};
  window.dcThReset=function(pid){const t=dcrx(pid).th;t.fuOver=false;const fr=TFREQ.find(x=>x[0]===t.freq);t.fu=fr?iso(new Date(refDate(pid).getTime()+fr[1]*DAY)):'';render();};

  function rxCard(pid){
    const D=dcrx(pid),rows=rxRows(pid);
    if(!D.fuOver&&!D.fu)D.fu=suggestedFu(pid);
    const sel=(k,f,opts,val,ph)=>`<select class="input" style="min-height:34px" onchange="dcRxSet('${esc(pid)}','${esc(k).replace(/'/g,"\\'")}','${f}',this.value)"><option value="">${ph}</option>${opts.map(o=>`<option ${val===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
    const body=rows.map(r=>{const s=rowState(pid,r.key);
      return `<tr><td><b>${esc(r.name)}</b><div class="tiny muted">${esc(r.sub)}</div></td><td>${sel(r.key,'freq',FREQ,s.freq,'Frequency')}</td>
        <td><input class="input" style="min-height:34px" placeholder="Note or advice" value="${esc(s.note||'')}" oninput="rowNote(this,'${esc(pid)}','${esc(r.key).replace(/'/g,"\\'")}')"></td>
        <td>${sel(r.key,'dur',DUR.map(d=>d[0]),s.dur,'Duration')}</td><td><input class="input" type="date" style="min-height:34px" value="${esc(s.end||'')}" onchange="dcRxSet('${esc(pid)}','${esc(r.key).replace(/'/g,"\\'")}','end',this.value)"></td>
        <td>${r.extra?`<button class="btn sm" onclick="dcRxDel('${esc(pid)}',${r.i})">Remove</button>`:''}</td></tr>`;}).join('');
    return `<section class="card" id="dcRx"><div class="hd"><div><h3>Discharge prescription</h3><div class="small muted" style="margin-top:4px">Medicines that continue after discharge, with how often, a note, how long and the end date. Stopped medicines are not listed.</div></div></div>
      <div class="scroll"><table class="t"><thead><tr><th>Medicine</th><th>Frequency</th><th>Note / advice</th><th>Duration</th><th>End date</th><th></th></tr></thead><tbody>${body||'<tr><td colspan="6" class="small muted">No medicine continues after discharge yet. Add one below, or decide Continue in the medicines check.</td></tr>'}</tbody></table></div>
      <div class="pad row" style="gap:8px;flex-wrap:wrap;align-items:center"><select class="input" id="dcAddMed" style="flex:1 1 260px;min-height:36px"><option value="">Add a medicine…</option>${(typeof DRUGS!=='undefined'?DRUGS:[]).map(d=>`<option>${esc(d)}</option>`).join('')}</select><button class="btn sm pri" onclick="dcRxAdd('${esc(pid)}')">Add</button></div>
      <div class="pad row" style="gap:10px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--line-2)"><b>Follow-up with the psychiatrist</b><input class="input" type="date" style="width:auto;min-height:36px" value="${esc(D.fu||'')}" onchange="dcFuSet('${esc(pid)}',this.value)" aria-label="Follow-up date"><span class="tiny muted">${D.fuOver?'Set by you':'Suggested from the earliest end date'}</span>${D.fuOver?`<button class="btn sm" onclick="dcFuReset('${esc(pid)}')">Use the suggestion</button>`:''}</div></section>`;
  }
  window.rowNote=function(el,pid,k){rowState(pid,k).note=el.value;};

  function therapyCard(pid){
    const t=dcrx(pid).th;
    return `<section class="card" id="dcTh"><div class="hd"><div><h3>Therapy plan after discharge</h3><div class="small muted" style="margin-top:4px">The treatment modality and how often decide the psychologist's follow-up date. You can change the date.</div></div></div>
      <div class="pad grid2"><label class="field"><span class="lbl">Therapy plan</span><select class="input" onchange="dcThSet('${esc(pid)}','mod',this.value)"><option value="">Choose a modality…</option>${MODS.map(m=>`<option ${t.mod===m?'selected':''}>${m}</option>`).join('')}</select></label>
      <label class="field"><span class="lbl">How often</span><select class="input" onchange="dcThSet('${esc(pid)}','freq',this.value)"><option value="">Choose…</option>${TFREQ.map(f=>`<option ${t.freq===f[0]?'selected':''}>${f[0]}</option>`).join('')}</select></label></div>
      <div class="pad row" style="gap:10px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--line-2)"><b>Follow-up with the psychologist</b><input class="input" type="date" style="width:auto;min-height:36px" value="${esc(t.fu||'')}" onchange="dcThFu('${esc(pid)}',this.value)" aria-label="Follow-up date"><span class="tiny muted">${t.fuOver?'Set by you':'Suggested from how often'}</span>${t.fuOver?`<button class="btn sm" onclick="dcThReset('${esc(pid)}')">Use the suggestion</button>`:''}</div></section>`;
  }

  function planCard(pid){
    const x=px(pid),mp=x.mgmt||{},mpp=x.mgmtPsych||{},edd=String(ctx(pid).edd||'');
    const lines=[];
    if(mp.dc)lines.push(['Plan for discharge (psychiatrist)',mp.dc]);
    if(mp.stay)lines.push(['Expected length of stay',mp.stay]);
    if(mpp.family)lines.push(['Family involvement (psychologist)',Array.isArray(mpp.family)?mpp.family.join(', '):mpp.family]);
    const who=mp.signed?`Management plan signed by ${esc(mp.signed.by)}, ${esc(mp.signed.at)}.`:(mp.dc?'From the management plan (not signed yet).':'');
    return `<section class="card" id="dcPlan"><div class="hd"><div><h3>Discharge plan</h3><div class="small muted" style="margin-top:4px">What was saved in the management plan, and the expected date. Change it there.</div></div><button class="btn sm" onclick="go('#/patient/${esc(pid)}/plans')">Open management plan</button></div>
      <div class="pad grid2"><div class="box small"><div class="lbl">Expected discharge</div><div style="margin-top:4px">${edd?esc(new Date(edd+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})):'<span class="muted">Not set yet. Set it on Stay summary.</span>'}</div></div>
      ${lines.map(l=>`<div class="box small"><div class="lbl">${esc(l[0])}</div><div style="margin-top:4px">${esc(l[1])}</div></div>`).join('')||'<div class="box small"><div class="muted">No discharge plan written in the management plan yet.</div></div>'}</div>${who?`<div class="pad" style="padding-top:0"><div class="callout grey small">${who}</div></div>`:''}</section>`;
  }

  /* ---------- the Draft summary boxes, filled from the record ---------- */
  const hfv=(pid,re)=>{const h=px(pid).hf||{};const k=Object.keys(h).find(x=>re.test(x));const v=k?h[k]:'';return typeof v==='string'?v.trim():(v&&v.sel?v.sel:'');};
  function mseText(pid){
    const h=px(pid).hf||{},mse=(typeof HIST!=='undefined'?HIST:[]).find(s=>s.k==='mse');if(!mse)return '';
    const parts=[];mse.f.forEach(f=>{const v=h[f[0]];let t='';
      if(Array.isArray(v))t=v.join(', ');else if(v&&typeof v==='object'){t=v.sel==='__other'?v.free:v.sel||'';}else if(typeof v==='string')t=v;
      if(t&&String(t).trim())parts.push(f[0].replace(/ \(add all that apply\)/,'')+': '+t);});
    return parts.join('; ');
  }
  function fromRecord(pid,label){
    const c=ctx(pid),x=px(pid),p=(()=>{try{return ptFind(pid);}catch(e){return {};}})()||{};
    const wk=x.wk||{},al=x.allergy,r=x.recon||{dis:{}};
    if(/^Admitting diagnosis/.test(label))return hfv(pid,/Provisional diagnosis/i)||wk.reason||'';
    if(/^Discharge diagnosis/.test(label))return c.dx||p.dx||'';
    if(/^History and complaints/.test(label)){const a=hfv(pid,/^Chief complaints/i),b=hfv(pid,/^History of present illness/i);return [a&&'Chief complaints: '+a,b&&'History of present illness: '+b].filter(Boolean).join('\n');}
    if(/^Allergy/.test(label))return !al?'Not recorded':(al.list&&al.list.length?'Drug allergy: '+al.list.map(i=>i.drug+(i.rx?' ('+i.rx+')':'')).join(', '):'No known drug allergies');
    if(/^Examination/.test(label)){const m=mseText(pid);return [wk.exam&&'Physical examination: '+wk.exam,m&&'MSE: '+m].filter(Boolean).join('\n');}
    if(/^Intervention during stay/.test(label)){
      const meds=(c.meds||[]).map(m=>m.name);const notes=((x.sn||{}).notes||[]).filter(n=>n.status==='signed');
      const k=t=>notes.filter(n=>(n.kind||'ind')===t).length;
      return [meds.length&&'Medicines: '+meds.join(', '),notes.length&&'Sessions: '+k('ind')+' individual, '+k('grp')+' group, '+k('fam')+' family (signed)'].filter(Boolean).join('\n');}
    if(/^Condition at the time/.test(label)){const dn=(c.dnHist||[])[0];return dn?('Last daily note: '+((dn.d||'')+' '+(dn.my||'')).trim()+(c.capacityDone?'. Capacity assessment done.':'')):(c.capacityDone?'Capacity assessment done.':'');}
    if(/^Treatment advice/.test(label)){const g=d=>Object.keys(r.dis||{}).filter(n=>(r.dis[n]||{}).d===d);const chg=g('Changed'),stp=g('Stop');
      const cont=g('Continue').concat(rxRows(pid).map(q=>q.name).filter(n=>!(r.dis||{})[n]||!(r.dis[n]||{}).d));
      return [cont.length&&'Continue: '+cont.join(', '),chg.length&&'Changed: '+chg.join(', '),stp.length&&'Stop: '+stp.join(', ')].filter(Boolean).join('\n');}
    if(/^Suggestions/.test(label)){const D=dcrx(pid);const a=D.fu&&'Psychiatrist follow-up on '+new Date(D.fu+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),b=D.th&&D.th.fu&&'Psychologist follow-up on '+new Date(D.th.fu+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});return [a,b].filter(Boolean).join('. ');}
    return '';
  }
  window.dcsSave=function(el,pid,label){const x=px(pid);x.dcs=x.dcs||{};x.dcs[label]=el.value;};

  function paint(){
    const pid=pidNow();if(!pid)return;
    const v=document.getElementById('view');if(!v)return;
    /* cards */
    if(!v.querySelector('#dcPlan')){
      const anchor=v.querySelector('#dcAuto')||v.querySelector('section.card');
      const mk=h=>{const t=document.createElement('div');t.innerHTML=h;return t.firstElementChild;};
      if(anchor){
        anchor.parentNode.insertBefore(mk(planCard(pid)),anchor);
        if(doc){anchor.parentNode.insertBefore(mk(rxCard(pid)),anchor);}
        if(psyl){anchor.parentNode.insertBefore(mk(therapyCard(pid)),anchor);}
      }
    }
    /* the old free-text "new medicine" row is replaced by the Discharge prescription card */
    const rd=v.querySelector('#recondis');if(rd){const f=rd.querySelector('#dsN');if(f){const row=f.closest('.pad');if(row)row.style.display='none';}}
    /* Draft summary: boxes from the record */
    v.querySelectorAll('section.card.wide').forEach(sec=>{
      const h=sec.querySelector('.hd h3');if(!h||!/^\d?\s*Discharge summary$/.test(h.textContent.trim()))return;
      sec.querySelectorAll('label.field').forEach(l=>{
        const lb=l.querySelector('.lbl'),ta=l.querySelector('textarea');if(!lb||!ta||ta.dataset.dcs)return;
        const label=lb.textContent.trim();ta.dataset.dcs='1';
        const x=px(pid),saved=(x.dcs||{})[label];
        ta.value=saved!==undefined?saved:fromRecord(pid,label);
        ta.placeholder='Nothing in the record yet. Write it here.';
        ta.style.minHeight='64px';
        ta.oninput=()=>dcsSave(ta,pid,label);
      });
      /* the made-up Rx table is replaced by the real prescription card above */
      [...sec.querySelectorAll('.lbl')].forEach(l=>{if(/^Rx \(from current orders\)/.test(l.textContent.trim())){const t=l.nextElementSibling;if(t)t.remove();l.textContent='Rx: see the Discharge prescription card above';}});
    });
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{paint();}catch(e){}return o;};
})();
