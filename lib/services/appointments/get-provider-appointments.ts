import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentStatus } from "@/types/domain/appointments";
import type { ConsultationStatus } from "@/types/domain/consultations";

type AppointmentRow = {
  id: string;
  status: AppointmentStatus;
  start_at: string;
  end_at: string;
  reason: string | null;
  patient_user_id: string;
};

type ConsultationSessionRow = {
  appointment_id: string;
  status: ConsultationStatus;
};

type PatientRow = {
  id: string;
  full_name: string | null;
};

export async function getProviderAppointments(
  supabase: SupabaseClient,
  providerUserId: string
) {
  const { data: appointments, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, status, start_at, end_at, reason, patient_user_id")
    .eq("provider_user_id", providerUserId)
    .order("start_at", { ascending: true })
    .returns<AppointmentRow[]>();

  if (appointmentError) {
    throw appointmentError;
  }

  const appointmentRows = appointments ?? [];
  const patientIds = Array.from(new Set(appointmentRows.map((row) => row.patient_user_id)));
  const appointmentIds = appointmentRows.map((row) => row.id);

  let patientMap = new Map<string, string>();
  let consultationMap = new Map<string, ConsultationStatus>();

  if (patientIds.length > 0) {
    const { data: patients, error: patientError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", patientIds)
      .returns<PatientRow[]>();

    if (patientError) {
      throw patientError;
    }

    patientMap = new Map(
      (patients ?? []).map((patient) => [patient.id, patient.full_name ?? "Patient"])
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
    patient_name: patientMap.get(appointment.patient_user_id) ?? "Patient",
    consultation_status: consultationMap.get(appointment.id) ?? null,
  }));
}
