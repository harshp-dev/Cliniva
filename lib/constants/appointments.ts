import type {
  AppointmentStatus,
  ProviderManagedAppointmentStatus,
} from "@/types/domain/appointments";

export const PROVIDER_APPOINTMENT_STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  ProviderManagedAppointmentStatus[]
> = {
  requested: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function canProviderUpdateAppointmentStatus(
  currentStatus: AppointmentStatus,
  nextStatus: ProviderManagedAppointmentStatus
) {
  return (
    currentStatus === nextStatus ||
    PROVIDER_APPOINTMENT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)
  );
}

export function getAppointmentStatusLabel(status: AppointmentStatus) {
  if (status === "requested") return "Requested";
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  if (status === "completed") return "Completed";
  return "No show";
}

export function getAppointmentStatusTone(status: AppointmentStatus) {
  if (status === "confirmed") return "success" as const;
  if (status === "completed") return "accent" as const;
  if (status === "cancelled" || status === "no_show") return "critical" as const;
  return "warning" as const;
}
