/* 19 Nov 2026 (meeting, second pass): the random family call pop-up lists TODAY'S TWO patients to call (each "0 of 2 done"), not one name.
   The two are picked at random but stay the same all day (a hash of the date and the patient), and a patient who already had both calls drops out.
   Choosing one opens the call window with that family member and the seven questions. */
const fs = require('fs');
const file = 'public/px-lead-prototype.html';
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
function R(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 90)); t = t.split(a).join(b); }

/* template: drop the patient picker, rename the list */
const s0 = t.indexOf('        <div class="field"><label for="rlpq">Patient</label>');
const s1 = t.indexOf('        <div class="field"><label>Who to call · {{rcoCount}} done</label>');
if (s0 < 0 || s1 < s0) throw new Error('picker not found');
t = t.slice(0, s0) + t.slice(s1);
R('<label>Who to call · {{rcoCount}} done</label>', '<label>Random family calls to make today</label>');
R('Every patient gets two random calls during the stay. Pick the family member you are calling; the call window opens next.', 'Two random calls a day. Each patient gets two during the stay. Choose who you are calling; the call window opens next.');

/* code: today's two patients */
const a = t.indexOf("    var rcoP = pById[s.form.pid] || null;");
const b = t.indexOf("(function () { var L = rcoList(rcoP)");
const e = t.indexOf("})() : [];", b) + "})() : [];".length;
if (a < 0 || b < a || e < b) throw new Error('rco code not found');
t = t.slice(0, a) +
  "    var hashS = function (str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); };\n" +
  "    var dseed = String(Math.floor(Date.now() / 864e5));\n" +
  "    var rcoPick = P.filter(function (p) { return parseInt(rnd(p), 10) < 2; }).sort(function (x, y) { return hashS(dseed + x.id) - hashS(dseed + y.id); }).slice(0, 2);\n" +
  "    NZ.rcoCount = '';\n" +
  "    NZ.rcoContacts = rcoPick.map(function (p) { return { name: p.name + ' · ' + p.room, sub: 'Family: ' + p.gName + ' (' + String(p.gRel || 'relative').toLowerCase() + ') · ' + p.phone + ' · ' + rnd(p) + ' done', label: 'Call ' + String(p.gName || '').split(' ')[0], call: function () { self.setState({ logOpen: false, logQ: '', rcPid: p.id, rc: {}, rcWho: { name: p.gName, rel: p.gRel, phone: p.phone } }); } }; });" +
  t.slice(e);
R("NZ.kindHint = NZ.isRandom ? 'Pick the patient, then the family member you are calling.'", "NZ.kindHint = NZ.isRandom ? 'These are the two families to call today.'");
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
