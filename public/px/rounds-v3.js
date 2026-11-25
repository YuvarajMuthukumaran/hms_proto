/* 24 Nov 2026: Rounds redesign (Nikita, "Rounds redesign – Patient Experience Lead.html" + "Rules the system runs").
   The coordinator only answers and taps. Who is on the round, the order, the question, who gets the issue and what carries over
   come from the rules below. Caseload, round slots, settings and the AI scribe stay in rounds-v2.js (RV2._); everything a visit
   produces is written to the same stores as before (px_rounds_v1 entries/room issues/safety, px_rounds_v2 visits), and grievance
   status changes go to the lead app's concernStatus, so Today, Grievances and Reports keep working. */
(function () {
  if (document.documentElement.classList.contains('setmode') || !window.RV2 || !window.RV2._) return;
  var X = window.RV2._, H = 3600000;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var q = function (s) { return esc(s).replace(/'/g, '&#39;'); };
  var hhmm = function (t) { var d = new Date(t); return (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + (d.getHours() < 12 ? ' am' : ' pm'); };
  var SLOT = { M: 'Morning', A: 'Afternoon', E: 'Evening' }, PREV = { A: 'M', E: 'A' }, NEXT = { M: 'the afternoon', A: 'the evening', E: "tomorrow's morning" };
  /* 25 Nov audit: 'No room yet' wrapped onto three lines in the 50 px room column, so it is a dash */
  var roomOf = function (p) { var r = String(p.room || '').replace(/^Room\s*/, ''); return !r || /^no room/i.test(r) ? '—' : r; };
  var floorOf = function (p) { var f = String(p.floor || '').replace(/^f/i, ''); if (!f) { var m = roomOf(p).match(/\d/); f = m ? m[0] : ''; } return f; };
  var flName = function (f) { return f === '' ? 'No floor' : f === '0' ? 'Ground floor' : f + ({ 1: 'st', 2: 'nd', 3: 'rd' }[f] || 'th') + ' floor'; };

  /* table 5: where each issue goes */
  var CATS = [
    ['doctor', 'Doctor', 'Care', 'Treating psychiatrist', 24], ['therapy', 'Therapy', 'Care', 'Psychology team lead', 24], ['nursing', 'Nursing', 'Care', 'Nursing in-charge', 4],
    ['meds', 'Medicines', 'Care', 'Nursing in-charge and pharmacy', 4], ['family', 'Family updates', 'Care', 'Treating psychologist', 24],
    ['food', 'Food', 'Stay', 'Kitchen supervisor', 6], ['room', 'Room', 'Stay', 'Housekeeping supervisor', 4], ['noise', 'Noise', 'Stay', 'Floor supervisor', 2],
    ['att', 'Attendants', 'Stay', 'Floor supervisor', 4], ['belong', 'Belongings', 'Stay', 'Front desk', 24], ['bill', 'Billing', 'Stay', 'Billing desk', 24],
    ['safety', 'Safety', 'Serious', 'Mr. S. Chandra and treating doctor', 1], ['rights', 'Rights or dignity', 'Serious', 'Mr. S. Chandra and Kanika', 2], ['leave', 'Wants to leave', 'Serious', 'Treating psychiatrist and nursing in-charge', 1]
  ].map(function (c) { return { id: c[0], label: c[1], g: c[2], owner: c[3], sla: c[4], alert: c[2] === 'Serious' }; });
  var catBy = function (id) { return CATS.filter(function (c) { return c.id === id; })[0]; };
  /* old grievance categories (Rounds before 24 Nov, Log a concern) mapped to the new ones, so "Still a problem" keeps the category */
  var catGuess = function (t) {
    t = String(t || '').toLowerCase();
    var M = [[/safety|unsafe|threat|harm/, 'safety'], [/right|dignity|complaint/, 'rights'], [/leave|dama/, 'leave'], [/medicine|pharm|drows|tablet/, 'meds'], [/doctor|treatment|psychiatr/, 'doctor'],
      [/therap|psycholog/, 'therapy'], [/family|visit|call/, 'family'], [/nurs/, 'nursing'], [/food|diet|meal|kitchen|lunch|dinner|breakfast/, 'food'], [/noise|noisy|loud/, 'noise'],
      [/room|housekeep|clean|bath|ac\b|fan|light/, 'room'], [/attendant|security/, 'att'], [/belong|laundry|missing/, 'belong'], [/bill|insur|charge/, 'bill']];
    for (var i = 0; i < M.length; i++) if (M[i][0].test(t)) return M[i][1];
    return '';
  };
  var ownerText = function (c, p) { return c.owner + (/psychiatrist|doctor/i.test(c.owner) && p.doctor ? ' (' + p.doctor + ')' : /psychologist/i.test(c.owner) && p.psych ? ' (' + p.psych + ')' : ''); };

  /* section 6: room check, grouped by who fixes it */
  var ROOM = [
    ['safety', 'Safety · goes to Mr. S. Chandra now', 'Mr. S. Chandra and maintenance', [['tie', 'Something to tie or hang from'], ['sharp', 'Sharp or broken item'], ['grill', 'Window or grill loose'], ['chem', 'Chemicals or medicines left out']]],
    ['clean', 'Clean · Housekeeping', 'Housekeeping supervisor', [['floor', 'Floor not mopped or stained'], ['linen', 'Linen not changed or stained'], ['dust', 'Dusty furniture or cobwebs'], ['bin', 'Bin full or bad smell']]],
    ['fix', 'Broken · Maintenance', 'Maintenance', [['elec', 'Light, fan, AC or socket'], ['civil', 'Door, wall or window'], ['tv', 'TV or remote']]],
    ['disp', 'Displayed · You', 'You (patient experience)', [['rights', 'Patient rights not up'], ['tariff', 'Grievance number or tariff not up']]]
  ];

  /* grievances for a patient: the lead app's (seeded + logged, with status patches) and the ones raised on rounds */
  var host = function () { try { var G = window.parent && window.parent !== window && window.parent.PXG; return (G && G.self) || null; } catch (e) { return null; } };
  function grvOf(p, S) {
    var h = host(), st = (h && h.state) || {}, cs = st.concernStatus || {}, out = [], seen = {}, seed = [];
    try { seed = (h && window.parent.PXG.seedList) || []; } catch (e) {}
    var norm = function (x, at, slaH) {
      var status = x.status || 'Open', cat = x.category || x.cat || '';
      var closed = /Closed/i.test(status) || x.g2 === 4, fixed = !closed && (/Resolved|Pending action/i.test(status) || x.stage === 'confirm' || x.g2 === 2 || x.g2 === 3 || !!x.fixed);
      var ser = !!(x.safety || x.serious) || /safety|rights|dignity|leave|dama/i.test(cat) || /serious|high/i.test(x.sev || '');
      return { id: x.id, title: String(x.title || x.desc || 'Grievance').replace(/^[A-Z]\.\s*/, ''), cat: cat, owner: x.owner || '', status: status, closed: closed, fixed: fixed, ser: ser,
        over: !closed && !fixed && at && Date.now() - at > (slaH || 6) * H, by: x.latestBy || x.owner || 'The owner', round: !!x.round };
    };
    seed.concat(st.extraConcerns || []).forEach(function (c) {
      if (!c || !c.id || seen[c.id] || !(c.pid === p.id || (c.pname && c.pname === p.name))) return; seen[c.id] = 1;
      var x = Object.assign({}, c, cs[c.id] || {}); out.push(norm(x, x.at, 6));
    });
    (S.ent || []).forEach(function (e) {
      if (e.kind !== 'grievance' || e.patient !== p.name || seen[e.id]) return; seen[e.id] = 1;
      var x = Object.assign({}, e, cs[e.id] || {}); x.round = 1; x.cat = e.cat; out.push(norm(x, e.t0, e.lim ? e.lim / H : 6));
    });
    return out.filter(function (g) { return !g.closed; });
  }
  function gPatch(S, id, patch) {
    var h = host();
    if (h && h.setState) { try { var cs = Object.assign({}, h.state.concernStatus || {}); cs[id] = Object.assign({}, cs[id] || {}, patch); h.setState({ concernStatus: cs }); } catch (e) {} }
    (S.ent || []).forEach(function (e) { if (e.id === id) { if (patch.status) e.status = patch.status; if (patch.latest) e.latest = patch.latest; } });
  }

  var V = { k: '', pid: '', screen: 'list', out: '', cat: '', note: '', edited: false, marks: {}, floor: null, mob: window.innerWidth < 720 };
  try { V.floor = localStorage.getItem('px_rounds_floor'); } catch (e) {}

  /* section 1 and 2: who is on the round, and who to see first */
  function build() {
    var D = X.day(), S = X.ST(), k = V.k, pk = PREV[k], mine = X.mineOf();
    var floors = {}; mine.forEach(function (p) { floors[floorOf(p)] = 1; });
    var FL = Object.keys(floors).sort();
    if (V.floor != null && V.floor !== 'all' && !floors[V.floor]) V.floor = null;
    var fl = V.floor == null ? 'all' : V.floor;
    var GM = {}; mine.forEach(function (p) { GM[p.id] = grvOf(p, S); });
    var L = mine.filter(function (p) {
      if (fl !== 'all' && floorOf(p) !== fl) return false;
      if (onR(p, k)) return true;
      var v = D.v[p.id] || {};
      if (pk && onR(p, pk) && (!v[pk] ? X.passed(pk) : v[pk].a === 'na' || v[pk].a === 'notgood')) return true;
      return X.why(p, k, D).length > 0 || GM[p.id].length > 0;
    });
    var home = function (p, n) { if (!p.edd) return false; var d = new Date(); d.setHours(0, 0, 0, 0); return p.edd === new Date(d.getTime() + n * 864e5 + 6 * H).toISOString().slice(0, 10); };
    L.forEach(function (p) {
      var v = D.v[p.id] || {}, G = GM[p.id], r = [], pv = pk && v[pk];
      p.__g = G;
      G.forEach(function (g) {
        if (g.fixed) r.push({ lvl: 2, text: g.by + ' says "' + g.title + '" is fixed. Confirm with patient', g: g, m: 'confirm' });
        else if (g.ser) r.push({ lvl: 3, text: 'Serious grievance open: ' + (g.cat || g.title).toLowerCase() + ' (' + g.id + ')', g: g, m: 'serious' });
        else if (g.over) r.push({ lvl: 3, text: 'Reply overdue: ' + g.title + ' (' + g.id + ')', g: g, m: 'serious' });
      });
      ['M', 'A'].forEach(function (e) { var x = v[e]; if (x && e !== k && (x.a === 'notgood') && (D.flags[p.id] || {}).open) r.push({ lvl: 2, text: 'Not good on ' + SLOT[e].toLowerCase() + ' round' + (x.words ? ': "' + x.words + '"' : ''), m: 'followup', x: x, e: e }); });
      if (+p.day <= 1 && p.day !== '' && p.day != null) r.push({ lvl: 2, text: 'New admission, day ' + (+p.day) + '. Family meeting to log', m: 'new' });
      if (pv && pv.a === 'na') r.push({ lvl: 2, text: 'Not seen on ' + SLOT[pk].toLowerCase() + ' round (' + (pv.o === 'out' ? 'not in room' : 'asleep or busy') + ')', m: 'missed' });
      else if (pk && !pv && onR(p, pk) && X.passed(pk)) r.push({ lvl: 2, text: 'Not seen on ' + SLOT[pk].toLowerCase() + ' round', m: 'missed' });
      if (home(p, 0)) r.push({ lvl: 1, text: 'Goes home today. Check medicines and belongings', m: 'dc' });
      else if (home(p, 1)) r.push({ lvl: 1, text: 'Goes home tomorrow. Check medicines and belongings', m: 'dc' });
      p.__r = r.sort(function (a, b) { return b.lvl - a.lvl; }); p.__s = r.length ? r[0].lvl : 0;
    });
    var byRoom = function (a, b) { return roomOf(a).localeCompare(roomOf(b), undefined, { numeric: true }) || String(a.name).localeCompare(String(b.name)); };
    var prio = L.filter(function (p) { return p.__s; }).sort(function (a, b) { return b.__s - a.__s || byRoom(a, b); }), rest = L.filter(function (p) { return !p.__s; }).sort(byRoom);
    return { D: D, S: S, L: L, FL: FL, fl: fl, prio: prio, rest: rest, walk: prio.concat(rest) };
  }
  /* rule 1: up to 30 patients, everyone is on every round; more than that, each person has one round a day (rounds-v2 slotOf) */
  function onR(p, k) { return X.split() ? X.onRound(p, k) : true; }
  var res = function (B, p) { return (B.D.v[p.id] || {})[V.k]; };

  /* section 3: what to ask (first rule that matches wins) */
  function modeOf(p) {
    var r = p.__r || [], f = function (m) { return r.filter(function (x) { return x.m === m; })[0]; };
    var fu = f('followup'); if (fu && !fu.g && fu.x.gid) fu.g = (p.__g || []).filter(function (g) { return g.id === fu.x.gid; })[0];
    return f('confirm') || fu || f('serious') || f('new') || f('dc') || { m: 'plain' };
  }
  function ask(p, md) {
    var g = md.g;
    if (md.m === 'confirm') return 'Our team says "' + g.title + '" was sorted. Is it working for you now?';
    if (md.m === 'followup') return 'On the ' + SLOT[md.e].toLowerCase() + ' round you said' + (md.x.words ? ': "' + md.x.words + '"' : ' something was not good') + '. Is it better now?';
    if (md.m === 'serious') return 'You told us about "' + g.title + '". Has ' + (g.owner || 'the team') + ' spoken to you about it yet?';
    if (md.m === 'new') return 'Welcome. How are you settling in? Has someone explained the daily routine and who your doctor is?';
    if (md.m === 'dc') return 'You go home soon. Any worries about your medicines, belongings or the follow-up visit?';
    return { M: 'Good morning. How did you sleep? Is there anything you need today?', A: 'How has your day been so far? How was lunch?', E: 'How was today? Anything you need before the night?' }[V.k];
  }
  function answers(md) {
    if (md.m === 'confirm') return [['sorted', 'Yes, fixed'], ['still', 'Still a problem'], ['asleep', 'Asleep or busy'], ['out', 'Not in room']];
    if (md.m === 'followup' || md.m === 'serious') return [['good', md.m === 'serious' ? 'Yes, spoken to' : 'Better now'], ['still', md.m === 'serious' ? 'Not yet' : 'Still a problem'], ['asleep', 'Asleep or busy'], ['out', 'Not in room']];
    return [['good', 'All good'], ['notgood', 'Not good'], ['asleep', 'Asleep or busy'], ['out', 'Not in room']];
  }
  var COL = { good: ['#067647', '#ECFDF3'], sorted: ['#067647', '#ECFDF3'], notgood: ['#B42318', '#FEF3F2'], still: ['#B42318', '#FEF3F2'], asleep: ['#334155', '#EEF2F7'], out: ['#334155', '#EEF2F7'] };
  var LV = { 3: ['#B42318', '#FECDCA', '#FEF3F2'], 2: ['#B54708', '#FEDF89', '#FFFAEB'], 1: ['#1D5FD1', '#D6E2FB', '#F1F5FF'] };
  var prevCat = function (md) { return md.m === 'followup' ? (md.x.cat || catGuess(md.x.topic || md.x.words)) : md.g ? catGuess(md.g.cat + ' ' + md.g.title) : ''; };
  var noteOf = function (p) { if (V.edited) return V.note; var d = (X.state.drafts || {})[p.id]; return d || V.note || ''; };

  /* section 4: what each answer does on Save */
  function route(B, p, md) {
    var o = V.out, raise = o === 'notgood' || o === 'still', c = catBy(V.cat || (o === 'still' ? prevCat(md) : '')), L = [];
    var nx = NEXT[V.k];
    if (raise && c) {
      if (o === 'still' && md.g) L.push(['#1D5FD1', md.g.id + ' reopens with ' + (md.g.owner || ownerText(c, p)) + ', and GM Operations is added.']);
      else L.push(['#1D5FD1', 'New grievance to ' + ownerText(c, p) + '. Reply due in ' + c.sla + ' h.' + (o === 'still' ? ' GM Operations is added.' : '')]);
      if (c.alert) L.push(['#B42318', 'Severity set to Serious. Shows red on Today and in Reports, and Mr. S. Chandra is told now.']);
      var n7 = (B.S.ent || []).filter(function (e) { return e.kind === 'grievance' && e.rcat === c.id && String(e.floor || '') === String(p.floor || '') && Date.now() - e.t0 < 7 * 864e5; }).length;
      if (n7 >= 2) L.push(['#B54708', c.label + ' has come up ' + (n7 + 1) + ' times on this floor this week. Flagged as a repeat issue for GM Operations.']);
      L.push(['#067647', 'Added to ' + nx + ' round to check again.']);
    } else if (o === 'sorted') L.push(['#067647', md.g.id + ' closes as "Confirmed with patient". The owner gets the credit.']);
    else if (o === 'good' && md.m === 'serious') L.push(['#1D5FD1', md.g.id + ' gets a note that the patient has been spoken to. It stays open until the owner logs a reply.']);
    else if (o === 'asleep' || o === 'out') {
      L.push(['#475569', 'Moves to the top of ' + nx + ' round. Never counts as seen.']);
      if ((p.__r || []).some(function (x) { return x.m === 'missed'; })) L.push(['#B54708', 'Second round in a row missed, so the nursing in-charge is told.']);
    } else if (o === 'good') {
      L.push(['#067647', 'Saved as all good. Nothing else to do.']);
      if (md.m === 'new') L.push(['#B54708', 'Family meeting still to log. It stays on Today.']);
      if (md.m === 'followup') L.push(['#067647', 'The earlier "not good" closes as sorted.']);
    }
    return L;
  }
  function save(next) {
    var B = build(), p = B.L.filter(function (x) { return x.id === V.pid; })[0]; if (!p) return;
    var md = modeOf(p), o = V.out, raise = o === 'notgood' || o === 'still', cid = V.cat || (o === 'still' ? prevCat(md) : ''), c = catBy(cid);
    if (!o) { X.toast('Pick an answer first'); return; }
    if (raise && !c) { X.toast('Pick what it is about'); return; }
    var D = B.D, S = B.S, t0 = Date.now(), by = X.me() || 'Patient experience', room = roomOf(p), note = noteOf(p).trim(), msg = [];
    var log = function (kind, text, id) { S.log.unshift({ t: t0, patient: p.name, room: room, kind: kind, text: text, src: 'Rounds', id: id }); };
    var rec = { a: raise ? 'notgood' : (o === 'asleep' || o === 'out') ? 'na' : 'good', o: o, at: t0, by: by };
    if (raise) {
      var ser = c.alert;
      if (o === 'still' && md.g) {
        gPatch(S, md.g.id, { status: 'Open', g2: 1, latest: 'Still a problem, said on the ' + SLOT[V.k].toLowerCase() + ' round' + (note ? ': "' + note + '"' : '') + '. GM Operations added.', latestBy: by, latestAt: t0, escalatedTo: 'GM Operations' });
        (S.ent || []).forEach(function (e) { if (e.id === md.g.id && !/GM Operations/.test(e.owner || '')) e.owner = (e.owner || '') + ' and GM Operations'; });
        log('grievance', md.g.id + ' reopened on the round: still a problem', md.g.id); msg.push(md.g.id + ' reopened'); rec.gid = md.g.id;
      } else {
        var e = { kind: 'grievance', id: X.nextId('G'), patient: p.name, room: room, title: c.label + (note ? ' · "' + note + '"' : ' · raised on the ' + SLOT[V.k].toLowerCase() + ' round'),
          owner: c.owner + (o === 'still' ? ' and GM Operations' : ''), cat: c.label, rcat: c.id, safety: ser, sev: ser ? 'Serious' : '', lim: c.sla * H, floor: p.floor, t0: t0, by: by, src: 'Rounds', queued: !navigator.onLine };
        S.ent.unshift(e); log('grievance', e.title, e.id);
        if (ser) S.saf.unshift({ id: e.id, patient: p.name, room: room, what: e.title, t0: t0, last: t0, n: 1, ack: false });
        if (e.queued) S.queue.push(e.id);
        if (c.id === 'leave') { var dm = X.jget('px_dama', {}); dm[p.name] = t0; X.jset('px_dama', dm); }
        msg.push(e.id + ' sent to ' + c.owner + (ser ? '. Mr. S. Chandra told' : ''));
        rec.gid = e.id;
      }
      rec.cat = c.id; rec.topic = c.label; rec.words = note;
      D.flags[p.id] = { open: true, since: t0, round: V.k };
    } else if (o === 'sorted') {
      gPatch(S, md.g.id, { status: 'Closed', g2: 4, latest: 'Confirmed with patient on the ' + SLOT[V.k].toLowerCase() + ' round', latestBy: by, latestAt: t0 });
      log('grievance', md.g.id + ' confirmed fixed with the patient', md.g.id); msg.push(md.g.id + ' closed');
    } else if (o === 'good') {
      if (md.m === 'serious') gPatch(S, md.g.id, { latest: 'Patient says they have been spoken to (' + SLOT[V.k].toLowerCase() + ' round)', latestBy: by, latestAt: t0 });
      if (D.flags[p.id]) D.flags[p.id].open = false;
      log('log', 'Spoken to on the ' + SLOT[V.k].toLowerCase() + ' round: ' + (md.m === 'serious' ? 'has been spoken to' : md.m === 'followup' ? 'better now' : 'all good') + (note ? ' · "' + note + '"' : ''));
    } else {
      log('log', (o === 'out' ? 'Not in room' : 'Asleep or busy') + ' on the ' + SLOT[V.k].toLowerCase() + ' round. Comes up again on ' + NEXT[V.k] + ' round.');
      if ((p.__r || []).some(function (x) { return x.m === 'missed'; })) {
        var nn = { kind: 'note', id: X.nextId('N'), patient: p.name, room: room, title: 'Not seen on two rounds in a row (' + (o === 'out' ? 'not in room' : 'asleep or busy') + ')', owner: 'Nursing in-charge', cat: 'Rounds', t0: t0, by: by, src: 'Rounds' };
        S.ent.unshift(nn); log('note', nn.title, nn.id); msg.push('nursing in-charge told');
      }
    }
    D.v[p.id] = D.v[p.id] || {}; D.v[p.id][V.k] = rec;
    if (X.state.drafts) delete X.state.drafts[p.id];
    X.jset(X.RV, D); X.jset(X.KEY, S);
    try { window.PXRounds && window.PXRounds.read(); } catch (e) {}
    X.toast(p.name.split(' ')[0] + ' saved.' + (msg.length ? ' ' + msg.join(', ') + '.' : '') + (!navigator.onLine ? ' No signal: kept on this device.' : ''));
    var B2 = build(), nx = B2.walk.filter(function (x) { return !res(B2, x) && x.id !== p.id; })[0];
    reset();
    if (next && nx) open(nx.id); else if (next && !nx) { V.screen = 'summary'; draw(); } else { V.screen = V.mob ? 'list' : 'patient'; draw(); }
  }
  var reset = function () { V.out = ''; V.cat = ''; V.note = ''; V.edited = false; V.marks = {}; };
  function open(id) { reset(); V.pid = id; V.screen = 'patient'; X.state.sel = id; try { window.RV2.open(id); } catch (e) { draw(); } }

  function sendRoom() {
    var B = build(), p = B.L.filter(function (x) { return x.id === V.pid; })[0]; if (!p) return;
    var S = B.S, D = B.D, room = roomOf(p), t0 = Date.now(), by = X.me() || 'Patient experience', n = 0, saf = 0;
    ROOM.forEach(function (g) {
      g[3].forEach(function (it) {
        if (!V.marks[it[0]]) return; n++;
        var ser = g[0] === 'safety', ri = { id: X.nextId('RI'), room: room, what: it[1], team: g[2], st: 'open', t0: t0, lim: (ser ? 1 : 4) * H, by: by, safety: ser, fl: p.floor };
        S.iss.unshift(ri); S.log.unshift({ t: t0, patient: '', room: room, kind: 'room', text: it[1] + ' · sent to ' + g[2], src: 'Rounds', id: ri.id });
        if (ser) { saf++; S.saf.unshift({ id: ri.id, patient: '', room: room, what: it[1], t0: t0, last: t0, n: 1, ack: false }); }
      });
    });
    D.rooms = D.rooms || {}; D.rooms[room] = { by: by, at: t0, n: n };
    X.jset(X.RV, D); X.jset(X.KEY, S);
    X.toast(n ? n + ' room issue' + (n > 1 ? 's' : '') + ' sent to the teams.' + (saf ? ' Safety: Mr. S. Chandra told.' : '') : 'Room ' + room + ' checked: fine.');
    V.marks = {}; V.screen = 'patient'; draw();
  }

  /* 24 Nov (owner: "doesn't look same"): markup follows the design file closely. Two panes, each scrolling on its own:
     left = round header + See first + Walk order + End round / Next; right = white patient band, grey body, sticky save bar. */
  var GL = function (t) { return '<div class="r3-gl">' + t + '</div>'; };
  var band = function (inner) { return '<div class="r3-band">' + inner + '</div>'; };
  var bodyW = function (inner) { return '<div class="r3-body">' + inner + '</div>'; };
  var foot = function (inner) { return '<div class="r3-foot">' + inner + '</div>'; };
  var prefNote = function (p) {
    try { var a = JSON.parse(localStorage.getItem('px_prefs_v2') || '{}') || {}, o = a[p.id] || a[p.name]; if (!o || typeof o !== 'object') return ''; var v = Object.keys(o).filter(function (k) { return k.indexOf('__') !== 0 && typeof o[k] === 'string' && o[k].trim(); }).map(function (k) { return o[k].trim(); }); return v.slice(0, 2).join('. '); } catch (e) { return ''; }
  };

  function roomScreen(B, p) {
    var room = roomOf(p), rc = (B.D.rooms || {})[room], due = V.k === 'M' && !rc;
    var openIss = (B.S.iss || []).filter(function (x) { return x.room === room && x.st !== 'done' && x.st !== 'closed'; });
    var n = Object.keys(V.marks).filter(function (k) { return V.marks[k]; }).length;
    var h = band('<button class="r3-lnk" onclick="RV3.back()">Back to ' + esc(room) + '</button><div class="r3-big">Room check · ' + esc(room) + '</div>' +
      '<div class="r3-ban" style="' + (due ? 'color:#B54708;background:#FFFAEB' : 'color:#334155;background:#EEF2F7') + '">' + (due ? 'Due now: first room check of the day. Takes under a minute.' : rc ? 'Checked today by ' + esc(rc.by) + ' at ' + hhmm(rc.at) + '. Only tap if you see something new.' : 'Not checked today yet. Only tap what is wrong.') + '</div>');
    var b = '<div class="r3-mut">Everything counts as fine unless you tap it.</div>';
    ROOM.forEach(function (g) {
      var ser = g[0] === 'safety';
      b += '<div class="r3-sec"><div class="r3-gl" style="color:' + (ser ? '#B42318' : '#334155') + '">' + g[1] + '</div><div class="r3-box" style="border-color:' + (ser ? '#FECDCA' : '#E2E8F0') + '">' + g[3].map(function (it) {
        var known = openIss.filter(function (x) { return x.what === it[1]; })[0], on = !!V.marks[it[0]];
        return '<button class="r3-it' + (on ? ' on' : '') + (known ? ' kn' : '') + '" ' + (known ? 'disabled' : 'onclick="RV3.mark(\'' + it[0] + '\')"') + '><span>' + esc(it[1]) + (known ? '<small>Already reported ' + hhmm(known.t0) + ', still open with ' + esc(known.team) + '</small>' : '') + '</span><i class="r3-tk' + (on ? ' on' : '') + (known ? ' kn' : '') + '">' + (on ? '✓' : '') + '</i></button>';
      }).join('') + '</div></div>';
    });
    return h + bodyW(b) + '<div class="r3-foot col"><div class="r3-mut">' + (n ? n + ' issue' + (n > 1 ? 's' : '') + ' · each goes to its team with a reply time' : 'Nothing tapped means the room is fine.') + '</div><button class="r3-b r3-pri" onclick="RV3.sendRoom()">' + (n ? 'Send ' + n + ', back to patient' : 'Room is fine, back to patient') + '</button></div>';
  }

  function summary(B) {
    var seen = 0, raised = [], missed = [], t = V.k;
    B.walk.forEach(function (p) {
      var r = res(B, p);
      if (r && r.a !== 'na') seen++;
      if (r && r.gid) { var c = catBy(r.cat) || { label: r.topic || 'Issue', owner: '', sla: '' }; raised.push('<div class="r3-li"><div class="r3-lt" style="color:' + (c.alert ? '#B42318' : '#0F172A') + '"><span>' + esc(roomOf(p)) + ' · ' + esc(c.label) + '</span><small>' + esc(c.owner) + (c.sla ? ' · ' + c.sla + ' h' : '') + '</small></div><div class="r3-mut">' + esc(r.words || 'No note') + '</div></div>'); }
      if (!r || r.a === 'na') missed.push('<div class="r3-li r3-row2"><b>' + esc(roomOf(p)) + ' · ' + esc(p.name) + '</b><span class="r3-mut">' + (!r ? 'Not reached' : r.o === 'out' ? 'Not in room' : 'Asleep or busy') + '</span></div>');
    });
    var rooms = Object.keys(B.D.rooms || {}).reduce(function (a, k) { return a + (B.D.rooms[k].n || 0); }, 0), pc = B.walk.length ? seen / B.walk.length : 1;
    var who = esc(B.fl === 'all' ? 'All floors' : flName(B.fl)) + ' · ' + esc(X.me() || X.cfg().alloc[0].name);
    return band('<div class="r3-mut">' + SLOT[t] + ' round · ' + who + '</div><div class="r3-big">Round summary</div>') +
      bodyW('<div class="r3-stats"><div><b>' + seen + '</b><span>Seen</span></div><div><b style="color:#B42318">' + raised.length + '</b><span>Raised</span></div><div><b style="color:#B54708">' + missed.length + '</b><span>Carried over</span></div></div>' +
        '<div class="r3-sec">' + GL('Raised and routed') + '<div class="r3-box">' + (raised.join('') || '<div class="r3-li r3-mut">Nothing raised on this round.</div>') + '</div></div>' +
        '<div class="r3-sec">' + GL('Carried to the next round automatically') + '<div class="r3-box">' + (missed.join('') || '<div class="r3-li r3-mut">Everyone was seen.</div>') + '</div></div>' +
        '<div class="r3-sec">' + GL('Done for you') + '<div class="r3-card2">' +
        '<div>' + missed.length + ' patient' + (missed.length === 1 ? '' : 's') + ' go to the top of ' + NEXT[t] + ' round.</div>' +
        '<div>' + raised.length + ' grievance' + (raised.length === 1 ? '' : 's') + ' sent with owners and reply times. ' + rooms + ' room issue' + (rooms === 1 ? '' : 's') + ' sent.</div>' +
        '<div>' + (pc < 0.85 ? 'Round under 85% seen, so it shows as amber in Reports.' : 'Round 85% or more seen, counts as on time in Reports.') + '</div></div></div>') +
      foot('<button class="r3-b" onclick="RV3.back()">Back to round</button>');
  }

  function detail(B) {
    var p = B.L.filter(function (x) { return x.id === V.pid; })[0] || B.walk.filter(function (x) { return !res(B, x); })[0] || B.walk[0];
    if (!p) return bodyW('<div class="r3-mut">' + (X.mineOf().length ? 'Nobody on this round.' : 'No patients are allocated to you yet. Ask the admin to set the allocation in Setting.') + '</div>');
    V.pid = p.id;
    if (V.screen === 'room') return roomScreen(B, p);
    var md = modeOf(p), r0 = res(B, p), v = B.D.v[p.id] || {}, c = X.cfg(), room = roomOf(p), rc = (B.D.rooms || {})[room];
    var raise = V.out === 'notgood' || V.out === 'still', catSel = V.cat || (V.out === 'still' ? prevCat(md) : '');
    var WORD = { good: 'All good', sorted: 'Confirmed fixed', notgood: 'Not good', still: 'Still a problem', asleep: 'Not seen, was asleep or busy', out: 'Not seen, not in room', tell: 'Wanted to tell us', na: 'Not seen' };
    var hist = ['M', 'A', 'E'].filter(function (k) { return v[k]; }).map(function (k) { var e = v[k]; return [SLOT[k], (WORD[e.o || e.a] || e.a) + (e.words ? ': "' + e.words + '"' : e.topic ? ' · ' + e.topic : '')]; });
    var pk = PREV[V.k];
    if (pk && !v[pk]) hist.unshift([SLOT[pk], onR(p, pk) ? (X.passed(pk) ? 'Not seen' : 'Not seen yet') : 'Not on that round']);
    if (!hist.length) hist.push(['Last round', +p.day <= 1 ? 'Admitted ' + (+p.day === 0 ? 'today' : 'yesterday') : 'Nothing logged today']);
    var G = p.__g || [];
    hist.push(['Open', G.length ? G.map(function (g) { return g.id + ' · ' + g.title + (g.fixed ? ' · marked fixed' : ' · with ' + (g.owner || 'owner')); }).join('\n') : 'Nothing open']);
    hist.push(['Note', prefNote(p) || 'No preferences logged yet']);
    var idx = B.walk.indexOf(p) + 1;
    var h = band('<div class="r3-bt">' + (V.mob ? '<button class="r3-lnk" onclick="RV3.back()">Back to round</button>' : '') + '<span class="r3-mut">' + idx + ' of ' + B.walk.length + '</span><button class="r3-sb' + (V.k === 'M' && !rc ? ' r3-due' : '') + '" onclick="RV3.room()">' + (rc ? 'Room checked' : V.k === 'M' ? 'Room check due' : 'Room check') + '</button></div>' +
      '<div class="r3-big">' + esc(room) + ' · ' + esc(p.name) + (c.vvip[p.id] ? ' <span class="r3-tag">VVIP</span>' : '') + '</div>' +
      '<div class="r3-mut">Day ' + esc(p.day) + (p.doctor ? ' · ' + esc(p.doctor) : '') + (p.psych ? ' · ' + esc(p.psych) + ' (psychologist)' : '') +
      ' <span class="r3-links"><button onclick="RV2.record()">Open record</button><button onclick="RV2.vvip()">' + (c.vvip[p.id] ? 'Remove VVIP' : 'Mark VVIP') + '</button></span></div>');
    var b = '';
    if ((p.__r || []).length) b += '<div class="r3-sec">' + GL('Why on this round') + p.__r.map(function (x) { return '<div class="r3-why" style="color:' + LV[x.lvl][0] + ';background:' + LV[x.lvl][2] + '">' + esc(x.text) + '</div>'; }).join('') + '</div>';
    b += '<div class="r3-card2">' + GL('Since the last round') + hist.map(function (x) { return '<div class="r3-kv"><span>' + esc(x[0]) + '</span><span>' + esc(x[1]).replace(/\n/g, '<br>') + '</span></div>'; }).join('') + '</div>';
    if (rc && rc.n) b += '<div class="r3-ok">Room check sent: ' + rc.n + ' issue' + (rc.n > 1 ? 's' : '') + ' routed to the right teams.</div>';
    if (r0) b += '<div class="r3-ok">Saved on this round at ' + hhmm(r0.at) + '. Answer again only if something changed.</div>';
    b += '<div class="r3-sec">' + GL('Ask · chosen for this patient') + '<div class="r3-q">' + esc(ask(p, md)) + '</div><div class="r3-ans">' + answers(md).map(function (a) {
      var on = V.out === a[0], cc = COL[a[0]];
      return '<button style="color:' + cc[0] + ';' + (on ? 'border:2px solid ' + cc[0] + ';background:' + cc[1] + ';font-weight:700' : '') + '" onclick="RV3.out(\'' + a[0] + '\')">' + a[1] + '</button>';
    }).join('') + '</div></div>';
    if (raise) {
      b += '<div class="r3-sec">' + GL('What is it about?') + /* 25 Nov (Nikita): all categories in one row, serious ones red, no headings (the Save box says Mr. S. Chandra is told) */
        '<div class="r3-chips">' + CATS.map(function (x) {
          return '<button class="' + (x.alert ? 'sr ' : '') + (x.id === catSel ? 'on' : '') + '" onclick="RV3.cat(\'' + x.id + '\')">' + esc(x.label) + '</button>';
        }).join('') + '</div></div>';
    }
    if (V.out && V.out !== 'asleep' && V.out !== 'out' && (!raise || catSel)) {
      var dr = !V.edited && (X.state.drafts || {})[p.id];
      b += '<div class="r3-sec"><label class="r3-gl" for="rvN">In their words</label><textarea id="rvN" rows="3" placeholder="What they said" oninput="RV3.note(this.value)">' + esc(noteOf(p)) + '</textarea>' +
        '<div class="r3-mut">' + (dr ? 'Drafted by the AI scribe. Edit if anything is off.' : V.edited ? 'Edited by you.' : X.SR.on ? 'The AI scribe is listening; its draft appears here.' : 'Type it, or start the AI scribe.') + '</div></div>';
    }
    var R = V.out ? route(B, p, md) : [];
    if (R.length) b += '<div class="r3-card2" style="border-color:' + (catBy(catSel) && catBy(catSel).alert ? '#FDA29B' : '#E2E8F0') + '">' + GL('What happens when you save') + R.map(function (x) { return '<div class="r3-rl"><i style="background:' + x[0] + '"></i><span>' + esc(x[1]) + '</span></div>'; }).join('') + '</div>';
    var can = !!V.out && (!raise || !!catSel), nx = B.walk.filter(function (x) { return !res(B, x) && x.id !== p.id; })[0];
    return h + bodyW(b + '<div class="r3-inl"><button class="r3-b" ' + (can ? '' : 'disabled') + ' onclick="RV3.save(false)">Save</button><button class="r3-b r3-pri" style="flex:1" ' + (can ? '' : 'disabled') + ' onclick="RV3.save(true)">' + (can ? (nx ? 'Save, next: ' + esc(roomOf(nx)) : 'Save and finish') : (V.out ? 'Pick what it is about' : 'Pick an answer')) + '</button></div>');
  }

  function list(B) {
    var st = function (p) {
      var r = res(B, p);
      if (r) { var o = r.o || r.a, cc = COL[o] || COL.asleep; return '<span class="r3-st" style="color:' + cc[0] + ';background:' + cc[1] + '">' + ({ good: 'All good', sorted: 'Closed', notgood: 'Raised', still: 'Escalated', asleep: 'Moved', out: 'Moved', na: 'Moved', tell: 'Raised' }[o] || 'Seen') + '</span>'; }
      if (p.id === V.pid && V.screen !== 'list') return '<span class="r3-st" style="color:#1D5FD1;font-weight:700">Open</span>';
      return '<span class="r3-st" style="color:#475569;font-weight:400">To see</span>';
    };
    var h = '<div class="r3-lh"><span>See first · ' + B.prio.length + '</span><small>Sorted by the rules</small></div><div class="r3-pl">';
    var shut = function (p) { return !!res(B, p) && !(p.id === V.pid && V.screen !== 'list') && !V.showDone; };
    var nDone = B.prio.concat(B.rest).filter(shut).length;
    h += B.prio.filter(function (p) { return !shut(p); }).map(function (p) {
      var sel = !V.mob && p.id === V.pid && V.screen !== 'summary', done = !!res(B, p), t = p.__r[0];
      return '<button class="r3-card' + (done ? ' done' : '') + '" style="border-color:' + (sel ? '#1D5FD1' : LV[p.__s][1]) + ';background:' + (sel ? '#EAF1FE' : done ? '#F8FAFC' : '#fff') + '" onclick="RV3.open(\'' + q(p.id) + '\')"><span class="r3-rm">' + esc(roomOf(p)) + '</span><span class="r3-nm"><b>' + esc(p.name) + '</b><span style="color:' + LV[t.lvl][0] + '">' + esc(t.text) + '</span></span>' + st(p) + '</button>';
    }).join('') || '<div class="r3-mut">Nobody needs to be seen first.</div>';
    h += '</div><div class="r3-lh"><span>Walk order · ' + B.rest.length + '</span><small>Room order</small></div><div class="r3-pl"><div class="r3-box">' + B.rest.filter(function (p) { return !shut(p); }).map(function (p) {
      var sel = !V.mob && p.id === V.pid && V.screen !== 'summary', done = !!res(B, p);
      return '<button class="r3-row" style="background:' + (sel ? '#EAF1FE' : done ? '#F8FAFC' : '#fff') + ';color:' + (done ? '#475569' : '#0F172A') + '" onclick="RV3.open(\'' + q(p.id) + '\')"><span class="r3-rm">' + esc(roomOf(p)) + '</span><span class="r3-nm1">' + esc(p.name) + '</span>' + st(p) + '</button>';
    }).join('') + '</div></div>';
    if (nDone || V.showDone) h += '<button class="r3-fold" onclick="RV3.toggleDone()">' + (V.showDone ? 'Hide the patients already seen' : 'Seen this round: ' + nDone + ' (tap to show)') + '</button>';
    return h;
  }

  function view() {
    if (!V.k) V.k = X.curRound();
    X.state.round = V.k;
    var B = build(), c = X.cfg(), cur = X.me() || c.alloc[0].name;
    var done = B.walk.filter(function (p) { return res(B, p); }), seen = done.filter(function (p) { return res(B, p).a !== 'na'; }).length, raised = done.filter(function (p) { return res(B, p).gid; }).length;
    var left = B.walk.length - done.length, firstOpen = B.walk.filter(function (p) { return !res(B, p); })[0];
    var showList = !V.mob || V.screen === 'list', showDet = !V.mob || V.screen !== 'list';
    var mic = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0M12 17v5"></path></svg>';
    var head = '<div class="r3-head"><div class="r3-hr"><div><div class="r3-title">' + SLOT[V.k] + ' round</div><div class="r3-sub">' + new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + esc(B.fl === 'all' ? 'All floors' : flName(B.fl)) + ' · ' + esc(cur) + ' · ' + B.walk.length + ' patients</div></div>' +
      (V.k === X.curRound() ? '<span class="r3-pill">Picked by time</span>' : '<button class="r3-pill" onclick="RV3.slot(\'' + X.curRound() + '\')">Back to ' + SLOT[X.curRound()].toLowerCase() + '</button>') + '</div>' +
      '<div class="r3-ctl"><div class="r3-seg">' + ['M', 'A', 'E'].map(function (k) { return '<button class="' + (V.k === k ? 'on' : '') + '" onclick="RV3.slot(\'' + k + '\')">' + SLOT[k] + '</button>'; }).join('') + '</div>' +
      '<select onchange="RV3.floor(this.value)" aria-label="Floor"><option value="all">All floors</option>' + B.FL.map(function (f) { return '<option value="' + esc(f) + '"' + (B.fl === f ? ' selected' : '') + '>' + esc(flName(f)) + '</option>'; }).join('') + '</select>' +
      (X.me() ? '' : '<select onchange="RV2.me(this.value)" aria-label="Doing the round">' + c.alloc.map(function (a) { return '<option' + (a.name === cur ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join('') + '</select>') + '</div>' +
      '<div class="r3-bar"><i style="width:' + (B.walk.length ? Math.round(done.length / B.walk.length * 100) : 0) + '%"></i></div>' +
      '<div class="r3-t2"><span>' + seen + ' seen · ' + raised + ' raised · ' + left + ' to go</span></div>' +
      '<button class="r3-scr' + (X.SR.on ? ' on' : '') + '" onclick="RV2.scribe()">' + mic + '<span>' + (X.SR.on ? 'AI scribe on. It drafts notes for each patient you open. You confirm. Tap to stop.' : 'AI scribe off. Tap to start. Tell patients first; only text is kept.') + (X.SR.msg ? ' ' + esc(X.SR.msg) : '') + '</span></button></div>';
    var h = '<div class="r3' + (V.mob ? ' mob' : '') + '">';
    if (showList) h += '<div class="r3-left"><div class="r3-scroll">' + head + list(B) + '</div><div class="r3-foot"><button class="r3-b" onclick="RV3.end()">End round</button><button class="r3-b r3-pri" style="flex:1" onclick="' + (firstOpen ? 'RV3.open(\'' + q(firstOpen.id) + '\')' : 'RV3.end()') + '">' + (firstOpen ? 'Next: ' + esc(roomOf(firstOpen)) : 'See summary') + '</button></div></div>';
    if (showDet) h += '<div class="r3-right">' + (V.screen === 'summary' ? summary(B) : detail(B)) + '</div>';
    return h + '</div>';
  }
  function draw(ext) {
    var root = $('root'); if (!root) return;
    if (ext && document.activeElement && document.activeElement.id === 'rvN') return;
    var l0 = document.querySelector('.r3-left .r3-scroll'), sc = l0 ? l0.scrollTop : 0, samePt = V.__lastPid === V.pid && V.__lastScr === V.screen, r0 = document.querySelector('.r3-right'), rs = r0 && samePt ? r0.scrollTop : 0;
    root.innerHTML = view();
    var l = document.querySelector('.r3-left .r3-scroll'); if (l) l.scrollTop = sc;
    var r = document.querySelector('.r3-right'); if (r) r.scrollTop = rs;
    V.__lastPid = V.pid; V.__lastScr = V.screen;
  }

  var css = document.createElement('style');
  css.textContent = 'html,body{margin:0}.r3{display:flex;height:100vh;background:#F4F6FA;color:#0F172A;font-family:Inter,system-ui,sans-serif;font-size:14px;overflow:hidden}' +
    '.r3 button{font-family:inherit;cursor:pointer}.r3-left{width:400px;flex-shrink:0;border-right:1px solid #E2E8F0;display:flex;flex-direction:column;min-height:0;background:#F4F6FA}.r3-scroll{flex:1;min-height:0;overflow-y:auto}' +
    '.r3-inl{display:flex;gap:10px;margin:14px 0 8px}.r3-fold{display:block;width:100%;text-align:left;border:0;background:none;color:#475569;font:inherit;font-size:13.5px;font-weight:600;padding:8px 12px;cursor:pointer}' +
    '.r3-right{flex:1;min-width:0;overflow-y:auto;display:flex;flex-direction:column}' +
    '.r3-head{background:#fff;padding:16px;border-bottom:1px solid #E2E8F0;display:flex;flex-direction:column;gap:10px}.r3-hr{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.r3-title{font-size:20px;font-weight:700}.r3-sub{font-size:12px;color:#475569;margin-top:2px}' +
    '.r3-pill{font-size:11px;font-weight:600;color:#1D5FD1;background:#EAF1FE;padding:4px 8px;border-radius:99px;border:0;white-space:nowrap}' +
    '.r3-ctl{display:flex;gap:6px;flex-wrap:wrap}.r3-ctl select{height:30px;border:1px solid #CBD5E1;border-radius:8px;padding:0 6px;font:inherit;font-size:12px;background:#fff;max-width:130px}' +
    '.r3-seg{display:flex;gap:2px;border:1px solid #CBD5E1;border-radius:8px;padding:2px;background:#fff}.r3-seg button{height:24px;padding:0 9px;border:0;border-radius:6px;background:transparent;font-size:12px;font-weight:600;color:#334155}.r3-seg button.on{background:#1D5FD1;color:#fff}' +
    '.r3-bar{height:6px;background:#E2E8F0;border-radius:99px;overflow:hidden}.r3-bar i{display:block;height:6px;background:#1D5FD1}.r3-t2{display:flex;justify-content:space-between;font-size:12px;color:#475569}' +
    '.r3-scr{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:#F1F5FF;border:1px solid #D6E2FB;font-size:12px;color:#1E3A8A;text-align:left;line-height:1.4}.r3-scr svg{color:#1D5FD1;flex-shrink:0}.r3-scr.on{background:#FEF3F2;border-color:#FDA29B;color:#B42318}.r3-scr.on svg{color:#B42318}' +
    '.r3-lh{padding:14px 16px 4px;display:flex;justify-content:space-between;align-items:baseline}.r3-lh span{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#334155}.r3-lh small{font-size:11px;color:#475569}' +
    '.r3-pl{padding:6px 16px;display:flex;flex-direction:column;gap:8px}.r3-pl:last-child{padding-bottom:16px}' +
    '.r3-card{display:flex;gap:10px;align-items:center;text-align:left;width:100%;min-height:64px;border:1px solid;border-radius:12px;padding:10px 12px;color:#0F172A}.r3-card.done{opacity:.6}' +
    '.r3-rm{width:50px;flex-shrink:0;font-size:15px;font-weight:700}.r3-row .r3-rm{font-size:14px}.r3-nm{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.r3-nm b{font-size:14px;font-weight:600}.r3-nm span{font-size:12px;line-height:1.35;font-weight:600}.r3-nm1{flex:1;font-size:14px}' +
    '.r3-st{font-size:11px;font-weight:600;padding:3px 8px;border-radius:99px;flex-shrink:0}' +
    '.r3-box{background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}.r3-row{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:0 12px;border:0;border-bottom:1px solid #EEF2F7;text-align:left}.r3-row:last-child{border-bottom:0}' +
    '.r3-foot{margin-top:auto;position:sticky;bottom:0;background:#fff;border-top:1px solid #E2E8F0;padding:12px 16px 16px;display:flex;gap:10px}.r3-foot.col{flex-direction:column;gap:6px}' +
    '.r3-b{height:48px;border-radius:12px;border:1px solid #CBD5E1;background:#fff;font-size:15px;font-weight:600;padding:0 16px;color:#0F172A;white-space:nowrap}.r3-b:disabled{opacity:.45;cursor:default}.r3-pri{border:0;background:#1D5FD1;color:#fff}.r3-pri:disabled{background:#94A3B8;opacity:1}' +
    '.r3-band{background:#fff;padding:12px 16px 14px;border-bottom:1px solid #E2E8F0;display:flex;flex-direction:column;gap:8px}.r3-bt{display:flex;justify-content:space-between;align-items:center;gap:8px}.r3-big{font-size:22px;font-weight:700}' +
    '.r3-sb{height:36px;padding:0 12px;border-radius:8px;border:1px solid #CBD5E1;background:#fff;font-size:13px;font-weight:600;color:#0F172A}.r3-due{border-color:#F79009;color:#B54708;background:#FFFAEB}' +
    '.r3-lnk{align-self:flex-start;height:32px;border:0;background:transparent;font-size:14px;font-weight:600;color:#1D5FD1;padding:0}' +
    '.r3-links button{border:0;background:none;color:#1D5FD1;font-size:13px;font-weight:600;padding:0 0 0 10px}' +
    '.r3-mut{font-size:13px;color:#475569;line-height:1.4}.r3-tag{font-size:11px;font-weight:700;border-radius:99px;padding:2px 8px;background:#FFF4D6;color:#93370D;vertical-align:middle}' +
    '.r3-body{padding:14px 16px;display:flex;flex-direction:column;gap:14px}.r3-sec{display:flex;flex-direction:column;gap:6px}.r3-gl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#334155}' +
    '.r3-why{font-size:13px;line-height:1.4;font-weight:600;padding:8px 10px;border-radius:8px}' +
    '.r3-card2{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:1.45}.r3-kv{display:flex;gap:8px;font-size:13px;line-height:1.4}.r3-kv span:first-child{color:#475569;width:76px;flex-shrink:0}' +
    '.r3-ok{font-size:13px;color:#067647;background:#DCFAE6;border-radius:10px;padding:10px 12px}' +
    '.r3-q{font-size:16px;line-height:1.45;font-weight:500}.r3-ans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.r3-ans button{height:52px;border-radius:12px;border:1px solid #CBD5E1;background:#fff;font-size:15px;font-weight:600}' +
    '.r3-cg{display:flex;flex-direction:column;gap:6px}.r3-cg>div:first-child{font-size:12px;font-weight:600;color:#475569}.r3-chips{display:flex;gap:6px;flex-wrap:wrap}.r3-chips button{height:36px;padding:0 12px;border-radius:99px;border:1px solid #CBD5E1;background:#fff;font-size:13px;color:#0F172A}' +
    '.r3-chips button.on{border:2px solid #1D5FD1;background:#EAF1FE;color:#1D5FD1;font-weight:600}.r3-chips button.sr{border-color:#FDA29B;color:#B42318}.r3-chips button.sr.on{border:2px solid #B42318;background:#FEF3F2}' +
    '.r3-body textarea{min-height:70px;border-radius:12px;border:1px solid #CBD5E1;padding:10px 12px;font:inherit;font-size:14px;line-height:1.4;resize:vertical;box-sizing:border-box;width:100%}' +
    '.r3-rl{display:flex;gap:8px;font-size:13px;line-height:1.4}.r3-rl i{width:8px;height:8px;border-radius:99px;margin-top:6px;flex-shrink:0}' +
    '.r3-it{min-height:48px;padding:10px 12px;border:0;border-bottom:1px solid #EEF2F7;background:#fff;text-align:left;font-size:14px;display:flex;justify-content:space-between;align-items:center;gap:8px;color:#0F172A}.r3-it:last-child{border-bottom:0}.r3-it.on{background:#FFFAEB;font-weight:600}.r3-it.kn{opacity:.7;cursor:default}.r3-it small{display:block;font-size:11px;color:#B54708;font-weight:400}' +
    '.r3-tk{width:22px;height:22px;border-radius:6px;flex-shrink:0;border:1.5px solid #CBD5E1;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:14px;font-weight:700;color:#fff;box-sizing:border-box}.r3-tk.on{background:#B54708;border-color:#B54708}.r3-tk.kn{background:#FEDF89;border-color:#FEDF89}' +
    '.r3-ban{font-size:12px;line-height:1.4;padding:8px 10px;border-radius:8px}' +
    '.r3-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.r3-stats div{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:12px}.r3-stats b{display:block;font-size:24px}.r3-stats span{font-size:12px;color:#475569}' +
    '.r3-li{padding:12px;border-bottom:1px solid #EEF2F7;display:flex;flex-direction:column;gap:3px}.r3-li:last-child{border-bottom:0}.r3-lt{display:flex;justify-content:space-between;gap:8px;font-size:14px;font-weight:600}.r3-lt small{font-size:12px;font-weight:500;color:#475569}.r3-row2{flex-direction:row;justify-content:space-between;padding:10px 12px;font-size:13px}' +
    '.r3.mob .r3-left{width:100%;border-right:0}';
  document.head.appendChild(css);

  window.RV3 = {
    draw: draw,
    slot: function (k) { V.k = k; reset(); V.screen = V.mob ? 'list' : 'patient'; X.state.round = k; draw(); },
    floor: function (f) { V.floor = f; try { localStorage.setItem('px_rounds_floor', f); } catch (e) {} V.pid = ''; draw(); },
    open: open,
    back: function () { V.screen = V.mob ? 'list' : 'patient'; draw(); },
    out: function (o) { V.out = o; V.cat = ''; draw(); },
    cat: function (c) { V.cat = c; draw(); },
    toggleDone: function () { V.showDone = !V.showDone; draw(); },
    note: function (t) { V.note = t; V.edited = true; },
    room: function () { V.marks = {}; V.screen = 'room'; draw(); },
    mark: function (k) { V.marks[k] = !V.marks[k]; draw(); },
    sendRoom: sendRoom,
    save: save,
    end: function () { var D = X.day(); D.ended = D.ended || {}; D.ended[V.k] = Date.now(); X.jset(X.RV, D); V.screen = 'summary'; draw(); }
  };
  window.addEventListener('resize', function () { var m = window.innerWidth < 720; if (m !== V.mob) { V.mob = m; if (!m && V.screen === 'list') V.screen = 'patient'; draw(); } });
  if (!V.mob) V.screen = 'patient';
  draw();
})();
