import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/domain/auth";

export type CreateProfileInput = {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string | null;
};

export async function createProfile(
  supabase: SupabaseClient,
  input: CreateProfileInput
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.id,
      role: input.role,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
}
