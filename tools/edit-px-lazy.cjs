/* One-off (11 Nov): easier screens for Patient Experience Lead, for a very busy or very lazy person.
   Discharge checklist, Follow-ups, Room cleanliness, Family updates, Discharge feedback.
   Rule for every screen: one big "do this next" card on top, big tap targets, defaults filled in,
   one part open at a time, and the extra detail tucked away. Demo data only. */
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
function repLine(prefix, line, label) {
  const n = t.split(prefix).length - 1;
  if (n !== 1) throw new Error('expected 1 line, got ' + n + ': ' + label);
  const a = t.indexOf(prefix), e = t.indexOf('\n', a);
  t = t.slice(0, a) + line + t.slice(e);
}
function repBlock(startMark, endMark, text, label) {
  const a = t.indexOf(startMark), e = t.indexOf(endMark, a + 1);
  if (a < 0 || e < 0) throw new Error('block markers: ' + label);
  t = t.slice(0, a) + text + t.slice(e);
}
if (t.indexOf('lz-go') >= 0) throw new Error('already applied');

const CHECK = '<svg width="18" height="18" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>';
const CARET = '<svg width="18" height="18" sc-camel-view-box="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>';

/* =============================== CSS =============================== */
const css = `
/* ===== easy screens ===== */
.lz-go{display:flex;gap:18px 24px;align-items:center;flex-wrap:wrap;background:#fff;border:1px solid #dde5ef;border-left:6px solid #1e6cdb;border-radius:18px;padding:20px 24px}
.lz-go.ok{border-left-color:#0e7c66;background:#f2fbf7}
.lz-go.warn{border-left-color:#d48806;background:#fffaf1}
.lz-go .lz-t{flex:1 1 280px;min-width:0}
.lz-go h2{margin:0;font-size:22px;line-height:1.25;letter-spacing:-.01em;color:#14284b}
.lz-go p{margin:6px 0 0;font-size:15px;color:#475467;line-height:1.45}
.btn.lz-big{height:54px;padding:0 28px;font-size:17px;border-radius:14px}
.btn.lz-green{background:#0e7c66;border-color:#0e7c66;color:#fff}
.btn.lz-green:hover{background:#0b6553;border-color:#0b6553}
.btn.lz-big.ok{background:#e3f7ea;border-color:#9fd8b4;color:#11703a}
.lz-chips{display:flex;flex-wrap:wrap;gap:10px}
.lz-chip{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 18px;border-radius:999px;border:1.5px solid #d6dee8;background:#fff;font:inherit;font-size:15px;font-weight:600;color:#14284b;cursor:pointer;box-sizing:border-box;text-align:left}
.lz-chip:hover{border-color:#1e6cdb}
.lz-chip.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}
.lz-chip.good{background:#f1fbf4;border-color:#9fd8b4;color:#11703a}
.lz-chip.good.on{background:#0e7c66;border-color:#0e7c66;color:#fff}
.lz-chip .n{font-size:12px;font-weight:700;border-radius:999px;padding:1px 8px;background:#e8f1fe;color:#1e5bb8}
.lz-chip.on .n{background:rgba(255,255,255,.25);color:#fff}
.lz-chip small{font-size:12px;font-weight:600;opacity:.8}
.lz-dot{width:10px;height:10px;border-radius:50%;background:#d48806;flex:0 0 10px}
.lz-dot.g{background:#0e7c66}.lz-dot.r{background:#b42318}
.lz-chip.on .lz-dot{box-shadow:0 0 0 2px rgba(255,255,255,.7)}
.lz-bar{height:10px;border-radius:99px;background:#e6edf5;overflow:hidden}
.lz-bar i{display:block;height:100%;background:#1e6cdb;border-radius:99px;transition:width .35s ease}
.lz-bar i.full{background:#0e7c66}
.lz-prog{display:flex;align-items:center;gap:14px}.lz-prog .lz-bar{flex:1}.lz-prog b{font-size:14px;color:#14284b;white-space:nowrap}
.lz-line{color:#5b6475;font-size:14px;line-height:1.45}
.lz-stack{display:flex;flex-direction:column;gap:14px}
.lz-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px 28px}
.lz-acc{overflow:hidden}
.lz-acc-h{display:flex;align-items:center;gap:14px;width:100%;padding:14px 20px;background:none;border:0;font:inherit;text-align:left;cursor:pointer;min-height:68px;color:inherit}
.lz-acc-h:hover{background:#f8fafc}
.lz-ic{width:36px;height:36px;border-radius:50%;background:#eef2f6;color:#475467;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex:0 0 36px}
.lz-ic.ok{background:#0e7c66;color:#fff}
.lz-ttl{display:block;font-size:17px;font-weight:700;color:#14284b}
.lz-sub{display:block;font-size:13px;color:#5b6475;margin-top:2px}
.lz-caret{margin-left:auto;color:#5b6475;display:flex;transition:transform .2s ease}
.lz-caret.up{transform:rotate(180deg)}
.lz-acc-b{border-top:1px solid #eef2f6}
.lz-row{cursor:pointer;padding:16px 20px;gap:14px;flex-wrap:nowrap;user-select:none}
.lz-row:hover{background:#f8fafc}
.lz-row .name{font-size:16px;line-height:1.4}
.lz-row .cbx{width:30px;height:30px;flex:0 0 30px;border-radius:9px;border-width:2px}
.lz-row.lz-done .name{color:#5b6475}
.lz-row.bad{background:#fff6f6}
.lz-acc-f{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 20px;border-top:1px solid #eef2f6;background:#fafbfd}
.lz-pill{display:inline-flex;align-items:center;justify-content:center;min-width:84px;height:34px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:700;background:#e3f7ea;color:#11703a}
.lz-pill.bad{background:#fde8e6;color:#b42318}
.lz-card{background:#fff;border:1px solid #e3eaf2;border-left:6px solid var(--sr,transparent);border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:12px}
.lz-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
.lz-name{font-size:18px;font-weight:700;color:#14284b}
.lz-q{background:#fff;border:1px solid #e3eaf2;border-radius:18px;padding:20px 22px;display:flex;flex-direction:column;gap:14px}
.lz-q h3{margin:0;font-size:18px;line-height:1.35;color:#14284b}
.lz-opt{font-weight:500;font-size:14px;color:#5b6475}
.lz-nps{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:6px}
.lz-n{height:56px;border-radius:12px;border:1.5px solid #d6dee8;background:#fff;font:inherit;font-size:18px;font-weight:700;cursor:pointer;color:#14284b;padding:0}
.lz-n.lo{border-color:#f3c1bd}.lz-n.mid{border-color:#f5d9a8}.lz-n.hi{border-color:#bfe8cd}
.lz-n.on.lo{background:#b42318;border-color:#b42318;color:#fff}
.lz-n.on.mid{background:#d48806;border-color:#d48806;color:#fff}
.lz-n.on.hi{background:#0e7c66;border-color:#0e7c66;color:#fff}
.lz-rate{display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap;padding:14px 0;border-top:1px solid #eef2f6}
.lz-rate>span{flex:1 1 260px;font-size:15px;line-height:1.4;color:#14284b}
.lz-stars{display:flex;gap:8px}
.lz-s{width:52px;height:52px;border-radius:12px;border:1.5px solid #d6dee8;background:#fff;font:inherit;font-size:17px;font-weight:700;cursor:pointer;color:#334155;padding:0}
.lz-s.on{background:#1e6cdb;border-color:#1e6cdb;color:#fff}
.lz-rooms{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;padding:0 20px 20px}
.lz-room{min-height:84px;border-radius:14px;border-width:1.5px}
.lz-room b{font-size:20px}
.cl-room.cl-next{border:2px dashed #1e6cdb}
.lz-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px 28px}
.lz-fld .name{margin-bottom:8px;font-size:15px}
.lz-chip.sm{min-height:42px;padding:0 15px;font-size:14px}
@media (max-width:560px){.lz-nps{grid-template-columns:repeat(6,minmax(0,1fr))}.lz-go{padding:16px}.lz-go h2{font-size:19px}.btn.lz-big{width:100%}}
`;
rep('.dc-head{display:grid', css + '.dc-head{display:grid', 'css');

/* =============================== STATE =============================== */
rep("dc: {}, dcPid: 'p6',", "dcOpen: '', dcEditC: false, fuShowMsg: false, fuShowBlank: false, clProblem: false, clSec: -1, famShowPrev: false, famShowSteps: false, fbShowSum: false,\n      dc: {}, dcPid: 'p6',", 'state');
rep('nps: 4, ratings: [5, 4, 4, 2, 4, 5], outcomes:', 'nps: -1, ratings: [0, 0, 0, 0, 0, 0], outcomes:', 'state nps');

/* =============================== MARKUP =============================== */
const accRows = (list) => `
        <sc-for list="{{${list}}}" as="c" hint-placeholder-count="5">
          <div class="{{c.rowCls}}" sc-camel-on-click="{{c.toggle}}">
            <span class="{{c.cls}}">${CHECK}</span>
            <div class="grow"><div class="name">{{c.label}}</div><div class="muted small">{{c.sub}}</div></div>
            <sc-if value="{{c.hasTag}}" hint-placeholder-val="{{false}}"><span class="{{c.tagCls}}">{{c.tag}}</span></sc-if>
          </div>
        </sc-for>`;
const accSection = (list) => `
  <sc-for list="{{${list}}}" as="g" hint-placeholder-count="2">
    <section class="card lz-acc" id="{{g.dom}}">
      <button class="lz-acc-h" type="button" sc-camel-on-click="{{g.toggle}}">
        <span class="{{g.icCls}}">{{g.icTxt}}</span>
        <span><span class="lz-ttl">{{g.title}}</span><span class="lz-sub">{{g.sub}}</span></span>
        <span class="{{g.caretCls}}">${CARET}</span>
      </button>
      <sc-if value="{{g.open}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
        <sc-if value="{{g.isRisk}}" hint-placeholder-val="{{false}}"><div class="cpad" style="border-bottom:1px solid #eef2f6;display:flex;flex-direction:column;gap:10px"><div class="name">How risky is it to send this patient home?</div><div class="lz-chips"><sc-for list="{{g.riskBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div><div class="muted small">{{g.riskHint}}</div></div></sc-if>
        <div>${accRows('g.items')}
        </div>
        <sc-if value="{{g.hasLeft}}" hint-placeholder-val="{{false}}"><div class="lz-acc-f"><button class="btn lz-big lz-green" type="button" sc-camel-on-click="{{g.tickAll}}">{{g.tickLabel}}</button><span class="muted small">Press this only if every one of them was done.</span></div></sc-if>
      </div></sc-if>
    </section>
  </sc-for>`;

const dcheckMarkup = `<!-- ============ DISCHARGE CHECKLIST ============ -->
<sc-if value="{{isDcheck}}" hint-placeholder-val="{{false}}">
  <div class="{{dcGoCls}}">
    <div class="lz-t"><h2>{{dcGoTitle}}</h2><p>{{dcGoSub}}</p></div>
    <button class="btn pri lz-big" type="button" sc-camel-on-click="{{dcGoAct}}">{{dcGoBtn}}</button>
  </div>
  <section class="card"><div class="cpad lz-stack">
    <div class="lz-chips"><sc-for list="{{dcPatients}}" as="o" hint-placeholder-count="1"><button class="{{o.cls}}" type="button" sc-camel-on-click="{{o.pick}}">{{o.label}}</button></sc-for></div>
    <div class="lz-line">{{dcLine}}</div>
    <div class="lz-prog"><div class="lz-bar"><i class="{{dcBarCls}}" style="width:{{dcPct}}"></i></div><b>{{dcPctText}}</b></div>
  </div></section>
  ${accSection('dcSecA')}

  <section class="card lz-acc" id="dc-plan">
    <button class="lz-acc-h" type="button" sc-camel-on-click="{{dcf.toggle}}">
      <span class="{{dcf.icCls}}">{{dcf.icTxt}}</span>
      <span><span class="lz-ttl">Follow-up plan</span><span class="lz-sub">{{dcf.sub}}</span></span>
      <span class="{{dcf.caretCls}}">${CARET}</span>
    </button>
    <sc-if value="{{dcf.open}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
      <div class="cpad lz-stack" style="gap:18px">
        <div class="muted small">Pick when each doctor will see the patient again. These dates make the call centre's list by themselves.</div>
        <div class="lz-q" style="padding:16px 18px;gap:12px">
          <div class="name">Psychiatrist · {{dcf.doctor}}</div>
          <div class="lz-chips"><sc-for list="{{dcf.docQuick}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div>
          <div class="fgrid"><div class="field"><label for="dcdd">Or pick another date</label><input id="dcdd" type="date" value="{{dcf.docDate}}" sc-camel-on-change="{{dcf.setDocDate}}"></div><div class="field"><label for="dcdt">Time</label><input id="dcdt" type="time" value="{{dcf.docTime}}" sc-camel-on-change="{{dcf.setDocTime}}"></div></div>
        </div>
        <div class="lz-q" style="padding:16px 18px;gap:12px">
          <div class="name">Psychologist · {{dcf.psych}}</div>
          <div class="lz-chips"><sc-for list="{{dcf.psyQuick}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div>
          <div class="fgrid"><div class="field"><label for="dcpd">Or pick another date</label><input id="dcpd" type="date" value="{{dcf.psyDate}}" sc-camel-on-change="{{dcf.setPsyDate}}"></div><div class="field"><label for="dcpt">Time</label><input id="dcpt" type="time" value="{{dcf.psyTime}}" sc-camel-on-change="{{dcf.setPsyTime}}"></div></div>
        </div>
        <sc-for list="{{dcf.gaps}}" as="m" hint-placeholder-count="1">
          <div class="note dc-gap"><span><b>{{m.who}}</b> has not given a follow-up date. Ask before the family leaves.</span><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="{{m.remCls}}" type="button" sc-camel-on-click="{{m.remind}}">{{m.remLabel}}</button><button class="{{m.cntCls}}" type="button" sc-camel-on-click="{{m.count}}">{{m.cntLabel}}</button></span></div>
        </sc-for>
        <div class="lz-fld"><div class="name">Family agrees to the Day-14 and Day-30 calls?</div><div class="lz-chips"><sc-for list="{{dcf.consentBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>
        <div class="lz-fld"><div class="name">Who makes the calls?</div><div class="lz-chips"><sc-for list="{{dcf.assignBtns}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>
        <div class="info" style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span>Calls go to <b>{{dcf.cName}}</b> {{dcf.cRelTxt}} · {{dcf.cPhone}}</span><button class="btn sm" type="button" sc-camel-on-click="{{dcf.toggleEditC}}">{{dcf.editLabel}}</button></div>
        <sc-if value="{{dcf.editC}}" hint-placeholder-val="{{false}}"><div class="fgrid">
          <div class="field"><label for="dccn">Name</label><input id="dccn" placeholder="Name" value="{{dcf.cName}}" sc-camel-on-change="{{dcf.setCName}}"></div>
          <div class="field"><label for="dccr">Relation</label><input id="dccr" placeholder="e.g. Father" value="{{dcf.cRel}}" sc-camel-on-change="{{dcf.setCRel}}"></div>
          <div class="field"><label for="dccp">Mobile</label><input id="dccp" placeholder="Mobile number" value="{{dcf.cPhone}}" sc-camel-on-change="{{dcf.setCPhone}}"></div>
        </div></sc-if>
      </div>
      <div style="border-top:1px solid #eef2f6">${accRows('dcf.items')}
      </div>
      <sc-if value="{{dcf.hasLeft}}" hint-placeholder-val="{{false}}"><div class="lz-acc-f"><button class="btn lz-big lz-green" type="button" sc-camel-on-click="{{dcf.tickAll}}">{{dcf.tickLabel}}</button><span class="muted small">Press this only if every one of them was done.</span></div></sc-if>
    </div></sc-if>
  </section>
  ${accSection('dcSecB')}

  <section class="card lz-acc" id="dc-sign">
    <button class="lz-acc-h" type="button" sc-camel-on-click="{{dcSignToggle}}">
      <span class="{{dcSignIc}}">{{dcSignIcTxt}}</span>
      <span><span class="lz-ttl">Sign-off</span><span class="lz-sub">{{dcSignText}} · nurse, doctor and family</span></span>
      <span class="{{dcSignCaret}}">${CARET}</span>
    </button>
    <sc-if value="{{dcSignOpen}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
      <div class="dc-sigs">
        <sc-for list="{{dcSigns}}" as="g" hint-placeholder-count="3">
          <div class="dc-sig">
            <div class="name" style="font-size:16px">{{g.role}}</div>
            <div class="muted small">{{g.says}}</div>
            <div class="field"><input aria-label="{{g.role}} name" placeholder="Name (optional)" value="{{g.name}}" sc-camel-on-change="{{g.setName}}"></div>
            <button class="{{g.btnCls}}" type="button" sc-camel-on-click="{{g.sign}}">{{g.btnLabel}}</button>
          </div>
        </sc-for>
      </div>
    </div></sc-if>
  </section>

  <sc-if value="{{dcDone}}" hint-placeholder-val="{{false}}"><section class="card"><div class="cpad lz-stack"><div class="info">{{dcDoneText}}</div><div><button class="btn pri lz-big" type="button" sc-camel-on-click="{{goFollow}}">Open follow-ups</button></div></div></section></sc-if>
  <sc-if value="{{dcOpenFinal}}" hint-placeholder-val="{{true}}">
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{dcComplete}}">Complete discharge</button><span class="muted">{{dcHint}}</span></div>
    <sc-if value="{{dcShowBlocks}}" hint-placeholder-val="{{false}}"><div class="note"><b>Still to do before the family leaves:</b><sc-for list="{{dcBlocks}}" as="b" hint-placeholder-count="3"><div>· {{b.t}}</div></sc-for></div></sc-if>
  </sc-if>
</sc-if>

`;

const followMarkup = `<!-- ============ FOLLOW-UPS ============ -->
<sc-if value="{{isFollow}}" hint-placeholder-val="{{false}}">
  <div class="{{fuGoCls}}">
    <div class="lz-t"><h2>{{fuGoTitle}}</h2><p>{{fuGoSub}}</p></div>
    <sc-if value="{{fuGoHas}}" hint-placeholder-val="{{true}}"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{fuGoAct}}">{{fuGoBtn}}</button></sc-if>
  </div>
  <sc-if value="{{fuHasTomorrow}}" hint-placeholder-val="{{true}}"><section class="card"><div class="cpad lz-stack">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><div class="name" style="font-size:17px">Tomorrow's list for the call centre</div><div class="muted small">{{fuTomorrowCount}}</div></div><span class="{{fuPostChip}}">{{fuPostText}}</span></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn lz-big" type="button" sc-camel-on-click="{{fuCopy}}">Copy to WhatsApp</button><button class="btn link" type="button" sc-camel-on-click="{{fuToggleMsg}}">{{fuMsgBtn}}</button><span class="muted small">{{fuMsg}}</span></div>
    <sc-if value="{{fuShowMsg}}" hint-placeholder-val="{{false}}"><div class="fu-msg">{{fuTomorrowText}}</div></sc-if>
  </div></section></sc-if>
  <div class="lz-chips" id="fu-list" role="tablist"><sc-for list="{{fuSegs}}" as="g" hint-placeholder-count="5"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div>
  <div class="lz-stack">
    <sc-for list="{{fuRows}}" as="f" hint-placeholder-count="4">
      <div class="lz-card" style="{{f.sr}}">
        <div class="lz-top"><div><div class="lz-name">{{f.name}}</div><div class="muted">{{f.kind}} · {{f.with}}</div></div><span class="{{f.dueCls}}">{{f.dueTxt}}</span></div>
        <div class="lz-line">Family: {{f.family}} · {{f.phone}} · discharged {{f.dischTxt}}</div>
        <div class="small" style="{{f.flagStyle}}">{{f.flag}}</div>
        <div class="name" style="font-size:14px">What happened?</div>
        <div class="lz-chips"><sc-for list="{{f.quick}}" as="q" hint-placeholder-count="4"><button class="{{q.cls}}" type="button" sc-camel-on-click="{{q.pick}}">{{q.label}}</button></sc-for>
          <div class="field" style="min-width:190px"><sc-raw-select aria-label="Other outcome for {{f.name}}" value="{{f.otherVal}}" sc-camel-on-change="{{f.setOutcome}}"><option value="">Something else…</option><option>OPD booked</option><option>Online OPD booked</option><option>Came for appointment</option><option>Call done, doing well</option><option>Did not pick up</option><option>Will call back</option><option>Number switched off</option><option>Coming later</option><option>Readmitted</option><option>Found another hospital</option><option>Found another doctor</option></sc-raw-select></div>
          <sc-if value="{{f.canRemind}}" hint-placeholder-val="{{false}}"><button class="{{f.remCls}}" type="button" sc-camel-on-click="{{f.remind}}">{{f.remLabel}}</button></sc-if>
        </div>
      </div>
    </sc-for>
    <sc-if value="{{fuEmpty}}" hint-placeholder-val="{{false}}"><section class="card"><div class="cpad muted" style="font-size:16px">Nothing to do in this list.</div></section></sc-if>
  </div>
  <div class="lz-line">{{fuCame}}</div>
  <section class="card">
    <button class="lz-acc-h" type="button" sc-camel-on-click="{{fuToggleBlank}}"><span><span class="lz-ttl">Doctors who left the follow-up date blank</span><span class="lz-sub">{{fuBlankSub}}</span></span><span class="{{fuBlankCaret}}">${CARET}</span></button>
    <sc-if value="{{fuShowBlank}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
      <sc-for list="{{fuBlanks}}" as="b" hint-placeholder-count="3">
        <div class="listrow" style="padding:14px 20px"><div class="grow" style="flex-basis:140px"><div class="name">{{b.name}}</div><div class="muted small">{{b.role}}</div></div><span class="{{b.chip}}">{{b.n}} of 5</span><sc-if value="{{b.over}}" hint-placeholder-val="{{false}}"><button class="btn sm" type="button" sc-camel-on-click="{{b.raise}}">Raise to Chandraji</button></sc-if></div>
      </sc-for>
    </div></sc-if>
  </section>
</sc-if>

`;

const cleanMarkup = `<!-- ============ ROOM CLEANLINESS ============ -->
<sc-if value="{{isClean}}" hint-placeholder-val="{{false}}">
  <div class="{{clGoCls}}">
    <div class="lz-t"><h2>{{clGoTitle}}</h2><p>{{clGoSub}}</p></div>
    <sc-if value="{{clGoHas}}" hint-placeholder-val="{{true}}"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{clGoAct}}">{{clGoBtn}}</button></sc-if>
  </div>
  <section class="card">
    <div class="cpad lz-stack" style="padding-bottom:6px">
      <div class="lz-chips" role="tablist"><sc-for list="{{clFloors}}" as="g" hint-placeholder-count="3"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div>
      <div class="lz-prog"><div class="lz-bar"><i class="{{clBarCls}}" style="width:{{clPct}}"></i></div><b>{{clDoneText}}</b></div>
      <div class="lz-line">Tap a room. Green = all OK · Red = problem · Dashed blue = check this one next.</div>
    </div>
    <div class="cl-rooms lz-rooms"><sc-for list="{{clRooms}}" as="r" hint-placeholder-count="15"><button class="{{r.cls}}" type="button" sc-camel-on-click="{{r.pick}}"><b>{{r.no}}</b><span>{{r.sub}}</span></button></sc-for></div>
  </section>
  <section class="card" id="cl-panel">
    <div class="chead"><div><h3 style="font-size:19px">Room {{clRoom}}</h3><div class="muted small">{{clStamp}}</div></div>
      <div class="lz-chips"><sc-for list="{{clByBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div></div>
    <sc-if value="{{clHasMsg}}" hint-placeholder-val="{{false}}"><div class="cpad" style="padding-bottom:0"><div class="info" style="font-size:15px">{{clMsg}}</div></div></sc-if>
    <sc-if value="{{clNoProb}}" hint-placeholder-val="{{true}}"><div class="cpad lz-stack">
      <div class="lz-line" style="font-size:15px">Walk through the room. If everything is fine, tap the green button. That is all.</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn lz-big lz-green" type="button" sc-camel-on-click="{{clSave}}">Everything is fine, next room</button><button class="btn lz-big" type="button" sc-camel-on-click="{{clProblemOn}}">Something is wrong</button></div>
    </div></sc-if>
    <sc-if value="{{clProb}}" hint-placeholder-val="{{false}}"><div>
      <div class="cpad"><div class="info" style="font-size:15px">Open a part of the room, then tap only the things that are <b>not</b> right. Everything you do not tap is saved as OK.</div></div>
      <sc-for list="{{clSecs}}" as="g" hint-placeholder-count="6">
        <div style="border-top:1px solid #eef2f6">
          <button class="lz-acc-h" type="button" sc-camel-on-click="{{g.toggle}}"><span class="{{g.icCls}}">{{g.icTxt}}</span><span><span class="lz-ttl">{{g.title}}</span><span class="lz-sub">{{g.progress}}</span></span><span class="{{g.caretCls}}">${CARET}</span></button>
          <sc-if value="{{g.open}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
            <sc-for list="{{g.items}}" as="f" hint-placeholder-count="4">
              <div class="{{f.rowCls}}" sc-camel-on-click="{{f.flip}}"><div class="grow"><div class="name">{{f.label}}</div><div class="muted small">{{f.area}}</div></div><span class="{{f.pillCls}}">{{f.pillTxt}}</span></div>
            </sc-for>
          </div></sc-if>
        </div>
      </sc-for>
      <div style="border-top:1px solid #eef2f6"><div class="cpad lz-stack"><div class="name">Anything for maintenance? <span class="lz-opt">(leave empty if not)</span></div><div class="fgrid"><sc-for list="{{clMaint}}" as="m" hint-placeholder-count="5"><div class="field"><label>{{m.label}}</label><input placeholder="What is wrong?" value="{{m.v}}" sc-camel-on-change="{{m.set}}"></div></sc-for><div class="field"><label>Remarks</label><input placeholder="Anything else" value="{{clRemarks}}" sc-camel-on-change="{{clSetRemarks}}"></div></div></div></div>
      <div class="lz-acc-f"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{clSave}}">Save room {{clRoom}} with problems</button><sc-if value="{{clCanBack}}" hint-placeholder-val="{{true}}"><button class="btn lz-big" type="button" sc-camel-on-click="{{clProblemOff}}">Back</button></sc-if></div>
    </div></sc-if>
  </section>
</sc-if>

`;

const familyMarkup = `<!-- ============ FAMILY UPDATES ============ -->
<sc-if value="{{isFamily}}" hint-placeholder-val="{{false}}">
  <div class="{{famGoCls}}">
    <div class="lz-t"><h2>{{famGoTitle}}</h2><p>{{famGoSub}}</p></div>
    <sc-if value="{{famGoHas}}" hint-placeholder-val="{{true}}"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{famGoAct}}">{{famGoBtn}}</button></sc-if>
  </div>
  <div class="lz-chips"><sc-for list="{{famList}}" as="p" hint-placeholder-count="6"><button class="{{p.cls}}" type="button" sc-camel-on-click="{{p.pick}}"><span class="{{p.dot}}"></span>{{p.name}} <small>{{p.status}}</small></button></sc-for></div>
  <section class="card" id="fam-form">
    <div class="chead"><div><h3 style="font-size:19px">Update for {{famSel.name}}</h3><div class="muted small">{{famSel.who}}</div></div><span class="{{famSel.chip}}">{{famSel.status}}</span></div>
    <sc-if value="{{famQuiet}}" hint-placeholder-val="{{false}}"><div class="cpad" style="padding-bottom:0"><div class="note">{{famQuietText}}</div></div></sc-if>
    <div class="cpad lz-stack" style="gap:20px">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn soft lz-big" type="button" sc-camel-on-click="{{famUsual}}">Fill in the usual answers</button><span class="muted">Then change only what is different today.</span></div>
      <div class="lz-fields"><sc-for list="{{famFields}}" as="f" hint-placeholder-count="8"><div class="lz-fld"><div class="name">{{f.label}}</div><div class="lz-chips"><sc-for list="{{f.opts}}" as="o" hint-placeholder-count="3"><button class="{{o.cls}}" type="button" sc-camel-on-click="{{o.pick}}">{{o.label}}</button></sc-for></div></div></sc-for></div>
      <div class="field"><label for="famt" style="font-size:15px">TODAY: one real thing about {{famSel.name}} <span class="lz-opt">(never copied from another patient)</span></label><textarea id="famt" placeholder="A real moment from today, a milestone, something that happened" value="{{famSel.today}}" sc-camel-on-change="{{famSetToday}}"></textarea></div>
      <div class="field"><label for="famn" style="font-size:15px">NEXT</label><input id="famn" placeholder="Next family meeting, psychoeducation, outing" value="{{famSel.next}}" sc-camel-on-change="{{famSetNext}}"></div>
      <sc-if value="{{famShowPrev}}" hint-placeholder-val="{{false}}"><div class="fu-msg">{{famPreview}}</div></sc-if>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{famSend}}">{{famSendLabel}}</button><button class="btn lz-big" type="button" sc-camel-on-click="{{famCopy}}">Copy text</button><button class="btn link" type="button" sc-camel-on-click="{{famTogglePrev}}">{{famPrevBtn}}</button></div>
      <div class="info" style="font-size:15px" aria-live="polite">{{famMsg}}</div>
      <div class="muted small">An incident is never sent only on WhatsApp: call the family first, then write.</div>
    </div>
  </section>
  <section class="card" style="overflow:hidden">
    <button class="lz-acc-h" type="button" sc-camel-on-click="{{famToggleSteps}}"><span><span class="lz-ttl">Family meetings and calls coming up</span><span class="lz-sub">{{famStepsSub}}</span></span><span class="{{famStepsCaret}}">${CARET}</span></button>
    <sc-if value="{{famShowSteps}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
      <div class="cpad"><div class="lz-chips" role="tablist"><sc-for list="{{famSegs}}" as="g" hint-placeholder-count="4"><button class="{{g.cls}}" type="button" sc-camel-on-click="{{g.go}}">{{g.label}} <span class="n">{{g.n}}</span></button></sc-for></div></div>
      <div class="scrollx"><sc-raw-table class="pt">
        <sc-raw-thead><sc-raw-tr><sc-raw-th>Patient</sc-raw-th><sc-raw-th>Family step</sc-raw-th><sc-raw-th>Owner</sc-raw-th><sc-raw-th>Due</sc-raw-th><sc-raw-th></sc-raw-th></sc-raw-tr></sc-raw-thead>
        <sc-raw-tbody><sc-for list="{{famSteps}}" as="s" hint-placeholder-count="6"><sc-raw-tr style="{{s.sr}}">
          <sc-raw-td><div class="name">{{s.name}}</div><div class="pmeta">Day {{s.day}} of stay</div></sc-raw-td>
          <sc-raw-td><div>{{s.step}}</div><div class="muted small">{{s.how}}</div></sc-raw-td>
          <sc-raw-td>{{s.owner}}</sc-raw-td>
          <sc-raw-td><span class="{{s.chip}}">{{s.dueTxt}}</span></sc-raw-td>
          <sc-raw-td><sc-if value="{{s.canDo}}" hint-placeholder-val="{{false}}"><button class="btn sm" type="button" sc-camel-on-click="{{s.done}}">Mark done</button></sc-if></sc-raw-td>
        </sc-raw-tr></sc-for></sc-raw-tbody>
      </sc-raw-table><sc-if value="{{famStepsEmpty}}" hint-placeholder-val="{{false}}"><div class="cpad muted">Nothing in this list.</div></sc-if></div>
    </div></sc-if>
  </section>
</sc-if>

`;

const feedbackMarkup = `<sc-if value="{{isFeedback}}" hint-placeholder-val="{{false}}">
  <div class="{{fbGoCls}}">
    <div class="lz-t"><h2>{{fbGoTitle}}</h2><p>{{fbGoSub}}</p></div>
    <button class="btn pri lz-big" type="button" sc-camel-on-click="{{saveFb}}">Save feedback</button>
  </div>
  <section class="lz-q">
    <h3>Whose feedback is this?</h3>
    <div class="lz-chips"><sc-for list="{{fbPats}}" as="o" hint-placeholder-count="5"><button class="{{o.cls}}" type="button" sc-camel-on-click="{{o.pick}}">{{o.label}}</button></sc-for></div>
    <div class="lz-line">{{fbWho}}</div>
    <div class="name">Who is answering?</div>
    <div class="lz-chips"><sc-for list="{{whoBtns}}" as="b" hint-placeholder-count="6"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div>
  </section>
  <section class="lz-q">
    <h3>1. How likely are you to recommend Tulasi to another family?</h3>
    <div class="lz-nps"><sc-for list="{{npsBtns}}" as="b" hint-placeholder-count="11"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}" aria-label="Score {{b.n}}">{{b.n}}</button></sc-for></div>
    <div class="lz-line">{{fbNpsHint}}</div>
  </section>
  <section class="lz-q">
    <h3>2. How was each of these? <span class="lz-opt">1 = poor, 5 = excellent</span></h3>
    <div><sc-for list="{{rateRows}}" as="r" hint-placeholder-count="6"><div class="lz-rate"><span>{{r.label}}</span><div class="lz-stars"><sc-for list="{{r.btns}}" as="s" hint-placeholder-count="5"><button class="{{s.cls}}" type="button" sc-camel-on-click="{{s.pick}}" aria-label="{{r.label}} {{s.n}} of 5">{{s.n}}</button></sc-for></div></div></sc-for></div>
  </section>
  <section class="lz-q">
    <h3>3. In their own words <span class="lz-opt">(optional)</span></h3>
    <div class="lz-fields">
      <div class="field"><label for="fb1">What helped your family most?</label><textarea id="fb1" style="min-height:64px" placeholder="In their words" value="{{fb.helped}}" sc-camel-on-change="{{setFbHelped}}"></textarea></div>
      <div class="field"><label for="fb2">What could we have done better?</label><textarea id="fb2" style="min-height:64px" placeholder="In their words" value="{{fb.better}}" sc-camel-on-change="{{setFbBetter}}"></textarea></div>
    </div>
  </section>
  <section class="lz-q">
    <h3>4. May we call in 2 weeks to ask how recovery is going?</h3>
    <div class="lz-chips"><sc-for list="{{callBtns}}" as="b" hint-placeholder-count="2"><button class="{{b.cls}}" type="button" sc-camel-on-click="{{b.pick}}">{{b.label}}</button></sc-for></div>
    <sc-if value="{{fbCallYes}}" hint-placeholder-val="{{true}}"><div class="fgrid">
      <div class="field"><label for="fbm">Best mobile number</label><input id="fbm" placeholder="+91" value="{{fb.mobile}}" sc-camel-on-change="{{setFbMobile}}"></div>
      <div class="field"><label for="fbt">Best time</label><input id="fbt" placeholder="e.g. after 5 pm" value="{{fb.time}}" sc-camel-on-change="{{setFbTime}}"></div>
    </div></sc-if>
  </section>
  <sc-if value="{{isDetractor}}" hint-placeholder-val="{{false}}"><div class="note" style="font-size:15px">Score of 6 or below. Saving opens a grievance for you and tells Chandraji the same day.</div></sc-if>
  <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><button class="btn pri lz-big" type="button" sc-camel-on-click="{{saveFb}}">Save feedback</button><span style="font-size:15px">{{fbMsg}}</span></div>

  <section class="card">
    <button class="lz-acc-h" type="button" sc-camel-on-click="{{fbToggleSum}}"><span><span class="lz-ttl">See the last 30 days</span><span class="lz-sub">Scores, ratings by area and the weakest area</span></span><span class="{{fbSumCaret}}">${CARET}</span></button>
    <sc-if value="{{fbShowSum}}" hint-placeholder-val="{{false}}"><div class="lz-acc-b">
      <div class="tiles rail" style="border:0;border-radius:0">
        <sc-for list="{{fbTiles}}" as="t" hint-placeholder-count="4"><div class="tile"><span class="lbl">{{t.label}}</span><b>{{t.value}}</b><span class="muted small">{{t.sub}}</span></div></sc-for>
      </div>
      <div style="border-top:1px solid #eef2f6">
        <sc-for list="{{fbAreas}}" as="a" hint-placeholder-count="6"><div class="listrow" style="padding:11px 20px"><div style="flex:0 0 200px">{{a.label}}</div><div class="bar blue" style="flex:1 1 100px"><i style="width:{{a.pct}}"></i></div><div class="name" style="flex:0 0 34px;text-align:right">{{a.avg}}</div></div></sc-for>
      </div>
      <div class="cpad"><div class="note">{{fbLowest}}</div></div>
    </div></sc-if>
  </section>
</sc-if>

`;

/* replace the five markup blocks */
repBlock('<sc-if value="{{isFeedback}}"', '<!-- ============ WEEKLY REPORT', feedbackMarkup, 'feedback markup');
repBlock('<!-- ============ DISCHARGE CHECKLIST', '<!-- ============ FOLLOW-UPS', dcheckMarkup, 'dcheck markup');
repBlock('<!-- ============ FOLLOW-UPS', '<!-- ============ ROOM CLEANLINESS', followMarkup, 'follow markup');
repBlock('<!-- ============ ROOM CLEANLINESS', '<!-- ============ FAMILY UPDATES', cleanMarkup, 'clean markup');
repBlock('<!-- ============ FAMILY UPDATES', '<sc-if value="{{isReport}}"', familyMarkup, 'family markup');

/* =============================== LOGIC: feedback =============================== */
repLine("    var npsBtns = [0,1,2,3,4,5,6,7,8,9,10]", "    var npsBtns = [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return { n: n, cls: 'lz-n ' + (n <= 6 ? 'lo' : n <= 8 ? 'mid' : 'hi') + (s.nps === n ? ' on' : ''), pick: function () { self.setState({ nps: n, fbMsg: '' }); } }; });", 'npsBtns');
repLine("    var rateRows = RL.map(", "    var rateRows = RL.map(function (label, ri) { return { label: label, btns: [1,2,3,4,5].map(function (n) { return { n: n, cls: 'lz-s' + (s.ratings[ri] === n ? ' on' : ''), pick: function () { var r = self.state.ratings.slice(); r[ri] = n; self.setState({ ratings: r, fbMsg: '' }); } }; }) }; });", 'rateRows');
rep("isDetractor: s.nps <= 6, followups: followups,", "isDetractor: s.nps >= 0 && s.nps <= 6, followups: followups,", 'detractor');
const fbLogic = `
      fbPats: F.map(function (f) { var dn = s.fbSaved.some(function (x) { return x.name === f.name; }); return { label: (dn ? '\\u2713 ' : '') + f.name, cls: 'lz-chip' + (dn ? ' good' : '') + (f.id === s.fb.pid ? ' on' : ''), pick: function () { var fb2 = Object.assign({}, self.state.fb, { pid: f.id }); self.setState({ fb: fb2, fbMsg: '' }); } }; }),
      fbWho: 'Discharged ' + fbSel.discharged + ' · ' + fbSel.doctor + ' · family contact: ' + fbSel.family,
      whoBtns: ['Patient (self)', 'Parent', 'Spouse', 'Sibling', 'Guardian', 'Other'].map(function (v) { return { label: v, cls: 'lz-chip sm' + (s.fb.who === v ? ' on' : ''), pick: pickFb('who', v) }; }),
      fbNpsHint: s.nps < 0 ? 'Tap a number from 0 (not at all) to 10 (definitely).' : s.nps <= 6 ? 'Not likely to recommend.' : s.nps <= 8 ? 'Likely to recommend.' : 'Very likely to recommend.',
      fbGoCls: 'lz-go' + (fbAnswered === 7 ? ' ok' : ''),
      fbGoTitle: fbAnswered === 7 ? 'All answered. Save feedback for ' + fbSel.name : 'Feedback for ' + fbSel.name,
      fbGoSub: fbAnswered + ' of 7 answers in. Fill the form with the family on the call, then save. Nothing else to do.',
      fbToggleSum: function () { self.setState({ fbShowSum: !self.state.fbShowSum }); }, fbShowSum: s.fbShowSum, fbSumCaret: 'lz-caret' + (s.fbShowSum ? ' up' : ''),
`;
rep("      npsBtns: npsBtns, rateRows: rateRows,", fbLogic + "      npsBtns: npsBtns, rateRows: rateRows,", 'fb props');
rep("    var fbSel = F.filter(function (f) { return f.id === s.fb.pid; })[0] || F[0];", "    var fbSel = F.filter(function (f) { return f.id === s.fb.pid; })[0] || F[0];\n    var fbAnswered = (s.nps >= 0 ? 1 : 0) + s.ratings.filter(function (x) { return x > 0; }).length;", 'fbAnswered');
/* save: needs every answer, then moves on to the next family */
repBlock("      saveFb: function () {", "      reportTiles: [", `      saveFb: function () {
        var f = self.state.fb, p = F.filter(function (x) { return x.id === f.pid; })[0] || F[0];
        var miss = [];
        if (self.state.nps < 0) miss.push('question 1 (recommend score)');
        self.state.ratings.forEach(function (r, i) { if (!r) miss.push(RL[i]); });
        if (miss.length) { self.setState({ fbMsg: 'Still to answer: ' + miss.join('; ') + '.' }); return; }
        var entry = { name: p.name, nps: self.state.nps, ratings: self.state.ratings.slice(), call: f.call };
        var done = self.state.fbSaved.map(function (x) { return x.name; }).concat([p.name]);
        var nextP = F.filter(function (x) { return done.indexOf(x.name) < 0; })[0];
        var patch = { fbSaved: self.state.fbSaved.concat([entry]), nps: -1, ratings: [0, 0, 0, 0, 0, 0],
          fb: Object.assign({}, f, { pid: nextP ? nextP.id : f.pid, helped: '', better: '', mobile: '', time: '', assigned: '', action: self.state.nps <= 6 ? 'Yes' : 'No', who: 'Parent' }),
          fbMsg: 'Saved for ' + p.name + '. NPS ' + self.state.nps + ' entered on 11 Nov 2026.' + (nextP ? ' Next: ' + nextP.name + '.' : ' That was the last one.') };
        if (self.state.nps <= 6) {
          var id = 'C-0' + (143 + self.state.extraConcerns.length);
          patch.extraConcerns = self.state.extraConcerns.concat([{ id: id, type: 'concern', pid: '', pname: p.name, title: 'Detractor feedback from ' + p.name + ' (score ' + self.state.nps + ')', raisedBy: f.who + ' (discharge call)', via: 'Discharge feedback', owner: 'Prabh', ownerRole: 'Patient experience', category: 'Other', sla: '6 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: (f.better || 'Score of 6 or below on the discharge feedback form.') }]);
          patch.fbMsg += ' A grievance was opened for you to follow up.';
        }
        self.setState(patch);
      },
`, 'saveFb');

/* =============================== LOGIC: discharge checklist =============================== */
rep("var putDc = function (patch) { var all2 = Object.assign({}, self.state.dc); all2[dcp.id] = Object.assign({}, dc, patch); var st2 = { dc: all2, dcTry: false }; self.setState(st2); };",
  "var putDc = function (patch, extra) { var all2 = Object.assign({}, self.state.dc); all2[dcp.id] = Object.assign({}, dc, patch); var st2 = Object.assign({ dc: all2, dcTry: false }, extra || {}); self.setState(st2); };", 'putDc');
rep("rowCls: 'checkrow' + (off ? ' dc-off' : ''),", "rowCls: 'checkrow lz-row' + (on ? ' lz-done' : '') + (off ? ' dc-off' : ''),", 'mkItem row');
rep("return { title: g.title, owner: g.owner,", "var left = mc[1] - mc[0]; var isOpen = openId === g.id; return { dom: 'dc-' + g.id, open: isOpen, icCls: 'lz-ic' + (left === 0 ? ' ok' : ''), icTxt: left === 0 ? '\\u2713' : g.title.split('.')[0], sub: g.owner + ' · ' + (left === 0 ? 'all done' : left + ' to do'), caretCls: 'lz-caret' + (isOpen ? ' up' : ''), toggle: function () { self.setState({ dcOpen: isOpen ? '-' : g.id }); }, hasLeft: left > 0, tickLabel: 'Tick all ' + left + ' must-do', tickAll: function () { var tk = Object.assign({}, dc.ticks); g.items.forEach(function (it) { if (needs(it[2])) tk[it[0]] = 1; }); putDc({ ticks: tk }, { dcOpen: '' }); }, title: g.title.split('. ').slice(1).join('. '), owner: g.owner,", 'mkSec');
rep("{ label: r, cls: dc.risk === r ? 'on' : '', pick:", "{ label: r, cls: 'lz-chip' + (dc.risk === r ? ' on' : ''), pick:", 'risk chips');
rep("consentBtns: ['Yes', 'No'].map(function (v) { return { label: v, cls: dc.consent === v ? 'on' : '',", "consentBtns: ['Yes', 'No'].map(function (v) { return { label: v, cls: 'lz-chip' + (dc.consent === v ? ' on' : ''),", 'consent');
rep("sign: function () { if (sg.at) { upd({ at: '' }); return; } if (!String(sg.name || '').trim()) { window.alert('Type the ' + g[1].toLowerCase() + \"'s name first.\"); return; } upd({ at: '11 Nov, ' + nowTime() }); } };",
  "sign: function () { if (sg.at) { upd({ at: '' }); return; } upd({ name: String(sg.name || '').trim() || g[1], at: '11 Nov, ' + nowTime() }); } };", 'sign');
rep("btnLabel: sg.at ? 'Signed ' + sg.at : 'Sign', btnCls: 'btn sm' + (sg.at ? ' ok' : ' soft'),", "btnLabel: sg.at ? 'Signed ' + sg.at + ' (tap to undo)' : 'Tap to sign', btnCls: 'btn lz-big' + (sg.at ? ' ok' : ' pri'),", 'sign btn');

const dcAfter = `    var dischIso = fromDM(dcp.discharge);
    var scrollToId = function (id) { setTimeout(function () { try { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 80); };
    var secLeft = {}, secTitle = {};
    SEC.concat(SECB).forEach(function (g) { var m = mustCount(g.items); secLeft[g.id] = m[1] - m[0]; secTitle[g.id] = g.title.split('. ').slice(1).join('. '); });
    secLeft.plan = (2 - datesIn) + (mc5[1] - mc5[0]) + (String(dc.cPhone || '').trim() ? 0 : 1); secTitle.plan = 'Follow-up plan';
    secLeft.sign = 3 - signedN; secTitle.sign = 'Sign-off';
    var autoOpen = ['s1', 's2', 's3', 's4', 'plan', 's6', 's7', 'sign'].filter(function (k) { return secLeft[k] > 0; })[0] || '';
    openId = s.dcOpen === '-' ? '' : (s.dcOpen || autoOpen);
    var QD = [[7, 'In 1 week'], [14, 'In 2 weeks'], [30, 'In 1 month']];
    var quickDates = function (dk, tk) { return QD.map(function (q) { var iso = addDays(dischIso, q[0]); return { label: q[1] + ' · ' + dm(iso), cls: 'lz-chip' + (dc[dk] === iso ? ' on' : ''), pick: function () { var pt = {}; pt[dk] = iso; if (!dc[tk]) pt[tk] = '11:00'; putDc(pt); } }; }); };
    dcf.docQuick = quickDates('docDate', 'docTime'); dcf.psyQuick = quickDates('psyDate', 'psyTime');
    dcf.assignBtns = ['Khalid (call centre)', 'Kanika (patient experience)', 'Prabh (patient experience)'].map(function (v) { return { label: v, cls: 'lz-chip sm' + (dc.assigned === v ? ' on' : ''), pick: function () { putDc({ assigned: v }); } }; });
    dcf.open = openId === 'plan'; dcf.caretCls = 'lz-caret' + (dcf.open ? ' up' : ''); dcf.toggle = function () { self.setState({ dcOpen: openId === 'plan' ? '-' : 'plan' }); };
    dcf.icCls = 'lz-ic' + (secLeft.plan === 0 ? ' ok' : ''); dcf.icTxt = secLeft.plan === 0 ? '\\u2713' : '5';
    dcf.sub = secLeft.plan === 0 ? 'All done' : datesIn + ' of 2 dates · ' + secLeft.plan + ' to do';
    dcf.hasLeft = mc5[1] - mc5[0] > 0; dcf.tickLabel = 'Tick all ' + (mc5[1] - mc5[0]) + ' must-do';
    dcf.tickAll = function () { var tk = Object.assign({}, dc.ticks); SEC5.forEach(function (it) { if (needs(it[2])) tk[it[0]] = 1; }); putDc({ ticks: tk }); };
    dcf.editC = !!s.dcEditC; dcf.editLabel = s.dcEditC ? 'Done' : 'Change'; dcf.toggleEditC = function () { self.setState({ dcEditC: !self.state.dcEditC }); };
    dcf.cRelTxt = dc.cRel ? '(' + dc.cRel.toLowerCase() + ')' : '';
    var stepsTotal = mcAll[1] + 5, stepsDone = mcAll[0] + datesIn + signedN;
    var dcGo;
    if (dc.done) dcGo = { cls: 'lz-go ok', title: 'Discharge complete for ' + dcp.name, sub: dc.doneText, btn: 'Open follow-ups', act: go('follow') };
    else if (!blocks.length) dcGo = { cls: 'lz-go ok', title: 'Everything is in. Ready to complete.', sub: 'Completing books the follow-up calls for the call centre.', btn: 'Complete discharge', act: function () { self.__dcComplete(); } };
    else dcGo = { cls: 'lz-go', title: blocks.length + (blocks.length === 1 ? ' thing is' : ' things are') + ' left before ' + dcp.name + ' can go home', sub: autoOpen ? 'Next: ' + secTitle[autoOpen] + ' (' + secLeft[autoOpen] + ' to do).' : blocks[0].t, btn: 'Show me what is left', act: function () { self.setState({ dcOpen: autoOpen || '' }); scrollToId('dc-' + (autoOpen || 'sign')); } };
`;
rep("    var dischIso = fromDM(dcp.discharge);\n", dcAfter, 'dischIso block');
rep("    var mcAll = mustCount(allItems);", "    var openId = '';\n    var mcAll = mustCount(allItems);", 'openId decl');
repLine("      dcPatients: discharging.map(", "      dcPatients: discharging.map(function (p) { return { id: p.id, label: p.name + ' · going home ' + p.discharge, cls: 'lz-chip' + (p.id === dcp.id ? ' on' : ''), pick: function () { self.setState({ dcPid: p.id, dcTry: false, dcOpen: '' }); } }; }),", 'dcPatients');
rep("      dcTiles: [\n", `      dcLine: dcp.room + ' · ' + dcp.doctor + ' · ' + dcp.psych + ' · ' + dcp.uhid,
      dcPct: Math.round(stepsDone / Math.max(1, stepsTotal) * 100) + '%', dcPctText: stepsDone + ' of ' + stepsTotal + ' done', dcBarCls: stepsDone === stepsTotal ? 'full' : '',
      dcGoCls: dcGo.cls, dcGoTitle: dcGo.title, dcGoSub: dcGo.sub, dcGoBtn: dcGo.btn, dcGoAct: dcGo.act,
      dcSignOpen: openId === 'sign', dcSignCaret: 'lz-caret' + (openId === 'sign' ? ' up' : ''), dcSignToggle: function () { self.setState({ dcOpen: openId === 'sign' ? '-' : 'sign' }); },
      dcSignIc: 'lz-ic' + (signedN === 3 ? ' ok' : ''), dcSignIcTxt: signedN === 3 ? '\\u2713' : '\\u270D',
      dcOpenFinal: !dc.done && blocks.length === 0,
      dcTiles: [
`, 'dc props');
rep("    Object.assign(NX, NC, NF);", "    Object.assign(NX, NC, NF);\n    self.__dcComplete = NX.dcComplete;", 'dc complete ref');
rep("dcHint: blocks.length ? blocks.length + ' thing' + (blocks.length === 1 ? '' : 's') + ' left' : 'Everything is in. Completing adds the follow-ups for the call centre.',", "dcHint: 'Completing adds the follow-ups for the call centre.',", 'dcHint');

/* =============================== LOGIC: follow-ups =============================== */
rep("    var postedTomorrow = !!s.fuPosted;", `    var QOPD = ['Came for appointment', 'OPD booked', 'Did not pick up', 'Will call back'], QCALL = ['Call done, doing well', 'Did not pick up', 'Will call back', 'Readmitted'];
    var QLAB = { 'Came for appointment': 'Came', 'OPD booked': 'OPD booked', 'Did not pick up': 'No answer', 'Will call back': 'Will call back', 'Call done, doing well': 'Doing well', 'Readmitted': 'Readmitted' };
    var applyOut = function (fid, tries0, v) { var m = Object.assign({}, self.state.fuOut), cur2 = m[fid] || {}; m[fid] = Object.assign({}, cur2, { outcome: v, upd: toIso(TODAY), tries: NOANS.indexOf(v) >= 0 ? tries0 + 1 : tries0 }); self.setState({ fuOut: m }); };
    var fuPostFn = function () { self.setState({ fuPosted: '11 Nov, ' + nowTime(), fuMsg: 'Marked as sent. Paste the text in the call-centre WhatsApp group.' }); };
    var postedTomorrow = !!s.fuPosted;`, 'follow helpers');
rep("var ov = s.fuOut[f0.id] || {}, f = Object.assign({}, f0, ov);", "var ov = s.fuOut[f0.id] || {}, f = Object.assign({}, f0, ov), QL = f0.kind.indexOf('OPD') >= 0 ? QOPD : QCALL;", 'QL');
rep(`        setOutcome: function (e) {
          var v = e.target.value, m = Object.assign({}, self.state.fuOut), cur2 = m[f.id] || {};
          m[f.id] = Object.assign({}, cur2, { outcome: v, upd: toIso(TODAY), tries: NOANS.indexOf(v) >= 0 ? tries + 1 : tries });
          self.setState({ fuOut: m });
        } });`, `        setOutcome: function (e) { applyOut(f.id, tries, e.target.value); },
        otherVal: QL.indexOf(o) >= 0 ? '' : o,
        quick: QL.map(function (q) { return { label: QLAB[q] || q, cls: 'lz-chip' + (o === q ? ' on' : ''), pick: function () { applyOut(f.id, tries, o === q ? '' : q); } }; }) });`, 'setOutcome');
rep("['action', 'Needs action', function (f) { return !f.closed && (f.missed || f.stale || f.noAns3 || f.diff <= 1); }],", "['action', 'Needs you now', function (f) { return !f.closed && (f.missed || f.stale || f.noAns3 || f.diff <= 0); }],", 'FSEG action');
rep("    // ===== room cleanliness (xlsx v1) =====", `    var fuNeed = fuAll.filter(FSEG[0][2]).length;
    var fuGo = (order.length && !s.fuPosted) ? { cls: 'lz-go', title: "Send tomorrow's list to the call centre", sub: order.length + (order.length === 1 ? ' patient is' : ' patients are') + ' due tomorrow. Tap once, then paste it in the call-centre WhatsApp group.', has: true, btn: 'Mark as sent', act: fuPostFn }
      : fuNeed ? { cls: 'lz-go warn', title: fuNeed + (fuNeed === 1 ? ' follow-up needs' : ' follow-ups need') + ' an update', sub: 'Open each card below and tap what happened.', has: true, btn: 'Show them', act: function () { self.setState({ fuFilter: 'action' }); scrollToId('fu-list'); } }
      : { cls: 'lz-go ok', title: 'All clear', sub: 'Nothing needs you right now.' + (s.fuPosted ? " Tomorrow's list was sent at " + s.fuPosted + '.' : ''), has: false, btn: '', act: function () {} };
    // ===== room cleanliness (xlsx v1) =====`, 'fuGo');
rep("      fuTiles: [\n", `      fuGoCls: fuGo.cls, fuGoTitle: fuGo.title, fuGoSub: fuGo.sub, fuGoHas: fuGo.has, fuGoBtn: fuGo.btn, fuGoAct: fuGo.act,
      fuTomorrowCount: tomorrow.length + ' appointment' + (tomorrow.length === 1 ? '' : 's') + ' or call' + (tomorrow.length === 1 ? '' : 's') + ' for ' + order.length + (order.length === 1 ? ' patient' : ' patients'),
      fuShowMsg: s.fuShowMsg, fuMsgBtn: s.fuShowMsg ? 'Hide the message' : 'Show the message', fuToggleMsg: function () { self.setState({ fuShowMsg: !self.state.fuShowMsg }); },
      fuShowBlank: s.fuShowBlank, fuBlankCaret: 'lz-caret' + (s.fuShowBlank ? ' up' : ''), fuToggleBlank: function () { self.setState({ fuShowBlank: !self.state.fuShowBlank }); },
      fuBlankSub: fuBlanks.filter(function (b) { return b.over; }).length + ' at 5 or more · tap to see who',
      fuCame: past.length ? 'Came for follow-up so far: ' + Math.round(came / past.length * 100) + '% (' + came + ' of ' + past.length + ')' : '',
      fuTiles: [
`, 'fu props');
rep("fuPost: function () { self.setState({ fuPosted: '11 Nov, ' + nowTime(), fuMsg: 'Marked as sent. The rows due tomorrow now show \"Sent to call centre\".' }); },", "fuPost: fuPostFn,", 'fuPost');
rep("fuSummary: fuAll.filter(FSEG[0][2]).length + ' follow-ups need action, '", "fuSummary: fuAll.filter(FSEG[0][2]).length + ' follow-ups need you now, '", 'fuSummary');

/* =============================== LOGIC: room cleanliness =============================== */
rep("    var NC = {\n", `    var clMaintAny = Object.keys(clCur.maint).some(function (k) { return String(clCur.maint[k] || '').trim(); });
    var clProb = !!s.clProblem || clIssues.length > 0 || clMaintAny;
    var clFloorDone = ROOMS[s.clFloor].filter(function (r) { var st = roomState(s.clFloor, r); return st === 'ok' || st === 'issue'; }).length, clFloorN = ROOMS[s.clFloor].length;
    var clNextRoom = ROOMS[s.clFloor].filter(function (r) { var st = roomState(s.clFloor, r); return st === 'none' || st === 'part'; })[0] || '';
    var NC = {
      clProb: clProb, clNoProb: !clProb, clHasMsg: !!s.clMsg, clCanBack: clIssues.length === 0 && !clMaintAny,
      clPct: Math.round(clFloorDone / clFloorN * 100) + '%', clBarCls: clFloorDone === clFloorN ? 'full' : '',
      clGoCls: 'lz-go' + (clNextRoom ? '' : ' ok'),
      clGoTitle: clNextRoom ? 'Next room to check: ' + clNextRoom : CLFL[s.clFloor] + ' is finished',
      clGoSub: clNextRoom ? CLFL[s.clFloor] + ' · ' + clFloorDone + ' of ' + clFloorN + ' rooms checked today. Tap the room, look around, tap one button.' : 'All ' + clFloorN + ' rooms are checked. Pick another floor above.',
      clGoHas: !!clNextRoom && clNextRoom !== s.clRoom, clGoBtn: 'Open room ' + clNextRoom, clGoAct: function () { self.setState({ clRoom: clNextRoom, clMsg: '', clProblem: false, clSec: -1 }); scrollToId('cl-panel'); },
      clProblemOn: function () { self.setState({ clProblem: true, clSec: -1, clMsg: '' }); },
      clProblemOff: function () { self.setState({ clProblem: false, clSec: -1 }); },
`, 'NC head');
repLine("      clByBtns:", "      clByBtns: ['Patient experience', 'Floor coordinator'].map(function (v) { return { label: v, cls: 'lz-chip sm' + (s.clBy === v ? ' on' : ''), pick: function () { self.setState({ clBy: v }); } }; }),", 'clByBtns');
repLine("      clFloors:", "      clFloors: ['f1', 'f2', 'f3'].map(function (f) { return { label: CLFL[f], n: ROOMS[f].filter(function (r) { var st = roomState(f, r); return st === 'ok' || st === 'issue'; }).length + '/' + ROOMS[f].length, cls: 'lz-chip' + (s.clFloor === f ? ' on' : ''), go: function () { self.setState({ clFloor: f, clRoom: ROOMS[f][0], clMsg: '', clProblem: false, clSec: -1 }); } }; }),", 'clFloors');
repLine("      clRooms:", "      clRooms: ROOMS[s.clFloor].map(function (r) { var st = roomState(s.clFloor, r); return { no: r, sub: { ok: 'All OK', issue: 'Problem', part: 'In progress', none: 'Not checked' }[st], cls: 'cl-room lz-room cl-' + st + (r === s.clRoom ? ' sel' : '') + (r === clNextRoom && r !== s.clRoom ? ' cl-next' : ''), pick: function () { self.setState({ clRoom: r, clMsg: '', clProblem: false, clSec: -1 }); scrollToId('cl-panel'); } }; }),", 'clRooms');
repLine("      clAllOk:", "      clAllOkUnused: 0,", 'clAllOk');
repLine("      clStamp:", "      clStamp: clCur.saved ? 'Saved ' + clCur.saved + ' by ' + clCur.by : clIssues.length ? clIssues.length + ' problem' + (clIssues.length === 1 ? '' : 's') + ' marked so far' : 'Not checked yet today',", 'clStamp');
repLine("      clSecs:", "      clSecs: (function () { var n = 0; return CLS.map(function (g, gi) { var items = g[1].map(function (it) { var i = n++; var bad = clCur.marks[i] === 'issue'; return { label: it[1], area: it[0], rowCls: 'checkrow lz-row' + (bad ? ' bad' : ''), pillCls: 'lz-pill' + (bad ? ' bad' : ''), pillTxt: bad ? 'Problem' : 'OK', flip: function () { var mk = Object.assign({}, clCur.marks); if (bad) delete mk[i]; else mk[i] = 'issue'; clPut({ marks: mk, saved: '' }); } }; }); var nb = items.filter(function (x) { return x.pillTxt === 'Problem'; }).length, isOpen = s.clSec === gi; return { title: g[0], progress: items.length + ' things' + (nb ? ' · ' + nb + ' problem' + (nb === 1 ? '' : 's') : ''), icCls: 'lz-ic' + (nb ? '' : ' ok'), icTxt: nb ? String(nb) : '\\u2713', open: isOpen, caretCls: 'lz-caret' + (isOpen ? ' up' : ''), toggle: function () { self.setState({ clSec: isOpen ? -1 : gi }); }, items: items }; }); })(),", 'clSecs');
repBlock("      clSave: function () {", "\n    };\n\n    // ===== family updates", `      clSave: function () {
        var mk = {}; CL_ITEMS.forEach(function (it, i) { mk[i] = clCur.marks[i] === 'issue' ? 'issue' : 'ok'; });
        var badIdx = Object.keys(mk).filter(function (i) { return mk[i] === 'issue'; });
        var extra = self.state.extraConcerns.slice(), sent = 0, room = CLFL[s.clFloor] + ', Room ' + s.clRoom;
        var bad = badIdx.map(function (i) { return CL_ITEMS[+i][1]; });
        if (bad.length) { sent++; extra.push({ id: 'C-0' + (190 + extra.length), type: 'concern', pid: '', pname: room, title: 'Room ' + s.clRoom + ': ' + bad[0] + (bad.length > 1 ? ' (+' + (bad.length - 1) + ' more)' : ''), raisedBy: 'Room check, ' + s.clBy, via: 'Room cleanliness', owner: 'Housekeeping supervisor', ownerRole: 'Housekeeping', category: 'Room and housekeeping', sla: '4 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: 'Not OK: ' + bad.join('; ') + (clCur.remarks ? '. Remarks: ' + clCur.remarks : '') }); }
        MAINT.forEach(function (m) { var v = String(clCur.maint[m] || '').trim(); if (v) { sent++; extra.push({ id: 'C-0' + (190 + extra.length), type: 'concern', pid: '', pname: room, title: 'Room ' + s.clRoom + ' ' + m.toLowerCase() + ': ' + v, raisedBy: 'Room check, ' + s.clBy, via: 'Room cleanliness', owner: 'Maintenance', ownerRole: m, category: 'Room and housekeeping', sla: '6 h left', slaTone: 'grey', logged: 'just now', status: 'Open', desc: v }); } });
        var a = Object.assign({}, self.state.cl); a[clKey] = Object.assign({}, clCur, { marks: mk, saved: '11 Nov, ' + nowTime(), by: s.clBy });
        var nxt = ROOMS[s.clFloor].filter(function (r) { var st = r === s.clRoom ? 'done' : roomState(s.clFloor, r); return st === 'none' || st === 'part'; })[0];
        self.setState({ cl: a, extraConcerns: extra, clRoom: nxt || s.clRoom, clProblem: false, clSec: -1, clMsg: 'Room ' + s.clRoom + ' saved' + (sent ? ', ' + sent + ' problem' + (sent === 1 ? '' : 's') + ' sent to housekeeping or maintenance.' : ', all OK.') + (nxt ? ' Now Room ' + nxt + '.' : ' ' + CLFL[s.clFloor] + ' is finished.') });
        scrollToId('cl-panel');
      }`, 'clSave');

/* =============================== LOGIC: family updates =============================== */
rep("var famPut = function (patch) { var a = Object.assign({}, self.state.fam); a[fp.id] = Object.assign({}, fcur, patch); self.setState({ fam: a, famMsg: '' }); };", "var famPut = function (patch, extra) { var a = Object.assign({}, self.state.fam); a[fp.id] = Object.assign({}, fcur, patch); self.setState(Object.assign({ fam: a, famMsg: '' }, extra || {})); };", 'famPut');
rep("    var NF = {\n", `    var famUnsent = P.filter(function (q) { return !famGet(q.id).sent; });
    var famNextP = famUnsent.filter(function (q) { return q.id !== fp.id; })[0] || famUnsent[0];
    var famOverdue = famStepsAll.filter(function (x) { return !x.done && x.diff < 0; }).length, famNeed = famStepsAll.filter(function (x) { return !x.done && x.diff <= 1; }).length;
    var FUSUAL = { overall: 'Stable', sleep: 'Adequate', appetite: 'Good', mood: 'Calm', med: 'Taken on time', sessions: 'Attended', selfcare: 'Independent', peer: 'Engaging' };
    var NF = {
      famGoCls: 'lz-go' + (famUnsent.length === 0 ? ' ok' : late ? ' warn' : ''),
      famGoTitle: famUnsent.length === 0 ? 'All ' + P.length + ' family updates are sent' : famUnsent.length + (famUnsent.length === 1 ? ' family update' : ' family updates') + ' still to send by 8 pm',
      famGoSub: famUnsent.length === 0 ? 'Nothing more tonight.' + (famOverdue ? ' ' + famOverdue + ' family meeting or call is overdue, see the bottom of the page.' : '') : (late ? 'It is past 8 pm. ' : '') + 'Next: ' + famNextP.name + '. Tap the button, fill in the usual answers, change what is different, write one real line, send.',
      famGoHas: famUnsent.length > 0, famGoBtn: 'Write for ' + (famNextP ? famNextP.name : ''), famGoAct: function () { self.setState({ famPid: famNextP.id, famMsg: '' }); scrollToId('fam-form'); },
      famUsual: function () { var pt = {}; FF.forEach(function (f) { if (!fcur[f[0]]) pt[f[0]] = FUSUAL[f[0]]; }); famPut(pt); },
      famQuiet: famRow(fp).quiet >= 2, famQuietText: 'The family has not replied for ' + famRow(fp).quiet + ' days. Call them within 48 hours.',
      famSendLabel: fcur.sent ? 'Send again' : famNextP && famNextP.id !== fp.id ? 'Send, then next patient' : 'Send to family',
      famShowPrev: s.famShowPrev, famPrevBtn: s.famShowPrev ? 'Hide the message' : 'Show the message', famTogglePrev: function () { self.setState({ famShowPrev: !self.state.famShowPrev }); },
      famShowSteps: s.famShowSteps, famStepsCaret: 'lz-caret' + (s.famShowSteps ? ' up' : ''), famToggleSteps: function () { self.setState({ famShowSteps: !self.state.famShowSteps }); },
      famStepsSub: famNeed + (famNeed === 1 ? ' needs you' : ' need you') + (famOverdue ? ', ' + famOverdue + ' overdue' : '') + ' · tap to open',
`, 'NF head');
repBlock('      famTiles: [', '      famList: famRows.map(', '', 'famTiles');
repBlock('      famList: famRows.map(', '      famSel:', "      famList: famRows.map(function (x) { var p = x.p, r = x.r; return { name: p.name, status: r.sent ? 'sent ' + r.f.sent : late ? 'late' : 'not sent', cls: 'lz-chip' + (r.sent ? ' good' : '') + (p.id === fp.id ? ' on' : ''), dot: 'lz-dot ' + (r.sent ? 'g' : late ? 'r' : ''), pick: function () { self.setState({ famPid: p.id, famMsg: '' }); } }; })," + '\n', 'famList');
rep("famFields: FF.map(function (f) { return { label: f[1], opts: f[2].map(function (o) { return { label: o, cls: fcur[f[0]] === o ? 'on' : '',", "famFields: FF.map(function (f) { return { label: f[1], opts: f[2].map(function (o) { return { label: o, cls: 'lz-chip sm' + (fcur[f[0]] === o ? ' on' : ''),", 'famFields');
rep("        famPut({ sent: nowTime(), by: 'Prabh (cover)' });", "        var nx = famUnsent.filter(function (q) { return q.id !== fp.id; })[0];\n        famPut({ sent: nowTime(), by: 'Prabh (cover)' }, { famPid: nx ? nx.id : fp.id, famMsg: 'Update for ' + fp.name + ' marked as sent.' + (nx ? ' Next: ' + nx.name + '.' : ' That was the last one.') });", 'famSend');
repLine("      fuSegs:", "      fuSegs: FSEG.map(function (g) { return { label: g[1], n: fuAll.filter(g[2]).length, cls: 'lz-chip' + (s.fuFilter === g[0] ? ' on' : ''), go: function () { self.setState({ fuFilter: g[0] }); } }; }),", 'fuSegs');
repLine("      famSegs:", "      famSegs: FSG.map(function (g) { return { label: g[1], n: famStepsAll.filter(g[2]).length, cls: 'lz-chip sm' + (s.famFilter === g[0] ? ' on' : ''), go: function () { self.setState({ famFilter: g[0] }); } }; }),", 'famSegs');
rep("famMsg: s.famMsg,\n", "famMsg: s.famMsg || 'Tip: fill in the usual answers, change what is different, write one real line, then send.',\n", 'famMsg');
/* the old multi-line famTiles array leftovers are removed below */

/* ---------- write back ---------- */
const out = src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + BS + '/') + '\n  ' + src.slice(i1);
fs.writeFileSync(file, out);
console.log('written', out.length);
