-- Migration: 0009_policy_recursion_fix
-- Purpose: remove RLS recursion between profiles and appointments, and
-- allow authenticated users to read provider directory rows needed for booking.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to service_role;

drop policy if exists profiles_select_provider_directory on profiles;
create policy profiles_select_provider_directory on profiles
  for select using (
    auth.uid() is not null and role = 'provider'
  );
