
/* RMO on duty only. Dashboard (4 Nov): one table of every patient on duty floors with alerts, new lab results and tasks. Duty boards stay under Handover. */
Object.assign(ROLE.rmo,{
  /* Roles and permissions is an admin page: not in the RMO menu (4 Nov) */
  subs:(sec,base)=>base(sec).replace(new RegExp('<button[^>]*#.permissions[^>]*>Roles and permissions<.button>'),''),
  myday:b=>dashTable({base:b,keep:['Your duty work','Coming up'],pts:scopePts(),items:(p,T)=>[...DT.alerts(p),...DT.labs(p),...DT.tasks(p,T)],btns:`<button class="btn pri" onclick="go('#/handover')">Hand over</button>`})
});
