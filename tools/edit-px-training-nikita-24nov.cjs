// 24 Nov (Nikita): Training page. Only the new-joiner alert (clears once they are booked on a Patient rights session),
// Sessions tab first, People second; team chips become drop-downs on People only; Sessions has its own Show filter.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'public', 'px', 'training.html');
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 70)); s = s.split(a).join(b); };

const i0 = s.indexOf('function alerts(){const out=[];');
const g = s.indexOf('G-0145', i0);
const endTok = "return out.join('');}";
const i1 = s.indexOf(endTok, g) + endTok.length;
if (i0 < 0 || g < 0 || i1 < g) throw new Error('alerts');
const fn = s.slice(i0, i1);
const l0 = fn.indexOf('  const late='), l1 = fn.indexOf('\n', fn.indexOf('if(late.length)'));
if (l0 < 0 || l1 < 0) throw new Error('late');
let keep = fn.slice(l0, l1 + 1).replace("&&isNew(p));", "&&isNew(p)&&!booked(p.id));");
if (keep.indexOf('booked(p.id)') < 0) throw new Error('booked');
s = s.slice(0, i0) + "function alerts(){const out=[];   /* 24 Nov (Nikita): only the new-joiner alert; it clears once they are booked on a Patient rights session */\n"
  + "  const booked=id=>S.sess.some(x=>x.mod==='rights'&&!x.came&&x.invited.includes(id));\n"
  + keep + "  return out.join('');}" + s.slice(i1);

rep("S.view=ADMIN?'people':'sessions';", "S.view='sessions';S.sf='all';");

const b0 = s.indexOf(' <div class="bar">${ADMIN?');
const b1 = s.indexOf(" ${S.view==='people'?people():sessions()}", b0);
if (b0 < 0 || b1 < 0) throw new Error('bar');
const BT = '`';
s = s.slice(0, b0)
  + ' <div class="bar">${ADMIN?' + BT + '<div class="seg"><button class="${S.view===\'sessions\'?\'on\':\'\'}" data-v="sessions">Sessions</button><button class="${S.view===\'people\'?\'on\':\'\'}" data-v="people">People</button></div>' + BT + ':\'<div></div>\'}\n'
  + '  <div style="display:flex;gap:8px;flex-wrap:wrap">${S.view===\'people\'?'
  + BT + '<select id="tmf" aria-label="Team">${[\'All\',...TEAMS].map(t=>' + BT + '<option value="${t}" ${S.team===t?\'selected\':\'\'}>${t===\'All\'?\'All teams\':t}</option>' + BT + ').join(\'\')}</select>'
  + '<select id="flt" aria-label="Show"><option value="all" ${S.flt===\'all\'?\'selected\':\'\'}>Everyone</option><option value="late" ${S.flt===\'late\'?\'selected\':\'\'}>Training late</option><option value="new" ${S.flt===\'new\'?\'selected\':\'\'}>New joiners</option><option value="concern" ${S.flt===\'concern\'?\'selected\':\'\'}>Linked to a concern</option></select>' + BT
  + ':' + BT + '<select id="sfl" aria-label="Show"><option value="all" ${S.sf===\'all\'?\'selected\':\'\'}>All sessions</option><option value="up" ${S.sf===\'up\'?\'selected\':\'\'}>Attendance not taken</option><option value="done" ${S.sf===\'done\'?\'selected\':\'\'}>Attendance taken</option></select>' + BT + '}</div></div>\n'
  + s.slice(b1);

rep("function sessions(){const L=S.sess.filter(s=>S.team==='All'||MOD(s.mod).team===S.team||MOD(s.mod).team==='All')",
  "function sessions(){const L=S.sess.filter(s=>S.sf==='up'?!s.came:S.sf==='done'?!!s.came:true)");
rep("document.addEventListener('change',e=>{if(e.target.id==='flt'){S.flt=e.target.value;render();}",
  "document.addEventListener('change',e=>{if(e.target.id==='flt'){S.flt=e.target.value;render();}else if(e.target.id==='tmf'){S.team=e.target.value;render();}else if(e.target.id==='sfl'){S.sf=e.target.value;render();}");
fs.writeFileSync(f, s);
console.log('training.html edited');
