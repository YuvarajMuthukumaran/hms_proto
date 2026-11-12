/* 12 Nov 2026, Trello cards 92 and "Patient safety header" (QA by Nikita): one safety bar for the psychiatrist and the psychologist.
   - sticky on every patient screen (record, Rounds, notes), not only the overview
   - fixed order: name, age, room > legal status with days left > observation level (who set it, review by) > risk flags > allergies > NR with call button
   - no empty tags: nothing is shown for "no allergy", "not recorded" or "none"
   - colours: red only for risk, amber only for overdue or missing
   - the main button is "Round note" for the psychiatrist and "Session note" for the psychologist
   Prototype: the observation "set by" and "review by" are demo values. */
(function(){
  const role=()=>String((window.__TULASI__||{}).role||'');
  const kind=()=>{const r=role();if(S.role==='psychologist'||/psycholog/.test(r))return 'psychologist';if(S.role==='psychiatrist'&&!/patient-experience|rmo/.test(r))return 'psychiatrist';return '';};
  const pt=pid=>PTS.concat(typeof PTS_F!=='undefined'?PTS_F:[],typeof PTS_D!=='undefined'?PTS_D:[]).find(p=>p.id===pid);
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);if(m)return decodeURIComponent(m[1]);if(/^#\/(rounds|notes)/.test(location.hash||''))return S.focusPid||'';return '';};
  const esc=s=>hesc(String(s==null?'':s));
  function bar(pid){
    const p=pt(pid);if(!p)return '';const x=(window.psyPx&&psyPx(pid))||{},day=+p.day||0,sec=String(p.sec||'');
    const left=sec==='89'?Math.max(0,30-day):null;
    const legal=sec?`<span class="sh-c ${left!==null&&left<=5?'amber':''}">Section ${esc(sec)}${sec==='89'?' · day '+day+' of 30 · '+left+' days left':' · day '+day}</span>`:'';
    const obs=(typeof EX!=='undefined'&&(EX[pid]||[])[0])||'Routine';
    const doc=(typeof PSYOF!=='undefined'&&PSYOF[pid])||'the treating psychiatrist';
    const obsC=`<span class="sh-c" title="Set by ${esc(doc)} · review by today 6:00 pm">${esc(obs)}<span class="sh-s">set by ${esc(String(doc).replace(/^Dr\.\s*/,'Dr. '))} · review by 6 pm</span></span>`;
    const tags=(x.riskTags||[]).map(t=>`<span class="sh-c red">${esc(t)}</span>`).join('');
    const risk=(p.risk||tags)?`<span class="sh-c red">Risk of harm: High</span>${tags}`:'';
    const al=x.allergy&&x.allergy.list&&x.allergy.list.length?`<span class="sh-c">Allergy: ${x.allergy.list.map(a=>esc(a.drug)).join(', ')}</span>`:'';
    const sx=p.sex||'',ag=p.age||'';
    const btn=kind()==='psychologist'?`<button class="btn pri sh-b" onclick="shNote('${pid}')">Session note</button>`:`<button class="btn pri sh-b" onclick="shNote('${pid}')">Round note</button>`;
    return `<div class="sh-n"><b>${esc(p.name)}</b><span class="sh-s2">${ag?esc(ag)+(sx?'/'+esc(sx):''):''} ${esc(p.room||'')}</span></div>${legal}${obsC}${risk}${al}<button class="sh-c sh-nr" onclick="shCall('${pid}')">NR · Call</button><span style="flex:1"></span>${btn}`;
  }
  window.shNote=function(pid){S.pid=pid;if(kind()==='psychologist'){try{pgTherapyModal(pid);}catch(e){go('#/patient/'+pid+'/therapy');}}else{try{psyOpenRounds(pid);}catch(e){go('#/rounds');}}};
  window.shCall=function(pid){const b=[...document.querySelectorAll('#view button')].find(x=>/^Call caregiver$/.test(x.textContent.trim()));if(b)b.click();else toast('Calling the nominated representative through the HMS (demo)');};
  const css=document.createElement('style');css.id='sh-css';
  css.textContent=`#safeBar{position:sticky;top:var(--shTop,0px);z-index:40;display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#fff;border:1px solid var(--line,#e3eaf2);border-radius:12px;padding:8px 12px;margin:0 0 10px;box-shadow:0 4px 14px rgba(15,23,42,.06)}
  #safeBar .sh-n{display:flex;align-items:baseline;gap:8px;margin-right:6px}#safeBar .sh-n b{font-size:16px}#safeBar .sh-s2{font-size:12.5px;color:#667085}
  #safeBar .sh-c{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:650;border-radius:99px;padding:4px 11px;background:#f2f4f7;color:#344054;border:1px solid transparent}
  #safeBar .sh-c.amber{background:#fffaeb;color:#b54708;border-color:#fedf89}#safeBar .sh-c.red{background:#fef3f2;color:#b42318;border-color:#fecdca}
  #safeBar .sh-s{font-weight:500;color:#667085;font-size:11.5px}#safeBar .sh-nr{cursor:pointer;background:#fff;border-color:#d6dee8}#safeBar .sh-b{height:34px}
  #view .dph .sf{display:none}
  .lk{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 14px 10px;font-size:12.5px;color:#667085}.lk-a{flex-basis:100%;border-left:3px solid #1e6cdb;background:#f5f9ff;padding:6px 10px;border-radius:6px;color:#344054}
  .sh-n2{display:inline-block;min-width:26px;text-align:center;font-weight:800;border-radius:8px;padding:2px 6px;background:#f2f4f7}.sh-n2.amber{background:#fffaeb;color:#b54708}.sh-n2.red{background:#fef3f2;color:#b42318}`;
  document.head.appendChild(css);
  function paint(){
    const v=$('view'),k=kind();if(!v||!k)return;const pid=pidNow();
    const old=v.querySelector('#safeBar');
    if(!pid||!pt(pid)){if(old)old.remove();return;}
    if(!old||old.dataset.pid!==pid||old.dataset.k!==k+S.rmoFloor){if(old)old.remove();const el=document.createElement('div');el.id='safeBar';el.dataset.pid=pid;el.dataset.k=k+S.rmoFloor;el.innerHTML=bar(pid);
      const top=document.querySelector('.top');const tp=top&&getComputedStyle(top).position;document.documentElement.style.setProperty('--shTop',(tp==='sticky'||tp==='fixed')?(top.getBoundingClientRect().height)+'px':'0px');
      const root=v.querySelector('.ws-mid')||v;root.insertBefore(el,root.firstChild);}
    /* the old big primary button, and tags that say nothing */
    v.querySelectorAll('button').forEach(b=>{if(/^Call caregiver$/.test(b.textContent.trim())&&!b.dataset.sh){b.dataset.sh='1';b.textContent=k==='psychologist'?'Session note':'Round note';b.removeAttribute('onclick');b.onclick=()=>shNote(pid);}});
    v.querySelectorAll('.chip,.c,.tag,.pg-tag').forEach(c=>{if(/^(No known (drug )?allergies?|Allergies not recorded|Not recorded|None)$/i.test(c.textContent.trim()))c.remove();});
  }

  /* ---------------- Treatment Plan: Scores card, NEWS2 on the vitals table, order a scale (card "Rating scales and early warning") ---------------- */
  const SCALES=[['NEWS2','Early warning score from the vitals'],['C-SSRS screen','Suicide and self-harm screen'],['CIWA-Ar','Alcohol withdrawal (for Dr. Anu to confirm)'],['COWS','Opioid withdrawal (for Dr. Anu to confirm)']];
  const FREQ=['Every shift','Every 4 hours','Daily','At each re-assessment'];
  window.shScaleOrder=function(pid){
    V3.modal('Order a scale · '+esc((pt(pid)||{}).name),'The nurses see it on their board and record the score at each time.',
      `<label class="field"><span class="lbl">Scale</span><select class="input" id="soS">${SCALES.map(x=>`<option value="${x[0]}">${x[0]} · ${esc(x[1])}</option>`).join('')}</select></label><label class="field"><span class="lbl">How often</span><select class="input" id="soF">${FREQ.map(f=>`<option>${f}</option>`).join('')}</select></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="shScaleSave('${pid}')">Order</button>`);};
  window.shScaleSave=function(pid){const x=psyPx(pid);x.scaleOrders=x.scaleOrders||[];x.scaleOrders.unshift({scale:$('soS').value,freq:$('soF').value,by:signer(),at:atNow()});closeModal();render();toast($('soS')?'Scale ordered':'Scale ordered');};
  const rrDemo=(i)=>[16,18,16,20,17,16,19][i%7];
  function scoresPaint(v,pid){
    if(!/^#\/patient\/[^/]+\/orders/.test(location.hash||''))return;
    /* Scores card after the first "Vitals and monitoring" card */
    if(!v.querySelector('.sc-grid')&&window.psyScoresCard){
      const h=[...v.querySelectorAll('h3')].filter(x=>/^Vitals and monitoring/.test(x.textContent.trim()))[0],card=h&&h.closest('section.psy-tx-panel,section.card');
      if(card){const t=document.createElement('div');t.innerHTML=window.psyScoresCard(pid);const el=t.firstElementChild;if(el)card.parentNode.insertBefore(el,card.nextSibling);}}
    /* NEWS2 and resp. rate columns on the vitals table */
    const tb=[...v.querySelectorAll('table')].find(t=>/Pulse/.test(t.innerText)&&/Blood pressure/.test(t.innerText)&&!t.dataset.nw);
    if(tb&&window.psyNewsCalc){tb.dataset.nw='1';const hr=tb.querySelector('thead tr');if(hr){hr.insertAdjacentHTML('beforeend','<th>Resp. rate<br><span class="tiny muted">per min</span></th><th>NEWS2</th>');}
      [...tb.querySelectorAll('tbody tr')].forEach((tr,i)=>{const c=tr.children,bp=String(c[2]?c[2].textContent:'').match(/(\d+)\s*\/\s*(\d+)/),pulse=+String(c[3]?c[3].textContent:'').match(/\d+/),temp=+String(c[4]?c[4].textContent:'').match(/[\d.]+/),spo2=+String(c[5]?c[5].textContent:'').match(/\d+/);
        if(!bp||!pulse){tr.insertAdjacentHTML('beforeend','<td>—</td><td>—</td>');return;}
        const rr=rrDemo(i),n=psyNewsCalc({rr,spo2:spo2||98,o2:false,sbp:+bp[1],pulse,cons:'Alert',temp:temp>45?Math.round((temp-32)*5/9*10)/10:temp||36.8});
        tr.insertAdjacentHTML('beforeend',`<td>${rr}</td><td><span class="sh-n2 ${n.band==='Urgent RMO review'?'red':n.band==='Inform RMO'?'amber':''}" title="${esc(n.band)}">${n.total}</span></td>`);});}
    /* Order a scale button in the monitoring card */
    const mh=[...v.querySelectorAll('h3')].find(x=>/^Other monitoring/.test(x.textContent.trim())),mc=mh&&mh.closest('section.psy-tx-panel,section.card');
    if(mc&&!mc.querySelector('[data-sc]')){const hd=mc.querySelector('.hd,.psy-tx-head'),b=document.createElement('button');b.className='btn sm';b.dataset.sc='1';b.textContent='Order a scale';b.onclick=()=>shScaleOrder(pid);if(hd)hd.appendChild(b);}
    if(mc){const old=mc.querySelector('#scList');if(old)old.remove();const so=(psyPx(pid).scaleOrders||[]);if(so.length){const d=document.createElement('div');d.id='scList';d.className='pad small';d.innerHTML='<div class="lbl">Scales ordered</div>'+so.map(o=>`<div>${esc(o.scale)} · ${esc(o.freq)} <span class="tiny muted">· ${esc(o.by)}, ${esc(o.at)}</span></div>`).join('');mc.appendChild(d);}}
  }

  /* ---------------- signed notes are locked: only an addendum (card 93) ---------------- */
  window.lkAdd=function(pid,key){
    V3.modal('Add an addendum','The signed note stays as it was. Your addendum is added under it with your name, the date and the time.',`<textarea class="input" id="lkT" rows="4" placeholder="Addendum"></textarea>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="lkSave('${pid}','${key}')">Add addendum</button>`);};
  window.lkSave=function(pid,key){const t=(($('lkT')||{}).value||'').trim();if(!t){toast('Write the addendum first');return;}const x=psyPx(pid);x.addenda=x.addenda||{};(x.addenda[key]=x.addenda[key]||[]).push({t,by:signer(),at:atNow()});closeModal();render();toast('Addendum added by '+signer());};
  function lockPaint(v,pid){
    if(!/^#\/patient\/[^/]+\/daily/.test(location.hash||''))return;
    v.querySelectorAll('.nitem').forEach((it,i)=>{if(it.querySelector('.lk'))return;
      [...it.querySelectorAll('button')].forEach(b=>{if(/^(Edit|Delete|Change)/i.test(b.textContent.trim()))b.remove();});
      const key='dn-'+i,ad=(psyPx(pid).addenda||{})[key]||[],f=document.createElement('div');f.className='lk';
      f.innerHTML=`<span class="lk-t">Signed and locked. Only an addendum can be added.</span><button class="btn sm" onclick="lkAdd('${pid}','${key}')">Add addendum</button>${ad.map(a=>`<div class="lk-a"><b>Addendum</b> by ${esc(a.by)}, ${esc(a.at)}<div>${esc(a.t)}</div></div>`).join('')}`;it.appendChild(f);});
  }
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{paint();const v=$('view'),pid=pidNow();if(v&&pid&&kind()==='psychiatrist')scoresPaint(v,pid);if(v&&pid&&kind())lockPaint(v,pid);}catch(e){}return r;};
})();
