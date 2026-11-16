-- 16 Nov 2026: state that belongs to the whole hospital and not to one patient (RMO shift handover signature, admissions waiting for paperwork
-- check, nurse instructions, Rounds "seen" marks of the day). Every signed-in team role may read and write it.
-- Run once in the REAL project's SQL editor (and the demo project if you use it).
create table if not exists public.portal_state (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_role text,
  updated_by text,
  updated_at timestamptz not null default now()
);
alter table public.portal_state enable row level security;
drop policy if exists ps_read on public.portal_state;
create policy ps_read on public.portal_state for select to authenticated using (public.is_team());
drop policy if exists ps_write on public.portal_state;
create policy ps_write on public.portal_state for insert to authenticated with check (public.is_team());
drop policy if exists ps_update on public.portal_state;
create policy ps_update on public.portal_state for update to authenticated using (public.is_team()) with check (public.is_team());
grant select, insert, update on public.portal_state to authenticated;
