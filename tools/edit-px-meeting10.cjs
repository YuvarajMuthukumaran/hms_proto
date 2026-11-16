/* One-off (13 Nov 2026): hide the "Older pages" group from the PX menu (Nikita). The pages themselves stay in the app. */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
const a="NZ.nav = M5main.map(M5mk).concat([{ label: 'Older pages', count: 0, hasCount: false, cls: 'sub m5-old-h', go: function () {} }]).concat(M5old.map(function (n) { var o = M5mk(n); o.cls += ' m5-old'; return o; }));";
if(t.split(a).length!==2)throw new Error('no match');
t=t.split(a).join("NZ.nav = M5main.map(M5mk); /* MEETING10: older pages hidden */");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
console.log('ok');
