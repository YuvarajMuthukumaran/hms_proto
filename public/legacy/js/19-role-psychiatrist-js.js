
/* Psychiatrist only (3 Nov): History opens the detailed history view (stay tabs and Stay timeline) of the patient last opened,
   or asks whose history when none is open; View in the lists opens the clicked patient's own profile. */
Object.assign(ROLE.psychiatrist,{
  subs:(sec,base)=>base(sec).replace(/<button class="sub[^"]*" onclick="go\('#\/timeline'\)">Patient timeline/,`<button class="sub ${sec==='patient'?'on':''}" onclick="go('#/patient')">Patient history`),
  ipdPage:ptIpdPerPatient,
  vPatient:ptVPatient,
  render:ptHistRender,
  /* Dashboard (4 Nov): one table of my inpatients with alerts, countersigns and tasks, urgent first */
  myday:b=>dashTable({simple:true,pts:PTS,items:(p,T)=>[...DT.alerts(p),...DT.orders(p),...DT.tasks(p,T)],btns:`<button class="btn pri" onclick="go('#/rounds')">Start rounds</button>`})
});
