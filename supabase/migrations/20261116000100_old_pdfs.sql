-- 16 Nov 2026: the old-HMS PDFs (discharge summaries, prescriptions) live in a PRIVATE storage bucket.
-- Only signed-in team roles may read them (the portal asks for a 5-minute signed link when someone clicks "Open PDF").
-- Nobody can write from the site: the files are put there by tools/upload_old_pdfs.py with the service key. Run once in the REAL project's SQL editor.
insert into storage.buckets (id, name, public) values ('old-hms-pdfs', 'old-hms-pdfs', false) on conflict (id) do nothing;

drop policy if exists old_pdfs_read on storage.objects;
create policy old_pdfs_read on storage.objects for select to authenticated
  using (bucket_id = 'old-hms-pdfs' and public.is_team());
