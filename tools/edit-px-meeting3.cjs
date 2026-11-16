/* One-off (12 Nov 2026, third review with Nikita and Anu): Patient Experience Lead.
   - Patient dashboard: no Family column, the action buttons sit next to the reminder text, Open record is a quiet link
   - End of day updates and Floor round are two separate pages in the menu (no tab switch between them)
   - Floor round: a box for every room (tap a box, tick the day's checks in a pop-up)
   - Discharge SOP: one clear top card (patient, progress), then three numbered steps
   - IPD follow-ups: Send to call centre in the header and on every row
   - Grievances: four sources (family call, voice note, from the patient, internal and automatic), category tag, voice typing */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING3')) throw new Error('already applied');
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
function replaceBetween(startMarker, endMarker, withText, label) {
  const s = t.indexOf(startMarker);
  if (s < 0) throw new Error('start marker: ' + label);
  const e = t.indexOf(endMarker, s + startMarker.length);
  if (e < 0) throw new Error('end marker: ' + label);
  t = t.slice(0, s) + withText + t.slice(e);
}

/* ================================================================ 1. Patient dashboard */
rep('<sc-raw-th>Reminders</sc-raw-th><sc-raw-th>Family</sc-raw-th><sc-raw-th></sc-raw-th>', '<sc-raw-th>Reminders</sc-raw-th><sc-raw-th></sc-raw-th>', 'th');
rep('              <sc-raw-td><div class="name">{{p.guardianName}}</div><div class="muted small">{{p.guardianRel}} · last contact {{p.lastContact}}</div></sc-raw-td>\n', '', 'family td');
rep('<sc-raw-td><button class="btn sm" type="button" sc-camel-on-click="{{p.open}}">Open record</button></sc-raw-td>',
    '<sc-raw-td class="open-c"><button class="open-lnk" type="button" sc-camel-on-click="{{p.open}}">Open record<svg width="14" height="14" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button></sc-raw-td>', 'open td');

/* ================================================================ 2. End of day updates and Floor round: two pages */
rep("['floor', 'Floor round', 0], ['dcheck', 'Discharge SOP',", "['floor', 'End of day updates', 0], ['clean', 'Floor round', 0], ['dcheck', 'Discharge SOP',", 'nav');
rep("(n[0] === 'floor' && s.screen === 'clean') || (n[0] === 'dcheck' && s.screen === 'feedback')", "(n[0] === 'dcheck' && s.screen === 'feedback')", 'nav on');
rep("NZ.pageTitle = { floor: 'Floor round', clean: 'Floor round',", "NZ.pageTitle = { floor: 'End of day updates', clean: 'Floor round',", 'page title');
rep('<div><h2>Floor round</h2><div class="muted">Each person on the floor sends their own update at the end of the day. An issue goes straight to the team that owns it.</div></div>\n    <div class="seg fl-tabs" role="tablist"><sc-for list="{{floorTabs}}" as="g" hint-placeholder-count="2"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}}<sc-if value="{{g.has}}" hint-placeholder-val="{{false}}"> <span class="n">{{g.n}}</span></sc-if></button></sc-for></div>',
    '<div><h2>End of day updates</h2><div class="muted">Each person on the floor sends their own update at the end of the day. An issue goes straight to the team that owns it.</div></div>', 'eod hello');
rep('<div><h2>Floor round</h2><div class="muted">{{frIntro}}</div></div>\n    <div class="seg fl-tabs" role="tablist"><sc-for list="{{floorTabs}}" as="g" hint-placeholder-count="2"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}}<sc-if value="{{g.has}}" hint-placeholder-val="{{false}}"> <span class="n">{{g.n}}</span></sc-if></button></sc-for></div>',
    '<div><h2>Floor round</h2><div class="muted">{{frIntro}}</div></div>', 'clean hello');

/* ================================================================ 3. Floor round: a box for every room */
replaceBetween('    <div class="fm-scroll">', '    <sc-if value="{{frHasMsg}}"',
`    <div class="rb-grid">
      <sc-for list="{{frBoxes}}" as="r" hint-placeholder-count="12">
        <button class="{{r.cls}}" type="button" sc-camel-on-click="{{r.pick}}">
          <span class="rb-top"><b>{{r.no}}</b><span class="{{r.chipCls}}">{{r.state}}</span></span>
          <span class="rb-pts">{{r.pts}}</span>
          <span class="rb-bar"><i style="width:{{r.pct}}"></i></span>
          <span class="rb-n">{{r.count}}</span>
        </button>
      </sc-for>
    </div>
`, 'fm-scroll');
rep('<div class="muted small">Tap a box: once for OK, again to log an issue, a third time to clear it. <b>All OK</b> fills a whole room.</div>',
    '<div class="muted small">Tap a room box to check it. In the pop-up, mark each check <b>OK</b> or <b>Issue</b>, or press <b>All OK</b> when the whole room is fine.</div>', 'tap hint');
rep('NZ.frIntro = \'Walk the floor room by room. A different set of checks comes up each day, so all six are covered every six days. Today is day \'',
    'NZ.frIntro = \'Walk the floor and tap each room box. A different set of checks comes up each day, so all six are covered every six days. Today is day \'', 'intro');

rep("frG: -1, frm: {},", "frG: -1, frRoom: '', frm: {},", 'state frRoom');

/* data for the boxes and the room pop-up */
rep("NZ.frMsg = s.frMsg || ''; NZ.frHasMsg = !!s.frMsg;",
`NZ.frMsg = s.frMsg || ''; NZ.frHasMsg = !!s.frMsg;
    // MEETING3: room boxes
    var frSelRm = (s.frRoom && ROOMS[s.clFloor].indexOf(s.frRoom) >= 0) ? s.frRoom : '';
    NZ.frBoxes = ROOMS[s.clFloor].map(function (rm) {
      var pts = occ(s.clFloor, rm), ok = 0, bad = 0;
      for (var i = 0; i < colN; i++) { var v = frGet(s.clFloor, rm, selG, i); if (v === 'ok') ok++; else if (v === 'issue') bad++; }
      var marked = ok + bad, done = marked === colN, st = bad ? 'bad' : done ? 'done' : marked ? 'part' : '';
      return { no: rm, cls: 'rb' + (st ? ' ' + st : '') + (rm === frSelRm ? ' sel' : ''), chipCls: 'rb-s' + (st ? ' ' + st : ''), state: bad ? 'Issue' : done ? 'Done' : marked ? 'Part done' : 'To check',
        pts: pts.length ? pts.join(', ') : 'Vacant', pct: Math.round(marked / colN * 100) + '%', count: marked + ' of ' + colN + ' checked',
        pick: function () { self.setState({ frRoom: rm, frMsg: '' }); } };
    });
    NZ.frHasSel = !!frSelRm && !lgn.open;
    NZ.frSelNo = frSelRm;
    NZ.frSelSub = frSelRm ? (occ(s.clFloor, frSelRm).join(', ') || 'Vacant') + ' · ' + CLFL[s.clFloor] : '';
    NZ.frSelDay = FRG[selG][0];
    NZ.frSelChecks = frSelRm ? FRG[selG][1].map(function (lab, i) {
      var v = frGet(s.clFloor, frSelRm, selG, i), key = s.clFloor + ':' + frSelRm + ':' + selG + ':' + i;
      return { label: CLS[selG][1][i][1], rowCls: 'rb-chk' + (v === 'issue' ? ' bad' : v === 'ok' ? ' ok' : ''), okCls: 'rb-b ok' + (v === 'ok' ? ' on' : ''), isCls: 'rb-b iss' + (v === 'issue' ? ' on' : ''),
        ok: function () { frPut(key, v === 'ok' ? '' : 'ok'); },
        issue: function () { if (v === 'issue') frPut(key, ''); else openLg(frSelRm, i); } };
    }) : [];
    NZ.frSelAllOk = function () { var m = Object.assign({}, self.state.frm); for (var i = 0; i < colN; i++) { var k2 = s.clFloor + ':' + frSelRm + ':' + selG + ':' + i; if (frGet(s.clFloor, frSelRm, selG, i) !== 'issue') m[k2] = 'ok'; } self.setState({ frm: m, frMsg: '' }); };
    NZ.frSelClose = function () { self.setState({ frRoom: '' }); };
    NZ.frSelNext = function () { var L = ROOMS[s.clFloor], k = L.indexOf(frSelRm); self.setState({ frRoom: L[(k + 1) % L.length] }); };`, 'NZ boxes');

rep('<!-- ============ LOG ISSUE (pop-up) ============ -->',
`<!-- ============ ROOM CHECKS (pop-up) ============ -->
<sc-if value="{{frHasSel}}" hint-placeholder-val="{{false}}">
  <div class="overlay mid">
    <div class="drawer modal rb-modal" role="dialog" aria-label="Room checks">
      <div class="toolbar"><div><h3 style="font-size:19px">Room {{frSelNo}}</h3><div class="muted small">{{frSelSub}}</div></div><button class="btn sm link" type="button" sc-camel-on-click="{{frSelClose}}">Close</button></div>
      <div class="rb-day">{{frSelDay}}</div>
      <div class="rb-list">
        <sc-for list="{{frSelChecks}}" as="c" hint-placeholder-count="8">
          <div class="{{c.rowCls}}"><span class="rb-l">{{c.label}}</span><span class="rb-tg" role="group" aria-label="{{c.label}}"><button class="{{c.okCls}}" type="button" sc-camel-on-click="{{c.ok}}">OK</button><button class="{{c.isCls}}" type="button" sc-camel-on-click="{{c.issue}}">Issue</button></span></div>
        </sc-for>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto"><button class="btn pri" type="button" sc-camel-on-click="{{frSelAllOk}}">All OK</button><button class="btn" type="button" sc-camel-on-click="{{frSelNext}}">Next room</button><button class="btn" type="button" sc-camel-on-click="{{frSelClose}}">Done</button></div>
    </div>
  </div>
</sc-if>

<!-- ============ LOG ISSUE (pop-up) ============ -->`, 'room modal');

/* ================================================================ 4. Discharge SOP: one clear top, three numbered steps */
replaceBetween('  <div class="{{dcGoCls}}">\n    <div class="lz-t"><h2>{{dcGoTitle}}</h2><p>{{dcGoSub}}</p></div>', '  \n  <section class="card">\n    <div class="chead"><h3>Who has done what</h3>',
`  <section class="card sop-head"><div class="cpad lz-stack">
    <div class="sop-hd"><div class="lz-chips"><sc-for list="{{dcPatients}}" as="o" hint-placeholder-count="1"><button class="{{o.cls}}" type="button" sc-camel-on-click="{{o.pick}}">{{o.label}}</button></sc-for></div></div>
    <div class="lz-line">{{dcLine}}</div>
    <div class="lz-prog"><div class="lz-bar"><i class="{{dcBarCls}}" style="width:{{dcPct}}"></i></div><b>{{dcPctText}}</b></div>
    <div class="muted small">Read only. The psychiatrist, psychologist, duty nurse, front desk and billing tick their own items in the doctor portal. You can tick the items that are yours.</div>
  </div></section>
  <div class="sop-steps">
    <div class="sop-st {{sopGoTone}}"><span class="sop-n">1</span><div class="sop-b"><b>{{dcGoTitle}}</b><p>{{dcGoSub}}</p><button class="btn lz-big" type="button" sc-camel-on-click="{{dcGoAct}}">{{dcGoBtn}}</button></div></div>
    <div class="sop-st"><span class="sop-n">2</span><div class="sop-b"><b>Collect the family's feedback</b><p>{{dcCollectHint}}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{dcCollect}}">Collect feedback</button></div>
      <sc-if value="{{dcShowBlocks}}" hint-placeholder-val="{{false}}"><div class="note"><b>Still open on the ward side:</b><sc-for list="{{dcBlocks}}" as="b" hint-placeholder-count="3"><div>· {{b.t}}</div></sc-for></div></sc-if>
      <sc-if value="{{dcOpenFinal}}" hint-placeholder-val="{{true}}"><div><button class="btn link" type="button" sc-camel-on-click="{{dcSim}}">Demo only: show the ward team finishing the checklist</button></div></sc-if></div></div>
    <div class="sop-st"><span class="sop-n">3</span><div class="sop-b"><b>IPD follow-ups</b><sc-if value="{{dcDone}}" hint-placeholder-val="{{false}}"><p>{{dcDoneText}}</p><button class="btn lz-big" type="button" sc-camel-on-click="{{goFollow}}">Open IPD follow-ups</button></sc-if><sc-if value="{{dcNotDone}}" hint-placeholder-val="{{true}}"><p>The OPD visits and the Day-14 and Day-30 calls are added here once the feedback is collected.</p></sc-if></div></div>
  </div>
`, 'sop top');
rep("NZ.dcGoCls = dcGo.cls;", "NZ.sopGoTone = /(^| )ok( |$)/.test(dcGo.cls || '') ? 'ok' : /warn/.test(dcGo.cls || '') ? 'warn' : ''; NZ.dcNotDone = !dc.done; NZ.dcGoCls = dcGo.cls;", 'sop vars');

/* ================================================================ 5. IPD follow-ups: Send to call centre */
rep('<div><h2>IPD follow-ups</h2><div class="muted">A report, not a to-do list. Every row is made by itself from a discharge checklist: the doctor and psychologist OPD dates, and the Day-14 and Day-30 calls.</div></div>\n  </div>',
    '<div><h2>IPD follow-ups</h2><div class="muted">A report, not a to-do list. Every row is made by itself from a discharge checklist: the doctor and psychologist OPD dates, and the Day-14 and Day-30 calls.</div></div>\n    <button class="btn pri lz-big" type="button" sc-camel-on-click="{{fuSend}}">Send to call centre</button>\n  </div>', 'fu header');
rep('<sc-raw-td><sc-if value="{{f.canRemind}}" hint-placeholder-val="{{false}}"><button class="{{f.remCls}}" type="button" sc-camel-on-click="{{f.remind}}">{{f.remLabel}}</button></sc-if></sc-raw-td>',
    '<sc-raw-td><div class="fu-acts"><sc-if value="{{f.canSend}}" hint-placeholder-val="{{false}}"><button class="{{f.sendCls}}" type="button" sc-camel-on-click="{{f.sendRow}}">{{f.sendLabel}}</button></sc-if><sc-if value="{{f.canRemind}}" hint-placeholder-val="{{false}}"><button class="{{f.remCls}}" type="button" sc-camel-on-click="{{f.remind}}">{{f.remLabel}}</button></sc-if></div></sc-raw-td>', 'fu row buttons');
rep("remind: function () { var r = Object.assign({}, self.state.fuRem); r[f.id] = true; self.setState({ fuRem: r }); },",
`remind: function () { var r = Object.assign({}, self.state.fuRem); r[f.id] = true; self.setState({ fuRem: r }); },
        canSend: !closed && !posted, sendLabel: s.fuRowSending === f.id ? 'Sending...' : 'Send to call centre', sendCls: 'btn sm pri',
        sendRow: function () {
          if (self.state.fuRowSending) return;
          var txt = ['Follow-up: ' + f.kind, 'Patient: ' + f.name, 'Due: ' + dm(f.due), 'Family: ' + f.family + (f.phone ? ' ' + f.phone : '')].join('\\n');
          self.setState({ fuRowSending: f.id, fuRowMsg: 'Sending to the call-centre WhatsApp group...' });
          fetch('/api/send/callcentre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: txt, by: 'Patient experience' }) })
            .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'The server sent a reply that could not be read.' }; }); })
            .then(function (j) {
              if (j && j.ok) { var m = Object.assign({}, self.state.fuOut), c2 = m[f.id] || {}; m[f.id] = Object.assign({}, c2, { posted: toIso(TODAY) }); self.setState({ fuRowSending: '', fuOut: m, fuRowMsg: 'Sent ' + f.name + ' to the call centre at ' + nowTime() + '.' }); }
              else self.setState({ fuRowSending: '', fuRowMsg: 'Not sent: ' + ((j && j.error) || 'unknown error') });
            })
            .catch(function () { self.setState({ fuRowSending: '', fuRowMsg: 'Not sent. Could not reach the server.' }); });
        },`, 'fu row fn');
rep('<div class="lz-line">{{fuCame}}</div>', '<sc-if value="{{fuHasMsg2}}" hint-placeholder-val="{{false}}"><div class="info" aria-live="polite">{{fuMsg}}</div></sc-if>\n  <div class="lz-line">{{fuCame}}</div>', 'fu msg');
rep("NZ.fuSendLabel = s.fuSending ? 'Sending...' : (s.fuPosted ? 'Send again' : 'Send');", "NZ.fuSendLabel = s.fuSending ? 'Sending...' : (s.fuPosted ? 'Send again' : 'Send'); NZ.fuHasMsg2 = !!s.fuRowMsg; NZ.fuRowMsg = s.fuRowMsg || ''; ", 'fu label');

/* ================================================================ 6. Grievances: four sources, a category tag, voice typing */
rep("form: { type: 'concern', pid: 'p2', category: 'Family updates', sev: 'Medium', desc: '' },", "form: { type: 'concern', pid: 'p2', category: 'Family updates', sev: 'Medium', desc: '', src: 'family', tag: 'General admin' }, srcf: 'all', micOn: false, micMsg: '',", 'form state');
/* source on every grievance */
rep("typeLabel: TY[c.type][0], tyCls: TY[c.type][1],",
    "typeLabel: TY[c.type][0], tyCls: TY[c.type][1], srcKey: srcKeyOf(c), srcLabel: SRCL[srcKeyOf(c)][0], srcCls: 'gv-src ' + SRCL[srcKeyOf(c)][1], tagLabel: c.tag || 'General admin',", 'row src');
rep("    var all = C.map(function (c) {",
`    // MEETING3: where a grievance came from
    var SRCL = { family: ['Family call', 'family'], voice: ['Voice note', 'voice'], patient: ['From the patient', 'patient'], internal: ['Internal · automatic', 'internal'] };
    var srcKeyOf = function (c) { return c.src || (/floor round|end of day|weekly report|automatic/i.test(c.via || '') ? 'internal' : (/(^|, )patient/i.test(c.raisedBy || '') || /^patient/i.test(c.via || '')) ? 'patient' : 'family'); };
    var all = C.map(function (c) {`, 'src fn');
/* list: source badge + source filter */
rep('<div class="name">{{c.title}}</div><div class="muted small">{{c.id}} · {{c.category}} · {{c.raisedBy}}</div></sc-raw-td>',
    '<div class="name">{{c.title}}</div><div class="muted small"><span class="{{c.srcCls}}">{{c.srcLabel}}</span> {{c.id}} · {{c.category}} · {{c.raisedBy}}</div></sc-raw-td>', 'row template');
rep('  <div class="cols gv-cols">\n    <section class="card gv-list"',
    '  <div class="gv-srcs" role="tablist" aria-label="Where it came from"><span class="muted small">Came in as</span><sc-for list="{{srcFilters}}" as="f" hint-placeholder-count="5"><button class="{{f.cls}}" type="button" sc-camel-on-click="{{f.go}}">{{f.label}} <span class="n">{{f.n}}</span></button></sc-for></div>\n  <div class="cols gv-cols">\n    <section class="card gv-list"', 'src filter markup');
rep("filters: filters, concernRows: all.filter(function (c) { return match(s.filter, c); }), cur: cur,",
    "filters: filters, concernRows: all.filter(function (c) { return match(s.filter, c) && (s.srcf === 'all' || c.srcKey === s.srcf); }), cur: cur,\n      srcFilters: [['all', 'All']].concat(Object.keys(SRCL).map(function (k) { return [k, SRCL[k][0]]; })).map(function (f) { return { label: f[1], n: all.filter(function (c) { return match(s.filter, c) && (f[0] === 'all' || c.srcKey === f[0]); }).length, cls: 'gv-chip' + (s.srcf === f[0] ? ' on' : ''), go: function () { self.setState({ srcf: f[0] }); } }; }),", 'rows src filter');
/* detail panel: where it came from */
rep('<div><div class="lbl">Category</div><div class="v">{{cur.category}}</div></div>\n          <div><div class="lbl">Owner</div>',
    '<div><div class="lbl">Category</div><div class="v">{{cur.category}}</div></div>\n          <div><div class="lbl">Came in as</div><div class="v">{{cur.srcLabel}}</div><div class="muted small">Tag: {{cur.tagLabel}}</div></div>\n          <div><div class="lbl">Owner</div>', 'detail src');
/* the log pop-up: how did it come in */
rep('<div class="field"><label for="lr">Raised by</label><sc-raw-select id="lr"><option>Family</option><option>Patient</option><option>Ward staff</option><option>Front desk</option><option>Call centre</option><option>Floor round</option></sc-raw-select></div>\n', '', 'raised by');
rep('      <div class="fgrid">\n        <div class="field"><label for="lp">Patient</label>',
`      <div class="field"><label>How did it come in?</label><div class="lz-chips"><sc-for list="{{srcBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div><div class="muted small">{{srcHint}}</div></div>
      <div class="fgrid">
        <div class="field"><label for="lp">Patient</label>`, 'src chooser');
rep('<div class="field"><label for="ld">What did they say?</label><textarea id="ld" placeholder="In their words" value="{{form.desc}}" sc-camel-on-change="{{setDesc}}"></textarea></div>',
`<sc-if value="{{isVoice}}" hint-placeholder-val="{{false}}"><div class="field"><label>Speak it</label><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="{{micCls}}" type="button" sc-camel-on-click="{{micToggle}}">{{micLabel}}</button><span class="muted small">{{micMsg}}</span></div></div></sc-if>
      <div class="field"><label for="ld">{{descLabel}}</label><textarea id="ld" placeholder="{{descPh}}" value="{{form.desc}}" sc-camel-on-change="{{setDesc}}"></textarea></div>
      <div class="field"><label>Category tag · who should see it first</label><div class="lz-chips"><sc-for list="{{tagBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>`, 'desc field');
rep("NZ.lgOpenBtn = function () {", /* anchor: the first NZ block of MEETING2 code; the grievance code is added right before it */
`// MEETING3: grievance log pop-up
    var SRCB = [['family', 'Family call', 'Logged while you are on a call with the family.'], ['voice', 'Voice note', 'Speak it and it is typed for you. Check the words, then save.'], ['patient', 'From the patient', 'The patient\\'s own grievance, in their words.']];
    var TAGS = ['Psychiatrist', 'Psychologist', 'General admin'];
    var fsrc = s.form.src || 'family', ftag = s.form.tag || 'General admin';
    NZ.srcBtns = SRCB.map(function (b) { return { label: b[1], cls: 'lz-chip' + (fsrc === b[0] ? ' on' : ''), pick: function () { self.setState({ form: Object.assign({}, self.state.form, { src: b[0] }), micMsg: '' }); } }; });
    NZ.srcHint = SRCB.filter(function (b) { return b[0] === fsrc; })[0][2] + ' Internal grievances are made by the system from floor rounds and end of day updates; nobody logs them by hand.';
    NZ.tagBtns = TAGS.map(function (g) { return { label: g, cls: 'lz-chip' + (ftag === g ? ' on' : ''), pick: function () { self.setState({ form: Object.assign({}, self.state.form, { tag: g }) }); } }; });
    NZ.isVoice = fsrc === 'voice';
    NZ.descLabel = fsrc === 'patient' ? 'What did the patient say?' : fsrc === 'voice' ? 'What was said' : 'What did the family say?';
    NZ.descPh = fsrc === 'voice' ? 'The words appear here. You can fix them before saving.' : 'In their words';
    NZ.micMsg = s.micMsg; NZ.micCls = 'btn pri' + (s.micOn ? ' rec' : ''); NZ.micLabel = s.micOn ? 'Stop' : 'Speak';
    NZ.micToggle = function () {
      var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (self.__rec) { try { self.__rec.stop(); } catch (e) {} return; }
      if (!Rec) { self.setState({ micMsg: 'Voice typing is not available in this browser. Type it instead, or use Chrome.' }); return; }
      var r = new Rec(), base = String(self.state.form.desc || '').trim(); base = base ? base + ' ' : '';
      r.lang = 'en-IN'; r.interimResults = true; r.continuous = true; self.__rec = r;
      r.onresult = function (e) { var x = ''; for (var i = 0; i < e.results.length; i++) x += e.results[i][0].transcript; self.setState({ form: Object.assign({}, self.state.form, { desc: (base + x).trim() }) }); };
      r.onerror = function (e) { self.setState({ micMsg: e.error === 'not-allowed' ? 'Allow the microphone to use voice typing.' : 'Voice typing stopped (' + e.error + '). You can type the rest.' }); };
      r.onend = function () { self.__rec = null; self.setState({ micOn: false }); };
      try { r.start(); self.setState({ micOn: true, micMsg: 'Listening... speak now.' }); } catch (e) { self.__rec = null; }
    };
    NZ.routeOwner = ftag === 'Psychiatrist' ? 'Treating psychiatrist' : ftag === 'Psychologist' ? 'Treating psychologist' : route[0];
    NZ.routeRole = ftag === 'General admin' ? route[1] : 'Clinical team';
    NZ.saveConcern = function () {
      if (self.__rec) { try { self.__rec.stop(); } catch (e) {} }
      var f = self.state.form, id = 'C-0' + (143 + self.state.extraConcerns.length), ty = f.sev === 'High' ? 'grievance' : 'concern';
      var rt = f.sev === 'High' ? ['S Chandra', 'GM Operations'] : (f.tag === 'Psychiatrist' ? ['Treating psychiatrist', 'Clinical team'] : f.tag === 'Psychologist' ? ['Treating psychologist', 'Clinical team'] : (R[f.category] || R['Other']));
      var sk = f.src || 'family';
      var c = { id: id, type: ty, pid: f.pid, title: (f.desc || 'New ' + ty).split('.')[0].slice(0, 70), raisedBy: sk === 'patient' ? 'Patient' : 'Family', via: sk === 'voice' ? 'Voice note, Prabh' : sk === 'patient' ? 'Patient, logged by Prabh' : 'Family call, Prabh', src: sk, tag: f.tag || 'General admin', owner: rt[0], ownerRole: rt[1], category: f.category,
        sla: '6 h left', slaTone: 'grey', logged: 'just now', status: ty === 'grievance' ? 'Pending' : 'Open', desc: f.desc || 'No description added.' };
      self.setState({ extraConcerns: self.state.extraConcerns.concat([c]), logOpen: false, screen: 'concerns', filter: 'open', srcf: 'all', cid: id, form: Object.assign({}, f, { desc: '' }), micOn: false, micMsg: '' });
    };
    NZ.lgOpenBtn = function () {`, 'grievance NZ');

/* floor round and end of day issues are internal grievances */
repN("raisedBy: 'Floor round, Prabh', via: 'Floor round',", "raisedBy: 'Floor round, Prabh', via: 'Floor round', src: 'internal',", 2, 'internal src floor');
rep("raisedBy: 'End of day update, ' + pp[1], via: 'End of day update',", "raisedBy: 'End of day update, ' + pp[1], via: 'End of day update', src: 'internal',", 'internal src eod');

/* ================================================================ css */
const css = `
/* MEETING3 */
.open-c{width:1%;white-space:nowrap}
.open-lnk{display:inline-flex;align-items:center;gap:4px;border:0;background:none;color:#1e5bb8;font:inherit;font-size:13px;font-weight:650;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background .15s,transform .15s}
.open-lnk:hover{background:#eaf2fd;transform:translateX(2px)}
table.pt .rm .rm-r{gap:10px}
table.pt .rm .rm-t{flex:0 1 auto}
table.pt .rm .btn{margin-left:4px}
table.pt .rm .btn.sm{height:28px;padding:0 10px;font-size:12px}
.rb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:12px;padding:6px 20px 22px}
.rb{display:flex;flex-direction:column;gap:7px;text-align:left;font:inherit;padding:13px 14px;background:#fff;border:1.5px solid #dbe4f0;border-radius:14px;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
.rb:hover{transform:translateY(-3px);box-shadow:0 10px 20px -10px rgba(30,60,120,.3);border-color:#9ec0f7}
.rb.done{border-color:#7ccba0;background:#f4fcf7}
.rb.part{border-color:#f1d28a;background:#fffbf0}
.rb.bad{border-color:#f0a3a0;background:#fff6f6}
.rb.sel{box-shadow:0 0 0 3px #cfe0fb}
.rb-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rb-top b{font-size:22px;font-weight:800;letter-spacing:-.02em;color:#14284b}
.rb-s{font-size:11px;font-weight:700;padding:2px 9px;border-radius:99px;background:#eef2f7;color:#5b6475}
.rb-s.done{background:#dcf5e6;color:#0e6b3d}.rb-s.part{background:#fdebc4;color:#8a5a00}.rb-s.bad{background:#fbd9d7;color:#a1241d}
.rb-pts{font-size:12.5px;color:#475467;line-height:1.35;min-height:34px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rb-bar{display:block;height:5px;border-radius:99px;background:#e8eef6;overflow:hidden}
.rb-bar i{display:block;height:100%;background:#1e6cdb;border-radius:99px}
.rb.done .rb-bar i{background:#1f9d57}.rb.bad .rb-bar i{background:#d9453d}.rb.part .rb-bar i{background:#d48806}
.rb-n{font-size:11.5px;color:#667085}
.rb-modal{width:min(520px,94vw)}
.rb-day{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#667085}
.rb-list{display:flex;flex-direction:column;gap:6px;overflow:auto;max-height:52vh}
.rb-chk{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border:1px solid #e3eaf2;border-radius:12px;background:#fff}
.rb-chk.ok{border-color:#bfe7d0;background:#f4fcf7}.rb-chk.bad{border-color:#f3b9b6;background:#fff6f6}
.rb-l{font-size:14px;font-weight:600;color:#14284b}
.rb-tg{display:inline-flex;gap:4px;flex:0 0 auto}
.rb-b{height:32px;min-width:58px;padding:0 12px;border-radius:9px;border:1px solid #cfd8e4;background:#fff;font:inherit;font-size:13px;font-weight:700;color:#344054;cursor:pointer;transition:all .12s}
.rb-b:hover{border-color:#9ec0f7}
.rb-b.ok.on{background:#1f9d57;border-color:#1f9d57;color:#fff}
.rb-b.iss.on{background:#d9453d;border-color:#d9453d;color:#fff}
.sop-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:14px 0}
@media (max-width:980px){.sop-steps{grid-template-columns:1fr}}
.sop-st{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid #dde5ef;border-radius:16px;padding:18px}
.sop-st.ok{border-color:#cdeadd;background:#f2fbf7}.sop-st.warn{border-color:#f1dcae;background:#fffaf1}
.sop-n{flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:#1e6cdb;color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center}
.sop-b{display:flex;flex-direction:column;gap:8px;min-width:0}
.sop-b b{font-size:16px;color:#14284b;line-height:1.3}
.sop-b p{margin:0;font-size:13.5px;color:#475467;line-height:1.45}
.fu-acts{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.gv-srcs{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}
.gv-chip{border:1px solid #d0d5dd;background:#fff;border-radius:99px;padding:6px 13px;font:inherit;font-size:12.5px;font-weight:650;cursor:pointer;transition:all .15s;color:#344054}
.gv-chip:hover{border-color:#9ec0f7;background:#eef4fd}
.gv-chip.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}
.gv-chip .n{opacity:.75;margin-left:2px}
.gv-src{display:inline-flex;font-size:11px;font-weight:700;border-radius:99px;padding:1px 8px;margin-right:4px;border:1px solid transparent}
.gv-src.family{background:#eff8ff;color:#175cd3;border-color:#b2ddff}.gv-src.voice{background:#f4f3ff;color:#5925dc;border-color:#d9d6fe}
.gv-src.patient{background:#ecfdf3;color:#067647;border-color:#abefc6}.gv-src.internal{background:#f2f4f7;color:#475467;border-color:#d0d5dd}
.btn.pri.rec{background:#d9453d;border-color:#d9453d}
`;
{
  const sEnd = t.indexOf('</style>', t.indexOf('html{zoom:.75}'));
  if (sEnd < 0) throw new Error('style end');
  t = t.slice(0, sEnd) + css + t.slice(sEnd);
}

const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
