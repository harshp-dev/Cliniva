import type { SupabaseClient } from "@supabase/supabase-js";
import type { SoapNoteInput } from "@/lib/validations/notes";
import type { SoapNoteRecord } from "@/types/domain/notes";

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
};

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

export type SaveSoapNoteResult = {
  note: SoapNoteRecord;
  wasCreated: boolean;
  previousIsSharedWithPatient: boolean;
};

export async function createSoapNote(
  supabase: SupabaseClient,
  input: SoapNoteInput & { appointmentId: string; providerUserId: string }
): Promise<SaveSoapNoteResult> {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, patient_user_id, provider_user_id")
    .eq("id", input.appointmentId)
    .maybeSingle<AppointmentRow>();

  if (appointmentError) {
    throw appointmentError;
  }

  if (!appointment || appointment.provider_user_id !== input.providerUserId) {
    throw new Error("Appointment not found for this provider.");
  }

  const notePayload = {
    subjective: input.subjective,
    objective: input.objective,
    assessment: input.assessment,
    plan: input.plan,
    is_shared_with_patient: input.isSharedWithPatient,
  };

  const { data: existingNote, error: existingNoteError } = await supabase
    .from("soap_notes")
    .select("id, appointment_id, patient_user_id, provider_user_id, subjective, objective, assessment, plan, is_shared_with_patient, created_at, updated_at")
    .eq("appointment_id", input.appointmentId)
    .eq("provider_user_id", input.providerUserId)
    .maybeSingle<SoapNoteRow>();

  if (existingNoteError) {
    throw existingNoteError;
  }

  if (existingNote) {
    const { data: updatedNote, error: updateError } = await supabase
      .from("soap_notes")
      .update(notePayload)
      .eq("id", existingNote.id)
      .select("id, appointment_id, patient_user_id, provider_user_id, subjective, objective, assessment, plan, is_shared_with_patient, created_at, updated_at")
      .single<SoapNoteRow>();

    if (updateError) {
      throw updateError;
    }

    return {
      note: mapSoapNote(updatedNote),
      wasCreated: false,
      previousIsSharedWithPatient: existingNote.is_shared_with_patient,
    };
  }

  const { data: createdNote, error: createError } = await supabase
    .from("soap_notes")
    .insert({
      appointment_id: appointment.id,
      patient_user_id: appointment.patient_user_id,
      provider_user_id: input.providerUserId,
      ...notePayload,
    })
    .select("id, appointment_id, patient_user_id, provider_user_id, subjective, objective, assessment, plan, is_shared_with_patient, created_at, updated_at")
    .single<SoapNoteRow>();

  if (createError) {
    throw createError;
  }

  return {
    note: mapSoapNote(createdNote),
    wasCreated: true,
    previousIsSharedWithPatient: false,
  };
}
