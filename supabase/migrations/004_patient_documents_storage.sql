-- 004_patient_documents_storage.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-documents',
  'patient-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists patient_documents_select on storage.objects;
create policy patient_documents_select
on storage.objects
for select
using (
  bucket_id = 'patient-documents'
  and split_part(name, '/', 1) = public.current_org_id()::text
);

drop policy if exists patient_documents_insert on storage.objects;
create policy patient_documents_insert
on storage.objects
for insert
with check (
  bucket_id = 'patient-documents'
  and split_part(name, '/', 1) = public.current_org_id()::text
  and public.has_any_role(array['admin'::public.app_role, 'provider'::public.app_role, 'staff'::public.app_role])
);

drop policy if exists patient_documents_update on storage.objects;
create policy patient_documents_update
on storage.objects
for update
using (
  bucket_id = 'patient-documents'
  and split_part(name, '/', 1) = public.current_org_id()::text
  and public.has_any_role(array['admin'::public.app_role, 'provider'::public.app_role, 'staff'::public.app_role])
)
with check (
  bucket_id = 'patient-documents'
  and split_part(name, '/', 1) = public.current_org_id()::text
);

drop policy if exists patient_documents_delete on storage.objects;
create policy patient_documents_delete
on storage.objects
for delete
using (
  bucket_id = 'patient-documents'
  and split_part(name, '/', 1) = public.current_org_id()::text
  and public.has_any_role(array['admin'::public.app_role, 'provider'::public.app_role, 'staff'::public.app_role])
);
