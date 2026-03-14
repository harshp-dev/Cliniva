"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function markPatientNotificationReadAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("patient");
  const notificationId = String(formData.get("notification_id") ?? "");

  if (!notificationId) {
    throw new Error("Missing notification id.");
  }

  await markNotificationRead(supabase, notificationId, profile.id);

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/notifications");

  redirect("/patient/notifications");
}

export async function markAllPatientNotificationsReadAction() {
  const { supabase, profile } = await requireAuthProfile("patient");

  await markAllNotificationsRead(supabase, profile.id);

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/notifications");

  redirect("/patient/notifications");
}
