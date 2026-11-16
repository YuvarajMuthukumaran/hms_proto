/* 14 Nov 2026, card 122: a grievance logged on a Rounds walk goes through the same pipeline as every other grievance (px_state pxg row), so Grievances on any device and the owner's HMS portal see it */
const fs=require('fs');
let file='public/px-lead-prototype.html';const src=fs.readFileSync(file,'utf8');
const tag='<script type="__bundler/template">';const i0=src.indexOf(tag,100000)+tag.length,i1=src.indexOf('</script>',i0);
let t=JSON.parse(src.slice(i0,i1).trim());
function R(a,b){const n=t.split(a).length-1;if(n!==1)throw new Error('match '+n+': '+a.slice(0,80));t=t.split(a).join(b);}
R("        C.unshift({ id: e.id, type: 'grievance', pid: pp ? pp.id : '', pname: e.patient,","        var cc = ({ id: e.id, type: 'grievance', pid: pp ? pp.id : '', pname: e.patient,");
R("' in room ' + e.room + '. ' + e.title });\n      });","' in room ' + e.room + '. ' + e.title });\n        C.unshift(cc);\n        try { if (window.PXG && window.PXG.addRow) window.PXG.addRow(cc); } catch (x) {}\n      });");
fs.writeFileSync(file,src.slice(0,i0)+'\n'+JSON.stringify(t).split('</').join('<'+String.fromCharCode(92)+'/')+'\n'+src.slice(i1));
file='public/px/px-grievances.js';let s=fs.readFileSync(file,'utf8');
function S(a,b){if(s.split(a).length-1!==1)throw new Error('S '+a.slice(0,60));s=s.replace(a,()=>b);}
S("    pull: function (self) {","    /* a concern made somewhere else (a Rounds walk) is saved as a pxg row once, unless the store already has it */\n    known: {}, pulled: false, q: [],\n    addRow: function (c) {\n      if (!c || !c.id) return;\n      if (!cfg || !PXG.pulled) { if (!PXG.q.some(function (x) { return x.id === c.id; })) PXG.q.push(c); return; }\n      if (PXG.known[c.id]) return;\n      PXG.known[c.id] = 1; last['pxg:' + c.id] = stamp({ c: c, st: null });\n      rest('px_state?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify([{ key: 'pxg:' + c.id, data: { c: c, st: null }, updated_at: new Date().toISOString() }]) }).catch(function () { delete PXG.known[c.id]; });\n    },\n    pull: function (self) {");
S("      rest('px_state?select=key,data&key=like.px*:*').then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {\n","      rest('px_state?select=key,data&key=like.px*:*').then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {\n        rows.forEach(function (r) { if (r.key.indexOf('pxg:') === 0) PXG.known[r.key.slice(4)] = 1; });\n        PXG.pulled = true; PXG.q.splice(0).forEach(PXG.addRow);\n");
fs.writeFileSync(file,s);new Function(s);console.log('ok');
