"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { updateAppointmentStatus } from "@/lib/services/appointments/update-appointment-status";
import { createConsultationSession } from "@/lib/services/consultations/create-consultation-session";
import { getConsultationSession } from "@/lib/services/consultations/get-consultation-session";
import { updateConsultationSession } from "@/lib/services/consultations/update-consultation-session";
import { createAuditLogSafely } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications/create-notification";

async function getAuthorizedProviderRoom(appointmentId: string) {
  const { supabase, profile } = await requireAuthProfile("provider");
  const roomData = await getConsultationSession(supabase, appointmentId);

  if (!roomData || roomData.appointment.providerUserId !== profile.id) {
    throw new Error("You are not allowed to manage this consultation.");
  }

  return { supabase, profile, roomData };
}

function revalidateConsultationWorkspace(appointmentId: string) {
  revalidatePath(`/consultations/${appointmentId}`);
  revalidatePath(`/provider/notes/${appointmentId}`);
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

export async function startConsultationAction(formData: FormData) {
  const appointmentId = String(formData.get("appointment_id") ?? "");

  if (!appointmentId) {
    throw new Error("Missing appointment id.");
  }

  const { supabase, profile, roomData } = await getAuthorizedProviderRoom(appointmentId);
  const nowIso = new Date().toISOString();

  if (roomData.appointment.status !== "confirmed") {
    throw new Error("Confirm the appointment before starting the consultation.");
  }

  if (!roomData.session) {
    await createConsultationSession(supabase, {
      appointmentId,
      status: "in_progress",
      startedAt: nowIso,
    });
  } else if (roomData.session.status === "scheduled") {
    await updateConsultationSession(supabase, {
      appointmentId,
      status: "in_progress",
      startedAt: roomData.session.startedAt ?? nowIso,
    });
  }

  await Promise.all([
    createNotification(supabase, {
      appointmentId,
      recipientUserId: roomData.appointment.patientUserId,
      type: "consultation",
      title: "Consultation is ready",
      body: `${roomData.appointment.providerName} started your appointment. You can join the consultation room now.`,
    }),
    createNotification(supabase, {
      appointmentId,
      recipientUserId: roomData.appointment.providerUserId,
      type: "consultation",
      title: "Consultation room started",
      body: `The consultation with ${roomData.appointment.patientName} is now active in the room.`,
    }),
    createAuditLogSafely(supabase, {
      action: "consultation.started",
      entityType: "consultation_session",
      entityId: appointmentId,
      metadata: {
        appointmentId,
        providerUserId: profile.id,
        patientUserId: roomData.appointment.patientUserId,
      },
    }),
  ]);

  revalidateConsultationWorkspace(appointmentId);

  redirect(`/consultations/${appointmentId}`);
}

export async function completeConsultationAction(formData: FormData) {
  const appointmentId = String(formData.get("appointment_id") ?? "");

  if (!appointmentId) {
    throw new Error("Missing appointment id.");
  }

  const { supabase, profile, roomData } = await getAuthorizedProviderRoom(appointmentId);

  if (!roomData.session) {
    throw new Error("Consultation session not found.");
  }

  const result = await updateAppointmentStatus(supabase, {
    appointmentId,
    providerUserId: profile.id,
    nextStatus: "completed",
  });

  if (result.wasChanged) {
    await Promise.all([
      createNotification(supabase, {
        appointmentId,
        recipientUserId: roomData.appointment.patientUserId,
        type: "consultation",
        title: "Appointment completed",
        body: `${roomData.appointment.providerName} marked your consultation as completed.`,
      }),
      createNotification(supabase, {
        appointmentId,
        recipientUserId: roomData.appointment.providerUserId,
        type: "consultation",
        title: "Consultation completed",
        body: `${roomData.appointment.patientName}'s appointment was marked as completed.`,
      }),
      createAuditLogSafely(supabase, {
        action: "consultation.completed",
        entityType: "consultation_session",
        entityId: appointmentId,
        metadata: {
          appointmentId,
          providerUserId: profile.id,
          patientUserId: roomData.appointment.patientUserId,
          previousAppointmentStatus: result.previousStatus,
          nextAppointmentStatus: result.status,
        },
      }),
    ]);
  }

  revalidateConsultationWorkspace(appointmentId);

  redirect(`/consultations/${appointmentId}`);
}
