
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

/* Keep patient urgency tags beside the name in the psychiatrist's inpatient list. */
const psyIpdNameCss=document.createElement('style');psyIpdNameCss.id='psy-ipd-name-tags-css';
psyIpdNameCss.textContent=`.ipd .psy-ipd-name{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .ipd .psy-ipd-name-tags{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;margin:0}`;
document.head.appendChild(psyIpdNameCss);
const __psyIpdTags=ROLE.psychiatrist.ipdPage;
ROLE.psychiatrist.ipdPage=function(o,base){
  const html=__psyIpdTags(o,base);if(S.role!=='psychiatrist')return html;
  const t=document.createElement('template');t.innerHTML=html;
  t.content.querySelectorAll('.ipd tbody tr').forEach(row=>{
    const cell=row.querySelector('td:first-child'),person=cell&&cell.querySelector('.row > .avatar + div');
    const name=person&&person.firstElementChild,flags=person&&person.querySelector('.ipf');
    if(name&&flags){name.classList.add('psy-ipd-name');flags.classList.add('psy-ipd-name-tags');name.appendChild(flags);}
  });
  return t.innerHTML;
};
