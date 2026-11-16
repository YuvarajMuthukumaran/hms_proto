/* One-off (16 Nov 2026): the Patient Experience bundle must render with NO patients (the database policy not run yet, or nobody admitted). */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const a = "st: [], random: '0 of 2', ck: [], log: [], prefs: [], visits: [], belongings: [] };";
if (t.split(a).length !== 2) throw new Error('empty patient not found / already edited');
t = t.replace(a, "st: ['up','up','up','up','up','up','up','up','up'], random: '0 of 2', ck: [], log: [], prefs: [], visits: [], belongings: [] };");
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
