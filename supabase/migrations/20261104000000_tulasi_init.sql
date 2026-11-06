-- Tulasi Clinical Portal (prototype, demo data only): first schema.
-- Login is link-only (owner's decision, 4 Nov 2026): each role link sends its role in the x-tulasi-role header.
-- Row level security uses that header so each role can write only its own kinds of record:
-- a nurse cannot change medicines, a psychologist cannot change orders. Everyone on the team can read the record.
-- Without passwords the header can be forged by anyone holding the anon key, so this separates the role apps;
-- it is not a security boundary. Add Supabase Auth before any real patient data.

create table if not exists public.patients (
  id text primary key,
  name text not null,
  sex text,
  age int,
  uhid text unique,
  room text,
  ward text,
  day int,
  section text,
  dx text,
  risk boolean default false,
  psychiatrist text,
  psychologist text,
  nominated_rep text,
  nominated_rel text,
  updated_at timestamptz default now()
);

-- one row per patient per kind of record (doctor, psychology, consents, events, prefs, vitals, notes, mar)
create table if not exists public.patient_records (
  patient_id text references public.patients(id) on delete cascade,
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  updated_role text not null,
  updated_by text,
  updated_at timestamptz not null default now(),
  primary key (patient_id, kind)
);

create table if not exists public.clinical_docs (
  entry_key text primary key,
  patient_id text references public.patients(id) on delete cascade,
  form_id text not null,
  status text not null default 'draft',
  doc jsonb not null default '{}'::jsonb,
  updated_role text not null,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  patient_id text,
  role text not null,
  actor text,
  action text not null,
  detail text,
  at timestamptz not null default now()
);

-- which role may write which kind of record
create table if not exists public.role_kinds (
  role text not null,
  kind text not null,
  primary key (role, kind)
);
insert into public.role_kinds(role, kind) values
  ('psychiatrist','doctor'),('lead','doctor'),('rmo','doctor'),
  ('psychologist','psychology'),('psychiatrist','psychology'),('lead','psychology'),
  ('psychiatrist','consents'),('lead','consents'),('rmo','consents'),
  ('lead','events'),('psychiatrist','events'),('psychologist','events'),('nurse','events'),('rmo','events'),
  ('lead','prefs'),('psychiatrist','prefs'),('psychologist','prefs'),('nurse','prefs'),('rmo','prefs'),
  ('nurse','vitals'),('rmo','vitals'),
  ('psychologist','notes'),('psychiatrist','notes'),('lead','notes'),
  ('nurse','mar'),('rmo','mar'),
  ('lead','docs'),('psychiatrist','docs'),('psychologist','docs')
on conflict do nothing;

create or replace function public.req_role() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.headers', true)::json ->> 'x-tulasi-role', ''), '')
$$;

create or replace function public.can_write(k text) returns boolean
language sql stable as $$
  select exists (select 1 from public.role_kinds rk where rk.role = public.req_role() and rk.kind = k)
$$;

create or replace function public.is_team() returns boolean
language sql stable as $$
  select public.req_role() in ('lead','psychiatrist','psychologist','nurse','rmo')
$$;

alter table public.patients enable row level security;
alter table public.patient_records enable row level security;
alter table public.clinical_docs enable row level security;
alter table public.audit_log enable row level security;
alter table public.role_kinds enable row level security;

drop policy if exists team_read on public.patients;
create policy team_read on public.patients for select to anon using (public.is_team());
drop policy if exists admit on public.patients;
create policy admit on public.patients for insert to anon with check (public.req_role() in ('lead','psychiatrist','rmo'));
drop policy if exists admit_edit on public.patients;
create policy admit_edit on public.patients for update to anon using (public.req_role() in ('lead','psychiatrist','rmo')) with check (public.req_role() in ('lead','psychiatrist','rmo'));

drop policy if exists team_read on public.patient_records;
create policy team_read on public.patient_records for select to anon using (public.is_team());
drop policy if exists own_kind_insert on public.patient_records;
create policy own_kind_insert on public.patient_records for insert to anon
  with check (public.can_write(kind) and updated_role = public.req_role());
drop policy if exists own_kind_update on public.patient_records;
create policy own_kind_update on public.patient_records for update to anon
  using (public.can_write(kind)) with check (public.can_write(kind) and updated_role = public.req_role());

drop policy if exists team_read on public.clinical_docs;
create policy team_read on public.clinical_docs for select to anon using (public.is_team());
drop policy if exists docs_insert on public.clinical_docs;
create policy docs_insert on public.clinical_docs for insert to anon
  with check (public.can_write('docs') and updated_role = public.req_role());
drop policy if exists docs_update on public.clinical_docs;
create policy docs_update on public.clinical_docs for update to anon
  using (public.can_write('docs')) with check (public.can_write('docs') and updated_role = public.req_role());

drop policy if exists team_read on public.audit_log;
create policy team_read on public.audit_log for select to anon using (public.is_team());
drop policy if exists own_role_insert on public.audit_log;
create policy own_role_insert on public.audit_log for insert to anon with check (role = public.req_role() and public.is_team());

drop policy if exists team_read on public.role_kinds;
create policy team_read on public.role_kinds for select to anon using (public.is_team());

create index if not exists patient_records_updated on public.patient_records (updated_at);
create index if not exists clinical_docs_updated on public.clinical_docs (updated_at);

-- demo patients (no real patient data)
insert into public.patients (id,name,sex,age,uhid,room,ward,day,section,dx,risk,psychiatrist,psychologist,nominated_rep,nominated_rel) values
('arjun','Arjun Mehta','M',34,'2026-27RG6812','Room 210','Male ward',12,'89','Severe depressive episode',false,'Dr. Aanya Sharma','Priya Nair','Shalini Mehta','Wife'),
('varun','Varun Rao','M',41,'2026-27RG6870','Room 211','Male ward',4,'89','Alcohol dependence, withdrawal',false,'Dr. Kunal Sethi','Kiran Mehra','Lakshmi Rao','Mother'),
('kabir','Karan Malhotra','M',26,'2026-27RG6731','Room 212 A','Male ward',21,'90','Schizophrenia',false,'Dr. Aanya Sharma','Priya Nair','Rajesh Malhotra','Father'),
('sameer','Sameer Das','M',22,'2026-27RG6905','Room 213 A','Male ward',7,'89','Obsessive-compulsive disorder',false,'Dr. Rohan Mehta','Kiran Mehra','Mitali Das','Mother'),
('neel','Neel Bose','M',23,'2026-27RG6990','Room 213 A','Male ward',6,'89','Bipolar affective disorder, manic',true,'Dr. Aanya Sharma','Priya Nair','Ananya Bose','Sister'),
('rohit','Rohit Kapoor','M',38,'2026-27RG7012','Suite 201','Male ward',0,'89','Admitted today',false,'Dr. Aanya Sharma',null,'Meera Kapoor','Wife'),
('dev','Dev Kumar','M',31,'2026-27RG6788','Room 215 A','Male ward',15,'89','Opioid dependence',false,'Dr. Nandini Rao','Priya Nair','Suresh Kumar','Brother'),
('tarun','Tarun Roy','M',19,'2026-27RG6961','Room 216 · Observation','Male ward',3,'89','Acute psychotic episode',true,'Dr. Aanya Sharma','Kiran Mehra','Anil Roy','Father'),
('meera','Meera Iyer','F',44,'2026-27RG7296','Room 310 A','Female ward',9,'89','Severe depressive episode',false,'Dr. Kunal Sethi',null,'Gopal Iyer','Husband'),
('sana','Sana Qureshi','F',27,'2026-27RG7333','Room 311','Female ward',3,'89','Acute psychotic episode',true,'Dr. Kunal Sethi',null,'Farah Qureshi','Mother'),
('ritu','Ritu Malhotra','F',36,'2026-27RG7370','Room 312 B','Female ward',14,'90','Bipolar affective disorder, depressed',false,'Dr. Kunal Sethi',null,'Vikram Malhotra','Husband'),
('kavya','Kavya Menon','F',19,'2026-27RG7407','Room 313','Female ward',6,'89','Anorexia nervosa',false,'Dr. Kunal Sethi',null,'Lata Menon','Mother'),
('pooja','Pooja Bhatt','F',32,'2026-27RG7444','Room 314 A','Female ward',1,'89','Admitted yesterday',false,'Dr. Kunal Sethi',null,'Harish Bhatt','Father'),
('aman','Aman Gill','M',39,'2026-27RG7481','Room 120','De-addiction ward',5,'89','Alcohol dependence, withdrawal',false,'Dr. Rohan Mehta',null,'Gurpreet Gill','Wife'),
('yash','Yash Arora','M',28,'2026-27RG7518','Room 121 A','De-addiction ward',11,'89','Opioid dependence',false,'Dr. Rohan Mehta',null,'Neha Arora','Sister'),
('nikhil','Nikhil Jain','M',47,'2026-27RG7555','Room 122','De-addiction ward',2,'89','Alcohol withdrawal, delirium risk',true,'Dr. Rohan Mehta',null,'Sunita Jain','Wife'),
('rahul','Rahul Sethi','M',24,'2026-27RG7592','Room 123 B','De-addiction ward',18,'89','Cannabis dependence',false,'Dr. Rohan Mehta',null,'Kamal Sethi','Father')
on conflict (id) do nothing;
