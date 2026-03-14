import { z } from "zod";

export const providerAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment id."),
  nextStatus: z.enum(["confirmed", "cancelled", "completed"]),
});

export type ProviderAppointmentStatusInput = z.output<
  typeof providerAppointmentStatusSchema
>;
