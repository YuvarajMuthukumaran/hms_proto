-- Role isolation that cannot be faked (3 Nov 2026). Each role link carries a secret access code (?k=...).
-- The portal sends it as x-tulasi-key with x-tulasi-role. Only the SHA-256 hash of each code is stored here,
-- and anon has no access to role_keys. Every read and write now needs the right code for the role it claims.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.role_keys (
  role text primary key,
  key_hash text not null
);
alter table public.role_keys enable row level security; -- no policies: not readable or writable through the API

insert into public.role_keys(role, key_hash) values
  ('lead','8c40b63ec400136ed958cf2d9356ff6c5dfaebd4fccf477fde5b1e240bffc6c2'),
  ('psychiatrist','257a95e81951b4558ff5b5b86b2b93f058e88c7d4a5746fd5d9ae247c7e8c55a'),
  ('psychologist','778ad3a13b6e7310be50c440fc2bf96995543a6a132776ae88b5ee9ac71ea738'),
  ('nurse','ae2c26b88024242b22348651445f2c1b5282c572408d5f6f5979e17cf51f94d4'),
  ('rmo','80d14e626da173504fd59d3a1a5aeb87a097466249ca29eed99a99f00ac4fbfd')
on conflict (role) do update set key_hash = excluded.key_hash;

create or replace function public.req_key() returns text
language sql stable as $$
  select coalesce(current_setting('request.headers', true)::json ->> 'x-tulasi-key', '')
$$;

create or replace function public.is_team() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from public.role_keys k
    where k.role = public.req_role()
      and k.key_hash = encode(extensions.digest(public.req_key(), 'sha256'), 'hex')
  )
$$;

create or replace function public.can_write(k text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select public.is_team()
     and exists (select 1 from public.role_kinds rk where rk.role = public.req_role() and rk.kind = k)
$$;

drop policy if exists admit on public.patients;
create policy admit on public.patients for insert to anon
  with check (public.is_team() and public.req_role() in ('lead','psychiatrist','rmo'));
drop policy if exists admit_edit on public.patients;
create policy admit_edit on public.patients for update to anon
  using (public.is_team() and public.req_role() in ('lead','psychiatrist','rmo'))
  with check (public.is_team() and public.req_role() in ('lead','psychiatrist','rmo'));
