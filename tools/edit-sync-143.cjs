/* One-off (13 Nov 2026), Trello card 143: role sync keys behind SUPABASE_ROLE_KEYS, migration and table. */
const fs=require('fs'),path=require('path');
const R=(...p)=>path.join(__dirname,'..',...p);
function ed(f,pairs){let s=fs.readFileSync(R(f),'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');for(const [a,b] of pairs){if(s.split(a).length!==2)throw new Error(f+' '+a.slice(0,50));s=s.split(a).join(b);}if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(R(f),s);}
ed('api/config.js',[["res.status(200).json({ supabase: url && key ? { url, key } : null });","res.status(200).json({ supabase: url && key ? { url, key } : null, roleKeys: process.env.SUPABASE_ROLE_KEYS === 'true' });"]]);
ed('src/supabase/config.ts',[['  key: string;\n}','  key: string;\n  /** true once the role-keys migration is applied: each link then syncs under its own role key */\n  roleKeys?: boolean;\n}'],
 ["const json = (await res.json()) as { supabase?: SupabaseConfig | null };\n    return json?.supabase?.url && json.supabase.key ? json.supabase : null;","const json = (await res.json()) as { supabase?: SupabaseConfig | null; roleKeys?: boolean };\n    return json?.supabase?.url && json.supabase.key ? { ...json.supabase, roleKeys: !!json.roleKeys } : null;"]]);
ed('src/components/LegacyPortal.tsx',[['sync = new RecordSync(cfg, bridge, screenRole);','sync = new RecordSync(cfg, bridge, cfg.roleKeys ? syncKey(role) : screenRole);'],["import { workspaceRole, type RoleKey } from '../roles';","import { workspaceRole, syncKey, type RoleKey } from '../roles';"]]);
ed('src/roles.ts',[['/** One link per role: /lead,',"/** The key a link syncs under when SUPABASE_ROLE_KEYS is on. The floor coordinator keeps the old `lead` key; the Patient Experience Lead is a separate app. */\nexport const syncKey = (k: RoleKey): RoleKey => (k === 'floor-coordinator' ? 'lead' : k === 'patient-experience-lead' ? 'psychologist' : k);\n\n/** One link per role: /lead,"]]);
ed('src/supabase/kinds.ts',[["  doctor: ['psychiatrist', 'lead', 'rmo'],\n  psychology: ['psychologist', 'psychiatrist', 'lead'],\n  consents: ['psychiatrist', 'lead', 'rmo'],\n  events: ['lead', 'psychiatrist', 'psychologist', 'nurse', 'rmo'],\n  prefs: ['lead', 'psychiatrist', 'psychologist', 'nurse', 'rmo'],","  doctor: ['psychiatrist', 'lead', 'rmo', 'floor-lead-psychiatrist'],\n  psychology: ['psychologist', 'psychiatrist', 'lead', 'floor-lead-psychologist', 'floor-lead-psychiatrist'],\n  consents: ['psychiatrist', 'lead', 'rmo', 'floor-lead-psychiatrist'],\n  events: ['lead', 'psychiatrist', 'psychologist', 'nurse', 'rmo', 'floor-lead-psychiatrist', 'floor-lead-psychologist'],\n  prefs: ['lead', 'psychiatrist', 'psychologist', 'nurse', 'rmo', 'floor-lead-psychiatrist', 'floor-lead-psychologist'],"],
 ["  notes: ['psychologist', 'psychiatrist', 'lead'],","  notes: ['psychologist', 'psychiatrist', 'lead', 'floor-lead-psychologist', 'floor-lead-psychiatrist'],"],
 ["  docs: ['lead', 'psychiatrist', 'psychologist'],","  docs: ['lead', 'psychiatrist', 'psychologist', 'floor-lead-psychologist', 'floor-lead-psychiatrist'],"]]);
ed('public/legacy/react-bridge.js',[["const PSYX_SHARED=['mgmtPsych','th','roundPlan','monTables','assignedAssess','sn'];","const PSYX_SHARED=['mgmtPsych','th','roundPlan','monTables','assignedAssess','sn','tpSign'];"]]);
fs.mkdirSync(R('docs'),{recursive:true});
fs.writeFileSync(R('supabase/migrations/20261113000000_role_keys.sql'),`-- Card 143: every role syncs under its own key. Run this in the Supabase SQL editor, THEN set SUPABASE_ROLE_KEYS=true in Vercel.
-- (rmo, nurse and lead already have rows. Only the two floor leads are new.)
insert into public.role_kinds(role, kind) values
  ('floor-lead-psychiatrist','doctor'),('floor-lead-psychiatrist','psychology'),('floor-lead-psychiatrist','consents'),
  ('floor-lead-psychiatrist','events'),('floor-lead-psychiatrist','prefs'),('floor-lead-psychiatrist','notes'),('floor-lead-psychiatrist','docs'),
  ('floor-lead-psychologist','psychology'),('floor-lead-psychologist','events'),('floor-lead-psychologist','prefs'),
  ('floor-lead-psychologist','notes'),('floor-lead-psychologist','docs')
on conflict do nothing;

create or replace function public.is_team() returns boolean
language sql stable as $$
  select public.req_role() in ('lead','psychiatrist','psychologist','nurse','rmo','floor-lead-psychiatrist','floor-lead-psychologist')
$$;

drop policy if exists admit on public.patients;
create policy admit on public.patients for insert to anon with check (public.req_role() in ('lead','psychiatrist','rmo','floor-lead-psychiatrist'));
drop policy if exists admit_edit on public.patients;
create policy admit_edit on public.patients for update to anon using (public.req_role() in ('lead','psychiatrist','rmo','floor-lead-psychiatrist')) with check (public.req_role() in ('lead','psychiatrist','rmo','floor-lead-psychiatrist'));
`);
fs.writeFileSync(R('docs/sync-table.md'),`# Who writes what, who sees what (card 143)

Everyone reads every kind (every 30 s). Writing is by kind.

| Data (kind) | Examples | Written by | Must be seen by |
|---|---|---|---|
| doctor | medicines, observation level, allergies, expected discharge, MHCA, capacity, history | psychiatrist, floor lead psychiatrist, rmo, floor coordinator | nurse (chart, obs checks), rmo, psychologists |
| psychology | therapy notes, shared working notes (management plan, therapy plan sign-off, assigned assessments) | psychologist, floor lead psychologist, psychiatrist, floor lead psychiatrist, floor coordinator | psychiatrist, floor leads |
| consents | consents, advance directive | psychiatrist, floor lead psychiatrist, rmo, floor coordinator | all clinical roles |
| events | events, restraints, grievances | all team roles | floor lead, patient experience |
| prefs | diet, preferences, contacts, family consent | all team roles | all |
| vitals | vitals, sugar, adherence, nursing summary | nurse, rmo | psychiatrist, rmo, psychologist |
| mar | doses given, held, refused | nurse, rmo | psychiatrist, rmo |
| notes | end-of-day notes | psychologists, psychiatrists, floor leads, floor coordinator | same |
| docs | clinical documents | psychiatrist, psychologist, floor leads, floor coordinator | all clinical roles |

Each link syncs under its own role key (rmo, floor-lead-psychiatrist, floor-lead-psychologist, floor-coordinator = lead, nurse).
This needs supabase/migrations/20261113000000_role_keys.sql run once, then SUPABASE_ROLE_KEYS=true in Vercel. Until then every link syncs as its workspace role, as before.
Every new card: add one line "who else should see this" and test it by logging in as that role in another browser.
`);
console.log('ok');
