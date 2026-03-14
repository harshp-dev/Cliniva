import type { SupabaseClient } from "@supabase/supabase-js";
import type { PatientProfileRecord } from "@/types/domain/profiles";

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type PatientProfileRow = {
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact: Record<string, unknown> | null;
};

function getEmergencyContactValue(
  contact: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = contact?.[key];
  return typeof value === "string" ? value : "";
}

export async function getPatientProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<PatientProfileRecord> {
  const [{ data: profile, error: profileError }, { data: patientProfile, error: patientProfileError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", userId)
        .single<ProfileRow>(),
      supabase
        .from("patient_profiles")
        .select("date_of_birth, gender, address, emergency_contact")
        .eq("user_id", userId)
        .maybeSingle<PatientProfileRow>(),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (patientProfileError) {
    throw patientProfileError;
  }

  return {
    fullName: profile.full_name ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    dateOfBirth: patientProfile?.date_of_birth ?? "",
    gender: patientProfile?.gender ?? "",
    address: patientProfile?.address ?? "",
    emergencyContactName: getEmergencyContactValue(patientProfile?.emergency_contact, "name"),
    emergencyContactPhone: getEmergencyContactValue(patientProfile?.emergency_contact, "phone"),
    emergencyContactRelation: getEmergencyContactValue(patientProfile?.emergency_contact, "relation"),
  };
}
