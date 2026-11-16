/* One-off (16 Nov 2026): Patient Experience on real patients, step 2: in real mode the PX bundle starts with NO demo grievances,
   follow-ups, family updates or compliments, and the selected patient is the first real one (or none). Demo mode is unchanged. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'public', 'px-lead-prototype.html');
const src = fs.readFileSync(file, 'utf8');
const tag = '<script type="__bundler/template">';
const i0 = src.indexOf(tag, 100000) + tag.length, i1 = src.indexOf('</script>', i0);
let t = JSON.parse(src.slice(i0, i1).trim());
if (t.includes('window.PX_REAL ? []')) { console.log('already edited'); process.exit(0); }
function once(a, b) { const n = t.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 70)); t = t.split(a).join(b); }
/* seeds: only the one that holds the demo grievances (it starts with G-0146) */
const iC = t.indexOf("var C = [\n      { id: 'G-0146'");
if (iC < 0) throw new Error('C seed not found');
t = t.slice(0, iC) + 'var C = window.PX_REAL ? [] : [' + t.slice(iC + 'var C = ['.length);
once('var F = [', 'var F = window.PX_REAL ? [] : [');
once('var FU = [', 'var FU = window.PX_REAL ? [] : [');
once('var m4praise = [', 'var m4praise = window.PX_REAL ? [] : [');
once('var FSEED = {', 'var FSEED = window.PX_REAL ? {} : {');
once('var FAMDATA = [', 'var FAMDATA = window.PX_REAL ? [] : [');
/* initial state */
once("pid: 'p2', recTab:", "pid: (window.PX_REAL ? ((((window.HMS_PATIENTS || {}).patients || [])[0]) || {}).id || '' : 'p2'), recTab:");
once("filter: 'open', cid: 'G-0141',", "filter: 'open', cid: (window.PX_REAL ? '' : 'G-0141'),");
/* the record screen must not fail when no patient matches */
once('var sp = pById[s.pid];', "var sp = pById[s.pid] || P[0] || { id: '', name: 'No patient selected', ini: '?', uhid: '', room: '', floor: 'f1', day: 0, admitted: '', admType: '', doctor: '', docIni: '', psych: '', psyIni: '', guardian: '', gName: '', gRel: '', nr: '', phone: '', discharge: '', vip: false, isNew: false, lastContact: '', st: [], random: '0 of 2', ck: [], log: [], prefs: [], visits: [], belongings: [] };");
fs.writeFileSync(file, src.slice(0, i0) + '\n' + JSON.stringify(t).split('</').join('<' + String.fromCharCode(92) + '/') + '\n' + src.slice(i1));
console.log('ok');
