/* 18 Nov 2026, Trello "Patient experience: Rounds tab (3 rounds a day, allocated patients, list view)" (reworked 17 Nov). Loaded after the old room-by-room screen,
   which it replaces. Each person sees only the patients allocated to them; three rounds a day with rules for who is on which; a list with a visit panel beside it.
   Everything a visit produces goes through the same entries the old screen wrote (localStorage px_rounds_v1: entries, safety alerts, room issues, log), so Today,
   Grievances, the owners' page and the patient record keep working. Round answers and settings are in px_rounds_v2 / px_rounds_cfg_v2 (shared like every px_ key).
   Phone first: one column, the visit panel takes the whole screen. */
(function () {
  var KEY = 'px_rounds_v1', RV = 'px_rounds_v2', CFG = 'px_rounds_cfg_v2';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var H = 3600000;
  var dayKey = function () { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  var hhmm = function (t) { var d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  var jget = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  var jset = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var DEF = { times: { M: '09:00-11:00', A: '14:00-16:00', E: '18:00-20:00' }, alloc: [{ name: 'Grisham', who: 'nonvvip' }, { name: 'Prabh', who: 'vvip' }, { name: 'Anurag', who: 'all' }], backup: {}, vvip: {} };
  var cfg = function () { var c = jget(CFG, null) || {}; return { times: Object.assign({}, DEF.times, c.times || {}), alloc: (c.alloc && c.alloc.length ? c.alloc : DEF.alloc), backup: c.backup || {}, vvip: c.vvip || {} }; };
  var ROUNDS = [['M', 'Morning', 'How was the night?', 'How was your night? Did you sleep? Anything you need this morning?'],
    ['A', 'Afternoon', 'How did the morning go?', 'How did the morning go? Was what we talked about earlier sorted?'],
    ['E', 'Evening', 'How was your day?', 'How was your day? Is there anything before tonight?']];
  var ANS = [['good', 'All good', '#067647', '#ECFDF3'], ['notgood', 'Not good', '#B42318', '#FEF3F2'], ['tell', 'Wants to tell us', '#B54708', '#FFFAEB'], ['na', 'Not available', '#475467', '#F2F4F7']];
  var GOES = { Food: 'Kitchen supervisor · 4 h', Room: 'Housekeeping supervisor · 4 h', Sleep: 'Nursing in-charge · 4 h', 'Family and calls': 'Psychologist · 6 h', Staff: 'Patient experience lead · 6 h', Treatment: 'Treating psychiatrist · 6 h', 'Other patients': 'Nursing in-charge · 6 h', 'Belongings and laundry': 'Housekeeping supervisor · 6 h', Activities: 'Patient experience (you) · 6 h', 'Leaving or rights': 'Treating psychiatrist now, DAMA flag on Today', 'Something else': 'Patient experience (you) · 6 h' };
  var gAB = function () { return typeof AB !== 'undefined' ? AB : []; };
  var gTODAY = function () { return typeof TODAY !== 'undefined' ? TODAY : []; };
  var P = function () { return (window.HMS_PATIENTS && window.HMS_PATIENTS.patients) || []; };
  var me = function () { try { return localStorage.getItem('pxme') || ''; } catch (e) { return ''; } };
  var state = { v: 'all', sel: '', round: '', topic: '', sp: '', words: '', ans: '', room: '', roomOpen: false, scribe: null };
  var day = function () { var s = jget(RV, null); if (!s || s.day !== dayKey()) s = { day: dayKey(), v: {}, flags: (s && s.flags) || {} }; return s; };
  var curRound = function () { var h = new Date().getHours(); return h < 13 ? 'M' : h < 17 ? 'A' : 'E'; };
  var mineOf = function () {
    var c = cfg(), a = c.alloc.filter(function (x) { return x.name === me(); })[0] || c.alloc[0];
    return P().filter(function (p) { var vip = !!c.vvip[p.id]; return a.who === 'all' || (a.who === 'vvip' ? vip : !vip); });
  };
  var seenIn = function (D, p, r) { return D.v[p.id] && D.v[p.id][r]; };
  /* 19 Nov: a full ward has ONE round a day per patient (thirds by floor and room, about 30 at a time), not everyone every morning. */
  var split = function () { return P().length > 30; };
  var slotCache = { key: '', m: {} };
  var slotOf = function (p) {
    var L = P(), key = L.length + ':' + (L[0] ? L[0].id : '') + ':' + (L[L.length - 1] ? L[L.length - 1].id : '') + ':' + new Date().toDateString();
    if (slotCache.key !== key) {
      var S2 = L.slice().sort(function (a, b) { return String(a.floor || '').localeCompare(String(b.floor || '')) || String(a.room || '').localeCompare(String(b.room || ''), undefined, { numeric: true }) || String(a.name).localeCompare(String(b.name)); });
      slotCache = { key: key, m: {} };
      /* 23 Nov (Nikita): at most 30 patients in a round. Up to 90 patients: thirds as before. More than 90: groups of at most 30
         (by floor and room), and today's morning, afternoon and evening take the next three groups in turn, so everyone gets a
         round every few days and no round is over 30. */
      var G = Math.ceil(S2.length / 30);
      if (G <= 3) S2.forEach(function (x, i) { slotCache.m[x.id] = ['M', 'A', 'E'][Math.min(2, Math.floor(i * 3 / S2.length))]; });
      else {
        var sz = Math.ceil(S2.length / G), t = new Date(), day = Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 864e5), gs = {};
        ['M', 'A', 'E'].forEach(function (k, j) { gs[(day * 3 + j) % G] = k; });
        S2.forEach(function (x, i) { slotCache.m[x.id] = gs[Math.floor(i / sz)] || ''; });
      }
    }
    return slotCache.m[p.id] === undefined ? 'M' : slotCache.m[p.id];
  };
  /* who is on which round, and why */
  function why(p, r, D) {
    var c = cfg(), out = [], v = D.v[p.id] || {}, vip = !!c.vvip[p.id], fl = D.flags[p.id];
    var openFlag = fl && fl.open;
    var home = function (n) { if (!p.edd) return false; var d = new Date(); d.setHours(0, 0, 0, 0); return p.edd === new Date(d.getTime() + n * 864e5).toISOString().slice(0, 10); };
    if (split() ? slotOf(p) === r : r === 'M') out.push(vip ? 'VVIP' : 'Allocated to you');
    if (r === 'A') {
      if (+p.day <= 2) out.push('New admission, day ' + p.day);
      if (v.M && (v.M.a === 'notgood' || v.M.a === 'tell')) out.push('Flagged this morning');
      else if (openFlag) out.push('Flagged earlier, not closed');
      if (v.M && v.M.a === 'na') out.push('Not available this morning');
      if (!v.M && passed('M') && (!split() || slotOf(p) === 'M')) out.push('Missed this morning');
      if (home(0)) out.push('Going home today');
      if (vip) out.push('VVIP');
    }
    if (r === 'E') {
      if (openFlag && v.A && (v.A.a === 'notgood' || v.A.a === 'tell')) out.push('Still flagged after the afternoon');
      else if (openFlag && !v.A && passed('A')) out.push('Flagged, not followed up');
      if (v.A && v.A.a === 'na') out.push('Not available this afternoon');
      if (+p.day <= 2) out.push('New admission, day ' + p.day);
      if (home(1)) out.push('Going home tomorrow');
      if (vip) out.push('VVIP');
    }
    return out;
  }
  /* a round counts as missed only once its time is over */
  var passed = function (k) { var e = String((cfg().times[k] || '').split('-')[1] || '23:59').split(':'), n = new Date(); return n.getHours() * 60 + n.getMinutes() >= (+e[0]) * 60 + (+e[1] || 0); };
  var tagsOf = function (p) { var c = cfg(), t = []; if (c.vvip[p.id]) t.push('VVIP'); if (+p.day <= 2) t.push('New'); return t; };
  function listFor(r, D) { return mineOf().map(function (p) { return { p: p, why: why(p, r, D) }; }).filter(function (x) { return x.why.length; }); }
  function statusOf(D, p, r) { var v = D.v[p.id] && D.v[p.id][r]; if (!v) return 'to'; if (v.a === 'good') return 'seen'; if (v.a === 'na') return 'na'; return 'flag'; }

  /* ---------- entries (same shapes as the old screen) ---------- */
  var nextId = function (pre) { var S0 = (typeof S !== 'undefined' ? S : {}); S0.seq = (S0.seq || 150) + 1; return pre + '-' + String(S0.seq).padStart(4, '0'); };
  function ST() { var s = jget(KEY, null); if (!s || typeof s !== 'object') s = { day: dayKey(), rooms: {}, iss: [], ent: [], log: [], queue: [], saf: [] }; ['rooms', 'iss', 'ent', 'log', 'queue', 'saf'].forEach(function (k) { if (!s[k]) s[k] = k === 'rooms' ? {} : []; }); return s; }
  function save() {
    var D = day(), p = P().filter(function (x) { return x.id === state.sel; })[0]; if (!p) return null;
    var r = state.round, a = state.ans; if (!a) { toast('Pick how they are first'); return null; }
    var S = ST(), t0 = Date.now(), made = [], room = String(p.room || '').replace(/^Room\s*/, '');
    var add = function (e) { e.t0 = t0; e.by = me() || 'Patient experience'; e.src = 'Rounds'; e.queued = !navigator.onLine; S.ent.unshift(e); S.log.unshift({ t: t0, patient: e.patient, room: e.room, kind: e.kind, text: e.title, src: 'Rounds', id: e.id }); if (e.safety) S.saf.unshift({ id: e.id, patient: e.patient, room: e.room, what: e.title, t0: t0, last: t0, n: 1, ack: false }); if (e.queued) S.queue.push(e.id); made.push(e); };
    var rec = { a: a, at: t0 };
    if (a === 'good') S.log.unshift({ t: t0, patient: p.name, room: room, kind: 'log', text: 'Spoken to on the ' + r + ' round: all good', src: 'Rounds' });
    else if (a === 'na') S.log.unshift({ t: t0, patient: p.name, room: room, kind: 'log', text: 'Not available this round (asleep, in a session or not up to it). Comes up again.', src: 'Rounds' });
    else {
      var topic = state.topic, T = gAB().filter(function (x) { return x[0] === topic; })[0];
      if (!T) { toast('Pick what it is about'); return null; }
      var sp = state.sp, words = (state.words || '').trim();
      if (!sp) { toast('Pick the exact issue'); return null; }
      if (!words) { toast('Write what they said, in their words'); return null; }
      var safe = !!(T[4] && T[4].indexOf(sp) >= 0), leaving = sp === 'Wants to leave now';
      var owner = safe ? 'Chandraji and the treating doctor' : sp === 'Billing question' ? 'Billing desk' : sp === 'Wants to make a formal complaint' ? 'Kanika and Chandraji' : leaving ? 'Treating psychiatrist and Chandraji' : T[1];
      var title = topic + ': ' + sp + ' · "' + words + '"';
      if (topic === 'Sleep') add({ kind: 'note', id: nextId('N'), patient: p.name, room: room, title: title, owner: 'Nursing in-charge', cat: T[2] });
      else if (topic === 'Activities') add({ kind: 'request', id: nextId('Q'), patient: p.name, room: room, title: title, owner: 'Patient experience (you)', cat: T[2] });
      else add({ kind: 'grievance', id: nextId('G'), patient: p.name, room: room, title: title, owner: owner, cat: safe ? 'Safety' : T[2], safety: safe || leaving, lim: safe || leaving ? 0 : 6 * H, topic: topic, sp: sp, floor: p.floor });
      rec.topic = topic; rec.sp = sp; rec.words = words;
      if (leaving) { var dm = jget('px_dama', {}); dm[p.name] = t0; jset('px_dama', dm); }
      D.flags[p.id] = { open: true, since: t0, round: r };
    }
    if (a === 'good' && D.flags[p.id]) D.flags[p.id].open = false;
    /* a room issue, if one was reported */
    if (state.room) {
      var x = gTODAY().filter(function (y) { return y[0] === state.room; })[0];
      if (x) { var ri = { id: nextId('RI'), room: room, what: x[0], team: x[1], st: 'open', t0: t0, lim: 4 * H, by: me() || 'Patient experience', safety: !!x[2], fl: p.floor }; S.iss.unshift(ri); S.log.unshift({ t: t0, patient: '', room: room, kind: 'room', text: x[0] + ' · sent to ' + x[1], src: 'Rounds', id: ri.id }); if (ri.safety) S.saf.unshift({ id: ri.id, patient: '', room: room, what: x[0], t0: t0, last: t0, n: 1, ack: false }); rec.room = x[0]; made.push(ri); }
    }
    D.v[p.id] = D.v[p.id] || {}; D.v[p.id][r] = rec;
    jset(RV, D); jset(KEY, S);
    try { window.PXRounds && window.PXRounds.read(); } catch (e) {}
    var g = made.filter(function (e) { return e.kind === 'grievance'; }), sg = made.filter(function (e) { return e.safety; });
    toast(p.name.split(' ')[0] + ' saved.' + (g.length ? ' ' + g[0].id + ' sent to ' + g[0].owner + '.' : '') + (sg.length ? ' Safety: Chandraji told.' : '') + (!navigator.onLine ? ' No signal: kept on this device.' : ''));
    return p;
  }
  function toast(m) { var t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0F172A;color:#fff;padding:12px 18px;border-radius:12px;z-index:90;max-width:90vw;font-size:14px'; document.body.appendChild(t); } t.textContent = m; t.style.display = 'block'; clearTimeout(t._t); t._t = setTimeout(function () { t.style.display = 'none'; }, 4200); }

  /* ---------- screens ---------- */
  var css = document.createElement('style');
  css.textContent = '.rv{padding:16px;display:flex;flex-direction:column;gap:12px}.rv-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.rv-card{background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:12px 14px;text-align:left;cursor:pointer;font:inherit}.rv-card.on{border-color:#1E6CDB;box-shadow:0 0 0 2px #E8F1FE}.rv-card b{font-size:15px}.rv-card .t{font-size:12px;color:#667085}.rv-bar{height:6px;background:#EEF2F6;border-radius:99px;margin-top:8px}.rv-bar i{display:block;height:6px;border-radius:99px;background:#1E6CDB}' +
    '.rv-fl{display:flex;gap:6px;flex-wrap:wrap}.rv-ch{border:1px solid #D6DEE8;background:#fff;border-radius:99px;padding:5px 13px;font-size:13px;font-weight:600;cursor:pointer}.rv-ch.on{background:#EAF2FF;color:#1E5BB8;border-color:#9EC0F7}' +
    '.rv-main{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:12px;align-items:start}.rv-list{background:#fff;border:1px solid #E3EAF2;border-radius:12px;overflow:hidden}.rv-row{display:grid;grid-template-columns:70px minmax(0,1.3fr) minmax(0,1.2fr) 46px 96px 96px;gap:8px;align-items:center;padding:10px 12px;border-top:1px solid #EEF2F6;cursor:pointer;width:100%;background:none;border-left:0;border-right:0;border-bottom:0;font:inherit;text-align:left}.rv-row:first-child{border-top:0}.rv-row:hover,.rv-row.sel{background:#F5F9FF}.rv-row small{color:#667085;display:block}' +
    '.rv-tag{display:inline-block;font-size:11px;font-weight:700;border-radius:99px;padding:1px 8px;margin-left:5px;background:#FFF4D6;color:#93370D}.rv-tag.n{background:#E8F1FE;color:#1E5BB8}.rv-mae{display:flex;gap:3px}.rv-mae i{width:14px;height:14px;border-radius:4px;background:#EEF2F6;display:block}.rv-mae i.seen{background:#12B76A}.rv-mae i.flag{background:#F04438}.rv-mae i.na{background:#98A2B3}' +
    '.rv-st{font-size:12px;font-weight:700;border-radius:99px;padding:2px 10px;justify-self:start}.rv-st.to{background:#EEF2F6;color:#475467}.rv-st.seen{background:#ECFDF3;color:#067647}.rv-st.flag{background:#FEF3F2;color:#B42318}.rv-st.na{background:#F2F4F7;color:#475467}' +
    '.rv-pan{background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px;position:sticky;top:8px}.rv-ans{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.rv-a{border:2px solid #E3EAF2;border-radius:12px;padding:12px;font:inherit;font-weight:700;cursor:pointer;background:#fff}.rv-a.on{border-width:2px}.rv-pan h4{margin:0;font-size:12px;letter-spacing:.05em;color:#667085;text-transform:uppercase}' +
    '.rv-pan textarea,.rv-pan select,.rv-pan input[type=text]{width:100%;border:1px solid #D6DEE8;border-radius:10px;padding:8px 10px;font:inherit;box-sizing:border-box}.rv-btns{display:flex;gap:8px;flex-wrap:wrap}.rv-b{border:1px solid #D6DEE8;background:#fff;border-radius:10px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer}.rv-b.pri{background:#1E6CDB;border-color:#1E6CDB;color:#fff}' +
    '@media(max-width:900px){.rv-main{grid-template-columns:1fr}.rv-pan{position:fixed;inset:0;z-index:50;border-radius:0;overflow:auto;top:0}.rv-row{grid-template-columns:56px minmax(0,1fr) 84px}.rv-row .c3,.rv-row .c4,.rv-row .c5{display:none}.rv-cards{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  function cards(D) {
    var c = cfg();
    return '<div class="rv-cards">' + ROUNDS.map(function (r) {
      var L0 = listFor(r[0], D), L = split() ? L0.filter(function (x) { return slotOf(x.p) === r[0]; }) : L0, extra = L0.length - L.length, seen = L.filter(function (x) { return statusOf(D, x.p, r[0]) !== 'to'; }).length, pc = L.length ? Math.round(seen / L.length * 100) : 0;
      return '<button class="rv-card ' + (state.round === r[0] ? 'on' : '') + '" onclick="RV2.round(\'' + r[0] + '\')"><b>' + r[1] + '</b> <span class="t">' + esc((c.times[r[0]] || '').replace('-', ' to ')) + '</span><div>' + seen + ' of ' + L.length + ' seen' + (extra > 0 ? ' <span style="color:#B54708">· +' + extra + ' to follow up</span>' : '') + '</div><div class="rv-bar"><i style="width:' + pc + '%"></i></div></button>';
    }).join('') + '</div>';
  }
  function rows(D) {
    var r = state.round, L = listFor(r, D), q = (state.q || '').toLowerCase();
    L = L.filter(function (x) {
      var s = statusOf(D, x.p, r);
      if (q && x.p.name.toLowerCase().indexOf(q) < 0 && String(x.p.room).toLowerCase().indexOf(q) < 0) return false;
      return state.v === 'all' || (state.v === 'to' && s === 'to') || (state.v === 'seen' && s === 'seen') || (state.v === 'flag' && (s === 'flag' || s === 'na'));
    });
    if (!L.length) return '<div style="padding:18px;color:#667085">' + (mineOf().length ? 'Nobody on this list.' : 'No patients are allocated to you yet. Ask the admin to set the allocation in Setting.') + '</div>';
    return L.map(function (x) {
      var p = x.p, s = statusOf(D, p, r), v = D.v[p.id] || {};
      var mae = ['M', 'A', 'E'].map(function (k) { var st = v[k] ? (v[k].a === 'good' ? 'seen' : v[k].a === 'na' ? 'na' : 'flag') : ''; return '<i class="' + st + '" title="' + k + '"></i>'; }).join('');
      return '<button class="rv-row ' + (state.sel === p.id ? 'sel' : '') + '" onclick="RV2.open(\'' + esc(p.id) + '\')"><span class="c1"><b>' + esc(String(p.room || '').replace(/^Room\s*/, '')) + '</b></span><span class="c2"><b>' + esc(p.name) + '</b>' + tagsOf(p).map(function (t) { return '<span class="rv-tag ' + (t === 'New' ? 'n' : '') + '">' + t + '</span>'; }).join('') + '</span><span class="c3"><small>' + esc(x.why.join(' · ')) + '</small></span><span class="c4">D' + (+p.day) + '</span><span class="c5 rv-mae" aria-label="Morning, afternoon, evening">' + mae + '</span><span class="rv-st ' + s + '">' + ({ to: 'To see', seen: 'Seen', flag: 'Flagged', na: 'Not available' }[s]) + '</span></button>';
    }).join('');
  }
  function panel(D) {
    var p = P().filter(function (x) { return x.id === state.sel; })[0]; if (!p) return '';
    var r = state.round, R = ROUNDS.filter(function (x) { return x[0] === r; })[0], v = D.v[p.id] || {}, c = cfg();
    var earlier = ['M', 'A', 'E'].filter(function (k) { return v[k]; }).map(function (k) { var e = v[k]; return '<div style="font-size:13px"><b>' + ({ M: 'Morning', A: 'Afternoon', E: 'Evening' }[k]) + ' ' + hhmm(e.at) + ':</b> ' + ({ good: 'all good', notgood: 'not good', tell: 'wanted to tell us', na: 'not available' }[e.a]) + (e.topic ? ' · ' + esc(e.topic + ': ' + e.sp) : '') + (e.words ? ' · "' + esc(e.words) + '"' : '') + '</div>'; }).join('');
    var T = gAB().filter(function (x) { return x[0] === state.topic; })[0];
    var step2 = (state.ans === 'notgood' || state.ans === 'tell') ? '<div><h4>Step 2 · what is it about?</h4><div class="rv-fl" style="margin-top:6px">' + gAB().map(function (x) { return '<button class="rv-ch ' + (state.topic === x[0] ? 'on' : '') + '" onclick="RV2.topic(\'' + esc(x[0]).replace(/\'/g, "\\'") + '\')">' + esc(x[0]) + '</button>'; }).join('') + '</div>' +
      (T ? '<div class="rv-fl" style="margin-top:8px">' + (T[3] || []).map(function (o) { return '<button class="rv-ch ' + (state.sp === o ? 'on' : '') + '" onclick="RV2.sp(this.dataset.o)" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div><div style="margin-top:6px;font-size:13px;color:#475467"><b>Goes to:</b> ' + esc(state.sp === 'Wants to leave now' ? GOES['Leaving or rights'] : (T[4] && T[4].indexOf(state.sp) >= 0) ? 'Chandraji and the treating doctor · now' : (GOES[T[0]] || T[1])) + '</div>' : '') +
      '<textarea rows="3" id="rvW" placeholder="What they said, in their words" oninput="RV2.words(this.value)">' + esc(state.words) + '</textarea></div>' : '';
    var dr = state.drafts && state.drafts[p.id];
    var scr = dr ? '<div style="background:#F2F7FF;border:1px solid #D5E4FB;border-radius:10px;padding:8px 10px;font-size:13px"><b>AI scribe draft</b><div style="margin:4px 0">' + esc(dr) + '</div><div class="rv-btns"><button class="rv-b pri" onclick="RV2.useDraft()">Use this</button><button class="rv-b" onclick="RV2.discardDraft()">Discard</button></div></div>'
      : (SR.on ? '<div style="font-size:12px;color:#B42318">● The round scribe is listening to this patient.</div>' : '');
    var roomSel = '<div style="border:2px solid #F79009;background:#FFFAEB;border-radius:12px;padding:10px"><button class="rv-b" style="width:100%;background:#F79009;border-color:#F79009;color:#fff;font-size:15px;padding:12px" onclick="RV2.roomToggle()">' + (state.roomOpen ? 'Hide the issue list' : '⚠ Report an issue (room, food, noise, safety)') + '</button>' + (state.roomOpen ? '<select id="rvRoom" onchange="RV2.room(this.value)" style="margin-top:10px;height:46px;font-size:15px;border:2px solid #F79009"><option value="">Choose the issue…</option>' + gTODAY().map(function (x) { return '<option value="' + esc(x[0]) + '"' + (state.room === x[0] ? ' selected' : '') + '>' + (x[2] ? '[Safety] ' : '') + esc(x[0]) + ' → ' + esc(x[1]) + '</option>'; }).join('') + '</select>' : '') + '</div>';
    return '<aside class="rv-pan" id="rvPan"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b style="font-size:17px">' + esc(p.name) + '</b>' + tagsOf(p).map(function (t) { return '<span class="rv-tag ' + (t === 'New' ? 'n' : '') + '">' + t + '</span>'; }).join('') + '<div style="font-size:13px;color:#667085">Room ' + esc(String(p.room || '').replace(/^Room\s*/, '')) + ' · day ' + (+p.day) + ' · ' + esc(p.doctor || '') + '</div></div><button class="rv-b" onclick="RV2.close()" aria-label="Close">×</button></div>' +
      '<div class="rv-btns"><button class="rv-b" onclick="RV2.record()">Open record</button><button class="rv-b" onclick="RV2.vvip()">' + (c.vvip[p.id] ? 'Remove VVIP' : 'Mark VVIP') + '</button></div>' +
      '<div><h4>Why on this round</h4><div style="font-size:14px">' + esc(why(p, r, D).join(' · ') || 'Allocated to you') + '</div>' + (earlier ? '<div style="margin-top:6px">' + earlier + '</div>' : '') + '</div>' +
      '<div><h4>Step 1 · ask</h4><div style="font-size:15px;margin:4px 0 8px">' + esc(R[3]) + '</div><div class="rv-ans">' + ANS.map(function (a) { return '<button class="rv-a ' + (state.ans === a[0] ? 'on' : '') + '" style="border-color:' + (state.ans === a[0] ? a[2] : '#E3EAF2') + ';background:' + (state.ans === a[0] ? a[3] : '#fff') + ';color:' + a[2] + '" onclick="RV2.ans(\'' + a[0] + '\')">' + a[1] + '</button>'; }).join('') + '</div></div>' +
      '<div>' + scr + '</div>' + step2 + roomSel +
      '<div class="rv-btns"><button class="rv-b pri" onclick="RV2.save(false)">Save</button><button class="rv-b" onclick="RV2.save(true)">Save, next patient</button></div></aside>';
  }
  function view() {
    var D = day(); if (!state.round) state.round = curRound();
    var who = cfg().alloc, cur = me() || who[0].name;
    return '<div class="app"><div class="col"><main class="rv">' +
      '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div><h2 style="margin:0">Rounds</h2><div style="font-size:13px;color:#667085">' + new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + mineOf().length + ' patients are yours</div></div>' +
      '<label style="font-size:13px;color:#475467">Doing the round: <select onchange="RV2.me(this.value)" style="border:1px solid #D6DEE8;border-radius:8px;padding:5px 8px;font:inherit">' + who.map(function (a) { return '<option ' + (a.name === cur ? 'selected' : '') + '>' + esc(a.name) + '</option>'; }).join('') + '</select></label></div>' +
      scribeBar() + cards(D) + '<div class="rv-fl">' + [['to', 'To see'], ['seen', 'Seen'], ['flag', 'Flagged'], ['all', 'Everyone on this round']].map(function (f) { return '<button class="rv-ch ' + (state.v === f[0] ? 'on' : '') + '" onclick="RV2.filter(\'' + f[0] + '\')">' + f[1] + '</button>'; }).join('') + '<input type="text" placeholder="Search name or room" oninput="RV2.q(this.value)" value="' + esc(state.q || '') + '" style="border:1px solid #D6DEE8;border-radius:99px;padding:5px 12px;font:inherit;margin-left:auto"></div>' +
      '<div class="rv-main"><div class="rv-list" id="rvList">' + rows(D) + '</div>' + panel(D) + '</div></main></div></div>';
  }
  function draw() { var root = $('root'); if (!root) return; var keep = ($('rvW') || {}).value; root.innerHTML = view(); if ($('rvW') && keep != null) $('rvW').value = keep; }
  /* 19 Nov: one AI scribe for the whole round. Start it once; it records continuously, and each time you open another patient (or save) the part for the
     previous patient is sent to the scribe and comes back as a draft on THAT patient. Nothing is filled in until "Use this". */
  var SR = { on: false, stream: null, mr: null, msg: '', busy: 0 };
  function scribeBar() {
    return '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:' + (SR.on ? '#FEF3F2' : '#fff') + ';border:1px solid ' + (SR.on ? '#FDA29B' : '#D6DEE8') + ';border-radius:12px;padding:10px 14px">' +
      '<button class="rv-b pri" style="font-size:14px;padding:9px 16px;white-space:nowrap;' + (SR.on ? 'background:#D92D20;border-color:#D92D20' : '') + '" onclick="RV2.scribe()">' + (SR.on ? '■ Stop the round scribe' : '● Start AI scribe') + '</button>' +
      '<div style="flex:1;min-width:220px;font-size:13px;color:#475467">' + (SR.on ? '<b style="color:#B42318">Listening to the round.</b> Open each patient as you go; the words are drafted for that patient.' : '<b style="color:#101828">AI scribe for this round.</b> Start it once, open each patient as you go, then check the draft and press Use this.') +
      (SR.msg ? '<div style="margin-top:3px">' + esc(SR.msg) + '</div>' : '') + '<div style="font-size:12px;color:#667085;margin-top:2px">Tell patients before recording. Only text is kept, no audio.</div></div></div>';
  }
  function srSeg() {
    if (!SR.on || !SR.stream) return;
    var pid = state.sel || '', chunks = [];
    try {
      var mr = new MediaRecorder(SR.stream);
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function () { if (pid && chunks.length) srSend(pid, chunks); };
      mr.start(); SR.mr = mr;
    } catch (e) {}
  }
  function srCut() { try { if (SR.mr && SR.mr.state !== 'inactive') SR.mr.stop(); } catch (e) {} SR.mr = null; }
  function srSend(pid, chunks) {
    var fd = new FormData(); fd.append('audio', new Blob(chunks, { type: 'audio/webm' }), 'round.webm');
    fd.append('schema', JSON.stringify({ mode: 'transcript', hint: 'Hindi and English mixed. A short talk with a hospital patient about how they are.' }));
    SR.busy++;
    fetch('/api/scribe', { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (j) {
      SR.busy--; var txt = (j && (j.transcript || j.text || j.note)) || '';
      if (txt) { state.drafts = state.drafts || {}; state.drafts[pid] = txt; SR.msg = 'A draft is ready. Open that patient and press Use this.'; } else SR.msg = 'The scribe could not draft one part. Type it instead.';
      draw();
    }).catch(function () { SR.busy--; SR.msg = 'The AI scribe is not available now. Type it instead.'; draw(); });
  }
  var RV2 = window.RV2 = {
    round: function (r) { state.round = r; state.sel = ''; draw(); }, filter: function (f) { state.v = f; draw(); }, q: function (v) { state.q = v; var D = day(); $('rvList').innerHTML = rows(D); },
    open: function (id) { state.sel = id; state.ans = ''; state.topic = ''; state.sp = ''; state.words = ''; state.room = ''; state.roomOpen = false; state.scribe = null; draw(); },
    close: function () { state.sel = ''; draw(); }, ans: function (a) { state.ans = a; if (a === 'good' || a === 'na') { state.topic = ''; state.sp = ''; } draw(); },
    topic: function (t) { state.topic = t; state.sp = ''; draw(); }, sp: function (o) { state.sp = o; draw(); }, words: function (v) { state.words = v; },
    roomToggle: function () { state.roomOpen = !state.roomOpen; draw(); }, room: function (v) { state.room = v; },
    me: function (n) { try { localStorage.setItem('pxme', n); } catch (e) {} state.sel = ''; draw(); },
    record: function () { try { parent.postMessage({ pxNav: 'patients', pxOpen: state.sel }, '*'); } catch (e) {} },
    vvip: function () { var c = cfg(), full = jget(CFG, null) || c; full.vvip = full.vvip || {}; full.vvip[state.sel] = !c.vvip[state.sel]; if (!full.times) full.times = c.times; if (!full.alloc) full.alloc = c.alloc; jset(CFG, full); draw(); },
    save: function (next) {
      var D = day(), L = listFor(state.round, D), idx = L.map(function (x) { return x.p.id; }).indexOf(state.sel), p = save(); if (!p) return;
      var D2 = day(), L2 = listFor(state.round, D2).filter(function (x) { return statusOf(D2, x.p, state.round) === 'to'; });
      state.ans = ''; state.topic = ''; state.sp = ''; state.words = ''; state.room = ''; state.roomOpen = false; state.scribe = null;
      var nx = next ? (L2.filter(function (x) { return L.map(function (y) { return y.p.id; }).indexOf(x.p.id) > idx; })[0] || L2[0]) : null;
      state.sel = nx ? nx.p.id : ''; draw();
    },
    /* AI scribe: record, stop, the server writes a draft; nothing is filled in until "Use this" */
    scribe: function () {
      var s = state.scribe = state.scribe || {};
      if (s.rec) { s.rec = false; s.msg = 'Drafting…'; try { s.mr.stop(); } catch (e) {} draw(); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) { s.msg = 'This device cannot record.'; draw(); return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var chunks = []; s.mr = new MediaRecorder(stream); s.rec = true; s.msg = 'Recording… talk, then Stop and draft.';
        s.mr.ondataavailable = function (e) { chunks.push(e.data); };
        s.mr.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          var fd = new FormData(); fd.append('audio', new Blob(chunks, { type: 'audio/webm' }), 'round.webm'); fd.append('schema', JSON.stringify({ mode: 'transcript', hint: 'Hindi and English mixed. A short talk with a hospital patient about how they are.' }));
          fetch('/api/scribe', { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (j) {
            var txt = (j && (j.transcript || j.text || j.note)) || '';
            if (!txt) { s.msg = 'The scribe could not draft anything. Type it instead.'; } else { s.draft = txt; s.msg = 'Draft ready. Use this to fill the fields, or Discard.'; }
            draw();
          }).catch(function () { s.msg = 'The AI scribe is not available now. Type it instead.'; draw(); });
        };
        s.mr.start(); draw();
      }).catch(function () { s.msg = 'Allow the microphone to record.'; draw(); });
    },
    useDraft: function () { var d = (state.drafts || {})[state.sel]; if (!d) return; state.words = d; if (!state.ans) state.ans = 'tell'; delete state.drafts[state.sel]; draw(); },
    discardDraft: function () { if (state.drafts) delete state.drafts[state.sel]; draw(); }
  };
  /* the round scribe follows the patient you open */
  ['open', 'save', 'close', 'round'].forEach(function (k) { var o = RV2[k]; RV2[k] = function () { srCut(); var r = o.apply(this, arguments); srSeg(); return r; }; });
  RV2.scribe = function () {
    if (SR.on) { srCut(); SR.on = false; try { SR.stream.getTracks().forEach(function (x) { x.stop(); }); } catch (e) {} SR.stream = null; SR.msg = 'Stopped. Drafts appear on each patient.'; draw(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { SR.msg = 'This device cannot record.'; draw(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) { SR.stream = s; SR.on = true; SR.msg = 'Recording the round. Open a patient to start their part.'; srSeg(); draw(); }).catch(function () { SR.msg = 'Allow the microphone to record.'; draw(); });
  };

  /* ---------- Setting: times, allocation, backup person, VVIP ---------- */
  function settings() {
    var c = cfg(), full = jget(CFG, null) || c;
    var h = '<div style="display:flex;flex-direction:column;gap:12px;padding:6px 2px"><h3 style="margin:0">Rounds</h3><div style="font-size:13px;color:#667085">Three rounds a day. Each person sees only the patients allocated to them.</div>' +
      ['M', 'A', 'E'].map(function (k) { return '<label style="display:flex;gap:10px;align-items:center;font-size:14px"><b style="width:90px">' + ({ M: 'Morning', A: 'Afternoon', E: 'Evening' }[k]) + '</b><input id="st_' + k + '" value="' + esc(c.times[k]) + '" style="border:1px solid #D6DEE8;border-radius:8px;padding:6px 10px;width:150px" placeholder="09:00-11:00"></label>'; }).join('') +
      '<h4 style="margin:6px 0 0">Allocation</h4>' + c.alloc.map(function (a, i) { return '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input id="sa_n' + i + '" value="' + esc(a.name) + '" style="border:1px solid #D6DEE8;border-radius:8px;padding:6px 10px;width:130px"><select id="sa_w' + i + '" style="border:1px solid #D6DEE8;border-radius:8px;padding:6px 10px"><option value="nonvvip"' + (a.who === 'nonvvip' ? ' selected' : '') + '>Non-VVIP patients</option><option value="vvip"' + (a.who === 'vvip' ? ' selected' : '') + '>VVIP patients only</option><option value="all"' + (a.who === 'all' ? ' selected' : '') + '>All patients</option></select><input id="sa_b' + i + '" value="' + esc(c.backup[a.name] || '') + '" placeholder="Backup person" style="border:1px solid #D6DEE8;border-radius:8px;padding:6px 10px;width:150px"></div>'; }).join('') +
      '<div><button class="rv-b" onclick="RV2.addAlloc()">+ Add a person</button></div><div style="font-size:12px;color:#667085">VVIP is set on each patient in the visit panel (Mark VVIP).</div>' +
      '<div><button class="rv-b pri" onclick="RV2.saveCfg()">Save the rounds settings</button></div></div>';
    return h;
  }
  RV2.addAlloc = function () { var c = cfg(); c.alloc.push({ name: 'New person', who: 'nonvvip' }); jset(CFG, c); mountSet(); };
  RV2.saveCfg = function () {
    var c = cfg(), t = {}, ok = true;
    ['M', 'A', 'E'].forEach(function (k) { var v = ($('st_' + k) || {}).value || ''; if (!/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(v)) ok = false; t[k] = v; });
    if (!ok) { toast('Times look like 09:00-11:00'); return; }
    var alloc = [], backup = {};
    c.alloc.forEach(function (a, i) { var n = (($('sa_n' + i) || {}).value || '').trim(); if (!n) return; alloc.push({ name: n, who: ($('sa_w' + i) || {}).value || 'all' }); var b = (($('sa_b' + i) || {}).value || '').trim(); if (b) backup[n] = b; });
    if (!alloc.length) { toast('Keep at least one person'); return; }
    jset(CFG, { times: t, alloc: alloc, backup: backup, vvip: c.vvip }); toast('Rounds settings saved');
  };
  function mountSet() { var host = $('rvSet'); if (!host) { host = document.createElement('div'); host.id = 'rvSet'; host.style.cssText = 'padding:8px 12px;background:#fff'; document.body.appendChild(host); } host.innerHTML = settings(); }

  /* ---------- take over from the old screen ---------- */
  if (document.documentElement.classList.contains('setmode')) { mountSet(); return; }
  window.render = function () { draw(); };
  window.addEventListener('storage', function (e) { if (e.key === RV || e.key === KEY || e.key === CFG) draw(); });
  setInterval(function () { if (!state.sel) draw(); }, 60000);
  draw();
})();
