import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import {
  buildNameMap,
  safeCount,
} from "@/lib/services/dashboards/dashboard-service-utils";
import type {
  AdminAuditEvent,
  AdminDashboardAppointment,
  AdminDashboardData,
  AdminProviderSummary,
} from "@/types/domain/dashboard";

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
  status: string;
  start_at: string;
  end_at: string;
  reason: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  actor_user_id: string | null;
  created_at: string;
};

type ProviderRosterRow = {
  id: string;
  user_id: string;
  specialty: string | null;
  years_experience: number | null;
  license_number: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { supabase, profile } = await requireAuthProfile("admin");
  const nowIso = new Date().toISOString();

  const [
    { count: totalUsersCount },
    { count: providersCount },
    { count: patientsCount },
    { count: upcomingAppointmentsCount },
    { data: appointmentRows },
    { data: auditRows },
    { data: providerRosterRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "provider"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "patient"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("start_at", nowIso)
      .in("status", ["requested", "confirmed"]),
    supabase
      .from("appointments")
      .select("id, patient_user_id, provider_user_id, status, start_at, end_at, reason")
      .gte("start_at", nowIso)
      .order("start_at", { ascending: true })
      .limit(24)
      .returns<AppointmentRow[]>(),
    supabase
      .from("audit_logs")
      .select("id, action, entity_type, actor_user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(24)
      .returns<AuditRow[]>(),
    supabase
      .from("provider_profiles")
      .select("id, user_id, specialty, years_experience, license_number")
      .order("created_at", { ascending: false })
      .limit(24)
      .returns<ProviderRosterRow[]>(),
  ]);

  const profileIds = Array.from(
    new Set(
      [
        ...(appointmentRows ?? []).flatMap((row) => [row.patient_user_id, row.provider_user_id]),
        ...(providerRosterRows ?? []).map((row) => row.user_id),
        ...(auditRows ?? []).flatMap((row) => (row.actor_user_id ? [row.actor_user_id] : [])),
      ]
    )
  );

  let nameMap = new Map<string, string>();
  let profileMap = new Map<string, ProfileRow>();

  if (profileIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", profileIds)
      .returns<ProfileRow[]>();

    nameMap = buildNameMap(profileRows, "Cliniva user");
    profileMap = new Map((profileRows ?? []).map((row) => [row.id, row]));
  }

  const recentAppointments: AdminDashboardAppointment[] = (appointmentRows ?? []).map((row) => ({
    id: row.id,
    patientUserId: row.patient_user_id,
    providerUserId: row.provider_user_id,
    patientName: nameMap.get(row.patient_user_id) ?? "Patient",
    providerName: nameMap.get(row.provider_user_id) ?? "Provider",
    status: row.status,
    startAt: row.start_at,
    endAt: row.end_at,
    reason: row.reason,
  }));

  const recentAuditEvents: AdminAuditEvent[] = (auditRows ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    actorUserId: row.actor_user_id,
    actorName: row.actor_user_id ? nameMap.get(row.actor_user_id) ?? "Cliniva user" : null,
    createdAt: row.created_at,
  }));

  const providerRoster: AdminProviderSummary[] = (providerRosterRows ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    fullName: nameMap.get(row.user_id) ?? "Provider account",
    email: profileMap.get(row.user_id)?.email ?? null,
    specialty: row.specialty,
    yearsExperience: row.years_experience,
    licenseNumber: row.license_number,
  }));

  return {
    user: profile,
    totalUsersCount: safeCount(totalUsersCount),
    providersCount: safeCount(providersCount),
    patientsCount: safeCount(patientsCount),
    upcomingAppointmentsCount: safeCount(upcomingAppointmentsCount),
    recentAppointments,
    recentAuditEvents,
    providerRoster,
  };
}
