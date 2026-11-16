/* One-off (13 Nov 2026): the admission date from the HMS roster is read as a local date, so the PX day count equals the HMS one. */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const LOCAL="(function(s){var a=s.split('-');return new Date(+a[0],+a[1]-1,+a[2]);})(h.adm)";
function swap(f,fn){const p=path.join(root,f);let s=fs.readFileSync(p,'utf8');const n=s.split('new Date(h.adm)').length-1;if(n<1)throw new Error('none in '+f);s=s.split('new Date(h.adm)').join(LOCAL);fs.writeFileSync(p,s);console.log(f,n);}
swap('tools/gen-px-patients.cjs');
swap('public/px/patients.html');
const f=path.join(root,'public','px-lead-prototype.html');const s=fs.readFileSync(f,'utf8');
const i0=s.indexOf('<script type="__bundler/template">',100000)+35,i1=s.indexOf('</script>',i0);let t=JSON.parse(s.slice(i0,i1).trim());
const n=t.split('new Date(h.adm)').length-1;if(n!==1)throw new Error('template '+n);t=t.split('new Date(h.adm)').join(LOCAL);
fs.writeFileSync(f,s.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+s.slice(i1));
console.log('ok');
