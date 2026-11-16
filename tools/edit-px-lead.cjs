/* One-off editor for public/px-lead-prototype.html (the Patient Experience Lead page). It decodes the packed template, applies the 11 Nov second-review
   changes as plain text edits, and writes it back. Run once: node tools/edit-px-lead.cjs */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
let src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());

function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n < 1) throw new Error('not found: ' + label);
  t = t.split(a).join(b);
}
function cut(from, to, replacement, label) {
  const a = t.indexOf(from), b = t.indexOf(to);
  if (a < 0 || b < 0 || b < a) throw new Error('markers not found: ' + label);
  t = t.slice(0, a) + replacement + t.slice(b);
}

/* ---- navigation: one dashboard (the stays table), Grievances, Floor round, Discharge feedback, Weekly report ---- */
rep("[['today', 'Today', 0], ['stays', 'Stays', 0], ['concerns', 'Concerns', openC.length], ['floor', 'Floor round', 0], ['feedback', 'Feedback', 0], ['report', 'Weekly report', 0]]",
    "[['today', 'Patient dashboard', 0], ['concerns', 'Grievances', openC.length], ['floor', 'Floor round', 0], ['feedback', 'Discharge feedback', 0], ['report', 'Weekly report', 0]]", 'nav');
rep("var titles = { today: 'Inpatient stays', stays: 'Patient experience', record: 'Inpatient stays', concerns: 'Concerns', floor: 'Floor round', feedback: 'Feedback and follow-up', report: 'Weekly report' };",
    "var titles = { today: 'Patient dashboard', stays: 'Patient dashboard', record: 'Patient dashboard', concerns: 'Grievances', floor: 'Floor round', feedback: 'Discharge feedback', report: 'Weekly report' };", 'titles');
rep("['concerns', 'Concerns']];\n    if (sp.discharging)", "['concerns', 'Grievances']];\n    if (sp.discharging)", 'rec tab');
rep('Log a concern', 'Log a grievance', 'log label');
rep('+ Log concern', '+ Log grievance', 'log label 2');
rep('Concerns for this stay', 'Grievances for this stay', 'tab title');
rep('No concerns logged for this stay.', 'No grievances logged for this stay.', 'empty');

/* the dashboard toolbar gets the log button */
rep('<input class="search" type="search" placeholder="Type a name" aria-label="Search patients">',
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input class="search" type="search" placeholder="Type a name" aria-label="Search patients"><button class="btn pri" type="button" sc-camel-on-click="{{openLog}}"><svg width="15" height="15" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>Log a grievance</button></div>', 'dash btn');

/* ---- escalate: opens a ready email to S Chandra with the full details ---- */
rep("escalateCur: function () { self.setState({ concernStatus: setStatus(cur.id, { status: 'Escalated', owner: 'S Chandra', ownerRole: 'GM Operations' }) }); },",
    "escalateCur: function () {\n        self.setState({ concernStatus: setStatus(cur.id, { status: 'Escalated', owner: 'S Chandra', ownerRole: 'GM Operations' }) });\n" +
    "        var body = ['To: S Chandra, GM Operations', '', 'A grievance has been escalated to you from Patient Experience.', '',\n" +
    "          'Reference: ' + cur.id, 'Type: ' + cur.typeLabel, 'Patient: ' + cur.patient + ' (' + cur.room + ')', 'Raised by: ' + cur.raisedBy + ', via ' + cur.via, 'Category: ' + cur.category,\n" +
    "          'Logged: ' + cur.logged, 'Time left: ' + cur.slaText, 'Current owner: ' + cur.owner + ' (' + cur.ownerRole + ')', '', 'What they said:', cur.desc, '',\n" +
    "          'Action taken so far: ' + (self.state.resNote || 'None noted'), '', 'Escalated by Prabh, Patient Experience, Gurgaon IPD'].join('\\n');\n" +
    "        try { window.location.href = 'mailto:?subject=' + encodeURIComponent('Escalation ' + cur.id + ': ' + cur.title + ' (' + cur.patient + ')') + '&body=' + encodeURIComponent(body); } catch (e) {}\n      },", 'escalate');
rep('Escalate to GM Ops', 'Escalate to GM Ops (email S Chandra)', 'escalate label');

/* ---- random calls to the family during the stay ---- */
rep("overrides: {}, reminded: {}, concernStatus: {}, extraConcerns: [], checks: {},",
    "overrides: {}, reminded: {}, concernStatus: {}, extraConcerns: [], calls: {}, checks: {}, fbSaved: [], fbMsg: '',\n      fb: { pid: 'f1', who: 'Parent', uhid: '', ward: '', helped: '', better: '', call: 'Yes', mobile: '', time: '', action: 'No', assigned: '' },", 'state');
rep("nps: 4, ratings: [5, 4, 4, 2, 4],", "nps: 4, ratings: [5, 4, 4, 2, 4, 5],", 'ratings');
rep("var pById = {}; P.forEach(function (p, i) { p.idx = i + 1; pById[p.id] = p; });",
    "var pById = {}; P.forEach(function (p, i) { p.idx = i + 1; pById[p.id] = p; });\n    var rnd = function (p) { var base = parseInt(p.random, 10) || 0; var ex = (s.calls[p.id] || []).length; return Math.min(3, base + ex) + ' of 3'; };", 'rnd');
rep("'Coordinator random call, ' + p.random + ' done'", "'Coordinator random call, ' + rnd(p) + ' done'", 'task label');
rep("(i === 6 ? sp.random + ' done' : 'Owner: you')", "(i === 6 ? rnd(sp) + ' done' : 'Owner: you')", 'step detail');
rep("log: sp.log.map(function (l) { return Object.assign({}, l, { hasNote: !!l.note }); }), noLog: sp.log.length === 0,",
    "log: (s.calls[sp.id] || []).concat(sp.log).map(function (l) { return Object.assign({}, l, { hasNote: !!l.note }); }), noLog: sp.log.length === 0 && !(s.calls[sp.id] || []).length,", 'log');
rep('<button class="btn sm" type="button">Add call note</button>', '<button class="btn sm pri" type="button" sc-camel-on-click="{{addCall}}">Log a random call</button>', 'call btn');
rep("      goConcerns: function () {",
    "      addCall: function () {\n        var note = window.prompt('Random call to ' + sp.gName + ' (' + sp.name + '): what did the family say?');\n        if (note === null) return;\n" +
    "        var c = Object.assign({}, self.state.calls); var L = (c[sp.id] || []).slice(); var n = (parseInt(sp.random, 10) || 0) + L.length + 1;\n" +
    "        var d = new Date(); var tm = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();\n" +
    "        L.unshift({ d: '11 Nov', what: 'Random call ' + n, who: 'Prabh', time: tm, how: 'Phone', note: note || '' }); c[sp.id] = L;\n" +
    "        var o = Object.assign({}, self.state.overrides); if (n >= 3) o[sp.id + ':6'] = 'done';\n" +
    "        self.setState({ calls: c, overrides: o });\n      },\n      goConcerns: function () {", 'addCall fn');

/* ---- Discharge feedback: the hospital's IPD Patient & Family Feedback Form (v6) on top, the summary under it ---- */
const fbBlock = `<!-- ============ DISCHARGE FEEDBACK (FORM 6) ============ -->
<sc-if value="{{isFeedback}}" hint-placeholder-val="{{false}}">
  <section class="card">
    <div class="chead"><div><h3>IPD Patient &amp; Family Feedback Form</h3><div class="muted small">Tulasi Healthcare Hospital · Form 6. Fill it in with the family on the discharge call. All responses are kept confidential.</div></div><span class="chip amber">2 waiting</span></div>
    <div class="cpad" style="display:flex;flex-direction:column;gap:18px">
      <div><div class="lbl" style="margin-bottom:8px">A. Patient &amp; respondent details</div>
        <div class="fgrid">
          <div class="field"><label for="fbp">Patient</label><sc-raw-select id="fbp" value="{{fb.pid}}" sc-camel-on-change="{{setFbPid}}"><sc-for list="{{fbPatients}}" as="o" hint-placeholder-count="5"><option value="{{o.id}}">{{o.label}}</option></sc-for></sc-raw-select></div>
          <div class="field"><label for="fbu">UHID / Patient ID</label><input id="fbu" placeholder="e.g. 2026-27RG6905" value="{{fb.uhid}}" sc-camel-on-change="{{setFbUhid}}"></div>
          <div class="field"><label>Date of discharge</label><div class="info" style="margin:0">{{fbSel.discharged}}</div></div>
          <div class="field"><label>Treating doctor</label><div class="info" style="margin:0">{{fbSel.doctor}}</div></div>
          <div class="field"><label for="fbw">Ward / floor</label><input id="fbw" placeholder="e.g. Floor 2" value="{{fb.ward}}" sc-camel-on-change="{{setFbWard}}"></div>
          <div class="field"><label for="fbr">Respondent is</label><sc-raw-select id="fbr" value="{{fb.who}}" sc-camel-on-change="{{setFbWho}}"><option>Patient (self)</option><option>Parent</option><option>Spouse</option><option>Sibling</option><option>Guardian</option><option>Other</option></sc-raw-select></div>
        </div>
      </div>
      <div><div class="lbl" style="margin-bottom:8px">B. Overall recommendation</div>
        <div class="name" style="margin-bottom:8px">How likely are you to recommend Tulasi Healthcare Hospital to another family?</div>
        <div class="nps"><sc-for list="{{npsBtns}}" as="b" hint-placeholder-count="11"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}" aria-label="Score {{b.n}}">{{b.n}}</button></sc-for></div>
        <div class="muted small" style="margin-top:6px">0 to 6 not likely to recommend · 7 to 8 likely · 9 to 10 very likely to recommend</div>
      </div>
      <div><div class="lbl" style="margin-bottom:4px">C. Rate the following (1 = Poor, 5 = Excellent)</div>
        <sc-for list="{{rateRows}}" as="r" hint-placeholder-count="6"><div class="rate"><span>{{r.label}}</span><div style="display:flex;gap:4px"><sc-for list="{{r.btns}}" as="s" hint-placeholder-count="5"><button class="{{s.cls}}" type="button" sc-camel-on-click="{{s.pick}}" aria-label="{{r.label}} {{s.n}} of 5">{{s.n}}</button></sc-for></div></div></sc-for>
      </div>
      <div><div class="lbl" style="margin-bottom:8px">D. In your own words</div>
        <div class="fgrid">
          <div class="field"><label for="fb1">What helped your family most during the stay?</label><textarea id="fb1" placeholder="In their words" value="{{fb.helped}}" sc-camel-on-change="{{setFbHelped}}"></textarea></div>
          <div class="field"><label for="fb2">What could we have done better?</label><textarea id="fb2" placeholder="In their words" value="{{fb.better}}" sc-camel-on-change="{{setFbBetter}}"></textarea></div>
        </div>
      </div>
      <div><div class="lbl" style="margin-bottom:8px">E. Stay in touch</div>
        <div class="name" style="margin-bottom:8px">May we call you in 2 weeks to check in on your family member's recovery?</div>
        <div class="seg" style="margin-bottom:10px"><sc-for list="{{callBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div>
        <sc-if value="{{fbCallYes}}" hint-placeholder-val="{{true}}"><div class="fgrid">
          <div class="field"><label for="fbm">Best mobile number to call</label><input id="fbm" placeholder="+91" value="{{fb.mobile}}" sc-camel-on-change="{{setFbMobile}}"></div>
          <div class="field"><label for="fbt">Best time</label><input id="fbt" placeholder="e.g. after 5 pm" value="{{fb.time}}" sc-camel-on-change="{{setFbTime}}"></div>
        </div></sc-if>
      </div>
      <div><div class="lbl" style="margin-bottom:8px">F. For office use only</div>
        <div class="fgrid">
          <div class="field"><label>Received by</label><div class="info" style="margin:0">Prabh, Patient experience</div></div>
          <div class="field"><label>NPS score entered · date entered</label><div class="info" style="margin:0">{{nps}} · 11 Nov 2026</div></div>
          <div class="field"><label>Action required?</label><div class="seg"><sc-for list="{{actionBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>
          <sc-if value="{{fbActionYes}}" hint-placeholder-val="{{false}}"><div class="field"><label for="fba">Assigned to</label><input id="fba" placeholder="Name" value="{{fb.assigned}}" sc-camel-on-change="{{setFbAssigned}}"></div></sc-if>
        </div>
      </div>
      <sc-if value="{{isDetractor}}" hint-placeholder-val="{{false}}"><div class="note">Score of 6 or below. Saving this opens a grievance for you to follow up.</div></sc-if>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn pri" type="button" sc-camel-on-click="{{saveFb}}">Save feedback</button><span class="muted small">{{fbMsg}}</span></div>
    </div>
  </section>

  <div class="hello" style="margin-top:6px"><div><h2>Summary</h2><div class="muted">Last 30 days plus what you have saved today</div></div></div>
  <div class="tiles">
    <sc-for list="{{fbTiles}}" as="t" hint-placeholder-count="4"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for>
  </div>
  <div class="cols">
    <section class="card" style="flex:2 1 340px"><div class="chead"><h3>Average rating by area</h3><span class="muted small">Out of 5</span></div>
      <div><sc-for list="{{fbAreas}}" as="a" hint-placeholder-count="6"><div class="listrow" style="padding:11px 20px"><div style="flex:0 0 200px">{{a.label}}</div><div class="bar blue" style="flex:1 1 100px"><i style="width:{{a.pct}}"></i></div><div class="name" style="flex:0 0 34px;text-align:right">{{a.avg}}</div></div></sc-for></div>
      <div class="cpad"><div class="note">{{fbLowest}}</div></div>
    </section>
    <section class="card" style="flex:3 1 560px;overflow:hidden"><div class="chead"><h3>After discharge</h3><span class="muted small">Shared with the call centre. Outcome is a fixed list so lost patients can be counted.</span></div>
      <div class="scrollx">
        <sc-raw-table class="pt">
          <sc-raw-thead><sc-raw-tr><sc-raw-th>Patient</sc-raw-th><sc-raw-th>First follow-up</sc-raw-th><sc-raw-th>48-hour check</sc-raw-th><sc-raw-th>Outcome</sc-raw-th><sc-raw-th>Next</sc-raw-th></sc-raw-tr></sc-raw-thead>
          <sc-raw-tbody>
            <sc-for list="{{followups}}" as="f" hint-placeholder-count="5">
              <sc-raw-tr style="{{f.sr}}">
                <sc-raw-td><div class="name">{{f.name}}</div><div class="pmeta">Discharged {{f.discharged}} · {{f.family}}</div></sc-raw-td>
                <sc-raw-td>{{f.appt}}<div class="muted small">{{f.doctor}}</div></sc-raw-td>
                <sc-raw-td><span class="{{f.checkCls}}">{{f.check}}</span></sc-raw-td>
                <sc-raw-td><div class="field"><sc-raw-select aria-label="Outcome for {{f.name}}" value="{{f.outcome}}" sc-camel-on-change="{{f.setOutcome}}"><option value="">Choose outcome</option><option>Came for appointment</option><option>Rescheduled</option><option>Did not show up</option><option>Found another hospital</option><option>Found another doctor</option><option>Readmitted</option></sc-raw-select></div><sc-if value="{{f.lost}}" hint-placeholder-val="{{false}}"><div class="small" style="color:#b42318;margin-top:4px">Counts as lost in the weekly report</div></sc-if></sc-raw-td>
                <sc-raw-td><span class="muted small">{{f.next}}</span></sc-raw-td>
              </sc-raw-tr>
            </sc-for>
          </sc-raw-tbody>
        </sc-raw-table>
      </div>
    </section>
  </div>
</sc-if>

`;
cut('<!-- ============ FEEDBACK & FOLLOW-UP ============ -->', '<!-- ============ WEEKLY REPORT ============ -->', fbBlock, 'feedback block');

/* feedback values */
rep("var RL = ['Admission and registration', 'Doctor communication', 'Nursing and attendants', 'Family updates', 'Discharge briefing'];",
    "var RL = ['Ease of admission and registration', 'Communication by doctors and counsellors', 'Behaviour and care by nursing staff and attendants', 'How well we kept you updated on the patient\\'s progress', 'Clarity of discharge briefing (medicines, follow-up, warning signs)', 'Cleanliness and comfort of the environment'];", 'RL');
rep("    var followups = F.map(function (f) {",
`    var fbSel = F.filter(function (f) { return f.id === s.fb.pid; })[0] || F[0];
    var setFb = function (k) { return function (e) { var f = Object.assign({}, self.state.fb); f[k] = e.target.value; self.setState({ fb: f }); }; };
    var pickFb = function (k, v) { return function () { var f = Object.assign({}, self.state.fb); f[k] = v; self.setState({ fb: f }); }; };
    var BASE = { n: 9, nps: 67, avg: [4.4, 4.2, 4.5, 3.1, 4.0, 4.3] };
    var saved = s.fbSaved, nAll = BASE.n + saved.length;
    var avgs = BASE.avg.map(function (b, i) { var sum = b * BASE.n; saved.forEach(function (x) { sum += x.ratings[i]; }); return Math.round(sum / nAll * 10) / 10; });
    var minI = avgs.indexOf(Math.min.apply(null, avgs));
    var savedNps = saved.length ? Math.round((saved.filter(function (x) { return x.nps >= 9; }).length - saved.filter(function (x) { return x.nps <= 6; }).length) / saved.length * 100) : null;
    var followups = F.map(function (f) {`, 'fb values');
rep("      npsBtns: npsBtns, rateRows: rateRows, isDetractor: s.nps <= 6, followups: followups,",
`      npsBtns: npsBtns, rateRows: rateRows, isDetractor: s.nps <= 6, followups: followups,
      fb: s.fb, fbSel: fbSel, nps: s.nps, fbMsg: s.fbMsg, fbCallYes: s.fb.call === 'Yes', fbActionYes: s.fb.action === 'Yes',
      fbPatients: F.map(function (f) { return { id: f.id, label: f.name + ' · discharged ' + f.discharged }; }),
      setFbPid: setFb('pid'), setFbUhid: setFb('uhid'), setFbWard: setFb('ward'), setFbWho: setFb('who'), setFbHelped: setFb('helped'), setFbBetter: setFb('better'),
      setFbMobile: setFb('mobile'), setFbTime: setFb('time'), setFbAssigned: setFb('assigned'),
      callBtns: ['Yes', 'No'].map(function (v) { return { label: v, cls: s.fb.call === v ? 'on' : '', pick: pickFb('call', v) }; }),
      actionBtns: ['No', 'Yes'].map(function (v) { return { label: v, cls: s.fb.action === v ? 'on' : '', pick: pickFb('action', v) }; }),
      fbTiles: [
        { label: 'Responses', value: String(nAll), sub: BASE.n + ' in the last 30 days, ' + saved.length + ' saved today' },
        { label: 'Discharge NPS', value: (BASE.nps > 0 ? '+' : '') + BASE.nps, sub: 'Last 30 days' },
        { label: 'Saved today', value: String(saved.length), sub: savedNps === null ? 'Nothing saved yet' : 'NPS ' + (savedNps > 0 ? '+' : '') + savedNps },
        { label: 'Will take the 2-week call', value: String(saved.filter(function (x) { return x.call === 'Yes'; }).length), sub: 'Of those saved today' }
      ],
      fbAreas: RL.map(function (l, i) { return { label: l, avg: avgs[i].toFixed(1), pct: Math.round(avgs[i] / 5 * 100) + '%' }; }),
      fbLowest: 'Lowest rated: ' + RL[minI] + ' (' + avgs[minI].toFixed(1) + ' of 5).',
      saveFb: function () {
        var f = self.state.fb, p = F.filter(function (x) { return x.id === f.pid; })[0] || F[0];
        var entry = { name: p.name, nps: self.state.nps, ratings: self.state.ratings.slice(), call: f.call };
        var patch = { fbSaved: self.state.fbSaved.concat([entry]), fb: Object.assign({}, f, { helped: '', better: '', mobile: '', time: '', assigned: '', action: 'No' }),
          fbMsg: 'Saved for ' + p.name + '. NPS ' + self.state.nps + ' entered on 11 Nov 2026.' };
        if (self.state.nps <= 6) {
          var id = 'C-0' + (143 + self.state.extraConcerns.length);
          patch.extraConcerns = self.state.extraConcerns.concat([{ id: id, type: 'concern', pid: '', pname: p.name, title: 'Detractor feedback from ' + p.name + ' (score ' + self.state.nps + ')', raisedBy: f.who + ' (discharge call)', via: 'Discharge feedback', owner: 'Prabh', ownerRole: 'Patient experience', category: 'Other', sla: '6 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: (f.better || 'Score of 6 or below on the discharge feedback form.') }]);
          patch.fbMsg += ' A grievance was opened for you to follow up.';
        }
        self.setState(patch);
      },`, 'fb vals');
rep("patient: p ? p.name : '', room: p ? p.room : '',", "patient: p ? p.name : (c.pname || ''), room: p ? p.room : '',", 'pname');
/* old feedback values no longer used by the markup */

/* the old dashboard hint text */

const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
