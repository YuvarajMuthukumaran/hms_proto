/* 24 Nov 2026 (Nikita): "Someone raised a concern" pop-up for the PX lead app (px-lead-prototype.html).
   Fields from her grievance spec: Patient and room (one searchable drop-down), Raised by (patient / family member with
   relation / staff / anonymous), Came in as, Escalated by (optional), Issues (at least one: title, category, when, what
   they said), Severity (defaults from the categories; can be raised, never lowered), Contact for updates, Goes to
   (worked out from the issues and severity, can be changed here). Plain layout, no coloured boxes.
   Saves the same concern record the old form made (extraConcerns, calls log), plus issues/raisedRel/escalatedBy/contact/sev. */
(function () {
  var CATS = [['Doctor communication', 'Medium'], ['Treatment progress', 'Medium'], ['Therapist continuity', 'Medium'], ['Family updates', 'Medium'],
    ['Nursing care', 'Medium'], ['Food and dietary', 'Low'], ['Room and housekeeping', 'Low'], ['Attendants and security', 'Medium'],
    ['Belongings', 'Low'], ['Billing and insurance', 'Low'], ['Medicines at discharge', 'Medium'], ['Rights', 'High'], ['Safety', 'High'], ['Other', 'Low']];
  var CLIN = ['Doctor communication', 'Treatment progress', 'Family updates', 'Therapist continuity'];
  var SEV = ['Low', 'Medium', 'High'];
  var BY = ['Patient', 'Family member', 'Staff', 'Another team', 'Anonymous'];
  var REL = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];
  var SRC = ['Phone call', 'Came in person', 'Floor round', 'Ward meeting', 'Front desk', 'At discharge', 'WhatsApp or email'];
  var ESC = ['', 'Clinical team', 'Nursing', 'Front desk', 'Floor coordinator', 'Another team'];
  var WHEN = ['Today', 'Yesterday', 'This week', 'Earlier'];
  var ACT = [['yes', 'Yes, it needs action'], ['no', 'No, just a note'], ['praise', 'Compliment']];
  var HINT = { Low: 'Low: due in 6 hours. It goes to Mr. S. Chandra at 6 hours if it is still open.',
    Medium: 'Medium: the owner is reminded at 3 hours. It goes to Mr. S. Chandra at 6 hours if it is still open.',
    High: 'High: Mr. S. Chandra is told now. Due in 6 hours.' };
  var self = null, F = null, root = null;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pts = function () { var L = []; try { L = (self.data().P || []).filter(function (p) { return p && p.id; }); } catch (e) {} return L; };
  var pt = function (id) { return pts().filter(function (p) { return p.id === id; })[0] || null; };
  var room = function (p) { var r = p && p.room ? String(p.room).replace(/^Room\s*/, '') : ''; return /\d/.test(r) ? r : ''; };
  var sevOf = function (cat) { var c = CATS.filter(function (x) { return x[0] === cat; })[0]; return c ? c[1] : 'Low'; };
  var minSev = function () { var m = 0; F.issues.forEach(function (i) { if (i.cat) m = Math.max(m, SEV.indexOf(sevOf(i.cat))); }); return SEV[m]; };
  /* 24 Nov meeting: severity is worked out from the categories; the person logging can change it either way */
  var sev = function () { return F.sevSet && F.sev ? F.sev : minSev(); };
  var mainCat = function () { var best = null; F.issues.forEach(function (i) { if (i.cat && (!best || SEV.indexOf(sevOf(i.cat)) > SEV.indexOf(sevOf(best)))) best = i.cat; }); return best || 'Other'; };
  var route = function () {
    var cat = mainCat(), R = {}; try { R = self.routes(); } catch (e) {}
    var r = sev() === 'High' ? (CLIN.indexOf(cat) >= 0 ? ['Floor lead psychiatrist', 'Clinical team'] : ['Mr. S. Chandra', 'GM Operations']) : (R[cat] || R.Other || ['Kanika', 'Patient experience']);
    var o = r[0]; if (o === 'Treating psychiatrist') { var p = pt(F.pid); if (p && (p.doctor || p.dr)) o = p.doctor || p.dr; }
    return [o, r[1]];
  };
  /* 24 Nov meeting: no phone box; the number comes from the patient record */
  var contactOf = function () { var p = pt(F.pid); if (!p) return null; var ph = p.phone || p.mobile || p.gPhone || ''; if (!ph || F.by === 'Staff' || F.by === 'Another team' || F.by === 'Anonymous') return null; return [F.by === 'Family member' ? (p.gName || 'the family') + (F.rel ? ' (' + F.rel.toLowerCase() + ')' : '') : 'the patient', ph]; };
  var owners = function () {
    var R = {}, seen = {}, out = []; try { R = self.routes(); } catch (e) {}
    var add = function (o, r) { if (o && !seen[o]) { seen[o] = 1; out.push([o, r]); } };
    var auto = route(); add(auto[0], auto[1]);
    Object.keys(R).forEach(function (k) { add(R[k][0], R[k][1]); });
    add('Mr. S. Chandra', 'GM Operations'); add('Floor lead psychiatrist', 'Clinical team');
    return out;
  };
  /* 24 Nov (Nikita): every choice is a drop-down that starts blank */
  var sel = function (k, cur, opts, extra) { return '<select data-k="' + k + '"' + (extra || '') + '><option value="">Select</option>' + opts.map(function (o) { var v = typeof o === 'string' ? o : o[0], l = typeof o === 'string' ? o : o[1]; return '<option value="' + esc(v) + '"' + (cur === v ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>'; };
  var chip = function (on, attr, label) { return '<button type="button" class="pxl-ch' + (on ? ' on' : '') + '" ' + attr + '>' + esc(label) + '</button>'; };

  function css() {
    if (document.getElementById('pxl-css')) return;
    var s = document.createElement('style'); s.id = 'pxl-css';
    s.textContent = '.pxl-ov{position:fixed;inset:0;z-index:9999;background:rgba(16,24,40,.45);display:flex;align-items:flex-start;justify-content:center;overflow:auto;font-family:Inter,system-ui,sans-serif}'
      + '.pxl{background:#fff;border-radius:16px;width:min(860px,72vw);margin:28px 0;padding:22px 24px;box-shadow:0 20px 50px rgba(16,24,40,.25);color:#101828}'
      + '.pxl h3{margin:0;font-size:20px}.pxl .sub{color:#667085;font-size:13.5px;margin-top:2px}'
      + '.pxl-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}'
      + '.pxl-f{margin-top:16px}.pxl-f>label,.pxl-l{display:block;font-weight:600;font-size:14.5px;margin-bottom:7px}.pxl-l small,.pxl-f>label small{font-weight:400;color:#667085}'
      + '.pxl-g{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}'
      + '.pxl input,.pxl select,.pxl textarea{width:100%;box-sizing:border-box;border:1px solid #D0D5DD;border-radius:10px;padding:9px 12px;font:inherit;font-size:14.5px;background:#fff;color:#101828}'
      + '.pxl textarea{min-height:64px;resize:vertical}.pxl input:focus,.pxl select:focus,.pxl textarea:focus{outline:2px solid #1e6cdb33;border-color:#1e6cdb}'
      + '.pxl-chs{display:flex;flex-wrap:wrap;gap:7px}.pxl-ch{border:1px solid #D0D5DD;background:#fff;border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;cursor:pointer;color:#344054}'
      + '.pxl-ch:hover{border-color:#1e6cdb}.pxl-ch.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}.pxl-ch[disabled]{opacity:.4;cursor:not-allowed}'
      + '.pxl-cb{position:relative}.pxl-dd{position:absolute;left:0;right:0;top:100%;margin-top:4px;background:#fff;border:1px solid #D0D5DD;border-radius:10px;max-height:260px;overflow:auto;z-index:2;box-shadow:0 8px 24px rgba(16,24,40,.12)}'
      + '.pxl-dd button{display:block;width:100%;text-align:left;border:0;background:#fff;padding:9px 12px;font:inherit;font-size:14px;cursor:pointer}.pxl-dd button:hover,.pxl-dd button.on{background:#EEF4FD}.pxl-dd small{color:#667085}'
      + '.pxl-iss{border:1px solid #E4E7EC;border-radius:12px;padding:12px 14px;margin-bottom:10px}.pxl-iss-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:600}'
      + '.pxl-iss .pxl-g{gap:10px 14px}.pxl-lnk{border:0;background:none;color:#1e6cdb;font:inherit;font-size:14px;font-weight:600;cursor:pointer;padding:4px 0}.pxl-lnk.rm{color:#667085;font-weight:500}'
      + '.pxl-note{color:#667085;font-size:13.5px;margin-top:6px}.pxl-row{display:flex;gap:10px;align-items:center}.pxl-row select{flex:1}'
      + '.pxl-ft{display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #EAECF0}.pxl-b{border:1px solid #D0D5DD;background:#fff;border-radius:10px;padding:10px 18px;font:inherit;font-size:15px;font-weight:600;cursor:pointer}.pxl-b.pri{background:#1e6cdb;border-color:#1e6cdb;color:#fff}'
      + '.pxl-g3{display:grid;grid-template-columns:1.4fr 1fr .8fr;gap:10px 14px}.pxl-sel{width:100%;text-align:left;border:1px solid #D0D5DD;border-radius:10px;padding:9px 12px;font:inherit;font-size:14.5px;background:#fff;cursor:pointer;color:#101828}.pxl-iss{padding:10px 0 12px;border:0;border-bottom:1px solid #EAECF0;border-radius:0;margin:0}'
      + '.pxl-err{color:#B42318;font-size:13.5px;margin-top:10px}';
    document.head.appendChild(s);
  }

  function draw() {
    if (!root) return;
    var p = pt(F.pid), act = 'yes', yes = true;
    var q = F.q.toLowerCase(), list = pts().filter(function (x) { return !q || (x.name + ' ' + room(x) + ' ' + (x.uhid || '')).toLowerCase().indexOf(q) >= 0; }).slice(0, 60);
    var focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('data-k') : null;
    var h = '<div class="pxl" role="dialog" aria-label="Log a concern">'
      + '<div class="pxl-top"><div><h3>Someone raised a concern</h3><div class="sub">Log it once. It is saved to the patient record.</div></div><button type="button" class="pxl-lnk" data-x="back">Back</button></div>'
      /* patient: one searchable drop-down */
      + '<div class="pxl-f"><label>Patient and room</label><div class="pxl-cb"><input data-k="q" placeholder="Search by name, room or UHID" value="' + esc(p && !F.ddOpen ? p.name + (room(p) ? ' · Room ' + room(p) : '') : F.q) + '" autocomplete="off">'
      + (F.ddOpen ? '<div class="pxl-dd">' + (list.length ? list.map(function (x) { return '<button type="button" data-pid="' + esc(x.id) + '" class="' + (x.id === F.pid ? 'on' : '') + '">' + esc(x.name) + ' <small>' + (room(x) ? 'Room ' + esc(room(x)) : 'No room yet') + (x.uhid ? ' · ' + esc(x.uhid) : '') + '</small></button>'; }).join('') : '<div style="padding:10px 12px;color:#667085">No admitted patient matches.</div>') + '</div>' : '')
      + '</div></div>'
      + '<div class="pxl-g"><div class="pxl-f"><label>Raised by</label>' + sel('by', F.by, BY) + '</div>'
      + '<div class="pxl-f">' + (F.by === 'Family member' ? '<label>Relation with the patient</label>' + sel('rel', F.rel, REL) : F.by === 'Staff' ? '<label>Staff name</label><input data-k="staff" value="' + esc(F.staff) + '" placeholder="Name of the staff member">' : F.by === 'Another team' ? '<label>Which team</label>' + sel('escBy', F.escBy, ESC.filter(Boolean)) : '') + '</div></div>'
      + '<div class="pxl-g"><div class="pxl-f"><label>How it reached us</label>' + sel('src', F.src, SRC) + '</div>'
      + '<div class="pxl-f"><label>Logged by <small>(your name)</small></label><input data-k="me" value="' + esc(F.me) + '" placeholder="Your name"></div></div>';
    if (yes) {
      /* 24 Nov meeting: one plain row per issue (no A/B/C boxes); category list always opens downwards */
      h += '<div class="pxl-f"><span class="pxl-l">What is it about? <small>(add one line for each separate complaint)</small></span>'
        + F.issues.map(function (i, k) {
          var cl = F.catOpen === k ? '<div class="pxl-dd">' + CATS.map(function (c) { return '<button type="button" data-catv="' + k + ':' + esc(c[0]) + '" class="' + (i.cat === c[0] ? 'on' : '') + '">' + esc(c[0]) + '</button>'; }).join('') + '</div>' : '';
          return '<div class="pxl-iss">' + (F.issues.length > 1 ? '<div class="pxl-iss-h"><span>Issue ' + (k + 1) + '</span><button type="button" class="pxl-lnk rm" data-rm="' + k + '">Remove</button></div>' : '')
            + '<div class="pxl-g3"><div><span class="pxl-l">Title</span><input data-k="t" data-i="' + k + '" value="' + esc(i.t) + '" placeholder="e.g. Food served cold"></div>'
            + '<div class="pxl-cb"><span class="pxl-l">Category</span><button type="button" class="pxl-sel" data-catopen="' + k + '">' + (i.cat ? esc(i.cat) : '<span style="color:#98A2B3">Select</span>') + '</button>' + cl + '</div>'
            + '<div><span class="pxl-l">When</span>' + sel('when', i.when, WHEN, ' data-i="' + k + '"') + '</div></div>'
            + '<div style="margin-top:10px"><span class="pxl-l">What they said</span><textarea data-k="what" data-i="' + k + '" placeholder="In their words">' + esc(i.what) + '</textarea></div></div>';
        }).join('')
        + '<button type="button" class="pxl-lnk" data-x="add">+ Add another issue</button></div>';
      var hasCat = F.issues.some(function (i) { return i.cat; });
      var ms = minSev(), sv = sev(), rt = route(), go = F.owner || (hasCat ? rt[0] : '');
      var ph = contactOf();
      h += '<div class="pxl-g"><div class="pxl-f"><label>Severity</label><select data-k="sev"><option value="">Select</option>' + SEV.map(function (s) { return '<option value="' + s + '"' + (hasCat && sv === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>'
        + '<div class="pxl-note">' + (hasCat ? (F.sevSet && sv !== ms ? 'Changed by you (worked out: ' + ms + ').' : 'Worked out from the category. You can change it.') : 'Set by itself once a category is picked.') + '</div></div>'
        + '<div class="pxl-f"><label>Goes to</label><select data-k="owner">' + (go ? '' : '<option value="" selected>Picked from the category</option>') + owners().map(function (o) { return '<option value="' + esc(o[0]) + '"' + (go === o[0] ? ' selected' : '') + '>' + esc(o[0]) + ' · ' + esc(o[1]) + '</option>'; }).join('') + '</select>'
        + '<div class="pxl-note">' + (hasCat ? HINT[sv] : '') + '</div></div></div>'
        + (ph ? '<div class="pxl-note">Updates go to ' + esc(ph[0]) + ' on ' + esc(ph[1]) + ' (from the patient record).</div>' : '');
    } else {
      h += '<div class="pxl-f"><label>What did they say?</label><textarea data-k="note" placeholder="In their words">' + esc(F.note) + '</textarea><div class="pxl-note">' + (act === 'praise' ? 'Saved to the patient record and shown in Reports under Compliments.' : 'Saved to the patient record only. No owner and no clock.') + '</div></div>';
    }
    h += (F.err ? '<div class="pxl-err">' + esc(F.err) + '</div>' : '')
      + '<div class="pxl-ft"><button type="button" class="pxl-b pri" data-x="save">' + (yes ? 'Save and assign' : act === 'praise' ? 'Save compliment' : 'Save note') + '</button><button type="button" class="pxl-b" data-x="close">Cancel</button></div></div>';
    var y = root.scrollTop; root.innerHTML = h; root.scrollTop = y;
    if (focus) { var el = root.querySelector('[data-k="' + focus + '"]' + (F.fi != null && focus !== 'q' && focus !== 'contact' && focus !== 'note' && focus !== 'escBy' && focus !== 'owner' ? '[data-i="' + F.fi + '"]' : '')); if (el) { el.focus(); if (el.setSelectionRange && el.value != null && el.type !== 'tel' || el.tagName === 'TEXTAREA') { try { var n = el.value.length; el.setSelectionRange(n, n); } catch (e) {} } } }
  }

  function setPid(id) {
    var p = pt(id); F.pid = id; F.q = ''; F.ddOpen = false;
    if (p && !F.contactTyped) F.contact = F.by === 'Patient' || F.by === 'Staff' || F.by === 'Anonymous' ? '' : (p.phone || '');
    if (p && F.by === 'Family member' && !F.rel && p.gRel) F.rel = REL.indexOf(p.gRel) >= 0 ? p.gRel : '';
  }

  function save() {
    var miss = [];
    if (!F.pid) miss.push('the patient');
    if (!F.by) miss.push('who raised it');
    if (F.by === 'Family member' && !F.rel) miss.push('the relation');
    if (!F.src) miss.push('how it came in');
    if (F.by === 'Staff' && !String(F.staff).trim()) miss.push('the staff name');
    if (F.by === 'Another team' && !F.escBy) miss.push('which team');
    var act = 'yes', iss = F.issues.filter(function (i) { return i.t.trim() || i.cat || i.what.trim(); });
    if (act === 'yes') {
      if (!iss.length) miss.push('at least one issue');
      iss.forEach(function (i, k) { if (!i.t.trim() || !i.cat) miss.push('issue ' + String.fromCharCode(65 + k) + ' title and category'); });
    } else if (!String(F.note).trim()) miss.push('what they said');
    if (miss.length) { F.err = 'Please add ' + miss.join(', ') + '.'; draw(); return; }
    var st = self.state, pid = F.pid, calls = Object.assign({}, st.calls), L = (calls[pid] || []).slice();
    var by = F.by === 'Family member' ? 'Family (' + F.rel + ')' : F.by === 'Staff' ? 'Staff: ' + String(F.staff).trim() : F.by === 'Another team' ? F.escBy : F.by;
    try { if (String(F.me).trim()) localStorage.setItem('px_me_name', String(F.me).trim()); } catch (e) {}
    var time = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    var how = F.src + ', from ' + by.toLowerCase();
    if (act !== 'yes') {
      L.unshift({ d: window.PXDay ? window.PXDay() : '', what: F.src + ' logged', who: 'Patient Experience', time: time, how: how, note: F.note, tag: act === 'praise' ? 'compliment' : 'note' }); calls[pid] = L;
      close(); self.setState({ calls: calls, logOpen: false, screen: 'record', pid: pid, recTab: 'family' }); return;
    }
    var sv = sev(), rt = route(), owner = F.owner || rt[0], role = (owners().filter(function (o) { return o[0] === owner; })[0] || [owner, rt[1]])[1];
    var id = window.PXG ? window.PXG.nid(self) : 'G-0' + (143 + (st.extraConcerns || []).length), ty = sv === 'High' ? 'grievance' : 'concern';
    var issues = iss.map(function (i) { return { t: i.t.trim(), cat: i.cat, when: i.when || 'Not said', st: 'Open', what: i.what.trim(), fam: '', asks: [], owner: owner }; });
    var desc = issues.map(function (i) { return i.what; }).filter(Boolean).join(' ') || 'No description added.';
    var c = { id: id, type: ty, pid: pid, title: issues[0].t.slice(0, 70), raisedBy: by, raisedRel: F.rel || '', via: F.src, src: F.src, escalatedBy: F.by === 'Another team' ? F.escBy : '', staffName: F.by === 'Staff' ? String(F.staff).trim() : '', loggedBy: String(F.me || '').trim() || 'Patient Experience', contact: (contactOf() || ['', ''])[1],
      tag: 'General admin', owner: owner, ownerRole: role, category: mainCat(), severity: sv, sev: sv, issues: issues,
      sla: '6 h left', at: Date.now(), slaTone: 'grey', logged: 'just now', status: ty === 'grievance' ? 'Pending' : 'Open', desc: desc };
    L.unshift({ d: window.PXDay ? window.PXDay() : '', what: F.src + ' logged', who: 'Patient Experience', time: time, how: how, note: desc, tag: 'concern' }); calls[pid] = L;
    try { localStorage.setItem('px_gopen', id); } catch (e) {}
    /* 25 Nov (owner): a concern that came in by phone also shows in the patient's Family call log (patients.html reads px_calls_v1) */
    if (F.src === 'Phone call') try { var pp = pts().filter(function (x) { return x.id === pid; })[0] || {}, CL = JSON.parse(localStorage.getItem('px_calls_v1') || '[]'); CL.unshift({ kind: 'inbound', pid: pid, name: pp.name || '', at: Date.now(), who: by, gid: id, words: issues.map(function (i) { return i.t; }).join('; ') }); localStorage.setItem('px_calls_v1', JSON.stringify(CL)); } catch (e) {}
    close();
    self.setState({ extraConcerns: (st.extraConcerns || []).concat([c]), calls: calls, logOpen: false, screen: 'concerns', filter: 'open', srcf: 'all', cid: id });
    setTimeout(function () { var fr = document.querySelector('iframe[src*="grievances.html"]'); if (fr && fr.contentWindow) try { fr.contentWindow.postMessage({ gOpen: id }, '*'); } catch (e) {} }, 400);
  }

  function close() { if (root) { root.remove(); root = null; } document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') { if (F.ddOpen) { F.ddOpen = false; draw(); } else close(); } }

  function bind() {
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button,[data-k="q"]');
      if (e.target === root) { close(); return; }
      if (!t) { if (F.ddOpen) { F.ddOpen = false; draw(); } return; }
      var d = t.dataset;
      if (d.catopen != null) { F.catOpen = F.catOpen === +d.catopen ? null : +d.catopen; draw(); var dd = root.querySelector('.pxl-dd'); if (dd) dd.scrollIntoView({ block: 'nearest' }); return; }
      if (d.catv) { var cv = d.catv.split(':'); F.issues[+cv[0]].cat = cv.slice(1).join(':'); F.catOpen = null; F.owner = ''; F.sevSet = false; F.err = ''; draw(); return; }
      if (F.catOpen != null && !t.closest('.pxl-dd')) F.catOpen = null;
      if (d.k === 'q') { if (!F.ddOpen) { F.ddOpen = true; F.q = ''; draw(); var i = root.querySelector('[data-k="q"]'); if (i) i.focus(); } return; }
      if (d.pid) { setPid(d.pid); F.err = ''; draw(); return; }
      if (F.ddOpen && !t.closest('.pxl-dd')) F.ddOpen = false;
      if (d.act) F.act = d.act;
      else if (d.by) { F.by = d.by; if (d.by !== 'Family member') F.rel = ''; if (!F.contactTyped) { var p = pt(F.pid); F.contact = d.by === 'Family member' && p ? (p.phone || '') : ''; if (d.by === 'Family member' && p && p.gRel && REL.indexOf(p.gRel) >= 0) F.rel = p.gRel; } }
      else if (d.rel) F.rel = d.rel;
      else if (d.src) F.src = d.src;
      else if (d.when) { var w = d.when.split(':'); F.issues[+w[0]].when = w[1]; }
      else if (d.sev) F.sev = d.sev;
      else if (d.rm) F.issues.splice(+d.rm, 1);
      else if (d.x === 'add') F.issues.push({ t: '', cat: '', when: '', what: '' });
      else if (d.x === 'save') { save(); return; }
      else if (d.x === 'close') { close(); return; }
      else if (d.x === 'back') { close(); self.setState({ logOpen: true, form: Object.assign({}, self.state.form, { kind: '' }) }); return; }
      F.err = ''; draw();
    });
    root.addEventListener('input', function (e) {
      var t = e.target, k = t.dataset.k, i = t.dataset.i; F.fi = i != null ? +i : null;
      if (k === 'q') { F.q = t.value; F.ddOpen = true; draw(); return; }
      if (k === 'contact') { F.contact = t.value; F.contactTyped = true; return; }
      if (k === 'note') { F.note = t.value; return; }
      if (k === 'staff') { F.staff = t.value; return; }
      if (k === 'me') { F.me = t.value; return; }
      if (k === 't' || k === 'what') { F.issues[+i][k] = t.value; return; }
    });
    root.addEventListener('change', function (e) {
      var t = e.target, k = t.dataset.k, i = t.dataset.i;
      if (k === 'cat') { F.issues[+i].cat = t.value; F.owner = ''; if (F.sev && SEV.indexOf(F.sev) < SEV.indexOf(minSev())) F.sev = ''; F.fi = null; F.err = ''; draw(); }
      else if (k === 'when') F.issues[+i].when = t.value;
      else if (k === 'act') { F.act = t.value; F.err = ''; draw(); }
      else if (k === 'src') F.src = t.value;
      else if (k === 'rel') F.rel = t.value;
      else if (k === 'sev') { F.sev = t.value; F.sevSet = !!t.value; F.owner = ''; draw(); }
      else if (k === 'by') { F.by = t.value; if (F.by !== 'Family member') F.rel = ''; if (!F.contactTyped) { var p = pt(F.pid); F.contact = F.by === 'Family member' && p ? (p.phone || '') : ''; if (F.by === 'Family member' && p && p.gRel && REL.indexOf(p.gRel) >= 0) F.rel = p.gRel; } F.err = ''; draw(); }
      else if (k === 'escBy') { F.escBy = t.value; F.err = ''; }
      else if (k === 'owner') F.owner = t.value;
    });
    root.addEventListener('keydown', function (e) {
      if (e.target.dataset.k !== 'q' || e.key !== 'Enter') return;
      var b = root.querySelector('.pxl-dd button[data-pid]'); if (b) { e.preventDefault(); setPid(b.dataset.pid); draw(); }
    });
  }

  window.PXLog = {
    open: function (app, pid) {
      self = app; close(); css();
      F = { act: '', pid: '', q: '', ddOpen: false, by: '', rel: '', src: '', escBy: '', issues: [{ t: '', cat: '', when: '', what: '' }], sev: '', owner: '', contact: '', contactTyped: false, note: '', err: '', fi: null, staff: '', me: '', sevSet: false, catOpen: null };
      try { F.me = localStorage.getItem('px_me_name') || ''; } catch (e) {}
      if (pid && pt(pid)) setPid(pid);
      root = document.createElement('div'); root.className = 'pxl-ov'; document.body.appendChild(root);
      bind(); document.addEventListener('keydown', onKey); draw();
    }
  };
})();
