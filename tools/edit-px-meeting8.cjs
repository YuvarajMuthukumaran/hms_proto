/* One-off (12 Nov 2026, Nikita): the Patient Experience app is screen adaptive.
   Under 1024 px the 75% scale is off, the menu becomes one row that scrolls sideways above the page, tables scroll inside their card,
   the embedded Today / Patients / Staff training / Reports pages fill the screen height, and on a phone everything is one column. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING8')) throw new Error('already applied');
const BS = String.fromCharCode(92);
const css = `
/* MEETING8 */
@media (max-width:1023px){
  html{zoom:1!important}
  .app{display:block!important}
  .app .side{max-width:100%!important;width:100%!important;border-right:0!important;border-bottom:1px solid #e3eaf2;padding:8px 10px!important;flex-direction:row!important;align-items:center!important;gap:6px!important;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box}
  .app .side .brand,.app .side .lbl,.app .side .me{display:none!important}
  .app .side .nav,.app .side .subbox,.app .side .sub{flex:0 0 auto!important;white-space:nowrap}
  .app .subbox{flex-direction:row!important;border:0!important;margin:0!important;padding:0!important;gap:6px!important}
  .app .sub{min-height:40px}
  .app .sub.m5-old-h{display:none!important}
  .app .wrap{display:block!important}
  .app .px-emb{height:calc(100vh - 130px)!important;min-height:560px}
  .app .main{padding:14px 12px 32px!important}
  .app .topbar{padding:10px 12px!important}
  .app .tiles{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .scrollx,.card:has(table){overflow-x:auto}
  .cols{flex-direction:column!important}
  .cols>section{flex:1 1 auto!important;width:100%!important}
}
@media (max-width:700px){
  .topbar h1{font-size:18px}
  .tbr{gap:4px;flex-wrap:wrap}
  .rolep{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .drawer,.drawer.modal{width:100%!important;max-width:100%!important}
  .toolbar{flex-wrap:wrap;gap:8px}
  .toolbar .search,.search{width:100%!important}
  table.pt{min-width:620px}
}
`;
const at = t.indexOf('</style>', t.indexOf('html{zoom:.75}'));
if (at < 0) throw new Error('no style end');
t = t.slice(0, at) + css + t.slice(at);
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n' + src.slice(i1));
console.log('ok');
