-- 15 Nov 2026: real logins. The database answers only signed-in staff, and the role comes from the login, not from a header.
-- Each account's role is in auth.users.raw_app_meta_data->>'role' (set by tools/make_accounts.py; a user cannot change it):
--   psychiatrist, psychologist, nurse, rmo, lead (floor coordinator), floor-lead-psychiatrist, floor-lead-psychologist, patient-experience-lead
-- After this runs, the public (anon) key alone reads and writes nothing.

-- 1. The role of the request = the role on the signed-in account
create or replace function public.req_role() returns text
language sql stable as $$
  select coalesce(nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''), '')
$$;

-- 2. Every policy that was granted to anon now applies to signed-in users only
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
           where schemaname = 'public' and 'anon' = any(roles)
  loop
    execute format('alter policy %I on %I.%I to authenticated', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- 3. Belt and braces: anon has no table rights at all in public
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
