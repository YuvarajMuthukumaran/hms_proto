/* 199 · 24 Nov (owner): no word-choice ovals over printed text ("Mr/Mrs/Ms", "son/daughter/wife", "advance and/on weekly"):
   they need no filling, so those choice fields are dropped from the forms. Real pick lists stay (psychiatric history,
   MECT history picks, capacity p1f8, outing m196oc6). Blanks are 95% see-through (192) so the print under them shows. */
(function(){
  if(typeof CDF_FORMS==='undefined')return;
  const DROP={
    'adm-terms':['p4f2','p4f5','p4f8','p7f5'],
    'admission-consent':['p1f18'],
    'clozapine-consent':['p1f3','p1f9','p1f11','p1f13','p1f16'],
    'form-c':['p1f3'],
    'high-risk-consent':['p1f1','p1f2','p1f3','p1f9'],
    'mect-final':['p8f1'],
    'reassessment':['p1f5'],
    'capacity-assessment':['p2f4','p2f11','p2f14']
  };
  Object.keys(DROP).forEach(fid=>{const m=CDF_FORMS[fid];if(!m||!m.pages)return;const d=DROP[fid];
    m.pages.forEach(pg=>{if(pg.fields)pg.fields=pg.fields.filter(f=>!(f.kind==='choice'&&d.includes(f.id)));});});
  const st=document.createElement('style');
  st.textContent='.cdf-page .cdf-f.cdf-opt:not(.cdf-ro){box-shadow:none!important;border:1.5px solid #2e90fa!important;background:#d9eaff!important}'
    +'.cdf-page .cdf-f.cdf-opt.on{background:#2e90fa!important;color:#fff!important}';
  document.head.appendChild(st);
})();
