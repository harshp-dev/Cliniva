import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentStatus } from "@/types/domain/appointments";
import type {
  ConsultationRoomData,
  ConsultationSessionSummary,
  ConsultationStatus,
} from "@/types/domain/consultations";

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
  status: AppointmentStatus;
  start_at: string;
  end_at: string;
  reason: string | null;
};

type ConsultationSessionRow = {
  id: string;
  appointment_id: string;
  status: ConsultationStatus;
  room_id: string | null;
  room_url: string | null;
  started_at: string | null;
  ended_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

function mapSession(row: ConsultationSessionRow | null): ConsultationSessionSummary | null {
  if (!row) return null;

  return {
    id: row.id,
    appointmentId: row.appointment_id,
    status: row.status,
    roomId: row.room_id,
    roomUrl: row.room_url,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export async function getConsultationSession(
  supabase: SupabaseClient,
  appointmentId: string
): Promise<ConsultationRoomData | null> {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, patient_user_id, provider_user_id, status, start_at, end_at, reason")
    .eq("id", appointmentId)
    .maybeSingle<AppointmentRow>();

  if (appointmentError) {
    throw appointmentError;
  }

  if (!appointment) {
    return null;
  }

  const [{ data: session, error: sessionError }, { data: profileRows, error: profileError }] =
    await Promise.all([
      supabase
        .from("consultation_sessions")
        .select("id, appointment_id, status, room_id, room_url, started_at, ended_at")
        .eq("appointment_id", appointmentId)
        .maybeSingle<ConsultationSessionRow>(),
      supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", [appointment.patient_user_id, appointment.provider_user_id])
        .returns<ProfileRow[]>(),
    ]);

  if (sessionError) {
    throw sessionError;
  }

  if (profileError) {
    throw profileError;
  }

  const profileMap = new Map((profileRows ?? []).map((row) => [row.id, row.full_name]));

  return {
    appointment: {
      id: appointment.id,
      patientUserId: appointment.patient_user_id,
      patientName: profileMap.get(appointment.patient_user_id) ?? "Patient",
      providerUserId: appointment.provider_user_id,
      providerName: profileMap.get(appointment.provider_user_id) ?? "Provider",
      status: appointment.status,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
      reason: appointment.reason,
    },
    session: mapSession(session),
  };
}
