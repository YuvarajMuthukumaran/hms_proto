/* One-off: polish the Floor round screen (fixes from the user's screenshot). */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);
function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}
/* big number: no slash, no nested-span clashes */
rep('<div class="fr-read"><b>{{floorDone}}/{{floorTotal}}</b><span>checked</span></div>',
    '<div class="fr-read"><b>{{floorDone}}</b><em>of {{floorTotal}} checked</em></div>', 'read');
rep('.fr-read span{color:#475569;font-size:13px;font-weight:600}', '.fr-read em{font-style:normal;color:#475569;font-size:14px;font-weight:600}', 'read css');
/* tally dots: only the three direct children get a dot (the framework wraps values in inner spans) */
rep('.fr-tally span{display:inline-flex;align-items:center;gap:6px}', '.fr-tally>span{display:inline-flex;align-items:center;gap:6px;margin-right:14px}', 'tally1');
rep('.fr-tally span:before{content:"";width:9px;height:9px;border-radius:50%;background:#cbd5e1}', '.fr-tally>span:before{content:"";flex:none;width:9px;height:9px;border-radius:50%;background:#cbd5e1}', 'tally2');
rep('.fr-tally .t-ok:before{background:#1f9d57}.fr-tally .t-is:before{background:#d92d20}', '.fr-tally>.t-ok:before{background:#1f9d57}.fr-tally>.t-is:before{background:#d92d20}', 'tally3');
/* note box fits inside the row */
rep('.fr-extra input{width:100%;', '.fr-extra input{box-sizing:border-box;width:100%;max-width:100%;', 'input');
/* header chip no longer repeats the count */
rep('<h3>{{floorName}} round</h3><span class="muted small">{{floorDone}} of {{floorTotal}} checked</span>', '<h3>{{floorName}} round</h3><span class="muted small">Once a day</span>', 'chead');
/* small polish: the walk strip sits on the number's baseline, rows a bit calmer */
rep('.fr-top{display:flex;gap:22px;align-items:center;flex-wrap:wrap;padding:18px 22px 6px}', '.fr-top{display:flex;gap:22px;align-items:center;flex-wrap:wrap;padding:20px 22px 10px}', 'top');

const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
