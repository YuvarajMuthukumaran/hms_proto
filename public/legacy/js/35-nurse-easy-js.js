
/* Nurse only (5 Nov 2026): easier dashboard. Start here is the next thing on the shift: late work first (a missed reading), then the
   next round in time order. Each button says what it does (Start medicine round, Record vitals, Write handover note).
   Alerts the nurse has already raised are not listed: they are waiting for the RMO, not for the nurse. */
(function(){
  const prev=ROLE.nurse.myday;
  function items(){
    const T=tasks().filter(t=>!S.done[t.id]&&!t.taskType&&t.due!=='Ongoing');
    const act=t=>{const x=easyPlain(t.title);
      if(/handover/i.test(x))return ['Write handover note','nHandoverModal()'];
      if(/medicine round/i.test(x))return ['Start medicine round',`go('${t.go||'#/ward/charts'}')`];
      if(/vitals|sugar/i.test(x))return [/sugar/i.test(x)?'Record sugar':'Record vitals',`go('${t.go||'#/ward/charts'}')`];
      return [t.late?'Do it now':'Open',`go('${t.go||'#/ward/charts'}')`];};
    return T.slice().sort((a,b)=>(a.late?0:1)-(b.late?0:1)).map(t=>({who:'',txt:easyPlain(t.title)+(t.due?' · '+t.due:''),why:t.late?'This is late':'Next on your shift',btn:act(t)}));
  }
  ROLE.nurse.myday=function(b){
    return easyDash(prev(b),{hint:"Do the blue box first, then go down the list. Tap a patient's name to open their chart.",items:items(),
      clear:{text:"You're all caught up. Nothing is waiting on your shift.",label:'Open ward care',go:"go('#/ward/charts')"}});
  };
})();
