"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { createAuditLogSafely } from "@/lib/services/audit";
import { updatePatientProfile } from "@/lib/services/profiles/update-patient-profile";
import { patientProfileSchema } from "@/lib/validations/profiles";

export async function updatePatientProfileAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("patient");

  const parsed = patientProfileSchema.safeParse({
    fullName: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    dateOfBirth: String(formData.get("date_of_birth") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    address: String(formData.get("address") ?? ""),
    emergencyContactName: String(formData.get("emergency_contact_name") ?? ""),
    emergencyContactPhone: String(formData.get("emergency_contact_phone") ?? ""),
    emergencyContactRelation: String(formData.get("emergency_contact_relation") ?? ""),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid patient profile details.");
  }

  await updatePatientProfile(supabase, profile.id, parsed.data);

  await createAuditLogSafely(supabase, {
    action: "patient_profile.updated",
    entityType: "patient_profile",
    entityId: profile.id,
    metadata: {
      userId: profile.id,
      completionFields: {
        phone: Boolean(parsed.data.phone),
        dateOfBirth: Boolean(parsed.data.dateOfBirth),
        gender: Boolean(parsed.data.gender),
        address: Boolean(parsed.data.address),
        emergencyContact: Boolean(
          parsed.data.emergencyContactName ||
            parsed.data.emergencyContactPhone ||
            parsed.data.emergencyContactRelation
        ),
      },
    },
  });

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/profile");

  redirect("/patient/profile?updated=1");
}
