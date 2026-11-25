/* 196 · 24 Nov meeting: consent forms reformatted one by one (all roles that open these forms).
   Each form: read-only pages folded behind a "Show" bar, checklists cut out of the scanned pages and shown as one
   on-screen table, saved in the same form record (so the e-sign, print and saved data stay as they were).
   - MECT (mect-final): information sheet pages 1 to 4 folded; MECT checklist (192 cuts it out of pages 4 and 5)
     with Yes / No per row (`m196<part><row>` = 'y' / 'n', MMSE score in `p5f1`); old on-image boxes still read.
   - Admission terms (adm-terms): terms 9 to 25 (pages 5 and 6, no blanks) folded; documents checklist cut out of
     page 8, ticked on screen (`m196doc1..3` = '✓'). */
(function(){
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const cur=()=>String((typeof S!=='undefined'&&S.cdEntryKey)||'').split('|')[1]||'';
  const vals=fid=>{try{return cur()===fid?cdfVals(S.cdEntryKey):{};}catch(e){return {};}};

  /* ---- MECT checklist ---- */
  const MR={pre:['Capacity assessment form','Admission consent form signed by patient / NR for IPD patient',
      'MECT education material with consent form signed by patient / NR and two psychiatrists',
      'Anaesthesia consent form signed by patient / NR and one family member (legal guardian)',
      'PAC and pre MECT work-up (routine and special tests, ECG, fundus examination) checked by RMO','MMSE score']};
  /* 25 Nov (Anu): Peri-MECT and Post-MECT rows removed; each session is recorded in the MECT order's ECT sessions (block 198) */
  const MH={pre:'Pre-ECT assessment',peri:'Peri-MECT assessment',post:'Post-MECT assessment'},OLD={peri:'Peri-MECT',post:'Post-MECT'};
  const mget=(v,p,i)=>{const k='m196'+p+(i+1);if(v[k])return v[k];const o=OLD[p];if(o){if(v['m24'+o+i+'y'])return 'y';if(v['m24'+o+i+'n'])return 'n';}return '';};
  function mectHtml(ed){
    const v=vals('mect-final');let done=0,all=0;
    const body=Object.keys(MR).map(p=>`<tr class="m196-h"><th colspan="2">${MH[p]}${p==='peri'?'<small>Seizure threshold checked by the administering person; any events filled in a separate form</small>':''}</th><th>Yes</th><th>No</th></tr>`
      +MR[p].map((t,i)=>{const a=mget(v,p,i);all++;if(a)done++;
        const b=(x,l)=>`<button type="button" class="m196-b${a===x?' on '+x:''}"${ed?` onclick="m196Set('${p}',${i},'${x}')"`:' disabled'} aria-pressed="${a===x}">${l}</button>`;
        const mm=p==='pre'&&i===5?` <input class="m196-mm" type="text" inputmode="numeric" placeholder="Score /30" value="${esc(v.p5f1||'')}"${ed?` oninput="cdfSet('p5f1',this.value,null)"`:' disabled'}>`:'';
        return `<tr><td class="n">${i+1}</td><td>${esc(t)}${mm}</td><td>${b('y','Yes')}</td><td>${b('n','No')}</td></tr>`;}).join('')).join('');
    return `<div class="m196-top"><b>MECT checklist</b><span>Filled by the doctor · ${done} of ${all} answered</span></div><table class="m196-t">${body}</table>`;
  }
  window.m196Set=function(p,i,x){if(cur()!=='mect-final')return;const v=vals('mect-final');cdfSet('m196'+p+(i+1),mget(v,p,i)===x?'':x,null);redraw();};

  /* ---- Admission terms: documents checklist ---- */
  const DOCS=['Two passport size recent photographs','Proof of permanent address (PAN card, driving licence, election card, passport, Aadhaar card, bank passbook)','Proof of correspondence address'];
  function docHtml(ed){
    const v=vals('adm-terms');const n=DOCS.filter((t,i)=>v['m196doc'+(i+1)]).length;
    return `<div class="m196-top"><b>Documents required at the time of admission</b><span>${n} of ${DOCS.length} received</span></div><table class="m196-t">`
      +DOCS.map((t,i)=>{const on=!!v['m196doc'+(i+1)];return `<tr><td class="n">${i+1}</td><td>${esc(t)}</td><td style="width:110px;text-align:right"><button type="button" class="m196-b${on?' on y':''}"${ed?` onclick="m196Doc(${i})"`:' disabled'} aria-pressed="${on}">${on?'✓ Received':'Received'}</button></td></tr>`;}).join('')+'</table>';
  }
  window.m196Doc=function(i){if(cur()!=='adm-terms')return;const k='m196doc'+(i+1);cdfSet(k,vals('adm-terms')[k]?'':'✓',null);redraw();};

  /* ---- Capacity assessment: the whole form on screen (the paper blanks sat on the printed questions) ---- */
  const CA='capacity-assessment',YNC=['Yes','No','Cannot assess'],YN=['Yes','No'];
  const CAQ=[
    ['0','Obvious lack of capacity','Is he/she in a condition where no meaningful conversation is possible (violent, excited, catatonic, stuporous, delirious, under alcohol or substance intoxication, severe withdrawal, or any other)?',YN,'If yes, go to 4. If no, go to 1.'],
    ['1a','1 · Understanding the information relevant to a decision on treatment, admission or personal assistance','A. Is the individual oriented to time, place and person?',YNC],
    ['1b','','B. Has he/she been provided relevant information about mental healthcare and treatment for the illness in question?',YN],
    ['1c','','C. Is he/she able to follow simple commands, like (i) show your tongue (ii) close your eyes?',YNC],
    ['1d','','D. Does he/she acknowledge that he/she has a mental illness?',YNC],
    ['2a','2 · Appreciating reasonably foreseeable consequences of a decision or lack of decision on treatment, admission or personal assistance','A. Does the individual agree to receive the treatment suggested by the treating team?',YNC,'If yes, go to 2B. If no, go to 2C. If cannot assess, go to 3.'],
    ['2b','','B. Does he/she explain why he/she has agreed to receive treatment?',YNC],
    ['2c','','C. Does he/she explain why he/she does not agree to receive treatment?',YN],
    ['3a','3 · Communicating the decision by speech, expression, gesture or any other means','A. Is the individual able to communicate his/her decision by speech, writing, expression, gesture or any other means?',YNC]];
  const CAD=[['name','Name of the patient',6],['age','Age',2],['sex','Sex',2],['uhid','Patient ID No',2],['date','Date of assessment',3],['time','Time',3],['place','Place of assessment',6],
    ['nr','Nominated representative: Name',6],['nrid','ID',3],['dx','Diagnosis (provisional)',3]];
  const CAL={name:'Name of the patient',age:'Age',sex:'Sex',uhid:'UHID',date:'Date',time:'Time',place:'Place of assessment',nr:'Nominated representative name',dx:'Diagnosis',doc:'Name of the psychiatrist'};
  const ck=k=>'m196ca.'+k;
  function caSkip(v){const s={},g=k=>v[ck(k)]||'';
    if(g('0')==='Yes')['1a','1b','1c','1d','2a','2b','2c','3a'].forEach(k=>s[k]='Obvious lack of capacity: go to 4');
    else{const a=g('2a');if(a==='Yes')s['2c']='2A is yes';if(a==='No')s['2b']='2A is no';if(a==='Cannot assess'){s['2b']=s['2c']='2A cannot assess: go to 3';}}
    return s;}
  function caPrefill(v){const key=S.cdEntryKey,pid=String(key).split('|')[0],clr=v.__clr||{};let p=null;
    try{p=((typeof PTS!=='undefined'&&PTS)||[]).find(x=>x.id===pid)||(typeof ptFind==='function'&&ptFind(pid));}catch(e){}if(!p)return;
    const ep=((typeof CD_DATA!=='undefined'&&CD_DATA.episodes)||{})[pid]||{};let ch=false;
    Object.keys(CAL).forEach(k=>{if(v[ck(k)]||clr[ck(k)])return;let a='';try{a=k==='doc'?((ptCtxOf(pid)||{}).team||{}).psy||'':cdfAuto(CAL[k],p,ep)||'';}catch(e){}if(a){v[ck(k)]=a;ch=true;}});
    if(ch){try{cdfTouch(key);}catch(e){}}}
  function caHtml(ed){
    const v=vals(CA);if(ed)caPrefill(v);const g=k=>v[ck(k)]||'',sk=caSkip(v);
    const inp=(k,ph,wide)=>`<input class="m196-in${wide?' w':''}" value="${esc(g(k))}" placeholder="${esc(ph||'')}"${ed?` oninput="m196CaSet('${k}',this.value)"`:' disabled'}>`;
    const btns=(k,opts)=>opts.map(o=>`<button type="button" class="m196-b${g(k)===o?' on '+(o==='Yes'?'y':o==='No'?'n':'c'):''}"${ed?` onclick="m196CaPick('${k}','${o}')"`:' disabled'} aria-pressed="${g(k)===o}">${o}</button>`).join('');
    let need=0,done=0;
    const det=`<div class="m196-grid">${CAD.map(d=>`<label style="grid-column:span ${d[2]}"><span>${d[1]}</span>${inp(d[0])}</label>`).join('')}
      <div style="grid-column:span 6"><span>Purpose of this assessment</span><div class="m196-row">${btns('purpose',['Admission','Treatment','Advance directive','Any other'])}</div></div>
      <div style="grid-column:span 6"><span>Advance directive</span><div class="m196-row">${btns('ad',['Present','Absent'])}</div></div></div>
      <p class="m196-note">If admitted under Section 102/103 of MHA 2017, the rest of the assessment can happen in the ward. Provide an explanation for each question.</p>`;
    let last='';
    const qs=CAQ.map(q=>{const [k,sec,t,opts,hint]=q,s=sk[k];if(!s){need++;if(g(k))done++;}
      const h=sec&&sec!==last?`<h4 class="m196-sec">${esc(sec)}</h4>`:'';if(sec)last=sec;
      return h+`<div class="m196-q${s?' skip':''}"><div class="m196-qt">${esc(t)}${hint?`<small>${esc(hint)}</small>`:''}${s?`<small class="sk">Not needed · ${esc(s)}</small>`:''}</div>
        <div class="m196-row">${btns(k,opts)}</div>${inp(k+'x',k==='1b'?'If no, provide explanation':'Explanation',1)}</div>`;}).join('');
    need++;if(g('c4'))done++;
    const nm=g('name')||'the patient',nr=g('nr')||'';
    const concl=`<h4 class="m196-sec">4 · Conclusion</h4><p class="m196-note">Based on the examination and relevant history, behavioural observation, clinical findings and mental status examination findings noted in the medical records, I believe that ${esc(nm)}:</p>
      <div class="m196-row col">${[['A','Has capacity for treatment decisions including admission'],['B','Needs 100% support from his/her nominated representative in making treatment decisions including admission']].map(o=>`<button type="button" class="m196-b wide${g('c4')===o[0]?' on y':''}"${ed?` onclick="m196CaPick('c4','${o[0]}')"`:' disabled'}><b>4${o[0]}</b> ${o[1]}</button>`).join('')}</div>
      ${g('c4')==='A'?`<div class="m196-st"><b>5 · Patient's statement (4A)</b><br>I, ${esc(nm)}, agree to make decisions in respect of my mental healthcare and treatment. <i>The patient signs with Collect e-signature.</i></div>`:''}
      ${g('c4')==='B'?`<div class="m196-st"><b>6 · Nominated representative's statement (4B)</b><br>I, ${esc(nr||'__________')}, the nominated representative of ${esc(nm)}, agree to make decisions with respect of his/her treatment. <i>The nominated representative signs with Collect e-signature.</i></div>`:''}
      <div class="m196-grid" style="margin-top:12px"><label style="grid-column:span 6"><span>Name of the psychiatrist / mental health professional / medical practitioner</span>${inp('doc')}</label></div>
      ${v.__esign&&v.__esign.sig?`<div class="m196-sig"><img src="${esc(v.__esign.sig)}" alt="Signature"><small>Signed by ${esc(v.__esign.by||'')}${v.__esign.as?' ('+esc(v.__esign.as)+')':''} · ${esc(v.__esign.at||'')}</small></div>`:''}`;
    return `<div class="m196-top"><b>Capacity assessment for treatment decisions including admission</b><span>${done} of ${need} answered</span></div>${det}${qs}${concl}`;
  }
  window.m196CaSet=function(k,val){if(cur()!==CA)return;cdfSet(ck(k),val,null);};
  window.m196CaPick=function(k,o){if(cur()!==CA)return;const v=vals(CA);cdfSet(ck(k),v[ck(k)]===o?'':o,null);redraw();};

  const FORMS={
    'capacity-assessment':{fold:[1,2,3,4],np:1,bar:'<b>Paper layout</b> · the same form as 4 scanned pages, for reference',what:'paper layout',ck:caHtml,before:1,ckFirst:1,list:1},
    'mect-final':{fold:[1,2,3,4],bar:'<b>Information sheet</b> · pages 1 to 4, read only, for the patient and family',what:'information sheet',ck:mectHtml,before:5},
    'adm-terms':{fold:[5,6],bar:'<b>Terms 9 to 25</b> · pages 5 and 6, read only (fees, belongings, safety, tests, rules)',what:'terms 9 to 25',ck:docHtml,after:8}};

  function redraw(){document.querySelectorAll('.m196-ck').forEach(el=>{const F=FORMS[el.dataset.fid];if(F)el.innerHTML=F.ck(el.dataset.ed==='1');});}

  const css=document.createElement('style');
  css.textContent='.m196-ck{background:#fff;border:1px solid #d0d5dd;border-radius:10px;padding:14px 16px;margin:0 auto 12px;box-sizing:border-box}'
    +'.m196-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px}.m196-top b{font-size:15px}.m196-top span{font-size:12.5px;color:#667085}'
    +'.m196-t{width:100%;border-collapse:collapse;font-size:13.5px}.m196-t td,.m196-t th{border-bottom:1px solid #eaecf0;padding:7px 8px;text-align:left;vertical-align:middle}'
    +'.m196-t td.n{width:22px;color:#667085}.m196-h~tr td:nth-child(3),.m196-h~tr td:nth-child(4),.m196-h th:nth-child(2),.m196-h th:nth-child(3){width:62px;text-align:center}'
    +'.m196-h th{background:#f2f4f7;font-weight:700;color:#101828}.m196-h th small{display:block;font-weight:400;color:#475467;font-size:12px;margin-top:2px}'
    +'.m196-b{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer;min-width:46px}'
    +'.m196-b.on.y{background:#dcfae6;border-color:#47cd89;color:#067647;font-weight:700}.m196-b.on.n{background:#fee4e2;border-color:#f97066;color:#b42318;font-weight:700}.m196-b:disabled{cursor:default}'
    +'.m196-mm{margin-left:10px;width:96px;padding:4px 8px;border:1px solid #d0d5dd;border-radius:6px;font:inherit;font-size:13px}'
    +'.m196-fb{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#f8f9fc;border:1px solid #d0d5dd;border-radius:10px;padding:10px 14px;margin:0 auto 12px;box-sizing:border-box;font-size:13.5px}'
    +'.m196-fb button{border:1px solid #d0d5dd;background:#fff;border-radius:6px;padding:5px 12px;font:inherit;cursor:pointer;white-space:nowrap}'
    +'.m196-fold.m196-shut{display:none!important}'
    +'.m196-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:10px 12px;margin:6px 0 4px}.m196-grid label,.m196-grid>div{display:flex;flex-direction:column;gap:4px;min-width:0}.m196-grid span{font-size:12.5px;color:#344054;font-weight:600}'
    +'.m196-in{padding:6px 9px;border:1px solid #d0d5dd;border-radius:6px;font:inherit;font-size:13.5px;min-width:0;background:#eaf4ff}.m196-in.w{width:100%;box-sizing:border-box;margin-top:6px;background:#fff}.m196-in:focus{outline:2px solid #1e6cdb;background:#fff}'
    +'.m196-row{display:flex;gap:6px;flex-wrap:wrap}.m196-row.col{flex-direction:column;align-items:stretch}.m196-b.wide{text-align:left;padding:8px 12px;font-size:13.5px}.m196-b.on.c{background:#fef0c7;border-color:#fdb022;color:#93370d;font-weight:700}'
    +'.m196-note{font-size:12.5px;color:#475467;margin:8px 0}.m196-sec{font-size:14px;margin:16px 0 6px;color:#101828;border-top:1px solid #eaecf0;padding-top:12px}'
    +'.m196-q{display:grid;grid-template-columns:1fr auto;gap:6px 14px;align-items:start;padding:8px 0;border-bottom:1px dashed #eaecf0}.m196-q .m196-in.w{grid-column:1/-1;margin-top:0}.m196-qt{font-size:13.5px;color:#101828}.m196-qt small{display:block;color:#667085;font-size:12px;margin-top:2px}.m196-qt small.sk{color:#b54708}'
    +'.m196-q.skip{opacity:.5}.m196-st{background:#f8f9fc;border:1px solid #d0d5dd;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:13.5px;line-height:1.5}.m196-st i{color:#667085;font-size:12.5px}'
    +'.m196-sig{margin-top:10px}.m196-sig img{max-height:70px;display:block}.m196-sig small{color:#667085}'
    +'@media print{.m196-fold.m196-shut{display:block!important}.m24-mh.m196-fold.m196-shut{display:flex!important}.m196-fold.m196-np.m196-shut{display:none!important}.m196-fb{display:none}.m196-b:not(.on){opacity:.5}.m196-q.skip{display:none}}';
  document.head.appendChild(css);

  /* page 8 of the admission terms ends before the checklist (image cut at the checklist heading) */
  try{const T=CDF_FORMS['adm-terms'];if(T&&T.pages&&!T.m196){T.m196=1;T.pages.forEach(pg=>{if(/adm-terms\/p8\.png/.test(pg.img)){pg.img='forms/adm-terms/p8.png?v=196';pg.h=649.9;pg.fields=pg.fields.filter(f=>!/^p8f[56]$/.test(f.id));}});}}catch(e){}

  /* Outing consent: one page (page 2 was blank, empty bottom cut), blanks added for the right-hand column
     (relation, e-mail, IP No., time and date of entry), the guardian's date and time and Yes / No; the duplicate
     patient-name box and the two empty boxes over the "For patient / For guardian" text removed. */
  try{const T=CDF_FORMS['outing-consent'];if(T&&T.pages&&!T.m196){T.m196=1;
    T.pages=T.pages.filter(pg=>!/outing-consent\/p2\.png/.test(pg.img));const pg=T.pages[0];
    pg.img='forms/outing-consent/p1.png?v=196';pg.h=600;
    pg.fields=pg.fields.filter(f=>!/^p1f(2|9|10|12)$/.test(f.id));
    pg.fields.forEach(f=>{if(f.id==='p1f8')f.label='Remarks of the psychiatrist / psychologist';});
    const L=(id,x,y,w,label)=>pg.fields.push({kind:'line',id,x,y,w,h:13,label,size:9.5});
    L('m196oc1',492,83,56,'Relation of the guardian');L('m196oc2',423,101,125,'Email ID');L('m196oc3',413,120,135,'IP No.');
    L('m196oc4',474,139,74,'Time & date of entry');L('m196oc5',251,514,286,'Guardian date & time');
    pg.fields.push({kind:'choice',id:'m196oc6',x:409,y:490,w:27,h:12,label:'Guardian aware the patient will be checked on return (Yes / No)',
      opts:[{t:'Yes',x:408,y:489,w:15,h:13},{t:'No',x:424,y:489,w:13,h:13}]});}}catch(e){}

  const pno=img=>+((img.getAttribute('src')||'').match(/\/p(\d+)\.png/)||[])[1];
  const head=pg=>{const h=pg.previousElementSibling;return h&&h.classList.contains('m24-mh')?h:pg;};
  function fix(){
    /* clinical documentation page, list view: a form with its own on-screen layout replaces the list of blanks */
    document.querySelectorAll('.cdf-form').forEach(fl=>{const fid=cur(),F=FORMS[fid];if(!F||!F.list||fl.dataset.m196)return;
      fl.dataset.m196='1';const ed=!!fl.querySelector('input:not([disabled]),textarea:not([disabled]),select:not([disabled])');
      const ck=document.createElement('div');ck.className='m196-ck';ck.dataset.fid=fid;ck.dataset.ed=ed?'1':'0';ck.innerHTML=F.ck(ed);
      fl.style.display='none';fl.parentNode.insertBefore(ck,fl);});
    Object.keys(FORMS).forEach(fid=>{const F=FORMS[fid];
      const imgs=[...document.querySelectorAll('.cdf-page>img[src*="forms/'+fid+'/p"]')];if(!imgs.length)return;
      new Set(imgs.map(i=>i.parentElement.parentNode)).forEach(box=>{
        const pages=[...box.children].filter(c=>c.classList.contains('cdf-page')&&c.querySelector('img[src*="forms/'+fid+'/p"]'));
        const at=n=>pages.find(pg=>pno(pg.querySelector('img'))===n);
        const w=pages[0].style.width||'',ed=cur()===fid&&!!box.querySelector('.cdf-f:not(.cdf-ro)');
        const open=box.dataset.m196open==='1';
        F.fold.forEach(n=>{const pg=at(n);if(!pg)return;[pg,head(pg)].forEach(e=>{e.classList.add('m196-fold');if(F.np)e.classList.add('m196-np');e.classList.toggle('m196-shut',!open);});});
        const f1=at(F.fold[0]);
        if(f1&&!box.querySelector(':scope>.m196-fb')){const fb=document.createElement('div');fb.className='m196-fb';fb.style.width=w;
          const lab=()=>(box.dataset.m196open==='1'?'Hide ':'Show ')+F.what;
          fb.innerHTML='<span>'+F.bar+'</span><button type="button"></button>';const b=fb.querySelector('button');b.textContent=lab();
          b.onclick=()=>{box.dataset.m196open=box.dataset.m196open==='1'?'0':'1';b.textContent=lab();fix();};
          box.insertBefore(fb,head(f1));}
        if(!box.querySelector(':scope>.m196-ck')){const ref=F.before?at(F.before):at(F.after);if(!ref)return;
          const ck=document.createElement('div');ck.className='m196-ck';ck.style.width=w;ck.dataset.fid=fid;ck.dataset.ed=ed?'1':'0';ck.innerHTML=F.ck(ed);
          const fb=box.querySelector(':scope>.m196-fb');
          if(F.ckFirst&&fb)box.insertBefore(ck,fb);else if(F.before)box.insertBefore(ck,head(ref));else box.insertBefore(ck,ref.nextSibling);}
      });
    });
  }
  let q=0;const later=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;try{fix();}catch(e){}});};
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}catch(e){}
  later();
})();
