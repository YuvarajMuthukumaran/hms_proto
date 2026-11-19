/* 19 Nov 2026 (meeting): Patient Experience > Patients record.
   - Family calls and updates: every call by the psychologist, psychiatrist and Patient Experience lead in one log (psychologist/psychiatrist calls are read
     through the px_family_calls() function, supabase/migrations/20261119000000_px_family_calls.sql); "8 pm WhatsApp updates" is now "Family Updates via WhatsApp",
     scrolls (up to 30 rows) and filters by date; no made-up demo calls in real-data mode.
   - Discharge and feedback: when nothing is planned there is a "See a sample" button that shows the whole discharge view with example answers.
   - Preferences: "Take preferences" opens the same box-format form as the psychiatrist's Patient Experience tab; it is saved (px_prefs_v2) and shown as cards. */
const rep = require('./rep.cjs');
const fs = require('fs');
const NEW = fs.readFileSync(__dirname + '/px-patients-19nov.part.js', 'utf8');
rep('public/px/patients.html', [
  ["function family(p){\n  const extra=", "function family0(p){\n  const extra="],
  ["function prefs(p){\n  const H=", "function prefs0(p){\n  const H="],
  ["function dis(p){\n  if(p.dis==='Not set') return", "function dis0(p){\n  if(p.dis==='Not set') return"],
  ["/* Rounds tab: what the Rounds page logged for this patient", "@@NEW@@\n/* Rounds tab: what the Rounds page logged for this patient"],
]);
let t = fs.readFileSync('public/px/patients.html', 'utf8');
const crlf = t.includes('\r\n');
t = t.split('@@NEW@@').join(crlf ? NEW.replace(/\r?\n/g, '\r\n') : NEW);
fs.writeFileSync('public/px/patients.html', t);
console.log('new inserted');
