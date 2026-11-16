/* 16 Nov 2026, Trello "Review: MHCA clock rules", Dr. Anu's answer 5 and 7:
   - Chemical restraint (injectables): the consent can be taken in advance (for example at admission) and lasts the stay.
   - Physical restraint (and seclusion): a separate consent is taken at the time of the restraint.
   - The psychiatrist explains it; the signature can be taken by anyone (psychologist, front desk, floor manager, nurse).
   Uses the existing Consents list (Request consent / Take consent). Authorising restraint never waits for a signature: if the right consent is missing,
   a consent task is created at once for the nurse in charge. */
(function(){
  const has=(re,green)=>(S.consents||[]).some(c=>re.test(String(c.name||''))&&(!green||c.c==='c-green'));
  window.rstConsentFor=function(ep){
    if(!S.consents)return;
    const phys=/^(Physical|Seclusion)$/.test(ep.type),name=phys?'Physical restraint consent':'Chemical restraint consent';
    if(!phys&&has(/^Chemical restraint consent/,true))return;           /* already signed in advance */
    if(has(new RegExp('^'+name),false)&&(S.consents||[]).some(c=>new RegExp('^'+name).test(c.name)&&c.c==='c-amber'))return; /* already requested */
    S.cnN=(S.cnN||0)+1;
    S.consents.push({id:'cn'+S.cnN,name,who:'Patient or NR',st:'Requested by '+signer()+' · '+(typeof clock==='function'?clock():'now')+' · to Nurse in charge · needed now. '+(phys?'Taken at the time of the restraint.':'Not signed in advance.'),c:'c-amber',to:'Nurse in charge',need:'Now',form:'rest',by:signer()});
    try{toast((phys?'Physical restraint consent':'Chemical restraint consent')+' task created. Anyone on the team can take the signature.');}catch(e){}
  };
  const __m=window.restraintModal||(typeof restraintModal==='function'?restraintModal:null);
  if(__m){
    const w=function(){
      const r=__m.apply(this,arguments);
      try{const mb=document.querySelector('#modal .mb');
        if(mb&&!mb.querySelector('#rstConsentNote')){
          const adv=has(/^Chemical restraint consent/,true);
          const d=document.createElement('div');d.id='rstConsentNote';d.className='callout grey small';d.style.marginTop='8px';
          d.innerHTML='<b>Consent.</b> Chemical restraint (injectables): '+(adv?'signed in advance.':'no signed consent on file; it can be taken in advance from Orders and consents.')+' Physical restraint: a separate consent is taken at the time of the restraint. You explain it; anyone on the team can take the signature. This does not delay the restraint.';
          mb.insertBefore(d,mb.querySelector('#rstE')||null);}
      }catch(e){}
      return r;
    };
    try{restraintModal=w;}catch(e){}window.restraintModal=w;
  }
})();
