/* One-off: Patient Experience Lead gets two new screens from the TL's 11 Nov files.
   1. Discharge checklist (Form TM-DC-01 v11, tulasi_staff_checklist_v11_1.pdf), filled on screen.
   2. Follow-ups: the daily "Follow-up tomorrow" list Kanika types into the call-centre group,
      Day-14 and Day-30 calls (Discharge SOP), fixed outcomes, 48-hour no-update flag, missed list,
      clinicians who leave follow-up dates blank (SOP: 5 times goes to Chandraji).
   Also fixes the owners: Kanika is the Patient Experience Coordinator, Khalid runs the call centre.
   Demo data only. */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);
function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}
if (t.indexOf('isFollow') >= 0) throw new Error('already applied');

/* ---------- Kanika / Khalid ---------- */
rep("'Medicines at discharge': ['Pharmacy (Khalid)', 'Pharmacy'],", "'Medicines at discharge': ['Pharmacy desk', 'Pharmacy'],", 'route pharmacy');
rep("['PH', 'Pharmacy', 'Khalid', 'discharge medicines'],", "['PH', 'Pharmacy', 'Pharmacy desk', 'discharge medicines'],\n      ['PX', 'Patient experience coordinator', 'Kanika (Prabh covers)', 'discharge meeting, feedback, follow-up list'],", 'owner pharmacy');
rep("['CC', 'Call centre', 'Kanika', 'after-discharge calls, rebooking'],", "['CC', 'Call centre', 'Khalid', 'follow-up calls (Day 14, Day 30), rebooking'],", 'owner cc');
rep("['Medicines ready from Tulasi pharmacy', 'Pharmacy (Khalid)', 'Pending', 'due'],", "['Medicines ready from Tulasi pharmacy', 'Pharmacy', 'Pending', 'due'],", 'dl pharmacy');
rep("['Handed to call centre for 48-hour check', 'You, then Kanika', 'After discharge', 'up']", "['Handed to call centre for follow-up calls', 'You, then the call centre (Khalid)', 'After discharge', 'up']", 'dl cc');

/* ---------- state ---------- */
rep("nps: 4, ratings:", "dc: {}, dcPid: 'p6', dcMsg: '', dcTry: false, missed: {}, fuOut: {}, fuRem: {}, fuExtra: [], fuFilter: 'action', fuPosted: '', fuMsg: '',\n      nps: 4, ratings:", 'state');

/* ---------- markup ---------- */
const CHECK = '<svg width="14" height="14" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>';
const sectionLoop = (list) => `
  <sc-for list="{{${list}}}" as="g" hint-placeholder-count="2">
    <section class="card">
      <div class="chead"><div><h3>{{g.title}}</h3><div class="muted small">{{g.owner}}</div></div><span class="{{g.chip}}">{{g.progress}}</span></div>
      <sc-if value="{{g.isRisk}}" hint-placeholder-val="{{false}}"><div class="dc-risk"><span class="name">Risk level</span><div class="seg"><sc-for list="{{g.riskBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div><span class="muted small">{{g.riskHint}}</span></div></sc-if>
      <div>
        <sc-for list="{{g.items}}" as="c" hint-placeholder-count="5">
          <div class="{{c.rowCls}}">
            <button class="{{c.cls}}" type="button" sc-camel-on-click="{{c.toggle}}" aria-label="Mark {{c.label}}">${CHECK}</button>
            <div class="grow"><div class="name">{{c.label}}</div><div class="muted small">{{c.sub}}</div></div>
            <sc-if value="{{c.hasTag}}" hint-placeholder-val="{{false}}"><span class="{{c.tagCls}}">{{c.tag}}</span></sc-if>
          </div>
        </sc-for>
      </div>
    </section>
  </sc-for>`;

const dcheck = `
<!-- ============ DISCHARGE CHECKLIST ============ -->
<sc-if value="{{isDcheck}}" hint-placeholder-val="{{false}}">
  <section class="card">
    <div class="chead">
      <div><h3>Discharge checklist</h3><div class="muted small">Form TM-DC-01 v11 · the human handoff only. The software discharge summary already has the medicines, doctor names and emergency numbers.</div></div>
      <div class="field" style="min-width:260px"><sc-raw-select aria-label="Patient being discharged" value="{{dcPid}}" sc-camel-on-change="{{setDcPid}}"><sc-for list="{{dcPatients}}" as="o" hint-placeholder-count="2"><option value="{{o.id}}">{{o.label}}</option></sc-for></sc-raw-select></div>
    </div>
    <div class="dc-head">
      <sc-for list="{{dcFacts}}" as="f" hint-placeholder-count="6"><div><div class="lbl" style="padding:0">{{f.k}}</div><div class="name">{{f.v}}</div></div></sc-for>
    </div>
  </section>
  <div class="tiles">
    <sc-for list="{{dcTiles}}" as="t" hint-placeholder-count="4"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for>
  </div>
  <div class="dc-grid">${sectionLoop('dcSecA')}
  </div>

  <section class="card">
    <div class="chead"><div><h3>5. Follow-up plan</h3><div class="muted small">Doctor and psychologist fill their dates. These dates make the call centre's follow-up list by themselves.</div></div><span class="{{dcf.chip}}">{{dcf.progress}}</span></div>
    <div class="cpad" style="display:flex;flex-direction:column;gap:16px">
      <div class="fgrid">
        <div class="field"><label>Treating psychiatrist</label><input value="{{dcf.doctor}}" readonly="readonly"></div>
        <div class="fgrid"><div class="field"><label for="dcdd">Date</label><input id="dcdd" type="date" value="{{dcf.docDate}}" sc-camel-on-change="{{dcf.setDocDate}}"></div><div class="field"><label for="dcdt">Time</label><input id="dcdt" type="time" value="{{dcf.docTime}}" sc-camel-on-change="{{dcf.setDocTime}}"></div></div>
        <div class="field"><label>Treating psychologist</label><input value="{{dcf.psych}}" readonly="readonly"></div>
        <div class="fgrid"><div class="field"><label for="dcpd">Date</label><input id="dcpd" type="date" value="{{dcf.psyDate}}" sc-camel-on-change="{{dcf.setPsyDate}}"></div><div class="field"><label for="dcpt">Time</label><input id="dcpt" type="time" value="{{dcf.psyTime}}" sc-camel-on-change="{{dcf.setPsyTime}}"></div></div>
      </div>
      <sc-for list="{{dcf.gaps}}" as="m" hint-placeholder-count="1">
        <div class="note dc-gap"><span><b>{{m.who}}</b> has not filled the follow-up date. Ask before the family leaves (SOP step 3).</span><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="{{m.remCls}}" type="button" sc-camel-on-click="{{m.remind}}">{{m.remLabel}}</button><button class="{{m.cntCls}}" type="button" sc-camel-on-click="{{m.count}}">{{m.cntLabel}}</button></span></div>
      </sc-for>
      <div class="fgrid">
        <div class="field"><label for="dcas">Follow-up calls assigned to</label><sc-raw-select id="dcas" value="{{dcf.assigned}}" sc-camel-on-change="{{dcf.setAssigned}}"><option>Khalid (call centre)</option><option>Kanika (patient experience)</option><option>Prabh (patient experience)</option></sc-raw-select></div>
        <div class="field"><label>Family agrees to the Day-14 and Day-30 calls</label><div class="seg"><sc-for list="{{dcf.consentBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>
        <div class="field"><label for="dccn">Family contact for the calls</label><input id="dccn" placeholder="Name" value="{{dcf.cName}}" sc-camel-on-change="{{dcf.setCName}}"></div>
        <div class="fgrid"><div class="field"><label for="dccr">Relation</label><input id="dccr" placeholder="e.g. Father" value="{{dcf.cRel}}" sc-camel-on-change="{{dcf.setCRel}}"></div><div class="field"><label for="dccp">Mobile</label><input id="dccp" placeholder="Mobile number" value="{{dcf.cPhone}}" sc-camel-on-change="{{dcf.setCPhone}}"></div></div>
      </div>
    </div>
    <div>
      <sc-for list="{{dcf.items}}" as="c" hint-placeholder-count="4">
        <div class="{{c.rowCls}}">
          <button class="{{c.cls}}" type="button" sc-camel-on-click="{{c.toggle}}" aria-label="Mark {{c.label}}">${CHECK}</button>
          <div class="grow"><div class="name">{{c.label}}</div><div class="muted small">{{c.sub}}</div></div>
          <sc-if value="{{c.hasTag}}" hint-placeholder-val="{{false}}"><span class="{{c.tagCls}}">{{c.tag}}</span></sc-if>
        </div>
      </sc-for>
    </div>
  </section>

  <div class="dc-grid">${sectionLoop('dcSecB')}
  </div>

  <section class="card">
    <div class="chead"><div><h3>Sign-off</h3><div class="muted small">The patient does not leave until every must-do item is done and all three have signed.</div></div><span class="{{dcSignChip}}">{{dcSignText}}</span></div>
    <div class="dc-sigs">
      <sc-for list="{{dcSigns}}" as="g" hint-placeholder-count="3">
        <div class="dc-sig">
          <div class="lbl" style="padding:0">{{g.role}}</div>
          <div class="muted small">{{g.says}}</div>
          <div class="field"><input aria-label="{{g.role}} name" placeholder="Name" value="{{g.name}}" sc-camel-on-change="{{g.setName}}"></div>
          <button class="{{g.btnCls}}" type="button" sc-camel-on-click="{{g.sign}}">{{g.btnLabel}}</button>
        </div>
      </sc-for>
    </div>
    <div class="cpad" style="border-top:1px solid #eef2f6;display:flex;flex-direction:column;gap:10px">
      <sc-if value="{{dcDone}}" hint-placeholder-val="{{false}}"><div class="info">{{dcDoneText}}</div><div><button class="btn" type="button" sc-camel-on-click="{{goFollow}}">Open follow-ups</button></div></sc-if>
      <sc-if value="{{dcOpen}}" hint-placeholder-val="{{true}}">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn pri" type="button" sc-camel-on-click="{{dcComplete}}">Complete discharge</button><span class="muted small">{{dcHint}}</span></div>
        <sc-if value="{{dcShowBlocks}}" hint-placeholder-val="{{false}}"><div class="note"><b>Still to do before the family leaves:</b><sc-for list="{{dcBlocks}}" as="b" hint-placeholder-count="3"><div>· {{b.t}}</div></sc-for></div></sc-if>
      </sc-if>
    </div>
  </section>
</sc-if>
`;

const follow = `
<!-- ============ FOLLOW-UPS ============ -->
<sc-if value="{{isFollow}}" hint-placeholder-val="{{false}}">
  <div class="hello">
    <div><h2>Follow-ups after discharge</h2><div class="muted">Built from the discharge checklists. Replaces the "Follow-up tomorrow" messages typed into the call-centre group.</div></div>
  </div>
  <div class="tiles">
    <sc-for list="{{fuTiles}}" as="t" hint-placeholder-count="5"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for>
  </div>
  <div class="cols">
    <section class="card" style="flex:2 1 360px">
      <div class="chead"><div><h3>Tomorrow's list for the call centre</h3><div class="muted small">{{fuMsgSub}}</div></div><span class="{{fuPostChip}}">{{fuPostText}}</span></div>
      <div class="cpad" style="display:flex;flex-direction:column;gap:12px">
        <sc-if value="{{fuHasTomorrow}}" hint-placeholder-val="{{true}}"><div class="fu-msg">{{fuTomorrowText}}</div></sc-if>
        <sc-if value="{{fuNoTomorrow}}" hint-placeholder-val="{{false}}"><div class="muted">Nothing is due tomorrow.</div></sc-if>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn pri" type="button" sc-camel-on-click="{{fuPost}}">Send to call centre</button><button class="btn" type="button" sc-camel-on-click="{{fuCopy}}">Copy text</button><span class="muted small">{{fuMsg}}</span></div>
        <div class="muted small">Planned: this goes out by itself at 9 am every day. In this demo nothing is sent on WhatsApp.</div>
      </div>
    </section>
    <section class="card" style="flex:1 1 300px">
      <div class="chead"><div><h3>Follow-up dates left blank</h3><div class="muted small">On the discharge checklist. 5 times goes to Chandraji.</div></div></div>
      <div>
        <sc-for list="{{fuBlanks}}" as="b" hint-placeholder-count="3">
          <div class="listrow" style="padding:12px 20px"><div class="grow" style="flex-basis:140px"><div class="name">{{b.name}}</div><div class="muted small">{{b.role}}</div></div><span class="{{b.chip}}">{{b.n}} of 5</span><sc-if value="{{b.over}}" hint-placeholder-val="{{false}}"><button class="btn sm" type="button" sc-camel-on-click="{{b.raise}}">Raise to Chandraji</button></sc-if></div>
        </sc-for>
      </div>
    </section>
  </div>
  <section class="card" style="overflow:hidden">
    <div class="chead"><div><h3>Follow-up board</h3><div class="muted small">The call centre picks an outcome from a fixed list. No update for 2 days is flagged.</div></div>
      <div class="seg" role="tablist"><sc-for list="{{fuSegs}}" as="g" hint-placeholder-count="5"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div>
    </div>
    <div class="scrollx">
      <sc-raw-table class="pt">
        <sc-raw-thead><sc-raw-tr><sc-raw-th>Patient</sc-raw-th><sc-raw-th>Follow-up</sc-raw-th><sc-raw-th>Due</sc-raw-th><sc-raw-th>Call centre outcome</sc-raw-th><sc-raw-th></sc-raw-th></sc-raw-tr></sc-raw-thead>
        <sc-raw-tbody>
          <sc-for list="{{fuRows}}" as="f" hint-placeholder-count="6">
            <sc-raw-tr style="{{f.sr}}">
              <sc-raw-td><div class="name">{{f.name}}</div><div class="pmeta">Discharged {{f.dischTxt}} · {{f.family}} · {{f.phone}}</div></sc-raw-td>
              <sc-raw-td><div>{{f.kind}}</div><div class="muted small">{{f.with}}</div></sc-raw-td>
              <sc-raw-td><span class="{{f.dueCls}}">{{f.dueTxt}}</span></sc-raw-td>
              <sc-raw-td><div class="field"><sc-raw-select aria-label="Outcome for {{f.name}}" value="{{f.outcome}}" sc-camel-on-change="{{f.setOutcome}}"><option value="">No update yet</option><option>OPD booked</option><option>Online OPD booked</option><option>Came for appointment</option><option>Call done, doing well</option><option>Did not pick up</option><option>Will call back</option><option>Number switched off</option><option>Coming later</option><option>Readmitted</option><option>Found another hospital</option><option>Found another doctor</option></sc-raw-select></div><div class="small" style="{{f.flagStyle}}">{{f.flag}}</div></sc-raw-td>
              <sc-raw-td><sc-if value="{{f.canRemind}}" hint-placeholder-val="{{false}}"><button class="{{f.remCls}}" type="button" sc-camel-on-click="{{f.remind}}">{{f.remLabel}}</button></sc-if></sc-raw-td>
            </sc-raw-tr>
          </sc-for>
        </sc-raw-tbody>
      </sc-raw-table>
      <sc-if value="{{fuEmpty}}" hint-placeholder-val="{{false}}"><div class="cpad muted">Nothing in this list.</div></sc-if>
    </div>
  </section>
</sc-if>
`;
rep('<sc-if value="{{isReport}}"', dcheck + follow + '\n<sc-if value="{{isReport}}"', 'insert screens');

/* Discharge handoff tab: a way into the checklist */
rep('<div class="chead"><h3>Discharge handoff</h3><span class="muted small">Each team ticks its own step. You see the whole list.</span></div>',
    '<div class="chead"><div><h3>Discharge handoff</h3><span class="muted small">Each team ticks its own step. You see the whole list.</span></div><button class="btn sm pri" type="button" sc-camel-on-click="{{openDcheck}}">Open discharge checklist</button></div>', 'handoff btn');

/* Discharge feedback: the old "After discharge" table now lives on Follow-ups */
const a0 = t.indexOf('<section class="card" style="flex:3 1 560px;overflow:hidden"><div class="chead"><h3>After discharge</h3>');
const a1 = t.indexOf('</section>', a0) + '</section>'.length;
if (a0 < 0 || a1 < a0) throw new Error('after discharge card');
t = t.slice(0, a0) + '<section class="card" style="flex:3 1 560px"><div class="chead"><h3>After discharge</h3><span class="muted small">Follow-up calls now have their own page.</span></div><div class="cpad" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span>{{fuSummary}}</span><button class="btn" type="button" sc-camel-on-click="{{goFollow}}">Open follow-ups</button></div></section>' + t.slice(a1);

/* ---------- logic ---------- */
const logic = String.raw`
    // ===== discharge checklist + follow-ups (TL files, 11 Nov) =====
    var TODAY = new Date(2026, 10, 11);
    var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var isoD = function (iso) { if (!iso) return null; var a = iso.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); };
    var toIso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
    var dm = function (iso) { var d = isoD(iso); return d ? d.getDate() + ' ' + MON[d.getMonth()] : ''; };
    var kdate = function (iso) { var d = isoD(iso); return d ? ('0' + d.getDate()).slice(-2) + '-' + MON[d.getMonth()] + '-' + String(d.getFullYear()).slice(-2) : ''; };
    var dayDiff = function (iso) { var d = isoD(iso); return d ? Math.round((d - TODAY) / 86400000) : 0; };
    var addDays = function (iso, n) { var d = isoD(iso); d.setDate(d.getDate() + n); return toIso(d); };
    var fromDM = function (txt) { var m = String(txt || '').match(/(\d+)\s+([A-Za-z]{3})/); return m ? toIso(new Date(2026, MON.indexOf(m[2]), +m[1])) : toIso(TODAY); };
    var nowTime = function () { return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); };

    // --- checklist items (Form TM-DC-01 v11). kind: must | opt | high
    var SEC = [
      { id: 's1', title: '1. Clinical stability', owner: 'Psychiatrist and psychologist', risk: true, items: [
        ['c1', 'Patient seen by the psychiatrist before discharge', 'must', 'Psychiatrist'],
        ['c2', 'Patient seen by the clinical psychologist before discharge', 'must', 'Psychologist'],
        ['c3', 'No severe aggression or violent behaviour', 'must', 'Psychiatrist'],
        ['c4', 'Risk level written in the discharge notes', 'must', 'Psychiatrist'],
        ['c5', 'Family confirmed all medicines will be kept locked', 'high', 'Psychiatrist'],
        ['c6', 'Patient is clinically stable for discharge', 'must', 'Psychiatrist']] },
      { id: 's2', title: '2. Medicines', owner: 'Psychiatrist and duty nurse', items: [
        ['m1', 'Discharge prescription prepared and signed by the psychiatrist', 'must', 'Psychiatrist'],
        ['m2', 'Printed discharge summary given to the family, and they have it', 'must', 'Duty nurse'],
        ['m3', 'Went through each medicine with the family: what it is for, how many tablets, morning, afternoon or night', 'must', 'Duty nurse'],
        ['m4', 'Family told: never stop the medicines, even if the patient feels fine', 'must', 'Duty nurse'],
        ['m5', 'Side effects explained: drowsiness, tremor, weight change, dry mouth', 'must', 'Duty nurse'],
        ['m6', 'At least 7 days of medicines given from the Tulasi pharmacy', 'must', 'Duty nurse'],
        ['m7', 'Nearby pharmacy details given', 'opt', 'Duty nurse'],
        ['m8', 'Family warned: no alcohol with these medicines', 'must', 'Duty nurse']] },
      { id: 's3', title: '3. Psychoeducation', owner: 'Psychologist', items: [
        ['p1', 'Illness explained to the family in simple words', 'must', 'Psychologist'],
        ['p2', 'Why the medicines must be taken regularly', 'must', 'Psychologist'],
        ['p3', 'Sleep matters: report sleep trouble lasting 2 or more nights', 'must', 'Psychologist'],
        ['p4', 'Keep a calm, supportive home', 'must', 'Psychologist'],
        ['p5', 'Slow return to routine: short walks, meeting people, daily activity', 'must', 'Psychologist'],
        ['p6', 'Alcohol and drug use warning', 'must', 'Psychologist'],
        ['p7', 'Stigma: the family may say "treatment was ongoing"', 'opt', 'Psychologist'],
        ['p8', 'LAMA patient: extra 15-minute briefing on the risks of leaving early', 'opt', 'Psychologist']] },
      { id: 's4', title: '4. Early warning signs explained', owner: 'Psychologist · family to report any of these at once', items: [
        ['w1', 'Sleep trouble for 2 or more nights', 'must', 'Psychologist'],
        ['w2', 'More irritable or angry', 'must', 'Psychologist'],
        ['w3', 'Withdrawing, refusing to leave the room', 'must', 'Psychologist'],
        ['w4', 'Suspicious, or unusual beliefs', 'must', 'Psychologist'],
        ['w5', 'Sudden mood changes, very high or very low', 'must', 'Psychologist'],
        ['w6', 'Refusing medicines', 'must', 'Psychologist'],
        ['w7', 'If any sign appears: call Tulasi or go to the nearest hospital, do not wait', 'must', 'Psychologist']] }
    ];
    var SEC5 = [
      ['f1', 'Appointment card given to the family ("If you cannot come, call us: 8800000255")', 'must', 'Duty nurse'],
      ['f2', '1-month follow-up booked before the patient leaves', 'must', 'Front desk'],
      ['f3', 'Follow-up calls given to one named person', 'must', 'Patient experience'],
      ['f4', 'Patient from outside Delhi: tele-consult number given', 'opt', 'Front desk']
    ];
    var SECB = [
      { id: 's6', title: '6. Safety plan', owner: 'Psychiatrist and duty nurse', items: [
        ['s1', 'Crisis numbers given in writing: Tulasi 8800000255 / 7707070002, iCall 9152987821, Vandrevala 1860-2662-345', 'must', 'Duty nurse'],
        ['s2', 'Family to supervise the medicines every day', 'high', 'Psychiatrist'],
        ['s3', 'Family to remove or lock away sharp objects and extra medicines', 'high', 'Psychiatrist'],
        ['s4', 'Family told: go to Tulasi or the nearest hospital if warning signs appear', 'must', 'Psychiatrist']] },
      { id: 's7', title: '7. Billing and admin', owner: 'Billing desk and front desk', items: [
        ['b1', 'Bill paid in full and receipt given', 'must', 'Billing desk'],
        ['b2', 'Aadhaar, phone, clothes and valuables returned; family signed the return form', 'must', 'Front desk'],
        ['b3', 'A family member is here (the patient must not leave alone)', 'must', 'Duty nurse'],
        ['b4', 'Psychological assessment report attached to the file', 'must', 'Psychologist'],
        ['b5', 'Leave letter for job or school, if the family asks', 'opt', 'Front desk'],
        ['b6', 'Health insurance processed (SBI General / Future Generali)', 'opt', 'Billing desk'],
        ['b7', 'All documents stapled together and filed', 'must', 'Front desk']] }
    ];
    var discharging = P.filter(function (p) { return p.discharging; });
    var dcp = pById[s.dcPid] || discharging[0] || P[0];
    var dcDefault = function (p) {
      var seed = p.id === 'p6';
      return { ticks: seed ? { c1: 1, c2: 1, c3: 1, c4: 1, c6: 1, m1: 1, b4: 1, f2: 1 } : {}, risk: 'Medium',
        docDate: seed ? '2026-11-16' : '', docTime: seed ? '11:00' : '', psyDate: '', psyTime: '',
        assigned: 'Khalid (call centre)', consent: 'Yes', cName: p.gName || '', cRel: p.gRel || '', cPhone: p.phone || '',
        signs: { nurse: { name: '', at: '' }, doctor: { name: p.doctor, at: '' }, family: { name: p.gName || '', at: '' } },
        reminded: {}, counted: {}, done: false, doneText: '' };
    };
    var dc = Object.assign(dcDefault(dcp), s.dc[dcp.id] || {});
    var putDc = function (patch) { var all2 = Object.assign({}, self.state.dc); all2[dcp.id] = Object.assign({}, dc, patch); var st2 = { dc: all2, dcTry: false }; self.setState(st2); };
    var high = dc.risk === 'High';
    var needs = function (k) { return k === 'must' || (k === 'high' && high); };
    var mkItem = function (it) {
      var on = !!dc.ticks[it[0]], off = it[2] === 'high' && !high;
      return { label: it[1], sub: off ? 'Only for high risk patients' : it[3], on: on, kind: it[2],
        cls: 'cbx' + (on ? ' on' : ''), rowCls: 'checkrow' + (off ? ' dc-off' : ''),
        hasTag: it[2] !== 'must', tag: it[2] === 'opt' ? 'If it applies' : 'High risk', tagCls: 'tag ' + (it[2] === 'opt' ? 't-grey' : 't-red'),
        toggle: function () { var tk = Object.assign({}, dc.ticks); if (tk[it[0]]) delete tk[it[0]]; else tk[it[0]] = 1; putDc({ ticks: tk }); } };
    };
    var mustCount = function (items) { var need = items.filter(function (x) { return needs(x[2]); }); return [need.filter(function (x) { return dc.ticks[x[0]]; }).length, need.length]; };
    var mkSec = function (g) {
      var mc = mustCount(g.items);
      return { title: g.title, owner: g.owner, progress: mc[0] + ' of ' + mc[1] + ' must-do', chip: 'chip ' + (mc[0] === mc[1] ? 'green' : 'grey'), items: g.items.map(mkItem), isRisk: !!g.risk,
        riskBtns: ['Low', 'Medium', 'High'].map(function (r) { return { label: r, cls: dc.risk === r ? 'on' : '', pick: function () { putDc({ risk: r }); } }; }),
        riskHint: high ? 'High risk adds the locked-medicines and safety items.' : 'Pick High to add the high-risk safety items.' };
    };
    var allItems = [];
    SEC.concat(SECB).forEach(function (g) { allItems = allItems.concat(g.items); }); allItems = allItems.concat(SEC5);
    var mcAll = mustCount(allItems);
    var setDcf = function (k) { return function (e) { var p = {}; p[k] = e.target.value; putDc(p); }; };
    var gaps = [];
    if (!dc.docDate) gaps.push([dcp.doctor, 'Psychiatrist']);
    if (!dc.psyDate) gaps.push([dcp.psych, 'Psychologist']);
    var mc5 = mustCount(SEC5), datesIn = (dc.docDate ? 1 : 0) + (dc.psyDate ? 1 : 0);
    var dcf = {
      doctor: dcp.doctor, psych: dcp.psych, docDate: dc.docDate, docTime: dc.docTime, psyDate: dc.psyDate, psyTime: dc.psyTime,
      assigned: dc.assigned, cName: dc.cName, cRel: dc.cRel, cPhone: dc.cPhone,
      setDocDate: setDcf('docDate'), setDocTime: setDcf('docTime'), setPsyDate: setDcf('psyDate'), setPsyTime: setDcf('psyTime'),
      setAssigned: setDcf('assigned'), setCName: setDcf('cName'), setCRel: setDcf('cRel'), setCPhone: setDcf('cPhone'),
      consentBtns: ['Yes', 'No'].map(function (v) { return { label: v, cls: dc.consent === v ? 'on' : '', pick: function () { putDc({ consent: v }); } }; }),
      items: SEC5.map(mkItem), progress: datesIn + ' of 2 dates · ' + mc5[0] + ' of ' + mc5[1] + ' must-do', chip: 'chip ' + (datesIn === 2 && mc5[0] === mc5[1] ? 'green' : 'grey'),
      gaps: gaps.map(function (gp) {
        var who = gp[0], rem = !!dc.reminded[who], cnt = !!dc.counted[who];
        return { who: who + ' (' + gp[1].toLowerCase() + ')', remLabel: rem ? 'Reminder sent' : 'Remind ' + who, remCls: 'btn sm' + (rem ? ' ok' : ''), cntLabel: cnt ? 'Counted' : 'Count as left blank', cntCls: 'btn sm' + (cnt ? ' ok' : ''),
          remind: function () { var r = Object.assign({}, dc.reminded); r[who] = true; putDc({ reminded: r }); },
          count: function () { if (cnt) return; var c2 = Object.assign({}, dc.counted); c2[who] = true; var all3 = Object.assign({}, self.state.dc); all3[dcp.id] = Object.assign({}, dc, { counted: c2 }); var ms = Object.assign({}, self.state.missed); ms[who] = (ms[who] || 0) + 1; self.setState({ dc: all3, missed: ms }); } };
      })
    };
    var SIGNS = [['nurse', 'Duty nurse', 'Medicines given. Checklist completed.'], ['doctor', 'Treating doctor', 'Clinical handoff confirmed. Digital signature in the software summary.'], ['family', 'Family member', 'All instructions understood. Appointment plan received.']];
    var signedN = SIGNS.filter(function (g) { return dc.signs[g[0]].at; }).length;
    var dcSigns = SIGNS.map(function (g) {
      var sg = dc.signs[g[0]];
      var upd = function (patch) { var sn = Object.assign({}, dc.signs); sn[g[0]] = Object.assign({}, sg, patch); putDc({ signs: sn }); };
      return { role: g[1], says: g[2], name: sg.name, setName: function (e) { upd({ name: e.target.value }); },
        btnLabel: sg.at ? 'Signed ' + sg.at : 'Sign', btnCls: 'btn sm' + (sg.at ? ' ok' : ' soft'),
        sign: function () { if (sg.at) { upd({ at: '' }); return; } if (!String(sg.name || '').trim()) { window.alert('Type the ' + g[1].toLowerCase() + "'s name first."); return; } upd({ at: '11 Nov, ' + nowTime() }); } };
    });
    var blocks = [];
    if (mcAll[0] < mcAll[1]) blocks.push({ t: (mcAll[1] - mcAll[0]) + ' must-do item' + (mcAll[1] - mcAll[0] === 1 ? '' : 's') + ' not ticked' });
    gaps.forEach(function (gp) { blocks.push({ t: gp[1] + ' follow-up date missing (' + gp[0] + ')' }); });
    if (!String(dc.cPhone || '').trim()) blocks.push({ t: 'Family mobile number for the calls' });
    SIGNS.forEach(function (g) { if (!dc.signs[g[0]].at) blocks.push({ t: g[1] + ' signature' }); });
    var dischIso = fromDM(dcp.discharge);

    // --- follow-ups (demo patients, not real people)
    var FU = [
      { id: 'u1', name: 'Sameer Das', disch: '2026-11-09', family: 'Ankit Das (brother)', phone: '98110 XXX21', kind: 'Psychiatrist OPD', with: 'Dr. Madhura Samudra', due: '2026-11-12', posted: '', outcome: '', upd: '' },
      { id: 'u2', name: 'Sameer Das', disch: '2026-11-09', family: 'Ankit Das (brother)', phone: '98110 XXX21', kind: 'Psychologist OPD', with: 'Barkha', due: '2026-11-12', posted: '', outcome: '', upd: '' },
      { id: 'u3', name: 'Ritu Malhotra', disch: '2026-11-10', family: 'Sanjay Malhotra (husband)', phone: '99530 XXX08', kind: 'Psychiatrist OPD', with: 'Dr. Aanya Sharma', due: '2026-11-12', posted: '', outcome: '', upd: '' },
      { id: 'u4', name: 'Ritu Malhotra', disch: '2026-11-10', family: 'Sanjay Malhotra (husband)', phone: '99530 XXX08', kind: 'Psychologist OPD', with: 'Priya Nair', due: '2026-11-14', posted: '', outcome: '', upd: '' },
      { id: 'u5', name: 'Kavita Joshi', disch: '2026-10-30', family: 'Mohan Joshi (father)', phone: '98731 XXX65', kind: 'Psychiatrist OPD', with: 'Dr. Ichpreet Singh', due: '2026-11-11', posted: '2026-11-10', outcome: 'Online OPD booked', upd: '2026-11-10' },
      { id: 'u6', name: 'Imran Sheikh', disch: '2026-11-03', family: 'Farah Sheikh (wife)', phone: '98186 XXX44', kind: 'Psychiatrist OPD', with: 'Dr. Ichpreet Singh', due: '2026-11-09', posted: '2026-11-08', outcome: '', upd: '' },
      { id: 'u7', name: 'Dev Kumar', disch: '2026-11-04', family: 'Sunita Kumar (mother)', phone: '97170 XXX92', kind: 'Psychiatrist OPD', with: 'Dr. Ichpreet Singh', due: '2026-11-08', posted: '2026-11-07', outcome: 'Did not pick up', upd: '2026-11-10', tries: 2 },
      { id: 'u8', name: 'Dev Kumar', disch: '2026-11-04', family: 'Sunita Kumar (mother)', phone: '97170 XXX92', kind: 'Day-14 call', with: 'Call centre', due: '2026-11-18', posted: '', outcome: '', upd: '' },
      { id: 'u9', name: 'Pooja Bhatt', disch: '2026-11-01', family: 'Rohan Bhatt (husband)', phone: '99100 XXX37', kind: 'Psychiatrist OPD', with: 'Dr. Alisha Nagar', due: '2026-11-05', posted: '2026-11-04', outcome: 'Came for appointment', upd: '2026-11-05' },
      { id: 'u10', name: 'Pooja Bhatt', disch: '2026-11-01', family: 'Rohan Bhatt (husband)', phone: '99100 XXX37', kind: 'Day-14 call', with: 'Call centre', due: '2026-11-15', posted: '', outcome: '', upd: '' },
      { id: 'u11', name: 'Aman Gill', disch: '2026-10-28', family: 'Harjeet Gill (father)', phone: '98720 XXX13', kind: 'Psychiatrist OPD', with: 'Dr. Ichpreet Singh', due: '2026-11-01', posted: '2026-10-31', outcome: 'Will call back', upd: '2026-11-03' },
      { id: 'u12', name: 'Tarun Roy', disch: '2026-10-25', family: 'Mita Roy (sister)', phone: '98100 XXX56', kind: 'Day-14 call', with: 'Call centre', due: '2026-11-08', posted: '2026-11-07', outcome: 'Call done, doing well', upd: '2026-11-08' },
      { id: 'u13', name: 'Tarun Roy', disch: '2026-10-25', family: 'Mita Roy (sister)', phone: '98100 XXX56', kind: 'Day-30 call', with: 'Call centre', due: '2026-11-24', posted: '', outcome: '', upd: '' },
      { id: 'u14', name: 'Nisha Kapoor', disch: '2026-10-20', family: 'Ravi Kapoor (husband)', phone: '99990 XXX71', kind: 'Psychiatrist OPD', with: 'Dr. Aanya Sharma', due: '2026-10-27', posted: '2026-10-26', outcome: 'Found another hospital', upd: '2026-10-28' }
    ];
    var DONE = ['Came for appointment', 'Call done, doing well', 'Readmitted'], LOST = ['Found another hospital', 'Found another doctor'], NOANS = ['Did not pick up', 'Number switched off'];
    var postedTomorrow = !!s.fuPosted;
    var fuAll = FU.concat(s.fuExtra).map(function (f0) {
      var ov = s.fuOut[f0.id] || {}, f = Object.assign({}, f0, ov);
      var diff = dayDiff(f.due), o = f.outcome || '', closed = DONE.indexOf(o) >= 0 || LOST.indexOf(o) >= 0, lost = LOST.indexOf(o) >= 0;
      var posted = f.posted || (diff === 1 && postedTomorrow ? toIso(TODAY) : '');
      var touch = f.upd || posted, quiet = touch ? -dayDiff(touch) : 0;
      var missed = !closed && diff < 0, stale = !closed && diff <= 0 && !!touch && quiet >= 2, tries = f.tries || 0, noAns3 = !closed && NOANS.indexOf(o) >= 0 && tries >= 3;
      var flag = lost ? 'Lost: counts in the weekly report' : noAns3 ? tries + ' tries with no answer. Kanika to call the family herself.' : stale ? 'No update from the call centre for ' + quiet + ' days' : (o && f.upd ? 'Updated ' + dm(f.upd) + (tries > 1 ? ' · try ' + tries : '') : (posted ? 'Sent to call centre ' + dm(posted) : 'Not sent to the call centre yet'));
      var dueTxt = closed ? (lost ? 'Lost' : 'Done') : diff < 0 ? 'Missed · was ' + dm(f.due) : diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow · ' + dm(f.due) : dm(f.due);
      var dueCls = 'chip ' + (closed ? (lost ? 'red' : 'green') : diff < 0 ? 'red' : diff === 0 ? 'amber' : diff === 1 ? 'blue' : 'grey');
      var rem = !!s.fuRem[f.id];
      return Object.assign({}, f, { diff: diff, closed: closed, lost: lost, missed: missed, stale: stale, noAns3: noAns3, flag: flag,
        flagStyle: 'margin-top:4px;color:' + (lost || stale || noAns3 ? '#b42318' : '#5b6475'),
        dischTxt: dm(f.disch), dueTxt: dueTxt, dueCls: dueCls, outcome: o,
        sr: '--sr:' + (lost || missed ? '#b42318' : stale || noAns3 ? '#d48806' : diff <= 1 && !closed ? '#1e6cdb' : 'transparent'),
        canRemind: !closed && (diff <= 0 || stale), remLabel: rem ? 'Reminder sent' : 'Remind Khalid', remCls: 'btn sm' + (rem ? ' ok' : ''),
        remind: function () { var r = Object.assign({}, self.state.fuRem); r[f.id] = true; self.setState({ fuRem: r }); },
        setOutcome: function (e) {
          var v = e.target.value, m = Object.assign({}, self.state.fuOut), cur2 = m[f.id] || {};
          m[f.id] = Object.assign({}, cur2, { outcome: v, upd: toIso(TODAY), tries: NOANS.indexOf(v) >= 0 ? tries + 1 : tries });
          self.setState({ fuOut: m });
        } });
    }).sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
    var FSEG = [['action', 'Needs action', function (f) { return !f.closed && (f.missed || f.stale || f.noAns3 || f.diff <= 1); }],
      ['tomorrow', 'Tomorrow', function (f) { return f.diff === 1; }],
      ['missed', 'Did not come', function (f) { return f.missed || f.lost; }],
      ['closed', 'Closed', function (f) { return f.closed; }],
      ['all', 'All', function () { return true; }]];
    var fseg = FSEG.filter(function (g) { return g[0] === s.fuFilter; })[0] || FSEG[0];
    var fuRows = fuAll.filter(fseg[2]);
    var tomorrow = fuAll.filter(function (f) { return f.diff === 1; });
    var byName = {}, order = [];
    tomorrow.forEach(function (f) { if (!byName[f.name]) { byName[f.name] = []; order.push(f.name); } byName[f.name].push(f); });
    var fuTomorrowText = order.map(function (nm) {
      var L = byName[nm], f = L[0], lines = ['Follow-up tomorrow: ' + kdate(f.due), 'Patient: ' + nm, 'Original discharge date: ' + kdate(f.disch)];
      L.forEach(function (x) { lines.push((x.kind === 'Psychiatrist OPD' ? 'Doctor: ' : x.kind === 'Psychologist OPD' ? 'Psychologist: ' : x.kind + ': ') + x.with); });
      lines.push('Family contact: ' + f.phone + ' (' + f.family.replace(' (', ', ').replace(/\)$/, '') + ')');
      return lines.join('\n');
    }).join('\n\n');
    var past = fuAll.filter(function (f) { return f.diff < 0 && f.kind.indexOf('OPD') >= 0; });
    var came = past.filter(function (f) { return f.outcome === 'Came for appointment'; }).length;
    var BLANK = { 'Dr. Madhura Samudra': ['Psychiatrist', 4], 'Barkha': ['Psychologist', 2], 'Dr. Ichpreet Singh': ['Psychiatrist', 1] };
    Object.keys(s.missed).forEach(function (k) { if (!BLANK[k]) BLANK[k] = ['Clinician', 0]; });
    var fuBlanks = Object.keys(BLANK).map(function (k) {
      var n = BLANK[k][1] + (s.missed[k] || 0);
      return { name: k, role: BLANK[k][0], n: n, over: n >= 5, chip: 'chip ' + (n >= 5 ? 'red' : n >= 3 ? 'amber' : 'grey'),
        raise: function () { try { window.location.href = 'mailto:gmoperations@tulasihealthcare.com?subject=' + encodeURIComponent('Follow-up dates left blank: ' + k) + '&body=' + encodeURIComponent('Hello Chandraji,\n\n' + k + ' (' + BLANK[k][0].toLowerCase() + ') has left the follow-up date blank on the discharge checklist ' + n + ' times.\n\nRaised by Patient Experience, as per the Discharge SOP.'); } catch (e) {} } };
    }).sort(function (a, b) { return b.n - a.n; });
    var NX = {
      nav: [['today', 'Patient dashboard', 0], ['concerns', 'Grievances', openC.length], ['floor', 'Floor round', 0], ['dcheck', 'Discharge checklist', discharging.filter(function (p) { var x = s.dc[p.id]; return !(x && x.done); }).length], ['feedback', 'Discharge feedback', 0], ['follow', 'Follow-ups', fuAll.filter(FSEG[0][2]).length], ['report', 'Weekly report', 0]].map(function (n) {
        var on = s.screen === n[0] || (n[0] === 'today' && s.screen === 'record');
        return { label: n[1], count: n[2], hasCount: n[2] > 0, cls: 'sub' + (on ? ' on' : ''), go: go(n[0]) };
      }),
      isDcheck: s.screen === 'dcheck', isFollow: s.screen === 'follow',
      goFollow: go('follow'),
      openDcheck: function () { self.setState({ screen: 'dcheck', dcPid: s.pid }); },
      dcPid: dcp.id, setDcPid: function (e) { self.setState({ dcPid: e.target.value, dcTry: false }); },
      dcPatients: discharging.map(function (p) { return { id: p.id, label: p.name + ' · discharge ' + p.discharge }; }),
      dcFacts: [{ k: 'Patient', v: dcp.name }, { k: 'UHID', v: dcp.uhid }, { k: 'Ward / bed', v: dcp.room }, { k: 'Date of discharge', v: dcp.discharge + ' 2026' }, { k: 'Psychiatrist', v: dcp.doctor }, { k: 'Psychologist', v: dcp.psych }],
      dcTiles: [
        { label: 'Must-do items', value: mcAll[0] + ' of ' + mcAll[1], sub: high ? 'High risk items included' : 'Risk level: ' + dc.risk },
        { label: 'Follow-up dates', value: datesIn + ' of 2', sub: gaps.length ? 'Missing: ' + gaps.map(function (g) { return g[0]; }).join(', ') : 'Both filled' },
        { label: 'Signatures', value: signedN + ' of 3', sub: 'Nurse, doctor, family' },
        { label: 'Calls after discharge', value: dc.consent === 'Yes' ? 'Day 14 and 30' : 'Declined', sub: 'Assigned to ' + dc.assigned }
      ],
      dcSecA: SEC.map(mkSec), dcSecB: SECB.map(mkSec), dcf: dcf, dcSigns: dcSigns,
      dcSignText: signedN + ' of 3 signed', dcSignChip: 'chip ' + (signedN === 3 ? 'green' : 'grey'),
      dcDone: !!dc.done, dcOpen: !dc.done, dcDoneText: dc.doneText,
      dcHint: blocks.length ? blocks.length + ' thing' + (blocks.length === 1 ? '' : 's') + ' left' : 'Everything is in. Completing adds the follow-ups for the call centre.',
      dcShowBlocks: !!s.dcTry && blocks.length > 0, dcBlocks: blocks,
      dcComplete: function () {
        if (blocks.length) { self.setState({ dcTry: true }); return; }
        var fam = dc.cName + (dc.cRel ? ' (' + dc.cRel.toLowerCase() + ')' : ''), base = { name: dcp.name, disch: dischIso, family: fam, phone: dc.cPhone, posted: '', outcome: '', upd: '' }, n0 = self.state.fuExtra.length;
        var add = [Object.assign({}, base, { id: 'x' + (n0 + 1), kind: 'Psychiatrist OPD', with: dcp.doctor, due: dc.docDate }), Object.assign({}, base, { id: 'x' + (n0 + 2), kind: 'Psychologist OPD', with: dcp.psych, due: dc.psyDate })];
        if (dc.consent === 'Yes') { add.push(Object.assign({}, base, { id: 'x' + (n0 + 3), kind: 'Day-14 call', with: dc.assigned, due: addDays(dischIso, 14) })); add.push(Object.assign({}, base, { id: 'x' + (n0 + 4), kind: 'Day-30 call', with: dc.assigned, due: addDays(dischIso, 30) })); }
        var all4 = Object.assign({}, self.state.dc); all4[dcp.id] = Object.assign({}, dc, { done: true, doneText: 'Checklist complete for ' + dcp.name + ' at ' + nowTime() + '. ' + add.length + ' follow-ups added for the call centre: ' + add.map(function (a) { return a.kind + ' ' + dm(a.due); }).join(', ') + '.' });
        self.setState({ dc: all4, dcTry: false, fuExtra: self.state.fuExtra.concat(add) });
      },
      fuTiles: [
        { label: 'Due tomorrow', value: String(order.length), sub: tomorrow.length + ' appointment' + (tomorrow.length === 1 ? '' : 's') + ' or calls' },
        { label: 'Due today', value: String(fuAll.filter(function (f) { return f.diff === 0 && !f.closed; }).length), sub: 'Not closed yet' },
        { label: 'Waiting for an update', value: String(fuAll.filter(function (f) { return f.stale; }).length), sub: 'No word from the call centre in 2 days' },
        { label: 'Did not come', value: String(fuAll.filter(function (f) { return f.missed || f.lost; }).length), sub: fuAll.filter(function (f) { return f.lost; }).length + ' went elsewhere' },
        { label: 'Came for follow-up', value: past.length ? Math.round(came / past.length * 100) + '%' : '-', sub: came + ' of ' + past.length + ' due so far' }
      ],
      fuHasTomorrow: order.length > 0, fuNoTomorrow: order.length === 0, fuTomorrowText: fuTomorrowText,
      fuMsgSub: 'Same format Kanika posts in the call-centre group, built from the discharge checklists.',
      fuPostText: s.fuPosted ? 'Sent ' + s.fuPosted : 'Not sent yet', fuPostChip: 'chip ' + (s.fuPosted ? 'green' : 'amber'), fuMsg: s.fuMsg,
      fuPost: function () { self.setState({ fuPosted: '11 Nov, ' + nowTime(), fuMsg: 'Marked as sent. The rows due tomorrow now show "Sent to call centre".' }); },
      fuCopy: function () { try { navigator.clipboard.writeText(fuTomorrowText); self.setState({ fuMsg: 'Copied. Paste it in WhatsApp.' }); } catch (e) { self.setState({ fuMsg: 'Copy did not work here. Select the text and copy it.' }); } },
      fuBlanks: fuBlanks,
      fuSegs: FSEG.map(function (g) { return { label: g[1], n: fuAll.filter(g[2]).length, cls: s.fuFilter === g[0] ? 'on' : '', go: function () { self.setState({ fuFilter: g[0] }); } }; }),
      fuRows: fuRows, fuEmpty: fuRows.length === 0,
      fuSummary: fuAll.filter(FSEG[0][2]).length + ' follow-ups need action, ' + fuAll.filter(function (f) { return f.missed || f.lost; }).length + ' did not come.'
    };
    var titles2 = { dcheck: 'Discharge checklist', follow: 'Follow-ups' };
    if (titles2[s.screen]) NX.pageTitle = titles2[s.screen];
`;
rep("    var titles = { today:", logic + "\n    var titles = { today:", 'logic');
rep("    return {\n      pageTitle: titles[s.screen],", "    var __base = {\n      pageTitle: titles[s.screen],", 'return open');
rep("form: Object.assign({}, f, { desc: '' }) });\n      }\n    };\n  }\n}", "form: Object.assign({}, f, { desc: '' }) });\n      }\n    };\n    return Object.assign(__base, NX);\n  }\n}", 'return close');

/* ---------- css ---------- */
const css = `
/* discharge checklist + follow-ups */
.dc-head{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px 20px;padding:16px 20px}
.dc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:18px;align-items:start}
.dc-risk{display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;padding:12px 20px;border-bottom:1px solid #eef2f6;background:#fafbfd}
.dc-off{opacity:.5}
.dc-gap{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.dc-sigs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px;padding:16px 20px}
.dc-sig{border:1px solid #e3eaf2;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px}
.fu-msg{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:13px;line-height:1.55;background:#f6faff;border:1px solid #cfe0fb;border-radius:12px;padding:14px 16px}
`;
const sEnd = t.indexOf('</style>');
t = t.slice(0, sEnd) + css + t.slice(sEnd);

if (t.indexOf('{{', t.indexOf('class Component')) >= 0 && /\{\{/.test(logic)) throw new Error('{{ in logic');
const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
