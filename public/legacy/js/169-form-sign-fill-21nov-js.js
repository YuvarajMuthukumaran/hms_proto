/* 21 Nov 2026, Trello backlog (forms and e-signatures). Every role that collects e-signatures.
   1. Admission consent, patient signs: the signature was drawn three times (the two lines under "Name & Signature of Patient" were read
      as signature lines). Now: signature on the first line, the patient's name on the second, the date on the third.
   2. Admission consent, relative signs: no name or date. Now: the relative's name on their "Name & Signature" line (signature above it),
      and new blanks for Relation and Date in the relative's column, filled when they sign.
   3. Collect e-signature: the marked blanks (Name, Age/Sex, Address, IP, Date/Time, Treating Consultant) are filled before the family
      reads the form, also when the form record was started earlier. Address and treating psychiatrist come from the registry for real
      patients. Only empty blanks are filled; anything typed stays.
   4. Form E: the opening sentence had no room for the names (the blank sat above it). It is now one sentence with blanks inside it:
      I, Mr./Mrs./Ms. [name] residing at [address], nominated representative of Mr./Mrs. [patient] aged [age] years, [relation] [of].
      The patient's name and age are filled in; the representative's name is filled when they sign.
   */
(function(){
  let F;try{F=CDF_FORMS;}catch(e){return;}if(!F)return;
  const E=s=>cdEsc(String(s==null?'':s));
  const today=()=>{try{return cdfStamp(new Date(),false);}catch(e){return new Date().toLocaleDateString('en-GB');}};

  /* ---------- 1 and 2: admission consent ---------- */
  const ac=F['admission-consent'],acp=ac&&ac.pages&&ac.pages[0];
  if(acp){
    const fld=id=>acp.fields.find(f=>f.id===id);
    if(fld('p1f22'))fld('p1f22').label='Name of the patient (signing)';
    if(fld('p1f23'))fld('p1f23').label='Date (patient signing)';
    if(!fld('acRelRel'))acp.fields.push({kind:'line',id:'acRelRel',x:80,y:633,w:220,h:12,size:9.5,label:'Relation (relative signing)'});
    if(!fld('acRelDate'))acp.fields.push({kind:'line',id:'acRelDate',x:80,y:670,w:220,h:12,size:9.5,label:'Date (relative signing)'});
  }
  /* who signs -> which blanks get the name, relation and date */
  const SIGNER={
    'admission-consent':{patient:{name:'p1f22',rel:null,date:'p1f23'},family:{name:'p1f20',rel:'acRelRel',date:'acRelDate'}},
    'form-e':{family:{name:'p1f10',sent:'feN'},patient:{}},
    /* 23 Nov (meeting): the signer's name and the date on the other forms too */
    'form-c':{patient:{name:'p1f12',date:'p1f13'},family:{name:'p1f12',date:'p1f13'}},
    'high-risk-consent':{patient:{name:'p1f10',date:'p1f11'},family:{name:'p1f10',date:'p1f11'}},
    'mect-final':{patient:{name:'p8f16',date:'p8f18'},family:{name:'p8f19',date:'p8f21'}},
    'outing-consent':{patient:{date:'p1f11'},family:{name:'p1f3',date:'m196oc5'}},
    'clozapine-consent':{patient:{date:'p1f19'},family:{date:'p1f20'}}
  };
  /* 23 Nov (meeting): the signing date shows today as soon as the window opens and can be changed (family members often sign later) */
  const dateIds=fid=>{const m=SIGNER[fid]||{};return [...new Set(Object.values(m).map(x=>x.date).filter(Boolean))];};

  /* ---------- 4: Form E sentence ---------- */
  const fe=F['form-e'],fep=fe&&fe.pages&&fe.pages[0];
  if(fep&&!fep.fields.some(f=>f.id==='feS')){
    fep.fields=fep.fields.filter(f=>f.id!=='p1f2'&&f.id!=='p1f3');
    fep.fields.push({kind:'sentence',id:'feS',x:50,y:203,w:466,h:43,size:9,label:'Nominated representative and patient'});
  }
  const REL=['son','daughter','husband','wife'];
  const __fh=cdfFieldHtml;
  cdfFieldHtml=function(f,v,auto,editable){
    if(!f||f.kind!=='sentence')return __fh.apply(this,arguments);
    const K=CDF_K,st=`left:${f.x*K}px;top:${f.y*K}px;width:${f.w*K}px;height:${f.h*K}px;font-size:${f.size*K}px`;
    const inp=(id,ph,w)=>editable?`<input class="fe-in" style="width:${w*K}px" placeholder="${E(ph)}" value="${E(v[id]||'')}" oninput="cdfSet('${id}',this.value,this)">`:`<b class="fe-ro">${E(v[id]||'')||'&nbsp;'.repeat(12)}</b>`;
    const rel=editable?`<select class="fe-in" style="width:${70*K}px" onchange="cdfSet('feR',this.value,this)"><option value=""></option>${REL.map(r=>`<option ${v.feR===r?'selected':''}>${r}</option>`).join('')}</select>`:`<b class="fe-ro">${E(v.feR||'son / daughter / husband / wife')}</b>`;
    return `<div class="cdf-f fe-sent" style="${st}">I, Mr./Mrs./Ms. ${inp('feN','name',120)} residing at ${inp('feA','address',170)}, nominated representative of Mr./Mrs. ${inp('feP','patient',120)} aged ${inp('feAge','age',30)} years, ${rel} of ${inp('feOf','name',120)}</div>`;
  };
  const css=document.createElement('style');
  css.textContent='.cdf-page .cdf-f.fe-sent{background:#fff!important;outline:0!important;font-weight:400!important;font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#222;white-space:normal;overflow:visible;z-index:2;pointer-events:auto;padding:0;text-align:left}'
    +'.fe-sent .fe-in{display:inline-block;height:1.35em;font:inherit;padding:0 3px;border:0;border-bottom:1px dashed #84caff;background:rgba(46,144,250,.08);vertical-align:baseline}'
    +'.fe-sent .fe-ro{font-weight:600;border-bottom:1px solid #98a2b3;padding:0 2px}';
  document.head.appendChild(css);

  /* ---------- 3: fill the marked blanks ---------- */
  const reg={};
  const ptOf=pid=>{try{return allPts().find(x=>x.id===pid)||null;}catch(e){return null;}};
  function extra(label,p){
    const l=cdfNorm(label||''),r=reg[p.id]||{};
    if(/^address$|^residing at$/.test(l))return p.address||r.address||'';
    if(/treating consultant|treating psychiatrist|consultant/.test(l))return p.psychiatrist||r.psychiatrist||(String((window.__TULASI__||{}).role||'')==='psychiatrist'&&!window.__realMode?(signer()||''):'');
    return '';
  }
  function fillMissing(pid,fid){
    const meta=F[fid],p=ptOf(pid);if(!meta||!p)return false;
    const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);if(!it)return false;
    const v=cdfVals(it.entryKey),ep=(CD_DATA.episodes||{})[pid]||{};let ch=false;
    const put=(id,val)=>{if(val&&!v[id]){v[id]=val;(v.__autoIds=v.__autoIds||{})[id]=1;ch=true;}};
    meta.pages.forEach(pg=>pg.fields.forEach(f=>{
      if(f.kind==='check'||f.kind==='choice'||f.kind==='sentence'||v[f.id])return;
      if(/signing\)$/.test(String(f.label||'')))return;
      if(fid==='form-e'&&f.id==='p1f10')return; /* the nominated representative's name, not the patient's */
      let a='';try{a=cdfAuto(f.label,p,ep)||'';}catch(e){}
      put(f.id,a||extra(f.label,p));
    }));
    dateIds(fid).forEach(id=>put(id,today()));
    if(fid==='form-e'){put('feP',p.name);put('feAge',p.age!=null?String(p.age):'');put('feA',p.address||(reg[pid]||{}).address||'');}
    if(ch)cdfTouch(it.entryKey);
    return ch;
  }
  /* real patients: address and treating psychiatrist from the registry, once per patient */
  function loadReg(pid,fid){
    const p=ptOf(pid);if(!p||!p.real||reg[pid]||typeof window.regRest!=='function')return;
    reg[pid]={};
    Promise.resolve(window.regRest('patients?id=eq.'+encodeURIComponent(pid)+'&select=address,psychiatrist')).then(rows=>{
      const r=(rows&&rows[0])||{};reg[pid]={address:r.address||'',psychiatrist:r.psychiatrist||''};
      if(!fillMissing(pid,fid))return;
      const it=cdItems(pid).find(i=>i.form&&i.form.id===fid),v=it?cdfVals(it.entryKey):{};
      document.querySelectorAll('#modal .es-form input.cdf-f, #modal .es-form .fe-in').forEach(el=>{const m=String(el.getAttribute('oninput')||'').match(/cdfSet\('([^']+)'/);if(m&&!el.value&&v[m[1]])el.value=v[m[1]];});
    }).catch(()=>{});
  }
  const wrapOpen=()=>{
    const o=window.psyEsignOpen;
    if(typeof o!=='function'||o.__fill)return;
    window.psyEsignOpen=function(fid){
      try{CD_DATA=cdLoad();if(fillMissing(S.pid,fid))cdSave();}catch(e){}
      const r=o.apply(this,arguments);
      try{loadReg(S.pid,fid);}catch(e){}
      return r;};
    Object.keys(o).forEach(k=>{if(k.indexOf('__')===0)window.psyEsignOpen[k]=o[k];});window.psyEsignOpen.__fill=1;
  };

  /* ---------- 1 and 2: name, relation and date of whoever signed ---------- */
  const wrapSave=()=>{
    const s=window.psyEsignSave;
    if(typeof s!=='function'||s.__fill)return;
    window.psyEsignSave=function(fid){
      const pid=S.pid,as=((document.getElementById('esAs')||{}).value)||'family',nm=((document.getElementById('esN')||{}).value||'').trim();
      const r=s.apply(this,arguments);
      /* 23 Nov: the signature reaches the form record a moment after the save (blocks 141/145), so this runs again until it is there */
      const fill=()=>{try{
        const map=SIGNER[fid]&&SIGNER[fid][as];if(!map)return true;
        const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);if(!it)return true;
        const v=cdfVals(it.entryKey);let es=v.__esign;if(!es||!es.sig){const c=((window.psyPx?psyPx(pid):{}).consent||{})[fid];if(c&&c.st==='esign'&&c.sig)es=c;}if(!es||!es.sig)return false;
        const name=nm||String(es.by||'').replace(/\s*\(patient\)\s*$/i,'');
        /* empty blanks, and blanks the form filled by itself (Form E's "Name" got the patient's name), take the signer's details */
        const auto=v.__autoIds||{},put=(id,val)=>{if(id&&val&&(!v[id]||auto[id])){v[id]=val;delete auto[id];}};
        put(map.name,name);put(map.sent,name);put(map.rel,es.rel);put(map.date,today());
        /* the other side's date was only shown in case they sign: take it off again when it was not changed */
        Object.keys(SIGNER[fid]).forEach(k=>{const o=SIGNER[fid][k];if(k!==as&&o.date&&o.date!==map.date&&auto[o.date]&&!(o.name&&v[o.name]&&!auto[o.name])){delete v[o.date];delete auto[o.date];}});
        cdfTouch(it.entryKey);
      }catch(e){}return true;};
      if(!fill())[300,900,2000].forEach(t=>setTimeout(fill,t));else setTimeout(fill,900);
      return r;};
    Object.keys(s).forEach(k=>{if(k.indexOf('__')===0)window.psyEsignSave[k]=s[k];});window.psyEsignSave.__fill=1;
  };
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{wrapOpen();wrapSave();}catch(e){}return o;};
})();
