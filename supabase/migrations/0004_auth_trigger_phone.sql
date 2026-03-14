-- Migration: 0004_auth_trigger_phone
-- Purpose: Add phone field to profile creation trigger.

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

  insert into public.profiles (id, role, full_name, email, phone)
  values (
    new.id,
    resolved_role,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Ensure trigger exists
 drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
