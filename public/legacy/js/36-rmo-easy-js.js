
/* RMO on duty only (5 Nov 2026): simple dashboard (see 37-easy-simple-js). Start here is, in this order: a nurse alert waiting for you, a new
   test result that is out of range, late work (for example an event not yet reviewed), then everything else in the order it is due.
   Tasks have a small "Done" link. The duty boards (Your duty work) are under "More tools and boards". */
Object.assign(ROLE.rmo,{
  myday:function(b){
    return easySimple({base:b,boards:{keep:['Your duty work'],grid:[]},pts:scopePts(),tab:'overview',
      hint:"Start with the blue box below. Tap a patient's card to open their file.",
      btns:`<button class="btn pri" onclick="go('#/handover')">Hand over</button>`,
      items:(T)=>{
        const out=[];
        V3.openAlerts(a=>!a.ack).forEach(a=>out.push({who:V3.pn(a.pid),txt:a.title,why:'A nurse alert is waiting for you',tone:'red',lab:['red','Alert'],btn:["I've seen this",`V3.ackAlert('${a.id}')`]}));
        v3().labs.filter(l=>!l.rev&&V3.labFlag(l)!=='ok').forEach(l=>out.push({who:V3.pn(l.pid),txt:l.test+' '+l.val+' '+l.unit+' · '+(l.val<l.lo?'low':'high')+' (normal '+l.lo+' to '+l.hi+')',why:'A new test result needs a look',tone:'amber',lab:['amber','Result'],btn:['Check result',`V3.labReview('${l.id}')`]}));
        const tk=T.filter(t=>!t.taskType).map(t=>({who:'',txt:easyPlain(t.title)+(t.due&&!/^Open$/.test(t.due)?' · '+t.due:''),why:t.late?'This is late':'To do',tone:t.late?'amber':'',lab:t.late?['amber','Late']:['grey','To do'],
          btn:[/handover/i.test(t.title)?'Open handover':t.late?'Do it now':'Open',`go('${t.go||'#/inpatients'}')`],done:`S.done['${t.id}']=true;render();toast('Marked done')`}));
        return [...out,...tk.filter(i=>i.tone==='amber'),...tk.filter(i=>i.tone!=='amber')];
      },
      line:(p,T)=>[...DT.alerts(p),...DT.labs(p),...DT.tasks(p,T)],
      clear:{text:'Nothing needs you right now.',label:'Open the duty board',go:"go('#/duty/night')"}});
  }
});
