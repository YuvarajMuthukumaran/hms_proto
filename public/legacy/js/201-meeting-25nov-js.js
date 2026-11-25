/* 25 Nov 2026 meeting (Anu, Nikita; video and Granola notes). Psychiatrist and floor lead psychiatrist unless said otherwise.
   1. m25Doc / m25DocPrint: a saved form shown as a printed document (Tulasi logo, patient line, answers, signatures). Used by
      capacity assessment (141) and re-assessment (185). All roles may call it.
   2. Today table: no Type column ("did we not agree to remove type").
   3. Inpatients: the patient name opens the profile.
   4. "From the old HMS · latest prescription" card hidden when nothing was found.
   5. Admission workup allergies: inline "No allergy" / "Add allergies" (rows open on the page, no pop-up).
   6. Timeline alerts on Today (Anu): admission form, workup and capacity within 24 hours, detailed history within 72 hours,
      management plan within 7 days. Only for admissions after go-live (older ones would all be overdue).
   7. Management plan: the provisional diagnosis comes from Detailed history (Provisional diagnosis (ICD)) when none is set;
      it stays editable in the ICD picker. */
(function(){
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role=String((window.__TULASI__||{}).role||'');
  const PSY=/^(psychiatrist|floor-lead-psychiatrist)$/.test(role);

  /* ---------- 1. document view ---------- */
  window.m25Doc=function(title,p,body,sigs){
    p=p||{};let id={};try{id=ptIdentity(p)||{};}catch(e){}
    const cell=(l,v)=>v?`<div><span>${E(l)}</span><b>${E(v)}</b></div>`:'';
    const sg=(sigs||[]).map(s=>`<div class="m25-sig"><div class="m25-si">${s.img?`<img alt="Signature" src="${E(s.img)}">`:s.pending?'<span class="m25-pend">Signature pending</span>':'<span class="m25-nil">Signed electronically</span>'}</div><div class="m25-sl"><b>${E(s.name||'')}</b><span>${E(s.lab)}${s.at?' · '+E(s.at):''}</span></div></div>`).join('');
    return `<div class="m25-doc" id="m25Doc"><div class="m25-hd"><img src="/logo.png" alt="Tulasi Healthcare" onerror="this.style.display='none'"><div><b>Tulasi Healthcare</b><span>Inpatient record</span></div></div>
      <h2>${E(title)}</h2>
      <div class="m25-pt">${cell('Patient',p.name)}${cell('UHID',p.uhid||id.uhid)}${cell('Age / sex',[p.age,p.sex].filter(Boolean).join(' / '))}${cell('Room',p.room&&!/^R-?No/i.test(p.room)?p.room:'')}</div>
      <div class="m25-body">${body}</div>${sg?`<div class="m25-sigs">${sg}</div>`:''}</div>`;
  };
  window.m25DocPrint=function(){const d=document.getElementById('m25Doc');if(!d)return;
    const w=window.open('','_blank');if(!w){window.print();return;}
    w.document.write(`<!doctype html><html><head><title>Tulasi Healthcare</title><style>${CSS}body{margin:24px;font-family:Inter,Arial,sans-serif}.m25-doc{box-shadow:none;border:0}</style></head><body>${d.outerHTML}</body></html>`);
    w.document.close();setTimeout(()=>{w.focus();w.print();},400);};
  const CSS='.m25-doc{background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:26px 30px;color:#101828;font-size:14px;line-height:1.5}'
    +'.m25-hd{display:flex;align-items:center;gap:12px;border-bottom:2px solid #1e6cdb;padding-bottom:12px}.m25-hd img{height:42px}.m25-hd b{display:block;font-size:17px;color:#1849a9}.m25-hd span{font-size:12px;color:#667085}'
    +'.m25-doc h2{font-size:19px;margin:16px 0 10px;letter-spacing:.2px}'
    +'.m25-pt{display:flex;flex-wrap:wrap;gap:6px 26px;background:#f8fafc;border:1px solid #eef1f5;border-radius:8px;padding:10px 14px;margin-bottom:12px}.m25-pt span{display:block;font-size:11px;color:#667085;text-transform:uppercase;letter-spacing:.4px}'
    +'.m25-q{padding:9px 0;border-bottom:1px solid #eef1f5;break-inside:avoid}.m25-q b{display:block;font-size:12.5px;color:#475467;font-weight:600;margin-bottom:2px}.m25-nil{color:#98a2b3}'
    +'.m25-sigs{display:flex;gap:24px;flex-wrap:wrap;margin-top:22px}.m25-sig{flex:1 1 240px}.m25-si{height:84px;border-bottom:1px solid #101828;display:flex;align-items:flex-end}.m25-si img{max-height:80px;max-width:100%}'
    +'.m25-sl b{display:block;margin-top:4px}.m25-sl span{font-size:12px;color:#667085}.m25-pend{color:#b54708;font-weight:600}'
    +'.m25-sgs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}@media(max-width:760px){.m25-sgs{grid-template-columns:1fr}}.m25-sg .btn.on{background:#eef4ff;border-color:#1e6cdb;color:#1849a9}';
  const st=document.createElement('style');st.id='m25-css';st.textContent=CSS
    /* 2. Type column */
    +(PSY?'.pd-t thead th:first-child,.pd-t td.pd-ty,.pd-t tbody>tr>td:first-child:not([colspan]){display:none!important}':'')
    /* 3. names look like links */
    +(PSY?'.psy-ipd-name{cursor:pointer;color:#1849a9}.psy-ipd-name:hover{text-decoration:underline}':'')
    +'.m25-al{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.m25-alr{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}';
  document.head.appendChild(st);
  if(!PSY)return;

  /* ---------- 3. Inpatients: name opens the profile ---------- */
  document.addEventListener('click',e=>{const n=e.target.closest&&e.target.closest('.psy-ipd-name');if(!n)return;
    const tr=n.closest('tr');if(!tr)return;const b=[...tr.querySelectorAll('[onclick]')].find(x=>/#\/patient\//.test(x.getAttribute('onclick')||''));
    const m=b&&(b.getAttribute('onclick')||'').match(/#\/patient\/[^'"]+/);if(m){e.stopPropagation();go(m[0]);}},true);

  /* ---------- 5. allergies inline ---------- */
  const pidNow=()=>decodeURIComponent((String(location.hash).match(/^#\/patient\/([^/?]+)/)||[])[1]||'');
  window.m25AlNone=function(pid){try{psyPx(pid).allergy={ndka:true,list:[],by:signer(),at:atNow()};}catch(e){}render();toast('No known drug allergies recorded');};
  window.m25AlAdd=function(btn){const w=btn.closest('.m25-alw');if(!w)return;const f=w.querySelector('.m25-alf');f.hidden=false;btn.hidden=true;const i=f.querySelector('input');if(i)i.focus();};
  window.m25AlRow=function(btn){const f=btn.closest('.m25-alf');const r=document.createElement('div');r.className='m25-alr';r.innerHTML='<input class="input" placeholder="Medicine or allergen"><input class="input" placeholder="Reaction (rash, swelling, …)">';btn.before(r);};
  window.m25AlSave=function(btn,pid){const f=btn.closest('.m25-alf');const list=[...f.querySelectorAll('.m25-alr')].map(r=>{const i=r.querySelectorAll('input');return {drug:(i[0].value||'').trim(),rx:(i[1].value||'').trim()};}).filter(x=>x.drug);
    if(!list.length){toast('Write at least one allergy, or choose No allergy');return;}
    try{psyPx(pid).allergy={ndka:false,list,by:signer(),at:atNow()};}catch(e){}render();toast('Allergies saved');};
  function allergies(){
    const v=document.getElementById('view');if(!v)return;const pid=pidNow();if(!pid)return;
    v.querySelectorAll('.box').forEach(box=>{const l=box.querySelector('.lbl');if(!l||!/^Drug allergies$/.test(l.textContent.trim())||box.querySelector('.m25-alw'))return;
      const b=box.querySelector('button[onclick^="psyAllergy("]');if(!b)return;
      let cur=[];try{cur=(psyPx(pid).allergy||{}).list||[];}catch(e){}
      const rows=(cur.length?cur:[{},{}]).map(i=>`<div class="m25-alr"><input class="input" placeholder="Medicine or allergen" value="${E(i.drug||'')}"><input class="input" placeholder="Reaction (rash, swelling, …)" value="${E(i.rx||'')}"></div>`).join('');
      const w=document.createElement('div');w.className='m25-alw';w.style.gridColumn='1/-1';
      w.innerHTML=`<div class="m25-al"><button type="button" class="btn sm" onclick="m25AlNone('${E(pid)}')">No allergy</button><button type="button" class="btn sm pri" onclick="m25AlAdd(this)">${cur.length?'Edit allergies':'Add allergies'}</button></div>
        <div class="m25-alf" hidden>${rows}<button type="button" class="btn sm" style="margin-top:6px" onclick="m25AlRow(this)">+ Another allergy</button> <button type="button" class="btn sm pri" style="margin-top:6px" onclick="m25AlSave(this,'${E(pid)}')">Save allergies</button></div>`;
      const row=b.parentNode;b.remove();row.querySelectorAll('button').forEach(x=>{if(/^No known allergies$/.test(x.textContent.trim()))x.remove();});
      box.appendChild(w);});
  }

  /* ---------- 5b. workup treatment chart: only an "Add medicines" button; the form opens on the page when tapped.
     Skipped = the record reads "No medicines added". ---------- */
  function treat(){
    const v=document.getElementById('view');if(!v)return;
    v.querySelectorAll('.box').forEach(box=>{const l=box.querySelector('.lbl');if(!l||l.textContent.trim()!=='Treatment chart'||box.dataset.m25)return;
      const add=[...box.querySelectorAll('.lbl')].find(x=>x.textContent.trim()==='Add medicine');if(!add)return;box.dataset.m25='1';
      const parts=[];let n=add;while(n){parts.push(n);n=n.nextElementSibling;}
      const w=document.createElement('div');w.hidden=!(window.__m25tc===pidNow());w.className='m25-tc';add.before(w);parts.forEach(p=>w.appendChild(p));
      const b=document.createElement('button');b.type='button';b.className='btn sm pri';b.style.marginTop='10px';b.textContent='Add medicines';
      b.onclick=()=>{window.__m25tc=pidNow();w.hidden=false;b.remove();};if(w.hidden)w.before(b);
      box.querySelectorAll('.small.muted').forEach(s=>{if(/^No medicines added yet$/.test(s.textContent.trim()))s.textContent='No medicines added';});});
  }

  /* ---------- 4. empty old-HMS card ---------- */
  function oldHms(){const r=document.getElementById('ohms-rx');if(!r)return;const c=r.closest('.card')||r;
    if(/No medicines found/i.test(r.textContent||'')&&!r.querySelector('table,li'))c.style.display='none';}

  /* ---------- 6. timeline alerts ---------- */
  const DAY=864e5;
  const __x=window.psyExtraItems;
  window.psyExtraItems=function(p){
    let out=[];try{out=(typeof __x==='function'?__x.apply(this,arguments):[])||[];}catch(e){}
    try{
      const sc=window.__stayClock?__stayClock(p):{clock:+p.day||0,legacy:false,start:null};
      if(sc.legacy||!p.real)return out;
      const start=sc.start?sc.start.getTime():Date.now()-(+p.day||0)*DAY,hrs=(Date.now()-start)/36e5;
      const x=psyPx(p.id)||{},c=ptCtxOf(p.id)||{},wk=x.wk||{};
      const fmt=t=>{const d=new Date(t);return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'});};
      const add=(id,ok,h,txt,href)=>{if(ok)return;const late=hrs>h;
        out.push({k:late?'late':'task',id:'tl_'+id+'_'+p.id,lab:[late?'red':'amber',late?'Overdue':'Due'],txt:txt+(late?' · overdue':' · due by '+fmt(start+h*36e5)),due:late?'Overdue':'Due '+fmt(start+h*36e5),btn:['Open',`go('#/patient/${p.id}/admission')`,false]});};
      add('adm',!!x.appForm,24,'Application form for admission (within 24 hours)');
      add('wk',!!wk.signed,24,'Admission workup (within 24 hours)');
      add('cap',!!(c.capacityDone||x.capacitySigned),24,'Capacity assessment (within 24 hours)');
      add('hx',c.historyStatus==='signed',72,'Detailed history (within 72 hours)');
      add('mp',!!(c.plansSigned&&c.plansSigned.psy),168,'Management plan (within 7 days)');
    }catch(e){}
    return out;
  };

  /* ---------- 7. provisional diagnosis from the detailed history ---------- */
  const hfv=(pid,re)=>{let h={};try{h=psyPx(pid).hf||{};}catch(e){}const k=Object.keys(h).find(x=>re.test(x));const v=k?h[k]:'';return typeof v==='string'?v.trim():(v&&v.sel?v.sel:'');};
  const __pp=window.pPlans;
  if(typeof __pp==='function'){window.pPlans=function(){
    try{const pid=S.pid||pidNow();const v=pid&&hfv(pid,/^Provisional diagnosis/i);
      if(v&&(!S.dx||/^(not set|not recorded|–|-)$/i.test(String(S.dx).trim()))){const m=v.match(/^([0-9A-Z]{2,4}(?:\.[0-9A-Z]+)?)\s*[·:\-–]\s*(.+)$/);
        if(m){S.dxCode=m[1];S.dx=m[2];}else{S.dxCode='';S.dx=v;}}}catch(e){}
    return __pp.apply(this,arguments);};}

  /* PX admission checklist (px_adm_<pid> in px_state, ticked in the PX app), view only on the Admission page */
  const ADMI=[['welcome','Welcome and ward orientation given'],['rights','Patient rights explained (MHCA)'],['rules','Ward rules, calls and visiting explained'],['bill','Charges and billing explained to the family'],['prefs','Preferences taken'],['belong','Belongings listed'],['fam','Family contact for updates recorded'],['griev','How to raise a concern explained']];
  let PXC=null;const PXA={};
  fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{if(j&&j.supabase&&j.pxStore)PXC=j.supabase;}).catch(()=>{});
  function admLoad(pid){if(!PXC)return;const o=PXA[pid];if(o&&Date.now()-o.t<30000)return;PXA[pid]={t:Date.now(),v:(o||{}).v||null};
    fetch(PXC.url+'/rest/v1/px_state?select=data&key=eq.'+encodeURIComponent('px_adm_'+pid),{headers:{apikey:PXC.key,Authorization:'Bearer '+PXC.key,'x-tulasi-role':role}})
      .then(r=>r.ok?r.json():[]).then(rows=>{let d=(rows&&rows[0]||{}).data;if(typeof d==='string'){try{d=JSON.parse(d);}catch(e){d={};}}PXA[pid].v=d||{};const c=document.getElementById('m25PxAdm');if(c)c.remove();pxAdm();}).catch(()=>{});}
  function pxAdm(){
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)\/admission/);const old=document.getElementById('m25PxAdm');
    if(!m){if(old)old.remove();return;}const pid=decodeURIComponent(m[1]);if(old&&old.dataset.id===pid)return;
    admLoad(pid);const d=(PXA[pid]||{}).v;
    const anchor=document.querySelector('.subtabs');if(!anchor)return;
    const n=d?ADMI.filter(i=>d[i[0]]&&d[i[0]].on).length:0;
    const rows=d?ADMI.map(i=>{const x=d[i[0]];const on=!!(x&&x.on);return `<div class="m25-pa${on?' ok':''}"><span>${on?'✓':''}</span><div><b>${E(i[1])}</b><div class="small muted">${on?'Done · '+E(x.by||'')+(x.at?' · '+E(x.at):''):'Not done yet'}</div></div></div>`;}).join(''):'<div class="small muted">'+(PXC?'Loading…':'Not available here (the Patient Experience store is off).')+'</div>';
    const el=document.createElement('section');el.id='m25PxAdm';el.dataset.id=pid;el.className='card';el.style.cssText='margin:12px 0;padding:14px 16px';
    el.innerHTML=`<div class="row" style="justify-content:space-between"><b>Patient Experience · admission checklist</b>${d?`<span class="small">${n} of ${ADMI.length} done</span>`:''}</div><div class="small muted" style="margin:4px 0 8px">Ticked by the Patient Experience Lead. View only.</div><div class="m25-pal">${rows}</div>`;
    anchor.after(el);}
  if(PSY){const cs=document.createElement('style');cs.textContent='.m25-pal{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px}.m25-pa{display:flex;gap:10px;border:1px solid #E3EAF2;border-radius:10px;padding:8px 10px}.m25-pa>span{width:20px;height:20px;border-radius:6px;border:1.5px solid #D0D5DD;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex:none}.m25-pa.ok{background:#F6FEF9;border-color:#ABEFC6}.m25-pa.ok>span{background:#12B76A;border-color:#12B76A}';document.head.appendChild(cs);}
  const run=()=>{try{allergies();}catch(e){}try{treat();}catch(e){}try{oldHms();}catch(e){}if(PSY)try{pxAdm();}catch(e){}};
  const __r=window.render;
  if(typeof __r==='function')window.render=function(){const o=__r.apply(this,arguments);setTimeout(run,0);return o;};
  new MutationObserver(()=>{clearTimeout(run.t);run.t=setTimeout(run,60);}).observe(document.documentElement,{childList:true,subtree:true});
})();
