"use server";

import { revalidatePath } from "next/cache";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { createAuditLogSafely } from "@/lib/services/audit";
import { getConsultationSession } from "@/lib/services/consultations/get-consultation-session";
import { createSoapNote } from "@/lib/services/notes/create-soap-note";
import { createNotificationSafely } from "@/lib/services/notifications";
import { soapNoteSchema, type SoapNoteInput } from "@/lib/validations/notes";

type SaveSoapNoteActionResult = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function saveSoapNoteAction(
  input: SoapNoteInput & { appointmentId: string }
): Promise<SaveSoapNoteActionResult> {
  const parsed = soapNoteSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "error",
      message: issue?.message ?? "Enter complete SOAP note details before saving.",
    };
  }

  try {
    const { supabase, profile } = await requireAuthProfile("provider");
    const roomData = await getConsultationSession(supabase, input.appointmentId);

    if (!roomData || roomData.appointment.providerUserId !== profile.id) {
      return {
        status: "error",
        message: "You are not allowed to document this appointment.",
      };
    }

    if (
      !roomData.session ||
      roomData.session.status === "cancelled" ||
      roomData.session.status === "scheduled"
    ) {
      return {
        status: "error",
        message: "Start or complete the consultation before documenting the SOAP note.",
      };
    }

    const result = await createSoapNote(supabase, {
      appointmentId: input.appointmentId,
      providerUserId: profile.id,
      ...parsed.data,
    });

    const shouldNotifyPatient =
      result.note.isSharedWithPatient && !result.previousIsSharedWithPatient;

    await createAuditLogSafely(supabase, {
      action: result.wasCreated ? "soap_note.created" : "soap_note.updated",
      entityType: "soap_note",
      entityId: result.note.id,
      metadata: {
        appointmentId: input.appointmentId,
        patientUserId: result.note.patientUserId,
        providerUserId: result.note.providerUserId,
        sharedWithPatient: result.note.isSharedWithPatient,
      },
    });

    if (shouldNotifyPatient) {
      await Promise.all([
        createNotificationSafely(supabase, {
          appointmentId: input.appointmentId,
          recipientUserId: result.note.patientUserId,
          type: "note",
          title: "Visit summary shared",
          body: `${profile.fullName} shared your SOAP visit summary in the patient records workspace.`,
        }),
        createAuditLogSafely(supabase, {
          action: "soap_note.shared",
          entityType: "soap_note",
          entityId: result.note.id,
          metadata: {
            appointmentId: input.appointmentId,
            patientUserId: result.note.patientUserId,
            providerUserId: result.note.providerUserId,
          },
        }),
      ]);
    }

    revalidatePath(`/provider/notes/${input.appointmentId}`);
    revalidatePath(`/consultations/${input.appointmentId}`);
    revalidatePath("/provider/appointments");
    revalidatePath("/provider/dashboard");
    revalidatePath("/provider/notifications");
    revalidatePath("/patient/records");
    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/notifications");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/audit");

    return {
      status: "success",
      message: shouldNotifyPatient
        ? "SOAP note saved and shared with the patient."
        : "SOAP note saved successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save the SOAP note.",
    };
  }
}
