-- 14 Nov 2026: the patient registry (from the old HMS export), staff, and admissions.
-- The portal reads these; only the import script (service role, run from a PC) and the admit flow write them.
-- No real patient data goes into a project that has no logins: build and test with the synthetic copy (tools/make_synthetic.py).

-- 1. Registry fields on the existing patients table
alter table public.patients add column if not exists patient_no int;
alter table public.patients add column if not exists uhids text[] not null default '{}';
alter table public.patients add column if not exists dob_est date;              -- estimated from "Age (Detail)" and the last visit date
alter table public.patients add column if not exists mobile text;               -- +91XXXXXXXXXX, null when invalid
alter table public.patients add column if not exists mobiles_other text[] not null default '{}';
alter table public.patients add column if not exists address text;
alter table public.patients add column if not exists relatives jsonb not null default '[]'::jsonb;  -- [{name, rel}]
alter table public.patients add column if not exists referral text;
alter table public.patients add column if not exists panel text;                -- OPD / IPD (last known)
alter table public.patients add column if not exists first_visit date;
alter table public.patients add column if not exists last_visit date;
alter table public.patients add column if not exists visit_count int not null default 0;
alter table public.patients add column if not exists doctors_seen text[] not null default '{}';
alter table public.patients add column if not exists registered_by text;
alter table public.patients add column if not exists flags text[] not null default '{}';
alter table public.patients add column if not exists status text not null default 'registered'
  check (status in ('registered','admitted','discharged'));
alter table public.patients add column if not exists floor text;
alter table public.patients add column if not exists bed text;
alter table public.patients add column if not exists admitted_at date;
alter table public.patients add column if not exists source text not null default 'app';  -- app / import / synthetic

create index if not exists patients_name_idx on public.patients using gin (to_tsvector('simple', coalesce(name,'')));
create index if not exists patients_mobile_idx on public.patients (mobile);
create index if not exists patients_status_idx on public.patients (status);
create index if not exists patients_uhids_idx on public.patients using gin (uhids);

-- 2. Staff (from "Doctors Seen" and "Registered By"); role is psychiatrist / psychologist / nurse / rmo / front_desk / lead
create table if not exists public.staff (
  id text primary key,
  name text not null unique,
  role text not null,
  active boolean not null default true,
  source text not null default 'app',
  updated_at timestamptz not null default now()
);

-- 3. Admissions: one row per inpatient stay
create table if not exists public.admissions (
  id bigserial primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  admitted_at date not null,
  discharged_at date,
  section text,            -- MHCA 86 / 87 / 89 / 90
  floor text,
  room text,
  bed text,
  psychiatrist text,
  psychologist text,
  status text not null default 'admitted' check (status in ('admitted','discharged')),
  updated_role text not null default 'import',
  updated_at timestamptz not null default now()
);
create index if not exists admissions_patient_idx on public.admissions (patient_id);
create unique index if not exists admissions_one_open on public.admissions (patient_id) where status = 'admitted';

-- 4. Import runs (counts only, never patient details)
create table if not exists public.import_runs (
  id bigserial primary key,
  source_file text not null,
  synthetic boolean not null,
  rows_in int not null,
  rows_loaded int not null,
  rows_rejected int not null,
  report jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

-- 5. Row level security: the team reads; writes come from the service role (import) or the admit roles
alter table public.staff enable row level security;
alter table public.admissions enable row level security;
alter table public.import_runs enable row level security;

drop policy if exists team_read on public.staff;
create policy team_read on public.staff for select to anon using (public.is_team());

drop policy if exists team_read on public.admissions;
create policy team_read on public.admissions for select to anon using (public.is_team());
drop policy if exists admit on public.admissions;
create policy admit on public.admissions for insert to anon with check (public.req_role() in ('lead','psychiatrist','rmo','floor-lead-psychiatrist'));
drop policy if exists admit_edit on public.admissions;
create policy admit_edit on public.admissions for update to anon
  using (public.req_role() in ('lead','psychiatrist','rmo','floor-lead-psychiatrist')) with check (public.req_role() in ('lead','psychiatrist','rmo','floor-lead-psychiatrist'));
-- import_runs: no anon policy, so only the service role can read or write it
