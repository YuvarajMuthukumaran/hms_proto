-- Card 144: shared store for the Patient Experience pages (rounds, calendar, training). Run once, then SUPABASE_PX_STORE=true in Vercel.
create table if not exists public.px_state (
  key text primary key,
  data jsonb,
  updated_at timestamptz not null default now()
);
alter table public.px_state enable row level security;
drop policy if exists px_read on public.px_state;
create policy px_read on public.px_state for select to anon using (public.req_role() in ('patient-experience-lead','lead','psychiatrist','psychologist','floor-lead-psychiatrist','floor-lead-psychologist'));
drop policy if exists px_write on public.px_state;
create policy px_write on public.px_state for insert to anon with check (public.req_role() = 'patient-experience-lead');
drop policy if exists px_update on public.px_state;
create policy px_update on public.px_state for update to anon using (public.req_role() = 'patient-experience-lead') with check (public.req_role() = 'patient-experience-lead');
