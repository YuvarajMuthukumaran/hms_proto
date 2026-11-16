/* One-off (13 Nov 2026), card 151 and 131: "no session" counts from the last signed session note against the therapy plan (3 a week, so after 3 days); a patient with no session note yet is flagged "no therapy session recorded" only from day 7 (the plan rule). Patients on leave or discharged today are skipped. */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','legacy','js','91-lead-psy-today-13nov-js.js');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
function R(a,b){if(s.split(a).length!==2)throw new Error('match: '+a.slice(0,70));s=s.split(a).join(b);}
R("  const hasScore=","  /* the therapy plan sets 3 sessions a week; flag once that is overdue. No signed note yet = flag from day 7. Discharge today and patients out of the ward are skipped. */\n  const hasNote=p=>{try{return ((psyPx(p.id).sn||{}).notes||[]).some(n=>n.status==='signed');}catch(e){return false;}};\n  const noSess=p=>{if(!doc(p)||p.dischargeToday)return false;const d=+p.day||0;return hasNote(p)?lastSess(p)>=3:d>=7;};\n  const hasScore=");
R("const nosess=all.filter(p=>(+p.day||0)>=5&&!!doc(p)&&lastSess(p)>=3);","const nosess=all.filter(noSess);");
R("why:'No session for '+lastSess(p)+' days'","why:hasNote(p)?'No session for '+lastSess(p)+' days (plan: 3 a week)':'No therapy session recorded yet, day '+(+p.day||0)");
R("(f==='nosess'&&(+p.day||0)>=5&&lastSess(p)>=3)","(f==='nosess'&&noSess(p))");
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);console.log('ok');
