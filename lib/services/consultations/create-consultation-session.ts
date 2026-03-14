import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConsultationSessionSummary,
  ConsultationStatus,
} from "@/types/domain/consultations";

type CreateConsultationSessionInput = {
  appointmentId: string;
  status?: ConsultationStatus;
  roomId?: string;
  roomUrl?: string;
  startedAt?: string | null;
  endedAt?: string | null;
};

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
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

function mapSession(row: ConsultationSessionRow): ConsultationSessionSummary {
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

export async function createConsultationSession(
  supabase: SupabaseClient,
  input: CreateConsultationSessionInput
): Promise<ConsultationSessionSummary> {
  const { data: existingSession, error: existingSessionError } = await supabase
    .from("consultation_sessions")
    .select("id, appointment_id, status, room_id, room_url, started_at, ended_at")
    .eq("appointment_id", input.appointmentId)
    .maybeSingle<ConsultationSessionRow>();

  if (existingSessionError) {
    throw existingSessionError;
  }

  if (existingSession) {
    return mapSession(existingSession);
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, patient_user_id, provider_user_id")
    .eq("id", input.appointmentId)
    .maybeSingle<AppointmentRow>();

  if (appointmentError) {
    throw appointmentError;
  }

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  const roomId = input.roomId ?? `stub-room-${appointment.id}`;
  const roomUrl = input.roomUrl ?? `/consultations/${appointment.id}`;

  const { data: createdSession, error: createError } = await supabase
    .from("consultation_sessions")
    .insert({
      appointment_id: appointment.id,
      patient_user_id: appointment.patient_user_id,
      provider_user_id: appointment.provider_user_id,
      status: input.status ?? "scheduled",
      room_id: roomId,
      room_url: roomUrl,
      started_at: input.startedAt ?? null,
      ended_at: input.endedAt ?? null,
    })
    .select("id, appointment_id, status, room_id, room_url, started_at, ended_at")
    .single<ConsultationSessionRow>();

  if (createError) {
    throw createError;
  }

  return mapSession(createdSession);
}
