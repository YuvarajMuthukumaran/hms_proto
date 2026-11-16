/* 15 Nov 2026: real-data mode (all roles). When the live site holds real patients (Vercel TULASI_REAL_DATA=true, passed in by
   src/components/AuthGate.tsx as window.__TULASI_REAL), the built-in demo patients (Neel Bose, Arjun Mehta, ...) are taken off
   every ward list, so only the patients admitted from the registry (96-registry) are shown. `?realtest=1` turns it on for a local test.
   Lists that read the ward arrays (Patients, Rounds, Daily notes, nursing chart, dashboards) follow automatically; demo tasks that
   name a demo patient are dropped wherever a list is built from them (rows whose patient is not on any ward). */
(function(){
  const on=!!window.__TULASI_REAL||/[?&]realtest=1/.test(location.search);
  window.__realMode=on;
  if(!on)return;
  try{Object.values(WARDS).forEach(a=>{for(let i=a.length-1;i>=0;i--)if(!a[i].real)a.splice(i,1);});}catch(e){}
  try{if(Array.isArray(window.PTS_EXTRA))window.PTS_EXTRA.length=0;}catch(e){}
  document.documentElement.classList.add('real-mode');
  /* one shared login per role: a signature names the role, never a demo person (Dr. Aanya Sharma, Sister Rekha ...) */
  const ROLE_NAME={psychiatrist:'Psychiatrist',psychologist:'Psychologist',nurse:'Nurse',rmo:'RMO on duty','floor-lead-psychiatrist':'Floor lead psychiatrist','floor-lead-psychologist':'Floor lead psychologist',lead:'Floor coordinator','floor-coordinator':'Floor coordinator'};
  try{const rk=(window.__TULASI__||{}).role||S.role;window.__realSigner=ROLE_NAME[rk]||'Staff';}catch(e){}
  /* demo seeds kept in state: start them empty so they never load (handover from Dr. Rohan Mehta, psychologist handover, unsigned drafts) */
  try{S.psyHO={list:[],ui:{to:'',reason:'Going on leave / Transfer',watch:{},sel:{},notes:{}}};S.pgHO={list:[],ui:{to:'',reason:'Going on leave',sel:{},notes:{}}};   /* the Handover pages read .ui: without it they crashed */S.au=S.au||{hr:null,skip:0,notes:{},drafts:null,hist:{},fam:{},grv:[],rem:{},dc:{},sc:{},consent:{}};S.au.drafts=[];}catch(e){}
  /* rows and cards that still name a demo patient: hidden once drawn */
  const DEMO=['Neel Bose','Arjun Mehta','Varun Rao','Karan Malhotra','Sameer Das','Rohit Kapoor','Dev Kumar','Tarun Roy','Kavya Menon','Meera Iyer','Sana Qureshi','Ritu Malhotra','Pooja Bhatt','Aman Gill','Yash Mehta','Nikhil Jain','Rahul Sethi'];
  const re=new RegExp('\\b('+DEMO.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b');
  function scrub(){
    const v=document.getElementById('view');if(!v)return;
    /* the inpatient list's subtitle names one ward and an empty count ("Gurgaon · Male ward · undefined"); it lists every ward now */
    const tw=document.createTreeWalker(v,NodeFilter.SHOW_TEXT);const fix=[];while(tw.nextNode()){if(/patients · Gurgaon · Male ward| · undefined/.test(tw.currentNode.nodeValue))fix.push(tw.currentNode);}
    fix.forEach(n=>{n.nodeValue=n.nodeValue.replace('Male ward · undefined','all wards').replace('Gurgaon · Male ward','Gurgaon · all wards').replace(' · undefined','');});
    const to=document.getElementById('hoTo');if(to){[...to.options].forEach(o=>{if(o.value==='Dr. Webber')o.remove();});}
    const real=t=>Object.values(WARDS).some(a=>a.some(p=>t.indexOf(p.name)>=0));
    const hide=el=>{el.style.display='none';el.dataset.realHid='1';};
    v.querySelectorAll('tbody tr, .erow, .espill, .wl-row, .pt-card, .dt-row, li').forEach(el=>{
      if(el.dataset.realHid)return;
      const t=el.textContent||'';
      if(re.test(t)&&!real(t))hide(el);
    });
    /* anything else that names a demo patient: hide the list item it sits in (the nearest parent that has look-alike siblings) */
    v.querySelectorAll('*').forEach(leaf=>{
      if(leaf.children.length||!re.test(leaf.textContent||'')||leaf.closest('[data-real-hid]'))return;
      let el=leaf;
      while(el.parentElement&&el.parentElement!==v){
        const p=el.parentElement,sib=[...p.children].filter(c=>c!==el&&c.tagName===el.tagName&&c.className===el.className);
        if(sib.length){if(!real(el.textContent||''))hide(el);return;}
        el=p;
      }
    });
  }
  /* the task list behind every Today page: tasks about a demo patient are dropped (a task for a ward patient, or one with no patient, stays) */
  const onWard=t=>Object.values(WARDS).some(a=>a.some(p=>t.indexOf(p.name)>=0));
  const demoTask=t=>{const txt=[t.title,t.meta,t.who,t.txt,t.go].filter(Boolean).join(' ');const m=String(t.go||'').match(/#\/patient\/([^/]+)/);
    if(m&&typeof ptFind==='function'&&!ptFind(m[1]))return true;return re.test(txt)&&!onWard(txt);};
  if(typeof tasks==='function'){const __t=tasks;tasks=function(){const r=__t.apply(this,arguments);return Array.isArray(r)?r.filter(t=>!demoTask(t||{})):r;};}
  try{if(window.DT&&typeof DT.tasks==='function'){const __dt=DT.tasks;DT.tasks=function(){const r=__dt.apply(this,arguments);return Array.isArray(r)?r.filter(t=>!demoTask(t||{})):r;};}}catch(e){}
  /* the simple Today (nurse, RMO): its job cards also come from the old boards' instructions */
  const demoItem=x=>{const t=[x.who,x.txt].filter(Boolean).join(' ');return re.test(t)&&!onWard(t);};
  if(typeof window.easySimple==='function'){const __es=window.easySimple;window.easySimple=function(o){if(o&&typeof o.items==='function'){const f=o.items;o=Object.assign({},o,{items:function(){const r=f.apply(this,arguments);return Array.isArray(r)?r.filter(x=>!demoItem(x||{})):r;}});}return __es.call(this,o);};}
  /* the inpatient list read only the first ward (PTS = Male ward): with real patients it lists every ward */
  if(typeof vInpatients==='function'){const __vi=vInpatients;vInpatients=function(){const keep=PTS.slice();try{const all=Object.values(WARDS).flat();PTS.splice(0,PTS.length,...all);return __vi.apply(this,arguments);}finally{PTS.splice(0,PTS.length,...keep);}};}
  const __r=render;
  render=function(){
    /* New admission: real patients are admitted from the Registry (search the old HMS record, then Admit); the demo front desk list is not used */
    if(/^#\/admissions/.test(location.hash||'')&&!/^(psychiatrist|rmo|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||''))){location.replace('#/registry');}
    const out=__r.apply(this,arguments);try{scrub();}catch(e){}return out;};
})();
