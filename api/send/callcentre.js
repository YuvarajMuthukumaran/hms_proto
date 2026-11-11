const { handler, findGroupByName, sendText, checkText, httpErr, env } = require('../../lib/wa');

// {text, by} -> the call centre's WhatsApp group (CALLCENTRE_GROUP_NAME), for tomorrow's follow-up list
module.exports = handler('POST', async b => {
  const text = checkText(b.text);
  const name = env('CALLCENTRE_GROUP_NAME') || 'Tulasi Call Centre';
  const g = await findGroupByName(name);
  if (!g) throw httpErr(404, `No WhatsApp group named "${name}" on the linked number. Add the number to the call-centre group, or set CALLCENTRE_GROUP_NAME in Vercel.`);
  const messageId = await sendText(g.id, text);
  console.log(JSON.stringify({ kind: 'callcentre', by: b.by || '', groupId: g.id, chars: text.length }));
  return { ok: true, groupId: g.id, groupName: name, messageId };
});
