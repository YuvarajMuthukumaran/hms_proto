/* 23 Nov 2026, meeting with Dr. Anu and Nikita. Psychiatrist and floor lead psychiatrist.
   One patient tab "Documentation" (the old Daily notes tab, same link #/patient/<id>/daily) holds:
     1. Daily notes / Rounds   (the Rounds tab showed the same round notes again, so it is gone; the changes made on each round are listed here)
     2. Capacity assessment    (was its own tab; New assessment and Collect signature work as before)
     3. Re-assessment          (new: the IPD re-assessment, saved per patient in psyx.reassess, who and when)
   Each part is folded until it is opened, has its own Print, and "Print all" prints the four together.
   Old links #/patient/<id>/rounds and /capacity open Documentation with that part unfolded.
   The capacity pop-up scrolls inside the window (the page behind no longer moves). */
(function(){
  if(!/^(psychiatrist|floor-lead-psychiatrist)$/.test(String((window.__TULASI__||{}).role||'')))return;
  const E=s=>hesc(String(s==null?'':s));
  const Q=s=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const px=pid=>{try{return psyPx(pid)||{};}catch(e){return {};}};
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)(?:\/([^/?]+))?/);return m?{pid:decodeURIComponent(m[1]),sub:m[2]||''}:{pid:'',sub:''};};
  const atNow=()=>{const d=new Date();return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'})+' '+d.getFullYear()+', '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});};
  const OPEN=window.__docOpen=window.__docOpen||{};

  /* ---------- data ---------- */
  const notes=pid=>{try{return JSON.parse(ptRun(pid,()=>JSON.stringify(S.dnHist||(typeof DN_HIST!=='undefined'?DN_HIST:[])||[])))||[];}catch(e){return [];}};
  const roundLog=pid=>(px(pid).roundLog||[]).filter(l=>(l.changes||[]).length||l.why);
  const caps=pid=>{const x=px(pid);return Array.isArray(x.capHist)?x.capHist:[];};
  const reas=pid=>{const x=px(pid);return Array.isArray(x.reassess)?x.reassess:[];};

  /* ---------- the parts ---------- */
  /* 25 Nov 2026 meeting (Anu): Rounds filter by psychiatrist / psychologist and Last 7 days / Last 1 month; capacity and
     re-assessment get the date filter. Psychologist rounds (psyx.roundLogPsy, block 173) are listed here too. */
  const F=OPEN.f=OPEN.f||{rd:{who:'all',d:'all'},cap:{d:'all'},rea:{d:'all'}};
  const tsOf=l=>{if(l&&l.ts)return +l.ts;const s=String((l&&l.at)||'').split(',')[0];const t=Date.parse(s);return isNaN(t)?0:t;};
  const inD=(l,d)=>d==='all'||(tsOf(l)&&Date.now()-tsOf(l)<=(d==='7'?7:31)*864e5);
  const roundAll=pid=>{const x=px(pid);const a=roundLog(pid).map(l=>Object.assign({role:'Psychiatrist'},l));
    const b=(x.roundLogPsy||[]).filter(l=>(l.changes||[]).length||l.note).map(l=>Object.assign({role:'Psychologist'},l));
    return a.concat(b).sort((p,q)=>tsOf(q)-tsOf(p));};
  const roundF=pid=>roundAll(pid).filter(l=>(F.rd.who==='all'||l.role.toLowerCase()===F.rd.who)&&inD(l,F.rd.d));
  /* 26 Nov 2026: same filter chips as the Daily notes part (Earlier notes), not dropdowns - toggle buttons
     turned into the animated segmented pills by block 61's pgUpgradeFilters (shared with the psychologist's filters). */
  const fbar=(k,who)=>{const f=F[k];const grp=(id,opts)=>`<div class="mini-chips" role="group">${opts.map(([v,l])=>`<button type="button" class="tog ${f[id]===v?'on':''}" onclick="docFlt('${k}','${id}','${v}')">${l}</button>`).join('')}</div>`;
    const parts=[];if(who)parts.push(grp('who',[['psychiatrist','Psychiatrist'],['psychologist','Psychologist']]));
    parts.push(grp('d',[['7','Last 7 days'],['30','Last 1 month']]));
    return `<div class="psy-dn-filter-row">${parts.join('<span class="dn9-sep" aria-hidden="true"></span>')}</div>`;};
  window.docFlt=function(k,id,v){F[k][id]=(F[k][id]===v?'all':v);const w=document.getElementById('docWrap');if(w)w.remove();render();};
  const roundsTable=pid=>{const L=roundF(pid);if(!L.length)return roundAll(pid).length?fbar('rd',1)+'<div class="small muted" style="padding:16px 4px">No rounds match the filter.</div>':'';
    return fbar('rd',1)+`<div class="scroll"><table class="t"><thead><tr><th style="width:170px">When</th><th style="width:120px">Role</th><th>Changes made</th></tr></thead><tbody>${L.map(l=>`<tr><td><b>${E(l.at)}</b><div class="tiny muted">${E(l.by||'')}</div></td><td>${E(l.role)}</td><td>${(l.changes||[]).map(c=>`<div><b>${E(c.t)}:</b> ${E(c.d)}</div>`).join('')}${l.note?`<div>${E(l.note)}</div>`:''}${l.why?`<div class="tiny muted">Why: ${E(l.why)}</div>`:''}</td></tr>`).join('')}</tbody></table></div>`;};
  const roundsTableOld=pid=>{const L=roundLog(pid);if(!L.length)return '';
    return `<h4 class="doc-h4">Changes made on rounds</h4><div class="scroll"><table class="t"><thead><tr><th style="width:170px">When</th><th>Changes made</th></tr></thead><tbody>${L.map(l=>`<tr><td><b>${E(l.at)}</b><div class="tiny muted">${E(l.by||'')}</div></td><td>${(l.changes||[]).map(c=>`<div><b>${E(c.t)}:</b> ${E(c.d)}</div>`).join('')}${l.why?`<div class="tiny muted">Why: ${E(l.why)}</div>`:''}</td></tr>`).join('')}</tbody></table></div>`;};
  const capTable=pid=>{const L=caps(pid).filter(a=>inD(a,F.cap.d));
    return fbar('cap')+`<div class="scroll"><table class="t"><thead><tr><th>Date</th><th>Capacity</th><th>Doctor</th><th>Patient or family signature</th><th></th></tr></thead><tbody>${L.map(a=>`<tr><td><b>${E(a.at)}</b><div class="tiny muted">${E(a.purpose||'')}</div></td><td>${E(a.level||'Not recorded')}</td><td>${E(a.by||'')}</td><td>${a.pending?`<b style="color:#b54708">Pending</b><div class="tiny muted">${E(a.personType||'Patient or family member')} to sign</div>`:`${E(a.person||'')}<div class="tiny muted">${E(a.personType||'')}</div>`}</td><td style="text-align:right"><button class="btn sm ${a.pending?'pri':''}" onclick="acrCapOpen('${Q(pid)}','${Q(a.id)}')">${a.pending?'Collect signature':'Open'}</button></td></tr>`).join('')||'<tr><td colspan="5" class="small muted">No capacity assessment yet.</td></tr>'}</tbody></table></div>`;};
  const RQ=[['status','Current clinical status (history and MSE)'],['change','Change in clinical status'],['scale','Rating scale used, with scores'],['se','Side effects, toxicity or complications'],['inv','Further investigations required'],['plan','Change in management and treatment plan (including prescription)'],['other','Any other remarks']];
  const reaRows=pid=>reas(pid).map((r,i)=>inD(r,F.rea.d)?r:null).map((r,i)=>!r?'':`<tr><td><b>${E(r.at)}</b><div class="tiny muted">${E(r.by||'')}</div></td><td>${E(r.change||'')}${r.scale?`<div class="tiny muted">${E(r.scale)}</div>`:''}</td><td>${E(r.status||'')}</td><td style="text-align:right"><button class="btn sm" onclick="docReaOpen('${Q(pid)}',${i})">Open</button></td></tr>`).join('');
  const reaTable=pid=>fbar('rea')+`<div class="scroll"><table class="t"><thead><tr><th style="width:170px">When</th><th>Change in clinical status</th><th>Current clinical status</th><th></th></tr></thead><tbody>${reaRows(pid)||'<tr><td colspan="4" class="small muted">No re-assessment yet. It is due every week.</td></tr>'}</tbody></table></div>`;

  /* 23 Nov 2026, second meeting (Anu): tabs instead of parts that fold open ("30 daily notes make a very long list and then to go
     to rounds I have to close the daily notes"). One part shows at a time; each has Print (that part) and Print all. */
  const KEYS=['dn','rd','cap','rea'];
  const TAB=()=>KEYS.includes(OPEN.tab)?OPEN.tab:'dn';
  const TT={dn:'daily notes',rd:'rounds',cap:'capacity assessments',rea:'re-assessments'};
  function part(pid,k,title,count,last,body,btns){
    const on=TAB()===k;
    return `<section class="card doc-part on" data-doc="${k}" id="docP_${k}" role="tabpanel" aria-labelledby="docT_${k}" ${on?'':'hidden'}><div class="doc-sum"><b>${E(title)}</b><span class="doc-n">${E(count)}</span>${last?`<span class="small muted">Latest ${E(last)}</span>`:''}<span style="flex:1"></span>
      <div class="doc-act">${btns||''}<button class="btn sm" onclick="docPrint('${Q(pid)}','${k}')">Print ${TT[k]}</button><button class="btn sm" onclick="docPrint('${Q(pid)}','all')">Print all</button></div></div>
      <div class="doc-body">${body}</div></section>`;
  }
  window.docTab=window.docToggle=function(k){OPEN.tab=k;const w=document.getElementById('docWrap');if(!w)return render();
    w.querySelectorAll('.doc-part').forEach(s=>{s.hidden=s.dataset.doc!==k;});
    w.querySelectorAll('.doc-tab').forEach(b=>{const on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});};
  window.docTabKey=function(e){const i=KEYS.indexOf(TAB());let j=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:-1;if(j<0&&e.key!=='ArrowLeft')return;j=(j+KEYS.length)%KEYS.length;e.preventDefault();docTab(KEYS[j]);const b=document.getElementById('docT_'+KEYS[j]);if(b)b.focus();};

  /* ---------- re-assessment ---------- */
  window.docReaNew=function(pid){
    const f=([k,l])=>k==='change'?`<div class="field"><span class="lbl">${E(l)}</span><div class="mini-chips" id="reaCh">${['Improving','No change','Worsening'].map(o=>`<button type="button" class="tog" onclick="this.parentNode.querySelectorAll('.tog').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${o}</button>`).join('')}</div></div>`
      :`<label class="field"><span class="lbl">${E(l)}</span><textarea class="input" id="rea_${k}" rows="${/status|plan/.test(k)?3:2}"></textarea></label>`;
    V3.modal('Re-assessment (IPD) · psychiatrist',E((ptFind(pid)||{}).name||''),`<div class="doc-rea">${RQ.map(f).join('')}<div class="small muted" style="color:#b42318;display:none" id="reaErr">Write the current clinical status and choose the change in clinical status.</div></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="docReaSave('${Q(pid)}')">Sign and save</button>`,'min(760px,100%)');
  };
  window.docReaSave=function(pid){
    const g=k=>((document.getElementById('rea_'+k)||{}).value||'').trim();
    const ch=(document.querySelector('#reaCh .tog.on')||{}).textContent||'';
    if(!g('status')||!ch){const e=document.getElementById('reaErr');if(e)e.style.display='block';return;}
    const x=px(pid);x.reassess=Array.isArray(x.reassess)?x.reassess:[];
    x.reassess.unshift({at:atNow(),ts:Date.now(),by:signer(),status:g('status'),change:ch,scale:g('scale'),se:g('se'),inv:g('inv'),plan:g('plan'),other:g('other')});
    try{S.reassessDone=true;S.done=S.done||{};S.done.reassess=true;}catch(e){}
    try{V3.log(pid,S.role,'note','Re-assessment signed: '+ch);}catch(e){}
    OPEN.tab='rea';closeModal();render();toast('Re-assessment saved');
  };
  const reaHtml=r=>RQ.map(([k,l])=>r[k]?`<div class="doc-kv"><b>${E(l)}</b><div>${E(r[k]).replace(/\n/g,'<br>')}</div></div>`:'').join('');
  window.docReaOpen=function(pid,i){const r=reas(pid)[i];if(!r)return;
    if(window.m25Doc){const p=ptFind(pid)||{};V3.modal('Re-assessment (IPD)',E(r.at),m25Doc('Re-assessment (IPD)',p,RQ.map(([k,l])=>`<div class="m25-q"><b>${E(l)}</b><div>${r[k]?E(r[k]).replace(/\n/g,'<br>'):'<span class="m25-nil">Not written</span>'}</div></div>`).join(''),[{lab:'Psychiatrist',name:r.by,at:r.at}]),
      `<button class="btn" onclick="closeModal()">Close</button><button class="btn pri" onclick="m25DocPrint()">Print</button>`,'min(900px,96vw)');return;}
    V3.modal('Re-assessment · '+E(r.at),'Signed by '+E(r.by||''),`<div class="doc-rea">${reaHtml(r)}</div>`,`<button class="btn" onclick="closeModal()">Close</button>`,'min(760px,100%)');};

  /* ---------- printing ---------- */
  function printHtml(pid,k){
    if(k==='dn'){
      const N=notes(pid);
      const nh=N.map(n=>`<div class="n"><div class="h"><span>${E(n.type||'Note')}</span><span>${E(n.d||'')} ${E(n.my||'')}</span></div><div class="m">${E(n.by||'')}${n.role?' · '+E(n.role):''}${n.signed?' · signed '+E(n.signed):''}</div>${(n.secs||[]).map(s=>Array.isArray(s)&&s[1]?`<div class="s"><b>${E(s[0])}</b>${E(s[1])}</div>`:'').join('')||(n.sum?`<div class="s">${E(n.sum)}</div>`:'')}</div>`).join('');
      return `<h2>Daily notes</h2>${nh||'<div>No notes yet.</div>'}`;
    }
    if(k==='rd'){
      const L=roundLog(pid);
      return `<h2>Rounds</h2>${L.length?`<table><tr><th>When</th><th>Changes</th></tr>${L.map(l=>`<tr><td>${E(l.at)}<br>${E(l.by||'')}</td><td>${(l.changes||[]).map(c=>E(c.t)+': '+E(c.d)).join('<br>')}${l.why?'<br>Why: '+E(l.why):''}</td></tr>`).join('')}</table>`:'<div>No rounds yet.</div>'}`;
    }
    if(k==='cap')return `<h2>Capacity assessment</h2><table><tr><th>Date</th><th>Purpose</th><th>Capacity</th><th>Doctor</th><th>Patient or family signature</th></tr>${caps(pid).map(a=>`<tr><td>${E(a.at)}</td><td>${E(a.purpose||'')}</td><td>${E(a.level||'Not recorded')}</td><td>${E(a.by||'')}</td><td>${a.pending?'Pending':E(a.person||'')+' '+E(a.personType||'')}</td></tr>`).join('')||'<tr><td colspan="5">None yet.</td></tr>'}</table>`;
    if(k==='rea')return `<h2>Re-assessment (IPD)</h2>${reas(pid).map(r=>`<div class="n"><div class="h"><span>Re-assessment</span><span>${E(r.at)}</span></div><div class="m">${E(r.by||'')}</div>${RQ.map(([q,l])=>r[q]?`<div class="s"><b>${E(l)}</b>${E(r[q])}</div>`:'').join('')}</div>`).join('')||'<div>None yet.</div>'}`;
    return '';
  }
  window.docPrint=function(pid,k){
    const ks=k==='all'?['dn','rd','cap','rea']:[k],T={dn:'Daily notes',rd:'Rounds',cap:'Capacity assessment',rea:'Re-assessment',all:'Documentation'};
    if(typeof psyPdf==='function')psyPdf(T[k]||'Documentation',ks.map(x=>printHtml(pid,x)).join(''),ptFind(pid));else window.print();
  };

  /* ---------- the page ---------- */
  function paint(v,pid){
    const bar=v.querySelector('.ws-mid > .subtabs')||v.querySelector('.subtabs');if(!bar)return;
    const host=bar.parentElement;if(host.querySelector('#docWrap'))return;
    const old=[...host.children].slice([...host.children].indexOf(bar)+1).filter(e=>e.id!=='acrBody');
    const N=notes(pid),C=caps(pid),R=reas(pid);
    const wrap=document.createElement('div');wrap.id='docWrap';
    const RL=roundAll(pid),cnt={dn:N.length,rd:RL.length,cap:C.length,rea:R.length},LB={dn:'Daily notes',rd:'Rounds',cap:'Capacity assessment',rea:'Re-assessment'};
    /* 24 Nov 2026 (Anu, meeting): no "Documentation" title and line here, the tab already says it */
    wrap.innerHTML=`<div class="doc-tabs" role="tablist" aria-label="Documentation">${KEYS.map(k=>`<button type="button" role="tab" class="doc-tab ${TAB()===k?'on':''}" id="docT_${k}" data-k="${k}" aria-controls="docP_${k}" aria-selected="${TAB()===k}" tabindex="${TAB()===k?0:-1}" onclick="docTab('${k}')" onkeydown="docTabKey(event)">${LB[k]}<span class="doc-tc">${cnt[k]}</span></button>`).join('')}</div>`
      +part(pid,'dn','Daily notes',N.length+' note'+(N.length===1?'':'s'),N[0]?((N[0].d||'')+' '+(N[0].my||'')).trim():'','<div id="docDn"></div>',`<button class="btn sm pri" onclick="openNotesFor('${Q(pid)}')">Open Daily notes for all patients</button>`)
      +part(pid,'rd','Rounds',RL.length+' round'+(RL.length===1?'':'s'),(RL[0]||{}).at||'',roundsTable(pid)||'<div class="small muted" style="padding:16px 4px">No rounds yet.</div>',`<button class="btn sm pri" onclick="if(window.psyOpenRounds)psyOpenRounds('${Q(pid)}');else go('#/rounds')">Open Rounds for all patients</button>`)
      +part(pid,'cap','Capacity assessment',C.length+' done',C[0]?C[0].at:'',capTable(pid),`<button class="btn sm pri" onclick="acrCapNew('${Q(pid)}')">New assessment</button>`)
      +part(pid,'rea','Re-assessment',R.length+' done',R[0]?R[0].at:'',reaTable(pid),`<button class="btn sm pri" onclick="docReaNew('${Q(pid)}')">New re-assessment</button>`);
    old[0]?old[0].before(wrap):host.appendChild(wrap);
    const dn=wrap.querySelector('#docDn');old.forEach(e=>{e.style.display='';dn.appendChild(e);});
    if(typeof window.pgUpgradeFilters==='function')wrap.querySelectorAll('.psy-dn-filter-row').forEach(window.pgUpgradeFilters);
    /* Daily notes' own Print button prints this part */
    dn.querySelectorAll('button').forEach(b=>{if(/^Print all daily notes$/.test(b.textContent.trim()))b.remove();});
    /* the "Writing notes for several patients?" bar: its button is now in the part's own button row */
    dn.querySelectorAll('section.card').forEach(c=>{if(/^Writing notes for several patients\?/.test((c.textContent||'').trim()))c.remove();});
  }
  function tabs(v,pid,sub){
    const bar=v.querySelector('.ws-mid > .subtabs')||v.querySelector('.subtabs');if(!bar)return;
    bar.querySelectorAll('[data-acr="rounds"],[data-acr="capacity"]').forEach(b=>b.remove());
    const dn=[...bar.querySelectorAll('button')].find(b=>/#\/patient\/[^/]+\/daily'/.test(b.getAttribute('onclick')||''));
    if(dn&&!dn.dataset.doc){dn.dataset.doc='1';const t=[...dn.childNodes].reverse().find(n=>n.nodeType===3&&n.textContent.trim());if(t)t.textContent='Documentation';else dn.append('Documentation');}
    if(sub==='daily')paint(v,pid);
  }
  const css=document.createElement('style');css.id='m23-doc-css';
  css.textContent='#docWrap{display:flex;flex-direction:column;gap:12px}'
    +'.doc-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:4px 2px}'
    +'.doc-tabs{display:flex;gap:4px;border-bottom:1px solid #e4e7ec;overflow-x:auto;position:sticky;top:0;z-index:3;background:var(--bg,#f6f8fb)}'
    +'.doc-tab{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:11px 16px;font-size:14px;font-weight:500;color:#475467;white-space:nowrap;transition:color .15s,box-shadow .15s}'
    +'.doc-tab:hover{color:#101828}.doc-tab.on{color:#1849a9;box-shadow:inset 0 -2px 0 #1e6cdb;font-weight:600}.doc-tab:focus-visible{outline:2px solid #1e6cdb;outline-offset:-2px;border-radius:6px}'
    +'.doc-tc{font-size:11.5px;min-width:20px;text-align:center;padding:1px 7px;border-radius:99px;background:#f2f4f7;color:#475467;font-weight:600}.doc-tab.on .doc-tc{background:#eef4ff;color:#1e6cdb}'
    +'.doc-part{padding:0;animation:docIn .18s ease-out}@keyframes docIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'
    +'.doc-sum{display:flex;align-items:center;gap:12px;flex-wrap:wrap;width:100%;padding:14px 20px;box-sizing:border-box;color:#101828}'
    +'.doc-sum b{font-size:16px}.doc-n{font-size:12px;background:#eef4ff;color:#1e6cdb;border-radius:999px;padding:2px 10px;font-weight:600}'
    +'.doc-act{display:flex;gap:8px;flex-wrap:wrap}.doc-body{padding:0 16px 16px;border-top:1px solid #eef1f5}.doc-body>#docDn>section.card{box-shadow:none;border:0;margin:0}'
    +'@media(prefers-reduced-motion:reduce){.doc-part{animation:none}.doc-tab{transition:none}}'
    +'.doc-body .psy-dn-filter-row{padding:12px 4px 4px}'
    +'.doc-rea{padding:6px 8px 2px}.doc-rea .field{display:block}.doc-rea textarea{width:100%;box-sizing:border-box}'
    +'.doc-h4{margin:16px 4px 8px;font-size:14px}.doc-rea .field{margin-bottom:12px}.doc-kv{padding:8px 0;border-bottom:1px solid #eef1f5}.doc-kv b{display:block;font-size:12px;color:#475467;margin-bottom:2px}'
    /* capacity pop-up: scrolls inside the window */
    +'#modal:has(#acrCapF){display:flex!important;flex-direction:column;max-height:calc(100vh - 40px)!important;overflow:hidden!important}'
    +'#modal:has(#acrCapF) .mb{flex:1 1 auto;min-height:0;overflow:auto!important;overscroll-behavior:contain}#modal:has(#acrCapF) .mh,#modal:has(#acrCapF) .mf{flex:none}'
    +'#modal #acrCapF{max-height:none!important;overflow:visible!important}'
    +'';
  document.head.appendChild(css);

  const __r=render;
  render=function(){
    const r0=route();
    if(r0.pid&&(r0.sub==='rounds'||r0.sub==='capacity')){OPEN.tab=r0.sub==='rounds'?'rd':'cap';location.replace('#/patient/'+encodeURIComponent(r0.pid)+'/daily');}
    const o=__r.apply(this,arguments);
    try{const {pid,sub}=route();const v=document.getElementById('view');if(pid&&v)tabs(v,pid,sub);}catch(e){}
    return o;
  };
})();
