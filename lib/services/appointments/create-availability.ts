import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateAvailabilityInput = {
  providerUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export async function createAvailability(
  supabase: SupabaseClient,
  input: CreateAvailabilityInput
) {
  const { error } = await supabase.from("provider_availability").insert({
    provider_user_id: input.providerUserId,
    day_of_week: input.dayOfWeek,
    start_time: input.startTime,
    end_time: input.endTime,
    timezone: input.timezone,
  });

  if (error) {
    throw error;
  }
}
