/* ---- 19 Nov: family calls and updates (all roles), sample discharge, preferences form ---- */
function pxTok(){try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^sb-.*-auth-token$/.test(k)){const v=JSON.parse(localStorage.getItem(k)||'null');const t=v&&(v.access_token||(v.currentSession&&v.currentSession.access_token));if(t)return t;}}}catch(e){}return '';}
function loadFC(){ if(window.PX_FC_TRIED||!window.PX_REAL)return; window.PX_FC_TRIED=1;
  fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).then(j=>{ if(!j||!j.supabase)return;
    return fetch(j.supabase.url+'/rest/v1/rpc/px_family_calls',{method:'POST',headers:{apikey:j.supabase.key,Authorization:'Bearer '+(pxTok()||j.supabase.key),'Content-Type':'application/json'},body:'{}'})
      .then(r=>r.ok?r.json():[]).then(rows=>{const m={};(rows||[]).forEach(r=>{m[r.patient_id]=Array.isArray(r.log)?r.log:[];});window.PXFC=m;try{render();}catch(e){}}); }).catch(()=>{}); }
const MON={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
function atDate(s){ s=String(s||''); if(/^today/i.test(s))return new Date(new Date().setHours(0,0,0,0)); if(/^yesterday/i.test(s)){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-1);return d;}
  const m=s.match(/(\d{1,2})\s+([A-Za-z]{3})/); if(!m||!(m[2] in MON))return null; const n=new Date(); let d=new Date(n.getFullYear(),MON[m[2]],+m[1]); if(d>n)d=new Date(n.getFullYear()-1,MON[m[2]],+m[1]); return d; }
function family(p){
  loadFC();
  const real=!!window.PX_REAL, fc=((window.PXFC||{})[p.id]||[]);
  const isUp=e=>/whatsapp|update sent|weekly update|daily update|sent to family/i.test(String(e.what||'')+' '+String(e.channel||''));
  const calls=[...(S.calls[p.id]||[]),
    ...fc.filter(e=>!isUp(e)).map(e=>[e.at||'',e.what||'Family call',(e.by||'Care team'),e.note||e.outcome||''])];
  if(!real) calls.push(['Today, 7:50 am','Inbound','Front desk','Brother asked about the night incident · logged as grievance G-0145'],['10 Nov, 6:30 pm','Random call 1 of 2','Kanika','Happy with the room, wants more updates on sleep · no concern'],['9 Nov, 11:00 am','72-hour call',p.dr,'Early progress shared · 9 min'],['7 Nov, 10:15 am','24-hour call',p.dr,'Settled well, plan confirmed · 6 min']);
  let ups=fc.filter(isUp).map(e=>[e.at||'','Sent by '+(e.by||p.ps),e.note||'','ok']);
  if(!real) ups=[['Tue 11 Nov','Sent 7:55 pm','Joined music group, ate full dinner','ok'],['Mon 10 Nov','Sent 8:20 pm','Calmer than yesterday, slept 6 hours','late'],['Sun 9 Nov','Sent 7:40 pm','Calmer than yesterday, slept 6 hours','copy'],['Sat 8 Nov','Not sent','','miss']];
  ups=ups.slice(0,30);
  const from=S.upFrom&&S.upPid===p.id?S.upFrom:'';
  const shown=from?ups.filter(u=>{const d=atDate(u[0]);return !d||d>=new Date(from+'T00:00:00');}):ups;
  const flag={ok:['On time','green'],late:['After 8 pm','amber'],copy:['Same as next day','amber'],miss:['Missed','amber']};
  return '<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:14px;align-items:start">'+
  '<section style="background:#fff;border:1px solid #E3EAF2;border-radius:12px;overflow:hidden"><div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center"><div><b>Family call log</b><div style="font-size:12px;color:#667085">Every call by the psychologist, the psychiatrist and Patient Experience</div></div><button class="btn" style="height:34px" data-call="'+p.id+'" data-n="'+(p.st[10]==='d'?2:1)+'">'+I.phone+'Log a random call</button></div>'+
    (calls.length?calls.map(c=>'<div style="padding:12px 16px;border-top:1px solid #EEF2F6;display:grid;grid-template-columns:130px 150px minmax(0,1fr);gap:10px;font-size:13px"><span style="color:#667085">'+esc(c[0])+'</span><span><b>'+esc(c[1])+'</b><div style="font-size:12px;color:#667085">'+esc(c[2])+'</div></span><span>'+esc(c[3])+(c[4]?'<div style="margin-top:4px">'+c[4]+'</div>':'')+'</span></div>').join(''):'<div style="padding:14px 16px;border-top:1px solid #EEF2F6;color:#667085;font-size:13px">No family call logged yet.</div>')+
    '<div style="padding:10px 16px;border-top:1px solid #EEF2F6;font-size:12px;color:#667085">Inbound calls are logged by front desk or RMO (after 7 pm).</div></section>'+
  '<div style="display:flex;flex-direction:column;gap:14px"><section style="background:#fff;border:1px solid #E3EAF2;border-radius:12px;overflow:hidden"><div style="padding:14px 16px"><b>Family Updates via WhatsApp</b><div style="font-size:12px;color:#667085">Sent by '+esc(p.ps||'the psychologist')+' · you only check them · '+shown.length+(from?' from '+esc(from):'')+' of '+ups.length+'</div>'+
    '<div style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:13px"><label for="upD" style="color:#475467">From date</label><input type="date" id="upD" value="'+esc(from)+'" style="height:32px;border:1px solid #D6DEE8;border-radius:8px;padding:0 8px;font:inherit">'+(from?'<button class="mini" data-upclear="1">All dates</button>':'')+'</div></div>'+
    '<div style="max-height:340px;overflow:auto">'+(shown.length?shown.map(u=>'<div style="padding:10px 16px;border-top:1px solid #EEF2F6;font-size:13px;display:flex;justify-content:space-between;gap:10px"><span><b>'+esc(u[0])+'</b> · '+esc(u[1])+(u[2]?'<div style="font-size:12px;color:#667085">'+esc(u[2])+'</div>':'')+'</span>'+pill(flag[u[3]][0],flag[u[3]][1])+'</div>').join(''):'<div style="padding:14px 16px;border-top:1px solid #EEF2F6;color:#667085;font-size:13px">No update '+(from?'on or after this date.':'sent yet.')+'</div>')+'</div>'+
    '<div style="padding:10px 16px;border-top:1px solid #EEF2F6"><button class="mini">Nudge '+esc(p.ps||'the psychologist')+'</button></div></section></div></div>';
}
function dis(p){
  if(p.dis==='Not set'&&S.sampleDis!==p.id) return '<section style="background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:18px;color:#475467;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span>Discharge not planned yet. This opens when the psychiatrist sets a discharge date and front desk confirms it.</span><button class="btn" data-sample="'+p.id+'">See a sample</button></section>';
  if(p.dis==='Not set') return '<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#1D4ED8;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><span>Sample view with example answers, so you can see how discharge and feedback will look. Nothing here is saved to this patient.</span><button class="mini" data-sample="">Hide the sample</button></div>'+dis0(Object.assign({},p,{dis:'Sample'}));
  return dis0(p);
}
const PF_GROUPS=[
 ['Diet','Kitchen · Ward',[['Diet type','sel',['Vegetarian','Non-vegetarian','Eggetarian','Jain','Other']],['Foods to avoid','txt'],['Likes, dislikes, fasting days','txt']]],
 ['Calls and visits','Front desk · Ward',[['Phone calls (hospital phone)','txt'],['Visits','txt']]],
 ['Approved visitors','Front desk · Security',[['Visitor 1 (name, relation, allowed or not)','txt'],['Visitor 2','txt'],['Visitor 3','txt']]],
 ['Room and belongings','Front desk · Housekeeping',[['Room','txt'],['Belongings','txt']]],
 ['Activities and outings','Ward · Activity team',[['Activities allowed','txt'],['Outings','txt']]],
 ['Communication with family','Patient experience · Billing',[['Language for updates','txt'],['Clinical updates go to','txt'],['Billing contact','txt'],['Do not share with','txt']]],
 ['Other requests','Admin · Ward',[['Religious or cultural needs','txt'],['Routine','txt']]]];
function pfAll(){try{return JSON.parse(localStorage.getItem('px_prefs_v2')||'{}')||{};}catch(e){return {};}}
function pfOpen(pid){ const p=P.find(x=>x.id===pid); if(!p)return; const cur=pfAll()[pid]||{}; document.getElementById('pfOv')&&document.getElementById('pfOv').remove();
  const o=document.createElement('div'); o.id='pfOv'; o.style.cssText='position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:80;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px';
  o.innerHTML='<div style="background:#fff;border-radius:16px;width:min(760px,100%);padding:20px;display:flex;flex-direction:column;gap:14px"><div style="display:flex;justify-content:space-between;gap:10px"><div><b style="font-size:18px">Preferences · '+esc(p.name)+'</b><div style="font-size:12px;color:#667085">Same form as the psychiatrist\'s Patient Experience tab. Take it with the RMO, the patient and the family.</div></div><button class="mini" id="pfX">Close</button></div>'+
   PF_GROUPS.map((g,gi)=>'<section style="border:1px solid #E3EAF2;border-radius:12px;padding:14px"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+g[0]+'</b><span style="font-size:12px;color:#667085">Seen by '+g[1]+'</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px">'+
     g[2].map((f,fi)=>{const k=gi+'.'+fi,v=cur[k]||'';return '<label style="display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:600;color:#475467">'+f[0]+(f[1]==='sel'?'<select data-pf="'+k+'" style="height:36px;border:1px solid #D6DEE8;border-radius:10px;padding:0 8px;font:inherit"><option value=""></option>'+f[2].map(o=>'<option'+(v===o?' selected':'')+'>'+o+'</option>').join('')+'</select>':'<textarea data-pf="'+k+'" rows="2" style="border:1px solid #D6DEE8;border-radius:10px;padding:8px 10px;font:inherit;font-weight:400">'+esc(v)+'</textarea>')+'</label>';}).join('')+'</div></section>').join('')+
   '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="mini" id="pfC">Cancel</button><button class="btn pri" id="pfS">Save preferences</button></div></div>';
  document.body.appendChild(o);
  o.querySelector('#pfX').onclick=o.querySelector('#pfC').onclick=()=>o.remove();
  o.querySelector('#pfS').onclick=()=>{const all=pfAll(),v={};o.querySelectorAll('[data-pf]').forEach(e=>{if(e.value.trim())v[e.dataset.pf]=e.value.trim();});v.__at=new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});all[pid]=v;try{localStorage.setItem('px_prefs_v2',JSON.stringify(all));}catch(e){}o.remove();render();};
}
function prefs(p){
  const f=pfAll()[p.id];
  if(f) return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;font-size:13px;color:#475467"><span>Same record as the psychiatrist\'s Patient Experience tab. Last saved '+esc(f.__at||'')+'.</span><button class="btn" data-pfopen="'+p.id+'">Edit preferences</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:14px">'+
    PF_GROUPS.map((g,gi)=>'<section style="background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:14px 16px"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+g[0]+'</b><span style="font-size:12px;color:#667085">Seen by '+g[1]+'</span></div><div style="display:grid;grid-template-columns:170px 1fr;gap:6px 12px;font-size:13px;margin-top:10px">'+g[2].map((x,fi)=>'<span style="color:#667085">'+x[0]+'</span><span>'+(f[gi+'.'+fi]?esc(f[gi+'.'+fi]):'<span style="color:#98A2B3">Not set</span>')+'</span>').join('')+'</div></section>').join('')+'</div>';
  if(p.prefs&&!window.PX_REAL) return prefs0(p);
  return '<section style="background:#FFFAEB;border:1px solid #FEDF89;border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px"><div><b>Preferences not taken yet</b><div style="font-size:13px;color:#475467">Due by Day 2. Take them with the RMO, the patient and the family. Same form the psychiatrist sees under Patient Experience.</div></div><button class="btn pri" data-pfopen="'+p.id+'">Take preferences</button></section>';
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-sample],[data-pfopen],[data-upclear]');if(!t)return;
  if(t.hasAttribute('data-sample')){S.sampleDis=t.dataset.sample||null;render();}
  else if(t.hasAttribute('data-pfopen'))pfOpen(t.dataset.pfopen);
  else{S.upFrom='';render();}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='upD'){S.upFrom=e.target.value;S.upPid=S.pid;render();}});
