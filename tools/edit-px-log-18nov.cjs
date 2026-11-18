/* 18 Nov 2026: "+ Log a call or concern" opens with the patient whose record is open on Patients (it used to show the first patient in the list),
   and the notification panel closes when you click inside the page below it. */
const fs = require('fs');
const file = 'public/px-lead-prototype.html';
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
function R(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 80)); t = t.split(a).join(b); }
R("openLog: function () { self.setState({ logOpen: true, form: Object.assign({}, self.state.form, { pid: self.state.pid }) }); },",
  "openLog: function () { self.setState({ logOpen: true, form: Object.assign({}, self.state.form, { pid: (window.__pxCtxPid || self.state.pid) }) }); },");
R("var d = ev && ev.data; if (!d || !d.pxNav) return; var map = {",
  "var d = ev && ev.data; if (d && d.pxCtx !== undefined) { window.__pxCtxPid = d.pxCtx || ''; return; } if (d && d.pxClosePop) { if (self.state.notifOpen || self.state.searchOpen) self.setState({ notifOpen: false, searchOpen: false }); return; } if (!d || !d.pxNav) return; var map = {");
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
