/* 13 Nov 2026, Trello card 144: the HMS roles and the Patient Experience portal share grievances (rows in px_state, see public/px/px-grievances.js).
   - A grievance logged from a patient record (Grievances tab, Family tab) is also sent to the PX portal (pxn rows).
   - The Grievances tab of a patient lists that patient's PX grievances, with Post update and Owner has fixed it (pxo rows), which PX shows.
   Works only when SUPABASE_PX_STORE is on; otherwise nothing is sent or read. */
(function(){
  const PXN={p1:'Arjun Mehta',p2:'Neel Bose',p3:'Meera Iyer',p4:'Varun Rao',p5:'Kavya Menon',p6:'Rahul Sethi'};
  let cfg=null,G={},O={},sig='',started=false,CALLS={main:{},v1:[]},PH={},snap={};
  const esc=s=>hesc(String(s==null?'':s));
  const roleKey=()=>{const t=window.__TULASI__||{},r=String(t.role||'');return cfg&&cfg.roleKeys?(r==='floor-coordinator'?'lead':r):String(t.viewRole||S.role);};
  const rest=(path,opt)=>{opt=opt||{};opt.headers=Object.assign({apikey:cfg.key,Authorization:'Bearer '+cfg.key,'x-tulasi-role':roleKey(),'Content-Type':'application/json'},opt.headers||{});return fetch(cfg.url+'/rest/v1/'+path,opt);};
  const put=(key,data)=>rest('px_state?on_conflict=key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify([{key,data,updated_at:new Date().toISOString()}])});
  async function load(){
    if(!cfg)return;
    try{const r=await rest('px_state?select=key,data&key=like.px*:*');if(!r.ok)return;const rows=await r.json();const g={},o={};
      rows.forEach(x=>{const id=x.key.split(':')[1];if(x.key.indexOf('pxg:')===0)g[id]=x.data;else if(x.key.indexOf('pxo:')===0&&!/^(h|v)-/.test(id))o[id]=x.data;});
      let ca={main:{},v1:[]},ph={};try{const r2=await rest('px_state?select=key,data&or=(key.in.(px_calls_main_v1,px_calls_v1),key.like.pxo:h-*)');if(r2.ok){(await r2.json()).forEach(x=>{const d=typeof x.data==='string'?JSON.parse(x.data):x.data;if(x.key==='px_calls_main_v1')ca.main=d||{};else if(x.key==='px_calls_v1')ca.v1=Array.isArray(d)?d:[];else if(x.key.indexOf('pxo:h-')===0)ph[x.key.slice(6)]=d;});}}catch(e){}
      CALLS=ca;PH=ph;publishPrefs();publishVitals();
      const s=JSON.stringify([g,o,ca,Object.keys(ph).length]);G=g;O=o;if(s!==sig){sig=s;if(/^#\/patient\/[^/]+\/prefs/.test(location.hash||''))render();}
    }catch(e){}
  }
  fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{if(j&&j.supabase&&j.pxStore){cfg=Object.assign({},j.supabase,{roleKeys:!!j.roleKeys});if(!started){started=true;load();setInterval(load,20000);}}}).catch(()=>{});

  const pid=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);return m?decodeURIComponent(m[1]):'';};
  const nameOf=id=>{try{return (ptFind(id)||{}).name||'';}catch(e){return '';}};
  function mine(id){
    const nm=nameOf(id);if(!nm)return [];
    return Object.keys(G).map(k=>{const d=G[k]||{},c=d.c;if(!c)return null;const n=PXN[c.pid]||c.pname||'';if(n!==nm)return null;
      const st=Object.assign({},d.st||{}),ow=O[k]||{};
      const fixed=ow.fixed&&!st.stage&&st.status!=='Resolved'?{status:'In progress',stage:'confirm',fixNote:ow.fixNote}:{};
      return Object.assign({id:k},c,st,fixed,ow.fixed?{}:(ow.latest?{latest:ow.latest,latestBy:ow.latestBy,latestAt:ow.latestAt}:{}));}).filter(Boolean)
      .sort((a,b)=>String(b.id).localeCompare(String(a.id)));
  }
  const stText=c=>c.status==='Resolved'?'Closed':c.stage==='confirm'?'Ready to confirm with the family':c.status==='Escalated'?'Escalated':c.status==='Pending'?'Pending':'With the owner';
  function sec(id){
    const L=mine(id);
    const rows=L.map(c=>`<div class="gl-row"><div class="grow"><div style="font-weight:600">“${esc(c.title)}”</div><div class="tiny muted">${esc(c.id)} · ${esc(c.category)} · ${esc(c.raisedBy||'')} · ${esc(c.via||'')}</div><div class="tiny muted">Owner: ${esc(c.owner)} · ${esc(stText(c))}${c.sla&&c.status!=='Resolved'?' · '+esc(c.sla):''}</div>${c.latest?`<div class="small" style="color:#1e5bb8">Latest: ${esc(c.latest)}${c.latestBy?' ('+esc(c.latestBy)+(c.latestAt?', '+esc(c.latestAt):'')+')':''}</div>`:''}${c.fixNote?`<div class="tiny muted">Fix: ${esc(c.fixNote)}</div>`:''}</div>
      ${c.status!=='Resolved'&&c.stage!=='confirm'?`<div class="row" style="gap:6px"><button class="btn sm" onclick="pxlUpd('${esc(c.id)}',false)">Post update</button><button class="btn sm pri" onclick="pxlUpd('${esc(c.id)}',true)">Owner has fixed it</button></div>`:''}</div>`).join('');
    return `<section class="card" id="pxgSec"><div class="hd"><div><h3>From the Patient Experience portal · ${L.length}</h3><div class="small muted" style="margin-top:4px">The same list the Patient Experience team sees. An update or a fix you post here shows there. They call the family to confirm before it closes.</div></div></div>${rows||'<div class="pad small muted">Nothing from the Patient Experience portal for this patient.</div>'}</section>`;
  }
  /* preferences go the other way: what the care team wrote (diet, approved visitors) is published for the Patient Experience portal. A patient is written when the row is missing, or when it was changed in this session. */
  const prefsOf=id=>{try{const c=ptCtxOf(id);return {diet:c.diet||{},contacts:(c.contacts||[]).map(x=>[x[0],x[1],x[2]]),nr:c.billing||''};}catch(e){return null;}};
  function publishPrefs(){
    if(!cfg)return;
    let list=[];try{list=allPts().map(p=>p.id);}catch(e){return;}
    list.forEach(id=>{const p=prefsOf(id);if(!p)return;const t=JSON.stringify(p);
      if(snap[id]===undefined){snap[id]=t;if(!PH[id]){const w=whoAt();PH[id]=Object.assign({},p,{by:w.by,at:w.at});put('pxo:h-'+id,PH[id]).catch(()=>{});}return;}
      if(snap[id]!==t){snap[id]=t;const w=whoAt();PH[id]=Object.assign({},p,{by:w.by,at:w.at});put('pxo:h-'+id,PH[id]).catch(()=>{});}});
  }
  /* vitals not charted: the nurse plan has a vitals check whose time has passed and nothing was recorded since (Rounds shows it as a flag, nobody ticks it) */
  const slotMin=k=>{const m=String(k).match(/(\d+)\s*(am|pm)/i);if(!m)return null;let h=+m[1]%12;if(/pm/i.test(m[2]))h+=12;return h*60;};
  function vitGap(id){try{const s=v3(),l=s.vit.last[id],plan=NPLAN[id]||{},lastT=l?l.t:null,now=V3.now();
    const due=Object.keys(plan).filter(k=>(plan[k]||[]).some(x=>/^(vit|dis)/.test(String(x)))).map(k=>({k,m:slotMin(k)})).filter(x=>x.m!=null&&x.m<=now&&(lastT==null||lastT<x.m)).sort((a,b)=>a.m-b.m);
    return due.length?{since:lastT==null?'not recorded yet':V3.hm(lastT),due:due[0].k}:null;}catch(e){return null;}}
  const vSnap={};
  function publishVitals(){
    if(!cfg)return;let list=[];try{list=allPts().map(p=>p.id);}catch(e){return;}
    list.forEach(id=>{const g=vitGap(id),t=JSON.stringify(g);if(vSnap[id]===t)return;vSnap[id]=t;put('pxo:v-'+id,{gap:g,at:whoAt().at}).catch(()=>{});});
  }
  const callsOf=id=>{const nm=nameOf(id),out=[];
    Object.keys(CALLS.main||{}).forEach(k=>{const n=PXN[k]||(()=>{try{return (ptFind(k)||{}).name||'';}catch(e){return '';}})();if(n!==nm)return;(CALLS.main[k]||[]).forEach(l=>out.push({d:l.d||'',what:l.what||'',by:l.who||'Patient Experience',note:l.note||'',tag:l.tag||''}));});
    (CALLS.v1||[]).forEach(c=>{if(c&&c.name===nm)out.push({d:c.d||c.date||'',what:'Random call '+(c.n||'')+' · '+(c.outcome||''),by:c.who||'Patient Experience',note:c.words||'',tag:''});});
    return out;};
  function callsSec(id){const L=callsOf(id);
    return `<section class="card" id="pxcSec"><div class="hd"><div><h3>Calls logged by Patient Experience · ${L.length}</h3><div class="small muted" style="margin-top:4px">Read only. Logged once in the Patient Experience portal, shown here so the care team sees what the family was asked and said.</div></div></div>${L.length?`<div class="scroll"><table class="t"><thead><tr><th>When</th><th>What</th><th>By</th><th>Words or note</th></tr></thead><tbody>${L.map(c=>`<tr><td class="small" style="white-space:nowrap">${esc(c.d)}</td><td>${esc(c.what)}${c.tag==='compliment'?' <span class="chip c-green">Compliment</span>':''}</td><td class="small">${esc(c.by)}</td><td class="small">${esc(c.note)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="pad small muted">No calls logged yet.</div>'}</section>`;}
  window.pxlUpd=function(id,fixed){
    V3.modal(fixed?'Owner has fixed it · '+esc(id):'Post an update · '+esc(id),fixed?'Write what was done and by whom. The Patient Experience team then calls the family.':'What has the owner done so far?',
      `<label class="field"><span class="lbl">${fixed?'What was done (required)':'Update (required)'}</span><textarea class="input" id="pxlT" rows="3"></textarea></label><div id="pxlE" class="small" style="color:var(--red);display:none">Write it first</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pxlSave('${esc(id)}',${fixed?1:0})">Save</button>`);
  };
  window.pxlSave=async function(id,fixed){
    const t=(($('pxlT')||{}).value||'').trim();if(!t){$('pxlE').style.display='block';return;}
    const w=whoAt(),data=fixed?{fixed:true,fixNote:t,by:w.by,at:w.at}:{latest:t,latestBy:w.by,latestAt:w.at};
    try{await put('pxo:'+id,data);O[id]=data;sig='';closeModal();render();toast(fixed?'Sent to Patient Experience: they will call the family':'Update posted. Patient Experience can see it');}
    catch(e){toast('Could not save. Check the connection');}
  };
  /* grievances logged from a patient record go to the PX portal too */
  async function toPx(g,id){
    if(!cfg||!g)return;const nm=nameOf(id);if(!nm)return;
    const key='pxn:'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    try{await put(key,{name:nm,title:g.t,desc:g.t,cat:(/food|diet|meal/i.test(g.via+g.t)?'Food and dietary':/room|noise|clean|laundry/i.test(g.via+g.t)?'Room and housekeeping':/bill|insurance|payment/i.test(g.via+g.t)?'Billing and insurance':/update|communicat|call/i.test(g.via+g.t)?'Family updates':/doctor|psychiatrist/i.test(g.via+g.t)?'Doctor communication':'Other'),src:g.src==='patient'?'patient':g.src==='voice'?'voice':'family',by:(g.by||'')+(g.role?'':''),at:g.at||'',owner:/psychiatrist/i.test(g.own||'')?'Treating psychiatrist':/psychologist/i.test(g.own||'')?'Treating psychologist':'Patient experience team',ownerRole:g.own||''});}catch(e){}
  }
  ['pgSave2','tpGriev'].forEach(fn=>{const f=window[fn];if(typeof f!=='function')return;
    window[fn]=function(){const id=S.pid||pid(),n0=(S.pgriev||[]).length,r=f.apply(this,arguments);const L=S.pgriev||[];if(L.length>n0)toPx(L[0],id);return r;};});

  const __r=render;
  render=function(){const out=__r.apply(this,arguments);try{publishPrefs();publishVitals();}catch(e){}try{
    const v=$('view'),id=pid();if(!v||!id||!/^#\/patient\/[^/]+\/prefs/.test(location.hash||'')||!(S.role==='psychiatrist'||S.role==='psychologist'))return out;
    if(!cfg)return out;const gc=[...v.querySelectorAll('section.card')].find(c=>/^Grievances ·/.test(((c.querySelector('h3')||{}).textContent||'').trim()));if(!gc)return out;
    const old=v.querySelector('#pxgSec');if(old)old.remove();const oc=v.querySelector('#pxcSec');if(oc)oc.remove();
    const t=document.createElement('template');t.innerHTML=sec(id)+callsSec(id);gc.after(t.content);
  }catch(e){}return out;};
})();
