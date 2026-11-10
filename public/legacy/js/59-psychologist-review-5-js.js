/* 10 Nov 2026, team meeting with Anu and Nikita's messages: third batch.
   Psychologist:
   1. Daily notes page: "WhatsApp updates to families" and "Written earlier today" are one box.
   2. Family WhatsApp message: only softened lines (sleep, meals, activities, family contact) and the therapy brief. Bladder, bowel, behaviour, events and risk never go.
      "See message" and "Send on WhatsApp" both open a required preview with Edit and Send. Sending is blocked when nobody is approved in Patient Experience
      ("Clinical updates go to"). The repeated-text warning stays.
   3. Patients page: the next-due column shows psychologist items (daily note, management plan, detailed history, therapy session); Mine / Whole ward switch, default Mine.
   4. Individual session ticked in a daily note adds a draft in Therapy Plans (group sessions already did).
   Psychologist and psychiatrist:
   5. Alert types (Critical, Clinical event, Medication, Investigation, MHCA, Overdue review, Admission, Documentation, Family) on the psychiatrist dashboard Type column
      and on each due item of the psychologist's Today table.
   6. Discharge as numbered steps: 1 Checklist, 2 Discharge summary, 3 Review and sign. The psychologist sees it read only.
   7. "Clinical updates go to" and "Do not share information with" in Patient Experience are saved fields (psychologist and psychiatrist; both edit the same data).
   Every screen change is gated by S.role. */
(function(){
  const me=()=>S.role==='psychologist';
  const doc=()=>S.role==='psychiatrist';
  const tpl=h=>{const t=document.createElement('template');t.innerHTML=h;return t;};
  const px=()=>psyPx(S.pid);
  const nm=pid=>{const p=ptFind(pid);return p?p.name:'';};
  const fmtToday=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});

  const css=document.createElement('style');css.id='psychologist-review-5-css';
  css.textContent=`
  .pg-wsep{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:14px 20px 8px;margin-top:6px;border-top:1px solid var(--line)}
  .pg-wsep h3{margin:0;font-size:16px}
  .pg-cat{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.03em;border-radius:99px;padding:1px 8px;margin-right:6px;vertical-align:1px;border:1px solid transparent}
  .pg-cat.red{background:#fef3f2;color:#b42318;border-color:#fecdca}
  .pg-cat.amber{background:#fffaeb;color:#b54708;border-color:#fedf89}
  .pg-cat.grey{background:#f2f4f7;color:#475467;border-color:#e4e7ec}
  .pg-due{display:flex;flex-direction:column;gap:4px;font-size:13px}
  .pg-mine{display:inline-flex;gap:4px;padding:4px;margin:0 0 12px;background:#f2f4f7;border-radius:12px}
  .pg-mine button{border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:#475467;padding:7px 16px;border-radius:9px;cursor:pointer}
  .pg-mine button.on{background:#fff;color:#175cd3;box-shadow:0 1px 2px rgba(16,24,40,.12)}
  .pg-wa-pv{white-space:pre-wrap;font-size:14.5px;line-height:1.5;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;max-height:46vh;overflow:auto}
  .pg-wa-box{border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:13.5px;margin-bottom:10px;background:#f8fafc}
  .pg-wa-box.bad{background:#fef3f2;border-color:#fecdca;color:#b42318}
  .pg-steps{display:flex!important;flex-direction:column;gap:14px}
  .pg-steps>section{width:100%!important;max-width:none!important;flex:none!important}
  .pg-stepn{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#175cd3;color:#fff;font-size:13px;font-weight:700;margin-right:10px;vertical-align:2px}
  `;
  document.head.appendChild(css);

  /* ---------- 5. Alert types ---------- */
  const CAT=[
    ['Critical','red',/critical|escalat|seizure|self-?harm|abscond|chok|emergency|suicid/i],
    ['Clinical event','amber',/vital|fever|withdrawal|\bfall\b|aggress|behaviour|incident|\bevent\b/i],
    ['Medication','amber',/countersign|refus|\bSOS\b|\bPRN\b|adverse|medicine|medication|\border\b|\bdose/i],
    ['Investigation','amber',/\blab\b|\becg\b|result|investigation/i],
    ['MHCA','amber',/capacity|form e|consent|section 8|section 9|mhca/i],
    ['Overdue review','amber',/overdue|not assessed|not reviewed/i],
    ['Admission','grey',/admission|work-?up|add psychologist|24-?hour/i],
    ['Documentation','grey',/note|history|plan|summary|re-?assess|draft|document|sign/i],
    ['Family','grey',/family|call|visit/i]];
  const catOf=t=>{const s=String(t||'');return CAT.find(c=>c[2].test(s))||null;};
  window.pgCatOf=catOf;
  const catTag=c=>`<span class="pg-cat ${c[1]}">${c[0]}</span>`;

  /* ---------- 4. psychologist Today: type tag on each due item ---------- */
  const __md=ROLE.psychologist.myday;
  ROLE.psychologist.myday=function(){
    const h=__md.apply(this,arguments);
    if(!me()||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content;
      R.querySelectorAll('tr[data-dt] .pd-d').forEach(d=>{
        const s=d.querySelector('span');if(!s||d.querySelector('.pg-cat'))return;
        const c=catOf(s.textContent)||CAT[7];s.insertAdjacentHTML('afterbegin',catTag(c));
      });
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* ---------- 3. Patients page ---------- */
  window.pgPatScope=function(s){S.pgPatScope=s;render();};
  const dueItems=p=>{
    const L=[];
    try{if(!((S.eod||{})[p.id]||{}).saved)L.push(['Daily note','today',catOf('note')]);}catch(e){}
    try{const m=(psyPx(p.id).mgmtPsych||{});if(!m.signed)L.push(['Management plan',p.day>7?'overdue':'this week',catOf('plan')]);}catch(e){}
    try{const hs=(ptCtxOf(p.id)||{}).historyStatus;if(hs!=='signed')L.push(['Detailed history',hs==='overdue'?'overdue':'within 72 h',catOf('history')]);}catch(e){}
    try{const ind=((psyPx(p.id).th||{}).ind)||[];if(!ind.some(r=>r.date===fmtToday()))L.push(['Therapy session','not logged today',['Documentation','grey']]);}catch(e){}
    return L;
  };
  ROLE.psychologist.ipdPage=function(o,base){
    if(!o||o.scr!=='ipd'||!me())return base(o);
    const mine=PSY_EOD().map(p=>p.id),sc=S.pgPatScope==='ward'?'ward':'mine';
    const list=sc==='mine'?o.list.filter(p=>mine.includes(p.id)):o.list;
    const sw=`<div class="pg-mine" role="tablist" aria-label="Which patients"><button role="tab" aria-selected="${sc==='mine'}" class="${sc==='mine'?'on':''}" onclick="pgPatScope('mine')">Mine</button><button role="tab" aria-selected="${sc==='ward'}" class="${sc==='ward'?'on':''}" onclick="pgPatScope('ward')">Whole ward</button></div>`;
    const o2=Object.assign({},o,{list,total:list.length,mh:'Next due',title:sc==='mine'?'My inpatients':'Whole ward',filters:sw+(o.filters||''),
      c6:p=>{const L=dueItems(p);return L.length?`<div class="pg-due">${L.map(i=>`<div>${catTag(i[2]||['Documentation','grey'])}${hesc(i[0])} <span class="tiny muted">· ${hesc(i[1])}</span></div>`).join('')}</div>`:'<span class="tiny muted">Nothing due</span>';}});
    return base(o2);
  };

  /* ---------- 2. Family WhatsApp message ---------- */
  const FC=()=>S.famCons=S.famCons||{};
  const consOf=pid=>{
    const c=FC()[pid];if(c)return c;
    let f=null;try{f=PT_FAMILY[pid];}catch(e){}
    return {to:f?f[0]+' ('+String(f[1]).toLowerCase()+') only':'',not:''};
  };
  window.pgConsSet=function(pid,k,v){FC()[pid]=Object.assign({},consOf(pid),{[k]:v});};
  const SOFT={
    sleep:{'Over 7 h':'Slept well','6 to 7 h':'Slept well','4 to 6 h':'Slept a little less than usual','Under 4 h':'Had a restless night','Disturbed':'Had a restless night'},
    meals:{'All meals':'Ate all the meals','Partial':'Ate part of the meals','Skipped one or more':'Ate a little less today','Refused food':'Needed some encouragement with meals'},
    part:{'Active':'Took part in the activities','Attended, quiet':'Joined the activities quietly','Refused':'Rested today and skipped the activities'}};
  const famLines=(kind,id)=>{
    const g=k=>psyGet(kind,id,k),L=[];
    const s=SOFT.sleep[g('sleep')];if(s)L.push('Sleep: '+s);
    const m=SOFT.meals[g('meals')];if(m)L.push('Meals: '+m);
    const a=SOFT.part[g('part')],ss=[].concat(g('sessions')||[]).filter(Boolean);
    if(a||ss.length)L.push('Activities: '+[a,ss.length?'Sessions today: '+ss.join(', '):''].filter(Boolean).join('. '));
    const f=[].concat(g('fam')||[]).filter(x=>x&&x!=='None today');
    if(f.length)L.push('Family contact: '+f.join(' and ').toLowerCase()+' today');
    return L;
  };
  const famBrief=(kind,id)=>{const b=String(psyGet(kind,id,'brief')||'').trim();return b||(kind==='dn'&&typeof famUpdate==='function'?famUpdate():'');};
  const famText=(kind,id)=>{
    const p=allPts().find(x=>x.id===id)||{name:id,uhid:'',day:''};
    const L=['*TULASI HEALTHCARE – DAILY PATIENT PROGRESS UPDATE*','',`Patient: ${p.name} · UHID ${p.uhid}${p.day!==''?' · Day '+p.day:''}`,`Date: ${waDate()}`,`Reported by: ${waWho('Psychologist')}`,''];
    const lines=famLines(kind,id),b=famBrief(kind,id);
    if(lines.length){L.push('*Today*');lines.forEach(x=>L.push('• '+x));L.push('');}
    if(b)L.push('*Brief update:*',b,'');
    L.push(WA_CONF[0],WA_CONF[1]);
    return L.join('\n');
  };
  const hasShareable=(kind,id)=>famLines(kind,id).length>0||!!famBrief(kind,id);
  const __wt=waDText;
  waDText=function(kind,id){
    if(!me())return __wt.apply(this,arguments);
    const e=(S.waEdit||{})[kind+':'+id];
    return e!=null?e:famText(kind,id);
  };
  const __send=psySaveSend;
  window.pgWaPreview=function(kind,id,editing){
    const c=consOf(id),ok=!!String(c.to||'').trim(),sh=hasShareable(kind,id),w=waDWarn(kind,id);
    const txt=waDText(kind,id);
    const block=!ok?'Nobody is approved to get clinical updates for this patient. Add the person in Patient Experience (Clinical updates go to) first.':!sh?'There is nothing to share with the family yet. Fill in sleep, meals, activities, family contact or the therapy brief.':'';
    const body=`${ok?`<div class="pg-wa-box"><b>Goes to the family group.</b> Approved: ${hesc(c.to)}${c.not?`<br>Do not share with: ${hesc(c.not)}`:''}</div>`:''}
      ${block?`<div class="pg-wa-box bad">${hesc(block)}</div>`:''}${w?`<div class="pg-wa-box bad">${hesc(w)}</div>`:''}
      ${editing?`<textarea class="input" id="pgWaTx" rows="12" style="width:100%">${hesc(txt)}</textarea>`:`<div class="pg-wa-pv">${waFmt(txt)}</div>`}
      <div class="tiny muted" style="margin-top:8px">Bladder, bowel, behaviour, events and risk are never sent to the family.</div>`;
    const foot=editing
      ?`<button class="btn" onclick="pgWaEditCancel('${kind}','${id}')">Cancel edit</button><button class="btn" onclick="pgWaReset('${kind}','${id}')">Reset to original</button><button class="btn pri" onclick="pgWaEditSave('${kind}','${id}')">Save changes</button>`
      :`<button class="btn" onclick="closeModal()">Close</button><button class="btn" onclick="pgWaPreview('${kind}','${id}',true)">Edit</button><button class="btn pri" ${block?'disabled':''} onclick="pgWaSend('${kind}','${id}')">Send on WhatsApp</button>`;
    V3.modal('Message to the family · '+hesc(nm(id)),'Read it before it goes. You can edit it.',body,foot);
  };
  window.pgWaEditSave=function(kind,id){const v=(($('pgWaTx')||{}).value||'');(S.waEdit=S.waEdit||{})[kind+':'+id]=v;pgWaPreview(kind,id,false);};
  window.pgWaEditCancel=function(kind,id){pgWaPreview(kind,id,false);};
  window.pgWaReset=function(kind,id){if(S.waEdit)delete S.waEdit[kind+':'+id];pgWaPreview(kind,id,false);};
  window.pgWaSend=function(kind,id){
    const c=consOf(id);if(!String(c.to||'').trim()||!hasShareable(kind,id)){toast('Not sent: see the red note in the preview');return;}
    closeModal();return __send(kind,id,null);
  };
  psySaveSend=function(kind,id,btn){
    if(!me())return __send.apply(this,arguments);
    if(!psyHasAny(kind,id)){return __send.apply(this,arguments);} /* keeps the original "nothing filled in" message */
    return pgWaPreview(kind,id,false);
  };

  /* ---------- 4b. individual session ticked in a daily note: draft in Therapy Plans ---------- */
  const __sv=psySave;
  psySave=function(kind,id){
    const before=!!((S.eod||{})[id]||{}).saved,r=__sv.apply(this,arguments);
    try{
      if(me()&&kind!=='dn'&&!before&&((S.eod||{})[id]||{}).saved&&/Individual session/.test(String(psyGet(kind,id,'sessions')))){
        const keep=S.pid;S.pid=id;
        try{psyTherapyPage();const x=px();if(x.th&&x.th.ind)x.th.ind.unshift({date:fmtToday(),by:signer(),modality:'Individual session (draft)',mins:'',note:'Draft from the daily note. Add the progress note.',plan:''});}finally{S.pid=keep;}
        toast('Individual session added as a draft in Therapy Plans. Add the details there.');
      }
    }catch(e){}
    return r;
  };

  /* ---------- 6. Discharge: numbered steps ---------- */
  const __dc=pDischarge;
  pDischarge=function(){
    const h=__dc.apply(this,arguments);
    if((!me()&&!doc())||typeof h!=='string')return h;
    try{
      const T=tpl(h),R=T.content,split=R.querySelector('.split');if(!split)return h;
      const sum=split.querySelector('section.card.wide'),chk=split.querySelector('section.card.narrow');if(!sum||!chk)return h;
      const labels=[...chk.querySelectorAll('label.check')],idx=labels.findIndex(l=>/Summary reviewed/.test(l.textContent));if(idx<0)return h;
      const post=labels.slice(idx).map(l=>l.textContent);
      const s1=chk.cloneNode(true),s3=chk.cloneNode(true);
      const l1=[...s1.querySelectorAll('label.check')],l3=[...s3.querySelectorAll('label.check')];
      l1.slice(idx).forEach(l=>l.remove());
      const pad1=s1.querySelector('.pad'),lastPre=l1[idx-1];
      if(pad1&&lastPre){let n=lastPre.nextSibling;while(n){const nx=n.nextSibling;n.remove();n=nx;}}
      l3.slice(0,idx).forEach(l=>l.remove());
      const dt=s3.querySelector('label.field');if(dt&&/Discharge type/.test(dt.textContent))dt.remove();
      s3.querySelectorAll('.callout.amber').forEach(c=>{if(/Self discharge/.test(c.textContent))c.remove();});
      const num=(s,n,t)=>{const hd=s.querySelector('h3');if(hd)hd.innerHTML=`<span class="pg-stepn">${n}</span>${t}`;};
      num(s1,1,'Discharge checklist');num(sum,2,'Discharge summary');num(s3,3,'Review, confirm and sign');
      split.innerHTML='';split.classList.add('pg-steps');split.append(s1,sum,s3);
      if(me()){
        split.querySelectorAll('input,select,textarea,button').forEach(x=>{x.disabled=true;});
        split.insertAdjacentHTML('afterbegin','<div class="callout grey small">Read only. The psychiatrist completes the discharge checklist, writes and signs the summary.</div>');
      }
      return T.innerHTML;
    }catch(e){return h;}
  };

  /* ---------- after the page is drawn ---------- */
  const mergeWa=v=>{
    const strip=v.querySelector('#waStrip');
    const wr=[...v.querySelectorAll('section.card')].find(s=>s!==strip&&/^Written earlier today/.test(((s.querySelector('h3')||{}).textContent||'').trim()));
    if(!strip||!wr||strip.dataset.pgm)return;
    strip.dataset.pgm='1';
    const hd=wr.querySelector('.hd'),sub=hd?(hd.querySelector('.small,.muted')||{textContent:''}).textContent:'';
    const sep=document.createElement('div');sep.className='pg-wsep';sep.innerHTML=`<h3>Written earlier today</h3><span class="small muted">${hesc(sub)}</span>`;
    strip.appendChild(sep);
    [...wr.children].filter(c=>c!==hd).forEach(c=>strip.appendChild(c));
    wr.remove();
  };
  const seeMsg=v=>{
    v.querySelectorAll('#waStrip button[onclick*="S.waOpen"]').forEach(b=>{
      const m=(b.getAttribute('onclick')||'').match(/S\.waOpen==='([^']+)'/);if(m)b.setAttribute('onclick',`pgWaPreview('eod','${m[1]}',false)`);
    });
  };
  const bindPrefs=v=>{
    [['Clinical updates go to','to'],['Do not share information with','not']].forEach(([lab,k])=>{
      const l=[...v.querySelectorAll('label.field')].find(x=>((x.querySelector('.lbl')||{}).textContent||'').trim()===lab);
      if(!l||l.dataset.pg)return;l.dataset.pg='1';
      const i=l.querySelector('input');if(!i)return;
      i.value=consOf(S.pid)[k]||'';i.setAttribute('oninput',`pgConsSet('${S.pid}','${k}',this.value)`);
    });
  };
  /* the read-only layout of the same page shows the saved values */
  const bindPrefsRead=v=>{
    [['Clinical updates go to','to'],['Do not share information with','not']].forEach(([lab,k])=>{
      v.querySelectorAll('.pxs-row').forEach(r=>{
        const dt=r.querySelector('dt'),dd=r.querySelector('dd');
        if(dt&&dd&&dt.textContent.trim()===lab&&!dd.dataset.pg){dd.dataset.pg='1';const val=String(consOf(S.pid)[k]||'').trim();dd.textContent=val||'Not set';}
      });
    });
  };
  const typeCol=v=>{
    v.querySelectorAll('.pd-t tr[data-dt]').forEach(tr=>{
      const ty=tr.querySelector('.pd-ty');if(!ty||ty.dataset.pg)return;ty.dataset.pg='1';
      if(/^Done$/i.test(ty.textContent.trim()))return;
      const texts=[...tr.querySelectorAll('.pd-d span')].map(s=>s.textContent);
      const hit=CAT.find(c=>texts.some(t=>c[2].test(t)));
      if(hit){ty.textContent=hit[0];ty.classList.remove('red','amber','blue');if(hit[1]!=='grey')ty.classList.add(hit[1]);}
    });
  };
  const __r=render;
  render=function(){
    const out=__r.apply(this,arguments);
    try{
      const v=$('view');
      if(v){
        if(me()){mergeWa(v);seeMsg(v);}
        if(me()||doc()||S.role==='rmo'){bindPrefs(v);bindPrefsRead(v);} /* the RMO fills this page too; same saved field, nothing else changes for them */
        if(doc())typeCol(v);
      }
    }catch(e){}
    return out;
  };
})();
