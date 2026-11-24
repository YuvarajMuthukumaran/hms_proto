// 24 Nov meeting (PX Rounds): no "min left" timer, Save right under the last field (not a sticky bar),
// patients already done this round fold away, only your own split (no "Doing the round" picker once you are set),
// "Mr. S. Chandra" instead of "Chandraji". Run once.
const fs = require('fs'), dir = __dirname + '/../public/px/';
function ed(file, fn) { const f = dir + file; let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); s = fn(s); fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s); }
const R = (s, a, b) => { if (!s.includes(a)) throw new Error('miss ' + a.slice(0, 80)); return s.split(a).join(b); };

ed('rounds-v3.js', s => {
  s = R(s, "<span>About ' + left * 3 + ' min left</span>", '');
  // Save buttons at the end of the form
  s = R(s, "return h + bodyW(b) + foot('<button class=\"r3-b\" ", "return h + bodyW(b + '<div class=\"r3-inl\"><button class=\"r3-b\" ");
  s = R(s, "(V.out ? 'Pick what it is about' : 'Pick an answer')) + '</button>');", "(V.out ? 'Pick what it is about' : 'Pick an answer')) + '</button></div>');");
  s = R(s, "'.r3-right{", "'.r3-inl{display:flex;gap:10px;margin:14px 0 8px}.r3-fold{display:block;width:100%;text-align:left;border:0;background:none;color:#475569;font:inherit;font-size:13.5px;font-weight:600;padding:8px 12px;cursor:pointer}' +\n    '.r3-right{");
  // fold done patients
  s = R(s, "    h += B.prio.map(function (p) {", "    var shut = function (p) { return !!res(B, p) && !(p.id === V.pid && V.screen !== 'list') && !V.showDone; };\n    var nDone = B.prio.concat(B.rest).filter(shut).length;\n    h += B.prio.filter(function (p) { return !shut(p); }).map(function (p) {");
  s = R(s, "B.rest.length + '</span><small>Room order</small></div><div class=\"r3-pl\"><div class=\"r3-box\">' + B.rest.map(function (p) {",
    "B.rest.length + '</span><small>Room order</small></div><div class=\"r3-pl\"><div class=\"r3-box\">' + B.rest.filter(function (p) { return !shut(p); }).map(function (p) {");
  s = R(s, "    }).join('') + '</div></div>';\n    return h;\n  }",
    "    }).join('') + '</div></div>';\n    if (nDone || V.showDone) h += '<button class=\"r3-fold\" onclick=\"RV3.toggleDone()\">' + (V.showDone ? 'Hide the patients already seen' : 'Seen this round: ' + nDone + ' (tap to show)') + '</button>';\n    return h;\n  }");
  // your own split only: the picker shows only while nobody is set
  s = R(s, "'<select onchange=\"RV2.me(this.value)\" aria-label=\"Doing the round\">' + c.alloc.map(function (a) { return '<option' + (a.name === cur ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join('') + '</select></div>'",
    "(X.me() ? '' : '<select onchange=\"RV2.me(this.value)\" aria-label=\"Doing the round\">' + c.alloc.map(function (a) { return '<option' + (a.name === cur ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join('') + '</select>') + '</div>'");
  s = s.split('Chandraji').join('Mr. S. Chandra');
  return s;
});
ed('rounds-v2.js', s => s.split('Chandraji').join('Mr. S. Chandra'));
ed('grievances.html', s => s.split('Chandra ji').join('Mr. S. Chandra'));
ed('px-log-concern.js', s => s.split("'S Chandra'").join("'Mr. S. Chandra'").split('S Chandra ').join('Mr. S. Chandra ').split('S Chandra.').join('Mr. S. Chandra.'));
console.log('ok');
