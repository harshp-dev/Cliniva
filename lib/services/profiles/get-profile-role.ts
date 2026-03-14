import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/domain/auth";

export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.role) {
    return null;
  }

  return data.role as UserRole;
}
