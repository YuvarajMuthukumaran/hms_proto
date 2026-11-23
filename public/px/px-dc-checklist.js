/* 20 Nov 2026, meeting with Dr. Anu and Nikita: the discharge checklist is split by role; the Patient Experience Lead's items are
   "Feedback collected from the patient and family", "Importance of follow-up explained" and "Follow-ups booked". This card sits on top
   of a patient's Discharge tab here. Kept in localStorage key px_dc_<HMS patient id>, which px-store.js copies to the shared store
   (px_state), where the clinical portal reads the ticks (block 146) and shows them, view only, in its Discharge checklist.
   23 Nov 2026 (Nikita): no checkboxes. It is a discharge form; each checklist item ticks itself when its part of the form is filled:
     fb  = feedback from whom + score;  fu = explained to + how + at least one point;  fub = at least one follow-up with date, with whom, booked in.
   Form answers are in d.form; the ticks keep their old shape {on, by, at} so block 146 needs no change. Booked in (TeleCRM or the
   Tulasi app) is recorded here only; nothing is sent to TeleCRM. Folding parts work like Preferences: open to fill, closed to read. */
(function () {
  var ITEMS = [['fb', 'Feedback collected from the patient and family'], ['fu', 'Importance of follow-up explained'], ['fub', 'Follow-ups booked']];
  var POINTS = ['Take medicines exactly as prescribed', 'Do not stop medicines without the doctor', 'Come for the OPD follow-up on the date', 'Warning signs to watch for', 'Whom to call in an emergency', 'Therapy or group sessions to continue'];
  var WITH = ['Psychiatrist OPD', 'Psychologist session', 'Family session', 'Lab tests', 'Other'];
  var OPEN = {};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cur() {
    try { if (typeof S === 'undefined' || typeof P === 'undefined' || S.view !== 'rec' || S.rtab !== 'dis') return null; var p = P.find(function (x) { return x.id === S.pid; }); return p ? (p.hmsId || p.id) : null; } catch (e) { return null; }
  }
  function load(id) { try { return JSON.parse(localStorage.getItem('px_dc_' + id) || '{}') || {}; } catch (e) { return {}; } }
  function when() { var d = new Date(); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function F(d) { d.form = d.form || {}; d.form.pts = d.form.pts || []; d.form.fus = d.form.fus && d.form.fus.length ? d.form.fus : [{}]; return d.form; }
  function done(k, f) {
    if (k === 'fb') return !!(f.fbFrom && f.fbScore !== undefined && f.fbScore !== '');
    if (k === 'fu') return !!(f.fuTo && f.fuHow && f.pts.length);
    return f.fus.some(function (r) { return r.date && r.with && r.in; });
  }
  function save(id, d) {
    var f = F(d);
    ITEMS.forEach(function (it) { var k = it[0], on = done(k, f), was = d[k] && d[k].on; if (on && !was) { d[k] = { on: true, by: 'Patient Experience Lead', at: when() }; if (k === 'fb') d.fbTs = Date.now(); } else if (!on && was) d[k] = { on: false, by: 'Patient Experience Lead', at: when() }; });
    try { localStorage.setItem('px_dc_' + id, JSON.stringify(d)); } catch (e) {}
    ITEMS.forEach(function (it) { var el = document.getElementById('pxDcSt_' + it[0]); if (el) el.outerHTML = stat(d, it[0]); });
    var c = document.getElementById('pxDcCnt'); if (c) c.textContent = cnt(d);
  }
  function cnt(d) { var n = ITEMS.filter(function (it) { return d[it[0]] && d[it[0]].on; }).length; return n + ' of ' + ITEMS.length + ' done'; }
  function stat(d, k) { var t = d[k], on = !!(t && t.on); return '<span id="pxDcSt_' + k + '" class="dc-st' + (on ? ' ok' : '') + '">' + (on ? 'Done · ' + esc(t.at || '') : 'Not done yet') + '</span>'; }
  window.pxDcSet = function (el) { var id = el.dataset.id, d = load(id), f = F(d), k = el.dataset.f; if (k.indexOf('fus.') === 0) { var a = k.split('.'); f.fus[+a[1]][a[2]] = el.value; } else f[k] = el.value; save(id, d); };
  window.pxDcPick = function (el) {
    var id = el.dataset.id, d = load(id), f = F(d), k = el.dataset.f, v = el.dataset.dv;
    if (k === 'pts') { var i = f.pts.indexOf(v); if (i < 0) f.pts.push(v); else f.pts.splice(i, 1); }
    else if (k.indexOf('fus.') === 0) { var a = k.split('.'); f.fus[+a[1]][a[2]] = f.fus[+a[1]][a[2]] === v ? '' : v; }
    else f[k] = String(f[k]) === v ? '' : v;
    save(id, d); paint(true);
  };
  window.pxDcRow = function (id, i) { var d = load(id), f = F(d); if (i < 0) f.fus.push({}); else { f.fus.splice(i, 1); if (!f.fus.length) f.fus.push({}); } save(id, d); paint(true); };
  window.pxDcFold = function (el) { OPEN[el.dataset.k] = el.open; if (!el.open) paint(true); };
  function chips(id, k, opts, sel, multi) {
    return '<div class="dc-ch">' + opts.map(function (o) { var on = multi ? sel.indexOf(o) >= 0 : String(sel) === String(o);
      return '<button type="button" class="dc-c' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-id="' + esc(id) + '" data-f="' + k + '" data-dv="' + esc(o) + '" onclick="pxDcPick(this)">' + esc(o) + '</button>'; }).join('') + '</div>';
  }
  function txt(id, k, v, ph, type) { return '<input class="dc-in" type="' + (type || 'text') + '" data-id="' + esc(id) + '" data-f="' + k + '" value="' + esc(v || '') + '" placeholder="' + esc(ph || '') + '" oninput="pxDcSet(this)" onchange="pxDcSet(this)">'; }
  function read(rows) { rows = rows.filter(function (r) { return r[1]; }); return rows.length ? '<dl class="dc-read">' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' : '<div class="dc-read dc-none">Nothing filled yet. Open to fill.</div>'; }
  function part(id, d, k, title, rv, body) {
    var on = !!(d[k] && d[k].on), open = OPEN[k] !== undefined ? OPEN[k] : !on;
    return '<details class="dc-p" data-k="' + k + '"' + (open ? ' open' : '') + ' ontoggle="pxDcFold(this)"><summary><span class="dc-h"><b>' + esc(title) + '</b>' + stat(d, k) + '<span class="dc-chev" aria-hidden="true"></span></span>' + rv + '</summary><div class="dc-body">' + body + '</div></details>';
  }
  function card(id) {
    var d = load(id), f = F(d);
    var fb = part(id, d, 'fb', ITEMS[0][1], read([['From', f.fbFrom], ['Score', f.fbScore !== undefined && f.fbScore !== '' ? f.fbScore + ' of 10' : ''], ['What they said', f.fbSaid]]),
      '<div class="dc-l">Feedback from</div>' + chips(id, 'fbFrom', ['Patient', 'Family', 'Patient and family'], f.fbFrom || '') +
      '<div class="dc-l">How likely are they to recommend Tulasi? (0 to 10)</div>' + chips(id, 'fbScore', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], f.fbScore == null ? '' : f.fbScore) +
      '<div class="dc-l">What they said</div><textarea class="dc-in" rows="2" data-id="' + esc(id) + '" data-f="fbSaid" placeholder="In their words" oninput="pxDcSet(this)">' + esc(f.fbSaid || '') + '</textarea>');
    var fu = part(id, d, 'fu', ITEMS[1][1], read([['Explained to', f.fuTo], ['How', f.fuHow], ['Points covered', f.pts.join(', ')]]),
      '<div class="dc-g2"><div><div class="dc-l">Explained to (name and relation)</div>' + txt(id, 'fuTo', f.fuTo, 'e.g. patient and mother') + '</div>' +
      '<div><div class="dc-l">How</div>' + chips(id, 'fuHow', ['In person', 'Phone', 'Video call'], f.fuHow || '') + '</div></div>' +
      '<div class="dc-l">Points covered</div>' + chips(id, 'pts', POINTS, f.pts, true));
    var rows = f.fus.map(function (r, i) {
      return '<div class="dc-row"><div><div class="dc-l">Date</div>' + txt(id, 'fus.' + i + '.date', r.date, '', 'date') + '</div>' +
        '<div><div class="dc-l">With</div><select class="dc-in" data-id="' + esc(id) + '" data-f="fus.' + i + '.with" onchange="pxDcSet(this)"><option value=""></option>' + WITH.map(function (o) { return '<option' + (r.with === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></div>' +
        '<div><div class="dc-l">Booked in</div>' + chips(id, 'fus.' + i + '.in', ['TeleCRM', 'Tulasi app'], r.in || '') + '</div>' +
        (f.fus.length > 1 ? '<button type="button" class="dc-x" aria-label="Remove this follow-up" onclick="pxDcRow(\'' + esc(id) + '\',' + i + ')">Remove</button>' : '') + '</div>';
    }).join('');
    var fdate = function (s) { if (!s) return ''; var t = new Date(s + 'T00:00'); return isNaN(t) ? s : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
    var fub = part(id, d, 'fub', ITEMS[2][1], read(f.fus.filter(function (r) { return r.date || r.with; }).map(function (r, i) { return ['Follow-up ' + (i + 1), [fdate(r.date), r.with, r.in ? 'booked in ' + r.in : 'not booked yet'].filter(Boolean).join(' · ')]; })),
      rows + '<button type="button" class="mini dc-add" onclick="pxDcRow(\'' + esc(id) + '\',-1)">+ Add another follow-up</button>');
    return '<section id="pxDcCard" class="dc-card"><div class="dc-top"><b>Discharge form · your part</b><span id="pxDcCnt" class="dc-cnt">' + cnt(d) + '</span></div>' +
      '<div class="dc-sub">Each item on the discharge checklist ticks itself when its part is filled. The care team sees the checklist in the clinical portal.</div>' + fb + fu + fub + '</section>';
  }
  var css = document.createElement('style');
  css.textContent = '.dc-card{background:#fff;border:1px solid #E3EAF2;border-radius:12px;padding:14px 16px;margin-bottom:14px;display:grid;gap:10px}.dc-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.dc-top b{font-size:15px}.dc-cnt{font-size:13px;font-weight:600;color:#344054}.dc-sub{font-size:12.5px;color:#667085;margin-top:-6px}'
    + '.dc-p{border:1px solid #E3EAF2;border-radius:10px}.dc-p[open]{border-color:#B9D3F5;box-shadow:0 0 0 3px #EEF5FF}.dc-p>summary{list-style:none;cursor:pointer;padding:11px 14px;display:grid;gap:6px}.dc-p>summary::-webkit-details-marker{display:none}.dc-p>summary:focus-visible{outline:2px solid #1e6cdb;outline-offset:2px;border-radius:10px}'
    + '.dc-h{display:flex;align-items:center;gap:10px}.dc-h b{font-size:14px;color:#101828}.dc-st{font-size:12px;font-weight:600;color:#98A2B3}.dc-st.ok{color:#067647}.dc-chev{margin-left:auto;flex:none;width:8px;height:8px;border-right:2px solid #667085;border-bottom:2px solid #667085;transform:rotate(45deg);margin-bottom:3px}.dc-p[open] .dc-chev{transform:rotate(225deg);margin-bottom:-3px}'
    + '.dc-p[open] .dc-read{display:none}.dc-read{display:grid;grid-template-columns:minmax(120px,200px) 1fr;gap:3px 14px;margin:0;font-size:13.5px}.dc-read dt{color:#667085}.dc-read dd{margin:0;color:#101828}.dc-none{display:block;color:#98A2B3;font-size:13px}'
    + '.dc-body{padding:0 14px 14px;display:grid;gap:8px}.dc-l{font-size:12.5px;font-weight:600;color:#475467;margin-top:4px}.dc-ch{display:flex;flex-wrap:wrap;gap:6px}'
    + '.dc-c{border:1px solid #D6DEE8;background:#fff;border-radius:99px;padding:6px 13px;font:inherit;font-size:13px;color:#344054;cursor:pointer}.dc-c:hover{border-color:#1e6cdb}.dc-c.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff;font-weight:600}.dc-c:focus-visible{outline:2px solid #1e6cdb;outline-offset:1px}'
    + '.dc-in{width:100%;box-sizing:border-box;min-height:38px;border:1px solid #D6DEE8;border-radius:10px;padding:7px 10px;font:inherit;font-size:13.5px;background:#fff}.dc-in:focus{outline:2px solid #1e6cdb;outline-offset:0;border-color:#1e6cdb}textarea.dc-in{resize:vertical}'
    + '.dc-g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.dc-row{display:grid;grid-template-columns:170px minmax(160px,220px) 1fr auto;gap:12px;align-items:end;padding:8px 0;border-bottom:1px solid #EEF2F6}'
    + '.dc-x{border:0;background:none;color:#b42318;font:inherit;font-size:13px;cursor:pointer;padding:8px 4px}.dc-add{justify-self:start;margin-top:4px}'
    + '@media(max-width:700px){.dc-row{grid-template-columns:1fr}.dc-read{grid-template-columns:1fr}}';
  document.head.appendChild(css);
  function paint(force) {
    var id = cur(), root = document.getElementById('root'); if (!root) return;
    var old = document.getElementById('pxDcCard');
    if (!id) { if (old) old.remove(); return; }
    if (old && !force && old.dataset.id === id) return;
    var t = document.createElement('div'); t.innerHTML = card(id); var n = t.firstElementChild; n.dataset.id = id;
    if (old) { old.replaceWith(n); return; }
    /* top of the Discharge tab: before the tab's first section */
    var host = root.querySelector('section'); var all = root.querySelectorAll('section');
    var target = null; for (var i = 0; i < all.length; i++) { if (/Discharge not planned yet|Before you meet the family|Sample view/.test(all[i].textContent || '')) { target = all[i]; break; } }
    (target || host) ? (target || host).parentNode.insertBefore(n, target || host) : root.appendChild(n);
  }
  var busy = false;
  new MutationObserver(function () { if (busy) return; busy = true; setTimeout(function () { busy = false; try { paint(false); } catch (e) {} }, 30); }).observe(document.documentElement, { childList: true, subtree: true });
})();
