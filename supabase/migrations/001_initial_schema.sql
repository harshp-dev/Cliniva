-- 001_initial_schema.sql
create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'provider', 'staff', 'patient');
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.claim_status as enum ('submitted', 'in_review', 'approved', 'denied', 'paid');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, key)
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, email)
);

create table if not exists public.insurance_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  payer_name text not null,
  plan_type text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  insurance_plan_id uuid references public.insurance_plans(id) on delete set null,
  mrn text not null,
  date_of_birth date,
  phone text,
  emergency_contact jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, mrn)
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  npi_number text not null,
  specialty text not null,
  availability jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  reason text,
  meeting_room text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  record_type text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  note_type text not null default 'SOAP',
  subjective text,
  objective text,
  assessment text,
  plan text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  rxnorm_code text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete restrict,
  dosage text not null,
  frequency text not null,
  duration_days integer not null,
  start_date date not null default current_date,
  end_date date,
  notes text,
  discontinued_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.allergies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  allergen text not null,
  reaction text,
  severity text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vital_signs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_by uuid references public.providers(id) on delete set null,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  respiratory_rate integer,
  temperature_c numeric(4,2),
  oxygen_saturation numeric(5,2),
  recorded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  icd10_code text,
  description text not null,
  status text,
  diagnosed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  cpt_code text,
  description text,
  performed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lab_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  test_name text not null,
  status text not null default 'ordered',
  ordered_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lab_order_id uuid not null references public.lab_orders(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  result_value text,
  reference_range text,
  status text,
  reported_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  goal text not null,
  interventions text,
  status text not null default 'active',
  target_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  channel text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  delivery_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  file_path text not null,
  file_type text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  insurance_plan_id uuid not null references public.insurance_plans(id) on delete restrict,
  status public.claim_status not null default 'submitted',
  amount_cents integer not null,
  payer_reference text,
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_org on public.users(organization_id);
create index if not exists idx_patients_org on public.patients(organization_id);
create index if not exists idx_providers_org on public.providers(organization_id);
create index if not exists idx_appointments_org_start on public.appointments(organization_id, starts_at desc);
create index if not exists idx_medical_records_org on public.medical_records(organization_id);
create index if not exists idx_messages_org on public.messages(organization_id, created_at desc);
create index if not exists idx_notifications_org on public.notifications(organization_id, created_at desc);
create index if not exists idx_claims_org on public.claims(organization_id, status);
create index if not exists idx_payments_org on public.payments(organization_id, created_at desc);
create index if not exists idx_audit_logs_org on public.audit_logs(organization_id, created_at desc);

create or replace function public.set_organization_id_for_organization()
returns trigger
language plpgsql
as $$
begin
  if new.organization_id is null then
    new.organization_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_set_org_id on public.organizations;
create trigger organizations_set_org_id
before insert on public.organizations
for each row execute function public.set_organization_id_for_organization();

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
    execute format('drop trigger if exists %I_set_updated_at on public.%I;', tbl, tbl);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at();', tbl, tbl);
    execute format('alter table public.%I enable row level security;', tbl);
  end loop;
end $$;
