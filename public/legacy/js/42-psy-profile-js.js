
/* Psychiatrist only (5 Nov 2026): patient profile changes from the team review (two transcripts).
   - Patient header takes the doctor portal's look (design only, no content change): soft card, rounded info boxes, small uppercase
     labels, pill team chips, outline side buttons. Age first, then sex ("29 Male") is in 29-psy-safety.
   - Past admissions: day by day like the doctor portal's clinical notes (date, tag, doctor name and role, one line, open for the
     full note), with a PDF button per admission.
   - Daily notes: Earlier notes get a PDF button.
   - Print file: a button in the header. The doctor ticks what to print (or Select all) and gets one PDF with the clinic letterhead
     (filled documents only, no blank forms). */
(function(){
  const psy=()=>S.role==='psychiatrist';
  const css=document.createElement('style');css.id='psy-profile-css';
  css.textContent=`
  body.psy-views .dph{border-radius:16px;border:1px solid #e8eef5;box-shadow:none}
  body.psy-views .dph h2{font-size:22px;font-weight:700;color:#0b1324;letter-spacing:-.01em}
  body.psy-views .dph .dpmain .muted{color:#90a1b9;font-weight:600;font-size:13px}
  body.psy-views .dph .dpc{background:#f6f9fc;border:0;border-radius:12px}
  body.psy-views .dph .dpc .lbl{font-size:10.5px!important;letter-spacing:.05em!important;text-transform:uppercase!important;color:#90a1b9;font-weight:700!important}
  body.psy-views .dph .dpv{font-weight:700;color:#0b1324}
  body.psy-views .dph .tpill{border-radius:99px;border:1px solid #e8eef5;background:#fff}
  body.psy-views .dph .dpact .btn.soft{background:#fff;border:1px solid #cfe0f5;color:var(--blue-ink)}
  body.psy-views .dph .dpact .btn.soft:hover{background:#f6f9fc}
  .pp-sel{display:flex;flex-direction:column;gap:8px}
  .pp-sel label{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;cursor:pointer;font-size:14px}
  .pp-sel label.dis{opacity:.5;cursor:default}
  .pp-r{display:flex;gap:8px;align-items:stretch}.pp-r label{flex:1;min-width:0}.pp-r .btn{align-self:center;white-space:nowrap}
  .pp-sel label b{font-weight:600}.pp-sel .tiny{display:block}
  .pp-all{border-color:var(--blue)!important;background:var(--blue-tint)}`;
  document.head.appendChild(css);

  const pnow=()=>new Date().toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
  const idLine=p=>[window.psyAgeSex?psyAgeSex(p):'',p.uhid?'UHID '+p.uhid:'',p.room].filter(Boolean).join(' · ');

  /* one PDF window: clinic letterhead, patient line, then the content. The browser's Print dialog saves it as PDF. */
  window.psyPdf=function(title,body,p){
    const w=window.open('','_blank');if(!w){toast('Allow pop-ups to make the PDF');return;}
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${hesc(title)}</title><style>
      @page{size:A4;margin:14mm 12mm}body{font-family:Inter,Arial,sans-serif;color:#0b1324;font-size:12.5px;line-height:1.45;margin:0}
      .lh{display:flex;align-items:center;gap:12px;border-bottom:2px solid #1d4ed8;padding-bottom:10px;margin-bottom:12px}.lh img{height:46px}
      .lh b{font-size:17px}.lh div div{color:#667085;font-size:11.5px}
      .pt{display:flex;justify-content:space-between;gap:12px;background:#f6f9fc;border-radius:8px;padding:8px 12px;margin-bottom:12px}.pt b{font-size:15px}
      h2{font-size:15px;margin:18px 0 8px;border-bottom:1px solid #e4e7ec;padding-bottom:4px}
      .n{border:1px solid #e4e7ec;border-radius:8px;padding:8px 10px;margin-bottom:8px;break-inside:avoid}
      .n .h{display:flex;justify-content:space-between;gap:8px;font-weight:600}.n .m{color:#667085;font-size:11.5px;margin-bottom:4px}
      .n .s{margin-top:4px}.n .s b{display:block;font-size:11.5px;color:#475467}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #e4e7ec;padding:5px 8px;text-align:left;font-size:12px}th{background:#f6f9fc}
      .ft{margin-top:16px;color:#98a2b3;font-size:10.5px}
    </style></head><body>
      <div class="lh"><img src="${location.origin}/logo.png" alt=""><div><b>Tulasi Healthcare</b><div>Psychiatric hospital · patient file</div></div></div>
      ${p?`<div class="pt"><div><b>${hesc(p.name)}</b><div>${hesc(idLine(p))}</div></div><div style="text-align:right">${hesc(title)}<div>Printed ${hesc(pnow())} by ${hesc(signer())}</div></div></div>`:''}
      ${body}
      <div class="ft">Printed from the Tulasi Clinical Portal. Demo data.</div></body></html>`);
    w.document.close();setTimeout(()=>{try{w.focus();w.print();}catch(e){}},500);
  };

  const noteHtml=n=>`<div class="n"><div class="h"><span>${hesc(n.type||'Note')}</span><span>${hesc(n.d||'')} ${hesc(n.my||'')}</span></div>
    <div class="m">${hesc(n.by||'')}${n.role?' · '+hesc(n.role):''}${n.signed?' · signed '+hesc(n.signed):''}</div>
    ${(n.secs||[['Note',n.sum||'']]).map(s=>`<div class="s"><b>${hesc(s[0])}</b>${Array.isArray(s[1])?s[1].map(hesc).join('<br>'):hesc(s[1])}</div>`).join('')}</div>`;

  /* ---------- Past admissions, day by day ---------- */
  function pastItems(a){
    const yr=(String(a.dates).match(/(\d{4})/)||[])[1]||'';
    return (a.notes||[]).map(n=>{
      const [dd,mm]=String(n[0]).split(' ');const parts=String(n[1]).split(' · ');
      const by0=parts.length>1?parts[parts.length-1]:'';const type=parts.length>1?parts.slice(0,-1).join(' · '):parts[0];
      const by=by0||a.psy;const role=/Dr\./.test(by)?'Psychiatrist':'Psychologist';
      const tc=/round|discharge/i.test(type)?'c-violet':/capacity|history/i.test(type)?'c-green':'c-blue';
      return {d:dd,my:(mm||'')+' '+yr,type,tc,by,role,sum:type+': '+n[2],secs:[[type,n[2]]]};
    });
  }
  const __pp=pPast;
  pPast=function(){
    if(!psy())return __pp.apply(this,arguments);
    return S.pastAdm.map((a,ai)=>`
    <section class="card">
      <div class="hd"><div><h3>Admission ${a.n} · ${a.dates}</h3><div class="small muted" style="margin-top:4px">${a.days} days · ${a.sec} · ${a.psy} · ${a.psych} · read only</div></div>
        <div class="row" style="gap:8px"><button class="btn sm" onclick="pastSummary(${ai})">Discharge summary</button><button class="btn sm" onclick="pastFile(${ai})">Stay file</button><button class="btn sm" onclick="psyPastPdf(${ai})">PDF</button></div></div>
      <div class="grid3" style="padding:14px 20px">
        <div class="box"><div class="lbl">Discharge diagnosis</div><div class="small" style="font-weight:600;margin-top:4px">${a.dx}</div></div>
        <div class="box"><div class="lbl">Condition at discharge</div><div class="small" style="font-weight:600;margin-top:4px">${a.cond}</div></div>
        <div class="box"><div class="lbl">Medicines at discharge</div>${a.meds.map(m=>`<div class="small" style="font-weight:600;margin-top:4px">${m}</div>`).join('')}</div>
      </div>
      <div class="lbl" style="padding:4px 20px 6px">Clinical notes, newest first</div>
      <div style="padding:0 16px 8px">${noteList('past'+ai,pastItems(a))}</div>
      <div class="pad small"><span class="muted">Plan last time:</span> ${a.plan}</div>
    </section>`).join('')+`<div class="callout grey">Past stays are read only. OPD visits between admissions stay in the live Clinical Notes tab; discharge summaries also sit in Care Management.</div>`;
  };
  window.psyPastPdf=function(ai){
    const a=S.pastAdm[ai],p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid);
    psyPdf('Admission '+a.n+' · '+a.dates,`<h2>Admission ${hesc(String(a.n))} · ${hesc(a.dates)}</h2><div>${a.days} days · ${hesc(a.sec)} · ${hesc(a.psy)} · ${hesc(a.psych)}</div>
      <table style="margin-top:8px"><tr><th>Discharge diagnosis</th><th>Condition at discharge</th><th>Medicines at discharge</th></tr><tr><td>${hesc(a.dx)}</td><td>${hesc(a.cond)}</td><td>${a.meds.map(hesc).join('<br>')}</td></tr></table>
      <h2>Clinical notes</h2>${pastItems(a).map(noteHtml).join('')}<div style="margin-top:8px"><b>Plan last time:</b> ${hesc(a.plan)}</div>`,p);
  };

  /* ---------- Daily notes: PDF on Earlier notes ---------- */
  const __pd=pDaily;
  pDaily=function(){
    const h=__pd.apply(this,arguments);if(!psy())return h;
    return h.replace('<h3>Earlier notes</h3>','<h3>Earlier notes</h3><button class="btn sm" onclick="psyNotesPdf()">PDF</button>');
  };
  const notes=()=>(S.dnHist||DN_HIST);
  window.psyNotesPdf=function(){const p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid);psyPdf('Daily and round notes',`<h2>Daily and round notes</h2>${notes().map(noteHtml).join('')||'<div>No notes yet.</div>'}`,p);};

  /* ---------- Print file ---------- */
  /* ---------- Vitals and monitoring tab (Trello "Vitals and monitoring"): fewer charts, in this order ----------
     1 Medicine chart (the nursing chart)  2 Vitals  3 other monitoring (blood sugar, intake and output ...)  4 Lab reports (names that open the PDF).
     The nursing summary, the adherence-by-medicine table and the trend charts are gone. */
  window.psyLabPdf=function(id){
    const l=v3().labs.find(x=>x.id===id);if(!l)return;const f=V3.labFlag(l),p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid);
    psyPdf('Lab report · '+l.test,`<h2>${hesc(l.test)}</h2><table><tr><th>Collected</th><th>Result</th><th>Normal range</th><th>Flag</th></tr><tr><td>${hesc(V3.stamp(l.t))}</td><td><b>${hesc(String(l.val))}</b> ${hesc(l.unit||'')}</td><td>${hesc(String(l.lo))} to ${hesc(String(l.hi))}</td><td>${f==='crit'?'Critical':f==='abn'?(l.val<l.lo?'Low':'High'):'In range'}</td></tr></table>
      <div style="margin-top:10px">${l.rev?'Reviewed by '+hesc(l.rev.by)+' · '+hesc(V3.stamp(l.rev.t)):'Not reviewed yet'}${l.pdf?'<br>Attached report file: '+hesc(l.pdf):''}${l.by?'<br>Entered by '+hesc(l.by):''}</div>`,p);
  };
  function labReports(){
    const L=v3().labs.filter(l=>l.pid===S.pid).sort((a,b)=>b.t-a.t);
    return `<section class="card"><div class="hd"><div><h3>Lab reports</h3><div class="small muted" style="margin-top:4px">Tap a report to open the full report as a PDF.</div></div></div>
      ${L.length?L.map(l=>`<div class="li"><div class="grow"><div style="font-weight:600">${hesc(l.test)}</div><div class="tiny muted">${hesc(V3.stamp(l.t))}</div></div><button class="btn sm" onclick="psyLabPdf('${l.id}')">Open PDF</button></div>`).join(''):'<div class="pad small muted">No lab reports yet.</div>'}</section>`;
  }
  const __pv2=pVitals;
  pVitals=function(){
    const h=__pv2.apply(this,arguments);if(!psy())return h;
    const t=document.createElement('template');t.innerHTML=h;
    const kids=[...t.content.children],ttl=e=>((e.querySelector('h3')||e.querySelector('.lbl')||{}).textContent||'').trim();
    /* Anu (Trello, moved back to In-progress with a screenshot of the Medicines card): number 1 is the Medicines card, the same one as on Orders
       (current medicines with Add medicine and Stop, and the nursing chart right under it), not a bare chart. */
    let medHtml='';try{const t2=document.createElement('template');t2.innerHTML=pOrders();const m=[...t2.content.children].find(e=>ttl(e)==='Medicines');if(m)medHtml=m.outerHTML;}catch(e){}
    const order=[medHtml?'':'Medicine chart','Vitals','Scores','Monitoring orders','Blood sugar monitoring','Other monitoring by nurses'];
    const out=(medHtml?[medHtml]:[]).concat(order.flatMap(n=>n?kids.filter(e=>ttl(e).startsWith(n)).map(e=>e.outerHTML):[]));
    return out.length?out.join('')+labReports():h;
  };

  /* Trello "remove these boxes": the four summary boxes (Therapy sessions, Notes this week, Family calls, Group sessions) are gone from Therapy and family for the psychiatrist */
  const __pth=pTherapy;
  pTherapy=function(){
    let h=__pth.apply(this,arguments);if(!psy())return h;
    const a=h.indexOf('<div class="grid4">');if(a<0)return h;
    let depth=0,end=-1;const re=/<div\b|<\/div>/g;re.lastIndex=a;let m;
    while((m=re.exec(h))){depth+=m[0]==='</div>'?-1:1;if(depth===0){end=m.index+m[0].length;break;}}
    return end>a?h.slice(0,a)+h.slice(end):h;
  };

  /* ---------- Admission tab: numbered steps (transcripts: "step 1, 2, 3 like the consultation flow", not "front desk forms") ---------- */
  const cssAdm=document.createElement('style');cssAdm.id='psy-adm-steps-css';
  cssAdm.textContent=`
  .adm-steps{display:flex;list-style:none;margin:0;padding:20px 12px 16px;background:#fff;border:1px solid var(--line);border-radius:16px}
  .adm-step{flex:1;min-width:0;position:relative}
  .adm-step+.adm-step::before{content:'';position:absolute;left:-50%;right:50%;top:19px;height:3px;border-radius:99px;background:#e4e7ec}
  .adm-step.prevdone::before{background:#12b76a}
  .adm-step button{width:100%;border:0;background:none;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 6px;color:var(--ink)}
  .adm-n{position:relative;z-index:1;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;border:2px solid #d0d5dd;color:#667085;font-weight:700;font-size:15px}
  .adm-step.done .adm-n{background:#12b76a;border-color:#12b76a;color:#fff}
  .adm-step.warn .adm-n{background:#fffaeb;border-color:#f5a524;color:#b54708}
  .adm-step.sel .adm-n{border-color:var(--blue);box-shadow:0 0 0 4px var(--blue-tint)}.adm-step.sel.done .adm-n{background:#12b76a;border-color:#12b76a}
  .adm-k{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#98a2b3;margin-top:4px}
  .adm-t{font-weight:600;font-size:14px;line-height:1.3;text-align:center}
  .adm-step.sel .adm-t{color:var(--blue-ink)}
  .adm-s{font-size:12px;color:var(--muted)}.adm-step.done .adm-s{color:#067647}.adm-step.warn .adm-s{color:#b54708;font-weight:600}
  .adm-step button:hover .adm-n{border-color:var(--blue)}
  @media (max-width:760px){.adm-steps{flex-direction:column;gap:10px;padding:12px}.adm-step+.adm-step::before{display:none}.adm-step button{flex-direction:row;gap:12px;text-align:left;justify-content:flex-start}.adm-t{text-align:left}.adm-k{margin:0}}`;
  document.head.appendChild(cssAdm);
  const __pa3=pAdmission;
  pAdmission=function(){
    const h=__pa3.apply(this,arguments);if(!psy())return h;
    const t=document.createElement('template');t.innerHTML=h;
    const g=t.content.querySelector('.sumgrid');if(!g)return h;
    const boxes=[...g.querySelectorAll('.sbox.pick')];if(!boxes.length)return h;
    const names={'Front desk forms':'Admission forms'};
    const steps=boxes.map(b=>{const k=((b.getAttribute('onclick')||'').match(/admSec='(\w+)'/)||[])[1],chipEl=b.querySelector('.chip');
      const cls=chipEl?(chipEl.className.match(/c-(green|amber|grey|blue)/)||[])[1]:'grey',title=(b.querySelector('.lbl')||{}).textContent||'';
      return {k,title:names[title]||title,status:chipEl?chipEl.textContent:'',cls,desc:(b.querySelector('.tiny')||{}).textContent||'',sel:b.classList.contains('sel')};});
    const li=steps.map((x,i)=>`<li class="adm-step ${x.cls==='green'?'done':x.cls==='amber'?'warn':''} ${x.sel?'sel':''} ${i>0&&steps[i-1].cls==='green'?'prevdone':''}"><button onclick="S.admSec='${x.k}';render()" aria-current="${x.sel?'step':'false'}" title="${hesc(x.desc)}"><span class="adm-n">${x.cls==='green'?'✓':i+1}</span><span class="adm-k">Step ${i+1}</span><span class="adm-t">${hesc(x.title)}</span><span class="adm-s">${hesc(x.status)}</span></button></li>`).join('');
    const ol=document.createElement('ol');ol.className='adm-steps';ol.setAttribute('aria-label','Admission steps');ol.innerHTML=li;
    g.replaceWith(ol);return t.innerHTML;
  };

  /* Anu (Trello): "put Therapy and family before Forms to print and make the tab Therapy Plans". The role is fixed for the tab, so the shared tab list is
     changed once on the first render. */
  const __r42=render;
  render=function(){
    if(psy()&&!STAY.__psyTabs){
      const ti=STAY.findIndex(x=>x[0]==='therapy'),fi=STAY.findIndex(x=>x[0]==='forms');
      if(ti>=0&&fi>=0){const t=STAY.splice(ti,1)[0];t[1]='Therapy Plans';STAY.splice(STAY.findIndex(x=>x[0]==='forms'),0,t);}
      /* Anu: merge Preferences for admin and Grievances into one tab, renamed Patient Experience */
      const gi=STAY.findIndex(x=>x[0]==='griev');if(gi>=0)STAY.splice(gi,1);
      /* Anu (WhatsApp): the Orders tab also holds monitoring, vitals charting and plans such as ECT, so it is renamed Treatment Plan */
      const oi=STAY.find(x=>x[0]==='orders');if(oi)oi[1]='Treatment Plan';
      /* Forms to print tab removed (team: Print file replaces it) */
      const fi2=STAY.findIndex(x=>x[0]==='forms');if(fi2>=0)STAY.splice(fi2,1);
      const pi=STAY.find(x=>x[0]==='prefs');if(pi)pi[1]='Patient Experience';
      STAY.__psyTabs=true;
    }
    if(psy()&&/^#\/patient\/[^/]+\/griev$/.test(location.hash||'')){location.replace(location.hash.replace(/\/griev$/,'/prefs'));return;}
    if(psy()&&/^#\/patient\/[^/]+\/forms$/.test(location.hash||'')){location.replace(location.hash.replace(/\/forms$/,'/overview'));return;}
    const out=__r42.apply(this,arguments);
    if(psy())document.querySelectorAll('#view .lnk,#view button.tog').forEach(e=>{if(e.textContent.trim()==='Therapy and family')e.textContent='Therapy Plans';});
    return out;
  };

  /* the merged tab shows the preferences first, then the grievances */
  const __pp2=pPrefs;
  pPrefs=function(){const h=__pp2.apply(this,arguments);return psy()?h+'<div class="lbl" style="margin:10px 4px 0">Grievances</div>'+pGriev():h;};

  /* A signed history for a patient other than Neel is shown from what the record holds (the prototype stores no typed history). */
  function histFromRecord(){
    const p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid)||{},id=(window.ptIdentity&&ptIdentity(p))||{},al=(window.psyPx&&psyPx(S.pid).allergy)||null;
    const by=(S.team.psy||'')+(S.team.psych?' and '+S.team.psych:'');
    const meds=S.meds.map(m=>m.name+' · '+m.freq+(m.time?' · '+m.time:''));
    const past=(S.pastAdm||[]).map(a=>'Admission '+a.n+' ('+a.dates+'): '+a.dx+'. '+a.cond+'.');
    const secs=[
      ['Informant and reliability',(id.nr?id.nr+' ('+String(id.rel||'').toLowerCase()+'), nominated representative. ':'')+'Information adequate and consistent.'],
      ['Chief complaints and diagnosis',(S.dx||p.dx||'Not recorded')+(S.dxIcd?' · '+S.dxIcd:'')],
      ['Treatment history',past.length?past:'First admission. No earlier treatment recorded here.'],
      ['Current medicines',meds.length?meds:'None recorded'],
      ['Allergies',al?(al.list&&al.list.length?al.list.map(x=>x.drug+(x.rx?' ('+x.rx+')':'')).join(', '):'No known drug allergies'):'Not recorded'],
      ['Risk and legal status',(p.risk?'High risk flagged at admission. ':'No high-risk flag. ')+'Section '+(S.section||'89')+'.']
    ];
    return {by,secs};
  }
  window.psyHistView=function(){
    const d=histDoc();if(!d.n){toast('The detailed history is not written yet');return;}
    const signedNeel=S.pid==='neel',sc=signedNeel?{by:'Dr. Aanya Sharma, Priya Nair',secs:HREAD}:(S.historyStatus==='signed'?histFromRecord():{by:'Draft, not signed yet',secs:Object.keys(HDRAFT).filter(k=>HDRAFT[k]&&(!Array.isArray(HDRAFT[k])||HDRAFT[k].length)).map(k=>[k,HDRAFT[k]])});
    const p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid)||{};
    openModal(`<div class="mh"><div><h3>Detailed history · ${hesc(p.name||'')}</h3><div class="tiny muted" style="margin-top:2px">${signedNeel?'Signed 21 Oct · ':''}${hesc(sc.by)}</div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb" style="max-height:65vh;overflow:auto">${secList(sc.secs)}</div>
      <div class="mf"><button class="btn" onclick="closeModal();go('#/patient/'+S.pid+'/admission')">Open in Admission</button><button class="btn pri" onclick="closeModal();psyHistPdf()">PDF</button></div>`);
    $('modal').style.width='min(720px,100%)';
  };
  /* the Stay summary timeline: a signed Detailed history gets a View button */
  const __ov2=pOverview;
  pOverview=function(){
    const h=__ov2.apply(this,arguments);if(!psy())return h;
    if(!histDoc().n)return h;
    return h.replace(/(<div style="font-weight:600">Detailed history<\/div><div class="small muted">[^<]*<\/div>)/,(m)=>m+'<button class="btn sm" style="margin-top:6px;margin-right:6px" onclick="psyHistView()">View detailed history</button>');
  };

  /* Detailed history: the signed history (Neel's read view) or the AI-scribe draft; one place for the Print file list and the PDF button */
  function histDoc(){
    const secsHtml=secs=>`<h2>Detailed history</h2>${secs.map(([h,t,al])=>`<div class="n"><div class="m"><b>${hesc(h)}</b>${al?' · important':''}</div>${Array.isArray(t)?t.map(hesc).join('<br>'):hesc(t)}</div>`).join('')}`;
    if(S.pid==='neel'&&typeof HREAD!=='undefined')return {n:1,sub:'Signed 21 Oct · Dr. Aanya Sharma, Priya Nair',html:()=>secsHtml(HREAD)};
    if(S.historyStatus==='signed'){const sc=histFromRecord();return {n:1,sub:'Signed · '+sc.by,html:()=>secsHtml(sc.secs)};}
    if(S.historyDraft&&typeof HDRAFT!=='undefined'){
      const secs=Object.keys(HDRAFT).filter(k=>HDRAFT[k]&&(!Array.isArray(HDRAFT[k])||HDRAFT[k].length)).map(k=>[k,HDRAFT[k]]);
      if(secs.length)return {n:1,sub:'Draft, not signed yet',html:()=>secsHtml(secs)};
    }
    return {n:0,sub:'',html:()=>''};
  }
  window.psyHistPdf=function(){const d=histDoc();if(!d.n){toast('The detailed history is not written yet');return;}psyPdf('Detailed history',d.html(),ptFind(S.pid)||PTS.find(x=>x.id===S.pid));};
  const __pa2=pAdmission;
  pAdmission=function(){
    const h=__pa2.apply(this,arguments);if(!psy())return h;
    return h.replace('<button class="btn" onclick="toast(\'Saved as draft\')">Save draft</button>','<button class="btn" onclick="psyHistPdf()">PDF</button><button class="btn" onclick="toast(\'Saved as draft\')">Save draft</button>');
  };

  /* what the doctor can print, in three groups: Admission, Clinical, Discharge. A document that is not filled yet is listed but cannot be ticked. */
  const G_ADM=['admission-consent','form-e','form-c','high-risk-consent','capacity-assessment','psychiatric-history'];
  const G_DIS=['discharge-consent','discharge-summary','lama-consent'];
  const docs=()=>{
    const out=[],x=(window.psyPx&&psyPx(S.pid))||{};
    const add=(g,o)=>out.push(Object.assign({g},o));
    const al=x.allergy,rc=x.recon||{adm:[],admNone:false,dis:{},disExtra:[]};
    /* ---- Admission ---- */
    const ad=x.admDocs||[];
    add('Admission',{t:'Admission documents uploaded',sub:ad.length+' file'+(ad.length===1?'':'s')+' (names and details)',n:ad.length,
      html:()=>`<h2>Admission documents</h2><table><tr><th>Document</th><th>Type</th><th>Added by</th></tr>${ad.map(d=>`<tr><td>${hesc(d.name)}</td><td>${hesc(d.type||'')}</td><td>${hesc(d.by||'')} · ${hesc(d.at||'')}</td></tr>`).join('')}</table>`});
    const nAl=(al?1:0)+(rc.adm||[]).length;
    add('Admission',{t:'Allergies and medicines before admission',sub:nAl?'Recorded':'',n:nAl,
      html:()=>`<h2>Allergies</h2><div>${al?(al.list&&al.list.length?al.list.map(a=>hesc(a.drug)+(a.rx?' ('+hesc(a.rx)+')':'')).join(', '):'No known drug allergies'):'Not recorded'}</div><h2>Medicines before admission</h2>${(rc.adm||[]).length?`<table><tr><th>Medicine</th><th>Decision</th></tr>${rc.adm.map(m=>`<tr><td>${hesc(m.name)}</td><td>${hesc(m.dec||'')}</td></tr>`).join('')}</table>`:'<div>'+(rc.admNone?'None before admission':'Not recorded')+'</div>'}`});
    /* ---- forms, from the clinical documentation module ---- */
    let items=[];try{CD_DATA=cdLoad();items=cdItems(S.pid);}catch(e){}
    const formRows=(g,ids)=>{
      const done=items.filter(i=>ids.includes(i.form.id)&&i.submission);
      done.forEach(i=>add(g,{t:i.form.title,sub:'Filled '+(i.submission.submittedAt?new Date(i.submission.submittedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''),n:1,
        html:()=>{const src=(window.CD_TEMPLATES&&CD_TEMPLATES[i.form.template])||{};return `<h2>${hesc(i.form.title)}</h2><style>${src.css||''}</style>${i.submission.html||''}`;}}));
      ids.filter(id=>!done.some(i=>i.form.id===id)).forEach(id=>{const it=items.find(i=>i.form.id===id);if(it)add(g,{t:it.form.title,sub:'',n:0,fill:it.entryKey,html:()=>''});});
    };
    const hd=histDoc();add('Admission',{t:'Detailed history',sub:hd.sub,n:hd.n,html:hd.html});
    formRows('Admission',G_ADM);
    /* ---- Clinical ---- */
    add('Clinical',{t:'Daily and round notes',sub:notes().length+' note'+(notes().length===1?'':'s'),n:notes().length,
      html:()=>`<h2>Daily and round notes</h2>${notes().map(noteHtml).join('')}`});
    add('Clinical',{t:'Medicines (current and stopped)',sub:(S.meds.length+(S.medsOff||[]).length)+' medicines',n:S.meds.length+(S.medsOff||[]).length,
      html:()=>`<h2>Medicines</h2><table><tr><th>Medicine</th><th>Frequency</th><th>Started</th><th>Status</th></tr>${S.meds.map(m=>`<tr><td>${hesc(m.name)}</td><td>${hesc(m.freq)}</td><td>${hesc(m.at||'')} ${hesc(m.by||'')}</td><td>Ongoing</td></tr>`).concat((S.medsOff||[]).map(m=>`<tr><td>${hesc(m.name)}</td><td>${hesc(m.freq)}</td><td>${hesc(m.at||'')} ${hesc(m.by||'')}</td><td>Stopped ${hesc(m.offAt||'')} ${hesc(m.offBy||'')}${m.why?' · '+hesc(m.why):''}</td></tr>`)).join('')}</table>`});
    add('Clinical',{t:'Past admissions',sub:S.pastAdm.length+' admission'+(S.pastAdm.length===1?'':'s'),n:S.pastAdm.length,
      html:()=>S.pastAdm.map(a=>`<h2>Past admission ${hesc(String(a.n))} · ${hesc(a.dates)}</h2><div>${hesc(a.dx)} · ${hesc(a.cond)}</div>${pastItems(a).map(noteHtml).join('')}`).join('')});
    const rest=items.filter(i=>!G_ADM.includes(i.form.id)&&!G_DIS.includes(i.form.id));
    const restIds=[...new Set(rest.map(i=>i.form.id))];
    formRows('Clinical',restIds);
    /* ---- Discharge ---- */
    formRows('Discharge',G_DIS);
    const dn=(rc.disExtra||[]).length+Object.keys(rc.dis||{}).filter(k=>(rc.dis[k]||{}).d).length;
    add('Discharge',{t:'Discharge medicines check',sub:dn?dn+' decided':'',n:dn,
      html:()=>`<h2>Discharge medicines check</h2><table><tr><th>Medicine</th><th>Decision</th></tr>${Object.keys(rc.dis||{}).filter(k=>(rc.dis[k]||{}).d).map(k=>`<tr><td>${hesc(k)}</td><td>${hesc(rc.dis[k].d)}</td></tr>`).join('')}${(rc.disExtra||[]).map(m=>`<tr><td>${hesc(m.name)}</td><td>New at discharge${m.note?' · '+hesc(m.note):''}</td></tr>`).join('')}</table>`});
    return out;
  };
  window.psyPrintOpen=function(){
    const d=docs();window.__ppDocs=d;
    let last='';
    const rows=d.map((x,i)=>{
      const head=x.g!==last?`<div class="lbl" style="margin:10px 2px 2px">${hesc(x.g)}</div>`:'';last=x.g;
      /* the Forms to print tab is gone (team decision): a form that is not filled yet has a Fill in button here, so filling and printing live in one place */
      return head+`<div class="pp-r"><label class="${x.n?'':'dis'}"><input type="checkbox" class="ppc" data-i="${i}" ${x.n?'':'disabled'} onchange="psyPrintSync()"><span><b>${hesc(x.t)}</b><span class="tiny muted">${hesc(x.n?x.sub:'Not filled yet')}</span></span></label>${x.fill?`<button class="btn sm" onclick="closeModal();psyDocOpen('${hesc(x.fill)}')">Fill in</button>`:''}</div>`;}).join('');
    openModal(`<div class="mh"><div><h3>Print file</h3><div class="tiny muted" style="margin-top:2px">Pick what to print. Only filled documents can be ticked, never blank forms. A form that is not filled yet has a Fill in button.</div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb" style="max-height:60vh;overflow:auto"><div class="pp-sel"><label class="pp-all"><input type="checkbox" id="ppAll" onchange="psyPrintAll(this.checked)"><span><b>Select all</b></span></label>${rows}</div></div>
      <div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="ppGo" onclick="psyPrintRun()" disabled>Make PDF</button></div>`);
  };
  window.psyPrintAll=function(on){document.querySelectorAll('.ppc:not(:disabled)').forEach(c=>c.checked=on);psyPrintSync();};
  window.psyPrintSync=function(){
    const all=[...document.querySelectorAll('.ppc:not(:disabled)')],n=all.filter(c=>c.checked).length;
    const a=document.getElementById('ppAll');if(a)a.checked=all.length>0&&n===all.length;
    const g=document.getElementById('ppGo');if(g)g.disabled=!n;
  };
  window.psyPrintRun=function(){
    const d=window.__ppDocs||[],sel=[...document.querySelectorAll('.ppc:checked')].map(c=>d[+c.dataset.i]).filter(Boolean);
    if(!sel.length){toast('Tick at least one document');return;}
    const p=ptFind(S.pid)||PTS.find(x=>x.id===S.pid);closeModal();
    psyPdf('Patient file',sel.map(x=>x.html()).join(''),p);
  };

  const __ch=compactHeader;
  compactHeader=function(){
    const h=__ch.apply(this,arguments);if(!psy())return h;
    return h.replace('<div class="tiny muted" style="text-align:center">Expected discharge','<button class="btn soft" onclick="psyPrintOpen()">Print file</button><div class="tiny muted" style="text-align:center">Expected discharge');
  };
})();
