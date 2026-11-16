/* 16 Nov 2026: psychologist login on real patients. The login belongs to Kiran Kumari: Mine = her patients (seen in the old HMS, or admitted
   later with her as treating psychologist); Whole ward = every admitted patient (all wards). The whole ward is loaded (96 marks hers with p.mine),
   and the lists that mean "my patients" (Today, caseload, daily notes) are narrowed to hers here. Psychologist login only, real mode only. */
(function(){
  if(!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychologist')return;
  const mine=()=>{try{return allPts().filter(p=>p.real&&p.mine);}catch(e){return [];}};
  window.realInpatients=()=>mine();
  window.__lpOwn=()=>mine();
})();
