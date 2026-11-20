/* 20 Nov 2026, meeting with Dr. Anu and Nikita (recording 20 Nov). Psychiatrist, floor lead psychiatrist, psychologist, floor lead psychologist.
   1. OPD record: a button in the patient header's button column (straight under Message caregiver), not a chip next to the Section chip.
      The header buttons stay stacked one under the other, all the same width.
   2. Collect e-signature window: the signature box comes first, full width and on the left (not beside the name), then the name of the
      person signing and a new "Relation with the patient" field (Self for the patient). The relation is saved with the signature, shown
      under Open Form, and written into the form's own "Relation with the patient" blank when that blank is still empty. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const RELS=['Father','Mother','Spouse','Son','Daughter','Brother','Sister','Guardian','Nominated representative','Other relative','Friend'];

  const css=document.createElement('style');css.id='m20-opd-esign-css';
  css.textContent=
    '#view .dph .dpact .btn{width:100%;justify-content:center}'+
    '#view .dph .dpact .acr-opd svg{flex:0 0 auto}'+
    /* e-sign: one column, signature first */
    '.m20-sign{display:flex!important;flex-direction:column;gap:12px;align-items:stretch}'+
    '.m20-sign .m20-sig{max-width:560px}'+
    '.m20-sign .m20-sig .ct-pad{width:100%!important;height:110px!important;display:block}'+
    '.m20-sign .m20-who{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;max-width:760px}'+
    '@media(max-width:700px){.m20-sign .m20-who{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  /* ---------- 1. OPD record button ---------- */
  function opdButton(){
    const hd=document.querySelector('#view .dph');if(!hd)return;
    const b=hd.querySelector('.acr-opd'),col=hd.querySelector('.dpact');if(!b||!col)return;
    if(b.parentElement===col&&b.dataset.m20)return;
    b.dataset.m20='1';b.className='btn soft acr-opd';
    const msg=[...col.querySelectorAll('button')].find(x=>/Message caregiver/i.test(x.textContent));
    if(msg)msg.after(b);else col.insertBefore(b,col.firstChild);
  }

  /* ---------- 2. e-sign window ---------- */
  const relVal=()=>{const s=document.getElementById('m20Rel');if(!s)return '';return s.value==='__o'?((document.getElementById('m20RelO')||{}).value||'').trim():s.value;};
  window.m20RelPick=function(v){const o=document.getElementById('m20RelO');if(o)o.style.display=v==='__o'?'':'none';};
  window.m20AsPick=function(){
    const as=(document.getElementById('esAs')||{}).value,s=document.getElementById('m20Rel');if(!s)return;
    if(as==='patient'){s.value='Self';s.disabled=true;m20RelPick('Self');}else{if(s.value==='Self')s.value='';s.disabled=false;}
  };
  function layout(){
    const c=document.getElementById('esC'),n=document.getElementById('esN');if(!c||!n)return;
    const row=c.closest('.pg-sign-row');if(!row||row.dataset.m20)return;
    row.dataset.m20='1';row.classList.add('m20-sign');
    const asF=(document.getElementById('esAs')||{}).closest?document.getElementById('esAs').closest('.field'):null;
    const nameF=n.closest('.field');
    const sigBox=c.parentElement;sigBox.classList.add('m20-sig');
    const who=document.createElement('div');who.className='m20-who';
    who.innerHTML=`<label class="field"><span class="lbl">Relation with the patient</span><select class="input" id="m20Rel" onchange="m20RelPick(this.value)"><option value="">Choose…</option><option>Self</option>${RELS.map(r=>`<option>${E(r)}</option>`).join('')}<option value="__o">Other (write it)</option></select><input class="input" id="m20RelO" placeholder="Relation" style="display:none;margin-top:6px"><span id="m20RelE" class="small" style="color:var(--red);display:none;margin-top:4px">Choose the relation with the patient</span></label>`;
    if(nameF)who.insertBefore(nameF,who.firstChild);
    /* order: who is signing, signature, then name and relation side by side */
    row.innerHTML='';
    if(asF)row.appendChild(asF);
    row.appendChild(sigBox);row.appendChild(who);
    const sl=sigBox.querySelector('.lbl');if(sl)sl.style.margin='0 0 6px';
    const as=document.getElementById('esAs');if(as){as.addEventListener('change',m20AsPick);m20AsPick();}
    if(n.placeholder)n.placeholder='Full name of the person signing';
  }
  const wrapOpen=()=>{
    const o=window.psyEsignOpen;if(typeof o!=='function'||o.__m20)return;
    window.psyEsignOpen=function(){const r=o.apply(this,arguments);[150,320,600].forEach(t=>setTimeout(()=>{try{layout();}catch(e){}},t));return r;};
    window.psyEsignOpen.__m20=1;window.psyEsignOpen.__acr=1;
  };
  const wrapSave=()=>{
    const s=window.psyEsignSave;if(typeof s!=='function'||s.__m20)return;
    window.psyEsignSave=function(fid){
      const relSel=document.getElementById('m20Rel');
      const rel=relVal(),err=document.getElementById('m20RelE');
      if(relSel&&!rel){if(err)err.style.display='block';return;}
      if(err)err.style.display='none';
      const pid=S.pid;let before=null;try{before=(psyPx(pid).consent||{})[fid]||null;}catch(e){}
      const r=s.apply(this,arguments);
      try{
        const c=(psyPx(pid).consent||{})[fid];
        if(c&&c!==before&&c.st==='esign'&&rel){
          c.rel=rel;
          /* no cdLoad() here: block 141 has just put __esign into the in-memory form record and saves it a moment later */
          const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);
          if(it){const v=cdfVals(it.entryKey);if(v.__esign)v.__esign.rel=rel;
            const meta=(typeof CDF_FORMS!=='undefined'&&CDF_FORMS[fid])||null;
            if(meta)meta.pages.forEach(pg=>pg.fields.forEach(f=>{if(/^Relation (with|of)/i.test(String(f.label||'').trim())&&!v[f.id])v[f.id]=rel;}));
            S.cdEntryKey=it.entryKey;cdfTouch(it.entryKey);}
        }
      }catch(e){}
      return r;
    };
    window.psyEsignSave.__m20=1;window.psyEsignSave.__acr=1;
  };
  /* Open Form: show the relation under the signature */
  const wrapView=()=>{
    const o=window.acrOpenForm;if(typeof o!=='function'||o.__m20)return;
    window.acrOpenForm=function(fid){
      const r=o.apply(this,arguments);
      try{
        let rel=((psyPx(S.pid).consent||{})[fid]||{}).rel||'';
        if(!rel){CD_DATA=cdLoad();const it=cdItems(S.pid).find(i=>i.form&&i.form.id===fid);rel=it?((cdfVals(it.entryKey).__esign||{}).rel||''):'';}
        const sm=document.querySelector('#modal .box .small');
        if(rel&&sm&&!sm.dataset.m20){sm.dataset.m20='1';sm.insertAdjacentHTML('beforeend',' · Relation: '+E(rel));}
      }catch(e){}
      return r;
    };
    window.acrOpenForm.__m20=1;
  };
  wrapOpen();wrapSave();wrapView();

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{wrapOpen();wrapSave();wrapView();opdButton();}catch(e){}return o;};
  try{opdButton();}catch(e){}
})();
