/* 21 Nov 2026, Dr. Anu (WhatsApp): "you need to specify the location of signatures and names".
   Form C, Form E and High risk informed consent had no signature spot (their printed "Signature" has no field), so the drawn signature
   was not placed on the page. Each now has one, taken from the printed page (page units, 595 x 842):
   - Form C: beside "Signature", above Name (x 219, y 490).
   - Form E: under the Signature label at the foot of the page (x 100, y 596), signed by the nominated representative.
   - High risk informed consent: "Signature of Guardian", left, above the Name line (x 50, y 424).
   The doctor's signature is the tick box (block 163) and appears in the Signatures panel, not on the page.
   Names already have their own fields on each form (Name, Relation with the patient, Date). */
(function(){
  let F;try{F=CDF_FORMS;}catch(e){return;}if(!F)return;
  const SPOTS={
    'form-c':{id:'sigC',x:219,y:490,w:305,h:12,label:'Signature of the patient or family'},
    'form-e':{id:'sigE',x:100,y:596,w:300,h:12,label:'Signature of the nominated representative'},
    'high-risk-consent':{id:'sigH',x:50,y:424,w:230,h:12,label:'Signature of the guardian'}
  };
  Object.keys(SPOTS).forEach(k=>{
    const m=F[k];if(!m||!m.pages||!m.pages[0])return;const pg=m.pages[0];
    if(pg.fields.some(f=>f.id===SPOTS[k].id))return;
    pg.fields.push(Object.assign({kind:'line',size:9.5},SPOTS[k]));
  });
})();
