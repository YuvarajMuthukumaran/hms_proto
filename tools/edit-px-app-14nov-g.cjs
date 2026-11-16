/* 14 Nov 2026 (manual audit, phone width): every menu button in the Patient Experience app was 760 px wide on a phone (width:100% of a shrink-wrapped row),
   so only "Today" showed and the other pages were a long swipe away. The buttons now size to their text. */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R(".app .sub{min-height:40px}",".app .sub{min-height:40px;width:auto!important}");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
