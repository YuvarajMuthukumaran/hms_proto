/* 17 Nov 2026, Trello, Mental status examination: "many headings missing, cross-check against the
   reference form -- missing general appearance and behavior, eye contact, hair, nails, dressing, etc."
   General appearance and Eye contact are already there; Hair, Nails and Dressing were not -- add them
   right after General appearance, same O(...) bubble/dropdown pattern as the rest of MSE.
   Psychiatrist and psychologist screens only (same gate as the rest of this form). */
(function(){
  const isPsy=()=>/^(psychiatrist|psychologist)$/.test(String((window.__TULASI__||{}).role||''));
  if(!isPsy())return;
  try{
    const mse=HIST.find(x=>x.k==='mse');
    if(mse&&!mse.__pmGroom){
      const i=mse.f.findIndex(f=>f[0]==='General appearance');
      const add=[
        ['Hair','o',['Well-kept','Unkempt']],
        ['Nails','o',['Clean and trimmed','Untrimmed or dirty']],
        ['Dressing','o',['Appropriate for setting','Inappropriate or disheveled']]
      ];
      if(i>=0)mse.f.splice(i+1,0,...add);else mse.f.unshift(...add);
      mse.__pmGroom=1;
    }
  }catch(e){}
})();
