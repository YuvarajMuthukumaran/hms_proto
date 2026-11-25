// 25 Nov (owner): PX discharge form "Print PDF" next to Save, on the Tulasi letterhead (same header as the discharge summary, block 146).
const fs=require('fs'),F=require('path').join(__dirname,'..','public','px','px-dc-checklist.js');let s=fs.readFileSync(F,'utf8');const crlf=s.includes('\r\n');s=s.split('\r\n').join('\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,70));s=s.split(a).join(b);};
rep(`<button type="button" class="dc-save" onclick="pxDcSave(\\'' + esc(id) + '\\')">Save</button>`,
`<button type="button" class="dc-print" onclick="pxDcPrint(\\'' + esc(id) + '\\')">Print PDF</button><button type="button" class="dc-save" onclick="pxDcSave(\\'' + esc(id) + '\\')">Save</button>`);
rep(".dc-sv{display:flex;justify-content:flex-end;align-items:center;gap:10px}",
".dc-sv{display:flex;justify-content:flex-end;align-items:center;gap:10px}.dc-print{border:1px solid #D0D5DD;background:#fff;color:#344054;font:inherit;font-weight:600;font-size:14px;padding:8px 18px;border-radius:10px;cursor:pointer}.dc-print:hover{border-color:#1e6cdb;color:#1849a9}");
rep("  function esc(s) {",
`  /* 25 Nov (owner): Print PDF on the Tulasi letterhead */
  window.pxDcPrint = function (id) {
    var d = load(id), f = F(d), p = {};
    try { p = P.find(function (x) { return String(x.hmsId || x.id) === String(id); }) || {}; } catch (e) {}
    var row = function (k, v) { return v ? '<tr><th>' + esc(k) + '</th><td>' + esc(v) + '</td></tr>' : ''; };
    var kv = function (k, v) { return '<div><span>' + esc(k) + '</span><b>' + esc(v || '-') + '</b></div>'; };
    var qs = [];
    if (/Patient/.test(f.fbFrom || '')) qs = qs.concat(QP); if (/amily/.test(f.fbFrom || '')) qs = qs.concat(QF);
    var fbT = row('Feedback from', f.fbFrom) + qs.map(function (q) { return row(q[1], f[q[0]]); }).join('') + row('Would recommend Tulasi (0 to 10)', f.fbScore !== undefined && f.fbScore !== '' ? String(f.fbScore) : '') + row('What they said', f.fbSaid);
    var fuT = row('Explained to', f.fuTo) + row('How', f.fuHow) + row('Points covered', f.pts.join(', '));
    var fus = f.fus.filter(function (r) { return r.date || r.with; });
    var fubT = fus.length ? '<table class="fut"><tr><th>Date</th><th>With</th><th>Doctor</th><th>Booked in</th></tr>' + fus.map(function (r) { return '<tr><td>' + esc(r.date || '') + '</td><td>' + esc(r.with || '') + '</td><td>' + esc(r.who || '') + '</td><td>' + esc(r.in || 'Not booked yet') + '</td></tr>'; }).join('') + '</table>' : '<p class="no">No follow-up recorded.</p>';
    var sec = function (t, k, body) { var x = d[k]; return '<h3>' + esc(t) + '</h3><div class="st">' + (x && x.on ? 'Done by ' + esc(x.by || '') + ', ' + esc(x.at || '') : 'Not done yet') + '</div>' + (body || '<p class="no">Nothing filled yet.</p>'); };
    var tb = function (r) { return r ? '<table class="kv">' + r + '</table>' : ''; };
    var html = '<!doctype html><html><head><meta charset="utf-8"><title>Discharge feedback and follow-up - ' + esc(p.name || '') + '</title><style>'
      + 'body{font:12px/1.5 Arial,Helvetica,sans-serif;color:#222;margin:28px 40px}'
      + '.top{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:start;border-bottom:1.5px solid #999;padding-bottom:10px}'
      + '.addr{font-size:11px}.addr p{margin:0 0 8px}.brand{text-align:center}.brand img{height:58px}.brand h1{color:#1f3c88;font-size:24px;margin:2px 0 0}.brand i{font-size:12px}'
      + '.ds{text-align:right}.ds h2{font-size:15px;letter-spacing:.5px;margin:0 0 10px}.ds span{display:block;color:#666;font-size:11px}.ds b{display:block;margin-bottom:6px}'
      + '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 14px;padding:12px 0;border-bottom:1.5px solid #999}.grid span{display:block;color:#666;font-size:10.5px;font-weight:700;text-transform:uppercase}.grid b{font-size:12.5px}'
      + 'h3{color:#1f3c88;font-size:15px;margin:18px 0 2px}.st{font-size:11px;color:#666;margin-bottom:6px}.no{color:#888;margin:4px 0}'
      + 'table{border-collapse:collapse;width:100%;font-size:12px}.kv th,.kv td,.fut th,.fut td{border:1px solid #c8cfd8;padding:5px 9px;text-align:left;vertical-align:top}.kv th{width:42%;background:#f6f8fb;font-weight:600;color:#333}.fut th{background:#f1f4f9;color:#1f3c88}'
      + '.sgn{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;font-size:11.5px}.sgn .sl{border-bottom:1px solid #333;height:44px;margin-bottom:6px}.sgn b{display:block}'
      + '.foot{border-top:1.5px solid #999;margin-top:24px;padding-top:10px;text-align:center;font-size:11px;color:#555}'
      + '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}@media print{body{margin:10mm 12mm}}</style></head><body>'
      + '<div class="top"><div class="addr"><p>Sector-64, Opp: M3M Urbana,<br>Gurgaon - 122102</p><p>2/6 Sarvpriya Vihar, Near Hauzkhas Metro,<br>New Delhi - 110016</p><p><b>Appointments:8800000255</b></p></div>'
      + '<div class="brand"><img src="' + location.origin + '/logo.png" alt=""><h1>Tulasi Healthcare</h1><i>Psychiatric &amp; Rehabilitation Care</i></div>'
      + '<div class="ds"><h2>DISCHARGE FEEDBACK<br>AND FOLLOW-UP</h2><span>UHID/MR NO.</span><b>' + esc(p.uhid || '-') + '</b><span>PRINTED ON</span><b>' + esc(when()) + '</b></div></div>'
      + '<div class="grid">' + kv('Patient name', p.name) + kv('Age / Sex', p.as) + kv('Room', p.room) + kv('Psychiatrist', p.dr) + '</div>'
      + sec(ITEMS[0][1], 'fb', tb(fbT)) + sec(ITEMS[1][1], 'fu', tb(fuT)) + sec(ITEMS[2][1], 'fub', fubT)
      + '<div class="sgn"><div><div class="sl"></div><b>Patient Experience Lead</b>Name, signature and date</div><div><div class="sl"></div><b>Patient / family member</b>Name, relation, signature and date</div></div>'
      + '<div class="foot">Tulasi Healthcare · Patient Experience</div>'
      + '<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\\/script></body></html>';
    var w = window.open('', '_blank'); if (!w) { try { toast('Allow pop-ups to print'); } catch (e) {} return; }
    w.document.open(); w.document.write(html); w.document.close();
  };
  function esc(s) {`);
if(crlf)s=s.split('\n').join('\r\n');fs.writeFileSync(F,s);console.log('ok');
