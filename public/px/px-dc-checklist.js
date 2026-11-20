/* 20 Nov 2026, meeting with Dr. Anu and Nikita: the discharge checklist is split by role, and the Patient Experience Lead ticks two items:
   "Feedback collected from the patient and family" and "Importance of follow-up explained". This card sits on top of a patient's
   Discharge tab here. The ticks are kept in localStorage key px_dc_<HMS patient id>, which px-store.js copies to the shared store
   (px_state), where the clinical portal reads them (block 146) and shows them, view only, in its Discharge checklist. */
(function () {
  var ITEMS = [['fb', 'Feedback collected from the patient and family'], ['fu', 'Importance of follow-up explained']];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cur() {
    try { if (typeof S === 'undefined' || typeof P === 'undefined' || S.view !== 'rec' || S.rtab !== 'dis') return null; var p = P.find(function (x) { return x.id === S.pid; }); return p ? (p.hmsId || p.id) : null; } catch (e) { return null; }
  }
  function load(id) { try { return JSON.parse(localStorage.getItem('px_dc_' + id) || '{}') || {}; } catch (e) { return {}; } }
  function when() { var d = new Date(); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  window.pxDcTick = function (id, k, on) {
    var d = load(id); d[k] = { on: !!on, by: 'Patient Experience Lead', at: when() };
    try { localStorage.setItem('px_dc_' + id, JSON.stringify(d)); } catch (e) {}
    paint(true);
  };
  function card(id) {
    var d = load(id);
    return '<section id="pxDcCard" style="background:#fff;border:1px solid #BFDBFE;border-radius:12px;padding:14px 16px;margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><b>Discharge checklist · your items</b><span style="font-size:12px;color:#667085">The care team sees these in the clinical portal</span></div>' +
      ITEMS.map(function (it) {
        var t = d[it[0]], on = !!(t && t.on);
        return '<label style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid #EEF2F6;margin-top:8px;font-size:13.5px;cursor:pointer"><input type="checkbox" ' + (on ? 'checked' : '') +
          ' onchange="pxDcTick(\'' + esc(id) + '\',\'' + it[0] + '\',this.checked)" style="width:17px;height:17px;margin-top:1px"><span><b style="font-weight:600">' + esc(it[1]) + '</b><div style="font-size:12px;color:#667085">' +
          (on ? 'Done · ' + esc(t.at || '') : 'Not done yet') + '</div></span></label>';
      }).join('') + '</section>';
  }
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
