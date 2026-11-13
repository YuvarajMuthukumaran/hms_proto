/* Card 144: the Patient Experience pages keep their data in this browser (localStorage keys px_*). When the shared store is on
   (SUPABASE_PX_STORE=true in Vercel, after supabase/migrations/20261113000100_px_state.sql), every px_* key is also saved to the
   px_state table and pulled back on load, so Prabh's phone and Kanika's laptop see the same rounds, calendar and training.
   Off by default: the pages then work on this browser only, exactly as before. Last write wins per key. */
(function () {
  var PFX = 'px_';
  var cfg = null, busy = false, timers = {};
  function rest(path, opt) {
    opt = opt || {};
    opt.headers = Object.assign({ apikey: cfg.key, Authorization: 'Bearer ' + cfg.key, 'x-tulasi-role': 'patient-experience-lead', 'Content-Type': 'application/json' }, opt.headers || {});
    return fetch(cfg.url + '/rest/v1/' + path, opt);
  }
  function push(k, v) {
    clearTimeout(timers[k]);
    timers[k] = setTimeout(function () {
      rest('px_state?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify([{ key: k, data: v, updated_at: new Date().toISOString() }]) }).catch(function () {});
    }, 700);
  }
  var set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    set.apply(this, arguments);
    if (cfg && this === window.localStorage && !busy && String(k).indexOf(PFX) === 0) push(k, v);
  };
  fetch('/api/config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
    if (!j || !j.supabase || !j.pxStore) return;
    cfg = j.supabase;
    return rest('px_state?select=key,data,updated_at').then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var changed = false;
      (rows || []).forEach(function (row) {
        var cur = null; try { cur = localStorage.getItem(row.key); } catch (e) {}
        var txt = typeof row.data === 'string' ? row.data : JSON.stringify(row.data);
        if (cur !== txt) { busy = true; set.call(localStorage, row.key, txt); busy = false; changed = true; }
      });
      /* keys this browser has and the store does not: save them once */
      var have = {}; (rows || []).forEach(function (r) { have[r.key] = 1; });
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PFX) === 0 && !have[k]) push(k, localStorage.getItem(k)); });
      if (changed && !sessionStorage.getItem('px_pulled')) { sessionStorage.setItem('px_pulled', '1'); location.reload(); }
    });
  }).catch(function () {});
})();
