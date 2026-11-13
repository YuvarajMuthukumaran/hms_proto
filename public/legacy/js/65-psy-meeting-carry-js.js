/* 10 Nov 2026, team meeting audio: the asks that had only reached the psychologist's portal.
   Psychiatrist (gated by S.role==='psychiatrist'):
   1. "These should come as pop-up, don't redirect" — Take Action and the eye window open a pop-up for that one patient
      (daily note), and a task that is a daily or progress note no longer jumps to another page. Round notes still open
      that patient's own Rounds tab, which is what the team asked for.
   2. Handover: Differential diagnosis and Medical / surgical comorbidity are filled from the detailed history
      ("they don't have to type it, this information is going to be there"); the doctor adds only what is missing.
   Shared discharge page (the psychologist still sees it read only):
   3. "Form C signed by the patient", not "signed again", and no Request button ("we have to take it").
      What the record already shows is ticked for you, and "Discharge summary written" is the last item. */
(function(){
  const doc=()=>S.role==='psychiatrist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const nm=pid=>{const p=ptFind(pid);return p?p.name:'';};

  const css=document.createElement('style');css.id='psy-meeting-carry-css';
  css.textContent=`
  .modal.pcd-wide{width:min(1100px,96vw)!important;max-width:none!important}
  .pcd-nm{max-height:68vh;overflow:auto}
  .pcd-nm .pn-bar,.pcd-nm .pn-side,.pcd-nm .pn-start{display:none!important}
  .pcd-nm .pn-nx{display:none!important}
  .pcd-nm .pn-h{cursor:default}
  .pcd-nm .pn-main{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .pcd-nm .pn-main>.pn-step{border-right:0!important;border-bottom:1px solid var(--line)!important}
  .pcd-nm #pnS-0,.pcd-nm #pnS-2{border-right:1px solid var(--line)!important}
  @media (max-width:760px){.pcd-nm .pn-main{grid-template-columns:1fr!important}.pcd-nm #pnS-0,.pcd-nm #pnS-2{border-right:0!important}}
  `;
  document.head.appendChild(css);

  /* ---------- 1. the daily note as a pop-up for one patient ---------- */
  window.psyPopNote=function(pid){
    if(typeof psyNote!=='function'){go('#/patient/'+pid+'/notes');return;}
    V3.modal('Daily note · '+hesc(nm(pid)),'Today’s note for this patient only. You stay on the dashboard.',
      `<div class="pcd-nm">${psyNote('eod',pid,true)}</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="psyPopNoteSave('${pid}')">Save note</button>`);
    const m=document.querySelector('.modal');if(m)m.classList.add('pcd-wide');
  };
  window.psyPopNoteSave=function(pid){
    psySave('eod',pid);
    if(((S.eod||{})[pid]||{}).saved)closeModal();
  };

  /* swap the page jumps in the Take Action menu and the eye window for a pop-up (notes) or that patient's Rounds tab */
  const swap=root=>{
    if(!root||!doc())return;
    root.querySelectorAll('button[onclick]').forEach(b=>{
      const oc=b.getAttribute('onclick')||'';
      const m=oc.match(/go\('#\/patient\/([^/']+)\/[^']*'\)/);
      if(!m)return;
      const pid=m[1],item=b.closest('.pd-di')||b,txt=item.textContent||'';
      let to='';
      if(/daily note|progress note|end of day/i.test(txt))to=`psyPopNote('${pid}')`;
      else if(/\bround/i.test(txt))to=`psyOpenRounds('${pid}')`;
      if(!to)return;
      b.setAttribute('onclick',oc.replace(/S\.__eyePid='[^']*';/,'').replace(/go\('#\/patient\/[^']*'\)/,to));
    });
  };
  if(typeof window.psyMenu==='function'){
    const __pm=window.psyMenu;
    window.psyMenu=function(ev,pid){
      const r=__pm.apply(this,arguments);
      const el=document.getElementById('pdMenu');
      if(!el||!doc())return r;
      swap(el);
      /* the two things that can be done without leaving the dashboard, the same as the psychologist's menu */
      if(!el.querySelector('[data-pcd]')){
        const row=(go,t,s)=>`<button class="pdm-i" data-pcd="1" onclick="pdMenuClose();${go}"><b>${t}</b><span>${s}</span></button>`;
        el.insertAdjacentHTML('beforeend',
          row(`psyPopNote('${pid}')`,'Write daily note','Pop-up for this patient')
          +row(`psyOpenRounds('${pid}')`,'Round note','Opens Rounds on this patient only'));
        try{
          const b=ev.currentTarget.getBoundingClientRect();
          {const z=parseFloat(getComputedStyle(document.body).zoom)||1;el.style.top=(Math.min(b.bottom+6,innerHeight-el.offsetHeight*z-12)/z)+'px';}
        }catch(e){}
      }
      return r;
    };
  }
  if(typeof window.psyEye==='function'){
    const __pe=window.psyEye;
    window.psyEye=function(){const r=__pe.apply(this,arguments);swap(document.getElementById('modal'));return r;};
  }

  /* ---------- 2. handover: differential diagnosis and comorbidity from the detailed history ---------- */
  /* what the detailed history says for a heading, wherever that history lives for this patient */
  /* HREAD, HDRAFT and CASEHX are Neel's record: never put one patient's history on another.
     Every other patient has only what their own record holds (their diagnosis), and the rest stays "To add". */
  function fromHistory(pid,re,isDx){
    if(pid==='neel'){
      const pick=rows=>{const r=(rows||[]).find(a=>re.test(String(a[0])));if(!r)return '';const v=r[1];return Array.isArray(v)?v.join('; '):String(v||'');};
      try{if(typeof HREAD!=='undefined'){const v=pick(HREAD);if(v)return v;}}catch(e){}
      try{if(typeof HDRAFT!=='undefined'){const k=Object.keys(HDRAFT).find(x=>re.test(x));if(k&&HDRAFT[k])return Array.isArray(HDRAFT[k])?HDRAFT[k].join('; '):String(HDRAFT[k]);}}catch(e){}
      try{if(typeof CASEHX!=='undefined'){const k=Object.keys(CASEHX).find(x=>re.test(x));if(k&&CASEHX[k])return String(CASEHX[k]);}}catch(e){}
      return '';
    }
    if(!isDx)return '';
    try{const c=typeof ptCtxOf==='function'?ptCtxOf(pid):null;const p=ptFind(pid);const d=(c&&c.dx)||(p&&p.dx)||'';return d?String(d):'';}catch(e){}
    return '';
  }
  const DDX=/diagnostic formulation|provisional diagnos|differential diagnos/i;
  const COM=/past history \(medical|past medical history|medical.*comorbid/i;
  /* fill the two fields once per patient, so the doctor opens the handover with them already there */
  function seedHandover(){
    if(!doc()||!S.psyHO||!S.psyHO.ui)return;
    const u=S.psyHO.ui;u.notes=u.notes||{};
    (typeof allPts==='function'?allPts():[]).forEach(p=>{
      const e=u.notes[p.id]=u.notes[p.id]||{};
      if(e.ddx===undefined){const v=fromHistory(p.id,DDX,true);if(v)e.ddx=v;}
      if(e.comorb===undefined){const v=fromHistory(p.id,COM,false);if(v)e.comorb=v;}
    });
  }

  /* ---------- 3. discharge checklist ---------- */
  /* tick what the record already shows, once; the doctor can untick it again */
  function autoTick(){
    const D=S.discharge=S.discharge||{},was=S.dcAuto=S.dcAuto||{};
    S.dcBy=S.dcBy||{};
    const ev={};
    try{if(S.dischargeDrafted)ev.written=true;}catch(e){}
    try{const d=((window.psyPx?psyPx(S.pid):{}).recon||{}).dis;if((Array.isArray(d)?d.length:Object.keys(d||{}).length))ev.meds=true;}catch(e){}
    try{if(S.capacityDone)ev.capacity=true;}catch(e){}
    try{const x=window.psyPx?psyPx(S.pid):{};if(x.suicide||x.riskLevel)ev.risk=true;}catch(e){}
    Object.keys(ev).forEach(k=>{
      if(was[k])return;
      was[k]=true;
      if(!D[k]){D[k]=true;S.dcBy[k]={by:'From the record',at:typeof atNow==='function'?atNow():''};}
    });
  }
  const __dc=pDischarge;
  pDischarge=function(){
    autoTick();
    const h=__dc.apply(this,arguments);
    if(typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content;
      const labels=[...R.querySelectorAll('label.check')];
      if(!labels.length)return h;
      /* Form C: just signed, and the front desk takes it (no Request button) */
      labels.forEach(l=>{
        const s=l.querySelector('span[style*="font-weight:600"]');
        if(!s||!/^Form C signed again by the patient/.test(s.textContent.trim()))return;
        s.textContent='Form C signed by the patient';
        const b=l.querySelector('button');if(b)b.remove();
        const t=l.querySelector('.tiny.muted');
        if(t)t.textContent='Request for independent admission · the front desk takes it before discharge';
      });
      /* last item: the summary is written */
      const last=labels[labels.length-1],host=last&&last.parentNode;
      if(host&&!R.querySelector('[data-dcw]')){
        const on=!!(S.discharge||{}).written,by=(S.dcBy||{}).written;
        const row=document.createElement('label');
        row.className='check';row.setAttribute('data-dcw','1');
        row.innerHTML=`<input type="checkbox" ${on?'checked':''} onchange="S.discharge.written=this.checked;S.dcBy=S.dcBy||{};if(this.checked)S.dcBy.written=whoAt();else delete S.dcBy.written;render()"><span class="grow"><span style="font-weight:600">Discharge summary written</span><br><span class="tiny muted">The last step: the summary is drafted and ready to sign</span>${on&&by?`<span class="tiny muted" style="display:block;margin-top:3px">Ticked by ${hesc(by.by)} · ${hesc(by.at)}</span>`:''}</span>`;
        host.insertBefore(row,last.nextSibling);
      }
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* seed the handover fields on every draw (cheap, and new patients get them too) */
  const __r=render;
  render=function(){seedHandover();return __r.apply(this,arguments);};
})();
