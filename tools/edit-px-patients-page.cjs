/* One-off (13 Nov 2026), cards 144 and 147: public/px/patients.html shows the HMS patient list (17). The nine PX patients keep their PX details, with identity from the HMS. */
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','public','px','patients.html');let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
function R(a,b){if(s.split(a).length!==2)throw new Error('match: '+a.slice(0,70));s=s.split(a).join(b);}
if(s.indexOf('hms-patients.js')<0){const i=s.indexOf('<script');s=s.slice(0,i)+'<script src="hms-patients.js"></script>\n'+s.slice(i);}
const MERGE=`
/* the list is the HMS list (13 Nov, cards 144 and 147): same patients, UHID, room, day, doctor, psychologist, nominated representative */
(function(){
  const H=window.HMS_PATIENTS; if(!H||!H.patients) return;
  const t0=new Date(); t0.setHours(0,0,0,0);
  const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const WARD={f1:'De-addiction ward',f2:'Male ward',f3:'Female ward'};
  const by={}; P.forEach(x=>by[x.name]=x);
  const out=H.patients.map(h=>{
    const day=h.adm?Math.max(0,Math.floor((t0-new Date(h.adm))/864e5)):h.day, ad=new Date(t0); ad.setDate(ad.getDate()-day);
    const base=by[h.name], rel=String(h.nrRel||'Relative').toLowerCase();
    const o=base?Object.assign({},base):{ id:h.id, tags:[], type:'Standard', ph:'98XXX XXX'+String(10+h.name.length*7%89), bk:'Not given', dis:'Not set',
      st:(day>=2?'ddd':day>=1?'dtu':'tuu')+'uuuuuuu', upd:'0 of '+Math.max(1,day)+' days', last:'No contact logged yet', next:'Family meeting at admission', attn:0, open:0, prefs:false };
    return Object.assign(o,{ id:base?base.id:h.id, hmsId:h.id, name:h.name, ini:h.ini, as:h.age+'/'+h.sex, room:String(h.room).replace(/^Room\\s*/,''), ward:WARD[h.floor]||'Male ward', day:day, sec:'Sec '+h.sec, uhid:h.uhid,
      dr:h.doctor, ps:h.psych||'Add psychologist', rep:h.nr, rel:rel, adm:ad.getDate()+' '+MN[ad.getMonth()]+', 10:00 am',
      tags:(o.tags||[]).filter(t=>!/New · 24 h/.test(t)).concat(day<=1?['New · 24 h']:[]) });
  });
  P.length=0; out.forEach(x=>P.push(x));
})();
`;
const marker="P.forEach(p=>{ const o=p.st; const d0=p.day>=1?'d':o[0];";
R(marker,MERGE.trimStart()+marker);
if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(p,s);console.log('ok');
