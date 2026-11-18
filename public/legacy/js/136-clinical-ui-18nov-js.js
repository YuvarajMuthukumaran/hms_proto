/* 18 Nov 2026, Trello (Anu, 17 Nov), psychiatrist, psychologist and both floor leads only (other logins keep their screens):
   1. "All the drop downs should be type and search": every drop-down with 4 or more choices opens a small list with a search box (type to filter, arrows and Enter
      to pick). Shorter lists stay as they are. Choosing sets the real drop-down and fires its change event, so every screen keeps working.
   2. "no way to remove these plan tags": the Plan chips in Rounds get a x.
   3. "message caregiver": one pop-up (not two different ones) with a reason: schedule a call (time range), update about a significant event (call at once),
      family meeting with the treating team, family meeting with the patient, plan for an outing (time range and agenda), address a grievance (call at once).
   4. "No known allergies": one tap on the card, next to "Record allergies" (the tick box inside the pop-up is gone).
   5. "tick box and sentence can come in same line": a tick box or radio and its sentence stay on one line in every pop-up and form. */
(function(){
  const role=String((window.__TULASI__||{}).role||'');
  if(!/^(psychiatrist|psychologist|floor-lead-psychiatrist|floor-lead-psychologist)$/.test(role))return;
  const esc=s=>hesc(String(s==null?'':s));

  /* ---------- 5. alignment ---------- */
  const css=document.createElement('style');
  css.textContent=`label:has(> input[type=checkbox]),label:has(> input[type=radio]){display:flex;align-items:flex-start;gap:8px}
  label > input[type=checkbox],label > input[type=radio]{flex:none;width:auto!important;min-height:0!important;height:auto;margin:3px 0 0}
  .pr-chx{border:0;background:none;cursor:pointer;font:inherit;font-weight:700;color:#667085;padding:0 0 0 4px}.pr-chx:hover{color:#b42318}
  #ssPop{position:fixed;z-index:10050;background:#fff;border:1px solid var(--line,#d6dee8);border-radius:12px;box-shadow:0 14px 40px rgba(15,23,42,.2);padding:6px;display:flex;flex-direction:column;gap:6px;max-width:calc(100vw - 16px)}
  #ssPop input{width:100%;min-height:34px;box-sizing:border-box}
  #ssPop .ss-l{overflow:auto;max-height:260px;display:flex;flex-direction:column}
  #ssPop .ss-o{border:0;background:none;text-align:left;font:inherit;padding:7px 10px;border-radius:8px;cursor:pointer}
  #ssPop .ss-o:hover,#ssPop .ss-o.hi{background:var(--soft,#f2f6fb)}#ssPop .ss-o.cur{font-weight:700}
  #ssPop .ss-n{padding:8px 10px;color:#667085;font-size:13px}
  select.ss-on{cursor:pointer}`;
  document.head.appendChild(css);

  /* ---------- 1. searchable drop-downs ---------- */
  let cur=null;
  function closeSS(){const p=document.getElementById('ssPop');if(p)p.remove();cur=null;}
  function openSS(sel){
    closeSS();cur=sel;
    const opts=[...sel.options].map((o,i)=>({i,v:o.value,t:o.textContent.trim()}));
    const pop=document.createElement('div');pop.id='ssPop';pop.setAttribute('role','listbox');
    pop.innerHTML='<input class="input" type="text" placeholder="Type to search" aria-label="Search the list" autocomplete="off"><div class="ss-l"></div>';
    document.body.appendChild(pop);
    const r=sel.getBoundingClientRect(),z=parseFloat(getComputedStyle(document.body).zoom)||1;
    pop.style.minWidth=Math.max(200,r.width/z)+'px';
    const top=Math.min(r.bottom/z+4,innerHeight/z-pop.offsetHeight-8);
    pop.style.top=Math.max(8,top)+'px';pop.style.left=Math.max(8,Math.min(r.left/z,innerWidth/z-pop.offsetWidth-8))+'px';
    const q=pop.querySelector('input'),list=pop.querySelector('.ss-l');let hi=0,shown=[];
    const draw=()=>{
      const t=q.value.trim().toLowerCase();
      shown=opts.filter(o=>!t||o.t.toLowerCase().includes(t));
      if(hi>=shown.length)hi=Math.max(0,shown.length-1);
      list.innerHTML=shown.length?shown.map((o,k)=>`<button type="button" class="ss-o ${k===hi?'hi':''} ${o.i===sel.selectedIndex?'cur':''}" data-i="${o.i}">${esc(o.t||'(none)')}</button>`).join(''):'<div class="ss-n">Nothing matches</div>';
      const h=list.querySelector('.hi');if(h)h.scrollIntoView({block:'nearest'});
    };
    const pick=i=>{sel.selectedIndex=i;sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}));closeSS();try{sel.focus();}catch(e){}};
    q.addEventListener('input',()=>{hi=0;draw();});
    q.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){e.preventDefault();hi=Math.min(shown.length-1,hi+1);draw();}
      else if(e.key==='ArrowUp'){e.preventDefault();hi=Math.max(0,hi-1);draw();}
      else if(e.key==='Enter'){e.preventDefault();if(shown[hi])pick(shown[hi].i);}
      else if(e.key==='Escape'||e.key==='Tab'){closeSS();try{sel.focus();}catch(x){}}
    });
    list.addEventListener('mousedown',e=>{const b=e.target.closest('.ss-o');if(b){e.preventDefault();pick(+b.dataset.i);}});
    draw();q.focus();
  }
  const eligible=sel=>sel&&sel.tagName==='SELECT'&&!sel.disabled&&!sel.multiple&&sel.options.length>=4&&!sel.closest('[data-nosearch]');
  document.addEventListener('mousedown',e=>{
    const sel=e.target&&e.target.closest&&e.target.closest('select');
    if(sel&&eligible(sel)){e.preventDefault();openSS(sel);return;}
    if(cur&&!e.target.closest('#ssPop'))closeSS();
  },true);
  document.addEventListener('keydown',e=>{
    const sel=document.activeElement;
    if(sel&&sel.tagName==='SELECT'&&eligible(sel)&&(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'&&e.altKey)){e.preventDefault();openSS(sel);}
  },true);
  window.addEventListener('scroll',e=>{if(cur&&!(e.target&&e.target.closest&&e.target.closest('#ssPop')))closeSS();},true);
  const markSel=()=>document.querySelectorAll('select').forEach(s=>{if(eligible(s))s.classList.add('ss-on');});

  /* ---------- 2. plan tags ---------- */
  window.psyPlanDel=function(pid,i){const x=psyPx(pid);if(Array.isArray(x.plans)){x.plans.splice(i,1);render();toast('Plan tag removed');}};

  /* ---------- 3. one pop-up for the message to the caregiver ---------- */
  const REASONS=[
    ['call','Schedule a call','time','Please pick a time for a call with the treating team.'],
    ['event','Update about a significant event','now','We need to update you about something important. Please call us back as soon as you see this message.'],
    ['teamMeet','Schedule a family meeting (session with the treating team)','time+agenda','We would like to meet you with the treating team to talk about the plan for your family member.'],
    ['patMeet','Schedule a family meeting (session with the patient)','time+agenda','We would like to arrange a family meeting with your family member and the therapist.'],
    ['outing','Plan for an outing','time+agenda','We are planning an outing for your family member and would like to agree the plan with you.'],
    ['grievance','Address a grievance','now','Thank you for telling us about your concern. We would like to talk to you about it. Please call us back as soon as you see this message.']];
  const pidNow=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)/);return m?decodeURIComponent(m[1]):(S.pid||'');};
  const today=()=>new Date().toISOString().slice(0,10);
  window.cgOpen=function(){
    const pid=pidNow();let p=null;try{p=ptFind(pid);}catch(e){}
    const who=(()=>{try{const id=ptIdentity(p);return id.nr&&id.nr!=='Not recorded'?id.nr:'the caregiver';}catch(e){return 'the caregiver';}})();
    V3.modal('Message '+esc(who),p?esc(p.name):'',
      `<label class="field"><span class="lbl">Reason</span><select class="input" id="cgR" onchange="cgRender()"><option value="">Choose a reason…</option>${REASONS.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('')}</select></label>
       <div id="cgB"></div>
       <div class="callout grey small" style="margin-top:10px">Goes from Tulasi's WhatsApp number, not your personal phone, and is saved on the record. No clinical details in messages.</div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" id="cgGo" onclick="cgSend('${esc(pid)}')">Save message</button>`);
    cgRender();
  };
  window.cgRender=function(){
    const r=REASONS.find(x=>x[0]===($('cgR')||{}).value),b=$('cgB');if(!b)return;
    if(!r){b.innerHTML='<div class="small muted" style="margin-top:8px">Pick why you are writing. The right questions appear here.</div>';return;}
    const t=r[2],d=today();
    b.innerHTML=(t==='now'?`<div class="callout amber small" style="margin:8px 0">The family is asked to call back <b>immediately</b>.</div>`:
      `<div class="grid2" style="margin-top:8px"><label class="field"><span class="lbl">Date</span><input class="input" type="date" id="cgD" value="${d}" min="${d}"></label><div class="grid2"><label class="field"><span class="lbl">From</span><input class="input" type="time" id="cgF" value="12:00"></label><label class="field"><span class="lbl">To</span><input class="input" type="time" id="cgT" value="13:00"></label></div></div>`)
      +(t==='time+agenda'?`<label class="field"><span class="lbl">Agenda</span><textarea class="input" id="cgA" rows="2" placeholder="What will be talked about"></textarea></label>`:'')
      +`<label class="field"><span class="lbl">Message</span><textarea class="input" id="cgM" rows="3">${esc(r[3])}</textarea></label>`;
  };
  window.cgSend=function(pid){
    const r=REASONS.find(x=>x[0]===($('cgR')||{}).value);if(!r){toast('Pick a reason first');return;}
    const t=r[2];let when='';
    if(t!=='now'){const d=($('cgD')||{}).value,f=($('cgF')||{}).value,to=($('cgT')||{}).value;if(!d||!f||!to){toast('Give the date and the time range');return;}if(to<=f){toast('The end time must be after the start');return;}when=new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})+', '+f+' to '+to;}
    const ag=(($('cgA')||{}).value||'').trim();if(t==='time+agenda'&&!ag){toast('Write the agenda');return;}
    const msg=(($('cgM')||{}).value||'').trim();
    try{V3.log(pid,S.role,'family','Message to the family: '+r[1]+(when?' · '+when:' · call back at once')+(ag?' · agenda: '+ag:''));}catch(e){}
    closeModal();
    toast(window.__realMode?'Message saved on the record. Nothing was sent: WhatsApp is off for real patients.':'Message saved on the record and sent on WhatsApp.');
  };
  /* both old pop-ups (the header button and the list buttons) now open this one */
  window.schedMsg=function(){cgOpen();};
  try{schedMsg=window.schedMsg;}catch(e){}
  try{msgModal=function(){cgOpen();};}catch(e){}

  /* ---------- 4. No known allergies, one tap on the card ---------- */
  window.psyNkda=function(pid){const x=psyPx(pid);x.allergy={ndka:true,list:[],by:signer(),at:atNow()};render();toast('No known drug allergies recorded');};
  function nkda(){
    const v=document.getElementById('view');if(!v)return;
    v.querySelectorAll('button[onclick^="psyAllergy("]').forEach(b=>{
      if(b.dataset.nk)return;b.dataset.nk='1';
      const m=(b.getAttribute('onclick')||'').match(/psyAllergy\('([^']+)'\)/);if(!m)return;
      const has=(()=>{try{const a=psyPx(m[1]).allergy;return !!a;}catch(e){return false;}})();
      b.textContent=has?'Edit':'Record allergies';
      if(!has){const n=document.createElement('button');n.type='button';n.className='btn sm';n.style.marginLeft='6px';n.textContent='No known allergies';n.onclick=()=>psyNkda(m[1]);b.insertAdjacentElement('afterend',n);}
    });
    /* the pop-up lists allergies only; "no known allergies" is the button outside */
    const al=document.getElementById('al_n');if(al&&!al.dataset.nk){al.dataset.nk='1';const l=al.closest('label');if(l)l.remove();}
  }
  const __sv=window.psyAllergySave;
  window.psyAllergySave=function(pid){
    const list=[0,1,2].map(i=>(($('al_d'+i)||{}).value||'').trim()).filter(Boolean);
    if(!list.length){toast('Add at least one allergy, or close this and tap "No known allergies"');return;}
    return typeof __sv==='function'?__sv.apply(this,arguments):undefined;
  };
  /* the pop-up has no tick box now, so the original save must not read it */
  const __n=window.psyAllergySave;
  window.psyAllergySave=function(pid){if(!$('al_n')){const f=document.createElement('input');f.type='checkbox';f.id='al_n';f.hidden=true;f.checked=false;document.body.appendChild(f);try{return __n.apply(this,arguments);}finally{f.remove();}}return __n.apply(this,arguments);};

  const __r=render;
  render=function(){const o=__r.apply(this,arguments);try{nkda();markSel();}catch(e){}return o;};
  const mo=new MutationObserver(()=>{try{nkda();markSel();}catch(e){}});
  const start=()=>mo.observe(document.body,{childList:true,subtree:true});
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
