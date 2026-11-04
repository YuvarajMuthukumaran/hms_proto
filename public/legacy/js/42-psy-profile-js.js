
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
  const docs=()=>{
    const out=[];
    out.push({k:'notes',t:'Daily and round notes',sub:notes().length+' note'+(notes().length===1?'':'s'),n:notes().length,
      html:()=>`<h2>Daily and round notes</h2>${notes().map(noteHtml).join('')}`});
    out.push({k:'meds',t:'Medicines (current and stopped)',sub:(S.meds.length+(S.medsOff||[]).length)+' medicines',n:S.meds.length+(S.medsOff||[]).length,
      html:()=>`<h2>Medicines</h2><table><tr><th>Medicine</th><th>Frequency</th><th>Started</th><th>Status</th></tr>${S.meds.map(m=>`<tr><td>${hesc(m.name)}</td><td>${hesc(m.freq)}</td><td>${hesc(m.at||'')} ${hesc(m.by||'')}</td><td>Ongoing</td></tr>`).concat((S.medsOff||[]).map(m=>`<tr><td>${hesc(m.name)}</td><td>${hesc(m.freq)}</td><td>${hesc(m.at||'')} ${hesc(m.by||'')}</td><td>Stopped ${hesc(m.offAt||'')} ${hesc(m.offBy||'')}${m.why?' · '+hesc(m.why):''}</td></tr>`)).join('')}</table>`});
    out.push({k:'past',t:'Past admissions',sub:S.pastAdm.length+' admission'+(S.pastAdm.length===1?'':'s'),n:S.pastAdm.length,
      html:()=>S.pastAdm.map(a=>`<h2>Past admission ${hesc(String(a.n))} · ${hesc(a.dates)}</h2><div>${hesc(a.dx)} · ${hesc(a.cond)}</div>${pastItems(a).map(noteHtml).join('')}`).join('')});
    let subs=[];try{CD_DATA=cdLoad();subs=CD_DATA.submissions.filter(x=>x.pid===S.pid);}catch(e){}
    subs.forEach((s,i)=>out.push({k:'form'+i,t:(s.title||s.formTitle||'Filled form')+'',sub:'Filled '+(s.submittedAt?new Date(s.submittedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''),n:1,
      html:()=>{const src=(window.CD_TEMPLATES&&CD_TEMPLATES[s.template])||{};return `<h2>${hesc(s.title||s.formTitle||'Form')}</h2><style>${src.css||''}</style>${s.html||''}`;}}));
    return out;
  };
  window.psyPrintOpen=function(){
    const d=docs();window.__ppDocs=d;
    const rows=d.map((x,i)=>`<label class="${x.n?'':'dis'}"><input type="checkbox" class="ppc" data-i="${i}" ${x.n?'':'disabled'} onchange="psyPrintSync()"><span><b>${hesc(x.t)}</b><span class="tiny muted">${hesc(x.n?x.sub:'Nothing filled yet')}</span></span></label>`).join('');
    openModal(`<div class="mh"><div><h3>Print file</h3><div class="tiny muted" style="margin-top:2px">Pick what to print. Only filled documents are included, never blank forms.</div></div><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>
      <div class="mb"><div class="pp-sel"><label class="pp-all"><input type="checkbox" id="ppAll" onchange="psyPrintAll(this.checked)"><span><b>Select all</b></span></label>${rows}</div></div>
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
