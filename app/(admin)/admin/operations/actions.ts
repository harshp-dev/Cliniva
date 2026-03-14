"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { cancelAppointmentAsAdmin } from "@/lib/services/appointments/update-appointment-status";
import { createAuditLogSafely } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications";

export async function cancelAppointmentAsAdminAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("admin");

  const appointmentId = String(formData.get("appointment_id") ?? "");
  if (!appointmentId) {
    throw new Error("Missing appointment id.");
  }

  const result = await cancelAppointmentAsAdmin(supabase, {
    appointmentId,
  });

  if (result.wasChanged) {
    await Promise.all([
      createNotification(supabase, {
        appointmentId: result.id,
        recipientUserId: result.patientUserId,
        type: "appointment",
        title: "Appointment cancelled by operations",
        body: "Cliniva operations cancelled this appointment. Please review the portal and rebook if care is still required.",
      }),
      createNotification(supabase, {
        appointmentId: result.id,
        recipientUserId: result.providerUserId,
        type: "appointment",
        title: "Appointment cancelled by admin",
        body: "Operations cancelled this appointment from the admin workspace.",
      }),
      createAuditLogSafely(supabase, {
        action: "appointment.cancelled_by_admin",
        entityType: "appointment",
        entityId: result.id,
        metadata: {
          actorUserId: profile.id,
          previousStatus: result.previousStatus,
          nextStatus: result.status,
          patientUserId: result.patientUserId,
          providerUserId: result.providerUserId,
        },
      }),
    ]);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/operations");
  revalidatePath("/admin/audit");
  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/appointments");
  revalidatePath("/patient/notifications");
  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/appointments");
  revalidatePath("/provider/notifications");

  redirect("/admin/operations");
}
