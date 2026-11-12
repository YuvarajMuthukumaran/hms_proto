/* 12 Nov 2026, Trello card 98: Role permissions and e-sign.
   - Restraint and observation level: psychiatrist only (floor lead psychiatrist too). Everyone else sees them read only.
     The psychologist and RMO workspaces draw some pages through the psychiatrist's code, so the page's own role is checked, not S.role.
   - Countersign opens the order (patient, drug or order, dose, route, reason, given by) and asks for the PIN.
   - The same PIN sign is used for the discharge summary and for the capacity assessment, the detailed history and the e-sign forms.
   - "Logged by" on Log event is filled from the logged-in user and cannot be changed.
   - A PHQ-9 / GAD-7 (any assigned assessment) cannot be marked done without a score.
   Prototype PIN: 1234 (shown in the window). Nothing is stored except who signed and when. */
(function(){
  const real=()=>{const b=window.__TULASI__||{};return String(b.viewRole||b.role||'');};
  const canDecide=()=>{const r=real();return !r||['psychiatrist','floor-lead-psychiatrist'].includes(r);};
  window.permCanDecide=canDecide;
  const PIN='1234';

  /* ---------- PIN sign ---------- */
  let cb=null,tries=0;
  window.pinSign=function(title,lines,done,sub){
    cb=done;tries=0;
    const rows=(lines||[]).filter(l=>l&&l[1]!==undefined&&l[1]!==null&&String(l[1]).trim()!=='').map(l=>`<div class="pin-r"><span>${hesc(l[0])}</span><b>${hesc(String(l[1]))}</b></div>`).join('');
    V3.modal(hesc(title),hesc(sub||'Check it, then sign with your PIN.'),
      `${rows?`<div class="pin-sum">${rows}</div>`:''}
       <label class="field" style="margin-top:12px"><span class="lbl">Your PIN</span><input class="input" id="pinIn" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="4 digits" style="max-width:160px;letter-spacing:.3em;font-size:18px" onkeydown="if(event.key==='Enter')pinGo()"></label>
       <div class="tiny muted">Signed as <b>${hesc(signer())}</b>. Your name and the time are recorded. Prototype PIN: 1234.</div>
       <div id="pinE" class="small" style="color:var(--red);display:none;margin-top:6px">That PIN is not right. Try again.</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pinGo()">Sign</button>`);
    setTimeout(()=>{const i=$('pinIn');if(i)i.focus({preventScroll:true});},60);
  };
  window.pinGo=function(){
    const v=(($('pinIn')||{}).value||'').trim();
    if(v!==PIN){tries++;const e=$('pinE');if(e){e.style.display='block';e.textContent=tries>=3?'That PIN is not right. Ask the floor lead to reset it.':'That PIN is not right. Try again.';}const i=$('pinIn');if(i){i.value='';i.focus({preventScroll:true});}return;}
    const f=cb;cb=null;closeModal();if(typeof f==='function')f({by:signer(),at:atNow()});
  };

  /* ---------- restraint and observation level: psychiatrist only ---------- */
  const __rm=restraintModal;
  restraintModal=function(){
    if(!canDecide()){toast('Only the psychiatrist can authorise restraint');return;}
    return __rm.apply(this,arguments);
  };
  if(typeof window.psyObsReview==='function'){
    const __or=window.psyObsReview;
    window.psyObsReview=function(){if(!canDecide()){toast('Only the psychiatrist changes the observation level');return;}return __or.apply(this,arguments);};
  }
  function guard(){
    if(canDecide())return;
    document.querySelectorAll('#app select[onchange*="S.obs"]').forEach(s=>{
      s.disabled=true;s.title='Only the psychiatrist changes the observation level';
      const box=s.closest('.sbox');if(box&&!box.querySelector('.perm-n'))box.insertAdjacentHTML('beforeend','<div class="tiny muted perm-n">Only the psychiatrist changes this</div>');
    });
    document.querySelectorAll('#app button[onclick*="restraintModal"],#app button[onclick*="psyObsReview"]').forEach(b=>{b.replaceWith(Object.assign(document.createElement('span'),{className:'tiny muted perm-n',textContent:'Psychiatrist only'}));});
  }

  /* ---------- countersign: open the order, then PIN ---------- */
  const __cs=V3.countersign;
  V3.countersign=function(id){
    const o=(typeof v3==='function'?v3().orders:[]).find(x=>x.id===id);
    if(!o||!['lead','psychiatrist'].includes(S.role)||!canDecide()){toast('Only a consultant countersigns');return;}
    const g=o.given&&typeof o.given==='object'?(o.given.by||''):'';
    pinSign('Countersign order · '+V3.pn(o.pid),[
      ['Patient',V3.pn(o.pid)],['Order',o.text],['Type',o.type],
      ['Drug',o.drug],['Dose',o.dose],['Route',o.route],['Reason',o.reason||o.ind],
      ['Ordered by',o.by],['Through',o.via],['Given by',g]
    ],()=>__cs.call(V3,id),'Read the order, then sign it with your PIN.');
  };

  /* ---------- discharge summary, capacity assessment, history, e-sign forms ---------- */
  if(typeof flSignDo==='function'){
    const __fs=flSignDo;
    flSignDo=function(){const a=arguments,t=this;pinSign('Sign discharge summary · Dev Kumar',[['Patient','Dev Kumar'],['Signing as','Covering doctor for Dr. Rohan Mehta'],['Draft by','Priya Nair, psychologist']],()=>__fs.apply(t,a));};
  }
  /* the capacity assessment, the detailed history and the e-sign forms keep their own signing window; a PIN box is added to it and checked first */
  const pinField=()=>`<div class="pin-add"><label class="field" style="margin-top:12px"><span class="lbl">Your PIN</span><input class="input" id="pinIn" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="4 digits" style="max-width:160px;letter-spacing:.3em;font-size:18px"></label><div class="tiny muted">Signed as <b>${hesc(signer())}</b>. Name and time are recorded. Prototype PIN: 1234.</div><div id="pinE" class="small" style="color:var(--red);display:none;margin-top:6px">That PIN is not right. Try again.</div></div>`;
  const addPin=()=>setTimeout(()=>{const mb=document.querySelector('#modal .mb');if(mb&&!$('pinIn'))mb.insertAdjacentHTML('beforeend',pinField());},40);
  const pinOk=()=>{const i=$('pinIn');if(i&&i.value.trim()===PIN)return true;const e=$('pinE');if(e)e.style.display='block';if(i){i.value='';i.focus({preventScroll:true});}return false;};
  const withPin=(name,openToo)=>{
    const f=window[name];if(typeof f!=='function')return;
    window[name]=function(){if(openToo){const r=f.apply(this,arguments);addPin();return r;}if(!pinOk())return;return f.apply(this,arguments);};
  };
  withPin('psyCapSign',true);withPin('psyCapSignSave',false);
  withPin('psyHistSign',true);withPin('psyHistSignGo',false);
  withPin('psyEsignOpen',true);withPin('psyEsignSave',false);
  function pinButtons(){
    document.querySelectorAll('#app button[onclick^="S.discharged=true"]').forEach(b=>{
      b.setAttribute('onclick',"pinSign('Sign the discharge summary and discharge',[['Patient','this patient'],['Signing as',signer()]],()=>{S.discharged=true;go('#/existing/Care Management');toast('Discharged. Inpatient stay tab closed; summary moved to Care Management.')})");
    });
  }

  /* ---------- Log event: Logged by is the logged-in user ---------- */
  const __ev=eventModal;
  eventModal=function(){
    const r=__ev.apply(this,arguments);
    const s=$('evb');
    if(s){const i=document.createElement('input');i.className='input';i.id='evb';i.value=signer();i.readOnly=true;i.setAttribute('aria-label','Logged by');s.replaceWith(i);}
    return r;
  };

  /* ---------- assessments need a score ---------- */
  window.pgAsgDone=function(pid,i){
    const a=((psyPx(pid).assignedAssess)||[])[i];if(!a)return;
    const max=/PHQ-9/.test(a.name)?27:/GAD-7/.test(a.name)?21:null;
    V3.modal('Score · '+hesc(a.name.replace(/ \(.*\)/,'')),'An assessment cannot be marked done without its score.',
      `<label class="field"><span class="lbl">Total score${max?' (0 to '+max+')':''}</span><input class="input" id="asgScore" type="number" min="0" ${max?'max="'+max+'"':''} style="max-width:160px" placeholder="e.g. 12"></label>
       <div id="asgE" class="small" style="color:var(--red);display:none;margin-top:6px">Enter the score first</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pgAsgScoreSave('${pid}',${i},${max===null?'null':max})">Mark done</button>`);
  };
  window.pgAsgScoreSave=function(pid,i,max){
    const a=((psyPx(pid).assignedAssess)||[])[i];if(!a)return;
    const raw=(($('asgScore')||{}).value||'').trim(),n=Number(raw);
    if(raw===''||!isFinite(n)||n<0||(max!==null&&n>max)){const e=$('asgE');if(e){e.style.display='block';e.textContent=max!==null?'Enter a score from 0 to '+max:'Enter the score first';}return;}
    a.status='Done';a.score=n;a.doneBy=signer();a.doneAt=atNow();closeModal();render();toast(a.name.replace(/ \(.*\)/,'')+' done, score '+n+', by '+signer());
  };

  const css=document.createElement('style');css.id='perm-12nov-css';
  css.textContent='.pin-sum{display:flex;flex-direction:column;border:1px solid #e1e9f4;border-radius:12px;overflow:hidden}.pin-r{display:flex;justify-content:space-between;gap:16px;padding:9px 14px;border-top:1px solid #eef2f8;font-size:13.5px}.pin-r:first-child{border-top:0}.pin-r span{color:#667085}.pin-r b{text-align:right}';
  document.head.appendChild(css);

  const __r74=render;
  render=function(){const r=__r74.apply(this,arguments);try{guard();pinButtons();}catch(e){}return r;};
})();
