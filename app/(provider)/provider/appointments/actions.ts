"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { createAvailability } from "@/lib/services/appointments/create-availability";
import { deleteAvailability } from "@/lib/services/appointments/delete-availability";
import { updateAppointmentStatus } from "@/lib/services/appointments/update-appointment-status";
import { createAuditLogSafely } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications/create-notification";
import { providerAppointmentStatusSchema } from "@/lib/validations/appointments";
import type { ProviderManagedAppointmentStatus } from "@/types/domain/appointments";

function getPatientStatusNotificationCopy(
  nextStatus: ProviderManagedAppointmentStatus,
  providerName: string
) {
  if (nextStatus === "confirmed") {
    return {
      title: "Appointment confirmed",
      body: `${providerName} confirmed your visit. Join the consultation room when the provider starts the session.`,
    };
  }

  if (nextStatus === "cancelled") {
    return {
      title: "Appointment cancelled",
      body: `${providerName} cancelled your appointment. Please book another time if you still need care.`,
    };
  }

  return {
    title: "Appointment completed",
    body: `${providerName} marked your visit as completed. Shared notes will appear in your records once released.`,
  };
}

function getProviderStatusNotificationCopy(nextStatus: ProviderManagedAppointmentStatus) {
  if (nextStatus === "confirmed") {
    return {
      title: "Appointment confirmed",
      body: "This visit moved into your active queue and is ready for consultation when appropriate.",
    };
  }

  if (nextStatus === "cancelled") {
    return {
      title: "Appointment cancelled",
      body: "This visit was removed from the active queue and marked as cancelled.",
    };
  }

  return {
    title: "Appointment completed",
    body: "This visit was marked as completed and the consultation timeline was closed.",
  };
}

function getAuditAction(nextStatus: ProviderManagedAppointmentStatus) {
  if (nextStatus === "confirmed") return "appointment.confirmed";
  if (nextStatus === "cancelled") return "appointment.cancelled";
  return "appointment.completed";
}

function revalidateProviderWorkspace() {
  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/appointments");
  revalidatePath("/provider/notifications");
  revalidatePath("/patient/dashboard");
  revalidatePath("/patient/appointments");
  revalidatePath("/patient/notifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/operations");
  revalidatePath("/admin/audit");
}

export async function createAvailabilityAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("provider");

  const dayOfWeek = Number(formData.get("day_of_week"));
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const timezone = String(formData.get("timezone") ?? "UTC");

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error("Invalid day of week.");
  }

  await createAvailability(supabase, {
    providerUserId: profile.id,
    dayOfWeek,
    startTime,
    endTime,
    timezone,
  });

  await createAuditLogSafely(supabase, {
    action: "provider_availability.created",
    entityType: "provider_availability",
    metadata: {
      providerUserId: profile.id,
      dayOfWeek,
      startTime,
      endTime,
      timezone,
    },
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/availability");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/providers");
  revalidatePath("/admin/audit");

  redirect("/provider/availability");
}

export async function deleteAvailabilityAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("provider");

  const availabilityId = String(formData.get("availability_id") ?? "");
  if (!availabilityId) {
    throw new Error("Missing availability id.");
  }

  await deleteAvailability(supabase, availabilityId);

  await createAuditLogSafely(supabase, {
    action: "provider_availability.deleted",
    entityType: "provider_availability",
    entityId: availabilityId,
    metadata: {
      providerUserId: profile.id,
    },
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/availability");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/providers");
  revalidatePath("/admin/audit");

  redirect("/provider/availability");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const { supabase, profile } = await requireAuthProfile("provider");
  const parsedInput = providerAppointmentStatusSchema.safeParse({
    appointmentId: String(formData.get("appointment_id") ?? ""),
    nextStatus: String(formData.get("next_status") ?? ""),
  });

  if (!parsedInput.success) {
    throw new Error(parsedInput.error.issues[0]?.message ?? "Invalid appointment update.");
  }

  const result = await updateAppointmentStatus(supabase, {
    appointmentId: parsedInput.data.appointmentId,
    providerUserId: profile.id,
    nextStatus: parsedInput.data.nextStatus,
  });

  if (result.wasChanged) {
    const patientNotification = getPatientStatusNotificationCopy(
      parsedInput.data.nextStatus,
      profile.fullName
    );
    const providerNotification = getProviderStatusNotificationCopy(
      parsedInput.data.nextStatus
    );

    await Promise.all([
      createNotification(supabase, {
        appointmentId: result.id,
        recipientUserId: result.patientUserId,
        type: "appointment",
        title: patientNotification.title,
        body: patientNotification.body,
      }),
      createNotification(supabase, {
        appointmentId: result.id,
        recipientUserId: result.providerUserId,
        type: "appointment",
        title: providerNotification.title,
        body: providerNotification.body,
      }),
      createAuditLogSafely(supabase, {
        action: getAuditAction(parsedInput.data.nextStatus),
        entityType: "appointment",
        entityId: result.id,
        metadata: {
          previousStatus: result.previousStatus,
          nextStatus: result.status,
          patientUserId: result.patientUserId,
          providerUserId: result.providerUserId,
        },
      }),
    ]);
  }

  revalidateProviderWorkspace();

  redirect("/provider/appointments");
}
