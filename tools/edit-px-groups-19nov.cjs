/* 19 Nov 2026 (meeting): Group sessions in the Patient Experience Lead menu (public/px/groups.html, floor-wise attendance: 1st, 2nd, 3rd floor). Not for the RMO. */
const fs = require('fs');
const file = 'public/px-lead-prototype.html';
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
function R(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 90)); t = t.split(a).join(b); }
R("'training2', 'reports2', 'rounds2', 'calendar2', 'setting2']; /* MEETING2 */", "'training2', 'reports2', 'rounds2', 'calendar2', 'setting2', 'groups2']; /* MEETING2 */");
R("['concerns', 'Grievances', openC.length], ['training2', 'Staff training', 0]", "['concerns', 'Grievances', openC.length], ['groups2', 'Group sessions', 0], ['training2', 'Staff training', 0]");
R("NZ.isSetting2 = s.screen === 'setting2';", "NZ.isSetting2 = s.screen === 'setting2'; NZ.isGroups2 = s.screen === 'groups2';");
R("NZ.pageTitle = { setting2: 'Setting',", "NZ.pageTitle = { groups2: 'Group sessions', setting2: 'Setting',");
R('<sc-if value="{{isSetting2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Setting" src="px/setting.html?embed=1"></iframe></sc-if>',
  '<sc-if value="{{isSetting2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Setting" src="px/setting.html?embed=1"></iframe></sc-if>\n<sc-if value="{{isGroups2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Group sessions" src="px/groups.html?embed=1"></iframe></sc-if>');
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
