
/* Nurse only (5 Nov 2026): simple dashboard (see 37-easy-simple-js). Start here is the next thing on the shift: late work first (a missed
   reading), then the doctor's new instructions, then the next round in time order. Each button says what it does (Start medicine round,
   Record vitals, Write handover note, Mark seen). Alerts the nurse has already raised are not in the to-do list: they are waiting for the
   RMO, not for the nurse; they show on the patient's card. The ward boards (Ward care) are under "More tools and boards". */
Object.assign(ROLE.nurse,{
  myday:function(b){
    const act=t=>{const x=easyPlain(t.title);
      if(/handover/i.test(x))return ['Write handover note','nHandoverModal()'];
      if(/medicine round/i.test(x))return ['Start medicine round',`go('${t.go||'#/ward/charts'}')`];
      if(/sugar/i.test(x))return ['Record sugar',`go('${t.go||'#/ward/charts'}')`];
      if(/vitals/i.test(x))return ['Record vitals',`go('${t.go||'#/ward/charts'}')`];
      return [t.late?'Do it now':'Open',`go('${t.go||'#/ward/charts'}')`];};
    return easySimple({base:b,boards:{keep:['Ward care','Due now'],grid:['Due now']},pts:PTS,tab:'vitals',
      hint:"Do the blue box first, then go down the list. Tap a patient's card to open their chart.",
      btns:`<button class="btn" onclick="nHandoverModal()">Handover note</button><button class="btn pri" onclick="eventModal(true)">⚠ Report significant event</button>`,
      items:(T,instr)=>{
        const todo=T.filter(t=>!t.taskType&&t.due!=='Ongoing').map(t=>({who:'',txt:easyPlain(t.title)+(t.due?' · '+t.due:''),late:!!t.late,why:t.late?'This is late':'Next on your shift',tone:t.late?'amber':'',lab:t.late?['amber','Late']:['grey','Next'],btn:act(t)}));
        return [...todo.filter(i=>i.late),...instr.map(i=>Object.assign({lab:['blue','New'],tone:''},i)),...todo.filter(i=>!i.late)];
      },
      line:(p,T)=>[...DT.alertsRaised(p),...DT.checks(p),...DT.meds(p),...DT.tasks(p,T)],
      clear:{text:"You're all caught up. Nothing is waiting on your shift.",label:'Open ward care',go:"go('#/ward/charts')"}});
  }
});
