/* One-off (13 Nov 2026), cards 144 and 147: PX Today, Rounds and Calendar read the HMS identity (room, day, doctor, nominated representative, UHID) for the patients they show. */
const fs=require('fs'),path=require('path');
const D=f=>path.join(__dirname,'..','public','px',f);
function ed(f,pairs){let s=fs.readFileSync(D(f),'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');for(const [a,b] of pairs){if(s.split(a).length!==2)throw new Error(f+': '+a.slice(0,70));s=s.split(a).join(b);}
  if(f.endsWith('.html')&&s.indexOf('hms-patients.js')<0){const i=s.indexOf('<script');s=s.slice(0,i)+'<script src="hms-patients.js"></script>\n'+s.slice(i);}
  if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(D(f),s);}
ed('today.html',[
["window.CM_PATIENTS=TP;","window.CM_PATIENTS=TP;\nif(window.HMSX)HMSX.fix(TP,(x,h)=>{x.rep=h.nr;x.rel=String(h.nrRel).toLowerCase();x.room=HMSX.room(h);x.day=HMSX.day(h);x.dr=h.doctor;});"],
["  const rows=raw.map((r,idx)=>{","  if(window.HMSX)HMSX.fix(raw,(r,h)=>{r.sub=h.age+'/'+h.sex+' · Day '+HMSX.day(h)+' · '+h.room;});\n  const rows=raw.map((r,idx)=>{"]]);
ed('rounds.html',[
["window.CM_PATIENTS=[","window.CM_PATIENTS_RAW=[ /* identity is then overwritten from the HMS list */"],
]);
let r=fs.readFileSync(D('rounds.html'),'utf8');const crlf=r.includes('\r\n');r=r.replace(/\r\n/g,'\n');
const i=r.indexOf("window.CM_PATIENTS_RAW=[");const j=r.indexOf('\n];',i)+3;if(i<0||j<i)throw new Error('rounds markers');
r=r.slice(0,j)+"\nwindow.CM_PATIENTS=window.CM_PATIENTS_RAW;\nif(window.HMSX)HMSX.fix(window.CM_PATIENTS,(x,h)=>{x.rep=h.nr;x.rel=String(h.nrRel).toLowerCase();x.room=HMSX.room(h);x.day=HMSX.day(h);x.dr=h.doctor;});"+r.slice(j);
if(crlf)r=r.replace(/\n/g,'\r\n');fs.writeFileSync(D('rounds.html'),r);
let c=fs.readFileSync(D('cal-core.js'),'utf8');
const a="  const STAYS=[";if(c.split(a).length!==2)throw new Error('cal');
fs.writeFileSync(D('cal-core.js'),c);
console.log('ok');
