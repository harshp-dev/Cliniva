-- 002_rls_policies.sql
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid()
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.has_any_role(roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = any(roles)
$$;

do $$
declare
  tbl text;
  tables text[] := array[
    'organizations','roles','permissions','users','insurance_plans','patients','providers','appointments',
    'medical_records','clinical_notes','medications','prescriptions','allergies','vital_signs','diagnoses','procedures',
    'lab_orders','lab_results','care_plans','messages','notifications','documents','payments','claims','audit_logs'
  ];
begin
  foreach tbl in array tables
  loop
    execute format('drop policy if exists %I_tenant_select on public.%I;', tbl, tbl);
    execute format('drop policy if exists %I_tenant_insert on public.%I;', tbl, tbl);
    execute format('drop policy if exists %I_tenant_update on public.%I;', tbl, tbl);
    execute format('drop policy if exists %I_tenant_delete on public.%I;', tbl, tbl);

    execute format(
      'create policy %I_tenant_select on public.%I for select using (organization_id = public.current_org_id());',
      tbl,
      tbl
    );

    execute format(
      'create policy %I_tenant_insert on public.%I for insert with check (organization_id = public.current_org_id() and public.has_any_role(array[''admin''::public.app_role,''provider''::public.app_role,''staff''::public.app_role]));',
      tbl,
      tbl
    );

    execute format(
      'create policy %I_tenant_update on public.%I for update using (organization_id = public.current_org_id() and public.has_any_role(array[''admin''::public.app_role,''provider''::public.app_role,''staff''::public.app_role])) with check (organization_id = public.current_org_id());',
      tbl,
      tbl
    );

    execute format(
      'create policy %I_tenant_delete on public.%I for delete using (organization_id = public.current_org_id() and public.has_any_role(array[''admin''::public.app_role,''provider''::public.app_role,''staff''::public.app_role]));',
      tbl,
      tbl
    );
  end loop;
end $$;

-- Patient-friendly access for messaging/notifications/appointments/payments
create policy appointments_patient_select on public.appointments
for select
using (
  organization_id = public.current_org_id()
  and (
    public.has_any_role(array['admin'::public.app_role,'provider'::public.app_role,'staff'::public.app_role])
    or exists (
      select 1
      from public.patients p
      where p.id = appointments.patient_id and p.user_id = auth.uid()
    )
  )
);

create policy messages_patient_insert on public.messages
for insert
with check (
  organization_id = public.current_org_id()
  and (
    sender_id = auth.uid()
    or public.has_any_role(array['admin'::public.app_role,'provider'::public.app_role,'staff'::public.app_role])
  )
);

create policy notifications_patient_select on public.notifications
for select
using (
  organization_id = public.current_org_id() and (user_id = auth.uid() or public.has_any_role(array['admin'::public.app_role,'provider'::public.app_role,'staff'::public.app_role]))
);

create policy payments_patient_select on public.payments
for select
using (
  organization_id = public.current_org_id()
  and (
    public.has_any_role(array['admin'::public.app_role,'staff'::public.app_role])
    or exists (
      select 1 from public.patients p where p.id = payments.patient_id and p.user_id = auth.uid()
    )
  )
);

-- Restrict audit logs to admin + staff reads
drop policy if exists audit_logs_tenant_select on public.audit_logs;
create policy audit_logs_tenant_select on public.audit_logs
for select
using (
  organization_id = public.current_org_id()
  and public.has_any_role(array['admin'::public.app_role,'staff'::public.app_role])
);
