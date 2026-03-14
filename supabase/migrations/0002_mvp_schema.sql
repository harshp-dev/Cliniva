-- Migration: 0002_mvp_schema
-- Purpose: Core MVP schema with RLS, enums, and audit-friendly structure.

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('patient', 'provider', 'admin');
create type appointment_status as enum ('requested', 'confirmed', 'cancelled', 'completed', 'no_show');
create type consultation_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type notification_type as enum ('system', 'appointment', 'consultation', 'note', 'message');

-- Utility: updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles (one per auth user)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'patient',
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

-- Patient profiles
create table if not exists patient_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create trigger patient_profiles_set_updated_at
before update on patient_profiles
for each row execute function set_updated_at();

-- Provider profiles
create table if not exists provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  specialty text,
  license_number text,
  years_experience int,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create trigger provider_profiles_set_updated_at
before update on provider_profiles
for each row execute function set_updated_at();

-- Provider availability
create table if not exists provider_availability (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists provider_availability_provider_idx
  on provider_availability(provider_user_id);

create trigger provider_availability_set_updated_at
before update on provider_availability
for each row execute function set_updated_at();

-- Appointments
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  status appointment_status not null default 'requested',
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists appointments_patient_idx
  on appointments(patient_user_id, start_at);
create index if not exists appointments_provider_idx
  on appointments(provider_user_id, start_at);

create trigger appointments_set_updated_at
before update on appointments
for each row execute function set_updated_at();

-- Consultation sessions
create table if not exists consultation_sessions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  status consultation_status not null default 'scheduled',
  room_id text,
  room_url text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultation_sessions_appointment_idx
  on consultation_sessions(appointment_id);
create index if not exists consultation_sessions_patient_idx
  on consultation_sessions(patient_user_id);
create index if not exists consultation_sessions_provider_idx
  on consultation_sessions(provider_user_id);

create trigger consultation_sessions_set_updated_at
before update on consultation_sessions
for each row execute function set_updated_at();

-- SOAP notes
create table if not exists soap_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  subjective text,
  objective text,
  assessment text,
  plan text,
  is_shared_with_patient boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists soap_notes_appointment_idx
  on soap_notes(appointment_id);
create index if not exists soap_notes_patient_idx
  on soap_notes(patient_user_id);
create index if not exists soap_notes_provider_idx
  on soap_notes(provider_user_id);

create trigger soap_notes_set_updated_at
before update on soap_notes
for each row execute function set_updated_at();

-- Patient intake forms
create table if not exists patient_intake_forms (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  form_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patient_intake_forms_patient_idx
  on patient_intake_forms(patient_user_id);

create trigger patient_intake_forms_set_updated_at
before update on patient_intake_forms
for each row execute function set_updated_at();

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null default 'system',
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on notifications(user_id, created_at desc);

create trigger notifications_set_updated_at
before update on notifications
for each row execute function set_updated_at();

-- Audit logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx
  on audit_logs(actor_user_id, created_at desc);
create index if not exists audit_logs_entity_idx
  on audit_logs(entity_type, entity_id);

-- RLS
alter table profiles enable row level security;
alter table patient_profiles enable row level security;
alter table provider_profiles enable row level security;
alter table provider_availability enable row level security;
alter table appointments enable row level security;
alter table consultation_sessions enable row level security;
alter table soap_notes enable row level security;
alter table patient_intake_forms enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- Helper: admin check
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$ language sql stable;

-- Profiles policies
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or is_admin());
create policy profiles_insert_own on profiles
  for insert with check (id = auth.uid() or is_admin());
create policy profiles_update_own on profiles
  for update using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

-- Patient profiles policies
create policy patient_profiles_select on patient_profiles
  for select using (user_id = auth.uid() or is_admin());
create policy patient_profiles_insert on patient_profiles
  for insert with check (user_id = auth.uid() or is_admin());
create policy patient_profiles_update on patient_profiles
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- Provider profiles policies
create policy provider_profiles_select on provider_profiles
  for select using (user_id = auth.uid() or is_admin());
create policy provider_profiles_insert on provider_profiles
  for insert with check (user_id = auth.uid() or is_admin());
create policy provider_profiles_update on provider_profiles
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- Provider availability policies
create policy provider_availability_select on provider_availability
  for select using (provider_user_id = auth.uid() or is_admin());
create policy provider_availability_insert on provider_availability
  for insert with check (provider_user_id = auth.uid() or is_admin());
create policy provider_availability_update on provider_availability
  for update using (provider_user_id = auth.uid() or is_admin())
  with check (provider_user_id = auth.uid() or is_admin());
create policy provider_availability_delete on provider_availability
  for delete using (provider_user_id = auth.uid() or is_admin());

-- Appointments policies
create policy appointments_select on appointments
  for select using (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy appointments_insert on appointments
  for insert with check (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy appointments_update on appointments
  for update using (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  )
  with check (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy appointments_delete on appointments
  for delete using (is_admin());

-- Consultation sessions policies
create policy consultation_sessions_select on consultation_sessions
  for select using (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy consultation_sessions_insert on consultation_sessions
  for insert with check (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy consultation_sessions_update on consultation_sessions
  for update using (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  )
  with check (
    patient_user_id = auth.uid() or
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy consultation_sessions_delete on consultation_sessions
  for delete using (is_admin());

-- SOAP notes policies
create policy soap_notes_select on soap_notes
  for select using (
    provider_user_id = auth.uid() or
    (patient_user_id = auth.uid() and is_shared_with_patient = true) or
    is_admin()
  );
create policy soap_notes_insert on soap_notes
  for insert with check (
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy soap_notes_update on soap_notes
  for update using (
    provider_user_id = auth.uid() or
    is_admin()
  )
  with check (
    provider_user_id = auth.uid() or
    is_admin()
  );
create policy soap_notes_delete on soap_notes
  for delete using (is_admin());

-- Patient intake forms policies
create policy patient_intake_forms_select on patient_intake_forms
  for select using (patient_user_id = auth.uid() or is_admin());
create policy patient_intake_forms_insert on patient_intake_forms
  for insert with check (patient_user_id = auth.uid() or is_admin());
create policy patient_intake_forms_update on patient_intake_forms
  for update using (patient_user_id = auth.uid() or is_admin())
  with check (patient_user_id = auth.uid() or is_admin());
create policy patient_intake_forms_delete on patient_intake_forms
  for delete using (is_admin());

-- Notifications policies
create policy notifications_select on notifications
  for select using (user_id = auth.uid() or is_admin());
create policy notifications_insert on notifications
  for insert with check (user_id = auth.uid() or is_admin());
create policy notifications_update on notifications
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());
create policy notifications_delete on notifications
  for delete using (is_admin());

-- Audit logs policies
create policy audit_logs_select on audit_logs
  for select using (is_admin());
create policy audit_logs_insert on audit_logs
  for insert with check (is_admin());
