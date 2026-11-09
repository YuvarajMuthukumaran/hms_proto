
/* Psychiatrist (6 Nov 2026), Trello backlog.
   - #62: before any AI scribe starts, the psychiatrist confirms that the patient and family agreed to the recording (asked once per sign-in).
   - #64: if today's note was already filled on the all-patients Daily notes page, the patient's Daily notes tab shows a closed summary card
     instead of the input form; the input form shows only when no note has been added. */
(function(){
  const psy=()=>S.role==='psychiatrist';

  function gate(name){
    const orig=window[name];if(typeof orig!=='function'||orig._gated)return;
    const g=function(){
      const args=arguments,self=this;
      if(!psy()||S.scribeConsent)return orig.apply(self,args);
      window._scribeGo=function(){S.scribeConsent=true;closeModal();orig.apply(self,args);};
      openModal('<div class="mh"><h3>Consent to recording</h3><button class="x" aria-label="Close" onclick="closeModal()">×</button></div>'
        +'<div class="mb"><div class="callout amber">The AI scribe records the conversation. Ask the patient and family for their consent before you start.</div>'
        +'<label class="row" style="gap:8px;margin-top:12px;align-items:flex-start"><input type="checkbox" id="scribeOk" onchange="document.getElementById(\'scribeGo\').disabled=!this.checked"> <span>The patient and family have agreed to the recording.</span></label></div>'
        +'<div class="mf"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="scribeGo" disabled onclick="_scribeGo()">Start AI scribe</button></div>');
    };
    g._gated=true;window[name]=g;
  }
  ['listenRound','scribeHistory','scribeDaily'].forEach(gate);

  const __pd=pDaily;
  pDaily=function(){
    const h=__pd.apply(this,arguments);if(!psy())return h;
    const e=(S.eod||{})[S.pid];if(!e||!e.saved)return h;
    const t=document.createElement('template');t.innerHTML=h;
    const form=[...t.content.children].find(el=>{const h3=el.querySelector&&el.querySelector('h3');return h3&&/^Daily note\s*·/.test(h3.textContent.trim());});
    if(!form)return h;
    const sum=[e.sleep,e.meal,e.mood,e.beh].filter(Boolean).join(' · ')||'Note saved';
    const c=document.createElement('template');
    c.innerHTML=`<section class="card"><div class="pad row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-weight:600">Today's daily note is saved</div><div class="small muted">${hesc(sum)}. It is listed under Earlier notes below.</div></div><button class="btn sm" onclick="S.eod['${S.pid}'].saved=false;render()">Edit today's note</button></div></section>`;
    form.replaceWith(c.content);
    return t.innerHTML;
  };

  /* Current medicines on the overview: the Prescription column (dates, "Prescribed by Dr. ..., date and time") gets more room and a larger
     size; the Ward adherence column is smaller (narrow bar, small percentage). Columns are placed by name so it holds with or without the time chip. */
  const mcss=document.createElement('style');mcss.id='psy-meds-css';
  const R='body.psy-views #view .medlist .medrow';
  mcss.textContent=`@media (min-width:901px){
  ${R}{grid-template-columns:36px minmax(150px,1fr) minmax(140px,auto) auto minmax(280px,1.6fr) 104px!important;grid-template-areas:"pill name slots time meta adh"!important;column-gap:16px}
  ${R}>.pill{grid-area:pill}${R}>.mname{grid-area:name}${R}>.slots{grid-area:slots;min-width:140px}
  ${R}>.chip{grid-area:time}${R}>.mmeta{grid-area:meta}${R}>.adh,${R}>.tiny{grid-area:adh}}
  ${R} .mmeta{font-size:14px;line-height:1.4;color:var(--ink-2,#344054)}${R} .mmeta .tiny{font-size:14px;color:var(--ink-2,#344054)}
  ${R} .adh b{font-size:12px}${R} .adhb{height:4px}`;
  document.head.appendChild(mcss);

  /* #59 Admission forms: no "View form" button; the form name itself opens the form (when it has an on-screen version).
     Cleaner columns: name, status, then the two actions on the right. */
  const fcss=document.createElement('style');fcss.id='psy-forms-css';
  fcss.textContent=`#consentCard .ct-t{width:100%;table-layout:fixed}
  #consentCard .ct-t th:nth-child(1){width:46%}#consentCard .ct-t th:nth-child(2){width:24%}
  #consentCard .ct-t td{vertical-align:middle}
  #consentCard .ct-a{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
  #consentCard .ct-name{background:none;border:0;padding:0;font:inherit;font-weight:600;color:var(--ink,#101828);text-align:left;cursor:pointer;text-decoration:underline;text-decoration-color:var(--line,#d0d5dd);text-underline-offset:3px}
  #consentCard .ct-name:hover{text-decoration-color:currentColor}`;
  document.head.appendChild(fcss);
  const __pa48=pAdmission;
  pAdmission=function(){
    const h=__pa48.apply(this,arguments);if(!psy()||h.indexOf('id="consentCard"')<0)return h;
    const t=document.createElement('template');t.innerHTML=h;
    t.content.querySelectorAll('#consentCard tbody tr').forEach(tr=>{
      const vb=[...tr.querySelectorAll('button')].find(b=>b.textContent.trim()==='View form');if(!vb)return;
      const td=tr.querySelector('td'),on=vb.getAttribute('onclick');
      if(on&&!vb.disabled&&td){const n=td.textContent;td.innerHTML='';const b=document.createElement('button');b.type='button';b.className='ct-name';b.setAttribute('onclick',on);b.title='Open the form';b.textContent=n;td.appendChild(b);}
      vb.remove();
    });
    return t.innerHTML;
  };

  /* #61 Detailed capacity assessment, Fill form: the long run of questions is grouped into one card per part (details, 1, 2, 3, conclusion);
     each question has the wording on the left and its answer buttons on the right, the explanation box underneath;
     the conclusion options are two full-width choices. Same questions, same buttons, only the layout changes. */
  const ccss=document.createElement('style');ccss.id='psy-cap-css';
  ccss.textContent=`
  #capCard .cap-g{border:1px solid var(--line-2,#e4e7ec);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:12px;background:#fff}
  #capCard .cap-g>.capsec{margin:0;padding:0;border:0;font-size:15px;line-height:1.35}
  #capCard .cap-g>.capsec strong{font-size:15px;font-weight:700}
  #capCard .cap-g .q{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:16px;row-gap:8px;align-items:center;padding-top:12px;border-top:1px solid var(--line-2,#eef0f3)}
  #capCard .cap-g .q>.small{font-size:14px;line-height:1.45;font-weight:600;color:var(--ink,#101828)}
  #capCard .cap-g .q>.radios{flex-wrap:nowrap;justify-content:flex-end}
  #capCard .cap-g .q>.input{grid-column:1/-1}
  #capCard .cap-g .radios.cap-concl{flex-direction:column;flex-wrap:nowrap}
  #capCard .cap-g .radios.cap-concl .tog{width:100%;text-align:left;height:auto;min-height:44px;padding:10px 14px;white-space:normal;line-height:1.4}
  @media (max-width:760px){#capCard .cap-g .q{grid-template-columns:1fr}#capCard .cap-g .q>.radios{justify-content:flex-start;flex-wrap:wrap}}`;
  document.head.appendChild(ccss);
  const __cf=capForm;
  capForm=function(){
    const h=__cf.apply(this,arguments);if(!psy())return h;
    const t=document.createElement('template');t.innerHTML=h;
    const kids=[...t.content.children],out=document.createElement('div');out.style.cssText='display:flex;flex-direction:column;gap:14px';
    let g=null;
    const open=head=>{g=document.createElement('section');g.className='cap-g';if(head)g.appendChild(head);out.appendChild(g);};
    open(null);
    kids.forEach(k=>{
      if(k.classList.contains('capsec'))open(k);
      else{
        if(k.classList.contains('radios')&&k.querySelector('.tog')&&/^4[AB]/.test(k.textContent.trim()))k.classList.add('cap-concl');
        g.appendChild(k);
      }
    });
    return out.outerHTML;
  };

  /* Admission workup: Physical injuries sits directly below Physical examination (form and read-only view). */
  const __pa49=pAdmission;
  pAdmission=function(){
    const h=__pa49.apply(this,arguments);if(!psy()||h.indexOf('id="workupCard"')<0)return h;
    const t=document.createElement('template');t.innerHTML=h;
    const card=t.content.querySelector('#workupCard');if(!card)return h;
    /* Keep the Fill form / Read only switch compact, like the one in Capacity assessment (not stretched across the card). */
    const sg=card.querySelector('.seg');
    if(sg){sg.style.width='max-content';sg.style.minWidth='240px';sg.style.maxWidth='100%';
      if(sg.parentElement)sg.parentElement.style.display='flex';}
    const lbl=txt=>[...card.querySelectorAll('.lbl')].find(l=>l.textContent.trim()===txt);
    const exam=lbl('Physical examination'),inj=lbl('Physical injuries');
    if(!exam||!inj)return h;
    const eb=exam.closest('label.field,.box'),ib=inj.closest('.box');
    if(eb&&ib&&eb!==ib)eb.after(ib);
    return t.innerHTML;
  };

  /* #60 Admission workup: Fill form first, then Read only. A patient with nothing saved yet opens on Fill form; once saved it opens on Read only.
     The form saves as you type, so every time someone starts editing a record that was already saved, the earlier version is kept
     (who, when, what it said) under "Version history" at the bottom of the card. */
  const WKF=['reason','others','self','exam','inv','invOther'];
  const wkSnap=w=>{const o={by:w.by||'',at:w.at||''};WKF.forEach(k=>{o[k]=Array.isArray(w[k])?w[k].slice():(w[k]||'');});return o;};
  const wkOf=()=>{try{return psyPx(S.pid).wk;}catch(e){return null;}};
  const __wk0=window.psyWk;
  window.psyWk=function(k,v){
    const w=wkOf();
    if(w&&!w._sess){w._sess=true;if(w.at){w.versions=w.versions||[];w.versions.unshift(wkSnap(w));}}
    return __wk0.apply(this,arguments);
  };
  const __wkv=window.psyWkView;
  window.psyWkView=function(v){const w=wkOf();if(w&&v!=='form')w._sess=false;return __wkv.apply(this,arguments);};
  const __pa60=pAdmission;
  pAdmission=function(){
    if(psy()&&S._wkPid!==S.pid){S._wkPid=S.pid;const w=wkOf();S.wkView=(S.pid==='neel'||(w&&(w.at||w.reason||w.exam)))?'read':'form';}
    const h=__pa60.apply(this,arguments);if(!psy()||h.indexOf('id="workupCard"')<0)return h;
    const t=document.createElement('template');t.innerHTML=h;
    const card=t.content.querySelector('#workupCard');if(!card)return h;
    const sg=card.querySelector('.seg');
    if(sg){const bs=[...sg.querySelectorAll('button')],f=bs.find(b=>/^Fill form/.test(b.textContent.trim()));if(f)sg.insertBefore(f,sg.firstChild);}
    const w=wkOf(),vs=(w&&w.versions)||[];
    if(vs.length){
      const L=vs.length,short=(x)=>[x.reason&&'Reason: '+x.reason,(x.others||x.self)&&'Risk: others '+(x.others||'-')+', suicide '+(x.self||'-'),x.exam&&'Examination: '+x.exam,((x.inv||[]).length||x.invOther)&&'Investigations: '+[...(x.inv||[]),x.invOther].filter(Boolean).join(', ')].filter(Boolean);
      const items=vs.map((x,i)=>`<div class="box small" style="display:flex;flex-direction:column;gap:4px"><div><b>Version ${L-i}</b> <span class="muted">· ${hesc(x.by||'unknown')}, ${hesc(x.at||'')}</span></div>${short(x).map(s=>`<div class="tiny">${hesc(s)}</div>`).join('')||'<div class="tiny muted">Empty</div>'}</div>`).join('');
      card.insertAdjacentHTML('beforeend',`<div style="padding:0 20px 16px"><details class="wk-ver"><summary style="cursor:pointer;font-weight:600">Version history · ${L} earlier version${L===1?'':'s'}</summary><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">${items}</div></details></div>`);
    }
    return t.innerHTML;
  };

  /* #66 A family call that is due ("Day 3 to 4 call · psychiatrist") was only shown inside Therapy plans. It now also shows at the top of
     every tab of that patient's page, with the same two buttons, so it cannot be missed. Calling or messaging works as before;
     it disappears once the call is logged. */
  const DUE_CALLS=[['h24','24-hour call'],['d34psy','Day 3 to 4 call']];
  window.psyCallDone=function(pid,key){ptRun(pid,()=>{S.calls=S.calls||{};S.calls[key]='done';return '';});callFamily('x');};
  const __vp66=vPatient;
  vPatient=function(sub){
    const h=__vp66.apply(this,arguments);
    if(!psy()||typeof h!=='string'||/^therapy/.test(String(sub||''))||h.indexOf('id="famCallDue"')>=0)return h;
    const pid=S.focusPid||'neel';let due=[],nr='the family',rel='';
    /* 9 Nov (QA): this patient's own call and own nominated representative. The 24-hour call comes first; the Day 3 to 4 call only
       from day 3 of the stay. Before, every patient showed Neel's sister and the Day 3 to 4 call. */
    try{
      const info=JSON.parse(ptRun(pid,()=>{const p=ptFind(pid),id=ptIdentity(p),c=S.calls||{},day=+p.day||0,r=[];
        if(c.h24!=='done')r.push(['h24','24-hour call']);
        else if(c.d34psy==='due'&&day>=3)r.push(['d34psy','Day 3 to 4 call']);
        return JSON.stringify({due:r,nr:id.nr,rel:id.rel});}));
      due=info.due;nr=info.nr;rel=info.rel;
    }catch(e){}
    if(!due.length)return h;
    const rows=due.map(c=>`<div class="li" style="flex-wrap:wrap"><div class="grow"><div style="font-weight:700">${hesc(c[1])} · psychiatrist · due now</div><div class="small muted">${hesc(nr)}${rel?', '+hesc(rel.toLowerCase()):''}. The call is placed and logged through the HMS with your name and time.</div></div><button class="btn sm" onclick="schedMsg('${hesc(nr)}')">Message caregiver</button><button class="btn sm pri" onclick="psyCallDone('${pid}','${c[0]}')">Call via HMS</button></div>`).join('');
    const ban=`<section class="card" id="famCallDue" style="border-left:4px solid var(--blue,#1570ef)"><div class="hd"><h3>Family call due now</h3></div>${rows}</section>`;
    return /<\/nav>/.test(h)?h.replace('</nav>','</nav>'+ban):ban+h;
  };

  /* #58 the top header (page title, search, bell, profile) took too much room: it slides away when you scroll down and
     comes back as soon as you scroll up (or are near the top). Psychiatrist only. */
  const hcss=document.createElement('style');hcss.id='psy-header-css';
  hcss.textContent='.top{transition:transform .2s ease}.top.psy-hide{transform:translateY(-100%)}';
  document.head.appendChild(hcss);
  let lastY=0;
  window.addEventListener('scroll',()=>{
    const t=document.querySelector('.top');if(!t)return;
    const y=window.scrollY||0;
    t.classList.toggle('psy-hide',psy()&&y>lastY&&y>90);
    lastY=y;
  },{passive:true});

  /* #56 "Written earlier today" on the Daily notes page also lists the notes saved on this page (newest first), with the time. */
  const __pn=window.psyNoteToProfile;
  window.psyNoteToProfile=function(id){
    const d=new Date();
    try{S.eod[id].savedAt=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}catch(e){}
    return __pn&&__pn.apply(this,arguments);
  };
  const __vn=vNotes;
  vNotes=function(){
    const h=__vn.apply(this,arguments);if(!psy())return h;
    const saved=PTS.filter(p=>((S.eod||{})[p.id]||{}).saved);if(!saved.length)return h;
    const t=document.createElement('template');t.innerHTML=h;
    const sec=[...t.content.querySelectorAll('section.card')].find(s=>{const x=s.querySelector('h3');return x&&/^Written earlier today/.test(x.textContent.trim());});
    if(!sec)return h;
    const rows=saved.reverse().map(p=>{
      const e=S.eod[p.id],sum=[e.sleep,e.meal,e.mood,e.beh].filter(Boolean).join('; ')||'Note saved';
      return `<div class="li"><div class="grow"><div style="font-weight:600">${hesc(p.name)}</div><div class="tiny muted">Daily note · ${hesc(e.savedAt||'today')} · ${hesc(sum)}</div></div>${chip('Saved just now','c-green')}</div>`;
    }).join('');
    const hd=sec.querySelector('.hd');if(hd)hd.insertAdjacentHTML('afterend',rows);
    return t.innerHTML;
  };

  /* #55 readability of "Since last round": one animated, unboxed line with units beside their values. */
  const rcss=document.createElement('style');rcss.id='psy-backlog-css';
  rcss.textContent=`
  /* 9 Nov: the strip plays a short entrance ONCE, when a patient's strip first appears (see sinceCard in 25). Nikita saw flicker when the
     animation replayed on every redraw, so a redraw of the same patient renders it still (no .enter class), or resumes it part-way. */
  .pr-vit{display:flex;flex-wrap:wrap;gap:10px;max-width:100%;font-size:14px}
  .pr-vi{display:inline-flex;align-items:center;gap:10px;min-width:0;padding:8px 14px 8px 8px;border:1px solid var(--line-2,#e4e7ec);border-radius:14px;background:linear-gradient(180deg,#fff,#fafbfd);box-shadow:0 1px 2px rgba(16,24,40,.05)}
  .pr-vi .ic{display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border-radius:10px;background:#eff4ff;color:#175cd3}
  .pr-vi .tx{display:flex;flex-direction:column;gap:2px;line-height:1.1;min-width:0}
  .pr-vi .l{color:var(--muted,#667085);font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
  .pr-vi>.tx>b{font-size:18px;font-weight:700;color:var(--ink,#101828);line-height:1.15;font-variant-numeric:tabular-nums;white-space:nowrap}
  .pr-vi .u{color:var(--ink-2,#475467);font-size:11.5px;font-weight:500}
  .pr-spark{flex:0 0 auto;color:#175cd3;overflow:visible}.pr-spark path{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.pr-spark circle{fill:currentColor}
  .pr-vi.warn{border-color:#fedf89;background:linear-gradient(180deg,#fffdf6,#fffaeb)}.pr-vi.warn .ic{background:#fef0c7;color:#b54708}.pr-vi.warn>.tx>b,.pr-vi.warn .pr-trend{color:#b54708}.pr-vi.warn .pr-spark{color:#dc6803}
  .pr-vi.bad{border-color:#fecdca;background:linear-gradient(180deg,#fffcfb,#fef3f2)}.pr-vi.bad .ic{background:#fee4e2;color:#d92d20}.pr-vi.bad>.tx>b,.pr-vi.bad .pr-trend{color:#d92d20}.pr-vi.bad .pr-spark{color:#d92d20}
  .pr-trend{font-size:15px;font-weight:800;color:var(--ink-2,#475467);line-height:1}
  @keyframes pr-in{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
  @keyframes pr-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
  @keyframes pr-dot{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
  @keyframes pr-pop{0%{opacity:0;transform:translateY(5px)}60%{opacity:1;transform:translateY(-2px)}100%{opacity:1;transform:none}}
  .pr-vit.enter .pr-vi{animation:pr-in .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--d,0s) - var(--el,0s))}
  .pr-vit.enter .pr-vi:nth-child(1){--d:0s}.pr-vit.enter .pr-vi:nth-child(2){--d:.07s}.pr-vit.enter .pr-vi:nth-child(3){--d:.14s}.pr-vit.enter .pr-vi:nth-child(4){--d:.21s}
  .pr-vit.enter .pr-spark path{stroke-dasharray:1;stroke-dashoffset:1;animation:pr-draw .85s cubic-bezier(.4,0,.2,1) both;animation-delay:calc(var(--d,0s) + .3s - var(--el,0s))}
  .pr-vit.enter .pr-spark circle{transform-box:fill-box;transform-origin:center;animation:pr-dot .3s ease-out both;animation-delay:calc(var(--d,0s) + 1s - var(--el,0s))}
  .pr-vit.enter .pr-trend{display:inline-block;animation:pr-pop .5s ease-out both;animation-delay:calc(var(--d,0s) + .55s - var(--el,0s))}
  @media(max-width:520px){.pr-vit{gap:8px}.pr-vi{padding:6px 10px 6px 6px;gap:8px}.pr-vi .ic{flex-basis:28px;width:28px;height:28px}.pr-vi>.tx>b{font-size:16px}.pr-spark{display:none}}
  @media(prefers-reduced-motion:reduce){.pr-vit.enter .pr-vi,.pr-vit.enter .pr-spark path,.pr-vit.enter .pr-spark circle,.pr-vit.enter .pr-trend{animation:none}}
  .pr-lines{gap:0;margin-top:14px;font-size:15px;line-height:1.45}
  .pr-lines>div{display:grid;grid-template-columns:120px 1fr;gap:12px;padding:9px 0;border-top:1px solid var(--line-2,#e4e7ec);color:var(--ink,#101828)}
  .pr-lines b{width:auto;color:var(--ink-2,#344054);font-weight:700}
  .pr-lab .pr-lo{display:grid;grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"test when remove" "advice advice advice";align-items:center;gap:8px 12px;padding:12px 0;border-top:1px solid var(--line-2,#e4e7ec)}
  .pr-lab .pr-lo>span:first-child{grid-area:test;min-width:0;color:var(--ink,#101828)}
  .pr-lab .pr-lo>span:nth-child(2){grid-area:when;white-space:nowrap;padding:4px 9px;border-radius:999px;background:var(--bg-soft,#f8fafc);color:var(--ink-2,#344054)}
  .pr-lab .pr-lo>input{grid-area:advice;width:100%;min-width:0;box-sizing:border-box;min-height:38px;padding:8px 12px;font-size:14px}
  .pr-lab .pr-lo>button{grid-area:remove;justify-self:end;width:32px;height:32px}
  @media(max-width:580px){.pr-lab .pr-lo{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"test remove" "when when" "advice advice"}}`;
  document.head.appendChild(rcss);

  /* #54 Rounds > Monitoring: one row instead of two stacked sections.
     [Monitoring parameter and frequency] [Lab test] [Collect]; lab orders and pending items stay listed under it. */
  const __rm=roundMon;
  roundMon=function(){
    const h=__rm.apply(this,arguments);if(!psy())return h;
    const t=document.createElement('template');t.innerHTML=h;const q=s=>t.content.querySelector(s);
    const top=q('.mon-add-top'),lab=q('.pr-lab');if(!top||!lab)return h;
    const casc=top.querySelector('.mon-cascade'),pick=lab.querySelector('select[aria-label="Add a lab order"]'),when=lab.querySelector('select[aria-label="Collect"]');
    if(!casc||!pick||!when)return h;
    const row=document.createElement('div');row.setAttribute('style','display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 20px');
    casc.style.flex='1 1 240px';pick.style.flex='1 1 200px';pick.style.width='auto';
    const w=document.createElement('label');w.setAttribute('style','display:flex;align-items:center;gap:6px');
    w.innerHTML='<span class="tiny muted">Collect</span>';when.style.minHeight='';w.appendChild(when);
    row.append(casc,pick,w);
    /* drop the old labels and rows; keep the "other test" box and the lab order lines */
    lab.querySelectorAll(':scope > .row').forEach(x=>x.remove());pick.remove();lab.style.borderTop='0';lab.style.paddingTop='0';
    top.replaceWith(row);
    return t.innerHTML;
  };

  /* #75 Capacity assessment: keep a patient-specific draft as every answer changes, and restore it when the form is reopened. */
  const capData=pid=>{const x=psyPx(pid);x.capacityDraft=x.capacityDraft||null;return x.capacityDraft;};
  function saveCapacityDraft(){
    if(!psy()||S.capView!=='form')return;
    const card=document.getElementById('capCard');if(!card)return;
    const inputs=[...card.querySelectorAll('input,select,textarea')].map(x=>x.value);
    const answers=[...card.querySelectorAll('.radios')].map(g=>[...g.querySelectorAll('.tog')].findIndex(b=>b.classList.contains('on')));
    const old=capData(S.pid)||{};
    psyPx(S.pid).capacityDraft={inputs,answers,by:signer(),at:atNow(),createdAt:old.createdAt||atNow()};
  }
  window.psyCapSave=function(){saveCapacityDraft();toast('Capacity assessment draft saved');};
  if(!window.__psyCapacityAutosave){
    window.__psyCapacityAutosave=true;
    const capEvent=e=>{if(e.target&&e.target.closest&&e.target.closest('#capCard'))saveCapacityDraft();};
    document.addEventListener('input',capEvent,true);document.addEventListener('change',capEvent,true);
    document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#capCard .radios .tog'))setTimeout(saveCapacityDraft,0);},true);
  }
  const __capDraftRender=pAdmission;
  pAdmission=function(){
    const h=__capDraftRender.apply(this,arguments);if(!psy())return h;
    const t=document.createElement('template');t.innerHTML=h;const card=t.content.querySelector('#capCard');
    if(!card||S.capView==='read')return t.innerHTML;
    const d=capData(S.pid),inputs=[...card.querySelectorAll('input,select,textarea')],groups=[...card.querySelectorAll('.radios')];
    if(d&&d.inputs&&d.inputs.length===inputs.length)inputs.forEach((el,i)=>{el.value=d.inputs[i];});
    if(d&&d.answers&&d.answers.length===groups.length)groups.forEach((g,i)=>{const selected=d.answers[i];[...g.querySelectorAll('.tog')].forEach((b,j)=>b.classList.toggle('on',j===selected));});
    const save=[...card.querySelectorAll('button')].find(b=>b.textContent.trim()==='Save draft');if(save)save.setAttribute('onclick','psyCapSave()');
    const meta=card.querySelector('.hd > div');if(meta&&!meta.querySelector('.cap-autosave')){const note=document.createElement('div');note.className='tiny muted cap-autosave';note.style.marginTop='4px';note.textContent=d&&d.at?`Draft saves as you type · last saved ${d.at}`:'Draft saves automatically as you type';meta.appendChild(note);}
    return t.innerHTML;
  };

  /* #67 Patient Experience: the RMO owns the fill step with the Patient Experience team; revisit saved preferences in a clean read-only view. */
  const expCss=document.createElement('style');expCss.id='psy-experience-css';
  expCss.textContent=`#psyExperiencePage .exp-read .input:disabled{opacity:1;color:var(--ink,#101828);background:var(--bg-soft,#f8fafc);border-color:transparent;cursor:default}
    #psyExperiencePage .exp-read .tog:disabled{opacity:1;cursor:default}`;
  document.head.appendChild(expCss);
  window.psyExperienceView=function(view){psyPx(S.pid).experienceView=view==='form'?'form':'read';render();};
  window.psyExperienceSave=function(){
    const page=document.getElementById('psyExperiencePage');if(!page)return;
    const grid=page.querySelector('.ovgrid');if(!grid)return;
    const inputs=[...grid.querySelectorAll('input.input,select.input,textarea.input')].map(x=>x.value);
    const answers=[...grid.querySelectorAll('.radios')].map(g=>[...g.querySelectorAll('.tog')].findIndex(b=>b.classList.contains('on')));
    psyPx(S.pid).experience={inputs,answers,saved:true,by:signer(),at:atNow()};
    psyPx(S.pid).experienceView='read';render();toast('Patient Experience saved by '+signer());
  };
  const __prefsRmo=pPrefs;
  pPrefs=function(){
    let h=__prefsRmo.apply(this,arguments);if(S.role!=='rmo')return h;
    if(typeof pGriev==='function'&&!/Grievances\s*·/.test(h))h+='<div class="lbl" style="margin:10px 4px 0">Grievances</div>'+pGriev();
    const data=psyPx(S.pid).experience||{},view=psyPx(S.pid).experienceView||(data.saved?'read':'form');
    const t=document.createElement('template');t.innerHTML=h;const page=document.createElement('div');page.id='psyExperiencePage';page.className=view==='read'?'exp-read':'exp-form';
    const toolbar=document.createElement('div');toolbar.className='row';toolbar.style.cssText='justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 12px';
    toolbar.innerHTML=`<div class="seg" style="align-self:flex-start;min-width:220px"><button class="${view==='read'?'on':''}" onclick="psyExperienceView('read')">Read only</button><button class="${view==='form'?'on':''}" onclick="psyExperienceView('form')">Fill form</button></div>${view==='form'?'<button class="btn pri" onclick="psyExperienceSave()">Save changes</button>':''}`;
    const grievance=[...t.content.querySelectorAll('section.card')].find(s=>/^Grievances/.test((s.querySelector('h3')||{}).textContent||''));
    const log=grievance&&[...grievance.querySelectorAll('button')].find(b=>b.textContent.trim()==='Log grievance');
    if(log){const top=log.cloneNode(true);top.className='btn pri';toolbar.appendChild(top);log.remove();}
    page.append(toolbar,t.content);
    const grid=page.querySelector('.ovgrid');
    if(data.inputs&&grid){const inputs=[...grid.querySelectorAll('input.input,select.input,textarea.input')];if(inputs.length===data.inputs.length)inputs.forEach((el,i)=>{el.value=data.inputs[i];});}
    if(data.answers&&grid){const groups=[...grid.querySelectorAll('.radios')];if(groups.length===data.answers.length)groups.forEach((g,i)=>[...g.querySelectorAll('.tog')].forEach((b,j)=>b.classList.toggle('on',j===data.answers[i])));}
    if(view==='read'&&grid){grid.querySelectorAll('.input,.tog').forEach(el=>{el.disabled=true;});grid.querySelectorAll('button').forEach(b=>{if(/^(Save diet|Add visitor|Save and send to admin)$/.test(b.textContent.trim()))b.remove();});}
    if(view==='form'&&grid){grid.querySelectorAll('button').forEach(b=>{if(/^(Save diet|Save and send to admin)$/.test(b.textContent.trim()))b.remove();});}
    if(view==='read'&&data.saved){const note=document.createElement('div');note.className='tiny muted';note.style.cssText='margin:0 4px 10px';note.textContent=`Last saved by ${data.by||'the RMO'} · ${data.at||''}`;toolbar.after(note);}
    return page.outerHTML;
  };

  /* #83 Keep the Discharge summary destination easy to spot in the patient tabs. */
  /* Keep the psychiatrist's patient tabs on one row at every viewport width.
     On narrow screens the row scrolls horizontally so every tab stays readable. */
  const patientTabCss=document.createElement('style');patientTabCss.id='psy-patient-tabs-css';
  patientTabCss.textContent=`body.psy-views #view .subtabs{display:flex;flex-wrap:nowrap;gap:8px;max-width:100%;min-width:0;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;white-space:nowrap;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
    body.psy-views #view .subtabs>.subtab{flex:0 0 auto;white-space:nowrap;scroll-snap-align:start}
    body.psy-views #view .subtabs{scroll-snap-type:x proximity}`;
  document.head.appendChild(patientTabCss);

  const dischargeTabCss=document.createElement('style');dischargeTabCss.id='psy-discharge-tab-css';
  dischargeTabCss.textContent=`body.psy-views #view .subtabs .subtab.psy-discharge-tab{border:1px solid #9ac2ff;background:#eff8ff;color:#175cd3;font-weight:700}
    body.psy-views #view .subtabs .subtab.psy-discharge-tab.on{background:var(--blue);border-color:var(--blue);color:#fff}`;
  document.head.appendChild(dischargeTabCss);
  const __renderDischarge=render;
  render=function(){
    const out=__renderDischarge.apply(this,arguments);if(!psy())return out;
    const tab=[...document.querySelectorAll('#view .subtabs .subtab')].find(b=>/^Discharge(?: summary)?$/.test(b.textContent.trim()));
    if(tab){tab.textContent='Discharge summary';tab.classList.add('psy-discharge-tab');tab.setAttribute('aria-label','Open discharge summary');}
    return out;
  };
})();
