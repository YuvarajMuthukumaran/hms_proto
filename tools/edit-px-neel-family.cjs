/* One-off (13 Nov 2026), card 144: Neel's nominated representative is Ananya Bose (sister) everywhere in PX, as in the HMS. */
const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','public','px-lead-prototype.html');const s=fs.readFileSync(f,'utf8');
const i0=s.indexOf('<script type="__bundler/template">',100000)+35,i1=s.indexOf('</script>',i0);let t=JSON.parse(s.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a);t=t.split(a).join(b);}
R("['Updates go to','Anjali Bose (mother)']","['Updates go to','Ananya Bose (sister)']");
R("raisedBy: 'Anjali Bose, mother'","raisedBy: 'Ananya Bose, sister'");
fs.writeFileSync(f,s.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+s.slice(i1));
console.log('ok');
