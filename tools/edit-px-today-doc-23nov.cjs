/* 23 Nov 2026 (Nikita: "Remove alert type - also does not match ipd alert document shared"). PX Today has no TYPE column, and in
   real mode its rows are exactly the Patient Experience Lead alerts of "IPD Alerts by Role":
   New grievance (amber), Low feedback rating (amber), Family call missed (amber, watcher), Preference change (grey), Discharge feedback (grey).
   Each row clears on the document's "Clears when". Clears done by hand are kept in px_today_ack (shared through px-store). */
const rep=require('./rep.cjs');
const T='public/px/today.html';
const DOC=String.raw`/* 23 Nov 2026: the Patient Experience Lead alerts from "IPD Alerts by Role" (real mode). Non-clinical only. */
const ACK_K='px_today_ack';
function ackAll(){try{return JSON.parse(localStorage.getItem(ACK_K)||'{}')||{};}catch(e){return {};}}
function ackSet(k,what){const a=ackAll();a[k]={what:what,at:Date.now(),by:'Patient Experience Lead'};try{localStorage.setItem(ACK_K,JSON.stringify(a));}catch(e){}}
function jget(k,d){try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}}
const DOC_MENU={
  'New grievance':[['Open in Grievances','Record the response, or escalate to the Floor Lead if clinical']],
  'Low feedback rating':[['Call the family','Opens the call pop-up; the logged call clears this'],['Follow-up call logged','Called from elsewhere: clears this alert']],
  'Family call missed':[['Call the family','Opens the call pop-up; the logged call clears this'],['Call logged elsewhere','Clears this alert']],
  'Preference change':[['Open preferences','Patient record, Preferences tab'],['Change confirmed with the ward','Clears this alert']],
  'Discharge feedback':[['Record feedback','Score 0 to 10 and what they said; clears this alert']]
};
const LOW_MAX=6; /* "rating below the set threshold": 0 to 6 of 10 (NPS detractor) */
function docRows(){
  raw.length=0;Object.assign(menus,DOC_MENU);
  const ack=ackAll(),pts=(window.HMS_PATIENTS&&window.HMS_PATIENTS.patients)||[],calls=jget('px_calls_v1',[]),now=Date.now(),D=864e5;
  const fmt=t=>new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  const subOf=h=>h.gone?'Discharged '+fmt(h.gone):((h.age||'')+'/'+(h.sex||'')+' · Day '+HMSX.day(h)+(h.room?' · '+h.room:''));
  const add=(id,type,h,c,text,meta,others)=>raw.push({id:id,type:type,late:c==='amber',name:h.name||'Patient',initials:h.ini||'',sub:subOf(h),tags:[],
    items:[{id:'i'+id,c:c,text:text,meta:meta}],others:others||'Nothing yet'});
  /* discharges: a patient who leaves the admitted list is remembered for 14 days (only when the list loaded) */
  const seen=jget('px_seen_adm',{}),gone=jget('px_gone_v1',{}),cur={};
  if(pts.length){
    pts.forEach(h=>{cur[h.id]={name:h.name,ini:h.ini};});
    Object.keys(seen).forEach(id=>{if(!cur[id]&&!gone[id])gone[id]={name:seen[id].name,ini:seen[id].ini,gone:now};});
    Object.keys(gone).forEach(id=>{if(cur[id]||now-gone[id].gone>14*D)delete gone[id];});
    try{localStorage.setItem('px_seen_adm',JSON.stringify(cur));localStorage.setItem('px_gone_v1',JSON.stringify(gone));}catch(e){}
  }
  const who=id=>pts.find(p=>p.id===id)||(gone[id]?Object.assign({id:id},gone[id]):null);
  const calledSince=(id,t)=>calls.some(c=>c.pid===id&&new Date(c.at).getTime()>=t);
  /* 1. New grievance (amber): clears when a response is recorded, or it is escalated */
  let st=null;try{const P=window.parent&&window.parent!==window&&window.parent.PXG;st=P&&P.self&&P.self.state;}catch(e){}
  if(st){const cs=st.concernStatus||{};
    (st.extraConcerns||[]).forEach(c=>{
      const s=Object.assign({},c,cs[c.id]||{});
      if(/Resolved|Closed|Escalated/i.test(s.status||'')||s.stage==='confirm'||(s.findings&&s.findings.length))return;
      const h=pts.find(p=>p.id===c.pid)||{name:c.pname||'Patient',ini:''},left=s.at?6*36e5-(now-s.at):null;
      const hm=ms=>{const m=Math.max(1,Math.round(Math.abs(ms)/6e4));return m>=60?Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':''):m+' min';};
      add('g:'+c.id,'New grievance',h,'amber','New grievance: '+(s.title||'Concern')+(s.category?' · '+s.category:''),
        c.id+' · with '+(s.owner||'owner')+(left===null?'':left<=0?' · response late by '+hm(left):' · '+hm(left)+' left to respond')+' · clears when a response is recorded or it is escalated',
        s.latest?(s.latestBy?s.latestBy+': ':'')+s.latest:'');
    });
  }
  /* 2. Low feedback rating (amber): clears when a follow-up call is logged */
  Object.keys(localStorage).filter(k=>k.indexOf('px_dc_')===0).forEach(k=>{
    const id=k.slice(6),d=jget(k,{}),f=d.form||{},h=who(id);
    if(!h||f.fbScore===undefined||f.fbScore===''||+f.fbScore>LOW_MAX||ack['low:'+id])return;
    if(calledSince(id,d.fbTs||now))return;
    add('low:'+id,'Low feedback rating',h,'amber','Low feedback rating: '+f.fbScore+' of 10'+(f.fbFrom?' from '+f.fbFrom:''),
      (f.fbSaid?'"'+f.fbSaid+'" · ':'')+'clears when a follow-up call is logged');
  });
  /* 3. Family call missed (amber, you watch): the family call at admission is due on Day 0; alert once it is more than 1 day late.
     Only admissions after the 15 Nov import (those families were called in the old HMS). */
  pts.forEach(h=>{
    const d=HMSX.day(h);
    if(!(d>=2&&d<=14)||!(String(h.adm||'')>'2026-11-15')||ack['fcm:'+h.id]||calls.some(c=>c.pid===h.id))return;
    add('fcm:'+h.id,'Family call missed',h,'amber','Family call missed: family call at admission, '+(d-1)+' day'+(d-1===1?'':'s')+' late',
      'you are watching · '+(h.nr?h.nr+(h.nrRel?' ('+String(h.nrRel).toLowerCase()+')':'')+' · ':'')+'clears when the call is logged');
  });
  /* 4. Preference change (grey): clears when the change is confirmed with the ward */
  const pr=jget('px_prefs_v2',{});
  pts.forEach(h=>{const v=pr[h.id];if(!v||!v.__ts)return;const a=ack['pref:'+h.id];if(a&&a.at>=v.__ts)return;
    add('pref:'+h.id,'Preference change',h,'grey','Preference change: preferences updated'+(v.__at?' '+v.__at:''),'diet, room, visitors or other · clears when the change is confirmed with the ward');});
  /* 5. Discharge feedback (grey): patient discharged, clears when feedback is collected */
  Object.keys(gone).forEach(id=>{const d=jget('px_dc_'+id,{});if((d.fb&&d.fb.on)||ack['dfb:'+id])return;
    add('dfb:'+id,'Discharge feedback',who(id),'grey','Discharge feedback: collect feedback from the patient and family','clears when feedback is collected');});
  const rk={amber:0,grey:1};raw.sort((a,b)=>rk[a.items[0].c]-rk[b.items[0].c]);
}
/* Record feedback for a discharged patient (the patient record is gone from the admitted list, so it is taken here) */
const DF={id:'',name:'',from:'Family',score:'',said:''};
function openDfb(id,name){Object.assign(DF,{id:id,name:name,from:'Family',score:'',said:''});drawDfb();}
function drawDfb(){
  let o=document.getElementById('dfbOv');if(!DF.id){if(o)o.remove();return;}
  if(!o){o=document.createElement('div');o.id='dfbOv';o.style.cssText='position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:90;display:flex;align-items:center;justify-content:center';document.body.appendChild(o);}
  const b=(k,v,on)=>'<button type="button" data-dfk="'+k+'" data-dfv="'+esc(v)+'" style="min-width:40px;height:36px;padding:0 10px;border-radius:8px;border:1.5px solid '+(on?'#1E6CDB':'#D0D8E3')+';background:'+(on?'#1E6CDB':'#fff')+';color:'+(on?'#fff':'#1D2939')+';font-weight:600;font-size:14px">'+esc(v)+'</button>';
  let sc='';for(let i=0;i<=10;i++)sc+=b('score',String(i),DF.score===String(i));
  o.innerHTML='<div role="dialog" aria-modal="true" aria-label="Discharge feedback" style="background:#fff;border-radius:14px;width:min(620px,92vw);padding:20px 22px;display:flex;flex-direction:column;gap:14px;font-size:14px">'
    +'<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">Discharge feedback · '+esc(DF.name)+'</b><button type="button" data-dfx="1" aria-label="Close" style="border:0;background:none;font-size:22px;color:#667085">×</button></div>'
    +'<div><div style="font-weight:600;margin-bottom:6px">From</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+['Patient','Family','Both'].map(v=>b('from',v,DF.from===v)).join('')+'</div></div>'
    +'<div><div style="font-weight:600;margin-bottom:6px">Score (0 to 10)</div><div style="display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:5px">'+sc+'</div>'+(DF.score!==''&&+DF.score<=LOW_MAX?'<div style="color:#B54708;margin-top:6px">Low rating: a follow-up call alert will stay on Today until the call is logged.</div>':'')+'</div>'
    +'<label style="display:flex;flex-direction:column;gap:6px"><span style="font-weight:600">What they said</span><textarea id="dfbSaid" rows="3" style="border:1px solid #D0D8E3;border-radius:8px;padding:8px;font:inherit">'+esc(DF.said)+'</textarea></label>'
    +'<div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" data-dfx="1" class="take" style="background:#fff;color:#344054;border:1px solid #D0D8E3">Cancel</button><button type="button" data-dfs="1" class="take">Save feedback</button></div></div>';
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-dfk],[data-dfx],[data-dfs]');if(!t)return;
  const sEl=document.getElementById('dfbSaid');if(sEl)DF.said=sEl.value;
  if(t.dataset.dfk){DF[t.dataset.dfk]=t.dataset.dfv;drawDfb();return;}
  if(t.dataset.dfx){DF.id='';drawDfb();return;}
  if(DF.score===''){alert('Pick a score first');return;}
  const k='px_dc_'+DF.id,d=jget(k,{});d.form=d.form||{};Object.assign(d.form,{fbFrom:DF.from,fbScore:+DF.score,fbSaid:DF.said});
  const w=new Date();d.fb={on:true,by:'Patient Experience Lead',at:w.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+', '+w.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}).toLowerCase()};d.fbTs=Date.now();
  try{localStorage.setItem(k,JSON.stringify(d));}catch(er){}
  DF.id='';drawDfb();render();
});
function today(){`;

rep(T,[
 ['function today(){\n  try{concernRows();menus.Grievance=menus.Concern=[[\'Open in Grievances\',\'See the full record, update or close it\']];}catch(e){}',
  DOC+"\n  try{if(window.PX_REAL)docRows();else{concernRows();menus.Grievance=menus.Concern=[['Open in Grievances','See the full record, update or close it']];}}catch(e){}"],
 ['      <td style="padding-left:18px;width:120px"><span style="font-weight:700;color:${tcol}">${esc(r.type)}</span></td>\n      <td style="width:240px">',
  '      <td style="width:260px;padding-left:18px">'],
 ['<th style="padding-left:18px">TYPE</th><th>PATIENT</th>','<th style="padding-left:18px">PATIENT</th>'],
 ['<tr><td colspan="5" style="padding:22px;color:#667085">Nothing is due right now. New admissions and the concerns you log will show here.</td></tr>',
  '<tr><td colspan="4" style="padding:22px;color:#667085">No alerts right now. New grievances, low feedback ratings, missed family calls, preference changes and discharge feedback show here.</td></tr>'],
 ["chip('New in 24 h',raw.filter(r=>r.type==='Admission').length,0,'x')]",
  "chip('Action today (amber)',raw.filter(r=>r.items[0].c==='amber').length,0,'x'),chip('Routine (grey)',raw.filter(r=>r.items[0].c==='grey').length,0,'x')]"],
 ["    if(d<=1)raw.push({id:'r'+h.id,type:'Admission'",
  "    if(false)raw.push({id:'r'+h.id,type:'Admission'"],
 ["    if(t.dataset.m==='Took Pt Preferences'){",
  "    if(/^(Follow-up call logged|Call logged elsewhere|Change confirmed with the ward)$/.test(t.dataset.m)){ setState({open:null}); ackSet(t.dataset.act,t.dataset.m); render(); return; }\n"+
  "    if(t.dataset.m==='Record feedback'){ setState({open:null}); openDfb(t.dataset.act.slice(4),t.dataset.actp); return; }\n"+
  "    if(t.dataset.m==='Took Pt Preferences'||t.dataset.m==='Open preferences'){"],
 ["||{id:t.dataset.act,name:t.dataset.actp,","||{id:t.dataset.act.replace(/^[a-z]+:/,''),name:t.dataset.actp,"],
]);
/* preference saves carry a time, so a change after the last ward confirmation shows again */
rep('public/px/patients.html',[
 ["v.__at=new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});all[pid]=v;","v.__at=new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});v.__ts=Date.now();all[pid]=v;"],
 ["cur.__at=new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});all[pid]=cur;","cur.__at=new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});cur.__ts=Date.now();all[pid]=cur;"],
]);
/* the discharge form records when feedback was taken, so only a call after it clears a low rating */
rep('public/px/px-dc-checklist.js',[
 ["if (on && !was) d[k] = { on: true, by: 'Patient Experience Lead', at: when() };","if (on && !was) { d[k] = { on: true, by: 'Patient Experience Lead', at: when() }; if (k === 'fb') d.fbTs = Date.now(); }"],
]);
/* the key uses the document's colours in real mode */
rep(T,[
 ['KEY</b><span><i class="dot" style="background:#E5484D"></i>Safety or rights concern',
  'KEY</b>${window.PX_REAL?\'<span><i class="dot" style="background:#F5A524"></i>Amber <em style="color:#667085">· action today</em></span><span><i class="dot" style="background:#98A2B3"></i>Grey <em style="color:#667085">· routine, with a deadline</em></span>\':\'\'}<span style="display:${window.PX_REAL?\'none\':\'contents\'}"><span><i class="dot" style="background:#E5484D"></i>Safety or rights concern'],
 ['<span><i class="dot" style="background:#12B76A"></i>Action taken</span></div>','<span><i class="dot" style="background:#12B76A"></i>Action taken</span></span></div>'],
]);
