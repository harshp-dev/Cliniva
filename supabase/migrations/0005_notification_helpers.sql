-- Migration: 0005_notification_helpers
-- Purpose: Allow authenticated appointment participants to create in-app
-- notifications for the other participant without exposing service-role access.

create or replace function create_appointment_notification(
  p_appointment_id uuid,
  p_recipient_user_id uuid,
  p_type notification_type,
  p_title text,
  p_body text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_user_id uuid := auth.uid();
  appointment_row appointments%rowtype;
  created_notification_id uuid;
begin
  if actor_user_id is null then
    raise exception 'Authentication required to create notifications.';
  end if;

  select *
  into appointment_row
  from appointments
  where id = p_appointment_id;

  if not found then
    raise exception 'Appointment not found.';
  end if;

  if not (
    actor_user_id = appointment_row.patient_user_id
    or actor_user_id = appointment_row.provider_user_id
    or is_admin()
  ) then
    raise exception 'You are not allowed to create notifications for this appointment.';
  end if;

  if not (
    p_recipient_user_id = appointment_row.patient_user_id
    or p_recipient_user_id = appointment_row.provider_user_id
  ) then
    raise exception 'Notification recipient must belong to the appointment.';
  end if;

  insert into notifications (user_id, type, title, body)
  values (
    p_recipient_user_id,
    p_type,
    p_title,
    case
      when p_body is null or btrim(p_body) = '' then null
      else p_body
    end
  )
  returning id into created_notification_id;

  return created_notification_id;
end;
$$;

revoke all on function create_appointment_notification(uuid, uuid, notification_type, text, text) from public;
grant execute on function create_appointment_notification(uuid, uuid, notification_type, text, text) to authenticated;
