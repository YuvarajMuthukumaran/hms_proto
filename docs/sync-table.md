# Who writes what, who sees what (card 143)

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
