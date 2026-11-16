/* 16 Nov 2026: psychiatrist Today on real patients. The strip said "25 family calls" but the table was empty: the table hides every item that is
   only "due today" (routine), and a patient admitted yesterday has nothing overdue yet. With real patients the 24 hour family calls that are due
   today are the main work, so they get a row each (type Family, button Call family). Overdue ones already have a row, so they are not repeated.
   Psychiatrist login only (every login is its own page), real mode only. */
(function(){
  if(!window.__realMode)return;
  if(String((window.__TULASI__||{}).role||'')!=='psychiatrist')return;
  const __x=window.psyExtraItems;
  window.psyExtraItems=function(p){
    const base=typeof __x==='function'?(__x.apply(this,arguments)||[]):[];
    let fam=[];
    try{
      fam=tasks().filter(t=>/^fa_/.test(String(t.id))&&!t.late&&String(t.title||'').indexOf(p.name)>=0)
        .map(t=>({k:'task',lab:['grey','Family'],txt:String(t.title).split(' · ')[0],due:t.due||'Due today',btn:['Call family',"go('"+(t.go||'#/patient/'+p.id+'/prefs')+"')",false]}));
    }catch(e){}
    return base.concat(fam);
  };
})();
