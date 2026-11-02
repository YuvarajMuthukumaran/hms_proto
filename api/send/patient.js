const { handler, patientGroup, sendText, checkText, httpErr } = require('../../lib/wa');

// {uhid, text, by} -> WhatsApp group named <uhid> (created with the family and team numbers if missing)
module.exports = handler('POST', async b => {
  const uhid = String(b.uhid || '').trim();
  if (!/^[\w-]{4,40}$/.test(uhid)) throw httpErr(400, 'A valid UHID is needed');
  const text = checkText(b.text);
  const g = await patientGroup(uhid);
  const messageId = await sendText(g.id, text);
  console.log(JSON.stringify({ kind: 'patient', uhid, by: b.by || '', groupId: g.id, created: g.created, chars: text.length }));
  return { ok: true, groupId: g.id, groupName: uhid, created: g.created, messageId };
});
