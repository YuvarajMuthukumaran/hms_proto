
/* Floor lead only (5 Nov 2026): easier dashboard. Start here shows, in this order: an alert waiting for you, an RMO order to approve,
   something to approve (transfers, early discharge), then late work, then everything else. Orders are no longer approved with one
   click: the button opens "Approve this order?" first (window.psyReview, defined in 26-psy-dashboard-js, works for the lead too). */
(function(){
  const prev=ROLE.lead.myday;
  function items(){
    const out=[],T=tasks().filter(t=>!S.done[t.id]&&!t.taskType);
    V3.openAlerts(a=>!a.ack).forEach(a=>out.push({who:V3.pn(a.pid),txt:a.title,why:'An alert is waiting for you',tone:'red',btn:["I've seen this",`V3.ackAlert('${a.id}')`]}));
    v3().orders.filter(o=>!o.cs).forEach(o=>out.push({who:V3.pn(o.pid),txt:o.text,why:'An order is waiting for your approval',btn:['Check and approve',`psyReview('${o.id}')`]}));
    v3().apps.filter(a=>a.st==='open').forEach(a=>out.push({who:V3.pn(a.pid),txt:'Approve: '+a.kind,why:'This needs your approval',btn:['Review',"go('#/floor/approvals')"]}));
    const rank=t=>t.late?0:1;
    T.slice().sort((a,b)=>rank(a)-rank(b)).forEach(t=>out.push({who:'',txt:easyPlain(t.title),why:t.late?'This is late':'To do',
      btn:t.assign?['Confirm the team',`assignModal('${t.id}')`]:[t.late?'Do it now':'Open',`go('${t.go||'#/inpatients'}')`]}));
    return out;
  }
  ROLE.lead.myday=function(b){
    return easyDash(prev(b),{hint:"Start with the blue box below. Tap a patient's name to open their file.",items:items(),
      clear:{text:'Nothing needs you right now.',label:'Open floor command',go:"go('#/floor/flow')"},
      words:[["V3.countersign('","psyReview('"],['>Countersign<','>Check and approve<']]});
  };
})();
