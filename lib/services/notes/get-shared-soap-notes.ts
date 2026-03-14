import type { SupabaseClient } from "@supabase/supabase-js";
import type { SharedSoapNoteRecord } from "@/types/domain/notes";

type SoapNoteRow = {
  id: string;
  appointment_id: string;
  patient_user_id: string;
  provider_user_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  is_shared_with_patient: boolean;
  created_at: string;
  updated_at: string;
};

type AppointmentRow = {
  id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
};

type ProviderRow = {
  id: string;
  full_name: string | null;
};

export async function getSharedSoapNotes(
  supabase: SupabaseClient,
  patientUserId: string
): Promise<SharedSoapNoteRecord[]> {
  const { data: notes, error: notesError } = await supabase
    .from("soap_notes")
    .select("id, appointment_id, patient_user_id, provider_user_id, subjective, objective, assessment, plan, is_shared_with_patient, created_at, updated_at")
    .eq("patient_user_id", patientUserId)
    .eq("is_shared_with_patient", true)
    .order("updated_at", { ascending: false })
    .returns<SoapNoteRow[]>();

  if (notesError) {
    throw notesError;
  }

  const noteRows = notes ?? [];
  const appointmentIds = Array.from(new Set(noteRows.map((note) => note.appointment_id)));
  const providerIds = Array.from(new Set(noteRows.map((note) => note.provider_user_id)));

  let appointmentMap = new Map<string, AppointmentRow>();
  let providerMap = new Map<string, string>();

  if (appointmentIds.length > 0) {
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, start_at, end_at, reason")
      .in("id", appointmentIds)
      .returns<AppointmentRow[]>();

    if (appointmentError) {
      throw appointmentError;
    }

    appointmentMap = new Map((appointments ?? []).map((appointment) => [appointment.id, appointment]));
  }

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

  return noteRows.map((note) => {
    const appointment = appointmentMap.get(note.appointment_id);

    return {
      id: note.id,
      appointmentId: note.appointment_id,
      patientUserId: note.patient_user_id,
      providerUserId: note.provider_user_id,
      subjective: note.subjective,
      objective: note.objective,
      assessment: note.assessment,
      plan: note.plan,
      isSharedWithPatient: note.is_shared_with_patient,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      providerName: providerMap.get(note.provider_user_id) ?? "Provider",
      appointmentStartAt: appointment?.start_at ?? note.updated_at,
      appointmentEndAt: appointment?.end_at ?? note.updated_at,
      appointmentReason: appointment?.reason ?? null,
    };
  });
}
