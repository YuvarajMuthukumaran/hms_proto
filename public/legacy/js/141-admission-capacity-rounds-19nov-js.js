/* 19 Nov 2026, Trello (Anu, meeting 19 Nov). Admission forms, capacity, rounds, OPD. Psychiatrist and psychologist screens.
   1. Collect e-signature: bigger text, no PIN box (the drawn signature is the signature; the prototype PIN is filled in behind it).
      Every admission form (not just Form C and Form E) has its blanks fillable or tickable right there, before signing,
      for any form id with page/field metadata in CDF_FORMS (20 Nov 2026, owner).
   2. A signed admission form shows "Open Form" (the form, with the signature) instead of "Collect e-signature".
   3. Detailed history: "Edit history" on the signed history reopens it (it must be signed again; the reopening is kept as an addendum).
   4. Capacity assessment (psychiatrist): it is recurring. A "Capacity assessment" tab lists every assessment with date, doctor, capacity
      and whether the patient or family member has signed. The doctor's signature is applied automatically on Review and sign; the
      patient or family signature can be collected then, or later (family may visit only every two weeks) by opening the assessment.
   5. Rounds (psychiatrist): every saved round (note, medicine, monitoring, investigation, instruction, referral changes) is kept and
      listed in a "Rounds" tab next to Capacity assessment.
   6. OPD tab: shown only for a patient with old-HMS OPD visits; it opens that patient's OPD record. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const DOC=/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE),PSYL=/^(psychologist|floor-lead-psychologist)$/.test(ROLE);
  /* 20 Nov 2026 (owner): the RMO on duty also gets the fillable forms, e-signature and Open Form (not the psychiatrist-only tabs or Edit history) */
  const RMO=ROLE==='rmo';
  if(!DOC&&!PSYL&&!RMO)return;
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||''}:{pid:'',sub:''};};
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const pt0=pid=>{try{return ptFind(pid)||{};}catch(e){return {};}};
  const PIN='1234';
  const fillPin=()=>{const i=document.getElementById('pinIn');if(i)i.value=PIN;};
  const hidePin=()=>[60,160,400].forEach(t=>setTimeout(()=>{document.querySelectorAll('#modal .pin-add').forEach(e=>{e.style.display='none';});},t));

  if(!document.getElementById('acr-css')){const c=document.createElement('style');c.id='acr-css';
    c.textContent=`#modal.es-big .mb,#modal.es-big .mb .small{font-size:16px}#modal.es-big .lbl{font-size:15px!important;font-weight:700}#modal.es-big .input{font-size:17px;min-height:46px}#modal.es-big h3{font-size:20px}#modal.es-big .ct-pad,#modal.es-big #capSigCanvas{min-height:170px}
    .es-hint{margin:0 0 8px;padding:8px 12px;border-radius:10px;background:#eff8ff;color:#175cd3;font-size:14px}
    .es-form .cdf-f:not(.cdf-ro){background:rgba(46,144,250,.08);outline:1px dashed #84caff}
    .cap-doc{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid #abefc6;background:#ecfdf3;border-radius:10px;color:#054f31;margin-bottom:10px;font-size:15px}
    .acr-t td,.acr-t th{font-size:14.5px;vertical-align:top}.acr-ch{margin:2px 0;font-size:14px}.acr-ch b{color:#475467;font-weight:600}
    .sh-c.acr-opd{cursor:pointer;display:inline-flex;align-items:center;gap:6px;background:#eff8ff!important;border-color:#b2ddff!important;color:#175cd3!important;font-weight:600}.sh-c.acr-opd:hover{background:#d1e9ff!important}.sh-c.acr-opd svg{width:15px;height:15px}
    .acr-sig{display:block;max-width:240px;height:60px;object-fit:contain;object-position:left center;border-bottom:1px solid #98a2b3;margin-top:4px}`;
    document.head.appendChild(c);}

  /* ================= 1. e-signature window ================= */
  function editableForm(fid){
    if(!CDF_FORMS||!CDF_FORMS[fid])return;
    const box=document.querySelector('#modal .es-form > div');if(!box)return;
    CD_DATA=cdLoad();
    const it=cdItems(S.pid).find(i=>i.form&&i.form.id===fid),meta=CDF_FORMS&&CDF_FORMS[fid];if(!it||!meta)return;
    S.cdEntryKey=it.entryKey;S.cdPatient=S.pid;
    const vals=cdfVals(it.entryKey),auto=vals.__autoIds||{};
    box.innerHTML=meta.pages.map((pg,i)=>`<div class="cdf-page" style="width:${pg.w*CDF_K}px;height:${pg.h*CDF_K}px;margin:0 auto 10px"><img src="${pg.img}" alt="Form page ${i+1}" draggable="false">${pg.fields.map(f=>cdfFieldHtml(f,vals,!!auto[f.id],true)).join('')}</div>`).join('');
    const es=box.parentElement;if(es&&!es.previousElementSibling?.classList?.contains('es-hint'))es.insertAdjacentHTML('beforebegin','<div class="es-hint">Fill the blanks and tick the choices right on the form. They are saved as you type.</div>');
  }
  const big=()=>{const m=document.getElementById('modal');if(m)m.classList.add('es-big');};
  const wrapEsign=()=>{
    const o=window.psyEsignOpen;
    if(typeof o==='function'&&!o.__acr){window.psyEsignOpen=function(fid){const r=o.apply(this,arguments);big();try{editableForm(fid);}catch(e){}hidePin();
      /* who is signing decides where the signature is drawn on the form */
      setTimeout(()=>{const n=document.getElementById('esN'),f=n&&n.closest('.field');if(f&&!document.getElementById('esAs'))f.insertAdjacentHTML('beforebegin','<label class="field"><span class="lbl">Who is signing</span><select class="input" id="esAs"><option value="family">Family member or nominated representative</option><option value="patient">Patient</option></select></label>');},90);
      return r;};window.psyEsignOpen.__acr=1;}
    const s=window.psyEsignSave;
    if(typeof s==='function'&&!s.__acr){window.psyEsignSave=function(fid){
      const as=((document.getElementById('esAs')||{}).value)||'family';fillPin();
      const pid=S.pid||route().pid,before=(px(pid).consent||{})[fid];
      const r=s.apply(this,arguments);
      /* 19 Nov 2026 (owner): the signature must save. It is also kept inside the form's own record (clinical_docs, which every
         clinical login may write), so it is saved for the psychologist too and shows on the form wherever it is opened. */
      try{const c=(px(pid).consent||{})[fid];if(c&&c!==before&&c.st==='esign'){c.as=as;const k=keyOf(pid,fid);if(k){const v=cdfVals(k);v.__esign={by:c.by,at:c.at,sig:c.sig,as};S.cdEntryKey=k;cdfTouch(k);}
        try{V3.log(pid,S.role,'note',(FORMS.find(x=>x[1]===fid)||['Form'])[0]+' e-signed by '+c.by);}catch(e){}}}catch(e){}
      return r;};window.psyEsignSave.__acr=1;}
    const f=window.pgFormCEsign;
    if(typeof f==='function'&&!f.__acr){window.pgFormCEsign=function(){const r=f.apply(this,arguments);setTimeout(()=>{try{editableForm('form-c');}catch(e){}},330);return r;};window.pgFormCEsign.__acr=1;}
  };
  wrapEsign();

  /* ================= 2. Open Form for a signed admission form ================= */
  const FORMS=[['Admission consent form and letter of undertaking','admission-consent'],['Form E · request for admission','form-e'],['High risk informed consent','high-risk-consent'],['Form C · independent admission','form-c']];
  const fidOf=t=>{const s=String(t||'').trim();const f=FORMS.find(x=>s.indexOf(x[0])===0);return f?f[1]:'';};
  const keyOf=(pid,fid)=>{try{CD_DATA=cdLoad();const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);return it?it.entryKey:'';}catch(e){return '';}};
  /* the e-signature: the patient's consent record, or (after a reload on another login) the copy kept in the form record */
  const esignOf=(pid,fid)=>{const c=(px(pid).consent||{})[fid];if(c&&c.st==='esign'&&c.sig)return c;const k=keyOf(pid,fid),e=k&&cdfVals(k).__esign;return e&&e.sig?{st:'esign',by:e.by,at:e.at,sig:e.sig,as:e.as}:c||null;};
  /* where the signature is drawn on the page: fields whose printed label asks for the signature */
  const sigFields=(meta,as)=>{const all=[];meta.pages.forEach((pg,i)=>pg.fields.forEach(f=>{const l=String(f.label||'');if(!/signature/i.test(l))return;const pat=/of patient$|patient’s$/i.test(l.trim())||/Signature of Patient$/i.test(l.trim()),rel=/relative/i.test(l);all.push({i,f,pat,rel});}));
    const want=all.filter(x=>as==='patient'?(x.pat||(!x.rel&&!x.pat)):(x.rel||(!x.rel&&!x.pat)));return want.length?want:all.slice(0,1);};
  function pagesRO(pid,fid){
    try{const meta=CDF_FORMS&&CDF_FORMS[fid];if(!meta)return '';const k=keyOf(pid,fid);if(!k)return '';
      const vals=cdfVals(k),auto=vals.__autoIds||{},es=esignOf(pid,fid),spots=es&&es.sig?sigFields(meta,es.as||'family'):[];
      return meta.pages.map((pg,i)=>`<div class="cdf-page" style="width:${pg.w*CDF_K}px;height:${pg.h*CDF_K}px;margin:0 auto 10px"><img src="${pg.img}" alt="Form page ${i+1}" draggable="false">${pg.fields.map(f=>cdfFieldHtml(f,vals,!!auto[f.id],false)).join('')}${spots.filter(s=>s.i===i).map(s=>`<img class="acr-onform" alt="Signature" src="${E(es.sig)}" style="position:absolute;left:${s.f.x*CDF_K}px;top:${(s.f.y-26)*CDF_K}px;width:${Math.max(120,s.f.w)*CDF_K}px;height:${40*CDF_K}px;object-fit:contain;object-position:left bottom;pointer-events:none">`).join('')}</div>`).join('');
    }catch(e){return '';}
  }
  window.acrOpenForm=function(fid){
    const pid=S.pid||route().pid,c=esignOf(pid,fid),name=(FORMS.find(x=>x[1]===fid)||['Form'])[0];
    const sig=!c?'<div class="small">Not e-signed yet.</div>'
      :c.st==='esign'?`<div class="small"><b>E-signed</b> by ${E(c.by)}${c.as==='patient'?' (patient)':''} · ${E(c.at)}</div>${c.sig?`<img class="acr-sig" alt="Signature" src="${E(c.sig)}">`:''}`
      :c.st==='uploaded'?`<div class="small"><b>Signed copy uploaded</b> · ${E(c.file||'')} · ${E(c.at)}</div>`:`<div class="small">Signed ${E(c.at||'')}</div>`;
    const pages=pagesRO(pid,fid);
    let key='';try{const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);key=it?it.entryKey:'';}catch(e){}
    V3.modal(E(name),'Signed form · read only',`${pages?`<div class="es-form" style="max-height:60vh;overflow:auto"><div style="width:max-content;margin:0 auto">${pages}</div></div>`:''}<div class="box" style="margin-top:10px"><div class="lbl">Signature</div>${sig}</div>`,
      `<button class="btn" onclick="closeModal()">Close</button>${key?`<button class="btn pri" onclick="closeModal();psyDocPreview('${Q(key)}')">Open full document</button>`:''}`);
    const m=document.getElementById('modal');if(m&&pages)m.style.width='min(940px,100%)';
  };
  function openFormButtons(v,pid){
    const x=px(pid);x.consent=x.consent||{};const cons=x.consent;
    v.querySelectorAll('#consentCard tbody tr, #formcCard tbody tr').forEach(tr=>{
      const fid=fidOf((tr.querySelector('td')||{}).textContent);if(!fid)return;
      /* a signature saved in the form record (e.g. by the other login) brings the status back too */
      if(!cons[fid]){const e=esignOf(pid,fid);if(e&&e.sig){cons[fid]=e;const st=tr.querySelector('.cs');if(st){st.textContent='E-signed '+(e.at||'')+(e.by?' · '+e.by:'');st.classList.remove('due');}}}
      /* 19 Nov 2026 (owner): Open Form only once it is really e-signed or a signed copy is uploaded; until then Collect e-signature */
      const c=cons[fid],signed=!!(c&&(c.st==='esign'||c.st==='uploaded'));
      if(!signed)return;
      tr.querySelectorAll('button').forEach(b=>{if(/^Collect e-signature$/.test(b.textContent.trim())){b.textContent='Open Form';b.setAttribute('onclick',`acrOpenForm('${fid}')`);}});
    });
    /* the psychologist's Form C step uses a row of buttons, not a table */
    const fc=v.querySelector('.pg-fc'),c=cons['form-c'];
    if(fc&&c&&c.st!=='due')fc.querySelectorAll('button').forEach(b=>{if(/^Collect e-signature$/.test(b.textContent.trim())){b.textContent='Open Form';b.setAttribute('onclick',"acrOpenForm('form-c')");}});
  }

  /* ================= 3. Detailed history can be edited after signing ================= */
  window.acrHistEdit=function(pid){
    V3.modal('Edit the detailed history','New information from the patient or family can be added.',
      `<div class="small">The history opens for editing. Sign it again when you are done. The earlier signature and this reopening are kept in the record.</div><label class="field" style="margin-top:10px"><span class="lbl">Why (optional)</span><input class="input" id="acrHe" placeholder="e.g. family shared more history at the visit"></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="acrHistEditGo('${Q(pid)}')">Edit history</button>`);
  };
  window.acrHistEditGo=function(pid){
    const why=((document.getElementById('acrHe')||{}).value||'').trim();
    const x=px(pid);x.addenda=x.addenda||{};(x.addenda.hist=x.addenda.hist||[]).push({t:'Reopened for editing'+(why?': '+why:''),by:signer(),at:atNow()});
    try{ptRun(pid,()=>{S.historyStatus='draft';return '';});}catch(e){}
    S.hview='form';closeModal();render();toast('The detailed history is open for editing. Sign it again when you are done.');
  };
  function histEditBtn(v,pid){
    const b=v.querySelector('.lkbox[data-lk="hist"]');if(!b||b.querySelector('[data-acr-he]'))return;
    const btn=document.createElement('button');btn.className='btn sm pri';btn.dataset.acrHe='1';btn.textContent='Edit history';btn.setAttribute('onclick',`acrHistEdit('${Q(pid)}')`);
    const add=[...b.querySelectorAll('button')].find(x=>/Add addendum/.test(x.textContent));(add?add.before(btn):b.appendChild(btn));
  }

  /* ================= 4. Capacity assessments (psychiatrist) ================= */
  const capHist=pid=>{const x=px(pid);if(!Array.isArray(x.capHist)){x.capHist=[];const s=x.capacitySigned;if(s)x.capHist.push({id:'cap0',at:s.signedAt,by:s.signedBy,purpose:'Admission',level:s.level||'',personType:s.personType||'',person:s.person||'',signature:s.signature||'',pending:!s.signature});}return x.capHist;};
  let CAPCTX=null;
  function capWrap(){
    if(!DOC)return;
    const o=window.psyCapSign;
    if(typeof o==='function'&&!o.__acr){
      window.psyCapSign=function(){
        const pid=S.pid||route().pid,on=document.querySelector('#capCard .cap-concl .tog.on');
        CAPCTX={pid,level:on?on.textContent.trim():'',before:px(pid).capacitySigned||null};
        const r=o.apply(this,arguments);
        setTimeout(()=>{const m=document.getElementById('modal'),mb=m&&m.querySelector('.mb');if(!mb||!document.getElementById('capSigCanvas'))return;
          big();
          mb.insertAdjacentHTML('afterbegin',`<div class="cap-doc"><span style="font-size:18px">✓</span><div>Doctor's signature: <b>${E(signer())}</b>. Applied automatically when you save.</div></div>`);
          const patientSigns=/Patient/.test(((mb.querySelector('.lbl')||{}).textContent||''))&&!/Nominated/.test(mb.innerText);
          const canvas=document.getElementById('capSigCanvas'),nameF=(document.getElementById('capSigner')||{}).closest?document.getElementById('capSigner').closest('.field'):null;
          const lbl=canvas&&canvas.previousElementSibling;
          const later=document.createElement('label');later.className='row small';later.style.cssText='gap:8px;align-items:flex-start;margin-top:12px';
          later.innerHTML=`<input type="checkbox" id="capLater" style="margin-top:3px"><span>The ${patientSigns?'patient':'family member'} is not here. Save now and collect the signature later from the Capacity assessment tab.</span>`;
          later.querySelector('input').onchange=e=>{const off=e.target.checked;[nameF,lbl,canvas].forEach(el=>{if(el)el.style.display=off?'none':'';});};
          (canvas||mb.lastElementChild).after(later);
          const save=[...m.querySelectorAll('.mf button')].find(b=>/Save signed assessment/.test(b.textContent));
          if(save)save.setAttribute('onclick',`acrCapSave(${patientSigns})`);
        },120);
        hidePin();return r;};
      window.psyCapSign.__acr=1;
    }
  }
  capWrap();
  function pushCap(pid,s,pending){
    const L=capHist(pid);
    L.unshift({id:'cap'+Date.now().toString(36),at:s.signedAt,by:s.signedBy,purpose:L.length?'Review':'Admission',level:(CAPCTX&&CAPCTX.level)||'',personType:s.personType||'',person:s.person||'',signature:s.signature||'',pending:!!pending});
  }
  window.acrCapSave=function(patientSigns){
    const pid=(CAPCTX&&CAPCTX.pid)||S.pid||route().pid;capHist(pid);
    const later=!!(document.getElementById('capLater')||{}).checked;
    if(!later){
      fillPin();const before=px(pid).capacitySigned;
      window.psyCapSignSave(patientSigns);
      const s=px(pid).capacitySigned;if(s&&s!==before){pushCap(pid,s,false);try{render();}catch(e){}}
      return;
    }
    if(!(document.getElementById('capConfirm')||{}).checked){const e=document.getElementById('capSigError');if(e){e.textContent='Tick that you reviewed the assessment.';e.style.display='block';}return;}
    if(window.psyCapSave)window.psyCapSave();
    const x=px(pid),d=x.capacityDraft||{};
    x.capacitySigned=Object.assign({},d,{signedBy:signer(),signedAt:atNow(),person:'',personType:patientSigns?'Patient':'Nominated representative',signature:'',pending:true});
    pushCap(pid,x.capacitySigned,true);
    closeModal();S.capView='read';render();toast('Assessment signed by '+signer()+'. The '+(patientSigns?'patient':'family')+' signature is pending in the Capacity assessment tab.');
  };
  /* 19 Nov 2026 (owner): New assessment opens the capacity form in a pop-up (same questions as Admission) and saves it here,
     it does not go to the admission assessment. The doctor's signature is applied on save; the patient or family member signs now or later. */
  const padOn=(id,set)=>setTimeout(()=>{const c=document.getElementById(id);if(!c)return;const g=c.getContext('2d');g.lineWidth=2.2;g.lineCap='round';g.strokeStyle='#101828';const P={c,g,down:false,drawn:false};set(P);
    const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];};
    c.onpointerdown=e=>{P.down=true;P.drawn=true;const[x,y]=p(e);g.beginPath();g.moveTo(x,y);c.setPointerCapture(e.pointerId);};
    c.onpointermove=e=>{if(!P.down)return;const[x,y]=p(e);g.lineTo(x,y);g.stroke();};c.onpointerup=()=>{P.down=false;};},0);
  let newPad=null;
  const whoSigns=()=>{const on=document.querySelector('#acrCapF .cap-concl .tog.on')||[...document.querySelectorAll('#acrCapF .radios .tog.on')].find(b=>/^4[AB]/.test(b.textContent.trim()));return on&&/^4B/.test(on.textContent.trim())?'Nominated representative':'Patient';};
  window.acrCapWho=function(){const t=whoSigns(),l=document.getElementById('acrCapWho');if(l)l.textContent=t;};
  window.acrCapNew=function(pid){
    capHist(pid);
    let form='';try{form=capForm(true);}catch(e){form='';}
    if(!form){toast('The capacity form could not open');return;}
    let nr='';try{const id=ptIdentity(ptFind(pid))||{};nr=id.nr&&id.nr!=='Not recorded'?id.nr:'';}catch(e){}
    V3.modal('New capacity assessment · '+E(pt0(pid).name||''),'Same questions as at admission. Saved in the Capacity assessment list.',
      `<div class="cap-doc"><span style="font-size:18px">✓</span><div>Doctor's signature: <b>${E(signer())}</b>. Applied automatically when you save.</div></div>
       <div id="acrCapF" style="max-height:52vh;overflow:auto;padding-right:6px" onclick="setTimeout(acrCapWho,0)">${form}</div>
       <div class="box" style="margin-top:12px"><div class="lbl">Signature of the <span id="acrCapWho">Patient</span></div>
         <label class="row small" style="gap:8px;align-items:flex-start;margin:8px 0"><input type="checkbox" id="acrCapLater" style="margin-top:3px" onchange="document.getElementById('acrCapSigW').style.display=this.checked?'none':''"><span>They are not here. Save now and collect the signature later (family may visit only every two weeks).</span></label>
         <div id="acrCapSigW"><label class="field"><span class="lbl">Name</span><input class="input" id="acrCapNN" value="${E(nr)}" placeholder="Full name"></label>
         <canvas id="acrCapNC" width="520" height="150" style="width:100%;height:150px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;touch-action:none;margin-top:8px"></canvas>
         <button class="btn sm" style="margin-top:6px" onclick="if(window.__acrNP){__acrNP.g.clearRect(0,0,__acrNP.c.width,__acrNP.c.height);__acrNP.drawn=false;}">Clear</button></div></div>
       <label class="row small" style="gap:8px;align-items:flex-start;margin-top:10px"><input type="checkbox" id="acrCapOk" style="margin-top:3px"><span>I reviewed the full assessment and confirm it is accurate.</span></label>
       <div id="acrCapErr" class="small" style="color:var(--red);display:none;margin-top:6px"></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="acrCapNewSave('${Q(pid)}')">Sign and save</button>`);
    big();const m=document.getElementById('modal');if(m)m.style.width='min(900px,100%)';
    padOn('acrCapNC',P=>{newPad=P;window.__acrNP=P;});setTimeout(acrCapWho,50);
  };
  window.acrCapNewSave=function(pid){
    const box=document.getElementById('acrCapF');if(!box)return;
    const err=t=>{const e=document.getElementById('acrCapErr');if(e){e.textContent=t;e.style.display='block';}};
    const inputs=[...box.querySelectorAll('input,select,textarea')].map(x=>x.value);
    const answers=[...box.querySelectorAll('.radios')].map(g=>[...g.querySelectorAll('.tog')].findIndex(b=>b.classList.contains('on')));
    const on=box.querySelector('.cap-concl .tog.on')||[...box.querySelectorAll('.radios .tog.on')].find(b=>/^4[AB]/.test(b.textContent.trim()));
    if(!on)return err('Choose the conclusion (4A or 4B) first.');
    if(!(document.getElementById('acrCapOk')||{}).checked)return err('Tick that you reviewed the assessment.');
    const later=!!(document.getElementById('acrCapLater')||{}).checked,name=((document.getElementById('acrCapNN')||{}).value||'').trim();
    if(!later&&(!name||!newPad||!newPad.drawn))return err('Write the name and sign in the box, or tick that they are not here.');
    const L=capHist(pid),personType=whoSigns(),at=atNow();
    const a={id:'cap'+Date.now().toString(36),at,by:signer(),purpose:L.length?'Review':'Admission',level:on.textContent.trim(),inputs,answers,personType,person:later?'':name,signature:later?'':newPad.c.toDataURL('image/png'),pending:later,personAt:later?'':at};
    L.unshift(a);
    /* the first one also counts as the admission assessment */
    const x=px(pid);if(!x.capacitySigned)x.capacitySigned={inputs,answers,signedBy:a.by,signedAt:at,person:a.person,personType,signature:a.signature,pending:later,level:a.level};
    try{V3.log(pid,S.role,'note','Capacity assessment signed by '+a.by+': '+a.level+(later?' ('+personType.toLowerCase()+' signature pending)':''));}catch(e){}
    closeModal();render();toast('Capacity assessment saved'+(later?'. The '+personType.toLowerCase()+' signs at their next visit.':' with both signatures.'));
  };
  /* the answers of a saved assessment, read only, in the same form */
  function capRead(a){
    if(!a||!a.inputs||!a.answers)return '';
    let h='';try{h=capForm(true);}catch(e){return '';}
    const t=document.createElement('template');t.innerHTML=h;
    const ctl=[...t.content.querySelectorAll('input,select,textarea')],gr=[...t.content.querySelectorAll('.radios')];
    if(ctl.length!==a.inputs.length||gr.length!==a.answers.length)return '';
    ctl.forEach((el,i)=>{const s=document.createElement('div');s.className='cap-read-value';s.textContent=a.inputs[i]||'Not filled in';el.replaceWith(s);});
    gr.forEach((g,i)=>{const b=[...g.querySelectorAll('.tog')][a.answers[i]];const s=document.createElement('div');s.className='cap-read-value';s.textContent=b?b.textContent.trim():'Not answered';g.replaceWith(s);});
    t.content.querySelectorAll('button').forEach(b=>b.remove());
    return `<div style="max-height:46vh;overflow:auto;padding-right:6px;margin-top:10px">${t.innerHTML}</div>`;
  }
  let capPad2=null;
  window.acrCapOpen=function(pid,id){
    const a=capHist(pid).find(x=>x.id===id);if(!a)return;
    const who=a.personType||'Patient or family member';
    const sig=a.pending?`<div class="callout grey small" style="margin-bottom:8px">${E(who)} signature not collected yet. Collect it now if they are here.</div>
        <label class="field"><span class="lbl">${E(who)} name</span><input class="input" id="acrCapN" placeholder="Full name"></label>
        <div class="lbl" style="margin:10px 0 6px">${E(who)} signature</div><canvas id="acrCapC" width="520" height="150" style="width:100%;height:150px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;touch-action:none"></canvas>
        <div class="row" style="justify-content:space-between;margin-top:6px"><button class="btn sm" onclick="acrCapClear()">Clear</button><span id="acrCapE" class="small" style="color:var(--red);display:none">Write the name and sign in the box</span></div>`
      :`<div class="small">${E(who)}: <b>${E(a.person)}</b>${a.personAt?' · '+E(a.personAt):''}</div>${a.signature?`<img class="acr-sig" alt="Signature" src="${E(a.signature)}">`:''}`;
    V3.modal('Capacity assessment · '+E(a.at),E(a.purpose||''),
      `<dl class="kv"><dt>Date</dt><dd>${E(a.at)}</dd><dt>Capacity</dt><dd>${E(a.level||'Not recorded')}</dd><dt>Doctor</dt><dd>${E(a.by)} · signed</dd></dl>${capRead(a)}<div class="box" style="margin-top:10px">${sig}</div>`,
      `<button class="btn" onclick="closeModal()">Close</button>${a.pending?`<button class="btn pri" onclick="acrCapSig('${Q(pid)}','${Q(id)}')">Save signature</button>`:''}`);
    big();
    if(a.pending)setTimeout(()=>{const c=document.getElementById('acrCapC');if(!c)return;const g=c.getContext('2d');g.lineWidth=2.2;g.lineCap='round';g.strokeStyle='#101828';capPad2={c,g,down:false,drawn:false};
      const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];};
      c.onpointerdown=e=>{capPad2.down=true;capPad2.drawn=true;const[x,y]=p(e);g.beginPath();g.moveTo(x,y);c.setPointerCapture(e.pointerId);};
      c.onpointermove=e=>{if(!capPad2.down)return;const[x,y]=p(e);g.lineTo(x,y);g.stroke();};c.onpointerup=()=>{capPad2.down=false;};},0);
  };
  window.acrCapClear=function(){if(!capPad2)return;capPad2.g.clearRect(0,0,capPad2.c.width,capPad2.c.height);capPad2.drawn=false;};
  window.acrCapSig=function(pid,id){
    const a=capHist(pid).find(x=>x.id===id),n=((document.getElementById('acrCapN')||{}).value||'').trim();
    if(!a)return;if(!n||!capPad2||!capPad2.drawn){const e=document.getElementById('acrCapE');if(e)e.style.display='block';return;}
    a.person=n;a.signature=capPad2.c.toDataURL('image/png');a.pending=false;a.personAt=atNow();a.personBy=signer();
    const x=px(pid),s=x.capacitySigned;if(s&&s.signedAt===a.at&&s.pending){s.person=n;s.signature=a.signature;s.pending=false;}
    try{V3.log(pid,S.role,'note','Capacity assessment of '+a.at+': '+(a.personType||'family')+' signature collected ('+n+')');}catch(e){}
    closeModal();render();toast('Signature saved');
  };
  function capTab(pid){
    const L=capHist(pid);
    const rows=L.map(a=>`<tr><td><b>${E(a.at)}</b><div class="tiny muted">${E(a.purpose||'')}</div></td><td>${E(a.level||'Not recorded')}</td><td>${E(a.by)}<div class="tiny" style="color:#067647">✓ Signed</div></td>
      <td>${a.pending?`<b style="color:#b54708">Pending</b><div class="tiny muted">${E(a.personType||'Patient or family member')} to sign</div>`:`${E(a.person||'')}<div class="tiny muted">${E(a.personType||'')}</div>`}</td>
      <td><button class="btn sm ${a.pending?'pri':''}" onclick="acrCapOpen('${Q(pid)}','${Q(a.id)}')">${a.pending?'Collect signature':'Open'}</button></td></tr>`).join('');
    const draft='';
    return `<section class="card"><div class="hd"><div><h3>Capacity assessment</h3><div class="small muted" style="margin-top:4px">Capacity is reassessed during the stay. The doctor signs each one; the patient or family member signs now or at their next visit.</div></div><button class="btn sm pri" onclick="acrCapNew('${Q(pid)}')">New assessment</button></div>${draft}
      <div class="scroll"><table class="t acr-t"><thead><tr><th>Date</th><th>Capacity</th><th>Doctor</th><th>Patient or family signature</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="5" class="small muted">No capacity assessment yet. Press New assessment to record one.</td></tr>'}</tbody></table></div></section>`;
  }

  /* ================= 5. Rounds are kept (psychiatrist) ================= */
  const desc=x=>{if(x==null)return '';if(typeof x==='string')return x;if(Array.isArray(x))return x.filter(Boolean).join(' · ');
    const f=x.f?(typeof monLabel==='function'?monLabel(x.f):x.f):'';
    return [x.act&&x.act!=='Start'?x.act:'',x.text||x.p||x.name||x.to||'',f,x.ty&&x.text?'('+x.ty+(x.to?', '+x.to:'')+')':'',x.why?'· why: '+x.why:''].filter(Boolean).join(' ');};
  function snapRound(){
    const R=S.rounds||{},w=R.ward,WP=(typeof WARDS!=='undefined'&&WARDS[w])||[],p=WP[Math.min(R.idx&&R.idx[w]||0,Math.max(0,WP.length-1))];
    return {w,idx:R.idx?R.idx[w]:0,pid:p&&p.id,note:(R.scribeNote||'').trim(),why:((document.getElementById('pmWhy')||{}).value||'').trim(),
      ch:[['Medicine',R.mc],['Monitoring',R.mon],['Investigation',R.inv],['Instruction',R.adv],['Referral',R.ref]].flatMap(([t,a])=>(a||[]).map(x=>({t,d:desc(x)}))).filter(c=>c.d)};
  }
  function keepRound(b){
    const R=S.rounds||{};if(!b||!b.pid||!R.idx||R.idx[b.w]===b.idx)return; /* not saved (e.g. the note was missing) */
    if(!b.note&&!b.ch.length)return;
    const x=px(b.pid);x.roundLog=x.roundLog||[];
    x.roundLog.unshift({at:atNow(),ts:Date.now(),by:signer(),note:b.note,why:b.why,changes:b.ch});
  }
  function roundWrap(){
    if(!DOC)return;
    if(typeof confirmRound==='function'&&!confirmRound.__acr){const o=confirmRound;confirmRound=function(){const b=snapRound();const r=o.apply(this,arguments);try{keepRound(b);}catch(e){}return r;};confirmRound.__acr=1;}
    const w=window.pmWhySave;if(typeof w==='function'&&!w.__acr){window.pmWhySave=function(){const b=snapRound();const r=w.apply(this,arguments);try{keepRound(b);}catch(e){}return r;};window.pmWhySave.__acr=1;}
  }
  roundWrap();
  function roundsTab(pid){
    const log=(px(pid).roundLog||[]).slice();
    /* round notes already in Earlier notes (before this tab existed) */
    let old=[];try{old=JSON.parse(ptRun(pid,()=>JSON.stringify((S.dnHist||DN_HIST||[]).filter(n=>n.type==='Round note'))))||[];}catch(e){}
    old.forEach(n=>{const txt=((n.secs||[])[0]||[])[1]||n.sum||'';if(!log.some(l=>l.note&&txt&&l.note.slice(0,60)===String(txt).slice(0,60)))log.push({at:n.signed||((n.d||'')+' '+(n.my||'')).trim(),by:n.by,note:txt,changes:[],old:true});});
    const rows=log.map(l=>`<tr><td><b>${E(l.at)}</b><div class="tiny muted">${E(l.by||'')}</div></td><td>${l.note?E(l.note).replace(/\n/g,'<br>'):'<span class="muted">No note (changes only)</span>'}</td>
      <td>${(l.changes||[]).length?l.changes.map(c=>`<div class="acr-ch"><b>${E(c.t)}:</b> ${E(c.d)}</div>`).join(''):'<span class="muted small">None</span>'}${l.why&&!/Rationale/.test(l.note||'')?`<div class="tiny muted">Why: ${E(l.why)}</div>`:''}</td></tr>`).join('');
    return `<section class="card"><div class="hd"><div><h3>Rounds</h3><div class="small muted" style="margin-top:4px">Every saved round for this patient: the round note and the changes made, with who and when.</div></div><button class="btn sm pri" onclick="window.psyOpenRounds?psyOpenRounds('${Q(pid)}'):go('#/rounds')">Open Rounds</button></div>
      <div class="scroll"><table class="t acr-t"><thead><tr><th>When</th><th>Round note</th><th>Changes made</th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="small muted">No round saved yet for this patient.</td></tr>'}</tbody></table></div></section>`;
  }

  /* ================= tabs: Capacity assessment, Rounds, OPD ================= */
  const hasOpd=p=>!!(p&&p.real&&p.lastVisit);
  /* same 17 px stroke icons as the other patient tabs */
  const SVG=d=>`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const TAB_ICON={
    capacity:SVG('<path d="M12 3v18"/><path d="M7 21h10"/><path d="M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/>'),  /* scales: weighing a decision */
    rounds:SVG('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 11l1.5 1.5 3-3"/><path d="M8.5 16.5l1.5 1.5 3-3"/>'),          /* clipboard with ticks */
    opd:SVG('<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-1"/><circle cx="20" cy="12" r="2"/>')                                       /* stethoscope */
  };
  function tabs(v,pid,sub){
    const bar=v.querySelector('.ws-mid > .subtabs')||v.querySelector('.subtabs');if(!bar)return;
    const p=pt0(pid),mk=(k,l,oc)=>{if(bar.querySelector(`[data-acr="${k}"]`))return;const b=document.createElement('button');b.className='subtab';b.setAttribute('role','tab');b.dataset.acr=k;b.innerHTML=`<span class="sti">${TAB_ICON[k]||''}</span>${E(l)}`;b.setAttribute('onclick',oc);
      const dc=[...bar.querySelectorAll('button')].find(x=>/^Discharge/.test(x.textContent.trim()));(dc?dc.before(b):bar.appendChild(b));};
    if(DOC){mk('capacity','Capacity assessment',`go('#/patient/${Q(pid)}/capacity')`);mk('rounds','Rounds',`go('#/patient/${Q(pid)}/rounds')`);}
    /* 19 Nov 2026 (owner, screenshot): OPD is a button in the patient header, next to the Section and observation chips, not a tab */
    if(hasOpd(p)){const hd=v.querySelector('.dph');const chips=hd?[...hd.querySelectorAll('.sh-c')]:[];const last=chips[chips.length-1];
      if(last&&!hd.querySelector('.acr-opd')){const b=document.createElement('button');b.type='button';b.className='sh-c acr-opd';b.title='Open the OPD record from the old HMS';b.innerHTML=TAB_ICON.opd+'<span>OPD record</span>';b.setAttribute('onclick',`acrOpd('${Q(pid)}')`);last.after(b);}}
    if(DOC&&(sub==='capacity'||sub==='rounds')){
      bar.querySelectorAll('button').forEach(b=>{const on=b.dataset.acr===sub;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
      const host=bar.parentElement;if(!host||host.querySelector('#acrBody'))return;
      [...host.children].slice([...host.children].indexOf(bar)+1).forEach(e=>{e.style.display='none';});
      const d=document.createElement('div');d.id='acrBody';d.innerHTML=sub==='capacity'?capTab(pid):roundsTab(pid);host.appendChild(d);
      $('title').textContent=sub==='capacity'?'Capacity assessment':'Rounds';
    }
  }
  window.acrOpd=function(pid){if(typeof window.regOpen==='function')regOpen(pid);else toast('The OPD record opens from the Registry');};

  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{wrapEsign();capWrap();roundWrap();}catch(e){}
    try{const {pid,sub}=route();const v=document.getElementById('view');
      if(pid&&v){tabs(v,pid,sub);if(sub==='admission'){openFormButtons(v,pid);if(DOC||PSYL)histEditBtn(v,pid);}}}catch(e){}
    return o;
  };
})();
