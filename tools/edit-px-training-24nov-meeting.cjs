// 24 Nov meeting (training): Staff tab name, Upcoming/Past sessions, columns date/module/invited/attended,
// attended / not attended (no pass or fail), eye icon with modules attended and missed per person. Run once.
const fs = require('fs'), f = __dirname + '/../public/px/training.html';
let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const R = (a, b) => { if (!s.includes(a)) throw new Error('miss ' + a.slice(0, 80)); s = s.split(a).join(b); };

R("function sessions(){const L=S.sess.filter(s=>S.sf==='up'?!s.came:S.sf==='done'?!!s.came:true).sort((a,b)=>D(b.when)-D(a.when));",
`/* 24 Nov meeting: Upcoming and Past; columns date, module, invited, attended (no pass or fail) */
const isPast=s=>!!s.came||D(s.when)<new Date(todayISO()+'T00:00:00');
function sessions(){const past=S.sf==='past';const L=S.sess.filter(s=>past?isPast(s):!isPast(s)).sort((a,b)=>past?D(b.when)-D(a.when):D(a.when)-D(b.when));
  if(!L.length)return '<div class="card" style="padding:18px"><span class="muted">'+(past?'No past sessions yet.':'No upcoming sessions. Use Plan a session.')+'</span></div>';`);
R("<thead><tr><th>When</th><th>Module</th><th>For</th><th>People</th><th>Quick check</th><th></th></tr></thead><tbody>${L.map(s=>{const m=MOD(s.mod),c=s.came,came=c?Object.keys(c).length:0,pass=c?Object.values(c).filter(v=>v==='P').length:0;",
"<thead><tr><th>Date</th><th>Module</th><th>Invited</th><th>Attended</th><th></th></tr></thead><tbody>${L.map(s=>{const m=MOD(s.mod),c=s.came,came=c?Object.keys(c).length:0;");
R(`<td>\${esc(m.name)}</td><td>\${esc(m.team==='All'?'Everyone':m.team)}<div class="muted small">\${esc(s.place)}</div></td>
    <td>\${c?came+' of '+s.invited.length+' came':s.invited.length+' invited'}</td><td>\${c?pass+' passed'+(came-pass?', '+(came-pass)+' repeat':''):'<span class="muted">After the session</span>'}</td>`,
`<td>\${esc(m.name)}<div class="muted small">\${esc(m.team==='All'?'Everyone':m.team)} · \${esc(s.place)}</div></td>
    <td>\${s.invited.length}</td><td>\${c?came+' of '+s.invited.length:'<span class="muted">Not taken yet</span>'}</td>`);
R(`<button class="chip \${v==='P'?'on':''}" data-att2="\${id}|P">Passed</button><button class="chip \${v==='R'?'on':''}" data-att2="\${id}|R">Repeat</button><button class="chip \${v==='A'?'on':''}" data-att2="\${id}|A">Did not come</button>`,
`<button class="chip \${v==='P'?'on':''}" data-att2="\${id}|P">Attended</button><button class="chip \${v==='A'?'on':''}" data-att2="\${id}|A">Not attended</button>`);
R("Passed updates the person's record. Repeat goes into the next session. Counts go to Reports for NABH training records.",
  "Attended updates the person's record. People who did not attend can be invited again from the Staff tab (eye icon). Counts go to Reports for NABH training records.");
R(`    Object.entries(came).forEach(([id,v])=>{if(v==='P'&&!S.done[id].includes(s.mod))S.done[id].push(s.mod);});
    s.came=came;const rep=Object.keys(came).filter(id=>came[id]==='R');
    if(rep.length){const nx=S.sess.find(x=>!x.came&&x.mod===s.mod);if(nx){rep.forEach(id=>{if(!nx.invited.includes(id))nx.invited.push(id);});}else{S.sess.push({id:'s'+(++S.n),when:todayISO()+'T11:00',mod:s.mod,place:s.place,invited:rep,came:null});}}
    S.att=null;save();toast('Attendance saved. '+Object.values(came).filter(v=>v==='P').length+' passed'+(rep.length?', '+rep.length+' added to the next session':'')+'.');}`,
`    Object.entries(came).forEach(([id,v])=>{if(!S.done[id].includes(s.mod))S.done[id].push(s.mod);});
    s.came=came;s.miss=s.invited.filter(id=>!came[id]);
    S.att=null;save();toast('Attendance saved. '+Object.keys(came).length+' attended, '+s.miss.length+' not attended.');}`);
R('data-v="people">People</button>', 'data-v="people">Staff</button>');
R(`<select id="sfl" aria-label="Show"><option value="all" \${S.sf==='all'?'selected':''}>All sessions</option><option value="up" \${S.sf==='up'?'selected':''}>Attendance not taken</option><option value="done" \${S.sf==='done'?'selected':''}>Attendance taken</option></select>`,
`<div class="seg"><button class="\${S.sf!=='past'?'on':''}" data-sf="up">Upcoming</button><button class="\${S.sf==='past'?'on':''}" data-sf="past">Past</button></div>`);
R("[data-attok],[data-editsess]');", "[data-attok],[data-editsess],[data-sf],[data-eye],[data-reinv]');");
R("  if(d.v){S.view=d.v;}", `  if(d.sf){S.sf=d.sf;render();return;}
  if(d.eye){S.eye=d.eye;render();return;}
  if(d.reinv){const [pid,mod]=d.reinv.split('|');S.eye=null;S.plan={mod:mod,date:todayISO(),time:'11:00',place:'Training room',ppl:[pid]};render();return;}
  if(d.v){S.view=d.v;}`);
R("S.open=S.plan=S.att=S.add=null;", "S.open=S.plan=S.att=S.add=S.eye=null;");
R(`<td><button class="btn sm" data-addp="\${p.id}">Add to a session</button></td></tr>`,
`<td style="white-space:nowrap"><button class="btn sm" data-eye="\${p.id}" title="Modules attended" aria-label="Modules attended">👁</button> <button class="btn sm" data-addp="\${p.id}">Add to a session</button></td></tr>`);
R("  if(S.plan){const P=S.plan;", `  if(S.eye){const p=PEOPLE.find(x=>x.id===S.eye);const mine=S.sess.filter(x=>x.invited.includes(p.id)).sort((a,b)=>D(b.when)-D(a.when));const dt=x=>D(x.when).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
    const att=mine.filter(x=>x.came&&x.came[p.id]),mis=mine.filter(x=>x.came&&!x.came[p.id]);
    return \`<div class="ov" data-close="1"><div class="dr"><div style="display:flex;justify-content:space-between"><h3>\${esc(p.name)}</h3><button class="btn sm" data-close="1">Close</button></div><div class="muted small">\${esc(p.role)} · \${esc(p.team)}</div>
    <h4 style="margin:10px 0 4px">Modules attended</h4>\${att.map(x=>\`<div class="row"><span>\${esc(modName(x.mod))}</span><span class="muted small">\${dt(x)}</span></div>\`).join('')||'<div class="muted small">No sessions attended yet.</div>'}
    <h4 style="margin:14px 0 4px">Missed</h4>\${mis.map(x=>\`<div class="row"><span>\${esc(modName(x.mod))}<div class="muted small">\${dt(x)}</div></span>\${S.done[p.id].includes(x.mod)?'<span class="ok small">Done later</span>':\`<button class="btn sm" data-reinv="\${p.id}|\${x.mod}">Invite again</button>\`}</div>\`).join('')||'<div class="muted small">None missed.</div>'}</div></div>\`;}
  if(S.plan){const P=S.plan;`);
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('ok');
