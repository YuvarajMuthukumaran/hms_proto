/* React shell bridge (5 Nov 2026). Loaded last. Replaces the old login-js, role-links-js and the data side of supa-js.
   - The role comes from the page address (/lead, /psychiatrist, ...), chosen by the React role picker and passed in as
     window.__TULASI__.role. The role is locked for this page: View as and the role list cannot switch it.
   - Supabase now lives in React/TypeScript (src/supabase). It reaches the old screens only through window.TulasiBridge:
     read and write a patient's records, hear about renders, new patients and audit entries. */
(function(){
  const boot=window.__TULASI__||{};
  const PSYX_SHARED=['mgmtPsych','th','roundPlan','monTables','assignedAssess','sn']; /* the parts of psyx that the psychologist writes (see readCtx) */
  const requested=boot.role||'';
  const lock=boot.viewRole||requested;
  const NAMES={lead:'Floor Coordinator','floor-coordinator':'Floor Coordinator','floor-lead-psychiatrist':'Floor Lead Psychiatrist','floor-lead-psychologist':'Floor Lead Psychologist',psychiatrist:'Psychiatrist','patient-experience-lead':'Patient Experience Lead',psychologist:'Psychologist',nurse:'Nurse',rmo:'RMO on duty'};
  const nameOf=r=>NAMES[r]||r;
  const linkOf=r=>location.origin+'/'+r;

  /* locked: the role cannot change inside this link */
  if(lock){
    if(S.role!==lock){S.role=lock;S.tf='';S.rtf='';}
    document.title='Tulasi · '+nameOf(requested);
    const __setRole=setRole;
    setRole=function(r){
      if(r!==lock){toast('This link is for '+nameOf(requested)+'. Open the '+nameOf(r)+' link instead.');return;}
      return __setRole.apply(this,arguments);
    };
  }

  /* account popup: Log out (back to the role picker) and this role's own link */
  const __acc=accountModal;
  accountModal=function(){
    __acc.apply(this,arguments);
    const f=document.querySelector('#modal .mf');
    if(f)f.insertAdjacentHTML('afterbegin','<button class="btn" onclick="TulasiBridge.logout()">Log out</button>');
    const b=document.querySelector('#modal .mb'),r=requested||S.role;
    if(b&&r)b.insertAdjacentHTML('beforeend',`<div class="callout grey small" style="margin-top:12px">Your link: <b>${hesc(linkOf(r))}</b><div class="tiny muted" style="margin-top:4px">Each role has its own link. Bookmark this one; it opens ${hesc(nameOf(r))} only.</div></div>`);
  };

  /* events for the React side */
  const subs={render:[],patient:[],audit:[]};
  const emit=(k,...a)=>subs[k].forEach(f=>{try{f(...a);}catch(e){console.warn('bridge:',k,e);}});
  const __render=render;
  render=function(){const r=__render.apply(this,arguments);emit('render');return r;};
  const __mk=ptMakeCtx;
  ptMakeCtx=function(p){const c=__mk.apply(this,arguments);emit('patient',p.id,c);return c;};
  if(typeof cdLog==='function'){
    const __log=cdLog;
    cdLog=function(pid,formId,action,detail){__log.apply(this,arguments);emit('audit',{pid,formId,action,detail});};
  }

  const bridge={
    role:()=>S.role,
    signer:()=>(typeof signer==='function'&&signer())||S.role,
    logout(){location.assign('/');},
    /* the patients whose records exist in this browser: opened, generated or loaded */
    pids:()=>[...new Set(Object.keys(PT_CTX).concat([S.pid],Object.keys(S.eod||{}),Object.keys(MAR_ST).map(k=>k.split(':')[0])))].filter(id=>ptFind(id)),
    hasPatient:pid=>!!ptFind(pid),
    /* records of one patient, by kind, from whichever copy is live */
    read(pid,kind,keys){
      if(kind==='notes')return ((S.eod||{})[pid])||null;
      if(kind==='mar'){
        const out={};
        Object.keys(MAR_ST).forEach(k=>{if(k.startsWith(pid+':'))out[k]={st:MAR_ST[k],who:MAR_WHO[k]||null};});
        return Object.keys(out).length?out:null;
      }
      return bridge.readCtx(ptCtxOf(pid),keys);
    },
    /* The psychiatrist's and the psychologist's working notes share one object (psyx). The parts both of them write live in their own
       slice, psyxShared, saved with the psychology records that both roles may write. Everything else in psyx stays a doctor record, so a
       psychologist's entries reach the psychiatrist and the other way round. */
    readCtx(c,keys){
      const out=Object.fromEntries(keys.map(k=>[k,c[k]]));
      const px=c.psyx||{};
      if(keys.indexOf('psyxShared')>=0)out.psyxShared=Object.fromEntries(PSYX_SHARED.filter(k=>px[k]!==undefined).map(k=>[k,px[k]]));
      if(keys.indexOf('psyx')>=0&&out.psyx){const o=Object.assign({},out.psyx);PSYX_SHARED.forEach(k=>{delete o[k];});out.psyx=o;}
      return out;
    },
    apply(pid,kind,keys,data){
      if(!ptFind(pid)||data==null)return;
      if(kind==='notes'){S.eod=S.eod||{};S.eod[pid]=data;return;}
      if(kind==='mar'){
        Object.keys(data).forEach(k=>{MAR_ST[k]=data[k].st;if(data[k].who)MAR_WHO[k]=data[k].who;else delete MAR_WHO[k];});
        return;
      }
      const c=ptCtxOf(pid);
      keys.forEach(k=>{
        if(!(k in data))return;
        if(k==='psyxShared'){c.psyx=c.psyx||{};PSYX_SHARED.forEach(s=>{if(data[k]&&s in data[k])c.psyx[s]=data[k][s];});}
        else if(k==='psyx'){const o=Object.assign({},data[k]);PSYX_SHARED.forEach(s=>{delete o[s];});c.psyx=Object.assign(c.psyx||{},o);}
        else c[k]=data[k];
      });
    },
    /* clinical documents: submissions and in-progress fills, keyed by "<patient>|<form>" */
    docs:()=>typeof CD_DATA!=='undefined'?{submissions:CD_DATA.submissions||[],fills:CD_DATA.fills||{}}:null,
    applyDocs(rows){
      if(!rows.length||typeof CD_DATA==='undefined')return 0;
      CD_DATA=cdLoad();
      rows.forEach(d=>{
        const s=d.doc||{};
        CD_DATA.submissions=CD_DATA.submissions.filter(x=>x.entryKey!==d.entry_key);
        if(s.submission)CD_DATA.submissions.push(s.submission);
        if(s.fills){CD_DATA.fills=CD_DATA.fills||{};CD_DATA.fills[d.entry_key]=s.fills;}
      });
      try{localStorage.setItem(CD_KEY,JSON.stringify(CD_DATA));}catch(e){}
      return rows.length;
    },
    rerender:()=>render(),
    /* do not redraw under someone who is typing */
    rerenderIfIdle(){if(!document.querySelector('#view input:focus,#view textarea:focus,#view select:focus'))render();},
    on(event,fn){
      const list=subs[event];
      if(!list)throw new Error('Unknown bridge event: '+event);
      list.push(fn);
      return ()=>{const i=list.indexOf(fn);if(i>=0)list.splice(i,1);};
    }
  };
  window.TulasiBridge=bridge;

  /* open the locked role now; every block (and every role hook) is loaded by this point */
  if(lock)render();
})();
