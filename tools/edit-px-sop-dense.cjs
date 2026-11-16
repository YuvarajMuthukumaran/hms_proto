/* One-off: denser, calmer SOP screens (tokens from open-design "linear-app" DESIGN.md, light neutrals).
   Scoped to pages that show .sop-mast, so the other PX screens do not change. */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);
if (t.indexOf('sop-dense') >= 0) throw new Error('already applied');
const M = '.main:has(.sop-mast)';
const css = `
/* sop-dense: linear-app light tokens, 4/8/12/16 spacing */
${M}{gap:12px;padding:16px 20px 32px;background:#f7f8f8;font-feature-settings:"cv01","ss03"}
${M} .card{border-color:#e3e7ee;border-radius:10px;box-shadow:none}
${M} .chead{padding:10px 14px;gap:8px}
${M} .chead h3{font-size:14px;font-weight:600}
${M} .cpad{padding:12px 14px}
${M} .muted.small,${M} .small{font-size:12px}
${M} .name{font-weight:550}
${M} .checkrow{padding:7px 14px;gap:10px;align-items:flex-start}
${M} .checkrow .cbx{margin-top:1px}
${M} .checkrow .name{font-size:13.5px;line-height:1.35}
${M} .listrow{padding:9px 14px}
${M} .fgrid{gap:10px}
${M} .field{gap:4px}
${M} .field label{font-size:12px;font-weight:550;color:#4b5565}
${M} .field input,${M} .field select,${M} .field textarea{min-height:34px;padding:6px 10px;font-size:13.5px;border-radius:7px;border-color:#d0d6e0}
${M} .field textarea{min-height:64px}
${M} .btn{height:34px;padding:0 12px;font-size:13px;font-weight:550;border-radius:7px}
${M} .btn.sm{height:30px;padding:0 10px;font-size:12.5px}
${M} .seg{border-radius:8px;padding:2px}
${M} .seg button{padding:5px 10px;font-size:12.5px;border-radius:6px}
${M} .chip{font-size:11.5px;padding:2px 8px}
${M} .note,${M} .info{padding:8px 12px;font-size:12.5px;border-radius:8px}
${M} .hello{gap:8px}
${M} .cols,${M} .dc-grid{gap:12px}
/* header: one compact row */
${M} .sop-mast{padding:10px 14px 10px 18px;gap:6px 16px;border-radius:10px;border-color:#e3e7ee}
${M} .sop-mast::before{width:3px}
${M} .sop-stub{min-width:0;padding:5px 10px;border-radius:7px;flex-direction:row;align-items:baseline;gap:8px}
${M} .sop-stub::before,${M} .sop-stub::after{display:none}
${M} .sop-stub span{font-size:12.5px}${M} .sop-stub small{font-size:11.5px}
${M} .sop-mt h2{font-size:17px;font-weight:600}
${M} .sop-mt p{font-size:13px;margin-top:2px}
${M} .sop-own{flex-direction:row;gap:6px;align-items:baseline;max-width:none}
${M} .sop-own small{white-space:nowrap}${M} .sop-own b{font-size:12.5px}
/* status row: compact, stays in view while you work */
${M} .tiles.rail{position:sticky;top:0;z-index:5;border-radius:10px;border-color:#e3e7ee;box-shadow:0 1px 0 #e3e7ee}
${M} .tiles.rail .tile{padding:8px 14px;flex:1 1 150px;flex-direction:row;flex-wrap:wrap;align-items:baseline;column-gap:8px;row-gap:0}
${M} .tiles.rail .lbl{flex:1 0 100%;font-size:12px}
${M} .tiles.rail .tile b{font-size:18px;font-weight:600}
${M} .tiles.rail .tile .muted.small{font-size:11.5px}
/* checklist pieces */
${M} .dc-head{padding:10px 14px;gap:8px 16px;grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}
${M} .dc-risk{padding:8px 14px}
${M} .sop-bar{margin:0 14px;height:3px}
${M} .dc-sigs{padding:12px 14px;gap:10px}
${M} .dc-sig{padding:10px;border-radius:8px;gap:6px}
/* tables and lists */
${M} .pt th,${M} .pt td{padding:8px 12px}
${M} .fr-gh{padding:6px 14px;font-size:12.5px}
${M} .fr-row{padding:7px 14px}
${M} .fr-tog button{min-height:30px;min-width:48px;font-size:12.5px}
${M} .cl-rooms{padding:10px 14px;gap:6px;grid-template-columns:repeat(auto-fill,minmax(70px,1fr))}
${M} .cl-room{padding:6px 4px;border-radius:8px}${M} .cl-room b{font-size:14px}
${M} .fam-f{gap:6px 10px}${M} .fam-f>.name{flex-basis:110px;font-size:13px}
${M} .fu-msg{padding:10px 12px;font-size:13px;line-height:1.5}
${M} .nps{gap:4px}
@media (max-width:760px){${M}{padding:12px}${M} .tiles.rail{position:static}${M} .tiles.rail .tile{flex-basis:50%}}
`;
const sEnd = t.indexOf('</style>');
t = t.slice(0, sEnd) + css + t.slice(sEnd);
const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
