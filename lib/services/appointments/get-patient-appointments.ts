import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentStatus } from "@/types/domain/appointments";
import type { ConsultationStatus } from "@/types/domain/consultations";

type AppointmentRow = {
  id: string;
  status: AppointmentStatus;
  start_at: string;
  end_at: string;
  reason: string | null;
  provider_user_id: string;
};

type ConsultationSessionRow = {
  appointment_id: string;
  status: ConsultationStatus;
};

type ProviderRow = {
  id: string;
  full_name: string | null;
};

export async function getPatientAppointments(
  supabase: SupabaseClient,
  patientUserId: string
) {
  const { data: appointments, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, status, start_at, end_at, reason, provider_user_id")
    .eq("patient_user_id", patientUserId)
    .order("start_at", { ascending: true })
    .returns<AppointmentRow[]>();

  if (appointmentError) {
    throw appointmentError;
  }

  const appointmentRows = appointments ?? [];
  const providerIds = Array.from(new Set(appointmentRows.map((row) => row.provider_user_id)));
  const appointmentIds = appointmentRows.map((row) => row.id);

  let providerMap = new Map<string, string>();
  let consultationMap = new Map<string, ConsultationStatus>();

  if (providerIds.length > 0) {
    const { data: providers, error: providerError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", providerIds)
      .returns<ProviderRow[]>();

    if (providerError) {
      throw providerError;
    }

    providerMap = new Map(
      (providers ?? []).map((provider) => [provider.id, provider.full_name ?? "Provider"])
    );
  }

  if (appointmentIds.length > 0) {
    const { data: sessions, error: sessionError } = await supabase
      .from("consultation_sessions")
      .select("appointment_id, status")
      .in("appointment_id", appointmentIds)
      .returns<ConsultationSessionRow[]>();

    if (sessionError) {
      throw sessionError;
    }

    consultationMap = new Map(
      (sessions ?? []).map((session) => [session.appointment_id, session.status])
    );
  }

  return appointmentRows.map((appointment) => ({
    ...appointment,
    provider_name: providerMap.get(appointment.provider_user_id) ?? "Provider",
    consultation_status: consultationMap.get(appointment.id) ?? null,
  }));
}
