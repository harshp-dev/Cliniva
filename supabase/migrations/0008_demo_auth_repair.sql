-- Demo auth repair
-- Purpose: repair hosted Supabase auth rows for the Cliniva demo accounts without
-- deleting application-domain data that references those users.
--
-- Run this in the Supabase SQL Editor, then run:
--   npm run demo:bootstrap
--
-- Password for all repaired demo users:
--   ClinivaDemo!23

do $$
declare
  fallback_instance_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  resolved_instance_id uuid;
  demo_profile_count integer;
  demo_user record;
begin
  select count(*) into demo_profile_count
  from public.profiles
  where email in (
    'ava.thompson@cliniva.com',
    'ethan.parker@cliniva.com',
    'maya.collins@cliniva.com',
    'olivia.carter@cliniva.com',
    'noah.bennett@cliniva.com',
    'sophia.reed@cliniva.com'
  );

  if demo_profile_count <> 6 then
    raise exception 'Expected all 6 demo profiles to exist before auth repair. Run 0007_hosted_demo_bootstrap.sql first.';
  end if;

  select coalesce((select instance_id from auth.users limit 1), fallback_instance_id)
    into resolved_instance_id;

  for demo_user in
    select
      p.id,
      p.email,
      case p.email
        when 'ava.thompson@cliniva.com' then 'Ava Thompson'
        when 'ethan.parker@cliniva.com' then 'Dr. Ethan Parker'
        when 'maya.collins@cliniva.com' then 'Dr. Maya Collins'
        when 'olivia.carter@cliniva.com' then 'Olivia Carter'
        when 'noah.bennett@cliniva.com' then 'Noah Bennett'
        when 'sophia.reed@cliniva.com' then 'Sophia Reed'
      end as full_name,
      case p.email
        when 'ava.thompson@cliniva.com' then 'admin'
        when 'ethan.parker@cliniva.com' then 'provider'
        when 'maya.collins@cliniva.com' then 'provider'
        when 'olivia.carter@cliniva.com' then 'patient'
        when 'noah.bennett@cliniva.com' then 'patient'
        when 'sophia.reed@cliniva.com' then 'patient'
      end as role,
      case p.email
        when 'ava.thompson@cliniva.com' then '+1-415-555-0130'
        when 'ethan.parker@cliniva.com' then '+1-212-555-0174'
        when 'maya.collins@cliniva.com' then '+1-617-555-0182'
        when 'olivia.carter@cliniva.com' then '+1-312-555-0191'
        when 'noah.bennett@cliniva.com' then '+1-206-555-0146'
        when 'sophia.reed@cliniva.com' then '+1-646-555-0168'
      end as phone
    from public.profiles p
    where p.email in (
      'ava.thompson@cliniva.com',
      'ethan.parker@cliniva.com',
      'maya.collins@cliniva.com',
      'olivia.carter@cliniva.com',
      'noah.bennett@cliniva.com',
      'sophia.reed@cliniva.com'
    )
  loop
    delete from auth.identities where user_id::text = demo_user.id::text;

    if to_regclass('auth.sessions') is not null then
      execute format('delete from auth.sessions where user_id::text = %L', demo_user.id::text);
    end if;

    if to_regclass('auth.refresh_tokens') is not null then
      execute format('delete from auth.refresh_tokens where user_id::text = %L', demo_user.id::text);
    end if;

    if to_regclass('auth.one_time_tokens') is not null then
      execute format('delete from auth.one_time_tokens where user_id::text = %L', demo_user.id::text);
    end if;

    if to_regclass('auth.mfa_factors') is not null then
      execute format('delete from auth.mfa_factors where user_id::text = %L', demo_user.id::text);
    end if;

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      email_change_confirm_status,
      reauthentication_token,
      is_sso_user,
      deleted_at,
      is_anonymous,
      created_at,
      updated_at
    )
    values (
      demo_user.id,
      resolved_instance_id,
      'authenticated',
      'authenticated',
      demo_user.email,
      crypt('ClinivaDemo!23', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', demo_user.full_name,
        'role', demo_user.role,
        'phone', demo_user.phone
      ),
      '',
      '',
      '',
      '',
      '',
      0,
      '',
      false,
      null,
      false,
      now(),
      now()
    )
    on conflict (id) do update set
      instance_id = excluded.instance_id,
      aud = excluded.aud,
      role = excluded.role,
      email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      raw_app_meta_data = excluded.raw_app_meta_data,
      raw_user_meta_data = excluded.raw_user_meta_data,
      confirmation_token = excluded.confirmation_token,
      recovery_token = excluded.recovery_token,
      email_change_token_new = excluded.email_change_token_new,
      email_change = excluded.email_change,
      email_change_token_current = excluded.email_change_token_current,
      email_change_confirm_status = excluded.email_change_confirm_status,
      reauthentication_token = excluded.reauthentication_token,
      is_sso_user = excluded.is_sso_user,
      deleted_at = excluded.deleted_at,
      is_anonymous = excluded.is_anonymous,
      updated_at = now();

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      demo_user.id,
      jsonb_build_object(
        'sub', demo_user.id,
        'email', demo_user.email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      demo_user.email,
      now(),
      now()
    );
  end loop;
end $$;
