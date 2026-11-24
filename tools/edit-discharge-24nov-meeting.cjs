// 24 Nov meeting (discharge summary, block 146; psychiatrist roles): PDF without empty headings, follow-up as a table,
// therapy plan as one line (how often and duration together) with the psychologist's name, sign-off block with name,
// designation, signature and stamp for the psychiatrist and the psychologist; on screen, how often + duration on one row. Run once.
const fs = require('fs'), f = __dirname + '/../public/legacy/js/146-discharge-tabs-20nov-js.js';
let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const R = (a, b) => { if (!s.includes(a)) throw new Error('miss ' + a.slice(0, 80)); s = s.split(a).join(b); };
R("const sec=f=>`<h3>${E(f[0])}:</h3><div class=\"tx\">${H(f[1]||'-')}</div>`;",
  "const sec=f=>String(f[1]||'').trim()?`<h3>${E(f[0])}:</h3><div class=\"tx\">${H(f[1])}</div>`:'';");
R(`        <div class="fu"><span>Psychiatrist</span><span>Follow-up Date</span><span>Day</span>
          <span>\${E(fuDocOf(pid)||team.psy||'-')}</span><span>\${F?E(fdt(D.fu)):'---'}</span><span>\${F?wk(F):'---'}</span>
          <span>Psychologist</span><span>Follow-up Date</span><span>Day</span>
          <span>\${E(team.psych||'-')}</span><span>\${T?E(fdt(t.fu)):'---'}</span><span>\${T?wk(T):'---'}</span></div>
        \${t.mod||t.freq||t.dur?\`<div class="tx" style="margin-top:6px">Therapy plan: \${E([t.mod,t.freq,t.dur].filter(Boolean).join(' · '))}</div>\`:''}
        <div class="team">\${E(team.psy||'')}</div>`,
`        <table class="fut"><tr><th>Follow-up with</th><th>Name</th><th>Follow-up date</th><th>Day</th></tr>
          <tr><td>Psychiatrist</td><td>\${E(fuDocOf(pid)||team.psy||'-')}</td><td>\${F?E(fdt(D.fu)):'---'}</td><td>\${F?wk(F):'---'}</td></tr>
          <tr><td>Psychologist</td><td>\${E(team.psych||'-')}</td><td>\${T?E(fdt(t.fu)):'---'}</td><td>\${T?wk(T):'---'}</td></tr></table>
        \${t.mod||t.freq||t.dur?\`<h3>Therapy plan:</h3><div class="tx">\${E(t.mod||'Therapy')}\${t.freq||t.dur?' · '+E([t.freq,t.dur?'for '+t.dur:''].filter(Boolean).join(' ')):''}\${team.psych?' · Psychologist: '+E(team.psych):''}</div>\`:''}
        <div class="sgn">\${[['Psychiatrist',team.psy],['Psychologist',team.psych]].map(x=>\`<div><div class="sl"></div><b>\${E(x[1]||'')}</b><span>\${x[0]}, Tulasi Healthcare</span><span class="st">Signature and stamp</span></div>\`).join('')}</div>`);
R("<i>This is a digitally generated document; signature is not required.</i>", '');
R(".fu{display:grid;grid-template-columns:2fr 2fr 1fr;font-size:11.5px}.team{font-weight:700;margin-top:6px;font-size:12.5px}",
  "table.fut{border-collapse:collapse;width:100%;margin-top:6px;font-size:11.5px}.fut th,.fut td{border:1px solid #c8cfd8;padding:4px 8px;text-align:left}.fut th{background:#f1f4f9;color:#1f3c88}\n        .sgn{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:36px;font-size:11.5px}.sgn .sl{border-bottom:1px solid #333;height:44px;margin-bottom:6px}.sgn b{display:block;font-size:12.5px}.sgn span{display:block;color:#555}.sgn .st{font-size:10.5px;color:#888;margin-top:2px}");
// on screen: how often and duration on one row, psychologist name
R("${row('How often',t.freq)}${t.dur?row('Duration',t.dur):''}", "${row('How often and duration',[t.freq,t.dur?'for '+t.dur:''].filter(Boolean).join(' '))}${(window.m24PsychOf&&window.m24PsychOf(pid))?row('Psychologist',window.m24PsychOf(pid)):''}");
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('ok');
