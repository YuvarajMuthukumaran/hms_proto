# Tulasi Clinical Portal (prototype)

Static HMS clinical portal prototype (`index.html`) with a WhatsApp bridge as Vercel functions (`api/`).
All patient data in the portal is dummy.

```
Portal (Vercel) → /api/* (Vercel functions) → Cloudflare Tunnel → OpenWA (hospital PC, Docker) → WhatsApp
```

## API

All routes need the header `X-Bridge-Token`. Staff enter it once in the portal: **WhatsApp connection settings**.

| Route | Does |
| --- | --- |
| `GET /api/health` | OpenWA session status |
| `POST /api/send/patient` `{uhid, text, by}` | Sends to the WhatsApp group named `<uhid>`. If the group is missing, it's created with the numbers from `PATIENTS_JSON` |
| `POST /api/send/doctors` `{text, by}` | Sends to the doctors' group (`DOCTORS_GROUP_NAME`) |

## Vercel environment variables (private, never in this repo)

| Name | Value |
| --- | --- |
| `BRIDGE_TOKEN` | A long random string, shared only with staff |
| `OPENWA_URL` | The Cloudflare Tunnel address of OpenWA, e.g. `https://xxxx.trycloudflare.com` |
| `OPENWA_API_KEY` | OpenWA API key (`docker exec openwa-api cat /app/data/.api-key`) |
| `OPENWA_SESSION_ID` | OpenWA session id |
| `DOCTORS_GROUP_NAME` | Exact name of the doctors' WhatsApp group |
| `TEAM_MEMBERS` | Optional comma-separated numbers added to every new patient group |
| `PATIENTS_JSON` | `{"<uhid>":{"name":"...","members":["98XXXXXXXX"]}}` |

## Hospital PC

OpenWA runs in Docker on the hospital PC (`ENGINE_TYPE=baileys`), reached through `cloudflared tunnel --url http://localhost:2785`.
WhatsApp sending only works while that PC, Docker and the tunnel are running.
A quick tunnel gets a new address each time it starts. When that happens, update `OPENWA_URL` in Vercel and redeploy.
