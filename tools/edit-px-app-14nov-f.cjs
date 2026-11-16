/* 14 Nov 2026 (audit): pages inside the Patient Experience app can ask the app to change page (chips on Today, patient names). Message {pxNav:'grievances'|'patients'|'reports'|..., pxOpen:'Patient name'} */
const fs=require('fs');const file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
const add="if (!window.__pxNavL) { window.__pxNavL = 1; window.addEventListener('message', function (ev) { var d = ev && ev.data; if (!d || !d.pxNav) return; var map = { today: 'today2', patients: 'patients2', rounds: 'rounds2', grievances: 'concerns', calendar: 'calendar2', training: 'training2', reports: 'reports2', setting: 'setting2' }; var s = map[d.pxNav]; if (!s) return; if (d.pxNav === 'patients' && d.pxOpen) { try { localStorage.setItem('pxopen', d.pxOpen); } catch (x) {} var fr = document.querySelector('iframe[title=Patients]'); if (fr && fr.contentWindow) { try { fr.contentWindow.postMessage({ pxOpen: d.pxOpen }, '*'); } catch (x) {} } } self.setState({ screen: s, searchOpen: false, topQ: '' }); }); } ";
R("NZ.topKey = function (e) {",add+"NZ.topKey = function (e) {");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));console.log('ok');
