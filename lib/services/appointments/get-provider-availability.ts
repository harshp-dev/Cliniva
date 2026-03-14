import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProviderAvailability(
  supabase: SupabaseClient,
  providerUserId: string
) {
  const { data, error } = await supabase
    .from("provider_availability")
    .select("id, day_of_week, start_time, end_time, timezone")
    .eq("provider_user_id", providerUserId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
