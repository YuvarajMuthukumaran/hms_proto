/* One-off (12 Nov 2026): Patient Experience flow from the team's diagram (Patient Experience Lead).
   - one "+ Log" button on every page, one log form: does anything need action? yes / no / compliment
   - everything logged is saved to the patient's record (Family and visits tab), with a tag
   - grievance clock: reminder to the owner at 3 h, Chandraji at 6 h (demo clock buttons)
   - owner fixes it -> PX calls the family to confirm -> happy closes, not happy sends it back to the owner
   - 2 random calls per patient: "Call and log" window (picked up?, 7 questions, their words, action)
   - Reports: patterns this month, compliments, random call completion */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING4')) throw new Error('already applied');
const BS = String.fromCharCode(92);

function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}
function repN(a, b, k, label) {
  const n = t.split(a).length - 1;
  if (n !== k) throw new Error('expected ' + k + ' matches, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}
function between(startMarker, endMarker, fn, label) {
  const s = t.indexOf(startMarker);
  if (s < 0) throw new Error('start marker: ' + label);
  const e = t.indexOf(endMarker, s + startMarker.length);
  if (e < 0) throw new Error('end marker: ' + label);
  t = t.slice(0, s) + fn(t.slice(s, e)) + t.slice(e);
}

/* ================================================================ 1. "+ Log" on every page */
rep('    <div class="tbr">\n      <button class="icb" type="button" aria-label="Search">',
    '    <div class="tbr">\n      <button class="btn pri tb-log" type="button" sc-camel-on-click="{{openLog}}"><svg width="15" height="15" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>Log</button>\n      <button class="icb" type="button" aria-label="Search">', 'topbar log');

{
  const re = /<button class="btn pri" type="button" sc-camel-on-click="\{\{openLog\}\}">[\s\S]*?<\/button>/g;
  const k = (t.match(re) || []).length;
  if (k !== 3) throw new Error('expected 3 header log buttons, got ' + k);
  t = t.replace(re, '');
}
/* ---- the form */
rep('<h3 style="font-size:18px">Log a grievance</h3>', '<div><h3 style="font-size:18px">Log a call or concern</h3><div class="muted small">Log it once. It is saved to the patient record.</div></div>', 'drawer title');
between('                <div class="field"><label for="lc">Category</label>', '      </div>\n      <sc-if value="{{isVoice}}"', function (seg) {
  return '        <sc-if value="{{actYes}}" hint-placeholder-val="{{true}}">' + seg.trim() + '</sc-if>\n';
}, 'cat sev wrap');
rep('<div class="field"><label for="ld">{{descLabel}}</label><textarea id="ld" placeholder="{{descPh}}" value="{{form.desc}}" sc-camel-on-change="{{setDesc}}"></textarea></div>',
    '<div class="field"><label for="ld">{{descLabel}}</label><textarea id="ld" placeholder="{{descPh}}" value="{{form.desc}}" sc-camel-on-change="{{setDesc}}"></textarea></div>\n      <div class="field"><label>Does anything need action?</label><div class="lz-chips"><sc-for list="{{actBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div><div class="muted small">{{actHint}}</div></div>', 'act field');
between('      <div class="field"><label>Category tag · who should see it first</label>', '      <div style="display:flex;gap:8px;margin-top:auto"><button class="btn pri" type="button" sc-camel-on-click="{{saveConcern}}">Save and assign</button>', function (seg) {
  return '      <sc-if value="{{actYes}}" hint-placeholder-val="{{true}}">\n' + seg + '      </sc-if>\n';
}, 'tag goes-to wrap');
rep('sc-camel-on-click="{{saveConcern}}">Save and assign</button>', 'sc-camel-on-click="{{saveConcern}}">{{saveLabel}}</button>', 'save label');

rep("concern: 'Due in 6 hours. You are alerted at 5 hours, and it goes to GM Operations if missed.'", "concern: 'The owner is reminded at 3 hours. It goes to S Chandra (GM Operations) at 6 hours if it is still open.'", 'due hint');
/* ---- grievance clock helpers, placed right before the rows are built */
rep('    var all = C.map(function (c) {\n      var closed = c.status === \'Resolved\', p = pById[c.pid];',
`    // MEETING4: grievance clock. Reminder to the owner at 3 h, Chandraji at 6 h. Demo clock buttons move time forward.
    var M4SEED = { 'C-0142': 3.4, 'C-0141': 5.2, 'C-0140': 3.1, 'C-0139': 6.8, 'C-0138': 2, 'C-0137': 2.6 };
    var M4born = self.__born || (self.__born = {});
    var M4age = function (c) {
      var clk = (s.clk || {})[c.id];
      if (clk) return (Date.now() - clk) / 3.6e6 + (s.demoH || 0);
      if (M4SEED[c.id] !== undefined) return M4SEED[c.id] + (s.demoH || 0);
      if (!M4born[c.id]) M4born[c.id] = Date.now();
      return (Date.now() - M4born[c.id]) / 3.6e6 + (s.demoH || 0);
    };
    var M4stage = function (c, closed) {
      if (closed) return { n: 'closed', s: '', t: '', c1: '', c2: '', c3: '' };
      if (c.stage === 'confirm') return { n: 'confirm', s: 'Call the family', t: 'Owner says it is fixed. Call the family to confirm.', c1: '', c2: '', c3: '' };
      var a = M4age(c), own = c.owner || 'the owner', hrs = a < 1 ? 'under 1 h' : (Math.floor(a * 10) / 10) + ' h';
      var back = c.sentBack ? ' Sent back by the family ' + c.sentBack + (c.sentBack > 1 ? ' times.' : ' time.') : '';
      if (a >= 6) return { n: 'chandra', s: own === 'S Chandra' ? 'With Chandraji' : 'Sent to Chandraji', t: 'Open for ' + hrs + '. Sent to S Chandra (GM Operations) at 6 h.' + back, c1: 'm4-s done', c2: 'm4-s done', c3: 'm4-s now bad' };
      if (a >= 3) return { n: 'reminded', s: 'Owner reminded', t: 'Open for ' + hrs + '. Reminder sent to ' + own + ' at 3 h. Goes to Chandraji at 6 h.' + back, c1: 'm4-s done', c2: 'm4-s now warn', c3: 'm4-s' };
      return { n: 'clock', s: 'Reminder at 3 h', t: 'Open for ' + hrs + '. ' + own + ' is reminded at 3 h, Chandraji at 6 h.' + back, c1: 'm4-s now', c2: 'm4-s', c3: 'm4-s' };
    };
    var all = C.map(function (c) {
      var closed = c.status === 'Resolved', p = pById[c.pid], stg = M4stage(c, closed);`, 'clock helpers');
rep("        isOpen: !closed, isClosed: closed, resolution: c.resolution || '', open: openConcern(c.id),",
    "        stageN: stg.n, stageShort: stg.s, stageTxt: stg.t, st1: stg.c1, st2: stg.c2, st3: stg.c3, isConfirm: stg.n === 'confirm', isOwnerStage: !closed && stg.n !== 'confirm', fixNote: c.fixNote || '', sentBackTxt: c.sentBack ? ('Sent back by the family ' + c.sentBack + (c.sentBack > 1 ? ' times' : ' time')) : '',\n        isOpen: !closed, isClosed: closed, resolution: c.resolution || '', open: openConcern(c.id),", 'row fields');
rep('<sc-raw-td><span class="{{c.slaCls}}">{{c.slaText}}</span></sc-raw-td>', '<sc-raw-td><span class="{{c.slaCls}}">{{c.slaText}}</span><div class="muted small">{{c.stageShort}}</div></sc-raw-td>', 'row stage');

/* ---- detail panel: owner fixes, then PX calls the family */
between('        <sc-if value="{{cur.isOpen}}" hint-placeholder-val="{{true}}">\n          <div class="field"><label for="resnote">Resolution note</label>', '        <sc-if value="{{cur.isClosed}}"', function () {
  return `        <sc-if value="{{cur.isOwnerStage}}" hint-placeholder-val="{{true}}">
          <div class="m4-stage">
            <div class="m4-steps"><span class="m4-s done">Logged</span><span class="{{cur.st2}}">Owner reminded, 3 h</span><span class="{{cur.st3}}">Chandraji, 6 h</span></div>
            <div class="m4-txt">{{cur.stageTxt}}</div>
            <div class="m4-clock muted small">Demo clock +{{demoH}} h <button class="btn sm link" type="button" sc-camel-on-click="{{demoPlus1}}">+1 h</button><button class="btn sm link" type="button" sc-camel-on-click="{{demoPlus3}}">+3 h</button><button class="btn sm link" type="button" sc-camel-on-click="{{demoReset}}">Reset</button></div>
          </div>
          <div class="field"><label for="resnote">What the owner did to fix it</label><textarea id="resnote" placeholder="What was done, and by whom" value="{{resNote}}" sc-camel-on-change="{{setResNote}}"></textarea></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri sm" type="button" sc-camel-on-click="{{markFixed}}">Owner has fixed it</button><button class="btn sm" type="button" sc-camel-on-click="{{escalateCur}}">Escalate to GM Ops (email S Chandra)</button></div>
          <sc-if value="{{m4NeedFix}}" hint-placeholder-val="{{false}}"><div class="note">Write what the owner did first.</div></sc-if>
        </sc-if>
        <sc-if value="{{cur.isConfirm}}" hint-placeholder-val="{{false}}">
          <div class="info"><b>Owner says it is fixed.</b> {{cur.fixNote}}</div>
          <div class="note">Next step: call the family. Is it fixed, and are they happy?</div>
          <div class="field"><label for="resnote">What the family said</label><textarea id="resnote" placeholder="In their words" value="{{resNote}}" sc-camel-on-change="{{setResNote}}"></textarea></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri sm" type="button" sc-camel-on-click="{{confirmHappy}}">Family is happy: close it</button><button class="btn sm" type="button" sc-camel-on-click="{{confirmNotHappy}}">Not happy: send back to owner</button></div>
        </sc-if>
`;
}, 'detail panel');
rep('<sc-if value="{{cur.isClosed}}" hint-placeholder-val="{{false}}"><div class="info">{{cur.resolution}}</div></sc-if>', '<sc-if value="{{cur.isClosed}}" hint-placeholder-val="{{false}}"><div class="info">{{cur.resolution}}</div></sc-if>\n        <sc-if value="{{cur.sentBackTxt}}" hint-placeholder-val="{{false}}"><div class="muted small">{{cur.sentBackTxt}}</div></sc-if>', 'closed block');

/* ================================================================ 2. Random calls: 2 per patient */
repN("random: '0 of 3'", "random: '0 of 2'", 3, 'seed 0');
rep("random: '3 of 3'", "random: '2 of 2'", 'seed 3');
rep("random: '1 of 3'", "random: '1 of 2'", 'seed 1');
rep("random: '2 of 3'", "random: '2 of 2'", 'seed 2');
rep("{ name: 'Coordinator random calls', when: '3 during stay', owner: 'You' }", "{ name: 'Coordinator random calls', when: '2 during stay', owner: 'You' }", 'step');
rep("var ex = (s.calls[p.id] || []).length; return Math.min(3, base + ex) + ' of 3'; };", "var ex = (s.calls[p.id] || []).filter(function (l) { return l.rc; }).length; return Math.min(2, base + ex) + ' of 2'; };", 'rnd');
/* the buttons on Today and the dashboard open the call window */
rep("btnLabel: step.auto ? (reminded ? 'Reminder sent' : 'Remind ' + step.owner.toLowerCase()) : 'Mark done',", "btnLabel: step.auto ? (reminded ? 'Reminder sent' : 'Remind ' + step.owner.toLowerCase()) : (i === 6 ? 'Call and log' : 'Mark done'),", 'task btn');
rep("            : function () { var o = Object.assign({}, self.state.overrides); o[key] = 'done'; self.setState({ overrides: o }); },\n          open: openPatient(p.id)",
    "            : (i === 6 ? function () { self.setState({ rcPid: p.id, rc: {} }); } : function () { var o = Object.assign({}, self.state.overrides); o[key] = 'done'; self.setState({ overrides: o }); }),\n          open: openPatient(p.id)", 'task act');
rep("btnLabel: auto ? (sent ? 'Reminder sent' : 'Remind ' + step.owner.toLowerCase()) : 'Mark done', btnCls: 'btn sm' + (sent ? ' ok' : ''),", "btnLabel: auto ? (sent ? 'Reminder sent' : 'Remind ' + step.owner.toLowerCase()) : (si === 6 ? 'Call and log' : 'Mark done'), btnCls: 'btn sm' + (sent ? ' ok' : ''),", 'row btn');
rep("act: function (e) { if (e && e.stopPropagation) e.stopPropagation(); var m = Object.assign({}, auto ? self.state.reminded : self.state.overrides);", "act: function (e) { if (e && e.stopPropagation) e.stopPropagation(); if (si === 6 && !auto) { self.setState({ rcPid: p.id, rc: {} }); return; } var m = Object.assign({}, auto ? self.state.reminded : self.state.overrides);", 'row act');
rep('>Log a random call</button>', '>Call and log</button>', 'family tab btn');
rep('<h3>Family contact log</h3>', '<h3>Everything logged for this patient</h3>', 'log title');

/* ---- log rows get a tag */
rep(".map(function (l) { return Object.assign({}, l, { hasNote: !!l.note }); })",
    ".map(function (l) { var TG = { concern: ['Needs action', 'chip amber'], note: ['Note', 'chip grey'], compliment: ['Compliment', 'chip green'], noanswer: ['No answer', 'chip grey'], closed: ['Closed with family', 'chip green'], back: ['Sent back', 'chip red'] }[l.tag]; return Object.assign({}, l, { hasNote: !!l.note, hasTag: !!TG, tagLabel: TG ? TG[0] : '', tagCls: TG ? TG[1] : '' }); })", 'log tag map');
rep('<div class="grow"><div class="name">{{l.what}}</div><div class="muted small">{{l.who}} · {{l.time}} · {{l.how}}</div>', '<div class="grow"><div class="name">{{l.what}} <sc-if value="{{l.hasTag}}" hint-placeholder-val="{{false}}"><span class="{{l.tagCls}}">{{l.tagLabel}}</span></sc-if></div><div class="muted small">{{l.who}} · {{l.time}} · {{l.how}}</div>', 'log row markup');

/* ---- the call window */
rep('<!-- ============ ROOM CHECKS (pop-up) ============ -->',
`<!-- ============ RANDOM CALL (pop-up) ============ -->
<sc-if value="{{rcHas}}" hint-placeholder-val="{{false}}">
  <div class="overlay mid">
    <div class="drawer modal rc-modal" role="dialog" aria-label="Random call">
      <div class="toolbar"><div><h3 style="font-size:19px">Random call · {{rcName}}</h3><div class="muted small">Call {{rcGuardian}} ({{rcRel}}) · {{rcPhone}} · {{rcCount}} done</div></div><button class="btn sm link" type="button" sc-camel-on-click="{{rcClose}}">Close</button></div>
      <div class="field"><label>Did they pick up?</label><div class="lz-chips"><sc-for list="{{rcPick}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.go}}">{{b.label}}</button></sc-for></div></div>
      <sc-if value="{{rcNone}}" hint-placeholder-val="{{false}}">
        <div class="note">No answer. It is saved to the record and does not count. Try again tomorrow.</div>
        <div style="display:flex;gap:8px;margin-top:auto"><button class="btn pri" type="button" sc-camel-on-click="{{rcNoAnswer}}">Save no answer</button><button class="btn" type="button" sc-camel-on-click="{{rcClose}}">Cancel</button></div>
      </sc-if>
      <sc-if value="{{rcUp}}" hint-placeholder-val="{{false}}">
        <div class="rc-qs">
          <sc-for list="{{rcQs}}" as="q" hint-placeholder-count="7">
            <div class="rc-q"><span class="rc-ql">{{q.label}}</span><span class="rc-qb"><button class="{{q.yesCls}}" type="button" sc-camel-on-click="{{q.yes}}">Yes</button><button class="{{q.noCls}}" type="button" sc-camel-on-click="{{q.no}}">No</button></span></div>
          </sc-for>
        </div>
        <div class="field"><label for="rcw">In their words</label><textarea id="rcw" placeholder="What did the family say?" value="{{rcWords}}" sc-camel-on-change="{{rcSetWords}}"></textarea></div>
        <div class="field"><label>Does anything need action?</label><div class="lz-chips"><sc-for list="{{rcActBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.go}}">{{b.label}}</button></sc-for></div><div class="muted small">{{rcActHint}}</div></div>
        <sc-if value="{{rcActYes}}" hint-placeholder-val="{{false}}"><div class="field"><label for="rcc">Category</label><sc-raw-select id="rcc" value="{{rcCat}}" sc-camel-on-change="{{rcSetCat}}"><sc-for list="{{categoryOpts}}" as="o" hint-placeholder-count="8"><option value="{{o.label}}">{{o.label}}</option></sc-for></sc-raw-select></div><div class="note">{{rcRoute}}</div></sc-if>
        <sc-if value="{{rcSafety}}" hint-placeholder-val="{{false}}"><div class="note bad">Safety worry. This goes straight to Chandraji.</div></sc-if>
        <div style="display:flex;gap:8px;margin-top:auto"><button class="btn pri" type="button" sc-camel-on-click="{{rcSave}}">{{rcSaveLabel}}</button><button class="btn" type="button" sc-camel-on-click="{{rcClose}}">Cancel</button></div>
      </sc-if>
    </div>
  </div>
</sc-if>

<!-- ============ ROOM CHECKS (pop-up) ============ -->`, 'rc modal');

/* ================================================================ 3. Reports */
rep("['follow', 'IPD follow-ups', fuAll.filter(FSEG[0][2]).length], ['report', 'Weekly report', 0]]", "['follow', 'IPD follow-ups', fuAll.filter(FSEG[0][2]).length], ['report', 'Reports', 0]]", 'nav');
rep("follow: 'IPD follow-ups', report: 'Weekly report', concerns:", "follow: 'IPD follow-ups', report: 'Reports', concerns:", 'title');
rep('  </section>\n</sc-if>\n\n</main>',
`  </section>

  <div class="hello" style="margin-top:6px">
    <div><h2>Patterns this month</h2><div class="muted">November so far. Two or more in the same theme is a pattern to raise with the owner.</div></div>
  </div>
  <div class="tiles">
    <sc-for list="{{m4Tiles}}" as="t" hint-placeholder-count="5"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for>
  </div>
  <div class="cols">
    <section class="card" style="flex:3 1 520px;overflow:hidden">
      <div class="chead"><h3>Themes</h3><span class="muted small">Every grievance and concern, by theme</span></div>
      <div>
        <sc-for list="{{m4Themes}}" as="t" hint-placeholder-count="5"><div class="listrow m4-th" style="padding:11px 20px"><div style="flex:0 0 190px">{{t.label}}</div><div class="bar blue" style="flex:1 1 100px"><i style="width:{{t.pct}}"></i></div><div class="name" style="flex:0 0 24px;text-align:right">{{t.n}}</div><div style="flex:0 0 150px;text-align:right"><sc-if value="{{t.flag}}" hint-placeholder-val="{{false}}"><span class="chip red">Repeat pattern</span></sc-if><sc-if value="{{t.back}}" hint-placeholder-val="{{false}}"><span class="chip amber">Sent back {{t.back}}</span></sc-if></div></div></sc-for>
      </div>
    </section>
    <section class="card" style="flex:2 1 340px;overflow:hidden">
      <div class="chead"><h3>Random calls</h3><span class="muted small">2 per patient during the stay</span></div>
      <div>
        <sc-for list="{{m4Calls}}" as="c" hint-placeholder-count="6"><div class="listrow" style="padding:10px 20px"><div style="flex:0 0 130px">{{c.name}}</div><div class="bar blue" style="flex:1 1 80px"><i style="width:{{c.pct}}"></i></div><div class="name" style="flex:0 0 44px;text-align:right">{{c.n}}</div></div></sc-for>
      </div>
    </section>
  </div>
  <section class="card" style="overflow:hidden">
    <div class="chead"><h3>Compliments</h3><span class="muted small">Praise logged from calls and notes. Share it with the team named.</span></div>
    <div>
      <sc-for list="{{m4Praise}}" as="r" hint-placeholder-count="3"><div class="listrow" style="padding:12px 20px;align-items:flex-start"><div style="flex:0 0 150px"><div class="name">{{r.name}}</div><div class="muted small">{{r.when}}</div></div><div class="grow"><div>{{r.words}}</div><div class="muted small">{{r.by}}</div></div></div></sc-for>
      <sc-if value="{{m4NoPraise}}" hint-placeholder-val="{{false}}"><div class="cpad muted">No compliments yet.</div></sc-if>
    </div>
  </section>
</sc-if>

</main>`, 'reports markup');

/* ================================================================ 4. NZ code */
rep('    NZ.lgOpenBtn = function () { openLg(',
`    // MEETING4: one log form (yes / no / compliment), call-and-log window, clock, confirm with family, reports
    var M4now = function () { return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); };
    var M4act = s.form.act || 'yes';
    var M4ACT = [['yes', 'Yes, it needs action'], ['no', 'No, just a note'], ['praise', 'Compliment']];
    NZ.actBtns = M4ACT.map(function (a) { return { label: a[1], cls: 'lz-chip' + (M4act === a[0] ? ' on' : ''), pick: function () { self.setState({ form: Object.assign({}, self.state.form, { act: a[0] }) }); } }; });
    NZ.actYes = M4act === 'yes';
    NZ.actHint = M4act === 'yes' ? 'It becomes a grievance with an owner and a clock: reminder at 3 h, Chandraji at 6 h.' : M4act === 'praise' ? 'Saved to the patient record and shown in Reports under Compliments.' : 'Saved to the patient record only. No owner and no clock.';
    NZ.saveLabel = M4act === 'yes' ? 'Save and assign' : M4act === 'praise' ? 'Save compliment' : 'Save note';
    var M4prevSave = NZ.saveConcern;
    NZ.saveConcern = function () {
      var f = self.state.form, act = f.act || 'yes', pid = f.pid, calls = Object.assign({}, self.state.calls), L = (calls[pid] || []).slice();
      var how = { family: 'Family call', voice: 'Voice note', patient: 'From the patient' }[f.src || 'family'];
      if (act === 'yes') {
        L.unshift({ d: '11 Nov', what: how + ' logged', who: 'Prabh', time: M4now(), how: how, note: f.desc || '', tag: 'concern' }); calls[pid] = L;
        M4prevSave(); self.setState({ calls: calls }); return;
      }
      if (self.__rec) { try { self.__rec.stop(); } catch (e) {} }
      L.unshift({ d: '11 Nov', what: how + ' logged', who: 'Prabh', time: M4now(), how: how, note: f.desc || '', tag: act === 'praise' ? 'compliment' : 'note' }); calls[pid] = L;
      self.setState({ calls: calls, logOpen: false, screen: 'record', pid: pid, recTab: 'family', form: Object.assign({}, f, { desc: '' }), micOn: false, micMsg: '' });
    };
    // the grievance clock
    NZ.demoH = s.demoH || 0;
    NZ.demoPlus1 = function () { self.setState({ demoH: (self.state.demoH || 0) + 1 }); };
    NZ.demoPlus3 = function () { self.setState({ demoH: (self.state.demoH || 0) + 3 }); };
    NZ.demoReset = function () { self.setState({ demoH: 0 }); };
    NZ.m4NeedFix = !!s.m4NeedFix;
    NZ.markFixed = function () {
      var note = String(self.state.resNote || '').trim();
      if (!note) { self.setState({ m4NeedFix: true }); return; }
      self.setState({ concernStatus: setStatus(cur.id, { status: 'In progress', stage: 'confirm', fixNote: note, sla: 'Call the family', slaTone: 'blue' }), resNote: '', m4NeedFix: false, filter: 'pending' });
    };
    var M4addLog = function (pid, entry) { var calls = Object.assign({}, self.state.calls); if (pid) { calls[pid] = [entry].concat(calls[pid] || []); } return calls; };
    NZ.confirmHappy = function () {
      var said = String(self.state.resNote || '').trim();
      self.setState({ concernStatus: setStatus(cur.id, { status: 'Resolved', stage: '', slaTone: 'green', sla: 'Closed today', resolution: (cur.fixNote || 'Fixed.') + ' Family confirmed they are happy' + (said ? ': ' + said : '.') + ' Called by Prabh.' }),
        calls: M4addLog(cur.pid, { d: '11 Nov', what: 'Closed with family', who: 'Prabh', time: M4now(), how: 'Phone', note: cur.title + (said ? ' · ' + said : ''), tag: 'closed' }), resNote: '', filter: 'closed' });
    };
    NZ.confirmNotHappy = function () {
      var said = String(self.state.resNote || '').trim(), clk = Object.assign({}, self.state.clk || {});
      clk[cur.id] = Date.now() + (self.state.demoH || 0) * 3.6e6;
      self.setState({ concernStatus: setStatus(cur.id, { status: 'Open', stage: '', sentBack: (cur.sentBack || 0) + 1, sla: 'Back with the owner', slaTone: 'amber' }), clk: clk,
        calls: M4addLog(cur.pid, { d: '11 Nov', what: 'Family not happy, sent back', who: 'Prabh', time: M4now(), how: 'Phone', note: cur.title + (said ? ' · ' + said : ''), tag: 'back' }), resNote: '', filter: 'open' });
    };
    // the call and log window
    var M4Q = [['Is the patient getting good care?', 'n', 'Nursing care'], ['Are the updates you get detailed enough?', 'n', 'Family updates'], ['Has the doctor spoken to you?', 'n', 'Doctor communication'], ['Do you understand how the patient is doing?', 'n', 'Family updates'],
      ['Has the therapist changed, or have sessions been missed?', 'y', 'Family updates'], ['Any trouble with food, the room or billing?', 'y', 'Food and dietary'], ['Any worry about staff behaviour, a fall or an injury?', 'y', 'Attendants and security']];
    var rcP = s.rcPid ? pById[s.rcPid] : null, rcs = s.rc || {}, rcq = rcs.q || {};
    var rcBad = M4Q.map(function (q, i) { return rcq[i] === q[1] ? i : -1; }).filter(function (i) { return i >= 0; });
    var rcSafety = rcq[6] === 'y', rcAny = rcBad.length > 0;
    var rcAct = rcs.act || (rcAny ? 'yes' : 'no');
    var rcCat = rcs.cat || (rcBad.length ? M4Q[rcBad[rcBad.length > 1 && rcSafety ? rcBad.length - 1 : 0]][2] : 'Other');
    var rcSet = function (patch) { self.setState({ rc: Object.assign({}, self.state.rc || {}, patch) }); };
    NZ.rcHas = !!rcP && !s.logOpen;
    NZ.rcName = rcP ? rcP.name : ''; NZ.rcGuardian = rcP ? rcP.gName : ''; NZ.rcRel = rcP ? String(rcP.gRel || '').toLowerCase() : ''; NZ.rcPhone = rcP ? rcP.phone : '';
    NZ.rcCount = rcP ? rnd(rcP) : '';
    NZ.rcClose = function () { self.setState({ rcPid: '', rc: {} }); };
    NZ.rcPick = [['up', 'Picked up'], ['none', 'No answer']].map(function (b) { return { label: b[1], cls: 'lz-chip' + (rcs.pick === b[0] ? ' on' : ''), go: function () { rcSet({ pick: b[0] }); } }; });
    NZ.rcUp = rcs.pick === 'up'; NZ.rcNone = rcs.pick === 'none';
    NZ.rcQs = M4Q.map(function (q, i) { return { label: (i + 1) + '. ' + q[0], yesCls: 'lz-chip' + (rcq[i] === 'y' ? ' on' + (q[1] === 'y' ? ' bad' : '') : ''), noCls: 'lz-chip' + (rcq[i] === 'n' ? ' on' + (q[1] === 'n' ? ' bad' : '') : ''),
      yes: function () { var q2 = Object.assign({}, self.state.rc && self.state.rc.q || {}); q2[i] = 'y'; rcSet({ q: q2, cat: undefined }); }, no: function () { var q2 = Object.assign({}, self.state.rc && self.state.rc.q || {}); q2[i] = 'n'; rcSet({ q: q2, cat: undefined }); } }; });
    NZ.rcWords = rcs.words || ''; NZ.rcSetWords = function (e) { rcSet({ words: e.target.value }); };
    NZ.rcActBtns = M4ACT.map(function (a) { return { label: a[1], cls: 'lz-chip' + (rcAct === a[0] ? ' on' : ''), go: function () { rcSet({ act: a[0] }); } }; });
    NZ.rcActHint = rcAct === 'yes' ? (rcAny ? 'Suggested from your answers: ' + rcCat + '. Change it if it does not fit.' : 'It becomes a grievance with an owner and a clock.') : rcAct === 'praise' ? 'Saved as a compliment. It shows in Reports.' : 'Saved to the patient record only.';
    NZ.rcActYes = rcAct === 'yes'; NZ.rcCat = rcCat; NZ.rcSetCat = function (e) { rcSet({ cat: e.target.value }); };
    NZ.rcSafety = rcSafety;
    var rcRt = rcSafety ? ['S Chandra', 'GM Operations'] : (R[rcCat] || R['Other']);
    NZ.rcRoute = 'Goes to ' + rcRt[0] + ' (' + rcRt[1] + '). Reminder at 3 h, Chandraji at 6 h.';
    NZ.rcSaveLabel = rcAct === 'yes' ? 'Save and assign' : rcAct === 'praise' ? 'Save compliment' : 'Save call';
    NZ.rcNoAnswer = function () {
      var p = rcP; if (!p) return;
      self.setState({ calls: M4addLog(p.id, { d: '11 Nov', what: 'Random call, no answer', who: 'Prabh', time: M4now(), how: 'Phone', note: 'Did not pick up. Try again tomorrow.', tag: 'noanswer' }), rcPid: '', rc: {} });
    };
    NZ.rcSave = function () {
      var p = rcP; if (!p) return;
      var r = self.state.rc || {}, qq = r.q || {}, words = String(r.words || '').trim();
      var bads = M4Q.map(function (q, i) { return qq[i] === q[1] ? i : -1; }).filter(function (i) { return i >= 0; });
      var act = r.act || (bads.length ? 'yes' : 'no'), cat = r.cat || (bads.length ? M4Q[bads[0]][2] : 'Other'), safety = qq[6] === 'y';
      var n = (parseInt(p.random, 10) || 0) + (self.state.calls[p.id] || []).filter(function (l) { return l.rc; }).length + 1;
      var raised = bads.map(function (i) { return M4Q[i][0].replace(/\\?$/, ''); }).join('; ');
      var entry = { d: '11 Nov', what: 'Random call ' + n, who: 'Prabh', time: M4now(), how: 'Phone', note: words || (bads.length ? 'Raised: ' + raised + '.' : 'All good on the seven questions.'), rc: true, tag: act === 'praise' ? 'compliment' : act === 'yes' ? 'concern' : 'note' };
      var patch = { calls: M4addLog(p.id, entry), rcPid: '', rc: {} };
      if (n >= 2) { var o = Object.assign({}, self.state.overrides); o[p.id + ':6'] = 'done'; patch.overrides = o; }
      if (act === 'yes') {
        var id = 'C-0' + (143 + self.state.extraConcerns.length), tg = (qq[2] === 'n') ? 'Psychiatrist' : (qq[3] === 'n' || qq[4] === 'y') ? 'Psychologist' : 'General admin';
        var rt = safety ? ['S Chandra', 'GM Operations'] : tg === 'Psychiatrist' ? ['Treating psychiatrist', 'Clinical team'] : tg === 'Psychologist' ? ['Treating psychologist', 'Clinical team'] : (R[cat] || R['Other']);
        var title = (words || raised || 'Raised on a random call').split('.')[0].slice(0, 70);
        var c = { id: id, type: safety ? 'grievance' : 'concern', pid: p.id, title: title, raisedBy: p.gName + ', ' + String(p.gRel || '').toLowerCase(), via: 'Random call ' + n + ', Prabh', src: 'family', tag: tg, owner: rt[0], ownerRole: rt[1], category: cat,
          sla: '6 h left', slaTone: 'grey', logged: 'just now', status: safety ? 'Pending' : 'Open', desc: (words ? words + ' ' : '') + (bads.length ? 'Raised on the call: ' + raised + '.' : '') };
        patch.extraConcerns = self.state.extraConcerns.concat([c]); patch.screen = 'concerns'; patch.filter = 'open'; patch.srcf = 'all'; patch.cid = id;
      } else { patch.screen = 'record'; patch.pid = p.id; patch.recTab = 'family'; }
      self.setState(patch);
    };
    // reports
    var m4cats = {}, m4back = 0;
    all.forEach(function (c) { var k = c.category || 'Other'; m4cats[k] = m4cats[k] || { n: 0, back: 0 }; m4cats[k].n++; m4cats[k].back += (c.sentBack || 0); m4back += (c.sentBack || 0); });
    var m4keys = Object.keys(m4cats).sort(function (a, b) { return m4cats[b].n - m4cats[a].n; }), m4max = Math.max.apply(null, m4keys.map(function (k) { return m4cats[k].n; }).concat([1]));
    NZ.m4Themes = m4keys.map(function (k) { return { label: k, n: m4cats[k].n, pct: Math.round(m4cats[k].n / m4max * 100) + '%', flag: m4cats[k].n >= 2, back: m4cats[k].back || 0 }; });
    var m4praise = [{ name: 'Meera Iyer', when: '10 Nov', words: 'Sister Rekha sat with her on the first night. We felt safe leaving her.', by: 'S. Iyer, father · night nursing' }, { name: 'Varun Rao', when: '9 Nov', words: 'Dr. Singh called back the same day and explained the plan.', by: 'Kiran Rao, brother · psychiatrist' }, { name: 'Rahul Sethi', when: '8 Nov', words: 'Housekeeping returned the laundry and said sorry. Thank you.', by: 'Vikas Sethi, father · housekeeping' }];
    Object.keys(s.calls).forEach(function (pid) { (s.calls[pid] || []).forEach(function (l) { if (l.tag === 'compliment') { var pp = pById[pid]; m4praise.unshift({ name: pp ? pp.name : '', when: l.d, words: l.note || 'Compliment logged.', by: 'Logged by ' + l.who + ' · ' + l.how }); } }); });
    NZ.m4Praise = m4praise; NZ.m4NoPraise = m4praise.length === 0;
    var m4rc = P.map(function (p) { var k = parseInt(rnd(p), 10) || 0; return { name: p.name, k: k, n: k + ' of 2', pct: Math.round(k / 2 * 100) + '%' }; });
    NZ.m4Calls = m4rc;
    var m4done = m4rc.reduce(function (a, b) { return a + b.k; }, 0);
    NZ.m4Tiles = [
      { label: 'Grievances and concerns', value: String(all.length), sub: 'This month' },
      { label: 'Repeat patterns', value: String(m4keys.filter(function (k) { return m4cats[k].n >= 2; }).length), sub: 'Themes with 2 or more' },
      { label: 'Sent back by family', value: String(m4back), sub: 'Not happy after the fix' },
      { label: 'Compliments', value: String(m4praise.length), sub: 'Calls and notes' },
      { label: 'Random calls done', value: m4done + ' of ' + (P.length * 2), sub: '2 per patient during the stay' }
    ];
    NZ.lgOpenBtn = function () { openLg(`, 'meeting4 NZ');

/* ================================================================ css */
const css = `
/* MEETING4 */
.tb-log{height:38px;padding:0 16px;gap:6px;margin-right:6px}
.m4-stage{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid #e3eaf2;border-radius:14px;background:#f8fbff}
.m4-steps{display:flex;gap:6px;flex-wrap:wrap}
.m4-s{font-size:12px;font-weight:650;padding:4px 11px;border-radius:99px;background:#eef2f7;color:#667085}
.m4-s.done{background:#dcf5e6;color:#0e6b3d}
.m4-s.now{background:#dbe9fb;color:#1e5bb8}
.m4-s.now.warn{background:#fdebc4;color:#8a5a00}
.m4-s.now.bad{background:#fbd9d7;color:#a1241d}
.m4-txt{font-size:13.5px;color:#14284b;line-height:1.4}
.m4-clock{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.m4-clock .btn.sm.link{height:26px;padding:0 8px}
.rc-modal{width:min(620px,94vw);max-height:92vh;overflow:auto}
.rc-qs{display:flex;flex-direction:column;gap:6px}
.rc-q{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border:1px solid #e3eaf2;border-radius:12px;background:#fff}
.rc-ql{font-size:14px;font-weight:600;color:#14284b}
.rc-qb{display:flex;gap:6px;flex:0 0 auto}
.rc-qb .lz-chip{min-height:34px;padding:0 14px;font-size:13.5px}
.lz-chip.on.bad{background:#d9453d;border-color:#d9453d;color:#fff}
.note.bad{background:#fff1f0;border-color:#f3b9b6;color:#a1241d}
.m4-th .chip{margin-left:4px}
`;
const cssAt = t.lastIndexOf('</style>');
if (cssAt < 0) throw new Error('no style end');
t = t.slice(0, cssAt) + css + t.slice(cssAt);

/* ================================================================ write back */
let out = JSON.stringify(t).split('</').join('<' + BS + '/');
fs.writeFileSync(file, src.slice(0, i0) + '\n' + out + '\n' + src.slice(i1));
console.log('ok', t.length);
