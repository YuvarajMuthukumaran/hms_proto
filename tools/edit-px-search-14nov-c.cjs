const fs=require('fs');let file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("self.setState({ searchOpen: false, topQ: '', screen: 'patients2' }); }; NZ.notifOpen","self.setState({ searchOpen: false, topQ: '', screen: 'patients2' }); }; self.__topKey = NZ.topKey; if (!self.__kd) { self.__kd = 1; document.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && ev.target && ev.target.classList && ev.target.classList.contains('tb-search')) self.__topKey(ev); }); } NZ.notifOpen");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
