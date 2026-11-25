/* 25 Nov 2026 meeting (Nikita): the patient record gets a "Therapy plan" tab with the same month calendar the psychiatrist and
   psychologist see (Individual / Group / Family), view only. The clinical portal copies a summary to the PX store as
   px_state pxo:t-<patient id> (block 203): per day [type, title, detail, result]; types ses (session), goal, grp (group), call, wa,
   fses (family session), miss (call not reached); plus goals, groups and the follow-up dates set at discharge. */
(function () {
  var MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SEG = { ind: ['ses', 'goal'], grp: ['grp'], fam: ['call', 'wa', 'fses', 'miss'] };
  var COL = { ses: '#7c3aed', goal: '#2563eb', grp: '#0d9488', call: '#2563eb', wa: '#16a34a', fses: '#7c3aed', miss: '#94a3b8' };
  var LAB = { ses: 'Session', goal: 'Goal', grp: 'Group', call: 'Call', wa: 'WhatsApp', fses: 'Family session', miss: 'Not reached' };
  var V = window.__pxtp = window.__pxtp || { seg: 'ind', sel: '', m: null };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fd(s) { var t = new Date(String(s).slice(0, 10) + 'T00:00'); return isNaN(t) ? s : t.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  /* doctor logins may only write pxo: keys, so the summary is px_state pxo:t-<id>; read here every minute (px-store.js polls px_ keys only) */
  var C = window.__pxtpC = window.__pxtpC || {};
  function pull() {
    fetch('/api/config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.supabase || !j.pxStore) return; var c = j.supabase;
      return fetch(c.url + '/rest/v1/px_state?select=key,data&key=like.pxo:t-*', { headers: { apikey: c.key, Authorization: 'Bearer ' + c.key, 'x-tulasi-role': 'patient-experience-lead' } })
        .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
          var ch = false; (rows || []).forEach(function (r) { var d = typeof r.data === 'string' ? JSON.parse(r.data) : r.data, id = r.key.slice(6); if (JSON.stringify(C[id]) !== JSON.stringify(d)) { C[id] = d; ch = true; } });
          if (ch && typeof S !== 'undefined' && S.view === 'rec' && (S.rtab === 'tp' || S.rtab === 'dis')) try { render(); } catch (e) {}
        });
    }).catch(function () {});
  }
  pull(); setInterval(function () { if (!document.hidden) pull(); }, 60000);
  function data(p) { var id = typeof p === 'string' ? p : (p.hmsId || p.id); if (C[id]) return C[id]; try { return JSON.parse(localStorage.getItem('pxo:t-' + id) || 'null'); } catch (e) { return null; } }
  window.pxTpData = data;
  function rowsOf(T, day) { var r = (T.d || {})[day] || [], t = SEG[V.seg]; return r.filter(function (x) { return t.indexOf(x[0]) >= 0; }); }
  function mark(x) { var v = x[3], c = COL[x[0]] || '#667085'; return '<i class="tpx-mk' + (v === 0 ? ' no' : v === 0.5 ? ' half' : '') + '" style="--k:' + c + '"></i>'; }
  window.pxTpSeg = function (s) { V.seg = s; V.sel = ''; render(); };
  window.pxTpMon = function (n) { var m = V.m; m.m += n; if (m.m < 0) { m.m = 11; m.y--; } if (m.m > 11) { m.m = 0; m.y++; } V.sel = ''; render(); };
  window.pxTpDay = function (d) { V.sel = V.sel === d ? '' : d; render(); };
  window.pxTpBody = function (p) {
    var T = data(p);
    var head = '<div class="tpx-h"><div><b>Therapy plan</b><div class="tpx-sub">From the psychiatrist and psychologist portals. View only.</div></div>' +
      (T && T.at ? '<span class="tpx-sub">Updated ' + esc(new Date(T.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })) + '</span>' : '') + '</div>';
    if (!T) return '<section class="tpx">' + head + '<div class="tpx-empty">Nothing shared yet. The calendar fills itself once the psychiatrist or psychologist has a session, goal, group or family contact for this patient.</div></section>';
    var fu = T.fu || {}, fus = [];
    if (fu.psy) fus.push('<div class="tpx-fu"><b>Psychiatrist</b><span>' + esc(fu.psy.doc || (T.team || {}).psy || '') + '</span><span>' + esc(fd(fu.psy.date)) + '</span></div>');
    if (fu.psych) fus.push('<div class="tpx-fu"><b>Psychologist</b><span>' + esc(fu.psych.name || (T.team || {}).psych || '') + '</span><span>' + esc(fd(fu.psych.date)) + '</span></div>');
    var t0 = new Date(); t0.setHours(0, 0, 0, 0);
    if (!V.m) V.m = { y: t0.getFullYear(), m: t0.getMonth() };
    var y = V.m.y, m = V.m.m, first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), lead = (first.getDay() + 6) % 7;
    var cal = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return '<div class="tpx-dow">' + d + '</div>'; }).join('') + new Array(lead + 1).join('<div></div>');
    for (var i = 1; i <= n; i++) {
      var d = new Date(y, m, i), k = iso(d), r = rowsOf(T, k);
      cal += '<button type="button" class="tpx-day' + (r.length ? ' has' : '') + (+d === +t0 ? ' today' : '') + (V.sel === k ? ' sel' : '') + (d > t0 ? ' fut' : '') + '" onclick="pxTpDay(\'' + k + '\')" aria-label="' + esc(fd(k)) + (r.length ? ', ' + r.length + ' entries' : '') + '"><span class="n">' + i + '</span><span class="tpx-ms">' + r.slice(0, 6).map(mark).join('') + '</span></button>';
    }
    var sel = V.sel ? rowsOf(T, V.sel) : null;
    var side = sel ? '<div class="tpx-card"><b>' + esc(fd(V.sel)) + '</b>' + (sel.length ? sel.map(function (x) { return '<div class="tpx-li">' + mark(x) + '<div><b>' + esc(LAB[x[0]] + ': ' + x[1]) + '</b><div class="tpx-sub">' + esc(x[2] || '') + '</div></div></div>'; }).join('') : '<div class="tpx-sub" style="margin-top:6px">Nothing recorded on this day.</div>') + '</div>'
      : '<div class="tpx-card"><b>' + (V.seg === 'ind' ? 'Goals' : V.seg === 'grp' ? 'Groups' : 'Family contact') + '</b>' +
        (V.seg === 'ind' ? ((T.goals || []).length ? (T.goals || []).map(function (g) { return '<div class="tpx-li"><i class="tpx-mk" style="--k:#2563eb"></i><div>' + esc(g) + '</div></div>'; }).join('') : '<div class="tpx-sub" style="margin-top:6px">No goals set yet.</div>')
        : V.seg === 'grp' ? ((T.groups || []).length ? (T.groups || []).map(function (g) { return '<div class="tpx-li"><i class="tpx-mk" style="--k:#0d9488"></i><div>' + esc(g) + '</div></div>'; }).join('') : '<div class="tpx-sub" style="margin-top:6px">No group attendance yet.</div>')
        : '<div class="tpx-sub" style="margin-top:6px">Calls, WhatsApp updates and family sessions by the treating team. Tap a day to see them.</div>') + '<div class="tpx-sub" style="margin-top:8px">Tap a day to see what happened.</div></div>';
    var seg = '<div class="tpx-seg" role="tablist">' + [['ind', 'Individual'], ['grp', 'Group'], ['fam', 'Family']].map(function (s) { return '<button type="button" role="tab" aria-selected="' + (V.seg === s[0]) + '" class="' + (V.seg === s[0] ? 'on' : '') + '" onclick="pxTpSeg(\'' + s[0] + '\')">' + s[1] + '</button>'; }).join('') + '</div>';
    var key = '<div class="tpx-key"><span><i class="tpx-mk" style="--k:#475467"></i>Done / met</span><span><i class="tpx-mk half" style="--k:#475467"></i>Part way</span><span><i class="tpx-mk no" style="--k:#475467"></i>Not met / missed</span></div>';
    return '<section class="tpx">' + head +
      '<div class="tpx-card"><b>Follow-ups set at discharge</b>' + (fus.length ? fus.join('') + '<div class="tpx-sub" style="margin-top:6px">They are also filled in on Discharge and feedback > Follow-ups booked.</div>' : '<div class="tpx-sub" style="margin-top:6px">The doctors have not set a follow-up date yet.</div>') + '</div>' +
      seg + '<div class="tpx-grid"><div class="tpx-card"><div class="tpx-nav"><button type="button" class="mini" onclick="pxTpMon(-1)" aria-label="Previous month">‹</button><b>' + MN[m] + ' ' + y + '</b><button type="button" class="mini" onclick="pxTpMon(1)" aria-label="Next month">›</button></div><div class="tpx-cal">' + cal + '</div>' + key + '</div>' + side + '</div></section>';
  };
  var css = document.createElement('style');
  css.textContent = '.tpx{display:grid;gap:12px}.tpx-h{display:flex;justify-content:space-between;align-items:flex-start}.tpx-h b{font-size:16px}.tpx-sub{font-size:12.5px;color:#667085}'
    + '.tpx-empty{background:#fff;border:1px dashed #D0D5DD;border-radius:12px;padding:18px;color:#475467;font-size:14px}.tpx-card{background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:14px 16px}'
    + '.tpx-fu{display:grid;grid-template-columns:120px 1fr auto;gap:10px;padding:8px 0;border-bottom:1px solid #F2F4F7;font-size:14px}.tpx-fu:last-of-type{border-bottom:0}'
    + '.tpx-seg{display:inline-flex;border:1px solid #D0D5DD;border-radius:10px;overflow:hidden;width:max-content}.tpx-seg button{border:0;background:#fff;padding:7px 16px;font:inherit;font-size:14px;cursor:pointer}.tpx-seg button.on{background:#1e6cdb;color:#fff;font-weight:600}'
    + '.tpx-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,1fr);gap:12px;align-items:start}@media(max-width:900px){.tpx-grid{grid-template-columns:1fr}}'
    + '.tpx-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.tpx-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.tpx-dow{font-size:12px;color:#667085;text-align:center}'
    + '.tpx-day{min-height:54px;border:1px solid #EEF2F6;border-radius:8px;background:#fff;display:flex;flex-direction:column;align-items:flex-start;padding:4px 6px;cursor:pointer;font:inherit}.tpx-day .n{font-size:12.5px;color:#344054}.tpx-day.has{background:#F8FAFF}.tpx-day.today{border-color:#1e6cdb}.tpx-day.sel{outline:2px solid #1e6cdb}.tpx-day.fut .n{color:#98A2B3}'
    + '.tpx-ms{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}.tpx-mk{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--k);border:2px solid var(--k);flex:none}.tpx-mk.half{background:linear-gradient(90deg,var(--k) 50%,#fff 50%)}.tpx-mk.no{background:#fff}'
    + '.tpx-key{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#475467;margin-top:10px}.tpx-key span{display:inline-flex;gap:6px;align-items:center}.tpx-li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #F2F4F7;font-size:14px}.tpx-li:last-child{border-bottom:0}.tpx-li .tpx-mk{margin-top:4px}';
  document.head.appendChild(css);
})();
