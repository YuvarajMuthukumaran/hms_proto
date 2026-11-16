/* One-off (11 Nov 2026, second review with Nikita): Patient Experience Lead restructure.
   - Nav: Floor round (End of day update + Floor round matrix), Discharge SOP (checklist + collect feedback), IPD follow-ups (report), Weekly report (family updates log)
   - Room cleanliness moves into Floor round, Family updates leaves the nav, grievances become Open / Pending / Closed / All
   - Dashboard "Due for you" becomes reminders; Log issue pop-up; rotation of parameters over 6 days */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING2')) throw new Error('already applied');
const BS = String.fromCharCode(92);

function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}
function between(startMarker, endMarker, label) {
  const s = t.indexOf(startMarker);
  if (s < 0) throw new Error('start marker: ' + label);
  const e = t.indexOf(endMarker, s + startMarker.length);
  if (e < 0) throw new Error('end marker: ' + label);
  return [s, e];
}
function replaceBetween(startMarker, endMarker, withText, label) {
  const [s, e] = between(startMarker, endMarker, label);
  t = t.slice(0, s) + withText + t.slice(e);
}

/* ---------------------------------------------------------------- state / hash */
rep("var SCR = ['today', 'concerns', 'floor', 'clean', 'family', 'dcheck', 'feedback', 'follow', 'report'];",
    "var SCR = ['today', 'concerns', 'floor', 'clean', 'dcheck', 'feedback', 'follow', 'report']; /* MEETING2 */", 'SCR');
rep("dc: {}, dcPid: 'p6'",
    "frG: -1, frm: {}, lg: { open: false, room: '', item: -1, type: 0, pid: '', note: '' }, eodSent: {}, eodMsg: {}, famRaised: {}, dcRem: {}, dc: {}, dcPid: 'p6'", 'state');

/* ---------------------------------------------------------------- grievances: one kind, Open / Pending / Closed / All */
rep("var STATUS = { 'Open': 'chip grey', 'In progress': 'chip blue', 'Escalated': 'chip red', 'Resolved': 'chip green' };",
    "var STATUS = { 'Open': 'chip amber', 'Pending': 'chip blue', 'Closed': 'chip green' };\n    var SMAP = { 'Open': 'Open', 'In progress': 'Pending', 'Escalated': 'Pending', 'Resolved': 'Closed', 'Pending': 'Pending', 'Closed': 'Closed' };", 'STATUS');
rep("statusCls: STATUS[c.status] || 'chip grey',",
    "statusCls: STATUS[SMAP[c.status] || c.status] || 'chip grey', status: SMAP[c.status] || c.status, rawStatus: c.status,", 'statusCls');
rep("sr: '--sr:' + (closed ? '#11703a' : SR[c.type]),",
    "sr: '--sr:' + (closed ? '#11703a' : (SMAP[c.status] === 'Pending' ? '#1e6cdb' : '#d48806')),", 'sr');
rep("var FILTERS = [['open', 'Open'], ['request', 'Requests'], ['concern', 'Concerns'], ['grievance', 'Grievances'], ['all', 'All']];",
    "var FILTERS = [['open', 'Open'], ['pending', 'Pending'], ['closed', 'Closed'], ['all', 'All']];", 'FILTERS');
rep("var match = function (f, c) { return f === 'all' ? true : f === 'open' ? c.isOpen : c.type === f; };",
    "var match = function (f, c) { return f === 'all' ? true : f === 'open' ? c.status === 'Open' : f === 'pending' ? c.status === 'Pending' : c.status === 'Closed'; };", 'match');
/* table: no Type column; detail: no type chip */
rep("<sc-raw-th>Type</sc-raw-th><sc-raw-th>Concern</sc-raw-th>", "<sc-raw-th>Grievance</sc-raw-th>", 'th type');
rep('<sc-raw-td><span class="{{c.tyCls}}">{{c.typeLabel}}</span><div class="muted small">{{c.id}}</div></sc-raw-td>\n                <sc-raw-td><div class="name">{{c.title}}</div><div class="muted small">{{c.category}} · {{c.raisedBy}}</div></sc-raw-td>',
    '<sc-raw-td><div class="name">{{c.title}}</div><div class="muted small">{{c.id}} · {{c.category}} · {{c.raisedBy}}</div></sc-raw-td>', 'td type');
rep('<div class="chead"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="{{cur.tyCls}}">{{cur.typeLabel}}</span><span class="{{cur.statusCls}}">',
    '<div class="chead"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="{{cur.statusCls}}">', 'chead type');
/* the table and the detail share one height, so there is no empty block under the table */
rep('<section class="card" style="flex:3 1 560px;overflow:hidden">\n      <div class="scrollx">\n        <sc-raw-table class="pt">\n          <sc-raw-thead><sc-raw-tr><sc-raw-th>Grievance',
    '<section class="card gv-list" style="flex:3 1 560px;overflow:hidden">\n      <div class="scrollx">\n        <sc-raw-table class="pt">\n          <sc-raw-thead><sc-raw-tr><sc-raw-th>Grievance', 'gv list');
rep('<div class="cols">\n    <section class="card gv-list"', '<div class="cols gv-cols">\n    <section class="card gv-list"', 'gv cols');
/* log drawer: one kind of grievance, severity decides who it goes to */
{
  const [s, e] = between('<div class="field"><label>Type</label>', '<div class="fgrid">', 'drawer type');
  t = t.slice(0, s) + t.slice(e);
}
rep('<div class="field"><label for="ls">Severity</label><sc-raw-select id="ls"><option>Low</option><option selected="selected">Medium</option><option>High</option></sc-raw-select></div>',
    '<div class="field"><label for="ls">Severity</label><sc-raw-select id="ls" value="{{form.sev}}" sc-camel-on-change="{{setSev}}"><option>Low</option><option>Medium</option><option>High</option></sc-raw-select></div>', 'severity');
rep("logOpen: false, form: { type: 'concern', pid: 'p2', category: 'Family updates', desc: '' },",
    "logOpen: false, form: { type: 'concern', pid: 'p2', category: 'Family updates', sev: 'Medium', desc: '' },", 'form state');
rep("var route = s.form.type === 'grievance' ? ['S Chandra', 'GM Operations'] : (R[s.form.category] || R['Other']);",
    "var route = s.form.sev === 'High' ? ['S Chandra', 'GM Operations'] : (R[s.form.category] || R['Other']);", 'route');
rep("var DUE = { request: 'Due by end of day. You are alerted if it slips.', concern: 'Due in 6 hours. You are alerted at 5 hours, and it goes to GM Operations if missed.', grievance: 'Sent to S Chandra (GM Operations) now. Due in 6 hours and fully logged.' };",
    "var DUE = { request: '', concern: 'Due in 6 hours. You are alerted at 5 hours, and it goes to GM Operations if missed.', grievance: 'Sent to S Chandra (GM Operations) now. Due in 6 hours and fully logged.' };", 'DUE');
rep("typeHint: HINT[s.form.type], dueHint: DUE[s.form.type],", "typeHint: '', dueHint: DUE[s.form.sev === 'High' ? 'grievance' : 'concern'], setSev: setForm('sev'),", 'dueHint');
rep("var f = self.state.form, id = 'C-0' + (143 + self.state.extraConcerns.length), t = f.type;\n        var rt = t === 'grievance' ? ['S Chandra', 'GM Operations'] : (R[f.category] || R['Other']);",
    "var f = self.state.form, id = 'C-0' + (143 + self.state.extraConcerns.length), t = f.sev === 'High' ? 'grievance' : 'concern';\n        var rt = f.sev === 'High' ? ['S Chandra', 'GM Operations'] : (R[f.category] || R['Other']);", 'saveConcern');
rep("sla: t === 'request' ? 'Due by end of day' : '6 h left', slaTone: 'grey', logged: 'just now', status: t === 'grievance' ? 'Escalated' : 'Open', desc: f.desc || 'No description added.' };",
    "sla: '6 h left', slaTone: 'grey', logged: 'just now', status: t === 'grievance' ? 'Pending' : 'Open', desc: f.desc || 'No description added.' };", 'saveConcern2');
/* today dashboard: one list of grievances, no separate requests card */
rep("todayConcerns: openC.filter(function (c) { return c.type !== 'request'; }).slice(0, 4),", "todayConcerns: openC.slice(0, 5),", 'todayConcerns');
rep('<div class="chead"><h3>Concerns on the clock</h3>', '<div class="chead"><h3>Grievances on the clock</h3>', 'clock title');
replaceBetween('      <section class="card">\n        <div class="chead"><h3>Family call requests</h3>', '      <section class="card">\n        <div class="chead"><h3>On the floor today</h3>', '', 'requests card');
rep("goStays: go('today'), goFloor: go('floor'),", "goStays: go('today'), goFloor: go('clean'),", 'goFloor');
rep('<button class="btn" type="button" sc-camel-on-click="{{goFloor}}">Start floor round</button>', '<button class="btn" type="button" sc-camel-on-click="{{goFloor}}">Start floor round</button>', 'noop');

/* ---------------------------------------------------------------- dashboard: "Due for you" becomes reminders */
rep('<sc-raw-th>Due for you</sc-raw-th>', '<sc-raw-th>Reminders</sc-raw-th>', 'th reminders');
{
  const [s, e] = between('<sc-raw-td><div class="due"><sc-for list="{{p.due}}"', '<sc-raw-td><div class="name">{{p.guardianName}}</div>', 'due cell');
  t = t.slice(0, s) +
    '<sc-raw-td><div class="due rm"><sc-for list="{{p.due}}" as="d" hint-placeholder-count="2"><div class="rm-r"><span class="{{d.dot}}"></span><span class="rm-t"><span class="name">{{d.t}}</span><br><span class="muted small">{{d.s}}</span></span><sc-if value="{{d.hasBtn}}" hint-placeholder-val="{{false}}"><button class="{{d.btnCls}}" type="button" sc-camel-on-click="{{d.act}}">{{d.btnLabel}}</button></sc-if></div></sc-for><sc-if value="{{p.noDue}}" hint-placeholder-val="{{false}}"><span class="muted small">Nothing to remind anyone about</span></sc-if></div></sc-raw-td>\n              ' +
    t.slice(e);
}
{
  const a = "var due = [];\n      x.od.forEach(function (n) { due.push({ dot: 'dot d-red', t: n, s: 'overdue' }); });\n      x.du.forEach(function (n) { due.push({ dot: 'dot d-amber', t: n, s: 'today' }); });\n      if (x.pc) due.push({ dot: 'dot d-blue', t: x.pc + ' open concern' + (x.pc > 1 ? 's' : ''), s: 'on the clock' });";
  const b = String.raw`var due = [];
      STEPS.forEach(function (step, si) {
        var st = x.sts[si];
        if (st !== 'overdue' && st !== 'due') return;
        var key = p.id + ':' + si, sent = !!s.reminded[key];
        var who = step.owner === 'Psychiatrist' ? p.doctor : step.owner === 'Psychologist' ? p.psych : 'You';
        var auto = !!step.auto;
        due.push({ dot: 'dot ' + (st === 'overdue' ? 'd-red' : 'd-amber'), t: step.name + (auto ? ' (' + step.when + ')' : ''), s: (st === 'overdue' ? 'Overdue' : 'Due today') + ' · ' + who,
          hasBtn: true, btnLabel: auto ? (sent ? 'Reminder sent' : 'Remind ' + step.owner.toLowerCase()) : 'Mark done', btnCls: 'btn sm' + (sent ? ' ok' : ''),
          act: function (e) { if (e && e.stopPropagation) e.stopPropagation(); var m = Object.assign({}, auto ? self.state.reminded : self.state.overrides); m[key] = auto ? true : 'done'; self.setState(auto ? { reminded: m } : { overrides: m }); } });
      });
      if (x.pc) due.push({ dot: 'dot d-blue', t: x.pc + ' open grievance' + (x.pc > 1 ? 's' : ''), s: 'On the clock', hasBtn: false });`;
  rep(a, b, 'due build');
  rep("due: due.slice(0, 3), noDue: due.length === 0,", "due: due.slice(0, 4), noDue: due.length === 0,", 'due slice');
}

/* ---------------------------------------------------------------- floor round: new markup */
const FLOOR_TABS = String.raw`<div class="seg fl-tabs" role="tablist"><sc-for list="{{floorTabs}}" as="g" hint-placeholder-count="2"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}}<sc-if value="{{g.has}}" hint-placeholder-val="{{false}}"> <span class="n">{{g.n}}</span></sc-if></button></sc-for></div>`;

const EOD_MARKUP = `<!-- ============ END OF DAY UPDATE (per person) ============ -->
<sc-if value="{{isFloor}}" hint-placeholder-val="{{false}}">
  <div class="hello">
    <div><h2>Floor round</h2><div class="muted">Each person on the floor sends their own update at the end of the day. An issue goes straight to the team that owns it.</div></div>
    ${FLOOR_TABS}
  </div>
  <div class="toolbar">
    <div class="seg" role="tablist"><sc-for list="{{floorSegs}}" as="g" hint-placeholder-count="3"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}}</button></sc-for></div>
    <div class="eod-sum"><b>{{eodIn}}</b> of {{eodTotal}} updates in <span class="muted">for {{floorName}}</span> <span class="eod-iss">{{eodIssueText}}</span></div>
  </div>
  <div class="fr-walk eod-walk" aria-hidden="true"><sc-for list="{{eodStrip}}" as="z" hint-placeholder-count="7"><i class="{{z.cls}}"></i></sc-for></div>
  <div class="eod-grid">
    <sc-for list="{{eodPeople}}" as="o" hint-placeholder-count="7">
      <section class="card eod-card">
        <div class="eod-h"><div class="avatar av-tint" style="width:36px;height:36px;font-size:12px">{{o.ini}}</div><div class="grow"><div class="name">{{o.role}}</div><div class="muted small">{{o.who}}</div></div><span class="{{o.chip}}">{{o.status}}</span></div>
        <div>
          <sc-for list="{{o.items}}" as="f" hint-placeholder-count="1">
            <div class="{{f.rowCls}}">
              <div class="fr-state" aria-hidden="true"></div>
              <div class="fr-txt"><div class="name">{{f.label}}</div></div>
              <div class="fr-tog" role="group" aria-label="{{f.label}}"><button class="{{f.okCls}}" type="button" sc-camel-on-click="{{f.ok}}">OK</button><button class="{{f.isCls}}" type="button" sc-camel-on-click="{{f.issue}}">Issue</button></div>
              <div class="fr-extra"><div><span class="fr-due">Goes to {{f.owner}}, due in 4 hours</span><input aria-label="What is wrong: {{f.label}}" placeholder="What did you see? (optional)" value="{{f.note}}" sc-camel-on-change="{{f.setNote}}"></div></div>
            </div>
          </sc-for>
        </div>
        <div class="eod-f"><button class="{{o.btnCls}}" type="button" sc-camel-on-click="{{o.send}}">{{o.btnLabel}}</button><span class="muted small">{{o.msg}}</span></div>
      </section>
    </sc-for>
  </div>
</sc-if>

`;
replaceBetween('<!-- ============ FLOOR ROUND ============ -->', '<!-- ============ DISCHARGE FEEDBACK (FORM 6) ============ -->', EOD_MARKUP, 'floor markup');

/* ---------------------------------------------------------------- floor round: room matrix (replaces Room cleanliness) */
const MATRIX_MARKUP = `<!-- ============ FLOOR ROUND (room matrix) ============ -->
<sc-if value="{{isClean}}" hint-placeholder-val="{{false}}">
  <div class="hello">
    <div><h2>Floor round</h2><div class="muted">{{frIntro}}</div></div>
    ${FLOOR_TABS}
  </div>
  <section class="card">
    <div class="cpad lz-stack" style="gap:12px">
      <div class="toolbar">
        <div class="seg" role="tablist"><sc-for list="{{clFloors}}" as="g" hint-placeholder-count="3"><button class="{{g.cls2}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div>
        <button class="btn pri" type="button" sc-camel-on-click="{{lgOpenBtn}}">Log issue</button>
      </div>
      <div class="fm-days" role="tablist" aria-label="Parameters, one set a day"><sc-for list="{{frDays}}" as="d" hint-placeholder-count="6"><button class="{{d.cls}}" type="button" sc-camel-on-click="{{d.go}}"><span class="fm-dn">{{d.day}}</span><span class="fm-dt">{{d.title}}</span><sc-if value="{{d.today}}" hint-placeholder-val="{{false}}"><span class="fm-today">Today</span></sc-if></button></sc-for></div>
      <div class="lz-prog"><div class="lz-bar"><i class="{{clBarCls}}" style="width:{{clPct}}"></i></div><b>{{clDoneText}}</b></div>
      <div class="muted small">Tap a box: once for OK, again to log an issue, a third time to clear it. <b>All OK</b> fills a whole room.</div>
    </div>
    <div class="fm-scroll">
      <div class="fm-grid fm-head" style="{{frGrid}}"><div>Room</div><div>Patients</div><sc-for list="{{frCols}}" as="c" hint-placeholder-count="5"><div class="fm-col" title="{{c.full}}">{{c.label}}</div></sc-for><div></div></div>
      <sc-for list="{{frRows}}" as="r" hint-placeholder-count="10">
        <div class="{{r.rowCls}}" style="{{frGrid}}">
          <div class="fm-room"><b>{{r.no}}</b><span>{{r.sub}}</span></div>
          <div class="fm-pts"><sc-for list="{{r.pts}}" as="q" hint-placeholder-count="2"><span class="fm-pt">{{q.n}}</span></sc-for><sc-if value="{{r.vacant}}" hint-placeholder-val="{{false}}"><span class="muted small">Vacant</span></sc-if></div>
          <sc-for list="{{r.cells}}" as="x" hint-placeholder-count="5"><button class="{{x.cls}}" type="button" title="{{x.title}}" aria-label="{{x.title}}" sc-camel-on-click="{{x.tap}}">{{x.txt}}</button></sc-for>
          <div><button class="btn sm" type="button" sc-camel-on-click="{{r.allOk}}">All OK</button></div>
        </div>
      </sc-for>
    </div>
    <sc-if value="{{frHasMsg}}" hint-placeholder-val="{{false}}"><div class="cpad"><div class="info" aria-live="polite">{{frMsg}}</div></div></sc-if>
  </section>
</sc-if>

<!-- ============ LOG ISSUE (pop-up) ============ -->
<sc-if value="{{lgOpen}}" hint-placeholder-val="{{false}}">
  <div class="overlay mid">
    <div class="drawer modal" role="dialog" aria-label="Log issue">
      <div class="toolbar"><h3 style="font-size:18px">Log issue</h3><button class="btn sm link" type="button" sc-camel-on-click="{{lgClose}}">Close</button></div>
      <div class="fgrid">
        <div class="field"><label for="lgr">Room</label><sc-raw-select id="lgr" value="{{lgRoom}}" sc-camel-on-change="{{lgSetRoom}}"><sc-for list="{{lgRoomOpts}}" as="o" hint-placeholder-count="10"><option value="{{o.v}}">{{o.l}}</option></sc-for></sc-raw-select></div>
        <div class="field"><label for="lgp">Patient</label><sc-raw-select id="lgp" value="{{lgPid}}" sc-camel-on-change="{{lgSetPid}}"><sc-for list="{{lgPtOpts}}" as="o" hint-placeholder-count="2"><option value="{{o.v}}">{{o.l}}</option></sc-for></sc-raw-select></div>
      </div>
      <div class="field"><label for="lgi">Which check</label><sc-raw-select id="lgi" value="{{lgItem}}" sc-camel-on-change="{{lgSetItem}}"><sc-for list="{{lgItemOpts}}" as="o" hint-placeholder-count="6"><option value="{{o.v}}">{{o.l}}</option></sc-for></sc-raw-select></div>
      <div class="field"><label>What kind of issue is it?</label><div class="lz-chips"><sc-for list="{{lgTypes}}" as="b" hint-placeholder-count="9"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>
      <div class="field"><label for="lgn">What did you see?</label><textarea id="lgn" placeholder="A few words are enough" value="{{lgNote}}" sc-camel-on-change="{{lgSetNote}}"></textarea></div>
      <div class="info">Goes to <b>{{lgOwner}}</b> ({{lgOwnerRole}}), due in 4 hours. It also appears in Grievances.</div>
      <div style="display:flex;gap:8px;margin-top:auto"><button class="btn pri" type="button" sc-camel-on-click="{{lgSave}}">Save issue</button><button class="btn" type="button" sc-camel-on-click="{{lgClose}}">Cancel</button></div>
    </div>
  </div>
</sc-if>

`;
replaceBetween('<!-- ============ ROOM CLEANLINESS ============ -->', '<!-- ============ FAMILY UPDATES ============ -->', MATRIX_MARKUP, 'matrix markup');

/* ---------------------------------------------------------------- discharge SOP: tabs, read-only progress, collect feedback */
const DC_TABS = String.raw`<div class="seg fl-tabs" role="tablist"><sc-for list="{{dcTabs}}" as="g" hint-placeholder-count="2"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}}<sc-if value="{{g.has}}" hint-placeholder-val="{{false}}"> <span class="n">{{g.n}}</span></sc-if></button></sc-for></div>`;

/* feedback screen: add the Discharge SOP header + tabs above the go card */
rep('<sc-if value="{{isFeedback}}" hint-placeholder-val="{{false}}">\n  <div class="{{fbGoCls}}">',
    '<sc-if value="{{isFeedback}}" hint-placeholder-val="{{false}}">\n  <div class="hello"><div><h2>Discharge SOP</h2><div class="muted">Checklist progress, then the family\'s feedback.</div></div>' + DC_TABS + '</div>\n  <div class="{{fbGoCls}}">', 'fb header');
/* checklist screen */
rep('<sc-if value="{{isDcheck}}" hint-placeholder-val="{{false}}">\n  <div class="{{dcGoCls}}">',
    '<sc-if value="{{isDcheck}}" hint-placeholder-val="{{false}}">\n  <div class="hello"><div><h2>Discharge SOP</h2><div class="muted">The ward team fills in the checklist. You follow it here, remind whoever is behind, then collect the family\'s feedback.</div></div>' + DC_TABS + '</div>\n  <div class="{{dcGoCls}}">', 'dc header');
/* the checklist body is read only for patient experience: the ward team ticks it in the doctor portal */
rep('<section class="card"><div class="cpad lz-stack">\n    <div class="lz-chips"><sc-for list="{{dcPatients}}"',
    '<section class="card"><div class="cpad lz-stack">\n    <div class="info">Read only. The psychiatrist, psychologist, duty nurse, front desk and billing tick their own items in the doctor portal. You can tick the items that are yours.</div>\n    <div class="lz-chips"><sc-for list="{{dcPatients}}"', 'dc readonly note');
{
  const anchor = '  <sc-for list="{{dcSecA}}" as="g" hint-placeholder-count="2">';
  const owners = String.raw`  <section class="card">
    <div class="chead"><h3>Who has done what</h3><span class="muted small">Must-do items, by person</span></div>
    <div class="dc-own">
      <sc-for list="{{dcOwners}}" as="o" hint-placeholder-count="6">
        <div class="dc-own-r"><span class="name">{{o.role}}</span><div class="bar blue"><i style="width:{{o.pct}}"></i></div><span class="{{o.chip}}">{{o.txt}}</span><sc-if value="{{o.canRemind}}" hint-placeholder-val="{{false}}"><button class="{{o.remCls}}" type="button" sc-camel-on-click="{{o.remind}}">{{o.remLabel}}</button></sc-if></div>
      </sc-for>
    </div>
  </section>

  <div class="dc-ro">
`;
  rep(anchor, owners + anchor, 'dc owners');
}
/* close the read-only wrapper after the sign-off card, replace the bottom actions */
{
  const [s, e] = between('  <sc-if value="{{dcDone}}" hint-placeholder-val="{{false}}"><section class="card"><div class="cpad lz-stack"><div class="info">{{dcDoneText}}</div>', '<!-- ============ FOLLOW-UPS ============ -->', 'dc bottom');
  const bottom = String.raw`  </div>

  <section class="card"><div class="cpad lz-stack">
    <sc-if value="{{dcDone}}" hint-placeholder-val="{{false}}"><div class="info">{{dcDoneText}}</div></sc-if>
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <button class="btn pri lz-big" type="button" sc-camel-on-click="{{dcCollect}}">Collect feedback</button>
      <sc-if value="{{dcDone}}" hint-placeholder-val="{{false}}"><button class="btn lz-big" type="button" sc-camel-on-click="{{goFollow}}">Open IPD follow-ups</button></sc-if>
      <span class="muted">{{dcCollectHint}}</span>
    </div>
    <sc-if value="{{dcShowBlocks}}" hint-placeholder-val="{{false}}"><div class="note"><b>Still open on the ward side:</b><sc-for list="{{dcBlocks}}" as="b" hint-placeholder-count="3"><div>· {{b.t}}</div></sc-for></div></sc-if>
    <sc-if value="{{dcOpenFinal}}" hint-placeholder-val="{{true}}"><div><button class="btn link" type="button" sc-camel-on-click="{{dcSim}}">Demo only: show the ward team finishing the checklist</button></div></sc-if>
  </div></section>
</sc-if>

`;
  t = t.slice(0, s) + bottom + t.slice(e);
}

/* ---------------------------------------------------------------- IPD follow-ups: a report */
{
  const [s, e] = between('  <div class="{{fuGoCls}}">', '  <sc-if value="{{fuHasTomorrow}}"', 'fu go');
  const head = String.raw`  <div class="hello">
    <div><h2>IPD follow-ups</h2><div class="muted">A report, not a to-do list. Every row is made by itself from a discharge checklist: the doctor and psychologist OPD dates, and the Day-14 and Day-30 calls.</div></div>
  </div>
  <div class="tiles"><sc-for list="{{fuTiles}}" as="t" hint-placeholder-count="5"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for></div>
`;
  t = t.slice(0, s) + head + t.slice(e);
}
{
  const [s, e] = between('  <div class="lz-chips" id="fu-list" role="tablist">', '  <div class="lz-line">{{fuCame}}</div>', 'fu cards');
  const tbl = String.raw`  <div class="seg" id="fu-list" role="tablist"><sc-for list="{{fuSegs}}" as="g" hint-placeholder-count="5"><button class="{{g.cls2}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div>
  <section class="card" style="overflow:hidden">
    <div class="scrollx">
      <sc-raw-table class="pt">
        <sc-raw-thead><sc-raw-tr><sc-raw-th>Patient</sc-raw-th><sc-raw-th>Follow-up</sc-raw-th><sc-raw-th>Due</sc-raw-th><sc-raw-th>What happened</sc-raw-th><sc-raw-th>Family</sc-raw-th><sc-raw-th>Made from</sc-raw-th><sc-raw-th></sc-raw-th></sc-raw-tr></sc-raw-thead>
        <sc-raw-tbody>
          <sc-for list="{{fuRows}}" as="f" hint-placeholder-count="6">
            <sc-raw-tr style="{{f.sr}}">
              <sc-raw-td><div class="name">{{f.name}}</div><div class="muted small">Discharged {{f.dischTxt}}</div></sc-raw-td>
              <sc-raw-td><div>{{f.kind}}</div><div class="muted small">{{f.with}}</div></sc-raw-td>
              <sc-raw-td><span class="{{f.dueCls}}">{{f.dueTxt}}</span></sc-raw-td>
              <sc-raw-td><div>{{f.outcomeTxt}}</div><div class="small" style="{{f.flagStyle}}">{{f.flag}}</div></sc-raw-td>
              <sc-raw-td><div>{{f.family}}</div><div class="muted small">{{f.phone}}</div></sc-raw-td>
              <sc-raw-td><span class="muted small">{{f.madeFrom}}</span></sc-raw-td>
              <sc-raw-td><sc-if value="{{f.canRemind}}" hint-placeholder-val="{{false}}"><button class="{{f.remCls}}" type="button" sc-camel-on-click="{{f.remind}}">{{f.remLabel}}</button></sc-if></sc-raw-td>
            </sc-raw-tr>
          </sc-for>
        </sc-raw-tbody>
      </sc-raw-table>
    </div>
    <sc-if value="{{fuEmpty}}" hint-placeholder-val="{{false}}"><div class="cpad muted">Nothing in this list.</div></sc-if>
  </section>
`;
  t = t.slice(0, s) + tbl + t.slice(e);
}
/* rows carry the plain-words outcome and where they were made from */
rep("      return Object.assign({}, f, { diff: diff, closed: closed, lost: lost, missed: missed, stale: stale, noAns3: noAns3, flag: flag,",
    "      return Object.assign({}, f, { outcomeTxt: o || 'Not updated yet', madeFrom: 'Discharge checklist, ' + dm(f.disch), diff: diff, closed: closed, lost: lost, missed: missed, stale: stale, noAns3: noAns3, flag: flag,", 'fu rows');

/* ---------------------------------------------------------------- weekly report: family updates log */
{
  const a = '    </section>\n  </div>\n</sc-if>\n\n</main>';
  const log = String.raw`    </section>
  </div>
  <section class="card" style="overflow:hidden">
    <div class="chead"><h3>Family updates this week</h3><span class="muted small">Sent by each psychologist. You only check the log: did every family get one, and is it the same text again?</span></div>
    <div class="scrollx">
      <sc-raw-table class="pt">
        <sc-raw-thead><sc-raw-tr><sc-raw-th>Patient</sc-raw-th><sc-raw-th>Sent by</sc-raw-th><sc-raw-th>Updates sent</sc-raw-th><sc-raw-th>Last sent</sc-raw-th><sc-raw-th>Check</sc-raw-th><sc-raw-th></sc-raw-th></sc-raw-tr></sc-raw-thead>
        <sc-raw-tbody>
          <sc-for list="{{famLog}}" as="r" hint-placeholder-count="4">
            <sc-raw-tr style="{{r.sr}}">
              <sc-raw-td><div class="name">{{r.name}}</div><div class="muted small">{{r.room}}</div></sc-raw-td>
              <sc-raw-td>{{r.by}}</sc-raw-td>
              <sc-raw-td><div class="fam-dots"><sc-for list="{{r.days}}" as="d" hint-placeholder-count="7"><i class="{{d.cls}}" title="{{d.t}}"></i></sc-for></div><div class="muted small">{{r.count}} of 7 days</div></sc-raw-td>
              <sc-raw-td>{{r.last}}</sc-raw-td>
              <sc-raw-td><span class="{{r.chip}}">{{r.flag}}</span></sc-raw-td>
              <sc-raw-td><sc-if value="{{r.canRaise}}" hint-placeholder-val="{{false}}"><button class="{{r.raiseCls}}" type="button" sc-camel-on-click="{{r.raise}}">{{r.raiseLabel}}</button></sc-if></sc-raw-td>
            </sc-raw-tr>
          </sc-for>
        </sc-raw-tbody>
      </sc-raw-table>
    </div>
  </section>
</sc-if>

</main>`;
  rep(a, log, 'report log');
}

/* ---------------------------------------------------------------- logic */
const LOGIC = String.raw`
    // ===== MEETING2: floor round matrix, end of day update, discharge SOP, reminders =====
    var DOY = Math.round((TODAY - new Date(2026, 0, 0)) / 86400000);
    var todayG = (DOY - 1) % 6, selG = s.frG >= 0 ? s.frG : todayG;
    var FRG = [
      ['General room area', ['Furniture dusted', 'Surfaces wiped', 'Cobwebs removed', 'Floor mopped', 'Stains removed', 'Walls clean', 'Switches, sockets', 'AC vents']],
      ['Bed and bedding', ['Bed frame', 'Mattress', 'Linen changed', 'Bedding tidy']],
      ['Bathroom safety and hygiene', ['Toilet', 'No leaks', 'Sink, taps', 'Drains', 'Shower', 'No mould', 'Floor mopped', 'Window glass', 'Supplies']],
      ['Patient items', ['Belongings neat', 'Shared equipment']],
      ['Safety and hygiene', ['Bins emptied', 'Medical waste', 'Sanitiser', 'No spills', 'Odour']],
      ['Final checks', ['Room tidy', 'Furniture in place', 'Pathways clear']]
    ];
    var POOL = ['Rohit Verma', 'Anil Kapoor', 'Sanjay Nair', 'Imran Qureshi', 'Deepak Joshi', 'Vikram Bhatia', 'Suresh Rao', 'Manoj Pillai', 'Harish Gupta', 'Tarun Sethi', 'Nitin Arora', 'Ajay Menon', 'Kabir Saxena', 'Pradeep Iyer'];
    var OCC_FIX = { '210': ['Arjun Mehta'], '211': ['Varun Rao'], '213': ['Neel Bose'], '310': ['Meera Iyer'], '313': ['Kavya Menon'] };
    var occ = function (fl, rm) {
      if (OCC_FIX[rm]) return OCC_FIX[rm];
      var n = +rm, h = (n * 7 + (fl === 'f2' ? 3 : fl === 'f3' ? 5 : 1)) % 11, c = [1, 2, 1, 0, 3, 1, 2, 1, 0, 2, 1][h], r = [];
      for (var k = 0; k < c; k++) r.push(POOL[(n + k * 5) % POOL.length]);
      return r;
    };
    var frSeedOk = { 'f2:201': 1, 'f2:202': 1, 'f2:203': 1, 'f2:204': 1, 'f2:205': 1 };
    var frGet = function (fl, rm, g, i) {
      var k = fl + ':' + rm + ':' + g + ':' + i;
      if (s.frm[k] !== undefined) return s.frm[k];
      if (g === todayG) {
        if (frSeedOk[fl + ':' + rm]) return 'ok';
        if (fl === 'f2' && rm === '206') return i === 1 ? 'issue' : i < 4 ? 'ok' : '';
      }
      return '';
    };
    var frPut = function (k, v, extra) { var m = Object.assign({}, self.state.frm); m[k] = v; self.setState(Object.assign({ frm: m, frMsg: '' }, extra || {})); };
    var ITYPES = [['Cleaning', 'Housekeeping supervisor', 'Housekeeping'], ['Bed or bedding', 'Housekeeping supervisor', 'Housekeeping'], ['Bathroom safety', 'Nursing in-charge', 'Nursing'], ['Electrical', 'Maintenance', 'Electrical'], ['Plumbing', 'Maintenance', 'Plumbing'], ['Civil', 'Maintenance', 'Civil'], ['TV and set top box', 'Maintenance', 'TV and remote'], ['Patient belongings', 'Front desk', 'Admissions'], ['Other', 'Prabh', 'Patient experience']];
    var colN = FRG[selG][1].length;
    var frDone = function (fl, rm) { var all5 = true; for (var i = 0; i < colN; i++) if (!frGet(fl, rm, selG, i)) all5 = false; return all5; };
    var frBad = function (fl, rm) { for (var i = 0; i < colN; i++) if (frGet(fl, rm, selG, i) === 'issue') return true; return false; };
    var frFloorDone = function (fl) { return ROOMS[fl].filter(function (r) { return frDone(fl, r); }).length; };
    var lgn = s.lg;
    var lgPut = function (patch) { self.setState({ lg: Object.assign({}, lgn, patch) }); };
    var openLg = function (rm, item, floorId) { self.setState({ lg: { open: true, room: rm, item: item, type: item >= 0 && selG === 2 ? 2 : 0, pid: '', note: '' }, frMsg: '' }); };
    var lgRoom = lgn.room || ROOMS[s.clFloor][0];
    var lgPts = occ(s.clFloor, lgRoom);
    var lgT = ITYPES[lgn.type] || ITYPES[0];
    var NZ = {};
    NZ.isClean = s.screen === 'clean';
    NZ.frIntro = 'Walk the floor room by room. A different set of checks comes up each day, so all six are covered every six days. Today is day ' + (todayG + 1) + ' of 6.';
    NZ.clFloors = ['f1', 'f2', 'f3'].map(function (f) { return { label: CLFL[f], n: frFloorDone(f) + '/' + ROOMS[f].length, cls2: s.clFloor === f ? 'on' : '', go: function () { self.setState({ clFloor: f, clRoom: ROOMS[f][0], frMsg: '' }); } }; });
    NZ.frDays = FRG.map(function (g, gi) { return { day: 'Day ' + (gi + 1), title: g[0], today: gi === todayG, cls: 'fm-day' + (gi === selG ? ' on' : ''), go: function () { self.setState({ frG: gi, frMsg: '' }); } }; });
    var fDone = frFloorDone(s.clFloor), fN = ROOMS[s.clFloor].length;
    NZ.clPct = Math.round(fDone / fN * 100) + '%'; NZ.clBarCls = fDone === fN ? 'full' : '';
    NZ.clDoneText = fDone + ' of ' + fN + ' rooms done on ' + CLFL[s.clFloor] + ' · ' + FRG[selG][0];
    NZ.frCols = FRG[selG][1].map(function (lab, i) { return { label: lab, full: CLS[selG][1][i][1] }; });
    NZ.frGrid = 'grid-template-columns:78px minmax(150px,1.3fr) repeat(' + colN + ',minmax(58px,1fr)) 74px';
    NZ.frRows = ROOMS[s.clFloor].map(function (rm) {
      var pts = occ(s.clFloor, rm), done = frDone(s.clFloor, rm), bad = frBad(s.clFloor, rm);
      var cells = FRG[selG][1].map(function (lab, i) {
        var v = frGet(s.clFloor, rm, selG, i), key = s.clFloor + ':' + rm + ':' + selG + ':' + i;
        return { cls: 'fm-c' + (v ? ' ' + v : ''), txt: v === 'ok' ? '✓' : v === 'issue' ? '!' : '', title: 'Room ' + rm + ', ' + CLS[selG][1][i][1] + (v ? ': ' + (v === 'ok' ? 'OK' : 'issue') : ': not checked'),
          tap: function () { if (!v) frPut(key, 'ok'); else if (v === 'ok') openLg(rm, i); else frPut(key, ''); } };
      });
      return { no: rm, sub: bad ? 'Issue' : done ? 'Done' : 'To check', rowCls: 'fm-grid fm-row' + (bad ? ' bad' : done ? ' done' : ''), pts: pts.map(function (n) { return { n: n }; }), vacant: pts.length === 0, cells: cells,
        allOk: function () { var m = Object.assign({}, self.state.frm); for (var i = 0; i < colN; i++) { var k2 = s.clFloor + ':' + rm + ':' + selG + ':' + i; if (frGet(s.clFloor, rm, selG, i) !== 'issue') m[k2] = 'ok'; } self.setState({ frm: m, frMsg: '' }); } };
    });
    NZ.frMsg = s.frMsg || ''; NZ.frHasMsg = !!s.frMsg;
    NZ.lgOpenBtn = function () { openLg(ROOMS[s.clFloor][0], -1); };
    NZ.lgOpen = !!lgn.open; NZ.lgClose = function () { self.setState({ lg: Object.assign({}, lgn, { open: false }) }); };
    NZ.lgRoom = lgRoom; NZ.lgSetRoom = function (e) { lgPut({ room: e.target.value, pid: '' }); };
    NZ.lgRoomOpts = ROOMS[s.clFloor].map(function (r) { return { v: r, l: CLFL[s.clFloor] + ', Room ' + r }; });
    NZ.lgPid = lgn.pid; NZ.lgSetPid = function (e) { lgPut({ pid: e.target.value }); };
    NZ.lgPtOpts = [{ v: '', l: 'Whole room' }].concat(lgPts.map(function (n) { return { v: n, l: n }; }));
    NZ.lgItem = String(lgn.item); NZ.lgSetItem = function (e) { lgPut({ item: +e.target.value }); };
    NZ.lgItemOpts = [{ v: '-1', l: 'Something else' }].concat(FRG[selG][1].map(function (lab, i) { return { v: String(i), l: FRG[selG][0] + ': ' + CLS[selG][1][i][1] }; }));
    NZ.lgTypes = ITYPES.map(function (x, i) { return { label: x[0], cls: 'lz-chip sm' + (lgn.type === i ? ' on' : ''), pick: function () { lgPut({ type: i }); } }; });
    NZ.lgNote = lgn.note; NZ.lgSetNote = function (e) { lgPut({ note: e.target.value }); };
    NZ.lgOwner = lgT[1]; NZ.lgOwnerRole = lgT[2];
    NZ.lgSave = function () {
      var what = lgn.item >= 0 ? CLS[selG][1][lgn.item][1] : 'General issue';
      var extra = self.state.extraConcerns.slice(), roomTxt = CLFL[s.clFloor] + ', Room ' + lgRoom;
      extra.push({ id: 'C-0' + (190 + extra.length), type: 'concern', pid: '', pname: lgn.pid ? lgn.pid + ' (' + roomTxt + ')' : roomTxt, title: 'Room ' + lgRoom + ': ' + (lgn.item >= 0 ? what : lgT[0].toLowerCase()), raisedBy: 'Floor round, Prabh', via: 'Floor round', owner: lgT[1], ownerRole: lgT[2], category: 'Room and housekeeping', sla: '4 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: lgT[0] + ': ' + (lgn.note || what) + (lgn.pid ? '. Patient: ' + lgn.pid : '') });
      var m = Object.assign({}, self.state.frm);
      if (lgn.item >= 0) m[s.clFloor + ':' + lgRoom + ':' + selG + ':' + lgn.item] = 'issue';
      self.setState({ extraConcerns: extra, frm: m, lg: { open: false, room: '', item: -1, type: 0, pid: '', note: '' }, frMsg: 'Issue saved for Room ' + lgRoom + ' and sent to ' + lgT[1] + '.' });
    };

    // --- end of day update: one card per person
    var EODP = [['HK', 'Housekeeping supervisor', 'Day shift', [0]], ['KS', 'Kitchen supervisor', 'With dietician', [1, 2]], ['FS', 'Floor supervisor', 'Day shift', [3]], ['SC', 'Security', 'Floor door', [4]], ['PL', 'Psychology team lead', 'Psychology team', [5]], ['NI', 'Nursing in-charge', 'Sister Rekha (Floor 2)', [6]], ['PX', 'Patient experience', 'Prabh (you)', [7]]];
    var eodRows = EODP.map(function (pp, pi) {
      var key = s.floor + ':' + pi, items = pp[3].map(function (i) { return floorItems[i]; }), marked = items.filter(function (x) { return x.mark; }).length, nIss = items.filter(function (x) { return x.mark === 'issue'; }).length;
      var sent = s.eodSent[key], msg = s.eodMsg[key] || '';
      var status = sent ? 'Sent ' + sent : marked ? 'In progress' : 'Not started';
      var chip = 'chip ' + (sent ? (nIss ? 'red' : 'green') : marked ? 'amber' : 'grey');
      return { ini: pp[0], role: pp[1], who: pp[2], items: items, status: sent && nIss ? status + ' · ' + nIss + (nIss === 1 ? ' issue' : ' issues') : status, chip: chip, sent: !!sent, nIss: nIss, marked: marked, total: items.length, msg: msg || (sent ? '' : (marked === items.length ? 'Ready to send.' : '')),
        btnLabel: sent ? 'Update sent' : 'Send update', btnCls: 'btn sm' + (sent ? ' ok' : ' pri'),
        send: function () {
          if (sent) return;
          var em = Object.assign({}, self.state.eodMsg);
          if (marked < items.length) { em[key] = 'Mark each check OK or Issue first.'; self.setState({ eodMsg: em }); return; }
          var es = Object.assign({}, self.state.eodSent), fs2 = Object.assign({}, self.state.floorSent), extra = self.state.extraConcerns.slice();
          es[key] = nowTime(); em[key] = '';
          pp[3].forEach(function (i) {
            var fk = s.floor + ':' + i;
            if (s.floorMarks[fk] === 'issue' && !fs2[fk]) {
              fs2[fk] = true;
              extra.push({ id: 'C-0' + (143 + extra.length + 20), type: 'concern', pid: '', pname: FL[s.floor], title: d.FLOOR[i][0] + ': not OK at the end of the day', raisedBy: 'End of day update, ' + pp[1], via: 'End of day update', owner: d.FLOOR[i][1], ownerRole: d.FLOOR[i][1], category: 'Other', sla: '4 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: s.floorNotes[fk] || 'Marked as an issue in the end of day update for ' + FL[s.floor] + '.' });
            }
          });
          self.setState({ eodSent: es, eodMsg: em, floorSent: fs2, extraConcerns: extra });
        } };
    });
    NZ.eodPeople = eodRows;
    NZ.eodIn = eodRows.filter(function (r) { return r.sent; }).length; NZ.eodTotal = eodRows.length;
    var eodIssues = eodRows.reduce(function (a, r) { return a + r.nIss; }, 0);
    NZ.eodIssueText = eodIssues ? eodIssues + (eodIssues === 1 ? ' issue' : ' issues') + ' flagged' : '';
    NZ.eodStrip = eodRows.map(function (r) { return { cls: r.sent ? (r.nIss ? 'issue' : 'ok') : '' }; });
    NZ.floorSegs = ['f1', 'f2', 'f3'].map(function (f) { return { label: FL[f], cls: s.floor === f ? 'on' : '', go: function () { self.setState({ floor: f, roundDone: false, roundMsg: '' }); } }; });
    var fgo = function (scr) { return function () { try { history.replaceState(null, '', '#' + scr); } catch (e) {} self.setState({ screen: scr }); }; };
    NZ.floorTabs = [{ label: 'End of day update', cls: s.screen === 'floor' ? 'on' : '', go: fgo('floor'), has: false, n: 0 }, { label: 'Floor round', cls: s.screen === 'clean' ? 'on' : '', go: fgo('clean'), has: false, n: 0 }];

    // --- discharge SOP
    var dcOwnerMap = {}, dcOwnerOrder = [];
    var addOwner = function (role, done, total) { if (!dcOwnerMap[role]) { dcOwnerMap[role] = { role: role, done: 0, total: 0 }; dcOwnerOrder.push(role); } dcOwnerMap[role].done += done ? 1 : 0; dcOwnerMap[role].total += 1; };
    allItems.forEach(function (it) { if (needs(it[2])) addOwner(it[3], !!dc.ticks[it[0]]); });
    addOwner('Psychiatrist', !!dc.docDate); addOwner('Psychologist', !!dc.psyDate);
    SIGNS.forEach(function (g) { addOwner(g[0] === 'nurse' ? 'Duty nurse' : g[0] === 'doctor' ? 'Psychiatrist' : 'Family', !!dc.signs[g[0]].at); });
    NZ.dcOwners = dcOwnerOrder.map(function (r) {
      var o = dcOwnerMap[r], left = o.total - o.done, remKey = dcp.id + ':' + r, rem = !!s.dcRem[remKey], mine = r === 'Patient experience' || r === 'Family';
      return { role: r, pct: Math.round(o.done / o.total * 100) + '%', txt: left === 0 ? 'All done' : o.done + ' of ' + o.total + ' done', chip: 'chip ' + (left === 0 ? 'green' : o.done === 0 ? 'red' : 'amber'), left: left,
        canRemind: left > 0 && !mine, remLabel: rem ? 'Reminder sent' : 'Remind', remCls: 'btn sm' + (rem ? ' ok' : ''),
        remind: function () { var m = Object.assign({}, self.state.dcRem); m[remKey] = true; self.setState({ dcRem: m }); } };
    }).sort(function (a, b) { return (a.left === 0 ? 1 : 0) - (b.left === 0 ? 1 : 0) || b.left - a.left; });
    var finishDc = function (dcx) {
      var fam = dcx.cName + (dcx.cRel ? ' (' + dcx.cRel.toLowerCase() + ')' : ''), base = { name: dcp.name, disch: dischIso, family: fam, phone: dcx.cPhone, posted: '', outcome: '', upd: '' }, n0 = self.state.fuExtra.length;
      var add = [Object.assign({}, base, { id: 'x' + (n0 + 1), kind: 'Psychiatrist OPD', with: dcp.doctor, due: dcx.docDate }), Object.assign({}, base, { id: 'x' + (n0 + 2), kind: 'Psychologist OPD', with: dcp.psych, due: dcx.psyDate })];
      if (dcx.consent === 'Yes') { add.push(Object.assign({}, base, { id: 'x' + (n0 + 3), kind: 'Day-14 call', with: dcx.assigned, due: addDays(dischIso, 14) })); add.push(Object.assign({}, base, { id: 'x' + (n0 + 4), kind: 'Day-30 call', with: dcx.assigned, due: addDays(dischIso, 30) })); }
      var all6 = Object.assign({}, self.state.dc); all6[dcp.id] = Object.assign({}, dcx, { done: true, doneText: 'Checklist complete for ' + dcp.name + ' at ' + nowTime() + '. ' + add.length + ' follow-ups were added to IPD follow-ups: ' + add.map(function (a) { return a.kind + ' ' + dm(a.due); }).join(', ') + '.' });
      return { dc: all6, dcTry: false, fuExtra: self.state.fuExtra.concat(add) };
    };
    var fbIdFor = function () { var hit = F.filter(function (x) { return x.name === dcp.name; })[0]; return hit ? hit.id : s.fb.pid; };
    NZ.dcCollect = function () {
      var patch = {};
      if (!blocks.length && !dc.done) patch = finishDc(dc);
      patch.fb = Object.assign({}, self.state.fb, { pid: fbIdFor() }); patch.fbMsg = ''; patch.screen = 'feedback';
      try { history.replaceState(null, '', '#feedback'); } catch (e) {}
      self.setState(patch);
    };
    NZ.dcCollectHint = dc.done ? 'The follow-ups are already in IPD follow-ups.' : (!blocks.length ? 'The checklist is complete. Collecting feedback also adds the follow-ups to IPD follow-ups.' : 'You can start feedback now. The ward side still has ' + blocks.length + (blocks.length === 1 ? ' thing' : ' things') + ' open.');
    NZ.dcSim = function () {
      var tk = {}; allItems.forEach(function (it) { if (it[2] !== 'opt') tk[it[0]] = 1; });
      var sg = {}; Object.keys(dc.signs).forEach(function (k) { sg[k] = Object.assign({}, dc.signs[k], { name: dc.signs[k].name || k, at: dc.signs[k].at || '11 Nov, ' + nowTime() }); });
      var full = Object.assign({}, dc, { ticks: tk, signs: sg, docDate: dc.docDate || addDays(dischIso, 7), docTime: dc.docTime || '11:00', psyDate: dc.psyDate || addDays(dischIso, 14), psyTime: dc.psyTime || '11:00' });
      self.setState(finishDc(full));
    };
    dcGo = dc.done ? { cls: 'lz-go ok', title: 'Checklist complete for ' + dcp.name, sub: dc.doneText, btn: 'Collect feedback', act: NZ.dcCollect }
      : !blocks.length ? { cls: 'lz-go ok', title: 'The ward team has finished for ' + dcp.name, sub: 'Collect the family\'s feedback now. The follow-ups are made from this checklist by themselves.', btn: 'Collect feedback', act: NZ.dcCollect }
      : { cls: 'lz-go', title: blocks.length + (blocks.length === 1 ? ' thing is' : ' things are') + ' still open for ' + dcp.name, sub: autoOpen ? 'Next: ' + secTitle[autoOpen] + ' (' + secLeft[autoOpen] + ' to do).' : blocks[0].t, btn: 'Show me what is left', act: function () { self.setState({ dcOpen: autoOpen || '' }); scrollToId('dc-' + (autoOpen || 'sign')); } };
    NZ.dcGoCls = dcGo.cls; NZ.dcGoTitle = dcGo.title; NZ.dcGoSub = dcGo.sub; NZ.dcGoBtn = dcGo.btn; NZ.dcGoAct = dcGo.act;
    NZ.dcShowBlocks = !dc.done && blocks.length > 0 && !!s.dcTry;
    NZ.dcOpenFinal = !dc.done;
    NZ.dcTabs = [{ label: 'Discharge checklist', cls: s.screen === 'dcheck' ? 'on' : '', go: fgo('dcheck'), has: true, n: discharging.filter(function (p) { var x = s.dc[p.id]; return !(x && x.done); }).length },
      { label: 'Collect feedback', cls: s.screen === 'feedback' ? 'on' : '', go: fgo('feedback'), has: true, n: F.filter(function (x) { return !s.fbSaved.some(function (y) { return y.name === x.name; }); }).length }];

    // --- IPD follow-ups report
    NZ.fuSegs = FSEG.map(function (g) { return { label: g[1], n: fuAll.filter(g[2]).length, cls2: s.fuFilter === g[0] ? 'on' : '', go: function () { self.setState({ fuFilter: g[0] }); } }; });

    // --- reminders / titles / nav
    var famDay = function (pat) { return pat.split('').map(function (c, i) { return { cls: c === '1' ? 'ok' : c === '2' ? 'same' : '', t: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] + (c === '1' ? ': sent' : c === '2' ? ': sent, same text as the day before' : ': nothing sent') }; }); };
    var FAMDATA = [['p2', 'Kiran Mehra', '1222222', 'Sun 9 Nov, 7:40 pm', 'same'], ['p4', 'Priya Nair', '1111111', 'Sun 9 Nov, 6:55 pm', 'ok'], ['p5', 'Kiran Mehra', '1101001', 'Fri 7 Nov, 8:05 pm', 'missing'], ['p6', 'Barkha', '1111101', 'Sat 8 Nov, 7:10 pm', 'ok']];
    NZ.famLog = FAMDATA.map(function (r) {
      var p = pById[r[0]], days = famDay(r[2]), cnt = r[2].split('').filter(function (c) { return c !== '0'; }).length, raised = !!s.famRaised[r[0]], flag = r[4];
      return { name: p.name, room: p.room, by: r[1], days: days, count: cnt, last: r[3], flag: flag === 'same' ? 'Same text 5 days' : flag === 'missing' ? 'Missed 3 days' : 'Fine', chip: 'chip ' + (flag === 'ok' ? 'green' : flag === 'same' ? 'amber' : 'red'),
        sr: '--sr:' + (flag === 'ok' ? 'transparent' : flag === 'same' ? '#d48806' : '#b42318'), canRaise: flag !== 'ok', raiseLabel: raised ? 'Grievance raised' : 'Raise as grievance', raiseCls: 'btn sm' + (raised ? ' ok' : ''),
        raise: function () {
          if (raised) return;
          var fr = Object.assign({}, self.state.famRaised); fr[r[0]] = true;
          var extra = self.state.extraConcerns.slice();
          extra.push({ id: 'C-0' + (210 + extra.length), type: 'concern', pid: r[0], title: flag === 'same' ? 'Family updates repeat the same text every day' : 'Family updates missed on 3 days this week', raisedBy: 'Weekly report check, Prabh', via: 'Weekly report', owner: r[1], ownerRole: 'Treating psychologist', category: 'Family updates', sla: '6 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: flag === 'same' ? 'The weekly report shows the same family update text on 5 days in a row.' : 'The weekly report shows no family update on 3 days this week.' });
          self.setState({ famRaised: fr, extraConcerns: extra });
        } };
    });
    NZ.nav = [['today', 'Patient dashboard', 0], ['concerns', 'Grievances', openC.length], ['floor', 'Floor round', 0], ['dcheck', 'Discharge SOP', discharging.filter(function (p) { var x = s.dc[p.id]; return !(x && x.done); }).length], ['follow', 'IPD follow-ups', fuAll.filter(FSEG[0][2]).length], ['report', 'Weekly report', 0]].map(function (n) {
      var on = s.screen === n[0] || (n[0] === 'today' && s.screen === 'record') || (n[0] === 'floor' && s.screen === 'clean') || (n[0] === 'dcheck' && s.screen === 'feedback');
      return { label: n[1], count: n[2], hasCount: n[2] > 0, cls: 'sub' + (on ? ' on' : ''), go: go(n[0]) };
    });
    NZ.pageTitle = { floor: 'Floor round', clean: 'Floor round', dcheck: 'Discharge SOP', feedback: 'Discharge SOP', follow: 'IPD follow-ups', report: 'Weekly report', concerns: 'Grievances', today: 'Patient dashboard', stays: 'Patient dashboard', record: 'Patient dashboard' }[s.screen] || 'Patient dashboard';
    return Object.assign(__base, NX, NZ);`;
rep('    return Object.assign(__base, NX);\n  }\n}', LOGIC + '\n  }\n}', 'logic');

/* rahul sethi can be picked for feedback straight from the checklist */
rep("      { id: 'f5', name: 'Tarun Roy', family: 'Mita Roy, sister', discharged: '25 Oct', appt: '29 Oct', doctor: 'Dr. Madhura Samudra', check: 'Done 31 Oct', checkCls: 'chip green', next: '30-day call 24 Nov' }\n    ];",
    "      { id: 'f5', name: 'Tarun Roy', family: 'Mita Roy, sister', discharged: '25 Oct', appt: '29 Oct', doctor: 'Dr. Madhura Samudra', check: 'Done 31 Oct', checkCls: 'chip green', next: '30-day call 24 Nov' },\n      { id: 'f6', name: 'Rahul Sethi', family: 'Vikas Sethi, father', discharged: '13 Nov (going home)', appt: '16 Nov', doctor: 'Dr. Madhura Samudra', check: 'Not yet due', checkCls: 'chip grey', next: '30-day call 13 Dec' }\n    ];", 'F list');
rep("fbWho: 'Discharged ' + fbSel.discharged + ' ·", "fbWho: (fbSel.id === 'f6' ? 'Discharge ' : 'Discharged ') + fbSel.discharged + ' ·", 'fbWho');

/* ---------------------------------------------------------------- css */
const css = String.raw`
/* MEETING2: floor round, discharge SOP, reminders, grievances */
.fl-tabs{align-self:flex-start}
.fl-tabs button{min-height:38px;padding:7px 16px;font-size:14px}
.eod-sum{font-size:14px;display:flex;gap:6px;align-items:baseline;flex-wrap:wrap}.eod-sum b{font-size:20px}.eod-iss{color:#b42318;font-weight:600}
.eod-walk{margin:-4px 0 0}
.eod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:14px;align-items:start}
.eod-card{overflow:hidden}
.eod-h{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #eef2f6;background:#fafcfe}
.eod-h .grow{flex:1;min-width:0}
.eod-card .fr-row{padding:11px 16px}
.eod-f{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 16px;border-top:1px solid #eef2f6;background:#fafbfd}
.fm-days{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.fm-day{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:1px;text-align:left;padding:9px 12px;border:1.5px solid #d6dee8;border-radius:12px;background:#fff;font:inherit;cursor:pointer;min-height:58px}
.fm-day:hover{border-color:#1e6cdb}
.fm-day.on{background:#e8f1fe;border-color:#1e6cdb}
.fm-dn{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#64748b}
.fm-dt{font-size:13.5px;font-weight:600;color:#14284b;line-height:1.25}
.fm-today{position:absolute;top:8px;right:10px;font-size:10px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;background:#1e6cdb;color:#fff;border-radius:999px;padding:1px 8px}
.fm-scroll{overflow-x:auto;border-top:1px solid #eef2f6}
.fm-grid{display:grid;align-items:center;gap:6px 8px;padding:0 16px;min-width:max-content}
.fm-head{padding-top:10px;padding-bottom:8px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#475467;background:#fafcfe;border-bottom:1px solid #e3eaf2;position:sticky;top:0}
.fm-col{text-align:center;line-height:1.2;text-transform:none;letter-spacing:0;font-size:11.5px}
.fm-row{padding-top:7px;padding-bottom:7px;border-bottom:1px solid #f0f3f7;border-left:3px solid transparent}
.fm-row.done{background:#fbfefc;border-left-color:#1f9d57}
.fm-row.bad{background:#fff8f7;border-left-color:#d92d20}
.fm-room b{display:block;font-size:15px;color:#14284b}
.fm-room span{font-size:11.5px;color:#64748b}
.fm-row.bad .fm-room span{color:#b42318;font-weight:600}
.fm-pts{display:flex;flex-wrap:wrap;gap:4px}
.fm-pt{font-size:12px;background:#f1f5f9;color:#334155;border-radius:999px;padding:2px 9px;white-space:nowrap}
.fm-c{height:36px;border-radius:9px;border:1.5px dashed #cbd5e1;background:#fff;font:inherit;font-size:15px;font-weight:700;color:#fff;cursor:pointer;padding:0}
.fm-c:hover{border-color:#1e6cdb}
.fm-c.ok{background:#1f9d57;border:1.5px solid #1f9d57}
.fm-c.issue{background:#d92d20;border:1.5px solid #d92d20}
.fm-c:focus-visible{outline:3px solid #1e6cdb;outline-offset:1px}
.overlay.mid{justify-content:center;align-items:center;position:fixed}
.drawer.modal{width:min(560px,92vw);height:auto;max-height:92vh;border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.3)}
.dc-ro .lz-row,.dc-ro .lz-acc-f,.dc-ro .dc-sigs,.dc-ro #dc-plan .cpad,.dc-ro .lz-acc-b>.cpad{pointer-events:none}
.dc-ro .lz-acc-f{display:none}
.dc-ro .dc-mine,.dc-ro .dc-gap,.dc-ro .dc-gap *{pointer-events:auto}
.dc-ro .lz-acc-b{position:relative}
.dc-own{padding:6px 20px 12px}
.dc-own-r{display:grid;grid-template-columns:minmax(150px,220px) 1fr auto 96px;gap:14px;align-items:center;padding:9px 0;border-top:1px solid #eef2f6}
.dc-own-r:first-child{border-top:0}
.dc-own-r .bar{height:8px}
@media (max-width:720px){.dc-own-r{grid-template-columns:1fr auto}.dc-own-r .bar{display:none}}
.rm .rm-r{align-items:center}
.rm .rm-t{flex:1;min-width:0}
.rm .btn{margin-left:auto;white-space:nowrap}
.fam-dots{display:flex;gap:4px;margin-bottom:3px}
.fam-dots i{width:14px;height:14px;border-radius:4px;background:#e3eaf3;display:inline-block}
.fam-dots i.ok{background:#1f9d57}.fam-dots i.same{background:#d48806}
.gv-cols{align-items:stretch}
.gv-cols>section{align-self:stretch}
`;
{
  const sEnd = t.indexOf('</style>', t.indexOf('html{zoom:.75}'));
  if (sEnd < 0) throw new Error('style end');
  t = t.slice(0, sEnd) + css + t.slice(sEnd);
}
/* rows the patient experience lead owns stay tappable in the read-only checklist */
rep("rowCls: 'checkrow lz-row' + (on ? ' lz-done' : '') + (off ? ' dc-off' : ''),", "rowCls: 'checkrow lz-row' + (on ? ' lz-done' : '') + (off ? ' dc-off' : '') + (it[3] === 'Patient experience' ? ' dc-mine' : ''),", 'dc-mine');

const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
