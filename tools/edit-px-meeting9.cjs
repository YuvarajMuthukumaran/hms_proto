/* One-off (13 Nov 2026, Trello 122 and 130): Patient Experience menu is now Today, Patients, Rounds, Grievances, Calendar, Staff training, Reports.
   Rounds is public/px/rounds.html (the team's PX_Rounds_proposed.html made working) and Calendar is public/px/calendar.html, both shown with ?embed=1.
   Grievances logged on a round (localStorage px_rounds_v1, same browser) are added to the Grievances list with source "Rounds". */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING9')) throw new Error('already applied');
const BS = String.fromCharCode(92);
function rep(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label); t = t.split(a).join(b); }
rep("'nurse', 'training2', 'reports2'];", "'nurse', 'training2', 'reports2', 'rounds2', 'calendar2'];", 'SCR');
rep("var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['concerns', 'Grievances', openC.length], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0]]; /* MEETING6 */",
    "var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['rounds2', 'Rounds', 0], ['concerns', 'Grievances', openC.length], ['calendar2', 'Calendar', 0], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0]]; /* MEETING6 MEETING9 */", 'main nav');
rep('<!-- ============ TODAY ============ -->', '<sc-if value="{{isRounds2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Rounds" src="px/rounds.html?embed=1"></iframe></sc-if>\n<sc-if value="{{isCalendar2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Calendar" src="px/calendar.html?embed=1"></iframe></sc-if>\n\n<!-- ============ TODAY ============ -->', 'screens');
rep("NZ.isTraining2 = s.screen === 'training2';", "NZ.isTraining2 = s.screen === 'training2'; NZ.isRounds2 = s.screen === 'rounds2'; NZ.isCalendar2 = s.screen === 'calendar2';", 'props');
rep("NZ.pageTitle = { training2: 'Staff training',", "NZ.pageTitle = { rounds2: 'Rounds', calendar2: 'Calendar', training2: 'Staff training',", 'titles');
/* source "Rounds" in the grievance list, and the entries made on a round */
rep("var SRCL = { family: ['Family call', 'family'], voice: ['Voice note', 'voice'], patient: ['From the patient', 'patient'], internal:",
    "var SRCL = { rounds: ['Rounds', 'internal'], family: ['Family call', 'family'], voice: ['Voice note', 'voice'], patient: ['From the patient', 'patient'], internal:", 'SRCL');
rep("var M4born = self.__born || (self.__born = {});",
    "var M4born = self.__born || (self.__born = {});\n" +
    "    /* MEETING9: grievances logged on a round (Rounds page, same browser) */\n" +
    "    try {\n" +
    "      var RR = JSON.parse(localStorage.getItem('px_rounds_v1') || 'null');\n" +
    "      ((RR && RR.ent) || []).filter(function (e) { return e.kind === 'grievance'; }).forEach(function (e) {\n" +
    "        if (C.some(function (c) { return c.id === e.id; })) return;\n" +
    "        var pp = P.filter(function (x) { return x.name === e.patient; })[0];\n" +
    "        var hrsLeft = 6 - (Date.now() - e.t0) / 3.6e6;\n" +
    "        var tm = new Date(e.t0), lg = 'today, ' + (tm.getHours() % 12 || 12) + ':' + ('0' + tm.getMinutes()).slice(-2) + (tm.getHours() < 12 ? ' am' : ' pm');\n" +
    "        M4born[e.id] = e.t0;\n" +
    "        C.unshift({ id: e.id, type: 'grievance', pid: pp ? pp.id : '', pname: e.patient, title: e.title, raisedBy: e.patient + ', patient (told us on the round)', via: 'Rounds, room ' + e.room, src: 'rounds', owner: e.owner, ownerRole: e.safety ? 'Told now' : 'Owner', category: e.cat || 'Other', sla: e.safety ? 'Told now, repeats every 30 min' : (hrsLeft > 0 ? Math.floor(hrsLeft) + ' h ' + Math.floor((hrsLeft % 1) * 60) + ' m left' : 'Breached'), slaTone: e.safety || hrsLeft < 1 ? 'red' : (hrsLeft < 3 ? 'amber' : 'grey'), logged: lg, status: 'Open', desc: 'Raised on the round by ' + (e.by || 'Patient experience') + ' in room ' + e.room + '. ' + e.title });\n" +
    "      });\n" +
    "    } catch (e) {}", 'rounds feed');
const at = t.indexOf('</style>', t.indexOf('html{zoom:.75}'));
if (at < 0) throw new Error('no style end');
t = t.slice(0, at) + '\n/* MEETING9 */\n.sub a{white-space:nowrap}\n' + t.slice(at);
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n' + src.slice(i1));
console.log('ok');
