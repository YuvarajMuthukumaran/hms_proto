/* One-off: redesign the Floor round screen in public/px-lead-prototype.html. Run once: node tools/edit-px-floor.cjs */
const fs = require('fs');
const file = require('path').join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length;
const i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
const BS = String.fromCharCode(92);

function rep(a, b, label) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error('expected 1 match, got ' + n + ': ' + label);
  t = t.split(a).join(b);
}

/* ---------- CSS ---------- */
const css = `
/* floor round */
.fr-top{display:flex;gap:22px;align-items:center;flex-wrap:wrap;padding:18px 22px 6px}
.fr-read{display:flex;align-items:baseline;gap:8px;min-width:150px}
.fr-read b{font-size:34px;line-height:1;font-weight:700;letter-spacing:-.02em;color:#0f2a4a;font-variant-numeric:tabular-nums}
.fr-read span{color:#475569;font-size:13px;font-weight:600}
.fr-walk{flex:1 1 280px;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:5px;align-self:center}
.fr-walk i{height:10px;border-radius:6px;background:#e3eaf3;transition:background .25s ease,transform .25s ease}
.fr-walk i.ok{background:#1f9d57}
.fr-walk i.issue{background:#d92d20;transform:scaleY(1.5)}
.fr-tally{display:flex;gap:8px;flex-wrap:wrap;padding:0 22px 14px;color:#475569;font-size:13px}
.fr-tally span{display:inline-flex;align-items:center;gap:6px}
.fr-tally span:before{content:"";width:9px;height:9px;border-radius:50%;background:#cbd5e1}
.fr-tally .t-ok:before{background:#1f9d57}.fr-tally .t-is:before{background:#d92d20}
.fr-group{border-top:1px solid #eef2f6}
.fr-gh{display:flex;justify-content:space-between;align-items:baseline;padding:14px 22px 6px;color:#0f2a4a;font-weight:700;font-size:14px}
.fr-gh em{font-style:normal;font-weight:600;font-size:12px;color:#64748b}
.fr-row{display:grid;grid-template-columns:auto 1fr auto;gap:2px 14px;align-items:center;padding:10px 22px;border-left:4px solid transparent;transition:background .2s ease,border-color .2s ease}
.fr-row.ok{background:#f3fbf6;border-left-color:#1f9d57}
.fr-row.issue{background:#fff5f4;border-left-color:#d92d20}
.fr-state{width:28px;height:28px;border-radius:50%;border:2px solid #cbd5e1;display:grid;place-items:center;color:#fff;font-size:15px;font-weight:700;line-height:1;transition:background .2s ease,border-color .2s ease,transform .2s ease}
.fr-row.ok .fr-state{background:#1f9d57;border-color:#1f9d57;animation:frPop .28s ease}
.fr-row.issue .fr-state{background:#d92d20;border-color:#d92d20;animation:frPop .28s ease}
.fr-row.ok .fr-state:after{content:"${BS}2713"}
.fr-row.issue .fr-state:after{content:"!"}
@keyframes frPop{0%{transform:scale(.7)}60%{transform:scale(1.12)}100%{transform:scale(1)}}
.fr-txt .name{font-size:14.5px}
.fr-own{color:#64748b;font-size:12.5px;margin-top:1px}
.fr-tog{display:inline-flex;border:1px solid #cfd8e3;border-radius:10px;overflow:hidden;background:#fff}
.fr-tog button{border:0;background:none;font:inherit;font-size:13px;font-weight:700;color:#334155;min-height:40px;min-width:68px;padding:0 14px;cursor:pointer;transition:background .15s ease,color .15s ease}
.fr-tog button+button{border-left:1px solid #cfd8e3}
.fr-tog button:hover{background:#f1f5f9}
.fr-tog button.ok-on{background:#1f9d57;color:#fff}
.fr-tog button.is-on{background:#d92d20;color:#fff}
.fr-tog button:focus-visible{outline:3px solid #1e6cdb;outline-offset:-3px}
.fr-extra{grid-column:2 / 4;display:grid;grid-template-rows:0fr;transition:grid-template-rows .22s ease}
.fr-row.issue .fr-extra{grid-template-rows:1fr}
.fr-extra>div{overflow:hidden;min-height:0;visibility:hidden}
.fr-row.issue .fr-extra>div{visibility:visible}
.fr-extra .fr-due{display:block;color:#b42318;font-size:12.5px;font-weight:600;padding:8px 0 6px}
.fr-extra input{width:100%;border:1px solid #f0b8b3;background:#fff;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;min-height:42px;margin-bottom:6px}
.fr-extra input:focus-visible{outline:3px solid #1e6cdb;outline-offset:1px}
.fr-foot{border-top:1px solid #eef2f6;padding:16px 22px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.fr-done{margin:0 22px 18px;padding:14px 16px;border-radius:12px;background:#ecf8f0;border:1px solid #bfe5cd;color:#0f5132;font-size:14px;font-weight:600}
.fr-own-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:0 18px;padding:4px 20px 14px}
@media (max-width:640px){
  .fr-row{grid-template-columns:auto 1fr;padding:12px 16px}
  .fr-tog{grid-column:1 / 3;width:100%}.fr-tog button{flex:1}
  .fr-extra{grid-column:1 / 3}
  .fr-top,.fr-tally,.fr-gh,.fr-foot{padding-left:16px;padding-right:16px}
}
@media (prefers-reduced-motion:reduce){.fr-row,.fr-state,.fr-walk i,.fr-extra{transition:none!important;animation:none!important}.fr-row .fr-state{animation:none!important}}
`;
const sEnd = t.indexOf('</style>');
if (sEnd < 0) throw new Error('no style end');
t = t.slice(0, sEnd) + css + t.slice(sEnd);

/* ---------- markup ---------- */
const a = t.indexOf('<!-- ============ FLOOR ROUND ============ -->');
const b = t.indexOf('<!-- ============ DISCHARGE FEEDBACK (FORM 6) ============ -->');
if (a < 0 || b < 0 || b < a) throw new Error('floor markers');
const markup = `<!-- ============ FLOOR ROUND ============ -->
<sc-if value="{{isFloor}}" hint-placeholder-val="{{false}}">
  <div class="hello">
    <div><h2>Floor round</h2><div class="muted">Walk each floor once a day. An issue goes straight to the team that owns it, with a due time.</div></div>
    <div class="seg" role="tablist"><sc-for list="{{floorSegs}}" as="g" hint-placeholder-count="3"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div>
  </div>
  <div class="cols">
    <section class="card" style="flex:3 1 540px;overflow:hidden">
      <div class="chead"><h3>{{floorName}} round</h3><span class="muted small">{{floorDone}} of {{floorTotal}} checked</span></div>
      <div class="fr-top">
        <div class="fr-read"><b>{{floorDone}}/{{floorTotal}}</b><span>checked</span></div>
        <div class="fr-walk" aria-hidden="true"><sc-for list="{{floorStrip}}" as="z" hint-placeholder-count="8"><i class="{{z.cls}}"></i></sc-for></div>
      </div>
      <div class="fr-tally"><span class="t-ok">{{floorOk}} OK</span><span class="t-is">{{floorIssues}} {{floorIssueWord}}</span><span>{{floorLeft}} still to check</span></div>
      <sc-for list="{{floorGroups}}" as="g" hint-placeholder-count="3">
        <div class="fr-group">
          <div class="fr-gh"><span>{{g.title}}</span><em>{{g.progress}}</em></div>
          <sc-for list="{{g.items}}" as="f" hint-placeholder-count="3">
            <div class="{{f.rowCls}}">
              <div class="fr-state" aria-hidden="true"></div>
              <div class="fr-txt"><div class="name">{{f.label}}</div><div class="fr-own">If not OK: {{f.owner}}</div></div>
              <div class="fr-tog" role="group" aria-label="{{f.label}}"><button class="{{f.okCls}}" type="button" sc-camel-on-click="{{f.ok}}">OK</button><button class="{{f.isCls}}" type="button" sc-camel-on-click="{{f.issue}}">Issue</button></div>
              <div class="fr-extra"><div><span class="fr-due">Goes to {{f.owner}}, due in 4 hours</span><input aria-label="What is wrong: {{f.label}}" placeholder="What did you see? (optional)" value="{{f.note}}" sc-camel-on-change="{{f.setNote}}"></div></div>
            </div>
          </sc-for>
        </div>
      </sc-for>
      <div class="fr-foot"><button class="btn pri" type="button" sc-camel-on-click="{{finishRound}}">Finish round</button><span class="muted small">{{roundNote}}</span></div>
      <sc-if value="{{roundDone}}" hint-placeholder-val="{{false}}"><div class="fr-done">{{roundDoneText}}</div></sc-if>
    </section>
    <section class="card" style="flex:2 1 340px">
      <div class="chead"><h3>Who owns what on the floor</h3><span class="muted small">On shift today</span></div>
      <div>
        <sc-for list="{{owners}}" as="o" hint-placeholder-count="10">
          <div class="listrow" style="padding:11px 20px"><div class="avatar av-tint" style="width:32px;height:32px;font-size:11px">{{o.ini}}</div><div class="grow"><div class="name">{{o.role}}</div><div class="muted small">{{o.who}} · {{o.what}}</div></div></div>
        </sc-for>
      </div>
    </section>
  </div>
</sc-if>

`;
t = t.slice(0, a) + markup + t.slice(b);

/* ---------- state ---------- */
rep("floor: 'f2', floorMarks: { 'f2:0': 'ok', 'f2:1': 'issue', 'f2:2': 'ok' }, roundDone: false,",
    "floor: 'f2', floorMarks: { 'f2:0': 'ok', 'f2:1': 'issue', 'f2:2': 'ok' }, floorNotes: { 'f2:1': 'Lunch was cold at the 1 pm service' }, floorSent: {}, roundMsg: '', roundDone: false,", 'state');
rep("go: function () { self.setState({ floor: f, roundDone: false }); } }; });",
    "go: function () { self.setState({ floor: f, roundDone: false, roundMsg: '' }); } }; });", 'floor tab');

/* ---------- values ---------- */
rep("var set = function (val) { return function () { var m = Object.assign({}, self.state.floorMarks); m[key] = val; self.setState({ floorMarks: m }); }; };",
    "var set = function (val) { return function () { var m = Object.assign({}, self.state.floorMarks); m[key] = val; self.setState({ floorMarks: m, roundDone: false, roundMsg: '' }); }; };", 'set');
rep("return { label: it[0], owner: it[1], okCls: v === 'ok' ? 'ok-on' : '', isCls: v === 'issue' ? 'is-on' : '', ok: set('ok'), issue: set('issue') };",
    "return { label: it[0], owner: it[1], rowCls: 'fr-row' + (v ? ' ' + v : ''), mark: v || '', note: s.floorNotes[key] || '', setNote: function (e) { var n = Object.assign({}, self.state.floorNotes); n[key] = e.target.value; self.setState({ floorNotes: n }); }, okCls: v === 'ok' ? 'ok-on' : '', isCls: v === 'issue' ? 'is-on' : '', ok: set('ok'), issue: set('issue') };", 'item');
rep("var issues = d.FLOOR.filter(function (it, i) { return s.floorMarks[s.floor + ':' + i] === 'issue'; });",
    "var issues = d.FLOOR.filter(function (it, i) { return s.floorMarks[s.floor + ':' + i] === 'issue'; });\n" +
    "    var GROUPS = [['Rooms and meals', 0, 3], ['People on the floor', 3, 5], ['Records and notices', 5, 8]];\n" +
    "    var floorGroups = GROUPS.map(function (g) { var its = floorItems.slice(g[1], g[2]); var dn = its.filter(function (x) { return x.mark; }).length; return { title: g[0], progress: dn + ' of ' + its.length, items: its }; });\n" +
    "    var floorStrip = floorItems.map(function (x) { return { cls: x.mark }; });\n" +
    "    var floorOk = floorItems.filter(function (x) { return x.mark === 'ok'; }).length;", 'groups');
rep("floorSegs: floorSegs, floorName: FL[s.floor], floorItems: floorItems, floorDone: floorDone, floorTotal: d.FLOOR.length,",
    "floorSegs: floorSegs, floorName: FL[s.floor], floorItems: floorItems, floorDone: floorDone, floorTotal: d.FLOOR.length,\n" +
    "      floorGroups: floorGroups, floorStrip: floorStrip, floorOk: floorOk, floorIssues: issues.length, floorIssueWord: issues.length === 1 ? 'issue' : 'issues', floorLeft: d.FLOOR.length - floorDone,\n" +
    "      roundDoneText: FL[s.floor] + ' round saved. ' + floorOk + ' OK' + (issues.length ? ', ' + issues.length + (issues.length === 1 ? ' issue sent' : ' issues sent') + ' to the owning ' + (issues.length === 1 ? 'team' : 'teams') + ' as grievances.' : ', nothing to follow up.'),", 'vals');
/* the old note + finish */
const nStart = t.indexOf("      roundNote: s.roundDone ?");
const nEnd = t.indexOf("finishRound: function () { self.setState({ roundDone: true }); },") + "finishRound: function () { self.setState({ roundDone: true }); },".length;
if (nStart < 0 || nEnd < nStart) throw new Error('round note');
const fin =
"      roundNote: s.roundMsg || (s.roundDone ? 'Saved.' : (floorDone === d.FLOOR.length ? 'All checked. Finish to send the issues to their owners.' : 'Check every item, then finish the round.')),\n" +
"      finishRound: function () {\n" +
"        if (floorDone < d.FLOOR.length) { self.setState({ roundMsg: (d.FLOOR.length - floorDone) + ' item' + (d.FLOOR.length - floorDone === 1 ? '' : 's') + ' not checked yet. Mark each one OK or Issue first.' }); return; }\n" +
"        var sent = Object.assign({}, self.state.floorSent), extra = self.state.extraConcerns.slice(), n = extra.length;\n" +
"        d.FLOOR.forEach(function (it, i) {\n" +
"          var key = s.floor + ':' + i;\n" +
"          if (s.floorMarks[key] === 'issue' && !sent[key]) {\n" +
"            sent[key] = true; n += 1;\n" +
"            extra.push({ id: 'C-0' + (143 + extra.length + 20), type: 'concern', pid: '', pname: FL[s.floor], title: it[0] + ': not OK on the floor round', raisedBy: 'Floor round, Prabh', via: 'Floor round', owner: it[1], ownerRole: it[1], category: 'Other', sla: '4 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: s.floorNotes[key] || 'Marked as an issue on the ' + FL[s.floor] + ' round.' });\n" +
"          }\n" +
"        });\n" +
"        self.setState({ roundDone: true, roundMsg: '', floorSent: sent, extraConcerns: extra });\n" +
"      },";
t = t.slice(0, nStart) + fin + t.slice(nEnd);

const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
