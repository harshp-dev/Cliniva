-- Migration: 0006_audit_helpers
-- Purpose: Allow authenticated product actions to create audit entries
-- through a security-definer function without exposing broader writes.

create or replace function create_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_user_id uuid := auth.uid();
  created_audit_id uuid;
begin
  if actor_user_id is null then
    raise exception 'Authentication required to create audit logs.';
  end if;

  if p_action is null or btrim(p_action) = '' then
    raise exception 'Audit action is required.';
  end if;

  if p_entity_type is null or btrim(p_entity_type) = '' then
    raise exception 'Audit entity type is required.';
  end if;

  insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    actor_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    case
      when p_metadata is null then null
      else p_metadata
    end
  )
  returning id into created_audit_id;

  return created_audit_id;
end;
$$;

revoke all on function create_audit_log(text, text, uuid, jsonb) from public;
grant execute on function create_audit_log(text, text, uuid, jsonb) to authenticated;
