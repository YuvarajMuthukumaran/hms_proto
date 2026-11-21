/* 21 Nov 2026, meeting: every consent has two ways to be signed.
   Option 1: fill the form and take the e-signature on the screen (Collect e-signature, as before).
   Option 2: send the form to the nominated representative (NR) on WhatsApp so they can sign remotely.
   This block adds Option 2 to the four admission forms (Admission consent, Form E, High risk informed consent, Form C):
   a "Send to NR on WhatsApp" button on every form that is not signed yet. It opens a window with the NR, the message and a Send button.
   Send goes through /api/send/patient (the patient's WhatsApp group, by UHID). On real data WhatsApp stays simulated until
   WA_REAL_OK is set (lib/wa.js), so nothing reaches a family before consent is agreed. The request is saved on the form
   (consent[fid].remote: who sent it, when, and whether WhatsApp really sent it) and the row shows "Sent to NR on WhatsApp, waiting".
   When the NR has signed, "Record the signature" opens Collect e-signature (family) or Upload signed copy.
   NOT BUILT YET: the page the NR opens on their phone to sign. Until it exists the message asks them to contact the team. */
(function(){
  const E=s=>hesc(String(s==null?'':s));
  const FORMS=[['Admission consent form and letter of undertaking','admission-consent'],['Form E · request for admission','form-e'],['High risk informed consent','high-risk-consent'],['Form C · independent admission','form-c']];
  const nameOf=fid=>(FORMS.find(f=>f[1]===fid)||['Form'])[0];
  const fidOf=t=>{const s=String(t||'').trim();const f=FORMS.find(x=>s.indexOf(x[0])===0);return f?f[1]:'';};
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const pidNow=()=>decodeURIComponent((String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1]||'');
  const css=document.createElement('style');css.id='consent-nr-css';
  css.textContent='.nr-st{display:inline-block;margin-left:8px;font-size:12px;font-weight:600;border-radius:99px;padding:2px 9px;background:#eff8ff;color:#175cd3;border:1px solid #b2ddff}';
  document.head.appendChild(css);
  const identity=pid=>{try{return ptIdentity(ptFind(pid))||{};}catch(e){return {};}};
  const signed=c=>!!(c&&(c.st==='esign'||c.st==='uploaded'));

  window.nrOpen=function(pid,fid){
    const p=ptFind(pid)||{},id=identity(pid),nr=id.nr||'the nominated representative',rel=id.rel||'';
    const text='Dear '+nr+', Tulasi Healthcare would like you to read and sign the "'+nameOf(fid)+'" for '+(p.name||'the patient')+'. Please contact the ward team to complete it. Thank you.';
    V3.modal('Send to NR on WhatsApp · '+E(nameOf(fid)),'The nominated representative signs remotely. Option 2 of 2; the other option is Collect e-signature on this screen.',
      '<div class="ds-box" style="border:1px solid #e3eaf2;border-radius:12px;padding:12px 14px;background:#fbfcfe"><div class="small muted">Send to</div><div style="font-weight:700">'+E(nr)+(rel?' <span class="muted" style="font-weight:500">· '+E(rel)+'</span>':'')+'</div><div class="tiny muted">Goes to the patient\'s WhatsApp group with the family.</div></div>'
      +'<label class="field" style="margin-top:12px"><span class="lbl">Message</span><textarea class="input" id="nrMsg" rows="5">'+E(text)+'</textarea></label>'
      +'<div class="tiny muted">On real patients WhatsApp stays off until the family has agreed to it. The request is still saved here.</div><div id="nrE" class="small" style="color:var(--red);display:none"></div>',
      '<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="nrGo" data-p="'+E(pid)+'" data-f="'+E(fid)+'" onclick="nrSend(this.dataset.p,this.dataset.f)">Send on WhatsApp</button>');
  };
  window.nrSend=async function(pid,fid){
    const txt=((document.getElementById('nrMsg')||{}).value||'').trim();if(!txt)return;
    const b=document.getElementById('nrGo');if(b){b.disabled=true;b.textContent='Sending…';}
    const p=ptFind(pid)||{};let sent=false,note='';
    try{
      const r=await fetch('/api/send/patient',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uhid:p.uhid||'',text:txt,by:signer()})});
      const j=await r.json().catch(()=>({}));sent=!!(r.ok&&j.ok);note=sent?(j.simulated?'simulated':''):(j.error||'WhatsApp not connected');
    }catch(e){note='WhatsApp not connected';}
    const x=px(pid);x.consent=x.consent||{};const c=x.consent[fid]||(x.consent[fid]={st:'due'});
    c.remote={by:signer(),at:atNow(),sent,note,to:identity(pid).nr||''};
    try{V3.log(pid,S.role,'note',nameOf(fid)+' sent to the nominated representative on WhatsApp'+(sent?'':' (request saved, '+(note||'not sent')+')'));}catch(e){}
    closeModal();render();toast(sent?'Sent to the nominated representative on WhatsApp':'Request saved. WhatsApp did not send ('+(note||'off')+')');
  };
  window.nrRecord=function(pid,fid){
    V3.modal('Record the signature · '+E(nameOf(fid)),'The nominated representative has signed.','<div class="small">Take the signature on this screen, or upload the signed copy from the Admission forms table.</div>',
      '<button class="btn" onclick="closeModal()">Close</button><button class="btn pri" data-f="'+E(fid)+'" onclick="closeModal();psyEsignOpen(this.dataset.f)">Collect e-signature</button>');
  };
  function decorate(){
    const pid=pidNow();if(!pid)return;
    document.querySelectorAll('#consentCard tbody tr, #formcCard tbody tr').forEach(tr=>{
      if(tr.dataset.nr)return;const fid=fidOf((tr.querySelector('td')||{}).textContent);if(!fid)return;
      const c=(px(pid).consent||{})[fid];if(signed(c))return;
      tr.dataset.nr='1';
      const cs=tr.querySelector('.cs');
      if(c&&c.remote&&cs){const t=document.createElement('span');t.className='nr-st';t.textContent='Sent to NR on WhatsApp, waiting'+(c.remote.sent?'':' (not delivered)');cs.after(t);}
      const last=tr.querySelector('td:last-child .ct-a')||tr.querySelector('td:last-child');if(!last)return;
      const b=document.createElement('button');b.type='button';b.className='btn sm';b.textContent=c&&c.remote?'Record the signature':'Send to NR on WhatsApp';b.dataset.p=pid;b.dataset.f=fid;
      b.setAttribute('onclick',(c&&c.remote?'nrRecord':'nrOpen')+'(this.dataset.p,this.dataset.f)');last.appendChild(b);
    });
  }
  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{decorate();}catch(e){}return o;};
  let tm=0;new MutationObserver(()=>{if(tm)return;tm=setTimeout(()=>{tm=0;if(!document.querySelector('#consentCard,#formcCard'))return;try{decorate();}catch(e){}},250);}).observe(document.body,{childList:true,subtree:true});
})();
