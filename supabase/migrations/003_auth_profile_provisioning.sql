-- 003_auth_profile_provisioning.sql
create or replace function public.provision_user_profile(p_auth_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_user auth.users%rowtype;
  v_org_id uuid;
  v_role public.app_role := 'patient'::public.app_role;
  v_slug text;
  v_org_name text;
  v_first_name text := '';
  v_last_name text := '';
begin
  select *
  into v_auth_user
  from auth.users
  where id = p_auth_user_id;

  if not found then
    return;
  end if;

  if exists (select 1 from public.users u where u.id = v_auth_user.id) then
    return;
  end if;

  if v_auth_user.raw_user_meta_data ? 'organization_id' then
    begin
      v_org_id := (v_auth_user.raw_user_meta_data ->> 'organization_id')::uuid;
    exception when others then
      v_org_id := null;
    end;
  end if;

  if v_auth_user.raw_user_meta_data ? 'role' then
    begin
      v_role := (v_auth_user.raw_user_meta_data ->> 'role')::public.app_role;
    exception when others then
      v_role := 'patient'::public.app_role;
    end;
  end if;

  v_first_name := coalesce(v_auth_user.raw_user_meta_data ->> 'first_name', '');
  v_last_name := coalesce(v_auth_user.raw_user_meta_data ->> 'last_name', '');

  if v_org_id is null then
    v_org_name := coalesce(nullif(v_auth_user.raw_user_meta_data ->> 'organization_name', ''), split_part(coalesce(v_auth_user.email, 'user'), '@', 1) || ' health');
    v_slug := regexp_replace(lower(v_org_name), '[^a-z0-9]+', '-', 'g');
    v_slug := trim(both '-' from v_slug);
    if v_slug = '' then
      v_slug := 'org';
    end if;
    v_slug := v_slug || '-' || substr(v_auth_user.id::text, 1, 8);

    insert into public.organizations (name, slug)
    values (v_org_name, v_slug)
    returning id into v_org_id;
  else
    if not exists (select 1 from public.organizations o where o.id = v_org_id) then
      v_org_name := split_part(coalesce(v_auth_user.email, 'user'), '@', 1) || ' health';
      v_slug := regexp_replace(lower(v_org_name), '[^a-z0-9]+', '-', 'g') || '-' || substr(v_auth_user.id::text, 1, 8);
      insert into public.organizations (id, organization_id, name, slug)
      values (v_org_id, v_org_id, v_org_name, v_slug)
      on conflict (id) do nothing;
    end if;
  end if;

  insert into public.users (id, organization_id, email, first_name, last_name, role, is_active)
  values (
    v_auth_user.id,
    v_org_id,
    coalesce(v_auth_user.email, ''),
    v_first_name,
    v_last_name,
    v_role,
    true
  )
  on conflict (id) do update
  set
    organization_id = excluded.organization_id,
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    role = excluded.role,
    is_active = true,
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform public.provision_user_profile(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

do $$
declare
  r record;
begin
  for r in
    select au.id
    from auth.users au
    where not exists (select 1 from public.users pu where pu.id = au.id)
  loop
    perform public.provision_user_profile(r.id);
  end loop;
end $$;
