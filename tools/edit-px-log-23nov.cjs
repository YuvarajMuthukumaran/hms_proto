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
/* 23 Nov, later (Nikita, "this is auto selected"): the concern form starts empty: no patient (unless opened from a patient),
   no "What is it about?", no severity. Each has a "Choose ..." first line, and Save asks for all three. */
require('./rep.cjs')('public/px-lead-prototype.html',[
 ["{ kind: '', pid: (window.__pxCtxPid || self.state.pid) }","{ kind: '', pid: (window.__pxCtxPid || ''), category: '', sev: '' }"],
 [String.raw`sc-camel-on-change=\"{{setPid}}\"><sc-for list=\"{{patientOpts}}\"`, String.raw`sc-camel-on-change=\"{{setPid}}\"><option value=\"\">Choose the patient<\/option><sc-for list=\"{{patientOpts}}\"`],
 [String.raw`sc-camel-on-change=\"{{setCategory}}\"><sc-for list=\"{{categoryOpts}}\"`, String.raw`sc-camel-on-change=\"{{setCategory}}\"><option value=\"\">Choose what it is about<\/option><sc-for list=\"{{categoryOpts}}\"`],
 [String.raw`sc-camel-on-change=\"{{setSev}}\"><option>Low<\/option>`, String.raw`sc-camel-on-change=\"{{setSev}}\"><option value=\"\">Choose how serious<\/option><option>Low<\/option>`],
 [String.raw`saveConcern = function () {\n      if (self.__rec) { try { self.__rec.stop(); } catch (e) {} }\n      var f = self.state.form,`,
  String.raw`saveConcern = function () {\n      if (self.__rec) { try { self.__rec.stop(); } catch (e) {} }\n      var f0 = self.state.form; if (!f0.pid || (f0.kind !== 'random' && (!f0.category || !f0.sev))) { var miss = [!f0.pid && 'the patient', !f0.category && 'what it is about', !f0.sev && 'how serious it is'].filter(Boolean); window.alert('Please choose ' + miss.join(', ') + ' first.'); return; }\n      var f = self.state.form,`],
]);
