-- 16 Nov 2026: Patient Experience on real patients.
-- The PX account (role patient-experience-lead) may read the patients who are admitted now (name, ward, doctor, family contact),
-- nothing else in public.patients. The shared PX rows (px_state) already allow it. Run once in the SQL editor of the REAL project.
drop policy if exists px_read_admitted on public.patients;
create policy px_read_admitted on public.patients for select to authenticated
  using (public.req_role() = 'patient-experience-lead' and status = 'admitted');
