-- 19 Nov 2026: Patient Experience sees the family calls and updates the psychologist and psychiatrist logged (patients > Family calls and updates).
-- The PX account may NOT read patient_records directly (it holds therapy notes). This function hands back only the family log
-- (psyxShared.fam.log: what, by, at, note) of patients who are admitted now, and only to the Patient Experience login.
-- Run once in the SQL editor of the REAL project (and the demo project if you want it there).
create or replace function public.px_family_calls()
returns table(patient_id text, log jsonb)
language sql
security definer
set search_path = public
as $$
  select r.patient_id, r.data -> 'psyxShared' -> 'fam' -> 'log'
  from public.patient_records r
  join public.patients p on p.id = r.patient_id
  where r.kind = 'psychology'
    and p.status = 'admitted'
    and public.req_role() = 'patient-experience-lead'
    and jsonb_typeof(r.data -> 'psyxShared' -> 'fam' -> 'log') = 'array';
$$;
revoke all on function public.px_family_calls() from public;
grant execute on function public.px_family_calls() to authenticated;
