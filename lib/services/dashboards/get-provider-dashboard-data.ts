import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import {
  buildNameMap,
  safeCount,
} from "@/lib/services/dashboards/dashboard-service-utils";
import { getUserNotifications } from "@/lib/services/notifications/get-user-notifications";
import type {
  ProviderAvailabilityBlock,
  ProviderDashboardAppointment,
  ProviderDashboardData,
  ProviderDashboardNote,
} from "@/types/domain/dashboard";

type ProviderProfileRow = {
  specialty: string | null;
  license_number: string | null;
  years_experience: number | null;
};

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  status: string;
  start_at: string;
  end_at: string;
  reason: string | null;
};

type NoteRow = {
  id: string;
  patient_user_id: string;
  assessment: string | null;
  plan: string | null;
  created_at: string;
  is_shared_with_patient: boolean;
};

type AvailabilityRow = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
};

export async function getProviderDashboardData(): Promise<ProviderDashboardData> {
  const { supabase, profile } = await requireAuthProfile("provider");
  const now = new Date();
  const nowIso = now.toISOString();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  ).toISOString();

  const [
    { data: providerProfile },
    { data: appointmentRows },
    { data: noteRows },
    { data: availabilityRows },
    { count: todayAppointmentsCount },
    { count: activeQueueCount },
    { count: notesCreatedCount },
    notificationData,
  ] = await Promise.all([
    supabase
      .from("provider_profiles")
      .select("specialty, license_number, years_experience")
      .eq("user_id", profile.id)
      .maybeSingle<ProviderProfileRow>(),
    supabase
      .from("appointments")
      .select("id, patient_user_id, status, start_at, end_at, reason")
      .eq("provider_user_id", profile.id)
      .gte("start_at", nowIso)
      .neq("status", "cancelled")
      .order("start_at", { ascending: true })
      .limit(6)
      .returns<AppointmentRow[]>(),
    supabase
      .from("soap_notes")
      .select("id, patient_user_id, assessment, plan, created_at, is_shared_with_patient")
      .eq("provider_user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(4)
      .returns<NoteRow[]>(),
    supabase
      .from("provider_availability")
      .select("id, day_of_week, start_time, end_time, timezone")
      .eq("provider_user_id", profile.id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true })
      .returns<AvailabilityRow[]>(),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("provider_user_id", profile.id)
      .gte("start_at", startOfToday)
      .lt("start_at", startOfTomorrow)
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("provider_user_id", profile.id)
      .gte("start_at", nowIso)
      .in("status", ["requested", "confirmed"]),
    supabase
      .from("soap_notes")
      .select("id", { count: "exact", head: true })
      .eq("provider_user_id", profile.id),
    getUserNotifications(supabase, profile.id, { limit: 6 }),
  ]);

  const patientIds = Array.from(
    new Set(
      [...(appointmentRows ?? []), ...(noteRows ?? [])].map((row) => row.patient_user_id)
    )
  );

  let patientNameMap = new Map<string, string>();

  if (patientIds.length > 0) {
    const { data: patientRows } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", patientIds)
      .returns<Array<{ id: string; full_name: string | null }>>();

    patientNameMap = buildNameMap(patientRows, "Assigned patient");
  }

  const upcomingAppointments: ProviderDashboardAppointment[] = (appointmentRows ?? []).map(
    (row) => ({
      id: row.id,
      patientName: patientNameMap.get(row.patient_user_id) ?? "Assigned patient",
      status: row.status,
      startAt: row.start_at,
      endAt: row.end_at,
      reason: row.reason,
    })
  );

  const recentNotes: ProviderDashboardNote[] = (noteRows ?? []).map((row) => ({
    id: row.id,
    patientName: patientNameMap.get(row.patient_user_id) ?? "Patient record",
    assessment: row.assessment,
    plan: row.plan,
    createdAt: row.created_at,
    isSharedWithPatient: row.is_shared_with_patient,
  }));

  const availability: ProviderAvailabilityBlock[] = (availabilityRows ?? []).map((row) => ({
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
  }));

  return {
    user: profile,
    specialty: providerProfile?.specialty ?? null,
    licenseNumber: providerProfile?.license_number ?? null,
    yearsExperience: providerProfile?.years_experience ?? null,
    todayAppointmentsCount: safeCount(todayAppointmentsCount),
    activeQueueCount: safeCount(activeQueueCount),
    notesCreatedCount: safeCount(notesCreatedCount),
    availabilityBlocksCount: availability.length,
    unreadNotificationsCount: notificationData.unreadCount,
    upcomingAppointments,
    recentNotes,
    availability,
    notifications: notificationData.notifications,
  };
}
