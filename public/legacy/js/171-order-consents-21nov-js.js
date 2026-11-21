/* 21 Nov 2026, Trello backlog: "put all the concerned consent forms in these (Orders and Consents) with two options:
   1. Collect e-signature  2. Send consent on WhatsApp. The forms should have all the info filled automatically, with an option
   to edit it; the doctor's signature part should ask the doctor to sign the form before it is sent to the family member."
   Psychiatrist and floor lead psychiatrist (Treatment Plan > Orders and Consents).
   - MECT, Outing or leave and Clozapine consent cards show their consent form with its state and two buttons.
     Ketamine, DTMS, Restraint and Long-acting injection have no consent form in the forms library yet, so they say so.
   - Collect e-signature: the same window as the admission forms (form filled in and editable, then the signature).
   - Send on WhatsApp: a window with the form (filled in, editable), "I have read the form and I sign it as the doctor" and the
     message. Send stays off until the doctor has signed. The doctor's signature is saved with the form (consent[fid].doc and the
     form record), then the message goes through nrSend (block 164): simulated on real patients until WA_REAL_OK is set.
   - After the patient or family has signed in person: "Doctor sign" (block 163) if the doctor has not signed yet. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const E=s=>hesc(String(s==null?'':s));
  const OC={mect:['MECT consent','mect-final'],out:['Outing consent','outing-consent'],cloz:['Clozapine consent','clozapine-consent'],
    ket:null,dtms:null,rest:null,lai:null};
  try{const L=window.__psyForms;if(Array.isArray(L))Object.values(OC).forEach(o=>{if(o&&!L.some(f=>f[1]===o[1]))L.push([o[0],o[1]]);});}catch(e){}
  const nameOf=fid=>(Object.values(OC).find(o=>o&&o[1]===fid)||['Consent'])[0];
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const atNow=()=>{const d=new Date();return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'})+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});};
  const pidNow=()=>decodeURIComponent((String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1]||'');
  const css=document.createElement('style');
  css.textContent='.oc-cs{margin-top:10px;padding-top:10px;border-top:1px dashed #e3eaf2;display:flex;flex-direction:column;gap:6px}'
    +'.oc-st{font-size:12px;color:#475467;line-height:1.35}.oc-st b{color:#101828;font-weight:650}.oc-st.ok{color:#067647}.oc-st.wait{color:#b54708}'
    +'.oc-b{display:flex;flex-wrap:wrap;gap:6px}.oc-none{font-size:12px;color:#98a2b3;margin-top:10px}'
    +'.oc-form{max-height:46vh;overflow:auto;border:1px solid #e3eaf2;border-radius:10px;background:#f2f4f7;padding:10px;margin-bottom:12px}'
    +'.oc-tick{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid #b2ddff;background:#eff8ff;border-radius:10px;font-size:14px;margin-bottom:10px}.oc-tick input{width:18px;height:18px;margin-top:2px}';
  document.head.appendChild(css);

  function state(pid,fid){
    const c=(px(pid).consent||{})[fid]||null;
    const signed=c&&(c.st==='esign'||c.st==='uploaded');
    if(signed){
      const who=c.st==='uploaded'?'Signed copy uploaded':'Signed by '+(c.as==='patient'?'the patient, ':'')+(c.by||'')+(c.rel&&c.as!=='patient'?' ('+c.rel+')':'');
      return {c,signed,html:`<div class="oc-st ok"><b>${E(who)}</b>${c.at?' · '+E(c.at):''}${c.doc?'<br>Doctor signed: '+E(c.doc.by)+' · '+E(c.doc.at):''}</div>`};
    }
    if(c&&c.remote)return {c,html:`<div class="oc-st wait"><b>Sent on WhatsApp</b> · ${E(c.remote.at||'')}${c.remote.sent?'':' (not delivered)'} · waiting for the family</div>`};
    return {c,html:`<div class="oc-st">${c&&c.doc?'Doctor signed · not sent or signed by the family yet':'Not signed yet'}</div>`};
  }
  function strip(pid,key){
    const o=OC[key];
    if(!o)return `<div class="oc-none">No consent form for this order in the forms library yet.</div>`;
    const fid=o[1],s=state(pid,fid),q=`'${E(pid)}','${fid}'`;
    let b='';
    if(s.signed){b=`<button class="btn sm" onclick="acrOpenForm('${fid}')">Open form</button>`+(s.c.doc?'':`<button class="btn sm pri" onclick="dsOpen(${q})">Doctor sign</button>`);}
    else b=`<button class="btn sm pri" onclick="psyEsignOpen('${fid}')">Collect e-signature</button><button class="btn sm" onclick="ocSend(${q})">${s.c&&s.c.remote?'Send again on WhatsApp':'Send on WhatsApp'}</button>`;
    return `<div class="oc-cs" data-oc="${key}"><div class="oc-st"><b>${E(o[0])}</b></div>${s.html}<div class="oc-b">${b}</div></div>`;
  }

  /* the form, filled in and editable, inside a window */
  function formBox(pid,fid){
    const meta=CDF_FORMS&&CDF_FORMS[fid];if(!meta)return '';
    CD_DATA=cdLoad();const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);if(!it)return '';
    const p=(typeof ptFind==='function'&&ptFind(pid))||{},ep=(CD_DATA.episodes||{})[pid]||{},v=cdfVals(it.entryKey);let ch=false;
    meta.pages.forEach(pg=>pg.fields.forEach(f=>{if(f.kind==='check'||f.kind==='choice'||v[f.id])return;let a='';try{a=cdfAuto(f.label,p,ep)||'';}catch(e){}if(a){v[f.id]=a;(v.__autoIds=v.__autoIds||{})[f.id]=1;ch=true;}}));
    if(ch)cdSave();
    S.cdEntryKey=it.entryKey;S.cdPatient=pid;
    const auto=v.__autoIds||{};
    return `<div class="oc-form es-form"><div>${meta.pages.map((pg,i)=>`<div class="cdf-page" style="width:${pg.w*CDF_K}px;height:${pg.h*CDF_K}px;margin:0 auto 10px"><img src="${pg.img}" alt="Form page ${i+1}" draggable="false">${pg.fields.map(f=>cdfFieldHtml(f,v,!!auto[f.id],true)).join('')}</div>`).join('')}</div></div>`;
  }
  window.ocSend=function(pid,fid){
    const p=(typeof ptFind==='function'&&ptFind(pid))||{};let id={};try{id=ptIdentity(p)||{};}catch(e){}
    const nr=id.nr||'the nominated representative',c=(px(pid).consent||{})[fid]||{};
    const text='Dear '+nr+', Tulasi Healthcare would like you to read and sign the "'+nameOf(fid)+'" for '+(p.name||'the patient')+'. Please contact the ward team to complete it. Thank you.';
    const docDone=!!c.doc;
    V3.modal('Send on WhatsApp · '+E(nameOf(fid)),'Check the form (filled in from the record, you can edit it), sign it as the doctor, then send it to the family.',
      formBox(pid,fid)
      +(docDone?`<div class="oc-st ok" style="margin-bottom:10px"><b>Doctor signed</b> · ${E(c.doc.by)} · ${E(c.doc.at)}</div>`
        :`<label class="oc-tick"><input type="checkbox" id="ocTick" onchange="document.getElementById('nrGo').disabled=!this.checked"><span>I have read the form and I sign it as the doctor (${E(signer())}).</span></label>`)
      +`<div class="small muted">Send to <b>${E(nr)}</b>${id.rel?' · '+E(id.rel):''}</div><label class="field" style="margin-top:6px"><span class="lbl">Message</span><textarea class="input" id="nrMsg" rows="4">${E(text)}</textarea></label>`
      +'<div class="tiny muted">On real patients WhatsApp stays off until the family has agreed to it. The request is still saved here.</div>',
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="nrGo" ${docDone?'':'disabled'} onclick="ocGo('${E(pid)}','${fid}')">Sign and send on WhatsApp</button>`,'min(820px,100%)');
  };
  window.ocGo=function(pid,fid){
    const x=px(pid);x.consent=x.consent||{};const c=x.consent[fid]||(x.consent[fid]={st:'due'});
    if(!c.doc){const t=document.getElementById('ocTick');if(!t||!t.checked)return;
      c.doc={by:signer(),at:atNow()};
      try{const it=cdItems(pid).find(i=>i.form&&i.form.id===fid);if(it){cdfVals(it.entryKey).__docsign=c.doc;cdfTouch(it.entryKey);}}catch(e){}
      try{V3.log(pid,S.role,'note',nameOf(fid)+' signed by the doctor before sending, '+c.doc.by);}catch(e){}}
    if(typeof window.nrSend==='function')window.nrSend(pid,fid);else{closeModal();render();}
  };

  const __r=render;
  render=function(){
    const o=__r.apply(this,arguments);
    try{
      const pid=pidNow();if(!pid)return o;
      document.querySelectorAll('#view button[onclick^="psyTmOrder("]').forEach(b=>{
        const key=(String(b.getAttribute('onclick')).match(/psyTmOrder\('([^']+)'/)||[])[1];if(!key||!(key in OC))return;
        const card=b.parentElement;if(!card||card.querySelector('.oc-cs,.oc-none'))return;
        card.insertAdjacentHTML('beforeend',strip(pid,key));
      });
    }catch(e){}
    return o;
  };
})();
