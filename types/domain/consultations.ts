import type { AppointmentStatus } from "@/types/domain/appointments";

export type ConsultationStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ConsultationSessionSummary = {
  id: string;
  appointmentId: string;
  status: ConsultationStatus;
  roomId: string | null;
  roomUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
};

export type ConsultationAppointmentSummary = {
  id: string;
  patientUserId: string;
  patientName: string;
  providerUserId: string;
  providerName: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  reason: string | null;
};

export type ConsultationRoomData = {
  appointment: ConsultationAppointmentSummary;
  session: ConsultationSessionSummary | null;
};
