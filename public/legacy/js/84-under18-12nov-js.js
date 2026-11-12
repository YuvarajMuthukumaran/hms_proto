/* 12 Nov 2026, Trello card 120: Under-18 patients. Rules that switch on by themselves for anyone under 18 (psychiatrist and psychologist tabs).
   Source: SOP 9 (child and adolescent services), SOP 19 (consent), MHCA 2017. Built with the card's defaults; Dr. Anu reviews the open questions
   (restraint override, dose and licence tables). All values are in window.TULASI_RULES.minor.
   Demo: Sameer Das is 16 in this prototype so the rules can be seen. Nothing is sent anywhere. */
(function(){
  const R=window.TULASI_RULES=window.TULASI_RULES||{};
  R.minor={
    age:18,
    /* licence and dose per kg, per day (demo values for Dr. Anu to review). minAge: licensed from this age. */
    meds:{olanzapine:{minAge:13,mgKgDay:0.4,note:'Licensed from 13 for schizophrenia and bipolar'},risperidone:{minAge:5,mgKgDay:0.06,note:'Licensed from 5 for conduct and autism irritability'},aripiprazole:{minAge:13,mgKgDay:0.3,note:'Licensed from 13'},
      clozapine:{minAge:18,mgKgDay:null,note:'Not licensed under 18. Consultant decision with guardian consent'},lithium:{minAge:12,mgKgDay:null,note:'Licensed from 12. Level monitoring'},valproate:{minAge:18,mgKgDay:null,note:'Avoid in girls of child-bearing age'},
      escitalopram:{minAge:12,mgKgDay:0.3,note:'Licensed from 12'},fluoxetine:{minAge:8,mgKgDay:0.6,note:'Licensed from 8'},sertraline:{minAge:6,mgKgDay:3,note:'Licensed from 6 for OCD'},mirtazapine:{minAge:18,mgKgDay:null,note:'Not licensed under 18'},
      lorazepam:{minAge:18,mgKgDay:0.1,note:'Use only short term, consultant decision'},clonazepam:{minAge:18,mgKgDay:0.05,note:'Use only short term, consultant decision'},haloperidol:{minAge:3,mgKgDay:0.15,note:'Licensed from 3'}},
    scales:{'Y-BOCS':'CY-BOCS','PHQ-9':'PHQ-A','C-SSRS':'Paediatric C-SSRS'},
    extraScales:['SDQ','CBCL']
  };
  const M=R.minor;
  const role=()=>String((window.__TULASI__||{}).role||'');
  const who=()=>{const r=role();if(S.role==='psychologist'||/psycholog/.test(r))return 'psychologist';if(S.role==='psychiatrist'&&!/patient-experience|rmo/.test(r))return 'psychiatrist';return '';};
  const pt=pid=>PTS.find(p=>p.id===pid)||{id:pid,name:pid,age:30};
  const kid=pid=>{const p=PTS.find(x=>x.id===pid);return !!p&&(+p.age||99)<M.age;};
  const kx=pid=>{const x=psyPx(pid);return x.kid||(x.kid={weight:'',mhrb:{},ect:{},cwc:{on:false,from:'',at:0,status:false,final:false},school:{consent:false,contact:'',plan:'',letter:false},conf:{shared:'Treatment plan, medicines, progress, risks and safety.',private:'What the teen says in session about friends, feelings and relationships, unless there is a risk to safety.'},pocso:{on:false,done:null},parentGroups:[],hw:{simple:true,parent:true}});};
  /* demo child: Sameer Das, 16 */
  try{const s=PTS.find(p=>p.id==='sameer');if(s&&(+s.age||99)>=18){s.age=16;s.sec='87';s.dob='2010-03-14';}}catch(e){}
  const chipx=(t,c)=>`<span class="k18-ch ${c||''}">${hesc(t)}</span>`;
  const row=(l,r)=>`<div class="row small" style="gap:10px;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eef1f5"><span>${l}</span><span style="display:flex;gap:6px;align-items:center;flex:none">${r||''}</span></div>`;
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/([^/?]+)/);return m?{pid:m[1],tab:m[2]}:null;};
  const day=pid=>+(pt(pid).day)||0;

  /* ---------------- psychiatrist: tasks on Today ---------------- */
  function kidTasks(){const out=[];PTS.filter(p=>kid(p.id)).forEach(p=>{const k=kx(p.id),d=day(p.id);
    if(!k.mhrb.notice)out.push({id:'k18_n_'+p.id,late:d>=1,title:'Send the MHRB notice (minor admission) · '+p.name,meta:'Section 87, parent or guardian is the applicant',due:d>=1?'Overdue':'Today',go:'#/patient/'+p.id+'/overview'});
    if(!k.mhrb.review&&d>=25)out.push({id:'k18_r_'+p.id,late:d>=30,title:'30 day MHRB review · '+p.name,meta:'Minor admission review',due:(30-d)+' days left',go:'#/patient/'+p.id+'/overview'});
    if(k.cwc.on){const left=14-Math.floor((Date.now()+((S.au||{}).skip||0)*3600000-k.cwc.at)/86400000);
      if(!k.cwc.status&&left<=7)out.push({id:'k18_cs_'+p.id,late:left<0,title:'CWC / JJB status report · '+p.name,meta:'Due by day 7 of the 2 week assessment',due:left<0?'Overdue':'Due',go:'#/patient/'+p.id+'/overview'});
      if(!k.cwc.final)out.push({id:'k18_cf_'+p.id,late:left<0,title:'CWC / JJB final report · '+p.name,meta:'2 week assessment, '+Math.max(0,left)+' days left',due:left<0?'Overdue':left+' days',go:'#/patient/'+p.id+'/overview'});}
  });return out;}
  const __tasks=tasks;
  tasks=function(){const r=__tasks.apply(this,arguments);if(!Array.isArray(r)||who()!=='psychiatrist')return r;const have=new Set(r.map(t=>t.id));kidTasks().filter(t=>!have.has(t.id)).forEach(t=>r.push(Object.assign({},t,{lead:false})));return r;};

  /* ---------------- blocked: restraint, ECT; prescribing checks ---------------- */
  const __rst=restraintModal;
  restraintModal=function(){const pid=S.pid||'neel';
    if(kid(pid)){openModal(`<div class="mh"><h3>Restraint is not used for children</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb"><div class="callout amber"><b>${hesc(pt(pid).name)} is under 18.</b> SOP 9 says restraint and moderate sedation are not practised for children. Use de-escalation, call the consultant, and keep the parent or guardian informed. An override needs Dr. Anu's approval, so it is not available here.</div></div><div class="mf"><button class="btn" onclick="closeModal()">Close</button></div>`);return;}
    return __rst.apply(this,arguments);};
  const __mect=mectModal;
  mectModal=function(){const pid=S.pid||'neel';
    if(kid(pid)){const k=kx(pid);if(!(k.ect.guardian&&k.ect.mhrb)){openModal(`<div class="mh"><h3>ECT for ${hesc(pt(pid).name)} (under 18)</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div><div class="mb"><div class="callout amber">ECT is blocked for a child until the guardian consent AND the MHRB permission are both recorded.</div>
      <label class="row" style="gap:8px;margin:8px 0"><input type="checkbox" id="k18g" ${k.ect.guardian?'checked':''}> <span>Guardian consent recorded (signature or thumb impression, with a witness)</span></label>
      <label class="row" style="gap:8px"><input type="checkbox" id="k18m" ${k.ect.mhrb?'checked':''}> <span>MHRB permission recorded</span></label></div><div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="k18Ect('${pid}')">Save and continue</button></div>`);return;}}
    return __mect.apply(this,arguments);};
  window.k18Ect=function(pid){const k=kx(pid);k.ect.guardian=!!($('k18g')||{}).checked;k.ect.mhrb=!!($('k18m')||{}).checked;closeModal();if(k.ect.guardian&&k.ect.mhrb){mectModal();}else{toast('Both are needed before ECT can be ordered');}};
  const mgOf=name=>{const n=String(name||'').toLowerCase();const k=Object.keys(M.meds).find(x=>n.includes(x));return k?[k,M.meds[k]]:null;};
  const __chk=window.psyRxCheck;
  window.psyRxCheck=function(){
    const r=__chk.apply(this,arguments);
    try{const pid=S.pid;if(!who()||!kid(pid)||!$('rxM'))return r;const k=kx(pid),p=pt(pid),name=$('rxM').value.trim(),add=document.querySelector('#modal .mf .btn.pri');
      let box=$('rxKid');if(!box){box=document.createElement('div');box.id='rxKid';const w=$('rxWarn');if(!w)return r;w.parentNode.insertBefore(box,w);}
      let html='',block=false;
      if(!k.weight){block=true;html+=`<div class="rx-block"><b>Weight needed first</b>${hesc(p.name)} is ${p.age}. Record the weight before the first order.<br><input class="input" id="k18w" type="number" min="3" max="120" step="0.1" placeholder="Weight in kg" style="max-width:140px;margin-top:6px"> <button class="btn sm" type="button" onclick="k18Weight('${pid}')">Save weight</button></div>`;}
      const m=mgOf(name);
      if(m){const [k0,rule]=m;if(p.age<rule.minAge)html+=`<div class="rx-w2"><div class="lbl2">Child check</div><div>${hesc(k0)} is licensed from age ${rule.minAge}. ${hesc(rule.note)}</div></div>`;
        else if(k.weight&&rule.mgKgDay)html+=`<div class="rx-w2"><div class="lbl2">Child dose check</div><div>Usual upper limit about ${(rule.mgKgDay*k.weight).toFixed(1)} mg a day for ${k.weight} kg. ${hesc(rule.note)}</div></div>`;}
      box.innerHTML=html;if(add&&block){add.disabled=true;add.title='Record the weight first';}}catch(e){}
    return r;};
  window.k18Weight=function(pid){const v=+(($('k18w')||{}).value);if(!v||v<3||v>120){toast('Enter the weight in kg');return;}kx(pid).weight=v;psyRxCheck();toast('Weight saved: '+v+' kg');};

  /* ---------------- cards ---------------- */
  function psychiatristCard(pid){const p=pt(pid),k=kx(pid),d=day(pid),cwc=k.cwc,left=cwc.on?14-Math.floor((Date.now()+((S.au||{}).skip||0)*3600000-cwc.at)/86400000):null;
    return `<section class="card" id="kidCard"><div class="hd"><div><h3>Under 18 ${chipx(p.age+' years','warn')}</h3><div class="small muted" style="margin-top:4px">Rules for children switch on by themselves. Source: SOP 9, SOP 19, MHCA 2017.</div></div></div>
      <div class="pad k18-grid"><div><div class="lbl">Admission</div>
        ${row('<b>Minor admission, Section 87</b><div class="tiny muted">Parent or guardian is the applicant and the nominated representative</div>',chipx('Section 87',''))}
        ${row('MHRB notice',k.mhrb.notice?chipx('Sent '+k.mhrb.notice,'ok'):`<button class="btn sm pri" onclick="k18Mhrb('${pid}','notice')">Mark sent</button>`)}
        ${row('30 day MHRB review <span class="tiny muted">on the MHCA clock, day '+d+'</span>',k.mhrb.review?chipx('Done '+k.mhrb.review,'ok'):`<button class="btn sm" onclick="k18Mhrb('${pid}','review')">Mark done</button>`)}
        ${row('Consents signed by the parent or guardian <span class="tiny muted">signature or thumb impression, plus a witness</span>',k.consent?chipx('Recorded','ok'):`<button class="btn sm" onclick="k18Consent('${pid}')">Mark recorded</button>`)}</div>
      <div><div class="lbl">Blocked or needs more</div>
        ${row('Restraint and moderate sedation',chipx('Blocked','bad'))}
        ${row('ECT',k.ect.guardian&&k.ect.mhrb?chipx('Guardian and MHRB recorded','ok'):chipx('Blocked until guardian consent and MHRB permission','warn'))}
        ${row('Prescribing',k.weight?chipx('Weight '+k.weight+' kg','ok'):chipx('Weight needed before the first order','warn'))}
        ${row('Ward placement <span class="tiny muted">separate from adults, family may stay</span>',chipx('Child and adolescent area',''))}</div>
      <div class="k18-wide"><div class="lbl">CWC / JJB referred case</div>
        ${cwc.on?`${row('Referred by '+hesc(cwc.from)+' <span class="tiny muted">2 week assessment, '+Math.max(0,left)+' days left</span>',left<0?chipx('Overdue','bad'):chipx(left+' days','warn'))}
          ${row('Status report <span class="tiny muted">due by day 7</span>',cwc.status?chipx('Sent','ok'):`<button class="btn sm" onclick="k18Cwc('${pid}','status')">Mark sent</button>`)}
          ${row('Final report',cwc.final?chipx('Sent','ok'):`<button class="btn sm" onclick="k18Cwc('${pid}','final')">Mark sent</button>`)}`:`<div class="small muted">Not a CWC or JJB referral.</div><div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" onclick="k18CwcOn('${pid}','CWC')">Referred by CWC</button><button class="btn sm" onclick="k18CwcOn('${pid}','JJB')">Referred by JJB</button></div>`}</div></div></section>`;}
  function psychologistCard(pid){const p=pt(pid),k=kx(pid),s=k.school;
    return `<section class="card" id="kidCard"><div class="hd"><div><h3>Child and adolescent therapy ${chipx(p.age+' years','warn')}</h3><div class="small muted" style="margin-top:4px">Switches on for anyone under 18.</div></div></div>
      <div class="pad k18-grid"><div><div class="lbl">Child scales</div>
        ${[['CY-BOCS','instead of Y-BOCS'],['PHQ-A','instead of PHQ-9'],['Paediatric C-SSRS','instead of C-SSRS'],['SDQ / CBCL','strengths and difficulties, behaviour checklist']].map(x=>row('<b>'+x[0]+'</b> <span class="tiny muted">'+x[1]+'</span>',chipx('Use this',''))).join('')}
        <div class="lbl" style="margin-top:12px">Family therapy</div>${row('Family therapy is on by default for this patient',chipx('On','ok'))}
        ${row('Parent group education sessions <span class="tiny muted">'+k.parentGroups.length+' logged</span>',`<button class="btn sm" onclick="k18Group('${pid}')">Log a session</button>`)}
        ${k.parentGroups.map(g=>'<div class="tiny muted">'+hesc(g)+'</div>').join('')}
        <div class="lbl" style="margin-top:12px">Homework</div>${row('Simpler worksheets for the child',chipx('On','ok'))}${row('Parent version of each worksheet',chipx('On','ok'))}</div>
      <div><div class="lbl">School</div><div class="tiny muted" style="margin-bottom:6px">The school is contacted only after the guardian agrees.</div>
        ${row('Guardian consent to contact the school',s.consent?chipx('Given','ok'):`<button class="btn sm pri" onclick="k18School('${pid}')">Mark given</button>`)}
        <label class="field" style="margin-top:6px"><span class="lbl">School contact</span><input class="input" id="k18sc" value="${hesc(s.contact)}" ${s.consent?'':'disabled'} placeholder="Class teacher or counsellor" onchange="k18Save('${pid}')"></label>
        <label class="field"><span class="lbl">Plan for keeping up with studies</span><textarea class="input" id="k18sp" rows="2" ${s.consent?'':'disabled'} onchange="k18Save('${pid}')">${hesc(s.plan)}</textarea></label>
        <div class="row" style="gap:6px"><button class="btn sm" ${s.consent?'':'disabled'} onclick="k18Letter('${pid}')">${s.letter?'School letter made':'Make the school letter'}</button></div>
        <div class="lbl" style="margin-top:12px">Confidentiality</div>
        <label class="field"><span class="lbl">Shared with parents</span><textarea class="input" id="k18cs" rows="2" onchange="k18Save('${pid}')">${hesc(k.conf.shared)}</textarea></label>
        <label class="field"><span class="lbl">Stays between the teen and the therapist</span><textarea class="input" id="k18cp" rows="2" onchange="k18Save('${pid}')">${hesc(k.conf.private)}</textarea></label></div>
      <div class="k18-wide"><div class="lbl">Safeguarding (POCSO)</div>
        ${k.pocso.on?`<div class="callout amber" style="margin:6px 0"><b>Abuse suspected.</b> Mandatory reporting checklist. The consultant signs it.</div>
          ${['Tell the consultant now','Do not question the child further, record what was said in their words','Report to the Special Juvenile Police Unit or local police','Inform the Child Welfare Committee','Keep the child safe from the person concerned'].map((t,i)=>`<label class="row" style="gap:8px;padding:3px 0"><input type="checkbox" ${(k.pocso.ticks||{})[i]?'checked':''} onchange="k18Poc('${pid}',${i},this.checked)"> <span>${t}</span></label>`).join('')}
          <div style="margin-top:8px">${k.pocso.done?chipx('Signed by '+hesc(k.pocso.done.by)+', '+hesc(k.pocso.done.at),'ok'):`<button class="btn sm pri" onclick="k18PocSign('${pid}')">Consultant signs</button>`}</div>`:`<div class="small muted">No safeguarding concern recorded.</div><button class="btn sm" style="margin-top:6px" onclick="k18PocOn('${pid}')">Abuse is suspected</button>`}</div></div></section>`;}

  /* ---------------- handlers ---------------- */
  window.k18Mhrb=function(pid,key){kx(pid).mhrb[key]=atNow();render();toast('Recorded');};
  window.k18Consent=function(pid){kx(pid).consent=true;render();toast('Consents by the parent or guardian recorded');};
  window.k18CwcOn=function(pid,from){const c=kx(pid).cwc;c.on=true;c.from=from;c.at=Date.now()+((S.au||{}).skip||0)*3600000;render();toast('2 week assessment clock started');};
  window.k18Cwc=function(pid,k){kx(pid).cwc[k]=true;render();};
  window.k18Group=function(pid){kx(pid).parentGroups.unshift('Parent group education · '+atNow()+' · by '+signer());render();toast('Session logged');};
  window.k18School=function(pid){kx(pid).school.consent=true;render();};
  window.k18Save=function(pid){const k=kx(pid);const v=id=>(($(id)||{}).value);if($('k18sc'))k.school.contact=v('k18sc');if($('k18sp'))k.school.plan=v('k18sp');if($('k18cs'))k.conf.shared=v('k18cs');if($('k18cp'))k.conf.private=v('k18cp');};
  window.k18Letter=function(pid){const k=kx(pid),p=pt(pid);k18Save(pid);k.school.letter=true;
    V3.modal('School letter · '+hesc(p.name),'For the school. No diagnosis or details.',`<textarea class="input" rows="7" readonly>To the class teacher,\n\n${p.name} is under the care of Tulasi Healthcare and may miss some school days. With the guardian's agreement, we ask for help with a plan to keep up with studies${k.school.plan?': '+k.school.plan:''}.\n\nPlease contact ${k.school.contact||'the treating team'} through the hospital.\n\nTreating team, Tulasi Healthcare</textarea>`,`<button class="btn" onclick="closeModal();render()">Close</button>`);};
  window.k18PocOn=function(pid){kx(pid).pocso.on=true;try{V3.alert({pid,sev:'urgent',title:'Abuse suspected · '+pt(pid).name,detail:'POCSO checklist opened. Consultant to sign.',src:'Safeguarding',by:signer()});}catch(e){}render();};
  window.k18Poc=function(pid,i,on){const k=kx(pid).pocso;k.ticks=k.ticks||{};k.ticks[i]=on;};
  window.k18PocSign=function(pid){const k=kx(pid).pocso,n=Object.keys(k.ticks||{}).filter(x=>k.ticks[x]).length;if(n<5){toast('Tick every step first');return;}
    pinSign('Sign the POCSO reporting checklist · '+pt(pid).name,[['Signing as',signer()]],()=>{k.done={by:signer(),at:atNow()};render();toast('Signed by the consultant');});};

  /* ---------------- paint ---------------- */
  const css=document.createElement('style');css.id='k18-css';
  css.textContent=`.k18-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 28px}.k18-wide{grid-column:1/-1}.k18-grid .lbl{margin-bottom:6px}
  .k18-ch{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;background:#eef2f7;color:#475467;white-space:nowrap}.k18-ch.ok{background:#ecfdf3;color:#067647}.k18-ch.warn{background:#fffaeb;color:#b54708}.k18-ch.bad{background:#fef3f2;color:#b42318}
  .k18-tag{display:inline-block;margin-left:8px;font-size:12px;font-weight:700;border-radius:99px;padding:3px 11px;background:#fff1e0;color:#b54708;border:1px solid #fedf89;vertical-align:middle}
  @media(max-width:760px){.k18-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(css);
  function paint(){const v=$('view'),k=who();if(!v||!k)return;const rt=route();if(!rt||!kid(rt.pid))return;
    /* chip beside the name */
    if(!v.querySelector('.k18-tag')){const h=[...v.querySelectorAll('h1,h2,h3,.ph-name,.pt-name')].find(e=>e.textContent.trim().startsWith(pt(rt.pid).name));if(h)h.insertAdjacentHTML('beforeend','<span class="k18-tag">Under 18</span>');}
    if(!v.querySelector('#kidCard')){const want=(k==='psychiatrist'&&/^(overview|admission)$/.test(rt.tab))||(k==='psychologist'&&/^(therapy|overview)$/.test(rt.tab));
      if(want){const t=document.createElement('div');t.innerHTML=k==='psychiatrist'?psychiatristCard(rt.pid):psychologistCard(rt.pid);const first=v.querySelector('section.card');const el=t.firstElementChild;first?first.parentNode.insertBefore(el,first.nextSibling):v.appendChild(el);}}
    /* child versions of the scales, wherever the adult name appears */
    if(k==='psychologist')swapScales(v);}
  function swapScales(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const map=M.scales;while((n=w.nextNode())){if(n.parentElement&&n.parentElement.closest('#kidCard'))continue;let s=n.nodeValue,o=s;for(const a in map){if(s.includes(a)&&!s.includes(map[a]))s=s.split(a).join(map[a]);}if(s!==o)n.nodeValue=s;}}
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{paint();}catch(e){}return r;};
  window.kidPaint=paint;
})();
