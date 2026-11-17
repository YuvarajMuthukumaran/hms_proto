/* 17 Nov 2026: remove the Setting item from the Patient Experience Lead main menu (per owner request) */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['rounds2', 'Rounds', 0], ['concerns', 'Grievances', openC.length], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0], ['setting2', 'Setting', 0]];",
"var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['rounds2', 'Rounds', 0], ['concerns', 'Grievances', openC.length], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0]];");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
