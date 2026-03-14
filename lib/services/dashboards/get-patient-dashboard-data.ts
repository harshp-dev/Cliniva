import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import {
  buildNameMap,
  safeCount,
} from "@/lib/services/dashboards/dashboard-service-utils";
import { getUserNotifications } from "@/lib/services/notifications/get-user-notifications";
import type {
  PatientDashboardAppointment,
  PatientDashboardData,
  PatientVisitNote,
} from "@/types/domain/dashboard";

type PatientProfileRow = {
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact: Record<string, unknown> | null;
};

type AppointmentRow = {
  id: string;
  provider_user_id: string;
  status: string;
  start_at: string;
  end_at: string;
  reason: string | null;
};

type NoteRow = {
  id: string;
  provider_user_id: string;
  assessment: string | null;
  plan: string | null;
  created_at: string;
};

type ProviderProfileRow = {
  user_id: string;
  specialty: string | null;
};

function calculateCompletionScore(
  phone: string | null,
  patientProfile: PatientProfileRow | null | undefined
) {
  const checks = [
    Boolean(phone),
    Boolean(patientProfile?.date_of_birth),
    Boolean(patientProfile?.gender),
    Boolean(patientProfile?.address),
    Boolean(patientProfile?.emergency_contact),
  ];

  const completeFields = checks.filter(Boolean).length;
  return Math.round((completeFields / checks.length) * 100);
}

export async function getPatientDashboardData(): Promise<PatientDashboardData> {
  const { supabase, profile } = await requireAuthProfile("patient");
  const nowIso = new Date().toISOString();

  const [
    { data: patientProfile },
    { data: appointmentRows },
    { data: noteRows },
    { count: upcomingAppointmentsCount },
    { count: sharedNotesCount },
    notificationData,
  ] = await Promise.all([
    supabase
      .from("patient_profiles")
      .select("date_of_birth, gender, address, emergency_contact")
      .eq("user_id", profile.id)
      .maybeSingle<PatientProfileRow>(),
    supabase
      .from("appointments")
      .select("id, provider_user_id, status, start_at, end_at, reason")
      .eq("patient_user_id", profile.id)
      .gte("start_at", nowIso)
      .in("status", ["requested", "confirmed"])
      .order("start_at", { ascending: true })
      .limit(6)
      .returns<AppointmentRow[]>(),
    supabase
      .from("soap_notes")
      .select("id, provider_user_id, assessment, plan, created_at")
      .eq("patient_user_id", profile.id)
      .eq("is_shared_with_patient", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .returns<NoteRow[]>(),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_user_id", profile.id)
      .gte("start_at", nowIso)
      .in("status", ["requested", "confirmed"]),
    supabase
      .from("soap_notes")
      .select("id", { count: "exact", head: true })
      .eq("patient_user_id", profile.id)
      .eq("is_shared_with_patient", true),
    getUserNotifications(supabase, profile.id, { limit: 6 }),
  ]);

  const providerIds = Array.from(
    new Set(
      [...(appointmentRows ?? []), ...(noteRows ?? [])].map((row) => row.provider_user_id)
    )
  );

  let providerNameMap = new Map<string, string>();
  let specialtyMap = new Map<string, string | null>();

  if (providerIds.length > 0) {
    const [{ data: providerRows }, { data: providerProfileRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", providerIds)
        .returns<Array<{ id: string; full_name: string | null }>>(),
      supabase
        .from("provider_profiles")
        .select("user_id, specialty")
        .in("user_id", providerIds)
        .returns<ProviderProfileRow[]>(),
    ]);

    providerNameMap = buildNameMap(providerRows, "Assigned provider");
    specialtyMap = new Map(
      (providerProfileRows ?? []).map((row) => [row.user_id, row.specialty])
    );
  }

  const upcomingAppointments: PatientDashboardAppointment[] = (appointmentRows ?? []).map(
    (row) => ({
      id: row.id,
      providerName: providerNameMap.get(row.provider_user_id) ?? "Assigned provider",
      providerSpecialty: specialtyMap.get(row.provider_user_id) ?? null,
      status: row.status,
      startAt: row.start_at,
      endAt: row.end_at,
      reason: row.reason,
    })
  );

  const recentNotes: PatientVisitNote[] = (noteRows ?? []).map((row) => ({
    id: row.id,
    providerName: providerNameMap.get(row.provider_user_id) ?? "Care team",
    assessment: row.assessment,
    plan: row.plan,
    createdAt: row.created_at,
  }));

  return {
    user: profile,
    completionScore: calculateCompletionScore(profile.phone, patientProfile),
    upcomingAppointmentsCount: safeCount(upcomingAppointmentsCount),
    sharedNotesCount: safeCount(sharedNotesCount),
    unreadNotificationsCount: notificationData.unreadCount,
    nextAppointment: upcomingAppointments[0] ?? null,
    upcomingAppointments,
    recentNotes,
    notifications: notificationData.notifications,
  };
}
