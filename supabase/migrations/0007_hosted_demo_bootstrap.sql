-- Hosted demo bootstrap
-- Purpose: populate the currently connected Supabase project with stable
-- patient, provider, and admin demo data for MVP testing.
--
-- Run this in Supabase SQL Editor after manually creating these auth users
-- in Authentication > Users and confirming their emails:
--   ava.thompson@cliniva.com
--   ethan.parker@cliniva.com
--   maya.collins@cliniva.com
--   olivia.carter@cliniva.com
--   noah.bennett@cliniva.com
--   sophia.reed@cliniva.com
--
-- Recommended password for all demo users:
--   ClinivaDemo!23

do $$
declare
  admin_id uuid;
  ethan_id uuid;
  maya_id uuid;
  olivia_id uuid;
  noah_id uuid;
  sophia_id uuid;

  requested_appointment_id uuid;
  confirmed_appointment_id uuid;
  completed_appointment_id uuid;
begin
  select id into admin_id from auth.users where email = 'ava.thompson@cliniva.com' limit 1;
  select id into ethan_id from auth.users where email = 'ethan.parker@cliniva.com' limit 1;
  select id into maya_id from auth.users where email = 'maya.collins@cliniva.com' limit 1;
  select id into olivia_id from auth.users where email = 'olivia.carter@cliniva.com' limit 1;
  select id into noah_id from auth.users where email = 'noah.bennett@cliniva.com' limit 1;
  select id into sophia_id from auth.users where email = 'sophia.reed@cliniva.com' limit 1;

  if admin_id is null or ethan_id is null or maya_id is null
     or olivia_id is null or noah_id is null or sophia_id is null then
    raise exception 'One or more demo auth users are missing. Create them first in Authentication > Users.';
  end if;

  insert into profiles (id, role, full_name, email, phone)
  values
    (admin_id, 'admin', 'Ava Thompson', 'ava.thompson@cliniva.com', '+1-415-555-0130'),
    (ethan_id, 'provider', 'Dr. Ethan Parker', 'ethan.parker@cliniva.com', '+1-212-555-0174'),
    (maya_id, 'provider', 'Dr. Maya Collins', 'maya.collins@cliniva.com', '+1-617-555-0182'),
    (olivia_id, 'patient', 'Olivia Carter', 'olivia.carter@cliniva.com', '+1-312-555-0191'),
    (noah_id, 'patient', 'Noah Bennett', 'noah.bennett@cliniva.com', '+1-206-555-0146'),
    (sophia_id, 'patient', 'Sophia Reed', 'sophia.reed@cliniva.com', '+1-646-555-0168')
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  insert into provider_profiles (user_id, specialty, license_number, years_experience, bio)
  values
    (
      ethan_id,
      'Primary Care',
      'CA-PCM-34821',
      12,
      'Board-certified primary care physician focused on preventive medicine and chronic care.'
    ),
    (
      maya_id,
      'Mental Health',
      'MA-MH-55910',
      9,
      'Licensed mental health provider specializing in anxiety, depression, and stress management.'
    )
  on conflict (user_id) do update set
    specialty = excluded.specialty,
    license_number = excluded.license_number,
    years_experience = excluded.years_experience,
    bio = excluded.bio,
    updated_at = now();

  insert into patient_profiles (user_id, date_of_birth, gender, address, emergency_contact)
  values
    (
      olivia_id,
      '1991-04-12',
      'female',
      '1841 Market St, San Francisco, CA',
      jsonb_build_object(
        'name', 'Daniel Carter',
        'phone', '+1-415-555-0101',
        'relationship', 'spouse'
      )
    ),
    (
      noah_id,
      '1987-11-02',
      'male',
      '420 Pine St, Seattle, WA',
      jsonb_build_object(
        'name', 'Claire Bennett',
        'phone', '+1-206-555-0123',
        'relationship', 'spouse'
      )
    ),
    (
      sophia_id,
      '1995-08-23',
      'female',
      '88 Madison Ave, New York, NY',
      jsonb_build_object(
        'name', 'Robert Reed',
        'phone', '+1-212-555-0108',
        'relationship', 'father'
      )
    )
  on conflict (user_id) do update set
    date_of_birth = excluded.date_of_birth,
    gender = excluded.gender,
    address = excluded.address,
    emergency_contact = excluded.emergency_contact,
    updated_at = now();

  insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
  select ethan_id, 1, '09:00', '12:00', 'America/Los_Angeles'
  where not exists (
    select 1 from provider_availability
    where provider_user_id = ethan_id and day_of_week = 1 and start_time = '09:00' and end_time = '12:00'
  );

  insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
  select ethan_id, 3, '13:00', '17:00', 'America/Los_Angeles'
  where not exists (
    select 1 from provider_availability
    where provider_user_id = ethan_id and day_of_week = 3 and start_time = '13:00' and end_time = '17:00'
  );

  insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
  select maya_id, 2, '10:00', '14:00', 'America/New_York'
  where not exists (
    select 1 from provider_availability
    where provider_user_id = maya_id and day_of_week = 2 and start_time = '10:00' and end_time = '14:00'
  );

  insert into provider_availability (provider_user_id, day_of_week, start_time, end_time, timezone)
  select maya_id, 4, '09:00', '12:00', 'America/New_York'
  where not exists (
    select 1 from provider_availability
    where provider_user_id = maya_id and day_of_week = 4 and start_time = '09:00' and end_time = '12:00'
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
    olivia_id,
    ethan_id,
    'requested',
    '2026-04-10 10:00:00+00',
    '2026-04-10 10:30:00+00',
    'Seasonal allergies consultation',
    'Patient would like guidance on symptoms and medication options.'
  where not exists (
    select 1 from appointments
    where patient_user_id = olivia_id
      and provider_user_id = ethan_id
      and start_at = '2026-04-10 10:00:00+00'
      and end_at = '2026-04-10 10:30:00+00'
  );

  select id into requested_appointment_id
  from appointments
  where patient_user_id = olivia_id
    and provider_user_id = ethan_id
    and start_at = '2026-04-10 10:00:00+00'
    and end_at = '2026-04-10 10:30:00+00'
  limit 1;

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
    sophia_id,
    ethan_id,
    'confirmed',
    '2026-04-15 17:00:00+00',
    '2026-04-15 17:30:00+00',
    'Annual wellness visit',
    'Discuss preventive care and routine labs.'
  where not exists (
    select 1 from appointments
    where patient_user_id = sophia_id
      and provider_user_id = ethan_id
      and start_at = '2026-04-15 17:00:00+00'
      and end_at = '2026-04-15 17:30:00+00'
  );

  select id into confirmed_appointment_id
  from appointments
  where patient_user_id = sophia_id
    and provider_user_id = ethan_id
    and start_at = '2026-04-15 17:00:00+00'
    and end_at = '2026-04-15 17:30:00+00'
  limit 1;

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
    noah_id,
    maya_id,
    'completed',
    '2026-03-01 14:00:00+00',
    '2026-03-01 14:45:00+00',
    'Follow-up for anxiety management',
    'Review progress and adjust coping plan.'
  where not exists (
    select 1 from appointments
    where patient_user_id = noah_id
      and provider_user_id = maya_id
      and start_at = '2026-03-01 14:00:00+00'
      and end_at = '2026-03-01 14:45:00+00'
  );

  select id into completed_appointment_id
  from appointments
  where patient_user_id = noah_id
    and provider_user_id = maya_id
    and start_at = '2026-03-01 14:00:00+00'
    and end_at = '2026-03-01 14:45:00+00'
  limit 1;

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
    completed_appointment_id,
    noah_id,
    maya_id,
    'completed',
    'demo-room-001',
    '/consultations/' || completed_appointment_id::text,
    '2026-03-01 14:00:00+00',
    '2026-03-01 14:45:00+00'
  where not exists (
    select 1 from consultation_sessions
    where appointment_id = completed_appointment_id
  );

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
    completed_appointment_id,
    noah_id,
    maya_id,
    'Patient reports improved sleep and reduced daytime anxiety over the last two weeks.',
    'Affect stable, normal speech, no acute distress noted.',
    'Generalized anxiety disorder, improving with current plan.',
    'Continue current techniques, add 10-minute daily mindfulness practice, follow up in 4 weeks.',
    true
  where not exists (
    select 1 from soap_notes
    where appointment_id = completed_appointment_id
  );

  insert into notifications (user_id, type, title, body)
  select olivia_id, 'appointment', 'Appointment request received', 'Your appointment request has been sent to the provider and is awaiting review.'
  where not exists (
    select 1 from notifications where user_id = olivia_id and title = 'Appointment request received'
  );

  insert into notifications (user_id, type, title, body)
  select sophia_id, 'appointment', 'Appointment confirmed', 'Your upcoming wellness visit is confirmed and visible in your dashboard.'
  where not exists (
    select 1 from notifications where user_id = sophia_id and title = 'Appointment confirmed'
  );

  insert into notifications (user_id, type, title, body)
  select noah_id, 'note', 'Consultation summary available', 'Your provider shared a SOAP note from the completed follow-up visit.'
  where not exists (
    select 1 from notifications where user_id = noah_id and title = 'Consultation summary available'
  );

  insert into notifications (user_id, type, title, body)
  select ethan_id, 'appointment', 'New appointment request', 'A patient has requested a seasonal allergies consultation and is waiting for provider review.'
  where not exists (
    select 1 from notifications where user_id = ethan_id and title = 'New appointment request'
  );

  insert into notifications (user_id, type, title, body)
  select maya_id, 'consultation', 'Completed visit documented', 'A completed mental-health follow-up with a shared SOAP note is available in your recent activity.'
  where not exists (
    select 1 from notifications where user_id = maya_id and title = 'Completed visit documented'
  );

  insert into notifications (user_id, type, title, body)
  select admin_id, 'system', 'Demo environment ready', 'Admin seed data has been loaded for dashboard review.'
  where not exists (
    select 1 from notifications where user_id = admin_id and title = 'Demo environment ready'
  );

  insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  select admin_id, 'seed.created', 'system', null, jsonb_build_object('seed', 'hosted-demo-bootstrap')
  where not exists (
    select 1 from audit_logs
    where actor_user_id = admin_id
      and action = 'seed.created'
      and entity_type = 'system'
  );

  insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  select admin_id, 'provider.reviewed', 'provider_profile', ethan_id, jsonb_build_object('note', 'Seeded provider roster review')
  where not exists (
    select 1 from audit_logs
    where actor_user_id = admin_id
      and action = 'provider.reviewed'
      and entity_type = 'provider_profile'
      and entity_id = ethan_id
  );

  insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  select admin_id, 'appointment.monitored', 'appointment', requested_appointment_id, jsonb_build_object('scope', 'admin_dashboard')
  where not exists (
    select 1 from audit_logs
    where actor_user_id = admin_id
      and action = 'appointment.monitored'
      and entity_type = 'appointment'
      and entity_id = requested_appointment_id
  );

  insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  select admin_id, 'appointment.monitored', 'appointment', confirmed_appointment_id, jsonb_build_object('scope', 'admin_dashboard')
  where not exists (
    select 1 from audit_logs
    where actor_user_id = admin_id
      and action = 'appointment.monitored'
      and entity_type = 'appointment'
      and entity_id = confirmed_appointment_id
  );
end $$;
