// Tulasi WhatsApp bridge for Vercel: same behaviour as tulasi-wa-bridge/server.js, as serverless functions.
// Everything private comes from Vercel environment variables, never from the public site files:
//   BRIDGE_TOKEN, OPENWA_URL (the Cloudflare Tunnel address), OPENWA_API_KEY, OPENWA_SESSION_ID,
//   DOCTORS_GROUP_NAME, TEAM_MEMBERS, DEFAULT_COUNTRY_CODE, PATIENTS_JSON ({"<uhid>":{"name":"","members":[...]}})
// Vercel keeps no files between requests, so the UHID group is looked up by name on every send.
'use strict';

const env = k => (process.env[k] || '').trim();
const CC = () => (env('DEFAULT_COUNTRY_CODE') || '91').replace(/\D/g, '');

function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }

function toJid(n) {
  if (/@(c|g)\.us$/.test(n)) return n;
  let d = String(n).replace(/\D/g, '');
  if (d.length === 10) d = CC() + d;
  if (d.length < 11) throw httpErr(400, `Phone number looks wrong: ${n}`);
  return d + '@c.us';
}

async function owa(method, p, body) {
  const base = env('OPENWA_URL').replace(/\/+$/, ''), key = env('OPENWA_API_KEY'), sid = env('OPENWA_SESSION_ID');
  if (!base || !key || !sid) throw httpErr(500, 'Bridge not configured: set OPENWA_URL, OPENWA_API_KEY and OPENWA_SESSION_ID in Vercel');
  let r;
  try {
    r = await fetch(`${base}/api/sessions/${encodeURIComponent(sid)}${p}`, { method, headers: { 'X-API-Key': key, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(25000) });
  } catch (e) { throw httpErr(502, 'OpenWA not reachable. Is the hospital PC on, with Docker and the Cloudflare Tunnel running?'); }
  const txt = await r.text();
  let j; try { j = txt ? JSON.parse(txt) : {}; } catch (e) { j = { raw: txt.slice(0, 200) }; }
  if (!r.ok) {
    const msg = (j && (Array.isArray(j.message) ? j.message.join('; ') : j.message)) || r.statusText;
    const hint = r.status === 501 ? ' (group creation needs ENGINE_TYPE=baileys in OpenWA)' : r.status === 409 ? ' (WhatsApp session not ready: re-scan the QR)' : r.status === 530 || r.status === 1033 ? ' (Cloudflare Tunnel is down)' : '';
    throw httpErr(r.status === 404 ? 404 : 502, `OpenWA ${method} ${p} failed: ${r.status} ${msg}${hint}`);
  }
  return j;
}

async function findGroupByName(name) {
  const list = await owa('GET', '/groups');
  const arr = Array.isArray(list) ? list : (list.data || list.groups || []);
  return arr.find(g => (g.name || g.subject) === name) || null;
}

function patients() { try { return JSON.parse(env('PATIENTS_JSON') || '{}'); } catch (e) { throw httpErr(500, 'PATIENTS_JSON in Vercel is not valid JSON'); } }

async function patientGroup(uhid) {
  const found = await findGroupByName(uhid);
  if (found) return { id: found.id, created: false };
  const pt = patients()[uhid];
  const team = env('TEAM_MEMBERS').split(',').map(s => s.trim()).filter(Boolean);
  const members = [...new Set([...((pt && pt.members) || []), ...team].map(toJid))];
  if (!members.length) throw httpErr(400, `No phone numbers for UHID ${uhid}. Add them to PATIENTS_JSON in Vercel.`);
  const g = await owa('POST', '/groups', { name: uhid, participants: members });
  if (!g || !g.id) throw httpErr(502, 'OpenWA created the group but returned no id');
  const desc = `Tulasi Healthcare · ${pt && pt.name ? pt.name + ' · ' : ''}UHID ${uhid} · treating team and family. Confidential: please do not forward.`;
  await owa('PUT', `/groups/${encodeURIComponent(g.id)}/description`, { description: desc }).catch(() => {});
  return { id: g.id, created: true };
}

async function sendText(chatId, text) {
  const r = await owa('POST', '/messages/send-text', { chatId, text });
  return (r && (r.messageId || r.id || (r.data && r.data.id))) || null;
}

function checkText(t) {
  t = String(t || '').trim();
  if (!t) throw httpErr(400, 'Message text is empty');
  if (t.length > 4096) throw httpErr(400, 'Message is longer than WhatsApp allows (4096 characters)');
  return t;
}

// A request made by the portal page on this same site (its Origin or Referer host is this site's host).
// Staff no longer enter a token (owner's decision, 3 Nov 2026, while the link is not shared).
// Other callers still need X-Bridge-Token.
function fromOwnSite(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  const from = req.headers.origin || req.headers.referer || '';
  try { return !!host && !!from && new URL(from).host.toLowerCase() === host; } catch (e) { return false; }
}
function authorized(req) {
  const tok = env('BRIDGE_TOKEN');
  return fromOwnSite(req) || (!!tok && req.headers['x-bridge-token'] === tok);
}

// Wraps a handler: method check, own-site or token check, JSON errors. The portal is served from the same site, so no CORS.
function handler(method, fn) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const send = (s, j) => res.status(s).json(j);
    if (req.method !== method) return send(405, { ok: false, error: 'Use ' + method });
    if (!authorized(req)) return send(401, { ok: false, error: 'Wrong or missing bridge token' });
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      send(200, await fn(body));
    } catch (e) { send(e.status || (e instanceof SyntaxError ? 400 : 500), { ok: false, error: e.message }); }
  };
}

module.exports = { handler, authorized, owa, findGroupByName, patientGroup, sendText, checkText, httpErr, env };
