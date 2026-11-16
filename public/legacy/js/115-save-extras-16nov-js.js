/* 16 Nov 2026: things that were kept only in the browser are saved with the patient (record kind "events", key xs), so they survive a reload,
   incognito and a different device, and every role sees them:
   alerts (seen, closed), orders waiting for countersign, referrals and transfers, lab results review, test moves and pending tests,
   restraint episodes (timers, checks, release, debrief, notice), family call state, medicine refusals, task done marks,
   grievances raised on a call, consultant reviews and risk talks, history and plan done marks, discharge automation, scribe drafts,
   and the psychiatrist and psychologist handover lists.
   Not saved on purpose: the RMO shift handover banner (it belongs to a duty, not to a patient) and screen positions. */
(function(){
  const has=(s,pid)=>String(s||'').indexOf(pid)>=0;
  const byPid=(arr,pid)=>(Array.isArray(arr)?arr:[]).filter(x=>x&&x.pid===pid);
  const keyed=(o,pid,starts)=>{const r={};Object.keys(o||{}).forEach(k=>{if(starts?k.indexOf(pid)===0:has(k,pid))r[k]=o[k];});return r;};
  const nonEmpty=o=>{const r={};Object.keys(o).forEach(k=>{const v=o[k];if(v==null)return;if(Array.isArray(v)?v.length:typeof v==='object'?Object.keys(v).length:v!==''&&v!==false)r[k]=v;});return Object.keys(r).length?r:undefined;};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const mergeArr=(local,saved,pid)=>{ /* saved items replace local ones with the same id for this patient; local-only items stay */
    saved.forEach(s=>{const i=local.findIndex(x=>x&&x.pid===pid&&x.id===s.id);if(i>=0)local[i]=s;else local.push(s);});};
  const num=id=>{const m=String(id||'').match(/(\d+)$/);return m?+m[1]:0;};

  window.__xsRead=function(pid){
    let V,au=(typeof S!=="undefined")?S.au:undefined;try{V=v3();}catch(e){return undefined;}
    const o={
      al:byPid(V.alerts,pid),or:byPid(V.orders,pid),tr:byPid(V.transfers,pid),lb:byPid(V.labs,pid),mv:byPid(V.moves,pid),pd:byPid(V.pending,pid),
      fm:V.family&&V.family[pid],rf:keyed(V.refusals,pid,true),
      rs:((S.rst||{}).eps||[]).filter(e=>e.pid===pid),
      dn:nonEmpty({d:keyed(S.done,pid),b:keyed(S.doneBy,pid),nd:keyed(S.nd,pid,true),nm:keyed(S.nm,pid,true)}),
      ho:((S.psyHO||{}).list||[]).filter(h=>(h.pids||[]).indexOf(pid)>=0),
      hg:((S.pgHO||{}).list||[]).filter(h=>(h.pids||[]).indexOf(pid)>=0)
    };
    if(au){o.au=nonEmpty({gv:byPid(au.grv,pid),dr:byPid(au.drafts,pid),cr:au.cr&&au.cr[pid],rf:au.rf&&au.rf[pid],dc:au.dc&&au.dc[pid],sc:au.sc&&au.sc[pid],hs:keyed(au.hist,pid,true),es:keyed(au.esc,pid,false)});}
    const r=nonEmpty(o);return r?clone(r):undefined;
  };
  window.__xsApply=function(pid,x){
    if(!x||typeof x!=='object')return;
    let V;try{V=v3();}catch(e){return;}
    let top=0;
    const arr=(dst,src)=>{if(Array.isArray(src)&&src.length&&Array.isArray(dst)){mergeArr(dst,clone(src),pid);src.forEach(s=>{top=Math.max(top,num(s.id));});}};
    arr(V.alerts,x.al);arr(V.orders,x.or);arr(V.transfers,x.tr);arr(V.labs,x.lb);arr(V.moves,x.mv);
    if(Array.isArray(x.pd)){V.pending=Array.isArray(V.pending)?V.pending:[];x.pd.forEach(s=>{if(!V.pending.some(p=>p.pid===pid&&p.test===s.test&&p.when===s.when))V.pending.push(clone(s));});}
    if(x.fm){V.family=V.family||{};V.family[pid]=clone(x.fm);}
    if(x.rf){V.refusals=V.refusals||{};Object.assign(V.refusals,clone(x.rf));}
    if(Array.isArray(x.rs)&&x.rs.length){S.rst=S.rst||{eps:[]};S.rst.eps=S.rst.eps||[];x.rs.forEach(s=>{const i=S.rst.eps.findIndex(e=>e.id===s.id);if(i>=0)S.rst.eps[i]=clone(s);else S.rst.eps.push(clone(s));});}
    if(x.dn){S.done=S.done||{};S.doneBy=S.doneBy||{};Object.assign(S.done,clone(x.dn.d||{}));Object.assign(S.doneBy,clone(x.dn.b||{}));S.nd=S.nd||{};S.nm=S.nm||{};Object.assign(S.nd,clone(x.dn.nd||{}));Object.assign(S.nm,clone(x.dn.nm||{}));}
    const hand=(obj,src)=>{if(Array.isArray(src)&&src.length&&obj&&Array.isArray(obj.list)){src.forEach(s=>{const i=obj.list.findIndex(h=>h.id===s.id);if(i>=0)obj.list[i]=clone(s);else obj.list.push(clone(s));});}};
    hand(S.psyHO,x.ho);hand(S.pgHO,x.hg);
    if(x.au){const au=S.au=S.au||{hr:null,skip:0,notes:{},drafts:null,hist:{},fam:{},grv:[],rem:{},dc:{},sc:{},consent:{}},a=x.au;
      if(a.gv){au.grv=Array.isArray(au.grv)?au.grv:[];mergeArr(au.grv,clone(a.gv),pid);}
      if(a.dr){au.drafts=Array.isArray(au.drafts)?au.drafts:[];mergeArr(au.drafts,clone(a.dr),pid);}
      ['cr','rf','dc','sc'].forEach(k=>{if(a[k]!==undefined){au[k]=au[k]||{};au[k][pid]=clone(a[k]);}});
      if(a.hs){au.hist=au.hist||{};Object.assign(au.hist,clone(a.hs));}
      if(a.es){au.esc=au.esc||{};Object.assign(au.esc,clone(a.es));}}
    /* new ids made in this session must not clash with saved ones */
    try{if(top){V.tlN=Math.max(+V.tlN||0,top);V.alertN=Math.max(+V.alertN||0,top);}}catch(e){}
  };
  /* whole-hospital state (saved in portal_state, see supabase/migrations/20261116000200_portal_state.sql) */
  const day=()=>new Date().toISOString().slice(0,10);
  window.__gsRead=function(){
    const o={};
    try{const sh=S.sh||{};if(sh.signed||sh.accepted||sh.note)o.shift={signed:sh.signed||null,accepted:!!sh.accepted,note:sh.note||''};}catch(e){}
    try{if(Array.isArray(S.admVerify)&&S.admVerify.length)o.admVerify=clone(S.admVerify);}catch(e){}
    try{if(Array.isArray(S.nInstr)&&S.nInstr.length)o.nInstr={n:+S.nN||0,items:clone(S.nInstr)};}catch(e){}
    try{const sn=(S.rounds||{}).seen;if(sn&&Object.keys(sn).length)o['rseen:'+day()]=clone(sn);}catch(e){}
    return o;
  };
  window.__gsApply=function(k,d){
    if(d==null)return;
    if(k==='shift'){S.sh=S.sh||{clock:null,signed:null,accepted:false,note:'',adm:null};S.sh.signed=d.signed||null;S.sh.accepted=!!d.accepted;S.sh.note=d.note||'';return;}
    if(k==='admVerify'&&Array.isArray(d)){S.admVerify=S.admVerify||[];d.forEach(v=>{if(!S.admVerify.some(x=>x.id===v.id))S.admVerify.push(clone(v));});return;}
    if(k==='nInstr'&&d&&Array.isArray(d.items)){S.nInstr=S.nInstr||[];d.items.forEach(it=>{if(!S.nInstr.some(x=>x[6]===it[6]))S.nInstr.push(clone(it));});S.nN=Math.max(+S.nN||0,+d.n||0);return;}
    if(k==='rseen:'+day()){S.rounds=S.rounds||{};S.rounds.seen=Object.assign(S.rounds.seen||{},clone(d));}
  };
})();
