/* 20 Nov 2026 (Trello Backlog): Patient Experience.
   - Log a call or concern: today's random calls drop off the list once called; grievance pop-up (one "What is it about?" field that routes itself,
     severity changes the clock, clinical issues go to the floor lead psychiatrist, one escalation line).
   - Patients page: Sort is a drop-down next to Ward; Preferences is a full page, not a pop-up.
   - Rounds: round cards count only the patients allocated to that round (carried-over ones are shown as "+N to follow up"). */
const fs = require('fs');
const rd = f => fs.readFileSync(f, 'utf8');
function rep(s, a, b, label) { const n = s.split(a).length - 1; if (n !== 1) throw new Error(label + ' match ' + n + ': ' + a.slice(0, 80)); return s.split(a).join(b); }

/* ---- 1. lead prototype template ---- */
{
  const file = 'public/px-lead-prototype.html'; const src = rd(file);
  const tag = '<script type="__bundler/template">';
  const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
  let t = JSON.parse(src.slice(i0, i1).trim());
  const R = (a, b) => { t = rep(t, a, b, 'tpl'); };
  const a0 = t.indexOf('      <div class="field"><label>Category tag · who should see it first</label>');
  const a1 = t.indexOf('      <div class="field"><label>Goes to</label>');
  if (a0 < 0 || a1 < a0) throw new Error('tag row');
  t = t.slice(0, a0) + t.slice(a1);
  R('<label for="lc">Category</label>', '<label for="lc">What is it about?</label>');
  R('<div class="muted small">Picked from the category. You can change it after saving.</div>', '<div class="muted small">Picked from what it is about and how serious it is. You can change it after saving.</div>');
  R("    var route = s.form.sev === 'High' ? ['S Chandra', 'GM Operations'] : (R[s.form.category] || R['Other']);",
    "    var pxClin = ['Doctor communication', 'Treatment progress', 'Family updates', 'Therapist continuity'];\n" +
    "    var pxHigh = function (cat) { return pxClin.indexOf(cat) >= 0 ? ['Floor lead psychiatrist', 'Clinical team'] : ['S Chandra', 'GM Operations']; };\n" +
    "    var pxOwn = function (o, pid) { if (o === 'Treating psychiatrist') { var pp = pById[pid]; var dn = pp && (pp.dr || pp.psychiatrist || pp.psy); if (dn) return dn; } return o; };\n" +
    "    var route = s.form.sev === 'High' ? pxHigh(s.form.category) : (R[s.form.category] || R['Other']);");
  R("dueHint: DUE[s.form.sev === 'High' ? 'grievance' : 'concern'],",
    "dueHint: (function () { var sv = s.form.sev || 'Medium', hi = pxHigh(s.form.category); if (sv === 'High') return 'High: ' + hi[0] + ' (' + hi[1] + ') is told straight away.'; if (sv === 'Low') return 'Low: due by the next day.'; return 'Medium: the owner is reminded at 3 hours. It goes to ' + hi[0] + ' at 6 hours if it is still open.'; })(),");
  R("NZ.routeOwner = ftag === 'Psychiatrist' ? 'Treating psychiatrist' : ftag === 'Psychologist' ? 'Treating psychologist' : route[0];",
    "NZ.routeOwner = pxOwn(route[0], s.form.pid);");
  R("NZ.routeRole = ftag === 'General admin' ? route[1] : 'Clinical team';", "NZ.routeRole = route[1];");
  R("var rt = f.sev === 'High' ? ['S Chandra', 'GM Operations'] : (f.tag === 'Psychiatrist' ? ['Treating psychiatrist', 'Clinical team'] : f.tag === 'Psychologist' ? ['Treating psychologist', 'Clinical team'] : (R[f.category] || R['Other']));",
    "var rt0 = f.sev === 'High' ? pxHigh(f.category) : (R[f.category] || R['Other']), rt = [pxOwn(rt0[0], f.pid), rt0[1]];");
  R("category: f.category,\n        sla: '6 h left', slaTone: 'grey', logged: 'just now'", "category: f.category,\n        sla: f.sev === 'Low' ? 'Due tomorrow' : '6 h left', slaTone: 'grey', logged: 'just now'");
  R("NZ.actHint = M4act === 'yes' ? 'It becomes a grievance with an owner and a clock: reminder at 3 h, Chandraji at 6 h.' :", "NZ.actHint = M4act === 'yes' ? '' :");
  R("    var rcoPick = P.filter(function (p) { return parseInt(rnd(p), 10) < 2; }).sort(function (x, y) { return hashS(dseed + x.id) - hashS(dseed + y.id); }).slice(0, 2);",
    "    var calledToday = function (p) { return (s.calls[p.id] || []).some(function (l) { return l.rc && l.d === window.PXDay(); }); };\n" +
    "    var rcoPick = P.filter(function (p) { return parseInt(rnd(p), 10) < 2 || calledToday(p); }).sort(function (x, y) { return hashS(dseed + x.id) - hashS(dseed + y.id); }).slice(0, 2).filter(function (p) { return !calledToday(p); });");
  R("NZ.kindHint = NZ.isRandom ? 'These are the two families to call today.'", "NZ.kindHint = NZ.isRandom ? 'These are the families still to call today. A family drops off once you have logged the call.'");
  fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
}

/* ---- 2. px/patients.html ---- */
{
  const file = 'public/px/patients.html'; let s = rd(file);
  const k0 = s.indexOf('    <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#475467">Sort ');
  if (k0 < 0) throw new Error('sort row');
  const k1 = s.indexOf('\n', k0) + 1;
  s = s.slice(0, k0) + s.slice(k1);
  s = rep(s, '<option>Child ward</option></select></label></div></div>',
    "<option>Child ward</option></select></label><label class=\"btn\" style=\"gap:6px\">Sort <select aria-label=\"Sort\" data-sortsel=\"1\" style=\"border:0;font:inherit;background:transparent\">${[['attn','Needs attention first'],['room','Room'],['day','Day of stay']].map(([k,l])=>`<option value=\"${k}\" ${S.sort===k?'selected':''}>${l}</option>`).join('')}</select></label></div></div>", 'patients sort');
  s = rep(s, 'function pfAll(){', "document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-sortsel]');if(t)set({sort:t.value});});\nfunction pfAll(){", 'sort handler');
  s = rep(s, "o.style.cssText='position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:80;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px';",
    "o.style.cssText='position:fixed;inset:0;background:#F6F8FB;z-index:80;overflow:auto;padding:0';", 'pf overlay');
  s = rep(s, "o.innerHTML='<div style=\"background:#fff;border-radius:16px;width:min(760px,100%);padding:20px;display:flex;flex-direction:column;gap:14px\"><div style=\"display:flex;justify-content:space-between;gap:10px\"><div><b style=\"font-size:18px\">Preferences · '",
    "o.innerHTML='<div style=\"min-height:100%;padding:16px;display:flex;flex-direction:column;gap:14px\"><div style=\"display:flex;justify-content:space-between;gap:10px;align-items:flex-start\"><div><button class=\"mini\" id=\"pfB\" style=\"margin-bottom:8px\">‹ Back to patients</button><br><b style=\"font-size:20px\">Preferences · '", 'pf header');
  s = rep(s, "<button class=\"mini\" id=\"pfX\">Close</button></div>'+", "<button class=\"btn pri\" id=\"pfS2\">Save preferences</button></div>'+", 'pf close');
  s = rep(s, "o.querySelector('#pfX').onclick=o.querySelector('#pfC').onclick=()=>o.remove();", "o.querySelector('#pfB').onclick=o.querySelector('#pfC').onclick=()=>o.remove();o.querySelector('#pfS2').onclick=()=>o.querySelector('#pfS').click();", 'pf handlers');
  fs.writeFileSync(file, s);
}

/* ---- 3. rounds-v2.js ---- */
{
  const file = 'public/px/rounds-v2.js'; let s = rd(file);
  s = rep(s, "var L = listFor(r[0], D), seen = L.filter(function (x) { return statusOf(D, x.p, r[0]) !== 'to'; }).length, pc = L.length ? Math.round(seen / L.length * 100) : 0;",
    "var L0 = listFor(r[0], D), L = L0.filter(function (x) { return split() ? slotOf(x.p) === r[0] : r[0] === 'M'; }), extra = L0.length - L.length, seen = L.filter(function (x) { return statusOf(D, x.p, r[0]) !== 'to'; }).length, pc = L.length ? Math.round(seen / L.length * 100) : 0;", 'cards L');
  s = rep(s, "'</span><div>' + seen + ' of ' + L.length + ' seen</div>", "'</span><div>' + seen + ' of ' + L.length + ' seen' + (extra > 0 ? ' <span style=\"color:#B54708\">· +' + extra + ' to follow up</span>' : '') + '</div>'", 'cards text');
  const b0 = s.indexOf('  function scribeBar() {'), b1 = s.indexOf('  function srSeg()');
  if (b0 < 0 || b1 < b0) throw new Error('scribe');
  const nb = "  function scribeBar() {\n" +
    "    return '<div style=\"display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:' + (SR.on ? '#FEF3F2' : '#fff') + ';border:1px solid ' + (SR.on ? '#FDA29B' : '#D6DEE8') + ';border-radius:12px;padding:10px 14px\">' +\n" +
    "      '<button class=\"rv-b pri\" style=\"font-size:14px;padding:9px 16px;white-space:nowrap;' + (SR.on ? 'background:#D92D20;border-color:#D92D20' : '') + '\" onclick=\"RV2.scribe()\">' + (SR.on ? '■ Stop the round scribe' : '● Start AI scribe') + '</button>' +\n" +
    "      '<div style=\"flex:1;min-width:220px;font-size:13px;color:#475467\">' + (SR.on ? '<b style=\"color:#B42318\">Listening to the round.</b> Open each patient as you go; the words are drafted for that patient.' : '<b style=\"color:#101828\">AI scribe for this round.</b> Start it once, open each patient as you go, then check the draft and press Use this.') +\n" +
    "      (SR.msg ? '<div style=\"margin-top:3px\">' + esc(SR.msg) + '</div>' : '') + '<div style=\"font-size:12px;color:#667085;margin-top:2px\">Tell patients before recording. Only text is kept, no audio.</div></div></div>';\n  }\n";
  s = s.slice(0, b0) + nb + s.slice(b1);
  fs.writeFileSync(file, s);
}
console.log('ok');
