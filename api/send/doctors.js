const { handler, findGroupByName, sendText, checkText, httpErr, env } = require('../../lib/wa');

// {text, by} -> the existing doctors' WhatsApp group (DOCTORS_GROUP_NAME)
module.exports = handler('POST', async b => {
  const text = checkText(b.text);
  const name = env('DOCTORS_GROUP_NAME') || 'Tulasi Doctors';
  const g = await findGroupByName(name);
  if (!g) throw httpErr(404, `No WhatsApp group named "${name}" on the linked number. Add the number to the doctors' group, or set DOCTORS_GROUP_NAME in Vercel.`);
  const messageId = await sendText(g.id, text);
  console.log(JSON.stringify({ kind: 'doctors', by: b.by || '', groupId: g.id, chars: text.length }));
  return { ok: true, groupId: g.id, groupName: name, messageId };
}, { send: true });
