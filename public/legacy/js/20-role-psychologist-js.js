
/* Psychologist only. Dashboard (4 Nov): one table of my patients with today's daily note and tasks. */
Object.assign(ROLE.psychologist,{
  myday:b=>{const L=PSY_EOD(),d=L.filter(p=>((S.eod||{})[p.id]||{}).saved).length;
    return dashTable({simple:true,pts:L,tab:'therapy',items:(p,T)=>DT.tasks(p,T),btns:`<button class="btn pri" onclick="go('#/notes')">✎ Daily notes <span class="fcount">${d}/${L.length}</span></button>`});}
});
