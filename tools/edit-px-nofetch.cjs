/* One-off (13 Nov 2026), card 142: the PX prototype makes no network call for "Send to call centre". It shows the demo message only. */
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','public','px-lead-prototype.html');
const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';
const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
const FAKE="Promise.resolve({ json: function () { return Promise.resolve({ ok: true, simulated: true }); } })";
R("fetch('/api/send/callcentre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: txt, by: 'Patient experience' }) })",FAKE);
R("fetch('/api/send/callcentre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: fuTomorrowText, by: 'Patient experience' }) })",FAKE);
R("'Demo mode: would send ' + f.name + ' to the call-centre group. Nothing was sent.'","'Demo mode: would send to the call-centre group. Nothing was sent.'");
if(t.indexOf('/api/send')>=0)throw new Error('still references /api/send');
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
console.log('ok');
