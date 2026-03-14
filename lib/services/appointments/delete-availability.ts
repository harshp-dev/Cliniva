import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteAvailability(
  supabase: SupabaseClient,
  availabilityId: string
) {
  const { error } = await supabase
    .from("provider_availability")
    .delete()
    .eq("id", availabilityId);

  if (error) {
    throw error;
  }
}
