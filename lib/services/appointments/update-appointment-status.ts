import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canProviderUpdateAppointmentStatus,
  getAppointmentStatusLabel,
} from "@/lib/constants/appointments";
import { updateConsultationSession } from "@/lib/services/consultations/update-consultation-session";
import type {
  AppointmentStatus,
  ProviderManagedAppointmentStatus,
} from "@/types/domain/appointments";
import type { ConsultationStatus } from "@/types/domain/consultations";

export type UpdateAppointmentStatusInput = {
  appointmentId: string;
  providerUserId: string;
  nextStatus: ProviderManagedAppointmentStatus;
};

export type AdminCancelAppointmentInput = {
  appointmentId: string;
};

type AppointmentRow = {
  id: string;
  patient_user_id: string;
  provider_user_id: string;
  status: AppointmentStatus;
  start_at: string;
  end_at: string;
  reason: string | null;
};

type ConsultationSessionRow = {
  appointment_id: string;
  status: ConsultationStatus;
  started_at: string | null;
  ended_at: string | null;
};

export type AppointmentStatusUpdateResult = {
  id: string;
  patientUserId: string;
  providerUserId: string;
  previousStatus: AppointmentStatus;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  reason: string | null;
  wasChanged: boolean;
};

async function syncConsultationSessionForAppointmentStatus(
  supabase: SupabaseClient,
  appointmentId: string,
  nextStatus: AppointmentStatus
) {
  if (nextStatus !== "cancelled" && nextStatus !== "completed") {
    return;
  }

  const { data: session, error: sessionError } = await supabase
    .from("consultation_sessions")
    .select("appointment_id, status, started_at, ended_at")
    .eq("appointment_id", appointmentId)
    .maybeSingle<ConsultationSessionRow>();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return;
  }

  const nowIso = new Date().toISOString();

  if (
    nextStatus === "cancelled" &&
    session.status !== "cancelled" &&
    session.status !== "completed"
  ) {
    await updateConsultationSession(supabase, {
      appointmentId,
      status: "cancelled",
      startedAt: session.started_at,
      endedAt: session.ended_at ?? nowIso,
    });
  }

  if (
    nextStatus === "completed" &&
    session.status !== "completed" &&
    session.status !== "cancelled"
  ) {
    await updateConsultationSession(supabase, {
      appointmentId,
      status: "completed",
      startedAt: session.started_at ?? nowIso,
      endedAt: session.ended_at ?? nowIso,
    });
  }
}

async function loadAppointment(supabase: SupabaseClient, appointmentId: string) {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, patient_user_id, provider_user_id, status, start_at, end_at, reason")
    .eq("id", appointmentId)
    .maybeSingle<AppointmentRow>();

  if (appointmentError) {
    throw appointmentError;
  }

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  return appointment;
}

async function persistAppointmentStatus(
  supabase: SupabaseClient,
  appointment: AppointmentRow,
  nextStatus: AppointmentStatus
): Promise<AppointmentStatusUpdateResult> {
  const wasChanged = appointment.status !== nextStatus;

  if (wasChanged) {
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: nextStatus })
      .eq("id", appointment.id);

    if (updateError) {
      throw updateError;
    }
  }

  await syncConsultationSessionForAppointmentStatus(supabase, appointment.id, nextStatus);

  return {
    id: appointment.id,
    patientUserId: appointment.patient_user_id,
    providerUserId: appointment.provider_user_id,
    previousStatus: appointment.status,
    status: nextStatus,
    startAt: appointment.start_at,
    endAt: appointment.end_at,
    reason: appointment.reason,
    wasChanged,
  };
}

export async function updateAppointmentStatus(
  supabase: SupabaseClient,
  input: UpdateAppointmentStatusInput
): Promise<AppointmentStatusUpdateResult> {
  const appointment = await loadAppointment(supabase, input.appointmentId);

  if (appointment.provider_user_id !== input.providerUserId) {
    throw new Error("You are not allowed to update this appointment.");
  }

  if (!canProviderUpdateAppointmentStatus(appointment.status, input.nextStatus)) {
    throw new Error(
      `Providers cannot change appointments from ${getAppointmentStatusLabel(
        appointment.status
      )} to ${getAppointmentStatusLabel(input.nextStatus)}.`
    );
  }

  return persistAppointmentStatus(supabase, appointment, input.nextStatus);
}

export async function cancelAppointmentAsAdmin(
  supabase: SupabaseClient,
  input: AdminCancelAppointmentInput
): Promise<AppointmentStatusUpdateResult> {
  const appointment = await loadAppointment(supabase, input.appointmentId);

  if (appointment.status === "completed" || appointment.status === "cancelled") {
    throw new Error("Only requested or confirmed appointments can be cancelled by admin.");
  }

  return persistAppointmentStatus(supabase, appointment, "cancelled");
}
