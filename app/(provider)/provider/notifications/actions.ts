"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function markProviderNotificationReadAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("provider");
  const notificationId = String(formData.get("notification_id") ?? "");

  if (!notificationId) {
    throw new Error("Missing notification id.");
  }

  await markNotificationRead(supabase, notificationId, profile.id);

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/notifications");

  redirect("/provider/notifications");
}

export async function markAllProviderNotificationsReadAction() {
  const { supabase, profile } = await requireAuthProfile("provider");

  await markAllNotificationsRead(supabase, profile.id);

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/notifications");

  redirect("/provider/notifications");
}
