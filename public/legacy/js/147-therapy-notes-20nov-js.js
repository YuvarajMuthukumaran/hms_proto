/* 20 Nov 2026, meeting with Dr. Anu and Nikita (recording 20 Nov). Psychologist and floor lead psychologist: the session note.
   "Session note and therapy note are the same": one note, in Tulasi's own paper formats (documents/THERAPY NOTES.docx and
   documents/FAMILY COUNSELLING.docx), with tap-to-pick bubbles added where an answer has set choices. The questions are the paper ones.
   - Individual (THERAPY NOTES): aim of the intervention, duration, intervention, outcome, plan for next session; the psychologist's
     name and signature come from Sign and lock. The long frame (risk questions, check-in, goals, homework review, one block per therapy)
     is gone: it repeated the daily note. One optional "Risk noticed in this session" still alerts the psychiatrist.
   - Mood uses the same tags as the daily notes and Rounds (Calmer, Anxious, Irritable, Low, Elated), not a 0 to 10 scale.
   - ERP for OCD: the exposure ladder (hierarchy) is built first, most distressing at the top to least distressing at the bottom;
     an exposure can be logged only once the ladder has items.
   - Family (FAMILY COUNSELLING): name and relation of the visitor, planned or unplanned visit, agenda of the family visit (the
     sensitisation topics are bubbles), family's comments and viewpoints, comments of the psychologist, patient's requirements, next visit
     agenda or instructions, signature of the visitor. Different questions from the individual note.
   - Group: notes come from the Group sessions page (attendance and the group note), so the note offers that page instead of a form.
   Saved in the same place and shape as before (psyx.sn.notes, mod / mins / risk / blk), so Therapy Plans, Rounds, discharge and the
   floor lead screens keep working. Old notes still open with their old fields. */
(function(){
  const ROLE=String((window.__TULASI__||{}).role||'');
  /* 21 Nov 2026 (owner): the psychiatrist's session note form is the same as the psychologist's, for all three types */
  if(!/^(psychologist|floor-lead-psychologist|psychiatrist|floor-lead-psychiatrist)$/.test(ROLE))return;
  const WHO=/psychiatrist/.test(ROLE)?'psychiatrist':'psychologist';
  const E=s=>hesc(String(s==null?'':s));
  const A=s=>E(s).replace(/'/g,'&#39;');
  const J=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const $id=id=>document.getElementById(id);
  const px=pid=>psyPx(pid||S.pid);
  const sn=pid=>{const x=px(pid);if(!x.sn)x.sn={ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8};x.sn.ladder=x.sn.ladder||[];x.sn.notes=x.sn.notes||[];return x.sn;};
  const pat=pid=>{try{return ptFind(pid)||{name:pid};}catch(e){return {name:pid};}};
  const todayTxt=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}).toLowerCase();
  const MOODS=()=>{try{if(typeof PSY_F!=='undefined'&&PSY_F.mood&&PSY_F.mood.o)return PSY_F.mood.o.map(o=>o[0]);}catch(e){}return ['Calmer','Anxious','Irritable','Low','Elated'];};
  const AIMS=['Symptom relief','Insight into the illness','Coping skills','Emotional regulation','Motivation for treatment','Relapse prevention','Exposure for OCD','Rapport building'];
  const INTV=['CBT','ERP for OCD','Behavioural activation','DBT skills','ACT','Motivational interviewing','Relapse prevention','Psychoeducation / supportive','Relaxation training','Ventilation'];
  const DUR=[30,45,60,90];
  const RELS=['Father','Mother','Spouse','Son','Daughter','Brother','Sister','Guardian','Other relative'];
  const AGENDA=['What the illness is','How reassurance feeds it','Responding at home','Medicines','Relapse signs','Stigma','Caregiver self-care','Discharge plan','Progress update','Family conflict'];
  let D=null,PID='',KIND='ind',PAD=null;

  const css=document.createElement('style');css.id='m20-tn-css';
  css.textContent=
    '.tn-form{display:flex;flex-direction:column;gap:14px;max-height:68vh;overflow:auto;padding-right:6px}'+
    '.tn-q{border:1px solid #e1e9f4;border-radius:14px;background:#fff}'+
    '.tn-qh{padding:10px 14px;background:#f8fafd;border-bottom:1px solid #e8eef7;border-radius:14px 14px 0 0;font-weight:800;font-size:14.5px}'+
    '.tn-qh small{font-weight:500;color:#667085;font-size:12.5px;margin-left:6px}'+
    '.tn-qb{padding:12px 14px;display:flex;flex-direction:column;gap:10px}'+
    '.tn-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tn-g .field{margin:0}'+
    '.tn-ld{display:flex;flex-direction:column;gap:6px}.tn-li{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid #e1e9f4;border-radius:10px;font-size:13.5px;background:#fff;cursor:pointer;text-align:left;font:inherit}'+
    '.tn-li.on{border-color:#1e6cdb;background:#eef4ff}.tn-li .tn-rk{font-weight:800;color:#175cd3;min-width:22px}.tn-li .tn-tx{flex:1}.tn-li b{white-space:nowrap}'+
    '.tn-li .tn-x{border:0;background:none;color:#98a2b3;cursor:pointer;font-size:16px;padding:0 4px}'+
    '.tn-sig{width:100%;max-width:520px;height:110px;border:1px dashed #b9c7da;border-radius:10px;background:#fbfdff;touch-action:none;display:block}'+
    '.tn-grp{display:flex;flex-direction:column;gap:10px;align-items:flex-start}'+
    '@media(max-width:700px){.tn-g{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  /* ---------- bubbles ---------- */
  const one=(opts,cur,fn)=>`<div class="sn-chips">${opts.map(o=>`<button type="button" class="sn-c ${String(cur)===String(o)?'on':''}" onclick="${fn}('${A(J(o))}')">${E(o)}</button>`).join('')}</div>`;
  const many=(opts,cur,fn)=>{const a=cur||[];return `<div class="sn-chips">${opts.map(o=>`<button type="button" class="sn-c ${a.includes(o)?'on':''}" onclick="${fn}('${A(J(o))}')">${E(o)}</button>`).join('')}</div>`;};
  const ta=(k,ph,rows)=>`<textarea class="input" rows="${rows||2}" placeholder="${A(ph||'')}" oninput="tnS('${k}',this.value)">${E(D[k]||'')}</textarea>`;
  const q=(t,sub,h)=>`<section class="tn-q"><div class="tn-qh">${t}${sub?`<small>${sub}</small>`:''}</div><div class="tn-qb">${h}</div></section>`;

  window.tnS=(k,v)=>{D[k]=v;autoSum();};
  window.tnT=(k,v)=>{D[k]=D[k]===v?'':v;autoSum();draw();};
  /* 24 Nov (Nikita): risk level; Moderate or High also sets riskSeen 'yes' so older readers still see the risk */
  window.tnRisk=l=>{D.riskLvl=D.riskLvl===l?'':l;D.riskSeen=/Moderate|High/.test(D.riskLvl)?'yes':D.riskLvl?'no':'';autoSum();draw();};
  window.tnM=(k,v)=>{const a=D[k]||[];D[k]=a.includes(v)?a.filter(x=>x!==v):a.concat(v);autoSum();draw();};
  window.tnDur=v=>{D.mins=String(v);draw();};
  window.tnMod=v=>{D.mod=D.mod===v?'':v;D.blk=D.mod==='ERP for OCD'||D.mod==='Relapse prevention'?D.blk:{};autoSum();draw();};
  window.tnB=(k,v)=>{D.blk[k]=v;autoSum();};
  window.tnBT=(k,v)=>{D.blk[k]=D.blk[k]===v?'':v;autoSum();draw();};
  window.tnGoal=(i,v)=>{D.goalR=D.goalR||{};D.goalR[i]=D.goalR[i]===v?'':v;draw();};
  window.tnGoalSet=(i,v)=>{D.goalR=D.goalR||{};D.goalR[i]=v===''?'':+v;};
  window.tnKind=v=>{KIND={Individual:'ind',Family:'fam',Group:'grp'}[v]||'ind';D=fresh(KIND,null);draw();};
  window.tnSumTouch=v=>{D.summary=v;D.touched=true;};

  /* ---------- ERP ladder: most distressing at the top ---------- */
  const ladder=()=>sn(PID).ladder.slice().sort((a,b)=>(+b.suds||0)-(+a.suds||0));
  window.tnLadAdd=function(){
    const t=(($id('tnLt')||{}).value||'').trim(),n=+(($id('tnLn')||{}).value||'');
    if(!t){toast('Write the distressing thought or situation');return;}
    if(!(n>=0&&n<=100)){toast('Rate the distress 0 to 100');return;}
    sn(PID).ladder.push({id:'l'+Date.now(),text:t,suds:n,by:signer(),at:atNow()});draw();
  };
  window.tnLadDel=function(id,ev){if(ev)ev.stopPropagation();const s=sn(PID);s.ladder=s.ladder.filter(x=>x.id!==id);if(D.blk.item===id)D.blk.item='';draw();};
  window.tnLadPick=function(id){D.blk.item=D.blk.item===id?'':id;autoSum();draw();};
  function erpBlock(){
    const L=ladder(),b=D.blk;
    const rows=L.map((i,k)=>`<div class="tn-li ${b.item===i.id?'on':''}" role="button" tabindex="0" onclick="tnLadPick('${i.id}')"><span class="tn-rk">${k+1}</span><span class="tn-tx">${E(i.text)}</span><b>${E(i.suds)} / 100</b><button type="button" class="tn-x" title="Remove from the ladder" onclick="tnLadDel('${i.id}',event)">×</button></div>`).join('');
    const exp=L.length?`<div class="small muted">Tap the step done today.</div>
      <div class="tn-g"><label class="field"><span class="lbl">Distress at the start (0 to 100)</span><input class="input" type="number" min="0" max="100" value="${A(b.start||'')}" oninput="tnB('start',this.value)"></label>
      <label class="field"><span class="lbl">Peak distress</span><input class="input" type="number" min="0" max="100" value="${A(b.peak||'')}" oninput="tnB('peak',this.value)"></label>
      <label class="field"><span class="lbl">Distress at the end</span><input class="input" type="number" min="0" max="100" value="${A(b.end||'')}" oninput="tnB('end',this.value)"></label>
      <label class="field"><span class="lbl">Minutes of exposure</span><input class="input" type="number" min="0" value="${A(b.min||'')}" oninput="tnB('min',this.value)"></label></div>
      <div class="field"><span class="lbl">Response prevention held</span>${one(['Yes','Partly','No'],b.rp,"tnBT.bind(null,'rp')")}</div>`
      :'<div class="sn-alert" style="border-color:#f1d28a;background:#fffbf0;color:#8a5a00">Build the ladder first. Before exposure, list the distressing thoughts or situations and rate each one; the most distressing goes to the top.</div>';
    return `<div class="field"><span class="lbl">Exposure ladder (hierarchy) · most distressing at the top, least at the bottom</span><div class="tn-ld">${rows||'<div class="small muted">No steps yet.</div>'}</div>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><input class="input" id="tnLt" placeholder="Distressing thought or situation, e.g. touching the door handle" style="flex:1 1 240px"><input class="input" id="tnLn" type="number" min="0" max="100" placeholder="Distress 0 to 100" style="width:160px"><button type="button" class="btn sm" onclick="tnLadAdd()">Add to the ladder</button></div></div>${exp}`;
  }
  function rpBlock(){const b=D.blk,f=(k,l)=>`<label class="field"><span class="lbl">${l}</span><textarea class="input" rows="2" oninput="tnB('${k}',this.value)">${E(b[k]||'')}</textarea></label>`;
    return `<div class="tn-g">${f('trig','Triggers')}${f('ews','Early warning signs')}${f('cope','Coping plan')}${f('sup','Support contacts')}</div><div class="tiny muted">This becomes the relapse prevention plan in the discharge summary.</div>`;}

  /* ---------- the forms ---------- */
  function header(){
    const p=pat(PID),s=sn(PID),n=(s.notes||[]).filter(x=>(x.kind||'ind')===KIND).length+1;
    let id={};try{id=ptIdentity(p)||{};}catch(e){}
    return `<div class="sn-hd"><div><span>Name</span><b>${E(p.name)}</b></div><div><span>Date and time</span><b>${todayTxt()}, ${nowTime()}</b></div><div><span>${KIND==='fam'?'IP No':'Session'}</span><b>${KIND==='fam'?E(p.uhid||id.uhid||'-'):n+' of '+(s.planned||8)}</b></div><div><span>Psychologist</span><b>${E(signer())}</b></div></div>
      <div class="field"><span class="lbl">Type</span>${one(['Individual','Family','Group'],{ind:'Individual',fam:'Family',grp:'Group'}[KIND],'tnKind')}</div>`;
  }
  function indBody(){
    const blk=D.mod==='ERP for OCD'?erpBlock():D.mod==='Relapse prevention'?rpBlock():'';
    return q('Session','Filled in for you',header())
      +q('Aim of the intervention','',many(AIMS,D.aimT,"tnM.bind(null,'aimT')")+ta('aim','In your words (optional if a bubble says it)'))
      +q('Duration','',`<div class="row" style="gap:10px;flex-wrap:wrap;align-items:center"><div class="sn-chips">${DUR.map(m=>`<button type="button" class="sn-c ${String(D.mins)===String(m)?'on':''}" onclick="tnDur(${m})">${m} min</button>`).join('')}</div><input class="input" type="number" min="1" placeholder="Other" value="${A(D.mins||'')}" oninput="tnS('mins',this.value)" style="width:110px"><span class="small muted">minutes</span></div>`)
      +q('Intervention','',one(INTV,D.mod,'tnMod')+ta('intv','What was done in the session',3)+blk)
      +q('Outcome','',`<div class="tn-g"><div class="field"><span class="lbl">Mood (same tags as the daily note)</span>${one(MOODS(),D.moodT,"tnT.bind(null,'moodT')")}</div><div class="field"><span class="lbl">Engagement</span>${one(['Engaged','Partial','Withdrawn'],D.eng,"tnT.bind(null,'eng')")}</div></div>`
        +ta('outcome','How the patient responded, what changed',3)
        +`<div class="sn-yn"><span>Risk check <span class="tiny muted">(Moderate or High alerts the psychiatrist)</span></span><div class="sn-chips">${['No risk','Low','Moderate','High'].map(l=>`<button type="button" class="sn-c${/Mod|High/.test(l)?' bad':''} ${D.riskLvl===l?'on':''}" onclick="tnRisk('${l}')">${l}</button>`).join('')}</div></div>${D.riskLvl&&D.riskLvl!=='No risk'?ta('riskNote','What was said or seen'):''}`)
      +q('Goals','Rate each goal the way it was set up',window.goalNoteInputs?window.goalNoteInputs(sn(PID).goals||[],D.goalR,'tnGoal'):'')
      +q('Plan for next session','',ta('plan','What comes next')+`<!-- 23 Nov: no Homework field (21 Nov meeting); Plan for next session replaces it -->
        <div class="tn-g"><label class="field"><span class="lbl">Next session date</span><input class="input" type="date" value="${A(D.next||'')}" onchange="tnS('next',this.value)"></label><label class="field"><span class="lbl">Time</span><input class="input" type="time" value="${A(D.nextT||'10:00')}" onchange="tnS('nextT',this.value)"></label></div><div class="tiny muted">A next session date books it on the Calendar and caseload.</div>`)
      +q('One line for the psychiatrist','Shows on Rounds. Drafted from the note, edit it',`<textarea class="input" id="tnSum" rows="2" oninput="tnSumTouch(this.value)">${E(D.summary||'')}</textarea>`)
      +`<div class="small muted">Name and signature of the ${WHO}: added when you press Sign and lock.</div>`;
  }
  function famBody(){
    const b=D.blk;
    return q('Session','Filled in for you',header())
      +q('Visitor','',`<div class="tn-g"><label class="field"><span class="lbl">Name of the visitor</span><input class="input" value="${A(b.who||'')}" oninput="tnB('who',this.value)"></label><label class="field"><span class="lbl">Phone (optional)</span><input class="input" value="${A(b.phone||'')}" oninput="tnB('phone',this.value)"></label></div>
        <div class="field"><span class="lbl">Relation of the visitor</span>${one(RELS,b.rel,"tnBT.bind(null,'rel')")}</div>
        <div class="field"><span class="lbl">Planned visit / Unplanned visit</span>${one(['Planned visit','Unplanned visit'],b.visit,"tnBT.bind(null,'visit')")}</div>
        <div class="row" style="gap:10px;flex-wrap:wrap;align-items:center"><span class="lbl" style="margin:0">Duration</span><div class="sn-chips">${DUR.map(m=>`<button type="button" class="sn-c ${String(D.mins)===String(m)?'on':''}" onclick="tnDur(${m})">${m} min</button>`).join('')}</div><input class="input" type="number" min="1" placeholder="Other" value="${A(D.mins||'')}" oninput="tnS('mins',this.value)" style="width:110px"></div>`)
      +q('Agenda of the family visit','',many(AGENDA,b.topics,"tnFT")+`<textarea class="input" rows="2" placeholder="Anything else on the agenda" oninput="tnB('agenda',this.value)">${E(b.agenda||'')}</textarea>`)
      +q("Family's comments and viewpoints",'',`<textarea class="input" rows="3" oninput="tnB('fcom',this.value)">${E(b.fcom||'')}</textarea><label class="row small" style="gap:8px"><input type="checkbox" ${b.grv?'checked':''} onchange="tnB('grv',this.checked)"> The family raised a concern: send it to the Patient Experience team as a grievance</label>`)
      +q('Comments of the '+WHO,'',`<textarea class="input" rows="3" oninput="tnB('pcom',this.value)">${E(b.pcom||'')}</textarea>`)
      +q("Patient's requirements",'',`<textarea class="input" rows="2" oninput="tnB('req',this.value)">${E(b.req||'')}</textarea>`)
      +q('Next visit agenda or any instructions','',`<textarea class="input" rows="2" oninput="tnB('nextAg',this.value)">${E(b.nextAg||'')}</textarea><div class="tn-g"><label class="field"><span class="lbl">Next family session (optional)</span><input class="input" type="date" value="${A(D.next||'')}" onchange="tnS('next',this.value)"></label><label class="field"><span class="lbl">Time</span><input class="input" type="time" value="${A(D.nextT||'10:00')}" onchange="tnS('nextT',this.value)"></label></div>`)
      +q('Signature of the visitor','Optional. The '+WHO+' signs with Sign and lock',`<canvas class="tn-sig" id="tnSig" width="520" height="110"></canvas><div class="row" style="gap:8px"><button type="button" class="btn sm" onclick="tnSigClear()">Clear</button>${b.vsig?'<span class="tiny muted">Signed by the visitor</span>':''}</div>`)
      +q('One line for the psychiatrist','Shows on Rounds. Drafted from the note, edit it',`<textarea class="input" id="tnSum" rows="2" oninput="tnSumTouch(this.value)">${E(D.summary||'')}</textarea>`);
  }
  window.tnFT=v=>{const a=D.blk.topics||[];D.blk.topics=a.includes(v)?a.filter(x=>x!==v):a.concat(v);autoSum();draw();};
  function grpBody(){
    return q('Session','',header())+`<div class="tn-grp"><div class="small">Group notes come from the Group sessions page: pick the session, mark who attended and write the group note there. It shows in Therapy Plans &gt; Group for every patient who attended.</div><button class="btn pri" onclick="closeModal();go('#/groups')">Open Group sessions</button></div>`;
  }
  function body(){return KIND==='fam'?famBody():KIND==='grp'?grpBody():indBody();}

  /* visitor signature pad */
  window.tnSigClear=function(){D.blk.vsig='';const c=$id('tnSig');if(c)c.getContext('2d').clearRect(0,0,c.width,c.height);draw();};
  function pad(){
    const c=$id('tnSig');if(!c)return;const g=c.getContext('2d');g.lineWidth=2;g.lineCap='round';g.strokeStyle='#101828';
    if(D.blk.vsig){const im=new Image();im.onload=()=>g.drawImage(im,0,0,c.width,c.height);im.src=D.blk.vsig;}
    let on=false;const at=e=>{const r=c.getBoundingClientRect();return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];};
    c.onpointerdown=e=>{on=true;c.setPointerCapture&&c.setPointerCapture(e.pointerId);const [x,y]=at(e);g.beginPath();g.moveTo(x,y);};
    c.onpointermove=e=>{if(!on)return;const [x,y]=at(e);g.lineTo(x,y);g.stroke();};
    c.onpointerup=c.onpointerleave=()=>{if(!on)return;on=false;D.blk.vsig=c.toDataURL('image/png');};
  }

  function autoSum(){
    if(!D||D.touched)return;
    const bits=[];
    if(KIND==='fam'){const b=D.blk;bits.push('Family session'+(b.who?' with '+b.who+(b.rel?' ('+b.rel.toLowerCase()+')':''):''));if((b.topics||[]).length)bits.push('agenda: '+b.topics.join(', ').toLowerCase());if(b.pcom)bits.push(b.pcom);if(b.nextAg)bits.push('next: '+b.nextAg);}
    else{
      bits.push((D.mod||'Session')+(D.moodT?', mood '+D.moodT.toLowerCase():'')+(D.eng?', '+D.eng.toLowerCase():''));
      if(D.mod==='ERP for OCD'&&D.blk.item){const it=sn(PID).ladder.find(x=>x.id===D.blk.item);if(it)bits.push('exposure: '+it.text+(D.blk.peak?', peak distress '+D.blk.peak:''));}
      if(D.outcome)bits.push(D.outcome);
      bits.push(D.riskSeen==='yes'?'RISK NOTICED, see the note':'no risk noticed');
      if(D.plan)bits.push('next: '+D.plan);
    }
    D.summary=bits.filter(Boolean).join('; ').replace(/\s+/g,' ').trim()+'.';
    const el=$id('tnSum');if(el)el.value=D.summary;
  }
  function draw(){const f=$id('tnForm');if(!f)return;const top=f.scrollTop;autoSum();f.innerHTML=body();f.scrollTop=top;if(KIND==='fam')pad();
    const sv=document.querySelector('#modal .mf');if(sv)sv.querySelectorAll('[data-tn]').forEach(b=>{b.style.display=KIND==='grp'?'none':'';});}

  function fresh(kind,pre){
    pre=pre||{};
    const d={kind,goalR:{},mod:kind==='fam'?'Family therapy':kind==='grp'?'Group':'',lang:'English',mins:'',aimT:[],aim:'',intv:'',moodT:'',eng:'',outcome:'',riskSeen:'',riskNote:'',plan:'',hwNew:'',next:'',nextT:'10:00',blk:{},summary:pre.summary||'',touched:!!pre.summary};
    if(kind==='fam'){d.blk={who:pre.who||'',topics:[],visit:'',rel:''};if(pre.purpose)d.blk.agenda=String(pre.purpose);if(pre.outcome)d.blk.pcom=String(pre.outcome);}
    return d;
  }
  window.snOpen=function(pid,kind,pre){
    PID=pid||S.pid;KIND=kind==='fam'?'fam':kind==='grp'?'grp':'ind';
    D=fresh(KIND,pre);
    V3.modal('Session note · '+E(pat(PID).name),KIND==='fam'?'Family counselling, in the Tulasi format.':'Therapy note, in the Tulasi format.',`<div class="tn-form" id="tnForm"></div><div id="tnErr" class="small" style="color:var(--red);display:none;margin-top:8px"></div>`,
      `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn" data-tn="1" onclick="snSave()">Save draft</button><button class="btn pri" data-tn="1" onclick="snSign()">Sign and lock</button>`);
    const m=$id('modal');if(m)m.style.width='min(940px,100%)';
    draw();
  };
  function problem(){
    if(KIND==='grp')return 'Group notes are written on the Group sessions page.';
    if(!(+D.mins>=1))return 'Write the duration.';
    if(KIND==='fam'){const b=D.blk;
      if(!String(b.who||'').trim())return 'Write the name of the visitor.';
      if(!b.rel)return 'Pick the relation of the visitor.';
      if(!(b.topics||[]).length&&!String(b.agenda||'').trim())return 'Write the agenda of the family visit.';
      if(!String(b.pcom||'').trim())return 'Write the comments of the '+WHO+'.';
    }else{
      if(!(D.aimT||[]).length&&!String(D.aim||'').trim())return 'Write the aim of the intervention.';
      if(!D.mod&&!String(D.intv||'').trim())return 'Pick or write the intervention.';
      if(D.mod==='ERP for OCD'&&!sn(PID).ladder.length)return 'Build the exposure ladder first.';
      if(!D.moodT&&!String(D.outcome||'').trim())return 'Write the outcome (or pick the mood).';
    }
    if(!String(D.summary||'').trim())return 'The one line for the psychiatrist is empty.';
    return '';
  }
  const riskAny=()=>D.riskSeen==='yes';
  function persist(signed){
    const s=sn(PID);
    const aim=[(D.aimT||[]).join(', '),D.aim].filter(Boolean).join('. ');
    const risk=KIND==='fam'?{}:{seen:D.riskSeen||'no',level:D.riskLvl||''};
    const note=Object.assign({},D,{id:'n'+Date.now(),ts:Date.now(),fmt:'tulasi-20nov',status:signed?'signed':'draft',at:todayTxt()+', '+nowTime(),by:signer(),signedBy:signed?signer():'',signedAt:signed?atNow():'',kind:KIND,addenda:[],summaryLine:D.summary,risk,aimText:aim,mood:D.moodT||''});
    delete note.touched;
    if(!note.mod)note.mod=KIND==='fam'?'Family therapy':'Supportive session';
    s.notes.unshift(note);
    if(signed){
      try{psyTherapyPage();}catch(e){}
      const x=px(PID);
      if(x.th&&x.th.ind){
        if(KIND==='ind')x.th.ind.unshift({date:todayTxt(),by:signer(),modality:note.mod,mins:String(D.mins||''),note:['Aim: '+(aim||'-'),'Intervention: '+[D.mod,D.intv].filter(Boolean).join(' · '),'Outcome: '+[D.moodT&&'mood '+D.moodT.toLowerCase(),D.eng,D.outcome].filter(Boolean).join(', ')].join('. '),plan:(D.plan||'')+(D.hwNew?' · homework: '+D.hwNew:''),struct:true,kind:'ind'});
        else if(KIND==='fam'&&x.th.fam)x.th.fam.unshift({date:todayTxt(),who:(D.blk.who||'')+(D.blk.rel?' ('+D.blk.rel+')':''),by:signer(),topics:[].concat(D.blk.topics||[]).join(', ')+(D.blk.agenda?((D.blk.topics||[]).length?'; ':'')+D.blk.agenda:''),tlist:[].concat(D.blk.topics||[]),actions:D.blk.nextAg||''});
      }
      if(D.mod==='Relapse prevention'&&KIND==='ind')s.relapse={trig:D.blk.trig||'',ews:D.blk.ews||'',cope:D.blk.cope||'',sup:D.blk.sup||'',by:signer(),at:atNow()};
      if(D.next){S.pgc=S.pgc||{tab:'cal',flt:'all',wk:0,extra:[],cols:{}};S.pgc.extra=S.pgc.extra||[];const [h,m]=String(D.nextT||'10:00').split(':').map(Number);S.pgc.extra.push({id:'n'+Date.now(),date:D.next,h:Math.min(17,Math.max(9,h||10)),m:m||0,kind:KIND,pid:PID,label:(KIND==='fam'?'Family · ':'')+pat(PID).name});}
      if(KIND==='fam'&&D.blk.grv&&String(D.blk.fcom||'').trim()){try{S.pgriev=S.pgriev||[];S.pgriev.unshift({from:'Family',t:String(D.blk.fcom).slice(0,90),via:'Family session',own:'Patient experience team',st:'Open',sla:'6 h left',src:'family',cat:'Psychologist',...whoAt()});}catch(e){}}
      if(riskAny()){try{V3.alert({pid:PID,sev:'urgent',title:'Therapy session: '+(D.riskLvl||'risk')+' risk',detail:(D.riskNote||'See the session note')+'. Session note signed by '+signer()+'.',src:WHO==='psychiatrist'?'Psychiatrist':'Psychologist',by:signer()});}catch(e){}}
    }
    return note;
  }
  const err=t=>{const e=$id('tnErr');if(e){e.textContent=t;e.style.display=t?'block':'none';}};
  window.snSave=function(){if(KIND==='grp'){err('Group notes are written on the Group sessions page.');return;}persist(false);closeModal();render();toast('Draft saved. It is not signed yet.');};
  window.snSign=function(){
    const pr=problem();if(pr){err(pr);return;}
    const go=()=>{persist(true);render();toast('Session note signed and locked by '+signer()+(riskAny()?'. The psychiatrist has been alerted.':'.'));};
    if(typeof pinSign==='function'){const saved=D,k=KIND,pid=PID;pinSign('Sign session note · '+pat(pid).name,[['Type',k==='fam'?'Family counselling':'Individual therapy'],['Intervention',k==='fam'?(D.blk.topics||[]).join(', ')||D.blk.agenda||'':D.mod||D.intv],['Summary',D.summary]],()=>{D=saved;KIND=k;PID=pid;go();},'Once signed, the note is locked. Only an addendum can be added.');}
    else go();
  };

  /* reading a note: the new formats, and the old frame for older notes */
  window.snView=function(id){
    const n=(sn(S.pid).notes||[]).find(x=>x.id===id);if(!n)return;
    let rows;
    if(n.fmt==='tulasi-20nov'&&n.kind==='fam'){const b=n.blk||{};rows=[['Date and time',n.at],['Name of the visitor',b.who],['Relation of the visitor',b.rel],['Phone',b.phone],['Visit',b.visit],['Duration',n.mins?n.mins+' min':''],['Agenda of the family visit',[(b.topics||[]).join(', '),b.agenda].filter(Boolean).join('. ')],["Family's comments and viewpoints",b.fcom],['Comments of the psychologist',b.pcom],["Patient's requirements",b.req],['Next visit agenda or instructions',b.nextAg],['Summary',n.summaryLine]];}
    else if(n.fmt==='tulasi-20nov'){const b=n.blk||{},it=b.item?(sn(S.pid).ladder.find(x=>x.id===b.item)||{}).text:'';
      rows=[['Date and time',n.at],['Aim of the intervention',n.aimText],['Duration',n.mins?n.mins+' min':''],['Intervention',[n.mod,n.intv].filter(Boolean).join(' · ')],['Exposure step',it?it+' (start '+(b.start||'-')+', peak '+(b.peak||'-')+', end '+(b.end||'-')+')':''],['Outcome',[n.mood&&'Mood: '+n.mood,n.eng&&'Engagement: '+n.eng,n.outcome].filter(Boolean).join('. ')],['Risk noticed',n.riskSeen==='yes'?'YES · '+(n.riskNote||''):'No'],['Plan for next session',n.plan],['Homework',n.hwNew],['Summary',n.summaryLine]];}
    else rows=[['Date',n.at],['Therapy',n.mod],['Mood',n.mood!==null&&n.mood!==''&&n.mood!==undefined?n.mood+'/10':''],['Engagement',n.eng],['Compared with last',n.vs],['Risk check',Object.values(n.risk||{}).some(v=>v==='yes')?'RAISED':'None raised'],['Homework',n.hwRev],['New homework',n.hwNew],['Plan',n.plan],['Summary',n.summaryLine||n.summary]];
    rows=rows.filter(r=>r[1]);
    const vs=n.kind==='fam'&&n.blk&&n.blk.vsig?`<div class="box small" style="margin-top:10px"><div class="lbl">Signature of the visitor</div><img alt="Signature of the visitor" src="${A(n.blk.vsig)}" style="max-width:260px;height:auto;display:block;margin-top:6px"></div>`:'';
    V3.modal('Session note · '+E(pat(S.pid).name),n.status==='signed'?'Signed and locked':'Draft',
      `${n.status==='signed'?`<div class="sn-lock">Signed by ${E(n.signedBy)}, ${E(n.signedAt)}. Locked: only an addendum can be added.</div>`:''}
       <div class="pin-sum" style="margin-top:10px">${rows.map(r=>`<div class="pin-r"><span>${E(r[0])}</span><b>${E(r[1])}</b></div>`).join('')}</div>${vs}
       ${(n.addenda||[]).map(a=>`<div class="sn-add"><b>Addendum</b> by ${E(a.by)}, ${E(a.at)}<br>${E(a.text)}</div>`).join('')}
       ${n.status==='signed'?`<label class="field" style="margin-top:12px"><span class="lbl">Add an addendum</span><textarea class="input" id="snAdd" rows="2" placeholder="What was missed or changed. The note above is not edited."></textarea></label>`:''}`,
      `<button class="btn" onclick="closeModal()">Close</button>${n.status==='signed'?`<button class="btn pri" onclick="snAddSave('${id}')">Add addendum</button>`:''}`);
  };
})();
