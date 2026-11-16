/* 14 Nov 2026, cards 117 / 122: calls, notes and compliments logged with the + Log button are saved (px_calls_main_v1, shared like every px_ key), so they survive a refresh, show on another device and reach Reports */
const fs=require('fs');let file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("extraConcerns: [], calls: {}, checks: {},","extraConcerns: [], calls: (function () { try { return JSON.parse(localStorage.getItem('px_calls_main_v1') || '{}') || {}; } catch (e) { return {}; } })(), checks: {},");
R("    try { if (window.PXG) { window.PXG.sync(this, d.C); window.PXG.start(this); } } catch (e) {}\n","    try { if (window.PXG) { window.PXG.sync(this, d.C); window.PXG.start(this); } } catch (e) {}\n    try {\n      var cj = JSON.stringify(s.calls || {});\n      if (self.__callsSaved !== cj) { self.__callsSaved = cj; if (localStorage.getItem('px_calls_main_v1') !== cj) localStorage.setItem('px_calls_main_v1', cj); }\n      if (!self.__callsHook) { self.__callsHook = 1; window.addEventListener('storage', function (ev) { if (ev.key === 'px_calls_main_v1' && ev.newValue && ev.newValue !== self.__callsSaved) { try { self.__callsSaved = ev.newValue; self.setState({ calls: JSON.parse(ev.newValue) }); } catch (x) {} } }); }\n    } catch (e) {}\n");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
/* Reports: compliments logged with the Log button join the list; the psychiatrist named is on the HMS list */
file='public/px/reports.html';let s=fs.readFileSync(file,'utf8');
function S(a,b){if(s.split(a).length-1!==1)throw new Error('S '+a.slice(0,60));s=s.replace(a,()=>b);}
S("who:'Dr. Ichpreet Singh',team:'Psychiatrist'","who:'Dr. Kunal Sethi',team:'Psychiatrist'");
S("let S={per:'week',told:{}};","try{const PN={p1:'Arjun Mehta',p2:'Neel Bose',p3:'Meera Iyer',p4:'Varun Rao',p5:'Kavya Menon',p6:'Rahul Sethi'},M=JSON.parse(localStorage.getItem('px_calls_main_v1')||'{}')||{};Object.keys(M).forEach(pid=>(M[pid]||[]).forEach((l,i)=>{if(l&&l.tag==='compliment')COMPL.unshift({id:'lg-'+pid+'-'+i,who:'Named in the call',team:'Logged by '+(l.who||'Prabh'),words:l.note||'Compliment logged.',by:(PN[pid]||'Family')+(l.d?', '+l.d:'')});}));}catch(e){}\nlet S={per:'week',told:{}};");
fs.writeFileSync(file,s);
console.log('ok');
