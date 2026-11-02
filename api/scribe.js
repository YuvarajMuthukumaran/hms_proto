// AI scribe: recorded conversation -> transcript (Groq Whisper) -> draft for the clinician (Groq gpt-oss-120b).
// Two ways to call it, both with X-Bridge-Token:
//   1. Round note: POST raw audio (audio/webm, audio/mp4, audio/wav). Query: patient, dx, meds ("|" separated).
//   2. Any form:   POST multipart/form-data with audio (file), schema (JSON: {form, context, fields:[{key,label,type,options}]}).
//      type is "one", "many" or "text"; answers are checked against the options before they are returned.
// Nothing is stored here: the draft goes back to the clinician, who reviews it before anything enters the record.
'use strict';
const { env } = require('../lib/wa');
const { SYSTEM, userMsg, FORM_SYSTEM, formMsg } = require('../lib/scribe-prompt');

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's request body limit is 4.5 MB; about 20 minutes at the portal's 24 kbps
const GROQ = 'https://api.groq.com/openai/v1';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > MAX_BYTES) { reject(Object.assign(new Error('Recording is too long. Keep each recording under about 15 minutes.'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function groq(path, init) {
  const r = await fetch(GROQ + path, { ...init, headers: { Authorization: 'Bearer ' + env('GROQ_API_KEY'), ...(init.headers || {}) }, signal: AbortSignal.timeout(45000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('AI service error: ' + ((j.error && j.error.message) || r.status)), { status: r.status === 429 ? 429 : 502 });
  return j;
}

async function transcribe(blob, ext, hint) {
  const fd = new FormData();
  fd.append('file', blob, 'recording.' + ext);
  fd.append('model', 'whisper-large-v3');
  fd.append('response_format', 'json');
  fd.append('temperature', '0');
  fd.append('prompt', 'Psychiatric hospital, Tulasi Healthcare. Doctors, nurses (Sister, Brother), psychologist, patient, family. Hindi and English mixed. ' + (hint || ''));
  const tr = await groq('/audio/transcriptions', { method: 'POST', body: fd });
  return String(tr.text || '').trim();
}

async function writeJson(system, user) {
  const ch = await groq('/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })
  });
  try { return JSON.parse(ch.choices[0].message.content); } catch (e) { throw Object.assign(new Error('The AI did not return a usable draft. Try again or type it.'), { status: 502 }); }
}

const arr = v => Array.isArray(v) ? v : [];
const extOf = type => type.includes('mp4') ? 'mp4' : type.includes('wav') ? 'wav' : type.includes('ogg') ? 'ogg' : 'webm';

// keep only answers that fit the field: listed options for one/many, a string for text
function cleanValues(fields, values) {
  const out = {};
  for (const f of fields) {
    const v = values && values[f.key];
    if (v == null || v === '') continue;
    if (f.type === 'one') { const o = (f.options || []).find(x => x === v || String(x).toLowerCase() === String(v).toLowerCase()); if (o) out[f.key] = o; }
    else if (f.type === 'many') { const L = arr(v).map(x => (f.options || []).find(o => String(o).toLowerCase() === String(x).toLowerCase())).filter(Boolean); if (L.length) out[f.key] = [...new Set(L)]; }
    else if (typeof v === 'string' && v.trim()) out[f.key] = v.trim();
  }
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const send = (s, j) => res.status(s).json(j);
  if (req.method !== 'POST') return send(405, { ok: false, error: 'Use POST' });
  const tok = env('BRIDGE_TOKEN');
  if (!tok || req.headers['x-bridge-token'] !== tok) return send(401, { ok: false, error: 'Wrong or missing bridge token' });
  if (!env('GROQ_API_KEY')) return send(500, { ok: false, error: 'Set GROQ_API_KEY in Vercel first' });
  try {
    const raw = await readBody(req);
    const ctype = String(req.headers['content-type'] || 'audio/webm');

    if (ctype.startsWith('multipart/form-data')) {
      const fd = await new Response(raw, { headers: { 'content-type': ctype } }).formData();
      const audio = fd.get('audio');
      let schema; try { schema = JSON.parse(fd.get('schema') || '{}'); } catch (e) { return send(400, { ok: false, error: 'Bad form schema' }); }
      const fields = arr(schema.fields).filter(f => f && f.key && /^(one|many|text)$/.test(f.type));
      if (!audio || audio.size < 2000) return send(400, { ok: false, error: 'The recording is empty. Check the microphone and try again.' });
      if (!fields.length) return send(400, { ok: false, error: 'No form fields were sent' });
      const transcript = await transcribe(audio, extOf(audio.type || 'audio/webm'), schema.hint);
      if (!transcript) return send(422, { ok: false, error: 'No speech was heard in the recording.' });
      const d = await writeJson(FORM_SYSTEM, formMsg({ form: schema.form, context: schema.context, fields, transcript }));
      const values = cleanValues(fields, d.values);
      console.log(JSON.stringify({ kind: 'scribe-form', form: schema.form || '', bytes: audio.size, filled: Object.keys(values).length, of: fields.length }));
      return send(200, { ok: true, mode: 'form', transcript, values, unclear: arr(d.unclear).map(String) });
    }

    // round note (raw audio body)
    if (raw.length < 2000) return send(400, { ok: false, error: 'The recording is empty. Check the microphone and try again.' });
    const type = ctype.split(';')[0];
    const q = new URL(req.url, 'http://x').searchParams;
    const meds = (q.get('meds') || '').split('|').map(s => s.trim()).filter(Boolean);
    const transcript = await transcribe(new Blob([raw], { type }), extOf(type), 'Ward round. Medicines: ' + (meds.join(', ') || 'olanzapine, lithium, lorazepam'));
    if (!transcript) return send(422, { ok: false, error: 'No speech was heard in the recording.' });
    const d = await writeJson(SYSTEM, userMsg({ patient: q.get('patient'), dx: q.get('dx'), meds, transcript }));
    send(200, {
      ok: true, mode: 'round', transcript,
      note: String(d.note || ''), risk: String(d.risk || 'Not discussed'),
      medChanges: arr(d.medChanges).filter(m => m && /^(Start|Change|Stop)$/.test(m.act) && m.text).map(m => ({ act: m.act, text: String(m.text) })),
      todos: arr(d.todos).filter(t => t && t.text).map(t => ({ text: String(t.text), owner: String(t.owner || 'Treating team') })),
      unclear: arr(d.unclear).map(String)
    });
    console.log(JSON.stringify({ kind: 'scribe', patient: q.get('patient') || '', bytes: raw.length, words: transcript.split(/\s+/).length }));
  } catch (e) { send(e.status || 500, { ok: false, error: e.message }); }
};
