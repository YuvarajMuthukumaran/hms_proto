// 24 Nov meeting (therapy session note, block 147): aim and intervention in one section with the duration inline,
// goals section named "My Goals" (goals from the plan, rating optional), no next-session date or time (inpatients are seen daily). Run once.
const fs = require('fs'), f = __dirname + '/../public/legacy/js/147-therapy-notes-20nov-js.js';
let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const R = (a, b) => { if (!s.includes(a)) throw new Error('miss ' + a.slice(0, 80)); s = s.split(a).join(b); };
R("      +q('Aim of the intervention','',many(AIMS,D.aimT,\"tnM.bind(null,'aimT')\")+ta('aim','In your words (optional if a bubble says it)'))\n      +q('Duration','',`<div class=\"row\" style=\"gap:10px;flex-wrap:wrap;align-items:center\"><div class=\"sn-chips\">",
  "      +q('Aim and intervention','',`<div class=\"row\" style=\"gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px\"><span class=\"lbl\" style=\"margin:0\">Duration</span><div class=\"sn-chips\">");
R("<span class=\"small muted\">minutes</span></div>`)\n      +q('Intervention','',one(INTV,D.mod,'tnMod')+ta('intv','What was done in the session',3)+blk)",
  "<span class=\"small muted\">minutes</span></div>`\n        +`<div class=\"tn-g\"><div class=\"field\"><span class=\"lbl\">Aim</span>${many(AIMS,D.aimT,\"tnM.bind(null,'aimT')\")}${ta('aim','In your words (optional if a bubble says it)')}</div><div class=\"field\"><span class=\"lbl\">Intervention</span>${one(INTV,D.mod,'tnMod')}${ta('intv','What was done in the session',3)}</div></div>`+blk)");
R("      +q('Goals','Rate each goal the way it was set up',", "      +q('My Goals','From the therapy plan. Rating them in this session is optional',");
s = s.replace(/\+`<!-- 23 Nov: no Homework field[\s\S]*?A next session date books it on the Calendar and caseload\.<\/div>`\)/, ')');
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('ok');
