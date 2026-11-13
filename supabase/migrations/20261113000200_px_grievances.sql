-- Card 144: HMS roles may read all px rows, and write the owner rows (pxo:) and new-from-record rows (pxn:). Run once.
drop policy if exists px_read on public.px_state;
create policy px_read on public.px_state for select to anon using (public.is_team() or public.req_role() = 'patient-experience-lead');
drop policy if exists px_team_write on public.px_state;
create policy px_team_write on public.px_state for insert to anon with check (public.is_team() and (key like 'pxo:%' or key like 'pxn:%'));
drop policy if exists px_team_update on public.px_state;
create policy px_team_update on public.px_state for update to anon using (public.is_team() and (key like 'pxo:%' or key like 'pxn:%')) with check (public.is_team() and (key like 'pxo:%' or key like 'pxn:%'));
