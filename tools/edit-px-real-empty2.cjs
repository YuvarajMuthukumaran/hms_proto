/* One-off (16 Nov 2026): every "first patient" fallback in the PX bundle uses window.PX_NO_PATIENT (defined in px-real.js). */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const k = t.indexOf("var sp = pById[s.pid] || P[0] || { id: ''");
if (k < 0) throw new Error('sp fallback not found');
const e = t.indexOf('};', k) + 2;
t = t.slice(0, k) + 'var sp = pById[s.pid] || P[0] || window.PX_NO_PATIENT;' + t.slice(e);
function once(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 70)); t = t.split(a).join(b); }
once('var dcp = pById[s.dcPid] || discharging[0] || P[0];', 'var dcp = pById[s.dcPid] || discharging[0] || P[0] || window.PX_NO_PATIENT;');
once('var fp = pById[s.famPid] || P[0], fcur', 'var fp = pById[s.famPid] || P[0] || window.PX_NO_PATIENT, fcur');
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
