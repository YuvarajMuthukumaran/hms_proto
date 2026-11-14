# Buttons that can send WhatsApp, SMS or email (audit of 14 Nov 2026)

Rule in the prototype: **nothing is sent**. Every WhatsApp button goes through one function, `waPost` (`public/legacy/js/07-wa-port-js.js`).
It makes no network call unless `window.TULASI_LIVE_SEND === true`, which is not set anywhere. It shows the toast
"Demo mode: would send to the WhatsApp group. Nothing was sent."
The server has a second guard: `api/send/*` answer `simulated: true` unless `LIVE_SENDING` is the string `true` in Vercel (`lib/wa.js`).
Check in Vercel (Settings, Environment Variables) that `LIVE_SENDING` is not set. No secret value is needed to check this.

## WhatsApp (all demo, nothing sent)

| Where | Button | Goes to | What it does now |
|---|---|---|---|
| RMO, Handover / shift report | Send to doctors group | `waPost('/send/doctors')` | toast only |
| Psychiatrist, psychologist, floor leads: daily update to family | Send, Send all ready, Send to UHID group, Send on WhatsApp (one-click) | `waPost('/send/patient')` | toast only |
| Psychologist: family update, therapy update | Send on WhatsApp | same function | toast only |
| Patient Experience: Follow-ups | Send to call centre | no network call (removed 13 Nov); marks the list as sent | nothing leaves the browser |

`Copy for WhatsApp` buttons only copy text to the clipboard.

## Email

| Where | Button | What it does |
|---|---|---|
| Patient Experience: Grievances | Escalate to GM Ops (email S Chandra) | opens a `mailto:gmoperations@tulasihealthcare.com` draft. A person must press Send. |
| Patient Experience: Follow-ups | Raise to Chandraji | opens a `mailto:` draft to the same address. A person must press Send. |

## SMS

None.

## Calls that are not messages

`/api/scribe` (Groq speech to text and drafts). It sends the recording or pasted text to the AI service. It does not message anyone.
`/api/config` reads the public Supabase settings. `/api/health` checks OpenWA.
