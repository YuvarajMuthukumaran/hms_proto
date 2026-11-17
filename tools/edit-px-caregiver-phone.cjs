/* 17 Nov 2026: show the caregiver's number on Random family call.
   1) The 6 demo patients had their phone masked with "XXX" -- unmask them (fake demo data, safe).
   2) Real admitted patients: px-real.js already fetches the caregiver's mobile number from
      Supabase (relatives[0].mobile -> h.mobile) but the patient-list builder here never read
      it, so every real patient fell back to a fabricated "+91 98XXX XXX.." placeholder. Use the
      real h.mobile when present instead. */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}

R("phone: '+91 98188 XXX51'","phone: '+91 98188 40051'");
R("phone: '+91 98110 XXX24'","phone: '+91 98110 73024'");
R("phone: '+91 99100 XXX88'","phone: '+91 99100 61288'");
R("phone: '+91 98450 XXX12'","phone: '+91 98450 93012'");
R("phone: '+91 97400 XXX65'","phone: '+91 97400 28965'");
R("phone: '+91 98990 XXX40'","phone: '+91 98990 51440'");

R("return Object.assign(o, { hmsId: h.id, name: h.name, ini: h.ini, uhid: h.uhid, room: h.room, floor: h.floor, day: day, isNew: day <= 1, admitted: ad.getDate() + ' ' + MN[ad.getMonth()] + ', 10:00 am',\n            doctor: h.doctor, docIni: ini2(String(h.doctor).replace(/^Dr\\.\\s*/, '')), psych: h.psych || 'Not assigned yet', psyIni: h.psych ? ini2(h.psych) : '?', guardian: g, gName: h.nr, gRel: rel, nr: h.nr });",
  "return Object.assign(o, { hmsId: h.id, name: h.name, ini: h.ini, uhid: h.uhid, room: h.room, floor: h.floor, day: day, isNew: day <= 1, admitted: ad.getDate() + ' ' + MN[ad.getMonth()] + ', 10:00 am',\n            doctor: h.doctor, docIni: ini2(String(h.doctor).replace(/^Dr\\.\\s*/, '')), psych: h.psych || 'Not assigned yet', psyIni: h.psych ? ini2(h.psych) : '?', guardian: g, gName: h.nr, gRel: rel, nr: h.nr, phone: h.mobile || o.phone });");

fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
