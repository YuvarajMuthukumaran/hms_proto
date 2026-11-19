/* 19 Nov 2026 (owner): Group sessions leaves the Patient Experience Lead menu only (psychologist keeps it). */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
const a="['groups2', 'Group sessions', 0], ";const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n);
t=t.split(a).join('');
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
