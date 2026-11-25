/* 200 · 25 Nov (meeting: "I assigned something to Anu but it's not coming in Anu's profile"). A grievance that Patient
   Experience gives to a clinical owner now shows on that owner's My Day as "Grievances for you": the grievance owner or any
   issue owner is matched to the login role (Treating psychiatrist / a psychiatrist's name -> psychiatrist; Floor lead
   psychiatrist -> floor lead psychiatrist, who also sees the psychiatrists' ones; psychologist and Psychology team lead
   likewise; Nursing in-charge -> nurse; RMO -> rmo). Post update / Owner has fixed it write pxo:<id> rows (same as block 90),
   which the PX portal shows. Reads px_state pxg/pxo rows, so it works only with SUPABASE_PX_STORE on.
   Local test: ?pxmock=1 shows two synthetic grievances. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  const RX={
    'psychiatrist':[/treating psychiatrist|consultant psychiatrist|^psychiatrist$/i],
    'floor-lead-psychiatrist':[/floor lead psychiatrist/i,/treating psychiatrist|consultant psychiatrist|^psychiatrist$/i],
    'psychologist':[/treating psychologist|^psychologist$/i],
    'floor-lead-psychologist':[/psychology team lead|floor lead psychologist/i,/treating psychologist|^psychologist$/i],
    'nurse':[/nurs|sister/i],
    'rmo':[/\brmo\b|duty doctor|medical officer/i]
  };
  if(!RX[role])return;
  const STAFFROLE={'psychiatrist':/psychiatr|consultant/i,'floor-lead-psychiatrist':/psychiatr|consultant/i,'psychologist':/psycholog/i,'floor-lead-psychologist':/psycholog/i,'nurse':/nurs/i,'rmo':/rmo|medical officer/i};
  const MOCK=/[?&]pxmock=1/.test(location.search);
  let cfg=null,G={},O={},sig='';
  const esc=s=>hesc(String(s==null?'':s));
  const rest=(path,opt)=>{opt=opt||{};opt.headers=Object.assign({apikey:cfg.key,Authorization:'Bearer '+cfg.key,'x-tulasi-role':role==='floor-coordinator'?'lead':role,'Content-Type':'application/json'},opt.headers||{});return fetch(cfg.url+'/rest/v1/'+path,opt);};
  const put=(key,data)=>rest('px_state?on_conflict=key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify([{key,data,updated_at:new Date().toISOString()}])});
  const onMyDay=()=>/^#\/myday\b/.test(location.hash||'')||!location.hash||location.hash==='#/';
  async function load(){
    if(!cfg)return;
    try{const r=await rest('px_state?select=key,data&key=like.px*:*');if(!r.ok)return;const g={},o={};
      (await r.json()).forEach(x=>{const id=x.key.split(':')[1];if(x.key.indexOf('pxg:')===0)g[id]=x.data;else if(x.key.indexOf('pxo:')===0&&!/^(h|v)-/.test(id))o[id]=x.data;});
      const s=JSON.stringify([g,o]);G=g;O=o;if(s!==sig){sig=s;if(onMyDay()){if(TBL)render();else paint();}}
    }catch(e){}
  }
  if(MOCK){const t=Date.now();G={'G-T1':{c:{id:'G-T1',pname:'Test Patient One',title:'Family not told about the medicine change',category:'Family updates',owner:'Treating psychiatrist',raisedBy:'Family member',via:'Phone call',logged:'Today 10:10 am',at:t-2*36e5,issues:[{t:'Not told about the medicine change',owner:'Treating psychiatrist',st:'Open'}]},st:null},
    'G-T2':{c:{id:'G-T2',pname:'Test Patient Two',title:'Rough handling alleged',category:'Safety',sev:'Serious',owner:'Floor lead psychiatrist',raisedBy:'Patient',via:'Floor round',logged:'Today 9:00 am',at:t-5*36e5,issues:[{t:'Rough handling alleged',owner:'Nursing in-charge',st:'Open'},{t:'Wants the doctor to call',owner:'Treating psychologist',st:'Open'}]},st:null}};}
  else fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{if(j&&j.supabase&&j.pxStore){cfg=j.supabase;load();setInterval(load,30000);}}).catch(()=>{});

  /* a staff name (e.g. "Dr. Anu Yadav") counts as this role when the real staff list says that person has this role */
  function staffMatch(o){const L=window.__realStaff||[];const n=String(o||'').replace(/^dr\.?\s*/i,'').trim().toLowerCase();if(!n)return false;
    return L.some(s=>{const sn=String(s.name||'').replace(/^dr\.?\s*/i,'').trim().toLowerCase();return sn&&(sn===n)&&STAFFROLE[role].test(String(s.role||''));});}
  const isMine=o=>!!o&&(RX[role].some(r=>r.test(String(o).trim()))||staffMatch(o));
  const closed=(c)=>c.status==='Resolved'||c.status==='Closed'||(+c.g2>=4);
  function list(){
    return Object.keys(G).map(k=>{const d=G[k]||{},c0=d.c;if(!c0)return null;const c=Object.assign({id:k},c0,d.st||{}),ow=O[k]||{};
      const iss=(c.issues||[]).filter(i=>isMine(i.owner)&&i.st!=='Resolved'&&i.st!=='Declined');
      if(!isMine(c.owner)&&!iss.length)return null;
      return Object.assign(c,{mineIss:iss,ow});}).filter(Boolean).filter(c=>!closed(c))
      .sort((a,b)=>(ser(b)-ser(a))||((a.at||0)-(b.at||0)));
  }
  const ser=c=>(/serious/i.test(c.sev||'')||c.ser||/safety|abuse|restraint|assault/i.test(c.category||''))?1:0;
  function due(c){if(c.ow&&c.ow.fixed)return 'Fixed, Patient Experience to confirm with the family';const at=+c.at||0;if(!at)return c.sla||'';
    const left=at+6*36e5-Date.now();if(left<=0)return 'Past the 6-hour reply time';const h=Math.floor(left/36e5),m=Math.floor((left%36e5)/6e4);return (h?h+' h ':'')+m+' min left to reply';}
  function ptId(name){try{const p=allPts().find(x=>x.name===name);return p?p.id:'';}catch(e){return '';}}
  function card(){
    const L=list().filter(c=>!inTable(c));
    const rows=L.map(c=>{const S2=ser(c),id=ptId(c.pname),late=/Past/.test(due(c));
      const iss=c.mineIss.length?`<div class="small" style="margin-top:4px">For you: ${c.mineIss.map(i=>esc(i.t)).join(' · ')}</div>`:'';
      const upd=c.ow&&c.ow.latest?`<div class="small muted" style="margin-top:4px">Last update: ${esc(c.ow.latest)} (${esc(c.ow.latestBy||'')}, ${esc(c.ow.latestAt||'')})</div>`:'';
      return `<div class="m200-r${S2?' ser':''}"><div class="grow"><div style="font-weight:600">${esc(c.pname||'Patient')} · ${esc(c.title||'Concern')}</div>
        <div class="small muted">${esc(c.category||'')}${S2?' · <b style="color:var(--red)">Serious</b>':''} · Raised by ${esc(c.raisedBy||'')} · ${esc(c.via||'')} · ${esc(c.logged||'')}</div>${iss}${upd}
        <div class="small" style="margin-top:4px;${late?'color:var(--red);font-weight:600':''}">${esc(due(c))}</div></div>
        <div class="m200-b">${id?`<button class="btn sm" onclick="location.hash='#/patient/${esc(id)}/prefs'">Open patient</button>`:''}${c.ow&&c.ow.fixed?'':`<button class="btn sm" onclick="m200Upd('${esc(c.id)}',0)">Post update</button><button class="btn sm pri" onclick="m200Upd('${esc(c.id)}',1)">Owner has fixed it</button>`}</div></div>`;}).join('');
    return `<section class="card" id="m200Card"><div class="hd"><div><h3>Grievances for you · ${L.length}</h3><div class="small muted" style="margin-top:4px">Given to you by Patient Experience. Post what you have done; when it is fixed, they call the family to confirm before it closes.</div></div></div>${rows||'<div class="pad small muted">No open grievances for you.</div>'}</section>`;
  }
  /* 25 Nov meeting (Anu): for the psychiatrist roles a grievance is a row in the Today table ("Grievance raised for treatment"),
     not a card on top; Take Action and the eye offer "View grievance". Patients not on the wards still use the card. */
  const TBL=/^(psychiatrist|floor-lead-psychiatrist)$/.test(role);
  const ptOf=c=>{try{const L=allPts();if(MOCK&&c.id==='G-T1')return L[0]||null;return L.find(x=>(c.pid&&x.id===c.pid)||x.name===c.pname)||null;}catch(e){return null;}};
  const inTable=c=>TBL&&!!ptOf(c);
  if(TBL){
    const __x=window.psyExtraItems;
    window.psyExtraItems=function(p){const out=(typeof __x==='function'?__x.apply(this,arguments):[])||[];
      try{list().filter(c=>!(c.ow&&c.ow.fixed)&&ptOf(c)&&ptOf(c).id===p.id).forEach(c=>{const S2=ser(c);
        out.push({k:S2?'late':'task',id:'grv_'+c.id,lab:[S2?'red':'amber','Grievance'],txt:'Grievance raised for treatment: '+(c.title||c.category||'concern'),due:due(c),btn:['View grievance',`m200View('${esc(c.id)}')`,false]});});}catch(e){}
      return out;};
  }
  window.m200View=function(id){
    const c=list().find(x=>x.id===id);if(!c)return toast('This grievance is closed');const S2=ser(c);
    const iss=(c.issues||[]).map(i=>`<li><b>${esc(i.t)}</b>${i.owner?` <span class="small muted">· ${esc(i.owner)}</span>`:''}${i.st&&i.st!=='Open'?` <span class="small muted">· ${esc(i.st)}</span>`:''}</li>`).join('');
    const upd=c.ow&&c.ow.latest?`<div class="small" style="margin-top:10px"><b>Last update:</b> ${esc(c.ow.latest)} <span class="muted">(${esc(c.ow.latestBy||'')}, ${esc(c.ow.latestAt||'')})</span></div>`:'';
    V3.modal('Grievance · '+esc(c.pname||'Patient'),esc(c.category||'')+(S2?' · Serious':''),
      `<div class="small">Raised by ${esc(c.raisedBy||'')}${c.via?' · '+esc(c.via):''}${c.logged?' · '+esc(c.logged):''}</div>
       <div style="font-weight:600;margin-top:10px">${esc(c.title||'Concern')}</div>${iss?`<ul style="margin:8px 0 0 18px;padding:0">${iss}</ul>`:''}${upd}
       <div class="small" style="margin-top:10px;${/Past/.test(due(c))?'color:var(--red);font-weight:600':''}">${esc(due(c))}</div>`,
      `<button class="btn" onclick="closeModal()">Close</button>${c.ow&&c.ow.fixed?'':`<button class="btn" onclick="m200Upd('${esc(c.id)}',0)">Post update</button><button class="btn pri" onclick="m200Upd('${esc(c.id)}',1)">Owner has fixed it</button>`}`);
  };
  function paint(){try{const v=$('view');if(!v||!onMyDay())return;const old=v.querySelector('#m200Card');if((!cfg&&!MOCK)||!list().filter(c=>!inTable(c)).length){if(old)old.remove();return;}
    const t=document.createElement('template');t.innerHTML=card();const n=t.content.firstElementChild;if(old)old.replaceWith(n);else{const a=v.querySelector(':scope > .au-strip');if(a)a.after(n);else v.prepend(n);}}catch(e){}}
  window.m200Upd=function(id,fixed){
    V3.modal(fixed?'Owner has fixed it':'Post an update',fixed?'Write what was done and by whom. Patient Experience then calls the family.':'What have you done so far?',
      `<label class="field"><span class="lbl">${fixed?'What was done (required)':'Update (required)'}</span><textarea class="input" id="m200T" rows="3"></textarea></label><div id="m200E" class="small" style="color:var(--red);display:none">Write it first</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="m200Save('${esc(id)}',${fixed?1:0})">Save</button>`);
  };
  window.m200Save=async function(id,fixed){
    const t=(($('m200T')||{}).value||'').trim();if(!t){$('m200E').style.display='block';return;}
    const w=whoAt(),data=fixed?{fixed:true,fixNote:t,by:w.by,at:w.at}:{latest:t,latestBy:w.by,latestAt:w.at};
    try{if(!MOCK)await put('pxo:'+id,data);O[id]=data;closeModal();if(TBL)render();else paint();toast(fixed?'Sent to Patient Experience: they will call the family':'Update posted. Patient Experience can see it');}
    catch(e){toast('Could not save. Check the connection');}
  };
  const st=document.createElement('style');
  st.textContent='#m200Card .m200-r{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;border-top:1px solid var(--line,#E3EAF2)}#m200Card .m200-r.ser{border-left:3px solid var(--red,#D92D20)}'
    +'#m200Card .m200-b{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}#m200Card .grow{flex:1;min-width:0}';
  document.head.appendChild(st);
  const __r=render;render=function(){const out=__r.apply(this,arguments);paint();return out;};
})();
