/* 21 Nov 2026, Dr. Anu (WhatsApp): "make sure to differentiate what happens when family signs and what happens when patient signs it;
   make sure the doctor signs after the signatures are collected from either patient or family; for the doctor you can make a tick box:
   I have read it and sign".
   Admission forms (Admission consent, Form E, High risk informed consent, Form C):
   1. After the patient or the family has e-signed (or a signed copy is uploaded) the row shows who signed ("Signed by the patient" or
      "Signed by family: name, relation") and "Awaiting doctor".
   2. The psychiatrist and floor lead psychiatrist get a "Doctor sign" button. It opens a window with who signed, when, the signature,
      and a tick box "I have read the form and the signature above, and I sign". Sign stays off until the box is ticked.
   3. The doctor's name and time are saved with the form (consent record and the form record, so every login sees it) and "Open Form"
      shows a "Signatures" panel: patient or family (name, relation, time) and the doctor (name, time).
   The doctor cannot sign before the patient or family has signed. Other roles see "Awaiting doctor". */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  const DOC=/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE);
  const E=s=>hesc(String(s==null?'':s));
  const FORMS=[['Admission consent form and letter of undertaking','admission-consent'],['Form E · request for admission','form-e'],['High risk informed consent','high-risk-consent'],['Form C · independent admission','form-c']];
  const nameOf=fid=>(FORMS.find(f=>f[1]===fid)||['Form'])[0];
  const fidOf=t=>{const s=String(t||'').trim();const f=FORMS.find(x=>s.indexOf(x[0])===0);return f?f[1]:'';};
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const keyOf=(pid,fid)=>{try{CD_DATA=cdLoad();const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);return it?it.entryKey:'';}catch(e){return '';}};
  const rec=(pid,fid)=>{
    const c=(px(pid).consent||{})[fid]||null;let k='',v=null;
    try{k=keyOf(pid,fid);v=k?cdfVals(k):null;}catch(e){}
    const es=(c&&(c.st==='esign'||c.st==='uploaded'))?c:(v&&v.__esign&&v.__esign.sig?{st:'esign',by:v.__esign.by,at:v.__esign.at,as:v.__esign.as,rel:v.__esign.rel}:null);
    const doc=(c&&c.doc)||(v&&v.__docsign)||null;
    return {c,es,doc,k,v};
  };
  const who=es=>!es?'':es.st==='uploaded'?'Signed copy uploaded':es.as==='patient'?'Signed by the patient':'Signed by family: '+(es.by||'')+(es.rel?', '+es.rel:'');

  const css=document.createElement('style');css.id='doctor-sign-css';
  css.textContent='.ds-st{display:inline-block;margin-left:8px;font-size:12px;font-weight:600;border-radius:99px;padding:2px 9px;background:#fffaeb;color:#b54708;border:1px solid #fedf89}.ds-st.ok{background:#ecfdf3;color:#067647;border-color:#abefc6}'
   +'.ds-box{border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;background:#fbfcfe;margin-top:10px}.ds-row{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px solid #eef2f6;font-size:13.5px}.ds-row:first-of-type{border-top:0}.ds-row .l{color:#667085}'
   +'.ds-tick{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:12px;border:1px solid #cfe0ff;border-radius:10px;background:#f5f9ff;font-size:14px;font-weight:600;cursor:pointer}.ds-tick input{width:20px;height:20px;margin:1px 0 0;flex:none}';
  document.head.appendChild(css);

  /* the "Signatures" panel: used in the Doctor sign window and in Open Form */
  function sigPanel(pid,fid){
    const r=rec(pid,fid),es=r.es,doc=r.doc;
    return '<div class="ds-box" id="dsPanel"><div class="lbl" style="margin-bottom:4px"><b>Signatures</b></div>'
      +'<div class="ds-row"><span class="l">'+(es&&es.as==='patient'?'Patient':'Family or nominated representative')+'</span><span>'+(es?E(who(es))+'<div class="tiny muted">'+E(es.at||'')+'</div>'+(es.sig?'<img alt="Signature" src="'+E(es.sig)+'" style="display:block;max-width:240px;max-height:80px;margin-top:6px;border-bottom:1px solid #98a2b3">':''):'<span class="muted">Not signed yet. The patient or the family signs first.</span>')+'</span></div>'
      +'<div class="ds-row"><span class="l">Doctor</span><span>'+(doc?'<b>'+E(doc.by)+'</b> signed<div class="tiny muted">'+E(doc.at||'')+'</div>':'<span class="muted">'+(es?'Awaiting the doctor':'After the patient or family has signed')+'</span>')+'</span></div></div>';
  }

  window.dsOpen=function(pid,fid){
    const r=rec(pid,fid);if(!r.es){toast('The patient or the family has to sign first');return;}
    V3.modal('Doctor sign · '+E(nameOf(fid)),'Read the form and the signature, then tick the box.',
      sigPanel(pid,fid)+(r.doc?'':'<label class="ds-tick"><input type="checkbox" id="dsTick" onchange="document.getElementById(\'dsGo\').disabled=!this.checked"><span>I have read the form and the signature above, and I sign.</span></label>'),
      '<button class="btn" onclick="closeModal()">'+(r.doc?'Close':'Cancel')+'</button>'+(r.doc?'':'<button class="btn pri" id="dsGo" disabled data-p="'+E(pid)+'" data-f="'+E(fid)+'" onclick="dsSign(this.dataset.p,this.dataset.f)">Sign as doctor</button>'));
  };
  window.dsSign=function(pid,fid){
    const t=document.getElementById('dsTick');if(!t||!t.checked)return;
    const x=px(pid);x.consent=x.consent||{};const c=x.consent[fid]||(x.consent[fid]={st:'due'});
    const d={by:signer(),at:atNow()};c.doc=d;
    try{const k=keyOf(pid,fid);if(k){const v=cdfVals(k);v.__docsign=d;cdfTouch(k);}}catch(e){}
    try{V3.log(pid,S.role,'note',nameOf(fid)+' signed by the doctor, '+d.by);}catch(e){}
    closeModal();render();toast(nameOf(fid)+': signed by '+d.by);
  };

  /* admission forms tables and the Form C row: status and button */
  function decorate(){
    const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);if(!m)return;const pid=decodeURIComponent(m[1]);
    document.querySelectorAll('#consentCard tbody tr, #formcCard tbody tr').forEach(tr=>{
      if(tr.dataset.ds)return;const fid=fidOf((tr.querySelector('td')||{}).textContent);if(!fid)return;
      const r=rec(pid,fid);if(!r.es)return;tr.dataset.ds='1';
      const cs=tr.querySelector('.cs');
      if(cs){const t=document.createElement('span');t.className='ds-st'+(r.doc?' ok':'');t.textContent=who(r.es)+(r.doc?' · Doctor signed':' · Awaiting doctor');cs.after(t);}
      const last=tr.querySelector('td:last-child .ct-a')||tr.querySelector('td:last-child');
      if(last&&!r.doc&&DOC){const b=document.createElement('button');b.type='button';b.className='btn sm pri';b.textContent='Doctor sign';b.dataset.p=pid;b.dataset.f=fid;b.setAttribute('onclick','dsOpen(this.dataset.p,this.dataset.f)');last.appendChild(b);}
    });
    const fc=document.querySelector('.pg-fc');
    if(fc&&!fc.dataset.ds){const r=rec(pid,'form-c');if(r.es){fc.dataset.ds='1';const t=document.createElement('span');t.className='ds-st'+(r.doc?' ok':'');t.textContent=who(r.es)+(r.doc?' · Doctor signed':' · Awaiting doctor');fc.appendChild(t);
      if(!r.doc&&DOC){const b=document.createElement('button');b.type='button';b.className='btn sm pri';b.textContent='Doctor sign';b.dataset.p=pid;b.dataset.f='form-c';b.setAttribute('onclick','dsOpen(this.dataset.p,this.dataset.f)');fc.appendChild(b);}}}
  }
  /* Open Form: add the Signatures panel */
  const __open=window.acrOpenForm;
  if(typeof __open==='function'){
    window.acrOpenForm=function(fid){
      const r=__open.apply(this,arguments);
      try{const pid=S.pid||(String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1];const mb=document.querySelector('.modal .mb');
        if(mb&&pid&&!document.getElementById('dsPanel'))mb.insertAdjacentHTML('beforeend',sigPanel(pid,fid));}catch(e){}
      return r;
    };
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{decorate();}catch(e){}return o;};
  let tm=0;new MutationObserver(()=>{if(tm)return;tm=setTimeout(()=>{tm=0;if(!document.querySelector('#consentCard,#formcCard,.pg-fc'))return;try{decorate();}catch(e){}},250);}).observe(document.body,{childList:true,subtree:true});
})();
