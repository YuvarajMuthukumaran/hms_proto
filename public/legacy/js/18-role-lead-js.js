
/* Floor lead only. Dashboard (4 Nov): one table of every floor patient with their psychiatrist, alerts, countersigns, approvals and tasks. */
Object.assign(ROLE.lead,{
  myday:b=>dashTable({base:b,keep:['Floor command','Floor team'],pts:allPts(),team:true,items:(p,T)=>[...DT.alerts(p),...DT.orders(p),...DT.approvals(p),...DT.tasks(p,T)],
    btns:`<button class="btn" onclick="go('#/floor/flow')">Floor command</button><button class="btn pri" onclick="go('#/rounds')">Start rounds</button>`})
});
