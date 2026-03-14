import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProviders(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "provider")
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
