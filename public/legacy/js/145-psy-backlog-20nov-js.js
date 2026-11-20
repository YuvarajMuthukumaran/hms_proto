/* 20 Nov 2026, Trello Backlog (screenshots read from the cards). PSYCHIATRIST login only (gated on the role).
   1. Patient tabs reordered and reworded: Stay summary, Admission work up, Daily notes, Reassessment, Capacity assessment, Ongoing Treatment, Rounds,
      Therapy Plans, OPD records, Patient Experience, Discharge summary. The Management Plan tab is gone: the plan is a section of Admission work up,
      right after the Detailed history.
   2. Admission forms: a form that is already signed / e-signed / uploaded shows Open Form only (no Upload signed copy, no Collect e-signature).
   3. Today table: the Type of a family-call row is "Family" (it said Documentation everywhere).
   4. Detailed history form: Provisional and Differential diagnosis are type-and-search ICD-11 lists. The provisional pick is also the patient's diagnosis. */
(function () {
  if (String((window.__TULASI__ || {}).role || '') !== 'psychiatrist') return;
  const hesc2 = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pidNow = () => { const m = (location.hash || '').match(/^#\/patient\/([^/]+)/); return m ? decodeURIComponent(m[1]) : ''; };

  /* ---------- 1. tab order and names ---------- */
  const ORDER = ['Stay summary', 'Past admissions', 'Admission work up', 'Daily notes', 'Reassessment', 'Capacity assessment', 'Ongoing Treatment', 'Rounds', 'Therapy Plans', 'OPD records', 'Patient Experience', 'Discharge summary'];
  const RENAME = { 'Admission': 'Admission work up', 'Treatment Plan': 'Ongoing Treatment', 'OPD': 'OPD records' };
  function reassess() {
    const pid = pidNow();
    try {
      CD_DATA = cdLoad();
      const it = cdItems(pid).filter(i => i.form && i.form.id === 'reassessment');
      if (!it.length) { toast('Reassessment is weekly from day 7. Nothing is due yet.'); return; }
      const pick = it.find(i => i.status === 'Overdue') || it.find(i => i.status === 'Due') || it.find(i => i.status === 'Pending') || it[0];
      psyDocOpen(pick.entryKey);
    } catch (e) { toast('Reassessment could not be opened here.'); }
  }
  window.psyReassess145 = reassess;
  function tabs() {
    const bar = document.querySelector('#view .subtabs'); if (!bar || !pidNow()) return;
    const kids = [...bar.children];
    kids.forEach(b => {
      const t = b.textContent.replace(/[●•]/g, '').trim();
      if (/^Management Plan/i.test(t)) { b.style.display = 'none'; b.dataset.mp145 = '1'; return; }
      if (RENAME[t]) { const dot = b.querySelector('.dot'); b.firstChild && b.firstChild.nodeType === 3 ? (b.firstChild.nodeValue = RENAME[t]) : (b.textContent = RENAME[t]); if (dot && !b.contains(dot)) b.appendChild(dot); }
    });
    if (!kids.some(b => /^Reassessment/.test(b.textContent.trim())) && !bar.querySelector('[data-re145]')) {
      const base = kids.find(b => /^Daily notes/.test(b.textContent.trim()));
      if (base) { const n = document.createElement('button'); n.className = 'subtab'; n.type = 'button'; n.setAttribute('role', 'tab'); n.dataset.re145 = '1'; n.textContent = 'Reassessment'; n.onclick = reassess; bar.appendChild(n); }
    }
    const all = [...bar.children].filter(b => !b.dataset.mp145);
    const rank = b => { const i = ORDER.indexOf(b.textContent.replace(/[●•]/g, '').trim()); return i < 0 ? ORDER.indexOf('Discharge summary') - 0.5 : i; };
    const sorted = all.slice().sort((a, b) => rank(a) - rank(b));
    if (sorted.some((b, i) => b !== all[i])) sorted.forEach(b => bar.appendChild(b));
    [...bar.children].filter(b => b.dataset.mp145).forEach(b => bar.appendChild(b));
  }

  /* ---------- 1b. Management plan inside Admission work up, after the Detailed history ---------- */
  function mpInAdmission() {
    if (!/^#\/patient\/[^/]+\/admission/.test(location.hash || '')) return;
    const v = document.getElementById('view'); if (!v || v.querySelector('#mp145')) return;
    const steps = v.querySelector('.adm-steps'); if (!steps || typeof pPlans !== 'function') return;
    const cards = [...v.querySelectorAll('section.card')].filter(s => !s.closest('#mp145'));
    const hist = cards.find(s => /^\s*Detailed history/i.test(s.innerText || ''));
    const anchor = hist || cards.filter(s => (steps.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING)).pop() || steps;
    let html = ''; try { html = pPlans(); } catch (e) { return; }
    if (!html) return;
    const d = document.createElement('div'); d.id = 'mp145'; d.style.cssText = 'margin-top:16px'; d.innerHTML = html;
    anchor.insertAdjacentElement('afterend', d);
  }

  /* ---------- 2. Admission forms: signed forms keep one button ---------- */
  function forms() {
    document.querySelectorAll('#consentCard tbody tr, #formcCard tbody tr').forEach(tr => {
      const st = tr.querySelector('.cs'); if (!st || tr.dataset.f145) return;
      const txt = (st.textContent || '').trim();
      if (!/^(E-signed|Signed|Uploaded)/i.test(txt) || st.classList.contains('due')) return;
      tr.dataset.f145 = '1';
      const collect = [...tr.querySelectorAll('button')].find(b => /^(Collect e-signature|Open Form)$/.test(b.textContent.trim()));
      const m = collect && (collect.getAttribute('onclick') || '').match(/psyEsignOpen\('([^']+)'\)|acrOpenForm\('([^']+)'\)/);
      const fid = m && (m[1] || m[2]);
      tr.querySelectorAll('label.btn').forEach(l => { if (/Upload signed copy/i.test(l.textContent)) l.remove(); });
      if (collect && /Collect e-signature/.test(collect.textContent) && fid) { collect.textContent = 'Open Form'; collect.setAttribute('onclick', "acrOpenForm('" + fid + "')"); }
    });
  }

  /* ---------- 3. Today: Type of a family-call row ---------- */
  function types() {
    document.querySelectorAll('#dtBody tr').forEach(tr => {
      const ty = tr.querySelector('.pd-ty'), cell = tr.children[2]; if (!ty || !cell || ty.dataset.t145) return;
      if (ty.textContent.trim() !== 'Documentation') return;
      const t = cell.innerText || '';
      const to = /(24 hour|day 3 to 4) call|family|caregiver/i.test(t) ? 'Family' : /capacity|form e|section 8|section 9|mhca|mhrb|advance directive/i.test(t) ? 'MHCA' : /\blab\b|\becg\b|result|level/i.test(t) ? 'Investigation' : '';
      if (to) { ty.textContent = to; ty.className = 'pd-ty'; ty.dataset.t145 = '1'; }
    });
  }

  /* ---------- 4. ICD-11 type-and-search in the Detailed history form ---------- */
  function icdPick(inp, multi, code, label) {
    const line = code + ' · ' + label;
    if (multi) {
      const cur = inp.value.split(';').map(x => x.trim()).filter(Boolean); cur.pop();
      inp.value = cur.concat(line).join('; ') + '; ';
      try { if (!S.ddx.some(d => d.code === code)) S.ddx.push({ code, label }); } catch (e) {}
    } else {
      inp.value = line;
      try { icdPickDx(code, label); } catch (e) {}
      try { const p = ptFind(pidNow()); if (p) p.dx = label; } catch (e) {}
    }
    inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function icd() {
    if (typeof ICD === 'undefined') return;
    document.querySelectorAll('label.field, label.hf').forEach(lf => {
      const lbl = lf.querySelector('span'), inp = lf.querySelector('input.input'); if (!lbl || !inp || inp.dataset.icd145) return;
      const t = lbl.textContent.trim(), multi = /^Differential diagnosis \(ICD\)$/.test(t);
      if (!multi && !/^Provisional diagnosis/.test(t)) return;
      inp.dataset.icd145 = '1'; inp.setAttribute('autocomplete', 'off'); inp.placeholder = multi ? 'Type a code or name, pick one, add more' : 'Type a code or name (ICD-11)';
      const box = document.createElement('div'); box.style.cssText = 'display:none;border:1px solid #D0D5DD;border-radius:10px;background:#fff;max-height:220px;overflow:auto;margin-top:4px;box-shadow:0 6px 16px rgba(16,24,40,.12)';
      inp.insertAdjacentElement('afterend', box);
      let busy = false;
      const show = () => {
        if (busy) return;
        const q = (multi ? inp.value.split(';').pop() : inp.value).trim().toLowerCase();
        if (q.length < 1 || (!multi && /^[0-9A-Z.]+ · /.test(inp.value) && ICD.some(x => x[0] + ' · ' + x[1] === inp.value))) { box.style.display = 'none'; return; }
        const hit = ICD.filter(x => (x[0] + ' ' + x[1]).toLowerCase().includes(q)).slice(0, 12);
        box.innerHTML = hit.length ? hit.map((x, i) => '<button type="button" data-i="' + i + '" style="display:block;width:100%;text-align:left;border:0;background:#fff;padding:8px 12px;font:inherit;cursor:pointer"><b>' + hesc2(x[0]) + '</b> · ' + hesc2(x[1]) + '</button>').join('') : '<div style="padding:8px 12px;color:#667085">No match</div>';
        box.style.display = 'block'; box._hit = hit;
      };
      inp.addEventListener('input', show);
      inp.addEventListener('focus', show);
      box.addEventListener('mousedown', e => {
        const b = e.target.closest('button[data-i]'); if (!b) return; e.preventDefault();
        const x = box._hit[+b.dataset.i]; busy = true; icdPick(inp, multi, x[0], x[1]); busy = false; box.style.display = 'none';
      });
      inp.addEventListener('blur', () => setTimeout(() => { box.style.display = 'none'; }, 150));
    });
  }

  function run() { tabs(); mpInAdmission(); forms(); types(); icd(); }
  const __r = render;
  render = function () { const o = __r.apply(this, arguments); try { run(); } catch (e) {} setTimeout(() => { try { run(); } catch (e) {} }, 300); return o; };
  const v = document.getElementById('view');
  if (v) new MutationObserver(() => { try { run(); } catch (e) {} }).observe(v, { childList: true });
  setTimeout(() => { try { run(); } catch (e) {} }, 400);
})();
