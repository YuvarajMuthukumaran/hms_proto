/* 25 Nov 2026 meeting (Nikita, Anu): the patient record's first tab is "Admission" (was "Stay summary"): a task list for the
   Patient Experience Lead at admission, like the discharge checklist. Kept in localStorage key px_adm_<HMS patient id>; px-store.js
   copies every px_* key to the shared store (px_state), where the clinical portal (block 201) shows it, view only, to the psychiatrist.
   Some tasks tick themselves from Preferences (px_prefs_v2); the rest are ticked here with who and when. */
(function () {
  var ITEMS = [
    ['welcome', 'Welcome and ward orientation given'],
    ['rights', 'Patient rights explained (MHCA)'],
    ['rules', 'Ward rules, calls and visiting explained'],
    ['bill', 'Charges and billing explained to the family'],
    ['prefs', 'Preferences taken', 'auto'],
    ['belong', 'Belongings listed', 'auto'],
    ['fam', 'Family contact for updates recorded', 'auto'],
    ['griev', 'How to raise a concern explained']
  ];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function curP() { try { if (typeof S === 'undefined' || typeof P === 'undefined' || S.view !== 'rec' || S.rtab !== 'summary') return null; return P.find(function (x) { return x.id === S.pid; }) || null; } catch (e) { return null; } }
  function key(p) { return 'px_adm_' + (p.hmsId || p.id); }
  function load(p) { try { return JSON.parse(localStorage.getItem(key(p)) || '{}') || {}; } catch (e) { return {}; } }
  function when() { var d = new Date(); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function prefs(p) { try { return (JSON.parse(localStorage.getItem('px_prefs_v2') || '{}') || {})[p.id] || {}; } catch (e) { return {}; } }
  function autoOn(p, k) {
    var f = prefs(p);
    if (k === 'prefs') { var g = {}; Object.keys(f).forEach(function (x) { if (/^\d+\./.test(x) && f[x]) g[x.split('.')[0]] = 1; }); return Object.keys(g).length >= 3; }
    if (k === 'belong') return !!f['3.1'];
    if (k === 'fam') return !!(f['5.1'] || f['5.2']);
    return false;
  }
  /* auto items are written into the record too, so the portal sees the same ticks */
  function sync(p, d) {
    var ch = false;
    ITEMS.forEach(function (it) { if (it[2] !== 'auto') return; var on = autoOn(p, it[0]), was = d[it[0]] && d[it[0]].on;
      if (on && !was) { d[it[0]] = { on: true, by: 'From Preferences', at: when() }; ch = true; } else if (!on && was) { d[it[0]] = { on: false }; ch = true; } });
    if (ch) try { localStorage.setItem(key(p), JSON.stringify(d)); } catch (e) {}
    return d;
  }
  window.pxAdmTick = function (k) {
    var p = curP(); if (!p) return; var d = load(p), was = d[k] && d[k].on;
    d[k] = was ? { on: false } : { on: true, by: (localStorage.getItem('px_me_name') || 'Patient Experience Lead'), at: when() };
    try { localStorage.setItem(key(p), JSON.stringify(d)); } catch (e) {}
    paint(true);
  };
  function card(p) {
    var d = sync(p, load(p)), n = ITEMS.filter(function (it) { return d[it[0]] && d[it[0]].on; }).length;
    return '<section id="pxAdmCard" class="adm-card"><div class="adm-top"><b>Admission checklist</b><span class="adm-cnt">' + n + ' of ' + ITEMS.length + ' done</span></div>' +
      '<div class="adm-sub">Your tasks when the patient is admitted. The treating psychiatrist sees this list in the clinical portal.</div><div class="adm-l">' +
      ITEMS.map(function (it) { var x = d[it[0]], on = !!(x && x.on), auto = it[2] === 'auto';
        return '<div class="adm-i' + (on ? ' ok' : '') + '">' + (auto ? '<span class="adm-box" aria-hidden="true">' + (on ? '✓' : '') + '</span>' : '<button type="button" class="adm-box" aria-pressed="' + on + '" aria-label="' + esc(it[1]) + '" onclick="pxAdmTick(\'' + it[0] + '\')">' + (on ? '✓' : '') + '</button>') +
          '<div><b>' + esc(it[1]) + '</b><div class="adm-sub">' + (on ? 'Done · ' + esc(x.by || '') + (x.at ? ' · ' + esc(x.at) : '') : auto ? 'Ticks itself when Preferences has it' : 'Not done yet') + '</div></div></div>'; }).join('') + '</div></section>';
  }
  var css = document.createElement('style');
  css.textContent = '.adm-card{background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:14px 16px;margin-bottom:14px;display:grid;gap:8px}.adm-top{display:flex;justify-content:space-between;align-items:center}.adm-top b{font-size:15px}.adm-cnt{font-size:13px;font-weight:600;color:#344054}'
    + '.adm-sub{font-size:12.5px;color:#667085}.adm-l{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px}.adm-i{display:flex;gap:10px;align-items:flex-start;border:1px solid #E3EAF2;border-radius:10px;padding:10px 12px}.adm-i b{font-size:13.5px;color:#101828}.adm-i.ok{background:#F6FEF9;border-color:#ABEFC6}'
    + '.adm-box{width:22px;height:22px;border-radius:6px;border:1.5px solid #D0D5DD;background:#fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;flex:none;padding:0;cursor:pointer}span.adm-box{cursor:default}.adm-i.ok .adm-box{background:#12B76A;border-color:#12B76A}.adm-box:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px}';
  document.head.appendChild(css);
  function paint(force) {
    var p = curP(), root = document.getElementById('root'); if (!root) return;
    var old = document.getElementById('pxAdmCard');
    if (!p) { if (old) old.remove(); return; }
    if (old && !force && old.dataset.id === p.id) return;
    var t = document.createElement('div'); t.innerHTML = card(p); var n = t.firstElementChild; n.dataset.id = p.id;
    if (old) { old.replaceWith(n); return; }
    var tb = root.querySelector('.px-utabs'); if (tb) { tb.after(n); return; } var first = root.querySelector('section'); if (first) first.parentNode.insertBefore(n, first); else root.appendChild(n);
  }
  var busy = false;
  new MutationObserver(function () { if (busy) return; busy = true; setTimeout(function () { busy = false; try { paint(false); } catch (e) {} }, 30); }).observe(document.documentElement, { childList: true, subtree: true });
})();
