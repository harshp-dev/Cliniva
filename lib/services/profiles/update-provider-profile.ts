import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProviderProfileInput } from "@/lib/validations/profiles";

export async function updateProviderProfile(
  supabase: SupabaseClient,
  userId: string,
  input: ProviderProfileInput
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

  const { error: providerProfileError } = await supabase
    .from("provider_profiles")
    .upsert(
      {
        user_id: userId,
        specialty: input.specialty,
        license_number: input.licenseNumber,
        years_experience: input.yearsExperience,
        bio: input.bio || null,
      },
      { onConflict: "user_id" }
    );

  if (providerProfileError) {
    throw providerProfileError;
  }
}
