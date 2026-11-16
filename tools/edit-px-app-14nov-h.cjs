/* 14 Nov 2026 (manual audit, data matches across pages): the Patient Experience app's own patient list named a different family representative
   from the HMS record for five patients (Neel, Meera, Varun, Kavya, Rahul). It now uses the HMS names and relations. */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function RA(a,b,n){const c=t.split(a).length-1;if(c!==n)throw new Error('match '+c+' (want '+n+'): '+a.slice(0,80));t=t.split(a).join(b);}
/* Neel Bose: nominated representative is Ananya Bose, sister */
RA("Anjali Bose (mother)","Ananya Bose (sister)",1);
RA("gName: 'Anjali Bose', gRel: 'Mother', nr: 'Anjali Bose'","gName: 'Ananya Bose', gRel: 'Sister', nr: 'Ananya Bose'",1);
RA("['Signed by','Anjali Bose, 6 Nov']","['Signed by','Ananya Bose, 6 Nov']",1);
/* Meera Iyer: Gopal Iyer, husband */
RA("S. Iyer (father)","Gopal Iyer (husband)",2);
RA("gName: 'S. Iyer', gRel: 'Father', nr: 'S. Iyer'","gName: 'Gopal Iyer', gRel: 'Husband', nr: 'Gopal Iyer'",1);
RA("S. Iyer, father","Gopal Iyer, husband",2);
/* Varun Rao: Lakshmi Rao, mother */
RA("Kiran Rao (brother)","Lakshmi Rao (mother)",2);
RA("gName: 'Kiran Rao', gRel: 'Brother', nr: 'Kiran Rao'","gName: 'Lakshmi Rao', gRel: 'Mother', nr: 'Lakshmi Rao'",1);
RA("['Signed by','Kiran Rao, 29 Oct']","['Signed by','Lakshmi Rao, 29 Oct']",1);
RA("Kiran Rao, brother","Lakshmi Rao, mother",2);
/* Kavya Menon: Lata Menon */
RA("Latha Menon","Lata Menon",6);
/* Rahul Sethi: Kamal Sethi, father */
RA("Vikas Sethi","Kamal Sethi",9);
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
