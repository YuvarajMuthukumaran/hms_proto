/* 197 · 24 Nov (owner): every form fills itself from what the portal already knows.
   Sources: the patient (name, age, sex, UHID, room, diagnosis, mobile, first relative, referral), the treating team
   (ptCtxOf(pid).team: psy, psych), the Application form for admission (psyx.appForm.v: date of birth, address,
   phones, e-mail, occupation, education, nominated representative), the allergy record and the admission date.
   Adds rules to cdfAuto (used by every form view) and fills empty blanks whenever a form is on screen, including
   the e-sign window (block 141, which never pre-filled). A blank the user empties is not filled again (`__clr`). */
(function(){
  if(typeof cdfAuto!=='function')return;
  const norm=s=>cdfNorm(s);
  const join=a=>a.map(x=>String(x||'').trim()).filter(Boolean).join(' ');
  const iso=d=>{try{return /^\d{4}-\d{2}-\d{2}/.test(d||'')?cdfIsoStamp(String(d).slice(0,10)):String(d||'');}catch(e){return '';}};
  const noDr=s=>String(s||'').replace(/^dr\.?\s*/i,'').trim();
  const fidNow=()=>String((typeof S!=='undefined'&&S.cdEntryKey)||'').split('|')[1]||'';
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const team=pid=>{try{return (ptCtxOf(pid)||{}).team||{};}catch(e){return {};}};
  function info(p){
    const x=px(p.id),a=(x.appForm||{}).v||{},r=p.rel0||{},t=team(p.id);
    let psy=t.psy||'';try{if(!psy&&['psychiatrist','lead'].includes(S.role))psy=signer();}catch(e){}
    let psych=t.psych||'';try{if(!psych&&S.role==='psychologist')psych=signer();}catch(e){}
    const al=x.allergy;
    return {dob:iso(a.dob),addr:a.paddr||'',caddr:a.caddr||a.paddr||'',phone:a.pph||p.mobile||'',email:a.email||'',occ:a.occ||'',edu:a.edu||'',
      nr:join([a.gTitle,a.gFirst,a.gMiddle,a.gSur])||r.name||'',nrRel:a.gRel||r.rel||'',nrAddr:a.gAddr||'',nrPh:a.gPh||r.phone||r.mobile||'',
      psy,psych,allergy:al?((al.list||[]).length?al.list.map(d=>d.drug).filter(Boolean).join(', '):(al.ndka?'No known drug allergy':'')):'',
      referral:p.referral||''};
  }
  const NOW=()=>{const d=new Date();let h=d.getHours();const ap=h<12?'AM':'PM';h=h%12||12;return h+':'+String(d.getMinutes()).padStart(2,'0')+' '+ap;};
  function more(label,p,ep){
    const l=norm(label),fid=fidNow();if(!l||!p||!p.id)return '';const I=info(p),nrForm=fid==='form-e';
    if(/^(name )?date of birth$|^dob$|^d o b$/.test(l))return I.dob;
    if(l==='name date of birth')return join([p.name,I.dob?'('+I.dob+')':'']);
    if(/^(\d*i? ?)?(authorize )?dr$/.test(l))return noDr(I.psy);
    if(/^(name of (the )?doctor|doctor)$/.test(l))return I.psy;
    if(/^(consultant|psychiatrist|treating doctor|treating psychiatrist|consultant psychiatrist|doctor in charge|name of doctor|name of psychiatrist)$/.test(l))return I.psy;
    if(/^(name of )?(the )?psychologist$/.test(l))return I.psych;
    if(l==='designation'&&fid==='mect-final')return 'Consultant Psychiatrist';
    if(/^(patient s name|patient|name of the assessed person|name of the patient signing|i the undersigned mr mrs|i the undersigned)$/.test(l))return p.name;
    if(/^(name of (the )?(guardian|family member|family member\/ nr|accompanying person|accompanied person|nominated representative)|nominated representative name|family member|name of the family member nr|the nominated representative)$/.test(l))return I.nr;
    if(/^(relation(ship)? (with|of|to) (the )?(patient|accompanying person)|relation relative signing|specify relationship|relation)$/.test(l))return I.nrRel;
    if(/^contact details$/.test(l))return I.nrPh;
    if(/^(mobile no|mobile|phone|phone no|contact no)$/.test(l))return nrForm?I.nrPh:I.phone;
    if(/^address$/.test(l))return nrForm?I.nrAddr:I.addr;
    if(l==='address phone')return join([I.nrAddr,I.nrPh]);
    if(/^(e ?mail|email id|e mail id)$/.test(l))return nrForm?'':I.email;
    if(l==='occupation')return I.occ;
    if(l==='education')return I.edu;
    if(/^(allergy|allergy to drugs|allergies|drug allergy)$/.test(l))return I.allergy;
    if(/^(final diagnosis|discharge diagnosis|provisional|provisional diagnosis)$/.test(l))return p.dx&&!/under assessment/i.test(p.dx)?p.dx:'';
    if(/^(source of referral|referred by)$/.test(l)&&fid!=='outing-consent')return I.referral;
    if(/^(date patient signing|date relative signing|date of signing)$/.test(l))return cdfStamp(new Date(),false);
    if(l==='time')return NOW();
    if(/^(place|place of assessment)$/.test(l))return 'Tulasi Healthcare, Gurugram';
    if(l==='id'&&fid==='capacity-assessment')return p.uhid||'';
    return '';
  }
  const __a=cdfAuto;
  cdfAuto=function(label,p,ep){let r='';try{r=more(label,p,ep||{});}catch(e){}return r||__a.apply(this,arguments);};

  /* a blank the user empties stays empty */
  try{const __s=cdfSet;cdfSet=function(fid,val){try{const v=cdfVals(S.cdEntryKey);if(String(val||'').trim()){if(v.__clr)delete v.__clr[fid];}else (v.__clr=v.__clr||{})[fid]=1;}catch(e){}return __s.apply(this,arguments);};}catch(e){}

  /* fill the empty blanks of the form on screen */
  function fill(){
    const key=String((typeof S!=='undefined'&&S.cdEntryKey)||''),fid=key.split('|')[1],pid=key.split('|')[0];if(!fid)return;
    const meta=(typeof CDF_FORMS!=='undefined'&&CDF_FORMS[fid]);if(!meta)return;
    if(!document.querySelector('.cdf-page input.cdf-f, .cdf-page textarea.cdf-f, .cdf-page select.cdf-f'))return;
    let p=null;try{p=((typeof PTS!=='undefined'&&PTS)||[]).find(x=>x.id===pid)||(typeof ptFind==='function'&&ptFind(pid));}catch(e){}
    if(!p)return;
    const v=cdfVals(key),ep=((typeof CD_DATA!=='undefined'&&CD_DATA.episodes)||{})[pid]||{},clr=v.__clr||{};let ch=false;
    meta.pages.forEach(pg=>pg.fields.forEach(f=>{
      if(f.kind==='check'||f.kind==='choice'||v[f.id]||clr[f.id])return;
      let a='';try{a=cdfAuto(f.label,p,ep)||'';}catch(e){}if(!a)return;
      v[f.id]=a;(v.__autoIds=v.__autoIds||{})[f.id]=1;ch=true;
      document.querySelectorAll('.cdf-page [oninput*="cdfSet(\''+f.id+'\'"], .cdf-page [onchange*="cdfSet(\''+f.id+'\'"]').forEach(el=>{
        if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===a||o.text===a)){const o=document.createElement('option');o.textContent=a;el.appendChild(o);}
        if(!el.value){el.value=a;el.classList.add('auto');}});
    }));
    if(ch){try{cdfTouch(key);}catch(e){try{cdSave();}catch(_){}}}
  }
  let q=0;const later=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;try{fill();}catch(e){}});};
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}catch(e){}
})();
