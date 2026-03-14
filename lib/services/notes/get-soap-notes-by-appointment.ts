import type { SupabaseClient } from "@supabase/supabase-js";
import type { SoapNoteRecord } from "@/types/domain/notes";

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

function mapSoapNote(row: SoapNoteRow): SoapNoteRecord {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    patientUserId: row.patient_user_id,
    providerUserId: row.provider_user_id,
    subjective: row.subjective,
    objective: row.objective,
    assessment: row.assessment,
    plan: row.plan,
    isSharedWithPatient: row.is_shared_with_patient,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSoapNotesByAppointment(
  supabase: SupabaseClient,
  appointmentId: string
): Promise<SoapNoteRecord[]> {
  const { data, error } = await supabase
    .from("soap_notes")
    .select("id, appointment_id, patient_user_id, provider_user_id, subjective, objective, assessment, plan, is_shared_with_patient, created_at, updated_at")
    .eq("appointment_id", appointmentId)
    .order("updated_at", { ascending: false })
    .returns<SoapNoteRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSoapNote);
}
