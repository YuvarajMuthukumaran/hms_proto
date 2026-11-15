-- 15 Nov 2026: history pulled from the old HMS APIs (discharge-summary documents, visits, diagnoses, prescription records).
-- Read-only for the team. Only the import script (service role, run from a PC) writes it. Run once in the SQL editor of the REAL project.

create table if not exists public.hms_history (
  id bigserial primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  kind text not null check (kind in ('discharge_doc','visit','diagnosis','prescription')),
  ref text not null,            -- id in the old HMS (document id, visit id, prescription id) or 'latest' for the diagnosis
  event_date date,
  title text,                   -- short line shown in the list
  detail text,                  -- diagnosis text, doctor, visit type
  url text,                     -- PDF link in the old HMS (opens only for someone signed in there)
  data jsonb not null default '{}'::jsonb,
  source text not null default 'old-hms-api',
  loaded_at timestamptz not null default now(),
  unique (patient_id, kind, ref)
);
create index if not exists hms_history_patient_idx on public.hms_history (patient_id, event_date desc);

alter table public.hms_history enable row level security;
drop policy if exists team_read on public.hms_history;
create policy team_read on public.hms_history for select to authenticated using (public.is_team());
-- no insert/update/delete policy: only the service role writes

grant select on public.hms_history to authenticated;
revoke all on public.hms_history from anon;
