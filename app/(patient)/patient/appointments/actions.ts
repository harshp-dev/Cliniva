"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAppointment } from "@/lib/services/appointments/create-appointment";
import { createAuditLogSafely } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications/create-notification";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";

function parseDateTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return null;
  const combined = `${dateValue}T${timeValue}:00`;
  const parsed = new Date(combined);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function createAppointmentAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("patient");

  const providerUserId = String(formData.get("provider_user_id") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const timeValue = String(formData.get("time") ?? "");
  const reason = String(formData.get("reason") ?? "");

  if (!providerUserId) {
    throw new Error("Select a provider.");
  }

  const startDate = parseDateTime(dateValue, timeValue);
  if (!startDate) {
    throw new Error("Provide a valid date and time.");
  }

  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const appointment = await createAppointment(supabase, {
    patientUserId: profile.id,
    providerUserId,
    startAt: startDate.toISOString(),
    endAt: endDate.toISOString(),
    reason: reason || undefined,
  });

  await Promise.all([
    createNotification(supabase, {
      appointmentId: appointment.id,
      recipientUserId: appointment.providerUserId,
      type: "appointment",
      title: "New appointment request",
      body: reason
        ? `A patient requested a visit and included this reason: ${reason}`
        : "A patient requested a new visit in your scheduling queue.",
    }),
    createNotification(supabase, {
      appointmentId: appointment.id,
      recipientUserId: appointment.patientUserId,
      type: "appointment",
      title: "Appointment request submitted",
      body: "Your request was sent to the provider. Watch your dashboard for status changes.",
    }),
    createAuditLogSafely(supabase, {
      action: "appointment.requested",
      entityType: "appointment",
      entityId: appointment.id,
      metadata: {
        patientUserId: appointment.patientUserId,
        providerUserId: appointment.providerUserId,
        reason: reason || null,
      },
    }),
  ]);

  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/appointments");
  revalidatePath("/patient/notifications");
  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/appointments");
  revalidatePath("/provider/notifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/operations");
  revalidatePath("/admin/audit");

  redirect("/patient/appointments");
}
