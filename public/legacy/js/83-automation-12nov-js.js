/* 12 Nov 2026, Trello cards 113 to 116 (psychiatrist and psychologist; floor lead sees the escalations).
   113 Notes nudges: daily note nudges at 4 pm and 6 pm, floor lead at 9 pm; unsigned drafts overdue after 24 h and escalated after 48 h;
       detailed history (72 h) and management plan (day 7) due dates with a reminder 24 h before. One note counts once (S.eod[pid].saved).
   114 Family updates automation: required calls (24 h, day 3 to 4, weekly update) on Today, calls logged in the HMS tick the contact, weekly update
       drafted in plain English or Hindi (no clinical details) and approved in one tap, a concern raised as a grievance in one tap with a 6 h clock
       that escalates to the Patient Experience lead, reminder for a family session booked for tomorrow.
   115 Discharge automation: readiness score with what is missing, relapse plan built from therapy, follow-ups (7 day call, 30/60/90) booked on sign,
       every medicine marked continue / stop / changed, Sign and discharge locked until the required items are done, summary pre-filled.
   116 AI scribe outputs: one recording (or pasted text) becomes the note, a one-line summary, a family update (English and Hindi), an ICD-11 suggestion
       and flagged risk words. All are drafts, AI-filled vs typed is shown, nothing is saved until the clinician presses a save button.
   Prototype: demo clock (Demo time chips), demo data, nothing is sent anywhere. */
(function(){
  const role=()=>String((window.__TULASI__||{}).role||'');
  const kind=()=>{const r=role();if(S.role==='psychologist'||/psycholog/.test(r))return 'psychologist';if(S.role==='psychiatrist'&&!/patient-experience|rmo/.test(r))return 'psychiatrist';return '';};
  const au=()=>S.au||(S.au={hr:null,skip:0,notes:{},drafts:null,hist:{},fam:{},grv:[],rem:{},dc:{},sc:{},consent:{}});
  const nowMs=()=>Date.now()+(au().skip||0)*3600000;
  const hr=()=>au().hr!=null?au().hr:new Date(nowMs()).getHours();
  const pt=pid=>PTS.find(p=>p.id===pid)||{id:pid,name:pid,day:0,dx:''};
  const myPts=()=>kind()==='psychologist'?PSY_EOD():PTS;
  const hrs=ms=>Math.round(ms/3600000);
  const alertOnce=(key,pid,title,detail,src)=>{const a=au();a.esc=a.esc||{};if(a.esc[key])return;a.esc[key]=1;try{V3.alert({pid,sev:'urgent',title,detail,src:src||'Notes',by:'System'});}catch(e){}};
  const row=(left,right)=>`<div class="row small" style="gap:10px;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eef1f5"><span>${left}</span><span style="display:flex;gap:6px;align-items:center;flex:none">${right||''}</span></div>`;
  const chipx=(t,c)=>`<span class="au-ch ${c||''}">${hesc(t)}</span>`;
  const route=()=>{const m=String(location.hash||'').match(/^#\/patient\/([^/?]+)\/([^/?]+)/);return m?{pid:m[1],tab:m[2]}:null;};

  /* ======================= 113 notes nudges ======================= */
  const noted=pid=>!!((S.eod||{})[pid]||{}).saved||!!((psyPx(pid).sn||{}).notes||[]).some(n=>n.ts&&new Date(n.ts).toDateString()===new Date().toDateString());
  const seedDrafts=()=>{const a=au();if(!a.drafts){const t=Date.now();a.drafts=[
    {id:'d1',pid:'arjun',title:'Round note',role:'psychiatrist',at:t-30*3600000,signed:null},
    {id:'d2',pid:'neel',title:'Daily note',role:'psychiatrist',at:t-52*3600000,signed:null},
    {id:'d3',pid:'varun',title:'Session note',role:'psychologist',at:t-26*3600000,signed:null},
    {id:'d4',pid:'sameer',title:'Session note',role:'psychologist',at:t-5*3600000,signed:null}];}return a.drafts;};
  const dueDates=()=>{const a=au(),out=[];myPts().forEach(p=>{const d=+p.day||0;
    [['hist','Detailed history',3],['plan','Management plan',7]].forEach(k=>{if(a.hist[p.id+k[0]]||d>7)return;const left=k[2]-d;out.push({pid:p.id,key:k[0],label:k[1],left,name:p.name});});});return out;};
  function nudgeLevel(){const h=hr();return h>=21?3:h>=18?2:h>=16?1:0;}
  function nnTasks(){const out=[],k=kind();if(!k)return out;
    seedDrafts().filter(d=>d.role===k&&!d.signed).forEach(d=>{const h=hrs(nowMs()-d.at);if(h>=24)out.push({id:'nn_dr_'+d.id,late:true,title:d.title+' unsigned · '+pt(d.pid).name,meta:'Draft is '+h+' h old'+(h>=48?'. Sent to the floor lead':''),due:'Overdue',go:'#/patient/'+d.pid+'/daily'});});
    if(nudgeLevel())myPts().filter(p=>(+p.day||0)>=1&&!noted(p.id)).forEach(p=>out.push({id:'nn_dn_'+p.id,late:nudgeLevel()>=2,title:'Daily note · '+p.name,meta:nudgeLevel()>=3?'Not written by 9 pm. Floor lead told':nudgeLevel()>=2?'Second reminder, 6 pm':'Reminder, 4 pm',due:'Today',go:'#/notes'}));
    dueDates().filter(x=>x.left<=1).forEach(x=>out.push({id:'nn_dd_'+x.pid+x.key,late:x.left<0,title:x.label+' · '+x.name,meta:x.left<0?'Overdue by '+(-x.left)+(x.left<-1?' days':' day'):x.left===0?'Due today':'Due tomorrow (24 h reminder)',due:x.left<0?'Overdue':'Soon',go:'#/patient/'+x.pid+(x.key==='plan'?'/therapy':'/admission')}));
    return out;}
  function nnEscalate(){const k=kind();if(!k)return;
    seedDrafts().forEach(d=>{if(!d.signed&&hrs(nowMs()-d.at)>=48)alertOnce('dr'+d.id,d.pid,'Unsigned note for 48 hours · '+pt(d.pid).name,d.title+' by '+(d.role==='psychiatrist'?'the psychiatrist':'the psychologist')+' is still unsigned.','Floor lead');});
    if(nudgeLevel()>=3)PTS.filter(p=>(+p.day||0)>=1&&!noted(p.id)).forEach(p=>alertOnce('dn'+p.id+new Date().toDateString(),p.id,'Daily note not written by 9 pm · '+p.name,'Sent to the floor lead.','Floor lead'));}
  window.nnSign=function(id){const d=seedDrafts().find(x=>x.id===id);if(!d)return;
    pinSign('Sign the '+d.title.toLowerCase()+' · '+pt(d.pid).name,[['Signing as',signer()]],()=>{d.signed={by:signer(),at:atNow()};render();toast('Signed. It is now locked; only an addendum can be added.');});};
  window.nnAddendum=function(id){const d=seedDrafts().find(x=>x.id===id);if(!d)return;
    V3.modal('Addendum · '+hesc(d.title),hesc(pt(d.pid).name),'<div class="small muted" style="margin-bottom:8px">A signed note cannot be changed. Add what is new below; the original stays as it was.</div><textarea class="input" id="nnAd" rows="4" placeholder="Addendum"></textarea>',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="nnAdSave('${id}')">Add addendum</button>`);};
  window.nnAdSave=function(id){const t=(($('nnAd')||{}).value||'').trim();if(!t){toast('Write the addendum first');return;}const d=seedDrafts().find(x=>x.id===id);d.add=(d.add||[]).concat([{t,by:signer(),at:atNow()}]);closeModal();render();toast('Addendum added');};
  window.nnDone=function(pid,key){au().hist[pid+key]=signer()+' · '+atNow();render();};
  window.auHr=function(h){au().hr=h;render();};
  window.auSkip=function(h){au().skip=(au().skip||0)+h;render();};
  window.auDemoReset=function(){const a=au();a.hr=null;a.skip=0;a.esc={};render();};

  function notesCard(){const k=kind();if(!k)return '';
    const ds=seedDrafts().filter(d=>d.role===k),lvl=nudgeLevel(),owed=myPts().filter(p=>(+p.day||0)>=1&&!noted(p.id)),dd=dueDates();
    const H=[[null,'Now'],[16,'4 pm'],[18,'6 pm'],[21,'9 pm']].map(x=>`<button class="au-t ${au().hr===x[0]?'on':''}" onclick="auHr(${x[0]})">${x[1]}</button>`).join('');
    const nudge=lvl===0?`<div class="small muted">No nudge yet. Daily notes are nudged at 4 pm and 6 pm, and at 9 pm they go to the floor lead.</div>`:owed.length?owed.map(p=>row(`<b>${hesc(p.name)}</b> · daily note not written`,chipx(lvl>=3?'Floor lead told':lvl>=2?'Second reminder':'Reminder 4 pm',lvl>=3?'bad':lvl>=2?'warn':'')+`<button class="btn sm" onclick="openNotesFor('${p.id}')">Write</button>`)).join(''):`<div class="small" style="color:#067647">Every daily note is written. No nudge.</div>`;
    const drafts=ds.length?ds.map(d=>{const h=hrs(nowMs()-d.at);return row(`<b>${hesc(pt(d.pid).name)}</b> · ${hesc(d.title)} <span class="tiny muted">${d.signed?'signed '+hesc(d.signed.at)+' · locked':'draft '+h+' h old'}</span>${(d.add||[]).map(a=>`<div class="tiny muted">Addendum by ${hesc(a.by)}, ${hesc(a.at)}: ${hesc(a.t)}</div>`).join('')}`,d.signed?`<button class="btn sm" onclick="nnAddendum('${d.id}')">Add addendum</button>`:chipx(h>=48?'Sent to floor lead':h>=24?'Overdue':'Draft',h>=48?'bad':h>=24?'warn':'')+`<button class="btn sm pri" onclick="nnSign('${d.id}')">Sign</button>`);}).join(''):'<div class="small muted">No drafts.</div>';
    const later=dd.filter(x=>x.left>1).length,dues=dd.filter(x=>x.left<=1).length?dd.filter(x=>x.left<=1).map(x=>row(`<b>${hesc(x.name)}</b> · ${hesc(x.label)} <span class="tiny muted">${x.key==='hist'?'72 h after admission':'day 7'}</span>`,chipx(x.left<0?'Overdue '+(-x.left)+' d':x.left===0?'Due today':x.left===1?'Due tomorrow':'In '+x.left+' days',x.left<0?'bad':x.left<=1?'warn':'')+`<button class="btn sm" onclick="nnDone('${x.pid}','${x.key}')">Mark done</button>`)).join('')+(later?`<div class="tiny muted" style="padding-top:6px">${later} more later, reminded 24 hours before</div>`:''):'<div class="small muted">Nothing due in the next day.'+(later?' '+later+' later, reminded 24 hours before.':'')+'</div>';
    return `<section class="card" id="nnCard"><div class="hd"><div><h3>Notes and due dates</h3><div class="small muted" style="margin-top:4px">Only notes you still owe are nudged. One note counts once, wherever it was written.</div></div><div class="au-ts"><span class="tiny muted">Demo time</span>${H}</div></div>
      <div class="pad au-grid"><div><div class="lbl">Daily notes</div>${nudge}</div><div><div class="lbl">Unsigned drafts</div>${drafts}</div><div class="au-wide"><div class="lbl">History and plan due dates (set at admission)</div>${dues}</div></div></section>`;}

  /* ======================= 114 family updates automation ======================= */
  const FAM_SEED={varun:{c24:false},sameer:{c34:false}};
  const famState=pid=>{const a=au();if(!a.fam[pid]){const p=pt(pid),d=+p.day||0,s=FAM_SEED[pid]||{};a.fam[pid]={c24:d>=2&&s.c24!==false?'Seeded':'',c34:d>=5&&s.c34!==false?'Seeded':'',weeks:Math.max(0,Math.floor(d/7)-(d>=14&&pid==='kabir'?1:0)),log:[]};}return a.fam[pid];};
  const famRows=()=>{const out=[];myPts().forEach(p=>{const d=+p.day||0,f=famState(p.id),k=kind();
    if(k==='psychiatrist'){
      if(!f.c24)out.push({pid:p.id,name:p.name,what:'24 hour call',key:'c24',late:d>=2,due:d>=2?'Overdue':'Due today'});
      if(!f.c34&&d>=3)out.push({pid:p.id,name:p.name,what:'Day 3 to 4 call',key:'c34',late:d>=5,due:d>=5?'Overdue':'Due today'});}
    else{ if(!f.c34&&d>=3)out.push({pid:p.id,name:p.name,what:'Day 3 to 4 call',key:'c34',late:d>=5,due:d>=5?'Overdue':'Due today'});
      const wk=Math.floor(d/7);if(wk>f.weeks)out.push({pid:p.id,name:p.name,what:'Week '+wk+' update',key:'wk',late:false,due:'Due this week'});}});return out;};
  const famTasks=()=>famRows().map(r=>({id:'fa_'+r.pid+r.key,late:r.late,title:r.what+' · '+r.name,meta:'Required family contact',due:r.due,go:'#/patient/'+r.pid+'/prefs'}));
  window.faCall=function(pid,key){const p=pt(pid);
    V3.modal('Call '+hesc(p.name)+"'s family",'Logged in the HMS. This ticks the required call.',`<div class="small muted" style="margin-bottom:8px">Required: ${key==='c24'?'24 hour call':'day 3 to 4 call'}</div><label class="field"><span class="lbl">What was said</span><textarea class="input" id="faN" rows="4" placeholder="In a few words"></textarea></label><label class="row" style="gap:8px;margin-top:8px"><input type="checkbox" id="faG"> <span>There is a concern. Raise it as a grievance (6 hour clock)</span></label>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="faCallSave('${pid}','${key}')">Save call</button>`);};
  window.faCallSave=function(pid,key){const n=(($('faN')||{}).value||'').trim(),g=!!($('faG')||{}).checked,f=famState(pid);
    f[key]=signer()+' · '+atNow();f.log.unshift({what:key==='c24'?'24 hour call':'Day 3 to 4 call',by:signer(),at:atNow(),note:n});
    if(g){au().grv.push({id:'g'+Date.now(),pid,text:n||'Concern raised on a family call',by:signer(),at:nowMs(),ack:false});}
    closeModal();render();toast(g?'Call saved. The concern is with the Patient Experience lead: they have 6 hours.':'Call saved and ticked');};
  const weekDraft=(pid,lang)=>{const p=pt(pid),x=psyPx(pid),sn=(x.sn||{}).notes||[],first=String(p.name).split(' ')[0],plain=window.famPlain||{};
    const topics=[...new Set(sn.flatMap(n=>[].concat(n.topics||[])))].slice(0,3).map(t=>plain[String(t).toLowerCase()]||String(t).toLowerCase());
    const did=topics.length?topics.join(', '):'a talk with the team and daily activities';
    return lang==='hi'?`नमस्ते। इस हफ़्ते ${first} ने नियमित दिनचर्या का पालन किया और ${topics.length?'हमारी टीम के साथ बातचीत में हिस्सा लिया':'गतिविधियों में हिस्सा लिया'}। खाना और नींद में धीरे-धीरे सुधार दिख रहा है। अगले हफ़्ते भी यही दिनचर्या जारी रहेगी। कोई सवाल हो तो हमें बताइए।`:`Hello. This week ${first} followed the daily routine and took part in ${did}. Eating and sleep are slowly settling. Next week the same routine continues. Please tell us if you have any questions.`;};
  window.faWeek=function(pid,lang){lang=lang||'en';const p=pt(pid);
    V3.modal('Weekly update · '+hesc(p.name),'Drafted from this week\'s notes. No clinical details. Approve in one tap.',`<div class="row" style="gap:6px;margin-bottom:8px"><button class="au-t ${lang==='en'?'on':''}" onclick="faWeek('${pid}','en')">English</button><button class="au-t ${lang==='hi'?'on':''}" onclick="faWeek('${pid}','hi')">हिन्दी</button><span class="au-ch">AI draft</span></div><textarea class="input" id="faW" rows="6">${hesc(weekDraft(pid,lang))}</textarea>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="faWeekOk('${pid}')">Approve and mark sent</button>`);};
  window.faWeekOk=function(pid){const f=famState(pid);f.weeks=Math.floor((+pt(pid).day||0)/7);f.log.unshift({what:'Weekly update',by:signer(),at:atNow(),note:(($('faW')||{}).value||'')});closeModal();render();toast('Approved. The family update is marked sent.');};
  window.faAck=function(id){const g=au().grv.find(x=>x.id===id);if(g){g.ack=true;render();}};
  function famEscalate(){au().grv.forEach(g=>{if(!g.ack&&nowMs()-g.at>=6*3600000)alertOnce('g'+g.id,g.pid,'Family concern untouched for 6 hours · '+pt(g.pid).name,g.text,'Patient experience lead');});}
  const sessTomorrow=()=>{const t=new Date(Date.now()+86400000+(au().skip||0)*0),ds=t.toISOString().slice(0,10);const L=((S.pgc||{}).extra||[]).filter(e=>e.kind==='fam'&&e.date===ds).map(e=>({id:e.id,pid:e.pid,label:e.label,at:(e.h||10)+':'+String(e.m||0).padStart(2,'0')}));
    return L.length?L:[{id:'demo_fs',pid:'varun',label:'Family session · Varun Rao',at:'11:00',demo:true}];};
  window.faRemind=function(id){au().rem[id]=signer()+' · '+atNow();render();toast('Reminder sent to the family for tomorrow');};
  function famCard(){const k=kind();if(!k)return '';const rows=famRows(),g=au().grv,ss=sessTomorrow();
    const req=rows.length?rows.map(r=>row(`<b>${hesc(r.name)}</b> · ${hesc(r.what)}`,chipx(r.due,r.late?'bad':'warn')+(r.key==='wk'?`<button class="btn sm pri" onclick="faWeek('${r.pid}')">Draft and approve</button>`:`<button class="btn sm pri" onclick="faCall('${r.pid}','${r.key}')">Call and log</button>`))).join(''):'<div class="small" style="color:#067647">Every required family contact is done.</div>';
    const gv=g.length?g.map(x=>{const left=6-(nowMs()-x.at)/3600000;return row(`<b>${hesc(pt(x.pid).name)}</b> · ${hesc(x.text)}`,x.ack?chipx('Picked up','ok'):left<=0?chipx('With the Patient Experience lead','bad'):chipx(Math.ceil(left)+' h left','warn')+`<button class="btn sm" onclick="faAck('${x.id}')">I am on it</button>`);}).join(''):'<div class="small muted">No family concerns open.</div>';
    const sr=ss.map(s=>row(`${hesc(s.label)} <span class="tiny muted">tomorrow, ${hesc(s.at)}</span>`,au().rem[s.id]?chipx('Reminder sent','ok'):`<button class="btn sm" onclick="faRemind('${s.id}')">Remind family</button>`)).join('');
    return `<section class="card" id="faCard"><div class="hd"><div><h3>Family contact</h3><div class="small muted" style="margin-top:4px">Required calls are set at admission. A call logged here ticks itself. A concern goes to the Patient Experience lead if no one picks it up in 6 hours.</div></div></div>
      <div class="pad au-grid"><div><div class="lbl">Required now</div>${req}</div><div><div class="lbl">Family concerns (6 hour clock)</div>${gv}</div><div class="au-wide"><div class="lbl">Family session tomorrow</div>${sr}</div></div></section>`;}

  /* ======================= 115 discharge automation ======================= */
  const dcs=pid=>{const a=au();return a.dc[pid]||(a.dc[pid]={man:{},med:{},fu:false,rel:null});};
  const medsOf=pid=>{try{return (ptCtxOf(pid).meds||[]);}catch(e){return [];}};
  const medStable=pid=>medsOf(pid).every(m=>{const t=Date.parse(String(m.at||'').replace(',',''));return !t||Date.now()-t>72*3600000;});
  const mhcaOk=pid=>{const p=pt(pid);return String(p.sec)!=='89'||!!((psyPx(pid).mhca||{}).decision)||dcs(pid).man.mhca;};
  const riskOk=pid=>!(V3.openAlerts?V3.openAlerts(a=>a.pid===pid&&!a.ack):[]).length;
  const items=pid=>{const d=dcs(pid),m=d.man;return [
    {k:'goals',t:'Goals reached or improving',ok:!!m.goals,man:true},
    {k:'topics',t:'Family sensitisation topics covered',ok:!!m.topics,man:true},
    {k:'meds',t:'Medicines stable (no change in 72 h)',ok:medStable(pid)},
    {k:'mhca',t:'MHCA status resolved',ok:mhcaOk(pid),man:String(pt(pid).sec)==='89'&&!(psyPx(pid).mhca||{}).decision},
    {k:'risk',t:'Risk check clear (no open alert)',ok:riskOk(pid)},
    {k:'fu',t:'Follow-ups booked',ok:!!d.fu}];};
  const dcMeds=pid=>{const d=dcs(pid);return medsOf(pid).map((m,i)=>({i,m,v:d.med[i]||''}));};
  const required=pid=>{const miss=[],d=dcs(pid);
    if(dcMeds(pid).some(x=>!x.v))miss.push('Mark every medicine continue, stop or changed ('+dcMeds(pid).filter(x=>!x.v).length+' left)');
    if(!mhcaOk(pid))miss.push('MHCA status not resolved');
    if(!riskOk(pid))miss.push('Open alert on this patient (risk check not clear)');
    if(!d.rel)miss.push('Relapse prevention plan not reviewed');
    return miss;};
  const relapseDraft=pid=>{const p=pt(pid),x=psyPx(pid),L=(x.sn||{}).ladder||[],hw=((S.tp||{})[pid]||{}).hw||[],dx=String(p.dx||'').toLowerCase();
    const trig=/alcohol|opioid/.test(dx)?'Cravings, old drinking or using friends, stress at home':/psychotic|schizo/.test(dx)?'Missed medicines, poor sleep, stress, drugs or alcohol':/obsess/.test(dx)?'Stress, change in routine, being alone for long':/bipolar|manic/.test(dx)?'Poor sleep, stopping medicines, big stress':'Poor sleep, isolation, conflict at home, stopping medicines';
    const warn=/alcohol|opioid/.test(dx)?'Strong craving, lying about use, skipping meals, staying away from family':/psychotic|schizo/.test(dx)?'Sleeping much less, suspicious or fearful talk, talking to self':/bipolar|manic/.test(dx)?'Sleeping much less, very talkative, spending a lot, irritable':'Low mood most days, not eating, staying in bed, not wanting to talk';
    const cope=(L.length?'Step-by-step practice from therapy ('+L.slice(0,2).map(l=>l.task||l.t||l).join(', ')+'). ':'')+(hw.length?'Homework: '+hw.slice(0,2).map(h=>h.t||h.task||h).join(', ')+'. ':'')+'Keep a fixed routine, take medicines on time, talk to one trusted person.';
    return {trig,warn,cope,call:'Treating team via the hospital helpline. In an emergency go to the nearest hospital.'};};
  window.dcMan=function(pid,k){const m=dcs(pid).man;m[k]=!m[k];render();};
  window.dcMed=function(pid,i,v){dcs(pid).med[i]=v;render();};
  window.dcRel=function(pid){const d=dcs(pid),r=d.rel||relapseDraft(pid),h=r;
    V3.modal('Relapse prevention plan · '+hesc(pt(pid).name),'Built from therapy. The psychologist edits it and the family gets a copy.',['trig|Triggers','warn|Early warning signs','cope|Coping steps','call|Who to call'].map(s=>{const [k,l]=s.split('|');return `<label class="field"><span class="lbl">${l}</span><textarea class="input" id="rl_${k}" rows="2">${hesc(h[k])}</textarea></label>`;}).join('')+`<div class="tiny muted">The family copy is given in English or Hindi.</div>`,`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn" onclick="dcRelSave('${pid}',true)">Save and copy in Hindi</button><button class="btn pri" onclick="dcRelSave('${pid}')">Save</button>`);};
  window.dcRelSave=function(pid,hi){const r={};['trig','warn','cope','call'].forEach(k=>r[k]=(($('rl_'+k)||{}).value||'').trim());dcs(pid).rel=r;closeModal();render();toast(hi?'Saved. A Hindi copy is ready for the family.':'Relapse plan saved. The family gets a copy.');};
  window.dcFu=function(pid){dcs(pid).fu=true;render();toast('Follow-ups booked: 7 day call, 30, 60 and 90 day check-ins');};
  const fuDates=()=>{const b=new Date(S.edd||Date.now());return [['7 day call',7],['30 day check-in',30],['60 day check-in',60],['90 day check-in',90]].map(x=>[x[0],new Date(b.getTime()+x[1]*86400000).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})]);};
  const summaryText=pid=>{const p=pt(pid),d=dcs(pid),x=psyPx(pid),sn=((x.sn||{}).notes||[]),r=d.rel||relapseDraft(pid),meds=dcMeds(pid);
    return ['Diagnosis: '+(p.dx||'to be confirmed'),'Course in hospital: admitted '+p.day+' days ago under Section '+(p.sec||'')+'. '+(sn.length?sn.length+' therapy sessions are recorded.':'Treated with medicines, daily review and group and individual therapy.'),
      'Medicines at discharge: '+(meds.length?meds.map(m=>m.m.name+' ('+(m.v||'to be marked')+')').join('; '):'none listed'),'Relapse plan: triggers - '+r.trig+'. Early signs - '+r.warn,'Follow-ups: '+fuDates().map(f=>f[0]+' '+f[1]).join('; ')].join('\n');};
  window.dcSummary=function(pid){S.dischargeDrafted=true;S.draftBy=signer();S.dsText=summaryText(pid);render();toast('Summary filled from the stay. Read it and correct it before signing.');};
  function dcCard(pid){const k=kind();if(!k)return '';const it=items(pid),n=it.filter(i=>i.ok).length,pct=Math.round(n/it.length*100),miss=required(pid),d=dcs(pid),meds=dcMeds(pid),fu=fuDates();
    const sc=it.map(i=>row(`${i.ok?'✓':'○'} ${hesc(i.t)}`,i.ok?chipx('Done','ok'):i.man?`<button class="btn sm" onclick="dcMan('${pid}','${i.k}')">Mark as reached</button>`:i.k==='fu'?`<button class="btn sm" onclick="dcFu('${pid}')">Book now</button>`:i.k==='risk'?`<button class="btn sm" onclick="go('#/myday')">Review alerts</button>`:chipx('Missing','warn'))).join('');
    const md=meds.length?meds.map(x=>row(`<b>${hesc(x.m.name)}</b> <span class="tiny muted">${hesc(x.m.freq)} · ${hesc(x.m.time||'')}</span>`,['Continue','Stop','Changed'].map(v=>`<button class="au-t ${x.v===v?'on':''}" onclick="dcMed('${pid}',${x.i},'${v}')">${v}</button>`).join(''))).join(''):'<div class="small muted">No medicines listed.</div>';
    return `<section class="card" id="dcAuto"><div class="hd"><div><h3>Discharge readiness ${chipx(pct+'%',pct>=100?'ok':pct>=60?'warn':'bad')}</h3><div class="small muted" style="margin-top:4px">Updates on its own as items are completed. ${miss.length?'Still needed to sign: '+miss.length:'Everything required is done.'}</div></div><div class="row" style="gap:6px"><span class="au-ch">Pre-filled</span><button class="btn sm" onclick="dcSummary('${pid}')">Fill summary from the stay</button></div></div>
      <div class="au-bar"><i style="width:${pct}%"></i></div>
      <div class="pad au-grid"><div><div class="lbl">Readiness</div>${sc}</div><div><div class="lbl">Discharge medicines</div>${md}</div>
      <div><div class="lbl">Relapse prevention plan</div>${d.rel?`<div class="small" style="line-height:1.5"><b>Triggers:</b> ${hesc(d.rel.trig)}<br><b>Early signs:</b> ${hesc(d.rel.warn)}</div>`:'<div class="small muted">Built from therapy: triggers, early warning signs, coping steps, who to call.</div>'}<button class="btn sm pri" style="margin-top:8px" onclick="dcRel('${pid}')">${d.rel?'Edit plan':'Review and save the plan'}</button></div>
      <div><div class="lbl">Follow-ups (booked on sign)</div>${fu.map(f=>row(hesc(f[0]),`<span class="small muted">${hesc(f[1])}</span>`)).join('')}</div></div>
      ${miss.length?`<div class="pad"><div class="callout amber"><b>Sign and discharge is locked.</b> Still needed:<ul style="margin:6px 0 0 18px">${miss.map(m=>'<li>'+hesc(m)+'</li>').join('')}</ul></div></div>`:''}</section>`;}
  function gateButton(pid){const miss=required(pid);document.querySelectorAll('#view button').forEach(b=>{if(!/Sign and discharge/.test(b.textContent))return;
    if(miss.length){b.disabled=true;b.title='Still needed: '+miss.join('; ');}});}

  /* ======================= 116 AI scribe outputs ======================= */
  const RISK=/(don'?t want to live|do not want to live|want to die|end it|end my life|kill myself|hurt myself|suicid|no reason to live|mar jaunga|jeena nahi|marna chahta|khatam kar|मरना|जीना नहीं|खुदकुशी|आत्महत्या|hurt (him|her|someone)|kill (him|her))/gi;
  const ICD={'depress':[['6A70','Single episode depressive disorder'],['6A71','Recurrent depressive disorder']],'bipolar':[['6A60','Bipolar type I disorder'],['6A61','Bipolar type II disorder']],'manic':[['6A60','Bipolar type I disorder']],'schizo':[['6A20','Schizophrenia']],'psychotic':[['6A23','Acute and transient psychotic disorder'],['6A20','Schizophrenia']],'obsess':[['6B20','Obsessive-compulsive disorder']],'alcohol':[['6C40.2','Alcohol dependence']],'opioid':[['6C43.2','Opioid dependence']],'anxiety':[['6B00','Generalised anxiety disorder']]};
  const icdFor=dx=>{const k=Object.keys(ICD).find(x=>String(dx||'').toLowerCase().includes(x));return k?ICD[k].map(c=>({code:c[0],title:c[1]})):[];};
  const localOut=(pid,text)=>{const p=pt(pid),first=String(p.name).split(' ')[0],sent=String(text).split(/(?<=[.!?।])\s+/).filter(s=>s.length>12);
    const note=sent.slice(0,5).join(' ')||String(text).slice(0,400);
    return {note,summaryLine:(sent[0]||note).slice(0,140),familyEn:`Hello. ${first} spoke with the team today and took part in the routine. We will keep the same routine and tell you if anything changes. Please call us with any question.`,familyHi:`नमस्ते। आज ${first} ने हमारी टीम से बातचीत की और दिनचर्या में हिस्सा लिया। हम यही दिनचर्या जारी रखेंगे और कुछ बदलने पर आपको बताएँगे। कोई सवाल हो तो हमें फ़ोन कीजिए।`,icd11:icdFor(p.dx),risk:[],unclear:[],local:true};};
  let rec=null,stream=null,chunks=[];
  window.auScribe=function(pid){const c=au().consent;const has=c[pid];
    V3.modal('Drafts from one recording · '+hesc(pt(pid).name),'One recording gives the note, a family update, a one-line summary, an ICD-11 suggestion and any risk words. Everything is a draft you review.',
      `<label class="row" style="gap:8px;margin-bottom:10px"><input type="checkbox" id="scC" ${has?'checked':''}> <span>Patient consent for recording was taken at admission</span></label>
       <div class="row" style="gap:10px;align-items:center;margin-bottom:8px"><button class="btn pri" id="scRecB" onclick="auScribeRec('${pid}')">Start recording</button><span class="small muted" id="scRecS">Or type or paste the conversation below.</span></div>
       <textarea class="input" id="scTx" rows="6" placeholder="Transcript"></textarea><div id="scOut"></div>`,
      `<button class="btn" onclick="auScribeClose()">Close</button><button class="btn pri" onclick="auScribeMake('${pid}')">Make the drafts</button>`);};
  window.auScribeClose=function(){try{if(rec&&rec.state==='recording')rec.stop();if(stream)stream.getTracks().forEach(t=>t.stop());}catch(e){}rec=null;stream=null;closeModal();};
  window.auScribeRec=async function(pid){const b=$('scRecB'),s=$('scRecS');if(!($('scC')||{}).checked){s.textContent='Tick the consent box first, or type the conversation instead.';return;}au().consent[pid]=true;
    if(rec&&rec.state==='recording'){rec.stop();b.disabled=true;b.textContent='Transcribing...';return;}
    if(!navigator.mediaDevices||!window.MediaRecorder){s.textContent='This browser cannot record. Type it instead.';return;}
    try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(e){s.textContent='Microphone blocked. Allow it, or type below.';return;}
    const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';chunks=[];
    const r=rec=new MediaRecorder(stream,Object.assign({audioBitsPerSecond:24000},mime?{mimeType:mime}:{}));
    r.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    r.onstop=async()=>{try{stream.getTracks().forEach(t=>t.stop());}catch(e){}const type=(r.mimeType||'audio/webm').split(';')[0],parts=chunks;chunks=[];rec=null;
      try{const fd=new FormData();fd.append('audio',new Blob(parts,{type}),'rec.'+(type.includes('mp4')?'mp4':'webm'));fd.append('schema',JSON.stringify({mode:'transcript',hint:'Ward round or therapy session. Hindi and English mixed.'}));
        const resp=await fetch(waCfg().url+'/scribe',{method:'POST',body:fd,signal:AbortSignal.timeout(90000)}),j=await resp.json().catch(()=>({}));if(!resp.ok||!j.ok)throw new Error(j.error||'Error '+resp.status);
        const ta=$('scTx');if(ta)ta.value+=(ta.value?'\n\n':'')+j.transcript;if(s)s.textContent='Done. Check the words, then press Make the drafts.';}
      catch(e){if(s)s.textContent=/fetch|network|TypeError/i.test(e.message+e.name)?'Could not reach the transcription service. Type it below.':e.message;}
      finally{if(b){b.disabled=false;b.textContent='Record more';}}};
    r.start(1000);b.textContent='Stop recording';s.textContent='Recording... press Stop when you finish';};
  window.auScribeMake=async function(pid){const t=(($('scTx')||{}).value||'').trim(),out=$('scOut');if(t.length<20){toast('Add the conversation first');return;}
    if(!($('scC')||{}).checked){toast('Consent for recording is needed');return;}au().consent[pid]=true;out.innerHTML='<div class="small muted">Making the drafts...</div>';
    let d=null;const p=pt(pid);
    try{const resp=await fetch(waCfg().url+'/scribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcript:t,patient:p.name,dx:p.dx,meds:medsOf(pid).map(m=>m.name),who:kind()}),signal:AbortSignal.timeout(60000)});const j=await resp.json().catch(()=>({}));if(resp.ok&&j.ok)d=j;}catch(e){}
    if(!d)d=localOut(pid,t);
    const flagged=[...new Set((t.match(RISK)||[]).concat(d.risk||[]))];
    au().sc[pid]=Object.assign({},d,{risk:flagged,orig:{note:d.note,summaryLine:d.summaryLine,familyEn:d.familyEn,familyHi:d.familyHi},t});
    scRender(pid);};
  function scRender(pid){const out=$('scOut'),s=au().sc[pid];if(!out||!s)return;
    const f=(k,l,rows)=>`<label class="field"><span class="lbl">${l} <span class="au-ch" id="scTag_${k}">${s.local?'Template draft':'AI draft'}</span></span><textarea class="input" id="sc_${k}" rows="${rows}" oninput="auScribeEdit('${pid}','${k}')">${hesc(s[k]||'')}</textarea></label>`;
    out.innerHTML=`${s.risk.length?`<div class="callout amber" style="margin:10px 0"><b>Risk words heard.</b> Read these before you sign: ${s.risk.map(r=>'<mark>'+hesc(r)+'</mark>').join(', ')}</div>`:''}
      ${s.local?'<div class="tiny muted" style="margin:8px 0">The AI service could not be reached, so these are simple template drafts from your text. Edit them.</div>':''}
      ${f('note','Note',4)}${f('summaryLine','One-line summary for Rounds',2)}${f('familyEn','Family update, English',4)}${f('familyHi','Family update, Hindi',4)}
      <div class="lbl" style="margin-top:6px">ICD-11 suggestion ${chipx('Psychiatrist confirms','')}</div>${(s.icd11||[]).length?s.icd11.map((c,i)=>row(`<b>${hesc(c.code)}</b> ${hesc(c.title)}`,kind()==='psychiatrist'?`<button class="btn sm" onclick="auIcd('${pid}',${i})">Confirm</button>`:chipx('For the psychiatrist','')) ).join(''):'<div class="small muted">No code suggested.</div>'}
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn pri" onclick="auScribeSave('${pid}','note')">Save as the note</button><button class="btn" onclick="auScribeSave('${pid}','line')">Save the summary line</button><button class="btn" onclick="auScribeSave('${pid}','fam')">Keep the family update for approval</button></div>`;}
  window.auScribeEdit=function(pid,k){const s=au().sc[pid],e=$('sc_'+k),g=$('scTag_'+k);if(!s||!e||!g)return;const ed=e.value.trim()!==String((s.orig||{})[k]||'').trim();g.textContent=ed?'Edited by you':(s.local?'Template draft':'AI draft');g.className='au-ch'+(ed?' typed':'');};
  window.auIcd=function(pid,i){const s=au().sc[pid],c=s&&s.icd11[i];if(!c)return;psyPx(pid).icd=c;toast('ICD-11 confirmed: '+c.code+' '+c.title);};
  window.auScribeSave=function(pid,what){const v=k=>(($('sc_'+k)||{}).value||'').trim();
    if(what==='note'){if(!v('note')){toast('The note is empty');return;}S.eod=S.eod||{};S.eod[pid]=Object.assign({},S.eod[pid],{saved:true,line:v('note'),aiFilled:true});try{psyNoteToProfile(pid);}catch(e){}toast('Saved as today\'s note. It shows as AI-filled and reviewed by '+signer()+'.');}
    else if(what==='line'){psyPx(pid).scLine={t:v('summaryLine'),by:signer(),at:atNow()};toast('Summary line saved. It shows on the Rounds card.');}
    else{famState(pid).draft={en:v('familyEn'),hi:v('familyHi'),by:signer(),at:atNow()};toast('Family update kept. Approve it from Family contact.');}
    render();};

  /* ======================= render hook ======================= */
  const css=document.createElement('style');css.id='au-12nov-css';
  css.textContent=`.au-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 28px}.au-wide{grid-column:1/-1}.au-grid .lbl{margin-bottom:6px}
  .au-ch{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 10px;background:#eef2f7;color:#475467;border:1px solid transparent;white-space:nowrap}.au-ch.ok{background:#ecfdf3;color:#067647;border-color:#abefc6}.au-ch.warn{background:#fffaeb;color:#b54708;border-color:#fedf89}.au-ch.bad{background:#fef3f2;color:#b42318;border-color:#fecdca}.au-ch.typed{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}
  .au-ts{display:flex!important;flex-direction:row!important;align-items:center;gap:6px;flex-wrap:wrap;width:auto!important;flex:none}.au-ts .au-t{width:auto!important;flex:none;min-height:0!important;height:auto!important}.au-t{border:1px solid #d6dee8;background:#fff;border-radius:99px;padding:5px 12px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}.au-t.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}
  .au-bar{height:6px;background:#eef2f7;margin:0 20px;border-radius:99px;overflow:hidden}.au-bar i{display:block;height:100%;background:#1f9d57;border-radius:99px;transition:width .3s}
  #view mark{background:#fde7e5;color:#b42318;padding:0 3px;border-radius:3px}
  @media(max-width:760px){.au-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  const __tasks=tasks;
  tasks=function(){const r=__tasks.apply(this,arguments);if(!Array.isArray(r)||kind()!=='psychiatrist')return r;const have=new Set(r.map(t=>t.id));
    nnTasks().concat(famTasks()).filter(t=>!have.has(t.id)).forEach(t=>r.push(Object.assign({},t,{lead:false})));return r;};

  function paint(){const v=$('view');if(!v||!kind())return;const rt=route();
    if(/^#\/myday/.test(location.hash||'')&&!v.querySelector('#nnCard')){
      const sec=document.createElement('div');sec.id='auToday';sec.style.cssText='display:flex;flex-direction:column;gap:14px;margin-bottom:14px';sec.innerHTML=notesCard()+famCard();
      const urgent=nnTasks().some(t=>t.late)||famRows().some(r=>r.late),host=v;urgent&&host.firstElementChild?host.insertBefore(sec,host.firstElementChild):host.appendChild(sec);}
    if(rt&&rt.tab==='discharge'&&!v.querySelector('#dcAuto')){const h=document.createElement('div');h.innerHTML=dcCard(rt.pid);const first=v.querySelector('section.card');if(h.firstElementChild)(first?first.parentNode.insertBefore(h.firstElementChild,first.nextSibling):v.appendChild(h.firstElementChild));gateButton(rt.pid);
      if(S.dsText&&!v.querySelector('#dsAi')){const t=document.createElement('section');t.id='dsAi';t.className='card pad';t.innerHTML=`<div class="lbl">Summary draft ${chipx('Pre-filled from the stay','')}</div><pre style="white-space:pre-wrap;font:inherit;margin:6px 0 0">${hesc(S.dsText)}</pre>`;const c=v.querySelector('#dcAuto');if(c)c.parentNode.insertBefore(t,c.nextSibling);}}
    else if(rt&&rt.tab==='discharge')gateButton(rt.pid);
    if(rt&&/^(daily|therapy|discharge)$/.test(rt.tab)&&!v.querySelector('#auScribeBtn')){const b=document.createElement('button');b.id='auScribeBtn';b.className='btn';b.textContent='Drafts from one recording';b.style.cssText='margin:0 0 10px;width:auto;align-self:flex-start;display:inline-flex';b.onclick=()=>auScribe(rt.pid);const first=v.querySelector('section.card');first?first.parentNode.insertBefore(b,first):v.appendChild(b);}
    const sc=rt&&psyPx(rt.pid).scLine;if(sc&&!v.querySelector('#auLine')&&/^(overview|daily)$/.test(rt.tab)){const d=document.createElement('div');d.id='auLine';d.className='small';d.style.cssText='margin:0 0 10px;padding:8px 12px;border-left:3px solid #1e6cdb;background:#f5f9ff;border-radius:6px';d.textContent='Latest session line: '+sc.t+' ('+sc.by+', '+sc.at+')';const first=v.querySelector('section.card');first&&first.parentNode.insertBefore(d,first);}}
  const __r=render;
  render=function(){const r=__r.apply(this,arguments);try{nnEscalate();famEscalate();paint();}catch(e){}return r;};
  window.auPaint=paint;
})();
