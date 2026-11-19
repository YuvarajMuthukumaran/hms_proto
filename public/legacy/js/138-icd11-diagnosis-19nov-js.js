
/* ICD-11 Diagnosis Integration (19 Nov 2026).
   Three connected changes:
   1. Provisional diagnosis — replace free-text in the Plans ICD picker with a structured
      {code, label} object saved to S.dx and reflected everywhere p.dx is read.
   2. Differential diagnosis — add S.ddx[] (array of {code,label}) with its own ICD-11
      multi-picker on the Plans tab, shown on Stay Summary and Discharge Summary.
   3. Subsequent change log — when S.dx changes, append the previous value to S.dxLog[]
      with timestamp + author; show a collapsed history on the Stay Summary diagnosis card.
   Only psychiatrists (and the floor lead acting as a psychiatrist) can edit. */

(function () {

  /* ── 1. Augment state defaults ──────────────────────────────────────── */
  if (!S.dxCode)  S.dxCode  = '6A60.0';          // ICD-11 code of current provisional dx
  if (!S.dxLog)   S.dxLog   = [];                 // [{code,label,changedAt,changedBy}]
  if (!S.ddx)     S.ddx     = [];                 // [{code,label}] differential diagnoses
  if (!S.dxAdmit) S.dxAdmit = {                   // snapshot locked at admission
    code:  S.dxCode,
    label: S.dx
  };

  /* ── 2. Helper: format a diagnosis for display ──────────────────────── */
  function dxFmt(code, label) {
    return code ? code + ' · ' + label : label;
  }

  /* ── 3. Rewrite icdList() to save {code, label} and log changes ─────── */
  const _origIcdList = window.icdList;
  window.icdList = function icdList(q) {
    return ICD
      .filter(x => (x[0] + ' ' + x[1]).toLowerCase().includes(q.toLowerCase()))
      .map(x => {
        const code  = x[0].replace(/'/g, "\\'");
        const label = x[1].replace(/'/g, "\\'");
        return `<button class="tab" style="text-align:left;white-space:normal"
          onclick="icdPickDx('${code}','${label}')"
        ><strong>${x[0]}</strong> · ${x[1]}</button>`;
      }).join('') || '<span class="small muted">No match</span>';
  };

  /* Called by each ICD button — saves code+label, logs any change. */
  window.icdPickDx = function (code, label) {
    if (S.dx !== label || S.dxCode !== code) {
      // Log the previous value before overwriting
      if (S.dx) {
        S.dxLog.unshift({
          code:      S.dxCode || '',
          label:     S.dx,
          changedAt: atNow(),
          changedBy: me().name
        });
      }
      S.dxCode = code;
      S.dx     = label;
    }
    // Update the inline "Selected:" text without a full re-render
    const el = document.getElementById('icds');
    if (el) el.textContent = dxFmt(code, label);
    toast('Diagnosis updated · ' + code + ' · ' + label);
  };

  /* ── 4. Differential diagnosis picker helpers ───────────────────────── */
  window.ddxList = function (q) {
    return ICD
      .filter(x => (x[0] + ' ' + x[1]).toLowerCase().includes(q.toLowerCase()))
      .map(x => {
        const code  = x[0].replace(/'/g, "\\'");
        const label = x[1].replace(/'/g, "\\'");
        const already = S.ddx.some(d => d.code === x[0]);
        return `<button class="tab ${already ? 'on' : ''}" style="text-align:left;white-space:normal"
          onclick="ddxToggle('${code}','${label}')"
        ><strong>${x[0]}</strong> · ${x[1]}${already ? ' ✓' : ''}</button>`;
      }).join('') || '<span class="small muted">No match</span>';
  };

  window.ddxFilter = function (v) {
    const el = document.getElementById('ddxl');
    if (el) el.innerHTML = ddxList(v);
  };

  /* Toggle a code in/out of S.ddx */
  window.ddxToggle = function (code, label) {
    const idx = S.ddx.findIndex(d => d.code === code);
    if (idx >= 0) {
      S.ddx.splice(idx, 1);
      toast('Removed from differential: ' + code);
    } else {
      S.ddx.push({ code, label });
      toast('Added to differential: ' + code + ' · ' + label);
    }
    // Refresh the picker list in-place
    const qEl = document.getElementById('ddxq');
    ddxFilter(qEl ? qEl.value : '');
    // Refresh selected chips
    const tagEl = document.getElementById('ddx-tags');
    if (tagEl) tagEl.innerHTML = ddxTags();
  };

  function ddxTags() {
    if (!S.ddx.length) return '<span class="small muted">None selected</span>';
    return S.ddx.map(d =>
      `<span class="chip c-blue" style="cursor:pointer" title="Click to remove"
        onclick="ddxToggle('${d.code.replace(/'/g,"\\'")}','${d.label.replace(/'/g,"\\'")}')">
        ${d.code} · ${d.label} ×
      </span>`
    ).join(' ');
  }

  /* ── 5. Build the full ICD-11 section for the Plans tab ─────────────── */
  function dxSection() {
    const canEdit = isPsy();
    const selectedFmt = S.dxCode
      ? `<strong>${S.dxCode}</strong> · ${S.dx}`
      : `<strong>${S.dx}</strong>`;

    const picker = canEdit ? `
      <input class="input" id="icdq" placeholder="Search provisional diagnosis or code"
             oninput="icdFilter(this.value)" value="" style="margin-bottom:4px">
      <div id="icdl" class="box"
           style="display:flex;flex-direction:column;gap:2px;max-height:170px;overflow:auto">
        ${icdList('')}
      </div>` : '';

    // Change log (collapsed)
    const logHtml = S.dxLog.length ? `
      <details style="margin-top:6px">
        <summary class="small" style="cursor:pointer;color:var(--ink-2)">
          ${S.dxLog.length} earlier diagnosis${S.dxLog.length > 1 ? 'es' : ''}
        </summary>
        <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px">
          ${S.dxLog.map(e => `
            <div class="small" style="color:var(--ink-2)">
              ${e.code ? `<strong>${e.code}</strong> · ` : ''}${hesc(e.label)}
              <span class="tiny muted"> · changed ${hesc(e.changedAt)} by ${hesc(e.changedBy)}</span>
            </div>`).join('')}
        </div>
      </details>` : '';

    // Differential diagnosis
    const ddxPicker = canEdit ? `
      <input class="input" id="ddxq" placeholder="Search differential diagnosis or code"
             oninput="ddxFilter(this.value)" value="" style="margin-bottom:4px">
      <div id="ddxl" class="box"
           style="display:flex;flex-direction:column;gap:2px;max-height:140px;overflow:auto">
        ${ddxList('')}
      </div>` : '';

    return `
      <!-- Provisional diagnosis -->
      <div class="field">
        <span class="lbl">Provisional diagnosis · ICD-11</span>
        ${picker}
        <div class="small" style="margin-top:4px">
          Selected: <span id="icds">${selectedFmt}</span>
        </div>
        ${logHtml}
      </div>

      <!-- Differential diagnosis -->
      <div class="field" style="margin-top:4px">
        <span class="lbl">Differential diagnosis · ICD-11 (select one or more)</span>
        ${ddxPicker}
        <div id="ddx-tags" style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">
          ${ddxTags()}
        </div>
      </div>`;
  }

  /* ── 6. Patch pPlans() to inject the new ICD section ────────────────── */
  const __pp138 = window.pPlans;
  window.pPlans = function pPlans() {
    const html = __pp138.apply(this, arguments);
    // The original ICD block is a single <div class="field"> whose label text
    // starts with "Diagnosis · ICD-11". We replace it with the full new section.
    // Use a broad regex anchored to the unique label text.
    const replaced = html.replace(
      /<div class="field"><span class="lbl">Diagnosis · ICD-11[^<]*<\/span>[\s\S]*?<\/div>\s*<\/div>/,
      dxSection()
    );
    // If the pattern didn't match (layout changed), insert before first <label class="field">
    if (replaced === html) {
      return html.replace(
        /(<div class="pad"[^>]*>)([\s\S]*?)(<label class="field">)/,
        '$1$2' + dxSection() + '$3'
      );
    }
    return replaced;
  };

  /* ── 7. Patch Stay Summary (pOverview / card) to show code + ddx ─────── */
  // The Stay Summary renders line 728: card(ic.dx,'Primary diagnosis',S.dx,'6A60.0 · ICD-11')
  // We intercept at render time by patching the card() helper inside pOverview.
  // Safer: hook the render output via a MutationObserver on #view, updating two specific nodes.

  function updateStaySummaryDx() {
    // Look for the "Primary diagnosis" card value element
    document.querySelectorAll('.dp .sval, .tl .sval, [data-dx]').forEach(el => {
      if (el.dataset.dxPatched) return;
      el.dataset.dxPatched = '1';
    });

    // Find .sbox elements whose label text is "Primary diagnosis"
    document.querySelectorAll('.sbox').forEach(box => {
      const lbl = box.querySelector('.lbl');
      const val = box.querySelector('.sval');
      if (!lbl || !val) return;
      if (lbl.textContent.trim() === 'Primary diagnosis') {
        // Update value with code
        val.innerHTML = `<strong>${hesc(S.dxCode || '')}</strong>${S.dxCode ? ' · ' : ''}${hesc(S.dx)}`;
        // Add differential under the value if any
        const existDdx = box.querySelector('.ddx-inline');
        if (S.ddx.length && !existDdx) {
          const d = document.createElement('div');
          d.className = 'ddx-inline tiny muted';
          d.style.marginTop = '4px';
          d.innerHTML = '<strong>Differential:</strong> ' +
            S.ddx.map(x => `${hesc(x.code)} · ${hesc(x.label)}`).join('; ');
          box.appendChild(d);
        } else if (existDdx) {
          if (S.ddx.length) {
            existDdx.innerHTML = '<strong>Differential:</strong> ' +
              S.ddx.map(x => `${hesc(x.code)} · ${hesc(x.label)}`).join('; ');
          } else {
            existDdx.remove();
          }
        }
        // Add dx log count badge if any changes
        const existLog = box.querySelector('.dxlog-badge');
        if (S.dxLog.length && !existLog) {
          const badge = document.createElement('div');
          badge.className = 'dxlog-badge tiny muted';
          badge.style.marginTop = '2px';
          badge.textContent = S.dxLog.length + ' prior diagnosis' + (S.dxLog.length > 1 ? 'es' : '') + ' on record';
          box.appendChild(badge);
        }
      }
    });

    // Update any <strong id="icds"> in the Plans tab
    const icds = document.getElementById('icds');
    if (icds && S.dxCode) icds.innerHTML = `<strong>${hesc(S.dxCode)}</strong> · ${hesc(S.dx)}`;
  }

  /* ── 8. Patch Discharge Summary to use dynamic provisional + ddx ──────── */
  // The discharge summary at line 1466 hardcodes 'Bipolar affective disorder, current episode manic'
  // We intercept pDischarge (called in render) by patching the DOM after render.
  function patchDischargeSummary() {
    // Find textarea whose label is "Admitting diagnosis (provisional)"
    document.querySelectorAll('label.field').forEach(lf => {
      const lbl = lf.querySelector('.lbl');
      const ta  = lf.querySelector('textarea');
      if (!lbl || !ta) return;
      if (/Admitting diagnosis/i.test(lbl.textContent) && !ta.dataset.dxWired) {
        ta.dataset.dxWired = '1';
        // Set the value to the admission snapshot
        ta.value = dxFmt(S.dxAdmit.code, S.dxAdmit.label);
      }
      if (/Discharge diagnosis/i.test(lbl.textContent) && !ta.dataset.dxWired) {
        ta.dataset.dxWired = '1';
        ta.value = dxFmt(S.dxCode, S.dx);
      }
    });

    // Insert a "Differential diagnosis" row after Discharge diagnosis if not already present
    const fields = [...document.querySelectorAll('label.field')];
    const dischIdx = fields.findIndex(f => {
      const l = f.querySelector('.lbl');
      return l && /Discharge diagnosis/i.test(l.textContent);
    });
    if (dischIdx >= 0 && S.ddx.length) {
      const ref = fields[dischIdx];
      if (!ref.nextElementSibling || !/Differential/i.test((ref.nextElementSibling.querySelector('.lbl') || {}).textContent || '')) {
        const ddxField = document.createElement('label');
        ddxField.className = 'field';
        ddxField.innerHTML = `<span class="lbl">Differential diagnosis (ICD-11)</span>
          <textarea class="input" style="min-height:48px">${
            S.ddx.map(d => dxFmt(d.code, d.label)).join('\n')
          }</textarea>`;
        ref.insertAdjacentElement('afterend', ddxField);
      }
    }
  }

  /* ── 9. Patch the History form 'Provisional diagnosis (ICD)' field ──── */
  // The history form field at line 1766 is a plain text input 'i'.
  // We pre-fill it after render.
  function patchHistoryFormDx() {
    // History form fields are rendered as <label class="field"><span>…</span><input class="input">
    document.querySelectorAll('label.field').forEach(lf => {
      const lbl = lf.querySelector('span');
      const inp = lf.querySelector('input.input');
      if (!lbl || !inp || inp.dataset.dxWired) return;
      const t = lbl.textContent.trim();
      if (t === 'Provisional diagnosis (ICD)' && !inp.value) {
        inp.value = dxFmt(S.dxCode, S.dx);
        inp.dataset.dxWired = '1';
      }
      if (t === 'Final diagnosis (ICD)' && !inp.value) {
        inp.value = dxFmt(S.dxCode, S.dx);
        inp.dataset.dxWired = '1';
      }
      if (t === 'Subsequent change in diagnosis, if any' && !inp.value && S.dxLog.length) {
        inp.value = S.dxLog.map(e =>
          (e.code ? e.code + ' · ' : '') + e.label + ' (changed ' + e.changedAt + ' by ' + e.changedBy + ')'
        ).join('\n');
        inp.dataset.dxWired = '1';
      }
    });
  }

  /* ── 10. Run post-render patches via MutationObserver ───────────────── */
  const _view = document.getElementById('view');
  if (_view) {
    new MutationObserver(() => {
      updateStaySummaryDx();
      patchDischargeSummary();
      patchHistoryFormDx();
    }).observe(_view, { childList: true, subtree: false });
  }

  /* Also run once immediately in case the page is already rendered */
  updateStaySummaryDx();
  patchDischargeSummary();
  patchHistoryFormDx();

  /* ── 11. CSS — small additions ───────────────────────────────────────── */
  const css = document.createElement('style');
  css.id = 'icd11-dx-css';
  css.textContent = `
  /* Differential tag chip remove cursor */
  #ddx-tags .chip { font-size: 12.5px; line-height: 1.4; }
  /* Change log details */
  details > summary { user-select: none; }
  details > summary::-webkit-details-marker { color: var(--ink-2); }
  /* Diagnosis card: show code in bold */
  .sbox .sval strong { color: var(--ink); }
  `;
  document.head.appendChild(css);

})();
