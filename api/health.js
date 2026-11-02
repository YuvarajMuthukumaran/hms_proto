const { handler, owa, env } = require('../lib/wa');

module.exports = handler('GET', async () => {
  let session = 'unknown';
  try { const s = await owa('GET', ''); session = s.status || (s.data && s.data.status) || 'unknown'; } catch (e) { session = 'error: ' + e.message; }
  return { ok: true, session, doctorsGroup: env('DOCTORS_GROUP_NAME') || 'Tulasi Doctors' };
});
