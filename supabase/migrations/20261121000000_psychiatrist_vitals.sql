-- 21 Nov 2026 (owner): the psychiatrist and the floor lead psychiatrist may add vitals. Run once in each Supabase project (demo and real).
insert into public.role_kinds(role, kind) values
  ('psychiatrist','vitals'),('floor-lead-psychiatrist','vitals')
on conflict do nothing;
