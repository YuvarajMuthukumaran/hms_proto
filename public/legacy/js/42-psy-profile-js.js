
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
      ids.filter(id=>!done.some(i=>i.form.id===id)).forEach(id=>{const it=items.find(i=>i.form.id===id);if(it)add(g,{t:it.form.title,sub:'',n:0,html:()=>''});});
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
      return head+`<label class="${x.n?'':'dis'}"><input type="checkbox" class="ppc" data-i="${i}" ${x.n?'':'disabled'} onchange="psyPrintSync()"><span><b>${hesc(x.t)}</b><span class="tiny muted">${hesc(x.n?x.sub:'Not filled yet')}</span></span></label>`;}).join('');
    openModal(`<div class="mh"><div><h3>Print file</h3><div class="tiny muted" style="margin-top:2px">Pick what to print. Only filled documents can be ticked; blank forms are never printed.</div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
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
