import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType =
  | "system"
  | "appointment"
  | "consultation"
  | "note"
  | "message";

export type CreateNotificationInput = {
  appointmentId?: string | null;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
};

export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput
) {
  if (input.appointmentId) {
    const { error } = await supabase.rpc("create_appointment_notification", {
      p_appointment_id: input.appointmentId,
      p_recipient_user_id: input.recipientUserId,
      p_type: input.type,
      p_title: input.title,
      p_body: input.body ?? null,
    });

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.recipientUserId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
    });

  if (error) {
    throw error;
  }
}

export async function createNotificationSafely(
  supabase: SupabaseClient,
  input: CreateNotificationInput
) {
  try {
    await createNotification(supabase, input);
  } catch (error) {
    console.error("[notifications] unable to create notification", {
      recipientUserId: input.recipientUserId,
      type: input.type,
      title: input.title,
      appointmentId: input.appointmentId ?? null,
      error,
    });
  }
}
