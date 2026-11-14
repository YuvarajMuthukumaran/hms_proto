/* Card 144: Patient Experience grievances shared with the HMS roles (needs SUPABASE_PX_STORE=true and migration 20261113000200_px_grievances.sql).
   Rows in px_state:
     pxg:<id>  written by PX: { c: concern (null for the seeded ones), st: status patch }
     pxo:<id>  written by an owner from the HMS: { latest, latestBy, latestAt } or { fixed:true, fixNote, by, at }
     pxn:<id>  logged from a patient record in the HMS: { name, title, desc, cat, src, by, at, owner }
   Off: nothing is sent or read and the page works on its own data, as before. */
(function () {
  window.PXDay = function () { var d = new Date(); return d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]; };
  var cfg = null, last = {}, seenO = {}, timer = null;
  function rest(path, opt) {
    opt = opt || {};
    opt.headers = Object.assign({ apikey: cfg.key, Authorization: 'Bearer ' + cfg.key, 'x-tulasi-role': 'patient-experience-lead', 'Content-Type': 'application/json' }, opt.headers || {});
    return fetch(cfg.url + '/rest/v1/' + path, opt);
  }
  var stamp = function (v) { return JSON.stringify(v == null ? null : v); };
  var PXG = window.PXG = {
    on: function () { return !!cfg; },
    /* next concern number: one more than the largest seen (the seeded ones stop at 142) */
    nid: function (self, k) {
      var m = 145;
      (self.state.extraConcerns || []).forEach(function (c) { var n = parseInt(String(c.id).replace(/\D/g, ''), 10); if (n > m && n < 100000) m = n; });
      return 'G-0' + (m + 1 + (k || 0));
    },
    /* called on every render: saves what changed */
    sync: function (self, seeded) {
      PXG.self = self; PXG.seedList = seeded || PXG.seedList;
      if (!cfg) return;
      var s = self.state, extra = {}, rows = [];
      PXG.seedIds = {}; (seeded || []).forEach(function (c) { PXG.seedIds[c.id] = 1; extra[c.id] = c; });
      (s.extraConcerns || []).forEach(function (c) { extra[c.id] = c; });
      var ids = Object.keys(extra);
      Object.keys(s.concernStatus || {}).forEach(function (id) { if (!extra[id]) ids.push(id); });
      ids.forEach(function (id) {
        var d = { c: extra[id] || null, st: (s.concernStatus || {})[id] || null }, key = 'pxg:' + id, t = stamp(d);
        if (last[key] === t) return;
        last[key] = t; rows.push({ key: key, data: d, updated_at: new Date().toISOString() });
      });
      if (rows.length) rest('px_state?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify(rows) }).catch(function () {});
    },
    /* a concern made somewhere else (a Rounds walk) is saved as a pxg row once, unless the store already has it */
    known: {}, pulled: false, q: [],
    addRow: function (c) {
      if (!c || !c.id) return;
      if (!cfg || !PXG.pulled) { if (!PXG.q.some(function (x) { return x.id === c.id; })) PXG.q.push(c); return; }
      if (PXG.known[c.id]) return;
      PXG.known[c.id] = 1; last['pxg:' + c.id] = stamp({ c: c, st: null });
      rest('px_state?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify([{ key: 'pxg:' + c.id, data: { c: c, st: null }, updated_at: new Date().toISOString() }]) }).catch(function () { delete PXG.known[c.id]; });
    },
    pull: function (self) {
      if (!cfg) return;
      rest('px_state?select=key,data&key=like.px*:*').then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
        rows.forEach(function (r) { if (r.key.indexOf('pxg:') === 0) PXG.known[r.key.slice(4)] = 1; });
        PXG.pulled = true; PXG.q.splice(0).forEach(PXG.addRow);
        var s = self.state, extra = (s.extraConcerns || []).slice(), cs = Object.assign({}, s.concernStatus || {}), changed = false;
        var have = Object.assign({}, PXG.seedIds || {}); extra.forEach(function (c) { have[c.id] = 1; });
        rows.forEach(function (r) {
          var k = r.key, d = r.data || {}, t = stamp(d), id = k.split(':')[1];
          if (k.indexOf('pxg:') === 0) {
            if (last[k] === t) return; last[k] = t;
            if (d.c && !have[d.c.id]) { extra.push(d.c); have[d.c.id] = 1; changed = true; }
            if (d.st && stamp(cs[id]) !== stamp(d.st)) { cs[id] = d.st; changed = true; }
          } else if (k.indexOf('pxn:') === 0) {
            var nid = 'G-N' + id.slice(-4).toUpperCase();
            if (have[nid]) return;
            var rt = d.owner ? [d.owner, d.ownerRole || 'Treating team'] : ['Patient experience team', 'Patient experience'];
            var c = { id: nid, type: 'concern', pid: d.pid || '', pname: d.name || '', title: String(d.title || d.desc || 'Logged from the patient record').slice(0, 70), raisedBy: d.by || 'Clinical team', via: 'Patient record', owner: rt[0], ownerRole: rt[1], category: d.cat || 'Other', sla: '6 h left', slaTone: 'grey', logged: d.at || 'just now', status: 'Open', desc: d.desc || d.title || '', src: d.src || 'family' };
            extra.push(c); have[nid] = 1; changed = true; last['pxg:' + nid] = stamp({ c: c, st: null });
          } else if (k.indexOf('pxo:') === 0) {
            if (seenO[k] === t) return; seenO[k] = t;
            var cur = cs[id] || {};
            if (d.fixed) cs[id] = Object.assign({}, cur, { status: 'In progress', stage: 'confirm', fixNote: d.fixNote || '', sla: 'Call the family', slaTone: 'blue', latest: d.fixNote || cur.latest, latestBy: d.by, latestAt: d.at });
            else cs[id] = Object.assign({}, cur, { latest: d.latest, latestBy: d.latestBy, latestAt: d.latestAt });
            changed = true;
          }
        });
        if (changed) self.setState({ extraConcerns: extra, concernStatus: cs });
      }).catch(function () {});
    },
    start: function (self) { PXG.self = self; if (!cfg || timer) return; PXG.pull(self); timer = setInterval(function () { PXG.pull(self); }, 20000); }
  };
  fetch('/api/config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
    if (j && j.supabase && j.pxStore) { cfg = j.supabase; if (PXG.self) { PXG.sync(PXG.self, PXG.seedList); PXG.start(PXG.self); } }
  }).catch(function () {});
})();
