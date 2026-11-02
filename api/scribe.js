// AI scribe: ward-round audio -> transcript (Groq Whisper) -> draft round note (Groq gpt-oss-120b).
// POST raw audio (audio/webm, audio/mp4, audio/wav) with X-Bridge-Token.
// Query: patient, dx, meds (each optional; meds separated by "|") give the note writer context.
// Nothing is stored here: the draft goes back to the doctor, who reviews it before anything enters the record.
'use strict';
const { env } = require('../lib/wa');
const { SYSTEM, userMsg } = require('../lib/scribe-prompt');

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's request body limit is 4.5 MB; about 20 minutes at the portal's 24 kbps
const GROQ = 'https://api.groq.com/openai/v1';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > MAX_BYTES) { reject(Object.assign(new Error('Recording is too long. Keep each round under about 15 minutes.'), { status: 413 })); req.destroy(); } else chunks.push(c); });
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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const send = (s, j) => res.status(s).json(j);
  if (req.method !== 'POST') return send(405, { ok: false, error: 'Use POST' });
  const tok = env('BRIDGE_TOKEN');
  if (!tok || req.headers['x-bridge-token'] !== tok) return send(401, { ok: false, error: 'Wrong or missing bridge token' });
  if (!env('GROQ_API_KEY')) return send(500, { ok: false, error: 'Set GROQ_API_KEY in Vercel first' });
  try {
    const audio = await readBody(req);
    if (audio.length < 2000) return send(400, { ok: false, error: 'The recording is empty. Check the microphone and try again.' });
    const type = String(req.headers['content-type'] || 'audio/webm').split(';')[0];
    const ext = type.includes('mp4') ? 'mp4' : type.includes('wav') ? 'wav' : type.includes('ogg') ? 'ogg' : 'webm';
    const q = new URL(req.url, 'http://x').searchParams;
    const meds = (q.get('meds') || '').split('|').map(s => s.trim()).filter(Boolean);

    const fd = new FormData();
    fd.append('file', new Blob([audio], { type }), 'round.' + ext);
    fd.append('model', 'whisper-large-v3');
    fd.append('response_format', 'json');
    fd.append('temperature', '0');
    fd.append('prompt', 'Psychiatry ward round at Tulasi Healthcare. Doctors, nurses (Sister, Brother), psychologist, patient. Hindi and English mixed. Medicines: ' + (meds.join(', ') || 'olanzapine, lithium, lorazepam'));
    const tr = await groq('/audio/transcriptions', { method: 'POST', body: fd });
    const transcript = String(tr.text || '').trim();
    if (!transcript) return send(422, { ok: false, error: 'No speech was heard in the recording.' });

    const ch = await groq('/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.2, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userMsg({ patient: q.get('patient'), dx: q.get('dx'), meds, transcript }) }] })
    });
    let d; try { d = JSON.parse(ch.choices[0].message.content); } catch (e) { return send(502, { ok: false, error: 'The AI did not return a usable note. Try again or type the note.', transcript }); }
    const arr = v => Array.isArray(v) ? v : [];
    send(200, {
      ok: true, transcript,
      note: String(d.note || ''), risk: String(d.risk || 'Not discussed'),
      medChanges: arr(d.medChanges).filter(m => m && /^(Start|Change|Stop)$/.test(m.act) && m.text).map(m => ({ act: m.act, text: String(m.text) })),
      todos: arr(d.todos).filter(t => t && t.text).map(t => ({ text: String(t.text), owner: String(t.owner || 'Treating team') })),
      unclear: arr(d.unclear).map(String)
    });
    console.log(JSON.stringify({ kind: 'scribe', patient: q.get('patient') || '', bytes: audio.length, words: transcript.split(/\s+/).length }));
  } catch (e) { send(e.status || 500, { ok: false, error: e.message }); }
};
