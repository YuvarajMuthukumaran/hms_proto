/* 14 Nov 2026, card 130 Calendar: family meetings come from every HMS patient's stay (same 17 patients, room, day), not a hard-coded list of 7; times vary per patient */
const fs=require('fs'),f='public/px/cal-core.js';let s=fs.readFileSync(f,'utf8');
function rep(a,b){if(!s.includes(a))throw new Error('nf '+a.slice(0,60));s=s.split(a).join(b);}
rep("  if(window.HMSX){STAYS.forEach(s=>{const h=HMSX.by[s.p];if(h){s.room=HMSX.room(h);s.admit=-HMSX.day(h);}});}",
"  /* every patient on the HMS list has a stay: room, day and floor come from the HMS; discharge days are the ones the ward has planned */\n  if(window.HMSX&&window.HMS_PATIENTS){\n    const DIS={rahul:0,dev:0,yash:2,varun:6},SLOTS=['11:00','12:00','13:00','14:00','15:00'];\n    STAYS.length=0;\n    HMS_PATIENTS.patients.forEach((h,i)=>STAYS.push({p:h.name,room:HMSX.room(h),floor:h.floor==='f1'?'Floor 1':h.floor==='f3'?'Floor 3':'Floor 2',admit:-HMSX.day(h),dis:DIS[h.id]!==undefined?DIS[h.id]:null,who:h.floor==='f2'?'ka':'pr',time:SLOTS[i%SLOTS.length]}));\n  }");
rep("mk('admission',addDays(a,1),'13:00','Admission family meeting (within 24 h)');","mk('admission',addDays(a,1),s.time||'13:00','Admission family meeting (within 24 h)');");
rep("mk('week 1',addDays(a,7),'13:00','End of week 1 family meeting');","mk('week 1',addDays(a,7),s.time||'13:00','End of week 1 family meeting');");
fs.writeFileSync(f,s);console.log('ok');
