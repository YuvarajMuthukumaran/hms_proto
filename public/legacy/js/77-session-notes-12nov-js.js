/* 12 Nov 2026, Trello card 101: Psychologist session notes: one common frame + a block for the therapy type.
   Psychologist: Individual, Group and Family Add (Therapy Plans) opens the structured note. Psychiatrist: the Rounds screen shows the one-line summary.
   - Common frame: header (auto), risk check (mandatory, any yes = short C-SSRS, alert to the psychiatrist and a suggested observation level),
     check-in, therapy block, goals (0 to 10), homework, plan and next session date (books the calendar), one-line summary (auto-drafted, editable), sign = locked, addendum only.
   - Blocks: CBT thought record, ERP (ladder carried forward), behavioural activation, DBT skills, motivational interviewing, relapse prevention,
     psychoeducation or supportive, family session, group, ACT. Modality list now includes ERP, DBT, ACT, family therapy, relapse prevention.
   Prototype: the AI scribe can still fill the summary from the recording through the existing Start session flow. Demo data only. */
(function(){
  const pgy=()=>S.role==='psychologist';
  const doc=()=>S.role==='psychiatrist';
  const px=pid=>psyPx(pid||S.pid);
  const sn=pid=>{const x=px(pid);if(!x.sn)x.sn={ladder:[],notes:[],goals:null,relapse:null,ybocs:'',planned:8};return x.sn;};
  const pat=pid=>{try{return ptFind(pid)||PTS.find(p=>p.id===pid)||{name:pid};}catch(e){return {name:pid};}};
  const todayTxt=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const nowTime=()=>new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}).toLowerCase();
  const esc=s=>hesc(String(s==null?'':s));

  const MODS=['CBT','ERP for OCD','Behavioural activation','DBT skills','ACT','Motivational interviewing','Relapse prevention','Psychoeducation / supportive','Family therapy','Group'];
  const N100='n100',N10='n10',N5='n5';
  const BLK={
    'CBT':[['technique','Technique used','multi',['Cognitive restructuring','Behavioural experiment','Problem solving','Activity scheduling']],['sit','Situation','a'],['aut','Automatic thought','a'],['emo','Emotion','t'],['int','Intensity of the emotion %',N100],['for','Evidence for the thought','a'],['against','Evidence against the thought','a'],['bal','Balanced thought','a'],['re','Belief re-rated after %',N100]],
    'ERP for OCD':'erp',
    'Behavioural activation':[['acts','Activities done, with mastery and pleasure 0 to 10 for each (one per line)','a'],['next','Next week\'s activities','a']],
    'DBT skills':[['mod','Module','chips',['Mindfulness','Distress tolerance','Emotion regulation','Interpersonal effectiveness']],['skill','Skill taught','t'],['urges','Diary card: urges this week 0 to 5',N5],['acts','Diary card: actions this week','a']],
    'ACT':[['values','Values talked about','a'],['defuse','Defusion or acceptance exercise','a'],['will','Willingness to act on values 0 to 10',N10]],
    'Motivational interviewing':[['stage','Stage of change','chips',['Precontemplation','Contemplation','Preparation','Action','Maintenance']],['imp','Importance 0 to 10',N10],['conf','Confidence 0 to 10',N10],['trig','Triggers','a'],['ct','Change talk heard','a']],
    'Relapse prevention':[['trig','Triggers','a'],['ews','Early warning signs','a'],['cope','Coping plan','a'],['sup','Support contacts','a']],
    'Psychoeducation / supportive':[['topic','Topic','multi',['Illness','Medicines','Sleep','Warning signs','Coping','Stress']],['und','Understood (teach-back)','yn3']],
    'Family therapy':[['who','Who attended','t'],['purpose','Purpose','multi',['Education','Conflict','Discharge planning']],['topics','Topics covered','multi',['What the illness is','How reassurance feeds it','Responding at home','Medicines','Relapse signs','Stigma','Caregiver self-care','Discharge plan']],['und','Understood (teach-back)','yn3'],['conc','Family concerns','a'],['act','Agreed actions','a'],['own','Owner of the actions','t'],['grv','Raise a grievance','check']],
    'Group':[['gt','Group type','chips',['Anxiety and stress group','Relapse prevention group','Social skills group','Yoga and relaxation','Psychoeducation group']],['ros','Attendance','roster'],['gn','Group note','a'],['pp','One line for this patient','t']]
  };
  const DEFMOD={ind:'CBT',grp:'Group',fam:'Family therapy'};
  let D=null,PID='',KIND='ind',LAST=null;

  const css=document.createElement('style');css.id='sn-12nov-css';
  css.textContent=`
  .sn-form{display:flex;flex-direction:column;gap:14px;max-height:68vh;overflow:auto;padding-right:6px}
  .sn-sec{border:1px solid #e1e9f4;border-radius:14px;background:#fff}
  .sn-sh{display:flex;align-items:center;gap:10px;padding:11px 14px;background:#f8fafd;border-bottom:1px solid #e8eef7;border-radius:14px 14px 0 0;font-weight:800;font-size:14.5px}
  .sn-sh small{font-weight:500;color:#667085;font-size:12.5px}
  .sn-sb{padding:12px 14px;display:flex;flex-direction:column;gap:10px}
  .sn-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sn-hd{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;font-size:13px}.sn-hd div{background:#f5f8fc;border-radius:10px;padding:8px 10px}.sn-hd span{display:block;font-size:11.5px;color:#667085}
  .sn-chips{display:flex;flex-wrap:wrap;gap:6px}
  .sn-c{border:1px solid #d0d5dd;background:#fff;border-radius:99px;padding:6px 13px;font:inherit;font-size:13px;font-weight:650;cursor:pointer;min-height:34px;transition:background .12s,border-color .12s}
  .sn-c:hover{border-color:#9ec0f7;background:#eef4ff}.sn-c.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}.sn-c.bad.on{background:#d9453d;border-color:#d9453d}
  .sn-c.num{min-width:36px;padding:6px 8px;text-align:center}
  .sn-yn{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px solid #eef2f8;font-size:14px}.sn-yn:first-child{border-top:0}
  .sn-alert{border:1.5px solid #f3a6a1;background:#fff3f2;border-radius:12px;padding:10px 12px;color:#912018;font-size:13.5px}
  .sn-lad{display:flex;flex-direction:column;gap:6px}.sn-li{display:flex;justify-content:space-between;gap:10px;padding:7px 10px;border:1px solid #e1e9f4;border-radius:10px;font-size:13.5px}
  .sn-li.on{border-color:#1e6cdb;background:#eef4ff}.sn-li b{white-space:nowrap}
  .sn-lock{background:#ecfdf3;border:1px solid #abefc6;border-radius:12px;padding:9px 12px;color:#067647;font-size:13.5px;font-weight:600}
  .sn-note{border:1px solid #e1e9f4;border-radius:12px;padding:10px 12px;margin-top:8px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
  .sn-add{border-left:3px solid #d48806;padding:6px 10px;margin-top:6px;background:#fffaf0;font-size:13px}
  .pr-sn{font-size:12.5px;color:#475467;margin-top:3px}
  @media(max-width:700px){.sn-g,.sn-hd{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  /* ---------------- state helpers ---------------- */
  const defGoals=pid=>{const s=sn(pid);if(!s.goals)s.goals=[{t:'Sleep at least 6 hours a night'},{t:'Take part in one group activity a day'},{t:'Talk about worries with the therapist'}];return s.goals;};
  window.snS=(k,v)=>{D[k]=v;if(k==='mins'||k==='plan'||k==='hwNew')autoSum();};
  window.snB=(k,v)=>{D.blk[k]=v;autoSum();};
  window.snR=(k,v)=>{D.risk[k]=v;draw();};
  window.snQ=(k,v)=>{D.cs[k]=v;draw();};
  window.snT=(k,v,redraw)=>{D[k]=D[k]===v?'':v;if(redraw)draw();else draw();};
  window.snBT=(k,v)=>{D.blk[k]=D.blk[k]===v?'':v;autoSum();draw();};
  window.snBM=(k,v)=>{const a=D.blk[k]||[];D.blk[k]=a.includes(v)?a.filter(x=>x!==v):a.concat(v);draw();};
  window.snGoal=(i,v)=>{D.goalR[i]=D.goalR[i]===v?'':v;draw();};
  window.snMod=v=>{D.mod=v;D.blk={};draw();};
  window.snRos=id=>{const a=D.blk.ros||[];D.blk.ros=a.includes(id)?a.filter(x=>x!==id):a.concat(id);draw();};
  window.snLadAdd=()=>{const t=(($('snLt')||{}).value||'').trim(),n=+(($('snLn')||{}).value||0);if(!t)return;const s=sn(PID);s.ladder.push({id:'l'+Date.now(),text:t,suds:isFinite(n)?n:0});draw();};
  window.snLadPick=id=>{D.blk.item=D.blk.item===id?'':id;draw();};
  window.snSumTouch=v=>{D.summary=v;D.touched=true;};

  function riskAny(){return Object.values(D.risk).some(v=>v==='yes');}
  function cssLevel(){
    const q=D.cs,yes=k=>q[k]==='yes';
    if(yes('plan')||yes('intent'))return ['high','1:1 constant'];
    if(yes('method'))return ['moderate','Every 15 minutes'];
    if(yes('think')||yes('wish'))return ['low','Every 30 minutes'];
    return ['none','Routine'];
  }
  function autoSum(){
    if(D.touched)return;
    const p=pat(PID),bits=[];
    bits.push(D.mod+(D.mood!==null&&D.mood!==''?', mood '+D.mood+'/10':'')+(D.eng?', '+D.eng.toLowerCase():'')+(D.vs?', '+D.vs.toLowerCase()+' than last time':''));
    const b=D.blk;
    if(D.mod==='ERP for OCD'&&b.item){const it=sn(PID).ladder.find(x=>x.id===b.item);if(it)bits.push('exposure: '+it.text+(b.peak?', peak distress '+b.peak:'')+(b.rp?', response prevention '+b.rp.toLowerCase():''));}
    if(D.mod==='CBT'&&b.bal)bits.push('balanced thought: '+b.bal);
    if(b.pp)bits.push(b.pp);
    bits.push(riskAny()?'RISK RAISED, see the risk check':'no risk raised');
    if(D.hwNew)bits.push('homework: '+D.hwNew);
    if(D.plan)bits.push('next: '+D.plan);
    D.summary=bits.join('; ')+'.';
    const el=$('snSum');if(el)el.value=D.summary;
  }

  /* ---------------- render ---------------- */
  const chips=(opts,cur,fn,cls)=>`<div class="sn-chips">${opts.map(o=>`<button type="button" class="sn-c ${cls||''} ${cur===o?'on':''}" onclick="${fn}('${esc(o).replace(/'/g,"\\'")}')">${esc(o)}</button>`).join('')}</div>`;
  const nums=(max,cur,fn)=>`<div class="sn-chips">${Array.from({length:max+1},(_,i)=>`<button type="button" class="sn-c num ${String(cur)===String(i)?'on':''}" onclick="${fn}(${i})">${i}</button>`).join('')}</div>`;
  const yn=(label,key,cur)=>`<div class="sn-yn"><span>${label}</span><div class="sn-chips"><button type="button" class="sn-c bad ${cur==='yes'?'on':''}" onclick="snR('${key}','yes')">Yes</button><button type="button" class="sn-c ${cur==='no'?'on':''}" onclick="snR('${key}','no')">No</button></div></div>`;
  function blockField(f){
    const [k,l,t,o]=f,v=D.blk[k];
    if(t==='t')return `<label class="field"><span class="lbl">${l}</span><input class="input" value="${esc(v||'')}" oninput="snB('${k}',this.value)"></label>`;
    if(t==='a')return `<label class="field"><span class="lbl">${l}</span><textarea class="input" rows="2" oninput="snB('${k}',this.value)">${esc(v||'')}</textarea></label>`;
    if(t===N100)return `<label class="field"><span class="lbl">${l}</span><input class="input" type="number" min="0" max="100" value="${esc(v||'')}" oninput="snB('${k}',this.value)" style="max-width:140px"></label>`;
    if(t===N10)return `<div class="field"><span class="lbl">${l}</span>${nums(10,v,`(x=>snBT('${k}',x))`)}</div>`;
    if(t===N5)return `<div class="field"><span class="lbl">${l}</span>${nums(5,v,`(x=>snBT('${k}',x))`)}</div>`;
    if(t==='chips')return `<div class="field"><span class="lbl">${l}</span>${chips(o,v,`snBT.bind(null,'${k}')`)}</div>`;
    if(t==='multi'){const a=v||[];return `<div class="field"><span class="lbl">${l}</span><div class="sn-chips">${o.map(x=>`<button type="button" class="sn-c ${a.includes(x)?'on':''}" onclick="snBM('${k}','${esc(x).replace(/'/g,"\\'")}')">${esc(x)}</button>`).join('')}</div></div>`;}
    if(t==='yn3')return `<div class="field"><span class="lbl">${l}</span>${chips(['Yes','Partly','No'],v,`snBT.bind(null,'${k}')`)}</div>`;
    if(t==='check')return `<label class="row small" style="gap:8px"><input type="checkbox" ${v?'checked':''} onchange="D_snChk('${k}',this.checked)"> ${l} (goes to the patient experience team)</label>`;
    if(t==='roster'){const a=v||[];return `<div class="field"><span class="lbl">${l}</span><div class="sn-chips">${PTS.map(p=>`<button type="button" class="sn-c ${a.includes(p.id)?'on':''}" onclick="snRos('${p.id}')">${esc(p.name)}</button>`).join('')}</div></div>`;}
    return '';
  }
  window.D_snChk=(k,v)=>{D.blk[k]=v;};
  function erpBlock(){
    const s=sn(PID),b=D.blk,lad=s.ladder;
    const yb=s.ybocs?Math.round((Date.now()-new Date(s.ybocs).getTime())/86400000):null;
    return `${yb===null||yb>=14?`<div class="sn-alert" style="border-color:#f1d28a;background:#fffbf0;color:#8a5a00">Y-BOCS is due${yb===null?' (none recorded yet)':' (last one '+yb+' days ago)'}. Do it this session.</div>`:''}
      <div class="field"><span class="lbl">Exposure ladder (set once, carried forward to every session)</span><div class="sn-lad">${lad.length?lad.map(i=>`<button type="button" class="sn-li ${b.item===i.id?'on':''}" onclick="snLadPick('${i.id}')"><span>${esc(i.text)}</span><b>${i.suds} / 100</b></button>`).join(''):'<div class="small muted">No ladder yet. Add the first item below.</div>'}</div>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><input class="input" id="snLt" placeholder="Feared situation, e.g. touch the door handle" style="flex:1 1 220px"><input class="input" id="snLn" type="number" min="0" max="100" placeholder="Distress 0 to 100" style="width:150px"><button type="button" class="btn sm" onclick="snLadAdd()">Add to ladder</button></div></div>
      <div class="small muted">Tap an item above to say it was done today.</div>
      <div class="sn-g"><label class="field"><span class="lbl">Distress at the start (0 to 100)</span><input class="input" type="number" min="0" max="100" value="${esc(b.start||'')}" oninput="snB('start',this.value)"></label>
      <label class="field"><span class="lbl">Peak distress</span><input class="input" type="number" min="0" max="100" value="${esc(b.peak||'')}" oninput="snB('peak',this.value)"></label>
      <label class="field"><span class="lbl">Distress at the end</span><input class="input" type="number" min="0" max="100" value="${esc(b.end||'')}" oninput="snB('end',this.value)"></label>
      <label class="field"><span class="lbl">Minutes of exposure</span><input class="input" type="number" min="0" value="${esc(b.min||'')}" oninput="snB('min',this.value)"></label></div>
      <div class="field"><span class="lbl">Response prevention held</span>${chips(['Yes','Partly','No'],b.rp,`snBT.bind(null,'rp')`)}</div>
      <label class="field"><span class="lbl">Y-BOCS score today (every 2 weeks)</span><input class="input" type="number" min="0" max="40" value="${esc(b.yb||'')}" oninput="snB('yb',this.value)" style="max-width:140px"></label>`;
  }
  function body(){
    const p=pat(PID),s=sn(PID),n=(s.notes||[]).length+1,goals=defGoals(PID);
    const hdr=`<div class="sn-hd"><div><span>Patient</span><b>${esc(p.name)}</b></div><div><span>Date and time</span><b>${todayTxt()}, ${nowTime()}</b></div><div><span>Therapist</span><b>${esc(signer())}</b></div><div><span>Session</span><b>${n} of ${s.planned||8}</b></div></div>
      <div class="sn-g"><div class="field"><span class="lbl">Type</span>${chips(['Individual','Group','Family'],{ind:'Individual',grp:'Group',fam:'Family'}[KIND],'snKind')}</div>
      <div class="sn-g"><label class="field"><span class="lbl">Minutes</span><input class="input" type="number" min="1" value="${esc(D.mins||'')}" oninput="snS('mins',this.value)"></label>
      <label class="field"><span class="lbl">Language</span><select class="input" onchange="snS('lang',this.value)">${['English','Hindi','Bengali','Punjabi','Other'].map(x=>`<option ${D.lang===x?'selected':''}>${x}</option>`).join('')}</select></label></div></div>`;
    const css1=riskAny()?`<div class="sn-alert"><b>Short C-SSRS</b> (answer all five)</div>${[['wish','Wished to be dead or not wake up?'],['think','Had thoughts of ending their life?'],['method','Thought about how?'],['intent','Had any intention of acting on it?'],['plan','Started or made a plan?']].map(q=>`<div class="sn-yn"><span>${q[1]}</span><div class="sn-chips"><button type="button" class="sn-c bad ${D.cs[q[0]]==='yes'?'on':''}" onclick="snQ('${q[0]}','yes')">Yes</button><button type="button" class="sn-c ${D.cs[q[0]]==='no'?'on':''}" onclick="snQ('${q[0]}','no')">No</button></div></div>`).join('')}
      <div class="sn-alert">Level: <b>${cssLevel()[0]}</b>. Suggested observation: <b>${cssLevel()[1]}</b>. The psychiatrist is alerted when you sign.</div>`:'';
    const risk=`${yn('Thoughts of harming themselves since the last session?','self',D.risk.self)}${yn('Thoughts of harming others?','others',D.risk.others)}${yn('Feels unsafe on the ward?','unsafe',D.risk.unsafe)}${css1}`;
    const checkin=`<div class="field"><span class="lbl">Mood today (patient rated 0 to 10)</span>${nums(10,D.mood,'snMood')}</div><div class="sn-g"><div class="field"><span class="lbl">Engagement</span>${chips(['Engaged','Partial','Withdrawn'],D.eng,'snEng')}</div><div class="field"><span class="lbl">Compared with last session</span>${chips(['Better','Same','Worse'],D.vs,'snVs')}</div></div>`;
    const spec=BLK[D.mod],block=spec==='erp'?erpBlock():`<div class="sn-g">${spec.map(blockField).join('')}</div>`;
    const modSel=`<div class="field"><span class="lbl">Therapy type</span><div class="sn-chips">${MODS.map(m=>`<button type="button" class="sn-c ${D.mod===m?'on':''}" onclick="snMod('${m}')">${m}</button>`).join('')}</div></div>`;
    const goalsH=goals.map((g,i)=>`<div class="field"><span class="lbl">${esc(g.t)}</span>${nums(10,D.goalR[i],`(x=>snGoal(${i},x))`)}</div>`).join('');
    const hw=`<div class="field"><span class="lbl">Last homework</span>${chips(['Done','Partly done','Not done'],D.hwRev,'snHw')}</div><label class="field"><span class="lbl">New homework</span><input class="input" value="${esc(D.hwNew||'')}" oninput="snS('hwNew',this.value)" placeholder="e.g. practise the exposure twice a day"></label>`;
    const plan=`<div class="sn-g"><label class="field"><span class="lbl">Plan for next time</span><input class="input" value="${esc(D.plan||'')}" oninput="snS('plan',this.value)"></label><div class="sn-g"><label class="field"><span class="lbl">Next session date</span><input class="input" type="date" value="${esc(D.next||'')}" onchange="snS('next',this.value)"></label><label class="field"><span class="lbl">Time</span><input class="input" type="time" value="${esc(D.nextT||'10:00')}" onchange="snS('nextT',this.value)"></label></div></div><div class="tiny muted">A next session date books it on the Calendar and caseload.</div>`;
    const sum=`<label class="field"><span class="lbl">One line for the psychiatrist (shows on Rounds)</span><textarea class="input" id="snSum" rows="2" oninput="snSumTouch(this.value)">${esc(D.summary||'')}</textarea></label>`;
    const sec=(t,sub,h)=>`<section class="sn-sec"><div class="sn-sh">${t}${sub?` <small>${sub}</small>`:''}</div><div class="sn-sb">${h}</div></section>`;
    return sec('Session','Filled in for you',hdr)+sec('Risk check','Required. Any yes starts a short C-SSRS',risk)+sec('Check-in','',checkin)+sec('Therapy',D.mod,modSel+block)+sec('Goals','Rate each for today, 0 to 10',goalsH)+sec('Homework','',hw)+sec('Plan','',plan)+sec('Summary','Drafted from what you filled in. Edit it',sum);
  }
  window.snKind=v=>{KIND={Individual:'ind',Group:'grp',Family:'fam'}[v];if(!D.modTouched)D.mod=DEFMOD[KIND];D.blk={};draw();};
  window.snMood=v=>{D.mood=D.mood===v?null:v;autoSum();draw();};
  window.snEng=v=>{D.eng=D.eng===v?'':v;autoSum();draw();};
  window.snVs=v=>{D.vs=D.vs===v?'':v;autoSum();draw();};
  window.snHw=v=>{D.hwRev=D.hwRev===v?'':v;draw();};
  const __snMod=window.snMod;window.snMod=v=>{D.modTouched=true;__snMod(v);autoSum();draw();};
  function draw(){const f=$('snForm');if(!f)return;const top=f.scrollTop;autoSumSilent();f.innerHTML=body();f.scrollTop=top;}
  function autoSumSilent(){if(!D.touched)autoSum();}

  /* ---------------- open, save, sign ---------------- */
  window.snOpen=function(pid,kind,pre){
    PID=pid||S.pid;KIND=kind||'ind';
    D={mod:DEFMOD[KIND],lang:'English',mins:'',risk:{self:'',others:'',unsafe:''},cs:{},mood:null,eng:'',vs:'',blk:{},goalR:{},hwRev:'',hwNew:'',plan:'',next:'',nextT:'10:00',summary:(pre&&pre.summary)||'',touched:!!(pre&&pre.summary)};
    V3.modal('Session note · '+esc(pat(PID).name),'One frame for every session, then the block for the therapy type.',`<div class="sn-form" id="snForm"></div><div id="snErr" class="small" style="color:var(--red);display:none;margin-top:8px"></div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn" onclick="snSave(false)">Save draft</button><button class="btn pri" onclick="snSign()">Sign and lock</button>`);
    const m=$('modal');if(m)m.style.width='min(940px,100%)';
    draw();
  };
  function problem(sign){
    const r=D.risk;
    if(sign&&(!r.self||!r.others||!r.unsafe))return 'Answer the three risk questions. They cannot be skipped.';
    if(sign&&riskAny()&&['wish','think','method','intent','plan'].some(k=>!D.cs[k]))return 'A yes in the risk check means the short C-SSRS: answer all five questions.';
    if(sign&&(D.mood===null||D.mood===''))return 'Pick the mood today (0 to 10).';
    if(sign&&!(+D.mins>=1))return 'Write the minutes.';
    if(sign&&!String(D.summary||'').trim())return 'The one-line summary is empty.';
    return '';
  }
  function entry(signed){
    const p=pat(PID),b=D.blk,lines=[];
    const lad=sn(PID).ladder.find(x=>x.id===b.item);
    lines.push(D.mod+(D.mood!==null&&D.mood!==''?' · mood '+D.mood+'/10':'')+(D.eng?' · '+D.eng:'')+(D.vs?' · '+D.vs+' than last time':''));
    if(lad)lines.push('Exposure: '+lad.text+' (start '+(b.start||'-')+', peak '+(b.peak||'-')+', end '+(b.end||'-')+', '+(b.min||'-')+' min), response prevention '+(b.rp||'-'));
    if(D.mod==='CBT'&&(b.sit||b.aut))lines.push('Thought record: '+[b.sit,b.aut,b.bal].filter(Boolean).join(' / '));
    lines.push('Risk check: '+(riskAny()?'RAISED':'none raised'));
    if(D.hwRev)lines.push('Last homework: '+D.hwRev);
    return {date:todayTxt(),by:signer(),modality:D.mod,mins:String(D.mins||''),note:lines.join('. '),plan:(D.plan||'')+(D.hwNew?' · homework: '+D.hwNew:''),struct:true,kind:KIND};
  }
  function persist(signed){
    const s=sn(PID),r=entry(signed);
    const note=Object.assign({},D,{id:'n'+Date.now(),ts:Date.now(),status:signed?'signed':'draft',at:todayTxt()+', '+nowTime(),by:signer(),signedBy:signed?signer():'',signedAt:signed?atNow():'',kind:KIND,addenda:[],summaryLine:D.summary});
    delete note.touched;delete note.modTouched;
    s.notes.unshift(note);
    if(signed){
      try{psyTherapyPage();}catch(e){}
      const x=px(PID);if(x.th&&x.th.ind){
        if(KIND==='ind')x.th.ind.unshift(r);
        else if(KIND==='fam'&&x.th.fam)x.th.fam.unshift({date:r.date,who:D.blk.who||'',by:signer(),topics:(D.blk.purpose||[]).join(', '),actions:D.blk.act||''});
        else if(KIND==='grp'&&x.th.grp)x.th.grp.unshift({date:r.date,group:D.blk.gt||'Group',by:signer(),took:'Attended',note:D.blk.pp||D.blk.gn||'',src:'Session note'});
      }
      if(D.mod==='ERP for OCD'&&D.blk.yb)s.ybocs=new Date().toISOString().slice(0,10);
      if(D.mod==='Relapse prevention')s.relapse={trig:D.blk.trig||'',ews:D.blk.ews||'',cope:D.blk.cope||'',sup:D.blk.sup||'',by:signer(),at:atNow()};
      if(D.next){S.pgc=S.pgc||{tab:'cal',flt:'all',wk:0,extra:[],cols:{}};S.pgc.extra=S.pgc.extra||[];const [h,m]=String(D.nextT||'10:00').split(':').map(Number);S.pgc.extra.push({id:'n'+Date.now(),date:D.next,h:Math.min(17,Math.max(9,h||10)),m:m||0,kind:KIND,pid:PID,label:(KIND==='fam'?'Family · ':'')+pat(PID).name});}
      if(D.mod==='Family therapy'&&D.blk.grv&&D.blk.conc){try{S.pgriev=S.pgriev||[];S.pgriev.unshift({from:'Family',t:D.blk.conc.slice(0,90),via:'Family session',own:'Patient experience team',st:'Open',sla:'6 h left',src:'family',cat:'Psychologist',...whoAt()});}catch(e){}}
      if(riskAny()){
        const lv=cssLevel();
        try{V3.alert({pid:PID,sev:'urgent',title:'Therapy session risk: '+Object.entries({self:'thoughts of self-harm',others:'thoughts of harming others',unsafe:'feels unsafe on the ward'}).filter(([k])=>D.risk[k]==='yes').map(e=>e[1]).join(', '),detail:'C-SSRS level '+lv[0]+'. Suggested observation: '+lv[1]+'. Session note signed by '+signer()+'.',src:'Psychologist',by:signer()});}catch(e){}
      }
    }
    return note;
  }
  window.snSave=function(){const e=$('snErr'),pr=problem(false);if(pr){if(e){e.textContent=pr;e.style.display='block';}return;}persist(false);closeModal();render();toast('Draft saved. It is not signed yet.');};
  window.snSign=function(){
    const e=$('snErr'),pr=problem(true);
    if(pr){if(e){e.textContent=pr;e.style.display='block';}return;}
    const go=()=>{const n=persist(true);render();toast('Session note signed and locked by '+signer()+(riskAny()?'. The psychiatrist has been alerted.':'.'));};
    if(typeof pinSign==='function'){const saved=D,k=KIND,pid=PID;pinSign('Sign session note · '+pat(pid).name,[['Therapy',D.mod],['Risk check',riskAny()?'Raised, the psychiatrist will be alerted':'None raised'],['Summary',D.summary]],()=>{D=saved;KIND=k;PID=pid;go();},'Once signed, the note is locked. Only an addendum can be added.');}
    else go();
  };

  /* ---------------- read, addendum ---------------- */
  window.snView=function(id){
    const n=(sn(S.pid).notes||[]).find(x=>x.id===id);if(!n)return;
    const rows=[['Date',n.at],['Therapy',n.mod],['Mood',n.mood!==null&&n.mood!==''?n.mood+'/10':''],['Engagement',n.eng],['Compared with last',n.vs],['Risk check',Object.values(n.risk||{}).some(v=>v==='yes')?'RAISED':'None raised'],['Homework',n.hwRev],['New homework',n.hwNew],['Plan',n.plan],['Summary',n.summaryLine||n.summary]].filter(r=>r[1]);
    V3.modal('Session note · '+esc(pat(S.pid).name),n.status==='signed'?'Signed and locked':'Draft',
      `${n.status==='signed'?`<div class="sn-lock">Signed by ${esc(n.signedBy)}, ${esc(n.signedAt)}. Locked: only an addendum can be added.</div>`:''}
       <div class="pin-sum" style="margin-top:10px">${rows.map(r=>`<div class="pin-r"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('')}</div>
       ${(n.addenda||[]).map(a=>`<div class="sn-add"><b>Addendum</b> by ${esc(a.by)}, ${esc(a.at)}<br>${esc(a.text)}</div>`).join('')}
       ${n.status==='signed'?`<label class="field" style="margin-top:12px"><span class="lbl">Add an addendum</span><textarea class="input" id="snAdd" rows="2" placeholder="What was missed or changed. The note above is not edited."></textarea></label>`:''}`,
      `<button class="btn" onclick="closeModal()">Close</button>${n.status==='signed'?`<button class="btn pri" onclick="snAddSave('${id}')">Add addendum</button>`:''}`);
  };
  window.snAddSave=function(id){
    const n=(sn(S.pid).notes||[]).find(x=>x.id===id),t=(($('snAdd')||{}).value||'').trim();if(!n||!t){toast('Write the addendum first');return;}
    n.addenda=n.addenda||[];n.addenda.push({by:signer(),at:atNow(),text:t});closeModal();render();toast('Addendum added by '+signer());
  };
  function listCard(){
    const v=document.getElementById('view');if(!v||!pgy()||document.getElementById('snList'))return;
    if(!/^#\/patient\/[^/]+\/therapy/.test(location.hash||''))return;
    const notes=sn(S.pid).notes||[];
    const sec=document.createElement('section');sec.className='card';sec.id='snList';
    sec.innerHTML=`<div class="hd"><div><h3>Session notes</h3><div class="small muted" style="margin-top:4px">One frame for every session plus a block for the therapy type. Signed notes are locked.</div></div><button class="btn pri sm" onclick="snOpen(S.pid,'ind')">New session note</button></div><div class="pad">${notes.length?notes.map(n=>`<div class="sn-note"><div><b>${esc(n.at)} · ${esc(n.mod)}</b><div class="small muted">${esc(n.summaryLine||n.summary||'')}</div>${(n.addenda||[]).length?`<div class="tiny muted">${n.addenda.length} addendum${n.addenda.length>1?'s':''}</div>`:''}</div><div class="row" style="gap:8px"><span class="chip ${n.status==='signed'?'c-green':'c-amber'}">${n.status==='signed'?'Signed':'Draft'}</span><button class="btn sm" onclick="snView('${n.id}')">Open</button></div></div>`).join(''):'<div class="small muted">No structured session note yet.</div>'}</div>`;
    v.appendChild(sec);
  }

  /* Add on Individual, Group and Family therapy opens the structured note (psychologist only) */
  const __add=window.psyThAdd;
  if(typeof __add==='function')window.psyThAdd=function(k){
    if(pgy()&&['ind','grp','fam'].includes(k)){snOpen(S.pid,k);return;}
    return __add.apply(this,arguments);
  };
  /* after recording a session, the details window offers the full note, filled with what is there */
  const __sd=window.pgSessionDetails;
  if(typeof __sd==='function')window.pgSessionDetails=function(){
    const r=__sd.apply(this,arguments);
    if(pgy())setTimeout(()=>{const f=document.querySelector('#modal .mf');if(f&&!f.querySelector('[data-sn]'))f.insertAdjacentHTML('afterbegin','<button class="btn" data-sn="1" style="margin-right:auto" onclick="snFromDetails()">Use the full session note</button>');},60);
    return r;
  };
  window.snFromDetails=function(){const t=(($('pgSdSum')||{}).value||'').trim();closeModal();snOpen(S.pid,'ind',{summary:t});};

  /* psychiatrist Rounds: the psychologist's latest one-line summary */
  function roundsLine(){
    if(!doc()||!/^#\/rounds/.test(location.hash||''))return;
    const grid=document.querySelector('#view .pr-grid');if(!grid||grid.querySelector('.pr-sn'))return;
    const pid=S.focusPid;if(!pid)return;
    const n=((px(pid).sn||{}).notes||[]).find(x=>x.status==='signed');
    const hit=[...grid.querySelectorAll('*')].find(e=>e.children.length===0&&/^Psychologist$/.test(e.textContent.trim()));
    if(!hit)return;
    const row=hit.parentElement;
    const line=document.createElement('div');line.className='pr-sn';
    line.innerHTML=n?`<b>Last session (${esc(n.at.split(',')[0])}):</b> ${esc(n.summaryLine||n.summary)}`:'No signed session note yet.';
    (row.lastElementChild===hit?row:row.lastElementChild).appendChild(line);
  }
  const __r77=render;
  render=function(){const r=__r77.apply(this,arguments);try{listCard();roundsLine();}catch(e){}return r;};
})();
