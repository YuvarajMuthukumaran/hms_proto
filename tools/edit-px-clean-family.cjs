/* One-off: Patient Experience Lead gets
   1. Room cleanliness (Patient Room Cleanliness Checklist_v1.xlsx), room by room per floor, for PX rounds and floor coordinators.
   2. Family updates (Family Communication SOP v3): the 8 pm daily WhatsApp update (B1), the family steps after Week 1 (B2),
      and the "family stopped replying" call within 48 h (B4).
   3. Direct links: px-lead-prototype.html#clean, #family, #follow, #dcheck ... open that screen.
   Demo data only. Nothing is sent. */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);
function rep(a, b, label) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label); t = t.split(a).join(b); }
if (t.indexOf('isClean') >= 0) throw new Error('already applied');

/* ---------- state + hash links ---------- */
rep("    super(props);\n    this.state = {\n      screen: 'today',",
  "    super(props);\n    var SCR = ['today', 'concerns', 'floor', 'clean', 'family', 'dcheck', 'feedback', 'follow', 'report'];\n    var fromHash = function () { var h = String(window.location.hash || '').replace('#', ''); return SCR.indexOf(h) >= 0 ? h : ''; };\n    var self0 = this;\n    try { window.addEventListener('hashchange', function () { var h = fromHash(); if (h) self0.setState({ screen: h }); }); } catch (e) {}\n    this.state = {\n      screen: fromHash() || 'today',", 'ctor');
rep("dc: {}, dcPid: 'p6',",
  "cl: {}, clFloor: 'f2', clRoom: '206', clMsg: '', clBy: 'Patient experience', fam: {}, famPid: 'p2', famMsg: '', famDone: {}, famFilter: 'due',\n      dc: {}, dcPid: 'p6',", 'state');

/* ---------- markup ---------- */
const CHECK = '<svg width="14" height="14" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>';
const clean = `
<!-- ============ ROOM CLEANLINESS ============ -->
<sc-if value="{{isClean}}" hint-placeholder-val="{{false}}">
  <div class="hello">
    <div><h2>Room cleanliness</h2><div class="muted">Patient Room Cleanliness Checklist v1 · walk each room, mark OK or Issue. Issues go to housekeeping or maintenance.</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><div class="seg"><sc-for list="{{clByBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div><div class="seg" role="tablist"><sc-for list="{{clFloors}}" as="g" hint-placeholder-count="3"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div></div>
  </div>
  <section class="card">
    <div class="chead"><div><h3>{{clFloorName}} rooms</h3><div class="muted small">Green: all OK · Red: issue found · Grey: not checked today</div></div><span class="chip grey">{{clDoneText}}</span></div>
    <div class="cl-rooms"><sc-for list="{{clRooms}}" as="r" hint-placeholder-count="15"><button class="{{r.cls}}" type="button" sc-camel-on-click="{{r.pick}}"><b>{{r.no}}</b><span>{{r.sub}}</span></button></sc-for></div>
  </section>
  <section class="card">
    <div class="chead"><div><h3>Room {{clRoom}}</h3><div class="muted small">{{clStamp}}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><div class="field"><sc-raw-select aria-label="Room category" value="{{clCat}}" sc-camel-on-change="{{clSetCat}}"><option>Suite</option><option>Single</option><option>Twin</option><option>Triple</option></sc-raw-select></div><button class="btn sm" type="button" sc-camel-on-click="{{clAllOk}}">Mark all OK</button></div></div>
    <sc-for list="{{clSecs}}" as="g" hint-placeholder-count="6">
      <div class="fr-gh">{{g.title}} <span class="muted small" style="font-weight:500">· {{g.progress}}</span></div>
      <sc-for list="{{g.items}}" as="f" hint-placeholder-count="4">
        <div class="{{f.rowCls}}">
          <div class="fr-txt grow"><div class="name">{{f.label}}</div><div class="fr-own">{{f.area}}</div></div>
          <div class="seg fr-tog"><button class="{{f.okCls}}" type="button" sc-camel-on-click="{{f.ok}}">OK</button><button class="{{f.isCls}}" type="button" sc-camel-on-click="{{f.issue}}">Issue</button></div>
        </div>
      </sc-for>
    </sc-for>
    <div class="fr-gh">Maintenance to report</div>
    <div class="cpad"><div class="fgrid"><sc-for list="{{clMaint}}" as="m" hint-placeholder-count="5"><div class="field"><label>{{m.label}}</label><input placeholder="Leave empty if fine" value="{{m.v}}" sc-camel-on-change="{{m.set}}"></div></sc-for><div class="field"><label>Remarks</label><input placeholder="Anything else" value="{{clRemarks}}" sc-camel-on-change="{{clSetRemarks}}"></div></div></div>
    <div class="cpad" style="border-top:1px solid #eef2f6;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn pri" type="button" sc-camel-on-click="{{clSave}}">Save room {{clRoom}}</button><span class="muted small">{{clMsg}}</span></div>
  </section>
</sc-if>
`;
const family = `
<!-- ============ FAMILY UPDATES ============ -->
<sc-if value="{{isFamily}}" hint-placeholder-val="{{false}}">
  <div class="hello"><div><h2>Family updates</h2><div class="muted">Family Communication SOP v3 · every family gets a WhatsApp update by 8 pm, and every planned family step is on time.</div></div></div>
  <div class="tiles"><sc-for list="{{famTiles}}" as="t" hint-placeholder-count="4"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for></div>
  <div class="cols">
    <section class="card" style="flex:1 1 320px">
      <div class="chead"><div><h3>Tonight's 8 pm updates</h3><div class="muted small">Psychologist sends. If they can't, you send the cover update.</div></div></div>
      <div><sc-for list="{{famList}}" as="p" hint-placeholder-count="6">
        <div class="{{p.rowCls}}" style="cursor:pointer" sc-camel-on-click="{{p.pick}}"><span class="{{p.dot}}"></span><div class="grow"><div class="name">{{p.name}}</div><div class="muted small">{{p.sub}}</div><div class="small" style="{{p.flagStyle}}">{{p.flag}}</div></div><span class="{{p.chip}}">{{p.status}}</span></div>
      </sc-for></div>
    </section>
    <section class="card" style="flex:2 1 460px">
      <div class="chead"><div><h3>Update for {{famSel.name}}</h3><div class="muted small">{{famSel.who}}</div></div><span class="{{famSel.chip}}">{{famSel.status}}</span></div>
      <div class="cpad" style="display:flex;flex-direction:column;gap:12px">
        <sc-for list="{{famFields}}" as="f" hint-placeholder-count="8"><div class="fam-f"><span class="name">{{f.label}}</span><div class="seg"><sc-for list="{{f.opts}}" as="o" hint-placeholder-count="3"><button class="{{o.cls}}" type="button" sc-camel-on-click="{{o.pick}}">{{o.label}}</button></sc-for></div></div></sc-for>
        <div class="field"><label for="famt">TODAY (must be about this patient, never copied)</label><textarea id="famt" placeholder="A real moment from today, a milestone, something that happened" value="{{famSel.today}}" sc-camel-on-change="{{famSetToday}}"></textarea></div>
        <div class="field"><label for="famn">NEXT</label><input id="famn" placeholder="Next family meeting, psychoeducation, outing" value="{{famSel.next}}" sc-camel-on-change="{{famSetNext}}"></div>
        <div class="lbl" style="padding:0">WhatsApp preview</div>
        <div class="fu-msg">{{famPreview}}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn pri" type="button" sc-camel-on-click="{{famSend}}">Mark as sent to family</button><button class="btn" type="button" sc-camel-on-click="{{famCopy}}">Copy text</button><span class="muted small">{{famMsg}}</span></div>
        <div class="muted small">An incident is never sent only on WhatsApp: call the family first, then write.</div>
      </div>
    </section>
  </div>
  <section class="card" style="overflow:hidden">
    <div class="chead"><div><h3>Family steps after Week 1</h3><div class="muted small">From the SOP cadence. The Day 0, 24-hour and Day 3-4 steps are on the Patient dashboard.</div></div>
      <div class="seg" role="tablist"><sc-for list="{{famSegs}}" as="g" hint-placeholder-count="4"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div></div>
    <div class="scrollx"><sc-raw-table class="pt">
      <sc-raw-thead><sc-raw-tr><sc-raw-th>Patient</sc-raw-th><sc-raw-th>Family step</sc-raw-th><sc-raw-th>Owner</sc-raw-th><sc-raw-th>Due</sc-raw-th><sc-raw-th></sc-raw-th></sc-raw-tr></sc-raw-thead>
      <sc-raw-tbody><sc-for list="{{famSteps}}" as="s" hint-placeholder-count="6"><sc-raw-tr style="{{s.sr}}">
        <sc-raw-td><div class="name">{{s.name}}</div><div class="pmeta">Day {{s.day}} of stay</div></sc-raw-td>
        <sc-raw-td><div>{{s.step}}</div><div class="muted small">{{s.how}}</div></sc-raw-td>
        <sc-raw-td>{{s.owner}}</sc-raw-td>
        <sc-raw-td><span class="{{s.chip}}">{{s.dueTxt}}</span></sc-raw-td>
        <sc-raw-td><sc-if value="{{s.canDo}}" hint-placeholder-val="{{false}}"><button class="btn sm" type="button" sc-camel-on-click="{{s.done}}">Mark done</button></sc-if></sc-raw-td>
      </sc-raw-tr></sc-for></sc-raw-tbody>
    </sc-raw-table><sc-if value="{{famStepsEmpty}}" hint-placeholder-val="{{false}}"><div class="cpad muted">Nothing in this list.</div></sc-if></div>
  </section>
</sc-if>
`;
rep('<sc-if value="{{isReport}}"', clean + family + '\n<sc-if value="{{isReport}}"', 'insert screens');

/* ---------- logic ---------- */
const logic = String.raw`
    // ===== room cleanliness (xlsx v1) =====
    var CLS = [
      ['I. General room area', [['Surfaces', 'Dust all furniture (table, chairs, shelves)'], ['Surfaces', 'Wipe surfaces with disinfectant'], ['Surfaces', 'Remove cobwebs from corners and ceiling'], ['Floors', 'Sweep and mop the floor with disinfectant'], ['Floors', 'Remove stains or marks'], ['Walls and fixtures', 'Walls free of marks or stains'], ['Walls and fixtures', 'Light switches and sockets clean'], ['Walls and fixtures', 'AC / heating vents free of dust']]],
      ['II. Bed and bedding', [['Bed frame and mattress', 'Bed frame wiped with disinfectant'], ['Bed frame and mattress', 'Mattress free of stains, odour or damage'], ['Bedding', 'Linen, pillowcases and blankets changed'], ['Bedding', 'Bedding clean and neatly arranged']]],
      ['III. Bathroom', [['Toilet', 'Toilet bowl, seat and flush cleaned and disinfected'], ['Toilet', 'No leaks or faults'], ['Sink and taps', 'Sink, taps and around them disinfected'], ['Sink and taps', 'Drains well, no water pooling'], ['Shower', 'Shower area and glass partition scrubbed'], ['Shower', 'No mould, mildew or soap scum'], ['Floor', 'Bathroom floor mopped with disinfectant'], ['Floor', 'Window glass wiped, no stains'], ['Supplies', 'Toilet paper, hand soap and toiletries restocked']]],
      ['IV. Patient items', [['Personal belongings', 'Personal items stored neatly'], ['Shared equipment', 'Commode, walker and shared equipment disinfected']]],
      ['V. Safety and hygiene', [['Waste', 'Bins emptied, liners replaced'], ['Waste', 'Medical waste disposed as per protocol'], ['Sanitising', 'Hand sanitiser available and working'], ['Sanitising', 'No spills or contamination'], ['Odour', 'Room smells fresh']]],
      ['VI. Final checks', [['Appearance', 'Room clean, tidy and organised'], ['Access', 'Furniture in place and reachable'], ['Access', 'Pathways clear of obstacles']]]
    ];
    var CL_ITEMS = []; CLS.forEach(function (g) { g[1].forEach(function (it) { CL_ITEMS.push(it); }); });
    var range = function (a, b, skip) { var r = []; for (var i = a; i <= b; i++) if (!skip || skip.indexOf(i) < 0) r.push(String(i)); return r; };
    var ROOMS = { f1: range(101, 115), f2: range(201, 221, [217]), f3: range(301, 319) };
    var CLFL = { f1: 'Floor 1', f2: 'Floor 2', f3: 'Floor 3' };
    var clSeed = { 'f2:201': 'ok', 'f2:202': 'ok', 'f2:203': 'ok', 'f2:204': 'ok', 'f2:205': 'ok' };
    var clGet = function (fl, rm) {
      var k = fl + ':' + rm, x = s.cl[k];
      if (x) return x;
      if (clSeed[k]) { var mk = {}; CL_ITEMS.forEach(function (it, i) { mk[i] = 'ok'; }); return { marks: mk, maint: {}, remarks: '', cat: 'Single', saved: '11 Nov, 10:' + (10 + Object.keys(clSeed).indexOf(k) * 6) + ' am', by: 'Floor coordinator' }; }
      if (k === 'f2:206') { var m2 = {}; CL_ITEMS.forEach(function (it, i) { if (i < 12) m2[i] = 'ok'; }); m2[13] = 'issue'; return { marks: m2, maint: { Plumbing: 'Flush leaking' }, remarks: '', cat: 'Twin', saved: '', by: '' }; }
      return { marks: {}, maint: {}, remarks: '', cat: 'Single', saved: '', by: '' };
    };
    var clKey = s.clFloor + ':' + s.clRoom, clCur = clGet(s.clFloor, s.clRoom);
    var clPut = function (patch) { var a = Object.assign({}, self.state.cl); a[clKey] = Object.assign({}, clCur, patch); self.setState({ cl: a, clMsg: '' }); };
    var roomState = function (fl, rm) { var x = clGet(fl, rm); if (!x.saved) return Object.keys(x.marks).length ? 'part' : 'none'; var bad = Object.keys(x.marks).some(function (i) { return x.marks[i] === 'issue'; }) || Object.keys(x.maint).some(function (k) { return String(x.maint[k] || '').trim(); }); return bad ? 'issue' : 'ok'; };
    var clMarked = Object.keys(clCur.marks).length, clIssues = Object.keys(clCur.marks).filter(function (i) { return clCur.marks[i] === 'issue'; });
    var MAINT = ['Electrical', 'Plumbing', 'Civil', 'TV set top box and remote', 'Any other'];
    var NC = {
      isClean: s.screen === 'clean',
      clByBtns: ['Patient experience', 'Floor coordinator'].map(function (v) { return { label: v, cls: s.clBy === v ? 'on' : '', pick: function () { self.setState({ clBy: v }); } }; }),
      clFloors: ['f1', 'f2', 'f3'].map(function (f) { return { label: CLFL[f], n: ROOMS[f].filter(function (r) { var st = roomState(f, r); return st === 'ok' || st === 'issue'; }).length + '/' + ROOMS[f].length, cls: s.clFloor === f ? 'on' : '', go: function () { self.setState({ clFloor: f, clRoom: ROOMS[f][0], clMsg: '' }); } }; }),
      clFloorName: CLFL[s.clFloor],
      clDoneText: ROOMS[s.clFloor].filter(function (r) { var st = roomState(s.clFloor, r); return st === 'ok' || st === 'issue'; }).length + ' of ' + ROOMS[s.clFloor].length + ' checked today',
      clRooms: ROOMS[s.clFloor].map(function (r) { var st = roomState(s.clFloor, r); return { no: r, sub: { ok: 'All OK', issue: 'Issue', part: 'In progress', none: 'Not checked' }[st], cls: 'cl-room cl-' + st + (r === s.clRoom ? ' sel' : ''), pick: function () { self.setState({ clRoom: r, clMsg: '' }); } }; }),
      clRoom: s.clRoom, clCat: clCur.cat, clSetCat: function (e) { clPut({ cat: e.target.value }); },
      clStamp: clCur.saved ? 'Saved ' + clCur.saved + ' by ' + clCur.by : clMarked + ' of ' + CL_ITEMS.length + ' marked · ' + clIssues.length + ' issue' + (clIssues.length === 1 ? '' : 's'),
      clAllOk: function () { var mk = {}; CL_ITEMS.forEach(function (it, i) { mk[i] = clCur.marks[i] === 'issue' ? 'issue' : 'ok'; }); clPut({ marks: mk }); },
      clSecs: (function () { var n = 0; return CLS.map(function (g) { var items = g[1].map(function (it) { var i = n++; var v = clCur.marks[i]; var set = function (val) { return function () { var mk = Object.assign({}, clCur.marks); mk[i] = val; clPut({ marks: mk, saved: '' }); }; }; return { label: it[1], area: it[0], rowCls: 'fr-row' + (v ? ' ' + v : ''), okCls: v === 'ok' ? 'ok-on' : '', isCls: v === 'issue' ? 'is-on' : '', ok: set('ok'), issue: set('issue') }; }); var dn = items.filter(function (x) { return x.rowCls !== 'fr-row'; }).length; return { title: g[0], progress: dn + ' of ' + items.length, items: items }; }); })(),
      clMaint: MAINT.map(function (m) { return { label: m, v: clCur.maint[m] || '', set: function (e) { var mt = Object.assign({}, clCur.maint); mt[m] = e.target.value; clPut({ maint: mt, saved: '' }); } }; }),
      clRemarks: clCur.remarks, clSetRemarks: function (e) { clPut({ remarks: e.target.value }); },
      clMsg: s.clMsg,
      clSave: function () {
        var left = CL_ITEMS.length - clMarked;
        if (left) { self.setState({ clMsg: left + ' item' + (left === 1 ? '' : 's') + ' not marked yet. Use Mark all OK if the rest is fine.' }); return; }
        var extra = self.state.extraConcerns.slice(), sent = 0, room = CLFL[s.clFloor] + ', Room ' + s.clRoom;
        var bad = clIssues.map(function (i) { return CL_ITEMS[+i][1]; });
        if (bad.length) { sent++; extra.push({ id: 'C-0' + (190 + extra.length), type: 'concern', pid: '', pname: room, title: 'Room ' + s.clRoom + ': ' + bad[0] + (bad.length > 1 ? ' (+' + (bad.length - 1) + ' more)' : ''), raisedBy: 'Room check, ' + s.clBy, via: 'Room cleanliness', owner: 'Housekeeping supervisor', ownerRole: 'Housekeeping', category: 'Room and housekeeping', sla: '4 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: 'Not OK: ' + bad.join('; ') + (clCur.remarks ? '. Remarks: ' + clCur.remarks : '') }); }
        MAINT.forEach(function (m) { var v = String(clCur.maint[m] || '').trim(); if (v) { sent++; extra.push({ id: 'C-0' + (190 + extra.length), type: 'concern', pid: '', pname: room, title: 'Room ' + s.clRoom + ' ' + m.toLowerCase() + ': ' + v, raisedBy: 'Room check, ' + s.clBy, via: 'Room cleanliness', owner: 'Maintenance', ownerRole: m, category: 'Room and housekeeping', sla: '6 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: v }); } });
        var a = Object.assign({}, self.state.cl); a[clKey] = Object.assign({}, clCur, { saved: '11 Nov, ' + nowTime(), by: s.clBy });
        var nxt = ROOMS[s.clFloor].filter(function (r) { var st = r === s.clRoom ? 'done' : roomState(s.clFloor, r); return st === 'none' || st === 'part'; })[0];
        self.setState({ cl: a, extraConcerns: extra, clRoom: nxt || s.clRoom, clMsg: 'Room ' + s.clRoom + ' saved' + (sent ? ', ' + sent + ' issue' + (sent === 1 ? '' : 's') + ' sent to housekeeping or maintenance as grievances.' : ', all OK.') + (nxt ? ' Next: Room ' + nxt + '.' : '') });
      }
    };

    // ===== family updates (Family Communication SOP v3) =====
    var admIso = function (p) { return fromDM(p.admitted); };
    var FSEED = { p6: { sent: '4:55 pm', by: 'Barkha', overall: 'Improving', sleep: 'Adequate', appetite: 'Good', mood: 'Calm', med: 'Taken on time', sessions: 'Attended', selfcare: 'Independent', peer: 'Engaging', today: 'Rahul packed his own bag for Friday and thanked the night nurse.', next: 'Discharge on 13 Nov, family meeting at 11 am' } };
    var LASTREPLY = { p1: '2026-11-11', p2: '2026-11-10', p3: '2026-11-11', p4: '2026-11-11', p5: '2026-11-08', p6: '2026-11-11' };
    var FF = [['overall', 'Overall', ['Stable', 'Improving', 'Needs attention']], ['sleep', 'Sleep', ['Adequate', 'Disturbed']], ['appetite', 'Appetite', ['Good', 'Reduced']], ['mood', 'Mood', ['Calm', 'Anxious', 'Irritable', 'Stable']], ['med', 'Medication', ['Taken on time', 'Assisted']], ['sessions', 'Sessions today', ['Attended', 'With encouragement', 'Did not attend']], ['selfcare', 'Self-care', ['Independent', 'Assisted']], ['peer', 'Peer interaction', ['Engaging', 'Preferred solitude']]];
    var famGet = function (pid) { return Object.assign({ today: '', next: '' }, FSEED[pid] || {}, s.fam[pid] || {}); };
    var late = new Date().getHours() >= 20;
    var famRow = function (p) { var f = famGet(p.id), quiet = -dayDiff(LASTREPLY[p.id] || toIso(TODAY)); return { f: f, quiet: quiet, sent: !!f.sent }; };
    var fp = pById[s.famPid] || P[0], fcur = famGet(fp.id);
    var famPut = function (patch) { var a = Object.assign({}, self.state.fam); a[fp.id] = Object.assign({}, fcur, patch); self.setState({ fam: a, famMsg: '' }); };
    var famPreview = ['Good evening -- update on ' + fp.name + ', 11 Nov 2026', '', 'OVERALL: ' + (fcur.overall || '...'), 'Sleep: ' + (fcur.sleep || '...'), 'Appetite: ' + (fcur.appetite || '...'), 'Mood: ' + (fcur.mood || '...'), 'Medication: ' + (fcur.med || '...'), 'Sessions today: ' + (fcur.sessions || '...'), 'Self-care: ' + (fcur.selfcare || '...'), 'Peer interaction: ' + (fcur.peer || '...'), '', 'TODAY: ' + (fcur.today || '...'), 'NEXT: ' + (fcur.next || '...'), '', 'Questions? Call +91-8800000255'].join('\n');
    // cadence after Week 1 (SOP B2 / section C). [key, step, how, owner, day]
    var CAD = [['intake', 'Psychologist intake call with family', 'Therapy plan, coping assessment · phone', 'psych', 7], ['wk1', 'End of Week 1 family meeting', 'Psychiatrist meets family, fortnightly rhythm starts · in person or video', 'doc', 7],
      ['dyn', 'Family dynamics session', 'Communication patterns, expressed emotion · in person', 'psych', 14], ['meet1', 'First patient-family meeting (10-15 min)', 'Supervised, then debrief the family', 'psych', 14],
      ['rev2', 'Fortnightly family review', 'Progress and timeline · in person', 'doc', 14], ['mid', 'Mid-treatment family review', 'Progress, revised timeline', 'doc', 25], ['rev4', 'Fortnightly family review', 'Progress and timeline · in person', 'doc', 28],
      ['pe1', 'Psychoeducation 1 of 3', 'Illness course, what the family should know', 'psych', 28], ['pe2', 'Psychoeducation 2 of 3', 'Medicines, side effects, compliance at home', 'psych', 35], ['pe3', 'Psychoeducation 3 of 3', 'Warning signs, relapse, what to do', 'psych', 42]];
    var OVERDUE = { 'p5:intake': 1, 'p5:wk1': 1 };
    var famStepsAll = [];
    P.forEach(function (p) {
      var adm = admIso(p), list = CAD.map(function (c) { return [c[0], c[1], c[2], c[3] === 'doc' ? p.doctor : p.psych, c[4]]; });
      if (p.discharging) { var di = fromDM(p.discharge); list.push(['dplan', 'Discharge planning family meeting', 'Psychiatrist and psychologist, 1 week before discharge', p.doctor + ' and ' + p.psych, Math.round((isoD(di) - isoD(adm)) / 86400000) - 7]); list.push(['ddeb', '15-minute family debrief, discharge day', 'Coordinator hands over the written plan', 'You', Math.round((isoD(di) - isoD(adm)) / 86400000)]); }
      list.forEach(function (c) {
        var due = addDays(adm, c[4]), diff = dayDiff(due), key = p.id + ':' + c[0];
        if (diff > 7) return;
        var done = s.famDone[key] || (diff < 0 && !OVERDUE[key]);
        famStepsAll.push({ key: key, name: p.name, day: p.day, step: c[1], how: c[2], owner: c[3], due: due, diff: diff, done: !!done,
          dueTxt: done ? 'Done' : diff < 0 ? 'Overdue · was ' + dm(due) : diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : dm(due),
          chip: 'chip ' + (done ? 'green' : diff < 0 ? 'red' : diff <= 1 ? 'amber' : 'grey'), sr: '--sr:' + (done ? 'transparent' : diff < 0 ? '#b42318' : diff <= 1 ? '#d48806' : 'transparent'),
          canDo: !done && diff <= 1, mark: function () { var m = Object.assign({}, self.state.famDone); m[key] = 1; self.setState({ famDone: m }); } });
      });
    });
    famStepsAll.sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    var FSG = [['due', 'Needs you', function (x) { return !x.done && x.diff <= 1; }], ['week', 'Next 7 days', function (x) { return !x.done && x.diff > 1; }], ['done', 'Done', function (x) { return x.done; }], ['all', 'All', function () { return true; }]];
    var fsg = FSG.filter(function (g) { return g[0] === s.famFilter; })[0] || FSG[0];
    var famRows = P.map(function (p) { var r = famRow(p); return { p: p, r: r }; });
    var NF = {
      isFamily: s.screen === 'family',
      famTiles: [
        { label: '8 pm updates sent', value: famRows.filter(function (x) { return x.r.sent; }).length + ' of ' + P.length, sub: late ? 'It is past 8 pm' : 'Due by 8 pm tonight' },
        { label: 'Family not replying', value: String(famRows.filter(function (x) { return x.r.quiet >= 2; }).length), sub: 'Call within 48 hours (SOP B4)' },
        { label: 'Family steps overdue', value: String(famStepsAll.filter(function (x) { return !x.done && x.diff < 0; }).length), sub: 'After Week 1' },
        { label: 'Due today or tomorrow', value: String(famStepsAll.filter(function (x) { return !x.done && x.diff >= 0 && x.diff <= 1; }).length), sub: 'Meetings, reviews, sessions' }
      ],
      famList: famRows.map(function (x) {
        var p = x.p, r = x.r;
        return { name: p.name, sub: p.room + ' · psychologist ' + p.psych, status: r.sent ? 'Sent ' + r.f.sent : late ? 'Late' : 'Not sent', chip: 'chip ' + (r.sent ? 'green' : late ? 'red' : 'amber'),
          dot: 'dot ' + (r.sent ? 'd-green' : 'd-amber'), rowCls: 'checkrow' + (p.id === fp.id ? ' fam-on' : ''),
          flag: r.quiet >= 2 ? 'Family has not replied for ' + r.quiet + ' days. Call them within 48 hours.' : '', flagStyle: 'color:#b42318;margin-top:2px',
          pick: function () { self.setState({ famPid: p.id, famMsg: '' }); } };
      }),
      famSel: { name: fp.name, who: 'Goes to ' + fp.guardian + ' · owner ' + fp.psych + ' (psychologist)', status: fcur.sent ? 'Sent ' + fcur.sent + ' by ' + fcur.by : 'Not sent', chip: 'chip ' + (fcur.sent ? 'green' : 'amber'), today: fcur.today, next: fcur.next },
      famFields: FF.map(function (f) { return { label: f[1], opts: f[2].map(function (o) { return { label: o, cls: fcur[f[0]] === o ? 'on' : '', pick: function () { var p2 = {}; p2[f[0]] = o; famPut(p2); } }; }) }; }),
      famSetToday: function (e) { famPut({ today: e.target.value }); }, famSetNext: function (e) { famPut({ next: e.target.value }); },
      famPreview: famPreview, famMsg: s.famMsg,
      famSend: function () {
        var miss = FF.filter(function (f) { return !fcur[f[0]]; }).map(function (f) { return f[1]; });
        var td = String(fcur.today || '').trim();
        if (miss.length) { self.setState({ famMsg: 'Pick: ' + miss.join(', ') + '.' }); return; }
        if (td.length < 15) { self.setState({ famMsg: 'Write TODAY: one real line about ' + fp.name + '.' }); return; }
        var dup = P.filter(function (q) { return q.id !== fp.id && String(famGet(q.id).today || '').trim().toLowerCase() === td.toLowerCase(); })[0];
        if (dup) { self.setState({ famMsg: 'TODAY is the same as ' + dup.name + "'s. Write one for " + fp.name + '.' }); return; }
        famPut({ sent: nowTime(), by: 'Prabh (cover)' });
      },
      famCopy: function () { try { navigator.clipboard.writeText(famPreview); self.setState({ famMsg: 'Copied. Paste it in the family WhatsApp group.' }); } catch (e) { self.setState({ famMsg: 'Copy did not work here.' }); } },
      famSegs: FSG.map(function (g) { return { label: g[1], n: famStepsAll.filter(g[2]).length, cls: s.famFilter === g[0] ? 'on' : '', go: function () { self.setState({ famFilter: g[0] }); } }; }),
      famSteps: famStepsAll.filter(fsg[2]).map(function (x) { return Object.assign({}, x, { done: x.mark }); }),
      famStepsEmpty: famStepsAll.filter(fsg[2]).length === 0
    };
    var nClean = ['f1', 'f2', 'f3'].reduce(function (a, f) { return a + ROOMS[f].filter(function (r) { return roomState(f, r) === 'issue'; }).length; }, 0);
    var nFam = famRows.filter(function (x) { return !x.r.sent; }).length;
`;
rep("    var NX = {", logic + "\n    var NX = {", 'logic');
rep("['floor', 'Floor round', 0], ['dcheck', 'Discharge checklist',", "['floor', 'Floor round', 0], ['clean', 'Room cleanliness', nClean], ['family', 'Family updates', nFam], ['dcheck', 'Discharge checklist',", 'nav');
rep("var titles2 = { dcheck: 'Discharge checklist', follow: 'Follow-ups' };", "Object.assign(NX, NC, NF);\n    var titles2 = { dcheck: 'Discharge checklist', follow: 'Follow-ups', clean: 'Room cleanliness', family: 'Family updates' };", 'titles');
rep("var go = function (scr) { return function () { self.setState({ screen: scr }); }; };", "var go = function (scr) { return function () { try { history.replaceState(null, '', '#' + scr); } catch (e) {} self.setState({ screen: scr }); }; };", 'go hash');

const css = `
/* room cleanliness + family updates */
.cl-rooms{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px;padding:16px 20px}
.cl-room{border:1px solid #e3eaf2;border-radius:12px;background:#f8fafc;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;font:inherit}
.cl-room b{font-size:16px}.cl-room span{font-size:11.5px;color:#5b6475}
.cl-room.cl-ok{background:#f1fbf4;border-color:#bfe8cd}.cl-room.cl-issue{background:#fff6f6;border-color:#f3c1bd}.cl-room.cl-part{background:#fffaf1;border-color:#f5d9a8}
.cl-room.sel{outline:2px solid #1e6cdb;outline-offset:1px}
.fam-f{display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap}.fam-f>.name{flex:0 0 130px;font-size:13.5px}
.fam-on{background:#f0f6ff}
`;
const sEnd = t.indexOf('</style>');
t = t.slice(0, sEnd) + css + t.slice(sEnd);
if (/\{\{/.test(logic)) throw new Error('{{ in logic');
const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
