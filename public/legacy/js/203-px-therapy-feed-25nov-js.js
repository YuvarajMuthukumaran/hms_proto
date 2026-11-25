/* 25 Nov 2026 meeting (Nikita): the Patient Experience Lead sees the therapy plan calendar and the follow-up dates the doctors set.
   The PX app cannot read clinical records, so the psychiatrist and psychologist portals copy a short summary of each inpatient to
   the PX shared store (px_state key pxo:t-<patient id>, the only prefix doctor logins may write besides pxn:; needs SUPABASE_PX_STORE=true): per day the individual sessions, goal logs,
   group attendance and family contacts of the last 90 days (block 194's own data), the goals and groups, and the discharge
   follow-ups (psychiatrist: dcrx.fu + fuDoc; psychologist: dcrx.th.fu). Only changed patients are sent, at most once a minute.
   Read in the PX app by public/px/px-tp-cal.js (Therapy plan tab) and px-dc-checklist.js (Follow-ups booked). */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|floor-lead-psychiatrist|psychologist|floor-lead-psychologist)$/.test(role))return;
  let cfg=null;const sent={};let ready=false,busy=false,dirty=true;
  const rest=(path,opt)=>{opt=opt||{};opt.headers=Object.assign({apikey:cfg.key,Authorization:'Bearer '+cfg.key,'x-tulasi-role':role,'Content-Type':'application/json'},opt.headers||{});return fetch(cfg.url+'/rest/v1/'+path,opt);};
  fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{if(!j||!j.supabase||!j.pxStore)return;cfg=j.supabase;
    return rest('px_state?select=key,data&key=like.pxo:t-*').then(r=>r.ok?r.json():[]).then(rows=>{(rows||[]).forEach(r=>{const d=typeof r.data==='string'?r.data:JSON.stringify(r.data);try{const o=JSON.parse(d);delete o.at;sent[r.key]=JSON.stringify(o);}catch(e){}});ready=true;});}).catch(()=>{});
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const fromK=k=>{const p=k.split('-');return iso(new Date(+p[0],+p[1],+p[2]));};
  const goalName=(g,i)=>String(g.title||g.t||g.goal||g.text||g.name||('Goal '+(i+1)));
  const R=v=>v===1?'Met':v===.5?'Part way':'Not met';
  function summary(pid){
    const A=window.__tp194api;if(!A)return null;
    const lim=Date.now()-90*864e5,days={};const put=(k,row)=>{const d=fromK(k);if(new Date(d+'T00:00').getTime()<lim)return;(days[d]=days[d]||[]).push(row);};
    let I={goals:[],by:{}},G={names:[],by:{}},F={by:{}};
    try{I=A.ind(pid);}catch(e){}try{G=A.grp(pid);}catch(e){}try{F=A.fam(pid);}catch(e){}
    Object.keys(I.by).forEach(k=>{const b=I.by[k];(b.ses||[]).forEach(n=>put(k,['ses',n.mod||'Individual session',[n.by,n.status==='signed'?'':'draft'].filter(Boolean).join(' · ')]));
      Object.keys(b.g||{}).forEach(i=>{const v=b.g[i];put(k,['goal',goalName(I.goals[i]||{},+i),R(v.r)+(v.raw!=null&&v.raw!==''?' ('+v.raw+')':'')+(v.by?' · '+v.by:''),v.r]);});});
    Object.keys(G.by).forEach(k=>(G.by[k]||[]).forEach(x=>put(k,['grp',G.names[x.i]||'Group',x.v===1?'Attended':x.v===.5?'Part / left early':'Did not attend',x.v])));
    Object.keys(F.by).forEach(k=>(F.by[k]||[]).forEach(o=>put(k,[o.t==='ses'?'fses':o.t,o.h||'',o.s||''])));
    const x=(window.psyPx&&psyPx(pid))||{},D=x.dcrx||{},th=D.th||{},team=((window.ptCtxOf&&ptCtxOf(pid))||{}).team||{};
    const doc=String(D.fuDoc!=null&&D.fuDoc!==''?D.fuDoc:(team.psy?(/^dr\.?\s/i.test(team.psy)?team.psy:'Dr. '+team.psy):'')).trim();
    const fu={};if(D.fu)fu.psy={date:String(D.fu).slice(0,10),doc};if(th.fu)fu.psych={date:String(th.fu).slice(0,10),name:team.psych||''};
    return {goals:(I.goals||[]).map(goalName),groups:G.names||[],fu,d:days,team:{psy:team.psy||'',psych:team.psych||''}};
  }
  window.__pxTpSummary=summary;   /* for checking in the console */
  function patients(){try{return Object.values(WARDS).flat().filter(p=>p&&p.id);}catch(e){return [];}}
  async function flush(){
    if(!cfg||!ready||busy||!dirty||!window.__tp194api)return;busy=true;dirty=false;
    try{const out=[];
      patients().forEach(p=>{const s=summary(p.id);if(!s)return;const key='pxo:t-'+p.id,sig=JSON.stringify(s);
        if(sent[key]===sig)return;if(!Object.keys(s.d).length&&!s.fu.psy&&!s.fu.psych&&!s.goals.length&&!sent[key])return;
        s.at=new Date().toISOString();s.by=role;out.push({key,data:s,updated_at:s.at,_sig:sig});});
      for(let i=0;i<out.length;i+=40){const part=out.slice(i,i+40);
        const r=await rest('px_state?on_conflict=key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(part.map(o=>({key:o.key,data:o.data,updated_at:o.updated_at})))});
        if(r.ok)part.forEach(o=>{sent[o.key]=o._sig;});else dirty=true;}
    }catch(e){dirty=true;}busy=false;
  }
  const __r=window.render;
  if(typeof __r==='function')window.render=function(){const o=__r.apply(this,arguments);dirty=true;return o;};
  setInterval(flush,60000);setTimeout(()=>{dirty=true;flush();},8000);
  window.addEventListener('pagehide',()=>{try{flush();}catch(e){}});
})();
