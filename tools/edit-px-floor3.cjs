/* One-off: tidy the Floor round screen (neater header, calmer rows). */
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

/* header: number + tally on one line, the strip full width underneath */
const hs = t.indexOf('<div class="fr-top">');
const tallyEnd = '<span>{{floorLeft}} still to check</span></div>';
const he = t.indexOf(tallyEnd, hs) + tallyEnd.length;
if (hs < 0 || he < hs) throw new Error('header markers');
const header =
  '<div class="fr-top">' +
  '<div class="fr-head"><div class="fr-read"><b>{{floorDone}}</b><em>of {{floorTotal}} checked</em></div>' +
  '<div class="fr-tally"><span class="t-ok">{{floorOk}} OK</span><span class="t-is">{{floorIssues}} {{floorIssueWord}}</span><span>{{floorLeft}} to check</span></div></div>' +
  '<div class="fr-walk" aria-hidden="true"><sc-for list="{{floorStrip}}" as="z" hint-placeholder-count="8"><i class="{{z.cls}}"></i></sc-for></div>' +
  '</div>';
t = t.slice(0, hs) + header + t.slice(he);

/* the owners card stays in view while you walk down the checklist */
rep('<section class="card" style="flex:2 1 340px">\n      <div class="chead"><h3>Who owns what on the floor</h3>',
    '<section class="card" style="flex:2 1 340px;align-self:flex-start;position:sticky;top:12px">\n      <div class="chead"><h3>Who owns what on the floor</h3>', 'owners');

const css = `
/* floor round: tidy pass */
.fr-top{display:block;padding:18px 22px 16px}
.fr-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px 16px;flex-wrap:wrap;margin-bottom:12px}
.fr-read{display:flex;align-items:baseline;gap:8px;min-width:0}
.fr-read b{font-size:28px;font-weight:700;line-height:1}
.fr-read em{font-size:14px}
.fr-tally{display:flex;gap:6px 16px;flex-wrap:wrap;padding:0;margin:0;font-size:13px}
.fr-tally>span{margin-right:0}
.fr-walk{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px}
.fr-walk i{height:8px;border-radius:4px}
.fr-walk i.issue{transform:none}
.fr-group{border-top:0}
.fr-gh{background:#f5f8fc;border-top:1px solid #e6edf5;border-bottom:1px solid #e6edf5;padding:9px 22px;font-size:13px;font-weight:700;color:#334155}
.fr-row{padding:12px 22px;border-left:3px solid transparent;border-bottom:1px solid #f0f3f7;gap:2px 14px}
.fr-row.ok{background:#fff;border-left-color:#1f9d57}
.fr-row.issue{background:#fff6f5;border-left-color:#d92d20}
.fr-state{width:22px;height:22px;font-size:12px}
.fr-txt .name{font-size:14px;font-weight:600;line-height:1.35}
.fr-own{font-size:12px;margin-top:2px}
.fr-tog{border-radius:9px}
.fr-tog button{min-height:36px;min-width:60px;padding:0 12px;font-size:13px}
.fr-extra .fr-due{font-size:12px;padding:8px 0 6px}
.fr-extra input{min-height:38px;font-size:13.5px}
.fr-foot{background:#fafbfd}
.fr-done{margin:14px 22px 18px}
@media (max-width:640px){.fr-top,.fr-gh,.fr-row,.fr-foot{padding-left:16px;padding-right:16px}}
`;
const sEnd = t.indexOf('</style>');
t = t.slice(0, sEnd) + css + t.slice(sEnd);

const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
