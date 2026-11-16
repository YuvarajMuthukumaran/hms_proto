/* One-off: put S Chandra's address on the escalate email draft. */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);
const a = "window.location.href = 'mailto:?subject='";
if (t.split(a).length !== 2) throw new Error('mailto not found once');
t = t.split(a).join("window.location.href = 'mailto:gmoperations@tulasihealthcare.com?subject='");
const b = "'To: S Chandra, GM Operations', '', ";
if (t.split(b).length !== 2) throw new Error('To line not found once');
t = t.split(b).join("'Hello S Chandra,', '', ");
const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written');
