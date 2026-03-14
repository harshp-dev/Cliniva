export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type ProviderManagedAppointmentStatus = Extract<
  AppointmentStatus,
  "confirmed" | "cancelled" | "completed"
>;
