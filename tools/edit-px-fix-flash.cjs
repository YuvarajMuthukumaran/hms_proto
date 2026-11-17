/* 17 Nov 2026: fix the raw-template flash on load (Nikita's bug report).
   The dc-runtime hides <x-dc> with "x-dc{display:none!important}" but only
   injects that style after its own script loads — which happens AFTER
   px-real.js, hms-patients.js and px-grievances.js (real-data fetches), so
   on a slow fetch the raw {{...}} markup is visible the whole time.
   Add the same hide rule as a static <style> in <head> so it's in effect
   from first paint, with no dependency on any script finishing. */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R('<html lang="en"><head>','<html lang="en"><head><style>x-dc{display:none!important}</style>');
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
