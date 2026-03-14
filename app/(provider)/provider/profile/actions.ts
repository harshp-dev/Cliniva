"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { createAuditLogSafely } from "@/lib/services/audit";
import { updateProviderProfile } from "@/lib/services/profiles/update-provider-profile";
import { providerProfileSchema } from "@/lib/validations/profiles";

export async function updateProviderProfileAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("provider");

  const parsed = providerProfileSchema.safeParse({
    fullName: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    specialty: String(formData.get("specialty") ?? ""),
    licenseNumber: String(formData.get("license_number") ?? ""),
    yearsExperience: Number(formData.get("years_experience") ?? 0),
    bio: String(formData.get("bio") ?? ""),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid provider profile details.");
  }

  await updateProviderProfile(supabase, profile.id, parsed.data);

  await createAuditLogSafely(supabase, {
    action: "provider_profile.updated",
    entityType: "provider_profile",
    entityId: profile.id,
    metadata: {
      userId: profile.id,
      specialty: parsed.data.specialty,
      yearsExperience: parsed.data.yearsExperience,
    },
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/profile");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/providers");
  revalidatePath("/admin/audit");

  redirect("/provider/profile?updated=1");
}
