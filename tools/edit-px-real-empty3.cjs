/* One-off (16 Nov 2026): the next-patient link must not fail when there is no patient. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const a = 'var nextP = P[sp.idx % P.length];';
if (t.split(a).length !== 2) throw new Error('nextP not found');
t = t.replace(a, 'var nextP = P[sp.idx % P.length] || sp;');
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
