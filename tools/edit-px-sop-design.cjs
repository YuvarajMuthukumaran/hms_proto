/* One-off: design pass on the 5 SOP screens of the Patient Experience Lead page
   (Discharge checklist, Follow-ups, Room cleanliness, Family updates, Discharge feedback).
   Paper-form stub header per SOP, one status rail instead of number tiles, chat-bubble
   message previews, ticks that draw, section progress bars, visible focus, reduced motion. */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);
function rep(a, b, label, n) { const c = t.split(a).length - 1; if (c !== (n || 1)) throw new Error('expected ' + (n || 1) + ', got ' + c + ': ' + label); t = t.split(a).join(b); }
if (t.indexOf('sop-mast') >= 0) throw new Error('already applied');

const mast = (form, source, title, text, owner) =>
  `<header class="sop-mast"><div class="sop-stub"><span>${form}</span><small>${source}</small></div>` +
  `<div class="sop-mt"><h2>${title}</h2><p>${text}</p></div>` +
  `<div class="sop-own"><small>Who does it</small><b>${owner}</b></div></header>`;

/* Discharge checklist */
rep('<sc-if value="{{isDcheck}}" hint-placeholder-val="{{false}}">\n',
  '<sc-if value="{{isDcheck}}" hint-placeholder-val="{{false}}">\n  ' + mast('TM-DC-01', 'Discharge checklist v11', 'Discharge checklist', 'Nothing is missed before the patient goes home. Completing it books the follow-ups for the call centre.', 'Ward team fills it, Kanika checks it') + '\n', 'dc mast');
rep('<div><h3>Discharge checklist</h3><div class="muted small">Form TM-DC-01 v11 · the human handoff only. The software discharge summary already has the medicines, doctor names and emergency numbers.</div></div>',
  '<div><h3>Patient going home</h3><div class="muted small">The software discharge summary already holds the medicines, doctors and emergency numbers. This covers the hand-over to the family.</div></div>', 'dc head');

/* Follow-ups */
const fh0 = t.indexOf('<div class="hello">\n    <div><h2>Follow-ups after discharge</h2>');
const fh1 = t.indexOf('</div>\n  </div>', fh0) + '</div>\n  </div>'.length;
if (fh0 < 0) throw new Error('follow hello');
t = t.slice(0, fh0) + mast('SOP step 7', 'Discharge SOP v1', 'Follow-ups', 'Every patient comes back on time. The call centre gets tomorrow’s list and records what happened.', 'Khalid’s call centre, Kanika watches') + t.slice(fh1);

/* Room cleanliness: header above, keep the switches row */
rep('<sc-if value="{{isClean}}" hint-placeholder-val="{{false}}">\n  <div class="hello">\n    <div><h2>Room cleanliness</h2><div class="muted">Patient Room Cleanliness Checklist v1 · walk each room, mark OK or Issue. Issues go to housekeeping or maintenance.</div></div>',
  '<sc-if value="{{isClean}}" hint-placeholder-val="{{false}}">\n  ' + mast('Checklist v1', 'Patient room cleanliness', 'Room cleanliness', 'Walk each room and mark every item. Problems go straight to housekeeping or maintenance.', 'Patient experience and floor coordinators') + '\n  <div class="hello">\n    <div class="muted small" style="align-self:center">Checking as</div>', 'clean mast');

/* Family updates */
rep('<div class="hello"><div><h2>Family updates</h2><div class="muted">Family Communication SOP v3 · every family gets a WhatsApp update by 8 pm, and every planned family step is on time.</div></div></div>',
  mast('SOP v3', 'Family communication', 'Family updates', 'Every family hears from us by 8 pm, and every planned family meeting happens on time.', 'Psychologist sends, you cover'), 'family mast');

/* Discharge feedback */
rep('<sc-if value="{{isFeedback}}" hint-placeholder-val="{{false}}">\n',
  '<sc-if value="{{isFeedback}}" hint-placeholder-val="{{false}}">\n  ' + mast('Form 6', 'Feedback form v6', 'Discharge feedback', 'Ask the family each question before they leave. A score of 6 or below reaches Chandraji the same day.', 'Kanika, Prabh covers') + '\n', 'fb mast');

/* status rails instead of number tiles on SOP screens */
['dcTiles', 'fuTiles', 'famTiles', 'fbTiles'].forEach(function (k) {
  const a = t.indexOf('{{' + k + '}}'); const d = t.lastIndexOf('<div class="tiles">', a);
  if (a < 0 || d < 0 || a - d > 200) throw new Error('tiles ' + k);
  t = t.slice(0, d) + '<div class="tiles rail">' + t.slice(d + '<div class="tiles">'.length);
});

/* section progress bars on the checklist */
rep('<span class="{{g.chip}}">{{g.progress}}</span></div>\n      <sc-if value="{{g.isRisk}}"',
  '<span class="{{g.chip}}">{{g.progress}}</span></div>\n      <div class="sop-bar"><i class="{{g.barCls}}" style="width:{{g.pct}}"></i></div>\n      <sc-if value="{{g.isRisk}}"', 'bars', 2);
rep("return { title: g.title, owner: g.owner, progress: mc[0] + ' of ' + mc[1] + ' must-do',",
  "return { title: g.title, owner: g.owner, pct: Math.round(mc[0] / Math.max(1, mc[1]) * 100) + '%', barCls: mc[0] === mc[1] ? 'full' : '', progress: mc[0] + ' of ' + mc[1] + ' must-do',", 'pct');

const css = `
/* ===== SOP screens: design pass ===== */
.sop-mast{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:16px 24px;align-items:center;background:#fff;border:1px solid #dde5ef;border-radius:18px;padding:20px 24px 20px 28px;overflow:hidden}
.sop-mast::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#1e6cdb;transform-origin:top;animation:sopBar .5s ease-out both}
@keyframes sopBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.sop-stub{position:relative;display:flex;flex-direction:column;gap:2px;min-width:118px;padding:11px 16px;background:#f5f8fc;border:1px dashed #b7c6da;border-radius:10px}
.sop-stub::before,.sop-stub::after{content:"";position:absolute;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#fff;border:1px dashed #b7c6da}
.sop-stub::before{left:-7px;clip-path:inset(0 0 0 50%)}.sop-stub::after{right:-7px;clip-path:inset(0 50% 0 0)}
.sop-stub span{font-size:15px;font-weight:700;color:#14284b;font-variant-numeric:tabular-nums}
.sop-stub small{font-size:12px;color:#5b6475}
.sop-mt h2{margin:0;font-size:22px;line-height:1.2;font-weight:700;color:#14284b;letter-spacing:-.01em}
.sop-mt p{margin:5px 0 0;font-size:14px;line-height:1.5;color:#475467;max-width:64ch}
.sop-own{text-align:right;display:flex;flex-direction:column;gap:2px;max-width:220px}
.sop-own small{font-size:12px;color:#5b6475}.sop-own b{font-size:13.5px;color:#14284b;font-weight:600;line-height:1.35}
.tiles.rail{display:flex;flex-wrap:wrap;gap:0;background:#fff;border:1px solid #dde5ef;border-radius:16px;overflow:hidden}
.tiles.rail .tile{flex:1 1 180px;border:0;border-left:1px solid #eef2f6;border-radius:0;padding:14px 20px;gap:3px;background:none}
.tiles.rail .tile:first-child{border-left:0}
.dc-head .lbl,.dc-sig .lbl,.tiles.rail .lbl{text-transform:none;letter-spacing:0;font-size:13px;font-weight:500;color:#475467;padding:0}
.tiles.rail .tile b{font-size:22px;color:#14284b;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.sop-bar{height:4px;margin:0 20px;background:#eef2f6;border-radius:4px;overflow:hidden}
.sop-bar i{display:block;height:100%;background:#1e6cdb;border-radius:4px;transition:width .35s ease}
.sop-bar i.full{background:#0e7c66}
.cbx{transition:background-color .15s ease,border-color .15s ease}
.cbx.on{background:#0e7c66;border-color:#0e7c66}
.cbx svg path{stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset .22s ease .05s}
.cbx.on svg path{stroke-dashoffset:0}
.fu-msg{font-family:inherit;font-size:13.5px;line-height:1.6;color:#14284b;background:#e8f5f1;border:1px solid #c8e6dc;border-radius:16px 16px 16px 4px;padding:14px 16px;max-width:560px}
.cl-room{transition:background-color .2s ease,border-color .2s ease}
.cl-room b{color:#14284b;font-variant-numeric:tabular-nums}
.fam-on{background:#eef5ff;box-shadow:inset 3px 0 0 #1e6cdb}
button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible,.cl-room:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px}
@media (max-width:760px){.sop-mast{grid-template-columns:1fr;padding:18px 18px 18px 22px}.sop-stub{justify-self:start}.sop-own{text-align:left;max-width:none}.tiles.rail .tile{flex-basis:50%;border-left:0;border-top:1px solid #eef2f6}}
@media (prefers-reduced-motion:reduce){.sop-mast::before{animation:none}.sop-bar i,.cbx,.cbx svg path,.cl-room{transition:none}}
`;
const sEnd = t.indexOf('</style>');
t = t.slice(0, sEnd) + css + t.slice(sEnd);
const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
