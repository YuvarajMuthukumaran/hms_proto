/* One-off (16 Nov 2026): Patient Experience real mode, step 4: the discharge-feedback screen with nobody discharged yet. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const a = "return f.id === s.fb.pid; })[0] || F[0];";
if (t.split(a).length !== 2) throw new Error('fbSel not found / already edited');
t = t.replace(a, "return f.id === s.fb.pid; })[0] || F[0] || { id: '', name: 'Nobody discharged yet', family: '', discharged: '', appt: '', doctor: '', check: '', checkCls: 'chip grey', next: '' };");
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
