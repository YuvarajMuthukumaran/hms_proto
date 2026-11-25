/* 25 Nov 2026 (owner, with the MHCA "Capacity Assessment Guidance Document" form, PDF 13 pp. 4-7): Generate PDF for the capacity
   assessment prints in the Tulasi format (letterhead of the discharge summary, block 146) from the on-screen form's answers (block 196,
   values m196ca.<key>), not over the scanned paper pages. Same questions, order and skip rules as the original form. All roles. */
(function(){
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const Q=[
    ['0','Obvious lack of capacity','Is he/she in a condition where no meaningful conversation is possible (violent, excited, catatonic, stuporous, delirious, under alcohol or substance intoxication, severe withdrawal, or any other)?'],
    ['1a','1. Understanding the information that is relevant to take a decision on the treatment or admission or personal assistance','a. Is the individual oriented to time, place and person?'],
    ['1b','','b. Has he/she been provided relevant information about mental healthcare and treatment pertaining to the illness in question?'],
    ['1c','','c. Is he/she able to follow simple commands like (i) show your tongue (ii) close your eyes?'],
    ['1d','','d. Does he/she acknowledge that he/she has a mental illness?'],
    ['2a','2. Appreciating reasonably foreseeable consequence of a decision or lack of decision on the treatment or admission or personal assistance','a. Does the individual agree to receive treatment suggested by the treating team?'],
    ['2b','','b. Does he/she explain why he/she has agreed to receive treatment?'],
    ['2c','','c. Does he/she explain why he/she does not agree to receive treatment?'],
    ['3a','3. Communicating the decision by means of speech, expression, gesture or any other means','a. Is the individual able to communicate his/her decision by means of speech, writing, expression, gesture or any other means?']];
  function skip(g){const s={};
    if(g('0')==='Yes')['1a','1b','1c','1d','2a','2b','2c','3a'].forEach(k=>s[k]='Not needed: obvious lack of capacity');
    else{const a=g('2a');if(a==='Yes')s['2c']='Not needed: 2a is yes';if(a==='No')s['2b']='Not needed: 2a is no';if(a==='Cannot assess')s['2b']=s['2c']='Not needed: 2a cannot be assessed';}
    return s;}
  function capPrint(p,item,v){
    const g=k=>v['m196ca.'+k]||'',sk=skip(g),nm=g('name')||p.name||'',uhid=g('uhid')||p.uhid||'';
    const kv=(l,x)=>`<div><span>${E(l)}</span><b>${E(x||'-')}</b></div>`;
    const pill=(x,opts)=>opts.map(o=>`<span class="p${x===o?' y':''}">${E(o)}</span>`).join('');
    let last='';
    const qs=Q.map(q=>{const [k,sec,t]=q,h=sec&&sec!==last?`<h3>${E(sec)}</h3>`:'';if(sec)last=sec;
      const opts=k==='0'||k==='1b'?['Yes','No']:['Yes','No','Cannot assess'];
      return h+`<div class="q${sk[k]?' sk':''}"><div class="qt">${E(t)}</div>${sk[k]?`<div class="na">${E(sk[k])}</div>`:`<div class="an">${pill(g(k),opts)}</div><div class="ex"><span>${k==='1b'?'If no, explanation':'Explanation'}</span>${E(g(k+'x'))||'&nbsp;'}</div>`}</div>`
        +(k==='0'?'<div class="hint">If yes, go to 4. If no, go to 1.</div>':k==='2a'?'<div class="hint">If yes, go to 2b. If no, go to 2c. If cannot assess, go to 3.</div>':'');}).join('');
    const c=g('c4'),es=v.__esign||{};
    const opt=(l,t)=>`<div class="c4${c===l?' on':c?' off':''}"><b>4${l.toLowerCase()}.</b> ${E(t)}</div>`;
    const sgImg=es.sig?`<img src="${E(es.sig)}" alt="Signature">`:'';
    const body=`<h3>Details</h3><div class="grid">${kv('Date of assessment',g('date'))}${kv('Time',g('time'))}${kv('Place of assessment',g('place'))}${kv('Purpose of this assessment',g('purpose'))}
        ${kv('Advance directive',g('ad'))}${kv('Nominated representative',g('nr'))}${kv('NR ID',g('nrid'))}${kv('Diagnosis (provisional)',g('dx'))}</div>
      <p class="sm">If admitted under Section 102/103 of MHA, 2017 the rest of the assessment can happen in the ward. Explanation is given for each question.</p>
      ${qs}
      <h3>4. Conclusion</h3><p>Based on the examination and relevant history, behavioural observation, clinical findings and mental status examination findings noted in the medical records, I believe that Mr./Ms. <b>${E(nm)}</b>:</p>
      ${opt('A','Has capacity for treatment decisions including admission')}${opt('B','Needs 100 % support from his/her nominated representative in making treatment decisions including admission')}
      <div class="sgn"><div><div class="sl">${sgImg}</div><b>${E(g('doc')||es.by||'')}</b><span>Name and signature of the Psychiatrist / Mental Health Professional / Medical Practitioner</span></div><div></div></div>
      ${c!=='B'?`<h3>5. Fill if the choice is 4a</h3><p><i>I, Mr./Ms. <b>${E(nm)}</b>, agree to make decisions in respect of my mental healthcare and treatment.</i></p>
        <div class="sgn"><div><div class="sl"></div><span>Signature of the assessed person</span></div><div><div class="sl nm">${E(nm)}</div><span>Name of the assessed person</span></div></div>`:''}
      ${c!=='A'?`<h3>6. Fill if the choice is 4b</h3><p><i>I, Mr./Ms. <b>${E(g('nr')||'____________________')}</b>, the nominated representative of Mr./Ms. <b>${E(nm)}</b>, agree to make decisions with respect of his/her treatment.</i></p>
        <div class="sgn"><div><div class="sl"></div><span>Signature of the Nominated Representative</span></div><div><div class="sl nm">${E(g('nr'))}</div><span>Name of the Nominated Representative</span></div></div>`:''}`;
    const w=window.open('','_blank');if(!w){toast('Allow pop-ups to generate the PDF');return;}
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Capacity assessment - ${E(nm)} - ${E(uhid)}</title><style>
      body{font:12px/1.5 Arial,Helvetica,sans-serif;color:#222;margin:28px 40px}
      .top{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:start;border-bottom:1.5px solid #999;padding-bottom:10px}
      .addr{font-size:11px}.addr p{margin:0 0 8px}.brand{text-align:center}.brand img{height:58px}.brand h1{color:#1f3c88;font-size:24px;margin:2px 0 0}.brand i{font-size:12px}
      .ds{text-align:right}.ds h2{font-size:15px;letter-spacing:.5px;margin:0 0 10px}.ds span{display:block;color:#666;font-size:11px}.ds b{display:block;margin-bottom:6px}
      .pt,.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 14px;padding:10px 0}.pt{border-bottom:1.5px solid #999}.pt span,.grid span{display:block;color:#666;font-size:10.5px;font-weight:700;text-transform:uppercase}.pt b{font-size:12.5px;text-transform:uppercase}.grid b{font-size:12.5px}
      .sub{text-align:center;margin:10px 0 0;font-size:11px;color:#555}
      h3{color:#1f3c88;font-size:14px;margin:16px 0 4px}.sm{font-size:11px;color:#555;margin:2px 0}
      .q{padding:6px 0 8px;border-bottom:1px solid #e3e7ee;break-inside:avoid}.qt{font-weight:600}.an{margin:4px 0}.p{display:inline-block;border:1px solid #bbb;border-radius:10px;padding:0 9px;margin-right:4px;font-size:10.5px;color:#aaa}.p.y{background:#1f3c88;border-color:#1f3c88;color:#fff;font-weight:700}
      .ex{font-size:11.5px;min-height:16px}.ex span{color:#666;font-size:10.5px;margin-right:6px}.sk .qt{color:#999;font-weight:400}.na{font-size:11px;color:#999;font-style:italic}.hint{font-size:11px;color:#555;font-style:italic;margin:4px 0}
      .c4{border:1px solid #c8cfd8;border-radius:6px;padding:6px 10px;margin:6px 0}.c4.on{border:1.5px solid #1f3c88;background:#eef3fb;font-weight:600}.c4.off{text-decoration:line-through;color:#999}
      .sgn{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:22px;font-size:11.5px;break-inside:avoid}.sl{border-bottom:1px solid #333;height:48px;margin-bottom:4px;display:flex;align-items:flex-end}.sl img{max-height:46px}.sl.nm{font-weight:700}.sgn b{display:block}.sgn span{display:block;color:#555}
      .foot{border-top:1.5px solid #999;margin-top:24px;padding-top:8px;text-align:center;font-size:10.5px;color:#666}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}@media print{body{margin:10mm 12mm}}</style></head><body>
      <div class="top"><div class="addr"><p>Sector-64, Opp: M3M Urbana,<br>Gurgaon - 122102</p><p>2/6 Sarvpriya Vihar, Near Hauzkhas Metro,<br>New Delhi - 110016</p><p><b>Appointments:8800000255</b></p></div>
        <div class="brand"><img src="${location.origin}/logo.png" alt=""><h1>Tulasi Healthcare</h1><i>Psychiatric &amp; Rehabilitation Care</i></div>
        <div class="ds"><h2>CAPACITY ASSESSMENT</h2><span>UHID/MR NO.</span><b>${E(uhid||'-')}</b><span>DATE OF ASSESSMENT</span><b>${E(g('date')||'-')}</b></div></div>
      <div class="sub">Capacity Assessment for Treatment decisions including Admission (as per Section 81 of the Mental Healthcare Act, 2017)</div>
      <div class="pt">${kv('Name of the patient',nm)}${kv('Age',g('age')||p.age)}${kv('Sex',g('sex')||p.sex)}${kv('Patient ID No',uhid)}</div>
      ${body}<div class="foot">Tulasi Healthcare · Capacity assessment as per the MHCA 2017 guidance document</div>
      <script>window.onload=function(){setTimeout(function(){print();},350);};<\/script></body></html>`);
    w.document.close();
  }
  const __p=cdfPrint;
  cdfPrint=function(){
    try{const {p,item,meta}=cdfCurrent();
      if(meta&&item&&item.form&&item.form.id==='capacity-assessment'){const sub=item.submission,v=sub&&!S.cdEditing?(sub.values||{}):cdfVals(item.entryKey);capPrint(p||{},item,v||{});return;}}catch(e){}
    return __p.apply(this,arguments);};
})();
