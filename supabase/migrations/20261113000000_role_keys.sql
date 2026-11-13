-- Card 143: every role syncs under its own key. Run this in the Supabase SQL editor, THEN set SUPABASE_ROLE_KEYS=true in Vercel.
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
