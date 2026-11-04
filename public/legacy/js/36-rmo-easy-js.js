
/* RMO on duty only (5 Nov 2026): easier dashboard. Start here is, in this order: a nurse alert waiting for you, a new test result that is
   out of range, late work (for example an event not yet reviewed), then everything else in the order it is due. */
(function(){
  const prev=ROLE.rmo.myday;
  function items(){
    const out=[],T=tasks().filter(t=>!S.done[t.id]&&!t.taskType);
    V3.openAlerts(a=>!a.ack).forEach(a=>out.push({who:V3.pn(a.pid),txt:a.title,why:'A nurse alert is waiting for you',tone:'red',btn:["I've seen this",`V3.ackAlert('${a.id}')`]}));
    v3().labs.filter(l=>!l.rev&&V3.labFlag(l)!=='ok').forEach(l=>out.push({who:V3.pn(l.pid),txt:l.test+' '+l.val+' '+l.unit+' · '+(l.val<l.lo?'low':'high')+' (normal '+l.lo+' to '+l.hi+')',why:'A new test result needs a look',btn:['Check result',`V3.labReview('${l.id}')`]}));
    T.slice().sort((a,b)=>(a.late?0:1)-(b.late?0:1)).forEach(t=>out.push({who:'',txt:easyPlain(t.title)+(t.due&&!/^Open$/.test(t.due)?' · '+t.due:''),why:t.late?'This is late':'To do',
      btn:[/handover/i.test(t.title)?'Open handover':t.late?'Do it now':'Open',`go('${t.go||'#/inpatients'}')`]}));
    return out;
  }
  ROLE.rmo.myday=function(b){
    return easyDash(prev(b),{hint:"Start with the blue box below. Tap a patient's name to open their file.",items:items(),
      clear:{text:'Nothing needs you right now.',label:'Open the duty board',go:"go('#/duty/night')"},
      words:[['Tap Acknowledge, then go to the patient.',"Tap I've seen this, then go to the patient."]]});
  };
})();
