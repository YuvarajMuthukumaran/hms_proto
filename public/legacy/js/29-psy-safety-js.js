
/* Psychiatrist only (5 Nov 2026).
   Trello "Patient safety header": one strip on the patient record, Rounds and the Nursing chart: identity (age/sex, UHID, room),
   allergies (structured; amber "Allergies not recorded" until filled, red only for a drug allergy), legal status (Section 89 day x of 30,
   amber from day 25; Section 90 shows its review date), observation level (set by, review by; reviewed at least daily) and risk of harm.
   The strip is read-only; allergies are filled from the chip or from Orders, the risk level comes from the suicide screen.
   Trello "Rating scales and early warning": Scores card on Vitals and medicines: NEWS2 calculated from the vitals (band decides
   routine, inform RMO, urgent RMO review; an urgent score raises an alert into the escalation chain) and a structured suicide /
   self-harm screen whose result sets Risk of harm in the header. Trend arrows show in Rounds "Since last round".
   Trello "Lab results": Results card in Orders (test, collected, result, normal range, status Ordered / Result in / Reviewed, trend
   with the target band, upload of the lab report with the key value); abnormal unreviewed results become a "Review result" task on
   the dashboard; Reviewed is logged with name and time. One-line summary at the top of Stay summary.
   Not built: ordering scales from the Monitoring dropdown (it is shared with the nurse chart). */
(function(){
  const psy=()=>S.role==='psychiatrist';
  if(!PT_KEYS.includes('psyx'))PT_KEYS.push('psyx'); /* per-patient extras: allergies, scores, screens, observation review, uploads */
  const today=()=>new Date().toDateString();
  const pxOf=pid=>{const c=ptCtxOf(pid);c.psyx=c.psyx||{};const x=c.psyx;
    if(pid==='neel'&&!x.allergy&&!x.allergySeeded){x.allergySeeded=1;x.allergy={ndka:true,list:[],by:'Dr. Aanya Sharma',at:'18 Oct 2026, 12:30 pm'};}
    return x;};
  window.psyPx=pxOf;
  const css=document.createElement('style');css.id='psy-safety-css';
  css.textContent=`
  .sf{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .sf .c{display:inline-flex;align-items:center;gap:6px;border-radius:99px;padding:3px 11px;font-size:12px;font-weight:600;background:var(--grey-bg);color:var(--grey);border:1px solid transparent;font-family:inherit}
  .sf .c.amber{background:var(--amber-bg);color:var(--amber);border-color:var(--amber-line)}.sf .c.red{background:var(--red-bg);color:var(--red);border-color:#f3c3be}
  .sf button.c{cursor:pointer}.sf button.c:hover{filter:brightness(.97)}
  .sc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  @media (max-width:980px){.sc-grid{grid-template-columns:1fr}}
  .sc-big{font-size:30px;font-weight:700;line-height:1.1}
  .sc-f{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.sc-f label{font-size:11px;color:var(--muted);display:flex;flex-direction:column;gap:2px}
  .sc-q{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:6px 0;border-top:1px solid var(--line-2);font-size:13px}.sc-q:first-child{border-top:0}`;
  document.head.appendChild(css);

  /* ---------- safety strip ---------- */
  const sx=p=>p.sex||(PT_FILL[p.id]||[])[0]||'',ag=p=>p.age||(PT_FILL[p.id]||[])[1]||'';
  /* age first, then sex: "29 Male" (team review) */
  window.psyAgeSex=p=>{const a=ag(p),x=sx(p),f={M:'Male',F:'Female'}[x]||x;return [a,f].filter(Boolean).join(' ');};
  function legal(p,c){
    const sec=String(c.section||p.sec||'');
    if(sec==='90'){const d=new Date();d.setDate(d.getDate()+Math.max(0,90-(p.day||0)));return ['', 'Section 90 · review due '+d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})];}
    const day=p.day||0;
    return day>=25?['amber','Section '+sec+' · day '+day+' of 30. Decide by day 30: discharge or move to Section 90']:['','Section '+sec+' · day '+day+' of 30'];
  }
  window.psySafety=function(pid){
    const p=ptFind(pid);if(!p)return '';const c=ptCtxOf(pid),x=pxOf(pid),ex=EX[pid]||[];
    const al=x.allergy,lg=legal(p,c);
    /* owner, 5 Nov (team review): show an allergy only when there is one; nothing for "no known allergies" or "not recorded".
       The observation chip is gone from the header. Allergies are recorded and edited on the Admission tab. */
    let a='';
    if(al&&al.list&&al.list.length)a=`<span class="c red" title="Recorded by ${hesc(al.by)}, ${hesc(al.at)}">Drug allergy: ${al.list.map(i=>hesc(i.drug)+(i.rx?' ('+hesc(i.rx)+')':'')).join(', ')}</span>`;
    const o='';
    const lvl=x.riskLevel||(p.risk?'High':'Low');
    const r=`<span class="c ${lvl==='High'?'amber':''}" title="${x.riskLevel?'From the suicide / self-harm screen':'From the admission risk flag'}">Risk of harm: ${lvl}</span>`;
    return `<div class="sf" aria-label="Patient safety">${a}<span class="c ${lg[0]}">${hesc(lg[1])}</span>${o}${r}</div>`;
  };
  window.psyObsReview=function(pid){const x=pxOf(pid);x.obsRev={by:signer(),time:atNow().split(', ').pop(),date:today()};render();toast('Observation level reviewed by '+signer());};
  window.psyAllergy=function(pid){
    const x=pxOf(pid),cur=(x.allergy&&x.allergy.list)||[];
    const row=i=>`<div class="grid2" style="margin-bottom:6px"><input class="input" id="al_d${i}" placeholder="Medicine or allergen" value="${hesc((cur[i]||{}).drug||'')}"><input class="input" id="al_r${i}" placeholder="Reaction (rash, swelling, …)" value="${hesc((cur[i]||{}).rx||'')}"></div>`;
    V3.modal('Allergies · '+hesc(V3.pn(pid)),'Fill this in at the admission workup. It is checked whenever a medicine is added.',
      `<label class="row" style="gap:8px;margin-bottom:10px"><input type="checkbox" id="al_n" ${x.allergy&&x.allergy.ndka?'checked':''}><b>No known drug allergies</b></label><div class="lbl" style="margin-bottom:6px">Or list the allergies</div>${row(0)}${row(1)}${row(2)}`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyAllergySave('${pid}')">Save</button>`);
  };
  window.psyAllergySave=function(pid){
    const n=$('al_n').checked,list=[0,1,2].map(i=>({drug:($('al_d'+i).value||'').trim(),rx:($('al_r'+i).value||'').trim()})).filter(i=>i.drug);
    if(!n&&!list.length){toast('Tick "No known drug allergies" or add an allergy');return;}
    pxOf(pid).allergy={ndka:n&&!list.length,list,by:signer(),at:atNow()};closeModal();render();toast('Allergies saved');
  };

  const __ch=compactHeader;
  compactHeader=function(){
    let h=__ch.apply(this,arguments);if(!psy())return h;
    const p=ptFind(S.pid);if(!p)return h;
    h=h.replace(/<span class="muted" style="font-weight:600">[^<]*<\/span><span class="tiny muted">UHID [^<]*<\/span>/,`<span class="muted" style="font-weight:600">${[psyAgeSex(p),p.uhid?'UHID '+hesc(p.uhid):'',hesc(p.room)].filter(Boolean).join(' · ')}</span>`);
    return h.replace(/<div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto">[\s\S]*?<\/div>(?=\s*<div class="dpcards">)/,psySafety(S.pid)+(S.discharged?'<span class="chip c-green">Discharged</span>':''));
  };

  /* nursing chart (medicine chart) carries the same strip */
  const __nv=vNurseView;
  vNurseView=function(){
    const h=__nv.apply(this,arguments);if(!psy())return h;
    const pts=rmoPts().map(r=>r.p),sel=pts.find(p=>p.id===(S.ncP||S.nFocus||'neel'))||pts[0];
    return sel?h.replace(/(<div class="row" style="gap:8px;flex-wrap:wrap">[\s\S]*?<\/button><\/div>)/,'$1<section class="card pad"><div style="font-weight:600;margin-bottom:6px">'+hesc(sel.name)+' <span class="muted small" style="font-weight:400">'+hesc((psyAgeSex(sel)?psyAgeSex(sel)+' · ':'')+(()=>{try{const u=sel.uhid||ptIdentity(sel).uhid;return u?'UHID '+u+' · ':''}catch(e){return ''}})()+sel.room)+'</span></div>'+psySafety(sel.id)+'</section>'):h;
  };

  /* ---------- NEWS2 and suicide screen ---------- */
  const rng=(v,t)=>{for(const [lo,hi,s] of t)if(v>=lo&&v<=hi)return s;return 0;};
  function news(v){
    const P={
      rr:rng(v.rr,[[-1e9,8,3],[9,11,1],[12,20,0],[21,24,2],[25,1e9,3]]),
      spo2:rng(v.spo2,[[-1e9,91,3],[92,93,2],[94,95,1],[96,1e9,0]]),
      air:v.o2?2:0,
      sbp:rng(v.sbp,[[-1e9,90,3],[91,100,2],[101,110,1],[111,219,0],[220,1e9,3]]),
      pulse:rng(v.pulse,[[-1e9,40,3],[41,50,1],[51,90,0],[91,110,1],[111,130,2],[131,1e9,3]]),
      cons:v.cons==='Alert'?0:3,
      temp:rng(v.temp,[[-1e9,35,3],[35.01,36,1],[36.01,38,0],[38.01,39,1],[39.01,1e9,2]])};
    const total=Object.values(P).reduce((a,b)=>a+b,0),single=Object.values(P).some(x=>x===3);
    const band=total>=5?'Urgent RMO review':(total>=3||single)?'Inform RMO':'Routine';
    return {P,total,band};
  }
  const lastVit=c=>{const r=(c.vit||[]).slice(-1)[0]||[],bp=String(r[1]||'').split('/');return {sbp:+bp[0]||120,pulse:+r[2]||80,temp:r[3]?Math.round((+r[3]-32)*5/9*10)/10:36.8,spo2:+r[4]||98};};
  const bandCls=b=>b==='Urgent RMO review'?'red':b==='Inform RMO'?'amber':'';
  const arrow=(a,b)=>a==null||b==null?'':(a>b?' ↑':a<b?' ↓':' →');
  window.psyNewsSave=function(pid){
    const v={rr:+$('nw_rr').value,spo2:+$('nw_o').value,o2:$('nw_a').value==='Oxygen',sbp:+$('nw_s').value,pulse:+$('nw_p').value,cons:$('nw_c').value,temp:+$('nw_t').value};
    if([v.rr,v.spo2,v.sbp,v.pulse,v.temp].some(n=>!isFinite(n)||n<=0)){toast('Fill every vital to calculate the score');return;}
    const x=pxOf(pid),r=news(v);x.news=x.news||[];x.news.unshift({at:atNow(),by:signer(),v,total:r.total,band:r.band});
    if(r.band==='Urgent RMO review'){
      v3().alerts.unshift({id:'n'+(++v3().tlN),pid,sev:'urgent',title:'Early warning score '+r.total+': urgent RMO review',detail:`RR ${v.rr} · SpO₂ ${v.spo2}% · BP ${v.sbp} · pulse ${v.pulse} · ${v.temp} °C · ${v.cons}`,src:'Vitals',by:signer(),t:V3.now(),ack:null,seen:null,closed:null,esc:[]});
    }
    render();toast('Score '+r.total+' · '+r.band+(r.band==='Urgent RMO review'?'. Raised to the escalation chain.':''));
  };
  const SQ=['Wished to be dead, or to go to sleep and not wake up','Non-specific active suicidal thoughts','Thought of a method, without a plan or intent','Some intent to act on the thoughts','A plan with details worked out','Self-harm or preparing to act, this stay or in the past 3 months'];
  window.psySuiSave=function(pid){
    const ans=SQ.map((_,i)=>$('sq'+i).value==='Yes');
    const lvl=(ans[3]||ans[4]||ans[5])?'High':ans[2]?'Moderate':'Low',x=pxOf(pid);
    x.suicide=x.suicide||[];x.suicide.unshift({at:atNow(),date:today(),by:signer(),ans,level:lvl});x.riskLevel=lvl;
    render();toast('Risk of harm set to '+lvl.toLowerCase()+' from the screen');
  };
  function scoresCard(pid){
    const c=ptCtxOf(pid),x=pxOf(pid),pv=lastVit(c),N=x.news||[],S2=x.suicide||[],p=ptFind(pid);
    const f=(id,l,val,extra)=>`<label>${l}<input class="input" id="${id}" type="number" step="any" value="${val}" style="min-height:32px;padding:4px 8px" ${extra||''}></label>`;
    const n0=N[0],lv=x.riskLevel||(p&&p.risk?'High':'Low');
    const dueS=(lv==='High'||(p&&p.risk))&&!(S2[0]&&S2[0].date===today());
    return `<section class="card"><div class="hd"><div><h3>Scores</h3><div class="small muted" style="margin-top:4px">Early warning score from the vitals, and the suicide / self-harm screen. Only scores are shown; no free-text interpretation.</div></div></div>
      <div class="pad sc-grid">
        <div><div class="lbl">Early warning score (NEWS2)</div>
          <div class="row" style="gap:10px;align-items:baseline;margin:6px 0 8px"><span class="sc-big">${n0?n0.total:'–'}</span>${n0?`<span class="sf"><span class="c ${bandCls(n0.band)}">${n0.band}</span></span><span class="small muted">${arrow(n0.total,N[1]&&N[1].total)} ${hesc(n0.at)}</span>`:'<span class="small muted">No score yet</span>'}</div>
          <div class="sc-f">${f('nw_rr','Resp. rate',16)}${f('nw_o','SpO₂ %',pv.spo2)}${f('nw_s','Systolic BP',pv.sbp)}${f('nw_p','Pulse',pv.pulse)}
            <label>Air or oxygen<select class="input" id="nw_a" style="min-height:32px;padding:4px 8px"><option>Air</option><option>Oxygen</option></select></label>
            <label>Consciousness<select class="input" id="nw_c" style="min-height:32px;padding:4px 8px"><option>Alert</option><option>Confusion</option><option>Voice</option><option>Pain</option><option>Unresponsive</option></select></label>${f('nw_t','Temp °C',pv.temp)}
            <label>&nbsp;<button class="btn sm pri" onclick="psyNewsSave('${pid}')">Calculate and save</button></label></div>
          <div class="tiny muted" style="margin-top:6px">Routine: below 3 and no single high reading. Inform RMO: 3 to 4, or any single reading at the top band. Urgent RMO review: 5 or more (raised into the escalation chain).</div>
          ${N.length>1?`<div class="small" style="margin-top:8px"><b>Earlier:</b> ${N.slice(1,5).map(e=>e.total+' ('+hesc(e.at.split(',')[0])+')').join(' · ')}</div>`:''}</div>
        <div><div class="lbl">Suicide / self-harm screen</div>
          <div class="row" style="gap:10px;align-items:baseline;margin:6px 0 8px"><span class="sc-big" style="font-size:22px">${S2[0]?S2[0].level:'Not screened'}</span>${S2[0]?`<span class="small muted">${hesc(S2[0].at)} · ${hesc(S2[0].by)}</span>`:''}${dueS?'<span class="sf"><span class="c amber">Daily screen due today</span></span>':''}</div>
          <div>${SQ.map((q,i)=>`<div class="sc-q"><span>${i+1}. ${q}</span><select class="input" id="sq${i}" style="width:auto;min-height:30px;padding:3px 8px"><option>No</option><option>Yes</option></select></div>`).join('')}</div>
          <div class="row" style="justify-content:space-between;margin-top:8px"><span class="tiny muted">At admission, daily for high-risk patients, and at each re-assessment. The result sets Risk of harm in the header.</span><button class="btn sm pri" onclick="psySuiSave('${pid}')">Save screen</button></div></div>
      </div></section>`;
  }
  const __pv=pVitals;
  pVitals=function(){const h=__pv.apply(this,arguments);return psy()?scoresCard(S.pid)+h:h;};

  /* ---------- lab results ---------- */
  const spark=(vals,lo,hi)=>{
    if(vals.length<2)return '<span class="tiny muted">One result</span>';
    const w=110,h=34,mn=Math.min(lo,...vals),mx=Math.max(hi,...vals),sy=v=>h-3-(v-mn)/((mx-mn)||1)*(h-6),sxp=i=>3+i*(w-6)/(vals.length-1);
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Trend"><rect x="0" y="${sy(hi)}" width="${w}" height="${Math.max(2,sy(lo)-sy(hi))}" fill="#e3f7ea"/><polyline fill="none" stroke="#1e6cdb" stroke-width="1.8" points="${vals.map((v,i)=>sxp(i)+','+sy(v)).join(' ')}"/>${vals.map((v,i)=>`<circle cx="${sxp(i)}" cy="${sy(v)}" r="2.4" fill="${v<lo||v>hi?'#b42318':'#1e6cdb'}"/>`).join('')}</svg>`;
  };
  function labsCard(pid){
    const s=v3(),L=s.labs.filter(l=>l.pid===pid).sort((a,b)=>b.t-a.t),P=(s.pending||[]).filter(x=>x.pid===pid);
    const row=l=>{const f=V3.labFlag(l);
      const st=l.rev?`<span class="chip c-green">Reviewed</span><div class="tiny muted">${hesc(l.rev.by)} · ${V3.stamp(l.rev.t)}</div>`:`<span class="chip c-blue">Result in</span>`;
      const flag=f==='crit'?'<span class="chip c-red">Critical</span>':f==='abn'?'<span class="chip c-amber">'+(l.val<l.lo?'Low':'High')+'</span>':'';
      const trend=L.filter(x=>x.test===l.test).slice().reverse().map(x=>x.val);
      return `<tr><td style="font-weight:600">${hesc(l.test)}${l.pdf?`<div class="tiny muted">Report: ${hesc(l.pdf)}</div>`:''}</td><td class="small">${V3.stamp(l.t)}</td><td><b class="v3lab ${f}">${l.val}</b> <span class="tiny muted">${hesc(l.unit)}</span> ${flag}</td><td class="small">${l.lo} to ${l.hi}</td><td>${spark(trend,l.lo,l.hi)}</td><td>${st}</td>
        <td style="text-align:right">${!l.rev?`<button class="btn sm ${f==='ok'?'':'pri'}" onclick="V3.labReview('${l.id}')">Mark reviewed</button>`:''}</td></tr>`;};
    const pend=P.map(x=>`<tr><td style="font-weight:600">${hesc(x.test)}</td><td class="small">${hesc(x.when||'')}</td><td class="muted">Waiting</td><td></td><td></td><td><span class="chip c-grey">${hesc(x.st||'Ordered')}</span></td><td></td></tr>`).join('');
    return `<section class="card" id="labcard"><div class="hd"><div><h3>Results</h3><div class="small muted" style="margin-top:4px">Ordered tests and what came back. An out-of-range result becomes a "Review result" task on your dashboard.</div></div><button class="btn sm" onclick="psyLabAdd('${pid}')">Upload lab report</button></div>
      ${L.length||P.length?`<div class="scroll"><table class="t"><thead><tr><th>Test</th><th>Collected</th><th>Result</th><th>Normal range</th><th>Trend</th><th>Status</th><th></th></tr></thead><tbody>${pend}${L.map(row).join('')}</tbody></table></div>`:'<div class="pad small muted">No tests ordered or resulted for this patient yet.</div>'}</section>`;
  }
  window.psyLabAdd=function(pid){
    V3.modal('Upload lab report · '+hesc(V3.pn(pid)),'Attach the report and type the key value. It is flagged against the normal range.',
      `<div class="grid2"><label class="field"><span class="lbl">Test</span>${V3.sel('pl_t',Object.keys(V3.LABS),'Serum lithium')}</label><label class="field"><span class="lbl">Result</span><input class="input" id="pl_v" type="number" step="any" inputmode="decimal"></label></div>
       <div class="grid2"><label class="field"><span class="lbl">Sample taken</span>${V3.sel('pl_w',[[0,'Today'],[-1,'Yesterday'],[-2,'2 days ago']],0)}</label><label class="field"><span class="lbl">Lab report (PDF or photo)</span><input class="input" id="pl_f" type="file" accept=".pdf,image/*"></label></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyLabSave('${pid}')">Save result</button>`);
  };
  window.psyLabSave=function(pid){
    const t=V3.val('pl_t'),v=parseFloat(V3.val('pl_v'));if(isNaN(v)){toast('Enter the result');return;}
    const d=V3.LABS[t],f=($('pl_f').files||[])[0],l={id:'b'+(++v3().tlN),pid,test:t,val:v,unit:d[0],lo:d[1],hi:d[2],critLow:d[3],critHigh:d[4],t:V3.now()+(+V3.val('pl_w'))*1440,pdf:f?f.name:'',by:signer()};
    v3().labs.unshift(l);const fl=V3.labFlag(l);
    V3.log(pid,'psychiatrist','lab',`${t} ${v} ${d[0]} (normal ${d[1]} to ${d[2]})${fl==='crit'?' · CRITICAL':fl==='abn'?' · abnormal':''}${f?' · report '+f.name:''}`,{by:signer()});
    closeModal();render();toast(fl==='ok'?'Saved. In range.':'Saved. Out of range: review it.');
  };
  /* the review is signed by the psychiatrist, not the RMO */
  const __lrs=V3.labReviewSave;
  V3.labReviewSave=function(id){
    if(!psy())return __lrs.apply(this,arguments);
    const l=v3().labs.find(x=>x.id===id),f=V3.val('lr_f').trim();if(!f){$('lr_e').style.display='block';return;}
    const a=V3.val('lr_a');l.rev={by:signer(),t:V3.now(),finding:f,action:a};
    V3.log(l.pid,'psychiatrist','lab',`Reviewed ${l.test} ${l.val}: ${f}. Action: ${a.toLowerCase()}.`,{by:signer()});closeModal();render();
    if(a==='Call the consultant now')setTimeout(()=>V3.callModal(l.pid,''),250);else if(a==='Refer to a specialist')setTimeout(()=>V3.referModal(l.pid),250);else toast('Reviewed by '+signer());
  };
  const __po=pOrders;
  pOrders=function(){const h=__po.apply(this,arguments);if(!psy())return h;
    const x=pxOf(S.pid),al=x.allergy;
    const line=`<section class="card pad row" style="justify-content:space-between;gap:12px"><div class="small"><b>Allergies</b> · ${al?(al.list&&al.list.length?al.list.map(i=>hesc(i.drug)+(i.rx?' ('+hesc(i.rx)+')':'')).join(', '):'No known drug allergies')+` <span class="tiny muted">· ${hesc(al.by)}, ${hesc(al.at)}</span>`:'<span style="color:var(--amber);font-weight:600">Not recorded</span>'}</div><button class="btn sm" onclick="psyAllergy('${S.pid}')">${al?'Edit':'Record'} allergies</button></section>`;
    return line+labsCard(S.pid)+h;};

  /* one line at the top of Stay summary */
  const prevVP=ROLE.psychiatrist.vPatient;
  ROLE.psychiatrist.vPatient=function(sub,base){
    let h=prevVP?prevVP(sub,base):base(sub);
    if(!sub||sub==='overview'){
      const pid=S.pid,L=v3().labs.filter(l=>l.pid===pid).sort((a,b)=>b.t-a.t),un=L.filter(l=>!l.rev),n0=L[0];
      const txt=!L.length?'No results yet':(un.length?`<b style="color:var(--amber)">${un.length} result${un.length>1?'s':''} to review</b>`:'All results reviewed')+(n0?` · latest ${hesc(n0.test)} ${n0.val} ${hesc(n0.unit)}`:'');
      h=h.replace(/(<div class="subtabs"[\s\S]*?<\/div>)/,`$1<section class="card pad row" style="justify-content:space-between;gap:12px;padding:10px 20px"><div class="small"><b>Results</b> · ${txt}</div><button class="btn sm" onclick="go('#/patient/${pid}/orders')">Open results</button></section>`);
    }
    return h;
  };

  /* dashboard: abnormal results to review, daily observation review */
  window.psyExtraItems=function(p){
    const out=[];
    v3().labs.filter(l=>l.pid===p.id&&!l.rev&&V3.labFlag(l)!=='ok').forEach(l=>out.push({k:'task',lab:['amber','Check result'],txt:l.test+' '+l.val+' '+l.unit+' · '+(l.val<l.lo?'low':'high')+' (normal '+l.lo+' to '+l.hi+')',due:'New result',btn:['Check result',`V3.labReview('${l.id}')`,false]}));
    const obs=(EX[p.id]||[])[0]||'Routine',rv=pxOf(p.id).obsRev;
    if(obs!=='Routine'&&!(rv&&rv.date===today()))out.push({k:'task',lab:['grey','Today'],txt:'Check how often this patient is watched ('+obs+')',due:'Do this at least once a day',btn:['Mark as checked',`psyObsReview('${p.id}')`,false]});
    return out;
  };
  window.psyScoreLine=function(pid){
    const x=pxOf(pid),n=x.news||[],s=x.suicide||[];if(!n.length&&!s.length)return '';
    return (n.length?'NEWS2 '+n[0].total+arrow(n[0].total,n[1]&&n[1].total)+' ('+n[0].band.toLowerCase()+')':'')+(n.length&&s.length?' · ':'')+(s.length?'Suicide screen: '+s[0].level.toLowerCase():'');
  };
})();
