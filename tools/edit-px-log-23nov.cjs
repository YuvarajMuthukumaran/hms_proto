/* 23 Nov 2026 (Nikita): "Log a call or concern" is a two-part pop-up. First only "What are you logging?"
   (Random family call / Someone raised a concern); its questions open after a click. Bigger text in the pop-up. */
require('./rep.cjs')('public/px-lead-prototype.html',[
 ["var lkind = s.form.kind || 'concern';","var lkind = s.form.kind || '';"],
 ["NZ.isConcern = !NZ.isRandom;","NZ.isConcern = lkind === 'concern';"],
 ["NZ.kindHint = NZ.isRandom ? ","NZ.kindHint = !lkind ? 'Pick one. Its questions open next.' : NZ.isRandom ? "],
 ["cls: 'lz-chip' + (NZ.isRandom ? '' : ' on')","cls: 'lz-chip' + (NZ.isConcern ? ' on' : '')"],
 ["openLog: function () { self.setState({ logOpen: true, form: Object.assign({}, self.state.form, { pid: (window.__pxCtxPid || self.state.pid) }) }); },",
  "openLog: function () { self.setState({ logOpen: true, form: Object.assign({}, self.state.form, { kind: '', pid: (window.__pxCtxPid || self.state.pid) }) }); },"],
 [".lz-chip:hover{border-color:#1e6cdb}",
  ".lz-chip:hover{border-color:#1e6cdb}.log-modal .muted.small{font-size:14.5px!important;line-height:1.45}.log-modal .name{font-size:16.5px!important}.log-modal .field>label{font-size:15.5px!important}.log-modal .btn{font-size:15px!important}.log-modal .btn.sm{min-height:40px;padding:0 16px}.log-modal h3{font-size:21px!important}.log-modal .input,.log-modal select,.log-modal textarea{font-size:15.5px!important}"],
]);
/* 23 Nov, later (Nikita): Close showed twice in the random-call view; the top-right Close stays */
require('./rep.cjs')('public/px-lead-prototype.html',[
 [String.raw`<div style=\"display:flex;gap:8px\"><button class=\"btn\" type=\"button\" sc-camel-on-click=\"{{closeLog}}\">Close<\/button><\/div>\n      <\/sc-if>`, String.raw`<\/sc-if>`],
]);
