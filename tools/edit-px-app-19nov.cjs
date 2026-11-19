/* 19 Nov 2026 (meeting) Patient Experience Lead app (public/px-lead-prototype.html template):
   1. "Log a call or concern" opens as a pop-up (was a card at the top of the page).
   2. ONE pop-up for both: choose Random family call or Someone raised a concern. Random family call shows the patient and BOTH family contacts with
      "0 of 2 done"; choosing who to call opens the call window for that person. The concern form is inside the same pop-up.
   3. Calendar leaves the main menu (too confusing for now). */
const fs = require('fs');
const file = 'public/px-lead-prototype.html';
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
function R(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 90)); t = t.split(a).join(b); }

/* 1. pop-up */
R('<section class="card log-inline" style="padding:22px;display:flex;flex-direction:column;gap:14px;max-width:640px" role="region" aria-label="Log a grievance">',
  '<div class="overlay mid"><div class="drawer modal log-modal" style="width:min(680px,94vw)" role="dialog" aria-label="Log a call or concern">');
R('<button class="btn" type="button" sc-camel-on-click="{{closeLog}}">Cancel</button></div>\n  </section>\n</sc-if>',
  '<button class="btn" type="button" sc-camel-on-click="{{closeLog}}">Cancel</button></div>\n      </sc-if>\n  </div></div>\n</sc-if>');

/* 2. one pop-up: random call picker + concern form */
R('<div class="muted small">A random call opens the call and log window with the patient picked.</div></div>\n      <div class="field"><label>How did it come in?</label>',
  '<div class="muted small">{{kindHint}}</div></div>\n' +
  '      <sc-if value="{{isRandom}}" hint-placeholder-val="{{false}}">\n' +
  '        <div class="field"><label for="rlpq">Patient</label><input id="rlpq" class="search" type="search" placeholder="Search by name, room or UHID" value="{{logQ}}" sc-camel-on-input="{{setLogQ}}" aria-label="Search admitted patients"><sc-raw-select id="rlp" value="{{form.pid}}" sc-camel-on-change="{{setPid}}"><sc-for list="{{patientOpts}}" as="o" hint-placeholder-count="6"><option value="{{o.id}}">{{o.label}}</option></sc-for></sc-raw-select></div>\n' +
  '        <div class="field"><label>Who to call · {{rcoCount}} done</label>\n' +
  '          <sc-for list="{{rcoContacts}}" as="c" hint-placeholder-count="2"><div class="listrow" style="padding:10px 12px;border:1px solid #E3EAF2;border-radius:12px;margin-bottom:8px;align-items:center"><div class="grow"><div class="name">{{c.name}}</div><div class="muted small">{{c.sub}}</div></div><button class="btn pri sm" type="button" sc-camel-on-click="{{c.call}}">{{c.label}}</button></div></sc-for>\n' +
  '          <div class="muted small">Every patient gets two random calls during the stay. Pick the family member you are calling; the call window opens next.</div></div>\n' +
  '        <div style="display:flex;gap:8px"><button class="btn" type="button" sc-camel-on-click="{{closeLog}}">Close</button></div>\n' +
  '      </sc-if>\n' +
  '      <sc-if value="{{isConcern}}" hint-placeholder-val="{{true}}">\n' +
  '      <div class="field"><label>How did it come in?</label>');

/* kind buttons that stay in the same pop-up */
R("NZ.kindBtns = [{ label: 'Random family call', cls: 'lz-chip', pick: function () { var pid = self.state.form.pid; self.setState({ logOpen: false, logQ: '', rcPid: pid, rc: {} }); } }, { label: 'Someone raised a concern', cls: 'lz-chip on', pick: function () {} }];",
  "var lkind = s.form.kind || 'concern';\n" +
  "    NZ.isRandom = lkind === 'random'; NZ.isConcern = !NZ.isRandom;\n" +
  "    NZ.kindHint = NZ.isRandom ? 'Pick the patient, then the family member you are calling.' : 'Fill in what was said. It is saved to the patient record.';\n" +
  "    NZ.kindBtns = [{ label: 'Random family call', cls: 'lz-chip' + (NZ.isRandom ? ' on' : ''), pick: function () { self.setState({ form: Object.assign({}, self.state.form, { kind: 'random' }) }); } }, { label: 'Someone raised a concern', cls: 'lz-chip' + (NZ.isRandom ? '' : ' on'), pick: function () { self.setState({ form: Object.assign({}, self.state.form, { kind: 'concern' }) }); } }];\n" +
  "    var rcoP = pById[s.form.pid] || null;\n" +
  "    var rcoList = function (p) { var out = [{ name: p.gName, rel: p.gRel, phone: p.phone }]; (p.contacts || []).forEach(function (c) { if (c.name && out.every(function (o) { return o.name !== c.name; })) out.push({ name: c.name, rel: String(c.rel || 'relative').toLowerCase(), phone: c.phone || p.phone }); }); return out.slice(0, 2); };\n" +
  "    NZ.rcoCount = rcoP ? rnd(rcoP) : '0 of 2';\n" +
  "    NZ.rcoContacts = rcoP ? (function () { var L = rcoList(rcoP).map(function (c) { return { name: c.name, sub: String(c.rel || 'relative') + (c.phone ? ' · ' + c.phone : ''), label: 'Call ' + String(c.name || '').split(' ')[0], call: function () { self.setState({ logOpen: false, logQ: '', rcPid: rcoP.id, rc: {}, rcWho: c }); } }; }); if (L.length < 2) L.push({ name: 'Second family contact', sub: 'Not recorded yet. Add it at the family meeting.', label: 'Not recorded', call: function () {} }); return L; })() : [];");

/* the call window shows the chosen family member */
R("NZ.rcName = rcP ? rcP.name : ''; NZ.rcGuardian = rcP ? rcP.gName : ''; NZ.rcRel = rcP ? String(rcP.gRel || '').toLowerCase() : ''; NZ.rcPhone = rcP ? rcP.phone : '';",
  "var rcW = (s.rcWho && rcP) ? s.rcWho : null;\n" +
  "    NZ.rcName = rcP ? rcP.name : ''; NZ.rcGuardian = rcP ? (rcW ? rcW.name : rcP.gName) : ''; NZ.rcRel = rcP ? String((rcW ? rcW.rel : rcP.gRel) || '').toLowerCase() : ''; NZ.rcPhone = rcP ? ((rcW && rcW.phone) || rcP.phone) : '';");

/* real patients carry their relatives so both family names can be shown */
R("guardian: g, gName: h.nr, gRel: rel, nr: h.nr, phone: h.mobile || o.phone });",
  "guardian: g, gName: h.nr, gRel: rel, nr: h.nr, contacts: h.rels || [], phone: h.mobile || o.phone });");

/* 3. Calendar out of the menu */
R("['concerns', 'Grievances', openC.length], ['calendar2', 'Calendar', 0], ['training2', 'Staff training', 0]", "['concerns', 'Grievances', openC.length], ['training2', 'Staff training', 0]");

fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
