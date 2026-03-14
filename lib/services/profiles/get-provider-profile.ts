import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProviderProfileRecord } from "@/types/domain/profiles";

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type ProviderProfileRow = {
  specialty: string | null;
  license_number: string | null;
  years_experience: number | null;
  bio: string | null;
};

export async function getProviderProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProviderProfileRecord> {
  const [{ data: profile, error: profileError }, { data: providerProfile, error: providerProfileError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", userId)
        .single<ProfileRow>(),
      supabase
        .from("provider_profiles")
        .select("specialty, license_number, years_experience, bio")
        .eq("user_id", userId)
        .maybeSingle<ProviderProfileRow>(),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (providerProfileError) {
    throw providerProfileError;
  }

  return {
    fullName: profile.full_name ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    specialty: providerProfile?.specialty ?? "",
    licenseNumber: providerProfile?.license_number ?? "",
    yearsExperience: providerProfile?.years_experience ?? 0,
    bio: providerProfile?.bio ?? "",
  };
}
