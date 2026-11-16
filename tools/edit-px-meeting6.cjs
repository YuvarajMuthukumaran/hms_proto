/* One-off (12 Nov 2026): Patient Experience menu is Today, Patients, Grievances, Staff training, Reports (Trello 118, 119).
   Staff training and Reports are public/px/training.html and public/px/reports.html, shown with ?embed=1. The earlier Reports page
   (patterns, weekly tables) and the Nurse training demo page stay under "Older pages". */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING6')) throw new Error('already applied');
const BS = String.fromCharCode(92);
function rep(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label); t = t.split(a).join(b); }
rep("'report', 'today2', 'patients2', 'nurse'];", "'report', 'today2', 'patients2', 'nurse', 'training2', 'reports2'];", 'SCR');
rep("var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['concerns', 'Feedback', openC.length], ['nurse', 'Nurse training', 0], ['report', 'Reports', 0]];",
    "var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['concerns', 'Grievances', openC.length], ['training2', 'Staff training', 0], ['reports2', 'Reports', 0]]; /* MEETING6 */", 'main nav');
rep("var M5old = [['today', 'Patient dashboard', 0],", "var M5old = [['today', 'Patient dashboard', 0], ['nurse', 'Nurse training (demo)', 0], ['report', 'Patterns report (old)', 0],", 'old nav');
rep('<!-- ============ TODAY ============ -->', '<sc-if value="{{isTraining2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Staff training" src="px/training.html?embed=1"></iframe></sc-if>\n<sc-if value="{{isReports2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Reports" src="px/reports.html?embed=1"></iframe></sc-if>\n\n<!-- ============ TODAY ============ -->', 'screens');
rep("NZ.isNurse = s.screen === 'nurse';", "NZ.isNurse = s.screen === 'nurse'; NZ.isTraining2 = s.screen === 'training2'; NZ.isReports2 = s.screen === 'reports2';", 'props');
rep("NZ.pageTitle = { today2: 'Today',", "NZ.pageTitle = { training2: 'Staff training', reports2: 'Reports', today2: 'Today',", 'titles');
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n' + src.slice(i1));
console.log('ok');
