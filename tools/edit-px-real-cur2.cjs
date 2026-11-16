/* One-off (16 Nov 2026): the empty concern lives in px-real.js (window.PX_NO_CONCERN) so every scope can reach it. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const a = "|| all[0] || NO_CONCERN;", b = "|| all[0] || window.PX_NO_CONCERN;";
if (t.split(a).length !== 2) throw new Error('use not found');
t = t.replace(a, b);
const k = t.indexOf('var NO_CONCERN = {');
if (k < 0) throw new Error('decl not found');
const e = t.indexOf('\n', k);
t = t.slice(0, k) + t.slice(e + 1).replace(/^\s+/, '    ');
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
