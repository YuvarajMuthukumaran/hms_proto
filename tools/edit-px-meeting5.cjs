/* One-off (12 Nov 2026): Patient Experience Lead gets the new Today and Patients screens (Trello 103 and 111, from PX_Today_proposed.html and
   PX_Patients_proposed.html, kept in public/px/ and shown inside the app with ?embed=1) and the 5 item menu: Today, Patients, Feedback,
   Nurse training, Reports (+ Setting). The older pages stay reachable under "Older pages". */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('MEETING5')) throw new Error('already applied');
const BS = String.fromCharCode(92);
function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}

/* ---- sidebar: only Today, Patients, Feedback, Nurse training, Reports and Setting */
{
  const lines = t.split('\n');
  let removed = 0;
  const out = lines.filter(function (l) {
    if (l.indexOf('<button class="nav') >= 0 && /(<\/svg>Dashboard<|<\/svg>All Patients<|<\/svg>Messages<|My Calendar|Patient experience)/.test(l)) { removed++; return false; }
    return true;
  });
  if (removed !== 5) throw new Error('expected to remove 5 sidebar buttons, removed ' + removed);
  t = out.join('\n');
}

/* ---- screens */
rep("var SCR = ['today', 'concerns', 'floor', 'clean', 'dcheck', 'feedback', 'follow', 'report'];", "var SCR = ['today', 'concerns', 'floor', 'clean', 'dcheck', 'feedback', 'follow', 'report', 'today2', 'patients2', 'nurse'];", 'SCR');
rep("screen: fromHash() || 'today',", "screen: fromHash() || 'today2',", 'default screen');
rep('<!-- ============ TODAY ============ -->',
`<!-- ============ NEW TODAY, PATIENTS, NURSE TRAINING (MEETING5) ============ -->
<sc-if value="{{isToday2}}" hint-placeholder-val="{{true}}"><iframe class="px-emb" title="Today" src="px/today.html?embed=1"></iframe></sc-if>
<sc-if value="{{isPatients2}}" hint-placeholder-val="{{false}}"><iframe class="px-emb" title="Patients" src="px/patients.html?embed=1"></iframe></sc-if>
<sc-if value="{{isNurse}}" hint-placeholder-val="{{false}}">
  <div class="hello"><div><h2>Nurse training</h2><div class="muted">Short sessions on the floor. Log each one when it is done. Demo data.</div></div></div>
  <section class="card" style="overflow:hidden">
    <div class="chead"><h3>This month</h3><span class="muted small">{{ntDone}} of {{ntTotal}} done</span></div>
    <div>
      <sc-for list="{{ntRows}}" as="r" hint-placeholder-count="4"><div class="listrow" style="padding:12px 20px;align-items:center"><div class="grow"><div class="name">{{r.title}}</div><div class="muted small">{{r.sub}}</div></div><span class="{{r.chip}}">{{r.state}}</span><button class="{{r.btnCls}}" type="button" sc-camel-on-click="{{r.act}}">{{r.btn}}</button></div></sc-for>
    </div>
  </section>
</sc-if>

<!-- ============ TODAY ============ -->`, 'new screens');

/* ---- nav and props */
{
  const a = t.indexOf("    NZ.nav = [['today', 'Patient dashboard', 0]");
  if (a < 0) throw new Error('nav start');
  const b = t.indexOf('    });', a) + '    });'.length;
  const old = t.slice(a, b);
  const add = `    // MEETING5: five item menu, older pages below
    var M5main = [['today2', 'Today', 0], ['patients2', 'Patients', 0], ['concerns', 'Feedback', openC.length], ['nurse', 'Nurse training', 0], ['report', 'Reports', 0]];
    var M5old = [['today', 'Patient dashboard', 0], ['floor', 'End of day updates', 0], ['clean', 'Floor round', 0], ['dcheck', 'Discharge SOP', 0], ['follow', 'IPD follow-ups', 0]];
    var M5mk = function (n) { return { label: n[1], count: n[2], hasCount: n[2] > 0, cls: 'sub' + (s.screen === n[0] || (n[0] === 'today' && s.screen === 'record') || (n[0] === 'dcheck' && s.screen === 'feedback') ? ' on' : ''), go: go(n[0]) }; };
    NZ.nav = M5main.map(M5mk).concat([{ label: 'Older pages', count: 0, hasCount: false, cls: 'sub m5-old-h', go: function () {} }]).concat(M5old.map(function (n) { var o = M5mk(n); o.cls += ' m5-old'; return o; }));
    NZ.isToday2 = s.screen === 'today2'; NZ.isPatients2 = s.screen === 'patients2'; NZ.isNurse = s.screen === 'nurse';
    var NTL = [['Handling a grievance and what to tell the family', 'Floor 1 and 2 nurses · 20 min'], ['Family update at 8 pm: plain words, no clinical details', 'All nurses · 15 min'], ['Patient rights (MHCA) at the bedside', 'All nurses · 20 min'], ['Cost estimate and NABH notice board', 'Charge nurses · 15 min']];
    var ntd = s.ntDone || {};
    NZ.ntRows = NTL.map(function (r, i) { var d = !!ntd[i]; return { title: r[0], sub: r[1], state: d ? 'Done' : 'To do', chip: 'chip ' + (d ? 'green' : 'amber'), btn: d ? 'Undo' : 'Log session', btnCls: 'btn sm' + (d ? '' : ' pri'), act: function () { var m = Object.assign({}, self.state.ntDone || {}); m[i] = !m[i]; self.setState({ ntDone: m }); } }; });
    NZ.ntDone = Object.keys(ntd).filter(function (k) { return ntd[k]; }).length; NZ.ntTotal = NTL.length;
`;
  t = t.slice(0, a) + add + t.slice(b);
}
rep("NZ.pageTitle = { floor: 'End of day updates',", "NZ.pageTitle = { today2: 'Today', patients2: 'Patients', nurse: 'Nurse training', floor: 'End of day updates',", 'titles');

/* ---- css */
const css = `
/* MEETING5 */
.px-emb{display:block;width:100%;height:calc(100vh / .75 - 110px);border:0;background:transparent}
.sub.m5-old{font-size:12.5px;color:#667085;padding-left:20px}
.sub.m5-old-h{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#98a2b3;cursor:default;margin-top:10px;pointer-events:none}
`;
const cssAt = t.indexOf('</style>', t.indexOf('html{zoom:.75}'));
if (cssAt < 0) throw new Error('no style end');
t = t.slice(0, cssAt) + css + t.slice(cssAt);

fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n' + src.slice(i1));
console.log('ok', t.length);
