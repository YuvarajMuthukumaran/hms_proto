# Tulasi Clinical Portal (React + Supabase)

Vite + React + TypeScript. The inpatient screens are still the original ones and run inside the React shell;
they move into React components one screen at a time.

## What is React now

| Part | Where |
| --- | --- |
| Role picker (login page) and role links `/lead`, `/floor-coordinator`, `/psychiatrist`, `/patient-experience-lead`, `/psychologist`, `/nurse`, `/rmo` | `src/App.tsx`, `src/components/RolePicker.tsx`, `src/roles.ts` |
| Mounting the old screens | `src/components/LegacyPortal.tsx`, `src/legacy/loadLegacy.ts` |
| Supabase sync (load, save, pull every 30 s, audit log), per-role write rules | `src/supabase/` |
| Sync status pill ("Synced", "Demo data") | `src/components/SyncBadge.tsx` |

## What is still the old code

`public/legacy/` holds the old portal split from the single HTML file: `legacy.css`, `js/NN-*.js` (loaded in order by
`src/legacy/scripts.ts`) and `react-bridge.js`, the only door between the old screens and React (`window.TulasiBridge`,
typed in `src/legacy/bridge.ts`). The old login, role-link and Supabase blocks were removed.
`src/legacy/markup.html` is the old page frame (sidebar, header, `#view`, modal, toast).

Old files keep their conventions: override blocks, `S` state, `render()`, CRLF endings.

## Moving a screen to React

1. Add a React component for the screen and render it into the old page's `#view` (or replace the old frame once
   enough screens have moved).
2. Read and write patient data through `TulasiBridge` until the state itself moves out of `S`.
3. Delete the old function from its `public/legacy/js` block, then run `npm run check:legacy`.

## Run

```bash
npm install
npm run dev          # http://localhost:5173 (Supabase is off: demo data in the browser)
npm run build        # typecheck, build, parse-check every legacy script
```

Supabase locally: copy `.env.example` to `.env.local` and fill the project URL and anon key. On Vercel the portal reads
`SUPABASE_URL` and `SUPABASE_ANON_KEY` through `/api/config`, as before. Never use the `service_role` key.
`api/` and `lib/` (WhatsApp bridge, AI scribe, config) are unchanged Vercel functions, so they need `vercel dev` locally.

## Deploy

Same Vercel project and environment variables. `vercel.json` sets the Vite build and rewrites all seven role links to the app shell.
