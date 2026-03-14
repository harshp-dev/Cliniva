-- 006_messaging_notification_security.sql
-- Restrict messaging and notification visibility to participants, while preserving care team oversight.

drop policy if exists messages_tenant_select on public.messages;
create policy messages_tenant_select on public.messages
for select
using (
  organization_id = public.current_org_id()
  and (
    sender_id = auth.uid()
    or recipient_id = auth.uid()
    or public.has_any_role(array['admin'::public.app_role,'provider'::public.app_role,'staff'::public.app_role])
  )
);

drop policy if exists notifications_tenant_select on public.notifications;
drop policy if exists notifications_patient_select on public.notifications;
create policy notifications_tenant_select on public.notifications
for select
using (
  organization_id = public.current_org_id()
  and (
    user_id = auth.uid()
    or public.has_any_role(array['admin'::public.app_role,'provider'::public.app_role,'staff'::public.app_role])
  )
);

drop policy if exists notifications_patient_update on public.notifications;
create policy notifications_patient_update on public.notifications
for update
using (
  organization_id = public.current_org_id()
  and user_id = auth.uid()
)
with check (
  organization_id = public.current_org_id()
  and user_id = auth.uid()
);

drop policy if exists messages_recipient_update on public.messages;
create policy messages_recipient_update on public.messages
for update
using (
  organization_id = public.current_org_id()
  and recipient_id = auth.uid()
)
with check (
  organization_id = public.current_org_id()
  and recipient_id = auth.uid()
);
