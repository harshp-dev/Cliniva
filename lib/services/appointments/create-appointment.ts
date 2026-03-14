import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentStatus } from "@/types/domain/appointments";

export type CreateAppointmentInput = {
  patientUserId: string;
  providerUserId: string;
  startAt: string;
  endAt: string;
  reason?: string;
  notes?: string;
};

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
  status: AppointmentStatus;
  start_at: string;
  end_at: string;
  reason: string | null;
};

export async function createAppointment(
  supabase: SupabaseClient,
  input: CreateAppointmentInput
) {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_user_id: input.patientUserId,
      provider_user_id: input.providerUserId,
      status: "requested",
      start_at: input.startAt,
      end_at: input.endAt,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
    })
    .select("id, patient_user_id, provider_user_id, status, start_at, end_at, reason")
    .maybeSingle<AppointmentRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Appointment could not be created.");
  }

  return {
    id: data.id,
    patientUserId: data.patient_user_id,
    providerUserId: data.provider_user_id,
    status: data.status,
    startAt: data.start_at,
    endAt: data.end_at,
    reason: data.reason,
  };
}
