-- Seed: 0001_mvp_seed
-- Purpose: Demo users and core MVP data with realistic names and emails.

-- Password used for all demo accounts in local/dev environments.
-- Change in non-local environments.
-- Password: ClinivaDemo!23

-- IDs (stable for repeatable seeds)
-- Admin:    11111111-1111-1111-1111-111111111111
-- Provider: 22222222-2222-2222-2222-222222222222
-- Provider: 33333333-3333-3333-3333-333333333333
-- Patient:  44444444-4444-4444-4444-444444444444
-- Patient:  55555555-5555-5555-5555-555555555555
-- Patient:  66666666-6666-6666-6666-666666666666

-- Admin user
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ava.thompson@cliniva.com',
  crypt('ClinivaDemo!23', gen_salt('bf')),
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  '',
  0,
  '',
  null,
  false,
  null,
  false,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  confirmation_token = excluded.confirmation_token,
  confirmation_sent_at = excluded.confirmation_sent_at,
  recovery_token = excluded.recovery_token,
  recovery_sent_at = excluded.recovery_sent_at,
  email_change_token_new = excluded.email_change_token_new,
  email_change = excluded.email_change,
  email_change_sent_at = excluded.email_change_sent_at,
  email_change_token_current = excluded.email_change_token_current,
  email_change_confirm_status = excluded.email_change_confirm_status,
  reauthentication_token = excluded.reauthentication_token,
  reauthentication_sent_at = excluded.reauthentication_sent_at,
  is_sso_user = excluded.is_sso_user,
  deleted_at = excluded.deleted_at,
  is_anonymous = excluded.is_anonymous,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111'::uuid, 'email', 'ava.thompson@cliniva.com'),
  'email',
  'ava.thompson@cliniva.com',
  now(),
  now()
)
on conflict do nothing;

insert into profiles (id, role, full_name, email, phone)
values ('11111111-1111-1111-1111-111111111111'::uuid, 'admin', 'Ava Thompson', 'ava.thompson@cliniva.com', '+1-415-555-0130')
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone;

-- Providers
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ethan.parker@cliniva.com',
  crypt('ClinivaDemo!23', gen_salt('bf')),
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  '',
  0,
  '',
  null,
  false,
  null,
  false,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
), (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'maya.collins@cliniva.com',
  crypt('ClinivaDemo!23', gen_salt('bf')),
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  '',
  0,
  '',
  null,
  false,
  null,
  false,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  confirmation_token = excluded.confirmation_token,
  confirmation_sent_at = excluded.confirmation_sent_at,
  recovery_token = excluded.recovery_token,
  recovery_sent_at = excluded.recovery_sent_at,
  email_change_token_new = excluded.email_change_token_new,
  email_change = excluded.email_change,
  email_change_sent_at = excluded.email_change_sent_at,
  email_change_token_current = excluded.email_change_token_current,
  email_change_confirm_status = excluded.email_change_confirm_status,
  reauthentication_token = excluded.reauthentication_token,
  reauthentication_sent_at = excluded.reauthentication_sent_at,
  is_sso_user = excluded.is_sso_user,
  deleted_at = excluded.deleted_at,
  is_anonymous = excluded.is_anonymous,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
) values
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222'::uuid,
    jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222'::uuid, 'email', 'ethan.parker@cliniva.com'),
    'email',
    'ethan.parker@cliniva.com',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '33333333-3333-3333-3333-333333333333'::uuid,
    jsonb_build_object('sub', '33333333-3333-3333-3333-333333333333'::uuid, 'email', 'maya.collins@cliniva.com'),
    'email',
    'maya.collins@cliniva.com',
    now(),
    now()
  )
on conflict do nothing;

insert into profiles (id, role, full_name, email, phone)
values
  ('22222222-2222-2222-2222-222222222222'::uuid, 'provider', 'Dr. Ethan Parker', 'ethan.parker@cliniva.com', '+1-212-555-0174'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'provider', 'Dr. Maya Collins', 'maya.collins@cliniva.com', '+1-617-555-0182')
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone;

insert into provider_profiles (user_id, specialty, license_number, years_experience, bio)
values
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Primary Care', 'CA-PCM-34821', 12,
   'Board-certified primary care physician focused on preventive medicine and chronic care.'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Mental Health', 'MA-MH-55910', 9,
   'Licensed mental health provider specializing in anxiety, depression, and stress management.')
on conflict (user_id) do update set
  specialty = excluded.specialty,
  license_number = excluded.license_number,
  years_experience = excluded.years_experience,
  bio = excluded.bio;

-- Patients
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'olivia.carter@cliniva.com',
  crypt('ClinivaDemo!23', gen_salt('bf')),
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  '',
  0,
  '',
  null,
  false,
  null,
  false,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
), (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'noah.bennett@cliniva.com',
  crypt('ClinivaDemo!23', gen_salt('bf')),
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  '',
  0,
  '',
  null,
  false,
  null,
  false,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
), (
  '66666666-6666-6666-6666-666666666666'::uuid,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia.reed@cliniva.com',
  crypt('ClinivaDemo!23', gen_salt('bf')),
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  '',
  0,
  '',
  null,
  false,
  null,
  false,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  confirmation_token = excluded.confirmation_token,
  confirmation_sent_at = excluded.confirmation_sent_at,
  recovery_token = excluded.recovery_token,
  recovery_sent_at = excluded.recovery_sent_at,
  email_change_token_new = excluded.email_change_token_new,
  email_change = excluded.email_change,
  email_change_sent_at = excluded.email_change_sent_at,
  email_change_token_current = excluded.email_change_token_current,
  email_change_confirm_status = excluded.email_change_confirm_status,
  reauthentication_token = excluded.reauthentication_token,
  reauthentication_sent_at = excluded.reauthentication_sent_at,
  is_sso_user = excluded.is_sso_user,
  deleted_at = excluded.deleted_at,
  is_anonymous = excluded.is_anonymous,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
) values
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444'::uuid,
    jsonb_build_object('sub', '44444444-4444-4444-4444-444444444444'::uuid, 'email', 'olivia.carter@cliniva.com'),
    'email',
    'olivia.carter@cliniva.com',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555'::uuid,
    jsonb_build_object('sub', '55555555-5555-5555-5555-555555555555'::uuid, 'email', 'noah.bennett@cliniva.com'),
    'email',
    'noah.bennett@cliniva.com',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666'::uuid,
    jsonb_build_object('sub', '66666666-6666-6666-6666-666666666666'::uuid, 'email', 'sophia.reed@cliniva.com'),
    'email',
    'sophia.reed@cliniva.com',
    now(),
    now()
  )
on conflict do nothing;

insert into profiles (id, role, full_name, email, phone)
values
  ('44444444-4444-4444-4444-444444444444'::uuid, 'patient', 'Olivia Carter', 'olivia.carter@cliniva.com', '+1-312-555-0191'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'patient', 'Noah Bennett', 'noah.bennett@cliniva.com', '+1-206-555-0146'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'patient', 'Sophia Reed', 'sophia.reed@cliniva.com', '+1-646-555-0168')
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone;

insert into patient_profiles (user_id, date_of_birth, gender, address, emergency_contact)
values
  ('44444444-4444-4444-4444-444444444444'::uuid, '1991-04-12', 'female', '1841 Market St, San Francisco, CA',
   '{"name": "Daniel Carter", "phone": "+1-415-555-0101", "relationship": "spouse"}'::jsonb),
  ('55555555-5555-5555-5555-555555555555'::uuid, '1987-11-02', 'male', '420 Pine St, Seattle, WA',
   '{"name": "Claire Bennett", "phone": "+1-206-555-0123", "relationship": "spouse"}'::jsonb),
  ('66666666-6666-6666-6666-666666666666'::uuid, '1995-08-23', 'female', '88 Madison Ave, New York, NY',
   '{"name": "Robert Reed", "phone": "+1-212-555-0108", "relationship": "father"}'::jsonb)
on conflict (user_id) do update set
  date_of_birth = excluded.date_of_birth,
  gender = excluded.gender,
  address = excluded.address,
  emergency_contact = excluded.emergency_contact;

-- Provider availability (idempotent inserts)
insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
select '22222222-2222-2222-2222-222222222222'::uuid, 1, '09:00', '12:00', 'America/Los_Angeles'
where not exists (
  select 1 from provider_availability
  where provider_user_id = '22222222-2222-2222-2222-222222222222'::uuid
    and day_of_week = 1
    and start_time = '09:00'
    and end_time = '12:00'
    and timezone = 'America/Los_Angeles'
);

insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
select '22222222-2222-2222-2222-222222222222'::uuid, 3, '13:00', '17:00', 'America/Los_Angeles'
where not exists (
  select 1 from provider_availability
  where provider_user_id = '22222222-2222-2222-2222-222222222222'::uuid
    and day_of_week = 3
    and start_time = '13:00'
    and end_time = '17:00'
    and timezone = 'America/Los_Angeles'
);

insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
select '33333333-3333-3333-3333-333333333333'::uuid, 2, '10:00', '14:00', 'America/New_York'
where not exists (
  select 1 from provider_availability
  where provider_user_id = '33333333-3333-3333-3333-333333333333'::uuid
    and day_of_week = 2
    and start_time = '10:00'
    and end_time = '14:00'
    and timezone = 'America/New_York'
);

insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
select '33333333-3333-3333-3333-333333333333'::uuid, 4, '09:00', '12:00', 'America/New_York'
where not exists (
  select 1 from provider_availability
  where provider_user_id = '33333333-3333-3333-3333-333333333333'::uuid
    and day_of_week = 4
    and start_time = '09:00'
    and end_time = '12:00'
    and timezone = 'America/New_York'
);

-- Appointments (fixed timestamps for idempotency)
insert into appointments (
  patient_user_id,
  provider_user_id,
  status,
  start_at,
  end_at,
  reason,
  notes
)
select
  '44444444-4444-4444-4444-444444444444'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'confirmed',
  '2026-04-10 10:00:00+00',
  '2026-04-10 10:30:00+00',
  'Annual wellness visit',
  'Discuss preventive care and routine labs.'
where not exists (
  select 1 from appointments
  where patient_user_id = '44444444-4444-4444-4444-444444444444'::uuid
    and provider_user_id = '22222222-2222-2222-2222-222222222222'::uuid
    and start_at = '2026-04-10 10:00:00+00'
    and end_at = '2026-04-10 10:30:00+00'
);

insert into appointments (
  patient_user_id,
  provider_user_id,
  status,
  start_at,
  end_at,
  reason,
  notes
)
select
  '55555555-5555-5555-5555-555555555555'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'completed',
  '2026-03-01 14:00:00+00',
  '2026-03-01 14:45:00+00',
  'Follow-up for anxiety management',
  'Review progress and adjust coping plan.'
where not exists (
  select 1 from appointments
  where patient_user_id = '55555555-5555-5555-5555-555555555555'::uuid
    and provider_user_id = '33333333-3333-3333-3333-333333333333'::uuid
    and start_at = '2026-03-01 14:00:00+00'
    and end_at = '2026-03-01 14:45:00+00'
);

-- Consultation session and SOAP note for completed appointment
with target_appt as (
  select id from appointments
  where patient_user_id = '55555555-5555-5555-5555-555555555555'::uuid
    and provider_user_id = '33333333-3333-3333-3333-333333333333'::uuid
    and start_at = '2026-03-01 14:00:00+00'
  limit 1
), inserted_session as (
  insert into consultation_sessions (
    appointment_id,
    patient_user_id,
    provider_user_id,
    status,
    room_id,
    room_url,
    started_at,
    ended_at
  )
  select
    id,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'completed',
    'demo-room-001',
    'https://video.cliniva.com/room/demo-room-001',
    '2026-03-01 13:00:00+00',
    '2026-03-01 13:45:00+00'
  from target_appt
  where not exists (
    select 1 from consultation_sessions where appointment_id = target_appt.id
  )
  returning appointment_id, patient_user_id, provider_user_id
)
insert into soap_notes (
  appointment_id,
  patient_user_id,
  provider_user_id,
  subjective,
  objective,
  assessment,
  plan,
  is_shared_with_patient
)
select
  appointment_id,
  patient_user_id,
  provider_user_id,
  'Patient reports improved sleep and reduced daytime anxiety over the last two weeks.',
  'Affect stable, normal speech, no acute distress noted.',
  'Generalized anxiety disorder, improving with current plan.',
  'Continue current techniques, add 10-minute daily mindfulness practice, follow up in 4 weeks.',
  true
from inserted_session
where not exists (
  select 1 from soap_notes where appointment_id = inserted_session.appointment_id
);

-- Intake forms
insert into patient_intake_forms (patient_user_id, form_data)
select
  '44444444-4444-4444-4444-444444444444'::uuid,
  '{"chief_complaint": "Headaches", "allergies": "None", "medications": "Ibuprofen"}'::jsonb
where not exists (
  select 1 from patient_intake_forms
  where patient_user_id = '44444444-4444-4444-4444-444444444444'::uuid
    and form_data = '{"chief_complaint": "Headaches", "allergies": "None", "medications": "Ibuprofen"}'::jsonb
)
union all
select
  '66666666-6666-6666-6666-666666666666'::uuid,
  '{"chief_complaint": "Stress", "allergies": "Peanuts", "medications": "None"}'::jsonb
where not exists (
  select 1 from patient_intake_forms
  where patient_user_id = '66666666-6666-6666-6666-666666666666'::uuid
    and form_data = '{"chief_complaint": "Stress", "allergies": "Peanuts", "medications": "None"}'::jsonb
);

-- Notifications
insert into notifications (user_id, type, title, body)
select
  '44444444-4444-4444-4444-444444444444'::uuid,
  'appointment'::notification_type,
  'Appointment Confirmed',
  'Your appointment is confirmed for this week.'
where not exists (
  select 1 from notifications
  where user_id = '44444444-4444-4444-4444-444444444444'::uuid
    and title = 'Appointment Confirmed'
)
union all
select
  '55555555-5555-5555-5555-555555555555'::uuid,
  'consultation'::notification_type,
  'Consultation Complete',
  'Your consultation summary is available.'
where not exists (
  select 1 from notifications
  where user_id = '55555555-5555-5555-5555-555555555555'::uuid
    and title = 'Consultation Complete'
)
union all
select
  '66666666-6666-6666-6666-666666666666'::uuid,
  'system'::notification_type,
  'Welcome to Cliniva',
  'Thanks for joining Cliniva. Your profile is ready.'
where not exists (
  select 1 from notifications
  where user_id = '66666666-6666-6666-6666-666666666666'::uuid
    and title = 'Welcome to Cliniva'
)
union all
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  'system'::notification_type,
  'Operations Seed Ready',
  'Admin seed data has been loaded for dashboard review.'
where not exists (
  select 1 from notifications
  where user_id = '11111111-1111-1111-1111-111111111111'::uuid
    and title = 'Operations Seed Ready'
);

-- Audit log
insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  'seed.created',
  'system'::notification_type,
  null,
  '{"seed": "0001_mvp_seed"}'::jsonb
where not exists (
  select 1 from audit_logs
  where actor_user_id = '11111111-1111-1111-1111-111111111111'::uuid
    and action = 'seed.created'
    and metadata = '{"seed": "0001_mvp_seed"}'::jsonb
);

insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  'provider.reviewed',
  'provider_profile',
  '22222222-2222-2222-2222-222222222222'::uuid,
  '{"note": "Seeded provider roster review"}'::jsonb
where not exists (
  select 1 from audit_logs
  where actor_user_id = '11111111-1111-1111-1111-111111111111'::uuid
    and action = 'provider.reviewed'
    and entity_type = 'provider_profile'
    and entity_id = '22222222-2222-2222-2222-222222222222'::uuid
);

insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  'appointment.monitored',
  'appointment',
  appointment_row.id,
  '{"source": "seed", "scope": "admin_dashboard"}'::jsonb
from (
  select id
  from appointments
  where patient_user_id = '44444444-4444-4444-4444-444444444444'::uuid
    and provider_user_id = '22222222-2222-2222-2222-222222222222'::uuid
    and start_at = '2026-04-10 10:00:00+00'
  limit 1
) as appointment_row
where not exists (
  select 1 from audit_logs
  where actor_user_id = '11111111-1111-1111-1111-111111111111'::uuid
    and action = 'appointment.monitored'
    and entity_type = 'appointment'
    and entity_id = appointment_row.id
);


