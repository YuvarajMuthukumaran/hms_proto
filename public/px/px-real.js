/* 16 Nov 2026: phone layout for every Patient Experience page (Today, Patients, Rounds, Grievances, Calendar, Staff training, Reports, Setting).
   Under 700 px wide: tables turn into one card per row with a small label above each value (no sideways scrolling), long lines wrap,
   nothing is wider than the screen. Desktop and tablet layouts are not touched. */
(function () {
  try {
    var st = document.createElement('style');
    st.id = 'px-phone';
    st.textContent = '@media(max-width:700px){html,body{max-width:100%;overflow-x:hidden}' +
      'span,b,p,div,td,li,a{overflow-wrap:anywhere}span,b{white-space:normal!important}' +
      'table{min-width:0!important;width:100%!important;display:block}thead{display:none}tbody{display:block}' +
      'tbody tr{display:block!important;margin:10px 0;padding:10px 12px;border:1px solid #E3EAF2;border-radius:12px;background:#fff}' +
      'tbody td{display:block!important;width:auto!important;border:0!important;padding:5px 0!important;text-align:left!important}' +
      'tbody td:empty{display:none!important}td[data-l]:not([data-l=""])::before{content:attr(data-l);display:block;font-size:11px;font-weight:700;letter-spacing:.04em;color:#667085;margin-bottom:2px}' +
      '.card{overflow-x:visible!important}.tw{overflow-x:visible!important}input,select,textarea,button{max-width:100%}' +
      '.drawer,.modal{width:100%!important;max-width:100%!important}}';
    /* Grievances: every concern is ONE line, left to right (patient, what they said, owner, status, action); long text is cut with ... (Dr. Anu, 16 Nov) */
    var gl = document.createElement('style');
    gl.id = 'px-oneline';
    gl.textContent = '@media(min-width:701px){.gv-list table.pt td{white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;max-width:300px}' +
      '.gv-list table.pt td:nth-child(2){max-width:420px}' +
      '.gv-list table.pt td>div,.gv-list table.pt td>span{display:inline!important;margin:0 8px 0 0}' +
      '.gv-list table.pt td .muted.small{margin-left:0;font-size:13px}.gv-list table.pt td>div.name{font-weight:700}}';
    (document.head || document.documentElement).appendChild(gl);
    (document.head || document.documentElement).appendChild(st);
    var label = function () {
      document.querySelectorAll('table').forEach(function (t) {
        var hs = Array.prototype.map.call(t.querySelectorAll('thead th'), function (h) { return (h.textContent || '').trim(); });
        if (!hs.length) return;
        t.querySelectorAll('tbody tr').forEach(function (r) {
          Array.prototype.forEach.call(r.children, function (c, i) { if (c.tagName === 'TD' && !c.hasAttribute('data-l')) c.setAttribute('data-l', (hs[i] || '').toLowerCase().replace(/^./, function (m) { return m.toUpperCase(); })); });
        });
      });
    };
    var timer = 0;
    var go = function () { clearTimeout(timer); timer = setTimeout(label, 80); };
    document.addEventListener('DOMContentLoaded', function () { label(); new MutationObserver(go).observe(document.body, { childList: true, subtree: true }); });
  } catch (e) { /* the page still works at full width */ }
})();
/* 16 Nov 2026: Patient Experience on REAL patients.
   Loaded first on every PX page (and in the PX bundle). When the live site is in real-data mode (api/config realData) it
     1. sets window.PX_REAL = true (each page then drops its demo rows: grievances, calls, rounds, calendar, training list);
     2. loads the admitted patients from the database (the signed-in PX account may read them: supabase/migrations/20261116000000_px_real.sql)
        and publishes them as window.HMS_PATIENTS / window.HMSX, the same shape the demo roster had, so the pages need no other change.
   ?realtest=1 on the portal URL turns it on locally with six SYNTHETIC patients (no database, no real data).
   It is a synchronous request on purpose: the pages build their lists while loading. Never logs patient details. */
(function () {
  if (window.PX_REAL !== undefined) return;
  /* the Grievances screen shows this when there are no concerns at all */
  /* the bundle's selected patient when nobody is admitted (or the PX account cannot read the patients yet) */
  window.PX_NO_PATIENT = { id: '', name: 'No patient selected', ini: '?', uhid: '', room: '', floor: 'f1', day: 0, admitted: '', admType: '', doctor: '', docIni: '', psych: '', psyIni: '', guardian: '', gName: '', gRel: '', nr: '', phone: '', discharge: '', vip: false, isNew: false, lastContact: '', st: ['up','up','up','up','up','up','up','up','up'], random: '0 of 2', ck: [], log: [], prefs: [], visits: [], belongings: [] };
  window.PX_NO_CONCERN = { id: '', type: 'concern', pid: '', pname: '', title: 'No concern yet', raisedBy: '', via: '', src: '', owner: '', ownerRole: '', category: '', sla: '', slaTone: 'grey', logged: '', status: 'Open', desc: '', latest: '', empty: true };
  var test = false, emptyTest = false;
  try { var qs = window.top.location.search || ''; test = /[?&]realtest=(1|empty)/.test(qs); var emptyTest = /[?&]realtest=empty/.test(qs); } catch (e) {}
  function xhr(url, headers) {
    var r = new XMLHttpRequest();
    r.open('GET', url, false);
    Object.keys(headers || {}).forEach(function (k) { r.setRequestHeader(k, headers[k]); });
    try { r.send(null); } catch (e) { return null; }
    if (r.status < 200 || r.status >= 300) return { status: r.status, body: null };
    try { return { status: r.status, body: JSON.parse(r.responseText) }; } catch (e) { return { status: r.status, body: null }; }
  }
  function token() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) {
          var v = JSON.parse(localStorage.getItem(k) || 'null');
          var t = v && (v.access_token || (v.currentSession && v.currentSession.access_token));
          if (t) return t;
        }
      }
    } catch (e) {}
    return '';
  }
  var ini = function (n) { return String(n || '?').trim().split(/\s+/).map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase(); };
  var dayOf = function (d) {
    if (!d) return 0;
    var a = new Date(String(d).slice(0, 10) + 'T00:00:00'), t = new Date(); t.setHours(0, 0, 0, 0);
    return isNaN(a) ? 0 : Math.max(0, Math.round((t - a) / 864e5));
  };
  function fromRow(p) {
    var rel = (p.relatives || [])[0] || {};
    var d = dayOf(p.admitted_at);
    return {
      id: p.id, name: p.name, ini: ini(p.name), uhid: p.uhid || '', sex: p.sex || '', age: p.age == null ? '' : p.age,
      room: p.room ? 'Room ' + String(p.room).replace(/^Room\s*/i, '') : 'No room yet',
      floor: /female/i.test(p.floor || '') ? 'f3' : (/de-?addict/i.test(p.floor || '') ? 'f1' : 'f2'),   /* the PX pages map f1 De-addiction, f2 Male, f3 Female ward */
      ward: p.floor || '', day: d, adm: p.admitted_at ? String(p.admitted_at).slice(0, 10) : '', sec: p.section || '89',
      doctor: p.psychiatrist || 'Not assigned yet', psych: p.psychologist || '',
      nr: p.nominated_rep || rel.name || 'Not recorded', nrRel: p.nominated_rel || rel.rel || 'Relative',
      mobile: p.mobile || '', real: true
    };
  }
  var patients = null, why = '';
  if (test) {
    var n = ['Test Patient One', 'Test Patient Two', 'Oyatullo Tavarovich Gadoey', 'Test Patient Four', 'Test Patient Five', 'Test Patient Six'];
    patients = n.map(function (nm, i) {
      return fromRow({ id: 'rt' + i, name: nm, sex: i % 2 ? 'F' : 'M', age: 30 + i, uhid: 'TEST-' + i, room: i < 3 ? String(100 + i) : '', floor: i % 2 ? 'Female ward' : 'Male ward',
        admitted_at: new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), psychiatrist: 'Test Psychiatrist', psychologist: 'Test Psychologist',
        relatives: [{ name: 'Test Relative', rel: 'Mother' }] });
    });
    if (emptyTest) patients = [];
    window.PX_REAL = true;
  } else {
    var c = xhr('/api/config', {});
    if (c && c.body && c.body.realData && c.body.supabase) {
      window.PX_REAL = true;
      var h = { apikey: c.body.supabase.key, Authorization: 'Bearer ' + (token() || c.body.supabase.key) };
      var r = xhr(c.body.supabase.url + '/rest/v1/patients?status=eq.admitted&select=id,name,sex,age,uhid,room,bed,floor,admitted_at,psychiatrist,psychologist,section,relatives,mobile,nominated_rep,nominated_rel&order=name&limit=1000', h);
      if (r && r.body) patients = r.body.map(fromRow);
      else why = r ? 'HTTP ' + r.status : 'offline';
    } else window.PX_REAL = false;
  }
  if (!window.PX_REAL) return;
  /* once per browser: whatever the demo version saved here (px_* keys: calls, rounds, training, calendar) is dropped, so it can
     never be uploaded to the real shared store by px-store.js. The marker key has no px_ prefix, so it is never synced. */
  try {
    if (localStorage.getItem('pxreal_v1') !== '1') {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf('px_') === 0) localStorage.removeItem(k); });
      localStorage.setItem('pxreal_v1', '1');
    }
  } catch (e) {}
  window.PX_REAL_WHY = patients ? '' : (why || 'no patients');
  /* nothing to show: say why, once, at the top of the PX shell (not inside every embedded page) */
  if (!patients || !patients.length) {
    var note = why ? 'The admitted patients could not be loaded (' + why + '). Reload, or sign in again.'
      : 'No admitted patients are visible to this login. If patients are admitted, the database permission for Patient Experience is missing (supabase/migrations/20261116000000_px_real.sql).';
    var show = function () {
      try {
        if (window.parent !== window.top && window.parent !== window) return;
        var d = document.createElement('div');
        d.id = 'pxreal-note';
        d.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:99999;max-width:560px;background:#FFFAEB;border:1px solid #FEDF89;color:#93370D;border-radius:10px;padding:10px 14px;font:13px/1.4 Inter,system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.08)';
        d.textContent = note;
        document.body.appendChild(d);
      } catch (e) {}
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  }
  window.HMS_PATIENTS = { generated: new Date().toDateString(), patients: patients || [], real: true };
  var by = {};
  window.HMS_PATIENTS.patients.forEach(function (h) { by[h.name] = h; });
  window.HMSX = {
    by: by,
    day: function (h) { return h.adm ? dayOf(h.adm) : h.day; },
    room: function (h) { return String(h.room).replace(/^Room\s*/, ''); },
    fix: function (list, m) { list.forEach(function (x) { var h = by[x.name || x.p]; if (h) m(x, h); }); }
  };
})();
