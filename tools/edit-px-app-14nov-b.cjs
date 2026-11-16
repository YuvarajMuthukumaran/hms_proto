const fs=require('fs');
const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
/* the old Setting button at the bottom of the menu did nothing: Setting is now a menu item with its own page */
const a=t.indexOf('  <button class="nav" type="button"><svg'),b=t.indexOf('Setting</button>\n',a);
if(a<0||b<0||b-a>900)throw new Error('placeholder not found '+a+' '+b);
t=t.slice(0,a)+t.slice(b+'Setting</button>\n'.length);
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
console.log('ok');
/* Saturday and Sunday are covered: Kanika works Saturday, Prabh covers Sunday */
const c='public/px/cal-core.js';let s=fs.readFileSync(c,'utf8');const o="const PAT={ka:'OMMMMMO',pr:'MEEEEEO',px:'OMMMMMO'};";if(!s.includes(o))throw new Error('PAT');
s=s.replace(o,"const PAT={ka:'OMMMMMM',pr:'MEEEEEO',px:'OMMMMMO'};");
s=s.replace("const PAT={ka:'OMMMMMM',pr:'MEEEEEO',px:'OMMMMMO'};","const PAT={ka:'OMMMMMM',pr:'MMEEEEO',px:'OMMMMMO'};");
fs.writeFileSync(c,s);
