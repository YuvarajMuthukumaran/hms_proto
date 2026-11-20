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
    '.m20-sign .m20-who{display:grid;grid-template-columns:1fr;gap:12px;max-width:760px}.m20-sign .m20-who .sn-chips{display:flex;flex-wrap:wrap;gap:6px}'+
    '@media(max-width:700px){.m20-sign .m20-who{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  /* ---------- 1. OPD record button ---------- */
  /* 20 Nov 2026 (owner, screenshot): psychiatrist's Round note is the 5th button of that column, styled like the others */
  function roundButton(){
    /* the psychologist's Session note goes the same way (owner, later 20 Nov: 'make all the changes in psychology login also') */
    const hd=document.querySelector('#view .dph');if(!hd)return;
    const col=hd.querySelector('.dpact');if(!col)return;
    const b=[...hd.querySelectorAll('button')].find(x=>/^(Round note|Session note)$/i.test((x.textContent||'').trim()));if(!b)return;
    if(b.parentElement===col&&b.dataset.m20)return;
    b.dataset.m20='1';b.className='btn soft m20-rn';
    if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin','<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> ');
    const btns=[...col.querySelectorAll(':scope > button')];
    const last=btns[btns.length-1];if(last)last.after(b);else col.insertBefore(b,col.firstChild);
  }
  /* 20 Nov 2026 (owner, WhatsApp "the text is contradictory"): the signed history said it "cannot be edited" next to an Edit history
     button. Where Edit history is offered, the line says how editing works instead. */
  function histLockText(){
    document.querySelectorAll('#view .lkbox[data-lk="hist"]').forEach(b=>{
      if(!b.querySelector('[data-acr-he]'))return;
      const s=b.querySelector(':scope > span');if(!s||s.dataset.m20)return;
      const t=s.innerHTML,re=/\.\s[^.<]*cannot be edited or deleted\. Only an addendum can be added\./;if(!re.test(t))return;
      s.dataset.m20='1';
      s.innerHTML=t.replace(re,'. To change it, use Edit history: it reopens for editing and must be signed again, and the reopening is recorded below. Or add an addendum.');
    });
  }
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
  /* 20 Nov 2026 (owner): the relation drop-down list was cut off at the bottom of the window, so the relations are tap bubbles */
  window.m20RelSet=function(v){const s=document.getElementById('m20Rel');if(!s||s.dataset.lock)return;s.value=v;document.querySelectorAll('#m20RelC .sn-c').forEach(b=>b.classList.toggle('on',b.dataset.v===v));m20RelPick(v);const e=document.getElementById('m20RelE');if(e)e.style.display='none';};
  window.m20RelPick=function(v){const o=document.getElementById('m20RelO');if(o)o.style.display=v==='__o'?'':'none';};
  window.m20AsPick=function(){
    const as=(document.getElementById('esAs')||{}).value,s=document.getElementById('m20Rel');if(!s)return;
    if(as==='patient'){delete s.dataset.lock;m20RelSet('Self');s.dataset.lock='1';}else{delete s.dataset.lock;if(s.value==='Self')m20RelSet('');}
  };
  function layout(){
    const c=document.getElementById('esC'),n=document.getElementById('esN');if(!c||!n)return;
    const row=c.closest('.pg-sign-row');if(!row||row.dataset.m20)return;
    row.dataset.m20='1';row.classList.add('m20-sign');
    const asF=(document.getElementById('esAs')||{}).closest?document.getElementById('esAs').closest('.field'):null;
    const nameF=n.closest('.field');
    const sigBox=c.parentElement;sigBox.classList.add('m20-sig');
    const who=document.createElement('div');who.className='m20-who';
    who.innerHTML=`<div class="field"><span class="lbl">Relation with the patient</span><input type="hidden" id="m20Rel" value=""><div class="sn-chips" id="m20RelC">${['Self'].concat(RELS).map(r=>`<button type="button" class="sn-c" data-v="${E(r)}" onclick="m20RelSet(this.dataset.v)">${E(r)}</button>`).join('')}<button type="button" class="sn-c" data-v="__o" onclick="m20RelSet('__o')">Other (write it)</button></div><input class="input" id="m20RelO" placeholder="Relation" style="display:none;margin-top:6px"><span id="m20RelE" class="small" style="color:var(--red);display:none;margin-top:4px">Choose the relation with the patient</span></div>`;
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
  render=function(){const o=__r.apply(this,arguments);try{wrapOpen();wrapSave();wrapView();opdButton();roundButton();histLockText();}catch(e){}return o;};
  try{opdButton();roundButton();}catch(e){}
})();
