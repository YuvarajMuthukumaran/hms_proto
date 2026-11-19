/* 19 Nov 2026 (meeting) Patient Experience > Rounds (public/px/rounds-v2.js):
   1. With a full ward (more than 30 patients) each patient has ONE round a day: morning, afternoon or evening in thirds by floor and room (about 30 at a time).
      Flags and new admissions still come back on later rounds. Small demo rosters behave as before.
   2. The AI scribe is one big bar above the three rounds: start it once, it records the whole round, and each patient you open gets their own draft.
   3. "Report a room issue" is a large amber button with a bigger drop-down. */
const fs = require('fs');
const file = 'public/px/rounds-v2.js';
let t = fs.readFileSync(file, 'utf8');
const crlf = t.includes('\r\n');
t = t.replace(/\r\n/g, '\n');
function R(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 80)); t = t.split(a).join(b); }

R("  /* who is on which round, and why */\n",
`  /* 19 Nov: a full ward has ONE round a day per patient (thirds by floor and room, about 30 at a time), not everyone every morning. */
  var split = function () { return P().length > 30; };
  var slotCache = { key: '', m: {} };
  var slotOf = function (p) {
    var L = P(), key = L.length + ':' + (L[0] ? L[0].id : '') + ':' + (L[L.length - 1] ? L[L.length - 1].id : '');
    if (slotCache.key !== key) {
      var S2 = L.slice().sort(function (a, b) { return String(a.floor || '').localeCompare(String(b.floor || '')) || String(a.room || '').localeCompare(String(b.room || ''), undefined, { numeric: true }) || String(a.name).localeCompare(String(b.name)); });
      slotCache = { key: key, m: {} };
      S2.forEach(function (x, i) { slotCache.m[x.id] = ['M', 'A', 'E'][Math.min(2, Math.floor(i * 3 / S2.length))]; });
    }
    return slotCache.m[p.id] || 'M';
  };
  /* who is on which round, and why */
`);
R("    if (r === 'M') out.push(vip ? 'VVIP' : 'Allocated to you');",
  "    if (split() ? slotOf(p) === r : r === 'M') out.push(vip ? 'VVIP' : 'Allocated to you');");

/* scribe: draft box only in the patient panel */
const a = t.indexOf("    var scr =\n");
const bMark = "Tell the patient before recording. Only text is kept, no audio.</div>';\n";
const b = t.indexOf(bMark, a);
if (a < 0 || b < 0) throw new Error('scr block not found');
t = t.slice(0, a) +
`    var dr = state.drafts && state.drafts[p.id];
    var scr = dr ? '<div style="background:#F2F7FF;border:1px solid #D5E4FB;border-radius:10px;padding:8px 10px;font-size:13px"><b>AI scribe draft</b><div style="margin:4px 0">' + esc(dr) + '</div><div class="rv-btns"><button class="rv-b pri" onclick="RV2.useDraft()">Use this</button><button class="rv-b" onclick="RV2.discardDraft()">Discard</button></div></div>'
      : (SR.on ? '<div style="font-size:12px;color:#B42318">● The round scribe is listening to this patient.</div>' : '');
` + t.slice(b + bMark.length);

R("      cards(D) + '<div class=\"rv-fl\">'", "      scribeBar() + cards(D) + '<div class=\"rv-fl\">'");

/* room issue button */
R("'<div><button class=\"rv-b\" onclick=\"RV2.roomToggle()\">' + (state.roomOpen ? 'Hide room issue' : 'Report a room issue (optional)') + '</button>' + (state.roomOpen ? '<select id=\"rvRoom\" onchange=\"RV2.room(this.value)\" style=\"margin-top:8px\">",
  "'<div style=\"border:2px solid #F79009;background:#FFFAEB;border-radius:12px;padding:10px\"><button class=\"rv-b\" style=\"width:100%;background:#F79009;border-color:#F79009;color:#fff;font-size:15px;padding:12px\" onclick=\"RV2.roomToggle()\">' + (state.roomOpen ? 'Hide the issue list' : '⚠ Report an issue (room, food, noise, safety)') + '</button>' + (state.roomOpen ? '<select id=\"rvRoom\" onchange=\"RV2.room(this.value)\" style=\"margin-top:10px;height:46px;font-size:15px;border:2px solid #F79009\">");

/* session scribe */
R("  var RV2 = window.RV2 = {",
`  /* 19 Nov: one AI scribe for the whole round. Start it once; it records continuously, and each time you open another patient (or save) the part for the
     previous patient is sent to the scribe and comes back as a draft on THAT patient. Nothing is filled in until "Use this". */
  var SR = { on: false, stream: null, mr: null, msg: '', busy: 0 };
  function scribeBar() {
    return '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:' + (SR.on ? '#FEF3F2' : '#F2F7FF') + ';border:2px solid ' + (SR.on ? '#F04438' : '#1E6CDB') + ';border-radius:14px;padding:12px 16px">' +
      '<button class="rv-b pri" style="font-size:16px;padding:12px 22px;' + (SR.on ? 'background:#D92D20;border-color:#D92D20' : '') + '" onclick="RV2.scribe()">' + (SR.on ? '■ Stop the round scribe' : '● Start AI scribe for this round') + '</button>' +
      '<div style="flex:1;min-width:220px;font-size:13px;color:#344054"><b>AI scribe</b>: start it once and it listens for the whole round. Open each patient as you go; the words are drafted for that patient and you check them, then press Use this.' +
      (SR.msg ? '<div style="margin-top:4px;color:#475467">' + esc(SR.msg) + '</div>' : '') + '<div style="font-size:12px;color:#667085;margin-top:2px">Tell patients before recording. Only text is kept, no audio.</div></div></div>';
  }
  function srSeg() {
    if (!SR.on || !SR.stream) return;
    var pid = state.sel || '', chunks = [];
    try {
      var mr = new MediaRecorder(SR.stream);
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function () { if (pid && chunks.length) srSend(pid, chunks); };
      mr.start(); SR.mr = mr;
    } catch (e) {}
  }
  function srCut() { try { if (SR.mr && SR.mr.state !== 'inactive') SR.mr.stop(); } catch (e) {} SR.mr = null; }
  function srSend(pid, chunks) {
    var fd = new FormData(); fd.append('audio', new Blob(chunks, { type: 'audio/webm' }), 'round.webm');
    fd.append('schema', JSON.stringify({ mode: 'transcript', hint: 'Hindi and English mixed. A short talk with a hospital patient about how they are.' }));
    SR.busy++;
    fetch('/api/scribe', { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (j) {
      SR.busy--; var txt = (j && (j.transcript || j.text || j.note)) || '';
      if (txt) { state.drafts = state.drafts || {}; state.drafts[pid] = txt; SR.msg = 'A draft is ready. Open that patient and press Use this.'; } else SR.msg = 'The scribe could not draft one part. Type it instead.';
      draw();
    }).catch(function () { SR.busy--; SR.msg = 'The AI scribe is not available now. Type it instead.'; draw(); });
  }
  var RV2 = window.RV2 = {`);

R("    useDraft: function () { var s = state.scribe || {}; if (!s.draft) return; state.words = s.draft; if (!state.ans) state.ans = 'tell'; s.draft = ''; s.msg = 'Filled in. You can edit everything.'; draw(); },\n    discardDraft: function () { var s = state.scribe || {}; s.draft = ''; s.msg = 'Draft discarded.'; draw(); }\n  };",
`    useDraft: function () { var d = (state.drafts || {})[state.sel]; if (!d) return; state.words = d; if (!state.ans) state.ans = 'tell'; delete state.drafts[state.sel]; draw(); },
    discardDraft: function () { if (state.drafts) delete state.drafts[state.sel]; draw(); }
  };
  /* the round scribe follows the patient you open */
  ['open', 'save', 'close', 'round'].forEach(function (k) { var o = RV2[k]; RV2[k] = function () { srCut(); var r = o.apply(this, arguments); srSeg(); return r; }; });
  RV2.scribe = function () {
    if (SR.on) { srCut(); SR.on = false; try { SR.stream.getTracks().forEach(function (x) { x.stop(); }); } catch (e) {} SR.stream = null; SR.msg = 'Stopped. Drafts appear on each patient.'; draw(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { SR.msg = 'This device cannot record.'; draw(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) { SR.stream = s; SR.on = true; SR.msg = 'Recording the round. Open a patient to start their part.'; srSeg(); draw(); }).catch(function () { SR.msg = 'Allow the microphone to record.'; draw(); });
  };`);

fs.writeFileSync(file, crlf ? t.replace(/\n/g, '\r\n') : t);
console.log('ok', file);
/* second pass: with the ward split in thirds, "missed this morning" only applies to the patients whose round was the morning */
require('./rep.cjs')('public/px/rounds-v2.js', [["      if (!v.M && passed('M')) out.push('Missed this morning');", "      if (!v.M && passed('M') && (!split() || slotOf(p) === 'M')) out.push('Missed this morning');"]]);
