/* 13 Nov 2026, Trello card 144: the HMS roles and the Patient Experience portal share grievances (rows in px_state, see public/px/px-grievances.js).
   - A grievance logged from a patient record (Grievances tab, Family tab) is also sent to the PX portal (pxn rows).
   - The Grievances tab of a patient lists that patient's PX grievances, with Post update and Owner has fixed it (pxo rows), which PX shows.
   Works only when SUPABASE_PX_STORE is on; otherwise nothing is sent or read. */
(function(){
  const PXN={p1:'Arjun Mehta',p2:'Neel Bose',p3:'Meera Iyer',p4:'Varun Rao',p5:'Kavya Menon',p6:'Rahul Sethi'};
  let cfg=null,G={},O={},sig='',started=false;
  const esc=s=>hesc(String(s==null?'':s));
  const roleKey=()=>{const t=window.__TULASI__||{},r=String(t.role||'');return cfg&&cfg.roleKeys?(r==='floor-coordinator'?'lead':r):String(t.viewRole||S.role);};
  const rest=(path,opt)=>{opt=opt||{};opt.headers=Object.assign({apikey:cfg.key,Authorization:'Bearer '+cfg.key,'x-tulasi-role':roleKey(),'Content-Type':'application/json'},opt.headers||{});return fetch(cfg.url+'/rest/v1/'+path,opt);};
  const put=(key,data)=>rest('px_state?on_conflict=key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify([{key,data,updated_at:new Date().toISOString()}])});
  async function load(){
    if(!cfg)return;
    try{const r=await rest('px_state?select=key,data&key=like.px*:*');if(!r.ok)return;const rows=await r.json();const g={},o={};
      rows.forEach(x=>{const id=x.key.split(':')[1];if(x.key.indexOf('pxg:')===0)g[id]=x.data;else if(x.key.indexOf('pxo:')===0)o[id]=x.data;});
      const s=JSON.stringify([g,o]);G=g;O=o;if(s!==sig){sig=s;if(/^#\/patient\/[^/]+\/prefs/.test(location.hash||''))render();}
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
    try{await put(key,{name:nm,title:g.t,desc:g.t,cat:g.via||'Other',src:g.src==='patient'?'patient':g.src==='voice'?'voice':'family',by:(g.by||'')+(g.role?'':''),at:g.at||'',owner:/psychiatrist/i.test(g.own||'')?'Treating psychiatrist':/psychologist/i.test(g.own||'')?'Treating psychologist':'Patient experience team',ownerRole:g.own||''});}catch(e){}
  }
  ['pgSave2','tpGriev'].forEach(fn=>{const f=window[fn];if(typeof f!=='function')return;
    window[fn]=function(){const id=S.pid||pid(),n0=(S.pgriev||[]).length,r=f.apply(this,arguments);const L=S.pgriev||[];if(L.length>n0)toPx(L[0],id);return r;};});

  const __r=render;
  render=function(){const out=__r.apply(this,arguments);try{
    const v=$('view'),id=pid();if(!v||!id||!/^#\/patient\/[^/]+\/prefs/.test(location.hash||'')||!(S.role==='psychiatrist'||S.role==='psychologist'))return out;
    if(!cfg)return out;const pxp=v.querySelector('.pxp');if(!pxp||S.pxTab!=='griev')return out;
    const old=v.querySelector('#pxgSec');if(old)old.remove();
    const t=document.createElement('template');t.innerHTML=sec(id);pxp.appendChild(t.content);
  }catch(e){}return out;};
})();
