/* One-off (12 Nov 2026, QA on card 117): Patient Experience Grievances
   - ids are G-0xxx
   - filters: All open, Ready to confirm, With owner, Closed + search by patient name
   - alerts on top only when needed: red safety, amber past 6 h, green ready to confirm
   - safety grievances cannot be closed without an incident report number
   - owner's latest update shows in the row
   - category to owner map as written on the card */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING7')) throw new Error('already applied');
const BS = String.fromCharCode(92);
function rep(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label); t = t.split(a).join(b); }

/* 1. ids */
t = t.split("C-0").join("G-0");

/* 2. filters and search */
rep("var FILTERS = [['open', 'Open'], ['pending', 'Pending'], ['closed', 'Closed'], ['all', 'All']];", "var FILTERS = [['open', 'All open'], ['ready', 'Ready to confirm'], ['owner', 'With owner'], ['closed', 'Closed']]; /* MEETING7 */", 'filters');
rep("var match = function (f, c) { return f === 'all' ? true : f === 'open' ? c.status === 'Open' : f === 'pending' ? c.status === 'Pending' : c.status === 'Closed'; };",
    "var match = function (f, c) { var q = String(s.gvQ || '').toLowerCase(); if (q && String(c.patient || '').toLowerCase().indexOf(q) < 0 && String(c.title || '').toLowerCase().indexOf(q) < 0) return false; return f === 'all' ? true : f === 'open' ? c.status !== 'Closed' : f === 'ready' ? c.stageN === 'confirm' : f === 'owner' ? (c.status !== 'Closed' && c.stageN !== 'confirm') : c.status === 'Closed'; };", 'match');
rep("resNote: '', m4NeedFix: false, filter: 'pending' });", "resNote: '', m4NeedFix: false, filter: 'ready' });", 'ready filter');
rep('<div class="toolbar">\n    <div class="seg" role="tablist">\n      <sc-for list="{{filters}}"',
    '<sc-for list="{{gvAlerts}}" as="a" hint-placeholder-count="2"><div class="{{a.cls}}"><span>{{a.text}}</span><button class="btn sm" type="button" sc-camel-on-click="{{a.act}}">{{a.btn}}</button></div></sc-for>\n  <div class="toolbar">\n    <input class="search" type="search" placeholder="Search by patient name" value="{{gvQ}}" sc-camel-on-change="{{setGvQ}}" aria-label="Search grievances">\n    <div class="seg" role="tablist">\n      <sc-for list="{{filters}}"', 'alerts + search markup');

/* 3. row fields: safety flag, latest owner update */
rep("stageN: stg.n,", "isSafety: c.type === 'grievance' && /security|safety/i.test(c.category || ''), latest: c.latest ? ('Latest: ' + c.latest + ' (' + (c.latestBy || c.owner) + ', ' + (c.latestAt || '') + ')') : '', incident: c.incident || '', stageN: stg.n,", 'row fields');
rep('{{c.owner}}<div class="muted small">{{c.ownerRole}}</div></sc-raw-td>', '{{c.owner}}<div class="muted small">{{c.ownerRole}}</div><div class="small" style="color:#1e5bb8">{{c.latest}}</div></sc-raw-td>', 'row owner cell');

/* 4. detail panel: owner update, incident number */
rep('<div class="field"><label for="resnote">What the owner did to fix it</label>',
    '<div class="field"><label for="ownupd">Latest update from the owner</label><div style="display:flex;gap:8px"><input class="search" id="ownupd" placeholder="What the owner has done so far" value="{{ownUpd}}" sc-camel-on-change="{{setOwnUpd}}" style="flex:1"><button class="btn sm" type="button" sc-camel-on-click="{{postOwnUpd}}">Post update</button></div><div class="muted small">Owners update from their own portal. It shows here and in the list.</div></div>\n          <sc-if value="{{cur.isSafety}}" hint-placeholder-val="{{false}}"><div class="field"><label for="incno">Incident report number (needed to close a safety concern)</label><input class="search" id="incno" placeholder="e.g. IR-2026-114" value="{{incNo}}" sc-camel-on-change="{{setIncNo}}"></div></sc-if>\n          <div class="field"><label for="resnote">What the owner did to fix it</label>', 'owner panel');

/* 5. NZ code */
rep("    NZ.lgOpenBtn = function () { openLg(",
`    // MEETING7: grievances alerts, owner update, incident number, search
    NZ.gvQ = s.gvQ || ''; NZ.setGvQ = function (e) { self.setState({ gvQ: e.target.value }); };
    NZ.ownUpd = s.ownUpd || ''; NZ.setOwnUpd = function (e) { self.setState({ ownUpd: e.target.value }); };
    NZ.incNo = s.incNo || (cur && cur.incident) || ''; NZ.setIncNo = function (e) { var v = e.target.value; self.setState({ incNo: v, concernStatus: setStatus(cur.id, { incident: v }) }); };
    NZ.postOwnUpd = function () { var tx = String(self.state.ownUpd || '').trim(); if (!tx) return; self.setState({ ownUpd: '', concernStatus: setStatus(cur.id, { latest: tx, latestBy: cur.owner, latestAt: M4now() }) }); };
    var gvA = [];
    all.filter(function (c) { return c.isOpen && c.isSafety; }).forEach(function (c) { gvA.push({ cls: 'gv-al red', text: 'Safety concern: ' + c.title + ' (' + c.patient + '). Chandraji owns it.', btn: 'Family updated', act: function () { self.setState({ cid: c.id, filter: 'open', concernStatus: setStatus(c.id, { latest: 'Family updated by Prabh', latestBy: 'Prabh', latestAt: M4now() }) }); } }); });
    all.filter(function (c) { return c.isOpen && c.stageN === 'chandra' && !c.isSafety; }).forEach(function (c) { gvA.push({ cls: 'gv-al amber', text: c.title + ' (' + c.patient + '): owner is past 6 h. Chandraji has been told.', btn: 'Remind owner', act: function () { self.setState({ cid: c.id, filter: 'owner' }); } }); });
    all.filter(function (c) { return c.stageN === 'confirm'; }).forEach(function (c) { gvA.push({ cls: 'gv-al green', text: c.title + ' (' + c.patient + '): fixed by the owner. Waiting for your call.', btn: 'Show them', act: function () { self.setState({ cid: c.id, filter: 'ready' }); } }); });
    NZ.gvAlerts = gvA.slice(0, 4);
    NZ.lgOpenBtn = function () { openLg(`, 'meeting7 NZ');
/* closing a safety grievance needs the incident number */
rep("    NZ.confirmHappy = function () {\n      var said", "    NZ.confirmHappy = function () {\n      if (cur.isSafety && !(self.state.incNo || cur.incident)) { self.setState({ m4NeedFix: true }); return; }\n      var said", 'happy gate');
rep('<sc-if value="{{m4NeedFix}}" hint-placeholder-val="{{false}}"><div class="note">Write what the owner did first.</div></sc-if>', '<sc-if value="{{m4NeedFix}}" hint-placeholder-val="{{false}}"><div class="note">Write what the owner did first. A safety concern also needs an incident report number.</div></sc-if>', 'note text');

/* 6. category to owner map */
rep("'Family updates': ['Treating psychologist', 'Clinical team'],", "'Family updates': ['Psychology team lead', 'Clinical team'],\n      'Therapist continuity': ['Psychology team lead', 'Clinical team'],\n      'Treatment progress': ['Treating psychiatrist', 'Clinical team'],\n      'Rights': ['Kanika and Chandraji', 'Patient experience, GM Operations'],\n      'Safety': ['Chandraji and treating doctor', 'GM Operations'],", 'routes');
rep("'Other': ['Prabh', 'Patient experience']", "'Other': ['Kanika', 'Patient experience']", 'other');

/* css */
const css = `
/* MEETING7 */
.gv-al{display:flex;align-items:center;justify-content:space-between;gap:12px;border-radius:12px;padding:10px 14px;margin-bottom:8px;border:1px solid;font-size:13.5px}
.gv-al.red{background:#fef3f2;border-color:#fecdca;color:#912018}.gv-al.amber{background:#fffaeb;border-color:#fedf89;color:#8a5a00}.gv-al.green{background:#ecfdf3;border-color:#abefc6;color:#067647}
`;
const cssAt = t.indexOf('</style>', t.indexOf('html{zoom:.75}'));
t = t.slice(0, cssAt) + css + t.slice(cssAt);
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n' + src.slice(i1));
console.log('ok');
