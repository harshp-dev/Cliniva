import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConsultationSessionSummary,
  ConsultationStatus,
} from "@/types/domain/consultations";

type UpdateConsultationSessionInput = {
  appointmentId: string;
  status: ConsultationStatus;
  startedAt?: string | null;
  endedAt?: string | null;
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

export async function updateConsultationSession(
  supabase: SupabaseClient,
  input: UpdateConsultationSessionInput
): Promise<ConsultationSessionSummary> {
  const updatePayload: {
    status: ConsultationStatus;
    started_at?: string | null;
    ended_at?: string | null;
  } = {
    status: input.status,
  };

  if (input.startedAt !== undefined) {
    updatePayload.started_at = input.startedAt;
  }

  if (input.endedAt !== undefined) {
    updatePayload.ended_at = input.endedAt;
  }

  const { data, error } = await supabase
    .from("consultation_sessions")
    .update(updatePayload)
    .eq("appointment_id", input.appointmentId)
    .select("id, appointment_id, status, room_id, room_url, started_at, ended_at")
    .maybeSingle<ConsultationSessionRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Consultation session not found.");
  }

  return mapSession(data);
}
