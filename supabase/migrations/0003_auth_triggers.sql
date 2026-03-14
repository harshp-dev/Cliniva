-- Migration: 0003_auth_triggers
-- Purpose: Create profile row on auth.users insert.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  resolved_role user_role;
begin
  resolved_role := case
    when (new.raw_user_meta_data->>'role') in ('patient', 'provider', 'admin')
      then (new.raw_user_meta_data->>'role')::user_role
    else 'patient'
  end;

  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    resolved_role,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger on auth.users
-- Drop first for idempotency
 drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
