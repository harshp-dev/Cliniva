-- Migration: 0004_dashboard_access_policies
-- Purpose: Allow dashboard-safe related profile reads through appointment links.

create policy profiles_select_related_appointments on profiles
  for select using (
    exists (
      select 1
      from appointments
      where (
        appointments.patient_user_id = auth.uid()
        and appointments.provider_user_id = profiles.id
      ) or (
        appointments.provider_user_id = auth.uid()
        and appointments.patient_user_id = profiles.id
      )
    )
  );

create policy provider_profiles_select_patient_context on provider_profiles
  for select using (
    exists (
      select 1
      from appointments
      where appointments.patient_user_id = auth.uid()
        and appointments.provider_user_id = provider_profiles.user_id
    )
  );

