/* One-off: show the Patient Experience Lead page at 75% (the team found it too big). */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
if(t.includes('html{zoom:.75}'))throw new Error('already applied');
const m='.btn.lz-big{height';
if(t.split(m).length!==2)throw new Error('anchor');
t=t.split(m).join('html{zoom:.75}\n'+m);
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n  '+src.slice(i1));
console.log('ok');
