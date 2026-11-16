/* 16 Nov 2026: fixes from the meeting with Dr. Anu (psychiatrist login only; every change is gated on role = psychiatrist).
   1. Sidebar: "New admission" and "Registry" are not shown (New admission is the button on Today).
   2. Call family: the pop-up shows the family member and number, outcome and duration as one-tap options plus a free-text note.
      A concern is a separate, explicit step (it is no longer a tick box inside the call note). No answer does not tick the required call.
   3. Round note is compulsory. Any change made in a round (medicine, investigation, monitoring, risk, referral) needs a rationale; stopping a medicine asks why.
   4. Admission date: the psychiatrist can set the real admission date from the patient header (the old export has no stay dates).
   5. Larger text on the inpatient screens. */
(function(){
  const role=()=>String((window.__TULASI__||{}).role||'');
  if(role()!=='psychiatrist')return;
  const E=s=>hesc(String(s==null?'':s));

  /* 5. larger text, clear hierarchy */
  if(!document.getElementById('pm-css')){const c=document.createElement('style');c.id='pm-css';
    c.textContent='#view .small{font-size:14.5px!important}#view .tiny{font-size:13px!important}#view table td,#view table th{font-size:14.5px}#view .lbl{font-size:12.5px!important}#view .capsec strong,#view .hf .lbl{font-size:14px}#view textarea.input,#view select.input,#view input.input{font-size:15px}.pm-b{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}.pm-b .tog{font-size:14px}.pm-fam{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--soft);margin-bottom:10px}.pm-fam b{font-size:16px}.pm-fam a{font-weight:700}';
    document.head.appendChild(c);}

  /* 1. sidebar */
  function side(){const s=document.getElementById('side');if(!s)return;
    s.querySelectorAll('button,a,.sub').forEach(b=>{const t=(b.getAttribute('aria-label')||b.textContent||'').trim();if(/^(New admission|Registry|Patient registry)\b/i.test(t))b.remove();});}

  /* 2. Call family */
  const OUT=['Spoke to family','No answer','Asked to call later','Wrong number'],DUR=['Under 2 min','2 to 5 min','5 to 10 min','Over 10 min'];
  let FC=null;
  const __fa=window.faCall;
  window.faCall=function(pid,key){
    if(typeof __fa!=='function'||!window.__faApi)return typeof __fa==='function'?__fa.apply(this,arguments):undefined;
    let id={},p={};try{p=ptFind(pid)||{};id=ptIdentity(p)||{};}catch(e){}
    const name=id.nr||'Family member',rel=id.rel&&id.rel!=='Not recorded'?' ('+id.rel+')':'',ph=id.phone||'No number on file',tel=String(ph).replace(/[^\d+]/g,'');
    FC={pid,key,out:'',dur:''};
    const bub=(arr,k)=>`<div class="pm-b" id="pmB_${k}">${arr.map(v=>`<button type="button" class="tog" onclick="pmPick('${k}',this)">${E(v)}</button>`).join('')}</div>`;
    V3.modal('Call '+E((p.name||pid))+"'s family",'Logged in the HMS. Pick what happened and add a note.',
      `<div class="pm-fam"><div><div class="tiny muted">Family contact</div><b>${E(name)}${E(rel)}</b></div><div><div class="tiny muted">Mobile</div>${tel&&/\d{6}/.test(tel)?`<a href="tel:${E(tel)}">${E(ph)}</a>`:`<b>${E(ph)}</b>`}</div></div>
       <div class="small muted" style="margin-bottom:6px">Required: ${key==='c24'?'24 hour call':key==='c34'?'day 3 to 4 call':'family contact'}</div>
       <div class="field"><span class="lbl">How did it go?</span>${bub(OUT,'out')}</div>
       <div class="field"><span class="lbl">How long was the call?</span>${bub(DUR,'dur')}</div>
       <label class="field"><span class="lbl">What was said</span><textarea class="input" id="faN" rows="4" placeholder="In a few words"></textarea></label>
       <div class="small" style="margin-top:6px"><button type="button" class="lnk" style="margin:0" onclick="pmConc()">The family raised a concern? Log it separately</button></div>
       <label class="field" id="pmConcW" style="display:none"><span class="lbl">The concern, in their words (goes to the Patient Experience lead, 6 hour clock)</span><textarea class="input" id="pmConc" rows="3"></textarea></label>
       <div class="small" id="pmErr" style="color:var(--red);display:none;margin-top:6px"></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pmCallSave()">Save call</button>`);
  };
  window.pmPick=function(k,btn){if(!FC)return;const g=document.getElementById('pmB_'+k);if(g)g.querySelectorAll('.tog').forEach(b=>b.classList.toggle('on',b===btn));FC[k]=btn.textContent.trim();};
  window.pmConc=function(){const w=document.getElementById('pmConcW');if(w)w.style.display=w.style.display==='none'?'':'none';};
  window.pmCallSave=function(){
    if(!FC)return;const err=document.getElementById('pmErr'),bad=m=>{if(err){err.textContent=m;err.style.display='block';}};
    if(!FC.out)return bad('Pick how the call went.');
    const spoke=FC.out==='Spoke to family';if(spoke&&!FC.dur)return bad('Pick how long the call was.');
    const txt=((document.getElementById('faN')||{}).value||'').trim(),conc=((document.getElementById('pmConc')||{}).value||'').trim();
    if(spoke&&!txt)return bad('Write a short note of what was said.');
    const A=window.__faApi,f=A.famState(FC.pid),what=FC.key==='c24'?'24 hour call':FC.key==='c34'?'Day 3 to 4 call':'Family contact';
    const note=[FC.out,FC.dur,txt].filter(Boolean).join(' · ');
    f.log=f.log||[];f.log.unshift({what:spoke?what:what+' (attempt)',by:signer(),at:atNow(),note});
    if(spoke)f[FC.key]=signer()+' · '+atNow();
    if(conc)A.au().grv.push({id:'g'+Date.now(),pid:FC.pid,text:conc,by:signer(),at:A.nowMs(),ack:false});
    FC=null;closeModal();render();
    toast(conc?'Call saved. The concern is with the Patient Experience lead: they have 6 hours.':spoke?'Call saved and ticked':'Attempt saved. The call is still due.');
  };

  /* 3. round note compulsory, rationale for any change, stopping a medicine asks why */
  const __cr=confirmRound;
  confirmRound=function(){
    const R=S.rounds||{},note=(R.scribeNote||'').trim();
    const n=(typeof roundCount==='function')?roundCount():0;
    /* Dr. Anu (meeting audio): no round note is needed when an action is taken, because every action carries its own reason; with no action the note is required */
    if(!note&&n===0){toast('Write the round note, or make a change with its reason. Nothing was saved.');const t=document.querySelector('textarea[oninput*="scribeNote"]');if(t)t.focus();return;}
    if(n>0&&!R.__why){
      V3.modal('Why these changes?','Every change made in a round needs a reason. It is saved with the round note.',
        `<div class="small muted" style="margin-bottom:6px">${n} change${n===1?'':'s'} pending: medicine, investigation, monitoring, risk or referral.</div><label class="field"><span class="lbl">Rationale</span><textarea class="input" id="pmWhy" rows="4" placeholder="Why are these changes needed?"></textarea></label><div class="small" id="pmWhyE" style="color:var(--red);display:none">Write the reason to save the round.</div>`,
        `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pmWhySave()">Save round</button>`);
      return;
    }
    const r=__cr.apply(this,arguments);R.__why='';return r;
  };
  window.pmWhySave=function(){const w=((document.getElementById('pmWhy')||{}).value||'').trim();if(!w){const e=document.getElementById('pmWhyE');if(e)e.style.display='block';return;}
    const R=S.rounds;R.__why=w;R.scribeNote=((R.scribeNote||'').trim()?(R.scribeNote||'').trim()+'\n\n':'')+'Rationale for the changes: '+w;closeModal();
    try{__cr.call(window);}finally{R.__why='';}
    try{render();}catch(e){}};
  const __rm=rmAdd;
  rmAdd=function(act,text){
    if(act!=='Stop')return __rm.apply(this,arguments);
    window.__pmStopName=text;
    V3.modal('Stop '+E(text),'Say why. It is saved with the round.',
      `<label class="field"><span class="lbl">Reason</span><select class="input" id="pmStopW"><option>Dose change (new order follows)</option><option>Side effects</option><option>Not effective</option><option>Course complete</option><option>Patient or family refused</option><option>Other</option></select></label><label class="field"><span class="lbl">Note (optional)</span><input class="input" id="pmStopN" maxlength="120"></label>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pmStop()">Stop medicine</button>`);
  };
  window.pmStop=function(){const name=window.__pmStopName,w=(document.getElementById('pmStopW')||{}).value||'',n=((document.getElementById('pmStopN')||{}).value||'').trim();
    closeModal();__rm('Stop',name);const l=S.rounds.mc[S.rounds.mc.length-1];if(l&&l.text===name)l.why=w+(n?': '+n:'');};

  /* 4. admission date */
  window.pmAdmDate=async function(pid){
    let cur='';try{const r=await window.regRest('patients?id=eq.'+encodeURIComponent(pid)+'&select=admitted_at');cur=(r&&r[0]&&r[0].admitted_at||'').slice(0,10);}catch(e){}
    V3.modal('Admission date','Set the real date the patient was admitted. The day count, MHCA clock and family calls follow it.',
      `<label class="field"><span class="lbl">Admitted on</span><input class="input" type="date" id="pmAd" value="${E(cur)}" max="${new Date().toISOString().slice(0,10)}"></label><div class="small" id="pmAdE" style="color:var(--red);display:none"></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="pmAdSave('${E(pid)}')">Save date</button>`);
  };
  window.pmAdSave=async function(pid){const v=(document.getElementById('pmAd')||{}).value,e=document.getElementById('pmAdE');
    if(!v||v>new Date().toISOString().slice(0,10)){if(e){e.textContent='Pick a date that is not in the future.';e.style.display='block';}return;}
    try{await window.regRest('patients?id=eq.'+encodeURIComponent(pid),{method:'PATCH',body:{admitted_at:v},prefer:'return=minimal'});}catch(x){if(e){e.textContent='Could not save ('+x.message+').';e.style.display='block';}return;}
    try{const p=ptFind(pid),t=new Date();t.setHours(0,0,0,0);if(p)p.day=Math.max(0,Math.round((t-new Date(v+'T00:00:00'))/864e5));}catch(x){}
    closeModal();render();toast('Admission date saved');};
  function admBtn(){
    const m=(location.hash||'').match(/^#\/patient\/([^/]+)/);if(!m)return;let p=null;try{p=ptFind(decodeURIComponent(m[1]));}catch(e){}
    if(!p||!p.real)return;
    document.querySelectorAll('#view .dpcards > *').forEach(c=>{if(/^\s*admitted/i.test(c.innerText||'')&&!c.querySelector('.pm-ad')){const b=document.createElement('button');b.type='button';b.className='lnk pm-ad';b.style.margin='4px 0 0';b.textContent='Edit admission date';b.onclick=()=>pmAdmDate(p.id);c.appendChild(b);if(p.lastVisit){const d=document.createElement('div');d.className='tiny muted';d.textContent='Last visit in the old HMS: '+new Date(p.lastVisit+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});c.appendChild(d);}}});
  }

  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{side();admBtn();}catch(e){}return r;};
  try{side();}catch(e){}
})();
