import type { SupabaseClient } from "@supabase/supabase-js";
import type { PatientProfileInput } from "@/lib/validations/profiles";

function getEmergencyContact(input: PatientProfileInput) {
  if (
    !input.emergencyContactName &&
    !input.emergencyContactPhone &&
    !input.emergencyContactRelation
  ) {
    return null;
  }

  return {
    name: input.emergencyContactName || null,
    phone: input.emergencyContactPhone || null,
    relation: input.emergencyContactRelation || null,
  };
}

export async function updatePatientProfile(
  supabase: SupabaseClient,
  userId: string,
  input: PatientProfileInput
) {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }

  const { error: patientProfileError } = await supabase
    .from("patient_profiles")
    .upsert(
      {
        user_id: userId,
        date_of_birth: input.dateOfBirth || null,
        gender: input.gender || null,
        address: input.address || null,
        emergency_contact: getEmergencyContact(input),
      },
      { onConflict: "user_id" }
    );

  if (patientProfileError) {
    throw patientProfileError;
  }
}
