
/* Nurse only. Dashboard (4 Nov): one table of the ward with alerts raised, checks, 2 pm medicines and tasks. The ward boards stay under Care. */
Object.assign(ROLE.nurse,{
  /* Roles and permissions is an admin page: not in the nurse menu (4 Nov) */
  subs:(sec,base)=>base(sec).replace(new RegExp('<button[^>]*#.permissions[^>]*>Roles and permissions<.button>'),''),
  myday:b=>dashTable({base:b,keep:['Ward care','Due now','Instructions from the treating team'],grid:['Due now'],pts:PTS,tab:'vitals',otherGo:'#/ward/charts',items:(p,T)=>[...DT.alertsRaised(p),...DT.checks(p),...DT.meds(p),...DT.tasks(p,T)],
    btns:`<button class="btn" onclick="nHandoverModal()">Handover note</button><button class="btn pri" onclick="eventModal(true)">⚠ Report significant event</button>`})
});
