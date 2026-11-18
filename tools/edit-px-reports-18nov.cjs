/* 18 Nov 2026, Trello "Patient experience: Reports tab" and "connect the px portal to the hms":
   1. Reports: "This week" and "Last month" use today's dates (they said 9 to 15 Nov).
   2. Stay steps are kept (px_steps_v1) when someone marks one done on Patients, and a real patient's steps are no longer shown as done just because of the day count.
   3. Reports: "Your steps on time" are counted from those steps (done of the patients the step is due for), nothing typed. */
const fs = require('fs');
function edit(file, reps) {
  let s = fs.readFileSync(file, 'utf8');
  const crlf = s.indexOf('\r\n') >= 0;
  s = s.split('\r\n').join('\n');
  reps.forEach(function (r) {
    const n = s.split(r[0]).length - 1;
    if (n !== 1) throw new Error(file + ' match ' + n + ': ' + r[0].slice(0, 90));
    s = s.split(r[0]).join(r[1]);
  });
  if (crlf) s = s.split('\n').join('\r\n');
  fs.writeFileSync(file, s);
  console.log('ok', file);
}
edit('public/px/patients.html', [
  ["const S = { mode:'in', view:'list', pid:'rs', rtab:'summary', filter:'all', sort:'attn', nps:null, ratings:{}, consent:null, done:{}, calls:{}, griev:{} };\nfunction set(p){ Object.assign(S,p); render(); }",
   "const S = { mode:'in', view:'list', pid:'rs', rtab:'summary', filter:'all', sort:'attn', nps:null, ratings:{}, consent:null, done:{}, calls:{}, griev:{} };\n/* 18 Nov 2026: the stay steps someone marks done are kept (px_steps_v1), so Reports and the next visit see them */\ntry{S.done=JSON.parse(localStorage.getItem('px_steps_v1')||'{}')||{};}catch(e){}\nfunction set(p){ Object.assign(S,p); if(p&&p.done){try{localStorage.setItem('px_steps_v1',JSON.stringify(S.done));}catch(e){}} render(); }"],
  ["P.forEach(p=>{ const o=p.st; const d0=p.day>=1?'d':o[0];",
   "/* real patients (18 Nov 2026): a step is done only when someone marked it. The status comes from the day count: late once its day is past, due today, or coming up */\nif(window.PX_REAL){const OFFS=[0,0,0,0,2,2,1,3,7,7,7,99,99];P.forEach(p=>{p.st=[...String(p.st||'')].map((c,i)=>{if(i>=OFFS.length)return c;const due=OFFS[i];return p.day>due?'l':(p.day===due?'t':'u');}).join('');});}\nP.forEach(p=>{ const o=p.st; const d0=(p.day>=1&&!window.PX_REAL)?'d':o[0];"],
  ["  p.st = o[0]+o[1]+(p.id==='rs'?'l':d0)+d0+(p.id==='dk'?'l':met)+o.slice(2); });",
   "  if(!window.PX_REAL)p.st = o[0]+o[1]+(p.id==='rs'?'l':d0)+d0+(p.id==='dk'?'l':met)+o.slice(2); });"]
]);
edit('public/px/reports.html', [
  ["const PER={\n week:{label:'This week',dates:'9 to 15 Nov 2026',vs:'vs last week',",
   "/* 18 Nov 2026: the period labels are today's week (Monday to Sunday) and last calendar month */\nconst MN3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];\nconst WK=(function(){const t=new Date();t.setHours(0,0,0,0);const m=new Date(t);m.setDate(t.getDate()-((t.getDay()+6)%7));const e=new Date(m);e.setDate(m.getDate()+6);return m.getDate()+(m.getMonth()!==e.getMonth()?' '+MN3[m.getMonth()]:'')+' to '+e.getDate()+' '+MN3[e.getMonth()]+' '+e.getFullYear();})();\nconst MO=(function(){const t=new Date(),a=new Date(t.getFullYear(),t.getMonth()-1,1),b=new Date(t.getFullYear(),t.getMonth(),0);return '1 to '+b.getDate()+' '+MN3[a.getMonth()]+' '+a.getFullYear();})();\nconst PER={\n week:{label:'This week',dates:WK,vs:'vs last week',"],
  [" month:{label:'Last month',dates:'1 to 31 Oct 2026',vs:'vs the month before',", " month:{label:'Last month',dates:MO,vs:'vs the month before',"],
  ["const NPAT=window.PX_REAL?Math.max(1,(window.HMS_PATIENTS.patients||[]).length):34;",
   "const NPAT=window.PX_REAL?Math.max(1,(window.HMS_PATIENTS.patients||[]).length):34;\n/* steps on time, counted from the stay steps marked done on Patients (px_steps_v1): done of the patients the step is already due for. Real mode only. */\nif(window.PX_REAL){try{const DONE=JSON.parse(localStorage.getItem('px_steps_v1')||'{}')||{},PT=(window.HMS_PATIENTS.patients||[]);const IDX={'Family met at admission':[0,0],'Rights explained to patient and rep':[3,0],'Met the patient on day 1 or 2':[4,2],'Preferences taken':[5,2],'Discharge meeting and feedback':[12,99]};\n  PER.week.steps=PER.week.steps.map(s=>{const m=IDX[s[0]];if(!m)return s;const due=PT.filter(p=>(+p.day||0)>=m[1]);const ok=due.filter(p=>DONE[p.id+m[0]]).length;return [s[0],due.length?Math.round(ok/due.length*100):0,0];});}catch(e){}}"]
]);
