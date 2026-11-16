/* One-off (16 Nov 2026): Patient Experience real mode, step 3: the Grievances screen must render with no concerns at all. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('NO_CONCERN')) { console.log('already edited'); process.exit(0); }
function once(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 70)); t = t.split(a).join(b); }
once("|| all.filter(function (c) { return c.id === s.cid; })[0] || all[0];",
  "|| all.filter(function (c) { return c.id === s.cid; })[0] || all[0] || NO_CONCERN;");
/* declare the empty concern once, before the first use (next to the concern seed) */
once('var C = window.PX_REAL ? [] : [',
  "var NO_CONCERN = { id: '', type: 'concern', pid: '', pname: '', title: 'No concern yet', raisedBy: '', via: '', src: '', owner: '', ownerRole: '', category: '', sla: '', slaTone: 'grey', logged: '', status: 'Open', desc: '', latest: '', empty: true };\n    var C = window.PX_REAL ? [] : [");
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
