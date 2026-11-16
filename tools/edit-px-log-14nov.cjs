/* 14 Nov 2026, card 123: the Log panel's patient picker can be searched by name, room or UHID (admitted patients only: the 17 on the HMS list) */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R('<div class="field"><label for="lp">Patient</label><sc-raw-select id="lp"','<div class="field"><label for="lpq">Patient</label><input id="lpq" class="search" type="search" placeholder="Search by name, room or UHID" value="{{logQ}}" sc-camel-on-input="{{setLogQ}}" aria-label="Search admitted patients"><sc-raw-select id="lp"');
R("patientOpts: P.map(function (p) { return { id: p.id, label: p.name + ' · ' + p.room }; }),",
"logQ: s.logQ || '', setLogQ: function (e) { var q = String(e.target.value || ''), ql = q.trim().toLowerCase(), hit = ql ? P.filter(function (p) { return (p.name + ' ' + p.room + ' ' + p.uhid).toLowerCase().indexOf(ql) >= 0; }) : []; self.setState({ logQ: q, form: hit.length ? Object.assign({}, self.state.form, { pid: hit[0].id }) : self.state.form }); },\n      patientOpts: (function () { var ql = String(s.logQ || '').trim().toLowerCase(); return P.filter(function (p) { return !ql || p.id === s.form.pid || (p.name + ' ' + p.room + ' ' + p.uhid).toLowerCase().indexOf(ql) >= 0; }).map(function (p) { return { id: p.id, label: p.name + ' · ' + p.room + ' · ' + p.uhid }; }); })(),");
R("closeLog: function () { self.setState({ logOpen: false }); },","closeLog: function () { self.setState({ logOpen: false, logQ: '' }); },");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
