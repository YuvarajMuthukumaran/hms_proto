/* One-off (13 Nov 2026), Nikita's QA round on cards 134, 147: UHID only (no TH numbers), record dates relative to today. */
const fs=require('fs'),path=require('path');
function ed(f,pairs){const p=path.join(__dirname,'..','public','legacy','js',f);let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');for(const [a,b] of pairs){if(s.split(a).length!==2)throw new Error(f+': '+a.slice(0,70));s=s.split(a).join(b);}if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);new Function(s);}
ed('01-portal-main.js',[
["id:p=>`${p.age}/${p.sex} ${p.room.replace(/^Room\\s*/i,'R ')} · TH-${1040+PTS.indexOf(p)}`","id:p=>`${p.age}/${p.sex} ${p.room.replace(/^Room\\s*/i,'R ')}`"],
["${th?' · TH-'+th:''}","${''}"],
['<span class="muted" style="font-weight:600">TH-1042 · 23/M R 213 A</span>','<span class="muted" style="font-weight:600">23/M R 213 A</span>']]);
ed('14-pt-context-js.js',[
["const PT_TODAY=new Date(2026,9,24); // demo \"today\": Neel is on day 6, admitted 18 Oct","const PT_TODAY=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());})(); // today (13 Nov QA): every record date is relative to today, Neel's literal 18 Oct admission gives day 26"],
["['TH-1042 · 29/M',id.th+' · '+id.age+'/'+id.sex+' '+String(p.room||'').replace(/^Room\\s*/i,'R ')]","['23/M R 213 A',id.age+'/'+id.sex+' '+String(p.room||'').replace(/^Room\\s*/i,'R ')]"]]);
console.log('ok');
